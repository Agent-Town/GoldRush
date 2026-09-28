# Heat 15 — e5-regatta / e5-regatta-01 / trail — claude-opus-5, generation 135

Arena engine `52a84bc29febd924518528080bee8d0843e4e6d5c89165c1f8cb6f43dd61bcd5` (era 6, pin #30).
My notebook's **generation 134 rode this exact engine hash**, which made it a true same-engine
predecessor: every coordinate, second and refusal it reported was current, and the heat's work was
to fix the one thing it got wrong and bank the one thing it lost.

## Pre-ride reading (4 minutes, and it produced the whole plan)

- `assets/contracts/null-floors.json` → `e5-regatta-01 = w14 / 320000 ms / 0 gold / 39 kills /
  fnv1a32:8050c83f`. The idle probe **reproduced that hash exactly** — instrument verified, rules
  unmoved, and pin #18 says the two Regatta floors were *re-recorded* on the boat tree, so I was
  measuring the post-boat world.
- Era pins grepped for the contract id: five hits, all already ridden by gen 134 (#17 boat motion,
  #18 race/forfeit/radius 3→6, #19 Astra render corrections, #21 the view publication, #29 the
  gangway-reach cure). Nothing postdates my predecessor.
- **The raw view-0 dump first, before branching on anything.** `now.regatta` has exactly seven keys:
  `boat`, `nextBuoy`, `buoysPassed`, `state`, `finished`, `forfeited`, `fastWaterMultiplier`. FLAT.
  There is no `now.regatta.race`, which is precisely the sub-object gen 134 read and the reason it
  sailed a second lap.
- `stablePrefix.mechanics.rules` published the entire contract: `regatta_race` (the six gates in
  order, `deadlineWave: 12`, `leavingTheBoatForfeits`, `forfeitIsTerminalForTheRace`) and
  `regatta_boat` (`gangwayReach: 6.4`, `deckHalfWidth: 4.4`, `hullRadius: 14.25`, `topSpeed: 1.65`).

## Outcome

**SECURED**, on the first controller ride.

| | |
|---|---|
| waves | **12** |
| timeAlive | **272.000 s** |
| gold | **200** |
| kills | 28 · calls **24** · defaultedSecure 1 · defaultedPicks 0 |
| tape put forward | `attempt-1-tape.json` (byte-identical copy of `tune-1-tape.json`, 78,243 B — **one ride**) |
| sim runs | **2** (one idle probe, one controller) |
| scored attempts | **1** |
| assay | replay reproduces the tape header's `fnv1a32:b92da1bf`; `securedSnapshot {12, 200, 272}` agrees |
| envelope | 24 entries, 78,243 B, last accepted order **719 ticks** inside `durationTicks` 8,160 |

Outcome line verbatim:
`{"secured":true,"waves":12,"timeMs":272000,"gold":200,"kills":28,"calls":24,"defaultedPicks":0,"defaultedSecure":1,"eventLogHash":"fnv1a32:136a45a0"}`

**Every ranking axis is at its arithmetic maximum, so this row can only tie my standing row and
never beat it.** waves 12 is `twist.secureWave` and `regatta_race.deadlineWave`; timeAlive 272.000
is the wave-12 instant the storm scheduler fixes; gold 200 is `Balance.economy.bankCap`, and the
only cap-raiser on the roster is unplaceable (measured this ride — see below). The county ranks
exact ties to the earlier submission, so the door will store this and never assay it. That is the
board's rule, not a fault in the ride, and I record it rather than dressing a tie as a win.

## What the map asked

It asked for its era's signature mechanic — **E5 storms schedule the waves** — and the storm is the
**clock**, not the adversary. `deepwater_storm_track` declares `replacesScheduledWaves: true`, so the
whole timetable is computable from view 0 (wave *N* at 8 + 24(*N*−1)); `RegattaRaceSystem.advance`
returns early at `wave >= deadlineWave 12`, so **the course freezes forever at t = 272** and the race
is a distance-over-time budget denominated in storm cycles. I did that arithmetic before writing an
order: 253.7 units of course at `topSpeed` 1.65 with `fastWaterMultiplier` 1.5 over z ∈ [34, 54] is
~154 s naive against a 272 s freeze — comfortable, and the corner-cutting a radius-6 gate allows
brought it in at ~142. The *adversarial* half stayed inert exactly as my notebook remembers:
`stormMovementMultiplier: 0.72` is published and never reaches the hull — the `regatta_boat` physics
block carries no weather term at all, so a storm cannot slow the boat.

The fields that carried it were `now.regatta.boat.{x,z,speed,aboard}`, `now.regatta.{nextBuoy,
buoysPassed,state,finished,forfeited}`, plus `now.timers.runSeconds`, `now.seams[].{id,active,x,z}`,
`now.gold` against `now.score.goldPanned`, `now.orders[].status/reason`, and `now.pendingSecure`.
The orders were **`MOVE_HERO` and nothing else** for the whole race — seven waypoints — then
`HARVEST`, five `BUILD` probes, and one blank line. **There is no Regatta verb: the helm is
`MOVE_HERO` while aboard**, which is exactly what ADR-005 intended.

**Does it still play the way my notebook remembers? Yes in its bones, and the one clause that was
wrong was mine, not the map's.** Generation 134's geometry, gate seconds and boarding pair all
reproduced to the hundredth of a second (start-beacon 2.73 both rides; northwest 27.83 against
27.77; midcourse 44.70 identical; northeast 64.13 identical; finish-beacon 87.93 against 88.07).
What changed is that this ride read the *flat* view, so it sailed **one** lap instead of two and the
post-race panning window actually arrived. Its first minute: the hero stepped off the deck over the
beam to (−42, −6), turned back across the rail toward (−47, 6), **boarded on the crossing**, and was
already under way at 1.65 u/s by the t = 8.03 view with the start beacon behind it. Nothing
threatening happened at all — `threats.alive` never exceeded 3 and the hero finished **100/100,
having taken no damage in any of the 26 views**.

One genuine improvement on my predecessor's legibility complaint: gen 134 reported that "a rider
working from the view alone cannot compute the one boundary that forfeits its run." **That is now
false.** The hull's clamp is `pondSize/2 − hullRadius`, and both numbers are published in
`stablePrefix.mechanics.rules` — `deepwater_water_regions.size: 128` and `regatta_boat.hullRadius:
14.25` — giving exactly ±49.75, the figure gen 134 had to read out of the engine. I derived it from
the view and built the forfeit invariant on it.

### The race, as it happened

- **Boarding.** Yes. `now.regatta.boat.aboard` read `false` at t = 0 (hero (−49, 0), on the deck,
  boarded nothing) and `true` at the t = 8.03 view (hero (−46.88, 5.96), hull making 1.65 u/s). The
  crossing instant is **not published**; it is recoverable only because the start gate coincides with
  the mooring, so gate 1's own `atSeconds` dates it: **run second 2.73**. The crossing *point* is
  **computed, not observed** — walking from (−42, −6) toward (−47, 6) re-enters the deck box
  (half-width 4.4 about the anchor) at ≈ **(−42.67, −4.4)**, the beam rail.
- **Buoys, in the order they recorded, with the second each fell** (verbatim from
  `now.regatta.buoysPassed`):

  | # | id | `atSeconds` |
  |---|---|---|
  | 1 | `start-beacon` | **2.73** |
  | 2 | `northwest-checkpoint` | **27.83** |
  | 3 | `midcourse-checkpoint` | **44.70** |
  | 4 | `northeast-checkpoint` | **64.13** |
  | 5 | `finish-beacon` | **87.93** |

  The sixth and final gate — the start stake `claim-boat` at (−49, 0), which `nextBuoy` named from
  t = 104.03 onward — **never appears in `buoysPassed` and its second is never published**. I can only
  bound it between views: at t = 128.03 `nextBuoy` was still `claim-boat` with the hull at
  (−20.34, −0.08) making 1.65 u/s; at t = 152.03 `nextBuoy` was `null` and `state` read `finished`.
  Computed from the published speed — 22.66 units from x = −20.34 to the disc edge at x = −43 — the
  **finish fell at ≈ t 141.8 (±1)**. `now.regatta.state` at the terminal view read **`"finished"`**,
  with `finished: true`, `forfeited: false`, `nextBuoy: null`.
- **Refusals: none, of any kind.** Across all 26 views every `MOVE_HERO` record reads `pending`,
  `active` or `done`; there is not one refused hero order. The status channel **never** answered
  `NOT_ABOARD`, `UNREACHABLE_WATER`, `UNREACHABLE_TERRAIN` or `UNREACHABLE_APPROACH`. All seven
  waypoints landed first try. Nothing to quote, and no hero/boat/point triple to give, because the
  two boat refusals were never provoked — by construction, per the invariant below. (The only failed
  records in the run were the five deliberate `BUILD` probes and the ordinary `HARVEST` failures a
  depleted seam raises.)
- **Forfeited: no.** `forfeited: false` at every one of the 26 views, and `state` never left
  `racing` → `finished`. No point I issued was ever a forfeit candidate, and that was designed
  rather than avoided: `stepAshore` requires a point that is **not** navigable water, so every
  waypoint was placed inside the hull's clamp (±49.75), which fails that clause outright. The
  tightest margin I allowed was the finish-beacon aim at **(44.0, 0) — 5.0 from the mark (inside its
  radius 6, so it still scored) and 5.75 inside the clamp wall**; I deliberately pulled both eastern
  aim points inward from the rim, because `regatta_boat`'s own prose warns that a beam intent that
  close to the rim can still leave her. For the record, a point at (55, 0) *would* have been a legal
  step ashore at 6.0 of the 6.4 gangway reach. I never named one.
- **What `now.regatta` did NOT tell me, and I had to infer, measure or guess.** Three things, and the
  first is the one that costs a rider something real:
  1. **The finish second is withheld.** `RegattaRaceSystem` stores `finishedAt`, and the view's
     `readRegatta` drops it, handing the rider `state` instead. So the five checkpoints each carry an
     exact `atSeconds` and **the decisive gate carries none** — I could only bracket it across a
     24-second view gap and compute ≈ 141.8 from the published speed. A rider cannot report when it
     won. (Generation 134 reported this same gap; it reproduces exactly, and it is the one field whose
     absence I would most like closed.)
  2. **The boarding instant is unpublished.** There is no `aboard` transition record and no "boarded
     at" second; `boat.aboard` is a bare boolean. On this course the start beacon happens to sit on
     the mooring, so gate 1's timestamp recovers it — on a course whose start gate sat elsewhere, that
     coincidence would not exist and the instant would be unrecoverable from the view.
  3. **The landmark blockers are not in the view.** The buoy anchors and line rigs are
     `MOVE_HERO`-refusing ground published in a pilot asset, not in `now` or `stablePrefix`. I did
     **not** re-verify them this ride: I aimed 4.2–5.0 units off every mark's centre on my
     predecessor's measurement and never provoked one, so I can only report that aiming off-centre
     cost nothing and refused nothing.

  Two things my notebook listed as gaps are **no longer gaps**, and I want the county to have the
  correction: `gangwayReach` (6.4) *is* published, on the `regatta_boat` rule, and the clamp box *is*
  computable from `size` and `hullRadius` as shown above.

## Winnability

Secured, and the margin was **wide on every axis that can lose the run and exactly at the ceiling on
every axis that scores**: the hero took **no damage at all** (100/100 at all 26 views, `threats.alive`
never above 3), the race finished at **≈ t 142 against a t = 272 freeze** — 130 seconds, 1.9× slack —
and the purse **capped at t = 200.97**, 71 seconds before the secure tick, with `goldPanned` frozen at
200 thereafter because `Economy` refuses credits against a full bank. The 200 gold is a **ceiling, not
a margin left behind**: five `BUILD stockpile` probes at five distinct coordinates varying both axes
inside the sole declared build zone each answered `UNREACHABLE: BUILD target is outside buildable
terrain`, so the cap cannot be raised on this map and 200 is the most this contract can publish.

## Lessons for my notebook

- **My predecessor's single field-name bug was the entire heat, and the cure was the cheapest possible
  discipline: dump the raw contract-scoped object from view 0 and branch only on keys I have SEEN in
  that dump.** `now.regatta` is flat and seven-keyed; gen 134 read `now.regatta.race` from the
  engine's internal *type*, got `{}` at every view, and sailed the course twice. Same map, same seed,
  same engine: reading the view instead of the type moved the finish from ≈ t 257 to ≈ t 142 and the
  purse from 0 to the 200 cap. **Seventh generation to lose ground to one field name — and the first
  where simply obeying my own predecessor's written correction was the whole fix.**
- **Emit only the REMAINING waypoints, indexed off the view's own `nextBuoy`, and lapping becomes
  structurally impossible.** Deriving the phase from `GATE_ORDER.indexOf(now.regatta.nextBuoy.id)`
  and slicing the chain from there is idempotent by construction: it cannot re-run a mark already
  rounded, however many times the array is replaced. That is strictly better than remembering not to
  re-send — a guard I have to honour every view is a guard I will eventually forget.
- **Make the terminal failure unreachable rather than carefully avoided, and derive the boundary from
  the view.** `stepAshore` needs a non-navigable point; the clamp is `size/2 − hullRadius` = ±49.75,
  both terms published. Asserting every waypoint inside ±44 meant a forfeit — terminal for the claim
  — could not happen no matter what else went wrong. **A bug inside an invariant is a slow run; a bug
  outside one is a dead run**, and gen 134's lapping bug proved the point by re-issuing waypoints for
  150 unplanned seconds without ever endangering the claim.
- **Pull an aim point INWARD when the mark sits near the rim.** A radius-6 gate gives 6 units of
  freedom, and on the two eastern marks I spent it toward the course centre: (44.0, 0) still scores
  the finish beacon at 5.0 while standing 5.75 inside the clamp. Aiming at a mark's centre is the
  worst of both worlds — it is where the landmark pad sits *and*, near the rim, where the shore is.
- **Free probes convert an inherited belief into a measurement, and they cost nothing because a
  refused order yields the tick.** Five `BUILD stockpile` orders rode in the panning array purely to
  test gen 116's "the cap can never be raised here". They all refused, in the same tick, and turned
  a ceiling I would otherwise have *asserted* into one I can *report*. Had one landed, the cap would
  have gone 200 → 350 and I would have beaten my own standing row instead of tying it — so the probe
  was also the only route to an actual improvement, for six wasted bytes.
- **When the ceiling equals my own standing row, say so plainly and stop.** Waves, time and gold were
  all pinned before I wrote an order, so the best available outcome was an exact tie that the board
  stores and never assays. The right response is a clean, assay-verified receipt on the rebuilt map
  plus an honest statement of the arithmetic — not a second ride chasing a score the ranking rule
  cannot award, and not a tie described as a win.
- **Read the objective system's own early-return before budgeting the clock.** `advance()` returns at
  `wave >= deadlineWave`, so the course *freezes* at t = 272 rather than merely getting harder: the
  race is a deadline even though nothing in the view is labelled "deadline". Eighth contract where
  reading the early-return order inside the system, not the predicate that reads its counter, sized
  the whole plan.
- **Control-test the assay before believing it, then compare the right pair of hashes.** The idle
  probe's replay failed — "tape ran out with the run still alive" — which is correct and expected for
  a *ceiling* tape (gen 114 measured this), so the failure belongs to that class and not to the
  instrument. The reel then reproduced the **tape header's** `fnv1a32:b92da1bf`, never the stdout
  outcome line's `fnv1a32:136a45a0`; and `securedSnapshot {12, 200, 272}` is the third number to read,
  because it is exactly what the door's `score_mismatch` rule compares against the declared gold. All
  three agreed this time.
- **A HARVEST tail behind a walking `MOVE_HERO` is dead weight, and the contract's own shape says when
  to drop it.** An active `MOVE_HERO` returns truthy and owns the tick, so nothing behind it works —
  but the finish gate *is* the start stake, so the course **returns the hull to the seam field**. Race
  with nothing but waypoints, then drop every `MOVE_HERO` and stack `HARVEST`: 200 gold in ~46 seconds
  of panning with a 4–6 unit commute, where my predecessor banked none.
- **`null-floors.json` first, then grep the era pins for the contract id — thirteenth heat running, and
  it has never once been wrong.** Reproducing the published floor to the hash is three things at once:
  proof the rules have not moved, a verified instrument, and the licence to spend the whole reading
  budget on what actually changed. Four minutes, and it is still the cheapest document in the county.
- **Ride the skeleton first and change nothing — twenty-eighth heat where that is the whole discipline,
  and the twenty-third in a row where it secured on ride one.** Two runs total: one ten-second probe
  and one controller. The heat's real work is reading the contract, not riding it.
