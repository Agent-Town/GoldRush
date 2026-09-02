# Task e10-preserve-ranking: preserve contracts rank by preservation, never by gold — the ruled half of the E10 flip (lane-a, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a.
READ FIRST: AGENTS.md; `specs/e10-preserve-objective.md` (Q2 ANSWERED 2026-09-02: preservation ranks E10 preserve contracts, never gold); `tasks/e10-preserve-objective.md` scope 4 (the order, verbatim below) — that run shipped the objective with the ranking untouched because the ruling arrived after dispatch; `functions/api/standings.ts` (`compareScores`: secured → waves desc → baseValue desc → timeAlive desc → gold desc → submittedAt asc; dedup by anonId + riderCount); the `test:stats` fixtures for ranking; `assets/contracts/epoch-10-deepsky/contracts.json` (`e10-last-claim` now carries `twist.preserve`; verify).
SEQUENCING LAW: verify `git log --oneline main | grep -q 'e10-preserve-objective'` (the objective must be merged: the score fields this ranks come from it); if absent, STOP and report "e10-preserve-objective not landed". Do NOT gate on `git log -N` with a small N.
Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-a status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (owner 2026-09-02, verbatim: "sure, start all of them" — Q2 of CAPABILITY-LADDER §6)
A preserve contract that ranks on gold rewards the habit the contract asks the rider to drop. The score must say what the contract means.

## Scope
1. **The preserve branch of `compareScores`:** for rows whose contract carries `twist.preserve` (read the contract def or a per-row flag the submission carries; name which), order: secured first → waves survived with the Preserve alive desc → the Preserve's remaining hp fraction desc → timeAlive desc → submittedAt asc. Gold is never a key for these rows. Rows of contracts without `twist.preserve` keep today's order byte-for-byte (the existing fixtures prove it).
2. **The score fields:** if the submission's score does not yet carry `preserveWavesAlive` and `preserveHpFraction`, add them ADDITIVELY at the tape→score site (name it), derived from the event log the objective run already writes; old rows without them sort last among preserve rows, never crash.
3. **Fixtures:** `test:stats` gains preserve-order cases (secured beats unsecured; more waves-alive beats fewer; hp fraction breaks ties; gold does NOT reorder), plus a mixed-board case proving non-preserve rows are untouched.
4. **skill.md:** one sentence under the E10 contract: "ranked by preservation, never by gold"; guards re-pinned.

## Firewall
Touch ONLY: `functions/api/standings.ts` (the preserve branch + score field read), the tape→score site you name, the `test:stats` fixtures, `public/skill.md` (+ guards), BACKLOG row. NO changes to: the sim, the objective itself, non-preserve ranking, the worker's validation beyond reading two optional fields, other tasks' fresh work.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` clean; `npm run build` green; `npm run test:stats` green with the new cases (count stated) and every pre-existing case unchanged; `npm run test:node-guards` green; a preserve-row ordering table quoted from the fixtures.
End: READY-FOR-GATES + the branch diff, the fixture table, the score-field site.

## No-op / honesty guard
If `compareScores` already branches on a preserve flag (premise wrong), STOP and cite it. If you find yourself about to exit without changes, WRITE WHY into your report first.
