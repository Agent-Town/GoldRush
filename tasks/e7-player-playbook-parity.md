# Task e7-player-playbook-parity: the player's playbook loop reaches the same latch the rider's PLAYBOOK_USE reaches, so both engines decide the Signal maps the same way (lane-b, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.
READ FIRST: AGENTS.md; `reviews/e7-playbook-rows.md` finding **F-E7PB-1** (the browser binds no rider verb and carries no playbook latch; the node guard and the e2e pin the gap); `artifacts/e7-playbook-rows/report.md` (the verb, the four secure rules, the sites); `src/sim/HeadlessContractSim.ts` (the E7 composition and `playbookRan`), `src/agent/StandingOrders.ts` (`PLAYBOOK_USE`), `src/systems/{E7SignalSystem,SignalSuppression,BroadcastMirror}.ts`; the browser's player loop for playbooks (record, name, delegate: grep `playbook` under `src/game/Game.ts` and `src/ui/`); `specs/epoch-saga/CAPABILITY-LADDER.md` L7.
Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (F-E7PB-1; owner 2026-09-02: "The laws for human and AI players have to be the same")
The rider's `PLAYBOOK_USE` lights a relay, fields a mirror squad, earns an honest refusal in the dead band and has its program suspended by the front; the player's own record-name-delegate loop reaches none of those latches, so a human and a rider on the same map secure by different rules.

## Scope
1. The browser's player playbook use (delegating a named recording) drives the same `BroadcastMirror.noteUse` / signal-system path and the same latch the headless composition uses, through shared code, not a copy; the four secure rules decide identically in both engines.
2. The node guard and the e2e that pin the gap flip to asserting parity (strengthened, never weakened); a plain-boot player ride on Relay Valley that records a patrol and delegates it lights the relay without `?debug`, desktop + 390px.
3. Human tape: the player's use is a recorded input that replays (prove with one recorded ride assay-replayed).

## Firewall
Touch ONLY: `src/game/Game.ts` (the player use → shared path), the shared latch module (extract from the headless composition if needed; behaviour unchanged for riders: the four node hashes byte-identical), `src/game/RunTape.ts` (input kind, additive), the two specs, BACKLOG row. NO changes to: the rider verb, `Balance.ts`, other epochs, `assets/engine-era.json`.

## Self-check (evidence, not vibes)
tsc clean; build green; `test:node-guards` + `test:stats` green (node 26, counts); the four rider hashes unchanged; the parity e2e green both projects, zero console errors; the replay slip.
End: READY-FOR-GATES + the shared-path diff and the parity evidence.

## No-op / honesty guard
If the player loop already reaches the latch on current main (premise wrong), STOP and cite the line.
