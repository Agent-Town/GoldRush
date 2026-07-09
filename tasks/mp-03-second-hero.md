# Task mp-03-second-hero: every rider is a REAL hero — own unit, own spawn, name chip, shared credit (lane-d; commit prefix "feat:")
**OWNER RULINGS (both verbatim): 2026-07-09 "both get credited. shared achievements are still achievements." + 2026-07-10 ~00:13 "the other player should not spawn at the same position as the other player but be its own unit. The movements of this unit are then sent from one player to the server and from there to the other player."** (That IS the shipped MP-02 architecture — inputs relay through the room and every client simulates the identical world; this task promotes the relayed inputs into real per-player units.)
You are Codex in worktrees/lane-d. Pre-flight per LANE-SAFETY. READ FIRST: `specs/multiplayer/README.md:21` (remote players as full actors) · `src/mp/LockstepClient.ts` + the MP-02 tick seam in `src/game/Game.ts` (the ponytail comment: "promote inputs to real actor ownership in the MP-03/M6 slice" — today only `bundle.inputs[0]` drives the single hero) · `reviews/mp-02-lockstep.md` · the M6 actors-foundation seam · CombatSystem attribution points · `e2e/mp-02-lockstep.spec.ts` (extend, don't fork, its relay env).

## Scope — DETERMINISM IS THE LAW (all clients derive identical state from the same input bundles)
1. **Per-player hero actors:** each roster slot i gets its own hero unit driven by `bundle.inputs[i]` inside the fixed tick — identical on every client. **Spawn positions OFFSET** (owner's rule): ring the claim stake, ~2 tiles apart, slot-indexed (deterministic).
2. **Identity render:** remote heroes = the hero sprite set with a deterministic per-slot tint + a name chip above (mpName + town, the town-t5 chip pattern); LOCAL player's hero untinted. (Their Prospectors: ONE agent per player hovering near its owner, scene-render only, zero sim — skip if it bloats the slice; note the cut.)
3. **Per-player camera:** each client's camera follows ITS OWN hero (local slot), never the remote.
4. **Shared credit (the ruling):** run results, medals, ledger discoveries, and end-screen stats record identically for EVERY rider — no split kill-accounting, no per-player attribution anywhere. The end screen shows one shared result with all rider names on it.
5. **Interactions v1:** all riders can move/build/fight per the existing input vocabulary; economy stays ONE shared pool (the sim already has one Economy — unchanged).
6. **e2e:** extend the mp-02 spec env — two clients: assert BOTH heroes exist at DIFFERENT spawn positions in BOTH windows, each client's camera centers its own hero, A's movement moves the same unit in both windows, 200+ ticks hash-identical, and the ending records the run for both profiles.

## Firewall
Touch ONLY: `src/mp/`, the Game tick/actor seam, hero spawn/render/camera code paths, name-chip UI, its e2e. **NO relay/protocol changes (MP-01 frozen), NO Balance, NO economy changes, NO save-schema changes beyond what run-recording already writes.**

## Self-check
tsc/build · mp-02 spec still green (regression) · new mp-03 spec green desktop · flag-off (`?mp` absent) = byte-identical single-player behavior (assert: determinism hash unchanged vs main) · zero console · screenshots of both windows showing two named heroes → `artifacts/mp-03/`.
End: **READY-FOR-GATES** + the two-window screenshots + hash evidence.
