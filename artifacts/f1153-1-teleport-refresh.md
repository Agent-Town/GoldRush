# F-1153-1 — teleport action-position refresh

Date: 2026-07-28  
Branch: `lane/perf`

## Verdict

**The measured placement flake is GONE: 20/42 baseline scenarios failed (47.6%), versus 0/42 cured scenarios (0%). Residual observed rate: 0/42.**

The arms ran on the same box in ABBA order using `scripts/probe-s1152b-confirmbuild-cause.mjs`, seven invocations per arm and three fresh-page scenarios per invocation:

| Order | Arm | Placement failures | Rate |
|---|---|---:|---:|
| 1 | before-ab | 10/21 | 47.6% |
| 2 | after-ab | 0/21 | 0% |
| 3 | after-ba | 0/21 | 0% |
| 4 | before-ba | 10/21 | 47.6% |

Every one of the 20 baseline failures was `invalid_overlap` with `overlapOk:false`; `playerPos` and `ghostPos` held the preceding placement. Neither cured arm produced a placement failure.

Raw summaries:

- `artifacts/f1153-1-teleport-refresh/before-ab/summary.json`
- `artifacts/f1153-1-teleport-refresh/after-ab/summary.json`
- `artifacts/f1153-1-teleport-refresh/after-ba/summary.json`
- `artifacts/f1153-1-teleport-refresh/before-ba/summary.json`

## Actor identity

On the solo probe path, `mpLocalSlot` and `mpActionSlot` both start at `0` (`Game.ts:373-374`), while `localActor` and `actionActor` resolve `actors[mpLocalSlot]` and `actors[mpActionSlot]` respectively (`Game.ts:912-918`). Therefore `actionActor === localActor === actors[0]` on this harness path.

They can differ in multiplayer. `syncMultiplayerActors()` assigns `mpLocalSlot` from the local roster entry (`Game.ts:3241-3243`), while `applyMultiplayerActions()` resets `mpActionSlot` to `0` after applying queued actions (`Game.ts:2636-2643`). A non-host local actor can therefore differ from the current action actor when the debug hook runs.

The cure first calls the requested `updateActionActorPosition()` seam, then copies the teleported local actor only when those identities differ. This keeps the solo fix on the production seam without making multiplayer debug teleports copy slot 0.

## m2-04 assertion classification

The default exact command used eight workers and saturated this box. It is recorded, but not used for cure attribution because failures spread across unrelated test families at their 30/60-second timeouts.

| Run | Placement `confirmBuild() === false` | Budget `:226` | Other load/timeouts | Passed |
|---|---:|---:|---:|---:|
| Before, exact command, 8 workers | 0 confirmed | 1 | 40 | 29/70 |
| After, exact command, 8 workers | 0 confirmed | 1 | 47 | 22/70 |

The same file was therefore run serially before and after for assertion-level attribution:

| Project | Before placement | Before budget | After placement | After budget |
|---|---:|---:|---:|---:|
| desktop-chrome | 2 | 1 | 0 | 2 |
| mobile-chrome | 4 | 1 | 0 | 5 |
| **Total** | **6** | **2** | **0** | **7** |

All serial failures were either `e2e/m2-04-gold-stealing.spec.ts:46` receiving `false` from `confirmBuild()` or the independent `:226` `toBeLessThan(20)` budget assertion. No e2e file was changed.

## Gates

| Check | Result |
|---|---|
| Pre-change `npm run build` | rc=0 |
| `npx tsc --noEmit` | rc=0 |
| `npm run build` (single command, no pipe) | rc=0 |
| `npm run test:guards` | 8/8 passed |
| `npx playwright test e2e/m2-04-gold-stealing.spec.ts --repeat-each=5` | rc=1; 22/70 passed, 47 load/timeouts, 1 budget red, 0 confirmed placement failures |
| Serial m2-04 attribution run | rc=1; 63/70 passed, 7 budget reds, 0 placement failures |
| Probe console/page errors | none surfaced in the Playwright reporter |

## Full `src/` diff

```diff
diff --git a/src/game/Game.ts b/src/game/Game.ts
index b6d23258..b958e47d 100644
--- a/src/game/Game.ts
+++ b/src/game/Game.ts
@@ -1652,6 +1652,8 @@ export class Game {
           this.localActor.velocity.set(0, 0, 0);
           this.e8PhysicsSystem.reset(this.mpLocalSlot);
           this.localActor.snapRenderState();
+          this.updateActionActorPosition();
+          if (this.actionActor !== this.localActor) this.actionActorPosition.copy(this.localActor.group.position);
         },
         spawnPack: (n: number, radius?: number, opts?: SpawnPackOptions) =>
           this.spawnHarnessPack(n, radius, opts ?? legacySpawnPackOptions(n, radius)),
```

## Firewall

`src/` changes are confined to the `teleport()` body. `e2e/` is untouched. The existing diagnostic probe gained only an environment-selectable artifact directory so all four arms could preserve raw records under this task's allowed artifact path.

READY-FOR-GATES
