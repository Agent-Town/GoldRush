# Spec: M1 Core Loop

**The game is fun here or nowhere.** Loop sentence: *Move (WASD) to pan gold and kite Claim Jumpers; your Spark Rig auto-fires at the nearest threat; spend gold on Sentry Beacons; level up and pick 1 of 3 upgrades; survive escalating waves or the claim is overrun — restart instantly.*

Design bet baked into the economy: **gold comes only from panning (stand still, exposed); XP comes only from kills (move, fight).** Mining = economy, combat = progression. Panning-under-pressure is the core tension and the prosperity framing (brief §9.2) in mechanical form.

Synthesized 2026-07-03 from three independent drafts.

## Next Agent Prompt

_Last updated: 2026-07-03. Update this section before ending your pass._

Status: **01 + 02 + 03 + 04 DONE 2026-07-03** (03: `reviews/m1-03-wave-pressure.md`, fun verdict recorded in `slices/03-wave-pressure.md` — **NOT FLAT, no reslice**; WaveSystem owns ALL spawning incl. debug/stress; `?nowaves`/`?nokill` test flags; announcement slot now evented via `UiBridge.announce`). Pickup point: `slices/05-sentry-beacon-build.md` and/or `slices/06-level-up-choices.md` — both unblocked, parallelizable (05 touches Economy/build; 06 touches Progression/UI — disjoint except `Game.ts`/`Balance.ts` registration lines). Fold HarvestSystem `reset()` into 05 (carried minor). Read STATUS.md §environment + §lessons first — chunked Codex protocol, `pw.reuse.config.ts` for e2e (port-orphan workaround), harness spawns (`__GR_TEST__.spawnPack`) NOT keyboard in tests, e2e serial never parallel, unified sim clock. Verify per M0 README GATE-STD; keep this prompt current.

TODO:
- [x] 01-claim-jumpers-death (Codex A, PASS; enemies instanced in perf round)
- [x] 02-auto-fire-spark-rig (Codex C, PASS after 1 correction round — 0-dmg slot-order blocker caught by live probe)
- [x] 03-wave-pressure (Codex D `019f2701-f227`, PASS after 1 correction — real alive-cap overshoot found by supervisor probe; verdict: NOT FLAT, tuning concerns → 07)
- [x] 04-gold-panning-economy (Codex B, PASS; seams instanced; teleport harness)
- [ ] 05-sentry-beacon-build (needs 02+04)
- [ ] 06-level-up-choices (needs 02; ∥ 03/05)
- [ ] 07-feel-and-tune-gate → M1 exit: Robin playtest + sign-off

## Slice graph

```
lane A (combat):   01 ── 02 ── 03 ─────────┐
lane B (economy):  04 ───────── 05 ────────┼── 07 (tune gate)
lane C (progress):       02 ── 06 ─────────┘
04 ∥ lane A · 05 needs 02+04 · 06 ∥ 03/05
```

## Ownership invariants (adds to M0's; review rejects violations)

- `game/Economy.ts` is the **only** gold writer: `apply(e: EconomyEvent) → {ok, gold} | {ok:false, reason:'OUT_OF_RESOURCES'}`; events `gold_panned|gold_spent|run_reset` carry `{id (uuid-shaped), at (sim time)}` + append-only ring-buffer log with pure `reduce()` — the M3 server-authority seam, and **nothing more** (any idempotency/network/persistence code in M1 is a review reject).
- `systems/CombatSystem.ts` owns ALL shooting and is the only caller of `takeDamage` (hero rig AND beacons register `ShooterHandle`s; contact damage also resolves here). One targeting impl: `TargetingSystem.findNearest` with target stickiness.
- `game/Progression.ts` is the sole writer of `StatSheet` run-modifiers; upgrades stack additively on `Balance` base values — one stacking rule.
- `game/Balance.ts` owns every number below. lil-gui (`?debug`) binds to it in 07.
- Only `WaveSystem` spawns enemies (debug keys route through it). Pools: enemies 96, projectiles 128, XP motes 64 — zero per-frame allocation in hot paths.
- Restart = `Game.resetRun()` in place: pools recycled, timers cleared, economy `run_reset`, no page reload, `renderer.info.memory` stable across 3 restarts.
- **Standing UX rule (Robin directive 2026-07-03, applies to every current and future collectible/pickup/drop):** world-space floating amount feedback at the pickup point via `Vfx.floatText` — gold `+N` in gold `#c4883a`, XP `+N` in mote teal `#83ded7` (both shipped); every new item/drop slice must wire this and assert it in e2e.

## Balance starting numbers (all in `game/Balance.ts`)

| Domain | Values |
|---|---|
| Hero | HP 100 · 6.0 m/s (river ×0.55, ford ×0.85) · accel 20 · iframes 0.5 s · collider r 0.5 |
| Spark Rig | 2.0 shots/s · dmg 12 · range 10 m · bolt speed 18, r 0.25, life 1.2 s · nearest-enemy, sticky target |
| Claim Jumper | HP 28 · speed 2.7 ±10% · contact 8 dmg / 0.8 s per-enemy cd · touch r 0.6 · separation r 0.9 · XP 3 |
| Waves | grace 5 s · trickle 1 per 2.4 s, ×0.97 per 10 s, floor 0.8 s · wave every 30 s: pulse of 3+3·wave from random edge · HP ×1.12, speed ×1.02 (cap +30%) per wave · alive cap 60 |
| Gold Seam | 6 anchors, 2–3 active · stand ≤1.6 m & slow → channel: 5 gold per 1.5 s tick, 30 gold capacity · progress decays ×2 outside · relocates after depletion, 20 s |
| Sentry Beacon | cost 25 gold ×1.3 per built (25/35/45/60) · dmg 8 · 1.2 shots/s · range 8 · max 6 · indestructible (M2 adds HP) |
| XP | `need(L) = 12 + 8(L−1)` → 12/20/28/36… ≈ one choice per wave · mote magnet 2 m |
| Perf | 60 fps @ 60 enemies + 128 bolts + 6 beacons · draw calls ≤ 150 steady, ≤ 200 at wave-10 stress · fallback ladder: shared material → merged geo → InstancedMesh |

Sanity: base DPS 24 clears wave 1 easily; by wave 6–7 cadence eHP outruns un-upgraded DPS → upgrades + beacons or death. Target: first-timer dies wave 5–8 (≈4–7 min), informed play 8–10 min.

## Upgrade pool (9 defs; offer 3 distinct, weighted, stack-capped; names are the charm)

| id | Name | Effect | Max |
|---|---|---|---|
| double_tap_coil | Double-Tap Coil | +25% fire rate | 3 |
| heavy_spark | Heavy Spark Charge | +30% bolt damage | 3 |
| long_resonator | Long-Barrel Resonator | +20% range, +20% bolt speed | 2 |
| split_spark | Split Spark | +1 bolt at next-nearest target | 2 |
| tinkers_plating | Tinker's Plating | +25 max HP, heal 25 | 3 |
| spring_heels | Spring Heels | +12% move speed | 3 |
| pan_legend | Pan Like a Legend | −30% pan tick time | 2 |
| prospectors_luck | Prospector's Luck | seams +10 capacity, respawn 5 s sooner | 2 |
| beacon_dynamo | Beacon Dynamo | beacons +30% fire rate | 2 · offered only once a beacon stands |

## Charm ledger (fun pillar — 07 owns the pass, slices seed it)

Wave banners with flavor ("Rustlers on the north bank!"). Death screen: run ledger + CTA **"Stake Again"**. Gold counter coin-tick; pan ring wobble; hit-flash + dust-puff deaths (illustrated, never gory); level-up cards read like patent-office inventions. Prospector (the agent) quips/receipts are **M4 hooks** — named, not built.

## Risks / fog

1. **Fun risk is the real risk** — lives in 03 (first verdict) and 07 (tune gate). If 03 says "flat": reslice (candidate knobs: hold-to-pan vs auto-pan, knockback, trickle floor, pulse size) — never tune blind.
2. **Auto-aim feel** (02): flip-flop between equidistant targets, shooting across the river — target stickiness in-slice, judged clean via debug spawns before waves exist.
3. **Crowd perf** (01/03): pooling + shared materials from first commit; `?stress=120` gate inside 01; named fallback ladder above.
4. **Restart leaks** (01): counts-return-to-baseline e2e, run twice, plus geometry-count leak gate.
5. **Pause-vs-clocks** (06): sim-time rule from M0; e2e asserts wave clock un-drifted after a level-up pick.
6. **Economy over-engineering** (04): the seam is events+log+reduce, nothing else.

## Firewalls (global M1)

No second building type, walls, base damage, gold-stealing (M2). No persistence/meta (M3). No agent/Prospector runtime or UI (M4 — hooks in copy only). No networking. No real art. No new npm deps except `lil-gui` (07). Kills grant XP, never gold. §9.2/§9.3 guardrails absolute: frontier-tech silhouettes, no firearm language, dust-puff deaths, enemy = Claim Jumpers (human rustler archetype, never ethnic caricature).
