# MP harvest channels — re-measurement

Seed corpus `mp-balance-v1:1` through `:9`; 600 seconds per run; fixed 1/30-second step; Trail inputs; gross panned gold before bank cap. Combat inputs and survival results are unchanged. Harvest now models one progress channel per rider, parallel work on different seams, and first-claim exclusion on a shared seam.

| Riders | Before team gold/min | After team gold/min | Before per rider/min | After per rider/min |
|---:|---:|---:|---:|---:|
| 1 | 107.0 | 107.0 | 107.000 | 107.000 |
| 2 | 147.0 | 156.5 | 73.500 | 78.250 |
| 3 | 164.5 | 162.0 | 54.833 | 54.000 |
| 4 | 177.0 | 168.0 | 44.250 | 42.000 |

The direct runtime probe isolates the mechanic from the duty-cycle model: two continuously stationary riders on separate active seams earn exactly 2x the same-node case; same-node contention has one active channel. Solo legacy-vector and actor-keyed inputs produce identical snapshots, economy state, and normalized event logs.

Report hash: `fnv1a32:113ffdf1`. Balance fingerprint: `fnv1a32:739cb920`.

Gates: TypeScript and production build green; mp-balance harness 6/6 desktop/mobile; harvest + active-transient restore 4/4 desktop/mobile; perf-04 determinism 3/3 desktop with identical same-seed future-state/economy hashes and entity timeline; zero captured console/page errors.
