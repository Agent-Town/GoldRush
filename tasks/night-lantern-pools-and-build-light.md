# night-lantern-pools-and-build-light — the dark stays; the lanterns finally matter
ROLE: light gameplay-render. WORKDIR: lane-d (worktrees/lane-d), after night-shift-dusk-ramp (same rig family, stack).
CODEX: model=gpt-5.6-sol effort=high

## WHY (owner, darkest-night run 2026-07-12, verbatim): "I can't place buildings anymore as I can't see the real locations, I can guess. The light of the lantern does not help much. That feels weird. Lanterns should make a difference, but this felt really very dark. I like that part."
DESIGN LAW from his words: the deep dark is CORRECT and stays (do not brighten the night). The fix is the LIGHT: lantern pools must be genuinely readable islands — warm, honest circles where the claim is visible and buildable. "Beyond your light, the night owns the claim" becomes literal in both directions.
## READ-FIRST: src/world/LightRig.ts + lantern light radius values (Balance lantern rows) · BuildSystem ghost/placement render · the contract's own rules text (light = safety = visibility) · night-shift suites; his two screenshots (level-17 dark + the seam) in this task's WHY.
## SCOPE
1. LANTERN POOLS: within a lantern's radius, ground/props/pads render clearly (warm lamp-gold pool, real falloff) — values tuned so a lit camp is workable; the world OUTSIDE pools stays exactly as dark as today (protect what he likes).
2. BUILD READABILITY IS LIGHT-SCOPED (design-coherent): in build mode at night, valid pads/ghost/grid are readable ONLY inside lit pools; outside them the ghost dims to a faint outline (you CAN still place — no gameplay change — you just can't see well, which is the era's law and makes lanterns strategy).
3. Hero's small personal glow: verify it exists per the original night design; if absent, a minimal carry-light so the immediate step is never pitch-black.
4. e2e: brightness sampling inside vs outside a lantern pool at darkest phase (pool ≥N× outside), ghost readability assertion in-pool, night drama preserved (outside sample stays ≤ threshold). Both projects.
## TOUCH-ONLY: LightRig pools, lantern render values (Balance render-side rows only), build ghost night styling, one e2e, artifacts/night-lanterns/.
## NO: night ambient level (the dark HE LIKES), lantern gameplay mechanics/costs, wave logic; the seam/sprite tint bypass is dusk-ramp item B — do not duplicate.
## SELF-CHECK: tsc; build; night-shift + dusk-ramp + build suites green BOTH projects; zero console; a lit-camp screenshot at darkest phase showing readable pads inside the pool, black beyond.
END: READY-FOR-GATES + the pool/outside brightness ratio.
