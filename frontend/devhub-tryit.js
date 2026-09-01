/* devhub-tryit.js — the "Try It Live" embedded mini-IDE for lesson pages.
 *
 * Where devhub-codegrade.js is the *graded* practice IDE (function-only answers,
 * hidden harness, pass/fail per test), this widget is the *exploratory* one: a
 * whole runnable program sits right inside the lesson, the learner edits it
 * freely, hits Run, and sees real stdout — no grading, no harness. Head First
 * pedagogy: touching the code beats reading it, and the optional data-predict
 * prompt makes the learner commit to a guess BEFORE the output appears.
 *
 * Usage on a lesson page (declarative — the engine attaches itself on load):
 *
 *   <div class="tryit" data-lang="java"
 *        data-title="Try it: the String pool"
 *        data-predict="Which of the two == comparisons prints true?">
 *   <script type="text/plain">
 *   public class Main {
 *     public static void main(String[] args) { ... }
 *   }
 *   </script>
 *   </div>
 *   ...
 *   <script src="devhub-tryit.js"></script>
 *
 * Languages: js | ts | python | java
 *  - js/ts   → sandboxed hidden iframe; console.log/warn/error streamed back
 *              via postMessage (TS transpiled first with the TypeScript CDN lib)
 *  - python  → Pyodide (same CDN version as devhub-codegrade.js), stdout/stderr
 *              captured via setStdout/setStderr
 *  - java    → CheerpJ WASM JVM: real javac (tools.jar) compiles the buffer,
 *              then the main class runs; stdout is the iframe's #console text.
 *              tools.jar shares the SAME Cache Storage bucket as the practice
 *              IDE ('dlh-java-runtime'), so a learner who used either page
 *              never downloads the 18 MB jar twice.
 *
 * Cross-realm gotcha (identical to devhub-codegrade.js): every byte array given
 * to cheerpjAddStringFile MUST be constructed with the runner iframe's own
 * Uint8Array — a parent-realm array fails CheerpJ's instanceof check and gets
 * silently stringified, corrupting the data. See frameBytes().
 *
 * Edits persist per-widget in localStorage (dlh-tryit:<page>:<n>); ↺ Reset
 * restores the lesson's original example.
 */
(function (global) {
  'use strict';

  const TS_CDN = 'https://cdn.jsdelivr.net/npm/typescript@5.6.3/lib/typescript.js';
  const PY_BASE = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/';
  const CHEERPJ_LOADER = 'https://cjrtnc.leaningtech.com/4.3/loader.js';
  const JAVA_TOOLS_JAR = 'https://raw.githubusercontent.com/leaningtech/javafiddle/0d847f83f11607623187340e4d12efb494f64e80/static/tools.jar';

  const LANG_META = {
    js:     { label: 'JavaScript', badge: '#f7df1e', dark: true,  indent: 2 },
    ts:     { label: 'TypeScript', badge: '#3178c6', dark: false, indent: 2 },
    python: { label: 'Python',     badge: '#3776ab', dark: false, indent: 4 },
    java:   { label: 'Java',       badge: '#f89820', dark: true,  indent: 4 },
  };

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* ---------- styles (injected once) ------------------------------------- */
  function injectStyles() {
    if (document.getElementById('dlh-tryit-css')) return;
    const st = document.createElement('style');
    st.id = 'dlh-tryit-css';
    st.textContent = `
.dlh-tryit{background:var(--panel,#1e293b);border:1px solid var(--border,#334155);border-radius:12px;margin:18px 0;overflow:hidden}
.dlh-tryit-head{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--border,#334155);flex-wrap:wrap}
.dlh-tryit-head .tt{font-weight:700;font-size:14px;color:var(--text,#e2e8f0)}
.dlh-tryit-badge{font-size:10.5px;font-weight:800;letter-spacing:.05em;padding:3px 9px;border-radius:10px;font-family:ui-monospace,monospace}
.dlh-tryit-predict{margin:10px 14px 0;padding:10px 12px;background:rgba(250,204,21,.07);border:1px dashed #facc15;border-radius:8px;font-size:13px;color:var(--muted,#94a3b8);line-height:1.6;transition:opacity .5s}
.dlh-tryit-predict b{color:#facc15}
.dlh-tryit-predict.done{opacity:.55}
.dlh-tryit-predict.done b{color:#4ade80}
.dlh-tryit-edwrap{position:relative;margin:10px 14px 0}
.dlh-tryit-ed{display:block;position:relative;z-index:2;width:100%;min-height:120px;resize:vertical;background:transparent;color:transparent;caret-color:#e2e8f0;border:1px solid #1c2942;padding:12px 14px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12.5px;line-height:1.7;tab-size:4;white-space:pre;overflow:auto;outline:none;margin:0;border-radius:8px}
.dlh-tryit-ed:focus{border-color:var(--accent,#22d3ee)}
.dlh-tryit-ed::selection{background:rgba(56,189,248,.28);color:transparent}
/* the syntax layer behind the transparent textarea — identical box metrics
   (same font, padding, and a same-width transparent border) so glyphs align
   pixel-perfectly; scroll is mirrored from the textarea in JS.
   Selector is deliberately (0,3,0): devhub-hf.css styles ALL pre on kit pages
   at up to (0,2,1) ("[data-hf] pre", ":is(cream,light)[data-hf] pre"), and any
   restyle of this layer breaks its pixel alignment with the textarea. */
.dlh-tryit .dlh-tryit-edwrap .dlh-tryit-hl{position:absolute;inset:0;z-index:1;margin:0;background:#090e1a;color:#e2e8f0;border:1px solid transparent;border-radius:8px;padding:12px 14px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12.5px;line-height:1.7;tab-size:4;white-space:pre;overflow:hidden;pointer-events:none}
/* no highlighter on this page → the textarea shows its own text again */
.dlh-tryit-edwrap.plain .dlh-tryit-ed{background:#090e1a;color:#e2e8f0}
.dlh-tryit-edwrap.plain .dlh-tryit-hl{display:none}
.dlh-tryit-bar{display:flex;align-items:center;gap:8px;padding:10px 14px;flex-wrap:wrap}
.dlh-tryit-run{padding:7px 18px;background:var(--accent,#22d3ee);color:#0f172a;border:none;border-radius:8px;cursor:pointer;font-weight:800;font-size:13px}
.dlh-tryit-run:disabled{opacity:.5;cursor:wait}
.dlh-tryit-reset{padding:7px 12px;background:transparent;color:var(--muted,#94a3b8);border:1px solid var(--border,#334155);border-radius:8px;cursor:pointer;font-size:12.5px}
.dlh-tryit-reset:hover{color:var(--text,#e2e8f0)}
.dlh-tryit-status{font-size:12px;color:var(--muted,#94a3b8);font-family:ui-monospace,monospace}
.dlh-tryit-out{display:none;margin:0 14px 14px;background:#05080f;border:1px solid #1c2942;border-radius:8px;padding:10px 14px;font-family:ui-monospace,monospace;font-size:12.5px;line-height:1.7;color:#4ade80;white-space:pre-wrap;max-height:320px;overflow:auto}
.dlh-tryit-out.show{display:block}
.dlh-tryit-out .err{color:#f87171}
.dlh-tryit-out .meta{color:#64748b}
@media (prefers-reduced-motion: no-preference){
  .dlh-tryit-out.show{animation:dlhTryitReveal .35s ease}
  @keyframes dlhTryitReveal{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
  .dlh-tryit-out .ln{display:inline;opacity:0;animation:dlhTryitLine .3s ease forwards;animation-delay:var(--d,0s)}
  @keyframes dlhTryitLine{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}
}`;
    document.head.appendChild(st);
  }

  /* ---------- shared runtimes -------------------------------------------- */

  /* TypeScript compiler (page-level script, loaded once) */
  let tsLoading = null;
  function loadTs() {
    if (global.ts) return Promise.resolve(true);
    if (tsLoading) return tsLoading;
    tsLoading = new Promise(resolve => {
      const s = document.createElement('script');
      s.src = TS_CDN;
      s.onload = () => resolve(!!global.ts);
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });
    return tsLoading;
  }

  /* Pyodide (one interpreter per page, reused across widgets and runs) */
  let pyodide = null, pyBooting = null;
  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src; s.onload = res;
      s.onerror = () => rej(new Error('failed to load ' + src));
      document.head.appendChild(s);
    });
  }
  function bootPyodide(status) {
    if (pyodide) return Promise.resolve(pyodide);
    if (pyBooting) return pyBooting;
    pyBooting = (async () => {
      if (status) status('downloading the Python runtime (first run — cached after)…');
      await loadScript(PY_BASE + 'pyodide.js');
      pyodide = await global.loadPyodide({ indexURL: PY_BASE });
      pyBooting = null;
      return pyodide;
    })();
    pyBooting.catch(() => { pyBooting = null; });
    return pyBooting;
  }

  /* CheerpJ JVM (one hidden iframe per page; torn down + rebooted on timeout) */
  let javaFrame = null, javaBooting = null, javaJarBuf = null;

  function frameBytes(win, data) {
    if (typeof data === 'string') data = new TextEncoder().encode(data);
    const out = new win.Uint8Array(data.length);
    out.set(data);
    return out;
  }
  function destroyJavaRuntime() {
    if (javaFrame) { try { javaFrame.remove(); } catch (e) { /* ignore */ } }
    javaFrame = null; javaBooting = null;
  }
  async function fetchToolsJar() {
    if (javaJarBuf) return javaJarBuf;
    let resp = null;
    try {
      const cache = await caches.open('dlh-java-runtime');
      resp = await cache.match(JAVA_TOOLS_JAR);
      if (!resp) {
        resp = await fetch(JAVA_TOOLS_JAR);
        if (!resp.ok) throw new Error('tools.jar HTTP ' + resp.status);
        await cache.put(JAVA_TOOLS_JAR, resp.clone());
      }
    } catch (e) {
      resp = await fetch(JAVA_TOOLS_JAR);
      if (!resp.ok) throw new Error('tools.jar HTTP ' + resp.status);
    }
    javaJarBuf = new Uint8Array(await resp.arrayBuffer());
    return javaJarBuf;
  }
  function bootJava(status) {
    if (javaFrame) return Promise.resolve(javaFrame);
    if (javaBooting) return javaBooting;
    javaBooting = (async () => {
      const frame = document.createElement('iframe');
      frame.style.display = 'none';
      frame.setAttribute('aria-hidden', 'true');
      frame.srcdoc = '<!doctype html><meta charset="utf-8"><body><pre id="console"></pre></body>';
      document.body.appendChild(frame);
      await new Promise(r => { frame.onload = r; });
      const win = frame.contentWindow, doc = frame.contentDocument;
      if (status) status('downloading the Java runtime (first run ~40 MB — cached after)…');
      const loaderP = new Promise((res, rej) => {
        const s = doc.createElement('script');
        s.src = CHEERPJ_LOADER;
        s.onload = res;
        s.onerror = () => rej(new Error('offline — could not load the Java runtime'));
        doc.head.appendChild(s);
      });
      const [jarBytes] = await Promise.all([fetchToolsJar(), loaderP]);
      if (status) status('booting the JVM…');
      await win.cheerpjInit({ status: 'none' });
      win.cheerpjAddStringFile('/str/tools.jar', frameBytes(win, jarBytes));
      javaFrame = frame;
      javaBooting = null;
      return frame;
    })();
    javaBooting.catch(() => { javaBooting = null; });
    return javaBooting;
  }
  function javaDeadline(promise, ms, what) {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        destroyJavaRuntime();
        reject(new Error('Stopped after ' + (ms / 1000) + 's while ' + what + ' — infinite loop?'));
      }, ms);
      promise.then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
    });
  }

  /* ---------- per-language runners --------------------------------------- */
  /* Every runner streams output lines through onLine({text, kind}) and
   * resolves {exit} or {error}. kind: 'out' | 'err'. */

  function runJsFree(code, onLine) {
    return new Promise(resolve => {
      const channel = 'ti-' + Math.random().toString(36).slice(2);
      let settled = false, frame = null, killTimer = null;
      function cleanup() {
        global.removeEventListener('message', onMsg);
        clearTimeout(killTimer);
        if (frame) setTimeout(() => frame.remove(), 200);
      }
      function onMsg(e) {
        if (!e.data || e.data.channel !== channel) return;
        if (e.data.kind === 'line') { onLine({ text: e.data.text, kind: e.data.stream }); return; }
        if (settled) return;
        settled = true;
        cleanup();
        resolve(e.data.kind === 'error' ? { error: e.data.error } : { exit: 0 });
      }
      global.addEventListener('message', onMsg);
      killTimer = setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve({ error: 'Stopped after 5s — infinite loop?' });
      }, 5000);

      const boot = `
const __ch=${JSON.stringify(channel)};
function __send(kind,extra){parent.postMessage(Object.assign({channel:__ch,kind:kind},extra),'*');}
function __fmt(v){
  if (typeof v === 'string') return v;
  if (v instanceof Error) return String(v.stack || v);
  try { return JSON.stringify(v, (k,val)=> typeof val==='function' ? '[Function '+(val.name||'anonymous')+']' : val, 0) ?? String(v); }
  catch(e){ return String(v); }
}
for (const m of ['log','info','warn','error']) {
  const stream = (m==='warn'||m==='error') ? 'err' : 'out';
  console[m] = (...a)=>__send('line',{text:a.map(__fmt).join(' '),stream});
}
window.addEventListener('error', e=>{ __send('line',{text:String(e.message),stream:'err'}); });
window.addEventListener('unhandledrejection', e=>{ __send('line',{text:'Unhandled rejection: '+__fmt(e.reason),stream:'err'}); });
(async()=>{
  try {
    await (0, eval)(${JSON.stringify('(async()=>{\n' + code + '\n})()')});
    __send('done',{});
  } catch (err) {
    __send('error',{error: String(err && err.stack || err)});
  }
})();`;
      frame = document.createElement('iframe');
      frame.style.display = 'none';
      frame.setAttribute('sandbox', 'allow-scripts');
      frame.srcdoc = '<!doctype html><meta charset="utf-8"><body><script>' +
        boot.replace(/<\/script>/gi, '<\\/script>') + '<\/script></body>';
      document.body.appendChild(frame);
    });
  }

  async function runTsFree(code, onLine, status) {
    if (status) status('loading the TypeScript compiler…');
    const ok = await loadTs();
    if (!ok) return { error: 'offline — could not load the TypeScript compiler' };
    let js;
    try {
      js = global.ts.transpileModule(code, {
        compilerOptions: { target: global.ts.ScriptTarget.ES2020, module: global.ts.ModuleKind.None, esModuleInterop: true, experimentalDecorators: true }
      }).outputText;
    } catch (e) {
      return { error: 'TypeScript error: ' + (e && e.message || e) };
    }
    return runJsFree(js, onLine);
  }

  async function runPyFree(code, onLine, status) {
    let py;
    try { py = await bootPyodide(status); }
    catch (e) { return { error: 'offline — could not load the Python runtime' }; }
    if (status) status('running…');
    py.setStdout({ batched: s => onLine({ text: s, kind: 'out' }) });
    py.setStderr({ batched: s => onLine({ text: s, kind: 'err' }) });
    try {
      await py.runPythonAsync(code);
      return { exit: 0 };
    } catch (e) {
      /* Pyodide errors carry the full Python traceback in .message */
      return { error: String(e && e.message || e).trim() };
    } finally {
      py.setStdout(); py.setStderr();
    }
  }

  function javaMainClass(code) {
    const m = code.match(/public\s+(?:final\s+|abstract\s+)?class\s+([A-Za-z_$][\w$]*)/);
    return m ? m[1] : 'Main';
  }
  async function runJavaFree(code, onLine, status) {
    const frame = await javaDeadline(bootJava(status), 180000, 'downloading/booting the Java runtime');
    const win = frame.contentWindow, doc = frame.contentDocument;
    const consoleEl = doc.getElementById('console');
    const cls = javaMainClass(code);
    const cp = '/str/tools.jar:/files/';
    win.cheerpjAddStringFile('/str/' + cls + '.java', frameBytes(win, code));

    consoleEl.innerHTML = '';
    if (status) status('compiling with javac…');
    const compileExit = await javaDeadline(
      win.cheerpjRunMain('com.sun.tools.javac.Main', cp, '/str/' + cls + '.java', '-d', '/files/', '-nowarn'),
      90000, 'compiling');
    if (compileExit !== 0) {
      const diag = consoleEl.innerText.replace(/\/str\//g, '').trim();
      return { error: 'Compile error:\n' + (diag || ('javac exited with code ' + compileExit)) };
    }

    consoleEl.innerHTML = '';
    if (status) status('running on the JVM…');
    const runExit = await javaDeadline(win.cheerpjRunMain(cls, cp), 30000, 'running your code');
    const text = consoleEl.innerText.replace(/\s+$/, '');
    if (text) text.split('\n').forEach(l => onLine({ text: l, kind: 'out' }));
    if (runExit !== 0) onLine({ text: '(exit code ' + runExit + ')', kind: 'err' });
    return { exit: runExit };
  }

  const RUNNERS = { js: (c, l, s) => runJsFree(c, l), ts: runTsFree, python: runPyFree, java: runJavaFree };

  /* only one heavyweight runtime run at a time page-wide (JVM + Pyodide are shared) */
  let busy = false;

  /* ---------- widget ------------------------------------------------------ */
  let widgetCount = 0;
  function pageKey() { return (location.pathname.split('/').pop() || 'page'); }

  function render(host, opts) {
    injectStyles();
    const lang = (opts.lang || 'js').toLowerCase();
    const meta = LANG_META[lang];
    if (!meta) { host.textContent = 'devhub-tryit: unknown language "' + lang + '"'; return; }
    const original = (opts.code || '').replace(/^\n+/, '').replace(/\s+$/, '') + '\n';
    const lsKey = 'dlh-tryit:' + pageKey() + ':' + (widgetCount++);

    const box = document.createElement('div');
    box.className = 'dlh-tryit';
    box.innerHTML = `
      <div class="dlh-tryit-head">
        <span class="tt">${esc(opts.title || 'Try it live')}</span>
        <span class="dlh-tryit-badge" style="background:${meta.badge};color:${meta.dark ? '#1a1a1a' : '#fff'}">${meta.label}</span>
      </div>
      ${opts.predict ? `<div class="dlh-tryit-predict"><b>🤔 Predict first:</b> ${esc(opts.predict)} <span class="after" hidden>— <b>did the output match your prediction?</b></span></div>` : ''}
      <div class="dlh-tryit-edwrap"><pre class="dlh-tryit-hl" aria-hidden="true"></pre><textarea class="dlh-tryit-ed" spellcheck="false" aria-label="code editor"></textarea></div>
      <div class="dlh-tryit-bar">
        <button class="dlh-tryit-run">▶ Run</button>
        <button class="dlh-tryit-reset" title="restore the lesson's original example">↺ Reset</button>
        <span class="dlh-tryit-status"></span>
      </div>
      <pre class="dlh-tryit-out" aria-live="polite"></pre>`;
    host.appendChild(box);

    const ed = box.querySelector('.dlh-tryit-ed');
    const runBtn = box.querySelector('.dlh-tryit-run');
    const resetBtn = box.querySelector('.dlh-tryit-reset');
    const statusEl = box.querySelector('.dlh-tryit-status');
    const out = box.querySelector('.dlh-tryit-out');
    const predictEl = box.querySelector('.dlh-tryit-predict');

    /* IDE-grade coloring: the textarea's text is transparent and a synced
       <pre> behind it carries the DevHubSyntax-colored copy (the standard
       overlay trick — the caret and selection still belong to the textarea).
       Pages without devhub-syntax.js fall back to the plain editor. */
    const hlPre = box.querySelector('.dlh-tryit-hl');
    const edwrap = box.querySelector('.dlh-tryit-edwrap');
    const canHl = !!(global.DevHubSyntax && global.DevHubSyntax.highlight);
    if (!canHl) edwrap.classList.add('plain');
    function syncHl() {
      if (!canHl) return;
      // trailing \n so the last line keeps its height while the caret is on it
      hlPre.innerHTML = global.DevHubSyntax.highlight(ed.value) + '\n';
    }
    ed.addEventListener('scroll', () => {
      hlPre.scrollTop = ed.scrollTop;
      hlPre.scrollLeft = ed.scrollLeft;
    });

    let saved = null;
    try { saved = localStorage.getItem(lsKey); } catch (e) { /* ignore */ }
    ed.value = saved != null ? saved : original;
    autosize();
    syncHl();

    function autosize() {
      const lines = ed.value.split('\n').length;
      ed.style.minHeight = Math.min(30, Math.max(6, lines + 1)) * 1.7 * 12.5 + 24 + 'px';
    }
    ed.addEventListener('input', () => {
      try { localStorage.setItem(lsKey, ed.value); } catch (e) { /* ignore */ }
      autosize();
      syncHl();
    });
    ed.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      e.preventDefault();
      const pad = ' '.repeat(meta.indent);
      const s = ed.selectionStart, epos = ed.selectionEnd;
      ed.value = ed.value.slice(0, s) + pad + ed.value.slice(epos);
      ed.selectionStart = ed.selectionEnd = s + pad.length;
      try { localStorage.setItem(lsKey, ed.value); } catch (err) { /* ignore */ }
      syncHl();
    });

    resetBtn.addEventListener('click', () => {
      ed.value = original;
      try { localStorage.removeItem(lsKey); } catch (e) { /* ignore */ }
      out.classList.remove('show');
      out.innerHTML = '';
      statusEl.textContent = '';
      autosize();
      syncHl();
    });

    /* Lines that arrive in the same burst (Python/Java dump output at once)
       get a stepped animation-delay so the result "walks in" line by line —
       a burst is any run of appends <150ms apart; live-streamed JS lines
       arrive slower than that and animate immediately. Capped so a huge
       output never makes the learner wait more than ~1s. */
    let burstAt = 0, burstN = 0;
    function appendLine(l) {
      out.classList.add('show');
      const now = performance.now();
      burstN = (now - burstAt < 150) ? burstN + 1 : 0;
      burstAt = now;
      const span = document.createElement('span');
      span.className = 'ln' + (l.kind === 'err' ? ' err' : '');
      span.style.setProperty('--d', (Math.min(burstN, 20) * 0.05) + 's');
      span.textContent = l.text + '\n';
      out.appendChild(span);
      out.scrollTop = out.scrollHeight;
    }

    runBtn.addEventListener('click', async () => {
      if (busy) { statusEl.textContent = 'another Run is still going on this page…'; return; }
      busy = true;
      runBtn.disabled = true;
      out.innerHTML = '';
      out.classList.add('show');
      statusEl.textContent = 'running…';
      const t0 = performance.now();
      let outcome;
      try {
        outcome = await RUNNERS[lang](ed.value, appendLine, msg => { statusEl.textContent = msg; });
      } catch (e) {
        outcome = { error: String(e && e.message || e) };
      }
      const ms = Math.round(performance.now() - t0);
      if (outcome.error) {
        appendLine({ text: outcome.error, kind: 'err' });
        statusEl.textContent = 'failed after ' + ms + ' ms';
      } else {
        if (!out.childNodes.length) {
          const m = document.createElement('span');
          m.className = 'meta';
          m.textContent = '(no output — add a print/log statement to see something here)\n';
          out.appendChild(m);
        }
        statusEl.textContent = 'done in ' + ms + ' ms';
      }
      if (predictEl) {
        predictEl.classList.add('done');
        const after = predictEl.querySelector('.after');
        if (after) after.hidden = false;
      }
      runBtn.disabled = false;
      busy = false;
    });
  }

  /* ---------- declarative attach ------------------------------------------ */
  function attachAll() {
    document.querySelectorAll('.tryit[data-lang]').forEach(el => {
      if (el.dataset.tryitDone) return;
      el.dataset.tryitDone = '1';
      const codeEl = el.querySelector('script[type="text/plain"]');
      const code = codeEl ? codeEl.textContent : el.textContent;
      el.innerHTML = '';
      render(el, {
        lang: el.dataset.lang,
        title: el.dataset.title,
        predict: el.dataset.predict,
        code: code,
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attachAll);
  else attachAll();

  global.DevHubTryIt = { render, attachAll };
})(window);
