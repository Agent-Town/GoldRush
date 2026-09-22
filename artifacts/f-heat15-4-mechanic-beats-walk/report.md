# f-heat15-4-mechanic-beats-walk — implementer report

**Slice:** the county ranks a finished Regatta race above any unfinished row (F-HEAT15-4, owner ruling 2026-09-22 (a)).
**Branch:** `fix/f-heat15-4-mechanic-beats-walk`, cut from main at `985e581dc`. **Commits:** `032ed5c33` (implementation + tests), plus this evidence commit.
**Worktree:** `/private/tmp/claude-501/.../scratchpad/wt-h154`. Node 26.4.0, dev server 5306 only, killed at the end. Nothing was sent to the live door: no GET and no POST to `agenttown.app`.

## 1. The ranking rule as implemented

`compareScores` (`functions/api/standings.ts:1459`). The exact comparison order for `e5-regatta`:

| # | key | direction | status |
|---|---|---|---|
| 1 | `secured` | secured first | unchanged |
| 2 | *(the `PRESERVE_CONTRACTS` branch)* | — | **not taken** — `e5-regatta` declares no `twist.preserve`; that branch and its set are untouched |
| 3 | **`mechanic.complete === true`** | **finished first** | **NEW**, `:1467` |
| 4 | `waves` | more first | unchanged |
| 5 | `gold` | more first | unchanged |
| 6 | `timeAlive` | faster first for a secured row, longer first for an unsecured one | unchanged |
| 7 | `submittedAt` | earlier first | unchanged |

`finishedMechanic` (`:1453`) reads `row.mechanic?.complete === true`, so **absent and `false` are the same answer**. That is the ruling rather than an oversight: a row assayed before this landed carries no `mechanic` and ranks below one that finished the race — the owner chose (a) knowing that.

`decidingKey` (`:1478`) answers `'mechanic'` for decision 3 (`:1482`). `src/ui/DeathOverlay.ts:292` already answers an unknown key with "The row above holds the next tiebreak", so the score screen stays honest without being touched.

Every other contract takes a byte-identical path: the new clause is guarded by `MECHANIC_CONTRACTS.has(contractId)`, and the guard test compares the comparator's **return value** (not just the order) with and without the field present, over `the-claim`, `e1-baron`, `e10-last-claim` and no-contract.

## 2. Where the mechanic table lives

`src/sim/HeadlessContractSim.ts:3622` — `private static readonly MECHANIC_OUTCOMES`, one row today:

```
['e5-regatta', { id: 'regatta-race', complete: (sim) => sim.regattaDiagnostics()?.race.finished === true }]
```

It is a **private static member of the class** rather than a module-level const because `regattaDiagnostics()` is private and must stay so; a static initializer is inside the class body and may read it. `mechanicOutcome()` (`:3636`) is the public accessor; `mechanicContractIds()` (`:3627`) exposes only the keys, for the door mirror. `export type MechanicOutcome` at `:3643`.

**Placement is deliberate:** appended at the *tail* of the class, not beside `regattaDiagnostics()` where it reads. This file is cited by line from 23 places in code and ~1300 in the ledgers, and every one of those coordinates points above `:2087`; appending at the tail moves **none** of them, including `HeadlessContractSim.ts:1536` — the `race.finished` secure gate the review and this master both cite. The comment at the site says so.

The door mirrors the **keys** as `MECHANIC_CONTRACTS` (`functions/api/standings.ts:165`), hand-written because the worker cannot import the engine. `scripts/skillmd-guard.test.mjs:63` pins the two lists equal by extracting the literal from the door source and comparing it with `HeadlessContractSim.mechanicContractIds()` — the same shape as the existing door-contracts pin.

## 3. The path, end to end

1. `AgentTapeReplaySession.result()` (`src/replay/AgentTapeReplay.ts:200`) reads `sim.mechanicOutcome()` once, at the end of the replay, off terminal state the determinism hash already certifies. `AgentTapeReplayResult.mechanic?` at `:25`.
2. `scripts/assay-replay.mjs` spreads the replay result for the **agent arm** (`{ ...replay, wallMs }`), so the field crosses the process boundary with no edit there. (See finding F-H154-1 below for the browser arm.)
3. `scripts/assay-worker.mjs` — `validMechanic` (`:92`); a present-but-malformed mechanic throws inside the attempt loop (`:134`), so it is retried and then `unassayable`, never posted; the payload carries it only on `verified` (`:166`).
4. `functions/api/standings.ts` — `ASSAY_VERDICT_KEYS` accepts `mechanic` (`:220`); `validateMechanicOutcome` (`:1405`) refuses anything but `{ id: 1..64 chars, complete: boolean }`; the verdict path clears it and re-sets it only on a **surviving** `verified` for a `MECHANIC_CONTRACTS` contract (`:393-394`) — a gold-mismatch demotion to `rejected` therefore takes the flag with it; the re-assay verb clears it beside `securedSnapshot` (`:513`); `validateStoredRow` parses it (`:1156`) and **strips rather than drops** a well-formed-but-misplaced one (`:1157`, retention law — destroying an honest standing to unpublish a flag is the F-HEAT14-6 mistake); `boardRow` publishes it (`:750`).
5. `SCORE_KEYS` and `POST_KEYS` are unchanged, so a rider can never declare it.

## 4. Tests added (file:line)

| where | what |
|---|---|
| `scripts/test-standings.mjs:192` (`checkMechanicRanking`, wired at `:56`) | (a) a verified Regatta reel with `mechanic.complete` outranks a standing row with **more waves, more gold and an earlier date**; (b) two finished rows fall through waves -> gold -> time -> `submittedAt` unchanged (four sorts); (c) every other contract's comparator return value is identical with and without the field, both sides, 3 pair shapes x 4 contracts; (d) only a surviving `verified` stores it — and the full sweep round trip: verify -> stored, reassay -> cleared + pending, re-verdict `rejected` -> still none; (e) 7 malformed shapes refused 400, plus `rejected`+mechanic refused 400, with the row unmoved; (f) a rider POST carrying `mechanic` (payload **and** inside `score`) refused 400 and no board written |
| `scripts/assay-worker.test.mjs:135` | the verified payload carries the replay's mechanic (`complete: true` and `complete: false`), a rejected verdict carries none, a contract with no mechanic posts none |
| `scripts/assay-worker.test.mjs:152` | a malformed mechanic is retried like any instrument failure and ends `unassayable`, never on the wire |
| `scripts/assay-replay.test.mjs:236` | **the finding's own reel** — heat 15 ride 2 (`artifacts/gauntlet-heat15-cd24d12d/rides/r2/submission.json`, the tape the county verified as `fnv1a32:b92da1bf`) replays through `assay-replay.mjs` to its own hash with `mechanic: { id: 'regatta-race', complete: true }` |
| `scripts/assay-replay.test.mjs:259` | the table's other two answers at the source: a booted `e5-regatta` before anyone boards -> `complete: false`; `the-claim` -> `null`; `mechanicContractIds()` -> `['e5-regatta']` |
| `scripts/assay-replay.test.mjs:170` | the existing door-tape test now also asserts a `the-claim` reel replays with **no** `mechanic` |
| `scripts/skillmd-guard.test.mjs:54` | the door document's mechanic-first sentence is pinned |
| `scripts/skillmd-guard.test.mjs:63` | the door's `MECHANIC_CONTRACTS` equals the engine's table keys |

`e2e/e5-regatta-boat.spec.ts:196` (the pinned tape hash) is unedited and green in both projects — the hash did not move.

## 5. The door-document sentence

`public/skill.md:515`, a new paragraph immediately after the `COUNTY_STANDING_RULE` paragraph (which is byte-identical — it is pinned to appear exactly once by `scripts/standing-rule-surfaces.test.mjs` and is the shared string in `site/standing-rule.js`, a file outside this firewall):

> The Regatta ranks the mechanic first: on `e5-regatta` a row whose race the county's own replay finished outranks any row it did not, ahead of waves, gold, and time, and a row carrying no finish ranks below one that does. The finish is never declared; the assay reads it from your reel and publishes it as `mechanic` on the board row.

No guard fence was hand-edited; the sentence is pinned as a law constant in the guard (`REGATTA_MECHANIC_RANKING_LAW`), the same mechanism as `E10_PRESERVE_RANKING_LAW`.

The `regatta_boat` manifest rule gains one sentence (`src/agent/MechanicsManifest.ts:636`):
`boardRanking: 'the county ranks a finished race above any unfinished row on this board'`.

No new `now` field; the view schema did not move (`view-schema-guard` green); `node scripts/same-game-audit.mjs` rc=0 with the Regatta rows unchanged and no report diff.

## 6. The re-assay path (item 6, read only)

**Answer: yes — a re-queued row is re-assayed through exactly the same worker path, so a standing heat-15 row would gain `mechanic` on re-assay.** Two conditions, both nameable, and one field the sweep rewrites.

The chain (`scripts/assay-lineage-sweep.mjs`): the sweep only ever calls `POST /api/standings/reassay` with `{ epochId, contractId, reason }` (`:80-84`). That endpoint (`functions/api/standings.ts:474`) flips each verified row back to `assay: 'pending'` with a lineage mark, and `syncAssayBoardIndex` re-indexes it; the ordinary `assay-queue` -> `assay-worker` -> `assay-verdict` path then replays the reel and posts a fresh verdict. Nothing about that path is special-cased for lineage rows, so a `verified` verdict on a re-queued Regatta reel now carries and stores `mechanic` exactly as a first assay would. The battery proves the whole round trip end to end in `checkMechanicRanking` step (d).

**The sweep's re-queue does rewrite fields — none that this ruling needs, and the rewrites are deliberate:**
- it **deletes `securedSnapshot`** and **restores the row's score from `tape.outcome`** (`:493-505`), so the replay is judged against the reel's own declaration rather than an older snapshot meaning. Harmless here; the replay re-derives both.
- it **deletes `assayReason`** and sets `lineage`.
- I added **`delete row.mechanic`** in the same loop (`:513`). Without it a re-queued row would keep a flag its current verification no longer supports, and `validateStoredRow` would have to strip it on every read. The flag is re-earned by the replay.
- `submittedAt` — the first-secure date — is untouched by construction, so a re-assayed heat-14 or heat-15 row keeps the day it earned.

**Condition 1 — the sweep must consider the rows stale at all.** `compositionPin(contractId)` (`:120`) returns the latest `assets/engine-era.json` pin whose `cause` text *names the contract id*, and a row is swept only when its reel's recorded `engineHash` has an **earlier** pin ordinal (`:64`). This slice edits `src/sim/HeadlessContractSim.ts`, which is in `ENGINE_SOURCE_INPUTS`, so the engine hash moves and the drain mints a pin: **if that pin's `cause` does not contain the string `e5-regatta`, the sweep finds 0 stale rows and calls nothing.** That is a drain-side act, not mine — worth writing into the pin cause explicitly.

**Condition 2 — an unknown pin is never swept** (`:61-64`, by design). A reel whose recorded hash the registry has never seen is skipped rather than guessed at. Heat 15's ride 3 is exactly such a reel (`53f680fe`, F-HEAT15-1) and was refused at the door anyway, so it holds no row; rides 1 and 2 recorded `52a84bc2...`, which the era registry does know.

**Condition 3 — deploy order.** The door must be deployed before the worker posts a `mechanic`, or the verdict is refused 400 `bad_verdict` by `hasOnlyKeys` on the old `ASSAY_VERDICT_KEYS` (the whole verdict, not just the field). Door first, then worker, then the sweep.

## 7. Findings

- **F-H154-1 (P2, for the drain — firewalled out of this slice).** `scripts/assay-replay.mjs`'s **browser** arm builds its result object field by field (`:88-105`) and therefore drops `mechanic`; only the agent arm spreads the replay result. `e5-regatta` is browser-offered (`same-game-audit` "Final derived door"), so a human's browser-recorded Regatta reel would verify without a finish and rank below an agent reel that has one — the mirror image of the defect this slice cures. The file is not in this master's Touch-ONLY list, so it is reported rather than fixed. The cure is one spread or one field.
- **F-H154-2 (informational).** No banked Regatta reel can supply the `complete: false` replay arm and the reason is structural, not effort: the Regatta's secure is gated on `race.finished`, only a secured run is submittable, so every Regatta reel on disk finished its race. The `false` arm is therefore asserted at the source (a booted sim), which is why `assay-replay.test.mjs:259` exists.
- **F-H154-3 (informational).** The verdict slip (`?verdict=<reel id>`) does **not** publish `mechanic`. The master scoped exposure to "the public row where `preserveWavesAlive` is", which is `boardRow`; the slip is a one-line follow-up if the owner wants a rider to read its own finish after an assay.

## 8. Self-check evidence

| gate | result | transcript |
|---|---|---|
| `npx tsc --noEmit` | rc=0 | run inline (also inside `npm run build`) |
| `npm run build` | rc=0 | `build.log` (pre-flight: `preflight-build.log`) |
| `npm run test:stats` — test-stats / test-standings / test-ledger-worker | rc=0 - 87 - **372 kv + 372 sqlite** - 26 | `test-stats.log`, `test-standings.log`, `test-ledger-worker.log` |
| `npm run test:accounts` | rc=0 - 43 kv + 43 sqlite | `test-accounts.log` |
| `npm run test:mp` | rc=0 - 466 | `test-mp.log` |
| `GR_GUARD_NO_ARTIFACT=1 node --test assay-worker / assay-replay / skillmd-guard / same-game-audit / view-schema-guard` | rc=0 - **48 pass, 0 fail** | `node-guards-five.log` |
| `e2e/e5-regatta-boat.spec.ts` `--workers=1` both projects | **6 passed** (1.6m), incl. `:196` pinned hash; no F-RB2-6 flake seen | `e2e-regatta-boat.log` |
| `e2e/agent-view.spec.ts` `--workers=1` both projects | **10 passed** (22.4s) | `e2e-agent-view.log` |
| `e2e/er01-e5-census.spec.ts` (adjacent: the `regatta_boat` rule's consumer) | **10 passed** (19.2s) | `e2e-er01-e5-census.log` |
| plain boot, zero console/page errors at 1280 and 390 | **CLEAN** — landing, `the-claim`, `e5-regatta` at both widths, 6 screenshots | `plain-boot.log`, `plain-boot-*.png`, probe source `plain-boot-probe.mjs` |
| `node scripts/same-game-audit.mjs` | rc=0, no report diff, Regatta rows unchanged | `same-game-audit.log` |

Running the suites rewrote nine tracked evidence files outside this master's firewall (`artifacts/e5-regatta-boat*`, `artifacts/accounts-worker`, `artifacts/multiplayer-relay` — timing-variable screenshots and course JSON). They were restored with `git checkout --` so the tree carries only this slice; nothing in them concerns this change.

## 9. Adapted from the master, and why

1. **Exposure site.** The master says "exposed in the public row where `preserveWavesAlive` is (~:710, :823, :1085)". Implemented in `boardRow` only. `:823` is inside `showing()`'s **`score`** sub-object and `:1085`/`scoreOf` are score parse/copy sites — a `mechanic` is explicitly *not* a score (it is outside `SCORE_KEYS` so a rider cannot declare it), and putting it inside a `score` object would say the opposite. `boardRow` is the public county row.
2. **Table shape.** The master allows a table "beside the sim or in `src/agent/` — one file". It is one table in `HeadlessContractSim.ts`, but a **private static class member** rather than a module-level const: `regattaDiagnostics()` is private, and a module-level const cannot read it without widening that surface. Keys are exposed for the door mirror through `mechanicContractIds()`.
3. **Table position.** At the tail of the class rather than beside `regattaDiagnostics()`, to avoid rotting ~1300 cited coordinates including the `:1536` this master itself cites. Stated in a comment at the site.
4. **Stored-row validation.** A well-formed mechanic in an unlawful place is **stripped**, not treated as a reason to drop the row; only a structurally malformed one refuses the row (matching `securedSnapshot`). Retention law + the F-HEAT14-6 deletion history.
5. **Guard file.** The skill.md law pin and the engine/door mirror pin live in `scripts/skillmd-guard.test.mjs`, which the master reaches through "public/skill.md through its guard". That file already loads both the standings source text and the sim module, so both pins cost nothing extra.
6. **Two extra tests beyond the named six** — the worker's malformed-mechanic arm and the sim-level table test — added because the `complete: false` and `null` answers are otherwise never executed anywhere.
7. **One extra adjacent suite** (`er01-e5-census`) run beyond the self-check list, because it is the direct consumer of the `regatta_boat` rule I edited.
