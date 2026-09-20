# ret-02 — retention floor becomes a high-water ratchet

**Slice:** `ret-02-retention-floor-ratchet` (lane-a) · **branch:** `lane/m3` · **tip:** `fbde25e5` · **base:** `6515ce63 (archive: pruned by the A3 rewrite)`
**Drained:** s1245, 2026-07-30 · **Review by:** s1245 fire

## Verdict

**MERGE — ACCEPTED.** 13th rung of the *a guard's promise is broader than the assertions behind it* class. The
slice does exactly what its master specified, chose the harder of the two available designs for the reason the
master gave, and — the part that matters — **its own independent review found a hole the master had not
anticipated and fixed it before landing.** Six mutation arms re-derived by me, not inherited.

## What it does

`scripts/run-log-retention.test.mjs` asserted that every row in `logs/task-stats.jsonl` still has a recoverable
run log, with `ENTRY_FLOOR = 228` as the anti-vacuity backstop. That floor was a **snapshot**: written against a
one-day measurement, and since the ledger only grows, its blind window widens forever. At 230 rows the floor
would have passed a truncation down to 228.

This slice adds a **high-water ratchet** (+38 lines, one file): the baseline is the **maximum** row count across
the last `HISTORY_DEPTH = 20` **first-parent** commits touching the ledger, and the subject must be `>=` it. The
floor is **kept, not replaced** (scope 2) as the backstop for the ratchet's own failure mode.

Three design decisions, each load-bearing:

1. **Not `HEAD` alone** (master premise 4 / F-1244-1). `HEAD` is whatever was committed last, and the ledger is
   committed by *fires, as bookkeeping, at fire start, before any gate runs* — so a truncation blessed by one
   ordinary lock commit would move the baseline down permanently. **I committed the ledger twice during this very
   fire (`9c5c0f62 (archive: pruned by the A3 rewrite)`, `ca0a615e (archive: pruned by the A3 rewrite)`), which is the mechanism live.** The 20-commit window survives a single blessing.
2. **`--first-parent`** — the runner's own review caught this and the master did not: a plain path-limited
   `git log` can *simplify away* the larger ledger version after a stale merge, losing the exact 500→230 case the
   ratchet exists to catch. Genuine catch, independently mutation-proved by the runner.
3. **The vacuity fallback is handed numeric `0`, not `ENTRY_FLOOR`** (scope 2's explicit warning). Shallow clone,
   absent history, or a failed git query → `0` → the guard **REDs** on "baseline could not be established"
   rather than passing vacuously. Verified as arm D.

Override hook `GOLD_RUSH_TASK_STATS_BASELINE_REF` (matching the existing `GOLD_RUSH_TASK_STATS_FILE` idiom at
`:14`) makes every arm non-destructive.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** (3.6 s) |
| `npm run build` | **rc=0**, 2163 modules, built in 1.22 s |
| subject `run-log-retention.test.mjs` | **rc=0, 1/1** — 230 entries checked, **0 unrecoverable**, high-water 230 |
| `npm run test:node-guards` | **rc=0 — tests 112 · pass 112 · fail 0 · skipped 0** (30.5 s) |
| `node scripts/run-guards.mjs` | **rc=0 — guards: 8/8 passed** (incl. `test:mp` PASS, `test:deploy-contract` PASS 80 s) |
| `scripts/fixture-teardown.test.mjs` | **rc=0** (25.9 s) — no leaked temp dir, no unrestored fixture |
| `scripts/run-guards.test.mjs` | **rc=0** (4.7 s) |
| `scripts/goal-tracker.test.mjs` | **rc=0** (13.9 s), re-run **after** my `goals.json` edit |
| AT RISK (printed, not asserted) | 231 files / **595.74 MB** — owner-gated (F-1242-1), correctly informational |

**Roster count is the proof the wiring did NOT change:** 112 before (s1243/s1244 baseline) and 112 after. The
master predicted exactly this — the slice adds no file and no new `test()` case, only assertions inside the
existing one. An unexplained move in either direction would have been a finding; there was none.

**Adjacent suites DERIVED BY GREP, not from the runner's list** (`task-stats.jsonl` / `runs-archive` readers):
`scripts/dashboard-gen.sh`, `scripts/lane-runner-v3.sh`, `scripts/tmp-s1046-handoff.mjs`. **No test suite shares
these data sources** — same derivation s1243 reached, re-run here. The adjacent surface is therefore fully
covered by the roster + `run-guards` batteries above.

**No player-visible bytes** — 0 files under `src/ e2e/ assets/ public/`. Per the master, **no boot probe and no
screenshots are owed, and none were fabricated.**

### Mutation proof — 6 arms, all re-derived by me, attributed by MESSAGE TEXT not rc

| Arm | Subject | Baseline | rc | Message that fired |
|---|---|---|---|---|
| **A** floor | 5 rows | real | 1 | `task-stats floor: expected at least 228 entries, found 5` — **the FLOOR, not the ratchet** |
| **B** decisive | 230 rows | blob `0f81de41` (500) | 1 | `subject 230 rows vs high-water 500 (−270)` — **verbatim match to the runner's quote** |
| **C** control | real 230 | real (230) | 0 | GREEN, `subject 230 rows, baseline 230`, 0 unrecoverable |
| **D** vacuity | real 230 | unresolvable ref | 1 | `task-stats high-water baseline could not be established from deadbeef…` |
| **E** lawful append | 231 rows | real (230) | 0 | GREEN — **no false-red on ordinary runner growth** |
| **F** minus-one | 229 rows | real (230) | 1 | `subject 229 rows vs high-water 230 (−1)` |

**5 of 5 gating branches proved** (floor · ratchet · un-established baseline · plus two directional controls).
Arm A is reported as the master demanded: it fires the **pre-existing floor** and proves nothing about the new
code. **Arms B and F are the discriminators** — and F is the sharper of the two, because losing a *single* row
now reds where the shipped floor passed everything `>= 228`. Arms E and C together show the ratchet does not
false-red on normal factory operation.

### Premises re-derived (master scope 6)

- Ledger **230 rows**, **230 distinct full identities, 0 duplicate identity rows** — premise 3 holds; there is
  still no lawful compaction available, so the ratchet still has no known false-red.
- **11 duplicate stamp KEYS / 18 extra rows / max multiplicity 4.** The runner's "eleven" is exact — my first
  pass read 18 because that is the *rows* measure, not the *keys* measure. Both numbers are correct against
  different denominators; a stamp appearing **4×** is precisely why full-identity matching was required.
- Monotonicity: 124 ledger revisions, 45 → 230 rows, **zero decreases** (runner's re-derivation; consistent with
  s1244's 123/229 one revision earlier).

### Retention Law compliance (master scope 5)

**Nothing deleted, by the slice or by any of my six arms.** Every arm used an absolute `/tmp` subject path via
the env hook, so the real ledger was never written — verified `230 → 230` after all arms ran.
`tasks/runs/` **194 files (161 `.log`)** and `logs/runs-archive/` **232 files (231 `.log`)** unchanged.

> **Denominator note for the next fire, so nobody "finds" a phantom:** the runner reported `tasks/runs/ 194→194`
> while s1243/s1244 reported 160/161. Both are right — **194 is all files, 161 is `.log` only.** Reconciled here
> by measuring both.

## Merge classification

Base `6515ce63 (archive: pruned by the A3 rewrite)`, lane tip `fbde25e5`. Two-dot `main..lane/m3` showed **14 paths**, of which **exactly one is
lane content**:

- **LANE-TOUCHED (1):** `scripts/run-log-retention.test.mjs` — merged by **path-scoped checkout**, no graft
  needed (main never moved this file off the base). Post-checkout blob **`a965c050`** is byte-identical to the
  runner's own diff header (`index fdbd143d..a965c050`).
- **MAIN-MOVED-ONLY (13):** `STATUS.md`, `logs/.goal-tree.html`, `logs/dashboard.html`, `logs/task-stats.jsonl`,
  `tasks/BACKLOG.md`, `tasks/goals.json`, `tasks/ret-02-retention-floor-ratchet.md`, and the six
  `logs/session-scratch/s1244/*` fixtures. Classified per-file by comparing `base..main` against `base..lane/m3`
  — every one moved on main only. **The six `D` entries are s1244's prototype fixtures and the master file,
  added to main AFTER the lane's base, so the two-dot reads them as deletions: phantom deletions, not real
  ones. Restoring any of them would have deleted the master and s1244's evidence from main.**

**Firewall held exactly.** The runner's commit touches one file, +38/−0. `.gitignore`, `lane-runner-v3.sh`,
`dashboard-gen.sh`, `package.json`, `logs/session-scratch/s1244/**` and everything under `src/ e2e/ assets/`
all untouched.

**Lane note:** s1244's handoff predicted `lane/m3` would read as a *double* tip-graft phantom
(`e0f92a48` + `99a031af`). It read **1 ahead** instead — the runner took the SAFE-DUPE
`checkout -B lane/m3 main` path its pre-flight specified, so the phantoms are gone and the single ahead commit
is genuine new work. Verified, not assumed.

## Findings

**F-1245-1 (non-blocking, self-reported by the runner — a residual CEILING, not a defect).** The 20-commit
window is finite: a historical loss can still age out if **20 consecutive low-count first-parent ledger commits**
land while the guard is red **and ignored throughout**. The current window spans roughly 11 hours. This is
strictly weaker than the defect it replaces — a *single* ordinary blessing sequence can no longer disarm the
guard, which was F-1244-1's whole point — and the arms show the guard reds loudly the entire time. **Recorded as
the upgrade trigger, not as owed work: it requires ignoring a red guard for ~11 h, which is a process failure the
guard itself would be shouting about.** If that ever happens, the fix is a wider window or a committed
high-water file. Credit where due: the runner found and reported this against its own merge.

**No blocking findings.** No corrective task spawned.

## Ledger

- Goal leaf `factory-retention-floor-ratchet` → `shipped`, mergeHash recorded (Goal Registration Law).
- `tasks/BACKLOG.md` ret-02 line retired in the same commit as the event.
- **GZ-01: no news item** — 0 player-visible bytes, so the filter law is not reached.
