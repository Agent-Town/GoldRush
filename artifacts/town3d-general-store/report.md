# General Store 3D calibration report

## Asset contract

- Blender 5.1.2 source: `assets/pilots/general-store-3d/general-store.blend`
- GLB: one mesh, one primitive, 2,428 triangles, one embedded image/material
- Bounds: 4.70 × 4.44 × 3.26; base Y 0; center X/Z 0.01/0.00
- Material: metallic 0, roughness 0.9, no emissive texture
- Cameras/lights/animations: 0/0/0
- Saved-source re-export: byte-identical SHA-256 and parsed contract

## Visual and performance gates

- Fixed-region luminance: store 0.233220; painted Tavern neighbor 0.241154; delta 3.29% (limit 5%)
- Production-preview p95 ratio: desktop 1.0105; mobile 1.0556 (limit 1.15)
- General Store browser gate: 8/8 desktop + mobile
- Unmodified Tavern browser gate: 6/6 desktop + mobile
- Combined production-preview gate: 14/14
- TypeScript and production build: green

## Adjacent suites

The remaining Town suites passed 52/56. The four failures reproduce identically on detached clean `main`:

- `town-t4-growth`: `ledger-page:the_claim` wins the expected General Store growth-beat ordering on desktop and mobile.
- `town-t6-surfaces`: Claim Ledger is now an additional menu item beyond the older three-item expectation on desktop and mobile.

These files and behaviors are outside this slice and were not changed.

The Tavern GLB and `e2e/town-tavern-blender.spec.ts` remain unmodified. Two independent `codex review` attempts timed out without output; the final diff was manually audited and `git diff --check` is clean.
