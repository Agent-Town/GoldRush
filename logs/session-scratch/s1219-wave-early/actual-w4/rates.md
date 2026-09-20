# Concurrency-class failure rates

- Tree: `854a5612cf97e306f9ec8884e34f6380e7015351`
- External Vite: `http://127.0.0.1:5280` (one server reused; port checked free before binding and after close)
- Schedule: [object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object] interleaved cycles × workers 4
- Projects: desktop-chrome, mobile-chrome

- S1: `e2e/ap-standing-orders.spec.ts:80`
- S2: `e2e/gazette-welcome.spec.ts:44`
- S3: `e2e/locked-win.spec.ts:65`
- S4: `e2e/tl-01-run-telemetry.spec.ts:229`

## Failure-rate table

| Subject | Project | Workers | Failures / executions | Rate |
|---|---|---:|---:|---:|
| S1 | desktop-chrome | 4 | **0/16** | 0.0% |
| S1 | mobile-chrome | 4 | **0/16** | 0.0% |
| S2 | desktop-chrome | 4 | **0/16** | 0.0% |
| S2 | mobile-chrome | 4 | **2/16** | 12.5% |
| S3 | desktop-chrome | 4 | **16/16** | 100.0% |
| S3 | mobile-chrome | 4 | **16/16** | 100.0% |
| S4 | desktop-chrome | 4 | **16/16** | 100.0% |
| S4 | mobile-chrome | 4 | **16/16** | 100.0% |

## Per-run observations

| Cycle | Workers | Project | Loadavg 1m start → end | S1 | S2 | S3 | S4 |
|---:|---:|---|---|---|---|---|---|
| 1 | 4 | desktop-chrome | 7.69 → 10.42 | PASS | PASS | FAIL | FAIL |
| 1 | 4 | mobile-chrome | 7.69 → 10.42 | PASS | FAIL | FAIL | FAIL |
| 2 | 4 | desktop-chrome | 10.42 → 9.14 | PASS | PASS | FAIL | FAIL |
| 2 | 4 | mobile-chrome | 10.42 → 9.14 | PASS | PASS | FAIL | FAIL |
| 3 | 4 | desktop-chrome | 9.14 → 10.04 | PASS | PASS | FAIL | FAIL |
| 3 | 4 | mobile-chrome | 9.14 → 10.04 | PASS | PASS | FAIL | FAIL |
| 4 | 4 | desktop-chrome | 10.04 → 13.34 | PASS | PASS | FAIL | FAIL |
| 4 | 4 | mobile-chrome | 10.04 → 13.34 | PASS | PASS | FAIL | FAIL |
| 5 | 4 | desktop-chrome | 13.34 → 16.67 | PASS | PASS | FAIL | FAIL |
| 5 | 4 | mobile-chrome | 13.34 → 16.67 | PASS | PASS | FAIL | FAIL |
| 6 | 4 | desktop-chrome | 16.67 → 14.14 | PASS | PASS | FAIL | FAIL |
| 6 | 4 | mobile-chrome | 16.67 → 14.14 | PASS | PASS | FAIL | FAIL |
| 7 | 4 | desktop-chrome | 14.14 → 14.00 | PASS | PASS | FAIL | FAIL |
| 7 | 4 | mobile-chrome | 14.14 → 14.00 | PASS | PASS | FAIL | FAIL |
| 8 | 4 | desktop-chrome | 14.00 → 10.85 | PASS | PASS | FAIL | FAIL |
| 8 | 4 | mobile-chrome | 14.00 → 10.85 | PASS | FAIL | FAIL | FAIL |
| 9 | 4 | desktop-chrome | 10.85 → 13.81 | PASS | PASS | FAIL | FAIL |
| 9 | 4 | mobile-chrome | 10.85 → 13.81 | PASS | PASS | FAIL | FAIL |
| 10 | 4 | desktop-chrome | 13.81 → 11.67 | PASS | PASS | FAIL | FAIL |
| 10 | 4 | mobile-chrome | 13.81 → 11.67 | PASS | PASS | FAIL | FAIL |
| 11 | 4 | desktop-chrome | 11.67 → 29.78 | PASS | PASS | FAIL | FAIL |
| 11 | 4 | mobile-chrome | 11.67 → 29.78 | PASS | PASS | FAIL | FAIL |
| 12 | 4 | desktop-chrome | 29.78 → 18.83 | PASS | PASS | FAIL | FAIL |
| 12 | 4 | mobile-chrome | 29.78 → 18.83 | PASS | PASS | FAIL | FAIL |
| 13 | 4 | desktop-chrome | 18.83 → 14.54 | PASS | PASS | FAIL | FAIL |
| 13 | 4 | mobile-chrome | 18.83 → 14.54 | PASS | PASS | FAIL | FAIL |
| 14 | 4 | desktop-chrome | 14.54 → 12.37 | PASS | PASS | FAIL | FAIL |
| 14 | 4 | mobile-chrome | 14.54 → 12.37 | PASS | PASS | FAIL | FAIL |
| 15 | 4 | desktop-chrome | 12.37 → 8.75 | PASS | PASS | FAIL | FAIL |
| 15 | 4 | mobile-chrome | 12.37 → 8.75 | PASS | PASS | FAIL | FAIL |
| 16 | 4 | desktop-chrome | 8.75 → 10.98 | PASS | PASS | FAIL | FAIL |
| 16 | 4 | mobile-chrome | 8.75 → 10.98 | PASS | PASS | FAIL | FAIL |

Every run record in `runs.jsonl` also carries both full loadavg vectors, timestamps, requested/configured/actual workers, exit code, subject duration, and `git rev-parse HEAD`.
