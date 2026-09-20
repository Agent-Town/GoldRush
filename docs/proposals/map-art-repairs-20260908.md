# Maps and objects: repair and playable acceptance

Owner request, 2026-09-08: “Please make a goal to fix and update all of these. Make sure that these maps can also be played.”

The active goal covers every finding in [the baseline inventory](../../reviews/sol-findings-map-art-inventory-20260908.md), all 42 map contracts, their environment objects and concept correspondence. A boot, a completed objective and an accepted picture are three different results. The existing inventory and catalog remain the baseline; current evidence belongs in `artifacts/map-art-repairs-20260908/`.

This plan lives in proposals to respect the task's protected `specs/` surface. It synthesizes three independent read-only plans against the current code. Source changes stay on `sol/map-art-inventory-20260908`; no queue, STATUS, shipped-backlog or history edits. The animation task retains characters, bosses, rigs and clips. Simulation ownership and approved shared sculpts remain binding.

## Acceptance ladder

| Slice | Owner seam and bounded change | Required evidence |
| --- | --- | --- |
| 0. Current readiness ledger | Join existing inventory with the ten contract bundles and current Game objective consumers | Exactly 42 rows, separately tracking player entry, traversal, objective/persistence, concept presentation and asset validity. Training and finale routes have their own terminal criteria. |
| 1. Deepwater loading | `Terrain3dClaimPilot` asset lookup shared by prefetch and mounting | Exact four IDs/sources on Deepwater, Stillwater and Flotilla; no skips desktop/mobile; full build and E1 release boundary; compressed runtime load. |
| 2. Early source lineage | Claim, Dry Gulch, Night Shift, Twin Banks, Baron, one pack at a time | Explain the owner-approved replacement, re-export each saved source into scratch, reconcile source/hash/geometry/atlas records, recover the accepted builder and distinguish full regeneration from saved-source reproduction. No blind overwrites. |
| 3. Actual player access | Existing town board, preview-only Open every claim, `main.launchContract`, `InputController` | Click each of 42 real launch controls, dismiss correct briefing, move and interact using desktop inputs and actual 390px touch events; return/relaunch. Preserve earned locks and E1 release restrictions. |
| 4. Alias dressing | Existing terrain registry and terrain-owned mount records | Preserve seven shared terrain/panorama rulings; give all 25 dormant bodies a justified disposition. For each adopted pack prove placement, collision agreement and host-map regression. |
| 5. Objective journeys | Existing Game and era-system owners; split by each distinct objective | Reach required targets without teleport, operate supported human actions, observe genuine success/failure and persisted outcome. Browser/headless parity plus full regression whenever sim semantics change. Drill Yard is practice; River story entry and catalog entry have distinct identities. |
| 6. Concept presentation | One map and visual variable per change | Compare defining geography/silhouette, object placement, light, water and UI readability separately; whole-map and player-scale views, including rear/contact stations. Start with E5 water, E3 readability and Fairground's existing procedural wheel. |
| 7. Special routes and object estate | Existing practice, Ark/finale/Charter, town era and prop consumers | Verify actual intended route and story states before treating absent terrain as missing art; account for all environment families, procedural substitutes and unused alternatives. |
| 8. Factory validation | Existing GLB guard, export profiles, inventories and diet manifest | Reconcile hash/metric/source joins; resolve remaining texture-cap and metadata exceptions from the recorded baseline through actual compliant assets, never larger caps. Explain all 32 files outside the guard manifest. |
| 9. Integrated acceptance | Full-board production preview, existing gates | Complete 42-row desktop/mobile ledger, zero errors or skipped required mounts, compressed-asset validity, performance evidence, current catalog and explicit owner-dependent decisions. Preserve historical receipts. |

Dependencies: 0 feeds all slices; 1/2/4 feed 6; 3 feeds 5; 5/6 feed 7; corrected sources feed 8; all feed 9. Work one source seam at a time. Existing systems own projection, environment, input and terminal outcomes; do not add parallel owners or test-only gameplay bypasses.

Every visual slice runs compare-screenshots against its named target, naming the one variable and crop under judgment. An unprimed screenshot-critique is the final visual check. Record unresolved defects; successful load counts never imply visual acceptance. Owner taste decisions remain explicit, but do not stall unrelated authorized repairs.

## Current checkpoint and continuation

Latest F44/F45 evidence is `artifacts/map-art-repairs-20260908/twin-banks-native-01/checkpoint.json`. Twin Banks uses the authored braid mask and passes exact-boundary routing and ten focused desktop/mobile checks; both native objective attempts failed at wave 14. The repair-aware desktop run reached wave 15 and completed one repair, then died during another repair. F45 regenerates the ClaimBoat/Flotilla receipts without changing geometry and includes the four missing Flotilla runtime files in the deploy allowlist. The refreshed build passes. Full objectives, integrated regression, and concept acceptance remain open; earlier checkpoints below retain their historical scope.

Continue the active goal on `sol/map-art-inventory-20260908`. The current [42-map readiness ledger](../../artifacts/map-art-repairs-20260908/readiness.md) separates entry, traversal, objectives/persistence and visuals. [Repair findings F1–F27](../../reviews/sol-map-art-repairs-20260908.md) retain the chronological evidence and failed attempts. [Pending verification](../../artifacts/map-art-repairs-20260908/pending-verification.json) owns live job handles; do not restart an existing job from an older paragraph.

All **84 correct-era production entry cases** pass: 42 maps × desktop/trusted-touch mobile, actual board launch, basic movement and campaign-preserving return. The old 68 wrong-era cases are retained as historical evidence. Accepted map selection now determines run era independently of campaign progression, including pending provenance for future-era research and matching multiplayer setup. Four intercepted multiplayer setup cases do not prove live relay play. The era guard is in the factory battery; a protected fallback-era expectation needs its proposed patch integrated. See `launch-epoch-01/`.

Drill Yard passes its full native practice loop and reset on both inputs. Regatta passes free deck placement, five gates, physical deck return/context, genuine wave-12 secure, bank, research choices and persistence after reload on both inputs. These are bounded Trail/preview proofs, not full-difficulty or visual acceptance. Use `drill-yard-playability-checkpoint.json` and `regatta-bank-checkpoint.json`.

**Completed bounded repair: F23 Flotilla hull spacing.** A native desktop bank succeeded but exposed living hulls collapsing to 0.0171 meters apart. Shared reanchor now stops at first living-hull contact and carries riders. Its red/green regression, independent review, compressed build, deterministic played replays and copied played/idle factory cases pass. New replay hashes and the proposed protected-test patch are under `flotilla-spacing-01/`. Fresh desktop/mobile native objective journeys both pass separation, bank and persistence; `flotilla-bank-checkpoint.json` validates source hashes and scoped saved results. No verification jobs remain. Three authored loops now have bounded proof; the other 39 remain open. Do not accept the old overlapping bank as proof of this repair.

This changes simulation behavior. `deck-disclosure-01/current-engine-identity.json` records the latest hash; the named behavior boundary, re-assay disposition and full integrated regression remain owed. Do not register transport or hull-spacing changes as presentation-only. Protected e2e originals, STATUS, BACKLOG, queue and history remain untouched.

Current investigation: Stillwater (`stillwater-player-01/README.md`). Native desktop/phone noise-trail shedding, repeated anchor movement, wave-12 secure/bank/reload now pass following the shared disclosure repair. Both inputs also reach five harvest locations, collect at both active seams and return physically to the boat. Silent hand-pan/all-location activation, fog/quiet cues, stale descriptions and concept fidelity remain open. Preserve the later crewed-front ruling.

## Remaining map and artwork work

The three Flotilla hull models now exist and run through the existing owner. Candidate 4 has reproducible saved scenes/full recipes, compressed loading, deck-clearance guards and fresh desktop/mobile secure/bank/persistence evidence. See `flotilla-view-01/README.md` and its source-bound receipts. Its native canvas derivative is separate from the unchanged Claim Boat atlas. Independent art review still calls for distinct hull silhouettes, canopy fastenings, coherent winch rigging and a supported copper vessel; full collision and water contact remain unaccepted. Background boats do not add interactive hulls. No F24 verification jobs remain.

Claim Boat candidate 12 has reproducible saved/factory sources, pad-clearance evidence and successful compressed loading, but crane/material/cabin silhouette, water contact and complete collision remain unaccepted. World-note/control fixes have bounded code, production and visual evidence; central cards still conceal scenery, E3/E5 actors are small/dark and E10 terrain is nearly black. Respect the separate animation/model task's actor/boss source ownership.

Continue the other maps' authored objectives, bank/persistence, special practice/Ark/finale/Charter routes and all eight town prop state variants through actual progression. A boot or headless win does not establish a native-player win. Fairground already has a procedural wheel; absence from a GLB pack alone does not justify a replacement. Sustained mobile touch through the existing brief charm hit-pause remains unmeasured; the prior hidden-stick sample proves an interval, not a player lockout.

Seven terrain aliases are standing rulings: preserve shared hosts and all 25 dormant alternative bodies. Fourteen production host cases pass. Verify gameplay-specific objects separately. Full map/concept and all-object visual acceptance remain open.

## Factory boundary

`current-inventory-05/README.md` records the reconciled estate: 36 packs/196 bodies, 32 panoramas, 175 selected mount files, all 42 map plates and the classified 32 unselected pilots. Twenty-five early landmarks reproduce byte-identically from both authoritative per-body scenes and the pinned archived recipe plus metadata patch. All 32 panorama scenes reproduce with explicit profiles. Keep master inputs and derivative hashes distinct.

Thirty-five plaza props now embed 512px derivatives of unchanged 1024px atlases; saved/factory exports reproduce and installed image paths resolve. All three E8/E9/E10 verifiers pass their 17 bodies. Full recipe regeneration of all 35 prop geometries is not claimed. Preserve `relative_remap=False` when copying staged Blender scenes back to installed paths.

Eight texture exceptions remain: four E6/E7 wagon/trough variants without matching saved sources, two boss bodies owned by the other task, Ark Plaza and Town Plate. Recover or explicitly reconstruct the four missing sources; their delivery history is `025c2ef89` and `fdaed75c4`. Do not mislabel an E5 source or raise texture caps. Remaining prop art defects include unsupported manifold pipe, unsuspended rack rings, detached-looking gauge rod/notch and weak small-scale grain/details.

The migrated landmark Blender verifier checks all 36 packs/196 bodies through their declared sources; all exact saved-source exports, negative checks and the two-pack historical-board selection pass, with final independent review clear. See `landmark-verifier-01/README.md`. Full recipe regeneration and current visual acceptance remain separate. Twenty-five unselected environment/building pilots still need representation/concept disposition. E1's historical 85 later-story-portrait package leak is repaired: full compressed release gate and 20 selected protected browser cases pass in `release-portrait-boundary-01/`; no deployment occurred.

Finish with the full integrated Node/browser gates, current compressed catalog, accurate per-map readiness and explicit remaining owner decisions. The broad goal remains active.

### F28 checkpoint — sculpted-terrain dispatch

Shared seam/sluice picking now follows render heights with isolated blast-aim storage. Four targeted Node checks, a full compressed build, clean follow-up CLI review and controlled desktop/mobile source+compressed one-pan checks pass. See `artifacts/map-art-repairs-20260908/dispatch-terrain-01/checkpoint.json`. Native silent hand-pan remains open. Trusted touch release auto-activates the prompt under the finger; repair and verify explicit confirmation next.

### F29 — Explicit touch confirmation and native single hand-pan verified

The held-finger release could activate the newly appeared confirmation without a new tap. The shared input now requires a fresh pointer press while retaining native keyboard activation. Portrait/landscape trusted-touch checks, controlled desktop/mobile source+compressed game checks, four Node checks and full compressed build pass. Independent review reports no introduced actionable defect.

Native desktop-02 and mobile-01 both enter Stillwater through the ordinary board, physically reach a visible submerged seam, dispatch once from a distance, earn 5g without continuous panning or air-pump activity, and walk back alive. No debug or gameplay state mutation. Desktop-01 was repeated because its noise telemetry path was wrong; preserve that boundary. Evidence and exact source hashes: `artifacts/map-art-repairs-20260908/dispatch-confirmation-01/checkpoint.json`; runnable receipt check: `check-player.py` in that directory. All-ground activation/depletion, Stillwater visual correspondence and the broader map objective remain open.

### F30 — Stillwater rotating harvest coverage verified

Five authored anchors intentionally host two or three initially active seams. The actual HarvestSystem/Economy/RNG component passes all-five activation/depletion across 32 seeds (219 full depletion/respawn cycles, no overlapping active anchors). The initial first-node-only driver prevented coverage by never depleting the other occupied anchors; preserved and corrected by rotating through active nodes. No product spawning change.

Native desktop and mobile both fully deplete one 30g seam, receive 30g, and physically return alive (92/100HP). This complements the earlier native five-ground traversal, silent hand-pan and survival/bank checks; it is not a native all-five single-run claim. Evidence: `artifacts/map-art-repairs-20260908/stillwater-harvest-coverage-01/checkpoint.json`; `check-receipts.py` validates component and native receipts. Visual correspondence remains open: mist, lighting, calm water, boat and submerged silhouette.

### F31 — Stillwater distance mist and subdued light

LightRig now uses a Stillwater day palette and optional fog color, preserving other map defaults and live fog tuning. An initial far-deck contrast loss was corrected by easing the distance multipliers to 0.72/0.7. Independent visual review prefers the adjusted atmosphere, with water/boat defects explicitly remaining. Real LightRig checks for four contracts, source/compressed desktop+phone views, full build and scoped code review pass. The final compressed native phone hand-pan/return journey also passes.

A first-palette native dispatch earned no gold; its activation pause state was not recorded. The repeat handles an upgrade and verifies unpaused activation, but the original cause is not established. Both receipts remain. Evidence: `artifacts/map-art-repairs-20260908/stillwater-atmosphere-01/checkpoint.json` and `visual-review.md`. Full Stillwater art acceptance remains open, especially calm water, vessel details, submerged machine and contact cues.

### F32 — Stillwater calmer teal surface

Stillwater-only water overrides reduce the retained wave illustration blend from 0.95 to 0.25, ripple strength to 0.04, and add a cooler tint/0.78 opacity. Existing artwork, sampler ownership, other map values and simulation are preserved. Independent visual reviews prefer the calmer surface and final color/depth adjustment; source/compressed desktop/mobile views, full build, existing water ownership test and scoped code review pass. Native desktop and phone full 30g seam depletion plus live boat return also pass.

Evidence: `artifacts/map-art-repairs-20260908/stillwater-water-01/checkpoint.json` and `visual-review.md`. Full scene fidelity remains open: repeated bands, richer seabed/reflections, boat proportions/texture/equipment and actor/resource water contact. No asset inventory counts changed.

## F33 — Claim Boat plank and pulley readability

Candidate 13 replaces stretched deck texture/seam boxes with individually mapped top plank faces and replaces wide crane drums with thin wheels/axles/hubs. A port rotation introduced mobile clipping and was rejected; original direction, bounds, pads, simulation and atlas remain. Dedicated object art confirms a long dredging barge; the smaller Stillwater scene boat is not authority to shorten the shared hull.

Fresh/repeat recipes, saved-source export and production GLB are byte identical (21,508 triangles, one material, 512px). Five asset/view tests, full compressed build, source/compressed desktop/mobile captures and independent code review pass. Native desktop/mobile ordinary-board entry, full 30g depletion and physical boat return pass at 100 HP without console/page errors. Independent visual review confirms clearer deck/wheels and no new clipping; crane silhouette, metal detail, equipment richness, HUD occlusion and water contact remain open. Exact evidence: `artifacts/map-art-repairs-20260908/claim-boat-body-13/checkpoint.json`; runnable `check.py` beside it. Refreshed current-inventory-06 retains 42 maps/plates, 196 landmark bodies and zero reconciliation issues; eight texture exceptions remain. All jobs terminal; overall goal active.

## F34 — Ark Plaza stale factory input restored

The Ark builder's town-layout pin blocked reproduction after collision metadata additions. Updating only that pin is justified by equal actual parsing (seven slots/eighteen props), unchanged inherited routes, matching regenerated geometry/UVs/packed texture and independent code review. Existing saved-source re-export is byte identical and 3,124 walk samples pass at maximum relief 0.04199383m. Production models and runtime are unchanged.

Full recipe GLB bytes still differ in equivalent triangle-index ordering; vertex/normal/UV/image buffers and canonical triangle sets match. The original scratch atlas-name difference is separately retained and corrected. Full recipe byte identity and 2048-to-1024 texture-cap repair remain open. Evidence: `artifacts/map-art-repairs-20260908/ark-factory-01/checkpoint.json`, README and runnable check.py. No new native playability or art acceptance claim; eight exceptions remain, overall goal active.

## F35 — Ark Plaza full recipe export stabilized

Canonical triangle/loop storage now preserves the existing oriented geometry and UVs, smoothing and explicit corner normals. Candidate/repeat/production/saved-source GLBs match exactly. Initial normal recalculation was rejected; final custom-normal encoding differs at most 0.02421 degrees and paired renders show no visible change. Independent code and visual reviews pass; existing verifier passes all 3,124 walk samples, full compressed build and 416-model factory guard pass. Production sources are promoted.

Corrected desktop/mobile compressed finale-stage checks load the actual Ark with no errors. An initial ordinary-town probe correctly failed to observe the asset: the Ark is mounted by E10FinaleSystem, not ordinary E10 town entry. Neither debug-stage screenshots nor corridor tests establish native Last Claim completion. Evidence: `artifacts/map-art-repairs-20260908/ark-factory-02/checkpoint.json` and README/check.py. Eight texture exceptions remain, including Ark's unchanged 2048px atlas; full fidelity/gameplay and broader goal remain open. All jobs terminal.

## F36 — Ark texture cap repaired; runtime integration gap confirmed

Ark exports now embed a 1024 derivative of the retained 2048 recipe. Original art and every geometry/normal/UV/index byte are unchanged. Recipe/repeat/saved-source/production hashes match; all 3,124 corridor samples, full compressed build, independent code review and visual preservation checks pass. Source GLB saves 3,301,188 bytes; compressed finale family saves 133,784 bytes. Removing only its matching baseline entry leaves seven existing exceptions across 416 models, with zero live/stale entries. Inventory-07 counts are otherwise unchanged.

Controlled actual Last Claim desktop/mobile spawn/deck checks load the correct E10 model without errors, but reveal pre-existing map problems: sandy fallback ground cuts through the deck, debris overlays it, and z=50 spawn/preserve sites lie outside the approximately 23m-radius circular plaza. Terrain.createTerrainView still creates bank/vista/props; terrainMesh off only chooses a placeholder. Next work must reconcile the intended linear ten-deck route with accepted circular plaza art and correct the scene ground owner. No new native Last Claim completion or full art acceptance is claimed. Evidence `artifacts/map-art-repairs-20260908/ark-texture-01/checkpoint.json`, README and check.py. All jobs terminal; goal active.

## F38 — Town Plate recipe and saved-source verifier repaired

Town Plate now stores canonical triangles/UV loops with explicit corner normals. Recipe, repeat, saved-source re-export and production GLBs are byte identical (17,596 triangles, one material). Oriented geometry/UVs and original packed 2048 atlas are preserved; maximum normal encoding difference is 0.03241 degrees. The existing verifier now performs a current saved-scene export instead of comparing a historical checked file. Its full checks pass, including 4,122 route and 749 plaza samples. Updating the dependent Ark helper pin produces exactly the existing Ark GLB.

The attempted 1024 reduction was rejected for visible ground/road blur in runtime screenshots. Final original-texture desktop/mobile comparisons pass independent visual review; full build, 416-model guard and independent code review pass. Native ordinary-board The Claim entry, movement and return pass on desktop/phone without errors; full objective completion remains unverified. Seven texture exceptions and all broader fidelity/objective obligations remain open. Evidence: `artifacts/map-art-repairs-20260908/town-plate-factory-01/checkpoint.json`, README, visual-review.md and runnable check.py. No inventory counts changed; current-inventory-07 remains the last full census. All jobs terminal; goal active.

## F40 — The Claim cooler river palette

The Claim now uses a cooler water multiplier/emissive color and 0.80 opacity, separating the river from warm banks while retaining the measured channel, ford shelf, shader and all other maps. Independent visual review prefers the cooler treatment across six controlled desktop/mobile pairs. Exact source-delta check, existing water ownership test, independent code review and full production build pass. Final compressed views and ordinary native entry/movement/return pass on both display sizes without errors.

This supersedes the earlier warm-palette choice in the beauty-shift review for the current concept-correspondence request; it does not change the prior geometry/simulation decisions. Straight dark shorelines, broad soft ripples, gravel transition, timber lighting/contact and material detail remain open. Evidence: `artifacts/map-art-repairs-20260908/claim-water-01/checkpoint.json`, visual-review.md and runnable check.py. Full native wave-10/bank/reload proof is independently complete in claim-bank-01 on the preceding consistent compressed build, with unchanged simulation sources. No asset counts changed; seven texture exceptions remain. All jobs terminal; overall goal active.

### F41 — Deepwater native objective complete

Both inputs now prove ordinary preview board entry, three deck pads, reanchor, reef traversal, native boss defeat, wave-12 survival, bank/score reload and restored wreck on a fresh contract birth. The briefing now discloses the required paddle/hold objective; compressed display and entry checks pass. See deepwater-native-01/checkpoint.json and check.py. No fight or animation code changed. Deepwater water/depth/contact fidelity remains open, alongside the remaining map objectives and integrated gates. The readable readiness table now reflects the existing Claim/Stillwater receipts; historical rendering is retained.


## F42 — Sea-apron factory blend and spatial correspondence repaired

The existing surface-color probe identified Regatta's visible straight boundary as the join between sculpted terrain and the panorama-owned submerged apron. The factory computed an edge match and then discarded it in the open-sea composition. Restored that blend for both sea panorama families. Independent code review found a mirrored north/south sample in the revived path; this was confirmed against actual terrain GLB UVs, fixed, and covered by a spatial color check that rejects the retained incorrect candidate.

Regatta and Deepwater panorama geometry, materials, mounts and gameplay remain unchanged. Current recipe repeats and saved Blender re-exports are byte identical. Regatta also had prior recipe/asset drift within its ground band; the isolated unmodified rebuild distinguishes that from the new edge-only blend. Exact delta/pins, spatial colors, final compressed build, eight final compressed display cases and eight native desktop/phone entries with movement/board return pass. Fresh inventory-09 has 416 models, seven existing exceptions, zero live/stale violations and zero inventory issues.

Final independent visual review prefers the corrected apron incrementally, while still finding a straight texture-density discontinuity and weak depth/contact. Shared water color/blend/opacity experiments remain unapplied. No full concept acceptance or new full objective run is claimed. Evidence: `artifacts/map-art-repairs-20260908/deepwater-visibility-01/checkpoint.json`, `check-apron.py`, `check-apron-spatial.py` and `visual-review.md`. All verification jobs terminal; the full 42-map goal remains active.


## F43 — Shared sea water reveals submerged landmarks

Deepwater, Regatta and Flotilla now use the tested cool tint, 0.35 texture blend and 0.72 opacity. The previous 0.95 blend obscured most depth colors and submerged art. Stillwater retains its separate overrides. Only three existing material values changed; shader, geometry, gameplay, mounts, source assets and animations are preserved.

Twenty-four aligned A/B scene pairs, the water resource/disposal test, full compressed build, eight final compiled cases and eight native desktop/phone board-entry/movement/return cases pass. Independent visual review confirms substantial Deepwater/Flotilla landmark-readability improvement and unchanged Stillwater, while noting the exposed Regatta texture-density seam, incomplete bed/depth cues and missing actor/boat contact. These remain open; this is not full concept acceptance or a new complete objective run.

Evidence: `artifacts/map-art-repairs-20260908/sea-water-01/checkpoint.json`, `check.py` and `visual-review.md`. Inventory-09 counts and seven exceptions remain unchanged. Next investigation isolates water/sprite draw order and depth writing before touching shared actor presentation. All verification jobs terminal; the full 42-map goal remains active.
