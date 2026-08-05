# E3 READINESS CENSUS — Voltage before the owner's ride

Measured 2026-08-05 against all four board contracts in `epoch-3-voltage`, then re-measured 2026-08-06 for the Blackout Ridge Voltage, Moth Season, Canyon Works environment, and Crawler sockets. Training/drill maps are excluded by the ratified ER-01 default. Blackout Ridge is admitted through its production `PowerGraphSystem` plus locked `DayNightCycle`; Moth Season is admitted through its production `MothSwarm`, `LightField`, and locked cycle. Canyon Works is admitted through those environment consumers plus the simulation half of `CrawlerBossSystem`. Fairground remains rejected because its complete defining consumers are still absent.

## EXECUTIVE SUMMARY

- **AGENT-READY: 3 of 4** — Blackout Ridge runs deterministic current plus locked night; Moth Season runs deterministic moth targeting plus live light state; Canyon Works composes those environment rules with the production Crawler act/drain/component simulation. All three use existing actions without invented operations.
- **DATA-GAP: 1 of 4** — Fairground remains rejected under AP-11 because its defining consumers lack a complete headless socket and consumer-derived action vocabulary.
- **BROKEN: 0** — all contract data loads; the gap is the absent era socket, not malformed data.
- Blackout Ridge exposes capacitor BUILD plus current allocation, pylon/repair, storage, and locked-night rules. Moth Season exposes lantern/decoy BUILD plus the exact target-score, light-scaled wave, attachment, and locked-night rules. Canyon Works exposes its monotonic full→dusk→dark wave schedule, one-way CONNECT latches, and Crawler act/drain/component diagnostics without inventing an operation. Fairground's partial manifest still avoids minting its incomplete `fairground` composition. Canyon Works declares the unrelated missing elevation advisory dependency; Fairground honestly declares its missing crowd-flock consumer.
- All four contracts have two pinned diagnostic seeds. The focused spec executes complete Blackout Ridge and Moth Season runs, steps Canyon Works through named environment/objective boundaries and the Crawler's three-act component ladder, compares deterministic event-log hashes, and keeps Fairground rejected on its exact declared-but-unrepresented twist sources.

## CENSUS

| Contract | Admitted? | Boots? | Verbs? | Determinism? | Headless evidence | Verdict + reason |
|---|---|---|---|---|---|---|
| `e3-blackout-ridge` | **YES** — both pinned seeds pass the support gate | **PASS** — production power graph steps after build/pressure; locked night is sampled after the sim tick | **PASS** — capacitor `BUILD` plus current allocation, pylon/repair, storage, and locked-night rules; zero invented operations | **PASS** — consecutive pairs match per seed | Socketed acceptance run: `01` secured wave 12, 0 calls, `fnv1a32:93a23d11`;<br>`02` secured wave 12, 0 calls, `fnv1a32:0d25ac43` | **AGENT-READY** — current and permanent darkness are observable, the real build/repair levers are declared, and both seeded runs are deterministic |
| `e3-moth-season` | **YES** — both pinned seeds pass the support gate | **PASS** — production moth targeting steps before enemy movement; the dimmed light field refreshes after the locked-cycle sample | **PASS** — lantern and decoy `BUILD` plus target-score, light-scaled wave, attachment, and locked-night rules; zero invented operations | **PASS** — consecutive pairs match per seed | Socketed acceptance run: `01` secured wave 12, 0 calls, `fnv1a32:b2cab51c`;<br>`02` secured wave 12, 0 calls, `fnv1a32:70da4a10` | **AGENT-READY** — the decoy-versus-radius choice and its light/moth cost are observable, actionable, and deterministic |
| `e3-canyon-works` | **YES** — the default support gate admits both pinned seeds | **PASS** — power, moth/light, wave-driven darkness, CONNECT, and the production Crawler simulation run headlessly; GLB state remains untouched | **PASS** — exact environment rules plus Crawler act, drain, burst, track-pin, overcharge, and destroyed-component state are visible with zero new operations | **PASS** — consecutive stepped Crawler runs match | Crawler acceptance pair reaches wave 14 and secures after the component ladder: `fnv1a32:f466d065`;<br>`fnv1a32:f466d065` | **AGENT-READY** — the contract-defining environment and Crawler behavior are observable, actionable through existing levers, and deterministic |
| `e3-fairground` | **NO** — support gate rejects both seeds | **BLOCKED** — no headless Fair Wheel/power consumer, and the crowd objective is missing in the browser too | **FAIL** — `fairground`, `powerGrid`, and `dayNightCycle` are absent from the manifest; `fairground-crowd-flock-consumer` is declared missing | **N/A** — rejected before a bench-grade run | Forced generic diagnostic: `01` died wave 2, 0 calls, `fnv1a32:c8d40661`;<br>`02` died wave 2, 0 calls, `fnv1a32:322da081` | **DATA-GAP** — admission needs both the era socket and the declared crowd consumer |

## FINDINGS

### F-ER01-E3-1 — Blackout Ridge has no agent-visible current

**✅ CURED 2026-08-06 — Blackout Ridge is admitted with the production power/cycle socket, deterministic acceptance hashes, and consumer-derived vocabulary. Original finding retained verbatim below.**

> The browser constructs `PowerGraphSystem` from `twist.powerGrid` and samples the locked `dayNightCycle`, while `HeadlessContractSim` runs neither system. The derived manifest therefore advertises only build zones plus operation-less sentry/lantern fixtures, not the current that defines the contract. The attended fix master must add a deterministic Voltage socket and consumer-derived power/light vocabulary with real agent actions before Blackout Ridge enters `SUPPORTED_CONTRACTS`.

The cured manifest declares the existing `BUILD capacitor_bank` grammar, `REPAIR_UNDER` for authored trunk frames, deterministic allocation across intact wires and online nodes, the two 0.05 Wh stores, and the locked cycle's 0.645–0.86 darkness band. No new operation was added.

### F-ER01-E3-2 — Moth Season's light choice disappears headlessly

**✅ CURED 2026-08-06 — Moth Season is admitted with the production swarm/light socket, deterministic acceptance hashes, and consumer-derived lantern/decoy vocabulary. Original finding retained verbatim below.**

> The browser runs `MothSwarm` against live light sources under the locked night cycle; GR-SIM runs neither the swarm behavior nor the light-state consumer. The manifest consequently exposes only generic build zones, so an agent cannot observe or choose the decoy-versus-radius trade the contract is about. The attended fix master must socket those production rules and derive their vocabulary/actions rather than treating generic combat as Moth Season.

The cured manifest declares the existing `BUILD lantern_post` and `BUILD decoy_shed` grammar, the exact coverage × radius × weight target score, the light-scaled per-wave count, attachment dimming/damage, and the locked cycle's 0.75–1 darkness band. No new operation was added.

### F-ER01-E3-3 — Canyon Works' generic boss path omits the Voltage contract

The shared component-Baron machinery can represent a grouped kill, but the browser's Canyon Works also runs `PowerGraphSystem`, `MothSwarm`, the tram, and `CrawlerBossSystem` power effects; GR-SIM runs none of those contract-defining consumers. Its partial manifest names darkness and the Baron but offers no power/moth action path. The attended fix master must compose the Voltage socket with the Crawler/tram objective before deciding whether the existing generic boss driver can be reused.

**🟡 NARROWED 2026-08-06 — the environment half is socketed, deterministic, and consumer-described; Canyon Works remains DATA-GAP only because the Crawler's power drain and component behavior are still render-coupled. Original finding retained verbatim above.**

GR-SIM now matches the browser's `waveSchedule` formula exactly: full before wave 4, a clamped linear dusk ramp through wave 8, and permanent darkness thereafter. CONNECT counts powered gallery consumers, completes only at or before wave 6, and latches failure forever after the deadline; the latch is visible through the state snapshot. No operation was added. `lightRamp` remains render-only under this contract configuration and is not present in `src/sim/`.

**✅ CURED 2026-08-06 — `CrawlerBossSystem.step()` now owns the deterministic act, burst, track-pin, and power-drain simulation while `syncPresentation()` owns GLB and scene work. Canyon Works is admitted at `AGENT-READY: 3 of 4`; the repeated, renderer-independent Crawler acceptance hash is `fnv1a32:f466d065`.**

The headless state exposes `crawler { act, bursts, drainActive, drainTarget, tracksPinned, overchargeRemaining, destroyed[] }`. The acceptance run steps directly to the boss wave, observes acts 1→2→3 and the live 18 W drain, kills all three production boss components through the combat event path, and proves `crawler3dState` never leaves its initial value. No operation or second boss driver was added.

### F-ER01-E3-4 — Fairground has two independent missing consumers

The browser mounts the Fair Wheel into `PowerGraphSystem`, but GR-SIM has neither system, while `engineDependencies` separately declares that the advertised crowd-flock escort objective has no consumer at all. The attended fix master must keep those gaps separate: socket deterministic wheel/current behavior for agents, and author the missing crowd objective on its own governed surface before Fairground can be admitted.
