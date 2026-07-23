# Review — census landmark brightness corrective (lane-a)

**Slice:** corrective-census-landmark-brightness (LAUNCH-GATING, attended-promoted)
**Branch/base/tip:** `lane/m3` — merge-base `9095bee9` (town-scale-zoom, already on main as `6c18f87a`) → lane tip `c88c1241` (`runner(lane-a): corrective-census-landmark-brightness.md`, 2026-07-23 21:27:58)
**Merge:** `--no-ff` 3-way onto main tip `1d82bc42` (drained s957 fire, 2026-07-23 ~21:40Z)
**Verdict:** MERGED — corrective goal met (5 named maps pass the census landmark-brightness floor); tsc+build independently green on the merged tree; the visual census spec was run by Codex in-lane (real run, committed artifact) but **could not be independently re-run by the fire** (the spec's `npm run dev` port-bind is gated for headless fires) — see F-2. Attended should re-run the full census on the live launch build as final launch confirmation.

## What it does
Landmark GLBs on daylight maps rendered below the census luminance floor (`>0.06`) while material opacity/depth flags were correct. The fix adds `keepLandmarkPaintReadable(model)` in `src/world/Terrain3dClaimPilot.ts`: for each landmark mesh with a texture map it sets `emissive='#ffffff'`, `emissiveMap = material.map`, `emissiveIntensity = 3` — lifting the painted texture's own colours into the emissive channel so the landmark reads at daylight brightness without washing to white. It is **skipped for `e1-night-shift`** (night-mode truth preserved) and uses the asset's own map as the emissive source (asset colours preserved). The same commit refactors `loadMount` to collect resolved models and add them after `Promise.all` (removes an add-during-async race) and drops the corrective mask in `e2e/map-census.spec.ts` so the 5 named maps must now pass the **real** threshold rather than being annotated CORRECTIVE.

## Evidence
| Gate | Result | Note |
|---|---|---|
| `npx tsc --noEmit` | ✓ clean | merged tree |
| `npm run build` | ✓ built in 1.35s | merged tree |
| map-census — 5 named maps landmark brightness | ✓ PASS | codex in-lane run: e1-twin-banks 0.058→PASS · e1-baron 0.045→PASS · e2-pressure-garden 0.052→PASS (+ mobile spot PASS) · e2-incline 0.054→PASS · e3-moth-season 0.040→PASS (`artifacts/map-census/table.md`) |
| night-mode truth | ✓ preserved | `e1-night-shift` excluded in code (`host.contractId !== 'e1-night-shift'`); table still PASS-exempt: night map |
| clone-removal safety (regression check) | ✓ safe for launch maps | static-verified: the-claim, dry-gulch, twin-banks, night-shift, baron, relay-valley all have **unique** landmark assets per contract → the removed clone-on-duplicate branch was dead code for these maps; no landmark drop |
| independent visual re-run (fire) | ⚠ not run | census `webServer: npm run dev` port-bind gated for headless fire (F-2) |

## Merge classification
Stale-base lane (base `9095bee9` predates RF-05b `5fc2c645` / rf-03b `ceb41e23` / census-promo `5f88b2c4` on main). Two-dot `main...lane/m3` shows a large phantom net-deletion — the stale-base signature, NOT real deletions. The commit `c88c1241` touches exactly 3 files: `artifacts/map-census/table.md`, `e2e/map-census.spec.ts`, `src/world/Terrain3dClaimPilot.ts`. Main's only divergence on those since the merge-base is RF-05b's `__GR_RELEASE_E1__` registry wrap in `Terrain3dClaimPilot.ts` (lines ~115–155) — **disjoint** from the fix's hunks (276, 585–631). The 3-way auto-merged clean (`ort`, `Auto-merging src/world/Terrain3dClaimPilot.ts`, no conflict).

## Launch relevance
Directly launch-beneficial: `keepLandmarkPaintReadable` brightens the E1 landmarks (`e1-twin-banks`, `e1-baron`) that the RF-05b **E1-only release build** actually ships — the two maps that were the residual launch-gate class.

## Findings
- **F-1 (non-blocking, out-of-scope, pre-existing):** the in-lane census run surfaced FAILs on `e7-relay-valley` (Render "expected glb, got painted" · no mounted landmark · 15.5s) and `e10-last-claim` (MQ-2 · 14.6s). These are **incomplete-landmark-pack work** (relay-valley landmark GLBs not present on this base → painted fallback; the packs are in flight on `sol/campaign-landmarks-e7-relay-valley` etc.), NOT caused by this brightness fix, NOT landmark-brightness, and **not in the E1 release build** (E7/E10 excluded by `__GR_RELEASE_E1__`). Tracked for the landmark-pack ladder; no corrective spawned. Attended's full-census on live main will report their real state.
- **F-2 (gate limitation, for attended):** the fire cannot bind a dev-server port to re-run the playwright census/boot probes. Evidence here is codex's committed in-lane census artifact (a genuine run — the 5 maps' specific sub-floor luminance values transitioned to PASS, and new rows gained detailed FAIL messages a hand-edit could not fabricate) plus fire-run tsc+build and static clone-removal verification. **Attended should re-run `npm run census` on the live launch build** to close the visual gate before the full-saga ship. The E1 launch maps are the priority.
