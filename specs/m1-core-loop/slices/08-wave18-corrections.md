# m1/08-wave18-corrections (BINDING before close-spec — Robin, wave-18 run)

**Contract:** the three product-owner findings from the wave-18 record are fixed with evidence; M1 then closes on Robin's defaults-confirm.

1. **Lifetime "Gold Panned"** — death ledger + Claim Record scoreboard show lifetime panned, derived purely from the Economy event log (`sum(gold_panned)` via `reduce()`; no new state — the m1-04 seam exists for exactly this). Add `spent` and `beacons built` lines to the Run Ledger. e2e: pan 2 ticks → spend 25 on a beacon → die → ledger shows panned=10 (not held=−15), spent=25.
2. **Beacon falloff tune** — one knob round, no structural change: raise `beacon.damage` and/or add per-wave scaling (`beacon.damagePerWave`), all in `Balance.ts` + lil-gui; target: a wave-10 clump of 3 dies to 2 beacons + hero without melee-only feel. Record chosen numbers here. (True fix candidates — smart targeting, splash — belong to M2-06/07, not here.)
3. **Upgrade-pool exhaustion** — `rollOffer` never shows maxed/unpickable cards; when <3 pickable remain, filler defs pad the offer (`assay_bonus` +15 gold · `field_dressing` heal 30 · `sharpen` +5% dmg, unbounded-small, weight 1); if nothing is offerable, skip the freeze/offer entirely. e2e: max everything via harness → offer still 3 pickable cards; and zero-offerable path never freezes.

**Verification:** GATE-STD; full regression (46 tests incl. these + m1-07-charm 7); ledger derive asserted against a scripted economy log.

**Firewalls:** no M2 buildables, no meta-persistence beyond the existing scoreboard, no targeting rewrites. Kills grant XP, never gold (filler card gold comes from the Assay Office = an `Economy` `gold_granted` event with source `upgrade_assay`, logged like everything else).
