# E3 READINESS CENSUS — Voltage before the owner's ride

Measured 2026-08-05 against all four board contracts in `epoch-3-voltage`. Training/drill maps are excluded by the ratified ER-01 default. No contract is admitted: each depends on a Voltage-era system that the browser boots but `HeadlessContractSim` does not. The naive evidence below comes from temporary forced generic GR-SIM diagnostics at Trail with `--policy=idle`; those hashes characterize the fallback only and are not acceptance pins.

## EXECUTIVE SUMMARY

- **AGENT-READY: 0 of 4.**
- **DATA-GAP: 4 of 4** — every contract is rejected under AP-11 because its defining power, night/light, moth, crawler, or fairground system lacks a headless consumer and consumer-derived action vocabulary.
- **BROKEN: 0** — all contract data loads; the gap is the absent era socket, not malformed data.
- The partial manifest exposes generic geography, fixtures, and Canyon Works' Baron/darkness declarations, but none of the four contracts exposes its declared `powerGrid`, `mothSeason`, `dayNightCycle`, or `fairground` source. Canyon Works declares the unrelated missing elevation advisory dependency; Fairground honestly declares its missing crowd-flock consumer. Blackout Ridge and Moth Season have live browser consumers, so their absent `engineDependencies` entries are not contract-data honesty violations.
- All four contracts have two pinned diagnostic seeds. The focused spec exercises all eight default boots, asserts rejection plus the exact declared-but-unrepresented twist sources, and passed across desktop and mobile with zero captured `console.error`/`console.warn` output.

## CENSUS

| Contract | Admitted? | Boots? | Verbs? | Determinism? | Naive Trail outcome | Verdict + reason |
|---|---|---|---|---|---|---|
| `e3-blackout-ridge` | **NO** — support gate rejects both seeds | **BLOCKED** — no headless power graph or locked-night consumer | **FAIL** — `powerGrid` and `dayNightCycle` are absent from the manifest; five fixtures expose no operations | **N/A** — rejected before a bench-grade run | Forced generic diagnostic: `01` died wave 4, 0 calls, `fnv1a32:a8923a42`;<br>`02` died wave 4, 0 calls, `fnv1a32:03a854ca` | **DATA-GAP** — the Voltage socket must make current and night observable/actionable before admission |
| `e3-moth-season` | **NO** — support gate rejects both seeds | **BLOCKED** — no headless moth/light or locked-night consumer | **FAIL** — `mothSeason` and `dayNightCycle` are absent from the manifest | **N/A** — rejected before a bench-grade run | Forced generic diagnostic: `01` died wave 6, 0 calls, `fnv1a32:303099f3`;<br>`02` died wave 5, 0 calls, `fnv1a32:7e7c57d7` | **DATA-GAP** — the defining light-choice mechanic is invisible to GR-SIM |
| `e3-canyon-works` | **NO** — default support gate rejects both seeds | **BLOCKED** — generic Baron data exists, but power, moth/light, tram, and Crawler power effects do not run headlessly | **FAIL** — geography, darkness, and Baron rules are visible; `powerGrid`, `mothSeason`, and `dayNightCycle` consumers/actions are not | **N/A** — rejected before a bench-grade run | Forced generic diagnostic: `01` died wave 3, 0 calls, `fnv1a32:3ddb0f4b`;<br>`02` died wave 3, 0 calls, `fnv1a32:63c9b3d6` | **DATA-GAP** — the generic component-boss path is not the Canyon Works Voltage contract |
| `e3-fairground` | **NO** — support gate rejects both seeds | **BLOCKED** — no headless Fair Wheel/power consumer, and the crowd objective is missing in the browser too | **FAIL** — `fairground`, `powerGrid`, and `dayNightCycle` are absent from the manifest; `fairground-crowd-flock-consumer` is declared missing | **N/A** — rejected before a bench-grade run | Forced generic diagnostic: `01` died wave 2, 0 calls, `fnv1a32:c8d40661`;<br>`02` died wave 2, 0 calls, `fnv1a32:322da081` | **DATA-GAP** — admission needs both the era socket and the declared crowd consumer |

## FINDINGS

### F-ER01-E3-1 — Blackout Ridge has no agent-visible current

The browser constructs `PowerGraphSystem` from `twist.powerGrid` and samples the locked `dayNightCycle`, while `HeadlessContractSim` runs neither system. The derived manifest therefore advertises only build zones plus operation-less sentry/lantern fixtures, not the current that defines the contract. The attended fix master must add a deterministic Voltage socket and consumer-derived power/light vocabulary with real agent actions before Blackout Ridge enters `SUPPORTED_CONTRACTS`.

### F-ER01-E3-2 — Moth Season's light choice disappears headlessly

The browser runs `MothSwarm` against live light sources under the locked night cycle; GR-SIM runs neither the swarm behavior nor the light-state consumer. The manifest consequently exposes only generic build zones, so an agent cannot observe or choose the decoy-versus-radius trade the contract is about. The attended fix master must socket those production rules and derive their vocabulary/actions rather than treating generic combat as Moth Season.

### F-ER01-E3-3 — Canyon Works' generic boss path omits the Voltage contract

The shared component-Baron machinery can represent a grouped kill, but the browser's Canyon Works also runs `PowerGraphSystem`, `MothSwarm`, the tram, and `CrawlerBossSystem` power effects; GR-SIM runs none of those contract-defining consumers. Its partial manifest names darkness and the Baron but offers no power/moth action path. The attended fix master must compose the Voltage socket with the Crawler/tram objective before deciding whether the existing generic boss driver can be reused.

### F-ER01-E3-4 — Fairground has two independent missing consumers

The browser mounts the Fair Wheel into `PowerGraphSystem`, but GR-SIM has neither system, while `engineDependencies` separately declares that the advertised crowd-flock escort objective has no consumer at all. The attended fix master must keep those gaps separate: socket deterministic wheel/current behavior for agents, and author the missing crowd objective on its own governed surface before Fairground can be admitted.
