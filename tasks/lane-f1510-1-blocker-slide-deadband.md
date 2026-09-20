# lane-f1510-1-blocker-slide-deadband — FIRE-AUTHORED (attended review welcome)

**Role:** Codex runner, lane-a. **Workdir:** `worktrees/lane-a` (branch `lane/a`).

## READ FIRST (paths, not memory)
- `reviews/f1507-2-landmark-routing-bisect.md` — this task's WHY. Read **all** of "Root cause" and finding **F-1510-1**. The bisect is already done; do not redo it.
- `src/entities/Enemy.ts` — `blockerSlideDirection()` and `resolveBlocker()`. **The single file this task may change.**
- `e2e/landmark-collision.spec.ts` — the regressed subject. Test at `:68`, failing assertion at `:91`.
- `e2e/never-trap.spec.ts` — the invariant the culprit commit shipped to cure the ORIGINAL owner complaint. **This must not regress. It is the whole reason the naive revert is forbidden.**
- `reviews/lane-night-stuck-census.md` — the s1445 drain that shipped the culprit, incl. its matched-control method.

## WHY (evidence, quoted and dated)

**s1510 bisected the test at `e2e/landmark-collision.spec.ts:68` ("enemy blocker routing is deterministic and goes around a county landmark") to a single commit** —
`70eb5b50d3bb6852b8cd6b6646dec9a2b2af6577` (*drain(s1445): lane-night-stuck-census MERGED — F-BW-10,
enemies slide toward their goal, not their sign*, 2026-08-04T00:48+07). All arms `--workers=1`,
both projects, detached worktree:

| Commit | Result |
|---|---|
| `1761da401 (archive: pruned by the A3 rewrite)` (2026-07-28) | **GREEN 10/10** — whole spec |
| `e2a6a5641` (culprit's parent) | **GREEN 2/2** |
| **`70eb5b50d`** | **RED 2/2**, both projects |
| current `main` | RED 2/2 |

The culprit is 9 insertions / 9 deletions in `src/entities/Enemy.ts`:

```
-    return this.avoidanceSide();
+    return Math.sign(moveTarget[axis] - this.group.position[axis]) || this.avoidanceSide();
```

`avoidanceSide()` is **position-derived and constant** for a given approach, so a blocked enemy slid
one way along the blocker face until it cleared the corner — it went *around*. The goal-relative sign
**flips** whenever the enemy crosses the goal's axis value. The spec sends the enemy from directly
south of `ruined_mining_operation` to directly north of it, so goal-x equals blocker-x, the slide term
points back toward the blocker centre from either side, and the enemy oscillates against the face.
Measured by the s1507-2 runner's read-only probe: 180 samples pinned at `z=-8.652`,
`1.845 ≤ x ≤ 2.061`, **max x-deviation 0.175** against `halfX=3.176`.

⚠️ **The culprit was a CORRECT fix for a real, owner-raised problem** (gate walk 2026-08-03, owner
verbatim: *"the opponents get stuck a lot on the different objects"*). **Reverting it is FORBIDDEN** —
that re-opens F-BW-10 and `e2e/never-trap.spec.ts:88` ("Night Shift enemies always make goal progress around object footprints"). The goal is to satisfy **both**.

## THE PROPOSED CURE (a hypothesis — validate it, and reject it if it does not hold)

Keep the goal-relative sign as primary, but fall back to `avoidanceSide()` when the goal-relative
delta is **small**, rather than only when it is exactly `0`:

```
const delta = moveTarget[axis] - this.group.position[axis];
return Math.abs(delta) > <threshold> ? Math.sign(delta) : this.avoidanceSide();
```

Rationale: the wedge case F-BW-10 cured has a **large** goal-relative delta (the enemy is beside its
goal), while the head-on stall has a delta oscillating around zero. A deadband should separate them.

⚠️ **This is proposed, not proven. If a threshold that greens both specs does not exist, that is a
LEGITIMATE OUTCOME — say so with the arms that show it, and STOP.** Do not widen scope to other
files hunting for a way to make it true. A negative result here is worth as much as a cure.

## SCOPE (each item testable)

1. **Establish both baselines on the lane's own tree first**, `--workers=1`, both projects:
   - `npx playwright test e2e/landmark-collision.spec.ts -g "goes around a county landmark"` → expect **2 failed**
   - `npx playwright test e2e/never-trap.spec.ts` → expect **PASS**
   Report both raw tallies. If either disagrees, **STOP and report** — the premise has moved.
2. **Pick the threshold by measurement, not by taste.** Try at least three candidate values spanning
   a plausible range (e.g. a small fraction of `stepDistance` through ~1 world unit). For **each**,
   record both specs' tallies in a table. Name the units the threshold is in.
3. **Apply the chosen threshold** to `blockerSlideDirection()` in `src/entities/Enemy.ts`. Add a
   short comment naming F-1510-1 and stating *why* the deadband exists — the next reader must not
   "simplify" it back into a bare `Math.sign`.
4. **Prove the cure by a manufactured defect, not by a green** (house standard). Show that with the
   deadband removed (threshold set to 0) `landmark-collision:68` reds again on the same tree, and
   with it restored it passes. A passing test never executes its violation path.
5. **Run the full `landmarkBlockers()` consumer set** — this is the F-1510-2 lesson and it is
   mandatory here: `e2e/landmark-collision.spec.ts`, `e2e/never-trap.spec.ts`,
   `e2e/fort-landmark-collision.spec.ts`, `e2e/map-census.spec.ts`. Both projects. Report each.
6. **Adjacent suites**: `e2e/enemy-gap-flow.spec.ts`, `e2e/gt-03-enemy-elevation.spec.ts`, plus
   task-025 / m1-01 / m2-01 minimum. Fingerprint any red against `logs/suite-red-inventory.md`
   using `node scripts/red-inventory-lookup.mjs <spec>` — **never grep** (F-1504-2). Membership is
   not exoneration; if a red is in the slice's blast radius, run a matched control with
   `src/entities/Enemy.ts` reverted byte-identical and the spec kept.
7. `npx tsc --noEmit` clean · `npm run build` green · `npm run test:node-guards` (the diff touches
   `src/entities/` — F-1460-1 makes this mandatory, and `scripts/gr-sim.test.mjs` carries a Baron
   kill-count pin that routing changes can move). ⚠️ **If that pin reds, that is a FINDING with a
   named cause — report it. Do NOT re-pin it to make it green** (F-1441-3).

## FIREWALL

**TOUCH-ONLY:** `src/entities/Enemy.ts` · `docs/bench/` (your report) · new screenshots under `artifacts/`.

**NO:** do not revert `70eb5b50d` · do not edit `e2e/**` (both specs are the judges — changing a judge
to pass a defendant is the failure this task exists to avoid) · do not touch
`src/systems/BuildSystem.ts`, `src/world/Terrain.ts`, `src/world/LandmarkCollision.ts` ·
do not change `Balance.palisade.*` · do not touch the `gapBlockerId` route branch (the culprit
deliberately left it alone) · do not re-pin `scripts/gr-sim.test.mjs`.

## SELF-CHECK before you report

- [ ] Baselines from scope 1 reported as raw tallies, both projects.
- [ ] Threshold table from scope 2 with ≥3 candidate values and both specs per row.
- [ ] Manufactured-defect proof from scope 4 shown in both directions.
- [ ] All four `landmarkBlockers()` consumers reported (scope 5).
- [ ] tsc rc · build rc · `test:node-guards` rc all stated as numbers.
- [ ] Zero console/page errors, desktop **and** 390px mobile.
- [ ] Every playwright command used `--workers=1`.
- [ ] Commit is path-scoped with the `f1510-1:` prefix. Never `git add -A`.

**READY-FOR-GATES + report:** the threshold you chose and its units, the scope-2 table, the
manufactured-defect result, all four consumer tallies, and — if no threshold greens both — the
arms proving that, as a clean STOP.
