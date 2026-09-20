# f1453-1 crossings hygiene — run report

## Result

Implemented only the three requested hygiene seams in `src/entities/Enemy.ts`:

1. `blockerSlideDirection()` is now called only from the ternary branch that uses it.
2. `resetCrossingData()` explicitly invalidates the page-load-scoped cache; the comment binds that lifetime to import-time `ACTIVE_TILE_ID`.
3. Crossing speed samples ford centre, then gravel-bar centre, then x=0; a non-positive sample becomes the neutral multiplier `1`.

`goalSideCrossing()` is unchanged. F-1448-4 remains deliberately out of scope.

## Behavior comparison

| Twin Banks evidence | before | after |
|---|---:|---:|
| stalls | 0 | 0 |
| reached | 70/70 | 70/70 |
| deterministic reference trace | byte-identical | byte-identical |
| headless secured-run kills | 202 | 202 |

Full census transcripts: [before](./census-before.txt) · [after](./census-after.txt).

The census script does not print kills. The `kills: 202` comparison therefore comes from the focused existing judge, run once on clean repaired main and once with this patch:

`node --test --test-name-pattern='Twin Banks consumes its declared crossings and build zones before securing at wave 20' scripts/gr-sim.test.mjs`

Both arms: 1 pass, 0 fail. The test's asserted outcome includes `kills: 202`.

| contract | speed before | speed after |
|---|---:|---:|
| `the-claim` | 0.85 | 0.85 |
| `e1-drill-yard` | 0.85 | 0.85 |
| `e1-dry-gulch` | 1 | 1 |
| `e1-night-shift` | 0.85 | 0.85 |
| `e1-twin-banks` | 0.85 | 0.85 |
| `e1-baron` | 0.85 | 0.85 |

Raw tables: [before](./speeds-before.txt) · [after](./speeds-after.txt).

## Purity verification

`blockerSlideDirection()` reads only `gapBlockerId`, `gapWaypoint`, `group.position`, its `moveTarget` argument, and `avoidanceSide()`. `avoidanceSide()` is the pure parity expression `this.id % 2 === 0 ? 1 : -1`. Neither function writes state, and repository search found only the two call sites moved into the lazy ternary branches. Changing call timing is therefore behavior-identical.

## F-1448-4 deliberately unchanged

Twin Banks has two fords and two gravel bars. `goalSideCrossing()` still chooses the non-empty ford list, so enemies navigate toward x=-16 or x=16 rather than the bars near x=-7.5 and x=7.4. The bars are not dead: `resolverCrossingAt()` and `riverBlocksEnemyCrossingAt()` still make them passable water. They are walkable but not navigable. Union routing needs a successor task with its own before/after census.

## Gates

The task branch was authored at `a7bc23c5`, one commit before main's `7dcae7cb` conflict repair. Its committed parent contains unrelated duplicate declarations in `TownScene.ts` and `Terrain3dClaimPilot.ts`, so lane-local `npx tsc --noEmit`, `npm run build`, and full app boots fail before reaching this slice. No forbidden file was edited or reverted.

The exact patch was therefore gated in a detached worktree at repaired main `7dcae7cb`:

- `npx tsc --noEmit`: green.
- `npm run build`: green; asset diet green.
- `e2e/f1453-crossings-hygiene.spec.ts`, desktop + mobile, `--workers=1`: 4/4 green. This proves cache hit, reset rebuild, content equality, six speeds, forced ford speed `0` falling back to `1`, and plain no-query boot with zero console/page errors at 1280x800 and 390x844.
- Twin Banks census before/after: byte-identical.
- Focused Twin Banks headless secured-run judge before/after: green with `kills: 202`.
- E1 map + water battery, both projects, `--workers=1`: 63 passed, 14 failed, 1 skipped. Both ford-routing tests and all 11 executed `gt-05-water-depth` tests passed.

Inventory-matched rows among the 14 reds:

- Night Shift load/ramp: `e2e/e1-night-shift.spec.ts:359`, BOTH, known red.
- Night Shift lantern relight: `e2e/e1-night-shift.spec.ts:406`, BOTH, known red.
- Night Shift lantern-pool contrast: `e2e/e1-night-shift.spec.ts:450`, BOTH, known red.
- Twin Banks shared-gold build placement: `e2e/e1-twin-banks.spec.ts:48`, BOTH, known red.
- Twin Banks seeded diagnostics: `e2e/e1-twin-banks.spec.ts:180`, MOBILE-ONLY in the older inventory.

Because inventory membership is not exoneration, the nine unique red titles were rerun on clean repaired main with the patch absent. That matched control produced the same aggregate 14 failures / 4 passes and reproduced every Night Shift, Twin Banks, and Dry Gulch red without this patch. The two Baron reds moved between project arms as 30-second load timeouts and passed on the opposite patched/control arm; they do not touch crossing code. No failing assertion implicated `crossingData()`, `blockerSlideDirection()`, enemy ford routing, or shared water resolution.

## Owner/orchestrator handoff

- Drain this as a path-scoped patch onto `7dcae7cb` or later; do not interpret the stale task parent as a new TypeScript regression.
- No contract-swap call site was added. A future soft switch must call `resetCrossingData()` when it changes the import-time contract model.
- F-1448-4 remains a behavior-changing successor, not hygiene.
