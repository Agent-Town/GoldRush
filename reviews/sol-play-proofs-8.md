# Play proofs 8 — candidate held for the full Node gate

**Verdict: HELD, NOT LANDED (s2709, 2026-09-27).** Source branch `sol/map-art-campaign-2`, tip `e1b6c1ea129577a07eb8cf853d08e3c6b61d46d0`; detached merge `e3375fbd10dbde323eb38e9d4ceec1d07aab0385` at `/Users/robin/.goldrush/fire-s2709/wt-pp8`. The goal remains queued and its done-move remains intact. This review is not a shipping claim.

The candidate adds six opt-in native proof specs, their run-12 record, and a Regatta-only movement helper. It changes no player-facing runtime, asset, balance, or existing assertion. The driver uses native inputs to board and steer the race boat. Removing that helper and its map-id-guarded call reproduces the previous driver byte-for-byte.

## Measured gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Live primary policy | CLEAR; linked worktrees refuse to judge their frozen board | `artifacts/s2709/policy.txt` |
| Dependencies / custody | `npm ci` rc 0; clean before merging; detached store at `5793a967da46e8f00c0ba16f92f17dc10d36558d` | `artifacts/s2709/npm-ci.txt`, `artifacts/s2709/session.json` |
| TypeScript / normal build / E1 build | rc 0 / 0 / 0 | `artifacts/s2709/build-gates.txt` |
| E1 entry payload | 34,350,664 B, below 52,000,000 B | `artifacts/s2709/payload.json` |
| Diff-selected guards | 4/5 groups passed; full Node interrupted at the outer 900 s cap (903.9 s), no complete verdict | `artifacts/s2709/build-gates.txt`, `artifacts/s2709/node-partial.tap` |
| Adjacent suites and plain boots | 42/42 passed, both projects, workers=1; separate warmup 1/1 | `artifacts/s2709/browser-gates.txt` |
| Plain boots | Eight boots, desktop 1280×800 and mobile 390×844; zero console/page errors, no debug flag | `artifacts/s2709/plain-boots.json`, `artifacts/s2709/plain-boot-shots/` |
| Own specs, flag unset | 12 correctly skipped, rc 0 | `artifacts/s2709/browser-gates.txt` |
| Fresh Regatta verification | 2/2 passed; six gates finished at 160.667 / 160.000 sim seconds; wave-12 secure, bank, Book and reload, zero errors | `artifacts/s2709/regatta-gates.txt`, `artifacts/s2709/regatta-verification.json` |
| Original native evidence | All 14 compact rows match their external raw rows apart from sample compaction; six complete journeys, eight honest failed proofs, zero browser errors | `artifacts/s2709/native-evidence-audit.json` |
| Evidence budget | Candidate adds 4,146,186 B, below the task's 25 MB target and the landing's 40 MB ceiling | `artifacts/s2709/evidence-budget-source-complete.json` |
| Engine identity | Candidate = main = era 6 pin 71, `2d180e6b…`; no pin made | `artifacts/s2709/engine-initial.json` |

The build transcript's policy rc 2 is an invocation refusal from a linked worktree, not clearance and not a tree defect. The checker was re-run from primary main and passed. The Node interruption is separate and still blocks acceptance: `scripts/run-guards.mjs:256` supplies a 15-minute timeout to each npm child. It terminated the full command during fixture teardown. The partial TAP contains no failing record, but has no final counts or chained-tail verdict. All captured gate PIDs are gone; no process was killed by this fire to obtain a verdict.

## Map verdicts and follow-up

- Flotilla, Regatta and Stillwater: terminal, bank, Book and reload proved on both screens. Optional broader mechanics remain outside these claims.
- Long Road: HELD, deaths at waves 4/5; Hauler never dispatched.
- Deepwater Claim: HELD, budget exits alive at wave 100; deck construction and boss engagement not established.
- Glow Mesa: PARTIAL, authored endings at waves 8/9; the wave-12 bank filter prevents persistence proof. Post-bank reset snapshots must not be used as terminal measurements.

These are QA-driver limitations, not established map defects. The attended corrective `tasks/sol-play-proofs-holds-1.md` already owns convoy/deck engagement and objective-aware bank/snapshot instrumentation after run 10. No new product F-ID or balance change is justified. Original Regatta course times (147.733 / 148.133 s) remain the source run's observations; the fresh verification is a separate second ride per screen, with its own output paths.

## Merge classification

Fork `1168df70bd8980049fa11c2fb4bb59f50b9e24d3`; primary base `da85d7ea3a72d5530f96ac11a048161dff03137e`. Of 103 paths, 102 are NEW and `e2e/native-proofs/driver.ts` is LANE-TOUCHED only. No MAIN-MOVED collision, no conflict, no blob over 50 MB. The complete per-file table is `artifacts/s2709/classification.json`; driver isolation is `artifacts/s2709/scope-audit.json`. Subsequent primary changes are attended task/handover bookkeeping and must be merged into the candidate before continuation.

## Resume in order

1. Recheck primary policy/ownership and classify newer main changes. Preserve this detached candidate and its lane; do not redispatch or re-run the capped wrapper.
2. Follow the established direct full-Node recovery in `artifacts/s2694/report.md`, using Node 26.4.0 and `artifacts/s2709/resume-node-jobs.json` through `gate-battery.mjs`. Keep existing watchdogs and limits. Read the full counts and npm's chained tail; control any real red on clean main.
3. Reuse the completed browser/build evidence only if its executable inputs are unchanged. Measure engine identity last, then finish review, goal/BACKLOG updates, done-move rename, fast-forward and push with the required gates. No runtime deploy or player-visible Gazette item is owed by this test-only candidate.
4. Run 9, run 10 and the holds corrective remain attended-dispatched, serial after their prerequisites land. Ten maps remain in the campaign; the source run-note carries their order.
