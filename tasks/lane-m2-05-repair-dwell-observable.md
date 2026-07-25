# lane-c: make the m2-05 repair-dwell observation a WINDOW, not a coin flip — BOTH SITES (F-1040-1 / F-1040-3 / F-1030-2)

**FIRE-AUTHORED s1040, REFRESHED s1041 (attended review welcome). ATTEMPT 2 — changed premise per CLAUDE.md §7.5.**

**Role:** Codex runner, lane-c. **Workdir:** `worktrees/lane-c` (branch `lane/e2-arsenal`).

## WHAT CHANGED SINCE ATTEMPT 1 (read this first — an identical retry is forbidden and would just stop again)

Attempt 1 (`tasks/runs/20260725-182151-lane-c-*.log`) did **everything right and stopped**, because
**my stop clause was mis-keyed — that is my defect, not yours (F-1040-3).** It ran baselines
**7/7, 7/7, then 6/7 with the failure at `:260`**, and halted invocations 4-6 exactly as ordered:
zero diff, clean worktree, WHY written. A **lawful** no-op.

But `:260` was never a class change. s1040 probed it and s1041 re-probed it — **`:233` and `:260` are
the BYTE-IDENTICAL assertion:**

```
await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.repair.progress ?? 0)).toBeGreaterThan(0);
```

same fingerprint `Expected: > 0, Received: 0` after the 5s poll timeout. **One root cause, two sites.**
So this refresh does exactly two things: **(1) the stop clause is re-keyed to the root-cause CLASS**
instead of a line number, and **(2) scope 3 now fixes BOTH sites.** The diagnosis below is unchanged
and **pre-verified — do not re-derive it.**

*(The lesson, recorded so it does not repeat: F-1033-1 said stop clauses belong on the root-cause
class, never on a brittle proxy. I avoided a pass/fail count and then used a **line number**, which is
just as brittle the moment a defect has two sites. Your run bought that second site for free — an
isolated or `-g`-scoped run could never have surfaced it.)*

## READ FIRST
- `e2e/m2-05-base-damage-repair.spec.ts` — the dwell test at `:223` (assertion `:233`) **and the
  interrupt test at `:252` (assertion `:260`, wait `:262`)**.
- `src/systems/BuildSystem.ts:689-693` — where `repair.progress` is published.
- `src/game/Balance.ts:792-794` — `repairSeconds: 1.2`, `repairCostFrac`, `repairRadius: 1.4`.
- `reviews/m2-05-geometry-settle-attempt2.md` — the sibling race this board just closed, same class.
- `tasks/BACKLOG.md` F-1030-2, F-1030-3, F-1040-1, F-1040-2, F-1040-3.

## WHY (evidence, quoted — ROOT CAUSE, verified at file:line; do not re-derive)

**The mechanism:**
- `src/game/Balance.ts:792` — `repairSeconds: 1.2`. The dwell is **1.2 SIMULATED seconds**.
- Both tests boot with **`timescale=8`** (`:224`, `:253`), so 1.2 sim seconds is **≈150 ms real**.
- `src/systems/BuildSystem.ts:693` — `progress` is `this.activeRepairId ? …repairProgress… : 0`, and
  `:1575`/`:1592` zero it on completion. **The value is non-zero ONLY during the dwell.**
- Playwright's `expect.poll` samples on a ~100 ms-and-backing-off interval, each sample paying a
  `page.evaluate` round-trip.

**A ~150 ms window sampled by a ~100 ms poller is a coin flip by construction.** The guard is not
detecting a defect; it is racing one — the *same class* as the geometry race the sibling slice just
closed (`99bd76fd`). Fix it the same way: **change the moment/observability, never the assertion.**

**Measured, not inherited** — the class fails **roughly 1 in 3 full-file desktop invocations**, and
**which site it lands on varies**: s1040's unmodified-main control failed at `:233`; your attempt-1
baselines failed at `:260` with `:233` green 3/3. Isolated runs are **3/3 green**, so a `-g`-scoped
run will hide this. Pre-existing, order/load-sensitive, owned by no recent slice.

**Note what is NOT broken:** repair completion is already covered at `:236` (`wrecked === false`),
`:241` (`wreck.repairs === 1`) and `:242` (hp restored). The polls at `:233`/`:260` exist to prove the
dwell is *observable mid-flight* — which is also what the `repair-ring-mid-dwell` screenshot at `:234`
is for. **Preserve that intent** — do not delete either assertion because completion is covered.

### ⚠️ F-1041-1 — THE TRAP IN THE SECOND SITE (verified s1041; this is why scope 3 is not a copy-paste)

`setBalance` (spec `:41`) is **page-side** — it calls `window.__GR_TEST__.setBalance`. But the spec
**also statically imports the balance table node-side** (spec `:4`,
`import { Balance } from '../src/game/Balance'`). **A page-side override is INVISIBLE to node.**

`:262` — `await waitForSim(page, Balance.wreck.repairSeconds + 0.3)` — is a **node-side read**. It will
keep meaning **1.2 + 0.3 sim seconds no matter what you set in the page.**

So if you raise the dwell to `N` in the `:252` test and leave `:262` alone, the test waits ~1.5 sim
seconds for a repair that now needs `N`, and the assertions that follow —
`:263` (no `repair_palisade` sink logged) and `:264` (still wrecked) — **pass trivially even if the
interrupt were completely broken.** That is a **vacuous guard**: the exact F-1026-1 class this board
has closed five times, arrived at by accident instead of intent.

**Therefore: if you override `wreck.repairSeconds` in the `:252` test, you MUST re-key `:262` to the
same value** — bind `N` to one local const and use it for both the `setBalance` call and the
`waitForSim` argument, so the wait still comfortably exceeds the dwell.

**Verified for you:** `:262` is the **ONLY** node-side read of `Balance.wreck.repairSeconds` in the
file (`grep -n "Balance\." <spec>`, s1041) — nothing else depends on the dwell length, so the re-key
is complete at that one line. `waitForSim` (`:84-91`) waits in **simulated** seconds against
`timeAlive` with a 15s **real** timeout, so at `timescale=8` even `N=8` costs ~1.04s real — the wait
re-key is cheap and cannot blow the timeout.

## SCOPE (numbered, each testable)

1. **Establish the rate first, as SEPARATE INVOCATIONS (F-1036-2's shape law).** Desktop, **full
   file** (isolated is 3/3 green — `-g` on one test will hide this), `--workers=1`. **Six separate
   `npx playwright test` invocations**, NOT one with `--repeat-each=6`. Report the six results
   individually, **naming the site (`:233` or `:260`) for each failure.** Expect roughly **1-3 of six**
   to fail, at **either** site.
   **STOP-and-report ONLY on a genuine CLASS change**, defined by fingerprint, not by location:
   - ✅ **IN CLASS — record the site and PROCEED:** any failing
     `expect.poll(... build.repair.progress ...).toBeGreaterThan(0)` with **`Received: 0`**, at **any
     line**, in **any test** in this file.
   - 🛑 **OUT OF CLASS — stop and report:** a received value **other than `0`**; a failure that is
     **not** a `build.repair.progress` poll (different diagnostic, different assertion, a crash, a
     console/page error); or a failure in a **different spec file**.
   **A low failure count is NEVER a reason to stop** — a green sample is the expected outcome on a warm
   machine (F-1036-1/F-1040-2), never evidence of absence.
2. **Instrument the window before changing it.** Sample `build.repair.progress` and
   `build.repair.active` as fast as the harness allows across the dwell (a `page.evaluate` loop or an
   in-page rAF recorder — **not** `expect.poll`), for a passing and a failing run, and **report both
   series with timestamps**. This is a deliverable even if scope 3 lands: it tells the board how wide
   the real window actually is, which nobody has measured. If the series shows the window is *already*
   wide and the poll is simply missing it, **say so** — that moves the fix to the poll interval instead.
3. **Widen the OBSERVATION WINDOW at BOTH SITES, not the tolerance.** Preferred: raise the dwell
   per-test via the existing helper — `await setBalance(page, 'wreck.repairSeconds', N)` — in **both**
   the `:223` test (which already uses `setBalance` at `:225`) **and** the `:252` test. Choose `N` from
   scope 2's measurement and **justify it with that number**, targeting a window comfortably wider than
   the observed poll interval.
   **In the `:252` test, re-key `:262` to the same `N` (see F-1041-1 above) — one local const feeding
   both the `setBalance` call and the `waitForSim` argument.** Leaving `:262` at the static import is a
   silent vacuity bug and the drain will reject it.
   Lowering `timescale` per-test is an acceptable alternative **if** you show it does not slow the file
   materially — and note it makes the `:262` re-key unnecessary, since `repairSeconds` stays 1.2.
   **Either way both assertions keep their exact shape** (`toBeGreaterThan(0)` on
   `build.repair.progress`) — you are making the thing they look for **last long enough to be seen**,
   not making the guards easier to satisfy.
4. **Prove BOTH repaired guards can still fail — PRIMARY ACCEPTANCE EVIDENCE, not a footnote.**
   Mandatory, **one control per site**:
   - **Site `:233`** — a temporary local mutation that genuinely prevents the dwell from starting (e.g.
     teleport the hero outside `repairRadius: 1.4` before the poll) must turn `:233` **red**.
   - **Site `:260` — and this one also proves the `:262` re-key did its job:** remove the interrupt
     (skip the teleport-away at `:261`) so the repair is allowed to COMPLETE. `:263` (no
     `repair_palisade` sink) and/or `:264` (still wrecked) must turn **red**. If they stay green, your
     wait is shorter than your dwell and **the guard is vacuous — fix it before shipping.**
   Revert every control and verify the revert **two ways** (`git diff` clean **and** a `grep` for your
   marker returning nothing). **A deterministic can-it-still-fail proof outranks any number of green
   runs** — that principle closed F-1026-1, F-1026-5, F-1029-3, F-1032-1 and F-1035-1. Green runs
   corroborate; they never certify. **s1038 shipped a left-in mutation control once (F-1036-2) — the
   drain WILL read your whole diff for one, so leave none.**
5. **Report the four-shape table** — desktop/mobile × isolated/full-file — plus the scope-2 series.
   **Six separate invocations for the desktop full-file shape** (scope 1); `--repeat-each=6` is
   acceptable for the other three. **State plainly that the table is corroboration, not proof.**

## FIREWALL
**TOUCH-ONLY:** `e2e/m2-05-base-damage-repair.spec.ts`.

**NO:**
- **Do not weaken `:233` or `:260`.** No `toBeGreaterThanOrEqual(0)`, no `|| true`, no widened
  `expect.poll` timeout as *the* fix, no deleting either because completion is asserted later. The
  numbers are right; the window is too short. **Reject-don't-stretch.**
- **Do not let `:263`/`:264` go vacuous** — see F-1041-1 and scope 4. A guard that cannot fail is worse
  than the flake it replaced, because it is silent.
- **Do not touch the geometry guard or its helper** (`waitForRendererSettle` at `:93-116`, the adaptive
  warm-up at `:350-363`, the assertions at `:388-390`). Merged `99bd76fd` with a mutation-control
  proof. Build beside it, not over it.
- **No `src/` changes.** Changing `Balance.repairSeconds` globally would alter **gameplay feel** for a
  test's convenience — an owner decision, not a test fix. Use the per-test `setBalance` helper. If your
  evidence genuinely forces a `src/` change, **STOP and report** — that is a real product finding and
  it belongs to the owner.
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

**Pre-proved for you (s1041, freshly re-verified — not inherited):** `git log main..lane/e2-arsenal` is
**EMPTY** — the branch is **zero commits ahead of main**, because attempt 1 reset it and then committed
nothing. `git diff --stat main lane/e2-arsenal` shows only three bookkeeping files
(`STATUS.md`, `tasks/BACKLOG.md`, `tasks/goals.json`) where the lane is *behind* main — **no `src/` or
`e2e/` difference whatsoever.** Nothing can be lost here; reset and proceed.
*(Honest limit: the lane worktree's uncommitted-dirt state is NOT independently probed — `git -C` on a
worktree is permission-gated for fires. Attempt 1's own log ends `nothing to commit, working tree
clean`, which is good evidence but is the runner's report, not my measurement. `git clean -fd` covers
residue; treat anything else you find there as a finding worth reporting, not as expected.)*

## No-op guard
If you find yourself about to exit without changes, **WRITE WHY into your report first.** A green
scope-1 sample is **NOT** an acceptable reason to stop — this defect reads green on a warm machine and
two fires have already been fooled by exactly that (F-1036-1, and s1040's control disagreeing with a
runner's 6/6). **A failure at a line other than `:233` is NOT a reason to stop either — that was
attempt 1's mis-keyed clause and it is now fixed** (scope 1 defines the class by fingerprint). A no-op
is acceptable only under a genuine **OUT OF CLASS** scope-1 event as defined above. **Scope 2's series
is itself a deliverable**: a run that measures the window precisely and patches nothing is NOT a no-op,
provided the series is reported.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` + `npm run build` green.
**The slice's own gate:** `e2e/m2-05-base-damage-repair.spec.ts` green **desktop + mobile**, run **both
isolated and as the full file**, at `--workers=1`. **Desktop full-file must be six SEPARATE
invocations** (scope 1); the other three shapes may use `--repeat-each=6`. **Report all four numbers**,
labelled corroboration — **scope 4's two mutation controls are the acceptance evidence.**
Adjacent unmodified-green both projects at `--workers=1`: `e2e/run3d-turret.spec.ts`,
`e2e/run3d-assay-bench.spec.ts`, `e2e/m1-01-claim-jumpers-death.spec.ts`,
`e2e/m2-01-build-menu.spec.ts` — **38 tests across both projects, s1040's measured merged-tree number,
so a deviation is yours.** (Older masters' "16 tests" and the filenames `m1-01-first-claim.spec.ts` /
`m2-01-fixture-coordinate.spec.ts` are **STALE — those files no longer exist on main**, verified by
`ls` in s1040.)
Zero console/page errors on both viewports.

End: **READY-FOR-GATES** + report: the scope-1 rate **as six separate invocation results with the site
named for each failure**, the scope-2 progress/active series with timestamps for a passing AND a
failing run, the window value `N` you chose and the measurement that justifies it, **confirmation that
`:262` follows `N`** (or that you took the timescale route and why), **both scope-4 can-it-still-fail
proofs (the acceptance evidence)**, and the four-shape table labelled as corroboration.
