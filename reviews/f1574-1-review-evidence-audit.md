# F-1574-1 — review evidence audit

**Slice:** `f1574-1-review-evidence-audit`  
**Branch:** `lane/b`  
**Verdict:** **READY-FOR-GATES — the drain now gets an advisory, directory-aware warning when a review cites evidence that exists only on disk.**

## What changed

`scripts/review-evidence-audit.mjs` audits one or more review files by default and the tracked review corpus with `--all`. It extracts evidence-shaped backticked spans, separates `TRACKED`, `ON-DISK-UNTRACKED`, `ABSENT`, and `SKIPPED`, and exits zero unless `--strict` finds the on-disk-only disease. `scripts/review-evidence-audit.test.mjs` supplies six temp-git-tree arms, and `package.json` roots it in `test:node-guards`.

The drain law gained exactly this line:

> Before committing it, run `node scripts/review-evidence-audit.mjs reviews/<slice>.md`. For each `ON-DISK-UNTRACKED` path inside the task's declared TOUCH-ONLY scope, `git add -f <path>`; report paths outside that scope without adding them.

## Live corpus

Banked output: `artifacts/f1574-1-review-evidence/live-corpus.txt`.

```text
paths=796 citations=1043 TRACKED=725 ON-DISK-UNTRACKED=0 ABSENT=8 SKIPPED=310
```

The load-bearing prediction matched: **ON-DISK-UNTRACKED=0**. The other buckets differ from the approximate dispatch prediction (`~735` literal / `~11` unresolved): the implemented Markdown-span-first extraction counts four adjacent code-span forms such as `` `artifacts`/`logs` `` as the tracked `artifacts` directory rather than crossing the closing and opening backticks into a false literal. The final measured literal denominator is 733 (`725 + 0 + 8`), with 310 skipped. This follows the stated extraction rule rather than tuning toward the estimate.

Single-file default, rc=0:

```text
PASS — no on-disk-untracked evidence cited
paths=1 citations=5 TRACKED=2 ON-DISK-UNTRACKED=0 ABSENT=0 SKIPPED=3
```

`--strict --all` also returned rc=0 because its only non-zero condition, `ON-DISK-UNTRACKED`, was empty. The temp-tree ignored-log arm returned rc=1 under `--strict`; the same fixture returned rc=0 in default advisory mode.

## Manufactured red and restore

I disabled only directory-set resolution and ran the named regression arm. Exact assertion payload:

```text
AssertionError [ERR_ASSERTION]: The input did not match the regular expression /TRACKED=1 ON-DISK-UNTRACKED=0 ABSENT=0 SKIPPED=0/. Input:

'ON-DISK-UNTRACKED\tartifacts/x/\treviews/subject.md\n' +
  'WARN — review cites evidence present only on disk\n' +
  'paths=1 citations=1 TRACKED=0 ON-DISK-UNTRACKED=1 ABSENT=0 SKIPPED=0\n'
```

The assertion was `274-vs-13 regression: a review citing a tracked directory is TRACKED`; actual was `TRACKED=0 ON-DISK-UNTRACKED=1`, expected `TRACKED=1 ON-DISK-UNTRACKED=0`. Directory resolution was restored, and the complete focused suite then passed **6 tests / 6 pass / 0 fail / 0 skipped**.

## Verification

- `npx tsc --noEmit`: rc=0.
- `npm run build`: green; Vite **1.20s**; `[asset-diet] Herald dev-path art 1158214 bytes (1500000 byte ceiling).` Final asset line: **235 GLBs 84% cut; 54 plate-class PNGs 87% cut**.
- `npm run test:ledger-guards`: green; core **132 tests / 132 pass / 0 fail / 0 skipped**, followed by `findings-state`, `blocker-panel`, `ruling-propagation`, `citations`, `desk-declaration`, `desk-birth`, `status-archive-audit`, `attended-owed-audit`, the three shell guard scripts, and `nul-audit`, all green or their documented ACTIVE-lock skip.
- `law-pointer-guard` did **not** red after the drain-law edit, so no coordinate was re-based.
- `npm run test:node-guards`, run alone under Node 24.14.0: **399 tests / 399 pass / 0 fail / 0 skipped**; every chained leaf also passed. Node 23.11.1 first exposed its already-diagnosed per-file timeout incompatibility; repo-pinned Node 26.4.0 then hung `claimed-spec-harness-guard.test.mjs` beyond 528 seconds. A focused Node 24 control covering that test, timeout semantics, gate callers, and this audit passed 38/38 before the full green run. No runtime files were changed.
- `git diff --check`: rc=0.

No Playwright was owed or run: this slice touches no `src/**`, `e2e/**`, `src/sim/`, `src/systems/`, or `src/entities/` path.

## Findings and firewall

- **Adjacent, deliberately not fixed:** Node 26.4.0 left `claimed-spec-harness-guard.test.mjs` pending beyond its five-minute harness timeout, while Node 24.14.0 completed the full battery green. This is outside TOUCH-ONLY and did not alter the audit result.
- The firewall held. No existing review, evidence file, `.gitignore`, source, e2e, spec, task, status, or citation-title file changed.
