# Review — friendly-walls (own-palisade passability corrective)

**Slice:** lane-friendly-walls (LANE-D) · **Branch:** lane/perf @`072b35f2` · **Base:** `94e5ba4e` · **Merged to main:** `f82f7a99` (drain, s807)
**Verdict:** ✅ MERGE — clean additive corrective; full gate battery green; enemy-side collision provably unchanged.

## What it does
Restores the owner's intended feel — **player-built palisades no longer block the player's own side**. Owner directive, 2026-07-21 verbatim: *"I cannot walk through the palisades anymore - is that on purpose? It feels odd as that worked yesterday."* (a solidity re-land had over-swept `palisadeBlockers` into the hero's movement-blocker set).

Introduces a `heroBlockers()` helper in `src/game/Game.ts` returning `[...e6TileConsumers.blockers, ...Terrain.landmarkBlockers()]` — i.e. everything the hero/agent/family should collide with **except** their own palisades. It replaces the two inline blocker compositions:
- hero **depenetrate** site (was `palisadeBlockers + e6 + landmarks` → now `heroBlockers()`),
- `actorTerrainSample` walkability (dropped the palisade `blockerContains` gate).

Enemies are **unchanged**: their collision set stays `[...palisadeBlockers, ...heroBlockers()]` — palisades still block and route the Fever, which is their whole purpose. `blockerContains` import removed (now unused on the hero path).

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (built in 2.61s) |
| `friendly-walls.spec` desktop-chrome + mobile-chrome (390px) | 2/2 pass — hero crosses its own palisade line (z>9); enemy routes AROUND it (\|x\|>4.5, reaches z>11); **zero console/page errors both projects** |
| `landmark-collision` (desktop) | pass — authored footprints still stop the hero; enemy routing goes around a county landmark; town chapel/Pan Monument solid |
| `run3d-palisade` (desktop) | pass incl. **12-instance p95 within 115% frame budget** (no perf regression) |
| `task-023-victory-palisade` (desktop) | pass incl. rotated-palisade block + wrecker reach on rotated rectangle |
| `e6-tile-consumers` (desktop) | pass — decay fields + six-vein ring intact |
| `never-trap` (desktop) | pass — landmark/town-building centers still release movement; depenetration works (the READ-FIRST "must stay green" suite) |
| `perf-04-determinism` (desktop) | pass — **same-seed future-state / economy / entity-timeline hashes identical** (mp determinism unaffected) |

## Merge classification
Base `94e5ba4e`, 4 commits behind main at drain. Main's 4 newer commits touched only STATUS.md / docs / BACKLOG / task files — **disjoint from the lane's two files** (`src/game/Game.ts`, new `e2e/friendly-walls.spec.ts`). Clean 3-way `--no-commit` merge, no conflicts; committed path-scoped (code only; review + churn kept out).

## Findings
- **F-1 (non-blocking, no corrective):** master scope item 3 asked for **two** named helpers (`heroBlockers()` *and* `enemyBlockers()`); the implementation named only `heroBlockers()` and the enemy site composes `[...palisadeBlockers, ...heroBlockers()]` inline. The divergence-prevention intent is substantially met — the shared subset now has a single source of truth — but a named `enemyBlockers()` would fully close the scope. Optional future cleanup; no behavior risk.
- **Adjacent known-red (proven pre-existing):** `enemy-gap-flow.spec.ts` aborts at collection with `import.meta.glob is not a function` (`src/town/townLayout.ts:53`), reached via its top-level `import '../src/encyclopedia/registry'` → `TownScene`/`townsfolk` → `townLayout` (a Vite-only construct that fails in playwright's node-context spec collection). This changeset is exactly 2 files, **both disjoint from that import graph**; the spec + its transitive imports are byte-identical to main, so it collects/fails identically with or without this change. Not caused by the drain.

## Player-visibility (Mistake #10)
Player-visible in **plain boot**: build a palisade, walk into it — the hero/family now pass through. The collision logic is unconditional (not `?debug`-gated); the spec uses debug flags only to set up a deterministic placement+teleport harness.
