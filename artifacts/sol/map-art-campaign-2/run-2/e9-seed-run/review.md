# The Seed Run — visual verdict, 2026-09-20

UNACCEPTED: convoy, irrigated route and distant basin settlement are not communicated at entry; dark red terrain, fragmented route marks and a blocky red-roof gate replace the plate's continuous landscape hierarchy; portrait obscures the gate.

The departure is locally legible through its existing announcement, pale pool and marker ring. However, the plate's seed wagons and green/water corridor toward a domed settlement do not read in either initial view. The gate is a simple red-roof body on a dark base, and portrait overlays its upper half. This capture does not evaluate the later caravan journey or terraforming state. Continuous route presentation, convoy identity and landmark/ground integration require a coordinated authored pass; no behavior or route marker was changed. No production change was made.

[Desktop board](board-1280.png) · [Phone board](board-390.png). Both panels are fresh plain boots of **unchanged production bytes**, labelled A/B. They are not a claimed before/after improvement. Four runs per arm and viewport use a frozen diagnostic with normal HUD; all frames remain in [verdict-captures.json](verdict-captures.json). All four plain boots have zero console/page errors, correct active contract and no test hook.

| View | Draw calls A / B | p95 median A / B | A/B delta |
| --- | --- | --- | --- |
| 1280 | [128] / [128] | 9.25 / 8.85 ms | -4.32% |
| 390 | [74] / [74] | 9.10 / 9.00 ms | -1.10% |

Timing variation between identical arms measures the host, not an art regression or improvement. The full eight-run distributions are in [performance-summary.json](performance-summary.json); do not interpret a pooled median as a distinct mode. Triangle counts and each applicable authored cap are in asset-budgets.json (or the explicit fallback inventory).

No source or asset changes in this verdict. The latest tsc/default/full build and named-guard receipt from the unchanged runtime boundary remains applicable; no map-specific simulation success is inferred from a plain boot.

Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`; pin untouched. No objective/persistence status is changed by this visual verdict.
