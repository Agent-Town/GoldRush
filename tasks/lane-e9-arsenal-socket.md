CODEX: model=gpt-5.6-sol effort=xhigh

# lane-e9-arsenal-socket — socket `E9ArsenalSystem` headlessly as `E9ArsenalSocket`, and COUNT the two consumers it does not run (narrows F-ER01-E9-1 in ALL FOUR rows; the headline does NOT move)

**FIRE-AUTHORED s1503 (attended review welcome).** Seventh instance of the ERA-SOCKET class, and the first **epoch-wide** one. Templates, in the order you should read them: `src/sim/E9CanalSocket.ts` + `e2e/er01-e9-census.spec.ts` (your immediate predecessor, same epoch, same spec file — **your exact shape**), `src/sim/DeepwaterSocket.ts` + `e2e/er01-e5-census.spec.ts` (the borrow-a-real-sim mechanism), `src/sim/AtomicSocket.ts`.

## ⛔ DISPATCH GATE — THIS MASTER WAS AUTHORED UNDISPATCHED, ON PURPOSE

s1503 authored this while `lane-e9-dome-basin-socket` was **live on lane-b**. It was NOT copied into a queue, and the reason is measured, not cautious: this slice's evidence surface is `e2e/er01-e9-census.spec.ts` and `docs/bench/e9-readiness-census.md` — **the same two files the canal socket rewrites**, and there is no third place to put it (every socket in this class asserts inside its epoch's census spec; `ls e2e/ | grep er01` shows nine census specs and **zero** standalone socket specs, so inventing one would put this slice's proof where the census does not read it). Dispatching both at once would have manufactured a 3-way graft on a spec loop plus two independently-written narrowings of the same census row — Mistake #12 and Mistake #15, in advance and on purpose. **The fire that dispatches this must drain `e9-dome-basin-socket` FIRST.** Pre-flight step 3 enforces it and will STOP rather than collide.

ROLE: implementer on lane-c. WORKDIR: `worktrees/lane-c` (branch `lane/c`). Commit prefix `e9arsenal:`. Never touch STATUS.md, reviews/, tasks/queue/, other lanes.

## PRE-FLIGHT — DO THESE IN ORDER. STEP 1 IS MANDATORY AND UNCONDITIONAL.

**F-1465-2 exists because a master offered the refresh as a conditional and put a currency probe beside it; the runner ran the probe first against a stale lane and truthfully reported "stale lane" about a lane that was one command from correct — 27,551 tokens, zero edits. The probe below CANNOT distinguish "the lane is stale" from "I asked too early". So the refresh is not a conditional. Do step 1, then step 2.**

**STEP 1 — REFRESH (unconditional, run exactly this):**
```
git -C worktrees/lane-c fetch origin main
git -C worktrees/lane-c checkout -B lane/c origin/main
```

**STEP 2 — CURRENCY PROBE (only after step 1):**
```
grep -c "The socket admits all four Red Fields contracts and refuses every contract outside the epoch." tasks/lane-e9-arsenal-socket.md
```
Expect **2**. If **0**, step 1 did not take — STOP and report "refresh did not land", do NOT report a stale lane.
*(**2 is DERIVED and was MEASURED before this master was committed**, per F-1502-1: a key grepped against the master itself also matches the pre-flight line that quotes it, so a naive `expect 1` STOPs the run on arrival and blames a lane that is perfectly refreshed. The sentence occurs once here and once as the first sentence of scope item 2. Per F-1425-2 the key is apostrophe-free and sits on a single physical line — `grep` is line-oriented and prose wraps, so a key spanning a line break matches nowhere, including in the file it was copied from.)*

**STEP 3 — PREDECESSOR GATE (this is the dispatch gate above, made executable):**
```
ls src/sim/E9CanalSocket.ts
```
Expect the file to **EXIST**. If it is **absent**, `e9-dome-basin-socket` has not landed on main yet — **STOP and report "predecessor not landed"**. Do not proceed, do not re-derive it, and do not write your own census narrowing on top of a row the canal slice is about to rewrite.
*(This is the inverse of the usual SAFE-DUPE probe, and deliberately so. The usual probe asks "did someone already do MY work?"; this one asks "did my PREDECESSOR finish?" — because this slice edits two files that predecessor also edits, and arriving first is the failure mode, not arriving second.)*

**STEP 3b — SAFE-DUPE (your own file):**
```
ls src/sim/E9ArsenalSocket.ts
```
Expect **no such file**. If it exists, an arsenal socket is already landed — STOP and report.

**STEP 4 — LANE SAFETY:** `git branch --show-current` = `lane/c`. Any dirty *tracked* blob not reachable in git → STOP.
⚠️ **FACTORY-CHURN EXCEPTION (F-1407-1 / F-1266-1):** modifications under `logs/**` and `artifacts/**` are the factory's own background churn and are **NOT** lane dirt. Ignore them in step 4; they must never STOP this run.

## WHY

`docs/bench/e9-readiness-census.md:28` (F-ER01-E9-1) asks the factory to "separate those production systems' deterministic simulation seams from presentation, socket their action/view/event vocabulary headlessly, and add honest dependency staging before this row can be admitted."

**`E9ArsenalSystem` is the EPOCH-WIDE half of that gap: it is named as a blocker in all four census rows** (`docs/bench/e9-readiness-census.md:19`, `:20`, `:21`, `:22` — each reads "epoch-wide `E9ArsenalSystem`"), and the executive summary at `:10` calls it out by name. The canal socket narrowed **one** row. This one narrows **four**.

Every fact below was measured on main by s1503. Facts 1 and 2 are a **correction** to inherited evidence, not a copy of it.

| # | Fact | Evidence (verified s1503, read from main) |
|---|---|---|
| 1 | **The system's own file is DOM-free — but that probe was never sufficient to conclude it is socketable** | `grep -cE "document\|window\|localStorage\|Math.random\|Date.now\|randomUUID\|performance\." src/systems/E9ArsenalSystem.ts` → **0**. That is the probe F-1502-3 ran, and it is the same probe that would have said `DredgeQueenBossSystem` was fine while `document.createElement` sat in its instance field initialisers (`DeepwaterSocket.ts:23-24`). A file-scoped probe cannot see a constructor's constructor. |
| 2 | **Re-measured across the whole RUNTIME import closure, the conclusion HOLDS — and the closure contains one dormant instance of exactly that hazard** | The runtime closure (relative imports, `import type` edges excluded because they are erased and carry no runtime edge) is **25 files**. No file in it has an unguarded **module-level** DOM access. Guarded-and-safe: `Balance.ts:1103`, `generated.ts:79`/`:122`, `PerformanceTier.ts:179`/`:323`/`:351`/`:376`, `ContractFamilies.ts:2290-2291`, `Rng.ts:108`, `Water.ts:509`, `Terrain.ts:1231`+. ⚠️ **`src/systems/E7SignalSystem.ts:92` is `private readonly root = document.createElement('section');` — a bare-`document` INSTANCE FIELD INITIALISER, in your closure** via `ContractFamilies.ts:24`. It is harmless **only** because nothing constructs `E7SignalSystem`: importing the module is safe, `new`-ing that class is not. **Do not construct it, and do not import anything that does.** |
| 3 | **`E9ArsenalPresentation` does NOT repeat the DredgeQueen hazard** | `src/entities/E9Arsenal.ts:25-52` — every instance field initialiser is pure `three` (`Group`, `Float32Array`, `BufferGeometry`, `LineBasicMaterial`, `Line`, `InstancedMesh`, `TorusGeometry`, `Mesh`, `Matrix4`, `Vector3`). No `TextureLoader`, no `CanvasTexture`, no `new Image()`, no `document`. Its constructor (`:54-67`) and `diagnostics(at)` (`:140-156`) are DOM-free; `update(...)` (`:109-126`) reaches only `Terrain.visualY(...)`, which is pure math. It is constructed eagerly at `E9ArsenalSystem.ts:43`, so this mattered. |
| 4 | **Every constructor dependency already exists headlessly, and the E5 spec already proves how to borrow them** | `E9ArsenalSystem.ts:57-66` takes 8 params. `HeadlessContractSim` already constructs `events` (`:163`), `enemies` (`:165`), `hero` (`:166`), `combat` (`:186`, assigned `:258`) and `build` (`:187`, assigned `:276`, whose `turretPosition(index)` is `BuildSystem.ts:747`). All are `private` — and `private` is a **compile-time-only** marker, so `vite.ssrLoadModule` (which returns `any`) reaches them. `e2e/er01-e5-census.spec.ts:128-139` does exactly this today: `sim.combat`, `() => sim.hero.group.position`, and a **fresh** `new EnemyPool()` rather than the sim's. |
| 5 | **The browser tick site, verbatim** | `src/game/Game.ts:2576` — `this.e9ArsenalSystem.update(simDelta, this.timeAlive);`, immediately after `:2575` `e6ArsenalSystem.update(...)` and before `:2577` `pressureSystem.update(...)`. Construction is `Game.ts:1355-1366`. The **second** consumption is later in the same tick: `Game.ts:2616` calls `movementMultiplier(enemy)` from inside `this.enemies.update(...)` (`:2601`), chained after `nightSpeedMultiplier`, `wrangle`, and `e6ArsenalSystem`. Your header comment must state this order and mark what you refuse. |
| 6 | **The two consumers you cannot run, and why they must be COUNTED not dropped** | The socket does not run `CombatSystem.update(...)` (which is what actually fires the registered shooters, so `fires.*` and `outcomes` stay empty) and does not run `EnemyPool.update(...)` (the movement integrator that CONSUMES `movementMultiplier`, so a fence slow is computed and applied to nothing). Both are real gaps. `DeepwaterSocket.ts:29` states the law: "A census can then assert the gap exists rather than infer it from an absence." |
| 7 | **Canon check, so you do not "fix" it** | The Cure-Arms outcomes are `freed_turned_back` / `fevered_machine_powered_down` / `pristine_machine_damaged`, all typed `lethal: false` (`E9ArsenalSystem.ts:13-19`). That is ADR-001 working as intended — frontier-tech that turns machines back rather than firearms that kill. **Do not add a lethal outcome, and do not rename these.** |

## READ-FIRST

1. `src/sim/E9CanalSocket.ts` — the whole file. Your predecessor in the same epoch; match its header-comment discipline and its refusal-counter naming.
2. `src/sim/DeepwaterSocket.ts` — the whole file, especially the header comment (`:10-30`) and `get simulationSnapshot` (`:167-171`), which excludes presentation fields so that a render decision can never move a determinism hash.
3. `e2e/er01-e5-census.spec.ts:144-170` (in the test titled `${contract.id} census admission is explicit` — RENAMED from `… census refusal is explicit` by the E5 re-admission merge `26a364bfe`, 2026-08-20, which also moved these lines; re-based s2078) — the `drive(steps)` helper, the borrow of `sim.combat` and `sim.hero.group.position`, and the two-independent-drives determinism assertion.
4. `e2e/er01-e9-census.spec.ts` — the whole file, **as it stands after the canal socket landed**. It is short, and you must fold into the loop the canal slice already extended.
5. `src/systems/E9ArsenalSystem.ts` — the whole file (286 lines). It is the subject.
6. `docs/bench/e9-readiness-census.md:9-10` and `:19-22` and `:26-28` — the summary, the four rows, and F-ER01-E9-1's exact words. **Read the current text; do not trust this master's quotations of it, which predate the canal slice's narrowing.**

## SCOPE — numbered, each independently testable

1. **Create `src/sim/E9ArsenalSocket.ts`**, mirroring `E9CanalSocket`/`DeepwaterSocket`: a `private constructor`, a `static create(contract, combat, events, enemies, heroPosition, turretPosition, hasResearch)` returning the socket or `null`, an `advance(at)` / `step(delta, at)` driving `E9ArsenalSystem.update`, a `diagnostics` getter, and a `simulationSnapshot` getter that is **stable to `JSON.stringify`**.
   - `simulationSnapshot` **must exclude `diagnostics.presentation`** entirely, for the reason `DeepwaterSocket.ts:162-166` gives: a render decision must never move a determinism hash.
   - It must be DOM-free and must not import anything that constructs `E7SignalSystem` (fact 2).
2. **Admit the epoch, refuse the world.** The socket admits all four Red Fields contracts and refuses every contract outside the epoch. `create()` returns a socket for `e9-dome-basin`, `e9-seed-run`, `e9-devils-alley` and `e9-old-canal`, and `null` for a non-E9 control such as `e1-dry-gulch` and `e5-deepwater-claim`.
   ⚠️ **This is the one place you must NOT copy `DeepwaterSocket`.** That socket is contract-scoped and returns `null` for its own siblings; this system is **epoch-wide** (fact: `docs/bench/e9-readiness-census.md:19-22` names it in all four rows), so a per-contract refusal here would be a lie about the subject. Derive the epoch from the contract manifest, not from a hardcoded list of four ids.
3. **COUNT the two consumers you do not run** (fact 6). Expose a counter for each — e.g. `combatTicksRefused` and `enemyIntegrationTicksRefused` — incremented on every `advance` where the browser would have run them, plus a `refusedConsumers: readonly string[]` naming `CombatSystem.update` and `EnemyPool.update`. Name in the header comment what each refusal costs: no shooter ever fires, so `fires` and `outcomes` stay empty; and a fence slow is computed but integrated by nothing.
4. **Extend `e2e/er01-e9-census.spec.ts` inside the existing per-contract loop.** From a driven socket assert:
   - **weather charge accrues** across a storm phase and is capped at `Balance.e9Arsenal.weather.chargeCapacity`,
   - **research gating is real**: with `hasResearch` returning `false`, `diagnostics.items` is `[]`; with it returning `true`, all four items appear,
   - **the fence is a real lever**: `deployFence(position)` returns `true` only with `storm_fence`, and `fenceDeployments` grows,
   - **displacement happens**: an enemy spawned inside a deployed field is pushed — `pushedDistance > 0` — and `movementMultiplier(enemy)` returns `Balance.e9Arsenal.stormFence.slowMultiplier` while raising `denialTicks`,
   - **determinism**: two independent sockets driven for identical tick counts produce byte-identical `JSON.stringify(simulationSnapshot)`,
   - **both refusal counters are `> 0`**,
   - and `create()` returns `null` for the two non-E9 controls.
   ⚠️ **Add NO new `test(...)` titles.** Assert inside the loop that already exists, so the suite stays **4 tests per project**.
5. **Narrow F-ER01-E9-1 in `docs/bench/e9-readiness-census.md` across all four rows** — honestly, with your measured numbers. **The executive summary stays `AGENT-READY: 0 of 4` and `DATA-GAP: 4 of 4`**; every row stays **NO / DATA-GAP**. What changes is that `E9ArsenalSystem` is no longer described as "browser-only" or "absent headlessly" in rows `:19-22` and summary `:10`; it is socketed, with the two un-run consumers named. Rows `:20`, `:21`, `:22` keep their own `missing` signature consumers untouched — those are not yours. **Do not touch any row's arithmetic or its `fnv1a32:` hashes.**

## 🚫 THIS SLICE IS FORBIDDEN FROM MOVING THE CENSUS HEADLINE, AND THAT IS THE POINT

`AGENT-READY: 0 of 4` must still read `0 of 4` when you are done, and the existing assertion that the sim **throws** for all four contracts — `e2e/er01-e9-census.spec.ts:55-59` ("${contract.id} census rejects the unsocketed Red Fields mechanic") — must stay **green and unedited**. It is the load-bearing proof that you narrowed a gap instead of inflating a row. Socketing a system is not admitting a contract; the census's own cure is two acts ("socket ... **and derive their vocabulary**"), and you are doing one.

## THE ONE JUDGEMENT CALL, MADE FOR YOU

⚠️ **Do NOT wire `E9ArsenalSocket` into `HeadlessContractSim`, and do NOT add any E9 contract to `SUPPORTED_CONTRACTS`.** `DeepwaterSocket` *is* wired (`HeadlessContractSim.ts:348`) and copying that would look like fidelity — but its wiring is **inert**, because the sim refuses to construct any E5 contract; `HeadlessContractSim.ts:59-61` says so in its own comment. Adding a second inert branch buys nothing today and puts a `src/sim/HeadlessContractSim.ts` diff — and therefore the `gr-sim` Baron pin — at risk for a slice with no need of it. **If you believe this is wrong, report it as a finding with the measurement — do not act on it.**

## TOUCH-ONLY

- `src/sim/E9ArsenalSocket.ts` (new)
- `e2e/er01-e9-census.spec.ts`
- `docs/bench/e9-readiness-census.md`

## NO — firewall (violations are worse than an unfinished slice)

1. 🚫 **`src/systems/E9ArsenalSystem.ts`.** It is already DOM-free with a clean `(delta, at)` tick seam (facts 1-3). If you find you must edit it, you have found a **finding**, not a task — report it with the line number and stop that edit. The browser is the reference implementation.
2. 🚫 **`src/entities/E9Arsenal.ts`.** Same reason (fact 3). Its presentation is excluded from your snapshot, not refactored out of the system.
3. 🚫 **`src/sim/HeadlessContractSim.ts`** — including `SUPPORTED_CONTRACTS`. See the judgement call above.
4. 🚫 **`src/sim/E9CanalSocket.ts` and anything the canal slice landed.** It is your template and your predecessor, not your scope. If it looks wrong, that is a finding.
5. 🚫 **`src/agent/MechanicsManifest.ts` and any manifest vocabulary.** Deriving verbs is the admission slice's job; doing it here would move `mechanics.rules` and make the Verbs column lie about contracts the sim still refuses — and `e2e/er01-e9-census.spec.ts:54` ("${contract.id} census rejects the unsocketed Red Fields mechanic") asserts `mechanics.rules` is exactly `['build_zones']`.
6. 🚫 **`src/systems/OldDiggerBossSystem.ts`, `src/systems/E7SignalSystem.ts`, `assets/contracts/**`, `src/game/Game.ts`.** Count what you refuse; do not socket it, and do not add `engineDependencies` (`e2e/er01-e9-census.spec.ts:40` ("${contract.id} census rejects the unsocketed Red Fields mechanic") asserts that absence for `e9-dome-basin`).
7. 🚫 **Balance values, other epochs, other censuses.**
8. 🚫 **Inventing operations.** Six prior sockets in this class invented **zero** new BUILD-grammar operations. If the arsenal seems to need one, stop and report — that is the vocabulary stretch the ERA-SOCKET LAW forbids (Mistake #14).

## KNOWN LANDMINES — do not chase them

- **The terrain bind.** `src/world/Terrain.ts` and `src/sim/TileHeight.ts` bind the active contract at module load, and `E9ArsenalPresentation.update` samples `Terrain.visualY(...)`. Borrowing a `the-claim` sim therefore samples **the Claim's** terrain. Harmless: `visualY` sets render-side `y` only (CLAUDE.md §4.6), and every assertion in scope 4 is on `x`/`z`, counters, phases and multipliers. **Do not "fix" it by loading two contracts in one process.** If a `y` value ever appears in `simulationSnapshot`, remove the `y`, not the terrain.
- **Loader syntax.** `Terrain.ts:2` uses `?raw` and `:635` uses `import.meta.glob`, so a plain `node`/`tsx` harness fails on syntax. Load through `vite.ssrLoadModule`, exactly as the census spec already does.
- **`Math.random` is not in your closure and must not enter it.** Determinism in scope 4 depends on it.

## SELF-CHECK — name the exact evidence in your report

- `npx tsc --noEmit` clean · `npm run build` green.
- **`npm run test:node-guards`** — **MANDATORY**, your diff adds a file under `src/sim/` (F-1460-1). ⚠️ **If the `gr-sim` Baron pin moves, that is a FINDING with a named cause, never a re-pin** (F-1441-3). This slice adds a file nothing imports yet, so the pin **must not move**; if it does, something in scope 1 reached the shared sim.
- `npx playwright test e2e/er01-e9-census.spec.ts --workers=1` — both projects. **Expect 4 passed per project, 8 across desktop+mobile.** *(DERIVED, not optimistic: `redfields.contracts` holds 4 contracts and the file's single `for` loop mints one `test(...)` per contract; scope 4 forbids new test titles, so the count is unchanged. If you see 5 or 10, you added a test title — fold it back into the loop.)*
- **The unmoved-headline proof:** state plainly that the `HeadlessContractSim` throws-assertion (`e2e/er01-e9-census.spec.ts:55-59` ("${contract.id} census rejects the unsocketed Red Fields mechanic")) is still green and unedited, and quote the summary line showing `AGENT-READY: 0 of 4`.
- Adjacent unmoved: `npx playwright test e2e/er01-e5-census.spec.ts e2e/er01-e6-census.spec.ts --workers=1` (the sockets you copied) plus **the browser-side owner of your subject** — find it from the tree rather than from this list (`ls e2e | grep -i e9`), because an adjacent-suite list written at authoring time is perishable and the canal slice landed after this master was written.
- Zero console/page errors, desktop **and** 390px.
- **Report the two determinism snapshots** (the `JSON.stringify` hash, or its first 120 chars, for both drives) and **both refusal counters**.
- **State plainly that the headline did NOT move**, which four census rows you reworded, and what the remaining E9 gap now is.

READY-FOR-GATES + report: the socket's public surface, the two determinism hashes, both refusal counters, confirmation that `SUPPORTED_CONTRACTS`, `E9ArsenalSystem` and `E9Arsenal` are untouched, the census wording you changed in each of the four rows, and any finding you were told to report rather than repair.
