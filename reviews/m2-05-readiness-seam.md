# m2-05-readiness-seam — drain review (s1035, 2026-07-25)

**Slice:** `lane-m2-05-readiness-seam.md` (FIRE-AUTHORED s1032, REFRESHED s1033 — attempt 2)
**Branch:** `lane/e2-arsenal` · **Tip:** `ff770d32` · **Base:** `fea5e885` (strict ancestor of main)
**Merged onto:** main `17ef6f7c`

## VERDICT: MERGED — **PARTIAL CLOSE, NOT A CLOSE.** The fix is real and halves the flake, but F-1030-1 is still alive at 3/12 on the merged tree, and the lane's "3/3 in all four shapes" does not reproduce here.

## What it does

One test-only file. Two measurement changes to *when* the renderer guard samples, exactly as the master
ordered — no tolerance widened, no assertion relaxed, no `src/` byte moved:

1. **Baseline is no longer sampled mid-load.** `page.waitForFunction` on
   `canvas.dataset.run3dPilotState ∈ {ready, lite, failed}` (any terminal state, per scope-2 — demanding
   `ready` would hang a `lite` machine), placed *after* the sentry is placed, plus **two warm-up
   wreck/repair cycles** before the baseline snapshot, because the runner measured the ready path as
   lifecycle-lazy: the first GLB-backed lifecycle registers its geometry after a naive wait.
2. **`after` is no longer sampled mid-flight.** New `waitForRendererSettle()` = `waitForSim(0.9)` **plus**
   an observable settle condition (`vfx.activeFloatTexts === 0` ∧ `agent.embodiment.drifting === false` ∧
   `spriteAnimations['char.prospector_agent'].fadeActive !== true`), applied to **both** snapshots.
   The runner's own justification for going observable rather than timed is worth keeping:
   *"`Vfx.update` consumes presentation delta, while the test's `waitForSim` observes the ×8 simulation
   clock — a nominal 0.8 simulated seconds is therefore not a real 0.8-second VFX settle."* That is a
   correct reading of the seam and it is why scope-3's "wait longer than `FLOAT_DURATION`" was
   implemented as a condition instead of a number.

Negative control, in-lane (scope 4): a temporary mutation retaining expired sprites made the **unchanged**
draw-call assertion fail at baseline 91 → after 94, limit 93; mutation reverted, guard green. The guard
still bites.

## Evidence — measured on the MERGED tree this fire (not inherited)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (asset-diet ran: 235 GLBs 84% cut, 53 PNGs 87% cut) |
| **Slice, in-suite** (full file, both projects, `--workers=1`) | **14/14 green** |
| **Slice, isolated desktop** (`-g` the renderer test, `--workers=1`, 3 runs: ×3, ×3, ×6) | **9 pass / 3 FAIL** |
| **Slice, isolated mobile** (`--workers=1`, ×3 + ×3) | **6/6 green** |
| Adjacent (`m1-01-first-claim`, `m2-01-fixture-coordinate`, `run3d-turret`, `run3d-assay-bench`), both projects | **16/16 green** |
| Console/page errors | zero on both viewports (the spec's own `:363-364` assertions passed in every run) |

**All three residual failures carry one fingerprint:** `:361`
`expect(after.renderer?.geometries).toBe(baseline.renderer?.geometries)` — **Expected 94, Received 95**.
That is F-1030-1's original symptom at its new line number (the file grew +13 lines; pre-merge it was
`:348`). It is **not** a new defect and **not** the draw-call mode.

### The control that makes "improvement" a measurement instead of a claim

I re-served the **pre-merge** version of the file from `HEAD` and ran the identical desktop-isolated shape
×6 on the same machine, same load, minutes apart:

| Version | Desktop isolated | Failure line | Reading |
|---|---|---|---|
| **pre-merge main** (`HEAD`) | **3 fail / 6** (50%) | `:348` | 94 → 95 |
| **merged (this slice)** | **3 fail / 12** (25%) | `:361` | 94 → 95 |

So the slice **halves** the flake rate and closes the in-suite and mobile shapes outright — but does not
close the desktop-isolated one. The durable record put desktop-isolated at 2/2 (s1030) and 2/3 (s1033);
my pre-merge control reads 3/6, which is the same order of magnitude and confirms the record rather
than contradicting it.

## Merge classification

Single file, `git diff --stat fea5e885 ff770d32` = `e2e/m2-05-base-damage-repair.spec.ts` only
(+19/−6). `git diff fea5e885 main -- <that file>` was **empty** → main never moved it since the lane's
base, so this is **LANE-TOUCHED only, zero MAIN-MOVED, no conflict, no graft**. Adopted by content
(`git show ff770d32:<path>`), verified byte-diff before and after the pre-merge control swap.
Zero `src/` bytes → the shipped bundle is byte-identical to pre-merge main → **no deploy, no gazette
item** (both laws checked; neither triggers on a test-only merge).

## Findings

### F-1035-1 (REAL, open — the deliverable is half-delivered, and the lane's own number does not reproduce)
The master's gate was *"F-1030-1/F-1032-2 close"*. **F-1032-2's second race (transient floats / draw
calls) IS closed** — nothing tripped `:362` in 18 desktop + 12 mobile attempts, and the in-suite shape
that used to trip it is 14/14. **F-1030-1's first race (geometry 94→95) is NOT closed** — it survives at
3/12 desktop-isolated on the merged tree.
**The runner reported 3/3 in all four shapes; on main it is 9/12 in one of them.** I am not calling that
report dishonest — the same binary, on the same machine, at a different hour, produced 0/6 failures for
the runner and 3/12 for me; a 25% flake reads clean in a 3-run sample **42% of the time**, which is
precisely why this master demanded four shapes and why 3 repeats was never enough resolution for it.
**The shape that survives is the cold one.** Isolated = this test is the first page load of the worker,
so the sentry-beacon GLB is fetched cold; in-suite, earlier tests have already warmed it into the
browser's HTTP cache and the upgrade lands before the baseline. That is consistent with the residual
being the *same* GLB-upgrade race, merely narrowed by the two warm-up cycles rather than eliminated:
**the wait is on the terrain pilot's state, which does not report the per-buildable GLB's registration.**
**NON-BLOCKING for this merge** (strictly better than what it replaces, test-only, no product risk),
**corrective authored the same fire**: `tasks/lane-m2-05-geometry-settle.md`, queued lane-c, leaf
`m2-05-geometry-settle`.

### F-1035-2 (process, recorded — 3 repeats cannot see a 1-in-4)
This board has now twice accepted `--repeat-each=3` as the gate for a guard whose documented failure
mode is 1-in-3-or-better, and twice been surprised. For any test on the F-1030-3 timing list, **the
acceptance bar is ≥6 repeats of the shape that historically fails**, and a pre-merge control run of the
same shape (as done above) is what turns "it got better" into a number. No task owed; this is a gate-
authoring rule for the next master, and it is written into the corrective.

### F-1030-2 — unmoved, as predicted
`:198` (*"repair dwell spends exact sink…"*, the economy-truth red) passed in every in-suite run this
fire, but it is documented as 1-in-3 and I ran the full file once per project — **that is not evidence
either way**, and I am recording it as unmeasured rather than as closed. Still open.

## Ledger

- `tasks/goals.json` leaf `m2-05-readiness-seam` → `merged` + this hash + outcome (same commit).
- `tasks/BACKLOG.md` F-1032-2 / F-1033-1 lines resolved to this drain; F-1035-1 laddered as the successor.
- Done-move `tasks/done/20260725-142442-lane-m2-05-readiness-seam.md` → `shipped-s1035-…`.
