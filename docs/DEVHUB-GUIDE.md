
# DevHub — a Guided Tour

> **New here? Don't try to read all 283 pages.** Pick a *path* below and follow it.
> Every page is a single, self-contained interactive visualizer — open it, press the
> button, watch the concept animate. No build step, no account required.

DevHub is a learning hub: **300+ browser visualizers** across **15 tracks**, plus a
small Spring Boot backend that adds optional accounts + progress sync. This guide is
the map. To *run* it (locally or deployed), see the main [README](../README.md); for a
copy-paste **command-line runbook** (build/run, the auth round-trip via curl, and
deployment troubleshooting), see [HELP.md](../HELP.md#command-line-runbook).

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
| 🔐 **Identity & Auth** | OAuth2/OIDC, Entra ID, Ping, tokens & claims | open via the hub |
| 🐛 **Debugging** | find bugs faster: CORS, 401-vs-403, JWTs (more stacks coming) | [CORS Failures](../frontend/debugging-cors-visualizer.html) |
| 🧪 **Playgrounds** | live, hands-on sandboxes — fire real requests, read real responses | [API Playground](../frontend/api-playground-visualizer.html) |
| 🐍 **Python** | fundamentals, OOP, collections, type hints, asyncio, FastAPI | [Python Fundamentals](../frontend/python-fundamentals-visualizer.html) |
| ⚛️ **React** | JSX/Fiber, hooks, state management, Router v6, forms, performance | [React Fundamentals](../frontend/react-fundamentals-visualizer.html) |
| 🐿️ **Go** | types, goroutines/channels, interfaces, errors, HTTP server, generics | [Go Fundamentals](../frontend/go-fundamentals-visualizer.html) |

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
  · [Log vs Debugger](../frontend/debugging-logging-vs-stepping-visualizer.html).
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
| 🔐 Identity & Auth | `track-identity` | cyan |
| &nbsp;&nbsp;↳ Ping pages (`ping-*`) | `track-ping` | Ping red |
| 🐛 Debugging | `track-debug` | orange |
| 🐍 Python | `track-python` | Python blue + yellow |
| ⚛️ React | `track-react` | React cyan → sky |
| 🐿️ Go | `track-go` | Go gopher blue |

To add one: create `frontend/<name>-deep-visualizer.html`, link `devhub.css` and set
the right `track-*` body class, then register it in the `TRACKS` array in
`frontend/app.html` (track → section → `{ title, file, level }`). Cross-link related
pages so a learner can follow a thread — that's what makes the hub feel like a wiki
rather than a pile of pages.

---

*This guide is updated as new tracks and deep-dives land. Last refreshed with a big
**extreme-viz hero** wave — an animated step-walk with a gliding chip and a **live
inspector of the real per-step objects** across happy-path / blocked / error / edge-case
scenarios. The hero is now the lead element on the **Component Lifecycle** (SimpleChanges,
@ViewChild timing, OnPush mutation), **Signals** (set→dirty→recompute→effect, equality
gate), the whole **RxJS family** (Observable lifecycle, the operator pipe, multicasting's
shared-execution counter, custom-operator internals), **Pagination** (the full HttpParams →
Spring `Pageable` → `Page<T>` round-trip), and state management (**NgRx** action→reducer→
selector, **SignalStore** `patchState`, and a **State-Patterns** hero that runs the *same*
update through all four architectures) — on top of the earlier Routing / RxJS Lab / HTTP
set. Also new: a **Head First Design Patterns** sub-track in ☕ Java — **9 chapters** retold with
the book's voice (Brain Power, "no Dumb Questions", design-principle boxes) and the same
animated hero: [Strategy / SimUDuck](../frontend/head-first-strategy-visualizer.html),
[Observer / Weather Station](../frontend/head-first-observer-visualizer.html),
[Decorator / Starbuzz](../frontend/head-first-decorator-visualizer.html),
[Factory / Pizza Store](../frontend/head-first-factory-visualizer.html),
[Singleton / Chocolate Boiler](../frontend/head-first-singleton-visualizer.html),
[Command / Remote Control](../frontend/head-first-command-visualizer.html),
[Adapter &amp; Facade](../frontend/head-first-adapter-facade-visualizer.html),
[Template Method / Coffee &amp; Tea](../frontend/head-first-template-method-visualizer.html), and
[State / Gumball Machine](../frontend/head-first-state-visualizer.html) — plus an inline SVG **favicon** for the hub.
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
