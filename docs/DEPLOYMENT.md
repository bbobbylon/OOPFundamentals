# Deploying DevHub — from your laptop to the cloud

You already have a working local stack (README **Part 1**): the static frontend on a dev
server, the Spring Boot backend on `:8081`, and an in-memory H2 database. **Cloud deployment
doesn't change the app — it moves each piece to a managed equivalent and connects them with one
config line.** This guide lifts that working local setup to **Render**, **AWS**, or **Azure**.

---

## The mental model: what maps to what

| Local (you have this) | → | Cloud (you create this) |
|---|---|---|
| `frontend/` on `devserver.py :5500` | → | Static host: **GitHub Pages** (free, already wired) |
| `backend/` on `:8081` (H2) | → | Container host: **Render** / **AWS App Runner** / **Azure Container Apps** |
| H2 in-memory DB | → | Managed **PostgreSQL** |
| `config.js` → `localhost:8081` | → | `config.js` → your cloud backend URL |
| dev JWT secret / open CORS | → | a real `JWT_SECRET` + a locked-down `CORS_ALLOWED_ORIGINS` |

**Three things are identical no matter which cloud you pick** — which is why switching providers
is cheap:

1. **The image is the same.** `backend/Dockerfile` is multi-stage and builds the jar *itself*
   (context = `./backend`). Every host below just runs that one container. No host-specific build.
2. **The env vars are the same.** `SPRING_PROFILES_ACTIVE=prod`, `DATABASE_URL`,
   `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS`,
   `EXEC_ENABLED=false`.
3. **The one wire is `config.js`.** Point `window.DEVHUB_API_BASE` at the backend's public URL.

So the entire job, every time, is: **build the container → give it those env vars on a host →
point the frontend at it → set CORS to your Pages origin.** Pick a backend column below.

```
        ┌─────────────── GitHub Pages (static, shared) ────────────────┐
        │  frontend/  ──  config.js: DEVHUB_API_BASE = <backend URL>    │
        └───────────────────────────┬──────────────────────────────────┘
                                     │ HTTPS  (CORS_ALLOWED_ORIGINS must equal the Pages origin)
                ┌────────────────────┼────────────────────┐
          ┌─────▼─────┐        ┌─────▼─────┐        ┌──────▼──────┐
          │  Render   │        │ AWS App   │        │ Azure       │
          │ Web Service│        │  Runner   │        │ Container   │
          │           │        │           │        │ Apps        │
          └─────┬─────┘        └─────┬─────┘        └──────┬──────┘
                └─── same image, same env vars ────────────┘
                                     │
                              Managed PostgreSQL
```

---

## 0. Rehearse it locally with Docker first

Before touching a cloud, run the exact production container locally — same Dockerfile, same
nginx, same `prod`-style wiring:

```bash
./startapp.sh --docker      # backend :8080 + nginx frontend :8081
```

If that works, the cloud will too — you've already proven the image boots and serves. (Details:
README → *Docker mode*.)

---

## 1. Frontend → GitHub Pages (shared by all three backends)

The frontend deploy is provider-independent and **already wired** (`.github/workflows/deploy.yml`).
Full steps are in **README Part 3**; the short version:

1. Repo **Settings → Pages → Source: GitHub Actions** (once, before the first push).
2. Edit `frontend/config.js` → `window.DEVHUB_API_BASE = 'https://<your-backend-url>'`.
3. Push to `master`. Your hub is at `https://<YOURNAME>.github.io/<REPO>/app.html`.

Come back and set this URL **after** the backend is live (sections 3a–3c).

---

## 2. Database → managed PostgreSQL

The backend's `prod` profile expects Postgres. Create one on your provider, then feed the
connection details in as env vars. **The `DATABASE_URL` must be JDBC-shaped:**
`jdbc:postgresql://HOST:5432/DBNAME` — host + db only; username and password go in their own vars.

| Provider | Create it with | Notes |
|---|---|---|
| Render | Dashboard → **New + → PostgreSQL** | one-click; copy host/db/user/password |
| AWS | **Amazon RDS for PostgreSQL** (or Aurora Serverless v2) | put it in the same VPC/region as App Runner |
| Azure | **Azure Database for PostgreSQL – Flexible Server** | `az postgres flexible-server create …` |

Tables are created on first boot (`ddl-auto: update`).

---

## 3a. Backend → Render  *(simplest — full walkthrough in README Part 2)*

Render builds straight from `backend/Dockerfile` and has one-click Postgres. Set **Root
Directory: `backend`**, runtime **Docker**, and the env vars from the table above. This is the
path `frontend/config.js` already defaults to (`https://devhub-backend.onrender.com`).

---

## 3b. Backend → AWS App Runner

App Runner runs a container from ECR with autoscaling + HTTPS, no servers to manage — the closest
AWS analog to Render. **Config files:** [`deploy/aws/apprunner.json`](../deploy/aws/apprunner.json)
· [`deploy/aws/deploy.sh`](../deploy/aws/deploy.sh).

**One-time setup**
1. Install + configure the AWS CLI v2 (`aws configure`). Have Docker running.
2. Create the **AppRunnerECRAccessRole** (lets App Runner pull from ECR) — AWS console offers it
   automatically on first service create, or create it from the `AWSAppRunnerServicePolicyForECRAccess` managed policy.

**Deploy**
```bash
AWS_REGION=us-east-1 ./deploy/aws/deploy.sh      # builds image, creates ECR repo, pushes :latest
```
Then plug your credentials into `deploy/aws/apprunner.json` (the `<ANGLE_BRACKET>` placeholders:
account id, region, the DB vars, `JWT_SECRET`, your Pages origin) and create the service once:
```bash
aws apprunner create-service --cli-input-json file://deploy/aws/apprunner.json --region us-east-1
```
With `AutoDeploymentsEnabled: true`, every later `:latest` push redeploys automatically.

**Get the URL** (`https://xxxxx.<region>.awsapprunner.com`) → drop it into `config.js`, set
`CORS_ALLOWED_ORIGINS` to your Pages origin.

**CI/CD:** [`.github/workflows/deploy-backend-aws.yml`](../.github/workflows/deploy-backend-aws.yml)
builds + pushes + redeploys on a **manual run** (Actions → *Deploy backend → AWS App Runner* →
*Run workflow*). It needs the secrets listed at the top of that file (`AWS_ROLE_ARN` for OIDC,
`AWS_REGION`, `ECR_REPOSITORY`, `APPRUNNER_SERVICE_ARN`). It is dispatch-only on purpose, so it
won't fail-spam your inbox before it's configured — uncomment the `push:` trigger when ready.

---

## 3c. Backend → Azure Container Apps

Container Apps runs the same container serverlessly (scale-to-N, HTTPS, revisions). **Config
files:** [`deploy/azure/containerapp.bicep`](../deploy/azure/containerapp.bicep) ·
[`deploy/azure/deploy.sh`](../deploy/azure/deploy.sh).

**Quick path** (`az containerapp up` builds the Dockerfile in the cloud via ACR Tasks — no local
Docker needed):
```bash
az login
az extension add --name containerapp
export DATABASE_URL='jdbc:postgresql://<host>:5432/<db>' DATABASE_USERNAME=<u> \
       DATABASE_PASSWORD=<p> JWT_SECRET=<32+chars> CORS_ALLOWED_ORIGINS=https://<you>.github.io
./deploy/azure/deploy.sh
```
The script prints the public URL (`https://<app>.<region>.azurecontainerapps.io`).

**Infra-as-Code path** (repeatable, secrets as Container App secrets):
```bash
az group create -n devhub-rg -l eastus
az deployment group create -g devhub-rg \
  --template-file deploy/azure/containerapp.bicep \
  --parameters containerImage=<acr>.azurecr.io/devhub-backend:latest \
               corsOrigins=https://<YOURNAME>.github.io \
               databaseUrl='jdbc:postgresql://<host>:5432/<db>' \
               databaseUsername=<u> databasePassword=<p> jwtSecret=<secret>
```

**CI/CD:** [`.github/workflows/deploy-backend-azure.yml`](../.github/workflows/deploy-backend-azure.yml)
— manual dispatch, federated-OIDC login, then `az containerapp up`. Needs `AZURE_CLIENT_ID`,
`AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`, `AZURE_RESOURCE_GROUP`, `ACA_APP_NAME`.

---

## 4. Wire the frontend to the backend (the one wire)

```js
// frontend/config.js
window.DEVHUB_API_BASE = 'https://<your-backend-url>';   // HTTPS, no trailing slash
```
Then make the backend's `CORS_ALLOWED_ORIGINS` **exactly** your Pages origin
(scheme + host only): `https://<YOURNAME>.github.io`. Mismatch here is the #1 cause of a
deployed app that "loads but can't log in."

---

## 5. Verify

```bash
curl https://<your-backend-url>/actuator/health        # {"status":"UP"}
# full auth round-trip (register → login → call a protected endpoint):
#   see HELP.md → Command-Line Runbook
```

| Symptom | Fix |
|---|---|
| Browser CORS error | `CORS_ALLOWED_ORIGINS` ≠ Pages origin — match it exactly, redeploy |
| "Mixed Content … insecure resource" | `config.js` must be `https://`, not `http://` |
| Every call 401 after a redeploy | `JWT_SECRET` changed → old tokens invalid; sign out/in |
| Backend won't start / DB errors | `DATABASE_URL` must be `jdbc:postgresql://HOST:5432/DB`; creds in their own vars |
| App Runner stuck "Operation in progress" | health check path must be `/actuator/health`; check the service logs |

---

## Security checklist (do these before sharing a public URL)

- [ ] `EXEC_ENABLED=false` — the code runner is RCE if exposed; keep it off on any shared host.
- [ ] `JWT_SECRET` is a real 32+ char random value (`openssl rand -base64 48`), not the dev default.
- [ ] DB credentials + `JWT_SECRET` live in the host's **secret store** (Secrets Manager / Key
      Vault / Render secret env), not committed and not in plaintext config for real use.
- [ ] `CORS_ALLOWED_ORIGINS` is your exact origin, not `*`.
- [ ] HTTPS only (all three hosts give it automatically — required because Pages is HTTPS).

See [docs/SECURITY.md](SECURITY.md) for the full token model + threat notes, and
[docs/ARCHITECTURE.md](ARCHITECTURE.md) for deployment topologies.
