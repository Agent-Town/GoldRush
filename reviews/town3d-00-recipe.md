# Review — town3d-00-recipe (TOWN-3D slice 0)

- **Slice/branch/tip:** town3d-00-recipe · lane-b = `lane/m4` · tip `a704454f` (`runner(lane-b): town3d-00-recipe.md`, 2026-07-12 11:55:10 +0700)
- **Drained by:** s415 fire, 2026-07-12T12:16Z, as a RE-LAND (stale-base lane; only the tip was undrained)
- **Verdict:** ✅ MERGE — high-quality, complete, re-export gate byte-identical.

## What it does
Writes `specs/town-3d/RECIPE.md` (92 lines, imperative voice) — the step-by-step playbook the whole TOWN-3D ladder executes: lock the inputs from the processed painting + `townLayout` footprint, block the complete volume (all four sides/roof/eaves — no paper-theater front plane), spend ≤15,000 tris where the gameplay silhouette reads, author one 1024² painted atlas + UVs from the painting, tonal-match to painted neighbors (≤5% luminance delta, no emission), export+inspect the GLB (one mesh/material, metallic 0 / roughness 0.9), clone the per-building browser gate from `e2e/town-tavern-blender.spec.ts`, and reject the eight named failure modes (paper theater, style drift, darkness, melted plastic, stretched paint, micro-geometry, layout drift, runtime coupling). Ships `artifacts/town3d-recipe/` with the re-export toolchain (`inspect_and_export.py`), `blend-inspection.json`, `reexport-evidence.md`, and the re-exported `tavern-2-fullwrap-reexport.glb`.

## Evidence
| Gate | Result |
|------|--------|
| Task self-QA (re-export) | **PASS** — headless Blender 5.1.2 re-export of `tavern-2-fullwrap.blend` is **byte-identical** to the owner-approved GLB: SHA-256 `fa3e057e5cd8e87b5da3f0fc32f06a0ab6cd9d81f76e7e8601a2c1bdb9087722` (checked == re-export), size `904,908` == `904,908`, `cmp` exit 0 |
| Parsed asset contract | one mesh, 10,864 tris (≤15k), one material, one `UVMap`, bounds `5.128 × 3.393 × 3.960`, base-center origin, 0 modifiers/cameras/lights; metallic 0 / roughness 0.9 / no emissive |
| tsc (`npx tsc --noEmit`) | **CLEAN** (merged tree) |
| build (`npm run build`) | **GREEN**, 660ms |
| Firewall (TOUCH-ONLY) | ✅ additive only — `specs/town-3d/RECIPE.md` + `artifacts/town3d-recipe/*`; **zero src/, zero e2e, zero models** touched (`git diff d3ef3d6f a704454f --name-only` = 5 files, all in scope) |
| cp integrity | GLB + RECIPE `cmp`-identical to lane source after re-land |

No player-visible change → **no GAZETTE item** (GZ-01 filter: internal recipe doc, not a rendered/played change).

## Merge classification
RE-LAND (Mistake #15). Lane `lane/m4` sits on a stale base — `main..a704454f` shows 8 lane commits, but 7 are prior siblings whose content already landed via the attended E2/town wave. Only the tip (`d3ef3d6f..a704454f`) is new, and it is **pure-additive** (5 new files, none pre-existing on main) → landed by plain `cp` (no shared-file 3-way graft needed). `git apply`/`cherry-pick` not used (fire-denied regardless; unnecessary for additive files).

## Findings
- **F-1 (non-blocking, informational):** the branch `lane/m4` remains falsely "ahead" of main after this tip-graft (its 7 predecessor commits are content-home via the wave; the tip is now home too). Verify merged-ness by file-probe (`specs/town-3d/RECIPE.md` present on main), NOT `git log main..lane/m4`. Branch archive owed to a permitted session (fires cannot branch/delete).
- No blocking findings. RECIPE.md unblocks the fire-authorable TOWN-3D building ladder (BACKLOG §TOWN-3D: slice 1 general_store next, @high calibration vs tavern).
