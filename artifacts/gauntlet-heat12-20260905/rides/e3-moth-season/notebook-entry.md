
## generation 42 — 2026-09-05T17:04:52.129Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 86e53f37efee27cc9e1333b7dba29719c61e002ed2edfdd5cda8d729545df77b · contracts: e3-moth-season
cost: wallClock 737s · setupToFirstOutput 75s · tokens in 154 / out 125318 (+cache read 18836687) over 77 turns, 41 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w12 / 360.000s / 200g / calls 54 · runs 4 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:ed3974ff, rank 2. Heat 12 (mechanic-changed), ride 6.
- Winnability (rider, verbatim): Secured, and the margin was **wide on health and thin on the fort**: the hero never dropped below its running maximum of 100 across all 74 views and finished **119/175 at level 16**, but **all six beacons were wrecked** by the bank with 63 threats alive, so the fort was gone and the last wave was carried by the hero alone — one more wave on that slope would have been a coin flip.
- What the map asked (rider, verbatim): It asked me about **the grid, and the county's own audit of this contract is now out of date in my favour** — my generation-14 notebook called this map a RESKIN whose named mechanic was "real, fully specified, and entirely optional." That is no longer true. E3's signature is the grid under sabotage, and after the drain the grid is the **secure gate**: `twist.powerGrid` declares a four-node chain — `corridor-dynamo` (0,−32, 20 W) → `corridor-pylon` (0,−14) → `corridor-gallery` (0,2, 6 W) → `corridor-lamp` (0,6) — with `connect.required: 1` by wave 12, a `completionLatch: "one-way-at-or-before-deadline"` and `missedDeadline: "run-unsecurable"`. The relay boots offline and comes online **only** while a standing, unwrecked `sentry_beacon` sits within 2.5 wu of the pylon site (`syncContractPowerGrid:2370`), which powers the gallery, which latches the objective (`syncCanyonConnectObjective:2442`). The fields that carried it were `now.canyonConnect.{powered,required,byWave,complete,failed}` — genuinely legible, no source import needed — and the order was a single `BUILD sentry_beacon` at (0,−14). Two honest qualifiers, and they pull in opposite directions. The objective itself is **cheap and front-loaded**: it latched at **t = 30.0 s for 25 gold**, and because the latch is one-way I watched `powered` fall back to 0 when the pylon beacon was wrecked at t = 131 while `complete` stayed true for the rest of the run. So the graph reasoning is one subtraction (18 wu and 16 wu spans against `maxSpanLength: 30`) and one order. But the *second-order* consequence of the same twist is the whole contract: **filtering the turret out halves the arsenal**, and the map is hard now not because of the grid but because ~20 dps beacons must hold a claim that `fevered_saboteur`s reach from wave 4. The moth layer is unchanged and still strictly dominated — moths do zero contact and zero building damage, damage only a `decoy_shed` the rider volunteers, and `count = max(4, lightSources)`, so I built no decoy and no lantern and the migration idled. The rest was ordinary survival read off `now.works.entries` (position + `wrecked`), `now.seams`, `now.gold`, `now.hero.hp/maxHp/level`, `now.threats.alive/wreckers`, `now.pendingOffer`, with `BUILD`, `HARVEST`, `PICK_UPGRADE`, `BLAST_AT` and one `SECURE_CHOICE`. There is no E3 verb. **Does it still play the way my notebook remembers? No — and that is the headline.** Same seed, same tile, same moths; a different contract. The mechanic my notebook called optional is now the gate, and the four turrets my notebook won with cannot be built.
- Lessons (rider, verbatim):
  - **A contract row rewrite can delete a buildable, and the deletion is two files away from the
    edit.** `twist.powerGrid` exists → `MechanicsManifest.ts:828` filters `turret` → that filtered
    set becomes the sim's build gate at `HeadlessContractSim:1030`. Generation 14 won this map with
    four turrets; generation 42 cannot build one. **When an era-pin says "contract data, zero src/
    edits", the src/ that READS that data is exactly where the change lands.** Re-derive the roster
    from `stablePrefix.mechanics.buildables` every ride and never from the epoch or from memory.
  - **Check whether a manifest filter is descriptive or enforced before you believe either way.**
    Generations 11 and 13 both wrote "assume beacons and chaff when powerGrid exists" and neither
    ever tested it. I traced the filter to the constructor argument that gates the build, which is
    the difference between a habit and a fact. The same trace also showed the *opposite* for
    beacons: `isShooterPowered` is `id !== 'turret' || powerConsumerAt(...)` (BuildSystem:2205), so
    a beacon on a powerGrid map always fires — the grid does not mute my own guns.
  - **`[]` IS A WIPE, AND A FILTER THAT CAN RETURN EMPTY IS A WIPE GENERATOR.** My v2 filtered the
    seam chain to `distance(claim) <= 24`. This map's three live anchors re-anchor between waves
    and from t = 90 all three sat at 25.5–28.9 wu, so the tail emptied, the array emptied, and the
    door's own bolded warning came true: `now.orders` went to `{}`, the Prospector stood at
    (−1.7, 10.6) for 200 seconds, and `goldPanned` froze at 60. **Every array-building path needs a
    terminal anchor order that cannot be filtered away** — I now append a `HOLD` on the claim when
    the array would otherwise be empty. Two of my four runs died of a frozen purse and neither
    cause was the map.
  - **`score.goldPanned` going flat is the single most diagnostic number on the board.** It caught
    both economy bugs in this heat and it caught generation 39's dead sink. Log it every view; a
    flat line while gold is not at the cap means the worker is not working, and the cause is always
    an order, never the map.
  - **A travelling verb that fails is not a free decision point.** tune-1 re-issued `REPAIR_UNDER`
    every view with 0 gold; it walked, failed, walked back, and froze the purse from t = 110.
    Generation 40 wrote this down and I paid it again anyway. `HARVEST` on a drained seam is free
    because the Prospector is already standing there; `REPAIR_UNDER` and `BUILD` are not.
  - **The blank-line rule is the whole cure for `reel_too_large`, and it is worth 25×.** tune-1 was
    437,836 bytes at **wave 8** against a 576,176 ceiling — a wave-12 ride on that policy is
    refused. Answering a view that needs no new order set with `"\n"` (gr-sim records no entry)
    took the securing run to 136,159 bytes / 54 entries for a longer ride. Compute the ceiling
    first — `16 + ceil(maxTicks/5) × 160` — then budget entries against it, and resubmit only on a
    real change in the plan signature or when the worklist is nearly drained.
  - **Cheap rungs starve expensive ones, still, and I re-introduced the bug I have already fixed
    twice.** tune-1's palisades fired every time gold crossed 10 and ate 120 gold in ten-gold
    bites; only two beacons ever stood, and every palisade was wrecked by wave 7 anyway. On a board
    where one buildable is the only damage, buy nothing else until its ladder is finished.
  - **A one-way latch is a licence to abandon the asset.** The pylon beacon is 26 wu from the claim,
    undefendable, and it was wrecked at t = 131 — and it did not matter, because
    `canyonConnectCompletedByDeadline` had latched at t = 30. Read the latch direction before
    pricing the defence of an objective; here it turned a "defend the circuit for twelve waves"
    brief into a 25-gold errand that also bought a distant decoy.
  - **`unclaimed`/first-secured on the door list is a fact about the OLD engine.** This contract
    was listed as first-secured by me on 2026-09-03, and the heat still had to be re-ridden because
    the map moved underneath the row. A standings row dates the reel, not the contract.
