# Task lane-c-freed-legibility: the cure must READ — fevered vs freed at gameplay zoom (LANE-C, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md · the freed-walker implementation (the cure-arms flip: where an enemy becomes FREED and runs out — CombatSystem treatment events + Enemy render state; the freed ghosts from the death-poof rework) · src/entities/Enemy.ts render/tint surface · the arsenal specs' cure-arms assertions (e2e/e5-arsenal.spec.ts:… "free people… without death events") · lore/canon: warm-never-gory; the Fevered are victims.

Pre-flight (LANE-SAFETY): standard safe-dupe rules; npm install; tsc+build green.

## Why (owner playtest, 2026-07-18, verbatim: "The animation for them to run away is funny - but it is also confusing as sometimes they run towards you and then its not clear to see if they are going to hurt you. And the difference between the fevered and unfevered is hard to see.")
The saga's central mechanic — freeing, not killing — is invisible at gameplay zoom. Legibility IS the theme here.

## Scope (all tunables in Balance.legibility)
1. FEVERED READ: active enemies get a clear at-distance tell (warm ember tint pulse / gold-glint accent — canon: the Fever CRAVES; never gory). Strength Balance-tunable; off for the Baron's clean machines (pride is un-fevered — they read as MACHINE, not ill).
2. FREED READ, unmistakable within 100ms of the flip: (a) an immediate silhouette/state change (desaturate + a raised-kerchief/hands-up accent per the house style — pick the cheapest readable form, placeholder-first), (b) freed NEVER path through the player: route to the nearest map edge with a player-avoidance bias (verify they currently CAN'T deal contact damage — assert it), (c) a small one-time "FREED" float (reuse the vfx float, warm color) so the first few flips teach the vocabulary.
3. Diagnostics expose per-entity read-state (fevered/freed) for the spec.
4. Spec e2e/freed-legibility.spec.ts (both projects): a freed walker deals zero contact damage while crossing the player's position · freed pathing target is an edge, not the player · the read-state flags flip correctly · zero console. Screenshot pair (fevered crowd vs freed exodus) into reviews/shots-legibility/.
## Firewall: TOUCH-ONLY Enemy render/tint + the freed-flip site + pathing target for freed + Balance.legibility + your spec. CombatSystem stays sole damage resolver; NO enemy stat/AI changes for ACTIVE enemies; NO new art dependencies (tint/pose accents from existing atlas primitives).
## Self-check: tsc+build · your spec + the five arsenal specs (cure-arms adjacents) green both projects · zero console.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + the two screenshots + what the freed read looks like in one sentence.
