# OOP & Programming Fundamentals — a Live Walkthrough

A runnable, self-narrating tour of everything an entry-level software developer
is expected to know. Every concept is a small Java program with verbose console
output, so you can read the code top-to-bottom and watch each variable change
as it runs.

Think of it as a personal wiki you can `git clone` and execute.

---

## What's covered

| # | Section | What it teaches |
|---|---|---|
| 1 | Encapsulation | private fields, validating getters/setters |
| 2 | Inheritance | `extends`, `super`, `@Override`, protected |
| 3 | Polymorphism | method overriding + overloading |
| 4 | Abstraction | interfaces, abstract classes, default methods |
| 5 | Data structures | LinkedList, Stack, Queue, BST (hand-built) |
| 6 | Algorithms | bubble / quick / merge sort, linear / binary search |
| 7 | SOLID | the five design principles, one runnable example each |
| 8 | Composition over inheritance | "has-a" with swappable parts |
| 9 | Generics | `<T>`, `<K,V>`, generic methods |
| 10 | Exceptions | try/catch/finally, checked vs unchecked, custom exceptions |
| 11 | Object essentials | equals/hashCode/toString, immutability, static, enum |
| 12 | Java Collections Framework | ArrayList, LinkedList, HashMap, HashSet, TreeMap |
| 13 | Lambdas & Streams | filter/map/collect, method references |
| 14 | Design patterns | Singleton, Factory, Builder, Observer, Strategy |
| 15 | Recursion | factorial with call-stack trace, fibonacci, sumDigits |
| 16 | Big O / complexity | live timing of O(n) vs O(log n) on 10M items |
| 17 | String classics | reverse, palindrome, anagram, first-unique-char |
| 18 | HashMap from scratch | buckets + chaining, visualized |
| 19 | Graphs | adjacency list, BFS, DFS |
| 20 | Concurrency | threads, race conditions, `synchronized`, AtomicInteger, ExecutorService |
| 21 | Generic wildcards | `? extends T`, `? super T`, PECS |
| 22 | JVM internals | heap vs stack, garbage collection, classloaders |
| 23 | Reflection & annotations | custom annotation, scan + invoke at runtime |
| 24 | Networking | real TCP server + client in one JVM |
| 25 | SQL & JDBC | CRUD against H2 in-memory, prepared statements, SQL injection |
| 26 | REST API design | HTTP verbs, status codes, idempotency, JSON |

---

## Prerequisites

- **Java 21** (`java --version` should report 21 or newer)
- Maven (not strictly required — the project ships with the Maven wrapper)
- Any IDE with Java support (IntelliJ, VS Code, Eclipse) — optional but nice

---

## How to run

From the project root:

**Windows (PowerShell or cmd):**
```
.\mvnw.cmd -q exec:java -Dexec.mainClass=com.bob.oopfundamentals.OopFundamentalsApplication
```

**macOS / Linux:**
```
./mvnw -q exec:java -Dexec.mainClass=com.bob.oopfundamentals.OopFundamentalsApplication
```

**Or in your IDE:** open `OopFundamentalsApplication.java` and run its `main` method.

The full walkthrough takes about 4–5 seconds and prints all 26 sections in order.
Scroll up to read each section, or pipe the output to a file:

```
.\mvnw.cmd -q exec:java -Dexec.mainClass=com.bob.oopfundamentals.OopFundamentalsApplication > walkthrough.txt
```

> The project's `pom.xml` is wired for a full Spring Boot 4 server, but the
> demo deliberately bypasses Spring and runs as plain Java (`public static
> void main`). That keeps the focus on the fundamentals, with no datasource
> or API keys required.

---

## Project structure

```
src/main/java/com/bob/oopfundamentals/
├── OopFundamentalsApplication.java   ← entry point (just calls runAll)
├── OopDemoRunner.java                ← orchestrates all 26 sections
│
├── demos/                            ← the "narrators" — read these first
│   ├── EncapsulationDemo.java
│   ├── InheritanceDemo.java
│   ├── ...
│   └── RestApiDemo.java
│
└── <support packages>                ← the actual implementations
    ├── encapsulation/                ← BankAccount
    ├── inheritance/                  ← Animal, Dog, Cat, Bird
    ├── polymorphism/                 ← Shape, Circle, Rectangle, ...
    ├── abstraction/                  ← Drivable, Vehicle, Car, Motorcycle
    ├── datastructures/               ← MyLinkedList, MyStack, MyQueue, MyBinarySearchTree, MyHashMap, MyGraph
    ├── algorithms/                   ← SortingAlgorithms, SearchingAlgorithms
    ├── solid/                        ← one file per S/O/L/I/D principle
    ├── composition/                  ← Engine, GpsModule, ComposedCar
    ├── generics/                     ← Box, Pair, Utilities
    ├── exceptions/                   ← InsufficientFundsException, Wallet
    ├── objectessentials/             ← Person, Money, IdGenerator, Priority
    ├── designpatterns/               ← AppSettings, ShapeFactory, Pizza, NewsAgency, PaymentProcessor
    ├── recursion/                    ← RecursionExamples
    ├── complexity/                   ← BigODemo
    ├── strings/                      ← StringClassics
    ├── concurrency/                  ← Counter
    ├── wildcards/                    ← WildcardExamples
    └── reflection/                   ← Important (annotation), Service
```

### How to read it

1. **Start with a `demos/*.java` file** — that's the narrator. It explains the
   concept in prose, runs short experiments, and prints a takeaway at the end.
2. **When a demo references a class** (say `Dog` or `MyHashMap`), open the
   corresponding support package — those files have deep inline comments
   explaining the implementation line by line.
3. **Run the whole thing** to see your reading match the live output.

Some sections (Collections, Lambdas/Streams, JVM internals, Networking, SQL,
REST) are self-contained inside their demo file because they exercise the JDK
directly rather than a custom class.

---

## Bonus: interactive visualizers

The `frontend/` folder has a suite of browser-based visualizers. The full **Dev
Hub** lives at `app.html` — serve it (see [Deploying the Dev Learning
Hub](#deploying-the-dev-learning-hub-devhub) below); opening `index.html` now
redirects there. Individual visualizer files also open standalone — **just
double-click**, no server needed.

**🧪 Try It Live — an embedded mini-IDE on 119 lesson pages.** Every lesson in
the Java, Python, TypeScript, JS-fundamentals, and DSA tracks now opens with a
runnable code editor (`devhub-tryit.js`) right after its intro card: a
predict-first prompt ("what will this print?"), an editable Head First-style
example, and a **▶ Run** button that executes the code *for real* in your
browser — JS/TS in a sandboxed iframe (TS transpiled by the real `typescript`
compiler), Python on real CPython via Pyodide, and Java compiled by the actual
`javac` on a WASM JVM (CheerpJ). Output lines animate in one at a time so you
can follow the trace; edits persist per page, and ↺ Reset restores the
original example. This is the *exploratory* twin of the graded Coding-Practice
IDE (`devhub-codegrade.js`) — no tests, just "change it and see".

**📖 The Head First design language, sitewide — cream by default.** All 513
registered pages carry the full book-style design system (`devhub-hf.css` via
`<html data-hf>`): a warm **cream** colorway by default (dark espresso one tap
away — the toggle is shared with the hub, one stored preference), Playfair
Display headlines with the kicker/statement rhythm, the chapter rail, and a
component vocabulary from Bobby's reference mockups — meta badges, framing
questions, numbered benefit cards, reference grids, speech bubbles, six
mechanism diagrams, predict-first napkins, inline knowledge checks
(`devhub-hf-check.js`), clickable command anatomy and reveal-output terminal
walkthroughs (`devhub-lesson.js`). The Try It editor renders IDE-colored code
while you type. Authored exemplars: the Decorator chapter and CLI Basics; the
site-wide authored sweep is in progress (see `docs/ROADMAP.md`).

**🎨 IDE-grade syntax coloring + the Head First look, sitewide.** Every static
code block on the site is token-colored automatically (`devhub-syntax.js`, on
all 231 pre-bearing pages — keywords, strings, types, calls, comments in the
same palette an IDE uses), and `devhub.css` ships a **Head First kit**:
handwritten sticky notes, annotation arrows pointing into code, ⚡ Brain Power
predict-first boxes, marker-pen highlights, big-type mnemonics, and ❌/✅
exaggerated contrast panels — the *Head First Design Patterns* brain-friendly
vocabulary as drop-in classes, tinted per track. Bold phrases in every lesson's
intro card get a marker sweep automatically.

**📐 The Head First design language.** `devhub-hf.css` is the full
type-and-layout system on top of that kit, opted into per page with
`<html data-hf>` (**520 of 535 pages**). Playfair Display + Dancing Script,
self-hosted as latin-subset WOFF2; a kicker-and-statement rhythm; problem/fix
cards; speech bubbles; napkin predict-notes; and **six mechanism diagrams chosen
by the *shape* of the concept** rather than at random:

| component | the shape it draws | used for |
|---|---|---|
| `.hf-nest` | things contained in things | injector hierarchies, scopes, layers |
| `.hf-slot` | a context with a pluggable piece | strategy, narrowing checks, "which one" |
| `.hf-cast` | one source fanning out to many | events, resolver graphs, `keyof` |
| `.hf-one` | many callers funnelling to one | an event loop, a prototype, a singleton |
| `.hf-steps` | an ordered pipeline, each step gating the next | evaluation order, request paths |
| `.hf-cycle` | a state machine returning to where it started | change detection, retry loops |

It ships a **cream colorway** as well as the dark one. The cream variant lives in
three places and it is worth knowing which owns what before writing a rule: shared
components live in `devhub-hf.css`'s cream block; per-page `<style>` blocks are
repaired at runtime by `devhub-hf-theme.js`, because CSS cannot query a computed
background; and the **13 track landing pages** carry their own inline cream block,
because they link neither of the other two. The default theme is likewise decided
in three bootstraps that must agree — `app.html`, `devhub-hf-theme.js`, and a
pre-paint script in each landing page (in `<head>`, so the page never flashes dark
first). A one-time `devhub-theme-v3` flag moves anyone still carrying the old dark
default onto cream once, then respects every later choice.

**✍️ 102 pages authored to the nine-point teaching bar** in `CLAUDE.md` — the
problem card, the "one thing to remember" callout, a three-way dialogue, one
shape-matched diagram, a knowledge check, "where you've seen this before",
back-row Q&A, and a napkin predict-note. Every one of the **102 knowledge
checks** (`.hf-check`, wired by `devhub-hf-check.js`) was verified by clicking
both a wrong and the correct answer in a real browser, and their correct-answer
positions are balanced across the three slots so "always pick the middle one"
does not beat guessing.

| Visualizer | What it shows |
|---|---|
| [`app.html`](frontend/app.html) | The full Dev Hub — searchable, progress, **519 pages across 34 tracks grouped into categories** (incl. 🍳 *Common Recipes* — practical how-tos like API→form, batch upload, password complexity — the 🟢 *Cloud — GCP*, 🌐 *Web Fundamentals*, 📊 *Data Science & ML*, 🧠 *AI/LLM Engineering*, and 🤖 *AI-Assisted Development* tracks — and 🧑‍💻 *Coding Practice (IDE)*, a real graded-exercise track: write JS/TS/Python/**Java**, run it for real in your browser — Java compiles with the actual `javac` on a WASM JVM (CheerpJ) — pass/fail against hidden tests) (serve it; `index.html` redirects here) |
| [`typescript-playground-visualizer.html`](frontend/typescript-playground-visualizer.html) | 🧪 **TypeScript Playground** — loads the **real** `typescript` compiler: type-checks your code (the same red errors as VS Code/`tsc`), shows the emitted JS, and runs it with live console capture; toggle `strict`/`target` and watch errors change |
| [`python-playground-visualizer.html`](frontend/python-playground-visualizer.html) | 🧪 **Python Playground** — **real CPython** in the browser via Pyodide: `print()`, the stdlib (`json`, `dataclasses`, `itertools`…), real exceptions and full tracebacks — runnable, with presets |
| [`shell-playground-visualizer.html`](frontend/shell-playground-visualizer.html) | 🧪 **Shell Playground** — a working mini-shell with an in-memory filesystem; flip between **Bash / PowerShell / CMD** modes and watch the prompt, command names, pipes, redirection, and variable syntax change with it |
| [`api-playground-visualizer.html`](frontend/api-playground-visualizer.html) | 🧪 **API Playground** — a real in-browser HTTP client: build a request, **Send** fires a live `fetch()`, read the actual status/timing/headers/body; presets (jsonplaceholder, httpbin, GitHub, a CORS error, your local backend) + CORS/auth explainers |
| [`jwt-playground-visualizer.html`](frontend/jwt-playground-visualizer.html) | 🧪 **JWT & Auth Playground** — paste/decode any JWT (claims explained, live expiry), really sign & verify it with Web Crypto, **tamper a claim and watch the signature break**, then map claims → Spring authorities and test `@PreAuthorize` |
| [`spring-boot-playground-visualizer.html`](frontend/spring-boot-playground-visualizer.html) | 🧪 **Spring Boot Playground** — a configurable security simulator: fire a request through the filter chain → URL authz → DispatcherServlet → `@PreAuthorize` and watch **200/401/403/404** flip as you change the caller's authorities; plus a **Live** tab against the real `:8081` backend |
| [`inheritance-visualizer.html`](frontend/inheritance-visualizer.html) | Click any class in the hierarchy to see what it inherits/overrides |
| [`polymorphism-visualizer.html`](frontend/polymorphism-visualizer.html) | Shapes & animals + vtable diagram + overriding vs overloading + gotchas |
| [`linked-list-visualizer.html`](frontend/linked-list-visualizer.html) | Nodes &amp; arrows, plus a race: LinkedList.addFirst() vs ArrayList shift cost |
| [`stack-queue-visualizer.html`](frontend/stack-queue-visualizer.html) | LIFO/FIFO + interactive browser history & print spooler demos |
| [`bst-visualizer.html`](frontend/bst-visualizer.html) | Insert/search/traverse + balanced vs degenerate side-by-side + 3 traversal orders |
| [`hashmap-visualizer.html`](frontend/hashmap-visualizer.html) | Buckets, collisions, chaining, live load factor &amp; auto-resize |
| [`graph-visualizer.html`](frontend/graph-visualizer.html) | BFS, DFS, and BFS-shortest-path lighting up the route from A to B |
| [`sorting-visualizer.html`](frontend/sorting-visualizer.html) | Five sorts with reference cards & race-mode comparison |
| [`searching-visualizer.html`](frontend/searching-visualizer.html) | Linear vs Binary, with code, real-world use, scaling table |
| [`recursion-visualizer.html`](frontend/recursion-visualizer.html) | Call stack + naive-vs-memoized fib + animated Tower of Hanoi |
| [`big-o-visualizer.html`](frontend/big-o-visualizer.html) | Growth curves, per-complexity examples, time-at-scale, 7-question quiz |
| [`concurrency-visualizer.html`](frontend/concurrency-visualizer.html) | Two threads, one counter — watch a race condition happen live |

Each visualizer is a single self-contained HTML file (no build step,
no dependencies). They mirror the corresponding Java implementations
in the support packages.

---

# Deploying the Dev Learning Hub (DevHub)

Beyond the static visualizers, this repo ships a full **Dev Learning Hub** web
app with user accounts and cross-device progress sync:

- **`frontend/`** — the hub app (`app.html`): **510 interactive visualizers** across
  **34 tracks**, a searchable **two-level sidebar** (each track's pages are grouped into
  **collapsible sub-sections**, so you're never faced with hundreds of links at once),
  progress tracking, streaks, and a sign-in/register modal.
  The flow / lifecycle pages default to an **animated step-walk with a live inspector** of
  the real objects at each step (router events, RxJS stream values, `HttpRequest`/`HttpResponse`,
  and — across the **Identity & Auth** track — OAuth/OIDC redirects, JWT claims, SCIM payloads,
  and Conditional-Access decisions). The 🍃 **Spring Boot** core, the entire 🅰️ **Angular** track
  (all **70 pages**), and all new tracks carry the full chip-walk + inspector treatment. Spring covers Architecture,
  Batch, Microservices, Resilience4j, WebSocket, Flyway, Logging, Profiles, Data Specifications,
  Events, Pagination, and **Lombok & Code Generation**. Angular covers every major topic: fundamentals (Components, Binding,
  Directives, Pipes, Services, Lifecycle), reactivity (Signals, RxJS, NgRx, SignalStore), HTTP &
  Interceptors, Forms (Reactive, Template, FormArray, CVA, FormData), Routing, Auth & OIDC, Change
  Detection (Zone.js / OnPush / Zoneless), Defer, CDK & Material, Testing, Lazy Loading, Animations,
  PWA, Workspace Libraries, v21 features, and three Debugging diagnosers. The **🔐 Identity & Auth** track
  now includes an **Authorization Patterns** section with RBAC vs ABAC, JWT claim design, Spring @PreAuthorize SpEL,
  and multi-tenant RBAC, plus a **Tokens, Keys & Signing** deep-dive (symmetric vs asymmetric, JWKS &amp; `kid` rotation,
  and a plain-English glossary of every "key" — session keys, secret keys, signing keys, client secrets, the whole nine yards).
  Language &amp; platform tracks: **🐍 Python** — now expanded well past the basics with **Functions & LEGB scope, Decorators,
  Generators & Iterators, and Exceptions** alongside OOP, collections, type hints, asyncio, and **FastAPI · Django · Flask** — plus **⚛️ React**,
  **🐿️ Go** (now with **web frameworks — Gin/Echo/Fiber**), a **🐘 PHP & Laravel** track (PHP's shared-nothing request
  model, then Laravel lifecycle/routing/middleware/Eloquent), a **💎 Ruby & Rails** track (Ruby's pure-object model — messages,
  blocks, mixins, duck typing — then Rails lifecycle/Active Record/MVC), a **🦀 Rust** track (ownership/borrowing & the borrow
  checker — memory safety without a GC — then the async Tokio/Axum web stack), a capstone **🏗️ Full-Stack Stacks** track
  (how the layers combine — SPA + REST/CIAM, MERN, server-rendered monoliths, compiled API + SPA), a **🟦 Cloud — Azure** track
  (the AZ-204 developer surface: ARM & RBAC, App Service slots & autoscale, Functions & Durable orchestrations,
  ACR/ACI/Container Apps with KEDA, Blob Storage SAS & tiers, Cosmos DB partitions/RUs/consistency, and the
  Key Vault + managed-identity zero-secret pattern — with a matching **AZ-204 practice exam**, **flashcard deck**, and **learning path**), a **🟢 Cloud — GCP** track
  (the Associate Cloud Engineer surface: projects &amp; resource hierarchy IAM, Compute Engine instance templates & MIGs,
  GKE Deployments/Autopilot/Workload Identity, Cloud Run & Functions, Cloud Storage, Cloud SQL/Firestore/BigQuery, and
  Secret Manager + Workload Identity Federation — with a matching **ACE practice exam**, **flashcard deck**, and **learning path**),
  **⎈ Kubernetes**, **🗄️ SQL & Databases**, and a **⌨️ Shell & Scripting** track
  (CLI Basics, **Bash** scripting, **PowerShell**'s object pipeline, and **CMD/Batch**, shown side by side), plus a new
  **🤖 AI-Assisted Development** track — the landscape of AI coding tools (inline vs chat vs agentic, by context and
  autonomy), a **GitHub Copilot** deep dive (inline/chat/Agent mode/custom instructions), and a **Claude Code** deep
  dive (the explore→edit→verify tool loop, Plan Mode, subagent delegation, and policy-enforcing hooks).
  The **🧪 Playgrounds** track now hosts six *live* sandboxes — a **TypeScript Playground** (the real `tsc`: type-checks,
  emits JS, runs it), a **Python Playground** (real CPython via Pyodide, with tracebacks), a **Shell Playground**
  (a working Bash/PowerShell/CMD mini-shell), the **API Playground** (every Send is an actual `fetch()`), the
  **JWT & Auth Playground** (decode/sign/verify with Web Crypto, test `@PreAuthorize`), and the
  **Spring Boot Playground** (simulate the security filter chain → 200/401/403/404, plus a Live tab against `:8081`).
  The **🎓 Exam Prep** track's 16 mock exams (476 questions) are built to *teach*, not just score:
  after each answer **every option explains itself** — ✓ why the correct choice is right, ✗ why each
  distractor is wrong — and every bank passes an anti-guessing audit
  (`frontend/tmp_examtell_audit.mjs`) so the right answer can never be spotted by length or position.
  The **core OOP + full-stack foundation pages** (Polymorphism, HTTP & REST, SQL) now carry the same
  animated chip-walk hero as the flow/lifecycle pages — Polymorphism dramatizes dynamic dispatch vs.
  compile-time overload resolution plus the classic field-access and constructor-ordering interview
  traps; HTTP & REST walks a request through the security filter chain and controller to contrast
  200/404/401/403 and a browser-side CORS block; SQL walks a query through the connection pool,
  planner, and storage engine to contrast an indexed lookup vs. a sequential scan, a committed vs.
  rolled-back transaction, and a blocked SQL-injection attempt.
- **`backend/`** — a Spring Boot 4 API (`devhub-backend`): registration, JWT
  login, and per-user topic progress, backed by H2 (local) or PostgreSQL (prod).

> **📖 New to the hub? Start with the [DevHub Guided Tour](docs/DEVHUB-GUIDE.md).**
> It maps the 34 tracks and hands you ready-made learning paths — including a featured
> *"how a CIAM app works, end to end"* walkthrough (Angular OIDC login → tokens →
> guards → Spring filter chain → method security) — so you're never staring at 340+
> files wondering where to begin.

> **🏗️ Want the full architecture?** See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — C4
> context/container/component diagrams, the data model, the two security filter chains, and a
> sequence diagram for **every** flow (register, login HS256, OIDC RS256, per-request validation,
> RBAC 403/200, navigation, progress sync, account stats, code execution), plus deployment topologies.
>
> Also: **[docs/API-REFERENCE.md](docs/API-REFERENCE.md)** (every endpoint, payloads, curl) and **[docs/SECURITY.md](docs/SECURITY.md)** (token model, RBAC, secrets, threat model, deploy checklist).

You can run it three ways. Pick the one you need:

| Mode | Backend | Accounts? | Use it for |
|---|---|---|---|
| **Visualizers only** | none | no | Just browsing — open `frontend/app.html` (served), or double-click any single visualizer file |
| **Local full stack** | `localhost:8081` (H2) | yes (local) | Developing / trying the whole app |
| **Deployed** | cloud host (Postgres) | yes (real) | Sharing a live URL anyone can sign up to |

### Architecture

```
   Browser                 GitHub Pages              Cloud host (Render)
 ┌──────────┐   HTTPS   ┌────────────────┐   HTTPS  ┌────────────────────┐
 │ app.html │──────────▶│  frontend/     │─────────▶│  devhub-backend    │
 │  + JWT   │◀──────────│  (static)      │◀─────────│  Spring Boot 4 API │
 └──────────┘           │  config.js ────┼──┐       │  /api/auth/*       │
                        └────────────────┘  │       │  /api/progress/*   │
                          config.js tells    │       └─────────┬──────────┘
                          the frontend where  └──set DEVHUB_API_BASE       │
                          the backend lives                          ┌─────▼─────┐
                                                                     │ PostgreSQL │
                                                                     └───────────┘
```

The **one wire** connecting frontend to backend is `frontend/config.js` →
`window.DEVHUB_API_BASE`. It is now **host-aware**: on `*.github.io` it points at your
Render backend (edit that one line), and locally/Docker it falls back to
`http://localhost:8081` (the backend in dev, the nginx origin in Docker).

---

## What the API does — auth, identity & the code runner

The backend is a real, security-hardened API. Two seeded dev accounts let you try
everything immediately (dev profile only; H2 is in-memory so they reset on restart):

| Account | Password | Roles |
|---|---|---|
| `demo`  | `demo12345`  | `ROLE_USER` |
| `admin` | `admin12345` | `ROLE_USER`, `ROLE_ADMIN` |

**Auth & roles (first-party HS256).** Login/register mint a JWT whose `roles` claim
*is* the authorization — the filter reads authorities straight from the token.

| Endpoint | Auth | Purpose |
|---|---|---|
| `POST /api/auth/register` · `POST /api/auth/login` | public | get a JWT (now includes `roles`) |
| `GET /api/auth/me` | Bearer | current user + roles |
| `GET /api/progress/**` | Bearer | progress sync |
| `GET /api/admin/users` · `/api/admin/stats` | `ROLE_ADMIN` | **real 403** for a USER token, 200 for admin |

**OIDC / resource-server (self-hosted RS256).** The backend also acts as a tiny
authorization server + resource server, teaching the exact Entra/Ping pattern with
zero external setup:

| Endpoint | Auth | Purpose |
|---|---|---|
| `GET /oauth2/jwks` | public | the public JWK set (public key only) |
| `POST /oauth2/token` | public | mint an **RS256** token shaped like `spring` / `entra` / `ping` / `keycloak` |
| `GET /api/oidc/userinfo` | RS256 Bearer | validated claims + the authorities they map to |
| `GET /api/oidc/admin` | RS256 + `ROLE_ADMIN` | scope/role-gated → real 403 |

Each IdM's claim shape (`roles`, `scp`, `realm_access.roles`, `group`, `scope`) is mapped
to authorities by `IdmAuthoritiesConverter` — the live version of what the JWT playground
used to only simulate.

**Server-side code runner.** `POST /api/run/{python|typescript|shell}` runs a snippet in a
child process and returns real `stdout`/`stderr`/exit code; `GET /api/run/languages`
advertises which runtimes are available (the UI uses it to enable/disable "Run on server").

- **Safety rails:** wall-clock timeout that force-kills the process tree, output-size cap,
  a **sanitized environment** (only `PATH` — the backend's `JWT_SECRET`/DB creds are *not*
  visible to user code), a per-run temp dir, a concurrency cap, and non-root execution.
- **Auth-gated:** the POST requires a Bearer token (an open runner is RCE). The playgrounds
  auto-sign-in as `demo`.
- **Local prereqs (process mode):** Python is used as-is; TypeScript needs **Node ≥ 22.18**
  (`node --experimental-transform-types`); shell needs a POSIX shell, so it's **Docker-only**
  on Windows (the simulator stays as the local fallback).
- **Disabled in prod by default** (`EXEC_ENABLED=false`) — see Part 2.

**Live playground pages** that exercise all of the above against the real backend:
`Auth & Identity (Live)`, the `JWT & Auth Playground` ("fetch a real token"), the
`Spring Boot Playground` (Live tab), and the Python/TypeScript/Shell playgrounds'
"Run on server" toggle.

---

## Prerequisites

| Tool | Why | Check |
|---|---|---|
| **Java 21** | build/run the backend | `java -version` |
| **Git + GitHub account** | host the frontend on Pages | `git --version` |
| **A backend host** | run the API in the cloud | [Render](https://render.com) free tier (used below); Railway or Fly.io also work |
| **A static file server** | serve the frontend locally | VS Code "Live Server", or Python 3, or `npx serve` |
| **Python 3 / Node ≥ 22.18** *(optional)* | the playgrounds' "Run on server" mode (process-mode); not needed for auth | `python --version` · `node --version` |
| **Docker** *(optional)* | run the full stack in containers + server-side **shell** execution | `docker --version` |

Maven is **not** required — the repo ships the Maven wrapper (`mvnw` / `mvnw.cmd`).

---

## Part 1 — Run the full stack locally

### Quickest: one command (starts both halves)

From the **project root**, this starts the backend and frontend together, waits for
the backend to be healthy, and opens the hub:

Git Bash / macOS / Linux:
```
./startapp.sh
```
Windows PowerShell:
```
.\dev.ps1
```

Both **reuse an already-running backend** on `:8081` (safe to run when you already
have one going), serve the frontend on `:5500`, and open
**<http://localhost:5500/app>** — the hub. Press **Ctrl+C** to stop what the
script started. Useful flags: `--frontend-only` / `-FrontendOnly` (skip the backend —
fast, just browse the pages) and `--no-browser` / `-NoBrowser`.

### Docker mode (closest to production)

Want to test with real containers — multi-stage Docker build, nginx, production
JAVA_OPTS — without pushing to Render? One extra flag:

```bash
./startapp.sh --docker
```

What this does:
1. Runs `mvn package -DskipTests` to produce the layered jar.
2. Builds the backend image (`backend/Dockerfile` — Alpine JRE, non-root `spring`
   user, `HEALTHCHECK`).
3. Starts both services via `docker-compose.yml`:
   - **backend** → <http://localhost:8080> (Spring Boot, H2 dev profile)
   - **frontend nginx** → <http://localhost:8081> (nginx serves static files,
     proxies `/api/` to the backend container)
4. Opens <http://localhost:8081/app> in your default browser.

First build takes ~2 min (Docker downloads the JDK build image + Alpine JRE base).
Subsequent runs reuse the layer cache and are much faster.

> **Requires** Docker Desktop (or Docker Engine + Compose plugin) installed and
> running. Windows: Docker Desktop with WSL 2 backend recommended.

Prefer to run the halves by hand? The manual steps follow.

### Manual — two terminals

**Terminal 1 — start the backend** (in-memory H2, resets on restart, port 8081):

Windows (PowerShell or cmd):
```
.\mvnw.cmd -f backend\pom.xml spring-boot:run
```
macOS / Linux:
```
./mvnw -f backend/pom.xml spring-boot:run
```
Verify it's up: open <http://localhost:8081/actuator/health> → `{"status":"UP"}`.
(Dev DB browser: <http://localhost:8081/h2-console>, JDBC URL `jdbc:h2:mem:devhubdb`, user `sa`, no password.)

**Terminal 2 — serve the frontend on port 5500.** Don't just double-click
`app.html` — a `file://` page is blocked from calling the API by CORS. Serve it
from port **5500**, which the backend already allow-lists. **`cd` into `frontend`
first**, then run the bundled dev server:

Windows (Python):
```
cd frontend
py devserver.py 5500
```
macOS / Linux (Python 3):
```
cd frontend
python3 devserver.py 5500
```

Then open the hub at **<http://localhost:5500/app>**.

> **Why `devserver.py` and not `python -m http.server`?** `devserver.py` is a tiny
> stdlib static server that adds **clean-URL** support: a request for `/app` serves
> `app.html`. That dodges a genuinely confusing trap — `npx serve` 301-redirects
> `/app.html` → `/app`, **browsers cache that 301 permanently**, and afterwards a
> plain `http.server` returns **404 on `/app`** (there's no such file on disk). Once
> a browser has that cached redirect, it rewrites `/app.html` → `/app` *before it
> even contacts the server*, so the hub won't load. `devserver.py` resolves both
> `/app` and `/app.html` and never issues a 301, so it loads either way and can't
> poison the cache. (No Python? `npx serve -l 5500` from inside `frontend/` also does
> clean URLs — open `/app`.)

The bare URL **<http://localhost:5500/>** redirects to the hub — `index.html` is now a
tiny redirect stub that forwards to **`/app.html`** (the hub itself). The old landing
page is archived at **<http://localhost:5500/index-legacy.html>**. Leave `frontend/config.js` set to
`null` for local dev (it then auto-targets `http://localhost:8081`). You can now
register a local account and everything syncs to the local H2 database.

---

## Part 2 — Deploy the backend (Render + PostgreSQL)

> **☁️ Deploying to AWS or Azure instead?** See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** — a
> single "lift your working local stack to the cloud" guide covering **Render**, **AWS App Runner**,
> and **Azure Container Apps**, with ready-made config files (`deploy/aws/`, `deploy/azure/`) and
> manual-dispatch CI/CD workflows. The same image and env vars run on all three; only the host changes.

> Render's free tier is used here because it has a one-click Postgres and builds
> straight from the included `backend/Dockerfile`. Railway and Fly.io follow the
> same shape — point them at the `backend/` dir and set the same env vars.

1. **Push your repo to GitHub** (if you haven't already).

2. **Create the database:** Render dashboard → **New + → PostgreSQL** → give it a
   name → **Create**. When it's ready, open its **Info** page and note: *hostname*,
   *port* (5432), *database*, *username*, *password*.

3. **Create the web service:** **New + → Web Service** → connect your repo, then:
   - **Root Directory:** `backend`
   - **Runtime:** `Docker` (auto-detected from `backend/Dockerfile`)
   - **Instance Type:** `Free`

4. **Add environment variables** (service → **Environment**):

   | Key | Value | Notes |
   |---|---|---|
   | `SPRING_PROFILES_ACTIVE` | `prod` | switches to Postgres |
   | `DATABASE_URL` | `jdbc:postgresql://HOST:5432/DBNAME` | ⚠ **must** start with `jdbc:postgresql://` — see below |
   | `DATABASE_USERNAME` | *(your db user)* | |
   | `DATABASE_PASSWORD` | *(your db password)* | |
   | `JWT_SECRET` | *(random 32+ char string)* | signs login tokens — keep it secret |
   | `CORS_ALLOWED_ORIGINS` | `https://YOURNAME.github.io` | your Pages origin (Part 3); no trailing slash |

   Optional:

   | Key | Value | Notes |
   |---|---|---|
   | `EXEC_ENABLED` | `false` *(default in prod)* | ⚠ leave **off** on a public host — an open code runner is remote code execution. Only enable on a throwaway, isolated instance you fully control. |
   | `APP_DEMO_ENABLED` + `APP_DEMO_USERNAME` + `APP_DEMO_PASSWORD` | e.g. `true` / `demo` / *(a password)* | seed a single read-only `ROLE_USER` demo account so the auth playgrounds work on the public site. No default credentials are ever shipped to prod. |
   | `OIDC_ISSUER` / `OIDC_AUDIENCE` | *(strings)* | identify the self-hosted OIDC tokens; defaults are fine. The RSA signing key is generated at startup (a single Render instance is fine). |

   > **Note:** the prod image can be built lean with `--build-arg INCLUDE_RUNTIMES=false`
   > (skips Python/Node/bash) since code execution is off in prod anyway.

   > **The `DATABASE_URL` gotcha:** Render shows a URL like
   > `postgres://user:pass@host:5432/db`. Java/JDBC needs a different shape — build
   > `DATABASE_URL` as `jdbc:postgresql://HOST:5432/DBNAME` (host + db only) and put
   > the user/password in their own variables. Don't paste Render's raw URL.

5. **Deploy.** First build takes ~3–5 min. When live, check
   `https://YOUR-SERVICE.onrender.com/actuator/health` → `{"status":"UP"}`. On
   first boot the app auto-creates the `users` and `topic_progress` tables.

**Good to know:**
- **HTTPS is automatic** on Render — and *required*, because GitHub Pages is HTTPS
  and browsers block HTTPS→HTTP "mixed content" requests.
- **Free tier sleeps** after ~15 min idle; the next request wakes it (~50s cold
  start). During that wait the app falls back to anonymous mode — just retry once
  it's awake.
- **Generate a `JWT_SECRET`:** any long random string, e.g.
  `openssl rand -base64 48` (macOS/Linux) or
  `[Convert]::ToBase64String((1..48|%{Get-Random -Max 256}))` (PowerShell).

---

## Validating the frontend before you push

The Pages deploy is **gated on `tmp_vcheck.mjs`** — a red vcheck blocks it
(`.github/workflows/deploy.yml`). All of these run from `frontend/` and need no
install beyond Node; the browser ones use the Chromium that Playwright already
resolved.

| command | what it catches | runtime |
|---|---|---|
| `node tmp_vcheck.mjs` | encoding, registry both directions, required shared scripts, internal links, duplicate registrations, inline-`<script>` parse errors, `.hf-check` wiring, CSS theme-selector shape | ~0.4s, all 535 pages |
| `node tmp_smoke.mjs` | uncaught JS errors and horizontal overflow, in a real browser at **320px** (not 390 — 320 is where a rigid grid track actually breaks). Network-only failures are reported separately, because a sandbox with no CDN fails every CDN load | a few minutes |
| `node tmp_assetcheck.mjs <ref>` | any **loss** of a teaching asset (Try It Live, CodeWalk, `rt-stage`, quiz, flashcards) versus a git ref — run it after any bulk edit that splices markup | seconds |
| `node tmp_contrast.mjs --theme=cream` | text under a 2.2:1 contrast floor, grouped by selector so you fix causes not instances. `--inject=candidate.css` tries a fix without editing the site | a few minutes |
| `node tmp_hfaudit.mjs --top=20` | ranks lesson pages against the nine-point teaching bar, thinnest first | ~1s |
| `node tmp_examtell_audit.mjs` | position and length tells in the exam banks — run after any bank edit | ~1s |

Two caveats worth knowing before you act on output:

- **vcheck proves inline scripts *parse*, not that they run.** That is why
  `tmp_smoke.mjs` exists and why "vcheck is green" is not the same as "the page
  works".
- **`tmp_hfaudit.mjs` reads markup, not meaning.** A low score means *go look*,
  never a verdict, and a high score means "has the parts", never "is good". Its
  `explain` dimension in particular divides by `<pre>` count, so a page of
  one-line snippets scores as though they were unexplained programs.

## Part 3 — Deploy the frontend (GitHub Pages)

1. **Point the frontend at your backend.** Edit `frontend/config.js`:
   ```js
   window.DEVHUB_API_BASE = 'https://YOUR-SERVICE.onrender.com';
   ```
   (HTTPS, no trailing slash.)

2. **Enable Pages once — do this BEFORE your first push.** Repo **Settings →
   Pages → Build and deployment → Source: GitHub Actions**. This is what creates
   the Pages "site"; skip it and the very first deploy fails at the *Setup Pages*
   step with **`Get Pages site failed … HttpError: Not Found`** (the action can't
   find a site that doesn't exist yet).
   *(The workflow also sets `enablement: true` on `actions/configure-pages`, so it
   will try to create the site automatically — but enabling it once in Settings is
   the guaranteed path, especially on org repos that restrict Actions.)*

3. **Commit & push to `master`.** The included workflow
   (`.github/workflows/deploy.yml`) publishes the `frontend/` folder to Pages on
   every push. Watch it under the repo's **Actions** tab.

4. **Open your app** at:
   - Project page: `https://YOURNAME.github.io/REPO-NAME/app.html`
   - or user page (repo named `YOURNAME.github.io`): `https://YOURNAME.github.io/app.html`

5. **Match CORS:** ensure the backend's `CORS_ALLOWED_ORIGINS` equals your Pages
   **origin** exactly — scheme + host only, e.g. `https://YOURNAME.github.io`
   (no path, no trailing slash). Change it on Render and redeploy if needed.

---

## Part 4 — Register / sign up

The app is usable anonymously immediately (progress saved in the browser). To get
an account and sync across devices:

1. In the deployed app, click **Sign in** (top-right) → **Register** tab.
2. Enter a **username** (3+ chars), **email**, and **password** (8+ chars) →
   **Create account**. You're signed in right away (a JWT is stored in your
   browser).
3. If you had anonymous progress, a banner offers to **import** it into your new
   account — one click and it's synced server-side.
4. On your next visit (or another device), click **Sign in** with the same
   credentials and your progress loads from the server.

There's no seed/admin user — the **first person to register is the first account**.
Passwords are stored bcrypt-hashed in your Postgres database; the API never
returns them.

---

## Troubleshooting

> 💻 For the **command-line versions** of these checks — curl / PowerShell one-liners
> to test health, run the full auth round-trip, reproduce a CORS preflight, and decode
> a JWT — see the [Command-Line Runbook in HELP.md](HELP.md#command-line-runbook).

| Symptom | Cause & fix |
|---|---|
| **Deploy workflow fails** at *Setup Pages*: `Get Pages site failed … HttpError: Not Found` | Pages was never enabled for the repo. **Settings → Pages → Source: GitHub Actions** (once), then re-run the failed job. The workflow's `enablement: true` tries to self-create it, but org-restricted repos still need the manual toggle. |
| Deploy log warning: **"Node.js 20 actions are deprecated"** | Just a warning, not a failure — bump the action versions (this repo pins `checkout@v6`, `configure-pages@v6`, `upload-pages-artifact@v5`, `deploy-pages@v5`, which run on Node 24). |
| Browser console: **CORS** / "blocked by Access-Control-Allow-Origin" | `CORS_ALLOWED_ORIGINS` ≠ your Pages origin. Set it to exactly `https://YOURNAME.github.io` and redeploy the backend. |
| Console: **"Mixed Content … was loaded over HTTPS but requested an insecure resource"** | `config.js` points to an `http://` URL. It must be `https://`. |
| Login spins ~50s, then works | Render free-tier **cold start** — normal after idle. |
| Login fails but the app still works | Backend unreachable or `config.js` URL wrong → app fell back to **anonymous** mode. Verify `DEVHUB_API_BASE` and that `/actuator/health` is `UP`. |
| Backend log: **"relation 'users' does not exist"** | Tables weren't created. Confirm `SPRING_PROFILES_ACTIVE=prod`; prod uses `ddl-auto: update` which creates them on boot. Check the DB env vars are correct. |
| Backend won't start / DB connection errors | `DATABASE_URL` must be `jdbc:postgresql://HOST:5432/DBNAME`; username/password in their own vars (not embedded in the URL). |
| Logged in, then every call is **401** | `JWT_SECRET` changed between deploys → old tokens are invalid. Sign out and back in. |
| Docker build can't find the jar | Build from the `backend/` directory (that's the Docker context); `Root Directory: backend` on Render handles this. |

---

## Scope — the Java walkthrough vs. DevHub

The **Java console walkthrough** (the 26 sections above) stays tightly focused on
entry-level fundamentals. It deliberately leaves a few things to dedicated study:

- Build-tool internals (Maven/Gradle), the Java memory model (`volatile`,
  happens-before), and advanced concurrency (locks, semaphores, `CompletableFuture`).

Other topics it skips **because the DevHub hub now covers them as full interactive
tracks** — see the [DevHub Guided Tour](docs/DEVHUB-GUIDE.md):

- **Spring** (REST, JPA/Hibernate, security &amp; identity, async) → 🍃 Spring Boot track
- **Frontend frameworks** → 🅰️ Angular + 🔷 TypeScript tracks
- **Cloud &amp; containerization** (AWS, Docker) → ☁️ Cloud and 🛠️ Dev Tools tracks
- **OAuth2 / OIDC, Entra ID, Ping** → 🔐 Identity &amp; Auth + the Spring *Security &amp; Identity* pages

---

## License

Personal study project — use freely.
