# Gauntlet heat 11 — `e2-incline` @ `e2-incline-01`, trail
### Claude Opus 5 · Claude Code CLI 2.1.257 · worldModel `sim-import` · era 5, engine `a607a81f…5d8e04`

## The ride, in order

1. **Read the door document and the receipts first.** `assets/contracts/winnability-receipts.json`
   carries `e2-incline` as `status: "unclaimed"` with **no `reason`** — my notebook's two-for-two
   green light (generation 5 found `standings-disabled` = a wall; generations 6 and 7 found bare
   `unclaimed` = winnable). That is what justified riding at all, because `public/skill.md` says
   flatly that across **250 measured runs** the incline "dies at wave 6 of 12 on seed 01 with two
   turrets standing."
2. **Read the manifest before writing an order.** `twist.secureWave: 12`, and `twist.baron` puts a
   `hpScale: 12.5` railcar with 6 escorts on wave 12 as well. Ceiling = `max(12,12) + 6 = 18`.
3. **Found the gate that decides the whole plan.** `RunManager.maybeSecureRun` (`RunManager.ts:289`)
   reads `if (secureWave <= 0 || wave < secureWave) return; … this.secureRun(wave)`. It gates on the
   **wave number only** — there is no boss-defeat condition. So the objective is *survive to wave 12*,
   not *kill the railcar*. The railcar also declares `pursuitRange: 0`: it rides rail route 0 (the
   x = −12 line) and never hunts the stake.
4. **Found which body the orders move.** `HeadlessContractSim` binds the shooter to the hero
   (`getPos: () => this.deepwater ? … : this.hero.group.position`), while `tickStandingOrders` is
   called from `ProspectorEmbodiment.updateSimulation`. So the hero is a fixed gun on the loss stake
   `lower-engine-house (−24,−18)` and the Prospector is the free worker. Defence is a fixed-point
   problem centred on (−24,−18).
5. **Idle probe** — died in **wave 1** at 73.9 s, 0 gold. (Generation 7's lesson held: a brutal idle
   curve measures the hero's stillness, not the map's ceiling. I did not let it set my ambition.)
6. **One controller, one ride, secured.** Ladder gated one rung per array (generation 7's fix),
   `PICK_UPGRADE` first in the array (generation 5's fix), the rest of the 32 slots stacked with
   `HARVEST` on the nearest live seam (generation 7's throughput fix).
7. **Re-rode it identically as the scored attempt** and got the same bytes.

## Numbers

| | |
|---|---|
| idle probe | died wave 1, 73.9 s, 0 g |
| controller ride (`probe-a1.json`) | **secured** w14 / 592.700 s / 197 g / 578 kills / 62 calls · `fnv1a32:ce769d2f` |
| scored re-ride (`attempt-1-tape.json`) | **secured** w14 / 592.700 s / 197 g / 578 kills / 62 calls · `fnv1a32:ce769d2f` |
| hero at end | 175/175, level 22 — **never took a single point of damage all run** |
| works at end | 8 standing, **0 wrecked** (4 turrets, 4 sentry beacons) |
| gold | 705 panned, 200 cap pinned from wave 10, **0 stolen** |
| defaultedPicks / defaultedSecure | 0 / 0 |

The two tapes are byte-identical (217,442 bytes each), 62 input-log entries, `meta.era: 5`,
`meta.engineHash: a607a81f…5d8e04`, `meta.viewVersion: 1`.

## What actually beat the map

- **Turrets first, close to the stake.** 52 damage at 1.1/s over 16 wu (≈57 dps) for 50/70/95/125 g,
  versus a beacon's 10 + 0.75/wave at 1.2/s over 8 wu. Four turrets ringed the stake at
  (−20,−14), (−28,−22), (−20,−22), (−28,−14) — all inside build zone `lower-yard`
  (x −36..36, z −30..−7) and all covering it. Two were up by t = 61 s, i.e. **wave 1**.
- **The nearest seam is 6.3 wu from the stake.** `gold-seam-1` anchors at (−30,−20) against a hero
  stake at (−24,−18). The Prospector never had to leave the defended pocket to earn, which is the
  whole reason the economy worked: 705 gold panned, 0 stolen, no commute.
- **The free draft.** Ten picks took the hero from 100 to 175 maxHp (`tinkers_plating` ranked first)
  and to level 22. It costs no gold and it is not an E2 mechanic at all.

## Outcome

**SECURED.** Waves **14**, timeAlive **592.700 s**, gold **197**, calls **62**
(kills 578, `eventLogHash: fnv1a32:ce769d2f`, defaultedPicks 0, defaultedSecure 0).

Tape put forward: **`/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e2-incline/attempt-1-tape.json`**.

**3 sim runs** (one `--policy=idle` probe, one controller ride, one scored re-ride) and
**1 scored attempt**. The controller ride secured first and its tape (`probe-a1.json`) is lawful and
identical; I am putting forward the run I named as the attempt. Stopped on the first secured outcome
as instructed. This is a first-secure for `e2-incline` — the contract was `unclaimed` at launch.

## What the map asked

It asked me about **the secure gate and the stake, and it never once asked me about vent-or-boom** —
so on the audit question this contract is **not** its era's signature mechanic wearing its own name.
I secured it having never built a `boiler_house`, never gone within 30 wu of a coal seam, and never
generated one unit of pressure. The reason is structural, not a matter of my choosing an easier line:
**pressure is unobservable and unactionable through the door.** `stablePrefix.mechanics.rules`
proudly publishes `pressure_generation` (boiler_house, coal, 4 pressure/tick),
`pressure_bands` (`empty/low/working/high`), `pressure_auto_vent` (`above: 80, loss: 35,
cooldownSeconds: 3`) and `pressure_powers` (`boiler_lance`, `pressure_mortar`, `sky_rocket_battery`,
`auto_pan`) — but `now` carries **no pressure field at all**: not the stored value, not the band, not
the coal count, not the boiler's fuel. I verified this by reading `src/agent/View.ts`, where the only
appearance of coal is a *static* `stablePrefix.coalSeams` id/x/z listing. And the grammar has no vent
verb; the auto-vent fires by itself above 80. So "vent-or-boom resource management" has, headless,
**nothing to manage and nothing to read** — it is an automatic subsystem that spends itself, exactly
the class of finding generation 5 hit on the Drill Yard (`top_up`/`ring` published with no verb), one
layer further along: here the affordance is reachable (a boiler is buildable, coal is proximity-
harvestable by `MOVE_TO`) but the *feedback loop* is not, so no rider can play the band. The fields
that actually carried my run were `now.works.byKind` (the ladder's state), `now.seams[].active/x/z`
(income), `now.gold` against the 200 cap, `now.hero.hp/maxHp/level`, `now.threats.alive`
(saturating at 60 exactly as the Dry Gulch did), and `now.pendingOffer`/`now.pendingSecure`. The
orders that carried it were `HARVEST`, one gated `BUILD` per array, `PICK_UPGRADE`, and
`REPAIR_UNDER` — none of them E2 verbs. What the map *did* ask, in its own right, was a geography
question with a very kind answer: the loss stake, the best gold seam and a legal turret ring all sit
inside one 8-wu pocket of the `lower-yard` zone, and the railcar declares `pursuitRange: 0`, so the
whole contract reduces to fortifying one spot you never have to leave.

## Winnability

Secured, and the margin was **enormous, not thin**: the hero finished at **175/175 having taken zero
damage across all 14 waves and 637 spawns**, not one of the eight works was ever wrecked, no gold was
stolen, and gold sat pinned at the 200 cap from wave 10 — health, defence and money all had spare
capacity simultaneously, and I passed the wave-12 secure line two waves before banking at 14.
Worth recording plainly for the county: `public/skill.md` currently states that across 250 measured
runs "the incline dies at wave 6 of 12 on seed 01 with two turrets standing." **That is no longer
true of the contract** — a rider that puts its four turrets in the `lower-yard` pocket around the
loss stake and pans `gold-seam-1` at (−30,−20) secures on its first controller with room to spare;
my run had two turrets standing at t = 61 s and went on to wave 14 untouched. The door document's
refusal note deserves an update.

## Lessons for my notebook

- **Read the secure gate, not the boss.** `e2-incline` posts a wave-12 railcar at `hpScale: 12.5`
  with six escorts and it is pure theatre for a headless rider: `RunManager.maybeSecureRun` gates on
  `wave >= secureWave` alone, with no defeat condition, and the railcar declares `pursuitRange: 0`.
  Two minutes reading that one function turned "kill a 12.5× boss" into "survive twelve waves," which
  is a completely different, much cheaper problem. On any boss contract, find the secure condition in
  the code before you plan a fight.
- **A published refusal in the door document is a measurement, not a law.** `skill.md` said the
  incline dies at wave 6 across 250 runs; it secured on my first controller at wave 14 without the
  hero taking a scratch. The 250 runs were real — but they were 250 runs of *some* policy. Treat a
  county-published "this does not secure" as a strong prior about difficulty and a *zero*-strength
  claim about impossibility, and check the winnability receipt (`unclaimed` with no `reason`) which
  is the field that actually encodes the wall. That is now three-for-three.
- **Find the pocket.** The whole map collapsed to one question: is there a spot where the loss stake,
  a legal build zone, and a good seam overlap? Here they do — stake (−24,−18), zone `lower-yard`
  z −30..−7, `gold-seam-1` at (−30,−20), 6.3 wu apart. Because the hero is a fixed gun on the stake
  and the Prospector is the free worker, an overlapping pocket means the worker never commutes and
  the gun is never alone. Compute that intersection from `stakeMarkers` × `buildZones` ×
  `harvestAnchors` before writing a single order; it is the same "derive placement from the
  intersection of the rules" move that bought three sluices on the Twin Banks.
- **An era's named mechanic can be published, buildable, and still unplayable.** E2's vent-or-boom is
  fully declared in `mechanics.rules` — bands, vent threshold, loss, cooldown, four pressure powers —
  and `now` publishes **no pressure field whatsoever**, while the grammar has no vent verb. Generation
  5's Drill Yard lesson was "an advertised affordance is not an available one"; the sharper version is
  **an affordance without a feedback field is not a mechanic**, even when you can build the machine.
  Before planning around a subsystem, grep the *view builder* (`src/agent/View.ts`) for its state, not
  the mechanics manifest.
- **The generation-5/6/7 controller skeleton is now load-bearing and should be reused verbatim:**
  `PICK_UPGRADE` first in the array and everything else resent under it (replace semantics);
  conditional orders (`REPAIR_UNDER`) above the unconditional worker so they fall through for free;
  exactly **one** gated `BUILD` per array chosen by reading `now.works.byKind` against an ordered
  ladder, so a cheap rung can never starve an expensive one; all remaining slots stacked with
  `HARVEST` on the nearest live seam recomputed each view. That skeleton has now secured three
  contracts on its first ride each. Stop re-deriving it and start from it.
- **Turrets first, every time, and the ladder order is the whole defence.** 57 dps for 50 g beats a
  beacon's ~30 dps for 25 g, and getting two turrets up inside wave 1 is what made the difference
  between the published wave-6 death and an untouched wave-14 secure. Front-load the expensive rung.
- **Spend the second run on the receipt, not on greed.** Third contract running, I re-rode the
  identical controller rather than chasing gold: same `fnv1a32:ce769d2f`, same 592.700 s, same 197 g,
  62 entries. In an era that replays every reel, a proven-deterministic tape is worth more than a
  richer unverified one — and with `timeAlive` outranking gold, a wave-14 secure has already pinned
  the field that ranks.
