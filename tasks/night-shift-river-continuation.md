# night-shift-river-continuation — every river flows past its map edge
ROLE: water/terrain render. WORKDIR: lane-c (worktrees/lane-c), after terrain-seamless.
CODEX: model=gpt-5.6-sol effort=medium

## WHY (owner 2026-07-12, verbatim): "night shift has the river issue like the claim had it" — his screenshot: the water plane stops in a hard diagonal cut at the tile corner. The Claim had the identical issue and got the LIVING-WATER continuation (owner ruling 2026-07-09: the river "continues on left and right and into the distance") — Night Shift (and possibly Twin Banks) never received the treatment.
## READ-FIRST: the w1-02 living-water slice (e2e/w1-* + reviews/shots-w1-*; src/world/Water.ts — how the Claim's river extends beyond tile bounds into the horizon) · assets/contracts/epoch-1-frontier/contracts.json tileParams for e1-night-shift + e1-twin-banks (river/ford fields) · the flat-identity + determinism guards (gt suites).
## SCOPE
1. Apply the Claim's river-continuation treatment to Night Shift's river (extends past both edges + into the distance; night palette respected — the dark water under lantern light is a look, keep it warm).
2. AUDIT Twin Banks (two banks = two rivers?) + any other watered tile: same treatment where the cut-off exists; report which tiles were touched vs already-correct.
3. Render-only; sim/ford/water-gameplay untouched; determinism fingerprints unchanged.
4. e2e: extend the water spec family — river mesh bounds exceed tile bounds on treated tiles; both projects + screenshots at the exact owner angle (map edge corner).
## TOUCH-ONLY: src/world/Water.ts + tile render params, one e2e extension, artifacts/night-shift-river/.
## NO: heightfields, tileParams gameplay fields, Balance, spawn logic.
## SELF-CHECK: tsc; build; water/w1 + night-shift + twin-banks + gt suites green BOTH projects; zero console; before/after at the cut corner.
END: READY-FOR-GATES + the tile audit table + corner shots.
