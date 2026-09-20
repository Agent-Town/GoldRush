---
source: codex
project: Gold Rush
date: 2026-07-14
type: reference
---

# Armored railcar 3D integration report

The wave-160 armored railcar now mounts the existing `railcar.glb` as one three-mesh model. It follows the live patrol transform and terrain rail height while the painted component billboards remain the LITE-tier and load-failure fallback.
The boss HP bar is anchored to the model's authored height at scale `1`, rather than the obsolete billboard component scale.

## Damage contract

| Component | HP threshold | Morph | Presentation cue |
| --- | ---: | --- | --- |
| Wheels | `<= 50%` | `Damage_BentWheels` | bright rust undercarriage |
| Boiler | `<= 50%` | `Damage_VentingBoiler` | teal boiler |
| Cabin | `<= 50%` | `Damage_CrackedCabin` | ochre cabin |

Once damaged, a component stays at morph influence `1` through its death while sibling components live. The full model is removed and disposed after the last component dies or the pool is cleared.

## Asset contract

- One GLB root, three meshes: `Railcar_Wheels`, `Railcar_Boiler`, and `Railcar_Cabin`.
- One named morph per mesh and 10,948 total triangles.
- One source material in the asset; runtime clones one material per component so damage cues remain independent.
- Lazy GLTF loader: LITE never requests the GLB, and invalid bytes keep the billboard presentation.

## Renderer disposal evidence

| Project | Mounted geometries/textures | After pure despawn | Correlated delta | After combat death |
| --- | --- | --- | --- | --- |
| desktop-chrome | 74 / 35 | 71 / 31 | -3 / -4 | 71 / 32 |
| mobile-chrome | 66 / 36 | 63 / 32 | -3 / -4 | 63 / 33 |

The pure despawn measurement releases all three GLB geometries and at least the model texture allocation. The extra texture movement is from unrelated lazy runtime resources, so the assertion uses the correlated mounted-to-despawn delta rather than an absolute startup baseline. Full JSON snapshots are beside this report.

## Verification

- `npx tsc --noEmit`: pass.
- `e2e/wire-railcar-3d.spec.ts`, desktop and mobile: 8/8 pass; no page or console errors. This includes effective stored LITE tier and component death during delayed model loading.
- Existing railcar-read suite, desktop and mobile: 4/4 pass.
- Existing E2 component-boss test, desktop and mobile: 2/2 pass.
- Existing combined regression also exposed two out-of-scope baseline failures: the 057 blast-arm audio assertion observes zero starts, and the E2 wave-pulse assertion still expects the retired `1.35x` wrecker damage rather than the current `2.5x` value. No existing specs were changed.

Screenshots include intact, each component-damage state, and post-kill baseline for desktop and mobile.

## 2026-09-05: renderer counts re-recorded under the shared atlas

The "Renderer disposal evidence" table above is the 2026-07-14 recording. `src/assets/SharedAtlasPlugin.ts` (merged `3a47f1800`) shares one texture per image content hash across GLBs on the shared loader, which lowered this spec's exact `renderer.info.memory.textures` pins by design. Re-measured on `cf91fe5e9`:

| Project | Phase | Old textures | New textures |
| --- | --- | ---: | ---: |
| desktop-chrome | baseline | 39 | 37 |
| desktop-chrome | mounted | 42 | 39 |
| desktop-chrome | despawned | 38 | 35 |
| desktop-chrome | combatDeath | 38 | 35 |
| mobile-chrome | baseline | 37 | 35 |
| mobile-chrome | mounted | 41 | 39 |
| mobile-chrome | despawned | 37 | 35 |
| mobile-chrome | combatDeath | 37 | 35 |

One delta moved: desktop `baseline->mounted` fell 3 to 2, because one railcar GLB texture now shares an image already resident at baseline, so mounting the model allocates two textures instead of three. `mounted->despawned` and `mounted->combatDeath` stay at -4, so the disposal contract this report documents is unchanged, and every mobile delta is unchanged. No geometry count, tolerance band or spec assertion was touched. Full table, method and findings: `artifacts/wire-crawler-3d/report.md`.
