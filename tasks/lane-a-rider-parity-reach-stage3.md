CODEX: model=gpt-5.6-sol effort=medium
# Task lane-a-rider-parity-reach-stage3: align the reach guard with shipped ADR-005 stage 3 (LANE-A, prefix "test:")

FIRE-AUTHORED s2550, 2026-09-08. F-2550-1, gate-side; one test corrective, no gameplay change.
READ FIRST: AGENTS.md, STATUS verification lessons, `docs/decisions/ADR-005-rider-parity.md`, `tasks/rider-parity-grammar-stage3.md` items 9–10, `scripts/rider-parity-reach.test.mjs` in full, and `artifacts/s2550-fire/full-node.txt` plus `base-reach-control.txt`.

## Measured defect and invariant

At main `6e29d21f4a38aebbf8ade4bfe1f08391d1cc7524`, the reach guard has four passes and one failure: it expects 12 non-comment lines reading `this.prospector.position`, but the shipped sim has 10. The guard and both source subjects on main were verified byte-identical to HEAD before this base control. The detached gold candidate fails identically. Its complete direct Node command ended naturally at 1374.5 seconds: 742 tests, 736 pass, 1 fail, 5 explicit skips, no cancellation; the failure is the fixture sweep's nested reach guard. The npm chained tail did not run.

Commit `9912785f7cc9fb1a86216e23c88cf7c1e2724ebd` deliberately moved the E8 hollow crossing and `syncProgramSuspension` to the HERO, per stage 3 items 10 and 9. Its stage-1 guard still counts both as Prospector reads. The lawful remaining set is the three named Prospector chores plus seven passive wirings. The existing twelve HERO_REACHES entries, browser action checks, and deliberate harvest/repair ownership must remain defended. Do not repair this mismatch by moving runtime reads back.

## Pre-flight and custody

Resolve the lane from `git worktree list`; at authoring lane-a is `worktrees/lane-a` on `feat/e10s-4-door`, ahead=0, clean. If it holds an unmerged commit or foreign source edits, STOP and report. Run `node scripts/lane-usable.mjs lane-a` from main and read the verdict. Refresh only after it proves USABLE and `main..HEAD` empty; never reset held output. FACTORY-CHURN EXCEPTION (F-1407-1): disjoint `logs/**`, `artifacts/**` and `reviews/shots-*` do not block this test-only task; report and preserve them, never discard them blindly. Do not clean another tree. Use `npm ci`, Node 26.4.0, and preserve package/lock files. No API calls, browser work, or public writes.

The MAIN gold fixture output is finished but unmerged on `save/board-gold-current-grammar-s2547`; do not copy or alter it. This task is the prerequisite for the next FIRE to gate that saved candidate again. No other genuine full Node battery may be running during your checks. Never kill another session.

## Implement and prove

1. Reproduce the 10-versus-12 failure before editing. Re-enumerate the actual remaining code reads, excluding comments exactly as the current guard does, and reconcile each with its stated role and the stage-3 diff. Keep this a strict census, not a relaxed upper bound or a count derived from the very source being judged.
2. Update the stale expected count and rationale to the shipped stage-3 ownership. Explicitly keep both newly HERO-owned sites guarded, reusing the existing source-needle and manufactured-defect pattern; scope the suspension check to its method so an unrelated hero read cannot satisfy it. Preserve every existing hero, browser and deliberate Prospector assertion. No new framework or general source parser.
3. On scratch variants, separately move the hollow-crossing read and suspension read back to the Prospector; each must fail on the intended ownership assertion. Preserve the existing recoverProbe regression control. Add an unexpected Prospector code read and prove the census rejects it. Restore all source bytes afterward. Capture actual child exit status and failing assertion; a skipped child, construction failure or title merely printed by a passing test is not mutation evidence.

Touch ONLY `scripts/rider-parity-reach.test.mjs` and `artifacts/rider-parity-reach-stage3/**`. No runtime, other tests, fixture sweep, battery topology, timeout/concurrency, engine pin, STATUS, BACKLOG, goals, specs or review edits. No skipped substantive assertions. Keep artifacts below 5 MB and retain a concise report with base, exact read census, commands, counts and mutation results.

Run the corrected reach guard and the existing retirement/context-press parity guards to terminal completion, plus tsc and build. Do not burn another full Node run against main's separately known retired board-gold fixtures: the FIRE will compose this finished test change with the saved gold fixture corrective in a detached current-base candidate and run the complete Node command directly, without the 900-second wrapper. Your focused green is not full integration acceptance. If another concrete failure appears, retain and explain it; no blind retries or runtime tuning.

End READY-FOR-GATES with exact changes and evidence. A genuine HOLD is valid; write the reason before a no-op exit. Leave commits to the lane runner.
