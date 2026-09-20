# Concurrency-class failure rates

- Tree: `854a5612cf97e306f9ec8884e34f6380e7015351`
- External Vite: `http://127.0.0.1:5279` (one server reused; port checked free before binding and after close)
- Schedule: [object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object] interleaved cycles × workers 4
- Projects: desktop-chrome, mobile-chrome

- S1: `e2e/ap-standing-orders.spec.ts:80`

## Failure-rate table

| Subject | Project | Workers | Failures / executions | Rate |
|---|---|---:|---:|---:|
| S1 | desktop-chrome | 4 | **0/16** | 0.0% |
| S1 | mobile-chrome | 4 | **0/16** | 0.0% |

## Per-run observations

| Cycle | Workers | Project | Loadavg 1m start → end | S1 |
|---:|---:|---|---|---|
| 1 | 4 | desktop-chrome | 6.57 → 6.43 | PASS |
| 1 | 4 | mobile-chrome | 6.57 → 6.43 | PASS |
| 2 | 4 | desktop-chrome | 6.43 → 9.88 | PASS |
| 2 | 4 | mobile-chrome | 6.43 → 9.88 | PASS |
| 3 | 4 | desktop-chrome | 9.88 → 11.54 | PASS |
| 3 | 4 | mobile-chrome | 9.88 → 11.54 | PASS |
| 4 | 4 | desktop-chrome | 11.54 → 10.47 | PASS |
| 4 | 4 | mobile-chrome | 11.54 → 10.47 | PASS |
| 5 | 4 | desktop-chrome | 10.47 → 10.27 | PASS |
| 5 | 4 | mobile-chrome | 10.47 → 10.27 | PASS |
| 6 | 4 | desktop-chrome | 10.27 → 9.29 | PASS |
| 6 | 4 | mobile-chrome | 10.27 → 9.29 | PASS |
| 7 | 4 | desktop-chrome | 9.29 → 9.67 | PASS |
| 7 | 4 | mobile-chrome | 9.29 → 9.67 | PASS |
| 8 | 4 | desktop-chrome | 9.67 → 8.88 | PASS |
| 8 | 4 | mobile-chrome | 9.67 → 8.88 | PASS |
| 9 | 4 | desktop-chrome | 8.88 → 8.89 | PASS |
| 9 | 4 | mobile-chrome | 8.88 → 8.89 | PASS |
| 10 | 4 | desktop-chrome | 8.89 → 10.94 | PASS |
| 10 | 4 | mobile-chrome | 8.89 → 10.94 | PASS |
| 11 | 4 | desktop-chrome | 10.94 → 10.86 | PASS |
| 11 | 4 | mobile-chrome | 10.94 → 10.86 | PASS |
| 12 | 4 | desktop-chrome | 10.86 → 10.28 | PASS |
| 12 | 4 | mobile-chrome | 10.86 → 10.28 | PASS |
| 13 | 4 | desktop-chrome | 10.28 → 11.13 | PASS |
| 13 | 4 | mobile-chrome | 10.28 → 11.13 | PASS |
| 14 | 4 | desktop-chrome | 11.13 → 10.36 | PASS |
| 14 | 4 | mobile-chrome | 11.13 → 10.36 | PASS |
| 15 | 4 | desktop-chrome | 10.36 → 10.09 | PASS |
| 15 | 4 | mobile-chrome | 10.36 → 10.09 | PASS |
| 16 | 4 | desktop-chrome | 10.09 → 10.76 | PASS |
| 16 | 4 | mobile-chrome | 10.09 → 10.76 | PASS |

Every run record in `runs.jsonl` also carries both full loadavg vectors, timestamps, requested/configured/actual workers, exit code, subject duration, and `git rev-parse HEAD`.
