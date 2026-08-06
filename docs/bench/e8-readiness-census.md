# E8 READINESS CENSUS — Orbital before the owner's ride

Measured 2026-08-06 against all four board contracts in `epoch-8-orbital`. Training/drill maps are excluded by the ratified ER-01 default. AP-11 admits a contract only when its signature mechanic is declared, consumed by a booted system, exposed to agents, and represented in the headless run; a generic wave run that ignores the Orbital contract is not a census result.

## EXECUTIVE SUMMARY

- **AGENT-READY: 0 of 4** — no Orbital contract is cleanly admissible yet.
- **DATA-GAP: 4 of 4** — `E8PhysicsSystem` runs only at the browser `Game` seam, `HeadlessContractSim` has no Orbital socket, and every contract declares one objective/atmosphere `engineDependencies[{ status: "missing" }]` consumer.
- **BROKEN: 0** — all four authored bundles load and declare their missing dependencies honestly.
- All four derived mechanics manifests expose zero interactables and only the generic `build_zones` rule. They omit gravity, atmosphere, the source-only Salvage Claw, signal suppression/probe recovery, handhold/orbital-return behavior, and the eclipse event.
- `SUPPORTED_CONTRACTS` and `bench-seeds.json` remain unchanged: ER-01 pins two seeds per admitted contract, and this census admits none. The focused spec checks both nominal probe seeds for all four explicit rejections in both Playwright projects with zero captured console output.

## CENSUS

| Contract | Admitted? | Boots? | Verbs? | Determinism? | Naive Trail outcome | Verdict + reason |
|---|---|---|---|---|---|---|
| `e8-mare-claim` | **NO** — support gate rejects it | **BLOCKED** — Orbital physics is browser-only and `atmosphere-wall-consumer` is missing | **FAIL** — low-g, suit timer, air walls, and the id-staged Salvage Claw have no headless action/view path | **N/A** — rejected before a bench-grade run | **NOT RUN** — generic waves would omit the atmosphere and Claw contract | **DATA-GAP** — socket Orbital physics/atmosphere and move the Claw into consumer-derived contract data before admission |
| `e8-far-side` | **NO** — support gate rejects it | **BLOCKED** — `far-side-contract-consumers` is missing | **FAIL** — suit-only traversal, signal suppression, probe recovery, and playback have no action/view path | **N/A** — rejected before a bench-grade run | **NOT RUN** — survival cannot recover the probe or resolve the comms shadow | **DATA-GAP** — the Far Side consumer must own boot, vocabulary, and terminal posting |
| `e8-low-orbit` | **NO** — support gate rejects it | **BLOCKED** — `low-orbit-contract-consumers` is missing and its physics profile is browser-only | **FAIL** — scaffold handholds, debris, the objective, and missed-lob orbital return have no admitted action/view path | **N/A** — rejected before a bench-grade run | **NOT RUN** — fixed-ground generic waves would not exercise the zero-g contract | **DATA-GAP** — complete the zero-g projectile/objective socket and derive its handhold vocabulary before admission |
| `e8-eclipse` | **NO** — support gate rejects it | **BLOCKED** — `eclipse-contract-consumers` is missing | **FAIL** — eclipse timing, solar shutdown, shadow zones, dark waves, suit timer, and air walls have no action/view path | **N/A** — rejected before a bench-grade run | **NOT RUN** — generic waves cannot trigger or complete the eclipse event | **DATA-GAP** — add the eclipse/atmosphere consumer and consumer-derived vocabulary before admission |

## FINDINGS

### F-ER01-E8-1 — The Mare Claim's browser systems disappear headlessly

The Mare Claim declares a 0.6g profile consumed by browser-only `E8PhysicsSystem`, while its air-wall and suit-timer dependency remains explicitly `missing`; the Salvage Claw is also enabled by a literal `e8-mare-claim` check in `Game` rather than contract data, so neither it nor its operations enter the mechanics manifest. The attended fix master must socket the production physics and atmosphere rules into the headless view/action/event model, move the Claw staging into consumer-derived contract data, and expose the actual terminal posting before admission.

### F-ER01-E8-2 — The Far Side has declarations but no contract owner

The Far Side's signal suppression, suit-only traversal, probe recovery, and one-shot playback are declared in data, but the bundle itself marks `far-side-contract-consumers` missing and the fields have no booted gameplay or headless consumer. The attended fix master must author one deterministic owner for the comms shadow and probe objective, derive the available/restrained actions from that consumer, and post an honest completion event before ER-01 can test it.

### F-ER01-E8-3 — Low Orbit's profile is not a complete zero-g contract

`E8PhysicsSystem` can derive free-fall movement and a 4.8x lob profile for Low Orbit, but that consumer runs only through `Game`; its `orbitalReturn` value is diagnostic rather than a missed-projectile lifecycle, and the declared scaffold, debris, handhold-road, atmosphere, and objective consumers remain missing. The attended fix master must complete the production zero-g projectile/objective path, expose handholds and return behavior to agents, and reuse that deterministic socket headlessly before admission.

### F-ER01-E8-4 — The Eclipse event is inert outside its contract JSON

The Eclipse declares an unannounced mid-run solar shutdown and dark-wave set, plus the Mare Claim's low gravity and atmosphere rules, but `eclipseEvent` has no booted consumer and `eclipse-contract-consumers` remains missing; the mechanics manifest consequently reports only build zones. The attended fix master must implement one deterministic eclipse/solar/shadow owner, derive its observable rules and actions, and compose it with the shared Orbital physics/atmosphere socket before this contract can receive bench seeds.
