# Drain review — `open-maps-art-blackout-fairground`: Blackout Ridge's landmarks re-lit through Astra's builder; the halo and the terrain edge verified cured upstream; the HUD overlap and the Fairground wheel held with their levers written down (attended drain, 2026-09-18)

**Slice/branch/tip:** `art/open-maps-art-blackout-fairground` @ `76530adaf (archive: pruned by the A3 rewrite)` — two commits by a Claude Opus 5 implementer on the owner's Anthropic subscription in a scratch worktree cut from main `133f80804` (Blender headless through Astra's `build_landmark_packs` atlas step; no image generation); master `tasks/open-maps-art-blackout-fairground.md`; the implementer's report and 62 evidence files: `artifacts/open-maps-art-blackout-fairground/`. **Merged as** `220fbe472 (archive: pruned by the A3 rewrite)` into the open-maps chain (after `1c47ba975`), era-6 pin #9 covers both lands (measured after the floors), landed by fast-forward at the hash the ledger row names.
**Owner words, verbatim:** 2026-09-15 "I think what Astra started is worth it" · 2026-09-18 "nono go ahead and start more jobs".

## VERDICT: LANDED for Blackout Ridge's atlas; the rest named, not faked

## 1. Per defect (Astra's words from `reviews/sol-map-art-current-status-20260909.md`)
| defect | verdict | measured |
|---|---|---|
| "pale terrain boundaries" — the terrain edge | already cured upstream, **verified** | `skirt-blend=opaque-sculpt-edge` on all four plain boots; the feather is gone from `src` |
| — the landmark half: base pads read as pale plates | **FIXED** | pad pixel mean luma 37.2 → 27.8 (−25 %); all five pads down 14–30 % |
| "dark machinery" | **FIXED, src-capped** | machinery pixel mean 29.2 → 42.2, p90 65.2 → 93.2 on the receiver; p90 up on 10 of 10 stations; the remaining headroom is a missing `LANDMARK_EMISSIVE`/`LANDMARK_PAINT` row for this night map (F-OMB-4, one `src` line judged by `e2e/landmark-brightness.spec.ts`) |
| "large receiver halo" | already cured upstream, **verified** | `makeBlackoutRidgeOffMapGlow` is a bare point light; no halo in 20 captures |
| Blackout "HUD overlap" | **HELD** (F-OMB-1) | receiver apex y = −37.5 / −39.6; at 390 px the breath-bank 54.7 %, the switch-house 37.5 %, the watch-lamp 23.4 % sit under the HUD. The runtime reads `landmarkMounts` from `<map>-terrain-contract.json`, not the pack contract — a three-file change (terrain contract, pack contract, `landmark-collision-contract.json`); proposed receiver scale 0.8 (apex 10.25 → 8.2 m) |
| Fairground wheel shape vs concept | **HELD** (F-OMB-2) | 8 spokes / 1 rim / 8 inside-hung cars vs the concept's ~20 paired lit spokes / 3 rings / ~20 rim lanterns; the wheel is `src/entities/FerrisWheel.ts` + `contracts.json` gameplay data, both outside the firewall; the shape table is in the report |
| Fairground 390 px HUD/haze occlusion | **HELD** (F-OMB-3), reproduced on a PLAIN boot | apex y = −70.2 (390 px) / −66.5 (desktop), above frame on both; the plain HUD covers 42.1 % / 29.7 %; levers written down (scale 0.74, hub 6.2, radius 5, or the wheel's z) |
| "wheel present through normal native entry" | still true | `{active, spinning, 24 W, x: 0, z: 8}` on a plain boot, both viewports, 0 errors |

**What was rebuilt:** Blackout Ridge's shared atlas, re-baked through Astra's `make_atlas` with a driver that patches `ROLE_COLORS` (the builder itself untouched) onto the E3 V2 palette (`stone` to (0.115, 0.098, 0.078), `brass` +20 %); the five bodies re-exported from the existing `.blend` — geometry, UVs, extras, triangles and bounds unchanged in value; contract keys touched: the atlas, blend and five asset hashes; +63,104 B per GLB. **Provenance proven by reproduction:** verify-mode re-bakes each pack's shipped atlas byte-for-byte (Blackout = the V1 palette from `35686b8d0`, Fairground = V2 from `af2ea0e4f`, pixel delta 0.0) — Blackout Ridge was the only E3 pack never re-baked onto the lifted palette (F-OMB-5: the E3 recipes are gone from the tracked builder since before the map campaign landed; restoring them is its own task).

## 2. Gate table
| gate | implementer (branch) | drain (chained tree) |
|---|---|---|
| tsc / `npm run build` / `GR_RELEASE=e1` build | rc=0 / rc=0 / rc=0 (zero Blackout or Fairground assets in the E1 bundle) | rc=0 / rc=0 (drain, chained tree) |
| `glb-contract-guard.mjs` / its test | 423 GLBs · 6 violations · 6 grandfathered · 0 live, no new line / 23/23 | 0 live |
| deploy-mirror-allowlist + landmark-walk-surfaces + fairground-dependency + shared-atlas | 9/9 | — |
| Astra's two landmark probes on 5460 | green | — |
| `e3-blackout-ridge` + `e3-fairground` + `e3-fairground-flocks`, both projects | 10/10 | — |
| the smoke for the two maps, both projects | 4/4 | — |
| plain boots | 0 console/page errors, every capture | — |
| nine adjacent reds (`terrain3d-registry` :196/:272/:345, `er01-e3-census` canyon-works, `seam-visual` :152) | PRE-EXISTING: reproduced on the pristine tree after reverting the pack (same nine, same lines, same projects); the headline is a terrain triangle count (51,200 vs 32,768) and no terrain GLB was touched | inventory rows (F-OMB-6) |
| engine era | hash reported | pin #9 (shared with the open-maps land) |
| full `test:node-guards`, Node 26 (one battery for the chain) | not run (the drainer's) | 918 tests, 910 pass, 3 fail, 5 skipped (502 s) on the chained tree with four agents and heat-14 riders on the box: `hero-move-verb.test.mjs` (green 6/6 alone — contention), `desk-declaration-guard.test.mjs:163` (this worktree\'s STATUS line 1 is a fire\'s handoff the guard refuses to judge from a linked worktree — re-checked on main after the fast-forward), and the fixture sweep\'s echo of that child; the first run before the F-OMA-6 re-point had read 913/2 with the Long Road detector red (cured) and `secure-choice-refusal` green alone (contention) |

## 3. Findings
- **F-OMB-1** the Blackout HUD overlap is a three-file placement change (terrain contract `landmarkMounts` + pack contract + collision contract); receiver scale 0.8 proposed. Fire-authorable.
- **F-OMB-2 / F-OMB-3** the Fairground wheel (shape and 390 px occlusion) lives in `src/entities/FerrisWheel.ts` and the contract's gameplay data — an attended call on opening `src`; the levers are in the report.
- **F-OMB-4** Blackout Ridge has no `LANDMARK_EMISSIVE`/`LANDMARK_PAINT` row (night map at the calibrated default, cap 0.6) — one `src` line, judged by `landmark-brightness.spec.ts`.
- **F-OMB-5** the E3 pack recipes are absent from the tracked builder; re-running it on E3 packs today yields a darker atlas than shipped. Own task.
- **F-OMB-6** nine adjacent reds pre-existing on main (rows added).
- Adjacent, not acted on: the Fairground's own `stone` pads carry the same light blue-grey; at 390 px its rostrum and bell-kiosk sit 45.3 % / 39.1 % under the HUD.

## 4. What was touched
`assets/pilots/map-rebuild-spike/landmarks/blackout-ridge/**` (the atlas, the `.blend` sidecar, five GLBs, the pack contract's hashes; the source ledger deliberately unchanged — nothing it mirrors moved), `artifacts/open-maps-art-blackout-fairground/**`; at the drain the shared pin, this review, `logs/suite-red-inventory.md` (F-OMB-6), `tasks/goals.json`, `tasks/BACKLOG.md`.
