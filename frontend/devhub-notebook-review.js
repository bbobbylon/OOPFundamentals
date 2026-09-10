/* ============================================================================
 * devhub-notebook-review.js — review modes for notebook-sourced entries.
 *
 * notebook.html has three review buttons. All three share ONE Leitner box
 * store per scope (keyed by entry.id, via devhub-flashcards.js's exported
 * loadBoxes/saveBoxes) so "mastery" means the same thing everywhere:
 *
 *   - Flashcards   → DevHubFlash.render() directly. Classic flip-to-reveal.
 *   - Quiz Me      → THIS file. Forces a typed recall attempt before the
 *                    answer is revealed (Bjork's "generation" — a desirable
 *                    difficulty with real evidence behind it, unlike
 *                    highlighting/color, which this app deliberately does
 *                    NOT build as a study technique — see docs/ROADMAP.md).
 *                    Deliberately does NOT reuse devhub-quiz.js's MCQ engine:
 *                    notebook entries have no authored distractors, and
 *                    faking multiple-choice options for them would be
 *                    exactly the "plausible-sounding but evidence-free"
 *                    trap this feature's research pass was built to avoid.
 *   - Interleaved  → THIS file. Same Quiz Me flow, but entries are shuffled
 *                    round-robin across sections/tracks first, so consecutive
 *                    cards force discrimination between topics (Rohrer/Taylor
 *                    interleaving evidence — strongest for problem-solving
 *                    domains like DSA/interview prep).
 *
 * USAGE: <script src="devhub-flashcards.js"></script>
 *        <script src="devhub-notebook-review.js"></script>
 *        DevHubNotebookReview.renderFlashcards(root, entries, opts);
 *        DevHubNotebookReview.renderQuizMe(root, entries, opts);
 *        DevHubNotebookReview.renderInterleaved(root, entries, opts);
 *
 *   entries: notebook entries, each optionally enriched with
 *            {trackId, trackLabel, sectionLabel} by the caller (notebook.html
 *            looks these up from tracks-data.js before calling in).
 *   opts:    { scopeId: 'all'|trackId, scopeLabel: string, accent?: string }
 *
 * WHO LOADS IT: exactly one page, notebook.html.
 *
 * PERSISTS: through devhub-flashcards.js's store — localStorage
 *   'dlh-flash:notebook-<scopeId>' → { 'k:<entry.id>': box }. Every scope
 *   ('all', or one trackId) is its OWN store, so mastering an entry in the
 *   Java scope does not mark it mastered in the all-tracks scope.
 *
 * THE LEITNER RULE is applied here in runSelfTest's rate() exactly as
 *   devhub-flashcards.js's header states it (up one box capped at 5, or
 *   straight back to 1). Keep the two in lockstep or "mastered" forks.
 *
 * DEPENDS ON: devhub-flashcards.js MUST load first (DevHubFlash.render /
 *   loadBoxes / saveBoxes / injectStyles). Inside the hub iframe, "Open
 *   lesson" asks app.html to navigate via postMessage {type:'dlh-navigate'}
 *   so the hub rail and progress stay in sync; standalone it just sets
 *   location. Entry labels (trackLabel/sectionLabel) are supplied by the
 *   caller from tracks-data.js — this file never reads the registry itself.
 * ========================================================================== */
(function (global) {
  'use strict';

  /** Tiny DOM builder — same helper as devhub-flashcards.js / devhub-quiz.js, copied on
   *  purpose so each engine stays self-contained. */
  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    if (props) for (const k in props) {
      if (k === 'class') el.className = props[k];
      else if (k === 'html') el.innerHTML = props[k];
      else if (k.startsWith('on') && typeof props[k] === 'function') el.addEventListener(k.slice(2), props[k]);
      else if (props[k] != null) el.setAttribute(k, props[k]);
    }
    for (const kid of kids.flat()) { if (kid == null || kid === false) continue;
      el.appendChild(typeof kid === 'string' ? document.createTextNode(kid) : kid); }
    return el;
  }
  /** Fisher–Yates on a copy; the caller's entry array is never reordered in place. */
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  /** Open a saved section. In the hub iframe this posts dlh-navigate to app.html (which
   *  swaps the iframe and marks progress); standalone it navigates directly. Exported so
   *  notebook.html's own entry list can use the identical behaviour. */
  function navigateTo(entry) {
    var file = entry.file, anchor = entry.anchor;
    try {
      if (global.parent !== global) {
        global.parent.postMessage({ type: 'dlh-navigate', file: file, anchor: anchor }, '*');
        return;
      }
    } catch (e) {}
    global.location.href = file + (anchor ? '#' + anchor : '');
  }

  /** Interleaving order: bucket by sectionLabel (else trackId), shuffle bucket order and
   *  each bucket's contents, then deal round-robin — so consecutive cards come from
   *  different sections for as long as more than one section still has cards. */
  function interleaveOrder(entries) {
    var buckets = {}, order = [];
    entries.forEach(function (e) {
      var k = e.sectionLabel || e.trackId || 'misc';
      (buckets[k] = buckets[k] || []).push(e);
    });
    var keys = shuffle(Object.keys(buckets));
    keys.forEach(function (k) { buckets[k] = shuffle(buckets[k]); });
    var remaining = true;
    while (remaining) {
      remaining = false;
      keys.forEach(function (k) {
        if (buckets[k].length) { order.push(buckets[k].shift()); remaining = true; }
      });
    }
    return order;
  }

  /** Flashcards mode: a thin pass-through to DevHubFlash.render() over buildDeck(). */
  function renderFlashcards(root, entries, opts) {
    root.innerHTML = '';
    if (!entries.length) { renderEmpty(root); return; }
    global.DevHubFlash.render(root, buildDeck(entries, opts));
  }

  /** Shape notebook entries into a DevHubFlash deck: id 'notebook-<scope>' (the shared
   *  store key), front = the saved heading, back = the captured snippet, link = jump
   *  back to the lesson section. card.id makes the box key stable (see keyOf there). */
  function buildDeck(entries, opts) {
    return {
      id: 'notebook-' + (opts.scopeId || 'all'),
      title: '📓 ' + (opts.scopeLabel || 'My Notebook'),
      subtitle: entries.length + ' saved section' + (entries.length === 1 ? '' : 's'),
      accent: opts.accent || '#a78bfa',
      cards: entries.map(function (e) {
        return {
          id: e.id,
          front: e.title,
          back: e.snippet || 'Open the lesson to review this section in full.',
          hint: e.sectionLabel || null,
          link: { href: e.file + '#' + e.anchor, label: 'Open lesson', onNavigate: function () { navigateTo(e); } }
        };
      })
    };
  }

  /** Empty state — points at the "📖 Notebook" button devhub-notebook.js adds to every <h2>. */
  function renderEmpty(root) {
    root.appendChild(h('div', { class: 'df-card', style: 'text-align:center;padding:40px 24px' },
      h('p', { style: 'font-size:15px;color:var(--muted);margin:0' },
        'Nothing to review here yet — click ', h('b', null, '📖 Notebook'),
        ' next to any lesson section, then come back.')));
  }

  /** The self-test engine behind Quiz Me and Interleaved. The two modes differ ONLY in
   *  orderedEntries; landing, the recall-first card (textarea before reveal), rating and
   *  the done screen all live here, on the same store the Flashcards mode uses. */
  function runSelfTest(root, entries, opts, orderedEntries, modeLabel, modeHint) {
    global.DevHubFlash.injectStyles();
    var deckId = 'notebook-' + (opts.scopeId || 'all');
    var boxes = global.DevHubFlash.loadBoxes(deckId);
    var N = entries.length;
    /** Current box of an entry; unseen = box 1. Same key shape as flashcards keyOf(). */
    function boxOf(id) { return boxes['k:' + id] || 1; }
    /** Number of entries in box 5 — the same mastery definition as devhub-flashcards.js. */
    function mastered() { return entries.filter(function (e) { return boxOf(e.id) >= 5; }).length; }

    var state = { queue: [], pos: 0, revealed: 0, reviewed: 0 };

    /** Swap root's content for one screen and scroll to the top. */
    function screen(node) { root.innerHTML = ''; root.appendChild(node); global.scrollTo(0, 0); }
    /** One value+label tile, in the flashcard engine's .df-stat look. */
    function stat(v, l) { return h('div', { class: 'df-stat' }, h('b', null, String(v)), h('span', null, l)); }

    /** Scope overview: entry count, mastery, the 5-box histogram, and Start. */
    function landing() {
      if (!N) { renderEmpty(root); return; }
      var m = mastered();
      var counts = [0, 0, 0, 0, 0];
      entries.forEach(function (e) { counts[boxOf(e.id) - 1]++; });
      var boxesEl = h('div', { class: 'df-boxes' },
        ...counts.map((c, i) => h('div', { class: 'df-box' }, h('b', null, String(c)),
          h('span', null, i === 4 ? 'mastered' : 'box ' + (i + 1)))));
      screen(h('div', { class: 'df-card' },
        h('h2', { class: 'df-h' }, modeLabel + ' — ' + (opts.scopeLabel || 'My Notebook')),
        h('p', { class: 'df-sub' }, modeHint),
        h('div', { class: 'df-meta' }, stat(N, 'Entries'), stat(m, 'Mastered'), stat(Math.round(m / N * 100) + '%', 'Progress')),
        h('div', { class: 'df-bar' }, h('i', { style: 'width:' + Math.round(m / N * 100) + '%' })),
        boxesEl,
        h('div', { class: 'df-row', style: 'margin-top:18px' },
          h('button', { class: 'df-btn primary', onclick: () => start() }, '▶ Start session'))));
    }

    /** Begin a session over the caller-supplied order; counters reset, boxes do not. */
    function start() {
      state.queue = orderedEntries.slice();
      state.pos = 0; state.revealed = 0; state.reviewed = 0;
      card();
    }

    /** One entry: a recall-first card. Rating buttons only appear AFTER reveal, so a
     *  learner cannot rate a card they never attempted to recall. */
    function card() {
      if (state.pos >= state.queue.length) return done();
      var e = state.queue[state.pos];
      var revealed = false;

      /** Paint the current card in its current revealed/unrevealed state. */
      function draw() {
        var top = h('div', { class: 'df-row', style: 'margin-bottom:10px' },
          h('span', { class: 'df-count' }, 'Card ' + (state.pos + 1) + ' / ' + state.queue.length),
          h('span', { class: 'df-progwrap' }, h('i', { style: 'width:' + (state.pos / state.queue.length * 100) + '%' })),
          h('span', { class: 'df-count' }, 'box ' + boxOf(e.id)));

        var metaRow = h('div', { class: 'dnb-meta-row' },
          e.sectionLabel ? h('span', { class: 'dnb-meta-chip' }, e.sectionLabel) : null,
          e.trackLabel ? h('span', { class: 'dnb-meta-chip' }, e.trackLabel) : null);

        var flash = h('div', { class: 'df-flash', style: 'cursor:default' },
          h('span', { class: 'df-side' }, revealed ? 'answer' : 'recall this'),
          h('div', { class: 'df-front' }, e.title),
          !revealed ? h('textarea', {
            class: 'dnb-scratch', placeholder: 'Try to explain or recall it before revealing (optional, but this is the part that actually builds retention)…'
          }) : h('div', { class: 'df-back' }, e.snippet || 'Open the lesson to review this section in full.'),
          h('a', {
            class: 'dnb-link-chip', href: e.file + '#' + e.anchor,
            onclick: (ev) => { ev.preventDefault(); ev.stopPropagation(); navigateTo(e); }
          }, '↗ Open lesson'));

        var controls;
        if (!revealed) {
          controls = h('div', { class: 'df-row', style: 'margin-top:14px' },
            h('button', { class: 'df-btn primary', onclick: () => { revealed = true; state.revealed++; draw(); } }, 'Reveal answer'),
            h('span', { class: 'df-spacer' }),
            h('button', { class: 'df-btn', onclick: skip }, 'Skip →'));
        } else {
          controls = h('div', { class: 'df-row', style: 'margin-top:14px' },
            h('button', { class: 'df-btn bad', onclick: () => rate(false) }, '✗ Missed it'),
            h('span', { class: 'df-spacer' }),
            h('button', { class: 'df-btn good', onclick: () => rate(true) }, '✓ Got it'));
        }

        screen(h('div', null, h('div', { class: 'df-card' }, top, metaRow, flash, controls)));
      }

      /** The Leitner rule (see header) for this entry, persisted to the scope store. Note
       *  it does not call DevHubStreak.touch() — only the flashcard engine reports reps. */
      function rate(known) {
        boxes['k:' + e.id] = known ? Math.min(5, boxOf(e.id) + 1) : 1;
        global.DevHubFlash.saveBoxes(deckId, boxes);
        state.reviewed++; state.pos++;
        card();
      }
      /** Advance without rating; the box is untouched. */
      function skip() { state.pos++; card(); }

      draw();
    }

    /** End-of-session summary; mastery is re-read from the store. */
    function done() {
      var m = mastered();
      screen(h('div', { class: 'df-card df-done' },
        h('p', { class: 'big' }, m + ' / ' + N),
        h('p', { class: 'df-sub' }, 'entries mastered (box 5)'),
        h('div', { class: 'df-bar', style: 'max-width:360px;margin:14px auto' }, h('i', { style: 'width:' + Math.round(m / N * 100) + '%' })),
        h('p', { class: 'df-sub' }, 'You reviewed ' + state.reviewed + ' entr' + (state.reviewed === 1 ? 'y' : 'ies') + ' this session.'),
        h('div', { class: 'df-row', style: 'justify-content:center;margin-top:18px' },
          h('button', { class: 'df-btn primary', onclick: () => start() }, '↻ Review again'),
          h('button', { class: 'df-btn', onclick: landing }, 'Back'))));
    }

    landing();
  }

  /** Quiz Me: weak-first order — shuffle, then stable-sort ascending by box — the same
   *  rule as the flashcard engine's default study order. */
  function renderQuizMe(root, entries, opts) {
    root.innerHTML = '';
    if (!entries.length) { renderEmpty(root); return; }
    var boxes = global.DevHubFlash.loadBoxes('notebook-' + (opts.scopeId || 'all'));
    var order = shuffle(entries).sort(function (a, b) {
      return (boxes['k:' + a.id] || 1) - (boxes['k:' + b.id] || 1);
    });
    runSelfTest(root, entries, opts, order, 'Quiz Me', 'Weak entries surface first. Try to recall each one before revealing — retrieval practice, not re-reading.');
  }

  /** Interleaved: interleaveOrder() decides the sequence; boxes are ignored for ordering
   *  but are still updated by rating, on the same scope store. */
  function renderInterleaved(root, entries, opts) {
    root.innerHTML = '';
    if (!entries.length) { renderEmpty(root); return; }
    runSelfTest(root, entries, opts, interleaveOrder(entries), 'Interleaved Review',
      'Shuffled across sections/tracks on purpose — mixing topics forces you to recognize which technique applies, not just execute one you already know is coming.');
  }

  global.DevHubNotebookReview = {
    renderFlashcards: renderFlashcards,
    renderQuizMe: renderQuizMe,
    renderInterleaved: renderInterleaved,
    navigateTo: navigateTo,
    interleaveOrder: interleaveOrder
  };
})(window);
