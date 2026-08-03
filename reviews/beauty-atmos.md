# Review — THE ATMOSPHERICS SHIFT (skies as OPTIONS, panoramas as second attempts)

**Slice/branch/tip:** `beauty2/atmos`, base `60563f4b` (origin/main at pre-flight, fast-forwarded 2026-08-03) · dedicated Opus-5 solo-writer shift
**Brief:** `TASK.md` · the three U-specs it names (`docs/beauty/town-brief.md` U6, `e1-baron-brief.md` U5, `e1-dry-gulch-brief.md` U5) · program laws `docs/beauty/README.md`
**Verdict:** ✅ **THREE SKIES BUILT AND BOARDED FOR THE OWNER · TWO HORIZONS SHIPPED · ONE PREMISE OVERTURNED WITH A MEASUREMENT.**
Rendering only, zero sim bytes. Frame p95 flat inside noise on all 32 town frames. Every red control-proven pre-existing.

---

## 0. THE ONE SENTENCE

Three shifts in a row concluded that this game has no horizon because its cameras look down. **They look down, and there is still a horizon — it is not in the sky, it is the far ground, and every one of those shifts was measuring the wrong surface from the wrong place.**

---

## 1. THE THREE-SKIES BOARD — pick one, in one glance

**Boards:** `reviews/shots-beauty-atmos/board/<moment>.png` — one PNG per moment, four labelled columns.
Full-size single frames: `reviews/shots-beauty-atmos/{off,a,b,c}/<moment>.png`.

| Board | What it shows |
|-------|---------------|
| **`board/2-north-gate.png`** | **THE DECIDING FRAME.** Day, north side of the square, default zoom. |
| `board/5-dusk-north.png` | The marketing frame — `?townDusk`. The three skies at their most different. |
| `board/3-north-widest.png` | Widest allowed zoom (1.10) — the most sky the town can ever hold. |
| `board/4-nw-corner.png` | The corner, where the void is biggest (33% of the frame). |
| `board/7-night-north.png` | `?townNight`. |
| `board/6-mobile-north.png` · `board/6b-mobile-lite-north.png` | 390 px portrait, and 390 px on the LITE tier. |
| `board/1-plaza-boot.png` | **The control.** All four columns are identical here, and that is the finding, not a failure. |

### The three, in the owner's terms

| | Name | What it is | What it costs | The trade |
|---|------|-----------|---------------|-----------|
| **a** | **THE LAND GOES ON** | One lit, fogged dune belt standing just past the plate's rim, under the sky ramp. Real geometry in the world's own light. | **+2 draw calls**, 1584 tris (384 on lite) | The rim stops being an edge — the valley continues. But the belt is only 20–30 units away, so it reads as *near hills*, not as distance, and it eats most of the sky. |
| **b** | **THE PAINTED RING** | One unlit, fog-excluded, far-plane-pinned painted backdrop that rides the camera — the exact grammar every run map's panorama uses. | **+1 draw call**, 1152 tris | Real *distance*, and the town starts reading as the same book as the contracts. But it is a painting: it never parallaxes, and it can never be walked toward. |
| **c** | **ONLY AIR** | The equirect sky ramp alone. No geometry whatsoever. | **+1 draw call**, 0 tris | The cheapest and the most reversible. The plate's own rim becomes the horizon and the square finally has air over it — but the rim is a hard cut-out, and nothing softens it. |

**My recommendation, stated so it can be overruled:** **c** for the default boot and **a** for the dusk/marketing frame. c is one texture and no geometry, it works on lite, and it is the change that does the most per byte — the town stops being a tabletop the moment the void stops being the colour of dirt. a is the better *picture* at dusk (`board/5-dusk-north.png`, bottom-right) and the worse *world* in daylight, because its dunes are too close to be distance. b is the most technically correct and the least interesting to look at: it reads as painted scenery, which is exactly what it is.

**Nothing is shipped by default.** `?townSky=a|b|c` is menu-safe; with no flag the town is byte-identical to `60563f4b`. One word from the owner turns one of them on.

---

## 2. WHAT OVERTURNED THE PREMISE

`reviews/beauty-town.md` F-BT-2 reverted a sky dome and a dune vista on this arithmetic: *"the top edge of the frame sits 34.1° below horizontal, so the farthest ground any frame can contain is 25.8u from the camera… the plate ends at 15u… three framings confirmed it with ground running to every frame edge."*

Two of those numbers are wrong and the third is right for the wrong reason.

1. **The top edge is 29.51° below horizontal at the default framing, not 34.1°.** The 34.1 was computed as (camera pitch − half-fov of 21°), but `syncTownZoomProjection` sets `camera.zoom = distanceScale / townFramingDistanceScale(distanceScale)` — at the default framing that is 1.1765, which narrows the effective half-fov to 18.06°. Measured in-page across four framings: **−29.51° at 0.85, −30.99° at 0.62, −33.54° at 0.36, −35.46° at 1.10.**
2. **The frame's top edge reaches 31.0 world units at the default framing and 39.3 at the widest**, not 25.8. The position multiplier uses the *controller* scale (up to 1.6), not the framing scale (up to 1.10) — at the widest zoom the camera stands 28.0u up, not 19.2.
3. **The plate is 44×44, not 30×30.** `assets/pilots/town-plate-3d/town-plate.glb` has accessor bounds ±22 in x and z. The 30×30 number is the *painted fallback*, which the plate hides on every non-lite boot.

Put together: 31.0u of reach against a world that ends at ~18u of visible silhouette. From the plaza the difference is zero, because the plate is wide enough there. From the north side of the square it is a third of the screen.

**Measured, not argued.** `logs/session-scratch/atmos-town-cone.mjs` painted `scene.background` magenta with fog pushed to 900/1000, and counted pixels no geometry covers, desktop 1280×800:

| hero z | +2 | −2 | −6 | −9 | −11 | −13 | −14.5 | NW corner |
|--------|----|----|----|----|-----|-----|-------|-----------|
| void %, framing 0.85 | 0 | 0.0 | **5.75** | **9.73** | **24.90** | **27.01** | **32.58** | **32.97** |
| void %, framing 1.10 | 0 | 0.08 | **8.56** | **12.73** | **27.69** | **29.68** | **34.69** | — |

Mobile 390×844 tracks it: 0 / 0 / 6.71 / 10.87 / 25.84 / 27.83 / 32.20.

`logs/session-scratch/cone-desktop-z-13-default.png` is the picture of it: a magenta band over a soft, wavy plate-edge ridge. **The town has always had a horizon line. It paints it, the fog and the dirt in the same `#e9c98d`, so no one has ever seen it.**

That arithmetic is now a published diagnostic rather than a comment: `__GR_TOWN_DIAGNOSTICS__.sky.topEdgePitchDeg` (negative at every framing the town allows — which is why none of the three variants is a sky *dome*) and `.beyondPlate`, asserted on both sides in `e2e/beauty-atmos.spec.ts`.

---

## 3. THE SAME QUESTION, ASKED OF THE RUN MAPS — and the same answer

`reviews/beauty-baron.md` F-BEAUTY-BARON-3 reverted the finale's panorama repaint and recommended *"retarget the brief at the ring FOOT, which is the part the camera actually sees."* This shift measured which surface that is before painting anything. `?horizonProbe` tinted the panorama magenta and the sculpt continuation cyan, on `e1-baron`:

| hero z | +20 | +8.65 | 0 | −10 | −22 | −30 |
|--------|-----|-------|---|-----|-----|-----|
| panorama %, desktop | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| panorama %, mobile | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| apron %, desktop | 0.00 | 0.00 | 0.00 | **7.85** | **31.56** | **51.73** |
| apron %, mobile | 0.00 | 0.00 | 0.00 | **6.51** | **25.20** | **44.89** |

**The panorama is unreachable at every hero position on the map, on both viewports — F-BEAUTY-BARON-3 confirmed independently, and now bounded.** And the finale's real horizon is `Terrain3dSculptContinuation`, the apron running from the 64×64 playfield out to the panorama's foot: the moment the player crosses the river, **half the frame is that surface**, and it was the terrain atlas mirrored outward and dimmed.

`src/world/HorizonApron.ts` paints it, per contract, in the fragment shader of one material clone. No GLB, no atlas, no contract JSON — so neither of attempt one's re-export traps (F-BEAUTY-BARON-2's landmark carry-forward, F-BEAUTY-BARON-4's county ground skirt) is even in reach.

| Map | Pose | top-third luminance | mean rgb | band changed | draw calls | triangles |
|-----|------|--------------------|----------|--------------|-----------|-----------|
| `e1-baron` | fresh-eye z +8.65 | 49.7 → 49.7 | — | **0.66%** | 62 → 62 | 109,330 → 109,330 |
| `e1-baron` | far bank z −22 | 49.9 → **76.3** | 63,48,33 → 108,70,42 | **76.2%** | 62 → 62 | unchanged |
| `e1-baron` | far edge z −30 | 50.2 → **90.3** | 63,48,33 → 130,83,47 | **86.3%** | 62 → 62 | unchanged |
| `e1-dry-gulch` | boot z +12 | 88.6 → 88.2 | — | **3.8%** | 65 → 65 | 104,218 → 104,218 |
| `e1-dry-gulch` | north z −20 | 79.1 → **97.1** | 104,75,45 → 122,94,57 | **48.4%** | 65 → 65 | unchanged |
| `e1-dry-gulch` | far edge z −30 | 88.2 → **143.3** | 117,84,49 → 171,141,88 | **86.3%** | 65 → 65 | unchanged |

Both arms are the same tree, same dev server, minutes apart, via `?horizonApron=off`. Boards: `artifacts/beauty-atmos/baron/{before,after}/` and `artifacts/beauty-atmos/dry-gulch/`.

**The 0.66% and the 3.8% rows are the honest half of this.** At the framing each map is actually fought at, the apron is not in the picture. This upgrade exists from the moment the player pushes into the far half and not one second before.

**One number the loop overruled.** The first cut ran the recession ramp from radius 34 to 132 — the apron's own extent. But the camera only reaches ~60, so the whole ramp played out beyond the visible band: a **7× ridge amplitude moved top-band luminance by 1.2 and stdev by 0.3.** Rescaling the ramp to the reachable radius (68) is the entire difference between the "before" numbers above and a shipped no-op.

---

## 4. DRY GULCH — the label, corrected, and the finding underneath it

TASK.md asks for *"DRY GULCH U5 re-scoped per its parked note"*. **U5 was KEPT; the parked upgrade is U4** (`reviews/beauty-dry-gulch.md` §5, the two skeletons). The label is corrected here rather than quietly followed, and both are answered:

**U5, re-scoped (SHIPPED).** Its own honest line: *"the run camera pitches ~50° down, so there is no sky and no horizon line in any shot — the effect distorts distant ground instead of a skyline, which is the weaker version of the idea."* The shimmer covers the top 45% of the frame. That 45% now has a horizon to be heat over — bleached noon distance, mesa banding, no company smoke. Numbers in §3.

**U5's real defect, and it is bigger than the shimmer's amplitude — F-ATMOS-3 below.** It has never rendered in a single captured board.

**U4 (still parked, with a verdict).** Its owner's-desk ask was *(a) a per-asset build mode in `build_landmark_packs.py`, or (b) a deliberate whole-pack refresh.* Verified against the builder: `main()` (`:2796-2798`) accepts only pack keys after `--`; there is no argparse, no `--only`, no per-identifier filter, and `build_pack` derives its identifiers from the terrain contract's mounts (`:2694`). A per-asset mode is **~20–40 lines in `build_pack` + `main`, and four couplings**: an identifier filter; loading the committed atlas instead of `make_atlas()` (`make_material` only needs a `bpy.types.Image`, so `bpy.data.images.load` is a drop-in — this is what kills the 74.3%-of-subpixels blocker); merging `records` into the shipped pack contract instead of replacing it; and either skipping or merging the two evidence renders. The precedent already exists one level up — `main:2802-2816` recovers omitted *packs* from their shipped contracts for exactly this reason. **It is a task, not a clause, and it is still not this shift's.** Left parked, deliberately, with the patch still applying clean (`git apply --check` rc=0).

---

## 5. Evidence

| Gate | Result |
|------|--------|
| `tsc --noEmit` | clean |
| `npm run build` | green (asset-diet ran, no budget breach) |
| `e2e/beauty-atmos.spec.ts` (new — the town's plain-boot door + the cone) | **10/10**, desktop + mobile |
| `e2e/beauty-atmos-horizon.spec.ts` (new — the apron's door, the leak guard, the U5 tier gate) | **10/10**, desktop + mobile |
| `e2e/beauty-town.spec.ts` (the previous shift's door, unmodified) | **4/4** |
| Town family — t1-square, t5-townsfolk, t6-surfaces, ts-02b-facades, ts-03-prop-ring, plate-blender, scale-zoom, inhabitant-zoom, era-switch, fresh-boot-textures, ts-01, ts-04 | 49 passed / 13 failed — **every failure control-proven, see below** |
| Horizon family — panorama-framing, map-beauty-dry-gulch, fix-dry-gulch-frozen-waves, beauty-baron, e1-baron | **49 passed / 2 failed** in one 9.9-minute run, both projects — see §5b |
| Console / page errors | zero on 32 of 32 board frames after re-shoot; the three that appeared are characterised below |
| Screenshots | `reviews/shots-beauty-atmos/` (4 columns × 8 moments + 8 composed boards), `artifacts/beauty-atmos/baron/`, `.../dry-gulch/` |
| Per-shot perf | `artifacts/beauty-atmos/perf-<variant>-<project>-<shot>.json` |

### The town family's 13 reds are 11 pre-existing + 2 that do not reproduce

Control: a **detached worktree at `60563f4b`** (`/tmp/gr-atmos-control`), its own vite on port 5311, `--workers=1` on both arms, never sharing a server.

| Failure | Control at `60563f4b` | This branch | Verdict |
|---------|----------------------|-------------|---------|
| `town-plate-blender:59` ×2 projects | fails | fails | pre-existing |
| `town-plate-blender:114` ×2 | fails | fails | pre-existing |
| `town-t1-square:74` ×2 | fails | fails | pre-existing |
| `ts-01-plaza-ground:79` ×2 | fails | fails | pre-existing |
| `ts-04-living-pass:60` ×2 | fails | fails | pre-existing |
| `town-t5-townsfolk:203` ×2 | **fails on both projects when run alone** | fails | pre-existing — F-BT-3, now control-proven on *both* viewports |
| `town-inhabitant-zoom:15` desktop | passes | **passes on re-run alone** | neighbour load in a 12-spec batch, not a regression |

**No failure on this branch survives a control run at the base commit.**

### The frame p95 board — all four columns, eight moments, both viewports

| Moment | off | c | b | a | draw calls off → c / b / a |
|--------|-----|---|---|---|---------------------------|
| 1 plaza boot | 9.1 | 9.2 | 8.9 | 9.1 | 45 → 46 / 46 / 47 |
| 2 north gate | 9.3 | 8.6 | 9.0 | 9.3 | 33 → 34 / 34 / 35 |
| 3 north widest | 9.0 | 9.2 | 9.2 | 8.8 | 34 → 35 / 35 / 36 |
| 4 NW corner | 9.3 | 8.8 | 9.2 | 8.9 | 31 → 32 / 32 / 33 |
| 5 dusk north | 9.3 | 8.8 | 9.2 | 9.2 | 36 → 37 / 37 / 38 |
| 7 night north | 9.4 | 9.2 | 8.7 | 8.5 | 35 → 36 / 36 / 37 |
| 6 mobile north | 8.9 | 9.1 | 9.3 | 8.9 | 29 → 30 / 30 / 31 |
| 6b mobile **lite** | 9.4 | 9.0 | 9.4 | 9.1 | 27 → 28 / 28 / 29 |

**Frame p95 moves by at most 0.9 ms in either direction on any frame — well inside this box's noise, and the +15% law has an order of magnitude of room.** The trustworthy signals are the draw calls and the triangles, and they say exactly what the design says: c and b cost one draw call, a costs two, and lite's dune belt drops to 384 triangles by its own tier ladder.

Two caveats, stated so nobody reads the p95 column as more than it is: headless chromium pins an idle scene near the display cadence, and this box also runs the factory's fires — so each number above is the least-contended of three consecutive 1.9 s windows, and the run-map p95 measurements in §3 were discarded entirely (they swung 99–150 ms for *unchanged* scenes while two dev servers and a gate sweep were live).

### The console errors, characterised rather than waved away

Three frames out of 32 logged one `THREE.GLTFLoader: Couldn't load texture blob:…` each, all in column `a`. Re-shot: the single-shot re-run came back clean, and a four-way repeat of the worst frame (`5-dusk-north`, columns `off` and `a`, two runs each) came back **0 / 0 / 0 / 0**. It is the rig's own reload-with-flag boot racing an in-flight GLTF loader whose blob URL gets revoked — a loader race, not a sky regression. `e2e/beauty-atmos.spec.ts` names that string **exactly** rather than filtering by wildcard, so it cannot hide a real one.

---

## 5b. Horizon family gate — 49 / 52, and both reds are F-BEAUTY-BARON-1

One run, `--workers=1`, both projects, 9.9 minutes (`logs/atmos-horizon-gate.log`):

| Suite | Result |
|-------|--------|
| `panorama-framing.spec.ts` — **the guard that matters for §3** | **green**, all 12, including its `e1-dry-gulch` proof shot, which now runs against a painted apron |
| `map-beauty-dry-gulch.spec.ts` — named by that brief (relief-consumed + FULL/LITE budgets) | **green** |
| `fix-dry-gulch-frozen-waves.spec.ts` — the coupling spec that must stay green untouched | **green** |
| `beauty-baron.spec.ts` — the previous shift's 12-shot board | **green**, 12/12 |
| `e1-baron.spec.ts` — the "Baron 22/22" launch gate, **not touched** | 2 red: `:343` on both projects |

`panorama-framing` is the load-bearing one: it asserts `terrain3dPilotContinuation` matches `/^(sculpt-edge|panorama-owned)-continuation$/` and that the upper rows of a run frame carry world detail (luminance stddev > 4, > 4 colour buckets). The apron paint *adds* variation to exactly that row, and its contract list already includes a painted map. Green on both.

The two reds are **`e1-baron.spec.ts:343`** — *contract board requires science plus two secured claims and always shows an earned medal*, `toHaveCount` 5 expected / 6 received. That is **F-BEAUTY-BARON-1 verbatim**, filed in `reviews/beauty-baron.md` and control-proven there on the untouched base tree in the same hour. It is not mine, it is still open, and the E1 launch door is still measuring something that no longer passes.

---

## 6. Merge classification

- **Base:** `60563f4b`, fast-forwarded at pre-flight. Five commits, each pushed and verified with `git ls-remote`.
- **`src/town/TownSky.ts`** — NEW. The three variants and the cone arithmetic that sizes them.
- **`src/town/TownScene.ts`** — LANE-TOUCHED. A field, a build call in `dressScene`, one `follow()` in `render`, a `dispose`, the `sky` diagnostics block, and one defect fix: `publishDiagnostics` cast `scene.background` to `THREE.Color` unconditionally and threw the moment a variant replaced it with a texture. The default path still publishes the same hex string.
- **`src/main.ts`** — one word in `MENU_SAFE_PARAMS` (`townSky`), the same six-word class of change F-BT-1 made for `townDusk`.
- **`src/world/HorizonApron.ts`** — NEW. Per-contract apron paint; two profiles.
- **`src/world/Terrain3dClaimPilot.ts`** — LANE-TOUCHED. `createContinuation` gains a `contractId` argument, calls the paint when a profile exists, and publishes `terrain3dPilotHorizonApron`. A map with no profile takes the `undefined` branch, so "every other contract is unchanged" is visible in the diff rather than asserted.
- **`src/vite-env.d.ts`** — type-only: `lighting.heatShimmer` / `.dustDevilQuads`, which Dry Gulch U5 published and never declared.
- **New harness:** `e2e/beauty-atmos.rig.ts`, `e2e/beauty-atmos.spec.ts`, `e2e/beauty-atmos-horizon.spec.ts`, `scripts/beauty-atmos-board.mjs`, and four probes in `logs/session-scratch/atmos-*.mjs`.
- **Zero sim bytes.** No `townLayout` position, footprint, approach or trail; no heightfield, water mask, ford, mount, spawn, lane, volley cadence or RNG; no `contracts.json`; no GLB, atlas or terrain/panorama contract; no zoom clamp or default framing. `Game.ts`, `Economy`, `CombatSystem`, `ContractFamilies` and profiles are untouched.

---

## 7. Findings

**F-ATMOS-1 🔺 — F-BT-2's arithmetic is wrong in three places, and its conclusion is right only from the plaza. CURED HERE, and the cure is a diagnostic.** Details and numbers in §2. The load-bearing correction for anyone reading that finding again: **the town camera's frame reaches 31.0 world units at the default framing, the plate ends at ±22, and everything between them is sky-space nobody could see because it was painted the colour of dirt.** `sky.topEdgePitchDeg` and `sky.beyondPlate` now publish it every frame.

**F-ATMOS-2 ✅ — the panorama is unreachable on `e1-baron` at EVERY hero position, both viewports. MEASURED, and the brief retargeted.** 0.00% at six poses (§3). F-BEAUTY-BARON-3 said this; this bounds it. Its recommendation — aim at the ring foot — turned out to point at a different object entirely: not the panorama's foot but the *sculpt continuation*, which is what the top of a run frame actually contains. **Any future panorama work on any map should probe first: the panorama is a surface the run camera cannot reach, and that is a property of `Balance.camera`, not of one map.**

**F-ATMOS-3 🔺 — Dry Gulch U5 has never rendered in a captured board, and nothing could have told anyone. OPEN, with the gate now in place.** `LightRig` decides `heatAllowed` **once**, in its constructor, on FULL tier only (`LightRig.ts:235`). Headless chromium reports SwiftShader and `PerformanceTier` resolves `'balanced'`. Measured: at `tier=balanced`, `heatShimmer=false` and `dustDevilQuads=0`; at `tier=full`, `true` and `22`. That is why the shipped U5 boards show **+0 draw calls and byte-identical triangles** for an upgrade whose review credits it with "+3 draw calls, +2.0% p95" — the numbers in that row were not measured on the arm that has the effect. Three compounding causes, all verified: (a) the tier gate is sampled once and never re-checked; (b) `heatShimmer` reads `false` for "off because balanced" and "off because shed under stress" alike, so it cannot distinguish them; (c) `heatShimmer`/`dustDevilQuads` were published from `LightRigDiagnostics` and never added to the window declaration, so **no spec could read them and none did.** (c) is fixed here and the gate asserts the cause on both arms. (a) and (b) are LightRig policy and belong to whoever owns the auto-tier ladder. **Owner/next shift:** decide whether a `balanced` device should get the heat at all — today it silently cannot, and the decision has never been made out loud.

**F-ATMOS-4 🟡 — `TownScene.publishDiagnostics` assumed `scene.background` is always a `Color`. FIXED HERE.** `const background = this.scene.background as THREE.Color` then `background.getHexString()`. The first sky variant that set a texture background threw `TypeError: background.getHexString is not a function` on every frame, which killed the whole diagnostics publish — so `__GR_TOWN_DIAGNOSTICS__` never appeared and every harness in the repo timed out with no error message worth reading. Cost about forty minutes. The same file also reads `fog.color` through an unchecked cast; setting `scene.fog = null` throws there identically. Both are one-line hazards for any future look work.

**F-ATMOS-5 🟡 — a `tier=` in a spec's boot template silently overrides every per-test tier. NOTED.** `readPerformanceTierOverride` reads `params.get('tier') ?? params.get('performance')`, so a template carrying `tier=full` beats a test that appends `&performance=balanced`, with no warning. It cost this shift two red runs that looked like a tier-resolution bug. Any spec that wants to exercise the tier ladder must own the `tier` key outright.

**F-ATMOS-6 🟡 — the plate's silhouette ends at about 18 world units, not at its 22-unit bounds. NOTED.** `town-plate.glb` spans ±22 with y from −1.74 to +1.59; its outer margin falls away below y=0, so the ground the camera can see runs out ~4 units short of the accessor bounds. Anchoring the dune belt at 21.4 (inside the bounds, outside the silhouette) rendered a floating ridge with a band of sky under it. Anything that wants to meet the plate's edge has to meet it at ~18, and nothing in the repo says so.

**F-ATMOS-7 🟡 — a GLTF texture-blob race that the reload-with-flag boot can trigger. NOT MINE, characterised.** §5. Three frames of 32; four targeted repeats came back clean on both arms.

---

## 8. Deviations from the brief, stated plainly

1. **None of the three skies is a sky DOME**, which is what the town brief's U6 asked for. A dome cannot be seen: the top-of-frame ray is pitched below horizontal at every framing the town allows, so it passes *under* any hemisphere. What the camera can see is the ground running past the plate, so all three variants paint that band — and `c`'s ramp is authored as a real sky above it anyway, so a future camera-pitch ruling stands it up without a repaint.
2. **The town's six-shot list was re-aimed.** The brief's §4 list is five plaza framings and one mobile default, and all six sit where the void is 0% — the same place round one measured. Shooting the three skies there would have produced four identical columns. The board keeps `1-plaza-boot` as the control and moves the other seven moments to where a sky exists.
3. **`b` does not carry the sky ramp.** Its ring brackets every pitch the town can look along, so a second background draw would be a draw call for pixels nothing can see — the exact mistake U6 made. Measured: the ring differs from the ramp on 35.3% of the frame, i.e. everywhere the ramp would have shown.
4. **The baron's U5 "two-three distant company derricks" are three soft smoke columns in azimuth, not geometry.** Silhouette bodies on the apron would need a landmark pack rebuild, which is the class of risk that killed attempt one.
5. **U4 on Dry Gulch was not landed.** §4 gives the verdict on its owner's-desk ask instead.
6. **No p95 claim is made for the run maps.** The instrument was unusable while two dev servers and a gate sweep shared the box (99–150 ms p95 for unchanged scenes). Draw calls and triangles are byte-identical on both maps, and the change is a fragment-shader block on one material clone, so there is nothing for a frame budget to catch.

---

## 9. THE HONEST LINE — what still looks wrong

- **All three skies are answers to a band at the top of the frame, and the town's best framing does not contain that band.** From the plaza — where the player boots, where the board opens, where the contract launches — the four columns are identical. That is honest and it is also disappointing: the frame most players see most is the one frame this shift cannot touch. Making the plaza show sky is still a camera-pitch ruling, and it still belongs to the owner (F-1203-2).
- **Variant `a`'s dunes cannot be far away.** The camera reaches 31 units; anything at 31 units is off the top edge; so the belt has to sit at 20–30, which is the same order as the town itself. It reads as *hills just outside town* — pleasant, and not distance. There is no version of real geometry that fixes this without moving the camera.
- **The plate's rim is still a cut-out in `b` and `c`.** Give the void a sky and the rim becomes the most-looked-at edge in the frame — and it is a hard silhouette with the plate's baked relief on one side and flat colour on the other. `a` hides it; the other two do not.
- **The run-map apron only exists after the river.** 0.66% of the baron's fresh-eye frame, 3.8% of Dry Gulch's boot frame. Everything in §3 is a reward for pushing forward, and a player who holds their own bank will never see one pixel of it.
- **The apron's foothill banding and smoke barely register.** Rescaling the ramp made the *recession* work; the ridges and the smoke moved top-band luminance by about one unit even at 7× amplitude, and the honest reading is that they are shader instructions doing almost nothing. They stayed because the rescale made them cheap and plausible, not because they earned their place — if the next shift wants foothills, they want geometry or a texture, not a sine.
- **The apron is lit by the sun and it should not be.** It is a clone of the terrain material, so at dusk on any map that gets a night rig it will go dark while the sky above it stays bright. Neither of the two maps with a profile has a night rig, which is why it has not bitten yet.
- **Nothing here was judged by a human playing it.** Every verdict above is a measured render at a pinned camera. The board exists precisely because the last call is not mine.
