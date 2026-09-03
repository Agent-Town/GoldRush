# Task f-e4-1-suspend-snapshot-repro: reproduce or refute "RunSuspend.captureSnapshot crashes a live browser ride at the first wave boundary" (lane-a, INVESTIGATE, commit prefix "docs:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a.
READ FIRST: AGENTS.md; `reviews/e4-roads-and-convoys.md` finding **F-E4-1** (the implementer's report: reproduced on `the-claim` under its harness); `artifacts/e4-roads-and-convoys/report.md` (the exact repro steps and stack the implementer recorded); `src/game/RunSuspend.ts` (`captureSnapshot`), the wave-boundary hook in `src/game/Game.ts` that calls it; the plain-boot e2e batteries that pass daily (`e2e/task-025*.spec.ts`, `e2e/same-laws-harvest-parity.spec.ts`'s plain-boot probe).
Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-a status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (a claim that "any live browser ride" crashes at the first wave boundary is either a P0 for every player or an artefact of one harness; it must be one or the other before anyone edits the suspend path)
Players ride the Claim daily and the plain-boot batteries pass, so the trigger is probably harness-specific (manual sim stepping, a snapshot taken mid-step, a missing profile). Find out.

## Scope (READ-ONLY on `src/**`)
1. Reproduce with a PLAIN boot (no `?debug`, no manual sim) through the first wave boundary on `the-claim` at desktop and 390px: does `captureSnapshot` throw? Capture console and page errors.
2. Reproduce under the implementer's harness conditions exactly as its report describes; diff the two conditions to the single difference that triggers it.
3. Write `docs/audits/2026-09-04-f-e4-1-suspend-snapshot.md`: VERDICT (player-visible / harness-only / cannot reproduce), the trigger with file:line, and the smallest cure proposal (a proposal, not a fix).
4. BACKLOG row with the verdict.

## Firewall
Touch ONLY: the audit doc, `artifacts/f-e4-1/` evidence, BACKLOG row. NO changes to `src/**`, `e2e/**`, `scripts/**`.

## Self-check
Both repro attempts logged with console output; the verdict states which condition reproduces; `git status --short` shows only the audit doc, artifacts and the BACKLOG row.
End: READY-FOR-GATES + the verdict line.

## No-op / honesty guard
If neither condition reproduces after an honest attempt, say CANNOT REPRODUCE with the exact steps tried; never guess a cause.
