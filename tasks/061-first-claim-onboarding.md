# Task 061-first-claim-onboarding: THE FIRST CLAIM — a guided opening for first-timers (lane-b, town surface; commit prefix "feat:")
**OWNER FAMILY-QA #4, 2026-07-09 (verbatim): "what was unclear to the kids was how to start the game. The way to the tavern and from there to the game was already difficult. Maybe there has to be a bit more storytelling/a tutorial for first timers?"**
You are Codex in worktrees/lane-b. Pre-flight per LANE-SAFETY. READ FIRST: the town scene + townsfolk bark machinery (town-T5, `src/town/`), the story-loop first-boot path (first boot enters the loop), the board entry (tavern), profile flags/keys pattern (additive `gr.*` keys), `tasks/059-contract-catalog.md` (the board becomes a catalog — coordinate, don't collide: your work is BEFORE the board opens).

## Scope — first-run-only, skippable, never blocks input
1. **THE GREETING:** on a profile's FIRST town entry, the Tavernkeeper (or Elder if closer) delivers ONE short story beat via the existing bark machinery, kid-readable: the valley's open, the tavern keeps the contracts, go stake your first claim. 2 lines max.
2. **THE GUIDE:** a visible path affordance from the player to the tavern door — glowing footprints or a soft trail marker (scene-only, render-only) + the tavern gently pulses until entered. On entering, the contract board opens as it does today, and the FIRST contract's Launch button carries a soft pulse + a one-line tooltip ("Stake your first claim").
3. **THE HANDOFF:** once the first run launches, set `gr.firstClaim.done.v1` (per-profile, additive) — the greeting, trail, and pulses never appear again for that profile. Returning players see ZERO change.
4. **Skip path:** any input dismisses the greeting; the trail is passive (no modal, no lock, no forced walk).
5. NO new tutorial system, NO overlays/modals, NO in-run tutorial (separate design if the owner asks) — this task ONLY closes menu→town→tavern→launch.

## Firewall
Touch ONLY: town scene guidance visuals, bark trigger, the board button pulse/tooltip, the profile flag, its e2e, artifacts. **NO sim, NO run gameplay, NO board data, NO save/profile schema beyond the one additive key.**

## Self-check
tsc/build · e2e: fresh profile sees greeting+trail+pulse then launches; flag set → second entry shows none of it; existing-profile regression (zero visual delta, assert) · town/story-loop adjacents green · zero console · desktop + 390px screenshots of the trail + pulsing tavern → `artifacts/061/`.
End: **READY-FOR-GATES** + screenshots + the flag key name.
