# F-1148-1 trajectory split — stopped before measurement

This measurement stopped under the task's two-strike rule. The retained probe reached the exact
m2-04 fixture setup twice, but `confirmBuild()` rejected a palisade before either trajectory
could start. No zero-valued or partial run is reported as data.

## Probe method

`scripts/probe-f1148-1-trajectory.mjs` opens an isolated desktop Chromium context per run, clears
storage, boots the m2-04 wall seed with waves/kills/levels disabled, and constructs the test's
five-palisade line plus stockpile through `__GR_TEST__`. After spawning the solitary south thief,
an in-page `requestAnimationFrame` loop samples its world `x/z` until the first `gold_stolen`
event. The probe emits sim time from spawn, summed sample-to-sample path distance, minimum and
maximum X, and sample count; it rejects zero-sample or zero-distance runs as `VOID`.

Usage:

```sh
node scripts/probe-f1148-1-trajectory.mjs <base-url> <run-count> <label>
```

## Positive control and two-strike stop

Arm A used current unmutated `main` on scratch port **5234**. Port 5231 was already occupied by
an unrelated Vite server and was left untouched.

Attempt 1:

```text
page.evaluate: Error: confirmBuild failed: palisade@-1,9
```

Attempt 2, after changing the setup from one synchronous in-page loop to the e2e test's separate
awaited browser calls:

```text
Error: confirmBuild failed: palisade@2,9
```

Both failures occurred before `spawnThief`, so the trajectory loop executed zero times. There is
therefore no sample count or path distance to validate, and both attempts are **VOID**, not Arm A
runs. The changing failure coordinate matches the separate `placeBuildableAt` fault already
recorded by the predecessor (`artifacts/f-1147-1-bisect.md`, one of six reproduction cases).

The task says: “If you are blocked twice on the same obstacle, STOP and report rather than trying
a third variation of the same idea.” I stopped after the second `confirmBuild` block.

## Three-arm table and classification

| Arm | Individual runs | Median / spread | X floor | Status |
|---|---|---|---|---|
| A — current main | none | none | none | fixture blocked twice before sampling |
| B — main, `lateralOffset = 0` | not run | not run | not run | throwaway mutation was not made |
| C — parent `a26eca02` | not run | not run | not run | detached worktree was not created |

**Classification: UNMEASURED.** The requested B-vs-A-vs-C route comparison cannot be made from
these attempts. In particular, this report neither confirms nor contradicts F-1148-1 and does not
infer a pathing result from the placement failure.

## Firewall and worktree handling

- `src/entities/Enemy.ts` was never edited; no Arm B byte backup was needed.
- No detached parent worktree was created, so there is no Arm C port or worktree to remove.
- `e2e/m2-04-gold-stealing.spec.ts` was not edited and its `< 20` budget remains intact.
- No repair or budget widening was attempted.

## Self-check

Final command results are recorded below after the stopped measurement:

| Command | Result |
|---|---|
| `npx tsc --noEmit` | `rc=0`, 3.67 s |
| `npm run build` | `rc=0`, 13.53 s |
| `git status --porcelain -- src/` | `rc=0`, empty output |
| `git status --short` | only `?? artifacts/f-1148-1-trajectory-split.md` and `?? scripts/probe-f1148-1-trajectory.mjs` |
| `npx playwright test e2e/m2-04-gold-stealing.spec.ts --project=desktop-chrome --workers=1 --reporter=list` | expected `rc=1`: 6 passed / 1 failed in 45.1 s; unchanged budget assertion at `:226`, received `20.99999999999998` |

This is a lawful STOP report, not `READY-FOR-GATES`: scopes 2–4 could not execute without violating
the task's explicit retry ceiling.
