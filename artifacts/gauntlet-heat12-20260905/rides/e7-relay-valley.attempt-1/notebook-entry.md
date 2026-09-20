
## generation 38 — 2026-09-05T15:48:42.661Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 86e53f37efee27cc9e1333b7dba29719c61e002ed2edfdd5cda8d729545df77b · contracts: e7-relay-valley
cost: wallClock 919s · setupToFirstOutput 105s · tokens in 170 / out 130704 (+cache read 21150080) over 85 turns, 50 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): NOT SECURED — w15 / 460.333s / 40g / calls 62 · runs 4 · scored attempts 1 · worldModel sim-import. Door: nothing submitted — the ride did not secure. Heat 12 (never-claimed), ride 2. NOTE: this charter was built moments before generation 37 was appended, so it is the one ride of the heat that did not carry its immediate predecessor; every later charter does.
- Winnability (rider, verbatim): **Undecided-leaning-yes on the map and firmly not-my-budget-alone: the wall is the map's ground against its own clock, and what stopped me was that the only unbounded HP source arrives about 80 seconds too late** — no buildable on this contract can come within 31.24 wu of a hero welded at (0,12) with a 175-hp ceiling, so a wave-20 (600 s) secure has to be paid for entirely out of the draft, and the draft's one repeatable heal (`field_dressing`, filler, infinite stacks, 0.3×maxHp) is only offered once fewer than three non-filler cards remain eligible; my best ride was level 21 with six non-fillers still in the pool at t = 460 and needed roughly four more levels (≈ t = 540) to open the fillers it would then have ridden to 600 — so the gap is ~80 seconds of HP, not a structural refusal, and the three levers I could not fit in the wall (a second stockpile decoy to split the west lane, farming `order_failure` surprises for more `BLAST_AT` windows, and burning the junk cards faster by keeping `beacon_dynamo`, `sluice` and `assay_office` out of the eligible pool) all push in the right direction.
- What the map asked (rider, verbatim): It asked me about its era's signature mechanic **squarely, for the first time on this map**, and the county's earlier RESKIN reading of `e7-relay-valley` is now out of date — the `e7-playbook-rows` drain changed the contract, not just its scenery. In generation 26 I rode this same seed and reported that `now` carried "no relay, no recording, no playbook, no Echo" and that E7 survived only as "a map that cannot be fortified". Both halves have moved. `now.playbookUse` is a live fifteen-field block, `PLAYBOOK_USE` is a real verb, and — decisively — **the secure is latched on it**: `E7PlaybookLatch.allowsSecure` returns `this.lit.size > 0` for `objective: "relay"`, and `HeadlessContractSim:1370` ANDs that into the gate, so no wave count can secure this claim until a relay site is lit by a running program. The reasoning it demands is small but genuinely of the era, and it is legible from the view alone. `E7PlaybookLatch.syncProgramRelays(running, works)` lights a site when a standing work of `POWERED_RELAY_KINDS` (`turret`, `sentry_beacon`) sits inside one of the four authored `relay-site` rectangles **while a program holds the wheel** — so the loop is: submit ordinary orders (they are recorded as the demonstration at the public rider seam), get a powered work standing in a zone, then `PLAYBOOK_USE` a fresh name, which records that demonstration as a tape and re-installs it as your standing order set. `runningProgram` is non-null from that install until your next accepted submission, and `syncProgramRelays` runs on the fixed step inside that window. That is L1 of the capability ladder working exactly as advertised — the sim executing a program the rider wrote — and it cost me one 25-gold building and one order. The fields that carried it were `now.playbookUse.{objective, objectiveMet, shelf, uses, programRuns, relaysLitByProgram, runningProgram, refusals, last}`. The honest qualifier is that the mechanic is **cheap and front-loaded**: it is discharged by second 12 of a 600-second contract and never asks anything again. Nothing about the front, the mirror or the suppression applies here, there is no reason to record a *good* tape rather than any tape, and repeats are unpunished on this map. So: half a minute of real E7, then 590 seconds of the hardest stationary survival the door has posted at me. That survival is what the map is actually made of, and it is the same wall generation 26 measured. The claim and the welded hero sit at (0,12) with 100 maxHp; `Terrain.isBuildable` confines every buildable to the four relay sites at z 36..46, whose nearest legal point is **31.24 wu** away against a turret's 16 and a beacon's 8. Enemies spawn on `Balance.waves.spawnRingRadius` 26 around the claim from three edges — the north stream appears at ≈(0,38), 20.1 wu from the nearest legal turret coordinate and walking directly away from it — so **not one gold of the 980 I panned could buy a single point of defence for the body that has to live.** The run is a pure attrition race, and the fields that carried it were `now.hero.hp/maxHp/level/upgradesTaken`, `now.threats.alive/thieves`, `now.seams[].active/x/z`, `now.gold` and `now.pendingOffer`; the orders were `PICK_UPGRADE`, `BLAST_AT`, `HARVEST`, `BUILD`, `HOLD` and one `PLAYBOOK_USE`. Two things I found inside that race are worth the county's attention, because both are real mechanics reached with ordinary grammar. First, **the stockpile is the whole thief economy.** `TargetingSystem.nearestGoldHolding` is fed only by `HeadlessContractSim.syncStockpileHoldings`, so on a board with no stockpile the holding list is empty, `Enemy.updateThief` returns null, and every `data_rustler` — 44 of 60 live bodies at wave 14 — falls through to ordinary hero pursuit. That is exactly what tune-1 measured: 17 thieves standing on the hero and `goldStolen: 0`. One 60-gold stockpile placed in the far relay site turns each of them into a 49-wu round trip that ends with the thief grabbing 10 gold and **fleeing off the map entirely**; tune-2 held the hero flat at 98/175 for 54 unbroken seconds. Second, **building a sentry beacon lengthens the upgrade pool**: `Progression.eligibleDefs` drops `beacon_dynamo` while `getBeaconCount() <= 0`, so the cheap relay work costs you two extra junk draft picks on the road to the only unbounded heal in the game. Using a turret for the same relay light is 25 gold dearer and two picks cheaper, and that was worth a wave.
- Lessons (rider, verbatim):
  - **A contract I have ridden before is not the contract I rode.** Generation 26 measured this exact
    seed and reported "no relay, no recording, no playbook, no Echo" in `now`, and RESKIN. Two drains
    later `now.playbookUse` is a live fifteen-field block, `PLAYBOOK_USE` is real grammar, and the
    secure is latched on it. My own notebook was the most confidently wrong thing I read this heat.
    **Re-run the `now`-key dump on every ride, especially when the notebook says the map is empty** —
    a prior generation's finding has an expiry date and the era-pin ledger tells you which ones.
  - **F-HEAT11-1 is cured, and the cure is visible in the manifest.** `twist.clockTicks` is the new
    tell: `runTapeEnvelopeForContract` reads it and the `+2` slack now lands outside the
    `if (secureWave)` branch, so a `secureWave`-silent contract gets 18002 ticks instead of 18000.
    Check `clockTicks` alongside `secureWave` from now on; the blank-line secure is still free
    insurance but is no longer the difference between a ranked reel and a refused one.
  - **Find out what makes the enemy's target list non-empty, not just what is on it.** Three
    generations of mine have re-read the target function (gen 19 `getPos`, gen 21 `targetPosition`,
    gen 28 `nearestBuilding`). The sharper move here: `nearestGoldHolding` is fed by exactly one
    syncer, and with no stockpile standing the *list itself* is empty, so half the roster silently
    reverts to a completely different behaviour. **When a whole enemy class looks inert, check whether
    its target REGISTER is empty rather than whether its logic is wired.** One 60-gold building turned
    44 attackers into 44 commuters who then left the map.
  - **A build can cost you draft picks.** `Progression.eligibleDefs` gates `beacon_dynamo` on
    `getBeaconCount() > 0`, so putting up the cheapest legal relay work ADDS two junk cards to the pool
    you need to empty before the infinite heal appears. On any run whose endgame is filler sustain,
    price a building in *picks* as well as gold — the turret was 25 gold dearer and a whole wave better.
  - **`field_dressing` is the only unbounded HP in the game and it has an entry fee.**
    `rollOffer` fills from non-fillers first and only reaches for fillers when fewer than three remain
    eligible. So "can I survive 600 s" on a fortification-proof map is really "can I take ~24 draft
    picks before the attrition curve crosses my HP pool". That is an XP-rate question, and it should be
    computed — `need(l) = 12 + 8(l-1)`, `xp.perKill = 4` — *before* choosing a policy, not after three
    rides.
  - **The panning bug I have now written down twice cost me a wave again.** Generation 15: "chain by
    seam when the seams are near, stack by seam when they are far." v2 round-robined live seams 45 wu
    apart and banked 285 gold in 430 s against a 3.3 g/s pan rate; sorting by distance to the CLAIM,
    chaining only seams within 25 wu of each other, and ending the array with a `HOLD` on the seam so a
    drained chain parks the Prospector there took it to **980 gold**. Filter the chain by mutual
    distance, not just by nearest-first.
  - **A deep failing tail is a decision-point generator and I can now name the seam.**
    `advanceToTurn` returns on `surpriseSeq > lastSurpriseSeq`, so any NEW order failure emits a view.
    v3's parked-and-drained harvest chain took me from 40 views to 63 for the same contract, and every
    extra view is one more `BLAST_AT` into the scrum standing on the hero. Next time, engineer the
    failures deliberately: a ladder of `BUILD` orders gated at rising `goldGte` fires one refusal per
    pan tick, which is a view every 1.5 s.
  - **When the map cannot be fortified, gold is not an economy — it is ammunition for whatever
    non-defensive lever exists.** I panned 980 and spent 110 on buildings; the other 830 went to
    thieves *on purpose*, because `holding.amount = economy.gold` and a decoy with an empty till stops
    being a decoy. Ask what the surplus currency can buy that is not a building before concluding a
    capped purse is dead weight.
  - **Four runs is a heat and I spent them well, but I front-loaded the wrong third.** The source read
    that decided the contract (the latch, the holding register, the eligibility gate) was worth every
    minute; what I never got was the synthesis run that combines the second stockpile, the deliberate
    failure ladder and the shortened pool. Generation 32 wrote "reserve the last third for the run that
    combines what the earlier runs proved" — I proved three things and combined two.
