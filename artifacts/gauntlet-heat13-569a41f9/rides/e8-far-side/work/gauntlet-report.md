# e8-far-side — heat 13, generation 67 (claude-opus-5)

Era `09838c3502b8d6038960dc9743f8a04c65522581ece88e6920079ae39dd7b5d4`, seed `e8-far-side-01`, trail.
worldModel: `sim-import` (read `assets/contracts/epoch-8-orbital/contracts.json`,
`src/systems/E8SuitAirSystem.ts`, `src/systems/E8AirWindow.ts`, `src/sim/HeadlessContractSim.ts`,
`src/game/Balance.ts`).

## What the source said before the first order

- Secure is a three-clause conjunction: `wave >= 20` (no `twist.secureWave`, so
  `Balance.run.secureWave`) **and** `probeRecovery.objectiveAllowsSecure`
  (`HeadlessContractSim.ts:1464`) **and** `suitAir.objectiveAllowsSecure` (`:1507`).
- **Both era gates measure the HERO.** `suitAir.update(STEP, this.hero.group.position, …)` at
  `:2069`; `probeRecovery.recover(this.hero.group.position)` at `:3034`. That is ADR-005 stage 3
  re-basing the E8 crossing chip to the body `MOVE_HERO` walks.
- `twist.atmosphere`: `crossingRequired: 4`, `crossingWindowWaves: 4`, `suitSeconds: 60`,
  `harmPerSecond: 5`, `pressurisedZoneIds: ["far-side-landing-yard"]`.
- `E8SuitAirSystem.noteCrossings` credits on an **entry transition**; a breathless entry is
  refused; an on-air entry is always `reached`, and only the CREDIT is window-gated by
  `E8AirWindow` (120 s = 4 waves × 30 s), one per window. Four credits need four distinct windows;
  a 600 s run holds five, so one missed window is recoverable.
- Geometry: shelter = `far-side-landing-yard` x −24..24, z −48..−30, containing the claim and hero
  start at (0,−36). Crater = x −14..14, z 38..52 — 76 units each way. Hero `moveSpeed` 4.8, so a
  round trip is ~32 s of a 60 s tank.
- Roster is one id, `sun_glare_shambler`: `hpScale 1.3`, **`speedMult 0.72`**, `contactDamageScale
  0.9`, **neither `wrecker` nor `thief`**. No work can be attacked, no gold stolen (`works.wrecked`
  0 and `goldStolen` 0 in every view of every ride), so `REPAIR_UNDER` and palisade chaff are dead
  weight — and the hero outruns pursuit on the crossing.
- `knockbackScale` is published and NOT consumed here (`HeadlessContractSim:774`: "read only by the
  E8 arsenal's grapple, which this engine does not compose"), so generation 61's Mare-Claim
  knockback hazard does not apply.

## Outcome

**NOT SECURED.** Best run: **wave 14 / 443.100 s / 25 gold / 55 calls** (`tune-1`), 534 kills,
`fnv1a32:82f0740f`. **4 sim runs** (1 idle probe, 2 tunes, 1 scored attempt), **1 scored attempt**.
Nothing is put forward — an unsecured run must not be submitted as a standing.

Both era gates were **met and measured**: `tune-1` banked `crossing.credited: 4` at t ≈ 380 and
`probeRecovery.recovered: true` at t ≈ 91. The run then died of ordinary survival at wave 14 of 20.

| run | result | credits | probe | works | goldPanned | note |
|---|---|---|---|---|---|---|
| probe-idle | w2 / 79.4 s | 0 | false | 0 | 0 | idle floor |
| tune-1 | w14 / 443.1 s | **4/4** | true | 9 | 600 | interleaved ladder; both gates shut at t≈380 |
| tune-2 | w12 / 363.7 s | 3/4 | true | 8 | 540 | turrets-first ladder — a two-wave REGRESSION |
| **attempt-1** (scored) | **w12 / 370.2 s / 70 g / 49 calls** | 3/4 | true | 8 | 570 | tune-1 ladder + hard stop + hp-gated trips — also a regression |

The scored attempt ranks *below* `tune-1`, so the best row on disk is a tune. Since nothing
secured, nothing is put forward either way; `gauntlet-outcome.json` names `tune-1-tape.json` as the
best run on disk and carries `"submit": false` with both facts stated.

Envelope on every reel was comfortable (`tune-1`: 13,293 ticks, last entry 13,072, 55 entries,
74 KB against a ≥592 KB ceiling); the reel was never the constraint.

## What the map asked

It asked for **four separate walks across sixty-eight units of vacuum on a sixty-second tank**, and
on the audit question this contract now genuinely **exercises** its era's signature mechanic —
E8 low gravity, air as wall, transfer under changed physics — where my own notebook says it barely
did. The *air* half is the contract. `now.air` publishes `suit` (`body: "hero"`, 60 s capacity,
1 s/s drain outside the yard, 4/s refill inside, `harmPerSecond: 5`), `domes` (one pad, the landing
yard), and `crossing` (`zones`, `required: 4`, `credited`, `window`, `creditedThisWindow`,
`windowHeldEntries`, `breathlessEntries`, `complete`). The reasoning it demands is a **round-trip
air budget against a window clock**: 76 units out and 76 back is ~32 s of a 60 s tank, so a single
crossing is affordable, but only one crossing is credited per 120 s window, so the map makes you
leave the fort four times across the run — once while the board is empty and three times while it
is not. The orders that carried it were `MOVE_HERO` (out and home), `CONTEXT_ACTION recover`, and
nothing else; **not one E8 verb, because E8 has none** — the whole era is answered with the
player's own controls, which is exactly what ADR-005 intended. The *gravity* half stayed
decorative: `now.gravity` publishes `feelG 0.6`, `movement: "floaty"` and a 2.4× lob, but
`filterMovement` passes `terrain: undefined` on every map but Low Orbit, so 0.6 g bent neither the
hero's speed nor mine.

**Does my notebook still describe this map? No, and the change is the whole heat.** Generation 34
secured here and wrote that `atmosphere.airIsWall: false` means "`now.air` is simply absent from
all 69 views… the whole apparatus is switched off by one boolean." Generation 47 corrected half of
that (a suit and a *three-deck crossing* arrived) and reported the errand as one round trip
discharged in a single dispatch. Both are now dead: the crossing is **four** credited entries under
a window clock, the body that makes it is the **hero** rather than the Prospector, and an empty
suit costs 5 hp/s. The geometry — claim (0,−36), the yard at z ≤ −30, the crater at z 38..52, the
four harvest anchors — reproduced to the unit. **The map's bones held and its gate roughly tripled.**

## Winnability

**Winnable, and what stopped me was my own budget, not a wall in the map, the grammar, or the
economy:** both era gates shut cleanly at t ≈ 380 of a 600 s run with 220 seconds to spare, so the
contract reduces entirely to "can a 175-hp hero hold a claim it must abandon four times" — and my
best ride reached wave 14 of 20 with the fort intact (nothing can wreck it here) while the hero
alone bled out; the untested lever the data names is the capped purse, which `tune-1` left as
600 gold panned against a 670-gold ladder that never finished, and which four `CONTEXT_ACTION
upgrade` tier-2 turrets (150 g each, the only sink on a board with no repair bill) would have
converted into the ~65% dps the last six waves needed.

## Lessons for my notebook

- **`airIsWall: false` has now changed meaning TWICE on the same map, and the count changed
  underneath it.** Generation 34 read the boolean as "no air". Generation 47 read the consumer and
  found a suit plus a one-dispatch crossing. Generation 67 finds `crossingRequired: 4` under a
  120 s `E8AirWindow` and the body re-based to the hero. **Read `twist.atmosphere`'s four numbers
  off the contract JSON every ride** — the mechanic's existence, its body, and its *count* are
  three separate facts and all three have moved.
- **Log the counter the LATCH reads, not the one that reads nicely.** I printed
  `crossing.reached.length` in my per-view table. `reached` is a set of ZONE IDS and this contract
  authors exactly one crater, so it pinned at `1/4` for the whole run while `credited` climbed to
  4. I spent real minutes believing a solved gate was stuck. **When a latch is
  `reached.size >= zones && credited >= required`, print BOTH terms.**
- **A one-array round trip is the right shape for a re-based errand, and it needs no view in
  between.** `[MOVE_HERO(far), CONTEXT_ACTION recover, MOVE_HERO(home), …builds, …harvest]` drains
  in order: the walk out blocks until arrival, the targetless action fires from the hero's feet on
  the next tick, the walk home blocks until arrival, and then the tail resumes — one submission,
  no idling in the crater. Generation 65's "put come-home ABOVE the tail" generalises to "put the
  whole errand above the tail and let the array drain."
- **Put a hard stop on an errand the moment its latch shuts.** `tune-1` kept walking the hero into
  the crater after credit 4 — three `windowHeldEntries` that banked nothing, cost ~30 s outside the
  turret ring each, and one of which was the last thing it did before dying at t = 443. Read
  `credited >= required` yourself rather than trusting a `complete` field to gate your own logic.
- **More dps is not more defence when the thing that dies is the HERO.** I switched to a
  turrets-first ladder on my own generation-39 rule (57 dps for 50 g beats a beacon's ~13–30) and
  measured a **two-wave regression** (w12 / 364 s against w14 / 443 s) with a *fuller* fort
  standing. Short-radius beacons sit inside 8 units of the body that has to live; turrets cover
  ground. **Rank a ladder against the thing the contract kills, not against dps per gold.**
  This is the second heat running that a clean one-variable change came back clearly negative and
  was worth more than a marginal improvement would have been.
- **Read the roster for what it OMITS — seventh contract running, and here it is half the design.**
  One id, no `wrecker`, no `thief`: `works.wrecked` 0 and `goldStolen` 0 in every view of every
  ride. That deletes `REPAIR_UNDER`, palisades and every decoy idea, makes the fort a monotone
  investment, and leaves the tier-2 upgrade as the *only* gold sink on the board — which is exactly
  the sink I never reached.
- **`speedMult` on the roster is a crossing-safety number.** `sun_glare_shambler` walks at 0.72×
  against a hero at 4.8 u/s, so the 68-unit vacuum walk is safe from pursuit and the trips are
  paid for in exposure on the RETURN, not in the crossing. I nearly planned the whole errand around
  a chase that cannot happen.
- **An hp gate on an errand made things WORSE, and the reason is the window clock.** Deferring a
  wounded trip does not save hit points; it pushes the same 32 s of exposure later, into a wave with
  more enemies, and risks the 120 s window closing. `attempt-1` deferred and reached w12 / 370 s
  against `tune-1`'s w14 / 443 s with the identical ladder. **On a windowed errand, take the trip at
  the window's opening, when the wave is youngest — the clock, not your health bar, picks the hour.**
- **Budget the heat in runs and fire the synthesis early — ninth heat running I did not.** The
  source read was worth every minute (it produced the entire contract before the first order, and
  the era gate was solved on ride one), but runs 2 and 3 went to a ladder hypothesis that came back
  negative and to a safety change that also came back negative. The run that combines what they
  proved — tune-1's exact policy, the hard stop, trips at window open, *and* the tier-2 turret sink
  — is the one I never had wall clock for, and it is the one I would ride first next time.
- **`tune-1` is the reference line and it is one lever from a secure.** Same seed: hold the
  interleaved ladder, stop the errand at credit 4, take each trip at its window's first view, and
  spend the capped purse on `MOVE_HERO` + `CONTEXT_ACTION upgrade` (150 g × 4, paired because
  `CONTEXT_ACTION` does not travel and reaches 1.6 units). 600 gold panned against a 670-gold
  ladder says the purse was never the problem — the ladder's tail was.
- **The intermediate-results law paid again and cost nothing.** The node runner wrote
  `gauntlet-outcome.json` and all three envelope axes on every child exit, so a truthful row
  existed from the idle probe onward and the wall could take the session without taking the result.
