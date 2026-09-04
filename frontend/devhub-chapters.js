/* ============================================================================
 * devhub-chapters.js — the "you are here" chapter rail.
 *
 * Renders the rail from `tracks-data.js`, so a page never hand-writes its own
 * chapter list (the Decorator page originally did, and it was wrong: it showed
 * 5 chapters for a section that actually has 14).
 *
 * USAGE — two lines on any page, same shape as devhub-notebook.js:
 *     <script src="tracks-data.js"></script>
 *     <script src="devhub-chapters.js"></script>
 * It finds its own position from location.pathname and injects the rail at the
 * top of `.container` / `.page` / `<body>`, right after any `a.back`. Nothing
 * else per page. A page can place it explicitly with <div data-chapter-rail>.
 *
 * DATA SOURCE. An earlier draft generated a slim `chapter-index.js`; it saved
 * only 2.8KB gzipped over tracks-data.js and introduced a file that could
 * silently drift from its source, so it was dropped. tracks-data.js is cached
 * across every page after the first hit.
 *
 * Sections with fewer than 2 pages get NO rail — a "you are here" with one
 * stop is noise. Long sections are WINDOWED around the current page (the
 * Design Patterns section has 14 chapters and a phone shows about 5).
 * ========================================================================== */
(function () {
  'use strict';

  /* How many stops fit depends on the screen AND on how long the labels are.
     Five stops on a 390px phone leaves ~70px each, which truncates real
     section names to "Enca…" / "Inher…". Drop to three on narrow screens so
     the labels are actually readable — the rail is navigation, and a label
     you cannot read is not navigation. */
  var narrow = typeof window !== 'undefined' && window.innerWidth && window.innerWidth < 430;
  var WINDOW_RADIUS = narrow ? 1 : 2;
  var WINDOW_MIN = narrow ? 3 : 5;

  function currentFile() {
    var p = location.pathname.split('/').pop();
    return p || 'index.html';
  }

  /* Strip the series prefix and any trailing emoji, then cut at the first
     em-dash or colon: "Head First: Adapter+Facade 🦃" -> "Adapter+Facade".
     Five labels have to share a 390px phone, so this is not cosmetic. */
  function shortLabel(title) {
    return String(title)
      .replace(/^Head First:\s*/i, '')
      .replace(/\s*[—–-]\s[\s\S]*$/, '')
      .replace(/:\s[\s\S]*$/, '')
      .replace(/[\s\u200d\ufe0f]*\p{Extended_Pictographic}[\p{Extended_Pictographic}\s\u200d\ufe0f]*$/gu, '')
      .trim() || String(title).trim();
  }

  function locate(tracks, file) {
    for (var t = 0; t < tracks.length; t++) {
      var secs = tracks[t].sections || [];
      for (var s = 0; s < secs.length; s++) {
        var pages = (secs[s].pages || []).filter(function (p) { return p && p.file; });
        for (var i = 0; i < pages.length; i++) {
          if (pages[i].file === file) {
            return { track: tracks[t], section: secs[s], pages: pages, index: i };
          }
        }
      }
    }
    return null;
  }

  function windowed(pages, index) {
    if (pages.length <= WINDOW_MIN) return { from: 0, to: pages.length };
    var from = index - WINDOW_RADIUS;
    var to = index + WINDOW_RADIUS + 1;
    if (from < 0) { to -= from; from = 0; }
    if (to > pages.length) { from -= (to - pages.length); to = pages.length; }
    return { from: Math.max(0, from), to: to };
  }

  function build(loc) {
    var pages = loc.pages, index = loc.index;
    var w = windowed(pages, index);

    var rail = document.createElement('nav');
    rail.className = 'hf-rail';
    rail.setAttribute('aria-label', loc.section.label + ' chapters');

    // The ghosted chapter numeral is the page's 1-based position.
    var num = document.createElement('span');
    num.className = 'hf-chapnum';
    num.setAttribute('aria-hidden', 'true');
    num.textContent = String(index + 1);
    rail.appendChild(num);

    var kicker = document.createElement('span');
    kicker.className = 'hf-kicker';
    // Track labels carry a descriptive tail ("Java — OOP & Language"); the
    // kicker only has room for the name, so reuse the same shortener.
    kicker.textContent = shortLabel(loc.track.label) + ' · ' + loc.section.label;
    rail.appendChild(kicker);

    var here = document.createElement('span');
    here.className = 'hf-youarehere';
    here.textContent = 'you are here';
    rail.appendChild(here);

    var ol = document.createElement('ol');
    for (var i = w.from; i < w.to; i++) {
      var li = document.createElement('li');
      var isCurrent = i === index;
      var el = document.createElement(isCurrent ? 'span' : 'a');
      if (!isCurrent) el.href = pages[i].file;
      el.textContent = shortLabel(pages[i].title);
      if (isCurrent) li.setAttribute('aria-current', 'page');
      li.appendChild(el);
      ol.appendChild(li);
    }
    rail.appendChild(ol);

    // "3 of 14" — without it, a windowed rail hides how long the section is.
    if (pages.length > w.to - w.from) {
      var count = document.createElement('span');
      count.className = 'hf-railcount';
      count.textContent = (index + 1) + ' of ' + pages.length;
      rail.appendChild(count);
    }
    return rail;
  }

  function mount(rail) {
    var slot = document.querySelector('[data-chapter-rail]');
    if (slot) { slot.appendChild(rail); return; }
    var host = document.querySelector('.container') || document.querySelector('.page') || document.body;
    var back = host.querySelector(':scope > a.back');
    if (back && back.nextSibling) host.insertBefore(rail, back.nextSibling);
    else if (back) host.appendChild(rail);
    else host.insertBefore(rail, host.firstChild);
  }

  function init() {
    var tracks = window.DEVHUB_TRACKS;
    if (!Array.isArray(tracks)) return;               // tracks-data.js not loaded
    if (document.querySelector('.hf-rail')) return;    // page hand-rolled its own
    var loc = locate(tracks, currentFile());
    if (!loc || loc.pages.length < 2) return;          // unregistered, or lone page
    mount(build(loc));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
