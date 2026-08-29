# DevHub Roadmap

A running todo/future-enhancements list for the Dev Learning Hub (`frontend/app.html`).
This is planning, not documentation of what exists today — see
[DEVHUB-GUIDE.md](DEVHUB-GUIDE.md) for the current, accurate map of tracks and pages.

When an item here gets built: register it in `TRACKS` in `frontend/app.html`, update the
page/track counts in `README.md` and `DEVHUB-GUIDE.md`, then delete the item from this file
(git history keeps the record — this file should only ever describe what's *not* done yet).

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

~~1. Web application security fundamentals — XSS, SQL injection, OWASP Top 10.~~ **DONE
(2026-08-28):** built `appsec-injection-xss-visualizer.html` (reflected/stored/DOM-based XSS +
SQL injection, string concat vs `NamedParameterJdbcTemplate`) and
`appsec-owasp-top10-visualizer.html` (all 10 categories, 5 with a full animated deep-dive),
registered under 🔐 Identity & Auth's new "Web App Security" section.

~~2. No dedicated e2e testing page (Playwright/Cypress).~~ **DONE (2026-08-28):** built
`angular-e2e-playwright-visualizer.html` (Page Object Model, brittle selectors vs auto-waiting,
network mocking, trace-viewer debugging, CI sharding), registered under Angular's Testing section
and cross-linked from `angular-testing-visualizer.html`.

~~3. NoSQL is effectively untaught as its own topic.~~ **DONE (2026-08-28):** built
`nosql-redis-visualizer.html` (data structures, cache-aside with `RedisTemplate`, TTL/eviction,
atomic `INCR` rate-limiting, pub/sub) and `nosql-document-wide-column-visualizer.html` (MongoDB
embedding vs referencing, DynamoDB partition-key hot-spotting, eventual vs strong consistency,
GSIs), both registered in a new "NoSQL" section under the SQL & Databases track and cross-linked
from `spring-boot-caching-visualizer.html` and `system-design-visualizer.html`.

~~4. GraphQL has no dedicated page.~~ **DONE (2026-08-28):** built
`spring-boot-graphql-visualizer.html` (over/under-fetching solved by client-specified shape, the
N+1 resolver trap fixed with Spring's `@BatchMapping`, and a field-level authorization gap as the
CIAM security angle), registered under Spring Boot's APIs & Communication section and cross-linked
from `spring-boot-rest-api-visualizer.html` and `spring-boot-api-design-deep-visualizer.html`.

~~1. Deployment strategy concepts (blue-green, canary, feature flags, GitOps) aren't taught.~~
**DONE (2026-08-28):** built `devops-deployment-strategies-visualizer.html` (blue-green's instant
router-flip rollback, canary with an automated metrics-gated abort, feature flags decoupling
deploy from release, and GitOps' git-as-source-of-truth reconciliation loop, all contrasted
against the rolling-deployment baseline already covered on the Kubernetes/ECS pages), registered
under the ♾️ DevOps & CI/CD track's Delivery section.

~~2. No general, learner-facing "how do you deploy a web app to production" conceptual page.~~
**DONE (2026-08-28):** built `production-deployment-visualizer.html`, a capstone (in the spirit of
`fullstack-request-roundtrip-deep-visualizer.html`) walking 5 real paths end to end — a Spring Boot
API to Kubernetes, an Angular SPA to a CDN with no server at all, an event-driven function to
Lambda, a monolith to a PaaS, and a production incident ending in rollback — tying together the
CI/CD, Docker, Kubernetes/cloud, and Deployment Strategies pages instead of adding more fragmented
content. Registered under Full-Stack Stacks' Putting It Together section.

~~3. gRPC is Go-only.~~ **DONE (2026-08-28):** built `spring-boot-grpc-visualizer.html` (the
`.proto` contract-as-code, all four RPC shapes — unary/server-stream/client-stream/bidi-stream —
and a metadata-based JWT auth interceptor as the CIAM angle, contrasted against REST and GraphQL),
registered under Spring Boot's APIs & Communication section and cross-linked from
`go-grpc-visualizer.html`.

1. **GCP has zero coverage** (AWS: 16 pages, Azure: 7 pages, GCP: 0). Explicitly **not** a near-term
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
- ~~Retrofit the animated `rt-ctlbar`/`rt-stage` scenario-walk + live-inspector pattern onto the
  AWS pages~~ — **DONE, 15/15 (2026-08-27).** `aws-vpc-visualizer.html` (was the worst offender —
  zero interactivity before this), `aws-ec2-visualizer.html`, `aws-ecs-visualizer.html`,
  `aws-s3-visualizer.html`, `aws-iam-visualizer.html`, `aws-lambda-visualizer.html`,
  `aws-rds-visualizer.html`, `aws-cloudwatch-visualizer.html`, `aws-overview-visualizer.html` all
  finished this pass, joining the 6 pages the earlier depth pass already covered
  (`aws-api-gateway-visualizer.html`, `aws-load-balancing-visualizer.html`,
  `aws-compute-decision-visualizer.html`, `aws-storage-deep-visualizer.html`,
  `aws-iac-visualizer.html`, `aws-cost-visualizer.html`). Every AWS page now has the full
  scenario-walk + live-inspector treatment — nothing left to retrofit in this track.
- ~~Same retrofit for the Data Structures & Algorithms pages still on the older SVG/canvas-driven
  interaction style~~ — **DONE, 20/20 (2026-08-27).** `graph-visualizer.html`,
  `linked-list-visualizer.html`, `big-o-visualizer.html` (plus `sorting-visualizer.html`,
  `ds-two-pointer-sliding-window-visualizer.html`, `ds-backtracking-visualizer.html` already had
  it) finished the earlier pass; this pass added `bst-visualizer.html`,
  `stack-queue-visualizer.html`, `hashmap-visualizer.html`, `searching-visualizer.html`,
  `recursion-visualizer.html`, `ds-dynamic-programming-visualizer.html`,
  `ds-arrays-visualizer.html`, `ds-linked-lists-visualizer.html`, `ds-trees-visualizer.html`,
  `ds-hash-tables-visualizer.html`, `ds-heaps-visualizer.html`, `ds-tries-visualizer.html`,
  `ds-graphs-advanced-visualizer.html`, and `ds-disjoint-sets-visualizer.html`. Every DS&A page now
  has the full scenario-walk + live-inspector treatment — nothing left to retrofit in this track.
~~`exam-sql.html` doesn't test anything from `sql-postgres-visualizer.html`/replication/
partitioning~~ — **DONE (2026-08-28).** Added a PostgreSQL Internals & Scale domain (JSONB,
VACUUM/MVCC, PgBouncer connection pooling, async/sync replication failover risk, partition
pruning, shard-key selection) — 24 Q → 30 Q, registered in `quiz-banks.js`.

~~`exam-aws-developer.html` mislabels its domains against the real DVA-C02 exam guide~~ —
**DONE (2026-08-28).** Relabeled into the exam guide's real four domains (Development with AWS
Services, Security, Deployment, Troubleshooting and Optimization) and added DynamoDB, API
Gateway, CloudFormation/CDK, deployment-strategy, Lambda Layers, and cost-optimization questions
to fill the previously-empty Deployment and Troubleshooting domains — 24 Q → 40 Q, registered in
`quiz-banks.js`.

~~`flashcards-bigo.html` has no cards for two-pointer/sliding-window or backtracking~~ — **DONE
(2026-08-28).** Added 5 cards covering converging two pointers, variable/fixed sliding windows,
3Sum, and backtracking's pruned-but-still-exponential complexity.

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

AWS (15/15, done 2026-08-27) and Data Structures & Algorithms (20/20, done 2026-08-27) retrofits
have since closed out — see the backlog item above; they were always tracked separately since
they're a bigger lift (older SVG/canvas-driven pages, not just a missing hero widget).

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
  rather than opening a separate one. (Historical snapshot as of 2026-08-21 — AWS and DS&A have
  since both closed to 100%, see the "Done — sitewide `rt-ctlbar` retrofit" entries above.)
