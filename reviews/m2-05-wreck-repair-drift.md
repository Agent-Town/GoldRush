# m2-05-wreck-repair-drift — F-1030-1 / F-1030-2 diagnosis

**Slice:** m2-05 renderer drift (the +1 geometry leak and the draw-call tolerance red)
**Branch:** `lane/e2-arsenal` (lane-c) · **Tip:** `c07f749a` · **Base:** `main`
**Master:** `tasks/lane-m2-05-wreck-repair-drift.md` (FIRE-AUTHORED s1030)
**Drained by:** s1032 fire, 2026-07-25

## VERDICT: MERGE AS A DIAGNOSTIC NO-OP — and the diagnosis is worth more than a fix would have been. **There is no wreck/repair resource leak. The guard has been measuring two race conditions.**

## What it does

Nothing, to production code — deliberately, and it says so. `git show c07f749a --stat` is **one file,
a screenshot, zero insertions to any source or spec**. That is the correct outcome here, and the
master's no-op guard was satisfied in full: the WHY is written out at file:line rather than left as
a shrug.

**The suspected wreck/repair leak does not exist.** Object-level instrumentation on clean `main`
attributed both readings to independent timing:

1. **Geometry `94 → 95` is an async load finishing after the baseline snapshot.** The extra
   registered geometry is the **Run3d sentry-beacon GLB cylinder** replacing its procedural
   fallback (`src/game/Game.ts:1640`, `src/game/Run3dPilot.ts:125`) — not debris, not the repair
   ring, not a cycle-created orphan. Run3d begins loading in `Game.ts` while the frozen `warmVfx`
   seam waits only for the terrain pilot, so the snapshot can be taken mid-load.
2. **The elevated draw calls are transient pooled sprites, still on screen by design.** Repair-cost
   floats are emitted per repair at `src/systems/BuildSystem.ts:1266`
   (`this.onFloatText?.(buildingPosition, \`-${cost}\`, '#a0522d')`) and each lives
   **`FLOAT_DURATION = 0.8`** simulated seconds (`src/systems/Vfx.ts:20`). Three accelerated repairs
   therefore leave up to three `Vfx/Sprite` quads — plus `ProspectorSpriteFade` — alive at the exact
   moment the renderer is sampled.

**I verified both load-bearing claims by file-probe rather than accepting the report** (§1
VERIFY-DON'T-INHERIT): `FLOAT_DURATION = 0.8` is real at `Vfx.ts:20`, and the per-repair float call
is real at `BuildSystem.ts:1266`. The diagnosis is internally coherent and matches the numbers.

**The runner tested a candidate fix and then threw it away, correctly.** A hide-and-reuse change in
`Run3dPilot` avoided recloning a repaired building but closed **neither** gate; independent review
reproduced both failures with it in place, so it was reverted rather than retained. Keeping an
unrelated behavioural change that does not fix the thing it was written for is how silent scope
creep enters a codebase — this is the right call, and it is the second time this week a lane has
correctly preferred a no-op to a plausible non-fix.

## Evidence

Reported by the runner, from clean `main` (numbers are its own, reproduced across four run shapes):

| Run | Desktop | Mobile |
|---|---|---|
| Clean isolated ×3 | calls `89→92`, 2/3 fail | calls `65→68/70/69`, 3/3 fail |
| Clean full-file ×3 | geometry `94→95`, 1/3 fail | calls `65→69`, `66→69`, 2/3 fail |
| Candidate isolated ×3 | calls `89→92` ×2, geometry `94→95` ×1, 3/3 fail | calls `67→70`, 1/3 fail |
| Candidate full-file ×3 | geometry `94→95`, 1/3 fail | calls `66→70`, 1/3 fail |

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | passed (runner) |
| `npm run build` | passed (runner) |
| Adjacent `m1-01` + `m2-01`, both projects | **22/22 passed** |
| Full repeated candidate run | 39/42, including the documented pre-existing `:198` red (F-1030-2) |
| Screenshot | `reviews/shots-m2-05-drift/repaired-beacon-three-cycles.png` |

**Merge-side gate note, stated honestly:** this merge adds **one PNG and no code**, so it cannot
move `tsc`, the build, or any suite. I did not re-run the battery for it and I am not claiming to
have. Main's `tsc --noEmit` and `npm run build` were both green minutes earlier in this same fire
(the F-1029-3 drain, `7a020e66`) on a tree otherwise identical to this one.

**The variance is why this took three fires to pin down:** these reds are 1-in-3 to 3-in-3 depending
on project and run shape. F-1030-1's warning holds — a 1-in-3 red reads green two times out of
three, and any fire that gates this file once and calls it clean will be wrong two-thirds of the
time.

## Merge classification

| File | Class |
|---|---|
| `reviews/shots-m2-05-drift/repaired-beacon-three-cycles.png` | **LANE-TOUCHED** — the lane's only unique content |
| everything else in `git diff main lane/e2-arsenal` (72 files) | **MAIN-MOVED-ONLY** — s1031/s1032 work the lane never had, incl. `tasks/lane-e5-deepwater-resource-guard.md` |

No conflicts. Copied the one file from the lane worktree; no 3-way graft needed.

## Findings

**F-1032-2 (REAL, ownership reassigned — corrective authored this fire).** F-1030-1 and F-1030-2 are
**measurement defects, not gameplay defects**, and they belong to the readiness seam the m2-05
master explicitly firewalled off. The guard samples the renderer at a moment that is not yet stable:
it must (a) snapshot only once Run3d has reached a **terminal** state rather than mid-GLB-load, and
(b) sample draw calls only after transient repair floats have **settled** past their 0.8s dwell. The
lane could not fix this because the seam was frozen for it; that firewall was right for m2-05 and is
now the thing standing in the way, so the corrective owns the seam directly. Master:
`tasks/lane-m2-05-readiness-seam.md`, queued to lane-c.

**Standing caution carried forward:** the corrective must not "fix" these by widening the
tolerance or relaxing the geometry equality. The numbers are correct; the *moment they are taken*
is wrong. Waiting for readiness is the fix — a wider tolerance would only make the guard stop
noticing, which is precisely the F-1029-3 / F-1026-1 defect class this board keeps finding.
