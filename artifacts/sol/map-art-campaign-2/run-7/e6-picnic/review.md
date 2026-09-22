# The Picnic — run 7 variant footprints

**FIXED variant solidity / HELD prior composition and baseline parity debt.** All 1 registered variant solids mount beside the five unchanged parent bodies and the already selected nonblocking dressing: **9→10 bodies**, **+216 authored triangles**. No geometry, atlas, source transform, height, mask, gameplay contract or registry number changed. The renderer already composes these mirrored mount tables, so no renderer code change was necessary.

| New solid | X/Z | Y rotation (rad) | X/Z scale |
| --- | --- | --- | --- |
| `mesa-civilian-shade` | [0, 40] | 3.1416 | [1, 1] |

[Desktop before/after beside concept](board-1280.png) · [Phone before/after beside concept](board-390.png). Ordinary boots at 1280×800 and 390×844, seed `map-art-campaign-2`, no debug/test hook, ordinary HUD, approximately ten seconds: **zero console/page errors** in both arms. These remote authored solids need not appear in the entry camera; per-body diagnostic approach screenshots are the `walk-*.png` files. Existing concept/composition limitations remain as recorded in [run 6](../../run-6/e6-picnic/review.md); this slice closes solidity only.

Movement: **1 bodies × four outer faces × two viewports** stop the hero within 0.12 m of the composed blocker boundary; overlapping parent footprints are probed as one connected solid group. Every embedded-body probe depenetrates. Both natural spawns are walkable. All **19 published stakes, harvest points, inspection stations and sites** are reachable through the real Terrain.sample walkability on a 0.5 m cardinal grid; rectangular sites may be approached at any reachable point inside the published area, with coordinates recorded. No patrol route points are declared in these four contracts. This is a static reachability proof plus actual keyboard/sim face and escape probes, not a claim of a full objective playthrough. [Complete movement and mount proof](walk-proof.json).

Six fresh mount/dispose cycles retain exactly ten bodies, no skipped loads and zero scene children after disposal. All registered X/Z positions, rotations and scales match the rendered models exactly. All parent and registry bytes, source geometry and unrelated map blocker outputs match the base. [Invariant proof](invariants.json) · [Asset budgets](asset-budgets.json). Generic loading **8/8**, repeat **2/2** pass; map-specific load/dispose evidence is in the movement proof because those generic scripts target E5/Mare rather than accepting a map argument.

TypeScript, default/full/E1 builds pass. E1 first-town payload **34,271,464 B**, baseline **34,271,395 B**, delta **+69 B**, under 52,000,000 B; there are no new E1 art bytes, only the shared resolver’s compiled code delta. Scoped guards **40/40**, named guards initially reported **3/3** before the new unit test was tracked. The post-commit check is **2/3**: the permanent battery caller needs a package.json roster entry outside this task’s firewall. [Current attribution](../gate-caller-attribution.md). Browser suite receipts: [e2e-own-stable-gates.json](e2e-own-stable-gates.json). Any reproduced baseline failures are named in failure-attribution.md; no test assertion was changed.

Performance: four fresh boots per arm/viewport, 180 rAF intervals each, alternating arms: **1280px p95 10.20→10.25 ms (+0.49%), draws [90]→[90]; 390px p95 9.90→10.10 ms (+2.02%), draws [54]→[54]**. Both pass the 15% limits. [All samples and modes](performance-summary.json).

Null-floor check: Both Picnic seeds moved: 97967→97367 ms, kills 35→24, fnv1a32:6dc50c46→fnv1a32:a887b86b; 98533→100200 ms, kills 32→25, fnv1a32:774ca441→fnv1a32:547712da. The shade at (0,40) is the sole added blocker and the likely routing cause. Drain owns re-pinning. [Fleet output](../null-floor-check.log).

Same-game audit: **32 equal / 10 agent-lacks**, byte-identical map rows on the exact base and candidate. The requested all-EQUAL verdict is not met on the base: restart/debug/research/pause/agent-permission tape actions are the ten static deficits. This slice changes none of their owners. [Exact-base comparison](../same-game-comparison.json).

Engine `4374cdbfcb7631c86982f9439fb30583eb3eba1acbf70e1bcccaf8fb6e210b21` → `da49237c406cfbb90e634443440aaaddeb0d4185afa98e99e9e5f6cf0848d232`. Store `187e555ea982f12fe7f988184c6574a6298dcaa9` on `astra/f-corr4-2`. Engine-era and null-floor pins remain drain-owned.
