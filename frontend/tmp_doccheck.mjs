/* ============================================================================
 * tmp_doccheck.mjs — is the code that delivers DevHub documented?
 *
 * WHAT QUESTION IT ANSWERS
 *   ROADMAP item 15 put a doc comment above every function in the 17 shared
 *   front-end engines, a "what it cannot see" header on every gate, and Javadoc
 *   on every backend type and public method. Comments decay the way the
 *   CodeWalk indices did — a new helper lands undocumented, then three more —
 *   so this gate fails the moment any of those three contracts slips.
 *
 * HOW TO RUN
 *   node frontend/tmp_doccheck.mjs            all three checks, exit 1 on any miss
 *   node frontend/tmp_doccheck.mjs --list     print every checked symbol, not just misses
 *   node frontend/tmp_doccheck.mjs --engines  (or --gates / --backend) one check only
 *   Zero dependencies. Runs from any cwd. Wired into .github/workflows/deploy.yml.
 *
 * WHAT IT CHECKS
 *   engines  every `function name(` declaration and every `name: function(` /
 *            `name = function(` / arrow assignment in frontend/*.js (the shared
 *            engines, NOT tmp_*.mjs) has a comment ENDING ON THE LINE DIRECTLY
 *            ABOVE it — a JSDoc block, a plain block comment, or a `//` run. A blank line between
 *            comment and function breaks the association and is a miss on
 *            purpose: that is how a comment ends up describing the wrong
 *            function after one refactor. Each file must also open with a
 *            banner comment in its first 3 lines.
 *   gates    every frontend/tmp_*.mjs opens with a banner comment that contains
 *            the literal heading `WHAT IT CANNOT SEE` — the valuable half of a
 *            gate's documentation, because every bug this repo shipped twice
 *            lived in that gap.
 *   backend  every type declaration (class/record/enum/interface) and every
 *            `public` method in backend/src/main/**.java has a Javadoc block
 *            ending directly above it (annotations between the two are fine).
 *
 * WHAT A FAILURE MEANS
 *   A symbol lost its doc, or a new one landed without it. The fix is a
 *   comment that explains WHY and who calls it — never a restatement of the
 *   signature; a comment that repeats the code is worse than none because it
 *   rots silently. Exit code 1 so CI can gate on it.
 *
 * WHAT IT CANNOT SEE
 *   Whether the comment is TRUE, current, or useful. A block that says only TODO passes.
 *   It cannot see un-named functions (inline callbacks, IIFEs), fields, or
 *   constants, so "every non-obvious field documented" is still a review
 *   item. It cannot see a comment that describes the function above it rather
 *   than the one below (the blank-line rule catches the common case only).
 *   And it does not read the lesson pages at all — those are documented once,
 *   by the anatomy walkthrough in docs/CODE-MAP.md §2, not per file.
 *
 *   New gates are gitignored by `frontend/tmp*`; this one is allowlisted with
 *   its own `!frontend/tmp_doccheck.mjs` line in .gitignore — a new gate needs
 *   the same or git never sees it.
 * ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const argv = process.argv.slice(2);
const LIST = argv.includes('--list');
const only = ['--engines', '--gates', '--backend'].filter(f => argv.includes(f)).map(f => f.slice(2));
const want = k => !only.length || only.includes(k);

/** True when a doc block ends on this line: a block-comment close, or a line starting `//`, `*` or `/*`. */
function isCommentLine(l) {
  const t = l.trim();
  return t.endsWith('*/') || t.startsWith('//') || t.startsWith('*') || t.startsWith('/*');
}

/**
 * Walk upward from `i-1` over any annotations, and report whether the line reached is a
 * comment — i.e. whether the symbol at `i` is documented.
 *
 * `java` mode also steps over MULTI-LINE annotations. Matching only `/^@\w/` line by line
 * is not enough: `@Table(name = "topic_progress",` continues onto a second line that
 * starts with `uniqueConstraints`, the walk stopped on it, and TopicProgress was reported
 * undocumented while carrying a perfectly good Javadoc block. Tracking bracket depth from
 * the bottom up steps over the whole annotation however it is wrapped.
 */
function documentedAbove(lines, i, java) {
  let j = i - 1;
  let depth = 0;                       // how deep inside an annotation's (...) we are
  while (j >= 0) {
    const t = lines[j].trim();
    if (java) {
      const closes = (t.match(/[)\]}]/g) || []).length - (t.match(/[(\[{]/g) || []).length;
      if (depth > 0) { depth += closes; j--; continue; }   // continuation line
      if (t.startsWith('@')) { depth += closes; j--; continue; }
      if (closes > 0 && !isCommentLine(t)) { depth += closes; j--; continue; }
    }
    break;
  }
  return j >= 0 && isCommentLine(lines[j]);
}

/** The file-level banner: a block comment opening within the first 3 lines. */
function hasBanner(lines) {
  return lines.slice(0, 3).some(l => l.trim().startsWith('/*'));
}

const misses = [];
let checked = 0;

// ── engines ───────────────────────────────────────────────────────────────
const FN_RE = /^\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/;
const PROP_FN_RE = /^\s*(?:(?:const|let|var)\s+)?([A-Za-z_$][\w$.]*)\s*[:=]\s*(?:async\s*)?(?:function\s*\(|\([^)]*\)\s*=>|[A-Za-z_$][\w$]*\s*=>)/;

/** A DOM event handler being wired up: `btn.onclick =` or an `onclick:` vnode prop. */
const HANDLER_RE = /^\s*(?:[A-Za-z_$][\w$.]*\.)?on[a-z]+\s*[:=]/;

/**
 * Walk one line's characters and report whether it ENDS inside a template literal,
 * given whether it STARTED inside one.
 *
 * Why not just count backticks: devhub-syntax.js and devhub-codewalk.js both build a
 * highlighter regex as a single-quoted string containing `` ` `` — an odd number of
 * backticks on a line that opens no template at all. A parity counter flips there and
 * never flips back, silently skipping the whole rest of the file (159 lines of
 * devhub-codewalk.js, 64 of devhub-syntax.js) and reporting every one of them as
 * documented. A gate that under-reports is worse than no gate, so this tracks quote
 * and comment state instead.
 *
 * Known limit: a backtick inside a REGEX literal (/`/) would still be read as a
 * template delimiter. No file here writes one — they use string sources — and the
 * self-test below fails loudly if that ever stops being true.
 */
function scanTemplate(line, inTemplate) {
  let t = inTemplate;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '\\') { i++; continue; }                       // escape: skip the next char
    if (t) { if (c === '`') t = false; continue; }            // inside `...`, only ` ends it
    if (c === '`') { t = true; continue; }
    if (c === "'" || c === '"') {                             // skip a quoted string whole
      const q = c;
      for (i++; i < line.length; i++) {
        if (line[i] === '\\') { i++; continue; }
        if (line[i] === q) break;
      }
      continue;
    }
    if (c === '/' && line[i + 1] === '/') return t;            // rest of line is a comment
  }
  return t;
}

/** True when every bracket opened on this line also closes on it — i.e. the whole
 *  function body fits on the one line. Fooled by brackets inside string literals,
 *  which is tolerable: the worst case is asking for a doc comment that was optional. */
function selfContained(l) {
  let depth = 0;
  for (const ch of l) {
    if (ch === '(' || ch === '{' || ch === '[') depth++;
    else if (ch === ')' || ch === '}' || ch === ']') depth--;
  }
  return depth === 0;
}

if (want('engines')) {
  const files = fs.readdirSync(HERE).filter(f => f.endsWith('.js') && !f.startsWith('tmp_'));
  for (const f of files) {
    const lines = fs.readFileSync(path.join(HERE, f), 'utf8').split(/\r?\n/);
    if (!hasBanner(lines)) misses.push(`engines  ${f}: no file banner in the first 3 lines`);
    let inBlock = false;
    let inTemplate = false;
    lines.forEach((l, i) => {
      // a `function` mentioned inside a block comment or a `//` line is prose, not a declaration
      if (inBlock) { if (l.includes('*/')) inBlock = false; return; }
      if (/^\s*\/\*/.test(l) && !l.includes('*/')) { inBlock = true; return; }
      if (/^\s*(\/\/|\*)/.test(l)) return;
      // ...and a `function` inside a TEMPLATE LITERAL is a payload, not this file's code.
      // devhub-tryit.js / devhub-codegrade.js build the sandbox bootstrap as a backtick
      // string; its __send/__fmt run in an iframe and are documented where the string is
      // assembled, not per line.
      const startedInTemplate = inTemplate;
      inTemplate = scanTemplate(l, inTemplate);
      if (startedInTemplate) return;
      const m = FN_RE.exec(l) || PROP_FN_RE.exec(l);
      if (!m) return;
      // A one-line event wire-up (`s.onerror = () => resolve(false);`) documents itself;
      // demanding a comment there produced exactly the `// increment i` noise ROADMAP 15
      // forbids. A handler with a real body still has to say why it exists.
      if (HANDLER_RE.test(l) && selfContained(l)) return;
      checked++;
      const ok = documentedAbove(lines, i, false);
      if (LIST) console.log(`${ok ? '  ok ' : ' MISS'} ${f}:${i + 1} ${m[1]}`);
      if (!ok) misses.push(`engines  ${f}:${i + 1} ${m[1]}() has no doc comment directly above it`);
    });
    // A file cannot end in the middle of a template literal. If it does, scanTemplate()
    // lost its place and everything after that point was skipped WITHOUT being checked —
    // the exact silent-underreport this gate must never do. Fail instead of guessing.
    if (inTemplate) misses.push(`engines  ${f}: unterminated template literal — the doc scan lost its place and skipped the rest of the file`);
  }
}

// ── gates ─────────────────────────────────────────────────────────────────
if (want('gates')) {
  const files = fs.readdirSync(HERE).filter(f => /^tmp_.*\.mjs$/.test(f));
  for (const f of files) {
    const src = fs.readFileSync(path.join(HERE, f), 'utf8');
    const lines = src.split(/\r?\n/);
    checked++;
    const head = lines.slice(0, 120).join('\n');
    const banner = hasBanner(lines) || /^#!.*\n\s*\/\*/.test(src);
    const cannot = /WHAT IT CANNOT SEE/.test(head);
    if (LIST) console.log(`${banner && cannot ? '  ok ' : ' MISS'} ${f}`);
    if (!banner) misses.push(`gates    ${f}: no banner comment at the top`);
    else if (!cannot) misses.push(`gates    ${f}: banner has no "WHAT IT CANNOT SEE" section`);
  }
}

// ── backend ───────────────────────────────────────────────────────────────
const TYPE_RE = /^\s*(?:public\s+|protected\s+|private\s+)?(?:static\s+|final\s+|abstract\s+|sealed\s+)*(class|record|enum|interface)\s+([A-Z]\w*)/;
const METHOD_RE = /^\s*public\s+(?!class|record|enum|interface)[\w<>\[\],.? ]+?\s+([a-z]\w*)\s*\(/;
const JAVA_ANNOTATIONS = true;   // step over annotations, including multi-line ones

/** Recursively list every .java file under `dir`. */
function javaFiles(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...javaFiles(p));
    else if (e.name.endsWith('.java')) out.push(p);
  }
  return out;
}

if (want('backend')) {
  const src = path.join(ROOT, 'backend', 'src', 'main');
  if (!fs.existsSync(src)) {
    console.log('backend/src/main not found — backend check skipped');
  } else {
    for (const p of javaFiles(src)) {
      const rel = path.relative(ROOT, p).replace(/\\/g, '/');
      const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
      lines.forEach((l, i) => {
        let m = TYPE_RE.exec(l), what;
        if (m) what = `${m[1]} ${m[2]}`;
        else { m = METHOD_RE.exec(l); if (m) what = `${m[1]}()`; }
        if (!what) return;
        checked++;
        const ok = documentedAbove(lines, i, JAVA_ANNOTATIONS);
        if (LIST) console.log(`${ok ? '  ok ' : ' MISS'} ${rel}:${i + 1} ${what}`);
        if (!ok) misses.push(`backend  ${rel}:${i + 1} ${what} has no Javadoc directly above it`);
      });
    }
  }
}

// ── report ────────────────────────────────────────────────────────────────
for (const m of misses) console.log('❌ ' + m);
console.log(`doccheck: ${checked} symbols checked, ${misses.length} undocumented`);
process.exit(misses.length ? 1 : 0);
