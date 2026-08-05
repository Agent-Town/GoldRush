# Review — THE PRESSURE GARDEN BEAUTY SHIFT

**Slice/branch/tip:** `beauty2/e2-pressure-garden` · worktree `gr-task-beauty2-e2-pressure-garden` · solo-writer Opus-5 shift, 2026-08-04
**Brief:** `docs/beauty/e2-pressure-garden-brief.md` · program laws `docs/beauty/README.md`
**Base:** `7dcae7cbe02ba087577f2e6f38b6876af5ad0c39` ("drain: beauty2 round-2 conflict repairs (tsc clean)") — see §Deviations #1 for why this is not `origin/main`.
**Boards:** `reviews/shots-beauty2-e2-pressure-garden/` — `pairs/` are the before|after boards; `u1a…u1e`, `u2-before`, `u2a`, `u3a`, `u3b`, `u345`, `u4-hot`, `lite-zoom`, `final` are the ladder, kept.
**Verdict:** ✅ **5 KEPT · 0 REVERTED · 1 BUG FOUND AND CURED (F-PG-2)** — every upgrade in the brief shipped, and the shift's largest single result is not in the brief at all: `LANDMARK_EMISSIVE` was dead code, so three previously-merged beauty upgrades on three other maps had silently reverted themselves.

---

## What it does

The Pressure Garden's declared water band rendered **nothing**. The 3D pilot hides every painted water layer, no contract had registered for a live surface, and the terrain atlas paints the band near-black — measured **rgb 20,20,15 / luma 19.4** against **luma 104–105** on the banks either side. So the map's centre was a full-width ink slab, its pressure manifold stood in the middle of it with nothing under its feet, and the four terraces the map's name promises carried no worked marks of any kind (boiler terrace 91.3, growing terraces 91.3, coal-bed terrace **93.1** — the coal band was the *brightest* of the three). This shift puts clean water in the band, rows in the garden, soot at the top of the frame, the landmarks back under the sun instead of self-lit, and heat over the boilers **only while the sim says the boilers are hot**. Rendering only: **zero sim bytes**.

---

## Per-upgrade verdict

| # | Upgrade | Verdict | Board | Measured |
|---|---|---|---|---|
| **U1** | The clean band earns its adjective | ✅ KEPT | `pairs/01-run-camera.png`, `02-water-band.png`, `03-pump-station.png` | isolated on the final build (`?nobeauty` vs beauty, same atlas, same browser): band region luma **17.7 → 74.2**, sd **2.68 → 8.76**, distinct 4-bit colour buckets **3 → 10**, saturation 0.667 → 0.291; whole frame lit share **+23.4 pp** (64.4% → 87.8%), mean luma **+12.5**, darkest histogram octave **35.6% → 12.2%** of frame |
| **U2** | The terraces become the garden | ✅ KEPT | `pairs/04-growing-terrace.png`, `05-coal-bed-terrace.png` | atlas by game-z: coal-bed **93.1 → 77.0**, growing **91.3 → 87.8**, boiler **91.3 → 84.1**, south apron **105.1 → 105.4** (the global-budget check); in frame, growing terrace luma **62.1 → 71.5** with sd **35.6 → 52.4** and 294 → 315 colour buckets |
| **U3** | Landmarks into the golden hour | ✅ KEPT | `pairs/08-landmark-emissive.png` | manifold region luma **92.7 → 82.4**, sd **42.1 → 32.1** (blown self-lit highlights collapsing into modelled form); contact pools **1** written of 5 mounts, 2 skipped off-tile, 2 replaced by wet collars |
| **U4** | The garden breathes pressure | ✅ KEPT | `pairs/06-boilers-hot.png`, `u4-hot/*` | cold → hot → cooled: `heatShimmer` **false → true → false**, `steamWisps` **0 → 24 → 0**, tracking `pressure.objective.hotBoilers` **0 → 3 → 0**, both viewports |
| **U5** | Soot in the light | ✅ KEPT | `final/beauty-desktop-coal-bed-terrace.png` | 200 motes desktop / 90 at 390px, **+1 draw call**, soot-umber `#c9a279`, biased to z 31 over the coal terrace |

**A/B'd and rejected, each by measurement, not taste:**

| Tried | Result | Rejected because |
|---|---|---|
| Water `color` multiply alone (`#d6f0ee`, no emissive) | band rendered **rgb 59,71,44** — G−B 27 | Moss, not water. The Ledger key light `#ffd28a` carries (1.00, 0.82, 0.54); **no multiplier can return a channel the light never delivered.** Cured with a small emissive (`#0d2a33`) → 67,81,58, G−B 23 at higher luminance. |
| Water opacity 0.88 | flat painted slab; the shader's own 0.74→0.94 depth alpha had nothing left to say | Dropped to **0.80**, which also lets the warm bed read through at the margins — the brief's own ask. |
| `rippleStrength` 1.15 with the face-on lift restored | the shader's 3–6 m chevrons read as printed fabric, not chop | **0.75.** "Gentle chop" is the brief's word. |
| `bedDepth` on (the Claim's path) | the band's bed is a **dead-flat pan at y −0.180** (min == median == max across the whole declared band, 16641-vertex GLB), so a baked bed collapses depth to one constant and erases the cross-channel gradient *and* the ford shelf | `bed: false` — the declared-band path, which reads the sim's own riverHalfWidth/fordHalfWidth. |
| Shipped `fordTint` 0.72 | over a **12 m** crossing (halfWidth 6) that is half the visible band washed to one flat sage slab | **0.44.** The shipped constant was tuned for a 3 m ford in a 32 m band. |
| Shipped shore ramp 0.95 m | never fired: the bank rises through the surface at \|z\| ≈ 5.7, half a metre *before* the ramp begins, so both shores read as drawn lines | **2.2 m**, which is where the damp margin under the boiler terrace's south lip comes from. |
| Wet collar as a crisp bright annulus (inner 0.82, opacity 0.30) | read as a drawn UI circle sitting on the water | Wide and faint (inner 0.40, opacity 0.14, additive). |
| Landmark emissive left at 3 | bodies are their own light source; the low sun models everything around them and nothing on them | 1.45 map-wide, **1.30** for the two bodies carrying the map's only saturated reds. |

---

## How the p95 law was actually measured

`?nobeauty` (`src/core/DebugParams.ts`, `isMapBeautyDisabled`) holds this shift's render additions back while everything else boots identically, so both arms run in **one browser, seconds apart, at the same load** — the only honest instrument on this box (F-1113-4; the load average during this shift ranged **9.2 → 65.6**, measured and recorded in each `board.json`).

Three 180-frame rAF windows per arm after a 240-frame camera settle plus a 120-frame warm-up, run camera (hero −12, 12), `--workers=1`, `channel: 'chromium'`, `?tier=full`.

| Arm | rAF p95 windows | settled | game p95 | draw calls | triangles |
|---|---|---|---|---|---|
| desktop `?nobeauty` | 9.8 / 9.9 / 9.8 | **9.8 ms** | 9.8 | 91 | 103 044 |
| desktop beauty | 10.0 / 9.9 / 9.9 | **9.9 ms** | 9.9 | 95 | 103 324 |
| mobile 390px `?nobeauty` | 9.9 / 10.0 / 9.9 | **9.9 ms** | 9.9 | 55 | 96 188 |
| mobile 390px beauty | 9.9 / 10.0 / 10.1 | **10.1 ms** | 10.1 | 59 | 96 468 |

**desktop 1.010× · mobile 1.020× (median-of-three 1.010×), against a 1.15 ceiling.** **+4 draw calls** on both viewports — the water quad, the collar ring, the contact-pool ring and the mote field, one call each — and **+280 triangles**, of which 154 are accounted for exactly (water quad 2, two collar rings 128, one contact ellipse 24) and the remainder is frame-to-frame variance in systems this shift does not touch. Load average at capture: **65.6 / 68.5 / 83.4** — and the arms still agree to a tenth of a millisecond, which is the point of measuring them together.

**Honest limit on this table, stated rather than buried:** `rafP95` here is display-cadence-bound (every arm lands within 0.3 ms of ~9.9 ms), so it is a *ceiling check*, not a sensitive instrument. **Draw calls and triangles are the trustworthy signals** and they are reported above. Two things are also **not** held back by `?nobeauty` and therefore are not in this table: U2's atlas (baked art, zero runtime cost by construction — the GLB counts are byte-identical) and U3's landmark emissive (a material property, no draw). U4's cost is measured separately below because it is the only addition that is not free when it runs.

**U4, cold vs hot, same session** (`u4-hot/report.json`): desktop 92 → 105 draw calls and 103 354 → 105 004 triangles between "no boilers" and "three boilers hot" — but **that delta is mostly the three player-built boiler houses**, which exist in both arms of any honest comparison. The shift's own share is the 24 wisp points (one buffer per joint, 3 calls) plus the shimmer's framebuffer copy. See §Findings F-PG-4 for what this table cannot separate and why.

---

## The shot list

| # | Moment | Before | After |
|---|---|---|---|
| 1 | Plain boot, no `?debug`, seeded profile → board → launch | `artifacts/e2-pressure-garden/desktop-chrome-board.png` (regenerated by the spec run) | same path, this branch |
| 2 | Run camera at hero start (−12, 12) | `u1a/nobeauty-desktop-run-camera.png` | `final/beauty-desktop-run-camera.png` · pair `01` |
| 3 | The band at the garden crossing (hero 0, 8) | `u1a/nobeauty-desktop-water-band.png` | `final/beauty-desktop-water-band.png` · pair `02` |
| 3b | The pump station on the south margin (hero 34, 4) | `u1d/nobeauty-desktop-pump-station.png` | `final/beauty-desktop-pump-station.png` · pair `03` |
| 4 | Boilers hot — shimmer, wisps, pressure pill in band | `u4-hot/desktop-1-cold.png` | `u4-hot/desktop-2-boilers-hot.png` · pair `06` |
| 5 | The growing terrace (hero −18, 25) | `u2-before/beauty-desktop-growing-terrace.png` | `final/beauty-desktop-growing-terrace.png` · pair `04` |
| 5b | The coal-bed terrace (hero 0, 38) | `u2-before/beauty-desktop-coal-bed-terrace.png` | `final/beauty-desktop-coal-bed-terrace.png` · pair `05` |
| 6 | Mobile 390px | `u1a/nobeauty-mobile-run-camera.png` | `final/beauty-mobile-run-camera.png` · pair `07` |

**Board caveats, recorded rather than hidden.** (a) U2's before arm could not come from `?nobeauty` — a baked atlas is not URL-switchable — so it was shot by writing the *pre-U2* atlas/GLB/contract back into the tree from `ac8ccc6a~1` with the code left at HEAD, shooting, and restoring. That isolates U2 exactly. (b) The `u1a…u1e` ladder is the U1 tuning sequence and is kept at half scale; `final`, `u2-before`, `u4-hot` and `pairs` are full resolution, recompressed, pixels never resampled. (c) Every board is `?tier=full` — headless chromium reports SwiftShader and `PerformanceTier` resolves `balanced`, in which the heat shimmer never constructs at all.

---

## What each upgrade did

### U1 — the clean band earns its adjective

`SCULPT_WATER_CONTRACTS`, a bare `Set` holding only `the-claim`, became **`SCULPT_WATER_DRESSING`**, a per-contract table. Everything in it — colour, opacity, fill, ford skim, bed depths — was previously hardcoded inside `mountSculptWater`; the Claim's entry repeats those literals, so its render is unchanged and that is visible in the diff rather than asserted.

**Three things the brief could not have known:**

1. **There is no channel.** The brief reads as if the band were carved. It is not: the GLB bakes the entire declared band **dead flat at y −0.180**, and the ground *south* of it is *lower* (−0.279 at z −12). The band is a paint-only feature with a bank-relief ridge cresting at 0.000 (north lip) and −0.055 (south lip). So the water sits at **−0.070** — under both crests, which makes the shoreline a depth-buffer intersection that follows the ground instead of a drawn edge, and makes it impossible for the water to spill onto the sluice bank.
2. **The Claim's bed-depth path would have made it worse, not better.** A flat pan bakes one constant, which erases the cross-channel gradient and the ford shelf together and produces exactly the "plastic plank" twin-banks U1 named. Turning the bed *off* hands depth back to the sim's declared band geometry — which is what makes the middle deep, the margins shallow and the 12 m crossing a pale wading shelf.
3. **The face-on ripple lift was welded inside the bed branch.** The one term that stops a face-on water surface reading as glass was only reachable *through* `config.bedDepth`, so any band that reads its depth from declared geometry silently lost it. It touches no bed term; it is now its own switch, defaulted to "on exactly when there is a bed", so no shipped surface moves.

Plus: the band no longer stops at the tile edge (10 m of fading overhang across the continuation ring, because the same dead paint continues east and west and the pump framing looks straight down it), the glints seat on the contract's four declared `sluiceSamples` rather than on harvest anchors twenty metres away on the terraces, and the two bodies whose piers break the surface get a faint additive foam collar instead of a contact shadow.

### U2 — the terraces become the garden

Recipe + re-export, never a hand-edited GLB. **The armed trap was disarmed first and proven first.**

`build_e2_contract_terrains.py` wrote `"landmarkMounts": profile["mounts"]` and the pressure-garden profile declared `[]`. A faithful re-export would have written a contract with **zero mounts**; the runtime resolves every body through `mount.asset`, so the map would have rendered with no buildings at all while still publishing `terrain3dPilotState=ready` and passing every gate — Mistake #10, exactly. Cured by porting `carry_forward_mount_records()`, authoring the five mounts in the profile from the shipped contract, and adding a **raise the upstream copy does not have**: losing a mount stops the build. (That guard also covers `incline`, which still declares `mounts: []`.)

**The unchanged-recipe control ran before a single line of paint changed** and came back: **atlas sha256 byte-identical, GLB sha256 byte-identical**, all five mounts keeping their `asset`, counts unchanged. Only the `.blend` moved (Blender embeds session state; the runtime never reads it) and one semantic key — `maskTruth.stakeMarkers.lossCondition` → `heroStart`, which is the *shipped contract* being stale against its own declared source (`assets/contracts/epoch-2-steamworks/contracts.json` says `heroStart`). The re-export re-syncs the derived document.

The paint itself is all local, all read from sim declarations rather than retyped: damp silt and worn ground at the four sluice stations on the north lip; service ruts linking the three boiler beds (from `stakeMarkers`) with spurs to the water and up to both growing terraces; **narrow-groove row engraving** at 1.37 m spacing with a swept headland at each terrace end — the old recipe *did* have a furrow term, but at 0.12 of a full-period sine it was a wash, which is why the brief could truthfully say the terraces carried no growing marks; a warm-parchment lift (18%, inside the brief's ≤20%); cut and swept lines at each **authored** ramp crest, so a re-sculpt moves them; and a soot wash, haulage scars and dry glitter confined to the declared coal-bed zone.

**The grit-grade global budget was watched, not assumed.** `apply_grit_grade` re-normalises on the atlas's own 4th/96th luminance percentiles, so dark ink anywhere is spent from a global pot (twin-banks U2's finding). The untouched south apron came back **105.1 → 105.4**: the parchment lifts paid for the soot.

### U3 — landmarks into the golden hour

The map-wide drop to 1.45, 1.30 for the manifold and pump (the map's only saturated reds), contact pools registered, and **the reason none of that worked until this shift** is F-PG-2 below.

Contact pools also learned two skips. **Off-tile:** `heightAt` clamps to the baked grid, so the two pipe headers at x ±50 — outside the ±48 tile, standing on the continuation ring — would have had shadows dropped onto ground they are not standing on. The Claim's riparian-skip rule, applied off-tile: skip by measurement rather than draw a pool in the wrong place. **Collared:** a body that gets a U1 wet collar is already grounded in the medium it actually stands in, and a dark ellipse under a water surface reads as a hole. Result: **1 pool written of 5 mounts**, and each of the other four has a stated reason.

### U4 — the garden breathes pressure

`HEAT_PROFILES` gains a `sourceGated` flag. The Dry Gulch's heat is the *weather* — noon on a dry map, always on. This map's heat is a **machine**, and the map's entire lesson is that the machine is sometimes cold; shimmer over cold boilers would be the render contradicting the HUD. So `LightRig.setHeatSourceActive()` is fed `pressure.objective.hotBoilers >= 2` — **the same threshold the objective is scored on and the pressure pill already displays.** Steam wisps at the manifold and both pipe-header joints follow the same number, white (canon), 8 per joint in one buffer each, `visible = false` when cold so a cold plant costs nothing.

Proven in **both directions**, both viewports, one browser: cold → `heatShimmer false`, `steamWisps 0`; three boilers hot → `true`, `24`; fuel burned off → `false`, `0`.

### U5 — soot in the light

`SUN_MOTE_CONTRACTS` becomes a dressing table (the Claim's literals unchanged) and this map takes soot-umber `#c9a279` motes, higher and slower than the Claim's, centred at z 31 over the coal-bed terrace rather than over the middle of the map. This is the Claim's own honest line — *"they read as snow over the dark water… the honest fix is tinting them toward umber"* — answered on a different map.

---

## Evidence / Gates

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | ✅ clean |
| `npm run build` (tsc + vite build + asset-diet) | ✅ RC=0, 2176 modules, built in 2.54 s, asset diet within ceilings |
| Contract equality (`validTerrain`) | ✅ meshCount 1 · triangles 32768 · vertices 16641 · materialCount 1 · bounds [−48,−48,−0.291]…[48,48,2.5124] — all unchanged; contract regenerated in the **same commit** as the GLB |
| Landmarks | ✅ `landmarks 5`, `landmarkSkipped 0`, all five mounts carry `asset`, every board and every arm |
| Re-export determinism (unchanged recipe) | ✅ atlas + GLB sha256 byte-identical; only `.blend` moved |
| Frame p95 desktop 1280×800 | ✅ **1.010×** (9.8 → 9.9 ms) vs 1.15 ceiling |
| Frame p95 mobile 390×844 | ✅ **1.020×** settled / 1.010× median-of-three (9.9 → 10.1 ms) |
| Zero console/page errors | ✅ all four board arms, both U4 probe viewports, every stage |
| **`e2e/e2-pressure-garden.spec.ts`** — the brief's primary named suite | ✅ **both projects**, in the same 32-minute sweep that produced the reds below. Its own artifacts regenerated: `artifacts/e2-pressure-garden/desktop-chrome-{board,boilers-hot}.png` |
| `e2e/e2-pressure-in-run.spec.ts` | 🔺 1 of 2 tests red on mobile — **identical on the untouched base**, F-PG-6 (note: this suite runs on `e2-hill-mine`, not this map) |
| `e2e/map-census.spec.ts` | 🔺 4 of ~80 red, all 15-second timeouts, three of them on maps this shift never touched (`the-claim`, `e3-canyon-works`, `e5-deepwater-claim`) — F-PG-6 |
| `e2e/terrain3d-registry.spec.ts` | 🔺 8 red — **the same 8, name for name, on the untouched base**, F-PG-6. Its sim-fingerprint test (*"…byte-identical per map"*, the suite's version of this program's central law) **passed** |
| Sim unchanged under the 3D pilot | ✅ `terrain3d-registry.spec.ts:328` fingerprints the sim with the pilot off and on and asserts hash equality — green on desktop for every contract; on mobile it ran out of *wall clock* at `e9-dome-basin`, long after this map, having matched every hash before it |
| `e2e/landmark-brightness.spec.ts` | ✅ both projects (the suite F-PG-2's cure could have broken) |
| `e2e/shore-truth.spec.ts` | ✅ (visual half width ≤ sim half width holds: 6.25 ≤ 8) |
| **LITE untouched** | ✅ `?tier=lite`, **both arms identical**: `state=lite`, `renderSource=painted`, and `sculptWater` / `waterCollars` / `contactShadows` / `motes` / `steamWisps` **all absent**, `heatShimmer false`. Draw calls 80 / triangles 73 946 in both arms on the first run; a repeat differed by 1 call and 2 triangles (one frame of transient VFX), which is why the **dataset attributes**, not the counts, are the evidence here. `lite-zoom/lite-{beauty,nobeauty}.png` |
| Mobile 390px at max zoom-out (MQ-2) | ✅ `distanceScale` 1 → **1.6** (the clamp), no backplate band, water and collars intact, zero console errors. `lite-zoom/mobile-max-zoom-out.png` |

---

## Merge classification

Base `7dcae7cbe02ba087577f2e6f38b6876af5ad0c39`. Five commits, path-scoped, one concern each:

| Commit | Files | Class |
|---|---|---|
| `5aa13eb1` U1 | `src/world/Terrain3dClaimPilot.ts`, `src/world/Water.ts` | LANE-TOUCHED |
| `4006db06` U4 | `src/world/LightRig.ts`, `src/game/Game.ts` | LANE-TOUCHED |
| `01b3bde2` U3+U5+F-PG-2 | `src/world/Terrain3dClaimPilot.ts` | LANE-TOUCHED |
| `ac8ccc6a` U2 recipe | `assets/pilots/map-rebuild-spike/build_e2_contract_terrains.py` | LANE-TOUCHED |
| `047d9157` U2 art | `pressure-garden-terrain.{glb,blend}`, `-atlas.png`, `-contract.json` | LANE-TOUCHED |

**Sim bytes changed: zero.** `src/sim/TileHeight.ts`, `src/systems/PressureSystem.ts`, water classification, spawn gates, the ford and the harvest anchors are untouched — `git diff --stat` against the base lists nine files and none of them is a sim file. The one line added to `src/game/Game.ts`'s update loop and the one host field are **reads** of `pressureSystem.diagnostics`, a published snapshot.

**Cross-map reach, declared:** `Water.ts` gains six opt-in knobs, every one defaulting to the shipped literal (`surfaceLift` defaults to "on exactly when there is a bed", which is where the term was welded). `Terrain3dClaimPilot.ts`'s F-PG-2 cure **changes three other maps' renders** — to what their own merged reviews say they should be. See F-PG-2.

---

## Findings

### F-PG-2 — `keepLandmarkPaintReadable` was called twice, and the second call silently reverted three merged upgrades ✓ VERIFIED · ✅ CURED

`Terrain3dClaimPilot.ts` applied the per-contract landmark paint and then, four lines later, called `keepLandmarkPaintReadable(model)` again with **no** paint argument — which re-applies `DEFAULT_LANDMARK_PAINT` (`emissive #ffffff`, `emissiveIntensity 3`) over the top of it. So every one of these was dead code:

- `LANDMARK_EMISSIVE['the-claim'] = 1.45` — **the headline of the Claim's U3**
- `LANDMARK_PAINT['e1-baron']`, four bodies — the emissive/intensity half of **the Baron's U2** (the diffuse tint survived, because the second call skips tinting)
- `DRY_GULCH_SPRING_EMISSIVE = 2.1` — **Dry Gulch's U4** spring fix

**How it was verified — and why reading was not enough.** Registering `e2-pressure-garden: 1.45` changed the manifold region by **0.1 luma** (92.7 → 92.6, inside water-animation noise). Deleting the second call moved the same region **92.7 → 82.4 with stddev 42.1 → 32.1** — blown self-lit highlights collapsing into modelled form. The dataset attribute `terrain3dPilotLandmarkEmissive` published `1.45` in **both** cases, because it reports the declaration, not the render: a probe that trusted it would have called this shipped.

**Impact:** three maps have been rendering at self-lit intensity 3 since their shifts merged, against their own reviews. **State: cured on this branch** (one line deleted; the paint-aware call four lines above already covers every contract, defaulting identically for maps with no entry). `landmark-brightness.spec.ts` — the suite whose luminance floor this could plausibly have broken — passes on both projects after.

**Owner note, non-blocking:** the cure is *correct* but it is a **visible change to `the-claim`, `e1-baron` and `e1-dry-gulch`** that no one asked this shift to make. Reverse it with one word and I will re-land the fix behind a per-contract opt-in instead; the boards in `u3a` (clobbered) vs `u3b` (cured) show exactly what the difference looks like on one map.

**⚠️ MERGE NOTE FOR THE DRAINER — this line is deleted on two branches at once.** The parallel `beauty2/e2-hill-mine` shift hit the same wall independently on the same day (its own F-BHM-1) and deleted the same call in `bc14d54c`, additionally making the pilot publish the **measured** per-mount `emissiveIntensity` inside `dataset.terrain3dPilotLandmarkMaterials[]` so the attribute can no longer echo the table. As of `7c833197` **main still carries the duplicate**, so whichever branch drains second will conflict on this hunk. **Resolution: keep the deletion, and prefer the hill-mine version of the dataset publication** — publishing the measured value is strictly better than publishing the declaration, and it is the thing that would have caught this in the first place. Root cause of the duplicate, per that shift: `10586b90` (the baron drain), whose merge resolution kept both the new per-contract block *and* the single-line call it replaced.

### F-PG-1 — `main` was tsc-red at `a7bc23c5` ✓ VERIFIED · ✅ ALREADY CURED UPSTREAM · no action

At pre-flight, local `main` (`a7bc23c5`) carried a botched merge: duplicated `isMapBeautyDisabled` import, duplicated `nextSkirt`/`nextChannelWater` declarations in `Terrain3dClaimPilot.ts`, and a duplicated `eraOrder` in `TownScene.ts`. Nine tsc errors; the module failed to parse and **the game did not boot at all**. Recorded because it is a real quality signal about the round-2 conflict repairs — but by the time I had the evidence a fire had already landed `7dcae7cb` "drain: beauty2 round-2 conflict repairs (tsc clean)", which is what this shift is based on. **No corrective task needed.** (This is also the VERIFY-DON'T-INHERIT rule paying for itself twice in five minutes: my first `git show main:` read the *moved* ref and showed clean content while the working tree still held the broken blob.)

### F-PG-3 — the shipped terrain contract's `maskTruth` was stale against its own source ✓ VERIFIED · ✅ CURED BY THE RE-EXPORT

`maskTruth.stakeMarkers[*]` carried `lossCondition` while `assets/contracts/epoch-2-steamworks/contracts.json` — the file `derived_mask_truth()` reads and the contract itself names as `maskTruth.source` — says `heroStart`. Documentation-only (the runtime's `Contract` type reads `maskTruth.waterMask` and nothing else), and the re-export re-synced it. Worth a line because it means **the other three E2 contracts are probably stale in the same way** and nobody would find out until someone re-exported them.

### F-PG-4 — `?nobeauty` does not hold back the heat shimmer, so U4's cost cannot be isolated by the shift's own instrument 🟡 OPEN · non-blocking

`LightRig`'s `HEAT_PROFILES` lookup is not gated on `isMapBeautyDisabled()` — it never was, since the Dry Gulch shipped it. For every board in this review that is harmless (the shimmer only constructs at FULL tier *and* only burns when boilers are hot, which no boot frame reaches, so the p95 table above is unaffected). But it means the cold→hot draw-call delta of 92 → 105 **cannot be split** between the three player-built boiler houses, the 24 wisp points and the shimmer's framebuffer copy. **Recommendation:** extend `?nobeauty` to the `HEAT_PROFILES` lookup so the next shift that touches heat can measure it. Deliberately not done here: it changes `e1-dry-gulch`'s behaviour under a debug flag, and this shift already carries one uninvited cross-map change (F-PG-2).

### F-PG-6 — the named-suite sweep is red, and the reds are the box and the base ✓ CONTROL-PROVEN · non-blocking

The four named suites ran through this shift's own config on its own port (`playwright.beauty2-pg.config.ts`, 5302, `--workers=1`): **102 passed, 17 failed in 32.2 minutes.** The brief's *primary* suite — `e2-pressure-garden.spec.ts`, the one that boots this map through the town board and drives the whole pressure loop — **passed on both projects**, and regenerated its own boards.

Then the control, run properly: a **detached worktree at the base commit** (`/tmp/gr-pg-control` at `7dcae7cb`, its own vite on **5312**, `--workers=1`), and — because a control is only a control if it shares the treatment's scope and box conditions (F-1113-4) — **the branch was then re-run at the control's exact scope**, back to back, never overlapping. Two suites, same specs, same worker count, same hour:

| | Branch, matched scope | Untouched base `7dcae7cb` |
|---|---|---|
| **failed** | **9** | **9** |
| **passed** | **14** | **14** |
| wall clock | 15.2 min | 13.4 min |

**The two failure sets are identical, name for name:** `e2-pressure-in-run "coal feeds boilers…"` (mobile) · `terrain3d-registry "…fall back on invalid terrain bytes"` (×2) · `"all sixteen contracts mount terrain…"` (×2) · `"…inside the 1.15 p95 budget"` (×2) · `"rim and … every panorama readable"` (×2).

The first, 4-suite sweep produced **two extra** reds that the matched pair does not — `e2-pressure-in-run` on desktop and the fingerprint test on mobile — and both were *timeouts* (a 5 s poll, a 180 s test), in a sweep that ran 2.4× longer under a load average of 18–83. That is contention, and the matched pair is what settles it.

`map-census`'s four reds are all 15-second timeouts, three of them on maps this shift never touches (`the-claim`, `e3-canyon-works`, `e5-deepwater-claim`); they were not re-run because a timeout on an untouched map is not a claim that needs a control.

Two of these are diagnosable from their own messages and neither is a rendering fault: `…invalid terrain bytes` expects `state=failed` and gets **`lite`** — the auto-tier watchdog demoting the page because frames collapsed, a CPU-starvation signature — and "all sixteen contracts" expected **7** asset requests and counted **59**, i.e. the same seven assets requested about eight times, which is a page being re-booted, not a contract being wrong. The load average across this sweep ran **18–83** on a box shared with other worktrees and a live fire.

**The one red that would have mattered most did not happen.** `terrain3d-registry.spec.ts:328` — *"terrain2d and the 3D default keep bounds, spawns, fog, masks, and simulation byte-identical per map"* — is the suite's own version of this program's central law: it fingerprints the sim with the 3D pilot off and on and asserts the hashes are equal. It **passed outright on desktop-chrome**. On mobile-chrome it hit a 180-second *test* timeout while navigating to **`e9-dome-basin`**, a map this shift does not touch and which comes long after `e2-pressure-garden` in the contract list — and the assertion throws on the first mismatch, so reaching e9 means every earlier contract's hash matched. The sim-equality assertion never failed on either project.

**Not claimed:** that this sweep is green. It is not, and no amount of re-running would make it so on this machine. What is claimed is that the reds are not this branch's, by the only method that can tell the difference.

### F-PG-5 — `incline` still declares `mounts: []` 🟡 OPEN · non-blocking, now guarded

The trap that would have deleted this map's landmarks is still armed on `e2-incline`'s profile in the same file. It can no longer *fire silently* — `carry_forward_mount_records()` now raises rather than shipping a short mount list — but the fix is to author its mounts the way this shift authored pressure-garden's. One-line-per-mount job for whoever runs the Incline shift.

---

## Deviations from the brief, stated plainly

1. **Base is local `main`, not `origin/main`.** The pre-flight `git fetch origin && git merge --ff-only origin/main` reported "Already up to date" — but local `main` was **21 commits ahead of the unpushed origin**, carrying the pools and atmos shifts whose seams this brief's siblings describe. Basing on `origin/main` would have meant re-deriving work that already exists and a large merge later. Reversal cost: none; the branch fast-forwards from `origin/main` too.
2. **U2's "service clearings under the manifold and winch" is winch-only.** The manifold stands *in* the water band (mount z +4, ground −0.180, eleven centimetres under the surface), so painted footing under it would never be seen; the pipe headers are off-tile at x ±50 where the atlas cannot reach. The clearing the brief asked for is on the winch, and the manifold's grounding is its U1 wet collar. Reversal cost: one gaussian.
3. **Glints sit at the band lip (z ±4.45), not at the declared `sluiceSamples` (z 7).** z 7 is *outside* the rendered band — the water stops at 6.25 by mask-agreement — so a glint there would land on dry ground. Their x coordinates are the declared ones; only the crossing is pulled to the lip they work from.
4. **The band renders to half-width 6.25, not the contract's `factoryVisualHalfWidth` 8.** Rendering to 8 would put full-strength water over all four sluice stations and drown the north bank the briefing gives to "legal sluice work". 6.25 is `waterAgreement.shallowsEnd`, i.e. exactly where the sim stops calling it water — the contract's own `waterVisualRuling`, and `shore-truth.spec.ts`'s law (visual ≤ sim) holds either way.
5. **U4 uses `hotBoilers >= 2`, and does not scale the `BoilerHouse` plume rate by the pressure band.** The brief marked the plume-rate read optional; the two gated effects it asked for (shimmer, wisps) are both in and both proven to follow the sim down as well as up. Reversal cost: not applicable — nothing was added.
6. **One word was eaten out of commit `ac8ccc6a`'s message.** A backticked `incline` in the body was expanded away by the shell, leaving "That also covers , which still declares mounts: []". The finding is recorded correctly here as F-PG-5.

---

## THE HONEST LINE — what still looks wrong

**The water is legible, and it is not yet beautiful.** At the run camera the band reads as a clean jade sheet with regular 3–6 metre chevrons crossing it. Those chevrons are the shipped shader's own ripple, and they are the most artificial thing in the frame: they repeat too evenly to be water and they do not respond to the bank, the ford or the piers. Turning them down further (0.75 is already down from 1.15) does not fix the pattern, it just flattens the surface back toward glass. The honest fix is a second, lower-frequency noise layer in the water shader, and that is a Water.ts job for a shift that owns the shader rather than a map.

**The glints are theoretical.** Four are seated on the declared sluice line and the shader draws them at radius 1.34 m through a ±9 cm line mask with a time pulse — which at the gameplay camera is roughly one pixel, intermittently. I can prove they are configured (`terrain3dPilotSculptWaterGlints = 4`); I cannot show you one in a still. That is shipped behaviour, not this shift's, but it means "glints on the sluice line" from the shot list is a claim the boards do not actually support.

**The heat shimmer is deniable.** At 2.0 px of displacement it reads as a faint restlessness over the upper band, and in a still frame you would not swear to it. The Dry Gulch shift said the same thing about the same effect at 2.2 px, and I did not find a better answer — a stronger amplitude reads as a wet lens. What is *not* deniable is the gate: `heatShimmer` and the wisp count follow `hotBoilers` up and back down, which is the part of U4 the map's lesson actually needed.

**The rows read at the terrace camera and vanish at the run camera.** The combed furrows are 1.37 m apart, which is right for someone standing on the terrace and nearly sub-pixel from the boot framing. The gradient survives the distance; the rhythm does not. If one thing here gets a second pass, it should be a coarser second comb — every fourth row deeper — so the rhythm survives the zoom the player actually plays at.

**Two dead fields remain, and neither is mine to fix.** The continuation ring beyond the tile edge is still near-black wherever the band crosses it — the ten-metre overhang covers the water, not the ground either side of it. And the map still has no sky: `HorizonApron` has profiles for `e1-baron` and `e1-dry-gulch` only, and the pipe headers at x ±50 stand on ground with nothing behind it.

**And the method confession, because it is the same one every shift in this program has had to make.** Nothing here was judged by a human. Every verdict above is a measured render at a pinned camera, driven by a script that teleports a hero to a coordinate and waits 240 frames. **The pinned camera is a good instrument and a poor player.** It never turns, never gets hit, never stands in the ford, and never sees the map at the moment it matters — which is somewhere in wave nine with three boilers venting and something coming out of the north gate. The one frame in this review that comes close is `u4-hot/desktop-2-boilers-hot.png`, and it is staged.

---

## DRAIN VERDICT — s1457 (2026-08-05)

**Verdict:** ✅ **MERGED to main as `25890bae024059f47d15c42fd76558d190994c1e`** (re-land of the shift above, ported onto the moved world per `tasks/lane-e2-pressure-garden-reland.md`).

**Merge classification.** Lane base `02bea28c`; `git log main..lane/c` held exactly one commit (`8c72ca0e`). Twelve of thirteen paths were **LANE-ONLY** (main had moved none of them since the base); the thirteenth, `tasks/BACKLOG.md`, was **BOTH-MOVED** (3 main commits) and auto-merged by `ort` with no conflict — the two sides append different rows.

**Gates, on the MERGED tree, in a detached scratch worktree (§3.0b custody) against a scratch dev server on :5197 (Mistake #12 attribution), every playwright command at `--workers=1` (§3.1 / F-1270-1):**

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | clean |
| `npm run build` | green (16.2s) |
| `GR_RELEASE=e1 npm run build:release` | green — **F-RB-1 mandatory gate for pilot-touching work** |
| `e2e/e2-pressure-garden.spec.ts` | **2/2 passed** (desktop-1280x800 + mobile-390x844) |
| `e2e/e2-trestle.spec.ts` | 2/2 passed — landed map unmodified |
| `e2e/night-mode-truth.spec.ts` | 4/4 passed |
| `e2e/e2-hill-mine.spec.ts` | 10 passed / 2 skipped / **2 failed** — see control below |
| console/page errors | zero unsuppressed across all four map boots (watcher reported `0 known GLTFLoader blob error(s)` suppressed) |
| F-RB-1 single-line law | verified by reading: every `e2-pressure-garden` pilot entry is single-line (`:164`, `:387`, `:415`, `:591`, `:2140`) |

**The Hill Mine red is PRE-EXISTING, established by a CONTROL RUN, not by a label.** The runner's report claimed the documented F-BHM-3 baseline. A known-red claim is not exoneration, so the same worktree was reset to clean main (`302a5792`) and the same spec re-run on the same server at the same worker count: **identical 10 passed / 2 skipped / 2 failed, same test (`:131`), same assertion site (`:166`), and the same received value to the last digit — `-0.45728564262390137` against an expected `-0.5`.** The merge does not cause it.

**F-1457-1 (instrument, non-blocking, cure recorded here) — a `vite preview` scratch server MANUFACTURES reds in this suite.** My first gate attempt served the production build on the scratch port and `e2-pressure-garden.spec.ts` went **2 failed in 129s** on `locator.click` 60s timeouts. `playwright.config.ts:60` shows the house webServer is `npm run dev`. Re-run on a dev server, same tree, same flags: **2 passed in 18s.** The reds were the instrument's, not the slice's. Any fire using `GR_CAPTURE_EXTERNAL_SERVER=1` must start `npm run dev -- --port <scratch> --strictPort`, never `vite preview` — the config's own webServer command is the specification.
