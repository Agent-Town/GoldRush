# low-orbit-second-build-line — the second build line does not win Low Orbit

Owner ruling this answers, verbatim: **"A9 - second build line"** (2026-09-07, `docs/OWNER-DESK-2026-09-06.md`
§A9), taken against F-EAL-3: "Low Orbit reaches wave 19 at 585 of 600 seconds and the suit is not why
... so the fourteen-second deficit is the four human crossings. Two precedented levers were measured,
neither shipped without your word: `twist.hero.maxHpBonus` ... or a second build line.
Recommendation: the second build line, pure data."

**THE VERDICT: no lever shipped.** Twenty-three comparable arms were measured on the ladder below
(twenty-seven rows in `LADDER.log`; four of them pre-date the harness's hero-post fix and are
marked `kite none`). Exactly one
secures, on one bench seed, with **10 hit points** left at the gate — and the same arm on the other
bench seed dies at **wave 11, 342.7 s**, twenty-three and a half seconds WORSE than that seed's own
baseline. Moving its one re-sited turret **one world unit south** (z = 25 to z = 24) turns w20 / 600 s
into **w13 / 411.4 s**. A win one world unit wide on one seed of two is a coincidence of that seed's
swarm, not a lever, and shipping it as "Low Orbit's second build line" would be Mistake #13.

What is shipped is this measurement, the prover, the ladder harness and the zone print. The
contract, the floors, `src/**` and every e2e spec are **untouched**, so no floor moves, no card
changes, the engine hash does not move, and no other map is affected. The fork goes to the owner's
desk with its numbers.

---

## 1. Measure first — the rides this slice starts from, re-run on this tree

Every number below was produced by a command run in this worktree; none is inherited from
`reviews/e8-air-logical.md`. The prover is `artifacts/e8-air-logical/prover.mjs` carried forward
(`prover.mjs`, three changes named in its header), so `--defence default` is the air-logical ride
line for line.

| ride | command | outcome | matches the review? |
|---|---|---|---|
| **prover, seed -01, twice** | `prover.mjs --contract e8-low-orbit --seed e8-low-orbit-01 --runs 2 --trace` | NOT secured, **w19, 585.100 s**, 15 g, 824 kills, 72 calls, `fnv1a32:6e97b13b`, **byte-identical twice** | yes, exactly |
| air-ignoring control | `--ignore-air` | NOT secured, w14, 420.633 s, 0 g, 535 kills, `fnv1a32:943f688e` | yes, exactly |
| no-sortie control | `--sortie-from-wave 999` | NOT secured, **w22, 660.000 s**, 200 g, 1057 kills, `fnv1a32:8ac741b3`, `endReason: wave-ceiling` | yes, exactly |
| **prover, seed -02, twice** | `--seed e8-low-orbit-02 --runs 2 --trace` | NOT secured, **w12, 366.233 s**, 25 g, 435 kills, 44 calls, `fnv1a32:e6c631fd`, byte-identical twice | NEW — the review never rode -02 here |
| idle floor -01 | `scripts/gr-sim.mjs --policy=idle` | LOST w2, 78 333 ms, 0 g, 33 kills, `fnv1a32:e6813da3` | equals the pinned floor |
| idle floor -02 | `scripts/gr-sim.mjs --policy=idle` | LOST w2, 79 867 ms, 0 g, 35 kills, `fnv1a32:ba13f0cc` | equals the pinned floor |

The no-sortie control is F-EAL-3's own falsifier and it holds: with the errand suppressed the same
rider outlives the gate by sixty seconds AND finishes its fort — **four turrets at tier 2 and six
beacons**, against the sortie ride's four tier-1 turrets and five beacons. The crossings do not cost
the run its air; they cost it its fort.

### Seed -02 is the harder half, and nobody had measured it

Under the human suit the second bench seed loses at **wave 12, 366.2 s** with **one beacon standing**
— 219 seconds short of the gate, against seed -01's 14.9. Any claim that "Low Orbit is 14.9 seconds
from winnable" is a claim about one seed.

## 2. The zone print — what Low Orbit's authored ground actually is

`node artifacts/low-orbit-second-build-line/zone-print.mjs` (full output: `ZONE-PRINT.before.txt`).
It reads the contract bytes and the engine's own two predicates — `Terrain.isBuildable`
(`src/world/Terrain.ts:238`) and the walkable pair `HeadlessContractSim` binds at
`src/sim/HeadlessContractSim.ts:1384` and `:1394`.

```
claw-carcass-yard    bank=north   -18..18  x  -14..14   (36 x 28)
west-scaffold-deck   bank=north   -48..-26 x  -10..10   (22 x 20)
east-scaffold-deck   bank=north    26..48  x  -10..10   (22 x 20)
```

- **The hero starts INSIDE the build zone.** `stakeMarkers` is empty, so the start is the default
  `(0, 12)` (`src/sim/HeadlessContractSim.ts:1007-1008`) — inside `claw-carcass-yard`, walkable and
  buildable. The prover posts her at `(0, 10)`, also inside it.
- **All ten of the prover's fort sites are already buildable**, all inside the carcass yard.
- **Both crossing entries are covered by ZERO of those ten works** — `(-28, 0)` and `(28, 0)` are
  29.7 wu from the post, and the nearest turret, at `(-12, 4)`, is 16.5 wu away against
  `Balance.turret.range` 16. Both entries stand ON `west-` / `east-scaffold-deck`, which are
  **already build zones**: the map lets a rider stand guns at the far end of the crossing today.
- The only spine ground the map leaves unbuildable is the two 8-wide bands at x = ±19..±25,
  z = -10..10 — the vacuum gap between the yard and each deck.
- Everything at |z| >= 15 is walkable and unbuildable, both debris fields included.
- The authored hole in the middle of the yard is real: x, z in [-2, 2] is UNWALKABLE (F-EAL-5).

### How the Eclipse's apron relates, and why it does not transfer

The Eclipse arm this task is modelled on authored `claim-apron` (-8..8, 7..17), 16 x 10, immediately
north of `dome-cluster-pad-center` (-6..6, -6..6) so that it CONTAINS the point the run drops the
hero at, (0, 12). Its win was re-siting six beacons from z = 6 onto z = 10..14, centring their
radius-8 circles on a hero the Eclipse leaves standing where she starts.

**That lever is already paid on Low Orbit.** Its hero starts inside its only fort zone, and the
prover's six beacons already ring her post at 5–7 wu. There is no "six units south" to fix here.

## 3. Why the ride actually ends — read off its own trace

The crossing latch is not the problem and neither is the suit:

| what | when |
|---|---|
| crossing #1 credited | w4, t = 128.6 s (`west-scaffold-deck`) |
| crossing #2 | w8, t = 255.8 s |
| crossing #3 | w12, t = 373.3 s |
| crossing #4 — **latch complete, 4/4** | **w16, t = 507.2 s** |
| breathless entries | **0** |
| suit over the whole ride | never below **31.6 s** of 60; 33 of 73 turns spent in vacuum |
| hero hit points | 100 at t = 330, 151 at t = 360, **0 at t = 585.1** |

Every hit point is lost AFTER the fort is standing and OUTSIDE the carcass yard. Her recorded
positions at the last seven waves: (-35.8, 10.1), (-28.7, 20.8), (20.6, 25.7), **(4.8, -48.4)**,
**(-5.7, -63.5)**, **(18.8, 56.0)**, (-19.9, 44.7) — the map bound is ±64.

From **t = 388.8 s onward her return orders start failing**, and the trace names the refusal:

```
["MOVE_HERO","failed","UNREACHABLE_APPROACH: MOVE_HERO target has no traversable approach."]
```

That is the four-second no-progress rule at `src/agent/StandingOrders.ts:556-561`. In
`gravity.movement: "free-fall"` the hero's thrust is lerped at 1.6/s, halved again off the handhold
spine, so at 60 wu out she coasts away faster than any order can turn her. **The run does not die of
air, of the crossings' schedule, or of where the guns stand. It dies because a hero blown out of her
own fort in free fall cannot get back into it, and the fort has a radius of 16.**

A build zone can only move guns. `Balance.turret.maxCount` is 4 and `Balance.beacon.maxCount` is 6,
both already used, so a second build line on this map is a RE-SITING and nothing else — and no
re-siting reaches z = 56.

## 4. The ladder — twenty-three comparable arms, every one measured

One arm = the authored bytes patched, one prover ride in a fresh process, the ORIGINAL bytes restored
in a `finally` (`arm.mjs`). Seed `e8-low-orbit-01`, hero post (0, 10) — the air-logical policy —
unless the row says otherwise. Raw rows: `LADDER.log`; full reports: `arm-<label>.json`.

| arm | zone authored | fort | secured | outcome | hash |
|---|---|---|---|---|---|
| **baseline** | none | the air-logical ten | no | **w19, 585.100 s**, 824 kills | `6e97b13b` |
| **zone-only-apron** | `claw-yard-north-apron` | the air-logical ten | no | **w19, 585.100 s — BYTE-IDENTICAL** | `6e97b13b` |
| zone-only-spine | `claw-spine-gantry` | the air-logical ten | no | w19, 585.100 s — byte-identical | `6e97b13b` |
| spine-gantry | `claw-spine-gantry` | 2 turrets onto the gantry | no | w18, 556.600 s | `47f3e027` |
| spine-gantry-4out | `claw-spine-gantry` | 4 turrets onto the gantry | no | w15, 459.600 s | `185356e7` |
| spine-one-out | `claw-spine-gantry` | 1 turret onto the gantry | no | w18, 544.167 s | `81f6a4e9` |
| north-apron | `claw-yard-north-apron` | 6 beacons north | no | w17, 512.533 s | `3731056f` |
| north-gantry | `claw-yard-north-gantry` | 2 turrets + 6 beacons north | no | w17, 538.400 s | `6a5a2143` |
| north-beacons-shallow | `claw-yard-north-apron` | 4 beacons north | no | w18, 549.567 s | `0ec1fd33` |
| nt-z16 | `claw-yard-north-apron` | 1 turret at (0, 16) | no | w19, 571.833 s | `dc79e587` |
| nt-z19 | `claw-yard-north-apron` | 1 turret at (0, 19) | no | w18, 556.133 s | `5d2d6499` |
| north-turret-1 | `claw-yard-north-apron` | 1 turret at (0, 22) | no | w19, **590.533 s** | `419af75b` |
| nt-z22-west | `claw-yard-north-apron` | (0, 22), west outer dropped | no | w17, 515.600 s | `bd4e0053` |
| **nt-z24** | `claw-yard-north-apron` | 1 turret at **(0, 24)** | no | **w13, 411.400 s** | `71a57ee6` |
| **apron (nt-z25), twice** | `claw-yard-north-apron` | 1 turret at **(0, 25)** | **YES** | **w20, 600.000 s**, 40 g, 821 kills, **10 hp left**, byte-identical twice | `62d478a3` |
| **apron, seed -02, twice** | `claw-yard-north-apron` | the same | **no** | **w11, 342.700 s** (baseline: 366.233 s), byte-identical twice | `58d5ce4d` |
| apron, no zone (control) | none | the same | no | w15, 456.767 s, **3 turrets, 0 beacons** | `14dc8a84` |
| apron, no sortie (control) | `claw-yard-north-apron` | the same | no | w22, 660.000 s, tiers [2,2,2,1], 6 beacons | `5da81706` |
| apron-turret-last | `claw-yard-north-apron` | (0, 25) built after the beacons | no | -01 w16, 488.067 s; -02 w10, 306.933 s | `e5f6c431` / `828ebb70` |
| apron-beacon-north | `claw-yard-north-apron` | 1 beacon at (0, 20) | no | -01 w19, **585.100 s**; -02 w12, **366.233 s** (`e6c631fd`, the -02 baseline hash) | `b127e5a1` |
| deck-turrets | **none needed** | 2 turrets on the authored decks | no | w16, 482.500 s | `5fe5a035` |
| deck-turrets-outer | **none needed** | 2 turrets on the decks, outer pair kept | no | w17, 530.767 s | `14e6b80e` |

Four earlier rows in `LADDER.log` are marked `kite none`: they were measured before the harness's
hero-post default was corrected, and two of them died at **wave 2, 82.4 s**. They are kept exactly as
measured — see `arm.mjs`'s `KITE_DEFAULT` note — and are not comparable to the rows above.

What the ladder says, in order of how much it matters:

1. **The authored zone is INERT.** With the zone authored and the fort left where it is, both bench
   seeds replay their own baselines byte for byte (`6e97b13b`, `e6c631fd`). A build zone changes
   nothing at all until a rider builds on it: no floor moves, no outcome moves, no hash moves. That
   is the one unambiguously good thing about this lever, and it is also why it cannot be credited
   with a win it does not produce.
2. **The zone IS the mechanism for the one arm that secures** — the same fort list without the zone
   builds three turrets and NO beacons (`apron-no-zone`, w15) because the refused fourth turret
   blocks the beacons queued behind it. So the secure is not a re-siting that would have worked
   anyway.
3. **And the secure is one world unit wide.** (0, 24) → w13 / 411.4 s. (0, 25) → w20 / 600 s.
   (0, 22) → w19 / 590.5 s. (0, 19) → w18 / 556.1 s. (0, 16) → w19 / 571.8 s. Ride length is not a
   smooth function of where the fourth turret stands; it is a lottery over which swarm the turret
   happens to intercept.
4. **On seed -02 every single arm is a regression**, the winner included (366.2 s → 342.7 s).
5. **Nothing on the crossing helps.** Guns on the spine gantry cost 28.5 s (two turrets) to 125.5 s
   (four). Guns on the decks — which need **no authored change at all**, because the decks are
   already build zones — cost 102.6 s and 54.3 s. Pulling a gun toward the crossing pulls it away
   from the claim, and the claim is what the swarm eats.
6. **The purse is the quiet constraint.** The sortie ride finishes with four TIER-1 turrets and five
   beacons of six; the no-sortie control finishes with four tier-2 turrets and six beacons. Every arm
   that moved a site further from the seams built LESS fort, because the walk is paid out of the pan
   tail.

## 5. What this means for the owner's ruling

The ruling picked the second build line over `twist.hero.maxHpBonus` on the recommendation "pure
data". The data half is confirmed exactly: a build zone is inert until used, costs no code and
touches no other map. The **win** half is not: one seed of two, ten hit points, one world unit wide.

The honest fork, for one word:

- **(a) Ship nothing (this slice's default, and what the tree does today).** Low Orbit stays the one
  Orbital map no rider secures under the human suit. The measurement stands as the record.
- **(b) Ship `claw-yard-north-apron` anyway** (-8..8, 15..25, `bank: "north"`, appended last) plus one
  briefing rule naming it. It is exactly the ruling's words, it cannot break anything (byte-identical
  under every rider that does not build on it), and it gives a rider a real option that secures seed
  -01. It also moves the engine hash — `assets/contracts` is in `ENGINE_SOURCE_INPUTS`
  (`scripts/assay-replay-agent.mjs:36-44`) — so it costs an era pin and an ADR-004 re-assay. That
  re-assay is free here: Low Orbit's board is already unclaimed. The tile patch and the fort list are
  committed as `tile-north-apron.json` and `defence-apron.json`; shipping is a two-line edit.
- **(c) Price the map on hit points instead**, F-EAL-3's other precedented lever
  (`twist.hero.maxHpBonus`, the Relay Valley's own). Not measured here — it is a different lever than
  the one the ruling picked, and measuring it unasked would be widening the change without a word.

**Recommendation: (a), and re-open the map when the hero can hold station.** The measured cause is
the free-fall drift, not the fort's footprint: the ride's last 200 seconds are a hero at the map
bound whose every return order is refused `UNREACHABLE_APPROACH`. That is engine ground this slice's
firewall does not touch, and no arrangement of four turrets and six beacons reaches z = 56.

## 6. Reproducing all of it

```
node artifacts/low-orbit-second-build-line/zone-print.mjs
node artifacts/low-orbit-second-build-line/prover.mjs --contract e8-low-orbit --seed e8-low-orbit-01 --runs 2 --trace
node artifacts/low-orbit-second-build-line/prover.mjs --contract e8-low-orbit --seed e8-low-orbit-01 --runs 1 --ignore-air
node artifacts/low-orbit-second-build-line/prover.mjs --contract e8-low-orbit --seed e8-low-orbit-01 --runs 1 --sortie-from-wave 999
node artifacts/low-orbit-second-build-line/arm.mjs --label apron-01-twice --runs 2 \
  --tile-patch @artifacts/low-orbit-second-build-line/tile-north-apron.json \
  --defence-file artifacts/low-orbit-second-build-line/defence-apron.json --kite 0,10
node scripts/gr-sim.mjs --contract e8-low-orbit --seed e8-low-orbit-01 --policy=idle
```

Node 26 (`/opt/homebrew/bin/node`) throughout. `arm.mjs` patches
`assets/contracts/epoch-8-orbital/contracts.json` in place and restores the original bytes in a
`finally`, so arms must be run ONE AT A TIME — two at once each read the other's bytes, and anything
else that reads the contract (a build, a guard, the zone print) must not run beside one. The zone
print in this directory was regenerated on a quiet tree for exactly that reason.
