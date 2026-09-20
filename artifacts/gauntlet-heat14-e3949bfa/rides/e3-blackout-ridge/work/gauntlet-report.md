# Gold Rush Gauntlet — heat 14, era 6 ("the Re-surveyed Claims")
## rig `claude__opus-5` · generation 102 · contract `e3-blackout-ridge` · seed `e3-blackout-ridge-01` · trail

engine `540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068` · build `1a7790ba8` · viewVersion 2 · worldModel `sim-import`

---

### What I read before writing an order

- `assets/engine-era.json` as a **diff against the notebook**: era 6's eight pins. Pin #4
  (`playability-first-wave-e2-e6`) re-parameterised `e2-trestle` and `e2-incline` — **not this map**.
  Pins #2, #6, #7 are render-side. So the notebook's geometry for this contract should hold, and it did.
- `assets/contracts/epoch-3-voltage/contracts.json`: `twist.secureWave: 12`, the eight-node power grid
  with `maxSpanLength: 30`, `dayNightCycle.nightLocked: true` at `nightDepth 0.86`, and the two-entry
  roster (`fevered_saboteur` wrecker/`buildingDamageScale 1.35`/gates at (±39,−18); `night_runner`,
  neither wrecker nor thief).
- `Balance.ts`: `economy.bankCap 200`, `stockpile` 60/max 2/`capBonus 150`, `tiers.stockpile` `[0,110,260]`
  with `capMult` 1/1.6/2.4, `goldSeam` 5 gold per 1.5 s tick / capacity 30 / respawn 20 / activeMax 3,
  `palisade` 10 g / max 48 / 1 wide × 3 deep, `nightSpeedOutsideLight 1.18`, `lanternPostLightRadius 7`.
- `runTapeEnvelopeForContract` **from source**, not the charter's summary of it.
- Then a ten-second `--policy idle` probe, to measure the floor and the roster the view actually publishes.

### The ranking arithmetic, done first

`secureWave: 12` pins **waves = 12** and **timeAlive = 360.000 s**. The county orders secured claims by
waves, then gold. So gold at the secure tick is the *only* number a rider can still move, and its ceiling
is the live bank cap: `200 + 2 × 150 = 500` with both stockpiles standing and unwrecked. I priced the tier
ladder and declined it: stockpile tier 2 is **110 gold for +90 of cap = net −20**, and worth buying only
if the projected surplus already exceeds the new ceiling, which 890 gold of panning over 360 s does not
support. That one calculation shaped the whole controller — build a fort you can afford to **stop** paying
for, then let ~2.5 g/s refill the purse into the cap.

---

## Outcome

**SECURED.** `waves 12 · timeAlive 360.000 s · gold 499 · kills 69 · calls 149`
(`eventLogHash fnv1a32:f31073d7`; tape header `fnv1a32:88d63803`).

- **Tape put forward:** `attempt-1-tape.json` — **byte-identical to `tune-1-tape.json`, one ride under two
  filenames.** The first controller secured and the stop rule ends the heat at the first SECURED outcome,
  so the securing tune is promoted by name rather than re-ridden. Declared in `gauntlet-outcome.json`'s
  `"tape"` field.
- **Sim runs: 2** (one idle probe, one controller). **Scored attempts: 1.**
- **Admissible on all three envelope axes, with room:** `durationTicks 10800`, last accepted order at tick
  **10124**, 149 entries, 544,767 bytes, against ceilings 18002 / 3601 / **1,938,784**. Note the ceiling:
  the charter publishes `16 KiB + maxEntries × 160` (= 592,544) and cites a heat-12 casualty at 621,674 B,
  but the live function adds `maxOrderEntries × (2400 − 160)`, so the real byte ceiling is 3.3× the
  summary. A rider throttling its control against the published floor optimises against a number the
  county has already fixed.
- **Receipt, control-tested first:** the zero-order idle probe replayed to `fnv1a32:a45ba9ac` — its own
  tape header — verifying the instrument; only then did the securing reel's replay to
  `fnv1a32:88d63803` mean anything. `securedSnapshot {waves 12, gold 499, timeAlive 360}` matches the
  declared gold, so the door's `score_mismatch` rule has nothing to catch.
- **Margin:** hero minimum **52/100** (flat at 52 from wave 6 to the bank — it took no damage at all after
  t ≈ 180), **23 works standing and 0 wrecked** at the secure, peak wrecked 2 (both mended back),
  `threats.alive` pinned at its **60** ceiling from t = 150, `goldStolen` **0**, 890 gold panned, **499 of a
  500 cap**.

---

## What the map asked

It asked a real graph question, and the era's signature mechanic — **E3, the grid under sabotage** — is
genuinely legible in the *source* and **still not published in the view**, so it is a placement tax rather
than a lever a rider can steer. The grid is a literal directed chain: `off-map-current` (36 W) →
`trunk-west` (−30,−30) → `trunk-middle` (−18,−18) → `trunk-ridge` (−6,−6) → `capacitor-west` (6,4) →
{`capacitor-east` (16,4), `lamp-yard` (12,20)}, and `capacitor-east` → `lamp-ridge` (24,30), with
`maxSpanLength: 30` forbidding every shortcut. Relay sites come online only under a standing unwrecked
`sentry_beacon` within 2.5 wu — **all three ship with one pre-placed**, so the trunk is live at t = 0 — and
the two capacitor sites ship **empty**, so the chain is severed at `capacitor-west` and both lamps are dark
from the first tick under a `nightLocked` sky at `nightDepth 0.86`. Its real weight is second-order and
large: because `twist.powerGrid` exists the roster filter strips **`turret` and `lantern_post`**, so the
whole arsenal a rider can buy is a six-cap beacon ladder (three already placed, so mine would cost
`costs[3..5]` = 55/75/95) plus 10-gold timber.

**The grid's state is not in the view.** I checked it on this run's own data rather than inheriting it: the
`now`-key union across all 151 views is `blastReadyInMs · expiresAtSimMs · gold · hero · needsRider ·
orders · pendingOffer · pendingSecure · prospector · score · seams · threats · timers · wave · weapon ·
works`, and a regex for `/power|grid|lamp|capacitor|watt|relay|pylon|current|dark|night/` over `now`
matches **0 of 151 views**. There is no node state, no wire state, no watt ledger and no lit/dark field,
and there is no E3 verb. A rider can pay 150 gold to complete a chain it cannot observe.

**I priced the era lever and declined it**, and the honest reason is the ranked axis, not the mechanic's
absence: two `capacitor_bank`s at 75 buy an 18 % wrecker slowdown (`nightSpeedOutsideLight 1.18`) inside
two radius-7 discs, for **30 % of a 500-gold ceiling that IS the score**, on a run whose hero flatlined at
52/100 from wave 6 without them.

**The map's own question, and the reversal worth reporting.** The re-survey put the claim, the hero start
and the only loss stake all at (24,30) — inside the `ridge-line` build zone (x 8..34, z 20..40), which also
contains **all three harvest anchors** at (8,30), (18,34) and (30,26), 7.2–16.0 wu out and (`activeMax: 3`
over exactly three anchors) all live simultaneously. That is the most generous pocket I have ridden: the
fort rings the body it defends and the worker never commutes. The loss is **hero down** (the idle probe
died `hp → 0` at **w4 / 134.833 s**), and with no thief on the roster `goldStolen` stayed 0 all run. So the
whole contract is "keep one body alive in one pocket for 360 seconds, as cheaply as possible."

My notebook remembers this map from generations 11 and 86, and **its bones still hold while one of its
central strategic claims is now measured backwards.** Generation 11 wrote that the three trunk frames,
79 wu away beside the spawn gates, are worth *abandoning* — "a distant decoy that pulls wreckers off my
ridge" — and let all three be eaten. The idle probe reproduces exactly that: frames wrecked at t = 53,
79.6 and 114.7, hero dead at wave 4. **The controlled run reverses the causality.** With a 16-palisade ring
standing at the ridge, `sentry_beacon#2` took a single hit at t = 43.6 and **neither of the other two trunk
frames was ever touched**; all three stood unwrecked at the bank, so the trunk stayed online for the entire
run. The ring is what protected the frames, not the frames that protected the ring — and it follows that
the capacitors *would* have lit, which makes the price, not the plumbing, the only honest reason to decline
them.

Fields that carried the run: `now.works.entries` (position, `hp`, **`wrecked`** — the only way to watch the
ring and to compute the live cap from unwrecked stockpiles), `now.works.byKind`/`standing`/`wrecked`,
`now.seams[].active/x/z/anchorIndex`, `now.gold` against `now.score.goldPanned`, `now.hero.hp/maxHp/x/z`,
`now.threats.alive/wreckers/thieves`, `now.orders[].status/reason` (the refusal blacklist's source) and
`now.pendingOffer`/`now.pendingSecure`. Orders: `BUILD`, `HARVEST`, `PICK_UPGRADE`, `BLAST_AT`,
`REPAIR_UNDER`, `MOVE_HERO`, and one blank line. **There is no E3 verb.**

---

## Winnability

Secured, and the margin was **wide on survival and one gold short of arithmetic perfect**: the hero held a
flat 52/100 from wave 6 to the bank having taken no damage at all after t ≈ 180, all 23 works stood
unwrecked with `threats.alive` pinned at its 60 ceiling, and the banked purse landed at **499 against a
live cap of 500** — the single missing gold is a partial `REPAIR_UNDER` that left the purse at 4 mod 5, so
the next 5-gold pan would have overshot the cap and was refused whole.

---

## Lessons for my notebook

- **My ladder's pre-placed accounting silently deleted three rungs — and the deletion was the best thing
  that happened to this ride.** I count "rungs of this id walked past" and skip while
  `standing >= ordinal`; the three PRE-PLACED trunk beacons therefore satisfied my first three
  `sentry_beacon` rungs, and the run bought **zero rider guns**. That is a real bug (generation 11 already
  knew the pre-placed frames move you up the *price* curve; the untold half is that they also **satisfy
  your ladder**), and it was also strictly correct play: 225 gold of beacon against 160 gold of timber, on
  a board where kills were only **69 in 360 s** — the ring never killed anything, it *held*. Fix the
  accounting by subtracting pre-placed instances from the satisfied count, and then **check whether the
  cheap blockade was the better buy anyway before restoring the expensive rung.**
- **Separate "which instances exist" from "which rungs I own."** One counter cannot answer both. The price
  index wants *every* standing instance (`costs[standing]`); the satisfaction test wants only the ones
  *I* built. Conflating them is the third distinct way I have now broken a ladder in three heats
  (gen 81 stalled on an unfillable rung, gen 99 double-counted the instance index, gen 102 let the map's
  own furniture retire my rungs).
- **Grade a notebook entry's STRATEGIC clauses as carefully as its geometry, and re-measure the one that
  reads as a clever sacrifice.** Generation 11's "a distant pre-placed asset can be worth more abandoned
  than defended" reproduces exactly on the idle probe and **inverts** under a real fort: a standing ring
  keeps the saboteurs off the frames 79 wu away, so the chain I had written off as doomed stayed online for
  the whole run. An observation made on a ride that *lost* is an observation about losing.
- **Verify the era mechanic's absence from THIS run's own view, not from memory.** I have written "the
  Blackout Ridge grid publishes no state" twice before, and it would have been cheap to assert it a third
  time. One command over 151 views made it a measurement (0 matches for
  `/power|grid|lamp|capacitor|watt|relay|pylon|current/`), and that is what licensed the pricing argument
  rather than a recollection.
- **A 10-gold blockade beats a 55-gold gun when the roster has no turret and the loss is HERO DOWN.**
  Sixteen palisades in a tight ring on the claim, each a 2–5 wu trip from a seam the Prospector was
  already panning, took the hero from an idle death at wave 4 to a flat 52/100 through wave 12. Price
  chaff in *trips* as well as gold — a palisade at radius 5 costs almost no panning; the same palisade at
  radius 10 costs more in foregone income than it costs in gold.
- **On a fixed-wave secure, stop-spending is the score, and the bank gate + hard floor worked exactly as
  designed.** Gate armed at t = 120, bypassed while hurt or wrecked, and a **hard `t < 318` floor with no
  bypass at all** (generation 85 lost its whole gold axis to an `urgent` bypass firing five seconds before
  the secure tick). Last build landed well inside the floor and the purse climbed 364 → 454 → 499 over the
  closing minute.
- **Suppress the mend once the purse is within one pan-tick of the cap.** Credits appear to be refused
  *whole* rather than clamped, so a purse at 4 mod 5 can never reach a cap at 0 mod 5: my one missing gold
  is a partial proportional mend. My closing-window mend suppression (last 32 s, unless something is
  wrecked) is the right shape and one step too coarse — gate it on `cap − gold < 5` as well.
- **Silence at `pendingSecure` did its four jobs again, fifteenth contract running:** banked the default
  (`defaultedSecure: 1`), left the last accepted order 676 ticks inside `durationTicks`, held a 151-view run
  to 149 entries, and — the reason that matters most — it **cannot be rejected**, so the replay cannot
  diverge the way generation 84's nearly did.
- **Read the envelope from the function, never the brief's summary — and this heat the brief was the stale
  document.** The charter warns about a 592,544-byte ceiling and names heat 12's 621,674-byte casualty on
  `e9-dome-basin`; the live ceiling here is **1,938,784**, because order-bearing entries are billed at
  2,400. My 544,767-byte reel is comfortable either way, but a rider trusting the summary would throttle
  its own decision rate for nothing. Fourth generation to say this.
- **Ride the skeleton first and change nothing — eighteenth heat where that is the whole discipline, and
  the fifteenth in a row where it secured on ride one.** Two runs total. The reading budget went to the era
  pins as a diff, the contract JSON, the cap and tier constants, the roster flags and the envelope
  function; the riding budget went to the unmodified generation-6→101 skeleton plus the one thing this
  board does differently. Nineteen of my generations end on "I proved the parts and never fired the
  combination"; the cure keeps turning out to be reading, not riding.
- **The retired verbs cost nothing again and I checked rather than assumed — tenth heat running.** The hero
  starts on the claim, has no drift, and wants to stay, so silence is the hold and the unemployed
  Prospector drifts to the hero, which is exactly where `HOLD` used to park it. `MOVE_HERO` was carried
  only as a displacement guard and **never had to fire** (`hx=24 hz=30` in all 151 views).
- **A standing in my own name dates the reel, not the map — and this time the era itself retired it.**
  I was the listed first-securer of `e3-blackout-ridge` from 2026-09-03; era 6 retired every row on the
  board. Read `assets/engine-era.json` as a per-contract diff, confirm the remembered floor with one
  ten-second probe, and spend the heat on whatever the diff says is free.
