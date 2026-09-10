/* ============================================================================
 * DevHub — Frontend runtime configuration
 * ============================================================================
 *
 * This is the ONE file you edit after deploying your backend.
 *
 * Set DEVHUB_API_BASE to the public HTTPS URL of your deployed Spring Boot
 * backend, with NO trailing slash. For example:
 *
 *     window.DEVHUB_API_BASE = 'https://devhub-backend.onrender.com';
 *
 * Leave it as null for local development — the app then talks to the local
 * backend at http://localhost:8081 (started with `spring-boot:run`).
 *
 * Notes:
 *  - When served from GitHub Pages (HTTPS), the backend URL MUST be HTTPS too,
 *    or the browser will block the request as "mixed content". Render, Railway,
 *    and Fly.io all give you HTTPS automatically.
 *  - If this value is wrong or the backend is unreachable, the app still works
 *    anonymously: progress is saved to this browser's localStorage instead of
 *    your account. Sign-in/sync simply won't be available until it's fixed.
 *  - After editing, commit and push — the GitHub Pages workflow redeploys the
 *    frontend automatically.
 *
 * WHO LOADS IT. Seven pages, all of them the ones that can reach a backend:
 * app.html (sign-in + progress sync) and the six playground pages
 * (auth-identity-live, jwt-playground, python-, shell-, spring-boot-,
 * typescript-playground). The other 500+ lesson pages never load it — they
 * have no reason to know where the backend is.
 *
 * WHO READS IT. Exactly one shared engine: devhub-run.js, which must be loaded
 * AFTER this file (it reads window.DEVHUB_API_BASE at parse time and falls
 * back to http://localhost:8081 when the value is null). app.html reads it the
 * same way for /api/auth and /api/progress. Nothing else in frontend/ touches
 * the network.
 *
 * PERSISTENCE. None of its own. The token that devhub-run.js and app.html
 * send to this base URL lives in localStorage under 'dlh_token' / 'dlh_user',
 * owned by those two files, not by this one.
 *
 * GATES. tmp_vcheck.mjs treats a `<script src="config.js">` reference like any
 * other internal link (it must resolve), nothing more — there is no check
 * that the URL below is live. A wrong URL degrades to anonymous mode, silently.
 * ========================================================================== */

/**
 * The backend origin, resolved once at load. A self-invoking function rather
 * than a bare string so the same file serves both the deployed site
 * (github.io → the public HTTPS backend) and local/Docker (null → localhost
 * fallback in the readers) without anyone editing it per environment.
 */
window.DEVHUB_API_BASE = (function () {
  // Deployed on GitHub Pages (HTTPS) → talk to your public backend.
  // ⬇️ EDIT THIS ONE LINE to your deployed backend URL (HTTPS, no trailing slash).
  //    Render:          https://devhub-backend.onrender.com
  //    AWS App Runner:  https://xxxxxxxx.<region>.awsapprunner.com
  //    Azure ACA:       https://devhub-backend.<region>.azurecontainerapps.io
  //  (see docs/DEPLOYMENT.md for the full per-provider setup.)
  if (location.hostname.endsWith('github.io')) {
    return 'https://devhub-backend.onrender.com';
  }
  // Local dev (devserver :5500) and Docker (nginx :8081): null → the app falls
  // back to http://localhost:8081, which is the backend in dev and the nginx
  // origin in Docker (it proxies /api, /oauth2, /actuator to the backend).
  return null;
})();
