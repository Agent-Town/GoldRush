# Review — e6-boss-homemaker (THE HOMEMAKER-9000, the boss that helps you to death)

- **Slice:** lane-a-e6-boss-homemaker (E6 boss system)
- **Branch/tip:** lane/m3 @ `c93fffd642e5a04f6fa14d82ccd50825366d55c1` (runner commit "runner(lane-a): lane-a-e6-boss-homemaker.md")
- **Merge:** `0305ce26176a5bd20ce7ac117f59d4ccac346617` (`--no-ff` onto main, stale base `09ae22f3`, main +10)
- **Drained by:** s730 fire, 2026-07-18

## Verdict
**SHIP.** The Homemaker-9000 boss system lands whole — Act 0 dread → Act 1 polite unbuilding → Act 2 pickup-curation → Act 3 the one chair, sits, powers down, is kept. INERT until E6 arms (contract-gated on `twist.baron?.variantId === 'homemaker_9000'`, mirror of the DQ/Claw/Digger precedent). No plain-boot surface → no gazette, no deploy.

## What it does
`HomemakerBossSystem.ts` (839, new) choreographs the ratified VAC/RACK/CORE boss. **Act 1 (VAC):** unbuilds player structures highest-HP-first through the legal `BuildSystem.demolish()` channel, refunding parts-stack pickups to the ground via a new `refundDrop` callback → `BuildSystem.collectDemolishRefund()` (Economy-legal `demolish_pickup` grant, single-writer honored); RACK area-denial arcs damage structure zones, **never players**. **Act 2 (VAC broken):** re-prioritizes loose ground pickups into tidy piles (moves drops — infuriating, harmless), RACK escalates. **Act 3 (CORE cracked):** stops, builds THE CHAIR from debris (placed prop), sits, fires the DONE pictogram, powers down → non-hostile persistent kept-machine written to `TileStateStore` (`HOMEMAKER_KEPT_ENTRY_ID`, the Digger-gentle precedent). Suspend/restore carried through `RunSuspend.ts` (`decodeHomemakerBossSuspend`). The boss "defeats" only on its CORE component (baron-defeat guard `!isHomemakerComponent || bossComponentId === 'core'`).

## Evidence (gate battery, s730 scratch config port 5234, --workers=1, both projects)
| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 790ms |
| e6-boss-homemaker (own spec, choreography + NEVER-hurt-player + kept-persistence) | **1/1 desktop + 1/1 mobile** |
| e8-boss-salvage-claw (shares `demolish` param reorder + Game.ts boss hooks) | **2/2 desktop + 2/2 mobile** |
| e6-decay-framework (E6 grammar, plain-boot-inert) | **2/2 desktop + 2/2 mobile** |
| task-025-bandits-dont-swim (baseline) | **5/5 desktop + 5/5 mobile** |
| e5-boss-dredge-queen (adjacent boss) | 3/4 desktop + 4/4 mobile — see F-1 |
| zero console/page errors | asserted green in own spec, both viewports |

## Merge classification
Base `09ae22f3` (main~10); main moved +10 since fork (e8-claw `77e5a80c`, e6-wrangle `8bdc8fb7`, tp bookkeeping). 3-way `--no-ff`, 6 content conflicts — **all additive keep-both**:
| File | Class | Resolution |
|---|---|---|
| `src/systems/HomemakerBossSystem.ts` | NEW | free (+ 1-line call-site fix, below) |
| `e2e/e6-boss-homemaker.spec.ts` | NEW | free |
| `reviews/shots-homemaker/*.png` | NEW | free |
| `src/game/Balance.ts` | main-moved | auto-merged (additive `homemaker` block) |
| `src/entities/GoldPickup.ts`, `TargetingSystem.ts`, `WaveSystem.ts`, `assets/contracts/epoch-6-atomic/contracts.json` | lane-only | clean apply |
| `src/vite-env.d.ts` | conflict | kept both `salvageClawBoss` + `homemakerBoss` diagnostics |
| `src/game/Economy.ts` | conflict | merged both `gold_granted` sources into one union: `appliance_pen \| demolish_pickup` |
| `src/game/TileStateStore.ts` | conflict ×2 | kept both entry-ids + deduped shared payload types; split shared parse-body into two functions |
| `src/game/RunSuspend.ts` | conflict ×7 | kept both `wrangle` + `homemakerBoss` suspend fields/decode/validate throughout |
| `src/game/Game.ts` | conflict ×8 | kept both boss fields/dispose/update/scene/diagnostics/reset; merged the ledger-reveal + baron-defeat conditions to carry both `isSalvageClawComponent` and `isHomemakerComponent` terms |
| `src/systems/BuildSystem.ts` | conflict ×3 | `demolish()` gains BOTH `refundOverride?: number` (6th, claw) + `refundDrop?: fn` (7th, homemaker); kept both `setBuildingSuspended` + `collectDemolishRefund` methods |

**Param-order judgment (the one non-mechanical resolution):** the claw (on main) passes `0` positionally as `demolish`'s 6th arg (`refundOverride`); the homemaker passed its drop-callback as the 6th arg in its own lane world. To keep both features I ordered `refundOverride` 6th / `refundDrop` 7th (claw's positional call unchanged) and inserted `undefined` for `refundOverride` at the homemaker's own call site (`HomemakerBossSystem.ts:118`, a lane-owned new file). tsc-clean confirms; e8-salvage-claw 2/2 confirms the claw's building-lift demolition is intact.

## Findings
- **F-1 (non-blocking, contention false-red — proven):** `e5-boss-dredge-queen.spec.ts:237` (frame-p95-within-15%) failed on **desktop-chrome only** inside the full 18-test battery under a live lane-runner; the **mobile** variant passed same-run with ratio=1.0. Re-run in isolation → **passed, non-boss=50.1ms boss=50.1ms ratio=1.0**. This is the documented gate-battery contention pattern; the homemaker system is contract-gated INERT and cannot instantiate on a DQ run, so it cannot regress DQ perf.
- **F-2 (informational):** the homemaker's VAC unbuild uses `Number.POSITIVE_INFINITY` demolish radius (boss reaches map-wide by design). Confirmed intentional; refund drops route through the single-writer Economy channel.
