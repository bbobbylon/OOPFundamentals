/* ============================================================================
 * tmp_assetcheck.mjs — did an edit silently delete teaching content?
 *
 * THE QUESTION IT ANSWERS
 *   "Compared with a git ref, does any page now have FEWER interactive
 *   teaching assets than it had?" — Try It editors, CodeWalks, rt-stage
 *   scenario engines, quizzes, flashcard decks, the notebook hook. Counted
 *   per page by regex against `git show <ref>:frontend/<page>`.
 *
 * HOW TO RUN
 *   node frontend/tmp_assetcheck.mjs              # compare against master
 *   node frontend/tmp_assetcheck.mjs <ref>        # any ref (branch, sha, HEAD~3)
 *   node frontend/tmp_assetcheck.mjs --verbose    # per-page counts, not just losses
 *   Needs `git` on PATH and a repo with the ref available — CI fetches the base
 *   branch first because a shallow clone has nothing to diff against, and
 *   deploy.yml runs it as `tmp_assetcheck.mjs origin/<base>` on pull requests.
 *   Exit 1 on any loss. Run it after ANY bulk edit or authoring tranche.
 *
 * WHAT A FAILURE MEANS
 *   A page has fewer of some asset than the ref had. Either an edit ate
 *   content that still renders fine without it (the case this exists for),
 *   or the removal was deliberate — in which case say so explicitly. A clean
 *   run means nothing was LOST; additions are always fine and never reported.
 *
 * WHAT IT CANNOT SEE
 *   - An asset that is PRESENT but wrong. A CodeWalk whose `lines:` point at
 *     the wrong code, a Try It whose expected output is stale, an rt-stage
 *     whose scenario text lies — all count exactly as they did before.
 *   - Prose. Deliberately: rewriting prose is the whole point of authoring,
 *     so a paragraph that vanished is not a finding here.
 *   - A page ADDED on this branch (no "before" to compare) — skipped, so a
 *     brand-new thin page is not this gate's problem.
 *   - Anything the regex list does not name. A new kind of widget is
 *     unprotected until it gets a row in ASSETS.
 *
 * GIT NOTE: gitignored by `frontend/tmp*`; a new gate needs its own
 * `!frontend/tmp_<name>.mjs` allowlist line in .gitignore or git never sees it.
 *
 * WHY THIS EXISTS. While authoring the Decorator chapter, a splice that
 * replaced "the top of the page" also swallowed the `.tryit` widget — the real
 * CheerpJ Java runner — because it happened to sit inside the replaced range.
 * Nothing failed. The page still rendered, still validated, still screenshotted
 * beautifully. The loss was found only by a hand-written audit, after the claim
 * "nothing was removed" had already been made.
 *
 * vcheck cannot catch this: it has no notion of "before". This does, by
 * comparing every page against a git ref and failing when a page has FEWER of
 * an interactive asset than it used to. Additions are always fine.
 *
 * USAGE
 *   node tmp_assetcheck.mjs              # compare against master
 *   node tmp_assetcheck.mjs <ref>        # compare against any ref
 *   node tmp_assetcheck.mjs --verbose    # list per-page counts, not just losses
 *
 * Run it after ANY bulk edit or authoring tranche.
 * ========================================================================== */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(HERE);
const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const ref = args.find((a) => !a.startsWith('--')) || 'master';

/* The assets worth protecting: each is a piece of INTERACTIVE teaching that a
   careless edit can remove without breaking anything visible. Plain prose is
   deliberately not counted — rewriting prose is the whole point of authoring. */
const ASSETS = {
  'tryit (runnable code)': /class="tryit"/g,
  'CodeWalk (line-by-line)': /DevHubCodeWalk|data-codewalk|class="cw-/g,
  'rt-* scenario engine': /class="rt-stage"/g,
  'quiz': /DevHubQuiz|data-quiz-bank/g,
  'flashcards': /DevHubFlashcards|data-flashcards/g,
  'notebook hook': /devhub-notebook\.js/g,
};

const count = (s, re) => (s.match(re) || []).length;

/** The page's source at `ref`, via `git show`; null when the file did not exist there. */
function atRef(file) {
  try {
    return execFileSync('git', ['show', `${ref}:frontend/${file}`], {
      cwd: REPO, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
      // A file added on this branch makes git print to stderr before throwing;
      // that is an expected case, not a problem to show the user.
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch { return null; }              // new file — nothing to lose
}

const pages = readdirSync(HERE).filter((f) => f.endsWith('.html')).sort();
const losses = [];
let compared = 0;

for (const f of pages) {
  const before = atRef(f);
  if (before == null) continue;         // added this branch
  compared++;
  const now = readFileSync(join(HERE, f), 'utf8');
  for (const [label, re] of Object.entries(ASSETS)) {
    const o = count(before, re), n = count(now, re);
    if (n < o) losses.push({ file: f, label, o, n });
    else if (verbose && o) console.log(`  = ${f}  ${label}: ${o}→${n}`);
  }
}

if (losses.length) {
  console.error(`\n✗ ${losses.length} teaching asset(s) LOST vs ${ref}:`);
  for (const l of losses) {
    console.error(`   ${l.file}\n     - ${l.label}: ${l.o} → ${l.n}`);
  }
  console.error(
    `\nIf a removal was deliberate, say so explicitly — otherwise an edit ate ` +
    `content that still renders fine without it.\n`
  );
  process.exit(1);
}

console.log(`\n✓ no teaching assets lost — ${compared} page(s) compared against ${ref}\n`);
