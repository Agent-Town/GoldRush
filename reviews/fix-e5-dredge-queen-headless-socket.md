# fix-e5-dredge-queen-headless-socket — Dredge Queen headless socket

- **Task:** `tasks/fix-e5-dredge-queen-headless-socket.md`
- **Done-move:** `tasks/done/stopped-s1783-gate-side-20260815-075753-fix-e5-dredge-queen-headless-socket.md`
- **Candidate:** `save/fix-e5-dredge-queen-headless-socket-s1783-hold` at `a179b3d27952a3c863f31446f0c737d245a8680f`
- **Gated by:** s1783

## VERDICT: HOLD — NOT MERGED

The candidate makes `DredgeQueenBossSystem` constructible without a DOM and connects its
storm, tick, component-death, defeat-group, and Deepwater storm-clock paths to
`HeadlessContractSim`. It does not satisfy the task's secure-terminal gate. The authored
headless rig remains at the Claim-Boat while the boss anchors at distant wreck sites, so the
fight receives no damage and never advances beyond Act 1.

## Evidence

| Check | Result |
|---|---|
| `node scripts/drain-block-check.mjs ... --strict` | **CLEAR** — policy permits a gate; readiness does not |
| Candidate custody | exact two source paths, `+46/-11`, saved at `a179b3d27952a3c863f31446f0c737d245a8680f` |
| Runner `npx tsc --noEmit` | **rc=0** |
| Runner `npm run build` | **rc=0** |
| Runner `git diff --check` | **rc=0** |
| Direct admission probe | 16,200 ticks / 540 s; storm wave 23; 0 kills; both paddles alive; Act 1; no terminal; `bossHandoffsRefused: 0` |
| Full Node / browser gate | not run after the required secure-terminal check failed |

The exemption, same-game audit, and null-floor artifacts were correctly left unchanged.
`assets/contracts/bench-seeds.json` contains no `e5-deepwater-claim` entry, so the master's
requested two-seed admission proof also lacks its declared input.

## Findings

### F-1783-1 — BLOCKING: the headless actor cannot reach the authored boss arena

The Dredge Queen starts at the last wreck site and repositions among wreck sites. The headless
Prospector stays at the Claim-Boat `(0,30)`; after 540 simulated seconds no weapon has damaged a
component. This is the task's explicit honesty-stop condition, not a balance result. A successor
needs an attended combat-reachability decision before re-admission; a fire may not invent a
teleport, range boost, or damage shortcut.

### F-1783-2 — BLOCKING: the boolean handoff drops the Act-2 escort multiplier

The browser calls `spawnDeepwaterCorsairs()` with `dredgeQueenBoss.escortMultiplier`, currently
two in Act 2. `DeepwaterSocket` accepts only a boolean `DeepwaterBossHandoff` and spawns each
scheduled skiff once. The candidate would therefore halve later storm escorts. Fixing this needs
an explicit `DeepwaterSocket` contract change beyond the master's constructor-wiring-only
firewall; it is not lawful as a drain-side patch.

### F-1783-3 — BLOCKING: the candidate still omits the browser's early-defeat deferral

The candidate repaired the Deepwater storm-wave clock, but its `postBaronDefeat()` immediately
calls `secureCurrentRun(runWave)`. The browser separately checks
`baron.variantId === 'dredge_queen' && runWave < secureWaveForRun()` and records the defeat without
securing early. The candidate's comment claims byte-for-byte browser parity while omitting that
Dredge-specific branch. A successor must carry the guard and a focused before/after check.

## Custody and next action

Undecided source never entered main history. It is preserved on
`save/fix-e5-dredge-queen-headless-socket-s1783-hold`; main's two source files are restored to
their pre-task blobs. The goal leaf is gate-side blocked. Attended should decide the reachability
contract and widen the escort/early-defeat scope before authoring a re-land. E6 remains planned
and undispatched while this shared `HeadlessContractSim` seam is unresolved.
