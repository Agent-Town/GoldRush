# Archive World — visual verdict, 2026-09-19

UNACCEPTED / HELD. Terraces and depth are not legible in the plain entry composition: the gate fills the near foreground, paving repeats across the middle, and a dark distant band obscures the archive vista. Local lighting lacks the plate's warm pools around the stack wings. The engraved paving remains repetitive; the phone HUD covers the near gate and cuts the view into fragments.

No material tweak was promoted. The floor already uses the dedicated native paving texture rather than false baked buildings; desaturating or smoothing it would not create the missing architectural layers. The next pass needs authored terrace/facade detail and a tested entry sightline, while preserving the existing height/footprint contracts. Camera and HUD changes require their excluded owners. Existing objects91 and floor94 remain retained improvements, not new work credited to this run.

[Desktop board](board-1280.png) · [Phone board](board-390.png). Both panels are fresh plain boots of **unchanged production bytes**, labelled A/B. They are not a claimed before/after improvement. Four runs per arm and viewport use a frozen diagnostic with normal HUD; all frames remain in [verdict-captures.json](verdict-captures.json). All four plain boots have zero console/page errors, correct active contract and no test hook.

| View | Draw calls A / B | p95 median A / B | A/B delta |
| --- | --- | --- | --- |
| 1280 | [74] / [74] | 10.05 / 10.15 ms | +1.00% |
| 390 | [53] / [53] | 10.00 / 9.80 ms | -2.00% |

Timing variation between identical arms measures the host, not an art regression or improvement. The full eight-run distributions are in [performance-summary.json](performance-summary.json); do not interpret a pooled median as a distinct mode. Triangle counts and each applicable authored cap are in asset-budgets.json (or the explicit fallback inventory).

The four named Archive contract/hold/ledger/wiring node checks PASS (`_raw/run-2/archive-named.log`, 4/4, 7.44 s). No source or asset changed after the fully built E8 boundary: tsc/default/full builds, global GLB audit and named task/citation/gate-caller guards from Mare remain applicable. These checks do not establish native objective completion; that column is untouched. No full battery was run.

Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`; pin untouched. No objective/persistence status is changed by this visual verdict.
