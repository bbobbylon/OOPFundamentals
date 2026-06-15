# DevHub — Security Model

> How `devhub-backend` authenticates, authorizes, and protects itself: the two token
> types, the dual filter chains, secrets handling, RBAC, CORS/CSRF, the sandboxed code
> runner, a threat-model table, and a deployment checklist.
>
> **See also:** [ARCHITECTURE.md](ARCHITECTURE.md) (§8 chains, §9 flows) · [API-REFERENCE.md](API-REFERENCE.md) (authz matrix).

---

## 1. Principles

- **Stateless.** No server session (`SessionCreationPolicy.STATELESS`); identity + roles travel in a signed JWT, so any instance can serve any request.
- **Defense in depth.** URL-level rules *and* method-level `@PreAuthorize` enforce the same authorities; the frontend also hides what a user can't use (UX), but the backend is the boundary.
- **Two isolated chains.** First-party HS256 and self-hosted OIDC RS256 never mix — each path validates only its own token type.
- **Fail fast, fail closed.** A missing/weak secret stops startup; a bad token yields `401`; an insufficient role yields `403`. There is no "open by default."

---

## 2. Token model

### 2.1 First-party (HS256) — `JwtService`

- Symmetric **HS256**, signed with `app.jwt.secret`. Claims: `sub` (username), `roles` (list), `iat`, `exp` (24h, `app.jwt.expiration-ms`).
- Authorization reads the `roles` claim directly off the token — no DB hit per request (the point of a self-contained JWT).
- `JwtAuthFilter` validates on every default-chain request: signature, expiry, and that the subject matches the loaded user.

### 2.2 Self-hosted OIDC (RS256) — `OidcKeyConfig` + `OidcTokenService`

- Asymmetric **RS256**. The private key is held in memory (generated at startup); the public key is published at `GET /oauth2/jwks` (public modulus/exponent only — the private key never leaves the server).
- `POST /oauth2/token` mints an IdM-shaped token (`spring`/`entra`/`ping`/`keycloak`); the OIDC chain's resource server verifies it against the JWKS.
- `IdmAuthoritiesConverter` normalizes each IdM's claim shape (`roles`, `scp`, `realm_access.roles`, `group`) into Spring authorities — the live version of what the JWT playground used to only simulate.

---

## 3. The two filter chains

Both are stateless, CSRF-off, CORS-on. Spring evaluates them in `@Order` and picks the first whose matcher accepts the request.

| | Chain 1 — OIDC (`@Order(1)`) | Chain 2 — default (`@Order(2)`) |
|--|------------------------------|----------------------------------|
| **Matches** | `/api/oidc/**`, `/oauth2/**` | everything else |
| **Validates** | RS256 via JWKS (`oauth2ResourceServer.jwt`) | HS256 via `JwtAuthFilter` |
| **Public** | `/oauth2/jwks`, `/oauth2/token`, `OPTIONS` | `POST /api/auth/{register,login}`, `/actuator/{health,info}`, `GET /api/run/languages`, `/h2-console/**` (dev), `OPTIONS` |
| **Else** | `authenticated()` | `authenticated()` |

`@EnableMethodSecurity` activates `@PreAuthorize("hasRole('ADMIN')")` on `AdminController` and `/api/oidc/admin`. 401s and 403s are returned as JSON by custom `AuthenticationEntryPoint` / `AccessDeniedHandler`.

---

## 4. Authentication &amp; authorization

- **AuthN:** `DaoAuthenticationProvider` + `BCryptPasswordEncoder` verify the password at login; thereafter the token is the credential.
- **AuthZ:** role-based. A user has `ROLE_USER` and optionally `ROLE_ADMIN` (an eager `@ElementCollection`). `hasRole('ADMIN')` matches the `ROLE_ADMIN` authority. Admin endpoints enforce it at both the URL and method layers.

---

## 5. Secrets management

| Secret | Handling |
|--------|----------|
| **`JWT_SECRET`** (HS256 key) | **Required, no committed default.** Base `application.yml` declares `${JWT_SECRET}` with *no* fallback; the **dev** profile supplies a dev-only key so local boots env-free; **prod has no fallback**, so a missing secret fails startup instead of silently signing with a public key. `JwtService.validateSecret()` (`@PostConstruct`) rejects any key < 256 bits. |
| **`DATABASE_URL` / `_USERNAME` / `_PASSWORD`** | Env-only in prod (no defaults → fail fast). Never committed. |
| **OIDC RSA key** | Generated at startup, in memory; only the public half is exposed (JWKS). |
| **`.env`** | Local only, git-ignored. Generate a strong `JWT_SECRET` with `openssl rand -base64 48` (or the PowerShell equivalent). |

> **Why this matters:** before the hardening, a prod deploy that forgot to set `JWT_SECRET` would inherit the committed dev key — letting anyone forge an admin token. The fix makes that impossible: prod cannot start without a real secret, and a too-short one is rejected at boot.

---

## 6. Credential storage &amp; seeding

- Passwords are **BCrypt-hashed**; the hash is never returned by any endpoint (DTOs omit it).
- **No default credentials in prod.** `DataInitializer` seeds `demo`/`admin` **only** under the `dev` profile. For a public demo login you must opt in explicitly with `APP_DEMO_ENABLED=true` + `APP_DEMO_USERNAME` + `APP_DEMO_PASSWORD`, which creates a single `ROLE_USER` account — never an admin.

---

## 7. Transport, CORS &amp; CSRF

- **CORS:** an explicit origin allow-list (`app.cors.allowed-origins`, env-overridable), `allowCredentials=true`, applied to `/api/**` and `/oauth2/**`. **No wildcard origin** is used with credentials (which browsers forbid and which would be unsafe).
- **CSRF:** disabled by design — this is a token-in-`Authorization`-header API with no cookies, so there is no CSRF surface.
- **HTTPS:** required in cloud. GitHub Pages is HTTPS, so the backend must be HTTPS too — a `http://` backend triggers browser mixed-content blocking. Render/Railway/Fly provide HTTPS automatically.

---

## 8. The code-execution sandbox

`POST /api/run/{language}` runs user code, so it is the highest-risk surface and is defended in layers:

1. **Auth-gated** — requires a Bearer token (an open runner is remote code execution).
2. **Off in prod** — `app.exec.enabled=false` by default; only enable on a throwaway, isolated instance you fully control.
3. **Process isolation** — each run is a child process with a **wall-clock timeout** that force-kills the process tree, an **output-size cap**, a **per-run temp dir**, and a **concurrency cap**.
4. **Sanitized environment** — the child sees only `PATH`; the backend's `JWT_SECRET` and DB credentials are **not** exposed to user code.
5. **Non-root** — the container runs as an unprivileged user, so spawned processes are unprivileged too.

---

## 9. Operational surface

- **Actuator** exposes only `health` and `info` — not `env`, `beans`, `mappings`, etc.
- **H2 console** is enabled only in dev (Postgres in prod has none); the `permitAll` matcher for it is inert in prod.

---

## 10. Threat model (summary)

| Threat | Mitigation | Residual |
|--------|------------|----------|
| Token forgery | Signature verification (HS256 secret / RS256 JWKS); prod requires a real secret | — |
| Privilege escalation | RBAC at URL + method level (`@PreAuthorize`) | — |
| Credential theft from DB | BCrypt hashing; hash never returned | — |
| SQL injection | JPA/parameterized access (no string-built SQL) | — |
| CSRF | No cookies; token-in-header; CSRF disabled intentionally | — |
| RCE via code runner | Auth-gated, prod-off, sandboxed child process, sanitized env | Enable only on isolated hosts |
| Default credentials | None in prod; dev-only seeding | — |
| **Brute-force login** | *(none yet)* | **No rate limiting on `/api/auth/login` or `/oauth2/token`** |
| **Long-lived tokens** | 24h expiry | **No refresh/rotation; no revocation list** |
| **Key compromise (OIDC)** | Public/private split | **In-memory key; no rotation; multi-instance mismatch** |

---

## 11. Deployment security checklist

- [ ] `SPRING_PROFILES_ACTIVE=prod`
- [ ] `JWT_SECRET` set to a strong random value (≥ 32 bytes) — the app refuses to start otherwise
- [ ] `DATABASE_URL` / `DATABASE_USERNAME` / `DATABASE_PASSWORD` set; DB reachable over TLS
- [ ] `CORS_ALLOWED_ORIGINS` = your exact Pages origin (scheme + host, no trailing slash)
- [ ] `EXEC_ENABLED` **unset/false** unless this is a throwaway, isolated instance
- [ ] Backend served over **HTTPS** (matches the HTTPS Pages frontend)
- [ ] `APP_DEMO_*` left unset unless you intend a public read-only demo account
- [ ] Health probe → `GET /actuator/health`

---

## 12. Hardening roadmap (future work)

- **Rate limiting / lockout** on the auth + token endpoints (per-IP/per-account sliding window).
- **Refresh tokens + rotation** with reuse detection; shorter access-token TTL; a revocation path.
- **Persistent, rotating OIDC keypair** (or delegate to a real IdP) so RS256 tokens survive restarts and scale horizontally.
- **DB migrations** (Flyway/Liquibase, `ddl-auto: validate`) instead of `update` in prod.
- **Audit logging** of security events (logins, role-gated denials, code-runner use).
