# DevHub — Project Instructions

DevHub is Bobby's "zero to hero" learning platform: `frontend/app.html` is the hub, every
lesson is its own `frontend/*.html` page, `docs/DEVHUB-GUIDE.md` is the navigator, and
`docs/ROADMAP.md` tracks what's not done yet.

## The Head First teaching standard (the bar for EVERY lesson page)

Bobby wants this app to teach the way *Head First Design Patterns* does — not a reference
manual, but a book engineered for understanding and **retention**. Every lesson page, new or
existing, should be held to this bar. When touching a page (or auditing the site), check for
and add whatever is missing:

1. **Multiple approaches to the same concept.** Don't teach it once — teach it several ways:
   plain-English analogy first, then the visual/animated walk, then real code line-by-line,
   then a "when would I actually use this at work" framing (Bobby's job: full-stack CIAM —
   Spring + Angular + identity). A learner who didn't get the first explanation should catch
   the second or third.
2. **Visuals wherever a picture beats prose.** The animated scenario-walk (`rt-ctlbar`/
   `rt-stage` + live inspector), diagrams, before/after comparisons. If a paragraph describes
   something moving, changing, or flowing — it should be animated, not described.
3. **Memory hooks.** Mnemonics, catchphrases, "the one thing to remember" callouts,
   surprising/funny framings, deliberately exaggerated contrasts ("this query runs 40,000
   times; this one runs once"). Head First's redundancy-on-purpose: important ideas restated
   in a different voice in a different section.
4. **Active recall built in.** Don't just show — make the learner predict before revealing
   (the "what do you think happens next?" beat), then confirm. Quizzes/flashcards/practice
   exercises cross-linked from the lesson, not siloed.
5. **A conversational, second-person voice.** "You just built a token that never expires —
   here's how an attacker thanks you," not "Token expiry is an important consideration."
6. **The standing structural requirements** (already site convention): plain-English `.intro`
   card before any interactive part, `DevHubCodeWalk` line-by-line for code blocks, ~800ms
   animation pacing, live inspector showing real per-step data, difficulty theming.

**Periodic audit directive:** when Bobby asks to "make the app better" or on any sweep,
scan for thin lessons — pages that teach a concept only one way, have no memory hooks, or
read like documentation instead of teaching — and bring them up to this bar. This is a
standing goal, not a one-time task.

## Key conventions (see docs/DEVHUB-GUIDE.md for the full map)

- New visualizer pages: clone a recent VERTICAL chip-engine page (node-auth, aspnet-auth,
  mulesoft, laravel, rails, rust-web) — not go-http-server's horizontal engine.
- Register pages in `frontend/tracks-data.js` + the `TRACKS`/`CATEGORIES` wiring in
  `frontend/app.html`; update page/track counts in `README.md` + `docs/DEVHUB-GUIDE.md`.
- Exams: length-bracketed choices, no position/length tells — audit with
  `frontend/tmp_examtell_audit.mjs` after any bank edit.
- Validate pages with `frontend/tmp_vcheck.mjs` + `tmp_audit.mjs`.
- Docs are a first-class deliverable: update `README.md` + `docs/DEVHUB-GUIDE.md` +
  `docs/ROADMAP.md` with the code, same commit.
- During long build runs: don't commit per batch — build continuously, commit once at the
  end. Never prefix git commands with `cd`.
- Bobby's environment sometimes shadow-edits `app.html`/docs mid-session — re-Read before
  Edit.
