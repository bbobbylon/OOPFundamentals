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
 *
 * PLACE IN THE SITE: loaded by 119 lesson pages (Java 44 / TS 30 / Python 23 /
 * DSA 20 / JS 3 at the time of writing). It is the "touch the code" beat of
 * the teaching bar; devhub-codegrade.js is the graded sibling and REUSES these
 * exact runtimes (same CDN versions, same Cache Storage bucket) — if you bump a
 * CDN pin here, bump it there, and bump tmp_codecheck.mjs's expected TypeScript
 * version (5.6.3) too, because that gate compiles every snippet on the site with
 * the same compiler the learner runs.
 *
 * Assumes about the page: zero required markup beyond the .tryit[data-lang] hosts
 * — every style it needs is injected below (SELF-CONTAINED, like all engines:
 * 14 index/landing pages never link devhub.css). devhub-syntax.js is an OPTIONAL
 * peer: if window.DevHubSyntax exists at DOMContentLoaded the editor gets an
 * IDE-coloured overlay, otherwise a plain textarea. Script order between the two
 * does not matter because attachAll() waits for DOMContentLoaded.
 *
 * The four runtimes are REAL, not simulations:
 *   js     — a hidden <iframe sandbox="allow-scripts"> with an OPAQUE origin, so
 *            learner code cannot touch this page, its storage, or its cookies.
 *   ts     — the actual TypeScript compiler (TS_CDN) transpiling in-page, then
 *            the js path.
 *   python — CPython compiled to WASM (Pyodide), one interpreter per page.
 *   java   — CheerpJ: a JVM in WASM running the real javac from a JDK 8
 *            tools.jar. LIMITATIONS that lesson authors must respect: Java 8
 *            source only (no var, records, switch expressions, text blocks),
 *            and threads are cooperative — a busy-wait loop starves every other
 *            thread and trips the deadline. Examples on the 44 Java pages were
 *            verified against this runtime, not a desktop JDK.
 *
 * Persists:
 *   localStorage  dlh-tryit:<page>:<n>   the learner's edited buffer, per widget
 *   Cache Storage dlh-java-runtime       the 18 MB tools.jar (NOT localStorage;
 *                                        grep for the key will mislead you)
 *
 * Output pacing: lines that arrive in one burst are revealed with a stepped
 * delay (see appendLine) so a result "walks in" — the same step-pacing idea as
 * the animated visualizers, capped so long output never stalls the learner.
 *
 * Editor: Monaco (VS Code's real editor component), loaded lazily from CDN and swapped in
 * once ready — real bracket matching, Ctrl+F find, multi-cursor, minimap (hidden below
 * 640px), and full IntelliSense on the js/ts examples specifically (Monaco bundles an
 * actual TypeScript language service). The widget mounts a plain textarea+syntax-overlay
 * FIRST so it's usable the instant the page paints, then upgrades in place — see
 * loadMonaco/upgradeToMonaco. Offline or CDN-blocked, the load resolves false and the
 * widget just stays on the textarea forever; nothing else needs to know.
 */
(function (global) {
  'use strict';

  /**
   * Pinned TypeScript build. MUST match devhub-codegrade.js and the version
   * tmp_codecheck.mjs asks for (`npm i --no-save typescript@5.6.3`).
   */
  const TS_CDN = 'https://cdn.jsdelivr.net/npm/typescript@5.6.3/lib/typescript.js';
  /**
   * Pyodide base URL; the same pin as devhub-codegrade.js so the browser cache is shared.
   */
  const PY_BASE = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/';
  /**
   * CheerpJ WASM JVM loader, loaded INSIDE the hidden runner iframe (see bootJava),
   * never into this page.
   */
  const CHEERPJ_LOADER = 'https://cjrtnc.leaningtech.com/4.3/loader.js';
  /**
   * JDK 8 javac as a jar, pinned to one javafiddle commit. This is what makes Java 8 the
   * ceiling for every Try It example. Fetched once, then served from Cache Storage.
   */
  const JAVA_TOOLS_JAR = 'https://raw.githubusercontent.com/leaningtech/javafiddle/0d847f83f11607623187340e4d12efb494f64e80/static/tools.jar';
  /**
   * Monaco Editor (the real VS Code editor component) CDN base. MUST match the pin in
   * devhub-codegrade.js — same rule as TS_CDN/PY_BASE above: bump one, bump both. Monaco's
   * own min/vs bundle ships Monarch tokenizers for js/ts/python/java out of the box (real
   * TS gets full IntelliSense via Monaco's bundled language service; python/java get
   * syntax highlighting + bracket matching, not semantic completion — there's no language
   * server for those here, and that's fine, it's still real editing, not a fake overlay).
   */
  const MONACO_CDN = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.56.0/min/vs';
  const MONACO_LANG = { js: 'javascript', ts: 'typescript', python: 'python', java: 'java' };

  /**
   * Per-language display + editor settings. `indent` drives the Tab key; `dark` picks the
   * badge text colour for contrast on the language's brand colour.
   */
  const LANG_META = {
    js:     { label: 'JavaScript', badge: '#f7df1e', dark: true,  indent: 2 },
    ts:     { label: 'TypeScript', badge: '#3178c6', dark: false, indent: 2 },
    python: { label: 'Python',     badge: '#3776ab', dark: false, indent: 4 },
    java:   { label: 'Java',       badge: '#f89820', dark: true,  indent: 4 },
  };

  /**
   * HTML-escape for anything user- or author-supplied that lands in innerHTML.
   */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* ---------- styles (injected once) ------------------------------------- */
  /**
   * Self-contained CSS, id-guarded so multiple widgets on one page inject it once. The
   * overlay selectors carry a deliberately high specificity — see the comment inside;
   * devhub-hf.css restyles every <pre> on kit pages and would break editor alignment.
   */
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
/* Monaco replaces the textarea+overlay pair once it loads (see upgradeToMonaco) —
   the box it mounts into gets the border/radius the two layers used to share. */
.dlh-tryit-monaco{min-height:170px;border:1px solid #1c2942;border-radius:8px;overflow:hidden}
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
  /**
   * In-flight TypeScript load, shared by every widget on the page so N TS examples
   * trigger ONE compiler download.
   */
  let tsLoading = null;
  /**
   * Resolve true when window.ts is usable, false when the CDN failed (offline). Never
   * rejects — the runner turns false into a readable "offline" message.
   */
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

  /* Monaco Editor (loaded once per page, shared by every Try It widget) */
  /**
   * In-flight Monaco load, shared by every widget on the page — mirrors tsLoading's
   * dedupe-the-download shape. Resolves true once window.monaco is usable, false on any
   * failure (offline, CDN blocked); NEVER rejects, so a widget's upgrade attempt can just
   * `if (!ok) return` and stay on its textarea fallback.
   */
  let monacoLoading = null;
  /**
   * One custom dark theme, defined once Monaco is up. The editor pane stays dark-terminal
   * styled regardless of the site's cream/dark toggle — same as the textarea fallback
   * above, which hardcodes #090e1a/#e2e8f0 unconditionally; matching that on purpose rather
   * than adding theme-sync plumbing for a pane that was never themed to begin with.
   */
  function defineMonacoTheme() {
    global.monaco.editor.defineTheme('dlh-dark', {
      base: 'vs-dark', inherit: true, rules: [],
      colors: {
        'editor.background': '#090e1a',
        'editor.foreground': '#e2e8f0',
        'editorLineNumber.foreground': '#334155',
        'editorLineNumber.activeForeground': '#94a3b8',
        'editor.lineHighlightBackground': '#101b30',
        'editorCursor.foreground': '#e2e8f0',
        'editorIndentGuide.background': '#1c2942',
      },
    });
  }
  /**
   * Load the Monaco AMD loader, then require its editor.main module. Uses loadScript (below)
   * for the first hop since that already dedupes/promise-wraps a <script src>; the AMD
   * require() call needs its own promise because success/failure arrive as two callbacks,
   * not a script load event.
   */
  function loadMonaco() {
    if (global.monaco) return Promise.resolve(true);
    if (monacoLoading) return monacoLoading;
    monacoLoading = loadScript(MONACO_CDN + '/loader.js').then(() => new Promise(resolve => {
      global.require.config({ paths: { vs: MONACO_CDN } });
      global.require(['vs/editor/editor.main'], () => { defineMonacoTheme(); resolve(true); }, () => resolve(false));
    })).catch(() => false);
    return monacoLoading;
  }

  /* Pyodide (one interpreter per page, reused across widgets and runs) */
  /**
   * The page's single Pyodide interpreter and its boot promise. Shared across widgets AND
   * across runs: globals a learner defines in one Try It survive into the next run on
   * the same page — a deliberate trade for not rebooting a 10 MB runtime per click.
   */
  let pyodide = null, pyBooting = null;
  /**
   * Promise wrapper around a <script src> insert. Used for Pyodide; the TS path has its
   * own because it must dedupe on window.ts.
   */
  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src; s.onload = res;
      s.onerror = () => rej(new Error('failed to load ' + src));
      document.head.appendChild(s);
    });
  }
  /**
   * Lazy, once-per-page Pyodide boot. `status` is the widget's status-line setter so the
   * first run can say why it is slow. A failed boot clears pyBooting so the NEXT click
   * retries instead of being stuck on a rejected promise forever.
   */
  function bootPyodide(status) {
    if (pyodide) return Promise.resolve(pyodide);
    if (pyBooting) return pyBooting;
    // The in-flight latch, assigned BEFORE the first await: a second Try It block that
    // runs while Pyodide is still downloading joins this promise instead of starting a
    // second ~10 MB download. Cleared on both success and failure (below) so a learner
    // who goes offline mid-boot can retry rather than being stuck on a dead promise.
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
  /**
   * The page's single CheerpJ runner iframe, its boot promise, and the tools.jar bytes.
   * javaDeadline() tears the frame down on timeout, so javaFrame can go back to null
   * mid-session and bootJava() will build a fresh one.
   */
  let javaFrame = null, javaBooting = null, javaJarBuf = null;

  /**
   * THE cross-realm fix (see banner): builds the byte array with the runner iframe's
   * own Uint8Array constructor. Every call into cheerpjAddStringFile goes through here;
   * passing a parent-realm array silently corrupts the file.
   */
  function frameBytes(win, data) {
    if (typeof data === 'string') data = new TextEncoder().encode(data);
    const out = new win.Uint8Array(data.length);
    out.set(data);
    return out;
  }
  /**
   * Hard reset of the JVM: removing the iframe kills a runaway program, which is the
   * only way to stop one — cooperative threads cannot be interrupted from outside.
   */
  function destroyJavaRuntime() {
    if (javaFrame) { try { javaFrame.remove(); } catch (e) { /* ignore */ } }
    javaFrame = null; javaBooting = null;
  }
  /**
   * tools.jar from Cache Storage bucket 'dlh-java-runtime' (shared with devhub-codegrade.js),
   * falling back to a plain fetch when the Cache API is unavailable (private mode, some
   * file:// contexts). Memoised in javaJarBuf for the life of the page.
   */
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
  /**
   * Lazy, once-per-page JVM boot inside a hidden SAME-origin iframe (srcdoc), which is
   * what lets this page read the iframe's #console text back. The loader script and the
   * jar download run in parallel; cheerpjInit then mounts the jar at /str/tools.jar.
   * Same retry-on-failure shape as bootPyodide.
   */
  function bootJava(status) {
    if (javaFrame) return Promise.resolve(javaFrame);
    if (javaBooting) return javaBooting;
    // Same in-flight latch as bootPyodide: set before the first await so concurrent
    // callers share one CheerpJ boot, cleared on failure so a retry is possible.
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
  /**
   * Race a JVM step against a timeout. On timeout the WHOLE runtime is destroyed (not
   * just the promise abandoned) because a spinning Java thread would otherwise keep
   * burning the tab's CPU behind the "infinite loop?" message.
   */
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

  /**
   * JS runner. Spins up a throwaway sandboxed iframe whose boot script rewires console.*
   * to postMessage lines back on a per-run channel id (so two widgets' output cannot
   * cross), wraps the learner's code in an async IIFE so top-level await works, and
   * kills the frame after 5 s. The channel check in onMsg is the security boundary on
   * this side: the frame is opaque-origin and can only talk through postMessage.
   */
  function runJsFree(code, onLine) {
    return new Promise(resolve => {
      const channel = 'ti-' + Math.random().toString(36).slice(2);
      let settled = false, frame = null, killTimer = null;
      /**
       * Detach the listener and drop the frame (after a beat so a final message lands).
       */
      function cleanup() {
        global.removeEventListener('message', onMsg);
        clearTimeout(killTimer);
        if (frame) setTimeout(() => frame.remove(), 200);
      }
      /**
       * Receives {channel, kind:'line'|'done'|'error'} from the sandbox; lines stream
       * through onLine immediately, the first done/error settles the run.
       */
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

  /**
   * TS runner: transpileModule (no type-check — a type error still runs, which is the
   * same behaviour as tsc --noEmitOnError false) then hands the JS to runJsFree.
   */
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

  /**
   * Python runner. Stdout/stderr are captured in batched mode (Pyodide flushes per line),
   * and reset in `finally` so a failed run does not leave the interpreter piping output
   * into a widget that no longer exists.
   */
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

  /**
   * Pick the class to compile/run from the buffer's `public class X` — Try It examples are
   * single-file, so the public class is the entry point. Defaults to Main.
   */
  function javaMainClass(code) {
    const m = code.match(/public\s+(?:final\s+|abstract\s+)?class\s+([A-Za-z_$][\w$]*)/);
    return m ? m[1] : 'Main';
  }
  /**
   * Java runner: boot (≤180 s, first run downloads ~40 MB) → javac via
   * com.sun.tools.javac.Main against /str/tools.jar (≤90 s) → run the main class
   * (≤30 s). Output is not streamed: CheerpJ writes stdout into the iframe's #console,
   * which is read once at the end and split into lines, so a Java result always arrives
   * as one burst and appendLine's walk-in animation carries the pacing.
   */
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

  /**
   * Dispatch table keyed by data-lang. All four share the signature (code, onLine, status).
   */
  const RUNNERS = { js: (c, l, s) => runJsFree(c, l), ts: runTsFree, python: runPyFree, java: runJavaFree };

  /* only one heavyweight runtime run at a time page-wide (JVM + Pyodide are shared) */
  /**
   * Page-wide run lock. The JVM and Pyodide are singletons with one console each, so two
   * concurrent runs would interleave output; the second click is refused with a status
   * message instead.
   */
  let busy = false;

  /* ---------- widget ------------------------------------------------------ */
  /**
   * Mount order on the page → the :<n> suffix of each widget's localStorage key. Reordering
   * the Try It blocks on a lesson page therefore shuffles saved buffers between them.
   */
  let widgetCount = 0;
  /**
   * The page's file name, the :<page> part of the storage key — stable whether the page
   * is opened standalone or inside app.html's iframe.
   */
  function pageKey() { return (location.pathname.split('/').pop() || 'page'); }

  /**
   * Build one widget into `host`: header + badge, optional predict-first prompt, the
   * editor (transparent textarea over a coloured <pre>), Run/Reset bar, output pane.
   * Wires localStorage restore/save, Tab-indent with the Esc-then-Tab escape hatch, the
   * burst-aware output reveal, and the Run click that dispatches through RUNNERS. Called
   * by attachAll for each .tryit host; also public (DevHubTryIt.render) for pages that
   * build widgets programmatically.
   */
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
    /**
     * Repaint the overlay from the textarea's current value. Called on every input, Tab,
     * reset and restore — cheap because DevHubSyntax.highlight is a single regex pass.
     */
    function syncHl() {
      if (!canHl) return;
      // trailing \n so the last line keeps its height while the caret is on it
      hlPre.innerHTML = global.DevHubSyntax.highlight(ed.value) + '\n';
    }
    ed.addEventListener('scroll', () => {
      hlPre.scrollTop = ed.scrollTop;
      hlPre.scrollLeft = ed.scrollLeft;
    });

    /* Monaco upgrade state. getCode/setCode are the ONE indirection point every other
       handler below goes through, so Run/Reset/autosize/save don't care which backend is
       live — see upgradeToMonaco for how the swap happens mid-flight. */
    let monacoEditor = null, monacoContainer = null;
    function getCode() { return monacoEditor ? monacoEditor.getValue() : ed.value; }
    function setCode(v) { if (monacoEditor) monacoEditor.setValue(v); else ed.value = v; }

    let saved = null;
    try { saved = localStorage.getItem(lsKey); } catch (e) { /* ignore */ }
    ed.value = saved != null ? saved : original;
    autosize();
    syncHl();

    /**
     * Grow the editor with its content between 6 and 30 lines so a short example does not
     * sit in a tall empty box and a long one does not need an inner scrollbar. Targets
     * whichever backend is live: the textarea's own minHeight, or the Monaco container's
     * height (Monaco's automaticLayout then resizes the instance to fill it).
     */
    function autosize() {
      const lines = getCode().split('\n').length;
      const px = Math.min(30, Math.max(6, lines + 1)) * 1.7 * 12.5 + 24;
      if (monacoEditor) monacoContainer.style.height = px + 'px';
      else ed.style.minHeight = px + 'px';
    }
    ed.addEventListener('input', () => {
      try { localStorage.setItem(lsKey, ed.value); } catch (e) { /* ignore */ }
      autosize();
      syncHl();
    });

    /**
     * Attempt the Monaco upgrade in the background — never blocks first paint, since the
     * textarea above is already fully usable the instant the widget mounts. On any failure
     * (offline, CDN blocked) loadMonaco resolves false and this widget simply stays on the
     * textarea path forever; nothing else has to know the upgrade didn't happen.
     */
    loadMonaco().then(ok => {
      if (!ok || monacoEditor) return;
      const isNarrow = host.getBoundingClientRect().width < 640;
      const hadFocus = document.activeElement === ed;
      const currentCode = getCode();
      monacoContainer = document.createElement('div');
      monacoContainer.className = 'dlh-tryit-monaco';
      monacoContainer.title = 'Tab indents — press Ctrl+M to toggle Tab-moves-focus mode';
      edwrap.innerHTML = '';
      edwrap.appendChild(monacoContainer);
      monacoEditor = global.monaco.editor.create(monacoContainer, {
        value: currentCode,
        language: MONACO_LANG[lang] || 'plaintext',
        theme: 'dlh-dark',
        automaticLayout: true,
        minimap: { enabled: !isNarrow },
        fontSize: 12.5,
        lineHeight: 21,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        tabSize: meta.indent,
        insertSpaces: true,
        scrollBeyondLastLine: false,
        renderLineHighlight: 'line',
        padding: { top: 10, bottom: 10 },
        scrollbar: { alwaysConsumeMouseWheel: false },
      });
      monacoEditor.onDidChangeModelContent(() => {
        try { localStorage.setItem(lsKey, getCode()); } catch (e) { /* ignore */ }
        autosize();
      });
      monacoEditor.addCommand(global.monaco.KeyMod.CtrlCmd | global.monaco.KeyCode.Enter, () => runBtn.click());
      autosize();
      if (hadFocus) monacoEditor.focus();
    });
    // Tab indents, Esc-then-Tab leaves — same escape hatch as the graded IDE
    // (devhub-codegrade.js): a Tab-capturing editor with no way out is a
    // keyboard trap on all 119 Try It pages. Only reached on the textarea
    // fallback — once Monaco is live this handler sits on a detached node and
    // never fires; Monaco's own Ctrl+M (toggleTabFocusMode) is the escape hatch
    // there, surfaced via monacoContainer.title above.
    let tabEscapes = false;
    ed.addEventListener('keydown', e => {
      if (e.key === 'Escape') { tabEscapes = true; return; }
      if (e.key !== 'Tab') { tabEscapes = false; return; }
      if (tabEscapes) { tabEscapes = false; return; }   // browser default: focus moves on
      e.preventDefault();
      const pad = ' '.repeat(meta.indent);
      const s = ed.selectionStart, epos = ed.selectionEnd;
      ed.value = ed.value.slice(0, s) + pad + ed.value.slice(epos);
      ed.selectionStart = ed.selectionEnd = s + pad.length;
      try { localStorage.setItem(lsKey, ed.value); } catch (err) { /* ignore */ }
      syncHl();
    });
    ed.title = 'Tab indents — press Esc then Tab to move focus out';

    resetBtn.addEventListener('click', () => {
      setCode(original);
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
    /**
     * Add one output line with the stepped reveal delay described above the burst counters.
     * Error lines (kind 'err') get the red .err class.
     */
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
        outcome = await RUNNERS[lang](getCode(), appendLine, msg => { statusEl.textContent = msg; });
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
  /**
   * Declarative mount: turn every <div class="tryit" data-lang> into a widget, reading the
   * example from its <script type="text/plain"> child (so the browser never parses the
   * example as HTML — angle brackets in Java generics survive). Idempotent via
   * data-tryit-done. Runs at DOMContentLoaded; public as DevHubTryIt.attachAll for pages
   * that add hosts later.
   */
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
