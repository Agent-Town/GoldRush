# The Dust Flats — visual verdict, 2026-09-20

UNACCEPTED: coarse high-contrast painted ground and oversized dark forms overwhelm the plain entry; the road loop, derrick group and open desert spacing are not communicated, especially in portrait.

The plate has an open, relatively quiet desert field, a legible circular road and a compact central industrial group. Desktop entry is dominated by very dark angular forms and mottled brown texture; portrait magnifies the texture while dropping almost all landmark context. The small player remains detectable but does not recover the map hierarchy. This is a material-scale and composition problem requiring authored work, not a safe single tint correction. No production change was made. The natural plain boots have different elapsed times under host load, so no pixel-delta improvement is claimed.

[Desktop board](board-1280.png) · [Phone board](board-390.png). Both panels are fresh plain boots of **unchanged production bytes**, labelled A/B. They are not a claimed before/after improvement. Four runs per arm and viewport use a frozen diagnostic with normal HUD; all frames remain in [verdict-captures.json](verdict-captures.json). All four plain boots have zero console/page errors, correct active contract and no test hook.

| View | Draw calls A / B | p95 median A / B | A/B delta |
| --- | --- | --- | --- |
| 1280 | [80] / [80] | 9.80 / 9.75 ms | -0.51% |
| 390 | [56] / [56] | 17.15 / 17.30 ms | +0.87% |

Timing variation between identical arms measures the host, not an art regression or improvement. The full eight-run distributions are in [performance-summary.json](performance-summary.json); do not interpret a pooled median as a distinct mode. Triangle counts and each applicable authored cap are in asset-budgets.json (or the explicit fallback inventory).

No source or asset changes in this verdict. The latest tsc/default/full build and named-guard receipt from the unchanged runtime boundary remains applicable; no map-specific simulation success is inferred from a plain boot.

Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`; pin untouched. No objective/persistence status is changed by this visual verdict.
