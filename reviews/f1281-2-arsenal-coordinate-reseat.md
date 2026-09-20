# F-1281-2 — arsenal turret coordinate reseat

## Verdict

**READY-FOR-GATES.** The stale turret coordinate in **“Auto-Pan upkeep and boiler battery bands consume the fixed-step pressure store”** moved from `(0, 10)` to measured open point `(10, 12)`. The placement and landmark-collision rules are unchanged.

- Branch: `lane/m3`
- Main base: `cf4dddb9`
- Product source changed: none
- Downstream pressure assertions changed: none; they read turret fire-rate diagnostics, not position.

## Abort check

Before the edit:

```text
npx playwright test e2e/e2-arsenal.spec.ts --workers=1 -g "Auto-Pan upkeep and boiler battery bands consume the fixed-step pressure store"
```

Result: **2 failed**. `desktop-chrome` and `mobile-chrome` both received `false` from `placeFree('turret', 0, 10)`, so the diagnosed premise remained present.

## Measured replacement

The live-page probe evaluated both points through the real `BuildSystem.placeFree` path on both projects. Desktop and mobile returned identical measurements.

Chosen point: **`(10, 12)`**

| Value | Measured result |
|---|---:|
| `countFor('turret')` | `0` |
| `maxCountFor(turretDef)` | `4` |
| target after `snap()` | `{ x: 10, y: 0, z: 12 }` |
| `matchesPlacement(turretDef, target)` | `true` |
| `overlapsExisting('turret', target)` | `false` |
| `placeFree('turret', 10, 12)` | `true` |

The definition was present and enabled. `Terrain.sample(10, 12)` returned `{ walkable: true, speedMul: 1, zone: 'bank' }`; `Terrain.isBuildable(10, 12)` and tile traversal were both `true`. The point matched `base-t1`, `x [-30, 30]`, `z [8, 16]`.

Every blocker registered for the contract was enumerated with the `0.58` collision pad:

| Blocker | Half-extents | Contains padded point | Padded-edge clearance |
|---|---:|---:|---:|
| `hill-mine:boiler-house-site` at `(0, 12)` | `(3.35875, 3.35875)` | `false` | **`6.06125`** |
| `hill-mine:tailings-and-scree-pack` at `(35, 34)` | `(4.922476, 4.097832)` | `false` | `26.080854` |

The nearest padded blocker edge is therefore **6.06125 units away**, leaving visible margin.

Probe evidence:

- `logs/session-scratch/s1286-lane-a/candidate-probe-desktop-chrome.json`
- `logs/session-scratch/s1286-lane-a/candidate-probe-mobile-chrome.json`
- `logs/session-scratch/s1286-lane-a/candidate-probe.spec.ts`

## Rejected candidate and old-coordinate control

Rejected point: **`(0, 10)`**

It is inside `base-t1`, but `Terrain.sample` returned `walkable: false`, `Terrain.isBuildable` returned `false`, and `matchesPlacement` returned `false`. It remained inside the padded and unpadded `hill-mine:boiler-house-site` footprint, with padded-edge clearance **`-1.93875`**. `overlapsExisting` remained `false`.

The scratch probe asserted both directions on each project:

```text
desktop-chrome: placeFree(0, 10) false; placeFree(10, 12) true
mobile-chrome:  placeFree(0, 10) false; placeFree(10, 12) true
2 passed
```

This control proves the test moved while the load-bearing landmark rule stayed active.

## Verification

```text
npx playwright test e2e/e2-arsenal.spec.ts --workers=1 -g "Auto-Pan upkeep and boiler battery bands consume the fixed-step pressure store"
2 passed

npx playwright test e2e/e2-arsenal.spec.ts --workers=1
6 passed

npx tsc --noEmit
rc 0

npm run build -- --logLevel error
rc 0

git diff --check
rc 0
```

The probe and arsenal assertions captured zero console/page errors.

## Firewall proof

```text
$ git diff main -- src/
```

No output.

`git diff main -- e2e/` touches only `e2e/e2-arsenal.spec.ts`, and only adds the landmark-constraint comment and changes `(0, 10)` to `(10, 12)`.

The full arsenal run regenerated six tracked evidence PNGs. Per the task’s evidence-artifact exception, these were discarded:

- `artifacts/e2-arsenal/desktop-chrome-boiler-lance-steam-jet.png`
- `artifacts/e2-arsenal/desktop-chrome-pressure-mortar-arc.png`
- `artifacts/e2-arsenal/desktop-chrome-sky-rocket-gold-teal-salvo.png`
- `artifacts/e2-arsenal/mobile-chrome-boiler-lance-steam-jet.png`
- `artifacts/e2-arsenal/mobile-chrome-pressure-mortar-arc.png`
- `artifacts/e2-arsenal/mobile-chrome-sky-rocket-gold-teal-salvo.png`
