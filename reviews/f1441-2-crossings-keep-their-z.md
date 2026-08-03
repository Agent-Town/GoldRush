# Review — f1441-2 "a crossing is a place, not an x-band"

**Slice:** `f1441-2-crossings-keep-their-z`
**Branch:** `lane/e2-arsenal` (lane-c)
**Tip:** `5c27a1b5cedfe3ff64ba0bb3b5c130f8d4f4d44b` — `runner(lane-c): f1441-2-crossings-keep-their-z.md`
**Base:** `b3d24dd804046370cc3196c09e54181a4459d28c`
**Gated by:** s1448 fire, 2026-08-04, detached worktree `gate-s1448` (§3.0b — removed after; nothing undecided ever entered main's working tree)

## VERDICT: HOLD — NOT MERGED

> ⚠️ **SUPERSEDED s1454 (F-1454-1) — THIS VERDICT LINE IS STALE AND WAS ONLY EVER TRUE FOR ~2 HOURS.**
> The slice **MERGED at `65e3aaec`** ("merge(lane-c): f1441-2 crossings-keep-their-z + f1448-1
> hero-crossing cure"), verified by ancestry (`git merge-base --is-ancestor 65e3aaec main` rc=0), and
> its goal leaf `f1441-2-crossings-keep-their-z` carries `mergeHash 65e3aaec16`. The one owed item —
> **F-1448-1** — was cured by the successor slice `f1448-1-crossings-keep-the-hero-out-of-it`, whose
> review records `VERDICT: MERGED — both slices` and holds the merged-tree evidence.
> ➡️ **Read `reviews/f1448-1-crossings-keep-the-hero-out-of-it.md` for the shipped verdict.** The
> HOLD text below is KEPT deliberately (retention law: supersede, never delete) because it is the
> record of *why* the first attempt was withheld — but a fire that reads only line 9 will conclude
> this slice is unmerged and owed work, which is the Mistake #8 shape (re-queueing shipped work).
> ⓘ **The general hazard, worth carrying:** a HOLD verdict has no enforcement surface, and nothing
> retires it when the hold is satisfied by a *different* file — the successor review records the
> merge, and this one is never revisited.

The slice **does what it was asked to do**, and its acceptance criterion is met and independently
re-measured. It is withheld on **one merge-caused regression that the red inventory would have
exonerated** (F-1448-1), found only by a matched control run.

⚠️ **This is not a rejection of the approach.** Scopes 1–6 are satisfied; the change is small,
well-aimed and demonstrably fixes the thing it targeted. What is owed is an explanation (or a cure)
for one reproducible red in a suite named for the invariant this diff edits.

## What it does

Twin Banks enemies treated a crossing as an **x-band**: `Terrain.nearestFordRange(x)` returns
`minX..maxX` with no z component, so an enemy anywhere in that band believed it could cross, wedged
against deep water, and stalled. The slice makes a crossing **a place**: gravel bars are authorised
through the rotated-ellipse containment check `Terrain.gravelBarContains(bar, x, z)` — which already
existed in `Terrain.ts` and is here merely widened to `export` (a one-word diff, no behaviour change).
Fords remain deliberately z-spanning.

Three further pieces: `goalSideCrossing(targetX, currentX)` picks the crossing nearest the **goal**
(tie-broken by proximity to the enemy) rather than the nearest one full stop; `resolveRiver` now takes
`moveTarget` so its slide bias aims at the goal-side crossing; and a **narrow `ACTIVE_TILE_ID ===
'e1-twin-banks'` override** in `resolveBlocker` slides blocker-relative when the goal lies inside the
blocker's footprint span.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` (merged tree) | **clean** |
| `npm run build` | **green, 984 ms** |
| `node --test scripts/gr-sim.test.mjs` | **9 pass / 0 fail** (9 tests, 58.0 s) |
| `e1-twin-banks.spec.ts` acceptance `:213` `deepSamples === 0` | **GREEN desktop + mobile** — and **RED on main** in the control |
| `never-trap.spec.ts` (F-BW-10 witness) | **8/8 green, both projects** |
| `twin-banks-never-wedged.spec.ts` (restored) | **green, both projects** |
| `task-025-bandits-dont-swim.spec.ts` | **all green, both projects** |
| Adjacent battery (6 specs, 58 tests), merged | 48 pass / 1 skip / **9 fail** — twice, identical |
| Adjacent battery (6 specs, 58 tests), **clean main** | 49 pass / 1 skip / **8 fail** |

All playwright runs `--workers=1` (§3.1).

### The acceptance criterion, and why it is not an accident

`e2e/e1-twin-banks.spec.ts:213` is `expect(track?.deepSamples).toBe(0)`, reached from the test at
`:122` (*"routes enemies through both west and east fords"*). That test is **RED on clean main on both
projects** and **GREEN on the merged tree on both projects**. The master called this "a criterion the
predecessor could not have met by accident"; the control confirms the direction.

### The gr-sim re-pins (F-1441-3) — reasons, as owed

Three pins moved, **all three inside the single test** `'Twin Banks consumes its declared crossings and
build zones before securing'`:

| Pin | Before | After |
|---|---|---|
| CLI `eventLogHash` | `fnv1a32:bdd90123` | `fnv1a32:80c5cae4` |
| headless `kills` | `176` | `202` |
| headless `eventLogHash` | `fnv1a32:d5895547` | `fnv1a32:5aeceb84` |

**The reason is measured, not asserted, and the measurement is that the OTHER pins did not move.**
The archive predecessor `9236e9ba` took gr-sim to 5/9 by moving **four** maps — the Claim, Twin Banks,
Night Shift and Baron — and the master ruled the other three moving is "the bug, not a baseline to
re-pin". Here the Claim / Night Shift / Baron pins are **untouched in the diff** and gr-sim is **9/9**,
i.e. those three maps still hash to their original values. The change is Twin-Banks-local, which is
exactly what scope 4 demanded.

`kills 176 → 202` is a behaviour change and is explained by the runner's census (stalls 42 → 0,
enemies reached 28/70 → 70/70): formerly wedged enemies now reach combat and die. The direction is
right — more enemies reaching can only add kills — and the magnitude (+26) sits inside the +42 that
began reaching. Independently witnessed by the restored `twin-banks-never-wedged.spec.ts` going green.

### F-BW-10 witness — VERIFIED SAFE by reading both trees

`blockerSlideDirection` is **byte-identical** between `main` (`src/entities/Enemy.ts:1371`) and the
lane tip (`:1398`), still returning `Math.sign(moveTarget[axis] - this.group.position[axis])` —
**enemy-relative**. The archive's blocker-relative form was **not** restored. The slice instead adds a
narrow caller-side override scoped to `ACTIVE_TILE_ID === 'e1-twin-banks'`, falling through to main's
version on every other map. This is what s1446's F-1446-3 refresh was designed to produce, and
`never-trap.spec.ts` is green as the witness.

### Merge classification

Base `b3d24dd8`. `git diff --name-only b3d24dd8..main` intersected with the slice's four paths is
**empty** — main moved none of them. All four are **LANE-TOUCHED only**; the merge applied by `ort`
with no conflicts. `e2e/twin-banks-never-wedged.spec.ts` is a **pure add** (restored from the archive).

## Findings

### F-1448-1 — 🔺 BLOCKING: the merge reproducibly reds `gt-05-water-depth.spec.ts:181`, and the red inventory calls it exonerated

`[mobile-chrome] e2e/gt-05-water-depth.spec.ts:181 "deep water blocks hero and enemy through the
shared resolver"` fails on the merged tree and passes on clean main, under an **identical** battery
(same 6 spec files, same 58 tests, same `--workers=1`, same shell, same hour):

- merged tree, run 1 → **RED** · merged tree, run 2 → **RED** · clean main → **GREEN**
- also GREEN on main in the wider 8-spec control (76 tests) run earlier the same fire

The assertion is `e2e/gt-05-water-depth.spec.ts:209`:
`expect(heroSample.sample).toMatchObject({ zone: 'ford', waterClass: 'wade' })`, received
`{ zone: 'bank' }` — the **hero** ends a 700 ms `KeyD`+`ArrowDown` slide on the bank instead of
reaching the ford.

⚠️ **Why this finding exists at all is the reusable half.** `scripts/red-inventory-lookup.mjs` (shipped
last fire) answers **KNOWN-RED** for this exact spec and title, recorded **MOBILE-ONLY** — which is
precisely the shape observed, and a fire that stopped at the inventory would have merged. **The
matched control says main is green here.** This is F-1444-2's hazard — inventory membership read as
exoneration — landing on the very next drain after the lookup tool shipped. The tool is not at fault;
it fails safe and says only what it recorded. **The control run is what decides a merge.**

Note also that the test passes **in isolation** on the merged tree (5 pass / 1 skip, 39 s). It is
load-sensitive *and* merge-caused: both are true, and the second is the one that blocks.

### F-1448-2 — 🟡 the prime suspect: `Enemy.ts` now does module-load-time terrain work

The slice moves three computations to **module scope**, where previously only
`activeTileDescriptor().id` ran:

```ts
const GRAVEL_BAR_CROSSINGS = activeWaterDescriptor()?.gravelBars ?? [];
const RIVER_CROSSINGS = [...Terrain.fordRanges(), ...];
const CROSSING_SPEED = Terrain.sample(Terrain.fordRanges()[0]?.centerX ?? 0, (Terrain.RIVER_MIN_Z + Terrain.RIVER_MAX_Z) / 2).speedMul;
```

`Terrain.sample()` and `Terrain.fordRanges()` at import time make `Enemy.ts` force `Terrain`
initialisation during boot. **This is the only mechanism in the diff that can reach the hero at all** —
hero movement never enters `ClaimJumperEnemy` — so it is the first thing to test against F-1448-1.
Whether it is the cause is **UNVERIFIED**; it is a hypothesis with a mechanism, not a conclusion.

### F-1448-3 — 🟢 `CROSSING_SPEED`'s fallback has no principled meaning on a fordless map

`Terrain.fordRanges()[0]?.centerX ?? 0` samples **x = 0 at river centre** when a map has no fords —
an arbitrary point, not a crossing. It feeds the `waterSample.speedMul || (...)` fallback that governs
whether an enemy standing on a gravel bar moves at all; if that sample ever returned `0`, enemies
would freeze **on** the bar. It happens to be non-zero on Twin Banks (the census shows 70/70 reaching),
so this is latent, not live. Non-blocking.

### F-1448-4 — 🟢 `RIVER_CROSSINGS` is never used as the union it is built as

`goalSideCrossing` selects `Terrain.fordRanges()` whenever that array is non-empty and only falls back
to `RIVER_CROSSINGS` otherwise — and in that branch `RIVER_CROSSINGS` *is* just the gravel bars, since
the fords it spreads in are empty. So on any map with **both** fords and gravel bars, the bars can
never be chosen as a crossing target. Harmless today (Twin Banks has no fords in the relevant path);
worth stating before a future map has both. Non-blocking.

### F-1448-5 — 🟢 two `blockerSlideDirection` calls are computed unconditionally

`targetSlideX` / `targetSlideZ` are evaluated on every blocker resolution even when the twin-banks
override discards them. Trivial; noted only so it is not mistaken for intent later.

## What is owed before this merges

> ✅ **DISCHARGED s1450, recorded s1454 (F-1454-1).** All three items below were satisfied by
> `f1448-1-crossings-keep-the-hero-out-of-it` and merged together in `65e3aaec`. Item 3 in particular
> was honoured: the successor's review carries the matched 6-spec battery on both arms
> (clean main 4 reds → merged tree 2 reds, the survivors pre-existing on both). **Nothing is owed.**

1. Explain or cure **F-1448-1** — the `gt-05:181` red is reproducible (2/2) and absent on main (0/2).
   Test **F-1448-2** first: it is the only mechanism in the diff that can move the hero.
2. If the cause is module-load ordering, hoisting the three constants behind a lazy getter is the
   obvious shape and keeps every measured win above intact.
3. Re-run the same 6-spec battery on both arms and show the counts match.

**Nothing else is owed.** tsc, build, gr-sim 9/9, the acceptance criterion, the F-BW-10 witness, the
restored never-wedged spec and the eight pre-existing reds are all settled and re-measured this fire.
