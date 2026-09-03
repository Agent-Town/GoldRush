# Task self-unified-grid: the almanac already holds HarnessDev's grid — publish which deltas are the model and which are the harness (lane-d, ANALYSIS, commit prefix "docs:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
READ FIRST: AGENTS.md; `docs/research/2026-09-03-harnessdev-and-the-county.md` §3 D (owner-approved 2026-09-03) and the paper's Self-Eval/Unified-Eval definitions quoted there; the gauntlet almanac at `~/Claude/Projects/goldrush-gauntlet/` (`HARNESSES.md`, `almanac/`, `almanac-attempts/`, `baron-campaign/`, `memories/<harness>__<model>/` notebooks with generation headers: model, harness+version, effort, era, contracts, cost); `artifacts/gauntlet-heat*/` in this repo (per-heat matrices; heat 10's leveling delta table is the model of a clean comparison); the live standings API (verified rows only).
Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-d status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (HarnessDev: a harness's score conflates harness design, executor capability and their compatibility; only a fixed-executor view separates them)
The county has both views for free: harness-fixed/model-varied rows (the codex family across gpt-5.4, 5.5, 5.6-luna/sol/terra; the pi-family ablation) and model-fixed/harness-varied rows (Fable and Opus under Claude charters versus the same models elsewhere). Nobody has assembled the grid.

## Scope (READ-ONLY on `src/**`; this task changes no code)
1. **The grid** `docs/analysis/2026-09-03-self-unified-grid.md`: rows = harness families, columns = models; each cell = best verified waves on the Claim and on the Baron (and gold, orders/calls where recorded), with the source (almanac path or standings row) and the era it was ridden in. Only VERIFIED or almanac-attested results; probes excluded; era noted because cross-era numbers are not comparable.
2. **Two derived tables:** (a) harness fixed, model varied (what the model buys); (b) model fixed, harness varied (what the harness buys). Where the same model rode two harnesses, quote the delta; where a harness rode two models, quote it; where the almanac lacks a cell, mark it EMPTY rather than guessing.
3. **Three honest paragraphs:** what the data supports, what it cannot separate (era differences, seeds, attempt counts), and the three cells most worth filling with one ride each.
4. BACKLOG row with the counts.

## Firewall
Touch ONLY: `docs/analysis/2026-09-03-self-unified-grid.md` (new), BACKLOG row. NO changes to `src/**`, `scripts/**`, `assets/**`, `public/**`, the gauntlet repo (read only; no commits there), other tasks' fresh work.

## Self-check (evidence, not vibes)
Every cell cites a path or a standings row id; the grid's rider list matches `HARNESSES.md`; eras stated per cell; `git status --short` shows only the doc and the BACKLOG row.
End: READY-FOR-GATES + the two derived tables inline in the report.

## No-op / honesty guard
If the almanac's records cannot be tied to eras (name the missing header), publish the grid with an UNDATED marker per such cell rather than omitting it.
