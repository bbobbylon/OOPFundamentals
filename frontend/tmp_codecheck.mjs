/* tmp_codecheck.mjs — does the code on the page actually compile?
 *
 * THE QUESTION IT ANSWERS
 *   "Is any TypeScript or Java snippet shown on the site PROVABLY wrong?"
 *   Every <pre> block and every DevHubCodeWalk `code:` array is extracted,
 *   classified by language, wrapped in just enough scaffolding to be a
 *   compilation unit, and handed to the real `tsc` API or the real `javac`.
 *   Only the error classes an absent context cannot explain are reported
 *   (an ALLOW list — see below).
 *
 * HOW TO RUN
 *   node frontend/tmp_codecheck.mjs                 # whole site, exit 1 on any
 *   node frontend/tmp_codecheck.mjs --file=x.html   # one page
 *   node frontend/tmp_codecheck.mjs --lang=ts       # ts | java
 *   node frontend/tmp_codecheck.mjs --all           # every finding, not first 40
 *   node frontend/tmp_codecheck.mjs --syntax        # also report parse errors
 *   node frontend/tmp_codecheck.mjs --raw           # every diagnostic, allow-list off
 *   node frontend/tmp_codecheck.mjs --counter       # list the excused ❌ lines
 *   node frontend/tmp_codecheck.mjs --list          # extract + classify only
 *   Prerequisites: `npm i --no-save typescript@5.6.3` — the version the Try It
 *   editor loads from the CDN, not the newest — and `javac` on PATH (JDK 24
 *   with --enable-preview is what it invokes). `extract` is exported for
 *   other scripts; importing the file does not scan the site.
 *
 * WHAT A FAILURE MEANS
 *   A block where the compiler resolved BOTH sides and they still do not fit:
 *   a type mismatch, a wrong argument count, a bad member on a known type, a
 *   bad override. That is exactly the band four shipped pages were in. A
 *   clean run means "nothing provably wrong". It has never meant "correct":
 *   `identity(42) // T = number` compiles fine and is still false.
 *
 * WHAT IT CANNOT SEE
 *   - A MISSING TOOLCHAIN. No `typescript` package means every TS block is
 *     waved through behind one "not installed" line; no `javac` does the
 *     same for Java. The run is a SKIP, not a failure, and the summary still
 *     prints "clean". Read the two `!` lines before trusting a green run.
 *   - Any language but TS and Java. Python, Go, C#, SQL, YAML, shell are
 *     classified out and never checked.
 *   - A fragment whose names all live three paragraphs up the page. Unknown
 *     types produce no report by design — the allow list is the whole point.
 *   - Whether a claim is TRUE. Compiling proves the code is well-typed, not
 *     that the prose beside it, or the `// prints 42` comment, is right.
 *   - A wrong ❌. A line marked as a deliberate error is excused whether or
 *     not it really fails — `--counter` lists them so a human can check that
 *     each one is MEANT to fail. One excused line never excuses its block.
 *
 * GIT NOTE: gitignored by `frontend/tmp*`; a new gate needs its own
 * `!frontend/tmp_<name>.mjs` allowlist line in .gitignore or git never sees it.
 *
 * vcheck proves the PAGE parses. This proves the LESSON does: it pulls every
 * <pre> block and every DevHubCodeWalk `code:` array out of the HTML, works out
 * what language each one is, and puts the TypeScript and Java ones through a
 * real compiler.
 *
 * Why it exists: four pages shipped a green tick over code that does not
 * compile. In every case the prose was right and nobody had ever handed the
 * snippet to a compiler, because a snippet inside a string array inside an HTML
 * file is not code to any tool in the repo. It is now.
 *
 * WHAT IT WILL AND WILL NOT TELL YOU
 * These are fragments, not programs. A fragment cannot resolve the names its
 * page defined three paragraphs earlier, so the honest default is an ALLOW
 * list: it reports only the errors a missing context cannot explain — the
 * compiler resolved both sides and they still do not fit. Type mismatches,
 * wrong argument counts, bad members on known types, bad overrides. That is
 * exactly the band the four bad pages were in, and running it against their
 * pre-fix versions reproduces all three compiler findings by itself.
 *
 * It says nothing about a fragment whose types are all unknown, and nothing
 * about whether a claim is TRUE — `identity(42) // T = number` compiles fine
 * and is still wrong. A clean run means "nothing provably wrong". It has never
 * meant "correct", and a page that passes still needs reading.
 *
 * A LINE marked ❌ / ✗ / "does not compile" is deliberately broken — that is the
 * lesson — so its diagnostics are excused. Only that line and its comment
 * neighbours, never the whole block: one intentional error must not buy silence
 * for the twenty lines around it — which is how these four shipped. `--counter`
 * lists every excused line so you can check each really is meant to fail.
 *
 *   node tmp_codecheck.mjs                 # whole site
 *   node tmp_codecheck.mjs --file=x.html   # one page
 *   node tmp_codecheck.mjs --lang=ts       # ts | java
 *   node tmp_codecheck.mjs --all           # every finding, not the first 40
 *   node tmp_codecheck.mjs --syntax        # also report parse errors
 *   node tmp_codecheck.mjs --raw           # every diagnostic, allow-list off
 *   node tmp_codecheck.mjs --counter       # list the excused ❌ lines
 *   node tmp_codecheck.mjs --list          # extract + classify only, no compile
 *
 * TypeScript needs `npm i --no-save typescript@5.6.3` (the version the Try It
 * editor loads from the CDN — check against what the site actually runs, not
 * against whatever is newest). Java needs `javac` on PATH. Either one missing
 * downgrades to a skip, not a failure.
 */
import { readdirSync, readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const flag = (n) => (argv.find((a) => a.startsWith('--' + n + '=')) || '').split('=')[1] || '';
const ONE = flag('file');
const LANG = flag('lang');
const ALL = argv.includes('--all');
const RAW = argv.includes('--raw');
const LIST = argv.includes('--list');
const COUNTER = argv.includes('--counter');
const SYNTAX = argv.includes('--syntax');

/* ── the toolchains, both optional ─────────────────────────────────────── */
const require_ = createRequire(import.meta.url);
let ts = null;
try { ts = require_('typescript'); } catch { /* reported below */ }
let javac = true;
try { execFileSync('javac', ['-version'], { stdio: 'ignore' }); } catch { javac = false; }

/* ── extraction ────────────────────────────────────────────────────────── */

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'", '#x27': "'", '#96': '`' };
const detag = (h) => h
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<[^>]+>/g, '')
  .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
    const k = e.toLowerCase();
    if (ENT[k] !== undefined) return ENT[k];
    if (k[0] === '#') return String.fromCodePoint(+(k[1] === 'x' ? '0' + k.slice(1) : k.slice(1)));
    return m;
  });

/* A ❌ marks a line the page WANTS to fail — that is the lesson. Excusing the
   whole block for it would be the bug all over again: the four bad pages each
   put one deliberate error next to nineteen lines nobody had ever compiled. So
   the excuse is per LINE, not per block. */
const XMARK = /[❌✗✘⛔🚫]|\bdoes ?n[o']t compile\b|\bwon'?t compile\b|\bcompile[sd]? error\b|\bTS\d{4}\b|\bcompilation fails\b|\bTS error\b|\btype error\b|\bis not assignable\b|\bdoes not exist on type\b|\/\/\s*(⚠\s*)?Error\b|\bError\s+[—-]\s/i;
const COMMENT_ONLY = /^\s*(\/\/|\/\*|\*|#|--)/;

/* 1-based line numbers whose diagnostics are expected. A marker on a comment
   line is annotating the code beside it, and authors put that comment above the
   call about as often as below it, so both neighbours go with it. */
function excused(text) {
  const ls = text.split('\n');
  const out = new Set();
  ls.forEach((l, i) => {
    if (!XMARK.test(l)) return;
    out.add(i + 1);
    if (COMMENT_ONLY.test(l)) { out.add(i); out.add(i + 2); }
  });
  return out;
}

/* Walk an opening bracket to its match, respecting quotes so a bracket inside
   a string cannot end the scan early. Same scanner tmp_cwlines.mjs uses. */
function balanced(src, openIdx) {
  const open = src[openIdx];
  const close = open === '[' ? ']' : '}';
  let depth = 0, q = null;
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i], p = src[i - 1];
    if (q) { if (c === q && p !== '\\') q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === open) depth++;
    else if (c === close) { depth--; if (!depth) return src.slice(openIdx + 1, i); }
  }
  return null;
}

/* The string literals of a `code:[…]` array, in order, unescaped. */
function arrayStrings(body) {
  const out = [];
  let q = null, cur = null;
  for (let i = 0; i < body.length; i++) {
    const c = body[i], p = body[i - 1];
    if (q) {
      if (c === q && p !== '\\') { out.push(cur); q = null; cur = null; }
      else cur += c;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { q = c; cur = ''; }
  }
  return out.map((s) => s.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\(['"`\\])/g, '$1'));
}

/**
 * Every code block on one page: each <pre> (de-tagged, entities decoded) and
 * each CodeWalk `code:` array (strings joined by newline), tagged with kind
 * and source offset. Exported so other scripts can reuse the extraction.
 */
export function extract(src, file) {
  const blocks = [];

  for (const m of src.matchAll(/<pre\b[^>]*>([\s\S]*?)<\/pre>/gi)) {
    const text = detag(m[1]).replace(/\r/g, '').trim();
    if (text) blocks.push({ file, kind: 'pre', at: m.index, text });
  }

  const marker = 'DevHubCodeWalk.mount(';
  for (let i = src.indexOf(marker); i !== -1; i = src.indexOf(marker, i + 1)) {
    const objIdx = src.indexOf('{', i);
    if (objIdx === -1) continue;
    const obj = balanced(src, objIdx);
    if (obj == null) continue;
    const codeIdx = obj.search(/\bcode:\s*\[/);
    if (codeIdx === -1) continue;
    const body = balanced(obj, obj.indexOf('[', codeIdx));
    if (body == null) continue;
    const text = arrayStrings(body).join('\n').trim();
    if (text) blocks.push({ file, kind: 'codewalk', at: i, text });
  }

  return blocks;
}

/* ── classification ────────────────────────────────────────────────────── */

/* Strong markers only. A block we cannot place confidently is skipped, because
   a wrong guess produces a page of errors that mean nothing. */
const JAVA = [
  /\bimport\s+java[x]?\./, /\bSystem\.(out|err)\.print/, /@Override\b/,
  /\bpublic\s+(static\s+)?(final\s+)?(class|interface|enum|record)\b/,
  /\bString\[\]\s*\w*\s*args\b/, /\bnew\s+[A-Z]\w*\s*(<[^>]*>)?\s*\(/,
  /\b(public|private|protected)\s+[\w<>\[\],.\s]+\s+\w+\s*\([^)]*\)\s*(throws[\w\s,.]+)?\{/,
  /\b(int|long|double|boolean|void|String|var)\s+\w+\s*=[^=]/,
  /\b[A-Z]\w*<[^>=]*>\s+\w+\s*[=;]/,          /* CompletableFuture<User> f = … */
  /\bthrows\s+[A-Z]\w*(Exception|Error)\b/,
  /\btry\s*\(\s*(var|final\s+)?[A-Za-z]\w*[\s<]/, /* try-with-resources          */
  /->\s*\w[\w.]*\(/,                            /* a Java lambda, not TS's =>   */
  /\b(void|int|long|boolean|String|var)\s+\w+\s*\([^)]*\)\s*\{/,
];
const TS = [
  /\b(const|let)\s+[\w{[\]}, ]+\s*:\s*[A-Za-z]/, /\binterface\s+\w+(<[^>]*>)?\s*\{/,
  /\btype\s+\w+(<[^>]*>)?\s*=/, /=>/, /\bfunction\s+\w+\s*<[^>]*>\s*\(/,
  /\b(export|import)\s+(type\s+)?\{/, /\bas\s+const\b/, /\b\w+\s*\??\s*:\s*(string|number|boolean)\b/,
  /\bconst\s+\w+\s*=/, /\bconsole\.log\(/,
];
/* At least one of these has to be present, or the block is plain JavaScript and
   TypeScript's rules do not apply to it. `const`, `=>` and `console.log` are
   not evidence — every JS page on this site has all three, and judging a DOM
   lesson by --strict reports "number is not assignable to string" about code
   that was never TypeScript. */
const TS_ONLY = [
  /\binterface\s+\w+/, /\btype\s+\w+(<[^>]*>)?\s*=/, /\benum\s+\w+/, /\bdeclare\s+\w/,
  /:\s*(string|number|boolean|void|any|unknown|never|object|symbol|bigint)\b/,
  /\b\w+\s*\??\s*:\s*[A-Z]\w*\s*[<[,)=;}]/, /\bas\s+(const|unknown|[A-Z]\w*)\b/,
  /\b(public|private|protected|readonly)\s+\w+\s*[:(=;]/, /\bimplements\s+[A-Z]/,
  /\bfunction\s+\w+\s*<[^>]*>\s*\(/, /\b\w+<[A-Z]\w*(\s*[,|]\s*[\w[\]<>]+)*>\s*\(/,
  /\bsatisfies\b/, /\bkeyof\b/, /\bextends\s+keyof\b/, /\)\s*:\s*[A-Z]\w*[<\s{]/,
  /@\w+\(\)?\s*$/m, /\bimport\s+type\b/, /\bexport\s+(type|interface)\b/,
];
/* Anything that is clearly some OTHER language is dropped before scoring, so a
   YAML file full of colons cannot look like a TypeScript annotation. */
const NOT_CODE = [
  /^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|BEGIN|WITH)\b/im,
  /^\s*[$#>]\s+\w/m, /^\s*(apiVersion|services|version|kind):/m,
  /^\s*(GET|POST|PUT|PATCH|DELETE|HTTP\/)\s/m, /^\s*[<{]\?/, /^\s*<[a-z!][\w-]*[\s>/]/im, /<!--/,
  /^\s*(def|class)\s+\w+\s*(\([^)]*\))?\s*:/m, /^\s*(from|import)\s+\w+\s+import\b/m,
  /^\s*(package|func)\s+\w+/m, /^\s*(FROM|RUN|COPY|ENTRYPOINT|CMD)\s+\S/m,
  /^\s*(namespace|using)\s+[\w.]+;?\s*$/m, /\bfn\s+\w+\s*\(/, /\b(let\s+mut|impl\s+\w)/,
  /^\s*(module\.exports|require\()/m, /^\s*[\w-]+\s*\{[^}]*:\s*[^;]+;/m /* css */,
  /* C# reads almost exactly like Java, so it has to be ruled OUT explicitly or
     every aspnet-* page turns into a wall of javac errors. */
  /\bConsole\.(Write|Read)/, /\bpublic\s+(async\s+)?Task[<\s]/, /\bawait\s+\w+/,
  /\[(HttpGet|HttpPost|ApiController|Authorize|Route)\b/, /\bIEnumerable</,
  /\{\s*get;\s*(set;)?\s*\}/, /\bstring\s+\w+\s*[=;)]/, /\bvar\s+\w+\s*=\s*new\s+\w+\s*\{/,
];
/** 'java' | 'ts' | null for one block — null means "not confident, skip it". */
function classify(text) {
  if (text.length < 24) return null;
  for (const re of NOT_CODE) if (re.test(text)) return null;
  const j = JAVA.reduce((n, re) => n + (re.test(text) ? 1 : 0), 0);
  const t = TS.reduce((n, re) => n + (re.test(text) ? 1 : 0), 0);
  if (j >= 2 && j > t) return 'java';
  if (t >= 2 && t > j && TS_ONLY.some((re) => re.test(text))) return 'ts';
  return null;
}

/* ── compilers ─────────────────────────────────────────────────────────── */

/* An ALLOW list, not a deny list — and that inversion is the whole design.
 * Denying the known noise still left 1,711 findings on this site, nearly all of
 * them a fragment complaining that its page's context is missing. A gate nobody
 * runs catches nothing, so this reports only the error classes that an absent
 * context CANNOT explain: the compiler resolved both sides and they still do
 * not fit. `--raw` shows everything if you want to go fishing; `--syntax` adds
 * parse errors, which are real but noisier because pages mix HTML into a
 * TypeScript block on purpose. */
const TS_REAL = new Set([
  2322, /* type X is not assignable to type Y            */
  2345, /* argument of type X is not assignable          */
  2339, 2551, /* property does not exist on type         */
  2554, 2555, 2556, 2557, /* wrong number of arguments   */
  2769, /* no overload matches this call                 */
  2739, 2740, 2741, /* missing properties from type      */
  2365, /* operator cannot be applied to these types     */
  2367, /* this comparison is unintentional              */
  2540, 2588, /* assignment to a readonly / const        */
  2416, 2420, /* bad override / bad implements           */
  2349, /* this expression is not callable               */
  2571, /* object is of type unknown                     */
  2559, 2719,
]);
/* Deliberately NOT here: "is not abstract and does not override" and "might not
   have been initialized". The first needs the page's own interface to resolve,
   and it never does — java.util.Observer answers instead, so an Observer lesson
   reports itself broken. The second fires on every `/* copy fields *\/` elision. */
const JAVA_REAL = /incompatible types|cannot be applied to given types|no suitable (method|constructor)|bad operand types|unreported exception|incompatible thrown types|array required|cannot be dereferenced|non-static (method|variable) .* cannot be referenced/i;
const TS_SYNTAX = (c) => c >= 1000 && c < 2000;
/* Built-in globals that popular libraries also use as class names. */
const AMBIENT = /\bnew\s+(Function|Object|Array|Date|Error|Map|Set|Promise|Proxy|Image|Event|Request|Response|Headers|Node|Range|Text|Selection|Notification)\s*\(/;
/* Ambient declarations the site's snippets legitimately assume. Without the
   reflect-metadata shim every decorator page reports a dozen phantom errors
   for an API that is genuinely there once you install the polyfill. */
const SHIM_NAME = '/cc.shim.d.ts';
const SHIM = `declare namespace Reflect {
  function getMetadata(key: any, target: any, prop?: any): any;
  function getOwnMetadata(key: any, target: any, prop?: any): any;
  function defineMetadata(key: any, value: any, target: any, prop?: any): void;
  function hasMetadata(key: any, target: any, prop?: any): boolean;
  function metadata(key: any, value: any): any;
}
declare namespace JSX { interface IntrinsicElements { [k: string]: any } interface Element {} }
`;
/* Conflict-free on purpose: no java.sql (Date) and no java.awt (List). Unused
   imports are not an error, so a fat list costs nothing. */
const JDK_IMPORTS = [
  'java.util.*', 'java.util.concurrent.*', 'java.util.concurrent.atomic.*',
  'java.util.concurrent.locks.*', 'java.util.function.*', 'java.util.stream.*',
  'java.time.*', 'java.io.*', 'java.nio.file.*', 'java.math.*',
  'java.util.concurrent.StructuredTaskScope.Subtask',
].map((p) => 'import ' + p + ';').join(' ');

/**
 * Type-check each TS block with the real compiler API (in-memory host, strict,
 * lib.dom only when the block touches the DOM) and return the allow-listed
 * diagnostics, minus excused lines. Empty when `typescript` is not installed.
 */
function checkTS(blocks) {
  if (!ts) return [];
  const base0 = {
    noEmit: true, strict: true, target: ts.ScriptTarget.ES2022,
    moduleResolution: ts.ModuleResolutionKind.Bundler, jsx: ts.JsxEmit.React,
    module: ts.ModuleKind.ESNext, skipLibCheck: true, allowJs: false, noResolve: false,
  };
  const found = [];
  for (const b of blocks) {
    const { text, off } = prepTS(b.text);
    /* lib.dom only for blocks that are actually about the DOM. Otherwise its
       globals quietly outrank the page's own types — `type Range = [number,
       number]` declared two blocks earlier loses to the DOM Range, and the gate
       reports a wall of missing methods on code that is perfectly fine. */
    const dom = /\b(document|window|localStorage|sessionStorage|navigator|fetch|HTML\w*Element|addEventListener|querySelector|CustomEvent|MutationObserver|IntersectionObserver|AbortController)\b/.test(text);
    const opts = { ...base0, lib: dom ? ['lib.es2022.d.ts', 'lib.dom.d.ts'] : ['lib.es2022.d.ts'] };
    /* JSX in a .ts file parses as comparison operators, which is how a React
       page reports "Operator '<' cannot be applied to … and 'RegExp'". */
    const jsx = /<\/[A-Za-z]|\/>|return\s*\(?\s*</.test(text);
    const name = jsx ? '/cc.tsx' : '/cc.ts';
    const kind = jsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    const sf = ts.createSourceFile(name, text, ts.ScriptTarget.ES2022, true, kind);
    const shim = ts.createSourceFile(SHIM_NAME, SHIM, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
    const base = ts.createCompilerHost(opts);
    const lib = ts.createProgram({ rootNames: [name, SHIM_NAME], options: opts, host: {
      ...base,
      getSourceFile: (fn, lv) => fn === name ? sf : fn === SHIM_NAME ? shim : base.getSourceFile(fn, lv),
      writeFile: () => {}, fileExists: (fn) => fn === name || fn === SHIM_NAME || ts.sys.fileExists(fn),
      readFile: (fn) => fn === name ? text : fn === SHIM_NAME ? SHIM : ts.sys.readFile(fn),
    } });
    const skip = b.excused || excused(b.text);
    const syn = lib.getSyntacticDiagnostics(sf);
    const sem = lib.getSemanticDiagnostics(sf);
    /* Two blocks whose type errors are never trustworthy:
       — one that does not PARSE (a montage of a call, a bare method and three
         prose comments is not a program, so its inferred types are guesses);
       — one that declares the same name twice, which on this site means a
         before/after contrast, and the second version's call is being checked
         against the first version's signature. */
    const unparsed = syn.length > 0;
    const contrast = sem.some((d) => d.code === 2393 || d.code === 2451 || d.code === 2300);
    for (const d of [...syn, ...(unparsed || contrast ? [] : sem)]) {
      if (!RAW && !TS_REAL.has(d.code) && !(SYNTAX && TS_SYNTAX(d.code))) continue;
      const pos = d.file && d.start != null ? d.file.getLineAndCharacterOfPosition(d.start) : null;
      const line = pos ? pos.line + 1 - off : 0;
      if (!RAW && skip.has(line)) continue;
      const src = (b.text.split('\n')[line - 1] || '').trim();
      const msg = ts.flattenDiagnosticMessageText(d.messageText, ' ');
      /* "Property 'fb' does not exist on ThisComponent" almost always means the
         constructor that injects it is on the page but not in THIS snippet. A
         partial class is the norm here, so `this.` claims are unprovable. */
      if (!RAW && (d.code === 2339 || d.code === 2551) && /\bthis\s*\.\s*\w/.test(src)) continue;
      /* A parameter of type `never` is what a generic looks like when nothing
         could be inferred for it — here because the observable it would have
         flowed from lives in another snippet. The page is not making a claim. */
      if (!RAW && /parameter of type 'never'/.test(msg)) continue;
      /* `new Function(this, 'Handler', …)` is the CDK's Function, not the ES
         one. When a snippet uses a library class that shares its name with a
         built-in global and never declares it, the global is answering. */
      const amb = (src.match(AMBIENT) || [])[1];
      if (!RAW && amb && !new RegExp('\\b(class|interface|type|enum)\\s+' + amb + '\\b').test(b.text)) continue;
      found.push({ ...b, lang: 'ts', code: 'TS' + d.code, line, msg, src });
    }
  }
  return found;
}

/* TypeScript needs the same courtesy Java gets: a bare class member or method
   body is a parse error on its own, and a parse error means ZERO semantic
   diagnostics — the block goes quiet instead of getting checked. `...` is the
   site's elision idiom and is not valid anywhere a value is expected. */
function prepTS(src) {
  let text = src
    .replace(/\(\s*\.\.\.\s*\)/g, '(undefined as any)')
    .replace(/^\s*\.\.\.\s*$/gm, '')
    .replace(/,\s*\.\.\.\s*([,)\]}])/g, '$1');
  const member = /^\s*(@\w+\(|readonly\s|private\s|protected\s|public\s|static\s|constructor\s*\()/m.test(text)
    || /^\s*\w+\s*\([^)]*\)\s*:\s*[\w<>[\]|{} ]+\s*\{/m.test(text);
  const top = /^\s*(import|export|class|interface|type|enum|function|const|let|var|declare)\b/m.test(text);
  if (member && !top) return { text: 'class CC {\n' + text + '\n}\n', off: 1 };
  return { text, off: 0 };
}

/**
 * Compile each Java block with the local javac (wrapped in a class/method as
 * needed, JDK imports added) in a temp dir and return the allow-listed errors,
 * minus excused lines. Empty when javac is not on PATH.
 */
function checkJava(blocks) {
  if (!javac) return [];
  const dir = mkdtempSync(join(tmpdir(), 'devhub-cc-'));
  const found = [];
  try {
    for (const b of blocks) {
      /* A fragment has to be given somewhere to live before javac will look at
         it. Members go straight into a class; loose statements need a method
         around them too. Both wrappers are one line, so reported line numbers
         stay honest against the block once we subtract the offset. */
      const top = /^\s*(package|import)\b/m.test(b.text) || /\b(class|interface|enum|record)\s+\w/.test(b.text);
      const member = /^\s*(@|public|private|protected|static|final|abstract)\b/m.test(b.text);
      /* Without imports EVERY line is "cannot find symbol" and the whole run
         filters to nothing — which is how a preview API with the wrong return
         type sat on a page for months. One line, so the offset stays trivial. */
      const imports = /^\s*(package|import)\b/m.test(b.text) ? '' : JDK_IMPORTS + '\n';
      /* A loose fragment that returns a value needs somewhere for it to go, or
         the wrapper invents an error the page never made. */
      const rets = /\breturn\s+[^;\s]/.test(b.text);
      const wrap = 'class CC { ' + (rets ? 'Object' : 'void') + ' m() throws Exception {\n';
      const head = imports + (top ? '' : member ? 'class CC {\n' : wrap);
      const tail = top ? '' : member ? '\n}\n' : '\n} }\n';
      const off = head ? head.split('\n').length - 1 : 0;
      const file = join(dir, 'CC.java');
      writeFileSync(file, (head + b.text.replace(/\bpublic\s+(class|interface|enum|record)\b/, '$1') + tail), 'utf8');
      let out = '';
      try {
        execFileSync('javac', ['-nowarn', '-proc:none', '--release', '24', '--enable-preview',
          '-d', dir, file], { stdio: ['ignore', 'pipe', 'pipe'] });
      } catch (e) { out = String(e.stderr || '') + String(e.stdout || ''); }
      const skip = b.excused || excused(b.text);
      /* Same rule TypeScript gets: a block that does not PARSE is a montage
         — a class, then three loose lines showing how to call it — and every
         type javac infers inside one is a guess. */
      if (!RAW && /error:\s*(class, interface, enum, or record expected|illegal start|not a statement|<identifier> expected|reached end of file)/i.test(out)) continue;
      /* JDK 24 does not reject "class Foo {…}" followed by two loose usage lines
         — it silently rewrites the file as an implicitly declared class, which
         makes Foo an INNER class and every `new Foo()` in a static method an
         error about an enclosing instance. That is the rewrite talking. */
      if (!RAW && /implicitly declared class/i.test(out)) continue;
      /* Split on CRLF, not on "\n" alone. javac emits Windows line endings and
         JS's "." refuses to match a lone \r, so `(.+)$` matched NOTHING — the gate
         called every Java page clean while javac was shouting at it. */
      for (const line of out.split(/\r?\n/)) {
        const m = line.match(/CC\.java:(\d+):\s*error:\s*(.+)$/);
        if (!m) continue;
        if (!RAW && !JAVA_REAL.test(m[2]) && !(SYNTAX && /expected|illegal|not a statement|reached end of file/i.test(m[2]))) continue;
        const n = +m[1] - off;
        if (!RAW && skip.has(n)) continue;
        const src = (b.text.split('\n')[n - 1] || '').trim();
        /* An annotation the classpath cannot supply resolves to whatever the
           wildcard imports happen to offer — Spring's @EventListener becomes
           java.util.EventListener. That is my import list talking, not the page. */
        if (!RAW && src.startsWith('@')) continue;
        /* A type argument the snippet never wrote — `List<Object>` where the
           page wrote `List<String>` — is javac's error-recovery placeholder
           standing in for a domain type it could not resolve, not a claim
           the page made. */
        if (!RAW && /\bObject\b/.test(m[2]) && !/\bObject\b/.test(b.text)) continue;
        found.push({ ...b, lang: 'java', code: 'javac', line: n, msg: m[2].trim(), src });
      }
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
  return found;
}

/* ── run ───────────────────────────────────────────────────────────────── */

/** CLI entry: extract → classify → compile → print, setting exitCode 1 on findings. */
function main() {
  const files = ONE ? [ONE] : readdirSync(HERE).filter((f) => f.endsWith('.html'));
  const cand = [];
  for (const f of files) {
    let src;
    try { src = readFileSync(existsSync(f) ? f : join(HERE, f), 'utf8'); } catch { continue; }
    for (const b of extract(src, f)) {
      const lang = classify(b.text);
      if (!lang || (LANG && lang !== LANG)) continue;
      cand.push({ ...b, lang, excused: excused(b.text) });
    }
  }
  const nex = cand.reduce((n, b) => n + b.excused.size, 0);

  const nts = cand.filter((b) => b.lang === 'ts').length;
  const njava = cand.filter((b) => b.lang === 'java').length;
  console.log(`code blocks compiled — ${cand.length} (${nts} TypeScript, ${njava} Java) across ${files.length} file(s)`);
  console.log(`  lines excused as deliberate counter-examples (❌): ${nex}`);
  if (!ts) console.log('  ! typescript not installed — TS blocks skipped (npm i --no-save typescript@5.6.3)');
  if (!javac) console.log('  ! javac not on PATH — Java blocks skipped');

  if (COUNTER) {
    console.log('\nexcused lines (verify each is MEANT to fail):');
    for (const b of cand) for (const n of [...b.excused].sort((x, y) => x - y)) {
      const src = (b.text.split('\n')[n - 1] || '').trim();
      if (src) console.log(`  ${b.file}  ${b.kind} L${n}  ${src.slice(0, 76)}`);
    }
  }
  if (LIST) {
    console.log('');
    for (const b of cand) console.log(`  ${b.file}  ${b.lang}/${b.kind}  ${b.text.split('\n')[0].slice(0, 78)}`);
    return;
  }

  const found = [
    ...checkTS(cand.filter((b) => b.lang === 'ts')),
    ...checkJava(cand.filter((b) => b.lang === 'java')),
  ];
  const byFile = new Map();
  for (const d of found) { if (!byFile.has(d.file)) byFile.set(d.file, []); byFile.get(d.file).push(d); }

  console.log(`\n  blocks with a real error: ${new Set(found.map((d) => d.file + ':' + d.at)).size}` +
              `  in ${byFile.size} file(s)  (${found.length} diagnostic(s))\n`);
  let shown = 0;
  for (const [f, ds] of [...byFile.entries()].sort((a, b) => b[1].length - a[1].length)) {
    if (!ALL && shown >= 40) { console.log(`  … and ${byFile.size - shown} more file(s) (--all)`); break; }
    console.log(`  ${f}`);
    for (const d of ds.slice(0, ALL ? 99 : 4))
      console.log(`      ${d.kind} L${d.line} ${d.code}: ${d.msg}` + (d.src ? `\n          ${d.src}` : ''));
    if (!ALL && ds.length > 4) console.log(`      … ${ds.length - 4} more`);
    shown++;
  }
  if (!found.length) console.log('  clean — nothing provably wrong. (Not the same as "correct".)');
  process.exitCode = found.length ? 1 : 0;
}

/* Importing this file must NOT scan the site — that is a two-minute hang. */
if ((process.argv[1] || '').replace(/\\/g, '/').endsWith('tmp_codecheck.mjs')) main();
