# Task agent-rung-clarity: the permission ladder must be VISIBLE and its progress readable (LANE-B, branch lane/m4, commit prefix "m4:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b. READ FIRST: AGENTS.md; src/agent/PermissionLadder.ts (rungs 0–3, side-effects denied at 0) + src/game/MetaProgress.ts:74 (`agentAutonomyLevel = floor(tracks.agent)` — victory payouts advance it fractionally) + the Prospector Panel (G) + Game.ts:631 (level read + policy slot bonus). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/m4 main && git clean -fd`, proceed; STOP only on unmerged content/foreign edits); npm install; build green. SEQUENCING: after town-T1 in this lane's queue.

## Owner finding (2026-07-07 ~13:43, wave-35 run)
"Agent was collecting XP already but not repairing." VERIFIED: repairs = side-effect = denied at rung 0; his agent is rung 0 because the agent meta track (<1.0) only advances on victory payouts — and NOTHING tells the player any of this. He manually repaired 38 times while owning an agent designed to do it. The invisible-meta law (F-0707-14) applies to the agent hardest of all.

## Scope
1. **The ladder, in the panel**: the Prospector Panel gains a compact ladder section — all four rungs by name (suggest-only / approval-required / trusted-routine / autonomous-within-budget), current rung highlighted, and per-rung one-liners of what unlocks (rung 1: "acts with your approval — repairs, pickups"; rung 2: "routine work unattended"; rung 3: "spends within a budget").
2. **Progress line**: "Autonomy: 0.6 / 1.0 — secured claims advance the Prospector" (read `tracks.agent`; ledger voice; exact numbers per the legibility guard).
3. **Denied-action feedback**: when a toggled-on function is rung-blocked (e.g. repair at rung 0), the panel row shows a small lock + "needs approval-required (rung 1)" instead of silently doing nothing. The consent grammar (chirp-refuse once audio lands) stays.
4. **Run-ledger line**: if the agent track advanced this run, the ledger says so ("The Prospector grew: autonomy 0.4 → 0.6").
5. NO advancement-pace changes (owner question pending on XP-trickle — Balance untouched).

## Firewall
Touch ONLY: Prospector Panel UI, run-ledger line, e2e. NO changes to: PermissionLadder logic, MetaProgress math, payout values, ToolSurface, sim.

## Self-check
tsc/build; e2e: seeded meta at rungs 0 and 1 → ladder renders correct highlight + unlock lines; rung-blocked toggle shows the lock line; ledger advance line appears only when the track moved; m4-05/06/07/08 + m1-01 + m2-01 unmodified green both projects; zero console errors; screenshots (panel ladder rung 0, lock line, 390px) into artifacts/agent-rung-clarity/. Commit on lane/m4. End: READY-FOR-GATES + results.
