# F-1510-1 blocker-slide deadband — negative result

Date: 2026-08-07  
Lane: `lane/a`

## Verdict

**STOP: no scalar goal-delta deadband tested can satisfy both routing invariants.** The
deadband must exceed the Dry Gulch blocker's lateral collision clearance to cure the
head-on stall, but doing so restores the Lampworks Yard wedge that F-BW-10 fixed.
`src/entities/Enemy.ts` was restored byte-identical; this report is the only repo change.

All Playwright commands used `--workers=1` and ran both configured projects
(`desktop-chrome` and 390 px `mobile-chrome`). Thresholds are world-space units along
the slide axis.

## Baselines

| Tree | `landmark-collision:68` | full `never-trap.spec.ts` |
|---|---:|---:|
| untouched lane | 0 passed / 2 failed | 8 passed / 0 failed |

The landmark failures were the expected assertion at line 91 on both projects. The
untouched `never-trap` suite passed all four tests on both projects.

## Threshold arms

| Deadband (world units) | `landmark-collision:68` | full `never-trap.spec.ts` | Result |
|---:|---:|---:|---|
| 0 (baseline) | 0 passed / 2 failed | 8 passed / 0 failed | preserves F-BW-10 only |
| 0.05 | 0 passed / 2 failed | 8 passed / 0 failed | too narrow |
| 0.25 | 0 passed / 2 failed | 8 passed / 0 failed | too narrow |
| 1.0 | 0 passed / 2 failed | 8 passed / 0 failed | too narrow |
| 3.9 | 2 passed / 0 failed | 6 passed / 2 failed | regresses F-BW-10 |
| 4.0 | 2 passed / 0 failed | 6 passed / 2 failed | regresses F-BW-10 |

Both `never-trap` failures at 3.9 and 4.0 were deterministic on
`night-shift:lampworks_yard route 1`, in the line-155 progress assertion, on desktop
and mobile. At 3.9 the measured bad progress window was `0.05025506378274436`
(required `> 0.35`); at 4.0 it was `-0.05865516262226045`.

## Why there is no separating scalar threshold

The Dry Gulch subject has `halfX = 3.176`. `resolveBlocker()` adds the existing
`0.68` avoidance pad for a normal enemy, so a stable fallback direction must remain
active beyond roughly `3.856` world units to clear the face. This matches the arms:
1.0 fails and 3.9 passes.

Lampworks Yard is wider (`halfX = 4.302`). Its fuzz target is placed only 2 units
beyond the footprint, so switching from the goal-relative direction back to the
enemy-id fallback before clearing the padded face can select the losing direction.
The 3.9 and 4.0 arms measure that regression directly.

## Commands

```text
npx playwright test e2e/landmark-collision.spec.ts -g "goes around a county landmark" --workers=1
npx playwright test e2e/never-trap.spec.ts --workers=1
```

No browser console or page error was printed in any arm. The suites emitted the
existing `THREE.Clock` deprecation warning, which is a warning, not a console error.
For red landmark arms, the test stops at line 91 before its final collected-error
assertion.

## Intentionally not run

The task says to stop when no threshold greens both judge specs. Therefore the
manufactured-defect restoration proof, four-consumer battery, adjacent suites, tsc,
build, and node guards were not run: there is no chosen cure to validate.

