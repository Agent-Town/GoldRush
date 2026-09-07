# s2549 — Full Node gate remains incomplete

## Slice and verdict

`main-board-gold-current-grammar.md`; saved tip `ffac3a697ee37c01e24fe16a36b70b2a1fc145c6` on `save/board-gold-current-grammar-s2547`. Current-base gate candidate `77ef114f9bc0c9d2bbfc79e977f62bb139c59c45` combines it with base `5e20fa91f7bbcd433061cbf1b3c4ed4240498dc4`, including the already-landed bounded process-capture cure.

**HOLD. No source commit or main merge.** The four positive gold cases and retirement checks pass, but the full Node command was stopped by the guard wrapper's 15-minute timeout. This is not complete acceptance evidence.

## Behavior and classification

The only remaining source delta is `scripts/board-tape-gold.test.mjs` (17 additions, 41 deletions); all twelve saved fixture artifacts already exist on main. All 13 saved blobs match the candidate. Three current-grammar local recordings preserve the assay seam, event-hash/outcome equality, secure-snapshot equality and held-purse versus panning distinction. Six historical submissions/slips and the browser arm/helpers remain byte-identical. No runtime, engine pin, dependency, or score changed. No conflict resolution was required. The detached checkout contains the complete tracked corpus; main's completed runner output and disjoint telemetry were preserved.

## Evidence

| Check | Current FIRE result |
|---|---|
| Gold cases | 4/4, 109.7 s; browser standings request intercepted locally |
| Retired grammar | 2/2, 0.3 s |
| Typecheck / build | rc 0, 5.3 / 18.7 s |
| Diff-selected guards | Four short guards pass; power p95 0.360 ms |
| Full Node | Incomplete: npm killed by `run-guards.mjs` at 900 s; wrapper 902.6 s, no terminal test counts; chained npm tail not reached |
| Fixture sweep | Passed board-gold and advanced to later simulation fixtures; no all-128 completion claim |
| Browser adjacency / plain boots | 34/34, 158.0 s; desktop and 390px boots 2/2, 8.6 s, zero console warnings/errors and page errors |
| Mutation / independent review | Prior runner's gold-90-versus-0 mutation and scoped clean Codex review inspected; their artifacts retained verbatim |

Current evidence: `artifacts/s2549-fire/gold-gates.txt`, `artifacts/s2549-fire/browser-gates.txt`, `artifacts/s2549-fire/node-progress.jsonl`, `artifacts/s2549-fire/historical-fixtures.json`, `artifacts/s2549-fire/classification.json`, `artifacts/s2549-fire/report.md`. The first missing-dependency attempt in the append-only transcript is invalid setup evidence; it was stopped before the valid focused run.

## Findings and next action

**F-2549-1 OPEN, gate-side:** the fire selected `run-guards.mjs` for the required full command despite its finite 15-minute npm cutoff. A live simulation child was observed near the cutoff. Its orphaned descendants exited before cleanup could send a signal; the real battery classifier then returned an empty set. No deadline was changed and no interrupted run is accepted.

Next FIRE: resume this same candidate, run full `npm run test:node-guards` directly through `gate-battery.mjs` using `artifacts/s2549-fire/full-node-next-jobs.json`, Node 26.4.0 and FIRE serialization, and retain the entire command's terminal output. This preserves all per-test timeouts while avoiding the outer wrapper cutoff. Confirm all 128 fixture subjects and the chained tail, or classify actual terminal failures. Run the other four selected guards with their explicit `--only` list. No redispatch or new master is needed: full-command verification is already required by this master. F-2541-1's source corrective remains unmerged; F-2546-1's process-capture cure was already merged by s2548. Then resume the separate chapter-evidence drain, preserving main's 138-row Moth tape.

---

The s2547 record below is historical; its pending capture-cure wording predates s2548.

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
