CODEX: model=gpt-5.6-sol effort=high
# lane-a-f1426-2-repair-the-concurrency-harness-contract — the harness accepts a subject shape it can never satisfy, and cannot refuse an arm that measures nothing (F-1426-2 + F-1426-1)
FIRE-AUTHORED s1426 (attended review welcome)
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.

WHY (F-1426-1 + F-1426-2, measured s1426 while draining `f1424-4`; every coordinate below was re-read from the file, not inherited):

`scripts/concurrency-class-rate.mjs` is the house instrument for matched-arm concurrency rates. s1425 pointed it at a whole spec file, as its master required. It aborted on the first run with `executions=10/2` and produced no measurement. **The abort was correct behaviour on a broken contract, and the broken contract is the instrument's own.**

**DEFECT 1 (F-1426-2) — the accept-path and the assert-path disagree about what a subject is.**
- `normalizeSubject` (`:121-126`) tests `/^[^/]+\.spec\.ts(?::\d+)?$/`. The `(?::\d+)?` makes the line number **optional**, so a bare file such as `e2e/town-t5-townsfolk.spec.ts` is **accepted** at the door.
- `collectExecutions` (`:162`) builds every observed key as `` `${normalizeSubject(spec.file ?? suite.file)}:${spec.line}` `` — **unconditionally line-qualified**.
- `assertComplete` (`:183-186`) compares that set against `subjects.flatMap(...)` built from the **raw** subject strings.

So for a bare-file subject, `missing` is both bare keys, `extras` is every line-qualified row, and it throws — deterministically, on the first run, forever. There is no input for which a bare-file subject can succeed.

**AND ITS OWN SELF-TEST CANNOT SEE THIS.** `--self-test` passes today and still passed on the merged tree at drain time. Its fixture (`:304`) asserts `assertComplete(executions, ['e2e/a.spec.ts:4'])` — a `file:line` subject only. **A green self-test certified an instrument that could not perform the job it was pointed at.** Closing that coverage gap is as much the deliverable as the fix.

**DEFECT 2 (F-1426-1) — the instrument cannot refuse an arm that measures nothing.**
`playwright.config.ts` contains **no `fullyParallel` key** (verify yourself: `grep -c fullyParallel playwright.config.ts` → `0`), so Playwright's default `fullyParallel: false` applies and **parallelism is per-FILE, not per-test**. One spec file × two projects = **2 schedulable jobs**, so a run against a single spec file obtains **M=2 whatever `--workers` says**.

That is what s1425 measured without recognising it: the lane's bare-default probe printed `Running 10 tests using 2 workers`, and the master had chosen the whole spec file *specifically* to escape this trap, reasoning that a single-test subject *"would cap real concurrency at 2 regardless of the flag and silently measure nothing"*. **The whole file caps at 2 for the same reason a `file:line` does.**

⚠️ **THE DANGEROUS CASE IS THE ONE THAT COMPLETES.** Had defect 1 not aborted the run, a `1,2,6` sweep would have obtained 1, 2, 2 — the two upper arms being **identical runs wearing different labels** — and written a clean rate table reporting a NULL indistinguishable from a real negative result. The instrument must refuse that arm, not serve it.

READ-FIRST (paths — open each one, do not work from this summary):
- `scripts/concurrency-class-rate.mjs` — all 308 lines, and specifically `:108` + `:121-126` (parse + normalise), `:155` (the `[...new Set(...)]` dedup), `:162` (the line-qualified key), `:183-186` (`assertComplete`), `:189+` (`rates`), and the `--self-test` block at `:280-307`.
- `playwright.config.ts` — confirm `fullyParallel` is absent and read the `projects:` array to see that there are exactly two projects.
- `reviews/f1424-4-lane-shell-worker-arms.md` — the full finding. Cite BY CONTENT per F-1310-1: grep `The whole file caps at 2 for the same reason a` (expect 1) and `deterministically, on the first run, forever` (expect 1).
- `tasks/BACKLOG.md` finding **F-1426-2**: grep `A SUBJECT SHAPE AT THE DOOR THAT IT CAN NEVER SATISFY AT THE ASSERT` (expect 1).
ⓘ This lane was verified current with main by s1426 before dispatch (`lane-usable.mjs lane-a --cure`, then `main..lane/m3` EMPTY), and all three greps were verified to return 1 **on main and in this lane** before the queue copy. **If any grep returns 0, STOP and report — the lane drifted after dispatch and the premise needs re-checking.**

PRE-FLIGHT (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, any `.png` — are NEVER "work" and NEVER a STOP. Discard them and PROCEED, listing what you discarded.**
> **FACTORY-CHURN EXCEPTION (F-1407-1) — ALWAYS EXPECTED, NEVER A STOP; list them and proceed:** `logs/**` (`factory-usage.json`, `usage-history.jsonl`, `task-stats.jsonl`, `dashboard.html`, `.goal-tree.html`, `.blocked-seen`) and `artifacts/**` / `reviews/shots-*` / any `.png`. What still STOPs, unchanged: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.
Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

SCOPE (each item separately checkable):

1. **MAKE A BARE-FILE SUBJECT WORK — DO NOT REJECT IT.** Repair `assertComplete` so a subject with no `:line` means *"every test in this file"*: for each bare subject and each project, require **at least one** execution whose subject is that file plus any line, and treat all such rows as expected rather than as `extras`. A `file:line` subject keeps its present exact-match meaning, unchanged.
   ⚠️ **Rejecting bare subjects at `parseArgs` is the WRONG fix and is forbidden**, because the successor measurement (see scope 5) *requires* multi-file subjects — that is the whole point of F-1426-1. If you believe bare subjects should be refused, STOP and report instead of implementing it.
   ⓘ `collectExecutions` keeps emitting **line-qualified** keys, and `rates()` keeps grouping by them — per-test rates within a file are a feature, not a bug. Do not flatten them to the file.

2. **REFUSE AN ARM THAT CANNOT VARY.** Before any Playwright run, compute the schedulable-job ceiling and refuse arms above it:
   `ceiling = (number of DISTINCT FILES among the subjects) × (number of PROJECTS)`
   — distinct **files**, so two `file:line` subjects in the same file still count once, because `fullyParallel: false` schedules per file. If any requested `--workers` arm exceeds `ceiling`, **throw before starting the server**, with a message naming the ceiling, the offending arm(s), and the reason (*arms above the ceiling are identical runs wearing different labels*).
   ⓘ **State the assumption in a comment at the check**: this ceiling is correct while `playwright.config.ts` leaves `fullyParallel` unset/false. If it were ever set true, this check becomes **conservative** — it would refuse some legitimate arms. That is the safe direction (it stops rather than silently measuring nothing) and is accepted deliberately. **Do not** import or parse `playwright.config.ts` to make it adaptive; that coupling is not worth it.

3. **CLOSE THE SELF-TEST'S COVERAGE GAP — BOTH DIRECTIONS, AND PROVE EACH RED FIRST.** Extend the inline `--self-test` so it covers what it structurally could not see:
   (a) a **bare-file** subject over a multi-test fixture now passes `assertComplete` (the arm that is red today);
   (b) a `file:line` subject still behaves exactly as before — the no-regression control;
   (c) a genuinely incomplete run (a missing project, or a subject that produced no rows) still **throws** — the guard must not have been widened into uselessness;
   (d) an arm above the ceiling throws, and an arm at or below it does not.
   **ACCEPTANCE IS A MANUFACTURED RED, NOT A RUN COUNT (s1299/s1300 standard):** for (a) and (d), show the assertion FAILING against the pre-fix code and passing after. A green that never executed its violation path is not evidence about the red. Paste both arms in your report.

4. **DO NOT MEASURE ANYTHING.** This task repairs an instrument; it does not use it. Run no arm sweep, start no long Playwright session, write no rate table, and touch `logs/suite-red-inventory.md` **not at all**. The measurement is a separate master (scope 5) and running it here would land an unreviewed instrument and its output in one commit.

5. **LEAVE THE SUCCESSOR A NOTE, IN THE SCRIPT'S OWN HEADER.** Add a short comment block at the top of `scripts/concurrency-class-rate.mjs` recording, for whoever runs the F-1424-4 measurement next: that `fullyParallel` is unset so the ceiling is files×projects; that reaching a 6-worker arm therefore needs **≥3 spec files** (3 × 2 projects = 6); and that repeated arms **cannot** be expressed via `--workers` because `:155` de-duplicates them (F-1426-3) — use `--runs`. Keep it to a few lines, in the file's existing comment voice.

FIREWALL:
TOUCH-ONLY: `scripts/concurrency-class-rate.mjs` (the fix, the ceiling check, the extended self-test and the header note all live in this one file).
NO — do not create, edit or delete any of:
- `playwright.config.ts` — §3.1 forbids touching `workers` there, and `scripts/fire-shell-serialisation.test.mjs` asserts BOTH directions; a flat `workers: 1` would tax every lane. **Adding `fullyParallel` is equally forbidden here** — that is a repo-wide scheduling change, not an instrument repair.
- `e2e/**` (in particular `e2e/town-t5-townsfolk.spec.ts` — editing the subject destroys the measurement it exists to serve), `src/**`, `logs/**`, `tasks/**`, `reviews/**`, `package.json`.
- Do not add an npm script (that would be a new un-rooted gate and reds `gate-caller-audit`); `--self-test` is invoked as it is today.
- Do not use `--repeat-each` anywhere, and do not add a flag for it: it shares one process and worker pool and would change the quantity the successor measures.

SELF-CHECK (name the exact commands and paste real output):
- `npx tsc --noEmit` → 0 errors. `npm run build` → green.
- `node scripts/concurrency-class-rate.mjs --self-test` → passes, and the output shows the new arms running.
- `node --test scripts/goal-tracker.test.mjs scripts/gate-caller-audit.test.mjs` → green (proves no gate topology drift).
- `git diff --stat` vs the lane base shows **exactly one file changed**.
- `git diff` on `playwright.config.ts`, `e2e/` and `src/` → **EMPTY** (paste the empty result).
- The manufactured-red evidence from scope 3, both arms.
- No Playwright browser run is required for this task; do not run one.

READY-FOR-GATES + report: the two manufactured reds and their greens; the exact `assertComplete` rule you implemented for bare subjects; the ceiling formula and the arms it refuses; confirmation that `collectExecutions` and `rates()` keying are unchanged; and the `grep -c fullyParallel playwright.config.ts` result you observed.
