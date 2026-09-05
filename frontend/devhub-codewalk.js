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
   --------------------------------------------------------------------------- */
(function () {
  'use strict';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Single-pass, multi-language highlighter (TS/JS/Java/Python/SQL-ish). One
  // ordered regex scan: a comment/string match consumes its whole region, so
  // keywords/numbers inside it are never separately colored. No placeholders,
  // no special sentinel bytes - the output is plain text.
  var KW = 'abstract|class|interface|enum|extends|implements|public|private|protected|static|final|void|return|new|if|else|elif|for|while|switch|case|break|continue|default|this|super|import|export|from|const|let|var|function|async|await|try|catch|finally|throw|throws|typeof|instanceof|of|in|yield|def|lambda|with|as|pass|record|sealed|permits|val|fun|package|namespace|type|readonly|select|where|group|order|by';
  var LIT = 'true|false|null|undefined|None|True|False|nil|self';
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

    var cur = -1, playing = false, timer = null;

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

    function go(n) { cur = Math.max(0, Math.min(steps.length - 1, n)); render(); }
    function next() { if (cur < steps.length - 1) go(cur + 1); else stop(); }
    function prev() { go(cur - 1); }
    function setPlayLabel() { btnPlay.innerHTML = playing ? '&#10073;&#10073; Pause' : '&#9654; Play'; btnPlay.classList.toggle('play', !playing); }
    function stop() { playing = false; clearTimeout(timer); setPlayLabel(); }
    function tick() { next(); if (cur >= steps.length - 1) { stop(); return; } timer = setTimeout(tick, interval); }
    function play() {
      if (playing) { stop(); return; }
      if (cur >= steps.length - 1) cur = -1;
      playing = true; setPlayLabel(); tick();
    }
    function reset() { stop(); cur = -1; render(); }
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
