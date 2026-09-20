# lane-a — F-1311-2: make the master-judging guard run BEFORE the queue copy, not after

**FIRE-AUTHORED (attended review welcome) — s1311, 2026-08-01.**
**Role:** implementer. **Workdir:** `worktrees/lane-a` (branch `lane/m3`). One task, one branch, path-scoped commits.

## READ FIRST (paths, in this order)

1. `scripts/drain-block-check.mjs` — **the whole file**, and especially the `--queue` arm (search for
   `const queue = argv.includes('--queue')` and the `if (queue) {` block below it). This is the command
   `.claude/skills/author-task/SKILL.md` §1 step 1 already prescribes **before** a master is copied into a
   queue. You are adding **one more refusal to a pre-queue gate that already exists** — not a new script,
   and **no new npm entry**.
2. `scripts/citation-title-guard.mjs` — the whole header docblock. Three things bind this task:
   its denominator is `git ls-files tasks` and **only** that; it is a **RATCHET with an explicit
   grandfathered baseline** (`scripts/citation-title-baseline.json`), not a sweep; and it accepts three
   citation shapes (exact/prefix, title-plus-trailing-words, mid-quote elision). Do not reimplement any of
   this — **call it**.
3. `scripts/drain-block-check.test.mjs` — the fixture shape your tests must match.
4. `tasks/BACKLOG.md` — finding **F-1311-2** (top of file). The measurement below is taken from it; do not
   re-litigate it.

PRE-FLIGHT (LANE-SAFETY invariant): `node scripts/lane-usable.mjs lane-a` must print **USABLE**. If it prints
AHEAD-BUT-ABSORBED, HOLDS, DIRTY or BUSY: **STOP** and report the word verbatim. Dirty tracked blobs must be
reachable in git, else STOP.

## WHY (measured s1311 — established from the factory's own files, not inferred)

s1307 recorded that `lane-a-f1305-2` ran **twice** and left the mechanism explicitly OPEN, warning that its two
candidate cures pointed in opposite directions. Both were wrong, and the proof is on disk: the runner moves
`running/`→`done/` on rc=0, so **both copies survive**, and `diff`-ing them yields **exactly the 2-line citation
edit of commit `3f59bcca`**. Run 1 executed the PRE-edit master; run 2 executed the POST-edit master.

**The second entry was not a duplicate. It was a different version.** A dedupe-at-queue-time or an
idempotence-at-pickup guard would have silently discarded the **corrected** master and kept the defective one.

The real sequence, every step timestamped:

| time | event |
|---|---|
| 00:23:38 | s1306 authors the master (`4aff1a7c`) and copies it to `tasks/queue/lane-a/` |
| 00:23:55 | runner `mv`s it to `running/`, writes the per-slot pidfile, dispatches **run 1** |
| 00:26:09 | s1306 hands off |
| **00:27:21** | **`test:ledger-guards` — run as the LAST act per the s1301 law — REDS `citation-title-guard` against s1306's OWN master.** s1306 fixes it (`3f59bcca`) and re-copies it to the queue |
| 00:27–00:43 | the pidfile makes the runner skip lane-a entirely; the second copy sits invisible for ~16 min |
| ~00:43:15 | run 1 finishes rc=0, clears the pidfile |
| 00:43:29 | one `sleep 15` poll later (`scripts/lane-runner-v3.sh` line 149), the runner dispatches **run 2** |

**This is not a runner bug. The runner behaved correctly at every step.** It is a collision between two laws
the factory already has: author-task SKILL §5 (`Queue discipline (after writing)`) says the queue gets its COPY
as soon as the master is written, while the s1301 clause says run `test:ledger-guards` as your LAST act — and
that battery includes `test:citations`, **which judges tracked `tasks/**`, i.e. your master.** So a fire that
obeys both laws perfectly still learns its master is defective only once a runner is already burning tokens on
it, and re-copying is then the only way to deliver the fix.

It is the **F-1300-4 shape inverted**: that finding says the ledger guards run *before* the row you are about to
write; this one says the master-judging guard runs *after* the master has already been dispatched.

⚠️ **Read the cost correctly.** 24,818 tokens for zero edits is the visible half. Run 2 stopped only because
that master carried the safe-dupe pre-flight above, which read `HOLDS` against run 1's own committed work.
**A master with a bare `reset --hard` pre-flight would have destroyed run 1 — Mistake #2 exactly.** The class is
data-loss, not token-waste.

## SCOPE (three slices; each ends in its own checkable checkpoint — if a later slice fails, the earlier ones still stand; STOP and report rather than reverting them)

1. **Teach the existing pre-queue gate one new refusal.** In `scripts/drain-block-check.mjs`, when `--queue` is
   given a task-file argument, additionally evaluate the **citation law against that named master only**, and
   refuse (exit 1) if it violates it. Requirements, all load-bearing:
   - **Call `citation-title-guard`'s logic; do not reimplement it.** Its three accepted shapes and its
     elision handling were measured into existence by F-1224-1; a second, dumber parser here would red on
     citations the real guard accepts. Import from it or shell out — implementer's choice — but the accept/reject
     decision must come from that file.
   - **Scope to the named master.** A red in some *unrelated* master must NOT block this queue. The failure
     being cured is "your own master is defective", not "the board is dirty".
   - **The grandfathered baseline still holds.** If the named master's citations are already in
     `scripts/citation-title-baseline.json`, `--queue` must **PASS**. Legacy masters get re-queued (Mistake #8
     stale-checks, wall recovery sweeps); reddening them would break re-queue outright, which is worse than the
     defect being cured.
   - The refusal message must name the master, the offending citation, and say what to do (add the test title).
   - **Checkpoint:** `node scripts/drain-block-check.mjs <a master with a fresh bare citation> --queue` exits 1.

2. **Fixture tests in `scripts/drain-block-check.test.mjs`.** Four, using the file's existing `--root` fixture
   pattern:
   - a master with a **fresh bare** citation — a spec path plus a line number, no test title beside it —
     → `--queue` **exit 1**;
   - the same citation **with** a resolvable test title → `--queue` **exit 0**;
   - a bare citation that **is present in the baseline** → `--queue` **exit 0** (the ratchet is respected);
   - the **drain** arm (no `--queue`) on the offending master → **unchanged behaviour**. This one is the
     regression fence: §3.0 must not start refusing drains over a citation.
   - **Checkpoint:** `node --test scripts/drain-block-check.test.mjs` all pass.

3. **Prove it on the real board, then prove it does not red it.**
   - **Manufactured red (the acceptance bar):** create a throwaway master file under `tasks/` containing one
     bare `e2e/*.spec.ts:<line>` citation, run `--queue` against it, paste the rc and message, then **delete the
     throwaway**. A passing guard never executes its violation path, so a green says nothing about the red.
   - **Negative control (population):** run `--queue` against **at least five** real, currently-tracked masters
     including at least two authored before s1250. They must all still pass. Paste the list and the results.
     If any real master reds, that is a **finding to report, not a thing to fix** — it means the baseline
     interaction is wrong and you must STOP.
   - **Checkpoint:** the throwaway is gone (`git status` clean of it) and the five real masters pass.

## FIREWALL

**TOUCH-ONLY:**
- `scripts/drain-block-check.mjs`
- `scripts/drain-block-check.test.mjs`

**NO — out of scope, report if you see a problem, do not fix it:**
- `scripts/citation-title-guard.mjs` and `scripts/citation-title-baseline.json` — **do not change either.**
  You are a new *caller* of that guard, not its editor. A baseline diff means you paid down debt instead of
  gating new debt, which is a different task.
- `.claude/skills/author-task/SKILL.md`, `scripts/fire.md`, `CLAUDE.md` — the prose ordering law is a fire's
  act, not a runner's. s1311 will land the SKILL §5 wording itself once this mechanism exists.
- `scripts/lane-runner-v3.sh` — **explicitly out of scope, and this is the finding's main point.** No dedupe,
  no idempotence guard, no queue-scan change. The runner did nothing wrong.
- `tasks/goals.json` — do not land any ledger edit.
- **Add no new npm script.** `gate-caller-audit` roots gates and a new unrooted script reds it; you are
  extending a file already rooted in `test:node-guards` and `test:ledger-guards`.
- Any `e2e/`, any `src/`, any other guard.

## SELF-CHECK (name the exact commands and paste real numbers)

1. `npx tsc --noEmit` → clean.
2. `npm run build` → rc 0.
3. `node --test scripts/drain-block-check.test.mjs` → all pass, incl. the four new assertions.
4. `npm run test:node-guards` → **rc 0**. (Baseline to beat: **199/199** on the tree you branch from. Derive it,
   don't trust this number — if your count differs, say so and explain the delta before proceeding.)
5. `node scripts/drain-block-check.mjs --all` → still **4 BLOCKED**. Negative control: a gate gained a refusal,
   the board's blocks did not change.
6. `npm run test:citations` → rc 0, and paste its remainder line. Your change must not move it.
7. `git status --porcelain` at the end → **only the two TOUCH-ONLY files.** Paste it. `tasks/goals.json`,
   `citation-title-baseline.json` and any throwaway master must NOT appear.

**No playwright, and say so rather than skipping it silently:** this task touches one node guard and its test.
Zero `src/`, zero `e2e/`, no runtime surface to drive.

**READY-FOR-GATES + report:** the manufactured red (rc + message) and the deleted throwaway · the five real
masters that still pass, named · the four fixture transcripts, especially the **baseline-respected** one and the
**drain-arm-unchanged** one · the final `git status` · and anything you found that this rule would have caught
and did not.
