# Task playability-smoke-practice-exemption: the census must read the exemption the CONTRACT already declares (FIRE-AUTHORED s2579, attended review welcome; commit prefix "fix:")

**ROLE + WORKDIR.** An Opus implementer in a scratch worktree at main, launched by the attended session per `tasks/CODEX-WALL` ("Implementation while the wall stands: Opus implementer agents launched by the attended session in scratch worktrees, drained attended"). **BANKED, NOT QUEUED — while the wall stands there is NO Codex dispatch and §2E refills are suspended, so this master must NOT be `cp`'d into `tasks/queue/<slot>/`.**

## Pre-flight (MAIN slot / scratch worktree at main — copy verbatim)
> Pre-flight: `git status --short` must show no staged/modified TRACKED file OUTSIDE the two factory-churn classes below — if any exist, STOP and report (a live drain or another task owns the tree). Untracked `??` host debris (art raws, .claude/) is EXPECTED — list briefly, proceed.
> **FACTORY-CHURN EXCEPTION — these two tracked classes are ALWAYS EXPECTED on the main slot and are NEVER a STOP; list them and proceed (F-1407-1, s1407):** (a) `logs/**` — the fire/runner accounting (`factory-usage.json`, `usage-history.jsonl`, `task-stats.jsonl`, `dashboard.html`, `.goal-tree.html`, `.blocked-seen`), rewritten every cycle by the factory itself; (b) `artifacts/**`, `reviews/shots-*` and any `.png` — regenerated evidence. What still STOPs, unchanged and load-bearing: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md` — i.e. anything a live drain or a concurrent task could actually own.

⚠️ **This slice REGENERATES SCREENSHOTS by construction** — its own self-check runs the smoke four times, which writes `artifacts/playability-smoke/dev/*.png`. Expect that dirt in your own tree at the end; it is class (b) above, it is yours, and it is not a finding.

**If the wall lifts and this is dispatched to a lane instead**, replace the block above with the LANE safe-dupe template from `.claude/skills/author-task/SKILL.md` §3 verbatim — including its own FACTORY-CHURN EXCEPTION line (F-1407-1) and the F-1266-1 evidence-artifact exception. Do not paraphrase either.

## READ FIRST (paths, in this order)
- `docs/bench/playability-census-2026-09-15.md` — the census this cures a row of.
- `tasks/BACKLOG.md` line 1 area — the STANDING DUTY row and the F-PLAY rows (`grep "F-PLAY-E1-1"`).
- `e2e/playability-smoke.spec.ts` — the subject. Read its header comment in full; it explains why there is no `?debug` seam (Mistake #10) and why the wave counter is read the way it is.
- `src/meta/ContractFamilies.ts` — `ContractPracticeMode` (`grep -n "scheduledWaves: false"`), and `AUTHORED_PRACTICE_KEYS`.
- `src/game/Game.ts` — the wave-suppression disjunct (`grep -n "practice?.scheduledWaves === false"`).
- `src/agent/MechanicsManifest.ts` and `src/agent/StandingOrders.ts` — the TWO existing consumers of this same declaration. Match their predicate; do not invent a third spelling.

## Why (evidence, quoted and dated)
**Owner directive, 2026-09-15**, via `tasks/BACKLOG.md` (commit `c30c3de14`): *"how do we go from epoch1 to all epochs? … lets do 1. and 2."* — establishing the whole-board playability census as a standing duty, with failing contracts filed as `F-PLAY-<epoch>-<n>` and **never fixed in the same fire**.

**The census row being cured, from `docs/bench/playability-census-2026-09-15.md` (attended, main `585719e1d`, 27.9 min, both projects):**
> `e1-drill-yard | 1 | ✗ | ✗ | reached wave 0 after 374 s sim (runState `playing`, HUD wave "0"): the Drill Yard has no waves to reach — a by-design exemption the smoke does not declare (F-PLAY-E1-1)`

and its own reading: *"The Drill Yard row is a census defect, not a map defect."* The BACKLOG row scopes it: *"the smoke needs a declared per-contract exemption (corrective on `e2e/playability-smoke.spec.ts`, fire-authorable, no map change)."*

**MEASURED s2579 — and this SHARPENS the BACKLOG row rather than merely repeating it.** The row reads as though an exemption must be invented. **It already exists, in the contract data, and is typed so it can hold no other value:**
- `assets/contracts/epoch-1-frontier/contracts.json` declares `practice.scheduledWaves: false` on `e1-drill-yard`. Measured across **all 42 board contracts in all ten epoch bundles: exactly ONE declares `practice`, and its `scheduledWaves` is `false`.** 42 is exactly the census denominator.
- `src/meta/ContractFamilies.ts` types it as the literal `scheduledWaves: false` inside `ContractPracticeMode`, and lists `practice` in `AUTHORED_CONTRACT_KEYS` with its own shape validation. A practice contract **cannot** declare waves on.
- `src/game/Game.ts` consumes it as one of the disjuncts that disables the wave scheduler: `|| this.activeContract.practice?.scheduledWaves === false`.
- `src/agent/MechanicsManifest.ts` (`if (practice?.scheduledWaves !== false)`) and `src/agent/StandingOrders.ts` (`scheduledWavesDisabled()`) already read the same declaration. **The smoke is the only consumer that does not** — which is the whole defect.

So the run the census observed is correct behaviour reported as a failure: alive (`runState playing`), never advancing, for 374 simulated seconds, because this contract's waves are declared off.

**THEREFORE THE CURE IS TO READ A DECLARATION, NOT TO HARDCODE AN ID.** A hardcoded `e1-drill-yard` list is forbidden here: `F-1464-3` is this factory's recorded case of a hardcoded mapping that rotted while still resolving, and the declaration is already the key three other consumers use.

## Scope (numbered, each item testable)
1. **Read the exemption from the manifest.** In `e2e/playability-smoke.spec.ts`, derive per contract `const wavesDeclaredOff = contract.practice?.scheduledWaves === false;` — from the `ContractManifest` the spec already holds via `listBoardContracts()`. Use that predicate spelling verbatim, matching `Game.ts` and `MechanicsManifest.ts`. **No contract id appears anywhere in the new code.**
2. **Substitute the question; do NOT delete it.** For a contract with `wavesDeclaredOff`, the "reaches wave 2" question is inapplicable, and an exemption into a vacuum is how a check decays into a formality (F-1460-1). Replace it, for those contracts only, with a training-yard question that **can still fail**:
   - the run is still alive at the end of the poll window (`runState === 'playing'`, explicitly NOT `'dead'`), **and**
   - the yard's own affordance is on screen — `[data-testid="drill-yard-training-tag"]` or `[data-testid="drill-yard-prompt"]` present (both are written by `src/game/DrillYard.ts`).
   A practice contract that dies, or that boots with no training yard, must still RED.
3. **Declare the exemption in the output; never let it read as a plain pass.** The `wave2` cell for an exempted contract must carry its reason in its own detail string — name the predicate and what was asked instead, e.g. `practice contract: scheduled waves declared off (practice.scheduledWaves === false) — asked "alive + training yard present" instead`. Add an explicit boolean (e.g. `waveExempt`) to the `Row` type so `artifacts/playability-smoke/rows.jsonl` records it, and push a `notes` entry too. A declaration that appears only on failure re-creates the ambiguity it removes (F-2208-1) — so it prints on the happy path as well.
4. **The per-contract test title must stop asserting something untrue of that contract.** The title is generated per contract (`${contract.id} boots plain, briefs, moves and reaches wave 2`); for an exempted contract it must name the substitute instead. Keep the non-exempt title byte-identical so 41 of 42 titles do not move (playwright collection identity, and `--list` diffs).
5. **Guard it, keyed on the declaration.** New `scripts/playability-practice-exemption-guard.test.mjs`, rooted in `test:ledger-guards`:
   - the set of exempted contracts is DERIVED from the contract bundles at test time, not transcribed;
   - **REFUSES (non-zero, loud) if that set is EMPTY** — a `for` loop over nothing registers no assertions and reports success (F-2217-1), and an empty set here would silently mean "nobody is exempt" while the census keeps redding;
   - **reverse control:** asserts a NON-practice contract (pick one by derivation, e.g. the first board contract without `practice`) does **not** get the exemption — an over-general cure that exempts everything must red;
   - asserts the spec contains no hardcoded `e1-drill-yard` literal in its exemption path.
6. **No map change, no contract change.** The three other census failures (F-PLAY-E2-1 trestle, F-PLAY-E2-2 incline, F-PLAY-E6-1 picnic) are real map-pressure findings and are **out of scope** — attended Opus implementers already hold `beauty2/e2-trestle`, `beauty2/e2-incline` and `beauty2/e2-pressure-garden`. Touch none of them.

## Firewall
**TOUCH-ONLY:** `e2e/playability-smoke.spec.ts` · `scripts/playability-practice-exemption-guard.test.mjs` (new) · `package.json` (ONLY to root the new guard in `test:ledger-guards`).
**NO:** any file under `src/` · any file under `assets/contracts/**` (the declaration is correct; do not "help" it) · any other `e2e/*.spec.ts` · `playwright.config.ts` · `scripts/gr-sim.mjs` and the sim guards · `tasks/BACKLOG.md` and `tasks/goals.json` (the drain writes those, not the runner) · `scripts/fire.md` / `CLAUDE.md`.
Reporting an adjacent problem is good and expected; fixing one out of scope is a violation — write it in the report instead.

## Self-check (the runner runs these and pastes the real numbers)
1. `npx tsc --noEmit` — clean.
2. `npm run build` — green.
3. `node --test scripts/playability-practice-exemption-guard.test.mjs` — all arms pass, and **paste the derived exemption set** (expect exactly one member today; the guard must refuse, not pass, if it is empty).
4. **Targeted census, both projects, the exempted contract AND a control** — the control is what proves the cure is not blanket:
   `GR_PLAYABILITY_SMOKE=1 GR_SMOKE_ONLY=e1-drill-yard,e1-dry-gulch npx playwright test e2e/playability-smoke.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=line`
   Expect **4/4 pass**: `e1-drill-yard` green on BOTH projects via the declared exemption (this is the row that was ✗/✗ on 2026-09-15), and `e1-dry-gulch` green on BOTH projects by genuinely reaching wave 2 — unchanged. `--workers=1` is mandatory and is a correctness requirement of the instrument, not an optimisation (F-1270-1).
5. **Paste the `rows.jsonl` line for `e1-drill-yard`** showing the exemption boolean and the reason string — that is the evidence item 3 landed.
6. Zero console / zero page errors on all four runs (the smoke's own `clean` cell); screenshots exist under `artifacts/playability-smoke/dev/` and are each < 300 KB.
7. Adjacent, unmodified-green: `node --test scripts/*.test.mjs` for `test:ledger-guards`, and `npx playwright test e2e/agent-view.spec.ts e2e/gazette-living.spec.ts --workers=1` (both read `e1-drill-yard` as a special case and must not move).

## Firewall note on the census itself
**DO NOT re-run the full `npm run test:playability` in this task.** It is ~60 min, it is a STANDING DUTY with its own once-per-day cadence and dry-board condition, and running it beside these gates violates "never beside another battery". The targeted 4-run check above is the evidence for this slice; the next census run is what confirms the row flips.

## No-op guard
If you find yourself about to exit without changes, **WRITE WHY into your report first** — a silent no-op wastes a queue slot and a gate (Mistake #1). In particular: if you conclude the exemption should NOT be read from `practice.scheduledWaves`, say so with the evidence that changed your mind rather than exiting quiet; that would be a larger finding than the one you were sent for, and it belongs in the report.

READY-FOR-GATES — report: the derived exemption set and its size; the 4/4 targeted matrix with both projects named; the `rows.jsonl` exemption line verbatim; the guard's arm count and what its reverse control asserts; tsc/build results; any adjacent suite that moved (with the diff), and anything you found out of scope and did NOT fix.
