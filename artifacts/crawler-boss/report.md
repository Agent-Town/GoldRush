# Crawler boss — preflight stall

**Verdict:** LADDER-STALL: waiting on drain of `canyon-works-01`.

The Crawler task requires `e3-canyon-works` wave-14 wiring and its adjacent
suite to remain green. On this task's refreshed `main` base:

- `assets/contracts/epoch-3-voltage/contracts.json` contains only
  `e3-moth-season`; there is no `e3-canyon-works` contract or boss wave.
- `e2e/e3-canyon-works.spec.ts` does not exist.
- `src/game/Game.ts` creates `PowerGraphSystem` only behind the existing dev
  power-graph switch, so there is no Canyon Works runtime graph for a drain
  mast to consume through the required public seam.
- Git history records both `canyon-works-01` attempts as infrastructure
  failures with no content output.

Building around those absences would violate this slice's firewall by taking
ownership of CW-01's contract, tile, graph composition, day/night composition,
and canyon test suite. Re-run this slice after CW-01 lands.

Preflight evidence: `npm install --no-audit --no-fund` and `npm run build`
completed successfully before this check.
