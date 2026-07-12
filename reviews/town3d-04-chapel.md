# Review — town3d-04-chapel

**Slice:** town3d-04-chapel (town-3D ladder, buildings arm)
**Branch/tip:** `lane/e2-arsenal` @ `4c7e92cb` (`runner(lane-c): town3d-04-chapel.md`), single commit off base `55492004` (ladder-open)
**Merged as:** `ce0be549` (`--no-ff` merge onto main `6924bcfe`) + `<this commit>` (in-drain test-count fix F-1)
**Drained by:** s445 fire, 2026-07-13
**Verdict:** ✅ PASS — merged, all gates green (one in-drain test fix, below).

## What it does
Adds the **Chapel** as the fourth Blender-built 3D town building (after Tavern, General Store, Claim Office). New `installTownChapelPilot` mounts `assets/pilots/chapel-3d/chapel.glb` through the shared `installTownBuildingPilot` path (lazy, visual-only, facade-first with LITE + load-failure fallback). `TownScene` pilot dispatch gains a `chapel` case and mounts it under `pilot === 'all'`. Ships the Blender source (`build_chapel.py`, `.blend`, `render`/`verify` scripts), the re-export GLB, and the owner-eye/model-review evidence set. Player-visible: the chapel now renders as a lit 3D model in town, replacing its flat facade.

## Evidence
| Gate | Result |
|------|--------|
| `tsc --noEmit` | clean |
| `npm run build` | green, 513ms |
| own spec `town-chapel-blender` | **8/8** desktop+mobile (lazy/contract/frame-gate, LITE keeps facade, load-failure preserves facade+interaction, owner-eye mounts all 4 registered 3D buildings + 2D cast) |
| sibling `town-tavern-blender` | pass desktop+mobile |
| sibling `town-general-store-blender` | pass desktop+mobile |
| sibling `town-claim-office-blender` | pass desktop+mobile (just-landed sibling f0feb51b unbroken by the union) |
| boot probe `_s106-prospector-boot-probe` | **2/2** zero console/page errors, plain boot, desktop+mobile |
| renderer delta (desktop, TS-04 locked cam) | calls 90→81 (−9), tris/frame 4836→8180 (+3344 GLB), textures 40→40, **p95 8.5→8.5ms (0%)** |

Gate scope per §4-appendix rule #3 + the just-landed claim-office sibling added to the battery (cheap, proves the 4-way union).

## Merge classification
Base `55492004`. Single runner commit. All chapel `assets/`/`artifacts/`/`e2e/` files **NEW** (auto-merged, no conflict). Two shared files conflicted and resolved as **sibling-union** (§4-appendix rule #2 — adjacent additive lines):
- `src/town/TownScene.ts` — chapel and the just-landed claim_office both edit the pilot-dispatch block (import list, `all` array, dispatch ternary chain). Unioned to mount **all four** (tavern, general_store, claim_office, chapel) and dispatch each by name; fresh-boot-textures regions untouched.
- `src/town/TownTavernPilot.ts` — unioned both `CLAIM_OFFICE_MODEL_URL` + `CHAPEL_MODEL_URL` consts, the `id` type-union (`'tavern' | 'general_store' | 'claim_office' | 'chapel'`), and both `installTown{ClaimOffice,Chapel}Pilot` exports.

No conflict markers remain (verified). No MAIN-MOVED-ONLY files clobbered.

## Findings
**F-1 (non-blocking, FIXED IN-DRAIN):** chapel's own owner-eye test (`town-chapel-blender.spec.ts:225`) hardcoded `>= 3` / `toHaveLength(3)` GLB requests — authored on base `55492004` before claim_office existed. With claim_office landed first this same fire, `pilot=all` now mounts **4** buildings, so the literal was stale (actual 4 ≠ expected 3). Fixed to `>= 4` / `toHaveLength(4)` and added a `claim-office` request assertion — the more-correct fix (asserts the full registered set), not a loosening. Re-ran green 8/8. This is the sibling-union test-count interaction the appendix anticipates; the union behavior (4 buildings mount) is correct and desired.

**F-2 (deferred, informational):** `lane/perf` (town3d-05-assay-office + town3d-15-plaza-props) remains DEFERRED — entangled (reverts BACKLOG.md/specs, re-adds deleted task files, carries `blocker-report.md`, behind-6) → §4-appendix rule #2 defers to attended.
