# The Head First block recipe

How a lesson page gets brought up to the nine-point teaching standard in `CLAUDE.md`: the exact
markup contract, the method, and the gates. This is the brief handed to every author working the
`ROADMAP.md` item 1 sweep — written so it can be followed verbatim by someone with no other
context.

Read `CLAUDE.md`'s "Head First teaching standard" section first — that is the bar; this is the
shape.

Work in `frontend/`. Touch only the pages you were given. When several authors are working at
once, do not run git — the sweep commits once at the end.

## What you are adding

Exactly ONE new Head First–style teaching block per page, inserted immediately BEFORE the page's
hero/visualizer section. Each block teaches **one specific, honest, non-obvious gotcha** that the
page does **not** already cover.

## Method, for every page, in order

1. **Read the page first** and inventory what it already teaches (grep its `<h2>`/`<h3>` headings,
   skim the sections and any CodeWalk `title:` strings). Your angle must be something it does not
   already say. If your first idea is already covered, pick another.
2. **Choose a real gotcha** — something with a genuinely surprising outcome, where every step looks
   correct and the result is still wrong. Fact-check it against real documented behaviour of the
   technology before you write it. Never invent behaviour. If you are not certain a claim is true,
   pick a different angle rather than hedging in the text.
3. **Write the block to a scratch file** first — a shell heredoc mangles HTML — then splice it in.
   Put that scratch file **outside `frontend/`**: anything ending in `.html` under `frontend/` is
   treated as a site page by `tmp_vcheck.mjs`, and a stray one shows up as a broken page for
   everyone.
4. **Splice it** with the helper — it matches the page's line endings, refuses on a non-unique
   anchor, and adds the required `devhub-hf-check.js` script tag:
   ```
   node tmp_hfsplice.mjs <page.html> <block.html> "<anchor>"
   ```
   The anchor is an existing unique line from the page — normally the HTML comment introducing the
   hero section (grep for `<!-- ── HERO`). The block is inserted immediately before it. If the
   anchor matches 0 or 2+ times the script refuses; pick a more specific anchor.
5. **Verify**: `node tmp_smoke.mjs <page.html>` must report clean.
6. **Score it** (see Verification below). Only then move to the next page.

## The exact markup (copy these shapes precisely — they are the site's CSS contract)

> ### ⚠ THIS IS A PARTS CATALOGUE, NOT AN ORDER
>
> This section used to open with **"Your block, in this order:"** followed by the sequence
> below. That one sentence is why 474 lesson pages shipped looking identical — every page
> followed it faithfully, and the variety that makes Head First readable did not survive
> being scaled. `hf-qa`, `hf-chain`, `hf-receipt` and `hf-hand` ended up on **zero** pages
> while eight other devices were on ~470 each.
>
> **Which devices your page gets, and in what order, is decided by
> [`docs/HEADFIRST-SHAPES.md`](HEADFIRST-SHAPES.md) — read that first.** It defines eleven
> shapes, each triggered by the KIND of gotcha the page teaches, each with devices it must
> have and devices it must not. `frontend/tmp_variety.mjs` fails the build when one shape
> takes over a track.
>
> What follows is the verbatim markup for each device — the CSS contract, so a wrong class
> name does not render as unstyled text. Take the parts your shape calls for. The sequence
> below happens to be the `tour` shape's order; it is one of eleven, not the default.

The markup for each device:

```html
<p class="hf-deck" data-shape="tour">or, a one-line subtitle in the Head First voice</p>
<!-- data-shape is REQUIRED and names the shape from HEADFIRST-SHAPES.md. It styles
     nothing; it exists so tmp_variety.mjs can check the claim against the devices. -->

<div class="hf-kick">The problem</div>
<p class="hf-say">One vivid sentence stating the surprise.</p>

<div class="hf-card bad">
  <div class="hf-cardtitle">A concrete, specific title — name the symptom, not the topic</div>
  <p>Set up the situation.</p>
  <p>Reveal what actually happens, and why every step looked correct.</p>
  <div class="hf-scatter">
    <span>thing that is fine ✓</span>
    <span>thing that is fine ✓</span>
    <span>the thing that is not ⚠</span>
  </div>
  <p class="hf-foot">One closing line that lands the point.</p>
</div>

<div class="hf-card good">
  <div class="hf-cardtitle">The fix, stated as an action</div>
  <div class="hf-ladder">
    <b>Step one</b>
    <i>↓ why this step matters</i>
    <b>Step two</b>
    <i>↓ why this step matters</i>
    <b>And step three</b>
  </div>
</div>

<div class="principle" style="text-align:left">
  <b>The one-sentence rule.</b> Three or four sentences expanding it.
</div>

<div class="hf-note">A sticky-note memory hook — an analogy or catchphrase, with <b>bold</b> on the
part to remember.</div>

<!-- hf-vs, the exaggerated before/after. .bad and .good stamp ❌ and ✅ via ::before. -->
<div class="hf-vs">
  <div class="bad"><h5>40,000 queries</h5><p>…</p></div>
  <div class="good"><h5>1 query</h5><p>…</p></div>
</div>

<!-- the SAME grid with no verdict, for the `twodoors` shape — both answers are
     defensible, so neither panel may be stamped wrong. .door draws two accent tints
     and a "Door 1 · " / "Door 2 · " counter in place of the ❌/✅ glyph. Do not mix
     .door with .bad/.good inside one hf-vs. -->
<div class="hf-vs">
  <div class="door"><h5>Relay the caller's JWT</h5><p>What it buys. When to choose it. What it costs.</p></div>
  <div class="door"><h5>Request a Client Credentials token</h5><p>Same three, honestly.</p></div>
</div>

<div class="hf-talk">
  <div class="hf-bub"><span class="who">You</span><p>The naive question.</p></div>
  <div class="hf-bub right"><span class="who">Some component, personified</span><p>Its answer, first person.</p></div>
  <div class="hf-bub"><span class="who">Another one</span><p>...</p></div>
  <div class="hf-bub right"><span class="who">A fourth voice</span><p>...</p></div>
</div>

<div class="hf-kick">The mechanism</div>
<p class="hf-say">One line framing the walkthrough.</p>

<div class="hf-card">
  <ol class="hf-steps">
    <li><span>Step text</span><span class="tag">short label</span></li>
    <li class="open"><span>Step text</span><span class="tag">short label</span></li>
    <li><span>Step text</span><span class="tag">short label</span></li>
    <li class="open"><span>Step text</span><span class="tag">short label</span></li>
    <li><span>Step text</span><span class="tag">short label</span></li>
    <li class="open"><span>Step text</span><span class="tag">short label</span></li>
  </ol>
  <p class="hf-annot">A paragraph dwelling on the single most important step.</p>
</div>

<div class="hf-card">
  <!-- ONE diagram from the kit below -->
  <p class="hf-annot">A paragraph reading the diagram back and drawing the lesson from it.</p>
</div>

<div class="hf-check" data-answer="1">
  <p class="q">A concrete scenario ending in a question.</p>
  <button type="button">Wrong but very plausible</button>
  <button type="button">The correct answer</button>
  <button type="button">Wrong but very plausible</button>
  <p class="why" data-for="0">Why this is wrong — teach something in the correction, never just "no".</p>
  <p class="why" data-for="1">Why this is right, plus the deeper point.</p>
  <p class="why" data-for="2">Why this is wrong — teach something.</p>
</div>

<div class="hf-kick">Where you have seen this before</div>
<p class="hf-say">One line.</p>

<div class="hf-terms">
  <div class="hf-card hf-taped">
    <h4>A parallel from elsewhere in software</h4>
    <p>Why it is the same shape of problem.</p>
    <div class="hf-scatter"><span>the compressed lesson</span></div>
  </div>
  <div class="hf-card hf-taped">
    <h4>A second parallel</h4>
    <p>...</p>
    <div class="hf-scatter"><span>...</span></div>
  </div>
  <div class="hf-card hf-taped">
    <h4>A third parallel</h4>
    <p>...</p>
    <div class="hf-scatter"><span>...</span></div>
  </div>
</div>

<div class="hf-napkin">
  <b>The whole page on a napkin:</b> two sentences summarising what the WHOLE page teaches, then
  <b>the one new sentence this block adds</b>.
</div>
```

**`data-answer` is ZERO-BASED** — `data-answer="1"` means the SECOND `<button>` is correct. No gate
can catch a wrong index; check it yourself. Vary which index is correct across your pages (roughly
even spread of 0/1/2).

## Diagram kit — pick ONE per page, and vary which one you use across your pages

```html
<!-- hf-one: many different causes funnelling into one outcome -->
<div class="hf-one">
  <div class="callers"><span>cause A</span><span>cause B</span><span>cause C</span></div>
  <div class="funnel">same underlying thing ↓</div>
  <div class="instance">The one outcome<small>one symptom, three unrelated-looking causes</small></div>
</div>

<!-- hf-slot: one slot, several things that could plug into it, one actually does -->
<div class="hf-slot">
  <div class="ctx">the question being asked<small>context line</small></div>
  <div class="arrow">what actually happens →</div>
  <div class="opts">
    <span>option</span>
    <span class="on">the one that applies</span>
    <span>option</span>
  </div>
</div>

<!-- hf-cycle: a loop of states, each with a transition -->
<div class="hf-cycle">
  <div class="stt on"><span class="nm">State name</span>
    <span class="go"><em>trigger</em> <span class="arrow">→</span> what happens</span></div>
  <div class="stt"><span class="nm">State name</span>
    <span class="go"><em>trigger</em> <span class="arrow">→</span> what happens</span></div>
  <div class="stt"><span class="nm">State name</span>
    <span class="go"><em>trigger</em> <span class="arrow">→</span> what happens</span></div>
</div>

<!-- hf-nest: containment, outermost first, innermost is .core -->
<div class="hf-nest">
  <div class="ring"><span class="lbl">outer thing</span>
    <div class="ring"><span class="lbl">inside that</span>
      <div class="ring"><span class="lbl">inside that</span>
        <div class="core">the innermost thing<small>a note about it</small></div>
      </div>
    </div>
  </div>
</div>

<!-- hf-cast: one subject, many things that react to it -->
<div class="hf-cast">
  <div class="subject">the thing that changes<small>context</small></div>
  <div class="fan">everything that reacts ↓</div>
  <div class="obs">
    <span>reactor</span>
    <span class="new">the surprising reactor</span>
    <span>reactor</span>
  </div>
</div>
```

Use the class names EXACTLY as written — `.ring`/`.core`/`.lbl` for hf-nest (**not** `.lvl`),
`.callers`/`.funnel`/`.instance` for hf-one, `.ctx`/`.arrow`/`.opts` for hf-slot,
`.stt`/`.nm`/`.go` for hf-cycle, `.subject`/`.fan`/`.obs` for hf-cast. A wrong class name renders as
unstyled text and no gate catches it.

## Voice rules

- Second person, conversational, specific. "You just built a token that never expires — here's how
  an attacker thanks you," not "Token expiry is an important consideration."
- Concrete numbers and scenarios over abstractions. Name the file, the function, the line, the time
  of day. Exaggerated contrasts are encouraged ("this runs 40,000 times; this one runs once").
- No throat-clearing, no "it's worth noting", no moralising. Never call the reader's mistake dumb.
- British or American spelling is fine, just be internally consistent per page.
- Inline code goes in `<code>…</code>`. Escape `<` and `>` inside prose as `&lt;` / `&gt;`.
- Do not repeat an analogy across two of your pages. Each page gets its own.

## Verification before you call a page done

- `node tmp_smoke.mjs <page.html>` → must say clean.
- `node tmp_hfaudit.mjs --json=<yourfile>.json --top=0`, then read your page's row out of
  `<yourfile>.json`. **The `--json=` path is relative to `frontend/`**, so pass a bare filename
  (e.g. `tmp_hfrows_mybatch.json`) — an absolute path silently writes nothing. Score must be
  **75 or above**. If it is lower, the block is missing markup — check every section above is
  present.
- If `tmp_vcheck.mjs` reports an error, only care about errors naming YOUR pages; other agents are
  writing other pages concurrently and their in-flight state is not your problem.

## Report back

For each page: the final score, the gotcha you taught in one line, the check question's correct
answer, and its `data-answer` index. Flag anything you could not do honestly rather than inventing
an angle — a page with no genuine gotcha left to teach is a real outcome, and saying so is more
useful than a manufactured one.
