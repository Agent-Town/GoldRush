# e3-04-wire-spans — the catenary lines (lane-b; commit prefix "feat:")
ROLE: render system. WORKDIR: lane-b. CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-14 — E3 spine 3/6 (owner: "Keep the lanes busy. Lets do this.").
Pre-flight (LANE-SAFETY): standard safe-dupe rules; LADDER-STALL protocol stands. Then npm install; build green.
## READ-FIRST: the landed power-graph slice (its dev-catenary artifact suggests a starting seam — build on it, don't fork) · e3-voltage-bundle §C ("wire span rendering (instanced catenary)") · the instanced-mesh patterns in pools.ts · performance budgets.
## SCOPE: (1) Instanced catenary span rendering between connected power nodes (sag curve, instanced segments, batched — hundreds of spans within budget); powered vs dark spans read differently (teal-lit vs dead-grey line, warm not neon); (2) spans update on graph change events (no per-frame rebuild); (3) harness: spans visible in ?debug&powergraph; (4) e2e: span count matches graph edges, powered/dark states track component states, draw-call budget probe, zero console; both projects. Power-graph suite unmodified-green.
## Firewall: the span renderer module + harness hookup + spec + artifacts ONLY. NO graph logic, NO tiles, NO Balance.
## Self-check: tsc+build green · new + power-graph suites green · budget numbers reported. If you exit without changes, WRITE WHY first.
END: READY-FOR-GATES + span budget table.
