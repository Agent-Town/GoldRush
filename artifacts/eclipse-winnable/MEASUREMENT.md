# eclipse-winnable — the Eclipse is won by play, not by tuning

Owner rulings this answers, verbatim: **"lets adjust the policy so the hard levels can be won"**
(2026-09-06 morning), **"Please continue with all work necessary to fix the epochs"** (evening), and
the one that turned out to decide it, **"yes! please! rider has to be able to move, I did not know
that was not possible before"** (2026-09-06, the `MOVE_HERO` slice).

**THE VERDICT: no lever shipped.** The Eclipse secures on BOTH bench seeds with no change to the
map. Seed `-02` secures under the air-wall prover's own unmodified policy — nobody had ever run it
there. Seed `-01` secures the moment the rider spends ONE `MOVE_HERO` walking the hero from where
the run drops it, at (0, 12), into the middle of the fort the map lets it build, at (0, 4). Six
authored levers were built and measured and every one of them secured as well, which is the honest
size of the problem: the losing ride was **11.267 s short of a 600 s gate**, not broken. None of
them shipped.

---

## 1. Measure first — the two rides, replayed tick for tick on this tree

`node artifacts/eclipse-winnable/measure-ride.mjs <label> <tape>` replays a tape through the engine
that wrote it and folds a once-a-second sample to one row per wave. Both replays reproduced their
tape's `eventLogHash` exactly (`623e0994` and `c25e7fd1`), so these are measurements of the rides
rather than approximations of them.

### heat 12's promoted attempt (`measure-heat12-e8-eclipse.json`) — LOST w19, 585.200 s, 190 gold, 884 kills

| wave | t | gold | kills | hero hp | threats | turrets (tiers) | beacons | grounds | suit |
|---|---|---|---|---|---|---|---|---|---|
| 5 | 180 | 55 | 126 | 150 | 4 | 3 [1,1,1] | 2 | 1 | 0 |
| 9 | 299 | 40 | 296 | 167 | 8 | 4 [1,1,1,1] | 4 | 2 | 51.7 |
| 10 | 329 | 70 | 350 | 167 | 10 | 4 [1,1,1,1] | 4 | 2 | 21.7 |
| 13 | 419 | 90 | 531 | 151.8 | 15 | 4 [1,1,1,1] | 6 | 2 | 0 |
| 14 | 449 | 40 | 596 | 120.6 | 14 | 4 [**2**,1,1,1] | 6 | 2 | 4.6 |
| 15 | 479 | 40 | 658 | 120.6 | 16 | 4 [2,**2**,1,1] | 6 | 3 | 12.9 |
| 16 | 509 | 190 | 720 | 91.0 | 18 | 4 [2,2,1,1] | 6 | 4 | 1.9 |
| 17 | 539 | 140 | 786 | 68.6 | 17 | 4 [2,2,**2**,1] | 6 | 4 | 0 |
| 18 | 569 | 140 | 850 | 38.2 | 18 | 4 [2,2,2,**2**] | 6 | 4 | 0 |
| 19 | 585 | 190 | 884 | 7.8 | 31 | 4 [2,2,2,2] | 6 | 4 | 0 |

The shadow lands at **t = 300 s** (solar `offline`). Wave 19 kills the hero.

### the air-wall prover on seed -01 (`measure-prover-e8-eclipse.json`) — LOST w19, 588.733 s, 140 gold, 895 kills

| wave | t | gold | kills | hero hp | threats | turrets (tiers) | beacons | grounds | suit |
|---|---|---|---|---|---|---|---|---|---|
| 7 | 240 | 20 | 204 | 175 | 4 | 4 [1,1,1,1] | 0 | 2 | 44.0 |
| 14 | 449 | 20 | 598 | 175 | 12 | 4 [1,1,1,1] | 6 | 3 | 14.6 |
| 15 | 479 | 80 | 660 | 175 | 14 | 4 [1,1,1,1] | 6 | 4 | 37.6 |
| 16 | 509 | 110 | 722 | 130.2 | 16 | 4 [1,1,1,1] | 6 | 5 | 60 |
| 17 | 539 | 20 | 787 | 100.6 | 16 | 4 [**2**,1,1,1] | 6 | 5 | 60 |
| 18 | 569 | 80 | 852 | 55.0 | 16 | 4 [2,1,1,1] | 6 | 5 | 55.6 |
| 19 | 588 | 140 | 892 | 9.4 | 27 | 4 [2,1,1,1] | 6 | 5 | 60 |

Same shadow at t = 300 s, same death wave, 3.5 s later than heat 12 with a WEAKER fort — because
its hero was untouched at 175 hp until wave 16 while heat 12's had been bleeding since wave 7.

## 2. The binding constraint, with numbers

**The fort's damage ceiling, and a purse smaller than the only rung left above it.**

- The count cap: `Balance.turret.maxCount` 4 (`src/game/Balance.ts:535`) and
  `Balance.beacon.maxCount` 6 (`:519`). Both rides stand the full fort — heat 12 by t = 449 s, the
  prover by t = 449 s — and neither can build another gun after that.
- The tier cap: `Balance.tiers.turret[2].cost` is **300** (`:757`) and `Balance.economy.bankCap` is
  **200** (`:824`). The last rung is unbuyable by construction on any contract that authors no
  purse. Heat 12 reached the ceiling the caps permit — **four turrets, all at tier 2, six beacons,
  at t = 550 s** — and died 35 s later.
- The consequence, measured directly: heat 12's purse **sat at exactly 190 gold from t = 435 s to
  its death at t = 585 s** — 150 seconds — while it killed **314 more enemies** whose income
  `Economy.canReceiveIncome` (`src/game/Economy.ts:266`) refused, because 190 + a mote overflows the
  200 cap. Full purse, nothing to buy, frozen DPS, and a board that grew 14 → 31 alive over the same
  window.

**But the constraint is not what makes the map unwinnable, because the map is not unwinnable.** Both
rides ended 11.3 s and 14.8 s short of a 600 s gate, and the missing seconds were sitting in a verb
neither rider used.

## 3. The lever ladder — every arm measured

One arm = the authored bytes patched, one prover ride in a fresh process, the ORIGINAL bytes
restored in a `finally` (`arm.mjs`; `arm-fort.mjs` for the two that need a Balance literal as a
throwaway probe). Seed `e8-eclipse-01` unless the row says otherwise. `hp` is the hero at the last
turn of the ride. Raw rows: `LADDER.log`; full reports: `arm-<label>.json`.

| arm | what it changed | secured | outcome | hp left | hash |
|---|---|---|---|---|---|
| **control** | nothing (the air-wall ride, reproduced byte for byte) | no | w19, 588.733 s, 140 g | 0 | `ab543f56` |
| **control (seed -02)** | nothing | **YES** | w20, 600 s, 55 g | **3.0** | `e5dc3f16` |
| bank-400 | `twist.economy.bankCap` 400 | no | w19, 588.733 s | 0 | `ab543f56` (identical) |
| bank-1200 | `twist.economy.bankCap` 1200 | no | w19, 588.733 s | 0 | `ab543f56` (identical) |
| seam-140 | `twist.seamYieldMult` 1.4 | no | w19, **589.333 s** (+0.6 s) | 0 | `8c39c3be` |
| grit-100 | `twist.hero.maxHpBonus` 100 | yes | w20, 600 s | 71.8 / 275 | `10ef585e` |
| grit-300 | `twist.hero.maxHpBonus` 300 | yes | w20, 600 s | 271.8 / 475 | `b495fd34` |
| roster-hp80 | both roster variants `hpScale` 0.8 | yes | w20, 600 s | 175 / 175 | `bcec6492` |
| fort-t5b6 (a) | turret cap 4 → **5** (Balance probe) | yes | w20, 600 s | **10.2** | `8a7373c9` |
| fort-t6b9 (a) | turret 4 → 6, beacon 6 → 9 (Balance probe) | yes | w20, 600 s | **16.6** | `ad799e34` |
| buildline-apron (b) | an eighth build zone around the hero; same 4+6 fort, beacons re-sited | yes | w20, 600 s | 115 | `292ce5d5` |
| **kite (0, 4)** | **nothing — one `MOVE_HERO`** | **YES** | w20, 600 s, 80 g, 923 kills | **107.8** | `f1614ea6` |
| kite (0, 0) | nothing — one `MOVE_HERO` | yes | w20, 600 s | 167.8 | `1723fe17` |
| kite (0, 26) | the same order, aimed at the regolith field | **no** | **w3, 113.4 s** | 0 | `77482b57` |
| kite (0, 4), seed -02 | nothing — one `MOVE_HERO` | yes | w20, 600 s, 130 g | **175 / 175** | `49302624` |

What the ladder says, arm by arm:

- **The purse is not the prover's wall.** 400 and 1200 replay the losing ride BYTE-IDENTICALLY: this
  rider never reaches 200 gold (its peak is 170), so the cap it never touches cannot bind it. The
  purse was *heat 12's* wall, not this one's — two riders, two different ceilings, the same death
  wave.
- **Income is not the lever either.** A 40 % richer seam bought **0.6 seconds**.
- **The master's arm (a), the fort cap, secures — on a knife edge.** A fifth turret crosses the gate
  with 10.2 hp of 175 left; a sixth turret and three more beacons with 16.6. It also cannot be
  shipped inside this slice's firewall: `BuildSystem` sizes its pools from `def.maxCount` at module
  load (`createFamily`, `src/systems/BuildSystem.ts:3232`), the browser's beacon `InstancedMesh` is
  sized from `Balance.beacon.maxCount` (`src/world/LightRig.ts:653`), `E6`/`E7`/`E9ArsenalSystem`
  size mount arrays from `Balance.turret.maxCount`, `RunSuspend.ts:2665` bounds a repair index by
  it, and `MechanicsManifest.ts:1094` publishes exactly that many price rungs. That is why it was
  measured as a Balance probe rather than built.
- **The master's arm (b), the second build line, secures comfortably** (115 hp) and is pure data —
  and it is the same physical idea as the kite arm with the roles reversed: it moves the fort to
  the hero instead of the hero to the fort.
- **The master's arm (c), dark-wave scaling, secures most comfortably of all** (the hero is never
  touched) and is the largest change of the three.
- **And none of them is needed.** One `MOVE_HERO` does it with nothing authored.

## 4. Why the hero post is the answer, and why it is not a trick

`MOVE_HERO {pos}` landed on 2026-09-06 and is published on this contract's own card
(`hero_orders`, `MechanicsManifest.ts:112`, `pilots.headless: "the rider pilots the run's only
hero"`). The air-wall prover was written before the verb existed, so it left the hero standing where
the run drops it — at (0, 12), six world units NORTH of every gun the map allows, whose only build
ground near the claim is `dome-cluster-pad-center` (-6..6, -6..6). (0, 4) is the centroid of the ten
works that pad holds: four turrets on z = 1..2, six beacons on z = 6. An enemy that comes for the
hero there has to walk into all six beacon circles at once instead of grazing their northern rim.

It is a nudge, not a leash, and the moon does the rest: this map authors `gravity.movement:
"floaty"` at `feelG` 0.6, so `E8PhysicsSystem.filterMovement` gives the hero momentum. One
`MOVE_HERO` sends it through the post and it coasts past; the prover re-issues only when the view
shows it more than a metre out, which is why the trace reads as a slow drift between z = -2 and
z = 10 rather than a hero pinned to a dot.

**The position is the mechanism, and that is falsified rather than asserted:** the identical order
aimed at (0, 26) — the regolith field, away from the guns — dies at **wave 3, t = 113.4 s**. The
order is not what wins; where it points is.

A human never needed the verb: the browser refuses `MOVE_HERO` with `HERO_NOT_YOURS` precisely
because a human already pilots the hero with keys. So the Eclipse was winnable for a player all
along, and is now winnable for a rider.

## 5. The proof

`node artifacts/eclipse-winnable/prover.mjs --contract e8-eclipse --seed <seed> --runs 2 --trace`
(the air-wall prover's Eclipse policy, carried forward verbatim, plus the hero post; door grammar
only — `HARVEST`, `BUILD`, `MOVE_TO`, `MOVE_HERO`, `HOLD`, `BLAST_AT`, `CONTEXT_ACTION`,
`PICK_UPGRADE`, `SECURE_CHOICE`, driven over `scripts/gr-sim.mjs` in a separate process; no engine
import, no minted gold, no balance edit, and the contract bytes untouched).

| seed | outcome (run 1 = run 2, byte-identical) | hero at the secure | air latch | tape |
|---|---|---|---|---|
| `e8-eclipse-01` | SECURED w20, 600.000 s, 80 g, 923 kills, 79 calls, `fnv1a32:f1614ea6` | 107.8 / 175 | complete, 5 grounds credited (4 required), `{4, 4}` unchanged | `fnv1a32:69cba8f2` |
| `e8-eclipse-02` | SECURED w20, 600.000 s, 130 g, 922 kills, 91 calls, `fnv1a32:49302624` | 175 / 175 | complete, 4 grounds credited (4 required), `{4, 4}` unchanged | `fnv1a32:bc42661a` |

Both tapes replay through `scripts/assay-replay-agent.mjs` to their own hash exactly
(`69cba8f2` and `bc42661a`, 18 001 ticks each, `engine: headless-contract-sim`).

The wall is still paid on air: the latch closes at t = 412.7 s on seed -01 with four grounds
credited inside their windows (a fifth follows), and the breathless pans in both rides (10 on -01,
148 on -02) are pans that paid gold and credited NOTHING toward the latch, exactly as the window
rule intends.

## 6. What shipped

Nothing that changes the game. `assets/contracts/epoch-8-orbital/contracts.json`,
`assets/contracts/null-floors.json`, `src/**` and every e2e spec are **untouched**, so no floor
moves, no card changes, and no other map is affected. What shipped is this measurement, the prover,
and `scripts/eclipse-winnable.test.mjs` — a guard that makes the honesty rule executable: the
Eclipse row must author no balance lever, the four `Balance` globals the arms would have raised must
stay where they are, the air wall must stay `{4, 4}`, the map must keep publishing `hero_orders`,
and `MOVE_HERO` must still actually steer this map's hero.

**On the owner's desk (a design fork, not a defect):** every lever above secures, at a measured
price. If the Eclipse should be *easier* than "winnable by a rider that stands its hero in its own
fort", the cheapest honest choices are the second build line (pure data, 115 hp of margin) or a
`twist.hero.maxHpBonus` of 100 (one line, the Relay Valley's own precedent, 71.8 hp of margin). One
word picks one; the default is that the map stays as hard as it is.
