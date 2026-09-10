/* ============================================================================
 * tmp_pw.mjs — the one place that knows how to find Playwright and a browser.
 *
 * NOT A GATE. This is a helper module with no CLI: it answers no question
 * about the site and never runs on its own. tmp_smoke, tmp_shot, tmp_contrast
 * and tmp_creamrace import it to get a launchable `chromium` and a real
 * browser binary path, so the "how do I find a browser" logic lives once.
 *
 * HOW TO USE (from another script — there is nothing to run here)
 *   import { loadChromium, browserExecutablePath } from './tmp_pw.mjs';
 *   const chromium = loadChromium();
 *   const browser  = await chromium.launch({ executablePath: browserExecutablePath() });
 *   Environment knobs: PW_MODULE (absolute path to a playwright package dir),
 *   CHROME_PATH (a browser binary). On a machine with no `playwright` package
 *   at all, `playwright-core` + an installed Chrome/Edge is enough — that is
 *   how the browser gates run on Bobby's Windows box today.
 *
 * WHAT A FAILURE MEANS
 *   loadChromium() exits the PROCESS with an install instruction when no
 *   playwright module resolves — deliberately not a throw, so every caller
 *   stays one line and nobody gets a stack trace for "not installed".
 *   browserExecutablePath() returning undefined is not a failure: it means
 *   "let playwright use its own downloaded chromium".
 *
 * WHAT IT CANNOT SEE
 *   Whether the browser it found is RECENT enough for playwright-core's
 *   protocol. A stale system Chrome fails at launch inside the caller, not
 *   here. If every browser gate suddenly dies at launch, look here first and
 *   set PW_MODULE / CHROME_PATH explicitly.
 *
 * GIT NOTE: gitignored by `frontend/tmp*`; a new gate needs its own
 * `!frontend/tmp_<name>.mjs` allowlist line in .gitignore or git never sees it.
 * This file's own `!` line MUST stay — without it the browser gates fail at import.
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
