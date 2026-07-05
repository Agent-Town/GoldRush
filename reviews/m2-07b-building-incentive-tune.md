# Review: tasks/013 M2-07b building-incentive tune — GATED + INTEGRATED (s30)

Gate protocol v2, no-evidence resumable path (no tasks/018 Mac evidence file existed; sandbox healthy-VM spot-checks went well beyond the minimum trio). Checkpoints: `reviews/gate-progress.json`.

## Scope verdict: CLEAN
Diff attribution (no contention with 015/016 — see gate-progress): EventBus, StatSheet, Upgrades, DeathOverlay, Balance, WaveSystem, Game, BuildSystem, DebugTools, vite-env, e2e/m2-04 (sanctioned §2 modernization), e2e/m2-07b (new).

- **§1 repair costs global**: `Balance.repair.pctOfCost` 0.25 / `capPctOfCost` 0.4 × missing-HP fraction × ACTUAL PAID placement cost (new per-instance `buildCosts` store — costCurve-indexed placements repair proportionally to what was paid; fallback to `costCurve(0)`). Partial-damage repair now dwell-eligible (sanctioned §1 "applies to EVERY def"). Debit still rides `gold_spent` sink `repair_<id>` through Economy — sole-writer law intact.
- **§2 rent**: sluice `goldPerCycle` 2→3 (nearest integer step to +40%); reclaim bonus `Balance.steal.reclaimStockpileBonus` 0.25 gated on `hasBuiltStockpile()`; the bonused amount rides the `gold_reclaimed` event (Economy sole writer), float shows the credited amount (pickup-floats law), `canReceiveIncome` consistently checks the bonused amount.
- **§3 aggro sink**: `Balance.waves.pressureBudgetShared=true` DEFAULT IS BYTE-IDENTICAL to pre-013 spawn semantics (thieves/wreckers already flagged within count); `false` adds the punitive additive mode for A/B tuning. Spawn-time only; scheduler/curves untouched.
- **§4 probe**: weaponToggles + blastTime counted in Game, surfaced in run summary event (additive fields), DeathOverlay ("Blast Toggles"/"Blast Charge Time"), diagnostics. No behavior change.
- **§5 blast family**: powder_charge/wide_ring/quick_fuse (maxStacks 2 each, ledger-voice copy, iconFamily 'blast' → clean parchment fallback until batch-005C), StatSheet mults, cooldown floored 0.35, intrinsic `dmgPerWave` 0.02. setBalance widened to boolean (typed guard) for the shared-budget knob; GUI boolean toggles.

Canon ✓ (frontier-tech naming, prosperity framing), no secrets ✓.

## Gates (desktop-chrome serial, /tmp/gr-s30, healthy VM load 0.0)
- tsc clean, vite build clean (456ms).
- **e2e m2-07b 8/8** (4 desktop + 4 mobile). ONE harness fix at gate (s23 assert-what-you-sampled): repair test asserted exact gold equality while the live sluice batched income during the dwell → rewritten log-mark + atomic sample; conservation stays exact, `gold_spent` event still pins the debit to exactly 5g. Debit math itself proven correct.
- **m2-04 7/7** (modified canary — §2 reclaim derivations; bank-cap test now round-trips at cap exactly).
- **m2-05 7/7**, **m2-05b 5/5** (unmodified; wave-12 acceptance probe holds — repair cheaper than replacement).
- Console/page errors asserted empty in every test.
- Evidence shots: `reviews/shots-m2-07b/` (repair ring mid-dwell desktop + 390px frame, regenerated under the 013 build).

## Findings (non-blocking)
1. **Orphaned knob**: `Balance.wreck.repairCostFrac` (0.3) is no longer read by any src path but survives in Balance AND in the cost derivations of e2e m2-05 (line ~73) and m2-05b (lines ~94-97). Those suites stay green via grant-slack and a ceil-coincidence (palisade cost 10: ceil(10×0.3)==ceil(10×0.25)==3) — i.e. legitimately but fragilely. **Corrective queued for the next scope-opening on those files**: migrate derivations to the global formula, delete the dead knob. This is exactly the trap-knob class 013 exists to kill — flagged so nobody "tunes" it expecting effect.
2. m2-05's design note stands: repair of PARTIALLY damaged buildings is now possible and cheap (missing-fraction-proportional) — Robin should feel this at the next playtest (M2-07b re-verdict: does building play beat kite-only by wave 15+?).
