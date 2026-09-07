# s2547 — current-grammar board-gold fixtures

## Slice and verdict

MAIN task `main-board-gold-current-grammar.md`, completed receipt `20260907-200747-main-board-gold-current-grammar.md`. Candidate `ffac3a697ee37c01e24fe16a36b70b2a1fc145c6` is pushed to `save/board-gold-current-grammar-s2547`, parent `810ef008dc828de64dcc43d97ec2513082aa3323`.

**HOLD; test change not accepted or committed to main.** The runner finished its scoped work, but the full Node command failed and did not execute its chained tail. Lane-a's registered F-2546-1 corrective is still in flight. Preserve this candidate and the completed receipt; do not redispatch it.

## Behavior

Three new local recordings replace the retired-verb positive fixtures. Each still must secure, replay to its own event hash, match its declared outcome and secure snapshot, and distinguish the held purse from lifetime panning. The browser-door case is unchanged. The manifest explicitly records no live county contact and no verified slip; historical tapes and slips are preserved.

## Evidence

These are terminal runner results inspected by this fire, not new gate runs by the fire.

| Check | Result and evidence |
|---|---|
| Three headless positives and browser door | 4/4 pass, zero skips, 106.459 s; `artifacts/board-tape-gold/current-grammar/board-gold.txt` |
| Retirement guard | 2/2 pass; `artifacts/board-tape-gold/current-grammar/retirement-guard.txt` |
| Biting mutation | Changing the scratch Moth snapshot to lifetime panning fails on actual gold 90 versus expected held purse 0; source restored. `artifacts/board-tape-gold/current-grammar/mutation-test.txt` |
| Typecheck, build and independent review | Runner reports typecheck/build exit 0 and scoped review clean; transcript and review's repeated checks retained in `artifacts/board-tape-gold/current-grammar/report.md` and `artifacts/board-tape-gold/current-grammar/codex-review.txt` |
| Full Node command | Exit 1, 1698.991 s; first group 742 tests: 735 pass, 2 fail, 5 explicit skips. `artifacts/board-tape-gold/current-grammar/node-guards.txt` |
| Fixture-owner sweep | Subjects 1–98 of 128 visited; board-gold child passed. Sweep stopped at the contention guard. Chained tail **not run**. |
| Preservation | All 13 candidate blobs matched disk and the saved commit; remote tip independently matched. Main HEAD, index and full status were unchanged by snapshotting. `artifacts/s2547-fire/candidate-snapshot.json` |

The two full-command failures are the direct contention guard and its nested fixture-sweep invocation, both `spawnSync ps ENOBUFS`. The five skips are not coverage. Complete drain adjacency, boot and full-command acceptance remain owed; no runtime acceptance is inferred from the focused checks.

## Merge classification

Runner base: `48628dd094342e323072a95de5bf85f618bf8d7f`. No committed changes to src, functions, the board-gold test, package.json or package-lock.json occurred between that base and the saved candidate's parent.

| Paths | Classification and disposition |
|---|---|
| `scripts/board-tape-gold.test.mjs` | Finished MAIN-owned tracked dirt; only candidate source change. Preserved in the save ref and left untouched in main's working tree. |
| `artifacts/board-tape-gold/current-grammar/` | Twelve new scoped evidence files, each below 5 MiB; retained verbatim. |

No merge conflict was resolved and no runtime file was changed. The scoped source diff is retained in `artifacts/s2547-fire/candidate.diff`.

## Findings and next gate

**F-2546-1 remains gate-side and unresolved.** Its existing lane-a master repairs the bounded process capture and must account for any remaining red. The runner report's attribution of the historical oversized output to a particular FIRE argv is an inference; this fire did not capture the offending process snapshot and does not promote that attribution to fact.

After lane-a finishes, inspect its final report and candidate. Review the finished capture and gold corrections together, then resume serial drains in detached current-base candidates. Classify base failures explicitly and complete each candidate's required gates before accepting it; do not transfer a green result between different trees. Only a complete, honestly classified command can release this HOLD. Then resume the saved chapter-writer candidate, preserving main's 138-row Moth recording and finishing its browser gates. No owner decision is needed for these gate-side obligations.
