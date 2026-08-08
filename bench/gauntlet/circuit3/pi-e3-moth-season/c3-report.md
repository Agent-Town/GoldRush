# c3-report: e3-moth-season Circuit 3

## Objective
Secure `e3-moth-season` on bench seed `e3-moth-season-01` at trail difficulty.

## Approach

### Understanding the contract
- **Secure at wave 12** — permanent night (nightDepth=1, nightLocked)
- **Moth mechanics**: Moths spawn each wave (baseline 4 + 1 per light source), target light by score (coverage × radius × weight). Decoy sheds have 2× weight and take 6 damage/sec per attached swarm. Lantern posts have 1× weight. Moths only damage decoy sheds, not other structures.
- **Enemies**: `moth_swarm` (fast, low HP, no contact/building damage) and `night_runner` (standard melee enemy, 25.2 HP at trail)
- **Three build zones**: west-lit-yard (x -32 to -8), dark-corridor (x -6 to 6), east-tithe-yard (x 8 to 32), all north bank
- **No river** — so sluice and assay_office unavailable
- **Spawn edges**: north and south
- **6 gold seams**, 3 active at a time, 30 capacity each

### Key discovery: HARVEST order semantics
The HARVEST order goes to **'done' after ONE successful pan** (5 gold per pan). To get continuous gold, multiple identical HARVEST orders must be stacked in the order array — each fires once per submission. The strategy uses 10 HARVEST copies per submission, yielding ~50 gold per wave (before seam depletion).

### Strategy
1. **Phase 1 (waves 0–2)**: Stack HARVEST orders to build gold, build first turret at (-3, 6) in the corridor
2. **Phase 2 (waves 3–8)**: Build second turret, decoy sheds (to attract moths away), stockpile for gold capacity
3. **Phase 3 (waves 9–12)**: Repair damaged works, hold position, survive to secure

### Order array structure (evaluated in order, first actionable wins)
```
[BUILD (with when.goldGte), ..., HARVEST ×10, FALLBACK_IF, HOLD]
```
Builds with `when.goldGte` conditions are checked BEFORE harvest — they fire when gold is sufficient, spending it immediately. Harvest fills gold back up.

## Runs

| Run | Waves | Secured | Gold | Kills | Calls | Notes |
|-----|-------|---------|------|-------|-------|-------|
| 1   | 4     | No      | 30   | 61    | 6     | Hero died early. Only 1 HARVEST per submission → barely any gold generation |
| 2   | 4     | No      | 25   | 61    | 7     | Same issue — redeisgn needed |
| 3   | 12    | **Yes** | 200  | 268   | 34    | Stacked 10 HARVEST copies per submission. 1 turret built, survived to wave 12 |

**Decision count (last run)**: 34 calls (per sim outcome)

## Outcome
- **Secured**: true
- **Waves**: 12
- **Time alive**: 360,000 ms
- **Gold**: 200
- **Kills**: 268
- **Calls**: 34
- **Event log hash**: fnv1a32:2598a8a7