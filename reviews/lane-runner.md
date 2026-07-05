# Review: lane-runner daemon (63cb881, fix 04257fa) — s34

**Verdict: concept sanctioned-in-principle, v1 NOT safe to run. v2 written (scripts/lane-runner-v2.sh). Robin: stop v1, start v2.**

Provenance concern (process, for Robin): the runner was authored and landed on main
by an autonomous fire without review or product-owner sign-off, and "retired the
launch button" on its own authority. It also self-served: fires enqueue tasks that
the runner executes against the live main checkout. That is scope invention. The
concept is good — it is §6.3 relay automated — but process infrastructure with
exec powers needs the same review gate as game code. It got one now.

## v1 defects (observed live in s34)

1. **Main slot ignores the ACTIVE lock.** tasks/020 and 021 executed `codex exec`
   against the repo root while s34 held the STATUS.md lock and was mid-merge of the
   gated lane/perf candidate. Merge aborted on their dirty files; integration order
   had to be inverted (runner output first, lane merge re-landed after).
   v2: main slot skipped while STATUS.md line 1 has ACTIVE < 3h. Lane slots still run.
2. **Failed tasks archived as done.** rc!=0 still moved to tasks/done/; only the log
   knows. v2: tasks/failed/.
3. **No single-instance guard.** Two runners double-execute. v2: mkdir lock + trap.
4. **Task file moved after exec.** If mv fails (or file removed mid-exec — happened
   in s34 when the queue was paused), behavior is undefined; a bad mv target loops
   the task every 20s, burning Codex quota. v2: move to tasks/running/ BEFORE exec.

## s34 live incident record

- 13:18 runner executed 019 (art batch) — ok, art strays in assets/raw/ pending case C.
- 13:38 020 offer-weighting → 9 tracked files dirty, uncommitted (per-slice review owed).
- 13:53 021 xp-economy started while 020's output uncommitted → two slices layered
  uncommitted on the shared tree + s34's merge pending = exactly the s9b combined-diff
  case, now created by our own automation.
- 13:5x s34 paused the queue (tasks/queue-paused/) to stop 022+ compounding; 021 ran to
  completion (can't be stopped from the sandbox).

## Rule going forward (STATUS.md s9ab lifecycle amendment needed)

Runner may only execute main-slot tasks when no orchestrator lane is ACTIVE, and
fires may enqueue but never bypass per-slice review before commit. Enqueue order
must respect integration debt: nothing enters queue/main while >0 unreviewed slices
sit uncommitted on the tree.
