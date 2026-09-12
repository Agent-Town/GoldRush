# E10 Quiet — scoped fidelity handoff

The Quiet now appears as a softly feathered heart-shaped absence with irregular nested contours and spreading ground rings, replacing the white sphere and single thin circle. Its raised position separates more of the silhouette from ground props. This improves the boss effect against the [concept plate](../assets/raw/plate-e10-boss-the-quiet.png); the surrounding Ark scene remains substantially less detailed than the art.

Status: READY-FOR-GATES with explicit visual and regression exceptions. Branch `sol/boss-art-fidelity-review`. No commit or deployment.

## Change and evidence

Only [E10StaticBossSystem.ts](../src/systems/E10StaticBossSystem.ts) changed for this epoch. Two transparent, depth-tested shader planes replace the existing meshes. The heart faces the shared camera, uses a signed heart contour with multiscale irregular edges and a soft grainy core, and fades with the existing aura strength. The ground field adds nested fading rings. Both materials retain normal scene disposal; there are no textures, new dependencies, extra render passes or generated assets to register.

Pressure, preserve interactions, timing, music gain, CSS desaturation, story events, no-body/no-HP/no-kill invariants, the final mote and finale callback are unchanged. No Balance, story, spec or existing test source changes.

[Before](../artifacts/boss-fidelity/e10-quiet/baseline/desktop-pressure.png) · [Production desktop](../artifacts/boss-fidelity/e10-quiet/production-v4/desktop-pressure.png) · [Production mobile](../artifacts/boss-fidelity/e10-quiet/production-v4/mobile-pressure.png) · [Production state evidence](../artifacts/boss-fidelity/e10-quiet/production-v4/report.json).

## Verification

- `npm run build`: passed on final V4 source; [log](../artifacts/boss-fidelity/e10-quiet/build-v4.log).
- Public runtime capture on development and production: desktop and 390px mobile, approach/pressure/recession/receded, eight states per run. Both devices reached `receded`, no console/page errors recorded. Production URL was the actual built preview on 5248.
- Final unchanged `e2e/e10-static-boss.spec.ts`: **6 passed, 2 failed**, no skipped/flaky cases. Both failures are the existing finale handoff test at line 178: missing `bank-secured-claim`. The original pre-change E10 source reproduces both failures. This is an E10-source control, not proof that the entire base repository is healthy. [Final receipt](../artifacts/boss-fidelity/e10-quiet/final-v4-encounter.log), [original-source control](../artifacts/boss-fidelity/e10-quiet/original-source-finale-control.log). Source/asset hashes and historical outputs were restored and verified after every run.
- [Runnable lifecycle check](../artifacts/boss-fidelity/e10-quiet/check-lifecycle.mjs): three cases passed — reset, disposal during pressure, disposal after recession. Checks shader strength, reset visibility, exact material/geometry disposal events, scene detachment, restoration of prior filter/transition, and preservation of `grayscale(0)` after recession. [Report](../artifacts/boss-fidelity/e10-quiet/lifecycle-v4/report.json). An initial harness failure from an exhausted Resource Timing buffer is preserved separately; the harness now increases that buffer before loading.
- Independent source review found no actionable regressions in shader math, billboarding, disposal/reset or encounter semantics. [Output](../artifacts/boss-fidelity/e10-quiet/source-review/review.log).
- Independent visual review confirmed V4 improves the flat white cutout and repetitive scallops into softly mottled haze with an irregular edge. Earlier critiques and response are [recorded](../artifacts/boss-fidelity/e10-quiet/visual-review-v3.md).

## Remaining limits

This is not a 1:1 reconstruction. The rings remain flat effect contours, without the plate's concentric architectural terraces. The field lacks the reference's monumental scale and warm brass/teal enclosure; outer pale rings lose contrast on grey terrain. Warm Vent and mobile HUD elements still obscure parts of the lower silhouette. Production screenshots also retain the unrelated broken Prospector portrait. These scene/UI issues were not hidden or relabeled as fixed.

The previously recorded broad regression suite is still not green; this pass does not resolve its 311 unexpected cases or the two unresolved source differentials. The scoped visual objective is complete with these limits. Release integration remains a separate gate.
