# e2-drip-02-pressure-garden — E2's third contract (lane-c #2; commit prefix "feat:")
ROLE: content + tile. WORKDIR: lane-c (worktrees/lane-c). CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-14 — owner: "we can open up another lane for E2 maps? ... Can we build them out today?" Drip #2 per BUILD-PLAN.

Pre-flight (LANE-SAFETY): standard safe-dupe rules; LADDER-STALL protocol stands. Then npm install; build green.

## READ-FIRST: the landed Trestle slice (44f4697c — THE pattern: contract JSON + tileParams + board row + unlock + spec) · e2-steamworks-bundle §B (Hill Mine grammar) · the pressure system + boiler/coal loop (this contract SHOWCASES it) · MODEL-HANDOFF.md "author masks first" law (your tile's water/build/spawn masks must be CLEAN — the 3D terrain program sculpts them later; note mask coordinates in the report).

## SCOPE:
1. `e2-pressure-garden`: the fantasy — a geothermal terrace garden where pressure IS the crop: many boiler pads + rich coal seams + scarce water; defend mode with pressurize objectives (keep N boilers hot through windows — the pressure mechanic's teaching ground). Unlock: after a Trestle win.
2. Tile: terraced pads, coal seams clustered dark, ONE clean water band (sluice-legal, generous — learn from hill-mine's discoverability pain), rails optional/none. Masks authored clean per the handoff law.
3. Board row + plate fallback (family pattern; art rides a later batch).
4. e2e `e2e/e2-pressure-garden.spec.ts`: boots from the board post-trestle-win seed, boilers+coal+pressurize flow works (debug seams), sluice places at the water band, wave flow reaches secure; zero console errors; both projects. Trestle + hill-mine suites unmodified-green.

## Firewall
Touch ONLY: epoch-2 contract data + the new tileParams + board unlock + the new spec + artifacts/. NO mechanics changes, NO Balance globals, NO other contracts.

## Self-check
tsc + build green · new spec + trestle + hill-mine green both projects · zero console errors · board + in-run screenshots. If you exit without changes, WRITE WHY first.
END: READY-FOR-GATES + the mask coordinate table (for the future 3D sculpt).
