# AP-16-6C — truthful terminal receipts

**Slice:** `lane-d-ap16-6c-terminal-receipt-reland`
**Branch:** `lane/d`
**Tip:** `6a7ef31dec45aeb3c8ff8fd8d610066dc60961ea`
**Base:** `ab75eadcbb2487274a03bdddeb66ac280e1e3539`
**Merge:** `dbcbf31220e2dc332f7e809c3ab00572f7fe88bb`

## Verdict

**MERGED.** AP-16-6B's saved implementation replayed with the same stable patch id, and the one missing headless diagnostic now publishes `run.lastRunEndedReason: "secured"` only after a bank choice. Pending choice and rush remain nonterminal. This closes F-1697-1 and the six AP-16-6 gate findings without restoring the ambiguous `runState === "secured"` fallback.

## What it does

The agent door now exposes idempotent weapon selection, secure-window choice, and build/megaproject context actions through the same rules used by browser play. Headless and browser-owned seats publish truthful weapon, works, secure-window, megaproject, and terminal receipts. The generated Same-Game audit records the remaining cited exemptions instead of hiding them.

## Evidence

All fire gates ran in detached custody at `/tmp/gr-s1698-ap16-6c`, on Node 26.4.0. Full transcript: `artifacts/ap16-6c-gate-s1698.txt`.

| Gate | Result |
|---|---:|
| exact `drain-block-check` | CLEAR, live leaf `queued` |
| `npx tsc --noEmit` | rc 0, 4.3 s |
| `npm run build` | rc 0, 15.9 s |
| full `test:node-guards`, alone | 459 total / 454 pass / 0 fail / 5 skip, 352.4 s |
| power budget | p95 0.319 ms / 0.500 ms cap, PASS |
| task/citation/gate-caller guards | rc 0; detached task audit correctly self-skipped and is re-run on main after bookkeeping |
| AP-16-6 browser + adjacent matrix | 51 pass / 1 skip, desktop + 390 px, 177.2 s |
| plain boot error probe | 2/2 pass, desktop + 390 px, captured console/page errors empty |
| Same-Game audit twice | byte-identical SHA-256 `95a7b9922c036de21214458e96aafb5489f86414dbb01818ba9714c54de4b60d` |

The first node attempt used the inherited Node 23.11.1 and failed only the repository's Node-floor diagnostic. It was discarded, then the complete node gate was repeated under the pinned Node 26.4.0 and passed. A later duplicate `run-guards --changed-since` invocation hung in its fixture-teardown self-test; it was stopped after the already-identical full node battery had passed, and its four non-duplicated guards were run individually. No candidate failure was excused.

No screenshot was produced: this slice changes the agent command/receipt boundary and generated documentation, not rendered pixels. The plain player boot remained error-free in both required viewports.

## Merge classification

Main changed only `STATUS.md`, `logs/dashboard.html`, and `logs/task-stats.jsonl` after the lane base. The intersection with all fourteen lane paths was empty immediately before merge.

| Path | Classification |
|---|---|
| `docs/bench/same-game-audit.md` | LANE-TOUCHED, generated audit |
| `e2e/agent-view.spec.ts` | LANE-TOUCHED |
| `e2e/ap16-6-browser-seat.spec.ts` | NEW |
| `e2e/ap16-6-final-verbs.spec.ts` | NEW |
| `public/skill.md` | LANE-TOUCHED |
| `scripts/gr-sim.mjs` | LANE-TOUCHED |
| `scripts/gr-sim.test.mjs` | LANE-TOUCHED |
| `scripts/same-game-audit.mjs` | LANE-TOUCHED |
| `scripts/same-game-audit.test.mjs` | LANE-TOUCHED |
| `src/agent/StandingOrders.ts` | LANE-TOUCHED |
| `src/agent/View.ts` | LANE-TOUCHED |
| `src/game/Game.ts` | LANE-TOUCHED |
| `src/mp/AgentRiderBody.ts` | LANE-TOUCHED |
| `src/sim/HeadlessContractSim.ts` | LANE-TOUCHED; AP-16-6C adds the terminal reason here |

The lane merged with `ort`, without conflicts or hand resolution.

## Findings

- **F-1697-1 CLOSED:** both deterministic Claim and Twin Banks drivers now finish banked runs with `secured` receipts; pending and rush remain nonterminal.
- **F-1694-1 through F-1694-6 CLOSED:** the final-verbs re-land passed the full sim and browser gates above.
- No new blocking finding.
