# e4-03-convoy-weather — the Motor Frontier's engine, part 2 (lane-d; commit prefix "feat:")
ROLE: engine system. WORKDIR: lane-d. CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-14 — E4 spine part 2 (parallel-safe with part 1: disjoint modules; LADDER-STALL only if it needs the Vehicle entity — design CONVOY as behavior over ANY path entities, tram included, so it builds today).
Pre-flight (LANE-SAFETY): standard safe-dupe rules; LADDER-STALL protocol stands. Then npm install; build green.
## READ-FIRST: e4-motor-bundle (convoy AI: grouped movers holding formation on roads, rerouting on blockage — the gap-flow work is the steering precedent · weather v1: a scheduled modifier field — dust storms slowing movement/visibility, the dam-surge telegraph grammar for onset) · the enemy separation/formation code (reuse) · day-night config (weather rides the same scheduler shape).
## SCOPE: (1) ConvoyBehavior (N path-followers keep spacing/formation, leader reroutes on blocked segment — works on trams TODAY, vehicles when part 1 lands); (2) WeatherSystem v1 (scheduled dust-storm events: telegraphed onset, movement/visibility modifier field, era/contract-configured; render = the existing dust/fog affordances, warm never grim); (3) harnesses; (4) e2e: formation spacing under reroute, storm onset/modifier/clear cycle, determinism, zero console; both projects.
## Firewall: the two modules + Balance + harnesses + spec + artifacts. NO enemy AI changes (reuse read-only), NO tiles, NO E1-E3.
## Self-check: tsc+build green · new + tram + gap-flow-adjacent suites green. If you exit without changes, WRITE WHY first.
END: READY-FOR-GATES + storm/formation numbers.
