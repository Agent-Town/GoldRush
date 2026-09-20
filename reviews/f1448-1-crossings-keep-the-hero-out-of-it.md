# Review — f1448-1 "an enemy-pathing fix must not move the hero" (and f1441-2, which it unblocks)

**Slices:** `f1448-1-crossings-keep-the-hero-out-of-it` + `f1441-2-crossings-keep-their-z`
**Branch:** `lane/e2-arsenal` (lane-c)
**Tip:** `4e2d9d0ea81a3b4d3e70390e7c645601cc48c9e5` over `a26454d4ce4a18ba71d334795d92a141e4a16c9c`
**Base:** `d2d88b2b60ea8a037703fed6d25456a01a56569d`
**Merge:** `42d0b2b1` (main)
**Gated by:** s1450 fire, 2026-08-04. Predecessor gate for f1441-2: `reviews/f1441-2-crossings-keep-their-z.md` (s1448).

## VERDICT: MERGED — both slices

f1448-1 **confirms** F-1448-2 and cures it. The blocking red F-1448-1 is **gone under a matched
control that this fire re-derived rather than inherited**, and f1441-2's own acceptance criterion is
**re-measured RED-on-main → GREEN-on-merged, both projects**, in a separate matched control.

Two slices land in one merge because the second exists solely to unblock the first; the lane tip
carries both and `main..lane/e2-arsenal` was exactly those two commits.

## What it does

**f1441-2** — Twin Banks enemies treated a crossing as an **x-band** (`Terrain.nearestFordRange(x)`
returns `minX..maxX`, no z), so an enemy anywhere in the band believed it could cross, wedged against
deep water and stalled. A crossing becomes a **place**: gravel bars authorise through the
rotated-ellipse `Terrain.gravelBarContains(bar, x, z)` (already present in `Terrain.ts`; widened to
`export` — a one-word diff, verified below as the *entire* `Terrain.ts` change). `goalSideCrossing`
picks the crossing nearest the **goal**, and a narrow `ACTIVE_TILE_ID === 'e1-twin-banks'` override
slides blocker-relative.

**f1448-1** — f1441-2 paid for that by hoisting `activeWaterDescriptor()`, `Terrain.fordRanges()` and
`Terrain.sample(...)` to **module scope** in `Enemy.ts`, so importing `Enemy.ts` forced `Terrain`
initialisation during boot and reordered module init. That reached the **hero** — a path enemy code
never touches — reddening `gt-05-water-depth.spec.ts:181`. The cure defers all three behind a cached
`crossingData()` getter (`Enemy.ts:1446`). Every measured win of f1441-2 is kept: `goalSideCrossing`,
the z-aware authorisation, the narrow override, the three re-pins.

## Evidence

All playwright runs `--workers=1` (§3.1). Port 5188 was free and **no lane run was live** (all six
queues empty, no `codex exec` process) — verified before gating, per Mistake #12.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` (merged tree) | **clean** |
| `npm run build` | **green, 1.32 s** |
| `node --test scripts/gr-sim.test.mjs` | **9 pass / 0 fail** (70.0 s) |
| `npm run test:node-guards` | **PASS, exit 0** |
| Matched 6-spec battery — **clean main** | **8 reds**, 284.6 s |
| Matched 6-spec battery — **merged tree** | **8 reds, identical by name**, 362.0 s |
| `e1-twin-banks.spec.ts` (matched, alone) — **clean main** | **4 reds** (`:103` ×2, `:122` ×2) |
| `e1-twin-banks.spec.ts` (matched, alone) — **merged tree** | **2 reds** (`:103` ×2) |
| `never-trap.spec.ts` (F-BW-10 witness) | **8/8 green, both projects** |
| `twin-banks-never-wedged.spec.ts` | **2/2 green, both projects** |
| Plain boot, no `?debug`, 1280×800 + 390×844, menu + Twin Banks | **0 console / 0 page errors, 4/4 boots** |

Instruments committed under `artifacts/f1448-1/` (RETENTION LAW — the tools, not a summary of the
numbers): `run-battery.mjs` (both arms run through one script so a flag cannot drift between them),
`plain-boot-probe.mjs`, `battery-merged.txt`.

### F-1448-1 is cured — the matched battery, both arms, this fire

Same 6 specs, same 58 tests, same `--workers=1`, same shell, same hour:

| Arm | reds | `gt-05-water-depth.spec.ts:181` |
|---|---|---|
| clean main (`6f3f4033`) | **8** | **GREEN** |
| merged tree (`42d0b2b1`) | **8** | **GREEN** |

The eight are identical **by name** on both arms — `064-river-continues.spec.ts:104` and
`e1-night-shift.spec.ts:{271,372,435}`, each on both projects. s1448 measured the pre-cure lane at
**9** with `gt-05:181` red; the cure removes exactly that one and adds none.

⓵ **The runner's reported "later unrelated Dry Gulch GLTF blob-texture red" did not reproduce on
either arm of this fire.** The handoff asked that it be verified rather than accepted; it is
environmental, and it is absent here.

### f1441-2's acceptance, re-derived independently

`e2e/e1-twin-banks.spec.ts:213` (`expect(track?.deepSamples).toBe(0)`), reached from `:122`
*"routes enemies through both west and east fords"*:

- **clean main: RED on desktop AND mobile** · **merged tree: GREEN on desktop AND mobile**

⚠️ **This needed a second, separately matched control, and the first attempt at it was wrong.**
The merged arm was first run as a 3-spec bundle and showed a red at `:175` *"seeded Twin Banks
diagnostics are stable"* [mobile] that the clean-main control (which had run the spec **alone**) did
not have. That looked exactly like a new merge-caused regression of the F-1448-1 shape. It was a
**composition artifact of my own bundle**: re-run alone, matching the control's composition
byte-for-byte, `:175` is **GREEN** on the merged tree. `:103` is red on **both** arms and is
pre-existing. *The lesson f1441-2 was withheld for is the same one that nearly cost it a second
fire — a red is not evidence until the arms match, and "the control" must match in composition, not
merely in flag.*

### The gr-sim re-pins — exactly three, verified by diff

`git diff 6f3f4033 HEAD -- scripts/gr-sim.test.mjs` is **exactly** the three pins the review
promised, all inside the single test *'Twin Banks consumes its declared crossings and build zones
before securing'*: CLI `eventLogHash bdd90123 → 80c5cae4`, headless `kills 176 → 202`, headless
`eventLogHash d5895547 → 5aeceb84`. **No fourth pin moved**, and gr-sim is 9/9 — so the Claim, Night
Shift and Baron maps still hash to their original values. This is the condition F-1441-3 demanded.

### Merge classification

Base `d2d88b2b`. `git diff --stat d2d88b2b main -- <the four lane-touched code paths>` is **empty** —
main moved **none** of `src/entities/Enemy.ts`, `src/world/Terrain.ts`, `scripts/gr-sim.test.mjs`,
`e2e/twin-banks-never-wedged.spec.ts`. All **LANE-TOUCHED only**; `ort` applied with no conflicts.
`e2e/twin-banks-never-wedged.spec.ts` is a pure add. The remaining 30-odd paths are regenerated
`artifacts/**` evidence and `reviews/shots-f1448-1/`.

`src/world/Terrain.ts`'s whole diff is `function gravelBarContains` → `export function
gravelBarContains` — read, not assumed.

## Findings

### F-1450-1 — 🟢 main's committed `gt-05` determinism artifacts were stale, and neither slice moved them

While control-running clean main, `artifacts/gt-05/classic-claim-hash.json` and
`determinism-report.json` regenerated to `5014dda3…` / `1dd35163…` against committed values of
`500ebbc8…` / `34a29969…`. Those regenerated values are **byte-identical to the ones the lane
committed**, and after the merge both files are unmodified by a further run. So the committed
artifacts on main were simply older than the tree that produced them; **this slice does not move
these hashes**, and determinism itself holds (`first === second` in every run). Non-blocking, and
worth stating because a future fire diffing those files against main would otherwise suspect the
merge.

### F-1450-2 — 🟡 `crossingData()`'s cache is process-lifetime and is never invalidated on a contract change

`cachedCrossingData` is a module-level `let`, populated on first use and never cleared. On a **full
page navigation** the module re-imports and the cache resets, which is why every gate here is green.
But if a contract is ever switched **without** a reload, the cache keeps the previous map's gravel
bars, crossings and crossing speed.

⚠️ **This is not a regression** — the pre-cure code was module-scope `const`, i.e. equally frozen for
the module's lifetime, and f1448-1 is if anything *less* exposed (first use happens after contract
selection rather than at import). It is recorded because the cure changes *when* the value is
captured, which is the kind of difference that reads as harmless until a soft contract switch exists.
A one-line `resetCrossingData()` called from the same place that swaps `ACTIVE_CONTRACT` would close
it. Non-blocking; no soft-switch path exists today.

### F-1448-3 / F-1448-4 / F-1448-5 — 🟢 carried forward, unfixed and still accurate

The cure was scoped to F-1448-2 and deliberately did not take the optional items. Re-read against the
merged code, all three still hold: `crossingData().speed` still falls back to sampling **x = 0** on a
fordless map (F-1448-3); `goalSideCrossing` still prefers `Terrain.fordRanges()` whenever non-empty,
so on a map with **both** fords and gravel bars the bars can never be chosen (F-1448-4); the two
`blockerSlideDirection` calls are still computed unconditionally (F-1448-5). All non-blocking.

## What the player sees, in a plain boot (Mistake #10)

Twin Banks enemies stop wedging against deep water and route through the crossings — the census
behind the re-pin is stalls **42 → 0**, enemies reaching **28/70 → 70/70**, kills **176 → 202**.
The hero is unaffected, which is the entire point of f1448-1. Probed with no `?debug` at 1280×800 and
390×844 on both the menu and the Twin Banks map: `reviews/shots-f1448-1/s1450-*.png`.
