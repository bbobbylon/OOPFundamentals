# DevHub — Deploy Quick Reference

> Full step-by-step walkthrough (with screenshots-worthy detail, env vars, and a
> troubleshooting table) lives in **[README.md → "Deploying the Dev Learning Hub"](README.md#deploying-the-dev-learning-hub-devhub)**.
> This is the condensed cheat-sheet. Below it: a full **[Command-Line Runbook](#command-line-runbook)**.

**The one wire:** `frontend/config.js` → `window.DEVHUB_API_BASE` tells the
frontend where the backend is. `null` = local dev (`http://localhost:8081`); set
it to your deployed HTTPS URL for production.

### Run locally

| | Windows | macOS / Linux |
|---|---|---|
| **Backend** (H2, :8081) | `.\mvnw.cmd -f backend\pom.xml spring-boot:run` | `./mvnw -f backend/pom.xml spring-boot:run` |
| **Frontend** (:5500) | `cd frontend; py -m http.server 5500` | `cd frontend && python3 -m http.server 5500` |

Then open <http://localhost:5500/app.html>. Health check: <http://localhost:8081/actuator/health>.
Serve the frontend on **5500** (it's CORS-allowed); don't open `app.html` as a `file://`.

### Build / containerize the backend

```
# Build the executable jar  →  backend/target/devhub-backend-0.0.1-SNAPSHOT.jar
.\mvnw.cmd -f backend\pom.xml -DskipTests clean package      # Windows
./mvnw -f backend/pom.xml -DskipTests clean package          # macOS/Linux

# Or build the Docker image (context = backend/)
cd backend
docker build -t devhub-backend .
```

### Production environment variables (backend)

| Key | Example | Notes |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` | switches H2 → PostgreSQL |
| `DATABASE_URL` | `jdbc:postgresql://host:5432/devhub` | must start with `jdbc:postgresql://` |
| `DATABASE_USERNAME` / `DATABASE_PASSWORD` | — | keep out of the URL |
| `JWT_SECRET` | 32+ random chars | signs login tokens (HS256) |
| `CORS_ALLOWED_ORIGINS` | `https://yourname.github.io` | your Pages origin, no trailing slash |
| `PORT` | `8080` | injected by the host; `application-prod.yml` reads it |

### Deploy checklist

1. Backend → Render (Docker, root dir `backend/`) + Postgres; set the env vars above.
2. `frontend/config.js` → set `DEVHUB_API_BASE` to the Render HTTPS URL.
3. Push to `master` → GitHub Pages workflow publishes `frontend/`.
4. Backend `CORS_ALLOWED_ORIGINS` must equal your Pages origin exactly.
5. Open the app → **Sign in → Register** to create the first account.

---

# Command-Line Runbook

Real, copy-paste commands for building, running, deploying, and **debugging a
deployment**. Where Windows and Unix differ, both are shown.

> **⚠ Windows `curl` gotcha.** In PowerShell, `curl` is an *alias* for
> `Invoke-WebRequest` (different flags, different output). For the `curl` examples
> below, either use **`curl.exe`** (ships with Windows 10+) or use the
> **`Invoke-RestMethod`** (`irm`) versions shown alongside. On macOS/Linux, plain
> `curl` is correct.

## API map (what you're calling)

| Method & path | Auth? | Body | Returns |
|---|---|---|---|
| `POST /api/auth/register` | public | `{username,email,password}` | `201 {token,username,email,expiresAt}` |
| `POST /api/auth/login` | public | `{username,password}` | `200 {token,username,email,expiresAt}` |
| `GET /api/auth/me` | **Bearer** | — | `{username,email,createdAt}` |
| `GET /api/progress` | **Bearer** | — | `[ ...progress ]` |
| `GET /api/progress/stats` | **Bearer** | — | `{learned,visited,notStarted,...}` |
| `PUT /api/progress/{topicId}` | **Bearer** | `{status}` | updated entry |
| `DELETE /api/progress` | **Bearer** | — | `204` |
| `GET /actuator/health` | public | — | `{"status":"UP"}` |

`status` ∈ `NOT_STARTED | VISITED | LEARNED`. `topicId` is a page file name, e.g.
`encapsulation-visualizer.html`. Tokens are HS256 and **expire after 24h**.

## Build · run · test (backend)

```text
# Run locally — dev profile → H2 in-memory, port 8081
.\mvnw.cmd -f backend\pom.xml spring-boot:run            # Windows
./mvnw -f backend/pom.xml spring-boot:run                # macOS/Linux

# Run the tests
.\mvnw.cmd -f backend\pom.xml test

# Package the fat jar → backend/target/devhub-backend-0.0.1-SNAPSHOT.jar
.\mvnw.cmd -f backend\pom.xml -DskipTests clean package

# Run the packaged jar directly
java -jar backend\target\devhub-backend-0.0.1-SNAPSHOT.jar
```

Run the jar with the **prod** profile against a local Postgres (PowerShell):

```powershell
$env:SPRING_PROFILES_ACTIVE = "prod"
$env:DATABASE_URL      = "jdbc:postgresql://localhost:5432/devhub"
$env:DATABASE_USERNAME = "devhub"
$env:DATABASE_PASSWORD = "secret"
$env:JWT_SECRET        = "a-long-random-string-at-least-32-chars"
java -jar backend\target\devhub-backend-0.0.1-SNAPSHOT.jar
```

The OOP **console walkthrough** (separate from the backend, uses the root pom):

```text
.\mvnw.cmd -q exec:java -Dexec.mainClass=com.bob.oopfundamentals.OopFundamentalsApplication
```

## Smoke-test the API (local or deployed)

Set the base URL once, then reuse it:

```powershell
# PowerShell
$BASE = "http://localhost:8081"            # or "https://your-service.onrender.com"
Invoke-RestMethod "$BASE/actuator/health"  # → status : UP
```
```bash
# bash
BASE=http://localhost:8081
curl -s "$BASE/actuator/health"            # → {"status":"UP"}
```

## The full auth round-trip from the CLI

The fastest proof a deployment works end-to-end: **register → login → capture the
JWT → call a protected endpoint.**

**PowerShell** (native, no extra tools):
```powershell
$BASE = "http://localhost:8081"

# Register (201) → returns { token, username, email, expiresAt }
$reg   = @{ username="cli-user"; email="cli@example.com"; password="password123" } | ConvertTo-Json
$auth  = Invoke-RestMethod -Method Post "$BASE/api/auth/register" -ContentType application/json -Body $reg
$token = $auth.token

# …next time, log in instead:
# $login = @{ username="cli-user"; password="password123" } | ConvertTo-Json
# $token = (Invoke-RestMethod -Method Post "$BASE/api/auth/login" -ContentType application/json -Body $login).token

# Call PROTECTED endpoints with the bearer token
$H = @{ Authorization = "Bearer $token" }
Invoke-RestMethod "$BASE/api/auth/me"        -Headers $H
Invoke-RestMethod "$BASE/api/progress/stats" -Headers $H

# Mark a topic learned (status: NOT_STARTED | VISITED | LEARNED)
$pb = @{ status = "LEARNED" } | ConvertTo-Json
Invoke-RestMethod -Method Put "$BASE/api/progress/encapsulation-visualizer.html" `
  -Headers $H -ContentType application/json -Body $pb
```

**bash / `curl.exe`** (uses `jq` to grab the token; or just eyeball the JSON):
```bash
BASE=http://localhost:8081

TOKEN=$(curl -s -X POST "$BASE/api/auth/register" -H 'Content-Type: application/json' \
  -d '{"username":"cli-user","email":"cli@example.com","password":"password123"}' | jq -r .token)

# …or log in:
# TOKEN=$(curl -s -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' \
#   -d '{"username":"cli-user","password":"password123"}' | jq -r .token)

curl -s "$BASE/api/auth/me"        -H "Authorization: Bearer $TOKEN"
curl -s "$BASE/api/progress/stats" -H "Authorization: Bearer $TOKEN"
curl -s -X PUT "$BASE/api/progress/encapsulation-visualizer.html" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"status":"LEARNED"}'
```

> **Expected:** health → `UP`; register → `201`; a protected call **without** a token
> → `401`; **with** a valid token → `200`. That sequence passing = the whole stack
> (CORS, JWT, DB) is wired correctly.

## Inspect the local database (H2, dev profile)

Dev uses in-memory H2 — open the web console:

- URL: <http://localhost:8081/h2-console>
- JDBC URL: `jdbc:h2:mem:devhubdb` · User: `sa` · Password: *(blank)*
- Tables: `users`, `topic_progress`

Data resets on every restart (`ddl-auto: create-drop`). Prod (Postgres) persists and
auto-creates the tables on first boot (`ddl-auto: update`).

## Docker — mirror the cloud build locally

```powershell
cd backend
docker build -t devhub-backend .

# Run it the way Render does: prod profile + Postgres + secrets.
# host.docker.internal reaches a Postgres running on your host from in the container.
docker run --rm -p 8080:8080 `
  -e SPRING_PROFILES_ACTIVE=prod `
  -e DATABASE_URL=jdbc:postgresql://host.docker.internal:5432/devhub `
  -e DATABASE_USERNAME=devhub -e DATABASE_PASSWORD=secret `
  -e JWT_SECRET=a-long-random-string-at-least-32-chars `
  -e CORS_ALLOWED_ORIGINS=http://localhost:5500 `
  devhub-backend
```
```text
docker ps                       # find the container id
docker logs -f <container>      # follow logs
docker exec -it <container> sh  # shell inside
```
(On macOS/Linux, swap the trailing backticks for `\` line continuations.)

## Generate a `JWT_SECRET`

```powershell
# PowerShell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```
```bash
# macOS/Linux
openssl rand -base64 48
```

## Deploy — trigger & watch GitHub Pages (frontend)

```text
# ONE-TIME, before the first push: Settings → Pages → Source: "GitHub Actions".
# Without it the first run fails at "Setup Pages" with:
#   Get Pages site failed … HttpError: Not Found
# (the workflow sets enablement:true to self-create the site, but enabling it
#  once in Settings is the guaranteed fix — re-run the failed job afterwards.)

# Pages publishes frontend/ on every push to master (.github/workflows/deploy.yml)
git add -A
git commit -m "deploy"
git push origin master

# Watch the Actions run (needs the GitHub CLI `gh`)
gh run list --workflow=deploy.yml
gh run watch

# If it already failed once: enable Pages (above), then re-run that run:
gh run rerun --failed
```

---

# Troubleshooting the deployment (symptom → command)

Commands that pinpoint each row of the README's troubleshooting table.

### "Is the backend even up?"
```bash
curl -i "$BASE/actuator/health"     # 200 {"status":"UP"} = alive
```
On Render's free tier the service **sleeps after ~15 min idle**; the first request
then takes ~50s (cold start) and may time out once — just retry.

### CORS error in the browser console
The API only allows the origins in `CORS_ALLOWED_ORIGINS` (applied to `/api/**`).
Reproduce the browser's **preflight** from the CLI and read the response headers:
```bash
curl -i -X OPTIONS "$BASE/api/auth/login" \
  -H "Origin: https://yourname.github.io" \
  -H "Access-Control-Request-Method: POST"
```
```powershell
curl.exe -i -X OPTIONS "$BASE/api/auth/login" -H "Origin: https://yourname.github.io" -H "Access-Control-Request-Method: POST"
```
- `Access-Control-Allow-Origin` must **echo your exact origin** (scheme + host).
- Matched **exactly** — `https://name.github.io/` (trailing slash) ≠ `https://name.github.io`.
- Missing / wrong → fix `CORS_ALLOWED_ORIGINS` on the backend and redeploy.

### "Mixed content … insecure resource" (blocked)
`config.js` points at an `http://` URL while the page is HTTPS. It must be `https://`:
```text
type frontend\config.js     # Windows — confirm what the frontend targets
cat  frontend/config.js     # macOS/Linux
```

### 401s — "every call is 401 after a redeploy"
- A `401` on a **protected** call with no/old token is expected — re-login for a fresh one.
- If `JWT_SECRET` **changed between deploys**, every previously issued token is invalid
  (they're HS256-signed with that secret) → sign out and back in. Tokens also expire
  after **24h** (`app.jwt.expiration-ms`).
- Decode a token's payload (base64, no signature check) to read `sub`/`exp`:
```powershell
# PowerShell — decode the middle (2nd) dot-separated segment
$p = "<jwt>".Split(".")[1].Replace('-','+').Replace('_','/'); while ($p.Length % 4) { $p += "=" }
[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($p))
```
```bash
# bash — paste just the payload segment (between the two dots)
echo "<payload-segment>" | base64 -d
```

### Backend won't start / DB connection errors
- `DATABASE_URL` must be JDBC-shaped: `jdbc:postgresql://HOST:5432/DBNAME` (host + db
  only); username/password in their **own** vars — not embedded in the URL.
- `relation "users" does not exist` → confirm `SPRING_PROFILES_ACTIVE=prod` (prod's
  `ddl-auto: update` creates `users` + `topic_progress` on first boot).
- Test Postgres reachability directly:
```bash
psql "postgresql://USER:PASSWORD@HOST:5432/DBNAME" -c "\dt"   # list tables
```

### Login works but the app stays "anonymous"
The frontend couldn't reach the API, so it fell back to anonymous mode. Verify the
wire and the health endpoint:
```bash
cat frontend/config.js                 # DEVHUB_API_BASE must be your backend's HTTPS URL
curl -s "$BASE/actuator/health"        # must be UP
```

---

### Upstream docs (the parts this project actually uses)

- [Spring Boot Actuator](https://docs.spring.io/spring-boot/4.0.6/reference/actuator/index.html)
- [Spring Security](https://docs.spring.io/spring-boot/4.0.6/reference/web/spring-security.html)
- [OAuth2 Resource Server](https://docs.spring.io/spring-boot/4.0.6/reference/web/spring-security.html#web.security.oauth2.server)
- [RestClient / declarative HTTP clients](https://docs.spring.io/spring-boot/4.0.6/reference/io/rest-client.html#io.rest-client.restclient)
- [Spring Boot Maven Plugin](https://docs.spring.io/spring-boot/4.0.6/maven-plugin) · [Build an OCI image](https://docs.spring.io/spring-boot/4.0.6/maven-plugin/build-image.html)
