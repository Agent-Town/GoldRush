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

Constructible, without mutating this worktree. I cloned a scratch tree at the f1574 base `4ef1bcd02`, restored the real file from lane tip `20515bb9d` into the worktree only, and confirmed git saw:

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
