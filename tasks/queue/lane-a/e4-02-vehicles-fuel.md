# e4-02-vehicles-fuel — the Motor Frontier's engine, part 1 (lane-a; commit prefix "feat:")
ROLE: engine system. WORKDIR: lane-a. CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-14 — owner acceleration order ("should we push for E5 already?"): E5 opens when E4 ships; E4 ships when its engine stands. Part 1 of the E4 spine.
Pre-flight (LANE-SAFETY): standard safe-dupe rules; LADDER-STALL protocol stands. Then npm install; build green.
## READ-FIRST: specs/epoch-saga/e4-motor-bundle.md (vehicles+fuel: the era's core — player-adjacent vehicles as powered path entities with FUEL as the pressure-analog resource; the tram/rail-follower v2 is the chassis precedent) · the pressure system (the resource-system shape to mirror: harvest→store→spend) · the planar law (vehicles are sim entities on X/Z; visual flourish render-side).
## SCOPE: (1) FuelSystem (tar/fuel harvest nodes → storage → per-vehicle draw; Balance.e4Fuel; the pressure grammar reused); (2) Vehicle entity v1 (a powered path-or-free-move chassis consuming fuel; halts dry; the tram generalized off-rail — one vehicle kind this slice: the HAULER); (3) harness `?debug&vehicles` (spawn, fuel, drive, dry-halt); (4) e2e: fuel loop + dry-halt + resume, determinism, budgets, zero console; both projects. Tram/escort suites unmodified-green.
## Firewall: the two new modules + Balance block + harness + spec + artifacts. NO tiles/contracts, NO E1-E3 systems, NO boss.
## Self-check: tsc+build green · new + tram + escort suites green. If you exit without changes, WRITE WHY first.
END: READY-FOR-GATES + fuel numbers.
