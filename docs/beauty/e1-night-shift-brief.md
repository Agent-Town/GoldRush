# BEAUTY BRIEF — NIGHT SHIFT (`e1-night-shift`)
E1 release map 3 of 5 · the dark map · authored light ramp (dusk w5 → dark w10 → dawn w25)
Owner mandate (2026-07-11, verbatim): "The different maps should look beautiful."

## SHARED LAWS (identical to all E1 briefs — non-negotiable)
- RENDERING ONLY (§4.6). On THIS map the line is razor-thin: `LightField` darkness/radius/coverage is PHYSICS (it gates wall assaults and the 1.18x dark-corridor speed — `reviews/lane-night-mode-truth.md`, merged `8c91e5a6`). Radii, `minLight`, coverage math, ramp WAVES (`duskWave:5, darkWave:10, dawnWave:25`) and keyframe `darkness` values are SIM. Render-side and fair game: pool COLORS/intensities (`Balance.contracts.nightShift.terrainPoolIntensity`, `lanternRenderIntensity`, `heroRenderIntensity`, `agentLightIntensity`, `enemyLantern*` cone visuals, `nightSpriteTint/Scale`), keyframe COLOR fields, LightRig palettes, atlases.
- CONTRACT EQUALITY GATE: GLB edits regenerate `night-shift-terrain-contract.json`/panorama counts+bounds same-commit or the map silently falls back to painted. Verify `terrain3dPilotState='ready'`.
- Deterministic re-export; never hand-edit a GLB. Perf p95 +15% law (current 3D night p95: desktop 9.8ms, mobile 10.3ms — `night3d-perf.spec.ts` 4/4 must stay green). LITE untouched. `night-mode-truth.spec.ts` 4/4 must stay green — it samples pixels inside the pool radius and falloff band; keep the RADIUS truth, tune only values inside it.
- Canon: illustrated warm-even-when-tense; no text in atlases; path-scoped commits.
- Note: `keepLandmarkPaintReadable` is correctly SKIPPED for this contract (`Terrain3dClaimPilot.ts:629`) — landmarks go dark at night by design. Keep it that way.

## 1. CURRENT STATE (three honest sentences)
Judged from `reviews/shots-standing-orders-r2/play-r2a-e1-night-shift-boot.png` (2026-07-31, day phase), `reviews/shots-night/desktop-chrome-after.png` + mobile (the merged night-mode-truth finals), and the source paints `night-shift-terrain-atlas.png` / `night-shift-panorama-atlas.png`: at full dark the map is a near-black field with one small warm pool where sprite-lit lantern-carriers converge — genuinely atmospheric, and the unprimed reviewer's parting note was that "brighter amber lantern glow" remains the named future polish. The daytime/dusk ground is the weakest paint of the five: soft airbrushed olive-brown mud with no crisp mark-making, so the seven_lantern_terraces, lampworks_yard and night_work_road exist as landmarks on a smear rather than on worked ground. The panorama is a blurred slate gradient with one faint rust smudge — no stars, no moon, nothing for dusk or dawn to break against.

## 2. THE FIVE UPGRADES (prioritized)

**U1 — The amber the reviewer asked for (pool warmth, two-stop falloff).**
WHERE: `src/world/Terrain3dClaimPilot.ts:355-360` — the night-pool emissive block. Inside the EXISTING radius + cubic `lightFalloff` band (do not change either — spec-asserted), add a half-radius warm-core boost: bright amber core (push the warm tint from vec3(1.00,0.48,0.16) toward vec3(1.00,0.62,0.24) inside r/2) falling to the current dim rust rim. Pair with a taste-tuned raise of `terrainPoolIntensity` (0.85 → A/B up to ~1.0) and `lanternRenderIntensity` in `Balance.ts` (render-side values).
WHY at camera: the pools ARE this map's composition; the merged review's own final finding names this exact upgrade.
PERF: zero new lights — shader constants only. GUARD: `night-mode-truth.spec.ts` pixel samplers (inside-radius, falloff band, outside coverage) must pass unmodified.

**U2 — Enemies ignite at the pool edge (rim-lift on approach).**
WHERE: `src/game/Game.ts` night sprite path (the per-enemy tint already applied under `nightSpriteTint`/`nightSpriteLightBoost`). Sample each visible enemy's distance to its nearest physical pool (the typed source list already exists at `Game.ts:4856-4912`) and scale sprite brightness/warmth smoothly from ambient-dark to lit across the falloff band, so attackers kindle as they cross into light instead of popping.
WHY: the fight happens at pool boundaries; a graded ignition is the single biggest read improvement for combat legibility AND drama at full dark.
PERF: low — CPU arithmetic per visible enemy (≤ pool count × enemies), no lights, no draw calls. GUARD: figures stay the primary read (owner verbatim on the old cone bodies: "walking penises of light. it is funny but maybe not the final version" — the illustrated-sprite fix is settled; only brightness grading may change).

**U3 — Dusk and dawn become paintings (keyframe color re-author).**
WHERE: `assets/contracts/epoch-1-frontier/contracts.json` → e1-night-shift `twist.lightRamp.keyframes[]` — COLOR fields only (`background`, `fog`, `sun`, `sunIntensity`, `fill`, ground, spriteTint); wave numbers and `darkness` values stay byte-identical. Author an oxblood-ember dusk (deep plum sky #5a3a44 family, ember fog, low rust sun) and a silver-rose dawn (pale #f5d7b2 → cool silver fill before the warm sun returns).
WHY: wave 5 and wave 25 are scripted story beats every run passes through; today they are single flat lerps between day and black.
PERF: zero. GUARD: `e3-day-night.spec.ts` + ramp specs green; sim pacing untouched by construction.

**U4 — A night sky that exists (panorama repaint).**
WHERE: `night-shift-panorama-atlas.png` + blend, re-export at identical geometry. Engraved-storybook night: sparse pin-dot star field (density falling to a near-black zenith — the Ceiling law), a low moon-glow band behind the eastern ridge silhouettes, and the existing rust smudge grown into a legible far-off lampworks furnace glow (asymmetric — the Echo law). The panorama is standard-lit so it dims naturally as darkness→1; verify it carries the dusk and dawn phases where fill light still exists.
WHY: dusk/dawn (U3) need something to break against; a starless void wastes the map's two most cinematic minutes.
PERF: low (texture swap; counts unchanged).

**U5 — Worked ground under the lanterns (day/dusk atlas re-engrave).**
WHERE: `night-shift-terrain-atlas.png` + blend re-export. Re-engrave the night_work_road as a compacted pale ribbon with crisp hatched edges; boot-trampled pads at each of the seven_lantern_terraces; oil stains and coal scatter at the lampworks_yard; keep the dark_rock_shoulders as true value anchors. The pools must land ON visibly prepared ground so light-over-pad reads deliberate.
WHY: the map boots in daylight and fights through dusk — right now that's a mud smear; "roughness must follow use" (the Grit Law) is the exact prescription.
PERF: zero runtime (texture only).

## 3. THE DON'TS
- Don't touch LightField physics: radii, `minLight`, darkness values, coverage math, ramp waves, `nightSpeedOutsideLight` — the wall-assault pressure law rides them (MQ-10 root cause; `night-mode-truth.spec` line-104 hardened test exists precisely to catch this).
- Don't touch the watch-paint overlay split (enemy-read only, excluded from physical light — codex review finding #1 in the night truth review).
- Don't re-enable `keepLandmarkPaintReadable` for this contract; don't add full-bright anything at dark.
- Don't raise light budgets: 32-pool shader cap, `maxDynamicLights: 8`, 32 lantern instances are ceilings, not suggestions (mobile).
- Don't brighten the darkness itself — fear of the dark IS the map; the upgrade is warmer LIGHT, not lighter NIGHT.
- Don't ship GLB/atlas changes without regenerated contracts; LITE untouched; zero console errors.

## 4. SHOT LIST (before/after pairs, desktop 1280×800 unless noted)
1. Plain day boot (`play-r2a-e1-night-shift-boot.png` is the "before").
2. Dusk over the terraces, waves 5–9 — the keyframe-palette money shot with the new sky.
3. Full dark mid-assault at a pool edge: amber core, rust rim, enemies igniting as they enter, carried lanterns visible (`shots-night/desktop-chrome-after.png` is the "before").
4. Dawn at wave 25 survived — silver-rose ramp over the worked road.
5. Mobile 390px full dark — pool + carrier readability at small size.
6. The night panorama at dusk: stars + moon band + furnace glow, quiet zenith.

## 5. STYLE ANCHOR
"A black parchment page where light is ink: seven amber pools along a worked road hold back the dark, and everything the dark sends walks in carrying its own small fire."
