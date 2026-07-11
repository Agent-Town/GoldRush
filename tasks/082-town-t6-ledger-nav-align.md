# Task 082-town-t6-ledger-nav-align: align the town-t6 "plain menu" assertion with the shipped Claim Ledger nav button (MAIN slot; commit prefix "test:")
CODEX: model=gpt-5.6-sol effort=low
**FIRE-AUTHORED (s327, attended review welcome).** Pre-flight: main-slot **tracked-clean** — if `git status` shows tracked dirt (the standing `artifacts/ed-01/*inspector*.png` + `logs/*` debris), STOP and report; do not run until the tree is clean (owner owes the debris sweep).

WHY (evidence, dated): `reviews/081.md` F-081-1 (s327 drain, 2026-07-11). `e2e/town-t6-surfaces.spec.ts:96` asserts the start-menu nav is exactly `['Enter Town', 'Profile', 'Settings']`, but `StartMenu.ts` render() emits an **unconditional** `start-menu-claim-ledger` ("Claim Ledger") button (`data-menu-action="ledger"`) between Enter Town and Profile. Verified: that button was added by `2ca5d58b` (2026-07-09 11:06) which did NOT update this assertion; the test was last aligned by `50386200` (s217, 2026-07-09 00:35). The suite has been RED on `main` since `2ca5d58b`, orthogonal to 081. 044's plain-boot test (`e2e/044-start-screen.spec.ts:45`) confirms the ledger button is intended (it only asserts enter-town/profile/settings are visible, not that ledger is absent).

## Scope
1. In `e2e/town-t6-surfaces.spec.ts:96`, change the expected array to `['Enter Town', 'Claim Ledger', 'Profile', 'Settings']`. No other assertion changes; do NOT touch `StartMenu.ts` or any src.
2. Gate: `e2e/town-t6-surfaces.spec` 100% green both projects (desktop-chrome + mobile-chrome); confirm `044-start-screen`, `profile-first-boot`, `m1-01` unchanged-green; `npx tsc --noEmit` clean (test file typechecks).
Firewall: TOUCH-ONLY `e2e/town-t6-surfaces.spec.ts`. NO: `src/**`, other specs, no new tests. End: READY-FOR-GATES + "town-t6 89 green both projects".
