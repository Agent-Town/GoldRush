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

---

## Drain (s1576, 2026-08-08T23:23Z) — MERGED

**Merge:** `c44076267f3031e07501f7fc33302fd710ab8171` (`--no-ff` of `lane/b` @ `8a0f992db`) · **base:** `c4ebae65e` · **block-check:** CLEAR (`f1574-1-review-evidence-audit`, status "queued").

**Merge classification — DISJOINT, no conflict, no graft.** Main moved 7 files since the base (`STATUS.md`, `tasks/BACKLOG.md`, `tasks/goals.json`, `tasks/lane-c-f1575-1-m4-06-drift-tick-budget.md`, three `logs/**` telemetry files) — all bookkeeping, and **not one of them is in the lane's 6-file set.** Every lane path is LANE-TOUCHED: 4 created (`scripts/review-evidence-audit.mjs`, `scripts/review-evidence-audit.test.mjs`, `reviews/f1574-1-review-evidence-audit.md`, `artifacts/f1574-1-review-evidence/live-corpus.txt`) and 2 edited within firewall (`package.json` +1 filename on the `test:node-guards` line only; `.claude/skills/drain/SKILL.md` +1 line at `:56`, below the `--workers=1` coordinate at `:33`, which is why `law-pointer-guard` stayed green).

**Firewall: HELD, verified by reading the diff, not the report.** `git diff main...lane/b` is exactly the 6 declared paths, +256/-1. No `.gitignore`, no existing review, no `src/**`, `e2e/**`, `specs/**`, `tasks/**`; `reviews/f1572-1-lane-arm-uncensored-drift.md` and `artifacts/f1572-1-lane-arm/**` byte-identical.

### Gate battery (merged tree, fire shell, Node 26.4.0)

| gate | result |
|---|---|
| `npx tsc --noEmit` | rc=0 |
| `npm run build` | green, Vite **1.71s**; `[asset-diet] Herald dev-path art 1158214 bytes (1500000 ceiling)`; 235 GLBs 84% cut / 54 plate-class PNGs 87% cut |
| `node --test scripts/review-evidence-audit.test.mjs` | **6 tests / 6 pass / 0 fail**, 712ms — all six named arms incl. the `274-vs-13 regression` |
| `test:node-guards` core | **399 tests / 396 pass / 0 fail / 3 skipped**, **436.3s**, rc=0 — run ALONE |
| chained leaves (6) | ticker-stats · findings-state · blocker-panel · ruling-propagation · desk-declaration (SKIP on ACTIVE lock, by design) · nul-audit — all PASS |
| `review-evidence-audit --all` on merged tree | `paths=797 citations=1046 TRACKED=728 ON-DISK-UNTRACKED=0 ABSENT=8 SKIPPED=310` |

No Playwright owed or run: the diff touches no `src/**`, `e2e/**`, `src/sim/`, `src/systems/`, `src/entities/` — the §3 path trigger is not met.

**The banked corpus reproduces.** The runner banked `796/1043/725/0/8/310`; I measure `797/1046/728/0/8/310` on the merged tree. The delta is **+1 file / +3 citations / +3 TRACKED** and is fully accounted for: this very review file became tracked at the merge, and it cites three evidence paths. Nothing else moved.

**First execution of the duty this slice installs:** `node scripts/review-evidence-audit.mjs reviews/f1574-1-review-evidence-audit.md` → `PASS … paths=1 citations=3 TRACKED=3 ON-DISK-UNTRACKED=0`. Nothing to `git add -f`.

### Findings

**F-1576-1 — A NEW GUARD-SHAPED SCRIPT CANNOT BE SEEN BY THE BATTERY THAT SHIPS IT, AND THIS IS NOW THE THIRD IDENTICAL INSTANCE. (found at the drain, cured in this drain, mechanism recommended.)**
`test:node-guards` went **rc=1** on the merged tree — `gate-caller-audit`: `NEW scripts/review-evidence-audit.mjs NO CALLER` — on a tree whose code is green and whose runner had honestly reported the same battery **399/399 green**. Both reports are true. ✓ VERIFIED by reading `scripts/gate-caller-audit.mjs:84`: its subject set is **`git ls-files`**, i.e. TRACKED files, and `GUARDISH_FILE` (`:71`) matches the word `audit`. **The lane runner auto-commits only at the END of its run**, so when the runner ran the battery its own new script was still untracked and the audit was structurally incapable of seeing it. The green was **vacuous for the one file the slice existed to add**.

⚠️ **This is not a runner slip — it is a predicted lifecycle event, and the baseline already says so twice in its own prose:** `desk-carryforward-guard.mjs` (s1533: *"this audit's own green was VACUOUS for this file until it was committed"*) and `desk-state-audit.mjs` (s1566: *"the red appeared only on the post-commit run"*). Three instances of one shape is a mechanism question, not three accidents. It is the **F-1300-4 class one axis further out**: F-1300-4 covers subjects a fire mutates late (ledger rows, law surfaces, gate topology) and ordered `test:ledger-guards` as the last act — but `gate-caller-audit` lives in the **436s `test:node-guards`**, not the cheap battery, so the cheap last-act run cannot catch it.

**Cured this drain, the prescribed way:** grandfathered in `scripts/gate-caller-baseline.json` with a written reason (12 entries, was 11), on the **`desk-state-audit.mjs` precedent the master itself told the runner to copy. The disposition is correct on its merits, not a silencing:** the tool is an advisory reader (exit 0 always; `--strict` only on a non-empty `ON-DISK-UNTRACKED`), its caller is a **LAW** (`.claude/skills/drain/SKILL.md` §4, wired in this same slice) and law files are outside this audit's edge vocabulary, its real invocation takes a specific review path no battery can supply, and `--all`'s steady state is a printed 8-item ABSENT backlog at rc=0 over 797 files — *a gate whose usual output is a printed backlog does not belong in a pre-merge battery*, the `attended-owed-audit.mjs` disposition verbatim. Not a coverage hole: the logic is gated by the 6 rooted tests. Re-run after the cure: `subjects 50 · orphans 12 · grandfathered 12 · owner escalations 3, unrouted 0 · PASS`.

➡️ **RECOMMENDATION (fire-authorable, no owner word needed):** the sequence "ship a guard-shaped `scripts/*.mjs` → battery green in lane → `gate-caller-audit` red at drain" is now deterministic and costs a **436s** re-run each time. The cheap cure is a line in `/author-task`: any master creating a file under `scripts/` whose name matches `(guard|assert|check|audit|contract|ratchet)` must decide its rooting **in the master** — root the script, or write its grandfather reason — and the runner must run `gate-caller-audit` **after** `git add`-ing its new file rather than only via the battery.

**F-1576-2 — the runner's Node-version adjacent finding does NOT reproduce (non-blocking, correcting the record).**
The review reports that repo-pinned **Node 26.4.0 hung `claimed-spec-harness-guard.test.mjs` beyond 528s**, and that only Node 24.14.0 gave a full green. ✗ NOT REPRODUCED: this drain ran the whole core battery on **Node 26.4.0** (`.nvmrc` 26.4.0, `/opt/homebrew/bin/node`) **alone**, to completion, **rc=0 in 436.3s** with `claimed-spec-harness-guard` among the passes. The far likelier cause is the **s1536 shape — battery contention on shared `claimed-spec-harness-guard`/`fixture-teardown` fixtures** when two batteries overlap, which is a lane-shell condition, not a Node incompatibility. The runner's own `399/399 pass / 0 skipped` also differs from the merged tree's `396 pass / 3 skipped`; the skips are environment-conditional. **No action owed** — recorded so a later fire does not "fix" a Node pin on a misattributed symptom.

**F-1576-3 — `ABSENT=8` is the tool's live residue; one entry is fresh (non-blocking, advisory by design).**
Per the master, ABSENT is *"a much weaker signal"* than ON-DISK-UNTRACKED and carries no owed act — most are old evidence long since cleaned. Recorded so the number is not re-derived: `artifacts/_devil-strip.png` · `reviews/shots-beauty2-e2-pressure-garden/` · `reviews/shots-beauty-trestle/` · `artifacts/audit-drip-data-path/report.md` · `artifacts/e1-perf-pass/latest/` · `artifacts/perf-e1-r2/draws-latest-desktop-chrome.json` · `artifacts/f1569-1-live-corpus` · `artifacts/tl-03/pw.config.mjs`. ⚠️ **`artifacts/f1569-1-live-corpus` is only days old** (cited by `reviews/f1570-1-no-trace-banner-column.md`, drained s1570) — the one entry here that may be a real never-banked artifact rather than cleaned history. Not chased this fire; flagged for whoever next touches that thread.
