# lane-m2-05-wreck-repair-drift — the wreck/repair cycle leaks, and it leaks two different ways

**FIRE-AUTHORED (attended review welcome)** — s1030, 2026-07-25
**Role:** resource-leak diagnosis + fix. **Workdir:** `worktrees/lane-c` (lane branch `lane/e2-arsenal`).

## READ FIRST (paths, not memory)
- `e2e/m2-05-base-damage-repair.spec.ts:319-352` — the guard. Baseline captured at **:330-333**,
  three wreck/repair cycles at **:335-342**, the two assertions that fail at **:348** and **:349**.
- `reviews/m2-01-fixture-coordinate.md` — finding **F-1030-1**, the evidence table this task exists to act on.
- `tasks/BACKLOG.md` — **F-1029-1** (the original sighting) and **F-1030-1/2/3**.
- `src/game/BuildSystem.ts` + the wreck/repair path in `src/game/Game.ts` — where a cycle allocates and should free.

## WHY (evidence, quoted and dated)
`m2-05:319` *"wreck and repair cycles leave shooter and renderer counts at baseline"* has been red
on a **signed-off M2 milestone**. s1029 recorded it as a *"+1 geometry drift, desktop only; mobile
green."* The s1030 drain re-measured it and found that description is **half right, and the wrong
half has already cost one innocent drain an attribution argument** — the test fails on **both**
projects, through **two different assertions**:

| Project | Failing line | Assertion | Reading | Repeatability |
|---|---|---|---|---|
| desktop-chrome | **348** | `geometries` `toBe` baseline | expected **94**, received **95** (**+1**) | **2/2 — deterministic** |
| mobile-chrome | **349** | `calls` ≤ baseline **+2** | expected **≤69**, received **70** (**+3**) | 1/2, 1/3 — intermittent |

A third mode, measured in the same drain: running the **whole file** at `--workers=1`, **desktop**
trips **:349** instead (baseline 89 → received 93) while its geometries pass. Baselines move with
test order — **94 isolated vs 89 in-suite** — so which assertion trips depends on what ran before.

Both modes reproduce on **clean main** with s1030's change reverted, so neither belongs to any
recent slice. This is old, real, and it is the last red on the M1/M2 guard pair
(F-1026-5's other half closed in `df51d877`).

**The through-line: three wreck/repair cycles do not return the renderer to where they found it.**
One cycle appears to keep a geometry alive on desktop, and to leave draw calls elevated on mobile.

## SCOPE (numbered, each testable)
1. **Reproduce both modes and say which is which.** Run `:319` isolated and in-suite, each project,
   `--repeat-each=3`. Report a table of which line failed, the expected/received numbers, and the
   hit rate. If your readings disagree with the table above, **say so plainly — that is a finding,
   not a failure.**
2. **Find what a single wreck/repair cycle allocates and does not release.** Instrument or bisect —
   do not guess. Name the exact object (geometry, material, mesh, or registration) and the code
   site that creates it, at `file:line`. A cycle is wreck → (debris/ruin visuals) → repair →
   (restored visuals); the leak is something one half creates that the other half does not dispose.
3. **Fix it at the source.** Dispose or reuse what the cycle orphans, so a repaired building
   returns the renderer to its pre-wreck state. Prefer reuse over dispose-and-recreate where the
   codebase already pools (follow the existing pooling idiom rather than inventing one).
4. **Explain the mobile draw-call mode.** If your fix in (3) closes it too, prove it with the
   numbers. If it does **not**, diagnose it separately and report — a different renderer path
   (batching/instancing that fails to re-merge after repair) is the likely shape. **A diagnose-only
   return on the mobile draw-call half is an AUTHORIZED outcome** if scope 3 lands the desktop
   geometry fix cleanly; say so explicitly in your report rather than stretching.
5. **DO NOT weaken either assertion.** The `toBe` equality at :348 and the `+2` tolerance at :349
   stay exactly as written. A guard edited to fit its measurement is not a guard — that is
   precisely the defect s1030 just finished repairing next door in `m2-01`. If the honest post-fix
   numbers still miss, that is a REAL finding to report, not a number to adjust.

## FIREWALL
**TOUCH-ONLY:** the wreck/repair implementation in `src/game/` (expected: `BuildSystem.ts` and/or
the building-visual path in `Game.ts`) — plus `e2e/m2-05-base-damage-repair.spec.ts` **only** if you
add a diagnostic assertion; its two existing assertions and all baseline arithmetic are frozen.
**NO:** the `:348`/`:349` assertions or the `+2` tolerance · `Balance.ts` · repair cost/economy
semantics (Economy is the sole gold writer) · combat or damage resolution · `m1-01` / `m2-01`
guards and their expected numbers (both green as of `df51d877` — they are load-bearing) ·
any other spec · the `warmVfx` hook (`f7cd0103`, freshly landed and relied on by this very test at
spec:321).

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

**Pre-proved for you (s1030, so you need not spend budget on it):** `lane/e2-arsenal`'s tip
`e3d81fb6` is the asset-diet-gate-honesty slice, which s1029 merged to main as `9ba65911`.
`git diff main lane/e2-arsenal --stat -- src e2e` shows **pure main-ahead deletions with zero
lane-unique additions** (the lane simply lacks `f7cd0103`'s `Game.ts` warmVfx work and
`df51d877`'s `m2-01` fixture line). It is therefore a **SAFE DUPE** — confirm, then proceed.

## No-op guard
If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` + `npm run build` green.
**The slice's own gate, and it is deliberately stricter than usual because this test lies at 1-in-3:**
`e2e/m2-05-base-damage-repair.spec.ts` green **desktop + mobile**, at `--workers=1`, **both
isolated (`:319 --repeat-each=3`) and as a full file** — four green runs, no exceptions, numbers
reported for each.
Adjacent unmodified-green both projects at `--workers=1`: `e2e/m2-01-build-menu.spec.ts` (14/14,
its `:322` draw-call ceiling was just repaired and must stay at **182 desktop / 160 mobile** vs 200)
and `e2e/m1-01-claim-jumpers-death.spec.ts` (8/8, its `:70` geometry guard is the sister assertion
to this one and must not move off **77**).
**Known pre-existing red, NOT yours — do not fix it and do not count it against you:**
`m2-05:198` (*"repair dwell spends exact sink…"*, `Expected: > 0, Received: 0`, ~1-in-3 on clean
main) = **F-1030-2**. If your work happens to explain it, report that as a bonus finding.
Zero console/page errors. Screenshot of a repaired beacon after three cycles to
`reviews/shots-m2-05-drift/`.

End: **READY-FOR-GATES** + report: the object that leaked and its `file:line`, whether the mobile
draw-call mode closed with it or needs its own slice, and the before/after numbers per project for
both assertions.
