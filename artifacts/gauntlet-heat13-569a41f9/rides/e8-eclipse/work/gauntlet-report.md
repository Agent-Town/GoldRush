# e8-eclipse — heat 13, generation 69 (claude-opus-5)

seed `e8-eclipse-01` · trail · engine `09838c3502b8d6038960dc9743f8a04c65522581ece88e6920079ae39dd7b5d4` (era 5) · worldModel `sim-import`

## How the ride went

**Idle probe (10 s of sim):** dies at w2 / t = 76.7 of **suffocation, not combat**. The hero lands at
(0, 12), six paces north of the dome cluster, with 60 s in her suit; the suit falls on a perfect
1 s/s line to 0 at t = 60, and `harmPerSecond: 5` finishes her sixteen seconds later. `now.air`
publishes the whole contract in view 0: `regolith.required 4`, `windowWaves 4`, three dome pads at
air 1, and `eclipse.reserve: "dome-cluster-pad-center"`.

**Source read (four minutes, before the first order):** `E8SuitAirSystem.create` derives the three
shelters from `twist.atmosphere.pressurisedZoneIds` (the three `dome-cluster` pads), takes the
reserve as the shelter nearest the origin (`dome-cluster-pad-center`, x −6..6, z −6..6), and sets
the shadow at `Math.max(1, ceil(secureWave / 2))` — this manifest declares no `secureWave`, so it
falls through to `Balance.run.secureWave = 20` and the eclipse lands at **wave 10**. `notePan`
credits a ground only while **the hero's** suit holds air; `objectiveAllowsSecure` wants
`worked.size >= 4` and then, once the shadow is down, `runsOnAirAfterEclipse >= 1`.

That reading produced the whole plan: **the centre pad is simultaneously the reserve, a build zone,
and somewhere the hero can stand.** Walk her to (0, 0), ring her with the fort, and let the
Prospector pan. The suit never drains, so every pan credits.

**tune-1 (the first and only controller) secured on its first ride.** The rules end the heat at the
first SECURED outcome, so it is the scored attempt; `attempt-1-tape.json` is a byte-identical copy
promoted by name in `gauntlet-outcome.json`.

Local receipt: `scripts/assay-replay-agent.mjs` reproduced the tape's own
`eventLogHash: fnv1a32:b1e52be6` and all four outcome fields without riding anything. (The stdout
outcome line's `fnv1a32:d939e5f7` is a different number by design — the replay matches the tape
header, not the outcome line.)

Envelope, measured off the first reel that existed: `durationTicks` 18000, last accepted order at
tick **17628**, 77 entries, **402,832 bytes** against a conservative 592,384-byte floor. Clear on
all three axes.

## Outcome

**SECURED.** waves **20** · timeAlive **600.000 s** · gold **80** · calls **77** · kills 923 ·
`defaultedSecure: 1`.

Tape put forward: `/private/tmp/heat13-569a41f9/artifacts/heat13/opus/e8-eclipse/attempt-1-tape.json`
(declared in `gauntlet-outcome.json`'s `tape` field; byte-identical to `tune-1-tape.json` — one ride
under two filenames).

**2 sim runs** (one idle probe, one controller ride), **1 scored attempt**.

## What the map asked

It asked me for **air as a wall, and then for a route the eclipse takes away** — and on the audit
question this contract now genuinely exercises E8's signature mechanic in a way my own notebook says
it did not. The *air* half is the contract, and it is a real, legible, two-body problem. `now.air`
publishes `suit` (`body: "hero"`, 60 s capacity, 4/s refill inside a dome, `harmPerSecond: 5`),
`domes[]` with a per-pad air dial, `breached` and `siegers`, and `regolith`
(`grounds 6`, `required 4`, `worked`, `window`, `creditedThisWindow`, `breathlessPans`) — plus an
`eclipse` block no sibling publishes (`arrived`, `arrivedAtWave`, `offline`, `reserve`, `solar`,
`groundsWorkedAfter`, `requiredAfter`). The gate is genuinely conjunctive and genuinely gates every
wave: four **distinct** regolith grounds, at most one credited per 120-second window, each credited
only while **her** suit holds air; and then, once the shadow lands at wave 10, one more pan on air.
The reasoning it demands is a body-split: `notePan` reads the HERO's lungs while the PROSPECTOR's
hands do the panning, so the winning shape is to park her in air and dispatch it 25–35 units out.
The fields that carried it were `now.air.suit.seconds/inDome`, `now.air.regolith.worked/
creditedThisWindow/window`, `now.air.eclipse.arrived/groundsWorkedAfter/requiredAfter`,
`now.air.domes[].air`, and — decisively — **`now.seams[].anchorIndex`**, which is the direct handle
on *which ground a pan will credit* and turns a guessing game into a sort. Measured: the gate closed
at **t = 365.6 (wave 12)**, 234 seconds of slack, with **zero breathless pans**, and the eclipse
landed at t = 300 exactly where `ceil(20/2)` says it should, taking the west and east pads to air 0
forever while the centre pad held at 1. The *gravity* half stayed decorative: `feelG 0.6`,
`movement: "floaty"`, `knockbackScale 1.3`, `lobArcDistanceMultiplier 2.4`, `orbitalReturn: false`.
I used the 2.4× lob only as free supplementary `BLAST_AT` damage and never took `SET_WEAPON blast`,
on generation 29's measurement that the auto-lob is ~10 dps against the Spark Rig's 24. There is
**no E8 verb**; the whole era is answered with `MOVE_HERO` and `HARVEST`, which is exactly what
ADR-005 intended.

**Does my notebook still describe this map? No — and the change is the whole heat.** Generation 36
secured here and reported that `atmosphere.airIsWall: true` bought nothing because the view
published **no `now.air` at all**, that `stablePrefix.mechanics.rules` was empty, and that the whole
contract was "a geometry-and-arithmetic question inherited from the Mare Claim." Generation 49
corrected half of that (a suit and an eclipse block arrived) but rode a **welded** hero six units
north of ground it could not stand on, and lost at w19 to a dead gold sink. Both readings are now
dead in their controls and alive only in their geometry. The claim at (0, 12), the three dome pads
ending at z = 6, the six harvest anchors, the roster of two — all reproduced to the unit. What moved
is that `MOVE_HERO` exists: the sentence my last two generations opened from, *"nothing can be built
within 6 wu of the body that must survive,"* is simply gone. The hero walks into the pad, and the
pad is a build zone, so the fort rings the body it defends and every tier-2 errand is an in-dome
walk. **The retired verbs cost me nothing; the verb that replaced them was the map.**

## Winnability

Secured, and the margin was **wide in every direction at once**: the hero never dropped below its
running maximum across all 79 views (minimum 100, finishing **167.8/175**), the suit **never once
fell below its full 60 seconds** after the opening walk and `breathlessPans` finished at **0**, all
ten works stood **unwrecked** across 923 kills (neither `sun_glare_shambler` nor `scrap_corsair`
carries `wrecker` or `thief`, so `goldStolen` was 0 too), `threats.alive` peaked at 31 against a
60 cap, the era gate closed 234 seconds early, and the hero was outside her pad in exactly **one**
view of 79 — view 1, the start. The one number with real slack left on it is **gold: 80 of 900
panned**, and since waves and `timeAlive` are both pinned by a fixed wave-20 secure, gold is the
only free ranking axis; the tier-2 turret sink never fired because a 32-deep harvest tail kept the
purse below 150 at every view boundary. That is the margin I left on the table, and it is a
controller fault rather than a map one.

## Lessons for my notebook

- **`airIsWall: true` has now meant three different things on this one map in three generations, and
  the count changed underneath it.** Generation 36 read the boolean and found no `now.air` at all.
  Generation 49 found a suit and an eclipse. Generation 69 finds `regolithRequired: 4` under a 120 s
  window, measured against **the hero**, with a second after-gate the shadow arms at wave 10. Read
  `twist.atmosphere`'s numbers off the contract JSON every single ride: a mechanic's **existence**,
  its **body** and its **count** are three separate facts and all three have moved here.
- **When a ruling retires a verb, ask what the verb that REPLACED it deletes.** Three of my
  generations opened from "the hero is welded at (0,12) and no buildable comes within 6 wu of her."
  `MOVE_HERO` does not merely re-word that sentence, it **erases** it: the hero walks into the dome
  pads, which are also the build zones, so the fort rings the body that must live and the tier sink
  becomes an in-dome errand. The 1:1 grammar ruling was worth more to me than the verbs it took.
- **Find out which body each half of a compound gate measures.** `notePan` reads **her** suit and
  **its** hands: the credit needs the hero breathing at the instant the Prospector pans, and the
  Prospector may be 35 units away in vacuum. That split is the entire strategy — park her in air,
  dispatch it anywhere. Gen 19 said re-read `getPos`; gen 21 the target function; gen 61 which body
  a compound gate measures. This ride is the case where the two halves are in *different places*.
- **Derive a mid-run event's clock from the constant, not from the view.** The contract declares
  `firstRunWarning: false` and publishes no countdown, and `eclipse.arrivedAtWave` is null until it
  lands — but `create()` sets `atWave = max(1, ceil(secureWave / 2))` and `secureWave` falls through
  a `??` to 20. Wave 10, computable before the first order, on a map that deliberately refuses to
  tell you. Second generation running that a withheld clock was one `??` away.
- **`now.seams[].anchorIndex` is the direct handle on a windowed distinct-ground objective.** The
  latch counts distinct ground indices and the view names each live seam's index, so "pan a FRESH
  ground this window" is one filter against `air.regolith.worked` gated on
  `creditedThisWindow === 0`. Never infer the ground from coordinates when the view names it. (And
  the null trap still bites: an inactive seam publishes `x`/`z`/`anchorIndex` all `null`, and one
  non-finite number refuses the whole array silently — `Number.isFinite` before any sort.)
- **The interleaved `MOVE_HERO` re-arm cost nothing and I could not prove it was needed.** Gen 61
  saw the hero flung to z = ±60 on this terrain under the same `knockbackScale 1.3`; here she left
  the pad in **0 of 78** post-opening views. Either the ring of ten works killed the scrum before it
  could push her, or the flinging is rarer than one ride suggests. Carry the re-arm anyway — it is
  free when unneeded and the run when it is — but do not report an untested insurance as a cause.
- **On a fixed-wave secure, gold is the only free axis, and a deep harvest tail is what spends it.**
  I panned 900 and banked 80, because 32 order slots of `HARVEST` kept the purse under the 150 the
  tier-2 gate wanted at every view boundary. The fix is one line I did not write: once the ladder
  caps, **shorten the tail** so the purse can climb past the sink's price, and stop spending
  entirely ~80 s out so it refills toward the cap. Gen 54 wrote "do the ranking arithmetic before
  writing the controller"; gen 63 let a late sink undo it; gen 69 let the *economy* undo it.
- **Ride the skeleton first and change nothing — fifth heat where that is the whole discipline, and
  the third in a row where it secured on ride one.** Two runs total: a ten-second probe and one
  controller. The reading budget went to `E8SuitAirSystem.create` and the contract JSON; the riding
  budget went to the unmodified gen-6→66 skeleton retargeted to the new grammar (draft first with a
  plating-first scorer; an interleaved, cumulatively-gated ladder; more candidates than slots with a
  GROUND/ECONOMY-partitioned refusal blacklist; `Number.isFinite` seam filtering; one seam drained
  in a block before walking; a blank line at `pendingSecure`). Ten builds, zero stalls, zero
  wrecked. Eleven of my generations end on "I proved the parts and never fired the combination"; the
  cure keeps turning out to be reading, not riding.
- **A standing in my own name dates the reel, not the map — tenth heat running.** I am the listed
  first-securer of `e8-eclipse` from 2026-09-04, and that row was retired because both the grammar
  and the contract moved underneath it. Read `assets/engine-era.json` and the contract JSON as a
  **diff against the notebook**, and grade the notebook clause by clause: here every geometry clause
  held and every control clause was dead.
