# Task lane-roster-design: ENEMY ROSTERS E6-E10 — the design sheets, from the book (LANE-A, commit prefix "lore:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST, deeply: lore/STORYBOOK.md chapters E6-E10 ENTIRE (each era's antagonist content lives in its chapter: E6 the Homemaker's appliance era + wrangle canon · E7 the silences/signal era · E8 vacuum + "sane greed, billable, bored" prospect drones · E9 THE CLEAN WORLD law (line ~535, verbatim in your doc: "nothing on this world WANTS. Things merely work, or weather" — dust devils = weather with a sense of humor, feral terraformers = craftsmanship wrong-by-faithfulness, claim-jump prospect drones) · E10 the Static (a want for MEANING — its forms are the finale's grammar)) · lore/canon-rules.md (enemies are outlaws/companies/machines/nature, NEVER peoples; warm never gory; NO firearms; LEXICON: freed/turned back/powered down, never killed) · src/entities/Enemy.ts + the wave/spawn tables (how rosters wire today) · the existing enemy art conventions (assets/, sheet formats, height bands).

Pre-flight (LANE-SAFETY): standard safe-dupe rules. THIS IS A DESIGN-DOC TASK — output is ONE file: specs/enemy-rosters-e6-e10.md. No code.

## Why (OWNER COMMISSION 2026-07-18, verbatim: "please work on these enemy roster for E6-E10. In the end I will have to quality check them, too." + his playtest evidence: "waves of the same bandits as in the claim")
Eras E6-E10 field E1 outlaws today. Each era's chapter already wrote its antagonists — the roster's job is extraction, not invention.

## Scope — per era E6→E10, a roster sheet with EXACTLY this table: 4-6 enemies each ·
| id | name (mutation-law voice) | class (machine/nature/company/static) | cure-arms outcome (freed walks home / powers down / disperses) | behavior in one sentence (sim-grammar: chase/lane/orbit/siege — reuse existing movement archetypes, name which) | visual brief for the art batch (era vocabulary, height band vs existing sprites, NO letters, warm-never-gory) | chapter citation (line/quote) |
1. Every entry CITED to its chapter (uncited = proposal, mark it). The Fevered-vs-clean law per era holds: E6-E8 strains crave per the mutation law; E9 is THE CLEAN WORLD (nothing craves — weather and faithful machines only); E10 is the Static's forms.
2. Per era: which existing behavior archetype each enemy reuses (the wiring task builds NO new AI unless the sheet flags ONE signature behavior per era, max).
3. End with THE ART BATCH PLAN: sheet-slot list per era (filenames per house convention) sized for the art slot's one-batch-in-flight law, and THE WIRING PLAN (spawn-table entries per contract family).
4. NO-BLOCKER LAW stated at top (owner 2026-07-18, verbatim: "you can wire things in game, I just correct them later. I am already blocking so much work - lets not add more to that."): the pipeline runs design -> art -> wiring WITHOUT waiting for owner review at any stage; the owner corrects post-hoc. Every choice must therefore be cleanly reversible (roster entries data-driven, art in slots, spawn tables per contract) so a one-line correction can swap any of it.
## Firewall: the ONE spec file only. NO code, NO art generation, NO Balance edits.
Self-check: every entry cited · lexicon law grep (no kill/slay/gun words) · tables render clean.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + the five-era summary (one line each) + open questions for the owner (max 5, batched).
