# run3d-16 — RUN-3D rider 16: rail elements in 3D

**FIRE-AUTHORED s1389 (attended review welcome).** Role: Codex runner, lane-c. Workdir: `worktrees/lane-c` (branch `lane/e2-arsenal`).

## PRE-FLIGHT (run this exact sequence; STOP on any mismatch and report)

1. `git -C worktrees/lane-c rev-parse --abbrev-ref HEAD` → must print `lane/e2-arsenal`. If not, **STOP**.
2. `git -C worktrees/lane-c log main..HEAD --oneline` → must print **nothing** (branch is clean vs main). If it prints anything, **STOP and report** — do not reset, the lane may hold undrained work (Mistake #2).
3. `git -C worktrees/lane-c status --short` → expect clean. If tracked source files are dirty, **STOP and report**.
4. `git -C worktrees/lane-c merge-base --is-ancestor 9ee3b710c09f5bb6575d2fe754af47e111c0ac80 HEAD` → must exit **0**. This slice depends on the `Buildable3dId`→`Run3dId` rename and the `gold_seam` non-buildable rider pattern, both of which landed in that merge. **If it exits non-zero, the lane predates the rename — refresh the lane from main first, then re-run this check.**
5. Confirm `src/game/Run3dPilot.ts` contains `type Run3dId = keyof typeof registry;`. If it says `Buildable3dId`, the premise is stale — **STOP and report**.

## WHY (evidence, quoted, all re-verified at source on main at `9ee3b710` by s1389)

`specs/town-3d/RUN-RECIPE.md:20` authorises this rider verbatim, under the owner order of 2026-07-13 ("all other 3D objects that we have in game"):

> Later riders (**fire-authorable once 07 lands**): **rail elements**, gold nodes, megaproject site stages.

The 07 gate is met and the whole 07–14 arm is on main. `run3d-15` (gold nodes) merged at `9ee3b710`, which is what unblocked this slice — it established the **non-buildable rider pattern** (a rider that is not a `BuildSystem` buildable reads its own diagnostics surface and is excluded from the `all` selection). This slice is the second use of that pattern; follow it exactly.

**Everything below was read out of the files on main, not inferred. Coordinates drift — cite the code, and if a line number is off by a few, trust the symbol.**

- **R3 read-only source already exists.** `src/world/RailPath.ts:86` `diagnostics(): RailPathDiagnostics`, surfaced by `src/game/Game.ts:4250` `railDiagnostics()` and published at `src/game/Game.ts:4500` as `rails:` inside `window.__THREE_GAME_DIAGNOSTICS__`. **No new accessor, and absolutely no write path.**
- **The tie transforms you need already exist and already carry a correct yaw.** `src/world/RailPath.ts:139` computes `const yaw = Math.atan2(dirX, dirZ)` per segment and pushes one `Tie {x, y, z, yaw}` per `TIE_SPACING`. **This is the one thing that makes this slice tractable — do not derive orientation yourself.**
- **Footprint constants are literal** (`src/world/RailPath.ts:33-42`): `RAIL_GAUGE 0.78` · `RAIL_WIDTH 0.08` · `RAIL_HEIGHT 0.09` · `RAIL_Y 0.08` · `TIE_WIDTH 1.32` · `TIE_HEIGHT 0.07` · `TIE_DEPTH 0.22` · `TIE_Y 0.035` · `TIE_SPACING 0.9` · `SEGMENT_MAX 0.9`.
- **The bake art exists and is contracted.** `assets/processed/ter-rail-elements-r0c0.png` is the **straight** element, bound as `terrain.rail.straight` at `assets/layer-contracts/e2-steamworks.v1.json:8`.
- **Render slot is fixed**: `RenderLayers.groundDecals`, asserted three ways in `src/world/RailPath.ts` (`:76-77` diagnostics, `:177` `RailPath.Rails`, `:207` `RailPath.Sleepers`).
- **Player footprint**: 14 of 38 contracts carry `rails` (`src/meta/ContractFamilies.ts:637` and `:776`) — all four E2, all four E8, all four E10, plus `e3-canyon-works` and `e9-dome-basin`. The E2 half is directly in-lane for `lane/e2-arsenal`.

### Four design points this master SETTLES. Do not re-open them, do not widen them.

1. **R2 for rails means the PROCEDURAL layer, not a sprite.** Rails have no billboard/sprite. The existing procedural instanced boxes (`createRailMesh` / `createTieMesh`) **are** the flag-off default, the LITE-tier render and the load-failure fallback. Your 3D layer is **additive over them** — you may hide the procedural tie mesh *only* while the pilot is `'ready'`, and it must come back on dispose.
2. **Composition is ONE GLB INSTANCE PER TIE, oriented by that tie's own `yaw`.** Not per-segment, not one stretched mesh, not per-sample. This is why the tie record is the source and `samples` is not: `samples` is a flat concatenation across multiple paths with **no path-boundary marker**, so deriving direction from consecutive samples produces a wrong yaw at every path seam. **Do not use `samples` for placement.**
3. **Use `THREE.InstancedMesh`, not N clones.** A path is routinely 100+ ties, so the gold-seam clone-per-instance approach does not transfer. The procedural layer it sits beside holds itself to `drawCalls: (rails?1:0)+(ties?1:0)` — match that discipline: **one draw call for the rail-element layer.** R5 explicitly permits InstancedMesh.
4. **Only the STRAIGHT element (`r0c0`) is in scope.** The other six cells in that sheet (`curve`, `buffer_stop`, `ore_cart_empty`, `ore_cart_full`, `trestle`, `semaphore`) are **NOT** this slice. Ore carts in particular imply motion and are a design fork for an attended session, not a fire.

## SCOPE (numbered, each item testable)

1. **Expose the tie transforms read-only.** Add `ties: Array<{ x: number; y: number; z: number; yaw: number }>` to `RailPathDiagnostics` (`src/world/RailPath.ts:7`), populate it in `resampleTerrain()` from the `ties` array it already builds, deep-copy it in `diagnostics()` exactly as `samples` is copied at `:89`, and add the empty case to `emptyRailPathDiagnostics()` at `:98`. **Purely additive: do not remove, rename or re-order `samples` or any existing field** — `samples` has other consumers.
2. **Bake the GLB.** `assets/pilots/run3d/rail-element.glb`, baked FROM `assets/processed/ter-rail-elements-r0c0.png` per the bake-from-the-illustration law. **Base-center origin.** Footprint matched to the tie it replaces: width `TIE_WIDTH 1.32` across, depth `TIE_DEPTH 0.22` along the path, with the two rails at `RAIL_GAUGE 0.78` separation, `RAIL_WIDTH 0.08`, `RAIL_HEIGHT 0.09` above the tie. ⚠️ **Budget is far tighter than R7's 4,000 because this is instanced 100+ times: target ≤400 tris, hard cap 800.** One ≤512² embedded material. Keep the build script + a `verify_*.py` and the re-export byte-identity check, following `artifacts/run3d-gold-seam/` as the model.
3. **Register the rider** in `src/game/Run3dPilot.ts`'s `registry` as `rail_element`, with `groundPad: 0`. ⛔ **It MUST be excluded from the `all` selection, exactly like `gold_seam`** — extend the existing filter to exclude both ids. A plain boot's behaviour must not change by one byte. **This is not a style preference: rider 15 shipped a regression that turned 3D buildings off in every plain boot (F-1387-3, Mistake #10), and the exclusion is what keeps this rider off that path.**
4. **Mount loop**, following the `gold_seam` block in `Run3dPilot.ts` as the pattern: when `ids.includes('rail_element')`, read `window.__THREE_GAME_DIAGNOSTICS__?.rails.ties ?? []`, write one instance matrix per tie at `Terrain.visualY(x, z, 0, 0)` with `rotation.y = tie.yaw`, and set `InstancedMesh.count` to the tie count. `renderOrder` must be `RenderLayers.groundDecals`. Rebuild the instance buffer when the tie count changes; dispose it on `dispose()` and restore the procedural tie mesh's visibility.
5. **New spec** `e2e/run3d-rail-elements.spec.ts`, cloned from `e2e/run3d-gold-seam.spec.ts`'s grammar, on an E2 contract that carries `rails`. Five tests: (a) **plain flag-off boot** → `run3dPilotState` is **`'ready'`** (the landed default — other buildings DO mirror) **and** zero `/rail-element[^/]*\.glb/` requests **and** the procedural rails still render (`rails.active === true`, `asset: 'procedural-placeholder'`); (b) `?debug&run3dPilot=rail_element` → state `'ready'`, instance count **equals** `rails.ties.length`, **exactly one** GLB fetch; (c) `tier=lite` → procedural rails intact, zero GLB; (d) invalid bytes → state `'failed'`, procedural rails intact; (e) p95 ≤115% of the procedural baseline on a `rails` contract, recorded to `artifacts/run3d-rail-elements/`. Zero console/page errors, desktop **and** 390px.
6. Report the numbers below. **Do not "fix" anything outside items 1–5** — if you find another problem, report it, do not repair it.

## FIREWALL

**TOUCH-ONLY:** `src/world/RailPath.ts` (item 1 only — additive diagnostics field) · `src/game/Run3dPilot.ts` · `assets/pilots/run3d/rail-element.glb` (+ `.blend`) · `e2e/run3d-rail-elements.spec.ts` (new) · `artifacts/run3d-rail-elements/**` (new).

**NO:** do **not** change any existing field of `RailPathDiagnostics`, or the procedural `createRailMesh`/`createTieMesh` geometry, or any of the ten footprint constants · do **not** touch `src/game/Game.ts` (`railDiagnostics()` already publishes what you need; if it genuinely does not, **STOP and report** rather than editing it) · do **not** touch `src/meta/ContractFamilies.ts` or any `assets/contracts/**` · do **not** touch any other `e2e/run3d-*.spec.ts` · do **not** touch `e2e/m2-05-base-damage-repair.spec.ts` or `e2e/night3d-perf.spec.ts` (**they are the plain-boot oracle — see self-check 5**) · do **not** touch `logs/suite-red-inventory.md` (standing order: never hand-edit) · do **not** touch `STATUS.md`, `tasks/BACKLOG.md`, `tasks/goals.json`, or anything under `reviews/` · do **not** add the other six rail sheet cells · do **not** reset, rebase or squash the branch.

## SELF-CHECK (run every one, at `--workers=1`, report exact counts — this flag is a correctness requirement of the fire shell, not an optimisation)

1. `npx tsc --noEmit` → rc 0.
2. `npm run build` → rc 0.
3. `npx playwright test e2e/run3d-rail-elements.spec.ts --workers=1` → all green, both projects. Report the tie count and the instance count from test (b); **they must be equal**.
4. `npx playwright test e2e/run3d-gold-seam.spec.ts e2e/run3d-sluice.spec.ts --workers=1` → **16/16** unmodified (the registry-union control: proves your entry unioned in without disturbing a landed sibling).
5. **The plain-boot oracle — both projects, both must be GREEN:** `npx playwright test e2e/m2-05-base-damage-repair.spec.ts e2e/night3d-perf.spec.ts --workers=1`. These are the two suites that caught rider 15's plain-boot regression, and they are the reason scope item 3 exists. ⚠️ **`night3d-perf.spec.ts:67` ("daylight matrix and Night Shift pressure stay within the painted 115% p95 gate") is a KNOWN PRE-EXISTING RED on clean main — measured 1.4815 by a control run on an idle machine, F-1389-1. It is NOT yours, NOT caused by you, and NOT to be fixed.** Report its number and move on. Item 5 passes when `m2-05` is 14/14 and `night3d-perf:98` ("Night Shift keeps its lantern read and auto-tiers one sticky step at a time") is green.
6. `npx playwright test e2e/run3d-assay-bench.spec.ts e2e/run3d-lantern-post.spec.ts e2e/run3d-palisade.spec.ts e2e/run3d-sentry-beacon.spec.ts e2e/run3d-stockpile.spec.ts e2e/run3d-turret.spec.ts --workers=1` → expect all green. (`e2e/run3d-boiler-house.spec.ts` is **excluded on purpose**: its 8 reds are pre-existing and fingerprint-matched in `logs/suite-red-inventory.md`; do not run it, do not fix it.)
7. `npm run test:node-guards` → rc 0, report X/Y.
8. Triangle count of one rail element (≤800 hard cap), material dimensions (≤512²), draw calls added by the rider layer (**must be 1**), and the re-export byte-identity result.
9. Zero console/page errors in the boot probes, desktop **and** 390px mobile.

Commit path-scoped on `lane/e2-arsenal` with the prefix `run3d-16:`. **Never `git add -A`.**

**READY-FOR-GATES + report:** the exact counts for self-checks 1–9; the tie-count-equals-instance-count number; confirmation that `rail_element` is excluded from the `all` selection and that a plain boot still reports `'ready'`; confirmation that no existing `RailPathDiagnostics` field changed; and the `night3d-perf:67` p95 number as a report item only.
