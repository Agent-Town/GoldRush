# f1405-1 — land the cross-engine wave-scaling cure

**Slice:** `f1405-1-land-the-cross-engine-wave-scaling-cure`
**Branch/tip:** main slot, run `20260802-220911-main-f1405-1-...` · gate on `5ca084ab` (s1406)
**Verdict:** ✅ **MERGED.** The cure is correct and is now proven against a subject that actually
diverged — which the run itself never measured. Three findings, none blocking.

## What it does

Replaces all five sim-reachable `Math.pow(base, wave)` calls in `src/systems/WaveSystem.ts` with a
file-local `scalePerWave` helper doing repeated multiplication (spawn speed, spawn HP, trickle
interval, baron component HP, baron component speed). IEEE-754 multiplication is exactly specified
where `Math.pow` precision is implementation-defined, so the sim stops inheriting V8's per-version
pow. Re-pins the one bench hash that moves, adds a cross-engine identity guard wired into
`test:node-guards`, and adds `.nvmrc` naming `26.4.0`.

§3.0 block-check: **CLEAR** (read as the word, not the exit code). Mistake #1 satisfied — a real
diff exists across 3 tracked files + 2 new files.

## Evidence (measured this fire)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean, rc 0 |
| `npm run build` | green, `✓ built in 1.25s`, asset-diet ceilings respected |
| `node --test scripts/gr-sim.test.mjs` — Node **26.4.0** (fire default) | **6 tests / 6 pass / 0 fail**, 21,944 ms |
| same file — Node **23.11.1** (runner's nvm) | **6 tests / 6 pass / 0 fail**, 23,386 ms |
| `node --test scripts/wave-scaling-cross-engine.test.mjs` | **1 / 1 / 0**, 6,309 ms |
| `npm run test:node-guards` | **230 tests / 230 pass / 0 fail**, **0 skipped**, rc 0 |
| adjacent e2e ×6, `--workers=1` (§3.1) | see below |

Adjacent suites derived by grepping the changed symbols (`hpScalePerWave`, `speedScalePerWave`,
`trickleDecay`, `componentHp`, `homemaker`), not from any inherited list.

## The cross-engine matrix — the evidence the run did not gather

Pre-cure arm measured in a **detached scratch worktree** at `5ca084ab` (§3.0b custody: undecided
content never enters main's working tree). Every cell is `scripts/twin-banks-hash-probe.mjs`.

| Contract | pre-cure Node 26 | pre-cure Node 23 | | cured Node 26 | cured Node 23 | |
|---|---|---|---|---|---|---|
| `e1-dry-gulch` | `9de5c985` | `9de5c985` | AGREE | `9de5c985` | `9de5c985` | AGREE — cure moves nothing |
| `the-claim` | `02561b7f` | `02561b7f` | AGREE | `b1eeb320` | `b1eeb320` | AGREE — value moved, pin re-derived |
| `e1-night-shift` | `c832307e` | **`ed5d8203`** | 🔴 **DIVERGE** | `30373c0b` | `30373c0b` | ✅ **AGREE** |

The night-shift divergence reproduces **3/3 on each engine** — checked precisely because an
unreproducible pin would be a broken instrument, not a finding.

⚠️ **This corrects an inherited claim.** `reviews/f1404-1-cross-engine-wave-scaling-stop.md:33`
states *"Main is not currently cross-engine divergent; the divergence is only observable once a
contract long enough to reach wave 13 is present."* ✗ **That is false as of `5ca084ab`.**
`e1-night-shift` is a main-side contract, needs no graft, and diverged across the two installed
engines. The cure closes it. The twin-banks graft was never the only divergent subject — it was
the only one anybody had pointed a hash at.

## F-1406-1 — the shipped guard cannot fail for the defect class it was written to guard 🔺

Scope 4 asked for cross-engine identity as *the acceptance test*. The delivered guard
(`scripts/wave-scaling-cross-engine.test.mjs:16`) probes **`the-claim`** — which the matrix above
shows was **already identical across engines before the cure**.

✓ **Control-proven, not inferred:** the guard file was copied unchanged into the pre-cure scratch
worktree and run there. **rc=0, 1 pass / 0 fail.** It is green on the broken tree and green on the
fixed tree; it discriminates nothing. A passing guard never executes its violation path, so its
green was never evidence — the control is (s1299/s1300 standard).

Of the three contracts `HeadlessContractSim` supports, the run picked the one of two that could not
fail. `e1-night-shift` would have gone **red pre-cure, green post-cure** — a true regression test.

**Not blocking:** the guard is harmless and will catch a future `the-claim` divergence. It is
simply not a regression test for F-1403-1. **Fix is one loop over all three supported contracts.**
Corrective `f1406-1` queued in the same commit as this review.

## F-1406-2 — the bench pins one event-log hash out of three contracts 🔺

`scripts/gr-sim.test.mjs` pins exactly one `eventLogHash` (`:162`, `the-claim`). The Night Shift
test (`:184`) asserts only `works.byKind.lantern_post` against the contract's pre-placed buildable
count — it never looks at the hash. **That is how a live cross-engine divergence sat on main
unmeasured while the suite read 6/6/0 on both engines.**

So F-1405-3 ("main is 6/6/0 on both engines") was **true and did not mean what it was used to
mean**: it certified the one contract that was pinned, not the tree. This is the class behind
F-1406-1 — the guard inherited the bench's blind spot rather than closing it.

## F-1406-3 — the run's own evidence was compatible with the cure doing nothing for determinism 🟢

The run's report table shows `the-claim` at `02561b7f` on both engines before and `b1eeb320` on both
engines after. Both rows already agreed across engines, so **nothing in the run's own evidence
demonstrates that any cross-engine disagreement was fixed** — it demonstrates that a value moved.
The cure *is* correct; its author just never measured a subject that could show it. Recorded because
the same shape has now produced four single-engine greens in this thread: when the acceptance test
is "two things agree", first prove they disagreed.

## Merge classification

Main-slot output: uncommitted working-tree dirt + a done-move, per §2A. All five paths are the
task's TOUCH-ONLY list; nothing outside it moved. No lane branch touched. `Balance.ts` untouched —
no balance value changed; the kills delta is float rounding, not a tuning edit.

⚠️ **Sequencing, unchanged from the master:** lane-c (`lane/e2-arsenal`) HOLDS
`src/systems/WaveSystem.ts`. The baron re-graft and the twin-banks re-land must **follow** this
merge and must never `reset --hard` over it.

⚖️ **Owner veto window open** (CLAUDE.md §7.4): re-baselining bench pins is reversible work inside
ratified specs — the bench is a determinism certificate, not a balance spec. Robin reverses the
whole thing with one word and one revert.
