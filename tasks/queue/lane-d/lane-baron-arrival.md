# Task lane-baron-arrival: the Baron comes from the NORTH + the palisade tax ends (LADDER-HIGH, next free lane, commit prefix "fix:")

You are Codex, implementer for Gold Rush (worktree per queue lane).
CODEX: model=gpt-5.6-sol effort=medium
READ FIRST: assets/contracts/epoch-1-frontier/contracts.json (e1-baron: prebuilt fixtures + boss/wave spawn config) · the Baron boss system's arrival/telegraph path · the agent repair priority (Balance.agent.priorityRepair — why prebuilts drain gold) · the map's art/panorama (the fort's position — verify north; if the art disagrees, say so and follow the ART).

Pre-flight (LANE-SAFETY): standard safe-dupe; npm i; tsc+build green.

## Why (OWNER PLAYTEST 2026-07-19, verbatim: "he should come from the north as that is where his castle/fort is. I destroy the prebuilt pallisades each game as otherwise my Prospector spends all my gold to repair them. repairing is great, just these palisades are not needed.")
## Scope
1. THE ARRIVAL READS TRUE: the Baron (and his motorcade/waves' bias) enters from the NORTH edge on e1-baron — spawn config + the arrival telegraph point north (fiction: his fort is there). Wave pressure may still flank per the wave grammar; the BOSS and his announced arrivals are northern.
2. THE PALISADE TAX: remove the prebuilt palisades from the e1-baron contract fixtures (owner: not needed; they conscript the agent's repair budget). AUDIT the other contracts' prebuilt palisades in one table (map → prebuilts → keep/remove REASON) but CHANGE only e1-baron (the owner's scope); flag any map where the same tax pattern looks likely as findings.
3. Spec: e1-baron boot has zero prebuilt palisades · the boss arrival event carries the north edge (sim assertion) · agent gold-spend on repairs in the first N sim-minutes == 0 on a fresh boot (the tax is gone) · both projects, zero console.
## Firewall: e1-baron contract data + boss spawn/telegraph config + your spec. NO agent repair logic changes (repair stays great), NO Balance beyond the contract, NO other maps' fixtures.
## Self-check: tsc+build · your spec + the baron boss suite green both projects · zero console.
END: READY-FOR-GATES + the prebuilt-palisade audit table.
