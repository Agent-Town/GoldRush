# BEAUTY BRIEF — THE PRESSURE GARDEN (`e2-pressure-garden`)
E2 map 3 of 4 · the pressure lesson · four stepped terraces above one clean water band, three boiler beds, no rails, no boss — survive to wave 12 with the boilers hot
Owner mandate (2026-07-11, verbatim): "The different maps should look beautiful."

## SHARED LAWS FOR EVERY UPGRADE IN THIS BRIEF (read once, obey always)
- RENDERING ONLY (constitution §4.6). Sim untouchable: `src/sim/TileHeight.ts` elevation, water classification (band z ±5, shallows ±6.25, garden-crossing ford x=0 halfWidth 6), spawn gates, harvest anchors, the whole PressureSystem (coal, safe band, venting) and its HUD. Boiler heat is a sim state; the render may READ it, never write it.
- THE CONTRACT EQUALITY GATE: `validTerrain()` vs `assets/pilots/map-rebuild-spike/pressure-garden-terrain-contract.json` (+ panorama pair); GLB change ⇒ contract regenerated same-commit (Mistake #10). Verify `ready`/`glb`, landmarks 5, skipped 0.
- **THE ARMED TRAP (F-BEAUTY-BARON-2, live here):** `build_e2_contract_terrains.py:854` writes mounts with no `asset` carry-forward — port `carry_forward_mount_records()` (`build_unique_contract_terrains.py:1404`) before any re-export; prove mounts by dataset after.
- Deterministic re-export with an unchanged-recipe control first; never hand-edit a GLB; never rebuild the landmark pack (its five bodies re-verified contract-matching, `reviews/sol-findings-lm-beta-pressure-garden.md`).
- Perf law: p95 ≤ +15% desktop AND 390px, mid-wave, against the build's own `?nobeauty` arm. LITE untouched. `e2e/e2-pressure-garden.spec.ts`, `e2e/e2-pressure-in-run.spec.ts`, `map-census`, `terrain3d-registry` green. Zero console/page errors.
- Canon: Frontier Ledger anchor verbatim; E2 regional family "ochre-rust earth, soot iron, tarred timber, murky working water, sparse cacti, engraved frontier grit" — with this map's licensed exception: its briefing and ledger call the band "one CLEAN water band", the era's one clear water. Steam white, never dark; E2's warm-glow accent is iron-amber (`townEraAccents[2]` glass `#d9975b`/`#f1b56f` — boiler-bed and vent glows key to it); teal = agent-tech/gauge lenses only; no letters; no firearms. Path-scoped commits.

## 1. CURRENT STATE (three honest sentences)
Judged from `reviews/shots-beauty2-e2-director/e2-pressure-garden-{run-camera,water-band,coal-bed-terrace}.png` (fresh probe 2026-08-03: ready/glb, landmarks 5/0, emissive 3, zero console errors) plus `artifacts/e2-pressure-garden/desktop-chrome-boilers-hot.png`: the "clean water band" is the biggest black void in E2 — a full-frame-width ink slab eating the upper third of the boot framing — and the water-band pump station stands INSIDE it, a grey-and-red body floating in nothing. This is the darkest map of the four by authored palette (tint 0.66/0.61/0.50, macroWarmth 0.58) and it currently overshoots into murk: the boiler terrace reads as brown gloom with three dim stake tables, the growing terraces that give the map its name carry no growing marks at all (no rows, no tended rhythm — just scatter specks), and the pad etchings are near-invisible, while the terrace steps read as soft shadow smears rather than built ground. Its one industrial theatre already works — the vent plume and the pressure HUD (`artifacts/e2-pressure-in-run/desktop-chrome-vent-plume.png`) — but the five landmarks around it all burn full-emissive (the pipe headers at x ±50 stand on the continuation ring off-tile), nothing steams at idle, and the "garden" half of the identity exists only in the contract prose.

## 2. THE FIVE UPGRADES (prioritized)

**U1 — The clean band earns its adjective (E2's one clear water).**
WHERE: `Terrain3dClaimPilot.ts` — `SCULPT_WATER_CONTRACTS` + this contract's water-dressing entry: teal-green CLARITY against the era's murk (the deliberate contrast the briefing hands us: "the single water band has a broad north bank for legal sluice work"), gentle chop, bed reading through warm at the margins, the wide garden-crossing ford (hw 6) as a bright wading shelf; damp margins along the boiler terrace's south lip; glints seated near the four declared `sluiceSamples` (±30/±12, z 7). Give the pump station a wet collar — a foam ring where its piers meet the surface — so the landmark stands IN water instead of floating in void.
WHY at camera: the band bisects the boot framing and it is currently the largest single dead field in the epoch; the garden's water is its irrigation source and its calmest read — the one E2 water allowed to be beautiful-clear.
PERF: low. One quad + shipped shader; the collar rides the water material's foam terms.

**U2 — The terraces become the garden (rows, coal, and a readable gradient).**
WHERE: `pressure-garden-terrain-atlas.png` via the recipe + re-export (carry-forward first). Paint the map's bottom-to-top gradient so it reads at the run camera: damp silt + sluice-worn bank on the north lip → service-path ruts linking the three boiler beds (stake markers at x −12/0/12, z 12) → row-furrow engraving on BOTH growing terraces (tended line rhythm, the era's industrial-pastoral thesis — combed ground, not crops; desert law holds, no lush greens) → soot wash, coal glitter specks and seam scars on the coal-bed terrace around its harvest anchors. Lift the growing terraces' value toward warm parchment (≤20% moves) so the authored coal-dark palette stays for the TOP band instead of drowning the whole map.
WHY: the map is named for a garden the render never shows; the craftbook's grit law — "roughness must follow use … patched care where people are still trying to live" — is this map's entire personality.
PERF: zero runtime (texture only; counts byte-identical).

**U3 — Landmarks into the golden hour, grounded on worked pads.**
WHERE: `LANDMARK_EMISSIVE` + per-contract paint tint for `e2-pressure-garden` (A/B 1.3–1.6; tame the manifold/pump reds toward oxide); contact-shadow pools under the mounts — with two measured exceptions: the pump keeps its U1 wet collar instead of a pool, and the pipe headers at x ±50 sit on the continuation ring, so their pools must ride the continuation surface or be skipped by measurement (the claim's riparian-skip rule, applied off-tile). U2's atlas adds service clearings under the manifold and winch so every body stands on prepared ground.
WHY: emissive 3 on all five today; the pump floating in the void band is the map's single worst read and U1+U3 together retire it.
PERF: low. Pools instanced; no lights.

**U4 — The garden breathes pressure (heat you can see, honestly gated).**
WHERE: shipped, contract-scoped machinery: a `HEAT_PROFILES` entry (`LightRig.ts:93`, the dry-gulch shimmer band + its auto-tier stress gate verbatim) active over the boiler terrace ONLY while the sim reports ≥2 boilers hot — read through a host callback like the Rush-ember gate; steam wisps at the pipe-header and manifold joints (instanced, capped, white); optionally scale the shipped `BoilerHouse` plume rate by the pressure band (render-only read of the safe-band state the HUD already shows).
WHY: this is the map where pressure IS the crop — the sim already models hot/safe/venting and the render shows none of it between vents; borrowed shimmer + breathing joints make the lesson visible without one sim byte.
PERF: med. Shimmer is the dry-gulch copy (sheds first under MQ-4); wisps capped ≤8.

**U5 — Soot in the light.**
WHERE: `SUN_MOTE_CONTRACTS` entry with motes tinted toward soot-umber, density biased over the coal-bed terrace (seeded placement, same caps as the claim); keep the existing vent-plume moment as a first-class shot rather than adding to it.
WHY: dust above the coal bed in the low sun is the cheapest closing note of the gradient U2 paints, and motion in the light is what stills can't fake.
PERF: low. One draw call, seeded, capped.

## 3. THE DON'TS
- Don't touch sim: PressureSystem, coal seams, boiler beds, spawn gates, the ford, band classification, `TileHeight.ts`.
- Don't re-export without the carry-forward port + mount probe; don't rebuild the landmark pack; don't hand-edit GLBs.
- Don't repaint the panorama (F-BEAUTY-BARON-3 — sky ring behind the camera; owner-desk framing ruling first).
- Don't make the band murky (its cleanliness is authored contrast — the briefing's word) and don't flood the north sluice bank (mask-agreement law).
- Don't paint crops or lush green — combed rows and tended care, desert vocabulary (SOL-3D-D: "desert means cacti and dry brush, not trees"); don't let the coal grade re-darken the whole map (the grit-grade global-budget lesson, twin-banks U2).
- Don't fake heat where the sim says cold: the shimmer and plume-rate reads are gated on real state or they lie about the lesson.

## 4. SHOT LIST (before/after pairs, desktop 1280×800 unless noted)
1. Plain boot, no `?debug` — seeded profile with trestle secured → board → launch (the `e2e/e2-pressure-garden.spec.ts` route); the gradient readable behind the card.
2. Run camera at hero start (−12, 12) — before: `reviews/shots-beauty2-e2-director/e2-pressure-garden-run-camera.png` (band + pump + boiler beds).
3. The band at the garden crossing (before: `…-water-band.png`) — clear water, wading shelf, pump wet collar, glints on the sluice line.
4. Boilers hot, waves 8–12: shimmer over the terrace, plumes breathing, the pressure pill in its safe band (the lesson frame).
5. The coal-bed terrace (before: `…-coal-bed-terrace.png`) — soot, seam scars, winch on its service clearing, soot motes in the light.
6. Mobile 390px boot + max zoom-out ~2:1 (MQ-2: no backplate band; the off-tile pipe headers checked at wide aspect).

## 5. STYLE ANCHOR
"The garden where pressure is the crop: one clean ribbon of water feeding three warm boiler beds, terraces combed in patient rows, and the coal seam's soot held to the top of the frame like a storm that pays wages."
