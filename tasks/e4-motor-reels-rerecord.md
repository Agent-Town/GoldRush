# Task e4-motor-reels-rerecord: the four banked Motor reels re-recorded under the 1:1 grammar (SCRATCH worktree, Claude Opus 5 implementer; commit prefix "test:")

> ⏸️ HELD until desk A15 (the Long Road's convoy stop, F-RPG-10) is answered; the Long Road reel cannot be re-recorded honestly before that.

You are the implementer for Gold Rush, running natively on Robin's Mac in a scratch worktree on branch `test/e4-motor-reels-rerecord`, base current `main`.
READ FIRST: AGENTS.md; `reviews/rider-parity-grammar.md` (the grammar; the E4 floor re-plans and their pins in `scripts/e4-roads-and-convoys.test.mjs`; F-RPG-10); `docs/OWNER-DESK-2026-09-06.md` §A15 and its ruling; `e2e/e4-roads-and-convoys.spec.ts:69` ("every Motor reel replays to its claimed hash in Node and Chromium") and the four reels it names; `scripts/e4-motor-ride.mjs`; `artifacts/rider-parity-grammar/retirement-ledger.json` (the four rows for these reels).
Pre-flight: this worktree was cut from `main` by the attended session; `git status --short` must be clean apart from the `node_modules` symlink. If tracked files are dirty or the branch is wrong, STOP and report.

## Why
The four Motor reels the spec replays were recorded with `MOVE_TO` and `HOLD`; under ADR-005 the door refuses them at submission, so the spec is red on main with a named cause. Re-recording is the retirement's other half.

## Scope
1. Apply the owner's A15 ruling to the Long Road stop (the reach constant or the moved stop) as per-map data, with the floor guard re-pinned and the cause stated.
2. Re-record each of the four reels with a hero-walked plan through the public door (the E4 floor plans in `scripts/e4-roads-and-convoys.test.mjs` are the model), twice byte-identical each; land them where the spec reads them; re-pin `e2e/e4-roads-and-convoys.spec.ts:69` with BEFORE/AFTER hashes and the cause; the ledger rows for the retired reels get a "re-recorded as" pointer, nothing deleted.
3. `e2e/e4-roads-and-convoys.spec.ts` green on both projects at one worker on your own port; `scripts/e4-roads-and-convoys.test.mjs` green; the engine hash reported (the drain pins it if data moved).

## Firewall
Touch ONLY: the four reel files the spec names, `e2e/e4-roads-and-convoys.spec.ts` (pins only, cited), `scripts/e4-roads-and-convoys.test.mjs` (pins only, cited), the Long Road's per-map data for A15, `artifacts/rider-parity-grammar/retirement-ledger.json` (pointers only), `artifacts/e4-motor-reels-rerecord/**`, one row at the top of `tasks/BACKLOG.md`. NO changes to: `src/**` beyond the A15 data read, other specs, `STATUS.md`.

## Self-check
tsc + build green; the spec and guard above green; zero console/page errors. No `pkill`; stop only PIDs you started, by number. END: READY-FOR-GATES + the four BEFORE/AFTER hashes with causes, the A15 change, findings with file:line.
