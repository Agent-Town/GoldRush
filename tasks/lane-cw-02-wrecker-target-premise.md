# Task lane-cw-02-wrecker-target-premise: F-1109-1'S LAST RED — MEASURE THE GEOMETRY FIRST, THEN FIX WHAT IT SAYS

**FIRE-AUTHORED (attended review welcome) — s1114, 2026-07-27.** This closes the last survivor of the
F-1109-1 → F-1112-1 chain. Three of those four specs went green at `b43b31ad`; ✓ re-measured on current
main by s1114 at `--workers=1`: **3 passed / 1 failed**, the failure being `cw-02-escort.spec.ts:134`.

You are Codex (worktrees/lane-a).

CODEX: model=gpt-5.6-sol effort=medium

> ⚠️ The `CODEX:` line above is at **column 0 on its own line** deliberately (F-1088-4).
> `scripts/lane-runner-v3.sh:65-66` greps `^CODEX:`, so an inline copy is silently ignored and the run
> falls back to `effort=medium` without telling anyone.

## ⚠️ READ THIS FIRST — TWO HYPOTHESES ARE ALREADY DEAD. DO NOT RE-RUN THEM.

s1114 measured both. Repeating them wastes the run:

1. **It is NOT a stale sim budget.** Raising `advanceSim(8)` → `advanceSim(40)` (5×) changed **nothing**:
   still `40/40`. **Raising that number is a FIREWALL VIOLATION here.**
2. **It is NOT an engine targeting bug *as far as anyone has shown*.** ✓ VERIFIED at source,
   `src/entities/Enemy.ts:1040-1075` (`updateWrecker`): a wrecker seeks
   `context.nearestBuilding(this.group.position)` on a retarget timer. **It does not hunt the hero.**
   The engine is doing exactly what it says.

## WHY (the measurement, quoted from the probe s1114 ran and then reverted)

`cw-02-escort.spec.ts:134` asserts `sabotage.rim?.hp === maxHp - 1` — the index-2 `sentry_beacon` should
take exactly one wrecker hit. It reads `Expected: 39 · Received: 40`.

An instrumented run (spec restored byte-identical to main afterwards) returned the whole `build.hp` table:

```
enemiesAlive: 0
allBuilds: sentry_beacon×6 all 40/40   ← the named target is PRISTINE
           lantern_post 0 → 34/35      ← exactly 1 damage
           lantern_post 1 → 35/35
heroHp: 100
```

`wreck.damage: 1` with `wreck.hitCooldown: 999` means **the wrecker gets exactly one swing in the whole
window** — and a **lantern post** received it. Since the target is `nearestBuilding`, the test's real
premise is *geometric*: it assumes `PYLONS[2] = (-28, 8)` is the nearest structure to the west spawn gate,
which `:104` (passing) pins at `{ edge: 'west', x: -46, z: 38 }` — roughly **35 units** away.

**A clue you should not have to re-derive:** the two `lantern_post`s are **not placed by the test** —
`:107-110` places only the six beacons — so the **contract/map** places them. They are **not** the town
lanterns in `townLayout.ts:170-174` (town-scale, e.g. `(-5.8, 9.85)`). The change is in `e3-canyon-works`'s
own furniture.

## SCOPE (numbered — SCOPE 1 IS MANDATORY AND GATES THE REST)

1. **MEASURE, AND REPORT THE NUMBERS.** Temporarily instrument the spec (or a scratch probe) to print the
   world positions of every entry in `build.hp` — both `lantern_post`s and all six `sentry_beacon`s —
   together with their distances to the west spawn gate `(-46, 38)`. **Report the full table in your
   closing report.** Revert any instrumentation before you finish; the diff must not contain it.

2. **BRANCH ON WHAT SCOPE 1 SAYS — and these are the only two legal outcomes:**

   **(2a) A `lantern_post` IS nearer the west gate than `PYLONS[2]`.** Then the test's premise is stale and
   the engine is right. Fix the assertion so it states **what the test actually means** — that *the
   structure nearest the west spawn gate takes exactly one wrecker hit* — deriving that target from the
   same `build.hp` table at runtime instead of naming a building by index. `:135`
   (`lanterns.every(hp === maxHp)`) is falsified by the **same** event, so **re-decide it in the same
   edit**: it exists to prove the wrecker landed *one* hit on *one* structure, so express that.

   **(2b) NO `lantern_post` is nearer.** Then the premise was sound and `nearestBuilding` is picking a
   farther target — **a real engine bug. STOP and report.** Do not touch `src/`. Say so plainly and
   name the numbers; it goes to the owner's desk, not into a test edit.

3. Add **no** new imports unless scope 2a genuinely requires one.

## ⛔ THE ONE THING THAT WOULD MAKE THIS TASK WORSE THAN DOING NOTHING

**Do NOT re-point the assertion at whatever happened to get hit** (e.g. `expect(lantern.hp).toBe(34)`).
That is writing the guard from the answer sheet: it would go green while proving nothing, and this spec
exists to catch exactly the class of change that caused this. The assertion must still fail if a wrecker
stops damaging structures altogether. **If you cannot express the intent without naming the observed
result, STOP and report — that is a lawful, valuable outcome.**

## FIREWALL

**TOUCH-ONLY:** `e2e/cw-02-escort.spec.ts`

**NO — stopping conditions, each a lawful STOP, not a failure:**
- **NO `src/**` changes of any kind**, including map/contract data. Outcome 2b is a *report*, not a fix.
- **NO** other `e2e/` file. The other three specs in this family are green — leave them alone.
- **NO** raising `advanceSim(8)`, `wreck.hitCooldown`, `enemy.speed`, or any timeout. The budget
  hypothesis is already dead (5× changed nothing).
- **NO** deleting or `.skip`-ing either assertion. Weakening a guard to green is not a cure.
- **NO** touching `:104`'s spawn-gate assertion — it passes, and it is the anchor the measurement uses.

## PRE-FLIGHT (run these, in order, and STOP if any fails)

Measured by s1114 at author time — **re-confirm, do not trust**:
- `lane/m3` is **1 ahead of main and its content is fully merged** (`board-card-images-steer` landed
  `70ce6e50`), so the reset below is loss-free. Re-verify before resetting:

```
git -C worktrees/lane-a fetch --all
git -C worktrees/lane-a diff main lane/m3 -- src/ e2e/     # expect: EMPTY or main-newer only
```

- If that diff shows **lane-only content that is not on main, STOP** — a predecessor is undrained and
  `reset --hard` would destroy it (the w1-03 / polish-02 loss, Mistake #2).
- Otherwise reset to current main and confirm `e2e/cw-02-escort.spec.ts` matches main byte-for-byte.
- **Run the spec BEFORE you edit it** and bank the result. s1114 measured it **RED at `:134`,
  `Expected: 39 · Received: 40`**. If it is *green* on your box, **STOP and report** — the premise of
  this task is gone.

## SELF-CHECK (name the numbers in your report)

1. `npx tsc --noEmit` — clean. (`tsconfig.json` includes `e2e`, so this is a real gate here.)
2. `npm run build` — green.
3. `npx playwright test --project=desktop-chrome e2e/cw-02-escort.spec.ts --workers=1` — report
   before/after.
4. **Repeat the desktop run 3×** and report all three durations, not just "green".
5. The **whole F-1109-1 family** at `--workers=1`, desktop:
   `e2e/e2-incline.spec.ts e2e/e2-pressure-garden.spec.ts e2e/e2-trestle.spec.ts e2e/cw-02-escort.spec.ts`
   — s1114's banked baseline is **3 passed / 1 failed (45.9s)**. Anything other than 4/4 or an honest
   STOP needs explaining.
6. Same spec on `--project=mobile-chrome --workers=1` — report pass/fail either way.
7. Zero console/page errors (`watchErrors` is already wired at `:69`).
8. `git diff --stat` — **exactly one file changed.** Paste it. Confirm no instrumentation survived.

⚠️ **Use `--workers=1` for every measurement above.** Per F-1113-4, at the default worker count on a loaded
box this repo's specs redden for contention alone, and a false red here would send the next fire chasing a
bug that does not exist.

**READY-FOR-GATES** — report: the scope-1 distance table in full, which branch (2a or 2b) the measurement
selected and why, the before/after plus three repeats, the four-spec family result against the 3/1
baseline, the mobile result, and the one-file diffstat.
