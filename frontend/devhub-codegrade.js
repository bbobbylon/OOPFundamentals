/* ============================================================================
 * devhub-codegrade.js — DevHub's reusable coding-exercise / IDE engine.
 *
 * One engine, many exercise banks. A page supplies a bank of exercises (a
 * prompt + starter code + hidden test cases per language); this file renders
 * the whole experience: an exercise list with solved-state, a textarea+gutter
 * code editor per language, a Run Tests button, and a pass/fail results panel
 * with per-test args/expected/got.
 *
 * Execution is 100% client-side, reusing the exact engines already proven in
 * this repo's playground pages — no new infra, no server required:
 *   - JavaScript / TypeScript: the real `typescript` compiler (same CDN
 *     build as typescript-playground-visualizer.html) transpiles TS -> JS;
 *     both run inside a sandboxed `<iframe sandbox="allow-scripts">` (opaque
 *     origin — cannot touch this page), exactly like that playground's
 *     runInSandbox().
 *   - Python: real CPython via Pyodide/WASM (same CDN build as
 *     python-playground-visualizer.html).
 *
 * USAGE (from a standalone page, loaded in the hub iframe):
 *
 *   <div id="practice"></div>
 *   <script src="devhub-codegrade.js"></script>
 *   <script>
 *     DevHubCodeGrade.render(document.getElementById('practice'), {
 *       id:     'arrays-strings',        // stable key for localStorage
 *       title:  'Arrays & Strings',
 *       accent: '#38bdf8',
 *       exercises: [ {…}, {…} ]          // see EXERCISE FORMAT below
 *     });
 *   </script>
 *
 * EXERCISE FORMAT:
 *   {
 *     id: 'two-sum', title: 'Two Sum', difficulty: 'easy', domain: 'Hashing',
 *     prompt: 'Given an array…',                  // HTML allowed
 *     signature: { javascript: 'function twoSum(nums, target)',
 *                  typescript: 'function twoSum(nums: number[], target: number): number[]',
 *                  python: 'def two_sum(nums, target):' },
 *     starter:   { javascript: '…', typescript: '…', python: '…' },
 *     functionName: { javascript: 'twoSum', typescript: 'twoSum', python: 'two_sum' },
 *     tests: [ { args: [[2,7,11,15], 9], expected: [0,1], unordered: true }, … ],
 *     hints: ['Try a hashmap…', 'Store each…'],
 *     ref: { label: 'Two-pointer & hashmap technique', file: 'interview-arrays-strings-visualizer.html' }
 *   }
 *
 * OPTIONAL SHAPE ADAPTERS (for data-structure exercises like linked lists):
 * plain JSON test data (arrays, objects, numbers) is all __eq() can compare, but some
 * problems need the user's own function to receive/return real node objects. Set
 * `argShapes: [shape, shape, …]` (one entry per positional arg, undefined = pass through
 * as-is) and/or `resultShape: shape` on an exercise; the runner converts before calling
 * the user's function and after, so `tests[].args`/`expected` stay plain JSON:
 *   - 'list'            — a plain array becomes a real { val, next } chain; a returned
 *                          chain converts back to a plain array for comparison.
 *   - 'list-with-cycle' — a plain { values: [...], pos: n } spec becomes a chain whose
 *                          tail.next points at index n (n < 0 = no cycle). Input only —
 *                          there is no matching resultShape (converting a cyclic chain
 *                          back to an array would infinite-loop).
 *   - 'tree'            — a level-order array with `null` gaps (LeetCode's standard binary
 *                          tree encoding, e.g. [3,9,20,null,null,15,7]) becomes a real
 *                          { val, left, right } node structure; a returned tree converts
 *                          back to the same level-order-with-nulls array (trailing nulls
 *                          trimmed) for comparison.
 * ========================================================================== */
(function (global) {
  'use strict';

  const TS_CDN = 'https://cdn.jsdelivr.net/npm/typescript@5.6.3/lib/typescript.js';
  const PY_BASE = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/';

  /* ---- tiny DOM helper: h('div', {class:'x'}, child, child) ------------- */
  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    if (props) {
      for (const k in props) {
        if (k === 'class') el.className = props[k];
        else if (k === 'html') el.innerHTML = props[k];
        else if (k.startsWith('on') && typeof props[k] === 'function') el.addEventListener(k.slice(2), props[k]);
        else if (props[k] != null) el.setAttribute(k, props[k]);
      }
    }
    for (const kid of kids.flat()) {
      if (kid == null || kid === false) continue;
      el.appendChild(typeof kid === 'string' ? document.createTextNode(kid) : kid);
    }
    return el;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* ---- format a JS value for display (args / expected / got) ------------ */
  function fmt(v) {
    if (typeof v === 'string') return JSON.stringify(v);
    if (v === null) return 'null';
    if (v === undefined) return 'undefined';
    if (Array.isArray(v)) return '[' + v.map(fmt).join(', ') + ']';
    if (typeof v === 'object') return '{' + Object.keys(v).map(k => k + ': ' + fmt(v[k])).join(', ') + '}';
    return String(v);
  }
  function fmtArgs(args) { return args.map(fmt).join(', '); }

  /* ---- localStorage progress (per bank id) ------------------------------ */
  const lsKey = id => 'dlh-codegrade:' + id;
  function loadProgress(id) {
    try { return JSON.parse(localStorage.getItem(lsKey(id))) || {}; } catch (e) { return {}; }
  }
  function saveProgress(id, data) {
    try { localStorage.setItem(lsKey(id), JSON.stringify(data)); } catch (e) { /* ignore */ }
  }

  /* ---- navigate the parent hub to another visualizer page --------------- */
  function gotoPage(file) {
    try { global.parent.postMessage({ type: 'dlh-navigate', file: file }, '*'); }
    catch (e) { /* not embedded — ignore */ }
    global.location.href = file;
  }

  /* ---- inject the engine's stylesheet once ------------------------------ */
  function injectStyles() {
    if (document.getElementById('dlh-codegrade-styles')) return;
    const css = `
.cg{--cg-accent:#38bdf8;--cg-good:#34d399;--cg-bad:#f87171;--cg-panel:#1e293b;
    --cg-bg:#0f172a;--cg-border:#334155;--cg-muted:#94a3b8;--cg-text:#e2e8f0;
    color:var(--cg-text);max-width:1100px;margin:0 auto}
.cg *{box-sizing:border-box}
.cg-head{background:var(--cg-panel);border:1px solid var(--cg-border);border-radius:14px;padding:20px 24px;margin-bottom:16px}
.cg-h{font-size:22px;font-weight:800;color:var(--cg-accent);margin:0 0 4px}
.cg-sub{font-size:13px;color:var(--cg-muted);margin:0 0 14px}
.cg-prog{display:flex;align-items:center;gap:10px}
.cg-prog-bar{flex:1;height:8px;background:#0b1426;border:1px solid var(--cg-border);border-radius:6px;overflow:hidden}
.cg-prog-bar i{display:block;height:100%;background:var(--cg-accent);transition:width .25s}
.cg-prog-txt{font-size:12.5px;color:var(--cg-muted);white-space:nowrap;font-variant-numeric:tabular-nums}
.cg-layout{display:grid;grid-template-columns:230px 1fr;gap:16px;align-items:start}
@media(max-width:820px){.cg-layout{grid-template-columns:1fr}}
.cg-list{background:var(--cg-panel);border:1px solid var(--cg-border);border-radius:12px;padding:8px;position:sticky;top:12px}
.cg-item{display:flex;align-items:center;gap:8px;padding:9px 10px;border-radius:8px;cursor:pointer;font-size:13px;color:var(--cg-text)}
.cg-item:hover{background:#0b1426}
.cg-item.on{background:rgba(56,189,248,.12);border:1px solid var(--cg-accent)}
.cg-item .dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;background:var(--cg-border)}
.cg-item.solved .dot{background:var(--cg-good)}
.cg-item .diff{font-size:9.5px;text-transform:uppercase;letter-spacing:.04em;color:var(--cg-muted);margin-left:auto;flex-shrink:0}
.cg-panel{background:var(--cg-panel);border:1px solid var(--cg-border);border-radius:12px;padding:22px 24px}
.cg-chips{display:flex;gap:8px;margin-bottom:10px}
.cg-chip{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;
    background:rgba(56,189,248,.12);color:var(--cg-accent);border-radius:5px;padding:2px 8px}
.cg-chip.easy{background:rgba(52,211,153,.12);color:var(--cg-good)}
.cg-chip.medium{background:rgba(251,191,36,.14);color:#fbbf24}
.cg-chip.hard{background:rgba(248,113,113,.12);color:var(--cg-bad)}
.cg-title{font-size:19px;font-weight:800;margin:0 0 10px;color:var(--cg-text)}
.cg-prompt{font-size:14px;line-height:1.65;color:#cbd5e1;margin:0 0 6px}
.cg-prompt code{background:#0b1426;border:1px solid var(--cg-border);border-radius:4px;padding:1px 5px;font-size:12.5px}
.cg-sig{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12.5px;color:#7dd3fc;
    background:#0b1426;border:1px solid var(--cg-border);border-radius:6px;padding:8px 12px;margin:10px 0}
.cg-ref{font-size:12.5px;margin:6px 0 16px}
.cg-ref a{color:var(--cg-accent);text-decoration:none;font-weight:700}
.cg-ref a:hover{text-decoration:underline}
.cg-tabs{display:flex;gap:6px;margin-bottom:10px}
.cg-tab{font:inherit;font-size:12.5px;font-weight:700;border-radius:7px 7px 0 0;padding:7px 14px;cursor:pointer;
    border:1px solid var(--cg-border);border-bottom:none;background:#0b1426;color:var(--cg-muted)}
.cg-tab.on{background:#04070f;color:var(--cg-accent);border-color:var(--cg-accent)}
.cg-editor{display:flex;background:#04070f;font-family:'Cascadia Code',ui-monospace,Consolas,monospace;
    font-size:13px;line-height:1.55;min-height:200px;border:1px solid var(--cg-border);border-radius:0 8px 8px 8px}
.cg-gutter{padding:12px 8px 12px 12px;text-align:right;color:#3a4a63;user-select:none;background:#060b16;
    border-right:1px solid var(--cg-border);white-space:pre;overflow:hidden;border-radius:0 0 0 8px}
.cg-ta{flex:1;background:transparent;color:#dbe4f0;border:none;outline:none;resize:vertical;padding:12px 14px;
    font-family:inherit;font-size:inherit;line-height:inherit;white-space:pre;overflow-x:auto;tab-size:2;min-height:200px}
.cg-toolbar{display:flex;align-items:center;gap:10px;margin:12px 0}
.cg-btn{font:inherit;font-size:13.5px;font-weight:700;border-radius:9px;padding:9px 18px;cursor:pointer;
    border:1px solid var(--cg-border);background:#0b1426;color:var(--cg-text);transition:all .12s}
.cg-btn:hover{border-color:var(--cg-accent)}
.cg-btn.primary{background:var(--cg-accent);border-color:var(--cg-accent);color:#04263a}
.cg-btn.primary:hover{filter:brightness(1.08)}
.cg-btn:disabled{opacity:.5;cursor:not-allowed}
.cg-btn.ghost{background:transparent}
.cg-status{font-size:12.5px;color:var(--cg-muted)}
.cg-results{margin-top:6px}
.cg-summary{font-size:14px;font-weight:700;margin:14px 0 8px}
.cg-summary.pass{color:var(--cg-good)}
.cg-summary.fail{color:var(--cg-bad)}
.cg-case{background:#0b1426;border:1px solid var(--cg-border);border-radius:8px;padding:10px 13px;margin:7px 0;
    font-size:12.5px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;line-height:1.6}
.cg-case.pass{border-left:3px solid var(--cg-good)}
.cg-case.fail{border-left:3px solid var(--cg-bad)}
.cg-case .ln{color:var(--cg-muted)}
.cg-case .er{color:var(--cg-bad)}
.cg-hints{margin-top:16px;padding-top:14px;border-top:1px dashed var(--cg-border)}
.cg-hint{font-size:12.5px;color:#cbd5e1;background:#0b1426;border:1px solid var(--cg-border);border-radius:8px;
    padding:8px 12px;margin:6px 0}
.cg-keytab{font-size:11.5px;color:var(--cg-muted);margin-top:8px}
    `;
    document.head.appendChild(h('style', { id: 'dlh-codegrade-styles', html: css }));
  }

  /* ---- lazy-load the real TypeScript compiler (shared with the TS playground's CDN build) ---- */
  let tsReady = false, tsLoading = null;
  function loadTs() {
    if (tsReady) return Promise.resolve(true);
    if (tsLoading) return tsLoading;
    tsLoading = new Promise(resolve => {
      const s = document.createElement('script');
      s.src = TS_CDN;
      s.onload = () => { tsReady = !!global.ts; resolve(tsReady); };
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });
    return tsLoading;
  }
  function transpileTs(code) {
    const ts = global.ts;
    return ts.transpileModule(code, {
      compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None, esModuleInterop: true }
    }).outputText;
  }

  /* ---- run JS (or transpiled TS) inside a sandboxed iframe, get graded results ---- */
  function runJsLike(fnCode, functionName, tests, timeoutMs, argShapes, resultShape) {
    return new Promise(resolve => {
      const channel = 'cg-' + Math.random().toString(36).slice(2);
      let settled = false;
      function onMsg(e) {
        if (!e.data || e.data.channel !== channel) return;
        if (settled) return;
        settled = true;
        cleanup();
        if (e.data.kind === 'error') resolve({ error: e.data.error });
        else resolve({ results: e.data.results });
      }
      let frame, killTimer;
      function cleanup() {
        global.removeEventListener('message', onMsg);
        clearTimeout(killTimer);
        if (frame) setTimeout(() => frame.remove(), 200);
      }
      global.addEventListener('message', onMsg);

      const harness = `
function __buildList(arr) {
  let head = null, tail = null;
  for (const v of arr) {
    const node = { val: v, next: null };
    if (!head) { head = node; tail = node; } else { tail.next = node; tail = node; }
  }
  return head;
}
function __buildListWithCycle(spec) {
  const nodes = spec.values.map(v => ({ val: v, next: null }));
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1];
  if (spec.pos >= 0 && nodes.length) nodes[nodes.length - 1].next = nodes[spec.pos];
  return nodes.length ? nodes[0] : null;
}
function __listToArray(node) {
  const out = []; let cur = node, guard = 0;
  while (cur && guard++ < 100000) { out.push(cur.val); cur = cur.next; }
  return out;
}
function __buildTree(arr) {
  if (!arr || !arr.length || arr[0] === null) return null;
  const root = { val: arr[0], left: null, right: null };
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (i < arr.length) {
      const lv = arr[i++];
      if (lv !== null) { node.left = { val: lv, left: null, right: null }; queue.push(node.left); }
    }
    if (i < arr.length) {
      const rv = arr[i++];
      if (rv !== null) { node.right = { val: rv, left: null, right: null }; queue.push(node.right); }
    }
  }
  return root;
}
function __treeToArray(root) {
  if (!root) return [];
  const out = []; const queue = [root];
  while (queue.length) {
    const node = queue.shift();
    if (node) { out.push(node.val); queue.push(node.left); queue.push(node.right); }
    else out.push(null);
  }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
}
function __applyArgShape(shape, value) {
  if (shape === 'list') return __buildList(value);
  if (shape === 'list-with-cycle') return __buildListWithCycle(value);
  if (shape === 'tree') return __buildTree(value);
  return value;
}
function __applyResultShape(shape, value) {
  if (shape === 'list') return __listToArray(value);
  if (shape === 'tree') return __treeToArray(value);
  return value;
}
${fnCode}
const __tests = ${JSON.stringify(tests)};
const __argShapes = ${JSON.stringify(argShapes || [])};
const __resultShape = ${JSON.stringify(resultShape || null)};
function __eq(a,b){
  if(a===b) return true;
  if(typeof a==='number'&&typeof b==='number'&&Number.isNaN(a)&&Number.isNaN(b)) return true;
  if(typeof a!==typeof b||a===null||b===null) return false;
  if(Array.isArray(a)!==Array.isArray(b)) return false;
  if(Array.isArray(a)){ if(a.length!==b.length) return false; for(let i=0;i<a.length;i++) if(!__eq(a[i],b[i])) return false; return true; }
  if(typeof a==='object'){ const ka=Object.keys(a),kb=Object.keys(b); if(ka.length!==kb.length) return false; for(const k of ka) if(!__eq(a[k],b[k])) return false; return true; }
  return false;
}
const __results = __tests.map(t => {
  try {
    const __callArgs = t.args.map((a, i) => __applyArgShape(__argShapes[i], a));
    const rawGot = ${functionName}(...__callArgs);
    const got = __applyResultShape(__resultShape, rawGot);
    let pass;
    if (t.unordered && Array.isArray(got) && Array.isArray(t.expected)) {
      const gs = got.slice().sort(), es = t.expected.slice().sort();
      pass = __eq(gs, es);
    } else pass = __eq(got, t.expected);
    return { pass, got };
  } catch (e) { return { pass: false, error: (e && e.message) || String(e) }; }
});
parent.postMessage({ channel: ${JSON.stringify(channel)}, kind: 'done', results: __results }, '*');
`;
      const safeJs = JSON.stringify(harness).replace(/</g, '\\u003c');
      const runner = `<!doctype html><meta charset="utf-8"><body><script>
        window.addEventListener('unhandledrejection', e => parent.postMessage({channel:${JSON.stringify(channel)}, kind:'error', error:'Uncaught (in promise) ' + (e.reason && e.reason.message || String(e.reason))}, '*'));
        const code = ${safeJs};
        const blob = new Blob([code], {type:'text/javascript'});
        const url = URL.createObjectURL(blob);
        import(url).catch(err => parent.postMessage({channel:${JSON.stringify(channel)}, kind:'error', error:(err && err.stack ? err.name+': '+err.message : String(err))}, '*'));
      <\/script></body>`;

      frame = document.createElement('iframe');
      frame.setAttribute('sandbox', 'allow-scripts');
      frame.style.display = 'none';
      frame.srcdoc = runner;
      document.body.appendChild(frame);
      killTimer = setTimeout(() => {
        if (settled) return;
        settled = true; cleanup();
        resolve({ error: 'Stopped after ' + (timeoutMs / 1000) + 's — infinite loop?' });
      }, timeoutMs || 5000);
    });
  }

  /* ---- lazy-boot Pyodide (shared with the Python playground's CDN build) ---- */
  let pyodide = null, pyBooting = null;
  function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('failed to load ' + src)); document.head.appendChild(s); }); }
  function bootPyodide() {
    if (pyodide) return Promise.resolve(pyodide);
    if (pyBooting) return pyBooting;
    pyBooting = (async () => {
      if (!global.loadPyodide) await loadScript(PY_BASE + 'pyodide.js');
      pyodide = await global.loadPyodide({ indexURL: PY_BASE });
      return pyodide;
    })();
    return pyBooting;
  }
  async function runPython(code, functionName, tests, argShapes, resultShape) {
    const py = await bootPyodide();
    const harness = `
import json

class __ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def __build_list(arr):
    head = None
    tail = None
    for v in arr:
        node = __ListNode(v)
        if head is None:
            head = node
            tail = node
        else:
            tail.next = node
            tail = node
    return head

def __build_list_with_cycle(spec):
    values = spec['values']
    pos = spec['pos']
    nodes = [__ListNode(v) for v in values]
    for i in range(len(nodes) - 1):
        nodes[i].next = nodes[i + 1]
    if pos >= 0 and nodes:
        nodes[-1].next = nodes[pos]
    return nodes[0] if nodes else None

def __list_to_array(node):
    out = []
    cur = node
    guard = 0
    while cur is not None and guard < 100000:
        out.append(cur.val)
        cur = cur.next
        guard += 1
    return out

class __TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def __build_tree(arr):
    if not arr or arr[0] is None:
        return None
    root = __TreeNode(arr[0])
    queue = [root]
    i = 1
    n = len(arr)
    while queue and i < n:
        node = queue.pop(0)
        if i < n:
            lv = arr[i]; i += 1
            if lv is not None:
                node.left = __TreeNode(lv)
                queue.append(node.left)
        if i < n:
            rv = arr[i]; i += 1
            if rv is not None:
                node.right = __TreeNode(rv)
                queue.append(node.right)
    return root

def __tree_to_array(root):
    if root is None:
        return []
    out = []
    queue = [root]
    while queue:
        node = queue.pop(0)
        if node is not None:
            out.append(node.val)
            queue.append(node.left)
            queue.append(node.right)
        else:
            out.append(None)
    while out and out[-1] is None:
        out.pop()
    return out

def __apply_arg_shape(shape, value):
    if shape == 'list':
        return __build_list(value)
    if shape == 'list-with-cycle':
        return __build_list_with_cycle(value)
    if shape == 'tree':
        return __build_tree(value)
    return value

def __apply_result_shape(shape, value):
    if shape == 'list':
        return __list_to_array(value)
    if shape == 'tree':
        return __tree_to_array(value)
    return value

${code}
__tests = json.loads(${JSON.stringify(JSON.stringify(tests))})
__arg_shapes = json.loads(${JSON.stringify(JSON.stringify(argShapes || []))})
__result_shape = json.loads(${JSON.stringify(JSON.stringify(resultShape || null))})
__results = []
for __t in __tests:
    try:
        __call_args = [__apply_arg_shape(__arg_shapes[__i] if __i < len(__arg_shapes) else None, __a) for __i, __a in enumerate(__t['args'])]
        __raw_got = ${functionName}(*__call_args)
        __got = __apply_result_shape(__result_shape, __raw_got)
        if __t.get('unordered') and isinstance(__got, list) and isinstance(__t['expected'], list):
            __pass = sorted(__got) == sorted(__t['expected'])
        else:
            __pass = __got == __t['expected']
        __results.append({'pass': __pass, 'got': __got})
    except Exception as __e:
        __results.append({'pass': False, 'error': str(__e)})
__results
`;
    try {
      const res = await py.runPythonAsync(harness);
      const out = res && typeof res.toJs === 'function' ? res.toJs({ dict_converter: Object.fromEntries }) : res;
      if (res && typeof res.destroy === 'function') res.destroy();
      return { results: out };
    } catch (e) {
      return { error: (e && e.message) || String(e) };
    }
  }

  /* ---- render one exercise's editor+results panel ------------------------ */
  function renderExercise(root, bank, ex, progress, onSolved) {
    const langs = Object.keys(ex.starter);
    let lang = ex.__lastLang && langs.includes(ex.__lastLang) ? ex.__lastLang : langs[0];
    const stored = (progress[ex.id] && progress[ex.id].code) || {};

    const panel = h('div', { class: 'cg-panel' });
    const diffClass = ex.difficulty || 'medium';
    panel.appendChild(h('div', { class: 'cg-chips' },
      h('span', { class: 'cg-chip ' + diffClass }, ex.difficulty || ''),
      h('span', { class: 'cg-chip' }, ex.domain || '')
    ));
    panel.appendChild(h('h3', { class: 'cg-title' }, ex.title));
    panel.appendChild(h('p', { class: 'cg-prompt', html: ex.prompt }));
    if (ex.ref) {
      panel.appendChild(h('div', { class: 'cg-ref' },
        '📺 ', h('a', { href: '#', onclick: (e) => { e.preventDefault(); gotoPage(ex.ref.file); } }, 'Learn more: ' + ex.ref.label)
      ));
    }

    const tabsEl = h('div', { class: 'cg-tabs' });
    const sigEl = h('div', { class: 'cg-sig' });
    const gutter = h('div', { class: 'cg-gutter' }, '1');
    const ta = h('textarea', { class: 'cg-ta', spellcheck: 'false', autocomplete: 'off', autocapitalize: 'off', wrap: 'off' });
    const editorWrap = h('div', { class: 'cg-editor' }, gutter, ta);
    const statusEl = h('span', { class: 'cg-status' });
    const runBtn = h('button', { class: 'cg-btn primary' }, '▶ Run Tests');
    const resetBtn = h('button', { class: 'cg-btn ghost' }, 'Reset');
    const resultsEl = h('div', { class: 'cg-results' });
    const hintsWrap = h('div', { class: 'cg-hints' });

    function refreshGutter() {
      const n = ta.value.split('\n').length;
      let g = ''; for (let i = 1; i <= n; i++) g += i + (i < n ? '\n' : '');
      gutter.textContent = g || '1';
    }
    function loadLang(l) {
      lang = l; ex.__lastLang = l;
      sigEl.textContent = ex.signature[l] || '';
      ta.value = stored[l] || ex.starter[l] || '';
      refreshGutter();
      tabsEl.querySelectorAll('.cg-tab').forEach(b => b.classList.toggle('on', b.dataset.lang === l));
      const solved = progress[ex.id] && progress[ex.id].solved;
      statusEl.textContent = solved ? '✓ solved previously' : '';
    }
    langs.forEach(l => {
      const label = l === 'javascript' ? 'JavaScript' : l === 'typescript' ? 'TypeScript' : l === 'python' ? 'Python' : l;
      tabsEl.appendChild(h('button', { class: 'cg-tab', 'data-lang': l, onclick: () => loadLang(l) }, label));
    });

    ta.addEventListener('input', () => {
      refreshGutter();
      stored[lang] = ta.value;
      progress[ex.id] = progress[ex.id] || {};
      progress[ex.id].code = stored;
      saveProgress(bank.id, progress);
    });
    ta.addEventListener('scroll', () => { gutter.scrollTop = ta.scrollTop; });
    ta.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const unit = lang === 'python' ? '    ' : '  ';
        const s = ta.selectionStart, en = ta.selectionEnd;
        ta.value = ta.value.slice(0, s) + unit + ta.value.slice(en);
        ta.selectionStart = ta.selectionEnd = s + unit.length;
        refreshGutter();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runBtn.click(); }
    });
    resetBtn.onclick = () => { ta.value = ex.starter[lang] || ''; delete stored[lang]; refreshGutter(); ta.focus(); };

    runBtn.onclick = async () => {
      runBtn.disabled = true;
      resultsEl.innerHTML = '';
      statusEl.textContent = lang === 'python' ? 'booting CPython (first run downloads ~10 MB)…' : 'compiling & running…';
      let outcome;
      try {
        if (lang === 'python') {
          outcome = await runPython(ta.value, ex.functionName.python, ex.tests, ex.argShapes, ex.resultShape);
        } else {
          let code = ta.value, fnName = ex.functionName[lang];
          if (lang === 'typescript') {
            const ok = await loadTs();
            if (!ok) { statusEl.textContent = 'offline — could not load the TypeScript compiler'; runBtn.disabled = false; return; }
            code = transpileTs(code);
          }
          outcome = await runJsLike(code, fnName, ex.tests, 5000, ex.argShapes, ex.resultShape);
        }
      } catch (e) {
        outcome = { error: (e && e.message) || String(e) };
      }
      runBtn.disabled = false;

      if (outcome.error) {
        statusEl.textContent = '';
        resultsEl.appendChild(h('div', { class: 'cg-case fail' }, h('span', { class: 'er' }, esc(outcome.error))));
        return;
      }
      const results = outcome.results || [];
      const passCount = results.filter(r => r.pass).length;
      statusEl.textContent = '';
      resultsEl.appendChild(h('div', { class: 'cg-summary ' + (passCount === results.length ? 'pass' : 'fail') },
        (passCount === results.length ? '✓ ' : '✗ ') + passCount + ' / ' + results.length + ' tests passed'));
      results.forEach((r, i) => {
        const t = ex.tests[i];
        const row = h('div', { class: 'cg-case ' + (r.pass ? 'pass' : 'fail') });
        row.innerHTML = (r.pass ? '✓' : '✗') + ' <span class="ln">Test ' + (i + 1) + '</span> — input: (' + esc(fmtArgs(t.args)) + ')<br>'
          + '<span class="ln">expected:</span> ' + esc(fmt(t.expected))
          + (r.error ? '<br><span class="er">error: ' + esc(r.error) + '</span>' : '<br><span class="ln">got:</span> ' + esc(fmt(r.got)));
        resultsEl.appendChild(row);
      });

      if (passCount === results.length) {
        progress[ex.id] = progress[ex.id] || {};
        progress[ex.id].solved = true;
        progress[ex.id].code = stored;
        saveProgress(bank.id, progress);
        if (onSolved) onSolved();
      }
    };

    if (ex.hints && ex.hints.length) {
      let shown = 0;
      const hintBtn = h('button', { class: 'cg-btn ghost' }, '💡 Show a hint (' + ex.hints.length + ')');
      const hintList = h('div');
      hintBtn.onclick = () => {
        if (shown < ex.hints.length) {
          hintList.appendChild(h('div', { class: 'cg-hint' }, ex.hints[shown]));
          shown++;
        }
        if (shown >= ex.hints.length) hintBtn.disabled = true;
        hintBtn.textContent = shown >= ex.hints.length ? '💡 No more hints' : '💡 Show another hint (' + (ex.hints.length - shown) + ' left)';
      };
      hintsWrap.appendChild(hintBtn);
      hintsWrap.appendChild(hintList);
    }

    panel.appendChild(tabsEl);
    panel.appendChild(sigEl);
    panel.appendChild(editorWrap);
    panel.appendChild(h('div', { class: 'cg-keytab' }, 'Tab inserts indentation · Ctrl/⌘ + Enter runs the tests'));
    panel.appendChild(h('div', { class: 'cg-toolbar' }, runBtn, resetBtn, statusEl));
    panel.appendChild(resultsEl);
    panel.appendChild(hintsWrap);

    root.innerHTML = '';
    root.appendChild(panel);
    loadLang(lang);
    ta.focus();
  }

  /* ---- main render entry point ------------------------------------------ */
  function render(root, bank) {
    injectStyles();
    const progress = loadProgress(bank.id);
    root.innerHTML = '';
    root.className = 'cg';

    const progBar = h('div', { class: 'cg-prog-bar' }, h('i'));
    const progTxt = h('span', { class: 'cg-prog-txt' });
    function refreshProgress() {
      const total = bank.exercises.length;
      const solved = bank.exercises.filter(e => progress[e.id] && progress[e.id].solved).length;
      progBar.querySelector('i').style.width = (total ? (100 * solved / total) : 0) + '%';
      progTxt.textContent = solved + ' / ' + total + ' solved';
    }

    root.appendChild(h('div', { class: 'cg-head' },
      h('h2', { class: 'cg-h' }, bank.title),
      h('p', { class: 'cg-sub' }, bank.description || 'Real code execution, real hidden tests — write the function, press Run, see it pass or fail.'),
      h('div', { class: 'cg-prog' }, progBar, progTxt)
    ));

    const layout = h('div', { class: 'cg-layout' });
    const list = h('div', { class: 'cg-list' });
    const exPanel = h('div');
    layout.appendChild(list);
    layout.appendChild(exPanel);
    root.appendChild(layout);

    let current = bank.exercises[0];
    function selectExercise(ex) {
      current = ex;
      list.querySelectorAll('.cg-item').forEach(it => it.classList.toggle('on', it.dataset.id === ex.id));
      renderExercise(exPanel, bank, ex, progress, () => { refreshProgress(); renderList(); });
    }
    function renderList() {
      list.innerHTML = '';
      bank.exercises.forEach(ex => {
        const solved = progress[ex.id] && progress[ex.id].solved;
        const item = h('div', {
          class: 'cg-item' + (solved ? ' solved' : '') + (current && current.id === ex.id ? ' on' : ''),
          'data-id': ex.id, onclick: () => selectExercise(ex)
        }, h('span', { class: 'dot' }), h('span', {}, ex.title), h('span', { class: 'diff' }, ex.difficulty || ''));
        list.appendChild(item);
      });
    }

    refreshProgress();
    renderList();
    selectExercise(current);
  }

  global.DevHubCodeGrade = { render: render };
})(window);
