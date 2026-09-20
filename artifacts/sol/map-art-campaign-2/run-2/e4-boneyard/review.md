# The Boneyard — visual verdict, 2026-09-20

UNACCEPTED: enlarged painted machinery flattens into the ground at plain entry; distinct wreck silhouettes, buried-engine scale and layered yard depth are not communicated; a small blocky vehicle and portrait overlays provide little context.

The plate distinguishes wheels, boilers, crane arms and a huge half-buried engine through overlapping silhouettes. The entry instead reads as a dark, enlarged machinery print spread over the field, with a simple vehicle below the actors and a hard distant strip. Portrait further narrows the context. Other mounted bodies may be encountered elsewhere; this verdict concerns what the fresh entry communicates. Correcting ground projection and sculpted wreck hierarchy is substantial authored work, so no cheap global lighting patch is presented as a solution. No production change was made.

[Desktop board](board-1280.png) · [Phone board](board-390.png). Both panels are fresh plain boots of **unchanged production bytes**, labelled A/B. They are not a claimed before/after improvement. Four runs per arm and viewport use a frozen diagnostic with normal HUD; all frames remain in [verdict-captures.json](verdict-captures.json). All four plain boots have zero console/page errors, correct active contract and no test hook.

| View | Draw calls A / B | p95 median A / B | A/B delta |
| --- | --- | --- | --- |
| 1280 | [65] / [65] | 9.75 / 9.45 ms | -3.08% |
| 390 | [53] / [53] | 9.90 / 11.45 ms | +15.66% |

Timing variation between identical arms measures the host, not an art regression or improvement. The full eight-run distributions are in [performance-summary.json](performance-summary.json); do not interpret a pooled median as a distinct mode. Triangle counts and each applicable authored cap are in asset-budgets.json (or the explicit fallback inventory).

No source or asset changes in this verdict. The latest tsc/default/full build and named-guard receipt from the unchanged runtime boundary remains applicable; no map-specific simulation success is inferred from a plain boot.

Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`; pin untouched. No objective/persistence status is changed by this visual verdict.
