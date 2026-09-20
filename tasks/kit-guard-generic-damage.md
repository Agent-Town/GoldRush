# Task kit-guard-generic-damage: the kit-vs-boss guard stands on the runtime's real fact — "can hurt" means generic projectile damage reaches the boss class (lane-a, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a.
READ FIRST: AGENTS.md; `tasks/BACKLOG.md` row F-WIN-2 (the fork, ruled below) and `reviews/winnability-receipts.md` (what shipped at 714d68198: the receipts half; the kit-vs-boss guard STOPPED on its own honesty clause because no code fact makes a boss immune to the starting kit); `specs/epoch-saga/e2-railcar-pressure-socket.md` (verified: the railcar takes ordinary projectile damage via `enemy.takeDamage()`, `CombatSystem.ts`; the 2026-08 incident was a LOCKED arsenal, not immunity); `src/game/CombatSystem.ts` (the single damage resolver: which enemy kinds refuse or scale which damage kinds; grep `takeDamage`, `immune`, `resist`, `armor`); `src/agent/StandingOrders.ts` and `src/sim/HeadlessContractSim.ts` (the rider's default kit: `SET_WEAPON rig|blast`, `BLAST_AT`); `assets/contracts/epoch-*/contracts.json` (`twist.enemyRoster`, `twist.baron`, elite kinds).
SEQUENCING LAW: verify `git log --oneline main | grep -q 'winnability-receipts-and-kit-guard'` (the receipts ledger this guard sits beside); if absent, STOP and report.
Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-a status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (F-WIN-2, ruled attended 2026-09-03: option (b), the fire's own recommendation)
The first guard tried to prove "the starting kit can damage every fielded boss" from an arsenal-grant fact the runtime does not have. The honest invariant the runtime DOES have: every boss/elite class fielded by a door contract must accept generic projectile damage from the default kit (spark rig bolts and blast charges), at a non-zero rate, with no immunity flag or resistance that zeroes it. Guard THAT. A standalone pressure-arsenal floor (option (a)) is a later balance statement, not this task.

## Scope
1. **The invariant, from code:** derive, per enemy kind, whether default-kit damage (rig bolt, blast) reaches it: read `CombatSystem.ts`'s damage path and any per-kind immunity/resistance tables; produce a table kind → {bolt: yes/no/scaled, blast: yes/no/scaled} with file:line per entry.
2. **The guard** `scripts/kit-guard.test.mjs` (in `test:node-guards`): for every door contract, every kind in `twist.enemyRoster` + `twist.baron` + elite kinds it fields must have at least one default-kit damage path that is not zero. Red names the contract and the kind.
3. **Mutation proof:** locally mark one fielded kind immune to both bolt and blast (or set its scale to 0) → the guard reds on every contract fielding it; revert. Quote it.
4. **Report the E2 railcar honestly:** it passes because it takes ordinary damage; the 2026-08 incident was the LOCKED arsenal, which this guard does not and cannot measure. Say so in the guard's header comment so nobody re-reads it as an arsenal guard.

## Firewall
Touch ONLY: the new guard, `package.json` (wire), BACKLOG row, `reviews/`-adjacent notes in the guard header. NO changes to: `CombatSystem.ts` or any damage number, contracts, arsenal grants (option (a) is a separate slice), other tasks' fresh work.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` clean; `npm run build` green; `npm run test:node-guards` green including the new guard (count stated); the mutation proof red then green; the kind table quoted.
End: READY-FOR-GATES + the table, the guard verdict on all door contracts.

## No-op / honesty guard
If `CombatSystem.ts` has NO per-kind immunity or scaling at all (every kind takes every default damage), the guard still ships (it protects the future) — say the table is uniform today. If the damage path cannot be traced to a per-kind decision (name where it gets lost), STOP and report.
