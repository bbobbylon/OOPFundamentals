/* ============================================================================
 * devhub-transitions.js — sitewide click/tap feedback + page-to-page fade.
 *
 * DevHub is a plain multi-page site (every visualizer is its own .html file,
 * reached via <a href>, not a client-side router) — see app.html's TRACKS
 * hub, which loads pages into an iframe instead. That split matters here:
 *
 *   1. Ripple — on pointerdown, drops a short-lived .dh-ripple span (styled
 *      in devhub.css) at the pointer position on the nearest button/tab/
 *      clickable-card. Runs everywhere, including inside app.html's iframe,
 *      since it never touches navigation.
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
 * USAGE: <link rel="stylesheet" href="devhub.css">  (ripple/fade keyframes)
 *        <script src="devhub-transitions.js"></script>
 *
 * Both features individually no-op under prefers-reduced-motion.
 * ========================================================================== */
(function (global, doc) {
  'use strict';

  var reduceMotion = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── 1. Ripple ─────────────────────────────────────────────────────────────
  if (!reduceMotion) {
    var RIPPLE_SELECTOR = 'button, .tab, [role="button"], .page-link, .track-card, .tc-dot';

    // The ripple's critical styles ship here, not (only) in devhub.css: some
    // pages (the track index/landing pages) load this script without that
    // stylesheet, and an unstyled .dh-ripple span is an in-flow inline element
    // — it joined the button's layout as a giant bubble and shoved its
    // siblings aside. Appended after any <link> so these rules win ties.
    if (!doc.getElementById('dh-ripple-css')) {
      var rippleCss = doc.createElement('style');
      rippleCss.id = 'dh-ripple-css';
      rippleCss.textContent =
        '.dh-ripple{position:absolute;border-radius:50%;pointer-events:none;' +
        'background:radial-gradient(circle, rgba(255,255,255,.22) 0%, rgba(255,255,255,.10) 55%, rgba(255,255,255,0) 72%);' +
        'transform:translate(-50%,-50%) scale(0);opacity:1;' +
        'animation:dhRipple .45s cubic-bezier(.22,.61,.36,1) forwards}' +
        '@keyframes dhRipple{to{transform:translate(-50%,-50%) scale(1);opacity:0}}';
      (doc.head || doc.documentElement).appendChild(rippleCss);
    }

    doc.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return; // left/primary press only
      var el = e.target.closest && e.target.closest(RIPPLE_SELECTOR);
      if (!el || el.disabled) return;

      // Containment guard for pages without devhub.css: the ripple must be
      // positioned against the button and clipped to its box, or it spills
      // far outside the control.
      var cs = global.getComputedStyle(el);
      if (cs.position === 'static') el.style.position = 'relative';
      if (cs.overflow !== 'hidden' && cs.overflow !== 'clip') el.style.overflow = 'hidden';

      // Size the circle so that at scale(1) its edge just reaches the corner of
      // the control farthest from the pointer — the Material sizing rule. The
      // old `max(width, height) * 1.4` then animating to `scale(2.6)` produced a
      // circle ~3.6x the control's longest side: on a 180x30 tab that is a
      // ~650px wash, which reads as a huge misaligned blob rather than a press.
      // Computing the exact radius here is also what lets the keyframe stop at
      // scale(1), so wide controls and small icon buttons feel identical.
      var rect = el.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var radius = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));
      var size = radius * 2;
      var span = doc.createElement('span');
      span.className = 'dh-ripple';
      span.style.width = size + 'px';
      span.style.height = size + 'px';
      span.style.left = x + 'px';
      span.style.top = y + 'px';
      el.appendChild(span);
      span.addEventListener('animationend', function () { span.remove(); });
      // Belt-and-suspenders cleanup in case animationend never fires (e.g. the
      // element gets removed/re-rendered mid-animation, as app.html's sidebar
      // sometimes does).
      setTimeout(function () { if (span.parentNode) span.remove(); }, 700);
    }, { passive: true });
  }

  // ── 2. Page-to-page fade ──────────────────────────────────────────────────
  if (!reduceMotion && global.top === global.self) {
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
})(window, document);
