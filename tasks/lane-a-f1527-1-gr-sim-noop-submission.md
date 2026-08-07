CODEX: model=gpt-5.6-sol effort=high
# lane-a-f1527-1-gr-sim-noop-submission — GR-SIM must have a way to say NOTHING (F-ER02-2)

**FIRE-AUTHORED s1527 (attended review welcome)**

ROLE: lane implementer. WORKDIR: this lane worktree (`worktrees/lane-a`, branch `lane/a`). Commit prefix `f1527-1:`. One task, firewalled. Never touch STATUS.md, reviews/, tasks/queue/, other lanes.

## WHY (F-ER02-2, from the ER-02 Steamworks rehearsal, `reviews/standing-orders-rehearsal-e2.md`, merged `bb969fb3`)

The rehearsal's §5 recommendation **1**, verbatim:

> **Give GR-SIM a way to say nothing.** A `null`/empty sentinel that advances the turn without
> replacing the record set. Without it the doctrine's central technique is unavailable and the
> economy metric is uncountable. (F-ER02-2)

And the review's §3.2 heading, verbatim: *"There is no no-op, and every submission destroys the plan."*

**Why that is not a nicety.** `specs/agent-play/README.md:40` is RATIFIED and states the doctrine:
*"the rider's output is a declarative PLAN … the rider is re-invoked only at wave boundaries +
trigger breaches ("surprises"). **Budget: ~1 call/wave + surprises ≈ 15-30 calls/contract.**"*
The doctrine's central winning shape is **one plan at the gate, then answer HOLD**. Today the rider
cannot answer HOLD, because the only way to advance a turn is to submit a record set that
**replaces** the one it just made. The rehearsal measured the gap this opens between the two
columns that ought to be the same number: **20 rider calls vs 34–38 protocol submissions on the
card; 3 vs 341 on a probe (113×)** — and `outcome.calls` is what AP-07 exports to Prime Intellect
as `num_turns`, i.e. THE ECONOMY AXIS (`specs/agent-play/README.md:57`, `:67`, `:76`).
**A metric that counts the harness's chattiness instead of the model's is not an economy axis.**

**RE-MEASURED AT AUTHORING TIME, NOT INHERITED — and the code says something sharper than the
finding does. Read these two sites yourself before you start:**

- `scripts/gr-sim.mjs`, `readOrders` — it loops until `sim.submitOrders(orders)` returns
  `receipt.outcome.ok`. There is **no** path out of that loop that does not call `submitOrders`.
  A blank line currently makes `JSON.parse('')` throw, prints `gr-sim rejected orders`, and
  **loops again** — so a rider with nothing to say hangs rather than passes.
- `src/sim/HeadlessContractSim.ts:432-434` — `submitOrders` increments `this.calls` **before**
  it even asks the surface, so every forced submission is billed whatever it contains.

⚠️ **THE ONE REAL HAZARD, AND IT IS THE OPPOSITE OF THE OBVIOUS FIX: `[]` IS ALREADY TAKEN, AND IT
MUST KEEP ITS CURRENT MEANING.** The natural instinct is to make an empty order list the no-op.
**Do not.** `scripts/gr-sim.test.mjs:10-16` drives the stdin path with a five-line `ORDERS`
fixture whose **last two lines are `[]`**, and `:36-45` pins that run at **`calls: 5`** and
**`eventLogHash: 'fnv1a32:f63d981b'`**. Those `[]` submissions are *deliberately* real
submissions that replace the plan with an empty one, and they are *counted*. If you make `[]` the
sentinel you will change `calls` to 3, move the hash, and red a pin whose own comment
(`:17-18`) reads *"these terminal outcome pins are change detectors. A red means the sim's
behaviour moved; establish why before re-deriving, never paste over it."*
**The sentinel must therefore be a NEW form that `[]` is not.** That is a derived requirement, not
a preference — the repo's own pinned test decides it.

## READ-FIRST (open each; do not work from this summary)
- `scripts/gr-sim.mjs` — the whole file. In particular `readOrders`, the solo `while (true)` loop
  that calls it, and the **seated** driver's line handler, which already contains
  `if (!line.trim()) return;` — the seat has always had a way to say nothing; the solo path never did.
- `scripts/gr-sim.test.mjs:10-56` — the `ORDERS` fixture and the pinned outcome. This is your
  regression guard and it already exists; you are not writing it.
- `src/sim/HeadlessContractSim.ts` — `submitOrders` (`:432`) and `advanceToTurn` (`:445`).
  **READ ONLY — you may not edit this file, or any `src/**`.** Note that `advanceToTurn` mints a
  turn on terminal / wave boundary / new surprise, and that `submitOrders` pushes a `replayEvents`
  entry. **A no-op must push nothing**, or you will move event-log hashes.
- `specs/agent-play/README.md:40`, `:57`, `:67` — the ratified doctrine and the economy axis.

CITE BY CONTENT, NOT BY LINE (F-1310-1). **Each was measured to return exactly `1` on main at
authoring time (F-1425-2), and each was chosen to sit visibly on ONE line so no prose wrap can make
the grep match nowhere.** Verify each returns **1** in the lane before starting:
- `grep -c "async function readOrders(lines, sim) {" scripts/gr-sim.mjs` → 1
- `grep -c "    const receipt = sim.submitOrders(orders);" scripts/gr-sim.mjs` → 1
- `grep -c "    if (!line.trim()) return;" scripts/gr-sim.mjs` → 1
- `grep -c "    calls: 5," scripts/gr-sim.test.mjs` → 1
- **LANE-CURRENCY KEY** — `grep -c "const DIFFICULTY_VALUES = \['greenhorn', 'trail', 'vein-hunter', 'vein_hunter', 'hard'\];" scripts/gr-sim.mjs` → 1

**If any returns 0, STOP and report which one.** The last key is deliberately the content of the
`f1525-1` merge (`c65e6b6d`) that landed minutes before this task was written: a 0 there means the
lane is behind main, not that the file is wrong. **Do not "fix" any of them by editing the citation.**

PRE-FLIGHT (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, any `.png` — are NEVER "work" and NEVER a STOP. Discard them and PROCEED, listing what you discarded.**
> **FACTORY-CHURN EXCEPTION (F-1407-1) — ALWAYS EXPECTED, NEVER A STOP; list them and proceed:** `logs/**` (`factory-usage.json`, `usage-history.jsonl`, `task-stats.jsonl`, `dashboard.html`, `.goal-tree.html`, `.blocked-seen`) and `artifacts/**` / `reviews/shots-*` / any `.png`. What still STOPs, unchanged: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.
Then `git -C . status --short` → clean modulo the two churn classes above. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## SCOPE (each item separately checkable, in this order)

1. **ADD THE NO-OP SENTINEL TO THE SOLO STDIN PATH.** In `readOrders`, a line that is **blank**
   (nothing but whitespace) **or** parses to JSON **`null`** means *"I have nothing to add; advance
   the turn."* It must:
   - return from `readOrders` so the loop advances, exactly as a successful submission does;
   - **NOT** call `sim.submitOrders` — therefore not increment `calls` and not push a
     `replayEvents` entry;
   - **NOT** touch the standing-order record set, which keeps executing.

   Blank-line acceptance is chosen to match the seated driver, which has always had
   `if (!line.trim()) return;`, so the two drivers stop disagreeing about what silence means.
   **Measured at authoring: no consumer writes a blank line to gr-sim's stdin today** — the only
   stdin driver in the repo is the `ORDERS` fixture above, whose lines are all valid JSON — so this
   cannot silently re-interpret an existing caller's input.

2. **`[]` KEEPS ITS MEANING, AND YOU PROVE IT DID.** An empty array remains a real submission:
   it replaces the record set with an empty plan **and it still counts**. The proof is that
   `scripts/gr-sim.test.mjs`'s pinned run stays at **`calls: 5`** and
   **`eventLogHash: 'fnv1a32:f63d981b'`**, unedited. **If that pin moves, you have changed the
   meaning of `[]` — STOP and report; do not re-pin** (F-1441-3, and the fixture's own comment).

3. **PROVE THE NO-OP IS ACTUALLY FREE, AND THAT THE PLAN SURVIVES IT.** A no-op that quietly
   submitted, or that quietly wiped the plan, would look identical from outside — which is why this
   item exists. On `--contract e1-dry-gulch --seed bench-001` (the fixture's own contract and seed),
   run two arms and compare:
   - **Arm P (plan-then-noop):** one real order line at the gate, then **no-op sentinels** for every
     remaining turn.
   - **Arm R (plan-then-resubmit):** the *same* first order line, then that **same line repeated**
     for every remaining turn.

   Report for each arm: exit code, `outcome.calls`, `outcome.eventLogHash`, and the final
   `now.works.byKind` (or another VIEW field that shows the plan is still executing).
   **Required:** `calls(P)` is **strictly less than** `calls(R)` — ideally `calls(P) == 1` — and
   **the plan is still in force in arm P**, i.e. arm P's world is not the world of a rider that
   submitted nothing. State both explicitly.

   ⚠️ **`eventLogHash(P) == eventLogHash(R)` IS NOT REQUIRED AND MAY WELL BE FALSE.** Re-submitting
   an identical order set is not a no-op inside the sim — it re-arms orders and can raise
   `order_failure` surprises (that is finding F-ER02-1, a **different** task). **Report whatever
   you observe; do not tune anything to make the two hashes agree.**

4. **A DEDICATED TEST IN THE EXISTING SUITE.** Add one test to `scripts/gr-sim.test.mjs` that
   asserts the sentinel's three properties from item 1: the run **terminates** (exit 0), the no-op
   turns are **not billed** (`calls` equals the number of *real* submissions), and the standing
   orders **survive** the no-op. Follow the file's existing spawn-and-parse idiom; do not restructure
   the file, and do not touch the `ORDERS` fixture or the pinned assertions.

5. **A MALFORMED LINE IS STILL AN ERROR.** `{`, `"nope"`, `3` and other non-`null` garbage must keep
   being rejected with the existing `gr-sim rejected orders` message and keep waiting. **Silence is a
   sentinel; nonsense is not.** Paste one rejection to show the path is intact.

## FIREWALL
Touch ONLY: `scripts/gr-sim.mjs` and `scripts/gr-sim.test.mjs`.
NO changes to: **all of `src/**` — in particular `src/sim/HeadlessContractSim.ts`, which is READ-ONLY here** · `e2e/**` · `playwright.config.ts` · `package.json` · `specs/**` · `scripts/lane-runner-v3.sh` and every other `scripts/*.sh` · every other `scripts/*.mjs` (`seed-ladder.mjs`, `agent-seat-room.mjs`) · `tasks/**`, `reviews/**`.
**Do NOT change the outcome schema.** `scripts/gr-sim.test.mjs:34` asserts the outcome's key list is
exactly `['secured','waves','timeMs','gold','kills','calls','eventLogHash']`; adding a field reds it.
The rehearsal's recommendation 3 (*report rider invocations separately from protocol turns*) is a
**separate, larger task** and is deliberately out of scope here.
**Do NOT touch the seated path.** It already ignores blank lines; leave it exactly as it is.
**Do NOT attempt F-ER02-1** (the surprise storm / failing-order back-off). It is the neighbouring
finding, it is authorable next, and mixing the two would make both ungateable.

## SELF-CHECK (name the exact commands and paste real output)
- `npx tsc --noEmit` → 0 errors. `npm run build` → green.
- `npm run test:node-guards` → **report the full result**. It contains this file's own suite plus the
  pinned `gr-sim` Baron test. ⚠️ **Run it on the `.nvmrc` Node (26.4.0) if you have it, and STATE
  YOUR NODE VERSION either way** — F-1527-3 recorded that a lane on Node 23.11.1 sees two
  `F-1507-1` timeout-semantics reds that a 26.4.0 shell does not, and those two reds are the
  interpreter's, not the code's. Naming your version is what lets the drain tell them apart.
- The `calls: 5` / `fnv1a32:f63d981b` pinned test → **green and unedited** (`git diff` on
  `scripts/gr-sim.test.mjs` must show only your ADDED test).
- The item-3 two-arm table: P and R with exit code, `calls`, `eventLogHash`, and the plan-survival
  field, plus the explicit statement that `calls(P) < calls(R)`.
- The item-5 rejection line, pasted.
- `git diff --stat` → **exactly two files**, `scripts/gr-sim.mjs` and `scripts/gr-sim.test.mjs`
  (or say precisely why it differs).

**If you find yourself about to exit without changes, WRITE WHY into your report first** — a silent
no-op wastes a queue slot and a gate.

End your report with **READY-FOR-GATES** plus: the sentinel forms you implemented · the item-3
two-arm table with `calls(P) < calls(R)` stated explicitly and the plan-survival evidence · confirmation
that the `calls: 5` / `f63d981b` pin is green and unedited · the item-5 rejection line · your Node
version and the `test:node-guards` result · confirmation that `src/` is untouched
(`git diff --name-only` output).
