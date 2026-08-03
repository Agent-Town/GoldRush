CODEX: model=gpt-5.6-sol effort=xhigh
# Task f1441-2-crossings-keep-their-z: a crossing is a place, not an x-band (lane-c, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1441, 2026-08-03. Corrective for **F-1441-2** and
**F-1441-3**, filed when `lane-tb-stall-census` was drained PARTIAL.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`
(branch `lane/e2-arsenal`).

**Your predecessor's work is not lost and you are not starting from zero.** The withheld commit is
`9236e9ba`, preserved as branch `archive/lane-e2-arsenal-s1441-9236e9ba`. Read it. Most of it is
right — you are fixing one specific thing in it and re-pinning what it moved.

## READ FIRST

- `AGENTS.md`
- `reviews/lane-tb-stall-census.md` — **the drain that filed this. Read it whole; it is short and it
  is the spec.** Findings F-1441-2 (the defect + the fix direction) and F-1441-3 (the baselines).
- `git show 9236e9ba` — the withheld change, in full. `goalSideCrossing`'s goal-side bias is SOUND
  and must survive; the x-band collapse is the defect.
- `src/world/Terrain.ts` — read `gravelBarContains` and its caller ~7 lines above it. **This is the
  correct test and it already exists.** Do not write a second one.
- `tasks/lane-tb-stall-census.md` — the original master (owner's F-BW-14 words, the firewall).
- `scripts/twin-banks-stall-census.mjs` — already on main (banked s1441). Your before/after tool.

## Pre-flight

**STOP pre-condition (hard — do not skip, do not "fix" it, report and exit if it fails).** Run these
three greps from the repo root of your worktree. Each must print exactly `1`:

```
grep -c "function gravelBarContains(bar: ContractGravelBar, x: number, z: number): boolean {" src/world/Terrain.ts
grep -c "const ACTIVE_CONTRACT = activeContract();" src/world/Terrain.ts
grep -c "  expect(track?.deepSamples).toBe(0);" e2e/e1-twin-banks.spec.ts
```

All three were verified to return `1` on main at authoring time (s1441). A `0` means your lane is
behind main and does not yet contain this task's subject — **STOP and report "lane stale at
dispatch", do not improvise.** (F-1424-3 / F-1425-2: each key was proven against the source file on
main before being written here, and each sits on one line, so a `0` really does mean the lane.)

**LANE-SAFETY (safe-dupe, runner-auto-commit aware):** the lane branch being ahead is NORMAL — the
runner auto-commits. For each ahead commit: if its content is already merged to main (verify with
`git log`/`git diff`, not from memory), it is a SAFE DUPE → reset to main and PROCEED. ⚠️ **`9236e9ba`
is the exception and it is EXPECTED:** its `src/entities/Enemy.ts` and
`e2e/twin-banks-never-wedged.spec.ts` are deliberately NOT on main (withheld s1441, F-1441-2) and are
preserved at `archive/lane-e2-arsenal-s1441-9236e9ba`. Resetting over it loses nothing. STOP-and-report
only if some OTHER ahead commit's content is not on main, or the worktree holds uncommitted edits you
did not make.

Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (F-1441-2, measured s1441 — not inferred)

The predecessor fixed the owner's stuck bandits. Its own never-wedged fuzz passed on both projects.
It shipped a canon violation doing it.

`e2e/e1-twin-banks.spec.ts` fails on clean main at `:211` — a predicate timeout, the enemies never
arrive — so **line 213 never runs**. With `9236e9ba` applied the enemies DO arrive, `:211` passes,
and `:213` then reads:

```
expect(track?.deepSamples).toBe(0)   →   Expected: 0   Received: 38
```

Thirty-eight deep-water samples. The bandits are swimming. An early assertion had been hiding the
deeper one, and the failure's TITLE matches a known red on both arms — only running the control and
reading the inner assertion line told them apart.

**Root cause, read from the code:**

1. `resolverCrossingAtX(x)` tests **x only**.
2. Gravel bars are 2-D ellipses (`x`, `z`, `length`, `width`, `rotation`) but are collapsed at
   construction into an x-band `{minX, maxX, centerX, halfWidth}` — **the z extent is thrown away.**
3. `riverBlocksEnemyAt(x, z)` and `riverBlocksEnemyCrossingAt(x)` early-`return false` for any x in
   that band, so the **whole water column at that x, at every z**, became passable — not just the bar.

## Scope

1. **A crossing keeps its z.** Make the resolver's "am I on a crossing?" question z-aware. Reuse
   `Terrain.gravelBarContains` (export it if needed) rather than writing a second containment test —
   fords are z-spanning by construction and bars are not, and that difference is the whole bug. The
   `RIVER_CROSSINGS` record may keep its x-band for *choosing* a crossing; it must not be what
   *authorises passage*.
2. **Keep `goalSideCrossing`.** The goal-side bias, the commit-to-one-crossing behaviour, and the
   `moveTarget` threading through `resolveBlocker`/`resolveRiver`/`blockerSlideDirection` are the
   good part of `9236e9ba` and are why the stalls clear. They are not the defect. Do not revert them.
3. **`e1-twin-banks` must reach `:213` and read `deepSamples === 0`.** Both projects. That is the
   acceptance criterion, and it is a criterion the predecessor could not have met by accident.
4. **Re-pin what genuinely moved, and only that (F-1441-3).** `scripts/gr-sim.test.mjs` is **9/9 on
   clean main** and went **5/9** under `9236e9ba`, on FOUR maps: the Claim, Twin Banks, Night Shift,
   Baron. Twin Banks moving is expected — you are changing its routing. **The other three moving is
   the bug, not a baseline to re-pin.** Fix z-awareness first, then re-measure: any map whose pinned
   hash still moves must be *explained in your report* before you re-pin it, and a map you cannot
   explain is a STOP, not a re-pin. Never re-pin a hash to make a red go away.
5. **Before/after census.** Run `scripts/twin-banks-stall-census.mjs` on your tree and report the
   cluster table against the predecessor's, so we can see the stalls stayed fixed.
6. Restore `e2e/twin-banks-never-wedged.spec.ts` from the archive branch once scope 1–4 hold.

## TOUCH-ONLY

`src/entities/Enemy.ts` · `src/world/Terrain.ts` (export-only, if `gravelBarContains` must be shared) ·
`e2e/twin-banks-never-wedged.spec.ts` · `scripts/gr-sim.test.mjs` (pinned hashes ONLY, per scope 4).

## NO

Water sim classification · ford/bar POSITIONS or geometry · the `e1-twin-banks` spec itself (it is
the judge — **do not edit the thing measuring you**, and do not touch `:213`) · `logs/suite-red-inventory.md` ·
night-census scope · Balance tuning · anything on another lane.

## Self-check

- `npx tsc --noEmit` clean · `npm run build` green.
- `node scripts/gr-sim.test.mjs` — **9/9**, with scope 4's explanation for every hash you re-pinned.
- `e2e/e1-twin-banks.spec.ts` — reaches `:213`, `deepSamples === 0`, **both projects**.
- `e2e/task-025-bandits-dont-swim.spec.ts` — green both projects (it was green under `9236e9ba` too;
  keep it that way).
- `e2e/twin-banks-never-wedged.spec.ts` — green both projects.
- Adjacent by grep, not from a list: `e2e/e2-enemies.spec.ts`, `e2e/never-trap.spec.ts`,
  `e2e/enemy-gap-flow.spec.ts`, `e2e/run3d-palisade.spec.ts`, `e2e/task-048-funnel-formation-spread.spec.ts`,
  `e2e/064-river-continues.spec.ts`, `e2e/gt-05-water-depth.spec.ts`, `e2e/shore-truth.spec.ts`.
- Zero console/page errors in a plain boot, desktop **and** 390px.

READY-FOR-GATES + report: the z-aware containment rule as shipped · the before/after census cluster
table · the `deepSamples` reading on both projects · and, per map, every pinned hash you re-pinned
with the reason it legitimately moved.
