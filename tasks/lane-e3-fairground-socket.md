CODEX: model=gpt-5.6-sol effort=xhigh

# lane-e3-fairground-socket — socket the Fair Wheel dynamo/current half (narrows F-ER01-E3-4; does NOT admit e3-fairground)

**FIRE-AUTHORED s1474 (attended review welcome).** Sixth instance of the ERA-SOCKET class. Templates, in the order they shipped: `tasks/lane-e3-voltage-socket.md` (`3ac90dd8`), `tasks/lane-e3-moth-socket.md` (`47dd309f`), `tasks/lane-e3-canyon-environment.md` (`2256ee58`), `tasks/lane-e3-crawler-socket.md` (`a172eed0`). **Read `reviews/e3-crawler-socket.md` before you start — it is your immediate predecessor.**

🚫 **THIS SLICE MAY NOT MOVE THE CENSUS HEADLINE, AND MAY NOT ADD `e3-fairground` TO `SUPPORTED_CONTRACTS`.** Your predecessor was allowed to move it to `AGENT-READY: 3 of 4` because socketing the Crawler closed Canyon Works' *only* remaining gap. Fairground has **two independent gaps**, and the census says so in its own verdict cell: *"admission needs both the era socket and the declared crowd consumer."* You are closing exactly one of them. **The honest outcome of a perfect run is a NARROWED F-ER01-E3-4, an unchanged `AGENT-READY: 3 of 4 / DATA-GAP: 1 of 4`, and `e3-fairground` still rejected.** If you finish and feel the arithmetic should move, you have misread the finding — say so in your report instead of editing the number.

ROLE: implementer on lane-a. WORKDIR: `worktrees/lane-a` (branch `lane/a`). Commit prefix `fair:`. Never touch STATUS.md, reviews/, tasks/queue/, other lanes.

## PRE-FLIGHT — DO THESE IN ORDER. STEP 1 IS MANDATORY AND UNCONDITIONAL.

**F-1465-2 exists because a master offered the refresh as a conditional and put a currency probe beside it; the runner ran the probe first against a stale lane and truthfully reported "stale lane" about a lane that was one command from correct — 27,551 tokens, zero edits. The probe below CANNOT distinguish "the lane is stale" from "I asked too early". So the refresh is not a conditional. Do step 1, then step 2.**

**STEP 1 — REFRESH (unconditional, run exactly this):**
```
git -C worktrees/lane-a fetch origin main
git -C worktrees/lane-a checkout -B lane/a origin/main
```
*(Measured s1474 at authoring time: `lane-usable.mjs` reports lane-a `USABLE ahead=0 behind=15 tracked-dirt=0`. USABLE is not CURRENT — 15 behind is exactly why step 1 is unconditional.)*

**STEP 2 — CURRENCY PROBE (only after step 1):**
```
grep -c "Both passed, and their passing says nothing about this change." reviews/e3-crawler-socket.md
```
Expect **1**. If **0**, step 1 did not take — STOP and report "refresh did not land", do NOT report a stale lane.
*(Measured to return exactly 1 on main at dispatch time, per F-1425-2. Deliberately apostrophe-free and on a single physical line: `grep` is line-oriented and prose wraps, so a key spanning a line break matches nowhere — including in the file it was copied from.)*

**STEP 3 — SAFE-DUPE:**
```
grep -c "FerrisWheel" src/sim/HeadlessContractSim.ts
```
Expect **0**. If **≥1**, a Fair Wheel path is already socketed — STOP and report; do not re-derive.

ⓘ *Unlike your predecessor, this probe has no case-trap. s1471 discovered that `grep -c "crawler"` returned **1** on a healthy lane by matching the unrelated `'crawler-drain'` power-node role, which would have falsely STOPped the run on arrival. I checked for the same shape here and there is none: measured s1474 on main, `FerrisWheel` → **0**, and case-insensitive `fairground` → **0** and `ferris` → **0**. All three agree, so the key is safe in either case. Recorded because the absence of a trap is only worth knowing if someone looked.*

**STEP 4 — LANE SAFETY:** `git branch --show-current` = `lane/a`. Any dirty *tracked* blob not reachable in git → STOP.
⚠️ **FACTORY-CHURN EXCEPTION (F-1407-1 / F-1266-1):** modifications under `logs/**` and `artifacts/**` are the factory's own background churn and are **NOT** lane dirt. Ignore them in step 4; they must never STOP this run.

## WHY

`docs/bench/e3-readiness-census.md` F-ER01-E3-4 reads, verbatim:

> The browser mounts the Fair Wheel into `PowerGraphSystem`, but GR-SIM has neither system, while `engineDependencies` separately declares that the advertised crowd-flock escort objective has no consumer at all. The attended fix master must keep those gaps separate: socket deterministic wheel/current behavior for agents, and author the missing crowd objective on its own governed surface before Fairground can be admitted.

**"Keep those gaps separate" is the whole design of this master.** You are the socket half. The crowd half is firewalled below.

⭐ **THE GOOD NEWS, MEASURED s1474 ON MAIN RATHER THAN INHERITED: this is the cheapest socket in the class, because almost everything it needs already shipped.** The finding's phrase *"GR-SIM has neither system"* was true when it was written and is now **stale in your favour** — both systems were socketed by your two predecessors:

| # | What the contract declares | State on main (verified s1474) |
|---|---|---|
| 1 | `twist.powerGrid` — 1 producer (`ferris-wheel`, 24 W), 2 lamp consumers (`copper-pavilion-lights`, `silver-pavilion-lights`, 6 W each), 2 wires | **ALREADY SOCKETED** — `HeadlessContractSim.ts:245` constructs `PowerGraphSystem` from `contractPowerDefinition(...)` whenever `twist.powerGrid` exists |
| 2 | `twist.dayNightCycle` — `periodSeconds 24, duskRamp 3, dawnRamp 3, nightDepth 0.9` | **ALREADY SOCKETED** — `HeadlessContractSim.ts:256` constructs `DayNightCycle` |
| 3 | `twist.fairground.wheel` + `.pavilions` | **MISSING — this is your entire slice.** The only consumer is `src/entities/FerrisWheel.ts`, which is browser-only |
| 4 | `twist.fairground.crowdFlocks` | **DECLARED INERT ON PURPOSE** — listed in `DECLARED_INERT_PATHS`, `src/meta/ContractFamilies.ts`. **NOT YOURS.** See NO #1 |
| 5 | `twist.baron` | **ABSENT.** `e3-fairground` has no boss. `twist.secureWave` is **12** |

**Item 5 is worth reading twice, because it retires your predecessor's hardest constraint.** The Crawler slice could not run to secure at all: its boss sat at wave 14 while the shared tick budget at `HeadlessContractSim.ts:349` is `(secureWave + 2)`, so a run-to-secure provably could not terminate and the spec had to step waves by hand. **Fairground has no baron and `secureWave` 12, so a normal run-to-secure terminates inside the existing budget.** You should not need to touch that line, and you are forbidden to (NO #2).

🔑 **THE CONTRACT-DEFINING CHAIN IS ALREADY COMPLETE AND DETERMINISTIC IN THE BROWSER — you are socketing it, not designing it.** I traced every link on main:

1. `Game.ts:3770` — `new FerrisWheel(fairground.wheel)`, registered as a targetable building (`:3771`).
2. `FerrisWheel.damage()` (`src/entities/FerrisWheel.ts:76`) sets `spinning = false` on **any** damage > 0 — not on death, on the **first hit**.
3. `Game.ts:5894` `syncFerrisWheelPower()` mirrors `spinning` onto the graph: `queueCommand({ type: 'set-node-online', nodeId, online: spinning })`. Called from the **sim tick** at `:2593`, not a render path.
4. Wheel offline → 24 W producer offline → both pavilion lamp consumers lose supply → `fairgroundCoverageSources()` (`:5337`) drops them, because it only emits a pavilion source whose graph node `state === 'powered'`.
5. `Game.ts:4848` — `autoSecureWaveForRun()` returns `Number.MAX_SAFE_INTEGER` while `twist.fairground && ferrisWheel.diagnostics.spinning === false`. **A stopped wheel means the run can never be secured.**

**That is a real, observable, existing-lever choice for an agent — defend the dynamo or lose the run — expressed entirely in vocabulary the contract already declares.** No operation needs inventing, which is exactly the test the ERA-SOCKET LAW applies (Mistake #14, and NO #5 below).

## READ-FIRST

1. `reviews/e3-crawler-socket.md` — your immediate predecessor, including **F-1473-1** (a dispose guard was silently broadened and the two tests that reach the affected states never execute the changed line). That is the failure mode of a refactor whose tests assert in the wrong state. Do not repeat it.
2. `src/entities/FerrisWheel.ts` — 184 lines, the subject. Note the shape of the problem: `damage()` and `reset()` **mix simulation and presentation in the same method**, and the constructor calls `buildVisuals()` and `visualY()`, so the class cannot be constructed headlessly at all.
3. `src/sim/HeadlessContractSim.ts` — how `2256ee58` and `a172eed0` socketed `syncCanyonConnectObjective()` and the Crawler. **Mirror that shape.**
4. `src/game/Game.ts` — the five sites in the chain above (`:2592`, `:2593`, `:3770`, `:4848`, `:5337`, `:5894`). This is your reference implementation.
5. `src/agent/MechanicsManifest.ts` — how the two cured sockets derive rules from consumers. ⚠️ **I did not trace this file's derivation logic; READ it rather than assuming the rules appear on their own.** The census asserts the manifest currently exposes none of `dayNightCycle` / `fairground` / `powerGrid` for this contract, so something must change here — find out what, from the precedents.
6. `e2e/er01-e3-census.spec.ts:6` — `SOCKET_GAPS` names those exact three twist sources as fairground's expected gaps. Your slice moves that list; see scope 5.
7. `scripts/gr-sim.test.mjs` — the stub block around `:60–:94`. This is the environment your sim half must survive in. **It stubs `location` and `window`. It does not stub `document`.**

## SCOPE — numbered, each independently testable

1. **Give the Fair Wheel a headlessly-constructible simulation core.** The wheel's entire sim state is `hp`, `spinning`, and the derived `outputWatts` / `coverageSource` / target activity — everything else in the class is `THREE`. Extract that core so it can be constructed with no `THREE`, no `document`, and no `visualY`.
2. **Keep the browser unchanged by construction.** `FerrisWheel` must keep its existing public surface — `diagnostics`, `coverageSource`, `target`, `damage()`, `reset()`, `update()`, `dispose()` — and delegate the sim half to the core. `update(delta)` is **pure presentation** (it rotates `wheel` and `cabins` and nothing else); it must stay that way and must **not** be reachable from the sim.
   ⚠️ **`damage()` returns a value the caller uses** (`Game.ts:4316` returns it to the combat path). Preserve the returned shape exactly. The render half of `damage()` — `faultBeacon.visible`, the material swap — stays in the presentation class.
3. **Socket the core into `HeadlessContractSim`**, mirroring `2256ee58`: construct it when `twist.fairground` exists, drive the `set-node-online` mirror from the fixed-step tick in the same order the browser uses (`Game.ts:2593`, **before** `powerGraph.step`), and route damage to the wheel through the existing combat/targeting path rather than a second bespoke driver.
4. **Expose diagnostics** through `et.goldrush.get_state` under a `fairground` key — at minimum `spinning`, `hp`, `maxHp`, `outputWatts`, and the powered/dark state of both pavilions. An agent must be able to *observe* the chain, not just be subject to it.
5. **Extend `e2e/er01-e3-census.spec.ts`** to assert the socketed behaviour, and shrink `SOCKET_GAPS['e3-fairground']` to whatever genuinely remains. The assertions that matter:
   - the wheel starts spinning, both pavilions start powered;
   - after the wheel takes damage, `spinning` is false, the producer node is offline, **both pavilions go dark**, and the run's auto-secure wave becomes unreachable;
   - two runs on the two pinned bench seeds produce **equal event-log hashes**.
   ⚠️ **Assert in the state that exercises the change (F-1473-1).** An assertion taken while the wheel is still spinning proves nothing about the damaged path.
6. **Update `docs/bench/e3-readiness-census.md`:** narrow F-ER01-E3-4 to its surviving crowd half in the house style (`🟡 NARROWED <date>` + original retained verbatim), correct the fairground row's `Verbs?` cell, and **leave the executive-summary arithmetic exactly as it is.**

## THE ONE JUDGEMENT CALL, MADE FOR YOU

**Do not add `'e3-fairground'` to `SUPPORTED_CONTRACTS` (`src/sim/HeadlessContractSim.ts:41`).** You will be tempted, because after scope 1–4 the contract genuinely runs. Admission is a claim that an agent can *play* the contract, and the crowd-flock escort objective it advertises still has no consumer anywhere — the run would be missing an objective the briefing promises. Admission is a deliberate, hand-edited line for exactly this reason, and it stays where it is until the crowd half is ruled on.

Prove the socket the way the census already proves fairground's *rejection*: through the declared-`mode` path that bypasses the support gate at `HeadlessContractSim.ts:184` (`if (!SUPPORTED_CONTRACTS.has(...) && !mode)`). **Read how `er01-e3-census.spec.ts` currently produces its "forced generic diagnostic" run for fairground and reuse that mechanism.** If it turns out no such path can drive your assertions without admitting the contract, **STOP and report it as a finding** — that is a genuine design fork about what admission means, and it belongs to the owner, not to this run.

## TOUCH-ONLY

- `src/entities/FerrisWheel.ts`
- `src/sim/HeadlessContractSim.ts`
- `src/agent/MechanicsManifest.ts`
- `e2e/er01-e3-census.spec.ts`
- `docs/bench/e3-readiness-census.md`

*(A new file for the extracted sim core is permitted — under `src/systems/` or beside `FerrisWheel.ts` — if that is the cleanest seam. Say which you chose and why.)*

## NO — firewall (violations are worse than an unfinished slice)

1. 🚫 **`twist.fairground.crowdFlocks`, and anything resembling a crowd, flock, or escort objective.** It is in `DECLARED_INERT_PATHS` **on purpose**: the declaration is honest about having no consumer. Authoring one is new gameplay on its own governed surface — an **owner design fork**, explicitly reserved by F-ER01-E3-4. Leaving `crowdFlocks` inert is the *correct* outcome of this slice, not an omission.
2. 🚫 **`src/sim/HeadlessContractSim.ts:349`'s `(secureWave + 2)` tick budget.** Shared by every contract in the game. You should not need it (fairground has no baron); if you think you do, report the measurement.
3. 🚫 **`SUPPORTED_CONTRACTS`.** See the judgement call above.
4. 🚫 **Any behaviour change visible in the browser.** Scopes 1–2 are a *pure* refactor: same calls, same order, new seam. If a browser spec goes red, you changed behaviour — revert and re-cut the seam.
5. 🚫 **Inventing operations.** Five prior sockets in this class invented **zero** new BUILD-grammar operations. Fairground's levers are the ones it already has. If it seems to need a new one, stop and report — that is the vocabulary stretch the ERA-SOCKET LAW forbids (Mistake #14).
6. 🚫 **`objectiveAllowsSecure` (F-1471-1)** — known, mirrored from the browser on purpose. Report, never repair.
7. 🚫 **Balance values, other contracts, other epochs, the Crawler, Canyon Works.**

## SELF-CHECK — name the exact evidence in your report

- `npx tsc --noEmit` clean · `npm run build` green.
- **`npm run test:node-guards`** — **MANDATORY**, you are touching `src/sim/` and `src/entities/` (F-1460-1). ⚠️ **If the `gr-sim` Baron pin moves, that is a FINDING with a named cause, never a re-pin** (F-1441-3). This slice touches no routing and no boss; a moved pin means scope 1–2 was not pure.
- `npx playwright test e2e/er01-e3-census.spec.ts --workers=1` — both projects.
- **The load-bearing browser proof:** run the fairground/E3 browser specs and name them explicitly in your report. **If a browser spec reds, the seam is cut wrong and the slice is unmergeable however green the rest is.**
- Adjacent unmoved: `npx playwright test e2e/er01-e2-census.spec.ts e2e/er01-e4-census.spec.ts e2e/er01-e5-census.spec.ts e2e/er01-e6-census.spec.ts --workers=1`.
- Zero console/page errors, desktop **and** 390px.
- **Report the two determinism hashes** for the pinned bench seeds.
- **State plainly that the headline did NOT move, and that `e3-fairground` is still rejected.** That is the expected, correct result.

READY-FOR-GATES + report: where you cut the sim/presentation seam and why, whether the browser stayed green, the two determinism hashes, what `SOCKET_GAPS['e3-fairground']` shrank to, confirmation that `SUPPORTED_CONTRACTS` and the census arithmetic are untouched, and any finding you were told to report rather than repair.
