# Sol findings — fixed-step implementation

Branch: `sol/fixed-step-unification`

Initial implementation base: `2cdcf210b51bb265661c7a232d49e43c54948bba`
Final merged main comparison: `e374f47`

Status: **PARKED — NOT READY-FOR-GATES**

The original park record is retained below. Fable authorized the fixture corrections in `specs/mp-snapshot-completeness/README.md`; task 067's main lineage was merged; the legacy driver was constrained to 30 Hz; Night Shift was root-caused; and the full, performance, multiplayer-isolation, and feel gates were attempted. The required isolated MP resync gate is still red, and the focused diagnostic disproves the assumption that task 067 established post-restore determinism. Current evidence is `artifacts/sol/fixed-step-gates/FINAL-EVIDENCE.md` and `MP-BLOCKER-EVIDENCE.md`.

## Authorization resolution — 2026-07-10

No gameplay assertion or `Balance.ts` value was changed. The corrected fixtures are:

1. `e2e/054-baron-epic.spec.ts` — removed caller cadence selection and changed the repeated 20-second rampage window from 80 × 0.25 seconds to 75 × 4/15 seconds, preserving the exact cap at whole 30 Hz ticks.
2. `e2e/055-baron-kill-stop.spec.ts` — removed its 60 Hz caller-selected step; the requested 0.1 seconds remains exactly three ticks.
3. `e2e/057-baron-rocket-cart.spec.ts` — removed its 60 Hz step and changed four-second polling from 80 × 0.05 seconds to 60 × 1/15 seconds, preserving the exact window.
4. `e2e/058-device-tiers.spec.ts` — removed its 10 Hz caller-selected step; the deterministic eight-second signature now runs 240 fixed ticks.
5. `e2e/e1-night-shift.spec.ts` — root cause first: the source used `nokill`, the restore resumed live combat at `timescale=8` behind a non-pausing briefing, and the still-open source page could overwrite the shared suspend. The fixture now closes the writer, asserts restored wave 1, and observes the restore at product `timescale=1`. It passes 2/2 without adding immunity or changing pause/Balance behavior.
6. `e2e/e2-enemies.spec.ts` — removed 30/60 Hz caller steps, made former half-tick polls explicit two-tick advances, and reduced loop counts to preserve the original 8/11/36-second caps.
7. `e2e/e2-hill-mine.spec.ts` — removed 15/30 Hz caller steps. The unchanged ford-crossing assertion exposed a 30 Hz boundary oscillation; `Enemy.routedTarget()` now aims 0.1 units inside the ford so routing remains cadence-invariant.
8. `e2e/e2-rail-entity.spec.ts` — removed its 50 ms caller step; the 1.2-second proof remains 36 ticks.
9. `e2e/gt-05-water-depth.spec.ts` — removed 15/60 Hz caller steps. Its unchanged deep-water and ford-route assertions pass with the same ford-entry correction.
10. `e2e/task-053-weapon-cycling-audit.spec.ts` — removed the 200 ms systems step, kept 200 ms orchestration chunks, and replaced a floating end-condition with an exact chunk count. The seeded DPS ordering and run-to-run equality remain unchanged.
11. `src/diagnostics/DeterminismHarness.ts` — consumes a cheap per-tick sample callback so its definition remains 18,000 samples over 600 seconds without forcing unrelated fixtures through presentation work.

`advanceSimForTest()` accepts duration only, rounds to complete 30 Hz ticks, never runs a partial final tick, and batches presentation by the production five-tick catch-up cap. The independent review caught and caused correction of a temporary 5:1 timeline downsample and inflated fractional polling windows before commit.

Current-tip non-MP observations: fixed-step 6/6, perf-04 2/2 with unchanged hash, Night Shift 2/2, authorized driver battery 42 pass / 1 project-skip, and build/TypeScript green. Their current-tip reporter output, plus the later p95 and full-desktop output, was not retained; all are recorded as non-gate observations in `FINAL-EVIDENCE.md`, not presented as checksummed proof. The checksummed focused logs predate `23cd01d`.

## F-SOL-SIM-IMPL-001 — a legacy accelerated test encodes the removed render-driven cadence

**Finding.** The ratified one-cadence rule (`specs/sim-fixed-step/README.md:8-12`) and the Night Shift suspend/restore fixture cannot both be satisfied without changing the test harness or amending the ruling. This is evidence of a gate-contract conflict, not evidence that 30 Hz is the wrong product cadence.

**Locations.**

- `src/core/Loop.ts:1-2,96-145` — the branch's single 30 Hz accumulator, five-tick catch-up cap, and dropped-time accounting.
- `src/game/Game.ts:513-520` — solo and multiplayer enter the same fixed-step loop; there is no debug/rAF compatibility cadence.
- `src/game/Game.ts:3589-3616` — the legacy `advanceSimForTest(seconds, stepSeconds)` escape hatch calls `update()` directly at a caller-selected step instead of entering `Loop`; existing fixtures call it with several cadences.
- `e2e/e1-night-shift.spec.ts:348-375` — the fixture accelerates the source run at `timescale=40`, restores at `timescale=8`, and then waits on live browser state.
- `e2e/gt-03-enemy-elevation.spec.ts:78-99,125-147` — a secondary diagnostic signal: movement duration is inferred from browser polling boundaries while the game runs at `timescale=4`.
- `e2e/sim-fixed-step.spec.ts:38-77` — the replacement invariant drives explicit 30/60/144 fps presentation schedules over the same 300 fixed ticks.

**Evidence.**

1. The new suite is green: **6/6 passed**. At 30, 60, and 144 fps it produced exactly 300 ticks, identical tick timelines, identical Economy hash `fnv1a32:0f6f2150`, seven Economy entries, and zero dropped time. See `artifacts/sol/fixed-step-gates/sim-fixed-step-desktop.log`.
2. The required full desktop command enumerated 528 cases; **524 produced outcomes: 495 passed, 25 failed, 4 skipped; 4 did not run**. See `artifacts/sol/fixed-step-gates/full-desktop.log`.
3. A controlled six-case comparison against clean base `2cdcf21` narrowed the change: the branch failed all six while the base failed four. The initial branch-only reds were Night Shift and GT-03. Subsequent diagnostic runs made the distinction precise: Night Shift remained stable while GT-03 changed outcomes across runs. GT-03 is therefore polling-flaky evidence, not a stable blocker. See `artifacts/sol/fixed-step-gates/suspicious-branch.log`, `suspicious-baseline.log`, and `night-shift-repeat-comparison.md`.
4. Night Shift is stable and branch-specific in the controlled check: the current branch failed **2/2** repeated isolated runs with the death overlay intercepting the restored briefing; clean base `2cdcf21` passed **2/2**. Fixed-tick catch-up advances the accelerated restored run far enough for the death overlay to win the setup race.
5. The GT-03 fixture samples a moving enemy at browser-poll boundaries (`e2e/gt-03-enemy-elevation.spec.ts:78-99`). Its changing diagnostic outcomes show that those boundaries are unstable at accelerated cadence. It should be hardened when the harness policy is corrected, but it is not required to establish this blocker.
6. The legacy `advanceSimForTest()` seam itself remains a second, test-only cadence owner (`src/game/Game.ts:3589-3616`): it bypasses `Loop` and accepts arbitrary caller steps. The new Baron test now uses `driveRenderSchedule()` and the authoritative 30 Hz loop, but changing every legacy caller is an orchestrator-authorized harness correction, not a stealth expansion of this slice.
7. Two compatibility experiments were rejected and removed before parking: a variable/rAF debug exception recreated the original dual-cadence defect; a fixed 60 Hz, one-step-per-render debug path contradicted the decided 30 Hz cadence and became render-dependent when frames were missed. Query-specific exclusions also made gates exercise a different path from the fixtures they purported to protect. An unrelated scripted-enemy target clamp explored during diagnosis was also removed because it crossed the slice firewall.

**Owner/orchestrator decision requested.**

Authorize test-only corrections that preserve the 30 Hz ruling: remove or constrain `advanceSimForTest()`'s arbitrary-step escape hatch, drive accelerated fixtures through the real fixed loop, observe state at deterministic tick boundaries, and make restore setup quiescent before resuming simulation. The alternative is an explicit spec amendment permitting a separate debug cadence. Sol will not choose between those policies implicitly in code.

## F-SOL-SIM-IMPL-002 — task 067 still owns the failing mp-02 resync seam

**Resolution update.** Task 067's lineage landed and was merged, but the authorization premise that the isolated desync gate is green does not hold on this branch. A fresh exact isolated repeat is 0/2. Focused instrumentation, removed immediately after the run, showed Alice at tick 714 with 22 desyncs/22 resyncs while Bob was at tick 713 with 0/0; both were unpaused, but every hash after the injected tick 60 differed. The tracked task-067 “green” artifact also contains unequal peer hashes at ticks 90 and 120. F-drain-1 permits judging tests in isolation; it does not authorize an isolated red or a false-positive green that never asserts equal post-restore futures.

**Finding.** The required `mp-02` gate is blocked by the already-sequenced task 067 corrective. Sol must not repair or absorb that seam on this branch.

**Locations.**

- `e2e/mp-02-lockstep.spec.ts:67-95` — hash-mismatch resync must unpause both riders.
- Main commit `dab8112` — queues the task 067 MP resync corrective; it is a task/master commit, not a landed fix.
- `tasks/done/` — contains no task 067 completion marker at the time of this note.

**Evidence.**

- Branch required-suite run: identity passed, resync timed out waiting for the restored peer, and the serial third case did not run. The third case passes independently. See `artifacts/sol/fixed-step-gates/mp-02-desktop.log` and `mp-02-third-case.log`.
- Clean base `2cdcf21` fails the same resync case with the rider still paused. See `artifacts/sol/fixed-step-gates/mp-02-baseline-resync.log`.

**Dependency.** Land task 067 on main, update this branch through the orchestrator's normal drain flow, then rerun `mp-02` 3/3. F-SOL-PERSIST-002 remains untouched.

## F-SOL-SIM-IMPL-003 — the task-067 green is timing-dependent and does not prove equal futures

**Finding.** Fixed-step scheduling makes the MP hash-order defect deterministic: only the peer that already has its local hash when the remote hash arrives detects the mismatch. The other peer never enters resync, so the isolated task-067 test waits forever for `bob.resyncs >= 1`. Independently, the v1 restore does not restore equal futures; hashes remain unequal after every restore. Making this gate honest requires work outside the fixed-step firewall.

**Locations.**

- `src/mp/LockstepClient.ts:153-163,220-231` — `afterSimTick()` records the local hash, but an arriving remote hash is discarded when the local hash is not present; there is no pending-remote comparison when the local hash is later recorded.
- `e2e/mp-02-lockstep.spec.ts:78-96` — the test waits for both peers to report a resync, then asserts only counters/unpaused state; it never asserts equal hashes after restore.
- `artifacts/mp-02/desync-resync.json` — the checked-in green artifact already has unequal Alice/Bob hashes at ticks 90 and 120.

**Evidence.**

1. Exact isolated command, repeated twice on the branch: **0/2**, both timing out at Bob's wait. See `artifacts/sol/fixed-step-gates/mp-02-isolated-repeat-final.txt`.
2. Temporary read-only diagnostic instrumentation captured Alice `tick=714, desyncs=22, resyncs=22` and Bob `tick=713, desyncs=0, resyncs=0`; both were unpaused, both remained connected, and every post-injection hash differed. The instrumentation was removed and `git diff --exit-code -- e2e/mp-02-lockstep.spec.ts` returned zero. See `artifacts/sol/fixed-step-gates/MP-BLOCKER-EVIDENCE.md`.
3. The checked-in green artifact has Alice/Bob tick-90 hashes `fnv1a32:88f71e9f` / `fnv1a32:a35ea391` and tick-120 hashes `fnv1a32:d90e03ca` / `fnv1a32:cb359b78`; task 067's stated “hash-identical within 30 ticks” condition was not enforced by its gate.
4. An independent fresh detached `1b575fd` checkout with fresh dependencies and Vite on port 5294 reproduced the isolated failure; `--repeat-each=5` produced 1 pass / 4 failures. `LockstepClient.ts` is byte-identical to `e374f47`, ruling out a stale merge or branch-local MP edit.

**Decision required.** One of these must be explicitly authorized: (a) permit the MP hash-order correction on this branch, (b) re-sequence F-SOL-PERSIST-002 ahead of the fixed-step READY tail and then merge it back, or (c) amend the branch-1 gate. Sol will not change MP protocol/test semantics or claim READY without that ruling.

## Gate ledger at park time

| Gate | Result | Evidence |
|---|---|---|
| TypeScript | PASS | `artifacts/sol/fixed-step-gates/tsc.log` |
| Production build | PASS | `artifacts/sol/fixed-step-gates/build.log` |
| New fixed-step suite | PASS, 6/6 | `sim-fixed-step-desktop.log` |
| perf-04 determinism | PASS, 2/2; both 600-second/18,000-tick runs `fnv1a32:598dff4d` | `perf-04-desktop.log`, `perf-04-summary.json` |
| Wave-20 FULL p95 vs base | PASS; base median 30 ms, branch 25 ms, change -16.7%, allowance 31.5 ms | `p95-summary.json` plus six raw captures |
| mp-02 | BLOCKED by task 067; branch 1 pass / 1 fail / 1 not run, third case independently passes, clean base resync also red | `mp-02-*.log` |
| Full desktop regression | COMPLETE, not green: 495 pass / 25 fail / 4 skip / 4 not run; Night Shift is the stable branch-specific accelerated red, while GT-03 proved polling-flaky | `full-desktop.log`, `suspicious-*.log`, `night-shift-repeat-comparison.md` |
| Feel A/B + owner eye gate | NOT RUN after the hard blocker was established | Required after policy ruling |
| Mobile/full re-run and READY tail | NOT RUN / NOT WRITTEN | Required after both blockers clear |

This park-time ledger is superseded by the authorization resolution and `artifacts/sol/fixed-step-gates/FINAL-EVIDENCE.md`.
