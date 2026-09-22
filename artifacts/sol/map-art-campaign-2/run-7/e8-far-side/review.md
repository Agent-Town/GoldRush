# The Far Side — run 7 variant footprints

**FIXED variant solidity / HELD prior composition and baseline parity debt.** All 4 registered variant solids mount beside the five unchanged parent bodies and the already selected nonblocking dressing: **6→10 bodies**, **+1396 authored triangles**. No geometry, atlas, source transform, height, mask, gameplay contract or registry number changed. The renderer already composes these mirrored mount tables, so no renderer code change was necessary.

| New solid | X/Z | Y rotation (rad) | X/Z scale |
| --- | --- | --- | --- |
| `probe-recovery-cradle` | [0, 45] | 3.1416 | [1, 1] |
| `west-comms-shadow-marker` | [-42, 24] | 0.18 | [1, 1] |
| `east-suit-cache-rack` | [42, -24] | -0.18 | [1, 1] |
| `far-horizon-listening-post` | [0, 56] | 3.1416 | [1, 1] |

[Desktop before/after beside concept](board-1280.png) · [Phone before/after beside concept](board-390.png). Ordinary boots at 1280×800 and 390×844, seed `map-art-campaign-2`, no debug/test hook, ordinary HUD, approximately ten seconds: **zero console/page errors** in both arms. These remote authored solids need not appear in the entry camera; per-body diagnostic approach screenshots are the `walk-*.png` files. Existing concept/composition limitations remain as recorded in [run 6](../../run-6/e8-far-side/review.md); this slice closes solidity only.

Movement: **4 bodies × four outer faces × two viewports** stop the hero within 0.12 m of the composed blocker boundary; overlapping parent footprints are probed as one connected solid group. Every embedded-body probe depenetrates. Both natural spawns are walkable. All **10 published stakes, harvest points, inspection stations and sites** are reachable through the real Terrain.sample walkability on a 0.5 m cardinal grid; rectangular sites may be approached at any reachable point inside the published area, with coordinates recorded. No patrol route points are declared in these four contracts. This is a static reachability proof plus actual keyboard/sim face and escape probes, not a claim of a full objective playthrough. [Complete movement and mount proof](walk-proof.json).

Six fresh mount/dispose cycles retain exactly ten bodies, no skipped loads and zero scene children after disposal. All registered X/Z positions, rotations and scales match the rendered models exactly. All parent and registry bytes, source geometry and unrelated map blocker outputs match the base. [Invariant proof](invariants.json) · [Asset budgets](asset-budgets.json). Generic loading **8/8**, repeat **2/2** pass; map-specific load/dispose evidence is in the movement proof because those generic scripts target E5/Mare rather than accepting a map argument.

TypeScript, default/full/E1 builds pass. E1 first-town payload **34,271,491 B**, baseline **34,271,395 B**, delta **+96 B**, under 52,000,000 B; there are no new E1 art bytes, only the shared resolver’s compiled code delta. Scoped guards **40/40**, named guards **2/3** pass; gate-callers rejects the newly tracked union test because its package roster entry is outside the task firewall; see [attribution](../gate-caller-attribution.md). Browser suite receipts: [e2e-collision-final-gates.json](e2e-collision-final-gates.json), [e2e-own-gates.json](e2e-own-gates.json). Any reproduced baseline failures are named in failure-attribution.md; no existing browser assertion was changed.

Performance: four fresh boots per arm/viewport, 180 rAF intervals each, alternating arms: **1280px p95 9.40→9.70 ms (+3.19%), draws [63]→[63]; 390px p95 9.45→9.75 ms (+3.17%), draws [50]→[50]**. Both pass the 15% limits. [All samples and modes](performance-summary.json).

Null-floor check: This map’s pinned null floors match. The complete fleet check is 81/83; only the two Picnic seeds moved. Pins remain untouched. [Fleet output](../null-floor-check.log).

Same-game audit: **32 equal / 10 agent-lacks**, byte-identical map rows on the exact base and candidate. The requested all-EQUAL verdict is not met on the base: restart/debug/research/pause/agent-permission tape actions are the ten static deficits. This slice changes none of their owners. [Exact-base comparison](../same-game-comparison.json).

Engine `39f21aea8a827ba58c52363c354420aa5cc19ea55ba1b2751ea264e04b6f6d2b` → `3ece8e8fac9f610d43579194a9d83b81f36f81a7ffdd5105fcf6c4ec191112a9`. Store `300caacfa15ad6be5e6bf41be80b0c5a331c443c` on `astra/f-corr4-2`. Engine-era and null-floor pins remain drain-owned.

Final-source focused browser suite: **26/26 pass**, covering both collision files, Far Side recovery and all Orbital browser/Node parity cases. The earlier full own batch is **61 pass / 10 reproduced base failures / 1 skip**; its position relative to the compatibility correction is explicit in [attribution](failure-attribution.md).

**HELD inherited northern-rim hero visibility:** the same remote point hides most of the hero before and after; height and walkability are identical. [Paired diagnostic and scope](rim-visibility.md). The registered parent/variant overlaps are retained as authorized.
