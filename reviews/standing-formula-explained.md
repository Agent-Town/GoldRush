# standing-formula-explained — accepted with F-2503-1

**Dependency unit:** `tasks/standing-formula-explained.md` + `tasks/f2503-1-standing-goal-snapshot-source.md`
**Branch/tips:** `lane/a` @ `d3814a1af` + `fa8b096f3`
**Merge:** `a43ccfbe74fbb0fc0e4b769e18a63ab7cf04f64f`
**Gate base:** `846b88625`

## Verdict

**ACCEPTED AND MERGED.** F-2503-1 is closed: ranked waves, gold and time now come from the canonical `run_secured` event captured by replay, not from the rider's submitted final score. The same immutable snapshot survives Rush suspension, the worker rewrites the pending row only after verified replay, and public callers cannot declare it.

The ruled comparator and one shared public explanation remain consistent across the score screen, landing and `public/skill.md`. Overtime can continue, but it cannot move the official standing.

## Evidence

| Gate | Result |
|---|---|
| merge classification | 25 paths: 23 lane-only, 2 both-moved; clean merge tree, no conflict; both moved paths retain lane-only lines |
| TypeScript + production build | clean; Vite 2.49 s; asset-diet green |
| focused replay/assayer/era/rule | 22/22 |
| stats and standings workers | 87 stats + 250 KV + 250 SQLite + 26 ledger = 613 checks |
| browser proof | 4/4, desktop + 390 px mobile, zero page/console errors |
| full node regression | 642 tests: 634 pass, 3 fail, 5 skip; the only substantive inherited red is F-2499-2's non-hash attended goal provenance, repeated directly and through fixture-teardown |
| post-rebase pointer/engine check | engine 5/5; law pointer 23/23; goal check retains only F-2499-2 |

Merged-tree screenshots: `reviews/shots-standing-formula-explained/desktop-chrome.png`, `reviews/shots-standing-formula-explained/mobile-chrome.png`.

## Historical hold

s2503 correctly held predecessor `d3814a1af`: it froze the first client score but did not derive the snapshot from replay and did not persist it through suspend. Corrective `fa8b096f3` closes both gaps without changing existing simulation outcomes; era 5 was therefore appended with merged-tree hash `e931ff6f682bfad77ae746d92488c259c7ee41440d803db5f8f79032282f0434`.
