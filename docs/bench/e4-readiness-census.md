# E4 READINESS CENSUS — Motor before the owner's ride

Measured 2026-08-05 against all four board contracts in `epoch-4-motor`. Training/drill maps are excluded by the ratified ER-01 default. AP-11 admits a contract only when its signature mechanic is both declared and consumed by a booted system; a generic wave run that ignores the contract's objective is not a census result.

## EXECUTIVE SUMMARY

- **AGENT-READY: 0 of 4** — no Motor contract is cleanly admissible yet.
- **DATA-GAP: 4 of 4** — every contract declares one signature `engineDependencies[{ status: "missing" }]` consumer, and `HeadlessContractSim` consumes none of them.
- **BROKEN: 0** — the authored bundles load and their missing dependencies are declared honestly.
- All four derived mechanics manifests expose zero interactables. Their generic build-zone, posting, and Baron entries do not express ORBIT/weather roads, the moving Hauler claim, wild-derrick capping, or the salvage/sleeper rules.
- `SUPPORTED_CONTRACTS` and `bench-seeds.json` remain unchanged: ER-01 pins two seeds per admitted contract, and this census admits none. The focused spec checks all four explicit rejections in both Playwright projects with zero captured console output.

## CENSUS

| Contract | Admitted? | Boots? | Verbs? | Determinism? | Naive Trail outcome | Verdict + reason |
|---|---|---|---|---|---|---|
| `e4-dust-flats` | **NO** — support gate rejects it | **BLOCKED** — `dust-flats-tile-consumer` is missing; `DustFlatsTile` has no boot caller | **FAIL** — tar seams, roads, ORBIT, dry wash, and weather have no admitted action/view path | **N/A** — rejected before a bench-grade run | **NOT RUN** — a generic wave run would omit the named Motor tile mechanics | **DATA-GAP** — boot the Dust Flats consumer and derive its vocabulary before admission |
| `e4-long-road` | **NO** — support gate rejects it | **BLOCKED** — `convoy-claim-consumer` is missing | **FAIL** — Hauler-only basing, convoy advance, rest-stop anchorage, and lead-Hauler loss have no action/view path | **N/A** — rejected before a bench-grade run | **NOT RUN** — the current sim would defend a fixed stake instead of riding the claim | **DATA-GAP** — the moving-claim socket must own boot, verbs, and terminal rules |
| `e4-gusher-county` | **NO** — support gate rejects it | **BLOCKED** — `wild-derrick-consumer` is missing | **FAIL** — eruptions, cap-to-claim, blowout waves, and seam-spawned tar sprites have no action/view path | **N/A** — rejected before a bench-grade run | **NOT RUN** — generic waves cannot exercise or complete the derrick objective | **DATA-GAP** — add the derrick socket and consumer-derived cap vocabulary before admission |
| `e4-boneyard` | **NO** — support gate rejects it | **BLOCKED** — `salvage-race-consumer` is missing | **FAIL** — stripping hulks, rival salvage, disturbing the sleeper, and preserving it by abstaining have no action/view path | **N/A** — rejected before a bench-grade run | **NOT RUN** — wave survival would not resolve the salvage race or sleeper reward | **DATA-GAP** — the salvage socket needs explicit hidden and abstain vocabulary before admission |

## FINDINGS

### F-ER01-E4-1 — The Dust Flats tile is authored but never booted

The Dust Flats declares tar seams, road corridors, ORBIT spawning, a dry wash, weather, and the Land-Yacht, but its required `dust-flats-tile-consumer` remains `missing`; `createDustFlatsTile` has no caller, and the headless sim does not run it. The attended fix master must boot one real consumer, derive the resulting view/action vocabulary, and socket the same deterministic mechanic into `HeadlessContractSim` before this contract can receive seeds or an admission.

### F-ER01-E4-2 — The Long Road has no moving-claim owner

The Long Road's contract is won and lost around a moving Hauler, brief rest-stop anchorage, and convoy progress, while the current headless path only knows a fixed hero start and generic secure wave. The declared `convoy-claim-consumer` is therefore correctly `missing`; the attended fix master must define one owner for convoy boot, Hauler-relative building/action vocabulary, and the lead-Hauler terminal condition before ER-01 can test determinism honestly.

### F-ER01-E4-3 — Gusher County's objective has no derrick consumer

Gusher County declares scheduled wild-derrick eruptions, capping, blowout waves, and tar sprites that spawn from seams, but none enters the mechanics manifest or headless loop because `wild-derrick-consumer` is `missing`. The attended fix master must add the deterministic derrick scheduler and a real cap operation to both the consumer-derived manifest and headless action path; ordinary survival waves are not a substitute for completing the contract.

### F-ER01-E4-4 — The Boneyard cannot express salvage or restraint

The Boneyard's objective compares the player's salvage against rival rustlers and hides a reward for leaving the sleeper undisturbed, yet `salvage-race-consumer` is `missing` and the manifest exposes neither a salvage operation nor AP-11's hidden/refrain vocabulary. The attended fix master must socket the salvage economy and terminal comparison, mark the sleeper as a designed secret, and expose a machine-readable abstain condition before admission.
