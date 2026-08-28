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
 * ========================================================================== */
(function (global) {
  'use strict';

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
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

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

  /* ---- interleaving: round-robin across a bucket key, shuffled within ---- */
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

  /* ---- Flashcards: thin passthrough to DevHubFlash ------------------------ */
  function renderFlashcards(root, entries, opts) {
    root.innerHTML = '';
    if (!entries.length) { renderEmpty(root); return; }
    global.DevHubFlash.render(root, buildDeck(entries, opts));
  }

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

  function renderEmpty(root) {
    root.appendChild(h('div', { class: 'df-card', style: 'text-align:center;padding:40px 24px' },
      h('p', { style: 'font-size:15px;color:var(--muted);margin:0' },
        'Nothing to review here yet — click ', h('b', null, '📖 Notebook'),
        ' next to any lesson section, then come back.')));
  }

  /* ---- shared self-test engine for Quiz Me + Interleaved ------------------ */
  function runSelfTest(root, entries, opts, orderedEntries, modeLabel, modeHint) {
    global.DevHubFlash.injectStyles();
    var deckId = 'notebook-' + (opts.scopeId || 'all');
    var boxes = global.DevHubFlash.loadBoxes(deckId);
    var N = entries.length;
    function boxOf(id) { return boxes['k:' + id] || 1; }
    function mastered() { return entries.filter(function (e) { return boxOf(e.id) >= 5; }).length; }

    var state = { queue: [], pos: 0, revealed: 0, reviewed: 0 };

    function screen(node) { root.innerHTML = ''; root.appendChild(node); global.scrollTo(0, 0); }
    function stat(v, l) { return h('div', { class: 'df-stat' }, h('b', null, String(v)), h('span', null, l)); }

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

    function start() {
      state.queue = orderedEntries.slice();
      state.pos = 0; state.revealed = 0; state.reviewed = 0;
      card();
    }

    function card() {
      if (state.pos >= state.queue.length) return done();
      var e = state.queue[state.pos];
      var revealed = false;

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

      function rate(known) {
        boxes['k:' + e.id] = known ? Math.min(5, boxOf(e.id) + 1) : 1;
        global.DevHubFlash.saveBoxes(deckId, boxes);
        state.reviewed++; state.pos++;
        card();
      }
      function skip() { state.pos++; card(); }

      draw();
    }

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

  function renderQuizMe(root, entries, opts) {
    root.innerHTML = '';
    if (!entries.length) { renderEmpty(root); return; }
    var boxes = global.DevHubFlash.loadBoxes('notebook-' + (opts.scopeId || 'all'));
    var order = shuffle(entries).sort(function (a, b) {
      return (boxes['k:' + a.id] || 1) - (boxes['k:' + b.id] || 1);
    });
    runSelfTest(root, entries, opts, order, 'Quiz Me', 'Weak entries surface first. Try to recall each one before revealing — retrieval practice, not re-reading.');
  }

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
