# BEAUTY BRIEF — TWIN BANKS (`e1-twin-banks`)
E1 release map 4 of 5 · the braid map · two channels, dry plait island, two fords, both banks buildable
Owner mandate (2026-07-11, verbatim): "The different maps should look beautiful."

## SHARED LAWS (identical to all E1 briefs — non-negotiable)
- RENDERING ONLY (§4.6). CRITICAL MAP-SPECIFIC LINE: F-OP5-1 (`reviews/opus5-arc1-twin-banks-braid.md`) is STILL OPEN — verified today: the production tile declares legacy band water (`water.visualHalfWidth: 7.8`, NO `waterMask` block in `assets/contracts/epoch-1-frontier/contracts.json`), while the mounted 51,200-tri sculpt IS the true braid. Adopting the braid `waterMask` changes SIM classification (fords, water zones, crossing truth) — that is an owner-gated src+contract decision and is NOT tonight's work. Tonight's water is render-only.
- CONTRACT EQUALITY GATE: GLB edits regenerate `twin-banks-terrain-contract.json`/panorama counts+bounds same-commit or silent painted fallback. The braid's mask-agreement proof (0/0 over 25,921 delivered vertices) is part of the merged evidence — geometry edits reopen that proof via `render_twin_banks_braid_verdict.py`; atlas-only edits do not.
- Deterministic re-export via `build_twin_banks_braid.py`; never hand-edit the GLB. Landmark swaps in place: same mount ids, ≤3,000 tris, one pack atlas.
- Perf p95 +15% law, desktop + 390px mobile. LITE untouched. `e2e/e1-twin-banks.spec.ts` (10/10: fords, build zones, loss stake, both-bank routing) must stay green untouched. Zero console/page errors.
- Canon: engraved sepia illustrated, muted warm; greens desaturated; no text in atlases; path-scoped commits.

## 1. CURRENT STATE (three honest sentences)
Judged from `artifacts/opus5-fresh-eye/twin-banks-run-camera.png` + `-overview.png` (2026-07-25 — the fresh eye's only E1 PASS: "two channels around a lit plait; best value structure of the E1 pair"), `artifacts/tile-identity/mobile-chrome-e1-twin-banks.png` (2026-07-26), `artifacts/e1-twin-banks/desktop-chrome-both-bank-base.png` (2026-08-01), and `twin-banks-terrain-atlas.png`: the braid sculpt is genuinely good composition, but its two channels are baked near-black paint with zero water motion because the 3D pilot hides all living-water surfaces (`Terrain3dClaimPilot.ts:175`), so the map's thesis — a living braided river — reads as two dry ink slots. At boot framing the player starts on broad pale south-bank parchment with the braid barely in frame, uniform shadowless reed/scrub scatter, and a visible ground-value seam in the mid-field (mobile shot). The contract card promises "gravel bars, and damp reeds" — the gravel bars are dark smears and the reeds are dry-looking primitive tufts, an MQ-7-class promise the render doesn't keep.

## 2. THE FIVE UPGRADES (prioritized)

**U1 — Water moves in the braid (render-only ribbons; the map's thesis comes alive).**
WHERE: `src/world/Terrain3dClaimPilot.ts` mount path (this contract only) + `src/world/Water.ts`. Build two thin animated water strips that follow the sculpt's channel polylines — read them as DATA from the sculpt contract's `waterTruth` block (`twin-banks-terrain-contract.json`; halfWidth ~1.5, north channel deep/fast, south shallow) — triangulated ribbons at each channel's waterline y, LivingWaterShader river config, `depthWrite:false`, above terrain. The plait island stays dry (it sits +0.52 above the beds — the ribbons must never cover it). Sim untouched: band classification, fords at x=±16, gravel-bar crossings remain engine truth.
WHY at camera: the braid is the one E1 composition the fresh eye praised — giving it motion turns the game's best sculpt into its best screenshot; today it is the stillest thing on screen.
PERF: low–med — 2 draw calls, existing shader, mobile rides `waterMobileQuality`. If the owner later ratifies F-OP5-1's mask adoption, these ribbons yield to the mask-driven surface — note that in the review.

**U2 — Wet margins, banked foam, and gold in the north channel.**
WHERE: ribbon shader config + `twin-banks-terrain-atlas.png`. Anchor the shader's existing bankFoam at the ribbon edges; paint wet-sand rings around the two contract gravel bars (x=±7.4 — they are gameplay crossings) and damp halos on the plait shoulders; add 3–4 `waterGoldGlints` anchors along the NORTH (deep, fast) channel only.
WHY: "gravel bars" are affordance — wet-but-passable must read at 390px; asymmetric glints teach north=deep/south=shallow without a word of UI.
PERF: low (shader anchors + texture).

**U3 — Damp reeds that are actually damp (the contract card's promise).**
WHERE: `src/world/Scatter.ts` reeds profile (this map ships `reeds:44, dry_grass:106`, nearWaterBias 1). Upgrade the reed silhouette to 2–3 crossed blades, tint from the tile's own dampTint [0.45,0.53,0.40] with per-instance jitter, and add a cheap vertex sway (sin phase per instance in onBeforeCompile). Contact ellipses under the largest tufts.
WHY: the briefing card literally promises "damp reeds" — the render owes the words (MQ-7 class); swaying green-grey reeds along moving water is the whole riparian mood.
PERF: low — instanced, one material, vertex-shader-only motion.

**U4 — Two homesteads, two lives (landmark identity pass).**
WHERE: landmark pack bodies for north_bank_homestead / south_bank_homestead (+ their winches), replaced in place at the SAME mounts, derive tier, ≤3k tris, one pack atlas. South (the start/loss-stake side): maintained — warm lamplit window plane, laundry line, stacked firewood. North (across the braid): frontier outpost — weathered timber, winch-served crates, tarpaulin.
WHY: the map's story is one family holding two banks; at the run camera and especially at 390px the player must know which bank they're on in one glance — the pair currently reads as duplicates.
PERF: low. The winch pair gets the same treatment budget only if tris allow; bodies-first ID law: the mount ids own the story roles, don't rename them.

**U5 — The braid continues to the horizon (panorama + edge).**
WHERE: `twin-banks-panorama-atlas.png` + blend, identical geometry. Paint the river re-braiding downstream to the east — split-rejoin glint threads, a desaturated cottonwood line, two distant smoke columns echoing the two-homestead motif (asymmetric placement — the Echo law; busy at horizon, quiet zenith — the Ceiling law). Check the pale sculpt corners against the panorama at wide aspect and feather the join if the band shows (MQ-2 matrix, aspect >1.8:1).
WHY: the map's idea should not stop at the tile edge; a braid that visibly continues makes the 64m tile feel like a valley.
PERF: low (texture swap).

## 3. THE DON'TS
- Don't adopt the braid `waterMask` or touch fords/gravel-bar/stake sim — F-OP5-1 is owner-gated; tonight's water is ribbons over baked beds, nothing more.
- Don't re-sculpt the braid geometry (the 0/0 mask-agreement proof over the delivered GLB is merged evidence; atlas paint is fine, bed depths are not).
- Don't flood the plait — it is dry buildable-adjacent crossing ground; "a beautiful river that covers buildable bank is wrong" (SOL-3D-D, verbatim).
- Don't equalize the stakes visually: the SOUTH stake is the loss condition, the north marker is not — dressing must keep that hierarchy readable (spec-asserted in e1-twin-banks.spec).
- Don't move mounts, don't touch build zones/lanes, don't break LITE, don't ship GLBs without regenerated contracts.

## 4. SHOT LIST (before/after pairs, desktop 1280×800 unless noted)
1. Plain boot on the south bank (`tile-identity` framing is the "before") — reeds + seam fixed.
2. Fixed fresh-eye run camera `(0,-30.3,26.26) → (0,-8.65,0.51)`, 42° on the braid — the PASS board (`artifacts/opus5-fresh-eye/twin-banks-run-camera.png`) is the "before"; after = same frame with living water.
3. West ford mid-wave, enemies crossing both channels — foam + wet margins under pressure.
4. The plait close-up: dry gravel island between two moving channels, gold glints north.
5. Both-banks overview (scaled to tile) — homestead pair identity readable at one glance.
6. Mobile 390px boot + the same braid run-camera frame at 390px.

## 5. STYLE ANCHOR
"One river that chose two paths around a gravel plait: silver-teal threads braid through warm parchment, and a single family holds both banks with a winch line and a lamplit window between them."
