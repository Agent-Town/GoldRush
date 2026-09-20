# playability-first-wave-e2-e6 — the first minute, measured and cured

**Task:** `tasks/playability-first-wave-e2-e6.md` · **Branch:** `feat/playability-first-wave-e2-e6`, cut from main `894c88287` · **Implementer:** Opus, scratch worktree, Anthropic subscription (`tasks/CODEX-WALL` stands) · **Date:** 2026-09-16
**Owner, verbatim (2026-09-16):** *"yeah, we have tokens left - lets work on these failing contracts"*.

## VERDICT

| contract | before | after | outcome |
|---|---|---|---|
| `e2-trestle` | dead at wave 1, 57.3 s sim | **wave 2 at 86.3–87.1 s sim**, 3/3 passes x 2 projects | **CURED in the map's own data** |
| `e2-incline` | dead at wave 1, 71.9 s sim | **wave 2 at 80.8–81.7 s sim**, 3/3 passes x 2 projects | **CURED in the map's own data** |
| `e6-picnic` | dead (objective loss) at 36.9 s sim, hero at 100/100 HP | unchanged: dead at 37.5 s (desktop) / 37.7 s (390 px) | **STOPPED — no data cure exists that does not make the map's own run card false.** Two measured options below; owner's call |
| `e1-drill-yard` | "reached wave 0 after 374 s" — a census defect | **the smoke now asks it its own question and it answers**, 3/3 x 2 projects | **CURED in the instrument** (`e2e/playability-smoke.spec.ts`, no map change) |

`src/**` and `Balance.ts` are **untouched** on this branch. The two experimental `src/` patches quoted in section 4 were applied, measured, and reverted with `git checkout --`; neither is on the branch.

---

## 1. The mechanism all three rows share (VERIFIED by reading the engine)

`WaveSystem.spawnAt` (`src/systems/WaveSystem.ts:576-623`) places every trickle and every wave pulse on a ring of
`Balance.waves.spawnRingRadius` = **26** units around `territoryRingSpawnCenter(wave)`. That centre is
`this.heroPosition` unless `hasTerritoryRing() && wave <= tileParams.lanes.territoryRingBiasWaves` (`:1005-1011`), and
`Game.applyMetaProgress` sets `this.territoryRingPresent = false` **unconditionally** (`src/game/Game.ts:9050`; it is
assigned in exactly two places, both `false`). So on every board contract the spawn ring follows the player.

Two things can take an enemy off that ring:

* **A spawn gate.** If the roster variant declares `spawnGates` for the edge it drew, `applyVariantSpawnGate`
  (`:1013-1021`) puts it at that fixed world point and **returns before the clamp**.
* **Nothing else.** Ungated, the ring point is clamped to `+/-Terrain.CLAIM_HALF` (`:1023-1025`). A hero standing within
  26 units of a map boundary therefore has enemies materialise **a few units away, with no approach and no warning.**

That is the whole of F-PLAY-E2-1 and half of F-PLAY-E2-2. The smoke's unassisted player walks straight into it: the
"moves" step (`e2e/playability-smoke.spec.ts:425`, `hold KeyD 1 s` then `hold KeyW 1 s` at `timescale=4`) is **8
sim-seconds** of walking, about 34 world units, and then the hero stands still for the rest of the run.

| contract | hero start (`stakeMarkers[heroStart]`) | where the unassisted player ends up | nearest spawn point, before |
|---|---|---|---|
| `e2-trestle` | `trestle-entry` (12, -18) | (35.5, -42.9) | south ring z = -68.9 -> **clamped to -48** = 5.1 u |
| `e2-incline` | `lower-engine-house` (-24, -18) | (0, -42) | `rail_tough` south gate (12, -46) = **12.65 u** |
| `e6-picnic` | engine default (0, 12) | (24, -12) | north ring (24, 14) = **10.8 u** from `sandwich-east` |

**Wave clock, for the deadlines below:** `waveInterval = Balance.waves.waveInterval (30) / twist.waveCadenceMult`
(`WaveSystem.ts:838-841`), and `reset()` sets `nextWaveAt = waveInterval`, so wave *n* lands at *n* x interval.
Trestle 42.86 s -> **wave 2 due at 85.7 s**. Incline 40.0 s -> **80.0 s**. Picnic 30 s -> **60.4 s**.

**Instrument note.** Every "before" number below was reproduced on this worktree with a plain boot
(`probe/probe-before-nodebug.jsonl`) and then re-run with `&debug` added so `__GR_TEST__.enemyPositions()` could name
the variant, its HP and its distance (`probe/probe-before-debugseam.jsonl`). **The two arms die at the same sim
second** — 57.33/57.33, 71.87/71.87, 36.93/37.07 — so the debug seam is a reader here, never a lever.

---

## 2. F-PLAY-E2-1 — The Trestle

### The killer
`e2-trestle` is **the only E2 contract with no `spawnGates` on any roster entry.** `e2-hill-mine`,
`e2-pressure-garden` and `e2-incline` all carry them; the Trestle carries none, so all four of its declared lanes
spawn on the hero ring and clamp. The unassisted hero stands at (35.5, -42.9), 5.1 units inside the south boundary
and 12.5 inside the east one.

| sim s | HP | alive | what is in contact | note |
|---|---|---|---|---|
| 12.9 | 100/100 | 3 | `steam_wrecker` x2 at 15.5 u | east-edge clamp, closing |
| 18.9 | 92 | 4 | `rail_tough` at **0.3 u** (hp 10.6, contact 8) | south-edge clamp |
| 20.9 | 70.8 | 3 | `steam_wrecker` x3 at **0.0 u** (hp 41.6, contact 8) | |
| 24.5 | 46.8 | 3 | | half the bar gone before wave 1 |
| 42.9 | 46.8 | 8 | wave 1 lands | |
| 46.4 | 71.8/125 | 6 | (third level-up card) | |
| 53.6 | 34.6 | 5 | `rail_tough` x3 at **0.1 u**, `steam_wrecker` at 3.2 u | |
| **57.33** | **0** | 6 | `rail_tough` x2 at 0.2, `steam_wrecker` x3 at 0.4 | **dead, 28.4 s short of wave 2** |

19 kills. The tank is the **Steam Wrecker** (`hpScale 1.65` -> 41.6 HP on a trickle spawn, contact damage 8,
`speedMult 0.74`): a level-2 hero with the base Spark Rig (12 damage, 2.0/s, range 10) needs about 2 s per wrecker and
there are never fewer than two on top of it.

### The cure — spawn gates, on the convention its three siblings already use (boundary |46| of a 96-unit tile)

| key | old | new | reason |
|---|---|---|---|
| `twist.enemyRoster[rail_tough].spawnGates` | *absent* | `south (0, -46)`, `north (0, 46)` | the two mouths of the map's own rail: `tileParams.rails[0]` runs x = 0 from z = -46 to z = 46. The Rail Toughs walk the rails onto both approaches — the card's *"Rail Toughs and Steam Wreckers press both approaches."* |
| `twist.enemyRoster[steam_wrecker].spawnGates` | *absent* | `east (46, 20)`, `west (-46, -20)` | one flank per approach: east onto the north approach, west along the mine spur whose west end is (-30, -18) on the south approach. Both clear of the river band (`water.visualHalfWidth` 10), so `keepSpawnOutOfDeepWater` never moves them. |
| `twist.enemyRoster[coal_thief].spawnGates` | *absent* | `north (0, 46)` | the thieves want the coal, and the seams are on the SOUTH approach (`twist.coalSeams` (-16,-20), (-20,-16), (-12,-24)) — so they come over the trestle, *"the only easy crossing over deep water."* |

Nearest gate to the unassisted player's standing spot is now (0, -46) at **35.6 units**.

### What it does, measured
Wave 2 reached at **86.3–87.1 s sim** on both projects, three passes each; the hero holds 100/100 until 77 s and
finishes wave 1 at 93/125 with **22 enemies alive and 15 Steam Wreckers stacked 3–15 units away**. The map is still
closing in — it just no longer executes the player in the opening minute. Left alone past wave 2 the unassisted run
**still dies, at 116 s** (`probe/probe-long-after.jsonl`), before wave 3 is due at 128.6 s.

---

## 3. F-PLAY-E2-2 — The Incline

### The killer
Two contributions, both geometric:

1. **The `rail_tough` south gate at (12, -46) is 12.65 units from where the unassisted player stands** (0, -42). Rail
   Toughs (37.9 HP, contact 8, `speedMult` 1.12) arrive about 4 s after every spawn. First blood at 43.9 s: 100 -> 84.
2. **The two `steam_wrecker` gates at (+/-46, 24) are 70–80 units away on the FAR bank.** Every wrecker funnels
   through the x = +12 ford, so the map silently banks its whole first minute of wreckers and delivers it at once:
   **14 alive** in single file down x ~ 0 by t = 54, arriving continuously from t ~ 58.

| sim s | HP | alive | what is in contact |
|---|---|---|---|
| 40.8 | 100/100 | 16 | wave 1 lands; `rail_tough` x3 at 9.9 u from the south gate |
| 44.8 | 84 | 15 | `rail_tough` x2 at **0.2 u** |
| 58.5 | 78.8 | 16 | the wrecker queue starts landing (`steam_wrecker` at 6.1 u and closing) |
| 65.7 | 49.6 | 16 | `rail_tough` x3 at 0.3, `steam_wrecker` x13 at 0.6 |
| **71.87** | **0** | 16 | `steam_wrecker` at 0.1 | **dead, 8.1 s short of wave 2** |

16 kills; about 6 HP/s of attrition over the last 14 s.

### The cure

| key | old | new | reason |
|---|---|---|---|
| `tileParams.lanes.spawnEdges` | `["south","north","east","west"]` | `["north","east","west"]` | The card's own rule 2 already gives the south approach to the boss: *"The lower rail carries the wave-12 railcar; the upper rail carries the escorted ore cart."* Nothing else comes up behind the lower yard now — the Incline is pressed from above and from the flanks, which is what *"Twin haul lines climb from one wet lower yard to the ore benches above"* describes. `e2-hill-mine` — the E2 contract the census shows passing — likewise opens three edges. **The railcar is unaffected:** a component boss is placed from `tileParams.rails[twist.baron.railRouteIndex].points[0]` (`WaveSystem.ts:882-895`) = (-12, -46), the south end of the lower line, never from a lane edge. Verified behaviourally: `er01-e2-census` still asserts `secured: true, calls: 0` with `waves >= secureWave` (12), which per F-1493-1 requires the declared Baron to die. |
| `twist.enemyRoster[coal_thief].spawnGates` | *absent* | `north (-12, 46)` | the last ungated lane on the map. The thief now comes down the lower haul line and crosses at `lower-line-crossing` (x = -12) for the seams in the lower yard, *"between the haul lines, east of the engine house."* |

`rail_tough` keeps `spawnEdges ["south","north"]` **and both of its gates**, deliberately: the variant still declares
which gate it would use on the south lane, and `lanes.spawnEdges` is the switch that decides whether the lane opens.
That is the two-level design the engine implements (`enemyRosterFor` filters variants by edge *after* `pickEdges`
draws from the lane list).

### What it does, measured
Wave 2 reached at **80.8–81.7 s sim** on both projects, three passes each, finishing wave 1 at 60.4/100 HP. Left alone
past wave 2 the unassisted run **still dies, at 95.5 s**.

**The cost, stated plainly:** removing the fourth lane makes the Incline materially softer for a rider that does
nothing — its null floor goes from wave 1 / 73.9 s to **wave 2 / 119.3 s** on seed 01 and **wave 5 / 206.1 s** on seed
02. Neither secures (section 6), and the public-verb prover still secures at wave >= 12, so the map's ceiling is
unchanged; but a drainer should see that number rather than find it.

---

## 4. F-PLAY-E6-1 — The Picnic: **STOPPED, with two measured options**

### The killer is not an enemy
`runState = dead` at **36.93 s with the hero at 100/100 HP and zero damage taken.** The run ends because
`PicnicHoldSystem.update` (`src/systems/PicnicHoldSystem.ts:94-97`) declares the loss when **all three** sandwich
stakes are claimed. A stake is claimed when one machine stands inside its 3-unit disc for `PICNIC_HOLD_SECONDS` = 6
with no structure inside it and no hero that has dealt damage in the last 5 s (`:82-93`, `:106-115`). One machine in
four presses a stake (`enemy.id % 4`, `PICNIC_STAKE_PRESS_WEIGHT` = 0.25, `:74`); the rest chase the hero.

Measured claim times, plain boot:

| stake | position | claimed at | claimant |
|---|---|---|---|
| `sandwich-west` | (-16, 18) | **~14.5 s** | Feral Toaster, 18.9 HP, contact 6 |
| `sandwich-center` | (0, 26) | **~25.8 s** | Feral Toaster |
| `sandwich-east` | (16, 18) | **37.0 s** | Feral Toaster |

Hero at (24, -12) — 30+ units from every disc, outside the Spark Rig's range of 10 — for the whole run. Wave 1 landed
at 30.4 s; wave 2 was due at **60.4 s**.

### Why no data lever lands it

Four gate layouts were built and measured (`probe/probe-p1.jsonl`, `p2`, `p3`, `probe-meadow-p3.jsonl`):

| layout (`feral_toaster` + `lawn_shepherd` gates) | last stake falls | reached wave 2? |
|---|---|---|
| none (shipped) | 37.0 s | no |
| `north (0,62)`, `west (-62,10)`, `east (62,10)` | 38.5 s | no |
| `north (0,62)`, `west (-62,-34)`, `east (62,-34)` | 56.0 s | no |
| `north (0,62)`, `west (-62,-50)`, `east (62,-50)` | **74.0 s** | **yes — 61.1 s, both projects** |

The last layout works. **It was built, gated green on every suite, and then reverted**, because of what it costs:

1. **It makes the map's own run card false.** Rule 3 reads *"The first machines reach the meadow inside ten seconds
   and the purse opens empty, so pan the meadow seams, then fence a stake."* On the shipped data that is true — the
   first trickle spawns at 7.4 s on the hero ring and the hero starts inside `mesa-meadow`. With the far gates,
   **measured 27.1 s** for the first machine to enter the meadow (`probe/probe-meadow-p3.jsonl`, first enemy with
   z in [2,38] and |x| <= 28). The phrase is pinned by `e2e/e6-picnic-opening.spec.ts:366`
   (`expect(card, 'the first threat is timed').toMatch(/inside ten seconds/i)`), which is **outside this task's
   firewall** — so the copy cannot be re-voiced here, and shipping the gates without re-voicing it ships a card that
   lies (Mistake #10's own question: what does the PLAYER see?).
2. **It empties the prover's opening fight.** Re-recorded null floors on that tree: `e6-picnic-01` kills **25 -> 0**,
   `e6-picnic-02` **15 -> 0**. In the browser a passive hero still killed 13 in 60 s, so it is engine-dependent — but
   it is a real number on the map's own bench seeds and it moves in the wrong direction.

Everything else the map owns was checked and is not a lever: the hero start is fixed at (0, 12) by the owner's
2026-08-22 *"flip the stakes"* ruling and **must not move** (on a picnic contract every `stakeMarkers` entry is a loss
stake, so a `heroStart` marker would put the hero on its own disc and idle would SECURE — the exact Law-2 break that
ruling cured); `lanes.spawnEdges` is named in goal 1 (*"waves from three sides"*); stake positions are pinned by
`er01-e6-census.spec.ts:239-243`, and any layout that gives each gate its own nearest stake makes the three falls
*parallel* instead of serial, which is strictly worse (the 38.5 s row above).

### The exact `src/` hunk — measured, reverted, not landed

Two `src/` dials were tried and **do not** cure it, recorded so nobody spends the same hour:

* `PICNIC_STAKE_PRESS_WEIGHT` 0.25 -> 0.125 (one machine in eight): **36.8 s** vs 36.9 s. `enemy.id` is a pool slot
  index and the live slots are the low ones, so the modulus barely thins the stream.
* a 25-second first-claim grace (`stake.claimed` gated on `at >= 25`): **37.9 s**. All three timers saturate at 6
  during the grace and all three claim the instant it lifts.

Both failed for one structural reason: **once machines are in the meadow the three discs fall within about 12 s of
each other**, so any single delay dial just slides the block. The cure has to make the falls *serial*. This one does,
and was measured:

```diff
--- a/src/systems/PicnicHoldSystem.ts
+++ b/src/systems/PicnicHoldSystem.ts
@@
 export const PICNIC_ACTIVE_DEFENSE_SECONDS = 5;
+/**
+ * A sandwich that has just been taken does not hand the next one over for free: the pressure rule
+ * stands the machines down for one stake-clock afterwards, so the three fall in sequence rather
+ * than together. Without it an unassisted first-time player loses all three at 14.5 s / 25.8 s /
+ * 37.0 s and never sees wave 2 (docs/bench/playability-census-2026-09-15.md, F-PLAY-E6-1).
+ */
+export const PICNIC_CLAIM_STANDDOWN_SECONDS = 20;
@@ class PicnicHoldSystem
   private lost = false;
+  private lastClaimAt = Number.NEGATIVE_INFINITY;
@@ pressureTarget(
-    if (!this.enabled || enemy.id % Math.round(1 / PICNIC_STAKE_PRESS_WEIGHT) !== 0) return null;
+    if (!this.enabled || at - this.lastClaimAt < PICNIC_CLAIM_STANDDOWN_SECONDS) return null;
+    if (enemy.id % Math.round(1 / PICNIC_STAKE_PRESS_WEIGHT) !== 0) return null;
@@ update(
-      if (stake.timer >= PICNIC_HOLD_SECONDS) stake.claimed = true;
+      if (stake.timer >= PICNIC_HOLD_SECONDS) { stake.claimed = true; this.lastClaimAt = at; }
@@ reset(
     this.lost = false;
+    this.lastClaimAt = Number.NEGATIVE_INFINITY;
```

**Measured on that patch (`probe/probe-hunk-standdown20.jsonl`): reaches wave 2, and the unbuilt run still ends — at
82 s, hero at 80.4 HP.** It touches no card text, no stake position and no owner ruling, and leaves the loss rule
("lose all three and the run is over") exactly as written. It was reverted with `git checkout --`; `src/` is clean.

### The owner's call (one line for the desk)
> **The Picnic reaches wave 2 either by a `src/` stand-down between stake claims (measured, no card change), or by
> three far spawn gates in its own data (measured) plus re-voicing run-card rule 3 and re-pointing
> `e2e/e6-picnic-opening.spec.ts:366`. Both are built and measured; neither is landed. Say which.**

---

## 5. F-PLAY-E1-1 — the Drill Yard exemption (instrument, not map)

`e2e/playability-smoke.spec.ts` now declares the rule in its own words, in the file header:

> **THE PRACTICE EXEMPTION, IN THIS SPEC'S OWN WORDS (F-PLAY-E1-1, declared 2026-09-16).**
> A contract that declares `practice` (`ContractPracticeMode`, src/meta/ContractFamilies.ts:618) is a PRACTICE
> GROUND, not a wave board: its `scheduledWaves` field is typed `false`, the wave system only spawns when the player
> rings the yard's own bell, and so "reaches wave 2" is a question the map can never answer however well it plays.
> The 2026-09-15 census measured exactly that and called it a census defect rather than a map defect: `e1-drill-yard`
> "reached wave 0 after 374 s sim (runState `playing`, HUD wave 0) — the Drill Yard has no waves to reach, a by-design
> exemption the smoke does not declare" (docs/bench/playability-census-2026-09-15.md). It is declared here now.
>
> The exemption is not a skip. Such a contract is asked ITS OWN question over the SAME window an ordinary contract
> gets to reach wave 2 (two default wave intervals, 60 sim-seconds): is the practice objective still reachable at the
> end of it? — the yard is live and says itself that it schedules no waves; every station and target it declared is on
> the board; every target is standing and undamaged, so there is still something to practise on; and the run is still
> `playing`, so the player is alive to walk over and do it.

Implementation: `practiceObjective()` polls the same read-only diagnostics (`drillYard`, published on every contract
and null where no practice mode is declared, `src/vite-env.d.ts:189`) until `timeAlive >= 60`, then checks the five
clauses above against the contract's **own** `practice.stations` / `practice.targets` declarations. No debug seam, no
map change, no other cell touched.

Measured, six runs (3 passes x 2 projects): `practice objective reachable after 60.1–62.0 s sim: 5 targets standing,
2 stations placed, no scheduled waves to reach`. The pre-cure measurement that motivated each clause is in
`probe/probe-drill.jsonl`: at 132 s the unassisted hero is alive at (23.5, 5), all five targets standing at full
25.2 HP, `faucet.grants` 0, `bell.rings` 0, `persistence.scheduledWaves` false.

---

## 6. Guards — every one, with its exact result

| gate | result |
|---|---|
| `npx tsc --noEmit` (pre-flight, and final) | **rc=0** both times |
| `npm run build` (pre-flight, and final) | **rc=0** both times |
| `playability-smoke -g "e2-trestle\|e2-incline\|e1-drill-yard"`, both projects, `--workers=1`, **pass 1 / 2 / 3** | **6 passed / 6 passed / 6 passed** (2.1 min each) |
| `playability-smoke -g "e6-picnic"`, both projects | **2 failed**, as filed: `reached wave 1 after 6.0 s wall / 37.5 s sim (desktop), 37.7 s (390 px), runState=dead` — unchanged from the census row |
| `e2e/er01-e2-census.spec.ts` | **4 passed** — all four E2 contracts still `secured: true, calls: 0`, `waves >= 12`, `eventLogHash` identical across the two runs of each seed |
| `e2e/er01-e6-census.spec.ts` | **4 passed** |
| `e2e/task-025-bandits-dont-swim.spec.ts` + `m1-01-claim-jumpers-death` + `m2-01-build-menu`, both projects | **34 passed** (2.4 min), unmodified |
| `e2e/e2-trestle.spec.ts` + `e2e/e2-incline.spec.ts` + `e2e/e6-picnic-opening.spec.ts` + `e2e/e6-roster.spec.ts`, both projects | **16 passed** (5.2 min) — adjacent map suites, unmodified |
| `node scripts/null-floor-anchors.mjs` (re-record) | **83 null floors written, 276.1 s** |
| `node scripts/null-floor-anchors.mjs --check` | **83 null floors match, 282.7 s** — clean, and byte-identical to the record, so the new floors are deterministic |
| `node scripts/render-skillmd-contracts.mjs` | rc=0, **`public/skill.md` unchanged** (spawn gates and lane lists are not rendered into the fences) |
| `node --test scripts/skillmd-guard.test.mjs` | **16 pass / 0 fail** |
| zero console / page errors, plain boot, desktop **and** 390 px | **0 console, 0 page on all 20 smoke rows** (`smoke-rows.jsonl`, `clean` cell) |
| `computeEngineHash()` on this tree | **`587360f8913bad0809d13216422081101c5dc677bb6634009d7bb0470c9d205e`** (contracts are in `ENGINE_SOURCE_INPUTS`; the drain pins the era) |

### Null floors, before -> after

4 of 83 pairs moved; all four are on the two cured maps; **nothing secures.**

| pair | before | after |
|---|---|---|
| `e2-trestle-01` | `secured false, waves 1, 68767 ms, kills 23, fnv1a32:a552a476` | `secured false, waves 1, 70700 ms, kills 13, fnv1a32:48102054` |
| `e2-trestle-02` | `secured false, waves 1, 55867 ms, kills 17, fnv1a32:68587d07` | `secured false, waves 1, 62000 ms, kills 8, fnv1a32:ef4c8cc4` |
| `e2-incline-01` | `secured false, waves 1, 73900 ms, kills 17, fnv1a32:b1746dec` | `secured false, waves 2, 119333 ms, kills 35, fnv1a32:c24a9c31` |
| `e2-incline-02` | `secured false, waves 1, 65933 ms, kills 15, fnv1a32:d00617e9` | `secured false, waves 5, 206133 ms, kills 96, fnv1a32:50ff0a9a` |

`e6-picnic`'s two floors are **byte-identical to main's** (the experiment was reverted before the record).
`eraStamp` moved `9382083d3 -> 894c88287`: that field is *derived* (`git merge-base HEAD main`, short), not authored,
so it follows the branch point and will follow main's on the drain.

### Census re-points: **none were needed, and that is a measured statement, not an omission**

`e2e/er01-e2-census.spec.ts` pins `twist.coalSeams` (length 3) and `twist.waveCadenceMult` (0.7 / 0.75) for these two
maps, plus the pressure rule block and `engineDependencies`. **None of them is a key this branch touched** — the cure
is `spawnGates` and `lanes.spawnEdges`, neither of which the census reads — so both census specs pass unchanged.
`er01-e6-census.spec.ts` pins the Picnic's stake positions, `heroStart` flags and rule-id list; the Picnic's data is
unchanged, so nothing there moved either. The cadence dials were deliberately left alone: the owner's 2026-08-22
ladder (`ContractFamilies.ts:1579-1607`) shipped 0.7 and 0.75 as the measured minimum rung, and moving them would
have traded a census row for a ratified balance ruling.

### Three-run smoke, per contract

| contract | project | pass 1 | pass 2 | pass 3 |
|---|---|---|---|---|
| `e2-trestle` | desktop-chrome | wave 2, sim 87.1 s | wave 2, sim 86.9 s | wave 2, sim 86.3 s |
| `e2-trestle` | mobile-chrome (390 px) | wave 2, sim 87.1 s | wave 2, sim 87.1 s | wave 2, sim 86.9 s |
| `e2-incline` | desktop-chrome | wave 2, sim 80.8 s | wave 2, sim 81.7 s | wave 2, sim 80.8 s |
| `e2-incline` | mobile-chrome | wave 2, sim 81.2 s | wave 2, sim 80.9 s | wave 2, sim 81.2 s |
| `e1-drill-yard` | desktop-chrome | practice objective, 61.9 s | 60.3 s | 60.4 s |
| `e1-drill-yard` | mobile-chrome | practice objective, 62.0 s | 60.3 s | 60.1 s |

---

## 7. What was held

* **`src/**` and `src/game/Balance.ts`: untouched.** The two experimental patches were reverted; `git status` shows
  no `src/` entry.
* **The cadence ladder** (`twist.waveCadenceMult` 0.7 / 0.75) and **the coal seams**: untouched. The owner measured
  those rungs on 2026-08-22; they are the map's difficulty, not its geometry.
* **`twist.baron`, `modes`, `secureWave`, `briefing`, `boardRow`** on all three contracts: untouched. No card text
  changed anywhere, so nothing the player reads moved.
* **Wave 3+ character.** Left alone past wave 2 the unassisted run still dies on both cured maps — Trestle at 116 s
  (wave 3 is due at 128.6 s), Incline at 95.5 s (wave 3 due at 120 s). Neither map became a stroll; the first minute
  stopped being an execution.
* **The null floor stays a non-secure** on all 83 pairs, which is the other half of the same test: a map that secures
  with no orders is broken the other way.
* **`STATUS.md`, `tasks/BACKLOG.md`, `tasks/goals.json`, `assets/engine-era.json`, the ledgers, other contracts,
  other e2e assertions**: untouched.

## 8. Evidence on disk

```
artifacts/playability-first-wave-e2-e6/
  report.md                     this file
  smoke-rows.jsonl              the 20 acceptance rows (3 passes x 2 projects + the picnic red)
  probe/probe.config.ts         diagnostic-only playwright config (never gates anything)
  probe/probe.spec.ts           the probe: boots exactly as the smoke does, samples every 250 ms
  probe/probe-before-nodebug.jsonl     the three reproductions, plain boot
  probe/probe-before-debugseam.jsonl   the same three with &debug, to name the variants
  probe/probe-t1.jsonl                 trestle after its gates
  probe/probe-i1|i2|i3.jsonl           the incline's three candidate cures
  probe/probe-p1|p2|p3.jsonl           the picnic's four gate layouts
  probe/probe-meadow-p3.jsonl          the 27.1 s "first machine in the meadow" measurement
  probe/probe-hunk-press8.jsonl        src dial 1, rejected (36.8 s)
  probe/probe-hunk-grace25.jsonl       src dial 2, rejected (37.9 s)
  probe/probe-hunk-standdown20.jsonl   the hunk in section 4, measured and reverted
  probe/probe-long-after.jsonl         the cured maps left alone past wave 2
  probe/probe-drill.jsonl              the Drill Yard's own numbers
```
