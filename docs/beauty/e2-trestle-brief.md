# BEAUTY BRIEF — THE TRESTLE (`e2-trestle`)
E2 map 2 of 4 · the crossing · one long rail line over a deep gorge between two defended approaches · Trestle Crossing escort · unlocks after the Hill Mine
Owner mandate (2026-07-11, verbatim): "The different maps should look beautiful."

## SHARED LAWS FOR EVERY UPGRADE IN THIS BRIEF (read once, obey always)
- RENDERING ONLY (constitution §4.6). Sim untouchable: `src/sim/TileHeight.ts` elevation/LOS, water classification (deep band z ±5, shallows ±6.25, the one trestle ford x=0 halfWidth 3), spawns on all four edges, rails DATA, harvest anchors, escort/boss logic. The gorge's depth is a sim fact; this shift's job is to render it.
- THE CONTRACT EQUALITY GATE: `validTerrain()` vs `assets/pilots/map-rebuild-spike/trestle-terrain-contract.json` (+ panorama pair); GLB change ⇒ contract regenerated same-commit, else silent painted fallback (Mistake #10). Verify `terrain3dPilotState='ready'`, `RenderSource='glb'`, landmarks 6, skipped 0 — this map mounts SIX bodies, the most in E2.
- **THE ARMED TRAP (F-BEAUTY-BARON-2, live here):** `build_e2_contract_terrains.py:854` writes `landmarkMounts` with no `asset` carry-forward — a faithful re-export un-mounts all six landmarks with every gate green. Port `carry_forward_mount_records()` (`build_unique_contract_terrains.py:1404`) into the E2 builder first; prove mounts by dataset after.
- Deterministic re-export with an unchanged-recipe control run first; never hand-edit a GLB; never rebuild the landmark pack (six bodies incl. the trestle span — pack pipelines drift, F-BTB-1 class).
- Perf law: p95 ≤ +15% desktop AND 390px, measured mid-wave against the build's own `?nobeauty` arm. LITE untouched. `e2e/e2-trestle.spec.ts`, `map-census`, `terrain3d-registry` green. Zero console/page errors.
- Canon: Frontier Ledger anchor verbatim; E2 regional family "ochre-rust earth, soot iron, tarred timber, murky working water, sparse cacti, engraved frontier grit"; steam white, never dark; E2's warm-glow accent is iron-amber (`townEraAccents[2]` lantern glass `#d9975b`/`#f1b56f` — cart and yard glows key to it, not E1's pale gold); teal = agent-tech only; no letters in atlases; no firearms (ADR-001). Path-scoped commits.

## 1. CURRENT STATE (three honest sentences)
Judged from `reviews/shots-beauty2-e2-director/e2-trestle-{run-camera,crossing-north,south-approach}.png` (fresh probe 2026-08-03: ready/glb, landmarks 6/0, emissive 3, zero console errors) plus `artifacts/e2-trestle/desktop-chrome-crossing.png`: the map's thesis object — the timber trestle span, six countable bents of warm cribbing carrying the line — is genuinely good, and it crosses a gorge that renders as a pure black void the full width of the frame, so the game's most dramatic crossing reads as a bridge over a rendering hole ("Ford — the only crossing bandits know" tooltips over featureless black). At the south hero start the gorge is entirely off-frame and the approach reads as a flat brown yard: the mine-spur kit's platforms and its pale steps float bright and unshaded, red barrels and the crane arm sit on unprepared ground, and both boiler-site roofs burn full-emissive crimson (the loudest objects in every frame, emissive 3 on all six bodies). Wave-1 toughs walk the approaches with lantern glows that are currently the only living light on a map with no steam, no water motion, and value-dead gorge walls the low sun never lifts.

## 2. THE FIVE UPGRADES (prioritized)

**U1 — The gorge gets its river (deep water you can fear).**
WHERE: `Terrain3dClaimPilot.ts` — `SCULPT_WATER_CONTRACTS` + this contract's water-dressing entry (per-contract table, landed by the hill-mine shift or landed here): the deepest, darkest read of the four E2 waters — slate-teal murk over the carved bed with `deepMeters` tuned up so mid-channel stays near-black ON PURPOSE while the margins and the ford shelf lighten from the bed-depth bake; the declared ford (x=0, hw 3) keeps its warm wading skim under the span; foam collars where the shipped shader's bank foam meets the pier line.
WHY at camera: the crossing shot (`…-crossing-north.png`) is the map's postcard and today its lower two-thirds is void; a bridge is only as tall as the water under it reads deep.
PERF: low. One quad + shipped shader; bake at boot.

**U2 — The gorge walls and approaches earn the story.**
WHERE: `trestle-terrain-atlas.png` via the recipe + re-export (carry-forward first). Paint: strata + a waterline stain ring on the gorge walls; a cool skylight lift applied AFTER the grit grade on the south-facing cut walls (the twin-banks U2 lesson verbatim — post-grade lifts are local and don't tax the banks' global value budget); cart-rut convergence from both build zones down to the crossing; prepared ground under the spur-yard kits — pads, rubble margins, a service track from the spur to the line — so the floating props stand on worked earth; damp silt on both bank lips.
WHY: "landmarks should sit on prepared ground: pads, scars, approach roads … floating props are worse than no props" (SOL-3D-D craftbook, verbatim); the walls that make this map a gorge are currently value-dead.
PERF: zero runtime (texture only; counts byte-identical in the regenerated contract).

**U3 — Landmarks into the golden hour, and the span casts its shadow.**
WHERE: `LANDMARK_EMISSIVE` + per-contract paint tint (baron precedent) for `e2-trestle`: A/B 1.3–1.6, both boiler-site roofs pulled crimson→oxide-iron, the spur kit's bleached steps and platforms re-seated by the same tame; contact-shadow pools under the five ground mounts; and one stretched soft contact band under the trestle span cast onto U1's water surface (the blob-shadow recipe elongated along the span, depth-tested against the water plane) so the bridge visibly stands OVER the river instead of floating beside it.
WHY: emissive 3 floats all six bodies today; the span's shadow on moving water is the single frame that proves the gorge has depth.
PERF: low. Instanced pools + one quad; no lights.

**U4 — The crossing breathes (steam and the gorge's exhale).**
WHERE: render-only, pilot-mounted for this contract: a white stack puff riding the escort ore cart's existing render path while it crosses; two or three slow murk-wisps rising from the gorge water and fading (the baron ember-wisp instanced family, additive, cap ≤8, oldest recycled); FULL tier, MQ-4 shed-order registered.
WHY: the Trestle Crossing mode is the map's name; a cart trailing steam over exhaling water is the era's whole thesis in one moving frame — and today nothing on this map moves but enemies.
PERF: med, capped; wisps hide when their pool drains (idle frame returns to the old draw count).

**U5 — Living air and the wide postcard.**
WHERE: `SUN_MOTE_CONTRACTS` entry, motes tinted umber (the claim's snow-over-dark-water lesson); two gold glint anchors on the south bank's sluice-legal wet margin only (briefing: "the south bank beside the base remains open for sluice work"); and the 2:1 wide framing becomes first-class evidence — the whole line, both approaches, the span and its water in one frame (this map's MQ-2 wide-aspect check doubles as its marketing shot).
WHY: the full line at 2:1 is the composition the map was built around ("one long rail line crosses a deep river gorge", briefing verbatim) and no shipped shot has ever framed it with living water.
PERF: low. One mote call; glints ride the water material.

## 3. THE DON'TS
- Don't touch sim: the ford, deep-band classification, four-edge spawns, rails data, escort/boss logic, `TileHeight.ts`.
- Don't re-export without the carry-forward port + mount probe (landmarks 6/0 asserted); don't rebuild the pack; don't retint pack parts (no per-part paint without a pack rebuild — reject-don't-stretch).
- Don't repaint the panorama (F-BEAUTY-BARON-3: the sky ring is behind the camera at the shipped rig; owner-desk framing question, not an art batch).
- Don't sway the trestle span — a load-bearing bridge that moves reads as failure, not life (the banner-sway trick is for cloth).
- Don't clear the water — murky working water, verbatim; keep mid-channel dark; don't flood the buildable approaches (mask-agreement law: "a beautiful river that covers buildable bank is wrong").
- Don't fork `RailPath` per-map; the placeholder rail body is a shared program slice.

## 4. SHOT LIST (before/after pairs, desktop 1280×800 unless noted)
1. Plain boot, no `?debug` — seeded profile with hill-mine secured → board → launch (the `e2e/e2-trestle.spec.ts` route): south approach with the contract card up.
2. Run camera at hero start (12, −12) — before: `reviews/shots-beauty2-e2-director/e2-trestle-run-camera.png` (boiler site + spur yard).
3. The crossing, mid-wave, hero on the span — before: `…-crossing-north.png`; after must show water, pier foam, span shadow.
4. The escort cart mid-span, steam trailing, enemies pressing both approaches (the mode's money shot).
5. South approach yard (before: `…-south-approach.png`) — prepared ground under the kits, ruts to the crossing.
6. Mobile 390px boot + the 2:1 wide full-line frame (MQ-2 evidence AND the postcard).

## 5. STYLE ANCHOR
"One long line over deep water: warm timber counting its bents across a gorge that finally holds a river, and a white plume crossing between two banks that both know who held them."
