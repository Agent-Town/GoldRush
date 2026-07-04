# Task 013: M2-07b building-incentive tune (Robin round-2 findings — MAIN FOLDER, after 012 merges)
Codex, implementer, Robin's Mac main folder. READ: AGENTS.md; docs/playtests addendum 5; reviews of m2-02/05/05b for landed shapes.
THESIS (BINDING): building play must beat kite-only play by wave 15+, or buildings are a trap. Robin's record is wave 25 WITHOUT buildings; with them he does worse. Root suspicion: thieves spawn only with stockpiles and wreckers only vs buildings → building = summoning punishment without compensating power.
SCOPE (knobs + minimal behavior, all ?debug-tunable):
1. REPAIR COSTS GLOBAL: repair = `Balance.repair.pctOfCost` (default 0.25) × build cost × missing-HP fraction, CAPPED at 0.4× cost — applies to EVERY def (Robin: sluice repair ~20g on a 40g building is punitive). e2e: repair a half-damaged sluice costs ≈ 40×0.25×0.5 = 5g.
2. BUILDINGS PAY RENT: sluice income +~40% (knob), stockpile ALSO grants small passive interest-free trickle? NO (no idle-curves law) — instead stockpile raises reclaim bonus: gold reclaimed from thieves +25% when ≥1 stockpile (fence-the-fences fantasy, knob).
3. AGGRO SINK: bandits that target buildings REDUCE concurrent hero-seeking count (global pressure budget shared, knob `Balance.waves.pressureBudgetShared=true`) — a base spreads aggro instead of adding it. e2e: with 6 buildings at wave 12, hero-seekers ≤ no-base count.
4. BLAST-CHARGE FRICTION probe only: log weapon-toggle usage + time-in-charge in run summary (data for the next verdict; NO behavior change).
FIREWALL: knobs + the aggro-budget share + reclaim bonus ONLY; no new systems; adapt to landed 012 shapes; full self-check incl. m2-03/04/05 suites. READY-FOR-GATES + files + results.
