# Review — wire-e2-enemy-walk4

- **Slice:** wire-e2-enemy-walk4 (E2 outlaw roster gets its own walk4 sprite art)
- **Branch/tip:** `lane/e2-arsenal` @ `cda292e8` (`runner(lane-c): wire-e2-enemy-walk4.md`)
- **Merge base:** `d1f6f65c` · merged onto main `ecb06b02` (s444 lock)
- **Verdict:** ✅ MERGE (with one fire-side corrective folded in — see F-1)
- **Drain:** s444 fire, 2026-07-13

## What it does
Wires dedicated **walk4** sprite sheets for the three E2 Steamworks outlaw variants — **Rail Tough**, **Steam Wrecker**, **Coal Thief** — replacing the tinted procedural claim-jumper placeholders they rendered as. Each variant gets its own `char.e2.*` asset slot (`slots.ts`/`generated.ts`), a `characters.v2.json` walk4 contract (4 headings × 4 frames, `mirrors:{}`, `aliases` for the diagonals), and a per-variant `EnemySpritePresentation` (sprites + fades batch + `SpriteAnimator`) in `EnemyPool`. Runtime picks the presentation by `enemy.variantId`; E1 claim jumpers stay on `char.bandit_base` walk8 untouched, and thief/baron paths are excluded from the E2 variant gate. Candidate **A** selected for all three (report: stable identity, cleaner four-phase gait; B rear-profile heavy). `SpriteAnimator` gains an `aliases` field on the contract type.

## Evidence (gated on the merged tree, native macOS)
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 580ms |
| own spec `wire-e2-enemy-walk4.spec.ts` | **2/2** desktop + mobile (E2 roster advances on walk4-a; E1 keeps walk8; zero console/page errors) |
| `_s106-prospector-boot-probe` (plain boot, zero errors) | **2/2** desktop + mobile |
| `vp-02-sprite-animation:382` (renderer-memory/draw-call leak) | **green** isolated ×2 after F-1 fix (was red pre-fix) |
| `e2-enemies:321` (200-stress draw-call envelope) | **green** isolated |
| `m1-01:96` (stress=120 pool/draw-call budget) | **green** isolated |
| adjacent vp-02 residual reds | 350/447/506/541/699 — **pre-existing known-reds**, identical set on clean main (fingerprint-matched with proof), not touched by this slice |

## Merge classification
Merge base `d1f6f65c`; main's only moves since were STATUS.md + logs/dashboard.html bookkeeping (s441 deploy-retry, s442/s443 locks/handoffs, s444 lock) — **no src/assets overlap**. Merged with `-X ours` so the lane's stale STATUS.md hunk is dropped (main's line-1 kept); every src/assets/e2e/artifact path is LANE-TOUCHED-only and lands verbatim. STATUS.md and logs/dashboard.html confirmed **not** in the staged set. Lane branch retires (`main..lane/e2-arsenal` empty after merge).

## Findings
- **F-1 (fixed in-drain, blocking → resolved):** the runner instantiated the 3 E2 `EnemySpritePresentation`s **non-lazily** and called `animator.update` on them **every frame in all contracts**, so a persistent renderer texture uploaded even when no E2 enemy was present — a deterministic **+1 renderer-texture** regression that failed `vp-02:382` (18→19) in isolation. Mirrored the existing **baron lazy-load pattern** (`generated.ts` `lazy: true` + guarded update): the E2 batches are now `lazy: true`, and the per-frame loop skips `ensureLoaded`/`animator.update` until the variant is actually on the field (`if (!animation.active && !presentation.sprites.isLoaded) continue`). Post-fix: `vp-02:382` green in isolation ×2, own spec still 2/2 (E2 enemies render), tsc/build green. ~8 lines in `src/entities/pools.ts`.
- **F-2 (non-blocking, env):** `vp-02:382` still flips run-to-run in the *full* vp-02 file under machine load (passed one full run, failed another) — this is the test's own self-documented texture-count race ("traced baselines of 9 vs 28"), independent of this slice: green deterministically in isolation post-fix. No action; consistent with the known gate-battery-contention flakiness.
- **F-3 (non-blocking, pre-existing):** vp-02 hero-animation tests 350/447/506/541/699 fail on clean main too (verified). Not caused by this slice; tracked separately as the standing vp-02 hero known-reds.

## Player-visible change (GZ-01 filter)
YES — E2 outlaws (Rail Tough / Steam Wrecker / Coal Thief) now walk with distinct illustrated four-phase gaits instead of tinted claim-jumper placeholders. Gazette item appended.
