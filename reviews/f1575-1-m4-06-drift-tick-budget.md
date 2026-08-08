# F-1575-1 — m4-06 drift tick budget

## Verdict

**(A) CONFIRMED.** The existing denied-receipt window is not deterministic: `tickDelta` varied from 23 to 26 across the 24 full-spec runs. The controlled sweeps crossed `driftAbs=0.4` at tick deltas 36–42 on desktop and 43–44 on mobile. At `timescale=4`, the smallest gap from the observed full-spec maximum (26) to a crossing (36) is 10 fixed ticks, or about 2.5 normal 60 Hz rAF frames. That is within reach of page-round-trip latency under the working-machine load that distinguishes the three historical full-gate breaches from the dedicated quiet samples.

The bound is therefore a race against page-round-trip latency. The three historical new-regime breaches now have a concrete mechanism, though their exact `tickDelta` values cannot be recovered because those runs did not log the counter. Recommended follow-up: make the whole `before`→`after` window deterministic. This task deliberately does not implement that cure and does not change either `0.4` bound.

## Full-spec distribution — 24 serial runs

All projects ran serially with `--workers=1`; raw logs and exit-code companions are under `artifacts/f1575-1-drift-tick-budget/<project>/run-NN.{log,rc}`. Every invocation emitted exactly one `[m4-06-denied]` line. The full parsed table is `artifacts/f1575-1-drift-tick-budget/samples.txt`.

| Project | Pass/fail invocations | `tickDelta` distribution | Min | Max | Distinct |
|---|---:|---|---:|---:|---:|
| desktop-chrome | 12 pass, 0 fail | 23×1, 24×6, 25×3, 26×2 | 23 | 26 | 4 |
| mobile-chrome | 11 pass, 1 fail | 23×2, 24×5, 25×3, 26×2 | 23 | 26 | 4 |
| combined | 23 pass, 1 fail | 23×3, 24×11, 25×6, 26×4 | 23 | 26 | 4 |

The paired `simSecondsDelta` values were quantized with the ticks: 23→about 1.9667 s, 24→2.1000 s, 25→2.2333 s, and 26→2.3667 s.

No item-3 run produced a genuine denied-drift breach. Nothing was re-run or excluded. Mobile run 02 remained red at rc=1 with `9 passed (38.5s)`, but its denied test passed with:

```text
[m4-06-denied] driftAbs=0.30904530412222725 gapClosed=0.30863110994026144 tickBefore=25 tickAfter=49 tickDelta=24 simSecondsDelta=2.1000000000000014
```

The unrelated failure was the existing `Prospector floats above terrain while following hero probe points` assertion at `e2e/m4-06-embodiment.spec.ts:229`: expected `position.y >= 1.495`, received `1.287`. It is reported here and deliberately not fixed under the firewall.

## Controlled drift-vs-tick sweeps

Each project ran three times, serially with `--workers=1`; every invocation passed and asserted zero console errors and zero page errors. The files `artifacts/f1575-1-drift-tick-budget/sweep-<project>-NN.txt` contain every sampled pair. The curve up to the first crossing was:

| Project/run | `(tickDelta, driftAbs)` samples through first `> 0.4` | First crossing |
|---|---|---:|
| desktop 01 | (26, 0.223660), (31, 0.354295), (36, 0.422787) | 36 |
| desktop 02 | (29, 0.194659), (35, 0.296651), (37, 0.315387), (42, 0.421070) | 42 |
| desktop 03 | (25, 0.203593), (28, 0.263805), (31, 0.338186), (36, 0.407647) | 36 |
| mobile 01 | (30, 0.209122), (34, 0.257560), (37, 0.322453), (43, 0.406007) | 43 |
| mobile 02 | (30, 0.209122), (34, 0.257560), (39, 0.381257), (44, 0.436165) | 44 |
| mobile 03 | (31, 0.224361), (35, 0.276877), (38, 0.341984), (43, 0.404085) | 43 |

The complete sweeps continued beyond 40 ticks past `before` (final sampled deltas 84–92 desktop and 89–90 mobile). Round trips were not corrected out; their added ticks are recorded in every pair as required.

## Existing-test arrangement proof

`companion()` still performs one `page.evaluate`; it now returns the existing embodiment fields plus the already-published `simulation.tick` and `timeAlive`. No `src/**` file changed.

The denied-receipt test body's exact diff is the existing log line only—no `expect`, `await`, or `page.evaluate` was added, removed, reordered, or reworded:

```diff
-  console.log(`[m4-06-denied] driftAbs=${driftAbs} gapClosed=${gapClosed}`);
+  console.log(`[m4-06-denied] driftAbs=${driftAbs} gapClosed=${gapClosed} tickBefore=${before.simTick} tickAfter=${after.simTick} tickDelta=${after.simTick - before.simTick} simSecondsDelta=${after.timeAlive - before.timeAlive}`);
```

## Verification

- Pre-flight citations: all three required greps returned `1`.
- Baseline build: rc=0, Vite `✓ built in 1.60s`; asset diet `1158214 bytes (1500000 byte ceiling)`.
- `npx tsc --noEmit`: rc=0.
- Full m4-06 spec: desktop 12/12 invocations `10 passed`, rc=0; mobile 11 invocations `10 passed`, rc=0, plus the preserved run 02 `9 passed`, rc=1 described above.
- Sweep spec: desktop 3/3 and mobile 3/3 invocations `1 passed`, rc=0; zero console/page errors asserted in every run.
- `npm run test:node-guards`, run alone under pinned Node 26.4.0: `393 tests / 393 pass / 0 fail / 0 skipped`, rc=0. Two earlier attempts were invalidated honestly: one completed contended under Node 23, and one Node 26 attempt was interrupted immediately after detecting the live FIRE battery; neither is counted.
- Final build: rc=0, Vite `✓ built in 1.50s`; asset diet `1158214 bytes (1500000 byte ceiling)` and `235 terrain/landmark GLBs 592044952 -> 92718740 bytes (84% cut); 54 plate-class PNGs 187042157 -> 24822346 bytes (87% cut); herald spot cuts 375470 bytes`.
- `git add --dry-run` confirmed representative `.log` files would be added; it printed `add` for desktop run 01, mobile run 01, and a sweep file.
- Screenshots are not owed because this measurement renders nothing new.
