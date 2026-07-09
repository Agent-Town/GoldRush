# Task 067-mp-resync-two-actors: desync recovery works in the two-hero world (lane-d; commit prefix "fix:")
**REGRESSION, retro-gate caught 2026-07-10 (attended):** `e2e/mp-02-lockstep.spec.ts:67` "hash mismatch pauses, shows the wire card, and restores from relay snapshot" FAILS on main (isolated-rerun-confirmed, NOT load flake): after the injected desync, `paused` stays `true` — the game shows the wire card forever and never resumes. It passed before the mp-03 re-land content landed (which arrived UNGATED via the art runner's broad-add sweep `ff46a53` — the s282 drain fire died mid-gate; see `reviews/night-drain-2026-07-10.md` lineage).
**ROOT CAUSE POINTER (verified):** `src/mp/LockstepClient.ts:227-230` — unpause happens ONLY when `this.options.onSnapshot?.(message.snapshot)` returns `true`. Game's snapshot-apply handler (the mp-03 seam in `src/game/Game.ts`) evidently returns false/throws when restoring the NEW per-player hero-actor state. Fix the handler, not the client.

You are Codex in worktrees/lane-d. Pre-flight per LANE-SAFETY (lane/perf was reset to main 2026-07-10 morning — clean start).

## Scope
1. Make Game's `onSnapshot` restore succeed with 2+ hero actors: rebuild EVERY roster slot's hero from the snapshot (positions, HP, state), not just slot 0; if the snapshot predates the multi-actor schema, restore what exists and re-derive the rest deterministically (spawn-offset ring). Return `true` on success; on genuine failure, log the reason to the diagnostics channel (silent-stay-paused is the bug we are fixing — if it must stay paused, the wire card must SAY restore failed).
2. Ensure the snapshot PUSH side (wave-boundary snapshots feeding the relay) includes whatever the restore now needs for all actors — additive schema only.
3. Determinism after restore: both clients hash-identical within 30 ticks of resume (the existing spec asserts resyncs ≥1 and paused=false — keep it honest, don't weaken the test).

## Gates (the definition of done)
`e2e/mp-02-lockstep.spec.ts` ALL THREE tests green desktop, single run AND `--grep "hash mismatch"` isolated ×2 consecutive · 500-tick identity regression still green · flag-off boot untouched (m1-01 green) · tsc/build · zero console.

## Firewall
Touch ONLY: the Game snapshot-apply/push seam + (only if unavoidable) `src/mp/LockstepClient.ts` restore plumbing + the spec's report shape if it needs richer failure info. **NO relay/protocol changes, NO Balance, NO actor-spawn redesign, NO test weakening.**
End: **READY-FOR-GATES** + the three-test output + what the restore was failing on.
