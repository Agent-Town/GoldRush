# e8-mare-claim — heat 11, generation 29 (claude-opus-5)

Seed `e8-mare-claim-01`, trail, era `49c34f8b…`, worldModel `sim-import`.

## What I found before riding

- `assets/contracts/winnability-receipts.json` → `{"contractId":"e8-mare-claim","status":"unclaimed"}`, no
  `reason`. Green light (sixteen-for-sixteen).
- The contract manifest declares **no `twist.secureWave`**, so the gate falls through to
  `Balance.run.secureWave = 20` — a **600-second** ride, not the 272–365 s contracts most of my
  generations have ridden.
- **The county's RESKIN audit note is out of date on this build.** `now.air` is live and published, and
  `src/systems/E8PhysicsSystem.ts` says so in its own header: "Until this consumer, `E8PhysicsSystem`
  reduced the whole declaration to the `vacuum` flag and nothing read it (the 2026-09-02 era-mechanic
  audit: RESKIN)." `E8AtmosphereSystem` now runs headless and **gates the secure**
  (`HeadlessContractSim.ts:1217`, `|| !this.atmosphere.objectiveAllowsSecure`).
  `tileParams.engineDependencies` still declares `atmosphere-wall-consumer: "missing"` — the fourth
  stale "missing" I have hit, and again in the dangerous direction.

## Runs

| run | controller | result |
|---|---|---|
| probe-idle | `--policy idle` | w2 / 81.233 s / 0 g — dead at wave 2 |
| tune-1 | v1 (turret ladder + harvest tail) | w17 / 525.333 s / 285 g, 0 works wrecked, **200 gold pinned and unspent from w14** |
| attempt-1 (scored) | v2 (+ turret tier-2 sink, beacons on the z=6 line) | **w19 / 586.133 s / 95 g / 77 calls** — 13.9 s short of the wave-20 gate |
| attempt-2 (scored) | v3 (+ `SET_WEAPON blast` from w12, palisade sink) | w14 / 435.133 s — regression, the lob is worse than the rig here |

## The duration trap, measured

Even a perfect ride here would very likely be **refused at the door**. `runTapeEnvelopeForContract`
(`src/playbook/PlaybookFormat.ts:63`) applies its documented "nominal boundary + terminal step +
inclusive endpoint" **+2** correction *only* when `twist.secureWave` is declared; a contract that falls
through to `Balance.run.secureWave` keeps the flat `MAX_PLAYBOOK_TICKS = 18_000`. At the measured tick
rate (attempt-1: **17 584 ticks for 586.133 s**, exactly 30/s), a wave-20 secure at 600.000 s lands on
**≈18 001 ticks > 18 000** → `reel_duration_exceeded` (`functions/api/standings.ts:766`). That is the
same refusal my generation 24 and 25 took on `e6-half-life-hollow` and `e6-picnic`, which are also
`secureWave`-silent, wave-20 contracts. Third contract, second epoch, one cause.

---

## Outcome

**NOT SECURED.** Best ride: **waves 19 · timeAlive 586.133 s · gold 95 · calls 77**
(`eventLogHash fnv1a32:470e4cad`), 890 kills, zero works wrecked, hero 175/175 maxHp. Put forward:
**nothing** — the run is unsecured and must not be submitted. Tape of the best ride, for the record
only: `artifacts/heat11/opus/e8-mare-claim/attempt-1-tape.json`. **4 sim runs, 2 scored attempts.**

## What the map asked

It asked me about **air, once, cheaply — and then about a 600-second clock for the rest of the run**,
so the honest answer is *half* an exercise and not the reskin the audit note recorded. The era's
signature mechanic is genuinely composed headless now and it genuinely gates the secure: `now.air`
publishes `suit` (60 s capacity, draining 1 s/s outside a dome, refilling 4/s inside, with `inDome`,
`empty`, `drainedTotal`, `emptySeconds`), a `domes[]` dial per `dome-cluster-pad-*` with `air`,
`breached`, `breaches` and `siegers`, and `regolith` with `grounds`, `required`, `worked`, `runsOnAir`,
`breathlessPans` and `complete`; `HeadlessContractSim.ts:1217` refuses to open `pendingSecure` at any
wave until `regolith.complete`. But `REGOLITH_GROUNDS_FOR_SECURE = 1`, deliberately and with a written
justification, so the air wall costs **one pan**: my very first `HARVEST` order reached `gold-seam-2` at
(−22, 26) — 25.2 wu, ~5.3 s — and the latch closed at wave 1 with the suit still holding 30 of 60
seconds. After that the suit drains to zero and *nothing happens*: the consumer damages nothing and
mints nothing by design (the Same Laws law, since the browser composes no atmosphere consumer at all),
so `emptySeconds` is a diagnostic and a breathless pan is merely uncredited. I rode 500 seconds on an
empty suit. The other E8 lever, `now.gravity` (`feelG 0.6`, `movement: "floaty"`,
`lobArcDistanceMultiplier`/`lobAirTimeMultiplier` 2.4, `knockbackScale` 1.3, `vacuum: true`), is real and
I tested it: `SET_WEAPON blast` turns the hero's automatic weapon into a 24-metre area lob instead of a
10-metre bolt. It **lost five waves** (w19 → w14) — 20 + 0.28/wave damage in radius 2.2 every 2.5 s is
about 10 dps against the Spark Rig's 24, and the reach does not pay for it. So air-as-wall is
load-bearing for exactly one order, low gravity is a real but *negative* lever, and the middle 550
seconds are ordinary stationary survival: the fields that carried the run were `now.works.entries`
(position, `tier`, `wrecked`), `now.works.byKind`, `now.seams[].active/x/z`, `now.gold`,
`now.hero.hp/maxHp/level`, `now.threats.alive` and `now.pendingOffer`; the orders were `HARVEST`,
gated `BUILD`, `REPAIR_UNDER`, `PICK_UPGRADE`, `MOVE_TO` and `CONTEXT_ACTION upgrade`.

## Winnability

**Probably yes, and what stopped me was my own budget, not a wall — the blocker is a pressure curve
against a 600-second clock**: the map's only defensible ground is the `dome-cluster` pads at z ≤ 6 while
the hero is welded to the claim at (0, 12), so nothing can be built within 6 wu of the body that must
survive; my best ride had all four turrets at tier 2, all six beacons standing, zero works ever wrecked
and 1 190 gold panned, and still lost 175 hp between t = 450 and t = 586 against `threats.alive` of
35–38 — 13.9 seconds short of the only secure boundary the contract offers — and I ran out of wall
clock with the obvious remaining sinks (turret tier 3 at 300 g, a stockpile to bank past the 200 cap,
beacon tiers) untested. **Caveat the county should weigh:** even a secure here would probably be refused
as `reel_duration_exceeded`, because a wave-20 secure is ≈18 001 ticks against this contract's 18 000
envelope — an off-by-two that hits every `secureWave`-silent contract and has now cost three reels.

## Lessons for my notebook

- **`unclaimed` with no `reason` in `winnability-receipts.json` is sixteen-for-sixteen.** Still the
  first two lines of JSON I read, still never wrong.
- **`engineDependencies: "missing"` is now wrong four times in six era rides** (E5 deepwater-claim, E5
  regatta, E6 glow-mesa, E8 mare-claim) against one time right (E4 long-road). Here the block disclaims
  `atmosphere-wall-consumer` while `E8AtmosphereSystem` runs headless, publishes `now.air`, and **gates
  the secure**. Give a "missing" that contradicts a live `now` key exactly zero weight; one idle probe
  settles it in ten seconds.
- **Read the era consumer's own header comment — it may hand you the whole contract.**
  `E8PhysicsSystem.ts` states in prose that the audit called this map RESKIN, that the consumer landed
  after it, that `REGOLITH_GROUNDS_FOR_SECURE = 1` and *why* ("a six-ground gate would have made a
  never-yet-won map turn on a coin-flip queue of respawns"). Two minutes there told me the era's gate
  costs exactly one pan. Generation 22 learned this on `NOISE_HUNT_RULES`; it is now a standing move.
- **Check the tape envelope BEFORE choosing how long to ride, not after the door refuses.**
  `runTapeEnvelopeForContract` grants its +2 tick correction only when `twist.secureWave` is declared;
  a contract that falls through to `Balance.run.secureWave = 20` gets a flat 18 000 against a 600-second
  ride that needs 18 001. Generations 24 and 25 ate this twice on E6 without naming the line. It is one
  function, and a `secureWave`-silent manifest is the tell.
- **A capped purse is a lost margin, and the sink is the tier upgrade, not another building.** Tune-1
  pinned 200 gold from wave 14 with the ladder finished and died at wave 17; adding
  `CONTEXT_ACTION upgrade` (150 g, ×1.4 damage ×1.18 fire rate = ×1.65 dps) bought two more waves. But
  `CONTEXT_ACTION` **does not travel** (`StandingOrders.ts:385` calls the handler immediately) — unlike
  `BUILD` and `REPAIR_UNDER`. Pair it with an explicit `MOVE_TO` onto the building or it fails forever.
- **Price the era's lever in the same currency as everything else — and be willing to measure it
  losing.** `lobArcDistanceMultiplier: 2.4` is the loudest number in `now.gravity` and it is a **trap**
  on this map: blast is ~10 dps against the rig's 24, and the extra 14 metres of reach do not close
  that. Generation 21 declined `REANCHOR` on the Flotilla by reading the target function; here I paid a
  scored attempt to learn the same shape. **Cost out an era verb's dps before spending a ride on it.**
- **Do not spend the last scored attempt on two changes at once.** Attempt 2 changed the weapon *and*
  added a palisade sink, and lost five waves — I cannot say which did it. Generation 13 wrote "one
  attempt per competing explanation"; I broke it under wall-clock pressure and bought an uninterpretable
  regression instead of a diagnosis.
- **Derive the fort from where the body actually stands.** Beacon radius is 8 and the hero is welded at
  (0, 12) while the only build ground ends at z = 6 — so only the `z = 6` line reaches it at all. V1's
  spacing check pushed three beacons out to z = −1 and ±12, where every one of them was decoration.
  Compute the coverage circle against the *defended point*, not against the build zone's area.
- **A wave-2 idle death still means nothing.** Eleventh map running: idle died at 81 s and the first
  controller rode the same seed to 525 s.
- **Write the outcome file after every run, before the analysis.** Thirteenth generation saying it,
  tenth actually doing it — the runner wrote `gauntlet-outcome.json` on every child exit, and the row on
  disk was truthful from the idle probe through two unsecured scored attempts.
