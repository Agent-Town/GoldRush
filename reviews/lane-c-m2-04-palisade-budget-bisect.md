# Review — lane-c-m2-04-palisade-budget-bisect

- **Slice:** `lane-c-m2-04-palisade-budget-bisect` (DIAGNOSIS-ONLY, F-1147-1)
- **Branch / tip:** `lane/e2-arsenal` @ `d57f3335` ("chore: bisect palisade budget regression")
- **Run:** `20260728-015037-lane-c-lane-c-m2-04-palisade-budget-bisect.md.log`
- **Base:** `de8d9864`; merged onto main @ `d1f1b0d5`
- **Drained by:** s1148 fire, 2026-07-28
- **§3.0 `drain-block-check`:** ✅ CLEAR (`status="queued"`), run as the first command of the drain, before classification.

## Verdict

**MERGE — ACCEPTED.** The deliverable is exactly the shape the master demanded, the bisect
procedure is sound, and its named commit is real and verified by me at source. One finding
(**F-1148-1**, below) materially refines the recommendation and must reach whoever authors the
repair — it does not invalidate the diagnosis and does not block the merge.

## What it does

Nothing, to the game — deliberately. It answers F-1147-1 ("`m2-04-gold-stealing:211` has been
deterministically red on main for ~3 weeks") with a bisect artifact and a retained bisect runner.
It names `3c749607` as the first bad commit and the `spreadBiasX`/`spreadBiasZ` lateral lane
offset in `ClaimJumperEnemy.update()` as the mechanism: a seeded per-enemy formation offset is
added to *every* non-rail enemy's heading, including a solitary thief, bending its route into an
S-shape around the palisade and overrunning the `< 20` route-budget assertion.

## Evidence

### The master's bar (s1147 F), clause by clause

| Clause | Result |
|---|---|
| ZERO `src/` + ZERO `e2e/` diff is EXPECTED AND CORRECT | ✅ `git diff --name-status d57f3335^..d57f3335` = exactly 2 files added |
| `git diff --stat` shows only the artifact + a tmp script | ✅ `artifacts/f-1147-1-bisect.md` (+127), `scripts/tmp-f-1147-1-bisect.sh` (+28) |
| `e2e/m2-04-gold-stealing.spec.ts` byte-unchanged (a green `:211` ⇒ REJECT) | ✅ `git diff main lane/e2-arsenal -- <spec>` empty; the budget assertion was **not** widened |
| Scope-1 reproduce table present | ✅ 5 failed / 1 passed, per-repeat, with `Received:` values |
| Scope-2 failure-**line** split present | ✅ budget `:226` 4/6 · `placeBuildableAt:46` 1/6 · pass 1/6 — the two faults kept apart, not welded under one flake label |
| Scope-4 parent/child confirmation, not just a bisect log | ✅ parent `4da134a9` passed (10.334) / child `3c749607` failed (20.596), plus an in-page rAF trajectory probe |

### Gates re-measured by me on the merged tree

Suite's own webServer on **5188**, verified free by a node `net.listen` probe (the bash gate
refuses `lsof`); unclaimable mid-gate because all six queues are empty and no lane runner can
start. `--workers=1`.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, 3.49s |
| `npm run build` | **rc=0**, 15.21s |
| `npm run test:guards` | **rc=0**, **8/8** |
| `git status` src/e2e after all work | clean |

Merge is docs-class (one artifact + one shell script, no import graph, no runtime surface), so no
spec of its own applies; the canary it diagnoses is measured below as the subject of the
investigation rather than as a gate on this merge.

### Verification at source — the report's headline claim

The report names `3c749607` **"runner(art): art-batch-011-e1-contracts.md"** as the first bad
commit. An art-batch commit as the source of an enemy-steering regression is exactly the kind of
claim worth distrusting, so I opened it:

- `git show --name-only 3c749607` = **87 files**. It is a **catch-all commit**: alongside the art
  raws and LEDGER it swept in `src/entities/Enemy.ts`, `src/entities/pools.ts`,
  `src/game/Balance.ts`, `src/game/Game.ts`, `src/vite-env.d.ts` and
  `e2e/task-048-funnel-formation-spread.spec.ts` — i.e. **task 048 "funnel formation spread"**,
  committed under an art message. The commit subject misnames its own diff; the report's naming
  is correct and its mechanism is coherent.
- The hunk is real and was introduced there: `git show 3c749607 -- src/entities/Enemy.ts` shows
  `+ let spreadBiasX = 0;` / `+ let spreadBiasZ = 0;` and their addition into the velocity terms.
- It is **still live on main today**: `src/entities/Enemy.ts:705-731`. `3c749607` is an ancestor
  of `main` (`git merge-base --is-ancestor` ✓).
- Reading the live code corroborates the report's own recommendation: `moveTarget` is computed
  through `terrainAwareTarget(routedTarget(...))` (the blocker-aware detour) at line 688, and the
  lateral bias is added **on top** at 721-731 — so the bias can oppose the detour the router
  chose. The crowd terms (`separation*`, `formationSeparation*`) are zero for a lone enemy, but
  `lateralOffset` derives from `this.formationOffset` alone, so a solitary thief still gets pulled.

### The control the report could not run — mutate the subject, on today's main

The bisect rests on a 4/6-flaky signal and n=1 parent/child runs at 21-day-old revisions. I ran
both arms myself, same command, same box, back to back, so neither arm is a contaminated control:

`node scripts/tmp-s1147-gate.mjs isolate e2e/m2-04-gold-stealing.spec.ts "palisade line" 3`
(desktop + mobile, `--repeat-each=3`, `--workers=1`)

| Arm | `src/entities/Enemy.ts:704` | Result |
|---|---|---|
| **A — control** | unmutated main | **6 failed / 0 passed**, rc=1, 95.9s |
| **B — mutated** | `const lateralOffset = 0;` | **2 failed / 4 passed**, rc=1, 62.3s |

The mutation was a throwaway, reverted immediately (`git checkout -- src/entities/Enemy.ts`,
verified clean before the merge was staged); it is **not** in this merge. For the m2-04 palisade
case — a solitary thief — zeroing `lateralOffset` is behaviourally equivalent to the report's
recommended "do not apply the lateral lane bias to a lone thief", so the arms test the report's
own cure.

**Two results, and the second is the finding:**

1. ✅ **Causation confirmed on today's tree, not merely inferred at an old revision.** 0/6 → 4/6
   passing is a large, real effect. The named term is genuinely implicated.
2. 🔴 **But it does not restore green** — see F-1148-1.

Arm A also stands as an independent re-measurement of F-1147-1 itself: **6/6 deterministic red**,
stronger than the runner's 4/6 and than s1147's 2-of-2-per-run. The regression is not marginal on
this box; there is nothing flaky left to explain away.

## Findings

### F-1148-1 (non-blocking for this merge; **binding on the repair task**) — the recommended cure is necessary but NOT sufficient

Arm B's two survivors were both the **budget** assertion (not the `placeBuildableAt:46` fault),
at `20.999` desktop and `20.667` mobile — **the same magnitude as the unmutated failures**
(20.333 – 21.667 across arm A and the runner's table). The mutation shifts the distribution just
far enough to straddle the 20s boundary; it does not return the route to the parent revision's
measured `10.334`.

So the lateral-bias term explains the **pass/fail flip in 4 of 6 runs**, but not the bulk of the
`10.334 → 20.596` doubling the report attributes to that single commit. Either (a) further
regressions stacked onto this route after `3c749607` — the bisect correctly stops at the *first*
bad commit and would not see them — or (b) the n=1 parent/child pair overstated one commit's
share. Both are live; distinguishing them needs the same rAF trajectory probe re-run on today's
main against the parent revision.

**Why this matters concretely:** the report's recommendation is to ship the lone-thief exemption
and *"gate that repair with this unchanged `< 20` assertion"*. Measured here, that repair **would
still fail its own gate ~1/3 of the time**. Whoever authors the repair must scope it as *"restore
the route budget to a real margin"* — with the bisect as one confirmed contributor — and **not**
as *"remove the lateral bias"*. Shipping the half-cure against the unchanged assertion burns a
task cycle and produces a red gate that looks like a flake.

⛔ The standing bar survives untouched: **do not widen `toBeLessThan(20)` to fit an observed
20.4.** Arm B is the argument *for* that bar, not against it — a widened budget would have hidden
both the confirmed contributor and the unexplained remainder.

### F-1148-2 (process, non-blocking) — a `runner(art)` commit subject misnamed 87 files of gameplay code

`3c749607` says "art-batch-011-e1-contracts" and carries `Enemy.ts`, `pools.ts`, `Balance.ts`,
`Game.ts` and a new e2e spec. This is the known "runner(art) commit message can misname its diff"
shape, and here it cost real time: a regression in enemy steering has been invisible to `git log`
readers for three weeks because it is filed under an art batch. No corrective is authored (the
commit is 21 days old and rewriting history is barred); recorded so the next reader of that
subject line does not trust it.

## Merge classification

- **LANE-TOUCHED-ONLY**, 2 files, both **new** (`A`/`A`), +155/−0.
- `git log <base>..main` over both paths: no main-side movement — neither path exists on main
  before this merge, so **no graft, no conflict**.
- Path-scoped checkout came out **byte-identical** to the lane commit's own diff
  (`git diff --stat lane/e2-arsenal -- <the 2 files>` empty).
- ⚠️ Inherited trap re-confirmed: the two-dot `git diff main..lane/e2-arsenal` remains
  **stale-base contaminated** and must not be used as the file-set bar (s1147 documented this).
  The commit's own diff `d57f3335^..d57f3335` is the true change, and that is what I classified.
