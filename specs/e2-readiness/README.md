# E2 READINESS — the machines ride Steamworks before the owner does
Status: RATIFIED-BY-DIRECTIVE 2026-08-05 (owner: "Maybe agents playing the contracts could surface issues already?" → plan approved verbatim: "ok, lets go"). This is the epoch-instance of the agent-play program (specs/agent-play/) applied as a PRE-OWNER GATE — the pattern E1 proved by accident (the census found 40/41 contracts agent-unready; the rehearsals found dead verbs and "the darkness needs a verb" before any human hit them).

## The law
No epoch opens for owner playtest until agents have swept it. Agents own the MECHANICAL layer: boots, verbs, completability, softlocks, balance cliffs, determinism. The owner owns the JUDGMENT layer: feel, fun, look, canon. His session comes LAST and should be one evening, not E1's marathon.

## Slices
- **ER-00 substrate (queued with this spec):** the two stopped leaves E2 testing rides on, re-queued with changed premise — `f1404-1` cross-engine wave-scaling determinism (blocks any bench-grade E2 run and the baron driver) and `f1400-1` twin-banks driver re-land (the driver PATTERN E2 drivers copy). Both stopped ~last week on stale mains; today's main is 40+ merges newer and the release settled under them.
- **ER-01 the E2 census:** headless sweep of every epoch-2-steamworks contract — boots clean (zero console), verbs respond per the mechanics manifest (AP-11), engineDependencies declared, a sim-only completability probe (GR-SIM plays a naive baseline to prove the contract is winnable at trail). Census table lands in `docs/bench/e2-readiness-census.md` with per-contract verdicts; every red spawns a fix master in the same commit.
- **ER-02 the rehearsal:** standing-orders agents (shipped pipeline only) play the E2 card at trail + one higher tier, few-call discipline, tapes kept. Findings filed exactly like E1's rehearsals (dead verbs, unreachable affordances, degenerate strategies). Depends: ER-01 drivers + ER-00 determinism.
- **ER-03 the fix wave + re-sweep:** fix masters drain, census re-runs green, THEN the owner rides — one session, judgment only, ideally folding in the 27-map campaign verdicts (`docs/MAP-CAMPAIGN-LEDGER.md`, F-1368-1: verdicts are the single biggest unlock on the desk).

## Integration map
Touches: `scripts/gr-sim.mjs` driver registry (E2 drivers), `docs/bench/`, `tasks/` masters. Does NOT touch: sim/Balance (findings become masters, never drive-by fixes), the E2 beauty re-land ladder (parallel, separate lanes), release-E1 (independent).

## Ratification questions (defaults chosen)
1. Which E2 contracts gate ER-03? DEFAULT: all of epoch-2's board contracts; drill-yard-class training maps excluded (they never print, never gate).
2. Rehearsal difficulty pair? DEFAULT: trail + vein-hunter (E1's proven pair).
