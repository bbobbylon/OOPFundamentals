/* ============================================================================
 * devhub-flashcards.js — DevHub's spaced-repetition flashcard engine.
 *
 * Retrieval practice for the memorization-heavy facts that exams love:
 * AWS service→purpose, Big-O of each operation, HTTP status codes, Spring
 * annotations. One engine, many decks. Uses a Leitner box system (5 boxes):
 * a card you know moves UP a box (seen less often); a card you miss drops to
 * box 1 (seen most). Mastery = the share of cards parked in box 5.
 *
 * USAGE:
 *   <div id="deck"></div>
 *   <script src="devhub-flashcards.js"></script>
 *   <script>
 *     DevHubFlash.render(document.getElementById('deck'), {
 *       id: 'aws-services', title: 'AWS Services', subtitle: 'service → purpose',
 *       accent: '#ff9900',
 *       cards: [ { front: 'Amazon S3', back: 'Object storage…', hint: 'storage' }, … ]
 *     });
 *   </script>
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

  const lsKey = id => 'dlh-flash:' + id;
  function loadBoxes(id) { try { return JSON.parse(localStorage.getItem(lsKey(id))) || {}; } catch (e) { return {}; } }
  function saveBoxes(id, b) { try { localStorage.setItem(lsKey(id), JSON.stringify(b)); } catch (e) {} }

  function injectStyles() {
    if (document.getElementById('dlh-flash-styles')) return;
    const css = `
.df{--df-accent:#a78bfa;--df-good:#34d399;--df-bad:#f87171;--df-panel:#1e293b;
   --df-border:#334155;--df-muted:#94a3b8;--df-text:#e2e8f0;color:var(--df-text);max-width:720px;margin:0 auto}
.df *{box-sizing:border-box}
.df-card{background:var(--df-panel);border:1px solid var(--df-border);border-radius:14px;padding:22px 24px;margin-bottom:16px}
.df-h{font-size:21px;font-weight:800;color:var(--df-accent);margin:0 0 4px}
.df-sub{font-size:13px;color:var(--df-muted);margin:0 0 16px}
.df-meta{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0 18px}
.df-stat{background:#0b1426;border:1px solid var(--df-border);border-radius:10px;padding:9px 14px;min-width:84px}
.df-stat b{display:block;font-size:19px;font-weight:800;line-height:1.1}
.df-stat span{font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--df-muted)}
.df-boxes{display:flex;gap:6px;margin:6px 0 4px}
.df-box{flex:1;text-align:center;background:#0b1426;border:1px solid var(--df-border);border-radius:8px;padding:7px 0}
.df-box b{display:block;font-size:15px;font-weight:800}
.df-box span{font-size:9.5px;color:var(--df-muted);text-transform:uppercase;letter-spacing:.04em}
.df-bar{height:9px;background:#0b1426;border:1px solid var(--df-border);border-radius:6px;overflow:hidden;margin:14px 0 4px}
.df-bar i{display:block;height:100%;background:var(--df-good)}
.df-btn{font:inherit;font-size:13.5px;font-weight:700;border-radius:9px;padding:9px 18px;cursor:pointer;
   border:1px solid var(--df-border);background:#0b1426;color:var(--df-text);transition:all .12s}
.df-btn:hover{border-color:var(--df-accent)}
.df-btn.primary{background:var(--df-accent);border-color:var(--df-accent);color:#0b1020}
.df-btn.good{background:var(--df-good);border-color:var(--df-good);color:#04231a}
.df-btn.bad{background:transparent;border-color:var(--df-bad);color:var(--df-bad)}
.df-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.df-spacer{flex:1}
.df-flash{position:relative;min-height:220px;background:linear-gradient(160deg,#16223c,#0d1830);
   border:1px solid var(--df-border);border-radius:16px;display:flex;flex-direction:column;align-items:center;
   justify-content:center;text-align:center;padding:28px 26px;cursor:pointer;user-select:none;transition:border-color .15s}
.df-flash:hover{border-color:var(--df-accent)}
.df-side{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--df-muted);position:absolute;top:12px;left:16px}
.df-hint{position:absolute;top:12px;right:16px;font-size:10.5px;color:var(--df-accent);background:rgba(167,139,250,.12);padding:2px 8px;border-radius:5px}
.df-front{font-size:23px;font-weight:800;line-height:1.35}
.df-back{font-size:16px;line-height:1.6;color:#cbd5e1}
.df-tap{position:absolute;bottom:12px;font-size:11px;color:var(--df-muted)}
.df-count{font-size:12.5px;color:var(--df-muted);font-variant-numeric:tabular-nums}
.df-progwrap{height:7px;background:#0b1426;border:1px solid var(--df-border);border-radius:5px;overflow:hidden;flex:1}
.df-progwrap i{display:block;height:100%;background:var(--df-accent);transition:width .2s}
.df-done{text-align:center}
.df-done .big{font-size:46px;font-weight:800;color:var(--df-good);margin:0}
    `;
    document.head.appendChild(h('style', { id: 'dlh-flash-styles', html: css }));
  }

  function render(root, deck) {
    injectStyles();
    root.classList.add('df');
    root.style.setProperty('--df-accent', deck.accent || '#a78bfa');
    const N = deck.cards.length;
    let boxes = loadBoxes(deck.id);
    const state = { queue: [], pos: 0, flipped: false, reviewed: 0 };

    // Cards with a stable c.id (notebook-sourced decks) key their box progress
    // by that id instead of array position, so progress survives the notebook
    // list changing shape (entries added/removed) between sessions. Static
    // decks with no c.id keep the original positional-index behavior.
    function keyOf(i) { const c = deck.cards[i]; return c && c.id != null ? 'k:' + c.id : i; }
    function boxOf(i) { return boxes[keyOf(i)] || 1; }
    function mastered() { let c = 0; for (let i = 0; i < N; i++) if (boxOf(i) >= 5) c++; return c; }
    function screen(node) { root.innerHTML = ''; root.appendChild(node); window.scrollTo(0, 0); }

    /* ---- landing ---- */
    function landing() {
      const m = mastered();
      const counts = [0, 0, 0, 0, 0];
      for (let i = 0; i < N; i++) counts[boxOf(i) - 1]++;

      const boxesEl = h('div', { class: 'df-boxes' },
        ...counts.map((c, i) => h('div', { class: 'df-box' }, h('b', null, String(c)),
          h('span', null, i === 4 ? 'mastered' : 'box ' + (i + 1)))));

      const card = h('div', { class: 'df-card' },
        h('h2', { class: 'df-h' }, deck.title),
        h('p', { class: 'df-sub' }, deck.subtitle || ''),
        h('div', { class: 'df-meta' },
          stat(N, 'Cards'),
          stat(m, 'Mastered'),
          stat(Math.round(m / N * 100) + '%', 'Progress')),
        h('div', { class: 'df-bar' }, h('i', { style: 'width:' + Math.round(m / N * 100) + '%' })),
        h('p', { class: 'df-sub', style: 'margin:14px 0 6px' }, 'Cards you miss come back sooner; cards you know move up a box and appear less. Master all ' + N + ' to clear the deck.'),
        boxesEl,
        h('div', { class: 'df-row', style: 'margin-top:18px' },
          h('button', { class: 'df-btn primary', onclick: () => start(false) }, '▶ Study (weak cards first)'),
          h('button', { class: 'df-btn', onclick: () => start(true) }, '🔀 Shuffle all'),
          h('span', { class: 'df-spacer' }),
          h('button', { class: 'df-btn bad', onclick: reset }, 'Reset progress')));
      screen(card);
    }
    function stat(v, l) { return h('div', { class: 'df-stat' }, h('b', null, String(v)), h('span', null, l)); }

    function reset() { boxes = {}; saveBoxes(deck.id, boxes); landing(); }

    /* ---- start a session ---- */
    function start(shuffleAll) {
      let order = deck.cards.map((_, i) => i);
      if (shuffleAll) order = shuffle(order);
      else order = shuffle(order).sort((a, b) => boxOf(a) - boxOf(b)); // weak (low box) first
      state.queue = order; state.pos = 0; state.flipped = false; state.reviewed = 0;
      study();
    }

    /* ---- study a card ---- */
    function study() {
      if (state.pos >= state.queue.length) return done();
      const idx = state.queue[state.pos];
      const c = deck.cards[idx];

      const top = h('div', { class: 'df-row', style: 'margin-bottom:12px' },
        h('span', { class: 'df-count' }, 'Card ' + (state.pos + 1) + ' / ' + state.queue.length),
        h('span', { class: 'df-progwrap' }, h('i', { style: 'width:' + (state.pos / state.queue.length * 100) + '%' })),
        h('span', { class: 'df-count' }, 'box ' + boxOf(idx)));

      const flash = h('div', { class: 'df-flash' },
        h('span', { class: 'df-side' }, state.flipped ? 'answer' : 'prompt'),
        c.hint && !state.flipped ? h('span', { class: 'df-hint' }, c.hint) : null,
        state.flipped
          ? h('div', { class: 'df-back' }, c.back)
          : h('div', { class: 'df-front' }, c.front),
        h('span', { class: 'df-tap' }, state.flipped ? 'tap to flip back' : 'tap to reveal'),
        // c.link (notebook-sourced decks): a jump back to the original lesson
        // section, preserving dual coding — the saved fact is never just text.
        c.link ? h('a', {
          class: 'dnb-link-chip', href: c.link.href || '#',
          onclick: (e) => { e.stopPropagation(); if (c.link.onNavigate) { e.preventDefault(); c.link.onNavigate(); } }
        }, '↗ ' + (c.link.label || 'Learn more')) : null);
      flash.addEventListener('click', () => { state.flipped = !state.flipped; study(); });

      let controls;
      if (state.flipped) {
        controls = h('div', { class: 'df-row', style: 'margin-top:14px' },
          h('button', { class: 'df-btn bad', onclick: () => rate(idx, false) }, '✗ Review again'),
          h('span', { class: 'df-spacer' }),
          h('button', { class: 'df-btn good', onclick: () => rate(idx, true) }, '✓ Got it'));
      } else {
        controls = h('div', { class: 'df-row', style: 'margin-top:14px' },
          h('button', { class: 'df-btn', onclick: () => { state.flipped = true; study(); } }, 'Reveal answer'),
          h('span', { class: 'df-spacer' }),
          h('button', { class: 'df-btn', onclick: skip }, 'Skip →'));
      }

      screen(h('div', null, h('div', { class: 'df-card' }, top, flash, controls)));
    }

    function rate(idx, known) {
      boxes[keyOf(idx)] = known ? Math.min(5, boxOf(idx) + 1) : 1;
      saveBoxes(deck.id, boxes);
      if (global.DevHubStreak) global.DevHubStreak.touch();
      state.reviewed++;
      state.flipped = false; state.pos++;
      study();
    }
    function skip() { state.flipped = false; state.pos++; study(); }

    /* ---- done ---- */
    function done() {
      const m = mastered();
      screen(h('div', { class: 'df-card df-done' },
        h('p', { class: 'big' }, m + ' / ' + N),
        h('p', { class: 'df-sub' }, 'cards mastered (box 5)'),
        h('div', { class: 'df-bar', style: 'max-width:360px;margin:14px auto' }, h('i', { style: 'width:' + Math.round(m / N * 100) + '%' })),
        h('p', { class: 'df-sub' }, 'You reviewed ' + state.reviewed + ' card' + (state.reviewed === 1 ? '' : 's') + ' this session.'),
        h('div', { class: 'df-row', style: 'justify-content:center;margin-top:18px' },
          h('button', { class: 'df-btn primary', onclick: () => start(false) }, '↻ Study again'),
          h('button', { class: 'df-btn', onclick: landing }, 'Back to deck'))));
    }

    landing();
  }

  // loadBoxes/saveBoxes/injectStyles are exported so devhub-notebook-review.js's
  // Quiz Me / Interleaved modes can share the exact same Leitner box storage
  // (same key scheme, same "mastery" number) and visual language as flashcards,
  // without duplicating either the spaced-repetition state or the .df-* CSS.
  global.DevHubFlash = { render: render, loadBoxes: loadBoxes, saveBoxes: saveBoxes, injectStyles: injectStyles };
})(window);
