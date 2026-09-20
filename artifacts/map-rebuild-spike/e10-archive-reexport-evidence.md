# E10 Archive World re-export evidence

- Archive World terrain: one mesh, one material, one embedded 2048 atlas, 32,768 triangles.
- Panorama v2: separate one-mesh, one-material, one embedded 2048 atlas, 3,072 triangles.
- Re-export: byte-identical and semantic-identical for both GLBs.
- Masks: four build rectangles independently surface-sampled at 2,145 points each with <=0.001 m deviation.
- Simulation: movement, collision, placement, spawns, Static, re-ink progression, and lore unlocks remain planar/code-owned.
- Mounts: five separate landmark mount records; selected assets verified when present, with no landmark bodies baked into terrain.
- Variants: Last Claim reuses the Ark deck and River reuses The Claim; both factory contracts set terrainMesh=off.
