# Relay Rush — visual verdict, 2026-09-20

UNACCEPTED: ascending beacon terraces and route progression are not communicated at plain entry; dense dark ground markings dominate, peripheral relay geometry is clipped, and portrait lacks useful landmark context.

The plate describes a route along successive elevated beacon stations, with a valley and bridge giving scale. The current entry contains a broad low-relief field, dark painted marks and only a clipped hint of relay geometry at the desktop edge; portrait shows ground and actors below the signal UI. The deliberate Relay Valley alias explains the budget names, but does not establish this variant's concept identity. Terrain and station composition need authored work; no gameplay deadline, tape behavior, mount or camera owner was changed. No production change was made.

[Desktop board](board-1280.png) · [Phone board](board-390.png). Both panels are fresh plain boots of **unchanged production bytes**, labelled A/B. They are not a claimed before/after improvement. Four runs per arm and viewport use a frozen diagnostic with normal HUD; all frames remain in [verdict-captures.json](verdict-captures.json). All four plain boots have zero console/page errors, correct active contract and no test hook.

| View | Draw calls A / B | p95 median A / B | A/B delta |
| --- | --- | --- | --- |
| 1280 | [70] / [70] | 9.60 / 9.25 ms | -3.65% |
| 390 | [53] / [53] | 9.55 / 9.30 ms | -2.62% |

Timing variation between identical arms measures the host, not an art regression or improvement. The full eight-run distributions are in [performance-summary.json](performance-summary.json); do not interpret a pooled median as a distinct mode. Triangle counts and each applicable authored cap are in asset-budgets.json (or the explicit fallback inventory).

No source or asset changes in this verdict. The latest tsc/default/full build and named-guard receipt from the unchanged runtime boundary remains applicable; no map-specific simulation success is inferred from a plain boot.

Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`; pin untouched. No objective/persistence status is changed by this visual verdict.
