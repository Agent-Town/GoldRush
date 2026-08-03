# BEAUTY BRIEF — THE INCLINE (`e2-incline`)
E2 map 4 of 4 · the graduation · twin funicular lines climb from one wet lower yard over two crossings to the ore benches · Incline Haul escort on the upper line while the Armored Railcar rides the lower
Owner mandate (2026-07-11, verbatim): "The different maps should look beautiful."

## SHARED LAWS FOR EVERY UPGRADE IN THIS BRIEF (read once, obey always)
- RENDERING ONLY (constitution §4.6). Sim untouchable: `src/sim/TileHeight.ts` elevation, water classification (band z ±5, shallows ±6.25, TWO fords: lower-line x −12 / upper-line x +12, halfWidth 3 each), four-edge spawns, both rail routes' data, harvest anchors, escort + railcar logic ("the lower rail carries the wave-12 railcar; the upper rail carries the escorted ore cart" — briefing verbatim, and both are sim).
- THE CONTRACT EQUALITY GATE: `validTerrain()` vs `assets/pilots/map-rebuild-spike/incline-terrain-contract.json` (+ panorama pair); GLB change ⇒ contract regenerated same-commit (Mistake #10). Verify `ready`/`glb`, landmarks 5, skipped 0.
- **THE ARMED TRAP (F-BEAUTY-BARON-2, live here):** `build_e2_contract_terrains.py:854` writes mounts with no `asset` carry-forward — port `carry_forward_mount_records()` (`build_unique_contract_terrains.py:1404`) before any re-export; prove mounts by dataset after.
- Deterministic re-export with an unchanged-recipe control first; never hand-edit a GLB; never rebuild the landmark pack (`reviews/sol-findings-lm-beta-incline.md` bodies).
- Perf law: p95 ≤ +15% desktop AND 390px, mid-wave, against the build's own `?nobeauty` arm. LITE untouched. `e2e/e2-incline.spec.ts`, `map-census`, `terrain3d-registry` green. Zero console/page errors.
- Canon: Frontier Ledger anchor verbatim; E2 regional family "ochre-rust earth, soot iron, tarred timber, murky working water, sparse cacti, engraved frontier grit"; steam white, never dark; teal = agent-tech only; no letters; no firearms. Path-scoped commits.

## 1. CURRENT STATE (three honest sentences)
Judged from `reviews/shots-beauty2-e2-director/e2-incline-{run-camera,twin-crossings,upper-ore-yard}.png` — the FIRST in-game boards this map has ever had (fresh probe 2026-08-03: ready/glb, landmarks 5/0, emissive 3, zero console errors; `artifacts/e2-incline/` holds only a stale ladder-stall report): the lower yard at hero start is the emptiest frame in E2 — a wide bare umber field with the lower line's sleepers along one edge, no landmark, no water, no mark of the haul the yard exists for. At the crossings the sim says water ("Wet powder." bark, "Hands full of river" on the weapon card, lantern-carrying toughs wading) while the render says pure black void across the lower half of the frame, both rail lines running through it on invisible ground. On the benches the twin lines read (the map's one working composition — two dark diagonals climbing in parallel), but the bench faces are black smears, the brake towers / cable house / crane stand full-emissive on bright white plinth slabs that float over the dirt, the red cable-house roof shouts, and nothing on the whole hillside moves, steams, or says which line hauls up and which brings the Baron down.

## 2. THE FIVE UPGRADES (prioritized)

**U1 — The lower water, with BOTH crossings honest.**
WHERE: `Terrain3dClaimPilot.ts` — `SCULPT_WATER_CONTRACTS` + this contract's water-dressing entry (murky rust-teal over the carved bed, wet margins from the bed bake, 2 glints max near the declared sluice samples ±30, z ∓7) — AND one small mechanism extension this map forces: `mountSculptWater` currently reads `Terrain.fordRanges()[0]` only (`Terrain3dClaimPilot.ts:571`), a single-ford assumption; extend the ford skim to iterate the declared fords list so BOTH line crossings (x −12 and x +12) read as warm wading shelves. The bed-depth bake already reads the real sculpt, so the shelves lighten themselves once the skim knows they exist.
WHY at camera: the sim already narrates this water ("Wet powder.") over a black void the render refuses to draw; two lit crossings are also the map's legibility win — they mark where the lines (and the waves) cross.
PERF: low. One quad + shipped shader; the ford-list extension is config plumbing, not shader work.

**U2 — The yards and benches earn the haul.**
WHERE: `incline-terrain-atlas.png` via the recipe + re-export (carry-forward first). Paint: rut-and-spill bands under BOTH lines' full length (churned service margins, ore spill fans where the grade steepens — the declared ramps t1 z 6–13, t2 19–28, t3 33–42); the lower yard gets its travel pressure — convergence from the south spawn edge to both crossings, a worked apron around the engine-crane clearing, stacked-sleeper marks; strata + hard top lips on the bench cut faces; the upper ore yard gets spill fans + coal glitter at its harvest anchors; and the landmark plinth slabs get worked-stone re-grades so the white cards stop floating. Value moves ≤20%; warm parchment base stays.
WHY: "empty space is bad when it has no travel pressure, scar pattern, bank edge, rut, rubble, or sight rhythm" (SOL-3D-D verbatim) — the lower yard is the emptiest space in the epoch, and the haul lines are the only story it needs to tell.
PERF: zero runtime (texture only; counts byte-identical).

**U3 — Landmarks into the golden hour.**
WHERE: `LANDMARK_EMISSIVE` + per-contract paint tint for `e2-incline` (A/B 1.3–1.6; cable-house crimson → oxide-iron; the brake towers' iron kept dark-warm, not glowing); contact-shadow pools under all five mounts leaned along the `LightRig` sun export; the ford-service-pump — nearest body to the water at (25, 21.5) — checked by measured bed depth for pool-vs-collar (the claim's riparian rule).
WHY: emissive 3 on all five today, over U2's re-graded plinths; grounded bodies are the cheapest depth the benches can buy.
PERF: low. One instanced pool; no lights.

**U4 — The lines move (steam on the haul, nothing invented).**
WHERE: render-only, pilot-mounted, contract-scoped: a white stack puff riding the escort cart's existing render path on the upper line; an idle steam wisp at the upper-winch-house / cable-house anchor and a smaller one at the lower engine crane (instanced, capped ≤8 total, white, MQ-4 shed-registered); ore-dust drift where the upper line crests into the ore yard (a few seeded quads in the mote family). Explicitly NOT: catenary haul cables between towers — the rails declare no posts and a strung cable would be invented geometry the contract doesn't own (reject-don't-stretch; the vocabulary stretch is Mistake #14).
WHY: a funicular map where nothing hauls is a diagram; steam at the winch ends + smoke on the cart makes both lines' directions legible without touching a sim byte.
PERF: med, capped; idle frames return to the base draw count when pools drain.

**U5 — Living air and the graduation frame.**
WHERE: `SUN_MOTE_CONTRACTS` entry, motes tinted rust-umber, seeded caps per the claim; and the secure moment becomes the shot the era closes on — the contract's own defeat beat, verbatim: "The upper cart crests while the lower railcar cools in the cut": frame both lines at ~2:1 with the cart cresting the top ford and the dead railcar dark on the lower line (fog-gated mesh already shipped, `fix-e2-railcar-read`).
WHY: E2's last map should end on its thesis — up-line life, down-line iron — and every element of that frame exists today except the beauty around it.
PERF: low. One mote call; the frame is choreography, not new systems.

## 3. THE DON'TS
- Don't touch sim: both rail routes, both fords, escort/railcar logic, spawn gates, harvest anchors, `TileHeight.ts`.
- Don't re-export without the carry-forward port + mount probe; don't rebuild the landmark pack; don't hand-edit GLBs.
- Don't repaint the panorama (F-BEAUTY-BARON-3 — sky ring behind the camera at the shipped rig; owner-desk framing ruling first).
- Don't invent haul cables, pulleys, or line furniture the contracts don't declare (Mistake #14 — the contract disposes).
- Don't clear the water (murky working water, verbatim) and don't flood the yards (mask-agreement: sluice-legal banks stay visibly dry).
- Don't fork `RailPath` per-map — the placeholder rail body is a shared program slice; this brief's U2 paints AROUND the rails, not into them.

## 4. SHOT LIST (before/after pairs, desktop 1280×800 unless noted)
1. Plain boot, no `?debug` — seeded profile with pressure-garden secured → board → launch (the `e2e/e2-incline.spec.ts` route, its own `seedPressureGardenWin` helper).
2. Run camera at the lower engine house (−24, −18) — before: `reviews/shots-beauty2-e2-director/e2-incline-run-camera.png` (the empty yard, on record).
3. The twin crossings mid-wave, toughs wading — before: `…-twin-crossings.png`; after: water, two warm shelves, both lines legible.
4. The Incline Haul: cart climbing the upper line trailing steam, ore-dust at the crest.
5. The upper ore yard (before: `…-upper-ore-yard.png`) — grounded towers, worked plinths, spill fans, motes in the light.
6. Mobile 390px boot + the ~2:1 graduation frame (secure moment, both lines) — doubles as MQ-2 evidence.

## 5. STYLE ANCHOR
"Two iron diagonals climbing one warm hillside: a wet yard that remembers every crossing, benches cut true above it, and the upper cart cresting in white steam while the lower line cools in the dark."
