---
source: codex
project: Gold Rush
date: 2026-07-27
type: reference
---

# CW-02 wrecker movement diagnosis

## Verdict

**(C) fires in all three runs.** The wrecker acquires and retains `sentry_beacon:2`; `targetPosition`, `routedTarget(gapTarget)`, and `terrainAwareTarget(...)` are all exactly `(-28,8)` from +0.2s through +8.0s. At +1.0s the 0.6-unit goal lookahead becomes non-walkable, `resolveTerrain()` sets `terrainSlideSide=-1`, and the wrecker turns west. Thus neither routing transform aims it wrong: the first divergent movement decision is the world-origin-derived wall-slide at `src/entities/Enemy.ts:1253`.

Temporary instrumentation exposed the three transform values and the serialized slide state through `enemyPositions()`. It was removed after measurement; the source and pre-existing E2E files are byte-identical to `main`.

## Transform-output measurements

The table is the complete 0.2-second series for each of runs 1, 2, and 3: all three produced identical values, not averages. `terrain` is `zone/walkable/speedMul`; `tile` is `hasElevationTile()/Terrain.waterMask()`; `sides` is `riverSide(pos.z)/riverSide(8)`; `ahead` is the walkability of `resolveTerrain()`'s minimum 0.6-unit goal lookahead. At 0.0s no update has evaluated the transforms yet.

| t (s) | position (x,z) | currentBuildingId | wreckerState | slide | targetPosition | routedTarget | moveTarget | terrain | tile | sides | ahead |
|---:|---:|---|---|---:|---:|---:|---:|---|---|---|---|
| 0.0 | (-38.000000,32.000000) | null | seekBuilding | 0 | n/a | n/a | n/a | bank/true/1 | true/undefined | north/north | true |
| 0.2 | (-36.986952,30.761579) | sentry_beacon:2 | seekBuilding | 0 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | true |
| 0.4 | (-35.993200,29.507624) | sentry_beacon:2 | seekBuilding | 0 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | true |
| 0.6 | (-35.020582,28.237087) | sentry_beacon:2 | seekBuilding | 0 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | true |
| 0.8 | (-34.051195,26.921081) | sentry_beacon:2 | seekBuilding | 0 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | true |
| 1.0 | (-35.302865,26.692511) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | **false** |
| 1.2 | (-36.997557,26.692511) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 1.4 | (-38.687429,26.692511) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 1.6 | (-40.372618,26.692511) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 1.8 | (-42.053325,26.692511) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 2.0 | (-43.485531,26.604170) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 2.2 | (-45.162556,26.604170) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 2.4 | (-46.779882,26.492740) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 2.6 | (-47.806584,26.215781) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 2.8 | (-47.997672,26.215056) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 3.0 | (-47.997672,26.215056) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 3.2 | (-47.997672,26.215056) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 3.4 | (-47.997672,26.215056) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 3.6 | (-47.997672,26.215056) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 3.8 | (-47.997672,26.215056) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 4.0 | (-47.997672,26.215056) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 4.2 | (-47.997672,26.215056) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 4.4 | (-47.997672,26.215056) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 4.6 | (-47.997672,26.215056) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 4.8 | (-47.997672,26.215056) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 5.0 | (-47.997672,26.215056) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 5.2 | (-47.997672,26.215056) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 5.4 | (-47.997672,26.215056) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 5.6 | (-47.997672,26.215056) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 5.8 | (-47.997672,26.215056) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 6.0 | (-47.997672,26.215056) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 6.2 | (-47.997672,26.215056) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 6.4 | (-47.997672,26.215056) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 6.6 | (-47.997672,26.215056) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 6.8 | (-47.997672,26.215056) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 7.0 | (-47.997672,26.215056) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 7.2 | (-47.997672,26.215056) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 7.4 | (-47.997672,26.215056) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 7.6 | (-47.997672,26.215056) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 7.8 | (-47.997672,26.215056) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |
| 8.0 | (-47.997672,26.215056) | sentry_beacon:2 | seekBuilding | -1 | (-28,8) | (-28,8) | (-28,8) | bank/true/1 | true/undefined | north/north | false |

## Path versus net movement

| Run | End position | Path length | Net displacement | Path/net | Path-effective speed | Net-effective speed | Relative to configured 8 u/s |
|---:|---:|---:|---:|---:|---:|---:|---|
| 1 | (-47.997672,26.215056) | 20.444978 | 11.550716 | 1.7700 | 2.555622 u/s | 1.443839 u/s | 31.95% path / 18.05% net |
| 2 | (-47.997672,26.215056) | 20.444978 | 11.550716 | 1.7700 | 2.555622 u/s | 1.443839 u/s | 31.95% path / 18.05% net |
| 3 | (-47.997672,26.215056) | 20.444978 | 11.550716 | 1.7700 | 2.555622 u/s | 1.443839 u/s | 31.95% path / 18.05% net |

This is **aimed wrong below `moveTarget`**, not target selection, ford routing, a terrain detour, water slowdown, or oscillation. The path exceeds net because the wrecker first travels southeast toward the beacon for 0.8s, then reverses into a sustained westward slide; it does not oscillate. Raw terrain `speedMul` remains 1 throughout. At x≈-48 the position stops entirely while the target and slide state remain unchanged.

## Candidate disposition

- (A) does not fire: both position and target stay north, every position sample is `bank`, and `routedTarget` always equals `(-28,8)`.
- (B) does not fire: elevation is active, but `terrainAwareTarget` still always equals `(-28,8)`.
- **(C) fires:** the goal lookahead changes from walkable to non-walkable between +0.8s and +1.0s; `northSouth` is true and the negative world x-coordinate selects `terrainSlideSide=-1`, after which x decreases.
- (D) does not fire: the divergence is identified inside `resolveTerrain()`; terrain `speedMul` never drops below 1.

## Verification

Measurement command:

```text
npx tsc --noEmit &&
npx playwright test e2e/cw-02-escort.spec.ts --project=desktop-chrome --workers=1 --repeat-each=3 --trace=off
```

The temporary-probe run produced three identical series and the expected three assertion failures at `e2e/cw-02-escort.spec.ts:134`: beacon HP remained 40 instead of 39. Final clean-tree gate results are recorded below after probe removal.

Final clean-tree results:

- `npx tsc --noEmit`: **green**.
- `npm run build`: **green**; this is vacuous with respect to the docs-only final diff.
- `npx playwright test e2e/cw-02-escort.spec.ts --project=desktop-chrome --workers=1 --repeat-each=3`: **3 failed**, each at unchanged line 134 with expected HP 39 / received HP 40 (run times 16.5s, 15.6s, 15.8s).
- `git diff --check`: **green**.

Exact requested branch-diff output:

```text
$ git diff --name-only main...HEAD
```

There was no output: zero `src/` files and zero pre-existing `e2e/` files differ in the branch range. The uncommitted worktree inventory before runner auto-commit was:

```text
$ git status --short
?? reviews/lane-cw-02-wrecker-movement-diagnosis.md
```

## Recommendation (do not implement in this task)

Change `resolveTerrain()` at `src/entities/Enemy.ts:1252-1264` so initial slide direction is chosen from the two tangent probes relative to the goal—prefer a walkable tangent, then the one whose candidate position has the shorter distance to `moveTarget`—instead of `Math.sign(previous.x|z)` from the world origin; preserve the chosen `terrainSlideSide` until the goal lookahead clears. This removes the west-by-coordinate defect for every caller without special-casing wreckers or CW-02.
