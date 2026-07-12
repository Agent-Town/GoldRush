# Review — town3d-02-schoolhouse

**Slice:** town3d-02-schoolhouse (town-3D ladder, buildings arm — the ladder's lead slice)
**Branch/tip:** `lane/m3` @ `c34f0df9` (`runner(lane-a): town3d-02-schoolhouse.md`), single commit off base `55492004` (ladder-open)
**Merged as:** `b2d0d1d7` (`--no-ff` merge onto main `7e5b2904`) + `<this commit>` (chapel test robustness F-1)
**Drained by:** s445 fire, 2026-07-13
**Verdict:** ✅ PASS — merged, all gates green (one sibling test made robust, below).

## What it does
Adds the **Schoolhouse** as a Blender-built 3D town building. New `installTownSchoolhousePilot` mounts `assets/pilots/schoolhouse-3d/schoolhouse.glb` through the shared `installTownBuildingPilot` path (lazy, visual-only, facade-first with LITE + load-failure fallback). `TownScene` pilot dispatch gains a `schoolhouse` case and mounts it under `pilot === 'all'`. Ships the Blender source + re-export GLB + owner-eye/model-review evidence. The town now renders **five** buildings in the round (tavern, general store, claim office, chapel, schoolhouse). This is the 3D building pilot only — separate from the schoolhouse-open gameplay/era-pointer logic (298d4fe9), which it does not touch.

## Evidence
| Gate | Result |
|------|--------|
| `tsc --noEmit` | clean |
| `npm run build` | green, 486ms |
| own spec `town-schoolhouse-blender` | **8/8** desktop+mobile (lazy/contract/frame-gate, LITE keeps facade, load-failure preserves facade+interaction, owner-view mounts beside registered buildings — robust presence checks) |
| sibling `town-tavern-blender` | pass desktop+mobile |
| sibling `town-general-store-blender` | pass desktop+mobile |
| sibling `town-chapel-blender` | pass desktop+mobile (after F-1 robustness fix) |
| sibling `town-claim-office-blender` | pass desktop+mobile |
| boot probe `_s106-prospector-boot-probe` | **2/2** zero console/page errors, plain boot, desktop+mobile |
| full battery | **38/38** (5 building specs × both projects) |
| renderer delta (desktop, TS-04 locked cam) | calls 90→80 (−10), tris/frame 4836→10264 (+5428 GLB), textures 40→42, **p95 9.1→9.5ms (+4.4%, under 15% fail bar)** |

## Merge classification
Base `55492004`. Single runner commit. All schoolhouse `assets/`/`artifacts/`/`e2e/` files **NEW** (auto-merged). Two shared files conflicted, resolved **sibling-union** (§4-appendix rule #2 — adjacent additive lines): `src/town/TownScene.ts` (import list + `all` array + dispatch chain unioned to mount all **five** buildings) and `src/town/TownTavernPilot.ts` (5th `SCHOOLHOUSE_MODEL_URL` const, `id` type-union `'tavern' | 'general_store' | 'claim_office' | 'chapel' | 'schoolhouse'`, `installTownSchoolhousePilot` export). No markers remain; fresh-boot-textures regions untouched.

## Findings
**F-1 (non-blocking, FIXED IN-DRAIN):** landing the schoolhouse (5th building under `all`) broke `town-chapel-blender.spec.ts:225`, whose owner-eye test I had set to an exact `toHaveLength(4)` when draining chapel earlier this same fire. Rather than bump the literal 4→5 (a treadmill that would re-break on every future sibling, incl. the deferred assay-office), I converted chapel's assertion to **robust presence checks** (`.some()` per named building + a `>= 4` floor, no exact count) — matching the shape schoolhouse's and claim-office's own-eye tests already use. Re-ran green (38/38). This closes the exact-count sibling-union treadmill for chapel; the remaining exact-count risk is nil among the shipped five (tavern has no eye test; general-store/claim-office/schoolhouse/chapel are all presence-based).

**F-2 (deferred, informational):** `lane/perf` (town3d-05-assay-office + town3d-15-plaza-props) remains DEFERRED — entangled (reverts BACKLOG.md/specs, re-adds deleted task files, carries `blocker-report.md`, behind-6 base) → §4-appendix rule #2 defers to attended. When attended drains it, `all` becomes six buildings; the shipped five specs are now count-robust and will not break.
