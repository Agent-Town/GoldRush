# ret-01 — run-log recoverability guard

- **Slice:** `ret-01-run-log-recoverability-guard` (ELEVENTH RUNG of the "a promise nothing enforces" class)
- **Branch / tip:** `lane/m3` @ `99a031af` — `runner(lane-a): ret-01-run-log-recoverability-guard.md`
- **Base:** `43b652b4` (merge-base with main, verified via `git merge-base`)
- **Drained by:** s1243 fire, 2026-07-30
- **Verdict:** ✅ **ACCEPTED — merged.** Two gating branches, both mutation-proved by the drain independently of the runner. One non-blocking finding (F-1243-3) and two notes.

## What it does

`CLAUDE.md` §4.10b (the Retention Law) declares the retention-window prune removed and the duty
"DISCHARGED, re-verified by reading all three files". s1242 measured that the **live** runner process
has executed the prune anyway for five days, because a `while true` body is parsed once and pid 35584
has run since 2026-07-11 — a defect that **reading the files is structurally incapable of detecting**.

This slice does not fix the runner (that is a restart, and it is the owner's) and does not touch
`.gitignore` (the 591 MB tracking decision is the owner's). It builds only the **missing instrument**:
a guard asserting the one invariant that actually matters — *every run recorded in
`logs/task-stats.jsonl` still has a recoverable log*, in either `tasks/runs/` or `logs/runs-archive/`.
It is the mirror-vs-pruner race, made checkable.

Two design choices carry the weight:

- **A floor of ≥228 rows**, so an empty or missing ledger **REDs instead of passing vacuously** — the
  "a probe that executes nothing reports zero" failure mode this ladder exists to catch.
- **Full-identity matching** on `${stamp}-${lane}-${task}.md.log`. The runner re-derived **11 duplicate
  stamps** in the ledger and correctly rejected stamp-only matching as unsafe.

The AT-RISK figure is **printed, not asserted** — deliberately, per the master, because the tracking
decision is owner-gated.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, no output |
| `npm run build` | **rc=0**, built in 1.71s |
| New guard by name (TAP) | **1/1 pass** — `229 entries checked, 0 unrecoverable` |
| `npm run test:node-guards` | **rc=0** — `tests 112 · pass 112 · fail 0 · skipped 0 · cancelled 0` |
| Roster registration | **111 → 112** — the count itself proves the `package.json` wiring |
| `node scripts/run-guards.mjs` | **8/8 passed**, incl. `test:mp` **PASS** (31s node-guards, 80s deploy-contract) |
| Adjacent suites (**grep-derived**) | `grep -rln "task-stats.jsonl\|runs-archive" scripts e2e` → only `dashboard-gen.sh`, `lane-runner-v3.sh`, `tmp-s1046-handoff.mjs` — **no test suite** shares the data sources; the guard imports nothing local. `package.json`-parsing guards (`script-tree-parse`, `run-guards.test`) are both in the roster and green. |
| Player-visible bytes | **0 files under `src/ e2e/ assets/ public/`** → no boot probe owed, none fabricated |
| Retention compliance | **nothing deleted**; ledger unchanged at 229 rows, `tasks/runs` 160, archive 231 |

### Mutation arms (drain-run, independent of the runner's)

The guard's own `GOLD_RUSH_TASK_STATS_FILE` hook made both arms **non-destructive** — the real ledger
was never written, which matters because *this guard may not violate the law it enforces*. Attributed
by **message text**, never by rc.

| Arm | Mutation | Result |
|---|---|---|
| **A** | real 229 rows + one row naming a log that does not exist | **rc=1**, `unrecoverable run logs: 20990101-000000 \| lane-z \| s1243-synthetic-missing-log` — names the exact row |
| **B** | ledger truncated to 5 rows | **rc=1**, `task-stats floor: expected at least 228 entries, found 5` — the floor branch fires |

**Branch tally: 2 of 2 gating branches proved.** The third branch (the AT-RISK print) is
non-gating by design, so there is nothing to red.

### Premise re-check (the master predicted drift, and got it)

The master warned that its numbers move daily because the pruner is live, and asked the runner to say
so rather than treat drift as contradiction. Three independent measurements now agree:

| | s1242 | s1243 drain (mine) | runner |
|---|---|---|---|
| `tasks/runs` `.log` | 159 | **160** | 160 |
| oldest live log | 3.91d | **3.92d** | — |
| band 3.0–4.0d | 33 | **34** | 34 |
| beyond 4.0d | **0** | **0** | **0** |
| archive-only span | 4.14–4.76d | 4.77d oldest | 4.16–4.77d |

The 4.0-day wall holds in `tasks/runs/` and not in the archive. **F-1242-2 stands: the prune is live.**

## Merge classification

- Two-dot `main..lane/m3` listed 10 files. **Exactly two are lane content**; both verified
  `git diff 43b652b4..main -- <file>` **empty**, i.e. main never moved them, so a path-scoped
  `git checkout lane/m3 -- <2 files>` is correct and no 3-way graft was needed.
  - `scripts/run-log-retention.test.mjs` — **new**, 54 lines. Post-checkout blob **`fdbd143d`**,
    byte-identical to the runner's own diff header.
  - `package.json` — **+1/−1**, roster insertion only.
- The other eight are **MAIN-MOVED-ONLY** off base `43b652b4` — `STATUS.md`, `logs/dashboard.html`,
  `logs/.goal-tree.html`, `logs/task-stats.jsonl`, `logs/session-scratch/s1242-line1.txt`,
  `tasks/BACKLOG.md`, `marketing/outbox/ticker-digest-2026-07-29.md` (this fire's own TK-01 artifact)
  and `tasks/queue/lane-a/ret-01-…md`. Their "deletions"/"additions" in the two-dot diff are main's
  newer content read against a stale base. **None was copied back.** In particular the queue file
  shows `+57` because main legitimately deleted it in the queue→running move — restoring it would
  re-queue a shipped task (Mistake #8 shape).

## Findings

- **F-1243-3 (non-blocking, no corrective authored) — the floor is a snapshot, not a ratchet.**
  `ENTRY_FLOOR = 228` is a hardcoded constant against a ledger now at **229**. It does its stated job
  (an empty or missing ledger REDs rather than passing vacuously) but it **cannot catch partial
  truncation**, and it *loosens monotonically as the ledger grows*: a future 500-row ledger truncated
  to 230 rows would pass this guard green. This is the same shape as the known
  "a one-time sweep is a snapshot, not a guard" lesson. **Recommendation** (untested, and flagged as
  such): derive the floor from the ledger's own committed history — e.g. assert the row count never
  decreases versus `git show HEAD:logs/task-stats.jsonl` — which turns a constant into a ratchet.
  Deliberately **not** authored as a rung: the guard's stated scope was the recoverability invariant,
  it meets it, and a ratchet is a design choice worth one owner-visible line rather than a silent
  follow-on.
- **Note 1 — the rename tradeoff is documented and correctly biased.** Full-identity matching means a
  log renamed away from its canonical filename would read as unrecoverable (false RED). The runner
  named this explicitly and chose it over stamp-only matching, which was **unsafe** given 11 duplicate
  stamps. Fail-loud is the right direction for a guard; recording it so a future false red is
  recognised rather than "fixed" by loosening the match.
- **Note 2 — AT RISK is computed from `git ls-files`, i.e. the index on this disk.** It reports
  **230 files / 592.80 MB**. This repo has twice shipped a false zero from an "is it in git?" question
  that only asked one disk (F-1054-1, F-1055-1). Here the direction is **conservative** — a
  locally-tracked-but-unpushed file is counted as at-risk, over-reporting rather than under-reporting —
  and the value is non-gating, so it cannot ship a false green. No action; recorded because the class
  has burned this repo before.

## Owner-facing

Nothing in this slice is player-visible, so **no gazette item** is owed (GZ-01 filter law). The two
open owner items it sits on top of are unchanged and still owner-only:

- **F-1242-1** — `logs/runs-archive/` 229 files / **591.19 MB** untracked via `.gitignore:7 *.log`;
  recommend ruling together with **F-1193-2** (`worktrees/art`, 566.47 MB).
- **F-1162-1 / F-1242-2** — the remedy is a **restart of pid 35584**, not a repair. This guard is what
  will notice if the race is ever lost.
