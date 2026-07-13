# fevered-tell — the hunger shows: gold-fever accents on the infected (lane-b; commit prefix "feat:")
ROLE: presentation. WORKDIR: lane-b (worktrees/lane-b). CODEX: model=gpt-5.6-sol effort=medium
ATTENDED-AUTHORED 2026-07-13 — owner: "maybe we have to update sprites of opponents to reflect it? it also infects machines" (THE GOLD FEVER canon: lore/story-arc.md §THE GOLD FEVER + STORYBOOK Fever thread).

Pre-flight (LANE-SAFETY): standard safe-dupe rules; LADDER-STALL protocol stands. Then npm install; build green.

## WHY: the Fevered are canon but look like ordinary folk/machines. The hunger needs a READ: a gold-fever accent on every infected enemy — human AND machine (the strain jumps to machinery at E2).

## READ-FIRST: lore/story-arc.md §THE GOLD FEVER (+ machines addendum) · the enemy presentation channels in src/entities/pools.ts (tint channel, watchPaint overlay precedent, lantern carry rule — the affordances to reuse; NO new render architecture) · canon §9: warm never gory — the accent is GOLDEN GLEAM (eye-glint, gold-dust shimmer), never sickly/horror.

## SCOPE:
1. Runtime FEVER ACCENT on all Fevered enemies (the base crowd, thieves, wreckers, E2 trio; humans get a warm gold eye-glint/dust shimmer pulse; MACHINES get gold-glowing rivets/gauge needles — infected machinery reads instantly). Reuse the existing tint/overlay channels; subtle at rest, slightly stronger while "swinging"/grabbing (the hunger surging). EXCLUDED: the Baron (he is the AUTHOR, not infected — his read stays pristine), the railcar (its damage-state art just shipped; revisit in its own slice if the owner wants).
2. Perf: overlay reuses instanced channels — draw-call budgets unchanged (vp-02/e2-enemies/m1-01 green).
3. e2e `e2e/fevered-tell.spec.ts`: fever accent active on a spawned base enemy + an E2 machine (probe the overlay/tint state), Baron WITHOUT it, budgets green, zero console/page errors, both projects.
4. LEDGER note banked (not executed): an ART-BATCH follow-up may later bake gold-fever eyes INTO the sheets via image-EDITS (consistency law) — this slice is the runtime read that ships now.

## Firewall
Touch ONLY: enemy presentation channels in pools.ts (+ the E2 variant presentation), the new spec, artifacts/fevered-tell/. NO behavior/AI, NO Balance, NO sheets/raws, NO baron/railcar visuals, NO CombatSystem.

## Self-check
tsc + build green · new spec + the three budget suites green both projects · zero console errors · close-up screenshots: fevered human, fevered machine, un-fevered Baron.
If you exit without changes, WRITE WHY first.
END: READY-FOR-GATES + the accent parameters chosen.
