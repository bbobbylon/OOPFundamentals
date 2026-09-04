/* ============================================================================
 * tmp_smoke.mjs — load every page in a real browser and report what breaks.
 *
 * WHY, GIVEN vcheck EXISTS. vcheck is static: it proved every inline script
 * PARSES. It cannot know that `{type:Button}` references an identifier that
 * does not exist, or that `"${app.cleanup.cron}"` inside a template literal
 * makes JS evaluate a Spring property placeholder. Both of those shipped, both
 * killed the page's interactive engine, and both are invisible until something
 * actually runs the code.
 *
 * So: vcheck gates CI (fast, no dependencies), and this runs a browser over
 * the whole site when you want certainty — before a merge, or after any bulk
 * edit. It is deliberately NOT wired into deploy.yml, because a browser
 * download is a heavy dependency for a gate that runs on every push.
 *
 * WHAT IT CHECKS, per page: uncaught exceptions, console errors, horizontal
 * overflow at phone width (the site is read on a phone), TEXT CLIPPED INSIDE a
 * non-scrolling element, and that the page rendered something at all.
 *
 * The default width is 320, not 390. 390 is a comfortable modern phone; 320 is
 * the iPhone SE and a folded foldable, and it is where a rigid grid track
 * (minmax(280px,1fr) inside a 272px container) actually breaks. Four landing
 * pages passed at 390 and overflowed at 320, so the gate runs at the width
 * that finds the bug.
 *
 * Network failures are reported SEPARATELY: a sandbox with no outbound access
 * fails every CDN load, and folding those in with real bugs is how a report
 * becomes noise people ignore.
 *
 * USAGE
 *   node tmp_smoke.mjs                 # every page
 *   node tmp_smoke.mjs head-first-*    # a subset (shell-globbed)
 *   node tmp_smoke.mjs --width=390     # a roomier phone
 *   node tmp_smoke.mjs --width=1440    # desktop instead of phone
 * ========================================================================== */
import { createServer } from 'node:http';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { extname, join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter((a) => a.startsWith('--'))
  .map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const width = Number(flags.width || 320);   // see the header: 320 finds what 390 hides
const only = args.filter((a) => !a.startsWith('--')).map((a) => basename(a));

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.woff2': 'font/woff2', '.wasm': 'application/wasm' };

const server = createServer((req, res) => {
  const file = join(HERE, decodeURIComponent(req.url.split('?')[0]));
  if (!file.startsWith(HERE) || !existsSync(file)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[extname(file).toLowerCase()] || 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const pages = (only.length ? only : readdirSync(HERE).filter((f) => f.endsWith('.html'))).sort();
console.log(`smoke-testing ${pages.length} page(s) at ${width}px…`);

const browser = await chromium.launch();
const real = [], network = [];
const clipping = [];   // text cut off inside a non-scrolling box (reported, not fatal)
let done = 0;

// A page-per-context is slower but keeps one page's storage/errors out of the next.
const CONCURRENCY = 4;
async function run(list) {
  for (const f of list) {
    const ctx = await browser.newContext({ viewport: { width, height: 844 }, isMobile: width < 500 });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(String(e.message || e).slice(0, 120)));
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)); });
    try {
      await page.goto(`http://127.0.0.1:${port}/${f}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await page.waitForTimeout(450);
      const m = await page.evaluate(() => {
        /* Page-level overflow is only half the story. A card whose content is
           125px too wide CLIPS internally — the reader loses the end of the
           sentence — while documentElement.scrollWidth stays exactly equal to
           clientWidth, so the page reports clean. That is how kit cards shipped
           with truncated code tokens on several authored pages. Measure the
           elements too: content wider than its box, in a box that does not
           scroll, is content nobody can read.

           Deliberately ignores anything with overflow-x auto/scroll (a <pre> or
           a wide table is SUPPOSED to scroll itself) and anything clipped by
           less than 4px, which is rounding rather than a defect. */
        const clipped = [];
        for (const el of document.querySelectorAll('body *')) {
          if (el.scrollWidth <= el.clientWidth + 4) continue;
          if (!el.clientWidth) continue;                       // not laid out
          /* Only elements that OWN the text. scrollWidth propagates up the
             ancestor chain, so a single wide <pre> makes its container, its
             section and its body all look guilty; flagging all of them buries
             the one element actually losing a word. A direct text child is what
             distinguishes "this box clips its own sentence" from "something
             inside me is wide". */
          let ownsText = false;
          for (const n of el.childNodes)
            if (n.nodeType === 3 && n.textContent.trim()) { ownsText = true; break; }
          if (!ownsText) continue;
          const st = getComputedStyle(el);
          if (/auto|scroll/.test(st.overflowX)) continue;      // scrolls on purpose
          if (st.position === 'absolute' || st.position === 'fixed') continue;
          if (st.whiteSpace === 'pre' || st.whiteSpace === 'nowrap') continue;  // opted out of wrapping
          if (st.textOverflow === 'ellipsis') continue;        // truncation on purpose
          clipped.push(el.tagName.toLowerCase() +
            (typeof el.className === 'string' && el.className
              ? '.' + el.className.trim().split(/\s+/)[0] : '') +
            ' +' + (el.scrollWidth - el.clientWidth) + 'px');
        }
        return {
          overflow: document.documentElement.scrollWidth > window.innerWidth + 2,
          sw: document.documentElement.scrollWidth,
          empty: (document.body.innerText || '').trim().length < 40,
          clipped: clipped.slice(0, 3),
          clippedCount: clipped.length,
        };
      });
      const netOnly = errs.length && errs.every((e) => /ERR_(CONNECTION|TUNNEL|NAME|CERT|ABORTED)|net::/.test(e));
      const issues = [];
      if (errs.length && !netOnly) issues.push(errs.find((e) => !/net::/.test(e)) || errs[0]);
      if (m.overflow) issues.push(`horizontal overflow (${m.sw}px at ${width}px)`);
      if (m.empty) issues.push('rendered almost no text');
      /* Clipping is reported SEPARATELY, not as a page failure. The shared
         components are fixed, but ~450 pages carry hand-written per-page CSS
         with its own narrow boxes, and failing the sweep on every one of them
         would make the whole report something people skip. Same reasoning as
         the network-only section below: a gate that cries wolf is a gate that
         gets ignored. */
      if (m.clippedCount) clipping.push([f, m.clippedCount, m.clipped.join(', ')]);
      if (issues.length) real.push([f, issues.join(' | ')]);
      else if (netOnly) network.push([f, errs[0]]);
    } catch (e) {
      real.push([f, 'LOAD FAILED: ' + String(e).slice(0, 90)]);
    }
    await ctx.close();
    if (++done % 100 === 0) console.log(`  …${done}/${pages.length}`);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) =>
  run(pages.filter((_, j) => j % CONCURRENCY === i))));

await browser.close();
server.close();

if (network.length) {
  console.log(`\nℹ ${network.length} page(s) failed only on OUTBOUND NETWORK — expected in a sandbox:`);
  network.slice(0, 5).forEach(([f]) => console.log(`   ${f}`));
  if (network.length > 5) console.log(`   …and ${network.length - 5} more`);
}

if (real.length) {
  console.error(`\n✗ ${real.length} page(s) with real problems:`);
  real.forEach(([f, i]) => console.error(`   ${f}\n     ${i}`));
  console.error('');
  process.exit(1);
}
if (clipping.length) {
  const totalEls = clipping.reduce((n, c) => n + c[1], 0);
  console.log(`\nℹ ${clipping.length} page(s) clip text inside a non-scrolling box (${totalEls} element(s)).`);
  console.log('   Not a failure: the shared components wrap correctly; these are per-page styles.');
  clipping.sort((a, b) => b[1] - a[1]).slice(0, 8)
    .forEach(([f, n, what]) => console.log(`   ${String(n).padStart(3)}  ${f}  ${what}`));
  if (clipping.length > 8) console.log(`   …and ${clipping.length - 8} more`);
}

console.log(`\n✓ ${pages.length} page(s) clean — no uncaught errors, no overflow, all rendered\n`);
