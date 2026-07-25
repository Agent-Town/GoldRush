# lane-c: make the m2-05 repair-dwell observation a WINDOW, not a coin flip (F-1040-1 / F-1030-2)

**FIRE-AUTHORED s1040 (attended review welcome).**

**Role:** Codex runner, lane-c. **Workdir:** `worktrees/lane-c` (branch `lane/e2-arsenal`).

## READ FIRST
- `e2e/m2-05-base-damage-repair.spec.ts` — the test at `:223`, the assertion at `:233`.
- `src/systems/BuildSystem.ts:689-693` — where `repair.progress` is published.
- `src/game/Balance.ts:792-794` — `repairSeconds`, `repairCostFrac`, `repairRadius`.
- `reviews/m2-05-geometry-settle-attempt2.md` — the sibling race this board just closed, same class.
- `tasks/BACKLOG.md` F-1030-2, F-1030-3, F-1040-1, F-1040-2.

## WHY (evidence, quoted — this is a ROOT CAUSE, not a hypothesis; do not re-derive it)

`e2e/m2-05-base-damage-repair.spec.ts:233` is the **last timing red** in this file now that
F-1035-1's geometry race is closed (`99bd76fd`, s1040):

```
await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.repair.progress ?? 0)).toBeGreaterThan(0);
```
→ **`Expected: > 0, Received: 0`**, after the config's 5s `expect.timeout`.

**Measured by the s1040 drain, not inherited:** it failed **1/2 on an unmodified-main control** run
minutes before the merged run, in the same session, and passes **3/3 isolated** on the merged tree.
So it is order/load-sensitive, pre-existing, and owned by no recent slice (F-1040-1).

**The mechanism, verified at file:line by s1040:**
- `src/game/Balance.ts:792` — `repairSeconds: 1.2`. The dwell is **1.2 SIMULATED seconds**.
- The test boots with **`timescale=8`** (`:224`), so 1.2 sim seconds is **≈150 ms of real time**.
- `src/systems/BuildSystem.ts:693` — `progress` is `this.activeRepairId ? …repairProgress… : 0`,
  and `:1575`/`:1592` zero it on completion. **The value is non-zero ONLY during the dwell.**
- Playwright's `expect.poll` samples on a ~100 ms-and-backing-off interval, each sample paying a
  `page.evaluate` round-trip.

**A ~150 ms window sampled by a ~100 ms poller is a coin flip by construction.** The guard is not
detecting a defect; it is racing one. This is the *same class* as the geometry race the sibling slice
just closed — **a transient sampled at the wrong moment** — and it should be fixed the same way:
change the moment/observability, never the assertion.

**Note what is NOT broken:** repair completion is already covered at `:236` (`wrecked === false`),
`:241` (`wreck.repairs === 1`) and `:242` (hp restored). The `:233` poll exists to prove the dwell is
*observable mid-flight*, which is also what the `repair-ring-mid-dwell` screenshot at `:234` is for.
**Preserve that intent** — do not delete the assertion because completion is covered elsewhere.

## SCOPE (numbered, each testable)

1. **Establish the rate first, as SEPARATE INVOCATIONS (F-1036-2's shape law).** Desktop,
   **full file** (this red appears in the full-file shape, not isolated — isolated is 3/3 green, so
   `-g` on this test alone will hide it), `--workers=1`. **Six separate `npx playwright test`
   invocations**, NOT one with `--repeat-each=6`. Report the six results individually.
   Expect **roughly 1-3 of six** to fail at `:233`. **Do NOT stop over a low count** — a green sample
   is the expected outcome of a warm machine (F-1036-1/F-1040-2), never evidence of absence.
   **STOP-and-report only if the CLASS moved:** a failure at a line other than `:233`, or a received
   value other than `0`.
2. **Instrument the window before changing it.** Sample `build.repair.progress` and
   `build.repair.active` as fast as the harness allows across the dwell (a `page.evaluate` loop or an
   in-page rAF recorder, not `expect.poll`), for a passing and a failing run, and **report both
   series with timestamps**. This is a deliverable even if scope 3 lands: it tells the board how wide
   the real window is, which nobody has measured. If the series shows the window is *already* wide and
   the poll is simply missing it, say so — that would move the fix to the poll interval instead.
3. **Widen the OBSERVATION WINDOW, not the tolerance.** Preferred: raise the dwell for this test only
   via the existing helper — `await setBalance(page, 'wreck.repairSeconds', <N>)` — the test already
   uses `setBalance` at `:225`, so this needs no new machinery. Choose `N` from scope 2's measurement
   and **justify it with that number**, targeting a window comfortably wider than the observed poll
   interval. Lowering `timescale` for this test is an acceptable alternative **if** you show it does
   not slow the file materially. **Either way the assertion at `:233` keeps its exact shape**
   (`toBeGreaterThan(0)` on `build.repair.progress`) — you are making the thing it looks for last long
   enough to be seen, not making the guard easier to satisfy.
4. **Prove the repaired guard can still fail — PRIMARY ACCEPTANCE EVIDENCE, not a footnote.**
   Mandatory. A temporary local mutation that genuinely prevents the dwell from starting (e.g. teleport
   the hero outside `repairRadius: 1.4` before the poll) must turn `:233` **red**; revert it and verify
   the revert **two ways** (`git diff` clean **and** a `grep` for your marker returning nothing).
   **A deterministic can-it-still-fail proof outranks any number of green runs** — that principle
   closed F-1026-1, F-1026-5, F-1029-3, F-1032-1 and F-1035-1. Green runs corroborate; they never
   certify. **s1038 shipped a left-in mutation control once (F-1036-2) — the drain WILL read your
   whole diff for one, so leave none.**
5. **Report the four-shape table** — desktop/mobile × isolated/full-file — plus the scope-2 series.
   **Six separate invocations for the desktop full-file shape** (scope 1); `--repeat-each=6` is
   acceptable for the other three. **State plainly that the table is corroboration, not proof.**

## FIREWALL
**TOUCH-ONLY:** `e2e/m2-05-base-damage-repair.spec.ts`.

**NO:**
- **Do not weaken `:233`.** No `toBeGreaterThanOrEqual(0)`, no `|| true`, no widened `expect.poll`
  timeout as *the* fix, no deleting it because completion is asserted later. The number is right; the
  window is too short. **Reject-don't-stretch** — this board has closed that class five times.
- **Do not touch the geometry guard or its helper** (`waitForRendererSettle` at `:93-116`, the adaptive
  warm-up at `:350-363`, the assertions at `:388-390`). It was merged **this fire** (`99bd76fd`) with a
  mutation-control proof. Build beside it, not over it.
- **No `src/` changes.** Changing `Balance.repairSeconds` globally would alter **gameplay feel** for a
  test's convenience — that is an owner decision, not a test fix. Use the per-test `setBalance` helper.
  If your evidence genuinely forces a `src/` change, **STOP and report** — that is a real product
  finding and it belongs to the owner.
- Do not `test.skip`, delete, or comment out any assertion. No bare `waitForTimeout` as the fix.
- Do not touch any other expected number on this board: `m2-01`'s **200** draw calls, `m1-01`'s **77**
  geometries, `asset-diet`'s **25,000,000** bytes, `e5-deepwater-claim`'s resource guard.
- No refactors, no drive-by tidying, no other suites.

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content
is already merged to main (verify via `git log`/`git diff`), it is a SAFE DUPE →
`git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead
commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds
uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green
before touching anything.

**Pre-proved for you (s1040, from the drain itself):** `lane/e2-arsenal` tip **`f992ebab`** is exactly
one commit ahead of base `69f0cd80`, and **that commit's entire content — the single file
`e2e/m2-05-base-damage-repair.spec.ts` — was merged to main by s1040 as `99bd76fd`**, verified by
`git log 69f0cd80..main -- <file>` (empty before the merge) plus a content diff showing the file drop
out of `git diff main lane/e2-arsenal` afterwards. Textbook SAFE DUPE; reset and proceed.
*(Honest limit: the lane worktree's uncommitted-dirt state was NOT independently probed —
`git -C` on the worktree is permission-gated for fires. `git clean -fd` covers residue, but treat
anything you find there as a finding worth reporting, not as expected.)*

## No-op guard
If you find yourself about to exit without changes, **WRITE WHY into your report first.** A green
scope-1 sample is **NOT** an acceptable reason to stop — this defect reads green on a warm machine and
two fires have already been fooled by exactly that (F-1036-1, and s1040's own control disagreeing with
the runner's 6/6). **A no-op is acceptable only under a scope-1 CLASS change** (failure at a line other
than `:233`, or a received value other than `0`). **Scope 2's series is itself a deliverable**: a run
that measures the window precisely and patches nothing is NOT a no-op, provided the series is reported.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` + `npm run build` green.
**The slice's own gate:** `e2e/m2-05-base-damage-repair.spec.ts` green **desktop + mobile**, run **both
isolated and as the full file**, at `--workers=1`. **Desktop full-file must be six SEPARATE
invocations** (scope 1); the other three shapes may use `--repeat-each=6`. **Report all four numbers**,
labelled corroboration — **scope 4's mutation control is the acceptance evidence.**
Adjacent unmodified-green both projects at `--workers=1`: `e2e/run3d-turret.spec.ts`,
`e2e/run3d-assay-bench.spec.ts`, `e2e/m1-01-claim-jumpers-death.spec.ts`,
`e2e/m2-01-build-menu.spec.ts` — **38 tests across both projects, s1040's measured merged-tree number,
so a deviation is yours.** (The older masters' "16 tests" and the filenames
`m1-01-first-claim.spec.ts` / `m2-01-fixture-coordinate.spec.ts` are **STALE — those files no longer
exist on main**, verified by `ls` in s1040.)
Zero console/page errors on both viewports.

End: **READY-FOR-GATES** + report: the scope-1 rate **as six separate invocation results**, the scope-2
progress/active series with timestamps for a passing AND a failing run, the window value you chose and
the measurement that justifies it, **the scope-4 can-it-still-fail proof (the acceptance evidence)**,
and the four-shape table labelled as corroboration.
