---
source: codex
project: Gold Rush
date: 2026-07-27
type: reference
---

# CW-02 wall-slide latch blast radius

## Verdict

**The latch reaches ordinary contract enemies; it is not confined to the CW-02 synthetic wrecker.** In a regular Hill Mine roster run, 8 of 29 Rail Toughs met the mandated latch definition, 3 of those events had an elevation-blocked slide probe, and 1 elevation-blocked Rail Tough was still latched at the end. The no-elevation Dry Gulch control was clean (0/30), and a no-debug Claim boot through real wave 2 was also clean (0/31).

The Canyon run exposed a second live hazard rather than the hypothesized cliff case: 9 of 38 Night Runners spawned inside `canyon-works:sub-hall-dynamo-house` at z = -56 and remained latched there. That is a landmark/spawn overlap, not an elevation tile.

The strict bounds/elevation split also corrects the inherited CW-02 interpretation. The stuck wrecker at `(-47.997672, 26.215056)` is **inside** the `[-48,48]` x-bound and its current tile is walkable bank. Its blocked 0.6-unit goal lookahead `(-47.554099, 25.811023)` is also inside bounds but non-traversable elevation. `zone:'out'` alone cannot distinguish the two branches because `Terrain.sample()` returns it for both out-of-bounds (`src/world/Terrain.ts:165-168`) and elevation-blocked (`:169`).

## Method

Temporary instrumentation reused `Enemy.captureSuspend()` and recorded every fixed simulation tick:

- enemy `id` and kind;
- `(x,z)`, `terrainSlideSide`, current `Terrain.sample()` zone/walkability;
- live-target state;
- the 0.6-unit goal lookahead;
- the current 0.4-unit latched-side probe;
- strict bounds, elevation traversability, and authored-landmark classification for every point.

An enemy was LATCHED exactly when `terrainSlideSide !== 0`, trailing 2.0-second net displacement was `< 0.1`, and the enemy was alive with a live target. Spawn counts are observed alive-lifetime transitions, so a recycled pool slot would count as a new spawn.

The three debug scenarios used the real roster and `WaveSystem` geometry with combat damage suppressed so enemy lifetimes remained observable. `startWaveForTest(N)` only established the starting wave; the run then advanced normally for 60 simulated seconds and crossed into the next scheduled wave. The plain control loaded exactly `/?contract=the-claim`, used no debug or harness query flags, dismissed the briefing, selected Patent Office choices as they appeared, and ran to real wave 2.

The temporary probe and scratch spec were removed after the final passing measurement.

## Per-scenario counts

| Scenario | Elevation | End observation | Spawned | Ever latched | Still latched | Out-of-bounds blocked probe | Elevation-blocked probe | Other |
|---|---:|---|---:|---:|---:|---:|---:|---|
| Canyon Works CW-02 fixture | yes | 8.80 s, wave 0 | 2 | 1 | 1 | 0 | 1 | 0 |
| Canyon Works regular roster from wave 4 | yes | 60.50 s, wave 5 | 38 | 9 | 9 | 0 | 0 | 9 landmark |
| Hill Mine regular roster from wave 1 | yes | 60.57 s, wave 2 | 29 | 8 | 1 | 0 | 3 ever / 1 still | 1 landmark + 4 clear at first latch |
| Dry Gulch regular roster from wave 1 | **no** | 60.97 s, wave 2 | 30 | 0 | 0 | 0 | 0 | 0 |
| The Claim, plain no-debug boot | **no** | 60.17 s, real wave 2 | 31 | 0 | 0 | 0 | 0 | 0 |

**Headline split:** strict out-of-bounds blocked probes were **0 ever / 0 still**. Elevation-blocked probes were **4 ever / 2 still** (the CW-02 wrecker plus three Hill Mine Rail Toughs ever; the wrecker and one Rail Tough still). The elevation hypothesis therefore survives, but its measured normal-contract reach is Hill Mine—not every detected Canyon stall.

## Per-enemy latch evidence

### CW-02 fixture

| id | kind | first latched | stuck `(x,z)` | trailing displacement | point classification | blocked probe classification | end |
|---:|---|---:|---:|---:|---|---|---|
| 0 | wrecker | 5.467 s | `(-47.997672, 26.215056)` | 0.017980 | walkable bank; inside bounds; not elevation | 0.6 lookahead and 0.4 side probe: elevation-blocked, inside bounds | still latched; final displacement 0 |

The fixture observed 2 total spawns because one ordinary trickle enemy also appeared during the 8-second window; only the requested wrecker latched.

### Canyon Works regular roster

All nine entries were `night_runner`, had exactly zero trailing displacement, remained latched at 60.50 seconds, and were inside the `canyon-works:sub-hall-dynamo-house` blocker. That authored blocker is centered at `(0,-54)` with a `5.616 × 3.6` footprint (`assets/pilots/map-rebuild-spike/landmark-collision-contract.json:385-401`); `Terrain.sample()` applies the collision pad at `src/world/Terrain.ts:170-173`.

| id | stuck `(x,z)` | side | position | 0.6 lookahead | 0.4 side probe |
|---:|---:|---:|---|---|---|
| 15 | `(-2.082139, -56)` | -1 | landmark-blocked | same landmark | same landmark |
| 16 | `(-1.033866, -56)` | -1 | landmark-blocked | same landmark | same landmark |
| 17 | `(0.543666, -56)` | +1 | landmark-blocked | same landmark | same landmark |
| 18 | `(2.088842, -56)` | +1 | landmark-blocked | same landmark | same landmark |
| 19 | `(2.350735, -56)` | +1 | landmark-blocked | same landmark | same landmark |
| 20 | `(-1.350521, -56)` | -1 | landmark-blocked | same landmark | same landmark |
| 21 | `(-0.979373, -56)` | -1 | landmark-blocked | same landmark | same landmark |
| 22 | `(0.061312, -56)` | +1 | landmark-blocked | same landmark | same landmark |
| 23 | `(2.996585, -56)` | +1 | landmark-blocked | same landmark | side probe clear, but current point/lookahead remain inside |

### Hill Mine regular roster

All eight entries were `rail_tough`. Every stuck coordinate itself remained walkable bank and inside bounds.

| id | first latched | stuck `(x,z)` | displacement | blocked classification at first latch | end |
|---:|---:|---:|---:|---|---|
| 0 | 24.567 s | `(-4.361585, 11.608110)` | 0.062155 | current/lookahead/side probe clear | recovered |
| 1 | 26.700 s | `(-4.320436, 12.425392)` | 0.070243 | lookahead in `hill-mine:boiler-house-site` | recovered |
| 3 | 31.633 s | `(-4.337513, 12.447260)` | 0.013579 | current/lookahead/side probe clear | recovered |
| 2 | 33.467 s | `(0.366552, 16.426288)` | 0.026607 | side probe elevation-blocked | recovered |
| 5 | 38.467 s | `(-4.309327, 12.503865)` | 0.024517 | current/lookahead/side probe clear | recovered |
| 4 | 42.533 s | `(0.623273, 16.408194)` | 0.095374 | side probe elevation-blocked | recovered |
| 11 | 53.767 s | `(0.695036, 16.362826)` | 0.075842 | side probe elevation-blocked | **still latched** at `(0.393123,16.390429)`, displacement 0.086443 |
| 17 | 55.967 s | `(-4.381140, 12.354840)` | 0.040713 | current/lookahead/side probe clear | recovered |

The four “clear at first latch” rows are detector-true stale-side stalls, but the sampled probe does not attribute them to bounds, elevation, or a landmark. They are reported rather than reclassified by inference.

## What the player sees

- **The Claim, actual plain boot:** nothing abnormal through real wave 2. Thirty-one enemies spawned, none latched, the run remained `playing`, and normal waves advanced.
- **Dry Gulch negative control:** no latch in 30 enemies. Because the contract has no elevation tile, this is the required control that `Terrain.ts:169` cannot trigger.
- **Hill Mine:** Rail Toughs can stop at the first terrace/cliff lip around z ≈ 16.4 with a live hero target. Most measured stalls recovered, but one remained frozen at the end. This is the player-reachable elevation case.
- **Canyon Works regular waves:** Night Runners can remain frozen at the extreme south edge inside the Sub-Hall Dynamo House instead of reaching the player. This is a separate spawn/landmark overlap caught by the same latch detector.
- **CW-02 escort fixture:** the wrecker remains frozen and never reaches the pylon, so the player receives less sabotage pressure; the tram is not blocked by the enemy.

Wave progression does **not** wait for enemies to arrive or die: `WaveSystem` advances and emits `wave_started` while spawning scheduled pulses (`src/systems/WaveSystem.ts:428-472`), and `RunManager` secures from the reached wave (`src/game/RunManager.ts:265-289`). Ordinary latched enemies therefore do not directly deadlock victory. They can make the game easier by removing attackers, and accumulated stuck enemies consume the 60-enemy alive cap (`src/systems/WaveSystem.ts:478-489`, `src/game/Balance.ts:93`), potentially suppressing later spawns. The 60-second measurement did not run long enough to claim that cap consequence occurred.

For Canyon Works specifically, CONNECT completion and the boss gate still govern auto-secure; frozen ordinary enemies do not satisfy or block those objectives. A frozen wrecker cannot damage a pylon, so it removes one intended route to a brown-out rather than blocking the escort timer or tram route.

## Recommendation — do not implement here

Change **both** origin-derived assignments at `src/entities/Enemy.ts:1252-1264`. Choose the initial tangent side from walkable goal-relative probes (prefer the side that remains traversable and reduces distance to `moveTarget`) rather than `Math.sign(previous.x|z)`.

That is necessary but not sufficient. Add an unstick condition in the same `resolveTerrain()` owner: while `terrainSlideSide !== 0`, if trailing movement remains below a small threshold for bounded ticks, clear/re-evaluate or flip the side. The current reset only occurs when the goal lookahead becomes walkable (`src/entities/Enemy.ts:1243-1253`); retaining the side indefinitely is the amplifier identified by F-1118-2.

The Canyon south-spawn overlap also needs a separate owner-gated follow-up at the spawn/landmark seam; changing slide-side selection alone cannot guarantee depenetration from an authored solid.

## Verification

Measurement command:

```text
npx tsc --noEmit &&
npx playwright test e2e/_cw-latch-probe.spec.ts --project=desktop-chrome --workers=1 --trace=off
```

Final instrumented result: **1 passed in 1.4 minutes**. The temporary probe and scratch spec were then removed.

Final clean-tree gates are recorded after removal:

- `npx tsc --noEmit`: **green**.
- `npm run build`: **green**; vacuous for the final Markdown-only diff.
- `git diff --check`: **green**.
- `e2e/cw-02-escort.spec.ts`: expected pre-existing red remains at unchanged line 134; no assertion or sim budget was changed.

Exact requested branch-diff output:

```text
$ git diff --name-only main...HEAD
```

There was no output: zero `src/` files and zero pre-existing `e2e/` files differ in the branch range. Before runner auto-commit, the complete worktree inventory was:

```text
$ git status --short
?? reviews/lane-cw-02-slide-latch-blast-radius.md
```

READY-FOR-GATES
