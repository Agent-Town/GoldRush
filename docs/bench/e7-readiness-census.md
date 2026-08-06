# E7 READINESS CENSUS — Signal before the owner's ride

Measured 2026-08-06 against all four board contracts in `epoch-7-signal`. Training/drill maps are excluded by the ratified ER-01 default. AP-11 admits a contract only when its signature mechanic is declared, consumed by a booted system, and available through the agent view/action surface; a generic wave run that omits Signal is not a census result.

## EXECUTIVE SUMMARY

- **AGENT-READY: 0 of 4** — no Signal contract is cleanly admissible yet.
- **DATA-GAP: 4 of 4** — Relay Valley's browser run composes `E7SignalSystem`, playbook record/replay, and `EchoBossSystem`, while `HeadlessContractSim` and the mechanics manifest expose none of them. Echo Canyon, Dead Band, and Relay Rush each declare their defining consumer `missing`.
- **BROKEN: 0** — all four authored bundles load. The three reuse maps deliberately remain unavailable because `harvestAnchors: []`; active selection falls back to `the-claim` instead of booting a false contract.
- Every derived manifest exposes zero interactables, zero Signal buildables/operations, and only generic `build_zones`. Relay Valley also lacks the `engineDependencies` declaration AP-11 requires for its absent headless Signal and Echo consumers.
- `SUPPORTED_CONTRACTS` and `bench-seeds.json` remain unchanged because ER-01 pins seeds only for admitted contracts. The focused spec checks both diagnostic seed names per contract at the support gate across desktop and mobile projects with zero captured console warning/error.

## CENSUS

| Contract | Admitted? | Boots? | Verbs? | Determinism? | Naive Trail outcome | Verdict + reason |
|---|---|---|---|---|---|---|
| `e7-relay-valley` | **NO** — support gate rejects both seed names | **BLOCKED** — browser-only `E7SignalSystem`, playbook replay, and `EchoBossSystem` have no headless socket; dependencies are undeclared | **FAIL** — the manifest exposes only `build_zones`, not relay linking/coverage, record/replay, drone reach, or Echo capture | **N/A** — rejected before a bench-grade run | **NOT RUN** — generic waves would omit the relay graph and the wave-12 Echo objective | **DATA-GAP** — add the Signal/Echo socket and consumer-derived vocabulary before admission |
| `e7-echo-canyon` | **NO** — support gate rejects both seed names | **BLOCKED** — `broadcast-mirror-consumer` is declared missing, and empty harvest anchors route active selection to `the-claim` | **FAIL** — the manifest omits broadcast fields, delayed corrupted replay, and its counter-play action | **N/A** — rejected before a bench-grade run | **NOT RUN** — a Claim fallback cannot exercise the named mirror contract | **DATA-GAP** — make the contract selectable and consume/derive the mirror mechanic before admission |
| `e7-dead-band` | **NO** — support gate rejects both seed names | **BLOCKED** — `signal-suppression-consumer` is declared missing, and empty harvest anchors route active selection to `the-claim` | **FAIL** — the manifest has no suppression or refrain vocabulary for drones, playbooks, and relay chains | **N/A** — rejected before a bench-grade run | **NOT RUN** — generic survival would not prove that Signal stays unavailable | **DATA-GAP** — socket suppression and its machine-readable restrictions before admission |
| `e7-relay-rush` | **NO** — support gate rejects both seed names | **BLOCKED** — `interference-front-consumer` is declared missing, and empty harvest anchors route active selection to `the-claim` | **FAIL** — the manifest has no interference-front schedule, occupied area, or signal-muting action/view state | **N/A** — rejected before a bench-grade run | **NOT RUN** — generic waves cannot exercise the moving static wall | **DATA-GAP** — socket the deterministic front and derive its vocabulary before admission |

## FINDINGS

### F-ER01-E7-1 — Relay Valley's live Signal stack stops at the browser boundary

The browser builds `E7SignalSystem` from live beacon/turret positions and terrain line of sight, gates drone playbook replay on linked coverage, and stages `EchoBossSystem` by the literal Relay Valley id; `HeadlessContractSim` runs none of those consumers, while the derived manifest reports only `build_zones` and the contract declares no missing dependency. The attended fix master must add a deterministic Signal socket, agent-visible relay/playbook/drone vocabulary, and a simulation seam for Echo capture with its staging represented in data before admission; ER-01 must not bless the generic secure path as the same contract.

### F-ER01-E7-2 — Echo Canyon is an unavailable facade around a missing mirror

Echo Canyon declares `broadcast-mirror-consumer` missing for its next-wave corrupted playbook, and its empty harvest anchors make normal active selection boot `the-claim` instead. The manifest omits both the broadcast field and delayed mirror behavior. The attended fix master must make the contract selectable, implement the deterministic mirror consumer, and derive its observation/counter-play vocabulary before a headless run can represent the contract.

### F-ER01-E7-3 — Dead Band cannot express Signal being forbidden

Dead Band declares `signal-suppression-consumer` missing and says drones, playbooks, and relay chains do not operate, but its manifest contains only build zones and its empty harvest anchors route the browser to `the-claim`. The attended fix master must land a deterministic suppression owner plus explicit machine-readable restrictions or refrain semantics, then make the contract selectable; merely omitting Signal from a generic sim would not prove the rule is enforced.

### F-ER01-E7-4 — Relay Rush has no interference-front clock

Relay Rush declares `interference-front-consumer` missing for an event-driven wall that mutes everything it crosses, while the mechanics manifest exposes no schedule, position, affected systems, or response and empty harvest anchors prevent a direct boot. The attended fix master must make the map selectable and socket the front through deterministic time/state plus consumer-derived view/action vocabulary before admission; fixed generic waves are not a substitute for the moving hazard.
