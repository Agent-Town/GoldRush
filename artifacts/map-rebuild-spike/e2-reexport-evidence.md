# E2 terrain and panorama re-export evidence

- Blender: 5.1.2
- Authored terrain pairs: Hill Mine, Trestle, Pressure Garden, and Incline.
- Terrain GLBs: one mesh, one primitive, one material, one embedded 2048 atlas, 32,768 triangles each.
- Panorama GLBs: one mesh, one primitive, one material, one embedded 2048 atlas, all below 4,000 triangles.
- Re-export: byte-identical and semantic-identical for all eight GLBs.
- Generic wrapper: `scripts/reexport-pilot.sh` omits `export_extras=True`; use only on copies until the factory aligns it.
- Simulation authority: factory masks and TileHeight remain unchanged; visual water ends at the gameplay shallows boundary.
- Pressure Garden and Incline: published mask tables copied exactly; no gameplay coordinates inferred or changed.
