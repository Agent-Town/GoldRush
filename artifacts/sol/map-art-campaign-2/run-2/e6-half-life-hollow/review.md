# Half-Life Hollow — visual verdict, 2026-09-20

UNACCEPTED: flat ochre causeway and pale teal slabs dominate the entry; ravine depth, countdown-gate architecture and suspended crossings are not communicated; dark ground and portrait overlays compound the gap.

The plate frames a deep ravine with three suspended crossings and a monumental countdown gate. Both plain entries instead center a large untextured ochre patch over dark terrain; desktop also shows pale teal slabs at the edges. The owner is concrete: `src/game/Game.ts:6139` creates `HollowCrossingVisuals` from shallow BoxGeometry, using causeway color `#c4883a` and glow bridge color `#83ded7`; `resampleHollowCrossingVisuals` positions each box from its center height. That excluded Game owner must coordinate a better crossing presentation without changing traversability or radiation semantics. Terrain and landmark composition remain a separate authored follow-up. Existing native completion evidence is preserved. No production change was made.

[Desktop board](board-1280.png) · [Phone board](board-390.png). Both panels are fresh plain boots of **unchanged production bytes**, labelled A/B. They are not a claimed before/after improvement. Four runs per arm and viewport use a frozen diagnostic with normal HUD; all frames remain in [verdict-captures.json](verdict-captures.json). All four plain boots have zero console/page errors, correct active contract and no test hook.

| View | Draw calls A / B | p95 median A / B | A/B delta |
| --- | --- | --- | --- |
| 1280 | [75] / [75] | 9.35 / 9.30 ms | -0.53% |
| 390 | [54] / [54] | 9.75 / 9.55 ms | -2.05% |

Timing variation between identical arms measures the host, not an art regression or improvement. The full eight-run distributions are in [performance-summary.json](performance-summary.json); do not interpret a pooled median as a distinct mode. Triangle counts and each applicable authored cap are in asset-budgets.json (or the explicit fallback inventory).

No source or asset changes in this verdict. The latest tsc/default/full build and named-guard receipt from the unchanged runtime boundary remains applicable; no map-specific simulation success is inferred from a plain boot.

Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`; pin untouched. No objective/persistence status is changed by this visual verdict.
