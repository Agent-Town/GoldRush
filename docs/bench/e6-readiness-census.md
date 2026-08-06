# E6 READINESS CENSUS — Atomic before the owner's ride

Re-measured 2026-08-06 (`milk/twin-sockets`) after the Atomic era socket landed. The 2026-08-05 pass measured four contracts that could not boot; this pass measures four contracts that boot, run, and terminate — and it moves the blocker off the consumer and onto the agent's verb list. Training/drill maps are excluded by the ratified ER-01 default. The naive arm uses GR-SIM's default Trail balance with `--policy=idle` on the repo-pinned Node 26.4.0. Exact hashes are diagnostic evidence, not permanent balance pins.

## WHAT CHANGED SINCE 2026-08-05

`src/sim/AtomicSocket.ts` runs `WrangleSystem` — the epoch-wide consumer (`Game.ts:646` gates it on `contractEpoch?.id === 'epoch-6-atomic'`, which is why one absence blocked all four contracts) — headlessly, in the browser's tick order (`decay.tick → actors → e6TileConsumers → waveSystem → wrangle`), with all three of the browser's behavioural couplings: `CombatSystem.onEnemyDamaged` (`Game.ts:534`), the contact gate (`Game.ts:2606`), and the movement multiplier (`Game.ts:2614`). `E6TileConsumerSystem` is socketed alongside it for Glow Mesa. The manifest gained four consumer-derived wrangle rules on every Atomic contract, plus decay-field and night-vein rules on Glow Mesa.

**The socket works, and admitting on the strength of it would have been wrong.** See F-ER01-E6-5.

## EXECUTIVE SUMMARY

- **AGENT-READY: 0 of 4.** Unchanged as a count — but the reason is now a different, smaller, and much better-located thing.
- **DATA-GAP: 1 of 4.** Only `e6-picnic` still fails on its own data (three declared stakes, one implemented hold). Showroom and Half-Life Hollow no longer have a missing consumer at all.
- **BLOCKED-ON-AGENT-SURFACE: 4 of 4** — the new, dominant verdict. `WrangleSystem` now runs, and running it proves the Atomic loop cannot be closed by an agent: `AgentGameAdapter` has no capture verb, an exhausted machine can be neither damaged nor captured, and it still occupies a spawn slot.
- **BROKEN: 0.** All four load, accept all seven standing-order grammar forms, terminate deterministically, and emit no captured console warning/error.
- Determinism is now REAL for three of four: every measured run reproduced its `eventLogHash` byte-for-byte on a second run. It is not a bench pin, because none of these contracts is admitted.
- `e6-glow-mesa` cannot terminate at all: it declares a `homemaker_9000` baron at wave 8, `RunManager.autoSecureWaveForRun` withholds securing until that baron is beaten, and `HomemakerBossSystem` is not socketed — so the run overruns its own wave ceiling.

## CENSUS

Measured with both sockets live. Seeds are the two pinned in `bench-seeds.json`. "Repeat" is a second full run of the same seed.

| Contract | Admitted? | Boots? | Verbs? | Determinism? | Naive Trail outcome | Verdict + reason |
|---|---|---|---|---|---|---|
| `e6-glow-mesa` | **NO** — support gate rejects it | **YES** — wrangle + `E6TileConsumerSystem` both run headlessly | **FAIL** — 7/7 generic forms respond; wrangle, decay-field and night-vein vocabulary now derived, but no capture operation exists | **UNMEASURABLE** — the run never terminates | `01` and `02` both **overran the ceiling**: wave 15 > ceiling 14 (`secureWave` 12 + 2) | **BLOCKED — no reachable secure condition.** Its `homemaker_9000` baron gates securing and `HomemakerBossSystem` is unsocketed. Admitting it would pin a contract that provably cannot end |
| `e6-showroom` | **NO** — support gate rejects it | **YES** — wrangle runs; 60 exhaustion events per run | **FAIL** — wrangle vocabulary derived, but `tryCapture` has no agent verb | **YES** — `01` `fnv1a32:27f4b15e`, `02` `fnv1a32:84bc5a65`, both repeat IDENTICAL | `01` **secured**, wave 20, 82 kills; `02` **secured**, wave 20, 81 kills | **BLOCKED-ON-AGENT-SURFACE** — the secure is a false green (F-ER01-E6-5): from wave 6 all 60 living enemies are exhausted machines and no wave spawns again |
| `e6-half-life-hollow` | **NO** — support gate rejects it | **YES** — wrangle runs | **FAIL** — as Showroom, and its briefing's crossing claim is still unexpressed | **YES** — `01` `fnv1a32:ee30fe50`, `02` `fnv1a32:c4007b5b`, both repeat IDENTICAL | `01` **died**, wave 4, 63 kills; `02` **died**, wave 4, 64 kills | **BLOCKED-ON-AGENT-SURFACE + unreconciled claim** — wrangle is no longer the blocker; the unconsumed `hollow-extraction` stake is (F-ER01-E6-3) |
| `e6-picnic` | **NO** — support gate rejects it | **YES** — wrangle runs | **FAIL** — as Showroom; no three-stake hold semantics | **YES** — `01` `fnv1a32:fbc12243`, `02` `fnv1a32:a38ab6e9`, both repeat IDENTICAL | `01` **died**, wave 5, 79 kills; `02` **died**, wave 4, 59 kills | **DATA-GAP + BLOCKED-ON-AGENT-SURFACE** — three `heroStart` markers, one consumed; the objective is an owner design fork |

## FINDINGS

### F-ER01-E6-5 — Socketing wrangle proved the blocker is the agent's verb list, not the consumer (NEW)

This is the finding the socket was built to expose, and it inverts the previous four.

With `WrangleSystem` live, an exhausted machine is simultaneously **undamageable** (`CombatSystem.canDamageEnemy` is `!wrangle.isHarmless`, `Game.ts:536`) and **harmless** (`Game.ts:2606`), and it stays on the board. The browser drains that pool through a capture ceremony — a keybind at `Game.ts:7704` and a dev bridge at `Game.ts:1834`. `AgentGameAdapter` (`src/agent/ToolSurface.ts:82`) carries `placeBuilding`, `panAt`, `repair`, `chaseMark`, `collectXp`, `collectGold` — **and no capture verb.** An agent therefore cannot clear a single exhausted machine.

Measured on `e6-showroom-01`, per wave (`alive` / `exhausted`, cap 96):

| wave | 1 | 2 | 3 | 4 | 5 | 6 | 7 … 20 |
|---|---|---|---|---|---|---|---|
| alive | 7 | 9 | 19 | 33 | 52 | 60 | 60 (flat) |
| exhausted | 0 | 1 | 9 | 21 | 38 | 57 | 58 → 60 |

From wave 6 the board holds 60 living enemies of which 60 are exhausted. `Balance.waves.aliveCap` is **60**, and `WaveSystem.ts:536` and `:579` both refuse to spawn once `aliveCap - activeCount <= 0`. So no wave spawns from wave 6 onward, and the contract "secures" at wave 20 having faced nothing for fourteen waves.

**That `secured: true` is a false green**, which is why no Atomic contract was admitted despite three of four now being deterministic. Admission would have pinned a determinism hash on a deadlock and reported it as playability.

The cure is a capture operation on the agent surface. `src/agent/ToolSurface.ts` is outside this shift's firewall, and adding a verb to the agent grammar is a governed-surface decision, so this is filed rather than fixed.

### F-ER01-E6-1 — Glow Mesa's remaining blocker is one boss system, and it now stops the run

Superseded in part: `E6TileConsumerSystem` (timed decay-field walkability, the six night veins) is socketed and running, and its vocabulary is derived. What remains is `HomemakerBossSystem`. Its `homemaker_9000` baron is declared at wave 8; `RunManager.autoSecureWaveForRun` returns `Number.MAX_SAFE_INTEGER` while a declared baron is unbeaten; the generic `WaveSystem` cannot produce that boss. Measured consequence: both seeds run past `secureWave` 12 to wave 15 and abort on GR-SIM's ceiling. The fix master must socket that boss; the census must never accept the generic `WaveSystem` boss in its place.

### F-ER01-E6-2 — Showroom's wrangle loop is now visible to agents, and still unusable by them

Closed in part and reopened smaller. The manifest now carries `wrangle_wind_down`, `wrangle_exhausted` and `wrangle_pen`, all derived from `WrangleSystem` rather than from the roster, plus `wrangle_capture_unreachable` naming what an agent still cannot do. Showroom declares nothing its consumers do not read — no stake markers, three build zones, six harvest anchors, all consumed — so it is the cleanest of the four and will be the first admissible Atomic contract the moment F-ER01-E6-5 is cured.

### F-ER01-E6-3 — Half-Life Hollow's crossing claim outlived its consumer gap

The wrangle half of this finding is closed. What remains is the contract's own data: `tileParams.stakeMarkers` holds one marker, `hollow-extraction`, with `heroStart: false`, and **nothing reads a non-`heroStart` stake**. The briefing promises "two glow bridges flank one central causeway", "west and east shelves divide the middle crossing", and "the north extraction stake stands beyond the causeway"; `tileParams` carries `ford: false`, no `fords`, and a `heightfield` of `id`/`mode` only. So the crossing is terrain scenery and the extraction stake is inert data. Reconciling it needs a contract-JSON edit (`assets/contracts/epoch-6-atomic/contracts.json`), which is outside this shift's firewall.

### F-ER01-E6-4 — Picnic's three stakes still collapse to one start marker

Unchanged and re-verified. `stakeMarkers` declares `sandwich-west`, `sandwich-center` and `sandwich-east`, all `heroStart: true`; `HeadlessContractSim` takes `stakeMarkers.find((marker) => marker.heroStart)` — the first — and the browser's `Game.contractHeroStart` does the same. The derived manifest still posts three loss stakes. Deciding what the three-stake objective *is* remains an owner design fork, and it is the only Atomic contract whose own data still disagrees with its consumers.
