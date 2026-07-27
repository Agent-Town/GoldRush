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

An isolated Three.js/GLTFLoader harness rendered the shipped and detail GLBs for 180 frames each at 1280×800 with the production 48° camera direction `(0, 26.2, 18.3)`.

| Model | Calls | Triangles | Geometries | Textures | p95 frame |
|---|---:|---:|---:|---:|---:|
| Shipped | 4 | 11,832 | 4 | 6 | 10.9 ms |
| Detail Sol | 4 | 42,976 | 4 | 6 | 10.1 ms |

The useful result is the unchanged four-call/resource shape; the p95 pair is scheduler-sensitive and is not evidence that the heavier model is faster. Raw evidence: `assets/pilots/dredge-queen-3d/renders/dredge-queen-detail-sol-performance.json`.

### Review surface

`assets/pilots/dredge-queen-3d/renders/dredge-queen-detail-sol-turntable.png`

### Known ceiling

This is a geometry-and-material-detail pass, not a runtime animation rewrite. It preserves the shipped mount, node, and morph contract; winner promotion requires changing only the production GLB URL and its exact-triangle guard (`11_832` → `42_976`). Those two `src/` constants remain untouched here so the blind contestants stay disjoint and the verdict still controls what ships. The boss system continues to own claw-cycle and act choreography.

## Salvage Claw

Pending milestone 2.
