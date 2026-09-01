/* ============================================================================
 * devhub-lesson.js — the two interactive lesson components from Bobby's
 * 2026-09-01 cream reference mockup that devhub-hf.css doesn't already cover.
 *
 * WHY THIS EXISTS (and why it is NOT a framework): Bobby asked whether DevHub
 * should migrate to React/Angular for centralized, component-like structure.
 * With 513 self-contained pages (each its own .html, loadable standalone AND
 * inside app.html's iframe), a framework port would be a multi-week rewrite
 * that breaks the site's core property — every lesson is one file that runs
 * anywhere. The site already has the benefit the framework would buy:
 * declarative markup upgraded by shared engines (devhub-hf.css components,
 * devhub-hf-check.js quick checks, devhub-chapters.js rail, this file).
 * Change a component once here → every lesson using it updates.
 *
 * WHAT'S DELIBERATELY NOT HERE: inline quizzes (that's .hf-check /
 * devhub-hf-check.js), reveal buttons as a style (.hf-reveal in devhub-hf.css),
 * the Template-Method skeleton (.hf-steps — note that class name is TAKEN by
 * devhub-hf.css's diagram; this file uses .hf-walk to avoid the collision).
 *
 * COMPONENTS:
 *
 *   1. Terminal walkthrough — the mockup's numbered "Find every huge log file"
 *      walk: each step is a prose beat + a command, and the OUTPUT is hidden
 *      behind a "Reveal output" button (predict-first active recall):
 *        <div class="hf-walk">
 *          <div class="hf-walk-step">
 *            <h6>Where am I?</h6>
 *            <p>…why this step…</p>
 *            <pre data-nohl>$ pwd</pre>
 *            <pre class="hf-walk-out" data-nohl>/home/bobby</pre>  ← hidden
 *          </div>…
 *        </div>
 *
 *   2. Command anatomy — the mockup's clickable [ls] [-la] [/var/log] strip:
 *        <div class="hf-anatomy">
 *          <button class="tok on" data-part="cmd">ls</button>
 *          <button class="tok" data-part="flags">-la</button>
 *          <div class="hf-anatomy-info" data-part="cmd"><b>command</b><p>…</p></div>
 *          <div class="hf-anatomy-info" data-part="flags" hidden><b>flags</b><p>…</p></div>
 *        </div>
 *
 * SELF-CONTAINED: injects its own critical CSS (id-guarded) with --hf-* token
 * fallbacks, per the standing engine rule. Works in both the espresso and
 * cream colorways because every colour is a token reference.
 *
 * USAGE: <script src="devhub-lesson.js"></script>   (before </body>)
 * API:   DevHubLesson.apply(rootEl?)  → re-scan for late-added components
 * ========================================================================== */
(function (global, doc) {
  'use strict';

  if (!doc.getElementById('dh-lesson-css')) {
    var st = doc.createElement('style');
    st.id = 'dh-lesson-css';
    st.textContent =
      /* — terminal walkthrough — */
      '.hf-walk{margin:18px 0;position:relative}' +
      '.hf-walk-step{position:relative;padding:0 0 26px 50px}' +
      '.hf-walk-step::before{content:"";position:absolute;left:16px;top:36px;bottom:0;width:2px;' +
        'background:var(--hf-line,rgba(148,163,184,.25))}' +
      '.hf-walk-step:last-child::before{display:none}' +
      '.hf-walk-num{position:absolute;left:0;top:0;width:34px;height:34px;border-radius:50%;' +
        'display:flex;align-items:center;justify-content:center;' +
        'background:var(--hf-orange,var(--accent,#e8734a));color:#fff;' +
        'font-size:14.5px;font-weight:800}' +
      '.hf-walk-step h6{margin:6px 0 6px;font-size:16px;font-weight:700;' +
        'color:var(--hf-ink,var(--text,#e2e8f0))}' +
      '.hf-walk-step p{margin:0 0 4px;font-size:14px;line-height:1.6;' +
        'color:var(--hf-ink2,var(--muted,#94a3b8));max-width:74ch}' +
      '.hf-walk-step pre{margin-top:10px}' +
      '.hf-walk-out{display:none}' +
      '.hf-walk-out.shown{display:block;animation:hfWalkIn .35s ease}' +
      '@keyframes hfWalkIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}' +
      '@media (prefers-reduced-motion:reduce){.hf-walk-out.shown{animation:none}}' +
      /* the reveal button reuses the kit's gold .hf-reveal look but must work
         without devhub-hf.css too, so restate the essentials with fallbacks */
      '.hf-walk .hf-reveal{margin-top:10px;background:var(--hf-gold,#d9b64e);color:#221a09;' +
        'border:none;border-radius:12px;font-weight:700;font-size:13.5px;padding:10px 18px;' +
        'cursor:pointer;font-family:inherit}' +
      /* — command anatomy — */
      '.hf-anatomy{margin:14px 0}' +
      '.hf-anatomy .tok{font-family:ui-monospace,Menlo,monospace;font-size:15px;font-weight:700;' +
        'background:var(--hf-card,var(--panel,#241d18));color:var(--hf-ink,var(--text,#e2e8f0));' +
        'border:none;box-shadow:inset 0 0 0 1px var(--hf-line,rgba(148,163,184,.25));' +
        'border-radius:12px;padding:11px 18px;margin:0 10px 12px 0;cursor:pointer;' +
        'transition:transform .12s ease}' +
      '.hf-anatomy .tok:hover{transform:translateY(-1px)}' +
      '.hf-anatomy .tok.on{background:var(--hf-orange,var(--accent,#e8734a));color:#fff;box-shadow:none}' +
      '.hf-anatomy-info{background:var(--hf-card2,var(--panel2,#2b231c));border-radius:14px;' +
        'padding:14px 18px;max-width:88ch}' +
      '.hf-anatomy-info b{display:block;font-size:11px;font-weight:800;text-transform:uppercase;' +
        'letter-spacing:.11em;color:var(--hf-orange,var(--accent,#e8734a));margin:0 0 4px}' +
      '.hf-anatomy-info p{margin:0;font-size:14px;line-height:1.6;' +
        'color:var(--hf-ink,var(--text,#e2e8f0))}' +
      '@media (prefers-reduced-motion:reduce){.hf-anatomy .tok{transition:none}}';
    (doc.head || doc.documentElement).appendChild(st);
  }

  /* ---------- 1. terminal walkthrough ------------------------------------ */
  function wireWalk(w) {
    if (w.hasAttribute('data-hfwalk-done')) return;
    w.setAttribute('data-hfwalk-done', '');
    var steps = w.querySelectorAll('.hf-walk-step');
    for (var i = 0; i < steps.length; i++) {
      var s = steps[i];
      var num = doc.createElement('span');
      num.className = 'hf-walk-num';
      num.textContent = String(i + 1);
      s.insertBefore(num, s.firstChild);
      var out = s.querySelector('.hf-walk-out');
      if (out) {
        var btn = doc.createElement('button');
        btn.type = 'button';
        btn.className = 'hf-reveal';
        btn.textContent = '▶ Reveal output';
        out.parentNode.insertBefore(btn, out);
        (function (btn, out) {
          btn.addEventListener('click', function () {
            out.classList.add('shown');
            btn.remove();
          });
        })(btn, out);
      }
    }
  }

  /* ---------- 2. command anatomy ----------------------------------------- */
  function wireAnatomy(a) {
    if (a.hasAttribute('data-hfanat-done')) return;
    a.setAttribute('data-hfanat-done', '');
    var toks = a.querySelectorAll('.tok');
    var infos = a.querySelectorAll('.hf-anatomy-info');
    function show(part) {
      for (var i = 0; i < toks.length; i++) toks[i].classList.toggle('on', toks[i].dataset.part === part);
      for (var j = 0; j < infos.length; j++) infos[j].hidden = infos[j].dataset.part !== part;
    }
    for (var i = 0; i < toks.length; i++) {
      (function (t) {
        t.addEventListener('click', function () { show(t.dataset.part); });
      })(toks[i]);
    }
  }

  /* ---------- boot -------------------------------------------------------- */
  function apply(root) {
    var r = root || doc, i, els;
    els = r.querySelectorAll('.hf-walk');    for (i = 0; i < els.length; i++) wireWalk(els[i]);
    els = r.querySelectorAll('.hf-anatomy'); for (i = 0; i < els.length; i++) wireAnatomy(els[i]);
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', function () { apply(); });
  } else {
    apply();
  }

  global.DevHubLesson = { apply: apply };
})(window, document);
