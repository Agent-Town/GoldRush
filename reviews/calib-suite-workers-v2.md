# F-1101-1 Playwright worker calibration v2

- Slice: `lane-calibrate-suite-workers-v2`
- Branch: `lane/perf`
- Base: current `main` after the required fresh reset
- Date: 2026-07-27
- Verdict: **STOP — pre-run quiescence gate failed; no calibration run started**

The first run requires two load samples 60 seconds apart with 1-minute load average
at or below 4.0, zero Chrome-for-Testing processes, and no live foreign Playwright
process. Both samples had zero Chrome processes and no Playwright process, but the
1-minute load averages were **9.74** and **7.84**. The instrument therefore did not
run.

## Pre-flight

- `git log --oneline main..lane/perf` printed only the expected
  `9614b7eb runner(lane-d): lane-calibrate-suite-workers.md`.
- `lane/perf` was reset to current `main`.
- `grep -n "workers" playwright.config.ts` printed nothing.
- `node -e "console.log(require('os').cpus().length)"` printed `16`.
- The prior report's latest commit is the expected VOID addendum:
  `642c5d5d drain: F-1101-1 calibration report lands VOID — the 17.88% drift was one flaky test, not an unstable box (F-1107-1/2)`.

## Quiescence evidence

Sample 1:

```text
2026-07-27T07:12:13Z
{ 9.74 8.76 7.53 }
0
```

Sample 2, 60 seconds later:

```text
2026-07-27T07:13:21Z
{ 7.84 8.49 7.53 }
0
```

The absent fourth line in each sample means
`ps ... | grep "[p]laywright test"` found no process.

## Required stop consequences

- No `calib2-*.log` files were created.
- `S` was not built, so there is no exclusion list or drift figure.
- No `inflation(N)` value or worker count was chosen.
- `playwright.config.ts` and `package.json` remain unchanged.
- No pin guard or mutation-control red/green pair exists.
- Build and test self-checks were not run after the stop condition.

Re-run the unchanged v2 task when the box can produce two consecutive accepted
quiescence samples. F-1101-1 remains open.

---

## DRAIN ADDENDUM — s1124 (fire-side, added at the gate)

**Drain verdict: ACCEPTED as a lawful STOP.** The master pre-declared "A STOP IS A SUCCESS
HERE", and this one is honest and firewall-clean: it pinned nothing, softened no threshold,
and produced no guessed number. Merged **path-scoped to this file alone**.

### F-1124-2 — what I refused to merge

The runner commit `6372de97` also carried two files its firewall never listed, described in
the report only as "two unrelated pre-existing artifact edits were preserved":

| file | effect had it merged |
|---|---|
| `artifacts/multiplayer-relay/test-multiplayer.json` | `"status":"passed"` (461 checks) → `"status":"failed"` (9) |
| `artifacts/accounts-worker/test-accounts.json` | 49-line passing check list → 6 lines |

That is stale worktree dirt from an earlier local run in `worktrees/lane-d`, swept in by a
broad `git add`. Merging it would have **destroyed banked passing evidence** under the
RETENTION LAW. "Preserved" was the wrong verb — they were preserved *into the commit*, the one
place they must not go. Both remain as pre-existing unstaged churn in the worktree; nothing was
deleted. The finding is against **add-discipline**, not against the calibration reasoning,
which was sound throughout.

### F-1124-1 — THE STOP WAS RIGHT, BUT ITS REMEDY NEEDS A TIMING RULE, NOT A "QUIET BOX"

The report closes "Re-run the unchanged v2 task on a quiet box." I tested whether this box can
*become* quiet, because an unchanged re-queue that can never pass would burn one dispatch per
fire forever — **exactly the failure mode F-1104-2 already fixed once in this same gate**, when
orphaned Chrome corpses would have STOPped the calibration on every future dispatch.

⚠️ **My first two readings said it could not, and that was my own instrument error — recorded
here because it is the more useful half of this finding.** At 14:20 and ~14:27 the box read
5.06 and 5.96 and I was ready to write "the ceiling is unreachable". Both samples were taken
**while my own gate battery (tsc + build + 12 node guards) was running on the box I was
measuring.** I was the load. Sampling properly, with the factory genuinely idle:

| time (local) | 1-min loadavg |
|---|---|
| 14:23:35 | 5.56 |
| 14:24:05 | 4.63 |
| 14:24:35 | 4.07 |
| 14:25:05 | **3.80** |
| 14:25:35 | 4.53 |
| 14:26:05 | 4.40 |
| 14:26:35 | **3.57** |
| 14:27:05 | **2.99** |

**The gate CAN pass.** The floor oscillates ~3.0–4.6 and straddles the 4.0 ceiling; two
consecutive accepted samples 60 s apart is roughly a coin flip, not an impossibility. So:

1. **Re-queueing v2 unchanged is lawful AND viable.** This STOP is not a second failure of the
   approach — the instrument never ran, so the escalation law's identical-retry bar is not
   tripped, and the master itself sanctions an unchanged re-run.
2. **But time it.** The runner's 9.74/7.84 were sampled at 14:12:13 and 14:13:21 — while
   **s1123's fire was still live** (its handoff commit lands 14:12:20) *plus* its own codex
   dispatch. The gate was measuring the factory measuring itself. **Re-queue only onto an idle
   board**, and expect it to need more than one attempt.
3. **The cheap owner lever (recommended).** `spotlightknowledged` has been pinned at **91.1% →
   92.5% → 94.2%** across three samples spanning ~10 minutes, on a box with 52 days of uptime —
   a stuck reindex holding ~1.0 of load *continuously*. It did **not** decay when everything
   else did. Killing it, or adding this repo to the Spotlight privacy list, would drop the floor
   to ~2.0–3.5 and make the gate pass reliably instead of marginally. **This is owner-side and I
   never kill what I did not start** (v1 gate §65) — flagged, not actioned.
4. **The 4.0 ceiling may itself be miscalibrated** — 4.0 on a **16-core** box is a 25%
   utilisation bar, and at load 4 there are still ~12 idle cores for a measurement that uses at
   most 8. But softening a threshold to reach a nicer number is forbidden by this task's own
   closing rule, and that binds the drainer as much as the runner. **Reported as a finding; rule
   followed.** Owner/attended call only.

**F-1101-1 remains OPEN.** This leaf keeps **no `mergeHash`** and stays re-queueable, for the
same reason s1119 stripped v1's: a hash means "finished, do not re-queue", and the calibration
still has not run.
