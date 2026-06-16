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
 * ========================================================================== */

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
