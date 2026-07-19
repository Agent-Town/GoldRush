# Card truth audit — MQ-7

Slice: lane-card-truth-audit
Branch: lane/e2-arsenal
Scope: all 41 contract cards, 204 goal/rule lines
Verdict: **PASS — player-visible card copy now describes shipped play only.**

## Result

| Verdict | Lines | Meaning |
|---|---:|---|
| TRUE | 72 | The original line has a live engine or rendering consumer and remains unchanged. |
| REWORD | 107 | The original promised an absent mechanic or contradicted canon; the shipped line now states a real layout, route, pressure edge, or live system. |
| CANDIDATE | 25 | The original was fiction and was reworded now, but belongs to one of the five strongest mechanics to build later. |
| **Total** | **204** | Every goal and rule line was classified exactly once. |

The audit also checked each card's player-visible ledger blurb and geography line. Internal `engineDependencies`, engineering descriptions, objective metadata, and twist descriptions remain as implementation notes; they are not rendered on cards. Player-visible blurbs/geography were reworded wherever they repeated fiction.

The mechanical guard in `e2e/contract-briefings.spec.ts` loads all ten bundles, requires exactly 41 cards, rejects backstage dependency language on player cards, and matches every `wave N` claim to its semantic source (`secureWave`, `baron.wave`, or `powerGrid.connect.byWave`).

## Verification

- `npx tsc --noEmit` — PASS.
- `npm run build` — PASS.
- Player-card LEXICON scan — PASS across all 41 cards.
- `contract-briefings.spec.ts` + `board-gating-and-profiles.spec.ts`, desktop and 390px mobile — 16/16 PASS with zero console/page errors.
- `town-t3-board.spec.ts`, desktop and 390px mobile — 11/12 PASS. The remaining pre-existing mobile layout failure is outside this copy/spec firewall: the 41-card page-dot strip pushes the Launch action below the 844px viewport. Desktop is 6/6 PASS; mobile is 5/6 PASS.
- Independent `codex review --uncommitted` found three P2 issues (vehicle-implying “Drive,” lethal Baron copy, and overly broad wave metadata matching); all three were corrected before this evidence pass.

## Candidate ladder

1. **The Long Road — moving claim and lead-Hauler convoy.** Highest payoff: it changes base ownership, travel, building, loss, and town identity in one readable mechanic. Source fiction: `tileParams.engineDependencies` in `epoch-4-motor/contracts.json`.
2. **The Old Canal — persistent segment choices driving later water flow.** Best use of map memory and the strongest continuation of Dome Basin's shipped canal-stage precedent. Source fiction: `twist.persistentCanalChoices` in `epoch-9-redfields/contracts.json`.
3. **The Eclipse — timed solar shutdown, brown-out ledger, and dark waves.** A clean event-driven economy reversal with strong preparation/readability value. Source fiction: `twist.eclipseEvent` in `epoch-8-orbital/contracts.json`.
4. **Low Orbit — zero-G movement plus returning missed projectiles.** The most distinctive physics contract, but it needs a real movement/projectile consumer before copy can promise it. Source fiction: `twist.zeroGravity` and `tileParams.gravity` in `epoch-8-orbital/contracts.json`.
5. **The Flotilla — distributed hull ownership and nonfatal district loss.** Strong co-op and resilience play, gated on multi-hull targeting and formation consumers. Source fiction: `tileParams.engineDependencies` in `epoch-5-deepwater/contracts.json`.

No candidate mechanic was implemented in this slice.

## Line audit

### The Claim (the-claim)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Pan. Build. Hold the claim. | **TRUE** | unchanged | `src/game/Game.ts`; `src/systems/WaveSystem.ts`; `src/world/Terrain.ts` |
| R1 | Secure the claim at wave 20, then stay for the rush. | **REWORD** | The river splits the claim around one center ford. | `src/game/Game.ts`; `src/systems/WaveSystem.ts`; `src/world/Terrain.ts` |
| R2 | Protect the stake; overrun ends the run. | **REWORD** | Pressure comes from all four edges. | `src/game/Game.ts`; `src/systems/WaveSystem.ts`; `src/world/Terrain.ts` |

### The Dry Gulch (e1-dry-gulch)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Secure the claim at wave 20, then stay for the rush. | **REWORD** | Work the dry washes around the lone spring. | `src/game/Game.ts`; `src/systems/BuildSystem.ts`; `src/systems/WaveSystem.ts` |
| R1 | Sluices work only beside the spring. | **TRUE** | unchanged | `src/game/Game.ts`; `src/systems/BuildSystem.ts`; `src/systems/WaveSystem.ts` |
| R2 | The river is gone; enemies can press from every edge. | **TRUE** | unchanged | `src/game/Game.ts`; `src/systems/BuildSystem.ts`; `src/systems/WaveSystem.ts` |
| R3 | Seams pay 40% more gold. | **TRUE** | unchanged | `src/game/Game.ts`; `src/systems/BuildSystem.ts`; `src/systems/WaveSystem.ts` |

### Night Shift (e1-night-shift)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Survive to DAWN at wave 25. | **TRUE** | unchanged | `src/game/Game.ts`; `src/systems/LightField.ts`; `src/systems/WaveSystem.ts` |
| R1 | Beyond your light, the night owns the claim. | **TRUE** | unchanged | `src/game/Game.ts`; `src/systems/LightField.ts`; `src/systems/WaveSystem.ts` |
| R2 | Relight cold lanterns or build new posts to see threats. | **TRUE** | unchanged | `src/game/Game.ts`; `src/systems/LightField.ts`; `src/systems/WaveSystem.ts` |
| R3 | Turrets still target in the dark. | **TRUE** | unchanged | `src/game/Game.ts`; `src/systems/LightField.ts`; `src/systems/WaveSystem.ts` |

### Twin Banks (e1-twin-banks)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Secure the south claim, then decide how far north to build. | **REWORD** | Build on either bank and watch both fords. | `src/systems/BuildSystem.ts`; `src/systems/WaveSystem.ts`; `src/world/Terrain.ts` |
| R1 | Both banks can hold buildings. | **TRUE** | unchanged | `src/systems/BuildSystem.ts`; `src/systems/WaveSystem.ts`; `src/world/Terrain.ts` |
| R2 | Two fords carry pressure across the river. | **TRUE** | unchanged | `src/systems/BuildSystem.ts`; `src/systems/WaveSystem.ts`; `src/world/Terrain.ts` |
| R3 | The north marker is expansion; the south stake is the loss point. | **REWORD** | The south stake marks your starting ground; the north marker stands across the braid. | `src/systems/BuildSystem.ts`; `src/systems/WaveSystem.ts`; `src/world/Terrain.ts` |

### The Claim-Jumper Baron (e1-baron)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | The Baron rides at wave 20. End him. | **REWORD** | The Baron rides at wave 20. Break his Rocket Cart. | `src/systems/WaveSystem.ts`; `src/game/Game.ts`; `src/game/Medals.ts`; `lore/story-arc.md` |
| R1 | His outfit rides hot: waves come 15% faster. | **TRUE** | unchanged | `src/systems/WaveSystem.ts`; `src/game/Game.ts`; `src/game/Medals.ts` |
| R2 | Taunts warn you before his banner appears. | **TRUE** | unchanged | `src/systems/WaveSystem.ts`; `src/game/Game.ts`; `src/game/Medals.ts` |
| R3 | Kill the Baron for the medal and double science. | **REWORD** | Turn back the Baron for the medal and double science. | `src/systems/WaveSystem.ts`; `src/game/Game.ts`; `src/game/Medals.ts`; `lore/story-arc.md` |

### The Ember Shore (e10-ember-shore)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Keep the last warm vent alight through the Static squall. | **REWORD** | Build around the last warm vent. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| G2 | Hold the safe approaches around the cooled titan machine. | **REWORD** | Cross the safe approaches beneath the cooled titan machine. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| G3 | Preserve the Ember Shore; take nothing from it. | **REWORD** | Watch the north, west, and east edges of the dry shore. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R1 | Cooling lava veins mark the shore's hazard bands. | **TRUE** | unchanged | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R2 | The cooled titan machine is older than the Combine; the contract offers no answer for it. | **REWORD** | The cooled titan machine stands beside the eastern build ground. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R3 | The Ember Shore has no river, ford, or water source. | **TRUE** | unchanged | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |

### The Archive World (e10-archive-world)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Re-ink each archive wing by holding its light through the Static squall. | **REWORD** | Cross from the archive entry through both ruined stack wings. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| G2 | Rescue the pages that unlock the archive's real lore. | **REWORD** | Build at the west stacks, east stacks, and warning shelf. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| G3 | Reach the empty shelf marked ours, unless. | **REWORD** | Reach the empty shelf at the deep end of the archive. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R1 | The ruins were un-inked mid-sentence by the Static. | **REWORD** | Three light stakes mark the two wings and warning shelf. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R2 | Only one wing is restored at a time. | **REWORD** | Four surveyed build grounds span the archive. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R3 | Every rescued page is a lore unlock, not extraction loot. | **REWORD** | Waves enter from the north, west, and east. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |

### The Last Claim (e10-last-claim)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Cross all ten era-decks from stern to bow. | **TRUE** | unchanged | `src/systems/E10StaticBossSystem.ts`; `src/systems/E10FinaleSystem.ts`; `src/game/Game.ts` |
| G2 | Give every era's arsenal one last shift before its deck is lost. | **REWORD** | Walk the ten lineage stations along the Ark. | `src/systems/E10StaticBossSystem.ts`; `src/systems/E10FinaleSystem.ts`; `src/game/Game.ts` |
| G3 | Keep one lantern lit, one song playing, and one portrait untouched. | **TRUE** | unchanged | `src/systems/E10StaticBossSystem.ts`; `src/systems/E10FinaleSystem.ts`; `src/game/Game.ts` |
| R1 | The Static consumes each cleared deck behind you. | **REWORD** | The Ark carries ten lineage stations from stern to bow. | `src/systems/E10StaticBossSystem.ts`; `src/systems/E10FinaleSystem.ts`; `src/game/Game.ts` |
| R2 | The Quiet forgets weapons oldest-first. | **REWORD** | The Quiet drains color and song around the three preserves. | `src/systems/E10StaticBossSystem.ts`; `src/systems/E10FinaleSystem.ts`; `src/game/Game.ts` |
| R3 | The Quiet is not damaged; the three preserves make it recede. | **TRUE** | unchanged | `src/systems/E10StaticBossSystem.ts`; `src/systems/E10FinaleSystem.ts`; `src/game/Game.ts` |

### The River (e10-river)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Pan the river. | **TRUE** | unchanged | `src/systems/E10FinaleSystem.ts`; `src/charter/TheRiver.ts`; `src/meta/ContractFamilies.ts` |
| R1 | There are no enemies and no waves. | **TRUE** | unchanged | `src/systems/E10FinaleSystem.ts`; `src/charter/TheRiver.ts`; `src/meta/ContractFamilies.ts` |
| R2 | Credits names surface as gold flecks, one by one. | **REWORD** | The first claim returns with one river and one center ford. | `src/systems/E10FinaleSystem.ts`; `src/charter/TheRiver.ts`; `src/meta/ContractFamilies.ts` |
| R3 | When the last name settles, the river keeps going. | **REWORD** | With the waves quiet, the river keeps going. | `src/systems/E10FinaleSystem.ts`; `src/charter/TheRiver.ts`; `src/meta/ContractFamilies.ts` |

### The Hill Mine (e2-hill-mine)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Hold the Boiler House pad and keep the rail cut open. | **REWORD** | Build across the terraces and keep watch on the rail cut. | `src/systems/WaveSystem.ts`; `src/systems/BuildSystem.ts`; `src/world/Terrain.ts` |
| G2 | Railhead Escort: see the ore cart safely across for a town payout. | **TRUE** | unchanged | `src/systems/WaveSystem.ts`; `src/systems/BuildSystem.ts`; `src/world/Terrain.ts` |
| R1 | T2 and T3 pads out-range the valley, but cliff faces block bolts. | **TRUE** | unchanged | `src/systems/WaveSystem.ts`; `src/systems/BuildSystem.ts`; `src/world/Terrain.ts` |
| R2 | Claim-jumpers must climb the switchbacks; cliff bands are impassable. | **TRUE** | unchanged | `src/systems/WaveSystem.ts`; `src/systems/BuildSystem.ts`; `src/world/Terrain.ts` |
| R3 | The flooded gallery is deep except at the trestle and wet edge. | **TRUE** | unchanged | `src/systems/WaveSystem.ts`; `src/systems/BuildSystem.ts`; `src/world/Terrain.ts` |

### The Trestle (e2-trestle)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Hold the north and south boiler sites through wave 12. | **REWORD** | Build on both approaches and survive through wave 12. | `src/systems/WaveSystem.ts`; `src/systems/BuildSystem.ts`; `src/world/Terrain.ts` |
| G2 | Trestle Crossing: see the ore cart safely over the gorge. | **TRUE** | unchanged | `src/systems/WaveSystem.ts`; `src/systems/BuildSystem.ts`; `src/world/Terrain.ts` |
| R1 | The trestle is the only easy crossing over deep water. | **TRUE** | unchanged | `src/systems/WaveSystem.ts`; `src/systems/BuildSystem.ts`; `src/world/Terrain.ts` |
| R2 | Rail Toughs and Steam Wreckers press both approaches. | **TRUE** | unchanged | `src/systems/WaveSystem.ts`; `src/systems/BuildSystem.ts`; `src/world/Terrain.ts` |
| R3 | The south bank beside the base remains open for sluice work. | **TRUE** | unchanged | `src/systems/WaveSystem.ts`; `src/systems/BuildSystem.ts`; `src/world/Terrain.ts` |

### The Pressure Garden (e2-pressure-garden)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Pressure assay challenge: keep at least 2 boilers hot through waves 8–12. | **REWORD** | Run boilers on the three terraces and watch the pressure ledger. | `src/systems/PressureSystem.ts`; `src/systems/WaveSystem.ts`; `src/world/Terrain.ts` |
| G2 | Defend the three boiler beds until the garden is secured. | **REWORD** | Survive through wave 12 between the three boiler beds. | `src/systems/PressureSystem.ts`; `src/systems/WaveSystem.ts`; `src/world/Terrain.ts` |
| R1 | The coal seams cluster on the highest terrace above the boiler beds. | **TRUE** | unchanged | `src/systems/PressureSystem.ts`; `src/systems/WaveSystem.ts`; `src/world/Terrain.ts` |
| R2 | The single water band has a broad north bank for legal sluice work. | **TRUE** | unchanged | `src/systems/PressureSystem.ts`; `src/systems/WaveSystem.ts`; `src/world/Terrain.ts` |
| R3 | Steam Wreckers attack from both growing terraces while Coal Thieves descend from the seam bed. | **TRUE** | unchanged | `src/systems/PressureSystem.ts`; `src/systems/WaveSystem.ts`; `src/world/Terrain.ts` |

### The Incline (e2-incline)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Incline Haul: see an ore cart safely up the upper line. | **TRUE** | unchanged | `src/systems/WaveSystem.ts`; `src/systems/BuildSystem.ts`; `src/world/Terrain.ts` |
| G2 | Defend the lower engine house and stop the Baron's railcar on the lower line. | **TRUE** | unchanged | `src/systems/WaveSystem.ts`; `src/systems/BuildSystem.ts`; `src/world/Terrain.ts` |
| R1 | Two funicular routes cross the water band and climb separate benches. | **TRUE** | unchanged | `src/systems/WaveSystem.ts`; `src/systems/BuildSystem.ts`; `src/world/Terrain.ts` |
| R2 | The lower rail carries the wave-12 railcar; the upper rail carries the escorted ore cart. | **TRUE** | unchanged | `src/systems/WaveSystem.ts`; `src/systems/BuildSystem.ts`; `src/world/Terrain.ts` |
| R3 | The broad banks beside both crossings remain open for sluice work. | **TRUE** | unchanged | `src/systems/WaveSystem.ts`; `src/systems/BuildSystem.ts`; `src/world/Terrain.ts` |

### Blackout Ridge (e3-blackout-ridge)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Build capacitor banks, then hold the Ridge Switch House through wave 12. | **REWORD** | Bank current at the capacitor sites and survive through wave 12. | `src/systems/PowerGraph.ts`; `src/game/Game.ts`; `src/world/Terrain.ts` |
| R1 | The off-map trunk brings 36 W; each bank stores 0.05 Wh from surplus current. | **TRUE** | unchanged | `src/systems/PowerGraph.ts`; `src/game/Game.ts`; `src/world/Terrain.ts` |
| R2 | A charged bank returns up to 12 W while a cut separates the ridge from its unseen source. | **TRUE** | unchanged | `src/systems/PowerGraph.ts`; `src/game/Game.ts`; `src/world/Terrain.ts` |
| R3 | Trunk Saboteurs attack the three pre-authored frames; repair a frame to restore current and recharge. | **TRUE** | unchanged | `src/systems/PowerGraph.ts`; `src/game/Game.ts`; `src/world/Terrain.ts` |

### Moth Season (e3-moth-season)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Hold through wave 12 while the decoy shed draws the migration. | **TRUE** | unchanged | `src/systems/MothSwarm.ts`; `src/systems/DayNightCycle.ts`; `src/game/Game.ts` |
| R1 | Moths choose light by radius; the Decoy Shed counts double and takes 6 damage per attached swarm each second. | **TRUE** | unchanged | `src/systems/MothSwarm.ts`; `src/systems/DayNightCycle.ts`; `src/game/Game.ts` |
| R2 | Darkness is a road: non-moths move 12% faster outside light below 35% coverage. | **TRUE** | unchanged | `src/systems/MothSwarm.ts`; `src/systems/DayNightCycle.ts`; `src/game/Game.ts` |
| R3 | The cycle stays at night, easing only through two-second dusks. | **TRUE** | unchanged | `src/systems/MothSwarm.ts`; `src/systems/DayNightCycle.ts`; `src/game/Game.ts` |

### The Canyon Works (e3-canyon-works)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | DEFEND the Dynamo Sub-Hall through wave 12. | **REWORD** | Survive through wave 12 from the Dynamo Sub-Hall yard. | `src/systems/PowerGraph.ts`; `src/game/Game.ts`; `src/world/Terrain.ts` |
| G2 | CONNECT both cliff galleries by wave 6. | **TRUE** | unchanged | `src/systems/PowerGraph.ts`; `src/game/Game.ts`; `src/world/Terrain.ts` |
| R1 | Sentry Beacons raised on marked PYLON SITES carry current up the switchbacks. | **TRUE** | unchanged | `src/systems/PowerGraph.ts`; `src/game/Game.ts`; `src/world/Terrain.ts` |
| R2 | Every gallery, lamp, turret, and tram draws watts; the ledger sheds higher-priority numbers first. | **TRUE** | unchanged | `src/systems/PowerGraph.ts`; `src/game/Game.ts`; `src/world/Terrain.ts` |
| R3 | Fevered saboteurs are drawn to the grid and cut a span when they wreck a pylon. | **TRUE** | unchanged | `src/systems/PowerGraph.ts`; `src/game/Game.ts`; `src/world/Terrain.ts` |

### The Fairground (e3-fairground)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | DEFEND the Fair Wheel through wave 12. | **TRUE** | unchanged | `src/game/Game.ts`; `src/systems/PowerGraph.ts`; `src/world/Terrain3dClaimPilot.ts` |
| G2 | Keep three festival flocks inside the escort ring as they cross the midway. | **TRUE** | unchanged | `src/game/Game.ts`; `src/systems/PowerGraph.ts`; `src/world/Terrain3dClaimPilot.ts` |
| R1 | The wheel makes 24 W only while it spins; any damage stops the dynamo. | **TRUE** | unchanged | `src/game/Game.ts`; `src/systems/PowerGraph.ts`; `src/world/Terrain3dClaimPilot.ts` |
| R2 | The wheel cabins lift the watch radius to 18 units. | **TRUE** | unchanged | `src/game/Game.ts`; `src/systems/PowerGraph.ts`; `src/world/Terrain3dClaimPilot.ts` |
| R3 | Copper and Silver pavilion lamps widen by 3 units each night. | **TRUE** | unchanged | `src/game/Game.ts`; `src/systems/PowerGraph.ts`; `src/world/Terrain3dClaimPilot.ts` |

### The Dust Flats (e4-dust-flats)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Hold the Motor Camp through wave 12. | **REWORD** | Build from the Motor Camp into four surveyed fields. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| G2 | Keep the field routes open while the storm crosses. | **REWORD** | Watch all four horizons across the dry wash. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R1 | Motor gangs circle the ORBIT road before peeling toward the camp. | **REWORD** | The ORBIT road circles the outer field. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R2 | Grade surveyed corridors to send the hauler farther on less fuel. | **REWORD** | Twelve derrick claims stand beyond the Motor Camp. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R3 | Storms cut sight and road speed; the gangs steer by engine sound. | **REWORD** | Four tar seams flank one angled dry wash. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |

### The Long Road (e4-long-road)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Bring the whole convoy through to the far railhead. | **CANDIDATE** | Follow the long west-east road between three old way-stations. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| G2 | Never lose the lead Hauler; the town rides with it. | **CANDIDATE** | Build around the station grounds and watch every verge. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R1 | There are no fixed build pads; workshops ride Haulers or anchor briefly at way-stations. | **CANDIDATE** | The graded road runs four hundred units from west to east. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R2 | Motor gangs run the verges and cut at the convoy's flanks. | **CANDIDATE** | Three surveyed station grounds divide the route. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R3 | Each way-station left behind stays behind. | **CANDIDATE** | Waves enter from the north, south, and west. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |

### Gusher County (e4-gusher-county)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Hold the County Camp through wave 12. | **REWORD** | Build from the County Camp across the three leases. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| G2 | Cap and claim the wild derricks well by well. | **REWORD** | Watch all four edges around the eight derricks. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R1 | Wild derricks erupt on their own schedules until capped. | **REWORD** | Eight derricks mark the county's harvest grounds. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R2 | Capping a well claims it — and triggers a blowout wave. | **REWORD** | Tar seams and surveyed roads divide the leases. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R3 | Tar sprites rise wherever crude pools. | **REWORD** | One outhouse geyser marks the eastern field. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |

### The Boneyard (e4-boneyard)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Hold the Gate Camp through wave 12. | **REWORD** | Build from the Gate Camp into the dead-machine rows. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| G2 | Strip more of the yard than the pipeline rustlers do. | **REWORD** | Watch both valley ends while crossing the yard. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R1 | Every dead machine is salvage; work the rows under pressure. | **REWORD** | Dead Flivvers and spent boilers fill the west and east rows. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R2 | Pipeline rustlers strip the same yard and steal what you drop. | **REWORD** | Ten harvest grounds lie among the old machines. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R3 | Nothing in the Boneyard attacks unless it is woken. | **REWORD** | Waves enter from the west and east. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |

### The Deepwater Claim (e5-deepwater-claim)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Hold the Claim-Boat through wave 12. | **TRUE** | unchanged | `src/world/DeepwaterClaimTile.ts`; `src/systems/BuildSystem.ts`; `src/game/Game.ts` |
| G2 | Keep every workshop fastened to a numbered deck anchor. | **TRUE** | unchanged | `src/world/DeepwaterClaimTile.ts`; `src/systems/BuildSystem.ts`; `src/game/Game.ts` |
| R1 | Buildings fasten to Claim-Boat pads; the water itself takes no foundations. | **TRUE** | unchanged | `src/world/DeepwaterClaimTile.ts`; `src/systems/BuildSystem.ts`; `src/game/Game.ts` |
| R2 | Storm fronts carry corsair skiffs west to east. | **TRUE** | unchanged | `src/world/DeepwaterClaimTile.ts`; `src/systems/BuildSystem.ts`; `src/game/Game.ts` |
| R3 | The reef gap admits boats; the wreck shelf and trench obey the depth ladder. | **TRUE** | unchanged | `src/world/DeepwaterClaimTile.ts`; `src/systems/BuildSystem.ts`; `src/game/Game.ts` |

### The Regatta (e5-regatta)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Finish the beacon course before the corsair racers. | **REWORD** | Cross the north-bending beacon course. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| G2 | Defend the Claim-Boat throughout the race. | **REWORD** | Build from the Claim-Boat deck while watching the western water. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R1 | Corsair racers loot any checkpoint they reach first. | **REWORD** | Six beacon gates mark the out-and-back course. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R2 | The fastest water lies nearest the storm front. | **REWORD** | The Claim-Boat deck is the only surveyed build ground. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R3 | The tide-teller waits at the finish and is unimpressed by every time. | **REWORD** | Waves enter from the west. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |

### Stillwater (e5-stillwater)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Complete the quiet run without drawing the leviathan onto the Claim-Boat. | **REWORD** | Build from the Claim-Boat deck among the Shelf Reefs. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| G2 | Use hand panning and sail trim instead of loud machinery. | **REWORD** | Work the five harvest grounds around the anchorage. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R1 | Stillwater has fog and no storms. | **REWORD** | Stillwater reuses the Deepwater Claim reef terrain. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R2 | Pumps, engines, and harpoon reloads make noise the leviathan can hunt. | **REWORD** | Five harvest grounds ring the Claim-Boat. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R3 | Fight only when the fog itself shivers. | **REWORD** | Waves enter from the north and south. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |

### The Flotilla (e5-flotilla)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Keep the district hulls in formation through wave 12. | **CANDIDATE** | Build across the kitchen scow, turret raft, and still-room barge decks. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| G2 | Reshape the fleet around any lost hull and continue. | **CANDIDATE** | Watch both water approaches around the three hulls. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R1 | The kitchen scow, turret raft, and still-room barge each carry one district. | **CANDIDATE** | Each hull carries one surveyed build deck. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R2 | Waves target stragglers; formation is the wall. | **CANDIDATE** | Three stake markers identify the hull centers. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R3 | Losing one hull is an amputation, not game over. | **CANDIDATE** | Waves enter from the west and east. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |

### The Glow Mesa (e6-glow-mesa)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Defend the Isotope Kitchen. | **TRUE** | unchanged | `src/systems/E6TileConsumerSystem.ts`; `src/systems/WrangleSystem.ts`; `src/game/Game.ts` |
| G2 | Harvest the six-vein starstone ring after dark. | **TRUE** | unchanged | `src/systems/E6TileConsumerSystem.ts`; `src/systems/WrangleSystem.ts`; `src/game/Game.ts` |
| G3 | Wrangle appliances after they wind down. | **TRUE** | unchanged | `src/systems/E6TileConsumerSystem.ts`; `src/systems/WrangleSystem.ts`; `src/game/Game.ts` |
| R1 | Decay-puddle windows open and close on visible timers. | **TRUE** | unchanged | `src/systems/E6TileConsumerSystem.ts`; `src/systems/WrangleSystem.ts`; `src/game/Game.ts` |
| R2 | Lawn Shepherds drive appliance herds up the legal-grade scarp paths. | **TRUE** | unchanged | `src/systems/E6TileConsumerSystem.ts`; `src/systems/WrangleSystem.ts`; `src/game/Game.ts` |
| R3 | Feral appliances wind down when kited long enough and may then be captured alive. | **TRUE** | unchanged | `src/systems/E6TileConsumerSystem.ts`; `src/systems/WrangleSystem.ts`; `src/game/Game.ts` |

### The Showroom (e6-showroom)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Choose the next model home to open. | **REWORD** | Cross the model-home village from the showroom approach to the catalog yard. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| G2 | Recover the catalog goods from the empty village. | **REWORD** | Work the six harvest grounds among the display houses. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R1 | Every furnished house is a mimic nest with appliances asleep in their display positions. | **REWORD** | Model homes surround the central village road. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R2 | Waking one house cascades to every appliance in the same product family. | **REWORD** | Three build grounds divide the approach, village, and catalog yard. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R3 | Choose which cost to wake before taking its loot; stealth is an economy decision. | **REWORD** | Waves enter from the north, west, and east. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R4 | Survey status: this page opens for play only after the village can honor the chosen family waking order. | **REWORD** | The display houses stand quiet; no household wakes another. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |

### Half-Life Hollow (e6-half-life-hollow)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Cross the expiring hollow and reach the north extraction shelf. | **REWORD** | Cross the hollow from the south launch shelf to the north extraction shelf. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R1 | Glow bridges expire, causeways run on visible dials, and even safe ground carries a countdown. | **REWORD** | Two glow bridges flank one central causeway. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R2 | Build fast, cross fast, and extract faster. | **REWORD** | West and east shelves divide the middle crossing. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R3 | Every route teaches commitment because every expiry is honest and visible. | **REWORD** | Waves enter from both sides of the hollow. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R4 | Survey status: this page opens for play only after terrain and causeways can expire and every lost route can be recalculated. | **REWORD** | The north extraction stake stands beyond the causeway. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |

### The Picnic (e6-picnic)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Nobody's sandwich gets vacuumed. | **REWORD** | Hold the caprock meadow against waves from three sides. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R1 | The cast stays fixed on its blankets while feral appliances come in from the mesa edges. | **REWORD** | Glow Mesa ground returns beneath the caprock meadow. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R2 | There are zero structures to defend — only lunch, and the afternoon. | **REWORD** | Three sandwich stakes mark the meadow. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R3 | Protect an afternoon instead of a product or structure. | **REWORD** | Waves enter from the north, west, and east. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R4 | Survey status: this page opens for play only after its fixed picnic cast and sandwich-loss terms can be honored. | **REWORD** | The base staging ground lies south of the meadow. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |

### The Relay Valley (e7-relay-valley)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Link the four ridge relays by line of sight. | **TRUE** | unchanged | `src/systems/E7SignalSystem.ts`; `src/game/Game.ts`; `src/world/Terrain3dClaimPilot.ts` |
| G2 | Record one patrol and hand it to a drone. | **TRUE** | unchanged | `src/systems/E7SignalSystem.ts`; `src/game/Game.ts`; `src/world/Terrain3dClaimPilot.ts` |
| G3 | Defend the drone while it walks your route. | **REWORD** | Keep the replay inside linked relay coverage. | `src/systems/E7SignalSystem.ts`; `src/game/Game.ts`; `src/world/Terrain3dClaimPilot.ts` |
| R1 | Relays connect only when they can see one another. | **TRUE** | unchanged | `src/systems/E7SignalSystem.ts`; `src/game/Game.ts`; `src/world/Terrain3dClaimPilot.ts` |
| R2 | Drones drop in dead zones, where data-rustlers ambush. | **REWORD** | Recorded patrols stop when they enter a dead zone. | `src/systems/E7SignalSystem.ts`; `src/game/Game.ts`; `src/world/Terrain3dClaimPilot.ts` |
| R3 | Corrupted-playbook waves replay your recording glitched. | **REWORD** | Four relay sites span the two exposed ridges. | `src/systems/E7SignalSystem.ts`; `src/game/Game.ts`; `src/world/Terrain3dClaimPilot.ts` |

### Echo Canyon (e7-echo-canyon)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Use a playbook, then survive its corrupted copy on the next wave. | **REWORD** | Build along the canyon floor and both echo shelves. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| G2 | Break your recorded pattern before the copies learn the canyon. | **REWORD** | Watch the two open ends of the canyon. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R1 | Every playbook used this run is broadcast-mirrored to the enemy next wave. | **REWORD** | The canyon floor lies between west and east shelf grounds. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R2 | Repeated habits escalate the self-play pressure. | **REWORD** | Waves enter from the north and south. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R3 | Different patterns deny the copies a complete answer. | **REWORD** | Both shelves stand above the central floor. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |

### The Dead Band (e7-dead-band)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Secure the valley with hands, boots, and the four oldest tools. | **REWORD** | Build across the central yard and both old-tool grounds. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| G2 | Hold without drones, playbooks, or relay chains. | **REWORD** | Watch the three open approaches to the valley. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R1 | The iron body blocks signal across the whole valley. | **REWORD** | The Dead Band reuses Relay Valley ground. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R2 | Drones, playbooks, and relay chains do not operate here. | **REWORD** | Three surveyed build grounds cross the iron valley. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R3 | The far end contains no hidden reward. | **REWORD** | Waves enter from the north, west, and east. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |

### Relay Rush (e7-relay-rush)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Light N relays before the interference front arrives. | **REWORD** | Build across the four relay sites on the ridge chain. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| G2 | Choose which links to save when the front overtakes the valley. | **REWORD** | Watch the north, west, and east approaches. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R1 | The interference front crosses the map on a schedule. | **REWORD** | Relay Rush reuses Relay Valley ground. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R2 | Everything swallowed by the front is muted. | **REWORD** | Four surveyed sites mark the ridge chain. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R3 | The front appears as creeping desaturation, like un-inked paper spreading. | **REWORD** | Waves enter from the north, west, and east. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |

### The Mare Claim (e8-mare-claim)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Defend the dome cluster. | **REWORD** | Build among the dome cluster and crater-rim pads. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| G2 | Pan the regolith and He-3 fields on suit time. | **REWORD** | Work the six regolith harvest grounds across the mare flat. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| G3 | Catch the mass-driver cargo window and chart the lava-tube mouth. | **REWORD** | Watch the launch pad, lava-tube mouth, and eastbound mass-driver rail. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R1 | The crater rim stands at height six above the mare flat. | **TRUE** | unchanged | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R2 | Low gravity carries lob arcs 2.4 times farther with a 0.6g feel. | **REWORD** | Seven surveyed build grounds span the rim and mare flat. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R3 | Outside the domes, air is a suit timer and debris rain follows telegraphed arcs. | **REWORD** | Waves enter from the north, west, and east. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |

### The Far Side (e8-far-side)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Cross the Far Side in a suit without drones or playbooks. | **REWORD** | Cross from the landing yard to the listening-probe crater. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| G2 | Recover the half-buried listening probe at the far crater. | **REWORD** | Build at the two surveyed grounds on opposite ends of the Far Side. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R1 | Earth is absent from the sky. | **TRUE** | unchanged | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R2 | The comms shadow disables drones and playbooks. | **REWORD** | The Far Side reuses the Mare Claim rim-and-flat ground. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R3 | The whole crossing is suit-only. | **REWORD** | Waves enter from the north, west, and east. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |

### Low Orbit (e8-low-orbit)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Cross the salvaged Claw scaffold by its handhold spine. | **CANDIDATE** | Cross the salvaged Claw scaffold by its central spine. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| G2 | Commit each push and lob knowing it stays in orbit. | **CANDIDATE** | Build across the carcass yard and both scaffold decks. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R1 | Gravity is approximately zero. | **CANDIDATE** | Three surveyed decks divide the orbital yard. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R2 | Missed lobs travel on and return as future problems. | **CANDIDATE** | Two debris fields flank the central spine. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R3 | Debris is terrain and handholds are roads. | **CANDIDATE** | Waves enter from the west and east. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |

### The Eclipse (e8-eclipse)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Bank enough power and supplies before the eclipse kills the solar economy. | **CANDIDATE** | Build among the Mare Claim's dome cluster and rim pads. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| G2 | Ration through the brown-out ledger and the dark's own waves. | **CANDIDATE** | Work the six regolith harvest grounds across the flat. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R1 | The lunar eclipse arrives mid-run, weeks early. | **CANDIDATE** | Seven surveyed build grounds span the rim and mare flat. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R2 | Its first arrival is unannounced. | **CANDIDATE** | The eastbound mass-driver rail crosses the southern footing. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R3 | Solar production stays down through the dark waves. | **CANDIDATE** | Waves enter from the north, west, and east. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |

### The Dome Basin (e9-dome-basin)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Work the ice quarry above the basin. | **TRUE** | unchanged | `src/systems/E9CanalSystem.ts`; `src/game/Game.ts`; `src/world/Terrain3dClaimPilot.ts` |
| G2 | Defend stage-gates C1, C2, and C3 along the feeder canal. | **TRUE** | unchanged | `src/systems/E9CanalSystem.ts`; `src/game/Game.ts`; `src/world/Terrain3dClaimPilot.ts` |
| G3 | Hold the rim domes, weather spire, seed rows, and Ark yards against dust devils. | **REWORD** | Build at the rim domes, weather spire, seed rows, and Ark yards while watching the dust-devil lane. | `src/systems/E9CanalSystem.ts`; `src/game/Game.ts`; `src/world/Terrain3dClaimPilot.ts` |
| R1 | The north ice-quarry scarp stands at height four above a central basin floor at height minus two. | **TRUE** | unchanged | `src/systems/E9CanalSystem.ts`; `src/game/Game.ts`; `src/world/Terrain3dClaimPilot.ts` |
| R2 | The feeder canal begins dry; C1, C2, and C3 mark its stage gates. | **TRUE** | unchanged | `src/systems/E9CanalSystem.ts`; `src/game/Game.ts`; `src/world/Terrain3dClaimPilot.ts` |
| R3 | Dust devils follow a telegraphed wander lane. | **TRUE** | unchanged | `src/systems/E9CanalSystem.ts`; `src/game/Game.ts`; `src/world/Terrain3dClaimPilot.ts` |

### The Seed Run (e9-seed-run)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Escort the seed-vault caravan from the south yard to the basin approach. | **REWORD** | Cross from the south caravan yard to the north basin approach. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| G2 | Choose which vaults to plant at the three waypoint sites. | **REWORD** | Build around the three green-waypoint grounds along the route. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R1 | Planting a vault spends escort strength for the current run. | **REWORD** | West, center, and east waypoint stakes mark the middle route. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R2 | Each planted vault becomes a permanent green waypoint for future runs on this map. | **REWORD** | Five surveyed build grounds span the south-to-north crossing. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R3 | Past generosity should create shelter for future caravans. | **REWORD** | Waves enter from the west and east. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |

### Devil's Alley (e9-devils-alley)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Hold the alley through all three scheduled dust-devil sweeps. | **REWORD** | Cross the alley between the south and north anchor yards. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| G2 | Anchor the buildings that must not move. | **REWORD** | Build around the west, center, and east anchor bays. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R1 | Dust devils relocate unanchored buildings instead of destroying them. | **REWORD** | Three broad crosswind corridors divide the alley. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R2 | Anchored bays preserve deliberate parts of the defense. | **REWORD** | Five surveyed build grounds span the anchor yards and bays. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R3 | A relocated turret keeps firing while airborne. | **REWORD** | Waves enter from the west and east. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |

### The Old Canal (e9-old-canal)

| Line | Original claim | Verdict | Shipped card copy | Engine evidence |
|---|---|---|---|---|
| G1 | Survey each inherited canal segment. | **CANDIDATE** | Cross the three inherited canal grounds. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| G2 | Choose re-dig for a slow correction or demolish for a fast removal. | **CANDIDATE** | Build between the south survey yard and northern outflow. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R1 | Every segment choice persists for future runs on this map. | **CANDIDATE** | Three decision stakes mark the crooked canal line. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R2 | Re-dig is slow and correct; demolish is fast and lost. | **CANDIDATE** | Five surveyed build grounds span the route. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
| R3 | Water will follow the sum of the remembered choices. | **CANDIDATE** | Waves enter from the north, west, and east. | `src/meta/ContractFamilies.ts`; `src/world/Terrain3dClaimPilot.ts`; `src/systems/WaveSystem.ts` |
