# THE TWIN SOCKETS — E5 Deepwater + E6 Atomic era-sockets

**Slice:** era-socket class, E5 + E6 · **Branch:** `milk/twin-sockets` · **Base:** `18b2ef276` (main, s1482)
**Date:** 2026-08-06 · **Shift:** final-milk fleet

## VERDICT

**SHIPPED — two era sockets, zero admissions, and the zero is the finding.**

Both epochs' signature consumers now run headlessly in the browser's own tick order. `SUPPORTED_CONTRACTS` is deliberately unchanged: admission was attempted on all eight contracts, measured, and refused on every one. The measurement relocated both epochs' blocker off the missing consumer — which this shift supplied — and onto the agent's verb list, which is a governed surface outside this shift's firewall.

## WHAT IT DOES

`src/sim/DeepwaterSocket.ts` runs the Deepwater Claim's tile consumer (`DeepwaterClaimTile`: water regions, the Claim-Boat, the storm/corsair scheduler) and `DeepwaterArsenal`, in the browser's relative order (`syncDeepwaterClaim → arsenal.update → waveSystem.update → recycleCorsairsAtExit → combat.update → resolveTreatments`), and honours `Game.ts:1251` — a socketed Deepwater contract runs no generic wave schedule, because its storm track is the clock.

`src/sim/AtomicSocket.ts` runs `WrangleSystem` — enabled for the *whole* Atomic epoch in the browser (`Game.ts:646`), which is why one absent consumer blocked all four contracts at once — plus `E6TileConsumerSystem` for Glow Mesa, with all three of the browser's behavioural couplings: `CombatSystem.onEnemyDamaged` (`Game.ts:534`), the contact gate (`:2606`), and the movement multiplier (`:2614`).

`HeadlessContractSim` gains eight null-guarded calls and two constructor lines. `MechanicsManifest` gains six Deepwater rules, four wrangle rules on every Atomic contract, and two tile rules on Glow Mesa — every one sourced to a consumer, never to `tileParams`.

## EVIDENCE

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **rc=0** (asset-diet: 235 GLBs 592.0 MB → 92.7 MB, 54 PNGs 187.0 MB → 24.8 MB) |
| `GR_RELEASE=e1 npm run build:release` (F-RB-1) | **rc=0** — E1-only: 1,883 files, 110,044,251 bytes, **zero later manifest ids or plate/GLB assets** against 262 later-asset stems. Run because the sockets add `WrangleSystem`, `E6TileConsumerSystem`, `DeepwaterClaimTile` and `DeepwaterArsenal` to the sim's import graph; the E1 release door is unaffected |
| `e2e/er01-e5-census.spec.ts` | **8/8** desktop-chrome + mobile-chrome, zero captured console |
| `e2e/er01-e6-census.spec.ts` | **8/8** desktop-chrome + mobile-chrome, zero captured console |
| Adjacent `er01-e2/e3/e4/e7/e8/e9/e10` | **56/56**, unmodified-green |
| CONTROL `node --test scripts/gr-sim.test.mjs` | **9/9**, including the `e1-dry-gulch` terminal-outcome pins and the Baron driver |
| Manifest leak sweep, 42 contracts / 10 epochs | **0 leaks** — every non-E5/E6 rule list byte-identical |
| Mutation probe, 5 mutations | **5/5 BIT**, every file restored byte-identically |

Every probe that produced a number above is tracked in `reviews/milk-twin-sockets-evidence/` — the three constructibility probes (including the two with defective stubs, kept deliberately; see the method note), the outcome sweep, the wrangle-activity trace, the manifest leak sweep, the mutation probe, and the adjacent-suite result. `logs/session-scratch/` is gitignored, so nothing load-bearing was left there.

The control run is the load-bearing one: every socket call site is null-guarded, so `atomic` and `deepwater` are `null` for all twelve admitted contracts and their ticks cannot have moved. `gr-sim.test.mjs` pins exact outcomes and hashes for `e1-dry-gulch`, and it passed unchanged.

### E5 measurements

| Claim | Number |
|---|---|
| `DeepwaterClaimTile` determinism | two independent instances, 18,000 fixed steps (600 s) each → **byte-identical snapshots**, 25 corsair waves each |
| Water regions | 6, depth classes `surface`/`shallows`/`reef`/`wreck`/`trench`; dive zone = reef+wreck+trench |
| Claim-Boat | 3 pads (`bow`,`port`,`starboard`), 2 anchors (`lagoon`,`open-water`) |
| `reanchor` lever | `lagoon → open-water` **true**; same anchor again **false**; unknown anchor **false** |
| `placeBoatBuilding` lever | `bow`+turret **true**; second building on `bow` **false**; unknown pad **false** |
| `DeepwaterArsenal` | constructs against the real headless `CombatSystem`; 4 items; shared `depth_charge` munition 12/12 |
| `DredgeQueenBossSystem` | **`ReferenceError: document is not defined at counterSprite (DredgeQueenBossSystem.ts:661)`** |
| Manifest | 6 rules, all consumer-sourced |

### E6 measurements

All runs `--policy=idle`, Node 26.4.0, both bench seeds, each run twice.

| Contract | Outcome | Hashes (seed 01 / 02) | Repeat |
|---|---|---|---|
| `e6-showroom` | **secured**, wave 20, 82 / 81 kills | `fnv1a32:27f4b15e` / `fnv1a32:84bc5a65` | IDENTICAL |
| `e6-half-life-hollow` | died, wave 4, 63 / 64 kills | `fnv1a32:ee30fe50` / `fnv1a32:c4007b5b` | IDENTICAL |
| `e6-picnic` | died, wave 5 / 4, 79 / 59 kills | `fnv1a32:fbc12243` / `fnv1a32:a38ab6e9` | IDENTICAL |
| `e6-glow-mesa` | **ceiling exceeded, wave 15 > 14** | — | — |

Wrangle activity on `e6-showroom-01`: 14 machines peak winding-down, **60 exhaustion events**, both machine variants (`feral_toaster`, `lawn_shepherd`) registered, pen roster empty throughout.

## THE FINDING THAT DECIDED THE SHIFT

`e6-showroom` secures at wave 20 on both seeds, deterministically. It looked like the shift's admission. It is a **false green**, and the per-wave trace is why (alive / exhausted, pool capacity 96):

| wave | 1 | 2 | 3 | 4 | 5 | 6 | 7 … 20 |
|---|---|---|---|---|---|---|---|
| alive | 7 | 9 | 19 | 33 | 52 | 60 | 60 (flat) |
| exhausted | 0 | 1 | 9 | 21 | 38 | 57 | 58 → 60 |

With wrangle live, an exhausted machine is undamageable (`CombatSystem.canDamageEnemy` is `!wrangle.isHarmless`, `Game.ts:536`), harmless (`:2606`), and still alive. The browser drains that pool through a capture ceremony; `AgentGameAdapter` has no capture verb, so an agent cannot clear a single one. From wave 6 the board holds 60 living enemies, all exhausted; `Balance.waves.aliveCap` is 60 and `WaveSystem.ts:536`/`:579` then refuse to spawn at all. The contract "wins" at wave 20 having faced nothing for fourteen waves.

Admitting it would have pinned a determinism hash on a deadlock and reported it as playability. The socket is faithful; the epoch's loop simply cannot close from the agent surface as it stands.

## MERGE CLASSIFICATION

Base `18b2ef276`. All six paths **LANE-TOUCHED only** — main moved none of them during the shift.

| Path | Class |
|---|---|
| `src/sim/DeepwaterSocket.ts` | new file |
| `src/sim/AtomicSocket.ts` | new file |
| `src/sim/HeadlessContractSim.ts` | LANE-TOUCHED — insert-only; no existing line reordered |
| `src/agent/MechanicsManifest.ts` | LANE-TOUCHED — additive branches, gated per contract/epoch |
| `docs/bench/e5-readiness-census.md`, `e6-readiness-census.md` | LANE-TOUCHED — rewritten |
| `e2e/er01-e5-census.spec.ts`, `er01-e6-census.spec.ts` | LANE-TOUCHED — extended |
| `tasks/BACKLOG.md` | LANE-TOUCHED — two leaves appended to the findings block |

No conflicts. Nothing outside the task's TOUCH-ONLY list was modified: contract JSON, `bench-seeds.json`, `src/agent/ToolSurface.ts`, `src/systems/**` and `src/game/Game.ts` are all untouched, which is why three of the findings below are filed rather than fixed.

## FINDINGS

**F-MTS-1 — the two sockets, shipped.** Non-blocking; this is the deliverable. Detail in the two censuses.

**F-MTS-2 — `AgentGameAdapter` has no verb for either epoch's defining action. OWNER'S DESK.** E6 needs **capture**; E5 needs **boat-build** and **reanchor**. All three levers exist and are tested on the consumers; none is reachable by an agent. Adding a verb to the agent grammar is a governed-surface decision. **Recommendation: rule on capture first** — it alone unblocks `e6-showroom` immediately and `e6-half-life-hollow` behind one contract-JSON reconciliation, whereas the two boat verbs unblock nothing until the Dredge-Queen's presentation is made lazy.

**F-MTS-3 — `DredgeQueenBossSystem` cannot be constructed outside a browser, and it owns the Deepwater Claim's only exit.** `lootCounter = counterSprite()` and three `labelSprite(...)` calls sit in **instance field initializers** (`:77-80`); both helpers call `document.createElement('canvas')` (`:736`). Field initializers run before the constructor body, so the `enabled` flag never gets a chance to matter. The cure is to build the presentation lazily — on first `syncPresentation`, or behind `enabled`. `src/systems/**` is outside this shift's firewall. Until then `e5-deepwater-claim` has no reachable secure condition, and the socket counts every refused boss handoff so the gap is asserted rather than inferred.

**F-MTS-4 — `HomemakerBossSystem` is unsocketed and blocks `e6-glow-mesa` from terminating at all.** Its `homemaker_9000` baron at wave 8 gates securing via `RunManager.autoSecureWaveForRun`; both seeds overran GR-SIM's ceiling at wave 15 > 14. **Deliberately NOT claimed browser-only:** my first probe of it failed on an incomplete host stub of mine (`goldPickups.setDemolishCollector`), not on anything in the system, and I did not re-probe with a complete host. Its constructibility is **UNVERIFIED**. Whoever takes it should probe first — the host contract needs a real `BuildSystem`, `TargetingSystem`, `CombatSystem` and `GoldPickupPool`, and `HeadlessContractSim` currently has no gold-pickup pool.

**F-MTS-5 — `e6-half-life-hollow` carries authored data no consumer reads.** `stakeMarkers` holds `hollow-extraction` with `heroStart: false`, and nothing reads a non-`heroStart` stake; the briefing promises two glow bridges, a causeway and shelf crossings while `tileParams` carries `ford: false`, no `fords`, and a `heightfield` of `id`/`mode` only. Reconciling it needs a contract-JSON edit, outside this shift's firewall. It is the only Atomic contract that would be admissible on one such edit plus F-MTS-2.

## A NOTE ON METHOD, FOR THE NEXT AUTHOR

**Two of my three constructibility probe stubs were defective, and both defects pointed the wrong way.** Probe 1 reported `DeepwaterArsenal` as browser-only; it is not — my hand-built `CombatSystem` stub was missing what `FreedWalkerVfx` needed. Probe 3 reported `HomemakerBossSystem` as unconstructible; that is still unknown — my host stub was missing `goldPickups.setDemolishCollector`.

Only `DredgeQueenBossSystem`'s failure survived re-derivation, because it fails on `document` inside a field initializer — a defect in the *subject*, reachable no matter how good the stub is. The discriminator worth keeping: **a probe that dies inside the subject's own presentation code is evidence about the subject; a probe that dies inside your stub is evidence about your stub.** Re-run the second kind against a real collaborator before you write it into a census.
