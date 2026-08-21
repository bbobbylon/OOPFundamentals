# DevHub Roadmap

A running todo/future-enhancements list for the Dev Learning Hub (`frontend/app.html`).
This is planning, not documentation of what exists today — see
[DEVHUB-GUIDE.md](DEVHUB-GUIDE.md) for the current, accurate map of tracks and pages.

When an item here gets built: register it in `TRACKS` in `frontend/app.html`, update the
page/track counts in `README.md` and `DEVHUB-GUIDE.md`, then delete the item from this file
(git history keeps the record — this file should only ever describe what's *not* done yet).

---

## Done — Database/AWS/DSA depth pass (started 2026-08-20, completed 2026-08-21)

Bobby asked to "solidify the concepts for database and aws/infrastructure... and make sure
data structures and algorithms are also sound/solid." An audit of all three tracks found content
gaps; all 10 pages below are now built, registered in `TRACKS`, and counted in `README.md` +
`DEVHUB-GUIDE.md` (453 pages / 29 tracks):
- `sql-replication-visualizer.html`, `sql-partitioning-visualizer.html` — SQL & Databases,
  Advanced section.
- `aws-api-gateway-visualizer.html`, `aws-load-balancing-visualizer.html` — Cloud — AWS, AWS
  section.
- `aws-compute-decision-visualizer.html`, `aws-storage-deep-visualizer.html`,
  `aws-iac-visualizer.html`, `aws-cost-visualizer.html` — Cloud — AWS, new "Architecture &
  Operations" section.
- `ds-two-pointer-sliding-window-visualizer.html`, `ds-backtracking-visualizer.html` — Data
  Structures & Algorithms, Algorithms section (backtracking is cross-linked from
  `recursion-visualizer.html`).

**Lower-priority backlog from the same audit** (content is fine, this is a polish/consistency
pass, not a content gap):
- Retrofit the animated `rt-ctlbar`/`rt-stage` scenario-walk + live-inspector pattern onto the
  9 existing AWS pages (all have intro cards + code walkthroughs already, just predate the
  newer interaction pattern). `aws-vpc-visualizer.html` is the worst offender — zero
  interactivity today. Priority order: VPC → IAM → Lambda → EC2/ECS/RDS/S3/CloudWatch → Overview.
- Same retrofit for the 17 (of 18) Data Structures & Algorithms pages still on the older
  SVG/canvas-driven interaction style — highest-traffic first: `graph-visualizer.html`,
  `bst-visualizer.html`, `sorting-visualizer.html` (has partial `rt-*` markup already, finish
  it), `ds-dynamic-programming-visualizer.html`.
- `exam-sql.html` (24 Q) doesn't test anything from `sql-postgres-visualizer.html` (JSONB,
  connection pooling, VACUUM) — add a domain once the replication/partitioning pages above are
  registered.
- `exam-aws-developer.html` mislabels its domains against the real DVA-C02 exam guide (uses
  service-based tags instead of Development/Security/Deployment/Troubleshooting) and has no
  real Deployment or Troubleshooting & Optimization coverage — only 24 questions vs the other
  two AWS banks' 37–41.
- `flashcards-bigo.html` has no cards for two-pointer/sliding-window or backtracking once those
  pages exist.

---

## Planned — Debugging track

### "Debug Like a Pro" — new page, `frontend/debugging-*-visualizer.html`

Requested 2026-08-20. The existing 🐛 Debugging track covers CORS/401-vs-403/JWT failures
(stack-specific gotchas), `debugging-method-visualizer.html` (the scientific method: reproduce →
hypothesize → bisect), `debugging-stack-traces-visualizer.html` (reading a trace), and
`debugging-logging-vs-stepping-visualizer.html` (log vs debugger, as a choice). None of those
cover the professional *toolbox* — the techniques a debugger reaches for once "add a print
statement" and "step through it" stop being enough. That's this page's actual scope, and it
needs to explicitly NOT re-teach the scientific method or the log-vs-debugger tradeoff — cross-link
to those two pages instead of repeating them.

**Suggested content (verify against the two pages above before writing, to avoid overlap):**
- **`git bisect`** as an actual CLI workflow — binary-searching commit history to find a
  regression, not just the abstract "bisect" concept the method page already names.
- **Debugger mastery beyond stepping** — conditional breakpoints, watch expressions, logpoints
  (breakpoints that log without halting execution) — the difference between "I have a
  debugger open" and using one efficiently.
- **Production debugging without a debugger** — structured logging, correlation/trace IDs
  threaded across service calls (ties directly into this codebase's CIAM request flow —
  Angular → Spring filter chain → JDBC), distributed tracing.
- **Reproducing flaky/intermittent bugs** — minimal repro construction, hunting race
  conditions, why "works on my machine" often means a timing or environment assumption, not
  a code bug.
- **Tools beyond print/debugger** — profilers (CPU/memory), heap and thread dumps
  (`jstack`/`jconsole` for the Java side of this stack), browser DevTools Performance/Memory
  tabs for the Angular side.
- **Asking for help well** — rubber-duck debugging and what actually belongs in a good bug
  report (minimal repro, expected vs actual, what's already been ruled out) — a soft-skill
  that's still part of debugging "like a pro."

A reasonable 4-scenario animated walk: ① `git bisect` narrowing 50 commits down to the one that
broke a test ② a conditional breakpoint stopping only on the 47th iteration instead of the first
③ a logpoint threading a correlation ID through 3 services to trace one failing request ④ a
thread dump revealing two requests deadlocked on the same lock — the kind of bug a debugger
alone can't catch because nothing is "stepping" at the moment it happens.

Once built: register under the Debugging track's existing "Technique & Stack Traces" section in
`frontend/app.html`, alongside `debugging-method-visualizer.html`.

---

## Planned — Exam quality pass #2: why[] coverage (requested 2026-08-20, queued after the above)

Bobby's original complaint ("I just picked the choice with the longest amount of text") drove an
earlier fix pass — the length-bracket + plausible-distractor technique documented in
[[project_exam_quality_standard]] and `frontend/tmp_examtell_audit.mjs`. **Re-ran the audit today
to see where that pass actually landed.** Verdict: partially done, and the part that's NOT done is
now the dominant problem — bigger than the original guessability issue.

**Run `node tmp_examtell_audit.mjs` from `frontend/` to reproduce.** Current results, 15 exam
banks / 426 questions total (`exam-readiness.html` is the dashboard, not a bank, so it's excluded):

- **5 banks already pass both LENGTH TELL and POSITION TELL** — the length-bracket fix holds:
  `exam-angular.html`, `exam-aws-developer.html`, `exam-aws-practitioner.html`,
  `exam-aws-sa-associate.html`, `exam-http-rest.html`. Confirms `exam-http-rest.html` (the known
  original pilot) has NOT regressed.
- **10 banks still have the original, severe length tell** — correct answer is the longest option
  55–95% of the time (chance is 25%), mean length-rank 3.17–3.95 out of 4 (2.50 = unbiased):
  `exam-azure-developer.html` (86%), `exam-docker.html` (76%), `exam-dsa-interview.html` (80%),
  `exam-git.html` (75%), `exam-identity-access.html` (78%), `exam-java-ocp.html` (55%),
  `exam-kubernetes.html` (95%), `exam-spring-professional.html` (83%), `exam-sql.html` (75%),
  `exam-typescript.html` (80%). These need the same length-bracket + plausible-distractor
  treatment already proven on the 5 passing banks — same recipe, just not applied yet.
- **WHY COVERAGE fails on all 15 of 15 banks, including the 5 that already pass the tells.**
  371 of 426 questions (87%) have no per-option `why[]` at all. Worst: `exam-dsa-interview.html`
  (40/40, zero coverage) and `exam-aws-developer.html` (24/24, zero coverage). Best of a bad set:
  `exam-angular.html` still missing 22/27, `exam-http-rest.html` missing 16/21.
  **The rendering engine already fully supports this** — confirmed in `frontend/devhub-quiz.js`:
  `why[]` is shuffled in lockstep with choices (`order.map(i => q.why[i])`), shown inline after
  answering (`.dq-why`, ✓/✗ styled) AND in the post-exam review screen (`.dq-rev-why`). This is
  pure content work, zero engine work — Bobby's "review under each question as to why one was
  right and the others wrong" ask is *already built*, just starved of data on every bank.

**Why this order matters:** fixing WHY COVERAGE on a bank is the same editing pass as fixing its
LENGTH TELL (both mean rewriting every question's options), so do them together per-bank rather
than as two separate passes. Suggested order: the 10 length-tell banks first (bigger fix, do the
why[] at the same time since you're already in the file), then backfill why[] on the 5
already-passing banks. Re-run the audit after each bank to confirm before moving to the next —
don't batch-fix all 15 blind.

**"Every concept needs 10x more depth" — spot-checked, looks resolved for Angular specifically.**
The Angular track is not "one page" — it's 47 pages across 7 sections (Fundamentals, Routing,
Forms, State & Reactivity, HTTP & Performance, Auth & Identity, Templates & UI). Spot-checked
`angular-signals-visualizer.html`, `angular-directives-visualizer.html`,
`angular-pipes-visualizer.html`: each is ~970–990 lines, has 8 intro-card elements, a
`DevHubCodeWalk` line-by-line walkthrough, and the full `rt-ctlbar`/`rt-stage` animated
scenario-walk system — the current sitewide "extreme visualization" standard, not a thin
one-pager. This complaint was likely accurate when Bobby originally raised it in an earlier
session, before the depth-building rounds logged in [[project_next_build_plan]] and
[[project_visualizer_state]] landed. **Before closing this out, spot-check 2-3 pages each in a
couple of other tracks** (not just Angular) the same way, since Bobby's ask was "EVERY concept,"
not Angular-specific — but on current evidence this sub-item may already be done, not a new build
task.
