/* ============================================================================
 * devhub-transitions.js — sitewide click/tap feedback + page-to-page fade.
 *
 * DevHub is a plain multi-page site (every visualizer is its own .html file,
 * reached via <a href>, not a client-side router) — see app.html's TRACKS
 * hub, which loads pages into an iframe instead. That split matters here:
 *
 *   1. Press pulse — on pointerdown, the nearest button/tab/clickable-card
 *      fires an accent-colored ring that expands outward from the control's
 *      own outline (an animated box-shadow, so it follows the element's exact
 *      border-radius — it can never misalign, overflow, or affect layout,
 *      which is how the old fill-ripple went wrong twice). Runs everywhere,
 *      including inside app.html's iframe, since it never touches navigation.
 *
 *   2. Page fade-out on navigate-away — intercepts a plain click on a real
 *      <a href> that points at another DevHub page, plays a short fade
 *      (.dh-leaving on <html>, animated in devhub.css), then navigates.
 *      Deliberately narrow: skips modifier-key clicks (new tab), target=_blank,
 *      download links, hash-only same-page anchors, and any other origin —
 *      those should behave exactly as an unmodified browser would.
 *
 *      Also skips entirely when window.top !== window.self — i.e. when this
 *      page is loaded inside app.html's #viewer iframe. Several pages post a
 *      `dlh-navigate` message to the parent hub instead of following the
 *      href directly in that case (grep `dlh-navigate` in this repo); this
 *      script must never race that existing, working pattern.
 *
 *   3. Live-region wiring for the step inspector — every .rt-inspect panel
 *      (437 pages) gets role="status", so the per-step payload the engines
 *      write there is announced to screen readers instead of updating in
 *      silence. Lives here because this is the one script effectively every
 *      page loads, and the fix must not require per-page edits.
 *
 *   4. window.DevHubStreak — app.html owns dlh_streak_v1 and its own
 *      touchStreak()/getStreak(), but only calls touch() from setStatus()
 *      (first visit or Mark as Learned), so a day spent purely re-drilling a
 *      quiz or flashcard deck never counts. Those engines run inside this
 *      page (standalone or in app.html's #viewer iframe), a different JS
 *      realm from app.html's window — but same origin, so localStorage is
 *      shared either way. This is that engine's writer: same key, same
 *      day/streak algorithm as app.html's copy (kept in sync by hand — it is
 *      five lines). Call DevHubStreak.touch() from any place a learner just
 *      demonstrably showed up: quiz finish(), flashcard rate(), an hf-check
 *      answer, a passing codegrade run.
 *
 * USAGE: <link rel="stylesheet" href="devhub.css">  (ripple/fade keyframes)
 *        <script src="devhub-transitions.js"></script>
 *
 * Features 1-2 individually no-op under prefers-reduced-motion; feature 3 is
 * not motion and applies always.
 *
 * WHO LOADS IT: 536 of the 537 pages — effectively every page, which is why
 * feature 3 lives here. It assumes nothing about the page: no devhub.css, no
 * data-hf, no particular markup — and it depends on no other engine.
 *
 * SELF-CONTAINED CSS (standing engine rule): the press-pulse keyframes are
 * injected in an id-guarded <style id="dh-press-css"> rather than assumed
 * from devhub.css, because 14 index/landing pages load this script without
 * that stylesheet. The giant-ripple layout bug was exactly an engine that
 * assumed the stylesheet was there. The fade keyframes (.dh-leaving) ARE in
 * devhub.css only — acceptable because a missing fade is invisible, while a
 * missing pulse style used to leave an unstyled span in the document flow.
 *
 * PERSISTS: localStorage dlh_streak_v1 ({lastDate, count}), via DevHubStreak.
 *
 * WHO DEPENDS ON IT: window.DevHubStreak is read (optionally — every caller
 * guards on its existence) by devhub-codegrade.js (a passing run),
 * devhub-flashcards.js (a rating), devhub-hf-check.js (an answer) and
 * devhub-quiz.js (a finished attempt). Because of that, this script must be
 * loaded on any page that carries one of those engines, or their activity
 * silently stops counting toward the streak. tmp_vcheck.mjs's required-
 * scripts check is what enforces its presence.
 * ========================================================================== */
(function (global, doc) {
  'use strict';

  /**
   * OS-level "reduce motion". Gates features 1 and 2 entirely; feature 3 (an ARIA
   * attribute) and 4 (storage) are not motion and ignore it.
   */
  var reduceMotion = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── 1. Press pulse ────────────────────────────────────────────────────────
  // An accent ring that blooms outward from the control's own outline. It is
  // a pure box-shadow animation on the element itself: no injected child, no
  // positioning math, no overflow clipping — the three things the old
  // fill-ripple needed and twice got wrong (unstyled in-flow span on pages
  // without devhub.css; unclipped blob on .tc-dot). box-shadow follows the
  // element's exact border-radius, so pills, circles, and cards all pulse in
  // their own shape.
  if (!reduceMotion) {
    /**
     * What counts as a pressable control. Add a class here, not a per-page handler,
     * when a new kind of clickable card appears — the pulse must look the same sitewide.
     */
    var PRESS_SELECTOR = 'button, .tab, [role="button"], .page-link, .track-card, .tc-dot, a.card';

    // Critical CSS ships here, not (only) in devhub.css — some pages (the
    // track index/landing pages) load this script without that stylesheet.
    if (!doc.getElementById('dh-press-css')) {
      var pressCss = doc.createElement('style');
      pressCss.id = 'dh-press-css';
      pressCss.textContent =
        '.dh-press{animation:dhPress .42s cubic-bezier(.22,.61,.36,1)}' +
        '@keyframes dhPress{' +
        '0%{box-shadow:0 0 0 0 rgba(167,139,250,.55)}' + // fallback if color-mix unsupported
        '0.1%{box-shadow:0 0 0 0 color-mix(in srgb, var(--accent, #a78bfa) 60%, transparent)}' +
        '100%{box-shadow:0 0 0 12px transparent}}';
      (doc.head || doc.documentElement).appendChild(pressCss);
    }

    doc.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return; // left/primary press only
      var el = e.target.closest && e.target.closest(PRESS_SELECTOR);
      if (!el || el.disabled) return;
      // Restart the animation cleanly on rapid re-presses.
      el.classList.remove('dh-press');
      void el.offsetWidth; // force reflow so the animation restarts
      el.classList.add('dh-press');
      el.addEventListener('animationend', function h(ev) {
        if (ev.animationName === 'dhPress') { el.classList.remove('dh-press'); el.removeEventListener('animationend', h); }
      });
    }, { passive: true });
  }

  // ── 2. Page-to-page fade ──────────────────────────────────────────────────
  if (!reduceMotion && global.top === global.self) {
    /**
     * Fade length before the real navigation fires; must match .dh-leaving's
     * transition in devhub.css or the page jumps mid-fade.
     */
    var FADE_MS = 220;

    doc.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // let "open in new tab" alone

      var a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      if (a.target && a.target !== '' && a.target !== '_self') return;
      if (a.hasAttribute('download')) return;

      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#') return; // same-page anchor
      if (/^(mailto:|tel:|javascript:)/i.test(href)) return;

      var dest;
      try { dest = new URL(href, doc.baseURI); } catch (err) { return; }
      if (dest.origin !== global.location.origin) return; // external link — leave untouched

      // Same-page navigation to a different hash on the current file is just
      // an anchor jump; let the browser handle it natively.
      if (dest.pathname === global.location.pathname && dest.hash) return;

      e.preventDefault();
      doc.documentElement.classList.add('dh-leaving');
      setTimeout(function () { global.location.href = dest.href; }, FADE_MS);
    });

    // If the page is restored from the back/forward cache mid-fade (e.g. the
    // user hit Back before the timeout fired), drop the leftover class so it
    // doesn't render as permanently faded.
    global.addEventListener('pageshow', function (e) {
      if (e.persisted) doc.documentElement.classList.remove('dh-leaving');
    });
  }

  // ── 3. The live inspector announces its per-step data ────────────────────
  // The engines rewrite .rt-inspect every step with the real payload — the
  // HttpRequest, the JWT claims, the bound SQL parameter. Visually that is
  // the whole point of the site; to a screen reader it was silence (437
  // pages, zero live regions). role="status" implies polite+atomic; the
  // explicit aria-live doubles as a belt for older pairings. Skipped if a
  // page already chose its own role. This script runs at the end of <body>,
  // after every static inspector exists.
  var inspectors = doc.querySelectorAll('.rt-inspect');
  for (var i = 0; i < inspectors.length; i++) {
    if (!inspectors[i].hasAttribute('role')) {
      inspectors[i].setAttribute('role', 'status');
      inspectors[i].setAttribute('aria-live', 'polite');
    }
  }

  // ── 4. Cross-page streak writer ───────────────────────────────────────────
  // Deliberately duplicated, not shared via a function call into app.html:
  // this script runs standalone too (a lesson opened outside the hub iframe
  // has no app.html window to call into). Must stay algorithmically identical
  // to app.html's touchStreak() — same key, same "today/yesterday" logic.
  /** Same key app.html writes. CODE-MAP §4 lists both owners. */
  var STREAK_KEY = 'dlh_streak_v1';
  /**
   * Records "the learner showed up today" and returns the new streak length (null
   * if storage is unavailable). Idempotent within a day; a gap of more than one day
   * resets to 1. Exposed as DevHubStreak.touch() — the ONLY public API of this file.
   */
  function touchStreak() {
    try {
      var today = new Date().toISOString().slice(0, 10);
      var s; try { s = JSON.parse(global.localStorage.getItem(STREAK_KEY)) || { lastDate: null, count: 0 }; } catch (e) { s = { lastDate: null, count: 0 }; }
      if (s.lastDate === today) return s.count;
      var yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      var count = s.lastDate === yesterday ? s.count + 1 : 1;
      global.localStorage.setItem(STREAK_KEY, JSON.stringify({ lastDate: today, count: count }));
      return count;
    } catch (e) { return null; }
  }
  global.DevHubStreak = { touch: touchStreak };
})(window, document);
