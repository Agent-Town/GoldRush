# E5 READINESS CENSUS — Deepwater before the owner's ride

> ## 🩺 RE-MEASURED 2026-08-06 — `milk/deepwater-surgery`. **BROKEN is now 0 of 4.**
>
> Two content defects this census named are **CURED at the mechanism it named**, content-only, with
> **zero sim change**: the Regatta's six-vs-five beacon contradiction, and the Deepwater Claim's
> missing dependency declaration. Both cures are pinned by new asserts in `e2e/er01-e5-census.spec.ts`,
> **each proven by manufacturing the old defect and watching the spec go red** (arms below).
>
> **Admission is UNMOVED at 0 of 4, and that is the correct answer, not a shortfall.** Every remaining
> blocker needs a *headless consumer* — `SUPPORTED_CONTRACTS` in `src/sim/HeadlessContractSim.ts` — which
> is sim code, out of this shift's firewall. Per reject-don't-stretch the shift STOPPED at that line
> rather than admitting a contract the engine cannot run. See **F-ER01-E5-5** for the socket-shape stub.
>
> **All eight forced-diagnostic hashes below reproduced to the digit** on the re-run, each on its own
> determinism pair — which is the evidence that these cures are behaviour-neutral. The old verdicts are
> retained verbatim below, bannered, never deleted.
>
> ⚠️ **PREMISE CORRECTION.** The shift order said this census marks *two* contracts BROKEN. It marked
> **one** (`e5-regatta`); `e5-deepwater-claim` was **DATA-GAP**, carrying the undeclared-dependency
> defect as prose inside F-ER01-E5-1. Both were cured anyway, so the order's intent is met — but the
> count it asserted was wrong, and a later reader must not inherit it.


> ## 🔌 RE-MEASURED AGAIN 2026-08-06 — `milk/twin-sockets`. **THE DEEPWATER SOCKET IS BUILT.**
>
> Merged s1498 on top of the `milk/deepwater-surgery` banner above. **Both passes are 2026-08-06 and both are
> retained**: the surgery pass cured two CONTENT defects, this pass built the SIM SOCKET. They are disjoint in
> substance and they agree on every number they share — **with one exception, resolved in favour of the surgery**
> **pass because it is strictly newer.** `milk/twin-sockets` was authored against a base where the Regatta
> briefing still promised six beacon gates, so its own rows below read **BROKEN: 1 of 4**. That defect was cured
> at `7bfd62ee` before this branch merged. ➡️ **BROKEN IS 0 of 4.** Every twin-sockets sentence asserting
> otherwise is struck in place below, never deleted — F-1497-1: a review’s claims about a shared document are
> perishable, and draining a pile in order is what perishes them.

Measured 2026-08-05 against all four board contracts in `epoch-5-deepwater`. Training/drill maps are excluded by the ratified ER-01 default. No contract can be admitted without inventing an E5 mechanic: the flagship's live boat, storm, arsenal, and Dredge-Queen consumers do not run headlessly, while the three variants declare their defining consumers missing. Forced generic GR-SIM runs were used only to record the idle Trail baseline below; each hash reproduced on a second run, but none is an acceptance pin because the support gate correctly rejects these contracts.

Re-measured 2026-08-06 (`milk/twin-sockets`) after the Deepwater era socket landed. The 2026-08-05 pass could measure nothing but forced generic diagnostics; this pass runs the flagship's real tile and arsenal consumers headlessly and narrows its blocker from "browser-only systems" to one named line. Training/drill maps are excluded by the ratified ER-01 default. No contract is admitted, so no hash below is an acceptance pin.

## WHAT CHANGED SINCE 2026-08-05

`src/sim/DeepwaterSocket.ts` runs two of the flagship's three named consumers headlessly, in the browser's own relative order (`Game.syncDeepwaterClaim → arsenal.update → waveSystem.update → recycleCorsairsAtExit → combat.update → arsenal.resolveTreatments`):

- **`DeepwaterClaimTile`** — water regions, the Claim-Boat, and the storm/corsair scheduler. Constructible, tickable, and **deterministic**: two independent instances advanced 18,000 fixed steps (600 s) produced byte-identical snapshots, 25 corsair waves each.
- **`DeepwaterArsenal`** — constructible against the real headless `CombatSystem`, registering all three shooters, with the shared `depth_charge` munition at 12/12 and dive-zone sealing wired to the tile's own depth sample.

`HeadlessContractSim` now also honours `Game.ts:1251` — a socketed Deepwater contract runs **no** generic wave schedule, because its storm track is the clock.

The third consumer could not be socketed, and that is this census's central result. See F-ER01-E5-1.

## EXECUTIVE SUMMARY

- **AGENT-READY: 0 of 4.** Unmoved by both passes — admission needs a *terminating* contract, not just a socket.
- **DATA-GAP: 3 of 4** — Regatta, Stillwater and Flotilla, each declaring a consumer that exists nowhere in the codebase. **Down from 4 of 4** because the Deepwater Claim’s consumers are no longer *missing*, they are *unreachable* (next bullet). ✅ The surgery pass’s declaration cure STANDS and is unaffected: all four contracts now declare `engineDependencies`, the Claim naming `deepwater-claim-consumer`. Re-measured across both passes, the derived manifests still expose **0 buildables · 0 interactables · 0 operations** for the three variants, so that declaration added no vocabulary — it only stopped the contract lying by omission.
- **BLOCKED-ON-BROWSER-ONLY-CONSTRUCTION: 1 of 4** — the Deepwater Claim. `DredgeQueenBossSystem` cannot be constructed outside a browser at all, and it owns the contract’s only secure condition. This verdict is NEW in this pass and replaces the Claim’s former DATA-GAP row.
- ~~**BROKEN: 1 of 4 (Regatta, also DATA-GAP)** — unchanged: the briefing promises six beacon gates while `raceCourse.beacons` and the terrain contract define five.~~ ⛔ **STRUCK — STALE ON ARRIVAL.** ✅ **BROKEN: 0 of 4.** The briefing now reads *"Five beacon gates mark the out-and-back course."* Five was load-bearing on four independent surfaces (`contracts.json` `raceCourse.beacons`, `mask-tables/e5-regatta.json`, `regatta-terrain-contract.json`, and that file’s `maskAgreement.beacons`) against one prose string, and canon is silent on the count. Pinned by ADMISSION GATE 2. **Regatta’s verdict is DATA-GAP only.**
- The Claim’s derived manifest now carries six consumer-derived rules covering boat pads and anchors, water depth classes and the dive zone, the storm track and its corsair cadence, the arsenal and its shared munition, and — explicitly — the two levers an agent cannot reach. The three variants remain silent by design; their defining data must not become vocabulary while their consumers do not exist (reject-don’t-stretch).
- Both boat levers were exercised and are real: `reanchor` moved `lagoon → open-water` and rejected a repeat of the current anchor; `placeBoatBuilding` placed on `bow` and rejected a second placement on the occupied pad.
- All four derived manifests expose zero interactable **agent** operations. The seven standing-order grammar forms cannot express the defining mechanics of the three variants; generic verb acceptance would not be coverage.
- Both diagnostic seeds were forced through the generic path and repeated byte-identically. They remain outside the production bench registry because no E5 contract was admitted. The focused spec passed 8/8 across desktop and mobile projects, including both-seed support rejection and zero captured `console.error`/`console.warn` output.
- **The forced diagnostic is a temporary, reverted probe, not a code path.** `SUPPORTED_CONTRACTS` was patched in a scratch copy to let `gr-sim` construct these contracts, then `src/sim/HeadlessContractSim.ts` was restored and **verified byte-identical by sha256** (`a455db64…1098` both sides). Nothing about the support gate shipped.

## CENSUS

| Contract | Admitted? | Boots? | Verbs? | Determinism? | Naive Trail outcome | Verdict + reason |
|---|---|---|---|---|---|---|
| `e5-deepwater-claim` | **NO** — support gate rejects it | **PARTIAL** — `DeepwaterClaimTile` and `DeepwaterArsenal` run headlessly; `DredgeQueenBossSystem` cannot be constructed. ✅ Its dependency is **DECLARED** as `deepwater-claim-consumer` (surgery pass, `7bfd62ee`) — the declaration cure stands and is orthogonal to the socket | **PARTIAL** — boat, reanchor, storm, depth and arsenal vocabulary now derived from the consumers; no agent operation exists for any of it | **YES for the socketed half** — two independent tiles, 18,000 steps each, byte-identical snapshots, 25 corsair waves | Not re-run: the contract's secure condition is unreachable, so a terminal outcome would be a death statistic, not evidence | **BLOCKED — the boss cannot exist headlessly.** `DredgeQueenBossSystem.ts:77-80` calls `document.createElement('canvas')` from instance field initializers, before its own `enabled` flag is read |
| `e5-regatta` | **NO** — support gate rejects it (re-verified 2026-08-06) | **BLOCKED** — the declared race consumer is missing, and empty harvest anchors make active selection fall back to `the-claim` | **FAIL** — no checkpoint, race, fast-water, or racer-loot operation is exposed (re-measured 2026-08-06: **0 operations**, 2 generic rules) | **N/A for admission** — forced hashes repeated twice; **both reproduced 2026-08-06** | Forced generic diagnostic: `01` **died**, wave 2, 0 calls, `fnv1a32:348721b8`;<br>`02` **died**, wave 2, 0 calls, `fnv1a32:3a51716f`<br>✅ **both re-run 2026-08-06, identical** | ~~**DATA-GAP + BROKEN** — the consumer is missing and the briefing says six gates while both data surfaces define five~~<br>✅ **BROKEN CURED 2026-08-06** — briefing now says five, matching all four data surfaces. **Verdict is now DATA-GAP only**: the race consumer still gates admission |
| `e5-stillwater` | **NO** — support gate rejects it | **BLOCKED** — `noise-hunt-consumer` is declared missing | **FAIL** — no quiet/noise, permanent-fog, storm-suppression, or leviathan-hunt operation is exposed | **N/A for admission** — forced hashes repeated twice | Forced generic diagnostic: `01` **died**, wave 3, 0 calls, `fnv1a32:5eb24494`;<br>`02` **died**, wave 3, 0 calls, `fnv1a32:92ce69e7` | **DATA-GAP** — reject-don't-stretch until noise hunting is consumed and derivable |
| `e5-flotilla` | **NO** — support gate rejects it | **BLOCKED** — the declared distributed-base consumer is missing, and empty harvest anchors make active selection fall back to `the-claim` | **FAIL** — no hull ownership, formation, straggler, hull-loss, or rider-assignment operation is exposed | **N/A for admission** — forced hashes repeated twice | Forced generic diagnostic: `01` **died**, wave 2, 0 calls, `fnv1a32:eb38173a`;<br>`02` **died**, wave 3, 0 calls, `fnv1a32:18ddc919` | **DATA-GAP** — reject-don't-stretch until the distributed-base consumer exists |

## FINDINGS

### F-ER01-E5-1 — The Deepwater Claim's socket exists; its boss cannot (REWRITTEN)

> 🟡 **PARTIALLY CURED 2026-08-06 (`milk/deepwater-surgery`).** The **declaration half is CLOSED**: `e5-deepwater-claim` now carries
> `engineDependencies: [{ dep: 'deepwater-claim-consumer', status: 'missing', … }]`, naming the browser-only path verbatim, in the exact
> AP-11 shape `ContractFamilies.ts:1702` requires (`exactRecord(['dep','status','description'])`). Pinned by `er01-e5-census.spec.ts`
> ADMISSION GATE 1, **proven by deleting the declaration again → exactly the 2 Claim tests red, 6 green**.
> The **socket half stays OPEN and is deliberately untouched** — it edits `SUPPORTED_CONTRACTS` and `HeadlessContractSim`, which this
> shift's firewall forbids. Its shape is now written down as **F-ER01-E5-5** so the next author does not have to re-derive it.
> ✅ **SOCKET HALF NOW CLOSED TOO (`milk/twin-sockets`, merged s1498)** — see the rewritten body directly below. The
> stub this banner points at, **F-ER01-E5-5**, is DISCHARGED; the socket it specified was built.

Two thirds of the original finding are discharged: the tile consumer and the arsenal both run headlessly, deterministically, in browser tick order, and their vocabulary is derived from them rather than from `tileParams`.

The remaining third is not a wiring gap and cannot be closed by wiring. `DredgeQueenBossSystem` builds its presentation in **instance field initializers** — `lootCounter = counterSprite()` and three `labelSprite(...)` calls at `src/systems/DredgeQueenBossSystem.ts:77-80` — and both helpers call `document.createElement('canvas')` (`:736`). Those initializers run before the constructor body, and therefore before the system's own `enabled` flag is ever consulted: **constructing the class outside a browser throws regardless of whether the boss is wanted.** Measured directly: `ReferenceError: document is not defined at counterSprite (DredgeQueenBossSystem.ts:661)`.

That matters more than a missing socket, because the boss owns the contract's only exit. `twist.baron.variantId` is `dredge_queen` at wave 1, and `RunManager.autoSecureWaveForRun` withholds securing while a declared baron is unbeaten — so with no Dredge-Queen there is no secure condition at all, and the generic `WaveSystem` must never be allowed to stand in for it.

The socket refuses that substitution *visibly* rather than silently: every storm wave that would have been handed to the boss is counted in `DeepwaterSocket.diagnostics.bossHandoffsRefused`, so a census can assert the gap instead of inferring it from an absence.

The fix master must make the presentation lazy — build the sprites on first `syncPresentation`, or behind `enabled`, not in field initializers — before any admission is possible. `src/systems/**` is outside this shift's firewall.

> 🗄️ **SUPERSEDED 2026-08-05 TEXT, retained per the Retention Law** — accurate when written, before either 2026-08-06 pass:
> The browser boots the flagship through `DeepwaterClaimTile`, disables generic scheduled waves, advances its storm and corsair scheduler, fastens builds to Claim-Boat pads, runs the E5 arsenal, and resolves the Dredge-Queen through its dedicated boss system. `HeadlessContractSim` runs none of those consumers, while the mechanics manifest advertises only generic build zones, spring cells, and a Baron row; the contract also lacks the `engineDependencies` declaration AP-11 requires for this gap. The attended fix master needs a Deepwater consumer socket plus consumer-derived boat/storm/depth/arsenal/boss vocabulary and the missing dependency declaration; ER-01 must not certify the generic WaveSystem diagnostic as the same contract.

### F-ER01-E5-2 — The Regatta facade has no consumer and disagrees on its gate count

> 🟡 **PARTIALLY CURED 2026-08-06 (`milk/deepwater-surgery`) — the BROKEN half is CLOSED.** `briefing.rules[0]` now reads
> *"Five beacon gates mark the out-and-back course."* **The direction was decided by counting surfaces, not by taste:** four say five
> (`contracts.json` `raceCourse.beacons`, `mask-tables/e5-regatta.json`, `regatta-terrain-contract.json`, and that file's
> `maskAgreement.beacons` — *"five submerged foundation rises"*, i.e. the mesh is physically built at five), one prose string said six,
> and **canon is silent**: the E5 bundle spec never mentions the Regatta at all, and `lore/STORYBOOK.md:282` describes the course with no
> count. Pinned by ADMISSION GATE 2, which derives the expected count *word* from `beacons.length` so it cannot rot the way the prose did,
> and cross-checks the mask table beacon-for-beacon. **Proven twice: restoring "Six" → 2 Regatta tests red; dropping one mask-table beacon
> → 2 Regatta tests red.**
> 🔻 **VETO WINDOW — Robin, one word reverses this.** If the course is *meant* to have six gates, the fix is not the prose: it is a sixth
> beacon position plus a terrain re-bake, which is an art/terrain job, not a content edit.
> The **consumer, course vocabulary, and selectability stay OPEN** — all three are sim work. See **F-ER01-E5-5**.

Regatta declares `regatta-race-consumer` missing for checkpoint progress and competing-racer loot, and its derived manifest exposes neither those mechanics nor its fast-water course. Its empty harvest-anchor list also makes normal active-contract selection return the Claim fallback, so a forced GR-SIM run combines Regatta diagnostics with the wrong global mechanics manifest. Separately, the player-facing briefing promises six beacon gates while `raceCourse.beacons` and `regatta-terrain-contract.json` define five. The attended fix master must reconcile that count, land the race consumer, derive the course vocabulary from it, and make the contract selectable before headless admission.

> ⛔ **The `milk/twin-sockets` copy of this finding opened *"Unchanged … the briefing promises six beacon gates"* and was
> **STALE ON ARRIVAL** — the surgery pass had already cured it at `7bfd62ee`. Struck rather than merged; the banner above is
> the live text. The branch's remaining sentences about the missing consumer, the manifest and selectability are identical
> in substance to the body above and add nothing, so nothing else was lost (F-1497-1).

### F-ER01-E5-3 — Stillwater's quiet hunt is data without a consumer

Unchanged. Stillwater declares `noise-hunt-consumer` missing for permanent fog, storm suppression, machine-noise emission, and leviathan attraction. The current headless path can generically fight an enemy roster, but the manifest exposes none of the quiet/noise choices that define the contract, so a deterministic death on both seeds is not playability evidence. The attended fix master must provide the consuming system and its agent/headless action surface before ER-01 can admit the map.

### F-ER01-E5-4 — The Flotilla has no distributed-base owner

Flotilla declares `distributed-base-consumer` missing for three-hull ownership, straggler targeting, nonfatal hull loss, formation reshaping, and one-hull-per-rider assignment. Those fields are absent from the derived manifest, and the empty harvest-anchor list makes active selection fall back to the Claim instead of booting Flotilla. The attended fix master must land that consumer, derive its hull/formation vocabulary, and make the contract selectable; a generic two-edge holdout is not an admissible substitute.

### F-ER01-E5-5 — SOCKET-SHAPE STUB: what the E5 era socket must do (filed 2026-08-06, `milk/deepwater-surgery`)

**Filed instead of stretched.** The shift order allowed content/config cures only and required a STOP plus this stub the moment a cure needed a SIM change. Both E5 cures hit that line, so here is the shape, measured rather than guessed, so the socket author starts from facts:

- **The gate is one `Set`.** `src/sim/HeadlessContractSim.ts:41` lists 12 ids, none E5; `:184` throws `AP-07 supports only …`. Verified live 2026-08-06 by running `gr-sim` against `e5-deepwater-claim` and reading the throw. The `mode` bypass at `:183` is **not** a second door here — **no E5 contract declares `modes`** (checked all four), which is the exact jointly-unsatisfiable wall that cost the `e3-fairground` socket run 124k tokens (F-1475-1). Adding ids without a consumer would admit a contract the engine cannot simulate.
- **Three browser-only consumers must move or gain headless twins**, verified to exist at these paths: `src/world/DeepwaterClaimTile.ts`, `src/entities/DeepwaterArsenal.ts`, `src/systems/DredgeQueenBossSystem.ts`.
- **The vocabulary must be consumer-derived, not data-scraped.** `src/agent/MechanicsManifest.ts` reads **none** of `tileParams.deepwater`, `raceCourse`, `stillwater`, `flotilla`, `engineDependencies` (grep-verified against a validated instrument: the file is 339 grep-readable lines and a positive control hits). That absence is *why* `FORBIDDEN_SOURCE` in the census spec passes today; a socket that scraped the data surface instead of deriving from the running consumer would satisfy the letter of the census and none of its intent.
- **Precedent to copy:** the ERA-SOCKET template — `e2-pressure-socket` (`24c6600f`), then `e3-moth-socket`, `e3-canyon-environment`, `e3-crawler-socket` (`a172eed0`). The E3 census spec shows the admission-assert shape a socket must earn: constructor `.not.toThrow()`, a `toMatchObject` on the derived vocabulary, and a determinism pair asserting `secured: true` with matching `eventLogHash`.
- **Order of operations if only one lands:** the Regatta additionally needs non-empty `harvestAnchors` to become selectable at all. **Do not do that first.** While the consumer is missing, the empty list is load-bearing — it is what makes active selection fall back to the Claim instead of booting a false contract. Selectability is the *last* step of that cure, not the first.

### F-ER01-E5-6 — AP-11 never demanded the Claim's declaration, because `tileParams.deepwater` is not a declared-inert path

The census recorded that the Claim alone failed to declare its missing dependencies, and read it as an authoring omission. It is also a **mechanism hole, and the mechanism hole is the more durable half.** `validateEngineDependencies` (`src/meta/ContractFamilies.ts:1713`) only requires a declaration when the contract carries a path listed in `DECLARED_INERT_PATHS` (`:1560`). That list contains `tileParams.raceCourse`, `tileParams.stillwater`, `tileParams.flotilla`, `tileParams.description`, `tileParams.objectives`, `tileParams.teachingIntent` — **and not `tileParams.deepwater`.**

So the three variants were caught by their *variant* fields, never by the deepwater block itself, and the flagship — which carries `deepwater` and none of the listed fields — was structurally invisible to the guard. **The three siblings' honesty was an accident of which fields they happened to also carry, not the guard working.** `tileParams.deepwater` is inert for all four contracts (no consumer reads it, per F-ER01-E5-5), so it belongs on that list.

**Not fixed here: `src/meta/ContractFamilies.ts` is outside this shift's firewall.** But the sweep the fix would need **has already been run, so the next author does not have to.** Measured 2026-08-06 across all ten `assets/contracts/*/contracts.json`: `tileParams.deepwater` occurs in **exactly four contracts, all of them E5, and after today's cure all four declare `engineDependencies`.** So adding `tileParams.deepwater` to `DECLARED_INERT_PATHS` **reds nothing today** — it is a one-line change with a measured zero-fallout window, and that window closes the moment an E11+ epoch or a new variant authors a `deepwater` block. Land it soon and it is free; land it late and it is a migration.

⚠️ **Do not read the zero-fallout as "the guard was fine."** The order matters: the content cure came first and made the corpus clean, so the guard would now pass **because of** the fix rather than because it was ever watching. That is precisely the shape of a guard that passes by reading a subject that has already been repaired.

> ⚠️ **F-ID COLLISION, RESOLVED AT MERGE (s1498).** `milk/deepwater-surgery` and `milk/twin-sockets` were authored in
> parallel against this same census and **both minted `F-ER01-E5-5` for different findings** — the surgery pass for the
> socket-shape stub above, the socket pass for the finding below. Neither branch could see the other. The stub keeps the
> number (it is cited by name from two banners above and from `reviews/milk-deepwater-surgery.md`); the socket pass's
> finding is **renumbered E5-7** here, with its text otherwise untouched. Nothing was dropped.
### F-ER01-E5-7 — The Claim's levers exist on the consumer and not on the agent surface (NEW)

`ClaimBoat.placeBuilding` and `ClaimBoat.reanchor` are real, tested levers — both were exercised headlessly, both accept a valid move and reject an invalid one. Neither is reachable by an agent: `AgentGameAdapter` (`src/agent/ToolSurface.ts:82`) carries `placeBuilding`, `panAt`, `repair`, `chaseMark`, `collectXp` and `collectGold`, and the browser reaches the boat through contract-specific actions (`Game.ts:1973`, `:1978`) that have no agent equivalent.

Rather than advertise operations an agent cannot invoke, the manifest states the gap: rule `deepwater_levers_unreachable` names the two consumer levers and an empty `agentOperations` list. This is the same shape as F-ER01-E6-5 in the Atomic census — two epochs, independently measured, whose sockets both land on the agent verb list. Adding verbs to `AgentGameAdapter` is a governed-surface decision and belongs on the owner's desk, not in an era-socket slice.
