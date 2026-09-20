# s2558 retention sweep and privacy-preserving salvage

The fresh registry contains 110 working trees: 109 answered the untracked read with nonempty tracked-file controls; one could not answer (`/private/tmp/heat11-5e7a7c0b`). The gitless fallback walked and hashed 6,775 evidence files (7,107,705,597 bytes), with the hash count equal to the file count; all 6,775 blobs were reachable from origin refs. No trees were pruned, registered, reset, removed or otherwise modified.

The ordinary sweep found 1,946 evidence candidates: 1,939 quiet files were hashed and seven current-fire files were deferred. At the initial sample, 1,568 were REMOTE-SAFE, 369 LOCAL-ONLY and two AT-RISK. All 1,939 size/mtime pairs and the 110-entry registry were rechecked without a change. These are initial raw-blob classifications, not the final retention verdict below.

The eight inherited exception identities remain unchanged. Six trace originals retain their verified offsite chunk coverage: manifest identity, 23 part sizes and two live origin tips were checked, with no repeat reassembly. The historical heat12 `attempt-1-views.jsonl` remains the explicit owner hold; the rehearsal `segments.jsonl` remains a redundant index. The newly sampled ledger DB was subsequently committed and pushed by the parent as `d9b598a8a`; it is discharged, not outstanding AT-RISK debt. The 39 boss-art files salvaged by s2557 are now all REMOTE-SAFE.

## Newly quiet code-review tree

`/Users/robin/.codex/worktrees/b9fe/Gold Rush` is on `sol/code-review-20260908`, HEAD `d41ab98ce0d7fbc48bb01e8e87c92c61f148de2d`. Its complete regular-file mtime census read 38,207 files with zero errors. The newest write was `artifacts/sol/code-review-fixes-20260908/closeout.json`; the tree had been quiet for 5,726.6 seconds at the final custody check. Main HEAD/index/status and the source tree's status/source hashes remained unchanged during snapshot construction.

Of 362 newly LOCAL-ONLY paths (1,319,031,507 bytes), 84 paths (1,903,244 bytes) are copied Miniflare runtime state, not proof. The live writer is `e2e/mp-02-lockstep.spec.ts`: its STATE_ROOT is test-results, its wrangler invocation uses persist-to, and its MULTIPLAYER_RATE_LIMITS binding creates these sqlite/WAL/SHM/blob/config files. They are excluded and untouched; no auth/account runtime state is published. The exact paths, sizes, hashes and exclusion reasons are in `retention-review-inventory.json` and `retention-sanitized-backup-manifest.json`.

The remaining 278 source proofs total 1,317,128,263 bytes. The retained result is:

| Class | Source files | Treatment |
| --- | ---: | --- |
| Ordinary proof/report files | 262 | Exact source blobs in the parentless snapshot |
| Oversized multiplayer traces | 4 | Exact, reconstructable originals via 18 ordered parts of at most 40 MiB |
| Account browser traces | 12 | Sanitized derivatives only; original hashes retained as provenance |
| Copied runtime state | 84 | Excluded tool scratch, untouched locally |

## Privacy judgment before publication

The loopback-only network location did **not** establish that Authorization values were public fixtures. All 36 headers were compared exactly against the tracked TOKEN in `e2e/cosmetic-grants.spec.ts:15`: zero matched. The 16 distinct Bearer values also had zero exact full-value or stripped-token matches in tracked source. They were therefore treated as unknown credentials, never as safe test constants.

All selected files and every uncompressed ZIP member were scanned for those 16 values. Twelve account trace ZIPs needed 52 exact-value replacements across 28 network/JSON members. Every replacement is recorded using a value digest and a stable redaction placeholder; no credential value appears in a manifest or receipt. The final snapshot has 266 byte-exact source files and 12 sanitized derivatives, totaling 1,316,915,992 retained payload bytes. The sanitized traces must not be described as exact backups of the originals.

An initial unpushed local ref, `save/code-review-evidence-s2558` at `b27b978217b24ae429a31f554868546d5ebf4a9e`, was withheld after this supplemental check. After verifying the separate sanitized snapshot, its sole new local ref was deleted with expected-old-SHA comparison, after proving origin had no corresponding ref. Original files and prior checkpoints remain untouched. No unsafe snapshot was pushed.

The replacement is a separate parentless commit `4ca5559a7204d637142ec0c49dfb1fb8164a84d4`, named `save/code-review-evidence-s2558-sanitized`. It has no unsafe parent. Every stored file was reread from the Git object database, all complete ZIP members were rescanned, and all four split originals were reconstructed by streaming the stored part blobs and matched against their original size, SHA-256 and Git blob identity. No historical stream was reassembled. The final credential scan also covered every regular file under `artifacts/s2558-fire`, including both manifests, header/source-search receipts and helper methods; zero exact-value matches were present.

`retention-sanitized-push.txt` records the push; `retention-origin-verification.json` records the live origin tip, absence of the unsafe ref, manifest identity and final raw-blob accounting. Snapshot paths are retention copies, not implementation adoption or merge authorization. The 100 b9fe raw blobs intentionally still absent from remote reachability consist of 84 excluded scratch files, 12 credential-bearing originals represented by sanitized derivatives and four originals represented by verified parts. They are not 100 newly unhandled proof files.

## Reproduction and receipts

The retained `retention-*-method.py` files are this fire's evidence methods, not permanent factory mechanisms. The unsanitized `retention-salvage-method.py` and its receipt document the withheld operation and must not be rerun or used as publication instructions. Use `retention-sanitized-backup-manifest.json` for reconstruction: ordinary `storedAs` paths are complete files; concatenate each `parts` array in order into separate scratch, then verify the recorded retained bytes/SHA-256/Git blob. For the 12 sanitized derivatives, use the retained identity fields and preserve the distinct original provenance fields.
