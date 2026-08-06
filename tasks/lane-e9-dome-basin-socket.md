CODEX: model=gpt-5.6-sol effort=xhigh

# lane-e9-dome-basin-socket — socket E9CanalSystem headlessly as `E9CanalSocket`, and COUNT the two gaps it does not close (narrows F-ER01-E9-1; the headline does NOT move)

**FIRE-AUTHORED s1502 (attended review welcome).** Sixth instance of the ERA-SOCKET class. Templates, in the order you should read them: `src/sim/DeepwaterSocket.ts` + `e2e/er01-e5-census.spec.ts` (the E5 socket — **your exact shape**), `src/sim/AtomicSocket.ts` (the in-memory tile-store precedent), `tasks/lane-e3-crawler-socket.md` (the honesty clauses).

🚫 **THIS SLICE IS FORBIDDEN FROM MOVING THE E9 CENSUS HEADLINE, AND THAT IS NOT A CONSOLATION — IT IS THE POINT.** `docs/bench/e9-readiness-census.md` reads **AGENT-READY: 0 of 4**, and admitting `e9-dome-basin` needs **three** systems socketed (`E9ArsenalSystem`, `E9CanalSystem`, `OldDiggerBossSystem`) plus derived vocabulary. You are socketing **one** of the three. The existing census assertion that `new HeadlessContractSim({contractId:'e9-dome-basin'})` **throws** (`e2e/er01-e9-census.spec.ts:56–59`) must stay **green** — it is the load-bearing proof that you narrowed a gap instead of inflating a row. A census row is a claim about what an agent can do, and this class cannot absorb an inflated one.

ROLE: implementer on lane-b. WORKDIR: `worktrees/lane-b` (branch `lane/b`). Commit prefix `e9canal:`. Never touch STATUS.md, reviews/, tasks/queue/, other lanes.

## PRE-FLIGHT — DO THESE IN ORDER. STEP 1 IS MANDATORY AND UNCONDITIONAL.

**F-1465-2 exists because a master offered the refresh as a conditional and put a currency probe beside it; the runner ran the probe first against a stale lane and truthfully reported "stale lane" about a lane that was one command from correct — 27,551 tokens, zero edits. The probe below CANNOT distinguish "the lane is stale" from "I asked too early". So the refresh is not a conditional. Do step 1, then step 2.**

**STEP 1 — REFRESH (unconditional, run exactly this):**
```
git -C worktrees/lane-b fetch origin main
git -C worktrees/lane-b checkout -B lane/b origin/main
```

**STEP 2 — CURRENCY PROBE (only after step 1):**
```
grep -c "The socket must refuse the other three Red Fields contracts the way createDeepwaterClaimTile refuses the variants." tasks/lane-e9-dome-basin-socket.md
```
Expect **2**. If **0**, step 1 did not take — STOP and report "refresh did not land", do NOT report a stale lane.
*(**2 is DERIVED, not observed-and-shrugged-at:** the key sentence occurs once in this pre-flight command and once as the first sentence of scope item 2. s1502 wrote **1** first, ran the grep before dispatch, measured **2**, and corrected the master — a shipped `expect 1` would have STOPped this run on arrival and blamed a lane that was perfectly refreshed. Per F-1425-2 the key is apostrophe-free and on a single physical line: `grep` is line-oriented and prose wraps, so a key spanning a line break matches nowhere — including in the file it was copied from. This file is NEW on main in the commit that authored it, so any non-zero count proves the refresh carried that commit.)*

**STEP 3 — SAFE-DUPE:**
```
ls src/sim/E9CanalSocket.ts
```
Expect **no such file**. If it exists, a canal socket is already landed — STOP and report; do not re-derive.
*(Measured absent on main at dispatch. The tempting probe `grep -c "E9Canal" src/sim` is WRONG: it returns 0 today but would also return 0 after a partial landing that named the class differently, and it says nothing about the file this slice creates.)*

**STEP 4 — LANE SAFETY:** `git branch --show-current` = `lane/b`. Any dirty *tracked* blob not reachable in git → STOP.
⚠️ **FACTORY-CHURN EXCEPTION (F-1407-1 / F-1266-1):** modifications under `logs/**` and `artifacts/**` are the factory's own background churn and are **NOT** lane dirt. Ignore them in step 4; they must never STOP this run.

## WHY

`docs/bench/e9-readiness-census.md` F-ER01-E9-1 asks the factory to "separate those production systems' deterministic simulation seams from presentation, socket their action/view/event vocabulary headlessly, and add honest dependency staging before this row can be admitted."

**F-1495-1 (s1495) then RAN the precondition probe that F-1481-2 demanded before any E7/E9 socket master could be written, and it split the pair: `e7-relay-valley` COLLAPSES, `e9-dome-basin` is SOCKETABLE.** Every fact below was re-measured on main by s1502 rather than inherited from that finding:

| # | Fact | Evidence (verified s1502, read from main) |
|---|---|---|
| 1 | **`E9CanalSystem` is DOM-free** | `grep -nE "document\|window\|localStorage\|Math.random\|Date.now\|randomUUID\|performance\." src/systems/E9CanalSystem.ts` → **zero hits**. Same probe on `src/systems/WeatherSystem.ts` (its only system dependency, `:62`) → **zero hits**. It builds `THREE` meshes in its constructor, which needs no DOM. |
| 2 | **Its tick is already a clean `(delta, at, actors)` seam** | `E9CanalSystem.ts:103` — `update(delta, at, actors): boolean` calls `syncPaidObjectives` → `updateStage` → `updateQuarry` → `updateDustDevil`. **No refactor is required.** This is the first socket in the class whose subject needs no presentation split. |
| 3 | **Its `Actor` is already what a sim produces** | `E9CanalSystem.ts:17` — `type Actor = { position: THREE.Vector3; speed: number }`. `HeadlessContractSim.harvestTargets()` (`:1058`) returns `[{ actorId, position, speed }]`. Structurally compatible today. |
| 4 | **The persistence landmine is real and has a shipped cure** | The constructor calls `readStage()` (`:99` → `:275`) off `TileStateStore` and `updateStage` writes back (`:208`), so run 2 resumes run 1. `ProfileStorage` is `Pick<Storage,'getItem'|'setItem'|'removeItem'>` (`src/game/ProfileStorage.ts:96`) — three methods. `src/sim/AtomicSocket.ts:63–67` already constructs a null-backed `TileStateStore` for exactly this reason, with the honest comment. **Mirror it.** |
| 5 | **The contract cannot be constructed by the sim, and must not become constructible** | `e9-dome-basin` has `modes: undefined` and is absent from `SUPPORTED_CONTRACTS`, so `HeadlessContractSim.ts:239` hard-throws. `secureWave` is absent too, so the sim would fall back to `Balance.run.secureWave` — i.e. there is **no** crawler-style tick-budget blocker here. That is a temptation, not a permission. |
| 6 | **The E5/E6 sockets prove you can socket without admitting** | `HeadlessContractSim.ts:59–61` states in a comment that E5/E6 "stay out DESPITE their era sockets now running headlessly". Neither epoch declares `modes` and neither is in `SUPPORTED_CONTRACTS`; `e2e/er01-e5-census.spec.ts:130` drives `DeepwaterSocket.create(...)` **directly**, borrowing a real `the-claim` sim for `combat`/`hero`. **This is your template, verbatim.** |
| 7 | **The two remaining gaps, priced** | `src/systems/E9ArsenalSystem.ts` (286 lines) is **also DOM-free** (same probe → zero hits) and is the natural NEXT slice. `src/systems/OldDiggerBossSystem.ts:627` holds `const canvas = document.querySelector('canvas');` — the crawler's coupling-1 shape, curable the same way, but **not here**. |

**Fact 7 is banked for the next author, not scope for you.** One system per slice is why five of these have landed cleanly.

## READ-FIRST

1. `src/sim/DeepwaterSocket.ts` — the whole file. Its header comment is the model for yours: it names the browser tick order it reproduces, names the one step it cannot run, and explains why that step is **counted** rather than dropped.
2. `e2e/er01-e5-census.spec.ts:120–175` — how a socket is driven twice for determinism and how `bossHandoffsRefused` is asserted `> 0`.
3. `src/sim/AtomicSocket.ts:55–85` — the null-backed `TileStateStore` and its comment.
4. `src/systems/E9CanalSystem.ts` — the whole file (466 lines). It is the subject.
5. `src/game/Game.ts:2554`, `:2576`, `:2618` — the browser's real tick order: `oldDiggerBoss.update` → `e9ArsenalSystem.update` → `e9CanalSystem.update(simDelta, timeAlive, visibleHarvestTargets())`. Your header comment must state this order and mark which two steps you refuse.
6. `docs/bench/e9-readiness-census.md` — the row you are narrowing, and F-ER01-E9-1's exact words.

## SCOPE — numbered, each independently testable

1. **Create `src/sim/E9CanalSocket.ts`**, mirroring `DeepwaterSocket`'s shape: a `private constructor`, a `static create(contract, ...)` that returns the socket for `e9-dome-basin` and **`null` for every other contract**, an `advance(...)`/`step(...)` method driving `E9CanalSystem.update`, a `diagnostics` getter, and a `simulationSnapshot` getter that is **stable to `JSON.stringify`** (no floats that drift, no object identity).
   - It owns its own **null-backed `TileStateStore`** per instance (fact 4). A second socket must start at stage 0.
   - It must be **DOM-free** and must not import anything that reaches `document`.
2. **Refuse the siblings, out loud.** The socket must refuse the other three Red Fields contracts the way createDeepwaterClaimTile refuses the variants. `create()` returns `null` for `e9-seed-run`, `e9-devils-alley`, `e9-old-canal` and for a non-E9 control such as `e1-dry-gulch`.
3. **COUNT the two steps you do not run.** The browser ticks the Old Digger boss and the E9 arsenal before the canal (`Game.ts:2554`/`:2576`). Your socket runs neither. Expose a counter for each — e.g. `arsenalStepsRefused`, `bossStepsRefused` — incremented on every tick where the browser would have run them, plus a `refusedConsumers: readonly string[]` naming both systems. **A census must be able to assert the gap exists rather than infer it from an absence** (`DeepwaterSocket.ts` header, F-ER01-E5-1).
4. **Extend `e2e/er01-e9-census.spec.ts` inside the existing per-contract loop.** For `e9-dome-basin` assert, from a driven socket:
   - the stage ladder genuinely advances (an actor held at C1 completes it; `stage` reaches 3 and `canal.wet` flips true),
   - the quarry harvests (`quarry.harvested` grows, gold receipts land with the `e9-canal-quarry-payout-` ids),
   - the dust devil displaces (`dustDevil.shoves > 0` and `pushedDistance > 0` across a storm phase),
   - **determinism**: two independent sockets driven for identical tick counts produce byte-identical `JSON.stringify(simulationSnapshot)`,
   - both refusal counters are **`> 0`**,
   - and for the other three contracts, `create()` returns `null`.
   ⚠️ **Add NO new `test(...)` titles.** Assert inside the loop that already exists, so the suite stays **4 tests per project**.
5. **Narrow F-ER01-E9-1 in `docs/bench/e9-readiness-census.md`** — honestly, and with your measured numbers. The `e9-dome-basin` row stays **NO / DATA-GAP** and the executive summary stays **AGENT-READY: 0 of 4**; what changes is that the canal is no longer listed as un-socketed and the remaining gap is named as exactly two systems, one of them (`E9ArsenalSystem`) measured DOM-free and therefore cheap. **Do not touch the other three rows' arithmetic.**

## THE ONE JUDGEMENT CALL, MADE FOR YOU

⚠️ **Do NOT wire `E9CanalSocket` into `HeadlessContractSim`, and do NOT add `e9-dome-basin` to `SUPPORTED_CONTRACTS`.** `DeepwaterSocket` *is* wired (`HeadlessContractSim.ts:348`), and copying that would look like fidelity — but its wiring is **inert**, because the sim refuses to construct any E5 contract. Adding a second inert branch to the shared sim buys nothing today and puts a `src/sim/HeadlessContractSim.ts` diff (and therefore the `gr-sim` Baron pin) at risk for a slice that has no need of it. The wiring belongs to the admission slice, together with the arsenal and the boss. **If you believe this is wrong, report it as a finding with the measurement — do not act on it.**

## TOUCH-ONLY

- `src/sim/E9CanalSocket.ts` (new)
- `e2e/er01-e9-census.spec.ts`
- `docs/bench/e9-readiness-census.md`

## NO — firewall (violations are worse than an unfinished slice)

1. 🚫 **`src/sim/HeadlessContractSim.ts`** — including `SUPPORTED_CONTRACTS`. See the judgement call above.
2. 🚫 **`src/systems/E9CanalSystem.ts`.** It is already DOM-free with a clean tick seam (facts 1–3). If you find you must edit it, you have found a **finding**, not a task — report it with the line number and stop that edit. The browser is the reference implementation.
3. 🚫 **`src/agent/MechanicsManifest.ts` and any manifest vocabulary.** The census's own cure is "socket ... **and derive their vocabulary** before admission" — two acts. Deriving verbs is the admission slice's job; doing it here would move `mechanics.rules` and make the Verbs column lie about a contract the sim still refuses. ⚠️ Related landmine, banked so you do not chase it: `MechanicsManifest` filters `posting.lossStakes` on `heroStart`, so C1/C2/C3 would **not** surface there anyway and would need their own canal rule.
4. 🚫 **`src/systems/E9ArsenalSystem.ts`, `src/systems/OldDiggerBossSystem.ts`, `assets/contracts/**`.** Count them, do not socket them, do not add `engineDependencies` (the census records that asymmetry deliberately, and `e2e/er01-e9-census.spec.ts:40` asserts the absence).
5. 🚫 **Balance values, other epochs, other censuses.**
6. 🚫 **Inventing operations.** Five prior sockets in this class invented **zero** new BUILD-grammar operations. If the canal seems to need one, stop and report — that is the vocabulary stretch the ERA-SOCKET LAW forbids (Mistake #14).

## KNOWN LANDMINE — do not chase it

`src/world/Terrain.ts` and `src/sim/TileHeight.ts` bind the **active contract at module load**. Your spec borrows a `the-claim` sim for its `combat`/`hero`, so `visualY(...)` inside the canal system samples **the Claim's** terrain, not Dome Basin's. That is harmless here — every assertion in scope 4 is on `x`/`z`, stage counters, receipts and phases, and `visualY` only sets render-side `y` (CLAUDE.md §4.6). **Do not "fix" it by loading two contracts in one process; that is the thing it warns about.** If a `y` value ever appears in `simulationSnapshot`, remove the `y`, not the terrain.

## SELF-CHECK — name the exact evidence in your report

- `npx tsc --noEmit` clean · `npm run build` green.
- **`npm run test:node-guards`** — **MANDATORY**, your diff adds a file under `src/sim/` (F-1460-1). ⚠️ **If the `gr-sim` Baron pin moves, that is a FINDING with a named cause, never a re-pin** (F-1441-3). This slice adds a file nothing imports yet, so the pin **must not move**; if it does, something in scope 1 reached the shared sim.
- `npx playwright test e2e/er01-e9-census.spec.ts --workers=1` — both projects. **Expect 4 passed per project, 8 across desktop+mobile.** *(DERIVED, not optimistic: `redfields.contracts` holds 4 contracts and the file's single `for` loop mints one `test(...)` per contract; scope 4 forbids new test titles, so the count is unchanged from today's 4/4. If you see 5 or 10, you added a test title — go back and fold it into the loop.)*
- **The unmoved-headline proof:** state plainly that `e2e/er01-e9-census.spec.ts:56–59` (the `HeadlessContractSim` **throws** assertion for all four contracts) is still green, unedited.
- Adjacent unmoved: `npx playwright test e2e/er01-e5-census.spec.ts e2e/er01-e6-census.spec.ts e2e/e9-canal-stages.spec.ts --workers=1` — the first two are the sockets you copied, the third is the browser owner of your subject and is the load-bearing proof you changed no game behaviour.
- Zero console/page errors, desktop **and** 390px.
- **Report the two determinism snapshots** (the `JSON.stringify` hash or its first 120 chars for both drives) and **both refusal counts**.
- **State plainly that the headline did NOT move, and what the remaining gap now is** — two named systems, one of them measured DOM-free.

READY-FOR-GATES + report: the socket's public surface, the two determinism hashes, both refusal counters, confirmation that `SUPPORTED_CONTRACTS` and `E9CanalSystem` are untouched, the census wording you changed, and any finding you were told to report rather than repair.
