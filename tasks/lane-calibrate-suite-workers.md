# Task lane-calibrate-suite-workers: MEASURE THE WORKER COUNT, THEN PIN IT (LANE-D, commit prefix "test:")
**FIRE-AUTHORED (attended review welcome) — s1103, 2026-07-27. This is F-1101-1, and it is the one config line gating every drain on this board. s1101 and s1102 both deliberately refused to fix it as a drive-by, for a good reason: it changes the gate for every task in the repo. s1102's next-fire note is an explicit instruction and this task obeys it verbatim — "author it with a *calibration* step (measure a fixed subset at workers=1/2/4 on a quiesced box, pin the count whose durations match single-worker), not a blind pin to 4; datum (D) says 4 may still be too many."**

**DO NOT GUESS A NUMBER. The deliverable is a MEASUREMENT that chooses the number, plus the number it chose. A blind pin is the failure mode this task exists to prevent.**

You are Codex (worktrees/lane-d).

CODEX: model=gpt-5.6-sol effort=high

> ⚠️ The `CODEX:` line above is at **column 0 on its own line** deliberately (F-1088-4). `scripts/lane-runner-v3.sh:65-66` greps `^CODEX:`, so an inline copy is silently ignored and the run falls back to `effort=medium`.

## WHY (the evidence chain, dated)

`playwright.config.ts` declares **no `workers` key** (verified s1103 by reading the file: lines 7-25 contain `testDir`, `timeout`, `expect`, `use`, `webServer`, `projects` — and nothing else). Playwright therefore defaults to **cores/2**. This Mac reports **16 cores**, so `npm test` — which is literally `playwright test`, no flags (`package.json`) — runs **8 full three.js/WebGL Chromes at once**.

Measured consequences, three fires deep:

| when | what was measured | number |
|---|---|---|
| s1101, `--workers=8` | loadavg / chromium procs | **34.16** / 71 |
| s1101, `--workers=8` | per-test durations | 2-13 s inflating to **40-60 s**, striking the 30 s ceiling |
| s1101, `--workers=8` | red rate at t+6 min | **37 of 143 (25.9%)** |
| s1101, **control** | `051-audio-governor` quiesced at `--workers=1` | **4/4 PASS in 3.2-3.6 s** — including two that had just failed at 11.3 s and 10.4 s |
| s1102, `--workers=4` | red rate at 31 min | **21.8%** |
| **s1103, `--workers=4`** | **loadavg / chromium / workers, measured live** | **34.35 / 38 / 6** |

**THE DATUM THAT DEFINES THIS TASK (s1103, and it is why "just pin 4" is wrong):** halving 8 → 4 barely moved the red rate (25.9% → 21.8% → 23.4% at stop), and when s1103 actually measured the box during the `--workers=4` run it read **loadavg 34.35** — statistically the same saturation as `--workers=8`. **`--workers=4` was never a quiesced instrument either.** The likely mechanism: each headless WebGL Chrome consumes roughly 4 cores, so 4 workers already ≈ 16 cores = the whole machine. **So the honest answer is unknown and must be measured. It may be 4. It may be 2. It may be 1.**

That w4 run was stopped by s1103 at 428/2378 (`logs/suite-runs/CURRENT-RUN.txt` records exactly why); both whole-suite logs are now committed to git.

**Why this stayed invisible for the life of the gate:** drains run *small* batteries that never cross the contention threshold. It only bites at whole-suite scale — i.e. exactly the thing s1095 asked for and nobody had done until s1101. The blast radius is that the first fire to run the suite and trust the number publishes ~37 phantom regressions **and buries the real ones inside them** (that is precisely what happened to F-1101-2, whose 3 real reds sat hidden among ~69).

## PRE-FLIGHT — verify by CONTENT, and run the premise checks AFTER the reset

⚠️ **`git log main..lane/perf` WILL PRINT ONE COMMIT (`dc178835 runner(lane-d): lane-startmenu-storage-contract.md`), AND THAT IS EXPECTED — IT IS *NOT* A REASON TO STOP.**
s1103 verified the reset is **loss-free by content, not by counting**: `git diff main lane/perf -- e2e/profile-first-boot.spec.ts src/ui/menu/StartMenu.ts` is **EMPTY**, i.e. that commit's content is already in main ⇒ classic false-ahead (an ahead-count is not a drain signal, F-1066-1 / F-1073-1).

1. `git log --oneline main..lane/perf` prints **exactly `dc178835` and nothing else.** A **second** commit would be undrained work — **only then STOP and report.**
2. Start from fresh main: `git checkout -B lane/perf main`. `dc178835` is safe to leave behind.
3. **NOW, and only now, run the premise checks** — a stale lane answers for its own tree, not for main, and a pre-flight that checks premises *before* the reset has STOPped a run wrongly before (F-1090-2):
   - `grep -n "workers" playwright.config.ts` → **must print NOTHING.** If a `workers` key already exists, someone pinned it after this task was authored: **STOP and report what it says.**
   - `node -e "console.log(require('os').cpus().length)"` → **must print 16.** A different number means the hardware assumption changed; STOP and report it, because every threshold below is calibrated to 16.

### 4. THE QUIESCENCE GATE — this task is a measurement, and a measurement on a busy box is worthless

**This is the single most important step in the task. s1103 stopped a 3.2-hour baseline precisely because it was measuring a contended box while believing it was not.**

Define this check (run it as one command, and paste its output every time):

```sh
sysctl -n vm.loadavg; pgrep -fc "Chrome for Testing"; pgrep -fl "playwright test" | grep -v $$ | cat
```

**QUIESCENT means all three of:** 1-minute loadavg **≤ 4.0** · zero `Chrome for Testing` processes · no foreign `playwright test` process.

- Load averages **decay slowly** (they are ~1-minute-smoothed), so a box that was just busy reads high for several minutes even when idle. Therefore: **take two samples 60 s apart and require BOTH to be ≤ 4.0.**
- **If the box is not quiescent, STOP and report the readings. Do not measure anyway, and do not kill anything you did not start** — another lane's codex or an attended session may own it. A STOP here is a **success**, not a failure: it costs one cheap dispatch and a later fire re-queues this master. Say so plainly in your report.
- Re-run the quiescence check **before every one of the five runs below**, and paste each result. If the box goes busy mid-sequence, **stop the sequence and report the partial table** — a partial honest table is worth far more than a complete dishonest one.

## READ FIRST (in your worktree, after the reset, before writing anything)

- `playwright.config.ts` — all 57 lines. Note `timeout: 30_000` (per test) and `webServer.reuseExistingServer: false`, which means **every `playwright test` invocation spawns its own `npm run dev`**; that server is part of the load you are measuring, which is correct and intended.
- `package.json` → `scripts.test` is `playwright test` with **no flags**. That is why the config default governs the real gate.
- `scripts/whole-suite-collection.test.mjs` — 11 lines, the F-1094-1 guard. **Your new guard is its sibling and must match this style** (node:test + node:assert/strict, one focused assertion set).
- `logs/suite-runs/CURRENT-RUN.txt` — s1103's stop record and the numbers above.
- `logs/suite-runs/20260727-0405-whole-suite-w4.log` — the banked w4 evidence the subset below was derived from.

## THE RULINGS (decided by s1103 — do not revisit)

**RULING 1 — THE SUBSET IS FROZEN, AND IT WAS CHOSEN FROM REAL DATA. Do not substitute your own.**
These **12 spec files** were derived by s1103 from the banked w4 log by an explicit rule: *fully green (zero reds) in that run, ≥2 tests, sorted by slowest test descending*. Green-under-contention means failures will not confound the duration signal; slowest-first means they are the most contention-**sensitive** files in the suite, which is exactly what must be measured. 43 tests across 12 files:

```
e2e/e5-boss-dredge-queen.spec.ts  e2e/054-baron-epic.spec.ts
e2e/e8-boss-salvage-claw.spec.ts  e2e/e9-boss-old-digger.spec.ts
e2e/e6-tile-consumers.spec.ts     e2e/e3-blackout-ridge.spec.ts
e2e/e1-dry-gulch.spec.ts          e2e/cp06-share.spec.ts
e2e/055-baron-kill-stop.spec.ts   e2e/072-era-activation.spec.ts
e2e/e7-signal-systems.spec.ts     e2e/e7-arsenal.spec.ts
```

**RULING 2 — 12 FILES IS NOT AN ACCIDENT: PLAYWRIGHT PARALLELISES ACROSS FILES.**
By default, tests **within** one file run **serially in a single worker**; only separate files occupy separate workers. A 4-file subset therefore cannot engage 8 workers and would silently measure nothing at the high end. 12 files ≥ 8 workers, so every worker count under test is genuinely engaged. **If you shrink the subset you destroy the instrument.**

**RULING 3 — `--project=desktop-chrome` ONLY, for every run.**
Halves the wall-clock and keeps one variable moving. The gate itself runs both projects, but a calibration needs a *consistent* instrument, not a representative one. State this limitation in your report.

**RULING 4 — MEASURE DURATIONS, NOT PASS/FAIL. The binary is the blunt instrument; the duration is the sharp one.**
s1101 established this ("a duration collapse is as diagnostic as ✘→✓"): the audio control went 11.3 s → 3.3 s. Pass/fail only moves once a test crosses the 30 s cliff; duration moves continuously and tells you *how close to the cliff* you are. **Record every test's duration at every worker count.**

**RULING 5 — RUN `--workers=1` TWICE, FIRST AND LAST. This is the drift control.**
Thermal throttling, page cache and background daemons all drift over a ~30-minute sequence. Without a repeated reference you cannot tell contention from drift. Run order: **1, 2, 4, 8, 1(again)**. If the two `w=1` runs disagree by more than **15%** on p95 duration, **the box was not stable and the whole table is void — report that and STOP** rather than pinning a number derived from drift.

**RULING 6 — THE DECISION RULE, stated in advance so the result cannot be rationalised afterwards.**
Using the **first** `w=1` run as the reference `d₁(test)`:
- for each N ∈ {2, 4, 8}: `inflation(N) = p95 over tests of ( d_N(test) / d₁(test) )`
- **PIN = the largest N satisfying ALL of:** `inflation(N) ≤ 1.25` · no test in that run exceeding **25 s** (the 30 s ceiling with margin) · **zero reds** in that run.
- **If no N ≥ 2 qualifies, pin `workers: 1` and say so.** That is a legitimate, honest outcome — a correct 1 beats a comfortable 4. Do not soften the threshold to reach a nicer number; if you believe the rule is wrong, **report that as a finding and pin per the rule anyway.**

**RULING 7 — PIN AN ABSOLUTE INTEGER, NOT A FRACTION OF CORES.**
This repo runs its gate on one 16-core Mac; a measured constant is honest and readable, whereas a `cpus()/N` expression silently re-derives an unmeasured number on any other machine. The CLI still overrides the config, so `--workers=1` in a drain battery keeps working untouched.

**RULING 8 — DO NOT TOUCH `timeout: 30_000`.**
Raising the per-test timeout would mask contention instead of fixing it, and would change the meaning of every existing red on the board. Out of scope, and a finding if you think it needs changing.

## SCOPE (numbered; each item is testable)

1. **Measure.** Run the RULING 1 subset at `--workers=1, 2, 4, 8, 1` (RULING 5 order), `--project=desktop-chrome` (RULING 3), each preceded by the quiescence gate. Capture each run's full list output to `logs/suite-runs/calib-w<N>[-repeat].log` and paste the loadavg reading taken immediately after each run finishes.
2. **Tabulate.** Build the duration table: one row per test, one column per worker count, plus the `inflation(N)` p95 row and the max-duration row. This table is the deliverable even if the pin is uncontroversial.
3. **Decide + pin.** Apply RULING 6, then add `workers: <N>,` to `playwright.config.ts` near `timeout: 30_000` with a comment that names **F-1101-1**, the measured `inflation(N)` values, and the date. A future reader must be able to see *why* the number is what it is without leaving the file.
4. **Guard it (`scripts/playwright-workers-pin.test.mjs`).** A node:test sibling of `whole-suite-collection.test.mjs` asserting that `playwright.config.ts` declares an **explicit integer** `workers`. Register it in `package.json` → `test:node-guards`. ⚠️ **Guard the CLASS, not the instance (the "guard's denominator" law): assert that a numeric `workers` key EXISTS, not that it equals your specific N** — a later re-calibration on different hardware must be free to change the number without reddening a guard, while *deleting* the pin (the actual regression, which is what happened here) must redden it.
5. **MANDATORY MUTATION CONTROL — aim it at the defect's own branch, and run the guard BEFORE you trust it.** Delete the `workers` line from `playwright.config.ts` → `npm run test:node-guards` must go **RED on your new guard specifically** (name which assertion fired). Restore byte-exact and show it green. A guard that stays green with the pin removed is guarding nothing — that exact failure has shipped on this board before, so **paste both outputs.**
6. **Write `reviews/calib-suite-workers.md`** — the verdict, the full table with REAL numbers, the loadavg readings, the two `w=1` runs side by side with their drift %, the chosen N with the rule that chose it, and any finding.

## FIREWALL

**TOUCH-ONLY:** `playwright.config.ts` (**the `workers` key and its comment ONLY**) · `scripts/playwright-workers-pin.test.mjs` (new) · `package.json` (**the `test:node-guards` line ONLY**) · `reviews/calib-suite-workers.md` (new) · `logs/suite-runs/calib-*.log` (new).
**NO — do not edit, for any reason:** any file under `e2e/` (**the 12 subset files are your instrument; editing one invalidates the measurement, and editing `e2e/` to reach green is a forbidden green on this board — F-1093-3 / F-1095-2**) · any file under `src/` (**this task changes no product behaviour whatsoever; a `src/` diff means you have gone off-task**) · `playwright.preview.config.ts` / `playwright.release.config.ts` (separate gates, separate slices — report if they need the same pin, do not do it) · `timeout: 30_000` (RULING 8) · `tasks/goals.json` / `STATUS.md` / `tasks/BACKLOG.md` / anything else under `reviews/` (fire-owned bookkeeping) · `logs/suite-runs/CURRENT-RUN.txt` and the two banked `*-whole-suite*.log` files (**s1103's evidence — append your own files, never rewrite those**) · **any failing test you notice** — the suite has ~69 other reds, most of them the very artefacts this task exists to explain. Report, never fix.

⚠️ **`src/` MUST BE UNTOUCHED. If your `git show --stat HEAD` lists a single `src/` file, you have failed the firewall — say so rather than shipping it.**

## SELF-CHECK (run these exact commands; paste real output)

1. `npx tsc --noEmit` → **0**.
2. `npm run build` → **0**.
3. `npm run test:node-guards` → your new guard **passes**, and the node phase count is **one higher** than main. ⚠️ **The overall command exits rc 1 on a green tree** because of **F-1088-1** (`scripts/test-ticker-stats.mjs` throws `StatsEndpointReadError`), a separate step after the node phase. **Judge this gate by the phase counts, not the exit code — that trap has now misled seven drains.**
4. The scope-5 mutation control: guard RED with the pin deleted, GREEN with it restored, both pasted, and `git diff` clean of the mutation afterwards.
5. `npx playwright test --list` → still prints a **non-zero** total (`Total: 2378 tests in 330 files` on main today) and exits **0**. Zero is the failure signature (F-1094-1). **Confirm the pin did not change the collected total** — it must not.
6. **The pin does what it claims:** re-run **one** subset file with no `--workers` flag and show from the output header that playwright now uses your pinned N rather than 8. Paste the line that proves it.
7. `git show --stat HEAD` → **exactly the TOUCH-ONLY files, and no `src/` file.**

**No screenshots owed** — this slice renders nothing; its evidence is the duration table.

**READY-FOR-GATES** — report: the quiescence readings before every run, the full duration table, `inflation(N)` for N ∈ {2,4,8}, the two `w=1` runs and their drift %, **the pinned N and the rule that chose it**, the mutation-control pair, and any finding (especially if the honest answer turned out to be `1`, or if the two `w=1` runs disagreed and voided the table).
