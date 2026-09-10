/* tmp_creamrace.mjs — a failing test for the cream-theme legibility race.
 *
 *   node tmp_creamrace.mjs [page.html] [selector] [runs]
 *
 * Loads a page FRESH n times in the cream theme and reports, per run, the
 * contrast of `selector`'s text against itscomposited ground. The bug this
 * exists for is nondeterministic, so a single load proves nothing — that is the
 * whole point of the repeat.
 *
 * Known failing case (see docs/ROADMAP.md, "Cream theme legibility race"):
 *   node tmp_creamrace.mjs angular-dynamic-components-visualizer.html '.body div.desc'
 * Typically 4-5 of 6 runs come back at 1.05-1.68:1 against a 0.734-luminance
 * ground — i.e. invisible text — and the rest at 10-13:1. Nothing about the
 * page changes between runs.
 *
 * WHAT A FAILURE MEANS
 *   Runs that disagree with each other. A spread (some runs legible, some not)
 *   is the race reproducing; a uniformly low number is an ordinary contrast bug
 *   and belongs to tmp_contrast.mjs instead.
 *
 * WHAT IT CANNOT SEE
 *   Absence of the race. Passing six runs does NOT mean the race is fixed — it
 *   means it did not fire six times, which is exactly what a timing bug does on
 *   the machine that is about to ship it. Only a mechanism you can point at
 *   (an ordering guarantee in devhub-hf-theme.js) proves it gone.
 *   It measures ONE selector on ONE page per invocation, so it cannot find a
 *   racing element you did not already suspect, and it reads the COMPOSITED
 *   ground — an element made legible by an ancestor that is itself wrong still
 *   scores fine. It needs Playwright + a browser (see tmp_pw.mjs); with neither
 *   installed it cannot run at all, and it is not wired into CI for that reason.
 */
import { createServer } from 'node:http'; import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path'; import { fileURLToPath } from 'node:url';
import { loadChromium, browserExecutablePath } from './tmp_pw.mjs';
const chromium = loadChromium();

const ROOT = dirname(fileURLToPath(import.meta.url));
const MT = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.woff2':'font/woff2' };
const srv = createServer(async (rq, rs) => {
  try { const f = join(ROOT, decodeURIComponent(rq.url.split('?')[0]));
        const b = await readFile(f);
        rs.writeHead(200, { 'content-type': MT[extname(f)] || 'application/octet-stream' }); rs.end(b);
  } catch { rs.writeHead(404); rs.end(); }
});
await new Promise(r => srv.listen(0, r));

const page = process.argv[2] || 'angular-dynamic-components-visualizer.html';
const sel  = process.argv[3] || '.body div.desc';
const runs = +(process.argv[4] || 6);
const MIN  = 2.2;   /* same floor as tmp_contrast.mjs: "invisible", not "could be crisper" */

const b = await chromium.launch({ executablePath: browserExecutablePath() });
console.log(`cream race — ${page}  ${sel}  ${runs} fresh load(s) at 390px\n`);
let bad = 0;
for (let run = 1; run <= runs; run++) {
  const p = await b.newPage({ viewport: { width: 390, height: 900 } });
  await p.addInitScript(() => { try { localStorage.setItem('devhub-theme', 'cream'); } catch {} });
  await p.goto(`http://127.0.0.1:${srv.address().port}/` + page, { waitUntil: 'load' });
  await p.waitForTimeout(1400);
  const r = await p.evaluate((sel) => {
    const f = v => { v /= 255; return v <= .03928 ? v/12.92 : Math.pow((v+.055)/1.055, 2.4); };
    const lum = (r,g,bl) => .2126*f(r) + .7152*f(g) + .0722*f(bl);
    const px = s => s.match(/[\d.]+/g).map(Number);
    const e = document.querySelector(sel); if (!e) return null;
    /* Composite every semi-transparent layer up to the first opaque one, the
       way the browser paints it. Treating the nearest non-transparent colour as
       opaque is what made an earlier contrast tool invent ~1860 phantom
       failures. */
    let n = e, stack = [];
    while (n) { const c = px(getComputedStyle(n).backgroundColor);
      if (c.length >= 3 && (c[3] === undefined || c[3] > 0)) stack.push(c);
      n = n.parentElement; }
    let acc = null;
    for (let i = stack.length - 1; i >= 0; i--) { const c = stack[i], a = c[3] === undefined ? 1 : c[3];
      acc = acc === null ? [c[0],c[1],c[2]]
                         : [c[0]*a + acc[0]*(1-a), c[1]*a + acc[1]*(1-a), c[2]*a + acc[2]*(1-a)]; }
    const fg = px(getComputedStyle(e).color);
    const L1 = lum(fg[0],fg[1],fg[2]) + .05, L2 = lum(acc[0],acc[1],acc[2]) + .05;
    return { color: getComputedStyle(e).color, storedGroundL: e.dataset.hfcBg,
             realGroundL: lum(acc[0],acc[1],acc[2]).toFixed(3),
             contrast: +(Math.max(L1,L2)/Math.min(L1,L2)).toFixed(2) };
  }, sel);
  await p.close();
  if (!r) { console.log(`run ${run}: selector not found`); continue; }
  const ok = r.contrast >= MIN; if (!ok) bad++;
  console.log(`  run ${run}: ${ok ? '✓' : '✗'} contrast ${String(r.contrast).padStart(6)}  ` +
              `text ${r.color.padEnd(20)} repairMeasuredGroundL=${r.storedGroundL}  realGroundL=${r.realGroundL}`);
}
console.log(bad ? `\n✗ ${bad}/${runs} run(s) under ${MIN}:1 — the repair measured a dark ground that is not what gets painted`
                : `\n✓ all ${runs} runs above ${MIN}:1`);
await b.close(); srv.close();
process.exit(bad ? 1 : 0);
