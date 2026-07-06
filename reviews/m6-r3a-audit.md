# M6-r3a Audit: actors-foundation parked partial

Date: 2026-07-06
Worktree: `worktrees/lane-d`

## Branches

| Branch | Commit | Purpose |
|---|---:|---|
| `lane/m6-partial-salvage` | `6f4aca6` | Local salvage commit of the parked attempt-2/3 partial. Pushed nowhere. |
| `lane/perf` | `e738424` | Clean current-main baseline after `git reset --hard main`. |
| `lane/m6-r3a-apply` | `72db71b` | Scratch cherry-pick of `6f4aca6` onto current main. |

## What Was Audited

The salvage commit itself is narrow: `Balance.ts`, `Game.ts`, `CombatSystem.ts`.
The branch-to-branch diff `git diff main lane/m6-partial-salvage -- src/` is not safe integration scope: it is 31 files / 3926 lines because the salvage base predates W1 terrain, M5 crafting/Assay Office, task-028 target-leading, and task-031 animation work.

## Verdict Table

| File / change | Verdict | Notes |
|---|---|---|
| `src/game/Balance.ts` adds `actors.enabled = false` | SOUND | Builds and test battery pass on scratch. Keep as the M6 guard knob. |
| `src/game/Game.ts` replaces the private `hero` singleton with `actors = [new Hero()]` plus `primaryActor` | SOUND with rebase fixes | The mechanical refactor is sound after preserving current-main hooks: Assay Office `openAssayBench`, W1 `syncHeroVisualHeight`, terrain water/height diagnostics, `scriptEnemyAt`, and current debug diagnostics. |
| `src/systems/CombatSystem.ts` accepts `readonly Hero[]` and resolves contact/mote collection through `primaryActor` | SOUND | Build and m1/task-025/m2 batteries pass. CombatSystem remains the sole damage resolver. |
| Whole `lane/m6-partial-salvage` branch diff vs `main` | STALE | Do not merge the branch wholesale. It would delete current-main systems (`src/crafting/*`, `src/world/Water.ts`, W1 terrain hooks, task-028 bolt-leading diagnostics, task-031 animation knobs, Assay Office wiring). |

No UNSOUND partial hunk was found.

## Mechanical Rebase Fixes Applied On Scratch

Only `src/game/Game.ts` conflicted while cherry-picking `6f4aca6`.

Kept current main and routed it through `primaryActor`:

- `constructor(canvas, openAssayBench?)` plus `this.assertActorMode()`.
- `teleport`, `updatePresentation`, `createScene`, and `resetRun` retain `syncHeroVisualHeight()`.
- Terrain diagnostics retain `water` and `height`.
- `confirmAction()` keeps Assay Office interaction and checks `primaryActor.group.position`.

## Verification

### Baseline: `lane/perf` at `e738424`

| Check | Result |
|---|---:|
| `npm install --no-audit --no-fund` | pass, up to date |
| `npm run build` | pass |
| `npx playwright test --config pw.reuse.config.ts --workers=1 e2e/task-025-bandits-dont-swim.spec.ts e2e/m1-01-claim-jumpers-death.spec.ts e2e/m2-01-build-menu.spec.ts` | 30 passed in 1.7m |
| Determinism probe, seeded `m6-r3a-determinism`, two runs | pass, hash `91d12069e0498f1f8f087810c34029def972f070e012f2c98509e16d65765d3d`, no console/page errors |

### Scratch Apply: `lane/m6-r3a-apply` at `72db71b`

| Check | Result |
|---|---:|
| `npm run build` | pass |
| Parallel first attempt, same three specs, default workers | 17 passed / 13 failed; discarded as worker-pressure evidence after serial rerun passed |
| `npx playwright test --config pw.reuse.config.ts --workers=1 e2e/task-025-bandits-dont-swim.spec.ts e2e/m1-01-claim-jumpers-death.spec.ts e2e/m2-01-build-menu.spec.ts` | 30 passed in 2.4m |
| Determinism probe, seeded `m6-r3a-determinism`, two runs | pass, same baseline hash `91d12069e0498f1f8f087810c34029def972f070e012f2c98509e16d65765d3d`, no console/page errors |

No dedicated checked-in `perf-04`/M6 determinism harness exists in this tree; the probe was a one-off Playwright hash over a stable debug-state subset using explicit `spawnEnemyAt` placements.

## Minimal Integration Plan

Recommendation: **attempt-4-scope**.

Do not integrate `lane/m6-partial-salvage` as a branch. It is stale against current main.

Attempt 4 can be a small three-file rebase using the scratch diff from `lane/m6-r3a-apply`:

1. Land `Balance.actors.enabled = false` and the constructor guard.
2. Land `Game.ts` actor-array plumbing, preserving the current-main Assay Office, W1 terrain-height, and debug APIs exactly as in `72db71b`.
3. Land `CombatSystem.ts` `readonly Hero[]` plumbing.
4. Add or formalize the missing M6/perf determinism harness if the orchestrator wants this as a permanent gate instead of a one-off audit probe.

Estimated attempt-4 scope: one small mechanical refactor slice plus a tiny test-harness task if permanent determinism coverage is required.
