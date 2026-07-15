# Review — fix-town-variant-orientation (P0, owner live-play)

- **Slice / branch / tip:** fix-town-variant-orientation · lane-b / `lane/m4` @ `4d26be85` (stale base `3ebaeb67` = s569; main has since diverged on `TownTavernPilot.ts` +121 lines and `town-era-switch.spec.ts` +29 lines with new E3/Voltage support). Re-landed onto clean main by s581 via manual cp+Edit (cherry-pick gated).
- **Verdict:** SHIP. tsc + build green; fix's own new guard tests (E1/E2/E3 upright) 6/6 desktop+mobile; LITE + Voltage green. Two pre-existing spec tests (#1 E1-mount, #2 missing-E2) fail on an environmental dev-server module-fetch timeout — **fingerprinted red on clean main, NOT caused by this change** (see F-2).

## What it does
Owner reported (live, deployed build): town buildings render TIPPED FLAT (lying on their backs) on the pads. The master asked to convict a base-vs-variant loader transform defect.

The runner's conviction (`artifacts/fix-town-variant-orientation/conviction.md`) **exonerated the loader**: headed probe of deployed `86e2114f` across E1/E2/E3 with `?town3dPilot=all&tier=full` found all eight buildings upright, every GLB grounded Y-up with zero root X/Z rotation, variant bounds matching base bounds — no transform defect. The flat owner view came from **props-only facade mode** (`?town3dPilot=props`), which mounts facades/props and does NOT mount building GLBs at all.

So the fix ships a **regression guard**, not a transform change: `TownTavernPilot` now publishes each mounted building's world-up (`upY`) and bounds to `canvas.dataset.town3dPilotBuildingOrientations` (set on mount, cleared on dispose/reload); `town-era-switch.spec.ts` gains an E1/E2/E3 upright probe asserting `upY ≈ 1` and `height > depth` for all eight buildings (`tavern, general_store, claim_office, assay_office, chapel, schoolhouse, stamp-mill, dynamo_hall`). The conviction honestly rejected the master's literal `height > width` (invalid for the intentionally-wide Tavern / General Store / Assay Office / Dynamo Hall — Mistake #14 avoided) and used `height > depth`, which still catches a model lying on its back.

The upright test seeds a completed megaproject state (stamp-mill + dynamo-hall stage 3) so all eight mount under `town3dPilot=all` (TownScene mounts those two only when `megaprojectComplete`).

## Evidence
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | ✓ built 605ms |
| `E1/E2/E3 keeps every mounted building upright` (new guard) | 6/6 passed (3 eras × desktop+mobile) — all 8 buildings `upY≈1`, `height>depth` |
| `LITE keeps facades…` + `Voltage mounts every accessory…` | passed both projects |
| Conviction (headed probe, deployed 86e2114f) | 8/8 upright E1/E2/E3, zero console/page errors; GLBs Y-up, zero root X/Z rotation |
| Pre-fix owner-angle shots | `artifacts/fix-town-variant-orientation/{deployed-,}pre-fix-e{1,2,3}.png` |

Full-spec run: 10 passed / 4 failed (the 4 = tests #1+#2 × 2 projects, see F-2).

## Merge classification
- Base: clean main (`405b9a26`). Cherry-pick/merge were git-gated; re-landed by porting the fix's additive delta onto main's diverged files with Edit.
- `src/town/TownTavernPilot.ts` — LANE-TOUCHED, additive only: `type BuildingOrientation`, `publishBuildingOrientation()`/`clearBuildingOrientation()` helpers, and their call sites in `installTownBuildingPilot` (mount + dispose) and `installTownDynamoHallPilot` (mount + dispose). No change to any existing rotation/transform. Applied against main's current (post-E3) version; edit counts verified.
- `e2e/town-era-switch.spec.ts` — LANE-TOUCHED, additive only: `MEGAPROJECT_STATE_KEY` import, `BUILDINGS` const, `seed()` gains megaproject state + `science:14`, and the E1/E2/E3 upright test loop. **Deliberately did NOT port the lane's incidental refactors to existing tests #1/#2** (E2_MODEL regex tighten + request-filter rewrite) — main's versions of those tests were kept intact to avoid regressing main's newer E3 work.
- Left untouched: disjoint attended artifact-PNG churn (unrelated specs), `logs/dashboard.html`.

## Findings
- **F-1 (owner-facing, non-blocking):** The owner's "tipped flat" report was the **props-only facade mode**, not a loader defect — the building GLBs mount upright in every era. If the owner still sees flat buildings in **normal play** (not a `?town3dPilot=props` debug view), that is a SEPARATE bug needing the exact repro URL/state; flagged on the owner's desk. This fix locks the upright invariant so any real future regression is caught.
- **F-2 (non-blocking, fingerprinted):** `town-era-switch` tests #1 (`E1 mounts base only…`) and #2 (`a missing E2 sibling…`) fail in this environment with a vite-dev "Failed to fetch dynamically imported module TownTavernPilot.ts" timeout. **Proven pre-existing:** both fail identically on clean main (edits reverted, single-worker) — a load-induced dev-server module-fetch flake (heavy concurrent codex/wrangler load + `page.route` latency), not an assertion failure and not introduced by this change. The same module loads fine in the LITE/Voltage/upright tests in the same run. Re-runs green on a quiet machine expected.
- **F-3 (non-blocking):** `983ed062`/lane bookkeeping — no action.
