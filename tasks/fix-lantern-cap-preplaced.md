# fix-lantern-cap-preplaced — the map's own lanterns don't spend the player's budget
ROLE: build-system fix. WORKDIR: lane-b (worktrees/lane-b).
CODEX: model=gpt-5.6-sol effort=medium

## WHY (owner, Night Shift run 2026-07-12, verbatim): "the lamps on the map count towards the maps I can build - now I can only build one for my camp... Can be easily fixed by increasing the number of lamps the user can build."
Better-than-asked fix (owner's intent = more buildable lamps): the build cap counts ALL lantern_post instances including the contract's PRE-PLACED cold lanterns — so the map's furniture eats the player's budget. Exclude pre-placed fixtures from the player cap; the full cap belongs to the player on every map, present and future (E2+ tiles pre-place fixtures too).
## READ-FIRST: src/systems/BuildSystem.ts (cap counting + how pre-placed/contract fixtures instantiate vs player builds — the 086 fixture-seam work distinguished them; find the ownership flag) · Balance lantern rows · e2e night-shift + 086 fixture suites.
## SCOPE: cap check counts PLAYER-OWNED instances only (fixtures excluded via the existing ownership seam); if no ownership flag exists for lanterns, add `preplaced: true` at fixture instantiation (sim-safe, suspend-round-trip checked). e2e: on Night Shift, player can build the FULL Balance cap of lanterns despite pre-placed ones; relight flow unaffected; suspend round-trip keeps the distinction.
## TOUCH-ONLY: BuildSystem cap logic + fixture instantiation flag, one e2e, artifacts/. NO Balance number changes (the cap was right; the counting was wrong), no lantern gameplay/light values.
## SELF-CHECK: tsc; build; new spec + night-shift suite + 086 + run-suspend green BOTH projects; zero console; screenshot of a camp with cap-full player lanterns + the map's own still standing.
END: READY-FOR-GATES + the ownership-seam line used.
