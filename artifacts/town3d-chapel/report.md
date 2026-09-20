# Chapel 3D report

## Asset contract

- Blender 5.1.2 source: `assets/pilots/chapel-3d/chapel.blend`
- GLB: one mesh, one primitive, 3,424 triangles, one embedded image/material
- Bounds: 3.464 × 6.250 × 3.195; base Y 0; center X/Z 0.000/0.008
- Material: metallic 0, roughness 0.9, no emissive texture
- Cameras/lights/animations: 0/0/0
- Saved-source re-export: byte-identical SHA-256 and parsed contract

## Visual and performance gates

- Fixed TS-04 luminance: chapel 0.202099; painted Tavern neighbor 0.212683; delta 4.98% (limit 5%)
- Browser p95 ratio: desktop 1.0303; mobile 0.9903 (limit 1.15)
- Chapel, Claim Office, and plaza-props browser battery: 22/22 desktop + mobile
- TypeScript and production build: green
- Neutral visual review: ACCEPT after the chapel silhouette, pointed openings, trim, porch detail, and restrained greenery pass

The permanent LITE/load-failure facade remains intact. No Town layout, coordinate, sim, collision, grounding, sibling GLB, or sibling spec value changed.
