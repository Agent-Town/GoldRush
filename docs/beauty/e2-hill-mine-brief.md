# BEAUTY BRIEF — THE HILL MINE (`e2-hill-mine`)
E2 map 1 of 4 · the Steamworks poster · terraced high ground above the flooded rail cut · Railhead Escort + the Armored Railcar at wave 12
Owner mandate (2026-07-11, verbatim): "The different maps should look beautiful."

## SHARED LAWS FOR EVERY UPGRADE IN THIS BRIEF (read once, obey always)
- RENDERING ONLY (constitution §4.6). E2's elevation is SIM: `src/sim/TileHeight.ts` (`simHeight` analytic, `terrainSpeedMultiplier`, the LOS check with eye heights) plus water classification, fords, spawns, lanes, rails data, harvestAnchors, pressure/escort/boss logic are untouchable. E2's sim-real LOS and high ground ARE this map's identity — the shift's whole job is making the render SAY what the sim already enforces.
- THE CONTRACT EQUALITY GATE: `Terrain3dClaimPilot.ts` `validTerrain()` vs `assets/pilots/map-rebuild-spike/hill-mine-terrain-contract.json` (+ the panorama pair). Any GLB change regenerates the contract JSON in the SAME commit or the map silently falls back to painted (Mistake #10). Verify after every mount: `terrain3dPilotState='ready'`, `RenderSource='glb'`, landmarks 5, skipped 0.
- **THE ARMED TRAP (F-BEAUTY-BARON-2, live here):** `build_e2_contract_terrains.py:854` writes `landmarkMounts` from its own profile table — NO `asset`/`landmarkPack` carry-forward. A faithful atlas re-export will silently un-mount all five landmarks while every gate stays green. Port `carry_forward_mount_records()` (`build_unique_contract_terrains.py:1404`, the baron fix) into the E2 builder BEFORE the first re-export, and prove mounts by dataset, not by rc=0.
- Deterministic re-export: edit the recipe, regenerate, re-export; control-run the unchanged recipe first (the claim's U2 protocol). Never hand-edit a delivered GLB. Never rebuild the landmark PACK (`hill-mine-landmark-pack-contract.json` bodies) — pack pipelines drift (F-BTB-1 class); tune landmark reads via the per-contract emissive/paint arguments instead.
- Perf law: frame p95 within +15%, desktop AND 390px mobile, measured mid-wave against the build's own `?nobeauty` arm (`DebugParams.isMapBeautyDisabled` — shipped by the claim shift; single-run p95 on this box measures the machine, not the change). LITE keeps the painted path untouched. `map-census`, `terrain3d-registry`, `e2e/e2-hill-mine.spec.ts` stay green. Zero console/page errors both viewports.
- Canon: Frontier Ledger style anchor verbatim (engraved sepia, warm, illustrated, never photoreal). E2 regional family (contract, verbatim): "ochre-rust earth, soot iron, tarred timber, murky working water, sparse cacti, engraved frontier grit". Steam is WHITE, never dark smoke (`specs/epoch-saga/e2-steamworks-bundle.md` §A1 warm law). Teal = agent-tech only. No letters in atlases. No firearms (ADR-001). Path-scoped commits.

## 1. CURRENT STATE (three honest sentences)
Judged from `reviews/shots-beauty2-e2-director/e2-hill-mine-{run-camera,gallery-trestle,upper-terraces}.png` (fresh probe, 2026-08-03: state=ready, glb, landmarks 5/0 skipped, emissive 3, zero console errors) plus `artifacts/e2-hill-mine/desktop-chrome-{flooded-gallery,terraces-wide}.png`: the flooded gallery — the map's named story and its central band — renders as a pitch-black void the full width of every frame (the pilot hides `terrain.river`/`terrain.ford`/`FordSteppingStones` and the baked bed is near-black), so the prospector and the escort cart cross what reads as a rendering hole, not working water. The boiler-house-site's crimson roof at `emissiveIntensity 3` is the loudest pixel field on the map (the baron's "circus tents" disease exactly), the pale landmark plinths float unshadowed, and the terrace faces that BLOCK BOLTS in the sim read as soft black smears (`slopeShade 0.62` darkening with no cut-stone language), while the switchback rail kit's segments sit disconnected on the slope. The rails themselves — 442 instances, 2 draw calls, and E2's signature line — are self-confessed placeholder boxes (`RailPath.ts` diagnostics: `asset: 'procedural-placeholder'`, the 'steamworks' vs 'mine-spur' styles render identically), and nothing on the map moves or steams: the era's name is nowhere in its air.

## 2. THE FIVE UPGRADES (prioritized)

**U1 — The flooded gallery becomes murky working water (the void stops eating the map).**
WHERE: `src/world/Terrain3dClaimPilot.ts` — add `e2-hill-mine` to `SCULPT_WATER_CONTRACTS` (:259) and lift the inlined claim palette (`mountSculptWater`, color `#c9b892`/0.70) into a per-contract water-dressing entry (the `LANDMARK_EMISSIVE`/`CONTRACT_CHANNEL_WATER` table pattern). This map's entry: murky slate-teal multiplied over the near-black bed (regional family says "murky working water" — NOT the claim's clear river), opacity high enough that the bed reads through as depth; the declared trestle ford (x=0, halfWidth 4) keeps its warm skim so the crossing the sim calls shallow never reads dry; damp wet-edge margins from the bed-depth bake; 2–3 sparse glints at the wet edge only.
WHY at camera: the gallery bisects the run camera, the escort route rides through it, and it is currently the darkest dead field in E2 — the same disease the claim's U1 cured, with the machinery already shipped and contract-scoped.
PERF: low. One draw call, the shipped shader; the bed-depth bake is boot-time. Cache-key fix for two-material maps already landed (F-BC-3).

**U2 — The terraces read as cut ground (the sim's high-ground law becomes visible).**
WHERE: `hill-mine-terrain-atlas.png` via `build_e2_contract_terrains.py` + re-export (carry-forward ported FIRST — shared law). Paint: strata hatching + a hard top-lip line on the bench faces where the black smear bands run now (a face that blocks bolts should look like cut rock, not shadow); timber-crib marks at the bench lips (the bundle's A5 timber-cribbing vocabulary); cart-rut convergence up the declared switchback ramps (t1 z 5–14, t2 z 18–26, t3 z 32–40); a scree spill below the cliff band (x −16…16, z 18–23); a tailings fan below the mine mouth crown at (−6, 41); worked-stone rings on the T2/T3 premium pads. Value moves ≤20%; parchment warmth stays under everything.
WHY: "empty space is bad when it has no travel pressure, scar pattern, bank edge, rut, rubble, or sight rhythm" (SOL-3D-D craftbook, verbatim) — and this map's briefing card promises terraces the render currently smears.
PERF: zero runtime (texture only, contract counts unchanged — verify byte-identical counts in the regenerated JSON).

**U3 — Landmarks sit in the golden hour, and the red roof stops shouting.**
WHERE: `Terrain3dClaimPilot.ts` — `LANDMARK_EMISSIVE` entry for `e2-hill-mine` (A/B 1.3–1.6 at the run camera; the claim landed 1.45) plus the per-contract paint argument (`keepLandmarkPaintReadable` tint — the baron U2 precedent) pulling the boiler-house crimson toward oxide-iron so it reads soot-iron, not circus. Add the claim's instanced contact-shadow pools under the mounts, leaned along the `LightRig` sun export, skipping any mount whose measured bed sits in the gallery (the riparian rule).
WHY: fresh probe shows emissive 3 on all five bodies — full-bright paint floating in its own light while the low sun models everything else; grounded lit bodies are the cheapest "3D got better" read there is.
PERF: low. No new lights; one instanced pool.

**U4 — The era breathes: steam on the steam anchors.**
WHERE: new render-only instanced puff field mounted by the pilot for this contract (the `SunMotes.ts` pattern; the `BoilerHouse.ts` plume recipe proves the look): a white steam column drifting from the boiler-house-site stack and a slow vent wisp at the mine mouth — capped quads, one material, one draw call, FULL tier, registered in the MQ-4 shed order. Optionally scale the plume rate by the PressureSystem's hot-boiler state through a host callback (render-only read; the Rush-ember gate precedent).
WHY: the era is named Steamworks and the fresh boards show zero motion in its air; steam anchored to named landmarks is the single cheapest era-identity win on the poster map.
PERF: med (the cap IS the design; sheds first under MQ-4).

**U5 — Coal dust in the light, and the escort earns a lantern.**
WHERE: `SUN_MOTE_CONTRACTS` entry with the mote tint pulled toward umber-soot (the claim's motes read as snow over dark water — tint, don't count-cut, is the recorded fix), counts per the claim caps; plus one warm lantern glow quad + a small white stack puff riding the escort ore cart's existing render path while it moves (render-only, the fog-gated railcar mesh family).
WHY: the Railhead Escort is this map's mode and the cart is currently a bare box crossing a void; motes in the low sun are what screenshots can't fake.
PERF: low–med. One mote draw call; cart dressing rides an existing mesh path.

## 3. THE DON'TS
- Don't touch sim: `TileHeight.ts`, water classification, the ford, spawn gates, rails DATA, harvest anchors, pressure/escort/boss logic, wave numbers.
- Don't rebuild the landmark pack and don't re-export terrain without the carry-forward port + a mount-count probe (the two armed traps, named above).
- Don't repaint the panorama. The sky ring is behind the player's head at the shipped rig (F-BEAUTY-BARON-3; the claim's forced-visibility probe measured 0–2 px) — horizon work is an owner-desk framing ruling, not an art batch. Spend that effort on U4.
- Don't make the gallery pretty-clear — it is MURKY working water (regional family verbatim); don't spend teal anywhere but agent-tech; steam white, never dark.
- Don't replace `RailPath`'s placeholder geometry per-map — a real rail body is a program-level slice all four maps share (flag it, don't fork it).
- Don't scar beyond use: ruts where traffic runs, scree where it falls; no siege grammar, no gore.

## 4. SHOT LIST (before/after pairs, desktop 1280×800 unless noted)
1. Plain boot, no `?debug` — seeded `epoch-2-steamworks` profile → town board → launch (the `e2e/e2-hill-mine.spec.ts` route); contract card up over the terraces.
2. The run camera at hero start (0, 12) — `reviews/shots-beauty2-e2-director/e2-hill-mine-run-camera.png` is the "before": boiler site + gallery + rail cut in one frame.
3. The gallery at the trestle ford, mid-wave, toughs wading — water motion, wet edge, warm ford skim (before: `…-gallery-trestle.png`).
4. Wave 12: the Armored Railcar rolling the cut, components lit, steam up (the boss the arena currently embarrasses).
5. Upper terraces at the mine mouth (before: `…-upper-terraces.png`) — cut faces, switchback ruts, tailings fan, steam wisp.
6. Mobile 390px plain boot + max zoom-out ~2:1 (MQ-2 evidence: no backplate band).

## 5. STYLE ANCHOR
"The first page of the age of steam: cut terraces that earn their high ground, iron water working in the rail cut, and one white plume saying the boilers are lit."
