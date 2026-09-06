/* ============================================================================
 * devhub-hf-check.js — "quick knowledge check": inline active recall.
 *
 * The Head First bar (CLAUDE.md rule 4) asks the learner to PREDICT before
 * anything is revealed. These sit midway through a lesson, not at the end:
 * a single question about the thing just explained, answered in one tap, with
 * the reasoning revealed for EVERY option — including the ones not chosen,
 * because "why the tempting wrong answer is wrong" is where the learning is.
 *
 * Deliberately not a quiz: no score, no gating, no progress written anywhere.
 * It is a beat in the page, and it can be answered again immediately.
 *
 * DECLARATIVE — no per-page JS. Markup:
 *
 *   <div class="hf-check" data-answer="1">
 *     <p class="q">Which duck can fly?</p>
 *     <button type="button">RubberDuck</button>
 *     <button type="button">MallardDuck</button>
 *     <p class="why" data-for="0">Rubber ducks inherited fly() — that's the bug.</p>
 *     <p class="why" data-for="1">It holds FlyWithWings, so performFly() delegates there.</p>
 *   </div>
 *
 * data-answer is the 0-based index of the correct button. Every .why is
 * hidden until an answer is picked, then the one for the CHOSEN option shows,
 * plus the correct one if a wrong option was picked.
 *
 * USAGE: <script src="devhub-hf-check.js"></script> once per page.
 * ========================================================================== */
(function () {
  'use strict';

  function wire(box) {
    if (box.dataset.hfWired) return;
    box.dataset.hfWired = '1';

    var answer = parseInt(box.getAttribute('data-answer'), 10);
    var buttons = Array.prototype.slice.call(box.querySelectorAll('button'));
    var whys = Array.prototype.slice.call(box.querySelectorAll('.why'));
    if (!buttons.length || isNaN(answer)) return;

    // A screen reader should be told the reveal happened, not just sighted users.
    var live = document.createElement('p');
    live.className = 'hf-check-verdict';
    live.setAttribute('role', 'status');
    live.hidden = true;
    box.appendChild(live);

    function reset() {
      buttons.forEach(function (b) { b.className = ''; b.setAttribute('aria-pressed', 'false'); });
      whys.forEach(function (w) { w.hidden = true; });
      live.hidden = true;
      box.classList.remove('answered');
    }

    buttons.forEach(function (btn, i) {
      btn.setAttribute('aria-pressed', 'false');
      btn.addEventListener('click', function () {
        reset();
        box.classList.add('answered');
        if (window.DevHubStreak) window.DevHubStreak.touch();
        var right = i === answer;
        btn.className = right ? 'right' : 'wrong';
        btn.setAttribute('aria-pressed', 'true');
        // Always mark the correct one, so a wrong pick still ends up informed.
        if (!right) buttons[answer].className = 'right';

        whys.forEach(function (w) {
          var forIdx = parseInt(w.getAttribute('data-for'), 10);
          w.hidden = !(forIdx === i || forIdx === answer);
        });

        live.textContent = right ? 'Correct.' : 'Not quite — the highlighted answer is the one.';
        live.hidden = false;
      });
    });

    reset();
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('.hf-check'), wire);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Exposed so a page that injects checks later can re-scan.
  window.DevHubCheck = { init: init };
})();
