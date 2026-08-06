# E6 READINESS CENSUS — Atomic before the owner's ride

Re-measured 2026-08-06 (`milk/twin-sockets`) after the Atomic era socket landed. The 2026-08-05 pass measured four contracts that could not boot; this pass measures four contracts that boot, run, and terminate — and it moves the blocker off the consumer and onto the agent's verb list. Training/drill maps are excluded by the ratified ER-01 default. The naive arm uses GR-SIM's default Trail balance with `--policy=idle` on the repo-pinned Node 26.4.0. Exact hashes are diagnostic evidence, not permanent balance pins.

## WHAT CHANGED SINCE 2026-08-05

`src/sim/AtomicSocket.ts` runs `WrangleSystem` — the epoch-wide consumer (`Game.ts:646` gates it on `contractEpoch?.id === 'epoch-6-atomic'`, which is why one absence blocked all four contracts) — headlessly, in the browser's tick order (`decay.tick → actors → e6TileConsumers → waveSystem → wrangle`), with all three of the browser's behavioural couplings: `CombatSystem.onEnemyDamaged` (`Game.ts:534`), the contact gate (`Game.ts:2606`), and the movement multiplier (`Game.ts:2614`). `E6TileConsumerSystem` is socketed alongside it for Glow Mesa. The manifest gained four consumer-derived wrangle rules on every Atomic contract, plus decay-field and night-vein rules on Glow Mesa.

**The socket works, and admitting on the strength of it would have been wrong.** See F-ER01-E6-5.

## EXECUTIVE SUMMARY

- **AGENT-READY: 0 of 4.** Unchanged as a count — but the reason is now a different, smaller, and much better-located thing.
- **DATA-GAP: 1 of 4.** Only `e6-picnic` still fails on its own data (three declared stakes, one implemented hold). Showroom and Half-Life Hollow no longer have a missing consumer at all.
- **BLOCKED-ON-AGENT-SURFACE: 4 of 4** — the new, dominant verdict. `WrangleSystem` now runs, and running it proves the Atomic loop cannot be closed by an agent: `AgentGameAdapter` has no capture verb, an exhausted machine can be neither damaged nor captured, and it still occupies a spawn slot.
- **BROKEN: 0.** All four load, accept all seven standing-order grammar forms, terminate deterministically, and emit no captured console warning/error.
- Determinism is now REAL for three of four: every measured run reproduced its `eventLogHash` byte-for-byte on a second run. It is not a bench pin, because none of these contracts is admitted.
- `e6-glow-mesa` cannot terminate at all: it declares a `homemaker_9000` baron at wave 8, `RunManager.autoSecureWaveForRun` withholds securing until that baron is beaten, and `HomemakerBossSystem` is not socketed — so the run overruns its own wave ceiling.
- ~~Every contract omits `tileParams.engineDependencies`, so none declares the missing era socket required by ER-01.~~ **✅ CURED 2026-08-06 (milk/saga-surgeon, `112ea5793`) — all four contracts now declare their missing era socket. Original sentence struck in place, retained verbatim above.** Their derived manifests still expose zero interactables and only generic `build_zones` plus Glow Mesa's generic `baron` rule. ~~The missing declarations are recorded, not repaired in this census.~~ **The deferral is discharged: the declarations were repaired by a later shift, not by this census.**
- ⚠️ **WHY NOTHING CAUGHT THIS (F-MILK-SS-1, below): the mandate's enforcement denominator is narrower than the mandate's prose.** `validateEngineDependencies` raises `engine_dependency_required` only when a `DECLARED_INERT_PATHS` entry is present, and every one of those paths is a **data** key (`tarSeams`, `convoyRoute`, `wildDerricks`, …). The Atomic gap is a missing **system** plus prose-only crossings, which carries no data path — so the guard could never fire here. Measured across e3/e4: **5 of the 6** compliant contracts were guard-forced; `e3-canyon-works` declares with **zero** inert keys, i.e. voluntarily. Compliance elsewhere was an accident of the denominator, not the guard working.

## CENSUS

Measured with both sockets live. Seeds are the two pinned in `bench-seeds.json`. "Repeat" is a second full run of the same seed.

| Contract | Admitted? | Boots? | Verbs? | Determinism? | Naive Trail outcome | Verdict + reason |
|---|---|---|---|---|---|---|
| `e6-glow-mesa` | **NO** — support gate rejects it | **YES** — wrangle + `E6TileConsumerSystem` both run headlessly | **FAIL** — 7/7 generic forms respond; wrangle, decay-field and night-vein vocabulary now derived, but no capture operation exists | **UNMEASURABLE** — the run never terminates | `01` and `02` both **overran the ceiling**: wave 15 > ceiling 14 (`secureWave` 12 + 2) | **BLOCKED — no reachable secure condition.** Its `homemaker_9000` baron gates securing and `HomemakerBossSystem` is unsocketed. Admitting it would pin a contract that provably cannot end |
| `e6-showroom` | **NO** — support gate rejects it | **YES** — wrangle runs; 60 exhaustion events per run | **FAIL** — wrangle vocabulary derived, but `tryCapture` has no agent verb | **YES** — `01` `fnv1a32:27f4b15e`, `02` `fnv1a32:84bc5a65`, both repeat IDENTICAL | `01` **secured**, wave 20, 82 kills; `02` **secured**, wave 20, 81 kills | **BLOCKED-ON-AGENT-SURFACE** — the secure is a false green (F-ER01-E6-5): from wave 6 all 60 living enemies are exhausted machines and no wave spawns again |
| `e6-half-life-hollow` | **NO** — support gate rejects it | **YES** — wrangle runs | **FAIL** — as Showroom, and its briefing's crossing claim is still unexpressed | **YES** — `01` `fnv1a32:ee30fe50`, `02` `fnv1a32:c4007b5b`, both repeat IDENTICAL | `01` **died**, wave 4, 63 kills; `02` **died**, wave 4, 64 kills | **BLOCKED-ON-AGENT-SURFACE + unreconciled claim** — wrangle is no longer the blocker; the unconsumed `hollow-extraction` stake is (F-ER01-E6-3) |
| `e6-picnic` | **NO** — support gate rejects it | **YES** — wrangle runs | **FAIL** — as Showroom; no three-stake hold semantics | **YES** — `01` `fnv1a32:fbc12243`, `02` `fnv1a32:a38ab6e9`, both repeat IDENTICAL | `01` **died**, wave 5, 79 kills; `02` **died**, wave 4, 59 kills | **DATA-GAP + BLOCKED-ON-AGENT-SURFACE** — three `heroStart` markers, one consumed; the objective is an owner design fork |

## FINDINGS

### F-ER01-E6-5 — Socketing wrangle proved the blocker is the agent's verb list, not the consumer (NEW)

This is the finding the socket was built to expose, and it inverts the previous four.

With `WrangleSystem` live, an exhausted machine is simultaneously **undamageable** (`CombatSystem.canDamageEnemy` is `!wrangle.isHarmless`, `Game.ts:536`) and **harmless** (`Game.ts:2606`), and it stays on the board. The browser drains that pool through a capture ceremony — a keybind at `Game.ts:7704` and a dev bridge at `Game.ts:1834`. `AgentGameAdapter` (`src/agent/ToolSurface.ts:82`) carries `placeBuilding`, `panAt`, `repair`, `chaseMark`, `collectXp`, `collectGold` — **and no capture verb.** An agent therefore cannot clear a single exhausted machine.

Measured on `e6-showroom-01`, per wave (`alive` / `exhausted`, cap 96):

| wave | 1 | 2 | 3 | 4 | 5 | 6 | 7 … 20 |
|---|---|---|---|---|---|---|---|
| alive | 7 | 9 | 19 | 33 | 52 | 60 | 60 (flat) |
| exhausted | 0 | 1 | 9 | 21 | 38 | 57 | 58 → 60 |

From wave 6 the board holds 60 living enemies of which 60 are exhausted. `Balance.waves.aliveCap` is **60**, and `WaveSystem.ts:536` and `:579` both refuse to spawn once `aliveCap - activeCount <= 0`. So no wave spawns from wave 6 onward, and the contract "secures" at wave 20 having faced nothing for fourteen waves.

**That `secured: true` is a false green**, which is why no Atomic contract was admitted despite three of four now being deterministic. Admission would have pinned a determinism hash on a deadlock and reported it as playability.

The cure is a capture operation on the agent surface. `src/agent/ToolSurface.ts` is outside this shift's firewall, and adding a verb to the agent grammar is a governed-surface decision, so this is filed rather than fixed.

### F-ER01-E6-1 — Glow Mesa's remaining blocker is one boss system, and it now stops the run

Superseded in part: `E6TileConsumerSystem` (timed decay-field walkability, the six night veins) is socketed and running, and its vocabulary is derived. What remains is `HomemakerBossSystem`. Its `homemaker_9000` baron is declared at wave 8; `RunManager.autoSecureWaveForRun` returns `Number.MAX_SAFE_INTEGER` while a declared baron is unbeaten; the generic `WaveSystem` cannot produce that boss. Measured consequence: both seeds run past `secureWave` 12 to wave 15 and abort on GR-SIM's ceiling. The fix master must socket that boss; the census must never accept the generic `WaveSystem` boss in its place.

> 🗄️ **RETAINED — the pre-socket text of F-ER01-E6-1, plus `milk/saga-surgeon`'s declaration cure.** Both were
> written before the Atomic socket existed and are superseded as a *measurement* by the body above; the
> declaration cure they record is **still live and still true** (all four Atomic contracts declare their
> missing era socket). Kept because a census that deletes its own history cannot show its work.
>
> Glow Mesa's live run composes `E6TileConsumerSystem` for timed decay-field walkability and six night veins, enables `WrangleSystem` for machine wind-down/capture, and replaces the generic component-boss path with `HomemakerBossSystem`; its derived manifest nevertheless contains only `baron` and `build_zones`, declares no interactables, and carries no `engineDependencies`. The attended fix master must socket those production consumers into the headless view/action/event model and derive their vocabulary before admission; ER-01 must not substitute the generic WaveSystem boss and call the contract covered.
> **🟡 NARROWED 2026-08-06 — the DECLARATION half is cured; the SOCKET half is untouched. Original finding retained verbatim above.** `e6-glow-mesa` now declares `glow-mesa-contract-consumers status:missing`, naming the decay-field, six-vein night-harvest, wrangle, and Homemaker boss consumers. The contract stays **DATA-GAP** and stays rejected by the support gate — a declaration is honesty, not admission. What remains is exactly the socket work the original text demands.

### F-ER01-E6-2 — Showroom's wrangle loop is now visible to agents, and still unusable by them

Closed in part and reopened smaller. The manifest now carries `wrangle_wind_down`, `wrangle_exhausted` and `wrangle_pen`, all derived from `WrangleSystem` rather than from the roster, plus `wrangle_capture_unreachable` naming what an agent still cannot do. Showroom declares nothing its consumers do not read — no stake markers, three build zones, six harvest anchors, all consumed — so it is the cleanest of the four and will be the first admissible Atomic contract the moment F-ER01-E6-5 is cured.

> 🗄️ **RETAINED — the pre-socket text of F-ER01-E6-2, plus `milk/saga-surgeon`'s declaration cure.** Both were
> written before the Atomic socket existed and are superseded as a *measurement* by the body above; the
> declaration cure they record is **still live and still true** (all four Atomic contracts declare their
> missing era socket). Kept because a census that deletes its own history cannot show its work.
>
> Showroom's Atomic boot enables `WrangleSystem`, and its roster includes both `feral_toaster` and `lawn_shepherd`, but the manifest exposes only `build_zones` and the agent grammar has no capture operation; `engineDependencies` is absent rather than declaring the gap. The attended fix master must add the shared Atomic wrangle socket and consumer-derived vocabulary, then re-run the census to decide whether the remaining quiet model-home rules are deliberate scenery or still-missing mechanics.
> **🟡 NARROWED 2026-08-06 — the DECLARATION half is cured; the SOCKET half is untouched. Original finding retained verbatim above.** `e6-showroom` now declares `atomic-wrangle-consumer status:missing`. This is the **shared epoch-wide** gap named alone, following the `e8-mare-claim` / `atmosphere-wall-consumer` precedent: Showroom's only missing consumer is the wrangle loop, so it names that and nothing else. The contract stays **DATA-GAP** and stays rejected. The open question the original text raises — whether the quiet model-home rules are scenery or missing mechanics — is **not** answered here and remains for the socket master.

### F-ER01-E6-3 — Half-Life Hollow's crossing claim outlived its consumer gap

The wrangle half of this finding is closed. What remains is the contract's own data: `tileParams.stakeMarkers` holds one marker, `hollow-extraction`, with `heroStart: false`, and **nothing reads a non-`heroStart` stake**. The briefing promises "two glow bridges flank one central causeway", "west and east shelves divide the middle crossing", and "the north extraction stake stands beyond the causeway"; `tileParams` carries `ford: false`, no `fords`, and a `heightfield` of `id`/`mode` only. So the crossing is terrain scenery and the extraction stake is inert data. Reconciling it needs a contract-JSON edit (`assets/contracts/epoch-6-atomic/contracts.json`), which is outside this shift's firewall.

> 🗄️ **RETAINED — the pre-socket text of F-ER01-E6-3, plus `milk/saga-surgeon`'s declaration cure.** Both were
> written before the Atomic socket existed and are superseded as a *measurement* by the body above; the
> declaration cure they record is **still live and still true** (all four Atomic contracts declare their
> missing era socket). Kept because a census that deletes its own history cannot show its work.
>
> Half-Life Hollow enables the same browser-only wrangle loop while its briefing promises two glow bridges, a causeway, and shelf crossings; the derived manifest reports only `build_zones`, no interactable or crossing rule, and no `engineDependencies`. The attended fix master must first land the shared wrangle socket, then reconcile the crossing claim with a real consumed declaration or an honest missing dependency before this contract can become a deterministic headless contract.
> **🟡 NARROWED 2026-08-06 — the original text offered two remedies for the crossing claim; THIS SLICE TOOK THE SECOND ONE. Original finding retained verbatim above.** `e6-half-life-hollow` now declares `half-life-hollow-contract-consumers status:missing`, naming the wrangle consumer plus a crossing consumer for the two glow bridges, the central causeway, and the west/east shelves. **Measured, not inferred:** the contract's `tileParams` keys are `tileId, biome, size, dimensions, render, river, ford, buildZones, stakeMarkers, waterSources, harvestAnchors, heightfield, lanes` — there is no `glowBridges`, no `causeway`, no `shelves`, and `harvestAnchors` is empty. The promised crossings exist **in briefing prose alone**, with no data for any consumer to read. That is why the honest-missing-dependency remedy was the available one: a "real consumed declaration" would first require authoring the crossing data itself, which is contract design, not a declaration fix. The contract stays **DATA-GAP** and stays rejected.

### F-ER01-E6-4 — Picnic's three stakes still collapse to one start marker

Unchanged and re-verified. `stakeMarkers` declares `sandwich-west`, `sandwich-center` and `sandwich-east`, all `heroStart: true`; `HeadlessContractSim` takes `stakeMarkers.find((marker) => marker.heroStart)` — the first — and the browser's `Game.contractHeroStart` does the same. The derived manifest still posts three loss stakes. Deciding what the three-stake objective *is* remains an owner design fork, and it is the only Atomic contract whose own data still disagrees with its consumers.

> 🗄️ **RETAINED — the pre-socket text of F-ER01-E6-4, plus `milk/saga-surgeon`'s declaration cure.** Both were
> written before the Atomic socket existed and are superseded as a *measurement* by the body above; the
> declaration cure they record is **still live and still true** (all four Atomic contracts declare their
> missing era socket). Kept because a census that deletes its own history cannot show its work.
>
> Picnic's manifest lists all three `heroStart` markers as loss stakes, but both `Game.contractHeroStart` and `HeadlessContractSim` select only the first marker and neither implements a three-stake hold objective; the browser-only Atomic wrangle loop is also absent from the manifest and headless sim, with no `engineDependencies` declaration. The attended fix master must decide and encode the actual three-stake objective, derive its agent-visible action/posting semantics, and reuse the shared wrangle socket before admission rather than blessing a generic one-stake hold-out.
> **🟡 NARROWED 2026-08-06 — the DECLARATION half is cured; the OBJECTIVE DECISION is untouched, deliberately. Original finding retained verbatim above.** `e6-picnic` now declares `picnic-contract-consumers status:missing`, naming the wrangle consumer plus a three-stake hold objective consumer. The finding's central demand — "**decide and encode** the actual three-stake objective" — is a **design decision, not a data repair**, and this slice does not make it. The briefing's own countable claim is consistent with the data (`Three sandwich stakes mark the meadow` vs `stakeMarkers` length **3**), so there is no content defect to cure here; the defect is that the consumers implement one hold, not three. The contract stays **DATA-GAP** and stays rejected.

### F-MILK-SS-1 — The `engineDependencies` mandate's enforcement denominator excludes every real violation

**STUB — the cure is outside this shift's TOUCH-ONLY (`src/meta/ContractFamilies.ts` is sim/meta code). Filed, not driven by.**

The mandate reads (`specs/agent-play/README.md:159`): *"any tileParams key without a registered consumer MUST carry `engineDependencies[{dep, status:"missing"}]` — self-declared honesty, assayer-enforced."* The enforcement is `validateEngineDependencies` (`src/meta/ContractFamilies.ts:1694`), which raises `engine_dependency_required` **only when a `DECLARED_INERT_PATHS` entry is present** (`:1560`, `:1713`). Every one of those ~40 paths is a **data** key — `tarSeams`, `roadCorridors`, `convoyRoute`, `wildDerricks`, `salvageHulks`, `raceCourse`, `twist.fairground.crowdFlocks`, …

A contract whose gap is a **missing system** rather than unconsumed data carries no such key, so the guard cannot fire on it. Measured over the whole authored fleet (42 board contracts, 2026-08-06):

| | count | note |
|---|---|---|
| Declaring `engineDependencies` | **31** | 27 before this slice |
| Not declaring | **11** | **all 11 carry zero `DECLARED_INERT_PATHS` keys** |
| — of those, legitimately absent | 7 | `the-claim`, the four E1 contracts, `e3-blackout-ridge`, `e3-moth-season` — shipped or AGENT-READY, nothing missing to declare |
| — of those, genuine violations | 4 | `e5-deepwater-claim`, `e7-relay-valley`, `e9-dome-basin`, `e10-ember-shore` — each named by its own census as owing the declaration |

**The guard has never fired on a real violation and structurally cannot.** Compliance among the contracts that do declare is mostly an accident of the denominator: of the six compliant e3/e4 contracts, **five** carry inert data keys that forced the declaration, and only **`e3-canyon-works` declares voluntarily with zero inert keys** — which is also the precedent proving a system-gap declaration is accepted by the validator.

Recommended cure for the attended master: widen enforcement from "a declared-inert **data path** is present" to something that can see a missing **consumer** — e.g. require a declaration whenever a contract is absent from `SUPPORTED_CONTRACTS` while its epoch has a browser-only system, or make the per-epoch census guard assert the declaration (the pattern `e2e/er01-e8-census.spec.ts:32` and this census's spec now use). Note the narrower-than-prose scope hazard: the mandate's prose covers "any tileParams key", so mechanising it literally would demand a consumer registry that does not exist yet.

### F-MILK-SS-2 — Four contracts outside this shift's scope still owe the same declaration

**STUB — out of TOUCH-ONLY (this shift is e3/e4/e6 only; epoch-5 is explicitly another shift's).**

`e5-deepwater-claim`, `e7-relay-valley`, `e9-dome-basin`, and `e10-ember-shore` each have a named missing consumer and no `engineDependencies` entry, and each of their censuses already says so in prose (`e5:26`, `e7:10`, `e9:13`, `e10:10`). E9's census states the position explicitly — *"ER-01 records that asymmetry rather than editing contract content"* — so the deferral is uniform across the fleet, not an oversight in any one census. The cure is the same four-line content edit applied here, and is cheap; it needs a master scoped to those epochs' contract bundles plus their census specs (each of which currently pins the absence or its inverse).
