// tmp_java_verify.mjs — offline gold-standard check of the Java grading layer.
// For every practice exercise: generate Harness.java with the ENGINE'S OWN
// buildJavaHarness (imported from devhub-codegrade.js, not a copy), compile the
// reference solution from tmp_java_data.mjs with the local javac, run it, and
// grade the sentinel output exactly the way the page will (deepEq + the
// unordered sort mirror). Any mismatch = the browser would fail the same way.
import { readFileSync, readdirSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { execFileSync } from 'child_process';
import { join } from 'path';
import { tmpdir } from 'os';
import { JAVA } from './tmp_java_data.mjs';

globalThis.window = globalThis;
(0, eval)(readFileSync('./devhub-codegrade.js', 'utf8'));
const { buildJavaHarness, JAVA_NODES_SRC, deepEq } = globalThis.DevHubCodeGrade.__test;

const work = join(tmpdir(), 'dlh-java-verify');
rmSync(work, { recursive: true, force: true });
mkdirSync(work, { recursive: true });

let pass = 0, fail = 0;
const pages = readdirSync('.').filter(f => /^practice-.*\.html$/.test(f));
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const m = html.match(/DevHubCodeGrade\.render\([^,]+,\s*(\{[\s\S]*?\})\s*\);\s*<\/script>/);
  const bank = (0, eval)('(' + m[1] + ')');
  for (const ex of bank.exercises) {
    const jd = JAVA[ex.id];
    if (!jd) { console.log('FAIL ' + ex.id + ': no Java data authored'); fail++; continue; }
    const merged = { ...ex, functionName: { ...ex.functionName, java: jd.fn }, javaTypes: jd.types };
    const dir = join(work, ex.id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'Solution.java'), jd.ref);
    writeFileSync(join(dir, 'Nodes.java'), JAVA_NODES_SRC);
    let harness;
    try { harness = buildJavaHarness(merged); }
    catch (e) { console.log('FAIL ' + ex.id + ': harness generation threw: ' + e.message); fail++; continue; }
    writeFileSync(join(dir, 'Harness.java'), harness);
    let stdout;
    try {
      execFileSync('javac', ['-d', dir, join(dir, 'Solution.java'), join(dir, 'Nodes.java'), join(dir, 'Harness.java')], { stdio: 'pipe' });
      stdout = execFileSync('java', ['-cp', dir, 'Harness'], { stdio: 'pipe' }).toString();
    } catch (e) {
      console.log('FAIL ' + ex.id + ': ' + (e.stderr ? e.stderr.toString().slice(0, 500) : e.message));
      fail++; continue;
    }
    const lines = stdout.split('\n').filter(l => l.startsWith('@@CG@@'));
    if (lines.length !== ex.tests.length) {
      console.log('FAIL ' + ex.id + ': expected ' + ex.tests.length + ' results, got ' + lines.length);
      fail++; continue;
    }
    let bad = false;
    lines.forEach((l, i) => {
      const r = JSON.parse(l.slice(6));
      const t = ex.tests[i];
      let ok;
      if ('error' in r) ok = false;
      else if (t.unordered && Array.isArray(r.got) && Array.isArray(t.expected))
        ok = deepEq(r.got.slice().sort(), t.expected.slice().sort());
      else ok = deepEq(r.got, t.expected);
      if (!ok) {
        console.log('FAIL ' + ex.id + ' test ' + (i + 1) + ': expected ' + JSON.stringify(t.expected) + ' got ' + JSON.stringify(r.error !== undefined ? r.error : r.got));
        bad = true;
      }
    });
    if (bad) fail++; else { pass++; console.log('ok   ' + ex.id + ' (' + ex.tests.length + ' tests)'); }
  }
}
console.log('\n' + pass + ' passed, ' + fail + ' failed of ' + (pass + fail));
process.exit(fail ? 1 : 0);
