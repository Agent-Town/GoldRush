# Concurrency-class failure rates

- Tree: `a4575fed922a81e902eb2896d788439bbeb29785`
- External Vite: `http://127.0.0.1:5267` (one server reused; port checked free before binding and after close)
- Schedule: [object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object] interleaved cycles × workers 1 → 2 → 4
- Projects: desktop-chrome, mobile-chrome

- S1: `e2e/gazette-welcome.spec.ts:44`
- S2: `e2e/ap-standing-orders.spec.ts:80`
- S3: `e2e/locked-win.spec.ts:65`
- S4: `e2e/tl-01-run-telemetry.spec.ts:229`

## Failure-rate table

| Subject | Project | Workers | Failures / executions | Rate |
|---|---|---:|---:|---:|
| S2 | desktop-chrome | 1 | **0/8** | 0.0% |
| S2 | desktop-chrome | 2 | **0/8** | 0.0% |
| S2 | desktop-chrome | 4 | **0/8** | 0.0% |
| S2 | mobile-chrome | 1 | **0/8** | 0.0% |
| S2 | mobile-chrome | 2 | **0/8** | 0.0% |
| S2 | mobile-chrome | 4 | **2/8** | 25.0% |
| S1 | desktop-chrome | 1 | **0/8** | 0.0% |
| S1 | desktop-chrome | 2 | **0/8** | 0.0% |
| S1 | desktop-chrome | 4 | **0/8** | 0.0% |
| S1 | mobile-chrome | 1 | **0/8** | 0.0% |
| S1 | mobile-chrome | 2 | **1/8** | 12.5% |
| S1 | mobile-chrome | 4 | **0/8** | 0.0% |
| S3 | desktop-chrome | 1 | **8/8** | 100.0% |
| S3 | desktop-chrome | 2 | **8/8** | 100.0% |
| S3 | desktop-chrome | 4 | **8/8** | 100.0% |
| S3 | mobile-chrome | 1 | **8/8** | 100.0% |
| S3 | mobile-chrome | 2 | **8/8** | 100.0% |
| S3 | mobile-chrome | 4 | **8/8** | 100.0% |
| S4 | desktop-chrome | 1 | **8/8** | 100.0% |
| S4 | desktop-chrome | 2 | **8/8** | 100.0% |
| S4 | desktop-chrome | 4 | **8/8** | 100.0% |
| S4 | mobile-chrome | 1 | **8/8** | 100.0% |
| S4 | mobile-chrome | 2 | **8/8** | 100.0% |
| S4 | mobile-chrome | 4 | **8/8** | 100.0% |

## Per-run observations

| Cycle | Workers | Project | Loadavg 1m start → end | S1 | S2 | S3 | S4 |
|---:|---:|---|---|---|---|---|---|
| 1 | 1 | desktop-chrome | 5.24 → 4.13 | PASS | PASS | FAIL | FAIL |
| 1 | 1 | mobile-chrome | 5.24 → 4.13 | PASS | PASS | FAIL | FAIL |
| 1 | 2 | desktop-chrome | 4.13 → 4.34 | PASS | PASS | FAIL | FAIL |
| 1 | 2 | mobile-chrome | 4.13 → 4.34 | FAIL | PASS | FAIL | FAIL |
| 1 | 4 | desktop-chrome | 4.34 → 8.62 | PASS | PASS | FAIL | FAIL |
| 1 | 4 | mobile-chrome | 4.34 → 8.62 | PASS | PASS | FAIL | FAIL |
| 2 | 1 | desktop-chrome | 8.62 → 5.21 | PASS | PASS | FAIL | FAIL |
| 2 | 1 | mobile-chrome | 8.62 → 5.21 | PASS | PASS | FAIL | FAIL |
| 2 | 2 | desktop-chrome | 5.21 → 24.33 | PASS | PASS | FAIL | FAIL |
| 2 | 2 | mobile-chrome | 5.21 → 24.33 | PASS | PASS | FAIL | FAIL |
| 2 | 4 | desktop-chrome | 24.33 → 14.17 | PASS | PASS | FAIL | FAIL |
| 2 | 4 | mobile-chrome | 24.33 → 14.17 | PASS | PASS | FAIL | FAIL |
| 3 | 1 | desktop-chrome | 14.17 → 9.76 | PASS | PASS | FAIL | FAIL |
| 3 | 1 | mobile-chrome | 14.17 → 9.76 | PASS | PASS | FAIL | FAIL |
| 3 | 2 | desktop-chrome | 9.76 → 16.41 | PASS | PASS | FAIL | FAIL |
| 3 | 2 | mobile-chrome | 9.76 → 16.41 | PASS | PASS | FAIL | FAIL |
| 3 | 4 | desktop-chrome | 16.41 → 14.62 | PASS | PASS | FAIL | FAIL |
| 3 | 4 | mobile-chrome | 16.41 → 14.62 | PASS | PASS | FAIL | FAIL |
| 4 | 1 | desktop-chrome | 14.62 → 11.13 | PASS | PASS | FAIL | FAIL |
| 4 | 1 | mobile-chrome | 14.62 → 11.13 | PASS | PASS | FAIL | FAIL |
| 4 | 2 | desktop-chrome | 11.13 → 15.76 | PASS | PASS | FAIL | FAIL |
| 4 | 2 | mobile-chrome | 11.13 → 15.76 | PASS | PASS | FAIL | FAIL |
| 4 | 4 | desktop-chrome | 15.76 → 21.72 | PASS | PASS | FAIL | FAIL |
| 4 | 4 | mobile-chrome | 15.76 → 21.72 | PASS | FAIL | FAIL | FAIL |
| 5 | 1 | desktop-chrome | 21.72 → 11.35 | PASS | PASS | FAIL | FAIL |
| 5 | 1 | mobile-chrome | 21.72 → 11.35 | PASS | PASS | FAIL | FAIL |
| 5 | 2 | desktop-chrome | 11.35 → 15.55 | PASS | PASS | FAIL | FAIL |
| 5 | 2 | mobile-chrome | 11.35 → 15.55 | PASS | PASS | FAIL | FAIL |
| 5 | 4 | desktop-chrome | 15.55 → 19.29 | PASS | PASS | FAIL | FAIL |
| 5 | 4 | mobile-chrome | 15.55 → 19.29 | PASS | PASS | FAIL | FAIL |
| 6 | 1 | desktop-chrome | 19.29 → 10.24 | PASS | PASS | FAIL | FAIL |
| 6 | 1 | mobile-chrome | 19.29 → 10.24 | PASS | PASS | FAIL | FAIL |
| 6 | 2 | desktop-chrome | 10.24 → 8.67 | PASS | PASS | FAIL | FAIL |
| 6 | 2 | mobile-chrome | 10.24 → 8.67 | PASS | PASS | FAIL | FAIL |
| 6 | 4 | desktop-chrome | 8.67 → 11.48 | PASS | PASS | FAIL | FAIL |
| 6 | 4 | mobile-chrome | 8.67 → 11.48 | PASS | FAIL | FAIL | FAIL |
| 7 | 1 | desktop-chrome | 11.48 → 8.44 | PASS | PASS | FAIL | FAIL |
| 7 | 1 | mobile-chrome | 11.48 → 8.44 | PASS | PASS | FAIL | FAIL |
| 7 | 2 | desktop-chrome | 8.44 → 8.60 | PASS | PASS | FAIL | FAIL |
| 7 | 2 | mobile-chrome | 8.44 → 8.60 | PASS | PASS | FAIL | FAIL |
| 7 | 4 | desktop-chrome | 8.60 → 9.22 | PASS | PASS | FAIL | FAIL |
| 7 | 4 | mobile-chrome | 8.60 → 9.22 | PASS | PASS | FAIL | FAIL |
| 8 | 1 | desktop-chrome | 9.22 → 6.44 | PASS | PASS | FAIL | FAIL |
| 8 | 1 | mobile-chrome | 9.22 → 6.44 | PASS | PASS | FAIL | FAIL |
| 8 | 2 | desktop-chrome | 6.44 → 7.86 | PASS | PASS | FAIL | FAIL |
| 8 | 2 | mobile-chrome | 6.44 → 7.86 | PASS | PASS | FAIL | FAIL |
| 8 | 4 | desktop-chrome | 7.86 → 8.48 | PASS | PASS | FAIL | FAIL |
| 8 | 4 | mobile-chrome | 7.86 → 8.48 | PASS | PASS | FAIL | FAIL |

Every run record in `runs.jsonl` also carries both full loadavg vectors, timestamps, requested/configured/actual workers, exit code, subject duration, and `git rev-parse HEAD`.

## Pooled classification

| Subject | workers=1 | workers=2 | workers=4 | Verdict |
|---|---:|---:|---:|---|
| S1 Gazette welcome | 0/16 (0.0%) | 1/16 (6.3%) | 0/16 (0.0%) | **Flat/non-monotonic** — the lone mobile failure was at `:111`, not the `:87` drift assertion |
| S2 Standing Orders | 0/16 (0.0%) | 0/16 (0.0%) | 2/16 (12.5%) | **Monotonic** — both failures were mobile at `:121` (`wave_early`) |
| S3 Locked Win | 16/16 (100.0%) | 16/16 (100.0%) | 16/16 (100.0%) | **Deterministic red**, not a flake; every failure was the clean-console check at `:61` after two HTTP 405 responses |
| S4 run telemetry | 16/16 (100.0%) | 16/16 (100.0%) | 16/16 (100.0%) | **Deterministic red**, not a flake; every failure was `claim-secured` absent at `:236` |

Only S2 rises with worker count. S1 does not reproduce F-1214-1's `:87` failure and has no
concurrency gradient in this sample. S3 and S4 are flat only because they are already saturated at
100%; they are deterministic reds, not members of a failure-rate flake class.

## Calibration verdict

**The requested numerical comparison fails: S4 at the inventory's workers=2 configuration measured
8/8 = 100.0% in each project (16/16 pooled), versus the inventory's stated 7/12 = 58.3%, a +41.7
percentage-point difference. The reference is invalid, not the new outcome parser.**

The generated inventory row is under **Masking candidates**. `scripts/suite-red-inventory.mjs`
computes it as `failure-line offset / test-body lines`: line `:236` is 7 of 12 body lines, so both
projects necessarily display the same 58.3%. It is one execution per project from a workers=2
snapshot, not 12 repeated executions and not a failure rate. The compact snapshot confirms
configured/actual workers=2 and `repeatEach=1`. All 48 new S4 executions are present in the retained
raw Playwright JSON and all fail at exactly `:236`.

The harness was not altered to manufacture 58.3%. Its parser self-check passes, every arm contains
exactly 8 expected subject/project executions, requested/configured/actual workers agree at 1/2/4,
all 24 records carry the same HEAD, and the live S3 workers=4 control extends s1216's 3/3 red arms to
16/16. No valid historical 58.3% failure-rate oracle exists to calibrate against.

## Recommended single cure and acceptance number

**Cure S2 first:** make the `wave_started` transition observable to Standing Orders at the event/state
transition, instead of relying on a later `Embodiment.updateSimulation` frame arriving within the
test's 5-second wall-clock poll. Do not widen the poll, retry, or weaken the assertion.

**Acceptance: 0/16 failures at workers=4** on this same N=8, two-project harness (with workers=1 and
workers=2 remaining 0/16). No cure was implemented here.

## Inventory integration

The generator was not changed. The generated snapshot explicitly says not to edit it, and this file's
existing post-snapshot section is already the vocabulary for later measured rates. The new denominators
were appended there without rewriting the historical snapshot.
