# play-proofs-evidence-retention-1 — prepared package, attended archive still pending

2026-09-27, s2705. Branch `sol/open-findings-astra`, tip `6974a5cc7`, base `6044a45fe80a765a28974daaa749283bcb62245e`.

**Verdict: HELD before merge under F-2704-1.** The initial strict policy check returned CLEAR, rc 0. The prepared lane retains the sealed evidence; its below-budget measurement is a local fixture. The task explicitly reserves real private-archive coordination/push for the attended session. Neither this package nor the original six source commits entered main. Both done-moves remain open.

The package separates the 230 frozen proof files from the live helper without changing the six imported specs, shared driver, assertions or game behavior. All 231 source files remain byte-identical. This is evidence preparation and has no player-visible runtime change. The original proof verdicts remain one PASS and five HELD.

| Check | Result |
| --- | --- |
| Runner candidate | 1 commit, 282 new paths, task-firewall paths only |
| Original evidence | 231 files / 86,013,547 B retained; 230 sealed files / 86,011,222 B, live helper 2,325 B |
| Source specs and shared driver | Six specs and shared driver unchanged |
| Actual committed candidate | 92,667,152 added evidence bytes in 276 evidence paths; budget rc 1 |
| Source-reported post-offload fixture | 6,822,605 added bytes against 40,000,000 B; not a real archive push |
| Source-reported checks | tsc/build green; retention suites 57/57; adjacency 17/17 desktop and 17/17 mobile; 12 expected native-spec skips |
| Source-reported plain boots | 1280x800 and 390x844, zero console/page errors |
| Source initial browser probe | rc 1 from waiting for an existing-profile menu in an empty context; retained, corrected through profile creation; corrected probe rc 0 |
| Real archive / final merged-tree gates | NOT RUN; attended coordination still owed |

The fire's independent blob/hash, scope and actual candidate-budget measurement is in `artifacts/s2705/corrective-verification.json` and `artifacts/s2705/corrective-budget.txt`. Source report and exact commands are preserved at `artifacts/s2705/source-corrective-report.md` and `artifacts/s2705/source-corrective-drain-commands.md`. Runner acceptance evidence is source-reported, not newly run by this fire.

Merge classification: candidate base is the attended assignment commit; all 282 paths are new candidate-context specs or packaging evidence. Main has only bookkeeping changes since that base affecting other paths. No merge or conflict resolution was attempted. The original six-commit lane remains untouched at `0c43f9524443fc86272a530eced87515347aa3d4`.

F-2704-1 continues to own this hold; no new product defect or owner decision was invented. The corrective leaf is now gate-side blocked on the real archive and measured landing condition, rather than falsely left queued. After the attended archive is verified/pushed, lift both readiness holds with the ledger/goal update and execute the full normal merged-tree drain gates. Do not re-run native rides whose allowance was spent, directly merge the oversized preparation branch, or relabel the local fixture as the private archive.
