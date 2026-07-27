# Task lane-queue-shipped-guard: THE GATE THAT READS "merged" AND WAVES YOU THROUGH — teach `drain-block-check.mjs` the QUEUE-TIME question (LANE-C, commit prefix "fix:")
**FIRE-AUTHORED (attended review welcome) — s1115, 2026-07-27. This is NOT a new gate. It is one missing exit code in a gate that already loads the deciding fact and then throws it away.**

You are Codex, implementer for Gold Rush (worktrees/lane-c).
CODEX: model=gpt-5.6-sol effort=high

## PRE-FLIGHT (SAFE-DUPE — copied VERBATIM from `.claude/skills/author-task/SKILL.md` §3, LANE slots)
> Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B <lane-branch> main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

⚠️ **`git log main..lane/e2-arsenal` WILL PRINT ONE COMMIT (`10e1a24c runner(lane-c): lane-board-chapter-seed-scope.md`), AND THAT IS EXPECTED — IT IS *NOT* A REASON TO STOP.**
**Pre-proved for you by s1115, but sanity-check it rather than trusting this line:** that commit touches 4 files and **all 4 blobs are byte-identical to main's** (`git rev-parse 10e1a24c:<file>` == `git rev-parse main:<file>`, 4/4). Its content was drained to main as `b43b31ad` by a tip graft, so the branch reads ahead forever. **Textbook SAFE DUPE** → `git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. The worktree was **CLEAN** at authoring time; uncommitted edits you did not make are still a STOP.

## READ FIRST
- `scripts/drain-block-check.mjs` — all 175 lines, especially its header contract (exit `0 CLEAR` / `1 BLOCKED` / `2 UNKNOWN`) and the `taskFile` → leaf resolution.
- `tasks/BACKLOG.md` → **F-1115-1** (near the top, beside the Stale-check law) — the measurements below are quoted from there.
- `.claude/skills/author-task/SKILL.md` §0 — the three pre-authoring checks; §0.1 is the line you will re-point.
- `scripts/fire.md` §3.0 — the LAW that pins the drain-time contract you must not disturb.

## Why this task (evidence, dated — s1115, 2026-07-27)
The board was dry, so s1115 hunted `tasks/` for queueable masters and probed the three most plausible candidates **by content**. All three were **already shipped to main**:
- `lane-blocked-storage-access-throw.md` → rf-23, drain `7be9ce7b`
- `lane-m2-01-fixture-coordinate.md` → drain `df51d877`
- `lane-m1-m2-resource-guards.md` → drain `f7cd0103`

Queueing any of them is **Mistake #8 (the 824k Flail)**: Codex re-deriving an already-merged diff.

**The ledgers were not at fault** — BACKLOG carried ✅ SHIPPED lines with hashes, and `tasks/goals.json` held all three leaves at `status:"merged"`. **The fault is that the repo's own gate reads that fact and discards it.** ✓ MEASURED on all three:

```
node scripts/drain-block-check.mjs lane-blocked-storage-access-throw.md
✅ CLEAR — lane-blocked-storage-access-throw.md [rf-23-blocked-storage-access-throw] status="merged"     EXIT=0
node scripts/drain-block-check.mjs lane-m1-m2-resource-guards.md
✅ CLEAR — lane-m1-m2-resource-guards.md [m1-m2-resource-guards] status="merged"                          EXIT=0
```

It **prints `status="merged"` and exits `0 CLEAR`.** That is not a bug in what it was built for — F-1104-7 scoped it to the drain-time question *"is this slice BLOCKED from landing"*, and for that, `merged` is legitimately not a block. It simply has no way to answer the **queue-time** question *"is this master already SHIPPED"*, though it is holding the answer. **A fire can run this repo's own gate against shipped work and be waved through.**

**You are not being asked to design the check** — the data, the lookup, and the resolution logic all already exist. You are adding one opt-in mode and one exit code.

## Scope (numbered, each testable)
1. **MANDATORY MEASUREMENT FIRST — reproduce the gap before you change anything, and put the raw output in your report.** Run the CURRENT script against all three masters named above plus `lane-cw-02-wrecker-target-premise.md` (expected `status="authored"`). Record the printed line and the **exit code** for each. ⚠️ **If any of the three does NOT print `merged` + exit 0, STOP and report** — the premise has moved under this master and the rest of the scope is void.
2. **Add an opt-in queue-time mode to `scripts/drain-block-check.mjs`** — suggested `--queue`. In this mode:
   - `status:"merged"` (and any equivalent terminal-shipped status you find in `goals.json`; **enumerate the ones you found in your report**) ⇒ print a clear refusal naming the leaf, its `mergeHash`, and the words `ALREADY SHIPPED — DO NOT QUEUE`, and **exit non-zero**.
   - A blocked leaf must STILL exit `1 BLOCKED` in this mode (a blocked slice is not queueable either).
   - Everything else behaves as today.
   - Reuse the existing leaf-resolution path. **Do NOT copy it into a second function or a second script** — F-1083-1's whole lesson is that a private duplicate manufactures duplicate work.
3. **DO NOT CHANGE DEFAULT BEHAVIOUR — this is the firewall-critical clause.** `scripts/fire.md` §3.0 makes the *default* invocation a mandatory law with a pinned contract (`0 CLEAR` / `1 BLOCKED` / `2 UNKNOWN`). Without `--queue`, every exit code and message must be **byte-identical to today**. Prove it in your report (scope 5).
4. **Re-point the consumer so the tool cannot be forgotten.** `.claude/skills/author-task/SKILL.md` §0 item **1** currently reads *"**Not already shipped**: grep `tasks/BACKLOG.md` for the work — a ✅ SHIPPED line means STOP"*. Rewrite that ONE item so the **command is the primary check** (`node scripts/drain-block-check.mjs <master> --queue`) with the BACKLOG grep kept as corroboration, and keep the Mistake #8 citation. **Edit only that item** — leave §0.2, §0.3 and every other section untouched. (A guard nobody calls is worth nothing; this is the wiring half.)
5. **Mutation control, both directions (mandatory — this is how the guard is proven, not asserted).**
   - **(a) It fires:** run the new `--queue` mode against the three shipped masters. Expect a non-zero exit and the refusal text. Record verbatim.
   - **(b) It is not vacuous:** run `--queue` against `lane-cw-02-wrecker-target-premise.md` (`status:"authored"`). It **must pass** — a mode that refuses everything is worthless. Record it.
   - **(c) No regression to the law:** run the DEFAULT mode (no flag) against the same three and confirm **still `0 CLEAR`, same text**. Record it.
   ⚠️ **If (a) passes only because the argument failed to resolve to a leaf, say so plainly — that is a false green, not a success** (the `ed-04` vacuous-guard class, F-1077-2).
6. **State plainly in your report that `npx tsc --noEmit` does NOT cover this file.** `tsconfig`'s `include` is `["src","e2e","playwright.config.ts"]` — `scripts/` is outside it. Your evidence for this change is the scope-5 runs, **not** the typecheck. Do not imply otherwise. (Run tsc + build anyway as a no-regression check.)

## Firewall
**TOUCH-ONLY:** `scripts/drain-block-check.mjs` · `.claude/skills/author-task/SKILL.md` (**§0 item 1 ONLY**).
**NO:** `tasks/goals.json` — **never mutate real goal data to test**; build any fixture in a temp file or an in-memory object and delete it before you report · `scripts/fire.md` (the fire law file is attended/owner territory — if you believe §3.0 should also cite `--queue`, **report it, do not edit it**) · the default exit-code contract (scope 3) · any other `.claude/skills/**` file or section · `src/**` · `e2e/**` · no new spec file · no new dependency (a fire cannot gate `npm install` — F-1024-4) · `scripts/deploy.sh` (**FORBIDDEN, F-1073-1 — never in any diff**) · no reformatting of untouched lines · **do not mass-edit the ~61 other never-run masters** — that sweep is deliberately NOT in this task.

## Self-check before you report
- `npx tsc --noEmit` clean · `npm run build` green (no-regression only — see scope 6).
- The scope-5 (a)/(b)/(c) runs, **pasted verbatim with exit codes**.
- No diff outside the TOUCH-ONLY list: paste `git status --short` and `git diff --name-only`.
- `tasks/goals.json` **unmodified** — show it is absent from the diff.
- No e2e/screenshot evidence applies: this change has **no runtime or render surface** (a CLI script + a skill doc). Say so explicitly rather than omitting it.

END: **READY-FOR-GATES** + (1) the scope-1 before-table (line + exit code, four masters), (2) the scope-5 (a)/(b)/(c) after-table, (3) the list of terminal-shipped statuses you found in `goals.json`, and (4) anything you believe belongs in `scripts/fire.md` §3.0 that you correctly did **not** edit.
