# Task playability-smoke-36: every board contract boots plain for a human, on the full-board preview and on main (LANE-B, commit prefix "test:")

You are the implementer for Gold Rush (Claude Opus 5, the overnight wave of 2026-09-05), running natively on Robin's Mac in `worktrees/lane-b` (branch `lane/b`).
READ FIRST: AGENTS.md; `specs/epoch-saga/CAPABILITY-LADDER.md` §3 L4 (the owner is the reference tester; the human path is never cut) and L7 (same laws for human and machine); `src/meta/ContractFamilies.ts:1004` (`listBoardContracts()` — the 36 board contracts in the dev/full-board build; the E1 release narrows it via `__GR_RELEASE_E1__` in `src/main.ts:47`); `e2e/contract-briefings.spec.ts` (how a plain boot of every contract is driven today and what a briefing looks like); `e2e/e4-vehicles-plain-boot.spec.ts` and `e2e/same-laws-harvest-parity.spec.ts` (plain-boot patterns with human input); `e2e/lantern-true-world.spec.ts` (the reel); the `?debug` seam is NOT allowed here (Mistake #10: the player must see it in a plain boot).

## Why (owner 2026-09-05: "how do we get them all playable for me to test?")
The owner tests every contract by hand tomorrow on the full-board preview (`https://full-board.gold-rush-3in.pages.dev/`, deployed attended from a `GR_RELEASE=` build). Before he spends a morning on it, the factory must prove that each of the 36 contracts boots plain, shows its briefing and HUD, accepts keyboard input that moves the hero, reaches wave 2 without a console or page error, and can be secured or lost in principle — on desktop and at 390px. Anything that fails is a blocker to file tonight, not a surprise for him.

## Scope
1. **A matrix spec `e2e/playability-smoke.spec.ts`** parameterised over `listBoardContracts()`: for each contract, plain boot (no `?debug`), dismiss the briefing after asserting it names the contract, assert the HUD (gold, wave, the contract's own objective line), press the movement keys for two seconds and assert the hero moved (diagnostics are read-only), let the run reach wave 2 (use the existing time-scale/manual-sim seams ONLY if they are player-reachable; otherwise real time capped at 90 s per contract), assert zero console/page errors, take one screenshot per contract per project to `artifacts/playability-smoke/<contract>-<project>.png` (≤ 300 KB each — scale them). Tag the spec `@slow`; it is NOT added to the default battery (a separate npm script `test:playability` runs it).
2. **Run it twice:** against a dev server of your worktree (`GR_RELEASE=` unset) and against the deployed preview (`GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=https://full-board.gold-rush-3in.pages.dev`). Record both matrices in `artifacts/playability-smoke/report.md`: contract · project · boots · briefing · HUD · moves · wave 2 · errors · screenshot.
3. **Blockers:** every failing cell becomes a row in the report with the console/page error text and a `file:line` suspicion; do not fix game code here (firewall) — the attended session files correctives from your list.

## Firewall
Touch ONLY: `e2e/playability-smoke.spec.ts`, `package.json` (one new script `test:playability`; do NOT touch `test:node-guards`), `artifacts/playability-smoke/**`, `tasks/BACKLOG.md` (your row). NO changes to: `src/**`, contract data, other specs. Keep artifacts small (scaled PNGs; no `test-results/**`).

## Self-check
`npx tsc --noEmit` clean; the spec runs green for every contract that is playable and reports the rest; both matrices in the report; zero fabricated cells (every row has a screenshot).
End: READY-FOR-GATES + the two matrices (counts: boots / briefing / HUD / moves / wave 2 / clean) and the blocker list.
