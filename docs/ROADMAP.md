# DevHub Roadmap

A running todo/future-enhancements list for the Dev Learning Hub (`frontend/app.html`).
This is planning, not documentation of what exists today — see
[DEVHUB-GUIDE.md](DEVHUB-GUIDE.md) for the current, accurate map of tracks and pages.

When an item here gets built: register it in `TRACKS` in `frontend/app.html`, update the
page/track counts in `README.md` and `DEVHUB-GUIDE.md`, then delete the item from this file
(git history keeps the record — this file should only ever describe what's *not* done yet).

---

## Coding Practice Exercises (in-page IDE) — Phase 1 pilot LANDED (2026-08-29)

**The gap:** every existing track teaches *concepts* (visualizers, walkthroughs, quizzes,
flashcards) but nothing grades a learner's own code against test cases the way LeetCode/
HackerRank/Exercism do. The `interview-*-visualizer.html` pages (arrays-strings, linked-lists,
trees, graphs, sorting-searching, hashmaps-sets, stacks-queues, system-design) are conceptual
walkthroughs with step-button state machines — not a code editor, not a test runner, no
pass/fail grading. This was the single biggest "am I job-ready" gap left in the app: reading
about two-pointer technique isn't the same as being handed an empty function and a hidden test
suite and having to make it pass, under a clock.

**What shipped (Phase 1):**
- `devhub-codegrade.js` — new shared grading engine (`DevHubCodeGrade.render(rootEl, bank)`,
  same shape as `devhub-quiz.js`/`devhub-flashcards.js`). Runs real JavaScript and TypeScript
  (sandboxed `<iframe sandbox="allow-scripts">` + `postMessage`, dynamic `import()` of a Blob
  URL, kill-timer for infinite loops, deep-equal + unordered-array comparison) and real Python
  (Pyodide/WASM CPython). No CodeMirror dependency — reused the existing textarea+gutter editor
  pattern from the playground pages instead. Per-exercise hints, difficulty/domain chips, a link
  back to the matching `interview-*-visualizer.html` technique walkthrough, and localStorage
  progress tracking (`dlh-codegrade:<id>`) exactly like quizzes/flashcards. The engine also
  supports "design a data structure" problems (Min Stack, Queue using Stacks) by grading a
  replayed operation log (`ops` + parallel `argsList` → an array of per-op results) instead of a
  single pure function call — no engine changes needed beyond how the exercise bank shapes its
  test cases.
- Nine topics now live, 54 exercises total, all gradable in JS, TS, and Python:
  - `practice-arrays-strings.html` — Two Sum, Contains Duplicate, Valid Anagram, Best Time to
    Buy/Sell Stock, Valid Palindrome, Longest Substring Without Repeating Characters.
  - `practice-stacks-queues.html` — Valid Parentheses, Min Stack (Design), Daily Temperatures,
    Evaluate Reverse Polish Notation, Implement Queue using Stacks, Sliding Window Maximum.
  - `practice-sorting-searching.html` — Binary Search, Merge Two Sorted Arrays, Find Minimum in
    Rotated Sorted Array, Search in Rotated Sorted Array, Kth Largest Element, Merge Intervals.
  - `practice-dynamic-programming.html` — Climbing Stairs, House Robber, Coin Change, Longest
    Increasing Subsequence, Maximum Subarray (Kadane's), Unique Paths (2D grid DP).
  - `practice-linked-lists.html` — Reverse Linked List, Merge Two Sorted Lists, Linked List
    Cycle, Remove Nth Node From End of List, Middle of the Linked List, Add Two Numbers.
  - `practice-trees.html` — Maximum Depth of Binary Tree, Invert Binary Tree, Same Tree,
    Validate Binary Search Tree, Binary Tree Level Order Traversal, Lowest Common Ancestor of
    a BST.
  - `practice-graphs.html` — Number of Islands (grid DFS), Course Schedule (cycle detection),
    Number of Connected Components (Union-Find), Rotting Oranges (multi-source BFS), Graph
    Valid Tree (edge-count + Union-Find), Is Graph Bipartite? (2-coloring BFS). Confirmed no new
    shape adapter was needed — grids/edge-lists/adjacency-lists are already plain arrays/objects.
  - `practice-hashmaps-sets.html` — Top K Frequent Elements (with a stated value-ascending
    tie-break so the grader stays deterministic), First Unique Character in a String, Subarray
    Sum Equals K (prefix-sum + map), Longest Consecutive Sequence (O(n) via Set), Isomorphic
    Strings (bidirectional map), Contains Duplicate II (sliding-window map). No shape adapter
    needed either.
  - `practice-backtracking.html` — Subsets and Combinations (both with a stated "elements stay
    in original input order within each result" convention layered on the engine's `unordered:
    true` per-test flag, since different valid backtracking traversals could otherwise produce
    the same subset/combination with different internal ordering), Permutations and Letter
    Combinations of a Phone Number (safe as-is with `unordered: true` — every valid output is
    already a uniquely fixed sequence), Word Search (single boolean, grid DFS + undo), N-Queens
    (returns the solution *count* only, not the boards, to sidestep canonicalizing equivalent
    layouts). No shape adapter needed.
  - Every exercise's expected test values were independently verified against a reference
    solution in Node before shipping (not just hand-traced), and each new page was smoke-tested
    live in-browser (JS, TS, Python, and the ops-replay/shape-adapter patterns all confirmed
    passing, including a deliberate wrong-answer case to check failure rendering).
- **Solved the Linked Lists node-representation question** (previously flagged as needing a real
  design decision) by adding optional `argShapes`/`resultShape` adapters to `devhub-codegrade.js`.
  An exercise can now declare e.g. `argShapes: ['list']`, `resultShape: 'list'`: the engine
  converts a plain test-data array into a real `{ val, next }` node chain before calling the
  user's function, and converts a returned chain back into a plain array before comparing —
  so exercise data stays plain JSON while the user's own code does real pointer manipulation on
  real node objects, matching the actual interview signature (`function reverseList(head)`, not
  an array-shortcut version). A `'list-with-cycle'` input shape (built from a `{values, pos}`
  spec) supports cycle-detection problems without ever needing to serialize a cyclic structure.
  Per-language node representation was chosen to fit each language's idioms with zero risk of
  the "user code redeclares a class the harness also declares" conflict: JS uses plain
  `{ val, next }` object literals (no class needed — duck typing), TypeScript uses a type-only
  `interface ListNode` in the starter (erased at transpile time, so it can't collide with
  anything), and Python gets a real `class ListNode` in the starter (redefinition is harmless in
  Python, unlike JS's ES-module scoping). The same mechanism now also has a `'tree'` shape
  (LeetCode's standard level-order array with `null` gaps ⇄ a real `{ val, left, right }`
  structure, BFS-built/BFS-serialized, trailing nulls trimmed on output), used by
  `practice-trees.html`. Both round-trip converters were verified against known-correct
  encodings in Node (not just eyeballed) before shipping.
- "Coding Practice (IDE)" track in `tracks-data.js` (9 pages), under the "Practice & Prep"
  sidebar category in `app.html`.
- Deliberately 100% client-side/offline for Phase 1 — the existing server-side sandboxed
  `/api/run/*` execution backend (`ExecutionService.java`, JAVA/TYPESCRIPT/SHELL via
  `Language.java`) was evaluated but intentionally NOT used, to keep this feature dependency-free
  like the rest of the site.

**What's still open / not built:**
- All planned DSA topics with a natural JS/TS/Python fit are now covered (Arrays & Strings,
  Linked Lists, Trees, Graphs, Stacks & Queues, Hashmaps & Sets, Sorting & Searching, Dynamic
  Programming, Backtracking). Remaining `interview-*-visualizer.html` topics (System Design,
  Spring/Angular Q&A, Java-specific OOP/Concurrency) aren't natural fits for a graded-function
  format and would need a different exercise shape if ever tackled.
- **Open architectural question, unchanged — surface to Bobby before deciding:** Java/C#/Go/Rust/
  PHP/Ruby have no real in-browser runtime in this repo. Either a WASM JVM/etc. (CheerpJ, TeaVM)
  or reusing the existing `/api/run/*` backend (adding a `JAVA` case to `Language.java`) is a real
  new-infra decision (sandboxing, resource/timeout limits, hosting cost) and should not be taken
  on silently.

**What already exists to build on** (real execution engines, not simulations):
- `python-playground-visualizer.html` — real CPython 3.12 via Pyodide (WASM), stdout captured.
- `typescript-playground-visualizer.html` — the real `typescript` package compiling in-browser
  (actual type errors, actual emitted JS, actually run).
- `shell-playground-visualizer.html` — an in-memory mini-shell (Bash/PowerShell/CMD modes).
- `sql-playground-visualizer.html`, `spring-boot-playground-visualizer.html`, `api-playground-visualizer.html`,
  `jwt-playground-visualizer.html` — topic-scoped sandboxes, worth checking each for reusable
  execution/grading plumbing before writing new engine code.
- None of these are LeetCode-style yet: they're free-form REPLs with preset buttons, not
  "here's a spec + hidden tests + a pass/fail bar."

**Open architectural question — how far execution can reasonably go:**
- **JS/TS/Python are cheap** — real, already-proven in-browser engines exist in this repo today.
  A grading harness (user function + hidden `assert`/`expect`-style test cases + pass/fail per
  case + diff on failure) is realistic to build with **zero new infra** — same offline,
  no-server, no-build-step model as every other page.
- **Java/C#/Go/Rust/PHP/Ruby are the hard case.** No real in-browser runtime for these exists
  in this repo (WASM JVMs like CheerpJ/TeaVM, or a server-side sandboxed execution service like
  Judge0, are the only real options) — either is a genuine new-infra decision (security
  sandboxing, resource/timeout limits, hosting cost) and should NOT be taken on silently; surface
  it to Bobby explicitly before building rather than picking a direction here.
- **Recommended phased approach:** Phase 1 — JS, TS, and Python exercises only, reusing the
  existing Pyodide/TS-compiler engines, a lightweight in-browser code editor (CodeMirror 6 via
  CDN — same "CDN dependency accepted for real engines" precedent as Pyodide), and a small
  dependency-free grading widget (`devhub-codegrade.js`, mirroring the `devhub-quiz.js` /
  `devhub-flashcards.js` shape: call `.render(rootEl, exerciseBank)`). Track progress the same way
  quiz/flashcard history is tracked (localStorage + the existing progress-sync backend hook).
  Phase 2 (later, explicitly gated on a Bobby decision) — real execution for compiled/typed
  languages once the WASM-runtime-vs-backend-sandbox tradeoff is decided.

**Not started. Next session: scope Phase 1 concretely (how many exercises, which DSA topics
first, editor library choice) before writing any code.**

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

~~1. GCP has zero coverage (AWS: 16 pages, Azure: 7 pages, GCP: 0).~~ **DONE (2026-08-28):** built
the full 🟢 Cloud — GCP track (7 pages: `gcp-overview-visualizer.html` — projects, resource
hierarchy & IAM; `gcp-compute-engine-visualizer.html` — instance templates & MIGs; `gcp-gke-visualizer.html`;
`gcp-serverless-visualizer.html` — Cloud Run & Functions; `gcp-storage-visualizer.html`;
`gcp-databases-visualizer.html` — Cloud SQL/Firestore/BigQuery; `gcp-iam-secrets-visualizer.html` —
service account impersonation, Secret Manager & Workload Identity Federation), registered in
`tracks-data.js` mirroring the Azure track's exact section shape (Foundations×1, Compute×3,
Data & Storage×2, Security×1). Also added `exam-gcp-ace.html` (28-question Associate Cloud Engineer
practice exam, length-bracketed per the quality standard — 7/7/7/7 answer-position distribution,
0/28 "longest choice is correct" bias), `flashcards-gcp.html` (30-card deck), and a GCP capstone
entry in `learning-paths.html`, all registered in `quiz-banks.js` / `tracks-data.js`.

**Longer-term expansion — "zero to hero" gap closure, DONE (2026-08-28):** grow beyond software
development into every IT field — AI, Data Science, Software Dev, DevOps, and whatever else — per
Bobby's "zero to hero / zero to full-stack / zero to data or AI dev" directive. Three new tracks
built and fully registered (pages, exam, flashcard deck, learning path):

- **🌐 Web Fundamentals** (7 pages) — the true zero-starting-point before Angular/React/TypeScript:
  HTML structure/forms/a11y, CSS box model/specificity, Flexbox & Grid, JS fundamentals/closures,
  the DOM & events, async JS (Promises/async-await/fetch), and how browsers actually render a page.
  `exam-web-fundamentals.html` (26 Q), `flashcards-web-fundamentals.html` (26 cards).
- **📊 Data Science & ML** (9 pages) — NumPy/pandas, data cleaning & EDA, visualization, ML
  fundamentals (bias-variance), regression/classification, model evaluation, clustering/PCA, and
  neural networks/PyTorch. `exam-data-science.html` (30 Q, quality-audited via
  `tmp_examtell_audit.mjs` — first draft failed on answer-length bias, fixed and re-audited clean),
  `flashcards-data-science.html` (30 cards).
- **🧠 AI / LLM Engineering** (9 pages) — transformers & attention, how LLMs work (tokenization/
  sampling), prompt engineering, embeddings & vector databases, RAG, tool-calling agents, LLM API
  integration, fine-tuning vs RAG vs prompting & LLMOps, and AI safety/guardrails (prompt injection,
  jailbreaks, PII handling — treated with the same rigor as `appsec-injection-xss-visualizer.html`).
  `exam-ai-engineering.html` (28 Q, quality-audited via `tmp_examtell_audit.mjs` — first draft
  failed badly, correct answer was the longest choice in 89% of questions; rewrote choice text
  across nearly every question and re-audited clean), `flashcards-ai-engineering.html` (28 cards).

All three registered in `tracks-data.js`, `app.html`'s `CATEGORIES` (new "Data & AI" group),
`devhub.css` (theme accents), `quiz-banks.js`, and `learning-paths.html`. Site now stands at
**498 pages / 33 tracks / 19 exams (560 Q) / 16 flashcard decks (459 cards) / 19 learning paths**.
Certs remain scoped to **entry-level only** — mid/senior-level certs are an explicitly later phase.

**Next up:** a sitewide cleanup/depth-audit pass on existing shallow content (task queued, not yet
started), then the previously-queued AWS deployment boilerplate work.

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
