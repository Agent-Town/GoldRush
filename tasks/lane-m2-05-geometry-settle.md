# lane-m2-05-geometry-settle — the baseline must wait for the sentry's own GLB, not the terrain pilot's

**FIRE-AUTHORED s1035 (attended review welcome).**
**Role:** Codex runner, lane-c. **Workdir:** `worktrees/lane-c` (branch `lane/e2-arsenal`).

> **THIS IS A SUCCESSOR, NOT A RETRY.** `lane-m2-05-readiness-seam` SHIPPED (s1035 drain,
> `reviews/m2-05-readiness-seam.md`) and closed **one** of its two races. Its fix is on main and you are
> building on top of it — **do not revert it, do not re-derive it.** What is left is a single, named,
> measured residue.

## READ FIRST (paths, in this order)
- `reviews/m2-05-readiness-seam.md` — the drain that produced this task's entire premise, including the
  pre-merge control run. Read the Findings section first.
- `e2e/m2-05-base-damage-repair.spec.ts:93-101` (`waitForRendererSettle`, the merged helper),
  `:333` (the terminal-state wait), `:334-341` (the two warm-up cycles), `:342` + `:355` (the two
  settle calls), `:361` (**the assertion that still fails**).
- `src/game/Run3dPilot.ts:25` (the state writer — note **what** it reports) and `:125`.
- `src/game/Game.ts:1640` (Run3d load starts) and `:4424-4428` (the engine's own don't-measure-mid-load
  discipline).
- `CLAUDE.md` §5 Mistake #1 (no-op) and #12 (gate contamination).

## WHY (measured this fire on the merged tree — not a hypothesis, not inherited)

s1035 gated the merged tree and got **3 failures in 12 desktop-isolated runs**, every one of them the
identical fingerprint:

```
:361  expect(after.renderer?.geometries).toBe(baseline.renderer?.geometries)
      Expected: 94   Received: 95
```

That is F-1030-1's original symptom at its new line number. Two facts make the cause specific rather
than a shrug:

1. **The improvement is real and was controlled for.** The pre-merge file was re-served from `HEAD` and
   run in the same shape ×6 on the same machine, minutes apart: **pre-merge 3 fail/6 (50%) at `:348`**
   vs **merged 3 fail/12 (25%) at `:361`**. The merged fix halves it. It does not close it.
2. **The shape that survives is the COLD one.** In-suite is **14/14** on both projects and mobile-isolated
   is **6/6**; only desktop-**isolated** fails. Isolated means this test is the worker's first page load,
   so the sentry-beacon GLB is fetched **cold**; in-suite, an earlier test has already warmed it into the
   browser's HTTP cache and the upgrade lands before the baseline snapshot.

**The mechanism, stated so you do not re-derive it:** `:333` waits on
`canvas.dataset.run3dPilotState ∈ {ready,lite,failed}` — that is the **terrain pilot's** state
(`Run3dPilot.ts:25`). It says nothing about whether the **sentry beacon's** GLB has replaced its
procedural fallback. The two warm-up wreck/repair cycles at `:334-341` usually give that upgrade enough
time, and on a cold fetch they sometimes do not. **The baseline is still, occasionally, sampled before
the geometry it is supposed to count exists.**

## SCOPE (numbered, each testable)
1. **Establish the rate before you touch anything.** Desktop, isolated
   (`-g "wreck and repair cycles leave shooter and renderer counts at baseline"`), `--workers=1
   --repeat-each=6`. Report pass/fail. **Expect roughly 4-5 of 6 to pass** — s1035 measured 25%
   failure across 12. **Do NOT stop over a different count**: 6 samples of a 25% event legitimately
   returns anywhere from 0 to 4 failures. **STOP-and-report only if the CLASS moved:** the failure is at
   a line other than `:361`, or the delta is anything other than **+1 geometry**, or it fails **0/6 twice
   in a row** (in which case say so — the residue may be machine-specific and this task is done by
   measurement rather than by patch).
2. **Diagnose which geometry arrives late — by instrumentation, not by inference.** Sample
   `renderer.geometries` at four points (after the terminal-state wait; after warm-up cycle 1; after
   warm-up cycle 2; at the baseline snapshot) and print the series for a passing run and a failing run.
   **Report both series.** This is the deliverable even if scope-3 lands: it tells the board whether the
   late arrival is the sentry GLB, an LOD, or something no one has named.
3. **Make the baseline wait for the count to be STABLE rather than for an event.** The robust condition
   is *"`renderer.geometries` has not changed across N consecutive sampling ticks spanning ≥1 simulated
   second"*, checked inside the existing `waitForRendererSettle` (which already handles floats, drift and
   fade). A stability wait closes cold-cache variance generically, where an event wait must name every
   possible late producer. **If your scope-2 series shows a cleaner, more honest signal already exposed
   in `__THREE_GAME_DIAGNOSTICS__` — e.g. a per-buildable model/upgrade flag — prefer that and say why.**
   Either way the wait must **time out and fail loudly**, never silently proceed on a machine where the
   count never stabilises.
4. **Prove the repaired guard can still fail.** Mandatory. A temporary local mutation that genuinely
   registers an extra geometry must turn `:361` red; revert it and verify the revert two ways.
   The predecessor's control (retained expired sprites → draw-call assertion red at 91→94, limit 93)
   is the model. **A green run only proves the line executed, never that it still bites.**
5. **Report the four-shape table at `--repeat-each=6`** — desktop/mobile × isolated/in-suite — plus the
   scope-2 series. **6, not 3:** s1035 shipped a partial believing a 3/3 sample, and a 25% flake reads
   clean in three runs ~42% of the time (F-1035-2). Three repeats are below this defect's resolution.

## FIREWALL
**TOUCH-ONLY:** `e2e/m2-05-base-damage-repair.spec.ts`.

**NO:**
- **Do not relax the `toBe` equality at `:361` and do not widen the `+2` draw-call tolerance at `:362`.**
  The numbers are correct; the moment of sampling is wrong. Widening makes the guard stop noticing —
  the exact class this board has now closed four times (F-1026-1, F-1026-5, F-1029-3, F-1032-1).
  Reject-don't-stretch.
- **Do not revert or rewrite the merged s1035 fix** (the terminal-state wait, the warm-up cycles, the
  settle helper). It is measured as a 2× improvement. Extend it.
- **No `src/` changes.** This is a measurement defect; a `Run3dPilot` candidate was already tried and
  reverted once (F-1032-2). If your evidence genuinely forces a source change, **STOP and report** —
  that would be a real product finding and it belongs to the owner, not to a test file.
- Do not `test.skip`, delete, or comment out either assertion. Do not add a bare `waitForTimeout` as the
  stabiliser — a sleep is how this guard becomes vacuous later.
- Do not touch `:198` (**F-1030-2**'s pre-existing repair-dwell red) unless your fix closes it as a side
  effect — if it does, say so with before/after numbers.
- Do not touch any other expected number on this board: `m2-01`'s **200** draw calls, `m1-01`'s **77**
  geometries, `asset-diet`'s **25,000,000** bytes, `e5-deepwater-claim`'s resource guard.
- No refactors, no drive-by tidying, no other suites.

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is
already merged to main (verify via `git log`/`git diff`), it is a SAFE DUPE →
`git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead
commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds
uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before
touching anything.

**Pre-proved for you (s1035, from the drain itself):** `lane/e2-arsenal` tip `ff770d32` is exactly one
commit ahead of its base, and **that commit's entire content — the single file
`e2e/m2-05-base-damage-repair.spec.ts` — was merged to main by s1035 in the drain that authored this
task**, verified by content adoption plus byte-diff. It is a textbook SAFE DUPE; reset and proceed.
*(Honest limit: the lane worktree's uncommitted-dirt state was NOT independently probed —
`git --git-dir/--work-tree` is permission-gated for fires. The `git clean -fd` above covers residue, but
treat anything you find there as a finding worth reporting, not as expected.)*

## No-op guard
If you find yourself about to exit without changes, WRITE WHY into your report first. **A no-op is only
acceptable under a scope-1 class change** — specifically the "0/6 twice in a row" branch, which is a
legitimate and useful answer (it would mean the residue is machine-dependent and the board should stop
paying for it). Anything else means the deliverable was not attempted. **Note that scope-2's
instrumentation series is itself a deliverable**: a run that diagnoses precisely and patches nothing is
NOT a no-op, provided the series is in the report.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` + `npm run build` green.
**The slice's own gate:** `e2e/m2-05-base-damage-repair.spec.ts` green **desktop + mobile**, run **both
isolated and as the full file**, each at `--workers=1 --repeat-each=6`. **Report all four numbers.**
Adjacent unmodified-green both projects at `--workers=1`: `e2e/m1-01-first-claim.spec.ts`,
`e2e/m2-01-fixture-coordinate.spec.ts`, `e2e/run3d-turret.spec.ts`, `e2e/run3d-assay-bench.spec.ts`
(16 tests — s1035's merged-tree number, so a deviation is yours).
Zero console/page errors on both viewports.

End: **READY-FOR-GATES** + report: the scope-1 pre-fix rate, the scope-2 geometry series for a passing
AND a failing run, what stabilisation condition you chose and the measurement that justifies it, the
scope-4 can-it-still-fail proof, whether `:198` moved, and the four-shape table at `--repeat-each=6`.
