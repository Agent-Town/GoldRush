# Task lane-m1-m2-resource-guards: THE TWO RED GUARDS ON MAIN (geometry leak + draw-call ceiling) — LANE-A, commit prefix "fix:"
### FIRE-AUTHORED (attended review welcome) — s1026, 2026-07-25

You are Codex, implementer for Gold Rush (worktrees/lane-a).
CODEX: model=gpt-5.6-sol effort=high

## PRE-FLIGHT (SAFE-DUPE — do this before anything else)
1. `git -C worktrees/lane-a status --short` and `git log --oneline -1`.
2. Confirm the lane branch holds nothing unmerged: `git log main..HEAD --oneline` must be EMPTY.
   **If it is NOT empty, STOP and report** — a predecessor's undrained work is sitting there and
   resetting would destroy it (the Reset Massacre, CLAUDE.md §5.2). Do not reset over content.
3. Only when that is empty: sync onto current main and begin.

## READ FIRST
- `reviews/deepwater-wave-counter.md` §Findings **F-1026-5** — the measurements below are from there.
- `e2e/m1-01-claim-jumpers-death.spec.ts` (the failing assertion is at **:70**)
- `e2e/m2-01-build-menu.spec.ts` (the failing assertion is at **:322**)
- `src/game/Game.ts` restart/teardown path · the enemy pooling/recycle path · `src/game/BuildSystem.ts`
  palisade/beacon instancing.

## WHY (evidence, dated — do not re-litigate this, it is measured)
Two guards on **signed-off M1/M2 milestones** are RED on main as of 2026-07-25, found by the
s1026 fire while gating adjacents:

- `m1-01-claim-jumpers-death.spec.ts:70` *"double restart recycles enemies without geometry growth"*
  → **expected 77 geometries, received 87** (+10 across restarts = a leak; the test's whole point
  is that a restart must RECYCLE, not accumulate).
- `m2-01-build-menu.spec.ts:322` *"stress draw calls stay under 200 with palisades and beacons"*
  → ceiling assertion returns **false**.

Both fail on **desktop AND mobile**, and both **reproduce at `--workers=1`** — they are NOT
contention flake. Ownership is already settled by a three-point bisect, so do not spend budget
re-deriving it: merged tree RED · HEAD-without-lane-b RED · `4d75f675` (pre-advance-stream) RED.
**Neither slice drained on 2026-07-25 caused these.** Something merged earlier leaks geometry
across restarts and/or broke a batching path. These are memory/perf guards on shipped milestones —
a geometry leak across restarts is exactly the class that ends a long play session badly.

## SCOPE (numbered, each testable)
1. **Reproduce both, single-worker, and write the numbers into your report** (geometry count and
   draw-call count, desktop and mobile). Start from the truth, not from this file.
2. **Find the geometry leak.** The count moves 77→87 across a double restart. Identify WHICH ten
   geometries survive a restart and why — dispose that is missed, a pool that re-creates instead of
   recycling, or a cache keyed per-run. Name the exact site in your report.
3. **Fix the leak at its source.** Restart must return to the same geometry count it started from.
   Do NOT raise the expected number in the test to make it pass — the number is the contract.
4. **Diagnose `m2-01:322`.** Report the actual draw-call count and what pushed it over 200
   (palisade or beacon instancing regressed, a material split, a per-instance mesh). Fix it if the
   cause is the same leak or a small batching regression; **if it needs an architectural change,
   STOP after the diagnosis, report it, and leave the test red** — say so plainly rather than
   stretching scope.
5. Both suites green desktop + mobile at `--workers=1`, with the original expected values intact.

## FIREWALL
TOUCH-ONLY: `src/game/Game.ts` · the enemy pool/recycle module · `src/game/BuildSystem.ts` ·
`src/render/` instancing helpers ONLY if that is where the leak lives (name it in the report).
NO: changing either test's expected numbers · sim semantics / balance / wave scheduling ·
`AdvanceStream.ts` or the asset-diet paths (untouched today, keep it that way) · new deps
(a fire cannot gate `npm install` — F-1024-4).

## SELF-CHECK before you report
- `npx tsc --noEmit` clean · `npm run build` green.
- `npx playwright test e2e/m1-01-claim-jumpers-death.spec.ts e2e/m2-01-build-menu.spec.ts
  --project=desktop-chrome --project=mobile-chrome --workers=1` — green, original numbers.
- Adjacent unmodified-green, both projects, `--workers=1`:
  `e2e/m2-01-build-menu.spec.ts` siblings, `e2e/task-025-bandits-dont-swim.spec.ts`,
  `e2e/e5-deepwater-claim.spec.ts`, `e2e/_s106-prospector-boot-probe.spec.ts`.
- Zero console/page errors. **Cap workers at 1–2**: uncapped sweeps on this repo manufacture
  false reds (F-1026-2).
- A before/after table: geometry count and draw calls, desktop and mobile.

END: READY-FOR-GATES + the before/after table + the named leak site (and, if scope item 4 stopped
at diagnosis, exactly what it would take).
