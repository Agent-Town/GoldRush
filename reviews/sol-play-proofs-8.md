# Play proofs 8 — direct Node gate complete; final landing pending

**Verdict: READY FOR FINAL LANDING, NOT LANDED (s2710, 2026-09-27).** Source branch `sol/map-art-campaign-2`, tip `e1b6c1ea129577a07eb8cf853d08e3c6b61d46d0`; synchronized detached candidate `7910baa342b020c281454b6236bb71a3c3d40f20` at `/Users/robin/.goldrush/fire-s2709/wt-pp8`. The direct full Node command passed, including its chained legs. This long gate consumed the fire window; the goal remains queued and the done-move intact pending final landing and the required full Node run on main.

The candidate adds six opt-in native proof specs, their run-12 record, and a Regatta-only movement helper. It changes no player-facing runtime, asset, balance, or existing assertion. The driver uses native inputs to board and steer the race boat. Removing that helper and its map-id-guarded call reproduces the previous driver byte-for-byte.

## Measured gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Live primary policy | CLEAR; linked worktrees refuse to judge their frozen board | `artifacts/s2709/policy.txt` |
| Dependencies / custody | `npm ci` rc 0; clean before merging; detached store at `5793a967da46e8f00c0ba16f92f17dc10d36558d` | `artifacts/s2709/npm-ci.txt`, `artifacts/s2709/session.json` |
| TypeScript / normal build / E1 build | rc 0 / 0 / 0 | `artifacts/s2709/build-gates.txt` |
| E1 entry payload | 34,350,664 B, below 52,000,000 B | `artifacts/s2709/payload.json` |
| Diff-selected guards | Prior 4/5 groups green; the direct full Node continuation below completes the outstanding group | `artifacts/s2709/build-gates.txt`, `artifacts/s2710/full-node.txt` |
| Direct full Node, final candidate | **rc 0, 2191.3 s; 1032 pass, 8 skips, zero failures; chained tail 87/87, all npm legs complete** | `artifacts/s2710/full-node.txt`, `artifacts/s2710/full-node-result.json`, `artifacts/s2710/full-node-summary.txt` |
| Reused browser/build evidence | Complete synchronization diff is bookkeeping only; no executable, test, dependency or art input changed | `artifacts/s2710/input-equivalence.json`, `artifacts/s2710/evidence-reuse.json` |
| Adjacent suites and plain boots | 42/42 passed, both projects, workers=1; separate warmup 1/1 | `artifacts/s2709/browser-gates.txt` |
| Plain boots | Eight boots, desktop 1280×800 and mobile 390×844; zero console/page errors, no debug flag | `artifacts/s2709/plain-boots.json`, `artifacts/s2709/plain-boot-shots/` |
| Own specs, flag unset | 12 correctly skipped, rc 0 | `artifacts/s2709/browser-gates.txt` |
| Fresh Regatta verification | 2/2 passed; six gates finished at 160.667 / 160.000 sim seconds; wave-12 secure, bank, Book and reload, zero errors | `artifacts/s2709/regatta-gates.txt`, `artifacts/s2709/regatta-verification.json` |
| Original native evidence | All 14 compact rows match their external raw rows apart from sample compaction; six complete journeys, eight honest failed proofs, zero browser errors | `artifacts/s2709/native-evidence-audit.json` |
| Evidence budget | Candidate adds 4,146,186 B, below the task's 25 MB target and the landing's 40 MB ceiling | `artifacts/s2709/evidence-budget-source-complete.json` |
| Engine identity | Candidate = main = era 6 pin 71, `2d180e6b…`; no pin made | `artifacts/s2710/engine-final.json` |

The initial build transcript's policy rc 2 was an invocation refusal from a linked worktree; fresh primary policy checks are CLEAR. The prior Node interruption is resolved by the complete direct command under Node 26.4.0 and normal fire file concurrency 1. Fixture teardown alone passed in **910.721 s**, explaining why the 900-second diff-wrapper could not finish. The longest TAP silence was **905.3 s**, below the unchanged 2700 s watchdog. No timeout, test, source or pipeline code changed. The complete result supersedes the earlier partial transcript; no control run is required because there were no reds.

## Map verdicts and follow-up

- Flotilla, Regatta and Stillwater: terminal, bank, Book and reload proved on both screens. Optional broader mechanics remain outside these claims.
- Long Road: HELD, deaths at waves 4/5; Hauler never dispatched.
- Deepwater Claim: HELD, budget exits alive at wave 100; deck construction and boss engagement not established.
- Glow Mesa: PARTIAL, authored endings at waves 8/9; the wave-12 bank filter prevents persistence proof. Post-bank reset snapshots must not be used as terminal measurements.

These are QA-driver limitations, not established map defects. The attended corrective `tasks/sol-play-proofs-holds-1.md` already owns convoy/deck engagement and objective-aware bank/snapshot instrumentation after run 10. No new product F-ID or balance change is justified. Original Regatta course times (147.733 / 148.133 s) remain the source run's observations; the fresh verification is a separate second ride per screen, with its own output paths.

## Merge classification

Fork `1168df70bd8980049fa11c2fb4bb59f50b9e24d3`; primary base `da85d7ea3a72d5530f96ac11a048161dff03137e`. Of 103 paths, 102 are NEW and `e2e/native-proofs/driver.ts` is LANE-TOUCHED only. No MAIN-MOVED collision, no conflict, no blob over 50 MB. The complete per-file table is `artifacts/s2709/classification.json`; driver isolation is `artifacts/s2709/scope-audit.json`. s2710 merged newer primary bookkeeping at `762434518` into the candidate without conflict. `artifacts/s2710/input-equivalence.json` lists the complete synchronization diff; no executable inputs moved. Later handoff bookkeeping must be classified and synchronized before landing.

## Resume in order

1. Recheck primary policy and ownership; classify and merge newer main bookkeeping into the preserved candidate. Keep the source lane and its done-move intact until landing.
2. Reuse the completed full Node, build and browser receipts only while their executable/test/dependency/art inputs remain unchanged. Do not repeat the capped wrapper. Measure final engine identity after any cure; this test-only candidate still matches era 6 pin 71.
3. Complete the review, goal status/mergeHash, BACKLOG and done-move rename in the drain commit set; fast-forward main and push. Run the full Node command again on main after the fast-forward. The recent main precedent took 2524.416 s (`artifacts/s2696/main-node-result.json`), so reserve its fire window. No runtime deploy or player-visible Gazette item is owed by this test-only candidate.
4. Run 9, run 10 and the holds corrective remain attended-dispatched, serial after their prerequisites land. Ten maps remain in the campaign; the source run-note carries their order.
