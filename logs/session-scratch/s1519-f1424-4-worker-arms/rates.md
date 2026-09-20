# Concurrency-class failure rates

- Tree: `3c06cc21353735813c053b01dce8926b3fa582a4`
- External Vite: `http://127.0.0.1:5267` (one server reused; port checked free before binding and after close)
- Schedule: [object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object] interleaved cycles × workers 1 → 2 → 6
- Projects: desktop-chrome, mobile-chrome

- S1: `e2e/town-t5-townsfolk.spec.ts`
- S2: `e2e/town-t3-board.spec.ts`
- S3: `e2e/town-t6-surfaces.spec.ts`

## Failure-rate table

| Subject | Project | Workers | Failures / executions | Rate |
|---|---|---:|---:|---:|
| S2:156 | desktop-chrome | 1 | **0/8** | 0.0% |
| S2:156 | desktop-chrome | 2 | **0/8** | 0.0% |
| S2:156 | desktop-chrome | 6 | **1/8** | 12.5% |
| S2:156 | mobile-chrome | 1 | **0/8** | 0.0% |
| S2:156 | mobile-chrome | 2 | **0/8** | 0.0% |
| S2:156 | mobile-chrome | 6 | **0/8** | 0.0% |
| S2:222 | desktop-chrome | 1 | **0/8** | 0.0% |
| S2:222 | desktop-chrome | 2 | **0/8** | 0.0% |
| S2:222 | desktop-chrome | 6 | **0/8** | 0.0% |
| S2:222 | mobile-chrome | 1 | **0/8** | 0.0% |
| S2:222 | mobile-chrome | 2 | **0/8** | 0.0% |
| S2:222 | mobile-chrome | 6 | **0/8** | 0.0% |
| S2:246 | desktop-chrome | 1 | **0/8** | 0.0% |
| S2:246 | desktop-chrome | 2 | **0/8** | 0.0% |
| S2:246 | desktop-chrome | 6 | **0/8** | 0.0% |
| S2:246 | mobile-chrome | 1 | **0/8** | 0.0% |
| S2:246 | mobile-chrome | 2 | **0/8** | 0.0% |
| S2:246 | mobile-chrome | 6 | **0/8** | 0.0% |
| S2:268 | desktop-chrome | 1 | **0/8** | 0.0% |
| S2:268 | desktop-chrome | 2 | **0/8** | 0.0% |
| S2:268 | desktop-chrome | 6 | **0/8** | 0.0% |
| S2:268 | mobile-chrome | 1 | **0/8** | 0.0% |
| S2:268 | mobile-chrome | 2 | **0/8** | 0.0% |
| S2:268 | mobile-chrome | 6 | **0/8** | 0.0% |
| S2:287 | desktop-chrome | 1 | **0/8** | 0.0% |
| S2:287 | desktop-chrome | 2 | **0/8** | 0.0% |
| S2:287 | desktop-chrome | 6 | **0/8** | 0.0% |
| S2:287 | mobile-chrome | 1 | **0/8** | 0.0% |
| S2:287 | mobile-chrome | 2 | **0/8** | 0.0% |
| S2:287 | mobile-chrome | 6 | **0/8** | 0.0% |
| S2:326 | desktop-chrome | 1 | **0/8** | 0.0% |
| S2:326 | desktop-chrome | 2 | **0/8** | 0.0% |
| S2:326 | desktop-chrome | 6 | **0/8** | 0.0% |
| S2:326 | mobile-chrome | 1 | **0/8** | 0.0% |
| S2:326 | mobile-chrome | 2 | **0/8** | 0.0% |
| S2:326 | mobile-chrome | 6 | **0/8** | 0.0% |
| S1:160 | desktop-chrome | 1 | **0/8** | 0.0% |
| S1:160 | desktop-chrome | 2 | **0/8** | 0.0% |
| S1:160 | desktop-chrome | 6 | **0/8** | 0.0% |
| S1:160 | mobile-chrome | 1 | **0/8** | 0.0% |
| S1:160 | mobile-chrome | 2 | **0/8** | 0.0% |
| S1:160 | mobile-chrome | 6 | **0/8** | 0.0% |
| S1:170 | desktop-chrome | 1 | **0/8** | 0.0% |
| S1:170 | desktop-chrome | 2 | **0/8** | 0.0% |
| S1:170 | desktop-chrome | 6 | **1/8** | 12.5% |
| S1:170 | mobile-chrome | 1 | **0/8** | 0.0% |
| S1:170 | mobile-chrome | 2 | **0/8** | 0.0% |
| S1:170 | mobile-chrome | 6 | **0/8** | 0.0% |
| S1:203 | desktop-chrome | 1 | **3/8** | 37.5% |
| S1:203 | desktop-chrome | 2 | **1/8** | 12.5% |
| S1:203 | desktop-chrome | 6 | **5/8** | 62.5% |
| S1:203 | mobile-chrome | 1 | **3/8** | 37.5% |
| S1:203 | mobile-chrome | 2 | **5/8** | 62.5% |
| S1:203 | mobile-chrome | 6 | **7/8** | 87.5% |
| S1:223 | desktop-chrome | 1 | **0/8** | 0.0% |
| S1:223 | desktop-chrome | 2 | **0/8** | 0.0% |
| S1:223 | desktop-chrome | 6 | **0/8** | 0.0% |
| S1:223 | mobile-chrome | 1 | **0/8** | 0.0% |
| S1:223 | mobile-chrome | 2 | **0/8** | 0.0% |
| S1:223 | mobile-chrome | 6 | **0/8** | 0.0% |
| S1:241 | desktop-chrome | 1 | **0/8** | 0.0% |
| S1:241 | desktop-chrome | 2 | **0/8** | 0.0% |
| S1:241 | desktop-chrome | 6 | **0/8** | 0.0% |
| S1:241 | mobile-chrome | 1 | **0/8** | 0.0% |
| S1:241 | mobile-chrome | 2 | **0/8** | 0.0% |
| S1:241 | mobile-chrome | 6 | **0/8** | 0.0% |
| S3:102 | desktop-chrome | 1 | **0/8** | 0.0% |
| S3:102 | desktop-chrome | 2 | **0/8** | 0.0% |
| S3:102 | desktop-chrome | 6 | **0/8** | 0.0% |
| S3:102 | mobile-chrome | 1 | **0/8** | 0.0% |
| S3:102 | mobile-chrome | 2 | **0/8** | 0.0% |
| S3:102 | mobile-chrome | 6 | **1/8** | 12.5% |
| S3:119 | desktop-chrome | 1 | **0/8** | 0.0% |
| S3:119 | desktop-chrome | 2 | **0/8** | 0.0% |
| S3:119 | desktop-chrome | 6 | **0/8** | 0.0% |
| S3:119 | mobile-chrome | 1 | **0/8** | 0.0% |
| S3:119 | mobile-chrome | 2 | **0/8** | 0.0% |
| S3:119 | mobile-chrome | 6 | **0/8** | 0.0% |
| S3:135 | desktop-chrome | 1 | **0/8** | 0.0% |
| S3:135 | desktop-chrome | 2 | **0/8** | 0.0% |
| S3:135 | desktop-chrome | 6 | **0/8** | 0.0% |
| S3:135 | mobile-chrome | 1 | **0/8** | 0.0% |
| S3:135 | mobile-chrome | 2 | **0/8** | 0.0% |
| S3:135 | mobile-chrome | 6 | **0/8** | 0.0% |
| S3:155 | desktop-chrome | 1 | **0/8** | 0.0% |
| S3:155 | desktop-chrome | 2 | **0/8** | 0.0% |
| S3:155 | desktop-chrome | 6 | **2/8** | 25.0% |
| S3:155 | mobile-chrome | 1 | **0/8** | 0.0% |
| S3:155 | mobile-chrome | 2 | **0/8** | 0.0% |
| S3:155 | mobile-chrome | 6 | **0/8** | 0.0% |
| S3:90 | desktop-chrome | 1 | **0/8** | 0.0% |
| S3:90 | desktop-chrome | 2 | **0/8** | 0.0% |
| S3:90 | desktop-chrome | 6 | **0/8** | 0.0% |
| S3:90 | mobile-chrome | 1 | **0/8** | 0.0% |
| S3:90 | mobile-chrome | 2 | **0/8** | 0.0% |
| S3:90 | mobile-chrome | 6 | **0/8** | 0.0% |

## Per-run observations

| Cycle | Workers | Project | Loadavg 1m start → end | S1 | S2 | S3 |
|---:|---:|---|---|---|---|---|
| 1 | 1 | desktop-chrome | 7.59 → 5.73 | PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 1 | 1 | mobile-chrome | 7.59 → 5.73 | PASS/PASS/FAIL/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 1 | 2 | desktop-chrome | 5.73 → 9.15 | PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 1 | 2 | mobile-chrome | 5.73 → 9.15 | PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 1 | 6 | desktop-chrome | 9.15 → 20.39 | PASS/PASS/FAIL/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 1 | 6 | mobile-chrome | 9.15 → 20.39 | PASS/PASS/FAIL/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 2 | 1 | desktop-chrome | 20.39 → 6.27 | PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 2 | 1 | mobile-chrome | 20.39 → 6.27 | PASS/PASS/FAIL/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 2 | 2 | desktop-chrome | 6.27 → 9.08 | PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 2 | 2 | mobile-chrome | 6.27 → 9.08 | PASS/PASS/FAIL/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 2 | 6 | desktop-chrome | 9.08 → 23.02 | PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/FAIL |
| 2 | 6 | mobile-chrome | 9.08 → 23.02 | PASS/PASS/FAIL/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 3 | 1 | desktop-chrome | 23.02 → 12.02 | PASS/PASS/FAIL/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 3 | 1 | mobile-chrome | 23.02 → 12.02 | PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 3 | 2 | desktop-chrome | 12.02 → 25.70 | PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 3 | 2 | mobile-chrome | 12.02 → 25.70 | PASS/PASS/FAIL/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 3 | 6 | desktop-chrome | 25.70 → 18.21 | PASS/FAIL/FAIL/PASS/PASS | FAIL/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/FAIL |
| 3 | 6 | mobile-chrome | 25.70 → 18.21 | PASS/PASS/FAIL/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 4 | 1 | desktop-chrome | 18.21 → 7.67 | PASS/PASS/FAIL/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 4 | 1 | mobile-chrome | 18.21 → 7.67 | PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 4 | 2 | desktop-chrome | 7.67 → 11.55 | PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 4 | 2 | mobile-chrome | 7.67 → 11.55 | PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 4 | 6 | desktop-chrome | 11.55 → 30.71 | PASS/PASS/FAIL/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 4 | 6 | mobile-chrome | 11.55 → 30.71 | PASS/PASS/FAIL/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 5 | 1 | desktop-chrome | 30.71 → 31.37 | PASS/PASS/FAIL/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 5 | 1 | mobile-chrome | 30.71 → 31.37 | PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 5 | 2 | desktop-chrome | 31.37 → 14.98 | PASS/PASS/FAIL/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 5 | 2 | mobile-chrome | 31.37 → 14.98 | PASS/PASS/FAIL/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 5 | 6 | desktop-chrome | 14.98 → 23.35 | PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 5 | 6 | mobile-chrome | 14.98 → 23.35 | PASS/PASS/FAIL/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 6 | 1 | desktop-chrome | 23.35 → 17.78 | PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 6 | 1 | mobile-chrome | 23.35 → 17.78 | PASS/PASS/FAIL/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 6 | 2 | desktop-chrome | 17.78 → 11.14 | PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 6 | 2 | mobile-chrome | 17.78 → 11.14 | PASS/PASS/FAIL/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 6 | 6 | desktop-chrome | 11.14 → 19.63 | PASS/PASS/FAIL/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 6 | 6 | mobile-chrome | 11.14 → 19.63 | PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 7 | 1 | desktop-chrome | 19.63 → 29.87 | PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 7 | 1 | mobile-chrome | 19.63 → 29.87 | PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 7 | 2 | desktop-chrome | 29.87 → 35.52 | PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 7 | 2 | mobile-chrome | 29.87 → 35.52 | PASS/PASS/FAIL/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 7 | 6 | desktop-chrome | 35.52 → 34.86 | PASS/PASS/FAIL/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 7 | 6 | mobile-chrome | 35.52 → 34.86 | PASS/PASS/FAIL/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/FAIL/PASS/PASS/PASS |
| 8 | 1 | desktop-chrome | 34.86 → 15.01 | PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 8 | 1 | mobile-chrome | 34.86 → 15.01 | PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 8 | 2 | desktop-chrome | 15.01 → 15.86 | PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 8 | 2 | mobile-chrome | 15.01 → 15.86 | PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 8 | 6 | desktop-chrome | 15.86 → 20.59 | PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |
| 8 | 6 | mobile-chrome | 15.86 → 20.59 | PASS/PASS/FAIL/PASS/PASS | PASS/PASS/PASS/PASS/PASS/PASS | PASS/PASS/PASS/PASS/PASS |

Every run record in `runs.jsonl` also carries both full loadavg vectors, timestamps, requested/configured/actual workers, exit code, subject duration, and `git rev-parse HEAD`.
