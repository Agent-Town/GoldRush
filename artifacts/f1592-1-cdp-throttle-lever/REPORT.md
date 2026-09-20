# F-1592-1 lever proof — CDP CPU throttling arms the 0.05 clamp

**s1592, 2026-08-09.** Run by the fire that drained `f1591-1`, before authoring anything on this lever — which is the whole point (F-1590-1: *prove the LEVER, not just the subject*).

## Verdict

**LEVER PROVEN, AND THE F-1591-1 DERIVATION IS NOW DIRECTLY CONFIRMED AT THE REGIME THAT MATTERS.**

CDP `Emulation.setCPUThrottlingRate` arms the clamp that 16 external CPU hogs provably could not touch. At rate 60 and 80, **every single frame** advanced `town.elapsed` by exactly `0.05` — mean and max identical to 15 decimal places. That is the first direct observation of the clamp *engaging* in four attempts at F-1587-2; all prior evidence, including `f1591-1`'s Arm 0, was taken above the knee where the ratio provably cannot move.

## Method

`probe.mjs` here is `artifacts/f1591-1-frame-supply-cliff/probe.mjs` (merged `5936ec48e`) with **one change of substance**: the lever. Instead of spawning external CPU hogs it opens a CDP session and calls `Emulation.setCPUThrottlingRate`, which throttles the **renderer main thread** directly.

It also fixes F-1592-2 on itself: **the artifact records the lever's own state** — rate, whether the CDP call was applied, and an independent liveness measurement (a fixed 3M-iteration busy loop timed inside the page). The busy loop is what proves the throttle was live *during* the run, rather than asserted in prose.

Scratch server on port **5253** (Mistake #12 attribution hygiene), vite ready in 76 ms, killed afterwards.

## Results

| Rate | Busy-loop | Armed? | fps | Mean frame interval | Mean Δelapsed/Δframe | Max Δelapsed/Δframe | Frames | Wait | Errors |
|---:|---:|:---:|---:|---:|---:|---:|---:|---:|---:|
| 1 (control) | 2.3 ms | **No** | 119.56 | 8.4 ms | 0.008370 | 0.008921 | 452 | 3.78 s | 0 |
| 20 | 41.1 ms | **Yes** | 13.15 | 76.0 ms | 0.045605 | **0.050000** | 66 | 5.02 s | 0 |
| 60 | 164.3 ms | **Yes** | 4.94 | 202.6 ms | **0.050000** | **0.050000** | 35 | 7.09 s | 0 |
| 80 | 198.5 ms | **Yes** | 4.05 | 246.9 ms | **0.050000** | **0.050000** | 37 | 9.14 s | 0 |
| 100 | 310.4 ms | n/a | — | — | — | — | 0 | — | 0 |

**The control reproduces the merged `f1591-1` artifacts almost exactly** (119.56 fps / 8.36 ms / 0.008370 here vs 119.42–119.97 / 8.335–8.374 / 0.008351–0.008388 there), which is what licenses this harness as a valid instrument for the comparison.

**The lever is live and proportionate**: the in-page busy loop runs 2.3 ms unthrottled and 41.1 ms at rate 20 — **17.9×**, against a requested 20×. It scales monotonically to 310.4 ms at rate 100.

## What this establishes

1. **The 0.05 clamp is real and engages exactly as derived.** At rates 60 and 80 the ratio is pinned at `0.05` on every frame. F-1591-1 read this out of `src/core/Loop.ts:27/116/121`; it is now measured, not inferred.
2. **The lever class matters more than the lever's magnitude.** External hogs at N=16 moved the frame interval by **0.5%**; a CDP throttle at rate 20 moved it by **809%**. This is the concrete content of F-1592-1: the loop is vsync-pinned, so contention for cores is the wrong axis and no amount of it would ever have worked.
3. **The cliff arithmetic now rests on a measured constant.** With `elapsed` gaining exactly `0.05`/frame, reaching `elapsed > 4` from zero needs **81 presented frames**, costing `81 / fps` seconds and exceeding the spec's 30 s cap below **~2.7 fps**. The 4.05 fps run took 9.14 s for a partial climb and did not time out, consistent with the model.

## What this does NOT establish — read this before authoring a cure

- ❌ **It does not show the factory's real arrangement ever reaches 2.7 fps.** That is still F-1590-2's untested batch-position axis (Arm B), which `f1591-1` correctly stopped before running. A synthetic throttle proving the mechanism *can* fire is not evidence that anything in the real gate battery *does* fire it.
- ❌ **It does not reproduce F-1587-2's 41.8 s observation.** No run here timed out.
- ⚠️ **The rate-100 row is a non-measurement, not a null result.** `town.elapsed` had already passed 4 during the scene-load wait, so the polling window opened with zero frames left to sample. It is retained rather than discarded because it marks a real limit of this probe at extreme throttle — and because deleting an inconvenient run is how a curve gets prettier than the evidence.
