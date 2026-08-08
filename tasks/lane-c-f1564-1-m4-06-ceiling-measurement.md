# Task f1564-1: MEASURE the m4-06 drift ceiling instead of annotating it (LANE-C, commit prefix "chore:")

**FIRE-AUTHORED (attended review welcome).** s1564, from the F-1563-3 evidence in `reviews/f1562-1-m4-06-drift-deadband-constant.md`.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in **worktrees/lane-c**.

READ FIRST:
- `reviews/f1562-1-m4-06-drift-deadband-constant.md` — the section headed **`F-1563-3`**. It is the whole reason this task exists. Read the control table before you run anything.
- `e2e/m4-06-embodiment.spec.ts` — the test titled **`permission-denied receipts do not send the Prospector to the denied target`**. **Find it by that title, not by a line number** (F-1310-1: the coordinate has already rotted once between lane and main). Read the whole test body; the ORDER of its assertions is load-bearing for this task.
- `src/agent/Embodiment.ts` — the `updateSimulation` idle-survey branch and wherever `lastLine` is assigned. ⚠️ Note the path: it is `src/agent/`, **not** `src/entities/` as some older law prose says.
- `artifacts/f1560-1-drift-ceiling/samples.txt` — the two-window sample the current `0.4` comment cites. You are producing this measurement's successor, so know what it did and did not cover.

## PRE-FLIGHT — standard lane safety

`lane/c` is **USABLE** and was measured `ahead=0 behind=10` at authoring time (s1564, after merge `4f5031c04`). Standard safe-dupe rules apply: verify the worktree/branch is clean vs main **before** resetting; if `git log main..lane/c` is non-empty, **STOP and report** — do not reset over content main has not absorbed (Mistake #2).

Then run these checks and **STOP-and-report on any mismatch** — do not "fix" a mismatch, report it:

1. `grep -c "expect(\['held', 'ask me', 'no trust'\]).toContain(immediate.lastLine);" e2e/m4-06-embodiment.spec.ts` → must print **`1`**. (Verified `1` on main at authoring, s1564.)
2. `grep -c "m4-06-denied\] driftAbs=" e2e/m4-06-embodiment.spec.ts` → must print **`1`**. This is the instrument you are reading; if it is absent the measurement cannot be taken.
3. `git -C worktrees/lane-c status --short` → clean, with the **FACTORY-CHURN EXCEPTION** (F-1407-1), always expected and never a STOP: `logs/**`, `artifacts/**`, `reviews/shots-*`, any `.png`. List what you discard. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.
4. `npm install --no-audit --no-fund`, then `npm run build` green **before measuring anything**.

ⓘ **Your lane carries the arrangement under test, and this was proved rather than assumed.** At authoring, `e2e/m4-06-embodiment.spec.ts`, `src/agent/Embodiment.ts`, `src/game/Balance.ts`, `playwright.config.ts` and `package.json` are all **byte-identical between `main` and `lane/c`** (blob-hash compared, s1564). So a measurement taken here is a measurement of main's arrangement. Re-confirm #1 and #2 above; if either differs, that premise has expired.

## Why (gate evidence, quoted, not paraphrased)

Six consecutive merges — `f1557-3 → f1558-1 → f1559-1 → f1560-1 → f1561-2 → f1562-1` — refined the **comment** that explains the `0.4` drift ceiling: its provenance, its sample, its constants, its deadband. All six were correct. In the same window the ceiling itself was **breaching on main**, under the very shell that gates it, and no rung measured it. From the s1563 gate:

> **CLEAN MAIN `98a464438`**, full-spec `--workers=1`: run 1 → 1 failed (`:395` desktop, `toContain("ledger")` got `["held","ask me","no trust"]`, driftAbs=0.3565); run 2 → 2 failed (`:395` both projects, desktop **driftAbs=0.41504 > 0.4**). Merged arm 2 of 2 runs 1 failed, once at **driftAbs=0.4453**. **Isolated, `:395` passes with 29% margin (0.2834).**

**Documenting a bound is not validating it.** This task stops annotating the constant and measures it.

Two facts from that gate shape everything below, and they are **not the same defect**:

1. **The test fails via TWO independent assertions.** The permission-chip assertion (`immediate.lastLine` must be one of `held` / `ask me` / `no trust`) and the drift ceiling (`driftAbs < 0.4`). Calling this "the m4-06 flake" hides one behind the other.
2. **It is load-dependent, not a line.** Isolated it passes with margin; inside the 18-test file it breaches. The bound was calibrated under a lighter arrangement than the one that gates it.

## ⚠️ The measurement hazard you must design around — read this before planning your runs

**The bark assertion executes BEFORE `driftAbs` is ever computed.** In the test body, `expect([...]).toContain(immediate.lastLine)` comes first; `advanceSim(0.35)`, the distance calculation and the `console.log` that prints `driftAbs` all come after it.

Therefore **every run that fails on the bark yields NO drift sample at all** — and the runs most starved of CPU are exactly the ones most likely to lose the bark race *and* to drift furthest. The drift distribution you can observe is **censored, and censored in the direction that hides the problem**. Do not report a mean over surviving samples as if it were the mean. Count the censored runs explicitly.

## Scope

**This task changes NO product code and NO test code. Its deliverable is evidence.** (See Firewall — that restriction is the point of the task, not boilerplate.)

1. **Arm A — the gating arrangement.** Run the FULL spec file **6 times**: `npx playwright test e2e/m4-06-embodiment.spec.ts --workers=1`, both projects, unmodified tree. Capture complete stdout for each run to a separate file.
2. **Arm B — the isolated control.** Run **only** the permission-denied test **6 times**, same shell, same flags, selecting it by title with `-g`. This arm differs from A **deliberately and in exactly one respect — the composition of the file around it** — because that difference is the hypothesis under test.
3. **Record, per run per project, a row with four fields:** `arm` · `project` · `outcome` ∈ {`pass`, `fail-bark`, `fail-drift`, `fail-other`} · `driftAbs` (the number from the `[m4-06-denied]` log line, or `CENSORED` when the run failed before it printed). For `fail-bark`, also record **the actual `lastLine` value** playwright reports as received. For `fail-other`, name the assertion.
4. **Write `artifacts/f1564-1-m4-06-ceiling/samples.txt`** — the raw captured stdout of all 12 runs, concatenated with a header line per run naming arm/project/run-index. Nothing summarised, nothing trimmed; this is the durable evidence (retention law).
5. **Write `artifacts/f1564-1-m4-06-ceiling/report.md`** containing:
   - the 4-field table from scope 3, every row;
   - for each arm: **n**, **count censored**, and over the uncensored samples min / max / mean / the count exceeding `0.4`;
   - the **failure rate per arm per project**, stated as a fraction with its denominator (`2 of 6`, never "33%" alone);
   - your shell's identity: print whether `CLAUDE_CONFIG_DIR` is set and to what, and the `workers` value playwright reports it obtained. **This determines how your numbers compare to the fire's** (F-1270-1: the fire shell serialises and has a lower per-job CPU ceiling than a lane shell), and without it the numbers are not interpretable.
6. **Answer one code question by READING, not by inference,** and put the answer in `report.md` with quoted lines and their file/line: **can `lastLine` legitimately be `'ledger'` at the moment immediately after a `PERMISSION_DENIED` receipt?** Find where `lastLine` is assigned in `src/agent/Embodiment.ts`, find every writer, and say whether `'ledger'` is (a) a legitimate line that the accepted set wrongly omits, or (b) a line that should not be reachable there, i.e. a real product bug in which a denial is silently overwritten. **Do not guess. If the code does not settle it, say "UNSETTLED by reading" and state precisely what would settle it.**
7. **Recommend, do not apply.** End `report.md` with a recommendation for the next rung — re-pin with a named cause, fix the load sensitivity, split the two assertions, or "the bound is sound and the fire shell is the defect". **State which of your own numbers would have to be wrong for the recommendation to be wrong.**

ⓘ **A NON-REPRODUCTION IS A RESULT, NOT A FAILURE.** If 12 runs produce zero breaches, the task has **succeeded**: it localises F-1563-3 to the fire shell and tells the next fire its gate instrument is the subject, not the game. Report that outcome with the same rigour and do not go hunting for a red to justify the slot.

## Firewall

Touch ONLY: `artifacts/f1564-1-m4-06-ceiling/**` (new directory).

**NO changes to** — this list is the task:
- ❌ **`e2e/m4-06-embodiment.spec.ts` — not one byte.** You are measuring this file; editing it destroys the measurement. In particular **do not** move the `console.log` earlier to defeat the censoring, however tempting: that changes the arrangement under test.
- ❌ **The `0.4` constants. Do NOT re-pin.** F-1441-3 is standing law: re-pin only with a named cause, never to make a red go away — and the named cause is what this task exists to produce. A re-pin here is a task failure even if the suite goes green.
- ❌ `src/agent/Embodiment.ts`, `src/game/Balance.ts`, any sim/systems/entities code.
- ❌ `playwright.config.ts`, `package.json`, `scripts/**`.

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate (Mistake #1). Note that for this task the artifact directory IS the diff; producing it is what "changed something" means here.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` rc=0 and `npm run build` green — taken **once, before** the measurement, to prove the tree you measured was sound. (Your diff is artifacts-only, so nothing you do can change them; take them anyway and report them, so the drain can tell a sound tree from a broken one.)
- All 12 runs completed and their stdout is in `samples.txt`. Report the **byte size and line count** of that file.
- `report.md` contains every row of the scope-3 table, both arms' statistics with denominators, the shell identity, the scope-6 code answer with quoted lines, and the scope-7 recommendation.
- `test:node-guards` is **NOT required and NOT owed**: your diff touches `artifacts/` only — no `src/sim/`, `src/systems/`, `src/entities/` — so F-1460-1 does not bind. Say so explicitly rather than implying coverage you did not take.
- No screenshots required: this slice renders nothing.

⚠️ **Known-red, do not chase and do not "fix":** the test you are measuring **is expected to fail sometimes — that is the measurement**. A red in Arm A is data, not a defect in your work. Report it; never repair it.

End: **READY-FOR-GATES** + report: the 12-run table, both arms' statistics with denominators, your shell identity and obtained `workers` value, your scope-6 answer on `'ledger'` with the lines you read, your scope-7 recommendation, and the confirmation that `e2e/m4-06-embodiment.spec.ts` is byte-identical to what you started with.
