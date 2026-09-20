# e5-stillwater — heat 13, generation 66 (claude-opus-5)

- Rig `claude__opus-5` · harness Claude Code CLI 2.1.257 · worldModel `sim-import`
- Era 5 "the Replayed Board", engine `09838c3502b8d6038960dc9743f8a04c65522581ece88e6920079ae39dd7b5d4`
- Contract `e5-stillwater`, bench seed `e5-stillwater-01`, trail difficulty

## How the heat ran

| run | policy | result |
|---|---|---|
| `probe-idle` | `--policy idle` | died w3 / 104.433 s / 0 g — an untrailed pack walks the hero down |
| `tune-1` (`ctrl-v1.mjs`) | first controller written | **SECURED w12 / 360.000 s / 200 g / 19 calls** |

Two sim runs, one scored attempt. `tune-1` is promoted by name in `gauntlet-outcome.json`;
`attempt-1-tape.json` is a byte-identical copy of `tune-1-tape.json` (27,323 bytes, verified).

### The controller, in one paragraph

`NoiseHuntSystem.steer()` `scriptMoveTo`s **every living `machine_leviathan`** at the trail point,
and the roster's only depth traveller is that id — so a sustained trail redirects the entire board.
The trail is the loudest audible noise source; every source rides the boat's **anchor** (world =
anchor + authored offset); and the strike can only reduce **deck** integrity, never the hero,
selecting the deck nearest the trailed emitter. So: three `BOAT_BUILD`s (palisade on `bow`,
palisade on `port` — the two pads nearest either emitter, pure sacrificial mass since
`ClaimBoat.placeBuilding` takes any non-empty id while `DeepwaterArsenal` reads only
`turret`/`sentry_beacon` — and `turret` on `starboard`, the harpoon ballista and the pad **farthest**
from both emitters at 5.83 / 6.32 wu); a `HARVEST` chain, whose pan channel runs the air-pump and
gathers the pack on the boat; then one `REANCHOR` to `shelf-watch` (36,30) gated on the *live*
precondition (`anchor === 'lagoon' && trail.target && alive >= 6 && starboard occupied`), which
carries the pack 36 wu east on 6 s of engine noise plus the 8 s trail hold, where the ballista's
3-second reload clatter relights the trail and holds it for the rest of the run. **The hero never
moved and I issued no `MOVE_HERO` at all.**

Measured: reanchor landed between t = 17.3 and t = 30; `bow` fell at ~t = 180 after its 32 strikes,
`port` at ~t = 300, and the ballista's own pad finished at **39 / 96** — 13 strikes of slack. 83
strikes, 248 ballista fires, `threats.alive` pinned at its 60–61 cap from wave 4 and held 36 wu east
of a hero at (0,30) that ended **100/100, level 1, having taken zero damage across all 22 views**.

### Admissibility (measured off the first reel that existed)

| axis | value | ceiling |
|---|---|---|
| `durationTicks` | 10,800 | 18,002 |
| last accepted order | tick 9,900 | must be `< durationTicks` ✓ |
| entries | 19 | 3,601 |
| bytes | 27,323 | ≫ (16 KiB + 3601×160 + order-entry term) |

Local assay (`scripts/assay-replay-agent.mjs`) on the promoted tape reproduces the tape header's
own `fnv1a32:ca1df167` and all four outcome fields (`secured`/`waves`/`gold`/`timeAlive`). That is
the tape's hash, not the stdout outcome line's `fnv1a32:165d5ab9` — different numbers by design.

## Outcome

**SECURED.** `waves 12 · timeAlive 360.000 s · gold 200 · calls 19 · kills 56 · defaultedSecure 1`
(`eventLogHash fnv1a32:165d5ab9`). Gold finished pinned at the 200 bank cap from t = 193.1, and
with `twist.secureWave: 12` fixing both waves and `timeAlive`, gold was the only free ranking axis —
it is maxed. I put forward `attempt-1-tape.json`, which is the `tune-1` ride under a second
filename and is declared in `gauntlet-outcome.json`'s `tape` field. **2 sim runs, 1 scored attempt**
(the idle probe plus the securing controller; I stopped at the first secure as the rules require).

## What the map asked

It asked me about **noise** — and its era's named signature, "E5 storms schedule the waves", is
live here but does **not** schedule anything, so this is neither ordinary stationary survival nor
the mechanic the ladder names. The storm is real and fully published: `now.deepwater.storm` carried
a 32-second cycle with all **12 fronts** listed, `movementMultiplier` 0.72 while a front stands, and
`corsairWaves 12 / corsairsSpawned 12 / corsairsRecycledAtExit 6` — the era-pin's
`e5-stillwater-front-crew-2` crewing each front with one `corsair_skiff`. But
`deepwaterStormDisablesScheduledWaves` excludes any contract carrying `tileParams.stillwater`, so
the twelve waves arrived on the ordinary 30-second scheduler (t = 30, 60, … 360) beside the storm's
own 32-second clock, and the skiffs are `scriptMoveTo`'d straight across at z = 0 and recycled at
x ≥ 62 — they never turn on a hero 30 wu north. Both published storm multipliers are inert for a
rider who stands still. What decides the map is `noise_hunt`, and it is the most load-bearing thing
in E5: the fields that carried the run were `now.deepwater.noiseHunt.trail.{target,x,z,strikes}`,
`.sources[].{running,silenced,level}`, **`.decks[].{padId,integrity}`** (the field that chooses the
placement), `now.deepwater.anchor`/`anchors`, `pads[].occupied`, `arsenal.fires.harpoonBallista`,
plus `now.seams[].active/x/z`, `now.gold` against `now.score.goldPanned`, `now.threats.alive` and
`now.hero.hp`. The orders were **`BOAT_BUILD` ×3**, **one `REANCHOR`**, `HARVEST`, one `BLAST_AT`
per ready window, and a blank line at the secure boundary. Not a gold piece was spent on the
defence: both era verbs are free.

My notebook remembers this map from generations 22 and 46, and **it still plays the way I remember
in its bones and not in its controls.** Every structural number reproduced — the same three
machines, the same two quiet zones, the same `shelf-watch` third anchor, the same nearest-deck
strike rule, `strikeDamage 3` / `deckIntegrity 96` / `trailHoldSeconds 8`, the same 12-wave secure
at 360.000 s, the same 200-gold bank cap. What moved is the grammar: generation 46 rode `HOLD`, and
this ride had to be re-derived without it. The answer turned out to be free — the hero has no
drift, so silence *is* a hold, and the unemployed Prospector drifts to the hero, which is exactly
where `HOLD` used to park it.

## Winnability

Secured, and the margin was **wide in every direction at once**: the hero took **zero damage across
all 22 views** (100/100, level 1, never once offered a draft), gold sat at the 200 cap for the last
167 seconds, and the loop's single point of failure — the ballista's own pad — banked at **39 of 96
integrity**, thirteen more strikes (~52 seconds) of slack beyond the secure.

## Lessons for my notebook

- **When a ruling retires a verb, ask what that verb was FOR before assuming it was load-bearing.**
  `HOLD` existed because an idle Prospector drifts back toward the hero; it was never a hero
  control. On a map whose winning line is "the hero stands still and the boat is the lure", the
  removal cost me exactly nothing: I issued **zero `MOVE_HERO`** and the drift put the Prospector
  where `HOLD` used to park it. Third heat running where the 1:1 ruling turned out to be a syntax
  change and not a strategy change on a stationary-hero board — I should stop bracing for it and
  start checking, in one read of `StandingOrders`' own comment block, which body each retired verb
  actually moved.
- **A notebook entry can hold in its bones and expire in its controls, and the two need separate
  verdicts.** Generation 46's geometry, dial values, strike selector and anchor arithmetic all
  reproduced to the unit; its order list did not survive the ruling. Grading the entry clause by
  clause — mechanic constants first, then grammar — is what let the first controller of the heat
  secure. (Generation 64 wrote the inverse case; this is the same rule from the other side.)
- **Read the strike SELECTOR, not the strike damage, and buy pads for it.** `strike()` picks
  `decks.reduce(nearest to trailX/trailZ)`, and the trail alternates between two emitters
  (`harpoon-reload` at anchor+(0,−4) while the ballista fires, `air-pump` at anchor+(−3,−1) while
  the Prospector pans). Compute the distance ordering of your own pads under **both** emitters and
  put the load-bearing asset last in it: `bow` 1.0/3.61, `port` 5.83/2.0, `starboard` 5.83/6.32 —
  so the ballista is last under either, and two 0-gold palisades bought 64 of the run's 83 strikes.
- **Gate a phase transition on the live precondition, never on your own clock — and inherit the
  CONDITION rather than the timestamp.** Generation 22 paid a run to learn that a t = 0 `REANCHOR`
  lights nothing (no pack yet, engine noise expires, the trail drops). Carrying
  `anchor==='lagoon' && trail.target && alive>=6 && starboard occupied` rather than "fire at the
  t=30 view" made it fire at t≈20 instead, ten seconds earlier than my predecessor, on the first
  ride.
- **`now.seams` publishes `x`/`z`/`anchorIndex` as `null` for an inactive seam.** One non-finite
  number refuses the WHOLE array and installs none of it, silently — the run then looks like it is
  ignoring you. `Number.isFinite` on both coordinates before any sort or order is now unconditional
  in my skeleton, and it cost generation 59 a whole ride.
- **When both ranking axes are pinned, stop.** `twist.secureWave: 12` fixes waves at 12 and
  `timeAlive` at 360.000 s, and the bank cap fixes gold at 200. The first controller hit all three,
  so a second scored attempt could only have moved the reel's bytes. The remaining budget went to
  the envelope check and the local assay instead — measured on the first reel that existed, exactly
  as generation 30 learned to.
- **`ClaimBoat.placeBuilding` validates nothing but emptiness and occupancy.** Any string takes a
  pad, and `DeepwaterArsenal` reads only `turret` and `sentry_beacon`, so a `palisade` on a pad is
  free, gold-less deck mass that exists purely to be nearest to the emitter. Ask of any
  damage-selector mechanic: *what is the cheapest legal thing I can put in front of it?*
- **Track deck placements LOCALLY, not from `pads[].occupied`.** A knocked-out pad re-reads as
  unoccupied (`boatBuildings` filters lost pads out) while `placeBoatBuilding` refuses it by rule
  (`lostHullPads`), so a naive re-issue is a refusal you did not intend. Generation 46 got nine
  harmless ones; a `Set` of what I have actually placed got zero.
- **The runner before the probe, sixth heat running.** Shell redirection and compound commands are
  refused in this arena. A node runner that spawns `gr-sim`, drives the controller, logs every view
  to JSONL and writes `gauntlet-outcome.json` plus all three envelope axes on every child exit made
  the intermediate-results law automatic — a truthful row existed from the idle probe onward — and
  its per-view table is the entire evidence base of this report. One fix to carry: read the entry
  tick off `entries[].t`, not `.tick`; my first envelope print silently dropped `lastEntryTick` as
  `undefined`, which looks exactly like a field that passed.
