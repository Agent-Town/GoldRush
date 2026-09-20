# E3 Crawler runtime baseline

Captured 2026-09-08 before E3 changes. The final set contains intact and each of the three independently damaged states at desktop 1280 × 800 and mobile 390 × 844, with device scale factor 1. All eight captures show the mounted GLB, retain the gameplay camera, and have exact unscaled crops extracted from their saved full PNGs.

## Evidence

| State | Desktop full / crop | Mobile full / crop |
| --- | --- | --- |
| Intact | [Full](before/desktop-intact.png) / [Crop](before/desktop-intact-crawler.png) | [Full](before/mobile-intact.png) / [Crop](before/mobile-intact-crawler.png) |
| Drain mast damaged | [Full](before/desktop-drain_mast-broken.png) / [Crop](before/desktop-drain_mast-broken-crawler.png) | [Full](before/mobile-drain_mast-broken.png) / [Crop](before/mobile-drain_mast-broken-crawler.png) |
| Tracks damaged | [Full](before/desktop-tracks-broken.png) / [Crop](before/desktop-tracks-broken-crawler.png) | [Full](before/mobile-tracks-broken.png) / [Crop](before/mobile-tracks-broken-crawler.png) |
| Capacitor bank damaged | [Full](before/desktop-capacitor_bank-broken.png) / [Crop](before/desktop-capacitor_bank-broken-crawler.png) | [Full](before/mobile-capacitor_bank-broken.png) / [Crop](before/mobile-capacitor_bank-broken-crawler.png) |

[Desktop telemetry](before/desktop.json) and [mobile telemetry](before/mobile.json) record every capture's mesh state, camera, model transform, projected bounds, crop rectangle, screenshot hashes, component targets, material values, browser errors, and actual served asset responses. The capture helper is [capture-runtime.mjs](capture-runtime.mjs).

## Provenance and checks

- The live binary served from `/assets/pilots/crawler-3d/crawler.glb` was 2,391,052 bytes. All ten successful GLB responses across the two final runs had SHA-256 `a336f7574d42ae6e1d69d13310fd549411c442e93073fec6a64ea0128f4f75f9`, matching the banked file and the source immediately after capture.
- Nine inputs are banked under [before/assets](before/assets/manifest.json): raw plate, GLB, Blender source, builder, verifier, renderer, README, asset-contract JSON, and `CrawlerBossSystem.ts`. The manifest records their original paths, sizes, and SHA-256 hashes. The raw plate hash is `eb52e2b77695536c2216958daae45028f044c6a80757ff4450424f59a3dae086`.
- Every final capture reports `crawler3dState=ready`, `crawler3dSource=glb`, and `crawler3dMounted=true`. The meshes are `drain_mast` (1,984 triangles), `tracks` (5,644), and `capacitor_bank` (4,352), totaling 11,980.
- Intact morph influences are `[0, 0, 0]`. The other captures set only the named component's single morph to 1; the other two remain 0. These are the runtime's below-50%-HP damage presentations, not fully destroyed components or the procedural wreck.
- Model transform and camera data are identical across the four states within each viewport. All eight actual deformed mesh bounds lie inside the viewport. All eight crops passed raw-pixel equality against the corresponding full PNG rectangle.
- Both final runs recorded zero console errors, page errors, and failed requests.

The per-enemy component telemetry still labels the hidden generic fallback sprites as `billboard` / `mounted=false`. Those fields describe the hidden component presentations. The mounted Crawler group dataset and direct inspection of its three meshes establish the GLB state above.

## Transparent staging

The helper reused the existing Vite server on port 5246, waiting 30 seconds before the first browser workload while E2 verification finished. It observed the actual running Game module request before importing it: `http://127.0.0.1:5246/src/game/Game.ts?t=1788842025863`. A temporary prototype interception obtained the existing Game instance and immediately restored the intercepted method. It did not create a second Game instance or alter model/camera/render logic.

The debug session used epoch `epoch-3-voltage`, contract `e3-canyon-works`, full tier, and seed `crawler-fidelity-e3`. Existing test hooks staged wave 14, disabled ordinary wave pressure and hero damage, froze simulation, and teleported the hero to the mean component position plus 2 world units on Z. Each state restored the same suspend snapshot, changed only the selected component to 49% HP, advanced 0.1 seconds to initiate loading, waited for ready, then advanced another 0.1 seconds to mount. The latter step follows the existing `e2e/wire-crawler-3d.spec.ts` helper: ready alone does not mount during frozen simulation. An early capture attempt timed out before this sequencing was corrected; no production change was required.

The camera follows the staged hero through the existing game behavior. The model retains its actual position `[-43.908437640816786, 4.454580247922691, 39.68627656880154]`, yaw `0.8760580505981935`, and unit scale. The gameplay camera remains at `[-44.10356584583454, 30.8506846474299, 60.220430414822815]`, FOV 42; only the viewport aspect differs between desktop and mobile. No camera zoom, model relocation, new light, material override, hidden UI, or image enhancement was applied.

An initial complete set placed the hero farther away at component centroid plus 8 Z. Those darker captures and telemetry are preserved under [before/distant-night](before/distant-night/desktop.json). The final +2 Z setup puts the Crawler inside the existing hero lantern pool and is the comparison baseline; its camera naturally differs from the earlier +8 Z set.

## Visual limits and next comparison

The Crawler remains dark and relatively small in the actual E3 night presentation. Its intact projected geometry occupies approximately 93 × 107 pixels on desktop and 98 × 113 pixels on mobile. The nearby hero overlaps part of the lower front. These are real scene conditions retained in the evidence. The damage silhouette changes are visible in the crops, but fine coil, cab, and track details need separate neutral asset views to assess fidelity precisely.

Use this set alongside the neutral art/asset comparison; do not interpret a brighter future studio render as a demonstrated runtime improvement. A future runtime comparison should repeat this staging, preserve the baseline directory, and bank its own served hash and mesh state. The helper currently deliberately requires the source GLB to match the banked baseline and asserts its 11,980-triangle count, so update those capture expectations explicitly when preparing an after run.

Only capture artifacts were written. No production source, asset, existing e2e spec, or simulation implementation was edited; no full test suite or asset generation was run. Owned browser contexts and the browser closed on completion. The reused parent-owned Vite server on port 5246 was left running.
