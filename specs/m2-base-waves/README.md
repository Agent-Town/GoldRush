# M2 — Base + Waves (feature-slicing v1, s6 2026-07-03)

**Milestone bet:** the fun graduates from "kite and shoot" to "hold a base worth robbing." Sluice + stockpile give the economy its pressure valve (wave-18 finding: late waves leave no panning windows); gold-stealing makes defense matter; walls/turrets make layout a decision. Vertical slice discipline: every slice ends playable; 01→04 is the fun spine — if stealing isn't tense by 04, stop and re-slice before building 05+.

Design constraints carried in (BINDING): wave-18 pressure ceiling (informed play topped the band — escalation needs a knee, 03); beacon falloff root-fix lives here (06/07), m1-08 only knob-tunes; Robin backlog: multi-weapon + AOE buildable (06); mobile build-UX debt from M1 (01). Canon: §9.2 frontier-tech, illustrated, prosperity framing; thieves flee with gold — comic, never gory.

## Slices

**01 buildable-registry-and-menu** — Contract: buildables become data (`BuildableDef`: cost curve, footprint, HP hook, placement rule, slot family `building.*`); Sentry Beacon becomes def #1 unchanged; B opens a 2-item radial/menu (beacon + wall stub), 1/2/3-style select, same ghost/confirm path, touch-friendly (fixes M1 mobile build-UX debt). Checkpoint: build beacon AND a wall segment from one menu. Verify: m1-05 suite still green via def #1; menu e2e desktop+390px. Firewall: no new combat behavior; walls are static blockers only (pathing respects them — enemies steer around, no destruction yet).

**02 sluice-and-stockpile** — Contract: sluice def (river-adjacent placement rule, passive `gold_panned`-family income via Economy events `gold_sluiced`, slower than active panning); stockpile def (raises banked-gold cap; visible gold pile grows with balance). Economy stays sole gold writer; new event types only. Checkpoint: an AFK-ish base earns trickle gold while you fight. Verify: economy log replay equals HUD; sluice income stops when river claim contested (enemy within r). Firewall: no gold theft yet; no interest/idle-game curves (brief §8 — no engagement hacks).

**03 wave-scheduler-v2** — Contract: escalation curve gets a knee (post-wave-10 growth eases toward a ceiling; `Balance.waves.*` knobs + gui); multi-edge pulses with per-edge telegraph banners (flavor rotation continues); pressure windows between pulses sized so panning/building is a real choice (the wave-18 valve). Checkpoint: waves 1–15 playable with visible rhythm: pulse → lull → pulse. Verify: sim-time spawn accounting e2e across the knee; lull duration asserted; NOT-FLAT check vs m1-03 verdict process. Firewall: one enemy archetype still (variants = M2.5/M3 candidates); no boss.

**04 gold-stealing** — Contract: Claim Jumpers gain a second objective: nearest gold holding (stockpile > sluice > loose pile) — grab N gold (Economy event `gold_stolen`, logged), then FLEE to their spawn edge; killing a fleeing thief drops a reclaimable gold pickup (floats `+N` per the standing UX rule, e2e-asserted). Steal/flee is comic (scurry animation placeholder, dust puffs). Checkpoint: ignore defense → get robbed → chase the thief down → reclaim. THE M2 FUN GATE lives here. Verify: economy conservation across steal/reclaim/flee-despawn (log replay = truth); thieves path around walls. Firewall: thieves never damage buildings (that's 05); no hero gold pickpocketing.

**05 base-damage-and-repair** — Contract: buildables get HP (beacons lose `indestructible` — M1 note honored); a wrecker subset of pulses attacks the NEAREST buildable (never seeks the hero); wrecked buildings become repairable ruins (hold-interact, costs gold via `gold_spent:repair`); HP bars only when damaged. Checkpoint: a wall line takes a beating, you triage repairs mid-wave. Verify: no-orphan invariants (ShooterHandle unregister on wreck — renderer memory stable across wreck/rebuild ×3); repair economy logged. Firewall: no auto-repair buildable; no enemy ranged attacks.

**06 arsenal-blast-charge** — Contract: second hero weapon family (Robin ask): Blast Charge — slow AOE lob (frontier-tech mortar silhouette, teal arc telegraph, dust-ring detonation, never gory) as a NEW `ShooterHandle` through the single CombatSystem path; plus turret def (single-target, higher dmg than beacon, needs line-of-sight) — the beacon-falloff root fix via composition, not stat inflation. AOE damage resolves in CombatSystem (one damage path, m1 invariant holds). Checkpoint: hero alternates rig+charge; a turret covers a wall gap. Verify: AOE friendly-to-buildings (no structure damage); pool caps (blast vfx pooled); single-enemy attribution asserts per bolt-diffusion lesson. Firewall: no weapon switching UI beyond 1 toggle key; no ammo economy.

**07 siege-feel-gate** — Contract: the assembled base game is fun with evidence — full-base perf (draw calls ≤200 with ~20 buildables @ wave 15 stress; instancing fallback ladder per buildable family), tune round on all M2 knobs, charm pass (theft alarm ping, repair clunk, sluice water-wheel idle), Robin plays and rules. Exit = Robin sign-off on M2. Firewall: structural discoveries reslice, never patch.

## Slice graph

```
01 ── 02 ── 04 ── 05 ── 07
 └──── 03 ──┘      06 ──┘   (03 ∥ 02; 06 after 01, ∥ 04/05)
```

## Ownership invariants (M1's continue; adds)

- `BuildSystem` owns placement/registry; buildable behavior hangs off defs, not switch-cases in Game.
- Economy remains the ONLY gold writer; new events: `gold_sluiced`, `gold_stolen`, `gold_reclaimed`, `gold_spent:repair`, `gold_granted:upgrade_assay` (m1-08). Log replay stays the source of truth — steal/reclaim conservation is e2e law.
- CombatSystem stays the only damage resolver (buildable HP damage included); TargetingSystem grows `nearestBuilding`/`nearestGoldHolding` queries — still one targeting impl.
- Pools: buildables instanced per family; thieves reuse the enemy pool (a state flag, not a new entity class).
- Every new pickup/drop floats its amount (standing Robin rule, e2e-asserted per slice).

## Next Agent Prompt

_Last updated: 2026-07-03 (s6). Update before ending your pass._

Pickup order: **m1-08 corrections FIRST** (`specs/m1-core-loop/slices/08-wave18-corrections.md` — BINDING before close-spec), then M2-01. Slice specs above are compact v1 — when you pick a slice, expand it into `slices/NN-<slug>.md` with acceptance criteria + harness params before delegating (feature-slicing says specs are living docs). Read STATUS.md §environment first: s6 recipe (curl-guarded vite IN the same bash call as each test batch, in-page trackers for throughput asserts, forceDeath pattern — overlay visibility lies under opacity-hide, `heroHp` is NOT a diagnostics key, use `state === 'dead'`). Robin owes (still): D2 defaults confirm = M1 exit; split_spark same-vs-next-nearest; batch-001 in-game visual review.

TODO:
- [ ] m1-08 wave18-corrections (BLOCKS close-spec m1)
- [ ] m2-01 buildable-registry-and-menu
- [ ] m2-02 sluice-and-stockpile
- [ ] m2-03 wave-scheduler-v2
- [ ] m2-04 gold-stealing ← M2 fun gate
- [ ] m2-05 base-damage-and-repair
- [ ] m2-06 arsenal-blast-charge
- [ ] m2-07 siege-feel-gate (Robin)
