# Task mp-02: lockstep core — two sims, one truth (LANE-D, branch lane/perf, commit prefix "mp:")

You are Codex, implementer for Gold Rush, on Robin's Mac in worktrees/lane-d. READ FIRST: **specs/multiplayer/README.md (BINDING) + docs/api-multiplayer.md (MP-01's protocol — build against it exactly)**; the fixed-timestep loop + determinism hash machinery (perf-04 harness); run-suspend snapshots (the resync vehicle). Pre-flight: safe-dupe by CONTENT. npm install; build green.

## Scope (spec MP-02 — flagged `?mp=dev`, zero default-path impact)
1. **Input-delay lockstep**: the tick loop, when mp-active, sources ALL actors' inputs from the tick-bundle (local input → relay → bundle; ~3-tick delay buffer); sim advances only on complete bundles; local-only play byte-identical when flag off (hash-asserted).
2. **Two-tab proof** via wrangler-dev relay: both clients, same seed/contract, 500+ ticks → identical per-tick hashes (the e2e).
3. **Desync guard**: hash exchange every 30 ticks; mismatch → pause + "the wire crossed" card + auto-resync from the freshest snapshot via the relay's blob pass-through; proven by an injected-desync test.
4. Remote players render as placeholder-tinted heroes v1 (MP-03 owns real presentation).

## Firewall
Touch ONLY: the mp client module (new src/mp/), tick-source seam (flag-gated), the dev flag, e2e + harness, artifacts. NO sim logic changes, NO relay changes (protocol is law — flag gaps), NO UI beyond the dev card.

## Self-check
tsc/build; flag-off byte-identity (seeded hash); the two-client 500-tick identity e2e; injected-desync → resync proven; m1-01 + m2-01 green both projects; zero console errors. Commit on lane/perf. End: READY-FOR-GATES + tick-rate/latency numbers.
