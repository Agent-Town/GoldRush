CODEX: model=gpt-5.6-sol effort=high
# lane-a-f1424-4-worker-arm-rates — the lane-shell worker-arm rate for town-t5 approach-barks, on a multi-file subject that can actually vary (F-1424-4, successor)
FIRE-AUTHORED s1519 (attended review welcome)
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.

WHY (F-1424-4, open since s1425; its two blockers are now SHIPPED and re-measured green on main this fire):

A LANE-shell timing red currently rests on **one observation per arm**. The lane runner reported `town-t5` approach-barks as **9/10 nondeterministic**; the draining fire got **5/5** at `--workers=1`. F-1270-1 / `scripts/fire.md` §3.1 is a **FIRE-shell** finding and explicitly does **not** cover the lane shell, whose config deliberately keeps full parallelism. One observation per arm is an anecdote. This task replaces it with a matched-arm **rate**.

**THE PREMISE HAS CHANGED, WHICH IS WHY THIS IS AUTHORABLE AT ALL (§7.5).** The predecessor `f1424-4` STOPPED correctly — its scope-1 subject was *unmeasurable by construction*, because the instrument could not accept the subject shape the job needed. Both defects have since been repaired and merged:
- **`f1426-2`** (`08ec76b53b94e4bd3e20a7819335378c39e36d70`) — bare-file subjects now work; arms above the schedulable-job ceiling are refused.
- **`f1428-1`** (`e94bfd4086d32b6a67a4230d0d0e06e8702f48a8`) — the two load-bearing decisions that survived deletion green are now guarded.

Both are ancestors of this lane's base (verified by `git merge-base --is-ancestor` at dispatch). `node scripts/concurrency-class-rate.mjs --self-test` passes **7 arms** on main today, including `bare-file multi-test arm passed` and `worker-ceiling arms passed (accepted 1,2; rejected 3,6 at ceiling 2)` — i.e. the instrument demonstrably does the two things this measurement requires.

**THE GATE THIS TASK MUST MEET IS ALREADY WRITTEN, VERBATIM, IN THE LEDGER:** *"a multi-file subject of ≥3 spec files, plus a per-arm assertion that the reporter's obtained `M` tracks the requested arm."*

**WHY ≥3 FILES IS ARITHMETIC, NOT TASTE.** `playwright.config.ts` has **no `fullyParallel` key** (verify: `grep -c fullyParallel playwright.config.ts` → `0`), so Playwright's default `fullyParallel: false` applies and parallelism is **per-FILE**. Ceiling = distinct files × projects. One spec file × 2 projects = **2**, so a single-file subject obtains M=2 no matter what `--workers` says — that is the trap that made the predecessor unmeasurable. **3 files × 2 projects = 6**, which is what makes a 6-worker arm real.

READ-FIRST (paths — open each one; do not work from this summary):
- `scripts/concurrency-class-rate.mjs` — the whole file. Specifically the header comment block at `:3-5`, `parseArgs` (`:104-130`, including the ceiling refusal at `:126`), `runPlaywright` (`:148`), the per-run record at `:79-81` (note it already captures `configuredWorkers` and `actualWorkers` but **asserts neither**), and the `--self-test` block.
- `reviews/f1424-4-lane-shell-worker-arms.md` and `reviews/f1426-2-concurrency-harness-contract.md` — the finding and the repair.
- `e2e/town-t5-townsfolk.spec.ts` — **read only, never edit** (see FIREWALL).
- `tasks/BACKLOG.md` — the `f1426-2 SHIPPED s1428` row.

CITE BY CONTENT, NOT BY LINE (F-1310-1). Verify each of these returns **1** before starting; all three were verified to return 1 on main **and** in this lane at dispatch:
- `grep -c "GATE for the successor: a multi-file subject of" tasks/BACKLOG.md` → 1
- `grep -c "a 6-worker arm needs at least 3 spec files" scripts/concurrency-class-rate.mjs` → 1
- `grep -c "its scope-1 subject is unmeasurable by construction" tasks/goals.json` → 1
**If any returns 0, STOP and report — the lane drifted after dispatch and the premise needs re-checking. Do not "fix" it by editing the citation.**

PRE-FLIGHT (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, any `.png` — are NEVER "work" and NEVER a STOP. Discard them and PROCEED, listing what you discarded.**
> **FACTORY-CHURN EXCEPTION (F-1407-1) — ALWAYS EXPECTED, NEVER A STOP; list them and proceed:** `logs/**` (`factory-usage.json`, `usage-history.jsonl`, `task-stats.jsonl`, `dashboard.html`, `.goal-tree.html`, `.blocked-seen`) and `artifacts/**` / `reviews/shots-*` / any `.png`. What still STOPs, unchanged: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.
Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

SCOPE (each item separately checkable, and **in this order** — scope 1 decides whether scope 3 is affordable):

1. **PRICE THE SWEEP BEFORE COMMITTING TO IT, WITH A DIRECT TIMING PROBE — NOT VIA THE INSTRUMENT.** The instrument enforces `--runs >= 8`, so a full sweep of 3 arms is **24 Playwright runs**, each executing 3 spec files × 2 projects. That could be minutes or hours, and nobody has measured it. Run **one** Playwright invocation per arm by hand (`npx playwright test <the three files> --workers=<N> --reporter=line`, N ∈ {1, 2, 6}) against a scratch dev server, and record the wall-time of each.
   - Report the three wall-times and the **projected total** for `--runs 8` (`8 × (t1 + t2 + t6)`).
   - **If the projection exceeds ~3 hours, STOP and report the projection instead of running scope 3.** That stop is a legitimate deliverable, not a failure — it converts an unknown cost into a number the next fire can plan against, and the instrument's `--runs >= 8` floor is a deliberate statistical bar that must NOT be lowered to fit a budget.
   - ⓘ These probe runs are for TIMING ONLY. Do not read pass/fail rates off them; three runs is exactly the anecdote this task exists to replace.

2. **ADD THE PER-ARM OBTAINED-WORKERS ASSERTION THE GATE DEMANDS.** `:79-81` already records `configuredWorkers` and `actualWorkers` per run but never checks them. Assert, **per run**, that the obtained `M` equals the requested arm; on mismatch **throw**, naming the run number, the requested arm, and the obtained value.
   - `actualWorkers` is read from `report.config?.metadata?.actualWorkers`. ⚠️ **That metadata channel was modified on main four days ago** by `f1510-3` (`0da47f37`), which added a `metadata: { revision, dirty }` key to `playwright.config.ts`. s1518 measured that Playwright's injected `actualWorkers` **survives** it (both keys present in the same report). **Re-verify that in this lane after the refresh** — print the whole `report.config.metadata` object for one run — because this instrument's new assertion depends on exactly that key, and a silently-absent `actualWorkers` would make the assertion throw on every run.
   - If `actualWorkers` is absent or `undefined`, **STOP and report** rather than falling back to `configuredWorkers` or skipping the check. A measurement whose arm-variation cannot be verified is the NULL-wearing-a-label failure this gate exists to prevent.
   - **PROVE THE ASSERTION BITES (s1299/s1300 standard):** a green that never executes its violation path is not evidence about the red. Add a `--self-test` arm that feeds a synthetic run record whose obtained M disagrees with the requested arm and asserts it throws; show it failing against the pre-change code and passing after. Paste both.

3. **RUN THE MATCHED-ARM SWEEP AND PUBLISH THE RATE** (only if scope 1's projection was acceptable).
   ```
   node scripts/concurrency-class-rate.mjs \
     --subjects e2e/town-t5-townsfolk.spec.ts,e2e/town-t3-board.spec.ts,e2e/town-t6-surfaces.spec.ts \
     --workers 1,2,6 --runs 8 --port 5267 \
     --output logs/session-scratch/s1519-f1424-4-worker-arms
   ```
   - **Bare files, deliberately** — that is the `f1426-2` capability, and it makes every test in all three files a measured subject.
   - **Port 5267, never 5188** (5188 is held by live lanes under `strictPort`; the instrument refuses it anyway).
   - Report the rate table, and call out the row for the actual subject of F-1424-4: **`e2e/town-t5-townsfolk.spec.ts:203`** ("approach barks identify sampled speakers and the Prospector greets by town name") — for **both** projects, at each arm.

4. **WRITE AN HONEST VERDICT, INCLUDING A NULL.** State plainly which of these the numbers support:
   (a) the lane shell's parallelism manufactures the approach-barks red (rate rises with the arm);
   (b) it does not (rates flat across arms) — **a NULL is a legitimate, publishable result**, and s1216 got flat arms for two of its four subjects;
   (c) the test is unconditionally flaky (high failure at every arm, including w=1);
   (d) the test is green at every arm and the original 9/10 observation no longer reproduces.
   **Do not round a flat result up into a story.** If the arms are within noise of each other, say so and say what N would be needed to separate them.

⚠️ **CALIBRATION TRAP — NAMED EXPLICITLY BECAUSE TWO PRIOR SESSIONS NEARLY BUILT AN ORACLE ON IT.** `logs/suite-red-inventory.md` records this test with a blast radius of **16/17 (94.1%)**. That number is a **failing-line / body-lines RATIO**, not a pass rate. s1216 published that correction after nearly making the mistake, and s1425 nearly repeated it before reading the column header. **You may not use any number from that table as an oracle, an expectation, or an acceptance threshold.** Your rate must come from your own runs.

ⓘ **SUBJECT-SELECTION NOTE, so the neighbours are not mistaken for arbitrary.** `town-t5` is the subject under investigation and is KNOWN-RED (both projects) in the 2026-07-28 snapshot. `town-t3-board` and `town-t6-surfaces` were chosen because both read **CLEAN-IN-INVENTORY** at that snapshot, so they manufacture contention without contributing confounding reds. ⚠️ **`CLEAN-IN-INVENTORY` is ambiguous between *ran and passed* and *never ran*** — the markdown lists failures only. Confirm both neighbours actually RAN by checking for their explicit `"ok": true` / `"status": "passed"` records in `logs/suite-red-inventory-compact.json`, and report what you found. If either never ran, say so; it is still usable as load, but the report must not imply it was verified green.

ⓘ **TWO COORDINATES THAT LOOK LIKE ONE AND MUST NOT BE CONFLATED** (both re-measured on main at dispatch, both unrotted): `:203` is the **test declaration**, which is the key the harness builds (`collectExecutions` emits `file:line` from `spec.line`) and the only valid Playwright `file:line` filter. `:104` is the **8 s `expect.poll` inside the `expectBark` helper** — the failing line the inventory records. Report both; conflate neither.

FIREWALL:
TOUCH-ONLY: `scripts/concurrency-class-rate.mjs` (the obtained-workers assertion and its self-test arm) and the new output directory `logs/session-scratch/s1519-f1424-4-worker-arms/**`.
NO — do not create, edit or delete any of:
- `e2e/**`, and **`e2e/town-t5-townsfolk.spec.ts` above all** — editing the subject destroys the measurement this task exists to produce. Stabilising that test is NOT this task. If you believe you have found its root cause, **write it in the report** and change nothing.
- `playwright.config.ts` — §3.1 forbids touching `workers` there and `scripts/fire-shell-serialisation.test.mjs` asserts BOTH directions. **Adding `fullyParallel` is equally forbidden**: it would invalidate the ceiling arithmetic this measurement rests on, mid-measurement.
- `src/**`, `tasks/**`, `reviews/**`, `package.json`, and `logs/suite-red-inventory.md` (and its compact JSON) — read them, never write them.
- Do not add an npm script (a new un-rooted gate reds `gate-caller-audit`); the instrument is invoked directly, as today.
- Do not use `--repeat-each`, and do not add a flag for it: it shares one process and worker pool and would change the very quantity being measured.
- Do not lower `--runs` below 8 to fit a time budget — take the scope-1 STOP instead.

SELF-CHECK (name the exact commands and paste real output):
- `npx tsc --noEmit` → 0 errors. `npm run build` → green.
- `node scripts/concurrency-class-rate.mjs --self-test` → passes, output showing the **new** arm running alongside the existing seven.
- `node --test scripts/goal-tracker.test.mjs scripts/gate-caller-audit.test.mjs scripts/fire-shell-serialisation.test.mjs` → green (proves no gate-topology and no fire/lane serialisation drift).
- `grep -c fullyParallel playwright.config.ts` → `0` (paste it; the ceiling arithmetic depends on it).
- `git diff` on `playwright.config.ts`, `e2e/` and `src/` → **EMPTY** (paste the empty result).
- The three citation greps above, each → 1.
- The manufactured-red evidence from scope 2, both arms.
- Scope 1's three wall-times and the projected total.

READY-FOR-GATES + report: the three arm wall-times and the projection; whether you ran scope 3 or took the scope-1 STOP; the full rate table if you ran it; the `town-t5:203` row for both projects at each arm; your verdict from scope 4 stated as (a)/(b)/(c)/(d) with the numbers that support it; the `report.config.metadata` object you printed and whether `actualWorkers` survived alongside `f1510-3`'s `revision`/`dirty` keys; and what you found for the two neighbours in the compact JSON.
