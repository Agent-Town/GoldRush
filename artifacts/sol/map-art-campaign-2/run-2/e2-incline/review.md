# The Incline — visual verdict, 2026-09-20

UNACCEPTED: stepped cliff, cable lift and carts are not communicated at plain entry; dark mottled field and a peripheral rail dominate; portrait excludes the rail and principal machinery.

The concept ties an upper winding house and lower boiler to a conspicuous lift across three cliff terraces. Neither plain entry viewport explains that vertical relationship: desktop mostly shows ground and a straight rail, while portrait shows only the field and small actors behind the normal HUD. This does not establish that the lift is absent elsewhere. A coordinated terrain, landmark and entry-composition pass is needed; tinting the ground would not create the cliff hierarchy. No production change was made.

[Desktop board](board-1280.png) · [Phone board](board-390.png). Both panels are fresh plain boots of **unchanged production bytes**, labelled A/B. They are not a claimed before/after improvement. Four runs per arm and viewport use a frozen diagnostic with normal HUD; all frames remain in [verdict-captures.json](verdict-captures.json). All four plain boots have zero console/page errors, correct active contract and no test hook.

| View | Draw calls A / B | p95 median A / B | A/B delta |
| --- | --- | --- | --- |
| 1280 | [78] / [78] | 9.95 / 9.90 ms | -0.50% |
| 390 | [60] / [60] | 9.45 / 9.70 ms | +2.65% |

Timing variation between identical arms measures the host, not an art regression or improvement. The full eight-run distributions are in [performance-summary.json](performance-summary.json); do not interpret a pooled median as a distinct mode. Triangle counts and each applicable authored cap are in asset-budgets.json (or the explicit fallback inventory).

No source or asset changes in this verdict. The latest tsc/default/full build and named-guard receipt from the unchanged runtime boundary remains applicable; no map-specific simulation success is inferred from a plain boot.

Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`; pin untouched. No objective/persistence status is changed by this visual verdict.
