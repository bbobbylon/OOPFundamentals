/* ============================================================================
 * tmp_hfaudit.mjs — score every lesson page against the Head First bar.
 *
 * THE QUESTION IT ANSWERS
 *   "Which lesson pages are THIN — missing the ingredients of the nine-point
 *   Head First teaching standard in CLAUDE.md?" Every lesson page (one with
 *   an .intro card, a <pre>, or an rt-stage; landing pages, exams, decks and
 *   practice pages are skipped) gets a 0-100 score across seven weighted
 *   dimensions — explain, recall, hooks, multi, visual, voice, structure —
 *   and the site is ranked thinnest first. It is a WORKLIST generator, not a
 *   pass/fail gate: it never exits non-zero.
 *
 *   CLAUDE.md sets the standard and a standing directive: on any sweep,
 *   "scan for thin lessons — pages that teach a concept only one way, have no
 *   memory hooks, or read like documentation instead of teaching." Doing that
 *   by opening 500 pages is not a plan. This scores them.
 *
 * HOW TO RUN
 *   node frontend/tmp_hfaudit.mjs                    # ranked worklist
 *   node frontend/tmp_hfaudit.mjs --track=angular    # one track (body.track-*)
 *   node frontend/tmp_hfaudit.mjs --top=40           # how many to list (30)
 *   node frontend/tmp_hfaudit.mjs --json=out.json    # every row, all parts
 *   No prerequisites: pure node, static markup scan. The `--json` path is
 *   written RELATIVE TO frontend/, not the cwd.
 *
 * WHAT A LOW SCORE MEANS
 *   The page lacks the PARTS: no CodeWalk or annotation beside its code, no
 *   knowledge check, no memory-hook markup, one explanation and out. Treat a
 *   low score as "go look at this", never as a verdict, and treat a high
 *   score as "has the parts", never as "is good". The weights follow
 *   CLAUDE.md's own emphasis: line-by-line code explanation and active recall
 *   are the two Bobby has asked for most, so they carry most.
 *
 * WHAT IT CANNOT SEE
 *   - MEANING. It reads markup, not teaching. It cannot tell a brilliant
 *     analogy from a limp one, a true note from a false one, or a memory
 *     hook that lands from one that does not.
 *   - Explain-score distortion: `explain` divides by <pre> COUNT, so a page of
 *     one-line snippets is punished as though they were unexplained programs
 *     (`streams` scores 25 with exactly ONE substantial block). The honest
 *     measure for that audit is blocks of 6+ lines with no walk nearby —
 *     see ROADMAP item 2 — not this dimension.
 *   - Which track a page BELONGS to. It reads `body.track-*`, so a page
 *     cloned with the wrong class is filed under the wrong track here too.
 *   - Whether the parts it counts WORK: a CodeWalk with mis-pointed lines
 *     (tmp_cwlines.mjs) or an inert .hf-check (tmp_vcheck.mjs) scores the
 *     same as a working one.
 *
 * GIT NOTE: gitignored by `frontend/tmp*`; a new gate needs its own
 * `!frontend/tmp_<name>.mjs` allowlist line in .gitignore or git never sees it.
 * ========================================================================== */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const m = process.argv.find(a => a.startsWith(`--${k}=`)); return m ? m.slice(k.length + 3) : d; };
const TOP = parseInt(arg('top', '30'), 10);
const TRACK = arg('track', '');
const JSONO = arg('json', '');

/* Landing pages, exams and standalone decks are not lesson pages and are not
   held to a lesson's bar. Scoring them would bury the real worklist. */
const SKIP = /^(index|.*-index|app|stats|exam-.*|flashcards-.*|quiz-.*|practice-.*|.*-cheatsheet)\.html$/;

/* A filename list can only catch the naming conventions someone remembered. The
   structural test is better: every lesson on this site opens with a plain-English
   .intro card and shows either code or an animated stage (that is CLAUDE.md's
   standing structural requirement, and it scores 100/100 sitewide). A page with
   NONE of the three is scaffolding — a curriculum index, a nav page — and scoring
   it against a lesson's bar puts a page nobody should author at the top of the
   worklist. learning-paths.html sat at 33.5 and would have been authored next. */
const isLesson = (s) => /class="intro/.test(s) || /<pre\b/.test(s) || /rt-stage/.test(s);
const files = readdirSync(HERE).filter((f) => {
  if (!f.endsWith('.html') || SKIP.test(f)) return false;
  return isLesson(readFileSync(join(HERE, f), 'utf8'));
});

const has = (s, re) => re.test(s);
const count = (s, re) => (s.match(re) || []).length;

const DIMS = [
  { key: 'explain',  w: 20, label: 'line-by-line code explanation',
    /* CLAUDE.md #7, the one Bobby has asked for "many many many times". */
    score: (s) => {
      const pres = count(s, /<pre\b/g);
      if (!pres) return 1;                                  // no code: not applicable, don't punish
      const walks = count(s, /DevHubCodeWalk|class="cw\b|cw-line/g);
      const annots = count(s, /hf-annot|hf-arrow|class="ann\b/g);
      return Math.min(1, (walks * 2 + annots) / Math.max(2, pres));
    } },
  { key: 'recall',   w: 18, label: 'active recall (predict-then-reveal)',
    score: (s) => {
      let n = 0;
      if (has(s, /hf-check/)) n += 2;                        // the knowledge check
      if (has(s, /hf-napkin|hf-brain/)) n += 1;              // predict-first beat
      if (has(s, /dlh-tryit-predict/)) n += 1;
      if (has(s, /devhub-quiz|devhub-flashcards|dlh-quiz/)) n += 1;
      return Math.min(1, n / 3);
    } },
  { key: 'hooks',    w: 16, label: 'memory hooks (mnemonic, callout, contrast)',
    score: (s) => Math.min(1, count(s, /hf-big|hf-note|hf-mark|hf-brain|hf-vs|hf-say|class="principle"/g) / 6) },
  { key: 'multi',    w: 14, label: 'taught more than one way',
    score: (s) => {
      let n = 0;
      if (has(s, /class="intro/)) n += 1;                    // plain English first
      if (has(s, /rt-stage|rt-ctlbar/)) n += 1;              // animated walk
      if (has(s, /<pre\b/)) n += 1;                          // real code
      if (has(s, /hf-terms|intro-ciam|In CIAM|at work/i)) n += 1;  // "why at your job"
      return n / 4;
    } },
  { key: 'visual',   w: 12, label: 'visuals where a picture beats prose',
    score: (s) => Math.min(1, count(s, /hf-nest|hf-slot|hf-cast|hf-one|hf-steps|hf-cycle|rt-stage|<svg/g) / 3) },
  { key: 'voice',    w: 10, label: 'conversational second person',
    score: (s) => {
      const prose = s.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, ' ');
      const words = prose.split(/\s+/).length || 1;
      return Math.min(1, (count(prose, /\byou\b|\byour\b|\byou'/gi) / words) * 120);
    } },
  { key: 'structure',w: 10, label: 'site structural conventions',
    score: (s) => {
      let n = 0;
      if (has(s, /class="intro/)) n += 1;
      if (has(s, /devhub\.css/)) n += 1;
      if (!has(s, /<pre\b/) || has(s, /devhub-syntax\.js/)) n += 1;   // CLAUDE.md #8
      if (has(s, /name="viewport"/)) n += 1;
      return n / 4;
    } },
];

const rows = [];
for (const f of files) {
  const s = readFileSync(join(HERE, f), 'utf8');
  const m = s.match(/<body[^>]*class="([^"]*)"/);
  const track = m ? (m[1].match(/track-([a-z0-9-]+)/) || [, ''])[1] : '';
  if (TRACK && track !== TRACK) continue;
  const parts = {}; let total = 0, wsum = 0;
  for (const d of DIMS) {
    const v = Math.max(0, Math.min(1, d.score(s)));
    parts[d.key] = +(v * 100).toFixed(0);
    total += v * d.w; wsum += d.w;
  }
  rows.push({ file: f, track, authored: has(s, /hf-kick/) && has(s, /hf-check/),
              score: +((total / wsum) * 100).toFixed(1), parts, bytes: s.length });
}

rows.sort((a, b) => a.score - b.score);
if (JSONO) writeFileSync(join(HERE, JSONO), JSON.stringify(rows, null, 2));

const avg = rows.reduce((n, r) => n + r.score, 0) / (rows.length || 1);
console.log(`Head First bar — ${rows.length} lesson page(s), mean score ${avg.toFixed(1)}/100`);
console.log(`authored to the full rhythm: ${rows.filter(r => r.authored).length}\n`);
const band = (n) => rows.filter(n).length;
console.log(`  under 40 (thin):      ${band(r => r.score < 40)}`);
console.log(`  40-60 (has parts):    ${band(r => r.score >= 40 && r.score < 60)}`);
console.log(`  60-75 (solid):        ${band(r => r.score >= 60 && r.score < 75)}`);
console.log(`  75+   (at the bar):   ${band(r => r.score >= 75)}\n`);
console.log('weakest dimension across the site:');
for (const d of DIMS) {
  const m = rows.reduce((n, r) => n + r.parts[d.key], 0) / (rows.length || 1);
  console.log(`  ${String(Math.round(m)).padStart(3)}/100  ${d.label}`);
}
console.log(`\nthinnest ${TOP}:`);
for (const r of rows.slice(0, TOP))
  console.log(`  ${String(r.score).padStart(5)}  ${r.file.padEnd(52)} ${r.track||'—'}`);
