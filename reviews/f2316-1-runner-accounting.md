# f2316-1 — the lane commit stops sweeping the factory's own `logs/` accounting

**Slice:** fire-side corrective, landed directly on `main` (no lane, no done-move — the subject
is the runner script itself, which no lane task may edit while it is executing).
**Tip:** `9852bcbe6` · **Author:** fire s2319, 2026-08-26 · **Discharges:** F-2316-1
(deferred by s2316, s2317 and s2318, each for the same stated reason: a live runner).
**Files:** `scripts/lane-runner-v3.sh` (+28/-1) · `scripts/runner-commit-decoupling-guard.test.sh` (+72)

## VERDICT: LANDED — cure proven against the pre-cure file as reverse control, guarded, runner restarted clean.

## What it does

`commit_lane_delta`'s classification loop now asks a **structural** question about every path in
the lane's post-dispatch delta:

- `logs/*/*` → **KEEP**. A subdirectory under `logs/` means lane evidence.
- `logs/*` → **WITHHOLD**. A file sitting directly in `logs/` is the factory's own accounting,
  owned by main and never authored by a lane task.

Withheld paths are counted and reported separately from `$withheld`, because baseline-ownership
collisions and factory-accounting withholds are two different owed acts, and a single number
covering both causes tells a reader neither.

## Three findings, in order of how much they matter

### 1. The recommended cure was worse than the defect (the reason this row exists)

F-2316-1 recommended, verbatim, *"exclude `logs/` wholesale at the lane-commit site."*
Measured over **all 701 `runner(` commits**:

| bucket | count |
|---|---|
| runner commits total | 701 (lane-a 142 · lane-b 173 · lane-c 140 · lane-d 133 · art 113) |
| touching `logs/` | 125 |
| carrying `logs/session-scratch/**` | **14 commits / 136 files** |
| top-level `logs/` paths seen | `dashboard.html` 105 · `.goal-tree.html` 36 · `task-stats.jsonl` 21 · `.blocked-seen` 15 · `lane-runner.out` 13 · `factory-usage.json` 11 · `usage-history.jsonl` 9 · `suite-red-inventory*` 6 · `guard-stats.jsonl` 1 · `_s*` debris 4 |

Those 136 files are lane **evidence** — probe specs, raw per-run JSON, rate tables, tsc and build
output (`28d03c9e7`, `107208877`, `6999e57a4`). A wholesale exclusion stops that class ever
reaching git again, silently, in every future lane commit: **a RETENTION LAW hole opened to close
a hygiene one.** The finding's own GATE guarded the wrong boundary — it asked whether a cure
reached *outside* `logs/`, never whether `logs/` itself carries lane output.

### 2. The cited coordinate is the ART path, not the lane path

F-2316-1 cites `lane-runner-v3.sh:488` and says it re-verified at source. That line sits behind
`if [ "$slot" = "art" ]`; ordinary lanes take the `else` and commit through `commit_lane_delta`,
whose corpus comes from `lane_dirty_status` (`:10–15`) — a third copy of the same hand-named list.
The incident described was **lane-d**. Curing `:488` alone would have left the live path defective
and looked correct. (`:488` is additionally inert: its `$wd` is `worktrees/art`, gitignored and not
a git worktree, so its `.` pathspec stages nothing — the file's own comment at `:483–486` says so.)

### 3. No pathspec can express the distinction — including the one I expected to

Proven by manufacturing on a scratch repo, ground truth asserted before any arm was believed
(F-2215-1). Fixture: 2 evidence files under `logs/session-scratch/**`, 4 factory files directly in
`logs/`, 1 `src/` file.

| pathspec form | evidence kept | churn excluded |
|---|---|---|
| current (three hand-named excludes) | 2/2 ✅ | 0/4 — sweeps |
| `:(exclude)logs/` | **0/2 🚨** | 4/4 |
| `:(exclude)logs/*` | **0/2 🚨** | 4/4 |
| `:(exclude,glob)logs/*` (my own candidate) | **0/2 🚨** | 4/4 |

The directory `logs/session-scratch` itself matches the pattern, so git prunes the whole subtree.
Hence a path test on the delta, where depth is decidable — not a pathspec.

## Evidence

Behavioural probe, cured file vs the pre-cure `HEAD` blob as reverse control, same fixture, all
seven files created **after** the capture boundary so they land in the delta:

| arm | commit made | `src/` | evidence kept | accounting withheld |
|---|---|---|---|---|
| pre-cure `HEAD` (reverse control) | yes | ✅ | 3/3 | **0/3 — swept `dashboard.html`, `guard-stats.jsonl`, `lane-runner.out`** |
| cured (live file) | yes | ✅ | 3/3 | **3/3 ✅** |

`bash -n scripts/lane-runner-v3.sh` → syntax OK.
`bash scripts/runner-commit-decoupling-guard.test.sh` → **13 arms, RESULT: 0 failure(s), rc=0.**

⚠️ The first draft of that probe hardcoded an expected `3` where the fixture wrote `2`, and
reported a false RETENTION HOLE in **both** arms. The tell was arithmetic, not intuition — the
count disagreed with what I had constructed (F-2213-1). Expected counts are now derived from the
fixture's own manifest, so an assertion cannot disagree with what the probe writes.

## The guard, and its reverse control

New arm 1c in `runner-commit-decoupling-guard.test.sh` (already rooted in `test:ledger-guards`),
plus red paths 6 and 7. The assertion is an **exact-shape CONTRACT that fails in both directions
on purpose**: extra entries mean the sweep returned; missing entries mean someone applied the
wholesale exclusion. Arm 7 exists because F-2316-1's recommendation is still written in the ledger
and is what the next fire would reach for — without it, this guard would green the very mistake it
exists to prevent.

All three manufactured variants red **exactly one arm — mine — and each for the right reason**:

| variant | RESULT | committed set observed |
|---|---|---|
| disarm the accounting arm | 1 failure | `logs/dashboard.html,…` — accounting leaked back in |
| wholesale `logs/` (the over-general cure) | 1 failure | `src/game.ts,` alone — evidence lost |
| **pre-cure `HEAD` runner** | 1 failure | `logs/dashboard.html,…` — **this guard would have caught F-2316-1** |

## Ops

Runner was `PPID 1` / `TTY ??` — a fire's own detached runner, §2.0b's signature — and idle (all
six queues and `tasks/running/` empty, no codex dispatch child). Stopped with `kill -TERM`, lock
released in 33 ms; `start-lane-runner.sh` restarted it. Downtime ≈ 1 min against empty queues.

**F-2319-2 (non-blocking, safe direction):** `start-lane-runner.sh --check` decides staleness by
comparing the running process's start time against **commit timestamps**, so a fire that edits →
restarts → commits gets a false `⚠️ STALE RUNNER … INERT` warning; the parse genuinely contains
the cure, but the tool cannot see working-tree state. It fails toward *restart* — conservative — and
s2319 restarted again rather than argue with a safety instrument. **The order for any runner-surface
cure is EDIT → COMMIT → RESTART**, which makes the check meaningful instead of noisy.
Final runner: **pid 95989**, `PPID 1`, `TTY ??`, started 00:18:35; `--check` reports
*"loaded the CURRENT lane-runner-v3.sh — no inert commits."*

## Severity, stated honestly

**Nothing reached main.** `logs/guard-stats.jsonl` was untracked on main before this fire and still
is; every guard-stats green read so far is TRUE. What earned the corrective is the class — a
hand-maintained list of what git already knows is a defect awaiting the next filename. What earns
the finding is that the recommended fix for it was worse than the defect.

**Reusable:** when a finding hands you a **cure** as well as a diagnosis, the cure is a claim and
inherits Mistake #4 exactly as the diagnosis does. Price it against the corpus it will act on
before applying it — here one `git log` over 701 commits was the whole difference between closing
a hole and opening a bigger one.
