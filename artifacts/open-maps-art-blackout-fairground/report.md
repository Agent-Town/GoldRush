# open-maps-art-blackout-fairground — Blackout Ridge re-lit, the Fairground wheel measured and held

Task: `tasks/open-maps-art-blackout-fairground.md` · branch `art/open-maps-art-blackout-fairground`
cut from main `ba5ffb6a2` · scratch worktree · 2026-09-18 · Blender 5.1.2, Node 26.4.0, Playwright 1.61.1.
Server for every browser measurement: this worktree's own `npx vite --port 5460 --strictPort`.

## Verdict in one paragraph

**Blackout Ridge: rebuilt.** Its landmark atlas was the only E3 pack still baked with the pre-lift
E3 palette; that is the measured cause of "dark machinery", and `stone` — 21-54% of every body's
face area, and the base pad — was a light blue-grey routed into the runtime's *emissive* map, which
is the pale plate the five-landmark review saw. Both are fixed at the atlas, through Astra's own
builder, and proven on the ten station captures: the machinery pixels come up (mean +12.9 on the
receiver, p90 +28.0) while the pad pixels go down (37.2 -> 27.8). **The Fairground: held, with
numbers.** Its named defect is the wheel, and the wheel is not in the landmark pack at all — it is
procedural geometry in `src/entities/FerrisWheel.ts` at a position supplied by
`assets/contracts/epoch-3-voltage/contracts.json`. Both are outside this task's firewall, so the
shape rebuild and the 390 px occlusion fix were not attempted; they are measured here instead, with
the exact prescription, as F-OMA-2 and F-OMA-3.

## Per-defect table

| # | Defect (Astra's words, row 46/49) | Verdict | Measured before | Measured after | Evidence |
|---|---|---|---|---|---|
| D1 | Blackout Ridge "pale terrain boundaries" — terrain edge half | ALREADY CURED UPSTREAM, verified | `data-terrain3d-pilot-skirt-blend = opaque-sculpt-edge` on all four plain boots; `SKIRT_INSET`/`featherTerrainEdge` gone from `src/world/Terrain3dClaimPilot.ts` | unchanged | `before/checks.json` (`dataset.skirtBlend`) |
| D1b | ...the LANDMARK half: each body's base pad reads as a pale plate on night ground | FIXED | pad pixels mean luma **37.2** (receiver, desktop); pale plate clearly visible in `before/blackout-ridge-station-off-map-current-receiver-desktop.png` | **27.8** (-25%); all five bodies' pads down 14-30% | `after/blackout-ridge-contact-desktop-before-after.png` row 1, `work/blackout-ridge-luma.json` |
| D2 | "dark machinery" | FIXED (partial — see note) | machinery pixels mean luma 29.2 / p90 65.2 (receiver desktop); 27.6/59.4 (breath-bank rack); 20.1/39.5 (watch lamp) | **42.2 / 93.2**, **33.2 / 76.4**, **27.5 / 49.3** — mean up on 9 of 10 stations, p90 up on **10 of 10** | same contact sheets + `work/blackout-ridge-luma.json` |
| D3 | "large receiver halo" | ALREADY CURED UPSTREAM, verified | the halo sphere is gone from `makeBlackoutRidgeOffMapGlow` (`src/game/Game.ts:10519-10525` is a bare `PointLight`); Astra's `change.patch` is on main | no halo in any of the 20 captures | `before/` + `after/` receiver stations, both viewports |
| D4 | "HUD overlap" | HELD — out of firewall | receiver apex projects to y **-37.5** desktop / **-39.6** mobile (above the viewport); of the on-screen box the plain-boot HUD covers 21.9% desktop. At 390 px: trunk-line shelter 0%, breath-bank rack **54.7%**, ridge switch house **37.5%**, watch lamp **23.4%** | unchanged | `before/checks.json` -> `stations[].overlapPlain`, F-OMA-1 |
| D5 | Fairground "desktop/mobile shapes remain unaccepted against concept" (the wheel) | HELD — out of firewall | 8 spokes / 1 rim / 8 gondolas hung inside-and-below / no rim lights vs the plate's ~20 doubled lit spokes, 3 concentric rings, ~20 lantern cabins riding the rim's outside, a lit brass hub and a teal base pylon | unchanged | `before/fairground-wheel-concept-vs-game.png`, F-OMA-2 |
| D6 | Fairground "mobile HUD/haze obscure upper wheel" | HELD — out of firewall, and REPRODUCED on a plain boot | wheel apex projects to y **-70.2** at 390 px (above the viewport) and **-66.5** on desktop; of the on-screen box the **plain-boot** HUD covers **42.1%** at 390 px, **29.7%** desktop | unchanged | `before/checks.json` -> fairground `ferris-wheel` station, F-OMA-3 |
| — | "procedural wheel present through normal native entry" must stay true | STILL TRUE | `__THREE_GAME_DIAGNOSTICS__.fairground` is `{active:true, spinning:true, outputWatts:24, x:0, z:8}` on a plain boot (no `?debug`), desktop and 390 px | unchanged | `before/checks.json` plain rows |

Note on D2: the lift is real but bounded by a src-side ceiling, not by the atlas. F-ASTRA-9's
calibration (`Terrain3dClaimPilot.ts:742-751`) clamps whole-body landmark emissive to 0.12-0.6 and
Blackout Ridge carries no per-contract entry in `LANDMARK_EMISSIVE`/`LANDMARK_PAINT`, so it renders
at the calibrated default. The atlas is the only lever inside this firewall and it has been pulled;
the remaining headroom is a per-contract paint row — F-OMA-4.

## Method (so the numbers can be re-run)

`artifacts/open-maps-art-blackout-fairground/capture.mjs`, modelled on Astra's
`scripts/map-landmark-loading-check.mjs` and `fairground-presence-01/check.mjs`. Two boots per map
per viewport (1280x800 and 390x844):

* **plain** — no `?debug`. `?contract=` alone falls back to The Claim: the native launch seam is
  `sessionStorage['gr.contract.launch.v1']` plus the board's "Open every claim" preview switch
  (`ContractFamilies.ts:1351 isPlayerContractLaunch`, `ContractUnlock.setPreviewUnlockAll`). The
  harness makes exactly those two writes **through the board's own modules**, then navigates. This
  boot gives the acceptance screenshot and the **real** HUD rectangles (`__GR_TEST__` is absent).
* **debug** — `?debug&nowaves&nolevel&nokill&nopause&tier=full`, for `__GR_TEST__.screenPoint` and
  `teleport`. Screen geometry is measured here and intersected against the **plain** boot's HUD
  rectangles, so no debug-only chrome is counted as occlusion. Up-screen is -z, so each station
  stands at `(x, z + 14)`.

Luminance (`measure_luma.mjs`): a crop of the body's column is dominated by the cream HUD cards, so
instead the before/after station pairs — same seed, same station, same paused sim, one asset changed
— are differenced, pixels inside any HUD rect are dropped, and the surviving changed pixels are
split into *darkened* (the pad) and *brightened* (the machinery). That set IS the landmark.

## What was rebuilt

| File | Builder step | Change |
|---|---|---|
| `.../landmarks/blackout-ridge/blackout-ridge-landmarks-atlas.png` | `build_landmark_packs.make_atlas('blackout-ridge', {era:3, plate:'assets/raw/plate-e3-bld-pylon-set.png'})` | re-baked with the E3 V2 palette, `stone` -> `(0.115,0.098,0.078)`, `brass` -> `(0.78,0.500,0.120)` |
| the five body GLBs | `build_landmark_packs.export_asset` on the existing `.blend` objects | re-exported so each embeds the new atlas; geometry, UVs, extras, triangle counts and bounds unchanged in value (tris 1316/1456/1044/856/956; bounds identical) |
| `.../blackout-ridge-landmarks.blend` | `bpy.ops.wm.save_mainfile` | the pack material's texture node now points at the new packed atlas |
| `.../blackout-ridge-landmark-pack-contract.json` | — | keys changed: `atlas.sha256`, `blend.sha256`, `assets.<id>.sha256` (x5). Nothing else moved: `triangles`, `bounds`, `footprint`, `sourceTier`, `sources`, `mounts` are untouched |
| `assets/pilots/map-rebuild-spike/landmarks/landmark-source-ledger.json` | — | **deliberately NOT edited.** `scripts/glb-contract-guard.test.mjs:307` mirrors only `sourceTier`/`sources`/`asset`; none of the three moved, and editing the ledger would have broken the mirror |

The driver is `artifacts/open-maps-art-blackout-fairground/rebuild_pack.py`. It does not edit
`build_landmark_packs.py` (outside the firewall, and the E3 recipes are no longer in it — see
F-OMA-5); it imports the builder and patches `ROLE_COLORS`, which is exactly the branch the builder
used to carry for era 3.

**Provenance, verified by reproduction.** `rebuild_pack.py ... verify` re-bakes each pack's shipped
atlas from the recovered palette and compares:

```
blackout-ridge  reproduced_bytes=True  pixel_max_delta=0.0   (palette V1, f063fa403)
fairground      reproduced_bytes=True  pixel_max_delta=0.0   (palette V2, 7b930acc1)
```

Both shipped atlases regenerate **byte-for-byte**. That is what pins the root cause: the two packs
were baked with two *different* E3 palettes, and Blackout Ridge — built first, never re-baked — is
the only E3 pack still on the pre-lift one (timber x1.44, iron x1.48-1.61, stone x1.86, earth x1.68
below V2). It also contradicts, for these two packs, the note at `Terrain3dClaimPilot.ts` that "the
landmark pack no longer regenerates faithfully"; the atlas half regenerates exactly.

**One design rejected by reading the runtime**, not by taste: a second material carrying a lamp
`emissiveFactor` for the `water`/`brass`/`parchment` roles (recoverable per-face from the UVs, since
`map_uv` writes each role into its own 4x4 tile). `keepLandmarkPaintReadable`
(`Terrain3dClaimPilot.ts:965-989`) sets `material.emissive` and `material.emissiveMap` on every
mounted landmark material that carries a map, so an authored emissive is overwritten on install — a
runtime no-op that would also have red-flagged the guard's `materialCount` check. The pack therefore
keeps one material and one texture.

## Gates

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** (`work/tsc.log`) |
| `npm run build` | **rc=0**. asset-diet: 419 manifest GLBs 814,660,832 -> 122,665,700 (85% cut); landmarks family 202 GLBs -> 54,802,360 |
| `GR_RELEASE=e1 npm run build` | **rc=0**. 60 manifest GLBs 119,187,524 -> 16,979,984. Neither map is in the first town: **zero** blackout/fairground assets in the E1 bundle (grep of the build log and of `dist/assets`) |
| payload delta | each rebuilt GLB +63,104 bytes (the new atlas PNG), **+315,520 bytes** over the five; geometry unchanged |
| `node scripts/glb-contract-guard.mjs` | 423 production GLBs / 6 violations / 6 grandfathered / **0 live** — identical to the pre-change baseline. **No new grandfather line was added** |
| `node --test scripts/glb-contract-guard.test.mjs` | **23/23 pass**, including "landmark pack records bind the actual bytes, triangles and Blender-coordinate bounds" and "the shared landmark source ledger covers every shipped pack and current source declaration" |
| `node --test deploy-mirror-allowlist + landmark-walk-surfaces + fairground-dependency + shared-atlas-plugin` | **9/9 pass**. The deploy mirror was run although no GLB path changed (five existing paths, no new file) |
| `PROBE_BASE=...:5460 node scripts/map-landmark-loading-check.mjs` | **PASS x8** (4 contracts x desktop/mobile), zero errors |
| `PROBE_BASE=...:5460 node scripts/map-landmark-repeat-check.mjs` | **PASS** both viewports: expected 9 = actual 9, distinct, offset 20, `sharedMaterials:false`, zero errors |
| `e2e/e3-blackout-ridge` + `e3-fairground` + `e3-fairground-flocks`, desktop+mobile | **10 passed (30.5 s)**, specs unmodified |
| `e2e/terrain3d-registry` + `seam-visual-follows-sculpt` + `er01-e3-census` + `landmark-brightness`, desktop+mobile | 29 passed, 6 skipped, **9 failed** — all nine ATTRIBUTED PRE-EXISTING, see below |
| `GR_PLAYABILITY_SMOKE=1 ... -g "e3-blackout-ridge|e3-fairground"` | **4 passed (1.2 m)**, both projects, plain boot to wave 2 |
| plain boot console/page errors | **0** on all four plain boots (2 maps x 2 viewports), before and after |
| `computeEngineHash()` | before `540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068` -> after **`96844d68442d7caf1baf9c4b4d0bdb75f5073b0a1d23e0c893791cc1a39dc2c6`** (`assets/pilots/map-rebuild-spike` is in `ENGINE_SOURCE_INPUTS`, so the pack move is expected to move it; the drain pins the new one) |
| renderer-count artifacts | none touched. No spec pins these maps' counts, and the churn the e2e runs made under `artifacts/**` and `reviews/shots-*` was restored with `git checkout --` before the commits |

### Attribution of the nine reds (control run, not inventory membership)

`scripts/red-inventory-lookup.mjs` labels `terrain3d-registry` and `er01-e3-census` KNOWN-RED but
also warns the snapshot is 37 days stale and that "membership is never exoneration (F-1444-2)". So a
control was run: the pack was reverted with `git checkout --`, the server restarted on the pristine
tree, and the same five titles re-run on both projects. Result: **the same 9 failures, same specs,
same line numbers, same projects.** They are pre-existing on `ba5ffb6a2`. The pack was then
re-applied and re-verified against the contract hashes (`REAPPLIED-AND-CONSISTENT`).

The headline failure is `terrain3d-registry.spec.ts:217` — `data-terrain3d-pilot-triangles` 51,200
vs an expected 32,768. That is a **terrain** mesh count; no terrain GLB was touched by this task.

* `er01-e3-census` "e3-canyon-works census" — desktop + mobile
* `seam-visual-follows-sculpt:152` "those pixels are the seam" — desktop
* `terrain3d-registry:196 / :272 / :345` — desktop + mobile

## Findings

**F-OMA-1 — the mount table the runtime reads is NOT the pack contract, so the HUD-overlap fix the
master prescribes lands in a file this firewall does not open.** The master says to fix HUD overlap
"by a placement or scale change in the pack contract". The runtime reads `landmarkMounts` from
`assets/pilots/map-rebuild-spike/<map>-terrain-contract.json`
(`Terrain3dClaimPilot.ts:210 landmarkMountsFor`, fed from `REGISTRY`), not from
`<pack>-landmark-pack-contract.json`; the two carry mirrored copies. Editing only the pack contract
would be a no-op **and** would desync the mirror. Corrective: set
`off-map-current-receiver.scale` to `[0.8,0.8,0.8]` (apex 10.25 -> 8.2 m, which puts it back inside
the frame at the station camera) in **both** files in one commit, plus the 390 px scale trims for
`breath-bank-service-rack` (54.7% covered) and `ridge-switch-house` (37.5%). The body's footprint is
also mirrored into `assets/pilots/map-rebuild-spike/landmark-collision-contract.json`, so a scale
change has to carry that file too — which is why it is a separate, three-file task, not a tweak.

**F-OMA-2 — the Fairground wheel is not a landmark, so "rebuild it in the builder" cannot be done
from the pack.** `src/entities/FerrisWheel.ts` builds it procedurally and `Game.ts:4921` composes
it from `contracts.json`'s `twist.fairground.wheel` (`{x:0, z:8, maxHp:240, spinRate:0.35,
outputWatts:24, viewRadius:18}`). The pack's five bodies are the arch, the calliope wagon, the prize
cage, the rostrum and the bell kiosk — no wheel. Both `src/**` and "contracts' gameplay data" are
firewalled here, so the rebuild was not attempted. The measured prescription, from
`before/fairground-wheel-concept-vs-game.png` against `assets/raw/plate-contract-e3-fairground.png`:

| | shipped (`FerrisWheel.buildVisuals`) | concept plate |
|---|---|---|
| rims | 1 (`TorusGeometry(5, 0.16, 8, 40)`) | 3 concentric — outer rim, a mid ring at ~0.62 R, an inner ring at ~0.33 R |
| spokes | 8 plain box beams | ~20 **paired** spokes, each a lit bulb string |
| cars | 8 gondolas hung *inside* the rim and below it (`position.y -0.9`) | ~20 tall lantern boxes riding the **outside** of the rim, lit windows |
| rim lighting | none | a continuous bulb string on rim and spokes — the wheel is the map's light source |
| hub | plain teal cylinder (`axle`) | lit brass boss |
| base | flat platform + two feet | fenced circular base with a teal-glowing pylon rising into the hub |

**F-OMA-3 — the 390 px occlusion is real on a PLAIN boot, not a debug-UI artifact, and it is
viewport clipping first, HUD second.** Astra's `fairground-presence-01/README.md` attributed it to
"mobile debug/hint UI". Measured here without `?debug`: at the standard station the wheel's apex
projects to y = **-70.2** at 390 px and **-66.5** on desktop — i.e. the top of the wheel is above
the top of the frame on BOTH — and of the part that is on screen the plain HUD covers **42.1%** /
**29.7%**. Levers, all outside this firewall: `group.scale.setScalar(0.74)`
(`FerrisWheel.ts:36`), the hub height `6.2` and ring radius `5` (`:135`, `:122`), or the wheel's
`z` in `contracts.json`. Moving the HUD is explicitly excluded by the master.

**F-OMA-4 — Blackout Ridge has no per-contract landmark paint row, so it renders at the calibrated
default on a night map.** `LANDMARK_EMISSIVE` (`Terrain3dClaimPilot.ts:675`) carries only
`the-claim`, `e2-hill-mine`, `e2-trestle`, `e2-pressure-garden`, `e2-incline`; `LANDMARK_PAINT`
carries no `e3-*` map at all; `e1-night-shift` is skipped entirely (`:2303`) and is the calibration's
own control for "what a body reads at when only the rig lights it". A night E3 map is the same
case and has neither the skip nor a row. This is the remaining headroom on D2 and is a one-line
src change — out of firewall, and it should be decided against the reference rig
(`e2e/landmark-brightness.spec.ts`), not by eye.

**F-OMA-5 — the E3 pack recipes are no longer in the tracked builder.** `PACKS["blackout-ridge"]`,
`PACKS["fairground"]`, their `SPECS` rows, `E3_ROLE_COLORS` and the `era == 3` branch of
`make_atlas`'s colour ladder all existed at `f063fa403`/`7b930acc1` and are absent from
`assets/pilots/map-rebuild-spike/build_landmark_packs.py` on main — already absent at `883a3521e^`,
so Astra's campaign commit is not the remover. Era 3 therefore falls through to the default
near-black proxy palette today: **anyone who re-runs the tracked builder on these two packs will get
a darker atlas than what shipped.** `rebuild_pack.py` documents and pins the recovered values;
restoring them to the shared builder is a separate task (the builder is outside this firewall).

## Held, with reasons

* The whole **Fairground pack** is untouched. Its named defect is the wheel (F-OMA-2/3); its five
  bodies are not named in row 49 and its atlas already carries the lifted E3 palette. Adjacent
  observation, not acted on: the fairground bodies' `stone` pads carry V2's `(0.26,0.285,0.30)`, the
  same light blue-grey that read as a pale plate on Blackout Ridge, and at 390 px
  `north-crowd-counting-rostrum` and `fair-bell-battery-kiosk` sit 45.3% / 39.1% under the HUD.
* **D4 HUD overlap** on Blackout Ridge — F-OMA-1, wrong file.
* **The `landmark-source-ledger.json` edit** the master asks for — the pack's source ladder did not
  move, and the guard test mirrors exactly the three fields that did not change.
* `scripts/glb-contract-guard.baseline.json`, `scripts/asset-diet.manifest.json` and
  `scripts/deploy.sh` — all three were in the firewall "if needed"; none was needed (0 live
  violations, no diet-row change, no new GLB path).

## Files on disk, not committed

`artifacts/open-maps-art-blackout-fairground/work/after-pack/` (a copy of the rebuilt pack, taken so
the control run could revert and re-apply), `work/blackout-ridge-landmarks-atlas.original.png` and
`work/blackout-ridge-landmarks.blend1.bak`. All three are byte-recoverable from git (the previous
version of tracked files, and the commit below), so they are duplicates rather than history; nothing
was deleted. The landmark loading probe also wrote fresh captures into the untracked
`artifacts/map-art-repairs-20260908/deepwater/` — left on disk, per the 2026-08-26 amendment.
