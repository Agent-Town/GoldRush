# m1/01-claim-jumpers-death

**Contract:** threat exists; dying and restarting works forever after. Restart correctness lands here, early, because every later slice inherits it.

**Seam:** `src/entities/Enemy.ts` + `entities/pools.ts` (pool 96, shared geometry/material) — **Claim Jumper**: rust poncho-cone + hat, slot `char.claim_jumper` (§9.3-safe human rustler; illustrated, dust-puff death, no gore). Seek-hero steering + separation-lite (spatial hash, cell 2 m, push radius 0.9). Contact attack: 8 dmg, per-enemy cd 0.8 s, hero iframes 0.5 s + red vignette flash. `src/core/EventBus.ts` (typed `GameEvent` union, ~40 lines) lands here; first events `hero_damaged`, `hero_died`, `enemy_killed`. `src/ui/DeathOverlay.ts` — run ledger (time held, kills, gold panned) + CTA **"Stake Again"** (click or `R`) → `Game.resetRun()`: pools recycled, timers cleared, listeners intact, no page reload. Debug key `T` spawns a pack of 5 (routes through the future WaveSystem's spawn fn; `?nospawn` respected).

**Playable checkpoint:** spawn packs, get chased and chewed down, kite or die, read the ledger, stake again, die again.

**Verification:** GATE-STD; e2e: `T` → `enemiesAlive === 5`; stand still → hp drops → `state === 'dead'` → `R` → `state === 'playing' && enemiesAlive === 0 && hp === maxHp`; **double-restart probe** + `renderer.info.memory.geometries` stable over 3 restarts (leak gate); `?stress=120` → 60 fps, draw calls ≤ 200; screenshot-critique on enemy look (illustrated, charming-menacing, not gory).

**Deps:** M0 complete. Lane A start; ∥ with 04.

**Firewalls:** no shooting (02), no waves schedule (03), no gold (kills never grant gold), no XP consumption. Enemies know only the hero's position.
