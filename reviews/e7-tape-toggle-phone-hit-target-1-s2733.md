# Tape Reel hit-target audit — s2733 gate review

**READY-FOR-GATES — HELD, not landed.** The focused audit passes; the mandatory full Node battery did not complete.

- Slice: e7-tape-toggle-phone-hit-target-1. Source branch: sol/open-findings-astra; source tip: 97903ef7b51c508ab363b5b759fe90b2c00a7972.
- Main base: bc9d86e19d86baca7d6186b3f218acbb010ed5da. Merge base: a7ea93c4694252ddbf2e02b9497090976938b1e9.
- Detached candidate: 0be1f8ee2, retained as save/s2733-tape-audit at ~/.goldrush/s2733/wt-tape. Control: ~/.goldrush/s2733/wt-control at the main base.

## What the audit establishes

No production change was made. In plain board launches, the Tape Reel toggle is reachable on desktop and at 390 px in the audited HUD-mounted, wave-one and modal-closed states. All 40 unobscured centre/corner samples reached the toggle (desktop 15/15, phone 25/25); all 10 samples under the open Patent Office reached that modal. Normal click/tap opened the library. Echo Canyon was checked on both projects; Relay Rush and Dead Band received extra phone samples. Both fresh screenshots were inspected: gameplay and the outlined button are visible.

This proves sampled hit-target reachability. It does not complete the native phone objectives or establish the cause of every interception in run 16. No player-facing layering defect was reproduced, so the task's conditional production fix was correctly omitted.

## Fresh evidence

All receipts below are under artifacts/s2733/; browser commands used port 5413, a real warmed dev server and one worker. Both detached trees used npm ci and were clean before gates.

| Gate | Result | Receipt |
| --- | --- | --- |
| Strict policy on the live primary board | CLEAR, rc 0 | task remains queued |
| Typecheck | rc 0, 7.3 s | build-gates.txt |
| Normal build | rc 0, 44.4 s | build-gates.txt |
| E1 build | rc 0, 22.8 s | release-gates.txt |
| E1 entry payload | 34,350,664 B < 52,000,000 B | payload.json |
| Diff-picked guards | 4/5 pass; full Node child terminated at 900 s | diff-guard-stats.jsonl |
| Power budget | p95 0.454 ms | diff-guard-stats.jsonl |
| Source evidence budget | 646,406 B, below 40 MB | build-gates.txt |
| Own audit | 2/2 pass | browser-gates.txt, audit/, hit-summary.json |
| Adjacent and plain boots | 44 pass, 2 inherited failures; combined with own audit 46 pass / 2 fail, 578.2 s | browser-gates.txt |
| Clean-main inheritance control | same 2/2 failures, 61.4 s | control-gates.txt |
| Plain boots | 8/8, zero console/page errors; desktop and 390 px | plain/ |
| Last measured engine hash | unchanged, 2d180e6bad6933ef15db2a006aaa0a1a3be8a97efdf9416cbc4646be71be4f6d | engine-hash.json |

Adjacents: task-025 10/10 (plus a separate warmup), m1-01 10/10, m2-01 14/14, plain boots 8/8, and the playbook record/name/shelf/replay cases 2/2. The inheritance cases are the only browser failures. No assertions were changed. No rendering code changed, so no new rendering-performance claim is made; the existing stress draw-call checks passed.

## Blocking finding and attribution

The full Node verdict is **incomplete**. scripts/run-guards.mjs applies a fixed 900-second outer limit; its Node child returned signal:SIGTERM. The retained partial TAP has 488 ok records (3 marked skipped), one file-level write EPIPE near termination, and no final summary. The EPIPE follows the wrapper termination in time; its causal relationship is an inference, not an independently attributed product defect. Static gates used the shell's Node 23.11.1; release/browser/control gates explicitly used Node 26.4.0. No runtime-only cure is claimed. The earlier attended Holds-2 full batteries took about 18 and 21 minutes, already beyond this wrapper limit. Do not accept this partial battery or blindly repeat the identical setup.

F-SPH2-2 is separately reproduced on the clean main base: the test titled "the tape drawer arms at the Signal Era and remains inherited afterward" fails on both projects at its last visibility assertion because playbook-toggle is absent. The candidate and control fingerprints match. Re-reading Game.ts and ContractFamilies.ts corroborates the existing finding: the mount tests the selected map's active epoch, while saved campaign progress is separate. The attended-owned e7-tape-drawer-inheritance-1 already covers the cure.

Instrumentation notes: the policy checker correctly refused a linked-worktree board, so it was re-run CLEAR at the primary root. The static wrapper mistakenly assigned the battery result object to process.exitCode after all receipts had been written; that error did not cause the 900-second termination. Temporary build-menu artifact directories were initially misread as failures in commentary; the final reporter proves all 14 build-menu tests passed. Only the final reporter is counted here.

## Merge classification and disposition

All 13 changed paths are NEW: the single e2e audit and 12 evidence files. No MAIN-MOVED overlap, no conflict, no blob over 50 MB. classification.json enumerates every path. src/, functions/, assets/ and existing assertions are unchanged. The art store is clean main at 5793a967da46e8f00c0ba16f92f17dc10d36558d; no pin or deployment was performed.

Main was never fast-forwarded to the candidate. The done-move and queued goal remain open; no mergeHash was written and no continuation was dispatched. Next: finish the mandatory full Node verification through the existing attended procedure (or a separately reviewed wrapper cure), retain any necessary clean-main controls, then land the audit. Only after that does attended sequencing release the inheritance corrective. No new gameplay finding is manufactured from this incomplete gate.
