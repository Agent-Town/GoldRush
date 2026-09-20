# E8 campaign-extra re-export evidence

- Low Orbit terrain: one mesh, one material, one embedded 2048 atlas, 32,768 triangles.
- Low Orbit panorama: separate one-mesh, one-material, one embedded 2048 atlas, 2,688 triangles.
- Re-export: byte-identical and semantic-identical for both GLBs.
- Masks: all three scaffold rectangles independently surface-sampled at 2,145 points each with <=0.001 m deviation.
- Simulation: zero-G movement, orbital-return projectiles, collision, placement, spawns, debris, and handholds remain planar/code-owned.
- Mounts: five empty-asset landmark mount records; no landmark bodies baked into the terrain.
- Reuse: Far Side and Eclipse keep the accepted Mare Claim terrain because both published tables reuse tileId e8-mare-claim.
- Variant audit: Eclipse's reused build zones remain render-flat. Far Side's two authored rectangles cross Mare Claim's 0 m / 6 m rim transition, so their mask-to-shared-render agreement needs a factory-side contract or placement correction; this wave does not mutate the accepted shared sculpt.
