# Task lane-c-f1148-1-trajectory-split: split the CONFIRMED CONTRIBUTOR from the UNEXPLAINED REMAINDER in the m2-04 palisade route regression (lane-c, commit prefix "chore:")

**FIRE-AUTHORED s1149 (attended review welcome).** This is a **MEASUREMENT** task, the direct successor to `lane-c-m2-04-palisade-budget-bisect`. Its deliverable is a **three-arm trajectory table and a classification**, **not a repair** — the cure is OWNER-GATED (adjacent to the E① pathing thread, F-1131-5). Read scope 6 before you touch anything. The two most likely wrong moves are (a) "fixing" the red, and (b) widening `toBeLessThan(20)`. Both would destroy the only pathing-efficiency guard the factory has on this behaviour.

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. **Do not compare this worktree against a list of files I wrote; I do not have one, and an exhaustive dirt list is the wrong instrument (it is what stopped a runner needlessly at s1132).** Check the **invariant** instead: **no dirty blob in this worktree may be UNIQUE** — every modified/deleted/untracked file's content must already exist somewhere in git (main's history, any branch, or this lane's own commits). If every dirty blob is reachable, the reset destroys nothing → `git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. If **any** blob exists nowhere else, **STOP and report that file by name** — that one is real unmerged work and resetting it would be the Mistake #2 shape. (`git hash-object <file>` then `git cat-file -e <hash>` is enough; `.wrangler/tmp/**` is build scratch and is exempt.) Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

*(s1149 measured this lane at close and you must still re-verify it: `git log main..lane/e2-arsenal` was **0 ahead** — the lane's last content merged to main at `c727a5b7`. Proven by the unique-blob invariant, not by an ahead-count: `git diff --numstat main lane/e2-arsenal` listed only `STATUS.md`, `reviews/lane-c-activations-frame-matrix-from-contract.md`, `scripts/tmp-s1148-line1.txt`, `tasks/BACKLOG.md` and `tasks/goals.json`, and **every one of those lines is main being NEWER than the lane** — the lane holds nothing unique. If that is no longer true, apply the invariant above.)*

## READ FIRST (paths, in this order)

1. `artifacts/f-1147-1-bisect.md:84-107` — **the predecessor's own numbers and its recommendation.** Read the rAF trajectory table at `:95-100` especially; you are re-running that instrument with a third arm.
2. `reviews/lane-c-m2-04-palisade-budget-bisect.md` — the drain review, including **F-1148-1**, the finding that makes this task necessary.
3. `tasks/BACKLOG.md:10` (the F-1147-1 entry) — the consolidated state of this thread, including the measured mutation-control numbers.
4. `src/entities/Enemy.ts:688-731` — the live mechanism: the blocker-aware detour computed at `:688` and the seeded lateral bias added **on top** at `:704-728`.
5. `e2e/m2-04-gold-stealing.spec.ts` — the `"thief routes around a finite palisade line to steal"` test and its `:227` budget assertion. **You will not edit this file.**
6. `CLAUDE.md` §5 Mistake #12 (never gate a spec a live task is editing) and §7 (escalation).

## WHY (quoting the evidence, dated)

`lane-c-m2-04-palisade-budget-bisect` (drained s1148 at `bb7f14c3`) bisected the m2-04 palisade-route red to first-bad-commit `3c749607` and recommended a cure: *"do not apply its lateral lane bias to a solitary thief."* The drain then ran that cure as a mutation control on **today's main**, and the result is the reason this task exists — verbatim from `reviews/lane-c-m2-04-palisade-budget-bisect.md` (**F-1148-1**):

> **Unmutated: 6 failed / 0 passed.** With `const lateralOffset = 0` (behaviourally = the report's "exempt the lone thief"): **2 failed / 4 passed** — and both survivors are the SAME budget assertion at `20.999` / `20.667`, the same magnitude as the unmutated failures (`20.333`–`21.667`). The mutation shifts the distribution just far enough to straddle the boundary; it does **not** return the route to the parent revision's measured `10.334`.

So the named term is a **confirmed contributor, not the whole regression.** Either further regressions stacked after `3c749607` (a bisect correctly stops at the *first* bad commit and is blind to later ones), or the bisect's **n=1** parent/child pair overstated one commit's share. **Those two possibilities imply different repairs, and nothing measured so far distinguishes them.**

The predecessor's own instrument can distinguish them, and it is the one thing that was never pointed at today's tree. From `artifacts/f-1147-1-bisect.md:93-100`, run 21 days back at n=1:

| Revision | Sim time to theft | Sampled path distance | X range |
|---|---:|---:|---:|
| parent `4da134a9` | `7.997` s | `18.648` | `0.000 … 3.256` |
| child `3c749607` | `10.836` s | `19.423` | `-0.628 … 3.230` |

> The child route takes `2.839` s longer (`35.5%`) … its shape changes: the parent heads only toward the right end of the palisade, while the child first bends left to `x=-0.628` under the seeded formation bias, then crosses back around the right end.

**Premises re-verified at source by s1149 (2026-07-28), not inherited:** `4da134a9` **is** the parent of `3c749607` (`git log -1 3c749607^`); `3c749607` **is** an ancestor of main; and the mechanism is **still live** — `lateralOffset` at `src/entities/Enemy.ts:704`, `spreadBiasX`/`spreadBiasZ` at `:705-718`, applied at `:723`/`:728`.

## THE QUESTION THIS TASK ANSWERS (one sentence)

**On today's main, does removing the lateral bias restore the parent revision's ROUTE, or only part of it?**

Answer it with the trajectory probe, not with the pass/fail counter — that is the entire point. `expect.poll` cadence *amplifies* route delay (the predecessor measured `10.334 → 20.596` at the assertion for a `7.997 → 10.836` change in the route), so pass/fail counts compress three different worlds into one number. **Trajectory separates them.**

## SCOPE (numbered; each item testable)

1. **Rebuild the probe, and prove it measures something.** Reconstruct the in-page rAF trajectory probe described at `artifacts/f-1147-1-bisect.md:93-100`: spawn the same solitary-thief-vs-palisade setup as the m2-04 test, sample the thief's world position every animation frame until the theft completes, and emit **sim time to theft, sampled path distance, X range (min…max), and the sample count**.
   ⛔ **A probe that executes nothing reports zero and looks like a clean result.** Your report must carry a **positive control**: state the sample count and the path distance, and confirm both are non-zero and plausible (the predecessor's distances were ~18–19 world units over hundreds of frames). **If a probe run reports zero samples or zero distance, that run is VOID — say so and re-run; do not average it in.**
   Commit the probe as `scripts/probe-f1148-1-trajectory.mjs` (or `.ts`) — **it is a deliverable, not scratch** (RETENTION LAW; the predecessor committed its `scripts/tmp-f-1147-1-bisect.sh` for exactly this reason).
2. **Run THREE arms, n≥3 each, same box, back to back.**
   - **Arm A — today's main, unmutated.** The current state.
   - **Arm B — today's main, `const lateralOffset = 0`** at `src/entities/Enemy.ts:704` (behaviourally = the recommended cure). **This mutation is a THROWAWAY — see scope 5.**
   - **Arm C — parent revision `4da134a9`, unmutated.** The known-good baseline that produced `7.997` s / `10.334` at the assertion.
   ⚠️ **n=1 is what produced the finding you are correcting — do not repeat it.** Report every individual run plus the median and the spread for each arm. A spread that overlaps between arms is itself the answer to scope 4 and must be reported as such rather than hidden behind a mean.
   ⚠️ **Neither arm may be a contaminated control:** run all three the same way, on a quiet box, with nothing else building or testing. If you cannot get a quiet box, say so in the report — a contaminated control can AGREE with a contaminated treatment and prove nothing.
3. **Arm C must not disturb main.** Build `4da134a9` in a **detached worktree** (`git worktree add --detach <path> 4da134a9`), with its own `npm install`. ⚠️ **Use a scratch port, not the default** — lane worktrees share port `5188` and a second server on it will either fail or, worse, silently measure the **wrong tree** (`5199`/`5231`/`5234` are the house scratch ports). **State the port you used in the report**; a trajectory measured against a foreign tree is the most expensive way to be wrong here. Remove the worktree when done.
4. **Classify the split — this is the deliverable.** Compare arm B against arms A and C on **route shape**, not just duration:
   - If **B ≈ C** (sim time and X range both return to the parent's ~`7.997` s and a non-negative X floor): the lateral bias is the **whole** regression, and the residual `20.999`/`20.667` failures are **polling amplification** — a separately scoped harness question, not a pathing one.
   - If **B sits between A and C** (route improves but does not return): a **real remainder** stacked after `3c749607`. Say so, and if you can, **name where** — but see scope 6: you may bisect further to *identify* it, you may not fix it.
   - If **B ≈ A** (little route change): the mutation control's pass-rate improvement was distribution noise, and the bisect's n=1 pair overstated the commit's share. This would be the most important finding of the three.
   The X floor is the sharpest discriminator the predecessor found (parent `0.000` vs child `-0.628`, the S-bend) — **report it for all three arms.**
5. **⛔ THE MUTATION IS A THROWAWAY AND MUST NOT SHIP.** Arm B requires editing `src/entities/Enemy.ts`. Take a byte backup first, restore from it after, and **verify `git status --porcelain -- src/` is EMPTY before you commit anything.** Paste that verification into your report. A `src/` diff in this slice is a firewall violation and the drain will reject it. (The predecessor did exactly this and said so; copy that discipline.)
6. **⛔ DIAGNOSE, DO NOT REPAIR — AND DO NOT WIDEN THE BUDGET.**
   - **Do not fix the regression.** The cure is **OWNER-GATED** (adjacent to E① pathing, F-1131-5). Even if the right one-line change is obvious to you by the end, writing it is out of scope. Your report's *recommendation* is welcome; your *repair* is not.
   - **Do not touch `e2e/m2-04-gold-stealing.spec.ts`.** In particular **do not relax `expect(timeAlive - spawnedAt).toBeLessThan(20)` at `:227`.** That assertion is the only pathing-efficiency guard on this behaviour, and F-1148-1 exists *because* it was left unwidened — a wider budget would have hidden both the confirmed contributor and the unexplained remainder. A green `:227` obtained by editing that file is the **REJECT** condition for this task.
   - If your measurement **contradicts** F-1148-1 or the bisect, **say so plainly and show the numbers.** You are licensed to contradict both. A well-evidenced "the predecessor was wrong" is the most valuable outcome this task can produce; a STOP with reasons is a **SUCCESS**, not a failure.
7. **Report.** `artifacts/f-1148-1-trajectory-split.md`: the probe's method and positive control (sample counts), the three-arm table with **every individual run** plus median and spread, the X-floor comparison, the scope-4 classification with its reasoning, the scope-5 clean-`src/` verification, the port used for arm C, and any finding you are reporting rather than fixing.

## FIREWALL

**TOUCH-ONLY:**
- `artifacts/f-1148-1-trajectory-split.md` (new)
- `scripts/probe-f1148-1-trajectory.mjs` (new; `.ts` acceptable — name it in your report)
- `src/entities/Enemy.ts` **TEMPORARILY, for arm B only, and reverted to byte-identical before any commit** (scope 5). It must appear in **no** commit.

**NO — do not touch, for any reason:**
- **`e2e/**` — ZERO changes.** Especially `e2e/m2-04-gold-stealing.spec.ts`. This is a measurement task; it adds no tests and edits none.
- **`src/**` in any committed form.** The arm-B edit is a throwaway; see scope 5.
- `assets/**`, `src/game/Balance.ts`, `STATUS.md`, `tasks/**`, `reviews/**`, other lanes' files.
- Do not "fix" adjacent reds you notice. **Report them** — that is valuable and in scope for your report; fixing them is not.

## SELF-CHECK (name the exact commands and paste the real numbers)

1. `npx tsc --noEmit` → expect rc=0.
2. `npm run build` → expect rc=0.
3. `git status --porcelain -- src/` → **must be EMPTY.** Paste the (empty) output; this is scope 5's proof.
4. `git status --short` → confirm the only changes are the two TOUCH-ONLY new files.
5. The three-arm trajectory table, with per-run values, medians, spreads, and sample counts (scope 1's positive control).
6. `npx playwright test e2e/m2-04-gold-stealing.spec.ts --project=desktop-chrome --workers=1 --reporter=list` on the **restored, unmutated** tree → this is expected to be **RED** at `:227`; paste it as confirmation that you left the guard intact and did not accidentally ship the mutation. **A green here is a red flag, not a success** — it would mean the mutation survived.

## SEQUENCING / LAWS

- Path-scoped `git add` only — never `-A` at repo root. Commit prefix `chore:`.
- One concern per commit.
- The runner auto-commits on this lane; do not touch `STATUS.md`, `tasks/**` or `reviews/**`.
- If you are blocked twice on the same obstacle, **STOP and report** rather than trying a third variation of the same idea (§7.5).

**READY-FOR-GATES** when scopes 1–7 are done. Report: the probe method + sample-count positive control, the full three-arm table (every run, not just medians), the X-floor shape comparison, the scope-4 classification and what it implies for how the eventual repair must be scoped, the empty-`src/`-diff proof, arm C's port and worktree handling, and anything you are reporting rather than fixing.
