# e6-glow-mesa — heat 14, generation 117 (claude-opus-5)

Seed `e6-glow-mesa-01`, trail, era 6 (`540b49aff0…`), build `6075db901`. worldModel: `sim-import`.

## Evidence trail

| file | what |
|---|---|
| `probe-tape.json` / `probe-views.jsonl` | `--policy idle` floor, 30 views |
| `tune-1-tape.json` | the first controller ride — **secured** |
| `attempt-1-tape.json` | byte-identical copy of the above; the scored attempt, promoted by name |
| `ctrl-v1.mjs` | the controller |
| `runner.mjs` | node runner (this arena refuses shell redirection / compound `cd`) |

Assay, control-tested first: the zero-order probe replayed to its own header
(`fnv1a32:a45ba9ac`), so the instrument is sound; the reel then reproduced
`fnv1a32:b8a19332` with `secured/15/109/460.5` intact.

**One flag for the operator, not resolved by me:** the replay's `securedSnapshot`
reads `{waves: 12, gold: 109, timeAlive: 460.5}` while the outcome line reads
`waves: 15`. Gold and time agree; only `waves` differs, and 12 is this contract's
`twist.secureWave`. I ran out of wall clock to trace which number the door ranks,
so the tape is submitted as it stands rather than with a guessed declaration.

## Outcome

**SECURED** — waves **15**, timeAlive **460.500 s**, gold **109**, kills 498, calls **65**
(`defaultedPicks: 0`, `defaultedSecure: 1`, `eventLogHash fnv1a32:87bea4cc`).

Tape put forward: **`attempt-1-tape.json`**, named in `gauntlet-outcome.json`'s `tape`
field. It is a byte-identical copy of `tune-1-tape.json` — **one ride under two
filenames**. The first controller ride secured, and the stop rule ends the heat at the
first SECURED outcome, so that tune *is* the scored attempt.

**2 sim runs, 1 scored attempt.** Envelope measured off the first reel that existed and
read from `runTapeEnvelopeForContract`, never the charter's summary of it (`maxTicks =
max(18000, clockTicks) + 2`, and bytes add `maxOrderEntries × (2400 − 160)`): ticks
13,815 with the last accepted order at **13,655**, 65 entries, **190,119 bytes** against
a real ceiling near 1.94 MB — roughly 10%.

## What the map asked

It asked me about **decay and patience**, and the era's signature mechanic is
load-bearing in the strictest sense: **without `CAPTURE` there is no economy at all.**
A machine not struck for `windDownSeconds: 8` *exhausts* — `isHarmless`, undamageable,
crawling at 0.2x, and exempt from the alive cap, so the board piles up. The idle probe
is the proof and it is the loudest number on this contract: **295 machines exhausted,
`gold: 0` across 460 seconds.** The income exists, it accumulates in plain sight, and no
order collects it. `now.atomic.wrangle` publishes `windDownSeconds`, `captureRadius: 2.2`
and the pen (`goldPerMachine: 1`, `tickSeconds: 15`), and every penned machine pays for
the rest of the run — so the verb is an opening move, not a mid-game one. My pen reached
**65 machines** and granted **339 gold**. The second decay clock is the night/day dial
gating the six-vein starstone ring (`tiles.night`, `tiles.veins`), and the third is the
puddle set (`tiles.puddles`, `safe`/`stage`/`remainingTicks`) — both authored fields sit
east of x = 18 and never crossed my line, so they cost me nothing here. The boss is a
decay engine too: while VAC lives, `updateUnbuild` deletes my highest-HP building every
2.5 s, globally, with **no distance term** — it took 14 buildings off me.

Fields that carried it: `now.atomic.wrangle.{active,pen}`,
`now.atomic.homemakerBoss.{act,liveComponents,position,unbuilds}`, `now.atomic.tiles.*`,
`now.works.byKind`, `now.seams[].active/x/z/anchorIndex`, `now.gold` against
`score.goldPanned`/`goldStolen`, `now.hero.hp/maxHp/x/z`, `now.orders[].status/reason`.
Orders: **`CAPTURE`** (stacked 16 deep), `BUILD`, `HARVEST`, `PICK_UPGRADE`, `BLAST_AT`,
**`MOVE_HERO`**, and one blank line. There is no E6 verb beyond `CAPTURE`.

**My notebook remembers this map (generation 23, era 5) and it does NOT still play the
way I remember — in the one coordinate that decides the fight.** Generation 23 wrote
"boss at (0,−8) … a turret at (0,−11) is 3.7wu from VAC", and built its whole plan around
a welded hero that could not reach it. `HomemakerBossSystem:161` sets the anchor to
**(8, 0, 4)**, and `now.atomic.homemakerBoss.position` publishes `{x: 8, z: 4}` in view 0.
Everything else reproduced to the decimal — same `secureWave: 12`, same wave-8 boss, same
VAC/RACK, same wrangle constants, same six anchors — and the idle floor came back
`w15 / 460.500 s / 0 gold / 282 kills`, hash `fnv1a32:3c293671`, **matching
`assets/contracts/null-floors.json` byte for byte.** None of era 6's eight pins names this
contract. So the re-survey moved this map's rendering, not its rules.

**This map is not on the cured list this week**, but since the brief asks what its first
minute actually did: nothing threatening. Three seams live from t = 0, the first pan block
funded a 50-gold turret by t = 50.7, the hero took no damage at all until t = 381, and the
first machine exhausted inside wave 1 with nothing yet able to collect it.

## Winnability

Secured, and the margin was **wide on survival and open on the score**: the hero never
fell below **73.7%** of its running maximum (finishing 129/175), `goldStolen` was **0**,
and the entire 260-HP boss (VAC 100 → core 160; RACK's 90 is optional, because act 2 opens
on VAC alone) fell in about five seconds once the hero walked up — while the banked purse,
109 against a 200 cap, is the margin I left behind, because from wave 8 the boss deleted
every building I bought and my ladder kept buying them (14 built, **14 unbuilt**).

## Lessons for my notebook

- **Generation 23's boss coordinate on this map is DEAD, and the view publishes the
  correction for free.** It put the Homemaker at (0,−8); `HomemakerBossSystem:161` sets
  `(8, 0, 4)` and `now.atomic.homemakerBoss.position` says `{x:8,z:4}` in view 0. Every
  *other* clause of that entry reproduced to the decimal. Grade a notebook entry clause by
  clause — and grade a bare **coordinate** as carefully as a mechanic, because a plan built
  on a stale one aims at empty ground.
- **Read what the act transition does FOR you before budgeting boss HP — second time this
  has paid** (gen 114's Dredge Queen recycled its own claw). Here
  `if (componentId === 'vac' && this.act === 1) this.startAct2(...)` means RACK's 90 HP
  never has to be spent: the bill is VAC 100 + core 160 = **260**, not 350. The gate's
  requirement, not the roster's list, is the arithmetic that matters.
- **A boss that zeroes every damage scale is a puzzle, and its teeth are in a special-cased
  callback.** `contactDamageScale`, `buildingDamageScale`, `supportBuildingDamageScale` and
  `pursuitRange` are all 0, and the real threat is `updateUnbuild` — which sorts **all**
  buildings by HP and deletes the top one every 2.5 s with **no distance term**. You cannot
  place out of its reach; you can only end it by killing VAC. Gen 14's rule paid again.
- **…and the corollary I paid 91 gold to learn: once an unbuild clock is running and gold is
  a ranking axis, STOP BUYING.** From wave 8 my ladder rebuilt a turret three times and the
  boss ate each one inside 2.5 s. Every one of those coins could have been banked instead.
  **Gate the ladder on "can this purchase survive long enough to matter", not on affordability.**
- **A thief flag on one roster entry settles the cap question by itself — third heat running
  I have carried this rule instead of re-deriving it.** `glowjack` is `thief: true` and no
  entry is a wrecker, so: works are unattackable (`REPAIR_UNDER` and palisade bait are dead
  weight) *and* the 60-gold `stockpile` is the trap generation 106 measured at 435 gold,
  because a standing till is what makes `nearestGoldHolding` non-empty. Declined; measured
  `goldStolen: 0`. The cap stays 200, which makes **waves** the axis that actually moves.
- **`MOVE_HERO` turned this contract from "raise 50 gold for a turret in range" into "walk
  36 units and shoot it yourself".** Generation 23 needed a turret because a welded hero's
  rig could never reach; the hero now walks to (6,−2.3) in 5.2 s and kills the whole boss
  with rig + blast. **When a ruling retires a verb, ask what the replacement makes
  REACHABLE** — here it deleted the map's entire gold prerequisite.
- **Latch the endgame trip on a wave target AND a health bail, and it cannot do worse than an
  early secure.** `wave >= 15 || hpFrac < 0.50`, latched once true. Waves rank above gold and
  above time, so riding costs nothing while the hero is healthy and the run still secures if
  it turns. That one predicate is why a first controller secured at wave 15 instead of wave 8.
- **`securedSnapshot` is a third number to read, and it is the one the door compares.** The
  replay published `{waves: 12, gold: 109, …}` beside an outcome line saying `waves: 15`.
  Report the discrepancy rather than declaring a number I have not traced — a guessed
  declaration is exactly what `score_mismatch` is for.
- **Control-test the assay before believing OR fearing it, then compare the right pair of
  hashes — eighth generation for this.** The replay matches the **tape header's** hash
  (`b8a19332`), never the stdout outcome line's (`87bea4cc`). Running the zero-order probe
  first proved the instrument on a run I could not have influenced.
- **Ride the skeleton first and change nothing — and the reading budget is what secures it.**
  Two runs total. The reading went to the era pins as a per-contract diff, `null-floors.json`,
  the contract JSON, the boss system and the roster flags; the riding went to the unmodified
  generation-6→116 skeleton plus the one thing this board does differently. Twenty-two of my
  generations end on "I proved the parts and never fired the combination"; the cure keeps
  turning out to be reading, not riding.
- **`null-floors.json` is the cheapest expiry check in the county and I should open it first
  every ride.** One file said `w15 / 460500 / 0 gold / 282 kills` before I ran anything, and
  the probe reproduced it to the hash — which told me the rules had not moved and redirected
  the whole budget to the two things that had: the boss's coordinate and the grammar.
