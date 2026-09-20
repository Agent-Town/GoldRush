# General Store 3D — blocked pre-flight

- Date: 2026-07-12 16:44 +07
- Branch: `lane/m4` at `2ce5e324`
- Worktree: clean before this report
- Divergence: 10 commits ahead of `main`, 241 behind

The task did not start because its LANE-SAFETY pre-flight found non-main content that resetting would destroy.

Concrete blocker: ahead commit `d38f46bc` (`runner(lane-b): 085-four-rider-party-gate.md`) adds the `partySize` option and `mpParty` query gate to `src/mp/LockstepClient.ts`, plus the corresponding four-rider e2e query. Current `main` does not contain `partySize`, `mpParty`, or the gated initial-roster condition. Its history includes `8045cdf0 Revert "test: prove four-rider lockstep limits"`, so this commit is not a safe content duplicate.

No branch reset, clean, dependency install, build, model generation, source edit, or test run was performed.
