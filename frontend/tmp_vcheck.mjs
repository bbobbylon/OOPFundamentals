/* ============================================================================
 * tmp_vcheck.mjs — DevHub's pre-deploy validator.
 *
 * THE QUESTION IT ANSWERS
 *   "Is every page in frontend/ structurally sound and reachable?" — valid
 *   UTF-8, registered in tracks-data.js (and every registration resolves to a
 *   file), loading the shared scripts it needs, linking only to files that
 *   exist, registered in exactly one section, and carrying inline <script>
 *   blocks that at least PARSE. Plus one CSS check on the three stylesheets.
 *
 * HOW TO RUN
 *   node frontend/tmp_vcheck.mjs            # human output, exit 1 on any error
 *   node frontend/tmp_vcheck.mjs --quiet    # errors only, warnings suppressed
 *   No prerequisites: pure node, no npm packages, no browser. Whole site in
 *   about a second. .github/workflows/deploy.yml runs it on every push and a
 *   red run BLOCKS the Pages deploy.
 *
 * WHAT A FAILURE MEANS
 *   An ERROR is a page a learner will hit broken: a missing file it links to,
 *   a registry entry pointing nowhere, a duplicate home in the rail, a script
 *   with a syntax error (which kills every interactive widget after it), or a
 *   CSS selector list that silently styles <html>. A WARNING is drift that is
 *   not yet clean (unregistered page, missing devhub-syntax.js, an unresolved
 *   demo asset) — reported so it can be fixed, not fatal, so the gate could
 *   land before every page was perfect. A clean run means the site is
 *   well-formed. It does NOT mean any page works.
 *
 * WHAT IT CANNOT SEE
 *   - That a script RUNS. Check 6 proves inline JS parses; `{type:Button}` on
 *     an undefined identifier, or a Spring `${app.cron}` placeholder inside a
 *     template literal, parse perfectly and throw on load. Both shipped. That
 *     is tmp_smoke.mjs's job (a real browser).
 *   - A wrong `<body class="track-…">`. A page cloned from another track is
 *     perfectly valid HTML wearing the wrong palette; four Render pages
 *     shipped as track-shell and nothing here can tell.
 *   - Whether the code ON the page compiles (tmp_codecheck.mjs), whether a
 *     CodeWalk highlights the right line (tmp_cwlines.mjs), or whether an
 *     edit silently deleted a widget (tmp_assetcheck.mjs). "Valid" here is
 *     the floor, never the bar.
 *
 * GIT NOTE: gitignored by `frontend/tmp*`; a new gate needs its own
 * `!frontend/tmp_<name>.mjs` allowlist line in .gitignore or git never sees it.
 *
 * HISTORY: CLAUDE.md told every session to "validate pages with
 * tmp_vcheck.mjs" long before the file existed — so the documented validation
 * step silently passed. This is that file, for real.
 *
 * CHECKS
 *   1  encoding      every .html is valid UTF-8 with no control bytes
 *                    outside tab/LF/CR  (a raw NUL in a Java `char` sample is
 *                    what made `file` report one page as `data`)
 *   2  registry      every `file:` in tracks-data.js resolves to a real page,
 *                    AND every page on disk is registered or allowlisted
 *   3  scripts       any page with a <pre> loads devhub-syntax.js; any page
 *                    using rt-* markup links devhub.css   (CLAUDE.md rules 8
 *                    and the self-contained-engine rule, enforced)
 *   4  links         no href to a local file that does not exist
 *   5  duplicates    no page registered in two sections (the rail needs a
 *                    single home per file or "next" is ambiguous)
 *   6  inline JS     every inline <script> parses — catches a stray `)`, an
 *                    unescaped quote, or a literal </script> inside a string,
 *                    each of which silently kills a page's interactivity
 *   7  hf-check      a page with .hf-check markup loads devhub-hf-check.js.
 *                    Without it every explanation renders at once and clicking
 *                    does nothing — the page LOOKS fine, so only a click finds
 *                    it, and nobody clicks 500 pages
 *   8  CSS selectors no theme selector list mixes a bare branch with a
 *                    descendant branch. `[data-theme="cream"][data-hf],
 *                    [data-theme="light"][data-hf] .thing` READS as one rule
 *                    but PARSES as two — a bare root selector that leaks the
 *                    declarations onto <html>, plus a light-only rule. It
 *                    silently killed the entire component half of the cream
 *                    theme once; nothing throws and the dark theme looks fine
 *   9  stats denom    the backend's app.progress.total-topics default equals the
 *                     number of pages tracks-data.js registers. The backend cannot
 *                     read tracks-data.js, so it mirrors the count — and a mirror
 *                     with nothing checking it drifts: this shipped as a hard-coded
 *                     200 against a registry of 521, inflating every learner's
 *                     completion percentage ~2.6x. Skipped when backend/ is absent.
 *
 * Failures are errors; drift that is not yet clean is reported as a warning
 * so the gate can land before every last page is perfect.
 *
 * USAGE
 *   node tmp_vcheck.mjs            # human output, exits non-zero on error
 *   node tmp_vcheck.mjs --quiet    # errors only
 * ========================================================================== */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { Script } from 'node:vm';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const quiet = process.argv.includes('--quiet');

const errors = [];
const warnings = [];
const err = (file, msg) => errors.push({ file, msg });
const warn = (file, msg) => warnings.push({ file, msg });

const htmlFiles = readdirSync(HERE).filter((f) => f.endsWith('.html')).sort();

/* Pages that legitimately live outside tracks-data.js: per-track landing pages
   and the hub itself. Anything else unregistered is almost certainly an orphan
   that no learner can reach. */
const ALLOW_UNREGISTERED = new Set(
  ['app.html', 'index.html', 'index-legacy.html', 'stats.html']            // index.html links the legacy hub
    .concat(htmlFiles.filter((f) => /-index\.html$/.test(f)))
);

/* ── 1. encoding ───────────────────────────────────────────────────────── */
const decoder = new TextDecoder('utf-8', { fatal: true });
for (const f of htmlFiles) {
  const buf = readFileSync(join(HERE, f));
  try {
    decoder.decode(buf);
  } catch {
    err(f, 'not valid UTF-8');
    continue;
  }
  for (let i = 0; i < buf.length; i++) {
    const b = buf[i];
    if (b < 0x20 && b !== 0x09 && b !== 0x0a && b !== 0x0d) {
      err(f, `control byte 0x${b.toString(16).padStart(2, '0')} at offset ${i}`);
      break;                                   // one report per file is enough
    }
  }
}

/* ── 2 + 5. registry ───────────────────────────────────────────────────── */
let tracks = null;
try {
  const win = {};
  new Function('window', readFileSync(join(HERE, 'tracks-data.js'), 'utf8'))(win);
  tracks = win.DEVHUB_TRACKS;
  if (!Array.isArray(tracks)) throw new Error('DEVHUB_TRACKS is not an array');
} catch (e) {
  err('tracks-data.js', 'failed to evaluate: ' + e.message);
}

const registered = new Map();                  // file -> [ "track / section", ... ]
if (tracks) {
  for (const t of tracks) {
    for (const s of t.sections || []) {
      for (const p of s.pages || []) {
        if (!p || !p.file) continue;
        if (!existsSync(join(HERE, p.file))) {
          err('tracks-data.js', `registers missing page: ${p.file}`);
        }
        if (!registered.has(p.file)) registered.set(p.file, []);
        registered.get(p.file).push(`${t.label} / ${s.label}`);
      }
    }
  }
  for (const [file, homes] of registered) {
    if (homes.length > 1) {
      err('tracks-data.js', `${file} registered in ${homes.length} sections: ${homes.join(' | ')}`);
    }
  }
  for (const f of htmlFiles) {
    if (!registered.has(f) && !ALLOW_UNREGISTERED.has(f)) {
      warn(f, 'on disk but not registered in tracks-data.js (unreachable from the hub)');
    }
  }
}

/* ── 9. the backend's completion denominator mirrors this registry ──────── */
const APP_YML = join(HERE, '..', 'backend', 'src', 'main', 'resources', 'application.yml');
if (tracks && existsSync(APP_YML)) {
  const m = readFileSync(APP_YML, 'utf8').match(/total-topics:\s*\$\{[A-Z_]+:(\d+)\}/);
  if (!m) {
    err('backend/application.yml', 'app.progress.total-topics not found — ProgressService needs it to size the completion percentage');
  } else if (+m[1] !== registered.size) {
    err('backend/application.yml',
        `app.progress.total-topics is ${m[1]} but tracks-data.js registers ${registered.size}. ` +
        'Update the default so the stats endpoint stops reporting a percentage of the wrong total.');
  }
}

/* ── 3 + 4. per-page checks ────────────────────────────────────────────── */
/* Strip everything that can contain a link which is CONTENT rather than
   navigation: comments, code blocks, and — the one that produced most of the
   noise — HTML-ESCAPED example markup like
       &lt;link rel="stylesheet" href="styles.css"&gt;
   which teaches what an Angular index.html looks like and must not be
   resolved against the filesystem. */
const stripped = (s) =>
  s.replace(/<!--[\s\S]*?-->/g, '')
   .replace(/<(pre|code|textarea|script|style)\b[\s\S]*?<\/\1>/gi, '')
   .replace(/&lt;[\s\S]*?(?:&gt;|$)/g, '');

for (const f of htmlFiles) {
  const src = readFileSync(join(HERE, f), 'utf8');

  // 3 — required shared assets
  if (/<pre[\s>]/i.test(src) && !src.includes('devhub-syntax.js')) {
    warn(f, 'has <pre> but does not load devhub-syntax.js (rule 8: no plain white-text code)');
  }
  if (/class="rt-(stage|node|ctlbar)/.test(src) && !/devhub\.css/.test(src) && !/\.rt-stage\s*\{/.test(src)) {
    err(f, 'uses rt-* chip-engine markup but neither links devhub.css nor defines .rt-stage itself');
  }

  /* 6 — inline scripts must PARSE. Five pages shipped with dead interactive
     sections because of this: two Go pages closed a step object with `)`
     instead of `}`, one had a brace too many, one had an unescaped apostrophe
     in a single-quoted string, and angular-ssr-hydration contained a literal
     `</script>` inside a JS string — which ends the block at that point and
     breaks everything after it. All five parse fine to the eye and are
     invisible without either a browser or this check. */
  {
    const re = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi;
    let sm;
    while ((sm = re.exec(src))) {
      const type = (sm[1].match(/type\s*=\s*["']([^"']+)["']/i) || [])[1];
      // Non-JS types are data blocks (code samples, bundler payloads) — skip.
      if (type && !/^(text\/javascript|module|application\/javascript)$/i.test(type)) continue;
      if (!sm[2].trim()) continue;
      try { new Script(sm[2]); }
      catch (e) {
        const line = src.slice(0, sm.index).split('\n').length;
        err(f, `inline <script> at line ~${line} does not parse: ${e.message}`);
        break;
      }
    }
  }

  // 4 — internal links (skip anchors, externals, and code samples)
  const body = stripped(src);
  const re = /(?:href|src)\s*=\s*"([^"]+)"/gi;
  let m;
  while ((m = re.exec(body))) {
    const raw = m[1].trim();
    if (!raw || /^(#|https?:|mailto:|data:|javascript:|\/\/)/i.test(raw)) continue;
    const target = raw.split(/[?#]/)[0];
    if (!target) continue;
    if (existsSync(join(HERE, target))) continue;
    /* Hard-fail only on things a learner can actually click through to, or
       that the page needs to function: other lesson pages, and the shared
       devhub-* engines. Everything else (a demo asset name, a sample path)
       is a warning — that is the difference between a gate people trust and
       one they learn to ignore. */
    if (/\.html$/i.test(target) || /^(devhub[-.]|tracks-data\.js|quiz-banks\.js|config\.js)/.test(basename(target))) {
      err(f, `broken local link: ${target}`);
    } else {
      warn(f, `unresolved reference (not a page or shared asset): ${target}`);
    }
  }
}

/* ── 7. knowledge checks are wired ─────────────────────────────────────────
   .hf-check is inert markup without devhub-hf-check.js: the .why explanations
   are hidden BY that script, so a page missing it renders every answer's
   explanation at once and the buttons do nothing. It looks like a styled quiz
   and it teaches the opposite of active recall. This has now been shipped
   broken twice — once because an idempotency guard matched the filename inside
   the page's own prose, once because a freshly authored page simply never got
   the tag — so it is a gate rather than a habit. */
for (const f of htmlFiles) {
  const s = readFileSync(join(HERE, f), 'utf8');
  if (!/class="hf-check"/.test(s)) continue;
  if (!/<script src="devhub-hf-check\.js"><\/script>/.test(s))
    err(f, 'has .hf-check markup but does not load devhub-hf-check.js (the check is dead)');
}

/* ── 8. CSS theme selector lists ───────────────────────────────────────────
   A selector list where one branch carries a descendant combinator and another
   does not is almost always a comma that was meant to be an alternation:

     [data-theme="cream"][data-hf],[data-theme="light"][data-hf] .thing { ... }

   reads as "either theme, this thing" but parses as TWO selectors — a bare
   [data-theme="cream"][data-hf] (which matches <html> and leaks every
   declaration onto it) and a light-only rule for .thing. The cream branch
   silently styles nothing. Write :is([data-theme="cream"],[data-theme="light"])
   [data-hf] .thing instead. Only flagged when the bare branch is root-ish,
   because that is the case that is always a mistake rather than a shorthand. */
for (const cssFile of ['devhub.css', 'devhub-hf.css', 'devhub-warm.css']) {
  const abs = join(HERE, cssFile);
  if (!existsSync(abs)) continue;
  const css = readFileSync(abs, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of css.matchAll(/([^{}]+)\{/g)) {
    const sel = m[1].trim();
    if (!sel || sel.startsWith('@')) continue;
    const parts = sel.split(',').map((x) => x.trim()).filter(Boolean);
    if (parts.length < 2) continue;
    // strip functional pseudos first: the spaces inside :is(a, b) are not combinators
    const hasDescendant = (p) => /[ >+~]/.test(p.replace(/:(?:is|not|where|has)\([^)]*\)/g, ''));
    const bare = parts.filter((p) => !hasDescendant(p));
    if (bare.length && bare.length < parts.length &&
        bare.some((p) => /^(?::root|html|\[data-)/.test(p))) {
      err(cssFile, `selector list mixes a bare theme branch with a descendant branch ` +
                   `(the bare branch styles <html>): ${sel.replace(/\s+/g, ' ').slice(0, 120)}`);
    }
  }
}

/* ── report ────────────────────────────────────────────────────────────── */
/** Bucket {file,msg} findings by file so the report prints one heading per page. */
const group = (list) => {
  const by = new Map();
  for (const { file, msg } of list) {
    if (!by.has(file)) by.set(file, []);
    by.get(file).push(msg);
  }
  return by;
};

if (!quiet && warnings.length) {
  console.log(`\n⚠  ${warnings.length} warning(s):`);
  let shown = 0;
  for (const [file, msgs] of group(warnings)) {
    if (shown++ >= 12) { console.log(`   … and ${warnings.length - shown + 1} more`); break; }
    console.log(`   ${file}`);
    msgs.slice(0, 3).forEach((x) => console.log(`     - ${x}`));
  }
}

if (errors.length) {
  console.error(`\n✗ ${errors.length} error(s):`);
  for (const [file, msgs] of group(errors)) {
    console.error(`   ${file}`);
    msgs.slice(0, 5).forEach((x) => console.error(`     - ${x}`));
    if (msgs.length > 5) console.error(`     … and ${msgs.length - 5} more`);
  }
  console.error(`\nvcheck FAILED — ${htmlFiles.length} pages scanned\n`);
  process.exit(1);
}

console.log(
  `\n✓ vcheck passed — ${htmlFiles.length} pages, ${registered.size} registered` +
  (warnings.length ? `, ${warnings.length} warning(s)` : '') + '\n'
);
