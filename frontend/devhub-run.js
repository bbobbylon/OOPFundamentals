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
 * ========================================================================== */
(function () {
  const API_BASE = (window.DEVHUB_API_BASE || 'http://localhost:8081').replace(/\/+$/, '');
  const TOKEN_KEY = 'dlh_token';

  function token() { try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; } }

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

  async function capabilities() {
    try {
      const r = await fetch(API_BASE + '/api/run/languages');
      if (!r.ok) return { enabled: false, languages: [] };
      return await r.json();
    } catch (e) {
      return { enabled: false, error: String(e), languages: [] };
    }
  }

  async function exec(lang, code, stdin) {
    let t = token();
    if (!t) { try { t = await login(); } catch (e) { return { error: 'auth', message: e.message }; } }
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
