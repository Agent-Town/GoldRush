# Task lane-roster-wiring-e8: E8 enemies enter the game — placeholder-first (LANE-D, commit prefix "feat:")
You are Codex (worktrees/lane-c). CODEX: model=gpt-5.6-sol effort=high
READ FIRST: specs/enemy-rosters-e8-e10.md §E8 (THE DESIGN: the §E8 roster rows (signal-era enemies per the sheet) — behaviors REUSE named archetypes: chase/lane/herd-bias/thief-state) · the enemy spawn/wave tables (how e1 outlaws wire today per contract family) · Enemy render (sprite sheet binding — the bandit sheet as the pattern) · PLACEHOLDER-FIRST LAW (CLAUDE.md §4.3: gameplay never waits on art — wire with TINTED existing sheets (era-accent tint per enemy id) until art-batch-roster-e8's sheets land; the binding is data, the swap is one path change).
Pre-flight: standard safe-dupe; npm i; tsc+build green.
## Why (owner priority 2026-07-20: era maps field E1 bandits; the design is merged; art is in flight — wiring goes NOW per placeholder-first)
## Scope
1. E8 contracts' wave tables field the E8 roster (per the sheet's rows: mix, the herd-bias signature for lawn_shepherd via a deterministic steering bias, glowjack's thief-state reuse); Balance.e8Roster block for mixes/stats scaled per era wave math.
2. Cure-arms outcomes per row (powers-down → wranglable per the shipped pen; freed walks home) through existing channels.
3. Sprite binding data-driven: placeholder = tinted bandit sheet per id; when char-e8-*-sheet files exist, they bind by NAME with zero code change (assert the lookup).
4. Spec e2e/e8-roster.spec.ts: an e8 map's waves contain the roster ids (not e1 outlaws) · herd-bias determinism (two runs, same seed, same paths hash) · cure-arms events per outcome class · zero console; era-gated (e1 maps unchanged).
## Firewall: spawn tables, Balance.e8Roster, the binding seam, your spec. CombatSystem sole damage resolver; archetype REUSE only (the sheet forbids new AI beyond the one named signature).
END: READY-FOR-GATES + the mix table + which sprites are placeholder-tinted.
