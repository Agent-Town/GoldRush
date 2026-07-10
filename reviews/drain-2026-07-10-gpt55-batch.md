# Drain — the seven-task gpt-5.5 batch (2026-07-10)
Merges: lane/m4 + lane/perf + lane/m3 → main (reconciliation `fb7a7eb`: restoreRunSuspendSnapshot routed through 069's normalization boundary — the dropped-guard conflict resolved INTO the better design). tsc clean · build green.

## Verdicts (the first model-quality data points — ALL implemented by gpt-5.5 @ medium/low)
| Task | Gate result | First-pass? |
|---|---|---|
| 067 mp-resync | ⚠ CORRECTED 2026-07-10: the green was REAL for what the test asserts (unpause + resync counters) but the test NEVER asserted post-restore hash convergence — main's own artifact holds unequal hashes (tick 90/120; verified). Convergence = Sol brief #2. The paused-forever fix itself stands. | ✅* (weak gate, corrected) |
| 069 restore-validation | fuzz suite green in battery | ✅ |
| 070 assay honest-wire | m5-04 both branches green | ✅ |
| tl-03b ledger stats window | spec green | ✅ |
| mp-04 ride-together | :208 green ISOLATED; battery fail = harness order-flake | ✅ (product) |
| 068 sheet re-extraction | gates are the owner's eyes — contact sheets await re-verdict | pending owner |
| batch-020 contract plates | wired correctly; board spec updated to the new keys (owner-ordered art keys replaced placeholders — test asserted the old truth), 5/5 green | ✅ (one stale-assertion test update) |

**First-pass rate: 6/6 gateable tasks green on gpt-5.5.** Strong early signal for the cheap tier on well-specified slices.

## F-drain-1 (harness, corrective owed): mp-02-lockstep suite is order-dependent
4 tests share one relay env; combined runs fail randomly (:68 or :208), each passes isolated. Same family as F-mp02-1 (shared persist dir). Corrective: per-test relay isolation (fresh room worker port + persist dir per test, or serial-with-reset). TEST-ONLY task, low priority, but it blocks clean full-suite reads — author before MP-05.

## Drain #2 same day (ts-01 + 074 + 075 + 076) — 23/23 GREEN desktop single-worker (ts-01 plaza ring + routes · en-01/en-02 incl. 074 lock assertions · restore-validation + run-suspend incl. 076 atomicity · 072 · town-t3-board · m1-01). Merged clean (zero src conflicts), tsc+build green, DEPLOYED (plaza live). gpt-5.5 first-pass streak: 10/10 gateable.
