CODEX: model=gpt-5.6-sol effort=xhigh

# lane-e2-pressure-socket — make E2's signature mechanic visible to agents (cures F-ER01-1 + F-ER01-3)

ROLE: implementer on lane-a. WORKDIR: worktrees/lane-a (branch lane/a). Commit prefix `psock:`. Never touch STATUS.md, reviews/, tasks/queue/, other lanes.

PRE-FLIGHT (LANE-SAFETY INVARIANT): `git branch --show-current` = `lane/a`; dirty tracked blob not reachable in git → STOP. `git checkout -B lane/a origin/main` ONLY when clean. SAFE-DUPE: `grep -n "pressure" src/sim/HeadlessContractSim.ts` — a pressure consumer already present → STOP and report.

## WHY
`docs/bench/e2-readiness-census.md` F-ER01-1/-3 (merged `3b7abe4e`): Hill Mine and Pressure Garden set `twist.pressureEnabled` but the derived mechanics manifest advertises no pressure rule or operation and `HeadlessContractSim` never runs `PressureSystem` — so the census, correctly, refused admission (AP-11 reject-don't-stretch). This is the ERA-SOCKET class: every epoch's signature mechanic needs exactly this slice before its agents can play. E2's is the first; build it the way the next eight want to copy.

## READ-FIRST
1. `docs/bench/e2-readiness-census.md` — the two findings verbatim; your acceptance is their reversal.
2. `src/systems/PressureSystem.ts` — the truth you derive from: pressure is an Economy resource with bands (`empty|low|working|high`), boiler-house sources, `safeMax` auto-vent (ventLoss, cooldown), diagnostics (band, vents). NOTE `:186`: the vent path mints `crypto.randomUUID()` into an `resource_spent` economy event — establish how event ids interact with the determinism hash BEFORE running pressure headless (if ids enter the hash, sim-context ids must come from the seeded id source the rest of the sim uses; do NOT leave wall-clock/random identity in a hashed path).
3. `specs/agent-play/README.md` §AP-11 — vocabulary is DERIVED from consumers, never invented: rules describe what the sim does (bands, safeMax, vent behavior, what pressure gates); operations exist only where the player has a real lever.
4. How the manifest generator derives existing verbs (grep the mechanics-manifest builder) + how `HeadlessContractSim` wires other systems (its Economy/Wave wiring is the pattern).
5. `assets/contracts/epoch-2-steamworks/contracts.json` — which contracts set `pressureEnabled` and what pressure-consuming works they declare.

## SCOPE
1. `HeadlessContractSim` runs `PressureSystem` for pressure-enabled contracts — same tick order as the browser (find the browser's update order and mirror it; a divergent order is a determinism bug you'd be shipping deliberately).
2. Determinism: two consecutive headless runs of each pressure contract on a pinned seed produce identical event-log hashes. If `randomUUID` ids poison the hash, route sim-context ids through the seeded source — smallest change that keeps browser behavior byte-identical (browser ids may stay random ONLY if they never enter hashed state).
3. Manifest: pressure-enabled contracts derive (a) RULES — bands with thresholds, safeMax + auto-vent semantics, what pressure powers on this contract; (b) OPERATIONS — only real levers (boiler-house build rides the existing BUILD grammar: ensure the building appears in the derived buildables with its pressure meaning; if the consumer analysis finds NO new player lever, say so in the report — zero new operations with complete rules is a VALID outcome, "the vocabulary is honest" beats "the vocabulary is long").
4. Census re-run for the two refused contracts: admit them (`SUPPORTED_CONTRACTS`), re-run ER-01's probes, UPDATE `docs/bench/e2-readiness-census.md` rows + retire F-ER01-1/-3 as CURED (keep the original text, banner it — retention).
5. e2e: extend `e2e/er01-e2-census.spec.ts` — pressure contracts headless-boot + determinism pair holds + manifest carries pressure rules. Machine-independent asserts only.

## TOUCH-ONLY
`src/sim/HeadlessContractSim.ts` · the manifest generator · `src/systems/PressureSystem.ts` ONLY for the id-source seam (behavior byte-identical in browser) · `docs/bench/e2-readiness-census.md` · `e2e/er01-e2-census.spec.ts` · `tasks/BACKLOG.md` (goal-leaf, same commit).

## NO
Balance values · new pressure gameplay/verbs beyond derived truth · F-ER01-2's terminal-outcome remedy (separate ruling, do not fold in) · E3+ sockets (this master is the TEMPLATE, not the sweep) · `Terrain3dClaimPilot.ts`.

## SELF-CHECK
tsc clean · build green · `GR_RELEASE=e1 npm run build:release` green (release strip must not see new E2 imports it can't behead — single-line law if you touch any pilot-adjacent table) · own spec + ER-01 spec green both projects · E1 driver suites green UNMODIFIED · browser pressure behavior byte-identical (`night-mode-truth` + an e2 boot probe, zero console errors).

READY-FOR-GATES. Report: the derived rules verbatim, the operations verdict (with the no-new-levers case called out if so), the id-source decision, updated census rows.
