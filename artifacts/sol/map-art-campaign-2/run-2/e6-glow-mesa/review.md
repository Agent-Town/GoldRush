# The Glow Mesa — visual verdict, 2026-09-20

UNACCEPTED: raised mesa, teal node ring and facility grouping are not communicated at plain entry; dense mottled ground fills both views, with a clipped desktop structure and almost no portrait landmark context.

The plate establishes a raised platform, connected teal nodes and a readable group of buildings, gates and cooling equipment. Desktop entry largely shows brown texture with a clipped upper-right structure and a straight-edged contrasting patch; portrait removes those clues. This does not contradict the recorded native gameplay completion or prove that mounted landmarks are absent elsewhere. Establishing recognizable map context needs composition, ground hierarchy and authored facility work. No cheap isolated render adjustment resolves those together; no production change was made.

[Desktop board](board-1280.png) · [Phone board](board-390.png). Both panels are fresh plain boots of **unchanged production bytes**, labelled A/B. They are not a claimed before/after improvement. Four runs per arm and viewport use a frozen diagnostic with normal HUD; all frames remain in [verdict-captures.json](verdict-captures.json). All four plain boots have zero console/page errors, correct active contract and no test hook.

| View | Draw calls A / B | p95 median A / B | A/B delta |
| --- | --- | --- | --- |
| 1280 | [70] / [70] | 9.70 / 9.75 ms | +0.52% |
| 390 | [50] / [50] | 9.90 / 9.75 ms | -1.52% |

Timing variation between identical arms measures the host, not an art regression or improvement. The full eight-run distributions are in [performance-summary.json](performance-summary.json); do not interpret a pooled median as a distinct mode. Triangle counts and each applicable authored cap are in asset-budgets.json (or the explicit fallback inventory).

No source or asset changes in this verdict. The latest tsc/default/full build and named-guard receipt from the unchanged runtime boundary remains applicable; no map-specific simulation success is inferred from a plain boot.

Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`; pin untouched. No objective/persistence status is changed by this visual verdict.
