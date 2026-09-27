# Drain review: `play-proofs-evidence-retention-1`, run 11 of the play proofs lands within the evidence budget through the first real evidence offload (Astra on lane-a; the fire's F-2704-1)

**Branch** `sol/open-findings-astra` at `6974a5cc7` · **merge** `4615253db` · engine hash unchanged (`2d180e6b`, no pin) · drained attended 2026-09-27 11:08Z in a detached chain worktree with the scratch store at `5793a96`; no deploy (scripts/attended/land.sh, config `ppr1`).

**Verdict: LANDED.**

## What it does
Run 11 of the play proofs (`sol-play-proofs-7`, Astra on lane-c) measured six maps and produced 86,013,547 bytes of evidence, more than double the 40,000,000-byte per-landing budget the owner ruled on 2026-09-24 (item 14(a): "Evidence goes to the existing archive repository with an index and small previews in the tree, plus a size budget per landing"). The fire s2704 blocked the drain gate-side (F-2704-1) and authored this corrective; Astra on lane-a executed it: the frozen record (230 files) is sealed byte-identically into `artifacts/sol-play-proofs-7-record/` with a SHA-256 manifest, the live input `board-entry.ts` stays at its import path, the six specs are imported unchanged, the original run note is sealed verbatim with a readable summary at its path, and the source lane is untouched. The drain's cure then ran the factory's own mover, `scripts/evidence-offload.mjs`, against the private archive: the record moved to the archive's `evidence` branch (the first real use of that branch), the index, pointers and previews stayed in the tree, every hash was verified before and after the push, the archive's PRIVATE visibility was re-checked before publication, and the landing's added evidence was re-measured under the ceiling.

## The six maps (run 11)
| Map | Desktop | Phone 390x844 | Verdict |
| --- | --- | --- | --- |
| Drill Yard | practice terminal, Book, reload PASS; standings refusal asserted | same | PASS |
| Dry Gulch | death 16 / 16 | death 16 / 16 | HELD, survival before wave 20 |
| Night Shift | death 17 / 16 | death 15 / 16 | HELD, survival before dawn at 25 |
| Hill Mine | death 1 / 1, cart escort 1/1 | death 2 / 2, cart 1/1 | HELD, the terrace approach at the opening, no builds |
| Trestle | death 13 / 13, cart 1/1 | death 13 / 11, cart 1/1 | HELD, railcar and survival |
| Moth Season | death 12, CONNECT 0/1 | death 13, CONNECT 0/1 | HELD, the driver never establishes the objective |
No reproducible map defect; no F-PP7 IDs; no balance change. "Default / restore" columns per Astra's note: the restore-ground ride did not change any hold.

## Evidence (Astra's packaging run, the drain's cure; the drain's own gates are appended below)
| Check | Result |
| --- | --- |
| packaging | 230 files sealed byte-identically (manifest with sizes and SHA-256); post-offload fixture 6,822,605 added bytes against 40,000,000 |
| Astra's checks | build rc 0; the six specs collect and skip all 12 rows with `GR_NATIVE_PROOF` unset; task-025, m1-01, m2-01 17/17 desktop and 17/17 mobile; plain boots at 1280x800 and 390x844 with zero console/page errors (the first probe waited for the wrong screen and was corrected honestly) |
| the drain's cure | plan numbers matched (230 / 86,011,222 / keep 0); mover applied under `--drain-authorized`; `verify-archive.py` green; `review-evidence-audit --all` green; `evidence-budget` under the ceiling; PRIVATE re-checked; `evidence` branch pushed and its remote tip verified; the cure's lines are in the gates log |

## Merge classification
Base fresh main; the candidate touches the six new specs, `artifacts/sol-play-proofs-7-record/**` (before the offload), `artifacts/play-proofs-evidence-retention-1/**`, the evidence index and pointers (after the offload); main moved on none of them. LANE-TOUCHED only; hash unchanged (no engine input). The source lane `sol/map-art-campaign-2` (six commits, the raw record) is preserved as `archive/sol-play-proofs-7-run-11` and the lane reset to main for run 8.

## Findings
- **F-2704-1 (the fire's):** satisfied by this landing.
- **F-PPR1-1 (for the campaign):** six maps at roughly 14 MB of evidence each cannot land per run under the budget; run 8's master now caps its added evidence at 25 MB (dumps outside the tree, compressed captures, one triplet per project per map).
- The fires may not dispatch Codex correctives (CODEX-WALL); the attended session assigned this one. Lifting the wall is on the owner's desk.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 160 ℹ fail 0` |
| the ledger battery | `rc=0 ℹ tests 1263 ℹ pass 1260 ℹ fail 0 ℹ skipped 3` |
| e2e both projects, --workers=1 | `rc=0   34 passed (2.8m)  10:48Z` |
| full npm run test:node-guards (before the pin) | `rc=1 ℹ tests 1040 ℹ pass 1034 ℹ fail 1 ℹ skipped 5  11:08Z` |
| engine hash | `merged: 2d180e6bad6933ef15db2a006aaa0a1a3be8a97efdf9416cbc4646be71be4f6d (pinned 2d180e6bad6933ef15db2a006aaa0a1a3be8a97efdf9416cbc4646be71be4f6d)` |
