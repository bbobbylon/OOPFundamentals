/* ============================================================================
 * devhub-codegrade.js — DevHub's reusable coding-exercise / IDE engine.
 *
 * One engine, many exercise banks. A page supplies a bank of exercises (a
 * prompt + starter code + hidden test cases per language); this file renders
 * the whole experience: an exercise list with solved-state, a real code editor
 * per language, a Run Tests button, and a pass/fail results panel with per-test
 * args/expected/got.
 *
 * The editor mounts as a textarea+gutter pair so it is usable at first paint,
 * then upgrades in place to Monaco (VS Code's editor component) once the CDN
 * load lands — see loadMonaco and the upgrade inside renderExercise. Offline or
 * CDN-blocked, the upgrade never happens and the textarea stays for good;
 * getCode/setCode are the only things that know which backend is live.
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
 *   - Java: a real JVM + the real javac compiler via CheerpJ (WASM JVM from
 *     Leaning Tech, CDN loader — same "CDN dependency accepted for real
 *     engines" precedent as Pyodide). The runtime boots inside a hidden
 *     same-origin iframe owned by this engine: user code is written to the
 *     virtual FS as /str/Solution.java, compiled by com.sun.tools.javac.Main
 *     (classpath = a tools.jar fetched once and kept in Cache Storage),
 *     then a generated Harness.java replays the hidden tests against
 *     `new Solution()` and prints one sentinel-marked JSON result per test,
 *     which this file reads back from the iframe's #console element.
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
 *                  python: 'def two_sum(nums, target):',
 *                  java: 'public int[] twoSum(int[] nums, int target)' },
 *     starter:   { javascript: '…', typescript: '…', python: '…', java: '…' },
 *     functionName: { javascript: 'twoSum', typescript: 'twoSum', python: 'two_sum', java: 'twoSum' },
 *     javaTypes: ['int[]', 'int'],   // Java only: the declared Java type of each
 *                                    // positional arg, so plain JSON test data can be
 *                                    // rendered as typed Java literals in the harness
 *                                    // (JSON can't distinguish int[] from long[] or
 *                                    // char[][] from String[][]). Shaped args
 *                                    // ('list'/'tree'/…) may use 'ListNode'/'TreeNode'
 *                                    // as documentation — the shape wins either way.
 *     tests: [ { args: [[2,7,11,15], 9], expected: [0,1], unordered: true }, … ],
 *     hints: ['Try a hashmap…', 'Store each…'],
 *     ref: { label: 'Two-pointer & hashmap technique', file: 'interview-arrays-strings-visualizer.html' }
 *   }
 *
 * OPTIONAL "CODE WITH ME" COACH (per-exercise, entirely optional):
 *   coach: [
 *     { id: 'nested-loop',                 // stable id — a triggered message is
 *                                          // shown once per exercise, ever (persisted)
 *       match: { javascript: /for[\s\S]*?for\s*\(/, python: /for [^\n]*:\n[\s\S]*?for / },
 *                                          // RegExp (tested against all languages) OR
 *                                          // an object keyed by language (langs missing
 *                                          // from the object never trigger this entry)
 *       msg: 'A nested loop checks every pair — O(n²). A hashmap gets this to O(n).',
 *       tone: 'tip' },                     // 'tip' (default) | 'praise' — styling only
 *     { id: 'forgot-case-fold', absent: true,
 *       match: { javascript: /toLowerCase|toUpperCase/ },
 *       msg: "Don't forget this needs to be case-insensitive." }
 *   ]
 * `absent: true` inverts the match — it fires when the pattern is MISSING, for
 * catching a forgotten requirement rather than a wrong technique, and only
 * evaluates once the student's code has diverged meaningfully from the
 * starter (a few keystrokes in, not on the empty stub). Debounced ~900ms
 * after the last keystroke, one message at a time, each shown at most once
 * per exercise (tracked in the same per-bank localStorage progress as solved
 * state). A learner can turn the whole thing off with the toolbar's
 * "🧑‍💻 Pair" toggle (one global preference, `dlh-codegrade-coach`). Separately,
 * the engine also raises its own generic encouragement — a nudge after
 * several failed runs in a row, praise on a solve that took a real fight —
 * with no per-exercise authoring required.
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
 *
 * RELATIONSHIPS (who loads this, what it touches, what checks it):
 *   - Loaded by the 9 `practice-*.html` banks; each page is pure data + one
 *     `DevHubCodeGrade.render()` call. `app.html` shows those pages in its iframe.
 *   - Persists `dlh-codegrade:<bank id>` in localStorage: per exercise
 *     { solved, code:{lang:src}, coachSeen:[ids], fails:n }. The global
 *     "🧑‍💻 Pair" preference is the separate key `dlh-codegrade-coach`.
 *   - `dlh-java-runtime` is a CACHE STORAGE name (the fetched-once tools.jar),
 *     not a localStorage key — grep for `dlh-` will mislead you there.
 *   - Reports each first solve into `DevHubStreak` (devhub-transitions.js) when
 *     that engine is on the page; degrades silently when it is not.
 *   - "Learn more" links post a `dlh-navigate` message to the parent app.html
 *     frame so the hub swaps lessons in place (falls back to a plain navigation).
 *   - `matchCoachEntry()` is a CONTRACT WITH A GATE: tmp_coachcheck.mjs replays
 *     the real function against two samples per `coach:` entry. Change its
 *     semantics (the absent-length gate especially) and rerun that gate.
 *   - `buildJavaHarness()` / `JAVA_NODES_SRC` / `deepEq()` are exposed on
 *     `DevHubCodeGrade.__test` so tmp_java_verify.mjs compiles and runs every
 *     Java exercise against the REAL harness generator, never a copy.
 *   - Shares its CDN pins with the playground pages (same tsc / Pyodide builds),
 *     and with devhub-tryit.js, which uses the same four runtimes.
 * ========================================================================== */
(function (global) {
  'use strict';

  /** Pinned CDN builds. TS 5.6.3 is ALSO the version tmp_codecheck.mjs expects you to
   *  `npm i --no-save typescript@5.6.3` for — bump both together or the gate and the
   *  page will disagree about what compiles. Pyodide is the Python playground's build. */
  const TS_CDN = 'https://cdn.jsdelivr.net/npm/typescript@5.6.3/lib/typescript.js';
  const PY_BASE = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/';
  const CHEERPJ_LOADER = 'https://cjrtnc.leaningtech.com/4.3/loader.js';
  /* javac lives in tools.jar (the JDK-8 compiler jar JavaFiddle ships) — pinned to a
   * commit SHA so an upstream change can never silently break grading. */
  const JAVA_TOOLS_JAR = 'https://raw.githubusercontent.com/leaningtech/javafiddle/0d847f83f11607623187340e4d12efb494f64e80/static/tools.jar';
  /** Monaco (the real VS Code editor component). MUST match the pin in devhub-tryit.js —
   *  same rule as TS_CDN above: bump one, bump both, or two editors on the same site load
   *  two different editor builds. The bank's language keys are already Monaco's own
   *  language ids for three of the four, so MONACO_LANG only exists to spell out that
   *  mapping rather than rely on the coincidence. */
  const MONACO_CDN = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.56.0/min/vs';
  const MONACO_LANG = { javascript: 'javascript', typescript: 'typescript', python: 'python', java: 'java' };

  /** Tiny DOM builder used for every element this engine renders: h(tag, props, ...kids).
   *  `class` → className, `html` → innerHTML (trusted engine markup only), `onX` → listener,
   *  anything else → attribute. Kids may be strings, nodes, nested arrays, or null/false. */
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
  /** HTML-escape untrusted text (student code, test values, runtime errors) before it
   *  lands in innerHTML. Anything that came from the sandbox goes through here. */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /** Render a JS value the way the results panel shows args / expected / got. Strings
   *  keep their quotes so "5" and 5 look different — the exact confusion a failing
   *  test most often comes from. */
  function fmt(v) {
    if (typeof v === 'string') return JSON.stringify(v);
    if (v === null) return 'null';
    if (v === undefined) return 'undefined';
    if (Array.isArray(v)) return '[' + v.map(fmt).join(', ') + ']';
    if (typeof v === 'object') return '{' + Object.keys(v).map(k => k + ': ' + fmt(v[k])).join(', ') + '}';
    return String(v);
  }
  /** Comma-join a test's positional args with fmt() for the "input: (…)" line. */
  function fmtArgs(args) { return args.map(fmt).join(', '); }

  /* ---- "Code With Me" coach: global on/off preference ------------------- */
  const COACH_KEY = 'dlh-codegrade-coach';
  /** Is the "Code With Me" coach on? Default ON (missing key, or storage unavailable):
   *  the feature is opt-out, and a learner who cannot persist a preference should still
   *  get the coaching rather than silently lose it. */
  function coachEnabled() {
    try { return localStorage.getItem(COACH_KEY) !== '0'; } catch (e) { return true; }
  }
  /** Persist the global Pair on/off toggle (one preference across every bank). */
  function setCoachEnabled(v) {
    try { localStorage.setItem(COACH_KEY, v ? '1' : '0'); } catch (e) { /* ignore */ }
  }

  /* An `absent` trigger ("you forgot X") only evaluates once the student has
   * written a real amount of their own code — checking it against the bare
   * starter would fire before a single keystroke. */
  const COACH_ABSENT_MIN_EXTRA = 40;
  /** THE coach predicate — does entry `c` fire on this `code` in this `lang`?
   *  Replayed verbatim by tmp_coachcheck.mjs, so its behaviour is a tested contract:
   *   - `absent` entries return false until the student's code is at least
   *     COACH_ABSENT_MIN_EXTRA chars longer than the starter (see the note above),
   *     which is also why an `absent` entry can NEVER fire on a problem whose whole
   *     solution is under 40 chars longer than its stub — those got cut, not softened.
   *   - `match` is either one RegExp (all languages) or an object keyed by language;
   *     a language missing from the object never triggers the entry.
   *  The `instanceof RegExp` here is fine IN THE BROWSER (one realm). The gate cannot
   *  use it — its bank is evaluated in a `vm` context whose RegExp is a different
   *  constructor — so tmp_coachcheck.mjs tests with Object.prototype.toString instead.
   *  Same cross-realm family as the Uint8Array gotcha in frameBytes() below. */
  function matchCoachEntry(c, code, lang, starterCode) {
    if (c.absent && code.length < starterCode.length + COACH_ABSENT_MIN_EXTRA) return false;
    let re = c.match;
    if (re && !(re instanceof RegExp)) re = re[lang];
    if (!re) return false;
    const hit = re.test(code);
    return c.absent ? !hit : hit;
  }

  /* Generic encouragement that needs no per-exercise authoring: a nudge after
   * several failed runs in a row (re-read the failing test, don't re-guess),
   * and praise on a solve that took a real fight. Cycled, not repeated
   * verbatim, so re-hitting the same threshold on a later exercise doesn't
   * read like a canned line. */
  const STUCK_MESSAGES = [
    "Still red — that's normal. Read the FIRST failing test's exact input and expected output before touching the code again; the gap between what you returned and what was expected usually points right at the bug.",
    'A few tests still failing? Trace through the smallest failing case by hand, one line at a time — slower than guessing, but it always finds it.',
    "Worth checking: are you handling the edge cases in the test list (empty input, one element, all-the-same) or only the 'normal' case?"
  ];
  const STUCK_THRESHOLDS = [3, 6, 9];

  /* ---- localStorage progress (per bank id) ------------------------------ */
  /** localStorage key per bank: `dlh-codegrade:<bank.id>`. One JSON object holding every
   *  exercise's { solved, code, coachSeen, fails } — see the header's RELATIONSHIPS. */
  const lsKey = id => 'dlh-codegrade:' + id;
  /** Read a bank's progress object; any parse/storage failure reads as "nothing yet". */
  function loadProgress(id) {
    try { return JSON.parse(localStorage.getItem(lsKey(id))) || {}; } catch (e) { return {}; }
  }
  /** Write a bank's progress object back. Called on every keystroke (the editor buffer
   *  is persisted live), so it must never throw — private mode just loses the save. */
  function saveProgress(id, data) {
    try { localStorage.setItem(lsKey(id), JSON.stringify(data)); } catch (e) { /* ignore */ }
  }

  /** "Learn more" navigation. When this page is inside app.html's iframe, the parent
   *  listens for the `dlh-navigate` message and swaps the lesson in place (keeping the
   *  hub's sidebar/progress); the plain `location.href` is the standalone path.
   *  They are EXCLUSIVE, not a message plus a fallback. Running both is what made a
   *  "Learn more" link load the lesson TWICE inside the hub — the parent swapped the
   *  frame, then this document navigated the same frame again on top of it. The old
   *  comment here claimed postMessage to a non-listening parent is a no-op and both
   *  were therefore safe; the first half is true and the second does not follow.
   *  devhub-quiz.js, devhub-notebook-review.js and devhub-chapters.js all already
   *  branched this way — this engine was the only one that did not. */
  function gotoPage(file) {
    if (global.parent !== global) {
      try { global.parent.postMessage({ type: 'dlh-navigate', file: file }, '*'); return; }
      catch (e) { /* cross-origin parent cannot be messaged — navigate ourselves */ }
    }
    global.location.href = file;
  }

  /** Inject this engine's critical CSS once, id-guarded on `dlh-codegrade-styles`.
   *  Engines must be SELF-CONTAINED: they cannot assume devhub.css is linked (14
   *  index/landing pages do not link it). The cg-* palette is hardcoded dark on purpose;
   *  the cream theme re-skins these classes in devhub-hf.css (22 rules), not here. */
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
/* Editor height: a graded exercise is written here, not glanced at — 200px showed about
   nine lines, so a solution scrolled before it was finished. Sized off the VIEWPORT so it
   grows on a desktop and still leaves room for the toolbar and results on a laptop, with a
   floor for short windows. Drag-to-resize stays available on the textarea path. */
.cg-editor{display:flex;background:#04070f;font-family:'Cascadia Code',ui-monospace,Consolas,monospace;
    font-size:13px;line-height:1.55;min-height:clamp(340px,52vh,620px);border:1px solid var(--cg-border);border-radius:0 8px 8px 8px}
.cg-gutter{padding:12px 8px 12px 12px;text-align:right;color:var(--cg-muted);user-select:none;background:#060b16;
    border-right:1px solid var(--cg-border);white-space:pre;overflow:hidden;border-radius:0 0 0 8px}
.cg-ta{flex:1;background:transparent;color:#dbe4f0;border:none;outline:none;resize:vertical;padding:12px 14px;
    font-family:inherit;font-size:inherit;line-height:inherit;white-space:pre;overflow-x:auto;tab-size:2;min-height:clamp(340px,52vh,620px)}
/* Monaco replaces the gutter+textarea pair once it loads (see the upgrade in
   renderExercise) — it brings its own gutter, so the box only supplies the frame.
   resize:vertical works here because the upgrade sets automaticLayout, so Monaco
   re-measures itself when the learner drags the box taller. */
.cg-monaco{height:clamp(340px,52vh,620px);border:1px solid var(--cg-border);border-radius:0 8px 8px 8px;overflow:hidden;resize:vertical}
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
.cg-coach{margin-top:16px;padding-top:14px;border-top:1px dashed var(--cg-border)}
.cg-coach-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.cg-coach-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--cg-muted)}
.cg-coach-msg{display:flex;align-items:flex-start;gap:9px;background:#0b1426;border:1px solid var(--cg-border);
    border-left:3px solid var(--cg-accent);border-radius:8px;padding:9px 12px;margin:6px 0;font-size:12.5px;
    line-height:1.55;color:#cbd5e1;animation:cgFadeIn .25s ease}
.cg-coach-msg.praise{border-left-color:var(--cg-good)}
.cg-coach-msg .av{flex-shrink:0;font-size:15px;line-height:1.4}
.cg-coach-msg .tx{flex:1}
.cg-coach-msg .x{flex-shrink:0;background:none;border:none;color:var(--cg-muted);cursor:pointer;font-size:13px;
    padding:0 2px;line-height:1.4}
.cg-coach-msg .x:hover{color:var(--cg-text)}
@keyframes cgFadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
.cg-btn.coach-off{opacity:.55}
    `;
    document.head.appendChild(h('style', { id: 'dlh-codegrade-styles', html: css }));
  }

  /* ---- lazy-load the real TypeScript compiler (shared with the TS playground's CDN build) ---- */
  /** Memo for loadTs(): `tsReady` once window.ts exists, `tsLoading` while in flight so
   *  two quick Run clicks share one script load instead of injecting two. */
  let tsReady = false, tsLoading = null;
  /** Load the real TypeScript compiler from the CDN on first TS run. Resolves false
   *  (never rejects) when offline so the caller can show a status line, not a stack. */
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
  /* ---- lazy-load Monaco (one loader per page, shared by every exercise render) ---- */
  /** In-flight Monaco load, shared across exercise switches — mirrors tsLoading's
   *  dedupe-the-download shape. Resolves true once global.monaco is usable, false on any
   *  failure (offline, CDN blocked); NEVER rejects, so a caller can `if (!ok) return` and
   *  leave the textarea in place. */
  let monacoLoading = null;
  /** The editor pane is dark-terminal styled in both site themes, matching .cg-editor's
   *  hardcoded #04070f — the graded IDE was never themed with the rest of the page, and
   *  syncing it now would be a different change than this one. */
  function defineMonacoTheme() {
    global.monaco.editor.defineTheme('dlh-dark', {
      base: 'vs-dark', inherit: true, rules: [],
      colors: {
        'editor.background': '#04070f',
        'editor.foreground': '#dbe4f0',
        'editorLineNumber.foreground': '#3b4a63',
        'editorLineNumber.activeForeground': '#94a3b8',
        'editor.lineHighlightBackground': '#0b1426',
        'editorCursor.foreground': '#dbe4f0',
        'editorIndentGuide.background': '#16233a',
      },
    });
  }
  /** Load Monaco's AMD loader, then its editor.main module. The require() call needs its
   *  own promise because success and failure arrive as two callbacks rather than as a
   *  script load event. */
  function loadMonaco() {
    if (global.monaco) return Promise.resolve(true);
    if (monacoLoading) return monacoLoading;
    monacoLoading = loadScript(MONACO_CDN + '/loader.js').then(() => new Promise(resolve => {
      global.require.config({ paths: { vs: MONACO_CDN } });
      global.require(['vs/editor/editor.main'], () => { defineMonacoTheme(); unblockMonacoCss(); resolve(true); }, () => resolve(false));
    })).catch(() => false);
    return monacoLoading;
  }
  /**
   * Move Monaco's own stylesheet out of <head> after its AMD css plugin injects it there.
   *
   * Rendering WAITS on a head stylesheet, and this one is cross-origin — the structure that
   * put angular-material-cdk at a 13s first paint on a slow host, which is why tmp_smoke.mjs
   * fails a page for it. Monaco loads lazily so it never blocks the FIRST paint here, but a
   * CDN stylesheet left in <head> re-creates the shape of that bug for later navigations and
   * for anyone on a blocked host. The same <link> at the end of <body> still applies its
   * rules and is no longer render-blocking.
   */
  function unblockMonacoCss() {
    for (const l of document.querySelectorAll('head link[rel="stylesheet"]')) {
      if (l.href && l.href.indexOf('monaco-editor') !== -1) document.body.appendChild(l);
    }
  }

  /** TS → ES2020 JS, type errors IGNORED (transpileModule never type-checks). Grading
   *  is behavioural: a solution with a type error that still passes the tests passes. */
  function transpileTs(code) {
    const ts = global.ts;
    return ts.transpileModule(code, {
      compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None, esModuleInterop: true }
    }).outputText;
  }

  /** Run JS (or already-transpiled TS) against the hidden tests inside a throwaway
   *  `<iframe sandbox="allow-scripts">` — an opaque origin, so student code can neither
   *  read this page nor its localStorage. The harness below is inlined into that frame
   *  and posts one result per test back on a random per-run `channel`, which is how
   *  two overlapping runs cannot mix up each other's messages. Resolves, never rejects:
   *  { results:[{pass,got|error}] } or { error } (including the kill-timer's message). */
  function runJsLike(fnCode, functionName, tests, timeoutMs, argShapes, resultShape) {
    return new Promise(resolve => {
      const channel = 'cg-' + Math.random().toString(36).slice(2);
      let settled = false;
      /** The frame's single reply. `settled` makes the first message (or the timer) win. */
      function onMsg(e) {
        if (!e.data || e.data.channel !== channel) return;
        if (settled) return;
        settled = true;
        cleanup();
        if (e.data.kind === 'error') resolve({ error: e.data.error });
        else resolve({ results: e.data.results });
      }
      let frame, killTimer;
      /** Detach the listener + timer, then remove the frame a beat later so a message
       *  still in flight is not torn down mid-delivery. */
      function cleanup() {
        global.removeEventListener('message', onMsg);
        clearTimeout(killTimer);
        if (frame) setTimeout(() => frame.remove(), 200);
      }
      global.addEventListener('message', onMsg);

      const harness = `
/** Sandbox harness helper (runs INSIDE the iframe, not on the page). Plain array →
 *  { val, next } chain, so argShapes: ['list'] exercises receive real nodes. */
function __buildList(arr) {
  let head = null, tail = null;
  for (const v of arr) {
    const node = { val: v, next: null };
    if (!head) { head = node; tail = node; } else { tail.next = node; tail = node; }
  }
  return head;
}
/** { values, pos } → chain whose tail points back at index pos (pos < 0 = no cycle).
 *  Input-only shape: there is deliberately no reverse, it would never terminate. */
function __buildListWithCycle(spec) {
  const nodes = spec.values.map(v => ({ val: v, next: null }));
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1];
  if (spec.pos >= 0 && nodes.length) nodes[nodes.length - 1].next = nodes[spec.pos];
  return nodes.length ? nodes[0] : null;
}
/** Chain → plain array for comparison. The 100k guard stops a student's accidental
 *  cycle from hanging the sandbox before the kill-timer would. */
function __listToArray(node) {
  const out = []; let cur = node, guard = 0;
  while (cur && guard++ < 100000) { out.push(cur.val); cur = cur.next; }
  return out;
}
/** LeetCode level-order-with-null-gaps array → real { val, left, right } tree. */
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
/** Tree → the same level-order encoding, trailing nulls trimmed, so a returned tree
 *  compares equal to the plain expected array a bank author wrote by hand. */
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
/** Dispatch one positional arg through its declared argShapes entry (or pass through). */
function __applyArgShape(shape, value) {
  if (shape === 'list') return __buildList(value);
  if (shape === 'list-with-cycle') return __buildListWithCycle(value);
  if (shape === 'tree') return __buildTree(value);
  return value;
}
/** Dispatch the return value through resultShape so it compares as plain JSON. */
function __applyResultShape(shape, value) {
  if (shape === 'list') return __listToArray(value);
  if (shape === 'tree') return __treeToArray(value);
  return value;
}
${fnCode}
const __tests = ${JSON.stringify(tests)};
const __argShapes = ${JSON.stringify(argShapes || [])};
const __resultShape = ${JSON.stringify(resultShape || null)};
/** Structural equality for the sandbox: NaN equals NaN, arrays by element, objects by
 *  key set. deepEq() on the page side MUST mirror this exactly — the Java path grades
 *  with deepEq, the JS/TS/Python paths grade with this, and a divergence would grade
 *  the same answer differently per language. */
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
  /** Memo for bootPyodide(): the live interpreter, and the in-flight boot promise so a
   *  second Run during the ~10 MB download joins it instead of starting another. */
  let pyodide = null, pyBooting = null;
  /** Promise-wrapped `<script src>` injection (rejects on network failure). */
  function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('failed to load ' + src)); document.head.appendChild(s); }); }
  /** Boot CPython/WASM once per page and keep it: unlike the JS and Java paths, a
   *  Python run is NOT isolated per run — top-level names persist between runs. */
  function bootPyodide() {
    if (pyodide) return Promise.resolve(pyodide);
    if (pyBooting) return pyBooting;
    // The in-flight latch, assigned before the first await so two exercises graded in
    // quick succession share one CPython download instead of racing two. Cleared by the
    // .catch below — as bootJava does — so a boot that failed offline or on a cut-short
    // download can be retried by clicking Run again, rather than wedging Python grading
    // behind a permanently rejected promise until the page is reloaded.
    pyBooting = (async () => {
      if (!global.loadPyodide) await loadScript(PY_BASE + 'pyodide.js');
      pyodide = await global.loadPyodide({ indexURL: PY_BASE });
      return pyodide;
    })();
    pyBooting.catch(() => { pyBooting = null; });
    return pyBooting;
  }
  /** Grade Python: the student's code + a Python twin of the JS harness (same list/tree
   *  shape helpers, same unordered rule) run via runPythonAsync; the trailing
   *  `__results` expression is the return value, converted to JS with dict_converter so
   *  dicts arrive as plain objects, then destroyed to free the PyProxy. */
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

  /* ========================================================================
   * Java: real javac + JVM via CheerpJ (WASM), inside a hidden same-origin
   * iframe this engine owns. The iframe isolates CheerpJ's globals and its
   * #console stdout target from the page, and gives the kill-timer a real
   * weapon: destroying the iframe destroys a wedged JVM, and the next run
   * boots a fresh one.
   * ====================================================================== */
  /** The one live JVM iframe (null until first Java run), its in-flight boot promise,
   *  and the tools.jar bytes kept in memory so a JVM rebuild after a timeout does not
   *  even hit Cache Storage. */
  let javaFrame = null, javaBooting = null, javaJarBuf = null;

  /** CROSS-REALM GOTCHA #1. CheerpJ runs in its own iframe realm, and its Uint8Array `instanceof`
   * check fails for arrays built with the PARENT page's constructor (it then
   * silently stringifies them, corrupting binary data) — so every byte array
   * handed to cheerpjAddStringFile must be built with the FRAME's Uint8Array. */
  function frameBytes(win, data) {
    if (typeof data === 'string') data = new TextEncoder().encode(data);
    const out = new win.Uint8Array(data.length);
    out.set(data);
    return out;
  }

  /** Kill the JVM iframe (the only way to stop a wedged JVM) and forget the boot promise
   *  so the next Run boots fresh. Called by javaDeadline() on any timeout. */
  function destroyJavaRuntime() {
    if (javaFrame) { try { javaFrame.remove(); } catch (e) { /* ignore */ } }
    javaFrame = null; javaBooting = null;
  }

  /** tools.jar is ~18 MB — fetch it once, keep it in Cache Storage so revisits
   * (even after a browser restart) never re-download it. */
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
      resp = await fetch(JAVA_TOOLS_JAR); /* Cache Storage unavailable (e.g. file://) */
      if (!resp.ok) throw new Error('tools.jar HTTP ' + resp.status);
    }
    javaJarBuf = new Uint8Array(await resp.arrayBuffer());
    return javaJarBuf;
  }

  /** Boot CheerpJ inside a hidden same-origin iframe: create the frame, load the loader
   *  script INTO the frame (so CheerpJ's globals never touch this page), fetch tools.jar
   *  in parallel, then mount the jar on the virtual FS. `status(msg)` feeds the toolbar
   *  line during the ~40 MB first download. A failed boot clears `javaBooting` so the
   *  next click retries instead of awaiting a dead promise forever. */
  function bootJava(status) {
    if (javaFrame) return Promise.resolve(javaFrame);
    if (javaBooting) return javaBooting;
    // In-flight latch — see bootPyodide. Cleared by the .catch below so a failed boot
    // (offline, or the 40 MB fetch cut short) can be retried by clicking Run again.
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

  /** a run that exceeds its budget gets its whole JVM torn down — a fresh one
   * boots on the next Run click (tools.jar stays cached, so that's cheap-ish) */
  function javaDeadline(promise, ms, what) {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        destroyJavaRuntime();
        reject(new Error('Stopped after ' + (ms / 1000) + 's while ' + what + ' — infinite loop?'));
      }, ms);
      promise.then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
    });
  }

  /** JSON test data → typed Java source literals. JSON cannot say int[] vs long[] or
   *  char[][] vs String[][], which is why exercises may declare `javaTypes`.
   *  jChar: one character as a Java char literal, escaping the two that need it. */
  function jChar(c) {
    const s = String(c);
    return "'" + (s === "'" ? "\\'" : s === '\\' ? '\\\\' : s) + "'";
  }
  /** Value → Java literal of `type`. Arrays recurse with `nested` so only the outermost
   *  level gets the `new T[]` prefix; a string for a char[] type is split per char. An
   *  unknown type throws at harness-build time — better than a javac error later. */
  function jLit(type, v, nested) {
    if (v === null || v === undefined) return 'null';
    if (type && type.endsWith('[]')) {
      const inner = type.slice(0, -2);
      const items = (inner === 'char' && typeof v === 'string')
        ? v.split('').map(jChar)
        : v.map(x => jLit(inner, x, true));
      const body = '{' + items.join(',') + '}';
      return nested ? body : 'new ' + type + body;
    }
    switch (type) {
      case 'int': case 'Integer': return String(v);
      case 'long': return String(v) + 'L';
      case 'double': { const s = String(v); return (s.includes('.') || s.includes('e') || s.includes('E')) ? s : s + '.0'; }
      case 'boolean': return String(v);
      case 'char': return jChar(v);
      case 'String': return JSON.stringify(String(v)); /* JSON escapes are valid Java string escapes */
      default: throw new Error('devhub-codegrade: unsupported javaTypes entry "' + type + '"');
    }
  }
  /** Fallback when an exercise has no `javaTypes`: number → int/double, array → first
   *  non-null element's type + "[]". Anything else is an authoring error, so it throws. */
  function inferJavaType(v) {
    if (typeof v === 'number') return Number.isInteger(v) ? 'int' : 'double';
    if (typeof v === 'string') return 'String';
    if (typeof v === 'boolean') return 'boolean';
    if (Array.isArray(v)) {
      const el = v.find(x => x !== null);
      if (el === undefined) return 'int[]';
      return inferJavaType(el) + '[]';
    }
    throw new Error('devhub-codegrade: cannot infer a Java type — declare javaTypes on this exercise');
  }
  /** One test arg as a Java expression: shaped args become harness builder calls
   *  (buildList/buildTree), everything else a typed literal via jLit(). */
  function javaArgExpr(ex, argIndex, value) {
    const shape = ex.argShapes && ex.argShapes[argIndex];
    if (shape === 'list') return 'buildList(' + jLit('int[]', value) + ')';
    if (shape === 'list-with-cycle') return 'buildListWithCycle(' + jLit('int[]', value.values) + ', ' + value.pos + ')';
    if (shape === 'tree') return 'buildTree(' + jLit('Integer[]', value) + ')';
    const type = (ex.javaTypes && ex.javaTypes[argIndex]) || inferJavaType(value);
    return jLit(type, value);
  }

  /** Generate Harness.java for one exercise: builders for the node shapes, a toJson that
   *  knows every primitive-array type, and a main() that calls `new Solution().<fn>(…)`
   *  per test and prints ONE `@@CG@@{json}` line each — the sentinel runJava() scans
   *  the frame's #console for, so student System.out noise cannot be mistaken for a
   *  result. Exposed on `__test` so tmp_java_verify.mjs runs this exact generator. */
  function buildJavaHarness(ex) {
    const fn = ex.functionName.java;
    const wrap = ex.resultShape === 'list' ? 'listToArray' : ex.resultShape === 'tree' ? 'treeToArray' : '';
    const calls = ex.tests.map(t => {
      const args = t.args.map((a, i) => javaArgExpr(ex, i, a)).join(', ');
      const invoke = 's.' + fn + '(' + args + ')';
      return [
        '        try {',
        '            Object got = ' + (wrap ? wrap + '(' + invoke + ')' : invoke) + ';',
        '            System.out.println("@@CG@@{\\"got\\":" + toJson(got) + "}");',
        '        } catch (Throwable t) {',
        '            System.out.println("@@CG@@{\\"error\\":" + jsonStr(String.valueOf(t)) + "}");',
        '        }'
      ].join('\n');
    }).join('\n');
    return [
      'import java.util.*;',
      '',
      'public class Harness {',
      '    static ListNode buildList(int[] a) {',
      '        ListNode head = null, tail = null;',
      '        for (int v : a) {',
      '            ListNode n = new ListNode(v);',
      '            if (head == null) { head = n; tail = n; } else { tail.next = n; tail = n; }',
      '        }',
      '        return head;',
      '    }',
      '    static ListNode buildListWithCycle(int[] a, int pos) {',
      '        if (a.length == 0) return null;',
      '        ListNode[] nodes = new ListNode[a.length];',
      '        for (int i = 0; i < a.length; i++) nodes[i] = new ListNode(a[i]);',
      '        for (int i = 0; i < a.length - 1; i++) nodes[i].next = nodes[i + 1];',
      '        if (pos >= 0) nodes[a.length - 1].next = nodes[pos];',
      '        return nodes[0];',
      '    }',
      '    static TreeNode buildTree(Integer[] a) {',
      '        if (a.length == 0 || a[0] == null) return null;',
      '        TreeNode root = new TreeNode(a[0]);',
      '        LinkedList<TreeNode> q = new LinkedList<>();',
      '        q.add(root);',
      '        int i = 1;',
      '        while (!q.isEmpty() && i < a.length) {',
      '            TreeNode node = q.poll();',
      '            if (i < a.length) { Integer lv = a[i++]; if (lv != null) { node.left = new TreeNode(lv); q.add(node.left); } }',
      '            if (i < a.length) { Integer rv = a[i++]; if (rv != null) { node.right = new TreeNode(rv); q.add(node.right); } }',
      '        }',
      '        return root;',
      '    }',
      '    static List<Integer> listToArray(Object o) {',
      '        List<Integer> out = new ArrayList<>();',
      '        ListNode n = (ListNode) o;',
      '        int guard = 0;',
      '        while (n != null && guard++ < 100000) { out.add(n.val); n = n.next; }',
      '        return out;',
      '    }',
      '    static List<Object> treeToArray(Object o) {',
      '        List<Object> out = new ArrayList<>();',
      '        TreeNode root = (TreeNode) o;',
      '        if (root == null) return out;',
      '        LinkedList<TreeNode> q = new LinkedList<>();',
      '        q.add(root);',
      '        while (!q.isEmpty()) {',
      '            TreeNode node = q.poll();',
      '            if (node != null) { out.add(node.val); q.add(node.left); q.add(node.right); }',
      '            else out.add(null);',
      '        }',
      '        while (!out.isEmpty() && out.get(out.size() - 1) == null) out.remove(out.size() - 1);',
      '        return out;',
      '    }',
      '    static String jsonStr(String s) {',
      '        StringBuilder b = new StringBuilder("\\"");',
      '        for (int i = 0; i < s.length(); i++) {',
      '            char c = s.charAt(i);',
      '            if (c == \'"\' || c == \'\\\\\') b.append(\'\\\\\').append(c);',
      '            else if (c == \'\\n\') b.append("\\\\n");',
      '            else if (c == \'\\r\') b.append("\\\\r");',
      '            else if (c == \'\\t\') b.append("\\\\t");',
      '            else if (c < 32) b.append(String.format("\\\\u%04x", (int) c));',
      '            else b.append(c);',
      '        }',
      '        return b.append(\'"\').toString();',
      '    }',
      '    static String toJson(Object o) {',
      '        if (o == null) return "null";',
      '        if (o instanceof String) return jsonStr((String) o);',
      '        if (o instanceof Character) return jsonStr(String.valueOf((char) (Character) o));',
      '        if (o instanceof Double || o instanceof Float) {',
      '            double d = ((Number) o).doubleValue();',
      '            if (d == Math.floor(d) && !Double.isInfinite(d) && !Double.isNaN(d)) return String.valueOf((long) d);',
      '            return String.valueOf(d);',
      '        }',
      '        if (o instanceof Number || o instanceof Boolean) return String.valueOf(o);',
      '        if (o instanceof int[]) { int[] a = (int[]) o; StringBuilder b = new StringBuilder("["); for (int i = 0; i < a.length; i++) { if (i > 0) b.append(\',\'); b.append(a[i]); } return b.append(\']\').toString(); }',
      '        if (o instanceof long[]) { long[] a = (long[]) o; StringBuilder b = new StringBuilder("["); for (int i = 0; i < a.length; i++) { if (i > 0) b.append(\',\'); b.append(a[i]); } return b.append(\']\').toString(); }',
      '        if (o instanceof double[]) { double[] a = (double[]) o; StringBuilder b = new StringBuilder("["); for (int i = 0; i < a.length; i++) { if (i > 0) b.append(\',\'); b.append(toJson(a[i])); } return b.append(\']\').toString(); }',
      '        if (o instanceof boolean[]) { boolean[] a = (boolean[]) o; StringBuilder b = new StringBuilder("["); for (int i = 0; i < a.length; i++) { if (i > 0) b.append(\',\'); b.append(a[i]); } return b.append(\']\').toString(); }',
      '        if (o instanceof char[]) return jsonStr(new String((char[]) o));',
      '        if (o instanceof Object[]) { Object[] a = (Object[]) o; StringBuilder b = new StringBuilder("["); for (int i = 0; i < a.length; i++) { if (i > 0) b.append(\',\'); b.append(toJson(a[i])); } return b.append(\']\').toString(); }',
      '        if (o instanceof Iterable) { StringBuilder b = new StringBuilder("["); boolean first = true; for (Object x : (Iterable<?>) o) { if (!first) b.append(\',\'); first = false; b.append(toJson(x)); } return b.append(\']\').toString(); }',
      '        if (o instanceof ListNode) return toJson(listToArray(o));',
      '        if (o instanceof TreeNode) return toJson(treeToArray(o));',
      '        return jsonStr(String.valueOf(o));',
      '    }',
      '    public static void main(String[] args) {',
      '        Solution s = new Solution();',
      calls,
      '    }',
      '}'
    ].join('\n');
  }

  /** the node types user code may reference — provided as their own compilation
   * unit so exercise starters never (re)declare them */
  const JAVA_NODES_SRC = [
    'class ListNode {',
    '    int val;',
    '    ListNode next;',
    '    ListNode() {}',
    '    ListNode(int val) { this.val = val; }',
    '    ListNode(int val, ListNode next) { this.val = val; this.next = next; }',
    '}',
    'class TreeNode {',
    '    int val;',
    '    TreeNode left, right;',
    '    TreeNode() {}',
    '    TreeNode(int val) { this.val = val; }',
    '    TreeNode(int val, TreeNode left, TreeNode right) { this.val = val; this.left = left; this.right = right; }',
    '}'
  ].join('\n');

  /** page-side deep-equal, mirroring the sandbox harness's __eq exactly (see __eq) */
  function deepEq(a, b) {
    if (a === b) return true;
    if (typeof a === 'number' && typeof b === 'number' && Number.isNaN(a) && Number.isNaN(b)) return true;
    if (typeof a !== typeof b || a === null || b === null) return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) if (!deepEq(a[i], b[i])) return false;
      return true;
    }
    if (typeof a === 'object') {
      const ka = Object.keys(a), kb = Object.keys(b);
      if (ka.length !== kb.length) return false;
      for (const k of ka) if (!deepEq(a[k], b[k])) return false;
      return true;
    }
    return false;
  }

  /** Grade Java: write Solution/Nodes/Harness into the JVM frame's virtual FS, run javac
   *  (compile errors come back as the diagnostic text with /str/ paths stripped), then run
   *  Harness and parse the sentinel lines in test order. Three deadlines: 180s boot, 90s
   *  compile, 30s run — each one tears the JVM down on expiry. Java 8 ONLY (the JDK-8
   *  tools.jar) and CheerpJ threads are cooperative; both are runtime facts the exercise
   *  starters were written around. */
  async function runJava(code, ex, status) {
    const frame = await javaDeadline(bootJava(status), 180000, 'downloading/booting the Java runtime');
    const win = frame.contentWindow, doc = frame.contentDocument;
    const consoleEl = doc.getElementById('console');
    const cp = '/str/tools.jar:/files/';
    win.cheerpjAddStringFile('/str/Solution.java', frameBytes(win, code));
    win.cheerpjAddStringFile('/str/Nodes.java', frameBytes(win, JAVA_NODES_SRC));
    win.cheerpjAddStringFile('/str/Harness.java', frameBytes(win, buildJavaHarness(ex)));

    consoleEl.innerHTML = '';
    if (status) status('compiling with javac…');
    const compileExit = await javaDeadline(
      win.cheerpjRunMain('com.sun.tools.javac.Main', cp,
        '/str/Solution.java', '/str/Nodes.java', '/str/Harness.java', '-d', '/files/', '-nowarn'),
      90000, 'compiling');
    if (compileExit !== 0) {
      const diag = consoleEl.innerText.replace(/\/str\//g, '').trim();
      return { error: 'Compile error:\n' + (diag || ('javac exited with code ' + compileExit)) };
    }

    consoleEl.innerHTML = '';
    if (status) status('running on the JVM…');
    const runExit = await javaDeadline(win.cheerpjRunMain('Harness', cp), 30000, 'running your code');
    const text = consoleEl.innerText;
    const lines = text.split('\n').filter(l => l.startsWith('@@CG@@'));
    if (!lines.length) {
      return { error: 'The JVM produced no results' + (runExit !== 0 ? ' (exit code ' + runExit + ')' : '') + (text.trim() ? ':\n' + text.trim() : '.') };
    }
    const results = lines.map((l, i) => {
      let parsed;
      try { parsed = JSON.parse(l.slice(6)); } catch (e) { return { pass: false, error: 'unreadable result from the JVM' }; }
      if ('error' in parsed) return { pass: false, error: parsed.error };
      const t = ex.tests[i];
      let pass;
      if (t && t.unordered && Array.isArray(parsed.got) && Array.isArray(t.expected)) {
        pass = deepEq(parsed.got.slice().sort(), t.expected.slice().sort());
      } else {
        pass = t ? deepEq(parsed.got, t.expected) : false;
      }
      return { pass, got: parsed.got };
    });
    return { results };
  }

  /** Render one exercise: prompt, language tabs, gutter+textarea editor, Run/Reset,
   *  results, hints, and the coach panel. `progress` is the live bank object (mutated and
   *  saved here); `onSolved` lets render() refresh the list and progress bar. Called
   *  afresh on every exercise switch — nothing here survives a switch except what was
   *  persisted. */
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
    /* Monaco upgrade state: null until the CDN load lands (see the upgrade below), and
       while they are null the plain textarea above is still the live editor. */
    let monacoEditor = null, monacoContainer = null;
    /* The ONE indirection point every handler below reads the learner's code through —
       grading, the coach, Reset and the language tabs never learn which backend is live,
       which is what let Monaco land without touching any of them. */
    function getCode() { return monacoEditor ? monacoEditor.getValue() : ta.value; }
    /* The writing half of getCode above. Reset restores the starter through it and the
       language tabs swap in that language's saved buffer. */
    function setCode(v) { if (monacoEditor) monacoEditor.setValue(v); else ta.value = v; }
    const statusEl = h('span', { class: 'cg-status' });
    const runBtn = h('button', { class: 'cg-btn primary' }, '▶ Run Tests');
    const resetBtn = h('button', { class: 'cg-btn ghost' }, 'Reset');
    const resultsEl = h('div', { class: 'cg-results' });
    const hintsWrap = h('div', { class: 'cg-hints' });
    const coachToggle = h('button', { class: 'cg-btn ghost' }, '🧑‍💻 Pair: On');
    const coachMsgs = h('div');
    // The toggle lives in the ALWAYS-visible header, never inside anything that
    // itself gets hidden — a control that can vanish while off is a control
    // nobody can turn back on.
    const coachWrap = h('div', { class: 'cg-coach' },
      h('div', { class: 'cg-coach-head' }, h('span', { class: 'cg-coach-label' }, '🧑‍💻 Pairing with a senior'), coachToggle),
      coachMsgs
    );

    /** Reflect the global Pair preference in the toggle button's label/opacity. */
    function paintCoachToggle() {
      const on = coachEnabled();
      coachToggle.textContent = on ? '🧑‍💻 Pair: On' : '🧑‍💻 Pair: Off';
      coachToggle.classList.toggle('coach-off', !on);
    }
    /** Turn the pair-programming coach on or off. The preference is per-learner and
     *  sitewide (see coachEnabled/setCoachEnabled), not per-exercise, so a learner who
     *  finds it noisy silences it once. Switching it ON re-evaluates immediately rather
     *  than waiting for the next keystroke — otherwise the panel sits empty and looks
     *  broken until you type. */
    coachToggle.onclick = () => {
      setCoachEnabled(!coachEnabled());
      paintCoachToggle();
      if (coachEnabled()) evaluateCoach();
    };

    /** Append one dismissible coach bubble. `tone: 'praise'` swaps the avatar + border. */
    function addCoachMsg(text, tone) {
      coachMsgs.appendChild(h('div', { class: 'cg-coach-msg' + (tone === 'praise' ? ' praise' : '') },
        h('span', { class: 'av' }, tone === 'praise' ? '🎉' : '🧑‍💻'),
        h('span', { class: 'tx' }, text),
        h('button', { class: 'x', type: 'button', 'aria-label': 'Dismiss', onclick: (e) => { e.target.closest('.cg-coach-msg').remove(); } }, '✕')
      ));
    }

    /** Debounce handle: coach evaluation runs 900ms after the LAST keystroke, not on each. */
    let coachTimer = null;
    /** Run every unseen `coach:` entry for the current language against the buffer and
     *  show AT MOST ONE (break after the first hit) — a wall of nudges on one pass reads
     *  as nagging. Skipped entirely on an untouched starter. Each id is recorded in
     *  `coachSeen` before display so it can never repeat, even across reloads. */
    function evaluateCoach() {
      if (!coachEnabled() || !ex.coach || !ex.coach.length) return;
      const code = getCode(), starterCode = ex.starter[lang] || '';
      if (code.trim() === starterCode.trim()) return;
      const seen = (progress[ex.id] && progress[ex.id].coachSeen) || [];
      for (const c of ex.coach) {
        if (seen.indexOf(c.id) !== -1) continue;
        if (c.langs && c.langs.indexOf(lang) === -1) continue;
        if (!matchCoachEntry(c, code, lang, starterCode)) continue;
        addCoachMsg(c.msg, c.tone);
        progress[ex.id] = progress[ex.id] || {};
        progress[ex.id].coachSeen = seen.concat(c.id);
        saveProgress(bank.id, progress);
        break; // one at a time — don't dump a wall of messages on a single pass
      }
    }

    /** Renumber the fake gutter to match the textarea's line count. A no-op once Monaco
     *  is live: it renders a real gutter, and the fake one is no longer in the document. */
    function refreshGutter() {
      if (monacoEditor) return;
      const n = ta.value.split('\n').length;
      let g = ''; for (let i = 1; i <= n; i++) g += i + (i < n ? '\n' : '');
      gutter.textContent = g || '1';
    }
    /** Switch the editor to language `l`: restore the saved buffer (or the starter), the
     *  signature line, the active tab, and the "solved previously" status. `ex.__lastLang`
     *  is a transient in-memory note so re-selecting the exercise keeps the tab. */
    function loadLang(l) {
      lang = l; ex.__lastLang = l;
      sigEl.textContent = ex.signature[l] || '';
      setCode(stored[l] || ex.starter[l] || '');
      /* Monaco keeps syntax rules per MODEL, not per editor, so switching tabs has to
         retag the model — otherwise the Python buffer keeps being highlighted as Java. */
      if (monacoEditor) global.monaco.editor.setModelLanguage(monacoEditor.getModel(), MONACO_LANG[l] || 'plaintext');
      refreshGutter();
      tabsEl.querySelectorAll('.cg-tab').forEach(b => b.classList.toggle('on', b.dataset.lang === l));
      const solved = progress[ex.id] && progress[ex.id].solved;
      statusEl.textContent = solved ? '✓ solved previously' : '';
    }
    langs.forEach(l => {
      const label = l === 'javascript' ? 'JavaScript' : l === 'typescript' ? 'TypeScript' : l === 'python' ? 'Python' : l === 'java' ? 'Java' : l;
      tabsEl.appendChild(h('button', { class: 'cg-tab', 'data-lang': l, onclick: () => loadLang(l) }, label));
    });

    /** One edit — from either backend. Saves the buffer per language and re-arms the
     *  coach's 900ms debounce. */
    function onEdit() {
      refreshGutter();
      stored[lang] = getCode();
      progress[ex.id] = progress[ex.id] || {};
      progress[ex.id].code = stored;
      saveProgress(bank.id, progress);
      clearTimeout(coachTimer);
      coachTimer = setTimeout(evaluateCoach, 900); // same step-pacing the site's animations use
    }
    ta.addEventListener('input', onEdit);
    ta.addEventListener('scroll', () => { gutter.scrollTop = ta.scrollTop; });

    /* Upgrade to Monaco in the background. The textarea above is already fully usable at
       first paint, so nothing waits on this; if the CDN is blocked or the learner is
       offline, loadMonaco resolves false and this exercise stays on the textarea for
       good. Same resilience shape as the TS/Pyodide/CheerpJ runtimes. */
    loadMonaco().then(ok => {
      /* replaceWith is a no-op on a parentless node, which would strand a live editor in
         a detached div — so skip the upgrade entirely rather than half-do it. */
      if (!ok || monacoEditor || !editorWrap.parentNode) return;
      const hadFocus = document.activeElement === ta;
      const code = getCode();
      monacoContainer = h('div', { class: 'cg-monaco' });
      editorWrap.replaceWith(monacoContainer);
      monacoEditor = global.monaco.editor.create(monacoContainer, {
        value: code,
        language: MONACO_LANG[lang] || 'plaintext',
        theme: 'dlh-dark',
        automaticLayout: true,
        minimap: { enabled: false },   // the panel is narrow and these are 20-line exercises
        fontSize: 13,
        lineHeight: 20,
        fontFamily: "'Cascadia Code', ui-monospace, Consolas, monospace",
        tabSize: (lang === 'python' || lang === 'java') ? 4 : 2,
        insertSpaces: true,
        scrollBeyondLastLine: false,
        renderLineHighlight: 'line',
        padding: { top: 10, bottom: 10 },
        scrollbar: { alwaysConsumeMouseWheel: false },
      });
      monacoEditor.onDidChangeModelContent(onEdit);
      monacoEditor.addCommand(global.monaco.KeyMod.CtrlCmd | global.monaco.KeyCode.Enter, () => runBtn.click());
      if (hadFocus) monacoEditor.focus();
    });
    // Tab indents — but with an escape hatch. Without one this textarea is a
    // keyboard trap: focus lands here and 15 Tab presses later is still here,
    // having typed indentation into the code, with Run and the language tabs
    // unreachable. Esc arms ONE focus-moving Tab (the standard editor pattern);
    // any other key re-arms indentation capture. Textarea path only — once Monaco is
    // live this listener sits on a detached node and Monaco's Ctrl+M is the way out.
    /** Armed by Esc: the NEXT Tab moves focus instead of indenting (see the note below). */
    let tabEscapes = false;
    ta.addEventListener('keydown', e => {
      if (e.key === 'Escape') { tabEscapes = true; return; }
      if (e.key === 'Tab') {
        if (tabEscapes) { tabEscapes = false; return; }   // browser default: focus moves on
        e.preventDefault();
        const unit = (lang === 'python' || lang === 'java') ? '    ' : '  ';
        const s = ta.selectionStart, en = ta.selectionEnd;
        ta.value = ta.value.slice(0, s) + unit + ta.value.slice(en);
        ta.selectionStart = ta.selectionEnd = s + unit.length;
        refreshGutter();
      } else {
        tabEscapes = false;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runBtn.click(); }
    });
    /* Reset is the escape hatch for a learner who has tangled the starter beyond reading.
       It drops the saved buffer as well as the visible text — keeping the buffer would
       restore the tangle on the next language-tab switch — and returns focus to whichever
       editor is live so they can start typing again straight away. */
    resetBtn.onclick = () => {
      setCode(ex.starter[lang] || '');
      delete stored[lang];
      refreshGutter();
      if (monacoEditor) monacoEditor.focus(); else ta.focus();
    };

    /** Grade the current attempt: disable the button (a second click mid-run would race
     *  two runtimes over one results pane), route to the per-language runner, then render
     *  pass/fail per test case. Python and Java report boot progress through statusEl
     *  because their first run downloads 10 MB / 40 MB; TypeScript needs the compiler
     *  loaded before the code can even be transpiled, and an offline load must fail with a
     *  message rather than silently doing nothing. */
    runBtn.onclick = async () => {
      runBtn.disabled = true;
      resultsEl.innerHTML = '';
      statusEl.textContent = lang === 'python' ? 'booting CPython (first run downloads ~10 MB)…' : 'compiling & running…';
      let outcome;
      try {
        if (lang === 'python') {
          outcome = await runPython(getCode(), ex.functionName.python, ex.tests, ex.argShapes, ex.resultShape);
        } else if (lang === 'java') {
          outcome = await runJava(getCode(), ex, msg => { statusEl.textContent = msg; });
        } else {
          let code = getCode(), fnName = ex.functionName[lang];
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
        const priorFails = progress[ex.id].fails || 0;
        const firstSolve = !progress[ex.id].solved;
        progress[ex.id].solved = true;
        progress[ex.id].code = stored;
        saveProgress(bank.id, progress);
        if (global.DevHubStreak) global.DevHubStreak.touch();
        if (coachEnabled() && firstSolve) {
          if (priorFails >= 3) addCoachMsg('That one fought back and you got it anyway — nice work sticking with it.', 'praise');
          else if (priorFails === 0) addCoachMsg('Clean solve, first try.', 'praise');
        }
        if (onSolved) onSolved();
      } else {
        progress[ex.id] = progress[ex.id] || {};
        progress[ex.id].fails = (progress[ex.id].fails || 0) + 1;
        saveProgress(bank.id, progress);
        if (coachEnabled() && STUCK_THRESHOLDS.indexOf(progress[ex.id].fails) !== -1) {
          addCoachMsg(STUCK_MESSAGES[STUCK_THRESHOLDS.indexOf(progress[ex.id].fails) % STUCK_MESSAGES.length]);
        }
      }
    };

    if (ex.hints && ex.hints.length) {
      let shown = 0;
      const hintBtn = h('button', { class: 'cg-btn ghost' }, '💡 Show a hint (' + ex.hints.length + ')');
      const hintList = h('div');
      /** Reveal hints one at a time, never all at once — a learner who dumps every hint has
       *  skipped the struggle that makes the exercise work. The button re-labels with the
       *  remaining count and disables itself on the last one. */
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
    /* Both escape hatches are named because either editor may be the live one: Esc-then-Tab
       is the textarea's, Ctrl+M is Monaco's own toggleTabFocusMode. A Tab-capturing editor
       with no way out is a keyboard trap. */
    panel.appendChild(h('div', { class: 'cg-keytab' }, 'Tab inserts indentation · Esc then Tab (or Ctrl+M) moves focus out · Ctrl/⌘ + Enter runs the tests'));
    panel.appendChild(h('div', { class: 'cg-toolbar' }, runBtn, resetBtn, statusEl));
    panel.appendChild(resultsEl);
    panel.appendChild(hintsWrap);
    panel.appendChild(coachWrap); // always mounted: generic stuck/praise nudges fire with no per-exercise authoring

    root.innerHTML = '';
    root.appendChild(panel);
    paintCoachToggle();
    loadLang(lang);
    // No ta.focus() here: stealing focus into a Tab-capturing editor on render
    // meant anyone Tabbing through the page fell straight into the trap. Focus
    // stays where the user had it; the Reset button still focuses deliberately.
  }

  /** Main entry point — `DevHubCodeGrade.render(rootEl, bank)`. Injects styles, loads
   *  the bank's progress, and builds the header/progress bar + the two-column layout
   *  (exercise list | exercise panel), then selects the first exercise. */
  function render(root, bank) {
    injectStyles();
    const progress = loadProgress(bank.id);
    root.innerHTML = '';
    root.className = 'cg';

    const progBar = h('div', { class: 'cg-prog-bar' }, h('i'));
    const progTxt = h('span', { class: 'cg-prog-txt' });
    /** Recompute the "n / total solved" bar from the progress object. */
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
    /** Make `ex` current: highlight it in the list and (re)render its panel. */
    function selectExercise(ex) {
      current = ex;
      list.querySelectorAll('.cg-item').forEach(it => it.classList.toggle('on', it.dataset.id === ex.id));
      renderExercise(exPanel, bank, ex, progress, () => { refreshProgress(); renderList(); });
    }
    /** Rebuild the sticky exercise list with solved dots and the active highlight. */
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

  global.DevHubCodeGrade = {
    render: render,
    /** exposed for the offline verification scripts (tmp_java_verify.mjs) so they
     * exercise the REAL harness generator, not a drift-prone copy */
    __test: { buildJavaHarness: buildJavaHarness, JAVA_NODES_SRC: JAVA_NODES_SRC, deepEq: deepEq }
  };
})(window);
