/* ============================================================================
 * tmp_vcheck.mjs — DevHub's pre-deploy validator.
 *
 * CLAUDE.md has told every session to "validate pages with tmp_vcheck.mjs"
 * for a long time, but the file did not exist — so the documented validation
 * step silently passed. This is that file, for real.
 *
 * Zero dependencies, pure node, runs the whole 528-page site in about a
 * second. .github/workflows/deploy.yml gates the Pages deploy on it.
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

/* ── report ────────────────────────────────────────────────────────────── */
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
