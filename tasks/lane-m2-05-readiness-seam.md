# lane-m2-05-readiness-seam — sample the renderer when it is settled, not mid-race

**FIRE-AUTHORED s1032 (attended review welcome).**
**Role:** Codex runner, lane-c. **Workdir:** `worktrees/lane-c` (branch `lane/e2-arsenal`).

## READ FIRST (paths, in this order)
- `reviews/m2-05-wreck-repair-drift.md` — the s1032 drain that produced this task's entire premise.
- `e2e/m2-05-base-damage-repair.spec.ts:319-352` — the guard you are fixing.
- `src/game/Game.ts:1640` (Run3d load starts, `run3dPilotState = 'loading'`) and
  `src/game/Game.ts:4424-4428` (**the engine's own readiness discipline — read this, it is the model
  for your fix**).
- `src/game/Run3dPilot.ts:25` (the state writer) and `e2e/run3d-turret.spec.ts:61` +
  `e2e/run3d-assay-bench.spec.ts:61` (**the existing wait pattern — reuse it, do not invent one**).
- `src/systems/Vfx.ts:20` (`FLOAT_DURATION = 0.8`) and `src/systems/BuildSystem.ts:1266` (the
  per-repair float emitter).
- `CLAUDE.md` §5 Mistake #1 (no-op) and #12 (gate contamination).

## WHY (quoted evidence, dated — this is not a hypothesis)

F-1030-1 and F-1030-2 have survived three fires because everyone assumed they were a **wreck/repair
resource leak**. The s1032 drain of lane-c's diagnostic run (`reviews/m2-05-wreck-repair-drift.md`,
2026-07-25) **disproved that with object-level instrumentation on clean main**. There is no leak.
There are two races, and the guard samples both of them mid-flight:

1. **Geometry `94 → 95`** is the **Run3d sentry-beacon GLB cylinder** replacing its procedural
   fallback *after* the baseline snapshot is taken (`Game.ts:1640`, `Run3dPilot.ts:125`). Run3d
   begins loading in `Game.ts` while the frozen `warmVfx` seam waits only for the terrain pilot.
2. **The elevated draw calls** are **live transient sprites, on screen by design**: repair-cost
   floats emitted per repair at `BuildSystem.ts:1266`, each alive `FLOAT_DURATION = 0.8` simulated
   seconds (`Vfx.ts:20`), plus `ProspectorSpriteFade`. The `after` snapshot is taken the instant the
   third repair resolves — **while they are still up**.

**The asymmetry that proves it, at file:line:** `baseline` is sampled after
`await waitForSim(page, 0.5)` (`:328`), but `after` (`:343`) has **no settle wait at all**. The test
compares a partly-settled frame against a completely unsettled one and calls the difference a leak.

**The engine already knows this is wrong.** `Game.ts:4426` refuses to score runtime performance
while either pilot is `'loading'` and calls `resetFrameWindow()` instead — the codebase's own rule
is *do not measure mid-load*. This guard is the one place that measures anyway. Your job is to make
the test obey the discipline the engine already follows.

**A candidate `Run3dPilot` change was already tried and correctly thrown away** (it closed neither
gate). The fix is not in `src/`.

## SCOPE (numbered, each testable)
1. **Reproduce on clean main first, before any edit.** Both projects, **isolated AND in-suite**, at
   `--workers=1 --repeat-each=3`. Report the pass/fail count for each of the four shapes. Expect
   roughly: desktop isolated calls `89→92` ~2/3, mobile isolated calls `65→68/70/69` ~3/3, desktop
   full-file geometry `94→95` ~1/3, mobile full-file calls ~2/3. **If your numbers disagree with
   that table, say so plainly and stop to report** — a changed failure signature means the premise
   moved and this master is stale.
2. **Fix the baseline snapshot: wait for Run3d to reach a terminal state.** Terminal states written
   by `Run3dPilot.ts:25` are **`ready`**, **`lite`** and **`failed`**; `loading` is the only
   non-terminal one. Use the existing pattern from `run3d-turret.spec.ts:61`
   (`page.waitForFunction(() => document.querySelector('canvas')?.dataset.run3dPilotState === ...)`)
   — **accept any terminal state, do not require `ready`**, because tier/asset conditions legitimately
   produce `lite` and `failed`, and a test that hangs waiting for `ready` on a `lite` machine is a
   new flake, not a fix.
3. **Fix the `after` snapshot: let the transient floats settle.** Add a settle wait strictly greater
   than `FLOAT_DURATION` (0.8 simulated seconds) before sampling `after`, mirroring the
   `waitForSim(page, 0.5)` the baseline already has. Confirm by measurement — not by assumption —
   that `ProspectorSpriteFade` has also cleared by the time you sample; if it has not, say what its
   dwell actually is and wait for that instead.
4. **Prove the repaired guard can still fail.** Mandatory, and it is the whole point of the exercise:
   demonstrate that the assertions still go red when something genuinely leaks (a temporary local
   mutation that registers a geometry or leaves a sprite alive is fine — revert it, and verify the
   revert two ways). **A green run only proves the line executed, never that it still bites.** This
   is the step that turned `m2-01:322` from vacuously red into a real guard and that closed F-1029-3.
5. Report the before/after table per project, isolated **and** in-suite, at `--repeat-each=3`.

## FIREWALL
**TOUCH-ONLY:** `e2e/m2-05-base-damage-repair.spec.ts`.

**NO:**
- **Do not widen the `+2` draw-call tolerance at `:349` and do not relax the `toBe` geometry
  equality at `:348`.** The numbers are correct; the *moment they are sampled* is wrong. Widening a
  tolerance makes the guard stop noticing — that is the exact defect class this board just closed
  three times (F-1026-1, F-1026-5/`m2-01:322`, F-1029-3). Reject-don't-stretch.
- **No `src/` changes.** This is a measurement defect. A `Run3dPilot` candidate was already tried
  and reverted. If your evidence genuinely forces a source change, **STOP and report** rather than
  land it.
- Do not `test.skip`, delete, or comment out either assertion.
- Do not touch `:198` (**F-1030-2**'s documented pre-existing repair-dwell red) unless your fix
  closes it as a side effect — if it does, say so explicitly with before/after.
- Do not touch any other expected number on this board: `m2-01`'s **200** draw calls, `m1-01`'s
  **77** geometries, `asset-diet`'s **25,000,000** bytes, `e5-deepwater-claim`'s resource guard.
- No refactors, no drive-by tidying, no other suites.

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its
content is already merged to main (verify via git log/diff), it is a SAFE DUPE →
`git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead
commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds
uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green
before touching anything.

**Pre-proved for you (s1032, so you need not spend budget on it):** `lane/e2-arsenal`'s tip
`c07f749a` is a **single file, `reviews/shots-m2-05-drift/repaired-beacon-three-cycles.png`, 0
insertions 0 deletions of code** (`git show c07f749a --stat`) — the diagnostic run's screenshot,
which **s1032 merged to main in this same fire**. Zero lane-unique code. It is therefore a
**SAFE DUPE** — confirm, then proceed.

## No-op guard
If you find yourself about to exit without changes, WRITE WHY into your report first. Note that the
**previous** run of this slice was a legitimate diagnostic no-op — but it earned that by producing
the file:line diagnosis this master is built on. A second no-op that merely re-reports the same
diagnosis is NOT acceptable: the diagnosis is already banked, and the measurement fix is now the
deliverable.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` + `npm run build` green.
**The slice's own gate:** `e2e/m2-05-base-damage-repair.spec.ts` green **desktop + mobile** at
`--workers=1`, run **both isolated and as part of the full file**, each at `--repeat-each=3`.
**Report all four numbers.** A single green run is not evidence for a test whose failure modes are
1-in-3 (F-1030-1) — it reads green two times out of three by luck alone.
Adjacent unmodified-green both projects at `--workers=1`: `e2e/m1-01-*`, `e2e/m2-01-*`,
`e2e/run3d-turret.spec.ts`, `e2e/run3d-assay-bench.spec.ts` (the last two share the readiness
pattern you are reusing — if you changed how it behaves, they will say so).
Zero console/page errors on both viewports.

End: **READY-FOR-GATES** + report: the scope-1 clean-main table, what terminal states you accepted
and why, the settle duration you chose with the measurement that justifies it, the scope-4
can-it-still-fail proof, whether `:198` moved, and the four-shape before/after table.
