import { readFileSync } from 'node:fs';

// Usage: node tmp_check_viz.mjs <file.html>
// 1) parse-checks every <script> block, 2) extracts HDR/SCEN object literals
// (string-aware balanced braces) and cross-checks all references.
const file = process.argv[2];
const html = readFileSync(file, 'utf8');

let errors = 0;
const fail = (m) => { errors++; console.log('  FAIL ' + m); };

// -- 1. parse every script block ------------------------------------------
const re = /<script>([\s\S]*?)<\/script>/g;
let m, i = 0;
while ((m = re.exec(html))) {
  i++;
  try { new Function(m[1]); } catch (e) { fail(`script #${i}: ${e.message}`); }
}
console.log(`scripts parsed: ${i}`);

// -- 2. extract + cross-check SCEN/HDR (skip if page has none) -------------
function extractObj(src, name) {
  const start = src.indexOf('const ' + name + '=');
  if (start < 0) return null;
  let j = src.indexOf('{', start);
  const objStart = j;
  let depth = 0, q = null;
  for (; j < src.length; j++) {
    const c = src[j], p = src[j - 1];
    if (q) { if (c === q && p !== '\\') q = null; continue; }
    if (c === "'" || c === '"' || c === '`') { q = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { j++; break; } }
  }
  return eval('(' + src.slice(objStart, j) + ')');
}

const HDR = extractObj(html, 'HDR');
const SCEN = extractObj(html, 'SCEN');
if (!HDR || !SCEN) {
  console.log('no HDR/SCEN found — parse check only');
  process.exit(errors ? 1 : 0);
}

const cssWho = new Set([...html.matchAll(/\.who-([A-Z]+)\s*[,{]/g)].map(x => x[1]));
console.log('scenarios:', Object.keys(SCEN).join(', '));
console.log('HDR views:', Object.keys(HDR).length, '| CSS who-roles:', [...cssWho].join(','));

for (const [key, s] of Object.entries(SCEN)) {
  const nodeIds = new Set(s.nodes.map(n => n.id));
  if (!s.req || !s.intro || !s.result?.text) fail(`${key}: missing req/intro/result`);
  if (!nodeIds.has(s.steps[0].node)) fail(`${key}: steps[0].node "${s.steps[0].node}" not in nodes`);
  for (const n of s.nodes) {
    if (!cssWho.has(n.who)) fail(`${key}: node "${n.id}" who="${n.who}" has no .who-${n.who} CSS`);
  }
  for (const st of s.steps) {
    if (!nodeIds.has(st.node)) fail(`${key}: step node "${st.node}" not in nodes`);
    if (!(st.view in HDR)) fail(`${key}: step view "${st.view}" not in HDR`);
    if (st.tone && st.tone !== 'ok' && st.tone !== 'bad') fail(`${key}: tone "${st.tone}" invalid`);
  }
  console.log(`  ok ${key}: ${s.nodes.length} nodes, ${s.steps.length} steps`);
}
// unused HDR views are a smell, not an error
const used = new Set(Object.values(SCEN).flatMap(s => s.steps.map(st => st.view)));
const unused = Object.keys(HDR).filter(k => !used.has(k));
if (unused.length) console.log('  note: unused HDR views: ' + unused.join(','));

console.log(errors ? `FAILED: ${errors} error(s)` : 'ALL CHECKS PASSED');
process.exit(errors ? 1 : 0);
