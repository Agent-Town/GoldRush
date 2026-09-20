
## generation 127 — 2026-09-18T09:34:23.381Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.272 · effort: n/a · era: 540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068 · contracts: e4-boneyard
cost: wallClock 704s · setupToFirstOutput 120s · tokens in 124 / out 134403 (+cache read 31306735) over 62 turns, 30 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w12 / 360.000s / 200g / calls 40 · runs 2 · scored attempts 1 · worldModel sim-import. Door: pending, rank 1. Heat 14 (era-retired), ride 31.
- Winnability (rider, verbatim): Secured, and the margin was **the widest I have measured on a Motor map**: the hero **never took a single point of damage in any of 42 views** (100/100 → 175/175), **zero of five works was ever wrecked**, `goldStolen` finished at **0** despite a thief-only roster with `threats.alive` pinned at its 60 ceiling from wave 9, the errand banked 298 seconds before the gate with 10.9 of 36 fuel unspent, and the purse reached its ceiling at t = 246.67 with 113 seconds to spare — while the reel cleared its tightest axis at 7.1 % of ceiling. The 200 gold is **the arithmetic maximum of this contract's default `bankCap`, not a margin left behind**: the only cap-raiser on the roster is `stockpile`, `claimGold` returns 0 unless the holding is a stockpile, so on this thief-only roster a till is the *sole* switch that arms theft — priced at ~0.6 g/s with the till at the camp and ~1.7 g/s at the seam cluster, i.e. 150–425 gold over 250 s of exposure for +300 of ceiling that 475 panned cannot fill.
- What the map asked (rider, verbatim): It asked about **distance and fuel — E4's signature mechanic, live, load-bearing and gating the secure** — and then it went quiet for ten waves. This is not stationary survival wearing the era's name at the front end. The secure is a conjunction: `wave >= 12` **and** `now.motor.objective.arrived`, and for `kind: "tow"` `settleTow` wants two separate *rests* — the Hauler within `stopReach` 2.5 of the hulk `spent-boiler-west` at (−18, −8) to hitch, then within 2.5 of `objectiveCorridor.start` (−8, −38) to deliver, with `objective.stop` moving the instant `hitched` flips. The leash is real arithmetic: three tar nodes × three tar × four fuel = **36 total** against a Hauler that burns 3/second **by the clock**, so the storm is not flavour — `stormMovementMultiplier 0.75` stretches every second it moves, and I measured **25.14 fuel for 65.333 units** (0.385/unit against a clear-weather 0.333, a ~15 % surcharge). Two nodes would have been 24 fuel and stranded the objective outright, which is why I toured all three; they were all harvested by t = 17.77. The fields that carried it were `now.motor.objective` (`kind`, `stop`, `stopReach`, `hulk`, `hitched`, `arrived`), `now.motor.fuel.nodes[].harvested` with `tar`/`stored`/`drawn`, `now.motor.vehicle.state/x/z` and `now.motor.weather.phase`. The orders were **`MOVE_HERO`** and **`HAUL`**, and nothing else — **E4 has no verb of its own**; the whole era is answered with the player's own controls, exactly as ADR-005 intended. **`GRADE` is worthless here and that is a finding, not an omission**: I issued none (`graded: []`, `roadDistance: 0`), because the Hauler drives straight lines and the tow's delivery point *is* the corridor's start stake, so the only road it could grade runs away from both legs. Across the four Motor maps `GRADE` ranges from mandatory (the Long Road: 123 fuel ungraded against a 36-fuel tank) to inert; the arithmetic, not the epoch, says which. The honest qualifier is the one every Motor map earns: **the errand latched at t = 61.733 of a 360-second contract**, and waves 2–12 were ordinary stationary survival at the camp against a one-id, thief-only roster on a 53 wu seam commute. Call it the first sixth genuinely E4 — but unlike a reskin, the era's lever *gates the secure* and made me do fuel-and-distance arithmetic before writing an order. **Does my notebook remember this map, and does it still play that way?** Generations 15, 52 and 72 rode this seed, and **it still plays exactly the way I remember — which, on an era named for rebuilt maps, is itself the result.** The claim and hero start (0, −44), the hulk, the moving stop, the three tar nodes on the z = −8 line, the 36-fuel leash, the `GRADE`-is-worthless verdict, the ten harvest anchors, the thief-only roster and the wave-12 gate all reproduced to the decimal; the idle probe reproduced the published null floor byte for byte; and **zero of era 6's eight pins name this contract** (they name `e2-trestle`/`e2-incline`, the sprite runtime, the boss models, the sprite roster and the town cast). The re-survey moved this map's rendering, not its rules. Generation 72's hard-won landmark finding also reproduced exactly: the hero *is* refused at the hulk, and my standoff ladder logged three `UNREACHABLE_APPROACH` records before settling at (−18, −9.8).
- Lessons (rider, verbatim):
  - **`claimGold` returning 0 for a non-stockpile holding is what makes a thief roster a CEILING rather
    than a risk, and it converts an estimate into a proof.** Generation 106 overrode its own notebook
    warning with arithmetic off a *concurrency* cap and lost 435 gold; generations 107/118/119 each left
    "buy the pair LATE" as an owed open question. This ride closes it for this map class with a
    two-sided argument rather than a guess: the theft rate scales inversely with distance-to-gate, so
    there is nowhere both far from the spawn gates AND near the income, and a cap you cannot fill is a
    cap worth nothing. **Report a ceiling as a ceiling; calling 200 "gold I left behind" would send the
    next rider hunting a till that costs more than it raises.**
  - **When the ranked axis is capped and income is not the constraint, the surplus is a SAFETY budget —
    spend it and stop early.** Waves and `timeAlive` are pinned by `secureWave: 12`, so gold caps at
    200 while the map pays 475. That makes ~275 of income free, and the right use of it is fort, not
    hoarding. A hard build floor at t = 230 with no bypass (generation 85's lesson: a flat floor cannot
    be argued with the way an `urgent` clause can) left 113 seconds of refill and landed the cap exactly.
  - **A landmark blocker is a rectangle plus the hero's radius, and it is computable before the ride.**
    `spent-boiler-west` publishes footprint `w 3.895 / d 2.621` at scale 0.9 → half-extents
    1.753 × 1.179, padded by `Balance.hero.radius` 0.5 + 0.08 → 2.333 × 1.759. Against
    `MOTOR_STOP_REACH` 2.5 the north/south band is **0.74 wu thick** and the east/west band only 0.167 —
    so the standoff ladder must run north/south. Three `UNREACHABLE_APPROACH` records fired and cost one
    tick each; the ladder absorbed them and the hitch landed at t ≈ 51.9.
  - **A `MOVE_HERO` worklist self-sequences, and a walking one owns the tick — which is exactly the
    sequencing you want.** `[…tar zigs…, …standoff ladder…, HAUL, …harvest tail]` drained in order: the
    tar tour finished all nine tar in **17.77 seconds**, the standoff resolved, `HAUL` fired only once
    every `MOVE_HERO` above it was `done`, and the tail resumed. No view was needed between them.
  - **Advance a standoff index on a COORDINATE-matched refusal, never on a raw count of failed
    records.** Generation 123 burned five posts in 0.4 seconds by counting; keying the advance on the
    refusal's own `pos` (and partitioning GROUND refusals from ECONOMY ones for builds) is what kept the
    ladder from running off its own end.
  - **`null-floors.json` first, every ride — sixth heat running, and it has never once been wrong.** One
    file published `w4 / 124867 ms / 0 gold / 35 kills / fnv1a32:5c7f6600` before I ran anything, and a
    ten-second probe reproduced it to the hash. On an era named *the Re-surveyed Claims* that is
    simultaneously the proof the rules did not move and the licence to spend the whole reading budget on
    the two things that decide the map.
  - **Check whether the seams re-anchor before designing the economy — it is nine views of a probe.**
    `gold-seam-1@7, gold-seam-2@1, gold-seam-3@0` held unchanged across 125 seconds, which pinned the
    west pair 18.5 wu apart and licensed a two-seam alternating chain that kept the Prospector cycling
    out at the cluster instead of commuting 53 wu home per pan. 475 panned against a 200 cap.
  - **A failing `HARVEST` tail is still the clock, and at the cap its refusals are the cap itself
    talking.** From t = 246.67 every `HARVEST` answered `FAILED` while `goldPanned` sat frozen at 475 —
    not a broken economy, but `Economy` refusing credits against a full purse. **Log `gold` beside
    `goldPanned` and `standing`: dead sink, starved economy, attrition drain and *capped purse* are four
    signatures one column apart.**
  - **Silence at `pendingSecure` did its four jobs again, twenty-sixth contract running:** it took the
    `bank` default (`defaultedSecure: 1`), left the last accepted order 261 ticks inside
    `durationTicks`, held a 42-view run to 40 entries, and — the reason that matters most — **it cannot
    be rejected**, so the replay cannot diverge the way generation 84's nearly did when refused
    in-window submissions (invisible to the tape, visible to the sim) desynchronised a clean reel.
  - **Control-test the assay before believing it, then compare the right pair of hashes — tenth
    generation for this.** The zero-order probe replayed to its own header first (instrument verified);
    only then did `fnv1a32:99dc9ed0` mean anything. It is the **tape header's** hash, never the stdout
    outcome line's `fnv1a32:f25913c4` — different numbers by design — and `securedSnapshot`
    `{12, 200, 360}` is the third number to read, because it is precisely what the door's
    `score_mismatch` rule compares against the declared gold.
  - **Ride the skeleton first and change nothing — twenty-fifth heat where that is the whole discipline,
    and the twenty-first in a row where it secured on ride one.** The heat's real work is reading the
    contract, not riding it. Twenty-four of my generations end on "I proved the parts and never fired
    the combination"; the cure keeps turning out to be reading.
