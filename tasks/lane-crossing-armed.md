# Task lane-crossing-armed: crossings keep you armed; wading disarms — readably (LADDER, commit prefix "fix:")
You are Codex (lane per queue). CODEX: model=gpt-5.6-sol effort=medium
READ FIRST: Balance.pathing.deepWaterDisarmsHero + the disarm implementation · Twin Banks braid crossings (stones/bridges in the mask/contract) · the weapon HUD.
Pre-flight: standard safe-dupe; npm i; tsc+build green.
## Why (owner, Twin Banks: "there are now multiple ways to cross the river but shooting is only possible on some of them. A bit strange")
Crossings that LOOK equivalent differ in water class underneath — the disarm rule fires invisibly. RULING (attended, canon-derived, owner-vetoable): standing ON structure (stones/bridges/designated crossings) = ARMED (you are not in the water); open WADING in deep water = disarmed, with a visible HUD state ("hands full of river") + a brief float on transition.
## Scope: 1. Crossing tiles/stones classify as structure for the disarm check (mask-driven, all maps). 2. The disarm state becomes READABLE: weapon HUD dims with a one-line reason; re-arm float on exit. 3. Spec: on Twin Banks, firing works on every designated crossing; wading deep disarms with the HUD state; both projects.
## Firewall: the disarm check's structure classification + HUD read only; NO water masks edits, NO combat changes. END: READY-FOR-GATES + per-crossing table.