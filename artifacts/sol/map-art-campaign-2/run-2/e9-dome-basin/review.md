# The Dome Basin — visual verdict, 2026-09-20

UNACCEPTED: plain entry does not communicate the canal, lock wheel or terraced settlement; very dark red ground and a peripheral rail dominate, while portrait loses excavation context and shows weak landmark separation.

The plate emphasizes a water corridor, monumental lock machinery, earthwork terraces and distant domed facilities. The fresh entry is a red excavation with a rail, scattered small props and almost no readable architectural hierarchy. Both profiles naturally displayed the quality-reduction notice under load, retained in the evidence. This is an initial-view correspondence verdict, not proof that later terraforming cannot change the scene. Ground values, landmark separation and the intended before/after terraforming presentation need coordinated review with that system's owner. No production change was made.

[Desktop board](board-1280.png) · [Phone board](board-390.png). Both panels are fresh plain boots of **unchanged production bytes**, labelled A/B. They are not a claimed before/after improvement. Four runs per arm and viewport use a frozen diagnostic with normal HUD; all frames remain in [verdict-captures.json](verdict-captures.json). All four plain boots have zero console/page errors, correct active contract and no test hook.

| View | Draw calls A / B | p95 median A / B | A/B delta |
| --- | --- | --- | --- |
| 1280 | [71] / [71] | 34.95 / 36.05 ms | +3.15% |
| 390 | [55] / [55] | 13.45 / 12.65 ms | -5.95% |

Timing variation between identical arms measures the host, not an art regression or improvement. The full eight-run distributions are in [performance-summary.json](performance-summary.json); do not interpret a pooled median as a distinct mode. Triangle counts and each applicable authored cap are in asset-budgets.json (or the explicit fallback inventory).

No source or asset changes in this verdict. The latest tsc/default/full build and named-guard receipt from the unchanged runtime boundary remains applicable; no map-specific simulation success is inferred from a plain boot.

Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`; pin untouched. No objective/persistence status is changed by this visual verdict.
