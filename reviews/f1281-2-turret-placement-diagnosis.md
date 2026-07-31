# F-1281-2 — turret placement diagnosis

## Verdict

**The fixed `(0, 10)` test coordinate went stale; turret placement did not regress.**

The test **“Auto-Pan upkeep and boiler battery bands consume the fixed-step pressure store”** asks `placeFree('turret', 0, 10)` to build inside the now-solid `hill-mine:boiler-house-site` landmark. The shared placement path correctly rejects that point through `matchesPlacement`. It is not a terrace wall, illegal slope, exhausted turret capacity, existing-buildable overlap, build-range failure, or disabled buildable.

## Reproduction

Command:

```text
npx playwright test e2e/e2-arsenal.spec.ts --workers=1 -g "Auto-Pan upkeep and boiler battery bands consume the fixed-step pressure store"
```

Result on 2026-07-31:

- `desktop-chrome`: failed at the `placeFree('turret', 0, 10)` expectation, received `false`.
- `mobile-chrome`: failed at the same expectation, received `false`.
- Total: 2 failed, single worker.

Captured output: `logs/session-scratch/s1284-lane-d/scope0-workers1.txt`.

This matches the clean-main s1281 control arm in `logs/session-scratch/s1281/control-arm-clean-main.txt`.

## Five measured values

The scratch probe executes the same setup as **“Auto-Pan upkeep and boiler battery bands consume the fixed-step pressure store”**, captures the live `BuildSystem` instance during the real `placeFree` call, then reads the private placement predicates in the page context.

Both browser projects returned the same values:

| Value | Measured result | Meaning |
|---|---:|---|
| `countFor('turret')` | `0` | Capacity is not exhausted. |
| `maxCountFor(turretDef)` | `4` | `0 >= 4` is false; the capacity door stays open. |
| target after `snap()` | `{ x: 0, y: 0, z: 10 }` | Grid snapping does not move the requested point. |
| `matchesPlacement(turretDef, target)` | **`false`** | **Failing door.** |
| `overlapsExisting('turret', target)` | `false` | No existing buildable or reserved footprint occupies the point. |

The two source-eliminated doors also measured open:

- `getBuildableDef('turret')` is present.
- `isBuildableEnabled('turret')` is `true`.
- Fresh `rg -n "powerGrid:" src e2e` returned no matches.

Probe evidence:

- `logs/session-scratch/s1284-lane-d/door-probe-desktop-chrome.json`
- `logs/session-scratch/s1284-lane-d/door-probe-mobile-chrome.json`
- `logs/session-scratch/s1284-lane-d/door-probe-output.txt`
- Harness: `logs/session-scratch/s1284-lane-d/door-probe.spec.ts`

## Why placement rejects `(0, 10)`

The turret definition requires `placement: 'bank'`. At the snapped point the live page reported:

- `Terrain.sample(0, 10)`: `{ walkable: false, speedMul: 0, zone: 'bank' }`
- `Terrain.isBuildable(0, 10)`: `false`
- tile traversal: `true`
- terrain height: `0.8744855972`
- slope: `{ dx: -1.15e-10, dz: 0.2458847743 }`
- matching build zone: `base-t1`, bounds `x [-30, 30]`, `z [8, 16]`
- blocking landmark: `hill-mine:boiler-house-site`
- blocker center: `(0, 12)`
- blocker half-extents: `(3.35875, 3.35875)`, derived from radius `2.687 × scale 1.25`
- `(0, 10)` is inside the blocker even without the additional `0.58` hero collision pad.

Therefore `(0, 10)` is on a legal, traversable T1 terrace and inside the authored build zone, but it is also physically inside the rendered boiler-house landmark. `Terrain.isBuildable` makes solid landmark footprints non-buildable, so `BuildSystem.matchesPlacement` returns `false`.

This also distinguishes the placement-rule door from the occupancy door: the landmark is terrain collision authority, not a placed `BuildSystem` entity, so `overlapsExisting` correctly remains `false`.

## When the coordinate became stale

The test **“Auto-Pan upkeep and boiler battery bands consume the fixed-step pressure store”** was authored in `90e7cc6841cdbe514a3f3aa203135e652fd9b4fa` on **2026-07-12 10:46:03 +07:00** and has not changed since.

Commit `d1f549d5fd51d8b127eb83cdf658dce0e5db8374` — **`runner(lane-a): lane-landmark-collision.md`**, authored and committed **2026-07-19 11:07:13 +07:00** — made the coordinate invalid:

1. It created the landmark-collision registry and authored `hill-mine:boiler-house-site` at `(0, 12)` with radius `2.687` and scale `1.25`.
2. It added `LandmarkCollision.ts`.
3. It changed `Terrain.sample` to mark points inside an authored landmark footprint non-walkable.
4. It changed `Terrain.isBuildable` to require both `terrain.walkable` and `zone === 'bank'`.

The parent of `d1f549d5` has no landmark-collision import, blocker registry, or walkability check in `Terrain.isBuildable`. The same commit’s report calls the Hill Mine boiler-house footprint “authored,” and its new browser test is titled **“authored footprints stop the hero on The Claim and a county map while an unfootprinted mount stays walkable”**. This was deliberate solidity, not an accidental placement-rule change.

Concise commit diff and blame evidence: `logs/session-scratch/s1284-lane-d/history-evidence.txt`.

## Firewall proof

No product or e2e bytes changed:

```text
$ git diff main -- src/ e2e/
```

The command produced no output.

## Final checks

- `npx tsc --noEmit`: rc 0 (`logs/session-scratch/s1284-lane-d/tsc-output.txt`)
- `npm run build`: rc 0 (`logs/session-scratch/s1284-lane-d/build-output.txt`)
- Scratch door probe: 2/2 projects passed with zero console/page errors.
- `git diff --check`: rc 0.
- `node scripts/citation-title-guard.mjs`: PASS. Its current scope is tracked `tasks/**`; this review contains no bare `spec:line` citation.
- `git status --short`: changes only under `logs/session-scratch/s1284-lane-d/` and `reviews/f1281-2-turret-placement-diagnosis.md`.

## Recommendation

Keep the landmark collision and shared placement rule unchanged: allowing a turret inside the solid boiler-house model would be the product regression. After the owner accepts the July 19 landmark solidity as intended terrain, use a separate test-only slice to move **“Auto-Pan upkeep and boiler battery bands consume the fixed-step pressure store”** to a documented open point on the existing `base-t1` build zone, outside every authored footprint, and retain the test’s pressure-band assertions. This diagnosis deliberately does not select or edit that coordinate.
