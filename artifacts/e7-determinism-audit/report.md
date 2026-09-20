# E7 PB-00 determinism audit

- Audit date: 2026-07-17
- Audited base: `f1a4b5a3`
- Scope: production simulation paths under `src/systems/`, `src/game/`, `src/entities/`, and `src/world/`; UI, town, and diagnostic-only implementation were excluded from the static sweep.
- Replay proof: bare `?debug&determinism&seed=<seed>` (the harness adds its own `nolevel` guard), 600 simulated seconds / 18,000 fixed ticks per run.

## Sweep evidence

The audit combined broad searches with call-site tracing instead of treating every textual match as a defect:

| Search family | Candidates reviewed | Result |
| --- | ---: | --- |
| `Date.now`, `new Date`, `performance.now`, `Math.random`, `crypto.randomUUID` | 54 | Wall-clock uses were storage, score, telemetry, or performance bookkeeping. Random economy-event identifiers remain the one replay-representation risk. |
| `.sort(` | 22 | One sim comparator lacked a total tie-break; one asset-glob collection relied on object enumeration. Both were fixed. Other sim comparators are total, or the sort is presentation/test-only. |
| Explicit `Map`/`Set`/`Object` iteration | 64 | Outcome-reaching cases were traced through construction and snapshot/restore order. PowerGraph is explicitly canonical; Harvest and boss component maps preserve deterministic insertion order for identical state. |
| Delta use and accumulation | 248 references; 16 focused accumulators | The live sim receives the fixed step. Float accumulators are flagged below per scope; frame delta remains confined to presentation/performance state. |

## Classified findings

| ID | File:line | Pattern | Class | Disposition |
| --- | --- | --- | --- | --- |
| D-01 | `src/game/Upgrades.ts:306-320` | `import.meta.glob` results reached the seeded weighted upgrade pool through `Object.values`, leaving crafted-card order dependent on module-object enumeration. | SIM-CRITICAL | **Fixed:** enumerate sorted paths before building the pool. |
| D-02 | `src/systems/BuildSystem.ts:560-591` | Palisade detour candidates sorted only by floating path length; exact ties inherited candidate insertion order and could choose a different waypoint. | SIM-CRITICAL | **Fixed:** total order by path length, target id, x, then z. |
| D-03 | `src/game/Game.ts:610,972,1280-1289,2592,2979,4690,4985,5180-5199`; `src/systems/BuildSystem.ts:792,1093,1131,1175,1968`; `src/systems/PressureSystem.ts:97,186`; `src/systems/HarvestSystem.ts:531-535`; `src/entities/Sluice.ts:456-459` | Economy events receive random UUIDs; the two fallbacks also call `Math.random`/`Date.now`. Reducer outcomes and ordering do not read `id` (`src/game/Economy.ts:73-99,215-238`), and the future-state hash strips it (`src/game/RunSuspend.ts:400-405`), so semantic replay is stable while raw event-log bytes are not. | SIM-CRITICAL | **Deferred:** replace cross-system UUID creation with one Economy-owned deterministic event sequence/source id before any playbook format promises byte-identical raw logs. This is a multi-owner change over 20 lines. Do not consume gameplay RNG merely to mint ids. |
| D-04 | `src/game/Game.ts:1035,1081`; `src/game/SaveSlots.ts:112,141,279,337`; `src/game/ProfileTransfer.ts:56,176,220,314,342`; `src/game/ProfileStorage.ts:92-313,416`; `src/game/AccountSync.ts:160-543`; `src/game/RunSuspend.ts:311,458,528,1218,2682` | Wall time/randomness timestamps score, storage, import/export, sync suppression, and save envelopes. None feeds an active sim decision or replay hash. | RENDER-ONLY | No sim fix. Treat this class as out-of-sim presentation/persistence metadata. |
| D-05 | `src/systems/PowerGraph.ts:386-420,505-565` | Maps/sets participate in graph construction, traversal, allocation, and shed ordering. | SIM-CRITICAL | Cleared: definitions, wires, neighbor lists, component walks, and equal-priority consumers are canonically id-sorted before outcomes. |
| D-06 | `src/systems/HarvestSystem.ts:136-176,403-443`; `src/systems/LandYachtBossSystem.ts:223-282,367-375`; `src/game/Economy.ts:184-199` | Map iteration reaches channel snapshots, component centroid sums, and cap summation. | SIM-CRITICAL | Flagged, not defective for identical-state replay: channels are captured/restored in actor insertion order; live boss components come from stable enemy-pool order; cap values are deterministic amounts. Canonical id sorting would be prudent if any producer later becomes concurrent or unordered. |
| D-07 | `src/world/DustFlatsTile.ts:92-98` | Distance-only sort has no id tie-break. | TEST-ONLY | No production caller exists in the repository; left unchanged under the firewall. Add an id tie-break when `gradeRoadAt` becomes a live sim verb. |
| D-08 | `src/game/Game.ts:4516`; `src/game/Scoreboard.ts:29,73`; `src/game/SaveSlots.ts:312`; `src/game/Game.ts:3396,4075` | Partial ties or numeric sorts select world-info labels, score/save rows, or percentile samples. | RENDER-ONLY | No sim fix. None reaches game-state outcomes. |
| D-09 | `src/systems/PowerGraph.ts:914-915`; `src/game/RunSuspend.ts:2991-2992` | `performance.now`/`Date.now` measure solve/serialization cost. | TEST-ONLY | No sim fix. Values only populate diagnostic/budget telemetry and are absent from semantic future state. |
| D-10 | `src/game/Game.ts:655-661,1663-1864,1866-1880` | Potential render-delta leak into simulation. | SIM-CRITICAL | Cleared: `Loop` calls `update` with the fixed 1/30 step; `present` owns `presentationDeltaSeconds`. Water, actor presentation, VFX/UI, and frame profiling remain presentation-only. |
| D-11 | `src/game/Game.ts:1691,1757-1761`; `src/systems/FuelSystem.ts:45-50`; `src/systems/PressureArsenalSystem.ts:68-75`; `src/systems/PressureSystem.ts:80-103`; `src/systems/CombatSystem.ts:372-386,529-548`; `src/entities/Enemy.ts:970-1004,1044-1047`; `src/systems/LandYachtBossSystem.ts:279-294` | Floating-point timers, progress, and distance accumulate/subtract repeatedly. | SIM-CRITICAL | **Deferred/flag only as required:** fixed tick count and operation order make the current JS-runtime result repeatable, but cross-runtime bit identity and regrouped/chunked replay are not proven. A larger future design should represent tick schedules as integer tick indices and quantize persisted distance/progress where exact cross-runtime parity is required. |
| D-12 | `src/world/Water.ts:236`; `src/entities/pools.ts:672`; `src/systems/FreedWalkerVfx.ts:217`; `src/systems/Vfx.ts:107`; `src/systems/MothSwarm.ts:75`; `src/game/Game.ts:1870,4070` | Frame-driven visual/performance accumulators. | RENDER-ONLY | No sim fix. These values drive shaders, animation/VFX, or profiler sampling only. |

## Harness hardening

The old report hashed only an economy summary/log length plus suspend future state; its per-tick entity timeline was compared by the e2e test but was not independently fingerprinted and omitted kills/gold. It also silently stopped active simulation at the first level-up when invoked as bare `?debug&determinism`, so an 18,000-callback report could cover only about 70 seconds of live sim.

The harness now:

1. forces `nolevel` before reset so all 600 seconds remain active;
2. records kills and current gold beside wave and entity counts on every tick;
3. emits `simHash` over the stable-stringified 18,000-entry timeline; and
4. caps the probe at 12 live enemies. Without this correctness-probe cap, 600 active seconds run as one multi-minute synchronous browser task and Chrome terminates the unresponsive renderer before a report exists. The bounded scenario still exercises 20 waves, combat, kills, pickups, economy, and suspend capture; stress capacity remains the perf harnesses' job.

## 3 seeds x 2 runs

All runs used a fresh Chrome process and the bare harness entry `?debug&determinism&seed=<seed>`. Each run completed 600 simulated seconds / 18,000 fixed ticks. Hashes shown without the common `fnv1a32:` prefix:

| Seed | Run | Ticks | Sim hash | Economy hash | Future-state hash | Final wave / kills / gold | Final entities (enemy / bolt / blast / pickup / XP) | Errors |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- |
| `e7-alpha` | A | 18,000 | `4355c89a` | `0f6f2150` | `76f0b9c0` | 20 / 202 / 30 | 11 / 0 / 0 / 0 / 34 | 0 |
| `e7-alpha` | B | 18,000 | `4355c89a` | `0f6f2150` | `76f0b9c0` | 20 / 202 / 30 | 11 / 0 / 0 / 0 / 34 | 0 |
| `e7-bravo` | A | 18,000 | `bb0285a9` | `0f6f2150` | `4e3ff4ac` | 20 / 199 / 30 | 12 / 0 / 0 / 0 / 26 | 0 |
| `e7-bravo` | B | 18,000 | `bb0285a9` | `0f6f2150` | `4e3ff4ac` | 20 / 199 / 30 | 12 / 0 / 0 / 0 / 26 | 0 |
| `e7-charlie` | A | 18,000 | `0d602af4` | `0f6f2150` | `21817049` | 20 / 201 / 30 | 12 / 0 / 0 / 0 / 32 | 0 |
| `e7-charlie` | B | 18,000 | `0d602af4` | `0f6f2150` | `21817049` | 20 / 201 / 30 | 12 / 0 / 0 / 0 / 32 | 0 |

Result: **3/3 seed pairs matched all hashes and final counters; 6/6 runs passed with zero console errors, page errors, or renderer crashes.**

## Fixed versus deferred

Fixed:

- canonical crafted-upgrade file order;
- total palisade detour ordering;
- full-horizon harness activation and bounded probe workload; and
- per-tick kills/gold/wave/entity fingerprinting.

Deferred:

- Economy event ids are semantically inert but not byte-deterministic; centralize deterministic ids before raw event logs become a replay contract.
- Float accumulators remain same-runtime/fixed-tick deterministic, not proven portable across runtimes or alternate replay chunking.
- Currently stable Map insertion dependencies should be canonicalized if their producers become unordered.

## Gates

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS — 1,276 modules, production bundle built |
| Bare-query determinism matrix | PASS — 6/6 runs, 108,000 total fixed ticks, zero errors |
| `task-025-bandits-dont-swim`, desktop + mobile | PASS — 10/10 |
| `e4-landyacht-boss`, desktop + mobile | PASS — 4/4 |
| Extra legacy check: `054-baron-epic`, desktop + mobile | 18/20; the same stale HP expectation failed on both projects. Manifest `assets/contracts/epoch-1-frontier/contracts.json:270` specifies `hpScale: 240`, while the unmodified test at `e2e/054-baron-epic.spec.ts:184` still computes with `160`; runtime/expected ratio is exactly 1.5. No audited implementation path touches Baron HP, and all other Baron tests passed. Reported, not papered over. |

## Verdict

**Yes for same-build semantic replay, with a firm representation boundary.** The fixed-step sim, seeded outcome paths, semantic economy state, wave/combat counters, entity populations, and suspend future state matched across all three A/B seed pairs for 108,000 total ticks, so the substrate is ready for a narrow PB-01 record/replay pilot. It is **not** ready to promise byte-identical raw event logs until economy UUIDs become deterministic, and cross-runtime bit portability remains unproven while time/progress/distance use repeated floating-point accumulation. Playbook validation should therefore hash normalized semantic events/state, not raw UUID-bearing log bytes, until the deferred id fix lands.
