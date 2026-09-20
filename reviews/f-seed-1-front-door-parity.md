# f-seed-1-front-door-parity — gate review (s1492)

**Slice:** `lane-f-seed-1-front-door-parity` (F-SEED-1 parity cure — the public agents' door)
**Branch:** `lane/a` · **Tip:** `23559d6e4` "fdoor: align headless progression and panning"
**Base (merge-base with main):** `d0cb2ac57` · **Main at gate:** `a48fedffc`
**Gate tree:** detached worktree `gate-s1492` at merge commit `e9fb9faf2` (§3.0b — an attended session was committing to main live throughout this gate)
**Date:** 2026-08-06T17:51Z

## VERDICT: HOLD — NOT MERGED

> ⚠️ **SUPERSEDED s1494 — the hold was DISCHARGED, not overturned. Merged at `335408077`** (ancestry
> verified: `git merge-base --is-ancestor 335408077 main`), together with the fire-authored successor
> `lane-f1493-1-parity-repin`, as **one slice** — which is F-1492-1 route (a), exactly as the finding
> below prescribed. The verdict above is kept **verbatim** (retention law: supersede, never delete)
> and it was **correct when written**: at the time of this gate the eight adjacent assertions really
> were unrepaired. What changed is the tree, not the judgement. **Full `test:node-guards` is now
> `rc=0` (340 tests / 337 pass / 0 fail / 3 skipped) and `er01-e2-census` is 8/8** on the merged tree.
> Landing review: `reviews/f-seed-1-plus-f1493-1-landing.md`.

The cure itself is real and its own spec proves it. It is held because it leaves **eight reds in two adjacent suites**, every one of them **attributed to this slice by a clean control run**, and none of them repaired by the slice.

## What it does

Gives the headless (`gr-sim` stdin) hero the progression the browser hero already had — deterministic first-offer upgrades, panning paid at the browser's immediate rate — so that a model playing through the public stdin door meets the same game a human meets in the browser. Before this, no model had ever secured any contract via stdin (F-SEED-1: idle, wiped-orders and full-orders runs all died at wave 2 at `timeMs 81767` exactly, policy-invariant). After it, a committed pure-stdin fixture secures The Claim at wave 10 in 13 calls while idle still dies at wave 3 — i.e. the door is now winnable *and* still losable, which is the property that makes it a fair bench.

This is the correct fix at the correct layer: it cures at parity rather than tuning the difficulty, which is exactly what the master demanded.

## Evidence

| Gate | Merged tree (`e9fb9faf2`) | Control: pre-merge main (`a48fedffc`) |
|---|---|---|
| `npx tsc --noEmit` | **green** | — |
| `npm run build` | **green** (built 1.63s; asset-diet ceilings respected) | — |
| `e2e/front-door-parity.spec.ts` (own spec, `--workers=1`) | **4/4** desktop + mobile (21.5s) | n/a — new file |
| `scripts/gr-sim.test.mjs` (member of `test:node-guards`) | **6 RED / 9** | **9/9 GREEN** |
| `e2e/er01-e2-census.spec.ts` (adjacent, `--workers=1`) | **6/8 — 2 RED** | **8/8 GREEN** |

All playwright runs `--workers=1` per §3.1. Ports 5188/5199/5231/5234/5192 verified free before gating (no live lane contention).

### The six gr-sim reds
`replays byte-for-byte` · `deterministically runs the Claim objective` · `Claim driver … secure at wave 10` · `Twin Banks … securing at wave 20` · `places Night Shift fixtures` · `the Baron driver runs the declared fight`.

Representative deltas — the Claim objective moved `waves 4 → 5`, `kills 65 → 95`, `timeMs 126167 → 155300`, `eventLogHash 0bbf2fec → 7a7c1e7b`; the Baron moved `kills 861 → 862`, `timeMs 528433 → 528400`.

### The two census reds
Both are the **same row**: `e2-hill-mine census support is explicit and deterministic`, desktop and mobile, `waves: 12` expected vs `14` received.

⚠️ **The runner believed it had addressed this and had not.** Its report says the moved rows are "bannered in `docs/bench/e2-readiness-census.md`". But `e2e/er01-e2-census.spec.ts:109` asserts against **`contract.twist.secureWave`** — a contract data value — not against the doc. A banner in prose cannot satisfy an assertion that reads the contract. This is the gap between "documented" and "green", and it is why the runner's own summary reports 6/8 without treating it as blocking.

## Why this is HOLD and not a re-pin

Every moved number here is the *expected consequence* of the change: give the headless hero progression and it survives longer, kills more, and hashes differently. There is a **named cause**, which is the one thing the standing prohibition (F-1441-3) requires before a pin may move. So this is not the "re-pin to make a red go away" reflex.

It is still HOLD, for two reasons:

1. **Merging it reds the board.** `gr-sim.test.mjs` is a member of `test:node-guards`, which every fire runs. This is the exact shape of **F-1460-1**: a spec-green, deliberate, cross-cutting sim change reached main and left `test:node-guards` red for five fires — and the expensive part was not the red, it was that the red wore an excused label and **nobody investigated it for two days**. Landing eight fresh reds into that same battery, on the day the lesson is written down, would be the same mistake with the lesson in hand.

2. **The Hill Mine number is a contract, not a pin.** Re-pinning `gr-sim` expectations is mechanical bookkeeping. Changing `contract.twist.secureWave` from 12 to 14 changes what the county *declares* about that map — and the E1/E2 contracts are the seed corpus the AP-10d harness ablation is about to be measured on. Whether Hill Mine's declared secure wave should follow the corrected sim is a **content ruling**, not a gate repair, and I will not make it unilaterally inside a drain.

## Findings

- **F-1492-1 — the parity cure moves eight adjacent assertions and repairs none of them (BLOCKING this merge).** Six `gr-sim.test.mjs` expectations plus the `e2-hill-mine` contract row. Attributed by control run (both suites green at `a48fedffc`, red at `e9fb9faf2`). **Cure must land WITH the slice, not after it** — it depends on the unmerged sim change, so it cannot be queued to a fresh lane (a lane without the cure would compute the old numbers and "fix" them wrongly). Two lawful routes: (a) extend the work on `lane/a` and re-gate the branch as one slice; (b) attended merges slice + re-pin as one landing. Route (b) is likely right here because of the contract question below.
- **F-1492-2 — the Hill Mine `secureWave` 12 → 14 is an owner/attended content call.** Needs a word before any edit: does the declared contract follow the corrected sim, or does a Hill Mine securing two waves later indicate the parity cure over-shot? The parity spec passing does not answer this — it tests The Claim, not Hill Mine.
- **F-1492-3 — the master has no goal leaf (Goal Registration Law).** `node scripts/drain-block-check.mjs 20260806-162742-lane-f-seed-1-front-door-parity.md` returns **UNKNOWN — no goal leaf matches**, exit 0. Per §3.0 that is a bookkeeping finding, not a clearance; recorded here so it is not read as one. The master was attended-dispatched, so this is a note to the author, not to the runner.

## Merge classification (recorded for whoever lands it)

Measured `d0cb2ac57..main` against the four touched paths:

- `src/sim/HeadlessContractSim.ts` — **LANE-TOUCHED only** (main never moved it)
- `e2e/front-door-parity.spec.ts` — **LANE-TOUCHED only** (new file)
- `docs/bench/e2-readiness-census.md` — **LANE-TOUCHED only**
- `tasks/BACKLOG.md` — **BOTH-MOVED**, conflicts. Resolution used at the gate: take the lane's rewritten `F-SEED-1` bullet, keep main's five newer bullets (AP-10d seeded · arm-4 prime-agent · Harness Bench · QM tiered · gauntlet roster) verbatim. The lane's hunk is a single line and rewrites only the `F-SEED-1` row, so the graft is unambiguous; re-use it.

## Custody note

Gated entirely in the detached worktree `gate-s1492` (plus `gate-s1492-ctl` at pre-merge main for controls). Nothing from `lane/a` was ever placed in main's working tree, per §3.0b — the attended session committed to main four times during this gate, which is precisely the concurrency that makes a working-tree gate unsafe.
