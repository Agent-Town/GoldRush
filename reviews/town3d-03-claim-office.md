# Review — town3d-03-claim-office

**Slice:** town3d-03-claim-office (town-3D ladder, buildings arm)
**Branch/tip:** `lane/m4` @ `996c21ed` (`runner(lane-b): town3d-03-claim-office.md`), single commit off base `55492004` (ladder-open)
**Merged as:** `f0feb51b` (`--no-ff` merge onto main `59ac17e7`)
**Drained by:** s445 fire, 2026-07-13
**Verdict:** ✅ PASS — merged, all gates green.

## What it does
Adds the **Claim Office** as the third Blender-built 3D town building (after Tavern and General Store). New `installTownClaimOfficePilot` mounts `assets/pilots/claim-office-3d/claim-office.glb` through the shared `installTownBuildingPilot` path (lazy, visual-only, facade-first with LITE + load-failure fallback). `TownScene` pilot dispatch gains a `claim_office` case and mounts it under `pilot === 'all'`. Ships the Blender source (`build_claim_office.py`, `.blend`, `render`/`verify` scripts), the re-export GLB, and the owner-eye/model-review evidence set. Player-visible: the claim office now renders as a lit 3D model in the town (non-LITE), replacing its flat facade.

## Evidence
| Gate | Result |
|------|--------|
| `tsc --noEmit` | clean |
| `npm run build` | green, 660ms |
| own spec `town-claim-office-blender` | **8/8** desktop+mobile (lazy/contract/frame-gate, LITE keeps facade, load-failure preserves facade+interaction, owner-eye mounts beside every registered 3D building + 2D cast) |
| sibling-proof `town-tavern-blender` | **6/6** desktop+mobile |
| sibling-proof `town-general-store-blender` | **6/6** desktop+mobile (owner-calibration mounts store beside Tavern + cast) |
| boot probe `_s106-prospector-boot-probe` | **2/2** zero console/page errors, plain boot, desktop+mobile |
| renderer delta (desktop, TS-04 locked cam) | calls 90→81 (−9), tris/frame 4836→7176 (+2340 GLB), textures 40→40, **p95 8.4→8.8ms (+4.76%, under 15% fail bar)** |

Gate scope per §4-appendix rule #3 (own spec + tavern/general-store sibling-proof pair + tsc/build + boot). Full town family NOT run (fire budget discipline).

## Merge classification
Base `55492004`. Single runner commit, 33 files. All claim-office `assets/`/`artifacts/`/`e2e/` files are **NEW** (no conflict). Two shared files resolved as **sibling-union** (§4-appendix rule #2):
- `src/town/TownScene.ts` — town3d-03 edits the pilot-dispatch block (~line 484); main's only divergence from base is the `fix-town-fresh-boot-textures` drain (texture-state tracking at lines 127/1119/1597/2600), **disjoint regions** → 3-way merged clean, both sides preserved (verified: `installTownClaimOfficePilot` ×3 + `textureState` ×4 present post-merge).
- `src/town/TownTavernPilot.ts` — main == base here; claim_office registry/const/type-union added cleanly.

No conflict markers; git auto-merged. No MAIN-MOVED-ONLY files clobbered.

## Findings
None blocking. F-1 (non-blocking, informational): `lane/perf` (town3d-05-assay-office + town3d-15-plaza-props) was DEFERRED this fire — it is entangled (reverts BACKLOG.md/specs, re-adds deleted task files, carries a `blocker-report.md`, behind-6 base) which is "anything OTHER than adjacent additive lines" → §4-appendix rule #2 defers it to attended. Left for the owner/attended session.
