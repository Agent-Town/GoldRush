# f1510-1 blocker-slide deadband — review

**Slice:** `lane-f1510-1-blocker-slide-deadband.md` (F-1510-1 corrective, authored s1510)
**Branch:** `lane/a` · **tip** `9e38976c`-successor, drained at `649156a72`
**Drained by:** s1511 · 2026-08-07

## Verdict

**MERGED — as a NEGATIVE RESULT, which is the outcome the master explicitly licensed.**
No scalar goal-delta deadband can satisfy both routing invariants. The report is the only
repo change; `src/entities/Enemy.ts` is byte-identical to main. F-1510-1 stays OPEN on the
owner's desk — the corrective ran, and its answer is "not on this axis".

## What it does

The master proposed replacing s1445's unconditional `Math.sign(moveTarget[axis] - position[axis])`
with a deadband: use the goal-relative direction only when `|delta| > threshold`, else fall back to
the id-parity `avoidanceSide()`. The runner measured six thresholds against the two judge specs and
found no separating value, restored `Enemy.ts`, and wrote
`docs/bench/f1510-1-blocker-slide-deadband.md`.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` (merged tree) | **rc=0**, clean |
| three-dot diff `main...lane/a` | **1 file, +71/-0**, `docs/bench/` only |
| run surface touched (`src/ e2e/ functions/ scripts/` + configs) | **NONE** |
| `src/entities/Enemy.ts` vs main | **byte-identical** (empty diff) — restoration claim VERIFIED |
| `lane-usable.mjs lane-a` | `paths=1`, HELD LANE-ONLY, the report file alone |
| `drain-block-check.mjs … --strict` | **CLEAR**, leaf `f1510-1-blocker-slide-deadband` present |

`npm run build`, a browser battery and `test:node-guards` were **not run and are not owed**: the
merged diff touches no run surface, and the F-1460-1 path trigger (`src/sim/`, `src/systems/`,
`src/entities/`) is not met. Said out loud rather than silently skipped, per the f1507-2 precedent
(`bc482de1a`, s1510).

### The runner's own arms (reproduced from the report, not re-run)

| Deadband (world units) | `landmark-collision:68` | full `never-trap.spec.ts` |
|---:|---:|---:|
| 0 (baseline) · 0.05 · 0.25 · 1.0 | 0 passed / 2 failed | 8 passed / 0 failed |
| 3.9 · 4.0 | 2 passed / 0 failed | 6 passed / 2 failed |

**Baseline cross-checked against an independent measurement rather than re-run:** s1510 measured
main **RED** on the landmark spec (culprit `70eb5b50d`) and s1445's `never-trap` green, in a
different fire, in a detached worktree, on a scratch port. The report's baseline row agrees with
both. Two fires, two instruments, same answer.

**Arithmetic verified by reading the code, not accepted:** `resolveBlocker()` computes
`pad = Balance.palisade.avoidancePad + hitRadius - touchRadius` (`src/entities/Enemy.ts:1349`);
`Balance.ts:559` gives `avoidancePad: 0.68` and `Balance.ts:35` `touchRadius: 0.6`, so a normal
enemy's pad is exactly `0.68` and the Dry Gulch padded face sits at `3.176 + 0.68 = 3.856`. That
is why 1.0 fails and 3.9 passes. The report's geometry is sound.

## Findings

### F-1511-1 — THE 3.9 ARM IS NOT A DEADBAND, IT IS A DE FACTO REVERT. That is what makes the negative result STRUCTURAL rather than a tuning miss.

Non-blocking; interpretive, and it strengthens the report's conclusion beyond what the report claims
for itself. The formula is
`Math.abs(delta) > threshold ? Math.sign(delta) : this.avoidanceSide()`. The Dry Gulch subject's
goal-relative delta is bounded by the map, so a threshold of 3.9 means the `Math.sign(delta)` branch
is taken **almost never** — the enemy runs on `avoidanceSide()`, which is precisely the pre-`70eb5b50d`
behaviour. So the only arm that greens the landmark spec does so by *undoing the cure*, and the
`never-trap` regression at that arm is not a coincidence to be tuned away — it is the same regression
`70eb5b50d` was written to fix, reappearing on schedule.

**Consequence:** nobody should re-open this hunt with more threshold values, finer steps, or a
per-axis threshold. The axis is exhausted. A future fire reading only the report's table might
reasonably think "3.9 was close, try 3.86" — this finding exists to stop that.

### F-1511-2 — THE CURE SHAPE THAT WORKS IS ALREADY SHIPPED AND GREEN, TEN LINES ABOVE THE LINE UNDER TEST — AND NEITHER THE MASTER NOR THE REPORT LOOKED AT IT.

Non-blocking; this is the recommended next direction, and it costs no design fork.
`src/entities/Enemy.ts:1363–1369` already carries a *second* slide policy:

```
const slideX = ACTIVE_TILE_ID === 'e1-twin-banks' && moveTarget.x >= minX && moveTarget.x <= maxX
  ? Math.sign(moveTarget.x - blocker.x) || this.avoidanceSide()
  : this.blockerSlideDirection('x', moveTarget);
```

Two differences from the deadband, both load-bearing:
1. It is goal-relative to the **blocker's centre** (`moveTarget.x - blocker.x`), not to the
   **enemy's position** (`moveTarget[axis] - position[axis]`). Centre-relative is *stable* as the
   enemy moves; enemy-relative is what flips mid-slide and caused F-1510-1.
2. It is **gated on the goal lying inside the blocker's padded span**, i.e. on the head-on geometry
   itself — the exact condition the deadband was trying and failing to detect via a magnitude.

It is scoped by `ACTIVE_TILE_ID`, shipped `a26454d4c` (*runner(lane-c): f1441-2-crossings-keep-their-z*,
2026-08-04), and it is green. **The reusable lesson: this class of conflict has already been solved
once in this file by scoping on GEOMETRY, and the factory then spent a fire trying to solve it with a
SCALAR.** A master proposing a mechanism should be required to say why the existing mechanism for the
same problem does not apply.

**Recommendation for the next corrective:** test whether generalising the centre-relative,
span-gated branch off `ACTIVE_TILE_ID` (making it apply to any blocker whose padded span contains
the goal) greens both specs. That is a different axis from the one just exhausted, and it has a
shipped green precedent. **Not authored this fire — I am at no authoring cap, but this needs the
four `landmarkBlockers()` consumers (F-1510-2) in its battery, and choosing that battery honestly is
the larger half of the work.**

### F-1511-3 — the master's stated rationale had the geometry backwards, and the report refuted it without saying so.

Non-blocking; recorded so the premise is not recycled. The master (line 55) reasoned: *"the wedge
case F-BW-10 cured has a **large** goal-relative delta … while the head-on stall has a delta
oscillating around zero. A deadband should separate them."* The arms show the opposite ordering: the
head-on landmark case needs the threshold **above 3.856** to pass, so its delta is the *large* one at
the moment that matters. The runner found this by testing beyond the master's suggested "~1 world
unit" range — had it stayed inside the suggested range, all arms would have read "too narrow" and the
negative result would have looked like an under-explored range rather than a proof. **Credit where
it is due: exceeding the master's suggested range is what made this a proof.**

## Merge classification

Base: `main` at `3cef0dba3`. Single file `docs/bench/f1510-1-blocker-slide-deadband.md`,
**LANE-TOUCHED only** — created on the lane, never existed on main, no conflicts possible.
`git merge --no-ff` clean via ort. No MAIN-MOVED paths. No BOTH-MOVED paths.

## Gazette / deploy

**No gazette item** — docs-only, no player-visible change (filter law).
**No deploy** — no gameplay code merged.
