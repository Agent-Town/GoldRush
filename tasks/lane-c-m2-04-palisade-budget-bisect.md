# Task lane-c-m2-04-palisade-budget-bisect: name the commit that pushed the thief's palisade detour past its 20-second budget (lane-c, commit prefix "chore:")

**FIRE-AUTHORED s1147 (attended review welcome).** This is a **DIAGNOSIS** task. Its deliverable is a named commit and a classification, **not a repair** — and emphatically not a wider budget. Read scope 6 before you touch anything: the single most likely wrong move here is to "fix" the red by relaxing the assertion, which would delete the only guard the factory has on this behaviour.

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. **Do not compare this worktree against a list of files I wrote; I do not have one, and an exhaustive dirt list is the wrong instrument (it is what stopped a runner needlessly at s1132).** Check the **invariant** instead: **no dirty blob in this worktree may be UNIQUE** — every modified/deleted/untracked file's content must already exist somewhere in git (main's history, any branch, or this lane's own commits). If every dirty blob is reachable, the reset destroys nothing → `git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. If **any** blob exists nowhere else, **STOP and report that file by name** — that one is real unmerged work and resetting it would be the Mistake #2 shape. (`git hash-object <file>` then `git cat-file -e <hash>` is enough; `.wrangler/tmp/**` is build scratch and is exempt.) Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

*(s1147 measured this lane at close and you must still re-verify it: `git log main..lane/e2-arsenal` was **1 ahead** at `32824327`, and that commit is **FALSE-AHEAD** — its content merged to main at `83f4c761`. Proven by the unique-blob invariant, not by the commit message: after the merge, `git diff --numstat main lane/e2-arsenal` no longer lists `e2e/trail-guide.spec.ts`, `src/game/Game.ts` or `src/story/trailGuide.ts` at all — byte-identical — and every remaining line in that diff is main being NEWER than the lane, not the lane holding anything unique. If that is no longer true, apply the invariant above.)*

## READ FIRST (paths, in this order)

1. `reviews/lane-c-trail-guide-residue-triggers.md` — **F-1147-1 is this task's entire evidence base.** Read it before forming a hypothesis.
2. `e2e/m2-04-gold-stealing.spec.ts:211-231` — the failing test. `:227` is the assertion that fails. **Read it; do not edit it.**
3. `e2e/m2-04-gold-stealing.spec.ts:42-47` — `placeBuildableAt`, which appears in some failure stacks (see scope 2's warning).
4. `reviews/evidence/mac-fullsuite-20260705-1147.md:42` — the last recorded green: `m2-04` at **7 / 0 / 0 / 0**.
5. `CLAUDE.md` §5 Mistake #12 (never gate a spec a live task is editing) and §7 (escalation).

## WHY (quoting the evidence, dated)

`e2e/m2-04-gold-stealing.spec.ts:211` — *"thief routes around a finite palisade line to steal"* — is **RED on main and has been for some time**. s1147 measured it while draining an unrelated slice:

- Merged tree: **2 failed / 12 passed**, both projects.
- **Clean main control** (`git checkout HEAD -- <the drained files>`): **identical** — 2 failed / 12 passed, same test, both projects. So it is **not** caused by that drain.
- **Quiet box, `-g "palisade line" --repeat-each=3`, both projects: 0/6 pass.** Deterministic. **Not contention** — s1147's first hypothesis was load contention and this control killed it.

The failing assertion is `:227`:

```ts
expect((await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 99)) - spawnedAt).toBeLessThan(20);
```

Measured overruns: **desktop `20.333…`, mobile `20.999…`** against a budget of `20`. The thief completes its detour, but **1.7–5 % too slowly**.

This is a **regression, not a chronically marginal test**. `ea570a81` (2026-07-05T11:40) is both the **last commit to touch this spec file** and a commit whose own message records **"m2-04 7/7"**; `reviews/evidence/mac-fullsuite-20260705-1147.md:42` independently records 7/0/0/0 seven minutes later. The spec has been byte-stable since. **Therefore something in `src/` between 2026-07-05 and 2026-07-28 slowed the thief's route around a finite palisade line.**

⚠️ **Suspected neighbourhood, offered as a lead and NOT as a conclusion:** the standing **E① pathing cure (F-1131-5)** on the owner's desk concerns enemy pathing around obstacles. A pathing change that makes thieves route less efficiently around a palisade line is exactly the shape that moves a 20 s journey to 20.3 s. **You are explicitly licensed to contradict this lead** — the bisect is the authority, not this paragraph.

## SCOPE (numbered, each testable)

1. **REPRODUCE FIRST — this is a STOP gate.** On the lane at current main, run:
   `npx playwright test e2e/m2-04-gold-stealing.spec.ts -g "palisade line" --project=desktop-chrome --project=mobile-chrome --repeat-each=3 --workers=1`
   Record the pass/fail count and **every** `Received:` value.
   - If it fails **6/6** (or 5/6+) with `Received` just over 20 → premise confirmed, continue to scope 2.
   - **If it PASSES ≥4/6, STOP and report.** That would mean s1147's measurement was environment-specific and there is no regression to bisect. **A stop here is a SUCCESS, not a failure** — report the numbers and stop. Do not go looking for a different problem to solve.

2. **Pin the failure LINE before bisecting.** s1147 saw the failure surface at **two different places** across runs: usually `:227` (the budget), but once inside `placeBuildableAt` at `:46:82` (`confirmBuild()` not returning `true`). **These may be two faults, not one** — the factory has been bitten by welding two faults under one flake label. Record which line fails in each of your 6 repeats. **Bisect on `:227` only.** If `:46` failures dominate instead, that is a *different* and more serious finding — **report it and stop**, because a build-placement failure is not a pathing-budget question.

3. **Bisect.** `good = ea570a81` (2026-07-05T11:40), `bad = <current main tip>`. Use `git bisect run` with a small script that builds and runs **only** `-g "palisade line" --project=desktop-chrome --workers=1` (desktop alone is enough per-step; both projects fail together). Guard the script so a **build failure** exits `125` (skip), never `1` — a broken intermediate commit must not be recorded as "bad".
   - Expect ~10–12 steps. If a run is ambiguous at a step, re-run that step with `--repeat-each=3` and take the majority rather than guessing.

4. **Name the commit and read it.** Report its hash, date, subject, and the specific hunk you believe is responsible. Then **verify the attribution** rather than asserting it: check out the named commit and its parent, run the test at each, and paste both `Received:` values. A bisect result you have not confirmed by a direct parent/child comparison is a hypothesis.

5. **Classify the result into exactly one of these, with your evidence:**
   - **(a) REAL PATHING REGRESSION** — the thief's route is genuinely longer/slower now. Say by how much and whether the detour path changed shape.
   - **(b) SIM-TIMING SHIFT** — the route is the same but `timeAlive` accrues differently (timescale, fixed-step, or spawn-frame accounting), so the budget measures something subtly different than it did.
   - **(c) ALWAYS-MARGINAL** — the bisect finds no single commit and the value drifted gradually across many. If so, say that plainly; "no single culprit" is a legitimate and useful answer.

6. **Write `artifacts/f-1147-1-bisect.md`** containing: the scope-1 reproduce table, the scope-2 failure-line split, the full bisect log, the scope-4 parent/child confirmation, and your scope-5 classification with a one-paragraph recommendation. **This file is the deliverable** — this task is expected to produce **no `src/` and no `e2e/` diff at all**, and that is correct, not a no-op. Say so explicitly in your report so no one mistakes it for Mistake #1.

## FIREWALL

**TOUCH-ONLY:** `artifacts/f-1147-1-bisect.md` (new) · a throwaway bisect script under `scripts/tmp-*.mjs` or `scripts/tmp-*.sh` (commit it — RETENTION LAW).

**NO:**
- ⛔ **`e2e/m2-04-gold-stealing.spec.ts` — DO NOT EDIT IT AT ALL.** Not the budget, not the timeout, not a `test.retry`, not a `skip`. **Raising `toBeLessThan(20)` to fit the observed 20.4 is the single forbidden act of this task.** That assertion is a pathing-efficiency guard; widening a guard to suit its data is the failure mode this factory has a standing law against. If you finish convinced the budget is genuinely wrong, **say so in scope 5 and leave it alone** — that is a recommendation for a later, separately-gated slice.
- ⛔ **Any `src/` change.** You are diagnosing, not repairing. Even if the culprit hunk looks trivially revertible: **report it, do not revert it.** The cure may be a design fork (it may be adjacent to the owner-gated E① pathing thread), and choosing it is not this task's call.
- ⛔ Any other e2e spec · `Balance.ts` · `tasks/**` · `STATUS.md` · `reviews/**` · `tasks/goals.json`.
- ⛔ Do not "fix" any *other* red you meet while bisecting. Report it in one line and move on.

## SELF-CHECK (name the exact commands and paste real numbers)

- `npx tsc --noEmit` clean and `npm run build` green on the final tree (which should be back at main's tip after the bisect — **run `git bisect reset` and confirm `git status` is clean**).
- The scope-1 reproduce table: 6 repeats, both projects, every `Received:` value.
- The scope-2 failure-line split: how many of the 6 failed at `:227` vs `:46`.
- The full `git bisect` log, verbatim.
- The scope-4 parent/child confirmation: two `Received:` values, one per commit.
- Confirm `git diff --stat` shows **only** `artifacts/f-1147-1-bisect.md` and your tmp script — **zero `src/`, zero `e2e/`**.
- ⚠️ **Port discipline:** other lanes may be live. Do **not** assume 5188 is free — check it, and if it is taken use a scratch port with `GR_CAPTURE_EXTERNAL_SERVER=1` and your own dev server, then stop that server by task id when done (never by a remembered pid).

READY-FOR-GATES + report: the scope-1 reproduce numbers (**including a STOP verdict if it passed**); the scope-2 failure-line split; the bisected commit with hash, date and subject; the parent/child confirmation values; your scope-5 classification (a/b/c) with the reasoning; your recommendation for the eventual fix **stated as a recommendation, not applied**; and explicit confirmation that `e2e/m2-04-gold-stealing.spec.ts` is byte-unchanged (`git diff --stat` proves it).
