# gate-s1455 — full content audit and salvage (s1494)

**Subject:** the leftover gate worktree `gate-s1455/` (~14 GB), registered in `git worktree list` at
detached `7c8331970`, left in place by s1480 → s1493.
**Why this exists:** s1493's handoff offered it to the next fire as *"its `run-gate.mjs` was already
salvaged (F-1480-3). Removing it is a disk win, not a history loss — but it is a deletion, so I left
it."* That read is **correct about `run-gate.mjs` and incomplete about the worktree**, and the
difference is worth writing down before anyone acts on it.

## What the worktree actually holds (measured, not inferred)

`git -C gate-s1455 status --porcelain` returns **19 entries in three classes**, not one:

| Class | Entries | Verdict |
|---|---|---|
| Untracked | `node_modules`, `run-gate.mjs` | disposable / already preserved (below) |
| Regenerated artifacts (F-1407-1 churn) | 10 `.png` / `.json` under `artifacts/e1-twin-banks/`, `artifacts/gt-05/` | disposable |
| **STAGED IN THE INDEX** | `A artifacts/f1453-1/{report,census-before,census-after,speeds-before,speeds-after}` · `A e2e/f1453-crossings-hygiene.spec.ts` · `M src/entities/Enemy.ts` | **the class the inherited note did not account for** |

A staged index is exactly the shape that reads as "clean enough to delete" from a distance and is not.
So each entry was compared to main **by blob hash**, never by name (F-1295-1: a name-level check
returns the same answer whether the content is preserved or lost):

```
SAME  artifacts/f1453-1/report.md         ba897905d800
SAME  artifacts/f1453-1/census-after.txt  2e98573e832d
SAME  artifacts/f1453-1/census-before.txt 2e98573e832d
SAME  artifacts/f1453-1/speeds-after.txt  d98769481aa2
SAME  artifacts/f1453-1/speeds-before.txt d98769481aa2
SAME  e2e/f1453-crossings-hygiene.spec.ts e8837a8016f4
DIFF  src/entities/Enemy.ts               wt=eeefafc29c9b  main=0f37c0c5b581
```

**Six of the seven staged paths are byte-identical to main.** The f1453-1 investigation's whole
evidence chain and its new spec are already committed; nothing there dies with the disk.

`run-gate.mjs` is untracked **in this worktree**, but its blob `f4a0b5cc83c0` resolves to **2 tracked
copies** in the index, so F-1480-3's salvage genuinely happened and s1493's claim about it holds.

## The one byte that exists nowhere else — salvaged here

`gate-s1455/src/entities/Enemy.ts` differs from main by exactly one line, in `ClaimJumperEnemy`:

```diff
@@ -1025,7 +1025,7 @@ export class ClaimJumperEnemy {
     } else {
       this.watchdogElapsed += delta;
     }
-    if (this.watchdogElapsed >= Balance.pathing.stuckWatchdogSeconds && route.blocker) {
+    if (this.watchdogElapsed >= Balance.pathing.stuckWatchdogSeconds) {
       this.watchdogTrips += 1;
       this.watchdogElapsed = 0;
       this.gnawTarget = route.blocker;
```

Read in the direction that matters: **main has the `&& route.blocker` gate; this worktree has it
removed.** That is the pre-`4ab48743` state — `4ab48743` is f1452-1 fort-solidity, the commit that
*added* the gate and, through it, moved routing → engagement → 8 fewer kills over 20 waves (the cause
named at the `e1-baron` pin site in `scripts/gr-sim.test.mjs`, F-1460-1).

So this worktree is a **control arm**: an A/B probe holding the watchdog's pre-fix behaviour, whose
conclusion is already on main as `artifacts/f1453-1/report.md`. It is an experiment's scaffolding,
not unfinished work — and the diff above reconstructs it in five seconds.

## Verdict

**With this file committed, removing `gate-s1455/` is provably lossless.** Every unique byte it held
is now either on main already (six paths, by hash), tracked elsewhere (`run-gate.mjs`), regenerable
churn (the ten artifacts), or reproduced verbatim above (the one-line revert). The commit
`7c8331970` it is detached at stays in the object database regardless, so the worktree can be
recreated with a single `git worktree add --detach 7c8331970 <path>`.

**NOT REMOVED BY s1494, deliberately.** A 14 GB `rm -rf` is a deletion, CLAUDE.md §4.10 and §7 both
route deletions to the owner rather than to a fire's judgement, and nothing is blocked by the disk
today. What was missing was never the authority — it was the evidence, which is now here. The next
fire or attended session can act in one command:

```
git worktree remove /Users/robin/Claude/Projects/Gold\ Rush/gate-s1455 --force
```

⚠️ **The reusable lesson (F-1494-1):** "already salvaged" was true of the file that had been *looked
at* and silently generalised to the worktree that contained it. A leftover worktree has **three**
independent content classes — untracked, working-tree-modified, and **staged-in-index** — and an
audit that reads only the first will call a worktree with a loaded index empty. `git status` shows
all three; the trap is that a staged file's `A`/`M` prefix looks like bookkeeping rather than like
content nobody else has.
