# The Old Canal — visual verdict, 2026-09-20

UNACCEPTED: the undecided canal reads as a large translucent rectangular slab rather than a ruined waterway; channel walls, survey/lock architecture and landscape continuity are weak, with dark red ground and portrait occlusion.

The plain diagnostics correctly report three undecided choices and three derelict bands, with no wet bands. Therefore the absence of flowing water at entry is not claimed as a behavior defect. `src/systems/CanalFlowPresentation.ts:138` constructs each band as a shallow box; the derelict material is brown `#6b4a37` at opacity 0.42. That excluded presentation owner explains the conspicuous rectangle around the small survey body. A more convincing derelict channel and readable lock/survey forms need to retain the existing choice semantics and state distinctions. The plate's flowing-water state requires its own later-state review. No production change was made.

[Desktop board](board-1280.png) · [Phone board](board-390.png). Both panels are fresh plain boots of **unchanged production bytes**, labelled A/B. They are not a claimed before/after improvement. Four runs per arm and viewport use a frozen diagnostic with normal HUD; all frames remain in [verdict-captures.json](verdict-captures.json). All four plain boots have zero console/page errors, correct active contract and no test hook.

| View | Draw calls A / B | p95 median A / B | A/B delta |
| --- | --- | --- | --- |
| 1280 | [93] / [93] | 8.65 / 8.75 ms | +1.16% |
| 390 | [61] / [61] | 9.45 / 9.15 ms | -3.17% |

Timing variation between identical arms measures the host, not an art regression or improvement. The full eight-run distributions are in [performance-summary.json](performance-summary.json); do not interpret a pooled median as a distinct mode. Triangle counts and each applicable authored cap are in asset-budgets.json (or the explicit fallback inventory).

No source or asset changes in this verdict. The latest tsc/default/full build and named-guard receipt from the unchanged runtime boundary remains applicable; no map-specific simulation success is inferred from a plain boot.

Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`; pin untouched. No objective/persistence status is changed by this visual verdict.
