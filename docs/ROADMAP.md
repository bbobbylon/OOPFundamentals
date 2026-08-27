# DevHub Roadmap

A running todo/future-enhancements list for the Dev Learning Hub (`frontend/app.html`).
This is planning, not documentation of what exists today — see
[DEVHUB-GUIDE.md](DEVHUB-GUIDE.md) for the current, accurate map of tracks and pages.

When an item here gets built: register it in `TRACKS` in `frontend/app.html`, update the
page/track counts in `README.md` and `DEVHUB-GUIDE.md`, then delete the item from this file
(git history keeps the record — this file should only ever describe what's *not* done yet).

---

## NEXT UP — Personal Notebook feature (requested 2026-08-22; research + spec completed 2026-08-27, build not started)

Bobby wants a **personal notebook** users can build as they go: a "quick add" action on any
concept or lesson section that saves it into the user's own notebook, so they can curate a
focused study set (knowledge hardening, exam prep, whatever they want to drill). The notebook
should be **pre-sectioned to mirror the site's own lesson/track navigation** — same tracks,
same sections — so finding your saved notes feels exactly like finding the original lesson, just
filtered to what you picked.

Bobby's bar, verbatim: build **evidence-based study science** into the notebook, not just
storage — techniques backed by real, published, graduate/doctoral-level cognitive-science
research, not folk wisdom. The research below resolves that requirement with real citations. No
code has been written yet — this is the spec a future build session should implement against.

### Research verdict per technique (2026-08-27)

- **Spacing effect / spaced repetition — STRONG evidence, build it.** Cepeda, Pashler, Vul,
  Wixted & Rohrer (2006), *Distributed Practice in Verbal Recall Tasks: A Review and Quantitative
  Synthesis*, Psychological Bulletin 132(3) — a meta-analysis of 317 experiments (839
  assessments) confirms distributed practice beats massed practice, and that the optimal gap
  between reviews grows as the desired retention interval grows (the mechanical basis for
  Leitner-style expanding intervals). This app already has a real implementation: the Leitner
  5-box engine in `frontend/devhub-flashcards.js`. Extend it to notebook content rather than
  building a second spacing engine.
- **Retrieval practice / testing effect — STRONG evidence, build it.** Roediger & Karpicke
  (2006), *The Power of Testing Memory: Basic Research and Implications for Educational
  Practice*, Perspectives on Psychological Science 1(3) — repeated testing produced
  significantly better long-term (days/weeks later) retention than an equal number of restudy
  passes, even though restudying felt more effective in the short term (subjects
  under-predicted testing's benefit). `frontend/devhub-quiz.js` already implements this; the
  notebook's job is to route saved entries into quiz-style self-testing, not re-reading.
- **Interleaving — MODERATE-STRONG evidence for skills/problem-solving, weaker for pure fact
  recall — build it, but scope it correctly.** Taylor & Rohrer (2010), *The Effects of
  Interleaved Practice*, Applied Cognitive Psychology, and Rohrer, Dedrick & Stershic (2015),
  *Interleaved Practice Improves Mathematics Learning*, J. Educational Psychology — interleaved
  math practice roughly doubled scores on a delayed test versus blocked practice, because
  interleaving forces learners to discriminate *which method applies*, not just execute a method
  they already know is coming next. This maps directly onto coding-interview/DSA prep (mixing
  two-pointer/DP/graph problems in one session beats blocking one technique at a time) more
  cleanly than it maps onto e.g. vocabulary-style fact recall, where the evidence is thinner. Verdict:
  **prioritize interleaving in the Exam Prep / DSA-interview notebook flow**, not as a blanket
  mode for every notebook category.
- **Dual coding — MODERATE evidence, conditional — preserve it, don't force new visuals.**
  Paivio's dual-coding theory plus Mayer & Sweller's operationalization: pairing words and
  pictures helps only when the two are conceptually coherent, temporally aligned, and not
  redundant/cognitively overloading (i.e., dual coding is not "add any picture," it's "the
  image and text jointly do explanatory work"). This app's visualizer format (live inspector +
  code walkthrough) already satisfies that description. Verdict for the notebook: **a quick-add
  must capture a link back to the exact page+anchor (so the original diagram/inspector is always
  one click away), never just a text snapshot** — reducing an entry to plain text would strip the
  half of dual coding that makes this app's format effective in the first place.
- **Desirable difficulties — MIXED, and this is where Bobby's specific color/emphasis question
  gets a real answer.** Bjork & Bjork's framework (see Bjork & Bjork, 2020, *Desirable
  Difficulties in Theory and Practice*) names testing, spacing, interleaving, and generation
  (self-producing an answer vs. being shown it) as the manipulations with real evidence behind
  them — all already covered above. **Highlighting/underlining and other passive presentation
  aids are NOT on that list and do not have supporting evidence**: Dunlosky, Rawson, Marsh,
  Nathan & Willingham (2013), *Improving Students' Learning With Effective Learning Techniques*,
  Psychological Science in the Public Interest 14(1) — the single most authoritative utility
  review in this space — rated **highlighting and rereading as LOW utility**, explicitly because
  their effects are consistently inferior to techniques like spaced retrieval practice in direct
  comparisons. There is no equivalent published evidence that color-coding or text-size/emphasis
  *by themselves* improve encoding or retention — that claim doesn't have a citation to stand on.
  Also worth noting Sweller-line caution (Ashman, Kalyuga & Sweller, PMC6099118): under
  high-element-interactivity material (a lot of this app's content, e.g. multi-part system
  design), *adding* difficulty can become undesirable by overloading working memory rather than
  strengthening retrieval. **Verdict: do NOT build color/emphasis-as-encoding-aid as a study
  technique.** Colors/badges can stay as pure visual-hierarchy/navigation aids (which is all
  they're doing anywhere else in this app already) but should not be marketed or designed as a
  memory technique in the notebook UI — that would be building something because it sounds
  plausible, which is exactly what Bobby asked not to do.
- **Optimal session length / distributed-practice scheduling — folded into the spacing-effect
  citation above; no separate technique to build.** Cepeda et al. (2006) is also the source here:
  there's no single "ideal minutes per session" number in the literature independent of spacing —
  the finding is about interstudy interval relative to desired retention interval, which the
  Leitner box intervals already encode structurally.

### Build proposal (design only — implement in a future session)

1. **Build order:** (1) reuse/extend `devhub-flashcards.js`'s Leitner engine to accept
   notebook-sourced cards — this is the highest-leverage, already-half-built piece (spacing +
   retrieval practice in one). (2) Route notebook entries into `devhub-quiz.js`-style
   self-test prompts (retrieval practice standalone, for entries that aren't naturally
   flashcard-shaped). (3) An "interleaved review" session mode specifically for Exam
   Prep/DSA-interview notebook entries that shuffles across saved topics instead of grouping by
   track — this is the one new engine concept, and it's the one with the strongest topic-specific
   evidence (Rohrer/Taylor). Do NOT build a "color/highlight to remember better" feature at all.
2. **Quick-add capture:** at minimum a link back to page + a stable in-page anchor id (so dual
   coding is preserved — the saved entry always re-opens the original visual, never just text).
   Optionally also snapshot the visible text (title + lead sentence) purely for the notebook's
   own list-view rendering/search, but the anchor link is the canonical "content," not the
   snapshot.
3. **Affordance placement:** put "+ Notebook" as a small button on **section headings** (`<h2>`
   before each major concept block) sitewide, matching the granularity users already navigate by
   in the sidebar/TRACKS structure — NOT per code-walkthrough step (too granular, would produce
   dozens of near-duplicate entries per page and fight the "mirrors site navigation" requirement)
   and NOT per intro card (too coarse, only one add per whole page). This keeps one consistent,
   sitewide, `rt-ctlbar`-style affordance rather than a bespoke widget per page type.
4. **Storage:** localStorage, confirmed — matches the existing quiz-attempt-history and Leitner
   box-state pattern in `devhub-quiz.js`/`devhub-flashcards.js`, and this app is still a pure
   static frontend with no user-accounts system to persist against.
5. **`notebook.html` shape:** track-sectioned to exactly mirror `TRACKS` (same track → section
   grouping as the sidebar accordion), each entry showing its title + a "Learn more →" jump back
   to page+anchor (the same `dlh-navigate` postMessage pattern already used by
   `devhub-quiz.js`), plus entry points into the three review modes from item 1 (flashcards /
   quiz-style retrieval / interleaved session) scoped to whatever the user has currently
   selected/filtered.

Sources: [Cepeda et al. 2006](https://www.yorku.ca/ncepeda/publications/CPVWR2006.html) ·
[Roediger & Karpicke 2006](https://journals.sagepub.com/doi/10.1111/j.1467-9280.2006.01693.x) ·
[Taylor & Rohrer 2010](https://digitalcommons.usf.edu/psy_facpub/1760/) ·
[Rohrer et al. 2015](http://uweb.cas.usf.edu/~drohrer/pdfs/Rohrer_et_al_2015JEdPsych.pdf) ·
[Dunlosky et al. 2013](https://journals.sagepub.com/doi/10.1177/1529100612453266) ·
[Bjork & Bjork 2020](https://www.waddesdonschool.com/wp-content/uploads/2021/02/Desriable-Difficulties-in-theory-and-practice-Bjork-Bjork-2020.pdf) ·
[Ashman, Kalyuga & Sweller (undesirable difficulty caveat)](https://pmc.ncbi.nlm.nih.gov/articles/PMC6099118)

---

## Done — audit (not built) — sitewide depth audit against "zero to hired" goal (completed 2026-08-27)

**Verdict: the full-stack-lifecycle bar is met better than expected in most named categories —
API design/REST, CI/CD & IaC, testing-per-language, and system design are all genuinely deep —
but there are a handful of real, specific holes, plus two categories (general web-app security,
NoSQL) that are close to zero coverage rather than just thin.** This is an audit only — nothing
below is built yet. Checked via `docs/DEVHUB-GUIDE.md` + a sitewide filename/content grep across
`frontend/*.html` against the actual `TRACKS` array in `frontend/app.html` (not just doc counts).

**What's already solid (don't re-audit, just confirmed present):** `spring-boot-testing-visualizer.html`
already teaches the full test pyramid (unit/Mockito → slice `@WebMvcTest`/`@DataJpaTest` →
integration `@SpringBootTest`+Testcontainers, with the classic 70/20/10 ratio) plus per-language
unit testing (`angular-testing`, `angular-vitest`, `go-testing`, `python-pytest`, `react-testing`).
`system-design-visualizer.html` (724 lines) already covers load balancers (algorithms/health
checks/L4 vs L7), caching (cache-aside/write-through/write-behind/eviction), sharding &
replication, consistent hashing, CAP theorem, message queues (Kafka/RabbitMQ/SQS), rate limiting,
CDNs, and monolith-vs-microservices — this is genuinely elite-CS-program depth already.
`spring-boot-api-design-deep-visualizer.html` covers idempotency + URL versioning;
`spring-boot-rate-limiting-deep-visualizer.html` and `spring-boot-openapi-visualizer.html` exist
separately. `spring-boot-observability-deep-visualizer.html` covers the three pillars, Micrometer
meter types, Prometheus/PromQL, and distributed tracing (TraceId/SpanId, B3 vs W3C headers,
sampling) — deep, though Spring/Java-flavored rather than vendor-neutral. `spring-boot-flyway-visualizer.html`
teaches schema migration tooling as a concept even though this app's own backend deliberately
doesn't use Flyway (see the scaffold recipe) — that's correctly treated as a "what to teach"
decision separate from "what this app uses."

**Real gaps found, in priority order:**
1. **Web application security fundamentals — XSS, SQL injection, and the OWASP Top 10 have
   essentially zero dedicated coverage.** `spring-boot-csrf-deep-visualizer.html` exists, but
   nothing teaches XSS (reflected/stored/DOM-based), SQL injection (and why JDBC named params /
   JPA already prevent it — ties directly into this app's own `NamedParameterJdbcTemplate`
   pattern), or the OWASP Top 10 as a checklist. Given this app's own security posture (JWT auth,
   CIAM focus) and the "elite CS program" bar, this is the highest-priority gap. Suggested home:
   a new page (or 2: one XSS/CSRF/injection-attacks page, one OWASP-Top-10-checklist page) under
   the 🔐 Identity & Auth track (it already covers the auth-specific half of appsec — JWTs, OAuth,
   claims — this fills the general-appsec half) or as a new Debugging-track entry alongside the
   existing `debugging-*` diagnosers.
2. **No dedicated e2e testing page (Playwright/Cypress).** The test-pyramid diagram in
   `spring-boot-testing-visualizer.html` labels the top tier "E2E / Integration Tests" but no page
   actually teaches writing one — selectors, page-object model, flaky-test handling, CI
   integration. `Playwright`/`Cypress` appear only in passing (`config-package-json*`,
   `angular-cli-project`). Suggested home: a new page in the Angular or React track's testing
   section (e.g. `angular-e2e-playwright-visualizer.html`), cross-linked from
   `angular-testing-visualizer.html`.
3. **NoSQL is effectively untaught as its own topic.** The only NoSQL content sitewide is the
   "SQL vs NoSQL — the real difference" section inside `system-design-visualizer.html` — there's
   no hands-on page for a document store, key-value/cache store, or wide-column store the way the
   🗄️ SQL & Databases track covers relational depth. Suggested: a new "NoSQL" section in that
   track — a Redis (cache/key-value) page and a DynamoDB-or-MongoDB (document/wide-column) page,
   contrasting schema-on-write vs schema-on-read and consistency trade-offs against what the SQL
   pages already teach.
4. **GraphQL has no dedicated page.** It's mentioned only in passing inside 3 unrelated pages
   (`angular-custom-form-controls`, `react-server-components`, `typescript-fundamentals`) despite
   REST being taught in real depth. Suggested: one page contrasting GraphQL (single endpoint,
   client-specified shape, N+1 risk, schema/resolvers) against the REST pages already built —
   natural home is Spring Boot's API section or a new cross-cutting page.
5. **Deployment strategy concepts (blue-green, canary, feature flags, GitOps) aren't taught.**
   Rolling deployment IS covered (ECS + Kubernetes deployment pages), but the alternative
   strategies and why teams pick one aren't. Suggested: extend the ♾️ DevOps & CI/CD track with
   one more page.
6. **No general, learner-facing "how do you deploy a web app to production" conceptual page.**
   `docs/DEPLOYMENT.md` documents deploying *this specific app*, which is not the same as teaching
   the concept — though the concept is already distributed across the CI/CD, Docker, Kubernetes,
   and cloud tracks, so this is lower priority than it looks; a capstone page tying those together
   (similar in spirit to `fullstack-request-roundtrip-deep-visualizer.html` for the CIAM auth
   thread) would close it rather than new fragmented content.
7. **gRPC is Go-only** (`go-grpc-visualizer.html`) — no vendor-neutral or Spring-side gRPC
   coverage. Lower priority; the protocol concepts mostly transfer from the Go page already.
8. **GCP has zero coverage** (AWS: 16 pages, Azure: 7 pages, GCP: 0). Explicitly **not** a near-term
   priority — matches Bobby's own stated phasing in the "Longer-term expansion" note below
   (entry-level AWS/Azure/Angular first, broaden later); flagged here only so it isn't forgotten.

**Longer-term expansion (unchanged from the original ask, not immediate):** grow beyond software
development into every IT field — AI, Data Science, Software Dev, DevOps, and whatever else. Add
practice exams/study guides for certificates, scoped to **entry-level certs only** (e.g. AWS,
Claude Code, Angular) — the full universe of certs is too large to chase, and entry-level is where
a zero-experience learner actually needs the on-ramp. **Mid- and senior-level certs are an
explicitly later phase.**

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
  existing AWS pages (all have intro cards + code walkthroughs already, just predate the
  newer interaction pattern). Done this pass (2026-08-27): `aws-vpc-visualizer.html` (was the
  worst offender — zero interactivity before this), `aws-ec2-visualizer.html`,
  `aws-ecs-visualizer.html`, `aws-s3-visualizer.html`. Current coverage: **10/15**
  (`aws-api-gateway-visualizer.html`, `aws-load-balancing-visualizer.html`,
  `aws-compute-decision-visualizer.html`, `aws-storage-deep-visualizer.html`,
  `aws-iac-visualizer.html`, `aws-cost-visualizer.html` already had it from the depth pass
  above). Remaining, in priority order: IAM → Lambda → RDS → CloudWatch → Overview
  (`aws-iam-visualizer.html`, `aws-lambda-visualizer.html`, `aws-rds-visualizer.html`,
  `aws-cloudwatch-visualizer.html`, `aws-overview-visualizer.html`).
- Same retrofit for the Data Structures & Algorithms pages still on the older SVG/canvas-driven
  interaction style. Done this pass (2026-08-27): `graph-visualizer.html`,
  `linked-list-visualizer.html`, `big-o-visualizer.html` (plus `sorting-visualizer.html`,
  `ds-two-pointer-sliding-window-visualizer.html`, `ds-backtracking-visualizer.html` already had
  it). Current coverage: **6/20**. Remaining, highest-traffic first: `bst-visualizer.html`,
  `stack-queue-visualizer.html`, `hashmap-visualizer.html`, `searching-visualizer.html`,
  `recursion-visualizer.html`, `ds-dynamic-programming-visualizer.html`, plus
  `ds-arrays-visualizer.html`, `ds-linked-lists-visualizer.html`, `ds-trees-visualizer.html`,
  `ds-hash-tables-visualizer.html`, `ds-heaps-visualizer.html`, `ds-tries-visualizer.html`,
  `ds-graphs-advanced-visualizer.html`, `ds-disjoint-sets-visualizer.html`.
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
