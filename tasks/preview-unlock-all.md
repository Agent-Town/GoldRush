# Task preview-unlock-all: on non-release builds the owner can open every contract from the board (SCRATCH WORKTREE, commit prefix "feat:")

You are the implementer for Gold Rush (Claude Opus 5, the overnight wave of 2026-09-05), running natively on Robin's Mac in a scratch worktree the attended session prepares (branch `feat/preview-unlock-all`).
READ FIRST: AGENTS.md; `artifacts/playability-smoke/report.md` ("Not proven": 16 of 42 contracts unlock by `default`; the other 26 sit behind `secured:<predecessor>` chains, science thresholds or the era gate); `src/meta/ContractUnlock.ts:19-60` (`contractUnlockStatus`: the predicates — `default`, waves ≥ 10 on The Claim, any secured, science complete, science + two secured, …); `src/main.ts:47-91` (the `__GR_RELEASE_E1__` gate: everything preview-only lives behind `!__GR_RELEASE_E1__`); the town board UI that renders lock states (grep `contractUnlockStatus` callers under `src/town/` and `src/ui/`); `e2e/contract-briefings.spec.ts` (how the board is driven in tests); CLAUDE.md §5 Mistake #10 (the owner must reach it in a plain boot — no `?debug`).
Pre-flight: the scratch worktree is on a fresh branch from current main; verify `git status --short` is clean apart from the FACTORY-CHURN EXCEPTION below and `git branch --show-current` is `feat/preview-unlock-all`, else STOP.
**FACTORY-CHURN EXCEPTION (F-1407-1):** list and proceed past regenerated `logs/**`, `artifacts/**`, `reviews/shots-*` and `.png` evidence; do not discard another writer's files. Other modified tracked files, including `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**` and `reviews/*.md`, still STOP the task.

## Why (Owner, 2026-09-05 night: "how do we get them all playable for me to test? … push hard while I sleep")
The full-board preview at https://full-board.gold-rush-3in.pages.dev/ lists all 42 contracts, but 26 are locked behind progression the owner would have to grind through to test the later eras by hand tomorrow. The preview exists for testing; production (the E1 release) must never carry this.

## Scope
1. **A preview-only "Open every claim" control** on the town board, compiled out of the E1 release (`if (__GR_RELEASE_E1__) …` never renders it; prove by grepping the release bundle for its label) that writes a profile flag; `contractUnlockStatus` returns `unlocked: true` with condition "opened for testing" when the flag is set on a non-release build. A second click clears it. The flag is per profile (the same storage the unlock chain reads), never global, never a URL parameter that could be shared.
2. **Honesty on the board:** every card opened this way shows a small "testing" tag so the owner never mistakes it for a real unlock; standings submitted from such a profile are unaffected (the assayer verifies tapes, not unlocks) — state this in the report after reading `functions/api/standings.ts` for any unlock check.
3. **Tests:** `e2e/preview-unlock-all.spec.ts` (plain boot on a dev server): before → 16 unlocked; click → 42 unlocked with the tag; click again → 16; the E1 release build (`GR_RELEASE=e1 npm run build`, `vite preview`) has no such control (assert by DOM and by grepping `dist/` for the label). `contract-briefings` and the board specs unmodified-green both projects.

## Firewall
Touch ONLY: `src/meta/ContractUnlock.ts` (the one flag read), the board UI file you name (the control + the tag), `src/main.ts` only if the release gate needs one line, the new spec, `artifacts/preview-unlock-all/**`, `tasks/BACKLOG.md` (your row). NO changes to: the sim, contract data, `functions/**`, the unlock predicates themselves.

## No-op / honesty guard
If you find yourself about to exit without changes, WRITE WHY into your report first. If a scope item is impossible inside the firewall, do the others, COMMIT them, and report the coupling as file:line. Commit what you have even if you stop early.

## Self-check (evidence, not vibes)
tsc + build green (dev AND `GR_RELEASE=e1`); the spec green both projects; the release-bundle grep proof; screenshots of the board before/after; the engine hash (a `src/` change rotates it; the drain pins).
End: READY-FOR-GATES + the counts (16 → 42 → 16), the release proof, the engine hash.
