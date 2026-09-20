# The Trestle — visual verdict, 2026-09-20

UNACCEPTED: the trestle span and canyon depth are not readable at entry; intersecting/abruptly ending rails, muddy ground detail and cropped near machinery dominate, with weak landmark contrast and restricted portrait framing.

The rendered railway vocabulary is present, but the plain spawn frames the yard rather than the bridge-and-river relationship in the plate. This is an entry-view verdict, not a claim that no bridge exists elsewhere on the map. Repair needs authored rail joins, structural presentation and a reviewed sightline; a palette-only edit would not settle it. No production change was made.

[Desktop board](board-1280.png) · [Phone board](board-390.png). Both panels are fresh plain boots of **unchanged production bytes**, labelled A/B. They are not a claimed before/after improvement. Four runs per arm and viewport use a frozen diagnostic with normal HUD; all frames remain in [verdict-captures.json](verdict-captures.json). All four plain boots have zero console/page errors, correct active contract and no test hook.

| View | Draw calls A / B | p95 median A / B | A/B delta |
| --- | --- | --- | --- |
| 1280 | [89] / [89] | 10.05 / 9.85 ms | -1.99% |
| 390 | [67] / [67] | 9.85 / 9.85 ms | -0.00% |

Timing variation between identical arms measures the host, not an art regression or improvement. The full eight-run distributions are in [performance-summary.json](performance-summary.json); do not interpret a pooled median as a distinct mode. Triangle counts and each applicable authored cap are in asset-budgets.json (or the explicit fallback inventory).

No source or asset changes in this verdict. The latest tsc/default/full build and named-guard receipt from the unchanged runtime boundary remains applicable; no map-specific simulation success is inferred from a plain boot.

Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`; pin untouched. No objective/persistence status is changed by this visual verdict.
