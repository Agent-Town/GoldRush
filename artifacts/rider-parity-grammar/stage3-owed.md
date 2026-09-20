# Stage 3 — the three positioning verbs: MEASURED, PREPARED, and OWED

**Status:** OWED, 2026-09-07, by `rider-parity-grammar` on `feat/rider-parity-grammar`.
**What is done:** the retirement ledger (every row, with its refusal), and the removal itself as a
tracked patch. **What is not done:** the removal is not landed, because landing it inside this
task's firewall leaves the tree red.

## The removal is written and typechecks

`stage3-removal.patch` (this directory) is `git diff src/agent/StandingOrders.ts` with
`MOVE_TO`, `HOLD` and `FALLBACK_IF` removed from all five places the master names — the
`StandingOrder` union, `validateOrder`, `standingOrderIdentity`, the executor's `execute`, and
`requiredLevel`'s default (which named none of them, so nothing was owed there). `npx tsc --noEmit`
is CLEAN with it applied: the door compiles perfectly well without the three verbs, and an unknown
verb already refuses honestly, so no special case was added for a retired tape.

Apply with `git apply artifacts/rider-parity-grammar/stage3-removal.patch`.

## Why it is not landed: the measurement

The master's firewall is `src/agent/StandingOrders.ts` · `src/sim/HeadlessContractSim.ts` ·
`src/mp/AgentRiderBody.ts` · `src/game/Game.ts` (stage 4) · `src/ui/BuildingContextPrompt.ts`
(stage 4) · `public/skill.md` · the two same-game-audit scripts · the skillmd fence ·
`docs/bench/*` · the lineage ledgers · NEW guards under `scripts/` · NEW e2e under `e2e/` ·
`artifacts/rider-parity-grammar/**` · `tasks/BACKLOG.md`.

The three verbs are also written into **28 files outside it**. This was not inferred from grep: the
removal was applied to the working tree and the suites were RUN.

### Measured red, with the removal applied (`node --test`, quiet board)

| file | result with the removal | uses |
|---|---|---:|
| `scripts/standing-orders-module-split.test.mjs` | **0 pass / 1 fail** | 1 |
| `scripts/secure-choice-refusal.test.mjs` | **0 pass / 2 fail** | 1 |
| `scripts/agent-reels.test.mjs` | **0 pass / 1 fail** | 2 |
| `scripts/e10-preserve-objective.test.mjs` | **0 pass / 1 fail** | 2 |
| `scripts/assay-replay.test.mjs` | **hangs** (killed at 10 min) | 1 |
| `e2e/front-door-parity.spec.ts` | **2 of 3 fail** (desktop-chrome, port 5309) | 2 |

### Not run, but written in the source the same way

`scripts/e4-roads-and-convoys.test.mjs` (12) · `scripts/gr-sim.test.mjs` (9, in this task's own
stage-1 diff) · `scripts/agent-seat.test.mjs` (4) · `scripts/e7-playbook-rows.test.mjs` (3) ·
`scripts/e8-mare-claim-physics.test.mjs` (1) · `e2e/er01-e2-census.spec.ts` (3) ·
`e2e/e7-playbook-rows.spec.ts` (3) · `e2e/e5-regatta-race.spec.ts` (2) ·
`e2e/e5-flotilla-hulls.spec.ts` (2) · `e2e/e4-roads-and-convoys.spec.ts` (1) ·
`e2e/ap-standing-orders.spec.ts` (1) · `e2e/agent-view.spec.ts` (1) · and ten prover/probe scripts
(`scripts/e4-motor-floor.mjs` 8, `scripts/e4-motor-digest.mjs` 5, `scripts/e7-playbook-digest.mjs` 3,
`scripts/f2086-canyon-census-player.mjs` 3, `scripts/f2135-canyon-census-player.mjs` 3,
`scripts/seed-ladder.mjs`, `scripts/agent-seat-room.mjs` 1,
`scripts/f2127-stdin-rejection-probe.mjs` 1, `e2e/ap16-8b-capture-loop-probe.mjs` 4,
`e2e/ap16-8-admission-probe.mjs` 1).

### The part that makes this a re-ride rather than an edit

Several of those guards do not merely *submit* a removed verb — they **pin the outcome of a run
that used it**. `scripts/e10-preserve-objective.test.mjs` and `scripts/e4-roads-and-convoys.test.mjs`
drive plans whose trailing `HOLD` is what keeps the Prospector on its stake; delete it and the
Prospector drifts to the hero, the run diverges, and every pinned number in those files has to be
RE-DERIVED. That is measuring other slices' behaviour, in files this task is told not to touch,
with no way to separate "the pin moved because `HOLD` is gone" from "the pin moved because that
slice regressed". Landing it blind would be Mistake #1 (a change whose effect nobody measured) and
Mistake #13 (calling it done by counting edits).

The owner's own D2 ruling points the same way. `tasks/rider-parity-grammar.md` records it: "Heat 12
is the live board; **the re-ride is a follow-up master, not this task**." The guards' pinned plans
are part of that same re-ride — they are the board in miniature.

## What the follow-up master needs

1. The firewall widened to name the 28 files, explicitly, with the re-derivation of each pinned
   outcome as scope rather than collateral.
2. `stage3-removal.patch` applied (it is written and typechecks).
3. `HUMAN_CONTROLS` in `scripts/same-game-audit.mjs`: drop the `MOVE_TO`, `HOLD` and `FALLBACK_IF`
   rows, or the generator throws `ADR-005 controls map names verb(s) the door no longer declares`.
   Measured with the removal applied: `same-game-audit` **0 pass / 6 fail** until those rows go.
4. `public/skill.md`: the grammar fence regenerates (measured: `skillmd-guard` **15 pass / 1 fail**,
   the grammar test, until it does), plus the two paragraphs that teach the removed verbs — the
   orders paragraph ("`MOVE_TO` completes on arrival; `HOLD` remains active … `FALLBACK_IF`
   activates at the named live-enemy threshold", `public/skill.md:129`) and the E8 air paragraph
   ("so `HOLD` or `MOVE_TO` on a dome pad is how a rider brings it back to breathe",
   `public/skill.md:157`), whose new answer is "walk the hero to the pad and the Prospector drifts
   in behind it". The seat paragraph at `:598` names all three too.
5. The retirement, already written: `retirement-ledger.json` in this directory, 57 tapes / 22 scored
   rows / 22 rides, each with its ride id, contract, seed, recorded engine hash, recorded terminal
   hash, and the exact refusal the door will answer with.
6. The heat-12 re-ride gauntlet, authored from that ledger.

## The retirement is DONE, and it needs no replay to be certain

Removing a verb does not make a tape DIVERGE; it makes it stop VALIDATING. `validateOrder`'s tail
returns `orders[i].verb "<VERB>" is unknown.` and `submit` rejects the WHOLE array on the first
refusal, because order arrays replace. So the AFTER of a retired tape is not a hash — the door never
accepts the plan and the run never happens. `retirement-ledger.mjs` computes that from the
submission text alone, and `retirement-ledger.json` records for every one of the 57 tapes: the first
submission that would be refused, its tick, the offending order's index, and the message verbatim.

**RETIRED, NEVER DELETED** (CLAUDE.md §4.10b): nothing here removes a tape, a ride directory or a
board row. Ten heat-12 rows stand on the live board; retiring those is a `POST /api/standings/reassay`
call that needs `ASSAY_WORKER_SECRET`, which this task does not hold — it is the drain's, with this
ledger as its input.
