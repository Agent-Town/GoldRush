# Task f1579-1: sweep the denied-receipt drift in the LIVE regime, deterministically, and find which clock predicts the breach (LANE-C, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome)** — s1579, from **F-1579-1**, filed by the drain gate that merged f1577-3 (`bc64e04895add67e0525a1382b54443c40489d59`). f1577-3 is answered: pinning `simulation.tick` produced **no breach at any start phase across 1,680 samples** — but it measured a regime the live loop never enters. This task takes the same measurement in the regime where the breach actually happens.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST: `AGENTS.md`; `tasks/BACKLOG.md` row **F-1579-1** (top of file — the finding this task exists to settle, including its two in-fire corrections) and the closed row **F-1577-3**; `reviews/f1577-3-fixed-phase-drift-sweep.md` — **both the runner report AND the `DRAIN GATE — s1579` section, which contains the clock table and the refutation this task is built on**; `e2e/f1575-1-drift-tick-budget.spec.ts` (the whole file, 112 lines — you are extending it again); `e2e/m4-06-embodiment.spec.ts`, the denied-receipt test (~`:404`).

**Pre-flight (LANE-SAFETY, runner-auto-commit aware):** the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP**, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-c status --short` → must be clean, with the **FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

✓ **MEASURED AT AUTHORING (s1579, `node scripts/lane-usable.mjs --all`): `lane-c lane/c ahead=0 behind=16 paths=0 tracked-dirt=0 untracked=0 → USABLE`** — the lane holds nothing main has not absorbed (its f1577-3 output was merged by this same fire), so a reset is provably lossless.

**SEQUENCING / CITATION CHECK (F-1424-3 — run ALL FOUR after the reset, before any edit).** Each key is a single line, verified by me to print `1` on main at dispatch (F-1425-2 — a key spanning a line break matches nowhere, including in the file it was copied from):

```sh
grep -c "private driveRenderScheduleForTest(seconds: number, renderFps: number) {" src/game/Game.ts
grep -c "driveRenderSchedule: (seconds: number, renderFps: number) => {" src/vite-env.d.ts
grep -c "return Math.hypot(a.x - b.x, a.z - b.z);" e2e/f1575-1-drift-tick-budget.spec.ts
grep -c "idleBobAmplitude: 0.045," src/game/Balance.ts
```

All four must print `1`. **If any prints `0`, STOP and report "lane drifted or predecessor absent" — do NOT improvise.** Keys 1 and 2 prove the instrument this whole task depends on exists and is exposed to tests; keys 3 and 4 prove the two facts that rule the idle bob out of the measurement.

## Why (F-1579-1, s1579, measured at the f1577-3 drain gate)

f1577-3 pinned `simulation.tick` at P=35/39/43/47 and swept 70 windows × 3 runs × 2 projects. ✓ **Re-derived at the gate from all 24 raw files: 1,680 samples, the pin held on every one, and the global maximum `driftAbs` was `0.37999999999999995`. No breach anywhere.** Its named target — `(P=35, window=11)`, worst case `0.046754678910244166`, margin `0.35324532108975587` — is the true optimum of what it measured (zero of the measured `(phase, window≥11)` pairs beat it).

⛔ **But that null result belongs to a regime the live game never enters, so the margin must NOT be carried into a re-pin of the `m4-06` bounds.** ✓ **MEASURED at the gate over all 24 runs / 1,656 transitions:** `driftAbs` is **monotonically non-decreasing in every single run** (zero decreases, largest decrease exactly `0`), motion **saturates and stops** between window **51 and 69** in all 24 runs, and `|driftAbs − gapClosed| ≤ 0.0144` — the displacement is essentially **net travel toward the node**. ⚠️ **The ladder curve this task's ancestor was built to explain does the opposite:** it rises to a **0.459 peak**, decays to **0.008** — the Prospector returns almost exactly to where it started — then climbs again to 0.215. **That is an oscillation. The pinned sweep walks and freezes.** Two qualitatively different curves.

🔑 **WHY THE REGIMES DIFFER, verified by reading the code and stated with the arithmetic, because two earlier attempts at this explanation were wrong.** `Loop.timeScale` is **`1`** (`src/core/Loop.ts:35`) and is only ever set for replay speed (`src/game/Game.ts:6211`…`:6260`) — **it does not carry the `?timescale=4` URL param**, which lives in `Game.simTimeScale` and enters at `Game.ts:2499`. With `stepSeconds = FIXED_SIM_STEP_SECONDS = 1/30` (`Game.ts:953`):

| clock | live loop (`?timescale=4`) | manual sim (`advanceSim`) | ratio |
|---|---|---|---|
| ticks per real second | `1 / stepSeconds` = **30** | driven by call count | — |
| `presentationAt` per tick | **1/30 s** | `(steps × 1/30) / scale` = **1/120 s** (`Game.ts:6831`) | **4×** |
| `timeAlive` per tick | `(1/30) × 4` = **2/15** (`Loop.ts:132` → `Game.ts:2499`) | `(1/120) × 4` = **1/30** (`Game.ts:6843`) | **4×** |

➡️ **At a given tick count, `advanceSim` has advanced the simulation's own clock four times less far than the live loop had.** That is why `timeBefore` varied at a fixed `tickBefore` in f1577-3 (at P=35: 2.466667 / 2.566667 / 3.066667) and why its curve has a different shape.

⛔ **THE TRAP THAT ATE TWO EXPLANATIONS BEFORE YOURS — DO NOT BLAME THE IDLE BOB.** It is tempting, and it is impossible. The bob is a **Y-axis** displacement of amplitude **`0.045`** (`src/game/Balance.ts:252`, applied through `floatY` at `src/agent/Embodiment.ts:316`), driven by `presentationAt` (`Embodiment.ts:160`) — while the sweep's `distance()` is `Math.hypot(a.x - b.x, a.z - b.z)`, **x/z only** (`e2e/f1575-1-drift-tick-budget.spec.ts:15`). **A vertical bob cannot move a planar metric.** If your analysis ends at the idle bob, it is wrong; look at `timeAlive`-driven sim behaviour instead.

## The instrument — CONSTRUCTIBLE WITH NO `src/**` CHANGE, ✓ verified by reading the code at authoring

**Use `window.__GR_TEST__.driveRenderSchedule(seconds, renderFps)`, not `advanceSim`.** It is already exposed (`src/vite-env.d.ts:1112`) and implemented at `src/game/Game.ts:6868`. It calls `this.loop.advanceFrame(1 / fps)` in a loop — **the real live-loop code path**: the accumulator, the fixed-step `while`, `update(stepSeconds)`, per-frame presentation, and the dropped-tick branch. Therefore:

- it reproduces the **live** clock ratios exactly (`timeAlive` `2/15` per tick, `presentationAt` `1/fps` per frame), unlike `advanceSim`;
- it is **deterministic** — the frame delta is `1/fps`, never wall-clock, so there is no CPU-load dependence and no rAF timing;
- it **returns `{ renderFrames, simTicks, loop: {...diagnostics} }`**, so you can read achieved ticks and **dropped** ticks per call rather than inferring them.

At `fps = 60` with `stepSeconds = 1/30` and `Loop.timeScale = 1`, the accumulator gains `1/60` per frame and fires one fixed step every **2 frames** — i.e. **30 ticks per simulated second**, matching live. So `driveRenderSchedule(1/60, 60)` advances exactly one render frame and **half** a tick on average; sample on tick CHANGES, not on call count.

⚠️ **Do NOT call `setManualSim(true)` for this sweep.** That is what put f1577-3 in the wrong regime. `driveRenderSchedule` sets `manualAdvanceForTest` itself for the duration and restores it; it also calls `this.loop.stop()`, so the live rAF loop is stopped for you — **which is exactly what makes this deterministic.**

## Scope

1. **Extend the EXISTING spec — do not create a new file.** Add your work as additional `test(...)` blocks in `e2e/f1575-1-drift-tick-budget.spec.ts`. ⛔ **Do NOT create `e2e/f1579-1-*.spec.ts`**: `playwright.config.ts:46` is `testDir: './e2e'` with no `testMatch`, so every `e2e/*.spec.ts` is auto-collected into the standing suites permanently (F-1577-1). ⛔ **Do NOT modify the existing tests at `:19` or the four phase tests at `:59`** — both are banked evidence. Keep your additions under **~25 s per project** and state the measured cost.

2. **Build the live-regime sampler.** Reach the same arrangement the ladder uses (`?debug&timescale=4&nowaves&nolevel&seed=m4-06-denied`, `panAt` the active node, permission denied). Then sweep with **`driveRenderSchedule`** in small increments, recording per sample: `simTick`, `timeAlive`, the x/z `position`, `driftAbs`, `gapClosed`, and the **`renderFrames` / `simTicks` / dropped-tick** figures the call returns. Sweep far enough to cover the ladder's full documented curve — **at least to `tickDelta` 120**, since the ladder's decay-to-`0.008` sits at ~105 and its second rise at ~119.

3. **Answer the question the cure needs, in these words or better.** State:
   - **whether the breach band REPRODUCES in this regime** — the `tickDelta` range where `driftAbs >= 0.4`, or that there is none;
   - **whether the curve OSCILLATES here** (rises, decays substantially, rises again) or is monotonic as in f1577-3 — quote the decay minimum and where it occurs. **This is the discriminator between the two regimes and is the single most important number in your report.**
   - **which clock predicts the breach**: with both `simTick` and `timeAlive` recorded per sample, say whether breaches cluster by tick count, by `timeAlive`, or by neither. A scatter of the breaching samples' `(tickBefore, timeBefore)` pairs is the evidence.
   - **a NAMED RECOMMENDED TARGET** — the `(start condition, window)` pair whose worst-case `driftAbs` across all runs has the **largest margin below `0.4`**, quoted with that margin, **or** an explicit statement that no pair clears it. ⚠️ **A recommendation without a margin number is not a recommendation.**

4. **Runs and banking.** **3 runs per project, both projects, `--workers=1`, serial.** Bank raw samples to `artifacts/f1579-1-live-regime-sweep/<project>-run-NN.txt`. Because the instrument is deterministic, **the three runs should agree closely — and if they do NOT, that is itself a finding: report the spread rather than averaging it away**, since a deterministic instrument that still varies means something outside the loop is leaking in.

5. **No-op and honesty guards.** Any run producing `driftAbs >= 0.4` is data: **quote it in full, never re-run it away, never exclude it as an outlier.** ⛔ **If the breach does NOT reproduce here either, say so plainly** — that is a legitimate and important outcome, and it would mean the breach depends on real-time/CPU-load effects that no deterministic harness can reach, which the next task needs to know. Do not manufacture a breach by widening the sweep until one appears.

## Firewall

**Touch ONLY:** `e2e/f1575-1-drift-tick-budget.spec.ts` (**additive only** — new `test(...)` blocks and helpers; the existing tests at `:19` and `:59` unchanged) · `artifacts/f1579-1-live-regime-sweep/**` (new) · `reviews/f1579-1-live-regime-drift-sweep.md` (new, your report).

**NO changes to:** ⛔ **any `expect(...)` in `e2e/m4-06-embodiment.spec.ts`, and above all the `0.4` bounds and the `0.45`** — this task produces the evidence a re-pin would need, so **re-pinning inside it is a task failure even if it greens the suite** (F-1441-3) · **`e2e/m4-06-embodiment.spec.ts` at all** · any `src/**` — `driveRenderSchedule`, the tick counter and `timeAlive` are all already exposed, which is the point of the instrument section above; **if you believe a src change is required, STOP and report rather than making one** · `src/sim/`, `src/systems/`, `src/entities/` · `playwright.config.ts` · `.gitignore` · `scripts/**` · `tasks/**` · `tasks/goals.json` · `tasks/BACKLOG.md` · `STATUS.md` · `CLAUDE.md` · `scripts/fire.md` · `.claude/skills/**` · any other `e2e/*.spec.ts`.

ⓘ **`package.json` is deliberately NOT on this list** (F-1577-1): barring it was once justified by "a new spec is a standing-suite cost", but `testDir: './e2e'` means `package.json` never controlled that cost. The real lever is scope item 1's "extend, don't create", and the honest cost is stated there.

🔓 **No firewall lift is granted.** If you find an adjacent defect, **report it in your review file — do not fix it** (CLAUDE.md §4.5).

## Self-check (evidence, not vibes)

`npx tsc --noEmit` rc=0. `npm run build` green — quote the Vite time and the asset-diet line. **`e2e/f1575-1-drift-tick-budget.spec.ts` green on both projects** at `--workers=1`, run serially — quote the `N passed` line and rc for every invocation, and **do not censor a red**. Confirm the pre-existing tests at `:19` and `:59` still pass unmodified.

Boot probe: **zero console errors, zero page errors**, asserted in-spec, desktop and 390 px mobile.

**Adjacent, and it is the one that matters:** `e2e/m4-06-embodiment.spec.ts:404` (`'permission-denied receipts do not send the Prospector to the denied target'`) — run the **whole m4-06 file** on both projects, unmodified-green. ⚠️ **This test is a known ~2.4% flake and you are not expected to launder it:** if its denied-drift assertion breaches, **bank the full `[m4-06-denied]` line including `tickBefore`/`tickDelta` and report it as data.** A breach there does **not** fail your slice; concealing one does.

`npm run test:node-guards` is **NOT owed** — F-1460-1's trigger is `src/sim/`, `src/systems/` or `src/entities/`, and this diff touches none of them (`e2e/**` + `artifacts/**` + `reviews/**` only). Do not run it; it costs ~181 s and would contend with the fire's batteries.

Screenshots are **not** owed — this slice renders nothing new; say so explicitly rather than silently skipping.

**No-op guard:** if you find yourself about to exit without changes, **WRITE WHY into your report first** (Mistake #1).

**READY-FOR-GATES** + report: whether the breach band reproduces in the live regime · **whether the curve oscillates or is monotonic, with the decay minimum quoted** · which clock predicts the breach, with the `(tickBefore, timeBefore)` evidence · your NAMED target with its measured worst-case margin below `0.4`, or an explicit "none clears it" · the run-to-run spread of a deterministic instrument · the measured standing-suite cost per project · confirmation the `:19` and `:59` tests are unchanged and green · any breach observed, quoted in full · anything adjacent you found and deliberately did not fix.
