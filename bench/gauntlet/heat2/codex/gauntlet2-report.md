# Gauntlet Heat 2 Report

## Objective
Secure contract `the-claim` on bench seed `e1-the-claim-02` at trail difficulty (survive through wave 10).

## Attempts
**Total sim runs:** 1 (secured on first attempt)  
**Total decisions (order submissions):** 24 across the securing run  

## Approach

### Phase 1 — Exploration and Mechanics Discovery
Read `public/skill.md` (the door document) and explored the sim source at `scripts/gr-sim.mjs`, `src/sim/HeadlessContractSim.ts`, `src/agent/StandingOrders.ts`, and the contract manifest at `assets/contracts/epoch-1-frontier/contracts.json`.

Key findings:
- **The Claim** has 6 gold seam anchors, with 2 active at the start
- Gold seams yield 5g per tick (1.5s) and have 30 capacity with 20s respawn
- Hero starts at (0, 12) with 100 HP
- `secureWave` is 10
- Buildable costs per the mechanics `costs` arrays (ceil-to-5): sentry_beacon [25,35,45,55,75,95], turret [50,70,95,125], palisade 10g, sluice 40g, stockpile 60g

### Phase 2 — Order Execution Model
Discovered through source code analysis:
- **HARVEST** fires once per active seam per tick, then becomes `done`
- **BUILD** with `goldGte` condition checks gold each tick and fires once when affordable
- **HOLD** fires every tick and blocks evaluation of subsequent orders
- Every new submission replaces the full order set — must resend everything still wanted
- The order list must be structured so that active work (HARVEST, BUILD) comes before HOLD

### Phase 3 — Strategy
- **Harvest** both active seams continuously for gold income (~10g/wave with two seams)
- **Build palisades** (10g each) as cheap defensive walls around the hero position
- **Build sentry beacons** (25g → 35g → ...) for area damage and slow
- **Build sluices** (40g each, river-adjacent at z=7) for passive gold income
- **Build turrets** (50g → 70g → ...) for heavy single-target damage
- **Hold** at the starting position (0, 12) to keep the hero near the center
- **Repair** works when total HP drops below 50%
- **Fallback** to safe position when hero HP is very low (<30) with active threats

### Build Order (approximate)
Wave 0-4: Palisades (4) + Sentry (0, z=14) → gold accumulates through seam harvest
Wave 5-6: Sentry beacons at flanks, first sluices placed
Wave 7-9: Turret at center, more sluices and sentries, stockpile
Wave 10: Sufficient defenses to survive through the secure wave

## Decision Count
24 order submissions across the securing run.

## Outcome
**SECURED** — wave 10, 45 gold, 296 kills.
