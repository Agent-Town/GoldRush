# f2282-1 — the blocker-panel real-history arm, re-anchored

**Slice:** `f2282-1-blocker-panel-real-history-arm`
**Branch:** `lane/c` · **Tip:** `86879edff` · **Base:** `d301990f7` · **Main at gate:** `c2cc15597`
**Drained by:** s2283 fire, 2026-08-25
**Gate tree:** detached worktree `worktrees/gate-s2283` at `main + lane/c` (§3.0b — undecided content never entered main's working tree)

## VERDICT: MERGE — green on every gate, and the slice is *stronger* than its own master asked for.

Two of the master's three substantive claims about the world were **refuted** during this drain — by the
runner first, then independently by me. Neither refutation touches the slice's correctness; both are
recorded below as findings, because the refuted claims are now in `tasks/BACKLOG.md` where the next fire
will inherit them.

## What it does

`scripts/blocker-panel-closed-guard.test.mjs` carried one arm that replayed **real ledger history** through
the guard and asserted it reds. That arm had been failing on main since 2026-08-23 (`0 !== 1` at `:47`,
re-confirmed by me on clean main this fire). The cause is not rot in the guard: **F-2228-1** taught the guard
*subject-first attribution* — a closure row states the state only of the **first** F-ID in its subject zone —
and the arm's fixture (`2e02098f`, offender `F-1030-2`) depended on the looser pre-F-2228-1 rule, because
`F-1030-2` is merely the *second* id on a row led by `F-1040-1`.

The slice:

1. **Re-anchors** the real-history arm on `725deff2c34fc5014f90f46ae06d2d0959f0ed4f`, asserting offender
   `F-1534-2`, whose closure *is* subject-led by itself.
2. **Retains the original incident** as a new arm asserting `F-1030-2` is *not* flagged on `2e02098f` —
   converting a rotted assertion into a **live regression pin for F-2228-1**. (Retention Law: superseded,
   not erased.)
3. Touches nothing else. The guard, `desk-state-audit.mjs`, `findings-state-guard.mjs` and `dashboard-gen.sh`
   are all untouched, exactly as the firewall demanded.

## Evidence

All gates run on the **merged tree** in the detached gate worktree unless the row says otherwise.

| Gate | Result |
|---|---|
| `node --test scripts/blocker-panel-closed-guard.test.mjs` | **7 pass / 0 fail / 0 skipped**, 620.4 ms |
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **green**, built in 1.36 s |
| `npm run test:ledger-guards` — **clean main control** | **rc=0**, all 19 legs, leg-1 `621 pass / 0 fail` |
| `npm run test:ledger-guards` — merged tree | see F-2283-4 (fixture race, not attributable) |
| `authorable-single-read-guard.test.mjs` alone — merged tree | **9 pass / 0 fail** |
| `authorable-single-read-guard.test.mjs` alone — clean main | **9 pass / 0 fail** |
| Playwright / `test:node-guards` in full / screenshots | **correctly not run** — the slice touches no `src/`, `e2e/`, `functions/` or asset path and renders nothing (F-1460-1's path trigger does not fire) |

### The drain's own controls (§3 — the re-run is a free control on the runner's headline)

I did not inherit the runner's numbers. Every arm below asserted **that it RAN** (a `panel rows` line on
stdout) before any verdict was believed — F-2215-1: *a control whose failure mode is silence cannot be told
from the silence it measures.*

| # | Probe | Result |
|---|---|---|
| 1 | `d5407705` — the master's own worked example | **status 0, GREEN, no offenders** |
| 2 | `725deff2` — the runner's chosen anchor | **status 1, offender `F-1534-2`** ✅ |
| 3 | 1-in-25 sample over BACKLOG history (101 of 2,523 commits) | **0 reds** |
| 4 | Manufactured defect, *remove* the `subjectLedClosure` filter | `2e02098f`: rc 0 → **rc 1, offender `F-1030-2`** ✅ · `725deff2`: rc 1 → rc 1 (unchanged) |
| 5 | Manufactured defect, *force-skip* the filter | `725deff2`: rc 1 → **rc 0** ✅ · `2e02098f`: rc 0 → rc 0 |

**Probe 4 and 5 together are the strongest result of this drain, and they are better than the master asked
for.** The two arms move under *different* mutations:

- The **new anchor arm** (`725deff2`) reds under the live rule and greens only when the violation path is
  force-skipped — so it pins *"the guard still reds on real history."* Its red is **independent** of
  F-2228-1.
- The **retained arm** (`2e02098f`) greens under the live rule and reds only when the subject-first filter is
  **removed** — so it pins *"F-2228-1's filter is live."*

Neither arm is decoration, and neither is redundant with the other. The scratch variant was written into
`scripts/` (never `/tmp`) so its sibling imports resolve, and removed in a `finally`; verified absent after.

## Findings

### F-2283-1 — the master's feasibility claim is REFUTED (non-blocking; already absorbed by the runner)

`tasks/BACKLOG.md`'s **F-2282-1** row states, as established feasibility, that replaying today's rule across
BACKLOG history finds **"64 historical commits still red"**, worked example `d5407705` (offenders
`F-1310-1, F-1269-1, F-1270-1, F-1457-1`).

**Three independent measurements refute it:**

1. The lane-c runner replayed **all 2,522** BACKLOG-touching commits and found **exactly one** red.
2. My own 1-in-25 sample — *the same sampling density s2282 claimed* — over 101 commits found **0 reds**.
3. A direct probe of `d5407705` returns **status 0** under the live rule, and **still 0** under both
   mutations of the subject-first filter (so the discrepancy is *not* explained by s2282 having replayed the
   pre-F-2228-1 rule, which was my first hypothesis and is hereby refuted too).

**I cannot recover what s2282's replay actually measured, and I am publishing the band rather than a
plausible story** (F-2182-1: *a hedge that names a MECHANISM invites the next fire to trust the mechanism and
stop measuring; a hedge that names the measured BAND protects them*). Measured band across all methods tried
at fixed trees: **0–1 reds**, against a claimed 64.

**Cost: ZERO — and the reason is the reusable half.** The master told its runner, in its own scope item 1,
*"Pick the commit yourself and verify it before you rely on it; do not paste `d5407705` on my word alone
(Mistake #4 — my sample was 1-in-25 and is not a census)."* The runner obeyed, found the claim false, ran an
exhaustive replay itself, and reported the contradiction instead of fixing or hiding it — **a firewall
success** (`CLAUDE.md` §4.5). **A master that instructs its runner to verify the master's own evidence
converts a false premise into a non-event.** That instruction is the single cheapest thing in this task file
and it is the only reason a wrong number cost nothing.

The F-2282-1 row is **superseded in prose, not deleted** (Retention Law).

### F-2283-2 — the new anchor is a near-SINGLETON; real history holds no spare specimen (non-blocking)

The exhaustive replay found **1 red in 2,522** BACKLOG-touching commits; my sample found 0 in 101. So
`725deff2` is not one specimen among many — it is, as far as two independent searches can tell, **the only
historical ledger state today's rule reds on.**

Consequence for the next fire, and the reason this is written down: **if the panel rule or the closure
vocabulary drifts again, this arm rots again and there is no replacement in history to re-anchor on.** The
search space is already exhausted; do not spend a fire re-running it. At that point the honest options are
the retained `2e02098f` mutation-pin (which does not depend on finding a red specimen at all) or a
constructed fixture — **not** another history sweep.

### F-2283-3 — the master's NO list conflates the guard with its test file (non-blocking, documentation)

The firewall's NO entry for `package.json` reads *"this guard is already rooted in `test:ledger-guards`; no
new leg is needed."* That is true of the **guard** — `test:blocker-panel` runs
`node scripts/blocker-panel-closed-guard.mjs`, the live-root check — but it is **false of the test file**,
which is rooted in **`test:node-guards`** (the ~9-minute battery), not in `test:ledger-guards`.

Measured: `blocker-panel-closed-guard.test.mjs` appears in **exactly one** npm script, and it is
`test:node-guards`. So the master's prescribed self-check (`npm run test:ledger-guards` → green) is a
**supporting** gate that does not exercise the subject at all, and the runner's *"19 command legs green"* —
though honestly reported — is not evidence about this arm.

**No action, and deliberately no mechanism.** The conclusion is unchanged (no new leg is needed, the file is
rooted), and the targeted gate — running the test file directly, 7/7 — is the one that matters and is green.
This is recorded so the next reader does not conclude the arm is covered by the cheap battery when it is
covered only by the expensive one.

### F-2283-4 — `authorable-single-read-guard` fixture race in the battery (non-blocking, not attributable)

The merged tree's first `test:ledger-guards` run redded leg 1 with
`ENOENT … /T/s2265-single-read-*/scripts` at `authorable-single-read-guard.test.mjs:159` — the
*"a genuinely healthy board is unchanged"* reverse control, failing inside `cpSync` because its own temp
directory's `scripts` subdirectory vanished mid-copy.

**Fingerprinted, not assumed:**

- The file passes **9/9 in isolation on the merged tree**.
- The file passes **9/9 in isolation on clean main**.
- Clean main's **full** battery is **rc=0, 621/621** — so this is not a standing red on main.
- The slice touches exactly one file, `blocker-panel-closed-guard.test.mjs`, which shares no fixture, no
  temp-directory prefix and no import with the failing subject. There is no mechanism by which it could
  reach it.

Classified as a **cross-test temp-directory race** surfacing under whole-battery concurrency, not a defect of
this slice. Note the `&&` chain's consequence, which nearly cost me the right reading: **leg 1 failing meant
legs 2–19 never ran**, so that run's output is a *floor*, not a count — the first summary block a reader
greps is leg 1's alone.

**The confirmatory re-run did not settle it — it HUNG, which is the more useful result.** A second
`test:ledger-guards` in the same gate worktree sat on leg 1 at **0.0% CPU for 14 minutes** (that leg completes
in ~30 s on main) and was stopped rather than waited out. So this battery has now failed **two different ways**
in the gate worktree — a temp-dir ENOENT, then a flat-CPU stall — while being **green end-to-end on clean
main**.

➡️ **Conclusion, and it is a caution about the instrument rather than about the slice: a detached gate
worktree is an unreliable host for `test:ledger-guards`.** That is consistent with the whole s2212–s2227
finding streak — this battery is dense with guards whose subjects are *tracked ledger files* and whose
corpora resolve relative to the tree they run in, which is exactly the class those findings kept curing. One
live corroborating detail: a stale `claimed-spec-harness-guard.mjs --report` process from an unrelated agent
worktree has been resident at 0.0% CPU for **4 days**, and `claimed-spec-harness-guard.test.mjs` is in leg 1.

**This costs the drain nothing**, because `test:ledger-guards` **does not contain the subject** (F-2283-3).
The subject's gate is `node --test scripts/blocker-panel-closed-guard.test.mjs`, run on the merged tree,
**7/7 green**. The authoritative battery run is the post-merge one **on main** — which the ordering law
(F-1300-4) requires as this fire's last act anyway, since the drain's bookkeeping commit necessarily
post-dates any gate-tree run.

## Merge classification

Single file, single concern.

| File | Class | Resolution |
|---|---|---|
| `scripts/blocker-panel-closed-guard.test.mjs` | **LANE-TOUCHED** (+19 / −6) | Clean 3-way merge, no conflict — main has not moved this file since `d301990f7`. Verified by `git merge --no-ff` in the gate worktree reporting a single-file `ort` merge. |

No MAIN-MOVED files. No conflicts to resolve.
