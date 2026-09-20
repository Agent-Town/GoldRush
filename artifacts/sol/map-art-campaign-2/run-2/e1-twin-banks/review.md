# Twin Banks — visual verdict, 2026-09-20

UNACCEPTED: the braided rivers and paired bank clearings are not readable from the plain entry; noisy dirt dominates, the house/rig are peripheral or cropped, sparse prop cards lack the plate’s riparian density, and portrait hides most of the water.

The existing sculpt is loaded and the warm wooden house is legible on desktop, but this does not establish full concept correspondence. The next pass needs an authored river-edge composition and grounded riparian dressing; camera/HUD and generic prop owners are excluded from a cheap per-map material fix. No production change was made.

[Desktop board](board-1280.png) · [Phone board](board-390.png). Both panels are fresh plain boots of **unchanged production bytes**, labelled A/B. They are not a claimed before/after improvement. Four runs per arm and viewport use a frozen diagnostic with normal HUD; all frames remain in [verdict-captures.json](verdict-captures.json). All four plain boots have zero console/page errors, correct active contract and no test hook.

| View | Draw calls A / B | p95 median A / B | A/B delta |
| --- | --- | --- | --- |
| 1280 | [80] / [80] | 10.00 / 9.95 ms | -0.50% |
| 390 | [58] / [58] | 10.00 / 9.50 ms | -5.00% |

Timing variation between identical arms measures the host, not an art regression or improvement. The full eight-run distributions are in [performance-summary.json](performance-summary.json); do not interpret a pooled median as a distinct mode. Triangle counts and each applicable authored cap are in asset-budgets.json (or the explicit fallback inventory).

No source or asset changes in this verdict. The latest tsc/default/full build and named-guard receipt from the unchanged runtime boundary remains applicable; no map-specific simulation success is inferred from a plain boot.

Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`; pin untouched. No objective/persistence status is changed by this visual verdict.
