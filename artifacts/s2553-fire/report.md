# s2553 — chapter evidence writers shipped

## Slice and verdict

**SHIPPED** at `696e2e713703247af3dd0bac75c74f57cdab7c56`. Master `tasks/lane-c-chapter-evidence-opt-in.md`; original lane `feat/hero-move-verb` at `386e129f714e634d9a2a9a18f31f8afa9f08f0fd`. Saved candidate `ca0fec7e361c2a5ed82e5a8598a93dc47a7cd281`, based on `d49604f87c18ed773b5fd8119256e737e8e7b734`, was gated in `/private/tmp/gr-gate-s2552`. Main moved only in bookkeeping before integration; the exact association is in `artifacts/s2553-fire/final-tree-association.json`.

Seven existing writers now put ordinary output under ignored test-results/evidence paths. Only literal GR_REFRESH_EVIDENCE=1 writes the retained chapter screenshots or Moth recording. Assertions, triggers, current readiness waits, simulation and retained evidence stay unchanged.

## Evidence

| Check | Result |
| --- | --- |
| Full direct Node 26.4.0 command, alone | rc 0, 1440.5 s; 742 tests, 737 pass, zero fail/cancelled, five documented skips; all 128 fixture owners and complete npm tail. `artifacts/s2553-fire/full-node.txt` |
| task-025 / M1 / M2, desktop and mobile | 34/34, rc 0, 143.6 s, one worker. `artifacts/s2553-fire/browser.txt` |
| Plain clean-storage boots, 1280px / 390px | 2/2, 8.4 s; zero console warnings/errors and page errors. Same transcript. |
| Six chapters on this exact candidate | 68/68, rc 0, 1304.9 s; 50 scratch PNGs. Reused `artifacts/s2552-fire/chapters.txt` and `artifacts/s2552-fire/chapter-default-proof.json`. |
| Typecheck / build / auxiliary guards | Pass on the same candidate. `artifacts/s2552-fire/compile.txt`; isolated power p95 0.322 ms, `artifacts/s2552-fire/power-isolated.txt`. |
| Moth default / explicit / default | 4/4 + 1/1 + 4/4; current 138-row, fnv1a32:f7af6739 recording. `artifacts/s2552-fire/moth-proof.json`. |
| Chapter explicit refresh | 1/1, five retained-path writes in the isolated tree, captured then restored. `artifacts/s2552-fire/chapter-refresh-proof.json`. |
| Retention after all gates | All 51 retained hashes unchanged; candidate source clean. `artifacts/s2553-fire/final-tree-association.json`. Three adjacency screenshots retained under `artifacts/s2553-fire/adjacency-shots/`. |

The five Node skips are the two owner-ruled Baron cases and three fire-shell cross-engine cases; they are not coverage. The mid-fire desk-declaration tail correctly skipped under the lock; the closing ledger battery must evaluate the actual outgoing desk. The s2552 overlap power red and unmatched refresh selector remain in their original receipts; neither was erased or called a pass.

## Merge classification

The integrated diff is seven files, nine insertions and eight deletions. Six chapter SHOTS constants and one Moth output-directory choice were grafted. Main's newer four-test Moth program, chapter readiness waits and current recording win over the older lane bytes. Per-path classification and patch: `artifacts/s2553-fire/classification.json`, `artifacts/s2553-fire/candidate.patch`.

The lane's original report is preserved verbatim at `artifacts/s2536-fire/runner-report.md` (4,234 bytes, equality verified). Its old recording remains in git history. After the gated source merge, ancestry-only merge `d07c0692247757dc1ad740821c94e02b29803ea4` acknowledged all nine classified lane paths with an identical before/after tree. Lane main..tip is now empty; no lane reset was used. `artifacts/s2553-fire/merge.json` records that proof.

## Findings and follow-through

No new source defect or owner decision. F-AGE2-3 and F-AGE2-5 are discharged; prior readiness, placement and board-gold correctives remain intact. Goal registration and done-move closure belong to this drain; do not redispatch the master. No gameplay-affecting code changed, so deployment is not owed. The next action is the normal board triage after the closing retention and ledger checks.


## Closing duties

All three consumed chapter save refs were renamed to archive refs and pushed atomically; original lane ahead=0. Board REAL=0/UNKNOWN=0; all ten planned leaves are priced, none fire-authorable, so no refill. Runner alive, queues/in-flight/pending orders zero. Lane-d's 26 tracked art changes and lane-b's untracked evidence remain their owners' work. No gameplay deployment is owed.

The inherited 55-item desk audit found zero closed items; all 55 are carried verbatim. Ledger, rotation, ticker timing and gazette judgments are recorded in `artifacts/s2553-fire/standing-duties.json`. The full retention judgment is `artifacts/s2553-fire/retention-judgment.md`. The final post-handoff battery receipt belongs at `artifacts/s2553-fire/closing-ledger.txt`; it must evaluate the desk rather than skip it.

Closing verification: `artifacts/s2553-fire/closing-ledger.txt` passed after the handoff commit in 108.5 s: 1,050/1,050 Node assertions, zero skips/failures, and 83 bash checks. Desk declaration, birth and carryforward all evaluated PASS; previous/current desks both contain 55 items, dropped zero.
