# F-1577-3 — fixed-phase drift sweep

## Verdict

**NEGATIVE RESULT: pinning `simulation.tick` does not reproduce or move the breach band.** Across 1,680 pinned samples (four `tickBefore` values × 70 windows × three runs × two projects), no `driftAbs` reached `0.4`. The drain gate's clean/breach split therefore is not explained by `tickBefore` alone.

The sweep also found why that conclusion must stay narrow: `tickBefore` is not the Prospector's complete motion phase. At `timescale=4`, normal loop ticks advance `timeAlive` four times as quickly as `advanceSim` ticks. The same pinned tick therefore arrived at different `timeBefore` values across runs, while `Embodiment.ts` drives idle oscillation from `timeAlive`. A cure must pin the motion clock as well as the tick/window; pinning only `(tickBefore, tickDelta)` is still under-specified.

## Fixed-phase result

All entries aggregate three serial desktop runs and three serial 390 px mobile runs. Raw samples are in `artifacts/f1577-3-fixed-phase-sweep/<project>-P<NN>-run-NN.txt` (70 lines each).

| Start tick | `driftAbs >= 0.4` band | Largest observed drift through window 70 | Observed `timeBefore` range |
|---:|---|---:|---:|
| P=35 | none | 0.380000 at window 69 | 2.466667–3.066667 |
| P=39 | none | 0.368978 at window 67 | 3.300000–3.700000 |
| P=43 | none | 0.346144 at window 63 | 3.433333–3.933333 |
| P=47 | none | 0.323360 at window 59 | 3.566667–3.966667 |

**Does the band move with start phase? No.** There is no band at any requested tick phase through window 70. Thus the gate's five clean runs versus its P=47 breach need another explanation. The measured hidden axis is `timeAlive` (and possibly receipt timing before the pin), not `simulation.tick` alone.

## Named target

**Recommended measured target: `(start tick P=35, window=11)`**, preserving the existing test's 0.35 s / 11-fixed-step semantic. Its worst-case `driftAbs` across all six refreshed runs was **0.046754678910244166**, giving a **0.35324532108975587 margin below 0.4**. This is the largest margin among measured windows `>=11`.

This target is safe only inside the requested tick-pinned harness. It is not yet a sufficient cure because P=35 mapped to three distinct `timeBefore` values spanning 0.6 s. A production cure must pin that clock too, then re-measure before changing `m4-06`.

## Harness

- The existing f1575-1 test (lines 19–58) is byte-identical to `HEAD`; `cmp` returned 0.
- Four additive tests use P=35/39/43/47. Each reaches permission denial, then one `page.evaluate` latches manual simulation, advances the shortfall, asserts exact `tickBefore`, and makes 70 separate `advanceSim(1/30)` calls. Each call flushes presentation; the forbidden `onTick` sampler is not used.
- Every sample records `tickBefore`, `tickDelta`, `driftAbs`, `gapClosed`, and the diagnostic `timeBefore` that exposed the hidden clock.
- Zero console and page errors are asserted in every phase test.

## Evidence

| Gate | Result |
|---|---|
| Required pre-flight greps | `1`, `1`, `1` |
| `npx tsc --noEmit` | rc=0 |
| Final `npm run build` | rc=0; Vite `1.22s` |
| Asset diet | Herald `1158214 / 1500000`; 235 GLBs `592044952 -> 92718740` (84%); 54 PNGs `187042157 -> 24822346` (87%) |
| Fixed-phase desktop, runs 01–03 | `4 passed` each; added-test cost 8.0 s, 7.8 s, 8.0 s |
| Fixed-phase mobile, runs 01–03 | `4 passed` each; added-test cost 8.0 s, 8.0 s, 8.2 s |
| Final full f1575-1 spec, desktop | `5 passed (11.5s)`, rc=0 |
| Final full f1575-1 spec, mobile | `5 passed (11.5s)`, rc=0 |
| Whole m4-06, desktop | `10 passed (42.8s)`, rc=0; denied line: `[m4-06-denied] driftAbs=0.30904530412222725 gapClosed=0.30863110994026144 tickBefore=25 tickAfter=49 tickDelta=24 simSecondsDelta=2.1000000000000014` |
| Whole m4-06, mobile | `10 passed (42.6s)`, rc=0; denied line: `[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074 tickBefore=25 tickAfter=50 tickDelta=25 simSecondsDelta=2.233333333333335` |

No pinned or adjacent denied-drift run breached `0.4`; there is therefore no breach line to exclude or re-run away. The two early harness reds are retained as `desktop-chrome-invalid-harness-run.txt` (rAF ticks between protocol calls) and `desktop-chrome-invalid-console-run.txt` (reload aborted an in-flight GLTF blob). Both were instrument failures, fixed by keeping all single-tick calls inside one evaluate and giving each phase a fresh Playwright page.

The independent `codex review --uncommitted` run found the tick/`timeAlive` mismatch and reproduced it directly. I verified the finding against `Game.ts`: `simTick` increments per update, normal simulation multiplies delta by `simTimeScale`, while `advanceSimForTest` divides its frame delta by that scale. The reviewer later recursively launched another review and was terminated; no other finding was emitted.

`npm run test:node-guards` was not run because the diff touches no trigger path. Screenshots are not owed because this slice renders nothing new. Playwright-regenerated existing PNG evidence was discarded under the factory-churn exception; no screenshot is part of this slice.

## Adjacent finding deliberately not fixed

The task calls `simulation.tick` the start phase, but the Prospector oscillation actually consumes `timeAlive`. This is a test-design defect in the prescribed measurement, not a request for `src/**` changes. No source, m4-06 assertion, threshold, package, config, or other e2e file was changed.
