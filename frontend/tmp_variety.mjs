/* ============================================================================
 * tmp_variety.mjs — is the Head First block on every page the SAME block?
 *
 * THE QUESTION IT ANSWERS
 *   docs/HEADFIRST-SHAPES.md gives the opening Head First block on a lesson
 *   page one of eleven SHAPES, declared as `<p class="hf-deck" data-shape="…">`.
 *   474 pages shipped the identical device order because the old recipe said
 *   "in this order:" — this is the only gate that looks ACROSS pages instead
 *   of at one, so it is the only thing that can catch that relapse happening
 *   again. It reads every page's declared shape, checks it against
 *   HEADFIRST-SHAPES.md's own must-have/must-not device list for that shape,
 *   and reports each track's shape distribution against the caps the doc sets
 *   (18% per shape, 25% for `tour`, measured against SHAPED pages in that
 *   track — CLAUDE.md's own wording).
 *
 * HOW TO RUN
 *   node frontend/tmp_variety.mjs                  whole site: distribution + caps + lies
 *   node frontend/tmp_variety.mjs --track=spring    one track only (body class track-spring)
 *   node frontend/tmp_variety.mjs --unshaped        list pages with an hf-deck block but no data-shape
 *   node frontend/tmp_variety.mjs --manifest=m.json write every page's {shape, devices, track} as JSON
 *                                                    (path is written relative to frontend/, like
 *                                                    tmp_hfaudit.mjs's --json=)
 *   Zero dependencies, pure Node, static markup scan — same class of tool as tmp_hfaudit.mjs.
 *
 * WHAT A FAILURE MEANS
 *   - "LIE": a page declares a shape whose required devices are not all present, or that
 *     carries a device its shape's own must-not list forbids. This is the check that
 *     matters most — see HEADFIRST-SHAPES.md's own framing. Fix by re-reading the shape's
 *     entry in that file and either finishing the block or correcting the declaration.
 *   - "SKEW": one shape is over its cap as a share of a track's SHAPED pages. During an
 *     early rollout (most tracks currently have 0-3 shaped pages) this is often
 *     mathematically unavoidable — one page in an unshaped track is 100% of that track's
 *     shaped pages no matter which of the eleven it is. Report it anyway: the number is
 *     what lets an author pick the track's least-used shape instead of its most habitual
 *     one, which is the entire point (HEADFIRST-SHAPES.md "Choosing a shape" step 3).
 *   - "DEAD": one of the eleven shapes has zero pages sitewide. Only reported once the
 *     sweep is complete (zero pages left with an hf-deck block and no data-shape) — before
 *     that, an unbuilt shape is just unstarted work, not a regression.
 *
 * WHAT IT CANNOT SEE
 *   - Whether the shape SUITS the page (HEADFIRST-SHAPES.md's own line: "A receipt on a
 *     page with no cost in it passes every mechanical check and is still the wrong call").
 *     It can only check the declaration against the devices, never the judgment behind it.
 *   - The block's BOUNDARY precisely. There is no reliable closing marker — five shapes
 *     forbid the one device (hf-napkin) every page used to end on (see
 *     HEADFIRST-SHAPES.md "State of the sweep" note 1) — so this scans from the
 *     `hf-deck` tag to the page's next `<h2` (the first real content-section heading),
 *     capped at 40,000 characters. That window can run into hero markup between the
 *     block and that heading; hero widgets (`rt-ctlbar`/`rt-stage`/`.panel`) don't use
 *     `hf-*` classes on this site, so in practice that has not produced a false device
 *     match in any of the 16 pages this gate was built and verified against, but a page
 *     that breaks that convention could fool it.
 *   - Device COUNTS beyond the thresholds this file hardcodes (e.g. "8-10 hf-bub" for
 *     `argument` is checked as >=8, not range-capped; "5-7 dt/dd" for `questions` is
 *     checked as >=5). A page with 40 bubbles or 20 Q&A pairs passes.
 *   - `.door` vs `.bad`/`.good` inside `hf-vs` for anything except `twodoors`'s own
 *     check — HEADFIRST-SHAPES.md flags this exact gap itself ("tmp_variety.mjs only
 *     sees the hf-vs container, so it cannot catch this — check it [by hand]" for every
 *     OTHER shape that uses hf-vs, e.g. `receipt`).
 *   - `data-answer` correctness, CodeWalk `lines:` indices, coach regexes, contrast,
 *     asset loss, doc comments — every other gate's job, not this one's.
 *   - This does not run in .github/workflows/deploy.yml. It is an authoring aid, run by
 *     hand before and after staging a page — not a merge gate, unlike tmp_vcheck.mjs.
 * ========================================================================== */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const arg = (k, d) => { const m = argv.find(a => a.startsWith(`--${k}=`)); return m ? m.slice(k.length + 3) : d; };
const TRACK = arg('track', '');
const MANIFEST = arg('manifest', '');
const UNSHAPED = argv.includes('--unshaped');

const CAP_DEFAULT = 18;
const CAP_TOUR = 25;
const BLOCK_WINDOW_MAX = 40000; // see WHAT IT CANNOT SEE

/** Scan one block's HTML and return the device inventory tmp_variety.mjs checks shapes against.
 *  Every check here is a simple regex against the block's raw HTML — the recipe's markup is a
 *  fixed contract (docs/HEADFIRST-BLOCK-RECIPE.md), so a loose match is enough and a real
 *  parser would be more code for no more accuracy on hand-authored HTML. */
function inventory(block) {
  const has = (re) => re.test(block);
  const count = (re) => (block.match(re) || []).length;
  return {
    verdictPair: has(/class="hf-card bad"/) && has(/class="hf-card good"/),
    cardTitle: has(/class="hf-cardtitle"/),
    ladder: has(/class="hf-ladder"/),
    terms: has(/class="hf-terms"/),
    talk: has(/class="hf-talk"/),
    bubCount: count(/class="hf-bub(?:\s+right)?"/g),
    big: has(/class="hf-big"/),
    qa: has(/class="hf-qa"/),
    dtCount: count(/<dt>/g),
    receipt: has(/class="hf-receipt"/),
    receiptRows: count(/class="row"/g) + count(/class="row total"/g),
    receiptTotal: has(/class="row total"/),
    vs: has(/class="hf-vs"/),
    doorCount: count(/class="door"/g),
    arrowCount: count(/class="hf-arrow(?:\s+\w+)?"/g),
    mark: has(/class="hf-mark(?:\s+\w+)?"/) || has(/<span class="hf-mark/),
    annot: has(/class="hf-annot"/),
    pre: has(/<pre[\s>]/),
    chain: has(/class="hf-chain"/),
    steps: has(/class="hf-steps"/),
    cycle: has(/class="hf-cycle"/),
    napkin: has(/class="hf-napkin"/),
    noteCount: count(/class="hf-note"/g),
    hand: has(/class="hf-hand"/),
    brain: has(/class="hf-brain"/),
    diagramKit: has(/class="hf-(?:one|nest|slot|cast|cycle)"/),
    principle: has(/class="principle"/),
  };
}

/* One entry per shape from docs/HEADFIRST-SHAPES.md: `need(d)` is that shape's
   must-have devices, `banned` is its own must-not list turned into device keys.
   Thresholds (dtCount>=5, bubCount>=8, arrowCount>=3, noteCount>=2, doorCount>=2)
   come from the shape's own "Must have" line and were checked against the 16
   already-built pages before being hardcoded here — see WHAT IT CANNOT SEE for
   what they do not range-cap. */
const SHAPES = {
  tour: {
    need: (d) => d.verdictPair && d.ladder && d.terms,
    needLabel: 'hf-card.bad + hf-card.good + hf-ladder + hf-terms',
    banned: [], bannedLabel: 'nothing — it is the superset',
  },
  questions: {
    need: (d) => d.big && d.qa && d.dtCount >= 5,
    needLabel: 'hf-big + hf-qa (>=5 dt/dd pairs)',
    banned: ['verdictPair', 'talk', 'napkin', 'terms', 'ladder'],
    bannedLabel: 'verdict pair, hf-talk, hf-napkin, hf-terms, hf-ladder',
  },
  receipt: {
    need: (d) => d.receipt && d.receiptTotal && d.vs && d.arrowCount >= 1,
    needLabel: 'hf-receipt (with a .row.total) + hf-vs + hf-arrow',
    banned: ['cardTitle', 'talk', 'terms'],
    bannedLabel: 'hf-cardtitle, hf-talk, hf-terms',
  },
  whiteboard: {
    need: (d) => d.diagramKit && d.hand && d.brain,
    needLabel: 'one of hf-one/hf-nest/hf-cycle/hf-slot/hf-cast + hf-hand + hf-brain',
    banned: ['talk', 'napkin', 'terms', 'verdictPair'],
    bannedLabel: 'hf-talk, hf-napkin, hf-terms, verdict pair',
  },
  argument: {
    need: (d) => d.talk && d.bubCount >= 8,
    needLabel: 'hf-talk with >=8 hf-bub',
    banned: ['verdictPair', 'ladder', 'terms', 'napkin'],
    bannedLabel: 'verdict pair, hf-ladder, hf-terms, hf-napkin',
  },
  exhibit: {
    need: (d) => (d.pre || d.annot) && d.arrowCount >= 3 && d.mark,
    needLabel: 'a <pre> or hf-annot + >=3 hf-arrow + hf-mark',
    banned: ['talk', 'verdictPair', 'terms', 'ladder'],
    bannedLabel: 'hf-talk, verdict pair, hf-terms, hf-ladder',
  },
  assembly: {
    need: (d) => d.chain && d.steps && d.mark,
    needLabel: 'hf-chain + hf-steps + hf-mark',
    banned: ['talk', 'qa', 'receipt'],
    bannedLabel: 'hf-talk, hf-qa, hf-receipt',
  },
  timelapse: {
    need: (d) => d.cycle && d.ladder,
    needLabel: 'hf-cycle + hf-ladder',
    banned: ['terms', 'napkin', 'qa'],
    bannedLabel: 'hf-terms, hf-napkin, hf-qa',
  },
  twodoors: {
    need: (d) => d.vs && d.doorCount >= 2 && d.principle,
    needLabel: 'hf-vs with >=2 .door panels + principle',
    banned: ['verdictPair', 'receipt', 'talk'],
    bannedLabel: 'verdict pair, hf-receipt, hf-talk',
  },
  mnemonic: {
    need: (d) => d.big && d.principle && d.noteCount >= 2,
    needLabel: 'hf-big + principle + >=2 hf-note',
    banned: ['verdictPair', 'talk', 'receipt', 'ladder'],
    bannedLabel: 'verdict pair, hf-talk, hf-receipt, hf-ladder',
  },
  autopsy: {
    need: (d) => (d.pre || d.mark) && d.ladder && d.brain,
    needLabel: 'error text (<pre> or hf-mark) + hf-ladder + hf-brain',
    banned: ['terms', 'napkin', 'qa'],
    bannedLabel: 'hf-terms, hf-napkin, hf-qa',
  },
};
const SHAPE_NAMES = Object.keys(SHAPES);

/** True when device key `k` (from a shape's `banned` list) is present in inventory `d`. */
function bannedPresent(d, k) {
  if (k === 'talk') return d.talk;
  if (k === 'qa') return d.qa;
  if (k === 'receipt') return d.receipt;
  if (k === 'ladder') return d.ladder;
  if (k === 'terms') return d.terms;
  if (k === 'napkin') return d.napkin;
  if (k === 'verdictPair') return d.verdictPair;
  if (k === 'cardTitle') return d.cardTitle;
  return false;
}

/**
 * Read one page and report its shape state: 'no-block' (no hf-deck at all), 'unshaped'
 * (hf-deck with no data-shape), or a row {shape, track, ok, whyNot[]} for a declared one.
 * `ok`/`whyNot` are null for 'no-block'/'unshaped' rows — there is nothing to check yet.
 */
function scanPage(file, src) {
  const bodyM = src.match(/<body[^>]*class="([^"]*)"/);
  const track = bodyM ? (bodyM[1].match(/track-([a-z0-9-]+)/) || [, ''])[1] : '';
  const deckM = src.match(/<p class="hf-deck"(?:\s+data-shape="([a-z]+)")?[^>]*>/);
  if (!deckM) return { file, track, state: 'no-block' };
  const deckAt = deckM.index;
  const shape = deckM[1] || '';
  if (!shape) return { file, track, state: 'unshaped' };

  const h2At = src.indexOf('<h2', deckAt + deckM[0].length);
  const end = Math.min(
    h2At === -1 ? Infinity : h2At,
    deckAt + BLOCK_WINDOW_MAX,
    src.length,
  );
  const block = src.slice(deckAt, end);
  const d = inventory(block);

  const def = SHAPES[shape];
  const whyNot = [];
  if (!def) {
    whyNot.push(`"${shape}" is not one of the eleven shapes in docs/HEADFIRST-SHAPES.md`);
  } else {
    if (!def.need(d)) whyNot.push(`missing required devices: ${def.needLabel}`);
    for (const b of def.banned) {
      if (bannedPresent(d, b)) whyNot.push(`carries a device "${shape}" forbids: ${def.bannedLabel}`);
    }
  }
  return { file, track, state: 'shaped', shape, ok: whyNot.length === 0, whyNot, devices: d };
}

// ── scan the site ────────────────────────────────────────────────────────
const files = readdirSync(HERE).filter((f) => f.endsWith('.html'));
const rows = files.map((f) => scanPage(f, readFileSync(join(HERE, f), 'utf8')));

const noBlock = rows.filter((r) => r.state === 'no-block');
const unshaped = rows.filter((r) => r.state === 'unshaped');
const shaped = rows.filter((r) => r.state === 'shaped');
const lies = shaped.filter((r) => !r.ok);

console.log(`tmp_variety.mjs — ${rows.length} page(s) scanned`);
console.log(`  no hf-deck block:        ${noBlock.length}`);
console.log(`  hf-deck, no data-shape:  ${unshaped.length}  (unshaped)`);
console.log(`  declared a shape:        ${shaped.length}`);
console.log(`  declaration/device MISMATCH: ${lies.length}\n`);

if (lies.length) {
  console.log('❌ LIES — declared shape does not match its devices:');
  for (const r of lies) {
    console.log(`  ${r.file} [${r.track || '—'}] data-shape="${r.shape}"`);
    for (const w of r.whyNot) console.log(`      - ${w}`);
  }
  console.log();
}

// ── per-track distribution + cap check ──────────────────────────────────
const tracks = [...new Set(shaped.map((r) => r.track))].sort();
let skewFound = false;
for (const t of tracks) {
  if (TRACK && t !== TRACK) continue;
  const inTrack = shaped.filter((r) => r.track === t);
  const total = inTrack.length;
  const byShape = {};
  for (const r of inTrack) byShape[r.shape] = (byShape[r.shape] || 0) + 1;
  console.log(`── track-${t || '(none)'} — ${total} shaped page(s) ──`);
  for (const [shape, n] of Object.entries(byShape).sort((a, b) => b[1] - a[1])) {
    const pct = (n / total) * 100;
    const cap = shape === 'tour' ? CAP_TOUR : CAP_DEFAULT;
    const over = pct > cap;
    if (over) skewFound = true;
    console.log(`   ${over ? '⚠ SKEW' : '  ok  '} ${shape.padEnd(11)} ${n}/${total} = ${pct.toFixed(0)}% (cap ${cap}%)`);
  }
  console.log();
}

// ── dead-shape check, only meaningful once the sweep is complete ─────────
let deadFound = false;
if (unshaped.length === 0 && !TRACK) {
  const used = new Set(shaped.map((r) => r.shape));
  const dead = SHAPE_NAMES.filter((s) => !used.has(s));
  if (dead.length) {
    deadFound = true;
    console.log(`❌ DEAD SHAPE(S) sitewide (sweep is complete and these have zero pages): ${dead.join(', ')}\n`);
  }
}

if (UNSHAPED) {
  const list = TRACK ? unshaped.filter((r) => r.track === TRACK) : unshaped;
  console.log(`unshaped (hf-deck, no data-shape) — ${list.length}:`);
  for (const r of list) console.log(`  ${r.file}  [${r.track || '—'}]`);
  console.log();
}

if (MANIFEST) {
  const manifest = rows.map((r) => ({
    file: r.file, track: r.track, state: r.state,
    shape: r.shape || null, ok: r.ok ?? null, whyNot: r.whyNot || [],
  }));
  writeFileSync(join(HERE, MANIFEST), JSON.stringify(manifest, null, 2));
  console.log(`manifest written: frontend/${MANIFEST}`);
}

const fail = lies.length > 0 || skewFound || deadFound;
console.log(fail ? 'tmp_variety.mjs: FAIL' : 'tmp_variety.mjs: clean');
process.exit(fail ? 1 : 0);
