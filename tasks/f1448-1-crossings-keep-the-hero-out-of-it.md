**FIRE-AUTHORED (attended review welcome)** — s1448, 2026-08-04

# Task f1448-1-crossings-keep-the-hero-out-of-it: an enemy-pathing fix must not move the hero (lane-c, commit prefix "fix:")

**Role:** Codex runner, lane-c. **Workdir:** `worktrees/lane-c` (branch `lane/e2-arsenal`).

## ⚠️ THIS LANE IS NOT CLEAN AND MUST NOT BE RESET — READ THIS FIRST

Your lane sits at `5c27a1b5` and **holds the whole of f1441-2**, which is **gated, reviewed and
deliberately WITHHELD from main** pending exactly the defect you are about to fix. This is **not** a
stale lane and **not** debris.

- **DO NOT** run `git reset --hard main`. **DO NOT** run `git clean -fd`. There is no reset step in
  this task's pre-flight, on purpose.
- The tip is additionally preserved at `archive/lane-e2-arsenal-s1448-5c27a1b5-held-f1448-1`, so a
  reset would not destroy it — but it would destroy **your starting point** and this task would
  become unperformable.
- You are **continuing** that branch, not re-landing it.

## READ FIRST

1. `reviews/f1441-2-crossings-keep-their-z.md` — the gate that withheld this slice. Read **F-1448-1**
   (the blocker) and **F-1448-2** (the prime suspect) in full. Everything you need is measured there.
   ⓘ This file is on **main**, not in your lane. Read it with
   `git show main:reviews/f1441-2-crossings-keep-their-z.md`.
2. `src/entities/Enemy.ts` in your lane — specifically the module-scope constants around `:143-155`.
3. `e2e/gt-05-water-depth.spec.ts:181` ("deep water blocks hero and enemy through the shared resolver") — the failing test, and `e2e/gt-05-water-depth.spec.ts:209` ("deep water blocks hero and enemy through the shared resolver"), the failing assertion inside it.

## Pre-flight

**STOP pre-condition (hard — do not skip, do not "fix" it, report and exit if it fails).**
Run these three greps from the repo root of your lane worktree:

```
grep -c "const CROSSING_SPEED = Terrain.sample(" src/entities/Enemy.ts
grep -c "const GRAVEL_BAR_CROSSINGS = activeWaterDescriptor()" src/entities/Enemy.ts
grep -c "expect(heroSample.sample).toMatchObject(" e2e/gt-05-water-depth.spec.ts
```

All three must print **1**. The first two are **absent from main** (verified s1448: `main=0`,
`lane=1`), so if either prints `0` your lane has been reset over the f1441-2 work and this task is
**unperformable** — **STOP and report "lane reset, f1441-2 content gone; recover from
`archive/lane-e2-arsenal-s1448-5c27a1b5-held-f1448-1`"**. Do not attempt to rebuild it yourself.

> **FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1):**
> (a) `logs/**` — factory accounting rewritten every cycle; (b) `artifacts/**`, `reviews/shots-*` and
> any `.png` — regenerated evidence. What still STOPs: modified tracked `src/**`, `scripts/**`,
> `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (F-1448-1, measured s1448 — not inferred)

The f1441-2 slice fixes what it set out to fix: its acceptance criterion
`e2e/e1-twin-banks.spec.ts:213` ("routes enemies through both west and east fords") reads
`deepSamples === 0` on both projects, `gr-sim` is 9/9, and the
F-BW-10 witness `never-trap.spec.ts` is 8/8. **It was withheld for one reason only.**

Under an identical 6-spec / 58-test / `--workers=1` battery, in the same shell within the same hour:

| Arm | reds | `gt-05-water-depth.spec.ts:181` [mobile-chrome] |
|---|---|---|
| merged, run 1 | 9 | **RED** |
| merged, run 2 | 9 | **RED** |
| clean main | 8 | **GREEN** |

The other eight reds are identical by name on both arms and are pre-existing. The failing assertion
is `e2e/gt-05-water-depth.spec.ts:209` ("deep water blocks hero and enemy through the shared resolver"):

```
expect(heroSample.sample).toMatchObject({ zone: 'ford', waterClass: 'wade' })
  Expected: { zone: 'ford', waterClass: 'wade' }
  Received: { zone: 'bank' }
```

That is the **hero**, after a 700 ms `KeyD` + `ArrowDown` slide, ending on the bank instead of
reaching the ford. **Hero movement never enters `ClaimJumperEnemy`**, so an enemy-pathing diff should
not be able to touch it — which is what makes this worth one task rather than a shrug.

⚠️ Note the test **passes in isolation** on the merged tree (5 pass, 39 s). It is load-sensitive
**and** merge-caused. Do not let the isolation green talk you out of the battery red: the battery red
reproduced 2/2 and main's battery green reproduced 2/2.

## Scope

1. **Test F-1448-2 first — it is the only mechanism in the diff that can reach the hero.** f1441-2
   moved three computations to **module scope** in `Enemy.ts`, where previously only
   `activeTileDescriptor().id` ran:
   `activeWaterDescriptor()`, `Terrain.fordRanges()` (twice, inside `RIVER_CROSSINGS`), and
   `Terrain.sample(...)` for `CROSSING_SPEED`. `Terrain.sample()` and `Terrain.fordRanges()` at
   **import time** make `Enemy.ts` force `Terrain` initialisation during boot, which can reorder
   module init. **Confirm or refute this before changing anything** — e.g. by making the constants
   lazy and re-running the battery. Report which it was; a refutation is a real result, not a
   failure.
2. **Cure it without giving back any measured win.** If F-1448-2 is the cause, hoist the three
   constants behind a lazy getter (computed on first use, cached) so `Enemy.ts` does no terrain work
   at import. Keep `goalSideCrossing`, keep the z-aware `Terrain.gravelBarContains` authorisation,
   keep the narrow `ACTIVE_TILE_ID === 'e1-twin-banks'` override, keep the re-pins.
3. **If F-1448-2 is refuted, find the real cause and report it before curing.** An unexplained cure
   is a STOP, not a merge. Do not paper over the red by touching
   `e2e/gt-05-water-depth.spec.ts` — **that file is the judge** and is in the NO list below.
4. **Prove the cure with a matched battery, both arms, same composition.** Run
   `e2e/task-025-bandits-dont-swim.spec.ts e2e/064-river-continues.spec.ts e2e/e1-dry-gulch.spec.ts
   e2e/e1-night-shift.spec.ts e2e/gt-05-water-depth.spec.ts e2e/lane-crossing-armed.spec.ts`
   with `--workers=1`. Your tree must show **8 reds, matching clean main's 8 by name** — not "fewer
   than 9", not "green in isolation".
5. **Re-prove f1441-2's own acceptance is untouched.** `e1-twin-banks.spec.ts:213` still reads
   `deepSamples === 0` on both projects; `never-trap.spec.ts` still green both projects (the F-BW-10
   witness); `gr-sim` still 9/9 with the three Twin Banks pins unchanged from your tip.
6. **Optional, only if free:** F-1448-3 (`CROSSING_SPEED` falling back to sampling x=0 on a fordless
   map) and F-1448-4 (`RIVER_CROSSINGS` never used as the union it is built as) are non-blocking and
   documented in the review. Fix them only if scope 1–5 hold and the fix is obviously safe.

## TOUCH-ONLY

- `src/entities/Enemy.ts`
- `src/world/Terrain.ts` (only if the lazy-init cure genuinely requires it)

## NO

- ❌ `e2e/gt-05-water-depth.spec.ts` — **this is the judge.** Do not edit it, do not retitle it, do
  not add `test.skip`.
- ❌ `e2e/e1-twin-banks.spec.ts` — the f1441-2 acceptance judge. Same rule.
- ❌ `blockerSlideDirection`'s signature or its enemy-relative return — **byte-identical to main and
  it must stay that way.** It is s1445's control-proven F-BW-10 fix (owner: *"opponents get
  stuck"*). Restoring the archive's blocker-relative form silently undoes a merged owner fix.
- ❌ `git reset`, `git clean`, or any rebase of this branch.
- ❌ Re-pinning any `gr-sim` hash to make a red go away (F-1441-3). The three Twin Banks pins are
  already justified; **any further pin that moves is a STOP**, not a baseline.
- ❌ Night Shift / 064-river-continues reds — those eight are pre-existing on both arms and are not
  yours.

## Self-check

- `npx tsc --noEmit` clean; `npm run build` green.
- `node --test scripts/gr-sim.test.mjs` — **9/9**, pins unchanged from your tip.
- `e2e/e1-twin-banks.spec.ts` — reaches `:213`, `deepSamples === 0`, **both projects**.
- `e2e/never-trap.spec.ts` — green **both projects**, and **call it out explicitly in your report as
  the F-BW-10 witness**.
- `e2e/twin-banks-never-wedged.spec.ts` — green both projects.
- The scope-4 matched battery — **8 reds, named, matching clean main**.
- Plain boot, no `?debug`: zero console/page errors at 1280px **and** 390px.
- Screenshots to `reviews/shots-f1448-1/`.

**READY-FOR-GATES.** Report: which of F-1448-2 you confirmed or refuted and by what measurement · the
before/after red table for the scope-4 battery on both arms · the `deepSamples` reading on both
projects · every `gr-sim` pin, stating explicitly that none moved.
