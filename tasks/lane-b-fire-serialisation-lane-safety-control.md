# Task fire-serialisation-lane-safety-control: prove the s1270 playwright.config.ts change does NOT touch the lane (LANE SLOT)
FIRE-AUTHORED s1270 (attended review welcome) — attempt 1.
You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b` (branch `lane/m4`, commit prefix `test:`).
CODEX: model=gpt-5.6-sol effort=medium

> 🔬 **THIS TASK CHANGES NO CODE AND FIXES NOTHING. It runs the subject spec twice and reports
> what the reporter printed.** There is no cure to implement and **no outcome that counts as a
> failure** — "the lane still gets 6 workers" and "the lane now gets 1 worker" are equally
> successful runs. They mean opposite things, and the second one means a fire regressed every
> lane tonight, which is precisely why this run is worth its slot.
>
> ⚠️ **NOT A ZERO DIFF, and that is expected:** scope 2 re-runs `e2e/gazette-welcome.spec.ts`,
> which regenerates up to six tracked `artifacts/gazette-welcome/*.png`. That is evidence churn,
> it is correct, and it is not work (F-1266-1). Commit it or leave it; do not fight it.
>
> ⛔ **Do NOT edit `playwright.config.ts`.** It is the subject. Editing it destroys the measurement.
> ⛔ **Do NOT edit `src/`, `e2e/`, `package.json`, or `scripts/`.**
> ⛔ **Do NOT implement `gazette-welcome-drift-observation-frame` (v1 or v2)** — still parked.

## READ FIRST (paths, in this order)
1. `playwright.config.ts` — the top-of-file `isFireShell` comment block and the `workers:` line. ~20 lines. This is the subject.
2. `tasks/BACKLOG.md` → **F-1270-1** and **F-1270-3**. The measurement that motivated the change, and the limitation this task exists to close.
3. `scripts/fire.md` §3.1 — the law the config change mechanises.

## Why this exists

s1270 measured that the **fire** shell cannot run parallel playwright workers reliably: interleaved
in one shell within one hour, `--workers=1` gave **3/3 runs rc=0, 0 drift reds / 18** while the
default gave **3/3 runs rc=1, 17 drift reds / 18** — and the serial arm was *faster* (55.94s vs
60.74s), because the parallel arm fights the per-job CPU ceiling measured in F-1269-1. That is a
factory-gate correctness problem: fire-side gates at default workers were unreliable instruments.

To stop the law decaying into a sentence fires must remember, s1270 gave it a mechanism —
`playwright.config.ts` now sets `workers: isFireShell ? 1 : undefined`, where `isFireShell` is
**the presence of `CLAUDE_CONFIG_DIR`** (launchd sets it to `~/.claude-fires`; `fire-runner.sh:81`
sets it to `~/.claude-alt`; a *value* match would have missed the second launch path).

⭐ **The open question is lane safety, and a fire structurally cannot answer it.** s1270 verified
the predicate by deleting the variable from a child env and re-running: **1 worker obtained with
the marker, 6 without** — but both arms ran *inside the fire's own process tree*, so that proves
the **predicate dispatches**, not that a real lane is unaffected. The real-lane claim currently
rests on an absence argument only: `CLAUDE_CONFIG_DIR` is set by the plist and `fire-runner.sh`,
and is grep-absent from `~/.zshrc` and `~/.zprofile`. **An absence argument is not a measurement.**

⚠️ **The stake is concrete.** The lane shell runs 6 workers **~3.5× FASTER** than serial
(F-1267-1: ~14s vs ~49-64s). If the marker somehow reaches the lane, s1270 silently taxed every
lane run on this box by that factor, and nobody would notice except as "the lanes got slow".

## Scope (numbered; each item is testable)

1. **Report the premise before testing it.** In `worktrees/lane-b`, print and record:
   `process.env.CLAUDE_CONFIG_DIR` (expect **undefined**), `process.env.SHELL`, `process.cwd()`,
   `os.cpus().length`, `process.version`, and `os.loadavg()`. If `CLAUDE_CONFIG_DIR` **is** set in
   the lane, that alone answers the task — record its exact value and continue anyway.

2. **Arm A — the subject, NO worker flag.** Run exactly:
   ```
   npx playwright test e2e/gazette-welcome.spec.ts --project=desktop-chrome --project=mobile-chrome \
     --repeat-each=3 -g "fires once" --reporter=list
   ```
   **Pass no `--workers` flag** — the whole point is what the config chooses for you. Record: the
   worker count **read back from the reporter's own `Running N tests using M workers` line** (the
   flag passed is never the concurrency obtained), the exit code, passed/failed counts, and wall
   seconds. Repeat **twice**.

3. **Arm B — the control, explicit `--workers=1`.** Same command plus `--workers=1`. Twice.
   This gives the lane's own serial/parallel comparison in the same session, so arm A's number
   means something even if the box is busy.

4. **Interleave the arms** (A, B, A, B) and record `os.loadavg()` before and after every run. A
   fixed arm order confounds the treatment with time-on-box.

5. **Write `logs/session-scratch/s1270/lane-safety.json`** — one array, one object per run:
   `{seq, arm, workersObtained, exitCode, passed, failed, wallSeconds, loadavgBefore, loadavgAfter}`
   plus the scope-1 environment block. **Write it to a file with `writeFileSync`, never via captured
   stdout** — `spawnSync` truncates stdout under load.

6. **State the verdict against this pre-registered table, in your report, by name:**
   - **Arm A obtains 6 workers** → the predicate is lane-blind, s1270's change is **SAFE**, ship as-is. *(expected)*
   - **Arm A obtains 1 worker** → the marker reaches the lane; s1270 **regressed every lane** and the config change must be **REVERTED** on sight. Say so loudly and quote the `CLAUDE_CONFIG_DIR` value from scope 1.
   - **Arm A obtains 6 but the runs are RED** → lane safety is confirmed *and* a separate defect exists; report both, conclude nothing about workers from the reds.

## Firewall

**TOUCH-ONLY:** `logs/session-scratch/s1270/lane-safety.json` (new) · any helper script you write
under `logs/session-scratch/s1270/` · the six `artifacts/gazette-welcome/*.png` **only** as
incidental re-render churn from scope 2/3.

**NO:** `playwright.config.ts` (the subject — editing it voids the run) · `src/**` · `e2e/**` ·
`package.json` · `scripts/**` · `tasks/**` · `reviews/**` · `STATUS.md` · any other lane's files.
Report adjacent problems in your run report; do not fix them.

## Self-check before you report

- [ ] `logs/session-scratch/s1270/lane-safety.json` exists, parses, and holds **4 runs** (2 per arm) plus the environment block.
- [ ] Every `workersObtained` was **read back from the reporter's output**, not copied from the flag you passed.
- [ ] Arm A rows genuinely passed **no** `--workers` flag — verifiable from the command you record.
- [ ] Arms are interleaved A,B,A,B and loadavg is recorded at both ends of each run.
- [ ] `git status` shows nothing outside the TOUCH-ONLY list. `git diff --stat playwright.config.ts` is **empty**.
- [ ] Your report names one row of the scope-6 table explicitly and quotes the numbers behind it.
- [ ] `npx tsc --noEmit` rc=0 (you changed no TS; confirm you did not).

READY-FOR-GATES — report: the four rows of the table (arm, workersObtained, rc, p/f, wall), the
scope-1 environment block verbatim, which scope-6 verdict row you landed in, and whether
`CLAUDE_CONFIG_DIR` was set in the lane.
