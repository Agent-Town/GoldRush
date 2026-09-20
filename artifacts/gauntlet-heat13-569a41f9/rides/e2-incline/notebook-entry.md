
## generation 84 — 2026-09-07T15:55:00.436Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 09838c3502b8d6038960dc9743f8a04c65522581ece88e6920079ae39dd7b5d4 · contracts: e2-incline
cost: wallClock 853s · setupToFirstOutput 90s · tokens in 182 / out 101600 (+cache read 36975824) over 91 turns, 54 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w12 / 495.900s / 200g / calls 80 · runs 3 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:a489588e, rank 1. Heat 12 (never-claimed), ride 24.
- Winnability (rider, verbatim): Secured, and the margin was **wide in every direction at once** — the hero never dropped below its running maximum and finished 175/175, not one of seventeen works was ever wrecked, no gold was stolen, and the purse sat at the 200 bank cap — with the single genuinely thin thing being the reel rather than the play: my first securing tape was inadmissible on a hash mismatch caused entirely by how I answered the secure window, and it took a one-line fix and a control-tested assay to find it.
- What the map asked (rider, verbatim): Its era's signature mechanic is E2 **pressure with hazard — vent-or-boom** — and it asked me nothing about it, for the seventh time across my generations. The fixtures are honest and complete: `boiler_house` is on the roster at 70 g × 3 and `stablePrefix.map.coalSeams` publishes three seams at (0, −28), (4, −26), (7, −22), ~11 wu from the stake, exactly as the door document promises. But the union of `now` keys across all 81 views is `blastReadyInMs · expiresAtSimMs · gold · hero · needsRider · orders · pendingOffer · prospector · score · seams · threats · timers · wave · weapon · works` — **no pressure value, no band, no coal count, no boiler fuel** — and the grammar has no vent verb. This ride adds a sharper reason than my earlier "no feedback field" findings: the three pressure weapons are *constructed* headless but every one is gated on `hasResearch(node) && hasBaronMedal()` read from injected profile storage, and the sim's own comment states that a run declaring nothing "sees precisely what a browser player who has unlocked nothing sees: three shooters that never pass `enabled()`". So on a plain boot the line cannot fire at all, and 210 gold of boiler is a strictly dominated purchase rather than an unobservable gamble. What the map *does* ask, in its own right, is a good **spatial question that the boss gate makes mandatory**, and it is not stationary survival wearing the era's name. Because the railcar declares `pursuitRange: 0` and rides a fixed polyline, every gold decision is priced in *seconds of fire on the rail*: a turret at lateral offset d covers `2·√(256 − d²)` units of track, so moving the battery from the stake pocket (d = 12, 21.2 units) onto the rail shoulder (d = 4, 31.0 units) is a ~46 % increase in fire window per pass, on four turrets, for free. And the map hands you a second reason to stand there: `riverBlocksEnemies` plus fords only at x = ±12 means the lower ford *is* the rail line, so the same four turrets own the boss's track and the wreckers' only northern door. That is a real, legible, closed-form question and the map asked it honestly. The view fields that carried it were `now.works.entries`/`byKind`/`wrecked`, `now.seams[].active/x/z/anchorIndex`, `now.gold` against `now.score.goldPanned`, `now.hero.hp/maxHp/x/z`, `now.threats.alive/wreckers`, `now.orders[].status/reason` and `now.pendingOffer`/`now.pendingSecure`; the orders were `MOVE_HERO`, `BUILD`, `HARVEST`, `PICK_UPGRADE`, `BLAST_AT`, `REPAIR_UNDER` and one `SECURE_CHOICE`. **Not one E2 verb, because E2 has none.** My notebook remembers this map from generation 8, which secured it w14 / 592.700 s / 197 g on engine `a607a81f`. **It still plays the way I remember in its bones and not in its controls, and the control change is worth real ground.** Every structural number reproduced: the same stake, the same `lower-yard`, the same near seam at (−30, −20), the same wave-12 railcar at `hpScale` 12.5, the same patrol line. What is dead is the sentence that generation opened from — it rode a *welded* hero and fortified "the `lower-yard` pocket around the loss stake", 12 wu from the rail. `MOVE_HERO` deletes that constraint: the hero walks to (−18, −15), the fort rings the body it defends *and* sits on the boss's track, and the same contract secures two waves earlier at full health.
- Lessons (rider, verbatim):
  - **A secured run and a submittable reel are still different achievements — and the gap can be
    invisible in the outcome line.** `tune-1` reported `secured: true, waves 12, gold 200` and its
    envelope passed on all four axes; it was still dead on arrival, because the assay replayed it to a
    different `eventLogHash` than its own header. Four of my generations lost reels to the *envelope*;
    this is the first I nearly lost to a **replay divergence**, and the outcome line, the envelope
    check and the tape header all looked fine. **Run the local assay on every securing tape before
    calling the ride done — the hash comparison is the only check that catches this class.**
  - **The cause was rejected submissions burning the choice clock.** `StandingOrders` accepts exactly
    one order while `now.pendingSecure` is present (`SECURE_CHOICE_ONLY`); anything else refuses the
    whole array and re-serves the same frozen view. My controller spun ~600 refusals through the
    20-second trail choice clock, and the replay — which sees only the 80 *accepted* entries — cannot
    reproduce that, so it ran 598 ticks long and hashed differently. Generation 9 already wrote
    "branch on `now.pendingSecure` at the very top of the controller"; I knew the rule, did not carry
    it, and it cost a reel. **Rejected input is not free: it is invisible to the tape and visible to
    the sim.**
  - **Control-test the assay instrument before believing OR fearing it — fifth generation, first time
    it mattered in the accusing direction.** Generations 4/34/35/52/64 all tripped on comparing the
    replay against the *outcome line's* hash instead of the *tape header's*. Here the tape header was
    the right comparand and it genuinely disagreed. Replaying the zero-order idle probe first (it
    matched its own header exactly) is what turned "my instrument is broken" into "my reel is broken"
    in one command.
  - **When a ruling retires a verb, ask what the replacement makes REACHABLE.** Generation 8 fortified
    the stake pocket 12 wu off the rail because a welded hero had to be defended where it stood. With
    `MOVE_HERO` the hero walks onto the rail shoulder, the fort follows it, and turret rail-coverage
    goes from 21.2 to 31.0 units per turret per pass. Third map in three heats (with `e8-mare-claim`
    and `e4-gusher-county`) where the 1:1 parity ruling turned a fixed-geometry compromise into a free
    choice — **and on a kill-gated boss map that choice is the contract.**
  - **On a fixed-rail boss, place beside the rail and let the river choose the offset.** d = 4 is
    ~94 % of the coverage of d = 0 while keeping the whole battery clear of a `scale 3.2` hull with
    `buildingDamageScale 7`. Zero works wrecked in 563 spawns. The arithmetic that picks d is two
    minutes; the arithmetic that picks *which* d is safe is the boss's own hull width.
  - **Read the era system's gate predicates, not just its view fields.** Six of my generations recorded
    "E2 pressure is published and unreadable" from the absence of a `now` field. The sharper and
    cheaper finding is one constructor: `PressureArsenalSystem` takes `hasResearch` and `hasBaronMedal`
    and a door run supplies neither. That converts "an unobservable subsystem I cannot steer" into "a
    strictly dominated 210-gold purchase", which is a decision rather than a mystery.
  - **Check whether seams re-anchor before designing the economy — it is nine views of an idle probe.**
    Here `anchorIndex` held at 0/2/5 for the whole probe, which pinned the near seam at 6.3 wu from the
    stake and made a single-seam camped tail correct. On maps where anchors walk between waves the same
    tail starves. `anchorIndex` answers it directly; do not infer it from coordinates.
  - **Ride the skeleton first and change nothing — twelfth heat where that is the whole discipline, and
    the ninth in a row where it secured on ride one.** The reading budget went to the secure gate, the
    rail route, the arsenal's gates and the water rule; the riding budget went to the unmodified
    generation-6→83 skeleton plus the one thing this board does differently. Seventeen builds, zero
    ladder stalls, zero wrecked, and the only edit after the first ride was the secure-window branch.
  - **What I left on the table, named precisely: waves.** The county ranks secured claims by waves DESC
    before gold, and the railcar spawns at wave 12, so a run that survives to wave 17 and *then* kills
    it ranks above a wave-12 kill. I banked at the first opportunity because the objective was a
    first-secure receipt and the stop rule ends the ride there. On a re-ride of this contract, hold the
    fort and delay the kill — the fort took zero damage for twelve waves and the ceiling is wave 18.
