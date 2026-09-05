/* ============================================================================
 * tmp_contrast.mjs — text-contrast gate for a theme.
 *
 * WHY THIS EXISTS. devhub.css hardcodes plenty of non-token colors (#cbd5e1,
 * #eef4fb, #86efac ...) and repairs them for the legacy light theme with rules
 * keyed on :root[data-theme="light"]. The Head First kit's cream theme uses
 * data-theme="cream", so NONE of those repairs match — 500+ pages rendered
 * near-white text on a cream card and nobody could see it, because the page
 * itself throws no error and the dark theme is perfect.
 *
 * There is also an inverse failure: devhub.css deliberately keeps code and
 * console panels DARK in both themes, so a light theme that sets --text to a
 * dark ink puts dark ink on a dark panel. Both directions are one measurement.
 *
 * WHAT IT DOES. Loads every page in a real browser at a given theme, walks the
 * elements that own a text node, resolves each one's effective background by
 * climbing until it finds a painted one, and computes the WCAG contrast ratio.
 * Anything under the threshold is reported, grouped by selector and sorted by
 * how many pages it affects — so you fix causes, not instances.
 *
 *   node tmp_contrast.mjs                    # cream, the default target
 *   node tmp_contrast.mjs --theme=dark       # guard against regressions
 *   node tmp_contrast.mjs --min=3            # WCAG-ish floor instead of 2.2
 *   node tmp_contrast.mjs --pages=a.html,b.html
 *   node tmp_contrast.mjs --json=out.json
 *   node tmp_contrast.mjs --inject=fix.css       # try a fix WITHOUT editing the site
 *   node tmp_contrast.mjs --settle=1500          # let animated demos settle first
 *
 * Threshold note: the default 2.2 is deliberately BELOW the WCAG 4.5 floor.
 * This gate is for "the text is invisible", not "the text could be crisper" --
 * a gate that flags every muted caption is one people learn to ignore.
 * ========================================================================== */
import { createServer } from 'node:http';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadChromium, browserExecutablePath } from './tmp_pw.mjs';

const chromium = loadChromium();

// fileURLToPath, not URL.pathname: the latter yields "/B:/…" on Windows.
const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)));
const arg  = (k, d) => { const m = process.argv.find(a => a.startsWith(`--${k}=`)); return m ? m.slice(k.length + 3) : d; };
const THEME = arg('theme', 'cream');
const MIN   = parseFloat(arg('min', '2.2'));
const WIDTH = parseInt(arg('width', '390'), 10);
const ONLY  = arg('pages', '');
const JSONO = arg('json', '');
const INJECT = arg('inject', '');            // try a candidate fix before committing to it
/* Some pages animate a demo that changes a box's ground after load, so a short
   settle can measure a transient state that no reader ever sees. Raise it when
   a result looks like a timing artifact rather than a colour bug. */
const SETTLE = parseInt(arg('settle', '300'), 10);

const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json',
               '.svg':'image/svg+xml', '.woff2':'font/woff2', '.woff':'font/woff', '.png':'image/png',
               '.jpg':'image/jpeg', '.ico':'image/x-icon' };

const srv = createServer(async (rq, rs) => {
  try {
    const f = join(ROOT, decodeURIComponent(rq.url.split('?')[0]));
    const buf = await readFile(f);
    rs.writeHead(200, { 'content-type': MIME[extname(f)] || 'application/octet-stream' });
    rs.end(buf);
  } catch { rs.writeHead(404); rs.end(); }
});
await new Promise(r => srv.listen(0, r));
const base = `http://127.0.0.1:${srv.address().port}/`;

const files = ONLY ? ONLY.split(',').map(s => s.trim()).filter(Boolean)
                   : (await readdir(ROOT)).filter(f => f.endsWith('.html')).sort();

/* Runs INSIDE the page. Kept in one function so there is a single definition of
   "what counts as unreadable" shared by every caller of this gate. */
function probe(min) {
  const parse = c => {
    const m = c.match(/[\d.]+/g); if (!m) return null;
    return { r: +m[0], g: +m[1], b: +m[2], a: m.length > 3 ? +m[3] : 1 };
  };
  const lumOf = ({ r, g, b }) => {
    const f = v => { v = v / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  // source-over: put `top` (possibly translucent) onto opaque `base`
  const over = (top, base) => ({
    r: top.r * top.a + base.r * (1 - top.a),
    g: top.g * top.a + base.g * (1 - top.a),
    b: top.b * top.a + base.b * (1 - top.a),
    a: 1,
  });
  const ratio = (a, b) => { const hi = Math.max(a, b), lo = Math.min(a, b); return (hi + 0.05) / (lo + 0.05); };
  const out = [];
  for (const el of document.querySelectorAll('body *')) {
    // Only elements that directly own visible text -- otherwise every wrapper
    // reports its children's problem and the grouping is useless.
    if (!el.firstChild || el.firstChild.nodeType !== 3 || !el.textContent.trim()) continue;
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none' || +s.opacity < 0.1) continue;
    if (!el.getClientRects().length) continue;
    /* Purely decorative text is exempt: WCAG's contrast rule is about text that
       carries information. The kit's ghosted chapter numeral is aria-hidden on
       purpose — it is ornament, and "fixing" it would destroy the effect. */
    if (el.closest('[aria-hidden="true"]')) continue;
    /* Gradient-clipped headings paint their glyphs FROM the background
       (-webkit-background-clip:text with a transparent colour). Measuring
       `color` there reads transparent-on-anything and reports a false 1.00:1 —
       the text is often the most legible thing on the page. */
    if (/text/.test(s.webkitBackgroundClip || s.backgroundClip || '')) continue;
    const fgc = parse(s.color); if (!fgc) continue;
    /* Backgrounds COMPOSITE. An 11%-alpha orange wash over a dark panel is not
       orange — it is very slightly warm dark. Stopping at the first non-zero
       alpha and treating it as opaque was this gate's own worst bug: it read
       .panel code as 1.00:1 (orange on "solid orange") when the real pair is
       orange on near-black at ~7:1. So collect the whole stack, find the first
       genuinely opaque layer, and paint the translucent ones back down onto it. */
    const stack = [];
    let e = el, base = null;
    while (e) {
      const c = parse(getComputedStyle(e).backgroundColor);
      if (c && c.a > 0) { if (c.a >= 0.999) { base = c; break; } stack.push(c); }
      e = e.parentElement;
    }
    if (!base) base = { r: 255, g: 255, b: 255, a: 1 };   // nothing opaque: the canvas
    let bgc = base;
    for (let i = stack.length - 1; i >= 0; i--) bgc = over(stack[i], bgc);
    // Text alpha composites too (a 60%-opacity caption really is dimmer).
    const fg = lumOf(fgc.a < 0.999 ? over(fgc, bgc) : fgc);
    const bg = lumOf(bgc);
    const cr = ratio(fg, bg);
    if (cr >= min) continue;
    const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(Boolean) : [];
    let anc = el.parentElement, ancKey = '';
    while (anc && anc !== document.body) {
      const ac = typeof anc.className === 'string' ? anc.className.trim().split(/\s+/)[0] : '';
      if (ac) { ancKey = ac; break; }
      anc = anc.parentElement;
    }
    out.push({
      key: (ancKey ? '.' + ancKey + ' ' : '') + el.tagName.toLowerCase() + (cls.length ? '.' + cls.join('.') : ''),
      color: s.color, ratio: +cr.toFixed(2), text: el.textContent.trim().slice(0, 40),
    });
  }
  return out;
}

const browser = await chromium.launch({ executablePath: browserExecutablePath() });
const ctx = await browser.newContext({ viewport: { width: WIDTH, height: 900 } });
await ctx.addInitScript(`try{localStorage.setItem('devhub-theme',${JSON.stringify(THEME)})}catch(e){}`);
const injectCss = INJECT ? await readFile(join(ROOT, INJECT), 'utf8') : '';
if (INJECT) console.log(`(injecting ${INJECT} — ${injectCss.length} bytes — site files untouched)`);

const agg = new Map();
let done = 0, navFailed = 0;
console.log(`contrast gate — theme=${THEME}, min=${MIN}:1, ${files.length} page(s) at ${WIDTH}px`);
for (const f of files) {
  const p = await ctx.newPage();
  p.on('pageerror', () => {});                       // tmp_smoke.mjs owns error reporting
  try {
    await p.goto(base + f, { waitUntil: 'load', timeout: 20000 });
    // Injected LAST so it wins ties on source order, matching how devhub-hf.css loads.
    if (injectCss) await p.addStyleTag({ content: injectCss });
    await p.waitForTimeout(SETTLE);
    for (const r of await p.evaluate(probe, MIN)) {
      const e = agg.get(r.key) || { pages: new Set(), hits: 0, worst: r.ratio, color: r.color, sample: r.text };
      e.hits++; e.pages.add(f);
      if (r.ratio < e.worst) { e.worst = r.ratio; e.color = r.color; e.sample = r.text; }
      agg.set(r.key, e);
    }
  } catch { navFailed++; }
  await p.close();
  if (++done % 150 === 0) console.log(`  …${done}/${files.length}`);
}
await browser.close(); srv.close();

const rows = [...agg.entries()]
  .map(([key, v]) => ({ key, pages: v.pages.size, hits: v.hits, worst: v.worst, color: v.color, sample: v.sample,
                        examples: [...v.pages].slice(0, 3) }))
  .sort((a, b) => b.pages - a.pages);

if (JSONO) { await writeFile(join(ROOT, JSONO), JSON.stringify(rows, null, 2)); console.log(`\nwrote ${JSONO}`); }

const pagesHit = new Set();
for (const [, v] of agg) for (const p of v.pages) pagesHit.add(p);

if (!rows.length) {
  console.log(`\n✓ no text under ${MIN}:1 in the ${THEME} theme — ${files.length} page(s) clean`);
} else {
  console.log(`\n✗ ${rows.length} distinct selector(s) under ${MIN}:1, across ${pagesHit.size} page(s)\n`);
  console.log('  pages  worst  color                  selector');
  for (const r of rows.slice(0, 40))
    console.log(`  ${String(r.pages).padStart(5)}  ${String(r.worst).padStart(5)}  ${r.color.padEnd(22)} ${r.key}`);
  if (rows.length > 40) console.log(`  …and ${rows.length - 40} more (use --json= for the full list)`);
}
if (navFailed) console.log(`\n(${navFailed} page(s) failed to load — see tmp_smoke.mjs)`);
process.exit(rows.length ? 1 : 0);
