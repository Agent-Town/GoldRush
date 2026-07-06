# Building tiers — the homestead loop (production, upgrades, agent automation)

Status: DRAFT for owner ratification (3 items at bottom), sliceable after.
Owner directive (Robin, verbatim, 2026-07-06 evening): "Upgrading the buildings… increase production — that could then also result in a different building but probably same amount of space. This could allow the user to ramp up production of gold to then pay for other upgrades which then could result in a much longer game play loop. Then saving the game will start to make sense and it could be that the things like upgrades and repairs and farming can be so automated by agents that the user can just only be there to support because they want to be there."

## Thesis
Building tiers turn the base from a static defense into a **compounding homestead**: production buildings ramp gold, gold buys tiers, tiers change what the base IS. The long loop lives in **endless mode** (post-wave-20): victory stays the tight roguelite beat at ~20 waves, and everything after it becomes the homestead game — which is exactly where suspend/resume (M3, already shipped) becomes load-bearing, and where the Prospector's automation (M4, already shipped: repair + pan_at tools, priority knobs from 026) gets an economy worth running. End-state per the owner: the base runs itself through agents; **the player is present because they want to be, not because the game demands it.** That sentence is the design star for M6's recruited agents too.

## Laws
1. **Footprint invariance** (owner): a tier upgrade never changes the building's occupied space — routing, build pads, and base layouts stay valid across tiers.
2. **Tier = production + presence**: each tier meaningfully raises the building's OUTPUT (sluice pan rate, stockpile cap, turret damage/rate) AND visibly changes the building (new look, same slot) — the in-run miniature of the epoch "houses transform" pattern (VISION pillar 4). One visual machinery, two scales.
3. **Science gates the ceiling**: tier-2/3 availability unlocks via science nodes (Prospecting Works branch — SCI-02's families.json carries tier gates). Meta earns the right; gold pays the price. Keeps research meaningful and the ramp bounded per epoch.
4. **Valves against idle-runaway**: tier costs grow steeply (^1.6+), wave escalation already scales, and 012 overwhelm-valves interlocks. Production ramp must never make endless trivially safe — pressure scales with prosperity (gold attracts jumpers: steal pressure rises with stockpile tier, already thematic via M2 gold-stealing).
5. **Automation is a permission, not a default**: agent auto-repair/auto-pan/auto-collect are Prospector policies the player grants per the M4 permission ladder — the player *delegates* the homestead chores deliberately. Delegation UI in ledger voice ("Let the Prospector tend the sluices").
6. Canon: tiers evolve brass/steam → agent-tech glow per ADR-001; placeholder-first (tint/scale/procedural add-ons before art); never gory; naming §9.4.

## Slices
- **BT-00 Demolish** (owner finding at ratification, 2026-07-06: "right now it is not possible to remove already built things — that might be important"): select a built structure → demolish → **refund scaled by remaining HP** (base 50% of total invested cost × hp/maxHp — a crumbling wall refunds little, so demolish-before-it-dies isn't an exploit and damaged-base triage stays real); brief rubble beat, footprint freed, routing lanes re-open automatically (blockers are footprint-driven). Ledger-voice confirm ("Tear down the east sluice? The timber comes back, the labor doesn't."). Small, independent of tiers, fire-authorable NOW — main-slot candidate.
- **BT-01 Tier system core**: `tier` on built instances; upgrade interaction (build-menu context on an existing building: cost, preview); Balance-driven tier tables for **the ratified baseline trio: PALISADE + SLUICE + TURRET** (wall / economy / gun — the three archetypes). Palisade tiers = HP/sturdiness (interlocks with combat-readability's wear states: a tier-2 wall cracks later and reads sturdier); sluice tiers = production; turret tiers = damage/rate. Placeholder tier visuals (procedural: taller frame, extra wheel, iron bands, teal trim); footprint-invariance e2e; economy sink wired (Economy stays sole gold writer).
- **BT-02 Production semantics**: sluice tiers raise auto-pan yield; stockpile tiers raise caps + steal-pressure coupling; economy telemetry so 021/012 tuning sees the ramp (playtest data: panned 235 vs spent 1199 — tiers are the fix that makes panning an ENGINE).
- **BT-03 Tier transforms (art)**: contract slots per tier look (batch-NNN when W1-05 building shells settle — same art machinery as epoch transforms); until then procedural tiers stand.
- **BT-04 Homestead automation**: Prospector policies (auto-repair under X%, auto-pan when idle, auto-collect) behind permission-ladder grants; policy chips on the agent's HUD portrait; endless-mode session flow with suspend/resume as the multi-session spine. (M6 recruited agents later multiply this — one agent per chore is the town's future division of labor.)
- SCI interlock (rides SCI-02, not a slice here): tier-unlock nodes in Prospecting Works.

## Integration map
Touches: BuildSystem (tier state/visuals/upgrade action), buildables defs (tier tables), Economy (sink only), Balance (additive tier tables), agent policies (AgentStub priorities exist since 026), science families.json (gates), HUD. UNTOUCHED: routing/footprints (law 1), CombatSystem resolution, wave scheduler core (012 owns valve tuning), sim timestep, determinism invariants.

## Ratification — ANSWERED (Robin, 2026-07-06 evening) → SPEC IS LAW
1. **Endless-as-homestead: CONFIRMED** — with the demolish rider ("not possible to remove already built things — that might be important") → BT-00 added.
2. **Science-gated tiers: CONFIRMED** — owner: "science-gated tiers are important. That is the logic of science."
3. **Baseline trio: PALISADE + SLUICE + TURRET** — owner: "this is the baseline." (Wall / economy / gun; stockpile tiers follow in BT-02.)
