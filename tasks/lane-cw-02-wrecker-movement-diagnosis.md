# Task lane-cw-02-wrecker-movement-diagnosis: name the transform that turns a CORRECT wrecker target into westward drift (lane-a, commit prefix "diag:")

**FIRE-AUTHORED s1117 (attended review welcome). DIAGNOSIS ONLY — the expected final diff is a single new measurements file and NOTHING else.**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

READ FIRST: `AGENTS.md`; `reviews/lane-cw-02-tram-span-preference-diagnosis.md` (your predecessor's measured table — the ground you start from); `e2e/cw-02-escort.spec.ts` lines 100–140; `src/entities/Enemy.ts` lines 676–760, 1040–1075, 1121–1160, 1160–1200, 1230–1275, 1375–1394; `src/sim/TileHeight.ts` lines 72, 231, 258.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

*(s1117 pre-measured this for you and you must still re-verify it yourself: `lane/m3` was 1 ahead at `5ad1b22b`, whose single added file `reviews/lane-cw-02-tram-span-preference-diagnosis.md` is blob `27fab4cc`, byte-identical to main's copy — a SAFE DUPE, so the reset is loss-free. The worktree was CLEAN.)*

## Why (F-1116-3, drained `2bd19809` on 2026-07-27; plus source facts re-verified by s1117)

Three fires have now chased `cw-02-escort.spec.ts:134`. The question has moved **down a layer twice**, and each move was earned by a measurement that disproved the previous fire's favourite idea. **Do not re-open the closed layers.**

- **CLOSED — geometry.** s1114/s1115 measured distances to a spawn gate. Wrong rule entirely: `Enemy.ts:1045` calls `context.nearestBuilding(...)`, but that callback is `preferredEscortTarget(from) ?? preferredTramEscortSpanTarget() ?? goldTargeting.nearestBuilding(from)` (`Game.ts:1124-1125`) — distance is the THIRD fallback.
- **CLOSED — target selection.** Your predecessor instrumented the preference and it is **LIVE**: `preferredTramEscortSpanTarget()` returns `sentry_beacon:2` in all 3 runs; feed `{a:pylon-west-rim,b:tram-motor}`; pylon site `(-28,8) r=2.5`; beacon 2 sits at **exactly `(-28,8)`, distance `0.000000`**, un-wrecked 40/40. `:134` is **CORRECT — not stale and not fixture-broken.**
- **CLOSED — the sim budget.** F-1114-3: `advanceSim(40)`, 5×, changed nothing. **Do not raise `advanceSim(8)`.**

**THE LIVE FACT, and your starting point:** the wrecker **acquires `sentry_beacon:2` at +0.2s and STILL HOLDS IT at +8.0s** — `currentBuildingId` never changes — while travelling `(-38,32) → (-47.997672, 26.215056)`, i.e. **away from its own retained target**. Stable across 3 runs.

So the target is right and the movement is wrong. ✓ VERIFIED by s1117 at source, there are exactly **three transforms** between the two, and they are all on two lines:

- `Enemy.ts:683` — `targetPosition = this.chooseTarget(...)` → the beacon at `(-28,8)`.
- `Enemy.ts:685-687` — `gapTarget`: for a wrecker the ternary's `!this.wrecker` is **false**, so `gapTarget === targetPosition`. **`updateGapFlow` is NOT in this path.**
- `Enemy.ts:688` — `moveTarget = scriptedRailRoute || escortRailTarget ? gapTarget : this.terrainAwareTarget(this.routedTarget(gapTarget))`. `escortRailTarget` (`:684`) is `currentBuilding?.id === 'escort:ore-cart'`, which is **false** here (the id is `sentry_beacon:2`), so **both `routedTarget()` and `terrainAwareTarget()` run.**
- `Enemy.ts:692` derives `heading` from `moveTarget`; `:742` passes `moveTarget` into `move()`, which calls `resolveTerrain(moveTarget)` (`:1172`, `:1189`).

**The arithmetic that makes this a real defect and not a slow test.** Spawn is `(-38,32)` (s1115 verified `spawnHarnessWrecker` is hero-relative, `Game.ts:6831-6843`, radius `min(14,26)=14`, clamped ±38, against `:123 teleport(-24,32)`). Target is `(-28,8)`. **Distance = √(10² + 24²) = exactly 26.0.** The spec sets `enemy.speed = 8` at `:120`, so a straight run is **3.25 s inside an 8 s budget — a 2.46× margin.** Observed **net displacement is 11.55 units in 8 s ≈ 1.44 u/s, a 5.5× shortfall.** Something is either aiming it elsewhere or cancelling most of its motion.

## Scope

**1. MANDATORY MEASUREMENT — this gates everything below.** Reproduce the `:118-132` window and sample every **0.2 sim seconds** across the full 8 s. For each sample record, for the wrecker:

`group.position (x,z)` · `currentBuildingId` · `wreckerState` · `terrainSlideSide` · `targetPosition` (the `:683` value) · the **output of `routedTarget(gapTarget)`** · the **output of `terrainAwareTarget(...)`, i.e. the final `moveTarget`** · `Terrain.sample(pos).zone` / `.walkable` / `.speedMul` · `hasElevationTile()` · `Terrain.waterMask()` · `riverSide(pos.z)` and `riverSide(8)`.

Then **state which of (A)–(D) below fires.** The three transform outputs are the whole point: the **first column that stops equalling `(-28,8)` names the culprit.**

**2. Distinguish "aimed wrong" from "cancelled".** Report cumulative **path length** (sum of per-sample step magnitudes) alongside **net displacement**, and the **effective speed** against `Balance.enemy.speed = 8`. Path ≈ net ⇒ it is being *aimed* elsewhere. Path ≫ net ⇒ it is oscillating or sliding. Path ≈ net ≈ small ⇒ it is being *slowed* (`speedMul` / `terrainSpeedMultiplier`).

**3. Run ≥3 times at `--workers=1`.** s1115 measured this failure as **intermittent** (3 of 4 runs left every structure pristine), so a single observation cannot tell a stable branch from a varying one. Report per-run, not averaged.

**4. Recommend, do NOT implement.** End with the one-paragraph engine change you would make and the file:line it belongs at. **Landing it is a separate, owner-visible task.**

### The four candidates (measure — do not confirm)

- **(A) `routedTarget()` ford-routing replaces the target** (`:1121-1151`). ⚠️ s1117 has **partially pre-disproved this and you should still check it, cheaply**: `riverSide(z)` returns `'north'` iff `z > RIVER_MAX_Z` (`:1375-1379`; `Terrain.ts:88-89` give the river as `z ∈ [-5,5]`). Both `(-38,32)` and `(-28,8)` are **north**, so the crossing branch at `:1140` needs `currentSide !== targetSide` and **cannot fire**. It survives only via `currentZone === 'ford'` (`:1129`) or `'river'` (`:1146`) — which is why scope 1 asks for `.zone`.
- **(B) `terrainAwareTarget()` returns a detour waypoint** (`:1153-1158` → `terrainDetourWaypoint`, `TileHeight.ts:258`), gated on `hasElevationTile()` (`TileHeight.ts:231`). `e3-canyon-works` is a canyon contract, so this is live if an elevation tile is loaded.
- **(C) 🔎 NAMED CANDIDATE — `resolveTerrain()`'s wall-slide picks the direction by world origin, not by goal. EXPLICITLY UNPROVEN; s1117 named it so you would MEASURE it, and the last two fires' named candidates were both WRONG.** At `:1237`, `northSouth = |goalZ| >= |goalX|`; here goal `(10,-24)` ⇒ **true** ⇒ the tangent is **pure-X** (`:1238-1239`). At `:1253` `terrainSlideSide = Math.sign(previous.x)` = `sign(-38)` = **−1**. So `:1256-1260` writes `nextPosition.x = previous.x − stepDistance` with **zero z progress** — it slides **WEST**, directly away from a target that is **EAST**, and it keeps sliding while `terrainSlideSide` stays non-zero (it only resets to 0 at `:1249`, when the lookahead is walkable). **`terrainSlideSide` is serialized at `:504`, so you can observe it directly.** ⚠️ UNPROVEN because s1117 did **not** measure that `Terrain.sample(ahead).walkable` is ever false on this path — if it is always walkable, `resolveTerrain` returns at `:1250` and **(C) is dead.** Report that sample either way.
- **(D) None of the above** — `moveTarget` equals `(-28,8)` at every sample and the loss is below it: the per-step `waterSpeed` (`Terrain.sample().speedMul`, `:1168`/`:1183`), `terrainSpeedMultiplier` (`TileHeight.ts:72`), `resolveBlocker`, or `resolveRiver`. **(D) is a fully acceptable answer** and scope 2 is what proves it.

## Firewall

Touch ONLY: a new `reviews/lane-cw-02-wrecker-movement-diagnosis.md` (your measurements + verdict), and optionally raw logs under `artifacts/cw-02-movement/`.

NO changes to: **any `src/` file in the final tree** · **any pre-existing `e2e/` file** · `e2e/cw-02-escort.spec.ts:134` or `:135` — **rewriting or re-anchoring either is forbidden**, that is writing the guard from the answer sheet · the test's own beacon coordinates at `:107-110` · `advanceSim(8)` (the budget hypothesis is DEAD — F-1114-3) · `Balance.enemy.speed`, the `setBalance` block at `:119-125`, or any sim semantics · other tasks' fresh work.

**Temporary instrumentation IS allowed** — a scratch probe spec and/or temporary logging inside `src/` — **but it MUST be reverted before you finish.** The acceptance test is mechanical: **`git diff --name-only main...HEAD` must list ZERO `src/` files and ZERO pre-existing `e2e/` files.** Delete scratch specs; restore touched `src/` files to byte-identity. Your predecessor did exactly this and its two-dot diff was clean — match that.

## Self-check (evidence, not vibes)

`npx tsc --noEmit` clean · `npm run build` green (say so plainly if it is vacuous for a docs-only final diff) · `npx playwright test e2e/cw-02-escort.spec.ts --project=desktop-chrome --workers=1 --repeat-each=3` run and reported **per-run** · the two-dot diff check above pasted verbatim into your report · measurements file written to the exact path in the Firewall.

If you find yourself about to exit without changes, **WRITE WHY into your report first** — a silent no-op wastes a queue slot and a gate.

**"I could not measure X because Y" is a SUCCESS. A confident guess is a FAILURE.** Two fires in a row named a candidate that measurement then killed, and that is exactly why the chain has made progress — do not protect (C).

End: READY-FOR-GATES + which of (A)/(B)/(C)/(D) fires, the transform-output table from scope 1, the path-vs-net numbers from scope 2, and the recommend-only paragraph from scope 4.
