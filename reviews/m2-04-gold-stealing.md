# Review — M2-04 gold-stealing (tasks/006, relay lane, gated s23 2026-07-04)

**Verdict: PASS — integrated with one real defect fixed at gate + two harness fixes.**

## Gates (evidence, not vibes)

- tsc `--noEmit` clean; `vite build` clean (424ms). Zero console/page errors across all suites, desktop + 390px.
- New e2e `m2-04-gold-stealing.spec.ts`: **7/7** (steal debit + float + replay; flee-to-own-edge via in-page rAF tracker; killed-carrier drop + reclaim credit; cap-block persistence; wall pathing; no-stockpile neutrality under real waves; re-steal transfer without Economy event).
- Canaries green: m1-01 4/4, m1-03 5/5, m2-01 6/6, m2-02 6/6, m2-03 4/4, vp-02 4/4, m1-02 3/3 UNMODIFIED, feedback-fx 3/3 UNMODIFIED.
- **FULL regression: all 19 spec files green (~94 unique tests), desktop-chrome, serial** — includes the three new chain suites.
- Screenshots (sandbox-rendered): `reviews/shots-m2-04/` — steal float `-10` with HUD showing conservation (120−10 = 110/350), carrying thief mid-flee (sack + poncho tint tell), ground pickup after carrier kill, 390px frame.
- Economy conservation: log replay == HUD balance verified in-suite and visible in the float shot. Enemy never writes gold — thief grabs route through `claimGold` callback into Game → Economy events (`gold_stolen`/`gold_reclaimed`); `gold_reclaimed` correctly classed as banked income (bankCap BLOCK-never-destroy honored — cap-block e2e (d) green).
- Perf: m2-01 stress suite green (draw calls ≤ 200 budget); no per-frame allocations spotted in thief/pickup update paths (scratch reuse in diff review).

## Findings

1. **REAL (fixed at gate, supervisor <20-line lane): shared-slot sprite counter zeroed by dual batches.** 006 split jumper rendering into normal + thief `GeneratedSpriteBatch` instances on ONE slot id; `updateRenderedCount()` overwrote the shared `renderedSprites` entry last-writer-wins, so the (usually empty) thief batch zeroed `assetSprites['char.claim_jumper']` every frame. Caught by the visual-polish-assets canary; confirmed by live probe (enemy alive, asset loaded, counter 0). Rendering itself was unaffected — observability only. Fixed in `src/assets/generated.ts` with per-batch contribution tracking (adjust-by-delta instead of overwrite; dispose subtracts its contribution). Pattern note for future tasks: **diagnostics singletons need additive contracts when a slot gains multiple writers.**
2. **Harness: wall-pathing assert measured absolute `timeAlive`** — at timescale=10 the setup evaluates burn tens of sim-seconds on slow VMs before the thief exists; feature was green (steal completed via wall route). Fixed to delta-from-spawn (the standing "never compare against a pre-event sample" lesson).
3. **Carried minor: spawnPack rider kept the magic mapping.** `spawnPack(5,3)` still implies `{speedScale: 0}` via a legacy shim in Game.ts instead of the call sites passing the option. Behavior identical (m1-02 + feedback-fx green UNMODIFIED, as mandated); retire the shim when those suites' scope next opens.
4. **m2-02 HUD-string race exposed by chain overhead** (not a semantics regression: all cap-math asserts green). Sample-then-assert read gold, then sluice banked another cycle before the DOM check. Fixed: atomic in-page evaluate comparing HUD text to `economy.banked` under `expect.poll`.

## Scope

Clean per tasks/006. Collateral judged in-intent: `pools.ts` (thief batch/sack mesh/tint — the pool IS the jumper renderer), `DebugParams.ts` (`?nosteal`), `vite-env.d.ts` (test-surface types). Do-not-touch list respected (CombatSystem untouched by this lane; existing e2e untouched by Codex — supervisor gate fixes are documented here and in the file comments).
