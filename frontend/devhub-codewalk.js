/* ---------------------------------------------------------------------------
   DevHub - Code Walkthrough widget
   A reusable "step through code line-by-line with a live state panel" component.

   Usage (after <link rel="stylesheet" href="devhub.css">):
     <div id="cw-demo"></div>
     <script src="devhub-codewalk.js"></script>
     <script>
       DevHubCodeWalk.mount('#cw-demo', {
         title: 'BankAccount.java',
         code: [ 'line 0', 'line 1' ],               // array of source lines (plain text)
         intervalMs: 1700,                            // autoplay speed (optional)
         steps: [
           { line: 0,            note: 'what this line does (HTML ok)',
             vars: { balance: 100 },                  // labeled boxes; changed ones pulse
             out: 'console / return value (optional)',
             callout: 'a gotcha or key point (optional, HTML ok)', tone: 'ok',
             vis: '<custom html> (optional)' },
           { line: [3,5] }                            // a range highlights multiple lines
         ]
       });
     </script>

   No dependencies, no build. Each page provides only data; this file owns the
   rendering, line highlighting, play/step controls, and the variable-diff pulse.

   THE CONTRACT THAT COST A 242-MOUNT REPAIR SWEEP — read before authoring:

     `line:` and `lines:` are ZERO-BASED raw indices into `code`.
     The invariant is  0 <= v < code.length,  NOT  1 <= v <= code.length.

   The gutter prints idx+1, so what a reader SEES as "line 7" is `line: 6`.
   Author them 1-based and every step highlights one line too low and the last
   step falls off the end — and nothing throws: the page is valid, the widget
   renders, the counter advances over the wrong line. Sixty-nine pages once
   shipped carrying the identical pasted plan `1-7 9-14 16-20 22-26 28-32`,
   five steps sized for a 32-line layout none of them had, because a cloned
   mount's `lines:` arrays are NOT part of the skeleton: write the `code:`
   array FIRST, then index it. `node frontend/tmp_cwlines.mjs` checks the range
   invariant and the 1-based signature; it cannot see a note that points at the
   wrong-but-in-range line. When a step teaches something the code never shows,
   append to `code` — never repoint the note at unrelated lines.

   TWO STEP SHAPES that are NOT interchangeable (see linesForStep):
     line:  7          one line
     line:  [4, 9]     a RANGE, 4..9 inclusive (always exactly 2 elements)
     lines: [2,5,9,11] an explicit LIST — any length, never a range

   WHO LOADS IT. 474 lesson pages, each with one or more inline
   `DevHubCodeWalk.mount(...)` calls placed right after this <script>. It is
   independent of every other engine and of script order; only the mount
   target must exist in the DOM when mount() runs (pages call it inline below
   the target, so it does).

   STYLING. This widget does NOT inject its own CSS. The `.cw-*` rules live in
   devhub.css, so a page must link devhub.css or the walk renders unstyled. (The
   self-contained rule that the newer engines follow has not been applied here
   yet — every page that mounts a CodeWalk already links devhub.css.)

   PERSISTENCE. None. Position resets on every load, by design.

   GATES THAT READ THE MOUNTS. tmp_cwlines.mjs (index range), tmp_codecheck.mjs
   (compiles TS/Java `code:` arrays for real), tmp_assetcheck.mjs (counts mounts
   so a bulk edit that drops one fails), tmp_hfaudit.mjs (a mount counts toward
   the "explain" dimension of the teaching bar).

   EXPORTS. `mount` (used everywhere) and `highlight` (exported for reuse, but as
   of 2026-09-08 no page or engine calls it — devhub-syntax.js has its own
   colouriser for static <pre> blocks; this one is the CodeWalk's).
   --------------------------------------------------------------------------- */
(function () {
  'use strict';

  /**
   * HTML-escape a source line before it goes into innerHTML. Every code line
   * passes through here before hl() adds spans, so the spans are the ONLY
   * markup in the rendered code — an author's `<T>` or `&&` stays literal.
   */
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Single-pass, multi-language highlighter (TS/JS/Java/Python/SQL-ish). One
  // ordered regex scan: a comment/string match consumes its whole region, so
  // keywords/numbers inside it are never separately colored. No placeholders,
  // no special sentinel bytes - the output is plain text.

  /**
   * Keyword vocabulary shared across every language a CodeWalk shows. It is
   * deliberately the UNION (Java + TS + Python + Kotlin + SQL) rather than
   * per-language: a mount never declares its language, and a false keyword hit
   * in prose-like code is cheaper than a plain-white block.
   */
  var KW = 'abstract|class|interface|enum|extends|implements|public|private|protected|static|final|void|return|new|if|else|elif|for|while|switch|case|break|continue|default|this|super|import|export|from|const|let|var|function|async|await|try|catch|finally|throw|throws|typeof|instanceof|of|in|yield|def|lambda|with|as|pass|record|sealed|permits|val|fun|package|namespace|type|readonly|select|where|group|order|by';
  /** Literals coloured like numbers: JS/Java/Python/Ruby spellings of the same ideas. */
  var LIT = 'true|false|null|undefined|None|True|False|nil|self';
  /**
   * The single alternation hl() scans with. ORDER IS THE ALGORITHM: comment
   * before string before keyword means a `//` region swallows the "keywords"
   * inside it in one match, which is why no placeholder pass is needed. Group
   * 8 (identifier followed by `(`) is what colours a call site as a function.
   */
  var RE = new RegExp(
    '(\\/\\/[^\\n]*|#[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)' +          // 1 comment
    '|(\\x22[^\\x22]*\\x22|\\x27[^\\x27]*\\x27|`[^`]*`)' +       // 2 string ("..." / \x27...\x27 / `...`)
    '|(@[A-Za-z_][A-Za-z0-9_]*)' +                               // 3 decorator/annotation
    '|\\b(' + KW + ')\\b' +                                      // 4 keyword
    '|\\b(' + LIT + ')\\b' +                                     // 5 literal
    '|\\b(\\d[\\d_]*\\.?\\d*)\\b' +                              // 6 number
    '|\\b([A-Z][A-Za-z0-9_]*)\\b' +                              // 7 type (Capitalized)
    '|\\b([a-z_$][A-Za-z0-9_$]*)(?=\\s*\\()',                    // 8 function call
    'g');

  /**
   * Colourise one source line: escape it, then wrap each RE match in the span
   * class devhub.css's token palette expects (.cm/.str/.kw/.num/.type/.fn).
   * Called once per line at mount time and never again — the walk toggles
   * classes on the rendered lines, it never re-renders the code.
   */
  function hl(raw) {
    return esc(raw).replace(RE, function (m, cm, str, dec, kw, lit, num, type, fn) {
      if (cm != null)   return '<span class="cm">' + cm + '</span>';
      if (str != null)  return '<span class="str">' + str + '</span>';
      if (dec != null)  return '<span class="fn">' + dec + '</span>';
      if (kw != null)   return '<span class="kw">' + kw + '</span>';
      if (lit != null)  return '<span class="num">' + lit + '</span>';
      if (num != null)  return '<span class="num">' + num + '</span>';
      if (type != null) return '<span class="type">' + type + '</span>';
      if (fn != null)   return '<span class="fn">' + fn + '</span>';
      return m;
    });
  }

  /**
   * The ONE place that turns a step's `line`/`lines` authoring into the list of
   * zero-based indices to highlight. render(), firstStepForLine() and the
   * "seen" (done) tracking all go through it, so the two-shape rule below is
   * enforced exactly once. tmp_cwlines.mjs re-implements this reading to check
   * ranges offline — keep the two in step if the shapes ever change.
   */
  function linesForStep(s) {
    if (!s) return [];

    /* TWO authoring shapes exist across the site and they do NOT mean the same
       thing — reading them the same way is wrong in both directions:

         line:  7          one line
         line:  [4, 9]     a RANGE, 4 through 9 inclusive
         lines: [2,5,9,11] an explicit LIST of lines, not a range

       `lines` was silently ignored until now: this function only ever looked at
       `s.line`, so on every page authoring `lines` the walk highlighted nothing,
       and because the engine dims every non-current line the whole block sat at
       opacity .4 while the step counter advanced over grey text. That is 307 of
       the 465 CodeWalk pages — the majority — and no gate could see it: the
       widget renders, throws nothing, and counts as present.

       The list/range distinction is load-bearing. Measured across the site:
       every `line:[...]` is exactly 2 elements (363/363, so range is right),
       while `lines:[...]` runs 1-13 elements — 545 steps have exactly 5. Reading
       `lines` as a range would highlight 2..5 of [2,5,9,11,14] and drop the
       rest, which looks like it works and quietly teaches the wrong lines. */
    if (s.lines != null) {
      return Array.isArray(s.lines) ? s.lines.slice() : [s.lines];
    }

    if (s.line == null) return [];
    if (Array.isArray(s.line)) {
      var out = [], a = s.line[0], b = s.line[1];
      for (var i = a; i <= b; i++) out.push(i);
      return out;
    }
    return [s.line];
  }

  /**
   * Build one walkthrough into `target` (selector or element) from a page's
   * inline data — the only public entry point. Renders the header/controls,
   * the numbered code column and the state panel, then wires play/step/click.
   * Returns {next, prev, play, reset} so a page could script it, though none
   * do. `data.intervalMs` defaults to 1700 — slower than the site's ~800ms
   * scenario pacing on purpose, because each step carries prose to read.
   */
  function mount(target, data) {
    var root = typeof target === 'string' ? document.querySelector(target) : target;
    if (!root) { console.warn('DevHubCodeWalk: target not found', target); return; }
    var code = data.code || [];
    var steps = data.steps || [];
    var interval = data.intervalMs || 1700;

    root.classList.add('cw');
    root.innerHTML =
      '<div class="cw-head">' +
        '<span class="cw-title">' + esc(data.title || 'example') + '</span>' +
        '<span class="cw-ctl">' +
          '<button class="cw-btn" data-a="prev" title="Previous line">&#9664;</button>' +
          '<button class="cw-btn play" data-a="play">&#9654; Play</button>' +
          '<button class="cw-btn" data-a="next" title="Next line">Step &#9654;</button>' +
          '<button class="cw-btn" data-a="reset" title="Reset">&#8635;</button>' +
          '<span class="cw-counter"></span>' +
        '</span>' +
      '</div>' +
      '<div class="cw-grid">' +
        '<div class="cw-code"></div>' +
        '<div class="cw-panel"></div>' +
      '</div>';

    var codeEl = root.querySelector('.cw-code');
    var panel = root.querySelector('.cw-panel');
    var counter = root.querySelector('.cw-counter');
    var btnPrev = root.querySelector('[data-a="prev"]');
    var btnNext = root.querySelector('[data-a="next"]');
    var btnPlay = root.querySelector('[data-a="play"]');
    var btnReset = root.querySelector('[data-a="reset"]');

    codeEl.innerHTML = code.map(function (ln, idx) {
      return '<div class="cw-line" data-i="' + idx + '">' +
        '<span class="cw-ln">' + (idx + 1) + '</span>' +
        '<span class="cw-src">' + (hl(ln) || '&nbsp;') + '</span></div>';
    }).join('');
    var lineEls = Array.prototype.slice.call(codeEl.querySelectorAll('.cw-line'));

    /* Walk state: `cur` is the step index (-1 = nothing highlighted yet, the
       "press Play" prompt); `timer` is the autoplay handle stop() clears. */
    var cur = -1, playing = false, timer = null;

    /**
     * The right-hand panel for step `s`: note, variable boxes, custom vis,
     * output and callout. `prev` is the previous step so a variable whose
     * value changed since last step gets the `.changed` pulse — the diff is
     * computed by string compare here, not tracked anywhere. NOTE the "Line N"
     * label only reads `s.line`; a step authored with `lines:` prints "Line -"
     * (the highlight itself is still correct, see linesForStep).
     */
    function renderPanel(s, prev) {
      var lbl = s.line == null ? '-' :
        (Array.isArray(s.line) ? (s.line[0] + 1) + '-' + (s.line[1] + 1) : (s.line + 1));
      var html = '<div class="cw-step">Line ' + lbl + ' &middot; step ' + (cur + 1) + ' of ' + steps.length + '</div>';
      if (s.note) html += '<div class="cw-note">' + s.note + '</div>';
      if (s.vars) {
        var pv = (prev && prev.vars) || {};
        html += '<div class="cw-vars">' + Object.keys(s.vars).map(function (k) {
          var changed = String(pv[k]) !== String(s.vars[k]);
          return '<div class="cw-var' + (changed ? ' changed' : '') + '">' +
            '<span class="k">' + esc(k) + '</span>' +
            '<span class="v">' + esc(String(s.vars[k])) + '</span></div>';
        }).join('') + '</div>';
      }
      if (s.vis) html += '<div class="cw-vis">' + s.vis + '</div>';
      if (s.out != null) html += '<div class="cw-out"><span class="lbl">output</span>' + esc(s.out) + '</div>';
      if (s.callout) html += '<div class="cw-callout' + (s.tone ? ' ' + s.tone : '') + '">' + s.callout + '</div>';
      return html;
    }

    /**
     * Repaint everything for the current `cur`: line classes (.cur = this
     * step's lines, .done = lines any earlier step touched, .dim = not yet
     * reached), scroll the first active line into view, refresh the panel and
     * the button enabled-state. Cheap enough to call on every step.
     */
    function render() {
      counter.textContent = (cur + 1) + ' / ' + steps.length;
      var s = steps[cur];
      var active = {}; linesForStep(s).forEach(function (i) { active[i] = 1; });
      var seen = {};
      for (var k = 0; k <= cur; k++) linesForStep(steps[k]).forEach(function (i) { seen[i] = 1; });
      lineEls.forEach(function (el, i) {
        el.classList.toggle('cur', !!active[i]);
        el.classList.toggle('done', !!seen[i] && !active[i]);
        el.classList.toggle('dim', cur >= 0 && !seen[i]);
      });
      var actIdx = Object.keys(active).map(Number);
      if (actIdx.length) { var first = lineEls[Math.min.apply(null, actIdx)]; if (first) first.scrollIntoView({ block: 'nearest' }); }
      if (cur < 0) {
        panel.innerHTML = '<div class="cw-note" style="color:var(--muted)">Press <b>&#9654; Play</b> to watch it run, or <b>Step &#9654;</b> to walk one line at a time. Click any line to jump there.</div>';
      } else {
        panel.innerHTML = renderPanel(s, cur > 0 ? steps[cur - 1] : null);
      }
      btnPrev.disabled = cur <= 0;
      btnNext.disabled = cur >= steps.length - 1;
    }

    /** Jump to step n, clamped into range, and repaint. Every navigation ends here. */
    function go(n) { cur = Math.max(0, Math.min(steps.length - 1, n)); render(); }
    /** Advance one step; past the last step it stops autoplay instead of wrapping. */
    function next() { if (cur < steps.length - 1) go(cur + 1); else stop(); }
    /** Back one step (go() clamps at 0). */
    function prev() { go(cur - 1); }
    /** Keep the Play/Pause button's label and accent class in sync with `playing`. */
    function setPlayLabel() { btnPlay.innerHTML = playing ? '&#10073;&#10073; Pause' : '&#9654; Play'; btnPlay.classList.toggle('play', !playing); }
    /** Halt autoplay. Safe to call when not playing; every manual control calls it first. */
    function stop() { playing = false; clearTimeout(timer); setPlayLabel(); }
    /** One autoplay beat: step, then schedule the next beat unless we just hit the end. */
    function tick() { next(); if (cur >= steps.length - 1) { stop(); return; } timer = setTimeout(tick, interval); }
    /** Play/Pause toggle. Pressing Play on a finished walk restarts from the top. */
    function play() {
      if (playing) { stop(); return; }
      if (cur >= steps.length - 1) cur = -1;
      playing = true; setPlayLabel(); tick();
    }
    /** Back to the untouched state (-1): all lines undimmed, the "press Play" prompt. */
    function reset() { stop(); cur = -1; render(); }
    /**
     * Click-a-line support: the first step whose lines include `li`, or the
     * current step (or 0) when no step teaches that line — so clicking an
     * un-taught line never throws the walk somewhere surprising.
     */
    function firstStepForLine(li) {
      for (var k = 0; k < steps.length; k++) if (linesForStep(steps[k]).indexOf(li) >= 0) return k;
      return cur < 0 ? 0 : cur;
    }

    btnNext.onclick = function () { stop(); next(); };
    btnPrev.onclick = function () { stop(); prev(); };
    btnPlay.onclick = play;
    btnReset.onclick = reset;
    lineEls.forEach(function (el) { el.onclick = function () { stop(); go(firstStepForLine(+el.dataset.i)); }; });

    render();
    return { next: next, prev: prev, play: play, reset: reset };
  }

  window.DevHubCodeWalk = { mount: mount, highlight: hl };
})();
