# E4 Land Yacht fidelity pass

The Land Yacht now appears as one terrain-grounded 3D wheeled ship during the encounter and its salvage state, replacing the three separate illustrated component crops on FULL. The hull, wheel armor, observation house and open grab follow the source plates more closely. This is a verified fidelity improvement, not a 1:1 replica or a release approval.

## Implementation

The Blender source retains three component meshes and their original damage targets: 9,613 triangles, one native-generated 1024-square atlas and one source material. The runtime clones three materials sharing the atlas. The final plate UV region avoids a painted border that previously produced dark roof slashes. The final raw GLB SHA-256 is `1a7c743b7df30d18d5d8709fa2e9919cc681fec30dcc6a83630e03722fd7592f`; its optimized form is 461,844 bytes, SHA-256 `430656db0b6fa53d52061284da4bce1374f04b311649335adbd7b3f0cc009794`.

Fresh encounters position the three targets on coherent concentric route phases instead of collapsing them together. Saved routes are preserved; incompatible legacy formations retain the illustrated fallback. A surviving component anchors the full hull, with interpolated pose, terrain support and shared health-bar bounds. Damaged machinery remains attached through salvage. Full save envelopes retain encounter deadlines, counters, formation and destruction positions, and include this payload in future-state hashing.

The model uses the shared loader and existing asset-diet boss manifest. E1 release narrowing includes it with the other later-era models. No new dependency, paid generation, commit, deployment or unrelated HUD/camera redesign.

## Verification

- Production Blender rebuild and saved-Blend byte re-export pass. The final UV-only proof confirms unchanged geometry, normals, indices, morphs and atlas pixels. Earlier repeated source-build identity and independent builder/runtime reviews remain in their immutable evidence directories.
- Actual TypeScript and final `npm run build` pass. The first build exposed missing asset-diet membership; adding the model to the existing boss family fixed the build.
- All 22 unchanged E4 boss, census and story checks pass on desktop/mobile with one worker; historical screenshot outputs restored.
- All six desktop destruction orders and mobile wheels-first/wheels-last pass. Full JSON saves restored in fresh pages preserve boss state, boss actor state and model pose at presentation alpha 1, including sole survivors and selected wrecks.
- Actual loader tests pass for lite (zero GLB requests), invalid input, delayed loading with each sole survivor, restart during loading and loaded restart cleanup. Three geometries, three materials and one shared texture receive disposal. Existing shared disposal code emits repeated events for texture aliases; this is recorded rather than reported as seven independent textures.
- Nine raw-model and nine optimized-model poses per viewport pass actual GLTFLoader admission, scale and grounding checks with zero page/console errors. The optimized bytes are delivered to the source game's actual loader; this is not a claim of a complete production-bundle playthrough. See `artifacts/boss-fidelity/e4-landyacht/visual-summary.json` for measured margins/support gaps.

## Visible limits

Desktop calibration uses default zoom. Mobile requires the existing 1.6 distance scale to fit the whole ship; default zoom clips broadside geometry. The fixed hero framing is component centroid +1Z, not arbitrary-play camera acceptance. The mobile catch-your-breath control overlaps some wheel area.

Materials remain flatter and less differentiated than the intricate engraved brass/glass concept. The superstructure is compact, wheel mounts are partly obscured, and damage is subtle. A side view exposes a missing pane and slack/broken hoist, but the crane damage is weak at normal play scale. The concept's damaged crane retains its boom silhouette. The independent visual critique and root response are preserved in `runtime-visual-review.md`.

The initial calibration failed on capture bookkeeping for redirects; a later run had an unavailable CDP response body. Final raw and optimized runs captured all required successful module/asset receipts with zero receipt failures. Lite's internal state/fallback was correct; its initial canvas diagnostic attribute is absent until a publish transition, so the lifecycle check observes the real state and visible sprites.

## Evidence and broad-regression exceptions

[Visual gallery](../artifacts/boss-fidelity/e4-landyacht/index.html). Detailed evidence: `production-handoff/`, `roof-seam-fix/`, `runtime-final-2/`, `runtime-optimized/`, `runtime-resume-1/`, `runtime-lifecycle-3/`, `focused-gates-1/`, and the independent review directories. Mechanics/lifecycle gates used the pre-roof-fix GLB; the UV-only byte comparison and final raw/optimized admission captures establish the final asset delta without claiming a repeated mechanics run.

Broad regression is terminal: 2,808 passed / 339 failed / 201 skipped or unrun. Exact confirmation and an earlier-source control produce latest reconciled E4 coverage of 2,834 passed / 316 failed / 198 skipped across separate runs. This is not a green full gate. One ordinary river-placement check retains unresolved source correlation; other reproduced and varying failures remain explicit exceptions. All historical outputs and 8,490 source/asset hashes were restored. See [full report](../artifacts/boss-fidelity/e4-landyacht/full-regression/REPORT.md). The fidelity handoff is closed with these exceptions; production freeze is released for E5.
