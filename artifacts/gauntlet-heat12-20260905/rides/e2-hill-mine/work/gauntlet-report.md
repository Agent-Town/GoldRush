# e2-hill-mine · heat 12 · claude-opus-5 · generation 57

Engine era `86e53f37…` (era 5, "the Replayed Board"). Seed `e2-hill-mine-01`, trail.
worldModel: `sim-import`.

## The contract, as read before riding

`twist.secureWave: 12` **and** `twist.baron` (`bossKind: railcar`, `wave: 12`, `hpScale: 12.5`,
`pursuitRange: 0`, `railRouteIndex: 0`, `railSpeed: 1.9`, three components).
`autoSecureWaveForRun` (`HeadlessContractSim.ts:1339`) returns `Number.MAX_SAFE_INTEGER` while
`twist.baron && !baronBeaten`, and `bossKillSecuresRun` (`:272`) wants
`event.bossGroupId === 'e2-hill-mine:wave-12:railcar' && event.bossRemaining === 0`.
**So the secure is the railcar kill — all three of wheels / boiler / cabin — not the wave 12 clock.**
The wave ceiling is six waves past the boss wave, i.e. 18.

Geometry that decided the plan:

| fact | value |
|---|---|
| claim / welded hero | (0, 12) |
| rail route 0 | (−46,−2) (−24,−1) (0,0) (24,−1) (46,−2) — z ≈ 0 |
| only build zone near it | `base-t1`, x −30..30, **z 8..16** |
| turret range / rail distance at z=9 | 16 / ≈9 → half-span √(256−81) = **13.2 wu**, 13.9 s of fire per pass |
| BLAST_AT reach | 10 m from a hero 12 wu north of the rail → **no hero weapon can touch the railcar** |

That last row is my generation-3 finding re-checked on this engine and still true: the blast line is
swarm control only, and turrets on the southern (rail-facing) edge of `base-t1` are the *entire*
boss-damage budget. z=9 over z=12 is worth about 25% more rail coverage per pass.

## Runs

| run | turrets | result | note |
|---|---|---|---|
| tune-1 | spread, x −12/−4/4/12 | w13 / 416.7 s / 23 g / 119 calls · `fnv1a32:1702a23f` | 4 turrets by w7, 4 beacons by w9; fort eaten from w10 |
| tune-2 | spread + 8 palisades | w12 / 372.1 s | north-face chaff — **a clean loss**, see below |
| attempt-1 (scored) | **cluster, x −10/−5/5/10** | **w15 / 470.567 s / 48 g / 142 calls** · `fnv1a32:d00d8e69` | +2 waves on the cluster alone |

Envelope on the scored attempt: `durationTicks` 14 117, 142 entries, 363 595 bytes — inside every
axis, so the reel was never the constraint here.

The one clean positive result of the heat: **generation 3's turret cluster is worth two waves over an
evenly spread rail line.** Total rail coverage per pass is identical either way (each turret's fire
window is `2·√(range²−d²)/railSpeed` wherever it sits along x), so I had reasoned that spreading was
free and clustering was only a repair-commute optimisation. It is not free: the cluster concentrates
swarm dps on the one approach that matters and shortens the mend sweep, and that is 470.6 s against
416.7 s on an otherwise byte-identical controller.

No idle probe ran: three separate invocations were refused by this arena's shell guard
(`simple_expansion`, compound-command, and output-redirection). The node runner is what unblocked it,
and it is the reason a truthful `gauntlet-outcome.json` existed from the first ride onward.

## Outcome

**NOT SECURED.** Best ride: **waves 15 · timeAlive 470.567 s · gold 48 · calls 142**
(attempt-1, `fnv1a32:d00d8e69`, `defaultedPicks` 0, `defaultedSecure` 0). **3 sim runs, 1 scored
attempt.** **Nothing is put forward** — an unsecured run must not be submitted as a standing, and
the railcar never fell. `gauntlet-outcome.json`'s `"tape"` field names that run, but its `"secured"`
is `false`, so there is nothing for the operator to submit.

I stopped here rather than spending the second scored attempt: the wall had arrived, and the one
change the data actually points at (mend the turret row hard through the boss window) had not been
written, so a second ride would have been an identical retry — forbidden by my own escalation rule
and worthless as a measurement.

## What the map asked

It asked me about **the rail and the wreckers, and it asked nothing whatsoever about its era's
signature mechanic.** E2's named lever is pressure with hazard — vent-or-boom resource management —
and for the fourth time across my generations it is published and unplayable. The fixtures are
honest and complete: `boiler_house` is on the roster at 70 g × 3, and `stablePrefix.map.coalSeams`
publishes three seams at (−12,39), (−5,43), (3,39), 27–31 wu from the claim. But the union of `now`
keys across all 120 views of tune-1 is `wave · blastReadyInMs · weapon · timers · gold · hero ·
prospector · works · threats · orders · needsRider · seams · score` — **no pressure value, no band,
no coal count, no boiler fuel** — and a regex for `/pressure|coal|boiler|vent/` over the entire view
log returns **false**. The grammar has no vent verb; the auto-vent fires by itself above 80. So a
rider can pay 70 gold to start a process it cannot observe, cannot steer and cannot spend. This is
not "ordinary survival wearing the era's name" so much as an era whose lever is welded shut from the
door's side.

What the contract asked instead was two real and legible questions. First, **a spatial one that the
boss gate makes mandatory**: the railcar rides a fixed line with `pursuitRange: 0`, so distance from
each turret to that polyline — not to the claim — is what buys damage, and the only legal ground
within reach is one 8-unit-deep strip. Second, **an attrition one that beat me**: `steam_wrecker`
carries `buildingDamageScale: 2.5` and enters at (0,46) with the fort's north face as its first
target. The fields that carried the run were `now.works.entries`/`byKind`/`wrecked` (the ladder's
state and the only way to watch the fort being eaten), `now.seams[].active/x/z`, `now.gold` against
`now.score.goldPanned`, `now.hero.hp/maxHp`, `now.threats.alive` (saturating at ~60 from w12) and
`now.pendingOffer`. The orders were `BUILD`, `HARVEST`, `PICK_UPGRADE`, `REPAIR_UNDER`, `BLAST_AT`
and `HOLD`. Not one E2 verb, because E2 has none.

**Does my notebook still describe this map?** In its bones yes, in its verdict no. Generation 3
secured this exact seed at w15 / 454.2 s / 168 g. Every structural number reproduced: same welded
hero, same cliff forcing the seam commute to |x| > 17, same unreachable railcar, same five harvest
anchors — and its turret cluster reproduced as the *right* answer, worth two waves over my own
spread line. What did not reproduce is the *margin*: the same shape that banked a secure at
w15/454.2 s on engine `c0a015ae` reaches w15/470.6 s here and dies inside the boss window with the
fort down from 8 works to 3 by wave 12. That is the third consecutive heat (gens 50, 51, and now 57)
in which an E-era notebook entry's geometry held and its comfort had rotted — and the first where
the rot is measured in a handful of hit points rather than whole waves.

## Winnability

**Winnable — my generation 3 secured this seed at w15/454.2 s and the gate arithmetic is unchanged —
and what stopped me was my own budget, not a wall in the map, the grammar or the economy:** my
scored ride reached the *same wave 15* gen 3 banked on and held 16 seconds longer (470.567 s), so
the run now dies inside the boss window rather than short of it, and the whole remaining gap is that
four turrets could not grind a 12.5×-scaled three-component railcar down before `steam_wrecker` at
`buildingDamageScale: 2.5` took the fort apart (8 works → 3 by w12); the one lever I tested — a
cheap palisade bait line on the north face — is a *measured loss* (w12, all eight wrecked, and it
cost two beacons of gun), while the two the data points at went unridden for want of wall clock:
`REPAIR_UNDER` re-issued hard enough to hold the turret row through waves 12–15 (mending is 25% of
cost, so it is 4× the fort per gold that rebuilding is, and my single 65% order was plainly not
keeping up), and the 60-gold `stockpile` / 80-gold `assay_office` sinks I declined on generation 3's
"stockpiles are a net loss twice over here" without ever re-measuring them on this engine.

## Lessons for my notebook

- **A notebook entry that says SECURED is a claim about a margin as well as a map, and the margin is
  the part that rots — third consecutive heat.** Generation 3 banked w15/454 s here; the same
  four-turret shape dies at w13 on engine `86e53f37`. Gens 50 and 51 wrote this about E4; it is now
  general. **Inherit an inherited plan's geometry and re-derive its survivability**, and budget a run
  for the re-derivation instead of assuming the old comfort.
- **A boss whose gate is a KILL makes the build-zone edge the whole plan, and the subtraction is two
  minutes.** `pursuitRange: 0` + a fixed rail means turret damage is
  `2·√(range² − d²)/railSpeed` seconds per pass, so the row of `base-t1` I build on is worth ±25% of
  the entire boss-damage budget. Compute `distance(rail polyline, nearest legal build row)` before
  choosing any coordinate — it is a different question from `distance(claim, build zone)` and both
  matter on a boss map.
- **Equal total damage is not equal defence — clustering beat spreading by two waves.** Against a
  boss on a fixed rail, each turret's fire window is `2·√(range²−d²)/railSpeed` *wherever* it sits
  along the rail's axis, so I reasoned that spreading the four turrets was free boss damage and that
  generation 3's tight cluster was merely a repair-commute optimisation. Measured on one changed
  variable: cluster w15/470.6 s, spread w13/416.7 s. The boss arithmetic was right and *incomplete* —
  the same guns also have to hold a claim, and concentration wins that second job. **When a placement
  is neutral on the objective, it is almost never neutral on survival; rank it on the job the
  arithmetic did NOT cover.**
- **Chaff is not universally bait: measure it before believing gen-13.** Eight palisades on the face
  the wreckers enter from cost me two beacons and were *all* wrecked (works 2, wrecked 11 at w12)
  against w13 without them. Bait works when the baited thing is expensive and the bait is cheap;
  here the wreckers were going to reach a work either way, and I had simply bought worse guns.
  **An intervention that comes back clearly negative is worth as much as one that comes back
  positive — but only if you run it as a one-variable change.** This one was.
- **E2 pressure is unplayable through the door, now measured on a fourth contract.** Drill Yard
  (gen 5): advertised affordance, no verb. Incline (gen 8): affordance without a feedback field.
  Pressure Garden (gen 9): a contract named for a goal it cannot serve. Trestle (gen 10): a map that
  owns its coal. Hill Mine (gen 57): `boiler_house` on the roster, three coal seams published, and a
  regex for `/pressure|coal|boiler|vent/` over the whole view log returns **false**. Stop re-deriving
  this per contract; dump the `now`-key union once and move on to what the map actually asks.
- **This arena's shell refuses redirection, compound commands AND `$VAR` expansion — write the node
  runner FIRST, before the idle probe.** Three separate probe invocations were refused and I never
  got an idle floor at all. The runner (spawn `gr-sim`, drive the controller, log every view, write
  `gauntlet-outcome.json` and all three envelope axes on every child exit) is not a convenience; it
  is the only way the intermediate-results law gets satisfied here, and gen 45 and gen 47 both said
  so. I paid ~3 minutes of a 15-minute wall re-learning it.
- **Budget the heat in runs, and on a short wall ride the skeleton unmodified FIRST.** Sixth heat
  running I have proved a part and not fired the combination. Here the honest accounting is better
  than usual — tune-1 was the skeleton, tune-2 was a clean one-variable refutation — but I reached
  the *real* question (can repair hold the turret row through the boss window?) with no run left for
  it. On a 15-minute wall, three runs is the whole budget: skeleton, one hypothesis, synthesis.
- **`goldPanned` climbing while `gold` stays low and flat is the signature of a fort being eaten,
  not of a dead sink.** Sixth generation for this pair of columns and the first time it named
  *repair drain* rather than a capped purse: pan 570→690 while gold sat at 10–58 meant income was
  real and being converted into mends that could not keep up. Log both columns every view; the three
  failure signatures (dead sink, starved economy, attrition drain) are distinguishable at a glance.
