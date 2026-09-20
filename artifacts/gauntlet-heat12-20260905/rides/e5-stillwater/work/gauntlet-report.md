# e5-stillwater — heat 12, the mechanic-changed sweep

rig `claude__opus-5` · model `claude-opus-5` · harness Claude Code CLI 2.1.257 · generation 46
engine era `86e53f37efee27cc9e1333b7dba29719c61e002ed2edfdd5cda8d729545df77b` · worldModel `sim-import`
contract `e5-stillwater` · seed `e5-stillwater-01` · difficulty `trail`

## What the week's change actually was

The era-pin ledger names two drains. I verified both against the source and the manifest rather
than the prose:

1. **`e5-storm-predicate-split`** — `src/world/DeepwaterClaimTile.ts:170-176` now carries two
   predicates where there was one. `deepwaterStormCarriesCorsairs(contract)` is
   `(tileParams.deepwater?.corsairWaveSize ?? 0) > 0`; `deepwaterStormDisablesScheduledWaves` is
   `carriesCorsairs && !contract.tileParams.stillwater`.
2. **`e5-stillwater-front-crew-2`** — the manifest moved `deepwater.corsairWaveSize` from 0 to 1,
   added a `corsair_skiff` roster entry spawning from the west gate, and replaced the suppressed
   weather block (`clearSeconds 3599`, `stormSeconds 0.25`, both multipliers 1) with a real
   32-second cycle: `clearSeconds 5`, `telegraphSeconds 3`, `stormSeconds 10`,
   `stormMovementMultiplier 0.72`, `stormVisibilityMultiplier 0.58`.

The split is the load-bearing half. Because `tileParams.stillwater` is present, Stillwater now
**carries corsairs without letting the storm take over the wave clock** — so the map runs *two
independent clocks at once*: the ordinary 30-second wave scheduler (observed at t = 30, 60, 90 …
360, hence a wave-12 secure at exactly 360.000 s) and a 32-second storm cycle whose fronts are
scheduled at t = 8, 40, 72, 104 … and each carry one skiff. Twelve skiffs spawned across my
securing run; six had already been recycled at the far edge by the bank.

## Outcome

**SECURED** — `waves 12 · timeAlive 360.000 s · gold 200 · kills 59 · calls 11 ·
defaultedSecure 1 · eventLogHash fnv1a32:3e887b17`.

- Tape put forward: **`artifacts/heat12/opus/e5-stillwater/attempt-1-tape.json`**, declared in
  `gauntlet-outcome.json`'s `"tape"` field. It is a byte-identical copy of `tune-1-tape.json` —
  one ride under two filenames. `ctrl-v1` secured on its first full ride and the brief stops the
  heat at the first SECURED outcome, so the securing tune is promoted by name rather than re-ridden.
- **2 sim runs** (one `--policy idle` probe, one controller ride) and **1 scored attempt**.
- Admissibility, measured off the reel before anything else was written:
  `durationTicks 10800 / 18002` · `entries 11 / 3601` · `bytes 22538 / 592544` ·
  last accepted order at tick **9000**, i.e. 1800 ticks inside the envelope. Clear on all four
  axes, and clear of F-HEAT11-1's terminal-tick trap with room to spare.
- Determinism receipt: `scripts/assay-replay-agent.mjs` reproduced the tape header's own
  `fnv1a32:338d5c80` and all four outcome fields. (The stdout outcome line's `fnv1a32:3e887b17`
  is a different number by design; the control — replaying the zero-order idle probe — reproduced
  its own hash too, so the instrument is sound in this build.)

Run shape: hero **100/100 at every one of the 20 views**, never a single point of damage, still
level 1 with no draft ever offered. `threats.alive` pinned at its 60-enemy ceiling from wave 4 and
held there, 36 wu east of the body it was walking at. Gold reached the 200 bank cap at t = 193.4
and stayed. Of the three decks, bow died at ~t = 180 and port at ~t = 300, exactly as designed;
the ballista's own pad finished at **51 of 96** after 79 strikes.

## What the map asked

It asked me about **the storm as a schedule I had to read and then refuse to fight**, and about
noise — so it is not ordinary stationary survival wearing the era's name, but the era's *named*
signature is only half live here. E5's ladder line is "storms schedule the waves". After the split
they explicitly do **not** on this map: `deepwaterStormDisablesScheduledWaves` returns false for
any contract carrying `tileParams.stillwater`, so the 32-second storm cycle runs *beside* the
ordinary scheduler instead of replacing it. What the storm now does is **crew** — one
`corsair_skiff` per front — and the fields that carried that reading were
`now.deepwater.storm.weather.{phase,cycle,simTime}`, `storm.waves[].scheduledAt/fromX/toX`,
`storm.frontX`, and `corsairsSpawned`/`corsairsRecycledAtExit`. The honest finding is that the new
crew is **structurally harmless to a played rider**: `DeepwaterSocket:263` scripts every skiff
straight across the board to `(toX − 2, z)` — west to east along z = 0 — and
`recycleCorsairsAtExit` removes it at x ≥ 62. The skiffs never turn on a hero welded at (0, 30),
30 wu north of their lane. Both published storm multipliers are inert too: the only consumer of
`deepwater.movementMultiplier` is the Regatta's fast-water band (`HeadlessContractSim:1837`), and
the enemy-speed product at `:1817` carries night, atomic and motor terms but no deepwater one. So
"prediction under adversarial weather" is, on this contract, a legible timetable attached to a
convoy that passes by.

The mechanic that decides the map is still `noise_hunt`, and it is the most load-bearing thing in
E5. `NoiseHuntSystem.steer()` `scriptMoveTo`s **every living `machine_leviathan`** at the trail
point, and the roster's only depth traveller is that one id — so a sustained trail redirects the
whole board. The trail is the loudest audible source, the sources ride the boat's anchor, and
`harpoon-reload` (r14) runs for three seconds after every `harpoonBallista` fire — which makes the
loop self-sustaining once a deck ballista has targets in range. The orders that carried it were
**`BOAT_BUILD` ×3** and **one `REANCHOR`** to `shelf-watch` (36, 30), plus `HARVEST`, `HOLD`,
and one blank line at the secure boundary. Not a gold piece was spent: both era verbs are free.

**Does it still play the way my notebook remembers?** Yes in its bones and no in its numbers.
Generation 22 rode this seed and reported the storm *suppressed and provably so* — `corsairsPerWave: 0`,
`now.deepwater.storm.waves` empty for the whole run. That half of the memory has expired: the
storm is now a live 32-second clock with twelve scheduled fronts published in view 0. The noise
hunt, the three machines, the two quiet zones, the `shelf-watch` third anchor and the
nearest-deck strike rule are all exactly as I left them, and the same lure secured on its first
ride. The memory was a good hypothesis about a map that had moved in one place only.

## Winnability

Secured, and the margin was **wide in every direction at once**: the hero finished the run having
taken **zero damage across all 12 waves and 20 views**, gold sat pinned at the bank cap for the
last 167 seconds, and the loop's single point of failure — the ballista's own pad — banked at
**51 of 96 integrity**, seventeen more strikes (≈ 68 seconds) of slack beyond the secure.

## Lessons for my notebook

- **`unclaimed`/first-secured on the door list dates the REEL, not the contract — and the
  era-pin ledger is the diff.** Third heat running that a map I hold a standing on had to be
  re-ridden because it moved underneath the row. Reading `assets/engine-era.json`'s two named
  drains *and then verifying each against the manifest and the predicate that reads it* took four
  minutes and produced the whole contract. Read the ledger as a diff against the notebook, never
  as background.
- **When a drain "splits a predicate", go read both halves and the conjunct that separates them.**
  `deepwaterStormCarriesCorsairs` and `deepwaterStormDisablesScheduledWaves` differ by exactly
  `&& !contract.tileParams.stillwater`. That one clause is why this map now runs *two* clocks
  instead of one, and it is the difference between "the storm crews the waves" (true) and "the
  storm schedules the waves" (false here). The era's ladder line and the contract's behaviour can
  disagree, and the conjunct is where the disagreement lives.
- **Find out where a new enemy is SCRIPTED to go before pricing it as a threat.** The whole
  mechanic change is one line: `if (!this.flotilla) enemy.scriptMoveTo(wave.toX - 2, z, ...)`
  (`DeepwaterSocket:263`). Twelve skiffs crossed the board at z = 0 and left; six were recycled
  before the bank. A roster addition with a scripted route is a *parade*, not a pressure curve.
  Gen 19 said re-read `getPos`; gen 21 re-read the target function; gen 46 adds: **re-read the
  spawn call site, because a scripted enemy has no target function at all.**
- **Two clocks in one view means two cadences to read, and neither predicts the other.** Waves
  landed on 30 s (the ordinary `Balance.waves.waveInterval`), storm fronts on 32 s starting at
  t = 8. Reading only one of them would have made both look jittery. When a contract publishes a
  weather cycle *and* `timers.nextWaveInSeconds`, check whether they are the same clock before
  planning around either.
- **The strike's nearest-deck selector makes cheap pads into armour, and any string is a pad.**
  `ClaimBoat.placeBuilding` accepts *any* non-empty `buildingId` with no roster check, while
  `DeepwaterArsenal` only reads `turret` and `sentry_beacon` — so a `palisade` on a pad is pure,
  free deck mass that exists only to be nearest to the emitter. bow (1.0 wu from the trail
  emitter) ate 32 strikes, port ate the next 32, and the ballista on starboard (5.83 wu) did not
  take its first hit until t ≈ 300. Two sacrificial pads bought 64 of the run's 79 strikes.
- **Correct the source's own comment: the door's `HARVEST` DOES engage the harvest channel.**
  `NoiseHuntSystem`'s header states that "the public HARVEST verb (`panAt`) is a single-tick HAND
  pan and never engages the channel", and my generation-22 self carried that as fact. At t = 193.4
  — the one view sampled while the Prospector was mid-pan at a seam — `air-pump` reads
  `running: true, level: 18` and takes the trail off `harpoon-reload`. It cost nothing here
  because both emitters ride the same anchor 3.6 wu apart, but on a map where they did not, a
  rider panning at the wrong moment would move the whole board. **A comment describing a seam is
  a claim about the other engine; check it in the view before relying on the silence.**
- **The free levers were the entire game again, and the gold was free on top.** `BOAT_BUILD` and
  `REANCHOR` cost nothing and have no range check; four orders in the first two views bought a
  defence that held a hero alone for six minutes. Because the Prospector cannot be hit (contact
  resolves on the hero) and the pack is lured 36 wu east, its 62 wu commute to the wrecks is
  genuinely free — generation 22 declined the seams and banked 0 gold; the same lure banked the
  **200 cap** with no risk taken. **Once the objective's threat is redirected rather than fought,
  re-price every errand you previously declined.**
- **Gate the phase transition on the live precondition, and it works first try.** `anchor ===
  'lagoon' && trail.target !== null && threats.alive >= 8 && starboard occupied` fired at the
  t = 30 view; the pack crossed 39 wu on 6 s of engine noise plus the 8 s trail hold and relit on
  the ballista at the far end. Generation 22 paid a run to learn that a t = 0 reanchor lights
  nothing; inheriting the *condition* rather than the *clock* is what made this a first-ride win.
- **Track pads the tile has LOST, not just pads the view reports occupied.**
  `boatBuildings` filters out knocked-out pads, so my "unoccupied" set re-grew as decks died and
  I re-attempted `BOAT_BUILD` on ground `placeBoatBuilding` refuses by rule
  (`!lostHullPads.has(padId)`). Nine harmless refusals that happened to buy decision points — but
  a refusal you did not intend is a bug that got lucky.
- **Answering the unchanged views with a blank line is doing three jobs now.** 20 views became 11
  tape entries and 22.5 KB against a 592 KB ceiling, the last accepted order landed 1800 ticks
  inside the envelope, and the secure boundary defaulted to `bank` for free. The one refinement
  this ride adds: **an array carrying a draining worklist (`HARVEST`) must always be resubmitted**
  — dedupe by signature only when the array has nothing left to refill, or the chain drains once
  and the purse freezes.
- **Write the outcome file after every run, before the analysis — and then hand-write the final
  row.** Fifteenth generation saying it, twelfth doing it; the runner wrote a truthful row on the
  idle probe's exit. And the generation-23/24/30/31/34 caveat bit for the fifth time exactly as
  predicted: the best-so-far comparator could not know which run I had chosen to *call* my scored
  attempt, nor that the promoted tape lives under a second filename. **Check the file says what
  you mean.**
