# e4-04-orbit-road — the Motor Frontier's engine, part 3 (lane-a; commit prefix "feat:")
ROLE: engine system. WORKDIR: lane-a. CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-15 (night shift) — the last E4 engine bricks per the bundle: ORBIT spawns + road-grading.

Pre-flight (LANE-SAFETY): standard safe-dupe rules; LADDER-STALL protocol stands. Then npm install; build green.

## READ-FIRST: specs/epoch-saga/e4-motor-bundle.md (ORBIT spawns: waves arrive as circling convoys that peel off the ring road — the spawn ring becomes a literal ROAD; road-grading: player-built road segments that speed friendly vehicles + channel enemy convoys) · the landed e4-02 (vehicles/fuel) + e4-03 (convoy/weather) slices (BUILD ON) · WaveSystem spawn grammar · the build grammar (roads = a buildable per the run3d/build pattern).

## SCOPE: (1) OrbitSpawner: contract-configurable — waves spawn ONTO a ring road and orbit until peel-off points (telegraphed), replacing edge-pops on E4 contracts (E1-E3 unchanged); (2) RoadSegment buildable: graded road speeds friendly vehicles (fuel-efficient) and BIASES enemy convoy routing (they prefer roads — the tower-defense inversion: you build their paths); placeholder art per placeholder-first; (3) harness `?debug&e4orbit`; (4) e2e: orbit spawn + peel telegraphs, road speed effect measured, convoy road-bias proven, E1 spawn suite unmodified-green, determinism, zero console; both projects.
## Firewall: the two modules + Balance.e4 blocks + harness + spec + artifacts. NO E1-E3 spawn changes, NO tiles, NO boss.
## Self-check: tsc+build green · new + convoy + task-025 suites green. If you exit without changes, WRITE WHY first.
END: READY-FOR-GATES + orbit/road numbers.
