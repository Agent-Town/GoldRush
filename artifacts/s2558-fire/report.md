# s2558 FIRE — daily ledger mirror and quiet review retention

2026-09-08, native Mac. Main started at `8998a0e69`; lock `ce8620c5b` archived s2557's full handoff verbatim before work. No runtime change, lane drain, queue refill, or deploy.

## Landed

- **LB-01:** `d9b598a8a` commits the September 8 ledger mirror and verification receipts; pushed to origin and its live main tip verified. SQLite `quick_check=ok`: 36 standings/assay keys, 14 refusal records, no account-class rows. The full mirror series is **16/16 days, whole and current**. Refusal metadata contains anonymous rider/profile identifiers; account credentials are absent. See `ledger-integrity.json`, `ledger-pull.txt`, and `ledger-freshness.txt`.
- **Retention:** the quiet `sol/code-review-20260908` tree at `/Users/robin/.codex/worktrees/b9fe/Gold Rush` held 278 proof/report files totaling 1,317,128,263 original bytes. Its separate parentless snapshot is `save/code-review-evidence-s2558-sanitized` at `4ca5559a7204d637142ec0c49dfb1fb8164a84d4`. Final offsite verification is recorded in the retention receipts. This is evidence storage, never a merge candidate.
- Of those 278 files, **266 are preserved byte-exact** and **12 browser traces are sanitized derivatives**. Thirty-six Authorization headers held 16 unknown bearer values absent from tracked fixtures. Exact values were removed from every affected archive member before publication; stored contents and this fire's receipts were scanned for them. The unpublished original snapshot ref was compare-and-deleted after proving it absent from origin; source files and existing checkpoints remain untouched.
- Four large, unchanged traces are retained as **18 parts of at most 40 MiB**. Streaming reconstruction from stored Git blobs matched each original SHA-256, Git blob ID, and size. The manifest records paths, original hashes, ordered parts, and which files were redacted. **84 copied Miniflare runtime-state files (1,903,244 bytes) were excluded as tool scratch.** Main HEAD/index/status and source status/hashes were unchanged by salvage.

## Board and standing duties

| Check | Current evidence |
| --- | --- |
| Runner and service | ALIVE; landing/game/API 200; queued 0, in-flight 0, assayer pending 0 (`health.txt`) |
| Done-moves | 1,415 files, 60 selected: REAL 0 / UNKNOWN 0 / CLOSED 12 / MERGED 48; all 48 merge hashes independently verified ancestors of main (`dry-board.txt`, `merged-ancestry.json`) |
| Refill | 10 planned leaves, all priced: owner-gated 7, prose-only 1, attended-owed 1, needs-spec 1; none fire-authorable (`authorable.txt`) |
| Lane safety | a/b/c USABLE; d DIRTY with 26 foreign tracked screenshots. No lane ahead; no resets or cleanups (`lanes.txt`) |
| Implementer | No CODEX-WALL; no new failed run since s2557. Latest retained run banner: Codex 0.153.4, gpt-5.6-sol, terminal READY-FOR-GATES (`duty-state.json`) |
| ART | **6 areas scanned / 1,024 files; AT RISK 0 / LOCAL-ONLY 0** (`art-staging.txt`) |
| GZ-01 | 247 reported / 115 dismissed / 0 candidates; W37 3 standalone / 2 batched. No new player-visible news (`gazette.txt`) |
| TK-01 / RT-01 | September 7 digest already tracked. `r2026w37` is open; public rotation fence equals registry and active site ID matches. Next mint is not due (`rotation.json`) |
| Owner desk | 55 segments retained verbatim; CLOSED 0 / OPEN 2 / BOTH 0 / OPEN-DESK-ONLY 53 / UNRECORDED 0 (`desk.txt`) |

The every-worktree census visited **110 registered trees: 109 answered with tracked-file controls, one required the gitless fallback**. That fallback matched **6,775/6,775** files to origin-reachable blobs. The quiet census initially contained 1,939 candidates; its sampled classifications are not a post-salvage all-clear. See the final retention report for the reconciled disposition.

The six inherited raw traces remain covered by their existing 23-part offsite manifests; this fire verified parts and origin tips without claiming a fresh reassembly. The inherited 274,833,116-byte heat12 view stream remains LOCAL-ONLY under its existing hold; the 2,203-byte rehearsal index remains redundant local residue. No blanket `AT RISK 0` is claimed for the whole estate. The withheld-run audit read 377 logs and found no recoverable on-disk withheld output; its 109 historical LOST rows are raw-path classifications, not proof that all underlying information is absent elsewhere (`withheld.txt`).

## Closeout

The closing `npm run test:ledger-guards` **passed after handoff commit `d211b83c1`**, on Node 26.4.0 with PTY stdin: exit 0 in 99.349 seconds, 1,050/1,050 Node tests, zero failed or skipped, and 83/83 foundry-init assertions. All three desk guards reported PASS; both live runner-custody arms evaluated. HEAD remained unchanged during the gate. Terminal receipts are `closing-ledger.json` and `closing-ledger.txt`. No build or browser regression is claimed for this evidence-only increment.

Next: triage new done-moves first; preserve the attended holds and foreign working-tree state. Revisit retention only for newly quiet/uncovered evidence; the historical exceptions above remain explicitly scoped. No owner ruling was invented or closed.
