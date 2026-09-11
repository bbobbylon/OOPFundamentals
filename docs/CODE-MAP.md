# CODE-MAP — every file in this repo, what it is, and what it touches

*Written 2026-09-07. Companion to [ARCHITECTURE.md](ARCHITECTURE.md) (which describes the
**system**) and [DEVHUB-GUIDE.md](DEVHUB-GUIDE.md) (which describes the **content**). This one
describes the **files**: what each one is, who loads it, what it owns, and what breaks if you
change it.*

If you are new here, read §1 and §2 and stop. The rest is reference.

---

## 1. This repo contains three separate things, and its name matches none of them

```
OOPFundamentals/
├── src/            ← the ORIGINAL project: a Java OOP course (81 .java files)
├── frontend/       ← DevHub: the 537-page static learning site  ← the thing we work on
├── backend/        ← devhub-backend: a Spring Boot API the site can optionally talk to
├── deploy/         ← aws/ (App Runner) and azure/ (Container Apps) deploy scripts
└── docs/           ← this file, ARCHITECTURE, DEVHUB-GUIDE, ROADMAP, API-REFERENCE, SECURITY
```

- **`src/`** — `com.bob.oopfundamentals`, the plain-Java course this repo was born as: 20 topic
  packages (`abstraction`, `algorithms`, `complexity`, `composition`, `concurrency`,
  `datastructures`, `demos`, `designpatterns`, `encapsulation`, `exceptions`, `generics`,
  `inheritance`, `objectessentials`, `polymorphism`, `recursion`, `reflection`, `solid`,
  `strings`, `wildcards`). Built by the ROOT `pom.xml` (`artifactId: OOPFundamentals`). **It is
  not wired into the site** — the lessons re-teach these topics in HTML rather than importing
  from here. Changing `frontend/` never requires touching it.
- **`frontend/`** — the actual product. 537 standalone `.html` pages plus 17 shared JS files, 3
  CSS files and 17 Node gate scripts. No build step, no bundler, no framework: every page is one
  file that runs by double-clicking it.
- **`backend/`** — `devhub-backend`, its own `pom.xml`, package `com.bob.devhub`. Auth, progress
  sync and server-side code execution. **The site works fully without it** — only 3 pages call it
  (see §7), and everything else persists to `localStorage`.

> **Why no framework?** Deliberate, and re-decided 2026-09-01. Every lesson is a single file that
> must load standalone AND inside `app.html`'s iframe. A React/Angular port would break that
> property for a multi-week rewrite. The shared JS engines in §3 ARE the component layer.

---

## 2. Anatomy of a lesson page

All 537 lesson pages are the same shape. Learn it once and any page is readable.
Canonical example: `frontend/shell-cli-basics-visualizer.html`.

```html
<!doctype html>
<html lang="en" data-hf>                      <!-- data-hf opts into the Head First kit -->
<head>
  <title>CLI Basics — DevHub</title>          <!-- "<Topic> — DevHub" -->
  <link rel="stylesheet" href="devhub.css"/>      <!-- base design system -->
  <link rel="stylesheet" href="devhub-hf.css"/>   <!-- Head First kit + cream theme -->
  <style> /* page-local styles only */ </style>
</head>
<body class="track-shell">                    <!-- THE TRACK. Not decoration — see §9 -->
  <div class="container">
    <a class="back" href="app.html">← back to Dev Hub</a>
    <div class="hf-meta">   … difficulty badge, read time, tech chips …
    <h1>…</h1>  <p class="hf-deck">…</p>      <!-- title + subtitle -->
    <div class="hf-question">…</div>          <!-- the hook: a question, before any answer -->
    <div class="intro">…</div>                <!-- plain-English "what is this / why care" -->
    <div class="rt-ctlbar">…</div>            <!-- the animated scenario walk's controls -->
    <div class="rt-stage">…</div>             <!--   … its stage + live inspector -->
    …teaching sections…
    <h2>Where to go next</h2>                 <!-- links to sibling lessons -->
  </div>

  <!-- per-page widgets first, with their inline mount config -->
  <script src="devhub-codewalk.js"></script>
  <script>DevHubCodeWalk.mount('#cw-cli', { steps:[…], code:[…] });</script>

  <!-- then the sitewide engines, in this order -->
  <script src="tracks-data.js"></script>      <!-- must precede devhub-chapters.js -->
  <script src="devhub-chapters.js"></script>
  <script src="devhub-hf-theme.js"></script>
  <script src="devhub-hf-check.js"></script>
  <script src="devhub-lesson.js"></script>
  <script src="devhub-notebook.js"></script>
  <script src="devhub-syntax.js"></script>
  <script src="devhub-transitions.js"></script>
</body>
```

Only one ordering constraint is real: **`tracks-data.js` before `devhub-chapters.js`**, because
the rail reads `DEVHUB_TRACKS` at load. Everything else self-initialises on `DOMContentLoaded`.

A page is registered in `tracks-data.js` (and the `TRACKS`/`CATEGORIES` wiring in `app.html`);
`tmp_vcheck.mjs` checks that relationship in BOTH directions.

---

## 3. The shared front-end engines

17 files, 6,876 lines. Each exports exactly one global and self-initialises. **Every engine
injects its own critical CSS** in an id-guarded `<style>` rather than assuming `devhub.css` is
linked — 14 index/landing pages don't link it, which is how the giant-ripple layout bug happened.

| file | lines | on N pages | global | what it is |
|---|---:|---:|---|---|
| `devhub-codegrade.js` | 1367 | 9 | `DevHubCodeGrade` | the graded coding IDE: exercise list, per-language editor, hidden tests, run + results, and the "Code With Me" coach (`coach:` entries). Executes client-side via the same runtimes as `devhub-tryit.js` |
| `tracks-data.js` | 1063 | 523 | `DEVHUB_TRACKS`, `DEVHUB_PRACTICE` | **the registry.** Single source of truth for track → section → page. `DEVHUB_PRACTICE` (lesson → quiz/deck map) is **DERIVED** — regenerate it, never hand-edit (see §6) |
| `devhub-quiz.js` | 640 | 21 | `DevHubQuiz` | practice/exam engine: Practice mode (instant feedback), timed Exam mode, per-domain breakdown, attempt history |
| `devhub-tryit.js` | 722 | 119 | `DevHubTryIt` | "Try It Live" mini-IDE. Four REAL runtimes: sandboxed JS, the actual `tsc`, Pyodide (CPython/WASM), CheerpJ (JVM + javac). **Java is 8-only with cooperative threads** |
| `devhub-hf-theme.js` | 501 | 522 | — | the dark ⇄ cream switch, and the runtime contrast-repair pass over per-page `<style>` blocks that CSS cannot reach |
| `devhub-chapters.js` | 362 | 521 | — | the "you are here" chapter rail, rendered FROM `tracks-data.js` so no page hand-writes its own chapter list |
| `devhub-notebook-review.js` | 294 | 1 | `DevHubNotebookReview` | review modes for `notebook.html`; shares one Leitner store with `devhub-flashcards.js` so "mastery" means one thing everywhere |
| `devhub-flashcards.js` | 281 | 17 | `DevHubFlash` | Leitner spaced repetition, 5 boxes. Also exports `loadBoxes`/`saveBoxes` for the notebook |
| `devhub-codewalk.js` | 324 | 474 | `DevHubCodeWalk` | the line-by-line code walkthrough. **`line:`/`lines:` are ZERO-based raw indices** while the gutter prints `idx+1` — see §9 |
| `quiz-banks.js` | 242 | 1 | `DEVHUB_EXAMS` | exam MANIFEST (metadata only, no questions) |
| `devhub-transitions.js` | 208 | 536 | `DevHubStreak` | click ripple + page fade, and the streak store every practice engine reports into |
| `devhub-notebook.js` | 218 | 522 | `DevHubNotebook` | save any lesson section into a personal study set; `NotebookStore` + an auto-scanner |
| `devhub-lesson.js` | 181 | 8 | `DevHubLesson` | the two interactive components from the 2026-09-01 cream mockup that CSS alone doesn't cover |
| `devhub-syntax.js` | 182 | 239 | `DevHubSyntax` | auto-colourises static `<pre>` blocks. **Add it to any new page that shows code** — rule 8 of the teaching bar is "no plain white code" |
| `devhub-hf-check.js` | 109 | 111 | `DevHubCheck` | inline "predict before reveal" knowledge check; explains EVERY option, not just the right one |
| `devhub-run.js` | 116 | 3 | `DevHubRun` | the **only** front-end file that talks to the backend (`/api/run/*`) |
| `config.js` | 66 | 7 | `DEVHUB_API_BASE` | the one file you edit after deploying a backend |

### Stylesheets

| file | lines | on N pages | notes |
|---|---:|---:|---|
| `devhub-hf.css` | 3842 | 522 | Head First kit + the cream theme's shared-component half |
| `devhub.css` | 841 | 522 | base design system, tokens, track accents, `<pre>` token palette |
| `devhub-warm.css` | 239 | **0** | superseded prototype of the cream theme. Linked by nothing, still linted by `tmp_vcheck.mjs`, deliberately kept. Don't extend it — the cream theme's real homes are in §9 |

### Who depends on whom

```
tracks-data.js ──────────► devhub-chapters.js          (rail reads DEVHUB_TRACKS/DEVHUB_PRACTICE)
config.js ───────────────► devhub-run.js               (DEVHUB_API_BASE → the backend)
devhub-syntax.js ────────► devhub-tryit.js             (colours the editor)
devhub-flashcards.js ────► devhub-notebook-review.js   (shared Leitner box store)
devhub-transitions.js ───► devhub-codegrade.js         ┐
   (exports DevHubStreak)  devhub-flashcards.js        │ every retrieval-practice engine
                           devhub-hf-check.js          │ reports activity into the streak
                           devhub-quiz.js              ┘
```

Nothing else is coupled. Any other engine can be dropped from a page without breaking the rest.

---

## 4. Where state lives

Everything below is per-browser. **Nothing except the backend's progress sync leaves the device.**

| key | kind | owner | what |
|---|---|---|---|
| `devhub-theme` | localStorage | `app.html`, `devhub-hf-theme.js` | `'dark'` \| `'light'`/`'cream'` — the two readers normalise each other's word, see §9 |
| `devhub-theme-v3` | localStorage | same | one-time migration flag off the old dark default |
| `dlh_progress_v1` | localStorage | `app.html` | per-lesson learned state |
| `dlh_recent_v1` | localStorage | `app.html` | the Resume Learning list |
| `dlh_streak_v1` | localStorage | `devhub-transitions.js` (`DevHubStreak`) | the retrieval streak |
| `dlh_milestone_v1` | localStorage | `app.html` | milestone celebration state |
| `dlh_token`, `dlh_user` | localStorage | `app.html`, `devhub-run.js` | backend JWT + user, when a backend is configured |
| `dlh-quiz:<id>` | localStorage | `devhub-quiz.js` | attempt history per bank |
| `dlh-flash:<id>` | localStorage | `devhub-flashcards.js` | Leitner boxes per deck |
| `dlh-codegrade:<id>` | localStorage | `devhub-codegrade.js` | per-bank `solved` / `code` / `coachSeen` / `fails` |
| `dlh-codegrade-coach` | localStorage | `devhub-codegrade.js` | the global "🧑‍💻 Pair" on/off preference |
| `dlh-tryit:<id>` | localStorage | `devhub-tryit.js` | saved editor buffers |
| `dlh-notebook:entries` | localStorage | `devhub-notebook.js` | the personal study set |
| `dlh-java-runtime` | **Cache Storage** | `devhub-tryit.js`, `devhub-codegrade.js` | the fetched-once `tools.jar` for CheerpJ. Not localStorage |
| `dlh-navigate` | **postMessage type** | chapters, codegrade, quiz, notebook-review | a page asking its `app.html` parent frame to navigate. Not storage |
| `dlh-*-styles`, `dlh-tryit-css` | **element id** | each engine | the id-guard on an injected `<style>`. Not storage |

The last three rows share the `dlh-` prefix with real storage keys and are **not** storage. Grep
alone will mislead you here.

---

## 5. The gate harness — and what each gate CANNOT see

17 scripts in `frontend/`, run as `node frontend/<name>.mjs`. They are matched by `.gitignore`'s
`frontend/tmp*` rule and **force-added** (`git add -f`) — a new gate is invisible to git until
you do that.

The "cannot see" column is the valuable half: every bug this repo has shipped twice lived there.

| gate | answers | cannot see |
|---|---|---|
| `tmp_vcheck.mjs` | encoding, registry both ways, required scripts, internal links, duplicate registrations. **Gates the Pages deploy** | that a script RUNS — only that it parses. And it cannot see a wrong `body.track-*` |
| `tmp_smoke.mjs` | uncaught errors + horizontal overflow at 390px, in a real browser | text clipped inside a non-scrolling box (reported separately); CDN loads in a sandbox with no network |
| `tmp_codecheck.mjs` | every `<pre>` and CodeWalk `code:` array compiled for real (TS + Java) | anything but TS/Java. Needs `npm i --no-save typescript@5.6.3` + `javac`; **missing = silently SKIPPED, not failed**. Clean means "nothing provably wrong", never "correct" |
| `tmp_cwlines.mjs` | CodeWalk indices out of range, on a blank edge line, or carrying the 1-based signature | a note pointing at the WRONG-but-in-range line. That took a 242-mount manual sweep |
| `tmp_coachcheck.mjs` | every `coach:` regex fires on the mistake it describes and stays quiet on a correct solution | whether the MESSAGE is true; any input outside its two samples; exercises with no entry at all |
| `tmp_assetcheck.mjs` | LOSS of a tryit / CodeWalk / rt-stage / quiz / flashcard versus a git ref | a teaching asset that is present but wrong |
| `tmp_genpracticemap.mjs` | `--check` fails if the derived practice map is stale | it compares as a STRING, so mixed line endings report STALE when the content is identical |
| `tmp_doccheck.mjs` | every engine function, every gate's "WHAT IT CANNOT SEE" banner, and every backend type/public method carries a doc comment. **Gates the Pages deploy** | whether the comment is TRUE, current, or useful — a block saying only `TODO` passes. Skips one-line event wire-ups and code inside template literals by design; cannot see fields, constants or inline callbacks |
| `tmp_hfaudit.mjs` | scores every page against the nine-point teaching bar | **meaning.** It reads MARKUP. Low = "go look", never a verdict; high = "has the parts", never "is good" |
| `tmp_contrast.mjs` | text under 2.2:1, grouped by selector | anything between 2.2 and WCAG's 4.5 — the floor is for "invisible", not "could be crisper" |
| `tmp_examtell_audit.mjs` | position/length giveaway tells in the exam banks | whether a question is any good |
| `tmp_java_verify.mjs`, `tmp_java_data.mjs` | practice exercises compiled and run against the engine's own harness | non-Java languages |
| `tmp_creamrace.mjs` | a failing test for the cream-theme legibility race | anything else; it is one targeted reproduction |
| `tmp_shot.mjs` | phone + desktop screenshots for design review | it renders; it does not judge |
| `tmp_hfapply.mjs` | opts a page into the Head First kit (`--check`, `--revert`) | not a gate — a mutation tool |
| `tmp_pw.mjs` | the one place that knows how to find Playwright and a browser | — (a helper, imported by the browser gates) |

`playwright` is **not** installed as a package on this machine, but the browser gates still run
via `tmp_pw.mjs`'s system-Chrome fallback. Set `PW_MODULE` if that ever stops working.

---

## 6. Two derived things you must never hand-edit

1. **`DEVHUB_PRACTICE` inside `tracks-data.js`** — generated from the exam banks' `ref:{label,file}`
   entries by `tmp_genpracticemap.mjs`. Hand-editing it is how a lesson silently loses its "Test
   yourself" strip. After ANY bank edit: `node frontend/tmp_genpracticemap.mjs`.
2. **A cloned CodeWalk's `lines:` arrays** — they are not part of the skeleton you copied. Write
   the `code:` array first, THEN index it. 69 pages once shipped carrying the identical pasted
   plan `1-7 9-14 16-20 22-26 28-32`, five steps sized for a 32-line layout none of them had.

---

## 7. `backend/` — devhub-backend

Spring Boot, package `com.bob.devhub`, 37 main + 4 test classes. Optional: the site degrades to
`localStorage` when `config.js` carries no `DEVHUB_API_BASE`.

```
DevHubApplication.java
config/      DataInitializer, OidcKeyConfig, SecurityConfig
controller/  Auth, Progress, Execution, Oidc, Admin      ← 5 REST entry points
service/     AuthService, JwtService, OidcTokenService, ProgressService,
             UserDetailsServiceImpl, exec/ExecutionService + exec/Language
repository/  UserRepository, TopicProgressRepository
security/    JwtAuthFilter, IdmAuthoritiesConverter
model/       User, Role, Idm, TopicProgress, ProgressStatus
dto/         10 request/response types
```

Only three front-end pages reach it, all through `devhub-run.js` → `/api/run/*` (the Python /
TypeScript / Shell playgrounds' "Run on server (real)" mode). The auth and progress endpoints
exist and are exercised by `app.html` when a backend is configured.

Tests: `AuthRoleIntegrationTest`, `OidcResourceServerTest`, `ExecutionServiceTest`,
`DevHubApplicationTests`. Endpoint detail lives in [API-REFERENCE.md](API-REFERENCE.md).

---

## 8. `deploy/`

- `deploy/aws/` — `apprunner.json`, `deploy.sh`, `secrets-setup.sh`. **App Runner, not ECS** —
  the repo already had this path and it was hardened rather than replaced (ROADMAP: "AWS App
  Runner hardening"). The ECS/ALB/CloudFront playbook is parked for a future project.
- `deploy/azure/` — `containerapp.bicep`, `deploy.sh`.
- `.github/workflows/deploy.yml` — gates the GitHub Pages deploy on `tmp_vcheck.mjs` and
  `tmp_doccheck.mjs` (plus `tmp_assetcheck.mjs` on pull requests, where there is a base to
  diff against). Either red blocks the deploy.
- Repo root: `Dockerfile`s, `docker-compose.yml`, `nginx.conf`, `dev.ps1`, `startapp.sh`, `mvnw`.

---

## 9. Traps — things that look fine and are not

1. **Stale harnesses at the REPO ROOT.** `tmp_vcheck.mjs`, `tmp_audit.mjs`, `tmp_quizcheck.mjs`,
   `tmp_refcheck.mjs` and `tmp_check_viz.mjs` sit in the root directory. They are **untracked,
   gitignored leftovers from mid-2026 and are not the gates.** Root `tmp_vcheck.mjs` is 36 lines
   validating ONE page's scenario data; the real one is `frontend/tmp_vcheck.mjs`, 275 lines,
   whole-site. Always run gates as `node frontend/<name>.mjs`. (CLAUDE.md's "there is no
   `tmp_audit.mjs`" means no *real* one — the root file is the ghost it warns about.)
2. **`<body class="track-…">` is not decoration.** Both stylesheets key each track's accent
   colours off it, and `tmp_hfaudit.mjs` reads the track from it. A clone that keeps the source
   page's track is perfectly valid HTML wearing another track's palette, and **no gate can see
   it**. Four Render pages shipped as `track-shell` this way.
3. **CodeWalk `line:`/`lines:` are ZERO-based.** The invariant is `0 <= v < n`, NOT `1 <= v <= n`.
4. **The cream theme has THREE homes**: `devhub-hf.css`'s cream block + repair layer; the runtime
   pass in `devhub-hf-theme.js` (per-page `<style>` blocks, which CSS cannot query because it
   cannot ask for a computed background); and an inline `:root[data-theme="light"]` block in each
   of the 13 track landing pages, which link neither of the other two. Find the owner before
   writing a rule.
5. **The default theme is decided in THREE bootstraps that must agree**: `app.html`'s head script,
   `devhub-hf-theme.js`'s `normalise()`, and the inline pre-paint script in each landing page.
   They store different WORDS for the same palette (`'light'` vs `'cream'`) and each normalises
   the other's — that is fine; don't unify it without checking both readers.
6. **Theme rules in `devhub-hf.css`** must be written
   `:is([data-theme="cream"],[data-theme="light"])[data-hf] .thing`. The comma form is a bare root
   selector plus a light-only rule; it silently killed the entire component half of cream once.
7. **Measure cream against `--panel2` (`#e6d7bd`)**, the darkest cream surface — not `--bg`. A
   colour tuned to 4.6:1 on `--bg` lands at ~4.3:1 on every card.
8. **`tmp_codecheck.mjs` skips silently.** No `typescript` installed means every TS block is waved
   through behind a "not installed" line, not a failure.

---

## 10. Where to go next

- [DEVHUB-GUIDE.md](DEVHUB-GUIDE.md) — the content navigator: tracks, pages, the teaching bar,
  and the long-form description of each gate.
- [ARCHITECTURE.md](ARCHITECTURE.md) — system-level design and data flow.
- [API-REFERENCE.md](API-REFERENCE.md) — the backend's endpoints.
- [ROADMAP.md](ROADMAP.md) — what is not done yet, including item 15, the in-code documentation
  pass this file is step 1 of.
- `CLAUDE.md` (repo root) — the working rules and conventions, including every trap in §9.
