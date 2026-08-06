# E9 READINESS CENSUS — Red Fields before the owner's ride

Measured 2026-08-06 against all four board contracts in `epoch-9-redfields`. Training/drill maps are excluded by the ratified ER-01 default. AP-11 admits a contract only when its signature mechanic is both declared and consumed by the headless action/view/event model; accepting generic orders and surviving generic waves is not coverage.

The naive arm temporarily forced each rejected contract through the generic Trail driver with no orders (the same behavior as GR-SIM's `--policy=idle`) on the lane's default Node 23.11.1. Each diagnostic run was repeated and matched byte-for-byte, but those hashes are not acceptance pins: the model omits the mechanics that must contribute events before determinism can be certified. No E9 entry was added to `SUPPORTED_CONTRACTS` or `bench-seeds.json`.

## EXECUTIVE SUMMARY

- **AGENT-READY: 0 of 4.** No Red Fields contract is cleanly admissible.
- **DATA-GAP: 4 of 4.** Epoch-wide `E9ArsenalSystem` is browser-only from the headless sim's perspective and absent from the mechanics manifest. Dome Basin additionally depends on browser-only `E9CanalSystem` and `OldDiggerBossSystem`; Seed Run, Devil's Alley, and Old Canal each declare their signature persistence/relocation consumer `missing`.
- **BROKEN: 0.** All four authored bundles load, all seven generic standing-order forms respond on both diagnostic seeds, every forced idle run terminates by hero death, and the focused guard captures zero console warnings/errors. The missing layer is contract semantics, not bundle integrity.
- Every derived E9 manifest exposes zero interactables and only generic `build_zones`. It therefore omits Storm Fence deployment and Cure-Arms outcomes, canal gates, quarry work, dust-devil displacement, Old Digger boarding/tape exchange, planted waypoints, scheduled relocation, and persistent canal choices.
- `e9-dome-basin` also omits `engineDependencies` despite its missing headless/manifest consumers. The other three rows declare one honest missing dependency apiece. ER-01 records that asymmetry rather than editing contract content.

## CENSUS

| Contract | Admitted? | Boots? | Verbs? | Determinism? | Naive Trail outcome | Verdict + reason |
|---|---|---|---|---|---|---|
| `e9-dome-basin` | **NO** — support gate rejects it | **BLOCKED** — epoch-wide `E9ArsenalSystem`, `E9CanalSystem`, and `OldDiggerBossSystem` are not socketed headlessly | **FAIL** — 7/7 generic forms respond, but the manifest declares only `build_zones`; no Cure-Arms, fence, gate, quarry, dust-devil, boarding, or tape operation | **N/A** — rejected before a bench-grade run | Forced generic diagnostic: `01` **died**, wave 2, 0 calls, `fnv1a32:5ef6ae2c`;<br>`02` **died**, wave 2, 0 calls, `fnv1a32:3350c97d` | **DATA-GAP** — socket the production arsenal, canal, and boss systems and derive their vocabulary before admission |
| `e9-seed-run` | **NO** — support gate rejects it | **BLOCKED** — epoch-wide `E9ArsenalSystem` is absent headlessly and `persistent-planting-consumer` is declared missing | **FAIL** — 7/7 generic forms respond, but no Cure-Arms/fence, plant/escort, or persistent-waypoint action or posting exists | **N/A** — rejected before a bench-grade run | Forced generic diagnostic: `01` **died**, wave 2, 0 calls, `fnv1a32:3300fab6`;<br>`02` **died**, wave 3, 0 calls, `fnv1a32:261903e3` | **DATA-GAP** — generic wave survival cannot create the future-run shelters that define the contract |
| `e9-devils-alley` | **NO** — support gate rejects it | **BLOCKED** — epoch-wide `E9ArsenalSystem` is absent headlessly and `scheduled-relocation-consumer` is declared missing | **FAIL** — 7/7 generic forms respond, but no Cure-Arms/fence, anchor/relocate schedule, or relocation objective is visible | **N/A** — rejected before a bench-grade run | Forced generic diagnostic: `01` **died**, wave 3, 0 calls, `fnv1a32:f3dbd3be`;<br>`02` **died**, wave 3, 0 calls, `fnv1a32:97442d11` | **DATA-GAP** — waves without moving buildings erase the contract's defining decision |
| `e9-old-canal` | **NO** — support gate rejects it | **BLOCKED** — epoch-wide `E9ArsenalSystem` is absent headlessly and `persistent-canal-choice-consumer` is declared missing | **FAIL** — 7/7 generic forms respond, but no Cure-Arms/fence, re-dig/demolish choice, derived flow, or persistent posting exists | **N/A** — rejected before a bench-grade run | Forced generic diagnostic: `01` **died**, wave 2, 0 calls, `fnv1a32:e542dcaa`;<br>`02` **died**, wave 2, 0 calls, `fnv1a32:f8c46ca6` | **DATA-GAP** — a generic hold-out cannot resolve or remember segment choices |

## FINDINGS

### F-ER01-E9-1 — Dome Basin's arsenal, canal, and Old Digger systems stop at the browser boundary

Dome Basin boots epoch-wide `E9ArsenalSystem` for weather charge, Cure-Arms outcomes, and Storm Fence deployment, `E9CanalSystem` for three ordered stage holds, quarry work, persistent stage state, canal wetting, and dust-devil displacement, and `OldDiggerBossSystem` for the boss's survey, boarding, tape exchange, corrected re-dig, and persistence path. `HeadlessContractSim` constructs none of them, the derived manifest reports only `build_zones`, and the contract declares no `engineDependencies` for the gap. The attended fix master must separate those production systems' deterministic simulation seams from presentation, socket their action/view/event vocabulary headlessly, and add honest dependency staging before this row can be admitted.

### F-ER01-E9-2 — Seed Run declares persistence without a planting or escort consumer

Seed Run honestly marks `persistent-planting-consumer` missing, and its derived manifest omits the three planting grounds, the caravan objective, all plant choices, and the future-run waypoint result. The shared `E9ArsenalSystem` is also browser-only, so Cure-Arms outcomes and Storm Fence deployment disappear headlessly. The attended fix master must socket the shared arsenal, define one deterministic owner for caravan progress and planted-waypoint persistence, expose the real action/posting surfaces, and include those semantic events in the outcome hash before the support gate can open.

### F-ER01-E9-3 — Devil's Alley has no scheduled relocation owner

Devil's Alley declares `scheduled-relocation-consumer` missing while its defining promise is that dust-devil columns move unanchored buildings rather than destroy them. Nothing in the mechanics manifest or headless loop exposes anchoring, the schedule, relocation targets, or the resulting objective state; the shared browser-only arsenal also loses Cure-Arms outcomes and Storm Fence deployment. The attended fix master must socket the shared arsenal and a deterministic relocation consumer with agent-visible vocabulary and hashable events; ordinary west/east waves are diagnostic scenery, not completion of this contract.

### F-ER01-E9-4 — Old Canal cannot express or remember its segment decisions

Old Canal declares `persistent-canal-choice-consumer` missing, and neither the manifest nor headless sim can choose re-dig versus demolish, derive the combined water route, or persist that inheritance across runs. The shared browser-only arsenal also loses Cure-Arms outcomes and Storm Fence deployment. The attended fix master must socket the arsenal and define the segment-choice action, deterministic flow derivation, terminal posting, and profile persistence seam together, then re-run both pinned admission seeds; admitting the current generic build-zone model would certify a contract with its entire objective removed.
