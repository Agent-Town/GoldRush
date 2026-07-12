# Review — town3d-06b-dynamo-hall (drain)

**Slice:** town3d-06b-dynamo-hall (7th town building in the 3D round)
**Branch/tip:** `lane/m4` `954ad280` (`runner(lane-b): town3d-06b-dynamo-hall.md`), parent `996c21ed` (stale 3-building base — claim-office era)
**Merged to main:** s446 fire, **sibling-union graft** via Edit (no `git merge`; base ≠ main)
**Verdict:** PASS — merged.

## What it does
Adds the Dynamo Hall as the **7th 3D building**. Unlike the plaza buildings (which share `installTownBuildingPilot`), the Dynamo Hall uses a **bespoke `installTownDynamoHallPilot(host, group, footprint)`** — it anchors to the megaproject `dynamoHallGroup` at the manifest's `siteFootprint`, mounts only when the Dynamo Hall megaproject is complete (`dynamoReady`), hides the facade group on load, and restores it on dispose. `TownScene.ts` wires it into the `all` mount array + the per-pilot dispatch (`dynamo_hall`), and adds a `disposed` flag + `if (this.disposed) return;` guard so an exit mid-lazy-load stays torn down.

## Classification — sibling-union GRAFT (base ≠ main)
The lane ran off `996c21ed` (claim-office era — only tavern/general-store/claim-office in the registry), while current main carries **6** buildings (…+ chapel/schoolhouse/stamp-mill). A wholesale file-copy would have **regressed** chapel/schoolhouse/stamp-mill, so I grafted only dynamo-hall's additive delta (`954ad280~1..954ad280`) onto current main via Edit:
- **`TownTavernPilot.ts`:** new `DYNAMO_HALL_MODEL_URL` const + new `installTownDynamoHallPilot` export (appended after the shared helper). No change to existing exports.
- **`TownScene.ts`:** new `disposed` field; `this.disposed = true` at top of `dispose()`; in the pilot import block — added `installTownDynamoHallPilot` to the destructure, the `if (this.disposed) return;` guard, the `dynamoReady`/`dynamoDispose` closure, `dynamoDispose()` appended to the `all` array (after the stamp-mill spread), and a `pilot === 'dynamo_hall' ? dynamoDispose() :` arm before the tavern fallback. All 6 prior buildings preserved; no conflict markers.
- **All-new (auto):** `assets/pilots/dynamo-hall-3d/*` (blend/glb + build/render/verify py), `artifacts/town3d-dynamo-hall/*` (incl. `model-review/`), `e2e/town-dynamo-hall-blender.spec.ts`.
Referenced fields (`dynamoHall`, `dynamoHallGroup`, `megaprojectComplete`) all pre-exist on current main (verified).

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean (graft compiles) |
| `npm run build` | green, 681ms |
| own spec `town-dynamo-hall-blender` | **12/12** desktop+mobile (incl. `exiting during lazy pilot load stays disposed` → validates the `disposed` guard; `owner eye … every registered 3D building` → validates the `all`-array graft) |
| 6 sibling specs (tavern/general-store/claim-office/chapel/schoolhouse/stamp-mill) + boot probe | **48 passed**; 2 mobile frame-time reds under the 7-spec×2-worker load were **gate-battery contention false-reds** — re-ran chapel+claim-office mobile single-worker isolated → **8/8 green** (fingerprint-matched to the documented contention pattern, not a graft regression) |
| boot probe `_s106-prospector-boot-probe` | green (in the 48), zero console/page errors plain boot |
| renderer p95 ratio | **0.989** desktop / **0.968** mobile (both < 1.0 — improves; bar 15%) |

## Findings
- **F-1 (non-blocking, resolved in-drain):** stale-base graft required (base `996c21ed` = 3-building era vs main's 6). Handled by additive-delta Edit rather than file-copy; all prior buildings verified preserved (48-spec battery). This is the §4-appendix rule #2 sibling-union case, done by hand because base ≠ main and a runner is not available to merge.
- **F-2 (non-blocking, known):** the 2 mobile frame-time reds are the documented gate-battery contention false-red (memory: heavy multi-spec×multi-worker loads blow p95 budgets); isolated re-run green.

Merged; lane/m4 content now on main. The town now renders **7 buildings** in the round.
