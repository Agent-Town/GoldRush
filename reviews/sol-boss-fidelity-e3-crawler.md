# Epoch 3 Dynamo Crawler — fidelity and presentation

Branch `sol/boss-art-fidelity-review`, base `d41ab98ce`. Work dated 2026-09-08. No commit or deployment.

**Fidelity implementation and focused verification complete; full regression has explicit exceptions.** E1 and E2 are verified; this report does not close the ten-epoch goal.

[Comparison gallery](../artifacts/boss-fidelity/e3-crawler/index.html) · [canonical plate](../assets/raw/plate-e3-boss-dynamo-crawler.png) · [runtime verification](../artifacts/boss-fidelity/e3-crawler/runtime-verification.md)

## What changed

The original model hid its drive wheels behind broad skirts and reduced the electrical mast to a ladder with small ceramic buttons. Shorter skirts expose the wheel rhythm inside the gameplay-required treads. Three substantial collared teal chambers, two horizontal connections and a forward collector restore the electrical-machine silhouette. Unequal stacks, wound copper capacitors, broad caps, curved upper conduits, lower caged chambers and framed dynamo windows recover the main features of the illustration.

A native-generated eight-region atlas separates soot, iron, brass, copper, armor, teal glass, ceramic and damage oxide. Cylinder UVs keep copper windings horizontal. Six capacitors and the original three component/damage pairs remain. Hidden rupture cores were moved inside the revised jars and their damage transforms moved with them. Smaller rivets and removed hidden underside bevels reclaim geometry for visible machinery. No paid image/3D service was used.

## Asset evidence

| Property | Current asset |
|---|---|
| Geometry | 11,760 triangles, down from 11,980; ceiling 12,000 |
| Bounds, length × height × width | 3.20 × 2.6775 × 1.34; centered grounded base |
| Components | Original `drain_mast`, `tracks`, `capacitor_bank`; one original damage morph each |
| Surface | One material and embedded 1024² atlas; three independent runtime component materials share that atlas |
| Source GLB | 3,205,932 bytes; SHA-256 `26112eaa095aa891d57c209e224e81a3a9fc89bc6f56614eb98ee6d5d5016eb6` |
| Production GLB | 562,520 bytes; SHA-256 `575e5428d03569e4dfc3f5439608bfad6edf3872625afbc6d0e3c764c730d8f9` |
| Reproducibility | Saved-Blend re-export and three fresh source builds are byte-identical |

[Export contract](../assets/pilots/crawler-3d/renders/crawler-asset-contract.json), [verification](../artifacts/boss-fidelity/e3-crawler/verify.log), [fresh-build receipt](../artifacts/boss-fidelity/e3-crawler/source-determinism.json), [native provenance](../assets/layer-contracts/crawler.v1.json).

## Runtime corrections and why they were needed

- **F-E3-01 — target fit.** At unit scale, front/rear hit targets sat approximately 2.76/2.40 world units outside their visible components against radii of 0.72. The model now uses constant uniform scale 3.1 and the declared formation axis. Full authored offsets recover the body position even if two components die before loading completes.
- **F-E3-02 — collector attachment.** The beam previously ended at a fixed height above a proxy. Vertex-derived intact/damaged collector centers now follow the actual morph and asset-root transform. Drain targets, power commands and damage remain unchanged.
- **F-E3-03 — material visibility.** White mapped fill uses intensity 2 intact / 2.2 damaged, with 20% component tint. It preserves atlas detail without another texture, light or draw call.
- **F-E3-04 — grounding and warnings.** Four footprint samples set rigid pitch/roll; 146 cached intact tread points establish nearest terrain contact at 0.025 world units. Damage fragments do not lift the chassis. A local-Y 1.1 tilt pivot and −0.45 longitudinal shift keep the tall mast over its hit zone on slopes. The chassis stays rigid and constant in size. Cached convex-hull points position the health bar above the actual projected silhouette; the dial follows capacitor bounds. Transparent-pass rendering fixes the shared bar fill and dial being overwritten by transparent world content.
- **F-E3-05 — compressed geometry transforms.** Production quantization rebases individual mesh coordinates while preserving anchor extras. Admission converts loaded support/silhouette points into asset-root space; runtime uses the model matrix. Actual optimized callback points are checked against drawn mesh vertices, so a double transform cannot hide behind a raw-only test.
- **F-E3-06 — one vehicle needs one movement clock.** Per-component night-light samples stretched the 8-unit formation to 9.20 units in 20 seconds. Both engines now sample the existing night rule once before component integration, preferring tracks, then the remaining mast/capacitor. Only the matching boss group shares that scalar. The 1/1.08 speed values and 0.35 light threshold remain; ordinary actors retain their old path. This is an intentional movement correction. Routes, declared offsets, hit radii, damage, act timers and death-order rules are unchanged. [Root-cause proof](../artifacts/boss-fidelity/e3-crawler/movement-root-cause.md).

The movement cache is derived and unsaved. Restore clears it and the next step rebuilds it. Old saves retain their already-drifted actor positions; the fix prevents further differential-light drift and does not teleport old actors into a new formation.

## Verification completed

- Five movement arms pass: browser full/lite, headless and two legacy negative controls. Corrected formation remains 8 units; both night speeds still occur with zero per-part spread. Tracks-first movement, later pinning, ungrouped fallback and same-page/fresh-page JSON resume pass. [Receipt](../artifacts/boss-fidelity/e3-crawler/movement-check.json).
- Final live lifecycle covers five route positions, act-2 dial pixels, pinning/wreck/disposal, all three sole-survivor delayed loads, lite/invalid fallback and cache clearing. Nearest support stays 0.025 units. Own-component hit-disk coverage stays at least **66.87%** across sampled route/act/pin/late-load states; tracks remain 100% across the route. The measured one-step presentation lag is retained. [Lifecycle](../artifacts/boss-fidelity/e3-crawler/lifecycle-final/lifecycle-report.json), [actual triangle coverage](../artifacts/boss-fidelity/e3-crawler/lifecycle-final/target-disk-coverage.json).
- Eight final desktop/mobile presentation states pass with zero errors. Minimum viewport margin is 19.71 pixels, bar/model gap 10.40, bar/fixed-HUD gap 11.33, and green fill 62.75%. Actual raw/optimized attachments, rendered callback points, support and whole-snapshot presentation purity pass. Full images and exact crops are in [final-route-framed](../artifacts/boss-fidelity/e3-crawler/final-route-framed/).
- Eighteen existing E3 tests, both Baron presentation views and six Railcar cases passed before the final route/pivot correction. Full regression will cover the final joint source. Only four measured Crawler triangle pins changed (−220 each); all other count/tolerance/memory fields stayed. Historical test PNGs were banked and restored.
- The final production build passes: [build log](../artifacts/boss-fidelity/e3-crawler/build-game-route-final.log). Independent builder review found no introduced defect. Independent final runtime review verified the immutable patch and hashes, 864 scalar boundary/order/isolation cases and 80 grounding/transform cases, with no introduced defect: [review log](../artifacts/boss-fidelity/e3-crawler/route-correction-review.log).

## Visible limits

The source plate depicts rail wheels while gameplay requires tracks; this pass exposes the wheels within treads. Fine engraved detail, dense radial machinery and plumbing remain simplified. The lower drivetrain is still dark in the night scene, and capacitor damage is less conspicuous than the collapsed mast or displaced tread. Detached damage fragments are part of a static morph, not a debris simulation.

The final inspection uses one fixed hero offset (centroid X−0.5/Z+1.0) under the ordinary camera. Earlier clipping/HUD failures remain banked. This is evidence framing, not a production camera fix. The mobile catch-your-breath control still covers part of the right tread; the top HUD also overlaps itself. These interface limits are visible in the full frames. The warning dial has a visible rim/needle but no readable numeric scale. No malformed geometry or viewport clipping was proved by independent final inspection.

Fog obscures ground contact: support is numerically verified, not conclusively visible. A rigid chassis can bridge uneven terrain; the worst sampled gap is 1.429 units while nearest contact remains 0.025. The distant relay endpoint is fogged/offscreen and the beam can pass behind the body/HUD; full visual relay contact is unproven. No suspension, beam-routing or UI redesign is claimed.

## Remaining gates

The isolated 180-frame-per-arm timing sample records p95 desktop 9.1→8.6 ms and mobile 8.4→9.1 ms with identical actors/camera and unchanged calls/geometries/textures. It shows no material regression at this local headless sample’s precision; it is not real-device FPS evidence. [Timing receipt](../artifacts/boss-fidelity/e3-crawler/timing/report.json).

The full default collection finished on 2026-09-08 at 09:48:51 UTC: **2,599 passed, 551 failed, 198 skipped**, with zero global runner errors. All 22 main Baron, 12 Crawler/Canyon encounter, eight Railcar wire, four Railcar read and two shared health-bar cases passed. A server outage affected a conservatively selected set of 345 tests (including passes/skips); their separate recovery completed with 279 passed, 21 failed and 45 skipped. All 345 identities matched, with zero missing/additional cases. It recovered 220 original failures and preserved every original pass/skip. Latest reconciled coverage is **2,819 passed, 331 failed, 198 skipped**, combining the two runs rather than claiming one green run. Historical outputs were banked and restored, and frozen source/asset hashes remain unchanged. This is not a green full-regression verdict.

Both Crawler exact-count cases fail at their cold texture pin by one, including the quiet serial repeat. The desktop census identifies the additional hero animation atlas before any Crawler request. An independently verified HEAD runtime reaches the identical 33-texture resource inventory after one explicit 1/30-second simulation tick; the ordinary cold snapshot was taken at 32. This demonstrates an existing asynchronous hero-presentation state difference. Model allocation/disposal deltas remain unchanged. The raw failures and exact pins are preserved; [diagnosis and limits](../artifacts/boss-fidelity/e3-crawler/cold-texture-census-comparison/conclusion.md) distinguish this resource evidence from an acceptance pass.

The desktop Baron direction test failed in the full and quiet serial runs, passed on isolated HEAD, and then passed in a bounded current-runtime diagnostic. Its mixed results remain recorded while the diagnostic states are classified; the HEAD comparison alone is insufficient to attribute a model defect.

The recovery's shared-atlas production lifecycle test stops at its five-file presence assertion, before loading or disposal. Its historical census requests `diet-a9d5c9a0` filenames while the current build contains the corresponding five `diet-1408f6b4` names. All five embedded WebP images match the census bytes, and both current/HEAD fingerprint inputs yield `1408f6b4`. This is stale census/build coupling; it supplies no resource-lifetime verdict. No census or build files were changed to hide the failure. [Exact trace and asset identity](../artifacts/boss-fidelity/e3-crawler/full-regression/triage/shared-atlas-dedupe.md).

The recovery is terminal; 134 recovery outputs were banked/restored, zero source/asset hashes changed, and all four intentional triangle pins remain. The runner released its freeze. [Exact reconciliation](../artifacts/boss-fidelity/e3-crawler/full-regression/recovery-reconciliation.json) and [full report](../artifacts/boss-fidelity/e3-crawler/full-regression/REPORT.md) retain residual failures and diagnostic limits. This closes the E3 fidelity handoff with regression exceptions; it is not release approval or a claim that every residual failure is pre-existing. E4 integration and browser verification follow.
