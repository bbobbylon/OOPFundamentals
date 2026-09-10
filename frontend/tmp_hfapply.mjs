/* ============================================================================
 * tmp_hfapply.mjs — opt a page into the Head First kit (devhub-hf.css).
 *
 * The per-page cost of the kit is deliberately tiny, and this makes it
 * mechanical + idempotent so a tranche is one command and re-running is safe:
 *
 *   1. <html …>            -> adds the `data-hf` attribute
 *   2. after devhub.css    -> <link rel="stylesheet" href="devhub-hf.css">
 *   3. before the notebook -> tracks-data.js + devhub-chapters.js (the rail)
 *   4. <head>              -> a viewport meta if the page somehow lacks one
 *
 * It does NOT touch page content. The kicker/statement rhythm, problem cards,
 * speech bubbles and napkins are per-concept AUTHORING — this only lands the
 * colorway, the type, the roundness and the chapter rail, which is the part
 * that genuinely costs nothing per page.
 *
 * USAGE
 *   node tmp_hfapply.mjs <page.html> [...]     apply
 *   node tmp_hfapply.mjs --check <page.html>   report only, change nothing
 *   node tmp_hfapply.mjs --revert <page.html>  undo all four edits
 *
 * WHAT IT CANNOT SEE
 *   Whether the page is any BETTER for having the kit. This is a plumbing
 *   codemod, not a teaching pass: it lands the colorway, the type, the
 *   roundness and the chapter rail, and a page can carry all four and still
 *   teach a concept exactly once, with no memory hook and no active recall.
 *   That gap is what tmp_hfaudit.mjs scores and what a human then has to
 *   author — running this on 300 pages does not move the Head First bar.
 *   It also cannot see a WRONG `<body class="track-…">`: the kit keys its
 *   accents off that class, so a clone carrying its parent's track gets a
 *   perfectly valid page wearing the wrong palette, and neither this nor
 *   vcheck will say a word.
 *   Idempotence is by marker, so hand-editing one of the four insertions
 *   afterwards can leave --revert unable to undo it cleanly.
 * ========================================================================== */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { basename, join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const check = args.includes('--check');
const revert = args.includes('--revert');
const files = args.filter((a) => !a.startsWith('--')).map((f) => basename(f));

if (!files.length) {
  console.error('usage: node tmp_hfapply.mjs [--check|--revert] <page.html> ...');
  process.exit(1);
}

const CSS_TAG = '<link rel="stylesheet" href="devhub-hf.css"/>';
const RAIL_TAGS =
  '<script src="tracks-data.js"></script>\n<script src="devhub-chapters.js"></script>\n' +
  '<script src="devhub-hf-theme.js"></script>\n';
const VIEWPORT = '<meta name="viewport" content="width=device-width,initial-scale=1"/>';

let changed = 0;
for (const name of files) {
  const path = join(HERE, name);
  if (!existsSync(path)) { console.error(`  ! missing: ${name}`); continue; }
  const before = readFileSync(path, 'utf8');
  let s = before;

  if (revert) {
    s = s.replace(/<html([^>]*?)\s+data-hf(=(["'])[^"']*\3)?/i, '<html$1');
    s = s.replace(/\n?\s*<link rel="stylesheet" href="devhub-hf\.css"\/?>/g, '');
    s = s.replace(/\s*<script src="tracks-data\.js"><\/script>\n?/g, '');
    s = s.replace(/\s*<script src="devhub-chapters\.js"><\/script>\n?/g, '');
    s = s.replace(/\s*<script src="devhub-hf-theme\.js"><\/script>\n?/g, '');
  } else {
    // 1 — opt in
    if (!/<html[^>]*\sdata-hf\b/i.test(s)) {
      s = s.replace(/<html\b([^>]*)>/i, '<html$1 data-hf>');
    }
    // 2 — the kit, AFTER devhub.css so its [data-hf] rules land later too
    if (!s.includes('devhub-hf.css')) {
      const m = s.match(/<link[^>]+devhub\.css[^>]*>/i);
      if (!m) { console.error(`  ! ${name}: no devhub.css link — skipped`); continue; }
      const at = s.indexOf(m[0]) + m[0].length;
      s = s.slice(0, at) + '\n  ' + CSS_TAG + s.slice(at);
    }
    // 3 — the chapter rail, before the notebook script (same slot convention)
    if (!s.includes('devhub-chapters.js')) {
      const m = s.match(/<script src="devhub-notebook\.js"><\/script>/);
      if (m) {
        const at = s.indexOf(m[0]);
        s = s.slice(0, at) + RAIL_TAGS + s.slice(at);
      } else {
        s = s.replace(/<\/body>/i, RAIL_TAGS + '</body>');
      }
    }
    // 4 — viewport, so the phone layout is real and not a scaled 980px page
    if (!/name=["']viewport["']/i.test(s)) {
      s = s.replace(/(<head[^>]*>)/i, `$1\n  ${VIEWPORT}`);
    }
  }

  const diff = s !== before;
  if (diff && !check) writeFileSync(path, s);
  if (diff) changed++;
  console.log(
    `  ${check ? (diff ? '~' : '=') : diff ? '✓' : '='} ${name}` +
    (check && diff ? '  (would change)' : '')
  );
}
console.log(`\n${changed}/${files.length} ${check ? 'would change' : revert ? 'reverted' : 'updated'}`);
