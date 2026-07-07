# Weapon Cycling Audit

Task 053 measured the Q-cycling question without changing gameplay. The seeded probe uses a fixed four-target wall, 60 fixed-step simulated seconds per run, two identical runs per scenario, and the owner's measured cadence of 85 toggles/minute. Source report: `artifacts/053/weapon-cycling-audit.json`.

| Scenario | Toggles/min | Spark DPS | Blast DPS | Total DPS | Delta vs best committed |
|---|---:|---:|---:|---:|---:|
| Pure spark | 0 | 24.0 | 0.0 | 24.0 | -25% vs blast |
| Pure blast | 1 | 0.0 | 32.0 | 32.0 | baseline |
| Rapid cycle | 85 | 16.8 | 29.3 | 46.1 | +44% |

## Why Q-spam wins

This is not a damage-number bug. It is a state-machine seam:

- Both hero weapons are registered at the same time, and `activeWeapon` only gates their `enabled()` predicates: Spark at `src/game/Game.ts:218`, `src/game/Game.ts:220`; Blast at `src/game/Game.ts:228`, `src/game/Game.ts:231`; both register at `src/game/Game.ts:488`.
- Q only flips `activeWeapon` and increments the counter. It does not reset either weapon timer or impose a shared cooldown: `src/game/Game.ts:2088`.
- `CombatSystem.updateRigArcs()` decrements every shooter timer before checking `enabled()`, so the disabled weapon cools down in parallel; when disabled and ready, it is clamped at zero: `src/systems/CombatSystem.ts:327`, `src/systems/CombatSystem.ts:331`, `src/systems/CombatSystem.ts:335`.
- On re-enable, a ready weapon fires immediately and only then adds its own cooldown: `src/systems/CombatSystem.ts:346`, `src/systems/CombatSystem.ts:347`.
- Blast charges survive after the player swaps away. The lob is activated independently at `src/systems/CombatSystem.ts:357`, `src/systems/CombatSystem.ts:364`, then the pool detonates later at `src/entities/BlastCharge.ts:100`, `src/entities/BlastCharge.ts:106`.
- The blast detonation applies full damage to every enemy inside the radius: `src/systems/CombatSystem.ts:451`, `src/systems/CombatSystem.ts:457`. With four targets, each detonation is 80 damage, so juggling keeps most blast output while adding 16.8 spark DPS.

So the exploit is parallel cooldown recovery plus immediate ready-fire on swap, amplified by persistent in-flight blast charges and AoE. It is not swap-canceling a charge, and it is not a hidden fire-rate reset.

## Option Costs

**BLESS.** Keep current DPS: rapid cycle stays 46.1 DPS (+44% over committed blast, +92% over spark). Add swap feel only: 2-3 swap animation frames, a governed swap sound, and a tempo cap around 2 swaps/sec (120/min) so macros above human cadence do not add value. Owner's 46-wave habits survive unchanged: Q rhythm, blast-heavy walls, repairing, and Prospector division of labor.

**NORMALIZE.** Make cycling equal to committed play within +/-10%: target band is 28.8-35.2 DPS around the 32.0 committed-blast baseline, so current rapid-cycle output must lose at least 10.9 DPS. Stopping disabled cooldown recovery or adding a short shared hero swap cooldown are the likely knobs, but either needs this same probe as its acceptance gate because active uptime changes both Spark and Blast counts. Owner's base/repair/Prospector habits survive, but 1,991-toggle Q-spam stops being the optimal damage habit.

**HYBRID.** Normalize the default game to the same 28.8-35.2 DPS band, then add a late arsenal/rotation upgrade family that re-opens parallel cooldown recovery as an intentional build choice. Early play loses the chore; late drafted rotation can return to roughly 42-46 DPS on wall targets. Owner's 46-wave juggling habit survives only after investment, which makes it mastery instead of the default correct input.

## Recommendation

Pick **HYBRID**. It preserves the fun discovery, removes the default ergonomic chore, and gives future arsenal upgrades a real identity.

Owner one-word pick: **BLESS**, **NORMALIZE**, or **HYBRID**.
