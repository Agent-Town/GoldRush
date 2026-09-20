# Devil's Alley — visual verdict, 2026-09-20

UNACCEPTED: wind-anchor architecture and storm corridor are not communicated at entry; a simple rig on a dark square base sits inside a dominant ring, surrounded by dense red ground and abrupt tonal boundaries; portrait obscures its upper form.

The existing ring clearly locates an anchor, but the plate's three substantial coil towers, gate architecture and storm-shaped route are not established by the initial view. The small rig has weak separation from its dark base, and the noisy red surface overwhelms terrain form. Portrait covers the upper rig with normal UI. This does not judge whether timed storms appear later, and the functional ring is not treated as removable decoration. An authored anchor/material pass and later-state visual review are needed; no production change was made.

[Desktop board](board-1280.png) · [Phone board](board-390.png). Both panels are fresh plain boots of **unchanged production bytes**, labelled A/B. They are not a claimed before/after improvement. Four runs per arm and viewport use a frozen diagnostic with normal HUD; all frames remain in [verdict-captures.json](verdict-captures.json). All four plain boots have zero console/page errors, correct active contract and no test hook.

| View | Draw calls A / B | p95 median A / B | A/B delta |
| --- | --- | --- | --- |
| 1280 | [90] / [90] | 8.95 / 9.20 ms | +2.79% |
| 390 | [60] / [60] | 9.50 / 9.25 ms | -2.63% |

Timing variation between identical arms measures the host, not an art regression or improvement. The full eight-run distributions are in [performance-summary.json](performance-summary.json); do not interpret a pooled median as a distinct mode. Triangle counts and each applicable authored cap are in asset-budgets.json (or the explicit fallback inventory).

No source or asset changes in this verdict. The latest tsc/default/full build and named-guard receipt from the unchanged runtime boundary remains applicable; no map-specific simulation success is inferred from a plain boot.

Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`; pin untouched. No objective/persistence status is changed by this visual verdict.
