# Review — THE DEEPWATER WAVE COUNTER

- **Slice:** `lane-deepwater-wave-counter` (FIRE-AUTHORED s1025 from the saga rehearsal's F-REH-05)
- **Branch/tip:** `lane/m4`-slot lane-b @ `28676698` (runner)
- **Base:** `4d04e3b8` (the rig-repair drain — already on main)
- **Merged to main:** `3598b88c` (squash, path-scoped, 2 files / 43 insertions)
- **Drained by:** s1026 fire, 2026-07-25

## VERDICT: PASS — merged.

## What it does

On `e5-deepwater-claim` the corsair waves are scheduled by `DeepwaterClaimTile`, not by
`WaveSystem` — so `Game.ts` fed the HUD `waveSystem.diagnostics.wave`, a permanent **0**,
while the player fought a hundred waves. A healthy run read as a broken one: the same class
of defect as the loading shells the owner hit on his thin line. The fix extracts the true
run-wave into one accessor, `currentRunWave()`, and uses it at both the HUD call site and
the baron-defeat recording site that already knew the rule.

## Evidence (all on the MERGED tree)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (diet still 84%/87%) |
| `e2e/e5-deepwater-claim.spec.ts` desktop+mobile | **3/3 each** — incl. the new `shows the active run wave in Deepwater and WaveSystem contracts` |
| `e2e/e5-boss-dredge-queen.spec.ts` | green; boss-run frame p95 ratio **desktop 1.00 / mobile 1.041** (ceiling 1.15) |
| `e2e/e5-arsenal` · `e5-water-spike` · `task-025-bandits-dont-swim` | green, both projects |
| console/page errors | zero |

## Merge classification

Base `4d04e3b8`. Both files **LANE-TOUCHED, zero MAIN-MOVED** — `git log 4d04e3b8..main --
src/game/Game.ts e2e/e5-deepwater-claim.spec.ts` returned **empty**. No graft, no conflict.

| File | Class | Change |
|---|---|---|
| `src/game/Game.ts` | LANE-TOUCHED | +8/-2 — `currentRunWave()` + both call sites |
| `e2e/e5-deepwater-claim.spec.ts` | LANE-TOUCHED | +37 — the counter assertion |

## Findings

**F-1026-4 — the accessor is NOT a literal extraction; it substitutes a near-equivalent
field. Verified equivalent, merged, but recorded because it is a silent semantic swap.**
The master said to extract the existing idiom at `Game.ts:4738`, which read:
`this.deepwaterClaim?.snapshot().corsairWaves.length ?? this.waveSystem.diagnostics.wave`.
The runner instead wrote `this.deepwaterClaim ? this.deepwaterCorsairWavesSpawned : …`.
Traced rather than assumed: `deepwaterCorsairWavesSpawned` is assigned
`snapshot.corsairWaves.length` at `Game.ts:4637` on each corsair sync, reset to 0 at 5857,
and the tile clears `corsairWaves` on reset — so the two agree **except for a possible
one-sync-tick lag** if `completeBaronDefeat` were to run between the tile pushing a wave and
Game's next sync. That boundary feeds `defeatRecordedBeforeSecureWave` (whether a win
counts), so it is not a cosmetic difference in principle. The dredge-queen suite — which
owns exactly that paddles-gate/secure-wave logic — is green on both projects, so the
observable behaviour is unchanged. Arguably the substituted field is the *better* HUD source
(waves actually materialised, not entries scheduled). No corrective spawned; flagged so a
future reader knows the swap was deliberate and checked.

**F-1026-5 — TWO PRE-EXISTING RED RESOURCE GUARDS ON MAIN, inherited, NOT from today's
merges. Needs a corrective.** While running adjacents I found:
- `m1-01-claim-jumpers-death.spec.ts:70` *double restart recycles enemies without geometry
  growth* — **expected 77 geometries, received 87** (+10 growth across restarts)
- `m2-01-build-menu.spec.ts:322` *stress draw calls stay under 200 with palisades and
  beacons* — the ceiling assertion returns **false**

Both fail on **desktop and mobile**, and both **reproduce at `--workers=1`** (so they are not
the contention flake of F-1026-2). Ownership was established by a three-point bisect rather
than by argument:

| Tree | m1-01 / m2-01 |
|---|---|
| merged (advance-stream + lane-b) | RED |
| HEAD without lane-b | RED |
| `4d75f675`, **pre-advance-stream** | RED |

So neither slice drained today is responsible — these were already red on main when this fire
took the lock. M1/M2 are **signed-off milestones**, and these are their memory/draw-call
guards, so a leak or an unbatched draw path has crept in from earlier work. Recommend a
diagnostic corrective (bisect `m1-01:70` back to the commit that moved 77→87). Logged to
BACKLOG; not authored this fire to respect the one-master limit and because the drains had
already run long.

**Where does the PLAYER see this, in a plain boot?** (Mistake #10) — in the Deepwater
contract HUD: the wave number now climbs as the corsair waves arrive instead of sitting at
0. The new spec asserts the visible counter in both a Deepwater and a WaveSystem contract,
so the guard covers the ordinary path as well as the special one.
