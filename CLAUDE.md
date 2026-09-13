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
  **When you clone, change `<body class="track-…">` to the new page's track.** It is not
  decoration: `devhub.css` and `devhub-hf.css` key each track's accent colours off it in
  both themes, and `tmp_hfaudit.mjs` reads the track from it. vcheck cannot see a wrong
  one — the page is perfectly valid, it just wears another track's palette. Four Render
  pages shipped as `track-shell` this way. Clone-and-adapt inherits more than the skeleton:
  check the body class, the `<title>`, and the "Where to go next" links.
- Register pages in `frontend/tracks-data.js` + the `TRACKS`/`CATEGORIES` wiring in
  `frontend/app.html`; update page/track counts in `README.md` + `docs/DEVHUB-GUIDE.md`.
- Exams: length-bracketed choices, no position/length tells — audit with
  `frontend/tmp_examtell_audit.mjs` after any bank edit. Also rerun
  `node frontend/tmp_genpracticemap.mjs` after any bank edit: the lesson →
  practice map inside `tracks-data.js` is DERIVED from the banks' `ref:{label,file}`
  entries, and `--check` fails if it is stale. Hand-editing that block is how a
  lesson silently loses its "Test yourself" strip.
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
- Code on a page is CODE: `node frontend/tmp_codecheck.mjs` extracts every
  `<pre>` and CodeWalk `code:` array and compiles the TS/Java ones. Needs
  `npm i --no-save typescript@5.6.3` (match the version the Try It editor loads
  from the CDN, not the newest) and `javac`; either missing = skip, not fail.
  It reports from an ALLOW list, and a ❌ excuses ONE LINE, not the block.
- A "Code With Me" `coach:` entry is a regex with an OPINION, and no other gate
  can tell whether it is right — the page still parses and the snippet still
  compiles when it is wrong; it just tells a learner their correct code is
  wrong. Check with `node frontend/tmp_coachcheck.mjs`, which replays the
  engine's real `matchCoachEntry()` (absent-length gate included) against two
  samples per entry: code that should trip it, and a correct solution that must
  NOT. Add both samples in the same commit as the entry. Two rules learned the
  hard way: an `absent:` entry cannot fire on a problem whose whole solution is
  under 40 characters longer than its own starter, and any entry that fires on a
  correct solution gets CUT, not softened.
- **CodeWalk `line:`/`lines:` indices are ZERO-based** — `devhub-codewalk.js`
  uses them as raw indices into the rendered lines and prints `idx+1` in the
  gutter. Authoring them 1-based highlights one line low on every step and
  drops the last one off the end, and no other gate can see it: the page is
  valid, the widget renders, nothing throws. Check with
  `node frontend/tmp_cwlines.mjs`. The invariant is `0 <= v < n`, NOT
  `1 <= v <= n` — I shipped four pages on the wrong one.
  When you clone a CodeWalk, the `lines:` arrays are NOT part of the skeleton —
  rewrite them against the new `code:` array. 69 pages shipped carrying the
  identical pasted plan `1-7 9-14 16-20 22-26 28-32`, five steps sized for a
  32-line layout none of them had. Write the `code:` array FIRST, then index it.
  And when a step teaches something the code array never shows, append the
  block — never repoint the note at unrelated code, which is how a page ends up
  teaching something false.
- Find thin lessons with `node frontend/tmp_hfaudit.mjs` (`--track=`, `--top=`, `--json=`).
  It scores every lesson page against the nine-point standard above and ranks the thinnest
  first. It reads MARKUP, not meaning — a low score means "go look", never a verdict, and a
  high score means "has the parts", never "is good".
- **The Pages deploy runs FOUR gates, not one** (`.github/workflows/deploy.yml`): `tmp_vcheck.mjs`,
  `tmp_doccheck.mjs`, `tmp_assetcheck.mjs origin/<base_ref>`, and a `tracks-data.js` load test.
  Run all four before pushing — a green vcheck is not a green deploy.
- **`tmp_doccheck.mjs` is the one that gets forgotten.** It demands a doc comment ending on the line **directly above** every
  named function in the shared `frontend/*.js` engines (plus a `WHAT IT CANNOT SEE` banner
  on every `tmp_*.mjs` gate, and Javadoc on backend types/public methods). "Directly above"
  is literal: one intervening line breaks the association and fails, on purpose — a
  `let state = null;` slipped between a comment and the two functions it described, and the
  deploy went red on an engine whose doc comment was already written. Write WHY and who
  calls it, never a restatement of the signature. It cannot see whether a comment is TRUE:
  three comments pointed at an `upgradeToMonaco()` that was never written under that name,
  and it passed them all.
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
- **A Head First block has a SHAPE, and `docs/HEADFIRST-SHAPES.md` is the contract.** Eleven
  shapes (`tour`, `questions`, `receipt`, `whiteboard`, `argument`, `exhibit`, `assembly`,
  `timelapse`, `twodoors`, `mnemonic`, `autopsy`), each triggered by the KIND of gotcha —
  a misconception, a cost, a structure, a gap between two correct parties — **never by the
  topic**. "It's a Spring page so it gets the Argument" is the same mistake one rung up.
  Every block declares its own: `<p class="hf-deck" data-shape="receipt">`. Check with
  `node frontend/tmp_variety.mjs` (`--track=`, `--unshaped`, `--manifest=`), which fails on
  a shape over 18% of a track (25% for `tour`) and on a block whose declaration its devices
  don't back. It is the ONLY gate that looks across pages instead of at one — vcheck says
  they're valid, smoke says they run, hfaudit says they have the parts, and they can still
  all be the same page. 474 shipped that way because the recipe said "in this order:".
  A page that genuinely earns `tour` keeps it — but it must SAY `data-shape="tour"`;
  `unshaped` and earned-`tour` look identical on the page and opposite in the manifest.
- AUTHORING a Head First block onto a page: `docs/HEADFIRST-BLOCK-RECIPE.md` is the exact
  markup contract (every `hf-*` shape, verbatim) plus the method and the gates — follow it
  rather than copying markup off a page, because a wrong class name (`.lvl` for `.ring`)
  renders as unstyled text and NO gate catches it. Splice the finished block with
  `node frontend/tmp_hfsplice.mjs <page.html> <block.html> "<anchor>"`: it matches the
  page's line endings (pages are a mix of LF and CRLF — splicing the wrong one turns the
  diff into the whole file), refuses on a non-unique anchor instead of guessing, and adds
  the `devhub-hf-check.js` tag, without which `.hf-check` renders as dead buttons.
  **`data-answer` is ZERO-based** and uncheckable by any gate — verify it by hand.
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
- **A lesson's shell is `.page` OR `.container`, and rules must name both.** `devhub.css`
  treats them as one selector (`.page,.container{max-width:clamp(...)}`), but
  `devhub-hf.css`'s book column said `.container` alone — so the 104 pages using
  `<div class="page">` (the angular `-deep` set, the playgrounds, the debugging track) ran
  edge to edge on a wide window while the prose inside them stayed capped (`.hf-say` 20ch,
  `.hf-big` 30ch, an `.intro` card 1386px wide holding a 609px paragraph). Bobby's report
  was *"the alignment is all off"*, and nothing was broken — half the page obeyed a measure
  and half did not. It is now `[data-hf] :is(.container,.page)`. **No gate can see this**:
  vcheck passes, smoke only checks overflow at 390px, contrast only checks colour. When you
  write a shell-level rule, `grep -c '<div class="page"'` before you ship it.
- The cream theme has THREE homes: `devhub-hf.css`'s cream block + repair layer
  (shared components); the runtime pass in `devhub-hf-theme.js` (per-page
  `<style>` blocks, which CSS cannot reach because it cannot query a computed
  background); and, since 2026-09-04, an inline `:root[data-theme="light"]` block
  in each of the **13 track landing pages**, which link neither of the other two.
  If cream text goes unreadable, check which home owns it before writing a rule —
  a per-page dark ground is the runtime pass's job, not CSS's.
- The site's default theme is decided in THREE bootstraps that must agree:
  `app.html`'s head script, `devhub-hf-theme.js`'s `normalise()`, and the inline
  pre-paint script in each of the 13 landing pages. Change one, change all three —
  when only the lesson half was restored once, a dark hub opened cream lessons.
  They store different WORDS for the same palette (`'light'` vs `'cream'`) and each
  normalises the other's; that is fine, don't "fix" it to one word without checking
  both readers. `devhub-theme-v3` is the one-time migration flag off the dark default.
- When theming for cream, measure against `--panel2` (`#e6d7bd`), the DARKEST cream
  surface — not `--bg`. A colour tuned to 4.6:1 on `--bg` lands at ~4.3:1 on the cards,
  so it passes on the page background and fails on every card title. And remember a
  variable override only reaches rules that USE variables: hardcoded hexes (and inline
  `style=` colours, which beat every rule) need explicit handling — that was half the
  work on the landing pages.
- Shared JS engines must be SELF-CONTAINED: inject their own critical CSS (id-guarded
  `<style>`) instead of assuming `devhub.css` is linked — 14 index/landing pages don't link
  it, which is exactly how the giant-ripple layout bug happened.
