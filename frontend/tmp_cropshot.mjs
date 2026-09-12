/* ============================================================================
 * tmp_cropshot.mjs — screenshot ONE element, not the whole page.
 *
 * THE QUESTION IT ANSWERS
 *   "Does this one component actually look right?" tmp_shot.mjs shoots whole
 *   pages, and `--full` on a long lesson page produces a 15 MB image roughly
 *   30,000px tall — unreadable to a human reviewer and useless to a model,
 *   which downscales it to mush. This crops to a selector, so a single
 *   .hf-check or .hf-cast can be reviewed at 2x on a phone-width viewport.
 *
 *   NOT A GATE. It answers nothing about the site and never exits non-zero;
 *   it exists because CLAUDE.md asks for a screenshot alongside design work.
 *
 * HOW TO RUN
 *   node tmp_cropshot.mjs <page.html> <css-selector> [outName] [--w=390]
 *   e.g. node tmp_cropshot.mjs git-rebase-visualizer.html ".hf-check" rebase-check
 *   Writes tmp_shots/<outName>.png. Needs the same playwright-core + system
 *   Chrome pairing as the other browser tools (see tmp_pw.mjs).
 *
 * WHAT A FAILURE MEANS
 *   A selector that matches nothing throws a locator timeout — that is the
 *   tool working: the element you meant to review is not on the page.
 *
 * WHAT IT CANNOT SEE
 *   - Anything outside the cropped element. A component can look perfect while
 *     overlapping its neighbour, and this will never show you that; the page
 *     -level checks (tmp_smoke.mjs for overflow, tmp_shot.mjs for layout) are
 *     what catch it.
 *   - Theme drift. It shoots whatever the page's default theme resolves to,
 *     with no --theme switch — use tmp_shot.mjs or tmp_contrast.mjs for that.
 *   - Anything that needs interaction. It shoots the settled initial state, so
 *     a revealed .why or a mid-animation frame is out of reach.
 *
 * GIT NOTE: gitignored by `frontend/tmp*`; needs its own
 * `!frontend/tmp_cropshot.mjs` allowlist line in .gitignore or git never sees it.
 * ========================================================================== */
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { extname, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadChromium, browserExecutablePath } from './tmp_pw.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const [page, sel, outName = 'crop'] = process.argv.slice(2);
const W = parseInt((process.argv.find(a => a.startsWith('--w=')) || '--w=390').slice(4), 10);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
                '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };

const server = createServer((req, res) => {
  const p = join(HERE, decodeURIComponent(req.url.split('?')[0]).replace(/^\//, '') || 'index.html');
  if (!existsSync(p) || !p.startsWith(HERE)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[extname(p)] || 'application/octet-stream' });
  res.end(readFileSync(p));
});
await new Promise(r => server.listen(0, r));
const port = server.address().port;

const chromium = loadChromium();
const browser = await chromium.launch({ executablePath: browserExecutablePath() });
const ctx = await browser.newContext({ viewport: { width: W, height: 900 }, deviceScaleFactor: 2 });
const pg = await ctx.newPage();
await pg.goto(`http://127.0.0.1:${port}/${page}`, { waitUntil: 'networkidle' });
await pg.waitForTimeout(900);

mkdirSync(join(HERE, 'tmp_shots'), { recursive: true });
const el = await pg.locator(sel).first();
await el.scrollIntoViewIfNeeded();
await pg.waitForTimeout(300);
const out = join(HERE, 'tmp_shots', `${outName}.png`);
await el.screenshot({ path: out });
console.log('->', out);

await browser.close();
server.close();
