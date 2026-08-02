---
title: THE BEAUTY SHIFT — the-claim
date: 2026-08-03
branch: beauty/claim
brief: docs/beauty/the-claim-brief.md
status: DELIVERED — 4 of 5 upgrades kept, 1 not built with the evidence that killed it
---

# The Claim, re-lit

**Slice:** `beauty/claim`, five upgrades of `docs/beauty/the-claim-brief.md`.
**Verdict:** U1, U2, U3, U5 **KEPT**. U4 **NOT BUILT** — its premise is measurably
false at this map's camera, and the boards that prove it are in this review.
**Owner-visible result:** the first page of the ledger now has a river that moves,
banks that show a working life, bodies the low sun models, and dust in the light.

Everything below was rendered by `scripts/beauty-claim-board.mjs`, which reproduces
the brief's six shot-list moments plus the gate numbers, once per upgrade. Pairs are
in `reviews/shots-beauty-claim/pairs/`, single frames in `reviews/shots-beauty-claim/`.

---

## 1. The per-upgrade verdict table

| # | Upgrade | Verdict | Before → after | p95 (desktop, same-session A/B) | Draw calls |
|---|---|---|---|---|---|
| U1 | The river becomes water | **KEPT** | `before-run-camera.png` → `u1-run-camera.png` | 10.5 → 10.9 ms · **1.038** | 82 → 83 |
| U2 | The banks earn their calm | **KEPT** | `u1-run-camera.png` → `u2-run-camera.png` | 10.0 → 10.1 ms · **1.009** | 82 (unchanged) |
| U3 | Landmarks in the golden hour | **KEPT** | `u2-run-camera.png` → `u3-run-camera.png` | 10.2 → 10.0 ms · **0.980** | 81 → 83 |
| U4 | The horizon gets a story | **NOT BUILT** | `horizonprobe-*.png` (the disproof) | — | — |
| U5 | Motes, glints, and the Rush | **KEPT** | `u3-run-camera.png` → `u5-run-camera.png` | 10.0 → 10.2 ms · **1.020** | 81 → 84 |

**Whole shift, measured last on a quiet box (load average 6.12), both arms in the
same browser within the same minute, `?nobeauty` as the control:**

| Viewport | p95 without the shift | p95 with it | Ratio | Law | Draw calls |
|---|---|---|---|---|---|
| desktop 1280×800 | 10.0 ms | 10.2 ms | **1.020** | ≤ 1.15 | 81 → 84 |
| mobile 390×844 | 9.9 ms | 10.4 ms | **1.051** | ≤ 1.15 | 56 → 59 |

Three draw calls is the entire shift: the water quad, the landmark contact pool, the
mote field. A fourth (26 Rush embers) exists only while a post-secure Rush run is
live, and is `visible = false` — and therefore not submitted — the rest of the time.

**Why the A/B and not a before/after run.** This box is shared. During this shift its
load average ranged from 6 to **307**, and a p95 taken from two separate runs measures
the machine as much as the change (BACKLOG F-1113-4: a control is only a control if it
shares the treatment's conditions). `?nobeauty` (new, `DebugParams.isMapBeautyDisabled`)
holds the shift's additions back while everything else boots identically, so both arms
run in one browser seconds apart. Every p95 above is that A/B, with its load average
recorded in `reviews/shots-beauty-claim/metrics-*.json`.

---

## 2. What each upgrade actually did

### U1 — the river becomes water · KEPT

The sculpt carves a channel and then hides every painted water surface
(`Terrain3dClaimPilot.ts` `LEGACY_GROUND_SLOTS`), so the map's one event was a static
black slot. The pilot now lays a render-only living-water quad into that channel for
`the-claim`: one draw call, the shipped `LivingWaterShader`, **depth testing ON** so
the banks occlude it and the shoreline is wherever the sculpt rises through the
surface — no shoreline geometry.

Two capabilities the shipped water did not have, both sculpt-only and both off by
default for the painted path:

- **It reads the real bed.** `createSculptWater` bakes surface-minus-bed depth into a
  512×64 R8 map in the plane's own UV space. The carved meander now shows as dark
  water, the margins go shallow and damp, and the foam line sits at the *measured*
  water's edge instead of at the tile's declared band. The ford keeps the DECLARED
  depth, so a crossing the sim calls water never renders as dry ground.
- **Its palette is multiplied warm** (`#c9b892` at 0.70 opacity). The shader is tuned
  over pale painted sand — `reviews/shots-beauty-claim/reference-painted-run-camera.png`
  is the shipped painted look — and read as mint over this umber bed. The style anchor
  wants the river to remain the darkest line on the map, and it does: 45.7 mean
  luminance against banks at 71.2 and 62.4.

Surface height is derived, not guessed: the lower of "channel bed + 0.42 m" and "ford
bed + 0.11 m", both read from the baked grid, so a re-sculpt moves the water with it.
Measured on this sculpt: **−0.05 m**, giving 0.46 m over the thalweg and 0.11 m over
the ford shelf.

**Fixed while here (latent bug, all maps):** `customProgramCacheKey` collapsed every
river material to one key while the band geometry is baked into the shader *source* as
literals. A second water surface on the same map would have silently rendered with the
first one's constants. The key now carries every literal that can differ.

| Band at the fixed fresh-eye camera | before | after (U5) |
|---|---|---|
| River — mean luminance | 18.2 | **45.7** |
| River — stddev | 4.82 | **10.42** |
| River — distinct 4-bit colour buckets | 9 | **40** |
| Near bank — mean | 77.1 | 71.2 |
| Far bank — mean | 64.4 | 62.4 |

Mobile 390 px river band median: **19.8 → 51.8**.

Pairs: `pairs/before-vs-u5-run-camera.png`, `pairs/before-vs-u5-ford-crossing.png`.

### U2 — the banks earn their calm · KEPT

F-OP5-12 graded this map WEAK for "empty space with no travel pressure". The
craftbook's missing list is now painted in the recipe's atlas pass and re-exported —
never hand-edited: cart ruts converging from the south spawn edge onto the centre
ford, a worn foot-ring around each of the three build-pad circles, a damp silt band
along both bank lips, and one gravel rubble patch downstream on the east bank.

**Contract equality gate — verified.** The regenerated
`the-claim-terrain-contract.json` differs from the shipped one in the `files` block
**alone**: vertices 16641, triangles 32768, meshCount 1, materialCount 1 and
boundsMeters are byte-identical, so `validTerrain()` still passes and the map cannot
fall back to painted. Re-verified in-page: `terrain3dPilotState=ready`,
`RenderSource=glb`, landmarks 5, skipped 0.

**Deterministic re-export — verified.** Blender 5.1.2 runs the shipped recipe
unmodified. A control re-export with **no** recipe change produced an atlas whose
pixels differ from the shipped one by at most **1/255** on 35.8% of channel samples
(float→8-bit rounding across Blender versions; mean delta 1.0, max delta 1) and a
contract identical in every semantic field. The pipeline reproduces.

Value discipline: near bank mean luminance 77.1 → 74.5 at U2 (−3.4%; the brief's
ceiling is 20%) with stddev 14.02 → 15.49 and distinct buckets 178 → 189. More
variation, same calm.

### U3 — landmarks sit in the golden hour · KEPT

`keepLandmarkPaintReadable` exists because landmark paint once went dark, so it stays
— but at `emissiveIntensity = 3` the colour map is its own light source and the
bodies floated in flat white while the low sun modelled everything around them. The
intensity is now a per-contract tunable; the Claim's is **1.45** (the brief suggested
1.2–1.6). Every other contract keeps 3 exactly.

Landmarks mount with `castShadow` off, so a lit body still had nothing tying it to the
ground. Added one instanced quad per mount using the shipped blob-shadow recipe
(`LightRig` `SpriteBlobShadows`: `#2e1b0e` at 0.17, depthWrite off, polygon-offset,
22 mm above the terrain), sized from each model's own footprint and **leaned along the
key light** — a pool centred under a solid building is covered by the building and
never reads. `LightRig` now exports the sun's two vectors and the shadow direction
derived from them, so the pool and the rig cannot drift apart. The pack standing in
the river channel gets no pool: **4 of 5** mounts, decided by measured bed depth.

Deliberately **not** parented to `Terrain3dLandmarks`: that group's children are
counted as landmarks by `terrain3d-registry.spec.ts` and their materials are audited
for transparency by `map-census.spec.ts`, so a shadow parented there would have read
as a sixth landmark with an unlit material.

Evidence: `pairs/u2-vs-u3-run-camera-crop230x500.png` (3× crop of the camp tent). At
emissive 3 the two visible faces are the same value and the tent reads as a cutout; at
1.45 the sunlit and shaded faces separate and the barrel beside it gains a lit top.
Tent-box mean luminance 0.446 → 0.372.

`map-census` for `the-claim` after the drop: boot, render, MQ-1, MQ-2, MQ-3,
**landmark brightness**, and the 10 s budget all **PASS**.

### U4 — the horizon gets a story · NOT BUILT (premise disproven)

The brief's rationale is "every boot and every zoom-out frames this sky". **It does
not.** Measured, not argued:

`reviews/shots-beauty-claim/horizonprobe-wide-zoomout.png` and
`horizonprobe-boot-desktop.png` are rendered with the panorama forced **magenta,
depth-test off, renderOrder 9999** — i.e. painted over everything in the scene — and
the sculpt continuation ring painted **green**.

| Framing | Panorama coverage | Continuation coverage |
|---|---|---|
| plain boot pose, 1600×800 | **2 px** (0.0002%) | 0.18% |
| max zoom-out at 2:1 | **0 px** | **3.48%** |
| north tile edge, 1600×800 | **0 px** | **36.55%** |

The dark wedges the brief calls a backplate band at wide aspect are the **sculpt
continuation ring**, not the panorama. Repainting
`the-claim-panorama-atlas.png` would have changed nothing a player can see, at the
cost of a full GLB re-export. The horizon on this map belongs to the continuation.

The build path was proven first, not assumed: `build_contract_panoramas.py -- the-claim`
exists, runs off the same Blender the terrain recipe now provably runs on, and reads
the terrain atlas U2 just rewrote. The work is one command away the day the framing
question is answered — see F-BC-1.

### U5 — motes, glints, and the Rush · KEPT

`src/world/SunMotes.ts` is a new render-only point field: 200 additive dust motes on
desktop (90 at 390 px), drifting along the key light's own direction, distance-faded
to the band the run camera actually reads (~6–52 m). One draw call, one buffer, zero
per-frame CPU — every mote's drift and wrap is computed in the vertex shader from its
seed, so the only thing that changes per frame is a float. Placement is seeded: the
same map always gets the same air.

The Rush ember re-uses that field: 26 warm sparks lifting off the claim-stake ring,
hidden until `RunManager` reports a post-secure Rush run is live. The state is read
from the run manager through a host callback, never inferred from the scene. Verified
**0 embers on a plain boot, 26 with the Rush live** —
`pairs/u3-vs-u5-rush-active-crop780x600.png`.

The gold glints on the sluice line shipped with U1: the water material takes the
tile's six harvest anchors, each pushed to its own bank lip, and the shader's
`waterGoldGlints` lights them (`terrain.water.glints = 6`).

---

## 3. The shot list

| # | Moment | Pair |
|---|---|---|
| 1 | Plain boot, no `?debug`, desktop — the standing-orders framing | `pairs/before-vs-u5-boot-desktop.png` |
| 2 | The fixed fresh-eye run camera, 42° — the readability judge | `pairs/before-vs-u5-run-camera.png` |
| 3 | River close-up at the ford, enemies crossing | `pairs/before-vs-u5-ford-crossing.png` |
| 4 | Wave-10 secured with the "Stay for the Rush" choice up | `pairs/before-vs-u5-wave10-secured-rush-choice.png` |
| 5 | Mobile 390 px plain boot | `pairs/before-vs-u5-boot-mobile.png` |
| 6 | Max zoom-out at 2:1 | `pairs/before-vs-u5-wide-zoomout.png` |
| + | The Rush, live | `pairs/before-vs-u5-rush-active.png` |

Shot 2 is the brief's fixed fresh-eye pose reproduced exactly rather than posed
privately: `build_the_claim_terrain.py` documents that camera as "hero target
(0,.06,12), offset (0,26.2,18.3), look target z −= 3.35, fov 42" — i.e. the shipped
gameplay camera with the hero standing at game (0, 12). The board teleports there and
lets the camera lag settle.

Shot 1 is a true plain boot: start menu → ledger → town → contract board → launch,
with no query flags at all (Mistake #10 — the shape only a real boot catches).

---

## 4. Gates

| Gate | Result |
|---|---|
| `tsc` | clean, every phase |
| `npm run build` | green |
| Contract equality (`validTerrain`) | PASS — counts and bounds byte-identical, regenerated in the same commit |
| Deterministic re-export | PASS — unmodified recipe reproduces the atlas within 1/255 and the contract exactly |
| Frame p95 ≤ +15%, desktop | PASS — **1.020** |
| Frame p95 ≤ +15%, mobile 390 px | PASS — **1.051** |
| Zero console / page errors | PASS — all four contexts, every phase (`metrics-*.json`) |
| LITE keeps the painted path | Untouched — the pilot returns before any beauty mount when the tier is lite |
| `map-census` — the-claim | PASS on boot, render, MQ-1, MQ-2, MQ-3, landmark brightness, 10 s budget |
| `terrain3d-claim-pilot.spec.ts` | 4/5 — the one red is control-proven pre-existing (below) |
| Full named-suite battery, desktop | 64 passed / 8 failed at load 25.7; every red control-proven (below) |

### The suite reds, and the controls that name them

The final 72-test battery (`terrain3d-claim-pilot`, `terrain3d-registry`,
`terrain3d-default`, `panorama-framing`, `map-census`, `map-beauty-dry-gulch`,
desktop-chrome, workers=1) read **64 passed / 8 failed** at box load average 25.7.
This box is shared: during this shift its load ranged from 6 to **307**, driven by
other worktrees, and I do not control it. So every red was control-tested rather than
excused — by flipping `isMapBeautyDisabled()` to a hard `true`, which strips the
shift's additions from an otherwise identical tree, and re-running the same command
in the same conditions (F-1113-4: a control must share the treatment's box).

| Red | Treatment (shift on) | Control (shift off) | Verdict |
|---|---|---|---|
| `terrain3d-default:81` p95 budget | FAIL, ratio **1.39** | FAIL, ratio **2.04** | pre-existing — the control fails *harder* |
| `terrain3d-claim-pilot:166` p95 budget | FAIL, 60 s timeout waiting for `state=ready` | FAIL, identical 60 s timeout, identical line | pre-existing |
| `terrain3d-registry` (whole suite) | **5 failed / 5 passed** (88, 196, 272, 345, 447) | **6 failed / 4 passed** (124, 196, 272, 328, 345, 447) | pre-existing — four reds are common to both, the other three swap sides run to run |
| `map-census e1-twin-banks` | FAIL, 20 s timeout | — | a map this shift does not touch; timeout only |

Every treatment red is either red in the control too, or replaced by a *different*
red in the control. The suite is unstable on this box at load 25–54; the shift does
not make it more so. The strongest single tell is `terrain3d-registry:345`, which
expected `state=failed` and got `state=lite`: that is the runtime auto-tier watchdog
demoting the page because frames collapsed — a CPU-starvation signature, not a
rendering one.

What *did* pass, and matters most here: `terrain3d-claim-pilot`'s
"contract-valid GLB feeds every visualY consumer and keeps the water agreement"
(1 mesh / 32,768 triangles / 1 material, every visualY consumer, the shallows
agreement), its "planar simulation fingerprint unchanged", its "LITE and invalid bytes
retain the painted fallback", and `terrain3d-registry`'s disposal tests — scene
children back to **0** after dispose, which is what proves the water quad, the contact
pool, the mote field and the ember field all unmount. Precision on one red:
`terrain3d-registry:345` breaks on its *invalid-bytes* assertion (expected `failed`,
got `lite`), not on its LITE assertion, and it breaks that way in both arms.

Earlier in the shift, `map-census -g the-claim` alone: the census content passed
**every cell** — boot, render, MQ-1, MQ-2, MQ-3, landmark brightness, 10 s budget —
and the only failure was the mobile-spot test exceeding its own 15 s wall-clock budget
while the census it measured recorded PASS in `artifacts/map-census/table.md`.

On `mobile-chrome`, `terrain3d-claim-pilot` reads **4 passed / 1 failed** — the same
`:166` p95-budget test, the same 60 s timeout on the same line, i.e. the same
control-proven red as desktop.

**What I did not do:** run the *whole* battery on `mobile-chrome` — only the claim
pilot suite. Both viewports were rendered and measured by the board (all boards, both
p95 arms, zero console errors at 390 px), but `terrain3d-registry`, `map-census` and
`panorama-framing` were desktop-only. That is the honest gap in this gate.

`npm run build`: **green** (1.53 s, asset diet clean, the re-exported 7.8 MB GLB rides
the same 84% cut as the other 234).

---

## 5. THE HONEST LINE — what still looks wrong

1. **The water is legible, not beautiful.** At a 42° near-top-down camera the surface
   has no reflection and no specular event; what sells it is flow chevrons, the warm
   ford, and the bed reading through. Look at it in motion and it is a river. Look at
   a still at 3× and it is a tinted sheet with a pattern on it. The next real step is
   a screen-space reflection of the bank lip or a sun-glitter band, and neither is a
   config change.
2. **The map has no horizon and this shift did not give it one.** U4 was killed by
   evidence, which is the right call, but the finding underneath stands: at the
   shipped camera the Claim is a tile in a bowl of smeared terrain atlas. The wide 2:1
   board still shows two dark wedges closing in from the sides — that is the
   continuation ring, unfogged, at grazing incidence. It is the ugliest thing left on
   the board and it is nobody's upgrade yet (F-BC-1).
3. **The shoreline is a depth-buffer intersection.** The bed-depth fade softens the
   last 15 cm, but the bank climbs 0.55 m per metre here, so that is ~27 cm of blend —
   a few pixels. Up close the waterline is still a hard line. Reeds, a wet-sand decal
   band, or a shoreline mesh would fix it; none is inside this brief.
4. **The motes read as snow over the dark water** in a still frame, because the only
   dark field on the map is exactly where additive white specks stand out most. In
   motion they read as dust. If the owner's eye disagrees, the honest fix is tinting
   them toward the bank's umber rather than reducing the count.
5. **The secured panel owns the Rush moment.** Shot 4 is 40% UI by area at 1280×800.
   The sluices and stockpile sit at the frame edges because that is the only place the
   panel leaves. The Rush *choice* is a UI moment; the Rush *state* (shot 7) is the
   one that got the beauty.
6. **U2's ruts are geometric.** They are two clean converging streaks, which is what
   the craftbook asked for, but a real cart track wanders and doubles. At the run
   camera they read as intent rather than history.
7. **Nothing here was judged by a human.** Every keep/revert in this review is my read
   of a render against a written brief. The owner has not seen a frame of it.

---

## 6. Findings

**F-BC-1 — the Claim's horizon is the continuation ring, and the panorama is dead
weight at this camera.** ✓ VERIFIED by forced-visibility probe (§U4): panorama 0–2 px,
continuation up to 36.55% of frame. Three consequences: (a) `the-claim-panorama-atlas.png`
can be repainted at any quality and no player will see it; (b) the "backplate band" the
map-quality register tracks at wide aspect is a continuation artefact — it is unfogged
(`createContinuation` sets `fog = false`) while the tile it abuts is fogged, so the
seam is a tone step at grazing angles; (c) any future horizon work on this map should
target `createContinuation`, not the panorama. **Recommendation:** owner-facing
question — should E1 maps carry a visible sky at the gameplay camera at all? If yes it
is a camera/continuation change, not an art batch. Parked, not fixed: it is outside
this brief's five upgrades and it touches every sculpted map.

**F-BC-2 — a faithful re-export of `build_the_claim_terrain.py` silently deleted every
landmark.** ✓ VERIFIED and FIXED in this shift (U2 commit). The recipe authored
`landmarkMounts` from its own literals, but the shipped contract carries an `asset` per
mount plus a `landmarkPack` block, backfilled once by `apply_mounts_sweep.py`. So the
first re-export dropped `asset` from all five mounts, the pilot — which filters mounts
on `asset` — mounted **zero** landmarks, and the map still published
`terrain3dPilotState=ready`: the tent, the claim house and the headframe left the map
while every gate stayed green. The board caught it (landmarks 5 → 0, draw calls
83 → 78). The recipe now sources mount records from the landmark pack contract, which
owns them, and raises if a mount has no asset. **The same trap is live for every other
map whose terrain recipe predates the mounts sweep** — `build_dry_gulch_terrain.py`,
`build_twin_banks_braid.py`, `build_e2_contract_terrains.py` and the rest were not
audited by this shift. That is the corrective worth spawning.

**F-BC-3 — one water material per map was a coincidence, not a rule.** ✓ VERIFIED by
reading `createLivingWaterMaterial`: the band geometry is inlined into the shader
source as literals while `customProgramCacheKey` returned only `living-water-river`.
Fixed in the U1 commit (the key now carries every literal). No shipped map had two
river materials, so nothing was broken in play — this was a trap set for the next
person, and the next person was this shift.

---

## 7. What changed on disk

| File | Why |
|---|---|
| `src/world/Water.ts` | sculpt water plane, bed-depth bake, warm/opacity/depth-test config, cache-key fix |
| `src/world/SunMotes.ts` | new — the mote and ember point field |
| `src/world/Terrain3dClaimPilot.ts` | mounts water / contacts / motes / embers, per-contract emissive, all disposed |
| `src/world/Terrain.ts` | one read-only accessor (`visualWaterHalfWidth`) so the sculpt water uses the declared band |
| `src/world/LightRig.ts` | exports the sun vectors + shadow direction it was already built from |
| `src/game/Game.ts` | one line: passes the run manager's rush flag to the pilot |
| `src/core/DebugParams.ts` | `?nobeauty`, so the perf law stays checkable |
| `assets/pilots/map-rebuild-spike/build_the_claim_terrain.py` | U2 atlas marks + the landmark-pack mount fix |
| `assets/pilots/map-rebuild-spike/the-claim-terrain.{glb,blend}`, `-atlas.png`, `-contract.json` | the re-export, contract regenerated in the same commit |
| `scripts/beauty-claim-board.mjs`, `-stats.mjs`, `-pair.mjs` | the board, its measurements, its pairs |
| `playwright.beauty-claim.config.ts` | gate config on its own port (Mistake #12) |
| `reviews/shots-beauty-claim/**` | every board, every metrics file |

Sim bytes changed: **zero**. Nothing in this shift reads or writes water classification,
fords, spawns, lanes, harvest anchors or wave logic; the water surface *reads* the sim's
declarations and the baked height grid, and writes nothing back.

---

## 8. For the drain

1. **F-BC-2 is the one that should spawn a corrective task**, not just a ledger line:
   every terrain recipe that predates `apply_mounts_sweep.py` can delete its map's
   landmarks on a faithful re-export while every gate stays green. `the-claim` is
   fixed; `dry-gulch`, `twin-banks`, `night-shift`, `baron` and the E2+ recipes were
   not audited here. A 20-line audit script that re-runs each recipe's
   `mesh_contract()` and diffs `landmarkMounts` against the shipped contract would
   settle it without a single Blender export.
2. **F-BC-1 is an owner question, not a task**: should E1 maps show sky at the
   gameplay camera at all? Everything downstream of that answer (repaint the panorama,
   or fog and re-paint the continuation) is cheap; the answer is not mine to give.
3. **F-BC-3 is fixed and needs no follow-up** beyond noticing that it was fixed.
4. The board is re-runnable by anyone: start a vite on a scratch port, then
   `BEAUTY_BASE=http://127.0.0.1:5247 node scripts/beauty-claim-board.mjs <phase>`.
   `?nobeauty` keeps the perf law checkable after this session ends.
5. These three findings are not in `tasks/BACKLOG.md`: this shift ran in a task
   worktree on `beauty/claim` and did not touch main's ledger. The drain owns that
   edit, in the same commit as the merge (Mistake #5).
