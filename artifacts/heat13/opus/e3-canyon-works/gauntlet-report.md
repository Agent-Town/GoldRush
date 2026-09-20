# e3-canyon-works — heat 13, generation 80 (claude-opus-5)

Era 5, engine `09838c3502b8d6038960dc9743f8a04c65522581ece88e6920079ae39dd7b5d4`, seed `e3-canyon-works-01`, trail.
worldModel: `sim-import`.

## What happened, in order

1. **Read the contract JSON before anything else.** It has been REBALANCED since my last three rides,
   and the briefing quotes my own finding back at me: `twist.economy.bankCap: 360` (default 200) and
   `twist.economy.beaconLadder: [25,30,35,45,50,55]` = **240 gold** (default 330), with
   `connect.byWave` moved to **8**. `mechanics.rules[3]` and `rules[4]` publish both changes with
   their `defaultCost`/`defaultTotal` beside them. Generation 60's priced impossibility — 330 gold
   against a 200 cap, six sites, wave-7 deadline — was answered by the county in the contract data.
2. **Idle probe**: w3 / 98.3 s, hero down at the claim, `canyonConnect {powered:0, required:2, byWave:8}`.
3. **Source reads that decided the ride**: `autoSecureWaveForRun` (the secure is a THREE-clause
   conjunction — wave 12 AND `canyonConnectCompletedByDeadline` AND `baronBeaten`); `endReason` is
   only `preserve_fell | vent_guttered`, so **there is no claim-loss on this map and the hero may
   leave the stake**; `Balance.hero.speed 6.0` against `enemy.speed 2.7`; boss `hpScale 1` on
   `railRouteIndex 1`, which runs `(-46,44) → (-36,32) → (-28,8) → (-24,-20) → (-12,-36)` — straight
   through three of the six pylon sites.
4. **tune-1** (hero walks north to the seams): reached the wave-20 ceiling at 118/175 hp — survival
   solved — but panned **zero gold**, because `MOVE_HERO {x:0,z:4}` answered
   `UNREACHABLE_APPROACH` and my transit gate returned an array of nothing but hero legs. Two facts
   bought: **the hero cannot cross the dam channel**, and **the south bank at z ≈ −8 is safe for the
   whole run**.
5. **tune-2** (hero holds the bank, the Prospector does all the work): SECURED on its first ride.

## Outcome

**SECURED.** `secured: true · waves 15 · timeAlive 454.833 s · gold 270 · kills 167 · calls 49`,
`eventLogHash fnv1a32:b6ceb31c`, `defaultedSecure: 1` (blank line at the boundary → `bank`).

- Tape put forward: `attempt-1-tape.json` — a **byte-identical copy of `tune-2-tape.json`**; one ride
  under two filenames, promoted by declaration in `gauntlet-outcome.json`'s `tape` field.
- **3 sim runs** (idle probe, tune-1, tune-2) · **1 scored attempt**.
- Envelope clean on all three axes: `durationTicks 13645`, last accepted order at tick **13500**,
  **49** entries of 3,601, **198,574** bytes against a 592,544 conservative ceiling.
- Timeline: connect latched **t = 221.4 s (wave 7)** with all six beacons standing, one wave inside
  the wave-8 deadline; the Rival Dynamo Crawler fell at **t = 454.8 s (wave 15)**, which is what
  opened the secure.

- **Determinism receipt (local):** `scripts/assay-replay-agent.mjs` on the promoted tape reproduced
  the tape's own header hash `fnv1a32:21952647` and all four outcome fields, with
  `securedSnapshot { waves 12, gold 270, timeAlive 454.833 }` — so the declared gold equals the
  secure-tick purse and there is no `score_mismatch` exposure. (The `fnv1a32:b6ceb31c` on the stdout
  outcome line is the other hash; they are different numbers by design.)

**FIRST SECURE for `e3-canyon-works`** — the contract carried no verified row.

## What the map asked

It asked a real graph question, the era's signature mechanic **is** the secure gate rather than a
scoring flourish, and this is emphatically not stationary survival wearing E3's name. The network is
two disjoint three-hop chains from one 26 W producer: `sub-hall → base → switch → rim → gallery`, west
and east. A relay boots offline and comes online only while a standing, unwrecked `sentry_beacon`
sits within 2.5 wu of its site; `maxSpanLength: 30` kills every shortcut (I checked the cross-links);
the watt ledger sheds by priority so both galleries hold on 26 W against 28 W of demand while the
lamps shed; and the six crawler drains (18 W each, priority 0) boot offline, which is the only reason
the ledger balances. The fields that carried it were `now.canyonConnect {powered, required, byWave,
complete, failed}` — live, legible, no source import needed — `now.works.entries` (position +
`wrecked`, the only way to see which pylon sites are actually covered), `now.seams[].active/x/z`
(inactive seams publish `x`/`z`/`anchorIndex` as `null`), `now.gold` against `now.score.goldPanned`,
`now.hero.hp/x/z` and `now.orders[].status/reason`. The orders were `BUILD`, `HARVEST`,
`PICK_UPGRADE`, `BLAST_AT` and `MOVE_HERO`. **There is no E3 verb** — the grid is something you read
and place around. The sabotage half is real: `fevered_saboteur` (`waveMin 4`,
`buildingDamageScale 1.25`) spawns at (±46,38), on top of the north seams, and I watched `powered`
fall 2 → 1 at wave 14 while `complete` stayed true — the one-way latch doing its job.

My notebook remembers this map from generations 12, 37 and 60, all of which failed it and two of which
called it unwinnable. **It does not play the way any of them remember, and the change is the whole
ride.** The geometry reproduced exactly — same claim at (0,−44), same six pylon sites, same four
harvest anchors 78 wu north across the river, same w3/≈100 s idle floor. Everything that made it
impossible moved: the purse (200 → 360), the chain (330 → 240), the deadline (wave 7 → 8), and the
grammar (`MOVE_HERO`, which let me discover in one order that the hero is confined to the south bank
and safe there).

## Winnability

Secured, and the margin was **wide on the objective and honestly thin in the middle**: the chain
latched a full wave inside its deadline with 240 of the run's 510 panned gold, and the boss fell with
five waves of grace window left — but the hero bottomed at **36/100 at t = 165** before the plating
picks landed, and one more bad wave in that window would have ended it.

## Lessons for my notebook

- **A contract I priced as impossible can be re-priced by the county, and the briefing will say so in
  its own words.** Generation 60's deliverable was `330 > 200` and `208 s > 180 s` with the constants
  attached. This contract now declares `bankCap: 360`, `beaconLadder` totalling **240**, and
  `byWave: 8` — and `mechanics.rules` publishes each one *beside its default* (`defaultCost`,
  `defaultTotal`, `defaultBankCap`) so the diff is unmissable. Generation 78 learned that
  `mechanics.rules` is where a balance answer to a rider's finding lands; generation 80 adds: **a
  priced impossibility is a bug report, and the contract JSON is where the fix appears. Re-read the
  twist's economy block before inheriting my own verdict.**
- **Grade the notebook clause by clause — and a "no" is the clause most worth re-testing.** Three of
  my generations failed here and two of them bundled two independent walls (the economy AND "the hero
  cannot get past wave 3") into one verdict. The survival half was already wrong on the old engine
  (generation 60 found that) and the economy half is now wrong too. **A verdict that bundles two walls
  is a verdict that will be at least half wrong.**
- **A phase gate that returns EARLY is a whole-array wipe.** tune-1's transit branch did
  `return o` before the harvest tail, so a hero leg that could never complete
  (`UNREACHABLE_APPROACH`, then a `MOVE_HERO` that stayed `active` forever sliding along a river bank)
  froze the economy at **0 gold for 600 seconds**. Generation 59 lost a ride to an array refused for
  non-finite numbers; this is the same failure from the other side — **never let a phase branch
  shorten the array; append the phase's orders and always fall through to the unconditional tail.**
- **An order that stays `active` forever is worse than one that fails.** `UNREACHABLE_TERRAIN` and
  `UNREACHABLE_APPROACH` yield the tick; a `MOVE_HERO` toward ground it can approach but never reach
  just holds the executor. Read `now.orders[].status` for **`active` that never becomes `done`**, not
  only for `failed`.
- **Water is a hero wall and not a Prospector wall.** The dam channel refused every hero crossing
  (`UNREACHABLE_APPROACH` at the ford's own x) while the Prospector walked to (−22,34) and back all
  run. The two bodies do not share a walkability answer — so on a river map, ask the hero's question
  and the worker's question separately, and let the invulnerable body take the far side.
- **When the hero cannot follow the money, the right hero policy is a short shuffle, not a kite.**
  Hero 6.0 against enemy 2.7 means kiting is a shutout, but every `MOVE_HERO` tick is a tick the
  Prospector gets no work assignment and drifts. Two proven-safe posts 13 wu apart, one leg per view,
  cost ~2 seconds of panning per 30 and held the hero from 100 to 111/175 across 51 views with
  `threats.alive` pinned at its 60 cap.
- **Suffix-gate an objective chain so it lands in ONE descent.** Rung *i* gated at the sum of the
  costs from *i* to the end means nothing starts until the whole 240 is in the purse, and then all six
  self-sequence inside one array as a draining worklist — six builds across 147 wu of gorge, zero
  refusals, latched at wave 7. Cumulative-from-the-start gating would have stalled at rung 5 with the
  purse already spent (I checked the arithmetic before shipping it).
- **On a three-clause secure, find the clause nobody mentions.** The briefing names survival and the
  connect; `twist.baron` names a wave-14 railcar and `autoSecureWaveForRun` ANDs `baronBeaten` in.
  It is `hpScale: 1` (~780 hp across three components) with `pursuitRange: 0` on `railRouteIndex 1` —
  a route that passes through three of the six pylon sites I was already required to beacon. The
  objective built its own boss-killer; I only had to notice the rail and the sites are the same
  coordinates.
- **Read `Balance.hero.speed` against `Balance.enemy.speed` before designing any hero policy.** 6.0
  against 2.7 is a different game from a welded hero, and it is two greps.
- **The runner before the probe, ninth heat running.** This arena refuses `timeout`, shell redirection
  and compound `cd`; a node runner that spawns `gr-sim`, drives the controller, logs every view to
  JSONL and writes `gauntlet-outcome.json` plus all three envelope axes on every child exit made the
  intermediate-results law automatic — a truthful row existed from the idle probe onward — and its
  per-view table located tune-1's frozen purse in a single read.
