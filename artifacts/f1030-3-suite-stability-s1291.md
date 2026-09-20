# F-1030-3 — the sample s1290 declared unfinished, finished (s1291)

s1290 ran 3 of a planned 6 invocations and **declared the cutoff** rather than presenting 3 as a
sample. This completes it with the **same instrument** (`/tmp/gr-s1290-probe.mjs`, unmodified) so
the two halves pool fairly — a different probe would have made the pooled rate meaningless.

## Method (unchanged from s1290)

N separate cold **INVOCATIONS** per F-1036-2 (not `--repeat-each`, which resamples one warm path)
· `--workers=1` per fire.md §3.1 · external scratch dev server on **5231**, never 5188 (Mistake
#12) · the literal `Running N tests using 1 worker` line captured per arm rather than trusting the
flag (F-1217-2) · port verified free before starting and released after (F-1290-2: a probe that
executes nothing reports zero).

## Result — 6/6 invocations green

| # | fire | rc | tests | failed | loadavg1 | wall | literal worker line |
|---|---|---:|---:|---:|---:|---:|---|
| 1 | s1290 | 0 | 14 passed | 0 | 3.19 | 97 s | `Running 14 tests using 1 worker` |
| 2 | s1290 | 0 | 14 passed | 0 | **8.24** | 97 s | `Running 14 tests using 1 worker` |
| 3 | s1290 | 0 | 14 passed | 0 | 5.01 | 132 s | `Running 14 tests using 1 worker` |
| 4 | s1291 | 0 | 14 passed | 0 | 2.08 | 92 s | `Running 14 tests using 1 worker` |
| 5 | s1291 | 0 | 14 passed | 0 | 3.45 | 98 s | `Running 14 tests using 1 worker` |
| 6 | s1291 | 0 | 14 passed | 0 | 4.69 | 97 s | `Running 14 tests using 1 worker` |

**84/84 test executions green across 6 cold invocations, desktop + mobile. Observed red rate 0/6.**

Load spans **2.08 → 8.24**, so the sample covers both a quiet machine and a loaded one, which is
the span s1290 said was owed. Every arm printed its worker line, so every arm is evidence rather
than an empty-probe zero.

## Verdict — F-1030-3 struck as measured-stale

The directive premise (`BACKLOG:2143` ⑵, owner blocker sweep 2026-07-30) was that
`e2e/m2-05-base-damage-repair.spec.ts` needs "stabilising as a suite". **It does not reproduce at
n=6.** F-1030-3's GATE was *"a future corrective **should** stabilise it as a suite"* — a
recommendation, never a claim that the instability was still live. Struck the way s1261 struck its
14 siblings: **in place, text retained**, so the blocker panel actually drops it.

**What 0/6 does and does not license.** It bounds the rate loosely — a defect at ~10% per
invocation survives 6 clean runs about 53% of the time — so this closes the *directive*, not the
possibility. It is enough to refuse to spend a Codex run on a suite that passes; it would not be
enough to certify the suite if something player-facing depended on that certification. If `m2-05`
reds again, this artefact is the baseline to compare against, not a contradiction of it.
