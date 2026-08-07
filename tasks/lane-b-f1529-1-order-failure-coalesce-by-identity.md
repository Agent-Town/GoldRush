CODEX: model=gpt-5.6-sol effort=high
# lane-b-f1529-1-order-failure-coalesce-by-identity — stop the storm, keyed on something that SURVIVES (F-ER02-1, attempt 2)

**FIRE-AUTHORED s1529 (attended review welcome)**

ROLE: lane implementer. WORKDIR: this lane worktree (`worktrees/lane-b`, branch `lane/b`). Commit prefix `f1529-1:`. One task, firewalled. Never touch STATUS.md, reviews/, tasks/queue/, other lanes.

## WHY — attempt 2, under a CHANGED PREMISE (§7.5). Read this section twice; it is the whole task.

Attempt 1 (`f1528-1`) BLOCKED with a zero diff, and **it was right to.** Its cure was measured a
**1.00× no-op** — twice, independently. Everything below was measured by s1529 on `the-claim` /
`e1-the-claim-01`, Node 26.4.0, rider submitting one impossible order
(`[{verb:'HARVEST', seam:'gold-seam-999'}]`) every turn. Full write-up:
`reviews/f1528-1-order-failure-surprise-coalesce.md`.

| arm | `outcome.calls` | `eventLogHash` | waves/s |
|---|---|---|---|
| **STOCK main** | **2,971** | `fnv1a32:d93e9b89` | 0.29 |
| attempt 1's exact cure | **2,971** | `fnv1a32:d93e9b89` | 0.29 |
| **`order_failure` surprise deleted outright** | **4** | `fnv1a32:8c71d437` | 5.13 |

**Three things that table establishes, and you must not re-litigate any of them:**

1. **The review's mechanism is CONFIRMED.** Deleting the surprise takes 2,971 calls → 4: a **743×**
   reduction. `order_failure` *is* the storm's engine, exactly as
   `reviews/standing-orders-rehearsal-e2.md` §3.1 said. **743× is your target and your yardstick.**
2. **Attempt 1 failed for a reason that is now understood.** It de-duped on the *record*. But
   `submit()` **replaces every record on every submission** with a fresh `{id:'orders-N-i',
   status:'pending'}`, so failure identity is destroyed each submission by design. Worse, `tick()`
   skips records already `failed`, so `fail()` can only ever see a `pending`/`active` record —
   proved by counter: the `'failed'` de-dupe fired **0 times in 2,971**, while the same probe on the
   `'active'` transition fired **2,967 of 2,971**. The guard is alive; it is just unreachable from
   `fail()`.
3. **Coalescing hides nothing, which is why this is a repair and not a design fork.** Measured on a
   live view: `now.orders` carries
   `{"status":"failed","reason":"INVALID_TARGET: gold-seam-999 is unavailable."}` on **every single
   turn**. The surprise is the *notification* channel; the view is the *state* channel. Suppressing
   a duplicate notification only stops **billing a turn to repeat an answer the view already
   contains**. (`outcome.calls` is what AP-07 exports to Prime Intellect as `num_turns` — the
   economy axis. This is not tidiness.)

**⭐ THE ONE INSTRUCTION THAT MATTERS: THIS MASTER PRESCRIBES AN ACCEPTANCE, NOT A MECHANISM
(F-1529-1).** Attempt 1 failed *because* it was handed an exact implementation derived from a careful
read — and reading a guard tells you it exists, not that anything reaches it. So: **you choose the
key. This task tells you only what the numbers must do.** The single hard constraint on your choice
is that **the key must survive `submit()` replacing the records** — anything keyed on the record
object or its `id` is already known dead. A stable identity (the order's verb + target + the failure
reason) is the obvious candidate, but it is *your* call and you must justify it with the numbers.

**If you conclude no cure meeting §SCOPE 3 is reachable inside the firewall, that is a legitimate
outcome** — report it with the arms and numbers that show it, exactly as attempt 1 did. A measured
BLOCKED is worth more than a cure that does not move the ratio.

## READ FIRST (open each; do not work from this summary)

- `AGENTS.md`
- `reviews/f1528-1-order-failure-surprise-coalesce.md` — **the whole file**, especially the arms
  table and the reachability counter. This is why you are here.
- `reviews/standing-orders-rehearsal-e2.md` §3.1 and §5 recommendation 2.
- `src/agent/StandingOrders.ts` — read `submit`, `tick`, `fail`, `status`, `surprise`,
  `detectSurprises` and `snapshot` **in full**. Note especially that `tick()` skips `done`/`failed`
  records, and that `submit()` rebuilds `this.records` from scratch.

CITE BY CONTENT, NOT BY LINE (F-1310-1). **Each key below was measured to return exactly `1` on main
at authoring time (F-1425-2), each chosen to sit visibly on ONE line so no prose wrap can make the
grep match nowhere.** Verify each returns **1** in the lane before starting:

- `grep -c "  private fail(record: StandingOrderRecord, reason: string, at: number): void {" src/agent/StandingOrders.ts` → 1
- `grep -c "      if (record.status === 'done' || record.status === 'failed') continue;" src/agent/StandingOrders.ts` → 1
- `grep -c "    this.records = validated.orders.map((order, index) => ({" src/agent/StandingOrders.ts` → 1
- **LANE-CURRENCY KEY** — `grep -c "fnv1a32:8c71d437" reviews/f1528-1-order-failure-surprise-coalesce.md` → 1

**If any returns 0, STOP and report which one and what it returned.** The last key is the upper-bound
hash from the s1529 review that authorises this task: a **0 there means the lane is behind main**,
not that anything is wrong with the file. Do not "fix" any key by editing the citation, and do not
proceed on a premise you could not confirm.

PRE-FLIGHT (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, any `.png` — are NEVER "work" and NEVER a STOP. Discard them and PROCEED, listing what you discarded.**
> **FACTORY-CHURN EXCEPTION (F-1407-1) — ALWAYS EXPECTED, NEVER A STOP; list them and proceed:** `logs/**` (`factory-usage.json`, `usage-history.jsonl`, `task-stats.jsonl`, `dashboard.html`, `.goal-tree.html`, `.blocked-seen`) and `artifacts/**` / `reviews/shots-*` / any `.png`. What still STOPs, unchanged: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

Then `git -C . status --short` → clean modulo the two churn classes above. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

**NODE VERSION IS PART OF YOUR REPORT (F-1527-3).** Run `node -v` and state it. The repo pins
**26.4.0** in `.nvmrc`; a lane on a different major has been observed reporting reds a 26.4.0 shell
does not see, and those reds were blamed on an innocent slice for a whole fire.

## SCOPE (each item separately checkable, in this order)

1. **MEASURE THE BEFORE NUMBER YOURSELF.** Drive the solo stdin path on a contract/seed of your
   choosing with a rider that submits one unsatisfiable order every turn, and record
   `outcome.calls` + `eventLogHash` on **stock lane HEAD before any edit**. If you use
   `the-claim` / `e1-the-claim-01` you should reproduce **2,971** / `fnv1a32:d93e9b89`; say whether
   you did. **Do not inherit this number — a reproduced baseline is the only thing that makes your
   after-number mean anything.** (A ready-made driver is mirrored at
   `logs/runs-archive/s1529-gate-driver-storm-arms.mjs`; read it, copy it, or write your own.)

2. **COALESCE REPEATED IDENTICAL `order_failure` SURPRISES, KEYED ON AN IDENTITY THAT SURVIVES
   `submit()`.** The same order failing the same way again — *across submissions* — must not raise a
   second surprise and must not advance the surprise sequence. **You choose the key and the place it
   lives; justify both in your report.** Constraint: it must not be the record or its `id` (measured
   dead). Whatever you choose must be reset by `reset()` alongside the other run state.

3. **A DIFFERENT FAILURE MUST STILL BE NEWS — THIS IS A HARD ACCEPTANCE, NOT A NICETY.** If an order
   fails, then succeeds, then fails again — or fails with a **different reason**, or a *different*
   order fails — the rider MUST still be told. A cure that silences the second, different failure is
   **worse than the storm**, because a rider would be blind to a real new problem. Prove this
   direction explicitly in item 5(b).

4. **DO NOT TOUCH THE OTHER SURPRISE KINDS.** `claim_damage`, `hero_down`, `wave_early` must behave
   byte-identically. **`claim_damage` is the review's second storm trigger** (7.75× protocol cost for
   0 extra waves on `e2-incline`) and is **still open on purpose**: it has no status/reason pair to
   de-dupe against, so curing it needs a rate-limit or a window — a design choice reserved for the
   owner (F-1529-4). **Report it as still open; do not fold it in.** Mixing them makes both
   ungateable.

5. **PROVE IT WITH A NODE TEST, BOTH DIRECTIONS, IN `scripts/gr-sim.test.mjs`.** Add ONE new test
   that shows:
   - **(a) THE STORM IS GONE:** assert `outcome.calls` (and/or the count of `order_failure` events)
     against a **hard numeric bound you state**. **Acceptance: your after/before ratio must recover
     most of the measured 743× bound.** State the ratio. "Looks better" is not a result.
   - **(b) A DIFFERENT FAILURE IS STILL SURFACED:** construct the scope-3 case and assert the rider
     is still told.
   You **add** a test; you do **not** edit the four existing ones. **FIREWALL CARVE-OUT (F-1528-2):**
   if growing the file genuinely forces an edit to an existing assertion or fixture, that is a
   **STOP-and-report naming the exact line and why** — not a judgement you make silently. Adding is
   expected; editing is a stop.

6. **THE PINS ARE THE FREE REGRESSION GUARD, AND THEY MAY MOVE — THAT IS A FINDING, NOT A FIX.**
   `scripts/gr-sim.test.mjs` pins a Dry Gulch run at **`calls: 5`** / **`fnv1a32:f63d981b`**, and
   `test:node-guards` carries the pinned **E2 Baron** outcomes test. This cure removes repeated
   events from the event log, so **a hash move is plausible and honest** — but only for runs that
   actually contain a repeatedly-failing order; the Dry Gulch fixture's orders all succeed, so it
   **should not** move. **If either pin moves: STOP, report before/after and name the failing order
   in that run. DO NOT RE-PIN** (F-1441-3; the fixture's own comment says never paste over it). A
   re-pin erases the only evidence of what your change did.

7. **Report, do not fix, anything you find outside the firewall.**

## Firewall

Touch ONLY: `src/agent/StandingOrders.ts`, `scripts/gr-sim.test.mjs`.

NO changes to: `scripts/gr-sim.mjs` · `src/sim/HeadlessContractSim.ts` · `src/game/Game.ts` ·
`src/agent/View.ts` · `src/agent/ToolSurface.ts` · `src/agent/Embodiment.ts` · any `Balance` value ·
any `e2e/**` · `playwright.config.ts` · `package.json` · `tasks/**`, `specs/**`, `reviews/**`,
`docs/**` · any other file under `src/` or `scripts/`. Scratch drivers you write for measurement are
fine **as long as they are deleted or left untracked and named in your report** — they must not
appear in `git diff --name-only`.

## Self-check (evidence, not vibes)

- `node -v` → state it; expect **26.4.0**.
- `npx tsc --noEmit` → 0 errors.
- `npm run build` → green; report the module count.
- `npm run test:node-guards` → **report the full result** (tests / pass / fail / skipped and rc).
- **State the two pin outcomes BY NAME**: *"gr-sim replays the same contract, seed, and orders
  byte-for-byte"* and *"the E2 Baron fights keep their pinned outcomes"* — PASS/FAIL each, plus
  before/after numbers if either moved.
- **State the storm numbers**: `outcome.calls` before and after **and the ratio**, with the
  contract/seed you used. This is the headline; a report without it is incomplete.
- **State your KEY and why it survives `submit()`** — one paragraph. This is the design content of
  the task and the review will be read against it.
- **State the 5(b) both-directions result** explicitly.
- `git diff --name-only` at the end must list **exactly** the two firewalled files. Paste it.

**No-op guard:** if you find yourself about to exit without changes, WRITE WHY into your report
first — with arms and numbers. Attempt 1 did exactly this and it was the right call.

End your report with **READY-FOR-GATES** plus: the four citation-check counts · `node -v` · the
before/after `calls` numbers **and their ratio** · your key and its justification · both pin verdicts
by name · the 5(b) evidence · the `test:node-guards` result · the `git diff --name-only` output
proving the firewall held · and any finding you are reporting rather than fixing (`claim_damage` at
minimum).
