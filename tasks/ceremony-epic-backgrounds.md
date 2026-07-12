# ceremony-epic-backgrounds — the era transition LOOKS like time moving
ROLE: story presentation. WORKDIR: lane-a (worktrees/lane-a), after e2-ss03-beats.
CODEX: model=gpt-5.6-sol effort=medium

## WHY (owner, T1 playtest 2026-07-12, verbatim): "I am not impressed with these backgrounds, they don't relate to the game at all - isn't this the epic moment when the era's switch or start to blend and time moves on? I think this should be depicted with amazing pictures that explain all of this to the user in the background of these statements. The overall ceremony is great though."
Evidence: his ceremony screenshots — flat dark pinstripe panels; the beat's artKey renders only as a small speaker card. The beats ALREADY carry art keys (072 asserts kit-stamp-mill / kit-era-2); the renderer wastes them.

## READ-FIRST: src/story/StoryRuntime.ts + story.css (the epoch-ceremony presentation + ceremonyStep grammar) · src/story/beats.ts (artKey per step) · assets/processed/kit-era-*.png (era key art; kit-era-2 processed; promote others 384→display size via optimize-assets as needed, 600KB cap) · e2e/072-era-activation.spec.ts (ceremony assertions must stay green — extend, don't break).

## SCOPE (generic — every ceremony T1..T10 inherits)
1. The epoch-ceremony presentation renders the step's artKey as a FULL-BLEED cover background (warm-dimmed vignette overlay so the statement text stays legible; the parchment card/portrait stays as the speaker chip).
2. Step grammar: mill step → the megaproject art (kit-stamp-mill / bld-stamp-mill) · valley step → the OUTGOING era art cross-fading into the INCOMING (kit-era-1 → kit-era-2, a slow CSS cross-blend — "the eras blend and time moves on", the owner's exact ask) · title step → the incoming era's key art full-bleed behind "Epoch 2 — The Steamworks".
3. Data-driven from artKey so T2 (Dynamo → Voltage) works the day its beats land; missing art falls back to the current panel (never a broken image).
4. Lazy-load the images at ceremony start (no boot cost); process/promote any kit-era files needed (LEDGER rows).
5. e2e: extend 072's ceremony assertions — background element present with the right art ref per step + text contrast guard (overlay applied); both projects.

## TOUCH-ONLY: src/story/StoryRuntime.ts, story.css, beats.ts artKey data if a step lacks one, assets/processed kit promotions, e2e/072 extensions, artifacts/.
## NO: activation logic, Megaproject, TownScene, sim; no new art GENERATION.
## SELF-CHECK: tsc; build; 072 full suite green BOTH projects incl. new assertions; zero console; before/after screenshots of all three steps.
END: READY-FOR-GATES + the three-step screenshot strip.
