/* tmp_genpracticemap.mjs — regenerate the lesson → practice map.
 *
 * THE QUESTION IT ANSWERS
 *   "Which exam, practice bank and flashcard deck does each lesson page feed?"
 *   It inverts every `ref: { label, file }` in exam-*.html and practice-*.html
 *   into a lesson → {exam, practice, deck} map and writes it as the
 *   `window.DEVHUB_PRACTICE` block inside tracks-data.js, between the
 *   `==== GENERATED` / `==== END GENERATED` markers. That block powers the
 *   "Test yourself" strip devhub-chapters.js renders on every lesson.
 *   With --check it answers "is the committed block stale?"
 *
 * HOW TO RUN
 *   node frontend/tmp_genpracticemap.mjs           # rewrite the block
 *   node frontend/tmp_genpracticemap.mjs --check   # exit 1 if stale
 *   No prerequisites: pure node. Run the generator after ANY bank edit, and
 *   run --check in the gate suite. Exit 1 also when a `ref.file` or a
 *   DECK_FOR_EXAM entry names a page that does not exist.
 *
 * WHAT A FAILURE MEANS
 *   "STALE" = tracks-data.js does not match what the banks would generate
 *   now: someone edited a bank (or hand-edited the block, which is the one
 *   thing never to do) and a lesson has silently gained or lost its practice
 *   links. "ref(s) point at a file that does not exist" = a bank cites a
 *   lesson that was renamed or deleted. A clean --check means the block is
 *   byte-identical to a fresh generation.
 *
 * WHAT IT CANNOT SEE
 *   - It compares the block as a STRING. A tracks-data.js carrying mixed
 *     line endings reports STALE while the map's CONTENT is identical —
 *     re-running the generator once fixed four CRLF lines and produced a
 *     zero-byte git diff. If --check fails with no bank edit behind it,
 *     that is why.
 *   - Whether a `ref` points at the RIGHT lesson. A question citing an
 *     existing but unrelated page generates a confident wrong link.
 *   - Lessons that no bank cites at all. They simply have no entry; nothing
 *     here says "this lesson has zero recall practice".
 *   - The DECK_FOR_EXAM pairing is editorial, not derived — a deck mapped to
 *     the wrong exam is invisible to this script.
 *
 * GIT NOTE: gitignored by `frontend/tmp*`; a new gate needs its own
 * `!frontend/tmp_<name>.mjs` allowlist line in .gitignore or git never sees it.
 *
 * WHY THIS IS GENERATED. The exam and practice banks already say which lesson
 * each question came from (`ref: { label, file }` — 560 refs across 19 exams,
 * 54 more across the practice pages). That edge only ever pointed one way:
 * practice knew its lesson, a lesson knew nothing about its practice, so only
 * 2 of 465 lesson pages linked forward to any recall at all. This inverts it.
 *
 * Hand-maintaining the inverse would drift the first time someone edits a bank,
 * and the failure would be silent — a lesson quietly losing its "Test yourself"
 * strip. So it is derived, and --check runs in the gate suite.
 *
 * FLASHCARD DECKS (2026-09-06). Decks carry no per-card `ref` — a card is a
 * fact ("Amazon S3"), not a question tied to one lesson, so there is nothing
 * to invert at that granularity. But every deck already corresponds 1:1 to an
 * existing EXAM (flashcards-aws.html ~ exam-aws-developer.html, etc.) — this
 * is editorial judgment, not something derivable from the banks, so it is the
 * one hand-maintained table here. Once a deck is pinned to an exam, it rides
 * that exam's ALREADY-DERIVED lesson set for free: every lesson that exam
 * already cites gets the deck too, at the exact same precision as the exam
 * link — not a coarser "track-wide" fallback.
 */
const DECK_FOR_EXAM = {
  'exam-aws-developer.html': 'flashcards-aws.html',
  'exam-azure-developer.html': 'flashcards-azure.html',
  'exam-gcp-ace.html': 'flashcards-gcp.html',
  'exam-dsa-interview.html': 'flashcards-bigo.html',
  'exam-http-rest.html': 'flashcards-http.html',
  'exam-spring-professional.html': 'flashcards-spring.html',
  'exam-identity-access.html': 'flashcards-oauth.html',
  'exam-typescript.html': 'flashcards-typescript.html',
  'exam-angular.html': 'flashcards-angular.html',
  'exam-sql.html': 'flashcards-sql.html',
  'exam-git.html': 'flashcards-git.html',
  'exam-docker.html': 'flashcards-docker.html',
  'exam-kubernetes.html': 'flashcards-kubernetes.html',
  'exam-web-fundamentals.html': 'flashcards-web-fundamentals.html',
  'exam-data-science.html': 'flashcards-data-science.html',
  'exam-ai-engineering.html': 'flashcards-ai-engineering.html',
};

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CHECK = process.argv.includes('--check');
const START = '/* ==== GENERATED: lesson → practice map (tmp_genpracticemap.mjs) ==== */';
const END   = '/* ==== END GENERATED ==== */';

const REF = /ref\s*:\s*\{(.*?)\}/gs;
const KV  = /(\w+)\s*:\s*['"]([^'"]*)['"]/g;

const files = readdirSync(HERE)
  .filter(f => /^(exam|practice)-.*\.html$/.test(f))
  .sort();

const map = {};                 // lesson -> { exam?, practice? }
const titles = {};              // bank file -> short human title
let refs = 0; const broken = [];

for (const f of files) {
  const src = readFileSync(join(HERE, f), 'utf8');
  const t = src.match(/<title>([^<]*)<\/title>/);
  titles[f] = (t ? t[1] : f).split('—')[0].split('·')[0].replace(/\s*\|\s*.*$/, '').trim();
  const kind = f.startsWith('exam-') ? 'exam' : 'practice';
  for (const m of src.matchAll(REF)) {
    const d = Object.fromEntries([...m[1].matchAll(KV)].map(p => [p[1], p[2]]));
    if (!d.file) continue;
    refs++;
    if (!existsSync(join(HERE, d.file))) { broken.push(`${f} -> ${d.file}`); continue; }
    (map[d.file] ||= {});
    map[d.file][kind] ||= f;                    // first bank wins; lessons rarely span two
  }
}

if (broken.length) {
  console.error(`✗ ${broken.length} ref(s) point at a file that does not exist:`);
  broken.slice(0, 10).forEach(b => console.error('   ' + b));
  process.exit(1);
}

/* Ride each exam's already-derived lesson set: every lesson citing that exam
   also gets its paired deck, at the exact same precision as the exam link. */
const deckBroken = [];
for (const deck of Object.values(DECK_FOR_EXAM)) {
  if (!existsSync(join(HERE, deck))) deckBroken.push(deck);
}
if (deckBroken.length) {
  console.error(`✗ DECK_FOR_EXAM names ${deckBroken.length} file(s) that do not exist:`);
  deckBroken.forEach(b => console.error('   ' + b));
  process.exit(1);
}
let deckHits = 0;
for (const entry of Object.values(map)) {
  const deck = entry.exam && DECK_FOR_EXAM[entry.exam];
  if (deck) { entry.deck = deck; deckHits++; }
}
for (const deck of new Set(Object.values(DECK_FOR_EXAM))) {
  const src = readFileSync(join(HERE, deck), 'utf8');
  const t = src.match(/<title>([^<]*)<\/title>/);
  titles[deck] = (t ? t[1] : deck).split('—')[0].split('·')[0].replace(/\s*\|\s*.*$/, '').trim();
}

/* Only emit titles the map actually cites, so the block does not carry dead weight. */
const cited = new Set(Object.values(map).flatMap(v => Object.values(v)));
const usedTitles = Object.fromEntries(Object.entries(titles).filter(([k]) => cited.has(k)));

const block = [
  START,
  '/* Derived from the banks by tmp_genpracticemap.mjs — do not hand-edit; run the',
  '   generator instead. `node tmp_genpracticemap.mjs --check` fails if this is stale. */',
  'window.DEVHUB_PRACTICE = ' + JSON.stringify({ titles: usedTitles, map }, null, 0) + ';',
  END,
].join('\n');

const tdPath = join(HERE, 'tracks-data.js');
const td = readFileSync(tdPath, 'utf8');
const has = td.includes(START) && td.includes(END);
const next = has
  ? td.slice(0, td.indexOf(START)) + block + td.slice(td.indexOf(END) + END.length)
  : td.trimEnd() + '\n\n' + block + '\n';

const lessons = Object.keys(map).length;
if (CHECK) {
  if (next === td) { console.log(`✓ practice map is current — ${lessons} lessons, ${refs} refs, ${deckHits} deck links`); process.exit(0); }
  console.error('✗ practice map in tracks-data.js is STALE — run: node tmp_genpracticemap.mjs');
  process.exit(1);
}
writeFileSync(tdPath, next);
console.log(`✓ wrote practice map — ${lessons} lessons from ${refs} refs across ${files.length} banks, ${deckHits} deck links`);
