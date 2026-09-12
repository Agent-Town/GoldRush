# E7 Echo — scoped fidelity handoff

Status: READY-FOR-GATES, with fidelity limits and inherited broad regression exceptions. No commit or deployment. Epoch 8 is next.

The previous encounter copied every building as a box. Echo now snapshots the actual player-built mesh shapes, including full-renderer GLBs or the existing procedural fallback, retaining scale, rotation and the mirrored base layout. A shared formation translation prevents full-size buildings collapsing onto each other during approach. Cyan surfaces, occluded contour edges and perimeter signal rings improve settlement readability. The kept mote has a rounded glass jar, brass fittings and a soft camera-facing glow.

Source scope: `src/systems/EchoBossSystem.ts`, `src/game/Game.ts`, `src/game/Run3dPilot.ts`, `src/systems/BuildSystem.ts`, and new `src/utils/buildingShapeSnapshot.ts`. No generated assets or simulation damage, novelty thresholds, timing, copy counts or persistence contracts changed. Render approach endpoints intentionally changed to preserve relative spacing.

## Evidence and checks

Evidence root: `artifacts/boss-fidelity/e7-echo/`.

- Final TypeScript check and production build passed (`verification/build-final.log`). Current five source hashes match `verification/final-source-hashes.json`.
- Earlier unchanged encounter and playbook checks passed 16/16. Final combined run passed 15/16: all six encounter cases passed; desktop playbook surface timed out clicking a hidden Prospector button at existing test line 103. The exact unchanged case passed in isolation (1/1). Both raw outcomes remain in `verification/final-encounter-playbook/` and `verification/final-playbook-isolated/`; this does not relabel the failed combined run as green. Both runners restored historical outputs with no source/asset hash changes.
- `check-shape-snapshot.mjs` checks instance-slot expansion, transforms, ground normalization, cloned geometry ownership, source immutability and Signal-name preservation.
- `enclosed-opposite-bank/` captures a 32-piece settlement in full and lite modes; pairwise layout checks pass. `water-upgraded/` covers sluice, assay and an upgraded turret. Desktop/mobile captures are retained.
- `production-settled/` verifies eight actual bundled desktop/mobile states, persisted kept-jar reload, no dev modules, 32 GLB response hashes matching built files, and no page/console errors.
- `lifecycle-final/` verifies no shared source geometry, stable copies across full-to-lite demotion, one disposal per copied geometry on reset, and one disposal per nine unique jar resources. Same-time presentation update settles ground supports above terrain. Earlier immediate demotion evidence retains a transient full minimum of -0.283; no claim of zero transient.
- `delayed-load/` verifies an already captured fallback remains stable when full assets arrive.
- Independent source review identified stale instance transforms when a demolished slot is reused before the presentation update. Snapshot now invokes the existing update first. Actual replacement check has zero vertex displacement; the routed pre-fix control reproduces 8.00000048 units (`occlusion-slot-fix/`, `stale-control/`, `source-review/triage.md`).

## Remaining limits

The reference depicts a denser, more elaborate settlement than the game's building assets. Echo copies what the player actually built; it does not invent a landmark or street plan. Fixed map props are not BuildSystem buildings and can overlap the approach. Contours remain more diagrammatic than the illustration. The jar has no direct counterpart in the plate and remains a simple stylized gameplay object. Debug HUD overlap remains visible in some frames and is outside this boss change. Independent visual review and subsequent jar refinement are recorded in `visual-review/findings.md` and `jar-salience/`.

No new full-estate green claim: the prior E6 reconciliation remains 2,839 expected / 311 unexpected / 198 skipped with two unresolved source differentials. This handoff closes the E7 scoped work with those exceptions, not the ten-boss goal.
