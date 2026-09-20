# BEAUTY BRIEF — DRY GULCH (`e1-dry-gulch`)
E1 release map 2 of 5 · the dry map · mesa/arroyo relief, spring oasis, no river
Owner mandate (2026-07-11, verbatim): "The different maps should look beautiful."

## SHARED LAWS (identical to all E1 briefs — non-negotiable)
- RENDERING ONLY (§4.6): sim = spawns, lanes, spring position, heightfield DATA, wave logic — untouchable. `render: {"terrainMesh":"required"}` and the heightfield block in `assets/contracts/epoch-1-frontier/contracts.json` are review-locked (`reviews/map-beauty-dry-gulch.md`, merged `577222c6`) — the ONLY tileParams fields a beauty shift may adjust are render-side paint values (e.g. `palette.splat.antiTile`, precedent: 0.72→0.86 in that same review).
- CONTRACT EQUALITY GATE: any change to `dry-gulch-terrain.glb`/`dry-gulch-panorama.glb` regenerates `dry-gulch-terrain-contract.json`/panorama contract counts+bounds in the SAME commit, else silent fallback to painted (Mistake #10). Verify `terrain3dPilotState='ready'`, `RenderSource='glb'`.
- Deterministic re-export via `build_dry_gulch_terrain.py`; never hand-edit a GLB. Landmark body swaps: same mount id, base-centred origin, 1 mesh/1 material/1 pack atlas, ≤3,000 tris (SOL-3D-C law).
- Perf: p95 within +15%, desktop + 390px mobile, mid-wave evidence table. LITE/painted path untouched. `e2e/map-beauty-dry-gulch.spec.ts` (relief-consumed + FULL/LITE render budget) and `fix-dry-gulch-frozen-waves` coupling spec must stay green. Zero console/page errors.
- Canon: engraved sepia illustrated, muted warm; desert means cacti and dry brush, NOT trees (SOL-3D-D verbatim); desperate never gory; no text in atlases; path-scoped commits.

## 1. CURRENT STATE (three honest sentences)
Judged from `artifacts/tile-identity/desktop-chrome-e1-dry-gulch.png` (2026-07-26), `reviews/shots-standing-orders-r2/play-r2a-e1-dry-gulch-boot.png` + `-secured.png` (2026-07-31), and the source paint `dry-gulch-terrain-atlas.png`: this is the best atlas of the five — arroyo cuts, dense scrub speckle, a cart-track double line, the dark spring pool, mesa-edge shading — and the boot shot reads warm and alive next to its siblings. But at gameplay zoom the mid-field still shows faint periodic tiling and the scrub scatter sits shadowless and uniformly tinted, so the ground reads sparser and flatter in play than its atlas promises. The signature landmarks (bison_skeleton, ruined_mining_operation, abandoned_farmhouse, cactus_thicket, isolated_spring) render in the full-bright emissive treatment, and the spring — the map's only water — is dead baked paint because the 3D pilot hides `SpringPonds` (`Terrain3dClaimPilot.ts:394`).

## 2. THE FIVE UPGRADES (prioritized)

**U1 — The spring becomes the jewel (one live pool in a bone-dry map).**
WHERE: `src/world/Terrain3dClaimPilot.ts` mount path (this contract only) + `src/world/Water.ts`. Mount a small render-only animated pond disc at the isolated_spring mount position, sized to the atlas pool (~3–4m), using the ford water config (`createLivingWaterMaterial(true, …)` — opacity 0.74, warm shallow tint, glints ON), y from `heightAt()` at the pool floor + epsilon, depthWrite off. Ring it in the atlas with a wet-margin band and 2–3 darker green reed tufts (desaturated).
WHY at camera: a single glinting, moving pool surrounded by thirsty terracotta is the map's postcard and its story ("isolated spring") in one glance; today the promise is a dark smudge.
PERF: low — one draw call, existing shader, quality already scales via `waterMobileQuality`.

**U2 — High-noon desert light (per-map atmosphere identity).**
WHERE: `src/world/LightRig.ts` + a render-only per-contract palette hook (pattern already exists: night-shift's authored `LightRigRampPalette` flows contract→Game→LightRig). Add a daytime palette override consumed by contract id: Dry Gulch gets a hotter, whiter-gold sun (+~6% intensity, color toward #ffe0a0), crisper dry air (fogNear/fogFar lifted ~15% from `Balance.world` 42/88), background nudged toward #f3cd92. ALL OTHER MAPS keep byte-identical current values (default = today's constants) — prove it in the diff.
WHY: the five E1 maps currently share one identical golden-hour rig; atmosphere is the cheapest, strongest map identity there is, and Dry Gulch's is "noon, dry, merciless".
PERF: zero (same light count). Shared-surface caution: this touches every map's code path — one dedicated commit, and boot-probe all five doors after.

**U3 — Scrub that stands in the light (scatter tint variance + contact shadows + kill the tile fingerprint).**
WHERE: `src/world/Scatter.ts` (profiles: rocks/stumps/dry_grass/wagon_ruts/claim_posts/cactus) — add per-instance warm-cool tint jitter (instanced color attribute, one material) and small ground-contact ellipses for cactus + rocks (blob-shadow recipe, opacity ~0.14); plus `assets/contracts/epoch-1-frontier/contracts.json` dry-gulch `palette.splat.antiTile` 0.86 → up to ~0.92 if the boot-zoom periodicity still fingerprints (verify by screenshot diff before committing — don't cargo-cult the number).
WHY: shadowless uniform scrub is why the in-game field reads flatter than the atlas; contact shadows are the difference between "props on a texture" and "things on ground".
PERF: low (instanced attributes; a few hundred shadow quads in two draw calls).

**U4 — The two signature skeletons get their detail rung (bison_skeleton + ruined_mining_operation).**
WHERE: replace-in-place at the SAME mount ids in the landmark pack under `assets/pilots/map-rebuild-spike/landmarks/` — derive tier (SOL-3D-C source ladder), ≤3,000 tris/body, one pack atlas: sun-bleached ribs with a sand-drift tail and half-buried vertebrae; the ruin gains wind-tattered canvas, a leaning headframe brace, rust streaks down the timber. Then A/B the emissive-readability intensity down for this map (same tunable as the Claim's U3) so noon sun models the bones.
WHY: these two silhouettes ARE Dry Gulch at the run camera; next to the adopted 30k-tri detail bosses (boss-detail-adoption review) they read a generation older.
PERF: low–med (still hundreds-to-low-thousands of tris; well under the landmark ceiling).

**U5 — Heat you can see (shimmer band + dust devils, strictly tiered).**
> **NOTE 2026-08-04 (THE FAR GROUND SHIFT).** TASK.md for that shift lists this map among "the four E1 maps whose U5 slices were mistargeted at sky". **This brief has no panorama slice** — U5 is the heat shimmer, and this map's far ground was already retargeted and shipped by the atmospherics shift. The far-ground shift re-measured it (ring foot **60.9 m above the frame top**, panorama **0.00% at 14 of 14 samples**) and boarded it before/after; nothing here changed. See `reviews/beauty-far-ground.md`.

WHERE: `LightRig.ts` `LedgerPostPass` — add a uniform-gated horizontal heat-wobble strip (tiny UV distortion, top third of frame only, amplitude ~2px) enabled ONLY for this contract at FULL tier; plus 1–2 wandering dust-devil sprites (instanced additive quads, spawn far from hero, despawn on approach, ≤60 quads total).
WHY: motion sells the heat the still atlas already promises; the horizon shimmer is the one effect that makes a desert read hot rather than merely orange.
PERF: med — post-pass touches every frame; gate per-contract + FULL tier, register it FIRST in the MQ-4 auto-tier shed order, and include before/after p95 in the review table.

## 3. THE DON'TS
- Don't touch the heightfield data, spring sim position, spawns, lanes, or anything in the `fix-dry-gulch-frozen-waves` coupling surface (same tile contract — the frozen-wave regression spec must stay green untouched).
- Don't add trees, lush greens, or standing water beyond the one spring (desert law; the map's thirst IS the composition).
- Don't make the skeleton gore — bleached bone and sand, never remains of people; enemies/danger stay outlaw-company/nature (brief §9.3).
- Don't re-pose or move landmark mounts (terrain-owned); replace bodies in place only.
- Don't ship GLB changes without regenerated contracts; don't touch LITE; don't let the post-pass shimmer leak to other contracts (boot-probe all five doors).

## 4. SHOT LIST (before/after pairs, desktop 1280×800 unless noted)
1. Plain boot — the standing-orders framing (`play-r2a-e1-dry-gulch-boot.png` is the "before").
2. Fixed fresh-eye run camera `(0,-30.3,26.26) → (0,-8.65,0.51)`, 42°.
3. The spring close-up mid-wave — moving water + glints + wet margin + reeds.
4. Bison skeleton against the mesa edge at gameplay zoom, noon shadows visible.
5. Secured screen (~wave 15) with builds up — scrub shadows + no tiling fingerprint across the mid-field.
6. Mobile 390px boot + one horizon shot showing the shimmer band (FULL tier).

## 5. STYLE ANCHOR
"High-noon engraved desert: terracotta ground written over with arroyo scars and bone, and one impossible green-glinting spring that explains why anyone digs here at all."
