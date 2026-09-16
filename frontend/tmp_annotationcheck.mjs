/* ============================================================================
 * tmp_annotationcheck.mjs — find code blocks that don't teach their own lines.
 *
 * THE QUESTION IT ANSWERS
 *   ROADMAP item 2 (Line-by-line code annotation audit) needs a repeatable
 *   measure, not a one-time eyeball pass: which `<pre>` blocks are 6+ lines,
 *   sit near NO `DevHubCodeWalk.mount(` call or `.hf-arrow` note, and are
 *   under 25% comment density? That combination is "bare" — CLAUDE.md rule 7
 *   ("every code snippet explained line-by-line") is not met for it, no
 *   matter how good the prose above the block is. `tmp_hfaudit.mjs`'s
 *   `explain` dimension divides by `<pre>` COUNT, which punishes a page of
 *   one-line snippets as if they were unexplained programs — this gate
 *   exists because that number is not the right one to act on (see the
 *   2026-09-04 ROADMAP note this gate was written to make reproducible).
 *
 * HOW TO RUN
 *   node frontend/tmp_annotationcheck.mjs                  # ranked worklist, worst bare-count first
 *   node frontend/tmp_annotationcheck.mjs --page=foo.html   # every block's line count/density/verdict for one page
 *   node frontend/tmp_annotationcheck.mjs --top=40          # how many ranked rows to print (default: all)
 *   node frontend/tmp_annotationcheck.mjs --json=out.json   # every page's bare/substantial counts, machine-readable
 *   No prerequisites: pure Node, static markup scan (see WHAT IT CANNOT SEE
 *   for why "static" matters here). `--json` is written relative to frontend/.
 *
 * WHAT A "BARE" COUNT MEANS
 *   Go open that page and check those blocks by hand. A high bare count is a
 *   worklist entry, not an insult — annotate each flagged block the way
 *   `angular-standalone-migration-visualizer.html` (commit b823165, and the
 *   rest of the page as of the 2026-09-16 sweep) does: trailing comments on
 *   the lines that carry meaning (using the page's OWN comment span class —
 *   `.cm`, `.cmt`, `.xc`, whatever it already uses) plus an `.hf-arrow` note
 *   tying the block to the idea underneath it. A page with 0 bare blocks
 *   still isn't a verdict of "well taught" — see WHAT IT CANNOT SEE below.
 *
 * WHAT IT CANNOT SEE
 *   - MEANING. It counts comment-bearing lines and nearby teaching devices;
 *     it cannot tell a genuinely explanatory comment from a restated one, or
 *     read whether an `.hf-arrow` actually explains the block next to it.
 *   - It is a STATIC scan, not the rendered DOM the ROADMAP note calls for.
 *     A CodeWalk's own rendered `.cw-code` never exists in static markup —
 *     this gate looks for the `DevHubCodeWalk.mount(` call instead, which is
 *     a reasonable proxy (the mount call and its target sit within one
 *     `<script>` block, so proximity in source ≈ proximity on screen) but
 *     not the same thing as opening a browser. `tmp_smoke.mjs` proves pages
 *     RUN; nothing here proves a CodeWalk actually covers the block it's
 *     near — that is still a by-hand check.
 *   - Comment-class blindness for a class this file has never seen. It
 *     recognizes the class names actually in use as of this sweep (`cm`,
 *     `cmt`, `xc`) plus raw `//`, `#`, `<!--`/`&lt;!--` and `/* ` markers as a
 *     fallback — a page inventing a new comment span class with no visible
 *     marker text will under-count its own comments until that class name is
 *     added below.
 *   - The one false positive class found and fixed during the 2026-09-16
 *     sweep: a `<style>` block's own CSS COMMENT mentioning the literal text
 *     "<pre>" (documenting a `pre` CSS rule) matched the `<pre` opener and
 *     ran the regex to the next real `</pre>` tag, miles away. `<style>`
 *     blocks are stripped before scanning specifically because of this.
 *     If a count still looks impossibly large for one page, suspect a
 *     similar false `<pre` match before re-annotating anything.
 *   - `<pre>` blocks that are constant strings assigned to a JS variable
 *     (a "directiveDocs" style lookup object, e.g.) ARE scanned — the regex
 *     does not know it is inside a template literal — which is correct
 *     behavior (that markup renders as a real `<pre>` once selected) but
 *     means a `--page=` count can include blocks a first read-through of the
 *     page's main content will not show at all.
 *
 * GIT NOTE: gitignored by `frontend/tmp*`; a new gate needs its own
 * `!frontend/tmp_<name>.mjs` allowlist line in .gitignore or git never sees it.
 * ========================================================================== */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const m = process.argv.find(a => a.startsWith(`--${k}=`)); return m ? m.slice(k.length + 3) : d; };
const TOP = parseInt(arg('top', '0'), 10); // 0 = print every page with >=1 bare block
const ONE_PAGE = arg('page', '');
const JSONO = arg('json', '');

const MIN_LINES = 6;
const BARE_DENSITY = 0.25;
const NEARBY_WINDOW = 2500; // chars either side of the block — see WHAT IT CANNOT SEE

// Comment span classes actually in use across the site as of the 2026-09-16 sweep.
const COMMENT_CLASSES = ['cm', 'cmt', 'xc'];

/** Strips <style>…</style> blocks so a CSS comment mentioning the text "<pre>" can never be
 *  mistaken for a real opening <pre> tag (the false positive the 2026-09-16 sweep hit on
 *  angular-custom-directives-visualizer.html — see WHAT IT CANNOT SEE). */
function stripStyleBlocks(html) {
  // Blank every character except newlines, so line NUMBERS after the stripped block still
  // match the real file — replacing the whole match with a single space (an earlier version
  // of this gate did that) silently collapsed every <style> block to one line and threw off
  // every --page= line number reported for content after it in the file.
  return html.replace(/<style[^>]*>[\s\S]*?<\/style>/g, (m) => m.replace(/[^\n]/g, ' '));
}

/** Splits a <pre> block's inner HTML into rendered text lines, trimming one leading/trailing
 *  blank line (the usual `<pre>\n...\n</pre>` formatting artifact) so line counts match what a
 *  reader actually sees. */
function toLines(inner) {
  const text = inner.replace(/<[^>]+>/g, '');
  const lines = text.split('\n');
  while (lines.length && lines[0].trim() === '') lines.shift();
  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
  return lines;
}

/** Comment density for one block: the higher of (a) known comment-span-class occurrences and
 *  (b) a per-line scan for `//`, `#`, `<!--`/`&lt;!--`, `/* ` markers, so a page using an
 *  unrecognized class name still gets credited for visibly-marked comments. */
function commentDensity(inner, lines) {
  let classHits = 0;
  for (const cls of COMMENT_CLASSES) {
    classHits += (inner.match(new RegExp(`class="${cls}"`, 'g')) || []).length;
  }
  let markerHits = 0;
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (/^(#|\/\/|\/\*|\*|<!--|&lt;!--|--)/.test(t)) { markerHits++; continue; }
    if (/\s(\/\/|&lt;!--|<!--)\S/.test(t) || /\s#\s?\S+$/.test(t)) { markerHits++; continue; }
  }
  const hits = Math.max(classHits, markerHits);
  return lines.length ? hits / lines.length : 1;
}

/** True when an `.hf-arrow` note or a `DevHubCodeWalk.mount(` call sits within NEARBY_WINDOW
 *  characters of the block — the static-source proxy for "a teaching device is right here" (see
 *  WHAT IT CANNOT SEE for why this is a proxy, not a rendered-DOM check). */
function hasNearbyDevice(html, start, end) {
  const win = html.slice(Math.max(0, start - NEARBY_WINDOW), start) +
              html.slice(end, Math.min(html.length, end + NEARBY_WINDOW));
  return /hf-arrow/.test(win) || /DevHubCodeWalk\.mount\(/.test(win) || /class="cw-code"/.test(win);
}

/** Scans one page's HTML and returns { bare, substantial, blocks } — blocks is only populated
 *  when `detail` is true (the --page= single-file path), to keep the ranked sweep cheap. */
function auditPage(html, detail) {
  const clean = stripStyleBlocks(html);
  const preRe = /<pre[^>]*>([\s\S]*?)<\/pre>/g;
  let m, bare = 0, substantial = 0;
  const blocks = [];
  while ((m = preRe.exec(clean))) {
    const inner = m[1];
    const lines = toLines(inner);
    if (lines.length < MIN_LINES) continue;
    substantial++;
    const density = commentDensity(inner, lines);
    const nearby = hasNearbyDevice(clean, m.index, m.index + m[0].length);
    const isBare = density < BARE_DENSITY && !nearby;
    if (isBare) bare++;
    if (detail) {
      const lineNo = clean.slice(0, m.index).split('\n').length;
      blocks.push({ line: lineNo, lines: lines.length, densityPct: Math.round(density * 100), nearby, bare: isBare });
    }
  }
  return { bare, substantial, blocks };
}

const files = readdirSync(HERE).filter((f) => f.endsWith('.html'));

if (ONE_PAGE) {
  const html = readFileSync(join(HERE, ONE_PAGE), 'utf8');
  const { bare, substantial, blocks } = auditPage(html, true);
  console.log(`${ONE_PAGE}: ${bare} bare / ${substantial} substantial (6+ line) block(s)\n`);
  for (const b of blocks) {
    console.log(`${b.bare ? 'BARE' : 'ok  '}  line=${b.line}  lines=${b.lines}  density=${b.densityPct}%  nearby=${b.nearby}`);
  }
  process.exit(0);
}

const results = [];
let totalBare = 0, totalSubstantial = 0;
for (const f of files) {
  const html = readFileSync(join(HERE, f), 'utf8');
  const { bare, substantial } = auditPage(html, false);
  totalBare += bare;
  totalSubstantial += substantial;
  if (substantial > 0) results.push({ file: f, bare, substantial });
}

results.sort((a, b) => b.bare - a.bare || b.bare / Math.max(1, b.substantial) - a.bare / Math.max(1, a.substantial));
const withBare = results.filter((r) => r.bare > 0);

console.log(`TOTAL substantial (6+ line) blocks: ${totalSubstantial}`);
console.log(`TOTAL bare blocks: ${totalBare}`);
console.log(`PAGES with >=1 bare block: ${withBare.length}\n`);
console.log('Rank  bare/substantial  file');
const list = TOP > 0 ? withBare.slice(0, TOP) : withBare;
list.forEach((r, i) => {
  console.log(`${String(i + 1).padStart(4)}  ${String(r.bare).padStart(2)}/${String(r.substantial).padEnd(2)}          ${r.file}`);
});

if (JSONO) {
  writeFileSync(join(HERE, JSONO), JSON.stringify({ totalBare, totalSubstantial, pages: results }, null, 2));
  console.log(`\nwrote ${JSONO}`);
}
