# Head First block SHAPES — the variety contract

A lesson's Head First block has a **shape**: which device leads, which devices appear at all,
and what the block looks like as a silhouette when you scroll past it without reading.

There are eleven shapes. Every block declares which one it is, and `frontend/tmp_variety.mjs`
fails the build when one shape takes over.

> **Read this before `docs/HEADFIRST-BLOCK-RECIPE.md`.** The recipe is the markup contract —
> the verbatim HTML for every `hf-*` device. This file decides *which* of those devices your
> page gets. The recipe used to open with "Your block, in this order:" and one order; that
> sentence is why 474 pages shipped identical, and it is gone.

---

## How a shape is declared

The block's first element carries the slug:

```html
<p class="hf-deck" data-shape="receipt">or, the one-line subtitle</p>
```

`data-shape` is layout-neutral — it styles nothing. It exists so the shape is a **fact the
build can check** instead of an impression someone has while scrolling. `tmp_variety.mjs`
reads it, verifies the block actually contains that shape's required devices and none of its
forbidden ones, and reports the distribution.

A block with no `data-shape` is reported as `unshaped`, not as an error — that is the state
of every page not yet re-staged.

---

## Why sameness is a bug, not a taste

Head First's whole method is that a spread does not look like the last spread. When every
page opens with a subtitle, a kicker, a bad card, a good card, a ladder, a text-message
dialogue, a napkin and a terms grid **in that order**, the learner's eye stops arriving.
The devices still work individually; the *surprise* is gone, and surprise is what the book
is actually engineered to produce.

The measured state of the site before this contract existed:

| device | pages | | device | pages |
|---|---|---|---|---|
| `hf-deck` | 475 | | `hf-qa` | 2 |
| `hf-say` | 474 | | `hf-chain` | 2 |
| `hf-check` | 474 | | `hf-receipt` | 2 |
| `hf-talk` | 466 | | `hf-hand` | 3 |
| `hf-annot` | 462 | | `hf-vs` | 4 |
| `hf-napkin` / `hf-terms` | 458 | | `hf-brain` | 10 |

Eight devices on effectively every page; six on almost none. Those 2s and 3s **are** the
four-shape pilot — before it, they were zero.

---

## Choosing a shape

**Match the shape to the KIND of gotcha, never to the topic.** "It's a Spring page so it gets
the Argument" is exactly the reasoning that produces 474 identical pages one rung up the
ladder. Two Redis pages can legitimately take different shapes, and two pages from opposite
tracks can legitimately take the same one.

Work in this order:

1. **Read the block that is already on the page** and write down, in one sentence, *what the
   learner gets wrong*. Not what the page covers — what the reader believes, or fails to
   predict, that the block corrects.
2. **Find that sentence in the trigger column below.** Most sentences land on exactly one.
3. **If two fit, pick the one that is rarer in the page's track** (`tmp_variety.mjs --track=`
   prints the current distribution). A tie broken toward variety is free; a tie broken toward
   habit is how this went wrong the first time.
4. **If nothing fits, the block is probably a Tour and should stay one.** That is a real
   answer. See the last section.

---

## The eleven shapes

Every entry: the trigger, the silhouette, the devices that MUST appear, and the devices that
must NOT. The "must not" list is the load-bearing half — it is what stops a shape from
quietly re-growing into a Tour with a different hat.

### `tour` — The Tour
> **Trigger:** the gotcha genuinely has all four of a wrong way, a right way, an ordered
> procedure, and **a shape that recurs elsewhere in software** worth three worked parallels.
> This is rarer than 474 pages.

> `hf-terms` is **not a glossary** — it is the "Where you have seen this before" grid of
> `hf-card hf-taped` parallels. An earlier draft of this file called it vocabulary and built
> the `tour` trigger on that; wrong, and worth recording, because the trigger it produced
> would have sent every jargon-heavy page here.

**Silhouette:** subtitle → kicker → bad card → good card → ladder → dialogue → napkin → terms.
One of everything.
**Must have:** both verdict cards (`hf-card bad` + `hf-card good`) + `hf-ladder` + `hf-terms`.
**Must not:** nothing — it is the superset. Which is the problem: it is *always* an available
answer, so it needs the highest bar, not the lowest.

**Built:** `debugging-jwt` — declared, not rewritten. Its block already had a real wrong way, a
real right way, a real ordered procedure and three real parallels, which is the whole test. It
is here as the worked example of the "Leaving a page alone" verdict below.

> **A note on `hf-card`, because the gate got this wrong once.** A bare
> `<div class="hf-card">` is only a frame — the Whiteboard puts its figure in one, and that
> is fine. What marks a block as a Tour is the **verdict pair**: `hf-card bad` and
> `hf-card good`, each with an `hf-cardtitle`, arguing a wrong way against a right way. The
> "must not" lists below forbid *that*, never the container. `tmp_variety.mjs` calls it
> `hf-verdict`.

### `questions` — There Are No Dumb Questions
> **Trigger:** a **misconception**. The learner believes something reasonable that is false.

**Silhouette:** one giant sentence, then a Q&A sidebar that carries the entire lesson.
**Must have:** `hf-big` + `hf-qa` with **5–7** `dt`/`dd` pairs, escalating from naive to the
question an experienced engineer asks.
**Must not:** the verdict pair, `hf-talk`, `hf-napkin`, `hf-terms`, `hf-ladder`.
**Built:** `spring-boot-bean-lifecycle`, `typescript-generics`.

### `receipt` — The Receipt
> **Trigger:** the gotcha has a **cost** — queries, milliseconds, dollars, re-renders,
> allocations, bytes.

**Silhouette:** numbers first. An itemised bill, a brutal two-column contrast, a pipeline
chain, a handwritten arrow at the row that hurts.
**Must have:** `hf-receipt` (3–5 `.row` + one `.row.total`) + `hf-vs` + `hf-arrow`.
**Must not:** `hf-cardtitle`, `hf-talk`, `hf-terms`.
**Numbers must be real or explicitly marked as a worked example** ("on a 200-row page").
Never present an invented figure as measured.
**Built:** `aws-cost`, `react-performance`.

### `whiteboard` — The Whiteboard
> **Trigger:** the gotcha is **structural** — an order of operations, a containment, a handoff
> between parties. A diagram *we draw* explains it better than any paragraph.

**Silhouette:** mostly picture. One big figure, hand-annotated, prose serving the figure.
**Must have:** one of `hf-one`/`hf-nest`/`hf-cycle`/`hf-slot`/`hf-cast` + `hf-hand` +
`hf-brain` asked **before** the figure (predict-then-reveal, answerable from the figure).
**Must not:** `hf-talk`, `hf-napkin`, `hf-terms`, the verdict pair. A bare `hf-card` as the
figure's frame is fine and expected.
**Built:** `entra-oauth-oidc`, `ds-hash-tables`.

### `argument` — The Argument
> **Trigger:** two parties each behave **correctly** and the bug lives in the gap between them.

**Silhouette:** an argument between personified components that carries the whole explanation.
**Must have:** `hf-talk` with **8–10** `hf-bub`, alternating sides, 2–3 named voices (the
components themselves — "Redis", "Worker B", "The Change Detector") plus "You". It escalates
and it resolves; it is not the four-bubble pleasantry the old recipe used.
**Must not:** the verdict pair, `hf-ladder`, `hf-terms`, `hf-napkin`.
**Built:** `nosql-redis`, `angular-change-detection`.

### `exhibit` — Exhibit A
> **Trigger:** the bug is **visible in one real artifact** you can stare at — a JWT, a config
> file, an `EXPLAIN` plan, a response header block, a `package.json`, a stack frame.

**Silhouette:** the artifact, large, with annotations pointing into it. Almost no body prose.
**Distinct from `whiteboard`:** that one annotates a diagram we invented; this one annotates a
real thing the learner will actually see on their screen.
**Must have:** a `<pre>` or `hf-annot` artifact + **3+** `hf-arrow` pointing into it +
`hf-mark` on the one token that matters.
**Must not:** `hf-talk`, the verdict pair, `hf-terms`, `hf-ladder`.
**Built:** `debugging-stack-traces` — the artifact is two log entries for the same exception,
one with forty frames and one with none (`-XX:+OmitStackTraceInFastThrow`).

### `assembly` — The Assembly Line
> **Trigger:** a **pipeline where one stage lies** — middleware order, a build chain, a request
> lifecycle, a CI pipeline, an interceptor stack.

**Silhouette:** a horizontal chain across the top, then the stages in order, with one stage
called out as the liar.
**Must have:** `hf-chain` + `hf-steps` + `hf-mark` on the offending stage.
**Must not:** `hf-talk`, `hf-qa`, `hf-receipt`.
**Built:** `spring-boot-security-filter-chain-deep` — station four (`matches()`, first yes wins)
is the liar: it reads like routing and it is the whole decision.

### `timelapse` — The Time-Lapse
> **Trigger:** the gotcha is about **time** — a TTL, a race, a retry, a GC pause, a lifecycle,
> a cache window, an expiry. Something is true at T0 and false at T1 and nobody looked.

**Silhouette:** a clock face or cycle, then a ladder whose rungs are timestamps.
**Must have:** `hf-cycle` + `hf-ladder` whose every rung is a time, not a step number.
**Must not:** `hf-terms`, `hf-napkin`, `hf-qa`.
**Built:** `java-datetime` — five rungs from 23:41:02 to 09:14, same jar, same line, two
different answers. `debugging-jwt` was the obvious candidate by gotcha (09:05 → 09:35) and was
left as a `tour` instead, because its existing block earns that and re-staging it would have
deleted three good parallels to gain a silhouette.

### `twodoors` — Two Doors
> **Trigger:** not a bug at all — a **choice with two defensible answers**. Sync vs async, JWT
> vs session, SQL vs document, SSR vs CSR, monolith vs services.

**Silhouette:** one full-bleed two-column contrast and nothing else competing with it. The
page refuses to pretend one side is simply wrong.
**Must have:** `hf-vs` + `principle` naming the condition that decides it.
**Must not:** the verdict pair (that framing presumes a wrong side), `hf-receipt`,
`hf-talk`.
**The one rule:** if you find yourself writing the ❌ side as stupid, this is not a `twodoors`
— it is a `tour` and you picked wrong.
**Use `.hf-vs > .door`, not `.bad`/`.good`.** The original `hf-vs` children stamp ❌ and ✅ via
`::before`, which pre-judges the choice this shape exists to refuse. `.door` (added to
`devhub.css` for this shape) is the same grid with two accent tints and a `Door 1 ·` / `Door 2 ·`
counter instead of a verdict glyph, with a cream repair alongside the existing `.bad`/`.good`
one. `tmp_variety.mjs` only sees the `hf-vs` container, so it cannot catch this — check it.
**Built:** `spring-boot-microservices` — relay the caller's JWT, or request a Client Credentials
token. The deciding condition, named in the `principle`: on whose authority is this call made?

### `mnemonic` — The Mnemonic
> **Trigger:** the payload is a **rule to memorise** — operator precedence, HTTP verb
> semantics, Big-O of the common operations, HTTP status classes, CAP.

**Silhouette:** almost nothing but the hook. A giant phrase, a principle, and sticky notes.
**Must have:** `hf-big` + `principle` + **2+** `hf-note`.
**Must not:** the verdict pair, `hf-talk`, `hf-receipt`, `hf-ladder`.
**Bar:** if the mnemonic is not actually memorable, this shape fails — a forgettable
catchphrase in 32px type is worse than a plain sentence.
**And it has to actually be big.** Sitewide, `.hf-big` is `clamp(19px,2.6vw,27px)` and `.hf-say`
is `clamp(25px,5.2vw,38px)` — so the sentence a lesson wants remembered is set *smaller* than
every section's framing line. That ranking is right everywhere else and fatal here, so
`devhub.css` bumps `.hf-deck[data-shape="mnemonic"] ~ .hf-big` to 44px. Measured, not assumed:
44px against a 38px `hf-say` on `big-o`, 27px still on every other shape.
**Built:** `big-o` — *"Compute it, halve it, or walk it."* Three mechanisms for locating data,
which is the only thing that decides a lookup's complexity; the amortized-`add()` trap that used
to be the whole block survives as one sticky note.

### `autopsy` — The Autopsy
> **Trigger:** the gotcha surfaces as a **specific error message** the learner will paste into
> a search box. `CORS policy: No 'Access-Control-Allow-Origin'`. `LazyInitializationException`.
> `ExpressionChangedAfterItHasBeenCheckedError`.

**Silhouette:** opens on the failure output, verbatim, and works **backwards** to the cause.
Reverse chronology is the whole point — every other shape runs forward.
**Must have:** the error text first, in a `<pre>` or `hf-mark`, before any explanation +
`hf-ladder` read bottom-up (symptom → proximate cause → root cause) + `hf-brain`.
**Must not:** `hf-terms`, `hf-napkin`, `hf-qa`.
**Bar:** the error string must be the real one, copy-exact. A paraphrased error message is
useless — the learner is here because they pasted the real one.
**Built:** `nosql-document-wide-column` — opens on the driver's wrapped
`WriteError{code=17419, message='Resulting document after update is larger than 16777216'}` and
climbs six rungs of "↑ which happened because…" from the throwing line to a design decision made
on day one by someone applying the embedding rule correctly.

---

## Leaving a page alone

**"It already fits" is a legitimate verdict, and it needs a reason written down.**

If a page's existing block genuinely earns `tour` — it has a real wrong way, a real right way,
a real ordered procedure and real vocabulary — declare it:

```html
<p class="hf-deck" data-shape="tour">…</p>
```

and move on. That is one edit, not a rewrite.

What is **not** allowed is leaving it undeclared and calling it done. `unshaped` and
`tour`-because-it-earns-it look identical on the page and opposite in the manifest, and the
difference is the entire audit trail.

`tmp_variety.mjs` caps `tour` per track. When the cap is hit, the remaining pages have to
justify a different shape or the track is telling you something true about how it was written.

---

## The gate

```
node frontend/tmp_variety.mjs                 # whole site: distribution + skew failures
node frontend/tmp_variety.mjs --track=spring  # one track
node frontend/tmp_variety.mjs --manifest=m.tsv # page → shape → devices, for review
node frontend/tmp_variety.mjs --unshaped      # list what has not been re-staged yet
```

It fails on:

- **Skew** — any shape over **18%** of the shaped pages in a track (`tour` over **25%**).
- **A dead shape** — any of the eleven at zero sitewide once the sweep is complete.
- **A lie** — a block declaring `data-shape="receipt"` with no `hf-receipt` in it, or
  carrying a device its shape forbids.

The third check is the one that matters most. Declaring variety is easy; the gate makes the
declaration cost something.

**What it cannot see:** whether the shape SUITS the page. A `receipt` on a page with no cost
in it passes every mechanical check and is still the wrong call. The gate stops a relapse into
one shape; it cannot tell you the eleven are well matched. That is what the manifest review is
for — read the reason column, not the distribution.

---

## State of the sweep

Step 1 is done: **all eleven shapes now exist on a real page**, so none of them is a spec any
more. The distribution at that point:

```
tour 2 · questions 2 · receipt 2 · whiteboard 2 · argument 2
exhibit 1 · assembly 1 · timelapse 1 · twodoors 1 · mnemonic 1 · autopsy 1
unshaped 459 · no block 62
```

Three things the exemplars taught that the spec had not anticipated:

1. **Five shapes ban `hf-napkin`, and tooling assumed every block ended in one.** `blockshot.mjs`
   anchored its crop on the napkin and silhouetted a finished `timelapse` at 81px tall. Anything
   that walks a block must find its end by "the last `hf-*` sibling before the visualiser", not
   by a device five shapes are forbidden to have. `restage.mjs` still locates the *old* block's
   end by its napkin, which is fine — it reads the page as it was — but a page re-staged twice
   into a napkin-less shape will refuse the second pass, correctly.
2. **A shape can need CSS that does not exist yet.** `twodoors` could not be built honestly out
   of `hf-vs`, whose children stamp ❌/✅. The shape is the reason `.door` exists. Expect this
   again: the kit was written for the one silhouette, so a shape that breaks the silhouette can
   find the kit arguing with it.
3. **Re-staging costs teaching, and sometimes the right answer is not to.** Every re-stage here
   shrank its block (14.1k → 10.5k, 9.8k → 9.1k, 14.1k → 11.0k, 11.4k → 8.6k, 11.0k → 9.1k),
   because the banned devices took real paragraphs with them. That is the point when the page's
   gotcha genuinely is the new shape. It is *not* the point when the page is already a good
   `tour` — see `debugging-jwt`, left alone and declared.

Still to do: **step 2**, generate `--manifest=` per track with a reason column for review; then
**step 3**, the bulk re-stage of the remaining 459, track by track.
