# f1415-1 — guard the component-boss branch of the headless secure predicate

**FIRE-AUTHORED (attended review welcome)** — s1416, from F-1415-1 (`tasks/BACKLOG.md`, filed s1415) plus the merged cure it describes (`1a4831df`, `reviews/f1414-1.md`).

**Role / workdir:** main slot — repo ROOT (`/Users/robin/Claude/Projects/Gold Rush`). Not a lane.

**Pre-flight:** `git status --short` must show no staged/modified TRACKED file OUTSIDE the two factory-churn classes below — if any exist, STOP and report (a live drain or another task owns the tree). Untracked `??` host debris (art raws, .claude/) is EXPECTED — list briefly, proceed.
> **FACTORY-CHURN EXCEPTION — these two tracked classes are ALWAYS EXPECTED on the main slot and are NEVER a STOP; list them and proceed (F-1407-1, s1407):** (a) `logs/**` — the fire/runner accounting (`factory-usage.json`, `usage-history.jsonl`, `task-stats.jsonl`, `dashboard.html`, `.goal-tree.html`, `.blocked-seen`), rewritten every cycle by the factory itself; (b) `artifacts/**`, `reviews/shots-*` and any `.png` — regenerated evidence (the F-1266-1 exception). ⓘ What still STOPs, unchanged and load-bearing: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md` — i.e. anything a live drain or a concurrent task could actually own.

Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## READ-FIRST (paths, in this order)
1. `src/sim/HeadlessContractSim.ts:392-402` — `bindEventLog()`'s `enemy_killed` handler; the predicate this slice guards.
2. `scripts/gr-sim.test.mjs:320-380` — the `e1-baron` case, which is the ONLY test that reaches this predicate today.
3. `tasks/BACKLOG.md` — rows **F-1415-1** (this slice's WHY), **F-1415-2** (the escort-canary retirement ruling — read it before you are tempted to "fix" a red probe), **F-1415-3**.
4. `reviews/f1414-1.md` — what the merged cure actually established, and what it did not.
5. `assets/contracts/epoch-2-steamworks/contracts.json` and `assets/contracts/epoch-3-voltage/contracts.json` — the two shapes this slice must cover.

## WHY (quoted evidence, dated)
F-1415-1 (s1415, verbatim): *"the component branch of the new predicate is guarded by nothing. The new test covers the **plain-baron** path only; the component path (`bossGroupId` match + `bossRemaining === 0`) is exercised by no test, and the only evidence it fires is the run's high-power diagnostic, which was not preserved as anything runnable. **A read is not a guard.**"*

s1415 verified the predicate BY READING (`WaveSystem.ts:854-855` builds the same group-id expression) and merged on that basis, which was the right call for that fire. This slice converts that read into a test. Blast radius is bounded to the headless sim; the game path is untouched.

✓ **Facts re-counted s1416 by reading the contracts, because F-1415-3 records two facts the previous master asserted under a ✓ without counting them.** Do the same — count, do not inherit:
- `e2-hill-mine`, `e2-trestle`, `e2-incline` each have **3** components and **no `variantId`**. Because the expression is `(baron.variantId ?? 'baron_railcar') === 'baron_railcar'`, the absent variantId resolves to the **`railcar`** suffix — i.e. `e2-hill-mine:wave-12:railcar`.
- `e3-canyon-works` (`dynamo_crawler`), `e4-dust-flats` (`land_yacht`), `e5-deepwater-claim` (`dredge_queen`, 4 components), `e6-glow-mesa` (`homemaker_9000`, 2 components) resolve to the **`component-boss`** suffix.
- `e1-baron` has **no** `components`, so `expectedGroupId` is `undefined` and the predicate takes its other branch entirely.

**So the component path has TWO sub-branches that produce different group ids, and neither is guarded.** A test that covers only one of them would leave the more common shape (the seven-of-seven `?? 'baron_railcar'` default) unpinned.

## SCOPE (numbered; each item testable)

1. **Extract the predicate as a pure, exported function** in `src/sim/HeadlessContractSim.ts` — e.g. `export function bossGroupDown(baron, contractId, event)` (name it as you judge best; keep it in this file). It must be a *pure move*: the expression is copied, not rewritten. `bindEventLog()` then calls it. **Prove the move is behaviour-neutral, do not assert it** — see self-check 3.
   ⓘ Extraction is the point, not a convenience: the predicate lives inside an event-handler closure, so today the only way to reach it is to run a whole contract to a boss kill, and F-1415-2 has ruled that the escort run *cannot* kill this boss under `--policy=idle`. A unit-reachable surface is what makes the guard affordable at all.

2. **New guard file `scripts/component-boss-secure.test.mjs`**, rooted in `test:node-guards` in `package.json` (insert alphabetically; the roster is **42** files as of `56908b0f` — count it yourself and report the number you found, per F-1411-3). Cases, at minimum:
   - `e2-hill-mine` (components, NO variantId): matching `bossGroupId` + `bossRemaining === 0` → **true**.
   - Same contract, matching `bossGroupId` + `bossRemaining === 1` → **false**. *(this is the assertion the whole finding is about)*
   - Same contract, **wrong** `bossGroupId` + `bossRemaining === 0` → **false**.
   - `e3-canyon-works` (components + `variantId: dynamo_crawler`): the expected id carries the **`component-boss`** suffix, and the `railcar` id does **not** match it.
   - `e1-baron` (no components): `bossGroupId === undefined` → **true**; any defined `bossGroupId` → **false**.
   - The `eliteKind` gate: a kill whose `eliteKind` is not the contract's `bossKind` never secures, even with a perfect group match. (Read `:394` — the default is `'baron'`.)

3. **Prove the guard can fail.** Manufacture the defect in a scratch copy (never in main's working tree — §3.0b): drop the `&& event.bossRemaining === 0` conjunct, run the new file, and **paste the red naming the case**. A guard whose red you have not seen is a guard you have not tested. This is the deliverable, not the green.

4. **Cross-check the id against its producer, by reading:** confirm `src/systems/WaveSystem.ts:854-855` builds the same string for a component boss, and quote both lines in the report. If they have diverged, **STOP and report** — that is a real finding and outranks this slice.

## FIREWALL
**TOUCH-ONLY:** `src/sim/HeadlessContractSim.ts` (extraction + call site ONLY), `scripts/component-boss-secure.test.mjs` (new), `package.json` (the `test:node-guards` roster line only).
**NO:** `src/systems/WaveSystem.ts` (read it, never edit it — the s1406 cure `eaefdb24` lives there) · `src/game/Game.ts` · `scripts/gr-sim.mjs` · `scripts/gr-sim.test.mjs` (F-1412-1's dead-weight line is NOT yours to fold) · any `assets/contracts/**` (if a contract looks wrong, report it) · any pinned hash anywhere · `tasks/**` · `reviews/**` · `STATUS.md`.
🚫 **Do NOT touch the escort probe.** `node scripts/gr-sim.mjs --contract e2-hill-mine --mode escort --policy=idle` returning **rc 1** is EXPECTED and RETIRED as an acceptance test (F-1415-2, s1415). Two fires have already STOPPED on it. It appears in no test file; `scripts/gr-sim.test.mjs:89` asserts `cli.signal === null` (which rc 1 satisfies) and `modes[0].id === "escort"` — never `rc 0`, never `secured`. **If you find yourself trying to make that probe green, you have left this slice.**

## SELF-CHECK (name the exact commands; both projects; zero console)
1. `npx tsc --noEmit` → rc 0.
2. `npm run build` → green; paste the wall time.
3. `node --test scripts/component-boss-secure.test.mjs` → all green; paste the case list.
4. **Behaviour-neutrality of the extraction, measured not asserted:** run `node --test scripts/gr-sim.test.mjs` BEFORE your edit and AFTER, and paste **both** test counts. They must be identical. (This file is load-variable in some shells — F-1409-1/F-1410-1 — so if a count moves, re-run before concluding.)
5. `npm run test:node-guards` → rc 0; paste tests/pass/fail and the skip count with its reason (3 documented F-1408-2 skips are expected in a fire shell; in a lane shell the cross-engine cases RUN — say which shell you were in).
6. `npm run test:ledger-guards` → rc 0.
7. No playwright is required: this slice renders nothing and has no player-facing surface. **Say so explicitly in the report** rather than omitting it (Mistake #10 asks the question; the honest answer here is "none, and here is why").

## REPORT
**READY-FOR-GATES** + report: the roster count you found; the pasted RED from scope 3; the two `WaveSystem.ts` lines quoted for scope 4; both `gr-sim.test.mjs` counts from self-check 4; and anything you were tempted to fix outside the firewall (name it, do not fix it).
