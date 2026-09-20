# post-open-maps-correctives — six correctives, six landed; one of them against half of its own prescription

Task: `tasks/post-open-maps-correctives.md` · branch `feat/post-open-maps-correctives`
cut from main `7ff3e1b27` (task commit `90ca0cfab`) · scratch worktree · 2026-09-18
Node 26.4.0 (`/opt/homebrew/bin` first on PATH), Playwright 1.61.1, three 0.184.0.
Every browser measurement in this report used this worktree's own `npx vite --port 5312
--strictPort --host 127.0.0.1`, `--workers=1`, both projects unless a line says otherwise.

| # | finding | verdict |
|---|---|---|
| 1 | F-OMB-1 Blackout HUD overlap, three files | **LANDED for the receiver; the two trims REFUSED by measurement** (F-POC-1) |
| 2 | F-OMB-4 `LANDMARK_EMISSIVE` row for `e3-blackout-ridge` | **LANDED** at the whole-body cap, graded against its era sibling |
| 3 | F-OMB-2 / F-OMB-3 the Fairground wheel | **LANDED** — rebuilt to the plate, apex inside the frame on both viewports |
| 4 | F-OMA-3 the Long Road's card | **LANDED** |
| 5 | F-BMB-2 the Salvage Claw sidecar | **LANDED** |
| 6 | F-BMB-3 the E5 p95 gate | **LANDED** — one measured false red in eight became 8 of 8 green |

**Engine hash** before `5a00e9a04d7d5c1a17cb0296d9f927e5241f970128c8dbfb2f80e13a4a17b72a`
-> after `293e4c1b6a16c074de106fb08a01c767d57a3268c09254c8359e1e623c20a930`.
Four of the eight touched files are inside `ENGINE_SOURCE_INPUTS` (`assets/contracts`,
`assets/pilots/map-rebuild-spike`, `src`), so the move is expected. **The pin is the DRAIN's** —
`assets/engine-era.json` is untouched, and `scripts/engine-era-guard.test.mjs` is therefore RED on
this branch BY DESIGN until the drain appends a same-era pin with its cause.

## Method

`artifacts/post-open-maps-correctives/capture.mjs` is the 2026-09-18 open-maps harness re-pointed at
port 5312, with three additions this task needed:

* HUD rectangles are SPLIT. `.hud__wave` is `opacity: 0` until `.hud--announcement-visible`
  (`src/ui/theme.css:196,238`), i.e. it is a transient wave banner, and on mobile it sits at
  `top: 12 + 190 + 76 = 278 px` across the FULL width (`theme.css:1706`). The harness now reports
  `overlapPlain` (the review's own metric, the union) and `overlapPersistent` (the cards a player
  always has). That split is what decided item 1.
* `renderCensus()` draw calls / triangles on the debug boot.
* `P95_RUNS` frame-time samples per boot, because the host is bimodal.

Two further probes: `wheel-frame-probe.mjs` (world height -> screen y at the wheel's station) and
`wheel-standoff-probe.mjs` (the same, swept over stand-off), plus `plain-boots.mjs` (the four
acceptance boots) and `wheel-closeup.mjs` (HUD-free eyes-on for the shape comparison).

Phases on disk: `before/`, `after-item1/` (receiver scale alone), `probe-trim/` (the control arm
that refused the trim), `after-item3/` (the wheel, first pass), `after/` (the landed tree).

---

## 1. F-OMB-1 — the Blackout Ridge receiver, and why the two trims were refused

**Lever pulled:** `off-map-current-receiver.scale` `[1,1,1]` -> `[0.8,0.8,0.8]` in all three files in
one commit — `blackout-ridge-terrain-contract.json` (`landmarkMounts`, the copy the runtime reads
via `Terrain3dClaimPilot.landmarkMountsFor`), the pack contract's mirrored `mounts`, and
`landmark-collision-contract.json` (`scale` `[1,1]` -> `[0.8,0.8]`; `LandmarkCollision.ts:35-51`
multiplies the authored footprint by the mount scale, so the blocker shrinks with the body and the
authored `w`/`d` stay).

**Mount copies proven identical after the edit** by direct diff, not by the sweep script:
`JSON.stringify(terrain.landmarkMounts) === JSON.stringify(pack.mounts)` -> `true`.

**Before / after, PLAIN boot (`?contract=e3-blackout-ridge`, no `?debug`), standard station:**

| body | apex y 1280 | apex y 390 | 390 px covered (all HUD) | 390 px covered (persistent HUD) |
|---|---|---|---|---|
| off-map-current-receiver | **-37.7 -> +21.0** | **-39.6 -> +22.0** | 0.0 % -> 0.0 % | 0.0 % -> 0.0 % |
| trunk-line-breaker-shelter | 47.0 (unch.) | 49.5 (unch.) | 0.0 % | 0.0 % |
| breath-bank-service-rack | 229.3 | 241.9 | 54.7 % | **0.0 %** |
| ridge-switch-house | 193.6 | 204.2 | 37.5 % | **0.0 %** |
| blackout-watch-lamp | 199.5 | 210.4 | 23.4 % | **0.0 %** |

The review's three numbers reproduce exactly (54.7 / 37.5 / 23.4). **Acceptance half one is met:
every apex is inside the frame at the standard station on both viewports.**

**F-POC-1 — the other half of the acceptance cannot be met by trimming, and trimming makes it
worse.** Two facts, both measured:

1. Those percentages are ENTIRELY the transient `.hud__wave` announcement band. With the
   announcement excluded, the persistent HUD covers **0.0 %** of every one of the five bodies on
   both viewports. The bar "no body more than 25 % HUD-covered at 390 px" is already met against the
   HUD a player has on screen at any given moment.
2. The band is a fixed 53 px tall (y 278-331) and every body's base is inside it, so the covered
   FRACTION is `53 px / the body's projected height` — and a trim shortens the body. Control arm,
   run on this tree with `breath-bank-service-rack` set to `[0.8,0.8,0.8]` and then reverted
   (`probe-trim/checks.json`): its coverage went **54.7 % -> 68.8 %**, and its apex fell from y 241.9
   to 258.8. To reach 25 % the rack would have to be scaled UP past 2.1x (a 4.25 m service rack
   standing 9 m tall).

So the receiver's scale landed and the two trims did not. Trimming them would have moved the number
the review quoted in the wrong direction while making two bodies smaller for nothing.

Draw calls on the map: desktop 67 -> 66, mobile 50 -> 49 (the smaller receiver changes what the
frustum keeps); triangles 134,880 -> 134,878.

**Gate table**

| gate | result |
|---|---|
| `e2e/e3-blackout-ridge.spec.ts`, both projects | 4/4 pass, spec unmodified |
| plain boot console/page errors | 0, both viewports, before and after |
| mount mirror identity | `true` (JSON compare of the two arrays) |

Screenshots: `before/blackout-ridge-plain-{desktop,mobile}.png`,
`after/plain-boots/e3-blackout-ridge-plain-{1280,390}.png`, and the five per-body station shots in
each phase directory.

---

## 2. F-OMB-4 — a `LANDMARK_EMISSIVE` row for `e3-blackout-ridge`

**Lever pulled:** one table line in `src/world/Terrain3dClaimPilot.ts` —
`'e3-blackout-ridge': 4`, which `calibratedLandmarkIntensity` grades to
`0.45 x (4 / 3) = 0.6` and the clamp holds at `LANDMARK_EMISSIVE_WHOLE_BODY_MAX = 0.6`.

**How the value was chosen.** The reference rig (`e2e/landmark-brightness.spec.ts`,
`GR_LIGHTING_CALIBRATION=1`, desktop, focus `ridge-switch-house`, night) measured the whole
comparison set on THIS tree rather than quoting the 2026-09-05 numbers:

| scene | terrain median | landmark median | landmark/terrain | rendered emissive |
|---|---|---|---|---|
| the-claim (day, signed-off grade) | 0.3123 | 0.0835 | 0.267 | 0.217 |
| e2-hill-mine (day) | 0.2383 | 0.0763 | 0.320 | 0.217 |
| e8-mare-claim (day) | 0.1103 | 0.2280 | 2.067 | 0.45 |
| **e1-night-shift (the control: never painted)** | 0.0644 | **0.0479** | 0.744 | 1 (untouched) |
| **e3-fairground (the era sibling, night, V2 atlas)** | 0.1086 | **0.1057** | 0.973 | 0.45 |
| **e3-blackout-ridge, before** | 0.0680 | **0.0882** | 1.297 | 0.45 |

The ratio is not comparable across maps (it divides by a terrain that is 4.6x brighter on a day map),
so the number that decides this is the ABSOLUTE landmark median against the map's own era sibling:
**Blackout Ridge read 16.6 % darker than the Fairground**, the other E3 night map, whose atlas
already carries the lifted V2 palette. That is the residue of Astra's "dark machinery" after the
atlas rebuild, measured in a directly comparable pair.

`lmemissive` sweep on this map (`artifacts/landmark-lighting-calibration/poc-blackout-lm*.json`),
which is exactly what a per-contract row does, since a contract's row applies to all its mounts:

| lift | 0.12 | 0.20 | 0.30 | 0.45 (no row) | 0.60 (the cap) |
|---|---|---|---|---|---|
| landmark median | 0.0529 | 0.0642 | 0.0732 | 0.0882 | 0.1018 |

The sibling's 0.1057 wants ~0.62 and the hard cap is 0.6.

**After, measured (not interpolated):** landmark median **0.0882 -> 0.1018 (+15.4 %)**, rendered
emissive 0.45 -> 0.60, the gap to the era sibling **-16.6 % -> -3.7 %**.

**F-POC-3, the trade, written down:** 4 is the only row in the table above the legacy default of 3,
so under `?lighting=legacy` — the harness A/B, not a play path — this map now renders at 4 where its
history was 3. That is a harness-only inaccuracy and it is the price of expressing "this night map
wants more ink lift than the default" in the table's legacy units. The cap, not the number, is what
prevents the body becoming its own light source, and it binds here.

**Gate table**

| gate | result |
|---|---|
| `e2e/landmark-brightness.spec.ts`, both projects | 4 passed / 4 skipped (the two calibration tests skip without the env), spec unmodified |
| `e2e/e3-blackout-ridge.spec.ts`, both projects | 4/4, run in the same batch |

---

## 3. F-OMB-2 / F-OMB-3 — the Fairground wheel

**Lever pulled:** `src/entities/FerrisWheel.ts` `buildVisuals` rebuilt; `RIM` 5 -> 2.63 and the hub
height 6.2 -> 3.49. `group.scale.setScalar(0.74)` is UNCHANGED. Nothing in
`assets/contracts/epoch-3-voltage/contracts.json` was touched: `maxHp`, `spinRate`, `outputWatts`,
`viewRadius` and the position are the sim's, and so are `target.halfX/halfZ/reachRadius`.

**Shape, against `assets/raw/plate-contract-e3-fairground.png`**

| | before | after | plate |
|---|---|---|---|
| rims | 1 `TorusGeometry(5, ...)` | 3 concentric: outer, 0.62 R, 0.33 R | 3 |
| spokes | 8 plain box beams | 20 PAIRED beams (40), straddling a bulb string | ~20 paired, lit |
| cars | 8 gondolas hung INSIDE and below (`y -0.9`) | 20 tall lantern cars on brackets, riding the OUTSIDE of the rim, lit windows, level at every angle | ~20 outside, lit |
| rim lighting | none | 40 rim bulbs + 3 per spoke = 100 | continuous bulb string |
| hub | plain teal cylinder | lit brass boss with a glowing core | lit brass boss |
| base | flat 7x1.2 plank + two feet | fenced circular platform, 2 rails + 24 posts, teal current pylon into the hub | fenced circle + teal pylon |

**Framing (F-OMB-3).** Apex at the standard station, PLAIN boot:
**y -66.5 -> +10.9 (1280)** and **-70.2 -> +11.5 (390)** — inside the frame on both.

**F-POC-2 — "mobile HUD/haze obscure the upper wheel" was never a mobile defect, and the wheel
station is not the landmark station.** The camera is pitched down, so how tall a thing may stand and
still be framed is a function of the PLAYER's stand-off, not the viewport.
`wheel-standoff-probe.mjs`, tallest apex that still projects to y >= 8 px:

| player stands | 8 | 10 | 12 | 14 | 16 | 18 | 20 | 24 |
|---|---|---|---|---|---|---|---|---|
| desktop 1280x800 | 11.35 | 10.15 | 9.1 | **8.0** | 7.0 | 6.05 | **5.25** | 3.95 m |
| mobile 390x844 | 11.40 | 10.15 | 9.1 | **8.05** | 7.0 | 6.05 | **5.25** | 3.95 m |

The two viewports are the same number to within 0.05 m. The shipped apex was
`(6.2 + 5) x 0.74 = 8.288 m`, framed only from inside 14 units — and the harness stations the wheel
at **20** back (`BACK + 6`) while it stations every landmark at **14**. That extra 6 is what produced
-66.5 / -70.2. The clipping is real (any station past 14 cuts the top), but it is a stand-off
effect, not a mobile one, and the 20-back station is stricter than the one the five landmarks were
judged at.

**Cost of the fix, and it is the real cost:** meeting the acceptance at 20 back caps the apex at
5.25 m, so the wheel's topmost lantern roof now sits at 7.005 local = **5.18 m** world, down from
8.288 m. Its half-width including the cars falls from 3.70 m to 2.57 m (-31 %). The lowest car's
floor sits at -0.10 m, behind the plate's own fence. One constant (`RIM`) and one (`HUB`) dial this
back if the owner prefers a taller wheel framed only from closer in.

**Cost table (4 runs per arm, same host session)**

| | before | after |
|---|---|---|
| draw calls, desktop | 110 | **90** |
| draw calls, mobile | 91 | **72** |
| triangles, desktop | 135,268 | 142,176 (+5.1 %) |
| frame p95, desktop | 8.8 / 9.0 / 9.1 / 9.2 | 10.0 / 9.9 / 10.2 / 10.1 |
| frame p95, mobile | 9.1 / 9.1 / 9.1 / 9.0 | 10.1 / 10.2 / 10.0 / 10.0 |

Draw calls go DOWN because everything repeated that does not move independently is one
`InstancedMesh` (40 spoke beams, 100 bulbs, 20 brackets, 24 fence posts, and the three car parts);
the cars are the only instances rewritten per frame, and they do exactly what the gondola groups
used to do.

**The p95 rise is the host, not the wheel — and there is a control for it in the same sweep.**
`e3-blackout-ridge` gained no geometry in this task (triangles 134,880 -> 134,878) and its p95 moved
by the same amount over the same session: 9.2 / 8.9 / 9.2 / 9.1 -> 10.0 / 9.8 / 10.0 / 10.0. Medians:
fairground 9.05 -> 10.05 (+11 %), blackout control 9.10 -> 10.00 (+10 %). An intermediate fairground
arm taken an hour earlier read 9.8 / 9.7 / 8.9 / 9.1 (median 9.4, +3.9 %). All arms are inside the
15 % bar and the change's own contribution is at the noise floor.

**F-POC-4 — the wheel is now inside the frame and under the mobile HUD.** At the 20-back station its
box coverage rises (line box 29.7 % -> 50.0 % desktop, 42.1 % -> 61.5 % mobile; persistent-HUD
23.4 % -> 39.1 % and 42.1 % -> 61.5 %), for the same arithmetic reason as F-POC-1: the box got
shorter while the HUD did not move, and on 390 px the persistent cards own the top 255 px of an
844 px screen. Moving the HUD is explicitly excluded by the master, so this is recorded, not acted
on. It is the argument for choosing a closer acceptance station rather than a smaller wheel.

**Gate table**

| gate | result |
|---|---|
| `e2e/e3-fairground.spec.ts` + `e2e/e3-fairground-flocks.spec.ts`, both projects | 6/6 pass, specs unmodified |
| plain boot console/page errors | 0, both viewports |
| tsc / `npm run build` / `GR_RELEASE=e1 npm run build` | rc=0 / rc=0 / rc=0 |

Screenshots: `before/` vs `after/` `fairground-plain-{desktop,mobile}.png` and
`fairground-station-ferris-wheel-{desktop,mobile}.png`;
`after/plain-boots/e3-fairground-plain-{1280,390}.png`; HUD-free shape shots for the plate
comparison in `after-item3/wheel-closeup-{9,14}back-{desktop,mobile}.png`.

---

## 4. F-OMA-3 — the Long Road's card names its errand

**Lever pulled:** `assets/contracts/epoch-4-motor/contracts.json`, `e4-long-road.briefing.goals`
only.

| | text |
|---|---|
| before | "Follow the long west-east road between three old way-stations." / "Build around the station grounds and watch every verge." |
| after | "Bring the town's convoy east down the long road to the far railhead." / "Hold the three way-station grounds and watch every verge it must pass." |

The win is `MotorSocket.objectiveAllowsSecure` (`src/sim/MotorSocket.ts:259`) — the convoy at the far
end of `tileParams.convoyRoute`, `(190, 0)`. "the far railhead" is the map's own word for it
(`twist.motorFrontier.convoy.label`), so the card and the engine now say the same thing. Two lines,
same shape, no firearms. `rules` and `geographyLine` still carry the road, the three way-stations and
the spawn edges, so no geography was lost. Rendered on the real card, captured on a plain boot at
both viewports: `after/plain-boots/e4-long-road-briefing-{1280,390}.png`, goals read back from the
DOM in `plain-boots.json`.

**Pins:** none had to be re-pointed. The sentence appears in exactly one tracked source file
(`grep` over `e2e/`, `scripts/`, `src/`, `assets/`, `docs/`, `specs/`, `lore/`, `site/`,
`functions/`, `server/`, `bench/`, `foundry/` -> only `assets/contracts/epoch-4-motor/contracts.json`).
`scripts/e4-roads-and-convoys.test.mjs` pins EVENT-log hashes, not the view; `e2e/er01-e4-census.spec.ts`
asserts engine dependencies, bench seeds and manifest rules, never briefing text; `e2e/fixtures/`
carries only E1 manifests.

**Gate table**

| gate | result |
|---|---|
| `node --test scripts/e4-roads-and-convoys.test.mjs` | 11/11 pass |
| `e2e/er01-e4-census.spec.ts`, both projects | 8/8 pass |
| `e2e/e4-roads-and-convoys.spec.ts`, both projects | 4 reds, all attributed — below |
| plain boot `e4-long-road` | 0 console/page errors, 1280 and 390 |

**F-POC-5 — attribution of the four `e4-roads-and-convoys.spec.ts` reds.**
`:69` "every Motor reel replays to its claimed hash" fails on `assay replay failed: malformed tape`
for `artifacts/e4-roads-and-convoys/e4-dust-flats-floor.tape.json` on BOTH projects. Reproduced on a
control tree with this edit reverted (`git checkout --` the one file, same server, same command) ->
**pre-existing**, and it is the inventory's own row
(`logs/suite-red-inventory.md:1689`, F-OMA-5, "the fixture predates ADR-005"). Note that
`node scripts/red-inventory-lookup.mjs e2e/e4-roads-and-convoys.spec.ts` prints NOT-IN-INVENTORY with
a STALE SNAPSHOT warning (37 days, threshold 7) — the row is in the markdown, the tool's snapshot
predates it, so the control run is the evidence, not the lookup. `:123` (desktop and mobile) and
`:197` (mobile) are contention flakes: each is green alone on its own project on a re-run.

---

## 5. F-BMB-2 — the Salvage Claw's rotted sidecar

**Lever pulled:** `assets/pilots/salvage-claw-3d/salvage-claw-detail-opus5-asset-contract.json`,
`detail` re-measured from the GLB on disk with the guard's own reader (`parseGlb` + `inspect` from
`scripts/glb-contract-guard.mjs`).

| field | declared (the 2026-09-10 duel candidate) | measured on `salvage-claw-detail-opus5.glb` |
|---|---|---|
| triangles | 30,100 | **30,844** |
| bytes | 7,131,704 | **4,323,572** |
| atlas | 2048^2 | **1024^2** |
| sha256 | `9027a145...` | **`3ae8420b...`** |
| bounds min/max | +-5.7 / 9.965369 | **+-7.246606 / 12.042174** (size 14.493212 x 12.042174) |
| nodes / meshes / primitives / materials / images / morph targets | winch, anchor_feet, crown / 3 / 3 / 1 / 1 / 3 | identical, unchanged in value |

`triangleRatio` follows (2.961 -> **3.0346** = 30,844 / 10,164) and `runtimeGuard` is re-pointed from
"adopting this model is a one-integer edit: 10164 -> 30100" to the completed adoption it now
records (`src/systems/SalvageClawBossSystem.ts:17` reads `MODEL_TRIANGLES = 30_844`; the sidecar's
`line: 16` pointed at `MODEL_URL`). A `note` in `detail` names the 2026-09-12 fidelity land and
F-BMB-2 and says that `checked`/`reexported` are kept as the candidate's build record.

The `shipped` block was re-measured too and is **correct as it stands**: `salvage-claw.glb` is on
disk at 2,056,584 B / 10,164 tri / 1024^2 / bounds +-5.7 / 10.031203. Only `detail` had rotted,
exactly as F-BMB-2 said.

**CONFIRMED — `scripts/glb-contract-guard*.mjs` does not read this sidecar.** `contractFor`
(`glb-contract-guard.mjs:386-391`) resolves a sibling contract as `<asset>-contract.json`, i.e.
`salvage-claw-detail-opus5-contract.json`, which does not exist; this file is
`<asset>-asset-contract.json`. Verified by reading the resolution code and by the guard's output
being identical across the edit.

**Gate table**

| gate | before | after |
|---|---|---|
| `node scripts/glb-contract-guard.mjs` | 423 GLBs / 6 violations / 6 grandfathered / 0 live | identical |
| `node --test scripts/glb-contract-guard.test.mjs` | — | 23/23 pass |

---

## 6. F-BMB-3 — the E5 p95 gate made mode-aware

**Lever pulled:** `e2e/e5-boss-dredge-queen.spec.ts` only. Each arm is sampled `P95_SAMPLES = 5`
times back to back and the arms are compared FLOOR to FLOOR; the raw series for both arms goes into
the log line and into a `dredge-queen-frame-p95.json` attachment; `VSYNC_PLATEAU_MS = 15` detects and
PRINTS the one case the clock hides (both arms pinned to the vsync plateau, where the ratio is ~1.0
whatever the boss costs). The intent is unchanged: a boss floor more than 15 % above the non-boss
floor still fails. The floor is the right estimator because the noise is one-sided — a vsync lock, a
compositor hiccup or another agent on the box makes a sample slower, never faster.

**Proof, 4 runs per project on this tree, before and after, same host, same command:**

| run | BEFORE desktop | BEFORE mobile | AFTER desktop | AFTER mobile |
|---|---|---|---|---|
| 1 | 0.9902 (10.2 / 10.1) | **1.1628 RED** (8.6 / 10.0) | 1.0000 (8.8 / 8.8) | 0.9886 (8.8 / 8.7) |
| 2 | 0.9700 (10.0 / 9.7) | 0.9208 (10.1 / 9.3) | 1.0115 (8.7 / 8.8) | 1.0000 (8.4 / 8.4) |
| 3 | 0.9307 (10.1 / 9.4) | 1.0326 (9.2 / 9.5) | 1.1176 (8.5 / 9.5) | 1.0706 (8.5 / 9.1) |
| 4 | 0.9798 (9.9 / 9.7) | 0.9897 (9.7 / 9.6) | 1.0000 (8.4 / 8.4) | 1.0000 (8.4 / 8.4) |
| | **1 red of 8**, spread 0.24 | | **8 green of 8**, spread 0.13 | |

(pairs are non-boss / boss, ms; BEFORE are single p95s, AFTER are the arms' floors over 5 samples.
Raw logs: `work/e5-p95-before.log`, `work/e5-p95-after.log`.)

The false red at 1.1628 was produced on an UNCHANGED tree, which is the finding stated as a
measurement rather than as three drains' testimony. After the change the centre moves to ~1.00 —
the boss arm costs about what the tile costs, which is the answer the single-sample gate could not
state.

**The test's title is deliberately unchanged** so the `logs/suite-red-inventory.md` rows that name it
(`:174`, `:1470`) still resolve; the test moved from line 237 to 269.

**Gate table**

| gate | result |
|---|---|
| `e2e/e5-boss-dredge-queen.spec.ts` full file, both projects | **8/8 pass** |
| the p95 test alone, 4 runs x 2 projects, after | 8/8 pass |
| plain boot `e5-deepwater-claim` | 0 console/page errors, 1280 and 390 |

---

## Whole-branch gates

| gate | result |
|---|---|
| `npx tsc --noEmit` | rc=0 (`work/tsc-final.log`) |
| `npm run build` | rc=0 (`work/build-final.log`) |
| `GR_RELEASE=e1 npm run build` | rc=0 (`work/build-e1-final.log`) |
| plain boots, no `?debug`, `e3-blackout-ridge` / `e3-fairground` / `e4-long-road` / `e5-deepwater-claim` at 1280 and 390 | **8 of 8 boots, 0 console errors, 0 page errors**, each on its own contract (`after/plain-boots/plain-boots.json`) |
| e2e, both projects, `--workers=1`, port 5312 | `e3-blackout-ridge` 4/4 · `landmark-brightness` 4 passed / 4 skipped · `e3-fairground` + `e3-fairground-flocks` 6/6 · `er01-e4-census` 8/8 · `e5-boss-dredge-queen` 8/8 · `e4-roads-and-convoys` 4 reds, all attributed (F-POC-5) |
| `GR_GUARD_NO_ARTIFACT=1 node scripts/run-guards.mjs --changed-since 7ff3e1b27` | selects the base gate only (`test:node-guards`, `test:power-budget`, `test:task-guards`, `test:citations`, `test:gate-callers`); no path rule matched, so it was run as the full battery below |
| full `npm run test:node-guards`, Node 26 | 918 tests, 906 pass, 7 fail, 5 skipped — every red attributed in the section below (3 x the drain-owned engine pin, 1 x the linked-worktree refusal, 3 x contention, each green alone) |
| engine era | hash reported, `assets/engine-era.json` untouched — the pin is the drain's; `engine-era-guard` is red by design until it lands |
| artifact churn | tracked `.png` files the e2e runs rewrote under `artifacts/**` and `reviews/shots-*` were restored with a path-scoped `git checkout --` before every commit; only files this task created are committed |

## The full node-guards battery (Node 26, `GR_GUARD_NO_ARTIFACT=1 npm run test:node-guards`)

**918 tests, 906 pass, 7 fail, 5 skipped** (`work/node-guards-full.log`). The runner itself printed
`CONTENDED — 2 concurrent batteries` at the top, so the transcript was read child by child rather
than trusted at the top line. All seven are accounted for:

| red | cause | evidence |
|---|---|---|
| `scripts/engine-era-guard.test.mjs:65` | "engine hash `293e4c1b…` is absent from era 6" | BY DESIGN — `assets/engine-era.json` is the drain's and is untouched here (F-POC-7) |
| `scripts/bench-seeds.test.mjs:47` "rotation registry stays outside the engine identity corpus" | asserts the live hash equals the era pin: `293e4c1b…` vs `5a00e9a0…` | the same pin, stated a second way |
| `scripts/fixture-teardown.test.mjs:32` | its ONLY failing child is `scripts/bench-seeds.test.mjs` with the identical hash assertion | an echo of the row above — the sweep reports its children's failures as its own |
| `scripts/desk-declaration-guard.test.mjs:163` | "REFUSING — this is a linked worktree and its STATUS.md line-1 is NOT the one main carries" | environmental and deliberate (F-2232-1/-2241-1/-2242-1); the same refusal both 2026-09-18 open-maps drains recorded from their own scratch worktrees |
| `scripts/node-guards-contention.test.mjs:124` | "node-guards board did not stay quiet for 300ms" | contention — **green alone** on a quiet box |
| `scripts/secure-choice-refusal.test.mjs` | — | contention — **green alone** |
| `scripts/rider-parity-retirement.test.mjs` | — | contention — **2/2 pass** when run as the only file in its own `node --test` invocation; still red when batched with the two above |

Nothing in that list is a defect this branch introduced: three are the one engine-hash pin the drain
owns, one is the linked-worktree refusal, and three are the box.

## Findings

* **F-POC-1** — the Blackout "% HUD-covered" numbers (54.7 / 37.5 / 23.4 at 390 px) are ENTIRELY the
  transient `.hud__wave` announcement band; the persistent HUD covers 0.0 % of all five bodies on
  both viewports. Because the band is a fixed 53 px and a trim shortens the body, the prescribed
  trims raise the number: measured 54.7 % -> 68.8 % at scale 0.8 on a control arm. The two trims were
  therefore NOT made. If the metric is wanted at all it should be re-defined against the persistent
  HUD, or the announcement band moved — a HUD change, outside this firewall.
* **F-POC-2** — F-OMB-3's "390 px" framing defect is viewport-INDEPENDENT: the tallest framed apex is
  the same number on 1280x800 and 390x844 at every stand-off (11.35/11.40 at 8 back ... 5.25/5.25 at
  20 back). What differs is the stand-off, and the capture harness stations the wheel at 20 back
  while it stations every landmark at 14. A future acceptance should declare the station distance,
  the way the secure-wave instrument now declares its strategy.
* **F-POC-3** — `e3-blackout-ridge` was NOT short of the headroom F-OMB-4 assumed: at the calibrated
  default it already read 1.297x its terrain, above the night control (0.744) and above The Claim's
  signed-off grade. The defensible target was its era sibling's absolute level, and reaching it
  needs the cap. The row's authored 4 is the only value in the table above the legacy default, so
  the `?lighting=legacy` harness arm now shows this map brighter than its history. Harness-only,
  recorded here and in the code comment.
* **F-POC-4** — bringing the wheel inside the frame puts it under the mobile HUD: persistent-HUD
  coverage of its box rises 23.4 % -> 39.1 % (desktop) and 42.1 % -> 61.5 % (390 px) at the 20-back
  station, because the 390 px HUD owns the top 255 px of an 844 px screen. Not acted on (HUD files
  are firewalled). Two levers exist: a closer acceptance station, or the HUD.
* **F-POC-5** — `e2e/e4-roads-and-convoys.spec.ts:69` "malformed tape"
  (`e4-dust-flats-floor.tape.json`) is pre-existing, reproduced on a control tree, and already an
  inventory row; `:123` and `:197` are contention flakes, green alone. Separately:
  `scripts/red-inventory-lookup.mjs` answered NOT-IN-INVENTORY for a spec that HAS a row, because
  its snapshot is 37 days old against a 7-day threshold — the tool said so itself, and a drain that
  trusted the verdict instead of the warning would have called a known red new.
* **F-POC-6** — F-BMB-2 named `detail` as the rotted block, but `triangleRatio` (2.961) and
  `runtimeGuard` (`shipped: 10164 / required: 30100`, `line: 16`) were derived from it and were
  rotted with it; all three moved in this commit. `shipped` was re-measured and is accurate.
* **F-POC-7** — the engine hash moved (four of eight touched files are `ENGINE_SOURCE_INPUTS`
  members). `assets/engine-era.json` is untouched per the firewall, so `engine-era-guard.test.mjs`
  is red on this branch by design; the drain appends the same-era pin with its cause.

## What was touched

`assets/pilots/map-rebuild-spike/blackout-ridge-terrain-contract.json`,
`assets/pilots/map-rebuild-spike/landmarks/blackout-ridge/blackout-ridge-landmark-pack-contract.json`,
`assets/pilots/map-rebuild-spike/landmark-collision-contract.json`,
`src/world/Terrain3dClaimPilot.ts` (one table line + its comment),
`src/entities/FerrisWheel.ts`,
`assets/contracts/epoch-4-motor/contracts.json` (`e4-long-road.briefing.goals` only),
`assets/pilots/salvage-claw-3d/salvage-claw-detail-opus5-asset-contract.json`,
`e2e/e5-boss-dredge-queen.spec.ts`,
and `artifacts/post-open-maps-correctives/**` (new). Eight files, all inside the firewall; nothing
under `scripts/`, `tasks/`, `STATUS.md` or `assets/engine-era.json` was written.
