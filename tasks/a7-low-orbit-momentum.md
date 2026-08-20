> ⛔ SHIPPED — DO NOT QUEUE (attended-agent build record; merged in the 2026-08-20 attended drain window — proof: goal leaf `a7-low-orbit-momentum` + the drain commit on main)

# Task a7-low-orbit-momentum: momentum is commitment — e8-low-orbit door-ready (door-completion sheet item A7)

Executed 2026-08-20 by an attended-dispatched Opus agent (branch `worktree-agent-a7-low-orbit` @ `287347b95`), authorized by `specs/agent-play/door-completion-sheet.md` (RATIFIED — A7) — drained to main by the attended session.

## What shipped
- **Orbital return** on the path both engines share (`CombatSystem` + `BlastChargePool`): a missed lob re-enters after 12 s on its original vector's continuation — one return, then gone; can hit enemies OR your own works (the ratified friendly fire, earned via `orbitReturnsLeft` 1→0). Fully low-orbit-gated: `CombatSystem.orbitalReturn` null unless the contract declares `orbital-return`; every new field spread-if-declared so no other contract's hash gains a byte (proven byte-unmoved bystanders). Closed the dead `E8PhysicsSystem:133` computed flag nothing read.
- **Soft handholds**: on-spine (5 points, 4wu authored half-width — flagged authored) or scaffold decks = full thrust; off = ×0.5 response, momentum carries, never a wall. Via the existing `filterMovement` seam.
- **Debris bands**: ×0.8 speed (scratch vector, never stored momentum) + 1 hp/s hero-only chip, positional in BOTH engines (headless honesty: drift half inert-by-construction under IDLE_INTENTS, stated in code + pinned by the momentum spec).
- 4 anchors (west/east decks + carcass yard pair); seeds e8-low-orbit-01/-02; secures ×2 w20 `fnv1a32:d065c098`/`126ec455` (43 returns scheduled, 43 detonated in the winning run); idle w2 `d7423597`/`006e19c8`.
- node-guards SOLO on a verified-quiet board 467/0/2 (killed its own stalled contended battery first, reported nothing from the contended transcript).

## Findings carried
**F-E8LO-3 (owner/attended fork):** `worldDispatches.ts:56` registers `'M8-5': {kind:'boss', id:'e8-low-orbit'}` but the contract declares NO boss — M8-5 can never fire from a low-orbit boss defeat; the lore beat reads like it wants a `contract`/`story` trigger. · **F-E8LO-1:** contract description/engineDependencies prose now false ("not yet implemented") — truth-pass debt, third instance (A4 dead-band, A6/F-E8FS-1). · **F-E8LO-2:** self-cleared by A6's merge (far-side admission opens the board chain; low-orbit's admission unlocks e8-eclipse's link). · **F-E8LO-4:** F-1642-1's outside-the-universe list stale re low-orbit (dated snapshot, unedited).
