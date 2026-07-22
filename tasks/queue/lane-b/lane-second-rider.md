# Task lane-second-rider: THE SECOND RIDER — an AI companion joins the owner's ride (LANE-B, commit prefix "feat:")

You are Codex, implementer for Gold Rush (worktrees/lane-b).
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: e2e/mp-02-lockstep.spec.ts (THE JOIN GRAMMAR — seedProfile, openTownBoard, ensureRideOpen, ride-join-input + submit, waitRoster; two driven pages already ride together in tests) · src/mp/ (lockstep client, RideTogether, reconnect — MP-R2 shipped: disconnects rejoin at exact tick) · the rehearsal driving grammar (branch rehearsal/saga-e1-e10, rehearsal/lib.mjs via `git show` — hold(), movement loops, upgradeOpen → Digit picks; READ-ONLY reference) · the mp diagnostics seams (__GR_MP__, actor positions).

Pre-flight (LANE-SAFETY): standard safe-dupe; npm i; tsc+build green.

## Why (OWNER 2026-07-22, verbatim: "Could I then play multiplayer with it as well to test that?" — the first human+AI ride: live co-op testing MP-03 actors, per-rider arsenals, reconnect, party-of-4 under real human latency)
## Scope
1. `scripts/second-rider.mjs` — CLI: `node scripts/second-rider.mjs <CLAIM-WORD> [--url https://gold-rush-3in.pages.dev] [--name "The Second Rider"] [--record]`. Boots headless chromium, seeds a throwaway profile with the given name, joins the claim word via the REAL town UI path (the mp-02 grammar), and plays.
2. THE COMPANION LOOP (competence over brilliance): follow the host hero at convoy spacing (read the remote-actor position via the mp diagnostics seam) · fight what comes near (the rig auto-fires; use blast on packs) · take upgrades when offered · pan/idle productively when calm · NEVER idle-die (the leg-1 shame is the anti-pattern; cite it). Reconnect on drop (MP-R2's law — rejoin same word, same slot).
3. `--record` writes video locally (rider-video/, gitignored — same law as the rehearsal footage).
4. Multi-rider: the script must be launchable 2-3× with different names (the party-of-4 gate shipped — the owner + three of these = the full table).
5. OWNER DOC: a five-line "Summon the Second Rider" section in docs/OWNER-TEST-PLAN.md (open Ride Together → copy claim word → one command → they arrive in your town roster).
6. Spec e2e/second-rider.spec.ts (both projects): the script (imported as a module, pointed at the local relay rig like mp-02) joins a hosted room, appears in the roster, moves within N ticks (position hash changes — the not-idle assertion), survives a host-visible wave; zero console.
## Firewall: the script + doc + spec. NO src/mp changes, NO relay changes, NO Balance.
END: READY-FOR-GATES + the summon command as shipped + roster screenshot with both riders.
