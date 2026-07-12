# Review — town3d-06-stamp-mill (drain)

**Slice:** town3d-06-stamp-mill (6th town building in the 3D round)
**Branch/tip:** `lane/m3` `04a1a1b7` (`runner(lane-a): town3d-06-stamp-mill.md`), parent `824bfb95` (= main tip at refill, before s446 lock)
**Merged to main:** s446 fire, path-scoped re-land (no `git merge` — lane-b runner live, hijack-guard)
**Verdict:** PASS — merged.

## What it does
Adds the Stamp Mill as the **6th 3D building** in the town round via the established building-pilot pattern: `installTownStampMillPilot` in `TownTavernPilot.ts` (new `STAMP_MILL_MODEL_URL` → `assets/pilots/stamp-mill-3d/stamp-mill.glb`, routed through the shared `installTownBuildingPilot`), and `TownScene.ts` wiring it into the `all` mount array + the per-pilot dispatch chain + the `id` type-union. Unlike the plaza buildings, the Stamp Mill mounts its GLB **only when the megaproject is complete** (`stampMillComplete = megaprojectComplete(this.stampMill.manifest, this.stampMill.project)`); pre-complete it stays a facade and never fetches the GLB. Anchors on `TownStampMillSite` (not a `TownFacadeAssembly:` shell), footprint `6.2 × 1.65`. New blender source + build/verify scripts + reexport evidence + e2e `town-stamp-mill-blender.spec.ts`.

## Classification
Lane branched off `824bfb95` — the **current main tip minus the s446 lock** (which touched STATUS.md only). Therefore lane base == main for every touched file; no sibling-union graft required, the additive stamp-mill hunks apply clean.
- **All-new (auto):** `assets/pilots/stamp-mill-3d/*` (blend/blend1/glb + build/verify py), `artifacts/town3d-stamp-mill/*`, `e2e/town-stamp-mill-blender.spec.ts`.
- **MODIFIED (additive, base==main):** `src/town/TownScene.ts` (+9/−3), `src/town/TownTavernPilot.ts` (+11/−3). Verified the landed diff on main matches the lane commit diff exactly (14 ins / 6 del). No conflict markers; fresh-boot-textures regions untouched; STATUS.md NOT touched by this slice.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 555ms |
| own spec `town-stamp-mill-blender` | **10/10** desktop+mobile |
| sibling specs tavern/general-store/claim-office/chapel/schoolhouse | **38/38** desktop+mobile (robust presence checks survive the 6th building — F-1 treadmill stays closed) |
| boot probe `_s106-prospector-boot-probe` | **2/2** zero console/page errors, plain boot |
| renderer p95 delta | **0%** desktop, **0%** mobile (bar 15%); textures 41→41 desktop / 36→41 mobile, calls −9 / +13 — under budget |

## Findings
- **F-1 (non-blocking, already closed):** the sibling-union "owner-eye" tests assert *presence* of each named building (`.some(...)`) with a `>=` floor, not an exact GLB count — so landing the 6th building does not break the 5 shipped specs (verified: 38/38). No treadmill cost. The deferred 7th (dynamo-hall, lane-b) will likewise not break them.

Merged; lane/m3 content now on main.
