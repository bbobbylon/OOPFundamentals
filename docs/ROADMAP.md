# DevHub Roadmap

A running todo/future-enhancements list for the Dev Learning Hub (`frontend/app.html`).
This is planning, not documentation of what exists today — see
[DEVHUB-GUIDE.md](DEVHUB-GUIDE.md) for the current, accurate map of tracks and pages.

When an item here gets built: register it in `TRACKS` in `frontend/app.html`, update the
page/track counts in `README.md` and `DEVHUB-GUIDE.md`, then delete the item from this file
(git history keeps the record — this file should only ever describe what's *not* done yet).

---

## ✅ FIXED — cream theme legibility (was a KNOWN BUG; kept as a record of the diagnosis)

**Symptom.** In cream, text on pages with their own panel grounds rendered
unreadable. Two faces, both invisible in dark:

- *deterministic* — `angular-custom-directives`, `.demo-area div.code-live`:
  dark ink `rgb(71,66,56)` on a near-black `rgb(5,10,20)` panel, 1.99:1, 6 of 6 loads.
- *nondeterministic* — `angular-dynamic-components`, `.body div.desc`: 3-5 of every
  6 FRESH loads at 1.05-1.68:1 against a 0.734-luminance ground; the rest at 10-13:1.

**Root cause: CSS transitions.** Much of the site carries `transition: all .3s`,
so when the theme's colours land, every colour and background ANIMATES for 300ms.
`getComputedStyle` returns the value mid-flight, so the repair pass in
`devhub-hf-theme.js` measured intermediate ink on an intermediate ground — a
surface that is not what finally gets painted. The deterministic case saw light
ink on a dark panel, judged it fine, and skipped; the transition then completed
to dark-on-dark. The race caught a different animation frame each load, so
`relight()`'s `bgL < 0.18` fallback flipped between light and dark ink.

Neither MutationObserver in that file could see it: **an animating value produces
no DOM mutation.**

**Fix.** Listen for `transitionend` on `color` / `background-color` and schedule
another pass — i.e. measure once the animation has finished rather than during
it. Capped at 60 passes as a backstop, since our own writes can re-trigger a
transition under `transition: all`; the 0.03 ground guard in `repair()` means
repeated passes converge and stop writing, so the cap is not the mechanism.

**Two earlier attempts that did NOT work — do not retry them:**

1. A guaranteed pass on `window.load` plus a double `requestAnimationFrame`.
   1/6 → 4/6 readable, still flaky. Wrong because the ink is still light at
   `load` and only settles ~1.4s in — this was never about stylesheet loading.
2. Gating `run()` on `document.body` luminance > 0.5. Made it **worse** (4/6
   failing): `body` already carries cream while `.step` / `.panel` do not, so the
   guard passed at exactly the wrong moment.

**Regression tested:** both cases 6/6 and 4/4 clean after the fix; dark theme
unchanged (the one dark failure, `.diagram-toggle div.dtab.active` at 1.86, is
byte-identical with and without the patch — pre-existing); vcheck 528/528; full
site smoke at 320px clean.

**The test stays.** `node frontend/tmp_creamrace.mjs` loads a page fresh N times
and reports per-run contrast — a single load proves nothing about a race, which
is the whole reason it exists. Run it if you touch the repair pass.

---

## ⚠ Branch state (2026-09-04) — read before touching git

`claude/app-redesign-scope-cicd-9xi362` is the working branch and PR #1 is open against
`master`.

- **`legacy`** and **`oldmasterbranch`** both exist at `9e4de0a` — two names for the same
  pre-overhaul master commit, preserved so master can be overwritten safely. They are
  byte-identical snapshots; keep whichever name you prefer and delete the other
  (`git push origin --delete legacy`). Neither is a working branch — do not commit to them.
- **master is an ANCESTOR of the branch** (29+ ahead, 0 behind) and GitHub computes a clean
  merge ref. There is nothing to merge *from* master, and master is the old format — do not
  merge it in.
- **Never force-push this branch.** Eight amend+force-pushes earlier rewrote it under Bobby's
  clone and his next `git pull` conflicted across ~555 files. Ordinary fast-forward commits
  only; his one-commit requirement is satisfied by **squash-merging** the PR at the end.

### ✅ RESOLVED 2026-09-04 — the divergence is merged, nothing is stranded

The force-push damage above is repaired. Bobby's clone had diverged **2 local / 34 remote**
from a merge-base of `9e4de0a` (master), so `git pull` conflicted in **44 files**. It was
never two rival designs: **12 of the 16 new shared files were byte-identical**, i.e. one
lineage that the rewrite split in two.

Resolved by a real **merge** (not the `reset --hard` recipe that used to live here — that
would have destroyed the local-only work below, and a merge needs no force-push):

- **theirs (cloud) ×42** — the cloud branch is the superset: `devhub-hf.css` 42KB → 208KB,
  `devhub-hf-theme.js` 3.8KB → 14KB, plus the 102 authored pages.
- **ours (local) ×2** — `shell-cli-basics-visualizer.html` (local authored it to the HF bar,
  37.1KB → 44.6KB with 15 `hf-walk`/`hf-anatomy` uses; the cloud only swept it, +181 bytes)
  and `tmp_shot.mjs` (the cloud copy hardcodes `/opt/node22/...` and `URL().pathname`, which
  yields `/B:/…` on Windows — broken on Bobby's machine).
- **`devhub-lesson.js` survived on its own** — local-only, and the cloud branch has *zero*
  occurrences of `hf-walk`/`hf-anatomy`. A plain "take cloud" would have deleted it silently.

**`2260122` is no longer stranded** — it is in this branch's history, and also kept at the
local branch/tag `backup/local-before-merge-20260904` / `backup-local-20260904`.

- **Colorway: half-restored, deliberately.** Taking the cloud's `app.html` and
  `devhub-hf-theme.js` wholesale had silently reverted Bobby's `2260122` cream work. The
  **cream palette is restored** in `app.html` (`:root[data-theme="light"]` — pure CSS, warm
  `#f5ead8` ground, `#c15c30` accent, no JS involved, so the race below cannot touch it).
  **Cream is now the DEFAULT again, on both surfaces.** It was briefly held back because
  cream carried the legibility race above; `26be77b` fixed that race (`transition: all .3s`
  meant the repair was measuring mid-animation values). Re-verified here after merging it:
  the same page went **2.93:1 → 4.92:1**, above WCAG AA, 6 of 6 runs, with
  `repairMeasuredGroundL` no longer a stale reading at all. `tmp_creamrace.mjs` exits 0.

  The default lives in **two** places and they must agree — `862821d` restored only the
  lesson half (`normalise()` in `devhub-hf-theme.js`), which left a first-time visitor with
  a **dark hub that opened cream lessons**. The hub half (`|| 'light'` in `app.html`'s
  pre-paint script) is restored here, so `2260122`'s intent is whole again. If you ever flip
  one, flip both.

  Still worth doing: `tmp_creamrace.mjs` covers a single page, and the fix under it is new.
  Widen it before trusting cream everywhere.
- **Tooling is portable again.** New `frontend/tmp_pw.mjs` is the single place that resolves
  Playwright and a browser binary; `tmp_shot` / `tmp_smoke` / `tmp_contrast` / `tmp_creamrace`
  all import it instead of carrying four copies, three of which were cloud-sandbox-only. On a
  machine with no Playwright they now print one actionable message instead of a
  `MODULE_NOT_FOUND` on `/opt/node22`. Verified end-to-end on Windows with
  `PW_MODULE=<dir>/node_modules/playwright-core` against the system Chrome.

---

## ✅ Done — "Deploying on Render" (requested + landed 2026-09-05)

Bobby is now deploying on Render and asked for it to sit with the other CI/CD material.
Four new pages under a **Deploying on Render** section in the ♾️ DevOps & CI/CD track,
which was the thinnest track on the site at three pages and is now seven.

| page | level | the one thing to remember |
| --- | --- | --- |
| [`render-deploys-visualizer.html`](../frontend/render-deploys-visualizer.html) | beginner | *"Bind `0.0.0.0:$PORT` — or you don't exist."* Push → build → health check → live, plus no-open-ports, the 15-minute idle spin-down, and a failed deploy that never takes traffic. |
| [`render-blueprints-visualizer.html`](../frontend/render-blueprints-visualizer.html) | intermediate | *"If it isn't in the file, it isn't real."* `render.yaml` as four resources, wiring without secrets (`sync: false` / `generateValue` / `fromDatabase`), preview environments per PR, and dashboard drift getting resurrected on the next sync. |
| [`render-databases-env-visualizer.html`](../frontend/render-databases-env-visualizer.html) | intermediate | *"A free Postgres expires 30 days after it is created."* Internal vs external connection strings, where a secret actually lives (env var / group / secret file; build-time vs run-time), and the connection budget — Hikari pool × instances × services against `max_connections`. |
| [`render-spring-angular-visualizer.html`](../frontend/render-spring-angular-visualizer.html) | advanced | *Two services, one origin, no CORS.* A Docker web service and a static site, joined by a rewrite whose destination is a full public URL — so the browser never learns there were two hosts. |

**Every fact was verified against render.com/docs before it was authored**, deliberately,
because audit item #8's whole finding is that DevHub's false claims hide in the
*interactive payloads* — CodeWalk `note:`/`vars:`, scenario results, intro cards — which
no gate reads as code. Two would have been wrong from memory: there is **no native Java
runtime** (Spring Boot must use `runtime: docker`, which reshaped pages 1 and 4 entirely),
and the static-site route field is **`source`**, not `path` — two doc sources disagreed
and a search settled it. A wrong field name teaches something false in exactly the way
#8 describes.

The advanced page's angle is the one most tutorials miss: you can **delete** the CORS
problem instead of configuring it. A static site's rewrite `destination` accepts a full
public URL, so `/api/*` → the API's URL makes every call same-origin — no preflight, no
`allowedOrigins` list to keep in step with each preview environment, and session cookies
become first-party. The costs are named too: the API now sits behind a proxy, so
`server.forward-headers-strategy=framework` is required or every absolute URL Spring
builds (redirects, `Location`, the OIDC `redirect_uri`) names the wrong host.

**Also fixed, and a prerequisite for the above:** `devhub-hf.css` had **six lesson-chrome
classes that four existing pages authored and nothing styled** — `hf-meta`, `hf-badge`
(+`.level`/`.mid`), `hf-question`, `hf-numcards`, `hf-refhead`, `hf-refgrid`. Markup with
no rules renders as unstyled inline text, which no gate flags because the elements are
present and the page throws nothing. Written against `--hf-*` variables only, so cream is
carried automatically with no `[data-theme]` selector to get wrong.

**`tmp_hfaudit` earned its keep twice.** First it caught a bug I had introduced and no
other gate can see: all four pages carried `<body class="track-shell">`, inherited from
`shell-gcloud-cli-visualizer.html`, the page they were cloned from. That class is not
decoration — `devhub.css:61` and `devhub-hf.css:2317` key the per-track accent colours off
it in both themes, so the pages were wearing the Shell track's palette inside the DevOps
track. vcheck cannot see it (the page is valid), and the audit only surfaced it because it
reads the track from the body class and filed four brand-new DevOps pages under `shell`.
**Clone-and-adapt inherits more than the skeleton; the body class is part of the adapting.**

Then, scored honestly, the pages came back at **61.5–65** — above the track but not at the
bar, and for two reasons that were both real gaps rather than measurement artefacts. They
had **no `.intro` card** (CLAUDE.md #6 and a standing ask: a deck line is not an intro),
and **one visual apiece** — the animated stage and nothing else. Both were inherited from
the template, which has the same two gaps. Fixed on all four: a full plain-English intro
card with `intro-gist` / `intro-cards` / `intro-ciam`, and one mechanism diagram chosen by
the *shape* of the concept rather than at random — `hf-steps` for the deploy lifecycle and
for the request path through the rewrite, `hf-cycle` for the drift-and-resurrection loop,
`hf-one` for the connection budget (many pools funnelling into one `max_connections`). Then
16 `hf-arrow` annotations, one per walkthrough step, each naming the single line in the
block above that does the work — because four of the eight `<pre>` blocks per page were
commands with only a prose lead-in, which is exactly what CLAUDE.md #7 rules out.
**61.5 → 87.5 on all four**, and they are the only pages in the track above 75.

**Gates:** `tmp_vcheck` ✓ (535 pages, 519 registered), `tmp_genpracticemap --check` ✓,
`tmp_assetcheck` ✓ (no teaching assets lost vs `f549358`), plus a hand-written check that
every CodeWalk `lines:` entry is in range, non-blank and within the 1–13 limit on all four
pages — the failure mode from audit item #1, which no gate reads. The four browser gates
could not run: Playwright is not installed on this machine.

---

## 🔍 SEVEN-DIMENSION AUDIT (2026-09-05) — the backlog that came out of it

Everything above this line was found by looking at teaching *rhythm*. This section
came from auditing the seven dimensions nobody had measured: accessibility,
performance, learner journey, interactive-feature health, retention mechanics,
maintainability, and factual correctness of the content. Eight agents, every
finding required to cite a file path, real command output or a browser
measurement; anything unevidenced was discarded.

**The theme: the parts all work and are not connected to each other.** The recall
machinery is built and verified (19/19 exams, 16/16 decks, 9 graded IDEs) and
reachable from almost nowhere. Navigation loses state between the hub and the
page. That is a much better problem to have than "the content is wrong" — see
"measured healthy" below.

### ✅ Fixed 2026-09-05

- **CodeWalk was inert on 307 of 465 pages** (`b088024`). `linesForStep()` read
  only `s.line`; 307 pages author `lines:`. Every step advanced the counter and
  highlighted nothing while the whole block sat dimmed at opacity .4. Invisible to
  every gate — the widget renders, throws nothing, and scores as present.
  The two keys are NOT interchangeable: `line:[a,b]` is a range (all 363 on the
  site are exactly 2 elements), `lines:[...]` is an explicit list (1-13 elements,
  545 steps have exactly 5). Treating either as the other teaches the wrong lines.
- **The chapter rail credited the wrong page** (`dde21c1`). Rail stops were plain
  `<a href>`; inside the hub's iframe that navigates the frame only, so
  `currentFile` stayed stale and "Mark as Learned" credited the page you left.
  Now routed through the `dlh-navigate` postMessage contract app.html already had.
- **47 of 514 pages could not be bookmarked** (`fb00663`). The hash is written by
  stripping both suffixes, so reading it back is ambiguous; the restore assumed
  `-visualizer.html` and silently dropped every exam, deck and practice page on
  the welcome screen. Now resolved against the sidebar. Round-tripped all 514:
  467 → 514.
- **90 of 124 sections dead-ended** (`90a9329`). The rail now renders
  "Next up · <next section> →" on the last page of a section, and stays quiet on
  the last section of a track.
- **31 selectors under 2.2:1 in the dark theme — never gated before, since the
  contrast tool defaults to cream.** All fixed; root cause for 8+4 of them was
  a "track-accent leak" (a track's `body.track-*{--accent}` always beats both
  a page's own `:root` override and the kit's theme remap) pairing white text
  with light accents like teal/cyan at 1.81–1.86:1. Also darkened `.cw-ln` and
  both `.cm` comment rules (the line-by-line explanation text), and fixed 3
  more pre-existing cream failures the re-check surfaced on pages outside the
  31 — two of them only visible while a demo animation is mid-step. See
  audit item #9 below for the full breakdown; the ~10-shared-token AA sweep
  it also names is still open.

### Remaining, ranked by learner impact per unit of effort

> **#8 (the four pages that teach something false, plus the harness) LANDED 2026-09-05.**
> All four corrected, every replacement claim compiler-verified against
> `typescript@5.6.3` — deliberately the version the Try It editor loads from the
> CDN, not the newest — and JDK 24. **TypeScript:** the green ✅ on
> `merge("a", 42)` is now a red scenario ending in the real TS2345, the union
> example moved onto a new fourth scenario `fromArray([1, "x"])` that shows a
> union arriving from ONE already-union site, and the clamp/NoInfer CodeWalk was
> replaced with a verified `pick` / `pickSafe` role example. A fifth false claim
> the audit did not catch went with them: `identity(42)` infers `T = 42`, the
> LITERAL type — `number` only appears once a `let` binding widens it.
> **Angular:** one canonical timeline (experimental v18-19 → renamed and stable
> v20.2 → default in v21+) applied across 10 files, checked against angular.dev
> rather than against the site's own five disagreeing pages. **Java:** the
> StructuredTaskScope walk now says PREVIEW in the code, the step note and a
> `status:` var, and carries the Java 21 `Future<U>` → Java 22+ `Subtask<U>`
> shape change. **SQL:** the CodeWalk was stating the ANSI answer, unqualified,
> on a page whose table and prose both give the PostgreSQL one; it now teaches
> the fork explicitly (the standard PERMITS phantoms at REPEATABLE READ; Postgres
> implements it as snapshot isolation and prevents them, which the standard
> allows because it only says which anomalies must NOT occur), and a note under
> the table says which answer the exam wants. That page's five CodeWalk steps
> also referenced lines 1-32 of a 14-line array — three of the five highlighted
> nothing at all — and are remapped.
>
> **Two corrections to the audit's own evidence, both found by trying to
> reproduce it.** `javac --release 21 --enable-preview` cannot be run at all on
> JDK 24 ("preview language features are only supported for release 24"), so the
> Java finding is real but the cited command is impossible; re-derived with
> `--release 24`. And the clamp claim was half wrong — the *without-NoInfer* half
> (`T = 1|5|10`) was correct; only the *with-NoInfer* half was wrong, on both
> counts.
>
> **The harness — `frontend/tmp_codecheck.mjs`.** Extracts every `<pre>` and every
> CodeWalk `code:` array, classifies the language, and puts the TypeScript and
> Java through a real compiler. Two design decisions are the whole thing. First,
> it reports from an **allow list, not a deny list**: denying the known noise
> still left 1,711 findings, almost all of them a fragment complaining that its
> page's context is missing, and a gate nobody runs catches nothing. It now
> reports only errors an absent context cannot explain — the compiler resolved
> both sides and they still do not fit. Second, a ❌ excuses **one line, not the
> block**: one deliberate error must not buy silence for the twenty lines around
> it, which is exactly how these four shipped.
>
> Validated the only way that means anything: run against the **pre-fix** files
> from `git show HEAD:`, it reproduces all three compiler findings on its own —
> `pair(1,"x")` TS2345, the inverted clamp TS2345, and
> `Subtask<U> conforms to Future<User>`. Site-wide it now reads **669 blocks (482
> TS, 187 Java), 191 lines excused, 0 real errors**, and it found one defect
> nobody had reported: typescript-type-patterns' fluent `ResultChain` example
> called a static `ResultChain.of(...)` the class never declared. Fixed by adding
> the factory.
>
> Getting there meant killing seven false-positive families, each now encoded as
> a rule rather than a page exception: plain JavaScript judged by `--strict`
> (a DOM lesson is not TypeScript — classification now needs a TS-EXCLUSIVE
> marker, since `const`, `=>` and `console.log` are not evidence); a block that
> does not parse (a montage of a call, a bare method and three prose comments is
> not a program, so its inferred types are guesses); a block that declares the
> same name twice (a before/after contrast, checked against the wrong half);
> `lib.dom` globals outranking a page's own `Range` or `Node`; a library class
> sharing a name with a built-in global (`new Function(...)` is the CDK's);
> `parameter of type 'never'`, which is what a generic looks like when nothing
> could be inferred; and Java's wildcard imports answering for types the
> classpath lacks — `@EventListener` resolving to `java.util.EventListener`,
> `implements Observer` to `java.util.Observer`, and `List<Object>` standing in
> for an unresolved domain type.
>
> Also worth knowing for the next Java gate: JDK 24 does not reject a class
> followed by loose usage lines — it silently rewrites the file as an implicitly
> declared class, which makes the class INNER and every `new Foo()` in a static
> method an error about an enclosing instance.

> **NEW, found while fixing #8: 295 of 453 CodeWalk mounts point at lines that
> are not there.** `frontend/tmp_cwlines.mjs` (also new) walks every mount
> SEPARATELY — a page can carry several, and comparing one mount's indices
> against another's code array produces a scary number that means nothing.
> `devhub-codewalk.js` uses `line:`/`lines:` as RAW indices into the rendered
> lines, so they are **ZERO-based**, while the gutter renders `idx + 1`; 54
> mounts have the exact 1-based signature (`min >= 1 && max === len`), where
> every step highlights one line low and the last index falls off the end.
> This is the same failure mode as the b088024 fix above — the widget renders,
> throws nothing, and scores as present — and it is bigger than #8's scope, so
> it is logged rather than swept. **I authored four of them myself last session
> and did not notice**, because my check was `1 <= v <= n`: the wrong invariant.
> The five pages touched here (4 Render + SQL) are fixed and clean; the other 295
> are open. Fixing them is not mechanical — a wrong-by-one index and a genuinely
> stale one look identical, so each mount needs its note read against its code.
>
> **54 of the 295 mechanically fixed 2026-09-06.** A `looksOneBased` subset —
> `min>=1 && max===len` across the WHOLE mount, meaning every index in it is
> uniformly one too high, the exact `1<=v<=n` authoring mistake described above
> — is safe to fix without reading each note individually: uniform 1-based
> authoring can't coincidentally look like unrelated staleness, and shifting
> every index down by 1 is the only change that signature is consistent with.
> Wrote `frontend/tmp_fix_cwlines_1based.mjs` (scratch, not a permanent gate) to
> apply it: reuses `tmp_cwlines.mjs`'s own balanced-bracket parse so "is this the
> same mount" can never drift between diagnose and fix, tracks absolute file
> offsets so the edit is a precise splice rather than a blind regex
> replace-all (which could otherwise corrupt a number that happens to appear
> inside a note/msg string), and only touches mounts matching the exact
> signature. Verified by hand on `aws-cost-visualizer.html` before running it
> site-wide: its four steps referenced `[1,2],[3],[4,5],[6,7]` against a
> 7-line `code:` array, so step 1 ("BudgetType and TimeUnit") pointed at
> `code[1],code[2]` — `TimeUnit`/`BudgetLimit` — not `BudgetType`/`TimeUnit`;
> after the fix it correctly reads `[0,1],[2],[3,4],[5,6]`. Ran across all 535
> pages: 54 mounts / 54 files fixed, `tmp_cwlines.mjs`'s 1-based count 54 → 0,
> its total bad-mount count 295 → 261. `tmp_vcheck.mjs` (535/535) and
> `tmp_smoke.mjs` across all 54 touched pages both clean (2 pre-existing,
> unrelated `.intro-head` clipping notices on 2 of them, byte-identical cause
> to before — nothing this touched).
>
> **✅ CLOSED 2026-09-07 — all 261 done. `tmp_cwlines.mjs` reports 0 of 455
> mounts bad.** The remaining 261 were finished in two passes.
>
> *Pass 1 (180 mounts, 161 files)* — steps remapped onto the blocks their notes
> actually describe. Verified by hand on `aws-ec2`: its five steps had drifted
> across the blank separators, so "instance types" highlighted `TimeUnit`, not
> the type list.
>
> *Pass 2 (81 mounts)* — these split into three shapes, and the split is the
> useful part, because only the first was mechanical:
>
> - **12 blank-at-an-edge.** A range that opened or closed on a blank separator.
>   Trimmed automatically: a blank INSIDE a range is deliberate (a step spanning
>   a whole block crosses its own separators), a blank at an EDGE only pads the
>   highlight. `tmp_cwlines.mjs` was taught that distinction in the same pass, so
>   it no longer reports the deliberate case at all.
> - **2 the `min>=1 && max===len` signature MISSED.** `spring-boot-grpc` was
>   uniformly 1-based but its max fell short of `len`, so the mechanical fixer
>   skipped it; provable only by reading the notes (the `@GrpcService` note
>   pointed at `public class`). `spring-boot-rate-limiting-deep` was *mixed* —
>   first two steps 1-based, last four correct. **A uniform-shift signature
>   cannot find either.** Reading the note against the code is what found them.
> - **69 one boilerplate template.** Every one carried the *identical* plan
>   `1-7 9-14 16-20 22-26 28-32` against code arrays of 9-30 lines — five steps
>   authored for a 32-line block layout that no page actually had. Not 69
>   independent mistakes; one template pasted 69 times and never adapted.
>
> **What the template pages needed was authoring, not arithmetic.** Only 8 of
> the 69 had five code blocks to receive five steps. The rest had 1-7 blocks, so
> each note had to be read and pointed at the lines it teaches. On ~35 pages a
> step taught something the `code:` array never showed — `python-itertools`
> explained `product`/`combinations` with no such code, `react-styling` named
> four styling strategies and showed only Tailwind, `sorting` described bubble,
> selection and quicksort and showed only merge sort. Those got the missing
> block appended rather than the note pointed at unrelated code, which would
> have reproduced backlog #8's "page teaches something false".
>
> One note that looked wrong was not: `python-collections`' step 3 leads with
> `namedtuple` but also covers `heapq`, which is what the code shows — worth
> checking before "fixing" a mismatch.
>
> Gates after: `tmp_cwlines.mjs` 0 bad, `tmp_vcheck.mjs` 537/521,
> `tmp_assetcheck.mjs` vs HEAD clean, `tmp_genpracticemap.mjs --check` current,
> and `tmp_codecheck.mjs` **with TypeScript actually installed** — 671 blocks
> (482 TS, 189 Java), 0 errors. Installing `typescript@5.6.3` matters here: the
> default skip would have silently waved through every TS line added.


> **#5 (real anchors in the hub) LANDED 2026-09-05 — and was bigger than the
> audit framed it.** The audit said "make the 512 lesson links real `<a href>`".
> Doing only that would have measured better and helped nobody: the sidebar had
> **zero focusable elements at all**, because the track and section headers were
> divs too, so a collapsed branch keeps its anchors `display:none` and
> unreachable however well-formed they are. Fixed all three: lesson links are
> anchors with href, and both header levels are real `<button aria-expanded>`.
> Sidebar focusables **0 → 34**; the full Tab → Enter → Tab → Enter → Tab →
> Enter path now opens a lesson by keyboard alone.

> **#4 (wire lessons forward into practice) LANDED 2026-09-05.**
> `tmp_genpracticemap.mjs` inverts the 614 `ref:{label,file}` entries the banks
> already carried into `window.DEVHUB_PRACTICE` in `tracks-data.js`, and
> `devhub-chapters.js` renders a "Test yourself" strip at the end of the lesson.
> Lessons linking forward to practice: **2 → 202 (39%)**, with zero per-page
> edits — all 202 already loaded both scripts. Flashcard decks are NOT in the map:
> they carry no per-lesson refs, only a track index link, so decks can only be
> surfaced track-wide and that is still open.
>
> **Flashcard decks landed 2026-09-06.** Decks really do carry no per-card
> `ref` — a card is a fact ("Amazon S3"), not a question tied to one lesson —
> so there was nothing to invert at that granularity, and "track-wide" would
> have needed a second hand-authored deck↔track table alongside the one the
> generator already derives. Instead: every deck already pairs 1:1 with an
> existing exam (`flashcards-aws.html` ~ `exam-aws-developer.html`, etc.) —
> that pairing (`DECK_FOR_EXAM`, 16 entries) is the one hand-authored table,
> added to `tmp_genpracticemap.mjs` itself, not as a second block in
> `tracks-data.js`. Once a deck is pinned to an exam it rides that exam's
> *already-derived* lesson set for free: every lesson citing the exam gets the
> deck too, at the exact same per-lesson precision as the exam link, not a
> coarser track-wide fallback. `devhub-chapters.js`'s `buildPractice()` grew a
> third link kind (`['deck', 'Flashcards']` alongside practice/exam) — no
> other change needed there, since the map already carries `entry.deck` once
> generated. Result: **188 of the 202 practice-linked lessons (93%) now also
> get a Flashcards link**; the other 14 sit under exams with no deck yet
> (Java OCP has no `flashcards-java` deck, for example — correctly excluded,
> not a bug). Verified with a throwaway Playwright script: a lesson under
> `exam-ai-engineering.html` renders both "Exam · AI / LLM Engineering" and
> "Flashcards · AI / LLM Engineering" with the right href; a lesson under
> `exam-java-ocp.html` renders only the Exam link, no Flashcards. Full-site
> `tmp_vcheck.mjs` (535 pages, 519 registered) and `tmp_smoke.mjs` (535 pages
> clean, no new errors/overflow) both pass unchanged.

> **#6 (the individually broken pages) LANDED 2026-09-05.** (a) material-cdk's
> Google-Fonts `<link>` — the site's only render-blocking external resource —
> replaced with three inline Material SVG paths, so the 13-second blank
> rectangle cannot happen. (b) The appsec XSS page no longer XSSes itself:
> node labels and inspector text are escaped-on-output — the exact defense the
> page teaches (its reflected scenario's literal `<script>` label used to open
> a real script element, swallow four diagram nodes, and dead-lock every
> control). (c) typescript-declarations' hero — the one dead ▶ Run in the
> 438-engine sweep — got a real four-scenario engine (bundled .d.ts / @types
> fallback / global augmentation / hand-written drift), click-verified in
> Chromium: 5 distinct inspector states per scenario, correct green/red
> endings, controls re-enable. (d) The decorators Try It now teaches that a
> failed write to a non-writable property THROWS in module strict mode,
> instead of promising "silently ignored" and then contradicting itself with a
> red TypeError. And the gate learned the lesson: **tmp_smoke now flags any
> render-blocking external stylesheet or sync script in `<head>` as a real
> problem even when the fetch succeeds** — the structure is the bug, today's
> network is weather — verified red against a seeded page. (e), the clipped
> text, was already fixed in the 2026-09-03 overflow-wrap pass.

> **#7 (shared-file accessibility) LANDED 2026-09-05.** Four fixes, each in
> one shared file. A global `prefers-reduced-motion: reduce` collapse in
> devhub.css blanket-overrides the ~300 pages of unguarded per-page
> @keyframes/transitions CSS could never reach rule-by-rule — engines are
> timer-driven so the step walk keeps its pacing, only the glide stills, and
> tmp_shot screenshots become deterministic as a bonus. devhub-transitions.js
> (the one script effectively every page loads) sets `role="status"` +
> `aria-live` on every `.rt-inspect`, so the per-step payload on 437 pages is
> announced instead of updating in silence. Both code editors
> (devhub-codegrade.js, devhub-tryit.js) got the standard Esc-then-Tab escape
> hatch and codegrade lost its render-time `ta.focus()` steal — the keyboard
> trap is gone from every editor-bearing page, and the hint line says so.
> Quiz choices are now real radio/checkbox semantics (role, tabindex,
> aria-checked, Space/Enter to answer) inside a labelled radiogroup, and the
> 1–8/arrow shortcuts that existed invisibly since v1 are finally printed on
> screen — a shortcut nobody is told about is a feature nobody has.

#### 4. Wire lessons forward into practice by inverting the exam refs you already have

*1-2 days* — Three of the seven audits found this independently, which makes it the best-corroborated finding in the set. The recall machinery all works — 19 exams, 16 decks, 9 graded IDEs, all verified end to end in a browser — and it is reachable only from a sidebar track sitting 33rd of 34. A learner who finishes a lesson has nowhere to go. The data to fix it is already in the repo and already 100% valid, so the first 123 lessons cost zero new content.

**Evidence.** I confirmed both directions: `grep -l 'href="exam-\|href="flashcards-\|href="practice-' *visualizer.html` returns 2 of 465 lesson pages (both ds-* pages pointing at exam-dsa-interview.html); `grep -oh "ref:" exam-*.html | wc -l` returns 560, and the retention audit resolved all 560 to existing files with 0 broken, covering 202 distinct lessons. 292 of 465 lessons have no on-page recall of any kind — including 50/53 Spring Boot, 50/74 Angular, 18/19 Identity & Auth and 27/27 React, which is precisely your CIAM job surface. Inverting the existing refs lifts practice-linked lessons from 173 (37%) to 296 (64%) with nothing new authored.

**First step.** Write a one-off script that reads every exam bank's `ref:{label,file}` entries and emits a track→{exam,deck,practice} mapping keyed by lesson file. Then have devhub-chapters.js (already on all 512 pages) render a "Test yourself" footer strip after the last <h2> — one engine change plus one generated table, no per-page edits.

#### 5. Make the hub's 512 lesson links real anchors, and give search an empty state

*Half a day including the CSS reset* — Two auditors measured this separately. Every lesson link in app.html is a styled div with a click handler: no keyboard access, no middle-click-to-new-tab, no copy-link, no browser history, nothing for a crawler. It is one render function, and switching to `<a href>` with a preventDefault click handler keeps the SPA behaviour while restoring all of that at once. The blank-panel search miss is a two-line addition in the same file.

**Evidence.** app.html:171 styles `.page-link` with `cursor: pointer; user-select: none` — the tell of a div standing in for a link, which I confirmed in the source. Measured in Chromium after clicking every track open: {pageLinks: 512, pageLinkTag: ["DIV"], pageLinkHref: 0, secHeaders: 123, secHeaderTag: ["DIV"]}; 34 track-headers, 0 with tabindex, 0 with aria-expanded. A real 400-press Tab walk with everything expanded finds 7 stops total. The instrumented listener scan flags 43 of app.html's 48 click-handled elements as keyboard-unreachable — the worst page on the site. Separately, searching a non-matching string leaves #sidebar-tracks with innerText === "" and no message; `grep -n 'no result\|No match\|nothing found' app.html` returns 0 hits.

**First step.** In app.html:983-1021, build each link as `<a href="<file>" class="page-link">` and call preventDefault in the existing click handler; make .track-header/.sec-header `<button type="button">` carrying aria-expanded alongside the .open class. Add `button{all:unset}`-scale resets — the CSS already targets these by class. Give #search an aria-label while you're there.

#### 6. Fix the handful of individually broken pages

*An afternoon for all five* — Each is a small, self-contained defect on a page that currently teaches nothing or teaches the opposite of its point. Together they are maybe an afternoon, and the material-cdk one is the only page on the entire site that can render a blank screen.

**Evidence.** (a) angular-material-cdk-visualizer.html line 7 — I read it: `<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />`, the only render-blocking external resource across 528 pages. FCP measured 13,112ms against a site median of 312ms; with the host hanging, at 2.5s paintEntries=0 with 979/1010 elements laid out — a solid dark rectangle. It needs exactly three icons (lines 558, 561, 776). tmp_smoke files it as "failed only on OUTBOUND NETWORK — expected in a sandbox" and then prints "✓ 1 page(s) clean". (b) appsec-injection-xss-visualizer.html:397 puts a literal `<script>` in a node label that line 481 concatenates into innerHTML; the real script element swallows 4 of 5 diagram nodes, applyStep throws `Cannot read properties of null (reading 'classList')` at line 499, and because the throw escapes tick() the `disabled=true` set on Play and all five scenario buttons at line 508 is never lifted — the page is dead until reload. (c) typescript-declarations-visualizer.html ships a full rt-* hero including `<button class="rt-run" id="tdRun">` at line 175 that no script references — `grep -n tdRun` returns one line, the markup itself; it was the only page in the 438-page sweep with 1 inspector state on all four scenarios. (d) typescript-decorators-visualizer.html's Try It throws a red TypeError exactly at the line commented "silently ignored", because transpileModule emits "use strict" — the punchline line never runs. (e) tmp_smoke already names 121 clipped text elements on 73 pages (an h2 overflowing by +141px on interview-system-design), where the sentence is simply invisible on a phone.

**First step.** Delete angular-material-cdk-visualizer.html line 7 and swap the three `<span class="material-icons">` glyphs for inline SVG or Unicode ♥ / + / ☰ — that leaves the whole 528-page site free of render-blocking third-party requests. Then teach tmp_smoke to distinguish a network failure on a lazy resource from one on a render-blocking <link> in <head>, so the next one can't hide in the sandbox bucket.

#### 7. Four shared-file accessibility fixes that each cover hundreds of pages

*About an hour total* — These are near-zero-effort because they all live in shared files, and two also help you directly: the reduced-motion block makes tmp_shot screenshots deterministic, and dropping the codegrade autofocus removes a dead end anyone can hit by pressing Tab. Grouped because individually none justifies a slot; together they are an hour.

**Evidence.** (1) prefers-reduced-motion appears in 3 of 528 pages while 300 pages define unguarded @keyframes/transition; under Playwright's reducedMotion:'reduce' across 20 pages, 1,660 elements were still transitioning and `.rt-chip`'s computed transition was byte-identical in both modes. devhub.css:557 already uses the correct `no-preference` polarity for hover-lift, so the intent exists — it just never reached per-page CSS. (2) I confirmed 437 pages carry `.rt-inspect` and 0 have aria-live on it; the per-step payload — the actual HttpRequest, the JWT claims — is announced to nobody. (3) I confirmed devhub-codegrade.js:899 and devhub-tryit.js:419 both capture Tab with no escape hatch; only codegrade calls `ta.focus()` (line 990) on render, so on the 9 practice pages focus lands in the editor on load and 15 Tab presses later is still there, having typed indentation into the code — Run, the language tabs and the back link unreachable. (4) devhub-quiz.js:531-541 has a working 1-8/arrow shortcut that appears nowhere on screen, and `.dq-choice` is a bare div with no role, tabindex or aria-checked across 19 exams / 560 questions.

**First step.** Add the global `@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}` block to devhub.css — one edit, 300 pages. Then add three lines to a shared script setting `role="status"` on every `.rt-inspect`, drop the `ta.focus()` at devhub-codegrade.js:990, and gate both Tab handlers behind an Escape flag.

#### 8. Correct four pages that teach something false, and build the harness that found them

*A day for the four pages; another day for the harness* — These are the only findings where a learner comes away actively wrong, and one is a deep-dive page whose entire subject is the thing it gets backwards. The structural lesson matters more than the four fixes: in every case the authored prose was right and the interactive payload — CodeWalk note:/vars:, scenario res:, .intro cards — was wrong. That is the layer the animation says out loud when attention is highest, and no gate reads it as code.

**Evidence.** I reproduced the worst one myself: typescript-generic-inference-deep-visualizer.html:274-278 animates `merge("a", 42)` to a green ✅ reading "T = string|number. TS picks the union when types differ", and `tsc --noEmit --strict` on that exact signature gives `error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'`. The suggested fix `merge<string>("a",42)` is also an error. Same false model at line 336 (`pair(1,"x")`), and the clamp/NoInfer CodeWalk at line 454 has both halves inverted. Angular: I confirmed 7 pages still emit `provideExperimentalZonelessChangeDetection`, removed in v21; five pages give five different stability answers, and angular-zoneless-deep's intro (L85) contradicts its own body (L224). exam-angular.html #12 names the correct API — the exam bank is more current than the lessons. Java: the StructuredTaskScope CodeWalk fails `javac --release 21 --enable-preview` with `Subtask<U> conforms to Future<User>`, and is labelled a stable Java 21 feature when it is preview. SQL: sql-transactions-visualizer.html says phantoms are prevented at REPEATABLE READ in its table (L283) and prose (L120) and not prevented in its CodeWalk (L359-360).

**First step.** Start with typescript-generic-inference-deep-visualizer.html:274-278 — the green ✅ on non-compiling code is the most misleading single thing found in the whole audit. Recast it as a red scenario ending in TS2345, and move the union example onto the page's existing `paint(["red","blue"],"green")` case, which is correct and compiles. Then consider a hand-run frontend/tmp_codecheck.mjs that extracts <pre> and CodeWalk `code:` arrays and compiles the TS/Java ones, ignoring blocks adjacent to an ❌ marker — it caught all four defects at 30 candidates read for 4 real hits.

#### 9. Fix the dark theme's genuinely invisible text, then darken ~10 shared tokens for AA — ✅ 2.2-FLOOR LANDED (2026-09-05), BIGGEST AA TOKENS LANDED (2026-09-06), 3 remainders still open

*Half a day for the dark 2.2 fixes; another half for the AA tokens* — Two separate problems the same tool measures. The first is unambiguous: text below the site's own "is it invisible" floor, on the theme nobody has ever run the gate against. The second is a policy call — 1,816 selectors sounds catastrophic but is really about ten shared components, and the code comments carrying your line-by-line explanations are among the least legible text on the page.

**Evidence.** `tmp_contrast.mjs --theme=dark --min=2.2` over all 528 pages: "✗ 31 distinct selector(s) under 2.2:1, across 57 page(s)" — .topbar span at 1.37:1 on 12 pages, .cw-head span.cw-title (the CodeWalk's own title) at 1.95:1, .panel button at 1.81:1 (white on white), .cg-editor .cg-gutter at 2.19:1 on 9. Cream is clean at 2.2 on all 528, and the tool defaults to cream (tmp_contrast.mjs:44), which is why the espresso half was never measured. At the real AA bar: cream 1,816 selectors / 524 pages, dark 546 / 495, and the head of both lists is shared components — .hf-rail a 3.61:1 on 483 pages, .cw-line .cw-ln 4.45 cream / 2.24 dark on 464, .rt-ctlbar .rt-pill 3.25 on 428, .rt-inspect .rt-dir 3.94 on 424, .userseg button.on (the SELECTED chip) 2.77 on 155. Font sizes were measured against html{zoom:1.12} — .hf-rail a 10px/400, .rt-pill 11px/400, .cw-ln 12.5px — none qualifies for the large-text exemption, so 4.5 is the right bar.

**First step.** Run `node frontend/tmp_contrast.mjs --theme=dark --min=2.2` and fix those 31 selectors — mark the deliberately faint connector glyphs (.lc-arrow, .hier-arrow, .pg-arrow) aria-hidden rather than recolouring, since the tool already exempts those. Then darken .cw-ln and the .cm comment colour first: they carry the line-by-line explanation and are the widest-reaching offenders in both themes.

**Landed 2026-09-05 — the 31-selector floor.** All 31 are fixed; `tmp_contrast.mjs --theme=dark --min=2.2` is clean across all 535 pages. Root causes, not instances: (1) seven decorative connector glyphs (.topbar's ›, .twig, .pg-arrow, .lc-arrow, .hier-arrow, .pecs-arrow, .lconn) marked `aria-hidden="true"` — two (.hier-arrow, .lconn) carry real text ("↓ extends", "▲ …▲") and were recoloured instead, per the standing rule. (2) The site-wide "track-accent leak" (devhub.css's `body.track-*{--accent}` re-declares one level below `:root`/`[data-hf]`, so a track's own hue always wins over both a page's local `:root` override and the kit's cream/mocha remap) was silently pairing white text with light track accents (teal #2dd4bf on track-tools, cyan #22d3ee on track-identity) at 1.81–1.86:1 on 8 badge/tab/button components across 8 pages, plus the generic `button{background:var(--accent);color:#fff}` pattern on 4 more (this was the "flaky .panel button" cluster from an earlier pass in this session — it isn't flaky, a broken local probe script made it look that way; static cascade analysis reproduced it exactly). Fixed with a fixed dark-navy `color:#04263f`, which clears every candidate accent the leak can produce. (3) Four `*-gutter` line-number columns (`.cg-gutter`, `.pp-gutter`, `.sp-gutter`, `.tsp-gutter`) shared one hardcoded `#3a4a63`; repointed to existing muted tokens. (4) `.cw-btn:disabled` lost its background/color to a page-local `button:disabled` rule on specificity alone; restated both. (5) `body.track-csharp`'s `--accent2` (the literal #512bd4 .NET logo) measured 1.95:1 as text; lightened at the same hue. (6) `.hf-note code`/`.styled-box code` were repainted by the kit's `[data-hf] code:not(pre code)` regardless of the note's own light background; both inherit the note's ink now. (7) Six more single-page hardcoded-hex mismatches (star ratings, a check-mark column, an empty-log caption, a runner's muted line, a debug-table cell, a portal icon).

Also done, per "First step"'s second half: `.cw-ln` (2.24:1 dark) and both `.cm` comment-token rules (`.cw .cm` 3.73:1, `pre .cm` 4.23:1) were stepped up in hue — `.cw-ln` to 2.93:1 (kept deliberately muted, matching cream's own .cw-ln repair philosophy: furniture text, not competing with the code), the two `.cm` rules to 4.78:1 / 4.89:1 (full AA — comments carry the teacher's own words, unlike gutter numbers). Verified these changes don't regress cream: cream's `[data-hf]` repair layer for `.cw-code .cm`/`.cw-ln` overrides them anyway on kit pages, and the ~15 non-kit legacy-light pages, which have no such repair, measured a net *improvement* under cream too (same hardcoded-dark console background in every theme).

A full cream re-run surfaced three unrelated pre-existing failures on pages outside the 31 (added since the audit's 528-page count, at 535 now) — `.demo-area .code-live` and two components whose state classes swap in a hardcoded near-black background (`.svc-node`/`.flow-node`, `.saga-step.comp/.done/.active-step`) where the label text still rode a var(--text)/var(--muted)/var(--bad) token tuned for a pale ground. Fixed the same way as (2) above: hardcode to the dark theme's own light tones for the hardcoded-dark states, leave the token alone everywhere else. The saga case only shows up while the demo is mid-step, which is why a plain page-load scan missed it — a `--settle=` bump would catch this class of bug more reliably than re-running and hoping.

**AA token sweep landed 2026-09-06 — the biggest shared tokens, not the full list.** Root
cause for most of the cream-theme half: `--muted` (devhub.css's original token, already
correctly tuned 4.92-5.53:1 on cream) and `--hf-muted` (devhub-hf.css's separate token for
Head First components, same semantic role, drifted to `#82796a` / 3.21-3.61:1) had silently
diverged — same role, two values. Retuned `--hf-muted` to devhub.css's own already-correct
`#645c50`. Similarly `--hf-blue`/`--info`/`--blue` (`.rt-pill`/`.rt-dir` and inline links) were
darkened from `#3d6795` to `#1d3f61`. For `.hf-youarehere`/`.hf-kick`/`.hf-practice-kick`/
`.hf-practice-link`/`.hf-railnext` (orange-as-text, 3.21-3.61:1) the fix borrows the kit's own
pre-darkened sibling token `--hf-orange2` (`#8c491a`, 5.09-5.72:1 — already exists specifically
for "text needs more contrast than the decorative accent", used elsewhere for `.hf-bub.right
.who`) rather than darkening `--hf-orange` itself, which also serves as a border/dot/tape
decorative color and would have dimmed those on every page. `.hf-youarehere` alone reaches all
490 pages carrying the chapter rail. Every candidate was verified against the real site first
via `tmp_contrast.mjs --inject=candidate.css` (a dry run, no file edits) before being ported
into `devhub-hf.css` for real — caught one CSS-specificity trap this way: the kit's cream
override block is written as a `:root:is(...)[data-hf], :is(...)[data-hf]{}` comma-joined
pair (the `:root`-prefixed half carries one extra specificity point), so a candidate rule
must match or exceed that or it silently loses regardless of source order. Dry run predicted
cream AA selector count **1,844 → 1,710**, pages **526 → 519**; the real applied numbers
(`tmp_contrast.mjs --theme=cream --min=4.5`, 536 pages) came in at **1,705 selectors / 520
pages** — matches within noise, the 1-page difference being `node-database-visualizer.html`
itself (added this same session, contributing its own small set of AA candidates). Only the
CREAM-scoped override block was touched, but the real dark-theme AA gate
(`--theme=dark --min=4.5`) also came in lower than item 9's original 546/495 baseline, at
**531 selectors / 494 pages** — residual benefit from the earlier 2.2-floor pass (`.cw-ln` to
2.93:1, `.cm` to 4.78/4.89:1 dark, both crossing above the 4.5 AA bar), not from this session's
cream-only edits. Re-verified after the real edit that the invisible-text floor still holds on
both themes: `tmp_contrast.mjs --theme=dark --min=2.2` is clean across all 536 pages, and
`--theme=cream --min=2.2` found only 1 selector under 2.2 across 1 page (`.g2 div.thread-box.new`
at 1.56:1, on `interview-java-concurrency-visualizer.html` / `java-concurrency-advanced-
visualizer.html`) — confirmed pre-existing and unrelated: it uses `--muted` (untouched) for its
border and a hardcoded dark background (`#090e1a`), neither of which this pass touched.

**Still open — three deliberately scoped-out remainders**, each a genuinely separate root
cause from the tokens above: (1) `.cw-ln`'s resolved color (`#94816f`) couldn't be traced to
any rule found by reading the source (not `--hf-muted`, not the `.cw *{color:var(--pl-syn,
inherit)}` rule confirmed via a runtime `document.styleSheets` walk) — already close to
passing (4.45 vs. 4.5) and left open given diminishing returns on further cascade debugging.
(2) `.userseg button.on, .seg button.on`'s 16%-accent-wash pattern fails in DARK theme for
very-low-luminance per-track accents (e.g. Ping's `#be1522`, 2.77:1) — a different root cause
(per-track accent luminance variance across 33 tracks) than the earlier LIGHT-theme wash fix,
needing its own audit. (3) The `.cm` comment-token variants recur across many different
container classes (`.card`, `.code`, `.panel`, `.demo-card`, `.container`) — likely per-page
hardcoded duplicates rather than one shared token, a messier problem than a clean token swap.

#### 10. Make the streak count retrieval, and let learners retake the questions they missed — ✅ LANDED (2026-09-06)

*A day for both; the due-date clock is a separate, larger piece* — Both are small changes to existing engines and both target the thing the site is for. Today a day spent re-drilling Spring flashcards breaks your streak, and after scoring 27% on an exam you are told which domain was weakest but can never see or re-attempt the 16 specific questions you failed — the next attempt reshuffles a fresh random draw, so hitting them again is chance.

**Evidence.** I confirmed `touchStreak()` has exactly one call site: app.html:688, inside setStatus, which only fires from autoVisit's `if (!progressCache[file])` first-visit branch or the Mark-as-Learned toggle. Measured: a 5-day streak plus one day of pure review collapses to {"lastDate":"...","count":1}. A full 22-question timed exam and a flashcard session both wrote their own stores and left dlh_streak_v1 untouched. For misses: devhub-quiz.js:472 persists `{at, mode, pct, correct, total, domains}` and nothing else — a real run produced dlh-quiz:git with domain tallies and no question ids; `grep -niE "retry|missed questions" devhub-quiz.js` → 0 hits. The bank entries already carry stable `id` fields. Related and worth knowing: `grep -c "Date\|getTime\|now()" devhub-flashcards.js` returns 0 — the Leitner boxes have no clock, so nothing is ever "due", and README/DEVHUB-GUIDE's "spaced repetition" is currently weakness-ordered practice.

**First step.** Add `missed: [qid]` to the attempt object in devhub-quiz.js finish() and a third mode beside Practice/Exam that draws from that id set. Then export a small DevHubStreak.touch() and call it from quiz finish(), flashcards grade(), devhub-hf-check on first answer, and codegrade on a passing run — and from autoVisit on any visit, not just the first.

**Landed 2026-09-06.** `devhub-transitions.js` — already the one script effectively every
page loads — now also exports `window.DevHubStreak = { touch }`, an independent copy of
app.html's touchStreak()/dlh_streak_v1 algorithm (same key, same day/yesterday logic; kept
in sync by hand, not by a shared import, because this script runs standalone too, with no
app.html window to call into). Wired into the four places a learner demonstrably shows up:
devhub-quiz.js finish(), devhub-flashcards.js rate(), devhub-hf-check.js's answer click, and
devhub-codegrade.js's passing-run branch. app.html's autoVisit() now calls touchStreak()
unconditionally instead of only inside the first-visit branch, so a pure review day counts.
Missed-question retry: devhub-quiz.js finish() now records `missed: [qid]` on every saved
attempt; the results screen grows a "🎯 Retry N missed" button next to Retake, and the
landing screen surfaces the same set from the last saved attempt as its own mode card
("Retry N missed questions") so it survives leaving and coming back. Retry sessions behave
like Practice (instant reveal, no timer) and are tagged `mode:'retry'` in history so they
don't get confused with a real Practice/Exam attempt. Verified end-to-end in Chromium
(via `playwright-core` paired with the system Chrome — see the note at the end of this
section): ran a full exam, got a real miss count, confirmed the retry button and card,
completed a retry session, confirmed streak and history entries wrote correctly.

**Bonus fix found while testing, unrelated to the ask but in the same file:**
devhub-quiz.js's `question()` built a `.dq-topbar` (progress bar + exam countdown) but never
attached it to the rendered card — `screen(card)` only ever painted the card. The timer still
ran internally and could end an exam with zero visible warning; the "3 / 20" progress count
never appeared either. One-line fix: `screen(h('div', null, topbar, card))`. Pre-existing on
`HEAD`, not introduced by this pass — confirmed via `git show HEAD:frontend/devhub-quiz.js`.

**Deliberately not done** (out of scope per this item's own "Evidence"): the due-date clock
for flashcards — `devhub-flashcards.js` still has no notion of "due", so Leitner study order
stays weakness-first rather than schedule-driven. That is the separate, larger piece the
roadmap text already called out.

#### 11. Surface learning-paths.html and paint completion state on its steps — ✅ LANDED (2026-09-06)

*Half a day for surfacing plus step state; a day more to author the CIAM path* — It is the only ordered curriculum on the site, its own subtitle says "a library has no finish line; a path does", and no page links to it. Fixing discoverability is a card on the welcome screen; fixing the steps is one localStorage read. The CIAM path you actually care about exists only in a markdown file a learner never opens.

**Evidence.** `grep -n "learning-paths" frontend/*.html frontend/*.js` returns exactly one hit — tracks-data.js:900, its own registration. Zero inbound links from any of 528 pages, including exam-readiness.html in the same section. Measured sidebar position: category 6 of 6 → track 5 of 5 → section 1 of 10, with both accordions defaulting closed. The welcome screen measured anyStartHereText: false, pathsLinkOnWelcome: []. The page reads DevHubQuiz.loadHistory for its capstone but never reads dlh_progress_v1, so a learner ten steps into a twelve-step path sees the day-one screen. Coverage is also inverted against your job: Azure/GCP/K8s/DataSci/AI all 100%, but Identity & Auth 4/19 (21%), Angular 17/74 (23%), Spring Boot 17/53 (32%); and DEVHUB-GUIDE's 11-step featured CIAM path has 4 steps that appear in no in-app path at all.

**First step.** Add a "New here? Start with a path →" card at the top of #welcome in app.html above the progress card, and cross-link exam-readiness.html. Then in learning-paths.html's step renderer (lines 391-400) read dlh_progress_v1 and paint ✓ learned / ● visited / ○ untouched using the same three-state vocabulary app.html:refreshUI() already uses.

**Landed 2026-09-06.** app.html's `#welcome` now opens with a `#start-here-card` (above
`#progress-card`, matching the same gradient-panel treatment) offering "🗺️ Browse learning
paths" and "📋 Exam readiness dashboard" — both call the existing `navigateByFile()` used by
Resume Learning, which resolves the sidebar's own track-label/title metadata so no duplicate
data was added. learning-paths.html now reads `dlh_progress_v1` once at render and paints
each step's dot + a trailing `.step-status` glyph (`✓`/`●`/`○`) using the same three colours
(`--good`/`--blue`/`--muted`) the vocabulary already implies elsewhere on the site — old
saved history with no `missed` field, or a first-time learner with no progress at all,
degrades to the untouched state rather than erroring. Verified in Chromium: seeding
`dlh_progress_v1` with one step marked `learned` and reloading painted that step's dot
`dot learned` with a `✓` glyph; clicking the new welcome-screen buttons drove the hub's
breadcrumb and iframe to `learning-paths.html` exactly as a sidebar click would.
**The "a day more" landed 2026-09-11.** `learning-paths.html` gained a 14th path, **CIAM
App, End to End** — the 11 steps of DEVHUB-GUIDE's featured path, in the guide's own order.
That is what finally gives the 4 orphans an in-app home: `spring-boot-multi-idm-claims-deep`,
`spring-boot-http-exchange-deep`, `spring-boot-bff-token-relay-deep`, and
`angular-openapi-client-deep` were previously reachable only by finding them in the sidebar.
Re-measured against the guide after the edit: **0 of the 11 steps orphaned.**

It is deliberately a NEW path rather than four steps appended to *Identity & Access*. The two
teach different things and merging them would have blurred both — the existing path teaches
the **protocol** (keys → token anatomy → OAuth/OIDC flows → the classic failures), this one
teaches the **application** (one login, traced through every layer that touches it). Several
pages legitimately appear in both, which is evidence they are different curricula rather than
duplicates.

Both paths point at `exam-identity-access.html` as their capstone, so both report the same
best score. That is not a bug to route around: it is the site's only identity exam, the
renderer keys history off `examId`, and the alternative would have been inventing a second
exam id with no question bank behind it.

Verified in Chromium rather than by inspection — the card renders "11 lessons → 1 exam",
numbered dots 1–11, per-step `○` untouched glyphs, and a capstone row reading "Not
attempted"; `tmp_vcheck.mjs` green at 537/521 and `tmp_smoke.mjs` clean on the page.

#### 12. Split devhub-hf-theme.js's contrast repair into a read phase and a write phase — ✅ LANDED (2026-09-06)

*A day* — It is the largest main-thread cost on every lesson page and the fix is a well-understood refactor, not a redesign. Ranked last of the real items because it costs responsiveness on mid-range phones rather than breaking anything, and because CLAUDE.md documents the pass as load-bearing for cream legibility — so this is optimisation, not removal.

**Evidence.** Ablation at 4x CPU throttle with the script stubbed to an empty body: typescript-fundamentals-visualizer.html goes from 10,458 getComputedStyle calls / TBT 1,060ms / 284ms style recalc to 0 calls / TBT 603ms / 143ms — 457ms of blocking time from this one script. angular-rxjs 313ms attributable, collections 180ms. CPU profiling agrees: 467ms self-time versus 85ms for the next-largest script on the page. The ratio is the tell — angular-rxjs makes 13,378 getComputedStyle calls over 2,135 nodes to apply 156 inline colour writes. Cause is repair() at devhub-hf-theme.js:198-246: getComputedStyle at 203, groundOf walking ancestors with more getComputedStyle at 143, then style.setProperty at 245 inside the same loop, so each write invalidates style and the next read forces a synchronous recalc. Google's "good" TBT bar is 200ms. Worth noting this cost is partly downstream of per-page .who-* colours living in inline <style> where CSS can't reach them.

**First step.** Split repair() into two loops: collect every element's computed colour and ground into an array first (pure reads), then apply all style.setProperty writes in a second pass. Also widen the groundOf cache — line 152 only caches when stack.length is 0, so translucent-panel subtrees re-walk to the root for every child.

**Landed 2026-09-06.** `repair()` is now two loops exactly as scoped: a read phase that
collects `{el, fixed, bgL, done, origColor}` for every node needing a fix (plus a separate
`toRestore` list for nodes whose ground moved back to readable) with zero DOM writes, then a
write phase that applies every `dataset`/`style.setProperty` change. This is safe because
color writes never feed background reads — `repair()` only ever writes `color`, and
`groundOf()` only ever reads `backgroundColor`/`visibility`/`display`/`opacity`/`textContent`,
so batching every read before any write changes nothing about which fix gets computed, only
how many synchronous style recalcs the browser is forced into while computing them.

`groundOf`'s cache was widened as suggested, but not by removing the old `stack.length===0`
guard — that guard was load-bearing: the old cache stored the fully-COMPOSITED ground at a
node, which is only reusable by a caller whose own translucent-layer stack was identical
(usually zero), so caching it unconditionally would hand a wrong, path-dependent color to a
different caller reaching the same node through different translucent panels. Instead the
cache was changed to hold each element's own raw parsed `backgroundColor` — a fact about that
element alone, true for any caller regardless of what it collected below it — so every node
visited during a walk is now cached, not just a walk that happened to have no translucent
layers first. The (cheap, pure-math) per-caller compositing walk still runs on every call;
only the (expensive) `getComputedStyle` read is now shared across callers that pass through
the same ancestor.

Verified two ways. Functionally: `node tmp_smoke.mjs app.html learning-paths.html
head-first-decorator-visualizer.html abstraction-visualizer.html` (plus the quiz/flashcard/
codegrade pages touched by item #10) — 0 uncaught errors. Correctness of the repair itself:
ran `tmp_contrast.mjs --theme=cream --min=2.2` against a sample of Head First / kit pages with
this file swapped for the pre-refactor `git show HEAD:` version and again with the refactor,
multiple times each — both versions show the exact same *pre-existing* flake on
`angular-rxjs-visualizer.html`'s `.marble-track div.bead.err` (a continuously-looping marble
animation whose CSS color transition can be sampled mid-flight by any fixed-delay snapshot,
same class of race already documented above for angular-dynamic-components), at a similar
rate on both old and new code — confirming the refactor did not introduce it. Full-site
`tmp_contrast.mjs --theme=cream --min=2.2` sweep on the refactored code (535 pages, `--settle=500`):
534/535 clean, one surviving selector — `.gen span.obj.meta` on `jvm-memory-visualizer.html`,
worst ratio ~1.0-1.4:1 across repeated runs. Root-caused the same way as the marble-track case
above: `.obj` (jvm-memory-visualizer.html:78) carries `transition: all 0.4s ease` and these spans
are (re)written into `#metaHeap` by the page's own GC-animation script, so a fixed-delay snapshot
can sample mid-transition colour — a third instance of the exact race already documented in this
file's own comments (devhub-hf-theme.js:351-365) for angular-custom-directives and
angular-dynamic-components. Confirmed pre-existing, not a regression: swapped in the unmodified
`git show HEAD:` version of devhub-hf-theme.js and reran 4x — same selector failed 4/4, with the
same varying-but-same-hue rgb pattern as the refactored code (also 4/4 in that run). No code
change made for it; it's the same class of pre-existing timing bug as the marble-track flake,
out of scope for this item.

Perf re-measurement (DevTools CPU throttle, this pass) not yet re-run against the original
10,458-getComputedStyle / 457ms figure — the structural fix (batched reads, batched writes,
per-element background caching instead of per-walk) is the same shape as the standard
layout-thrashing fix and should substantially cut both, but the exact before/after numbers on
this machine are still open if Bobby wants them confirmed against the original ablation.

**A note on how this was verified locally at all:** this machine had no Playwright install
(the other browser gates — tmp_shot, tmp_smoke, tmp_contrast, tmp_creamrace — have been
undeployable here per earlier sessions). `npm i -D playwright-core` (small, no browser
download) pairs with the system Chrome at `C:\Program Files\Google\Chrome\Application\
chrome.exe`, which tmp_pw.mjs already tries as a fallback candidate — so all four browser
gates are now runnable locally, not just in the cloud sandbox. `frontend/node_modules`,
`package.json` and `package-lock.json` are already gitignored (see the "Throwaway local test
tooling" block) and were left in place rather than reverted.

### Measured healthy — do not spend effort here

- Registry integrity is immaculate — 512 registered entries, 512 unique files, 0 duplicates, 0 registered-but-missing, 0 orphan lesson pages (the 16 unregistered files on disk are all infrastructure). tracks-data.js is a genuine single source of truth.
- Page-level robustness: loading all 512 registered pages in Chromium produced 0 uncaught page errors and 0 load failures. tmp_vcheck passes cleanly at 528 pages / 512 registered.
- Caching and page weight are far healthier than expected. Five lesson navigations in one session hit every shared asset exactly once; the warm second navigation transfers 4.4KB with 446KB served from cache. Median lesson page: FCP 312ms, max DOM depth 12 across all 77 sampled pages, and exactly one render-blocking external resource on the whole site (item 6 removes it).
- The scenario engines work. 436 of 438 rt-* pages animate with distinct per-step inspector states across multiple scenarios — the two exceptions are named in item 6. The pacing is wrong; the mechanism is not.
- The assessment layer is verified working end to end in a browser: 19/19 exams (560 questions, all with per-choice reasoning, all 560 refs resolving to existing files), 16/16 flashcard decks (459 cards, Leitner boxes persisting), 9/9 graded practice IDEs across 4 languages with real test diffs. The notebook round-trips too.
- Shared-script wiring has zero drift in both directions: 231/231 <pre>-bearing pages load devhub-syntax.js and 0 load it without a <pre>; 465/465 CodeWalk, 119/119 Try It, 21/21 quiz, 9/9 codegrade pages all load their engine. The 15 pages that link no devhub.css load only the self-injecting devhub-transitions.js, so the self-containment rule is holding.
- Code samples are overwhelmingly correct where it counts: 43/43 extracted Java snippets compile on JDK 21 (0 needing anything newer than CheerpJ's Java 8 target), 22/23 Python snippets run, 29/30 TypeScript widgets transpile and run clean.
- Security and framework content held up under scrutiny — NIST SP 800-63B-aligned password guidance with no weak-hashing advice anywhere, implicit flow marked dead on all 6 pages that mention it, PKCE as default, and correct Spring Security 6 migration facts across rbac-deep, method-security-deep and oauth2-resource-server. All 25 exam-typescript and 27 exam-angular explanations read end to end with zero errors.
- Offline degradation is honest and fast. Every playground and Try It widget prints a clear message within ~0.6s and re-enables its Run button; nothing hangs. The CDN loads for pyodide/sql.js/typescript/CheerpJ are all lazy and off the critical path.
- The cream theme passes its own 2.2 floor on all 528 pages, every page sets lang="en", the focus ring at devhub.css:441 is real and no stylesheet anywhere sets outline:none, and the cream-legibility race documented in ROADMAP.md no longer reproduces (6/6 runs at 4.92:1).
- Pages are genuinely distinct hand-authored material, not template clones — only 27 of 528 pages fall into near-duplicate pairs, and those are the deliberately generated flashcard/practice/index families. The inline JS is mostly per-page teaching DATA (only 10.3% duplicated logic), and 82% of the 438 scenario pages already share one uniform data contract.

### Known, deliberately deferred

- The `.hf-rail` "you are here" label is centre-aligned rather than positioned
  over the current stop, so on a section-final page it floats above the wrong
  dot. Cosmetic, pre-existing, noticed while shipping the Next-up link.
- Discarded for weak or out-of-scope evidence: the heading-order sweep, splitting
  `devhub-hf.css`, the nginx `immutable` bug (the live site is GitHub Pages, so
  that config is not in the serving path), dead per-page CSS, consolidating the
  458 hand-rolled stage engines, `.who-*` palette drift, and cross-device sync.
  Full reasoning in the audit output; none was dropped for being fabricated.

---

## ★ ACTIVE BACKLOG — Bobby's feedback pass (2026-08-29, evening)

Bobby reviewed the site and gave a big feedback batch. Items below are ordered by his emphasis.
Rules of engagement he restated (also codified in `CLAUDE.md` + memory so he never has to
repeat them): every code snippet explained line-by-line in depth (never a one-liner), IDE-grade
syntax coloring on ALL code, the Head First brain-friendly aesthetic on ALL subjects (not just
the Java patterns pages), colored/manipulated text as a deliberate memory device.

### 1. Head First rhythm — sitewide rollout (✅ COMPLETE 2026-09-12 — 0 pages left in the 40–60 band)
The design language shipped and is opted into on **515 of 530 pages** (`<html data-hf>`), and
**all 474 scored lesson pages are now authored to the full nine-point rhythm**: deck line, problem/fix cards, a
"one thing to remember" principle callout, a three-way dialogue, ONE shape-matched mechanism
diagram, a knowledge check, "where you've seen this before", back-row Q&A, napkin predict-note.

**✅ SWEEP STARTED 2026-09-11, FINISHED 2026-09-12.** Bobby approved it ("lets do all of those
things you proposed, in that order"), so the 40–60 band was authored one page at a time, each
block teaching ONE specific, verified gotcha the page did not already cover. The last 24 pages
were split across **3 Sonnet subagents (8 pages each)** rather than 6×4 — fewer agents amortise
the fixed cost of reading the standard/recipe/exemplar better — and every page scored 86–97
(gate was 75), all passing `tmp_vcheck.mjs`/`tmp_smoke.mjs` clean.

Band movement (`node frontend/tmp_hfaudit.mjs`, 474 scored lesson pages):

| band | before the sweep | now |
|---|---|---|
| under 40 (thin) | **0** — was 69 | **0** |
| 40–60 (design, not yet the rhythm) | 363 | **0** |
| 60–75 | 5 | 9 |
| 75+ (at the bar) | 102 | **465** |
| mean score | 57.2 | **90.5** |

Remaining 9 pages in the 60–75 "solid" band are not thin — they have the rhythm but score just
under the 75 cutoff (shell-aws-cli, shell-cli-basics, shell-azure-cli, shell-gcloud-cli, streams,
design-patterns, solid, and two config/typescript pages). Not part of this sweep's scope; pick
up only if Bobby flags them specifically.

Two things the first measurement pass established, both of which shaped how the sweep is being
run:

- **All 363 pages in the band scored `recall` 0, and 362 of them scored `hooks` 0.** The band was
  not a spread of partially-finished pages — it was 363 pages with the design language applied
  and none of the teaching. That is why each block is authored rather than templated: there was
  nothing to top up.
- The weakest dimensions sitewide are still `hooks` (44.6 mean) and `recall` (47.8), then
  `visual` (57.6). `structure` is 99.7 — the scaffolding was never the problem.

Finished by hand on Opus (domain judgement matters most here, and these are Bobby's day job):
the **10-page identity/CIAM batch** and the **9-page Ping batch**, which took the whole `ping`
track from 44.8–54.5 to 85.6–93.8. Volume across the other tracks is carried by Sonnet
subagents working from `docs/HEADFIRST-BLOCK-RECIPE.md` — one page at a time, smoke-tested and scored before
moving on.

Diagram choice is by SHAPE, never at random:
`.hf-nest` contains, `.hf-slot` plugs, `.hf-cast` fans out, `.hf-one` funnels, `.hf-steps`
gates, `.hf-cycle` returns.

Still genuinely missing sitewide: **static annotated diagrams between sections**. The animated
visualizers carry most of the visual load, and `visual` is the weakest dimension after
`explain`.

### 1b. Head First block variety — pages read as templated (Bobby's feedback, 2026-09-12)
After item 1 shipped, Bobby looked at the live `nosql-redis-visualizer.html` and called it out:
every swept page runs the exact same section order — deck line, problem card, fix card,
principle callout, sticky note, four-bubble dialogue, mechanism steps, one diagram, knowledge
check, "seen this before" cards, napkin summary — because `docs/HEADFIRST-BLOCK-RECIPE.md`
mandates that one shape verbatim on all 474 pages. The content (the gotcha, the diagram pick)
varies; the skeleton never does, which is why back-to-back pages read as copy-paste. Real Head
First spreads vary WHICH device leads a given page — sometimes just one big diagram, sometimes
just a Brain Power question, sometimes just the dialogue — not one-of-everything every time.

**Real lever found, not yet used:** `devhub.css` already ships several fully-styled devices that
never made it into the recipe's one shape: `.hf-brain` (Brain Power — dashed-border "stop and
think" box), `.hf-qa` (`<dl class="hf-qa">` — "There Are No Dumb Questions" Q/A sidebar, Q:/A:
prefixes added by CSS), `.hf-vs` (exaggerated before/after two-column contrast grid), `.hf-big`
(one giant gradient-text sentence), `.hf-arrow` (handwritten arrow annotation pointing at the
content above/below it — `.up` variant points up), plus the inline `.hf-mark`/`.hf-g/r/a/v/c`
color utilities. None of these are in the current recipe at all.

**✅ PILOT BUILT 2026-09-13 — 8 pages, 4 shapes, uncommitted and waiting on Bobby's verdict.**

Four alternate shapes were designed from the unused kit and each piloted on two already-authored
pages by a parallel agent, re-staging the page's EXISTING gotcha rather than writing a new one:

| shape | silhouette | pilot pages | score |
| --- | --- | --- | --- |
| **A — There Are No Dumb Questions** | `hf-big` → `hf-qa` sidebar carries the whole lesson → two diagrams → check | typescript-generics · spring-boot-bean-lifecycle | 81.8→84.4 · 93.8→96.5 |
| **B — The Receipt** | `hf-receipt` tally → `hf-vs` → `hf-chain` → code + `hf-arrow` scribbles → check → closing `hf-big` | aws-cost · react-performance | 93.8→**100** · 93.8→99.7 |
| **C — The Whiteboard** | one big figure + 3 handwritten `hf-arrow` call-outs, prose serving the figure | entra-oauth-oidc · ds-hash-tables | 93.8→96.5 · 91.3→94.0 |
| **D — The Argument** | 8–10 `hf-talk` bubbles split around an `hf-brain`, no cards at all | nosql-redis · angular-change-detection | 97.3→**100** · 86.2→87.7 |

Every page scored HIGHER than the templated block it replaced, `tmp_vcheck` passes (537 pages),
all 8 smoke clean at 320px, and cream contrast is clean — which matters because `hf-qa`,
`hf-receipt`, `hf-chain` and `hf-hand` had never rendered on any page in either theme. Blocks
also got shorter: 5.8–8.2 KB against the template's 13.5 KB.

**Four findings the pilot produced, all of which outrank the shapes themselves:**

1. **Every shape cut `hf-terms`** — the "where you have seen this before" cross-references —
   and four agents independently named that the biggest loss (the Redis page gave up its JPA
   `@Version` / Kubernetes-lease / OAuth-`exp` trio). The sameness was the problem, not the
   device. It should become an optional closing beat any shape may use when the parallels are
   genuinely strong, not something the shape bans.
2. **Four shapes on 466 pages is four templates, not variety.** The two Shape A pages came out
   with near-identical device order. A retrofit only works if the shape is chosen by what the
   gotcha IS (misconception → A, cost → B, structure → C, two-parties-both-right → D) with
   latitude to drop or add one device per page.
3. **A shape that introduces a `<pre>` must also add `devhub-syntax.js`.** Shape B put the first
   code block on `aws-cost-visualizer.html`, which had never had one, and the page silently lost
   25 structure points until the script tag was added. Any Receipt-shaped retrofit needs that
   one-line include folded into the swap.
4. **The dialogue was carrying the second-person voice.** Removing `hf-talk` dropped
   spring-boot-bean-lifecycle's `voice` score to 62 mid-draft; it had to be recovered by
   deliberately threading "you/your" through the Q&A prose. Any shape that drops the bubbles has
   to pay that back somewhere else.

Minor, worth fixing if the shapes ship: `hf-big` renders SMALLER than the `hf-say` line beneath
it in cream, so Shape D's "one giant sentence" opening is the second-loudest thing on screen.

**Still open (Bobby's call):** retrofit the 466 other swept pages, apply variety only to new
pages, or keep the single shape. The pilot is local-only — compare the eight pages above against
any untouched page (e.g. `spring-boot-caching-visualizer.html`) before deciding.

### 2. Line-by-line code annotation audit (Bobby has asked "many many many times")
Every static code snippet must teach each line — via the Code Walkthrough widget, an adjacent
per-line annotation column, or inline `.hf-arrow` notes. A one-sentence intro above a 20-line
block fails the bar. The bottom-of-page codewalks are "pretty good" per Bobby but should get
MORE depth too.

**Scoped properly (2026-09-04).** "Sweep all 231 pages with `<pre>` blocks" was the wrong
target, and so is `tmp_hfaudit.mjs`'s `explain` score — it divides by `<pre>` count, so a page
of one-line snippets is punished as though they were unexplained programs (`streams` scores
25/100 with exactly ONE substantial block; `typescript-fundamentals` scores worst on the site
with 7 bare blocks out of 32). Measure instead: blocks of **6+ lines** with no CodeWalk or
annotation nearby AND under 25% comment density. Verified against the rendered DOM, not just
static markup.

Real worklist across the 97 at-bar pages:

- 278 snippets under 6 lines — already carried by the prose above them, leave alone
- 781 substantial blocks
- **~353 genuinely bare, across ~72 pages**

Worst first (bare / substantial): `angular-standalone-migration` 18/26 ·
`angular-material-cdk` 15/19 · `angular-content-projection` 13/21 · `config-pom-xml` 13/17 ·
`config-environment-runtime` 13/16 · `angular-custom-directives` 13/15. None of these led the
score-ranked list.

A worked sample of the treatment is on `angular-standalone-migration-visualizer.html` (commit
`b823165`): inline comments carrying the per-line meaning, plus an `.hf-arrow up` note tying
the block to the idea underneath it.

**🚧 IN PROGRESS (2026-09-16) — Bobby gave the go-ahead on the full volume, sweep started.**
The by-hand count above is now a real gate, `frontend/tmp_annotationcheck.mjs` — run
`node frontend/tmp_annotationcheck.mjs` for the ranked worklist or `--page=foo.html` for one
page's block-by-block detail. It is a static-source scan (not the rendered-DOM check this item
originally called for — its own `WHAT IT CANNOT SEE` explains the gap and the one real
false-positive class it fixes: a `<style>` block's own CSS comment mentioning the text
`<pre>`, which had inflated `angular-custom-directives-visualizer.html`'s raw count before
`<style>` blocks were stripped from the scan). Its numbers **do not match the ~353/~72 figures
above 1:1** — it scans all 484 site pages rather than only the "97 at-bar" set the original
by-hand pass scoped to, and a page's exact bare-count can shift by a block or two depending on
which comment-span class it uses — but before any pages were touched this session it named the
SAME six worst pages (plus `angular-forms-visualizer.html`, which slots in at #3 by this gate's
count and was not in the original six), each within 1-2 blocks of the original figure, which is
the cross-check that matters.

**11 pages finished, 0 bare blocks remaining on each** (verified with
`tmp_annotationcheck.mjs --page=`, plus a full read of every touched block by hand — the
gate counts markup, not meaning):

- `angular-standalone-migration-visualizer.html` — the worked-sample page above, finished (18→0)
- `angular-material-cdk-visualizer.html` (16→0)
- `angular-forms-visualizer.html` (16→0)
- `angular-content-projection-visualizer.html` (15→0)
- `config-environment-runtime-visualizer.html` (14→0)
- `config-pom-xml-visualizer.html` (14→0, using the page's own `.xc`/`.xb`/`.xt`/`.xv` XML
  token classes rather than `.cm` — matched the page's existing highlighting convention rather
  than inventing a new one)
- `angular-custom-directives-visualizer.html` (13→0, incl. the interactive playground's
  duplicate quick-reference snippets, which render into a separate DOM node from the main
  teaching blocks and so needed their own annotation)
- `angular-form-array-visualizer.html` (12→0)
- `angular-services-visualizer.html` (12→0)
- `typescript-type-guards-visualizer.html` (12→0, using the page's `.cmt` class)
- `typescript-decorators-visualizer.html` (10→0, using `.cmt`)

Every finished page follows the worked sample's exact treatment: trailing `<span class="cm">`
(or the page's own comment-span class) inline comments on the lines that carry meaning, plus
one or more `.hf-arrow` notes synthesizing the block for the idea underneath it — never a new
device. `devhub-syntax.js` was already included on all 11 (checked, not assumed).

**Sitewide count as of this pass** (via `tmp_annotationcheck.mjs`, whole site):
**545 bare blocks across 139 pages.** An earlier draft of this same scan, run before any page
in this pass was touched, found ~698 bare blocks across ~149 pages — so this pass's own
before/after is roughly 150 blocks fixed net of the 11 pages above, consistent with those 11
pages' individual before-counts (~152). That 698/149 baseline is this session's own measurement,
not the original ~353/~72 pass above, which scanned a narrower page set by a different method —
the two are not directly comparable, only the six worst pages they agree on are. **139 pages
with a bare count remain** for a future pass — worst next:
`angular-routing-advanced` 13/27 · `config-app-config-providers` 12/24 ·
`angular-template-forms` 11/17 · `angular-rxjs` 11/21 · `angular-directives` 10/15 ·
`angular-http` 10/16 · `angular-control-flow` 10/18 · `angular-functional-guards` 10/19 ·
`config-tsconfig-advanced` 10/21 · `angular-testing` 9/9. Re-run
`node frontend/tmp_annotationcheck.mjs` for the current top of the list before picking up
where this pass left off — it will have moved.

Not started this pass, and why: the remaining page count (139) at this treatment's real
per-block cost (each line needs an actually-true explanation, not a template) is substantially
more authoring than one session covers; this pass prioritized worst-first by bare count
(matching this item's own stated ordering method) and stopped once it had verified the
treatment holds up cleanly across all four gates on every page it touched, rather than
spreading thinner across more pages with less care per block.

### 3. StackBlitz-grade embedded IDE (Bobby's package question — answered)
Bobby asked if a package/dependency exists to make live coding feel like StackBlitz. Research:
- **StackBlitz WebContainers** (`@webcontainer/api`) — real Node.js in the browser. Needs
  cross-origin-isolation headers (COOP/COEP) on our hosting, and a **commercial license for
  production use**. The only option that gives true npm/Node.
- **Sandpack** (`@codesandbox/sandpack-react`) — CodeSandbox's open-source embedded IDE;
  bundles JS/TS/React in-browser, MIT-ish, but React-oriented and brings its own UI.
- **Monaco Editor** (`monaco-editor`) — VS Code's actual editor component. No runner of its
  own, but we ALREADY have real runners (CheerpJ javac, Pyodide, real tsc, sandboxed JS).
- **Recommendation:** Monaco + our existing runners = StackBlitz-feel (IntelliSense,
  minimap, real editor UX) without licensing or header constraints; consider WebContainers
  later only for the Node track where real `npm install` matters.

**✅ BUILT 2026-09-13 (uncommitted) — both editors now run Monaco.** `devhub-tryit.js` (the "Try
It Live" widget on 119 lesson pages) and `devhub-codegrade.js` (the graded "Code With Me" IDE on
9 practice pages) each mount their original textarea first, so the widget is usable at first
paint, then **upgrade in place** once Monaco loads from the CDN (`monaco-editor@0.56.0`, pinned
in BOTH files — bump one, bump both). If the CDN is blocked or the learner is offline the load
resolves false and the textarea simply stays forever; nothing else has to know. `getCode()` /
`setCode()` are the single indirection point, so Run, Reset, the language tabs, the saved
buffer and the pair-programming coach never learn which backend is live.

Verified in a real browser, not code-read: real gutter and syntax colouring, language tabs
retag the Monaco model (JS → Python → Java each load their own starter and highlighting),
edits persist to `localStorage`, Run Tests graded 3/3, the coach still fired, Reset restored
the starter. Two details worth keeping: Monaco owns the gutter so `refreshGutter()` is a no-op
once it is live, and the keyboard-trap escape hatch is now BOTH `Esc`-then-`Tab` (textarea) and
Monaco's own `Ctrl+M` — the hint line names both because either editor may be the live one.

Still open: WebContainers for the Node track, and Monaco's real IntelliSense is only meaningful
on the js/ts examples (Python and Java get syntax + bracket matching, no language server).

### 4. "Code With Me" guided-coding sections — ✅ COMPLETE (engine 2026-09-06, all 9 banks 2026-09-07)
Pair-programming simulation on top of the graded IDE: as the student types, checkpoint-based
hints ("do you really want a nested loop here? An index Map would make this O(n)"), encouragement,
and alternative-route suggestions — like coding alongside a senior. Design: extend
`devhub-codegrade.js` with per-exercise checkpoint rules (regex/AST triggers → coach messages).

**Landed 2026-09-06.** `devhub-codegrade.js` gained an optional per-exercise `coach: [...]` array
(documented in the file's header): each entry is `{id, match, msg, tone?, absent?, langs?}` —
`match` is a `RegExp` or an object keyed by language, `absent: true` inverts it into a "you forgot
X" check (gated on the student's code having diverged from the starter by 40+ chars, so it can't
fire on an untouched stub). Debounced 900ms after the last keystroke (the site's existing
step-pacing convention), one message shown at a time, each id shown at most once per exercise
ever — persisted alongside `solved`/`code` in the same per-bank `dlh-codegrade:<id>` localStorage
progress object as new `coachSeen`/`fails` fields. A toolbar toggle ("🧑‍💻 Pair: On/Off",
`dlh-codegrade-coach` global preference) turns the whole thing off; the toggle itself lives in the
coach panel's always-visible header, deliberately never inside anything that itself gets hidden —
an earlier version nested it inside the collapsing message panel, which meant turning pairing off
made the only control that turns it back on disappear too, caught by the same Playwright script
used to verify the feature.

Two generic behaviors need **no per-exercise authoring** and fire on every bank automatically: a
cycling nudge after 3/6/9 consecutive failed runs on one exercise ("read the first failing test's
exact input before touching the code again" style), and praise on a first solve — different
wording depending on whether it came easy or took a real fight (3+ prior fails).

**Authored bank 1 of 9: Arrays & Strings** (`practice-arrays-strings.html`, all 6 exercises).
A shared `NESTED_LOOP` regex (per-language, javascript/typescript/java brace-loop shape and a
separate Python indentation-colon shape) flags a brute-force double loop on 5 exercises
(two-sum, contains-duplicate, valid-anagram, max-profit, longest-substring), each with its own
exercise-specific message naming the actual faster technique (hashmap, Set, frequency count,
single-pass min-tracking, sliding window) rather than a generic "that's slow" — a real regex
can't tell nested from sequential loops apart, so this is a nudge, not a verdict, and says so in
the code comment above it. valid-palindrome uses the `absent` form to catch a real bug class: code
that filters non-alphanumeric characters but never calls `toLowerCase`/`toUpperCase` (an
implementation that looks complete and still fails the case-insensitive test cases).

Verified end-to-end with Playwright against a local server (`playwright-core` + system Chrome, the
same fallback path item #12 above set up): typed a brute-force `twoSum` → nested-loop message
appeared; ran it wrong 3 times → the generic stuck nudge joined it (2 messages); fixed and passed →
the "fought back" praise variant fired (not the plain one, correctly reading `fails >= 3`); toggled
off → panel stayed visible (showing "Off") with no new messages on a fresh exercise; toggled back
on → the `absent`-type case-fold nudge fired correctly on code that filters but never folds case;
dismiss (✕) removed a single message. `tmp_smoke.mjs practice-arrays-strings.html` and
`tmp_vcheck.mjs` both clean.

**Authored bank 2 of 9: Hashmaps & Sets** (`practice-hashmaps-sets.html`, 5 of 6 exercises).
Reuses the shared `NESTED_LOOP` regex from Arrays & Strings on four exercises (top-k-frequent,
first-unique-character, contains-duplicate-ii, plus a fourth), each with its own message naming
the actual O(n) technique. `subarray-sum-equals-k` uses the `absent` form to catch this specific
problem's single most common real bug — forgetting to seed the prefix-sum map with `{0: 1}`,
which silently undercounts every subarray starting at index 0 — with per-language regexes
matching the seed pattern (`.set(0,1)` / `{0:1}` / `.put(0,1)` / `[0]=1`). `longest-consecutive-
sequence` flags a `.sort()`/`sorted()`/`Arrays.sort()` call as evidence of the easier O(n log n)
shortcut instead of the true O(n) Set-based one — a `match`, not `absent`, since sorting really is
reliable evidence of the shortcut. **Isomorphic Strings deliberately has no coach entry**: unlike
the other five, there's no single regex signature for "missing the reverse-direction check" that
doesn't also match other genuinely correct solutions (index-based, Set-based, and two-map
approaches all look different in source) — forcing one here would have been a guess dressed up as
a nudge, so it stays hints-only.

Verified with a throwaway Playwright script exercising all 5 coach entries directly (typed each
exercise's known-bad code into the editor, waited past the 900ms debounce, read the coach
message): all 5 fired their correct message text. Also verified the negative control for the
`absent`-style check — typing subarray-sum-equals-k code that DOES seed `map.set(0, 1)` produced
no coach message at all, confirming the inverted-match logic doesn't false-positive on correct
code. `tmp_vcheck.mjs` and `tmp_smoke.mjs` both clean.

**✅ CLOSED 2026-09-07 — all 9 banks authored (38 more entries, 49 total).** The remaining
seven (backtracking, dynamic-programming, graphs, linked-lists, sorting-searching, stacks-queues,
trees) were authored exercise by exercise, reading each problem's real best-and-worst approaches
rather than pattern-matching a template across them. Six new shared regex consts carry the ideas
that genuinely repeat — `NESTED_LOOP`, `SORT_CALL`, `SLOW_QUEUE` (front-of-array pops),
`LINEAR_SCAN`, `COPY_ON_ADD` (the backtracking snapshot bug), `TWO_PASS` — but every message
names the technique for ITS exercise, never a generic "that's slow".

The entries worth calling out, because they catch a specific famous wrong answer rather than a
performance smell:

  - **validate-bst** — `/\.left\.val|\.right\.val/` catches comparing each node only with its
    immediate children. The message hands over the counterexample: [5,1,6,null,null,4,7] passes
    every parent-child check and still isn't a BST.
  - **invert-binary-tree** — `.left = f(.right)` followed by `.right = f(.left)` reads back the
    value it just overwrote. The regex only matches that exact ordering, so a temp-variable or
    destructuring swap stays quiet.
  - **coin-change** / **house-robber** — the two classic wrong greedies, each with the smallest
    counterexample stated in the message (`[1,3,4]` for 6; `[2,1,1,2]` for alternating houses).
  - **evaluate-rpn** — `langs: ['python']` on `//`, because floor division and truncation toward
    zero differ exactly where the third test case lives (`6 // -132` is -1, the answer is 0, and
    the difference turns that test's 22 into 12).
  - **word-search** — an `absent` check for a SECOND grid assignment (or a set `.remove`), i.e.
    the undo step. Marking without restoring is the difference between backtracking and DFS.
  - **longest-increasing-subsequence** — deliberately `tone: 'praise'`: the O(n²) DP that trips
    `NESTED_LOOP` here is the CORRECT expected answer, so the message says don't change it and
    offers the O(n log n) patience-sorting follow-up instead. A nudge that calls right code wrong
    is worse than no nudge.

**Three authored entries were cut before shipping, and the harness is why.** `maximum-depth` and
`same-tree` both wanted an `absent` base-case check, but the engine gates `absent` entries on the
student's code having diverged 40+ chars from the starter, and a complete solution to either
problem is barely longer than its own stub — they could never fire in JS and would fire only in
the languages with longer starters. `remove-nth-from-end` wanted the `TWO_PASS` nudge, and the
correct one-pass solution trips it too (a `for` to advance `fast`, then a `while`) — a false
positive on correct code, which is the one outcome not worth shipping. `middle-of-linked-list`
keeps `TWO_PASS` because its correct solution is a single loop.

**Two exercises stay deliberately un-coached**, joining isomorphic-strings from bank 2:
`graph-valid-tree` (no regex separates "forgot the edge-count/connectivity half" from the several
correct shapes) and `n-queens-count`'s safety check. Silence is a decision here, not an omission.

**Two test-coverage bugs surfaced while authoring, and both are fixed.** A coach that says "this
is wrong" while the grader says "correct" teaches something false, so these were not optional:
`is-graph-bipartite` had no DISCONNECTED graph in its tests, meaning a solution that colours only
node 0's component passed everything — added `[[1],[0],[3,4],[2,4],[2,3]]` (an edge plus a
triangle) which that solution answers `true` and the answer is `false`. `merge-intervals` handed
out pre-sorted input in all four tests, so a solution that never sorts passed — added
`[[2,6],[1,3],[15,18],[8,10]]`, which a no-sort sweep answers `[[2,6],[15,18]]`. Both new cases
were verified in Node against a reference solution AND against the buggy solution, to prove the
test actually catches what the coach warns about.

**New gate: `node frontend/tmp_coachcheck.mjs`.** A coach entry is a regex with an opinion, and
nothing else in the site can tell whether it is right — vcheck proves the page parses, codecheck
compiles the snippets, and a wrong `match` breaks neither. It pulls each bank out of its page with
`vm` (stubbing `DevHubCodeGrade.render`) and replays the engine's real `matchCoachEntry()`,
including the `absent` length gate, against two samples per entry: code that should trip it, and a
correct solution that must not. **49 passed, 1 nudge, 0 failed, 0 untested** across all nine banks
— the two banks authored in 2026-09-06 are covered too, so the Playwright verification they got
is now permanent and re-runnable. The single NUDGE is reported, not hidden: count-then-compare is
a correct `valid-anagram` solution and still trips `NESTED_LOOP`, because a regex cannot tell
sequential loops from nested ones. Writing the harness cost one real bug of its own — a regex
built inside a `vm` context fails the host realm's `instanceof RegExp`, so 30 entries looked dead
until it switched to `Object.prototype.toString`. Same cross-realm family as the `Uint8Array`
gotcha from the original codegrade build.

Gates after the sweep: vcheck 537/521 · codecheck 671 blocks 0 errors · assetcheck no teaching
assets lost · cwlines 0/455 · coachcheck 49/0 · tmp_smoke.mjs clean on all nine practice pages
(it runs here via the system-Chrome fallback even though `playwright` itself is not installed).

Tooling gotcha found on the way: `tmp_genpracticemap.mjs --check` compares the generated block as
a STRING, so a `tracks-data.js` carrying mixed line endings reports "STALE" while the map's actual
content is identical. Re-running the generator fixed four CRLF lines and produced a zero-byte git
diff. If --check ever fails with no bank edit behind it, that's why.

### 5. Thin tracks — audit results (counts from `tracks-data.js`, 2026-08-29)
PHP & Laravel **2**, Ruby & Rails **2**, Rust **2**, MuleSoft **2**, Full-Stack Stacks **3**,
DevOps & CI/CD **3**, AI-Assisted Dev **3**, Shell **4**, Node.js & TS Backend **5 → 6**, C#/.NET
**5**, Kubernetes **6 → 7** (vs Python 23, TypeScript 30, Angular 75). Universal concepts (OOP,
async, HTTP) ARE covered in the big tracks, but the thin language tracks lack language-specific
depth. Priority by Bobby's CIAM job relevance: **Node.js backend, DevOps/CI-CD, Kubernetes**
first; Ruby/PHP/Rust/MuleSoft expansions (~8-10 lessons each) when he confirms he wants them
beyond taster depth. (Note: DevOps & CI/CD's "3" count is now stale too — the 2026-09-05 Render
sweep already grew it to 7 pages across a dedicated "Deploying on Render" section; DevOps is no
longer genuinely thin, just under-counted here.)

**Landed 2026-09-06 — one Node.js gap closed.** Added `node-database-visualizer.html`
("Talking to a Database") to a new "Data Layer" section of the Node.js track — the track had
zero coverage of persistence, the single biggest gap given Bobby's own day job (Spring Data
JDBC parameterized queries). Teaches connection pooling, parameterized `$1` queries vs. string
concatenation (SQL injection, shown as its own WARN-toned scenario), Prisma ORM ("parameterizes
by construction"), and transactions (`BEGIN`/`COMMIT`/`ROLLBACK`/`finally{client.release()}`) —
via a 4-scenario `rt-ctlbar` walk (param/injection/orm/tx), intro comparison cards (raw pg vs.
Prisma vs. Spring Boot), and a `DevHubCodeWalk` over `getUserByEmail`. Verified: `tmp_vcheck.mjs`
(536 pages, 520 registered), `tmp_codecheck.mjs` (0 real errors), `tmp_cwlines.mjs` clean,
`tmp_smoke.mjs` (536 pages, no overflow/console errors), and a throwaway Playwright script
confirming all 4 scenarios render correct result text. One page, proportionate to this pass —
same as Code With Me's 1-of-9-banks precedent above. Remaining Node.js gaps (testing, streams,
async patterns beyond what the big tracks already cover) are still open.

**Landed 2026-09-06 — one Kubernetes gap closed.** Added `kubernetes-rbac-visualizer.html`
("RBAC & Service Accounts") to the Kubernetes track's Core Concepts section (6→7 pages) — the
track's own ConfigMaps & Secrets page already foreshadowed this exact topic ("the developer who
wrote `view`-level RBAC for the support team just handed them production's signing key") but it
was never taught as its own lesson. Covers Role/RoleBinding (namespaced) vs. ClusterRole/
ClusterRoleBinding (cluster-wide), ServiceAccounts as pod identity, `resourceNames` narrowing a
grant to one named object (and its real gotcha: it's silently ignored for `list`/`watch`, which
target collections not named objects), the "additive-only, no explicit deny" authorization model,
and `kubectl auth can-i` as a zero-side-effect permission check — via a 4-scenario `rt-ctlbar`
walk (namespaced/cluster-wide/workload-identity/audit) and a `DevHubCodeWalk` over a combined
ServiceAccount+Role+RoleBinding manifest. Every "Where you've seen this before" analogy ties back
to Bobby's own stack: `@PreAuthorize`, Entra app roles / Ping OAuth scopes, and AWS IAM policies —
same subject+permission+deny-by-default shape, three different systems. Verified: `tmp_vcheck.mjs`
(537 pages, 521 registered), `tmp_codecheck.mjs` (0 real errors), `tmp_cwlines.mjs` (not among the
flagged mounts — no out-of-range or 1-based indices), `tmp_smoke.mjs` both scoped and full-site
(537 pages, no uncaught errors, no overflow), and a throwaway Playwright script confirming all 4
scenarios render correct result text, the CodeWalk renders all 27 lines, and the `hf-check` quiz
answer-reveal works. DevOps/CI-CD's own remaining gaps (see the note above — it's actually not
thin anymore) and the rest of Kubernetes (probes, StatefulSets, PersistentVolumes, Ingress/TLS)
are still open.

### 6. Page-styling critique — content-level remainder (CSS half SHIPPED same session)
Bobby's design review of the lesson pages. Fixed sitewide in `devhub.css` already: 3-tier
container contrast (page bg darkened a step; cards lifted with shadow; code stays near-black
terminal tone), quieter inline `code` (no more bordered pill on every identifier), line-length
caps (~72ch lead / 78ch gist / 88ch callout — no more edge-to-edge paragraphs), code-bearing
`.intro-mini` cards now span full width (`:has(pre)`), and header-attached vertical rhythm
(42px above h2, 12px below). **Still needs a content sweep, page by page:**
- Pull long inline-code expressions (e.g. `new Mocha(new Whip(...))`) out of prose into their
  own block code line — inline highlighting is for single symbols/short identifiers only.
- Narrow each page's accent color to 1-2 anchor uses (title + section labels); let the syntax
  palette do the code coloring — emphasis and syntax should not share one hue.
- Cards that cram real code into narrow columns: move the code to a shared full-width block.

### 7. More interaction/navigation animation polish
2026-08-30: the fill-ripple is RETIRED (Bobby: "right idea, horrible execution") — replaced by
an accent **press-pulse ring** (animated box-shadow blooming from the control's own outline;
cannot misalign or affect layout) plus a hover micro-lift + brightness on every control.
Remaining candidates if Bobby wants more: staggered card entrance on hub pages, sidebar
expand/collapse spring, animated progress rings on track cards.

### 8. Design-system v2 — mockup-driven page sweep (system SHIPPED, sweep pending)
Bobby supplied a reference mockup of the Decorator page ("what it might look like, but 10x
better") and the shared system now matches it: editorial near-white titles (accent reserved
for kickers/labels), clean borderless h2s, editor-window chrome on code blocks (traffic-light
dots + optional `data-file="Main.java"` filename), `.hf-kicker` badge pills, `.hf-receipt`
running-total receipts, `.hf-chain` wrapper-chain chips, light-theme fixes (thin 22% marker
band, readable inline code). **`head-first-decorator-visualizer.html` is the rebuilt reference
implementation — clone its intro structure on every page sweep.** The sweep itself (per page):
kill page-inline h1/h2/pre styles that fight the system, break up wall-of-text intros, pull
long inline-code expressions onto their own `pre data-file` lines, swap prose chains for
`.hf-chain`, and use `.hf-receipt` wherever a cost/total builds up.

### 9. IDE mastery track — VS Code, IntelliJ IDEA, Spring tooling (NEW, build after the design sweep)
Bobby: teach each IDE and how to maximize every feature — added here because the design/UI
work comes first. Official learning resources to build from (verify links when building):
- **VS Code** — code.visualstudio.com/docs (Getting Started + user guide), the built-in
  **Tips and Tricks** doc, per-OS keyboard-shortcut reference PDFs, and the Java-in-VS-Code
  guides (code.visualstudio.com/docs/java) incl. the Spring Boot Extension Pack docs.
- **IntelliJ IDEA** — the official help (jetbrains.com/help/idea), the **JetBrains Guide**
  (jetbrains.com/guide — bite-size tutorials/tips, ideal source material), the default-keymap
  reference card PDF, and the in-IDE **Features Trainer** plugin's lesson list as a syllabus.
- **Spring tooling** — Spring Tools 4 (spring.io/tools) for VS Code/Eclipse, IntelliJ
  Ultimate's Spring support docs (bean navigation, endpoints tool window), start.spring.io,
  Spring Boot DevTools live-reload docs.
Page plan per IDE: guided tour → navigate-anywhere shortcuts → refactoring moves → debugger
mastery (breakpoint types, evaluate, conditional/logging breakpoints, hot swap) → run
configurations → git integration → Spring-specific tooling. Same visual bar as everything
else: animated walkthroughs of the IDE surfaces, not screenshots-with-captions.

### 10. CI/CD — validation gate ✅ LANDED (2026-08-31)

`frontend/tmp_vcheck.mjs` exists for real now (CLAUDE.md had pointed every session at it, and
at a `tmp_audit.mjs`, for months — neither existed, so the documented validation step silently
passed). Zero dependencies, scans all 527 pages in ~0.4s, and
`.github/workflows/deploy.yml` gates the Pages deploy on it.

**Checks:** UTF-8 + no stray control bytes · registry integrity both directions (every
`file:` resolves, every page is registered or allowlisted) · required shared scripts
(`<pre>` implies devhub-syntax.js; rt-* markup implies devhub.css) · internal links ·
duplicate registrations.

**Getting it green surfaced four real defects, all fixed:**
1. `java-variables-types-visualizer.html` carried a literal NUL byte — a raw `0x00` sitting in
   a Java `char` sample instead of the `\u0000` escape. It is why `file` reported that page as
   `data`. Replaced with the escape text.
2. `spring-boot-resilience4j-visualizer.html:912` ended in `</di` instead of `</div>`, so the
   `.two-col` grid never closed and the following comment was swallowed as attribute soup.
3. `fullstack-request-roundtrip-deep-visualizer.html` was registered in TWO sections, which
   makes the chapter rail's "next" ambiguous and double-lists it in the hub. Kept in
   Full-Stack Stacks (its capstone, a 3-page track); dropped the Angular copy.
4. `tmp_tryit_test.html` was an unreferenced test fixture being published. Deleted.
   (`index-legacy.html` looked like an orphan but is linked from `index.html` — allowlisted.)

**Link-check design note:** the first version produced false positives on pages that TEACH
HTML — `&lt;link href="styles.css"&gt;` in an Angular index.html walkthrough is content, not a
link. The checker now strips HTML-escaped markup, and hard-fails only on `.html` targets and
the shared `devhub-*` assets; anything else is a warning. A gate with false positives is a
gate people learn to ignore.

**deploy.yml also fixed two things unrelated to the gate:** `cancel-in-progress` is now
`false` (GitHub's own guidance — cancelling mid-publish can leave the site half-updated), and
the artifact is rsync-staged into `_site/` so the public site no longer serves `devserver.py`,
`__pycache__/`, or the `tmp_*.mjs` scripts. It previously uploaded `frontend/` wholesale.

**Size, settled:** the 24MB is a repo number, not a user number — the average page gzips to
about 13KB, the 1GB Pages ceiling is ~44x away, and the 10-builds/hour limit does not apply to
custom Actions workflows. Do NOT minify: inline `<style>` is 0.5% after gzip, and the 11.3MB
of inline `<script>` is bespoke per-page animation code that is not safely minifiable in bulk.

### 10b. Sitewide viewport fix ✅ LANDED (2026-08-31)
**410 of 527 pages had no `<meta name="viewport">`**, so phones laid them out at 980px and
scaled down — on a site Bobby reads primarily on a phone. All 527 now have it.

The tag alone is NOT the fix, and the estimate that called it "a one-line sed" was wrong:
making the phone layout real EXPOSES overflow the 980px scaling was hiding (a fixed-px h1
running off the edge, a wide `<pre>` pushing the whole document sideways). Verified by
before/after screenshot. A mobile safety net now lives at the end of `devhub.css` — clamped
heading sizes, `overflow-wrap`, single-column grids under 680px, and `pre`/`table` scrolling
themselves rather than the page. Scoped to a phone media query so desktop is untouched.

### 11. Design-review screenshots + the model-switch checkpoint (NEW, 2026-08-31)

**`frontend/tmp_shot.mjs`** — shoots any page in Chromium at phone (390x844) and desktop
(1440x900), because Bobby reviews on a phone and builds on a desktop. Serves `frontend/` over
http rather than `file://` so the shared `devhub-*.js` engines and any `fetch()` actually run,
waits for network-idle + a settle delay (pages pace scenario walks at ~800ms/step), and reports
console errors per shot. `--full` for full-page, `--theme=light`, `--out=DIR`, `--settle=MS`,
and `--inject=palette.css` to **preview a token swap sitewide without editing a single page**.
Bobby wants a screenshot alongside each design change from here on — use this, don't hand-wave.

**What the first run already proved (2026-08-31), shooting `head-first-decorator-visualizer.html`:**
- The existing dark page is **already structurally identical** to Bobby's new Claude Design
  prototype: same `HEAD FIRST · DESIGN PATTERNS · CH. 3` kicker, same title, same intro prose,
  the same receipt with the same numbers ($0.89 / $0.99 / $1.09 / $1.29), the same
  `new Mocha(new Whip(new Soy(new HouseBlend())))` in `data-file="Order.java"` editor chrome,
  the same open/closed callout, the same "three places you already use it" section. **The
  prototype is a warm light recolor of a page that already ships** — the delta is palette hues
  plus a display font, not structure and not content.
- **A naive token swap does NOT just work.** Injecting the prototype's warm palette
  (`--bg:#f5ead8`, `--accent:#c67139`) leaves the h1, body prose, and section headings
  illegible near-white, because they use hardcoded hex rather than tokens. `devhub.css`
  carries **200 hex literals vs 153 `var()` references** — token coverage is only ~43%, and
  that gap is the actual blocker for any one-file reskin.
- **Bug found:** under the existing `data-theme="light"`, the `.hf-receipt` rows (House Blend /
  + Soy / + Whip / + Mocha) render washed-out grey and are effectively unreadable; only the
  `Total` row survives. The light-theme override block at `devhub.css:441` never got a
  counterpart for the receipt row color. Fix before any light-mode rollout.

**★ MODEL-SWITCH CHECKPOINT — stop and ask Bobby before proceeding.**
Agreed 2026-08-31: stay on **Opus** for the architecture work (palette/token migration, the
codemod for the 153 pages that redeclare `:root`, the CI validate job, the chapter-rail
component, and the reference page). These are low-volume and high-blast-radius — one mistake
propagates to 528 pages.

**When backlog item #1 (the ~500-page Head First content sweep) is ready to start, STOP and
prompt Bobby to switch models** — that is the only genuinely high-volume phase, and by then an
Opus-authored exemplar page plus the written per-page bar will exist, which is the setup Sonnet
handles well. Do not silently continue on Opus into the sweep, and do not switch on your own.
Suggested at that checkpoint: run one 10-page tranche on Sonnet and one on Opus against the
same exemplar and diff the quality before committing to the cheaper tier for ~500 pages.

### 12. Head First design language — `devhub-hf.css` LANDED, sweep pending (2026-08-31)

Bobby's verdict on the first attempt was blunt and correct: *"I don't like how it looks at all…
The problem you aren't seeing is that it's not just the color I care about."* A palette swap
(`devhub-warm.css`, kept for the cream variant) is NOT the ask. The ask is the whole design
language — roundness, playful type, and components that make a page feel like the book.

**Colorway decision (revised):** dark **mocha/espresso** now (`--hf-bg:#17120f`), cream later.
Bobby's screenshots are the dark variant; cream is a token re-statement on top, not a rebuild.

**`frontend/devhub-hf.css`** — opt in with `<html data-hf>`, load after devhub.css. Contains:
- **Type:** Playfair Display (display serif) + Dancing Script (the hand, for decks, "you are
  here", "psst —", code annotations), self-hosted latin-subset variable woff2, one file each.
- **Chapter rail** — dots + dashed connector + `aria-current`, with the giant ghosted chapter
  numeral behind it. Renders from a plain `<ol>`, so any chapter count works.
- **Kicker + statement rhythm** — `.hf-kick` ("— THE PROBLEM") followed by `.hf-say`, the big
  serif line. This pairing is the page's spine and should repeat per section.
- **`.hf-card.bad` / `.hf-card.good`** — the reddish-brown problem card and olive fix card.
- **`.hf-scatter`** — mono class chips at deliberate jaunty angles (the class explosion should
  *look* out of control; that's the teaching point).
- **`.hf-taped`** — the gold caution-tape tab with the orange bead, pure CSS.
- **`.hf-talk` / `.hf-bub`** — objects talking to each other, speaker name in the hand.
- **`.hf-nest`** — nested dotted wrapper rings around a tan core, nested by DOM depth.
- **`.hf-napkin`** — the predict-first note with a torn dashed edge and a "psst —" in script.
- **`.hf-ask`** — Q&A with serif italic Q/A marks on a blue rail.
- **`.hf-terms`**, **`.hf-ladder`**, **`.hf-annot`**, **`.hf-reveal`**.

Selectors are `[data-hf] …`, which outranks a page's own inline `:root`/element rules on
**specificity** — so the kit reskins pages without editing their inline CSS. Per-page cost stays
two lines. Note the trap this already caused: an unscoped `.hf-rail span` rule beat
`.hf-chapnum` on specificity and silently shrank the numeral to 10.5px. Scope kit-internal
rules to the element that owns them.

`head-first-decorator-visualizer.html` is the reference implementation. Its presentation layer
was rebuilt into the kicker/statement rhythm; **every deep section was kept** — the 4-scene
animated visualizer, DevHubCodeWalk, the CheerpJ Java runner, Acts 1-3, the definition and
real-world sections all still render, verified by screenshot with zero console errors.

**Still to do:** the order-builder interactive from the prototype (34 lines of vanilla JS, no
framework); wire the rail to `tracks-data.js` instead of the hand-written `<ol>`; the cream
token block; then the sweep, track by track. Per Bobby: *"each page/concept doesn't have to have
exactly everything in the screenshots but it should be close depending on what concept is being
taught"* — so the kit is a palette to draw from, not a fixed template.

**TRANCHE 1 LANDED (2026-08-31): all 12 Head First pattern pages.**
`tmp_hfapply.mjs` makes the opt-in mechanical and idempotent (`--check` dry-runs, `--revert`
undoes): adds `data-hf`, links `devhub-hf.css` after devhub.css, wires the rail, and adds a
viewport meta if missing. Per-page cost really is those four edits — no content was touched.

`devhub-chapters.js` renders the rail from `tracks-data.js`, so no page hand-writes its chapter
list. The Decorator page's hand-written rail had been **wrong** — it showed 5 chapters for a
section that has 14. The rail windows to current ±2 with an "N of M" count, and skips sections
with fewer than 2 pages. A slim generated `chapter-index.js` was tried and dropped: it saved
only 2.8KB gzipped over `tracks-data.js` and added a file that could silently drift.

**Three bugs the tranche exposed, all fixed in the shared kit rather than per page:**
1. The kit originally defined only `--hf-*` tokens, so `.intro`/`.panel`/`.rt-*` stayed slate
   blue on a mocha page — devhub.css builds them from `var(--panel)`/`var(--border)`. The token
   block now **remaps DevHub's existing token names** onto the mocha ramp, which repaints every
   token-driven component for free. This is the single change that makes the rollout cheap.
2. Rail labels collided when one ellipsised; the current label then overflowed its cell
   entirely ("Compound+MVC", "Iterator+Composite" have no space to wrap at). Fixed with
   horizontal padding plus `overflow-wrap:anywhere` on the current label.
3. All 12 pages carried a hand-rolled `<div style="…">🦆 HEAD FIRST · …</div>` badge that now
   duplicates the rail's kicker. Removed (backups in the session scratchpad). Note these were
   **inline style attributes**, which beat any stylesheet — the only fix is deleting them, which
   is exactly the 419-page inline-style problem the scoping pass flagged.

**What tranche 1 did NOT do:** the kicker/statement rhythm, problem-and-fix cards, speech
bubbles, nested diagrams and napkins are per-concept AUTHORING and exist only on Decorator so
far. Tranche 1 landed the free part — colorway, type, roundness, rail, mobile. That split is
the honest shape of the whole rollout.

**TRANCHE 2 + AUTHORING (2026-08-31, later).** OOP Core (encapsulation, inheritance,
polymorphism, abstraction, SOLID) took the kit — chosen deliberately to prove it works outside
the Head First family before any bigger sweep. It did, with no new breakage class.

**Decorator, Strategy and Observer are now fully AUTHORED** (kicker/statement rhythm, problem
and fix cards, speech bubbles, mechanism diagram, three real-world instances, key terms,
back-row Q&A, predict-first napkin). The other 14 kit pages have the colorway, type, roundness,
rail and mobile fixes but not yet the authored rhythm — that split is the honest state.

**Each pattern needed its OWN mechanism diagram, and that is the real lesson for the sweep:**
Decorator NESTS (`.hf-nest`, dotted rings round a core), Strategy COMPOSES (`.hf-slot`, a
context with a pluggable slot and the active implementation ringed), Observer BROADCASTS
(`.hf-cast`, one subject fanning out to wrapping observers). Reusing one diagram for all three
would have taught the wrong shape. Budget a new diagram component per *concept family*, not per
page — three so far, and they will cover most of the pattern track.

Also landed: the Decorator order-builder (~40 lines of vanilla JS, driven end-to-end in
Chromium — totals track the page's canonical numbers, undo/reset/cap all behave).

**QUICK KNOWLEDGE CHECKS + STATS DASHBOARD (2026-08-31, later still).**

`devhub-hf-check.js` + `.hf-check` — inline active recall placed MIDWAY through a lesson, per
Bobby's reference. One question about what was just explained, one tap, and the reasoning
revealed for the chosen option AND the correct one, because *why the tempting wrong answer is
wrong* is where the learning is. No score, no gating, retryable. Declarative markup
(`data-answer` = index, `.why[data-for]` per option) so a page adds one with no JS of its own.
Six chapters have one. Driven in Chromium: wrong pick marks both and shows two explanations,
right pick shows one, `role="status"` announces the verdict.

`stats.html` — the personal dashboard, built from Bobby's screenshot of a design he liked.
**Every number is real**, computed from this browser's own localStorage: `dlh_progress_v1`
(concepts done, per-track completion), `dlh_streak_v1` (streak), `dlh-quiz:<bank>` (quiz
accuracy across stored attempts), `dlh_recent_v1` (pick up where you left off). Handles the
empty state deliberately — a new learner sees honest zeros and what to do, not a blank grid.

**One tile from the reference is deliberately absent: "minutes studied".** Nothing in DevHub
records time on page, so that chart would be invented numbers. If Bobby wants it, the work is
a small session-timer writing dated totals — say so rather than shipping a fake chart.

Chart colours were **validated, not eyeballed** (the `dataviz` skill's checker). The first
palette failed on CVD separation and chroma; the shipped pair (`#ef7a45` / `#a8d17a`, with a
neutral for "not started") passes at ΔE 10.2 deutan. The bar chart is single-hue on purpose —
one series measuring magnitude needs no categorical palette and no legend — and the donut is a
status palette where every slice carries a swatch, a label AND a count, so identity is never
colour alone.

Note the dashboard is in the DARK colorway to match the rest of the site; Bobby's reference
screenshot is the cream variant, which arrives with the theme flip.

**ALL 12 PATTERN CHAPTERS NOW AUTHORED (2026-08-31, final pass).** Every one has the deck,
the kicker/statement rhythm, problem-and-fix cards, object dialogue, a mechanism diagram, three
real-world instances, key terms, back-row Q&A, a predict-first napkin, and a mid-page quick
knowledge check. Verified structurally (a per-page audit of deck/kick/check/diagram/tryit) and
by screenshot at 390px with zero console errors.

**Six mechanism-diagram components now exist, one per SHAPE — this is the reusable result:**
`.hf-nest` (Decorator, Composite — nesting) · `.hf-slot` (Strategy, Factory, Proxy, Adapter,
MVC's controller leg — a context with a pluggable slot) · `.hf-cast` (Observer, Facade, MVC's
model leg — one-to-many broadcast) · `.hf-one` (Singleton — many callers converging, which also
makes the thread race visible) · `.hf-steps` (Template Method — a skeleton with locked and open
steps) · `.hf-cycle` (State — transitions as rows, because a node-and-edge graph is unreadable
on a phone). Later tracks should reuse these before inventing more.

**A REGRESSION I CAUSED AND FIXED — worth remembering for the sweep.** The first Decorator
splice replaced everything from `<div class="container">` down to the visualizer comment, which
silently deleted the `.tryit` widget (the real CheerpJ Java runner) sitting inside that range.
I had reported that nothing was removed; that was wrong. Found by a structural audit, recovered
from `master`, and re-placed after the napkin where it teaches best. Every other chapter spliced
at `<div class="intro">`, which is safely above the deep content.

**The lesson: splice at a narrow anchor, and audit teaching assets against `master` afterwards
rather than trusting the intent of the edit.** A master-vs-working comparison of tryit /
CodeWalk / rt-stage / quiz counts across all 12 now shows parity, and that comparison should be
run after every authoring tranche.

**SITE-WIDE ROLLOUT + CREAM VARIANT + 5 DEAD PAGES REVIVED (2026-08-31, final).**

**The kit is now on all 513 registered pages.** Applied with `tmp_hfapply.mjs` (4 mechanical
edits each, no content touched), then every kit page was loaded in Chromium at 390px and checked
for console errors, horizontal overflow, a present theme toggle, and the expected background.
**Zero overflow, zero missing toggles, zero wrong backgrounds.** 13 pages reported console
errors — all 13 reproduce IDENTICALLY on `master`, verified by serving the master copies from a
scratch directory, so the rollout introduced none of them.

**CREAM VARIANT LANDED** (`<html data-hf data-theme="cream">`) — the light colorway Bobby
originally chose, shipped as promised "later". It is a pure token re-statement plus ~20 rules
for wells that were dark-on-dark and must become light-on-light; **no component rule and no page
changed.** That is the payoff of building the kit token-first. Code panels stay dark in both
themes (the terminal convention), which retires the whole syntax-contrast problem.
`devhub-hf-theme.js` is the switch — dark stays the default (no stored choice = no attribute),
the choice persists in `localStorage`, and it sits bottom-LEFT because app.html pins its
`#dlh-mark-pill` bottom-right at z-index 9999. Verified: toggles, persists across navigation,
toggles back.

**FIVE GENUINELY DEAD PAGES, FOUND AND FIXED.** The browser sweep surfaced pre-existing
JavaScript that never parsed, so those pages' interactive sections had simply never worked:
- `go-http-server` and `go-interfaces` closed a step object with `)` instead of `}`
- `go-error-handling` had one brace too many, closing the object before its `ins:` key
- `github-copilot` had an unescaped apostrophe in a single-quoted string (`Copilot's`)
- `angular-ssr-hydration` contained a literal `</script>` inside a JS string, which ends the
  block right there and kills everything after it
All five now load clean with working interactive nodes.

**vcheck gained check #6: every inline `<script>` must parse.** None of those five bugs is
visible by eye, none breaks the HTML, and none was catchable by any static check the project
had. This one is ~20 lines and would have caught all five. **The general lesson: a page that
renders is not a page that works** — the gate needs to execute, or at least parse, what it ships.

**OOP CORE AUTHORED + AN ASSET-LOSS GUARD (2026-08-31, continued).**

**`frontend/tmp_assetcheck.mjs`** — the codified version of the Decorator regression. It
compares every page against a git ref and FAILS if a page has fewer `.tryit` widgets,
CodeWalks, `rt-stage` engines, quizzes, flashcards or notebook hooks than it used to. Additions
are always fine. Proven by simulating the exact bug (deleting Strategy's tryit): it catches it
and exits 1. Wired into `deploy.yml`'s validate job on pull requests, where a base branch exists
to compare against — with `fetch-depth: 0`, because a shallow clone has no base to diff.

**vcheck cannot do this job** — it has no notion of "before". That is the general point: a
validator that only sees the current state cannot catch deletion, and deletion is exactly what
a careless bulk edit does.

**All five OOP Core pages authored** (encapsulation, inheritance, polymorphism, abstraction,
SOLID) — the foundation of the zero-to-hero path. **They needed no new diagram components**,
which is the first real evidence the six shapes generalise: encapsulation reuses `.hf-nest`
(the access-level wall IS nesting), polymorphism and abstraction reuse `.hf-slot`, inheritance
uses `.hf-ladder` plus `.hf-slot`, and SOLID uses `.hf-steps` with `.hf-terms`.

**A bug worth recording, because it will recur.** The anchor regex
`<(?:div class="intro"|h2)\b` never matched the intro card — `\b` after `intro"` requires a
word character, and `"` and `>` are both non-word — so it silently fell through to the first
`<h2>` and three pages got their authored block placed AFTER the intro card instead of before
it. Nothing errored; only reading the rendered order caught it. **When an anchor regex has an
alternation, verify which branch actually matched** rather than trusting that it matched at all.

Authored pages now: 12 pattern chapters + 5 OOP Core = **17**. The other ~496 carry the kit
(colorway, type, roundness, rail, mobile, theme switch) but not the authored rhythm.

**THEME INTEGRATION — TWO SYSTEMS MERGED INTO ONE (2026-08-31).**

Found while checking the kit against the hub rather than in isolation: **app.html already owned
a theme**, and the kit's switch was about to fight it. app.html stores `devhub-theme`
('dark'|'light'), applies it before first paint, AND pushes it into the lesson **iframe** it
renders pages in (`toggleTheme()` writes `viewer.contentDocument`'s `data-theme`).

Three concrete bugs that would have produced:
1. The kit's switch used its own key and REMOVED `data-theme` when unset — so opening any
   lesson silently cleared the hub's stored light preference.
2. Viewing a lesson through the hub showed TWO toggles, disagreeing.
3. The hub pushing `light` into a kit page hit devhub.css's cool blue-grey theme, which was
   built for the old design and reads as a different site under the Head First kit.

Fixed by making them one system rather than two:
- The kit reuses the **same key and attribute**, adding only the value `cream`.
- `light` is treated AS cream on kit pages (`[data-theme="light"][data-hf]` matches every cream
  rule), so the hub's existing button keeps working and stays coherent.
- A `MutationObserver` re-normalises when the hub writes `light` directly into the frame.
- The floating switch **hides itself inside an iframe** — there the hub's header control is in
  charge.
- app.html renders a stored `cream` as its own `light` (it has no cream palette), and its
  toggle now reads the APPLIED value rather than rewriting the user's stored word.

Verified end to end: choose cream on a lesson → stored `cream` → the hub opens light → the hub's
toggle returns both to dark. In-frame: no second toggle, and `light` pushed in renders cream.

**The lesson: test a shared component against the thing it will live next to, not on its own.**
Every one of these bugs is invisible when the kit page is opened directly, which is exactly how
it had been verified 513 times.

**THE LAST TWO BROKEN PAGES + A BROWSER SMOKE TEST (2026-08-31).**

The two remaining runtime errors were real bugs, not sandbox noise, and both killed their
page's interactive engine:
- `react-fundamentals` had `{type:Button, …}` in its scene data — a BARE identifier where a
  string was meant. It describes a React element's type; there is no `Button` component on the
  page. Now `type:'Button'`.
- `spring-boot-async-scheduling` had `"${app.cleanup.cron}"` inside a **JS template literal**,
  so JavaScript tried to evaluate the Spring property placeholder. Escaped to `\${`. Checked
  first that every other `${…}` on that page is genuine interpolation — only this one was a
  Spring placeholder.

That makes **all seven pre-existing broken pages fixed** (five parse errors, two runtime).

**`frontend/tmp_smoke.mjs`** — loads every page in Chromium and reports uncaught exceptions,
console errors, horizontal overflow at phone width, and pages that rendered nothing. ~95s for
528 pages. It reports NETWORK-only failures separately, because a sandbox with no outbound
access fails every CDN load and folding those in with real bugs is how a report becomes noise
people ignore.

**Deliberately NOT wired into deploy.yml** — a browser download is a heavy dependency for a
gate that runs on every push. vcheck (static, ~0.4s, zero deps) gates CI; this is the
before-merge / after-bulk-edit check.

**Why both are needed:** vcheck proved every inline script PARSES. Neither of the two bugs
above is a parse error — one is an undefined identifier, the other is valid interpolation of a
thing that does not exist. Static analysis cannot see either. **Parsing is not running.**

Current smoke state: 528/528 clean, 6 network-only (all pre-existing sandbox isolation).

**WEB FUNDAMENTALS AUTHORED (5 of 7) + TWO INJECTION BUGS MY OWN GATES CAUGHT (2026-08-31).**

Authored: JS fundamentals, CSS fundamentals, DOM & events, async JS, browser rendering — the
zero-starting-point track. Again **no new diagram components**: async reuses `.hf-cast`
(one stack, two queues), DOM events and CSS box model reuse `.hf-nest` (capture/bubble and the
four rings both ARE nesting), browser rendering reuses `.hf-steps`.

**Two bugs in my own injection logic, both caught by the checks added earlier this session:**

1. **vcheck (inline-JS parse) caught it immediately.** The script tag was injected before the
   FIRST `</body>` — which on `web-browser-rendering` is inside a JS string showing a sample
   HTML document. It landed mid-string and broke the CodeWalk data. Fix: inject before the
   **last** `</body>`.
2. **The browser smoke check caught one the static gate could not.** On `web-dom-events` the
   idempotency guard `if 'devhub-hf-check.js' not in s` matched **my own prose** — the page has
   a card explaining that very file — so the real `<script>` tag was never added and its
   knowledge check was dead. The page rendered perfectly. Fix: guard on the **tag**
   (`<script src="…"></script>`), never the bare filename.

Bug 2 is the sharper lesson: an idempotency check that greps for a filename breaks on any page
that *writes about* that filename, which on a site teaching web development is a whole track.
**Guard on the exact artifact you would insert, not on a substring of it.**

A third thing worth recording: my ad-hoc audit of "is this tag inside a script block?" reported
19 broken pages by counting `<script` vs `</script>`, which is nonsense on pages containing
`<script>` inside strings. The browser found the true count: **1**. When a heuristic and a
browser disagree about the DOM, the browser is right — do not "fix" 18 healthy pages.

Every one of the 20 knowledge checks is now verified by CLICKING it and asserting the reveal,
not by checking that a script tag exists.

Authored pages: 12 pattern chapters + 5 OOP Core + 5 Web Fundamentals = **22**.

**Note on the uploads:** all three `Decorator_Pattern_Standalone.html` uploads are byte-identical
and contain the *cream single-screen* export, not the richer dark design in the screenshots. The
screenshots are the real spec. If Bobby can re-export the dark version, match it exactly.

**WEB FUNDAMENTALS COMPLETE (7 of 7) + THE FOUR SITE-WIDE BUGS A STRUCTURAL AUDIT FOUND
(2026-09-01).**

Authored the last two: **HTML fundamentals** (semantic elements as *behaviour*, not decoration
— the div-that-pretends vs the `<button>` that brings focus, keyboard activation, role and
`:disabled` free) and **CSS layout** (flex vs grid reduced to one question: how many axes?).
Still **no new diagram components** — HTML fundamentals reuses `.hf-nest` for landmark
nesting, CSS layout reuses `.hf-slot` for the one-axis/two-axis pick. Six components have now
covered 24 authored pages across three tracks, which is the evidence the component set is the
right size.

Authored pages: 12 pattern chapters + 5 OOP Core + **7** Web Fundamentals = **24**.

**The bug sweep.** Audited all 528 pages for duplicate DOM ids, dead `#anchors`, and links with
no accessible text. Exactly four findings, all real, all fixed:

1. **`angular-di-hierarchy-deep` had two elements with `id="run"`.** The scenario Run button and
   the "▶ Resolve from `<Leaf>`" button. `getElementById('run')` returns the *first* match, so
   the resolve flow was silently wired to the wrong button (on top of its own listener) and the
   second button was completely dead — clicking it did nothing, forever. Renamed to
   `resolveRun` and repointed the four resolve-flow lookups, leaving the two scenario-engine
   `$i('run')` calls alone. Verified: walklog goes 0 → 157 chars on click.
2. **`angular-view-encapsulation` promised a `#host-class` section that did not exist.** The
   `:host(.active)` content was real but lived unlabelled inside another section's `<pre>`. Fixed
   in the direction that keeps the promise: gave it a real anchor **and** the explanation it was
   missing (the selector in the parens matches the host itself — which is how a component reacts
   to state it does not own).
3. **`typescript-fundamentals` had two dead TOC links.** `#decision` pointed at a decision tree
   that genuinely exists ("The practical rule") — gave the heading the id. `#alias-tricks`
   pointed at a section that exists nowhere on the page — removed the entry rather than fake it.
4. **`head-first-strategy` carried a template leftover:** a `visibility:hidden`, text-less back
   link pointing at `angular-index.html` from a Java page. Now matches its sibling chapter page:
   visible, labelled, `app.html`.

**The lesson from #1, which is the one that will recur:** a duplicate id is not a lint nit on a
site of standalone pages. It is a *silent* miswiring — the page renders perfectly, no error is
thrown, and one control simply never works. Neither vcheck nor the browser smoke sweep catches
it (nothing throws), which is why the structural audit is a separate pass and worth re-running
after any retrofit that injects markup into pages that already had their own.

Gate state after the sweep: **vcheck 528/528**, assetcheck **no teaching assets lost**, smoke
**528/528 clean** (6 network-only, all pre-existing sandbox isolation), and the audit now
reports **0 duplicate ids, 0 dead anchors, 0 text-less links** site-wide.

**THE CREAM THEME WAS HALF DEAD, AND SO WAS MY OWN MEASUREMENT OF IT (2026-09-02).**

Three bugs stacked here, each of which hid the next.

**1. The comma.** Twenty-nine rules in `devhub-hf.css` were written

    [data-theme="cream"][data-hf],[data-theme="light"][data-hf] .thing { ... }

which READS as "either theme, this thing" and PARSES as two selectors: a bare
`[data-theme="cream"][data-hf]` that matches `<html>` and leaks the declarations onto the
root, plus a *light-only* rule for `.thing`. The kit's own theme script writes
`data-theme="cream"`, so **the entire component half of the cream variant had never once
applied** — the chip wells, the check buttons, the ladders, the ghosted chapter numeral.
Confirmed three ways in the browser before touching it (`.hf-chapnum` still reporting the
dark `rgba(242,232,219,.05)`, `.hf-scatter span` still on the dark well, `<html>` carrying a
stray `color`). Rewritten with `:is(...)`, which says what was meant at identical
specificity. **vcheck check 7 now fails the build on that shape**, and it was verified by
reintroducing the bug and watching the gate go red, then green.

**2. The legacy colours.** `devhub.css` hardcodes several hundred literals chosen against the
navy dark theme and repairs them only under `:root[data-theme="light"]` — which cream never
matches. Both directions broke: near-whites and neons painted onto a pale card, and — the
inverse nobody looks for — cream's dark ink inherited into surfaces that STAY dark in both
themes, which made `.cw-src` unreadable on **448 pages**. An entire code listing, invisible,
on a site whose whole job is showing code. Repaired per component family and merged as the
CREAM REPAIR LAYER at the end of `devhub-hf.css`.

**3. The gate itself was wrong, and it was wrong in the flattering direction.** The first
`tmp_contrast.mjs` resolved an element's background by climbing to the first non-transparent
`background-color` and treating it as opaque. But backgrounds COMPOSITE: an
`rgba(232,115,74,.11)` wash over a dark panel is not orange, it is faintly warm dark. So the
gate compared orange text against *solid orange* and reported 1.00:1 for `.panel code`, which
in reality is ~7:1 and perfectly legible. It claimed the **dark** theme had 1910 failing
selectors across 515 pages. After compositing the alpha stack properly — and exempting
`aria-hidden` ornament and `background-clip:text` headings, both of which are exempt by
definition — the real number is **48 selectors / 225 instances**. The dark theme was fine all
along; I had built an instrument that manufactured 1862 phantom bugs, and I had already
started reporting them. **Fix the ruler before you trust the measurement** — and when a
report says most of the site is broken, suspect the report.

Measured effect of the repair layer, full 528-page sweep with the corrected gate:

| theme | selectors | instances | pages |
|---|---|---|---|
| cream, before | 2623 | 8530 | 516 |
| cream, after  | 1056 | 1217 | 268 |
| dark, before  | 48 | 225 | 169 |
| dark, after   | **48 → 30** | **225 → 58** | — |

Zero new and zero worsened selectors in dark: the repair layer is provably inert in the theme
that actually ships, because every one of its ~420 selector branches carries the
`:is([data-theme="cream"],[data-theme="light"])[data-hf]` prefix.

**Two real bugs in the DARK theme, found only because the gate got honest:**
- **`devhub.css` never styled a bare `<a>`.** Cross-links between lessons fell through to the
  browser default `#0000EE` — navy on a near-black page, invisible, on ~50 page-instances.
  Now `a{ color:var(--blue) }` at specificity (0,0,1), the lowest possible, so every link that
  already has a class still wins and only the undressed ones are touched.
- **`.userseg button.on` wrote `#fff` on a solid `--accent` fill** — fine for a dark track
  accent, 1.62:1 for a light one, and the accent is per-track across 33 tracks, so no single
  ink is right. Replaced with a 16% accent wash carrying the accent as ink, which reads on
  every accent because the contrast now comes from the wash rather than from luck.

**What is deliberately NOT fixed.** 785 of the 1056 remaining cream selectors are per-page
`<style>` written under names invented for one page (`.vcr-sandbox`, `.trigger-cell`,
`.lc-step`), 1–12 pages each. No shared rule can name them without becoming a thousand
page-specific overrides. That is a per-page pass, and it is scoped follow-up work, not a
regression. The shared components are down to 271 selectors / 327 instances.

**...and then it WAS fixed, by asking the browser instead of the stylesheet.** The paragraph
above was right that no *stylesheet* can reach that tail: CSS cannot ask "is this element's
computed background dark?", and the class names are invented per page. But the browser knows
the answer exactly, so `devhub-hf-theme.js` now carries a **cream contrast repair** pass.

It composites the background stack the same way the gate does, and where text falls under
3.0:1 it moves the text's **lightness while keeping its hue**. That last part is the design
decision: the obvious repair is to slam unreadable text to one ink, which works and destroys
meaning — on a teaching site green is "this is the fix", red is "this is the bug", amber is
"careful". A relit green is still green; it just stops being invisible. Only if the hue
genuinely cannot reach the threshold (pure yellow on white) does it fall back to the ink ramp.

Properties worth recording, because most of them were a bug first:
- **Runs only under cream.** Measured: 0 elements touched on every dark page.
- **First pass is synchronous.** Deferring it painted unreadable text and then corrected it,
  which reads as a flash of broken layout. Later passes are idle-scheduled.
- **Re-evaluates when the ground moves.** The CodeWalk and scenario engines build their chrome
  *after* the first pass, so a node could be measured against one ground and end up on
  another — baking in a colour chosen for a surface that no longer existed. Repaired nodes now
  store the ground they were fixed against and redo themselves when it changes, always
  re-deriving from the ORIGINAL colour so repeated passes cannot walk the lightness away a
  step at a time.
- **Watches class AND inline style,** because the demos change a box's ground both ways, and
  clears its own mutation records with `takeRecords()` so watching `style` cannot feed itself.
- **Reversible.** Every change stores what it replaced; switching back to dark restores the
  page exactly.
- **Costs ~7ms** per page (1440 elements).

Two bugs I wrote and had to find in the browser: `(window.requestIdleCallback ||
setTimeout)(fn, 1)` throws, because rIC's second argument is an IdleRequestOptions object — so
the entire repair silently never ran; and the idempotency guard originally marked a node done
forever, which is what baked in the stale-ground colour.

Final state, full 528-page sweep:

| theme | selectors | instances | pages |
|---|---|---|---|
| cream, at the start of this pass | 2623 | 8530 | 516 |
| cream, after the CSS repair layer | 1056 | 1217 | 268 |
| cream, after the runtime pass | **28–34** | **35–42** | **24–25** |
| dark, throughout | 48 → 30 | 225 → 58 | unchanged by any of it |

The residue is animation timing, not colour: those pages run demos that cycle a box's ground
continuously, and a reactive pass always has one idle-callback of lag between "the ground
changed" and "the text was recoloured". Measuring the same pages at a longer settle returns a
*different* handful, not a smaller one — the signature of a transient rather than a bug. The
final row above is a range for the same reason: two consecutive full sweeps of an unchanged
site returned 28 and 34, which is the noise floor of measuring animations, not drift. A
~80ms wrong state on a handful of animated demos is the right trade against the alternatives
(polling every frame, or not repairing at all). `tmp_contrast.mjs --settle=` exists to tell
those two cases apart.

**Still open for cream, honestly:** legibility is fixed, *palette coherence* is not. A page
that hardcodes `background:#0b1426` still shows a navy box on a mocha-cream card — readable
now, but a different dark from the kit's espresso `#241d18`. Unifying those grounds is a
design pass, not a bug fix, and is deliberately not attempted here.

**MEASURING "THIN" BEFORE FIXING IT (2026-09-02).**

CLAUDE.md carries a standing directive: on any sweep, "scan for thin lessons — pages that
teach a concept only one way, have no memory hooks, or read like documentation instead of
teaching." Doing that by opening 468 pages is not a plan, so `frontend/tmp_hfaudit.mjs` scores
them against the nine-point standard and ranks the thinnest first. Weights follow CLAUDE.md's
own emphasis — line-by-line code explanation and active recall carry most, because those are
the two Bobby has asked for most often.

**What it cannot do, stated up front:** it reads markup, not meaning. It cannot tell a
brilliant analogy from a limp one. What it CAN do is find pages that do not have the
ingredients at all, which is exactly what "thin" means. A low score is "go look at this",
never a verdict; a high score is "has the parts", never "is good".

The first run was the useful part:

| dimension | site score |
|---|---|
| site structural conventions | 100 |
| taught more than one way | 85 |
| line-by-line code explanation | 72 |
| conversational second person | 69 |
| visuals where a picture beats prose | 39 |
| **active recall (predict-then-reveal)** | **5** |
| **memory hooks (mnemonic, callout, contrast)** | **5** |

The bones are in place sitewide and the two things Bobby asked for most are the two that are
missing almost everywhere — they existed only on the 24 pages authored earlier in this
session. That is the whole backlog in one table.

**Authored across this pass (24 → 43, and continuing):** streams, typescript-async-patterns, concurrency,
spring-boot-di-ioc, spring-boot-api-design-deep and design-patterns by hand; the thinnest
Angular pages (functional-guards 31.9→82.3, control-flow 32.8→80.1, and others) by a
per-page agent fan-out, each verified independently afterwards by clicking its knowledge
check rather than trusting the report. Thin pages (under 40) fell 69 → 60.

Deliberate cross-linking, because Head First repeats important ideas in a different voice:
the Spring DI check lands on the singleton-scope trap and names it as the same shared-mutable
-state bug as the Java concurrency chapter; the Streams page ends on RxJS `pipe`/`subscribe`
being the same laziness Bobby uses in Angular every day; the patterns overview points at the
twelve chapters instead of re-teaching them.

**A gate came out of it.** `.hf-check` is inert markup without `devhub-hf-check.js` — the
script is what hides the `.why` explanations — so a page missing the tag renders every
answer's explanation at once and the buttons do nothing. It LOOKS like a styled quiz. That has
now shipped broken twice (once from an idempotency guard matching the filename inside the
page's own prose, once from a freshly authored page simply never getting the tag), so it is
**vcheck check 7** now, verified by removing the tag and watching the build go red. Nobody
clicks 500 pages; the gate does.

**Second and third batches (2026-09-03).** By hand: conditional-types (the distribution rule
and why `[T] extends [U]` is the off switch), angular-v21 (read as ONE story — every headline
feature exists to take a job away from `effect()`), arrays-tuples (`as const` +
`typeof X[number]`), config-app-config (the root injector's contents, written down),
modern-java (records + sealed + pattern matching only pay off together), exceptions (a
`return` in `finally` discards the exception silently). By agent fan-out: functional-guards,
control-flow, communication, content-projection, lazy-loading, standalone-migration,
decorators. Every one verified afterwards by CLICKING both a wrong and the right answer.

Running totals: **61 authored**, thin pages (under 40) **69 → 33**, site mean 49.8 → 53.3.

**A staging slip worth recording, because the fix is a habit not a tool.** Two of those pages
reached a commit without me verifying them: agents write their file BEFORE they report, and a
bare `git add -A` while a batch is running sweeps up whatever happens to be on disk. Both
turned out fine when checked afterwards (77.9 and clean click-tests), so nothing shipped
broken — but "turned out fine" is luck, and two commit messages carried counts that were wrong
by one because I was counting what I had verified rather than what I was staging.
**While a batch is running, read `git status` and account for every file before staging.**
The two weakest dimensions moved from 5/100 to 9/100 — which is the honest shape of the
remaining work: 416 pages still have the bones and not the rhythm.

**The audit tool got a correctness fix of its own.** Its skip list was filename-based, so
`learning-paths.html` — a generated curriculum index with no code, no intro card and no stage
— scored 33.5 and sat near the top of the worklist. It would have been authored next. The fix
is structural rather than another filename: a lesson on this site always has an `.intro` card
or code or a stage (that requirement scores 100/100 sitewide), so a page with none of the
three is scaffolding. 468 → 465 scored pages. A worklist that ranks non-work first wastes
exactly the effort it was built to direct.

**And a design-system bug the parallel authoring exposed.** `.hf-steps li` was
`display:flex; justify-content:space-between` above 620px, which is correct for the two-child
case it was designed against (prose + a `.tag`) and silently wrong for every other one: a text
node and an inline `<code>` become SEPARATE flex items, so

    <li>source — <code>users.stream()</code><small>…</small></li>

rendered as `source —` … a wide gap … `users.stream()` … the note, with the sentence torn into
three columns. One agent hit it, screenshotted it, and worked around it in its own page by
wrapping the prose in a `<span>`; that report is what sent me to check MY pages, where the same
bug was live and unnoticed.

Fixed at the component instead of per-page: the `<li>` is `display:flow-root` and the note
floats right, so prose stays ordinary inline flow and any author can put a `<code>` or an
`<em>` in a step without knowing a rule. It degrades the way the phone layout already does —
if the prose is too long to share the line, the note drops below rather than overlapping.
Verified against the pages that use the original `.tag` form (Template Method, SOLID, browser
rendering): identical rendering, no regression.

The general lesson, which is the same one the contrast gate taught earlier today: **a
component that only works for the shape its author happened to test is a trap with a delay
fuse.** It looked right for months because every existing step happened to have exactly two
children.

**TEXT WAS BEING CLIPPED ON ~450 PAGES AND THE GATE COULD NOT SEE IT (2026-09-03).**

An authoring agent mentioned in passing that a long code token inside a `.hf-card` was cut off
at 390px, and added: *"page-level overflow stays 0 while the token is silently clipped inside
the card, so the 390px overflow check alone does not catch it."*

That is a hole in `tmp_smoke.mjs`, which measured `documentElement.scrollWidth` only. Checked
it, and the report was right — on my own pages:

    streams-visualizer          .hf-card.good clipped by 125px, .hf-ask by 50px
    spring-boot-di-ioc          .hf-card.good clipped by  24px, .hf-ask by 25px
    …with pageOverflow = 0 on both, so the sweep called them clean.

A phone content column is ~220px and `IllegalStateException: stream has already been operated
upon or closed` is one word as far as line breaking is concerned. With
`overflow-wrap: normal` it neither wrapped nor scrolled — it was **clipped**, and the reader
lost the end of the sentence with nothing on screen to say so.

Three fixes, in widening blast radius:
1. **The kit** — `overflow-wrap:anywhere; min-width:0` on every text-bearing `.hf-*`
   component. `min-width:0` matters: a flex item's default `min-width:auto` refuses to shrink
   below its content, which defeats the wrap.
2. **Inline code sitewide** — `:not(pre) > code{ overflow-wrap:anywhere }`. The selector is
   the whole point: code inside a `<pre>` is a listing that scrolls itself, and forcing it to
   wrap would destroy the line structure CodeWalk depends on. Verified afterwards that `pre`
   and `.cw-code` still report `overflow-x:auto` with `overflow-wrap:normal`. This one was
   found on `.intro-lead`, which nearly every lesson page has — `ViewContainerRef.create…`
   rendering 434px wide inside a 218px box.
3. **Tables of contents** — 35 pages set `columns:3`, dropping to 2 under 800px, and nobody
   carried it to a phone: two columns of ~107px, with entries clipped by up to 138px. Fixed
   with `body .toc{ columns:1 }` under 560px. `body .toc` rather than `.toc` because the
   page's own rule is in a `<style>` after this file's `<link>` and would win at equal
   specificity — the extra element selector out-specifies it, so no `!important` was needed
   (checked by removing it and re-measuring: column width 107px → 238px).

**The gate now measures per-element clipping**, restricted to elements that own a direct text
node — `scrollWidth` propagates up the ancestor chain, so an unrestricted check flagged 35–43
elements per page and buried the one actually losing a word. It reports clipping in its own
section rather than failing the page, for the same reason the network-only failures are
separated: ~450 pages carry hand-written per-page CSS, and a sweep that fails on all of them
is a sweep people skip.

Site-wide after the fixes: **73 pages / 121 elements**, every one of them page-local. Visible
now instead of invisible, and scoped as follow-up.

**The lesson, and it is the third time today:** the instrument decides what counts as a bug.
`tmp_contrast.mjs` invented 1862 failures by not compositing alpha; `tmp_smoke.mjs` hid a real
class of failure by measuring the document instead of the elements. Both were *my* gates, and
in both cases the numbers looked reassuring right up until someone checked them.

**Mobile, while here.** The smoke gate ran at 390px, which hid a real class of bug: all 14
landing pages carry `minmax(280px,1fr)` grids inside a 272px container, so every card was 8px
wider than its own container and ate its right margin; on `interview-index` it broke through
into a page scrollbar. Fixed at the cause with `minmax(min(280px,100%),1fr)` — identical above
280px, verified 3 columns unchanged at 1280px — plus a self-contained phone net for the 13
landing pages that link no `devhub.css`. **The smoke gate's default width is now 320**, so the
class cannot come back: 390 is a comfortable phone, 320 is where the arithmetic actually fails.

### 13. Cloud-CLI lessons — ✅ ALL THREE LANDED (2026-09-04)

All three ship under **Shell & Scripting → Cloud CLIs**:
[`shell-aws-cli-visualizer.html`](../frontend/shell-aws-cli-visualizer.html),
[`shell-azure-cli-visualizer.html`](../frontend/shell-azure-cli-visualizer.html), and
[`shell-gcloud-cli-visualizer.html`](../frontend/shell-gcloud-cli-visualizer.html) — all
`data-hf`, all authored, each routed through the identity surface of its cloud (`az ad`,
IAM, `gcloud iam`) so they land on Bobby's actual CIAM day job rather than generic compute.

The gcloud page closes the item. Both sibling pages' "Where to go next" entries — plain text
marked *(not written yet)* since the page was linked before it existed, which is what turned
`tmp_vcheck.mjs` red — are now real links again.

**How it was written, since the same shape suits any "third of a set" page.** Cloned the Azure
page's structure verbatim (same vertical chip engine, prefix `gc`) and then spent the effort on
the **delta**, not the overlap: the page opens by telling the reader that group → verb is
already familiar and that only two things are genuinely new. Those two carry the lesson:

1. **Named configurations** (`gcloud config configurations activate`) — the differentiator this
   item called for. Framed against the other two: AWS's `--profile` swaps credentials only and
   `az account set` swaps the subscription only, so both let you end up *half*-switched — right
   person, wrong project. `activate` swaps account + project + region atomically.
2. **Two logins** — `gcloud auth login` (for the human) vs `gcloud auth application-default
   login` (for client libraries). This is the actual first-day failure on GCP, and it is
   scenario ① plus a knowledge check, because "my terminal works but my app says *Could not
   automatically determine credentials*" is the moment the distinction has to land.

Three smaller `az`→`gcloud` traps are called out where they bite: the read-one verb is
`describe`, not `show`; names are positional, not `--name`; and `--format`/`--filter` are
gcloud's own languages, **not** the JMESPath `--query` that AWS and Azure share. That last one
is the page's memory hook — *two clouds query, the third one formats and filters* — and it is
the kind of contrast only the third page in a set can make.

CIAM payoff, which no other page in the track can show as cleanly: `gcloud auth
print-access-token` vs `print-identity-token` makes **authorization vs authentication** two
runnable commands rather than a diagram, and scenario ④ ends on workload identity federation
as the reason `gcloud iam service-accounts keys create` is the command you should never run.

**Verification, honestly.** `tmp_vcheck` green (531 pages, 515 registered), `tmp_assetcheck`
clean, `tmp_hfaudit` scores it **65** — level with its Azure sibling (65) and above AWS (61.5).
The browser gates did **not** run: Playwright is still not installed on the Windows box. In
their place a scratchpad script checked the things parsing cannot see — every scenario step
references a node that exists, every node drawn is actually visited, every `who-*` badge has a
CSS rule, both `hf-check` blocks have an in-range `data-answer` with a `.why` per option, and
every non-blank CodeWalk line is covered by a step. That is not a substitute for rendering the
page; it is a substitute for *this class of bug*. **Still worth doing when Playwright exists:**
`tmp_smoke` and `tmp_contrast` on this page, in both themes.

*(A third bug found in the earlier AWS/Azure pass: `entra-id-overview-visualizer.html` was
linked from the Azure page but the file is `entra-overview-visualizer.html` — a typo, fixed
then.)*

**Also fixed here:** `DEVHUB-GUIDE.md`'s Shell track row never mentioned the Cloud CLIs at all —
the AWS/Azure pass updated the registry but not the navigator, so the section was invisible to
anyone reading the guide rather than the hub.

*(A third bug the same pass: `entra-id-overview-visualizer.html` was linked from the Azure
page but the file is `entra-overview-visualizer.html` — a typo, now fixed.)*

### 14. The 13 track landing pages ignore the theme — ✅ LANDED (2026-09-04)

Now that cream is the default, the journey **hub → track index → lesson** went
**cream → dark navy → cream**. Verified by screenshot on `angular-index.html`.

Why they are stranded: of the 530 pages, 15 carry no `data-hf`. `app.html` has its own
cream palette and `index.html` is only a redirect, so the real set is the **13 landing
pages** (`angular-index`, `aws-index`, `configs-index`, `docker-index`, `ds-index`,
`entra-id-index`, `git-index`, `interview-index`, `maven-index`, `ping-idm-index`,
`spring-boot-index`, `typescript-index`, `index-legacy`). None of them link `devhub.css`
and none load `devhub-hf-theme.js`, so **nothing sets `data-theme` on them at all** — and
their dark colours are inline, so setting it alone would not be enough either.

Both halves are needed: something must set the attribute, *and* these pages need light-theme
values to answer it. All 13 do load **`devhub-transitions.js`**, which makes it the natural
place for the attribute half (it already must be self-contained per `CLAUDE.md`).

*Found via a 2026-08-31 stash (`stash-backup-20260904`) that tried exactly this. Its
implementation is superseded — an older "paper" palette (`#f0e9da`/`#bf5f1f`, since replaced
by cream `#f5ead8`/`#c15c30`), Fraunces instead of Playfair/Caprasimo, and a Google Fonts
`@import` where the repo now self-hosts all four `.woff2` files. Don't restore it; it only
identified the gap.*

**APPROVED 2026-09-04 — do both halves, plus the migration flag.** Written down before
starting so a session cut cannot lose the plan.

1. **Set the attribute.** Add a theme bootstrap to **`devhub-transitions.js`** — the only
   shared script all 13 load. It must be **self-contained** (`CLAUDE.md`: these pages link no
   `devhub.css`, which is exactly how the giant-ripple bug happened), so it injects its own
   id-guarded `<style>` rather than assuming any stylesheet. Read `localStorage`
   `devhub-theme`, default **cream/light**, set `<html data-theme>` before first paint.
   Must agree with the other two defaults — `app.html`'s `|| 'light'` and
   `devhub-hf-theme.js`'s `normalise()`. **Three places now; change one, change all three.**
2. **Give them light values to answer with.** The 13 pages' dark colours are inline, so the
   attribute alone changes nothing. Each needs cream equivalents under
   `:root[data-theme="light"]` — matching the hub's tokens (`--bg:#f5ead8`,
   `--accent:#c15c30`, `--text:#2e2318`), not the stash's older paper ones.
3. **One-time migration — `devhub-theme-v3`.** Without it, anyone already storing `'dark'`
   (Bobby included) never sees the cream redesign. Flip stored `'dark'` → cream **once**,
   set the flag, and respect every choice made after that. Put it in the same bootstrap so
   hub and standalone pages migrate identically.
4. **Verify by screenshot, not by reading**: `hub → angular-index → an Angular lesson` must
   be continuous cream, and the dark toggle must still carry across all three.

The 13: `angular-index`, `aws-index`, `configs-index`, `docker-index`, `ds-index`,
`entra-id-index`, `git-index`, `interview-index`, `maven-index`, `ping-idm-index`,
`spring-boot-index`, `typescript-index`, `index-legacy`.

#### What actually shipped (2026-09-04)

All four steps done, with **one deliberate deviation from step 1**: the bootstrap did *not*
go in `devhub-transitions.js`. That script loads at **end of body**, so a bootstrap there
paints the dark palette first and flips to cream after — a visible flash of the wrong theme
on every landing page. Instead each page got an inline pre-paint `<script>` in `<head>`,
right after `</title>`. Cost: the default now lives in **three** places (`app.html`'s head
script, `devhub-hf-theme.js`'s `normalise()`, and these 13 inline scripts) — *change one,
change all three*. That is written in the comment at each site.

Note the two bootstraps store **different words for the same palette**: `app.html` stores
`'light'`, `devhub-hf-theme.js` stores `'cream'`. Each normalises the other's word, so they
interoperate — verified live: hub paints `data-theme="light"`, a lesson paints
`data-theme="cream"`, and both compute `--bg: #f5ead8`.

**The part that was not in the plan, and mattered most.** Step 2 said "give them light
values to answer with", which reads like a CSS-variable job. It is not — roughly half the
breakage was in rules that **hardcode a hex**, which no variable override can reach. Found by
loading all 13 pages in same-origin iframes and measuring the *computed* colour of all 1202
text nodes against each one's real effective background. Three distinct kinds:

1. **Real failures.** `a.back` was `#22d3ee` cyan = **1.52:1** on cream (10 pages). Every h1
   brand gradient failed, worst stop **1.10–2.50:1** — the page title on all 12 that have one.
2. **Failures the fix itself introduced.** `.tier-num` is `color:#0f172a` near-black on
   `background:var(--beg)`; fine when `--beg` was bright green, unreadable once cream made it
   dark. Same for interview's four `.diff-*` chips (var text on a hardcoded near-black tint)
   and aws's `.card:hover{background:#1e293b}`, which turned a hovered card navy under cream.
   A variable-only sweep would have shipped all of these.
3. **Visual seams that were not contrast bugs.** Tag chips hardcode `background:#0b1426`, so
   dark navy chips floated on cream cards — readable, but obviously wrong.

**Tune against the darkest surface, not the lightest.** The first pass tuned every accent to
4.6:1 on `--bg` (`#f5ead8`). Card titles sit on `--panel` (`#efe2cc`) and chips on `--panel2`
(`#e6d7bd`), so they landed at **4.28–4.38** — under AA by a hair, on ~500 card titles, on
every page. Retuned against `--panel2`: one value is then safe on all three surfaces. Worth
remembering for any future cream work.

**`index-legacy` needed a different technique.** It sets ~40 brand colours as *inline* styles,
which beat any stylesheet rule; on cream they ran **1.10–2.65:1**, the worst text in the sweep.
Rather than `!important` whack-a-mole across 20 hexes, each inline colour became
`var(--b-<hex>, <hex>)`: cream defines `--b-*` as a darkened equivalent, and the dark theme
falls through to the fallback and renders exactly as before. The hook lives in the markup and
each theme answers for itself. `#0f172a` was deliberately **excluded** — it is dark text on a
bright chip and is correct in both themes.

Verified: **light 3 failures, dark 0** across 1202 text nodes. Dark was re-checked through the
real path (set `localStorage`, reload, read what the page painted) and is unchanged — screenshot
of `angular-index` in dark is pixel-for-pixel the original. The migration was exercised both
ways: a dark-era visitor is flipped to cream once and the flag set, and a dark choice made
*after* the migration is respected.

**Known-remaining (3, all pre-existing, none introduced here).** White text on a bright brand
chip, identical in both themes, so they are a site-wide brand-chip question rather than a cream
regression: `span.logo` white on Spring green `#6db33f` (2.57:1), and two `index-legacy`
`span.tier-num` "+" markers whose colour is set *inline* — white on `#2496ed` (3.15) and on
`#f05032` (3.56). Fixing them means deciding whether brand tiles may deviate from brand colour.

Tooling note: `tmp_shot.mjs`/`tmp_smoke.mjs`/`tmp_contrast.mjs` could not run — **Playwright is
not installed on the Windows box** (`npm i -g playwright`, or set `PW_MODULE`). The
iframe-based audit above was the substitute and is arguably stronger for this particular
question, since it measures computed colour against real effective backgrounds; but it is
ad-hoc and lives in the scratchpad, not in the gates.

---

### 15. Document the code itself — ✅ COMPLETE (Bobby, 2026-09-07; landed 2026-09-09)

> "Make sure all the methods/variables, everything, is documented in comments in the code as
> well as an overall concise doc for the app. Each file explained thoroughly, and how it
> relates to other files in the project, and how it relates to the project overall."

The teaching content is documented to a high bar; **the code that delivers it is not.** DevHub
is itself a codebase a learner (or a future session) has to understand, and right now the only
way in is to read 5,668 lines of engine JS and infer the wiring. Measured comment density
across the 17 shared front-end files, 2026-09-07:

| file | lines | comment lines | functions | note |
|---|---|---|---|---|
| `tracks-data.js` | 992 | 10 (1%) | — | the site REGISTRY; the derived practice-map block has no explanation of what derives it |
| `devhub-codewalk.js` | 211 | 6 (2%) | 21 | the widget whose zero-based `lines:` contract cost this repo a 242-mount repair sweep — and the contract is written in CLAUDE.md, not in the file that enforces it |
| `devhub-tryit.js` | 523 | 62 (11%) | 39 | four language runtimes (sandboxed JS, tsc, Pyodide, CheerpJ) with per-runtime quirks (Java 8 only, cooperative threads) recorded only in ROADMAP prose |
| `devhub-codegrade.js` | 1201 | 161 (13%) | 83 | largest engine; the `coach:` contract IS well documented in its header — the model for the rest |
| `devhub-chapters.js` / `-hf-theme.js` / `-quiz.js` | 269 / 388 / 605 | 12–14% | 25 / 37 / 44 | theme bootstrap is one of THREE that must agree; nothing in the file says so |
| `devhub-flashcards.js` / `-notebook*.js` | 217 / 162 / 245 | 15–19% | 19 / 16 / 29 | |
| `devhub-run.js` / `-syntax.js` / `-hf-check.js` / `-lesson.js` / `-transitions.js` / `config.js` | 40–168 | 24–82% | 4–8 | already at or near the bar — use these as the reference voice |

Every engine already has a top-of-file banner; the gap is **per-function and per-field** doc
comments, and the cross-file "who calls me, what breaks if I change" links.

**Scope, in the order that pays off fastest:**

1. **`docs/CODE-MAP.md` — the missing overall doc.** One page: what each file in `frontend/`,
   `backend/`, `deploy/` and the gate harness IS, in one paragraph, plus a dependency picture
   (which engines a lesson page loads, which of them touch `localStorage`, which read
   `tracks-data.js`). `docs/ARCHITECTURE.md` covers the *system*; this covers the *files*.
   Cross-link both ways so neither drifts alone.
2. **Per-file JSDoc pass on the 17 shared engines**, worst-density first — `tracks-data.js`,
   `devhub-codewalk.js`, `devhub-tryit.js`. Each file gets: what it is, who loads it, what it
   assumes about the page, what it persists (exact `localStorage` key), and a one-line doc on
   every exported function and every non-obvious field. **Invariants that currently live only
   in CLAUDE.md belong in the code they govern** — zero-based `lines:` in
   `devhub-codewalk.js`, the three-bootstrap theme agreement in `devhub-hf-theme.js`, the
   self-contained-CSS rule in every engine that injects a `<style>`.
3. **The gate harness (15 `tmp_*.mjs`)** — each says in its own header what question it
   answers, what a failure means, and what it CANNOT see (`tmp_cwlines.mjs` cannot see a note
   pointing at the wrong-but-in-range line; `tmp_hfaudit.mjs` reads markup, not meaning;
   `tmp_vcheck.mjs` proves scripts parse, not run). The "what it cannot see" line is the
   valuable half — every bug this repo has shipped twice lived in that gap.
4. **The 537 lesson pages** get an anatomy doc, not 537 file comments: one "how a lesson page
   is built" walkthrough of a canonical page (head → `body.track-*` → `.intro` → engine
   mounts → "Where to go next"), so any page is readable once. Per-page inline comments only
   where a page does something unusual.
5. **`backend/`** — the global CLAUDE.md Javadoc standard ("full multi-line Javadoc that
   explains how a class relates to the rest of the codebase") applied to the Spring side.

**Do NOT** turn this into `// increment i` noise. The bar is the same as the teaching bar:
explain the WHY and the relationships, never restate the syntax. A comment that repeats the
code is worse than none, because it rots silently.

**Suggested gate:** a `tmp_doccheck.mjs` that fails when a shared engine exports a function
with no preceding doc comment — cheap, and it keeps the pass from decaying the way the
CodeWalk indices did.

#### ✅ What landed (2026-09-09)

All five scope items are done and **`node frontend/tmp_doccheck.mjs` is green at 326/326
symbols**, wired into `.github/workflows/deploy.yml` so it gates the Pages deploy.

| scope item | state |
|---|---|
| 1. `docs/CODE-MAP.md` | written — 10 sections, cross-linked with ARCHITECTURE.md |
| 2. 17 shared engines | every function documented; the CLAUDE.md invariants now live in the code they govern |
| 3. 17 gates | every one opens with a banner carrying a **WHAT IT CANNOT SEE** section |
| 4. 537 lesson pages | anatomy walkthrough in CODE-MAP §2, not 537 file comments |
| 5. `backend/` | every type and public method carries relationship-explaining Javadoc |

**Three gate bugs the pass surfaced** — all found by disbelieving a green result, and all
fixed in `tmp_doccheck.mjs`:

1. **It could not tell code from a string containing code.** `devhub-tryit.js` builds the
   iframe sandbox bootstrap as a template literal; its `__send`/`__fmt` were reported as
   undocumented functions of the file. Now skipped as the payload they are.
2. **Backtick parity was the wrong tool for finding those strings.** `devhub-syntax.js` and
   `devhub-codewalk.js` each build a highlighter regex as a single-quoted string containing
   one backtick. A parity counter flipped there and never flipped back — silently skipping
   **159 lines of `devhub-codewalk.js` and 64 of `devhub-syntax.js` and reporting every
   symbol in them as documented.** Replaced with a scanner that tracks quote state, plus a
   self-test that fails loudly if a file ever ends mid-template. *A gate that under-reports
   is worse than no gate.*
3. **It could not walk up past a multi-line annotation.** `@Table(name = …,` continues onto a
   line starting `uniqueConstraints`, so `TopicProgress` was reported undocumented while
   carrying a perfectly good Javadoc block. The upward walk now tracks bracket depth.

It also gained a deliberate exemption: a **one-line DOM event wire-up**
(`s.onerror = () => resolve(false);`) no longer needs a comment. Demanding one produced
exactly the `// increment i` noise this item forbids. A handler with a real body still has
to say why it exists.

**Two real defects the documenting turned up** (documented in place, not silently changed —
both were Bobby's call). **All three are now closed, 2026-09-11:**

- ~~`ProgressService.TOTAL_TOPICS` is hard-coded to **200**, but `tracks-data.js` registers
  **521** pages.~~ **✅ FIXED.** The constant is gone; the denominator is now the config
  property `app.progress.total-topics` (`application.yml`, default `${TOTAL_TOPICS:521}`),
  so a deployment overrides it without a recompile. `getStats` also floors `notStarted` at 0
  and caps the percentage at 100, which the old arithmetic did not — with a 200 denominator a
  thorough learner could return 260%.

  The real risk was never the wrong number, it was that nothing would notice the next drift.
  So `tmp_vcheck.mjs` gained **check 9**: it reads `backend/.../application.yml`, pulls the
  `total-topics` default out, and fails the build if it disagrees with the count of pages
  `tracks-data.js` actually registers. The backend cannot read the frontend registry, so this
  gate is the only thing holding the two in sync. Deliberately verified it is not a no-op that
  silently passes — the *"a gate that under-reports is worse than no gate"* lesson from the
  three bugs above: confirmed the path resolves, the regex matches, and a planted value of
  `200` makes it fail. `StatsResponse`'s "KNOWN DRIFT" Javadoc was replaced rather than left
  to rot.
- ~~`app.exec.enabled` (env `EXEC_ENABLED`) **defaults to `true`**~~ — **not an open issue;
  the audit note was measuring the wrong default.** The `true` is the bare
  `@Value` fallback that only applies when nothing sets the property, and every path that
  actually deploys this backend sets it: `application-prod.yml` uses `${EXEC_ENABLED:false}`,
  and the App Runner JSON, the Azure bicep, `deploy.sh`, and the GitHub workflow each pass
  `false` explicitly. No reachable deployment ships with server-side execution on. Left as
  documentation rather than "fixed", because the code is already correct and changing the
  fallback would only move where the reader has to look.
- ~~Minor asymmetry, left as-is: `devhub-codegrade.js`'s `pyBooting` latch is never cleared on
  failure~~ **✅ FIXED.** `pyBooting` now carries the same `.catch(() => { pyBooting = null; })`
  its `javaBooting` sibling has, so a Pyodide boot that fails — an offline first run, a CDN
  blip — releases the latch and the next grade retries instead of wedging Python until reload.

---

### 16. Git/GitHub, the shells, and AWS — tutorials + a cheat-sheet page TYPE (Bobby, 2026-09-13)

Bobby: *"do we have documentation and also a tutorial on how to get the github pages up and
running? … Everything github related. Version control, quick commands, etc. Do we have the same
for shell, powershell cmd, and bash too? I want to have actual examples that one could look at,
as well as a 'cheat sheet' for important cli commands. Same for AWS."*

**First, the answer to the question half — mostly YES, at beginner depth.** Inventoried
2026-09-13; do NOT rebuild any of this:

| Topic | What already exists | Track |
|---|---|---|
| Git | `git-visualizer` (basics, incl. an "Oh no" recovery table), `git-branching`, `git-collaboration` (owns the PR workflow), `git-rebase` (incl. `reflog`), `git-advanced` (incl. `bisect`) | `tools` |
| Git drill | `exam-git.html`, `flashcards-git.html` (28 cards) | `exam-prep` |
| Bash / shells | `shell-cli-basics`, `shell-bash`, `shell-powershell`, `shell-cmd` | `shell` |
| Cloud CLIs | `shell-aws-cli`, `shell-azure-cli`, `shell-gcloud-cli` (item 13, landed 2026-09-04) | `shell` |
| GitHub Actions | `devops-cicd-pipeline-visualizer.html` — the ONLY page that owns Actions | `devops` |
| AWS services | 15 `aws-*` pages (+7 Azure, +7 GCP) — services, not CLI | `cloud` |

**The gaps that are actually real:**

1. **There is no cheat-sheet page TYPE on this site.** Not a missing page — a missing *format*.
   What exists is flip-card decks (`devhub-flashcards.js`, drill not reference) and in-lesson
   `<table class="ref">` blocks buried inside lessons you must already be reading. No standalone,
   one-screen, scannable, Ctrl-F-able reference page exists, and no `*-cheatsheet*.html` naming
   convention. **Highest leverage, zero duplication risk.**
2. **GitHub Pages deployment has ZERO teaching content** — two incidental prose mentions
   sitewide, despite being how this very site ships. The repo's own
   `.github/workflows/deploy.yml` (4 gates: vcheck, doccheck, assetcheck, tracks-data) is a
   ready-made worked example, including how to read a failed deploy.
3. **GitHub-the-platform is nearly absent.** PR *reviews*, CODEOWNERS, required checks, draft
   PRs, squash-vs-merge, workflow YAML depth, matrix builds, secrets/OIDC, reusable workflows —
   none taught. `git-collaboration` covers the PR *flow*, not the platform.
4. **Git remotes / the distributed model** — `fetch` vs `pull` vs `push`, `origin`/`upstream`,
   tracking branches, forks. No page owns it; it survives only as flashcards and asides.
   The most common real-world confusion in Git, and it is the thinnest spot.
5. **Bash beyond script anatomy** — no pipes/redirection lesson, no `grep`/`sed`/`awk`/`find`/
   `xargs` toolbelt, no permissions, `ssh`, job control, or `PATH`/dotfiles.
6. **PowerShell depth** — one page on cmdlets + the object pipeline; no scripting, error
   handling, modules, remoting, or `Invoke-RestMethod`.

**The design insight — these are TWO page types, and mixing them ruins both:**

- **Tutorial** = narrative, one job start to finish, full Head First standard applies. "Get
  GitHub Pages running" is the model: init → the `gh-pages` vs `/docs` vs Actions choice → the
  workflow file → a red deploy and how to read it.
- **Cheat sheet** = scannable reference for someone who already knows what they want and needs
  the exact flag. The Head First devices mostly DO NOT apply — no dialogue, no predict-then-
  reveal. Forcing `hf-talk` into a reference table is how this goes wrong. Needs its own thin
  CSS contract and its own audit treatment (`tmp_hfaudit` would score it as a thin lesson
  forever; decide whether to exempt it by filename, the way `SKIP` already exempts `*-index`).
- The cross-shell comparison (`ls` / `Get-ChildItem` / `dir`) belongs in the CHEAT SHEET, where
  the side-by-side IS the value. As *lessons* the shells must stay split: PowerShell pipes
  objects, bash pipes text, and that divergence is a teaching beat, not a syntax note.

**Suggested order** (cheapest-highest-value first): the cheat-sheet type + 3–4 sheets (git,
bash, PowerShell/cmd, aws) → GitHub Pages tutorial → Git remotes lesson → GitHub platform page →
Bash toolbelt → PowerShell depth.

**✅ DECIDED by Bobby 2026-09-13: both get their own track.**

**(a) Git track — BUILT the same day.** `id: 'git'`, 🌿 **Git & GitHub**, under *DevOps, Cloud &
Data*. The 5 existing pages moved out of `tools` (whose `desc` dropped "Git"); all 5 retagged
`<body class="track-git">`; palette added in BOTH themes — `devhub.css` `--accent:#f05033`
(the Git logo orange) + the `::before` glow, and `devhub-hf.css` cream `--hf-track:#b83318`.
Site is now **35 tracks**, counts bumped in README + DEVHUB-GUIDE. Gates green: vcheck,
doccheck, practice-map, contrast (both themes), smoke.
  - **One real bug fell out of it, now fixed at the cause.** `.hf-slot .ctx` paints its own
    light-brown ground, and a `<code>` chip inside it was taking the page's *track* accent —
    a colour picked to sit on the dark page, not on that brown. Git orange measured **1.57:1**.
    `.hf-slot .ctx code` is now pinned to its own ink, so it holds for every track including
    ones not invented yet. The cream repair layer (`--accent`/`--accent2` rebound per
    container) is **cream-only**; dark has no equivalent, which is why this needed pinning
    rather than a variable. Any FUTURE warm-accent track would have hit the same thing, on
    112 `hf-slot` pages.

**(b) Cheat-sheet track — ONE track for all of them**, Bobby 2026-09-13: *"another cheatsheet
in its own track, for all cheatsheets stuff for coding, VSCode, IntelliJ, AWS commands, Github
commands, and so forth… Oh and powershell, CMD, etc etc. Stuff for pc/coding."*
Palette is already in place (`track-cheatsheets`, highlighter yellow `#facc15`, cream
`--hf-track:#8a6410`), but the **track is NOT registered yet** — a track with zero pages has
nothing to list, so it registers with its first sheets.
  - Sheet list so far: **Git/GitHub commands, VS Code, IntelliJ, AWS CLI, PowerShell, CMD,
    bash/shell**, plus general "coding". Bobby will add more.
  - These **complement** item 9 (IDE mastery), they do not collide: item 9 is a *lesson* track
    that teaches the IDE; these are *reference* — the shortcut you forgot. Build both.
  - Still to design before the first sheet: the page TYPE — its CSS contract, and whether
    `tmp_hfaudit` exempts `*-cheatsheet*.html` by filename the way its `SKIP` already exempts
    `*-index`. Without that, every sheet scores as a permanently thin lesson.

**(c) Still open:** is the AWS ask CLI depth (`--query`/JMESPath, profiles, SSO — check
`shell-gcloud-cli` first, it deliberately teaches `--format`/`--filter` vs `--query` as a
contrast) or an AWS *services* cheat sheet? The cheat-sheet track now gives the second reading
a home, so this may simply be both.

**Overlaps to respect:** item 5 still lists Shell as a thin track (its count "4" is stale — it
is 7) and nothing has landed against that line. Item 9 (IDE mastery) already claims a "git
integration" beat per IDE — keep it about the IDE's git UI, not Git concepts, or the two
collide.

---

### 17. Head First SHAPES — killing the cookie-cutter (Bobby, 2026-09-13) — IN PROGRESS

**The complaint.** Bobby, after the 474-page Head First sweep: *"right now its all the same
boring setup"*, then later *"we cant cookie-cutter everything for this app. it needs to be
fresh. it needs to standout!"* and *"last time I trusted you to do this, you did the same
cookie cutter shape for hundreds of pages. lol"*.

**The cause, and it is not carelessness.** `docs/HEADFIRST-BLOCK-RECIPE.md` opened its markup
section with **"Your block, in this order:"** and listed one order. Every page followed it.
The devices work; the variety did not survive being scaled. Measured before any fix:

| on ~every page | | on almost none |
|---|---|---|
| `hf-deck` 475 · `hf-say` 474 · `hf-check` 474 | | `hf-qa` 0 · `hf-chain` 0 · `hf-receipt` 0 · `hf-hand` 0 |
| `hf-talk` 466 · `hf-annot` 462 · `hf-napkin`/`hf-terms` 458 | | `hf-brain` 2 · `hf-vs` 2 |

**Landed 2026-09-13:**

- **`docs/HEADFIRST-SHAPES.md`** — eleven shapes (`tour`, `questions`, `receipt`,
  `whiteboard`, `argument`, `exhibit`, `assembly`, `timelapse`, `twodoors`, `mnemonic`,
  `autopsy`). Each has a TRIGGER keyed to the kind of gotcha (a misconception / a cost / a
  structure / a gap between two correct parties / a googleable error / …), a silhouette, and
  the devices it must and must not have. Assignment is by gotcha, never by topic — "it's a
  Spring page so it gets the Argument" is the same failure one rung up.
- **`data-shape` on the `hf-deck` line** — the block declares its own shape. Layout-neutral;
  it exists so the shape is a fact the build can check, not an impression while scrolling.
- **`frontend/tmp_variety.mjs`** — fails on (a) skew: any shape over 18% of a track, 25% for
  `tour`; (b) a dead shape once the sweep is done; (c) **a lie**: a block claiming `receipt`
  with no `hf-receipt`, or carrying a device its shape forbids. (c) is the load-bearing one —
  declaring variety is free, and this makes the declaration cost something. It is the only
  gate in the repo that looks ACROSS pages; every existing gate passes 474 identical pages.
- **The recipe's "in this order:" is gone**, replaced by a parts-catalogue banner pointing at
  the shapes doc.
- The 8 pilot pages now declare their shapes: `questions` = spring-boot-bean-lifecycle,
  typescript-generics · `receipt` = aws-cost, react-performance · `whiteboard` =
  entra-oauth-oidc, ds-hash-tables · `argument` = nosql-redis, angular-change-detection.

**A finding from the gate's first run**, kept because it is the failure mode in miniature:
it flagged both `questions` pilots for carrying `hf-card`. Wrong — that card was a bare frame
around a diagram, which is fine. The Tour's spine is the VERDICT pair (`hf-card bad` +
`hf-card good` with titles), so the ban is now `hf-verdict`, synthesised in the gate. Banning
the container would have pushed authors away from framing figures, i.e. toward less variety.

**STEP 1 DONE — all eleven shapes now exist on a real page.** Seven were specs; each got one
exemplar, so every contract has been tested against a page instead of against itself:

| shape | page | the gotcha that chose it |
|---|---|---|
| `tour` | `debugging-jwt` | declared, not rewritten — it already earns all four parts |
| `exhibit` | `debugging-stack-traces` | two log entries for one exception, one with 40 frames and one with none |
| `assembly` | `spring-boot-security-filter-chain-deep` | `matches()` — first yes wins — reads like routing and IS the decision |
| `timelapse` | `java-datetime` | 23:41:02 → 09:14, same jar, same line, two answers |
| `twodoors` | `spring-boot-microservices` | relay the user's JWT **or** Client Credentials; both right, somewhere |
| `mnemonic` | `big-o` | *"Compute it, halve it, or walk it."* |
| `autopsy` | `nosql-document-wide-column` | `WriteError{code=17419, …larger than 16777216}`, climbed backwards |

**And a real bug the exemplars surfaced, which was never about the shapes.** Bobby on the
`exhibit` and `tour` pages: *"the alignment is all off - hopefully just because of the current
size of my window."* It was not the window. `devhub-hf.css`'s book column was
`[data-hf] .container{max-width:820px}` — and those two pages, plus **102 others**, wrap their
content in `<div class="page">`. `devhub.css:93` already treats the two shells as one selector;
the HF layer did not. So at 1440px those 104 pages ran 1386px edge to edge while the prose
inside them stayed capped — `.hf-say` at 20ch, `.hf-big` at 30ch, an `.intro` card 1386px wide
with a 609px paragraph in it and a 700px void to its right. Now `[data-hf] :is(.container,.page)`,
and all three measured pages report an identical `left=288 w=865` at 1440. The affected set is
the angular `-deep` pages, the playgrounds and the debugging track; spot-checked the two most
width-hungry (`jwt-playground`, `angular-rxjs-operators-lab`) and their two-column tools still
lay out correctly at 820. **No gate could see it** — vcheck passes, smoke only looks for
overflow at 390px, contrast only reads colour. Noted in `CLAUDE.md`.

Three things the build taught that the spec had not:

- **Five shapes ban `hf-napkin`, and the tooling assumed every block ended in one.**
  `blockshot.mjs` cropped on the napkin and silhouetted a finished `timelapse` at 81px.
  Anything that walks a block must find its end by "the last `hf-*` sibling before the
  visualiser". Fixed there; noted in the shapes doc for whatever walks a block next.
- **A shape can need CSS that does not exist.** `twodoors` was unbuildable out of `hf-vs`,
  whose children stamp ❌/✅ — the exact framing the shape refuses. Added `.hf-vs > .door`
  (two accent tints + a `Door 1 ·` counter) to `devhub.css`, with a cream repair in
  `devhub-hf.css`. Likewise `.hf-big` is sitewide *smaller* than `.hf-say` (27px vs 38px),
  which is fine everywhere except the one shape that is nothing but the hook — so
  `.hf-deck[data-shape="mnemonic"] ~ .hf-big` is bumped to 44px. Both verified in-browser.
- **Re-staging costs teaching.** Every re-stage shrank its block (14.1k→10.5k, 9.8k→9.1k,
  14.1k→11.0k, 11.4k→8.6k, 11.0k→9.1k) because the banned devices took real paragraphs with
  them. Correct when the page's gotcha genuinely is the new shape; wrong when the page is
  already a good `tour` — which is why `debugging-jwt`, the obvious `timelapse` by gotcha,
  was declared instead of rewritten, and `java-datetime` took the slot.

**Still open:**
- **459 pages `unshaped`.** Each needs a shape assigned and its block re-staged — or a
  deliberate `data-shape="tour"` when it genuinely earns one (Bobby: *"If some pages are
  perfect with the current view … we can leave it"*). Leaving it undeclared is NOT the same
  as declaring `tour`; the manifest is the audit trail.
- **The manifest review (step 2, next).** `tmp_variety.mjs --manifest=` per track, with a
  reason column, for Bobby to spot-check BEFORE the re-staging — the point is that a wrong
  call shows up in a 459-line file rather than in 459 rewritten pages.
- **Step 3** — the bulk re-stage, track by track, against the reviewed manifest.

**What the gate cannot see** (stated because the last mechanism failed by being trusted past
its limits): whether a shape SUITS its page. A `receipt` on a lesson with no cost in it passes
every check and is still wrong. It stops a relapse into one shape; it cannot tell you the
eleven are well matched. That is what reading the manifest is for.

---

### 18. Go GRANULAR on the eight core tracks before scaffolding anything new (Bobby, 2026-09-13)

> *"for the angular and spring boot, maven, docker, shell, aws, idm, and infrastructure items,
> how much more detailed can we get with every concept? How much more granular can we get?
> … I really want to strengthen on them, after that is done, we can scaffold the rest."*

**Sequencing decision (Bobby's):** depth on these eight comes BEFORE breadth. That explicitly
defers item 16's cheat-sheet track and any other new-track scaffolding until this lands.

**Measured inventory (2026-09-13, from `tracks-data.js`):**

| area | track | pages | sections |
|---|---|---|---|
| Angular | `angular` | 74 | 11 |
| Spring Boot | `spring-boot` | 53 | 7 |
| IDM / identity | `identity` | 19 | 6 |
| AWS | `cloud` | 15 | 2 |
| Docker | inside `tools` | 6 | — |
| Maven | inside `tools` | 5 | — |
| Shell | `shell` | 7 | 3 |
| Infrastructure | `devops` 7 + `kubernetes` 7 + `azure` 7 + `gcp` 7 | 28 | — |

Note Docker and Maven are **sections of `tools`, not tracks**. If either grows past ~10 pages
it wants promoting, the same way Git did on 2026-09-13 (item 16).

**Verified gaps — these filenames returned NOTHING on a sitewide search:**

- **Angular** — SSR / hydration; i18n; accessibility. (`angular-testing` DOES exist.)
- **AWS** — messaging entirely (SQS / SNS / EventBridge); DynamoDB as its own page; Secrets
  Manager + SSM Parameter Store; CloudFront / Route 53; **App Runner** — which is what this
  very repo deploys on (see "AWS App Runner hardening"), so the platform we use is the one
  we do not teach; Step Functions; ECR.
- **Docker** — volumes / persistence; multi-stage builds and image size; layer caching;
  healthchecks; registries and tagging; rootless / scanning.
- **Maven** — `dependency:tree` and conflict resolution; BOM / `dependencyManagement`;
  `settings.xml`, mirrors and private-repo auth; the wrapper; release / versioning.
- **Shell** — text processing is the whole missing half: `grep` / `sed` / `awk` / `jq`; pipes
  and redirection in depth; exit codes and `set -euo pipefail`; traps and argument parsing;
  **`ssh` / `scp`**; job and process control; permissions; cron and scheduled tasks.
- **IDM** — **SAML**; **SCIM**; **MFA / step-up**; session management and SSO across apps;
  token exchange; PKCE in depth; device flow; CIBA; JML lifecycle; consent; audit. This is
  Bobby's actual day job (CIAM, Ping + Entra) and it is the thinnest relative to its
  importance — 19 pages, of which 9 are Ping product pages.
- **Infrastructure** — observability as a subject (logs / metrics / traces, OpenTelemetry);
  **GitHub Actions** in depth, which is what gates this repo's own Pages deploy; secrets in
  CI; artifact registries; IaC state and drift (only `devops-iac-terraform` exists);
  environment promotion; rollback; load testing; incident response.

**The granularity question, answered as axes rather than a wishlist.** "More detailed" can
mean four different things, and they are not interchangeable:

1. **Split a page that teaches two things.** Cheapest real depth. A page covering both "what
   it is" and "how it fails in production" is two pages.
2. **Add a `-deep` companion.** The pattern the Angular and Spring tracks already use
   (`angular-change-detection` → `angular-change-detection-deep`). 74 Angular pages exist
   largely because this was done consistently; the thin tracks are thin because it wasn't.
3. **Add the missing SUBJECT.** The verified list above. This is where the real gaps are —
   no amount of depth on `aws-s3` produces a page about SQS.
4. **Add the operational layer.** Most tracks teach the happy path. "What it looks like when
   it breaks, and what you type" is a whole missing dimension — and it is the one closest to
   Bobby's job.

**Do this first:** a per-track inventory pass that lists every concept the track SHOULD cover
against what it does, rather than building from the gap list above — that list is what one
search turned up, not a curriculum. `tmp_hfaudit.mjs --track=` ranks the thin pages inside a
track; it cannot see a subject that has no page at all, which is exactly what this item is
about.

**Interaction with item 17 (shapes):** these two touch the same pages. Re-staging a page's
block and deepening its content should happen in ONE visit per page, not two — otherwise the
second pass re-opens every file the first one just closed. Sequence per page: decide the
shape, write/deepen the content, stage it in that shape, gate it.

---

## Done — design-system v2 + press pulse (landed 2026-08-30)

Bobby's second review round ("it should be hip, should be poppin, should be electric"), with a
reference mockup of the Decorator page. Landed: the full shared-system half of backlog #8
(see that item for the class list and conventions), the press-pulse ring replacing the ripple
(backlog #7), and `head-first-decorator-visualizer.html` rebuilt as the reference page —
kicker pill, editorial title, receipt + code-window + chain-chips intro, three short cards
with chip chains instead of code crammed into columns. Browser-verified against the mockup in
dark theme and spot-checked in light.

---

## Done — feedback-pass fixes & foundations (landed 2026-08-29, evening)

Same session as the backlog above; the immediately-fixable parts landed at once:
- **Ripple bug fixed** (Bobby: "huge oblong bubble… pushes other buttons to the side"). Cause:
  14 index/landing pages load `devhub-transitions.js` without `devhub.css`, so the injected
  `.dh-ripple` span had no `position:absolute` and joined normal layout. Fix: the script now
  injects its own critical ripple CSS (id-guarded) and force-sets `position:relative` +
  `overflow:hidden` on the pressed control — self-contained regardless of page stylesheets.
- **Sitewide IDE-style syntax highlighting** — new `frontend/devhub-syntax.js` auto-colorizes
  every static, code-looking `<pre>` (same single-pass tokenizer design as the codewalk widget,
  same token classes as devhub.css's palette + new `.type`). Rolled onto all **231** pages with
  `<pre>` blocks; skips hand-annotated blocks, dynamic inspector panes, widget-owned pres, and
  ASCII diagrams. Opt-out: `<pre data-nohl>`.
- **Head First visual kit** — the `hf-*` component family appended to `devhub.css` (see backlog
  item 1 for the class list), plus a zero-markup sitewide win: `<b>/<strong>` inside intro cards
  (8,000+ tags across ~500 pages) now get an accent-tinted marker-pen sweep automatically.
  Pilots: `abstraction-visualizer.html`, `angular-binding-visualizer.html`, `sorting-visualizer.html`.

---

## Done — "Try It Live" embedded mini-IDE on every core lesson (requested + landed 2026-08-29)

Bobby: "shouldn't it have a coding ide/terminal for all lessons? i think we need to add that."
Landed as **[`frontend/devhub-tryit.js`](../frontend/devhub-tryit.js)** — the exploratory
(ungraded) twin of the Coding-Practice engine, now on **119 lesson pages**: Java track (44 incl.
all 12 Head First design-pattern pages), TypeScript (30), Python (23), DSA (20), JS web
fundamentals (3). Each widget = predict-first prompt → editable Head First-style example → ▶ Run
with real execution (sandboxed-iframe JS, real `typescript` compiler, Pyodide CPython, CheerpJ
WASM `javac` sharing the practice IDE's Cache Storage jar). Output lines stagger in one at a
time (the "learning animations" ask, reaching all 119 pages at once; reduced-motion safe).
Every example verified offline against the real toolchain before insertion. Full architecture +
the Java-8/cooperative-threads constraints: see the `devhub-tryit.js` entry in
[DEVHUB-GUIDE.md](DEVHUB-GUIDE.md).

**Not yet covered (next candidates if Bobby wants the pattern extended):** Node track (hand-rolled
JS minis — no `require`/`fs` in the sandbox, so examples must simulate), Angular track (TS minis —
no Angular runtime, so decorators/DI must be taught by hand-rolling them), Spring Boot track
(plain-Java minis — no Spring on CheerpJ, so the IoC container / proxies would be hand-rolled
mini-implementations, which is arguably the best way to teach them anyway).

---

## Done — sitewide UI animations & transitions (requested + landed 2026-08-29)

Bobby wanted "fancy" motion on the app's own chrome — not the content-visualizer animations that
already exist (step-walk engines, gliding chips, etc. — see `feedback_extreme_visualization_default`
in memory), but the *interaction* layer: button clicks, link hovers/opens, and moving between
pages. Landed as one new shared file pair, reaching all 527 pages through the existing
"one script tag, zero per-page markup" pattern already used for `devhub-notebook.js`:

- **[`frontend/devhub-transitions.js`](../frontend/devhub-transitions.js)** — a pointer-position
  ripple (own `.dh-ripple` span, sized/positioned at the actual click) on every real
  `button`/`.tab`/`[role="button"]`/`.page-link`/`.track-card`/`.tc-dot`; a page fade-out
  before leaving to another DevHub page (`.dh-leaving` on `<html>`, short delay, then navigate).
- **`devhub.css`** — the `:active` press-scale, the ripple keyframe, and the page
  fade-in/fade-out keyframes, all wrapped in `@media (prefers-reduced-motion: no-preference)` so
  the whole feature is inert for anyone with that OS setting.
- Injected the `<script src="devhub-transitions.js">` tag before `</body>` on all 527
  `frontend/*.html` files via a one-off Node script (scratchpad only, not committed).

**The real design question from scoping — resolved:** DevHub is a plain multi-page site (every
page is its own `.html` file via `<a href>`, not a client-side router), and `app.html`'s hub loads
pages into an `#viewer` iframe rather than navigating the top-level document. Went with the manual
intercept-then-fade approach (not the View Transitions API's cross-document mode, to avoid a
double-transition risk stacking with the manual fade in Chromium) — but **only when
`window.top === window.self`**, i.e. only for a real top-level navigation. Inside the hub's
iframe, the fade layer is a deliberate no-op, because several pages already `postMessage` a
`dlh-navigate` event to the parent hub instead of following the link directly (grep `dlh-navigate`
in this repo) — that existing, working pattern must never race a second navigation mechanism.
Ripple has no such guard and fires everywhere, including inside the iframe, since it never
touches navigation.

Verified in a real browser (not just read): ripple confirmed positioned correctly and
self-removing (`devtools` script injection into the hub's live iframe), ctrl+click confirmed to
bypass the fade-intercept entirely (native "open in new tab" preserved), a plain click confirmed
to set `.dh-leaving` and navigate, and the hub's iframe confirmed to report
`window.top !== window.self` so the fade layer never engages there.

---

## Coding Practice Exercises (in-page IDE) — Phase 1 (JS/TS/Python) + Phase 2 (Java) LANDED (2026-08-29)

**The gap:** every existing track teaches *concepts* (visualizers, walkthroughs, quizzes,
flashcards) but nothing grades a learner's own code against test cases the way LeetCode/
HackerRank/Exercism do. The `interview-*-visualizer.html` pages (arrays-strings, linked-lists,
trees, graphs, sorting-searching, hashmaps-sets, stacks-queues, system-design) are conceptual
walkthroughs with step-button state machines — not a code editor, not a test runner, no
pass/fail grading. This was the single biggest "am I job-ready" gap left in the app: reading
about two-pointer technique isn't the same as being handed an empty function and a hidden test
suite and having to make it pass, under a clock.

**What shipped (Phase 1):**
- `devhub-codegrade.js` — new shared grading engine (`DevHubCodeGrade.render(rootEl, bank)`,
  same shape as `devhub-quiz.js`/`devhub-flashcards.js`). Runs real JavaScript and TypeScript
  (sandboxed `<iframe sandbox="allow-scripts">` + `postMessage`, dynamic `import()` of a Blob
  URL, kill-timer for infinite loops, deep-equal + unordered-array comparison) and real Python
  (Pyodide/WASM CPython). No CodeMirror dependency — reused the existing textarea+gutter editor
  pattern from the playground pages instead. Per-exercise hints, difficulty/domain chips, a link
  back to the matching `interview-*-visualizer.html` technique walkthrough, and localStorage
  progress tracking (`dlh-codegrade:<id>`) exactly like quizzes/flashcards. The engine also
  supports "design a data structure" problems (Min Stack, Queue using Stacks) by grading a
  replayed operation log (`ops` + parallel `argsList` → an array of per-op results) instead of a
  single pure function call — no engine changes needed beyond how the exercise bank shapes its
  test cases.
- Nine topics now live, 54 exercises total, all gradable in JS, TS, and Python:
  - `practice-arrays-strings.html` — Two Sum, Contains Duplicate, Valid Anagram, Best Time to
    Buy/Sell Stock, Valid Palindrome, Longest Substring Without Repeating Characters.
  - `practice-stacks-queues.html` — Valid Parentheses, Min Stack (Design), Daily Temperatures,
    Evaluate Reverse Polish Notation, Implement Queue using Stacks, Sliding Window Maximum.
  - `practice-sorting-searching.html` — Binary Search, Merge Two Sorted Arrays, Find Minimum in
    Rotated Sorted Array, Search in Rotated Sorted Array, Kth Largest Element, Merge Intervals.
  - `practice-dynamic-programming.html` — Climbing Stairs, House Robber, Coin Change, Longest
    Increasing Subsequence, Maximum Subarray (Kadane's), Unique Paths (2D grid DP).
  - `practice-linked-lists.html` — Reverse Linked List, Merge Two Sorted Lists, Linked List
    Cycle, Remove Nth Node From End of List, Middle of the Linked List, Add Two Numbers.
  - `practice-trees.html` — Maximum Depth of Binary Tree, Invert Binary Tree, Same Tree,
    Validate Binary Search Tree, Binary Tree Level Order Traversal, Lowest Common Ancestor of
    a BST.
  - `practice-graphs.html` — Number of Islands (grid DFS), Course Schedule (cycle detection),
    Number of Connected Components (Union-Find), Rotting Oranges (multi-source BFS), Graph
    Valid Tree (edge-count + Union-Find), Is Graph Bipartite? (2-coloring BFS). Confirmed no new
    shape adapter was needed — grids/edge-lists/adjacency-lists are already plain arrays/objects.
  - `practice-hashmaps-sets.html` — Top K Frequent Elements (with a stated value-ascending
    tie-break so the grader stays deterministic), First Unique Character in a String, Subarray
    Sum Equals K (prefix-sum + map), Longest Consecutive Sequence (O(n) via Set), Isomorphic
    Strings (bidirectional map), Contains Duplicate II (sliding-window map). No shape adapter
    needed either.
  - `practice-backtracking.html` — Subsets and Combinations (both with a stated "elements stay
    in original input order within each result" convention layered on the engine's `unordered:
    true` per-test flag, since different valid backtracking traversals could otherwise produce
    the same subset/combination with different internal ordering), Permutations and Letter
    Combinations of a Phone Number (safe as-is with `unordered: true` — every valid output is
    already a uniquely fixed sequence), Word Search (single boolean, grid DFS + undo), N-Queens
    (returns the solution *count* only, not the boards, to sidestep canonicalizing equivalent
    layouts). No shape adapter needed.
  - Every exercise's expected test values were independently verified against a reference
    solution in Node before shipping (not just hand-traced), and each new page was smoke-tested
    live in-browser (JS, TS, Python, and the ops-replay/shape-adapter patterns all confirmed
    passing, including a deliberate wrong-answer case to check failure rendering).
- **Solved the Linked Lists node-representation question** (previously flagged as needing a real
  design decision) by adding optional `argShapes`/`resultShape` adapters to `devhub-codegrade.js`.
  An exercise can now declare e.g. `argShapes: ['list']`, `resultShape: 'list'`: the engine
  converts a plain test-data array into a real `{ val, next }` node chain before calling the
  user's function, and converts a returned chain back into a plain array before comparing —
  so exercise data stays plain JSON while the user's own code does real pointer manipulation on
  real node objects, matching the actual interview signature (`function reverseList(head)`, not
  an array-shortcut version). A `'list-with-cycle'` input shape (built from a `{values, pos}`
  spec) supports cycle-detection problems without ever needing to serialize a cyclic structure.
  Per-language node representation was chosen to fit each language's idioms with zero risk of
  the "user code redeclares a class the harness also declares" conflict: JS uses plain
  `{ val, next }` object literals (no class needed — duck typing), TypeScript uses a type-only
  `interface ListNode` in the starter (erased at transpile time, so it can't collide with
  anything), and Python gets a real `class ListNode` in the starter (redefinition is harmless in
  Python, unlike JS's ES-module scoping). The same mechanism now also has a `'tree'` shape
  (LeetCode's standard level-order array with `null` gaps ⇄ a real `{ val, left, right }`
  structure, BFS-built/BFS-serialized, trailing nulls trimmed on output), used by
  `practice-trees.html`. Both round-trip converters were verified against known-correct
  encodings in Node (not just eyeballed) before shipping.
- "Coding Practice (IDE)" track in `tracks-data.js` (9 pages), under the "Practice & Prep"
  sidebar category in `app.html`.
- Deliberately 100% client-side/offline for Phase 1 — the existing server-side sandboxed
  `/api/run/*` execution backend (`ExecutionService.java`, JAVA/TYPESCRIPT/SHELL via
  `Language.java`) was evaluated but intentionally NOT used, to keep this feature dependency-free
  like the rest of the site.

**Phase 2 — Java support, DONE (2026-08-29):** Bobby picked the in-browser WASM-JVM option
(CheerpJ 4.3, CDN loader — same "CDN dependency accepted for real engines" precedent as
Pyodide) over reusing the server-side `/api/run/*` backend, keeping practice pages 100%
client-side. All 54 exercises across the 9 topics now have a **Java** tab: LeetCode-style
`class Solution` starters, real `javac` compile errors (diagnostics surfaced verbatim), a
real JVM run, `ListNode`/`TreeNode` provided by the grader as a separate compilation unit.
Mechanics in `devhub-codegrade.js`: a hidden engine-owned iframe boots CheerpJ; user code →
`/str/Solution.java`; a generated `Harness.java` renders each exercise's JSON test data as
*typed* Java literals (new per-exercise `javaTypes` field) and prints sentinel-marked JSON
results the page grades with the same deep-equal as the other languages; the ~18 MB
compiler jar (pinned to a commit SHA of JavaFiddle's `static/tools.jar`) is fetched once
into Cache Storage; kill-timers destroy the whole JVM iframe on runaway code. Verified two
ways: offline, every exercise's Java reference solution graded 54/54 through the engine's
real harness generator with the local JDK (`frontend/tmp_java_verify.mjs` +
`tmp_java_data.mjs` — re-run after any bank edit); and live in-browser (pass, wrong-answer,
compile-error, list/cycle/tree shapes, Min Stack ops-replay, plus a JS regression run).
One real bug found and fixed during browser verification: byte arrays handed to
`cheerpjAddStringFile` must be constructed with the *iframe's own* `Uint8Array` (see
`frameBytes()`) — a parent-realm array fails CheerpJ's `instanceof` check and gets
stringified, which corrupted the 18 MB jar into 57 MB of comma-separated decimals.

**What's still open / not built:**
- Remaining `interview-*-visualizer.html` topics (System Design, Spring/Angular Q&A,
  Java-specific OOP/Concurrency) aren't natural fits for a graded-function format and would
  need a different exercise shape if ever tackled.
- C#/Go/Rust/PHP/Ruby in the practice IDE remain unbuilt — each needs its own real
  in-browser runtime decision; none should be taken on silently.

**What already exists to build on** (real execution engines, not simulations):
- `python-playground-visualizer.html` — real CPython 3.12 via Pyodide (WASM), stdout captured.
- `typescript-playground-visualizer.html` — the real `typescript` package compiling in-browser
  (actual type errors, actual emitted JS, actually run).
- `shell-playground-visualizer.html` — an in-memory mini-shell (Bash/PowerShell/CMD modes).
- `sql-playground-visualizer.html`, `spring-boot-playground-visualizer.html`, `api-playground-visualizer.html`,
  `jwt-playground-visualizer.html` — topic-scoped sandboxes, worth checking each for reusable
  execution/grading plumbing before writing new engine code.
- None of these are LeetCode-style yet: they're free-form REPLs with preset buttons, not
  "here's a spec + hidden tests + a pass/fail bar."

**How far execution goes (resolved):** JS/TS/Python shipped in Phase 1 with zero new infra;
Java shipped in Phase 2 via CheerpJ (see above). The original phased plan and the
WASM-vs-backend tradeoff writeup are in git history; the standing rule that survives them:
any further compiled language (C#/Go/Rust/PHP/Ruby) is its own runtime decision — surface it
to Bobby explicitly before building.

---

## Done — audit (not built) — sitewide depth audit against "zero to hired" goal (completed 2026-08-27)

**Verdict: the full-stack-lifecycle bar is met better than expected in most named categories —
API design/REST, CI/CD & IaC, testing-per-language, and system design are all genuinely deep —
but there are a handful of real, specific holes, plus two categories (general web-app security,
NoSQL) that are close to zero coverage rather than just thin.** This is an audit only — nothing
below is built yet. Checked via `docs/DEVHUB-GUIDE.md` + a sitewide filename/content grep across
`frontend/*.html` against the actual `TRACKS` array in `frontend/app.html` (not just doc counts).

**What's already solid (don't re-audit, just confirmed present):** `spring-boot-testing-visualizer.html`
already teaches the full test pyramid (unit/Mockito → slice `@WebMvcTest`/`@DataJpaTest` →
integration `@SpringBootTest`+Testcontainers, with the classic 70/20/10 ratio) plus per-language
unit testing (`angular-testing`, `angular-vitest`, `go-testing`, `python-pytest`, `react-testing`).
`system-design-visualizer.html` (724 lines) already covers load balancers (algorithms/health
checks/L4 vs L7), caching (cache-aside/write-through/write-behind/eviction), sharding &
replication, consistent hashing, CAP theorem, message queues (Kafka/RabbitMQ/SQS), rate limiting,
CDNs, and monolith-vs-microservices — this is genuinely elite-CS-program depth already.
`spring-boot-api-design-deep-visualizer.html` covers idempotency + URL versioning;
`spring-boot-rate-limiting-deep-visualizer.html` and `spring-boot-openapi-visualizer.html` exist
separately. `spring-boot-observability-deep-visualizer.html` covers the three pillars, Micrometer
meter types, Prometheus/PromQL, and distributed tracing (TraceId/SpanId, B3 vs W3C headers,
sampling) — deep, though Spring/Java-flavored rather than vendor-neutral. `spring-boot-flyway-visualizer.html`
teaches schema migration tooling as a concept even though this app's own backend deliberately
doesn't use Flyway (see the scaffold recipe) — that's correctly treated as a "what to teach"
decision separate from "what this app uses."

**Real gaps found, in priority order:**

~~1. Web application security fundamentals — XSS, SQL injection, OWASP Top 10.~~ **DONE
(2026-08-28):** built `appsec-injection-xss-visualizer.html` (reflected/stored/DOM-based XSS +
SQL injection, string concat vs `NamedParameterJdbcTemplate`) and
`appsec-owasp-top10-visualizer.html` (all 10 categories, 5 with a full animated deep-dive),
registered under 🔐 Identity & Auth's new "Web App Security" section.

~~2. No dedicated e2e testing page (Playwright/Cypress).~~ **DONE (2026-08-28):** built
`angular-e2e-playwright-visualizer.html` (Page Object Model, brittle selectors vs auto-waiting,
network mocking, trace-viewer debugging, CI sharding), registered under Angular's Testing section
and cross-linked from `angular-testing-visualizer.html`.

~~3. NoSQL is effectively untaught as its own topic.~~ **DONE (2026-08-28):** built
`nosql-redis-visualizer.html` (data structures, cache-aside with `RedisTemplate`, TTL/eviction,
atomic `INCR` rate-limiting, pub/sub) and `nosql-document-wide-column-visualizer.html` (MongoDB
embedding vs referencing, DynamoDB partition-key hot-spotting, eventual vs strong consistency,
GSIs), both registered in a new "NoSQL" section under the SQL & Databases track and cross-linked
from `spring-boot-caching-visualizer.html` and `system-design-visualizer.html`.

~~4. GraphQL has no dedicated page.~~ **DONE (2026-08-28):** built
`spring-boot-graphql-visualizer.html` (over/under-fetching solved by client-specified shape, the
N+1 resolver trap fixed with Spring's `@BatchMapping`, and a field-level authorization gap as the
CIAM security angle), registered under Spring Boot's APIs & Communication section and cross-linked
from `spring-boot-rest-api-visualizer.html` and `spring-boot-api-design-deep-visualizer.html`.

~~1. Deployment strategy concepts (blue-green, canary, feature flags, GitOps) aren't taught.~~
**DONE (2026-08-28):** built `devops-deployment-strategies-visualizer.html` (blue-green's instant
router-flip rollback, canary with an automated metrics-gated abort, feature flags decoupling
deploy from release, and GitOps' git-as-source-of-truth reconciliation loop, all contrasted
against the rolling-deployment baseline already covered on the Kubernetes/ECS pages), registered
under the ♾️ DevOps & CI/CD track's Delivery section.

~~2. No general, learner-facing "how do you deploy a web app to production" conceptual page.~~
**DONE (2026-08-28):** built `production-deployment-visualizer.html`, a capstone (in the spirit of
`fullstack-request-roundtrip-deep-visualizer.html`) walking 5 real paths end to end — a Spring Boot
API to Kubernetes, an Angular SPA to a CDN with no server at all, an event-driven function to
Lambda, a monolith to a PaaS, and a production incident ending in rollback — tying together the
CI/CD, Docker, Kubernetes/cloud, and Deployment Strategies pages instead of adding more fragmented
content. Registered under Full-Stack Stacks' Putting It Together section.

~~3. gRPC is Go-only.~~ **DONE (2026-08-28):** built `spring-boot-grpc-visualizer.html` (the
`.proto` contract-as-code, all four RPC shapes — unary/server-stream/client-stream/bidi-stream —
and a metadata-based JWT auth interceptor as the CIAM angle, contrasted against REST and GraphQL),
registered under Spring Boot's APIs & Communication section and cross-linked from
`go-grpc-visualizer.html`.

~~1. GCP has zero coverage (AWS: 16 pages, Azure: 7 pages, GCP: 0).~~ **DONE (2026-08-28):** built
the full 🟢 Cloud — GCP track (7 pages: `gcp-overview-visualizer.html` — projects, resource
hierarchy & IAM; `gcp-compute-engine-visualizer.html` — instance templates & MIGs; `gcp-gke-visualizer.html`;
`gcp-serverless-visualizer.html` — Cloud Run & Functions; `gcp-storage-visualizer.html`;
`gcp-databases-visualizer.html` — Cloud SQL/Firestore/BigQuery; `gcp-iam-secrets-visualizer.html` —
service account impersonation, Secret Manager & Workload Identity Federation), registered in
`tracks-data.js` mirroring the Azure track's exact section shape (Foundations×1, Compute×3,
Data & Storage×2, Security×1). Also added `exam-gcp-ace.html` (28-question Associate Cloud Engineer
practice exam, length-bracketed per the quality standard — 7/7/7/7 answer-position distribution,
0/28 "longest choice is correct" bias), `flashcards-gcp.html` (30-card deck), and a GCP capstone
entry in `learning-paths.html`, all registered in `quiz-banks.js` / `tracks-data.js`.

**Longer-term expansion — "zero to hero" gap closure, DONE (2026-08-28):** grow beyond software
development into every IT field — AI, Data Science, Software Dev, DevOps, and whatever else — per
Bobby's "zero to hero / zero to full-stack / zero to data or AI dev" directive. Three new tracks
built and fully registered (pages, exam, flashcard deck, learning path):

- **🌐 Web Fundamentals** (7 pages) — the true zero-starting-point before Angular/React/TypeScript:
  HTML structure/forms/a11y, CSS box model/specificity, Flexbox & Grid, JS fundamentals/closures,
  the DOM & events, async JS (Promises/async-await/fetch), and how browsers actually render a page.
  `exam-web-fundamentals.html` (26 Q), `flashcards-web-fundamentals.html` (26 cards).
- **📊 Data Science & ML** (9 pages) — NumPy/pandas, data cleaning & EDA, visualization, ML
  fundamentals (bias-variance), regression/classification, model evaluation, clustering/PCA, and
  neural networks/PyTorch. `exam-data-science.html` (30 Q, quality-audited via
  `tmp_examtell_audit.mjs` — first draft failed on answer-length bias, fixed and re-audited clean),
  `flashcards-data-science.html` (30 cards).
- **🧠 AI / LLM Engineering** (9 pages) — transformers & attention, how LLMs work (tokenization/
  sampling), prompt engineering, embeddings & vector databases, RAG, tool-calling agents, LLM API
  integration, fine-tuning vs RAG vs prompting & LLMOps, and AI safety/guardrails (prompt injection,
  jailbreaks, PII handling — treated with the same rigor as `appsec-injection-xss-visualizer.html`).
  `exam-ai-engineering.html` (28 Q, quality-audited via `tmp_examtell_audit.mjs` — first draft
  failed badly, correct answer was the longest choice in 89% of questions; rewrote choice text
  across nearly every question and re-audited clean), `flashcards-ai-engineering.html` (28 cards).

All three registered in `tracks-data.js`, `app.html`'s `CATEGORIES` (new "Data & AI" group),
`devhub.css` (theme accents), `quiz-banks.js`, and `learning-paths.html`. Site now stands at
**498 pages / 33 tracks / 19 exams (560 Q) / 16 flashcard decks (459 cards) / 19 learning paths**.
Certs remain scoped to **entry-level only** — mid/senior-level certs are an explicitly later phase.

**Next up:** ~~a sitewide cleanup/depth-audit pass on existing shallow content~~ — done, see
"Done — sitewide depth-audit sweep #2" below. ~~The previously-queued AWS deployment boilerplate
work~~ — also done, see "Done — AWS App Runner hardening" below.

---

## Done — AWS App Runner hardening (completed 2026-08-29)

Bobby shared an AWS Deployment Playbook PDF (ECS Fargate + ALB + CloudFront + Secrets Manager +
Aiven MySQL) for the queued "AWS deployment boilerplate work" backlog item. Investigation found
this repo already had a **working, different, lighter AWS path** — `deploy/aws/apprunner.json` +
`deploy/aws/deploy.sh` (App Runner, built 2026-06-15), documented in `docs/DEPLOYMENT.md` §3b
alongside Render and Azure Container Apps, with its own CI/CD workflow
(`.github/workflows/deploy-backend-aws.yml`). Asked Bobby whether to replace it with the heavier
ECS/ALB/CloudFront shape or harden the existing App Runner path against the playbook's gotcha
catalog — **chose hardening**, no architecture change.

Closed the real gap: `apprunner.json` had `DATABASE_PASSWORD` and `JWT_SECRET` as **plaintext**
`RuntimeEnvironmentVariables` — the same class of mistake the playbook's #1 gotcha warns about.
Fixed:
- New [`deploy/aws/secrets-setup.sh`](../deploy/aws/secrets-setup.sh) — creates
  `devhub-backend/jwt-secret` (real random value immediately) and `devhub-backend/db-password`
  (CHANGE_ME placeholder) in Secrets Manager.
- `apprunner.json` — those two moved to `RuntimeEnvironmentSecrets` (ARN references); added the
  previously-missing `InstanceConfiguration.InstanceRoleArn` (App Runner's instance role is
  separate from the ECR access role and needs `secretsmanager:GetSecretValue`, or the task loops
  with AccessDenied on boot — same shape as the playbook's ECS execution-role gotcha).
- `deploy.sh` — now creates `AppRunnerDevHubInstanceRole` if missing (idempotent), resolves both
  secret ARNs via `describe-secret` (never hand-built), and writes a git-ignored
  `apprunner.generated.json` with account ID/image/role/ARNs already filled in, so
  `create-service` needs no manual JSON surgery.
- `docs/DEPLOYMENT.md` §3b — rewritten for the secrets-based flow; added `cli_pager ""` setup note,
  a log-retention step (App Runner's log group defaults to Never Expire), and a troubleshooting row
  for the AccessDenied failure mode.
- `.gitignore` — excluded `deploy/aws/apprunner.generated.json` (carries a real account ID + ARNs).

No billable AWS commands were run — this was drafting/hardening scripts and docs only, per the
standing rule that actually provisioning (creating the IAM role, the secrets, the App Runner
service) requires Bobby to run those commands himself.

---

## Done — sitewide depth-audit sweep #2: Playground intro cards (completed 2026-08-29)

Bobby asked to do the queued sitewide sweep before the AWS boilerplate work ("let's do both of
those in that order"). A background audit pass checked every conceptual/interactive page for the
standing "plain-English intro card before the interactive part" requirement (see
`docs/DEVHUB-GUIDE.md` conventions). Findings, independently re-verified file-by-file (the raw
audit's blanket claim was one file off — `auth-identity-live-visualizer.html` already had an
intro-equivalent, just in the old pre-`.intro`-class wrapper style):

- **6 pages got a brand-new `.intro` card** (modern `.intro-head`/`.intro-lead`/`.intro-gist`/
  `.intro-cards`/`.intro-ciam` format, matching `sql-playground-visualizer.html`'s template):
  `api-playground-visualizer.html`, `jwt-playground-visualizer.html`,
  `python-playground-visualizer.html`, `shell-playground-visualizer.html`,
  `spring-boot-playground-visualizer.html`, `typescript-playground-visualizer.html`.
- **1 page had its old-style card converted**, not duplicated: `auth-identity-live-visualizer.html`
  (`<div class="card card-accent"><h3>What is this…</h3>` → the modern `.intro` structure,
  same content).
- A second, lower-confidence finding from the same audit (5 debugging mini-pages lacking an
  animated step-walk engine) was left alone — the audit itself flagged it as "likely intentional
  design, awareness only," consistent with the site's precedent of not retrofitting pages that
  already use a different-but-legitimate interaction style.

This closes the sitewide depth-audit backlog item. Verified via div-tag balance + single-`.intro`
count across all 7 files.

---

## Done — Database/AWS/DSA depth pass (started 2026-08-20, completed 2026-08-21)

Bobby asked to "solidify the concepts for database and aws/infrastructure... and make sure
data structures and algorithms are also sound/solid." An audit of all three tracks found content
gaps; all 10 pages below are now built, registered in `TRACKS`, and counted in `README.md` +
`DEVHUB-GUIDE.md` (453 pages / 29 tracks):
- `sql-replication-visualizer.html`, `sql-partitioning-visualizer.html` — SQL & Databases,
  Advanced section.
- `aws-api-gateway-visualizer.html`, `aws-load-balancing-visualizer.html` — Cloud — AWS, AWS
  section.
- `aws-compute-decision-visualizer.html`, `aws-storage-deep-visualizer.html`,
  `aws-iac-visualizer.html`, `aws-cost-visualizer.html` — Cloud — AWS, new "Architecture &
  Operations" section.
- `ds-two-pointer-sliding-window-visualizer.html`, `ds-backtracking-visualizer.html` — Data
  Structures & Algorithms, Algorithms section (backtracking is cross-linked from
  `recursion-visualizer.html`).

**Lower-priority backlog from the same audit** (content is fine, this is a polish/consistency
pass, not a content gap; scope expanded 2026-08-21 after the sitewide depth spot-check below
found this reaches well past AWS and DS&A):
- ~~Retrofit the animated `rt-ctlbar`/`rt-stage` scenario-walk + live-inspector pattern onto the
  AWS pages~~ — **DONE, 15/15 (2026-08-27).** `aws-vpc-visualizer.html` (was the worst offender —
  zero interactivity before this), `aws-ec2-visualizer.html`, `aws-ecs-visualizer.html`,
  `aws-s3-visualizer.html`, `aws-iam-visualizer.html`, `aws-lambda-visualizer.html`,
  `aws-rds-visualizer.html`, `aws-cloudwatch-visualizer.html`, `aws-overview-visualizer.html` all
  finished this pass, joining the 6 pages the earlier depth pass already covered
  (`aws-api-gateway-visualizer.html`, `aws-load-balancing-visualizer.html`,
  `aws-compute-decision-visualizer.html`, `aws-storage-deep-visualizer.html`,
  `aws-iac-visualizer.html`, `aws-cost-visualizer.html`). Every AWS page now has the full
  scenario-walk + live-inspector treatment — nothing left to retrofit in this track.
- ~~Same retrofit for the Data Structures & Algorithms pages still on the older SVG/canvas-driven
  interaction style~~ — **DONE, 20/20 (2026-08-27).** `graph-visualizer.html`,
  `linked-list-visualizer.html`, `big-o-visualizer.html` (plus `sorting-visualizer.html`,
  `ds-two-pointer-sliding-window-visualizer.html`, `ds-backtracking-visualizer.html` already had
  it) finished the earlier pass; this pass added `bst-visualizer.html`,
  `stack-queue-visualizer.html`, `hashmap-visualizer.html`, `searching-visualizer.html`,
  `recursion-visualizer.html`, `ds-dynamic-programming-visualizer.html`,
  `ds-arrays-visualizer.html`, `ds-linked-lists-visualizer.html`, `ds-trees-visualizer.html`,
  `ds-hash-tables-visualizer.html`, `ds-heaps-visualizer.html`, `ds-tries-visualizer.html`,
  `ds-graphs-advanced-visualizer.html`, and `ds-disjoint-sets-visualizer.html`. Every DS&A page now
  has the full scenario-walk + live-inspector treatment — nothing left to retrofit in this track.
~~`exam-sql.html` doesn't test anything from `sql-postgres-visualizer.html`/replication/
partitioning~~ — **DONE (2026-08-28).** Added a PostgreSQL Internals & Scale domain (JSONB,
VACUUM/MVCC, PgBouncer connection pooling, async/sync replication failover risk, partition
pruning, shard-key selection) — 24 Q → 30 Q, registered in `quiz-banks.js`.

~~`exam-aws-developer.html` mislabels its domains against the real DVA-C02 exam guide~~ —
**DONE (2026-08-28).** Relabeled into the exam guide's real four domains (Development with AWS
Services, Security, Deployment, Troubleshooting and Optimization) and added DynamoDB, API
Gateway, CloudFormation/CDK, deployment-strategy, Lambda Layers, and cost-optimization questions
to fill the previously-empty Deployment and Troubleshooting domains — 24 Q → 40 Q, registered in
`quiz-banks.js`.

~~`flashcards-bigo.html` has no cards for two-pointer/sliding-window or backtracking~~ — **DONE
(2026-08-28).** Added 5 cards covering converging two pointers, variable/fixed sliding windows,
3Sum, and backtracking's pruned-but-still-exponential complexity.

---

## Done — sitewide `rt-ctlbar` retrofit: Java/Interview/Config/Docker/Git/Maven/TypeScript/Spring Boot (completed 2026-08-22)

Closed out the "sitewide `rt-ctlbar` coverage by track prefix" backlog item from the depth-pass
audit below. Every track it flagged as 0% or partial is now at full `rt-ctlbar`/`rt-stage`
scenario-walk + live-inspector coverage (of pages with `intro-head`, i.e. excluding
quiz/flashcard/index pages): Java **18/18**, Interview/DSA-prep **13/13**, Config **11/11**,
Docker **6/6**, Git **5/5** (`git-index.html` correctly excluded, it's a track-landing page not a
concept page), Maven **5/5**, TypeScript **30/30**, Spring Boot **51/51**.

Also fixed a duplicate-DOM-id bug class introduced while retrofitting pages that already had an
older, bespoke, hand-built animated widget predating the `rt-ctlbar` convention: the new hero
markup and the legacy widget used the same short id prefix, so `getElementById` silently bound to
whichever came first in the DOM and broke the other. Fixed by giving the new hero an `x`-suffixed
prefix (`rt`→`rtx`, `dc`→`dcx`, `fn`→`fnx`, `ms`→`msx`, `tg`→`tgx`) on
`spring-boot-refresh-token-rotation-deep-visualizer.html`,
`typescript-decorators-visualizer.html`, `typescript-functions-visualizer.html`,
`typescript-maps-sets-visualizer.html`, and `typescript-type-guards-visualizer.html`, leaving each
page's pre-existing widget untouched. Verified sitewide with a full duplicate-id sweep (no `id="…"`
value repeats anywhere in the diff) and a JS-syntax sweep (every inline `<script>` block parses
clean via `new Function()`) before committing.

AWS (15/15, done 2026-08-27) and Data Structures & Algorithms (20/20, done 2026-08-27) retrofits
have since closed out — see the backlog item above; they were always tracked separately since
they're a bigger lift (older SVG/canvas-driven pages, not just a missing hero widget).

---

## Done — Debugging track: "Debug Like a Pro" toolbox page (requested 2026-08-20, completed 2026-08-21)

Built `frontend/debugging-pro-toolbox-visualizer.html` and registered it under the Debugging
track's "Technique & Stack Traces" section in `frontend/app.html`, alongside
`debugging-method-visualizer.html`. Covers the professional toolbox the existing three Debugging
pages didn't: `git bisect` as a CLI workflow, conditional breakpoints/watch expressions,
logpoints, correlation-ID/structured logging tied to this codebase's Angular → Spring filter
chain → JDBC request flow, and thread/heap dumps for hangs vs. leaks. Explicitly cross-links to
(rather than re-teaches) `debugging-method-visualizer.html` and
`debugging-logging-vs-stepping-visualizer.html`. Ships the full "extreme visualization" standard:
intro card, a 4-scenario animated `rt-ctlbar`/`rt-stage` walk (git bisect narrowing 50 commits →
conditional breakpoint on iteration 47 → logpoint threading a correlation ID across 3 layers →
thread dump revealing a deadlock), an axis-comparison table, and a `DevHubCodeWalk` line-by-line
walkthrough of a `CorrelationIdFilter`. Page/track counts updated in `README.md` and
`docs/DEVHUB-GUIDE.md` (454 pages / 29 tracks).

---

## Done — Exam quality pass #2: why[] coverage (requested 2026-08-20, completed 2026-08-21)

Bobby's original complaint ("I just picked the choice with the longest amount of text") drove an
earlier fix pass — the length-bracket + plausible-distractor technique documented in
[[project_exam_quality_standard]] and `frontend/tmp_examtell_audit.mjs`. A follow-up audit found
it was only partially applied (5 of 15 banks passing) and that WHY COVERAGE (a per-option `why[]`
shown after answering and in the post-exam review — already fully supported by
`frontend/devhub-quiz.js`, so this was pure content work, zero engine work) was missing on 87% of
all questions across every bank.

All 15 banks now pass `node tmp_examtell_audit.mjs` (run from `frontend/`) clean — 426 questions,
0 egregious flags, no length/position/why-coverage tells anywhere. Re-run that script after any
future edits to an exam bank's `choices`/`answer`/`why` fields to confirm it stays clean.

---

## Done — spot-check "every concept needs 10x more depth" beyond Angular (completed 2026-08-21)

**Verdict: resolved sitewide, not just Angular — closing this out.** Followed up the earlier
Angular-only spot-check (`angular-signals-visualizer.html`,
`angular-directives-visualizer.html`, `angular-pipes-visualizer.html`) with a sitewide grep audit
(intro-card + `DevHubCodeWalk` + `rt-ctlbar` presence per track prefix, ~424 pages) plus a full
read of one page each in Python, Java, and DSA-interview, tracks Bobby never named specifically.

- **Content depth (intro card: lead paragraph + gist bullets + 3 code-example mini-cards + a
  CIAM/job-relevance callout, and a `DevHubCodeWalk` line-by-line walkthrough) is present on
  essentially every conceptual page sitewide** — 90–100% coverage in every track checked
  (Spring Boot, Python, AWS, Docker, Kubernetes, SQL, Go, TypeScript, React, Java, Git, Node,
  Interview/DSA, Config, Maven; only the `exam-*`/`flashcards-*` quiz/drill pages lack them,
  which is correct — they're drills, not concept pages). Read in full:
  `python-fundamentals-visualizer.html` (374 lines — CPython bytecode pipeline, LEGB, refcounting,
  a 5-step `DevHubCodeWalk` with a CIAM callout on JWT-parsing gotchas) and
  `java-records-sealed-visualizer.html` (871 lines — 8 tabs: records, compact constructors,
  sealed hierarchies, exhaustive pattern matching, a click-through hierarchy explorer). Neither
  reads as a thin one-pager; the earlier "10x more depth" complaint doesn't hold sitewide either.
- **What genuinely isn't sitewide is the newer `rt-ctlbar`/`rt-stage` animated scenario-walk +
  live-inspector engine** (the pattern used on Angular and on the new
  `debugging-pro-toolbox-visualizer.html`). Coverage by track: Java 0/18, Interview 0/14,
  Config 0/11, Docker 0/7, Git 0/6, Maven 0/6, DS&A 2/12, AWS 6/16, TypeScript 10/32, Spring Boot
  28/53 — vs. Angular, React, Go, Kubernetes, and Head First Patterns at ~100%. **This is not a
  content gap** — the pages missing it use an older-but-still-real interaction style instead
  (`java-records-sealed-visualizer.html`'s 8-tab click-through demos; `interview-*`'s per-technique
  step-button state machines for two-pointer/sliding-window/prefix-sum/hashmap). It's the same
  "predates the newer interaction pattern" situation already logged for AWS and DS&A below — this
  audit just found it's far more widespread than those two tracks. Folded into that backlog item
  rather than opening a separate one. (Historical snapshot as of 2026-08-21 — AWS and DS&A have
  since both closed to 100%, see the "Done — sitewide `rt-ctlbar` retrofit" entries above.)
