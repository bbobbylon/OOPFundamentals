/* ============================================================================
 * devhub-hf-theme.js — the dark ⇄ cream switch for the Head First kit.
 *
 * ONE THEME SYSTEM, NOT TWO. app.html already owns a theme: it stores
 * `devhub-theme` ('dark' | 'light'), applies it before first paint, and —
 * importantly — PUSHES it into the lesson iframe it renders pages in
 * (app.html toggleTheme(), which sets viewer.contentDocument's data-theme).
 *
 * An independent switch with its own storage key would fight that: opening a
 * lesson would silently clear the hub's preference, and viewing a lesson
 * through the hub would show two toggles disagreeing with each other. So this
 * script deliberately reuses the SAME key and the same attribute, and only
 * adds one value:
 *
 *     dark   → the espresso kit  (default; what the hub already means by dark)
 *     cream  → the cream kit
 *     light  → treated AS cream on kit pages
 *
 * That last mapping matters. devhub.css's `light` is a cool blue-grey built
 * for the old design; under the Head First kit it reads as a different site.
 * A kit page therefore renders the hub's "light" as the kit's cream, so the
 * hub's existing button keeps working and stays visually coherent.
 *
 * The floating button HIDES ITSELF inside an iframe, because there the hub's
 * own header control is the one in charge.
 *
 * USAGE: <script src="devhub-hf-theme.js"></script> once per kit page.
 * ========================================================================== */
(function () {
  'use strict';

  var KEY = 'devhub-theme';             // shared with app.html — do not fork
  var root = document.documentElement;
  var embedded = (function () {
    try { return window.top !== window.self; } catch (e) { return true; }
  })();

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  // 'light' is the hub's word for "not dark"; on a kit page that means cream.
  function normalise(v) { return (v === 'cream' || v === 'light') ? 'cream' : 'dark'; }

  function apply(v) { root.setAttribute('data-theme', normalise(v)); }

  apply(stored());

  /* The hub sets data-theme on this document directly when its own button is
     pressed. Watch for that and re-normalise, so 'light' from the hub becomes
     cream here instead of falling through to devhub.css's blue-grey. */
  if (window.MutationObserver) {
    new MutationObserver(function (recs) {
      for (var i = 0; i < recs.length; i++) {
        var v = root.getAttribute('data-theme');
        if (v !== normalise(v)) { apply(v); return; }
      }
    }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  }

  function build() {
    if (!root.hasAttribute('data-hf')) return;      // not a kit page
    if (embedded) return;                           // the hub's control governs
    if (document.querySelector('.hf-themebtn')) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hf-themebtn';

    function paint() {
      var cream = root.getAttribute('data-theme') === 'cream';
      btn.textContent = cream ? '☾ Dark' : '☀ Cream';
      btn.setAttribute('aria-label', cream ? 'Switch to the dark theme' : 'Switch to the cream theme');
    }

    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'cream' ? 'dark' : 'cream';
      apply(next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
      paint();
    });

    paint();
    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
