# Boss Detail Duel — GPT-5.6-Sol self-report

Branch: `bench/sol-boss-detail`
Base: `1acccf5eff8703edbca3f7960f396794f5dcdcc8` (`origin/main`, 2026-07-27)
Blender: 5.1.2

## Dredge Queen — milestone 1

### Fidelity

The production four-part silhouette remains intact, but the raised budget is spent where the source plate reads richest: doubled crane lattice and tension cables, worked pulley faces, articulated claw joints, hull armor ribs, teal-rimmed portholes, secondary paddle gearing/spokes/pins, wheelhouse dome ribs and mullions, twin stacks, hold-lid bosses, and the main-mast yardarm. The claw remains the visible cycling pressure component; both paddles remain independent Act-1 objectives; the hold still owns the Act-3 spill, sail strike, and hulk state.

The model keeps the E5 storm-barge palette: oxblood sail, charcoal/teal armor, warm brass, rope and cargo accents. It uses the ratified source plates rather than introducing a new visual source.

### Craft legality

| Check | Result |
|---|---:|
| GLB | `assets/pilots/dredge-queen-3d/dredge-queen-detail-sol.glb` |
| Triangles | 42,976 / 45,000 |
| Materials / atlases | 1 / one embedded 2048×2048 PNG |
| Meshes / expected draw calls | 4 / 4 |
| Bounds | 8.000 × 4.983 × 5.333; base-centered |
| Runtime nodes | `claw`, `paddle_port`, `paddle_starboard`, `hold` |
| Morphs | original four damage morph names, default weight 0 |
| Cameras / lights / animations | 0 / 0 / 0 |
| Re-export | byte-identical, SHA-256 `dc79e7862726d93588b1286fc61c811779a5c82fce7e1a44d08cc9ac3d697f66` |

Machine-readable proof: `assets/pilots/dredge-queen-3d/renders/dredge-queen-detail-sol-stats.json`.

### Performance

The Gold Rush boot rig loaded each model into the E5 Deepwater Claim contract, mounted Act 1 at the production 42° gameplay camera, and sampled `renderer.info` plus frame cadence for 180 frames at 1280×800.

| Model | Calls p95 | Scene triangles p95 | Geometries max | Textures max | Frame p95 |
|---|---:|---:|---:|---:|---:|
| Shipped | 76 | 108,124 | 82 | 22 | 84.9 ms |
| Detail Sol | 76 | 139,268 | 82 | 22 | 84.6 ms |

The useful result is the unchanged full-scene call and resource counts; the 31,144-triangle scene delta exactly matches the asset delta. Headless frame p95 is backend- and scheduler-sensitive. Start `npm run dev -- --port 5237 --strictPort`, then run `node scripts/bench-boss-detail-sol-performance.mjs`; raw evidence: `assets/pilots/dredge-queen-3d/renders/dredge-queen-detail-sol-performance.json`.

### Review surface

`assets/pilots/dredge-queen-3d/renders/dredge-queen-detail-sol-turntable.png`

### Known ceiling

This is a geometry-and-material-detail pass, not a runtime animation rewrite. It preserves the shipped mount, node, and morph contract; winner promotion requires changing only the production GLB URL and its exact-triangle guard (`11_832` → `42_976`). Those two `src/` constants remain untouched here so the blind contestants stay disjoint and the verdict still controls what ships. The boss system continues to own claw-cycle and act choreography.

## Salvage Claw — milestone 2

### Fidelity

The shipped corsair-city silhouette and three landing contracts remain intact. The added budget goes to the source plate's mechanical hierarchy: a three-tier underslung truss cage, radial keel ribs, hanging city teeth and teal eyes, twelve flying buttresses, denser crown tracery and window jewels, grooved twin rope drums, visible gear rims and teeth, hanging winch cables, paired anchor pistons, toe knuckles, and armored toe caps. These additions make the crown read as a descending claim-palace rather than a smooth saucer while keeping its four-foot landing stance and giant paired winch readable.

The intact model remains a cold iron/teal/brass salvage machine with pictogram-only claim pendants. It adds no public backend names, realistic firearms, gore, or forbidden enemy coding.

### Craft legality

| Check | Result |
|---|---:|
| GLB | `assets/pilots/salvage-claw-3d/salvage-claw-detail-sol.glb` |
| Triangles | 34,540 / 45,000 |
| Materials / atlases | 1 / one embedded 2048×2048 PNG |
| Meshes / expected draw calls | 3 / 3 |
| Bounds | 11.400 diameter × 10.031 high; base-centered |
| Runtime nodes | `winch`, `anchor_feet`, `crown` |
| Morphs | original three landing morph names, default weight 0 |
| Cameras / lights / animations | 0 / 0 / 0 |
| Re-export | byte-identical, SHA-256 `4c438e6ec76df8c8a8d43eef5451502b7ccffbd63b02edb8da6944a607ced6b2` |

Machine-readable proof: `assets/pilots/salvage-claw-3d/renders/salvage-claw-detail-sol-stats.json`.

### Performance

The same boot rig loaded each model into E8 Mare Claim, mounted Act 1 at the production 42° gameplay camera, and sampled `renderer.info` plus frame cadence for 180 frames at 1280×800.

| Model | Calls p95 | Scene triangles p95 | Geometries max | Textures max | Frame p95 |
|---|---:|---:|---:|---:|---:|
| Shipped | 98 | 121,566 | 95 | 24 | 133.2 ms |
| Detail Sol | 98 | 170,318 | 95 | 24 | 151.3 ms |

The full scene keeps identical call and resource counts. Its 48,752-triangle renderer delta is twice the 24,376-triangle asset delta because the Mare Claim render includes the model in an additional pass. Headless frame p95 is backend- and scheduler-sensitive. Start `npm run dev -- --port 5237 --strictPort`, then run `node scripts/bench-boss-detail-sol-performance.mjs`; raw evidence: `assets/pilots/salvage-claw-3d/renders/salvage-claw-detail-sol-performance.json`.

### Review surface

`assets/pilots/salvage-claw-3d/renders/salvage-claw-detail-sol-turntable.png`

### Known ceiling

This is a geometry-and-material-detail pass, not a runtime choreography rewrite. The winch, four feet, and dark-crown landing morphs remain the production animation surface. Winner promotion requires changing only the production GLB URL and exact-triangle guard (`10_164` → `34_540`) in `src/systems/SalvageClawBossSystem.ts`; both constants remain untouched until the owner verdict.

## Submission summary

Both entries are generated from deterministic Blender scripts, use their ratified intact/damage source plates, preserve the shipped component and morph names, and remain below the per-boss 45,000-triangle and two-atlas ceilings. The duel branch does not alter runtime selection, simulation semantics, or existing production assets.
