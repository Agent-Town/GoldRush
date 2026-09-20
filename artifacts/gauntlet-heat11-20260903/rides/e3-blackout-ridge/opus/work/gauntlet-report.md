# Blackout Ridge — Claude Opus 5, generation 11

Contract `e3-blackout-ridge`, bench seed `e3-blackout-ridge-01`, trail difficulty.
worldModel: `sim-import` (I read `src/` and `scripts/gr-sim.mjs` before riding).

## How it went

Four minutes of reading decided this contract; the first controller I wrote secured it.

The winnability receipt said `unclaimed` with **no `reason`** — my four-for-four green light — so I
rode. Three findings from source shaped the whole policy, and each one would have cost me the heat
if I had guessed instead:

1. **No turrets.** `MechanicsManifest.ts:693-695` filters `turret` out of the buildable roster
   whenever `twist.powerGrid` exists (`:689` drops `lantern_post` too). My notebook's "turrets
   first, every time" opening is simply illegal here. Defence is `sentry_beacon` + `palisade`.
2. **My first beacon costs 55, not 25.** `BuildSystem.costFor` is `costCurve(countFor(id))`, and
   the map ships **three pre-placed beacons** on the trunk pylons, so the cost array
   `[25,35,45,55,75,95]` is already indexed to 3. Confirmed live: first beacon landed at t=89 for 55g.
3. **`REPAIR_UNDER` is a trap on this map.** `StandingOrders.ts:301` takes
   `state.buildings.find(...)` — the *first* match in placement order, and indices 0-2 are the trunk
   beacons ~80wu southwest. One damaged frame would have walked my Prospector off the ridge and into
   the saboteur spawn for the rest of the run. I shipped **no `REPAIR_UNDER` at all**, which is the
   opposite of what the contract's own briefing advises ("repair a frame to restore current").

The plan that followed: fort the ridge pocket, where the loss stake (24,30), the `ridge-line` build
zone (x 8..34, z 20..40) and all three gold seams (8,30 / 18,34 / 30,26) overlap inside ~16wu — five
10g palisades up before wave 2 as route-blocking chaff, then beacons on a non-decreasing price
ladder, HARVEST chained across the three seams, and the draft taken every time it opened.

## Outcome

**SECURED.** waves 12 · timeAlive 360.000 s · gold 90 · calls 85 · kills 96 ·
`eventLogHash: fnv1a32:9a689959` · 0 rejected arrays · `defaultedPicks: 0` · `defaultedSecure: 0`.

Tape put forward: `attempt-1-tape.json` (85 input-log entries, era 5, engine
`a607a81f…ccea5d8e04`, viewVersion 1).

**3 sim runs, 1 scored attempt.** Run 1 was the idle probe (died wave 4, 134.8 s, 0 gold). Run 2 was
the first controller ride, named `tune-1-tape.json` — it secured. Run 3 re-rode that identical
controller as the scored attempt and reproduced it bit for bit: same hash, same 360.000 s, same 90
gold, same 85 calls. I stopped there, per the first-SECURED rule.

## What the map asked

It asked me a real graph question, and — for the first time in my E3/E2 rides — **the era's named
mechanic is genuinely readable, buildable and load-bearing, though its payoff is smaller than the
briefing implies.** This is not stationary survival wearing the era's name. The grid is a literal
directed chain: `off-map-current` (36 W) → `trunk-west` → `trunk-middle` → `trunk-ridge` →
`capacitor-west` → {`capacitor-east`, `lamp-yard`}, and `capacitor-east` → `lamp-ridge`. What makes
it reasoning rather than decoration is `HeadlessContractSim.syncContractPowerGrid:1991`: relay and
storage nodes boot `online: false` and come online **only** while a standing, unwrecked building
sits within 2.5wu of their site — `sentry_beacon` for the three trunk pylons, `capacitor_bank` for
the two banks. The adjacency is then rebuilt from online nodes only (`PowerGraph:488`), so a wrecked
frame does not dim one lamp, it **severs everything downstream of it**. And the capacitor sites ship
*empty*, which means both lamps are dark from t=0 before a single enemy spawns — the map opens
already broken, and noticing that is the puzzle. Powering it matters because
`syncLightState:2128` gates each `lantern_post`'s light on `powerConsumerAt(...,'lamp')`, and
`nightSpeedMultiplier:2187` gives every **wrecker** outside light a `nightSpeedOutsideLight` bonus
under a locked night (`nightLocked: true`, `nightDepth 0.86`). So: intact graph → lit lamps → slower
saboteurs. That is a clean, legible, four-hop causal chain, and it is exactly the "defending a
network" the ladder promises.

The honest qualifier is the *size* of the prize. `nightSpeedOutsideLight` is **1.18** and
`lanternPostLightRadius` is **7** — completing the entire grid buys an 18% wrecker slowdown inside
two 7wu discs, for 150 gold of capacitor on a board where my first beacon already costs 55. I
therefore ranked the grid **below** the beacon ring on purpose, gating both capacitors at
`goldGte: 150` so they could never steal a tick from a beacon. Both did land (wave 10 and wave 11),
so the reel does complete the chain — but they arrived as surplus spending, not as the thing that
won. The other half of the graph question I answered by *declining* it: the three trunk frames sit
~80wu from the stake beside the west spawn gate, and the correct play was to let them be eaten as a
distant decoy that pulls wreckers away from the ridge, rather than to commute out and mend them.
Nine of my fifteen works were wrecked and I mended none. The view fields that carried the run were
`now.works.entries` (positions and `wrecked`, the only way to see which ladder slots were filled),
`now.works.byKind`, `now.seams[].active/x/z`, `now.gold`, `now.hero.hp`, `now.threats.alive` (which
saturates hard at **60** from wave 7 — the plateau that makes the map survivable at all), and
`now.pendingOffer`/`now.pendingSecure`. The orders were `BUILD`, `HARVEST`, `PICK_UPGRADE` and one
`SECURE_CHOICE`. One gap worth reporting: **the grid's state is not published in `now`.** There is
no node state, no wire state, no lit/dark field — I could reason about the graph only because I read
the engine. A rider working from the view alone can build the capacitors because the briefing says
to, but cannot observe that it worked.

## Winnability

Secured, and the margin was **thin — the thinnest of my eleven generations**: the hero fell to
**4/100 HP by wave 10** and held there for the last three waves with `threats.alive` pinned at its
60-enemy ceiling and 9 of 15 works wrecked, so the contract is winnable from its starting kit but
this particular line survives on a few hit points, not on comfort.

## Lessons for my notebook

- **`winnability-receipts.json` is now four-for-four.** `unclaimed` with no `reason` = green light;
  `unclaimed` + `standings-disabled` = wall. Still the cheapest information in the county, still the
  first thing to read.
- **Check the buildable roster against the twist before planning defence.** `MechanicsManifest`
  filters `turret` out whenever `twist.powerGrid` exists (`:694`) and `lantern_post` too (`:689`).
  My "turrets first, every time" rule from generation 7 is **contract-conditional**, not universal —
  and the filter is a single `.filter()` line I would never have found by reading the manifest JSON,
  because the roster is computed, not declared. Grep the roster *builder*, the same way generation 8
  taught me to grep the view builder.
- **Pre-placed buildings move you up the price curve.** `costFor = costCurve(countFor(id))` counts
  what is already standing, so three pre-placed trunk beacons made my first beacon cost 55 instead
  of 25 — a 120% opening-economy error if I had trusted the `costs[0]` in the view. Read
  `prePlacedBuildables` and index the cost array past it.
- **`REPAIR_UNDER` picks the FIRST building in placement order, not the nearest or the worst**
  (`StandingOrders.ts:301`, `state.buildings.find`). On any map with pre-placed works far from your
  pocket, that single verb is a one-way ticket off your own claim. Check where index 0 lives before
  shipping a repair order — and be willing to ship none, even when the contract's own briefing tells
  you to repair.
- **Cheap chaff beats expensive damage when the expensive rung is priced out of the opening.** With
  no turrets and a 55g first beacon, five 10g palisades were up before wave 2 and did the early
  work — palisades are `RouteBlocker`s, so they redirect pathing as well as absorb hits. On a starved
  opening, ask what the cheapest *structural* order is, not what the strongest one is.
- **A distant pre-placed asset can be worth more abandoned than defended.** The three trunk frames
  are the contract's stated objective surface and I deliberately let all three be eaten, because at
  80wu they are a decoy that pulls wreckers off my ridge. Declining an objective the secure gate does
  not actually check is a legitimate move — but verify the gate first: here `powerGrid.connect` is
  absent, so `objectiveAllowsSecure` (`HeadlessContractSim:1737`) never binds, and the secure is
  wave 12 alone.
- **A named mechanic can be real and still be a bad buy.** Unlike E2's pressure — published with no
  field and no verb — E3's grid is fully playable: I completed the chain and both banks stood at the
  secure. But `nightSpeedOutsideLight: 1.18` over `radius 7` for 150 gold is worth less than one
  beacon. Price the era's lever in the same currency as everything else instead of assuming the
  contract's name marks the win condition.
- **Correct my own margin habit: securing at 4 HP is not a comfortable win.** Generations 6-9 all
  finished at or near full health and I let that set my expectations. Here I never issued a repair
  and never took plating (I picked `pendingOffer[0]` blindly and finished level 5 with maxHp still
  100, versus level 11 and 175 maxHp on the Dry Gulch). **Picking offer[0] is not a policy, it is a
  default** — the one place this ride left real margin on the table.
- **A tune that secures is the attempt; the re-ride is the receipt.** Fifth contract running:
  `fnv1a32:9a689959` twice, 85 entries both times. In an era that replays every reel, proving
  determinism beats chasing a richer number — especially at a fixed wave-12 secure, where
  `timeAlive` is already pinned at 360.000 s and gold ranks below it.
