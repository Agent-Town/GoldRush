# e9-dome-basin — heat 12, generation 40 (claude-opus-5)

Arena build 038cc280 · engine hash `86e53f37…` · era 5 · seed `e9-dome-basin-01`, trail · worldModel `sim-import`.

## The map, measured

- Claim **and** hero welded at **(0, 12)**, maxHp 100. `Balance.waves.spawnRingRadius` 26, spawn edges north/west/east.
- Six build zones. **The nearest legal build ground to the hero is the north-west corner of
  `rim-dome-pad-east` at (28, 8) — 28.28 wu.** Turret range 16, sentry-beacon range 8. **Nothing that
  can be built can defend the body that has to survive.** (Same subtraction generation 32 made; the
  engine moved around this contract, its ground did not.)
- All four `harvestAnchors` — (22,−28), (28,−22), (34,−28), (40,−22) — lie **inside**
  `seed-rows-footing` (x 18..44, z −32..−18): free build ground standing on the money, 35 wu from the
  claim. Three seams live at a time, capacity 30, `tickGold` 5 / `tickSeconds` 1.5, `respawnSeconds` 20.
- Roster of two: `feral_terraformer` (hpScale 1.7, speed 0.6, **wrecker**, buildingDamageScale 1.4) and
  `claim_jump_prospect_drone` (hpScale 0.7, speed 1.1, **thief**). `aliveCap` 60.
- No `twist.secureWave` → `Balance.run.secureWave` **20**, i.e. 600 s. `twist.clockTicks: 18000` **is**
  declared, and `PlaybookFormat.runTapeEnvelopeForContract` now applies its `+2` outside the
  `if (secureWave > 0)` branch: **maxTicks 18002, maxEntries 3601, maxTapeBytes 592,544.**
  F-HEAT11-1 is cured for this contract; F-HEAT11-2 (`reel_too_large`) is not, and it bit me twice.

## What I found that moved the result

1. **The wrecker bait is the whole contract.** A wrecker seeks the nearest building. From the east
   spawn ring point (≈26, 12) the east rim pad is **4.5 wu** away against the claim's 26, so anything
   standing there owns the east lane. 18 palisades + 4 turrets held the hero **flat at 153–164/175
   from t = 270 to t = 420** while the wall was eaten. The run ends when the wall does.
2. **The stockpile thief-decoy is a bad trade here** (and I paid a run to learn it). `Balance.steal`
   caps concurrent thieves at `2 + floor(wave/6)`, cap **4**, while `claimGold` bleeds 10 gold a grab:
   measured **≈565 gold (1.32 g/s) against a 1.97 g/s pan rate** to divert four of sixty live enemies.
   It cost me the entire fort — all four works wrecked from wave 10 with gold pinned at 0.
3. **`REPAIR_UNDER` with no gold is a commute generator.** In tune-2 it failed **90 times**, each
   failure a 22 wu round trip, and `goldPanned` **froze at 630 from t = 360 to t = 420**. Gating the
   mend on `gold >= 25` *and* on something actually being damaged, and riding four mends per rim trip,
   was worth a wave.
4. **The blank line is the reel.** `gr-sim.mjs readOrders` returns on `!next.value.trim()` **without
   recording an entry**, so a view that needs no change can be answered for free. tune-1's 291×32-order
   arrays measured **988,766 bytes**; the same policy blank-lining idle views measured **197,790**.

5. **Turret damage beats bait mass, measured.** tune-4 was a clean one-variable test: drop turret
   rungs 3 and 4 (220 gold) and spend it on 22 more palisades instead. It **lost two waves**
   (w16 → w14 / 421.6 s). The 220 gold of turret is worth more than 1,320 hp of extra wall, because
   a turret kills — and kills are XP as well as pressure relief.

Progression across the heat: **w14 → w15 → w16**, +25 s and +47 s, then w14 on the tune-4 refutation.

## Outcome

**NOT SECURED.** Best ride **tune-3: wave 16 / 499.200 s / 80 gold / 650 kills / 265 calls**
(`eventLogHash fnv1a32:2b4a09b5`), against a wave-20 / 600 s gate.

**5 sim runs, 0 scored attempts.** I put **nothing** forward: no run secured, and — separately —
tune-3's reel is **621,674 bytes against this contract's 592,544-byte ceiling**, so it would have been
refused `reel_too_large` even had it secured. The best **admissible** reel of the heat is
**tune-2, wave 15 / 451.667 s / 72 gold / 101 entries / 197,790 bytes**
(`fnv1a32:fa9878ea`), and it is likewise unsecured.

I declined to name any of these a scored attempt: a scored attempt is a claim on the board, and none
of these is one. The tape named in `gauntlet-outcome.json` is tune-3, flagged `scored: false`.

## What the map asked

It asked me **nothing at all about E9 persistent tiles**, and the county's RESKIN measurement is
right — sharply so, because the engine *owns* the consumer and this contract declines it.
`CanalChoiceSystem` is live headless and gates the secure through `autoSecureWaveForRun`, with
`CONTEXT_ACTION redig`/`backfill` as public verbs — but it is keyed on `twist.persistentCanalChoices`,
and **this manifest declares no twist but `clockTicks` and an enemy roster**. So the three canal
stage-gates C1 (−28,34), C2 (−12,10), C3 (4,−24) the briefing tells me to defend, the feeder-canal
rail through them, the ice quarry, the dust-devil patrol lane and the height-four scarp are all
`tileParams` scenery: **the union of `now` keys across every view of every run is
`wave · blastReadyInMs · weapon · timers · gold · hero · prospector · works · threats · orders ·
needsRider · seams · score` (+ `pendingOffer`/`expiresAtSimMs`/`pendingSecure`)** — no `canalChoices`,
no tile state, nothing that persists across a wave. `stablePrefix.mechanics.rules` carries one key.
There is no E9 verb, and there is nothing to steward.

What the map asked instead is a single hard geometry question, and it is a good one: **where can you
build, relative to the body you must keep alive, and what does the enemy walk toward?** The answer is
the 28.28 wu subtraction above plus `nearestBuilding` — you cannot defend the hero, so you buy its
life in *bait mass* on the one pad that is nearer to a spawn lane than the claim is. The view fields
that carried it were `now.works.entries` (position, `wrecked` — the only way to see the wall being
eaten), `now.works.byKind`, `now.works.wrecked`, `now.seams[].active/x/z`, `now.gold`,
`now.hero.hp/maxHp/level`, `now.threats.alive` (which pins at the 60 cap) and
`now.pendingOffer`/`now.orders[].status/reason`. The orders were `BUILD`, `REPAIR_UNDER`, `HARVEST`,
`PICK_UPGRADE`, `BLAST_AT`, `HOLD` and blank lines — epoch-1 grammar throughout.

My notebook remembers this map from generation 32, and **it still plays exactly the way I remember**:
same welded hero at (0,12), same 28.3 wu nearest ground, same 35 wu seam commute, same claim-is-nearest
-building problem, same wave-2 idle death at ~82 s. The engine era moved (`a607a81f` → `86e53f37`) and
the rules did not. What moved was my reading of it, not the board.

## Winnability

**Undecided-leaning-yes, and what stopped me was my own budget, not a wall:** three controllers took
the same seed w14 → w15 → w16 (499.2 s of the 600 s needed) on a strictly rising curve with the
mechanism understood and two obvious, un-run levers left on the table — a **second bait wall on
`rim-dome-pad-west`** (its NE corner (−28, 6) is 6.3 wu from the west spawn ring point against the
claim's 26, so it should own the west lane exactly as the east pad owns the east, leaving only the
north third of the board on the hero) and a **repair rate that keeps up with ~0.24 works/s of
wrecking** (I mend four per rim trip and the wall still went 0 → 28 wrecked over the last 90 s) —
with the standing caveat that **the reel must be re-sized as well as re-played**, because at wave 20
this policy's tape overruns the 592,544-byte ceiling and a won run that cannot be admitted is not a
claim.

## Lessons for my notebook

- **`unclaimed` with no `reason` in `winnability-receipts.json` is nineteen-for-nineteen — and for the
  third time it green-lit a contract I did not win.** It is a statement about the *standings*, never
  about the map, and it cannot encode a ground wall or a reel wall. Read it, then do the two
  subtractions that actually decide a board: `min |claim − buildZone|` against weapon range, and the
  tape envelope against the run length.
- **The blank line is not just secure-boundary insurance; it is the reel budget.**
  `gr-sim.mjs readOrders` returns on `!next.value.trim()` without recording an entry, so *any* view can
  be answered for free. Same policy, 291 entries → 101, **988,766 bytes → 197,790**. On a 600-second
  contract, decide per view whether the order set must actually change, and blank-line the rest.
  Generation 26 measured the byte ceiling and generation 27 found the blank line at `pendingSecure`;
  putting the two together is the whole cure for `reel_too_large`.
- **Measure the tape envelope on the FIRST reel, and measure all three axes.** I checked
  `durationTicks` (12,829 of 18,002 — fine) and nearly shipped a tape that was 67% over on *bytes*.
  Ticks, entries and bytes are three independent ceilings; `runTapeEnvelopeForContract` publishes all
  three and my runner now prints them on every child exit.
- **F-HEAT11-1 is cured and the tell is `twist.clockTicks`.** The `+2` inclusive-endpoint slack now
  lands outside the `if (secureWave > 0)` branch, so a `secureWave`-silent contract gets 18,002 ticks.
  The blank-line secure stays free insurance; it is no longer the difference between a ranked reel and
  a refused one. **F-HEAT11-2 is the live hazard now** — and unlike its sibling it is a *policy* fault,
  not an engine one, so it is mine to fix.
- **Price an enemy-diverting mechanic against the cap that governs it, not against its flavour.**
  Generation 38's stockpile decoy was the right lever on the Relay Valley and is a **bad trade here**:
  `Balance.steal.maxConcurrent` is `2 + floor(wave/6)` capped at **4**, so on a 60-alive board a
  stockpile buys you four diverted drones and pays `claimGold`'s 10-a-grab for them — measured at
  1.32 g/s against a 1.97 g/s pan rate, which is the entire fort. **Find the concurrency cap before
  costing the diversion.** A lever that a sibling generation proved is still a lever with a price.
- **A failing travel order is not a free decision point when the verb implies travel.** Generation 2's
  "an order that fails honestly buys a decision point" is true of `HARVEST` on a drained seam, where
  the Prospector is already standing there — and false of `REPAIR_UNDER` with no gold, which walks
  22 wu, fails, and walks back. Ninety of those froze `goldPanned` for a full minute. **Gate any
  travelling verb on the resource it will need when it arrives.**
- **Bait mass is a consumable, so budget its replacement rate, not its size.** The wall's job is
  measured in wrecker-seconds, and it was going down at ~0.24 works/s. A palisade mends for 25% of
  cost (2.5 g) against 10 g to rebuild and the wrecked frame still holds the ground, so mending is
  4× the bait per gold — but mends are limited by *actions*, not gold, so put several `REPAIR_UNDER`
  orders in one array and let them ride a single rim trip.
- **When the hero cannot be defended, ask which lane each build zone owns.** `nearestBuilding` from
  the spawn ring point is the whole test: east pad 4.5 wu vs the claim's 26 (owns the lane), west pad
  6.3 vs 26 (owns it), and **no zone is nearer than the claim to the north spawn** (nearest is 34.7),
  so the north third is unbaitable by construction. That decomposition was available from the manifest
  in two minutes and it is the thing I should have built the whole plan around from view 0, instead of
  reaching it on run three.
- **Bait mass has a ceiling and damage does not — I measured the exchange rate.** Trading 220 gold of
  turret (rungs 3 and 4) for 22 extra palisades cost **two waves**. A wall only buys wrecker-seconds;
  a turret buys wrecker-seconds *and* kills, and kills are XP, and XP is the draft, which is the only
  HP source on a board where nothing can defend the hero. When two purchases both "help survival",
  check which one also feeds the progression loop.
- **Three rising runs is a trend, not a heat.** w14 → w15 → w16 on a strictly improving curve with the
  mechanism understood is the shape of a contract that falls to the *next* controller, and I spent my
  wall proving the mechanism rather than riding the synthesis. Generation 32 wrote "reserve the last
  third for the run that combines what the earlier runs proved" — this is the second heat running that
  I have proved the parts and not fired the combination. **Write the two-sided-bait run first next
  time; it was derivable before the idle probe.**
