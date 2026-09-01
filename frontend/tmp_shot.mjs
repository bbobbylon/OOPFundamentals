/* ============================================================================
 * tmp_shot.mjs — screenshot any DevHub page(s) for design review.
 *
 * Every lesson page is standalone HTML, so this just serves `frontend/` over
 * http (NOT file://, because the shared devhub-*.js engines and any fetch()
 * need a real origin) and shoots each page in Chromium.
 *
 * Two widths by default, because Bobby reviews on a phone but builds on a
 * desktop and the chip-engine layouts are the thing most likely to break
 * between them:
 *     phone   390x844   (iPhone-ish)
 *     desktop 1440x900
 *
 * USAGE
 *   node tmp_shot.mjs <page.html> [more.html ...]      # viewport shots
 *   node tmp_shot.mjs --full <page.html>               # full-page (tall!)
 *   node tmp_shot.mjs --width=phone <page.html>        # one width only
 *   node tmp_shot.mjs --out=/some/dir <page.html>
 *   node tmp_shot.mjs --theme=light <page.html>        # sets data-theme=light
 *   node tmp_shot.mjs --inject=palette.css <page.html>   # preview a token swap
 *
 * Animations: pages pace their scenario walks at ~800ms/step, so we wait for
 * network-idle plus a settle delay before shooting. --settle=N to override.
 *
 * Requires the globally-installed playwright + the preinstalled Chromium at
 * PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers). Do NOT run `playwright install`.
 * ========================================================================== */
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, basename, resolve } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
// playwright is not installed in this repo — resolve it from wherever this
// machine has it: a local/global install, $PW_MODULE (an absolute path to a
// playwright or playwright-core package), or a bare playwright-core.
// playwright-core ships no browsers, so pair it with the system Chrome/Edge
// (see the executable candidates at launch below).
const PW_CANDIDATES = [
  'playwright',
  '/opt/node22/lib/node_modules/playwright',      // the cloud sandbox's global
  process.env.PW_MODULE,                          // e.g. <scratch>/node_modules/playwright-core
  'playwright-core',
].filter(Boolean);
let chromium;
for (const cand of PW_CANDIDATES) {
  try { ({ chromium } = require(cand)); break; } catch { /* next */ }
}
if (!chromium) {
  console.error('playwright not found — npm i playwright-core somewhere and set PW_MODULE to it');
  process.exit(1);
}

// fileURLToPath, not URL.pathname: the latter yields "/B:/…" on Windows.
const { fileURLToPath } = await import('node:url');
const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url))); // frontend/

const WIDTHS = {
  phone: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true },
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false },
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
};

const args = process.argv.slice(2);
const flags = Object.fromEntries(
  args.filter((a) => a.startsWith('--')).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  })
);
const pages = args.filter((a) => !a.startsWith('--')).map((p) => basename(p));

if (!pages.length) {
  console.error('usage: node tmp_shot.mjs [--full] [--width=phone|desktop] [--theme=light] [--out=DIR] [--settle=MS] <page.html> ...');
  process.exit(1);
}

const outDir = resolve(flags.out || join(ROOT, 'tmp_shots'));
const settle = Number(flags.settle ?? 1200);
const widths = flags.width ? [flags.width] : ['phone', 'desktop'];
for (const w of widths) {
  if (!WIDTHS[w]) { console.error(`unknown --width=${w} (phone|desktop)`); process.exit(1); }
}

// ── static server over frontend/ ──────────────────────────────────────────
const server = createServer(async (req, res) => {
  try {
    const url = decodeURIComponent(req.url.split('?')[0]);
    const file = join(ROOT, url === '/' ? 'index.html' : url);
    if (!file.startsWith(ROOT) || !existsSync(file)) { res.writeHead(404); return res.end('nf'); }
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': MIME[extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(body);
  } catch (e) {
    res.writeHead(500); res.end(String(e));
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

await mkdir(outDir, { recursive: true });

// First existing browser wins: the sandbox chromium, $CHROME_PATH, then the
// standard Windows Chrome/Edge locations. undefined = playwright's own download.
const EXE_CANDIDATES = [
  '/opt/pw-browsers/chromium/chrome-linux/chrome',
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean);
const browser = await chromium.launch({
  executablePath: EXE_CANDIDATES.find((p) => existsSync(p)),
});

const written = [];
for (const page of pages) {
  if (!existsSync(join(ROOT, page))) { console.error(`  ! missing: ${page}`); continue; }
  for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: WIDTHS[w].width, height: WIDTHS[w].height },
      deviceScaleFactor: WIDTHS[w].deviceScaleFactor, isMobile: WIDTHS[w].isMobile, hasTouch: WIDTHS[w].isMobile });
    const p = await ctx.newPage();
    const errs = [];
    p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    p.on('pageerror', (e) => errs.push(String(e)));

    if (flags.theme) {
      await p.addInitScript((t) => {
        document.addEventListener('DOMContentLoaded', () =>
          document.documentElement.setAttribute('data-theme', t));
      }, flags.theme);
    }

    await p.goto(`http://127.0.0.1:${port}/${page}`, { waitUntil: 'networkidle', timeout: 30000 });
    if (flags.inject) {
      // Preview a palette/token change sitewide WITHOUT editing any page.
      const css = await readFile(resolve(String(flags.inject)), 'utf-8');
      await p.addStyleTag({ content: css });
    }
    await p.waitForTimeout(settle);

    const name = `${basename(page, '.html')}__${w}${flags.theme ? '-' + flags.theme : ''}${flags.full ? '-full' : ''}.png`;
    const dest = join(outDir, name);
    await p.screenshot({ path: dest, fullPage: !!flags.full });
    written.push(dest);
    console.log(`  ✓ ${name}${errs.length ? `   [${errs.length} console error(s): ${errs[0].slice(0, 90)}]` : ''}`);
    await ctx.close();
  }
}

await browser.close();
server.close();
console.log(`\n${written.length} shot(s) -> ${outDir}`);
