CODEX: model=gpt-5.6-sol effort=xhigh
# Task f1441-2-crossings-keep-their-z: a crossing is a place, not an x-band (lane-c, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1441, 2026-08-03. Corrective for **F-1441-2** and
**F-1441-3**, filed when `lane-tb-stall-census` was drained PARTIAL.
**🔄 REFRESHED s1446, 2026-08-04, BEFORE FIRST DISPATCH — main absorbed part of this task's subject
in the interim. Read "WHAT MAIN NOW OWNS" below before scope 2; it reverses one of the original
instructions.** (§2E stale-check: refresh, never blind-queue.)

## ⚠️ WHAT MAIN NOW OWNS — read this before scope 2 (measured s1446, not inferred)

This master was authored at s1441. **Main has since moved `src/entities/Enemy.ts` twice**:
`e4ea0993` (s1444, baron-siege) and **`531bd923` (s1445, night-stuck-census, F-BW-10 — the owner's
"opponents get stuck on objects")**. Measured with `lane-absorbed-lines.mjs`: **6 of `9236e9ba`'s 55
added `Enemy.ts` lines are now ON MAIN**; 49 are still absent. The 6 are the overlap, and they are
the ones the original scope 2 told you to restore.

**`blockerSlideDirection` and the `moveTarget` threading are now MAIN'S, and main's version is
DIFFERENT from the archive's:**

| | archive `9236e9ba` | **main `531bd923` (shipped, gated, control-proven)** |
|---|---|---|
| signature | `(axis, moveTarget, blocker)` | `(axis, moveTarget)` |
| return | `Math.sign(moveTarget[axis] - blocker[axis])` | `Math.sign(moveTarget[axis] - this.group.position[axis])` |
| measured from | the blocker's position | **the enemy's own position** |

🚫 **DO NOT restore the archive's `blockerSlideDirection`, and do not re-add the `blocker`
parameter.** Main's variant is the shipped fix for **F-BW-10, an owner-reported defect**, proved at
s1445 by a manufactured defect. It reds on clean main and passes with it:
`e2e/never-trap.spec.ts:88` ("Night Shift enemies always make goal progress around object footprints")
Restoring the archive's form would **silently revert a merged owner fix** while looking like faithful
salvage. The archive's form is **SUPERSEDED, not withheld.**

➡️ **So take from `9236e9ba` only what main LACKS**: `goalSideCrossing`, `RIVER_CROSSINGS`,
`resolverCrossingAtX`, `CROSSING_SPEED`, the crossing-selection logic in the router, and
`resolveRiver`'s crossing arguments — **and make the containment z-aware per scope 1.** Where main
and the archive both changed a line, **main wins by default**; if you believe a specific archive line
must override main's, say so in your report with the reason. Do not decide it silently.

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
grep -c "private blockerSlideDirection(axis: 'x' | 'z', moveTarget: THREE.Vector3): number {" src/entities/Enemy.ts
grep -c "return Math.sign(moveTarget\[axis\] - this.group.position\[axis\]) || this.avoidanceSide();" src/entities/Enemy.ts
```

All five were **re-verified to return `1` against current main at s1446, immediately before
dispatch** (the first three were originally proven at s1441 and still hold). A `0` means your lane is
behind main and does not yet contain this task's subject — **STOP and report "lane stale at
dispatch", do not improvise.** (F-1424-3 / F-1425-2: each key was proven against the source file on
main before being written here, and each sits on one line, so a `0` really does mean the lane.)

⚠️ **Keys 4 and 5 are the F-BW-10 guard added by the s1446 refresh.** They assert that main's
enemy-relative `blockerSlideDirection` is present in your tree. If either returns `0`, your lane
predates `531bd923` and **any salvage you do from the archive will revert a shipped owner fix** —
that is a STOP, not something to work around.

**LANE-SAFETY (safe-dupe, runner-auto-commit aware):** the lane branch being ahead is NORMAL — the
runner auto-commits. For each ahead commit: if its content is already merged to main (verify with
`git log`/`git diff`, not from memory), it is a SAFE DUPE → reset to main and PROCEED.

> **FACTORY-CHURN EXCEPTION — these two tracked classes are ALWAYS EXPECTED and are NEVER a STOP; list them and proceed (F-1407-1):** (a) `logs/**` — the fire/runner accounting (`factory-usage.json`, `usage-history.jsonl`, `task-stats.jsonl`, `dashboard.html`, `.goal-tree.html`, `.blocked-seen`), rewritten every cycle by the factory itself; (b) `artifacts/**`, `reviews/shots-*` and any `.png` — regenerated evidence. ⚠️ **The fire that authors a master creates this dirt in the same fire and cannot see it**, which is why it lives in the template rather than in anyone's memory. ⓘ What still STOPs, unchanged and load-bearing: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md` — anything a live drain or concurrent task could actually own.

⚠️ **`9236e9ba`
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
2. **Keep `goalSideCrossing` — but NOT the archive's `blockerSlideDirection` (REVISED s1446).**
   The goal-side bias and the commit-to-one-crossing behaviour are the good part of `9236e9ba`, they
   are why the stalls clear, and they are still absent from main — **restore those.**
   🚫 **The `moveTarget` threading is NO LONGER YOURS TO RESTORE: main owns it as of `531bd923`, in a
   different and control-proven form.** Thread your crossing work through **main's existing**
   `resolveBlocker(blocker, stepDistance, moveTarget)` / `blockerSlideDirection(axis, moveTarget)`
   signatures. **Do not re-add the `blocker` parameter and do not change what
   `blockerSlideDirection` returns** — see "WHAT MAIN NOW OWNS" above. `resolveRiver` is the one you
   may extend, since main's copy has no crossing argument yet.
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
🚫 **ADDED s1446: `blockerSlideDirection`'s signature and return expression are OFF LIMITS** — they
are main's F-BW-10 fix (`531bd923`), not your salvage surface. Call it; do not reshape it.

## Self-check

- `npx tsc --noEmit` clean · `npm run build` green.
- `node scripts/gr-sim.test.mjs` — **9/9**, with scope 4's explanation for every hash you re-pinned.
- `e2e/e1-twin-banks.spec.ts` — reaches `:213`, `deepSamples === 0`, **both projects**.
- `e2e/task-025-bandits-dont-swim.spec.ts` — green both projects (it was green under `9236e9ba` too;
  keep it that way).
- `e2e/twin-banks-never-wedged.spec.ts` — green both projects.
- **`e2e/never-trap.spec.ts` — green both projects, and call it out explicitly in your report
  (ADDED s1446).** `:88` is the manufactured-defect witness for main's F-BW-10 fix: it reds on a tree
  without it. If it goes red, you have reverted `531bd923` — stop and say so rather than adjusting it.
- Adjacent by grep, not from a list: `e2e/e2-enemies.spec.ts`, `e2e/never-trap.spec.ts`,
  `e2e/enemy-gap-flow.spec.ts`, `e2e/run3d-palisade.spec.ts`, `e2e/task-048-funnel-formation-spread.spec.ts`,
  `e2e/064-river-continues.spec.ts`, `e2e/gt-05-water-depth.spec.ts`, `e2e/shore-truth.spec.ts`.
- Zero console/page errors in a plain boot, desktop **and** 390px.

READY-FOR-GATES + report: the z-aware containment rule as shipped · the before/after census cluster
table · the `deepSamples` reading on both projects · and, per map, every pinned hash you re-pinned
with the reason it legitimately moved.
