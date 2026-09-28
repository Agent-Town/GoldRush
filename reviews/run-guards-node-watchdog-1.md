# Drain review: `run-guards-node-watchdog-1`, the full Node guard battery gets a bounded 60-minute outer budget so the fires can finish a src landing's guard leg again

**Branch** `art/portraits-e5-e10-generated` at `a9fca769e` · **merge** `3717fb210` · engine hash unchanged (`2d180e6b`, no pin) · drained attended 2026-09-28 11:02Z in a detached chain worktree with the scratch store at `5793a96`; no deploy (scripts/attended/land.sh, config `rgw1`).

**Verdict: LANDED.**

**Slice / branch / tip:** `run-guards-node-watchdog-1`, lane-d `art/portraits-e5-e10-generated` (the branch name is history; the commits are path-scoped to two scripts and the evidence), four commits (attempt 1's blocker report, attempt 2 `ef16c955b` + `a9fca769e` + the runner commit), Astra gpt-6-astra, 178,154 tokens in all, 2026-09-28 08:48Z to 09:18Z. Fire-authored by s2737 (F-2737-1), adapted for Astra by the attended session, landed attended.

**What it does.** `scripts/run-guards.mjs`, the diff-selected guard wrapper every drain runs, gave each child guard the same 900 s total budget; a healthy full Node battery takes about 2,567 s (the s2724 receipt), so the wrapper cut it and no fire could finish a `src/**` landing's guard leg. The wrapper now gives `test:node-guards` a 3,600 s outer budget and leaves every other guard at 900 s; per-test bounds, the 2,700 s progress watchdog, retries, concurrency and exit-code semantics are unchanged. `scripts/run-guards.test.mjs` replaces the all-guards-have-15-minutes assertion with coverage of both classes through a bounded spawn-option fixture. No `src/**` change.

**Evidence (real numbers).**

| Check | Result |
|---|---|
| Budgets | Node battery 3,600 s outer; other guards 900 s; inner timeouts and watchdog unchanged |
| `scripts/run-guards.test.mjs` | 12 of 12 |
| The literal `node scripts/run-guards.mjs --changed-since <base>` on the candidate | completed in 1,181.895 s, rc 1: Node 1,034 pass / 5 skip / 1 fail |
| The one failure | the linked-worktree desk refusal (desk-declaration guard on a lane worktree whose STATUS lags main), reproduced on the unchanged base: pre-existing, the F-LAND-11 class, not this change's; the chained npm tail therefore did not run in the lane |
| tsc / build | green |
| Attempt 1 | stopped at pre-flight over lane-d's `node_modules` symlink to the primary checkout (exempted in attempt 2; no install in that lane) |
| tsc / build / `scripts/run-guards.test.mjs` / m2-01 / task-025 / ledger battery | measured by this landing's gates (see the gates log) |

**Merge classification.** Base: main at the chain cut. Lane-touched: `scripts/run-guards.mjs`, `scripts/run-guards.test.mjs`. New: `artifacts/run-guards-node-watchdog-1/**`. No `src/**`, `functions/**` or `site/**`, so `hash: unchanged`. Conflicts: none expected; the toolkit records any.

**Findings.**
- **F-2737-1 closed by this landing.** The fires can gate `src/**` landings again; the audio candidate they had saved (`save/s2736-audio-toggle`) was landed attended meanwhile (amt1) and needs no fire retry.
- **The lane's one wrapper red is the known linked-worktree desk refusal (F-LAND-11 class),** attributed on the unchanged base; the drain-time battery on main is the authority.
- **Owner's desk:** nothing new.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 149 ℹ fail 0` |
| the ledger battery | `rc=0 ℹ tests 1263 ℹ pass 1260 ℹ fail 0 ℹ skipped 3` |
| e2e both projects, --workers=1 | `rc=0   24 passed (1.8m)  10:43Z` |
| full npm run test:node-guards (before the pin) | `rc=0 ℹ tests 1040 ℹ pass 1035 ℹ fail 0 ℹ skipped 5 ℹ tests 87 ℹ pass 87 ℹ fail 0 ℹ skipped 0  11:02Z` |
| engine hash | `merged: 2d180e6bad6933ef15db2a006aaa0a1a3be8a97efdf9416cbc4646be71be4f6d (pinned 2d180e6bad6933ef15db2a006aaa0a1a3be8a97efdf9416cbc4646be71be4f6d)` |
