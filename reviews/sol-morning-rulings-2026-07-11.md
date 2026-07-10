# Morning rulings — Sol's four parked branches (2026-07-11, orchestrator; owner-veto lines marked)
VERIFY-DON'T-INHERIT note first: **current main (200275b) is tsc-GREEN** — the beats.ts:26 red was a stale-tip read (the fires drained 078 overnight; the shim is on main). Re-cut anything blocked on "fresh main fails TypeScript."

## PROTOCOL AMENDMENT (permanent): listener-backed gates are ORCHESTRATOR-side
Sol's sandbox cannot open sockets (listen EPERM) — so mp/preview/wrangler gates on sol/* branches are RUN BY THE ORCHESTRATOR at drain time, exactly like the fixed-step drain. Sol runs static gates (tsc/build/diff/discovery) + writes the exact commands it COULD not run in the evidence tail. No more parking solely on EPERM.

## Branch rulings
1. **sol/perf-chunk-atlas** — UNBLOCKED: re-cut from green main (200275b+), proceed per the queue brief. (Nothing else was wrong.)
2. **sol/release-gate** — orchestrator will run the preview battery side; Sol: finish everything static (the gate script, the workflow yml, the quarantine findings), tail READY with the static evidence + the listener-gate command list.
3. **sol/mp-snapshot-completeness @4ef6bea** — the action-loss race finding stands as work; the isolated 5/5 gate moves orchestrator-side per the amendment. Push the race fix; I gate.
4. **sol/lockstep-actions @b351fd4** — the three rulings:
   - **F-SOL-ACTION-001 (reconnect): DEFER, honestly.** v2 ships sealed-after-start with the clean `ride_started` rejection. The ratified 60s grace is NOT deleted — it moves to a named follow-up slice (**MP-RECONNECT: reconnect token + held slot + authority-snapshot replay**) which is now feasible BECAUSE snapshot v2 exists. Spec gets the deferral note, supersede-style. Family v1 reality: same couch, short runs; a dropped rider restarts. [OWNER-VETO: one word restores reconnect-now priority]
   - **F-SOL-ACTION-002 (setup ownership): B — host-owned ephemeral setup.** The guest rides the HOST's world (seed/research/defenses/balance applied ephemerally at run construction, never written to guest storage). Fix the `Game.ts:1866` local-setup override — the staged host setup MUST reach construction. Payout: per the shared-credit ruling, the run's RESULTS record for every rider into their OWN profile (each profile's meta accrues by its own track rules; nothing overwritten, nothing discarded — state the rule in docs/api-multiplayer v2). Same-progression byte-compare dies. [OWNER-VETO line open]
   - **F-SOL-ACTION-003 (per-rider weapons): AGREED — separate slice.** Shared arsenal is a DOCUMENTED v2 limitation (one line in the Ride Together card copy: "the camp shares one arsenal for now"). **MP-ARSENAL** (per-actor weapon state + suspend/hash schema) queues after snapshot v2 + this slice merge.
   - docs/api-multiplayer.md v2 update now unblocked by these rulings — include it in this branch before READY.

## Sequencing for today
Snapshot race-fix → orchestrator gates snapshot → merge → lockstep-actions rebased/finished under the rulings → orchestrator gates (two-client 300-tick battery MY side) → merge → perf → release-gate. MP-RECONNECT + MP-ARSENAL banked to the BACKLOG ladder.
