# Review — E8-01 Orbital-era roster scaffold

- **Slice:** `lane-roster-wiring-e8-01` (FIRE-AUTHORED s766, drained s767)
- **Branch/tip:** `lane/perf` `9ea864c0` (`runner(lane-d)`), base `9c957aae` (E8-01 author commit, on main)
- **Merge commit:** see drain commit (this fire) — `--no-ff` merge of `lane/perf` onto clean main
- **Verdict:** ✅ MERGE — scaffold gates green (tsc/build/e8-roster/e7+e6-regression/draw-call), disjoint clean merge. Ships with **one non-blocking finding (F-1: boss-crew corsair identity collision)** documented below; the collision is NOT reachable in a normal (non-debug) campaign boot yet (E8 routes via explicit contract param / harness, mirroring E7-01's F-2), and its fix is a design fork on the SHIPPED Salvage Claw boss → owner/attended.

## What it does (one paragraph)
Wires the two DATA-SHAPED Orbital-era enemies — `scrap_corsair` (silver-teal `#7fa0a8`, hp 1.1 / speed 1.0 / visual 1.1, non-thief) and `sun_glare_shambler` (warm-amber `#caa25a`, hp 1.3 / speed 0.72 / visual 0.8, non-thief) — as `twist.enemyRoster` rows across the four E8 contracts, mirroring the shipped E7-01 template (`b6b8a4be`) id-for-id: contract rosters (mare-claim=corsair+shambler, far-side=shambler, low-orbit=corsair, eclipse=shambler+corsair) + asset slots + generated placeholder (bandit sheet) + `characters.v2` layer-contract (pins the `char-e8-*-sheet-walk8` filename convention for art batch R-E8) + `pools.ts` `e8EnemySpriteBinding` (lazy active-guard, memory `new-enemy-sprite-batch-needs-lazy-true`) + `Balance.e8Roster.variants` + `WaveSystem` e8- stat-fallback branch + a new `e2e/e8-roster.spec.ts`. Placeholder-first (§8): renders the tinted bandit sheet until Batch R-E8 art lands. The novel `descending repossession` family + `salvage_kings_claw` boss (shipped `77e5a80c`) + `debris_rain` hazard were deliberately DEFERRED and left byte-intact.

## Evidence (real numbers, merged tree)
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | ✅ clean |
| `npm run build` | ✅ 935ms |
| `e2e/e8-roster.spec.ts` (new) | ✅ **6/6** both projects (desktop + 390px), 17.8s |
| `e2e/e7-roster.spec.ts` (regression) | ✅ **6/6** both projects (E7 NOT regressed) |
| `e2e/e6-roster.spec.ts` (regression) | ✅ **6/6** both projects (E6 NOT regressed) |
| Draw-call budget | ✅ lazy active-guard present (`pools.ts` `!animation.active && !presentation.sprites.isLoaded → continue`, asserted spec:108); `renderer.calls <= 200` asserted+green (spec:109) — **no +renderer-texture** |
| Zero console/page errors | ✅ plain-boot test (spec:166 "plain Orbital-era boot stays error-free") green both projects; `errors.console/page = []` asserted spec:110/163/178 |

E7+E6 regression ran single-worker (contention-safe). Config: `playwright.s767-scratch.config.ts` (self-booting dev on :5267, isolated from the orphan stack on :5207/:8788/:8799 + the accounts battery → Mistake #12 safe). Codex's own run also reported E8-arsenal 4/4 (unchanged).

## Merge classification
Base `9c957aae` is an ancestor of main; main's only divergence since base is **STATUS.md** (s766 handoff + s767 lock) — **disjoint** from the lane's file set. Clean `--no-ff` merge (`ort` strategy, zero conflicts).

| File | Class |
|---|---|
| `assets/contracts/epoch-8-orbital/contracts.json` | LANE-TOUCHED (4 twist.enemyRoster additions) |
| `assets/layer-contracts/characters.v2.json` | LANE-TOUCHED (2 layer entries) |
| `src/assets/slots.ts` · `src/assets/generated.ts` | LANE-TOUCHED (2 slots + 2 generated placeholders) |
| `src/entities/pools.ts` | LANE-TOUCHED (e8EnemySpriteBinding + presentation map, lazy guard) |
| `src/game/Balance.ts` | LANE-TOUCHED (additive `e8Roster.variants`) |
| `src/systems/WaveSystem.ts` | LANE-TOUCHED (additive e8- fallback branch) |
| `e2e/e8-roster.spec.ts` | NEW |
| `artifacts/lane-roster-wiring-e8-01/*.png` | NEW (Codex placeholder screenshots) |

Shipped systems confirmed **byte-intact** (not in the diff): `SalvageClawBossSystem.ts`, the `descending repossession` family, `debris_rain` hazard.

## Findings

### F-1 (NON-BLOCKING for this merge; REQUIRED before E8 goes live) — Boss-crew ↔ roster corsair identity collision
The shipped Salvage Claw boss spawns its own rappelling crew as Scrap Corsairs with `variantId='scrap_corsair'`, `variantLabel='Scrap Corsair'` (`SalvageClawBossSystem.ts:10,255`), and at act-reset (`:198`) and fight-finish (`:330 finishFight`) it recycles **all** live corsairs matching that filter (`liveCorsairs()`, `:378-379`). E8-01 now also fields ordinary `scrap_corsair` via the roster, and the WaveSystem spawns them with the **exact same** `variantId`+`variantLabel` (`WaveSystem.ts:668-669`). The boss is `enabled` only in **`e8-mare-claim`** (`Game.ts:830`), and E8-01 adds `scrap_corsair` to `e8-mare-claim`'s roster — so in an actual `e8-mare-claim` wave-play run, defeating the boss (`finishFight`) recycles any ordinary Scrap Corsairs still alive → they vanish. Boss crew corsairs carry **no** owning marker (spawned at `:251-258` without `bossGroupId`/`bossComponentId`), so `liveCorsairs()` genuinely cannot tell crew from roster.

- **Why non-blocking now:** E8 is not reachable in a plain (non-`?debug`) campaign boot yet — the e8-roster spec reaches it only via explicit `?contract=e8-mare-claim` param, exactly the E7-01 F-2 not-yet-live status. The collision fires only in real wave-play of the boss contract, which no plain boot reaches.
- **Fix is a DESIGN FORK (owner/attended — touches the SHIPPED boss):**
  - **(a) Keep spec-faithful roster, tag the boss crew:** mark the boss's crew corsairs with an owning flag (crew spawn `:251` + `spawnComponent` already sets `bossGroupId`) and scope `liveCorsairs()` (and its two recycle sweeps) to boss-owned only, so ordinary roster corsairs are never recycled. Needs its own e2e (spawn boss + roster corsairs, defeat boss, assert roster corsairs survive).
  - **(b) Simpler, data-only:** drop `scrap_corsair` from `e8-mare-claim`'s roster (keep it in low-orbit + eclipse) — mare-claim already fields corsairs via the boss crew, so the roster corsair there is arguably redundant. One contracts.json edit + the e8-roster spec's `e8-mare-claim` expectation (`:53,102-104`).
- **Owner picks (a) or (b) before E8 enters the campaign.** Recorded on the OWNER DESK + roster-wiring ladder (this commit). Codex flagged this correctly in its run report ("would mistake ordinary Scrap Corsairs for boss crew and recycle them") and honestly stayed out of the forbidden shipped-boss file (§5 compliant — reported, did not fix).

### F-2 (info, carried) — Adjacent integration seams Codex reported (correctly deferred, out of firewall)
Codex also named two future-integration seams it refused to touch: `WaveSystem.ts:666` has no orbit→peel controller for the corsair (spec says corsair adds no new controller — expected), and `FreedWalkerVfx.ts:527` defaults Sun-Glare Shamblers to walking home rather than a power-down cure animation. Both are cosmetic/behavioral polish for the E8-integration slice, not scaffold defects. No corrective owed at scaffold stage.
