# Rider parity reach — stage 3

## Slice and verdict

`lane-a-rider-parity-reach-stage3.md`, runner tip `7f6d4065926d8f3055db265ca114d5b602882a46` on `feat/e10s-4-door`. **PASS — merged as `85a159e2e5ef428b85d55a4c244faf24ae027f48`.**

## Behavior

The strict Prospector-read census follows shipped ADR-005 stage 3: ten reads, with hollow-crossing and playbook-suspension checks explicitly anchored to the hero. New mutation controls reject reverting either site or adding an unexpected Prospector read. Runtime, grammar, economy and damage ownership are unchanged.

## Evidence

The disjoint candidate `b8c94406dde131168217e59a190ec7f953013aa0` passed the complete direct Node command in 1464.9 s: 742 tests, 737 pass, zero fail/cancelled, five documented skips (two owner-ruled Baron cases and three fire-shell cross-engine cases). All 128 fixture owners passed, including this test and the gold test; the complete npm tail ran. The lane's focused 9/9 and combined 16/16 counts remain attributed to its report, not re-labelled as new standalone runs. Typecheck/build pass in 5.3/20.4 s; four selected guards pass, power p95 0.371 ms; browser adjacency 34/34 in 163.2 s and plain desktop/390px boots 2/2 in 8.4 s with zero console/page errors. The independent read-only Codex review found no actionable issue.

Current receipts: `artifacts/s2551-fire/full-node.txt`, `artifacts/s2551-fire/full-node-result.json`, `artifacts/s2551-fire/remaining-gates.txt`, `artifacts/s2551-fire/browser-gates.txt`, `artifacts/s2551-fire/codex-review.txt`, `artifacts/s2551-fire/adjacency-shots.json`. Runner evidence: `artifacts/rider-parity-reach-stage3/report.md`.

## Merge classification

Base `3cf0b8f8a2c972c8b0ae1b3bcab568cf9a250a74`; neither changed path moved on main. `scripts/rider-parity-reach.test.mjs` and the runner report are LANE-ONLY. No conflict resolution. The explicit disjoint-pair exception shares the gate with the separately preserved gold test; neither edits runtime source exercised by the other. See `artifacts/s2551-fire/path-classification.json`.

## Findings

F-2550-1 is resolved. No new finding or owner decision. Closing task/desk ledger checks follow the handoff; their ACTIVE-lock skips in the integration tail are not claimed as desk coverage.
