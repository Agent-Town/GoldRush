# Task run-suspend: save the run for real — Continue stops being a facade (LANE-A, branch lane/m3, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a. READ FIRST: AGENTS.md; src/ui/menu/StartMenu.ts:215 (Continue reads RUN_SUSPEND_KEY — which NOTHING writes; this task makes it true); the deterministic sim architecture (fixed timestep, seeded runs — the state that must serialize); RunManager (run lifecycle, wave boundaries); ProfileStorage (RUN_SUSPEND_KEY already per-profile-scoped). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/m3 main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green.

## Owner ask (2026-07-07 ~21:05): "the save and load of games — did this fall under the bus?"
VERIFIED: it never existed. The Continue button is a reader with no writer (the agent-repair lesson, persistence edition). Meta persists; the RUN does not — a closed tab at wave 30 loses everything since run start.

## Scope
1. **Suspend snapshot at WAVE BOUNDARIES** (clean serialization points — mid-wave suspend is explicitly OUT of v1): at each wave-complete, serialize run state to RUN_SUSPEND_KEY (per-profile, already scoped): wave number, gold, hero (level/xp/upgrades taken/hp/position), buildings (type/tier/hp/positions), meta-run counters (the ledger stats), science-run progress, contract id, seed + RNG stream state. Versioned envelope (`v:1`) — unknown versions discarded gracefully.
2. **Auto-suspend triggers**: wave-complete (rolling snapshot, cheap — measure and state the ms cost) + `visibilitychange`/`pagehide` best-effort (still wave-boundary data: the LAST completed wave's snapshot; mid-wave progress since it is accepted-lost and SAID so in the restore copy).
3. **Restore**: menu Continue (already gated on the key existing) → rebuilds the run at the snapshot's wave boundary — "The claim resumes at wave 12. The ledger kept your place." Buildings/hero/economy restored exactly; next wave starts on the normal schedule.
4. **Lifecycle**: victory/overrun CLEARS the suspend (the run ended; the ledger recorded it); starting a new run overwrites after a confirm if a suspend exists ("Abandon the saved claim at wave 12?").
5. **Determinism-verified restore**: e2e proves a suspend→restore→play-2-waves run produces identical state to an uninterrupted run at the same seed (the architecture's whole promise, now user-facing).
6. Diagnostics: suspend size + last-write exposed.

## Firewall
Touch ONLY: run serialization module (new src/game/RunSuspend.ts), RunManager lifecycle hooks (additive), StartMenu restore path, the confirm prompt, e2e. NO changes to: sim logic/timestep, Economy writer, meta persistence, contract configs, scoreboard.

## Self-check
tsc/build; new `e2e/run-suspend.spec.ts`: wave-3 suspend → reload → Continue → state matches (gold/buildings/hero asserted) → determinism twin-run comparison → victory clears the key → new-run confirm path; m3-01 + m1-01 + m2-01 + task-027 unmodified green both projects; zero console errors; screenshots (Continue with saved-claim line, restore moment) into artifacts/run-suspend/. Commit on lane/m3. End: READY-FOR-GATES + snapshot size/cost measured + results.
