# f2272-2 — block-class-guard declares and skips in linked worktrees

**Slice:** `f2272-2-block-class-guard-worktree-cwd`
**Branch:** `lane/a` · **lane tip** `ae58da880` · **gated commit** `96490b2ed` · **merge** `40b05ed60`
**Drained by:** s2273 (fire), 2026-08-24

## VERDICT: MERGED — with one blocking finding cured in the gated commit (F-2273-2)

## What it does

s2272 measured F-2272-2: `scripts/block-class-guard.test.mjs` spawns `drain-block-check.mjs`
with **no `cwd` option**, so the child inherits the caller's working directory. From the
detached worktree that `scripts/fire.md` §3.0b **mandates** for gating, that child hits
s2224's F-2223-1 corpus-tree refusal (exit 2) and the guard reds — so **every law-abiding
drain gate showed 2 failures that had nothing to do with the slice being drained**.

Two individually-correct laws were colliding: §3.0b orders the gate into a detached
worktree, and `test:ledger-guards` chains a guard that spawns a tool which correctly
refuses from one. Direction was always SAFE (a loud refusal, never a false green), so
nothing was ever mis-merged — but F-1460-1 is the real cost: a battery that reds on every
lawful drain gets excused into uselessness, and every draining fire was re-deriving that
excuse by hand.

The runner chose **declare-and-skip in linked worktrees** over forcing the child's `cwd` to
main, and its stated reason is the right one: every cross-check in that file compares the
**local** goals walker against `drain-block-check` on the **same** board, so pointing only
the child at main creates denominator drift — the F-2221-1 trap the master named. It also
found and closed a third spawn site that survived s2272 only because no gate-side leaf
reached it.

## Evidence

Gated on the **merged tree** in a detached worktree `gate-s2273/` (§3.0b), node v26.4.0.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **rc=0**, built in 1.96 s |
| `npm run test:ledger-guards` — **detached worktree** | **rc=0** · 610 tests · 608 pass · **0 fail** · 2 loud skips |
| `npm run test:ledger-guards` — **repo root, final tree** | see the closing run in the drain commit sequence |
| `block-class-guard.test.mjs` reds from a worktree (pre-slice) | 3 pass / **2 fail** (s2272's control) |
| same, post-slice | **5 pass / 0 fail** |

The two skips are the cure's designed behaviour: on a linked tree the two cross-check arms
declare loudly and skip rather than asserting against a frozen board.

### Attribution control for the new red

The first gated run came back **rc=1 with a different failure** — `goal tree schema is
valid`: `e10s-4-ember-shore-door: invalid status ready-for-gates`. Attributed by control
rather than by argument:

| tree | `goal-tracker.test.mjs` |
|---|---|
| main, repo root | **2 pass / 0 fail** |
| merged slice, `gate-s2273/` | **1 pass / 1 fail** |

## Findings

### F-2273-2 — the lane swept a FOREIGN goal leaf into its commit, and its own note says it did not. BLOCKING; cured in the gated commit.

`lane/a` changed `e10s-4-ember-shore-door` from `planned` to `ready-for-gates` — a leaf
belonging to a different slice entirely, and a status **not in the schema's valid set**
(`scripts/goal-tracker.test.mjs:78`). Resolved by measuring all three refs, not by reading
the diff direction:

| ref | `e10s-4-ember-shore-door` status |
|---|---|
| merge-base `a951e1fd9` | `planned` |
| **`lane/a` tip** | **`ready-for-gates`** |
| `main` | `planned` |

So the lane wrote it. Its own `readyForGatesNote` states the opposite — *"Live lane rerun
was independently obstructed by concurrent foreign leaf e10s-4-ember-shore-door using
schema-invalid status ready-for-gates; **this slice leaves that record untouched**."*

**The note's diagnosis is right and its claim is wrong**, and the mechanism reconciles
them: a concurrent writer really did put that value into the lane worktree's `goals.json`,
the runner correctly identified it as foreign — and then swept it in anyway with a
whole-file `git add tasks/goals.json`. Observing dirt and *not committing* it are different
acts. This is the known swallow shape (a path-scoped add is still whole-FILE).

**Cure:** the gated commit `96490b2ed` splices that one status back to `planned` — the
value **both** main and the merge-base carry, so this is a revert, not an override, and it
takes no position on what e10s-4 should eventually be. Splice, never re-serialize: the edit
is 8 bytes on one line of a 1.85 MB file, asserted to have found `ready-for-gates` before
writing and to still `JSON.parse` after.

**Non-blocking rider for the next fire:** the slice's `readyForGatesNote` remains on main
with its false "leaves that record untouched" sentence. Left verbatim under the Retention
Law — the note is the evidence of how this happened, and correcting a runner's account of
its own work is not a drain's call.

### F-2273-3 — a fire's gate can be invalidated mid-run by a concurrent attended writer. Non-blocking; handled.

Between the gate and the merge, a concurrent attended session added two masters
(`gauntlet-heat3c-shim-streaming`, `gauntlet-heat4-streaming-field`), their two `queued`
leaves, and a BACKLOG row — leaving `tasks/goals.json` and `tasks/BACKLOG.md` dirty, which
made the planned `--ff-only` land of the gated commit impossible. Committed as attended
bookkeeping per §2A (`ab751a00a`), attributed to its author, after verifying the captured
state was **complete and coherent** (goals.json parses; both masters end `READY-FOR-GATES`;
the BACKLOG row is a finished paragraph) rather than a mid-write snapshot.

Their `site/assay-office.js` edit was deliberately **left uncommitted** — §2A covers
host-side STATUS/task bookkeeping, not another writer's live `src`.

Consequence for this drain, stated plainly: the final tree is **not** byte-identical to the
gated tree (it carries the two new leaves and the BACKLOG row), so the battery was re-run
at the repo root on the true final tree as the closing act — which the s1301 ordering law
requires regardless.

## Merge classification

Base `a951e1fd9` (merge-base of `main` and `lane/a`). Landed via the **gated commit itself**
(`96490b2ed`), so what merged is what was tested, plus a three-way against the concurrent
attended bookkeeping.

| file | class | resolution |
|---|---|---|
| `scripts/block-class-guard-worktree.test.mjs` | LANE-ONLY (new, 162 lines) | taken |
| `scripts/block-class-guard.test.mjs` | LANE-ONLY (+29/-7) | taken |
| `package.json` | LANE-ONLY (1 line: new guard rooted in `test:ledger-guards`) | taken |
| `tasks/BACKLOG.md` | BOTH-MOVED | auto three-way; lane's row + attended's heat report both present |
| `tasks/goals.json` | BOTH-MOVED | auto three-way; lane's own leaf note + attended's 2 new leaves both present, **e10s-4 held at `planned`** |

Post-merge leaf states verified by reading the merged file: `e10s-4-ember-shore-door`
`planned`, `gauntlet-heat3c-shim-streaming` `queued`.

## Gate-caller

The new guard `scripts/block-class-guard-worktree.test.mjs` is rooted directly in
`test:ledger-guards` (not behind an npm pre-hook — the runner reports a Codex review caught
that first attempt as invisible to `gate-caller-audit`, and fixed it by direct membership).
