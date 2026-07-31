# Task findings-state-guard: make it impossible for a BACKLOG finding to be closed and open at the same time (LANE SLOT)
FIRE-AUTHORED s1258 (attended review welcome)
You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b` (branch `lane/m4`, commit prefix `test:`).
CODEX: model=gpt-5.6-sol effort=high

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)

The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m4 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

> ℹ️ Authoring-time safety measurement (s1258 — **verify it yourself anyway**): `lane/m4`'s only ahead commit was `7291f08a`, which I drained this fire as `af48a749`. **`git diff --stat main lane/m4 -- src e2e scripts package.json` is EMPTY** — zero substantive difference in any code path. The branch will still *look* ahead because of regenerated screenshots and log churn; that is the standing false-ahead shape on this lane, not undrained work. Safe dupe.

## Why — the ledger told the last authoring fire to start from the findings, and three of the four it offered were already fixed

s1257's handoff closed with a standing instruction, in bold: *"the ladder holds no other ready master, so the next authoring fire should start from the FINDINGS."* This fire (s1258) obeyed it, and found the list unsafe to obey.

Of the four findings `tasks/BACKLOG.md` marked unclaimed-and-**fire-authorable**, **three were already cured** — two of them over a hundred fires ago — while still presenting as open work:

- **F-1149-1** (dead `mirrored` column) and **F-1149-2** (frame count from the wrong contract key) — cured by **`208cd209`**, whose subject line literally names them: *"drain: lane-c-activations-derivation-hardening — spec derivation now matches SpriteAnimator (F-1149-1/2, F-1150-4)"*.
- **F-1152-2 / F-1152-3** (hardcoded `palisadesPlaced: 5`; wrong default `arm`) — cured by **`e35015ae`**, with in-code comments naming each finding.

And here is the part that makes this mechanizable rather than merely embarrassing: **BACKLOG already contained the closure lines for all three** (`L317` for F-1152-2/3, `L319` for F-1149-1/2). Nothing was lost or forgotten. The file simply carried **the closure and the open copy of the same finding at the same time**, and the findings list is read far more often than the closure block above it. That is the *half-retired ledger entry* — the failure mode this house already knows is worse than no entry at all — and it cost nothing to detect once the question was asked mechanically.

**A fire that trusted the ledger would have burned its one authoring slot re-fixing cured code.** That is Mistake #8's shape (the 824k flail) reached through the ledger instead of through a stale master, and no existing guard looks for it: `citation-title-guard.mjs` checks that `spec:line` citations carry recoverable test titles — a different subject entirely.

## The class, measured at authoring (s1258) — including the discriminator's own validation

Naive parsing ("does this F-ID appear on a ✅ line and on a 🟡 line?") reports **15** double-state IDs across 195, and **most are false**: a finding's prose routinely *cites* other F-IDs, and a mention is not a status claim. The working discriminator is narrower — **an F-ID is declared by a line only when it appears in that line's leading subject zone (~140 chars), not merely somewhere in its prose** — plus a struck-line rule (`~~…~~`, or `✅ CLOSED` / `✅ RETIRED` / `struck sNNN`).

**That discriminator was validated on the defective case, not the clean one** (this house has a law about exactly that):

| Tree | Declared subjects | Double-state | Named |
|---|---|---|---|
| `eb82969f^` (before this fire's strike) | 77 | **4** | F-1149-1, F-1149-2, F-1152-2, F-1152-3 |
| `main` @ `eb82969f` (after) | 78 | **0** | — |

It finds **exactly** the four findings independently proven cured by code probe, and **nothing else** — no false positives on a 1900-line file dense with cross-citations. Post-strike it reads zero. **So the debt is already paid: this guard can gate at ZERO and needs no grandfathered baseline**, unlike its `citation-title-baseline.json` sibling. That is a deliberate and checkable claim, and scope 2 makes you re-derive it rather than inherit it.

## Scope (numbered; each item independently checkable)

1. **Write `scripts/findings-state-guard.mjs`**, following the house shape of `scripts/citation-title-guard.mjs` (read it first — same flag vocabulary, same header-comment discipline explaining WHY and what the check does *not* cover): a `--root <dir>` override so tests and detached worktrees work, a `--report` mode that prints the full census and always exits 0, and a default gate mode that **exits 1** when any F-ID is declared both closed and open in `tasks/BACKLOG.md`, printing each offender with its closed and open line numbers.
2. **Re-derive the baseline count yourself; do NOT inherit the table above.** Run your finished guard against current `main` and against `eb82969f^` (`git show eb82969f^:tasks/BACKLOG.md` — history here is never rewritten, so the blob is stable). Report both numbers. **If current main is not 0, STOP AND REPORT rather than adding a baseline file** — a non-zero reading means either the discriminator differs from mine or a new double-state landed after `eb82969f`, and which of those it is decides the design. Do not paper over it.
3. **Test it at `scripts/findings-state-guard.test.mjs`** (`node --test`, matching the sibling test's style) with **both** arms:
   - **the real-history arm** — the `eb82969f^` blob must yield exactly the four IDs `F-1149-1`, `F-1149-2`, `F-1152-2`, `F-1152-3`, and current `tasks/BACKLOG.md` must yield zero. If the blob is unreachable, **fail loudly — do not skip**; a skipped guard is an unrun guard.
   - **a synthetic arm** for the discriminator's edges, which the real arm cannot cover: an ID cited in another finding's *prose* must NOT count as a declaration; a `~~struck~~` line must count as closed; an ID declared open twice and never closed must NOT be reported.
   ⚠️ Build the synthetic fixtures to **refute** the parser, not to agree with it — a fixture written by reading your own implementation is tautological.
4. **Wire it, in the two places this repo wires guards:** add `"test:findings-state": "node scripts/findings-state-guard.mjs"` to `package.json`, and append `scripts/findings-state-guard.test.mjs` to the explicit file list in `test:node-guards`. Then **run `npm run test:gate-callers`** — an unwired guard is a known defect class here, and that audit is what catches it.
5. **Do not edit `tasks/BACKLOG.md`.** The guard reads it; it must not rewrite it, and neither may you. If your guard reports an offender beyond the four above, that is scope 2's STOP, not a cleanup job.

## Firewall

**TOUCH-ONLY:** `scripts/findings-state-guard.mjs` (new) · `scripts/findings-state-guard.test.mjs` (new) · `package.json` (the two script entries in scope 4, nothing else).

**NO:** ⛔ **zero `src/` bytes — this slice changes no product code whatsoever** · ⛔ **do not edit `tasks/BACKLOG.md`, `tasks/goals.json`, or `STATUS.md`** — those are the fire's ledgers and a lane task writing them is a one-writer-per-surface violation · do not edit `scripts/citation-title-guard.mjs` or its baseline (read it, copy its shape, leave it alone) · do not "also fix" the other guards you may notice lacking callers — report them, one class per slice · no new dependencies · do not add a baseline/grandfather file (see scope 2 — if you think you need one, you have found a STOP, not a requirement).

## Self-check (name the exact commands and both projects)

- `npx tsc --noEmit` clean · `npm run build` green.
- `npm run test:node-guards` — **derive the baseline yourself before your change** (measured at authoring s1258: the list held 27 test files; your change makes it 28) and report before/after. ⚠️ **This phase is known non-deterministic under load (F-1088-2): `scripts/stream-showcase-queue.test.mjs:42` is load-sensitive and has failed 1-in-4 concurrent runs on clean main.** If it reds, **isolate before believing you caused it** — re-run at `--test-concurrency=1`, and report both readings. A red there is not your slice unless it survives isolation.
- `npm run test:findings-state` — must exit **0** on current main. Show the `--report` census output too.
- `npm run test:gate-callers` — must not report your new guard as uncalled.
- `npm run test:citations` — the sibling ledger guard must stay green; you are adding a file to `tasks/`-adjacent tooling, not to `tasks/**`, so expect no movement, and say so if you see any.
- **No playwright suites are owed and none should be run**: this slice adds a node script and touches no `e2e/` file, no `src/` byte, and nothing the browser loads. **Do not regenerate any `artifacts/` or `reviews/` screenshots** — regenerated evidence with no change behind it is churn.
- Zero console output on the gate path beyond the guard's own intended report.

## READY-FOR-GATES + report

Report: **both numbers from scope 2** (current main and `eb82969f^`), and whether they matched the authoring table — **if current main is not 0, that is a STOP, and I want the offenders listed rather than fixed** · the `--report` census (how many F-IDs are declared subjects, how many closed, how many open) · your synthetic fixtures and, for each, which *wrong* parser behaviour it would catch · `test:node-guards` before/after counts, with the isolation re-run if `stream-showcase-queue` reds · `npm run test:gate-callers` result · `git diff --stat` proving zero `src/` bytes, zero `e2e/` bytes and no `tasks/` edits · any other guard you noticed without an automated caller, **named but NOT wired**.
