# BEAUTY BRIEF — THE CLAIM (`the-claim`)
E1 release map 1 of 5 · tutorial ground · locked-win at wave 10 + "Stay for the Rush"
Owner mandate (2026-07-11, verbatim): "The different maps should look beautiful."

## SHARED LAWS FOR EVERY UPGRADE IN THIS BRIEF (read once, obey always)
- RENDERING ONLY (constitution §4.6). Sim is planar and code-owned: water classification, fords, spawns, lanes, harvestAnchors, wave logic are untouchable. Visual height = render-side `visualY`.
- THE CONTRACT EQUALITY GATE: `Terrain3dClaimPilot.ts` `validTerrain()` requires EXACT mesh/triangle/material/vertex counts + bounds vs `assets/pilots/map-rebuild-spike/the-claim-terrain-contract.json` (and the panorama pair). Any GLB change regenerates the contract JSON in the SAME commit, else the map silently falls back to painted (the Mistake #10 shape). Verify after: canvas dataset `terrain3dPilotState='ready'`, `RenderSource='glb'`.
- Deterministic re-export: edit `build_the_claim_terrain.py` / the blend recipe, regenerate, reopen the saved blend, re-export byte-identical. Never hand-edit a delivered GLB (SOL-3D-D craftbook).
- Perf law: frame p95 within +15% of before, desktop AND 390px mobile, measured mid-wave. Night Shift 3D measured 9.8ms vs painted 41.2ms — there is headroom, do not spend it all.
- LITE tier keeps the painted path untouched. `map-beauty` render-budget style suites and the census must stay green. Zero console/page errors both viewports.
- Canon: Frontier Ledger style anchor — "fine sepia engraved linework and hatching, aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated." Teal = intelligence/active systems only. No letters/text in any atlas. No firearms language (ADR-001). Path-scoped commits, one concern each.

## 1. CURRENT STATE (three honest sentences)
Judged from `artifacts/opus5-fresh-eye/the-claim-run-camera.png` + `the-claim-overview.png` (2026-07-25), `reviews/shots-standing-orders-r2/play-r2b-the-claim-boot.png` (2026-07-31), and the source paint `assets/pilots/map-rebuild-spike/the-claim-terrain-atlas.png`: the map is broad pale parchment on both banks with two faint pad circles and one cart-rut pair, and the near-black river band is the only event on screen — the fresh-eye review graded it WEAK (F-OP5-12, `reviews/opus5-3d-findings.md`). Under the 3D sculpt every living-water surface is hidden (`Terrain3dClaimPilot.ts:175` LEGACY_GROUND_SLOTS hides `terrain.river`/`terrain.ford`/`terrain.bank`, `SpringPonds`, gravel bars), so the "river" is static baked paint with zero motion, and the five landmarks (active_headframe, maintained_claim_house, working_camp, claim_stake, riparian_dressing_pack) render full-bright via the emissive-readability hack (`keepLandmarkPaintReadable`, emissiveIntensity 3), ignoring the golden-hour sun entirely. The panorama atlas (`the-claim-panorama-atlas.png`) is a nearly featureless brown haze gradient — the first map of the shipped book opens against an empty horizon.

## 2. THE FIVE UPGRADES (prioritized)

**U1 — The river becomes water (the map's one event stops being a black slot).**
WHERE: `src/world/Terrain3dClaimPilot.ts` (mount path, this contract only) + `src/world/Water.ts` `createLivingWaterMaterial`. Mount a render-only animated water plane over the sculpt's channel bed: band centerZ 0, visualHalfWidth 6.25 (matches the production tile's declared water), y just above the baked bed, `depthWrite:false`, renderOrder above terrain, reusing the existing LivingWaterShader (flow, ripple, bank foam, gold-glint anchors near the sluice harvest anchors). Alternatively/additionally lift the channel-bed paint in `the-claim-terrain-atlas.png` from near-black to a deep teal-umber with engraved flow lines and gravel margins so the bed reads as water under the plane, not void.
WHY at camera: at the fixed run camera the band bisects every frame of every run; it is currently the darkest, deadest pixel field on screen while 33k-triangle detail bosses (boss-detail adoption, ~1–2% frame cost) set the quality bar elsewhere.
PERF: low–med. One draw call + an already-shipped shader; mobile rides `Balance.world.waterMobileQuality`. Atlas repaint alone is zero runtime cost.

**U2 — The banks earn their calm (travel pressure without losing the tutorial's gentleness).**
WHERE: `the-claim-terrain-atlas.png` via the recipe + re-export. Add exactly the craftbook's missing list (F-OP5-12 cites it verbatim): cart ruts converging from the south spawn edge to the center ford, a worn foot-ring around each build-pad circle, a darker damp silt band along both bank lips, one small gravel rubble patch downstream. Value moves ≤20%; this stays the calmest map in the game — worn-in, not fought-over.
WHY: "empty space is bad when it has no travel pressure, scar pattern, bank edge, rut, rubble, or sight rhythm" (SOL-3D-D). The first map teaches the camera language for the whole book.
PERF: low (texture only, same geometry — contract counts unchanged).

**U3 — Landmarks sit in the golden hour (re-balance the full-bright hack).**
WHERE: `src/world/Terrain3dClaimPilot.ts:294` `keepLandmarkPaintReadable` — currently `emissiveIntensity = 3` with the color map as emissive, which makes headframe/claim house/camp float in their own flat light. Make the intensity a per-contract tunable and A/B it down (try 1.2–1.6) for `the-claim` so the low sun (`LightRig` #ffd28a, 2.35) and soft shadows model the bodies; add soft contact ellipses under the five mounts (same recipe as `SpriteBlobShadows`, `LightRig.ts:426` — color #2e1b0e, opacity ~0.17).
WHY: the treatment exists because landmarks once went dark — do NOT remove it, re-balance it with before/after at the run camera; grounded, lit bodies are the cheapest "3D got better" read there is.
PERF: low. No new lights; 4 instanced shadow quads.

**U4 — The horizon gets a story (panorama repaint).**
> **STATUS 2026-08-04 — RETARGETED AT THE FAR GROUND, NOT THE SKY (THE FAR GROUND SHIFT, `reviews/beauty-far-ground.md`).**
> Measured on this map: the ring's foot stands **61.4 m above the top edge of the frame** at its own radius (161.5 m), and the panorama is **0.00% of the frame at 14 of 14 pose x viewport samples** — including with the terrain and apron hidden. (TASK.md called this slice U5; it is U4. The label is corrected here rather than quietly followed.)
> The panorama atlas is **not** repainted and its bytes are unchanged; what this slice asked the sky to say is now said by
> `src/world/HorizonApron.ts` on the sculpt continuation, at +0 draw calls and +0 triangles. **Do not re-brief this as sky art
> until `Balance.camera` changes** — `e2e/beauty-far-ground.spec.ts` guards the arithmetic and goes red the day it does.

WHERE: `assets/pilots/map-rebuild-spike/the-claim-panorama-atlas.png` + blend, re-export at IDENTICAL geometry (panorama contract counts unchanged). Paint per the craftbook's panorama laws: busy near the horizon — downstream river valley ridges, a timber line, one faint distant headframe in sepia engraving — with density falling to quiet parchment at the zenith (the Ceiling fix); irregular ridge + haze band at the join (the Painted Wall fix); no repeated silhouettes around the ring (the Echo fix).
WHY: every boot and every zoom-out frames this sky; the first page of the book currently opens on fog-grey nothing.
PERF: low (texture swap). Verify MQ-2's wide-aspect case: no backplate band at aspect >1.8:1 (the `cam-claim-wide.png` fingerprint in the register).

**U5 — Motes, glints, and the Rush (living air, strictly capped).**
WHERE: new render-only instanced quad mesh mounted by the pilot for this contract: ≤200 additive dust-mote/pollen quads drifting through the sun direction, distance-faded; plus 3–4 gold glint anchors on the water plane near the sluice line (the shader's `waterGoldGlints` already takes anchors); plus a warm ember-lift on the claim_stake ring while a post-secure "Stay for the Rush" run is active (RunManager exposes the rush state).
WHY: the Claim is the postcard map — motion in the light is what screenshots can't fake, and the Rush deserves one visible reward note.
PERF: med. First to shed under the MQ-4 auto-tiering watchdog; cap counts, one material, one draw call.

## 3. THE DON'TS
- Don't touch: the sim river band, ford (x=0, halfWidth 3), spawn edges, harvestAnchors, lanes, the wave-10 locked-win/Rush flow — all sim.
- Don't scar this map. No wreckage, no scorch, no siege grammar — battle-worn belongs to the Baron. The Claim's identity is the calm first page (the fresh-eye explicitly flagged its calm as arguably deliberate; keep the calm, add only life).
- Don't move or re-silhouette the five landmarks (mount transforms are terrain-owned; players have learned the tent/claim-house/headframe reads since M0).
- Don't repaint greens lush (desaturated, dusty — brief §4.1) and don't spend teal anywhere but agent-tech.
- Don't ship a GLB whose contract JSON wasn't regenerated in the same commit; don't touch the LITE/painted path; don't edit `Terrain.ts` sim functions.

## 4. SHOT LIST (before/after pairs, desktop 1280×800 unless noted)
1. Plain boot, no `?debug` — the standing-orders framing (tent + claim house + stake + river bridge): `reviews/shots-standing-orders-r2/play-r2b-the-claim-boot.png` is the "before".
2. The fixed fresh-eye run camera `(0,-30.3,26.26) → (0,-8.65,0.51)`, 42° — the readability judge; must beat the WEAK verdict board in `artifacts/opus5-fresh-eye/`.
3. River close-up at the ford, mid-wave, enemies crossing — water motion + foam + glints visible.
4. Wave-10 secured with the "Stay for the Rush" choice up, sluices + stockpile in frame.
5. Mobile 390px plain boot.
6. Max zoom-out at ~2:1 aspect — panorama story visible, zero backplate band (MQ-2 evidence).

## 5. STYLE ANCHOR
"The first page of the ledger: sunlit parchment banks where the river writes the only dark line, and every faint rut says a working life is gently beginning."
