---
task: lane-town-variants-e6
branch: lane/m3
base: ce5f0906357b
date: 2026-07-21
status: READY-FOR-GATES
---

# E6 town Atomic wardrobe — full filename-routed cast

## Verdict

READY-FOR-GATES. Eight missing E6 variants now sit beside their E5 bodies and load through the existing filename-era picker with no source or contract edits. Each is a derived wardrobe pass: the E5 silhouette remains legible while chrome, enamel teal, amber dials, domes, rails, and timer pips supply the E6 Atomic Homestead language.

## Enumeration

| Building / plaza body | E6 public identity | Derived from | E5 tris | E6 tris | Atlas |
| --- | --- | --- | ---: | ---: | --- |
| General Store | Atomic Chandlery | `general-store.e5.glb` | 3,452 | 5,848 | 1024×1024 embedded |
| Claim Office | Half-Life Registry | `claim-office.e5.glb` | 2,788 | 8,432 | 1024×1024 embedded |
| Assay Office | Starstone Assay | `assay-office.e5.glb` | 4,344 | 6,692 | 1024×1024 embedded |
| Chapel | Radiant Chapel | `chapel.e5.glb` | 3,956 | 6,460 | 1024×1024 embedded |
| Stamp Mill | Atomic Drydock Works | `stamp-mill.e5.glb` | 2,004 | 4,492 | 1024×1024 embedded |
| Dynamo Hall | Atomic Harbor Works | `dynamo-hall.e5.glb` | 3,344 | 5,740 | 1024×1024 embedded |
| Covered Wagon | Atomic Arrival Skiff | `covered_wagon.e5.glb` | 728 | 1,220 | 1024×1024 embedded |
| Water Trough | Atomic Coolant Cistern | `water_trough.e5.glb` | 504 | 1,156 | 1024×1024 embedded |

The initial filesystem difference also exposed four E5-only harbor accessories: `harbor-lantern`, `net-frame`, `tide-board`, and `rope-buoy-rack`. They are not filename-routed bodies: `assets/pilots/plaza-props-3d/era-props.e5.json` explicitly owns their E5 filenames. Adding dormant E6 siblings would not load without a forbidden contract/source edit, so they are correctly excluded from this zero-code slice.

## Asset contract evidence

- Blender 5.1.2 opened each E5 `.blend`, inherited the complete E5 vertex signature set, saved an E6 `.blend` under `/tmp`, exported, reopened that saved file, and re-exported byte-identically within the build run.
- Every delivered GLB has exactly one mesh, one primitive, one node, one material, and one embedded 1024×1024 image; no cameras, lights, animations, emissive texture, or extra scene nodes.
- All eight are Y-up, grounded at `minY = 0`, centered within runtime tolerance, and remain inside their existing town footprint. Buildings are below the measured 15,000-triangle E5 ceiling; plaza bodies are below their 4,000-triangle cap.
- Materials retain the single-atlas E5 discipline with `metallicFactor = 0`, `roughnessFactor = 0.92`, and runtime-managed highlights.

## Runtime gate

The gate persists `epoch-6-atomic`, boots the menu-safe Town route, enters Town, waits for all eight building orientation probes plus plaza props, then marks the evidence URL `?town3dPilot=all&tier=full&debug&era=6`. The direct `debug&era=6` URL is not menu-safe in the existing router: it opens a run rather than Town.

- `desktop-chrome`: pass; all eight new `.e6.glb` responses OK; no matching E5 fallback requests; all building probes Y-up; plaza props loaded; zero console/page errors.
- `mobile-chrome`: pass under the same assertions; zero console/page errors.
- Square evidence: [desktop 960×960](shots-town-e6/desktop-chrome-e6-square.png) · [mobile 1320×1320](shots-town-e6/mobile-chrome-e6-square.png)

The global `data-town3dPilotEra` ends at `5` because the already-shipped `tavern.e6.glb` is off-center and independently falls back to E5. This predates and is outside the new-file-only firewall. Request tracing confirms none of the eight assets in this slice falls back.

## Repository gates

- Preflight and final: `npx tsc --noEmit` and `npm run build` passed; preflight `npm i` passed; Blender headless available at `/Applications/Blender.app/Contents/MacOS/Blender` (5.1.2). The build retains only the existing Vite large-chunk advisory.
- Final: `npx playwright test e2e/_lane-town-e6-gate.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1` passed 2/2 before the temporary gate was removed.
- Independent `codex review --uncommitted`: no findings; it independently confirmed runtime bounds, material, triangle, and filename-routing contracts and a green production build.
- No `src/`, spec, contract, ledger, or existing test file changed.
