# E5 Regatta re-export evidence

- Terrain: one bathymetry mesh, one material, one embedded 2048 atlas, 32,768 triangles.
- Panorama: separate one-mesh, one-material, one embedded 2048 atlas, 2,704 triangles.
- Re-export: byte-identical and semantic-identical for both GLBs.
- Water: runtime-owned; no sea surface, fast-water state, or classification is exported.
- Masks: exact published Regatta table; five beacons, storm-front zone, runtime deck, and west spawn unchanged.
- Reuse: Flotilla and Stillwater keep the existing Deepwater Claim terrain because both contracts reuse that tileId.
