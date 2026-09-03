# reel-contract-routing-hazard — drain review (s2493)

**Slice:** `reel-contract-routing-hazard` (F-E8MC-3 corrective)
**Branch / tip:** `lane/c` @ `61ec740cf1a2fea3b97430f2814a980df580796d`
**Merge:** `22b9538e5b9660c2c1ef401313c1d4b4e7d34ff6`
**Drained by:** s2493 fire, 2026-09-04

## Verdict

**MERGED.** The slice fixes a real routing hazard, proves it with a
before/after hash, and its one red is measured to be a pre-existing flake in
the test's own construction rather than a regression.

## What it does

A reel used to resolve its contract from *page location*. That is wrong for a
replay: a tape carries its own contract, and a landing deep link, a town board
or a locationless module worker can each present a different location. The
slice makes `BrowserAgentTapeWorker` stage the tape's own contract **before**
the dynamic import of the replay graph, and `activeContractSelection()` consult
page location only for an ordinary boot. `AgentTapeReplay` restages the
validated tape contract and publishes contract / tile / bounds in snapshots.

The proof is a hash agreement, not a description: the era-5 Hill Mine crown was
claimed/node `fnv1a32:0cdd3e78` against browser `fnv1a32:ba92dd65` before the
fix, and all three read `fnv1a32:0cdd3e78` after.

## Evidence (merged tree, detached worktree `gate-s2493`, `--workers=1` per §3.1)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 2.19s |
| `e2e/agent-reels.spec.ts` | **19 passed / 1 failed** (20 tests, desktop + 390px, 6.6m) |
| the one red | frame-budget ratio test — **measured NOT this slice**, see below |
| `test:node-guards` | **not required**: the diff touches `src/meta/` and `src/replay/`, none of `src/sim/` `src/systems/` `src/entities/`, so F-1460-1's path trigger does not fire |

**What I tested is exactly what shipped.** The merge on main was landed by taking
the gated commit's `tasks/BACKLOG.md` verbatim rather than re-resolving, and the
resulting tree hash is **byte-identical** to the gated tree
(`c3000ee6d259706ad5d2889c04391a97569364ee`), asserted rather than assumed.

## Findings

### F-2493-2 — the drain-owed engine pin must be COMPUTED on the merged tree; the runner's hash is honest about a tree that never ships

The lane's own evidence row names a drain duty: *"the full node battery correctly
reds until the drain appends engine hash `024d2587…`; that registry is outside
this task's firewall."* **That hash is correct and must not be pinned.**

Measured, with the method validated against a known answer first (F-2215-1) — a
git-object replica of `computeEngineHash` reproduces main's declared
`49c34f8b…` exactly, so the replica is sound:

| Tree | engine files | hash |
|---|---|---|
| `main` | 488 | `49c34f8b…` (matches the declared `engineHash` — control) |
| `lane/c` @ `61ec740cf` | 486 | **`024d2587…`** — exactly what the runner reported |
| merged (`22b9538e5`) | 488 | **`5442360305b6…`** ← pinned |

The runner was **entirely honest**: `024d2587…` is precisely its own lane tree's
identity. But that tree is 135 commits behind main and carries two fewer engine
source files, so it is not the tree that ships. Pinning it would have written an
identity into `assets/engine-era.json` that **no shipping tree ever produces** —
a phantom the engine-era guard would then compare live tapes against.

Confirmed by two independent methods agreeing on the merged hash (a disk read of
the gate worktree, and a git-object read of the gate commit), and confirmed that
`assets/engine-era.json` is **not** among `ENGINE_SOURCE_INPUTS`, so appending
the pin cannot change the hash it records.

**Reusable:** a runner computes every derived value on the tree it can see. Any
value a drain is told to carry forward — a hash, a count, a baseline — must be
**re-derived on the merged tree**, because the lane tree and the shipping tree
are different objects and only one of them is ever published. This is Mistake #4
applied to a number rather than to a claim.

### F-2493-3 — the reel frame-budget test reds on load *phasing*, and its margin on main is thin

`e2e/agent-reels.spec.ts` › *"the crown reel wears live-game sprites mid-ride
inside the live-map frame budget"* asserts `reelP95 <= liveP95 * 1.15`. Its own
comment calls this **"LOAD-INVARIANT ON PURPOSE"**, because both terms are
measured in the same run on the same machine — and F-2453-1 removed an absolute
ms pin from this exact site for good reason.

The ratio is invariant only if load is constant **between** the two
measurements, and it is not. Measured, six solo runs:

| Tree | run 1 | run 2 | run 3 |
|---|---|---|---|
| `main` (control) | 0.9608x | 0.9615x | 0.9515x |
| merged | 0.6478x | 0.9515x | 0.9320x |

All six pass; the merged tree is **equal or better** on every comparable sample,
so the red is not a regression from this slice. The two observed failures both
occurred while other work was running, and `liveP95` was seen anywhere from
**10.2 ms to 42.4 ms** on one machine — a 4× swing. A high `liveP95` makes the
budget generous (the 42.4 ms run passed at 0.3986x); the failure mode is the
reverse phasing, where the live map is measured quiet and the reel loaded.

⚠️ **Not fixed here, deliberately.** Widening the multiplier would be
"raise it until it goes green" (F-1441-3), and this drain has no mandate to
re-pin someone else's performance contract. What is worth recording is that
**main's own margin is only ~0.19** (0.96 against 1.15), so this test is close
to its bound in ordinary conditions and should be expected to red again under
concurrent factory load. That is a real candidate for an attended ruling: either
measure both terms under a quiesced condition, or state the invariant in a form
that does not depend on inter-measurement load.

## Merge classification

Base `main` @ `2e802a5f6`. Trial-merged in a detached worktree (§3.0b);
undecided content never entered main's working tree, and the merge was committed
as one act (F-1589-5).

| Path class | Files | Resolution |
|---|---|---|
| LANE-ONLY | `e2e/agent-reels.spec.ts`, `e2e/true-reel-harness.spec.ts`, `src/replay/AgentTapeReplay.ts`, `src/replay/BrowserAgentTapeWorker.ts` | clean, no main movement |
| BOTH-MOVED, auto | `src/meta/ContractFamilies.ts` | auto-merged by `ort`, disjoint hunks |
| BOTH-MOVED, CONFLICT | `tasks/BACKLOG.md` | **UNION**, resolved by hand |

The `BACKLOG.md` conflict was caused by my own drain-1 row prepended minutes
earlier, plus 135 commits of main movement the lane could not see.

**The union was verified by set difference against both parents** — a method that
could not have produced the result: **0** rows from main absent from the merge,
and **1** lane row absent. That one was read rather than assumed, and it is a
**lawful retirement**: `F-2470-1` exists on main in its *cured* form
(`CURED s2474, merge 07d8c6d3d`) while the 135-commit-stale lane still carried
the open `🔴` version. Keeping main's cured row is correct; a naive row-count
check would have scored it as a loss (the known failure mode of union checks).

`git log main..lane/c` is empty after the merge — fully absorbed.

## Bookkeeping landed with this drain

- Goal leaf `reel-contract-routing-hazard` → `merged`, with the 40-char merge hash.
- `assets/engine-era.json` pin **19** appended: `5442360305b6…` (see F-2493-2).
- Done-move renamed `drained-s2493-…`.

## What this unblocks

`e4-vehicles-plain-boot` (lane-c, F-E4-3) **stopped at its lane-safety pre-flight**
at 04:53, refusing to reset `lane/c` over this undrained commit — it spent 48,856
tokens and correctly changed nothing. That refusal is a firewall **success**
(Mistake #2's defence working as designed), and this drain removes its blocker.
The master survives at `tasks/e4-vehicles-plain-boot.md` and is re-queueable now
that `lane/c` reads `ahead=0`.
