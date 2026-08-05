CODEX: model=gpt-5.6-sol effort=xhigh

# lane-er01-e2-census — ER-01: the machines sweep Steamworks before the owner rides

ROLE: implementer on lane-b. WORKDIR: worktrees/lane-b (branch lane/b). Commit prefix `er01:`. Never touch STATUS.md, reviews/, tasks/queue/, other lanes.

PRE-FLIGHT (LANE-SAFETY INVARIANT): `git branch --show-current` = `lane/b`; any dirty tracked blob not reachable in git → STOP and report. `git checkout -B lane/b origin/main` ONLY when clean. SAFE-DUPE: `ls docs/bench/e2-readiness-census.md` — exists → STOP and report.

## WHY (owner directives, verbatim)
2026-08-05: "Maybe agents playing the contracts could surface issues already?" → "ok, lets go". The spec is `specs/e2-readiness/README.md` (RATIFIED-BY-DIRECTIVE): agents own the mechanical layer so the owner's Steamworks first-ride is one evening of judgment, not a marathon of bug-hunting. ER-00's substrate is CONFIRMED ON MAIN: cross-engine determinism cured (`eaefdb24`, `scalePerWave` at `src/systems/WaveSystem.ts:74`) and all five E1 drivers live (`src/sim/HeadlessContractSim.ts:35` — the pattern you extend).

## READ-FIRST
1. `specs/e2-readiness/README.md` — ER-01's contract: boots clean, verbs respond per the mechanics manifest, engineDependencies declared, sim-only completability at trail.
2. `src/sim/HeadlessContractSim.ts` — SUPPORTED_CONTRACTS and how the five E1 drivers admit a contract (f1412-1's twin-banks landing `2c22b2ab` and f1414-1's baron landing `1a4831df` are the two cleanest reference diffs — `git show` them).
3. `assets/contracts/epoch-2-steamworks/contracts.json` — the E2 board contracts this census covers (training/drill-class maps excluded per spec default 1).
4. `docs/bench/agent-playability-census.md` — the E1 census's table format and verdict vocabulary; ER-01 continues it, not reinvents it.
5. `specs/agent-play/README.md` §AP-11 — the mechanics manifest: a verb the manifest can't express is a FINDING ("reject-don't-stretch"), never a stretch.

## SCOPE
1. Admit each epoch-2-steamworks board contract to the headless sim (SUPPORTED_CONTRACTS + whatever per-contract wiring the twin-banks/baron reference diffs show is needed — engineDependencies declared per the census mandate; a contract that CANNOT be admitted cleanly is a red row with a named reason, not a forced admit).
2. Bench seeds: two pinned seeds per admitted contract in the bench-seeds registry (follow the E1 naming pattern).
3. The census run: for each contract × both seeds — boots clean (zero console/page errors), every manifest verb responds, a naive-baseline GR-SIM run at trail reports secured/died + waves + calls. Deterministic: same seed twice ⇒ identical eventLogHash (assert it).
4. `docs/bench/e2-readiness-census.md`: the table (contract · admitted? · boots? · verbs? · determinism? · naive-trail outcome · verdict + reason), E1-census format. EVERY red row spawns a one-paragraph finding stub in the same file's FINDINGS section — fix masters are the attended session's to author from your stubs (generator proposes, contract disposes).
5. e2e `e2e/er01-e2-census.spec.ts`: machine-independent asserts only — each admitted contract headless-boots + determinism pair holds. No wall-clock/perf asserts (F-1440-2's law).

## TOUCH-ONLY
`src/sim/HeadlessContractSim.ts` (admissions) · the bench-seeds registry · `docs/bench/e2-readiness-census.md` · `e2e/er01-e2-census.spec.ts` · `tasks/BACKLOG.md` (goal-leaf under agent-play, same commit).

## NO
Sim/Balance/contract-content FIXES (findings become stubs, never drive-bys — even a one-line "obvious" cure) · E1 driver behavior (their suites stay green UNMODIFIED) · the E2 beauty re-land ladder's surfaces (`Terrain3dClaimPilot.ts` is NOT yours) · `functions/` · release transforms.

## SELF-CHECK
tsc clean · `npm run build` green · own spec green both projects · `gr-sim.test.mjs` + the E1 driver suites green UNMODIFIED · zero console/page errors · the census table complete with NO silent omissions (a contract you couldn't census is a row saying so).

READY-FOR-GATES. Report: the census table verbatim, findings count, which reference diff patterns you reused.
