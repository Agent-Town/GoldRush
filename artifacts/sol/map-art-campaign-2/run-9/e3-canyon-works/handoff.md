# Canyon Works — run 9 E3 handoff

2026-09-23. **READY-FOR-GATES — IMPROVED / HELD.** This leg completes only `e3-canyon-works`; full concept fidelity is not accepted. [Every carried clause, verbatim, with its answer](review.md) · [Desktop board](board-1280.png) · [Phone board](board-390.png) · [Independent critique](independent-visual-review.md).

## Integrate

Code/evidence is the commit containing this note on `sol/map-art-campaign-2`, based on **`84992f3bf69f04cb7815744442b81b50958775c7`**. Store **`b04141647762fd25aed02a86ac5ee00a627f8d14`**, based on **`d76ee141dcac825aa29cf4e5d4a868fe845fb1c8`**, is pushed and read back on `astra/fidelity-2`. The actual edited store is `worktrees/GoldRush-assets`; the separate primary store remains untouched. [Publication receipt](store-publication.json).

Engine **`72968f9ab06af85b2754a57ba175fb04a106f60db887103b4cf8f494584ea3c2` → `c01ea77a83fe3183df84df0b627f3f5ab252047ad3f1afb7d3b840e31879e56e`**. The engine pin is unchanged and drain-owned. Retain already-landed main mirror fixes **`214a54568` and `82c226185`** when integrating: the lane's original filter fails on 15 base / 18 candidate source paths; exact current-main filters pass the unchanged test. [Proof](mirror-prerequisite-proof.json) · [Path attribution](mirror-failure-attribution.json).

The only product code change is render-only `Terrain3dClaimPilot.ts`: reuse the existing world-depth treatment for Canyon rock/apron materials and route the apron through the existing ground treatment. The Pressure Garden caller retains its behavior. Store changes comprise the primary dynamo, panorama, their two contracts/Blender sources, and frozen-input reproduction recipes. Playable terrain, height, masks, routes, spawns, collision authority, mounts, stations, atlas pixels and four sibling landmark GLBs remain unchanged. [Invariants](invariants.json).

## Verdict and cost

- **IMPROVED:** supported dynamo, seamed roof, material separation and plinth; **1,768 → 2,552 / 3,000 triangles**. Body median **+2.55% desktop / +2.88% phone** versus run 4; emission **0.45** unchanged.
- **IMPROVED:** layered rim and continuous earth apron; **2,496 → 3,980 / 4,000 triangles**, all new vertices outside the playfield. Prior bright-seam counts remain **0/0**; fresh paired seam-step contrast falls **75.84% / 83.19%**. Playable-ground pixels stay identical between fresh paired arms.
- **FIXED:** crude teal square replaced with a small passive enamel dial. **HELD art:** fine engraving, uniform orange framing, weak contact, sparse/angular cliffs, repeated playable-ground grain and four unchanged sibling bodies. Layout, connected-grid composition, camera and UI remain with their existing owners.
- **HUD increase disclosed:** historical primary phone coverage **0.002018% → 0.009873%**, desktop **0.002261% → 0%**. Phone entry remains **26.622%** covered, versus historical 27.305% and fresh baseline 26.310%. [All five stations and all increases](hud-comparison.md).
- **Measured cost:** p95 **9.50 → 9.75 ms / 9.65 → 9.65 ms**, +2.63% / 0%, four isolated fresh samples per arm and viewport, single mode. Draws **72 → 74 / 54 → 56**; runtime geometry **+2,268 triangles**. Raw GLBs **+15,677,584 B**, predominantly the panorama's three embedded 2048-square atlases. These are file sizes, not compressed network transfer measurements. [Timing](performance-summary.json) · [Bytes](runtime-asset-bytes.json).
- E1 payload **34,311,999 B**, below 52,000,000 B; **+133 B versus the preceding E2 leg's recorded 34,311,866 B**, no E1 art changes. This is a comparison to that recorded receipt, not a fresh paired E1 build.

## Verification

| Check | Result |
| --- | --- |
| TypeScript; default/full/E1 builds | PASS |
| Five required render test files | 34 PASS |
| Named task/citation/gate-caller guards | 3 PASS |
| Loading / repeat probes on final candidate | 8/8 and 2/2 PASS |
| Shared Pressure Garden caller browser regression | 2/2 PASS |
| Final own/pack browser batch | 75 PASS / 7 SKIP / 14 FAIL, attributed below |
| Plain boot / station / timing captures | 4 / 24 / 16 samples, zero console/page errors |
| Saved-source export and frozen-input recipes | All five bodies and panorama reproduce byte-identically |
| Authority, bounds, budgets, runtime depth | PASS |

All fourteen browser cases fail on the exact code/store/engine base. Ten match exact expected/received fingerprints. The two slope-speed checks fail the same predicate with different wall-clock-polled ratios on the unrelated `gt-test-basin` tile; numeric identity is not claimed. The two Crawler fixed-count checks fail on both, with the candidate's **+2,268** triangles exactly explained by this art. Tests and assertions are untouched. The candidate was restored byte-for-byte after base attribution. [Every case and value](browser-failure-attribution.json) · [Final command](e2e-canyon-final-gates.json) · [Build receipts](build-gates.json) · [Node receipts](node-gates.json) · [Final probes](probes-gates.json).

The evidence exception restored 52 regenerated tracked artifacts and moved 16 generated untracked artifacts outside the owned surface; all copies and raw logs remain in `_raw/run-9/e3-canyon-works-generated-churn` and adjacent raw directories, excluded from the commit. [Exact paths](evidence-churn.json). No test, STATUS, spec, gameplay or engine-pin edits; no generated image service used.

## Remaining list

This E3 leg: **none**. Later epoch legs, in order, outside this task:

1. `e4-dust-flats`
2. `e4-long-road`
3. `e4-gusher-county`
4. `e4-boneyard`
5. `e6-glow-mesa`
6. `e6-half-life-hollow`
7. `e6-picnic`
8. `e7-dead-band`
9. `e7-relay-rush`
10. `e8-far-side`
11. `e8-low-orbit`
12. `e9-dome-basin`
13. `e9-seed-run`
14. `e9-devils-alley`
15. `e9-old-canal`
