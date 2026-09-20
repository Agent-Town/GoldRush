# The Far Side — visual verdict, 2026-09-20

UNACCEPTED: crater basin, pressure equipment, suit rack and isolated dish are not communicated at plain entry; broad blurred ground bands and a long dark stripe dominate an otherwise sparse scene.

Far Side deliberately reuses the Mare Claim sculpt. The plate presents a low lunar horizon, crater, equipment station and long utility runs; entry instead shows soft brown bands and a dark linear mark with only small actors and debris. Portrait offers no additional landmark context. Quiet ground is useful, but this degree of blur and missing local hierarchy does not establish the lunar scene. A dedicated environmental/entry composition pass is needed; this verdict does not extend the earlier Mare/Eclipse dome improvement to unrelated views. No production change was made.

[Desktop board](board-1280.png) · [Phone board](board-390.png). Both panels are fresh plain boots of **unchanged production bytes**, labelled A/B. They are not a claimed before/after improvement. Four runs per arm and viewport use a frozen diagnostic with normal HUD; all frames remain in [verdict-captures.json](verdict-captures.json). All four plain boots have zero console/page errors, correct active contract and no test hook.

| View | Draw calls A / B | p95 median A / B | A/B delta |
| --- | --- | --- | --- |
| 1280 | [64] / [64] | 8.40 / 8.40 ms | +0.00% |
| 390 | [51] / [51] | 8.45 / 8.40 ms | -0.59% |

Timing variation between identical arms measures the host, not an art regression or improvement. The full eight-run distributions are in [performance-summary.json](performance-summary.json); do not interpret a pooled median as a distinct mode. Triangle counts and each applicable authored cap are in asset-budgets.json (or the explicit fallback inventory).

No source or asset changes in this verdict. The latest tsc/default/full build and named-guard receipt from the unchanged runtime boundary remains applicable; no map-specific simulation success is inferred from a plain boot.

Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`; pin untouched. No objective/persistence status is changed by this visual verdict.
