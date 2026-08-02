# BEAUTY BRIEF — THE CLAIM-JUMPER BARON (`e1-baron`)
E1 release map 5 of 5 · THE FINALE · the Baron rides the rocket cart against your claim; launch gate requires "Baron 22/22"
Owner mandate (2026-07-11, verbatim): "The different maps should look beautiful."

## SHARED LAWS (identical to all E1 briefs — non-negotiable)
- RENDERING ONLY (§4.6): the fight choreography (`src/game/BaronFort.ts`, launcher/volley logic, prebuilt palisades, spawns, lanes) is sim — untouchable. The E1 launch gate names "Baron 22/22" (specs/release-e1/README.md): the Baron suites + `fix-baron-boss-fight` evidence must stay green untouched.
- CONTRACT EQUALITY GATE: GLB edits regenerate `baron-terrain-contract.json`/panorama counts+bounds same-commit or silent painted fallback (Mistake #10). Verify `terrain3dPilotState='ready'`, `RenderSource='glb'`.
- Deterministic re-export; never hand-edit a GLB. Landmark swaps in place: same mount ids (fortified_far_bank, seized_headframe, rocket_cart, siege_line, oxblood_banners), ≤3,000 tris/body, one pack atlas.
- Perf p95 +15% law, desktop + 390px mobile — THIS map ships the most VFX of the five, so it carries the tightest evidence: before/after p95 table measured MID-VOLLEY. Reuse existing light budgets (6 muzzle-flash spotlights in LightRig); add zero new dynamic lights. LITE untouched. Zero console/page errors.
- Canon: ADR-001 — rockets/black-powder/steam frontier-tech, NO firearm language ever; violence illustrated, never gory — splinters, dust and embers at impacts, never remains. The Baron is an outlaw COMPANY antagonist (brief §9.3). No text in atlases (the taunt banner is HUD, not world paint). Path-scoped commits.

## 1. CURRENT STATE (three honest sentences)
Judged from `artifacts/baron-presence/desktop-chrome-baron-arrival.png` + `-carried-launcher.png` (2026-08-02, the freshest shots in the repo), the source paints `baron-terrain-atlas.png` / `baron-panorama-atlas.png`, and `reviews/eight-winds/gen/baron-*.png` (2026-07-28): the finale plays on the plainest canvas of the five — the terrain atlas is uniform mottled brown with one near-black river band and a single scorch line, and in-game the entire fort half of the map sinks into one undifferentiated murk band behind the siege line. The panorama is a featureless dark-brown gradient: the book's last chapter ends against the emptiest sky in the game. Meanwhile the Baron himself just received the eight-winds directional sprite treatment and the boss-detail duel set a 30k-triangle detail bar for bosses (`reviews/boss-detail-adoption.md`) — the arena now visibly embarrasses its boss, which is exactly the wrong direction.

## 2. THE FIVE UPGRADES (prioritized)

**U1 — Fought-over ground (the atlas earns the finale).**
WHERE: `baron-terrain-atlas.png` + blend re-export (geometry unchanged, contract counts stable). Full Grit-Law grammar, engraved not airbrushed: cart-churned mud lanes from the siege_line to the ford; scorch fans + ember speckle at 4–6 rocket-impact pads scattered on the player's bank (foreshadowing his volleys); a wreck margin of stumps and cut stakes where the fort ate the far bank; banner-shadow stains along the siege line; keep parchment warmth underneath — desperate, not horror.
WHY at camera: before wave 1 the ground must already say "someone lost here once" — the finale's stakes should be legible in the dirt, and today the dirt says nothing.
PERF: zero (texture only).

**U2 — Two sides, two lights (the duel becomes readable).**
WHERE: `baron-terrain-atlas.png` (north half) + the landmark pack atlas + the per-contract emissive tunable (`keepLandmarkPaintReadable`, `Terrain3dClaimPilot.ts:294`). Give the far bank a cold identity: cooler charcoal-teal shadow wash on the fort-side ground, fort bodies (fortified_far_bank, seized_headframe) darkened toward iron with their emissive-readability intensity tuned DOWN so they loom in shadow, while oxblood_banners keep a slight ember lift and the player's south bank stays warm parchment.
WHY: the Aug-2 arrival shots show the whole top half as one unreadable murk band — the duel needs a warm-home vs cold-company value split the run camera can read instantly.
PERF: low (texture + one tunable). A/B at the run camera; the fort must darken into MENACE, not into invisibility — keep silhouette edges lit.

**U3 — Rocket theatre (the finale's fireworks, strictly capped).**
WHERE: render-only VFX in the Baron's existing visual path (`BaronFort.ts` render seams / the vfx layer — no sim edits): thin additive tracer ribbon on each volley (~0.2s life), an impact dust ring that lands ON the terrain at `Terrain.visualY` (world-anchored, never camera-billboarded — the Billboard Mistake), and a lingering ember-smoke wisp at the last 2 impact points (instanced, cap 8 total, oldest recycled). Light the impacts by REUSING the 6-spotlight muzzle-flash pool (`LightRig.triggerMuzzleFlash`) — zero new lights.
WHY: the Baron's volleys are the fight's signature motion; today impacts read sprite-flat, and rhythmic warm flashes across the scarred ground (U1's pads) tie sim events to world truth.
PERF: med — the capped counts and reused lights are the whole design; ship the mid-volley p95 table as first-class evidence and register the wisps in the MQ-4 auto-tier shed order.

**U4 — Banners in the wind (his brand, moving).**
WHERE: oxblood_banners landmark body — replace in place: one detail rung (rope fringe, patched weave in the pack atlas) + cheap vertex sway (per-instance sin phase in onBeforeCompile, same trick family as reeds); if the siege_line body has banner geometry, give it the same sway so the whole line breathes.
WHY: the Baron's claim-jumping company brand should read in the WORLD the way his taunt banner reads in the HUD (baron-presence shots); oxblood #a0522d-family is the map's one allowed cold-warm accent and it currently hangs dead.
PERF: low — vertex shader only, no new draws.

**U5 — A horizon that answers the finale (panorama repaint + drifting smoke).**
WHERE: `baron-panorama-atlas.png` + blend, identical geometry. Paint the Baron's supply road switchbacking into smoky foothills, two-three distant company derricks (sepia engraving, asymmetric — Echo law), a bruised storm-amber sky band warm at the horizon rim and falling near-black at the zenith (Ceiling law). Optionally two very-slow scrolling-UV smoke strips on the existing panorama material (uniform-driven, FULL tier only).
WHY: the last page of Epoch One currently plays against blank brown nothing; the horizon should say his operation is BIGGER than this fight — that is what makes beating him matter.
PERF: low (texture + tiny shader; smoke strips gated FULL tier).

## 3. THE DON'TS
- Don't touch fight sim: volley cadence, launcher path, fort HP, prebuilt palisades, spawns, lanes, the 22/22 battery. Render seams only.
- Don't touch the Baron sprite — the eight-winds sheets landed 2026-07-28; his look is settled art, not shift material.
- Don't paint gore at impacts or the wreck margin — splinters, scorch, dust, embers; the world is desperate, not horror (Grit Law verbatim).
- Don't put letters/emblems-with-text on banners or atlas (no-text law); the brand is shape + oxblood color, not typography.
- Don't let the river band become a second live water surface fighting code-owned classification — it MAY be lightened from near-black toward readable dark water (same family as the Claim's bed treatment), nothing more.
- Don't add dynamic lights beyond the existing pools; don't ship GLBs without regenerated contracts; don't touch LITE; don't billboard world VFX (impact rings anchor in the object's frame — owner ruling, Mistake #6).

## 4. SHOT LIST (before/after pairs, desktop 1280×800 unless noted)
1. Arrival boot — the taunt-banner moment (`artifacts/baron-presence/desktop-chrome-baron-arrival.png` is the "before"): scarred ground + two-sides lighting readable.
2. Fixed fresh-eye run camera `(0,-30.3,26.26) → (0,-8.65,0.51)`, 42° looking toward the fort — warm bank vs cold iron split.
3. MID-VOLLEY: tracer arc + impact ring + ember wisps with the Baron carried on the launcher (`-carried-launcher.png` is the "before") — this is also the p95 evidence frame.
4. Siege-line close-up: banners mid-sway, wreck margin, scorch pads.
5. Victory moment over the battle-scarred field (defeat card up) — the ground tells the story the card announces.
6. Mobile 390px arrival + the same mid-volley frame at 390px.

## 5. STYLE ANCHOR
"The last page of Epoch One: a claim already half-jumped — warm home parchment against cold company iron under a bruised smoke-amber sky, every scar in the ground a sentence the Baron wrote first."
