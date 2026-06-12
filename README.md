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

| Visualizer | What it shows |
|---|---|
| [`app.html`](frontend/app.html) | The full Dev Hub — searchable, progress, **283 pages grouped into collapsible sub-sections** (serve it; `index.html` redirects here) |
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

- **`frontend/`** — the hub app (`app.html`): 283 interactive visualizers across
  12 tracks, a searchable **two-level sidebar** (each track's pages are grouped into
  **collapsible sub-sections**, so you're never faced with hundreds of links at once),
  progress tracking, streaks, and a sign-in/register modal.
  The flow / lifecycle pages default to an **animated step-walk with a live inspector** of
  the real objects at each step (router events, RxJS stream values, `HttpRequest`/`HttpResponse`,
  and — across the **Identity & Auth** track — OAuth/OIDC redirects, JWT claims, SCIM payloads,
  and Conditional-Access decisions). The new **🧪 Playgrounds** track adds *live* sandboxes —
  the **API Playground** is a real in-browser HTTP client (every Send is an actual `fetch()`), and the
  **JWT & Auth Playground** decodes any token, really signs/verifies it (Web Crypto), and tests `@PreAuthorize` live;
  the **Spring Boot Playground** simulates the security filter chain — fire a request and watch it land on 200/401/403/404
  as you change the caller's authorities (plus a Live tab against the real `:8081` backend).
- **`backend/`** — a Spring Boot 4 API (`devhub-backend`): registration, JWT
  login, and per-user topic progress, backed by H2 (local) or PostgreSQL (prod).

> **📖 New to the hub? Start with the [DevHub Guided Tour](docs/DEVHUB-GUIDE.md).**
> It maps the 12 tracks and hands you ready-made learning paths — including a featured
> *"how a CIAM app works, end to end"* walkthrough (Angular OIDC login → tokens →
> guards → Spring filter chain → method security) — so you're never staring at 283
> files wondering where to begin.

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
`window.DEVHUB_API_BASE`. Set it to your backend's URL and everything connects.

---

## Prerequisites

| Tool | Why | Check |
|---|---|---|
| **Java 21** | build/run the backend | `java -version` |
| **Git + GitHub account** | host the frontend on Pages | `git --version` |
| **A backend host** | run the API in the cloud | [Render](https://render.com) free tier (used below); Railway or Fly.io also work |
| **A static file server** | serve the frontend locally | VS Code "Live Server", or Python 3, or `npx serve` |

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
