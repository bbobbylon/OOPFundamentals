/* ============================================================================
 * tmp_java_verify.mjs — offline gold-standard check of the Java grading layer.
 *
 * WHAT QUESTION IT ANSWERS
 *   "If a learner types the right answer, does the grader agree?" Java is the
 *   one runtime we cannot test by eye: it compiles in the browser through
 *   CheerpJ, so a harness bug looks exactly like a wrong answer, and the
 *   learner is the one who pays. This runs the same grading path offline
 *   against known-correct solutions, where a mismatch can only be our fault.
 *
 * HOW TO RUN
 *   node tmp_java_verify.mjs        every exercise; exit 1 on any mismatch
 *   Needs a local `javac` on PATH. Missing javac = SKIP, not fail.
 *
 * WHAT IT CHECKS
 *   For every practice exercise: generate Harness.java with the ENGINE'S OWN
 *   buildJavaHarness (imported from devhub-codegrade.js, not a copy — a copy
 *   would drift and start proving the wrong thing), compile the reference
 *   solution from tmp_java_data.mjs with the local javac, run it, and grade the
 *   sentinel output exactly the way the page will (deepEq + the unordered sort
 *   mirror). Any mismatch = the browser would fail the same way.
 *
 * WHAT A FAILURE MEANS
 *   The harness, the expected values, or the reference solution disagree — and
 *   since the solution is known good, suspect the first two. A learner hitting
 *   this sees "your correct code is wrong", the worst failure this repo can
 *   ship.
 *
 * WHAT IT CANNOT SEE
 *   The actual browser. It grades with the local JDK; the page grades with
 *   CheerpJ, which is JAVA 8 ONLY and runs threads cooperatively. Code that
 *   passes here can still fail in the page by using a Java 9+ API (`List.of`,
 *   `var` in a lambda) or by relying on real parallelism — and a modern local
 *   javac will happily compile exactly that. Passing here is necessary, not
 *   sufficient.
 *   It only ever runs the REFERENCE solution, so it cannot see a test suite
 *   that accepts wrong answers: an exercise with no negative cases passes
 *   every run. Nor can it see an exercise missing from tmp_java_data.mjs —
 *   absent entries are not checked, they are simply not there.
 * ========================================================================== */
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
