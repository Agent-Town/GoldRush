# The Dead Band — visual verdict, 2026-09-20

UNACCEPTED: empty relay frames, paired terraces and silent-field identity are not communicated at plain entry; dense dark ground and a close radio body dominate; portrait story and HUD layers obscure the body.

Dead Band deliberately reuses Relay Valley terrain/panorama, reflected in the actual asset budgets. The plate arranges empty antenna frames and quiet terraces; entry instead shows mottled ground, a small ledger label and a close radio structure below the actors. Portrait stacks transient story and normal HUD over that structure. Desktop boot A also records the natural quality-reduction notice under host load, without retouching or suppressing it. Variant-specific dressing, terrain readability and camera/UI ownership need a later coordinated pass; no production change was made.

[Desktop board](board-1280.png) · [Phone board](board-390.png). Both panels are fresh plain boots of **unchanged production bytes**, labelled A/B. They are not a claimed before/after improvement. Four runs per arm and viewport use a frozen diagnostic with normal HUD; all frames remain in [verdict-captures.json](verdict-captures.json). All four plain boots have zero console/page errors, correct active contract and no test hook.

| View | Draw calls A / B | p95 median A / B | A/B delta |
| --- | --- | --- | --- |
| 1280 | [67] / [67] | 15.05 / 17.90 ms | +18.94% |
| 390 | [57] / [57] | 10.35 / 14.80 ms | +43.00% |

Timing variation between identical arms measures the host, not an art regression or improvement. The full eight-run distributions are in [performance-summary.json](performance-summary.json); do not interpret a pooled median as a distinct mode. Triangle counts and each applicable authored cap are in asset-budgets.json (or the explicit fallback inventory).

No source or asset changes in this verdict. The latest tsc/default/full build and named-guard receipt from the unchanged runtime boundary remains applicable; no map-specific simulation success is inferred from a plain boot.

Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`; pin untouched. No objective/persistence status is changed by this visual verdict.
