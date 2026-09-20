# e7-relay-valley — generation 26 (claude-opus-5, Claude Code CLI 2.1.257)

worldModel: `sim-import`. Bench seed `e7-relay-valley-01`, difficulty `trail`, era 5
(`a607a81f…`). Standing marker `unclaimed`; `winnability-receipts.json` carries **no
`reason`** — the green light that has now been right sixteen times running.

## The map, measured

- Claim / welded hero at **(0, 12)**. `stakeMarkers: []`, `posting.lossStakes: []` — the loss
  condition is `hero_down`. The hero never moved from (0, 12) across 700+ observed views.
- **All four build zones sit on the north ridge**, `z ∈ [36, 46]`: `x ∈ [-50,-40]`,
  `[-30,-20]`, `[20,30]`, `[40,50]`. These are the contract's four relay sites.
- `Terrain.isBuildable` restricts building to those zones, so they are the **only** legal
  ground on the map. Nearest legal build point to the hero is `(±20, 36)` — **31.24 wu**.
  Turret range is **16**. *Nothing this contract permits can defend the ground the hero
  stands on.*
- `Terrain.spawnEdges()` returns one point per edge, so the north lane runs down `x ≈ 0` —
  20 wu from the nearest turret slot, 4 wu outside its range. The relay sites cannot cover
  the approach either.
- Income is **not** the constraint: gold hit the 200 bank cap by wave 4 on the first
  controller, with two live seams at a time re-anchoring between waves.

## Run ledger

| run | controller | result |
|---|---|---|
| probe-idle | `--policy idle` | w2 / 79.300 s / 0 g / 0 calls — `hero_down` |
| tune-1 | draft + blast + harvest, no builds | **w4 / 130.800 s / 200 g / 415 calls** |
| tune-2 | tune-1 + full turret/beacon ladder on the relay sites | w4 / 129.767 s / 60 g / 297 calls |
| tune-3 | survival-weighted draft, no builds | still riding at the wall; no tape |

**tune-2 is the control that matters:** a complete four-turret, six-beacon ladder on the only
legal ground moved the result by **−1.03 seconds**. The relay sites are out of the fight.

The attrition accounting from tune-1 is the other half of the diagnosis, and it points the
opposite way from what the death suggests:

| wave | ends t | spawned | defeated | alive | hero hp |
|---|---|---|---|---|---|
| 0 | 28 s | 9 | 5 | 4 | 100 |
| 1 | 43 s | 18 | 14 | 4 | 92 |
| 2 | 80 s | 41 | 36 | 5 | 44 |
| 3 | 113 s | 66 | 60 | 6 | 20 |
| 4 | 131 s | 86 | 73 | — | 0 |

`threats.alive` never leaves 4–6: **the hero keeps up on kills the whole way down.** It does
not die to a leak, it dies to steady contact attrition of ~1.4 hp/s against a 100-hp pool
with no defensible ground and no healing that the draft happened to offer (tune-1 finished
with `upgradesTaken: {heavy_spark: 2}` and `maxHp` still 100).

## Two door findings, independent of strategy

**1. The reel-duration ceiling is one tick below this contract's own run length.**
`runTapeEnvelopeForContract` (`src/playbook/PlaybookFormat.ts:63`) reads `twist.secureWave`,
but the run uses `twist.secureWave ?? Balance.run.secureWave`. `e7-relay-valley` declares no
`secureWave`, so it *rides* to wave 20 (600.000 s = 18,000 elapsed ticks) while its envelope
stays at `MAX_PLAYBOOK_TICKS = 18,000`. gr-sim then sets
`durationTicks = max(elapsedTicks, lastEntryTick + 1)`, and the `SECURE_CHOICE` that banks
the claim is recorded *at* tick 18,000 → **`durationTicks = 18,001 > 18,000` → HTTP 400
`reel_duration_exceeded`.** A secure on this contract is refused by exactly one tick.
This is the same refusal my generations 24 and 25 took on `e6-half-life-hollow` and
`e6-picnic` — and I can now name the class: **every contract that declares no `secureWave`**.
Verified: `e6-showroom`, `e6-half-life-hollow`, `e6-picnic`, and **all four E7 contracts**
(`e7-relay-valley`, `e7-echo-canyon`, `e7-dead-band`, `e7-relay-rush`) declare none;
`e6-glow-mesa`, which declares 12 and secured cleanly, does not. The fix is one `??`.

**2. The reel byte ceiling punishes the stacked-order idiom.**
`maxTapeBytes = 16 KiB + 3600 × 160 = 592,384`. tune-1 wrote **1,724,873 bytes in 415 entries
after only 131 seconds** — 2.9× over the ceiling at a fifth of the contract's length, because
each entry carries a 32-order array (~4 KB) against a budgeted 160 bytes. Stacking orders to
farm `order_failure` decision points — the technique that won me generations 23 and 25 — is
in direct tension with `reel_too_large` on a 20-wave contract. A submittable reel here needs
small arrays and few of them, which is the opposite of the controller shape I arrived with.

## Outcome

**NOT SECURED.** Best ride: **waves 4 · timeAlive 130.800 s · gold 200 · calls 415**
(tune-1, `eventLogHash fnv1a32:48b85b61`). **4 sim runs** (idle probe + 3 controllers; the
third was still riding at the wall), **0 scored attempts**. **Nothing is put forward** — the
run is unsecured, and independently the two envelope findings above mean a wave-20 secure on
this contract is not submittable as written.

## What the map asked

It asked me nothing about its era's signature mechanic, and the county's **RESKIN**
measurement is exactly right — this is stationary survival wearing E7's name, and unusually
literally so. E7 is playbooks and the Echo; the briefing's three goals are "link the four
ridge relays by line of sight", "record one patrol and hand it to a drone", "keep the replay
inside linked relay coverage". None of that is reachable: the union of `now` keys across
every view of every run is `blastReadyInMs · expiresAtSimMs · gold · hero · needsRider ·
orders · pendingOffer · prospector · score · seams · threats · timers · wave · weapon ·
works` — **no relay, no line-of-sight, no dead zone, no recording, no playbook, no Echo** —
and `mechanics.rules` publishes exactly one entry, `build_zones`. There is no E7 verb in the
grammar and `mechanics.interactables` is empty. The authored `patrolRoutes` ("teaching-patrol")
and the `heightfield` marked `mode: "visual"` appear in `tileParams` and reach nothing
headless. What *is* load-bearing is the E7 geometry's shadow: the four relay sites are the
only build zones, and because they are relay sites they sit on the ridge at `z 36–46` rather
than anywhere near the claim — so the era's fiction survives as a **map that cannot be
fortified**, which is the whole difficulty. The fields that carried my runs were the plain
ones: `now.hero.hp/maxHp/level/upgradesTaken`, `now.threats.alive/spawnedTotal/defeatedTotal/
thieves/edge`, `now.seams[].active/x/z`, `now.gold`, `now.works.byKind`, and
`now.pendingOffer`; the orders were `PICK_UPGRADE`, `BLAST_AT`, `HARVEST`, `SET_WEAPON` and
`BUILD`. Not one of them is an E7 verb, because E7 has none.

## Winnability

**Undecided-leaning-no, and the wall is in the map's ground, not the grammar, the economy or
my budget** — the hero is welded at (0, 12) with 100 max HP while `Terrain.isBuildable`
confines every buildable to four relay sites ≥ 31.24 wu away against a 16 wu turret range
(measured: a full four-turret, six-beacon ladder moved the outcome by −1.03 s), so the only
levers that reach the fight are the free draft and the blast, and against ~1.4 hp/s of
contact attrition on a board where the hero already keeps up on kills, the run turns entirely
on whether the upgrade draft offers enough `tinkers_plating`/`field_dressing` to fund 600
seconds — which I ran out of wall clock testing (tune-3 was still riding when the wall came);
separately and regardless of strategy, a wave-20 secure here produces an 18,001-tick reel
against this contract's own 18,000-tick envelope, so even a successful ride is refused
`reel_duration_exceeded` until `runTapeEnvelopeForContract` reads
`twist.secureWave ?? Balance.run.secureWave`.

## Lessons for my notebook

- **`unclaimed` with no `reason` is sixteen-for-sixteen — and it still says nothing about
  the map.** Generation 12 already learned that the receipt encodes an *authoring* wall, never
  an economic one. Add: it encodes nothing about *ground* either. Two new pre-ride checks
  belong beside it, and both are two minutes of arithmetic:
  `min distance(claim, buildZones)` against turret range, and the reel envelope against the
  contract's own run length.
- **Read `twist.secureWave` for the `??`, and then read the ENVELOPE for the same `??`.**
  Generation 25 learned that a silent `secureWave` means 20 waves, not 12. The sharper and
  more expensive version: `runTapeEnvelopeForContract` does *not* apply that same default, so
  a silent `secureWave` gives you a 20-wave run inside an 18,000-tick envelope and your secure
  is refused by exactly one tick. That is the identical refusal generations 24 and 25 took on
  `e6-picnic` and `e6-half-life-hollow`, and I can now name the whole affected class:
  `e6-showroom`, `e6-half-life-hollow`, `e6-picnic`, and all four E7 contracts. **Three
  generations spent on one missing `??`. Check the envelope before the first order.**
- **A reel has three ceilings, not one: ticks, entries, and BYTES.** `maxTapeBytes` budgets
  **160 bytes per entry**; my 32-order arrays run ~4 KB. tune-1 was 2.9× over the byte ceiling
  after 131 of 600 seconds. So the stacked-failing-order technique that won generations 23 and
  25 — farm `order_failure` to buy decision points — **is a reel-size bomb on a 20-wave
  contract.** Size the array for the envelope, not just for the tick.
- **Build the cheapest control that can falsify your plan, and build it second.** tune-2 was
  the full turret/beacon ladder on the only legal ground; it moved the result by one second
  and settled the map's central question for good. One run, total clarity. That is a better
  use of a tune than another point on the same curve.
- **`threats.alive` staying flat is a diagnosis, not comfort.** Alive held at 4–6 through
  every wave while the hero bled to death. A hero that keeps up on kills and dies anyway is
  telling you the problem is *sustain*, not DPS — so the answer is the plating/dressing side
  of the draft and the ground, never a bigger gun. I spent tune-1 and tune-3 on the draft's
  DPS side before reading my own table.
- **Do the distance arithmetic before the idle probe, not after.**
  `min |claim − buildZone|` = 31.24 vs turret range 16 was computable from the manifest in
  ninety seconds and it is the entire contract. I ran three controllers to confirm a
  subtraction. Generation 8's "find the pocket" has a null case, and **the null case is the
  finding** — when no pocket exists, say so immediately and spend the wall proving the
  survival ceiling instead of re-testing the ground.
- **Budget the wall in runs, not in minutes.** tune-3 was the run that would have answered
  the live question and I launched it at minute 18 of 25, having spent minutes 11–17 on two
  runs that were each answering something I could have derived. Launch the long
  uncertainty-reducing ride *first* and analyse while it burns.
- **Write the outcome file after every run, before the analysis.** Thirteenth generation
  saying it, tenth actually doing it — the runner wrote `gauntlet-outcome.json` on every child
  exit, so a truthful row existed on disk from the idle probe onward and the report was
  finished before the wall rather than at it.
