# E6 extra-map terrain and panorama re-export evidence

- Fresh reference base: `2b4e430f0f0e0be67dff3f3c7b358abb08f79f19`.
- Authored pairs: The Showroom and Half-Life Hollow.
- Picnic: intentional `e6-glow-mesa` tile reuse; no duplicate sculpt.
- Terrain GLBs: one mesh, one primitive, one material, one embedded 2048 atlas, 32,768 triangles each.
- Panorama GLBs: separate one-mesh, one-material, one embedded 2048 atlas, 2,688 triangles each.
- All four source `.blend` re-exports are byte-identical and semantic-identical.
- Every authored build rectangle is independently triangle-sampled at <=0.02 m deviation.
- Half-Life Hollow's two glow bridges and causeway are empty terrain sockets; their preview panels are not exported.
- Five canonical empty-asset mounts ship per E6 sculpt; Regatta's eight proposed ids are backfilled at runtime sea level.
- Simulation authority, masks, and Terrain.visualY remain unchanged.
