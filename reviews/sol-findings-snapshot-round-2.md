# Snapshot gate round 2 — observation race diagnosis

Branch: `sol/mp-snapshot-completeness`

Gate input: `origin/main:reviews/sol-snapshot-gate-park.md`, round 2

Verdict: **F-SOL-SNAP-R2-001 confirmed and repaired test-side; engine hypothesis rejected.**

## F-SOL-SNAP-R2-001 — live cross-tab diagnostics were not an atomic same-tick observation

- **Failure fingerprint:** the preserved round-2 trace ended with Alice/Bob at live ticks `543/542` after the exact-tick poll had run for ten seconds.
- **Engine state:** both peers were connected and running with `paused=false`, `desyncs=0`, `resyncs=0`, `lastResyncTick=null`, and `error=null`. Their hash histories were byte-equal at every checkpoint from tick 30 through tick 540; tick 540 was `fnv1a32:058bed7b` on both.
- **Why this rejects the off-by-one hypothesis:** this test never entered the snapshot restore path. The restore owner resumes from `T + 1` because the snapshot is captured after simulating tick `T` (`src/game/Game.ts:1616-1620`; `src/mp/LockstepClient.ts:324-375`). Replaying `T` would double-apply it and starting at `T + 2` would skip an input.
- **Root cause:** `LockstepClient.state().tick` is each tab's local `nextSimTick` (`src/mp/LockstepClient.ts:152-176,215-225`). The old helper issued two `page.evaluate()` calls together, but each browser page consumes bundles and publishes diagnostics on its own render schedule. `Promise.all` does not make those two independent page reads a cross-tab transaction.

## Repair

The two-hero movement checkpoints now use `syncedHashedActorDiagnostics()` (`e2e/mp-02-lockstep.spec.ts:248-281,589-643`). It reads the actor snapshots already captured atomically with the multiplayer hash (`src/game/Game.ts:1689-1698`) and returns only when both peers have:

1. the same exact hash tick at or beyond the requested checkpoint;
2. the same non-null published hash for that tick; and
3. complete actor arrays of equal length.

Actor position, HP, speed, and visibility come from that immutable same-tick snapshot. Only stable roster metadata (`slot`, player identity, town, and local-owner flag) comes from live diagnostics. The position tolerance and final full hash-history equality assertions are unchanged. No adjacent-tick allowance, timeout inflation, engine timing change, or relay change was made.

## Gate evidence

- `npm exec -- tsc --noEmit` — **PASS**.
- `npm run build` — **PASS** (`tsc` + Vite production build, 561 modules transformed).
- `git diff --check` — **PASS**; the exact isolated command with `--list` discovers **5 tests in 1 file**.
- Three independent read-only reviews (sampler, engine tick semantics, and preserved-trace forensics) — **PASS**, no engine edit recommended. The separate local `codex review --uncommitted` process was attempted but could not initialize because `/Users/robin/.codex/state_5.sqlite` is read-only in this sandbox.
- The isolated gate was attempted on unreserved port `5237`, but this managed sandbox rejected the Vite listener before the test body with `listen EPERM: operation not permitted 127.0.0.1:5237`. This is environment evidence, not a green test claim.
- Required orchestrator rerun:

  ```text
  npm exec -- playwright test e2e/mp-02-lockstep.spec.ts \
    --project=desktop-chrome --workers=1 --reporter=line --repeat-each=5 --retries=0 \
    -g "two clients promote both roster slots to real local-camera heroes and shared run credit"
  ```

- Merge bar remains the ruling's **5/5 isolated**, followed by the already-green 27-test core battery.
