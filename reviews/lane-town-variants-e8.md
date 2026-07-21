---
title: Town E8 Orbital wardrobe lane report
date: 2026-07-21
lane: lane-a
status: READY-FOR-GATES
---

# Town E8 Orbital wardrobe

The E8 gap was exactly the eight Town building GLBs below: each had an E5 variant and no E8 variant. Each E8 model keeps its E5 shell and footprint while replacing the wardrobe with the silver/teal, brass/glass Orbital vocabulary from `assets/raw/plate-e8-bld-set.png`. Existing E8 plaza props and E5 fallback base props were left alone.

| Building | Orbital role | Derived from | E8 triangles | Atlas | Deterministic re-export |
|---|---|---|---:|---:|---|
| Tavern | Orbital Canteen | `assets/pilots/tavern-3d/tavern.e5.glb` | 12,916 | 1024² | byte-identical |
| General Store | Dome Habitat | `assets/pilots/general-store-3d/general-store.e5.glb` | 4,436 | 1024² | byte-identical |
| Claim Office | Airlock Gate | `assets/pilots/claim-office-3d/claim-office.e5.glb` | 3,716 | 1024² | byte-identical |
| Assay Office | Regolith Works | `assets/pilots/assay-office-3d/assay-office.e5.glb` | 5,380 | 1024² | byte-identical |
| Chapel | Launch Pad | `assets/pilots/chapel-3d/chapel.e5.glb` | 4,564 | 1024² | byte-identical |
| Schoolhouse | Mission Archive | `assets/pilots/schoolhouse-3d/schoolhouse.e5.glb` | 7,404 | 1024² | byte-identical |
| Stamp Mill | Mass Driver Rail | `assets/pilots/stamp-mill-3d/stamp-mill.e5.glb` | 3,012 | 1024² | byte-identical |
| Dynamo Hall | Solar Lens Array | `assets/pilots/dynamo-hall-3d/dynamo-hall.e5.glb` | 4,696 | 1024² | byte-identical |

## Contract evidence

- Preflight: isolated `lane/m3` worktree; `npm i` completed; Blender 5.1.2 available at `/Applications/Blender.app/Contents/MacOS/Blender` (the application binary is not on `PATH`).
- Measured source standard: `tavern.e5.glb` has 11,776 triangles, one mesh, one material, and one embedded 1024² atlas; Town's live cap is 15,000 triangles and one material.
- All eight E8 GLBs have one node, mesh, primitive, material, image, and embedded 1024² atlas; no cameras, lights, or animations.
- All eight are Y-up, centered, grounded, and within the actual `TownTavernPilot` parcel limits. No runtime scaling or repair was needed.
- Each saved Blender source was reopened and re-exported to a second GLB; SHA-256 matched byte-for-byte for all eight outputs.
- Filename-only wiring was sufficient. With active Epoch 8, Town requested all eight `.e8.glb` binaries and requested no E5 building fallback binaries.

## Gates

- `npm run build` — pass.
- `npx playwright test e2e/.town-e8-probe.spec.ts --project=desktop-chrome --project=mobile-chrome --reporter=line` — 2/2 pass during lane verification; zero console or page errors; all eight upright-probe records present; E8 plaza prop dataset loaded.
- Desktop evidence: [desktop-chrome-e8-square.png](shots-town-e8/desktop-chrome-e8-square.png)
- Mobile evidence: [mobile-chrome-e8-square.png](shots-town-e8/mobile-chrome-e8-square.png)

The verification spec and Blender build recipe were temporary lane probes and are not part of the delivered surface. No source, manifest, contract, spec, ledger, or existing test file was changed.
