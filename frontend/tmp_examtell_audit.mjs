/* ============================================================================
 * tmp_examtell_audit.mjs — detect "giveaway" tells in the DevHub exam banks.
 *
 * THE QUESTION IT ANSWERS
 *   "Can a test-taker beat an exam-*.html bank WITHOUT knowing the material?"
 *   — by always picking the longest (or shortest) option, or by always picking
 *   the same letter — plus one coverage check: does every option on every
 *   question carry a real per-option `why` explanation?
 *
 * HOW TO RUN
 *   node frontend/tmp_examtell_audit.mjs             # every exam-*.html bank
 *   node frontend/tmp_examtell_audit.mjs http-rest   # banks whose name contains this
 *   node frontend/tmp_examtell_audit.mjs http-rest --lengths   # per-question dump
 *   No prerequisites: pure node + vm (the bank is pulled out of the page's
 *   inline <script> by stubbing DevHubQuiz.render). Exit 0 clean, 1 on any
 *   tell, 2 when no bank matched. Run it after ANY bank edit, then
 *   `node frontend/tmp_genpracticemap.mjs` because the practice map is derived
 *   from the same banks.
 *
 * WHAT A FAILURE MEANS
 *   LENGTH TELL — the correct option is the longest/shortest in >40% of
 *   questions, or its mean length-rank sits outside 2.15–2.85 of 4, or a
 *   single question's right answer towers ≥1.6× over its distractors. The
 *   fix is length-bracketing: one shorter AND one longer distractor, correct
 *   answer in the middle. POSITION TELL — one raw index holds >40% of the
 *   single-answer questions (the engine shuffles, but a skewed source means
 *   distractors were an afterthought). WHY COVERAGE — a question whose `why`
 *   array is missing, misaligned, or boilerplate under 20 chars. A clean run
 *   means the bank is not guessable by these three shapes.
 *
 * WHAT IT CANNOT SEE
 *   - Whether a question is any GOOD. A well-bracketed, well-spread question
 *     with a wrong answer key, a distractor that is also correct, or a
 *     `why` that explains something false passes every check here.
 *   - Tells in WORDING: "all of the above", the only option using the exact
 *     term from the stem, the only grammatically matching option.
 *   - Practice-*.html and flashcard decks — exam-*.html only.
 *   - Small banks' position skew: under 8 single-answer questions the
 *     position check is skipped on purpose.
 *
 * GIT NOTE: gitignored by `frontend/tmp*`; a new gate needs its own
 * `!frontend/tmp_<name>.mjs` allowlist line in .gitignore or git never sees it.
 *
 * Two anti-patterns make a multiple-choice question guessable without knowing
 * the material:
 *
 *   1. LENGTH TELL   — the correct choice is the longest / most detailed option,
 *                      so a test-taker just picks the wordiest one.
 *   2. POSITION TELL — in the RAW bank the correct answer sits at the same index
 *                      (usually B / index 1) far more often than chance. The
 *                      engine shuffles at render, but a skewed source is the
 *                      symptom of distractors written as an afterthought.
 *
 * Plus one COVERAGE gate (learning quality, not guessability):
 *
 *   3. WHY COVERAGE  — every question must carry a `why` array aligned to
 *                      `choices`: one substantive line per option explaining why
 *                      it is right / wrong. The quiz engine shows these after
 *                      answering, so a learner never sees a bare "correct: B".
 *
 * Usage:  node tmp_examtell_audit.mjs            (audit every exam-*.html)
 *         node tmp_examtell_audit.mjs http-rest  (audit banks matching a name)
 *
 * Exit code 0 = clean, 1 = at least one tell flagged. Reusable as a gate.
 * ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import vm from 'node:vm';

const HERE = path.dirname(url.fileURLToPath(import.meta.url));

/* ---- tuning knobs -------------------------------------------------------- */
const LEN_RATIO_FLAG   = 1.60; // a single question is "egregious" if correct is the longest
                               // AND ≥1.6× the mean distractor (a real, visible size gap)
const EXTREME_SHARE    = 0.40; // bank tell if correct is the LONGEST (or SHORTEST) option in
                               // >40% of questions — that's what "pick the longest" exploits
const RANK_LO = 2.15, RANK_HI = 2.85; // mean length-rank of the correct option should sit
                               // near 2.5 (no bias); outside this band = skewed long/short
const POS_SHARE_FLAG   = 0.40; // one answer index holds >40% of a bank → position tell
const POS_MIN_QUESTIONS = 8;   // don't flag position on tiny banks
const WHY_MIN_CHARS    = 20;   // a per-option "why" shorter than this is boilerplate
                               // ("Wrong.") rather than an actual reason

/* ---- pull the inlined question bank out of an exam-*.html file ----------- */
/** The bank object an exam page hands to DevHubQuiz.render, captured via a vm stub. */
function loadBank(file) {
  const html = fs.readFileSync(file, 'utf8');
  // inline <script> blocks only (skip <script src="...">)
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
    .map(m => m[1]);
  const scriptText = scripts.find(s => s.includes('DevHubQuiz.render'));
  if (!scriptText) throw new Error('no DevHubQuiz.render call found');

  let captured = null;
  const sandbox = {
    document: { getElementById: () => ({}) },
    DevHubQuiz: { render: (_el, bank) => { captured = bank; } },
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(scriptText, sandbox, { timeout: 5000 });
  if (!captured) throw new Error('render did not receive a bank');
  return captured;
}

const len = s => String(s).trim().length;

/* ---- analyse one bank ---------------------------------------------------- */
/** Length / position / why statistics for one bank, plus the three boolean tells. */
function analyse(bank) {
  const posCount = {};              // raw answer index → frequency (single-answer only)
  const flags = [];                 // egregious per-question length outliers
  let singles = 0;
  let nLongest = 0, nShortest = 0;  // # questions where correct is the longest / shortest option
  let rankSum = 0, rankN = 0;       // for the mean length-rank of the correct option
  const whyBad = [];                // questions with missing/misaligned/boilerplate `why`

  for (const q of bank.questions) {
    // why coverage: aligned array, every entry a real reason
    const whyOk = Array.isArray(q.why)
      && q.why.length === q.choices.length
      && q.why.every(w => typeof w === 'string' && w.trim().length >= WHY_MIN_CHARS);
    if (!whyOk) whyBad.push(q.id);
    const multi = q.multi === true || Array.isArray(q.answer);
    const correctIdx = multi ? q.answer : [q.answer];
    const lens = q.choices.map(len);

    if (!multi) {
      singles++;
      posCount[q.answer] = (posCount[q.answer] || 0) + 1;
    }

    // Judge length balance on the SHORTEST correct option (the fair test: even
    // the leanest right answer shouldn't tower over — or hide beneath — the rest).
    const correctLens = correctIdx.map(i => lens[i]);
    const distractorLens = lens.filter((_, i) => !correctIdx.includes(i));
    if (!distractorLens.length) continue;
    const minCorrect = Math.min(...correctLens);
    const meanDistractor = distractorLens.reduce((a, b) => a + b, 0) / distractorLens.length;
    const maxDistractor = Math.max(...distractorLens);
    const minDistractor = Math.min(...distractorLens);

    const isLongest  = minCorrect > maxDistractor;
    const isShortest = minCorrect < minDistractor;
    if (isLongest)  nLongest++;
    if (isShortest) nShortest++;

    // length-rank of the correct option among all four (1 = shortest … 4 = longest),
    // ties shared at 0.5 — the whole-bank mean should sit near 2.5 if unbiased.
    const shorter = distractorLens.filter(d => d < minCorrect).length;
    const equal   = distractorLens.filter(d => d === minCorrect).length;
    rankSum += 1 + shorter + equal * 0.5;
    rankN++;

    // egregious single question: correct is the longest AND clearly bigger.
    const ratio = minCorrect / meanDistractor;
    if (isLongest && ratio >= LEN_RATIO_FLAG)
      flags.push({ id: q.id, ratio, minCorrect, meanDistractor: Math.round(meanDistractor), maxDistractor });
  }

  const pctLongest  = rankN ? nLongest / rankN : 0;
  const pctShortest = rankN ? nShortest / rankN : 0;
  const meanRank    = rankN ? rankSum / rankN : 2.5;
  const extremeTell = pctLongest > EXTREME_SHARE || pctShortest > EXTREME_SHARE;
  const rankTell    = meanRank > RANK_HI || meanRank < RANK_LO;
  const lengthTell  = flags.length > 0 || extremeTell || rankTell;

  // position tell
  let posShare = 0, posIdx = null;
  for (const k of Object.keys(posCount)) {
    if (posCount[k] / singles > posShare) { posShare = posCount[k] / singles; posIdx = +k; }
  }
  const positionTell = singles >= POS_MIN_QUESTIONS && posShare > POS_SHARE_FLAG;

  return {
    total: bank.questions.length, singles, flags,
    nLongest, nShortest, pctLongest, pctShortest, meanRank,
    extremeTell, rankTell, lengthTell,
    posCount, posShare, posIdx, positionTell,
    whyBad, whyTell: whyBad.length > 0
  };
}

/* ---- optional per-question length dump: node …audit.mjs http-rest --lengths */
if (process.argv.includes('--lengths')) {
  const nameFilter = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null;
  const fs2 = fs, path2 = path;
  const dumpFiles = fs2.readdirSync(HERE)
    .filter(f => /^exam-.*\.html$/.test(f) && f !== 'exam-readiness.html')
    .filter(f => !nameFilter || f.includes(nameFilter)).sort();
  for (const f of dumpFiles) {
    const bank = loadBank(path2.join(HERE, f));
    console.log(`\n${f}`);
    for (const q of bank.questions) {
      const multi = q.multi === true || Array.isArray(q.answer);
      const correct = multi ? q.answer : [q.answer];
      const lens = q.choices.map(len);
      const rank = 1 + lens.filter((l, i) => !correct.includes(i) && l < Math.min(...correct.map(i => lens[i]))).length;
      const cells = lens.map((l, i) => (correct.includes(i) ? `[${l}]` : ` ${l} `)).join(' ');
      console.log(`  ${String(q.id).padEnd(22)} ${cells}   rank≈${rank}`);
    }
  }
  process.exit(0);
}

/* ---- run over the matching files ----------------------------------------- */
const filter = process.argv[2];
const files = fs.readdirSync(HERE)
  .filter(f => /^exam-.*\.html$/.test(f) && f !== 'exam-readiness.html')
  .filter(f => !filter || f.includes(filter))
  .sort();

if (!files.length) { console.error('no exam banks matched'); process.exit(2); }

let anyFail = false;
let totalQ = 0, totalFlags = 0;
const bar = '─'.repeat(74);

for (const f of files) {
  let bank, r;
  try { bank = loadBank(path.join(HERE, f)); r = analyse(bank); }
  catch (e) { console.log(`\n✗ ${f}\n    PARSE ERROR: ${e.message}`); anyFail = true; continue; }

  totalQ += r.total; totalFlags += r.flags.length;
  const ok = !r.lengthTell && !r.positionTell && !r.whyTell;
  if (!ok) anyFail = true;

  console.log(`\n${ok ? '✓' : '✗'} ${f}   (${r.total} questions)`);

  // length tell — headline "pick the extreme" exploitability
  const pl = (r.pctLongest * 100).toFixed(0), ps = (r.pctShortest * 100).toFixed(0);
  const lenLabel = r.lengthTell ? 'LENGTH TELL' : 'length: ok';
  console.log(`    ${lenLabel} — correct is longest in ${r.nLongest}/${r.singles} (${pl}%), shortest in ${r.nShortest}/${r.singles} (${ps}%), mean rank ${r.meanRank.toFixed(2)}/4 (2.50 = unbiased)`);
  if (r.extremeTell)
    console.log(`      ↳ "pick the ${r.pctLongest >= r.pctShortest ? 'longest' : 'shortest'}" beats chance — needs >${(EXTREME_SHARE * 100)}% to flag`);
  if (r.rankTell)
    console.log(`      ↳ correct option skews ${r.meanRank > RANK_HI ? 'LONG' : 'SHORT'} — mean rank outside ${RANK_LO}–${RANK_HI}`);
  for (const x of r.flags)
    console.log(`      • egregious: ${x.id.padEnd(18)} correct=${x.minCorrect}c  meanDistractor=${x.meanDistractor}c  ratio=${x.ratio.toFixed(2)}×`);

  // position tell
  const dist = [0, 1, 2, 3, 4, 5].filter(i => r.posCount[i]).map(i => `${'ABCDEF'[i]}:${r.posCount[i]}`).join(' ');
  if (r.positionTell)
    console.log(`    POSITION TELL — ${(r.posShare * 100).toFixed(0)}% of answers are "${'ABCDEF'[r.posIdx]}" (raw index ${r.posIdx})   [${dist}]`);
  else
    console.log(`    position: ok — spread [${dist}]`);

  // why coverage
  if (r.whyTell)
    console.log(`    WHY COVERAGE — ${r.whyBad.length}/${r.total} question(s) missing an aligned per-option why[] (≥${WHY_MIN_CHARS} chars each): ${r.whyBad.slice(0, 8).join(', ')}${r.whyBad.length > 8 ? ', …' : ''}`);
  else
    console.log(`    why coverage: ok — every option on every question explains itself`);
}

console.log(`\n${bar}`);
console.log(`${anyFail ? '✗ TELLS FOUND' : '✓ ALL CLEAN'}   ${files.length} bank(s), ${totalQ} questions, ${totalFlags} egregious flag(s)`);
console.log(bar);
process.exit(anyFail ? 1 : 0);
