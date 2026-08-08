---
task: f1579-1-live-regime-drift-sweep
date: 2026-08-09
lane: lane-c
status: ready-for-gates
---

# F-1579-1 live-regime denied-receipt drift sweep

## Verdict

**The breach reproduces, and the curve oscillates.** The deterministic live-loop path rises through `0.4`, decays to a global measured minimum of **`0.021095023109728415` across absolute `simTick=82–85`, `timeAlive=10.933333333333334…–11.333333333333332…`** (desktop; the last minimum is relative window 75 for the tick-10 start and 74 for tick-11 starts), then rises again. Mobile independently decays to `0.027658633371878624` across `simTick=86–88`, relative windows 80–82, and rises to `0.30442076144704566` by window 120.

The live-loop clocks are not independently identifiable in this instrument. Every sample obeys `timeAlive = simTick × 2/15` within floating-point error, so breach samples cluster equally by absolute tick and absolute `timeAlive`. The implementation makes `timeAlive` the motion input, but this sweep cannot claim that one of two perfectly collinear clocks predicts better than the other.

## Instrument

I added one test to `e2e/f1575-1-drift-tick-budget.spec.ts`. The existing test at original line 19 and all four phase tests at original line 59 are byte-unchanged.

The new test:

- boots `/?debug&timescale=4&nowaves&nolevel&seed=m4-06-denied`;
- issues `panAt` to the active node and confirms `PERMISSION_DENIED`;
- does not call `setManualSim(true)` or `advanceSim`;
- calls `driveRenderSchedule(1 / 30, 60)` 120 times inside one `page.evaluate`, producing exactly two render frames and one live fixed step per sample;
- records `simTick`, `timeAlive`, x/z position, `driftAbs`, `gapClosed`, `renderFrames`, `simTicks`, and `droppedTicks`;
- asserts zero console errors and zero page errors.

Every one of the 720 banked samples reported `renderFrames=2`, `simTicks=1`, and `droppedTicks=0`.

## Raw runs

Three serial runs per project are banked without exclusions:

- `artifacts/f1579-1-live-regime-sweep/desktop-chrome-run-01.txt`
- `artifacts/f1579-1-live-regime-sweep/desktop-chrome-run-02.txt`
- `artifacts/f1579-1-live-regime-sweep/desktop-chrome-run-03.txt`
- `artifacts/f1579-1-live-regime-sweep/mobile-chrome-run-01.txt`
- `artifacts/f1579-1-live-regime-sweep/mobile-chrome-run-02.txt`
- `artifacts/f1579-1-live-regime-sweep/mobile-chrome-run-03.txt`

Each file contains all 120 full sample lines, including every `driftAbs >= 0.4` line.

| run | `(tickBefore, timeBefore)` | breach band(s), relative `tickDelta` | peak | decay minimum after first band |
|---|---:|---:|---:|---:|
| desktop 01 | `(10, 1.3333333333333333)` | `26–47`, `94–103` | `0.48555638189606726` @ 44 | `0.021095023109728415` @ 75 |
| desktop 02 | `(11, 1.4666666666666666)` | `25–46`, `93–102` | `0.48555638189606726` @ 43 | `0.021095023109728415` @ 74 |
| desktop 03 | `(11, 1.4666666666666666)` | `25–46`, `93–102` | `0.48555638189606726` @ 43 | `0.021095023109728415` @ 74 |
| mobile 01 | `(6, 0.7999999999999999)` | `34–48` | `0.4590697114818173` @ 48 | `0.027658633371878624` @ 82 |
| mobile 02 | `(6, 0.7999999999999999)` | `34–48` | `0.4590697114818173` @ 48 | `0.027658633371878624` @ 82 |
| mobile 03 | `(6, 0.7999999999999999)` | `34–48` | `0.4590697114818173` @ 48 | `0.027658633371878624` @ 82 |

The second rise is present in all runs, but it crosses `0.4` within 120 ticks only in the desktop starts. No breach was discarded.

## Which clock predicts the breach?

The breaching samples have exactly three observed start pairs:

```text
(tickBefore=10, timeBefore=1.3333333333333333)
(tickBefore=11, timeBefore=1.4666666666666666)
(tickBefore=6,  timeBefore=0.7999999999999999)
```

Their common peak plateau covers absolute **`simTick=40–54`, `timeAlive=5.333333333333337…–7.2`**. First-band absolute coverage is tick 36–57 / time 4.8–7.6 on desktop and tick 40–54 / time 5.333333333333…–7.2 on mobile. Desktop's second band is absolute tick 104–113 / time 13.866666666666…–15.066666666666….

This is evidence for an absolute motion phase, not a relative window threshold: changing the start shifts the breach band on the `tickDelta` axis. But `simTick` and `timeAlive` stay in a fixed 30 Hz-to-4× ratio here, so the scatter cannot distinguish them. Code inspection identifies `timeAlive` as the input to `Embodiment.idlePoint`; the measured prediction is **both clocks equally, neither independently**.

## Determinism and spread

Runs with the same start pair are exact across all 120 `driftAbs` values: desktop 02=03 and mobile 01=02=03, spread **0**. Desktop 01 starts one tick earlier; comparing it by relative window against desktop 02/03 produces a maximum spread of `0.07288901808876411` at window 75. Across both project start conditions, the maximum same-window spread is `0.19758972875497294` at window 88. This is start-state leakage from boot timing, not variation in `driveRenderSchedule` after it stops rAF.

## Recommended target

**Named target: `(receipt-return start, window=76 live ticks)`**. Among comparable windows `>=11` (the existing denied check's minimum observation scale), it has the lowest worst-case drift across all six runs: **`0.09398404119849252`**, for a margin below `0.4` of **`0.3060159588015075`**. Window 77 ties it.

For completeness, unconstrained windows 1–3 all measure zero drift and therefore have the mathematical maximum margin `0.4`; they are not recommended because shortening the observation to at most 0.1 live seconds would stop testing the existing denial-settle behaviour.

The target start condition deliberately means immediately after the denied receipt returns, not a claimed fixed `(simTick, timeAlive)` pair: this sweep proves the boot clock can already be `(6, 0.8)`, `(10, 1.3333…)`, or `(11, 1.4666…)` at that point. A cure that requires a numerically pinned phase needs a separate arrangement step and fresh evidence.

## Gates run in lane-c

- Reset lane to local `main`; all four required sequencing keys printed `1`.
- Pre-edit `npm install --no-audit --no-fund`: up to date.
- Pre-edit build: rc 0; Vite `1.70s`; asset diet `235` GLBs `84%` cut, `54` plate PNGs `87%` cut.
- Post-edit `npx tsc --noEmit`: rc 0.
- Final post-edit build: rc 0; Vite **`1.40s`**; asset diet **`235 terrain/landmark GLBs 592044952 -> 92718740 bytes (84% cut); 54 plate-class PNGs 187042157 -> 24822346 bytes (87% cut); herald spot cuts 375470 bytes.`**
- New sampler, 3 serial runs per project: every invocation `1 passed`, rc 0.
- Final full `f1575-1-drift-tick-budget.spec.ts`, desktop: **`6 passed (14.4s)`**, rc 0; wall time **14.92s**.
- Final full `f1575-1-drift-tick-budget.spec.ts`, mobile: **`6 passed (14.4s)`**, rc 0; wall time **14.91s**.
- The original line-19 test and all four original line-59 phase tests passed unmodified in both full runs.
- Whole unchanged `m4-06-embodiment.spec.ts`, desktop: **`10 passed (41.9s)`**, rc 0.
- Whole unchanged `m4-06-embodiment.spec.ts`, mobile: **`10 passed (42.2s)`**, rc 0.
- Desktop adjacent denied line: `[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074 tickBefore=26 tickAfter=50 tickDelta=24 simSecondsDelta=2.100000000000002`.
- Mobile adjacent denied line: `[m4-06-denied] driftAbs=0.3359077254247072 gapClosed=0.33534841091296563 tickBefore=24 tickAfter=49 tickDelta=25 simSecondsDelta=2.2333333333333347`.
- Zero console errors and zero page errors on desktop and 390 px mobile, asserted in the new test.
- `test:node-guards` not run: not owed for an `e2e/**` + evidence-only diff.
- Screenshots not taken: no rendered output changed.

## Adjacent findings deliberately not fixed

The live start clock varies before the first deterministic schedule call. A future cure that wants a numerically fixed start phase must pin that arrangement explicitly; this evidence does not authorize a `src/**` change or any change to the `m4-06` bounds.

READY-FOR-GATES
