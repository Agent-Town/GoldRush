# Quiet fidelity — candidate work, not accepted

Reference: `assets/raw/plate-e10-boss-the-quiet.png`. The subject is an un-inked heart-shaped absence with concentric faded architectural contours, not a physical monster.

Original source is banked in `before/`. Baseline public-hook desktop/mobile approach, pressure, recession and receded captures completed with no browser errors. Ark reports ready. The current game view nevertheless shows plain terrain, a Warm Vent prop/label overlapping the encounter, and crowded mobile HUD/dialogue. These are visible limits, not hidden in captures.

Candidate V1 replaced the sphere and single thin ring with two transparent shader planes. Its polar shape read as a balloon; rejected. Candidate V2 uses a signed heart contour with feathered edges and nested fading outlines, plus layered ground rings. V2's eight public-hook captures completed without browser errors and both devices reached `receded`. The heart is recognizable but its original world height leaves it behind actors, labels and mobile dialogue; placement needs another pass before visual acceptance.

Only E10StaticBossSystem presentation is changed. No pressure, preserve, recession, story, CSS grayscale, music or finale handoff logic changed. Existing unchanged E10 tests are running in `verification/candidate-v2-encounter`; see its terminal receipt before editing source. Do not assume tests passed from this note.

Next: resolve height/readability, fresh independent visual review, production build/captures, unchanged tests on final source, resource/reset/canvas handoff check, source review and durable scoped handoff. No E10 acceptance claimed.

V2 unchanged encounter tests terminated: 6 passed, 2 failed. Both failures are the finale test at line 178 (missing bank-secured-claim). Original E10 source control reproduced both failures (0/2), with source/output hash restoration verified. Candidate source was restored before V3. V3 raises only the visual heart by two heart radii; capture is pending.

Final V4: build, production eight-state capture and three lifecycle cases passed. Final encounter 6/8 with both finale failures reproduced on original source. Source review no actionable regressions. Scoped handoff written; checkpoint and review supersede earlier pending notes.
