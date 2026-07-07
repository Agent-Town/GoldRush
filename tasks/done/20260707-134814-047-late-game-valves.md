# Task 047: the wave-35 wall — tier-3 affordability + late damage valves (MAIN slot, commit prefix "balance:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in the repo root (main slot). READ FIRST: AGENTS.md; docs/playtests/2026-07-07-robin-playtest-02.md (ninth wave — the wave-35 ledger, THE evidence for this task); src/game/Balance.ts (tiers rungs + costs, wave scaling); specs/building-tiers/README.md (BT-02 ramps: sluice ~2.3× T1→T2; the ruling "could scale forever"). Pre-flight: zero staged/modified TRACKED files (untracked `??` expected — list briefly, proceed). SUPERSEDES ladder item 012 (overwhelm-valves) — same intent, now with real deep-run data.

## The evidence (owner run, 2026-07-07, verbatim numbers)
Wave 35 overrun after 17:36. Panned 420 + sluiced 2356 = ~2776 income; spent 2755 (fully invested, zero waste). Turrets stuck T2 ("never got them to level 3"), sluices T2 early + one T3 ("not enough gold"), palisades T2, 31 buildings lost, 38 manual repairs. Upgrades: damage 8 · blast 7 · firerate 6. Owner: "my damage was also lacking and I was not able to continue." Conclusion: a PERFECT economy run cannot afford the T3 layer before the wave-33+ composition outscales T2 DPS + hero damage-8.

## Ruling this task implements
The second wall moves the same way the first did (SCI-02): deep runs must stay winnable-feeling with meaningful choices — not free, but FUNDABLE. Target: a strong economy run (sluice-T2-fleet class, like this one) affords 2–3 T3 buildings by wave ~30, and waves 33–38 are survivable with them.

## Scope
1. **Instrument first**: seeded 35-wave sim probe (existing seeded-run machinery) logging per-wave: income rate, cumulative affordable-T3 count, incoming DPS vs deployed DPS. Report the curves BEFORE changes (this data anchors every knob).
2. **T3 affordability valve** (pick by data, Balance-additive): late-wave sluice yield growth (seam scaling exists — check its late curve) AND/OR T3 cost rebalance AND/OR victory-wave income bonuses. NOT a flat discount — the T3 moment should feel EARNED around wave 28–32.
3. **Late damage valve**: check wave-33+ composition scaling vs available DPS ceiling (T2 fleet + damage-8 hero); adjust composition growth OR extend one hero damage family rung if the ceiling is the binding constraint (data decides).
4. **Acceptance (seeded, e2e-asserted)**: the probe run affords ≥2 T3s by wave 31; deployed-vs-incoming DPS ratio at wave 35 within a survivable band; waves 1–10 UNCHANGED (early game is owner-approved — do not touch its feel; ±5% tolerance).
5. All knobs additive in Balance with the old values recoverable (one-line revert per knob, documented in the report).

## Firewall
Touch ONLY: Balance late-game knobs (additive), the probe spec, e2e. NO changes to: tier mechanics/BuildSystem, wave scheduler structure, early-wave values, Economy writer, sim determinism (seeded probe must stay reproducible).

## Self-check
tsc/build; the probe spec green with before/after curves in the report (numbers, not adjectives); bt-01-tiers + m2-04/05 + task-025 + m1-01 + m2-01 unmodified green both projects; zero console errors. End: READY-FOR-GATES + the before/after curve table + which valves were chosen and why.
