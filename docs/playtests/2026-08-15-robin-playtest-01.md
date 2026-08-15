# Playtest — 2026-08-15, Robin · THE FIRST MIXED HUMAN+AI RIDE
Context: live Ride Together on production (`gold-rush-3in.pages.dev`, mp-room worker redeployed this morning — version `9a741cbf`, the July-9 stale-worker bug fixed). Room `28D9B45F03644C2D810FAA24`, claim word PRAIRIE-CART-…, contract `the-claim` / `trail` / seed `gold-rush`. Roster at start: **p1 Claude (Calculating House, headless) · p2 Robin (Agent Town, browser)** — the first human+AI ride in Gold Rush history, and the first joined room on production ever (every prior room was unjoinable — see the relay post-mortem in HANDOVER-2026-08-15).

## Confirmations BANKED
- ✅ **The relay fix works end-to-end in production**: create → inspect → agent seat joins → host starts → `started:true, players:2`. The 2026-07-09→08-15 "rooms nobody can join" era is closed. (Deploy: `wrangler.mp-room.toml`, token perms widened by owner; verify probe: create→inspect round-trip, `v:3`.)
- ✅ **MP-07c agent-seat path proven LIVE** (not just in tests): a headless agent seat (gr-sim `--room`) connected to a browser host's room and appeared on the server roster.

## Findings (owner words verbatim)
- **F-RIDE-1 — BUG/GAP: *"but there is no lobby"*** (and earlier same morning: *"It would be good to have something like a lobby, where it is possible to see who joined the game?"*). The ride card renders NO roster (grep 0 in TownScene.ts) and the client never calls `/api/multiplayer/inspect` (grep 0 in src/) — while the server already serves `{players, roster[], started, setup}` (verified live, `_multiplayer.ts:261-273`). The connected agent was invisible to its host. → task `tasks/mp-ride-lobby.md` scope 1.
- **F-RIDE-2 — BUG/GAP: *"I am also not sure which contract has been selected"***. The room captures the host's current selection silently (`the-claim`/`trail` this ride); the panel displays none of it. Data is already client-side in `RideTogetherConfig.setup`. → task `mp-ride-lobby.md` scope 2.
- **F-RIDE-3 — BUG (carried from 2026-08-14 screenshot): the *"Riding solo — That claim's gone quiet."* card never dismisses**, center-screen over live play. `Game.ts:1050-1054`, no auto-dismiss on this path. → task `mp-ride-lobby.md` scope 3.

All three land in ONE lane-c master (`tasks/mp-ride-lobby.md`) — same surface (the Ride Together UX), three testable scopes, the owner's exact scenarios as e2e assertions (`e2e/mp-ride-lobby.spec.ts`).

## THE WIN — banked
Owner, verbatim: *"ok, the level is won - we won our first contract together!"* — **the first mixed human+AI contract SECURE in Gold Rush history.** The Claim, trail, seed `gold-rush`; roster Claude of Calculating House + Robin of Agent Town; the seat rode **10,803 shared lockstep ticks (~7.3 min at 24.5 ticks/s)** as a thin seat while the host's browser served the world. (Claude's seat was `--policy=idle` — a watcher this first ride, by design.)

## Later-wave findings (same session)
- **F-RIDE-4 — INVESTIGATE: *"collecting seams has lost its animation somehow"*** (owner, mid-MP-ride). No obvious `multiplayerActive()` gate on harvest/animation (checked `Game.ts:1349-1450` — those gate epoch arsenals + blast aim). Mechanism unknown; solo-vs-MP split unmeasured → INVESTIGATE-then-fix master `tasks/investigate-seam-anim-mp.md` (lane-c, measurement matrix first, no blind fix).
- **F-RIDE-5 — polish note (no master yet): the seat has no clean end-of-ride.** When the host's win stopped the tick stream, the agent seat sat 30s then exited `peer_stalled` with `outcome:null` instead of receiving a terminal ("ride won") message. Cosmetic for advisory seats, but a seat should learn the outcome it just co-earned. Candidate home: the room DO broadcasting a terminal on ride end — small protocol nicety, records here until someone picks it up.
- Also answered live: *"You are not moving much? Is that normal?"* — YES: the seat ran `--policy=idle` (watch mode) this first ride, deliberately; an active playing seat is the next ride's plan.

## Post-win wave (screenshots preserved in-repo: `docs/playtests/shots-2026-08-15/`)
- 🖼️ **"for the ages - first game together"** — the owner's screenshot of the heroine + the Prospector + Claude's rider on the secured claim, kept forever at `shots-2026-08-15/first-ride-together-claude-robin.png` (RETENTION LAW: our history is our strength).
- **F-RIDE-6 — BUG (verified): *"the shared gold kind of hangs in the air"***. The `SHARED POT 75G` text is the party HUD header's right half (`PartyOverview.ts:35`) flung to the far edge of an invisible 560px `space-between` row with no backdrop (`PartyOverview.css`) — visually severed from its "RIDERS" panel, reads as a world-floating label. Billboard-Mistake class (things must read anchored). → task `tasks/fix-party-pot-orphan.md` (lane-c ladder, after `mp-ride-lobby` + `investigate-seam-anim-mp`; screenshot in-repo).
- **OBSERVED, question OPEN with the owner (no F-ID until he rules):** in the first-ride screenshot, Claude's rider body renders as a DARK-GREEN-tinted copy of the hero sprite next to the warm-sepia heroine. No tint/material code exists in `AgentRiderBody.ts` or the rider path (grep 0) — so it is either an unstyled-material artifact (bug) or an unrecorded intentional look. ASKED: "is the remote rider's dark tint intended?" His answer decides whether this becomes a finding.

## Still open with the owner
- The rider-tint question above.
- If the owner wants Start Ride gated on party size in the lobby, that's a one-line follow-up ruling.
- Findings filed: F-RIDE-1/2/3 → `mp-ride-lobby` · F-RIDE-4 → `investigate-seam-anim-mp` · F-RIDE-5 recorded · F-RIDE-6 → `fix-party-pot-orphan`. Lane-c ladder order: lobby → seam-anim → pot (deep-queue law: one queued at a time, refill on merge).
