# Task f2272-2-block-class-guard-worktree-cwd: the drain gate reds twice on every lawful drain — teach `block-class-guard` which board it is asking about (lane-a, prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s2272, from its own drain review of `gauntlet-heat3a-codex-backend-shim`.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

READ FIRST (paths, not vibes):
- `reviews/gauntlet-heat3a-codex-backend-shim.md` — finding **F-2272-2**, the control table that attributes the red.
- `scripts/block-class-guard.test.mjs` — the subject. Lines `91` and `108` are the two spawn sites; `:119` is a third
  spawn that did NOT red and must be understood before you touch anything (why did it survive?).
- `scripts/drain-block-check.mjs` — `corpusTree()` and its refusal. **This tool is NOT the subject and must not be edited.**
- `scripts/attended-owed-anchor-tree-guard.test.mjs` + the F-2225-1 clause in `scripts/fire.md` — the precedent that
  solved this exact collision for a sibling tool by DECLARING rather than REFUSING. Read why that choice was made.
- `scripts/lane-usable-pathspec-root-guard.test.mjs` — the F-2221-1 reverse control showing how a careless
  `cwd: repoRoot()` broke callers that legitimately pass their own cwd. This is the trap for this task.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe template (ahead content already on main =
SAFE DUPE → `git checkout -B lane/a main && git clean -fd`, PROCEED; STOP on un-merged ahead content or foreign
edits). FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*`, `.png` — expected, list,
proceed. `npm install --no-audit --no-fund`; build green.

## Why (drain review F-2272-2, s2272, 2026-08-24 — measured, with a control)

`scripts/fire.md` §3.0b **mandates** that undecided content be gated in a **detached worktree**. `test:ledger-guards`
chains `scripts/block-class-guard.test.mjs`. That guard spawns `drain-block-check.mjs` with **no `cwd` option**
(`:91`, `:108`), so the child inherits the linked-worktree cwd — and s2224's F-2223-1 cure makes `drain-block-check`
**refuse** from a linked worktree by design (`⛔ CANNOT VERIFY`, exit 2), which is correct, because a lane's frozen
board is never a lawful answer to "has main shipped this?".

Result: **a fire that obeys the law gets 2 red tests on every drain gate.** Attributed by control at s2272 — the same
worktree with the merge reverted reds identically, while main at the repo root passes:

| Tree | cwd | Result |
|---|---|---|
| main, no slice | repo root | rc=0 PASS |
| merged slice | `gate-s2272/` | rc=1, 3 pass / 2 fail |
| pre-merge main, SAME worktree | `gate-s2272/` | rc=1, 3 pass / 2 fail |

The direction is SAFE — a loud refusal, never a false green, so nothing has ever been mis-merged on it. The harm is
F-1460-1: **a battery that reds on every law-abiding drain gets excused into uselessness**, and today every draining
fire must re-derive that excuse by hand.

## Scope (each item testable)

1. **Decide and WRITE DOWN which board each assertion is about.** The guard reads goal leaves locally and spawns
   `drain-block-check` to cross-check them. In a gate worktree those are two different boards. State in a comment at
   each spawn site which tree the assertion means and why. This is the whole task — the code change is small and the
   reasoning is the deliverable.
2. **Make the two assertions correct from a linked worktree**, without weakening them at the repo root. The two
   candidate shapes, and you must justify the one you pick rather than defaulting to it:
   (a) point the spawn at the MAIN worktree root so the guard always asks about main's board — but then the *local*
       leaves it compares against must come from the same tree, or the denominator-parity assertion silently compares
       two boards (**this is the F-2221-1 trap; do not walk into it**);
   (b) keep the spawn cwd-inherited and have the guard DECLARE-and-SKIP when the corpus tree is a linked worktree,
       the F-2225-1 `attended-owed-audit` precedent — but a SKIP that is invisible is F-2227-2's hazard, so it must
       say so loudly in its output.
   Either way: **the repo-root behaviour must not change at all.**
3. **Do NOT edit `scripts/drain-block-check.mjs`.** Its refusal is correct and is guarded by four separate suites.
   If you believe the defect is there, STOP and report — do not fix it.
4. **A guard for the guard.** New `scripts/block-class-guard-worktree.test.mjs`, rooted in `test:ledger-guards`
   (add the leg to `package.json` in the same commit — an unrooted gate reds `gate-caller-audit`, see F-2272-1).
   Its fixture must build a REAL linked worktree and let main gain a blocked leaf AFTER the worktree branches, so the
   two trees genuinely diverge (s2223's rule: a staleness fixture must plant its ground truth in a corpus that
   actually goes stale — shipping it via a corpus reachable by ref from inside the worktree proves nothing).
5. **Prove the teeth by manufacturing the defect, not by a green.** Restore the pre-cure spawn verbatim on a scratch
   copy and record how many arms red. Then manufacture each over-general cure you can think of — at minimum
   *forcing `cwd` globally* and *skipping unconditionally* — and record which arm catches each. An arm that no
   variant reddens is decoration; say so and fix it (s2226's reachability duty).
6. **Behaviour-neutral before landing (F-1274-2).** At the repo root, `test:ledger-guards` must be byte-identical in
   verdict and rc to its pre-change self. Assert the control arm actually PRODUCED output before believing it
   (F-2215-1) — and note a SKIP is not silence and satisfies a naive "did it run?" test (F-2227-1).

## Firewall

Touch ONLY: `scripts/block-class-guard.test.mjs`, the new `scripts/block-class-guard-worktree.test.mjs`,
`package.json` (the one new battery leg), BACKLOG row, `tasks/goals.json` leaf.
NO changes to: `scripts/drain-block-check.mjs`, any other guard or its baseline, `scripts/fire.md`, `CLAUDE.md`,
`server/**`, any game code, any other lane's files.

## Self-check (evidence, not vibes)

`npx tsc --noEmit` clean; `npm run build` green; `npm run test:ledger-guards` **rc=0 at the repo root** AND
**rc=0 from a detached linked worktree** — that second run is the entire point, quote both; the new guard's red arms
each proven by a manufactured defect with the arm counts written out; `gate-caller-audit` PASS (your new leg is
rooted). End: **READY-FOR-GATES** + report: which of (a)/(b) you chose and the reason you rejected the other, the
manufactured-variant table, and whether any arm proved unreachable.

## No-op / honesty guard

If you conclude the two assertions cannot be made meaningful from a linked worktree without weakening them, the
STOP report saying so — with the reasoning and the option table — IS the deliverable. A guard that is honestly
skipped and says so beats a guard quietly rewritten to pass.
