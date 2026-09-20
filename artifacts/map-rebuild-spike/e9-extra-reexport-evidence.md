# E9 campaign-extra re-export evidence

- Seed Run, Devil's Alley, and Old Canal terrains: one mesh, one material, one embedded 2048 atlas, 32,768 triangles each.
- Three panoramas: separate one-mesh, one-material, one embedded 2048 atlas, 3,072 triangles each.
- Re-export: byte-identical and semantic-identical for all six GLBs.
- Masks: all fifteen build rectangles independently surface-sampled at 2,145 points each with <=0.001 m deviation.
- Simulation: movement, collision, placement, spawns, persistence, water, wind, and event mechanics remain planar/code-owned.
- Mounts: five empty-asset landmark mount records per terrain; no landmark bodies baked into terrain.
