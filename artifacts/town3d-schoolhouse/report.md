# Schoolhouse 3D report

## Asset contract

- Blender 5.1.2 source: `assets/pilots/schoolhouse-3d/schoolhouse.blend`
- GLB: one mesh, one primitive, 5,520 triangles, one embedded 1024 square image/material
- Bounds: 3.96 x 5.60 x 3.375; base Y 0; center X/Z 0/0.0075
- Material: metallic 0, roughness 0.9, no emissive texture
- Cameras/lights/animations: 0/0/0
- Saved-source re-export: byte-identical SHA-256 and parsed contract

## Visual and performance gates

- Tight non-ground roof-region luminance: Schoolhouse 0.213777; painted Tavern neighbor 0.212683; delta 0.51% (limit 5%)
- Production-preview p95 ratio: desktop 0.9043; mobile 0.9655 (limit 1.15)
- Schoolhouse browser gate: 8/8 desktop + mobile on dev and 8/8 on production preview
- Unmodified General Store + Tavern browser gates: 14/14 desktop + mobile
- TypeScript and production build: green

The painted facade remains the default/LITE/load-failure path. The Schoolhouse pilot changes no layout, simulation, collision, interaction, or grounding behavior.
