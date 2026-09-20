# F-1576-1 — guard rooting at authoring

**Slice:** `f1576-1-guard-rooting-at-authoring` · **branch:** `lane/b` · **base:** `main` at dispatch

**Verdict: READY-FOR-GATES.** The caller audit now has an opt-in working-tree subject union without changing its tracked-only default, refuses to baseline that union, and the authoring skill requires guard rooting to be decided in the master.

## What changed

- `scripts/gate-caller-audit.mjs` adds `--include-untracked`, unioning `git ls-files` with `git ls-files --others --exclude-standard`. The default still returns the original tracked list and prints byte-identical fixture output.
- The opt-in denominator appends `(+N untracked)`. `SCRATCH_FILE` and ignored files remain excluded from subjects.
- `--update-baseline --include-untracked` refuses at rc=2 before any baseline read or write.
- `scripts/gate-caller-audit.test.mjs` adds the five required regression/refusal arms plus the ignored-file arm needed to prove `--exclude-standard` has teeth.
- `.claude/skills/author-task/SKILL.md` §0 now verifies five facts and makes the rooting disposition an authoring input.

## Audit summaries

Default, unchanged from the pre-edit main measurement:

```text
  scripts/ files      : 301 (27 guard-shaped)
  subjects            : 50   orphans: 12
  grandfathered       : 12
  owner escalations   : 3   unrouted: 0
PASS — every gate-shaped subject is either reached or grandfathered with a reason.
```

Opt-in working-tree mode:

```text
  scripts/ files      : 301 (27 guard-shaped) (+0 untracked)
  subjects            : 50   orphans: 12
  grandfathered       : 12
  owner escalations   : 3   unrouted: 0
PASS — every gate-shaped subject is either reached or grandfathered with a reason.
```

Post-final-`git add` self-check:

```text
  scripts/ files      : 301 (27 guard-shaped)
  subjects            : 50   orphans: 12
PASS — every gate-shaped subject is either reached or grandfathered with a reason.
```

## New focused arms

The focused suite passed **25 tests / 25 pass / 0 fail / 0 skipped**. The six additions are:

1. `REGRESSION: an untracked guard-shaped file is byte-invisible by default`
2. `--include-untracked reports an untracked guard-shaped file as NEW with no caller`
3. `a tracked baselined orphan stays known under --include-untracked`
4. `--include-untracked still excludes untracked SCRATCH_FILE probes`
5. `--include-untracked excludes gitignored guard-shaped files`
6. `--update-baseline --include-untracked REFUSES without writing baseline bytes`

## Manufactured RED and restore

I temporarily changed the union command from `git ls-files --others --exclude-standard` to `git ls-files --others`. The named arm failed exactly where intended:

```text
✖ --include-untracked excludes gitignored guard-shaped files
AssertionError [ERR_ASSERTION]: gate-caller-audit — who calls each gate?
  scripts/ files      : 4 (3 guard-shaped) (+1 untracked)
  subjects            : 6   orphans: 1
  NEW    scripts/ignored-audit.mjs                 NO CALLER

FAIL — 1 gate(s) with no caller and no recorded reason:
  scripts/ignored-audit.mjs

1 !== 0
actual: 1
expected: 0
operator: 'strictEqual'
```

The assertion was `assert.equal(r.status, 0, r.stdout + r.stderr)` in `--include-untracked excludes gitignored guard-shaped files`. Restoring `--exclude-standard` made that same isolated arm **1/1 pass**, then the complete focused suite passed 25/25.

## Real-incident replay

Constructible, without mutating this worktree. I cloned a scratch tree at the f1574 base `c4ebae65e`, restored the real file from lane tip `8a0f992db` into the worktree only, and confirmed git saw:

```text
?? scripts/review-evidence-audit.mjs
```

Running the cured audit against that scratch root produced:

```text
  scripts/ files      : 300 (27 guard-shaped) (+1 untracked)
  subjects            : 50   orphans: 12
  grandfathered       : 11
  NEW    scripts/review-evidence-audit.mjs         NO CALLER

FAIL — 1 gate(s) with no caller and no recorded reason:
  scripts/review-evidence-audit.mjs
REPLAY_RC=1
```

The scratch clone was moved to Trash afterward.

## Authoring-law text

The exact addition is:

> 5. **A new guard-shaped script has its rooting decided IN THE MASTER (F-1576-1).** If the master creates a file under `scripts/` whose name matches `(guard|assert|check|audit|contract|ratchet)`, either name the battery that will call it or write the grandfather reason the master will have its runner add to `scripts/gate-caller-baseline.json`. `gate-caller-audit` reads tracked files only and the lane runner commits last, so the runner's own battery cannot see the file it just wrote.
>    `node scripts/gate-caller-audit.mjs --include-untracked`

The §0 heading changed from four facts to five facts. `law-pointer-guard` did **not** red, so no coordinate was re-based.

## Verification

- Pre-edit `npm install --no-audit --no-fund`: up to date.
- `npx tsc --noEmit`: rc=0.
- `npm run build`: green; Vite `✓ built in 1.27s`; `[asset-diet] Herald dev-path art 1158214 bytes (1500000 byte ceiling).`; 235 terrain/landmark GLBs cut 84%, 54 plate-class PNGs cut 87%.
- `node --test scripts/gate-caller-audit.test.mjs`: **25 tests / 25 pass / 0 fail / 0 skipped**.
- `npm run test:ledger-guards`: core **138 tests / 138 pass / 0 fail / 0 skipped**. Chained leaves all green: `findings-state`, `blocker-panel`, `ruling-propagation`, `citations`, `desk-declaration` (ACTIVE-lock skip by design), `desk-birth` (ACTIVE-lock skip by design), `status-archive-audit`, `attended-owed-audit`, `main-lock-gate-guard.sh`, `janitor-request-rejection.sh`, `lane-dispatch-safety-guard.sh`, and `nul-audit`.
- `law-pointer-guard`: green; no coordinate red and no rebase.
- `npm run test:node-guards`, run alone under repo-pinned Node 26.4.0: **405 tests / 405 pass / 0 fail / 0 skipped**, duration 231097.962917ms. Chained `ticker-stats`, `findings-state`, `blocker-panel`, `ruling-propagation`, `desk-declaration`, and `nul-audit` all passed or took the documented ACTIVE-lock skip.
- `git diff --check`: rc=0.

No Playwright was owed or run: the slice touches no `src/**`, `e2e/**`, `src/sim/`, `src/systems/`, or `src/entities/` path.

## Adjacent finding deliberately not fixed

The ambient shell was Node 23.11.1; its file-level `--test-timeout` semantics intentionally red `node-guards-timeout.test.mjs` with the diagnostic “Cure the NODE, not the test: .nvmrc pins 26.4.0.” I changed no runtime or test for that known environment mismatch; the required full battery passed under the repo-pinned Node 26.4.0.

The firewall held: only the three declared existing files and this review were changed. `scripts/gate-caller-baseline.json`, package scripts, drain law, fire law, source, e2e, specs, tasks, and status were not edited.

---

# DRAIN GATE — s1577

**Slice:** `f1576-1-guard-rooting-at-authoring` · **branch:** `lane/b` @ `f2f5b0f` · **base:** `a397b0bf1` · **merge:** `--no-ff` onto main at **`bda3ddd82af1b7bfbf2c407c25d7039622b4415d`**

**VERDICT: MERGED.** Both of the slice's load-bearing promises were re-proved here rather than inherited — the default subject set is unchanged, and the opt-in has teeth — and the second was proved the way this factory requires, **by manufacturing the defect**.

## Merge classification — DISJOINT

Main moved **68** files since the base, all of them **this same fire's drain-1 output** (the f1575-1 artifacts, the two e2e specs, its review, `tasks/BACKLOG.md`, `tasks/goals.json`, `STATUS.md`, three `logs/**`). The lane touched **4**: `scripts/gate-caller-audit.mjs`, `scripts/gate-caller-audit.test.mjs`, `.claude/skills/author-task/SKILL.md`, and this review. **Overlap: 0.** All 4 LANE-TOUCHED, no graft.

ⓘ Draining two slices in one fire decays the second one's classification against a base that has moved underneath it — so this was recomputed against main **after** drain 1 landed, not carried over from the runner's dispatch-time reading.

## Evidence — measured on the MERGED tree (fire shell)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0 |
| `npm run build` | green, Vite **1.41 s**, asset diet `1158214 / 1500000` bytes |
| `node --test scripts/gate-caller-audit.test.mjs` | **25 tests / 25 pass / 0 fail / 0 skipped** (2.6 s) |
| `gate-caller-audit` DEFAULT | **PASS** rc=0 — `301 files (27 guard-shaped) · 50 subjects · 12 orphans · 12 grandfathered · 3 escalations, 0 unrouted` |
| `gate-caller-audit --include-untracked` | **PASS** rc=0 — `(+0 untracked)`, every other figure identical |
| `--update-baseline --include-untracked` | **REFUSES rc=2**, and `gate-caller-baseline.json` bytes **hash-verified unchanged** (`3a324785bafe…` before and after) |
| `law-pointer-guard` | **PASS** — 7 surfaces, 26 pointers (23 checked, 2 illustrative, 1 known-rotten); the §0 `four facts`→`five facts` heading change rotted nothing |
| `test:ledger-guards` | see below, run after the bookkeeping commit (F-1300-4) |

✅ **THE DEFAULT IS PROVABLY UNCHANGED, and this is a stronger check than it looks:** the DEFAULT figures above are byte-for-byte the ones I measured on main **during drain 1, before this slice existed** (`301 (27 guard-shaped) · 50 · 12 · 12 · 3/0`). The comparison is against an independently-taken pre-merge reading, not against the runner's own report of one.

## The teeth, proved by manufacturing the defect

A passing guard never executes its violation path, so its green says nothing about its red (the s1299/s1300 standard). I wrote an untracked guard-shaped file `scripts/zzz-s1577-probe-audit.mjs`, confirmed `git status` reported it `?? `, and ran both modes:

    DEFAULT rc=0   301 files (27 guard-shaped)          — does not mention the probe   (correct: tracked-only preserved)
    OPTIN   rc=1   302 files (28 guard-shaped) (+1 untracked)
                   NEW    scripts/zzz-s1577-probe-audit.mjs         NO CALLER

Probe removed, existence re-checked `false`. ➡️ **This is precisely the s1576 incident replayed on the merged tree**: the file the lane runner had not yet committed is invisible by default and visible on request. Both directions demonstrated, not just the safe one.

## Findings

**None blocking.** The firewall held — I verified by reading the diff that the four declared files are the only ones changed, and that `scripts/gate-caller-baseline.json` was *not* edited (the slice adds a way to ask the question, and deliberately grandfathers nothing new).

ⓘ The runner's adjacent note is confirmed and is an environment fact, not a defect: `node-guards-timeout.test.mjs` reds under an ambient Node 23 shell and passes under the repo-pinned 26.4.0. Its diagnostic already says *"Cure the NODE, not the test"*. Nothing owed.

⚖️ **`test:node-guards` (436 s) not re-run at this gate, with the reason stated rather than skipped silently:** F-1460-1's trigger is `src/sim/` · `src/systems/` · `src/entities/` and this diff touches none of them (no `src/**` or `e2e/**` at all). The runner ran the full battery on the lane under pinned Node — **405 tests / 405 pass / 0 fail** — and the only file this merge changes that any battery reads is `gate-caller-audit.mjs`, whose own 25-test suite and both live modes are green above.
