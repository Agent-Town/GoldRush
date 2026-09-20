# The Canyon Works — visual verdict, 2026-09-20

UNACCEPTED: canyon depth and connected pylon hierarchy are not communicated at plain entry; dark upper band meets a hard ground edge; diagonal ground repetition and low-contrast machinery persist, with stronger portrait HUD occlusion.

The plate leads through a river gorge between illuminated switchbacks, a bridge and a foreground dynamo. The entry views instead isolate one dark mechanism above a densely repeated field, ending at a bright horizontal boundary against a nearly black upper band. Portrait overlays much of the mechanism. This is an entry-view correspondence failure, not evidence that other mounted bodies are missing. The exact atlas recipe now reproduces shipped pixels, but does not remedy terrain depth, composition or architectural readability; those need a coordinated pass. No production change was made.

[Desktop board](board-1280.png) · [Phone board](board-390.png). Both panels are fresh plain boots of **unchanged production bytes**, labelled A/B. They are not a claimed before/after improvement. Four runs per arm and viewport use a frozen diagnostic with normal HUD; all frames remain in [verdict-captures.json](verdict-captures.json). All four plain boots have zero console/page errors, correct active contract and no test hook.

| View | Draw calls A / B | p95 median A / B | A/B delta |
| --- | --- | --- | --- |
| 1280 | [74] / [74] | 9.65 / 9.75 ms | +1.04% |
| 390 | [56] / [56] | 9.95 / 9.85 ms | -1.01% |

Timing variation between identical arms measures the host, not an art regression or improvement. The full eight-run distributions are in [performance-summary.json](performance-summary.json); do not interpret a pooled median as a distinct mode. Triangle counts and each applicable authored cap are in asset-budgets.json (or the explicit fallback inventory).

No source or asset changes in this verdict. The latest tsc/default/full build and named-guard receipt from the unchanged runtime boundary remains applicable; no map-specific simulation success is inferred from a plain boot.

Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`; pin untouched. No objective/persistence status is changed by this visual verdict.
