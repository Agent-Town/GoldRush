# E2 READINESS CENSUS — Steamworks before the owner's ride

Measured 2026-08-05 against all four board contracts in `epoch-2-steamworks`. Training/drill maps are excluded by the ratified ER-01 default. The naive arm uses GR-SIM's default Trail balance with `--policy=idle`; the mechanical-completion arm preserves Trail enemy rules but gives the hero high HP and rig damage to isolate each admitted contract's generic secure path. Exact hashes are evidence, not permanent balance pins. Forced diagnostic runs were used to characterize rejected contracts, but their hashes are not acceptance pins.

## EXECUTIVE SUMMARY

- **AGENT-READY: 1 of 4** — Incline boots clean, exposes its declared mechanics, terminates under the naive policy, and secures under the deterministic mechanical probe.
- **DATA-GAP: 3 of 4** — Hill Mine and Pressure Garden are not admitted because their live pressure mechanic has neither manifest vocabulary nor a headless consumer; Trestle is admitted but crosses GR-SIM's wave-14 ceiling at wave 15 without emitting `secured` or `died`.
- **BROKEN: 0** — no loader failure or malformed contract data.
- All four contracts declare `engineDependencies[{ status: "missing" }]` for their unconsumed elevation advisory fields. All four derived manifests declare zero interactable operations. The seven current standing-order grammar forms respond on both admitted contracts; the zero-operation result blocks admission for the two pressure-enabled contracts rather than pretending their vocabulary is complete.
- Each admitted mechanical-completion hash below matched on two consecutive runs. Both pinned seeds were exercised for Trestle and Incline; forced diagnostic runs covered both rejected contracts. The focused spec passed 8/8 across desktop and mobile projects, including explicit rejection checks, with zero captured `console.error`/`console.warn` output.

## CENSUS

| Contract | Admitted? | Boots? | Verbs? | Determinism? | Naive Trail outcome | Verdict + reason |
|---|---|---|---|---|---|---|
| `e2-hill-mine` | **NO** — support gate rejects it | **BLOCKED** — pressure is a defining live mechanic with no clean headless boot | **FAIL** — pressure has no manifest vocabulary or headless action path | **N/A** — rejected before a bench-grade run | Forced diagnostic only: `01`, `02` submitted 0 calls, reached wave 15, and tripped ceiling 14 without a terminal result | **DATA-GAP** — reject-don't-stretch: pressure must be modeled before admission |
| `e2-trestle` | **YES** | **PASS** — clean headless VIEW; dependency declared | **PASS** — 7/7 grammar forms; 0 interactable ops | **PASS** — `01 fnv1a32:1ab360af`; `02 fnv1a32:3b047f7b`; each matched twice and secured wave 12 | `01`, `02`: **NO TERMINAL OUTCOME** — idle submitted 0 calls; both reached wave 15 and tripped ceiling 14 | **DATA-GAP** — admission and secure path work, but the naive run cannot report `secured`/`died` |
| `e2-pressure-garden` | **NO** — support gate rejects it | **BLOCKED** — pressure is the contract's named live mechanic with no clean headless boot | **FAIL** — pressure has no manifest vocabulary or headless action path | **N/A** — rejected before a bench-grade run | Forced diagnostic only: `01` died wave 1, 0 calls, `fnv1a32:9c1a4fb6`;<br>`02` died wave 1, 0 calls, `fnv1a32:f786b543` | **DATA-GAP** — reject-don't-stretch: pressure must be modeled before admission |
| `e2-incline` | **YES** | **PASS** — clean headless VIEW; dependency declared | **PASS** — 7/7 grammar forms; 0 interactable ops | **PASS** — `01 fnv1a32:f274d0e6`; `02 fnv1a32:912feb04`; each matched twice and secured wave 12 | `01`: **died**, wave 2, 0 calls, `fnv1a32:7e6c3132`<br>`02`: **died**, wave 2, 0 calls, `fnv1a32:98fa0793` | **AGENT-READY** — terminal, deterministic, and mechanically completable; the idle loss is a baseline result, not a boot gap |

## FINDINGS

### F-ER01-1 — Hill Mine is not cleanly admissible

Hill Mine sets `twist.pressureEnabled: true`, but the derived mechanics manifest advertises no pressure rule or operation and `HeadlessContractSim` has no pressure consumer, so ER-01 leaves the contract outside `SUPPORTED_CONTRACTS`. A forced generic diagnostic also neither killed the component boss nor died on either seed, reaching wave 15 beyond the declared-wave-plus-two ceiling. The attended fix master must first add consumer-derived pressure vocabulary and a real agent/headless action path, then decide whether the remaining terminal gap needs a defeat path, a balance/content change, or a deliberately wider bounded horizon.

### F-ER01-2 — Trestle's naive run has no terminal outcome

Both pinned Trestle seeds boot clean and the isolated mechanical probe defeats the declared Railcar and secures at wave 12, but the unassisted Trail run neither kills the component boss nor dies: both executions advance to wave 15 and GR-SIM refuses them at its declared-wave-plus-two ceiling without an outcome row. The attended fix master should determine whether the contract needs a terminal defeat path, a balance/content change, or a deliberately wider bounded horizon; ER-01 does not choose or implement that remedy.

### F-ER01-3 — Pressure Garden's named mechanic is invisible to the agent

Pressure Garden sets `twist.pressureEnabled: true`, and the browser consumes it through `PressureSystem`, but the derived mechanics manifest advertises no pressure rule or operation and `HeadlessContractSim` does not run that system. ER-01 therefore leaves it outside `SUPPORTED_CONTRACTS`. Under AP-11's reject-don't-stretch law, the attended fix master must add consumer-derived pressure vocabulary plus a real agent/headless action path; ER-01 records the gap instead of treating seven unrelated standing-order forms as coverage.
