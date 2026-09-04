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

7. **Every code snippet explained line-by-line, in depth.** Bobby has asked "many many many
   times": a one-sentence intro above a code block fails the bar. Each line gets explained —
   via `DevHubCodeWalk`, a per-line annotation column, or `.hf-arrow` notes into the code.
   Never assume the student knows what they're looking at.
8. **IDE-grade syntax coloring on ALL code.** No plain white-text code blocks anywhere.
   `frontend/devhub-syntax.js` auto-colorizes static `<pre>` blocks — include it on every
   page that shows code (it's on all 231 pre-bearing pages; add it to new ones).
9. **Colored / manipulated text as a memory device.** Use the Head First kit in `devhub.css`
   (`.hf-big` mnemonics, `.hf-note` sticky notes, `.hf-arrow` annotations, `.hf-brain` boxes,
   `.hf-qa`, `.hf-vs` contrast panels, `.hf-mark` marker highlights, `.hf-g/r/a/v/c` colored
   spans). Bold text inside intro cards gets a marker sweep automatically.

**Periodic audit directive:** when Bobby asks to "make the app better" or on any sweep,
scan for thin lessons — pages that teach a concept only one way, have no memory hooks, or
read like documentation instead of teaching — and bring them up to this bar. This is a
standing goal, not a one-time task. The full Head First rollout state lives in
`docs/ROADMAP.md` ("ACTIVE BACKLOG — Bobby's feedback pass").

## Key conventions (see docs/DEVHUB-GUIDE.md for the full map)

- New visualizer pages: clone a recent VERTICAL chip-engine page (node-auth, aspnet-auth,
  mulesoft, laravel, rails, rust-web) — not go-http-server's horizontal engine.
- Register pages in `frontend/tracks-data.js` + the `TRACKS`/`CATEGORIES` wiring in
  `frontend/app.html`; update page/track counts in `README.md` + `docs/DEVHUB-GUIDE.md`.
- Exams: length-bracketed choices, no position/length tells — audit with
  `frontend/tmp_examtell_audit.mjs` after any bank edit.
- Validate pages with `node frontend/tmp_vcheck.mjs` (encoding, registry both ways,
  required shared scripts, internal links, duplicate registrations — under a second for
  the whole site). `.github/workflows/deploy.yml` gates the Pages deploy on it, so a red
  vcheck blocks the deploy. There is no `tmp_audit.mjs`; that reference was stale.
- Parsing is not running: vcheck proves inline scripts PARSE, so also sweep the browser
  with `node frontend/tmp_smoke.mjs` (uncaught errors + horizontal overflow at 390px;
  network-only failures are reported separately because a sandbox with no CDN fails every
  CDN load). `node frontend/tmp_assetcheck.mjs <ref>` fails on any LOSS of a teaching
  asset (tryit/CodeWalk/rt-stage/quiz/flashcards) versus a git ref — run it after any
  bulk edit that splices markup.
- Find thin lessons with `node frontend/tmp_hfaudit.mjs` (`--track=`, `--top=`, `--json=`).
  It scores every lesson page against the nine-point standard above and ranks the thinnest
  first. It reads MARKUP, not meaning — a low score means "go look", never a verdict, and a
  high score means "has the parts", never "is good".
- Long tokens must WRAP in prose and SCROLL in code blocks. `:not(pre) > code` wraps inline
  chips; `<pre>` and `.cw-code` keep `overflow-x:auto`. Text clipped inside a non-scrolling
  box is invisible to a page-level overflow check — tmp_smoke.mjs reports it separately.
- Check theme legibility with `node frontend/tmp_contrast.mjs` (`--theme=cream|dark`,
  `--pages=`, `--inject=candidate.css` to try a fix without editing the site). It reports
  text under 2.2:1 grouped by selector, so you fix causes not instances. The 2.2 floor is
  deliberately below WCAG's 4.5 — this gate is for "invisible", not "could be crisper".
- Screenshot design changes with `node frontend/tmp_shot.mjs <page.html>` (phone + desktop).
- Opt a page into the Head First kit with `node frontend/tmp_hfapply.mjs <page.html>`
  (`--check` dry-runs, `--revert` undoes).
- Docs are a first-class deliverable: update `README.md` + `docs/DEVHUB-GUIDE.md` +
  `docs/ROADMAP.md` with the code, same commit.
- During long build runs: don't commit per batch — build continuously, commit once at the
  end. Never prefix git commands with `cd`.
- Bobby's environment sometimes shadow-edits `app.html`/docs mid-session — re-Read before
  Edit.
- Theme rules in `devhub-hf.css` must be written
  `:is([data-theme="cream"],[data-theme="light"])[data-hf] .thing` — NEVER
  `[data-theme="cream"][data-hf],[data-theme="light"][data-hf] .thing`. The comma makes
  that a bare root selector plus a light-only rule, so the cream half matches nothing and
  the declarations leak onto `<html>`. It silently killed the entire component half of the
  cream variant once already.
- The cream theme has TWO halves: `devhub-hf.css`'s cream block + repair layer
  (shared components), and the runtime pass in `devhub-hf-theme.js` (per-page
  `<style>` blocks, which CSS cannot reach because it cannot query a computed
  background). If cream text goes unreadable, check which half owns it before
  writing a rule — a per-page dark ground is the runtime pass's job, not CSS's.
- Shared JS engines must be SELF-CONTAINED: inject their own critical CSS (id-guarded
  `<style>`) instead of assuming `devhub.css` is linked — 14 index/landing pages don't link
  it, which is exactly how the giant-ripple layout bug happened.
