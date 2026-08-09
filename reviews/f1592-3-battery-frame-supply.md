# F-1592-3 real gate-battery frame-supply measurement

## Verdict

**DOES-NOT-ARM-IN-PRACTICE.** Arm P passed first: the rate-60 positive control armed at 3.63 fps and pinned both mean and maximum `Δelapsed/Δframe` to `0.050000`. The same probe then stayed near 120 fps in both unloaded controls and both repetitions run concurrently with the factory's real serial gate battery.

This lands on **row 2: Positive control arms = Yes; Real battery arms = No.** The harness works and the real battery does not starve frame supply. F-1587-2 is not a frame-supply defect in the factory arrangement measured here; this is a negative finding, not a failed experiment. No cure shipped.

## Pre-flight

- The required report sentence, CDP call, and `MAX_PRESENTATION_DELTA_SECONDS = 0.05` sentinel each occurred exactly once.
- `lane/b` had no ahead commits and no uncommitted changes. `main` moved ahead during the run; no lane reset was needed.
- `npm install --no-audit --no-fund` returned rc=0.
- The pre-edit `npm run build` returned rc=0: TypeScript passed, Vite built, and asset-diet passed.
- The required post-build cleanliness line was empty.

## Discriminating table

Arm P ran first. Its `armed: true` and exact clamp ratio licensed every later result.

| Arm / repetition | Rate | Background load | Busy loop | Armed? | fps | Mean frame interval | Mean `Δelapsed/Δframe` | Max `Δelapsed/Δframe` | Frames | Wait | Errors |
|---|---:|---|---:|:---:|---:|---:|---:|---:|---:|---:|---:|
| **P** | 60 | None | 140.8 ms | **Yes** | 3.63 | 275.601 ms | **0.050000** | **0.050000** | 23 | 6.339 s | 0 |
| C-1 | 1 | None | 2.2 ms | No | 119.70 | 8.354 ms | 0.008348 | 0.008557 | 453 | 3.785 s | 0 |
| C-2 | 1 | None | 2.5 ms | No | 119.65 | 8.358 ms | 0.008367 | 0.008907 | 454 | 3.794 s | 0 |
| B-1 | 1 | `gate-battery`: `beauty-town`, desktop Chromium, 1 worker | 2.4 ms | **No** | 119.59 | 8.362 ms | 0.008370 | 0.008925 | 452 | 3.780 s | 0 |
| B-2 | 1 | `gate-battery`: `beauty-town`, desktop Chromium, 1 worker | 2.4 ms | **No** | 119.72 | 8.353 ms | 0.008369 | 0.008921 | 453 | 3.784 s | 0 |

The unloaded baseline was 119.65–119.70 fps. The genuine battery repetitions were 119.59–119.72 fps, indistinguishable from that baseline and about six times faster than the 20 fps arm threshold.

## Real-battery evidence

Each Arm B repetition ran `scripts/gate-battery.mjs` against a separate Vite server on scratch port 5234 while the probe used scratch port 5253. The battery command was `npx playwright test e2e/beauty-town.spec.ts --project=desktop-chrome --workers=1`; each repetition ran four real tests using one Chromium worker and passed 4/4.

| Repetition | Battery wall time | Battery rc | Live at probe start | Live at probe end | Battery PID | Server PID |
|---|---:|---:|:---:|:---:|---:|---:|
| B-1 | 17.193 s | 0 | Yes | Yes | 91472 | 91445 |
| B-2 | 17.212 s | 0 | Yes | Yes | 92735 | 92694 |

This is the factory's mandated `--workers=1` load: one Chromium plus Vite, not six workers. The per-run transcripts retain the exact command, `rc=0 17.2s`, four passing tests, environment, working tree, and scratch port.

## Process cleanup

`process-lifecycle.json` records all five owned process groups. Both battery drivers exited normally. The runner sent `SIGTERM` to the two battery Vite groups and the probe Vite group, then recorded `deadAfterKill: true` for each. A final independent check over PIDs `91123, 91445, 91472, 92694, 92735` returned no rows.

## Scope and ruling

Only the copied probe, its evidence runner, raw evidence, and this review changed. The battery regenerated three existing screenshot artifacts; they were discarded under the task's factory-churn exception. No `src/**`, `e2e/**`, `scripts/**`, spec, timeout, or presentation-clamp byte changed.

The evidence rules out the proposed practical mechanism under the real serial factory load measured here. It does not identify the cause of F-1587-2, and it does not authorize raising the 30 s timeout or changing `MAX_PRESENTATION_DELTA_SECONDS`.

## Evidence boundary

Independent review raised two scope questions. First, the battery inherited this task's lane-runner process context, not a separately recreated launchd fire-parent context. That is the execution context the master assigns and its realism criterion is the real driver plus mandatory one-worker Chromium and Vite; this result does not separately claim a ruling about undocumented parent-process QoS.

Second, each probe sampled the first 3.78 s of its 17.2 s battery. The battery was live at both sample boundaries and the original 41.8 s observation was itself the battery's first test, so this directly measures the concurrent early-battery condition named by the task. It does not exclude a different slowdown that begins only later in a much longer battery; such a late-only cumulative-load experiment would be new scope rather than a reinterpretation of these rows.
