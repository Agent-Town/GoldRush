# Task lane-map-census: THE CENSUS HARNESS — every class proven on every map (LADDER → queue lane-b after panorama, commit prefix "feat:")
You are Codex, implementer for Gold Rush (worktrees/lane-c).
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: docs/MAP-QUALITY-REGISTER.md (the law this enforces) · e2e/run3d-interaction.spec.ts + terrain3d-default.spec.ts (check grammars to generalize) · the 41 contract ids (assets/contracts/*/contracts.json).
Pre-flight: standard safe-dupe; npm i; tsc+build green.
## Why (owner 2026-07-19: "If we can do it for one, then we probably can also do it for the others." — the register needs a referee, or CLOSED is vibes)
## Scope
1. e2e/map-census.spec.ts: parameterized over ALL 41 doors (&debug&era=N per map's epoch): per map assert the register's FIXED/CLOSED-class checks — boot clean (zero console/page errors) · renderSource truth (3d for registry maps, painted fallback legal otherwise) · MQ-1 preview-visible probe · (MQ-2/3 checks land with their fixes — structure the spec so a class = one helper, added per column). Budget: single-worker friendly, ≤10s/map target; desktop project for the census (mobile spot-set: 5 maps).
2. The census emits artifacts/map-census/table.md (map × class), committed — the register's Status column cites it.
3. Wire a npm script (census) for one-command runs.
## Firewall: spec+script+artifacts only; NO src changes.
END: READY-FOR-GATES + the first census table + which classes are census-green today.
