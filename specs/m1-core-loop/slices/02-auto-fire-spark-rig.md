# m1/02-auto-fire-spark-rig

**Contract:** the auto-shooter kernel — the hero kills without aiming and it *feels good* against debug packs before wave pressure exists. Kills yield XP motes.

**Seam:** `src/systems/TargetingSystem.ts` — `findNearest(from, range, targets): Damageable|null` with **target stickiness** (keep target until dead or out-of-range + 1 m — kills flip-flop). `src/systems/CombatSystem.ts` — owns ALL shooting: `registerShooter(h: ShooterHandle)` (`{getPos, range, cooldown, damage, projSpeed, volley}` — hero now, beacons in 05), pooled `entities/Projectile.ts` (128; teal emissive bolt + short tracer, slot `vfx.bolt`), XZ circle hits, sole caller of `takeDamage`, emits `enemy_killed`. Hero weapon = **Spark Rig** (brass arc-emitter on the pack, teal glow — ADR-001; never "gun" in code or copy). `entities/XpMote.ts` (pool 64, teal shard, magnet 2 m, grants XP on touch — XP consumed by 06; until then it accrues on a counter). `systems/Vfx.ts`: hit flash, scale-pop dust-puff death, floating damage ticks; `systems/AudioSystem.ts`: procedural Web Audio blips (shot/hit/kill) — charm, not noise.

**Playable checkpoint:** `T`-spawn packs; hero turns and shreds them hands-free; motes vacuum in; XP number climbs.

**Verification:** GATE-STD; e2e: spawn 5 → `enemiesAlive === 0` within 15 s with zero input, `xp > 0`; projectile pool never exhausts with hero surrounded at `?stress=120`; no per-frame allocations in fire/steer paths (review grep + heap sanity); screenshot of a combat moment (teal bolts readable on parchment); 60 fps @ 60 enemies + 60 bolts.

**Deps:** 01. (May start against 3 static dummy `Damageable` fixtures via `?dummies` if 01 is mid-review; integrate at merge.)

**Firewalls:** no wave scheduling, no economy imports, no beacon code. Emits `enemy_killed`; does not consume XP (06). Only CombatSystem calls `takeDamage`.
