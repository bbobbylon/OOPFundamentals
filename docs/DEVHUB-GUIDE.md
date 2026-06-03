# DevHub — a Guided Tour

> **New here? Don't try to read all 240+ pages.** Pick a *path* below and follow it.
> Every page is a single, self-contained interactive visualizer — open it, press the
> button, watch the concept animate. No build step, no account required.

DevHub is a learning hub: **240+ browser visualizers** across **11 tracks**, plus a
small Spring Boot backend that adds optional accounts + progress sync. This guide is
the map. To *run* it (locally or deployed), see the main [README](../README.md); for a
copy-paste **command-line runbook** (build/run, the auth round-trip via curl, and
deployment troubleshooting), see [HELP.md](../HELP.md#command-line-runbook).

The fastest way in: open **`frontend/app.html`** — the hub — and use the sidebar.
Or jump straight to any file linked below.

---

## The tracks at a glance

| Track | What it covers | Good first page |
|---|---|---|
| ☕ **Java — OOP & Language** | encapsulation, inheritance, polymorphism, generics, concurrency, JVM | [`inheritance-visualizer.html`](../frontend/inheritance-visualizer.html) |
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

---

## How the deep-dive pages are built (for contributors)

Each visualizer is **one self-contained HTML file** — inline CSS + vanilla JS, no
dependencies, no build. The `*-deep` / `*-lab` companions follow a consistent shape:

- A dark theme with a per-track accent (Spring green, Angular red, TypeScript blue).
- Numbered sections: intro → **one interactive** → reference tables/code → a "gotchas"
  card → a one-sentence recap.
- The interactive is a small state machine that animates **~800 ms per step** so each
  step reads as a beat, not a flash.
- Syntax-highlighted code via `<span>` classes (`.kw`, `.fn`, `.str`, `.type`, …).

To add one: create `frontend/<name>-deep-visualizer.html`, then register it in the
`TRACKS` array in `frontend/app.html` (track → section → `{ title, file, level }`).
Cross-link related pages so a learner can follow a thread — that's what makes the
hub feel like a wiki rather than a pile of pages.

---

*This guide is updated as new tracks and deep-dives land. Last refreshed with the new
**🐛 Debugging track** (CORS failures, 401-vs-403, JWT decode & diagnose) — on top of
the completed **CIAM round-trip** (BFF & Token Relay, OpenAPI → Typed Client, Full-Stack
Round-Trip capstone) and the Spring **Security & Identity** section.*
