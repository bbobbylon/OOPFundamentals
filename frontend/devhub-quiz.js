/* ============================================================================
 * devhub-quiz.js — DevHub's reusable practice-exam / quiz engine.
 *
 * One engine, many banks. A page supplies a question bank; this file renders
 * the whole experience: a landing card, Practice mode (instant feedback +
 * explanation) and Exam mode (timed, scored, pass/fail), a per-domain
 * breakdown so a learner sees *which* areas are weak, a review screen, and a
 * localStorage attempt history (best score + recent attempts).
 *
 * USAGE (from a standalone page, loaded in the hub iframe):
 *
 *   <div id="quiz"></div>
 *   <script src="devhub-quiz.js"></script>
 *   <script>
 *     DevHubQuiz.render(document.getElementById('quiz'), {
 *       id:        'aws-developer',          // stable key for localStorage
 *       title:     'AWS Certified Developer – Associate',
 *       cert:      'DVA-C02 · practice exam',
 *       accent:    '#a78bfa',                // optional theme colour
 *       passPct:   72,                       // pass threshold (real DVA-C02 ≈ 72%)
 *       examCount: 20,                       // # questions in an Exam attempt
 *       timeLimitMin: 30,                    // Exam-mode countdown
 *       questions: [ {…}, {…} ]              // the bank (see QUESTION FORMAT)
 *     });
 *   </script>
 *
 * QUESTION FORMAT:
 *   {
 *     id: 'iam-1',                  // unique within the bank
 *     domain: 'Security & IAM',     // used for the per-domain breakdown
 *     difficulty: 'medium',         // 'easy' | 'medium' | 'hard' (display only)
 *     stem: 'Your ECS task needs…', // the question (plain text)
 *     code: null,                   // optional code/snippet string (monospace block)
 *     choices: ['A…','B…','C…','D…'],
 *     answer: 1,                    // index of the correct choice
 *                                   //   …or [0,2] for a multi-select question
 *     multi: false,                 // true → checkboxes, partial credit not given
 *     explanation: 'Use a task role…',   // the big-picture teaching point
 *     why: [                        // OPTIONAL but strongly encouraged: one line
 *       'Wrong — instance roles…',  // per choice, same order as `choices`.
 *       'Right — task roles are…',  // After answering (practice) and in the
 *       'Wrong — env vars leak…',   // review screen, EVERY option shows its own
 *       'Wrong — user keys are…'    // reason, not just the correct one.
 *     ],
 *     ref: { label: 'IAM visualizer', file: 'aws-iam-visualizer.html' } // optional
 *   }
 * ========================================================================== */
(function (global) {
  'use strict';

  /* ---- tiny DOM helper: h('div', {class:'x'}, child, child) ------------- */
  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    if (props) {
      for (const k in props) {
        if (k === 'class') el.className = props[k];
        else if (k === 'html') el.innerHTML = props[k];
        else if (k.startsWith('on') && typeof props[k] === 'function') el.addEventListener(k.slice(2), props[k]);
        else if (props[k] != null) el.setAttribute(k, props[k]);
      }
    }
    for (const kid of kids.flat()) {
      if (kid == null || kid === false) continue;
      el.appendChild(typeof kid === 'string' ? document.createTextNode(kid) : kid);
    }
    return el;
  }

  /* ---- Fisher–Yates shuffle (returns a new array) ---------------------- */
  function shuffle(src) {
    const a = src.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ---- localStorage attempt history (per bank id) ---------------------- */
  const lsKey = id => 'dlh-quiz:' + id;
  /** Every attempt ever recorded for one bank, newest first (see saveAttempt). A corrupt
   *  or absent entry reads as "no attempts" rather than throwing — a learner with wiped
   *  storage gets a fresh exam, never a broken page. */
  function loadHistory(id) {
    try { return JSON.parse(localStorage.getItem(lsKey(id))) || []; }
    catch (e) { return []; }
  }
  /** Prepend one finished attempt and keep only the newest 25: history is a motivator,
   *  not an archive, and an unbounded array in one localStorage key is how a heavy user
   *  hits quota and loses the whole bank's history at once. A full quota fails silently —
   *  the score is already on screen; only the record of it is lost. */
  function saveAttempt(id, attempt) {
    const hist = loadHistory(id);
    hist.unshift(attempt);
    try { localStorage.setItem(lsKey(id), JSON.stringify(hist.slice(0, 25))); } catch (e) {}
  }
  /** Highest percentage ever scored on this bank, 0 if never attempted. Drives the
   *  "best: N%" badge on the start screen and the readiness dashboard in
   *  exam-readiness.html, which compares it against the bank's passPct. */
  function bestScore(id) {
    return loadHistory(id).reduce((m, a) => Math.max(m, a.pct), 0);
  }

  /* ---- shuffle a question's choices, remapping the answer index -------- */
  function prepare(q) {
    const order = shuffle(q.choices.map((_, i) => i));
    const choices = order.map(i => q.choices[i]);
    // per-option "why" lines must follow their choice through the shuffle
    const why = Array.isArray(q.why) ? order.map(i => q.why[i]) : null;
    let answer;
    if (q.multi) {
      const set = new Set(q.answer);
      answer = order.map((orig, disp) => (set.has(orig) ? disp : -1)).filter(i => i >= 0);
    } else {
      answer = order.indexOf(q.answer);
    }
    return Object.assign({}, q, { choices, answer, why });
  }

  /* ---- inject the engine's stylesheet once ----------------------------- */
  function injectStyles() {
    if (document.getElementById('dlh-quiz-styles')) return;
    const css = `
.dq{--dq-accent:#a78bfa;--dq-good:#34d399;--dq-bad:#f87171;--dq-panel:#1e293b;
    --dq-bg:#0f172a;--dq-border:#334155;--dq-muted:#94a3b8;--dq-text:#e2e8f0;
    color:var(--dq-text);max-width:860px;margin:0 auto}
.dq *{box-sizing:border-box}
.dq-card{background:var(--dq-panel);border:1px solid var(--dq-border);border-radius:14px;padding:24px 26px;margin-bottom:18px}
.dq-h{font-size:22px;font-weight:800;color:var(--dq-accent);margin:0 0 4px}
.dq-sub{font-size:13px;color:var(--dq-muted);margin:0 0 18px}
.dq-meta{display:flex;flex-wrap:wrap;gap:10px;margin:16px 0 20px}
.dq-stat{background:#0b1426;border:1px solid var(--dq-border);border-radius:10px;padding:10px 14px;min-width:92px}
.dq-stat b{display:block;font-size:20px;font-weight:800;color:var(--dq-text);line-height:1.1}
.dq-stat span{font-size:10.5px;text-transform:uppercase;letter-spacing:.05em;color:var(--dq-muted)}
.dq-modes{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:620px){.dq-modes{grid-template-columns:1fr}.dq-meta{gap:8px}}
.dq-mode{text-align:left;background:#0b1426;border:1px solid var(--dq-border);border-radius:12px;
    padding:16px 18px;cursor:pointer;transition:border-color .15s,transform .1s;color:inherit;font:inherit;width:100%}
.dq-mode:hover{border-color:var(--dq-accent);transform:translateY(-1px)}
.dq-mode h4{margin:0 0 6px;font-size:15px;color:var(--dq-text)}
.dq-mode p{margin:0;font-size:12.5px;color:var(--dq-muted);line-height:1.6}
.dq-mode .ico{font-size:20px;margin-bottom:6px;display:block}
.dq-domains{margin:18px 0 0}
.dq-domains h5{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--dq-muted);margin:0 0 8px}
.dq-domrow{display:flex;align-items:center;gap:10px;font-size:12.5px;padding:3px 0}
.dq-bar{flex:1;height:7px;background:#0b1426;border-radius:5px;overflow:hidden}
.dq-bar i{display:block;height:100%;background:var(--dq-accent)}
.dq-domrow .pct{width:42px;text-align:right;color:var(--dq-muted);font-variant-numeric:tabular-nums}
.dq-domrow .nm{width:170px;color:var(--dq-text)}
@media(max-width:620px){.dq-domrow .nm{width:120px}}
.dq-topbar{display:flex;align-items:center;gap:12px;margin-bottom:14px}
.dq-prog{flex:1;height:8px;background:#0b1426;border:1px solid var(--dq-border);border-radius:6px;overflow:hidden}
.dq-prog i{display:block;height:100%;background:var(--dq-accent);transition:width .25s}
.dq-count{font-size:12.5px;color:var(--dq-muted);white-space:nowrap;font-variant-numeric:tabular-nums}
.dq-timer{font-size:13px;font-weight:700;color:var(--dq-text);font-variant-numeric:tabular-nums;
    background:#0b1426;border:1px solid var(--dq-border);border-radius:7px;padding:4px 10px}
.dq-timer.warn{color:var(--dq-bad);border-color:var(--dq-bad)}
.dq-dchip{display:inline-block;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;
    color:var(--dq-accent);background:rgba(167,139,250,.12);border-radius:5px;padding:2px 8px;margin-bottom:10px}
.dq-stem{font-size:16px;line-height:1.55;font-weight:600;margin:0 0 4px}
.dq-code{background:#0b1426;border:1px solid var(--dq-border);border-radius:8px;padding:12px 14px;margin:12px 0;
    font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12.5px;color:#cbd5e1;
    white-space:pre-wrap;line-height:1.6;overflow-x:auto}
.dq-choice{display:flex;gap:11px;align-items:flex-start;background:#0b1426;border:1px solid var(--dq-border);
    border-radius:10px;padding:12px 14px;margin:9px 0;cursor:pointer;transition:border-color .12s,background .12s;
    font-size:14px;line-height:1.5}
.dq-choice:hover{border-color:var(--dq-accent)}
.dq-choice.sel{border-color:var(--dq-accent);background:rgba(167,139,250,.08)}
.dq-choice.correct{border-color:var(--dq-good);background:rgba(52,211,153,.10)}
.dq-choice.wrong{border-color:var(--dq-bad);background:rgba(248,113,113,.10)}
.dq-choice.locked{cursor:default}
.dq-choice:focus-visible{outline:2px solid var(--dq-accent);outline-offset:2px}
.dq-kbd{margin-top:10px;font-size:11px;color:var(--dq-muted);text-align:center;font-family:ui-monospace,monospace}
.dq-key{flex-shrink:0;width:24px;height:24px;border-radius:6px;border:1px solid var(--dq-border);
    display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--dq-muted)}
.dq-choice.sel .dq-key{background:var(--dq-accent);color:#0b1020;border-color:var(--dq-accent)}
.dq-choice.correct .dq-key{background:var(--dq-good);color:#04231a;border-color:var(--dq-good)}
.dq-choice.wrong .dq-key{background:var(--dq-bad);color:#2a0a0a;border-color:var(--dq-bad)}
.dq-why{display:block;font-size:12px;line-height:1.55;margin-top:7px;padding-top:7px;
    border-top:1px dashed var(--dq-border);color:var(--dq-muted)}
.dq-why.good{color:#6ee7b7}
.dq-why.bad{color:#fca5a5}
.dq-rev-why{font-size:11.5px;color:var(--dq-muted);line-height:1.5;margin:2px 0 5px 20px;
    padding-left:9px;border-left:2px solid var(--dq-border)}
.dq-expl{border-left:3px solid var(--dq-accent);background:#0b1426;border-radius:0 8px 8px 0;
    padding:11px 15px;margin:14px 0 4px;font-size:13px;line-height:1.6;color:#cbd5e1}
.dq-expl b{color:var(--dq-text)}
.dq-expl a{color:var(--dq-accent);text-decoration:none;font-weight:700}
.dq-expl a:hover{text-decoration:underline}
.dq-nav{display:flex;align-items:center;gap:10px;margin-top:18px}
.dq-btn{font:inherit;font-size:13.5px;font-weight:700;border-radius:9px;padding:9px 18px;cursor:pointer;
    border:1px solid var(--dq-border);background:#0b1426;color:var(--dq-text);transition:all .12s}
.dq-btn:hover{border-color:var(--dq-accent)}
.dq-btn.primary{background:var(--dq-accent);border-color:var(--dq-accent);color:#0b1020}
.dq-btn.primary:hover{filter:brightness(1.08)}
.dq-btn:disabled{opacity:.4;cursor:not-allowed}
.dq-btn.ghost{background:transparent}
.dq-spacer{flex:1}
.dq-flag{font-size:12.5px;color:var(--dq-muted);cursor:pointer;user-select:none}
.dq-flag.on{color:#fbbf24}
.dq-score{font-size:54px;font-weight:800;line-height:1;margin:0}
.dq-verdict{font-size:16px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;margin:8px 0 0}
.dq-verdict.pass{color:var(--dq-good)}
.dq-verdict.fail{color:var(--dq-bad)}
.dq-rev-q{background:#0b1426;border:1px solid var(--dq-border);border-radius:10px;padding:13px 15px;margin:10px 0}
.dq-rev-q .qs{font-size:13.5px;font-weight:600;margin:0 0 8px;line-height:1.5}
.dq-rev-opt{font-size:12.5px;padding:3px 0;color:var(--dq-muted);line-height:1.5}
.dq-rev-opt.c{color:var(--dq-good)}
.dq-rev-opt.x{color:var(--dq-bad)}
.dq-hist{font-size:12.5px;color:var(--dq-muted)}
.dq-hist div{padding:3px 0;border-top:1px solid var(--dq-border);display:flex;gap:10px}
.dq-hist .g{color:var(--dq-good)}.dq-hist .r{color:var(--dq-bad)}
    `;
    document.head.appendChild(h('style', { id: 'dlh-quiz-styles', html: css }));
  }

  /* ---- navigate the parent hub to another visualizer page -------------- */
  function gotoPage(file) {
    try { global.parent.postMessage({ type: 'dlh-navigate', file: file }, '*'); }
    catch (e) {}
    // Fallback when opened standalone (not inside the hub iframe):
    if (global.parent === global) global.location.href = file + (file.includes('#') ? '' : '');
  }

  /** Seconds → "M:SS" for the exam countdown. Minutes are NOT zero-padded and are not
   *  capped at 60, so a 90-minute exam reads "90:00" rather than wrapping to "30:00". */
  function fmtTime(sec) {
    const m = Math.floor(sec / 60), s = sec % 60;
    return m + ':' + String(s).padStart(2, '0');
  }

  /* ====================================================================== */
  /*  Main entry point                                                      */
  /* ====================================================================== */
  function render(root, bank) {
    injectStyles();
    const accent = bank.accent || '#a78bfa';
    root.classList.add('dq');
    root.style.setProperty('--dq-accent', accent);

    const state = {
      screen: 'landing',   // 'landing' | 'question' | 'results' — gates the keyboard handler
      mode: null, qs: [], idx: 0, answers: [], flags: new Set(),
      timerId: null, remaining: 0
    };

    /* clear + paint a fresh screen */
    function screen(node) {
      if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }
      root.innerHTML = '';
      root.appendChild(node);
      root.scrollIntoView ? window.scrollTo(0, 0) : null;
    }

    /* ---------------- LANDING ---------------- */
    function landing() {
      state.screen = 'landing';
      const hist = loadHistory(bank.id);
      const best = bestScore(bank.id);
      const total = bank.questions.length;
      const examN = Math.min(bank.examCount || 20, total);

      const meta = h('div', { class: 'dq-meta' },
        statBox(total, 'Questions'),
        statBox(examN, 'Per exam'),
        statBox(bank.passPct + '%', 'To pass'),
        statBox((bank.timeLimitMin || 30) + 'm', 'Time limit'),
        statBox(hist.length ? best + '%' : '—', 'Your best')
      );

      // Last attempt's misses, surfaced here so a learner who left and came
      // back can still jump straight to exactly what tripped them up.
      const lastMissed = hist.length && Array.isArray(hist[0].missed) ? hist[0].missed : [];

      const modes = h('div', { class: 'dq-modes' },
        h('button', { class: 'dq-mode', onclick: () => start('practice') },
          h('span', { class: 'ico' }, '📚'),
          h('h4', null, 'Practice mode'),
          h('p', null, 'Untimed. Every question gives instant feedback and a full explanation with a link to the matching visualizer. Best for learning.')
        ),
        h('button', { class: 'dq-mode', onclick: () => start('exam') },
          h('span', { class: 'ico' }, '⏱️'),
          h('h4', null, 'Exam mode'),
          h('p', null, `${examN} random questions, ${bank.timeLimitMin || 30}-minute timer, scored at the end against the ${bank.passPct}% pass mark — just like the real thing.`)
        )
      );
      const retryMode = lastMissed.length
        ? h('button', { class: 'dq-mode', style: 'margin-top:12px', onclick: () => startRetry(lastMissed) },
            h('span', { class: 'ico' }, '🎯'),
            h('h4', null, `Retry ${lastMissed.length} missed question${lastMissed.length === 1 ? '' : 's'}`),
            h('p', null, 'From your last attempt — the exact ones you got wrong, not a fresh random draw.')
          )
        : null;

      const domainNames = [...new Set(bank.questions.map(q => q.domain))];
      const domainList = h('div', { class: 'dq-domains' },
        h('h5', null, 'Domains covered'),
        ...domainNames.map(d => {
          const c = bank.questions.filter(q => q.domain === d).length;
          return h('div', { class: 'dq-domrow' },
            h('span', { class: 'nm' }, d),
            h('span', { class: 'dq-bar' }, h('i', { style: `width:${Math.round(c / total * 100)}%` })),
            h('span', { class: 'pct' }, c + ' Q')
          );
        })
      );

      const card = h('div', { class: 'dq-card' },
        h('h2', { class: 'dq-h' }, bank.title),
        h('p', { class: 'dq-sub' }, bank.cert || ''),
        meta, modes, retryMode, domainList
      );

      const children = [card];
      if (hist.length) children.push(historyCard(hist));
      screen(h('div', null, ...children));
    }

    /** One number-over-caption tile in the start screen's stat row (questions, pass mark,
     *  best score). Presentational only — every caller computes the value itself. */
    function statBox(value, label) {
      return h('div', { class: 'dq-stat' }, h('b', null, String(value)), h('span', null, label));
    }

    /** The "Recent attempts" panel: the six newest attempts as score / mode / date rows,
     *  each coloured green or red against this bank's passPct. Rendered only when at least
     *  one attempt exists, so a first-time learner sees no empty shell. */
    function historyCard(hist) {
      return h('div', { class: 'dq-card' },
        h('h5', { class: 'dq-domains', style: 'margin:0 0 10px' },
          h('span', { style: 'font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--dq-muted)' }, 'Recent attempts')),
        h('div', { class: 'dq-hist' },
          ...hist.slice(0, 6).map(a => h('div', null,
            h('span', { class: a.pct >= bank.passPct ? 'g' : 'r', style: 'width:54px;font-weight:700' }, a.pct + '%'),
            h('span', { style: 'width:80px' }, a.mode === 'exam' ? '⏱️ Exam' : a.mode === 'retry' ? '🎯 Retry' : '📚 Practice'),
            h('span', { style: 'flex:1' }, `${a.correct}/${a.total} correct`),
            h('span', null, new Date(a.at).toLocaleDateString())
          ))
        )
      );
    }

    /* ---------------- START AN ATTEMPT ---------------- */
    function start(mode) {
      state.mode = mode;
      state.idx = 0;
      state.flags = new Set();
      let pool = shuffle(bank.questions);
      if (mode === 'exam') pool = pool.slice(0, Math.min(bank.examCount || 20, pool.length));
      state.qs = pool.map(prepare);
      state.answers = state.qs.map(() => null);
      if (mode === 'exam') {
        state.remaining = (bank.timeLimitMin || 30) * 60;
      }
      question();
    }

    /* ---------------- RETRY JUST THE MISSED QUESTIONS ---------------- */
    // Draws from an explicit id set (either the attempt just finished, in
    // this same session, or the last saved attempt's `missed` list from the
    // landing screen) rather than a fresh random draw — hitting them again
    // used to be pure chance, since a retake reshuffles the whole bank.
    function startRetry(ids) {
      const set = new Set(ids);
      const pool = bank.questions.filter(q => set.has(q.id));
      if (!pool.length) return landing();
      state.mode = 'retry';
      state.idx = 0;
      state.flags = new Set();
      state.qs = shuffle(pool).map(prepare);
      state.answers = state.qs.map(() => null);
      question();
    }

    /* ---------------- QUESTION SCREEN ---------------- */
    function question() {
      state.screen = 'question';
      const q = state.qs[state.idx];
      const given = state.answers[state.idx];
      const answered = given != null;
      // Retry mode is a learning tool like practice: reveal instantly, don't
      // gate behind a timer or a final score.
      const isPractice = state.mode === 'practice' || state.mode === 'retry';
      const locked = isPractice && answered;   // practice locks after answering

      // top bar: progress + (exam) timer
      const topbar = h('div', { class: 'dq-topbar' },
        h('span', { class: 'dq-prog' }, h('i', { style: `width:${(state.idx) / state.qs.length * 100}%` })),
        h('span', { class: 'dq-count' }, `${state.idx + 1} / ${state.qs.length}`)
      );
      if (state.mode === 'exam') {
        const t = h('span', { class: 'dq-timer' + (state.remaining <= 60 ? ' warn' : '') }, fmtTime(state.remaining));
        topbar.appendChild(t);
        if (!state.timerId) {
          state.timerId = setInterval(() => {
            state.remaining--;
            t.textContent = fmtTime(state.remaining);
            if (state.remaining <= 60) t.classList.add('warn');
            if (state.remaining <= 0) { clearInterval(state.timerId); state.timerId = null; finish(); }
          }, 1000);
        }
      }

      // choices — real radio/checkbox semantics, not bare styled divs: across
      // 19 exams / 560 questions these had no role, no tabindex and no checked
      // state, so a screen reader heard prose and a keyboard could not answer.
      const keys = 'ABCDEFGH';
      const choiceEls = q.choices.map((text, i) => {
        const body = h('span', { style: 'flex:1' }, text);
        const selected = q.multi ? (Array.isArray(given) && given.includes(i)) : given === i;
        const el = h('div', {
          class: 'dq-choice',
          role: q.multi ? 'checkbox' : 'radio',
          'aria-checked': selected ? 'true' : 'false',
          tabindex: locked ? null : 0,
        },
          h('span', { class: 'dq-key' }, keys[i]),
          body
        );
        if (selected) el.classList.add('sel');
        if (locked) {
          el.classList.add('locked');
          el.setAttribute('aria-disabled', 'true');
          const correct = q.multi ? q.answer.includes(i) : q.answer === i;
          if (correct) el.classList.add('correct');
          else if (selected) el.classList.add('wrong');
          // per-option reasoning: every choice explains itself once revealed
          if (q.why && q.why[i])
            body.appendChild(h('span', { class: 'dq-why ' + (correct ? 'good' : 'bad') },
              (correct ? '✓ ' : '✗ ') + q.why[i]));
        } else {
          el.addEventListener('click', () => choose(i));
          el.addEventListener('keydown', ev => {
            if (ev.key === ' ' || ev.key === 'Enter') { ev.preventDefault(); choose(i); }
          });
        }
        return el;
      });

      const card = h('div', { class: 'dq-card' },
        h('span', { class: 'dq-dchip' }, q.domain + (q.difficulty ? ' · ' + q.difficulty : '')),
        h('p', { class: 'dq-stem' }, q.stem + (q.multi ? '  (select all that apply)' : '')),
        q.code ? h('pre', { class: 'dq-code' }, q.code) : null,
        h('div', {
          role: q.multi ? 'group' : 'radiogroup',
          'aria-label': q.multi ? 'Answer choices — select all that apply' : 'Answer choices',
        }, ...choiceEls)
      );

      // practice-mode explanation after answering
      if (locked) card.appendChild(explanation(q));

      // nav row
      const flag = h('span', { class: 'dq-flag' + (state.flags.has(state.idx) ? ' on' : '') },
        (state.flags.has(state.idx) ? '🚩 Flagged' : '⚐ Flag for review'));
      flag.addEventListener('click', () => {
        if (state.flags.has(state.idx)) state.flags.delete(state.idx); else state.flags.add(state.idx);
        question();
      });

      const nav = h('div', { class: 'dq-nav' },
        h('button', { class: 'dq-btn ghost', disabled: state.idx === 0 ? '' : null, onclick: prev }, '← Prev'),
        flag,
        h('span', { class: 'dq-spacer' }),
        state.idx < state.qs.length - 1
          ? h('button', { class: 'dq-btn primary', onclick: next }, 'Next →')
          : h('button', { class: 'dq-btn primary', onclick: finish }, 'Finish & score')
      );
      card.appendChild(nav);
      // These shortcuts existed since v1 (see onKey below) — invisibly.
      // A shortcut nobody is told about is a feature nobody has.
      card.appendChild(h('div', { class: 'dq-kbd' }, '⌨ 1–8 pick an answer · ← → change question'));
      // topbar was built above but never attached to anything, so the
      // progress bar / count and the exam countdown never rendered — the
      // countdown still ran and could end the exam with no visible warning.
      screen(h('div', null, topbar, card));
    }

    /** The "Why:" block shown under a question once it has been answered (practice mode)
     *  or in review. When the question carries `ref: {label, file}` it also renders a
     *  "Learn more" link back to the lesson that teaches it — those refs are the SAME data
     *  tmp_genpracticemap.mjs derives the lesson→practice map from, so a bank edit that
     *  breaks a ref here also breaks a lesson's "Test yourself" strip. */
    function explanation(q) {
      const wrap = h('div', { class: 'dq-expl' });
      wrap.appendChild(h('b', null, 'Why: '));
      wrap.appendChild(document.createTextNode(q.explanation));
      if (q.ref && q.ref.file) {
        wrap.appendChild(document.createTextNode('  '));
        const a = h('a', { href: '#' }, '→ ' + (q.ref.label || 'Learn more'));
        a.addEventListener('click', e => { e.preventDefault(); gotoPage(q.ref.file); });
        wrap.appendChild(a);
      }
      return wrap;
    }

    /** Record choice `i` for the current question and re-paint. Single-answer questions
     *  store the index; `multi` questions TOGGLE membership in an array and store null
     *  when the last pick is removed, so "unanswered" stays distinguishable from "answered
     *  with nothing" for the progress count and the unanswered warning. */
    function choose(i) {
      const q = state.qs[state.idx];
      if (q.multi) {
        const cur = Array.isArray(state.answers[state.idx]) ? state.answers[state.idx].slice() : [];
        const at = cur.indexOf(i);
        if (at >= 0) cur.splice(at, 1); else cur.push(i);
        state.answers[state.idx] = cur.length ? cur : null;
      } else {
        state.answers[state.idx] = i;
      }
      question();   // re-paint (practice mode reveals the answer)
    }

    /** Move to the next question, clamped at the last one. Deliberately does NOT submit at
     *  the end — a learner who arrows past the final question should land on it again, not
     *  trigger a grade they did not ask for. */
    function next() { if (state.idx < state.qs.length - 1) { state.idx++; question(); } }
    /** Move back one question, clamped at the first. Available in exam mode too: this is a
     *  review-and-revise exam, so answers stay editable until submit. */
    function prev() { if (state.idx > 0) { state.idx--; question(); } }

    /* ---------------- SCORE A QUESTION ---------------- */
    function isCorrect(q, given) {
      if (given == null) return false;
      if (q.multi) {
        const a = q.answer.slice().sort().join(',');
        const g = (Array.isArray(given) ? given.slice() : []).sort().join(',');
        return a === g;
      }
      return given === q.answer;
    }

    /* ---------------- RESULTS ---------------- */
    function finish() {
      state.screen = 'results';
      if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }
      if (global.DevHubStreak) global.DevHubStreak.touch();

      let correct = 0;
      const missed = [];
      const byDomain = {};
      state.qs.forEach((q, i) => {
        const ok = isCorrect(q, state.answers[i]);
        if (ok) correct++; else missed.push(q.id);
        const d = byDomain[q.domain] || (byDomain[q.domain] = { c: 0, n: 0 });
        d.n++; if (ok) d.c++;
      });
      const total = state.qs.length;
      const pct = Math.round(correct / total * 100);
      const passed = pct >= bank.passPct;

      // persist the per-domain breakdown too, so the readiness dashboard can
      // surface weak areas without re-running the exam.
      const domSnapshot = {};
      Object.keys(byDomain).forEach(d => { domSnapshot[d] = { c: byDomain[d].c, n: byDomain[d].n }; });
      saveAttempt(bank.id, {
        at: Date.now(), mode: state.mode, pct, correct, total, domains: domSnapshot, missed
      });

      const domainRows = Object.keys(byDomain).sort().map(d => {
        const { c, n } = byDomain[d];
        const p = Math.round(c / n * 100);
        return h('div', { class: 'dq-domrow' },
          h('span', { class: 'nm' }, d),
          h('span', { class: 'dq-bar' }, h('i', { style: `width:${p}%;background:${p >= bank.passPct ? 'var(--dq-good)' : 'var(--dq-bad)'}` })),
          h('span', { class: 'pct' }, c + '/' + n)
        );
      });

      const head = h('div', { class: 'dq-card', style: 'text-align:center' },
        h('p', { class: 'dq-score', style: `color:${passed ? 'var(--dq-good)' : 'var(--dq-bad)'}` }, pct + '%'),
        h('p', { class: 'dq-verdict ' + (passed ? 'pass' : 'fail') }, passed ? '✓ Pass' : '✗ Below pass mark'),
        h('p', { class: 'dq-sub', style: 'margin-top:10px' },
          `${correct} of ${total} correct · pass mark ${bank.passPct}%` + (state.mode === 'exam' ? ` · ${fmtTime((bank.timeLimitMin || 30) * 60 - state.remaining)} taken` : '')),
        h('div', { class: 'dq-domains', style: 'text-align:left;max-width:520px;margin:18px auto 0' },
          h('h5', null, 'Score by domain — focus your study where the bar is red'),
          ...domainRows),
        h('div', { class: 'dq-nav', style: 'justify-content:center;margin-top:22px' },
          h('button', { class: 'dq-btn primary', onclick: () => start(state.mode) }, '↻ Retake'),
          missed.length
            ? h('button', { class: 'dq-btn', onclick: () => startRetry(missed) },
                `🎯 Retry ${missed.length} missed`)
            : null,
          h('button', { class: 'dq-btn', onclick: landing }, 'Back to overview'))
      );

      // full review of every question
      const review = h('div', { class: 'dq-card' },
        h('h5', { class: 'dq-domains', style: 'margin:0 0 12px' },
          h('span', { style: 'font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--dq-muted)' }, 'Review — all questions')),
        ...state.qs.map((q, i) => reviewItem(q, i))
      );

      screen(h('div', null, head, review));
    }

    /** One question in the post-submit review: every choice marked ✓ correct or ✗ wrongly
     *  chosen, with the bank's per-choice `why[ci]` rationale underneath when present.
     *  Renders every choice, not just the learner's — seeing why the other four are wrong
     *  is the half of retrieval practice that actually teaches. */
    function reviewItem(q, i) {
      const given = state.answers[i];
      const ok = isCorrect(q, given);
      const keys = 'ABCDEFGH';
      const opts = q.choices.map((text, ci) => {
        const correct = q.multi ? q.answer.includes(ci) : q.answer === ci;
        const chosen = q.multi ? (Array.isArray(given) && given.includes(ci)) : given === ci;
        let cls = 'dq-rev-opt';
        if (correct) cls += ' c';
        else if (chosen) cls += ' x';
        const mark = correct ? '✓ ' : (chosen ? '✗ ' : '   ');
        const row = h('div', { class: cls }, mark + keys[ci] + '. ' + text);
        if (q.why && q.why[ci])
          row.appendChild(h('div', { class: 'dq-rev-why' }, q.why[ci]));
        return row;
      });
      return h('div', { class: 'dq-rev-q' },
        h('p', { class: 'qs' }, (ok ? '✓ ' : '✗ ') + (i + 1) + '. ' + q.stem),
        ...opts,
        explanation(q)
      );
    }

    /* ---- keyboard: 1-8 select, ←/→ navigate ---- */
    function onKey(e) {
      if (state.screen !== 'question' || !state.qs.length) return;   // ignore on landing/results
      if (e.key >= '1' && e.key <= '8') {
        const i = +e.key - 1;
        const q = state.qs[state.idx];
        if (q && i < q.choices.length && !(state.mode === 'practice' && state.answers[state.idx] != null)) choose(i);
      } else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    }
    document.addEventListener('keydown', onKey);

    landing();
  }

  global.DevHubQuiz = { render: render, loadHistory: loadHistory, bestScore: bestScore };
})(window);
