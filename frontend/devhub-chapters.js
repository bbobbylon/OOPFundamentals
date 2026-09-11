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
 *
 * WHO LOADS IT. 521 lesson pages — every registered lesson. It renders TWO
 * things from the registry: the chapter rail at the top (build/mount) and the
 * "Test yourself" strip at the bottom (buildPractice/mountPractice). Both are
 * skipped when the page already carries a `.hf-rail` / `.hf-practice` of its
 * own, so a hand-rolled one is never doubled.
 *
 * ORDERING — the one real script-order constraint on the site: tracks-data.js
 * MUST come before this file. init() reads window.DEVHUB_TRACKS and
 * window.DEVHUB_PRACTICE at DOMContentLoaded and silently renders nothing if
 * the array is missing — no error, just no rail, which is why tmp_vcheck.mjs
 * checks the required-script list rather than trusting the page to notice.
 *
 * STYLING. This file does NOT inject its own CSS: `.hf-rail`, `.hf-chapnum`,
 * `.hf-kicker`, `.hf-railnext`, `.hf-practice*` all live in devhub-hf.css.
 * The self-contained-CSS rule the other engines follow (inject an id-guarded
 * <style> so a page that skips devhub.css still lays out — the giant-ripple
 * incident) has not been applied here; it works today because all 521 pages
 * that load this also link devhub-hf.css.
 *
 * TALKING TO THE HUB. Inside app.html's iframe every rail link goes out as
 * `window.parent.postMessage({type:'dlh-navigate', file})` instead of a plain
 * navigation (see railClick for the bug that forced this). `dlh-navigate` is
 * a message TYPE, not a storage key, despite the dlh- prefix it shares with
 * the localStorage keys; devhub-codegrade.js, devhub-quiz.js and
 * devhub-notebook-review.js send the same message for their cross-links.
 *
 * PERSISTENCE. None. It reads nothing from and writes nothing to storage.
 *
 * DEPENDS ON: tracks-data.js (DEVHUB_TRACKS, DEVHUB_PRACTICE), devhub-hf.css.
 * DEPENDED ON BY: nothing — it can be dropped from a page without breaking
 * any other engine.
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

  /**
   * The page's own filename, which is also its key in the registry (`file:`).
   * Both the rail and the practice strip locate themselves by this alone —
   * a renamed page falls out of both until tracks-data.js is updated.
   */
  function currentFile() {
    var p = location.pathname.split('/').pop();
    return p || 'index.html';
  }

  /**
   * Strip the series prefix and any trailing emoji, then cut at the first
   * em-dash or colon: "Head First: Adapter+Facade 🦃" -> "Adapter+Facade".
   * Five labels have to share a 390px phone, so this is not cosmetic. Used for
   * rail stops, the kicker's track name and the "Next up" section label alike.
   */
  function shortLabel(title) {
    return String(title)
      .replace(/^Head First:\s*/i, '')
      .replace(/\s*[—–-]\s[\s\S]*$/, '')
      .replace(/:\s[\s\S]*$/, '')
      .replace(/[\s\u200d\ufe0f]*\p{Extended_Pictographic}[\p{Extended_Pictographic}\s\u200d\ufe0f]*$/gu, '')
      .trim() || String(title).trim();
  }

  /**
   * Find `file` in the registry and return everything the rail needs to draw:
   * {track, section, pages, index, sections, sectionIndex}. First match wins,
   * which is fine because tmp_vcheck.mjs fails the build on a page registered
   * in two sections. Returns null for unregistered pages (landing pages, the
   * hub itself), and those simply get no rail.
   */
  function locate(tracks, file) {
    for (var t = 0; t < tracks.length; t++) {
      /* Skip sections with no real pages when numbering, or "the next section"
         below can point at an empty one and the rail dead-ends anyway. */
      var secs = (tracks[t].sections || []).filter(function (sec) {
        return (sec.pages || []).some(function (p) { return p && p.file; });
      });
      for (var s = 0; s < secs.length; s++) {
        var pages = (secs[s].pages || []).filter(function (p) { return p && p.file; });
        for (var i = 0; i < pages.length; i++) {
          if (pages[i].file === file) {
            return { track: tracks[t], section: secs[s], pages: pages, index: i,
                     sections: secs, sectionIndex: s };
          }
        }
      }
    }
    return null;
  }

  /**
   * Where a learner goes after the last page of a section. Without this the rail
   * simply stops: 90 of the site's 124 sections end on a page with no forward
   * link of any kind, which is most of why 512 pages read as a library rather
   * than the "zero to hero" path they are meant to be. Returns null on the last
   * section of a track — that is a real end, not a dead end, and says so.
   */
  function nextSectionStart(loc) {
    if (!loc || !loc.sections) return null;
    if (loc.index !== loc.pages.length - 1) return null;       // not at a boundary
    var next = loc.sections[loc.sectionIndex + 1];
    if (!next) return null;                                     // end of track
    var pages = (next.pages || []).filter(function (p) { return p && p.file; });
    if (!pages.length) return null;
    return { section: next, page: pages[0] };
  }

  /**
   * The [from, to) slice of `pages` the rail shows: the whole section when it
   * fits in WINDOW_MIN stops, otherwise WINDOW_RADIUS stops either side of the
   * current page, shifted (not shrunk) at the edges so the rail is always the
   * same width. The "3 of 14" count in build() exists because this hides pages.
   */
  function windowed(pages, index) {
    if (pages.length <= WINDOW_MIN) return { from: 0, to: pages.length };
    var from = index - WINDOW_RADIUS;
    var to = index + WINDOW_RADIUS + 1;
    if (from < 0) { to -= from; from = 0; }
    if (to > pages.length) { from -= (to - pages.length); to = pages.length; }
    return { from: Math.max(0, from), to: to };
  }

  /* The hub (app.html) renders lessons in an iframe and tracks which page you are
     on in its own `currentFile`. A plain <a href> inside that iframe navigates the
     FRAME only — the hub never learns, so its breadcrumb, active sidebar link, hash
     and progress all stay on the page you arrived from. The visible consequence:
     walk a section with the rail, press "Mark as Learned", and the hub credits the
     page you LEFT. Reproduced: open head-first-strategy, rail to head-first-observer,
     mark learned -> {"head-first-strategy-visualizer.html":"learned"}.

     app.html already accepts `dlh-navigate` over postMessage (it is how in-page
     cross-links work), so the rail just has to use it. We keep the real href — so
     middle-click, ctrl-click, copy-link and the keyboard all still behave like
     links — and only take over the plain left-click, and only when embedded. */
  /**
   * Click handler shared by every link this file creates (rail stops, "Next
   * up", the practice strip). Standalone (not framed): does nothing and the
   * href navigates. Framed: swallows the plain left-click and asks app.html
   * to navigate via postMessage, so the hub's breadcrumb, sidebar and
   * progress follow the learner — see the note above for the bug otherwise.
   */
  function railClick(e) {
    if (window.top === window.self) return;                 // standalone: let the href work
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var file = this.getAttribute('href');
    if (!file) return;
    e.preventDefault();
    try { window.parent.postMessage({ type: 'dlh-navigate', file: file }, '*'); }
    catch (err) { window.location.href = file; }            // cross-origin: fall back
  }

  /**
   * Assemble the <nav class="hf-rail"> for a located page: ghost chapter
   * numeral, "Track · Section" kicker, the windowed list of stops (current one
   * as a <span aria-current>, the rest as links), the "N of M" count when
   * windowing hid pages, and the "Next up" link at a section boundary. Pure
   * DOM construction; mount() decides where it goes.
   */
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
      if (!isCurrent) { el.href = pages[i].file; el.addEventListener('click', railClick); }
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

    // At a section boundary, say where the path continues.
    var nxt = nextSectionStart(loc);
    if (nxt) {
      var na = document.createElement('a');
      na.className = 'hf-railnext';
      na.href = nxt.page.file;
      na.textContent = 'Next up · ' + shortLabel(nxt.section.label) + ' →';
      na.addEventListener('click', railClick);
      rail.appendChild(na);
    }
    return rail;
  }

  /**
   * Place the rail: an explicit <div data-chapter-rail> wins; otherwise it goes
   * directly after the `a.back` link inside .container/.page/body, i.e. the
   * same spot on every page without any per-page markup.
   */
  function mount(rail) {
    var slot = document.querySelector('[data-chapter-rail]');
    if (slot) { slot.appendChild(rail); return; }
    var host = document.querySelector('.container') || document.querySelector('.page') || document.body;
    var back = host.querySelector(':scope > a.back');
    if (back && back.nextSibling) host.insertBefore(rail, back.nextSibling);
    else if (back) host.appendChild(rail);
    else host.insertBefore(rail, host.firstChild);
  }

  /* ── "Test yourself" ────────────────────────────────────────────────────
     The exam and practice banks have always known which lesson each question
     came from (`ref: { label, file }` — 614 of them). That edge only pointed
     one way: practice knew its lesson, a lesson knew nothing about its
     practice. So the whole assessment layer — 19 exams, 16 decks, 9 graded
     IDEs, all working — was reachable only from a sidebar track sitting 33rd
     of 34, and just 2 of 465 lesson pages linked forward to any recall at all.

     tracks-data.js now carries the inverted map (window.DEVHUB_PRACTICE,
     regenerated by tmp_genpracticemap.mjs, never hand-edited). This renders it
     at the end of the lesson, where someone who has just finished reading is
     the most likely to want it. No per-page markup: all 202 lessons with an
     entry already load this script and tracks-data.js. */
  /**
   * The <aside class="hf-practice"> for this lesson, or null when
   * DEVHUB_PRACTICE has no entry for it. Up to three links — Practice (graded
   * IDE), Exam, Flashcards — in that fixed order, each labelled with the
   * target's title from the derived map. Links use railClick, so inside the
   * hub they navigate the hub, not just the frame.
   */
  function buildPractice(file) {
    var data = window.DEVHUB_PRACTICE;
    if (!data || !data.map) return null;
    var entry = data.map[file];
    if (!entry) return null;

    var box = document.createElement('aside');
    box.className = 'hf-practice';
    box.setAttribute('aria-label', 'Practice for this lesson');

    var h = document.createElement('span');
    h.className = 'hf-practice-kick';
    h.textContent = 'Test yourself';
    box.appendChild(h);

    var lead = document.createElement('p');
    lead.className = 'hf-practice-lead';
    lead.textContent = 'Reading it is not the same as knowing it. These cover this lesson:';
    box.appendChild(lead);

    var row = document.createElement('div');
    row.className = 'hf-practice-row';
    [['practice', 'Practice'], ['exam', 'Exam'], ['deck', 'Flashcards']].forEach(function (pair) {
      var target = entry[pair[0]];
      if (!target) return;
      var a = document.createElement('a');
      a.className = 'hf-practice-link';
      a.href = target;
      a.addEventListener('click', railClick);
      a.textContent = pair[1] + ' · ' + ((data.titles && data.titles[target]) || target);
      row.appendChild(a);
    });
    if (!row.childNodes.length) return null;
    box.appendChild(row);
    return box;
  }

  /**
   * Place the practice strip: an explicit <div data-practice-strip> wins,
   * otherwise it is appended as the LAST thing in .container/.page/body —
   * after "Where to go next", because recall belongs after reading.
   */
  function mountPractice(box) {
    var slot = document.querySelector('[data-practice-strip]');
    if (slot) { slot.appendChild(box); return; }
    var host = document.querySelector('.container') || document.querySelector('.page') || document.body;
    host.appendChild(box);
  }

  /**
   * Entry point, run once at DOMContentLoaded (or immediately if the DOM is
   * already parsed). Bails silently when tracks-data.js did not load first —
   * that silence is the failure mode the ORDERING note in the banner is about.
   * Each of the two widgets is skipped independently if the page already has
   * one, so a page can hand-roll the rail and still get the practice strip.
   */
  function init() {
    var tracks = window.DEVHUB_TRACKS;
    if (!Array.isArray(tracks)) return;               // tracks-data.js not loaded
    var file = currentFile();

    if (!document.querySelector('.hf-rail')) {         // else the page hand-rolled its own
      var loc = locate(tracks, file);
      if (loc && loc.pages.length >= 2) mount(build(loc));
    }

    if (!document.querySelector('.hf-practice')) {
      var strip = buildPractice(file);
      if (strip) mountPractice(strip);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
