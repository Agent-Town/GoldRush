# E1 performance pass

Date: 2026-08-03  
Branch/base: `lane/perf` at `d9235027`  
Host: Apple M4 Max via ANGLE Metal  
Shed line: 33.4 ms p95  
Draw-call gate: 200

## Outcome

The five terrain-backed E1 maps were profiled at 60 stationary, high-HP enemies on desktop and mobile viewports. Every final pressure run stayed below the shed line and draw-call gate. The changes remove repeated render-loop allocations and duplicate enemy light calculations without changing simulation, balance, watchdog thresholds, or accepted pixels.

This host is faster than the requested representative mid machine. The data proves the maps are already lean on the available host, but it does not substitute for a hardware canary on a mid-tier machine. Timing varied between repeated browser runs, so the table reports the measurements without claiming a statistically reliable wall-time win where the delta is inside that noise.

Drill Yard is intentionally absent: it is the E1 practice contract, not one of the five terrain-backed E1 maps, and it never publishes `terrain3dPilotState=ready`. An attempted inclusion waited on that impossible readiness condition until the test timeout.

## Pressure census: desktop

| Contract | p95 before -> after (ms) | driven work before -> after (ms/frame) | calls before -> after | binds before -> after | programs | singletons | instanced meshes / instances |
|---|---:|---:|---:|---:|---:|---:|---:|
| Night Shift | 15.3 -> 18.2 | 2.15 -> 1.80 | 139 -> 139 | 23.1 -> 23.0 | 69 | 24 | 42 / 2,396 |
| The Claim | 18.5 -> 16.4 | 1.63 -> 1.55 | 136 -> 136 | 32.3 -> 32.7 | 68 | 25 | 42 / 2,254 |
| Dry Gulch | 15.7 -> 15.7 | 1.52 -> 1.68 | 136 -> 136 | 31.3 -> 31.0 | 72 | 25 | 44 / 2,062 |
| Twin Banks | 18.6 -> 18.7 | 1.52 -> 1.77 | 126 -> 126 | 29.0 -> 29.1 | 76 | 31 | 43 / 2,349 |
| Baron | 18.8 -> 17.9 | 1.42 -> 1.48 | 134 -> 134 | 30.0 -> 30.0 | 69 | 24 | 41 / 2,250 |

## Pressure census: mobile viewport

| Contract | p95 before -> after (ms) | driven work before -> after (ms/frame) | calls before -> after | binds before -> after | programs | singletons | instanced meshes / instances |
|---|---:|---:|---:|---:|---:|---:|---:|
| Night Shift | 18.0 -> 19.3 | 1.84 -> 2.15 | 128 -> 128 | 21.8 -> 21.3 | 67 | 24 | 42 / 2,186 |
| The Claim | 15.3 -> 18.8 | 1.49 -> 1.66 | 123 -> 123 | 26.0 -> 26.0 | 49 | 25 | 42 / 2,044 |
| Dry Gulch | 16.4 -> 20.0 | 1.64 -> 1.50 | 122 -> 122 | 24.0 -> 24.0 | 46 | 25 | 44 / 1,967 |
| Twin Banks | 18.6 -> 17.9 | 1.81 -> 1.84 | 119 -> 119 | 24.0 -> 24.0 | 51 | 31 | 43 / 2,079 |
| Baron | 18.1 -> 19.6 | 1.62 -> 1.44 | 120 -> 120 | 24.0 -> 24.0 | 49 | 24 | 41 / 2,040 |

All ten final p95 values are under the stricter 25.05 ms already-lean line used by the scoped regression spec (75% of the shed threshold). Calls did not regress. The renderer is already heavily instanced: the pressure scenes contain 41-44 instanced meshes representing roughly 2,000-2,400 instances.

## Cost-ordered work and proof

| Candidate | Result | Proof |
|---|---|---|
| Enemy sprite instancing | Rejected and fully reverted | Reduced the Night pressure scene by about 60 calls, but changed transparent overlap ordering and failed pixel equivalence. |
| Watchdog frame window | Kept | Reused the p95 sort buffer and maintained a rolling total instead of allocating/copying plus rescanning for the average every rendered frame. Thresholds and verdict logic are unchanged. |
| Enemy light dimming | Kept | Reuses source records and calculates physical light once per enemy render sync, then shares it with watch paint and sprite presentation. |
| Light-field and light-rig source selection | Kept | Reuses owned arrays/state and replaces diagnostic `filter` chains with counters. Source priority and light caps are unchanged. |
| Terrain night shader pool selection | Kept | Reuses its 32-source candidate buffer instead of `filter` + `sort` + `slice` allocations per render. The shader cap and ordering remain unchanged. |
| Materials/programs/shadows | No change | Census did not identify an identical-material or shadow-scope consolidation that could pass the no-look-change rule. |

The before/after runs record p95 and draw calls for every kept change as a batch. Per-loop allocations are below stable wall-clock resolution on the M4 host; the proof here is the removed allocation sites plus no-regression gates, not a fabricated isolated timing claim.

## Night watchdog

No watchdog or tier threshold was changed. The pressure p95 was 18.2 ms desktop and 19.3 ms mobile, respectively 54% and 58% of the 33.4 ms shed line. With the dynamic-light cap raised from 8 to 32, final p95 was 20.0 ms desktop and 17.2 ms mobile. The 32-light driven-work measurements were noisy (3.02 and 2.58 ms/frame) and do not justify a threshold change.

## Pixel gate

Normal and 60-enemy pressure screenshots were compared for all five maps in both projects: 20 comparisons total. The gate allows at most 1% of pixels with any channel delta greater than 4 and a mean channel delta no greater than 0.25.

- Maximum changed-pixel share: 0.48461% (`mobile-chrome-e1-twin-banks.png`).
- Maximum mean channel delta: 0.21349 (`mobile-chrome-e1-dry-gulch-pressure.png`).
- Result: all comparisons passed.

## Verification

| Gate | Result |
|---|---|
| Scoped E1 perf/census, untouched base | PASS: desktop 59 s; mobile 57.5 s |
| Scoped E1 perf/census, final tree | PASS: desktop 1.0 min; mobile 1.0 min |
| TypeScript + diff check | PASS |
| Release suite, both projects, serial | PASS: 28/28, including release build and asset-diet checks |
| Full E1 suites, both projects, serial | BASE-DEBT RED: 51/64 passed; Baron card-count expectation, Night brightness assertions, Twin build/ford cases, Dry seeded-height mobile case, and the earlier superseded perf-pixel assertion accounted for the reds. The two Night brightness failures were reproduced on untouched `d9235027`. |
| `night3d-perf`, both projects | BASE-DEBT RED: watchdog/tier cases pass; terrain-vs-painted ratio fails on base (1.778846 desktop, 1.696078 mobile) and final (1.769231 desktop, 1.647059 mobile). Ratios improved slightly but remain above the existing 1.15 assertion. |
| Console/page errors in scoped census | PASS: zero |

The scoped perf spec has since replaced its earlier weak screenshot assertion and passes in both projects. It enforces the 200-call budget, 33.4 ms absolute p95 cap, paired no-regression tolerances, the stricter pixel predicate, and zero console/page errors.

## Review disposition

The independent uncommitted review identified four issues. The stale-baseline/no-performance-regression gap, missing static screenshot comparison, and overly loose visual predicate were fixed. The request to include Drill Yard was dismissed after repository contract tracing and the failed readiness experiment described above. A final review inspected the completed diff and independently rebuilt it, then had to be stopped when its repository-visible review skill recursively launched `codex review` inside itself twice; it returned no additional finding before entering that tool loop.

## Evidence

- `census-before-desktop-chrome.json`
- `census-before-mobile-chrome.json`
- `census-after-desktop-chrome.json`
- `census-after-mobile-chrome.json`
- `before/` and `after/`: normal and pressure screenshots for both Playwright projects

No commit was made; the lane orchestrator owns integration and history.
