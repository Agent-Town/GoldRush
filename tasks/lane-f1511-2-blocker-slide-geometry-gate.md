# lane-f1511-2-blocker-slide-geometry-gate — FIRE-AUTHORED (attended review welcome)

**Role:** Codex runner, lane-c. **Workdir:** `worktrees/lane-c` (branch `lane/c`).

## READ FIRST (paths, not memory)
- `src/entities/Enemy.ts` — `resolveBlocker()` (the two `slideX`/`slideZ` ternaries) and `blockerSlideDirection()`. **The single source file this task may change.**
- `docs/bench/f1512-1-blocker-slide-geometry-gate.md` — this task's WHY. s1512 already MEASURED the cure green in a detached worktree. **Do not redo the investigation; reproduce the gate.**
- `e2e/landmark-collision.spec.ts` — the regressed subject. Test at `:68`, failing assertion at `:91`.
- `e2e/never-trap.spec.ts` — the invariant that forbids a naive revert. Test at `:88`.
- `docs/bench/f1510-1-blocker-slide-deadband.md` — the CLOSED axis. The scalar deadband is exhausted; do not re-open it.

## PRE-FLIGHT (safe-dupe, lane)
```
cd worktrees/lane-c
git fetch origin 2>/dev/null || true
git status --short               # see the FACTORY-CHURN EXCEPTION below before reading this
git log main..HEAD --oneline    # expect EMPTY. If not, STOP and report — the lane holds undrained work.
grep -c "const slideX = ACTIVE_TILE_ID === 'e1-twin-banks' && moveTarget.x >= minX && moveTarget.x <= maxX" src/entities/Enemy.ts
```
**FACTORY-CHURN EXCEPTION — these tracked classes are ALWAYS EXPECTED and are NEVER a STOP; list them and proceed (F-1407-1):** (a) `logs/**` — the fire/runner accounting, rewritten every cycle by the factory itself; (b) `artifacts/**`, `reviews/shots-*` and any `.png` — regenerated evidence, never byte-identity gated, so their bytes differ from main forever. **What still STOPs:** modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md` that you did not make, or any non-empty `git log main..HEAD` (undrained work — resetting would DESTROY it).

The grep MUST print `1`. If it prints `0`, the lane is stale — **STOP and report "lane stale, needs refresh"**; do not attempt the edit.

## WHY (evidence, measured — not hypothesised)

`e2e/landmark-collision.spec.ts:68` ("enemy blocker routing is deterministic and goes around a county
landmark") has been RED on main since `531bd923adc97d9c288310f7f94f549e994c3f29` (bisected s1510).
That commit made `blockerSlideDirection()` **enemy-relative**:

```
return Math.sign(moveTarget[axis] - this.group.position[axis]) || this.avoidanceSide();
```

which **flips whenever the enemy crosses the goal's axis value**, so a head-on enemy oscillates
against the blocker face instead of going around.

⚠️ **Reverting `531bd923a` is FORBIDDEN.** It was a correct fix for a real owner complaint (gate walk
2026-08-03, owner verbatim: *"the opponents get stuck a lot on the different objects"*) and is guarded
by `e2e/never-trap.spec.ts:88`. The cure must satisfy **both** judges.

⛔ **The scalar-deadband axis is CLOSED** (s1511, F-1511-3): six thresholds measured, none separates
the two invariants, and the only green arm was a de facto revert. **Do not re-open it.**

⭐ **The cure shape that works was already shipped in this very file** (`5c27a1b5c`, f1441-2): the
`slideX`/`slideZ` ternaries carry a second slide policy that is (1) relative to the **blocker's
centre** — stable as the enemy moves, where the defect is enemy-relative and flips mid-slide — and
(2) gated on **the goal lying inside the blocker's padded span**, i.e. the head-on geometry itself
rather than a magnitude. It is currently fenced behind `ACTIVE_TILE_ID === 'e1-twin-banks'`.

**s1512 measured the generalisation green**, in a detached worktree at `6d1810dbd`, `--workers=1`,
both projects, external dev server on a scratch port:

| Arm | `landmark-collision:68`, isolated | Reproduced |
|---|---|---|
| baseline (main) | **2 failed** (desktop + mobile) | yes, twice |
| treated (2-line change below) | **2 passed** | yes |

Full pair (`landmark-collision` + `never-trap`), both projects: baseline **rc=1, 4 failed / 14
passed**; treated **rc=0, 18/18 passed**, reproduced twice (2.5m, 2.4m). `npx tsc --noEmit` rc=0.
`npm run test:node-guards` rc=0 on the treated tree — **the Baron sim pins did not move**, which is
the F-1460-1 hazard checked explicitly.

## SCOPE (numbered, each item testable)

1. In `src/entities/Enemy.ts`, `resolveBlocker()`, delete the tile fence from **both** ternaries so the
   centre-relative span gate applies to every blocker, not just `e1-twin-banks`. Exactly two lines change:

```
-    const slideX = ACTIVE_TILE_ID === 'e1-twin-banks' && moveTarget.x >= minX && moveTarget.x <= maxX
+    const slideX = moveTarget.x >= minX && moveTarget.x <= maxX
-    const slideZ = ACTIVE_TILE_ID === 'e1-twin-banks' && moveTarget.z >= minZ && moveTarget.z <= maxZ
+    const slideZ = moveTarget.z >= minZ && moveTarget.z <= maxZ
```

   Leave the ternary bodies untouched. Leave `blockerSlideDirection()` untouched — it remains the
   fall-through for the wedge case, which is what keeps `never-trap:88` green.

2. Add a brief comment above `slideX` naming WHY the gate is geometric: when the goal lies inside the
   blocker's padded span the approach is head-on, `Math.sign(moveTarget.x - blocker.x)` is ~0, and the
   `|| this.avoidanceSide()` fallback restores the stable go-around; outside the span the enemy-relative
   sign is correct and F-BW-10 stays cured. Cite `F-1511-2` and `F-1512-1`.

3. If `ACTIVE_TILE_ID` becomes unused in the file after step 1, **leave the import/const in place** —
   it is still used at `:151` and `:1180`. Do not tidy beyond scope.

## FIREWALL

**TOUCH-ONLY:** `src/entities/Enemy.ts` · `reviews/f1511-2-blocker-slide-geometry-gate.md` (new).

**NO — these are violations, report them instead of doing them:**
- Do NOT revert or edit `531bd923a`'s change to `blockerSlideDirection()`.
- Do NOT edit `e2e/landmark-collision.spec.ts` or `e2e/never-trap.spec.ts`. The judges are fixed.
- Do NOT re-pin `scripts/gr-sim.test.mjs` (F-1441-3). If a Baron pin moves, that is a FINDING — stop and report it; s1512 measured that it does not.
- Do NOT reintroduce a scalar deadband (F-1511-3, closed axis).
- Do NOT touch `Balance.ts`, other entities, or any other tile's behaviour.

## SELF-CHECK (name the exact commands and expected results)

Run all of these from `worktrees/lane-c`, **`--workers=1` on every playwright command** (F-1270-1 — a
correctness requirement of the fire/lane shell, not an optimisation):

1. `npx tsc --noEmit` → rc 0.
2. `npm run build` → rc 0.
3. `npx playwright test e2e/landmark-collision.spec.ts e2e/never-trap.spec.ts --workers=1` → **18/18 passed**, both projects. This is the acceptance test; `:68` and `:88` must both be green.
4. `npm run test:node-guards` → rc 0. **The Baron pins must be unchanged.** (F-1460-1 path trigger: the diff touches `src/entities/`.)
5. The other two `Terrain.landmarkBlockers()` consumers (F-1510-2): `npx playwright test e2e/map-census.spec.ts e2e/fort-landmark-collision.spec.ts --workers=1`.
   ⚠️ **KNOWN FLAKE, do not chase it and do not "fix" it:** s1512 measured this batch at **95 passed / 1 failed on BOTH arms**, where the single red is a `map-census.spec.ts:43` mobile-chrome "spot" case that **wanders between maps run to run** (`e5-deepwater-claim` on the treated arm, `e2-pressure-garden` on the composition-matched baseline). It passes isolated on both arms. It is batch-load dependent and **pre-existing** — filed as F-1512-2. Report which map drew it; do not treat it as your regression.
6. Zero console/page errors in the boot probes the specs already assert.

## REPORT (what to write back)

Write `reviews/f1511-2-blocker-slide-geometry-gate.md` with: slice/branch/tip · verdict line · a
paragraph on what the change does · an evidence table with REAL numbers from YOUR run (not this
master's) · merge classification · findings as F-IDs.

**A NEGATIVE RESULT IS STILL LICENSED AND IS STILL A DELIVERABLE.** s1512's measurement was taken on
a 2-line patch in a detached worktree; if your run disagrees — if `never-trap:88` regresses, if a
Baron pin moves, or if another tile's routing changes — **say so plainly with the numbers and STOP**.
Do not tune, do not add a threshold, do not widen scope to rescue the hypothesis. A disagreement
between s1512's arm and yours is itself the most valuable thing you could report.

**READY-FOR-GATES + report: the 18/18 acceptance result, the node-guards rc and whether any Baron pin
moved, which map (if any) drew the known map-census flake, and any finding you had to stop on.**
