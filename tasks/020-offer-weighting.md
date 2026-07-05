# Task 020: investment-weighted upgrade offers (MAIN slot — fixes Robin's pool-dilution regression)
ROBIN REPRO (BINDING): since blast cards joined the pool, he cannot focus Spark; hero power falls behind waves; wave-12 wall vs old wave-25 record. The deck must learn the player's build WITHOUT removing discovery.
1. Offer weighting: per-family weight = 1 + Balance.offers.investBonus (default 0.35) x stacks_taken_in_family, applied when rolling the 3-card offer (respect existing no-duplicate + maxed-leaves-pool rules). Families with 0 stacks keep weight 1 (discovery preserved). All knobs in Balance.offers + ?debug gui.
2. Card UI: tiny stack-count pip on cards of families you own (e.g., "III") — makes focus visible; no layout shift at 390px.
3. e2e (seeded): with 5 firerate stacks, firerate-family appearance rate over 40 rolled offers is >= 2x base rate; blast family with 0 stacks still appears within 12 offers; maxed families never appear; determinism per seed.
4. Firewall: Upgrades/Progression offer-roll + card UI + Balance only. No combat/economy/wave changes. Full self-check: m1-06 suite green (offer semantics extended, not broken — adapt asserts ONLY if they assumed uniform weights, note which).
READY-FOR-GATES + files + the measured before/after appearance rates.
