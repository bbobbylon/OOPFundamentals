# DevHub — API Reference

> Every endpoint of `devhub-backend`, grouped by controller, with method, path, the
> security chain that guards it, request/response shapes, status codes, and curl.
>
> **See also:** [ARCHITECTURE.md](ARCHITECTURE.md) (flows + diagrams) · [SECURITY.md](SECURITY.md) (auth model) · [HELP.md](../HELP.md#command-line-runbook) (runbook).

---

## Conventions

- **Base URL:** `http://localhost:8081` (local dev) · nginx origin in Docker · your Render HTTPS URL in cloud. The frontend derives this from `config.js` → `window.DEVHUB_API_BASE`.
- **Content type:** `application/json` for all request/response bodies (except the actuator).
- **Auth header:** `Authorization: Bearer <token>`.
- **Two token types** (see [SECURITY.md](SECURITY.md)):
  - **HS256, first-party** — from `POST /api/auth/login` / `register`. Validates on the **default** filter chain. Use for `/api/auth/*`, `/api/progress/*`, `/api/admin/*`, `/api/run/*`.
  - **RS256, self-hosted OIDC** — from `POST /oauth2/token`, verified against `/oauth2/jwks`. Validates on the **OIDC resource-server** chain. Use for `/api/oidc/*`.
- **Seeded dev accounts** (dev profile only): `demo` / `demo12345` (`ROLE_USER`), `admin` / `admin12345` (`ROLE_USER`, `ROLE_ADMIN`).

### Status codes used

| Code | Meaning |
|------|---------|
| `200 OK` / `201 Created` / `204 No Content` | success |
| `400 Bad Request` | validation failure / unsupported run language |
| `401 Unauthorized` | missing/invalid/expired token, or bad login credentials |
| `403 Forbidden` | authenticated but lacks the required role |
| `409 Conflict` | registration with a taken username/email |
| `503 Service Unavailable` | code execution disabled or runtime unavailable |

### Error shape

The custom 401/403 handlers return JSON:

```json
{ "status": 403, "error": "Forbidden", "message": "Access denied: your token does not grant the required role.", "path": "/api/admin/users" }
```

Controller-level errors return a small map, e.g. registration conflict: `{ "error": "username already taken" }`; OIDC bad credentials: `{ "error": "invalid_credentials", "message": "..." }`.

---

## 1. Authentication — `AuthController` (`/api/auth`)

First-party HS256 auth. `register` and `login` are public; `me` requires a valid token.

| Method | Path | Auth | Body | Success |
|--------|------|------|------|---------|
| POST | `/api/auth/register` | public | `RegisterRequest` | `201` `AuthResponse` |
| POST | `/api/auth/login` | public | `LoginRequest` | `200` `AuthResponse` |
| GET | `/api/auth/me` | Bearer (HS256) | — | `200` `{ username, email, roles[], createdAt }` |

**`AuthResponse`**
```json
{
  "token": "<HS256 JWT>",
  "tokenType": "Bearer",
  "username": "demo",
  "email": "demo@devhub.local",
  "roles": ["ROLE_USER"],
  "expiresAt": 1750000000000
}
```

**Notes**
- `register` defaults the account to `ROLE_USER`, bcrypt-hashes the password, and returns a token (auto-login). A taken username/email → `409`.
- The JWT carries `sub` (username), a `roles` claim, `iat`, and `exp` (24h). Authorization reads roles straight from the token — no per-request DB hit.

```bash
# register
curl -X POST $BASE/api/auth/register -H 'Content-Type: application/json' \
  -d '{"username":"alice","email":"alice@example.com","password":"s3cret-pass"}'

# login → capture the token
TOKEN=$(curl -s -X POST $BASE/api/auth/login -H 'Content-Type: application/json' \
  -d '{"username":"demo","password":"demo12345"}' | jq -r .token)

# current user
curl $BASE/api/auth/me -H "Authorization: Bearer $TOKEN"
```

---

## 2. Progress — `ProgressController` (`/api/progress`)

Per-user topic progress. All endpoints require a valid HS256 token; each operates only on the caller's own rows.

| Method | Path | Auth | Body | Success |
|--------|------|------|------|---------|
| GET | `/api/progress` | Bearer | — | `200` `ProgressResponse[]` |
| GET | `/api/progress/stats` | Bearer | — | `200` `StatsResponse` |
| PUT | `/api/progress/{topicId}` | Bearer | `{ "status": "LEARNED" }` | `200` `ProgressResponse` |
| DELETE | `/api/progress` | Bearer | — | `204` (wipes all the caller's progress) |

- `topicId` is the visualizer filename, URL-encoded (e.g. `encapsulation-visualizer.html`).
- `status` ∈ `NOT_STARTED` · `VISITED` · `LEARNED`.

**`ProgressResponse`** `{ topicId, status, lastAccessedAt, learnedAt }`
**`StatsResponse`** `{ totalTopics, learned, inProgress, notStarted, percentComplete }`

```bash
curl -X PUT "$BASE/api/progress/encapsulation-visualizer.html" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"status":"LEARNED"}'

curl $BASE/api/progress/stats -H "Authorization: Bearer $TOKEN"
# {"totalTopics":200,"learned":1,"inProgress":0,"notStarted":199,"percentComplete":1}
```

---

## 3. Administration — `AdminController` (`/api/admin`)

Class-level `@PreAuthorize("hasRole('ADMIN')")` — every endpoint needs `ROLE_ADMIN`. A `ROLE_USER` token gets a real `403`; an anonymous request gets `401`.

| Method | Path | Auth | Success |
|--------|------|------|---------|
| GET | `/api/admin/users` | Bearer + `ROLE_ADMIN` | `200` `AdminUserResponse[]` |
| GET | `/api/admin/stats` | Bearer + `ROLE_ADMIN` | `200` `{ totalUsers, admins, regularUsers }` |

**`AdminUserResponse`** `{ id, username, email, roles[], createdAt }` (never includes the password hash).

```bash
# demo (USER) → 403 ; admin (ADMIN) → 200
curl -i $BASE/api/admin/users -H "Authorization: Bearer $DEMO_TOKEN"   # HTTP 403
curl -s $BASE/api/admin/users -H "Authorization: Bearer $ADMIN_TOKEN"  # [ {…} ]
```

---

## 4. Self-hosted OIDC — `OidcController` (`/oauth2`, `/api/oidc`)

A tiny authorization-server + resource-server that teaches the Entra/Ping pattern with no external IdP. Tokens here are **RS256** and validate on the OIDC chain against the published JWKS.

| Method | Path | Auth | Body | Success |
|--------|------|------|------|---------|
| GET | `/oauth2/jwks` | public | — | `200` JWKS (public key only) |
| POST | `/oauth2/token` | public | `OidcTokenRequest` | `200` `OidcTokenResponse` |
| GET | `/api/oidc/userinfo` | Bearer (RS256) | — | `200` `{ subject, issuer, audience, authorities[], claims }` |
| GET | `/api/oidc/admin` | Bearer (RS256) + `ROLE_ADMIN` | — | `200` `{ message, subject }` |

**`OidcTokenRequest`** `{ username, password, idm }` — `idm` ∈ `spring` · `entra` · `ping` · `keycloak` (selects the claim shape).
**`OidcTokenResponse`** `{ token (RS256), tokenType, idm, issuer, audience, expiresAt }`

- `/oauth2/jwks` returns only public key material (`kty`,`n`,`e`,`kid`,`use`,`alg`) — the private key never leaves the server.
- `IdmAuthoritiesConverter` maps each IdM's claim shape (`roles`, `scp`, `realm_access.roles`, `group`) to Spring authorities, so `userinfo` shows what a real resource server would extract.
- Bad credentials on `/oauth2/token` → `401 { "error": "invalid_credentials" }`. A non-admin RS256 token on `/api/oidc/admin` → `403`.

```bash
# mint an Entra-shaped RS256 token for admin, then call the resource server
RS=$(curl -s -X POST $BASE/oauth2/token -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin12345","idm":"entra"}' | jq -r .token)
curl $BASE/api/oidc/userinfo -H "Authorization: Bearer $RS"
curl $BASE/oauth2/jwks
```

---

## 5. Server-side code runner — `ExecutionController` (`/api/run`)

Powers the Python/TypeScript/Shell "Run on server" playgrounds. `languages` is public (UI gating); execution is **auth-gated** (an open runner is RCE) and **disabled in prod** by default.

| Method | Path | Auth | Body | Success |
|--------|------|------|------|---------|
| GET | `/api/run/languages` | public | — | `200` `{ enabled, timeoutMs, maxOutputBytes, languages[] }` |
| POST | `/api/run/{language}` | Bearer | `ExecRequest` | `200` `ExecResult` |

- `language` ∈ `python` · `typescript` · `shell` (availability is host-dependent — see `languages`).
- **`ExecRequest`** `{ code, stdin? }` · **`ExecResult`** `{ language, stdout, stderr, exitCode, durationMs, timedOut, truncated }`.
- `400` `unsupported_language` for an unknown language; `503` `execution_disabled` when `app.exec.enabled=false` (prod); `400`/`503` for bad input / unavailable runtime.
- Safety rails: child process, wall-clock timeout (`EXEC_TIMEOUT_MS`), output cap, sanitized env (PATH only — secrets are *not* visible to user code), per-run temp dir, non-root, concurrency cap.

```bash
curl $BASE/api/run/languages
# {"enabled":true,"languages":[{"id":"python","available":true},{"id":"typescript","available":true},{"id":"shell","available":false}]}

curl -X POST $BASE/api/run/python -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"code":"print(\"hello\")"}'
# {"language":"python","stdout":"hello\n","stderr":"","exitCode":0,"durationMs":25,"timedOut":false,"truncated":false}
```

---

## 6. Operational — Actuator

| Method | Path | Auth | Success |
|--------|------|------|---------|
| GET | `/actuator/health` | public | `200` `{ "status": "UP" }` |
| GET | `/actuator/info` | public | `200` build info |

Only `health` and `info` are exposed (`management.endpoints.web.exposure.include`). Docker/Render health probes hit `/actuator/health`.

---

## Appendix — DTO catalog

| DTO | Fields |
|-----|--------|
| `RegisterRequest` | `username`, `email`, `password` (validated) |
| `LoginRequest` | `username`, `password` |
| `AuthResponse` | `token`, `tokenType`, `username`, `email`, `roles[]`, `expiresAt` |
| `AdminUserResponse` | `id`, `username`, `email`, `roles[]`, `createdAt` |
| `ProgressUpdateRequest` | `status` (`NOT_STARTED`/`VISITED`/`LEARNED`) |
| `ProgressResponse` | `topicId`, `status`, `lastAccessedAt`, `learnedAt` |
| `StatsResponse` | `totalTopics`, `learned`, `inProgress`, `notStarted`, `percentComplete` |
| `OidcTokenRequest` | `username`, `password`, `idm` |
| `OidcTokenResponse` | `token`, `tokenType`, `idm`, `issuer`, `audience`, `expiresAt` |
| `ExecRequest` | `code`, `stdin` |
| `ExecResult` | `language`, `stdout`, `stderr`, `exitCode`, `durationMs`, `timedOut`, `truncated` |

---

## Authorization matrix (quick reference)

| Path | Chain | Requirement |
|------|-------|-------------|
| `POST /api/auth/register`, `/api/auth/login` | default | public |
| `GET /api/run/languages`, `/actuator/health`, `/actuator/info` | default | public |
| `GET /oauth2/jwks`, `POST /oauth2/token` | OIDC | public |
| `/api/auth/me`, `/api/progress/**`, `POST /api/run/{lang}` | default | authenticated (HS256) |
| `/api/admin/**` | default | `ROLE_ADMIN` (HS256) |
| `/api/oidc/userinfo` | OIDC | authenticated (RS256) |
| `/api/oidc/admin` | OIDC | `ROLE_ADMIN` (RS256) |
