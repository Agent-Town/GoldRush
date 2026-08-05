# E3 READINESS CENSUS — Voltage before the owner's ride

Measured 2026-08-05 against all four board contracts in `epoch-3-voltage`, then re-measured 2026-08-06 for the Blackout Ridge Voltage socket. Training/drill maps are excluded by the ratified ER-01 default. Blackout Ridge is now admitted through its production `PowerGraphSystem` plus locked `DayNightCycle`; the other three contracts remain rejected because their defining consumers are still absent. Their naive evidence below comes from temporary forced generic GR-SIM diagnostics at Trail with `--policy=idle`; those hashes characterize the fallback only and are not acceptance pins.

## EXECUTIVE SUMMARY

- **AGENT-READY: 1 of 4** — Blackout Ridge runs deterministic current plus locked night and derives its honest BUILD/repair vocabulary.
- **DATA-GAP: 3 of 4** — Moth Season, Canyon Works, and Fairground remain rejected under AP-11 because their defining moth, crawler/tram, fairground, or light consumers lack a complete headless socket and consumer-derived action vocabulary.
- **BROKEN: 0** — all contract data loads; the gap is the absent era socket, not malformed data.
- Blackout Ridge now exposes capacitor BUILD plus current allocation, pylon/repair, storage, and locked-night rules. The partial manifests for the other three still expose generic geography, fixtures, and Canyon Works' Baron/darkness declarations without minting their absent `mothSeason`, incomplete `powerGrid`, or `fairground` consumers. Canyon Works declares the unrelated missing elevation advisory dependency; Fairground honestly declares its missing crowd-flock consumer.
- All four contracts have two pinned diagnostic seeds. The focused spec executes two complete Blackout Ridge runs per seed, compares event-log hashes, and keeps the other three contracts rejected on their exact declared-but-unrepresented twist sources; it passed all eight desktop/mobile cases with zero captured `console.error`/`console.warn` output.

## CENSUS

| Contract | Admitted? | Boots? | Verbs? | Determinism? | Headless evidence | Verdict + reason |
|---|---|---|---|---|---|---|
| `e3-blackout-ridge` | **YES** — both pinned seeds pass the support gate | **PASS** — production power graph steps after build/pressure; locked night is sampled after the sim tick | **PASS** — capacitor `BUILD` plus current allocation, pylon/repair, storage, and locked-night rules; zero invented operations | **PASS** — consecutive pairs match per seed | Socketed acceptance run: `01` secured wave 12, 0 calls, `fnv1a32:93a23d11`;<br>`02` secured wave 12, 0 calls, `fnv1a32:0d25ac43` | **AGENT-READY** — current and permanent darkness are observable, the real build/repair levers are declared, and both seeded runs are deterministic |
| `e3-moth-season` | **NO** — support gate rejects both seeds | **BLOCKED** — no headless moth/light or locked-night consumer | **FAIL** — `mothSeason` and `dayNightCycle` are absent from the manifest | **N/A** — rejected before a bench-grade run | Forced generic diagnostic: `01` died wave 6, 0 calls, `fnv1a32:303099f3`;<br>`02` died wave 5, 0 calls, `fnv1a32:7e7c57d7` | **DATA-GAP** — the defining light-choice mechanic is invisible to GR-SIM |
| `e3-canyon-works` | **NO** — default support gate rejects both seeds | **BLOCKED** — generic Baron data exists, but power, moth/light, tram, and Crawler power effects do not run headlessly | **FAIL** — geography, darkness, and Baron rules are visible; `powerGrid`, `mothSeason`, and `dayNightCycle` consumers/actions are not | **N/A** — rejected before a bench-grade run | Forced generic diagnostic: `01` died wave 3, 0 calls, `fnv1a32:3ddb0f4b`;<br>`02` died wave 3, 0 calls, `fnv1a32:63c9b3d6` | **DATA-GAP** — the generic component-boss path is not the Canyon Works Voltage contract |
| `e3-fairground` | **NO** — support gate rejects both seeds | **BLOCKED** — no headless Fair Wheel/power consumer, and the crowd objective is missing in the browser too | **FAIL** — `fairground`, `powerGrid`, and `dayNightCycle` are absent from the manifest; `fairground-crowd-flock-consumer` is declared missing | **N/A** — rejected before a bench-grade run | Forced generic diagnostic: `01` died wave 2, 0 calls, `fnv1a32:c8d40661`;<br>`02` died wave 2, 0 calls, `fnv1a32:322da081` | **DATA-GAP** — admission needs both the era socket and the declared crowd consumer |

## FINDINGS

### F-ER01-E3-1 — Blackout Ridge has no agent-visible current

**✅ CURED 2026-08-06 — Blackout Ridge is admitted with the production power/cycle socket, deterministic acceptance hashes, and consumer-derived vocabulary. Original finding retained verbatim below.**

> The browser constructs `PowerGraphSystem` from `twist.powerGrid` and samples the locked `dayNightCycle`, while `HeadlessContractSim` runs neither system. The derived manifest therefore advertises only build zones plus operation-less sentry/lantern fixtures, not the current that defines the contract. The attended fix master must add a deterministic Voltage socket and consumer-derived power/light vocabulary with real agent actions before Blackout Ridge enters `SUPPORTED_CONTRACTS`.

The cured manifest declares the existing `BUILD capacitor_bank` grammar, `REPAIR_UNDER` for authored trunk frames, deterministic allocation across intact wires and online nodes, the two 0.05 Wh stores, and the locked cycle's 0.645–0.86 darkness band. No new operation was added.

### F-ER01-E3-2 — Moth Season's light choice disappears headlessly

The browser runs `MothSwarm` against live light sources under the locked night cycle; GR-SIM runs neither the swarm behavior nor the light-state consumer. The manifest consequently exposes only generic build zones, so an agent cannot observe or choose the decoy-versus-radius trade the contract is about. The attended fix master must socket those production rules and derive their vocabulary/actions rather than treating generic combat as Moth Season.

### F-ER01-E3-3 — Canyon Works' generic boss path omits the Voltage contract

The shared component-Baron machinery can represent a grouped kill, but the browser's Canyon Works also runs `PowerGraphSystem`, `MothSwarm`, the tram, and `CrawlerBossSystem` power effects; GR-SIM runs none of those contract-defining consumers. Its partial manifest names darkness and the Baron but offers no power/moth action path. The attended fix master must compose the Voltage socket with the Crawler/tram objective before deciding whether the existing generic boss driver can be reused.

### F-ER01-E3-4 — Fairground has two independent missing consumers

The browser mounts the Fair Wheel into `PowerGraphSystem`, but GR-SIM has neither system, while `engineDependencies` separately declares that the advertised crowd-flock escort objective has no consumer at all. The attended fix master must keep those gaps separate: socket deterministic wheel/current behavior for agents, and author the missing crowd objective on its own governed surface before Fairground can be admitted.
