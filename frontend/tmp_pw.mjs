/* ============================================================================
 * tmp_pw.mjs — the one place that knows how to find Playwright and a browser.
 *
 * WHY THIS EXISTS: tmp_shot / tmp_smoke / tmp_contrast / tmp_creamrace each
 * carried their own copy of "load playwright, launch chromium". Three of those
 * copies hardcoded the cloud sandbox's paths — `/opt/node22/lib/node_modules`
 * and `/opt/pw-browsers/chromium` — so they ran in the cloud and died on
 * Bobby's Windows box with a raw MODULE_NOT_FOUND. Four copies of one block is
 * four chances to drift; this is the single copy they all import now.
 *
 * The two environments this has to satisfy:
 *   cloud sandbox — playwright global at /opt/node22, chromium at /opt/pw-browsers
 *   Bobby's Windows box — no playwright installed, but Chrome and Edge on disk
 *
 * USAGE
 *   import { loadChromium, browserExecutablePath } from './tmp_pw.mjs';
 *   const chromium = loadChromium();
 *   const browser  = await chromium.launch({ executablePath: browserExecutablePath() });
 * ========================================================================== */
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/* Where the playwright MODULE might live. First one that imports wins.
 * playwright-core is last because it ships no browsers of its own — it only
 * works paired with a system Chrome/Edge from browserExecutablePath(). */
const PW_CANDIDATES = [
  'playwright',                                 // a normal local/global install
  '/opt/node22/lib/node_modules/playwright',    // the cloud sandbox's global
  process.env.PW_MODULE,                        // an explicit absolute path
  'playwright-core',
].filter(Boolean);

/* Where a real BROWSER BINARY might live. First one that exists wins;
 * undefined means "let playwright use the chromium it downloaded", which is
 * correct when a full `playwright` install is what resolved above. */
const EXE_CANDIDATES = [
  '/opt/pw-browsers/chromium/chrome-linux/chrome',   // cloud sandbox
  '/opt/pw-browsers/chromium',                       // older sandbox layout
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean);

/**
 * Resolve playwright's `chromium` or exit(1) with an instruction Bobby can act
 * on. Exiting here rather than throwing keeps the call sites to one line — a
 * stack trace for "you haven't installed playwright" helps nobody.
 */
export function loadChromium() {
  for (const cand of PW_CANDIDATES) {
    try {
      const { chromium } = require(cand);
      if (chromium) return chromium;
    } catch { /* try the next candidate */ }
  }
  console.error(
    'playwright not found. Either:\n' +
    '  npm i -g playwright              (brings its own chromium), or\n' +
    '  npm i playwright-core somewhere and set PW_MODULE to that package dir\n' +
    '                                   (pairs with your installed Chrome/Edge)'
  );
  process.exit(1);
}

/**
 * First browser binary that actually exists on this machine, or undefined to
 * fall back to playwright's own download. Never returns a path that isn't
 * there — passing a bogus executablePath is what made the cloud versions of
 * these scripts fail on Windows with an unhelpful launch error.
 */
export function browserExecutablePath() {
  return EXE_CANDIDATES.find((p) => existsSync(p));
}
