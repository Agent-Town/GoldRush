# The Baron, re-ridden — F-2290-2's single measurement

**Fire:** s2291 · **Date:** 2026-08-25 · **Engine:** `d020e5b46` · **Contract:** `e1-baron` · **Seed:** `e1-baron-01` (the first pinned bench seed, `assets/contracts/bench-seeds.json`)

## What was asked

F-2290-2 (s2290, `abf6b7464`) priced the Baron owner fork and named ONE cheap measurement as owed before the owner rules:

> re-ride `codex-sol-r1-player.mjs` at the current engine and door, first bench seed

with one caveat it flagged **UNMEASURED**: the plan builds **palisades**, the affordance AP-16 equalized away — and *"if it was not [in the buildable set], the strategy is unavailable and the fork's pricing stands unchanged."*

Both questions are now measured. **This document prices the fork. It does not rule on it.**

## Headline

**The Baron re-secures on today's engine and door.** `secured: true`, wave 22, riding the retained Aug-13 player **byte-identically** (10,055 bytes, `sha256` of the copy equal to the tracked file — the strategy was not edited, only relocated; see *Reconstruction* below).

## Result table — every gameplay field reproduces the Aug-13 report exactly

| field | Aug-13 `codex-sol-r1-outcome.json` | s2291 ride 1 | s2291 ride 2 (control) |
|---|---|---|---|
| `secured` | true | **true** | **true** |
| `waves` | 22 | **22** | **22** |
| `timeMs` | 596967 | **596967** | **596967** |
| `gold` | 319 | **319** | **319** |
| `kills` | 985 | **985** | **985** |
| `calls` | 3294 | **3294** | **3294** |
| `defaultedPicks` | 0 | **0** | **0** |
| `defaultedSecure` | 0 | **0** | **0** |
| `eventLogHash` | `fnv1a32:f5365f4c` | `fnv1a32:620e7876` | `fnv1a32:620e7876` |

Eight of nine fields are identical across a twelve-day engine gap. One moved.

## The palisade caveat — RESOLVED, in the direction that keeps the strategy viable

Measured two independent ways:

1. **By code.** `src/agent/MechanicsManifest.ts:693` puts `palisade` in `registryBuildables` **unconditionally** — the only filter on that list is `!twist.powerGrid || id !== 'turret'`, which concerns turrets alone. Palisade is in the manifest-derived buildable set for every contract, `e1-baron` included.
2. **By the run.** From `ride1-transcript.jsonl.gz`: **3 palisades built, first appearing at wave 19**, exactly as the plan specifies (`desiredPalisades = view.now.wave >= 19 ? 3 : 0`). Final works `{sentry_beacon:6, palisade:3, sluice:3, stockpile:2, turret:4}` — the plan executed in full.

The palisade is a **late decoy at wave ≥ 19**, not a foundational affordance. AP-16 did not take it away.

## Determinism control

Ride 2 is a second identical invocation. Outcomes are **identical on every field including the hash**. At tape level the two runs differ in **exactly one leaf**:

```
.id: "agent-c4ab1b1a-60f3d4e2-…" -> "agent-c4ab1b1a-6ba8b0b7-…"
```

a `randomUUID` run identity (`gr-sim.mjs:12`). `inputLog`, `runStart`, `simVersion`, `outcome` and `eventLogHash` are byte-identical. **The sim is fully deterministic today**; the only nondeterminism in a tape is its own id, by design.

## The one field that moved, stated without over-reach

`eventLogHash` is `agentOrdersEventLogHash(snapshotStandingOrders())` (`scripts/gr-sim.mjs:260`), which hashes only `orders_replaced` entries with `at`/`seq` stripped (`src/game/RunTape.ts:271`).

**Measured:** it is deterministic today at `620e7876` (two rides, plus tape-level identity), and differs from Aug-13's `f5365f4c` **while every gameplay observable is byte-identical**.

**Not measured, and deliberately not asserted:** *which* commit moved it. `src/agent/StandingOrders.ts` changed at least five times since Aug-13 — `a8f02a7a0` (F-2127-1, the secure-window cure, 180s → 4.4s) is the obvious candidate and is **a candidate only**. Pinning it is the job of `f2289-1-recorder-assayer-hash-divergence`, in flight in lane-a; this fire does not pre-empt it.

**What it means for the county, which is the part that matters:** the orders-log hash is **not stable across engine patches even when the run is bit-identical in outcome**. A hash-based proof of a run therefore identifies *a run on a given engine*, not *a run*. Any future use of it as a durable run identity needs an engine-version pin beside it.

## Reconstruction — how the retained player had to be ridden, and a defect found doing it

The player resolves its own directory (`ROOT = new URL('.', import.meta.url)`) and spawns `scripts/gr-sim.mjs` with `cwd: ROOT`. From its archive location `bench/gauntlet/heat3/` that fails in one second:

```
Error: ENOENT: no such file or directory, open
'…/bench/gauntlet/heat3/package-lock.json'
  at vite.config.ts.timestamp-….mjs:110
```

`vite.config.ts:25` reads `resolve(process.cwd(), 'package-lock.json')` — **cwd-relative**, and it has done so since `0dfa1d3f3` (2026-07-25), **19 days before the Aug-13 run**. So the original run cannot have executed from `heat3/` either: **it ran from the repo root**, and the retained file is an archived copy whose run conditions were never recorded.

The re-ride therefore placed a **byte-identical copy at the repo root** — verified equal, 10,055 bytes — which reconstructs the original conditions rather than adapting the strategy. No line of the strategy was modified. A first attempt via a `scripts` symlink inside `heat3/` was abandoned once the vite read dated the defect; it is recorded here because it is what dated it.

The player's own `--self-check` passes on the current engine.

## Bearing on F-2290-1 (the missing tape)

F-2290-1 found that the county's only claimed agent Baron secure retains **no replayable tape** — `run-6-tape.json` is in no commit. Two consequences of this ride:

1. **The Aug-13 report is corroborated.** Eight of nine outcome fields reproduce exactly from the retained player. That is strong independent evidence the run happened as described — which F-2290-1 already declined to doubt, and now need not.
2. **The gap is closed going forward.** `ride1-tape.json` (1.44 MB) is a retained, replayable tape for an agent Baron secure **at the current engine**, committed here. The county can now demonstrate the claim, not merely assert it.

## Files

| file | what |
|---|---|
| `ride1-tape.json` | the replayable tape — the artifact F-2290-1 found missing |
| `ride1-outcome.json` | ride 1 outcome |
| `ride2-control-outcome.json` | determinism control |
| `ride1-transcript.jsonl.gz` | full 3,295-turn transcript (5.8 MB raw) |

## What this does NOT do

It does not flip `e1-baron`'s admission, and it does not rule on the fork. s2290's instruction is respected verbatim: *"Do NOT flip the admission on it either way; that is the owner's fork, and this only prices it."*
