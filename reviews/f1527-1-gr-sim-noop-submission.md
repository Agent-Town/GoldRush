# f1527-1 — GR-SIM gains a way to say NOTHING

**Slice:** `f1527-1-gr-sim-noop-submission` (F-ER02-2, P0)
**Branch / tip:** `lane/a` @ the runner's auto-commit on base `3985f42fe012568e325429527ab3a3fc3e9be315`
**Merged to main:** `b55e6ac56b7b5737883f7f7079994903d1c11831`
**Gated by:** s1528 fire, 2026-08-07, in detached worktree `gate-s1528` (§3.0b custody)
**Node:** 26.4.0 (the `.nvmrc` pin) on every arm — stated explicitly per F-1527-3, which found the
previous lane run reporting reds that were a Node-major artifact rather than the slice.

## Verdict

**PASS — MERGED.** Two findings filed, neither blocking (F-1528-4, F-1528-5).

## What it does

`scripts/gr-sim.mjs` gains two lines in `readOrders`: a whitespace-only stdin line and a parsed JSON
`null` each `return` **before** `sim.submitOrders(...)`. The turn advances; nothing is billed. Before
this, `readOrders` looped until a submission was *accepted*, so there was no exit from the wait that
did not submit — and every submission **replaces** the standing-order record set, which is why
`outcome.calls` measured the protocol rather than the rider (20 rider calls vs 34–38 submissions on
the rehearsal card; 3 vs 341 on a probe, 113×). `outcome.calls` is what AP-07 exports to Prime
Intellect as `num_turns`, so this is the economy axis.

`[]` deliberately remains a **counted, plan-replacing** submission. That was derived, not chosen:
`scripts/gr-sim.test.mjs` already drives the stdin path with a fixture whose last two lines are `[]`
and pins the run at `calls: 5` / `eventLogHash: fnv1a32:f63d981b`, so making `[]` the sentinel would
have moved a change-detector whose own comment forbids pasting over it.

## Evidence (re-derived on the merged tree)

### The pin the master made the acceptance criterion — checked structurally, not by report

`scripts/gr-sim.test.mjs` is **pure insertion**: all 558 pre-existing lines survive **in order** in
the 573-line result (verified line-by-line, not by reading `15 0` off a numstat). The three pin lines
— `calls: 5,` · `eventLogHash: 'fnv1a32:f63d981b',` · `assert.equal(lines.at(-1).calls, 5);` — are
**byte-identical before and after**. `[]` did not change meaning, and nothing was re-pinned
(F-1441-3 holds).

### Four arms, and a control arm on pre-merge main

`--contract e1-dry-gulch --seed bench-001`, plan = `[{ verb: HOLD, pos: {x:12,z:12} }]`:

| Arm | merged tree | main (pre-merge) |
|---|---|---|
| **P** plan, then `null` ×21 | rc 0 · **calls 1** · `fnv1a32:09ae04fa` · final order `active/orders-1-1` | **rc 1** · 21 rejections · run DIED |
| **B** plan, then **blank line** ×21 | rc 0 · **calls 1** · `fnv1a32:09ae04fa` · `active/orders-1-1` | **rc 1** · 21 rejections · run DIED |
| **R** the same plan ×5 (control) | rc 0 · **calls 5** · `fnv1a32:b2226120` · `active/orders-5-1` | rc 0 · **calls 5** · `fnv1a32:b2226120` · `active/orders-5-1` |
| **BAD** `{oops}`, then the plan, then `null` ×20 | rc 0 · **1 rejection logged**, loop CONTINUED, calls 1 | rc 1 · 21 rejections · run DIED |

Driver archived at `logs/runs-archive/s1528-gate-driver-noop-arms.mjs` (RETENTION LAW).

Four things that table establishes which the runner's report did not:

1. **The blank-line half is proved ALONE.** The runner's single test mixes one `''` among 21 `null`s,
   so a blank-line sentinel that did nothing would have been invisible behind the nulls. Isolated, arm
   B is not merely green — it is **hash-identical to arm P** (`09ae04fa`), i.e. the two sentinels are
   the same turn.
2. **The negative control shows the cure is load-bearing, not cosmetic.** On pre-merge main both
   sentinel arms **exit 1** after 21 consecutive rejections and a `stdin ended while gr-sim was
   waiting` throw. A rider previously had no way to pass a turn at all: it was submit, or die.
3. **The untouched path is byte-identical across the merge.** Arm R gives `calls 5` and
   `fnv1a32:b2226120` on **both** trees, with the same final order id `orders-5-1` — showing both
   that the cure is surgical and (via the id generation) that a resubmission really does replace the
   record set, which is the premise F-ER02-2 rests on.
4. **The malformed-input path still LOOPS rather than returning.** This was the regression worth
   worrying about, because `if (!next.value.trim()) return;` sits *above* the `JSON.parse`: a garbage
   line must not be silently swallowed as a free turn. Arm BAD logs exactly **1** rejection and then
   consumes the real plan — reject-and-continue is intact.

### Battery

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **0 errors** |
| `npm run build` | **green, 1.44 s** |
| `npm run test:node-guards` | **rc=0 · 355 tests · 352 pass · 0 fail · 3 skipped** |
| The `[]` pin, by name | ✔ *"gr-sim replays the same contract, seed, and orders byte-for-byte"* — **PASSING, UNEDITED** |
| The new regression test | ✔ *"gr-sim keeps standing orders through free blank and null turns"* |
| Pinned E2 Baron test | ✔ *"the E2 Baron fights keep their pinned outcomes"* — **UNMOVED** |

**No browser boot probe, and the reason is recorded rather than omitted.** The merged content is two
Node files — a CLI that is never bundled and its test. Zero `src/`, zero `e2e/`, zero config, so a
browser probe would measure main and not this slice. Same reasoning s1527 recorded for the same file.

## Merge classification

| File | Class | Resolution |
|---|---|---|
| `scripts/gr-sim.mjs` | **LANE-TOUCHED only** | direct application |
| `scripts/gr-sim.test.mjs` | **LANE-TOUCHED only** | direct application (pure insertion) |

`git log 3985f42fe..main` over both files is **EMPTY** — main never moved either since the lane's
base, so no MAIN-MOVED bucket and no graft. A real `git merge --no-ff lane/a` was performed in the
detached gate worktree, and the blobs are identical across all three of main's working tree,
`lane/a`, and the gate merge (`34ebe4cd`, `6dfa976a`) — the tree that landed is the tree that was
gated.

## Findings

**F-1528-4 (non-blocking) — the sentinel is silent, and silence is the failure mode this file
already knows about.** Every other terminating path in `readOrders` writes to stderr: a rejected
parse says `gr-sim rejected orders: …`, a rejected submission says so too. The two new `return`s say
nothing. A rider that sends a slightly-wrong line — say `"null "` with a trailing character, or an
empty JSON string — cannot tell "my turn was passed" from "my orders were consumed" by any output.
It is not wrong (calls and the event log both distinguish the cases *afterwards*), but a one-line
stderr note would make the free turn observable at the moment it happens, which is exactly the
property F-ER02-3's drain (F-1527-1) found missing in the neighbouring cure. Cheap; worth folding
into whichever master next opens this file.

**F-1528-5 (non-blocking, recorded because it bounds the cure) — a blank line and `null` are free,
but nothing yet caps a rider that never sends either.** F-ER02-2 and **F-ER02-1** (the surprise
storm: a failing order raises a surprise → mints a turn → re-arms the failing order, measured at
1,200 capped turns from a single mis-aimed order) are two halves of the same billing defect. This
merge supplies the *ability* to hold; it does not stop the storm from minting turns the rider never
asked for. F-ER02-1 remains the next fire-authorable ER-02 repair and its surface, `scripts/gr-sim.mjs`,
is free as of this merge.

## GZ-01

**Skipped, deliberately.** Factory/rider instrumentation on a CLI no player can see; the filter law
wants a player-visible change.
