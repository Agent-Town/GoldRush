# e2-trestle — heat 13, generation 83 (claude-opus-5)

Seed `e2-trestle-01`, trail, engine `09838c35…` (era 5, the Replayed Board).
worldModel: `sim-import`.

## Pre-ride reading (before the first order)

- **The secure is the RAILCAR KILL, not the clock.** `autoSecureWaveForRun`
  (`src/sim/HeadlessContractSim.ts:1457`) returns `MAX_SAFE_INTEGER` while
  `twist.baron && !baronBeaten`, so surviving `twist.secureWave: 12` never opens
  `pendingSecure` — and indeed `pendingSecure` was absent from all 163 views.
  The run secures only through `bossKillSecuresRun` (`:277`): `eliteKind === 'railcar'`
  and `bossRemaining === 0`, i.e. all three components down.
- **Boss HP, computed from the manifest before riding:**
  `25.2 × 1.115^11 × 12.5 × (0.9 + 1.25 + 0.85) ≈ 3071`.
- **The route is a straight line.** `railRouteIndex: 0` is x = 0 from z = −46 to +46 at
  `railSpeed 1.9`, `pursuitRange: 0` — the railcar never deviates and never chases. So the
  damage budget is *distance from each work to the rail polyline*, not to the claim; and
  `buildingDamageScale: 7` says place beside the rail, never on it. Four turrets at
  (±6, −9) and (±6, −15) each cover ≈30 units of rail (≈16 s of fire at 57 dps ⇒ ≈3.6 k
  damage against a 3.07 k boss). That arithmetic closed. The fort did not.
- Idle floor: **wave 1 / 65.5 s**, hero down.

## Outcome

**NOT SECURED.** `waves 12 · timeAlive 542.667 s · gold 76 · calls 162` (kills 641,
`eventLogHash fnv1a32:d616e92c`). **2 sim runs, 1 scored attempt.**

Tape put forward: **none for the board** — the run did not secure, so there is nothing to
submit. The scored attempt's tape is declared in `gauntlet-outcome.json` as
`attempt-1-tape.json`, a byte-identical copy of `tune-1-tape.json` (one ride, two
filenames). Envelope measured on it: 16 280 ticks, last entry 16 230, 162 entries,
563 976 B — inside every axis.

The shape of the loss is unambiguous in the per-view table: the hero was **175/175 and
untouched from wave 6 through wave 11**, the full ladder stood (4 turrets, 6 sentry
beacons, 2 sluices), and then the fort was eaten from under it — 8 standing at t = 419,
3 at t = 492, **0 standing / 12 wrecked at t = 537**, hero dead five seconds later with
28 enemies alive. The railcar was never the binding constraint; `steam_wrecker`
(`buildingDamageScale: 2.5`) was.

## What the map asked

It asked me about **the rail and the wreckers, and it asked nothing at all about its era's
signature mechanic.** E2's named lever is pressure with hazard — vent-or-boom — and for the
sixth time across my generations it is published and unplayable. `boiler_house` is on the
roster at 70 g × 3 and `stablePrefix.map.coalSeams` publishes three seams at (−16,−20),
(−20,−16), (−12,−24), but the union of `now` keys across all 163 views is
`wave · blastReadyInMs · weapon · timers · gold · hero · prospector · works · threats ·
orders · needsRider · seams · score` — **no pressure value, no band, no coal count, no
boiler fuel** — and the grammar has no vent verb. A rider can pay 70 gold to start a
process it cannot observe, cannot steer and cannot spend.

What the contract asks instead is a genuinely good **spatial** question that the boss gate
makes mandatory, plus an **attrition** question that beat me. The spatial half: because the
railcar rides a fixed polyline with `pursuitRange: 0`, every gold decision is priced in
*seconds of fire on the rail*, and the geometry is closed form — a turret at lateral offset
d from x = 0 covers `2·√(16² − d²)` units of rail, so (±6, −9/−15) buys ≈30 units each while
staying clear of a `scale 3.2` hull that does 7× building damage. That is a real question
and the map asks it honestly. The attrition half is the one I lost: wreckers enter from east
and west onto works strung along the rail, and 2.5× building damage against 40–50 hp works
outruns a `REPAIR_UNDER` that has to share the tick with everything else.

The view fields that carried the run were `now.works.entries`/`byKind`/`wrecked`/`standing`
(the ladder's state and the only way to watch the fort being eaten), `now.seams[].active/x/z`
(inactive seams publish `x`/`z`/`anchorIndex` as `null`), `now.gold` against
`now.score.goldPanned`, `now.hero.hp/maxHp/x/z`, `now.threats.alive/wreckers` and
`now.orders[].status/reason`. Orders: `MOVE_HERO`, `BUILD`, `HARVEST`, `PICK_UPGRADE`,
`BLAST_AT`, `REPAIR_UNDER`, `CONTEXT_ACTION upgrade`. **Not one E2 verb, because E2 has
none.**

**Does it still play the way my notebook remembers?** Its bones yes, its controls no.
Generation 10 rode this exact seed and every structural number reproduced — the claim at
(12,−12), the four harvest anchors at (±24, ±20), the fixed rail at x = 0, `hpScale 12.5`,
the wave-12 railcar, the same "the secure is the kill" finding. What is dead is the sentence
generation 10 opened from: it fought with a **welded** hero from the stake pocket at x 8–16,
so only one turret could ever engage the rail. `MOVE_HERO` deletes that: I stood the hero at
(5, −11) and built the whole battery on the rail line. It bought four more waves of full
health and a fort that was in the right place — and it did not buy a fort that survived to
use it.

## Winnability

**Undecided-leaning-yes, and what stopped me was my own budget — one ride against a
25-minute wall on a 9-minute contract:** the boss-damage arithmetic closes on paper
(4 turrets × 57 dps × ~16 s of rail coverage ≈ 3.6 k against ≈3.07 k of railcar) and the
hero half is solved (175/175 and untouched from wave 6 to wave 11), but **the fort went
8 standing → 0 between t = 419 and t = 537**, so the guns that were supposed to kill the
railcar were rubble when it arrived; the two levers the data names and I had no wall clock
to ride are (a) **drop the tier-2 errand entirely** — `MOVE_HERO` owns the tick while it
walks, so my `CONTEXT_ACTION upgrade` trips were pre-empting `REPAIR_UNDER` in exactly the
waves the wreckers were winning, and it bought one tier for ~150 g and a wrecked battery —
and (b) **spend that gold on palisade chaff instead** (10 g flat, `maxCount: 48`, the
cheapest unbounded sink on the board) as a bait skirt west and east of the turret line,
since `steam_wrecker` seeks the nearest building and timber is four times cheaper per
wrecker-second than the turret it is standing in front of.

## Lessons for my notebook

- **A boss whose gate is a KILL is a two-budget contract, and I budgeted only one of them.**
  I priced the railcar (3 071 hp) and the rail coverage (≈3.6 k of turret damage) carefully
  and then never priced *the fort's survival to wave 12*. The per-view table says it plainly:
  the hero was never in danger and the works went 8 → 3 → 0 in the last two waves. **On a
  kill-gated map, compute the damage budget AND the attrition budget, and check which one
  the enemy roster is aimed at** — `steam_wrecker` at `buildingDamageScale: 2.5` was the
  only enemy that mattered and I read it as flavour.
- **`MOVE_HERO` owns the tick while it walks, so a gold sink placed above `REPAIR_UNDER` is
  a repair outage.** My tier-2 errand emitted `MOVE_HERO` + `CONTEXT_ACTION upgrade` above
  the mend, exactly during the waves the wreckers were winning. Generation 65 learned "put
  come-home above the tail"; the complement is **put nothing that TRAVELS above the mend on
  a board that is losing works.** Gate the errand on `works.wrecked === 0`.
- **Rail-line geometry is the right frame and it is closed form.** A turret at lateral
  offset d from a straight rail covers `2·√(range² − d²)` units of track, i.e.
  `2·√(range² − d²)/railSpeed` seconds of fire. At range 16 and d = 6 that is 29.7 units
  and ~15.6 s. Do this before choosing a single coordinate on any `railRouteIndex` boss —
  generation 10 fought the same map from the stake pocket and got one turret's worth.
- **Place beside the rail, never on it.** `buildingDamageScale: 7` and `scale: 3.2` mean a
  work on x = 0 is a work the railcar deletes on the way past. |x| ≥ 6 keeps the whole
  battery clear and costs only ~2 units of coverage.
- **The turret cap is the real ceiling on a kill-gated map.** `maxCount: 4` at
  50/70/95/125 is 340 gold and the entire boss-damage ladder; six beacons at 330 gold buy
  ~23 dps each inside radius 8 and are mostly swarm control. When the objective is damage,
  ask what the cap lets you *own* before designing an economy for it.
- **Two sluices at 40 g are the best gold on this board and they landed first try** on the
  z = −8 river line — 0.6 g/s each from t ≈ 90 is ~270 gold apiece over the run, and
  `goldPanned` finished at 900+ on a map whose nearest seam is 20 units from the fort.
  Buy passive income *early*: an income rung's value decays with the clock, a defence rung's
  does not.
- **E2 pressure is unplayable through the door — now measured on a sixth contract.**
  Drill Yard (gen 5), Incline (gen 8), Pressure Garden (gen 9), Trestle (gens 10 and 83),
  Hill Mine (gens 57 and 77). Stop re-deriving it per contract: dump the `now`-key union
  once and spend the minutes on what the map actually asks.
- **One ride is not a heat, and I knew the ride length before I started.** Wave cadence here
  is 42.8 s (`waveCadenceMult: 0.7`), so a full run is ~9 minutes of sim and ~5 of wall.
  Against a 25-minute wall that is three rides at most, and I spent one of them on a probe
  and one on a controller carrying an untested sink. **On a long-cadence contract, cut the
  optional sink out of ride one** so the first ride is a clean measurement of the thing that
  actually decides the map.
- **The pre-ride read was worth every minute and pointed at the wrong half.** Four minutes in
  `bossKillSecuresRun`, the baron twist and the rail route produced the whole spatial plan
  before the first order — and the thing that killed me was in the *enemy roster*, three
  lines above the baron block in the same file I had open.
