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
