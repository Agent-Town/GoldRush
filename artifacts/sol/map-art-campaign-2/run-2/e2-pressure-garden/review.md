# The Pressure Garden — visual verdict, 2026-09-20

UNACCEPTED: boiler-house and terrace hierarchy is not communicated at plain entry; broad soft river band, dark repetitive ground and peripheral machinery dominate; portrait loses the machinery behind framing and HUD.

The plate organizes three boiler houses, connected pipes and stepped cultivated terraces across a river. The plain desktop entry instead shows a large flat water strip with a small pump at its edge, over strongly mottled ground; portrait removes that pump from view. This is an entry-composition verdict, not a claim that all authored landmarks are absent elsewhere. The machinery, terrain forms and framing need coordinated work; a blanket brightness change would not supply the missing hierarchy. No production change was made.

[Desktop board](board-1280.png) · [Phone board](board-390.png). Both panels are fresh plain boots of **unchanged production bytes**, labelled A/B. They are not a claimed before/after improvement. Four runs per arm and viewport use a frozen diagnostic with normal HUD; all frames remain in [verdict-captures.json](verdict-captures.json). All four plain boots have zero console/page errors, correct active contract and no test hook.

| View | Draw calls A / B | p95 median A / B | A/B delta |
| --- | --- | --- | --- |
| 1280 | [92] / [92] | 9.95 / 9.90 ms | -0.50% |
| 390 | [60] / [60] | 9.75 / 9.65 ms | -1.03% |

Timing variation between identical arms measures the host, not an art regression or improvement. The full eight-run distributions are in [performance-summary.json](performance-summary.json); do not interpret a pooled median as a distinct mode. Triangle counts and each applicable authored cap are in asset-budgets.json (or the explicit fallback inventory).

No source or asset changes in this verdict. The latest tsc/default/full build and named-guard receipt from the unchanged runtime boundary remains applicable; no map-specific simulation success is inferred from a plain boot.

Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`; pin untouched. No objective/persistence status is changed by this visual verdict.
