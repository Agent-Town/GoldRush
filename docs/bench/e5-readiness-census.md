# E5 READINESS CENSUS — Deepwater before the owner's ride

Re-measured 2026-08-06 (`milk/twin-sockets`) after the Deepwater era socket landed. The 2026-08-05 pass could measure nothing but forced generic diagnostics; this pass runs the flagship's real tile and arsenal consumers headlessly and narrows its blocker from "browser-only systems" to one named line. Training/drill maps are excluded by the ratified ER-01 default. No contract is admitted, so no hash below is an acceptance pin.

## WHAT CHANGED SINCE 2026-08-05

`src/sim/DeepwaterSocket.ts` runs two of the flagship's three named consumers headlessly, in the browser's own relative order (`Game.syncDeepwaterClaim → arsenal.update → waveSystem.update → recycleCorsairsAtExit → combat.update → arsenal.resolveTreatments`):

- **`DeepwaterClaimTile`** — water regions, the Claim-Boat, and the storm/corsair scheduler. Constructible, tickable, and **deterministic**: two independent instances advanced 18,000 fixed steps (600 s) produced byte-identical snapshots, 25 corsair waves each.
- **`DeepwaterArsenal`** — constructible against the real headless `CombatSystem`, registering all three shooters, with the shared `depth_charge` munition at 12/12 and dive-zone sealing wired to the tile's own depth sample.

`HeadlessContractSim` now also honours `Game.ts:1251` — a socketed Deepwater contract runs **no** generic wave schedule, because its storm track is the clock.

The third consumer could not be socketed, and that is this census's central result. See F-ER01-E5-1.

## EXECUTIVE SUMMARY

- **AGENT-READY: 0 of 4.** Unchanged.
- **DATA-GAP: 3 of 4** — Regatta, Stillwater and Flotilla, each declaring a consumer that exists nowhere in the codebase. Down from 4: the Deepwater Claim's consumers are no longer missing, they are unreachable.
- **BLOCKED-ON-BROWSER-ONLY-CONSTRUCTION: 1 of 4** — the Deepwater Claim. `DredgeQueenBossSystem` cannot be constructed outside a browser at all, and it owns the contract's only secure condition.
- **BROKEN: 1 of 4 (Regatta, also DATA-GAP)** — unchanged: the briefing promises six beacon gates while `raceCourse.beacons` and the terrain contract define five.
- The Claim's derived manifest now carries six consumer-derived rules covering boat pads and anchors, water depth classes and the dive zone, the storm track and its corsair cadence, the arsenal and its shared munition, and — explicitly — the two levers an agent cannot reach. The three variants remain silent by design; their defining data must not become vocabulary while their consumers do not exist (reject-don't-stretch).
- Both boat levers were exercised and are real: `reanchor` moved `lagoon → open-water` and rejected a repeat of the current anchor; `placeBoatBuilding` placed on `bow` and rejected a second placement on the occupied pad.

## CENSUS

| Contract | Admitted? | Boots? | Verbs? | Determinism? | Naive Trail outcome | Verdict + reason |
|---|---|---|---|---|---|---|
| `e5-deepwater-claim` | **NO** — support gate rejects it | **PARTIAL** — `DeepwaterClaimTile` and `DeepwaterArsenal` run headlessly; `DredgeQueenBossSystem` cannot be constructed | **PARTIAL** — boat, reanchor, storm, depth and arsenal vocabulary now derived from the consumers; no agent operation exists for any of it | **YES for the socketed half** — two independent tiles, 18,000 steps each, byte-identical snapshots, 25 corsair waves | Not re-run: the contract's secure condition is unreachable, so a terminal outcome would be a death statistic, not evidence | **BLOCKED — the boss cannot exist headlessly.** `DredgeQueenBossSystem.ts:77-80` calls `document.createElement('canvas')` from instance field initializers, before its own `enabled` flag is read |
| `e5-regatta` | **NO** — support gate rejects it | **BLOCKED** — `regatta-race-consumer` declared missing; empty harvest anchors make active selection fall back to `the-claim` | **FAIL** — no checkpoint, race, fast-water or racer-loot operation is exposed | **N/A for admission** | Forced generic diagnostic (2026-08-05): `01` **died**, wave 2, 0 calls, `fnv1a32:348721b8`;<br>`02` **died**, wave 2, 0 calls, `fnv1a32:3a51716f` | **DATA-GAP + BROKEN** — the consumer is missing and the briefing says six gates while both data surfaces define five |
| `e5-stillwater` | **NO** — support gate rejects it | **BLOCKED** — `noise-hunt-consumer` declared missing | **FAIL** — no quiet/noise, permanent-fog, storm-suppression or leviathan-hunt operation is exposed | **N/A for admission** | Forced generic diagnostic (2026-08-05): `01` **died**, wave 3, 0 calls, `fnv1a32:5eb24494`;<br>`02` **died**, wave 3, 0 calls, `fnv1a32:92ce69e7` | **DATA-GAP** — reject-don't-stretch until noise hunting is consumed and derivable |
| `e5-flotilla` | **NO** — support gate rejects it | **BLOCKED** — `distributed-base-consumer` declared missing; empty harvest anchors make active selection fall back to `the-claim` | **FAIL** — no hull ownership, formation, straggler, hull-loss or rider-assignment operation is exposed | **N/A for admission** | Forced generic diagnostic (2026-08-05): `01` **died**, wave 2, 0 calls, `fnv1a32:eb38173a`;<br>`02` **died**, wave 3, 0 calls, `fnv1a32:18ddc919` | **DATA-GAP** — reject-don't-stretch until the distributed-base consumer exists |

## FINDINGS

### F-ER01-E5-1 — The Deepwater Claim's socket exists; its boss cannot (REWRITTEN)

Two thirds of the original finding are discharged: the tile consumer and the arsenal both run headlessly, deterministically, in browser tick order, and their vocabulary is derived from them rather than from `tileParams`.

The remaining third is not a wiring gap and cannot be closed by wiring. `DredgeQueenBossSystem` builds its presentation in **instance field initializers** — `lootCounter = counterSprite()` and three `labelSprite(...)` calls at `src/systems/DredgeQueenBossSystem.ts:77-80` — and both helpers call `document.createElement('canvas')` (`:736`). Those initializers run before the constructor body, and therefore before the system's own `enabled` flag is ever consulted: **constructing the class outside a browser throws regardless of whether the boss is wanted.** Measured directly: `ReferenceError: document is not defined at counterSprite (DredgeQueenBossSystem.ts:661)`.

That matters more than a missing socket, because the boss owns the contract's only exit. `twist.baron.variantId` is `dredge_queen` at wave 1, and `RunManager.autoSecureWaveForRun` withholds securing while a declared baron is unbeaten — so with no Dredge-Queen there is no secure condition at all, and the generic `WaveSystem` must never be allowed to stand in for it.

The socket refuses that substitution *visibly* rather than silently: every storm wave that would have been handed to the boss is counted in `DeepwaterSocket.diagnostics.bossHandoffsRefused`, so a census can assert the gap instead of inferring it from an absence.

The fix master must make the presentation lazy — build the sprites on first `syncPresentation`, or behind `enabled`, not in field initializers — before any admission is possible. `src/systems/**` is outside this shift's firewall.

### F-ER01-E5-2 — The Regatta facade has no consumer and disagrees on its gate count

Unchanged. Regatta declares `regatta-race-consumer` missing for checkpoint progress and competing-racer loot, and its derived manifest exposes neither those mechanics nor its fast-water course. Its empty harvest-anchor list also makes normal active-contract selection return the Claim fallback, so a forced GR-SIM run combines Regatta diagnostics with the wrong global mechanics manifest. Separately, the player-facing briefing promises six beacon gates while `raceCourse.beacons` and `regatta-terrain-contract.json` define five. The attended fix master must reconcile that count, land the race consumer, derive the course vocabulary from it, and make the contract selectable before headless admission.

### F-ER01-E5-3 — Stillwater's quiet hunt is data without a consumer

Unchanged. Stillwater declares `noise-hunt-consumer` missing for permanent fog, storm suppression, machine-noise emission, and leviathan attraction. The current headless path can generically fight an enemy roster, but the manifest exposes none of the quiet/noise choices that define the contract, so a deterministic death on both seeds is not playability evidence. The attended fix master must provide the consuming system and its agent/headless action surface before ER-01 can admit the map.

### F-ER01-E5-4 — The Flotilla has no distributed-base owner

Unchanged. Flotilla declares `distributed-base-consumer` missing for three-hull ownership, straggler targeting, nonfatal hull loss, formation reshaping, and one-hull-per-rider assignment. Those fields are absent from the derived manifest, and the empty harvest-anchor list makes active selection fall back to the Claim instead of booting Flotilla. The attended fix master must land that consumer, derive its hull/formation vocabulary, and make the contract selectable; a generic two-edge holdout is not an admissible substitute.

### F-ER01-E5-5 — The Claim's levers exist on the consumer and not on the agent surface (NEW)

`ClaimBoat.placeBuilding` and `ClaimBoat.reanchor` are real, tested levers — both were exercised headlessly, both accept a valid move and reject an invalid one. Neither is reachable by an agent: `AgentGameAdapter` (`src/agent/ToolSurface.ts:82`) carries `placeBuilding`, `panAt`, `repair`, `chaseMark`, `collectXp` and `collectGold`, and the browser reaches the boat through contract-specific actions (`Game.ts:1973`, `:1978`) that have no agent equivalent.

Rather than advertise operations an agent cannot invoke, the manifest states the gap: rule `deepwater_levers_unreachable` names the two consumer levers and an empty `agentOperations` list. This is the same shape as F-ER01-E6-5 in the Atomic census — two epochs, independently measured, whose sockets both land on the agent verb list. Adding verbs to `AgentGameAdapter` is a governed-surface decision and belongs on the owner's desk, not in an era-socket slice.
