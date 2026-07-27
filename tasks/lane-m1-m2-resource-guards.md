# Task lane-m1-m2-resource-guards: THE TWO RED GUARDS ON MAIN (geometry leak + draw-call ceiling) — LANE-A, commit prefix "fix:"

> ⛔ **SHIPPED / PREMISE CLOSED — DO NOT QUEUE (retired s1115, 2026-07-27).** On main as drain **`f7cd0103`** (runner `d93b1505`): "the M1 geometry leak was async upload…", plus `df51d877` for the m2-01 half. Its whole premise — "THE TWO RED GUARDS ON MAIN" (F-1026-5) — is closed: the s1108 `m2-05-debt-batch` run independently re-verified **M1/M2 resource guards + full m2-05 spec 36/36 green desktop+mobile** on `eef67e5b` and lawfully changed nothing. Invisible to filename greps because drain messages drop the `lane-` prefix — see **F-1115-1**.

### FIRE-AUTHORED (attended review welcome) — s1026, 2026-07-25

You are Codex, implementer for Gold Rush (worktrees/lane-a).
CODEX: model=gpt-5.6-sol effort=high

## PRE-FLIGHT (SAFE-DUPE — copied VERBATIM from `.claude/skills/author-task/SKILL.md` §3, LANE slots)
> Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B <lane-branch> main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

**s1027 correction — READ THIS, it is why you are running a second time.** The first attempt at this
task (2026-07-25 10:58, log `logs/runs-archive/20260725-105857-lane-a-lane-m1-m2-resource-guards.md.log`)
STOPPED at pre-flight and changed nothing. It was **not Codex's fault and not a real blocker**: the
s1026 master paraphrased the template above into "`git log main..HEAD` must be EMPTY, else STOP",
which on this repo is a permanent brick — lanes land by SQUASH merge, so a lane branch is
*expected* to read ahead forever after its work merges. Your predecessor obeyed that wording
correctly and stopped. The template above is the real law (F-1027-1).

**Already verified for you by s1027 — do not spend budget re-deriving it, but do sanity-check it:**
`lane-a` sits on branch `lane/m3`, 1 ahead of main at `6be3964c "perf: diet build assets..."`.
That commit is the ASSET DIET, which was squash-merged to main as `0dfa1d3f` on 2026-07-25. Proof:
its file list and `0dfa1d3f`'s file list are **identical (22 files)**, `scripts/asset-diet.mjs` and
`src/assets/AssetLoading.ts` are both present on main, and `git diff 6be3964c 0dfa1d3f` shows
**zero lane-unique lines** on the asset-diet surfaces (only main-side newer content from work that
merged before the squash, plus regenerated screenshot binaries). **`6be3964c` is therefore a
textbook SAFE DUPE.** Per the template: `git checkout -B lane/m3 main && git clean -fd`, then
PROCEED into the task below. (`node_modules/` is gitignored, so `clean -fd` will not remove it.)

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
