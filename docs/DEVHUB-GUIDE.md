
# DevHub — a Guided Tour

> **New here? Don't try to read all 515 pages.** Pick a *path* below and follow it.
>
> **Contributors:** 102 of them are now authored to the nine-point teaching bar in
> `CLAUDE.md`; the rest carry the design but not yet the rhythm. Run
> `node frontend/tmp_hfaudit.mjs --top=20` for the current worklist, and read the
> caveat on that tool below before you act on its ranking.
> Every page is a single, self-contained interactive visualizer — open it, press the
> button, watch the concept animate. No build step, no account required.

DevHub is a learning hub: **515 browser visualizers** across **34 tracks** (grouped into
categories in the sidebar — Languages & Concepts, Frontend, Backend & APIs, DevOps/Cloud & Data, Practice & Prep; several tracks also have a 🍳 **Common Recipes** section of practical how-tos — API→form, batch upload, password complexity), plus a
small Spring Boot backend that adds optional accounts + progress sync. This guide is
the map. To *run* it (locally or deployed), see the main [README](../README.md); for a
copy-paste **command-line runbook** (build/run, the auth round-trip via curl, and
deployment troubleshooting), see [HELP.md](../HELP.md#command-line-runbook). For the
**architecture, data flows, and diagrams** (C4 + a sequence diagram per use case), see
[ARCHITECTURE.md](ARCHITECTURE.md). For **what's planned but not built yet** — new pages,
content gaps found by audits, polish passes — see [ROADMAP.md](ROADMAP.md).

**Quick-start options** (all from the project root):

| Command | What you get |
|---|---|
| `./startapp.sh` | Spring Boot (`:8081`) + Python dev-server (`:5500`). Fastest for local dev — no Docker needed. |
| `./startapp.sh --docker` | Full Docker stack: multi-stage image → nginx (`:8081`) proxies `/api/` to backend (`:8080`). Closest to the Render production layout. First build ~2 min. |
| `./startapp.sh --frontend-only` | Just the Python dev-server — browse pages without touching the backend. |
| `docker compose up --build` | Same as `--docker` without the browser-open; useful in CI or headless environments. |

The fastest way in: open **`frontend/app.html`** — the hub — and use the sidebar. The
sidebar is a **two-level accordion**: open a track to reveal its **sub-sections**, then open a
sub-section to see its pages — so you browse a handful of named groups, never a wall of 280 links.
(Search still spans everything, and opens the matching sections for you.)
Or jump straight to any file linked below.

---

## The tracks at a glance

| Track | What it covers | Good first page |
|---|---|---|
| ☕ **Java — OOP & Language** | encapsulation, inheritance, polymorphism, generics, concurrency, JVM, **Head First design patterns** | [`inheritance-visualizer.html`](../frontend/inheritance-visualizer.html) |
| 🌲 **Data Structures & Algorithms** | lists, trees, graphs, sorting, searching, Big-O | [`big-o-visualizer.html`](../frontend/big-o-visualizer.html) |
| 🍃 **Spring Boot** | REST, JPA, security, identity, async, production patterns | [`spring-boot-architecture-visualizer.html`](../frontend/spring-boot-architecture-visualizer.html) |
| 🅰️ **Angular** | components, signals, RxJS, HTTP, auth, change detection | [`angular-signals-visualizer.html`](../frontend/angular-signals-visualizer.html) |
| 🔷 **TypeScript** | the type system, generics, inference, advanced patterns | [`typescript-why-visualizer.html`](../frontend/typescript-why-visualizer.html) |
| ⚙️ **App Configuration** | env, profiles, secrets, 12-factor config | open via the hub |
| 🎯 **Interview Prep** | curated drills across the tracks | open via the hub |
| 🛠️ **Dev Tools** | Git, Maven, Docker | open via the hub |
| ☁️ **Cloud — AWS** | core AWS services for app developers | open via the hub |
| 🟦 **Cloud — Azure** | the AZ-204 developer surface — ARM & RBAC, App Service (slots/autoscale), Functions & Durable, ACR/ACI/Container Apps (KEDA), Blob Storage (SAS/tiers), Cosmos DB (partitions/RUs/consistency), Key Vault + managed identities | [Azure Overview](../frontend/azure-overview-visualizer.html) |
| 🟢 **Cloud — GCP** | the ACE developer surface — projects/resource hierarchy/IAM, Compute Engine (instance templates & MIGs), GKE (Deployments, Autopilot, Workload Identity), Cloud Run & Functions, Cloud Storage, Cloud SQL/Firestore/BigQuery, Secret Manager + Workload Identity Federation | [GCP Overview](../frontend/gcp-overview-visualizer.html) |
| 🔐 **Identity & Auth** | JWTs, **tokens/keys & signing**, OAuth2/OIDC, Entra ID, Ping, claims | [Tokens, Keys & Signing](../frontend/identity-keys-signing-deep-visualizer.html) |
| 🐛 **Debugging** | find bugs faster: CORS, 401-vs-403, JWTs (more stacks coming) | [CORS Failures](../frontend/debugging-cors-visualizer.html) |
| 🧪 **Playgrounds** | six *live* sandboxes — real `tsc`, real CPython, a Bash/PowerShell/CMD shell, HTTP, JWT, Spring | [TypeScript Playground](../frontend/typescript-playground-visualizer.html) |
| 🧑‍💻 **Coding Practice (IDE)** | write real JS/TS/Python/Java, run it in-browser, pass/fail against hidden tests — 9 topics, 54 exercises (Arrays & Strings, Linked Lists, Trees, Graphs, Stacks & Queues, Hashmaps & Sets, Sorting & Searching, Dynamic Programming, Backtracking); Java compiles with the real `javac` on a WASM JVM (CheerpJ), first run downloads the runtime once then it's cached | [Arrays & Strings](../frontend/practice-arrays-strings.html) |
| 🐍 **Python** | fundamentals, functions/scope, **decorators, generators, exceptions**, OOP, type hints, asyncio, **FastAPI · Django · Flask** | [Python Fundamentals](../frontend/python-fundamentals-visualizer.html) |
| ⚛️ **React** | JSX/Fiber, hooks, state management, Router v6, forms, performance | [React Fundamentals](../frontend/react-fundamentals-visualizer.html) |
| 🟢 **Node.js & TypeScript Backend** | the single-threaded event loop & runtime, Express, **NestJS** (Spring-style DI), Fastify, **JWT/sessions auth** (401 vs 403) | [Node.js Runtime & the Event Loop](../frontend/node-fundamentals-visualizer.html) |
| 🟣 **C# & .NET** | C# for Java devs, **ASP.NET Core** (pipeline + DI), async/await & Tasks, Entity Framework Core | [ASP.NET Core — Pipeline, DI & Endpoints](../frontend/aspnet-core-visualizer.html) |
| 🐿️ **Go** | types, goroutines/channels, interfaces, errors, HTTP server, **web frameworks (Gin/Echo/Fiber)**, generics | [Go Fundamentals](../frontend/go-fundamentals-visualizer.html) |
| 🐘 **PHP & Laravel** | PHP’s shared-nothing request model, then **Laravel** — lifecycle, routing, middleware, Eloquent ORM | [PHP Fundamentals & the Request Model](../frontend/php-fundamentals-visualizer.html) |
| 💎 **Ruby & Rails** | Ruby’s pure-object model (everything is a message, blocks, mixins, duck typing), then **Rails** — lifecycle, Active Record, MVC, strong params | [Ruby Fundamentals & the Object Model](../frontend/ruby-fundamentals-visualizer.html) |
| 🦀 **Rust** | ownership, borrowing & the **borrow checker** (memory safety, no GC), then the **async web stack** — Tokio + Axum, type-driven extractors | [Ownership, Borrowing & the Borrow Checker](../frontend/rust-fundamentals-visualizer.html) |
| 🏗️ **Full-Stack Stacks** | how the layers combine into real stacks — **SPA + REST** (Angular + Spring/CIAM), **MERN**, server-rendered **monoliths** (Rails/Laravel), **compiled API + SPA** (Go/Rust) | [Full-Stack Web Stacks Compared](../frontend/web-stacks-visualizer.html) |
| 🔌 **MuleSoft** | enterprise integration with Anypoint — **Mule flows**, the Mule Event &amp; **DataWeave**, then **API-led connectivity** and the **Anypoint API Gateway** (JWT/rate-limit policies) | [Flows, the Mule Event &amp; DataWeave](../frontend/mulesoft-fundamentals-visualizer.html) |
| ♾️ **DevOps & CI/CD** | **CI/CD pipelines** (GitHub Actions: jobs/steps/artifacts/gated environments) and **Infrastructure as Code** (Terraform plan/apply/state/drift) | [CI/CD Pipelines](../frontend/devops-cicd-pipeline-visualizer.html) |
| ⎈ **Kubernetes** | pods, deployments, services, config & secrets, Helm, Spring on K8s | [Kubernetes Fundamentals](../frontend/kubernetes-fundamentals-visualizer.html) |
| 🗄️ **SQL & Databases** | SQL, indexes & query plans, transactions/ACID, CTEs, normalization, Postgres | [SQL Fundamentals](../frontend/sql-fundamentals-visualizer.html) |
| ⌨️ **Shell & Scripting** | CLI basics, **Bash**, **PowerShell** objects, **CMD/Batch** — three shells side by side — plus the three **cloud CLIs** (`aws`, `az`, `gcloud`) taught as one shared grammar | [CLI Basics](../frontend/shell-cli-basics-visualizer.html) |
| 🌐 **Web Fundamentals** | the true zero-starting-point before Angular/React/TypeScript: **HTML** structure/forms/a11y, **CSS** box model/specificity/Flexbox/Grid, plain **JavaScript** (closures, `this`, the DOM & events), **async JS** (Promises/async-await/`fetch`), and **how browsers actually render a page** | [HTML Fundamentals](../frontend/web-html-fundamentals-visualizer.html) |
| 📊 **Data Science & ML** | **NumPy/pandas**, data cleaning & **EDA**, **visualization**, ML fundamentals (bias-variance), **regression/classification**, model evaluation, **clustering/PCA**, and **neural networks/PyTorch** | [NumPy & Pandas](../frontend/datasci-numpy-pandas-visualizer.html) |
| 🧠 **AI / LLM Engineering** | **transformers & attention**, how LLMs work (tokenization/sampling), **prompt engineering**, **embeddings & vector DBs**, **RAG**, **tool-calling agents**, wiring an **LLM API** into a real backend, fine-tuning vs RAG vs prompting & **LLMOps**, and **AI safety/guardrails** (prompt injection, jailbreaks, PII) | [Transformers & Attention](../frontend/genai-transformers-attention-visualizer.html) |
| 🎓 **Exam Prep — Practice Tests** | 19 timed/scored mock exams (560 Q), a **readiness dashboard**, **19 learning paths**, and **spaced-repetition flashcards** (16 decks / 459 cards) | [Readiness Dashboard](../frontend/exam-readiness.html) · [Learning Paths](../frontend/learning-paths.html) · [exams](../frontend/exam-aws-developer.html) |
| 🤖 **AI-Assisted Development** | the landscape of AI coding tools (inline vs chat vs agentic, by context & autonomy), **GitHub Copilot** mode by mode, and **Claude Code**'s explore→edit→verify tool loop, Plan Mode, subagents, and hooks | [AI Coding Assistants — The Landscape](../frontend/ai-assistants-overview-visualizer.html) |

Pages are tagged **beginner → intermediate → advanced → expert**. The deepest
ones are the **`*-deep`** / **`*-lab`** companion pages (34 of them) — each takes a
single hard topic and makes it interactive.

---

## ⭐ Featured path: *How a CIAM app works, end to end*

This is the thread the project is built around — a **Customer Identity & Access
Management** app the way it's done day-to-day: an **Angular** SPA logging users in
through **Entra ID / Ping**, talking to a **Spring** API that validates tokens and
enforces access. Follow it in order and you'll have walked a real login from the
browser all the way to a guarded database call.

**Frontend — getting the user in and holding their tokens**

1. [Angular · OIDC Login (Auth Code + PKCE)](../frontend/angular-oidc-login-deep-visualizer.html) — every redirect of a real SPA login; why PKCE, `state`, `nonce`.
2. [Angular · Access Tokens & Silent Refresh](../frontend/angular-token-lifecycle-deep-visualizer.html) — the bearer interceptor, the 401 → silent-refresh retry, where to store tokens.
3. [Angular · Route Guards & Claims](../frontend/angular-route-guards-deep-visualizer.html) — gating routes & UI by claims… and why that's only UX.

**Backend — proving identity and enforcing it**

4. [Spring · Security Filter Chain](../frontend/spring-boot-security-filter-chain-deep-visualizer.html) — what authenticates the request, and who decides 401 vs 403.
5. [Spring · IDM Integration (OAuth2/OIDC)](../frontend/spring-boot-idm-oauth2-deep-visualizer.html) — validating the JWT against the IDM, claim → authority mapping.
6. [Spring · Method Security (`@PreAuthorize`)](../frontend/spring-boot-method-security-deep-visualizer.html) — the **real** authorization gate, evaluated per method & arguments.
7. [Spring · Multi-IDM Claim Mapping](../frontend/spring-boot-multi-idm-claims-deep-visualizer.html) — accepting **Ping + Entra + Keycloak** at once, normalized to one authority model.
8. [Spring · Declarative HTTP Clients (`@HttpExchange`)](../frontend/spring-boot-http-exchange-deep-visualizer.html) — calling the IDM's / downstream APIs, relaying the user's token vs acting as the app.

**Boundary & contract**

9. [Spring · BFF & Token Relay](../frontend/spring-boot-bff-token-relay-deep-visualizer.html) — keep tokens off the browser entirely: an httpOnly cookie to the BFF, a server-side bearer relay onward.
10. [Angular · OpenAPI → Typed Client](../frontend/angular-openapi-client-deep-visualizer.html) — generate the API client from Spring's published spec so the frontend/backend contract can't silently drift.

**The capstone**

11. [Full-Stack Request Round-Trip](../frontend/fullstack-request-roundtrip-deep-visualizer.html) — trace one authenticated `GET /api/users` through *every* layer above, with **200 / 401→refresh / 403** scenarios. This is where the whole path converges.

**The one-line story:** the SPA logs in with **OIDC + PKCE** → holds a short-lived
**access token** and attaches it as a **Bearer** (or, with a **BFF**, keeps it off the
browser entirely) → the Spring **filter chain** validates it and maps claims to
authorities → **`@PreAuthorize`** decides if the call is allowed → and when the API
needs to call *another* service, it relays the right token. Client guards are the
polite "you can't see this"; the server is the lock. The **Round-Trip** page is the
single view where you watch all of it happen at once.

**▶ Now run it for real (live backend).** The pages above *animate* the model; these hit
the **actual** Spring API (start it with `./startapp.sh` or `docker compose up`). Two
accounts are seeded in dev: **`demo` / `demo12345`** (USER) and **`admin` / `admin12345`**
(ADMIN).

- [Auth & Identity (Live)](../frontend/auth-identity-live-visualizer.html) — pick *who* logs in, *how* (first-party **HS256** vs **OIDC/RS256**), and *what* they open; watch a real request walk login → token → filter chain → `@PreAuthorize` → a real **200 / 401 / 403**, with the genuine objects shown at each step.
- [JWT & Auth Playground](../frontend/jwt-playground-visualizer.html) → **"Fetch a real token"** pulls a genuine signed token (HS256 or OIDC) from the backend and decodes it.
- [Spring Boot Playground](../frontend/spring-boot-playground-visualizer.html) → **Live tab** fires real calls, incl. `demo` → `/api/admin/users` (real **403**) vs `admin` (real **200**), plus the OIDC `/oauth2/jwks` + resource-server endpoints.
- **Run code on the server:** the [Python](../frontend/python-playground-visualizer.html), [TypeScript](../frontend/typescript-playground-visualizer.html), and [Shell](../frontend/shell-playground-visualizer.html) playgrounds each have a **"Run on server (real)"** toggle that POSTs your code to `/api/run/*` as an authenticated API call and streams back real process output.

---

## Other quick paths

- **"I'm prepping for an interview"** → start in 🎯 Interview Prep, then the 🌲 DSA
  classics ([sorting](../frontend/sorting-visualizer.html),
  [Big-O](../frontend/big-o-visualizer.html), [hashmap](../frontend/hashmap-visualizer.html)).
- **"I'm learning Angular reactivity"** → [Signals](../frontend/angular-signals-visualizer.html)
  → [Signals ↔ RxJS Interop](../frontend/angular-signals-rxjs-interop-deep-visualizer.html)
  → [Zoneless Change Detection](../frontend/angular-zoneless-deep-visualizer.html).
- **"I want Spring internals"** → [Auto-Configuration Magic](../frontend/spring-boot-auto-configuration-deep-visualizer.html)
  → [Request Lifecycle](../frontend/spring-boot-request-lifecycle-visualizer.html)
  → [Transactions: Propagation & Isolation](../frontend/spring-boot-transactions-deep-visualizer.html).
- **"Something's broken"** → 🐛 [CORS Failures](../frontend/debugging-cors-visualizer.html)
  · [Auth 401 vs 403](../frontend/debugging-auth-401-403-visualizer.html)
  · [JWTs: decode & diagnose](../frontend/debugging-jwt-visualizer.html) — symptom→fix
  diagnosers, paired with the [HELP.md command-line runbook](../HELP.md#command-line-runbook).
  Spring-side: [Debugging Proxies](../frontend/spring-boot-debugging-proxies-deep-visualizer.html)
  (`@Transactional`/`@Async` silently not firing) · [Actuator & Logs](../frontend/spring-boot-debugging-actuator-deep-visualizer.html)
  · [Remote Debug & Breakpoints](../frontend/spring-boot-debugging-remote-deep-visualizer.html).
  Angular-side: [ExpressionChanged Error](../frontend/angular-debugging-change-detection-deep-visualizer.html)
  · [Debugging RxJS](../frontend/angular-debugging-rxjs-deep-visualizer.html)
  · [Browser & Angular DevTools](../frontend/angular-debugging-devtools-deep-visualizer.html).
  Technique: [Reading Stack Traces](../frontend/debugging-stack-traces-visualizer.html)
  · [The Debugging Method](../frontend/debugging-method-visualizer.html) (reproduce → bisect)
  · [Log vs Debugger](../frontend/debugging-logging-vs-stepping-visualizer.html)
  · [Debug Like a Pro: The Toolbox](../frontend/debugging-pro-toolbox-visualizer.html) (git bisect,
  conditional breakpoints, logpoints, correlation IDs, thread/heap dumps).
- **"Hardening the auth backend"** → 🍃 [Rate Limiting & Lockout](../frontend/spring-boot-rate-limiting-deep-visualizer.html)
  · [Refresh Token Rotation](../frontend/spring-boot-refresh-token-rotation-deep-visualizer.html)
  (reuse detection) · [CSRF Protection](../frontend/spring-boot-csrf-deep-visualizer.html)
  (and when a JWT-header API doesn't need it).
- **"Building the auth-aware Angular app"** → 🅰️ [Auth State (Signals)](../frontend/angular-auth-state-signals-deep-visualizer.html)
  · [Reactive Forms (Auth)](../frontend/angular-auth-forms-deep-visualizer.html) (live, typeable)
  · [Lazy Loading & Preloading](../frontend/angular-lazy-loading-deep-visualizer.html).

---

## How the deep-dive pages are built (for contributors)

Each visualizer is **one self-contained HTML file** — vanilla JS, no dependencies, no
build. The `*-deep` / `*-lab` companions follow a consistent shape:

- A dark theme from the **shared design system** in [`frontend/devhub.css`](../frontend/devhub.css):
  every page links it (`<link rel="stylesheet" href="devhub.css">`) and picks its
  **track accent** with one body class — `<body class="track-angular">`. The accent
  re-themes headings, buttons, and card borders for the whole page. Page-specific
  styles stay inline.
- Numbered sections: a hero **animated walk** → reference tables/code → a "gotchas"
  card → a one-sentence recap.
- The hero is the house style across the flow / lifecycle pages — an **extreme-viz**
  panel with four parts working together:
  1. a **vertical rail of stages** the concept passes through (request → interceptors →
     network; or operator → operator; or router event → router event),
  2. a **gliding chip** that travels the rail — and it can *turn around*, so motion
     itself encodes meaning: a response flowing back **up** the interceptor chain, a
     cached request **short-circuiting** before the network, a `switchMap` **cancelling**
     an in-flight call,
  3. a **scenario switcher** (happy path / blocked / error / edge case), and
  4. a **live inspector** that prints the *real object* at each step — the actual
     `HttpRequest`/`HttpResponse`, the `router.events` payload, the RxJS Next/Error/
     Complete notification — not a cartoon. Showing real data is the whole point: it's
     how a visual learner reads state changing.
- Steps animate at **~800 ms+** each so every step reads as a beat, not a flash.
- Syntax-highlighted code via `<span>` classes (`.kw`, `.fn`, `.str`, `.type`, …).

The track → body-class → accent map (defined once in `devhub.css`):

| Track | `<body>` class | Accent |
|---|---|---|
| ☕ Java — OOP & Language | `track-java` | coffee orange |
| 🌲 Data Structures & Algorithms | `track-data` | amber |
| 🍃 Spring Boot | `track-springboot` | Spring green |
| 🅰️ Angular | `track-angular` | Angular red |
| 🔷 TypeScript | `track-ts` | TS blue |
| ⚙️ App Configuration | `track-config` | indigo |
| 🎯 Interview Prep | `track-interview` | rose → gold |
| 🛠️ Dev Tools | `track-tools` | teal |
| ☁️ Cloud — AWS | `track-cloud` | AWS orange |
| 🟦 Cloud — Azure | `track-azure` | Azure blue → light cyan |
| 🟢 Cloud — GCP | `track-gcp` | Google blue → green |
| 🔐 Identity & Auth | `track-identity` | cyan |
| &nbsp;&nbsp;↳ Ping pages (`ping-*`) | `track-ping` | Ping red |
| 🐛 Debugging | `track-debug` | orange |
| 🐍 Python | `track-python` | Python blue + yellow |
| ⚛️ React | `track-react` | React cyan → sky |
| 🟢 Node.js & TS Backend | `track-nodejs` | Node green |
| 🟣 C# & .NET | `track-csharp` | .NET purple |
| 🐿️ Go | `track-go` | Go gopher blue |
| ⎈ Kubernetes | `track-kubernetes` | K8s blue |
| 🗄️ SQL & Databases | `track-sql` | SQL amber |
| ⌨️ Shell & Scripting | `track-shell` | terminal green → cyan |
| 🤖 AI-Assisted Development | `track-ai-dev` | Anthropic clay → violet |

To add one: create `frontend/<name>-deep-visualizer.html`, link `devhub.css` and set
the right `track-*` body class, then register it in the `TRACKS` array in
`frontend/app.html` (track → section → `{ title, file, level }`). Cross-link related
pages so a learner can follow a thread — that's what makes the hub feel like a wiki
rather than a pile of pages.

### The assessment layer (practice exams)

The DevHub isn't only *exposition* — the **🎓 Exam Prep** track adds **retrieval
practice**, the part that actually makes knowledge stick and turns "I read it" into
"I can pass the cert." It is one reusable engine plus per-exam data:

**The catalog (19 exams · 560 Q):** *Cloud* — AWS Cloud Practitioner,
[Developer Associate](../frontend/exam-aws-developer.html) (DVA-C02, 40 Q — the real
exam guide's four domains: Development with AWS Services, Security, Deployment,
Troubleshooting and Optimization), Solutions Architect Associate,
[Azure Developer Associate (AZ-204)](../frontend/exam-azure-developer.html) (28 Q —
every question linked to one of the seven azure-* visualizers),
[GCP Associate Cloud Engineer](../frontend/exam-gcp-ace.html) (ACE, 28 Q — every
question linked to one of the seven gcp-* visualizers). *Languages & Frameworks* — Java SE 21
(OCP), Spring Professional, [Angular v17+](../frontend/exam-angular.html),
[TypeScript](../frontend/exam-typescript.html). *Identity & Security* —
[OAuth 2.0 · OIDC · JWT](../frontend/exam-identity-access.html) (32 Q — the CIAM
day-job exam: grant types, PKCE, ID-vs-access tokens, JWT validation, Ping/Entra).
*Containers & DevOps* — [Docker](../frontend/exam-docker.html),
[Kubernetes](../frontend/exam-kubernetes.html). *Data & APIs* —
[SQL](../frontend/exam-sql.html) (30 Q — includes a PostgreSQL Internals & Scale
domain: JSONB, VACUUM, connection pooling, replication, partitioning/sharding),
[HTTP & REST APIs](../frontend/exam-http-rest.html). *Developer Tools* —
[Git](../frontend/exam-git.html). *Coding Interview* — Data Structures &
Algorithms. *Zero-to-Hero* —
[Web Fundamentals](../frontend/exam-web-fundamentals.html) (26 Q — HTML/CSS/JS/DOM/
async/rendering, every question linked to one of the seven web-* visualizers),
[Data Science & ML](../frontend/exam-data-science.html) (30 Q — NumPy/pandas
through PyTorch, quality-audited via `tmp_examtell_audit.mjs`),
[AI/LLM Engineering](../frontend/exam-ai-engineering.html) (28 Q — transformers
through RAG/agents/safety, every question linked to one of the nine genai-*
visualizers).

- [`frontend/devhub-quiz.js`](../frontend/devhub-quiz.js) — a dependency-free engine.
  Call `DevHubQuiz.render(rootEl, bank)` and it paints the whole experience:
  - **Practice mode** — untimed; each question reveals the answer, **a one-line
    "why" under *every* option** (✓ why the right one is right, ✗ why each wrong
    one is wrong — from the bank's per-question `why` array), a big-picture
    explanation, and a **"Learn more →"** link that `postMessage`s the hub
    (`type:'dlh-navigate'`) to the matching visualizer page.
  - **Exam mode** — *N* random questions, a countdown timer, and a pass/fail
    verdict at the cert's real pass mark. The end-of-exam review shows the same
    per-option reasoning on every question you got wrong (and right).
  - **Per-domain breakdown** on the results screen (red bars = study here), plus a
    **localStorage attempt history** (best score + recent attempts) so a learner can
    watch readiness climb over time.
  - Questions and choices are **shuffled** each attempt; supports single- and
    multi-select; keyboard `1-8` to answer, `←/→` to navigate.
- Each exam is a **standalone page** (e.g. [`exam-aws-developer.html`](../frontend/exam-aws-developer.html))
  that links the engine and supplies a **question bank** inline. A bank entry:

  ```js
  { id:'iam-creds', domain:'Security & IAM', difficulty:'medium',
    stem:'Your ECS task needs to read a secret…',
    code:null,                                   // optional monospace block
    choices:['…','…','…','…'], answer:1,         // index — or [0,2] with multi:true
    why:['…','…','…','…'],                       // one line PER OPTION, aligned to
                                                 // choices: why right / why wrong
    explanation:'Use a task role — the SDK auto-discovers temp creds…',
    ref:{ label:'IAM visualizer', file:'aws-iam-visualizer.html' } }
  ```

  To add an exam: create `frontend/exam-<name>.html` from the AWS one, write the
  bank (each question's `ref.file` should point at the page that teaches it), and
  register the page under the **Exam Prep** track in `TRACKS`. The bank is pure
  data — no engine changes needed.

  **Question-quality standard (enforced):** the correct choice is a crisp fact
  with no explanation tail; distractors are plausible, same-register statements
  that encode a *real* misconception (length-bracketed so the correct answer is
  never "the long one"); raw `answer` indexes are spread evenly across the bank;
  and every question carries an aligned `why` array (≥ 20 chars per line). The
  gate is [`frontend/tmp_examtell_audit.mjs`](../frontend/tmp_examtell_audit.mjs) —
  `node tmp_examtell_audit.mjs [name-filter]` flags **length tells** (correct =
  longest option), **position tells** (one raw index > 40 % of the bank), and
  **missing why-coverage**, and exits non-zero. Run it after any bank edit.
- [`frontend/quiz-banks.js`](../frontend/quiz-banks.js) — a **manifest** (metadata
  only: `id`, `title`, `cert`, `file`, `track`, `passPct`, `count`, `available`)
  listing every exam. Keep an exam's `id`/`passPct`/`count` in sync with its page.
  `available:false` entries render as "coming soon," so the manifest doubles as a
  roadmap. After adding an exam, add its manifest row too.
- [`frontend/exam-readiness.html`](../frontend/exam-readiness.html) — the
  **readiness dashboard**. It reads the manifest + `DevHubQuiz.loadHistory(id)` for
  each exam and renders an overall "avg best" ring, a per-exam best-score bar
  against the pass mark (green = pass-ready), attempt counts, and the **weakest
  domain** (aggregated from saved attempts — which is why `finish()` persists the
  per-domain breakdown). New exams appear here automatically once they're in the
  manifest.
- [`frontend/learning-paths.html`](../frontend/learning-paths.html) — **named
  learning paths** (16 curricula, one per exam). Each cert/goal is an *ordered*
  curriculum: a `PATHS` array of steps (each `[file, title, tag]`) ending in a
  capstone exam. Click a step to `dlh-navigate` to that visualizer; the capstone
  shows your best score (its pass mark lives in `passOf()`, kept in sync with the
  exam). This is what turns the 473-page library into a *course with a finish
  line*.
- [`frontend/devhub-flashcards.js`](../frontend/devhub-flashcards.js) — the
  **spaced-repetition flashcard engine** (`DevHubFlash.render(rootEl, deck)`). A
  Leitner 5-box system: a card you know moves up a box (seen less); a card you miss
  drops to box 1 (seen most). Mastery = the share in box 5; box state persists in
  localStorage per deck. A deck is `{ id, title, subtitle, accent, cards:[{front,
  back, hint}] }`. Current decks (13): [AWS Services](../frontend/flashcards-aws.html),
  [Azure Services](../frontend/flashcards-azure.html),
  [GCP Services](../frontend/flashcards-gcp.html),
  [Big-O](../frontend/flashcards-bigo.html),
  [HTTP Codes](../frontend/flashcards-http.html),
  [Spring Annotations](../frontend/flashcards-spring.html), plus OAuth/OIDC/JWT
  terms, TypeScript, Angular, SQL, Git, Docker, and Kubernetes. Add a deck = new
  `flashcards-<topic>.html` from one of these + register it under Exam Prep.
- [`frontend/devhub-notebook.js`](../frontend/devhub-notebook.js) — sitewide
  **personal notebook** quick-add. Every `<h2>` on every one of the 473 content
  pages gets a small "📖 Notebook" button (auto-scanned on load, `NotebookStore`
  in localStorage); click it to save that section — id, file, anchor, title, and
  a captured snippet, never a page-wide dump. Curated per Bobby's evidence-based
  spec in the (now-resolved) Personal Notebook item that used to live in
  [ROADMAP.md](ROADMAP.md) — spacing/retrieval/interleaving only, no
  color-as-memory-aid.
- [`frontend/notebook.html`](../frontend/notebook.html) — **My Notebook**, the
  saved-entries page (also reachable via the 📓 topbar button in `app.html`).
  Lists your saved sections grouped exactly like the sidebar (track → section),
  with search + track filter, and three review modes built on
  [`frontend/devhub-notebook-review.js`](../frontend/devhub-notebook-review.js):
  **Flashcards** (thin wrapper over `DevHubFlash.render`), **Quiz Me** (forced
  recall via a scratch textarea before reveal — the testing effect), and
  **Interleaved Review** (entries shuffled round-robin across sections before
  a Quiz-Me-style session — for Exam Prep/DSA-style discrimination practice).
  All three share one Leitner box store per scope, keyed by entry id via
  `DevHubFlash.loadBoxes/saveBoxes` (exported for this reason), so "mastered"
  means the same thing in the notebook as it does in the exam-prep flashcard
  decks.
- [`frontend/devhub-codegrade.js`](../frontend/devhub-codegrade.js) — the
  **Coding Practice (IDE) engine**: `DevHubCodeGrade.render(rootEl, bank)`
  renders the exercise list, per-language editor tabs, Run Tests, and pass/fail
  results for the nine `practice-*.html` pages. All four languages execute for
  real, client-side: JS/TS in a sandboxed iframe (TS via the real `typescript`
  compiler), Python via Pyodide, and **Java via CheerpJ** — a WASM JVM booted in
  a hidden engine-owned iframe where the user's `Solution.java` is compiled by
  the actual `javac` (`com.sun.tools.javac.Main`, classpath = a tools.jar
  fetched once into Cache Storage) and graded by a generated `Harness.java`
  that prints one sentinel-marked JSON result per hidden test. Exercises
  declare `javaTypes` (the Java type of each arg) so plain JSON test data can
  be rendered as typed literals; `ListNode`/`TreeNode` are provided by the
  grader as a separate compilation unit. Gotcha for future work: anything
  passed to `cheerpjAddStringFile` must be built with the *iframe's own*
  `Uint8Array` (see `frameBytes()`) — a parent-realm array fails CheerpJ's
  `instanceof` check and gets silently stringified, corrupting binary data.
  After editing any exercise bank or the Java layer, re-run
  `node tmp_java_verify.mjs` from `frontend/` — it compiles + grades reference
  solutions for all 54 exercises (from `tmp_java_data.mjs`) through the
  engine's real harness generator with the local JDK.
- [`frontend/devhub-tryit.js`](../frontend/devhub-tryit.js) — the **Try It
  Live embedded mini-IDE** on 119 lesson pages (Java, Python, TypeScript,
  JS-fundamentals, and DSA tracks): the *exploratory* twin of
  `devhub-codegrade.js` — same real execution engines (JS/TS sandboxed iframe
  with the real `typescript` compiler, Python via Pyodide, Java via CheerpJ's
  WASM `javac`, sharing the same Cache Storage tools.jar bucket), but no
  grading — just an editable Head First-style example, a predict-first prompt
  that flips to "did the output match your prediction?" after the first run,
  and a ▶ Run button. Declarative markup: a `.tryit` div with
  `data-lang`/`data-title`/`data-predict` wrapping a
  `<script type="text/plain">` code block (so examples can contain `<`/`>`
  unescaped); `DevHubTryIt.attachAll()` upgrades them on DOMContentLoaded.
  Output lines animate in with a burst-aware stagger (lines arriving <150 ms
  apart get stepped delays, capped ~1 s; inert under reduced-motion). Edits
  persist per widget in localStorage (`dlh-tryit:<page>:<n>`); ↺ Reset
  restores the shipped example. **Java examples must be Java 8** (CheerpJ's
  JVM): no `List.of`, `var`, records, text blocks, `String.repeat`, or
  `Stream.toList` — and Java threads run cooperatively in-browser, so race
  demos must say so honestly. Mass-rollout generators live in the session
  scratchpad pattern `gen_tryit_*.mjs`: author examples → verify each with
  the real local toolchain (javac/CPython/typescript.js+node) → lint for
  banned syntax → insert after the intro card (`intro-ciam` anchor regex) →
  validate every page has exactly one widget + one script tag.
- [`frontend/devhub-transitions.js`](../frontend/devhub-transitions.js) —
  sitewide **click feedback + page-fade transitions**, on all 528 pages via
  one `<script>` tag (no per-page markup). Press feedback is an accent
  **pulse ring** (2026-08-30): pointerdown toggles `.dh-press` on the nearest
  `button`/`.tab`/`[role="button"]`/`.page-link`/`.track-card`/`.tc-dot`/
  `a.card`, whose animated box-shadow blooms outward from the control's own
  outline — box-shadow follows the element's exact border-radius, so it can
  never misalign, overflow, or affect layout (the two retired fill-ripple
  implementations got exactly those wrong). devhub.css also adds a hover
  micro-lift + brightness on the same selectors. The pulse's critical CSS is
  **injected by the script itself** (id `dh-press-css`, mirror copy in
  devhub.css — keep in sync) because 14 index/landing pages don't link
  `devhub.css`. The fade-out layer only ever runs for a real top-level
  document navigation — it's a no-op inside `app.html`'s `#viewer` iframe,
  where several pages already `postMessage` a `dlh-navigate` event to the
  parent hub instead of following the link directly (grep `dlh-navigate` if
  touching that pattern). Everything here is inert under
  `prefers-reduced-motion: reduce`.
- **The hub sidebar is keyboard-operable, and staying that way needs three
  things together** (`frontend/app.html`). Lesson links are real `<a href>` with
  a `preventDefault` on plain left-click — so the SPA behaviour is kept while
  middle-click, ctrl-click, copy-link and the status-bar preview all work. The
  track and section headers are real `<button aria-expanded>`. Both matter: as
  divs the sidebar had **zero** focusable elements, and fixing only the leaf
  links would change nothing, because a collapsed branch keeps its anchors
  `display:none`. Buttons need `appearance:none; background:none; border:0;
  width:100%; text-align:left; font-family:inherit` or the UA restyles the
  sidebar, and both header types and `.page-link` carry a `:focus-visible`
  outline — a tab order you cannot see is worse than none.

- [`frontend/devhub-chapters.js`](../frontend/devhub-chapters.js) — the
  **chapter rail** (`.hf-rail`) at the top of a lesson: where this page sits in
  its section, which pages sit either side, and — since 2026-09-05 — where the
  path continues. Reads `tracks-data.js`, so a page never hand-writes its own
  position. Three things worth knowing before editing it:
  **(1) Rail links must not be plain anchors.** The hub renders lessons in an
  iframe and tracks the current page in its own `currentFile`; a bare
  `<a href>` navigates the *frame* only, so the hub's breadcrumb, active sidebar
  link, hash and progress all stay on the page you arrived from — and because
  progress is keyed off `currentFile`, "Mark as Learned" then credits the page
  you LEFT. Rail links therefore route through `railClick`, which posts
  `{type:'dlh-navigate', file}` to the parent (a contract `app.html` has accepted
  since it was built). The real `href` is kept so middle-click, ctrl-click,
  copy-link and the keyboard still behave like links; only the plain left-click
  is intercepted, and only when embedded.
  **(2) `nextSectionStart()` is what stops sections dead-ending.** On the last
  page of a section it returns the first page of the next one and the rail
  renders "Next up · <section> →". It returns `null` on the last section of a
  track — a real ending, not a dead end. `locate()` filters out empty sections
  first, or "next" could point at one.
  **(3) Styles live in `devhub-hf.css`** (`.hf-rail*`, `.hf-practice*`), not
  injected — the rail only renders on kit pages, which link it.
  **(4) It also renders the "Test yourself" strip** at the end of a lesson, from
  `window.DEVHUB_PRACTICE` in `tracks-data.js`. That map is GENERATED by
  `frontend/tmp_genpracticemap.mjs`, which inverts the 614 `ref:{label,file}`
  entries the exam and practice banks already carry — the edge only ever pointed
  from practice to lesson, which is why just 2 of 465 lessons linked forward to
  any recall. Rerun the generator after editing a bank; `--check` fails on a
  stale map. 202 lessons (39%) now carry the strip, with no per-page markup:
  every one of them already loaded this script and `tracks-data.js`.

- [`frontend/devhub-syntax.js`](../frontend/devhub-syntax.js) — sitewide
  **IDE-style syntax highlighting** for static code, on all 231 pages that
  contain `<pre>` blocks. Auto-runs on DOMContentLoaded: any static,
  code-looking `<pre>` is tokenized (single-pass ordered alternation, same
  design as the codewalk widget's `hl()` — comment/string matches consume
  their region first) into the token classes `devhub.css` has always styled
  (`kw`/`str`/`cm`/`dec`/`num`/`fn` + new `type`), so hand-annotated and
  auto-highlighted blocks look identical. Skips: pres with an `id` (dynamic
  inspector panes), pres with element children (already annotated), pres
  inside widget roots (`.cw`,`.dlh-tryit`,`.cg`,`.dq`,`.df`,`.dnb`), and
  anything failing a looks-like-code gate (ASCII diagrams/file trees stay
  plain). Opt-out per block: `<pre data-nohl>`. Injects its own token colors
  (id `dh-syntax-css`) so pages without `devhub.css` still get full color.
  API: `DevHubSyntax.highlight(text)`, `DevHubSyntax.apply(root)` for
  late-added nodes. Include on every new page that shows code.
- **Validation gates** (`frontend/tmp_*.mjs`, run from `frontend/`) — `tmp_vcheck.mjs`
  is the CI gate (`deploy.yml` blocks the Pages deploy on it): encoding, registry
  both ways, required shared scripts, internal links, duplicate registrations,
  inline-`<script>` parse, and CSS theme-selector shape. `tmp_smoke.mjs` opens
  every page in Chromium at 320px and reports uncaught errors and horizontal
  overflow (network-only failures listed separately — a sandbox with no CDN fails
  every CDN load). `tmp_assetcheck.mjs <ref>` fails on any LOSS of a teaching asset
  versus a git ref. `tmp_contrast.mjs` measures text contrast in a theme
  (`--theme=cream|dark`, `--inject=candidate.css` to try a fix without editing the
  site); it composites translucent backgrounds and exempts `aria-hidden` ornament
  and gradient-clipped headings, because an earlier version did neither and
  invented ~1860 phantom failures. `tmp_shot.mjs` screenshots any page at phone and
  desktop; `tmp_hfapply.mjs` opts a page into the kit.
- **Head First bar audit** (`frontend/tmp_hfaudit.mjs`) — scores every lesson
  page against CLAUDE.md's nine-point teaching standard and ranks the thinnest
  first, so the standing "scan for thin lessons" directive is a command rather
  than a reading marathon. Weights follow CLAUDE.md's own emphasis: line-by-line
  code explanation and active recall carry most. It reads markup, not meaning —
  it finds pages that lack the ingredients (no memory hooks, no recall beat, one
  explanation and out), which is exactly what "thin" means; it cannot tell a
  brilliant analogy from a limp one.

  One dimension is worth distrusting specifically. **`explain` divides by
  `<pre>` count**, so a page built from many one-line snippets (a lambda
  cheatsheet, a list of functional-interface shapes) is scored as though each
  were an unexplained program. `streams-visualizer.html` scores 25/100 on it and
  has exactly *one* substantial code block; `typescript-fundamentals` scores
  worst on the whole site and has 7 bare blocks out of 32. To find the real
  worklist, count blocks of **6+ lines** with no CodeWalk or annotation nearby
  and under 25% comment density — by that measure the site has ~353 genuinely
  bare blocks across ~72 authored pages, and the ranking is completely different
  from the score's.
- **Cream contrast repair** (in
  [`frontend/devhub-hf-theme.js`](../frontend/devhub-hf-theme.js)) — the part CSS
  structurally cannot reach. 513 pages carry their own `<style>` block that
  hardcodes a dark ground and lets text inherit `var(--text)`; under cream that
  ink turns dark and the box goes black-on-black. CSS has no way to ask "is this
  element's computed background dark?", and the class names are invented per page,
  so there is nothing shared to name — but the browser knows the answer exactly.
  Runs ONLY under cream (0 elements touched in dark), composites the background
  stack, and moves the text's LIGHTNESS while keeping its HUE, so green still
  reads as "the fix" and red as "the bug". First pass is synchronous so the page
  never paints unreadable text and then corrects itself; later passes are
  idle-scheduled for subtrees the scenario/CodeWalk engines add after load. Every
  change records what it replaced, so switching back to dark restores the page
  exactly. Costs ~7ms per page.
- **Cream repair layer** (end of [`frontend/devhub-hf.css`](../frontend/devhub-hf.css))
  — the cream theme's token block is enough for anything token-driven, but
  `devhub.css` also hardcodes several hundred literal colours picked against the
  navy dark theme and repairs them only under `[data-theme="light"]`. This layer
  repairs them for cream, in both directions: dark-theme near-whites and neons
  landing on a pale card, and cream's dark ink inherited into the code panels that
  stay dark in both themes. Every selector is written
  `:is([data-theme="cream"],[data-theme="light"])[data-hf] …` — the comma form
  splits into a bare root selector plus a light-only rule and silently matches
  nothing; vcheck fails the build if it reappears.
- **The 13 landing pages carry their own cream block** (2026-09-04) — a *third*
  home for cream, separate from the two above. `angular-index`, `aws-index`,
  `configs-index`, `docker-index`, `ds-index`, `entra-id-index`, `git-index`,
  `interview-index`, `maven-index`, `ping-idm-index`, `spring-boot-index`,
  `typescript-index` and `index-legacy` link **neither** `devhub.css` nor
  `devhub-hf-theme.js`, so neither half above can reach them. Each now has an
  inline pre-paint `<script>` in `<head>` (it must be in the head — a bootstrap
  in the end-of-body `devhub-transitions.js` flashes dark first) plus its own
  `:root[data-theme="light"]` block right after `<style>`, which outranks the
  page's own `:root` on specificity so source order is irrelevant.
  **Two things to know before editing them.** (1) A variable override only
  reaches rules that *use* variables; about half the breakage was in rules that
  hardcode a hex — `a.back{color:#22d3ee}` at 1.52:1, every h1 brand gradient,
  and chips whose near-black text sat on a `var()` background that cream had
  just made dark. Those need explicit higher-specificity rules, and
  `index-legacy`'s ~40 *inline* colours need `var(--b-<hex>, <hex>)` in the
  markup, since inline beats any rule. (2) Tune colours against `--panel2`
  (`#e6d7bd`), the **darkest** cream surface — tuning against `--bg` puts every
  card title at ~4.3:1, which passes on the page background and fails on the
  cards. The site default now lives in **three** bootstraps (`app.html`,
  `devhub-hf-theme.js`, these 13); change one, change all three.
- **Head First kit** (in [`frontend/devhub.css`](../frontend/devhub.css),
  final section) — the book's visual vocabulary as drop-in classes, all
  tinted by the track's `--accent`: `.hf-big` (gradient big-type mnemonic),
  `.hf-note[.pink/.blue/.green]` (handwritten sticky notes), `.hf-arrow[.up]`
  (scribbled annotation arrows pointing into code), `.hf-brain` (⚡ Brain
  Power predict-first box), `.hf-qa` ("there are no Dumb Questions" `<dl>`),
  `.hf-vs` (❌/✅ exaggerated contrast grid), `.hf-mark[.g/.r/.b]`
  (marker-pen phrase highlight), `.hf-g/r/a/v/c` (colored prose spans).
  Sitewide auto-effect: `<b>/<strong>` inside intro cards get an
  accent-tinted marker sweep with zero markup changes. **Wave 2 (2026-08-30,
  from Bobby's reference mockup):** `.hf-kicker` (accent badge pill above
  titles), `.hf-receipt` (thermal-paper running total — rows + `.total`),
  `.hf-chain` (wrapper-chain chips `.n` joined by arrows `.a`), plus
  design-system changes: editorial near-white `h1` (accent reserved for
  labels), borderless bold `h2`, editor-window chrome on highlighted code
  blocks (traffic-light dots; `data-file="Main.java"` shows a filename),
  light-theme marker/inline-code fixes. **Reference implementation:**
  [`head-first-decorator-visualizer.html`](../frontend/head-first-decorator-visualizer.html)
  — clone its intro structure when sweeping pages. Full rollout tracked in
  ROADMAP's ACTIVE BACKLOG (items 1 & 8).

---

*This guide is updated as new tracks and deep-dives land. **Newest pass — design-system v2 + press pulse (2026-08-30):**
Bobby's second review round came with a reference mockup of the Decorator page; the shared design system now matches it — editorial titles, restrained accent, editor-window code blocks, `.hf-kicker`/`.hf-receipt`/`.hf-chain` components, light-theme fixes — and the fill-ripple is retired in favor of an accent press-pulse ring plus hover micro-lift (see the `devhub-transitions.js` entry). `head-first-decorator-visualizer.html` was rebuilt as the reference page. The per-page sweep (kill inline styles that fight the system, break up text walls, pull long expressions out of prose) is ROADMAP backlog #8; a new IDE-mastery track (VS Code / IntelliJ / Spring tooling, with official-doc sources) is backlog #9.

**Previous pass — feedback fixes: syntax coloring everywhere + the Head First kit (2026-08-29, evening):**
Three sitewide upgrades from Bobby's review: (1) the click-ripple bug on index/landing pages is fixed — `devhub-transitions.js` is now fully self-contained (see its entry above for the root cause; the rule "shared engines inject their own critical CSS" is now in `CLAUDE.md`); (2) new `devhub-syntax.js` gives every static code block on 231 pages IDE-grade token coloring automatically (entry above); (3) `devhub.css` gained the Head First kit — sticky notes, annotation arrows, Brain Power boxes, marker highlights, big-type mnemonics, ❌/✅ contrast panels — plus an automatic marker sweep on the 8,000+ bold phrases inside existing intro cards. Piloted on three pages; the full ~500-page rollout, the line-by-line annotation sweep, the Monaco-editor upgrade path, and the "Code With Me" coach are specced in ROADMAP's ACTIVE BACKLOG.

**Previous pass — Try It Live: an embedded IDE on every core lesson (2026-08-29):**
119 lesson pages across five tracks (Java 44, TypeScript 30, Python 23, DSA 20, JS-fundamentals 3 — the two remaining web-fundamentals pages are HTML/CSS-only) now open with a runnable, editable, predict-first code example via the new `devhub-tryit.js` widget (see its entry above). Every example was authored Head First-style — trace-style prints, "now change X and re-run" provocations, honest captions where the browser runtime differs from the real thing (cooperative threads on CheerpJ, type erasure in TS) — and every one was verified offline against the real toolchain before insertion (local `javac`+`java` for all 42 generated Java examples, local CPython for all 23 Python, the same-version `typescript` compiler + node for all 33 TS/JS, node for all 20 DSA). Output lines animate in one at a time (burst-aware stagger) so printed traces read as steps, not a wall. Likely next candidates if the pattern extends: Node track (hand-rolled JS minis), Angular (TS minis), Spring Boot (plain-Java minis — no Spring runtime on CheerpJ).

**Previous pass — Java joins the Coding Practice IDE (2026-08-29):**
All 54 graded exercises across the nine `practice-*.html` topics are now solvable in **Java** alongside JS/TS/Python — real `javac` compile errors, a real JVM run, LeetCode-style `class Solution` starters, `ListNode`/`TreeNode` provided by the grader. Execution stays 100% client-side via CheerpJ (WASM JVM, CDN loader — the same "CDN dependency accepted for real engines" precedent as Pyodide); the ~18 MB compiler jar downloads once into Cache Storage. Every exercise's Java reference solution was verified through the engine's own harness generator with a local JDK (`frontend/tmp_java_verify.mjs`, 54/54), and the flow was browser-verified end to end (pass, wrong-answer, compile-error, list/tree shapes, ops-replay design problems). See the `devhub-codegrade.js` entry above for the architecture and the cross-realm `Uint8Array` gotcha.

**Previous pass — ROADMAP's remaining gaps closed (2026-08-28):**
The last three near-term gaps from ROADMAP.md's sitewide depth audit are closed: [Deployment Strategies](../frontend/devops-deployment-strategies-visualizer.html) (blue-green, canary with an automated metrics-gated abort, feature flags, and GitOps — contrasted against the rolling-deployment baseline already covered on the Kubernetes/ECS pages; registered under DevOps & CI/CD's Delivery section), [From git push to Production](../frontend/production-deployment-visualizer.html) (a capstone walking a Spring Boot API to Kubernetes, an Angular SPA to a CDN, a function to Lambda, and a monolith to a PaaS, ending on an incident-rollback scenario — registered under Full-Stack Stacks' Putting It Together section), and [gRPC & Protocol Buffers (Spring)](../frontend/spring-boot-grpc-visualizer.html) (unary/server-stream/client-stream/bidi-stream RPC shapes plus a metadata-based JWT auth interceptor, contrasted against REST and GraphQL — registered under Spring Boot's APIs & Communication section, cross-linked from the existing Go gRPC page). Only GCP coverage remains, explicitly deferred per Bobby's own stated phasing.

**Previous pass — sitewide depth-audit gaps closed (2026-08-28):**
Four more gaps from ROADMAP.md's sitewide depth audit are closed, all with the full scenario chip-walk + live inspector treatment: [E2E Testing — Playwright & Cypress](../frontend/angular-e2e-playwright-visualizer.html) (Page Object Model, brittle selectors vs auto-waiting, trace-viewer debugging, CI sharding — registered under Angular's Testing section), [Redis](../frontend/nosql-redis-visualizer.html) (data structures, cache-aside with `RedisTemplate`, TTL/eviction, atomic `INCR` rate-limiting, pub/sub — new NoSQL section under the SQL track), [Document & Wide-Column Stores — MongoDB & DynamoDB](../frontend/nosql-document-wide-column-visualizer.html) (embedding vs referencing, partition-key hot-spotting, eventual vs strong consistency, GSIs), and [GraphQL](../frontend/spring-boot-graphql-visualizer.html) (over/under-fetching solved by client-specified shape, the N+1 resolver trap fixed with Spring's `@BatchMapping`, and a field-level authorization gap as the CIAM security angle — registered under Spring Boot's APIs & Communication section). Also fixed a real bug found while resuming: two literal `</script>` strings inside a JS payload in `appsec-injection-xss-visualizer.html` were prematurely closing the page's real `<script>` tag and breaking its entire demo — escaped to `<\/script>`.

**Previous pass — the Personal Notebook (2026-08-28):**
Every content page now has a "📖 Notebook" quick-add on each `<h2>` section (see
[`frontend/devhub-notebook.js`](../frontend/devhub-notebook.js)), a topbar 📓 shortcut
in `app.html`, and a dedicated [`My Notebook`](../frontend/notebook.html) page with
three review modes (Flashcards, Quiz Me, Interleaved Review) built on the existing
Leitner spaced-repetition engine — see the entries above for the full breakdown. This
closes out the Personal Notebook item that previously sat in ROADMAP.md's NEXT UP
section.

**Previous pass — the 🟦 Cloud — Azure track + AZ-204 (2026-07-03):**
The AZ-204 gap is closed. A new **Cloud — Azure** track (7 pages, all with the full scenario chip-walk + live inspector treatment) covers the Azure developer surface: [Azure Overview](../frontend/azure-overview-visualizer.html) (ARM, resource groups, RBAC allow/deny, Bicep), [App Service](../frontend/azure-app-service-visualizer.html) (plans, deploy, slot swaps, autoscale, app settings), [Functions](../frontend/azure-functions-visualizer.html) (triggers & bindings, queue-driven scale-out, cold starts, Durable orchestration replay), [Containers](../frontend/azure-containers-visualizer.html) (ACR Tasks, ACI, Container Apps revisions/canary, KEDA scale-to-zero), [Blob Storage](../frontend/azure-storage-visualizer.html) (Entra auth vs SAS, tiers & lifecycle, the 403 data-role trap), [Cosmos DB](../frontend/azure-cosmos-visualizer.html) (point reads vs fan-out, RUs & 429s, consistency levels, change feed), and [Key Vault & Managed Identities](../frontend/azure-keyvault-identity-visualizer.html) (the zero-secret IMDS→Entra→vault flow, rotation, leak response). The assessment layer grew with it: an **[AZ-204 practice exam](../frontend/exam-azure-developer.html)** (28 Q across 7 domains, every question ref-linked to the page that teaches it), an **[Azure Services flashcard deck](../frontend/flashcards-azure.html)** (28 cards), and an **Azure Developer learning path** ending in the AZ-204 capstone.

**Previous pass — Assessment layer launched (2026-06-16):**
The DevHub now *tests* you, not just teaches you. A new **🎓 Exam Prep** track introduces a reusable practice-exam engine ([`devhub-quiz.js`](../frontend/devhub-quiz.js)) with Practice and timed Exam modes, per-domain score breakdowns, and saved attempt history — the retrieval-practice loop that's the difference between reading the material and passing the certification. The catalog now spans **14 exams / 398 questions** (it launched at 6 / 203) — the originals [AWS Cloud Practitioner](../frontend/exam-aws-practitioner.html) (CLF-C02, 41 Q), [AWS Developer](../frontend/exam-aws-developer.html) (DVA-C02, 24 Q), [AWS Solutions Architect](../frontend/exam-aws-sa-associate.html) (SAA-C03, 37 Q), [Java OCP](../frontend/exam-java-ocp.html) (1Z0-830, 20 Q), [Spring Professional](../frontend/exam-spring-professional.html) (41 Q), and [Coding Interview / DSA](../frontend/exam-dsa-interview.html) (40 Q), plus [Angular](../frontend/exam-angular.html), [TypeScript](../frontend/exam-typescript.html), [Identity & Access (OAuth/OIDC/JWT)](../frontend/exam-identity-access.html), [Git](../frontend/exam-git.html), [Docker](../frontend/exam-docker.html), [Kubernetes](../frontend/exam-kubernetes.html), [SQL](../frontend/exam-sql.html), and [HTTP & REST APIs](../frontend/exam-http-rest.html) — each question linked back to the visualizer that teaches it. Plus a **[readiness dashboard](../frontend/exam-readiness.html)** (one "am I ready?" scorecard), **14 [learning paths](../frontend/learning-paths.html)** (one ordered curriculum → capstone exam per exam, library→course), and **spaced-repetition [flashcards](../frontend/flashcards-aws.html)** (11 decks / 312 cards: AWS services, Big-O, HTTP codes, Spring annotations, OAuth/OIDC/JWT terms, TypeScript, Angular, SQL, Git, Docker, Kubernetes). Every bank passes an automated integrity check (answers in range, refs resolve, manifest in sync). See **"The assessment layer"** above for the formats.

**Earlier pass — Intro cards rolled out across all 344 pages (2026-06-14):**
Every content page in the DevHub now opens with a rich **plain-English intro card** before the visualizer — a 150+ word paragraph explaining what the concept is and why it matters, three mini-cards with concrete code examples, and an amber **"In CIAM / Your Job"** callout bar tying the topic to real full-stack CIAM work (Ping + Entra + Spring Boot + Angular + Azure/AWS). This covers all 18 tracks:
**Shell** ([CLI Basics](../frontend/shell-cli-basics-visualizer.html), [Bash](../frontend/shell-bash-visualizer.html), [PowerShell](../frontend/shell-powershell-visualizer.html), [CMD](../frontend/shell-cmd-visualizer.html));
**Identity** ([RBAC deep](../frontend/rbac-deep-visualizer.html), [Keys & Signing](../frontend/identity-keys-signing-deep-visualizer.html));
**Spring Boot** ([OAuth2 Resource Server](../frontend/spring-boot-oauth2-resource-server-visualizer.html));
**Angular** ([SSR & Hydration](../frontend/angular-ssr-hydration-visualizer.html));
**Java** ([Variables & Types](../frontend/java-variables-types-visualizer.html), [Records & Sealed](../frontend/java-records-sealed-visualizer.html));
**Full-Stack** ([Request Round-Trip](../frontend/fullstack-request-roundtrip-deep-visualizer.html));
**Interview Prep** ([Spring+Angular Q&amp;A](../frontend/interview-spring-angular-visualizer.html), [Graphs](../frontend/interview-graphs-visualizer.html), [Dynamic Programming](../frontend/interview-dynamic-programming-visualizer.html), [Arrays & Strings](../frontend/interview-arrays-strings-visualizer.html), [Linked Lists](../frontend/interview-linked-lists-visualizer.html), [Trees](../frontend/interview-trees-visualizer.html));
**DSA** ([Sorting](../frontend/sorting-visualizer.html), [Big-O](../frontend/big-o-visualizer.html));
and the two standalone tools pages: [HTTP &amp; REST](../frontend/http-rest-visualizer.html) and [System Design](../frontend/system-design-visualizer.html).
Each intro card color-codes to the track accent and is structured identically so a learner always knows where to look for background before diving into the animation.

**Previous pass — TypeScript Modules animated hero (2026-06-13):**
[TypeScript Modules](../frontend/typescript-modules-visualizer.html) received a full animated hero (mo-* prefix, 4 scenarios, 950ms chip, live inspector):
**import type erasure** — `import type { User }` is erased completely at emit (zero JS runtime cost), vs `import { getUser }` (value) which is kept; valid only in type-position annotations, not `new User()`;
**verbatimModuleSyntax** — the tsconfig flag that makes every import explicit (`import type` vs value import required); prevents bundler-invisible dead imports; `import { type X, getUser }` inline syntax for mixed modules; essential in Angular 17+ projects;
**module resolution** — `"bundler"` mode (Angular default: no `.js` extension needed, esbuild handles it) vs `"node16"` mode (ESM spec: `.js` required even for `.ts` files); how `node_modules` `package.json "exports"` resolution works; `resolveJsonModule` for typed JSON imports;
**path aliases** — `@/components/Button` via tsconfig `"baseUrl" + "paths"`; TS resolves for type-checking but does NOT rewrite imports in emitted JS (bundler must also be configured); Angular 17+ esbuild reads tsconfig paths automatically; barrel file cost (full barrel loaded even for one import — prefer direct imports for tree-shaking).

**Previous pass — TS animated heroes (4 pages) · Angular HTTP + async depth (2026-06-13 cont.):**
Four 🔷 **TypeScript** pages gained full animated heroes (4 scenarios each, 950ms chip, live inspector):
[Type Guards](../frontend/typescript-type-guards-visualizer.html) — typeof narrowing, instanceof, custom `x is T` predicate (with CIAM `/token` response guard example), assertion functions `asserts x is T` + `assertNever` for exhaustive union checks;
[Variance &amp; Assignability](../frontend/typescript-variance-visualizer.html) — covariant return types (`() => Dog → () => Animal`), contravariant parameter types (wider param = valid subtype), bivariant method-shorthand footgun, invariant mutable generics (`Array<Dog>` ≠ `Array<Animal>`) + `ReadonlyArray` fix;
[Classes](../frontend/typescript-classes-visualizer.html) — abstract class blueprint (cannot instantiate, must implement abstract methods), `implements` vs `extends` (shape-only vs code+shape), TypeScript `private` erasure vs `#` hard-private (truly runtime-enforced), dual nature of a class (`Point` vs `typeof Point` vs `InstanceType<typeof Point>`);
[Type-Level Patterns](../frontend/typescript-type-patterns-visualizer.html) — branded/nominal types (`UserId ≠ PostId ≠ string`, CIAM AccessToken/RefreshToken/ClientId brands), phantom types for state machines (Form&lt;Draft&gt; → Form&lt;Validated&gt; transitions, PKCE flow example), Result&lt;T,E&gt; typed error channels (no hidden throws, caller forced to handle both branches), exhaustive `assertNever` switches (add new union variant → every unhandled switch flagged).
Three 🅰️ **Angular HTTP** depth sections added to [HTTP &amp; HttpClient](../frontend/angular-http-visualizer.html): retry with exponential backoff (`retry({ count, delay: (err, n) => timer(2^n * 1000) })`), global `errorInterceptor` for 0/401/403/503 with toast + redirect, full CIAM bearer interceptor (`SKIP_AUTH` context token, `isTokenExpired()` + `refreshTokens().pipe(switchMap)`, `addBearer()` helper), and the Angular 19 `httpResource()` primitive (`users.isLoading()`, `users.value()`, `users.error()`, reactive URL signal).
One 🔷 **TypeScript async-patterns** depth section added to [Async Patterns](../frontend/typescript-async-patterns-visualizer.html): `Awaited<T>` utility type, `Awaited<ReturnType<typeof asyncFn>>`, `catch (e: unknown)` → typed error guards, `class ApiError extends Error`, `Promise.any()` / `AggregateError`, and async generic pipelines.

**Newest pass cont. — TS decorators animated hero (2026-06-13):**
[TypeScript Decorators](../frontend/typescript-decorators-visualizer.html) received a full animated hero (dc-* prefix, 4 scenarios, 950ms chip):
execution order (evaluation top→down, application bottom→up — `@A @B class` → B applied first, A wraps around; Angular `@Component` fires last after all `@Input`/`@ViewChild` are done);
method decorator (@Log) — wraps via PropertyDescriptor, saves original, wraps with function(){original.apply(this,args)}, returns modified descriptor, `@HostListener` uses same API;
decorator factory (@Retry(3) vs @Log) — outer function captures options in closure, returns decorator; CIAM example: `@Retry(3)` wrapping OIDC `exchangeCode()`;
TC39 Stage 3 vs legacy — different signatures (fn+context vs target+key+desc), `addInitializer` per-instance (no legacy equivalent); which to use (Angular/NestJS→legacy; new code→TC39; never mix).

**Previous pass cont. — 2 more TS animated heroes + Angular directives depth (2026-06-13):**
Two more 🔷 **TypeScript** animated heroes:
[Functions in Depth](../frontend/typescript-functions-visualizer.html) — function overloads (two public sigs, one hidden impl; TS picks the right one; Angular HttpClient uses this exact pattern), `void` vs `undefined` vs `never` (void = "callers ignore return", undefined = "explicit", never = "does not return"), contextual typing (why `arr.map(n => n*2)` doesn't need a type annotation on `n`), call signatures (callable objects with properties — Angular DI tokens);
[TypeScript Fundamentals](../frontend/typescript-fundamentals-visualizer.html) — 4 core concepts animated: type inference (TS widens from initializer, TS2322 on wrong assignment), structural typing (shape-based compatibility — superset passes, missing property fails, fresh literal stricter), union types (`"active" | "suspended"` literal unions, discriminated unions, intersection `A & B`), narrowing (CFA reads `typeof` / `in` / truthiness guards and auto-narrows each branch).
The 🅰️ **Angular Directives** page gained its beginner→expert on-ramp: "New to directives? It's behavior you stick on an element" (component = directive + view; `*` = structural; attribute = change existing) plus "Expert corner" (`*ngIf` desugaring, `@if`/`@for` v17+ control flow, `hostDirectives` composition, `*appHasRole` CIAM UX pattern).

**Previous pass — Head First deepening · TypeScript why hero · Angular content revamps (2026-06-13):**
Five ☕ **Head First Design Patterns** pages were deepened from "OK" to "RICH" — animation timing tightened to 950ms and two new sections added per page:
[Singleton](../frontend/head-first-singleton-visualizer.html) ("Singleton in the wild" — Spring `@Component` / Angular `@Injectable` — and the static-singleton testing trap with `@Mock` fix);
[Command](../frontend/head-first-command-visualizer.html) (NoCommand null-object pattern for empty slots; Command in the stack — `ExecutorService.submit`, `publisher.publishEvent`, NgRx Actions, CQRS);
[Adapter &amp; Facade](../frontend/head-first-adapter-facade-visualizer.html) (Adapter in the wild — `Arrays.asList`, `InputStreamReader`, Angular `@Pipe`; `@Service` as Facade over 4 subsystems);
[Template Method](../frontend/head-first-template-method-visualizer.html) (`Arrays.sort()` / `HttpServlet` / `JdbcTemplate` / Angular `ngOnInit` as everyday Template Methods; Template Method vs Strategy — inheritance vs composition comparison);
[State](../frontend/head-first-state-visualizer.html) (state-transition table mapping states × actions → next state; State in the stack — `OrderStatus` enum, XState `createMachine()`, TCP / auth flows).
The 🔷 **TypeScript Why** page gained its animated hero ([compiler trace](../frontend/typescript-why-visualizer.html)) — the chip is a piece of code moving through `tsc` across 4 scenarios: **null crash** (TS2531 vs JS runtime TypeError), **wrong type passed** (TS2345 at call site), **rename property** (TS2339 × 10 — exact task list), and **strict mode** (`noImplicitAny + strictNullChecks` enabled together).
Six 🅰️ **Angular** core pages received full content depth revamps (new sections, not just touch-ups):
[Data Binding](../frontend/angular-binding-visualizer.html) — added: signal inputs `input()`/`output()`/`model()` (Angular 17+), the `async` pipe + `as` alias pattern, host bindings via `@HostBinding` and `host: {}` metadata;
[Routing](../frontend/angular-routing-visualizer.html) — added: functional guards with `inject()` + `UrlTree` redirect, `canActivate` vs `canMatch` table, `withComponentInputBinding()` (route params as `input()` signals), CIAM OIDC redirect guard pattern (`angular-auth-oidc-client` + `returnUrl` flow);
[Directives](../frontend/angular-directives-visualizer.html) — added: `hostDirectives` for mix-in composition (Angular 15+), custom structural directive walkthrough (`*appUnless` with `TemplateRef + ViewContainerRef` — how `*` desugars);
[Control Flow](../frontend/angular-control-flow-visualizer.html) — added: `@for @empty` fallback block, all 7 `@defer` trigger types reference table (`on idle / viewport / interaction / hover / timer / immediate / when`) with combined trigger + `prefetch` examples;
[Pipes](../frontend/angular-pipes-visualizer.html) — added: `keyvalue` pipe deep-dive (object + Map iteration, custom sort comparator, CIAM attributes use case), custom pipe with `inject()` standalone pattern + null-safe transform guard;
[Signals](../frontend/angular-signals-visualizer.html) — added: `untracked()` escape hatch (read without registering dependency), `effect()` cleanup function pattern (WebSocket open/close, auto-reconnect on userId change).

**Previous pass — a "Code Walkthrough" widget &amp; deeper page content:**
a reusable **line-by-line code stepper** now lives in the design system (`devhub-codewalk.js` + `.cw-*` in `devhub.css`) — press ▶ and
each line of a real snippet highlights while a panel on the right narrates it and shows live variable boxes, output, and gotchas.
First exemplars (one per stack, ready to scale across the app): **Java** [Encapsulation](../frontend/encapsulation-visualizer.html)
(a `BankAccount` rejecting an overdraft), **TypeScript** [Narrowing](../frontend/typescript-narrowing-visualizer.html)
(watch the type of `id` shrink through a guard), **Spring** [REST Controllers](../frontend/spring-boot-rest-api-visualizer.html)
(one request through a controller), and **Angular** [Signals](../frontend/angular-signals-visualizer.html) (the reactive graph staying in sync).
More **beginner→expert** on-ramp/expert-corner cards landed too — Angular [Routing](../frontend/angular-routing-visualizer.html), Spring
[Security](../frontend/spring-boot-security-visualizer.html), Java [Polymorphism](../frontend/polymorphism-visualizer.html), and
TypeScript [Fundamentals](../frontend/typescript-fundamentals-visualizer.html) — on top of the earlier Angular five (Components, Data
Binding, Services &amp; DI, Signals, RxJS). Before that: **the Head First book completed &amp; Angular went beginner→expert:**
the ☕ Java **Head First Design Patterns** sub-track now covers the whole book — the final three chapters landed with the same
voice + animated hero: **[Iterator &amp; Composite](../frontend/head-first-iterator-composite-visualizer.html)** (the Objectville menus),
**[Proxy](../frontend/head-first-proxy-visualizer.html)** (remote / virtual / protection / caching), and
**[Compound Patterns &amp; MVC](../frontend/head-first-compound-mvc-visualizer.html)** (Observer + Strategy + Composite teaming up) —
that's 12 chapters in all. And the core 🅰️ **Angular** pages gained a two-tier depth treatment — a plain-English **"brand-new to this?"**
on-ramp plus an **"expert corner"** (internals, gotchas, CIAM tie-ins) appended to **Components, Data Binding, Services &amp; DI, Signals,
and RxJS**, so the same page serves a first-timer and a senior. Before that: **live sandboxes &amp; two
languages going deep:** the **🧪 Playgrounds** track grew to six and now includes genuinely-runnable
environments — a **[TypeScript Playground](../frontend/typescript-playground-visualizer.html)** that loads the
real `typescript` compiler (semantic type-checking with VS-Code-grade diagnostics, emitted JS, and live execution),
a **[Python Playground](../frontend/python-playground-visualizer.html)** running **real CPython** via Pyodide (stdlib,
real tracebacks), and a **[Shell Playground](../frontend/shell-playground-visualizer.html)** — a working mini-shell with
an in-memory filesystem that switches between **Bash / PowerShell / CMD** so you can feel the differences. The **🐍 Python**
track expanded past the basics with the hero treatment on **[Functions &amp; LEGB scope](../frontend/python-functions-visualizer.html)**,
**[Decorators](../frontend/python-decorators-visualizer.html)**, **[Generators &amp; Iterators](../frontend/python-generators-visualizer.html)**,
and **[Exceptions](../frontend/python-errors-visualizer.html)**. A brand-new **⌨️ Shell &amp; Scripting** track landed —
**[CLI Basics](../frontend/shell-cli-basics-visualizer.html)**, **[Bash](../frontend/shell-bash-visualizer.html)**,
**[PowerShell](../frontend/shell-powershell-visualizer.html)** (objects, not text), and **[CMD/Batch](../frontend/shell-cmd-visualizer.html)**.
And **🔐 Identity &amp; Auth** gained **[Tokens, Keys &amp; Signing](../frontend/identity-keys-signing-deep-visualizer.html)** —
symmetric vs asymmetric signing, JWKS &amp; `kid` rotation, the tamper→break demo, a layer-by-layer "where each key lives"
map, and a glossary that finally untangles session keys vs secret keys vs signing keys vs client secrets. (Plus a fix to the Go track's
sidebar icon.) Before that: a big*
*<!-- prior --> **extreme-viz hero** wave — an animated step-walk with a gliding chip and a **live
inspector of the real per-step objects** across happy-path / blocked / error / edge-case
scenarios. The hero is now the lead element on the **Component Lifecycle** (SimpleChanges,
@ViewChild timing, OnPush mutation), **Signals** (set→dirty→recompute→effect, equality
gate), the whole **RxJS family** (Observable lifecycle, the operator pipe, multicasting's
shared-execution counter, custom-operator internals), **Pagination** (the full HttpParams →
Spring `Pageable` → `Page<T>` round-trip), and state management (**NgRx** action→reducer→
selector, **SignalStore** `patchState`, and a **State-Patterns** hero that runs the *same*
update through all four architectures) — on top of the earlier Routing / RxJS Lab / HTTP
set. Also new: a **Head First Design Patterns** sub-track in ☕ Java — **12 chapters** retold with
the book's voice (Brain Power, "no Dumb Questions", design-principle boxes) and the same
animated hero: [Strategy / SimUDuck](../frontend/head-first-strategy-visualizer.html),
[Observer / Weather Station](../frontend/head-first-observer-visualizer.html),
[Decorator / Starbuzz](../frontend/head-first-decorator-visualizer.html),
[Factory / Pizza Store](../frontend/head-first-factory-visualizer.html),
[Singleton / Chocolate Boiler](../frontend/head-first-singleton-visualizer.html),
[Command / Remote Control](../frontend/head-first-command-visualizer.html),
[Adapter &amp; Facade](../frontend/head-first-adapter-facade-visualizer.html),
[Template Method / Coffee &amp; Tea](../frontend/head-first-template-method-visualizer.html),
[State / Gumball Machine](../frontend/head-first-state-visualizer.html),
[Iterator + Composite / Diner &amp; Pancake House 🍽️](../frontend/head-first-iterator-composite-visualizer.html)
(tight-coupling → Iterator interface → Composite menu tree → uniform `print()`),
[Proxy 🪞](../frontend/head-first-proxy-visualizer.html)
(remote / virtual / protection / caching proxy — four scenarios, all behind one `Subject` interface), and
[Compound Patterns &amp; MVC 🎛️](../frontend/head-first-compound-mvc-visualizer.html)
(the finale — Observer + Strategy + Composite cooperating; the full MVC request cycle traced live) — **12 chapters** total, plus an inline SVG **favicon** for the hub.
The **🔷 TypeScript** core now carries the hero too — the per-step inspector shows the *type itself*
transforming: [Narrowing/CFA](../frontend/typescript-narrowing-visualizer.html) (a union shrinking through
guards), [Generics](../frontend/typescript-generics-visualizer.html), [Conditional Types](../frontend/typescript-conditional-types-visualizer.html)
(`extends ? :` + `infer` + distribution), [Mapped Types](../frontend/typescript-mapped-types-visualizer.html),
[Utility Types](../frontend/typescript-utility-types-visualizer.html), [Inference](../frontend/typescript-inference-visualizer.html),
[Discriminated Unions](../frontend/typescript-discriminated-unions-visualizer.html), [Structural Typing](../frontend/typescript-structural-typing-deep-visualizer.html),
[keyof / Indexed Access](../frontend/typescript-keyof-indexed-deep-visualizer.html), and [Template Literal Types](../frontend/typescript-template-literal-types-visualizer.html).
And the **🍃 Spring Boot** core: [DI & the IoC container](../frontend/spring-boot-di-ioc-visualizer.html) (bean-graph wiring),
[REST Controllers](../frontend/spring-boot-rest-api-visualizer.html) (the request round-trip + status codes),
[Spring Security](../frontend/spring-boot-security-visualizer.html) (the filter chain — who decides 200/401/403),
[Data JPA](../frontend/spring-boot-data-jpa-visualizer.html) (method→SQL→entity + the N+1 trap),
[Validation](../frontend/spring-boot-validation-visualizer.html) (`@Valid` → ProblemDetail), and
[Configuration & Profiles](../frontend/spring-boot-configuration-visualizer.html) (property-source precedence).
Built on the **shared `devhub.css` design system** — the `rt-*` **extreme-viz hero kit now lives in
`devhub.css` itself**, so a new page needs only its hero markup + engine (and a small `.who-*` badge block);
every page links one stylesheet and declares its track accent via a `<body class="track-*">` (see the map above).
Also: the **🐛 Debugging track**, the completed **CIAM round-trip**, the Spring **Security & Identity**
section, and a fixed **GitHub Pages deploy** workflow (`enablement: true` + Node-24 action versions; see the
[README deploy steps](../README.md#part-3--deploy-the-frontend-github-pages)). The **🔐 Identity & Auth**
track got the hero treatment end-to-end: the **Entra** and **Ping/IDM** overviews (a user sign-in,
app-only/**Managed-Identity**, **hybrid AD sync**, and a **risky adaptive sign-in**; and the **Joiner-Mover-Leaver**
lifecycle walked through the Ping product chain), **[PingFederate Admin](../frontend/ping-admin-visualizer.html)**
(the admin config running at request time — adapters, token policy, key rotation, the Admin API), and the
**[Ping](../frontend/ping-integration-visualizer.html)** + **[Entra](../frontend/entra-spring-angular-visualizer.html)**
full-stack integrations (the happy round-trip plus the classic **401-issuer / CORS / 403-claim-mapping** failures,
**MSAL silent refresh**, app-role assignment, and **On-Behalf-Of** to Microsoft Graph). The **sidebar was
reorganized into a two-level accordion** so each track's pages sit inside collapsible sub-sections — pages no
longer land as one scary list. A new **🧪 Playgrounds** track debuted with the
**[API Playground](../frontend/api-playground-visualizer.html)** — a real in-browser HTTP client (every Send is a live
`fetch()`, with status/timing/headers/body + CORS &amp; auth explainers) and the
**[JWT &amp; Auth Playground](../frontend/jwt-playground-visualizer.html)** (decode any token, really sign/verify it with
Web Crypto, tamper a claim and watch the signature break, then map claims → Spring authorities and test `@PreAuthorize`) and the
**[Spring Boot Playground](../frontend/spring-boot-playground-visualizer.html)** (a configurable security simulator — fire a
request through the filter chain → URL authz → DispatcherServlet → `@PreAuthorize` and watch 200/401/403/404 flip as you change
the caller's authorities, plus a Live tab against the real `:8081` backend).
Most recently: a **full Spring Boot hero wave** — 11 pages of the 🍃 Spring core now carry the animated chip-walk + live inspector:
[Architecture](../frontend/spring-boot-architecture-visualizer.html) (SpringApplication.run → auto-config → BeanDefinition cycle),
[Batch](../frontend/spring-boot-batch-visualizer.html) (chunk commit / skip / retry / fail),
[Microservices](../frontend/spring-boot-microservices-visualizer.html) (sync REST / async Kafka / Eureka discovery / Gateway routing),
[Resilience4j](../frontend/spring-boot-resilience4j-visualizer.html) (CLOSED → OPEN → HALF_OPEN + RateLimiter),
[WebSocket](../frontend/spring-boot-websocket-visualizer.html) (HTTP upgrade → STOMP → broadcast → disconnect),
[Flyway](../frontend/spring-boot-flyway-visualizer.html) (migrate / up-to-date / checksum mismatch / repair),
[Logging](../frontend/spring-boot-logging-visualizer.html) (log.info → SLF4J → Logback → appender / MDC / filtered / JSON),
[Profiles](../frontend/spring-boot-profiles-visualizer.html) (dev H2 / prod Postgres / @Profile bean / env-var override),
[Data Specifications](../frontend/spring-boot-data-specs-visualizer.html) (Specification → dynamic WHERE / .and() compose / null-safe / projection),
[Events](../frontend/spring-boot-events-visualizer.html) (sync / @Async pool / @TransactionalEventListener AFTER_COMMIT / SpEL conditional),
[Pagination](../frontend/spring-boot-pagination-visualizer.html) (basic page / sort / empty / Slice&lt;T&gt; no-COUNT).
And a **complete Angular hero wave** — all **70 pages** of the 🅰️ Angular track now carry the animated chip-walk + live inspector. Every major topic is covered:
**Fundamentals:** [Change Detection](../frontend/angular-change-detection-visualizer.html) (Zone.js / OnPush / signal graph / zoneless),
[Component Communication](../frontend/angular-communication-visualizer.html) (@Input / @Output / two-way / shared service),
[Control Flow](../frontend/angular-control-flow-visualizer.html) (@if / @for+track / @defer / @switch),
[ViewChild &amp; ContentChild](../frontend/angular-viewchild-visualizer.html) (lifecycle timing / static:true / signal viewChild()),
[Functional Guards](../frontend/angular-functional-guards-visualizer.html) (canActivate / UrlTree / canDeactivate / canMatch),
[Testing](../frontend/angular-testing-visualizer.html) (pure unit / TestBed / jasmine spy / fakeAsync+tick),
[Lazy Loading](../frontend/angular-lazy-loading-visualizer.html) (chunk fetch / PreloadAll / @defer viewport / module cache),
[Animations](../frontend/angular-animations-visualizer.html) (fade / state machine / :enter:leave / keyframes).
**Reactivity & State:** [Signals](../frontend/angular-signals-visualizer.html), [RxJS family](../frontend/angular-rxjs-visualizer.html) (lifecycle, operators, multicasting, custom operators, flattening),
[NgRx](../frontend/angular-ngrx-visualizer.html) (dispatch→reducer→selector+effect), [SignalStore](../frontend/angular-ngrx-signal-store-visualizer.html) (patchState / rxMethod),
[State Patterns](../frontend/angular-state-patterns-visualizer.html) (same update through BehaviorSubject / Signal / NgRx / SignalStore side-by-side).
**HTTP & Auth:** [HTTP Client](../frontend/angular-http-visualizer.html) (interceptor round-trip, chip turns around on response),
[Interceptors Advanced](../frontend/angular-interceptors-advanced-visualizer.html), [OIDC Login](../frontend/angular-oidc-login-deep-visualizer.html) (PKCE / Entra / Ping / silent refresh),
[Token Lifecycle](../frontend/angular-token-lifecycle-deep-visualizer.html) (JWT issuance / storage / silent-refresh interceptor / revoke).
**Forms:** [Reactive Forms](../frontend/angular-forms-visualizer.html), [Template Forms](../frontend/angular-template-forms-visualizer.html),
[FormArray](../frontend/angular-form-array-visualizer.html) (push/insertAt/removeAt timeline),
[Custom Form Controls (CVA)](../frontend/angular-custom-form-controls-visualizer.html) (writeValue↓ / onChange↑ / setDisabledState / async validation),
[Forms &amp; Data](../frontend/angular-forms-data-deep-visualizer.html) (reactive / multipart / patchValue / nested DTO).
**Advanced:** [Defer](../frontend/angular-defer-deep-visualizer.html) (on viewport / interaction / idle / prefetch),
[DI Hierarchy](../frontend/angular-di-hierarchy-deep-visualizer.html) (root singleton / lazy scope / @SkipSelf / @Optional),
[Components deep](../frontend/angular-components-visualizer.html) (lifecycle / @Input SimpleChange / @Output EventEmitter / viewChild safety),
[CDK &amp; Material](../frontend/angular-material-cdk-visualizer.html) (custom palette / CDK Overlay / FocusTrap / MatFormField),
[PWA](../frontend/angular-pwa-visualizer.html) (SW install / cache-first / offline / Web Push),
[Signal Store Patterns](../frontend/angular-signal-store-patterns-deep-visualizer.html) (withState / withComputed / rxMethod / withCalls),
[OpenAPI Client](../frontend/angular-openapi-client-deep-visualizer.html) (ng-openapi-gen / schema drift / auth interceptor / MSW mock),
[Workspace Libraries](../frontend/angular-workspace-libraries-visualizer.html) (ng generate library / path alias / ng-packagr / peerDependencies),
[v21 Features](../frontend/angular-v21-visualizer.html) (HMR template patch / resource() / incremental hydration / linkedSignal()),
[Zoneless](../frontend/angular-zoneless-deep-visualizer.html) (signal.set() → scheduler → targeted CD vs Zone full tree walk).
**Debugging:** [ExpressionChangedAfterItHasBeenChecked](../frontend/angular-debugging-change-detection-deep-visualizer.html),
[Debugging RxJS](../frontend/angular-debugging-rxjs-deep-visualizer.html) (cold Observable / leak / swallowed error / tap tracing),
[Browser &amp; Angular DevTools](../frontend/angular-debugging-devtools-deep-visualizer.html) (Network / Profiler / breakpoints / Component explorer).

And the **🍃 Spring Boot** track gained two new deep pages:
[Lombok &amp; Code Generation](../frontend/spring-boot-lombok-visualizer.html) (APT compile-time pipeline / @Data / @Builder / @Slf4j / @RequiredArgsConstructor / gotchas: @Data on JPA entities).
The **🔐 Identity &amp; Auth** track gained an Authorization Patterns section:
[RBAC &amp; Authorization Deep Dive](../frontend/rbac-deep-visualizer.html) (RBAC vs ABAC vs ReBAC / JWT claims design / Spring @PreAuthorize SpEL / hasPermission ABAC / multi-tenant RBAC with row-level data isolation).

**Deep-dive hero wave** — 15 previously-thin companion pages now carry the full animated chip-walk + live inspector:
**☕ Java/OOP core:** [SOLID/DIP](../frontend/solid-visualizer.html) (Spring DI container wires the concrete impl — tight-coupling vs prod vs test injection),
[Exceptions](../frontend/exceptions-visualizer.html) (exception wrapping: always pass `e` as cause — one missing arg = hours of debugging),
[Concurrency](../frontend/concurrency-visualizer.html) (deadlock: consistent lock order prevents the cycle — Thread A→X→Y, Thread B→X→Y),
[Functional Java](../frontend/java-functional-visualizer.html) (stream pipeline lazy eval + compose/andThen order),
[Optional](../frontend/java-optional-visualizer.html) (pipeline short-circuit when Optional becomes empty),
[Strings](../frontend/java-strings-visualizer.html) (naive `+=` = O(n²) allocations; StringBuilder = single buffer O(n)),
[File I/O & NIO](../frontend/java-io-nio-visualizer.html) (Files.readString auto-close vs try-with-resources vs descriptor leak).

**Core full-stack foundation pass (2026-08-28)** — the beginner-facing bedrock pages of the
🛠️ Dev Tools track now carry the same animated chip-walk + live inspector, not just the advanced
companion pages:
[Polymorphism](../frontend/polymorphism-visualizer.html) (5 scenarios: `Shape[]` dynamic dispatch,
the same call site resolving to a new subtype under Open/Closed, compile-time overload resolution
contrasted against runtime dispatch, and two classic interview traps — fields are NOT polymorphic,
and calling an overridable method from a superclass constructor before subclass fields init),
[HTTP & REST](../frontend/http-rest-visualizer.html) (5 scenarios walk a request through
Client → Network → Security Filter Chain → Controller → Response to physically show WHERE 401 vs
403 diverge — 401 rejected at the filter before the controller ever runs, 403 denied after
authentication passes — plus a 404 business-logic case and a browser-side CORS preflight block),
[SQL](../frontend/sql-visualizer.html) (5 scenarios walk a query through
Client → Connection Pool → Query Planner → Storage Engine → Result: an indexed B-tree lookup vs. an
unindexed sequential scan, a 3-statement transaction COMMIT vs. a foreign-key-violation ROLLBACK,
and a SQL-injection payload neutralized by a bound `PreparedStatement` parameter).
Back links across the five untouched-but-verified OOP pages (Encapsulation, Inheritance,
Abstraction, SOLID, Exceptions) were also fixed from the legacy `index.html` to `app.html`.

**🔷 TypeScript deep companions:** [Narrowing/CFA deep](../frontend/typescript-narrowing-cfa-deep-visualizer.html) (flow graph: null check prunes type below the guard),
[Generic Inference deep](../frontend/typescript-generic-inference-deep-visualizer.html) (candidate collection → union on conflict → contextual flow inward),
[Classes internals deep](../frontend/typescript-classes-internals-deep-visualizer.html) (`private` erased at runtime — bypass with `as any`; `#` is WeakMap, blocked even with cast),
[Arrays & Tuples](../frontend/typescript-arrays-tuples-visualizer.html) (number[] vs [string,number] vs readonly as-const — what each does and does not enforce).
**🍃 Spring Boot deep companions:** [CSRF deep](../frontend/spring-boot-csrf-deep-visualizer.html) (cookie auto-attach → CSRF works; JWT Bearer → SOP blocks; SameSite=Strict → cookie omitted),
[Refresh Token Rotation deep](../frontend/spring-boot-refresh-token-rotation-deep-visualizer.html) (normal rotate RT#1→RT#2; reuse-detected revokes entire family),
[Testing Security deep](../frontend/spring-boot-testing-security-deep-visualizer.html) (anonymous→401; jwt() user→403; jwt(ROLE_ADMIN)→200 — filter-chain walk-through),
[Rate Limiting deep](../frontend/spring-boot-rate-limiting-deep-visualizer.html) (normal pass; burst→429 filter short-circuits; slow brute-force→5 failures→423 lockout).

Three brand-new tracks launched — **300+ pages total**:

**🐍 Python (6 pages):**
[Fundamentals](../frontend/python-fundamentals-visualizer.html) (CPython pipeline / everything is an object / reference counting / LEGB scope),
[OOP](../frontend/python-oop-visualizer.html) (type metaclass / instance creation / MRO C3 / dunder protocols / @property descriptor),
[Collections &amp; Comprehensions](../frontend/python-collections-visualizer.html) (list/dict/set/generator comprehensions / iteration protocol / sort/defaultdict/Counter),
[Type Hints &amp; Protocols](../frontend/python-type-hints-visualizer.html) (mypy / TypeVar / structural typing Protocol / Union narrowing),
[Async / Await &amp; asyncio](../frontend/python-async-visualizer.html) (event loop / coroutines / gather() / task cancellation / blocking trap),
[FastAPI Deep Dive](../frontend/python-fastapi-deep-visualizer.html) (Starlette ASGI / Pydantic validation / Depends() DI / OAuth2 Bearer / background tasks; Spring Boot comparison table).

**⚛️ React (6 pages):**
[Fundamentals](../frontend/react-fundamentals-visualizer.html) (JSX → createElement / Fiber architecture / initial mount / state update / list keys / unmount),
[Hooks Deep Dive](../frontend/react-hooks-visualizer.html) (hooks linked list / useState / useEffect deps + cleanup / useRef / useMemo / useCallback),
[State Management](../frontend/react-state-management-visualizer.html) (useReducer / Context API + re-render pitfalls / Zustand selectors / lifting state),
[React Router v6](../frontend/react-router-visualizer.html) (navigation / data loaders / auth guard redirect / nested routes with Outlet),
[Forms &amp; Validation](../frontend/react-forms-visualizer.html) (controlled vs uncontrolled / React Hook Form / Zod schema / form submit with server errors),
[Performance &amp; Rendering](../frontend/react-performance-visualizer.html) (React.memo / code splitting + Suspense / useTransition / DevTools profiling).

**🐿️ Go (6 pages):**
[Fundamentals](../frontend/go-fundamentals-visualizer.html) (value vs reference types / slice three-word header / maps / pointers / zero values),
[Goroutines &amp; Channels](../frontend/go-goroutines-channels-visualizer.html) (M:N scheduler / buffered channels / select / WaitGroup / errgroup),
[Interfaces &amp; Embedding](../frontend/go-interfaces-visualizer.html) (implicit satisfaction / interface value two-word header / nil interface gotcha / embedding / io.Reader pattern),
[Error Handling](../frontend/go-error-handling-visualizer.html) (error interface / fmt.Errorf %w wrapping / errors.Is / errors.As / custom error types / panic+recover),
[HTTP Server &amp; Middleware](../frontend/go-http-server-visualizer.html) (ServeMux Go 1.22 / middleware chain / JWT Bearer auth / structured JSON API),
[Generics (Go 1.18+)](../frontend/go-generics-visualizer.html) (type parameters / constraints as type sets / ~ tilde / generic types / slices/maps/cmp stdlib packages).*
