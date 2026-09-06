/* tmp_cwlines.mjs — are CodeWalk line references in range?
 *
 * A step's `line:`/`lines:` values are used by devhub-codewalk.js as RAW indices
 * into the rendered line elements (see linesForStep + the lineEls.forEach in
 * devhub-codewalk.js) — so they are ZERO-BASED, and a value equal to the code
 * array's length points one past the end and highlights nothing.
 *
 * This walks every DevHubCodeWalk.mount() on every page SEPARATELY, because a
 * page can carry several mounts and comparing one mount's indices against
 * another's code array is how you get a scary number that means nothing.
 *
 *   node tmp_cwlines.mjs            # summary + the worst offenders
 *   node tmp_cwlines.mjs --all      # every finding
 *   node tmp_cwlines.mjs --file=x.html
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const ONE = (argv.find((a) => a.startsWith('--file=')) || '').split('=')[1] || '';
const ALL = argv.includes('--all');

/* Walk from an opening bracket to its match, respecting quotes/templates so a
   bracket inside a string does not end the scan early. Returns the body text. */
function balanced(src, openIdx) {
  const open = src[openIdx];
  const close = open === '[' ? ']' : '}';
  let depth = 0, i = openIdx, q = null;
  for (; i < src.length; i++) {
    const c = src[i], p = src[i - 1];
    if (q) {
      if (c === q && p !== '\\') q = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === open) depth++;
    else if (c === close) { depth--; if (!depth) return src.slice(openIdx + 1, i); }
  }
  return null;
}

/* The code array's ELEMENTS, counted the way the widget renders them: one
   rendered line per array entry, blank strings included. */
function codeLines(body) {
  const out = [];
  let i = 0, q = null, cur = null;
  for (; i < body.length; i++) {
    const c = body[i], p = body[i - 1];
    if (q) {
      if (c === q && p !== '\\') { out.push(cur); q = null; cur = null; }
      else cur += c;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { q = c; cur = ''; }
  }
  return out;
}

export function scanPage(src, file) {
  const findings = [];
  const marker = 'DevHubCodeWalk.mount(';
  const starts = [];
  for (let i = src.indexOf(marker); i !== -1; i = src.indexOf(marker, i + 1)) starts.push(i);

  starts.forEach((start, n) => {
    const objIdx = src.indexOf('{', start);
    if (objIdx === -1) return;
    const obj = balanced(src, objIdx);
    if (obj == null) return;

    const codeIdx = obj.search(/\bcode:\s*\[/);
    if (codeIdx === -1) return;
    const codeBody = balanced(obj, obj.indexOf('[', codeIdx));
    if (codeBody == null) return;
    const lines = codeLines(codeBody);
    const len = lines.length;

    const stepsIdx = obj.search(/\bsteps:\s*\[/);
    if (stepsIdx === -1) return;
    const stepsBody = balanced(obj, obj.indexOf('[', stepsIdx));
    if (stepsBody == null) return;

    const refs = [];
    for (const m of stepsBody.matchAll(/\blines:\s*\[([-0-9,\s]*)\]/g))
      m[1].split(',').map((x) => x.trim()).filter(Boolean)
        .forEach((v) => refs.push({ kind: 'lines', v: +v }));
    for (const m of stepsBody.matchAll(/\bline:\s*\[\s*(-?\d+)\s*,\s*(-?\d+)\s*\]/g)) {
      const a = +m[1], b = +m[2];
      for (let v = a; v <= b; v++) refs.push({ kind: 'range', v });
    }
    for (const m of stepsBody.matchAll(/\bline:\s*(-?\d+)\s*[,}]/g))
      refs.push({ kind: 'single', v: +m[1] });

    if (!refs.length) return;
    const vals = refs.map((r) => r.v);
    const min = Math.min(...vals), max = Math.max(...vals);
    const oob = refs.filter((r) => r.v < 0 || r.v >= len);
    const blank = refs.filter((r) => r.v >= 0 && r.v < len && lines[r.v].trim() === '');

    findings.push({
      file, mount: n, codeLen: len, min, max,
      outOfRange: [...new Set(oob.map((r) => r.v))].sort((a, b) => a - b),
      blankHits: [...new Set(blank.map((r) => r.v))].sort((a, b) => a - b),
      /* The off-by-one signature: nothing at index 0, and the largest index is
         exactly the array length. That is 1-based authoring, and it means every
         highlight on that mount is one line low with the last one falling off. */
      looksOneBased: min >= 1 && max === len,
    });
  });
  return findings;
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` ||
    process.argv[1].endsWith('tmp_cwlines.mjs')) {
  const files = ONE ? [ONE]
    : readdirSync(HERE).filter((f) => f.endsWith('.html'));
  let mounts = 0, bad = [], oneBased = [];
  for (const f of files) {
    let src;
    try { src = readFileSync(HERE + '/' + f, 'utf8'); } catch { continue; }
    if (!src.includes('DevHubCodeWalk.mount(')) continue;
    for (const r of scanPage(src, f)) {
      mounts++;
      if (r.outOfRange.length || r.blankHits.length) bad.push(r);
      if (r.looksOneBased) oneBased.push(r);
    }
  }
  console.log(`CodeWalk line references — ${mounts} mount(s) across ${files.length} file(s)\n`);
  console.log(`  mounts with an out-of-range or blank-line reference: ${bad.length}`);
  console.log(`  mounts whose indices look 1-BASED (min>=1, max===len):  ${oneBased.length}\n`);
  const show = ALL ? bad : bad.slice(0, 25);
  for (const r of show) {
    const bits = [];
    if (r.outOfRange.length) bits.push('out of range [' + r.outOfRange.join(',') + ']');
    if (r.blankHits.length) bits.push('blank lines [' + r.blankHits.join(',') + ']');
    console.log(`  ${r.file}${r.mount ? ' #' + r.mount : ''}  codeLen=${r.codeLen}  ${bits.join('  ')}${r.looksOneBased ? '  ← 1-based?' : ''}`);
  }
  if (!ALL && bad.length > show.length) console.log(`  … and ${bad.length - show.length} more (--all)`);
}
