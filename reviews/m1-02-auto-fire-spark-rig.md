# Review — m1/02-auto-fire-spark-rig

**Verdict: PASS** (after 1 batched correction round). Implementer: Codex session C `019f26c3-f4c7-7c40-8fff-804894719f3e` (gpt-5.5, chunked). Reviewed 2026-07-03, session 2.

## What shipped

TargetingSystem (nearest-XZ + sticky target until dead/out-of-range+1m), CombatSystem (sole `takeDamage` caller — hero contact damage migrated out of Game.ts; `ShooterHandle` registry ready for beacons in 05), pooled Projectile (128, instanced teal bolt + tracer), XpMote (64, 2 m magnet, counter-only until 06), Vfx (hit flash, dust-puff deaths, damage ticks), AudioSystem (procedural Web Audio blips, autoplay-safe), HUD XP panel ("LEVEL 1 — 0/12 XP"), `__GR_TEST__.spawnPack/state/resetRun`, e2e spec. All Balance numbers in `Balance.ts` per spec table.

## Correction round (fixed, verified)

- **F1 blocker** — `resolveBoltHits` called `projectiles.deactivate(i)` *before* `damageAt(i)`, and `deactivate` zeroes the damage slot → every bolt dealt 0 damage; enemies unkillable, no XP. Found by live probe (contact damage worked, bolts died same-frame on converged enemies, nothing ever died). Fix: read slot before deactivating.
- **F2** — e2e first-poll `.toBe(5)` raced the now-working rig; → poll `> 0`.
- **F3** — stress test was vacuous when the rig never fires; added `maxBolts > 0`.

## Supervisor integration fixes (cross-slice, by orchestrator)

- `e2e/m1-01` "contact kills hero": written pre-rig; the hero now out-fights thin spawns. Overwhelm immediately (6 packs up front; iframes cap intake at 16 dmg/s → death ≈6.5 s sim regardless of rig).
- `e2e/m1-01` "double restart": keyboard `KeyT` spam collapses at ~16 fps headless (edge-triggered intents miss sub-frame presses) → harness `spawnPack` under `?debug`.
- `e2e/visual` pause test: same keyboard-edge flake on the *second* `KeyP` → `holdKey` helper (down, 160 ms, up). Keeps the real key path.

## Evidence

- `npm run build` ✓ · `tsc --noEmit` ✓ · **e2e desktop 16/16** (4 spec files, serial slices, summary lines grep-counted).
- Zero console/page errors asserted inside the specs.
- Restart leak: geometries/textures stable across 3 spawn-kill-reset cycles (e2e).
- Perf @ 8-enemy skirmish: **23 draw calls** (budget ≤200), ~20.6 fps headless (SwiftShader ceiling ~22, floor 12), 50k tris. Bolt pool never exceeded @ ?stress=120.
- Screenshots: `m1-02-combat-moment.png` (ring of Claim Jumpers, dust-puff kill, XP HUD), `m1-02-bolt-flight.png` (teal bolt + tracer airborne).
- §9.2/§9.4: no firearm language anywhere (`Spark Rig`, bolt, arc; `ShooterHandle` is spec-canon); deaths are dust-puffs; HUD copy stays charming ("P — catch your breath").

## Mid-flight merge with `0a4cf2f` (feedback session)

A parallel session committed `fix(feedback)` (transient banner, gold float text, frame pacing, 57° camera) *while this slice was in flight* — it landed after this session's `~/gr` baseline was cut. Resolved by 3-way merge (base `e1164ec`): their UI `Vfx` kept at `systems/Vfx.ts`; this slice's combat vfx renamed to `systems/CombatVfx.ts` (class `CombatVfx`); `Game.ts` unions both (their float-text on gold gain + our combat update), `Balance.ts`/`UiBridge.ts`/`vite-env.d.ts` merged clean. Full post-merge re-verification: build ✓, tsc ✓, **e2e desktop 18/18** (incl. their `feedback-fx.spec.ts` 2/2). Process fix adopted: sessions must announce themselves in STATUS.md (ACTIVE lock) — the feedback session didn't, and its STATUS.md write-back also reverted this session's lock mid-run.

## Carried minors (→ m1-07 unless noted)

1. Bolt readability: teal washes toward white under tone-mapping at gameplay zoom — bump emissive/size/tracer in the 07 charm pass (or batch-001 `vfx.bolt` art).
2. Dust-puff reads as *black* smoke; Frontier Ledger wants tan/parchment dust.
3. Test-harness lesson generalized: keyboard-driven e2e is now formally deprecated for actions (edge-trigger misses sub-frame presses at headless fps); `visual.spec` hero-movement test still keyboard-driven — migrate when it flakes.
4. `pw.reuse.config.ts` added (supervisor-only): port-5189 reroute + `reuseExistingServer` — a half-dead orphan listener can poison 5188 across bash calls in the sandbox.
