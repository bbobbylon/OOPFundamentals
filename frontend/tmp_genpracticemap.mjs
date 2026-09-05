/* tmp_genpracticemap.mjs — regenerate the lesson → practice map.
 *
 *   node tmp_genpracticemap.mjs           # rewrite the block in tracks-data.js
 *   node tmp_genpracticemap.mjs --check   # exit 1 if the committed block is stale
 *
 * WHY THIS IS GENERATED. The exam and practice banks already say which lesson
 * each question came from (`ref: { label, file }` — 560 refs across 19 exams,
 * 54 more across the practice pages). That edge only ever pointed one way:
 * practice knew its lesson, a lesson knew nothing about its practice, so only
 * 2 of 465 lesson pages linked forward to any recall at all. This inverts it.
 *
 * Hand-maintaining the inverse would drift the first time someone edits a bank,
 * and the failure would be silent — a lesson quietly losing its "Test yourself"
 * strip. So it is derived, and --check runs in the gate suite.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CHECK = process.argv.includes('--check');
const START = '/* ==== GENERATED: lesson → practice map (tmp_genpracticemap.mjs) ==== */';
const END   = '/* ==== END GENERATED ==== */';

const REF = /ref\s*:\s*\{(.*?)\}/gs;
const KV  = /(\w+)\s*:\s*['"]([^'"]*)['"]/g;

const files = readdirSync(HERE)
  .filter(f => /^(exam|practice)-.*\.html$/.test(f))
  .sort();

const map = {};                 // lesson -> { exam?, practice? }
const titles = {};              // bank file -> short human title
let refs = 0; const broken = [];

for (const f of files) {
  const src = readFileSync(join(HERE, f), 'utf8');
  const t = src.match(/<title>([^<]*)<\/title>/);
  titles[f] = (t ? t[1] : f).split('—')[0].split('·')[0].replace(/\s*\|\s*.*$/, '').trim();
  const kind = f.startsWith('exam-') ? 'exam' : 'practice';
  for (const m of src.matchAll(REF)) {
    const d = Object.fromEntries([...m[1].matchAll(KV)].map(p => [p[1], p[2]]));
    if (!d.file) continue;
    refs++;
    if (!existsSync(join(HERE, d.file))) { broken.push(`${f} -> ${d.file}`); continue; }
    (map[d.file] ||= {});
    map[d.file][kind] ||= f;                    // first bank wins; lessons rarely span two
  }
}

if (broken.length) {
  console.error(`✗ ${broken.length} ref(s) point at a file that does not exist:`);
  broken.slice(0, 10).forEach(b => console.error('   ' + b));
  process.exit(1);
}

/* Only emit titles the map actually cites, so the block does not carry dead weight. */
const cited = new Set(Object.values(map).flatMap(v => Object.values(v)));
const usedTitles = Object.fromEntries(Object.entries(titles).filter(([k]) => cited.has(k)));

const block = [
  START,
  '/* Derived from the banks by tmp_genpracticemap.mjs — do not hand-edit; run the',
  '   generator instead. `node tmp_genpracticemap.mjs --check` fails if this is stale. */',
  'window.DEVHUB_PRACTICE = ' + JSON.stringify({ titles: usedTitles, map }, null, 0) + ';',
  END,
].join('\n');

const tdPath = join(HERE, 'tracks-data.js');
const td = readFileSync(tdPath, 'utf8');
const has = td.includes(START) && td.includes(END);
const next = has
  ? td.slice(0, td.indexOf(START)) + block + td.slice(td.indexOf(END) + END.length)
  : td.trimEnd() + '\n\n' + block + '\n';

const lessons = Object.keys(map).length;
if (CHECK) {
  if (next === td) { console.log(`✓ practice map is current — ${lessons} lessons, ${refs} refs`); process.exit(0); }
  console.error('✗ practice map in tracks-data.js is STALE — run: node tmp_genpracticemap.mjs');
  process.exit(1);
}
writeFileSync(tdPath, next);
console.log(`✓ wrote practice map — ${lessons} lessons from ${refs} refs across ${files.length} banks`);
