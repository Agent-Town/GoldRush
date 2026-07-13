# fix-e2-fuel-and-banks — coal teaches itself, banks show themselves (lane-d; commit prefix "fix:")
ROLE: gameplay UX. WORKDIR: lane-d (worktrees/lane-d). CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-14 — owner playtest (Hill Mine, screenshots): "I am unable to build sluices on Hill Mine. I built the Boiler room but the pressure stays at zero, I dont understand."

Pre-flight (LANE-SAFETY): standard safe-dupe rules; LADDER-STALL protocol stands. Then npm install; build green.

## VERIFIED ROOTS (re-trace, then fix):
- BOILER: PressureSystem burns COAL (`state.fuel <= 0 && this.coal > 0`); coal comes from harvestCoal (tile coal seams). No coal → cold boiler → 0/100 forever, with ZERO in-game indication. The boiler teaching card (clarity slice) doesn't teach the coal loop.
- SLUICE: hill-mine's sluice-legal water is only "the trestle and wet edge" (contract rules) — a valid but NARROW band the player can't discover; the invalid-placement line says "needs the river bank" but nothing shows WHERE.

## SCOPE:
1. BOILER STATES VISIBLE: the boiler building shows its state in-world (cold/needs-coal vs hot: smoke + ember glow when hot, a cold "wants coal" read when fuelless — reuse existing building-state visual channels); the HUD pressure pill gains a tiny state hint when all boilers are cold ("no coal" chip). The boiler teaching card copy extends by ONE sentence: the coal loop (where coal comes from on the tile, ledger voice).
2. COAL DISCOVERABILITY: coal seams get the same affordance gold seams have (visible node read + a first-encounter reveal line "Dark seams: boiler food."). If harvestCoal is proximity-automatic, SAY so in the card; if it needs an action, prompt it like panning.
3. BANK VISIBILITY: sluice-legal bank segments glow softly WHILE the sluice is the selected buildable (the placement-affordance pattern — a subtle teal waterline shimmer on valid bank tiles only during placement; no permanent clutter). Works on ALL contracts (data-driven from the water mask), fixes hill-mine discoverability without touching the tile.
4. e2e `e2e/e2-fuel-and-banks.spec.ts`: cold-boiler state visible + pill chip when coalless; feeding coal (debug seam) flips hot + pressure ticks up; bank shimmer appears only during sluice placement and only on water-adjacent tiles (probe 3 valid + 3 invalid points on hill-mine); zero console errors; both projects. Pressure + sluice-water suites UNMODIFIED-green.

## Firewall
Touch ONLY: boiler state visuals + pill chip + card copy, coal seam affordance/reveal, the placement-shimmer (render-only, reads the existing water mask), the new spec, artifacts/. NO pressure/economy numbers, NO tile water data, NO CombatSystem.

## Self-check
tsc + build green · new spec + pressure + sluice suites green both projects · zero console errors · screenshots: cold vs hot boiler, bank shimmer during placement. If you exit without changes, WRITE WHY first.
END: READY-FOR-GATES + the card copy + shimmer parameters.
