/* ============================================================================
 * DevHub — server-side code runner client
 * ----------------------------------------------------------------------------
 * Shared by the Python / TypeScript / Shell playgrounds for their
 * "Run on server (real)" mode. Talks to the Spring backend's /api/run/*.
 *
 *   DevHubRun.capabilities()        -> { enabled, languages:[{id,available}], ... }
 *   DevHubRun.exec(lang, code, in)  -> { ok, status, result, error, message }
 *
 * Auth: POST /api/run/{lang} requires a Bearer token (an open runner is RCE).
 * We reuse the hub's saved token (localStorage 'dlh_token', same origin) and,
 * if there isn't one (or it's stale → 401), silently log in as the seeded
 * `demo` account. That keeps the playground one-click while still demonstrating
 * that a real API call carries a real JWT.
 *
 * Requires config.js to have loaded first (window.DEVHUB_API_BASE).
 *
 * PLACE IN THE SITE: this is the ONLY front-end file that talks to the backend
 * (backend/ — devhub-backend, ExecutionController → /api/run/*). Every other
 * engine persists to localStorage and never leaves the device. Loaded by 3
 * pages (the Python / TypeScript / Shell playgrounds); every other page works
 * with no backend at all, which is why a missing server must degrade to
 * { enabled:false } rather than throw.
 *
 * Assumes: config.js ran first (window.DEVHUB_API_BASE — the one file you edit
 * after deploying a backend). Without it, falls back to localhost:8081, the
 * dev port in backend/src/main/resources/application-dev.yml.
 *
 * Persists: localStorage 'dlh_token' — SHARED with app.html's login flow (same
 * key, same origin), so a learner who logged in at the hub is already
 * authenticated here, and a demo login here is visible to the hub.
 * ========================================================================== */
(function () {
  /**
   * Backend origin, trailing slashes stripped so path joins below never produce "//api".
   * Read once at load — config.js must already have run.
   */
  const API_BASE = (window.DEVHUB_API_BASE || 'http://localhost:8081').replace(/\/+$/, '');
  /**
   * Same localStorage key app.html writes on login (see CODE-MAP §4). Do not rename
   * one without the other or the hub and the playgrounds stop sharing a session.
   */
  const TOKEN_KEY = 'dlh_token';

  /**
   * The saved JWT, or null. try/catch because localStorage throws in some sandboxed /
   * private contexts — a missing token just means "log in as demo" (see exec).
   */
  function token() { try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; } }

  /**
   * Silent fallback login as the seeded `demo` account (DataInitializer.java creates it).
   * Called by exec() when there is no token or the server answered 401. Saves the new
   * token so the next call — and app.html — reuse it.
   */
  async function login() {
    const r = await fetch(API_BASE + '/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'demo', password: 'demo12345' })
    });
    if (!r.ok) throw new Error('demo login failed (' + r.status + ')');
    const j = await r.json();
    try { localStorage.setItem(TOKEN_KEY, j.token); } catch (e) {}
    return j.token;
  }

  /**
   * GET /api/run/languages, unauthenticated. The playground calls this on load to decide
   * whether to offer "Run on server (real)" at all: any failure (no backend, CORS, offline)
   * resolves to { enabled:false } instead of rejecting, so the page still renders.
   */
  async function capabilities() {
    try {
      const r = await fetch(API_BASE + '/api/run/languages');
      if (!r.ok) return { enabled: false, languages: [] };
      return await r.json();
    } catch (e) {
      return { enabled: false, error: String(e), languages: [] };
    }
  }

  /**
   * POST /api/run/{lang} with a Bearer token. Auth is mandatory server-side because an
   * open code runner is remote code execution. One retry on 401 (stale token → fresh demo
   * login); network failures come back as { error:'network' } so the caller can show a
   * message rather than crash. Shape of the resolved object is documented in the banner.
   */
  async function exec(lang, code, stdin) {
    let t = token();
    if (!t) { try { t = await login(); } catch (e) { return { error: 'auth', message: e.message }; } }
    // The request itself, parameterised by token rather than closing over one, so the
    // 401 branch below can REPLAY it verbatim with a freshly minted token. Inlining
    // this would mean writing the fetch twice and letting the two drift.
    const call = tok => fetch(API_BASE + '/api/run/' + lang, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tok },
      body: JSON.stringify({ code: code, stdin: stdin || null })
    });
    let res;
    try {
      res = await call(t);
      if (res.status === 401) { t = await login(); res = await call(t); }   // token stale → refresh
    } catch (e) {
      return { error: 'network', message: String(e) };
    }
    const body = await res.json().catch(() => null);
    return {
      ok: res.ok, status: res.status,
      result: res.ok ? body : null,
      error: res.ok ? null : ((body && body.error) || ('http_' + res.status)),
      message: body && body.message
    };
  }

  window.DevHubRun = { API_BASE: API_BASE, capabilities: capabilities, exec: exec, token: token };
})();
