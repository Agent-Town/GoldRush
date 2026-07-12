# TOWN-3D — the program (RULED 2026-07-12; ADR-004 HD-2D standing)
Owner order (verbatim): "start lanes to work on new 3D models for all buildings in town and the contracts... We now learned how to instruct and make it work."

## Laws
1. RECIPE LAW: the merged tavern pilot (sol/town-blender-v3, reviews/sol-3d-a-findings.md + artifacts/town-blender-v3/materials-note.md + assets/pilots/tavern-3d/*.blend) is the method source. Slice 0 extracts it into specs/town-3d/RECIPE.md — proportions from the painting, bake-FROM-the-illustration texturing, ≤15k tris, ONE ≤1024² embedded material, slot scale + base-center origin, tonal match ≤+5% vs painted neighbors at the locked ts-04 camera, p95 no-regression, zero lights/cameras in export.
2. TIER LAW: recipe authored/refined at sol ULTRA (done — the tavern); ladder executes at sol@high. CALIBRATION: the general store builds ONCE at high-with-recipe; owner A/Bs it against the tavern's quality bar — if it holds, the whole ladder stays at high.
3. Every building lands flag-gated behind ?town3dPilot (one flag, growing set); painted facades remain LITE-tier + fallback FOREVER; visual-only, zero coordinate/sim changes; per-building e2e mirrors e2e/town-tavern-blender.spec.ts.
4. Blender 5.1.2 headless (blender --background --python) is lane-legal; .blend sources commit beside GLBs (assets/pilots/<building>-3d/).

## THE LADDER (one building per lane task, refill-on-merge)
Slice 0 RECIPE.md (extraction, lane task) → 1 general_store (CALIBRATION @high) → 2 schoolhouse → 3 claim_office → 4 chapel → 5 assay_office → 6 THE STAMP MILL MONUMENT (the complete-state portrait becomes geometry — the post-ceremony centerpiece) → 7+ THE CONTRACT BUILDABLES (run scene, same recipe, own e2e family): sluice → palisade → turret → stockpile → sentry beacon → boiler house → assay bench → lantern post. Gates per slice; owner-eye contact sheet per building; the bartender-grounding question rides slice 1 (2D actor shadows vs 3D walls — owner judges).
