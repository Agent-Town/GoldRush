# Tavern recipe re-export evidence

- Blender: `5.1.2` headless.
- Source: `assets/pilots/tavern-3d/tavern-2-fullwrap.blend`.
- Checked GLB SHA-256: `fa3e057e5cd8e87b5da3f0fc32f06a0ab6cd9d81f76e7e8601a2c1bdb9087722`.
- Re-export GLB SHA-256: `fa3e057e5cd8e87b5da3f0fc32f06a0ab6cd9d81f76e7e8601a2c1bdb9087722`.
- Checked/re-export size: `904,908` / `904,908` bytes.
- Byte comparison: identical (`cmp` exit 0); byte drift was allowed but none occurred.
- Parsed source: one mesh, 10,864 triangles, one material, one `UVMap`, bounds `5.128 × 3.393147 × 3.960`, base-center location `(0,0,0)`, zero modifiers, zero cameras, zero lights.
- Material: packed 1024² sRGB atlas; Image Texture `FLAT` / `REPEAT` / `Linear`; Color → Principled Base Color; metallic `0`; roughness `0.9`; no emissive link.
- Gate verdict: PASS. The headless result is byte-identical to the owner-approved GLB whose asset contract and desktop/mobile browser gate passed; therefore no runtime or semantic re-test substitution is involved.
- Machine-readable inspection: `artifacts/town3d-recipe/blend-inspection.json`.
