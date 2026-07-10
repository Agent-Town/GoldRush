# Sol findings — fixed-step implementation

Branch: `sol/fixed-step-unification`

Implementation base: `2cdcf210b51bb265661c7a232d49e43c54948bba`

Status: **PARKED — not READY-FOR-GATES**

The production, multiplayer, and rAF-driven test paths preserve the five decisions in `specs/sim-fixed-step/README.md:7-12`. A pre-existing direct-advance test API still permits caller-selected simulation steps outside the Loop; removing that escape hatch would require changing legacy fixtures and is included in F-SOL-SIM-IMPL-001. The new fixed-step suite and the production performance comparison are green. Two required dependencies/gates are not drainable without orchestrator action, so this branch stops here rather than silently changing harness policy or taking task 067's seam.

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

**Finding.** The required `mp-02` gate is blocked by the already-sequenced task 067 corrective. Sol must not repair or absorb that seam on this branch.

**Locations.**

- `e2e/mp-02-lockstep.spec.ts:67-95` — hash-mismatch resync must unpause both riders.
- Main commit `dab8112` — queues the task 067 MP resync corrective; it is a task/master commit, not a landed fix.
- `tasks/done/` — contains no task 067 completion marker at the time of this note.

**Evidence.**

- Branch required-suite run: identity passed, resync timed out waiting for the restored peer, and the serial third case did not run. The third case passes independently. See `artifacts/sol/fixed-step-gates/mp-02-desktop.log` and `mp-02-third-case.log`.
- Clean base `2cdcf21` fails the same resync case with the rider still paused. See `artifacts/sol/fixed-step-gates/mp-02-baseline-resync.log`.

**Dependency.** Land task 067 on main, update this branch through the orchestrator's normal drain flow, then rerun `mp-02` 3/3. F-SOL-PERSIST-002 remains untouched.

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

No `READY-FOR-GATES` claim is made by this parked branch.
