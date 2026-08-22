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

## Done — Debugging track: "Debug Like a Pro" toolbox page (requested 2026-08-20, completed 2026-08-21)

Built `frontend/debugging-pro-toolbox-visualizer.html` and registered it under the Debugging
track's "Technique & Stack Traces" section in `frontend/app.html`, alongside
`debugging-method-visualizer.html`. Covers the professional toolbox the existing three Debugging
pages didn't: `git bisect` as a CLI workflow, conditional breakpoints/watch expressions,
logpoints, correlation-ID/structured logging tied to this codebase's Angular → Spring filter
chain → JDBC request flow, and thread/heap dumps for hangs vs. leaks. Explicitly cross-links to
(rather than re-teaches) `debugging-method-visualizer.html` and
`debugging-logging-vs-stepping-visualizer.html`. Ships the full "extreme visualization" standard:
intro card, a 4-scenario animated `rt-ctlbar`/`rt-stage` walk (git bisect narrowing 50 commits →
conditional breakpoint on iteration 47 → logpoint threading a correlation ID across 3 layers →
thread dump revealing a deadlock), an axis-comparison table, and a `DevHubCodeWalk` line-by-line
walkthrough of a `CorrelationIdFilter`. Page/track counts updated in `README.md` and
`docs/DEVHUB-GUIDE.md` (454 pages / 29 tracks).

---

## Done — Exam quality pass #2: why[] coverage (requested 2026-08-20, completed 2026-08-21)

Bobby's original complaint ("I just picked the choice with the longest amount of text") drove an
earlier fix pass — the length-bracket + plausible-distractor technique documented in
[[project_exam_quality_standard]] and `frontend/tmp_examtell_audit.mjs`. A follow-up audit found
it was only partially applied (5 of 15 banks passing) and that WHY COVERAGE (a per-option `why[]`
shown after answering and in the post-exam review — already fully supported by
`frontend/devhub-quiz.js`, so this was pure content work, zero engine work) was missing on 87% of
all questions across every bank.

All 15 banks now pass `node tmp_examtell_audit.mjs` (run from `frontend/`) clean — 426 questions,
0 egregious flags, no length/position/why-coverage tells anywhere. Re-run that script after any
future edits to an exam bank's `choices`/`answer`/`why` fields to confirm it stays clean.

---

## Planned — spot-check "every concept needs 10x more depth" beyond Angular

**Spot-checked for Angular specifically already; looks resolved there.**
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
