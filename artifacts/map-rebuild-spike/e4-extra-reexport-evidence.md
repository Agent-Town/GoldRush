# E4 extra-map re-export evidence

- Terrains: Long Road, Gusher County, and Boneyard each use one mesh, one material, one embedded 2048 atlas, and 32,768 triangles.
- Panorama v2: three separate one-mesh, one-material, one-atlas rings; Long Road uses 2,688 triangles and the other two use 3,072.
- Re-export: byte-identical and semantic-identical for all six GLBs.
- Masks: ten build rectangles independently surface-sampled at 2,145 points each with <=0.001 m deviation.
- Simulation: movement, collision, placement, spawns, convoy, eruptions, salvage, weather, and combat remain planar/code-owned.
- Mounts: 5 + 10 + 12 empty-asset landmark mount records; no landmark bodies are baked into any terrain.
- Panorama caveat: the high run camera exposes some county-ground apron; the center-horizon gate reads distance and the evidence does not crop the apron away.
