# E9 Old Digger — adopted fidelity pass

V6 makes Old Digger read as a large industrial machine rather than a small cart between toothed discs. Open bucket scoops and deep wheel rims flank a taller machine hall, extended trusses, broad derrick, rounded track ends, ribbed dome and differentiated lantern towers. A dedicated native atlas separates dark iron, brass and glass. The amber chamber becomes teal behind the same cage; long ladders deploy through gallery rail openings while the machine stays intact.

## Scope and identity

The production builder, Blend/GLB, asset verifier budget, runtime presentation and asset metadata changed. No survey path, damage, boarding, interaction, tape, persistence or story rules changed. Three original named meshes and `Redemption_*` morphs remain; there are no damage/kill morphs or baked people.

Raw GLB SHA-256: `86b3df8a8bc27321957e038a8261303f003ca0b5cae4a658534d9b6c1b5c58b3`. It has 16,104 triangles (originally 7,192), one embedded 1024-square atlas and three primitives/material clones at runtime. Exported bounds are 12.4 × 5.787864 × 3.559043 in glTF X/Y/Z, with a centered base origin. Optimized production GLB is 640,376 bytes, SHA-256 `fea3759f563816a3a4d6ea843171947fa9346c7c3f82371732a06353bdb1824b`.

`OldDiggerBossSystem` previously placed the machine at world height zero. The initial actual probe found terrain at 2.984655 and wheel penetration up to four units. Presentation now caches lower contact points for both morph states, fits the terrain slope and lifts the model onto its footprint. Geometry is sampled once when loading; simulation coordinates remain planar. The glass shader selects the dedicated atlas's middle-row glass cells, retaining low background emission instead of making the entire machine glow or turn teal.

## Verification evidence

Evidence lives under `artifacts/boss-fidelity/e9-old-digger/`.

- Final production rebuild and `verify_old_digger.py` pass; the saved Blend re-exports byte-identically (`build-v6-adopted.log`, `verify-v6-adopted.log`). Final `npm run build` exits 0 (`build-v6-final.log`), with normal bundle/asset warnings retained.
- Eight unchanged desktop/mobile E9 encounter tests pass on V6, with zero unexpected/flaky/skipped cases. Frozen source/asset hashes are unchanged and historical outputs restored (`verification/adopted-v6-encounter/`). These cover no-kill behavior, legal unmaking, boarding/dismount, recording and fallback tape conversion, and persistent gentle state.
- Actual optimized production passes eight desktop/mobile working, returning, gentle and fresh-gentle views after reload. Four downloads match the exact built bytes, with no collected console/page errors (`production-v6/report.json`). The gentle cage and illuminated chamber are visible in the desktop view. Public hooks accelerate the encounter; these are not isolated showroom renders or asset overrides.
- Full, lite and cancelled-load lifecycle cases pass on the actual development Game. Reset removes the model; geometries/materials dispose; both support caches empty; cancellation permits a subsequent successful load (`lifecycle-v6/report.json`). Shared texture disposal is recorded separately, not claimed to occur once globally.
- V5 ladder/body intersection check finds zero intersections below the top .15-unit attachment zone. Ladders reach local Z .1 to 3.634887 (`candidate-v5/access-check.json`). V6 changes only the chamber morph, leaving those ladders unchanged.
- Independent visual review called V4 substantially closer and identified remaining cutter spacing, tracks, tower and chamber issues; V5 addresses them (`visual-review-v2.md`, `progress.md`). The model still simplifies the intricate illustration.
- Independent Codex source review found one P2: an unscaled gentle-window displacement hid the cage after normalization. V6 derives the shift from normalized chamber centers. The direct geometry check reproduces .095527-unit error in V5 and verifies V6 within 1.2e-7 units, under a 1e-5 tolerance (`source-review/triage.md`, `check-chamber.py`). No other actionable source findings were returned.

The final route/contact check passes using the exact optimized production bytes through the real development loader: twelve positions over 36 simulated seconds plus gentle conversion, no recorded errors, and minimum sampled clearance .01746 units. Quantized node transforms are included in the measurement (`grounding-v6-optimized/report.json`). This closes the scoped E9 pass with the limits below.

## Limits

The machine remains simpler than the reference in facade detail, hanging chains, tower variety and human activity. A rigid model can bridge uneven terrain; contact fitting prevents major burial but cannot make every wheel touch across a sharp gully. Gameplay boarding remains the existing planar interaction; this pass does not claim physical platform traversal. Mobile HUD overlays still occlude parts of the view, and some production frames show the pre-existing missing Prospector portrait.

The earlier broad regression reconciliation remains non-green: 2,839 expected, 311 unexpected, 198 skipped. No full-estate rerun was performed for E9 presentation/asset changes; unrelated failures are not relabeled as baseline defects. No commits, deployment, STATUS changes or existing e2e source edits.
