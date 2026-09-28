# Relay Rush — run 7 variant footprints

**FIXED variant solidity / HELD prior composition and baseline parity debt.** All 1 registered variant solids mount beside the five unchanged parent bodies and the already selected nonblocking dressing: **9→10 bodies**, **+552 authored triangles**. No geometry, atlas, source transform, height, mask, gameplay contract or registry number changed. The renderer already composes these mirrored mount tables, so no renderer code change was necessary.

| New solid | X/Z | Y rotation (rad) | X/Z scale |
| --- | --- | --- | --- |
| `rush-start-horn` | [0, -50] | 0 | [1, 1] |

[Desktop before/after beside concept](board-1280.png) · [Phone before/after beside concept](board-390.png). Ordinary boots at 1280×800 and 390×844, seed `map-art-campaign-2`, no debug/test hook, ordinary HUD, approximately ten seconds: **zero console/page errors** in both arms. These remote authored solids need not appear in the entry camera; per-body diagnostic approach screenshots are the `walk-*.png` files. Existing concept/composition limitations remain as recorded in [run 6](../../run-6/e7-relay-rush/review.md); this slice closes solidity only.

Movement: **1 bodies × four outer faces × two viewports** stop the hero within 0.12 m of the composed blocker boundary; overlapping parent footprints are probed as one connected solid group. Every embedded-body probe depenetrates. Both natural spawns are walkable. All **15 published stakes, harvest points, inspection stations and sites** are reachable through the real Terrain.sample walkability on a 0.5 m cardinal grid; rectangular sites may be approached at any reachable point inside the published area, with coordinates recorded. No patrol route points are declared in these four contracts. This is a static reachability proof plus actual keyboard/sim face and escape probes, not a claim of a full objective playthrough. [Complete movement and mount proof](walk-proof.json).

Six fresh mount/dispose cycles retain exactly ten bodies, no skipped loads and zero scene children after disposal. All registered X/Z positions, rotations and scales match the rendered models exactly. All parent and registry bytes, source geometry and unrelated map blocker outputs match the base. [Invariant proof](invariants.json) · [Asset budgets](asset-budgets.json). Generic loading **8/8**, repeat **2/2** pass; map-specific load/dispose evidence is in the movement proof because those generic scripts target E5/Mare rather than accepting a map argument.

TypeScript, default/full/E1 builds pass. E1 first-town payload **34,271,464 B**, baseline **34,271,395 B**, delta **+69 B**, under 52,000,000 B; there are no new E1 art bytes, only the shared resolver’s compiled code delta. Scoped guards **40/40**, named guards **2/3** pass; gate-callers rejects the newly tracked union test because its package roster entry is outside the task firewall; see [attribution](../gate-caller-attribution.md). Browser suite receipts: [e2e-own-gates.json](e2e-own-gates.json), [e2e-own-mobile-gates.json](e2e-own-mobile-gates.json). Any reproduced baseline failures are named in failure-attribution.md; no existing browser assertion was changed.

Performance: four fresh boots per arm/viewport, 180 rAF intervals each, alternating arms: **1280px p95 9.75→9.20 ms (-5.64%), draws [70]→[70]; 390px p95 9.80→9.60 ms (-2.04%), draws [52]→[52]**. Both pass the 15% limits. [All samples and modes](performance-summary.json).

Null-floor check: This map’s pinned null floors match. The complete fleet check is 81/83; only the two Picnic seeds moved. Pins remain untouched. [Fleet output](../null-floor-check.log).

Same-game audit: **32 equal / 10 agent-lacks**, byte-identical map rows on the exact base and candidate. The requested all-EQUAL verdict is not met on the base: restart/debug/research/pause/agent-permission tape actions are the ten static deficits. This slice changes none of their owners. [Exact-base comparison](../same-game-comparison.json).

Engine `f00319a05cf5f5d6bea92a824e5377188e98c44da7238d8db2d659e32e4f9f13` → `39f21aea8a827ba58c52363c354420aa5cc19ea55ba1b2751ea264e04b6f6d2b`. Store `0787a539f6ee70886bc4867909fd70c0de4a3ba7` on `astra/f-corr4-2`. Engine-era and null-floor pins remain drain-owned.
