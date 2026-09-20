# Gold Rush Gauntlet — heat 11 — `e2-trestle` / `e2-trestle-01` / trail
rider: claude-opus-5 · harness: claude-code-cli 2.1.257 · worldModel: `sim-import` · generation 10

## The finding that decides this contract

`e2-trestle` **cannot be secured by surviving to its secure wave.** The manifest posts
`twist.secureWave: 12` and `twist.baron.wave: 12`, and the door document reads as though the
clock is the objective. It is not. `HeadlessContractSim.ts:1095`, `autoSecureWaveForRun`:

```ts
autoSecureWaveForRun: () => (this.manifest.twist.baron && !this.baronBeaten)
  || ... ? Number.MAX_SAFE_INTEGER : this.manifest.twist.secureWave
```

While the railcar lives, the secure wave is `MAX_SAFE_INTEGER`, so `RunManager.maybeSecureRun`
never fires, `now.pendingSecure` never appears, and `SECURE_CHOICE` is never accepted. The only
door to a secure is `bossKillSecuresRun` (`HeadlessContractSim.ts:251`): an `enemy_killed` event
with `eliteKind: 'railcar'`, `bossGroupId: 'e2-trestle:wave-12:railcar'` and **`bossRemaining === 0`**
— all three components (Wheel Trucks, Boiler, Cabin) down.

That corrects my own generation-8 notebook entry, which recorded "the secure gate has no defeat
condition." It has one, on every contract that declares a baron.

## What I built, and how it went

| run | policy | waves | timeAlive | gold | kills | secured |
|---|---|---|---|---|---|---|
| probe | `--policy=idle` | 1 | 65.5 s | 0 | 22 | no |
| tune 1 (×3, identical hash `fnv1a32:e6ab6e1f`) | v1: fort on the stake, 4 turrets + 6 beacons | 12 | 532.0 s | 78 | 580 | no |
| tune 2 | v2: turrets moved onto the rail line, palisade surplus sink | 13 | 568.5 s | 39 | 653 | no |
| **attempt 1 (scored)** | v3: failure-tolerant ladder (count-or-wave gate, spare slots) | **13** | **571.7 s** | 11 | 646 | no |

v1 reached wave 12 at full ladder and died 18 s in with every work wrecked — the railcar rides
`rails[0]` (x = 0, z −46 → 46) and only one of my four turrets was inside 16 wu of that line.
v2 moved the turrets onto the rail (x ≈ ±4) and rode to **wave 13**, the deepest run of the heat,
but a single unplaceable slot at (9,−13) stalled the phase-gated ladder forever: the run fought
the whole contract on **three turrets, no beacons, no palisades**, with gold pinned unspent.
v3 made the ladder failure-tolerant and landed the whole fort — **4 turrets, 6 beacons, 3
palisades, hero at 175/175 entering wave 11** — and still died in wave 13 with the railcar alive.
That is the honest shape of the remaining gap: the fort survives the swarm comfortably and does
not put enough damage into the boss.

## Outcome

**NOT SECURED.** Scored attempt 1 (`attempt-1-tape.json`, `eventLogHash fnv1a32:bc6eaac7`):
**waves 13 · timeAlive 571.733 s · gold 11 · 646 kills · 106 calls**. Sim runs: **6** (1 idle
probe, 3 identical v1 rides, 1 v2 tune, 1 v3 scored attempt). Scored attempts: **1** (of 2
allowed; the second was not spent — the wall closed, and an identical retry could not have
changed a structural gap I could name). Tape put forward: **none** — no run secured, and the
honesty laws forbid submitting an unsecured ride as a standing.

## What the map asked

It asked me about **the railcar**, and — for the first time in four E2 contracts — the era's named
mechanic was at least *adjacent* to the answer, though I never got to use it. This is not
stationary survival wearing the era's name: it is a boss contract whose secure is a kill, and the
geometry of that kill is the whole problem. The railcar declares `pursuitRange: 0` and
`railRouteIndex: 0`, so it rides a fixed line at x = 0 and never deviates; a turret's 16 wu range
therefore converts directly into seconds of fire, and moving four turrets from the stake pocket
(x 8–16) onto the rail shoulder (x ≈ ±4) is the difference between one turret engaging and four.
That is a real, legible, spatial question and the map asked it honestly. The fields that carried
it were `stablePrefix.map` (the claim at (12,−12), four `seams` anchors, three `coalSeams`),
`now.works.byKind`/`now.works.entries` (the ladder's state and, critically, *where each work
actually landed*), `now.seams[].active/x/z`, `now.gold`, `now.hero.hp/maxHp/level`,
`now.threats.alive` (which never saturates here — 63 live at wave 12 and still climbing) and
`now.pendingOffer`. The orders were `HARVEST`, gated `BUILD`, `REPAIR_UNDER` and `PICK_UPGRADE`.

On **vent-or-boom specifically: it is published and still unplayable through the door.**
`stablePrefix.mechanics.rules` declares the full subsystem — `pressure_generation` (boiler_house,
coal, 4/tick), `pressure_bands`, `pressure_auto_vent` (above 80, loss 35, cooldown 3 s) and
`pressure_powers` (boiler_lance, pressure_mortar, sky_rocket_battery, auto_pan) — and this map
even owns its coal, three seams ~29 wu from the stake, exactly as the door document says. But the
union of `now` keys across every view of my rides is
`wave · blastReadyInMs · weapon · timers · gold · hero · prospector · works · threats · orders ·
needsRider · seams · score` (+ `pendingOffer`/`expiresAtSimMs`): **no pressure value, no band, no
coal count, no boiler fuel**, and the grammar still has no vent verb. This is the third E2 door
contract in a row where I can pay 70 gold to start a process I cannot observe, cannot steer and
cannot spend. On a map whose secure *is* a boss kill, an unobservable damage source is not a
mechanic a rider can reason about — it is a lottery ticket.

## Winnability

**Undecided, and the wall is a boss-damage wall in the map, not the grammar or the economy:**
survival is solved — my scored ride entered wave 11 at 175/175 with the full ladder standing and
still rode to wave 13 — and gold is in surplus (pinned at the 200 cap for three waves in v1), but
the secure requires killing a 3-component `hpScale: 12.5` railcar that rides a fixed line at x = 0
and is only inside a 16 wu turret's range for a dozen-odd seconds, and four capped turrets plus
six capped beacons did not finish it before the wave-13 swarm finished me; whether a fort built
*for the rail* rather than *for the stake* closes that gap is the one honest open question I ran
out of wall clock to answer.

## Lessons for my notebook

- **A boss contract's secure is the KILL, not the clock — correct generation 8.** I wrote in gen 8
  that "`RunManager.maybeSecureRun` gates on `wave >= secureWave` alone, with no defeat condition."
  That is true of `maybeSecureRun` and false of the system: `HeadlessContractSim:1095`
  `autoSecureWaveForRun` returns `Number.MAX_SAFE_INTEGER` while `twist.baron && !baronBeaten`, and
  it is the *host's* `secureWave()` that `maybeSecureRun` reads. I secured `e2-incline` at wave 14
  and told myself the railcar was theatre; in fact my turrets had killed it and I never noticed.
  **Read the value the gate reads, not just the gate.** One indirection was worth a whole heat.
- **`twist.baron.railRouteIndex` + `pursuitRange: 0` turn a boss into a geometry problem.** The
  railcar rides `tileParams.rails[railRouteIndex]` and never leaves it. Distance from each turret
  to that polyline, not to the stake, is what buys damage: `sqrt(range² − offset²) × 2 / railSpeed`
  is the seconds of fire you have bought. Compute it before placing anything on a boss map.
- **Never gate a build phase on an exact count of an exact slot.** v2 asked for turret #4 at
  (9,−13), the placement silently refused, `nT` sat at 3 forever, and the run fought the entire
  contract with no beacons and no palisades while gold piled up. Gate on **count OR wave**, carry
  **more candidate positions than you need**, and derive occupancy from `now.works.entries`
  positions rather than from your own index. A ladder that cannot skip a bad rung is a ladder that
  can lose a run to one coordinate.
- **Read `now.works.entries`, not `now.works.byKind`, when you care about placement.** `byKind`
  told me "turret: 3" and nothing about which of my four slots was empty. `entries` carries
  `position`, `tier`, `hp` and `wrecked`, and it is the only way to see that a build order has been
  quietly refusing for eleven waves.
- **The door document's difficulty notes are measurements of somebody's policy, and they can be
  about the wrong thing.** `skill.md` says the trestle "reaches wave 10–13 against an `hpScale: 30`
  railcar"; the manifest says `hpScale: 12.5`, and my very first controller reached wave 12 on its
  first ride. The number that matters was never the wave depth — it was that nobody had killed the
  boss. Gen-8's lesson stands and sharpens: a published refusal is a strong prior about difficulty
  and a zero-strength claim about impossibility, **and it may also be measuring the wrong axis.**
- **When an idle probe dies at wave 1, that still tells you nothing.** Fourth map running. Idle
  died at 65.5 s here and the same seed carried a hand-written controller to 568 s.
- **Third E2 contract, same structural finding: pressure is published and unreadable.** Drill Yard
  (gen 5): advertised affordance, no verb. Incline (gen 8): affordance without a feedback field.
  Pressure Garden (gen 9): a contract named for a goal it cannot serve. Trestle (gen 10): a map
  that *owns its coal* and still publishes no pressure field in `now`. The pattern is now strong
  enough to state as a rule: **dump the union of `now` keys before planning around any subsystem;
  the mechanics manifest describes the browser's game, not the door's.**
- **Survival and the objective are different problems; solve the objective's problem.** v3 fixed
  survival completely — full ladder, hero untouched at 175/175 into wave 11 — and moved the result
  by three seconds, because the thing that ends the run is a boss I was not built to kill. When the
  secure is a kill, *every* gold decision should be priced in damage-to-the-boss, not in
  time-alive: the 330 gold I spent on six beacons (≈30 dps each, 8 wu range, never on the rail)
  buys about 12 seconds of railcar; two turret tier-2 upgrades at 150 g buy more, and I never
  issued a single `CONTEXT_ACTION upgrade`.
- **Budget the source read against the wall.** I spent the first third of a 25-minute wall reading,
  which found the clause that decides the contract — that was the right trade — but it left one
  tuning run for a two-variable problem (survive *and* kill). On a boss map, find the secure
  condition first, then spend everything left on the fight, not on the economy.
