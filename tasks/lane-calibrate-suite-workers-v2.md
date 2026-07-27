# Task lane-calibrate-suite-workers-v2: THE CALIBRATION, RE-RUN WITH A DRIFT CONTROL THAT SURVIVES ONE FLAKY TEST (LANE-D, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome) — s1123, 2026-07-27.** This is the successor to `lane-calibrate-suite-workers.md`, which ran in full, then **voided itself under its own RULING 5** and pinned nothing. F-1101-1 is therefore still open and `playwright.config.ts` still declares no `workers` key.

**THIS IS A THIRD ATTEMPT AND IT CARRIES A CHANGED PREMISE, as the escalation law requires. Do not re-run v1 unchanged — it would void again at similar odds.** The single change is to *how the drift control is computed*. Everything else about v1 was sound and is still binding.

You are Codex (worktrees/lane-d).

CODEX: model=gpt-5.6-sol effort=high

> ⚠️ The `CODEX:` line above is at **column 0 on its own line** deliberately (F-1088-4). `scripts/lane-runner-v3.sh:65-66` greps `^CODEX:`, so an inline copy is silently ignored and the run falls back to `effort=medium`.

## WHY THIS EXISTS — the one number that voided v1, and why it was not the box

v1 executed its full `1, 2, 4, 8, 1` sequence on a quiesced box and then discarded every result, because RULING 5 says the table is void if the two `--workers=1` runs disagree by more than **15%** on p95 duration. **They disagreed by 17.88%** (17.9 s → 14.7 s). v1 obeyed its own rule, honestly, and pinned nothing.

**F-1107-1 (s1107, measured against v1's own raw logs) showed that verdict was an artefact of the metric, not a property of the box:**

- **40 of 43 tests reproduce within ±0.5 s across the two `w=1` runs.** The box was stable.
- The single mover is **`e2e/055-baron-kill-stop.spec.ts:121` at −9.8 s**, which was `w1`'s **lone red** *and* its **largest duration (21.6 s)**.
- p95 nearest-rank at n=43 reads the **3rd-largest** value — so greening that one test alone walks p95 from **17.9 → 14.7**.

⇒ **A whole-box stability verdict was being decided by one flaky test's pass/fail.** v1's own stated remedy ("re-run on a stable box") does not follow from its data and would void again.

**DO NOT "FIX" THIS BY WAITING FOR 055:121 TO BE STABLE.** s1123 merged `09102598`, which closed a *proven false-green* branch in that spec and directly proved the contract-briefing clause cannot fire there — but its 10-run green is **underpowered** against a **1-in-43** historical red, and s1122's F-1122-1 showed the briefing mechanism remains **unproven for the red**. **This task must not depend on that question being settled.** The amendment below makes it irrelevant.

## THE ONE AMENDMENT — RULING 5 becomes RULING 5-A

**RULING 5-A — THE DRIFT CONTROL IS COMPUTED OVER TESTS THAT WERE GREEN IN *BOTH* `w=1` RUNS.**

Run order is unchanged: **1, 2, 4, 8, 1(again)**, quiescence gate before each.

- Build the set `S = { tests that PASSED in both the first and the repeat w=1 run }`.
- Compute the drift p95 **over `S` only**. If that drift is **> 15%**, the box genuinely was unstable ⇒ void and STOP, exactly as v1 would have.
- **Report, by name, every test excluded from `S`, with its duration in each run and its pass/fail in each.** The exclusion list is a deliverable, not a footnote — if it is large, that is itself the finding and you should say the instrument is unfit rather than push on.

**Why green-only rather than "delete 055 from the subset" (F-1107-1 offered both):** deleting the file cures this instance and leaves the class. *Any* flaky test in the subset can hijack a p95 that is read at nearest-rank; a green-only rule disarms all of them, now and on re-calibration. This is the same "guard the class, not the instance" reasoning RULING 6 of v1 already applies to the pin guard. **Keep all 12 files** — RULING 2 explains why shrinking the subset destroys the instrument.

**RULING 6 inherits the same restriction:** `inflation(N)` is a p95 over `d_N(test)/d₁(test)` computed **only for tests in `S` that were also green in run `N`**. The "**zero reds in that run**" clause of the pin rule is **UNCHANGED and still absolute** — a worker count that produces any red does not qualify, no matter how good its durations look. Excluding a flaky test from the *duration metric* must never quietly excuse a red from the *pin decision*; these are two different questions and you must keep them apart.

## STILL BINDING FROM v1 — read them, do not restate them, do not revisit them

`tasks/lane-calibrate-suite-workers.md` **RULINGS 1, 2, 3, 4, 6, 7, 8** carry over verbatim, as does its **QUIESCENCE GATE** (§4, including the `|| true` note, the `pgrep -fc` warning, and the judge-liveness-by-CPU rule) and its **READ FIRST** list. Read that file first and treat it as part of this one.

The frozen 12-file / 43-test subset of RULING 1 is **unchanged**.

## PRE-FLIGHT — verify by CONTENT, and run the premise checks AFTER the reset

⚠️ **`git log main..lane/perf` WILL PRINT ONE COMMIT AND THAT IS EXPECTED — IT IS *NOT* A REASON TO STOP.** As of s1123 the tip is `9614b7eb runner(lane-d): lane-calibrate-suite-workers.md` (v1's own runner commit). s1123 verified the reset is **loss-free by content, not by counting**: v1's six files (`logs/suite-runs/calib-w1.log`, `calib-w1-repeat.log`, `calib-w2.log`, `calib-w4.log`, `calib-w8.log`, `reviews/calib-suite-workers.md`) are **all present in main**, and the only one that differs does so because **main is strictly ahead** — `642c5d5d` added the VOID annotation the lane never had. Classic false-ahead; an ahead-count is not a drain signal.

1. `git log --oneline main..lane/perf` prints **exactly `9614b7eb` and nothing else.** A **second** commit would be undrained work — **only then STOP and report.**
2. Start from fresh main: `git checkout -B lane/perf main`. `9614b7eb` is safe to leave behind (its content is in main).
3. **NOW, and only now, run the premise checks** — a stale lane answers for its own tree, not for main, and a pre-flight that checks premises *before* the reset has STOPped a run wrongly before (F-1090-2):
   - `grep -n "workers" playwright.config.ts` → **must print NOTHING.** If a `workers` key exists, someone pinned it after this task was authored: **STOP and report what it says.**
   - `node -e "console.log(require('os').cpus().length)"` → **must print 16.** Every threshold is calibrated to 16; a different number means STOP and report.
   - `git log --oneline -1 -- reviews/calib-suite-workers.md` → confirm you are re-running against the **VOID** report, not a superseded one.

## SCOPE (numbered; each item is testable)

1. **Measure.** The RULING 1 subset at `--workers=1, 2, 4, 8, 1`, `--project=desktop-chrome`, each preceded by the quiescence gate. Capture full list output to `logs/suite-runs/calib2-w<N>[-repeat].log` (**note the `calib2-` prefix — do not overwrite v1's logs, they are evidence under the RETENTION LAW**) and paste the loadavg reading taken immediately after each run.
2. **Build `S` and report the exclusions.** State `|S|` out of 43 and name every excluded test with its two durations and two verdicts. **If `|S| < 35`, STOP and report the instrument as unfit** rather than calibrating on a shrunken basis.
3. **Drift control (RULING 5-A).** p95 drift over `S`. `> 15%` ⇒ void and STOP, honestly, as v1 did. Report the number either way, alongside what the **unrestricted** all-43 drift would have been — that comparison is the whole point of this task and belongs in the review.
4. **Tabulate.** One row per test, one column per worker count, plus the `inflation(N)` p95 row (over `S`, per RULING 6) and the max-duration row. This table is the deliverable even if the pin is uncontroversial.
5. **Decide + pin.** Apply v1 RULING 6, then add `workers: <N>,` to `playwright.config.ts` near `timeout: 30_000`, with a comment naming **F-1101-1**, the measured `inflation(N)` values, `|S|`, and the date. A future reader must see *why* the number is what it is without leaving the file.
6. **Guard it (`scripts/playwright-workers-pin.test.mjs`).** A node:test sibling of `scripts/whole-suite-collection.test.mjs` asserting `playwright.config.ts` declares an **explicit integer** `workers`. Register it in `package.json` → `test:node-guards`. ⚠️ **Guard the CLASS: assert a numeric `workers` key EXISTS, not that it equals your N** — re-calibration must stay free to change the number, while *deleting* the pin must redden.
7. **MANDATORY MUTATION CONTROL — run the guard BEFORE you trust it.** Delete the `workers` line → `npm run test:node-guards` must go **RED on your new guard specifically** (name which assertion fired). Restore byte-exact and show it green. **Paste both outputs.** A guard that stays green with the pin removed is guarding nothing.
   > ⚠️ `test:node-guards` was **red on main until s1123** (`b53a653c` fixed `goal-tracker.test.mjs`, suite now **61/61 green**). If it is red for you before you touch anything, **that is a new regression — report it, do not absorb it into your own result.**
8. **Write `reviews/calib-suite-workers-v2.md`** — verdict, full table with REAL numbers, loadavg readings, the two `w=1` runs side by side with **both** drift figures (over `S` and over all 43), `|S|` and the exclusion list, the chosen N with the rule that chose it, and any finding.

## FIREWALL

**TOUCH-ONLY:** `playwright.config.ts` (**the `workers` key and its comment ONLY**) · `scripts/playwright-workers-pin.test.mjs` (new) · `package.json` (**the `test:node-guards` line ONLY**) · `reviews/calib-suite-workers-v2.md` (new) · `logs/suite-runs/calib2-*.log` (new).

**NO:** any `src/**` file · any `e2e/**` file — **especially `e2e/055-baron-kill-stop.spec.ts`; making that test green is NOT this task's job and would destroy the very measurement `S` exists to make** · `timeout: 30_000` (v1 RULING 8) · v1's `logs/suite-runs/calib-w*.log` and `reviews/calib-suite-workers.md` (evidence, RETENTION LAW) · the frozen 12-file subset · `tasks/**` other than nothing at all.

## SELF-CHECK (run these exact commands; paste real output)

- `git diff --name-only main...HEAD` → must list **only** the TOUCH-ONLY paths above; **zero `src/`, zero `e2e/`.**
- `npx tsc --noEmit` → clean. `npm run build` → green.
- `npm run test:node-guards` → green **including your new guard**, plus the deletion mutation red/green pair from scope 7.
- The quiescence readings for **all five** runs, pasted verbatim.
- `|S|` stated as a number out of 43, with the exclusion list.
- **Both** drift figures stated: over `S`, and over all 43 (the v1-equivalent).

**A STOP IS A SUCCESS HERE, AND SO IS A VOID.** If the box is busy, if `|S| < 35`, or if the restricted drift still exceeds 15%, say so plainly and stop — v1's honest void is *why* this task could be written at all. **"I could not measure X because Y" is a SUCCESS; a confident guess is a FAILURE.** Do not soften a threshold to reach a nicer number; if you believe a rule is wrong, report it as a finding and follow the rule anyway.

End: **READY-FOR-GATES** + report (a) `|S|` and the exclusion list, (b) both drift figures, (c) the chosen N and the rule that chose it — or the honest void, (d) the mutation-control red/green pair, (e) anything that contradicts this task's premises.
