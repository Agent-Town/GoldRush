CODEX: model=gpt-5.6-sol effort=medium
# Task lane-a-m1-debug-spawn-contract: the M1 spawn test respects debug consent (LANE-A, commit prefix "test:")

FIRE-AUTHORED, s2533, 2026-09-07. Implement one test corrective, F-2533-1, natively in `worktrees/lane-a`; resolve the actual branch with `git worktree list`, never assume lane/a.
READ FIRST: AGENTS.md; `reviews/beat-citation-refresh.md` F-2533-1; `specs/m1-core-loop/slices/01-claim-jumpers-death.md`; STATUS.md verification lessons; the current debugSpawn/isDebugEnabled branch in `src/game/Game.ts`.
Dependency: confirm `9e1d8a2e30beee17f6c034180de2f5c8a2f31b44` (F-RPA-4) is an ancestor of main. Missing dependency: STOP and report, never rebuild it.

Pre-flight: main..HEAD must be empty, the slot must have no undrained done-move, and tracked source/test dirt means STOP. Never reset, clean, replace a branch or edit another worktree. If clean and behind, `git merge --ff-only main`. **FACTORY-CHURN EXCEPTION (F-1407-1):** disjoint `logs/**`, `artifacts/**`, `reviews/shots-*` and `.png` files are expected factory output, not a STOP; list and preserve them. Modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**` or `reviews/*.md` still STOP. Report anything in this task's scope instead of overwriting it. Record the base before editing. Use the repo's native Node version. If dependencies are absent, `npm ci`, never npm install; do not share a Vite optimizer cache with another server.

## Problem and scope

The first M1 case opens a plain URL, presses T, and expects enemiesAlive > 0. F-RPA-4 correctly restricts this debug key to debug-enabled runs. The old case now fails at that assertion on clean base and the citation candidate, desktop and mobile; evidence is `artifacts/s2533-fire/base-controls.txt` and `artifacts/s2533-fire/browser-gates.txt`.

1. Make the existing positive spawn/contact-death/restart case explicitly enable debug, using the existing URL/helper pattern. Preserve every gameplay assertion and the other existing cases.
2. Add one plain-boot negative control: with waves disabled and no debug opt-in, wait for the running frame counter, press T, allow frames to advance, and assert no enemies spawned and no console/page errors. Do not weaken or remove the runtime gate.
3. Retain a short before/after report and complete bounded logs under `artifacts/m1-debug-spawn-contract/`.

Touch ONLY `e2e/m1-01-claim-jumpers-death.spec.ts` and `artifacts/m1-debug-spawn-contract/**`. No src, runtime flags, balance, screenshots baseline updates, new dependencies, STATUS, specs, BACKLOG, goals or engine registry edits. No broad test-helper refactor.

## Verification

Reproduce the existing failure before editing. Afterward run the complete M1 spec on desktop-chrome and mobile-chrome with --workers=1; all existing cases and the new plain negative control must pass, zero console/page errors. Run `npx tsc --noEmit`, `npm run build`, and scoped diff checks. No full simulation replay is needed for a test-only URL/negative-control change; report it as not run. Do not raise timeouts or budgets to force a green.

End READY-FOR-GATES with the base, exact test counts, retained evidence, and any failure. The lane runner commits; the FIRE drains. Do not commit on main.

If exiting without changes, write why into the report first; no silent no-op.
