# f1452-1 — fort solidity and static-wall routing report

Status: **READY-FOR-GATES** on base `c063b5e59b34345f61666b01a4662f8811e8a110`.

## Routing design

`BuildSystem.palisadeRoute` now normalizes active built palisades and registered terrain landmarks into the route graph's existing blocker shape. It still uses the existing component, opening-distance, segment-hit, and endpoint-selection machinery; there is no second router.

- Built and static components do not merge. This preserves player-built palisade routing and gnaw semantics.
- Only wall-like static bodies (AABB aspect ratio at least `2.8`) can initiate a route. Short landmarks retain the existing local-slide behavior. All static bodies remain eligible as component links, so the two `fortified_far_bank` platforms correctly bridge the authored fort rows.
- Static components use their aggregate bounds and the existing formation spread when placing an endpoint. Candidate segments that cross another body in the same component are rejected.
- `PalisadeRoute.blocker` is nullable. Built routes return the original `BuildingTarget`; static routes return `null`. The enemy watchdog only enters gnaw mode when that value is non-null, so a landmark can supply a waypoint but never an HP target.
- `LandmarkCollision.ts`, `Game.ts`, and `blockerSlideDirection` were not changed.

The specialized wrecker path still deliberately bypasses normal gap flow so wreckers can seek and damage player buildings. Whether wreckers should route around an indestructible fort landmark is coupled to the explicitly deferred owner question below and was not changed in this slice.

## Manufactured red — the stall regression is load-bearing

Spec: `e2e/fort-static-routing.spec.ts`.

The probe uses a normal, non-scripted enemy at `(0, -14)`, a hero target at `(0, -5.8)`, the real fixed-step update path, and 50 simulated seconds / 1,500 ticks. It asserts that the enemy crosses north of `z = -6.5`, finishes at less than 75% of its initial target distance, has a longest stationary run below 120 ticks, and emits no console/page error.

Manufactured regression:

```text
scope 1 disabled: static route source filtered to zero entries
FAIL e2e/fort-static-routing.spec.ts
expect(run.path.some(({ z }) => z > -6.5)).toBe(true)
Expected: true
Received: false
exit: 1
```

Restored implementation:

```text
npx playwright test e2e/fort-static-routing.spec.ts \
  --project=desktop-chrome --project=mobile-chrome --workers=1
2 passed (12.5s)
desktop 4.6s; mobile 5.7s
```

This reproduces the predecessor's failure mode: without scope 1 the newly solid wall remains a collider but is invisible to route planning.

## Registry closure and mount sanity

The mounted positions come from `assets/pilots/map-rebuild-spike/build_unique_contract_terrains.py:102-105` and `build_the_claim_terrain.py:1726`. The body sizes and subdivisions match the predecessor's measured census; the headframe scale and the palisade rotations match the authored mounts/pack.

| Map | Landmark | Registered bodies | Mount sanity |
|---|---|---:|---|
| The Claim | `active_headframe` | 1 rect `3.168 × 2.016` at `(-13, -8.8)` | Exact mounted position, scale `1.0` |
| Baron | `seized_headframe` | 1 rect `3.168 × 2.016` at `(-13, 13)` | Authored rotation `0.06`, scale `1.2` retained |
| Baron | `fortified_far_bank` | 5 palisades `5.8 × 1.0`; 2 platforms `3.0 × 2.8` | Center and `±6/±12` palisade placement; `±9` platforms; authored slight rotations retained |
| Baron | `siege_line` | 5 palisades `5.6 × 0.9` | Center and `±5.5/±11` placement; authored rotations `0, .05, .10, .15, .20` retained |

No intentionally walkable census item was registered.

## Four-face and never-trap evidence

Spec: `e2e/fort-landmark-collision.spec.ts`.

Each new landmark group is probed from all four faces. Every individual registered body is then seeded with the hero at its center and must resolve the hero outside the entire group. Expected body counts are also asserted: `1`, `1`, `7`, and `5`.

```text
desktop-chrome: PASS (47.6s clean run; also green before the final routing-only edit)
mobile-chrome:  PASS (42.2s clean run)
console/page errors: 0
```

Screenshots:

- `artifacts/fort-solidity/desktop-chrome-walk-probe.png`
- `artifacts/fort-solidity/mobile-chrome-walk-probe.png`

Both screenshots were visually inspected after capture.

## Gates and adjacent evidence

| Check | Result |
|---|---|
| `npx tsc --noEmit` | PASS, final rerun, 6.5s |
| `npm run build` | PASS, final rerun; Vite 2.02s; asset diet green |
| New stall regression, desktop + mobile | PASS 2/2 after the required manufactured red |
| New four-face/never-trap probe, desktop + mobile | PASS 2/2 in clean isolated runs |
| Plain boot, no `?debug`, desktop + mobile | PASS 2/2, 53.1s; zero console/page errors |
| `git diff --check` | PASS |

The requested combined E1/browser sweep was attempted with both projects and one worker while other factory lanes were concurrently saturating the host. It reached 42 passed / 21 failed / 37 not run before the run was stopped; failures included unrelated current-tree content drift and timeouts under load. The relevant routing failures were investigated rather than waived:

- `enemy-gap-flow.spec.ts:154`: expected `z > 15`, received exactly `13.873747435156046`.
- `enemy-gap-flow.spec.ts:181`: expected watchdog trips `0`, received exactly `3`.

Both fingerprints reproduced at the exact same values in a detached clean-`HEAD` worktree on `c063b5e5`, and an independent Codex review repeated that clean-`HEAD` control. They predate this slice. Test-generated `artifacts/enemy-gap-flow/` churn was restored.

The independent review also ran `node scripts/gr-sim.test.mjs`: 8/9 passed. The Baron deterministic golden changed from 869 to 861 kills and from `fnv1a32:b9566c6d` to `fnv1a32:36004eab`. This is expected evidence that the new static route participates in Baron simulation, but the existing golden cannot be updated in this firewalled slice. The orchestrator must review and ratify that deterministic golden change during integration.

## Owner decision left open

Whether landmark forts may ever be damaged or explicitly sieged remains an owner/canon decision. This implementation keeps them indestructible and non-gnawable; it does not invent HP, building families, damage ownership, or siege rules for landmarks.
