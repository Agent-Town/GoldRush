# Task 081-continue-button-regression: the Continue button vanished for suspended runs (MAIN slot; commit prefix "fix:")
CODEX: model=gpt-5.6-sol effort=medium
REGRESSION, proven pre-existing vs the Session-B merges (baseline red on main~5): `e2e/044-start-screen.spec.ts:120` — a profile WITH a suspend slot no longer shows `start-menu-continue`. Suspect window: the 078 drain (`e0be17b7` removed dead start-menu claim wiring from StartMenu.ts/main.ts) — likely severed the suspend→Continue render path or its data read. Pre-flight: main-slot tracked-clean. READ FIRST: the failing test (its fixture seeds a suspend slot then asserts Continue), StartMenu.ts render() suspend branch, `readRunSuspend`, the e0be17b7 diff.
## Scope
1. Root-cause via the e0be17b7 diff; restore the Continue path (button renders for a live suspend, enters the run path); do NOT reintroduce the dead onNewClaim wiring.
2. Gate: 044-start-screen.spec 100% green both projects; profile-first-boot + town-t6 regressions green (they assert the REMOVED button stays absent); m1-01.
Firewall: StartMenu.ts/main.ts continue path + nothing else. End: READY-FOR-GATES + the root-cause sentence.
