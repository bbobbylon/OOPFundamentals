# DevHub Roadmap

A running todo/future-enhancements list for the Dev Learning Hub (`frontend/app.html`).
This is planning, not documentation of what exists today — see
[DEVHUB-GUIDE.md](DEVHUB-GUIDE.md) for the current, accurate map of tracks and pages.

When an item here gets built: register it in `TRACKS` in `frontend/app.html`, update the
page/track counts in `README.md` and `DEVHUB-GUIDE.md`, then delete the item from this file
(git history keeps the record — this file should only ever describe what's *not* done yet).

---

## NEXT UP — Personal Notebook feature (requested 2026-08-22)

Bobby wants a **personal notebook** users can build as they go: a "quick add" action on any
concept or lesson section that saves it into the user's own notebook, so they can curate a
focused study set (knowledge hardening, exam prep, whatever they want to drill). The notebook
should be **pre-sectioned to mirror the site's own lesson/track navigation** — same tracks,
same sections — so finding your saved notes feels exactly like finding the original lesson, just
filtered to what you picked. This is new scope, not started yet.

Open design questions to resolve before building (not yet discussed with Bobby):
- Storage: localStorage (matches the quiz/flashcard history pattern already in
  `devhub-quiz.js`/`devhub-flashcards.js`) vs. something backend-backed if a real user-accounts
  system ever exists. Given this app is currently pure static frontend, localStorage is the
  obvious first cut.
- What "quick add" actually captures per concept/section — a link back to the page+anchor, a
  snapshot of the text, or both.
- Where the "add to notebook" affordance lives on each page (per code-walkthrough step? per
  section heading? both?) — needs to be sitewide/consistent like the `rt-ctlbar` pattern was.
- A dedicated `notebook.html` (or similar) as the navigable, track-sectioned view of what's saved.

**Also requested (2026-08-22): build evidence-based study science into the notebook, not just
storage.** The notebook shouldn't just hold what a user quick-added — it should actively teach
and apply **proven** study/memory techniques on top of that saved content: the kind of thing
backed by cognitive-science research (graduate/doctoral-level, published studies), not folk
wisdom. Flashcards generated from notebook entries are the first piece (reuse/extend the existing
Leitner spaced-repetition engine in `devhub-flashcards.js` rather than building a second one).
Beyond flashcards, research and apply techniques with real evidence behind them before adding
anything — candidates to investigate (not yet vetted, just the categories Bobby named):
- **Spacing effect / spaced repetition** — review intervals that expand over time beat massed
  cramming (already partially covered by the Leitner system; extend it to notebook content).
- **Retrieval practice / testing effect** — actively recalling a fact (quiz-style) beats
  re-reading it; the existing `devhub-quiz.js` engine is this in practice already.
- **Interleaving** — mixing topics/problem types in a study session beats blocking one topic at
  a time, especially for exam and coding-interview prep.
- **Dual coding** — pairing text with a diagram/visual for the same concept aids recall (this
  app's whole visualizer format already leans this way; worth confirming the notebook preserves
  it rather than reducing saved items to plain text).
- **Desirable difficulty** — study conditions that feel harder in the moment (varied
  practice, self-testing) produce better long-term retention than easier-feeling methods
  (highlighting, re-reading), even though they feel less effective while studying.
- Optimal session length / distributed practice research, and any evidence on presentation
  variables Bobby specifically flagged (color, text size/emphasis) aiding memory encoding — needs
  real research before any UI decisions are made off it, not assumed.

The bar here is **PROVEN** — cite real research before building a technique into the UI, don't
just implement something because it sounds plausible.

---

## NEXT UP — Sitewide depth audit against "zero to hired" goal (requested 2026-08-22)

**The stated end goal of this entire app:** someone with zero software development knowledge
should be able to come here and become an expert in whatever stack they're learning, deep enough
to get hired. That means covering **every aspect of software development that's taught at elite
CS programs** — not just language/framework syntax. Explicitly named as current gaps to audit
for and fill: API handling, testing (unit/integration/e2e), building REST APIs end-to-end, the
full DevOps lifecycle, deployment, cloud, databases — i.e. the entire full-stack development
lifecycle, not just the "learn the language" slice. Bobby's framing: this should be
**CourseCareers, but 100x better** — a genuine one-stop shop for learning a stack well enough to
get a job in it.

**Longer-term expansion (not immediate, but the direction this is heading):** grow beyond
software development into every IT field — AI, Data Science, Software Dev, DevOps, and whatever
else. Also add practice exams/study guides for certificates — scoped deliberately to
**entry-level certs only** (e.g. AWS, Claude Code, Angular) since the full universe of available
certifications is too large to chase; entry-level is where a learner coming from zero actually
needs the on-ramp. **Mid- and senior-level certs are explicitly a later phase** — get entry-level
solid and running first, then expand upward once that's proven out.

Next action when this is picked up: run a depth/coverage audit (similar shape to the "spot-check"
audits already logged in the Done sections below) specifically against the full-stack-lifecycle
checklist above — API design/testing/REST, DevOps/deployment/cloud/databases — and report gaps
before building anything, since this is a much bigger scope than a single-page or single-track
fix.

---

## Done — Database/AWS/DSA depth pass (started 2026-08-20, completed 2026-08-21)

Bobby asked to "solidify the concepts for database and aws/infrastructure... and make sure
data structures and algorithms are also sound/solid." An audit of all three tracks found content
gaps; all 10 pages below are now built, registered in `TRACKS`, and counted in `README.md` +
`DEVHUB-GUIDE.md` (453 pages / 29 tracks):
- `sql-replication-visualizer.html`, `sql-partitioning-visualizer.html` — SQL & Databases,
  Advanced section.
- `aws-api-gateway-visualizer.html`, `aws-load-balancing-visualizer.html` — Cloud — AWS, AWS
  section.
- `aws-compute-decision-visualizer.html`, `aws-storage-deep-visualizer.html`,
  `aws-iac-visualizer.html`, `aws-cost-visualizer.html` — Cloud — AWS, new "Architecture &
  Operations" section.
- `ds-two-pointer-sliding-window-visualizer.html`, `ds-backtracking-visualizer.html` — Data
  Structures & Algorithms, Algorithms section (backtracking is cross-linked from
  `recursion-visualizer.html`).

**Lower-priority backlog from the same audit** (content is fine, this is a polish/consistency
pass, not a content gap; scope expanded 2026-08-21 after the sitewide depth spot-check below
found this reaches well past AWS and DS&A):
- Retrofit the animated `rt-ctlbar`/`rt-stage` scenario-walk + live-inspector pattern onto the
  9 existing AWS pages (all have intro cards + code walkthroughs already, just predate the
  newer interaction pattern). `aws-vpc-visualizer.html` is the worst offender — zero
  interactivity today. Priority order: VPC → IAM → Lambda → EC2/ECS/RDS/S3/CloudWatch → Overview.
  Current coverage: **6/15**.
- Same retrofit for the Data Structures & Algorithms pages still on the older SVG/canvas-driven
  interaction style — highest-traffic first: `graph-visualizer.html`, `bst-visualizer.html`,
  `sorting-visualizer.html` (has partial `rt-*` markup already, finish it),
  `ds-dynamic-programming-visualizer.html`. Current coverage: **2/11**.
- `exam-sql.html` (24 Q) doesn't test anything from `sql-postgres-visualizer.html` (JSONB,
  connection pooling, VACUUM) — add a domain once the replication/partitioning pages above are
  registered.
- `exam-aws-developer.html` mislabels its domains against the real DVA-C02 exam guide (uses
  service-based tags instead of Development/Security/Deployment/Troubleshooting) and has no
  real Deployment or Troubleshooting & Optimization coverage — only 24 questions vs the other
  two AWS banks' 37–41.
- `flashcards-bigo.html` has no cards for two-pointer/sliding-window or backtracking once those
  pages exist.

---

## Done — sitewide `rt-ctlbar` retrofit: Java/Interview/Config/Docker/Git/Maven/TypeScript/Spring Boot (completed 2026-08-22)

Closed out the "sitewide `rt-ctlbar` coverage by track prefix" backlog item from the depth-pass
audit below. Every track it flagged as 0% or partial is now at full `rt-ctlbar`/`rt-stage`
scenario-walk + live-inspector coverage (of pages with `intro-head`, i.e. excluding
quiz/flashcard/index pages): Java **18/18**, Interview/DSA-prep **13/13**, Config **11/11**,
Docker **6/6**, Git **5/5** (`git-index.html` correctly excluded, it's a track-landing page not a
concept page), Maven **5/5**, TypeScript **30/30**, Spring Boot **51/51**.

Also fixed a duplicate-DOM-id bug class introduced while retrofitting pages that already had an
older, bespoke, hand-built animated widget predating the `rt-ctlbar` convention: the new hero
markup and the legacy widget used the same short id prefix, so `getElementById` silently bound to
whichever came first in the DOM and broke the other. Fixed by giving the new hero an `x`-suffixed
prefix (`rt`→`rtx`, `dc`→`dcx`, `fn`→`fnx`, `ms`→`msx`, `tg`→`tgx`) on
`spring-boot-refresh-token-rotation-deep-visualizer.html`,
`typescript-decorators-visualizer.html`, `typescript-functions-visualizer.html`,
`typescript-maps-sets-visualizer.html`, and `typescript-type-guards-visualizer.html`, leaving each
page's pre-existing widget untouched. Verified sitewide with a full duplicate-id sweep (no `id="…"`
value repeats anywhere in the diff) and a JS-syntax sweep (every inline `<script>` block parses
clean via `new Function()`) before committing.

AWS (6/15) and Data Structures & Algorithms (2/11) retrofits remain open — see the backlog item
above; they were always tracked separately since they're a bigger lift (older SVG/canvas-driven
pages, not just a missing hero widget).

---

## Done — Debugging track: "Debug Like a Pro" toolbox page (requested 2026-08-20, completed 2026-08-21)

Built `frontend/debugging-pro-toolbox-visualizer.html` and registered it under the Debugging
track's "Technique & Stack Traces" section in `frontend/app.html`, alongside
`debugging-method-visualizer.html`. Covers the professional toolbox the existing three Debugging
pages didn't: `git bisect` as a CLI workflow, conditional breakpoints/watch expressions,
logpoints, correlation-ID/structured logging tied to this codebase's Angular → Spring filter
chain → JDBC request flow, and thread/heap dumps for hangs vs. leaks. Explicitly cross-links to
(rather than re-teaches) `debugging-method-visualizer.html` and
`debugging-logging-vs-stepping-visualizer.html`. Ships the full "extreme visualization" standard:
intro card, a 4-scenario animated `rt-ctlbar`/`rt-stage` walk (git bisect narrowing 50 commits →
conditional breakpoint on iteration 47 → logpoint threading a correlation ID across 3 layers →
thread dump revealing a deadlock), an axis-comparison table, and a `DevHubCodeWalk` line-by-line
walkthrough of a `CorrelationIdFilter`. Page/track counts updated in `README.md` and
`docs/DEVHUB-GUIDE.md` (454 pages / 29 tracks).

---

## Done — Exam quality pass #2: why[] coverage (requested 2026-08-20, completed 2026-08-21)

Bobby's original complaint ("I just picked the choice with the longest amount of text") drove an
earlier fix pass — the length-bracket + plausible-distractor technique documented in
[[project_exam_quality_standard]] and `frontend/tmp_examtell_audit.mjs`. A follow-up audit found
it was only partially applied (5 of 15 banks passing) and that WHY COVERAGE (a per-option `why[]`
shown after answering and in the post-exam review — already fully supported by
`frontend/devhub-quiz.js`, so this was pure content work, zero engine work) was missing on 87% of
all questions across every bank.

All 15 banks now pass `node tmp_examtell_audit.mjs` (run from `frontend/`) clean — 426 questions,
0 egregious flags, no length/position/why-coverage tells anywhere. Re-run that script after any
future edits to an exam bank's `choices`/`answer`/`why` fields to confirm it stays clean.

---

## Done — spot-check "every concept needs 10x more depth" beyond Angular (completed 2026-08-21)

**Verdict: resolved sitewide, not just Angular — closing this out.** Followed up the earlier
Angular-only spot-check (`angular-signals-visualizer.html`,
`angular-directives-visualizer.html`, `angular-pipes-visualizer.html`) with a sitewide grep audit
(intro-card + `DevHubCodeWalk` + `rt-ctlbar` presence per track prefix, ~424 pages) plus a full
read of one page each in Python, Java, and DSA-interview, tracks Bobby never named specifically.

- **Content depth (intro card: lead paragraph + gist bullets + 3 code-example mini-cards + a
  CIAM/job-relevance callout, and a `DevHubCodeWalk` line-by-line walkthrough) is present on
  essentially every conceptual page sitewide** — 90–100% coverage in every track checked
  (Spring Boot, Python, AWS, Docker, Kubernetes, SQL, Go, TypeScript, React, Java, Git, Node,
  Interview/DSA, Config, Maven; only the `exam-*`/`flashcards-*` quiz/drill pages lack them,
  which is correct — they're drills, not concept pages). Read in full:
  `python-fundamentals-visualizer.html` (374 lines — CPython bytecode pipeline, LEGB, refcounting,
  a 5-step `DevHubCodeWalk` with a CIAM callout on JWT-parsing gotchas) and
  `java-records-sealed-visualizer.html` (871 lines — 8 tabs: records, compact constructors,
  sealed hierarchies, exhaustive pattern matching, a click-through hierarchy explorer). Neither
  reads as a thin one-pager; the earlier "10x more depth" complaint doesn't hold sitewide either.
- **What genuinely isn't sitewide is the newer `rt-ctlbar`/`rt-stage` animated scenario-walk +
  live-inspector engine** (the pattern used on Angular and on the new
  `debugging-pro-toolbox-visualizer.html`). Coverage by track: Java 0/18, Interview 0/14,
  Config 0/11, Docker 0/7, Git 0/6, Maven 0/6, DS&A 2/12, AWS 6/16, TypeScript 10/32, Spring Boot
  28/53 — vs. Angular, React, Go, Kubernetes, and Head First Patterns at ~100%. **This is not a
  content gap** — the pages missing it use an older-but-still-real interaction style instead
  (`java-records-sealed-visualizer.html`'s 8-tab click-through demos; `interview-*`'s per-technique
  step-button state machines for two-pointer/sliding-window/prefix-sum/hashmap). It's the same
  "predates the newer interaction pattern" situation already logged for AWS and DS&A below — this
  audit just found it's far more widespread than those two tracks. Folded into that backlog item
  rather than opening a separate one.
