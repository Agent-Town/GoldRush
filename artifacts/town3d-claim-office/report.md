# Claim Office 3D report

## Asset contract

- Blender 5.1.2 source: `assets/pilots/claim-office-3d/claim-office.blend`
- GLB: one mesh, one primitive, 2,420 triangles, one embedded image/material
- Bounds: 4.26 × 5.02 × 3.12; base Y 0; center X/Z 0.02/0.00
- Material: metallic 0, roughness 0.9, no emissive texture
- Cameras/lights/animations: 0/0/0
- Saved-source re-export: byte-identical SHA-256 and parsed contract

## Visual and performance gates

- Fixed 30×25 roof-region luminance in one TS-04 frame: Claim Office 0.221968; painted Tavern LITE neighbor 0.212683; delta 4.366% (limit 5%)
- Browser p95 ratio: desktop 0.9802; mobile 1.0000 (limit 1.15)
- Claim Office browser gate: 8/8 desktop + mobile
- TypeScript and production build: green

No Town layout, sim, collision, coordinate, grounding, Tavern asset, or sibling-spec changes.
