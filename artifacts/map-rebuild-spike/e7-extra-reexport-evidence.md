# E7 extra-map terrain and panorama re-export evidence

- Fresh reference base: `5d9e87254803720cc42fb180419835502e2df94d`.
- Authored pair: Echo Canyon.
- Dead Band and Relay Rush: intentional `e7-relay-valley` tile reuse; no duplicate sculpt.
- Terrain GLB: one mesh, one primitive, one material, one embedded 2048 atlas, 32,768 triangles.
- Panorama GLB: separate one-mesh, one-material, one embedded 2048 atlas, 3,084 triangles.
- Both source `.blend` re-exports are byte-identical and semantic-identical.
- Every build rectangle is triangle-sampled at <=0.02 m deviation; every authored canyon band is sampled against h0/h5.
- Five canonical mounts ship with empty assets; all gate, array, and console bodies are verdict-only and absent from the GLB.
- Simulation authority, masks, spawn edges, broadcast mirroring, and Terrain.visualY remain unchanged.
