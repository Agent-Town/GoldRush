# Town Blender v3 — full-wrap Tavern variant B gate evidence

Branch: `sol/town-blender-v3`

Wave-1 parent: `cefcc50b974e5b7b9efc8b9aaba31a0ea5595bcf`

Scope: Tavern variant B only. The plaza/horizon commit was not started.

## Final asset contract

- `tavern-2-fullwrap.glb`: 904,908 bytes; SHA-256 `fa3e057e5cd8e87b5da3f0fc32f06a0ab6cd9d81f76e7e8601a2c1bdb9087722`.
- `tavern-2-fullwrap.blend`: 348,815 bytes; SHA-256 `c16c3617d3ad1b99430cb2ae934a25e23c4e4c43f827cd7100105d4016d3b6ee`.
- 10,864 triangles; one mesh, one primitive, one material, one embedded 1024² PNG atlas.
- Bounds: `5.128w × 3.393d × 3.960h`; origin at base-center. Slot contract: `5.2w × 3.4d`.
- Metallic `0`; roughness `0.9`; zero cameras; zero lights.
- Full parse evidence: `asset-contract-variant-b.json`.

## Style and owner-verdict correction

- Old B's half-timber language was replaced by warm ochre horizontal plank siding, a real covered walk-under porch, centered split swing doors, and a no-text pan medallion.
- Roof mass, corners, chimney, and full-wrap geometry were retained; all four faces use the painted `bld-tavern.png` material language.
- Locked TS-04 non-ground luminance: old B `54.31`, new B `61.27`, adjacent painted facade `58.34`; new B is within `+5.0%` of its neighbor.
- A fresh neutral visual review returned **NEW B passes**. It found the saloon identity unmistakable at gameplay zoom and the 2D/3D mix acceptable; the oversized, lightly grounded bartender remains the weakest part of that candidate direction.
- Evidence: `locked-camera-old-b-vs-new-b-contact-sheet.png`, `locked-camera-new-b-townsfolk-crop.png`, `tavern-2-fullwrap-turntable.png`, and `materials-note.md`.

## Manual viewer and renderer evidence

- Actual `?debug&town3d=tavern` drop-in: old B and new B both parse as one material and remain in triangle budget.
- The exact old-B comparison binary is preserved as `old-b-half-timber-comparison.glb` (902,276 bytes; SHA-256 `eb8b7b4ccf37a42a3b9952574557580b11281b186d2f641beecf0c1e8bc2290d`), so the A/B is reproducible outside this session.
- After new B drop, the existing Tavern approach prompt and Board interaction pass.
- Zero console errors and zero page errors.
- TS-04 renderer comparison:

| Capture | Calls | WebGL calls/frame | Tris/frame | p95 |
| --- | ---: | ---: | ---: | ---: |
| Facade baseline (`baseline-renderer.json`) | 90 | 89.58 | 4,835 | 9.9 ms |
| Old B | 78 | 77.67 | 26,545 | 9.8 ms |
| New B | 78 | 77.67 | 26,425 | 9.7 ms |

- New B versus old B: `0` calls, `0.00` WebGL calls/frame, `-120` tris/frame, p95 `-1.02%`.
- New B versus facade baseline: `-12` calls, `-11.91` WebGL calls/frame, `+21,590` tris/frame, p95 `-2.02%`; no p95 regression, below the `15%` alert threshold.
- Machine evidence: `locked-camera-old-b-vs-new-b.json` and `locked-camera-old-b-vs-new-b-visual-metrics.json`.

## Build and test gates

- Final `npx tsc --noEmit` — pass.
- Final `npm run build` — pass.
- Wave-1 pilot spec, dev server, desktop + mobile-390px — 6/6 pass.
- Wave-1 pilot spec, production preview, desktop + mobile-390px — 6/6 pass.
- Requested unmodified Town battery (`town-t1` through `town-t6`, `ts-01` through `ts-04`), both projects — 58/62 pass.
- All `ts-01` through `ts-04` cases are green. The four reds are the same two pre-existing assertions repeated on desktop/mobile:
  1. `town-t4-growth.spec.ts` expects `town-growth-general-store`; the parent queues `ledger-page:the_claim` first.
  2. `town-t6-surfaces.spec.ts` expects three menu actions; the parent also renders `Claim Ledger`.
- A detached parent-baseline run at `36995e6d` reproduced those same four failures. They were not changed inside this visual-only territory.

## Scope proof

- Variant-B work adds only Tavern `.blend`/GLB/renders, Tavern evidence, and this findings record.
- No Town source, loader, gameplay coordinates, footprint/approach data, sim/run scene, menu, scoreboard, story, beats, or `assets/pilots/hero-3d/*` file changed.
- This is the ordered drag/drop asset-verdict capture, not a production asset flip: wave 1's `TownTavernPilot` remains byte-unchanged and still owns its separate flag-gated seam. An owner-approved production swap is a later attended action.
- Variant A remains available as the existing facade fallback. No plaza/horizon work began; that remains behind the owner's attended gate.
