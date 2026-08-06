# E2 READINESS CENSUS — Steamworks before the owner's ride

> **F-SEED-1 CORRECTION — 2026-08-06.** The headless front door now runs the browser's hero progression and deterministic first-offer upgrades. Both pinned seeds were rerun twice in the naive and mechanical arms. All pairs remained deterministic. Pressure Garden's naive losses moved from waves `1/1` to `4/2`; Incline seed `02` moved from wave `2` to `3`; Hill Mine and Trestle still cross the naive wave-14 ceiling. Every mechanical hash moved, and Hill Mine seed `02` now secures at wave `14`, not its declared wave `12`, so the unchanged focused spec honestly reports that one corrected stale row in both projects (`6/8` green). The table below is the corrected census; the dated finding history remains for provenance.

Measured 2026-08-05 against all four board contracts in `epoch-2-steamworks`. Training/drill maps are excluded by the ratified ER-01 default. The naive arm uses GR-SIM's default Trail balance with `--policy=idle`; the mechanical-completion arm preserves Trail enemy rules but gives the hero high HP and rig damage to isolate each admitted contract's generic secure path. Exact hashes are evidence, not permanent balance pins. Forced diagnostic runs were used to characterize rejected contracts, but their hashes are not acceptance pins.

## EXECUTIVE SUMMARY

- **AGENT-READY: 2 of 4** — Pressure Garden and Incline boot clean, expose their declared mechanics, terminate under the naive policy, and secure under the deterministic mechanical probe.
- **DATA-GAP: 2 of 4** — Hill Mine and Trestle are admitted but cross GR-SIM's wave-14 ceiling at wave 15 without emitting `secured` or `died`; Hill Mine seed `02` also misses its declared mechanical secure wave after progression parity. Hill Mine's pressure socket is no longer the blocker.
- **BROKEN: 0** — no loader failure or malformed contract data.
- All four contracts declare `engineDependencies[{ status: "missing" }]` for their unconsumed elevation advisory fields. All four derived manifests declare zero interactable operations. The pressure contracts additionally derive the existing `BUILD boiler_house` grammar lever plus four pressure rules: generation, bands, auto-vent, and powered consumers. No new operation was invented.
- Each corrected mechanical-completion hash below matched on two consecutive runs for both pinned seeds. The pressure pair placed two real boiler houses, harvested coal, and vented four times per run, proving the hash across `crypto.randomUUID()` economy events. The unchanged focused spec is green for six contract/project rows; its two Hill Mine rows both expose the same stale wave-12 expectation recorded above.

## CENSUS

| Contract | Admitted? | Boots? | Verbs? | Determinism? | Naive Trail outcome | Verdict + reason |
|---|---|---|---|---|---|---|
| `e2-hill-mine` | **YES** | **PASS** — clean headless VIEW runs the production pressure consumer | **PASS** — 7/7 grammar forms; `BUILD boiler_house`; 4 pressure rules; 0 new interactable ops | **PAIR-STABLE / TARGET MISS** — `01 fnv1a32:0e45917a`, secured wave 12; `02 fnv1a32:c6efd039`, secured wave 14; each matched twice and vented 4 times | `01`, `02`: **NO TERMINAL OUTCOME** — idle submitted 0 calls; both reached wave 15 and tripped ceiling 14 | **DATA-GAP** — pressure is cured; the bounded-horizon gap remains, and seed `02` misses the declared mechanical secure wave |
| `e2-trestle` | **YES** | **PASS** — clean headless VIEW; dependency declared | **PASS** — 7/7 grammar forms; 0 interactable ops | **PASS** — `01 fnv1a32:3be1f60f`; `02 fnv1a32:7a0d1b37`; each matched twice and secured wave 12 | `01`, `02`: **NO TERMINAL OUTCOME** — idle submitted 0 calls; both reached wave 15 and tripped ceiling 14 | **DATA-GAP** — admission and secure path work, but the naive run cannot report `secured`/`died` |
| `e2-pressure-garden` | **YES** | **PASS** — clean headless VIEW runs the production pressure consumer | **PASS** — 7/7 grammar forms; `BUILD boiler_house`; 4 pressure rules; 0 new interactable ops | **PASS** — `01 fnv1a32:01f5a342`; `02 fnv1a32:cd2d6327`; each matched twice, vented 4 times, and secured wave 12 | `01`: **died**, wave 4, 0 calls, `fnv1a32:25f06727`;<br>`02`: **died**, wave 2, 0 calls, `fnv1a32:325d4e9c` | **AGENT-READY** — terminal, deterministic, pressure-visible, and mechanically completable |
| `e2-incline` | **YES** | **PASS** — clean headless VIEW; dependency declared | **PASS** — 7/7 grammar forms; 0 interactable ops | **PASS** — `01 fnv1a32:cacc3aff`; `02 fnv1a32:29defba7`; each matched twice and secured wave 12 | `01`: **died**, wave 2, 0 calls, `fnv1a32:7e6c3132`<br>`02`: **died**, wave 3, 0 calls, `fnv1a32:353a8c68` | **AGENT-READY** — terminal, deterministic, and mechanically completable; the idle loss is a baseline result, not a boot gap |

## FINDINGS

### ✅ CURED — F-ER01-1 — Hill Mine is not cleanly admissible

Hill Mine sets `twist.pressureEnabled: true`, but the derived mechanics manifest advertises no pressure rule or operation and `HeadlessContractSim` has no pressure consumer, so ER-01 leaves the contract outside `SUPPORTED_CONTRACTS`. A forced generic diagnostic also neither killed the component boss nor died on either seed, reaching wave 15 beyond the declared-wave-plus-two ceiling. The attended fix master must first add consumer-derived pressure vocabulary and a real agent/headless action path, then decide whether the remaining terminal gap needs a defeat path, a balance/content change, or a deliberately wider bounded horizon.

**CURE (2026-08-05):** `HeadlessContractSim` now admits Hill Mine and runs the production `PressureSystem` in browser tick order. Its manifest derives `BUILD boiler_house`, exact band/vent/generation rules, and the pressure-powered consumers. Both pinned mechanical probes secured deterministically through four real vent events. The original paragraph is retained above; only its pressure blocker is retired. The already-separated terminal-outcome remedy remains out of scope.

### F-ER01-2 — Trestle's naive run has no terminal outcome

Both pinned Trestle seeds boot clean and the isolated mechanical probe defeats the declared Railcar and secures at wave 12, but the unassisted Trail run neither kills the component boss nor dies: both executions advance to wave 15 and GR-SIM refuses them at its declared-wave-plus-two ceiling without an outcome row. The attended fix master should determine whether the contract needs a terminal defeat path, a balance/content change, or a deliberately wider bounded horizon; ER-01 does not choose or implement that remedy.

### ✅ CURED — F-ER01-3 — Pressure Garden's named mechanic is invisible to the agent

Pressure Garden sets `twist.pressureEnabled: true`, and the browser consumes it through `PressureSystem`, but the derived mechanics manifest advertises no pressure rule or operation and `HeadlessContractSim` does not run that system. ER-01 therefore leaves it outside `SUPPORTED_CONTRACTS`. Under AP-11's reject-don't-stretch law, the attended fix master must add consumer-derived pressure vocabulary plus a real agent/headless action path; ER-01 records the gap instead of treating seven unrelated standing-order forms as coverage.

**CURE (2026-08-05):** Pressure Garden is admitted through the same production-system socket as Hill Mine. Both pinned mechanical probes secured with pair-stable hashes through four vents, while the unchanged idle probes still die cleanly at wave 1. The manifest exposes the existing boiler-house build lever and complete pressure rules without minting a new operation.
