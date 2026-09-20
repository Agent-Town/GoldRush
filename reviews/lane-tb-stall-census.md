# lane-tb-stall-census — F-BW-14: the braid's bandits find their war

- **Slice:** `lane-tb-stall-census` (lane-c)
- **Branch / tip:** `lane/e2-arsenal` @ `9236e9baef8cb19bd594a675308efab1723730da`
- **Archived as:** `archive/lane-e2-arsenal-s1441-9236e9ba` (insurance, taken before any gating)
- **Merge-base:** `3aa4d123652cc601d3e645d8aac5ed6e9fa26360`
- **Gated by:** s1441 fire, detached worktree `worktrees/gate-s1441` (§3.0b), scratch port **5199**, every playwright `--workers=1` (§3.1)

## VERDICT: PARTIAL — census BANKED, the crossing fix WITHHELD

**Landed:** `scripts/twin-banks-stall-census.mjs` only (banked evidence, RETENTION LAW; not gate-wired).
**Withheld:** `src/entities/Enemy.ts` and `e2e/twin-banks-never-wedged.spec.ts`.

The slice **does** answer the owner's complaint — the stalls genuinely clear, and its own
never-wedged fuzz passes on both projects. But it clears them by letting enemies **walk through
deep water**, which violates the standing "bandits don't swim" law, and it changes the pinned sim
baseline on **four maps** when its firewall named one.

## What it does

Owner, gate walk 2026-08-03, verbatim: *"the opponents have a lot of trouble finding their way...
here are the stuck bandits... the bandits on this map also get stuck on spawn (right side)"*.

The runner built a browser-scripted stall census (`scripts/twin-banks-stall-census.mjs`, standalone —
its own vite server on port 5274, 63 seeded routes across bank-approach / crossing-choice /
right-spawn clusters) and then changed the shared enemy resolver: `Terrain.nearestFordRange()` is
replaced by a new `goalSideCrossing(targetX, currentX)` that picks the crossing on the **goal's**
side and commits to it, so enemies stop oscillating at the bank. Gravel bars join fords as
crossings. `resolveBlocker()` / `resolveRiver()` / `blockerSlideDirection()` each gain a
`moveTarget` argument so the slide direction is chosen toward the goal instead of an arbitrary
avoidance side.

The goal-side bias is a sound idea and the census method is good work.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` (merged tree) | **clean** |
| `npm run build` (merged tree) | **green, 990 ms** |
| `scripts/gr-sim.test.mjs` — merged | **5 pass / 4 FAIL** (reproduced twice, identical set) |
| `scripts/gr-sim.test.mjs` — CONTROL, clean main, same worktree | **9 pass / 0 fail** |
| `e2e/twin-banks-never-wedged.spec.ts` (slice's own spec) | **PASSED**, both projects |
| `e2e/task-025-bandits-dont-swim.spec.ts` | passed both projects (default map unaffected) |
| `e2e/e1-twin-banks.spec.ts` — merged | 4 failed (`:103`, `:122` × both projects) |
| `e2e/e1-twin-banks.spec.ts` — CONTROL, clean main | 4 failed, **same titles** |
| `npx tsc --noEmit` (main, census landed) | **clean** |

Control-arm main-equivalence proven both times by an **empty** `git status --porcelain -- src e2e scripts`
with `HEAD == main == 941ecb8d`. Same worktree, same server, same port.

## F-1441-2 — 🔺 THE FIX TRADES A STALL FOR A SWIM: 38 DEEP-WATER SAMPLES WHERE THE LAW DEMANDS 0

The four `e1-twin-banks` reds **match the red inventory by title on both arms**, which is exactly
how this nearly passed. They are not the same failure:

- **Clean main** fails at `e1-twin-banks.spec.ts:211` — `.toBe(true)`, *"Timeout 15000ms exceeded
  while waiting on the predicate"*. The enemies never arrive. **Line 213 never executes.**
- **Merged tree** *passes* `:211` — the enemies now arrive, which is the fix working — and then
  fails at `:213`, `expect(track?.deepSamples).toBe(0)`: **Expected 0, Received 38.**

An early assertion disabled everything after it, so the control run **could not** have surfaced
this. Title-matching alone (and even coordinate-matching, since the inventory's `:211` is two lines
off the assertion that actually failed) would have waved a canon violation into main.

**Root cause, read from the code, not inferred:**

1. `resolverCrossingAtX(x)` tests **x only** — `RIVER_CROSSINGS.some(c => x >= c.minX && x <= c.maxX)`.
2. Gravel bars are 2-D ellipses (`x`, `z`, `length`, `width`, `rotation`) but are collapsed at
   construction to an x-band `{minX, maxX, centerX, halfWidth}`. **The z extent is discarded.**
3. `riverBlocksEnemyAt(x, z)` and `riverBlocksEnemyCrossingAt(x)` both early-`return false` for any
   x in that band — so the **entire water column at that x, at every z**, becomes passable, not
   merely the bar itself.

**Fix direction (idiomatic, already in the tree):** `src/world/Terrain.ts:280` already has
`gravelBarContains(bar, x, z)` — the correct z-aware ellipse test — and `Terrain.ts:273` already
uses it. The resolver should ask that z-aware question instead of collapsing bars to an x-band.
Keep `goalSideCrossing`'s goal-side bias; it is not the defect.

## F-1441-3 — 🔺 FOUR MAPS' PINNED SIM BASELINES MOVE; THE FIREWALL NAMED ONE

`gr-sim` is **9/9 on clean main** and **5/9 merged**, reproduced twice with an identical failure set:

- `the Claim driver consumes declared water and posts RunManager secure at wave 10`
- `Twin Banks consumes its declared crossings and build zones before securing at wave 20`
  (`fnv1a32:d0854809` vs pinned `fnv1a32:bdd90123`)
- `gr-sim places Night Shift fixtures from the contract`
- `the Baron driver runs the declared fight and keeps medal writes off headless`

**Determinism itself is intact** — the four self-consistency tests (byte-for-byte replay, identical
hashes twice, deterministic Claim objective, escort boot) are green on both arms. What moved is the
**frozen baseline**, on four maps. The master's TOUCH-ONLY was the Twin Banks crossing choice;
`goalSideCrossing` and the `riverBlocks*` early-returns serve **every river map**. Twin Banks moving
is expected and arguably desired. The Claim, Night Shift and Baron moving is scope leakage, and the
runner did not re-pin or even report it.

## F-1441-1 — 🟡 NO GOAL LEAF; `drain-block-check` ANSWERED UNKNOWN

`node scripts/drain-block-check.mjs 20260803-181625-lane-tb-stall-census.md` → **UNKNOWN**, rc=0 by
default (not a clearance, §3.0). Registered by this drain. **Fifth consecutive fire** finding a
gate-walk-campaign master unregistered (F-1438-3 → F-1439-2 → F-1440-1 → F-1441-1).

## F-1441-4 — 🟢 the module-level-const worry is ANSWERED, not a defect

s1440's handoff asked whether `RIVER_CROSSINGS` / `CROSSING_SPEED`, computed from
`activeWaterDescriptor()` at **import time**, go stale on a runtime map change. Read at the code:
`src/world/Terrain.ts:78` already does `const ACTIVE_CONTRACT = activeContract()` and `:110`
`const FORD_RANGES = resolveFordRanges()` at module level. The whole terrain sim already snapshots
the contract at import; a map change requires a reload. The lane follows the **pre-existing** house
pattern and introduces no new hazard class. Worth noting only as a standing property: if a runtime
map swap ever lands, `Terrain.ts` is the primary casualty and `Enemy.ts` merely joins it.

## Merge classification

`git diff --stat 3aa4d123 main` over the three paths is **empty** — main never moved any of them
since the merge-base, so all three are **PURE LANE-TOUCHED** and no 3-way graft was needed. The two
other commits on `lane/e2-arsenal` (`ce12d8c9` gold-quantization, `39cfef9d` fort-solidity) touch
none of these paths and are already absorbed. Gate tree was built by checking the three paths out of
`9236e9ba`; all three blobs hash-verified **MATCH**, and the gate-tree-vs-main stat reproduced the
lane's own `Enemy.ts` hunk count exactly (89 changed / 57 insertions / 32 deletions).

Landed blob `scripts/twin-banks-stall-census.mjs` = `adff0acf9c55`, hash-verified against
`9236e9ba` after landing. ⚠️ It was **not executed on main** by this fire — it is banked as the
owner's F-BW-14 measurement, is referenced by no npm script or gate, and stays out of every battery.

## Corrective

`tasks/f1441-2-crossings-keep-their-z.md` — authored this fire for lane-c.
