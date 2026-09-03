# Task ledger-exposure-guard-declares-tables: the mirror-exposure guard says which tables it inspected and names the ones it could not (lane-d, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
READ FIRST: AGENTS.md; `tasks/BACKLOG.md` row **F-2470-1** (s2470 drain of refusal-taxonomy: the guard "cannot see a table with no `key` column, and refusal-taxonomy just added one"); `scripts/ledger-mirror-exposure.mjs` (~:143 `if (!cols.includes('key'))`: tables without a `key` column are skipped silently); its test under `scripts/`; the LB-01 ONE-WAY DOOR law in `scripts/fire.md` (a mirror row committed to git is undone only by a force-push, which is deny-listed); F-2208-1 in BACKLOG (a declaration that appears only on failure re-creates the ambiguity it removes); the refusals table added by `refusal-taxonomy` (merged 75e86f1c3; its columns).
Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-d status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (F-2470-1: a guard that skips a table silently protects nothing about that table, and the refusals table now carries rider identities)
The one-way door is only as good as the instrument that checks what walks through it. Today the instrument enumerates every table but harvests only those with a `key` column and says nothing about the rest.

## Scope
1. **Declare the corpus, on the happy path too:** the guard's verdict line lists every table it inspected with the columns it harvested, and NAMES any table skipped for lacking a `key` column, every run (never only on failure).
2. **Inspect the refusals table:** extend harvesting to declared identity columns for tables without `key` (a small per-table column map inside the guard: the refusals table's rider identity columns), so an exposed rider identity in a mirror row is caught the same way an exposed key is.
3. **Tests:** the guard's existing test gains (a) a fixture table without `key` that is NAMED as skipped when unmapped, (b) the mapped refusals fixture whose identity column is caught when exposed; mutation proof quoted.

## Firewall
Touch ONLY: `scripts/ledger-mirror-exposure.mjs`, its test file, BACKLOG row. NO changes to: the ledger schema, the worker, `scripts/fire.md` (propose any duty wording in the report), other tasks' fresh work.

## Self-check (evidence, not vibes)
`npm run test:node-guards` green (count) and the guard's own test green with the new cases; one real run's verdict line quoted showing the table list and the named skips; the mutation proof.
End: READY-FOR-GATES + the verdict line and the proof.

## No-op / honesty guard
If the guard already declares skipped tables on the happy path (premise wrong), STOP and cite the line.
