# Gold Rush Gauntlet — heat 11 — `e5-flotilla` / `e5-flotilla-01` / trail
generation 21 · claude-opus-5 · Claude Code CLI 2.1.257 · worldModel `sim-import` · era `a607a81f…`

## The ride, in order

1. **Pre-ride read (no sim):** `assets/contracts/winnability-receipts.json` → `e5-flotilla`: `unclaimed`, **no `reason`** — thirteen-for-thirteen green light. Contract manifest: `twist.secureWave: 12`, no `twist.baron`, so `autoSecureWaveForRun` returns 12 and the ceiling is 14.
2. **Idle probe** (`probe-idle`): dead at **w2 / 46.8 s / 0 gold / 0 kills**. Zero kills was the tell — the hero never fired at anything.
3. **Source read** — three lines decided the contract:
   - `HeadlessContractSim.ts:978` — `heroShooter.getPos = raceCourse || flotilla ? prospector.position : hero.group.position`. **The gun rides the Prospector here**, exactly as on the Deepwater Claim.
   - `HeadlessContractSim.ts:1465` — `… && !this.deepwater?.diagnostics.flotilla && …` guards `handleEnemyContact`. **The hero takes no contact damage on this map at all.**
   - `HeadlessContractSim.ts:1488` — `resolveHullContacts(t, () => this.combat.damageActor(MAX_SAFE_INTEGER, -5))`. The *only* loss is all three hulls lost.
4. **The geometry:** `FlotillaHullSystem.targetPosition` feeds `enemies.update` the **straggler** — the living hull furthest from the formation centroid. Hulls A(−26,21), B(0,27), C(26,21); centroid (0,23); A and C tie at 26.08 and `reduce` keeps the first, so **the straggler is `kitchen-scow` at (−26,21) and stays there for the whole run if you never reanchor.** Enemies therefore have one permanent, known destination.
5. **The pocket:** `gold-seam-1` (−26,15), the `kitchen-scow-deck` build zone (x −31…−21, z 17…25) and the boat pad `kitchen-scow` (anchor (0,24) + offset (−26,−3) = **(−26,21)**) all sit on the same x. Parking the Prospector on the seam puts its Spark Rig (range 10) 6 wu from the hull, so corsairs enter fire at x ≈ −34 — eight units and ~3 s before they can touch anything.
6. **Controller v1** (`ctrl1.mjs`): free `BOAT_BUILD` first, damage-weighted `PICK_UPGRADE`, a price-ordered build ladder, a chain of `HARVEST` on the pocket seam, `HOLD` at (−26,15) as the anchor. **It secured on its first ride.**
7. **Scored attempt** = the identical re-ride. `fnv1a32:376ebb8b` both times, 24 input-log entries both times, tapes byte-identical apart from the random `id`.

## Measured trace (the secured run)

| wave | t (s) | gold | alive | kills | kitchen-scow | turret-raft | still-room |
|---|---|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 | 96★ | 96 | 96 |
| 1 | 8.0 | 30 | 3 | 0 | 96★ | 96 | 96 |
| 3 | 56.0 | 60 | 3 | 6 | 88★ | 96 | 96 |
| 6 | 128.0 | 120 | 3 | 15 | 72★ | 96 | 96 |
| 8 | 176.0 | 180 | 3 | 21 | 56★ | 96 | 96 |
| 10 | 224.0 | 200 | 3 | 27 | 48★ | 96 | 96 |
| 12 | 272.0 | 200 | 3 | 33 | **48★** | 96 | 96 |

★ = straggler (the enemy target). `threats.alive` sat at exactly 3 at every boundary and kills advanced by exactly 3 per wave: a clean steady state where the pocket killed each storm wave inside its own cycle.

## A finding for the county: no gold buildable can be placed on this map

`works.byKind` was `{}` for all 272 seconds. Every `BUILD` order failed with
`UNREACHABLE: BUILD target is outside buildable terrain.` — including four separate coordinates
**inside** the authored `kitchen-scow-deck` zone: (−26,19), (−29,18), (−23,18), (−29,20).
The whole tile is `open-water`/`lagoon-shallows`, so the three "decks" are declared build zones on
ground that `isBuildable` rejects. (✓ VERIFIED for those four coordinates and for `byKind` staying
empty; ? INFERRED that the other two decks behave the same — I stopped riding on the secure and did
not probe them.)

The consequence is that the contract's own first stated goal — *"Build across the kitchen scow,
turret raft, and still-room barge decks"* — is **not reachable through the door**, and the six
buildables the mechanics manifest publishes with full cost curves (turret 50/70/95/125, beacon
25/35/45/55/75/95, palisade, sluice, stockpile, assay office) are all unbuyable. Gold is therefore
decorative: I panned it to the 200 cap by wave 9 and spent **none of it**. This is the same class as
generation 5's Drill Yard (`top_up`/`ring` published with no verb) and generation 9's Pressure
Garden (a contract named for a goal it cannot serve), one step further along: here the affordance
has a verb, a price and a legal-looking zone, and the *ground* refuses it.

What actually killed 33 corsairs was entirely free: the Prospector-mounted **Spark Rig** (12 dmg ×
2/s, range 10), the **harpoon ballista** placed by `BOAT_BUILD kitchen-scow/turret` at (−26,21)
(8 dmg / 1.4 s, range 14), and the **depth-charge lobber**, which rides the hero position and so
also rides the Prospector here.

---

## Outcome

**SECURED.** `secured: true`, **waves 12**, **timeAlive 272.000 s**, **gold 200**, kills 33,
**calls 24**, `defaultedPicks: 0`, `defaultedSecure: 0`, `eventLogHash: fnv1a32:376ebb8b`.
Tape put forward: **`attempt-1-tape.json`** (24 input-log entries, era `a607a81f…`, viewVersion 1).
**3 sim runs** total (idle probe, `tune-1`, the scored re-ride) and **1 scored attempt**.
`tune-1` secured first with the same hash; `attempt-1-tape` is its identical re-ride, byte-identical
apart from the tape's random `id`.

## What the map asked

It asked me about **formation, and the answer was to refuse to reshape it** — so this is not
stationary survival wearing the era's name, but the era's *named* mechanic (E5 storms scheduling the
waves) turned out to be the clock rather than the puzzle. The storm is the only wave scheduler
(`deepwater_storm_track` → `replacesScheduledWaves: true`), so `now.deepwater.storm.waves[]`
publishes the entire timetable in view 0 — wave *N* at `8 + 24(N−1)`, hence a wave-12 secure at
exactly 272.000 s — but `stormMovementMultiplier: 0.72` and `stormVisibilityMultiplier: 0.58` never
bound on a rider who stands still, so the *adversarial* half of "prediction under adversarial
weather" was inert for the third E5 map running. The load-bearing reasoning was the **flotilla's
straggler rule**: `FlotillaHullSystem.targetPosition` hands `enemies.update` the living hull
furthest from the centroid, which makes the enemy destination a pure function of hull geometry. That
turns `REANCHOR` — the era verb the door advertises for this map — into a *targeting* lever rather
than a defensive one: nudging `kitchen-scow` 6 wu inward flips the straggler to `still-room-barge`
52 wu away and walks every corsair off my guns. With a global 8-second reshape cooldown and views
only at 24-second wave boundaries I get at most one reanchor per view, so kiting on it is not
sustainable — and the correct play was to **issue zero `REANCHOR` orders**, pinning the straggler at
the one hull where the seam, the boat pad and the Spark Rig's 10-wu circle all coincide. The view
fields that carried it were `now.deepwater.flotilla` (`hulls[].integrity/lost/straggler`, `centroid`,
`allLost`), `now.deepwater.pads[].occupied` and `boatBuildings`, `now.deepwater.storm.waves[].scheduledAt`,
`now.seams[].active/x/z`, `now.threats.alive/defeatedTotal`, `now.works.entries` (which is how I saw
the ladder refusing), and `now.pendingOffer`/`now.pendingSecure`. The orders were **`BOAT_BUILD`**,
`HOLD`, `HARVEST`, `PICK_UPGRADE` and one `SECURE_CHOICE` — plus a `BUILD` ladder that the ground
refused in full.

## Winnability

Secured, and the margin was **wide but single-threaded**: 240 of 288 hull integrity survived, yet
all of the loss landed on one hull — `kitchen-scow` finished at **48/96**, the other two untouched at
96 — so the run had a full second hull of slack and, because hull integrity never regenerates and no
repair verb reaches it, roughly 4.8 more corsair-seconds of contact per remaining wave before the
pocket would have had to change.

## Lessons for my notebook

- **`unclaimed` with no `reason` in `winnability-receipts.json` is thirteen-for-thirteen.** Still the
  first two lines of JSON I read, still the cheapest information in the county, still never wrong.
- **Find out what the enemies are actually walking toward before you design anything else.** On this
  map it is not the claim and not the hero: `enemies.update` is fed
  `deepwater.targetPosition(...)` = `FlotillaHullSystem.straggler()`, the living hull furthest from
  the centroid. That one function made the enemy destination a *closed-form* property of three
  coordinates, and everything else — where to stand, where the free gun goes, which seam to pan —
  fell out of it. Generation 19 said "re-read `getPos` on every new era, the body that shoots is not
  a constant"; the twin rule is **re-read the target function, the thing being walked toward is not a
  constant either**.
- **An era verb can be a trap, and declining it can be the play.** `REANCHOR` is the lever
  `skill.md` advertises for the Flotilla ("nudges that hull toward the centroid"), and using it
  *flips the straggler to a hull 52 wu away from your guns*. With an 8-second global reshape cooldown
  against 24-second view boundaries, one reanchor per decision point cannot sustain a kite. I secured
  with **zero `REANCHOR` orders**. Generation 14 learned "some named mechanics are opt-in threats";
  generation 21 adds: **some named mechanics are opt-in threats that the door's own documentation
  recommends.** Price the verb's effect on the *enemy's* plan, not just on yours.
- **Check which damage channels are switched off before budgeting anything.** `HeadlessContractSim:1465`
  skips `handleEnemyContact` entirely when `diagnostics.flotilla` is present, so the hero is
  invulnerable and `hero.hp` is decoration until the all-hulls latch zeroes it. That single fact
  deleted the whole survivability problem and rewrote my upgrade scorer — plating, the pick that won
  me the Dry Gulch and Moth Season, is worth **zero** here. I scored for damage instead. Read the
  guards on the contact handler, not just the roster's `damageScale` fields.
- **A published build zone is not buildable ground.** Three `buildZones` are authored on this map,
  the manifest publishes six buildables with full cost curves, and the briefing's first goal is
  "build across the decks" — and every `BUILD` inside those zones returns
  `UNREACHABLE: … outside buildable terrain`, because the tile is open water. I secured with
  `works.byKind == {}` and 200 unspent gold. Generation 5: an advertised affordance is not an
  available one. Generation 8: an affordance without a feedback field is not a mechanic. **Generation
  21: an affordance with a verb, a price AND a declared zone can still be refused by the terrain —
  always keep a plan that survives the whole gold economy being inert.**
- **Free levers first, again, and this time they were the entire defence.** `BOAT_BUILD` costs no
  gold and has no range check; `DeepwaterArsenal` reads exactly two ids (`turret` → harpoon ballista
  r14, `sentry_beacon` → depth-charge rack r12) and the pad world position is `anchor + offset`,
  which on the `lagoon` anchor puts the `kitchen-scow` pad *exactly on the straggler hull*. Two
  orders in the opening array, issued before the first corsair spawned, plus a Prospector parked
  6 wu from the hull, killed all 33 corsairs. Generation 20 wrote "before pricing a defence in gold,
  grep the socket for what it will give you for nothing" — here that was not an optimisation, it was
  the only defence that existed.
- **An idle probe with zero kills is a positioning diagnosis, not a difficulty rating.** Eighth map
  running where the idle curve told me nothing about the real problem. `kills: 0` across 46.8 s with
  six live corsairs meant the shooter and the enemies were never in the same place — which, on a map
  whose gun rides the worker and whose enemies home on a computable point, *is* the whole strategy
  statement. **Read the idle probe's kill count against its `alive` count; a zero there names a
  geometry problem you can solve before writing a controller.**
- **Failed orders are consumed for the life of the array — so cooldown-gated verbs cannot be
  stacked.** `StandingOrders:380` runs `BOAT_BUILD`/`REANCHOR`/`CAPTURE` immediately, marks `done` on
  success and `failed` on refusal, and `tick` skips both forever. Two `REANCHOR`s in one array is one
  reanchor and one dead record; there is no `when` gate for them and no wait verb. Budget one
  cooldown-gated action *per view*, and let the view cadence, not the cooldown, set your plan.
- **Thirteenth contract running, the second run went to the receipt, not to greed.** `tune-1`
  secured; the scored attempt re-rode the identical controller for `fnv1a32:376ebb8b` twice, 24
  entries, tapes byte-identical apart from the random `id`. At a fixed wave-12 secure `timeAlive` is
  pinned at 272.000 s and gold was already at the 200 cap — there was literally nothing left to win
  by gambling and a replay-proof reel to gain. That is now the fourth contract in a row where the
  ranking fields were both already maxed before the scored attempt began; **when both ranking axes
  are pinned, the only remaining move is proof.**
- **Write the outcome file after every run, before the analysis.** Tenth generation saying it,
  seventh actually doing it — the runner writes `gauntlet-outcome.json` automatically on every child
  exit now, so the row on disk was truthful from the idle probe at minute nine onward.
