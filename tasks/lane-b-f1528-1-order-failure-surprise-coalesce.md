CODEX: model=gpt-5.6-sol effort=high
# lane-b-f1528-1-order-failure-surprise-coalesce — a failing order must stop ASKING (F-ER02-1)

**FIRE-AUTHORED s1528 (attended review welcome)**

ROLE: lane implementer. WORKDIR: this lane worktree (`worktrees/lane-b`, branch `lane/b`). Commit prefix `f1528-1:`. One task, firewalled. Never touch STATUS.md, reviews/, tasks/queue/, other lanes.

## WHY (F-ER02-1, P0, from the ER-02 Steamworks rehearsal, `reviews/standing-orders-rehearsal-e2.md`)

The review's §3.1 heading, verbatim:

> **A failing order raises a surprise; a surprise mints a turn; a turn demands a submission; the
> submission re-arms the failing order.**

Measured there, one variable at a time, on `e2-trestle` seed 01 at trail:

| plan | forced submissions | sim reached | vs the doctrine's 100k budget |
|---|---|---|---|
| no orders at all | 15 | wave 14 | 13 % |
| the metered card (5 works) | 34 | wave 14 | 34 % |
| 3 palisade decoys, 3 rider calls | 341 | wave 14 | **374 %** |
| `[HARVEST gold-seam-4, HOLD (24,20)]` — **one dark seam** | **1,200 (capped)** | **still wave 1** | **997 %** |

The last row is the finding in one line: `gold-seam-4` was published `active:false` **in the very
first VIEW of the run**, and naming it cost a thousand forced rider invocations without advancing a
single wave. An earlier, uncapped form wrote **3,074 turns and 76 MB**. `outcome.calls` is what
AP-07 exports to Prime Intellect as `num_turns` — the ECONOMY AXIS — so this is not a tidiness
issue.

**⭐ THE CURE IS DERIVED FROM THIS FILE'S OWN EXISTING CONVENTION, NOT CHOSEN FROM A MENU — and that
is the single most important thing to understand before you touch anything.** The review's §5
recommendation 2 offers three options (*retire an order after N identical failures* · *coalesce
`order_failure` surprises* · *let `advanceToTurn` rate-limit surprise-minted turns*). **You are
implementing the second, and only the second, because re-reading the file at authoring time showed
it is not really an option at all — it is the file finishing a rule it already applies one line
above.** ✓ VERIFIED by reading `src/agent/StandingOrders.ts` on main at authoring time:

- `private status(...)` **already de-dupes**: its first statement is
  `if (record.status === status && record.reason === reason) return;` — an unchanged status appends
  **no** `order_status` event. The file has already decided that *"the same thing, again, is not
  news."*
- `private fail(...)` calls `this.status(...)` and then calls `this.surprise('order_failure', …)`
  **unconditionally** — so the surprise escapes the very de-dupe its own sibling line applies.

That asymmetry is the defect. The other two options would each be a genuine design choice with
owner-shaped consequences (option 1 changes what an ORDER means to a rider; option 3 fixes only the
headless door and leaves the browser storming), and **a fire may not make those calls.** This one
restores an invariant the file already asserts, which is why it is authorable today.

✓ VERIFIED mechanism, end to end, all four links read on main rather than inherited:

1. `StandingOrdersExecutor.fail` raises `surprise('order_failure', …)` on **every** failing tick.
2. `surprise(...)` sets `this.needsRiderValue = true` and appends an event, advancing the surprise
   sequence.
3. `HeadlessContractSim.advanceToTurn` mints a turn whenever that sequence moves — the condition is
   `surpriseSeq > this.lastSurpriseSeq` (verified by reading; `latestSurpriseSeq(orders)` is
   assigned to `this.lastSurpriseSeq` when a turn is actually made).
4. `gr-sim.mjs`'s `readOrders` then blocks until orders are submitted, and every submission re-arms
   the same failing order.

Break link 1 and the loop cannot close. **Nothing else in the chain needs to change.**

## READ FIRST (open each; do not work from this summary)

- `AGENTS.md`
- `reviews/standing-orders-rehearsal-e2.md` §3.1 (the measurement above) and §5 recommendation 2.
- `src/agent/StandingOrders.ts` — read `fail`, `status`, `surprise`, `detectSurprises` and the
  `finishAction` call site **in full**. This is the only file you will change in `src/`.
- `reviews/f1527-1-gr-sim-noop-submission.md` — the sibling ER-02 repair merged minutes before this
  task was written (`b55e6ac5`), so you know what "a free turn" now means on the solo path.

CITE BY CONTENT, NOT BY LINE (F-1310-1). **Each key below was measured to return exactly `1` on main
at authoring time (F-1425-2), and each was chosen to sit visibly on ONE line so no prose wrap can
make the grep match nowhere.** Verify each returns **1** in the lane before starting:

- `grep -c "    this.surprise('order_failure', at, record.id, reason);" src/agent/StandingOrders.ts` → 1
- `grep -c "    if (record.status === status && record.reason === reason) return;" src/agent/StandingOrders.ts` → 1
- `grep -c "  private fail(record: StandingOrderRecord, reason: string, at: number): void {" src/agent/StandingOrders.ts` → 1
- **LANE-CURRENCY KEY** — `grep -c "    if (orders === null) return;" scripts/gr-sim.mjs` → 1

**If any returns 0, STOP and report which one and what it returned.** The last key is deliberately
the content of the `f1527-1` merge (`b55e6ac5`) that landed minutes before this task was written: a
**0 there means the lane is behind main**, not that the file is wrong. Do not "fix" any of them by
editing the citation, and do not proceed on a premise you could not confirm.

PRE-FLIGHT (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, any `.png` — are NEVER "work" and NEVER a STOP. Discard them and PROCEED, listing what you discarded.**
> **FACTORY-CHURN EXCEPTION (F-1407-1) — ALWAYS EXPECTED, NEVER A STOP; list them and proceed:** `logs/**` (`factory-usage.json`, `usage-history.jsonl`, `task-stats.jsonl`, `dashboard.html`, `.goal-tree.html`, `.blocked-seen`) and `artifacts/**` / `reviews/shots-*` / any `.png`. What still STOPs, unchanged: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

Then `git -C . status --short` → clean modulo the two churn classes above. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

**NODE VERSION IS PART OF YOUR REPORT (F-1527-3).** Run `node -v` and state it. The repo pins
**26.4.0** in `.nvmrc`; a lane that runs on a different major has been observed reporting reds a
26.4.0 shell does not see, and those reds were blamed on an innocent slice for a whole fire. If you
are not on 26.4.0, install/select it before gating and say so.

## SCOPE (each item separately checkable, in this order)

1. **MAKE `status()` REPORT WHETHER IT CHANGED ANYTHING.** Give the existing `private status(...)`
   a `boolean` return: `false` when it takes its existing early-return (same status **and** same
   reason), `true` otherwise. **Do not alter the early-return condition itself** — it is the
   invariant this whole task is extending, and widening or narrowing it would change which
   `order_status` events are logged, which is a different task.

2. **RAISE `order_failure` ONLY ON A CHANGE.** In `private fail(...)`, raise the surprise **only
   when the `status(...)` call reported a change.** An identical failure repeating on the next tick
   must append nothing and must not advance the surprise sequence.

3. **A LATER, DIFFERENT FAILURE MUST STILL BE NEWS.** The coalescing is *per unchanged
   (status, reason) pair*, not "one surprise per order, ever". If an order fails, then succeeds,
   then fails again — or fails with a **different reason** — that is a change and the rider MUST be
   told. Prove both directions in item 5; a cure that silences the second failure is worse than the
   storm, because a rider would then be blind to a real new problem.

4. **DO NOT TOUCH THE OTHER SURPRISE KINDS.** `claim_damage`, `hero_down` and `wave_early` are out
   of scope and must behave byte-identically. In particular **`claim_damage` is the review's second
   storm trigger** (it fires on every `building_damaged` event, and on `e2-incline` building
   multiplied protocol cost **7.75×** for **0** extra waves) — that is a **real, still-open finding
   and a genuinely different mechanism**: `claim_damage` has no status/reason pair to de-dupe
   against, so curing it needs a rate-limit or a window, i.e. a design choice. **Report it as still
   open; do not fold it in.** Mixing the two would make both ungateable.

5. **PROVE IT WITH A NODE TEST, BOTH DIRECTIONS, IN `scripts/gr-sim.test.mjs`.** Add ONE new test
   that drives the solo stdin path on a contract/seed of your choosing and shows:
   - **(a) THE STORM IS GONE:** a plan naming a target that cannot be satisfied no longer mints a
     turn per tick. Assert on `outcome.calls` (and/or the count of `order_failure` events in the
     view stream) with a **hard numeric bound you state in your report**, not a "looks better".
     Report the before number too — measure it once on stock main, or reason it from the run — so
     the review can quote a ratio.
   - **(b) A SECOND, DIFFERENT FAILURE IS STILL REPORTED:** construct a case where the reason or the
     status genuinely changes and assert the rider is still told.
   You **add** a test; you do **not** edit the four existing ones. If growing the file forces an
   edit to an existing fixture, **STOP and report it** rather than deciding on your own — see the
   firewall note below, which exists because exactly that happened on `f1526-1`.

6. **THE TWO PINS ARE THE FREE REGRESSION GUARD, AND THEY MAY MOVE — THAT IS A FINDING, NOT A FIX.**
   `scripts/gr-sim.test.mjs` pins a Dry Gulch run at **`calls: 5`** / **`eventLogHash:
   'fnv1a32:f63d981b'`**, and `test:node-guards` also carries the pinned **E2 Baron** outcomes test.
   This cure removes repeated events from the event log, so **a hash move is a plausible, honest
   outcome** — but only for runs that actually contain a repeatedly-failing order. **If either pin
   moves: STOP, report before/after numbers, and name the run's failing order. DO NOT RE-PIN**
   (F-1441-3, and the fixture's own comment says never paste over it). A re-pin would erase the only
   evidence of what your change did.

7. **Report, do not fix, anything you find outside the firewall.**

## Firewall

Touch ONLY: `src/agent/StandingOrders.ts`, `scripts/gr-sim.test.mjs`.

NO changes to: `scripts/gr-sim.mjs` · `src/sim/HeadlessContractSim.ts` · `src/game/Game.ts` ·
`src/agent/View.ts` · `src/agent/ToolSurface.ts` · `src/agent/Embodiment.ts` · any `Balance` value ·
any `e2e/**` · `playwright.config.ts` · `package.json` · `tasks/**`, `specs/**`, `reviews/**`,
`docs/**` · any other file under `src/` or `scripts/`.

**FIREWALL NOTE, WRITTEN BECAUSE THE LAST TASK OF THIS SHAPE HIT IT (F-1528-2, s1528):** `f1526-1`'s
firewall forbade editing existing tests, and its scope then *required* editing a byte-stable snapshot
fixture — so the runner had to choose between violating the firewall and shipping nothing. **Here
the carve-out is explicit: adding a test is expected; editing an existing assertion or fixture is a
STOP-and-report, not a judgement call you make silently.** If you believe an existing test must
change, stop and say exactly which line and why.

## Self-check (evidence, not vibes)

- `node -v` → state it; expect **26.4.0**.
- `npx tsc --noEmit` → 0 errors.
- `npm run build` → green; report the module count.
- `npm run test:node-guards` → **report the full result** (tests / pass / fail / skipped and rc).
  It contains `scripts/gr-sim.test.mjs`, so your new test and both pins run here.
- **State the two pin outcomes BY NAME**: *"gr-sim replays the same contract, seed, and orders
  byte-for-byte"* and *"the E2 Baron fights keep their pinned outcomes"* — PASS/FAIL each, and if
  either moved, the before/after numbers.
- **State the storm numbers**: `outcome.calls` for your unsatisfiable-order arm **before and after**,
  and the ratio. This is the headline of the whole task; a report without it is incomplete.
- **State the both-directions result** from scope 5(b) explicitly — *"a second, different failure is
  still surfaced"* with the evidence.
- `git diff --name-only` at the end must list **exactly** the two firewalled files. Paste it.

**No-op guard:** if you find yourself about to exit without changes, WRITE WHY into your report
first — a silent no-op wastes a queue slot and a gate.

End your report with **READY-FOR-GATES** plus: the four citation-check counts · `node -v` · the
before/after `calls` numbers and their ratio · both pin verdicts by name · the 5(b) both-directions
evidence · the `test:node-guards` result · the `git diff --name-only` output proving the firewall
held · and any finding you are reporting rather than fixing (`claim_damage` at minimum).
