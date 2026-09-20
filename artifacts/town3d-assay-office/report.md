# Assay Office 3D report

## Asset contract

- Blender 5.1.2 source: `assets/pilots/assay-office-3d/assay-office.blend`
- GLB: one mesh, one primitive, 3,340 triangles, one embedded image/material
- Bounds: 4.424 × 4.2 × 3.32; base Y 0; center X/Z 0.028/0.02
- Material: metallic 0, roughness 0.9, no emissive texture or runtime emissive lift
- Cameras/lights/animations: 0/0/0
- Saved-source re-export: byte-identical SHA-256 and parsed contract

## Visual and performance gates

- Fixed-region luminance: Assay Office 0.174732; painted Tavern neighbor 0.175693; delta 0.547% (limit 5%)
- Same-run p95 ratio: desktop 0.9891; mobile 0.9775 (limit 1.15)
- Assay Office browser gate: 10/10 dev and 10/10 production preview across desktop + mobile
- Combined Assay Office + unmodified General Store + unmodified Tavern battery: 24/24 dev and 24/24 production preview
- TypeScript and production build: green

## Adjacent finding

- The same-page facade-to-pilot recycle screenshots reproduce main's queued fresh-boot texture-loss issue; the clean fresh-boot `all` owner sheet is unaffected. This slice does not touch texture ownership.

## Independent visual review

- First pass rejected near-black value compression, an unfinished rear false-front, and detached rear trim.
- Refined asset adds a teal roof/brass hierarchy, rear pediment medallions, attached rear landing/awning/braces, and removes detached back-step clutter.
- Fresh independent recheck found no high-confidence visual blocker. Code review findings were closed by removing runtime emission, tightening saved-source atlas/UV/modifier checks, proving delayed-load disposal, verifying actual `all` mounting, and running the production-preview battery.
