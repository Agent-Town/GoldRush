# Ember Shore — visual verdict, 2026-09-19

UNACCEPTED / HELD for full concept. The existing 169 ground-coverage repair is retained: the 160 m sculpt continuation and panorama ground skirt cover the perimeter, with a common world-scale material. This is a pre-existing bounded improvement, not newly authored work.

Plain entry still reads as dark, soft terrain around one bright vent. The plate's fractured basalt shelves, branching hot fissures and dominant buried titan are not communicated at that camera. Thin material transitions and rectangular painted regions remain open; fixing them requires coordinated atlas/UV and shelf treatment rather than extending the apron over the ridge. The panorama contract already supplies a ground skirt from the playfield rectangle to 161.5 m, so a naive 160→162 radius change would not cure an uncovered hole. No such change was made.

The older 153/157 candidates remain rejected. The inspected 157 review explicitly rejects dominant geometry/pose/rift design, not just texture detail; its unrelated ground candidate was not copied into this tree. HUD/story cards further obstruct the boot, outside this firewall. Current captures and source inspection do not establish full terrain/titan fidelity.

Fresh maximum-zoom diagnostic corner/rack captures (`corners.json`, 10 stations, zero errors) retain continuous ground. Southeast and rack views show the actual remaining defect: rectangular soft-edged patches meet a differently textured repeated field; the seam is visible even though neither side is missing. The northwest phone view also exposes the dense repeating field beneath the haze. These are current observations, not inherited acceptance of the old screenshots.

[Desktop board](board-1280.png) · [Phone board](board-390.png). Both panels are fresh plain boots of **unchanged production bytes**, labelled A/B. They are not a claimed before/after improvement. Four runs per arm and viewport use a frozen diagnostic with normal HUD; all frames remain in [verdict-captures.json](verdict-captures.json). All four plain boots have zero console/page errors, correct active contract and no test hook.

| View | Draw calls A / B | p95 median A / B | A/B delta |
| --- | --- | --- | --- |
| 1280 | [74] / [74] | 8.50 / 8.50 ms | +0.00% |
| 390 | [57] / [57] | 9.30 / 9.45 ms | +1.61% |

Timing variation between identical arms measures the host, not an art regression or improvement. The full eight-run distributions are in [performance-summary.json](performance-summary.json); do not interpret a pooled median as a distinct mode. Triangle counts and each applicable authored cap are in asset-budgets.json (or the explicit fallback inventory).

Existing Ember preserve and squall suites: **12/12 PASS**, both projects, one worker, 5.0 minutes. Plain meter, actual earned-gold stoke errand, unstoked loss and exact phase-clock behavior all pass, with zero suppressed blob errors. [Gate receipt](ember-own-gates.json). Generated squall screenshots are preserved and restored by exact filename. No source/assets changed after the fully built E8 boundary, so its tsc/default/full builds, global GLB audit and named guards remain applicable. No full node battery was run.

Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`; pin untouched. No objective/persistence status is changed by this visual verdict.
