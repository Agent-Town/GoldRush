# Heat 11 — `e1-dry-gulch` @ `e1-dry-gulch-01`, trail — claude-opus-5, generation 6

rig `claude__opus-5` · harness `claude-code-cli` 2.1.257 · worldModel `sim-import`
engine pin `a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04` (era 5), stamped in the tape's `meta`.

## The map, as read before riding

Notebook lesson #1 from generation 5 — *read the contract manifest before writing a single order* —
paid for itself again. `assets/contracts/epoch-1-frontier/contracts.json` gave the whole shape in two
minutes:

- `twist.secureWave: 20` → survive 20 waves, then `SECURE_CHOICE bank`. `gr-sim.mjs:111` puts the
  wave ceiling at `secureWave + 2` = 22, so there is no boss and no grace to spend.
- `twist.seamYieldMult: 1.4` — seams pay 40% more.
- `waterSources`: one `spring_pond` at (-18,-18). Sluices work only beside it, i.e. ~34wu from the
  claim, across open ground.
- `lanes.spawnEdges`: all four. Nothing to funnel.
- `winnability-receipts.json` says `status: unclaimed` with **no `reason`** — unlike `e1-drill-yard`,
  which carries `standings-disabled`. That absence was the green light: this map is not structurally
  refused, it had simply never been secured.

The idle probe (`probe-idle.json`) then priced the map's real threat: **rider-down at wave 4**, 143s,
0 gold, 40 kills, with live enemies stacking 10 → 22 → 36 → 50 across four waves. The loss condition
is the hero, not the claim — `now.works` starts at `0/0`, so there is nothing else to lose.

## What I built

A single deterministic policy (`controller.mjs`), 12 orders or fewer per turn, resent every view:

1. `SECURE_CHOICE bank` alone when `now.pendingSecure` is live (`StandingOrders.ts:210` skips every
   other record at that boundary anyway).
2. `PICK_UPGRADE` first in the array when a draft is live, then the rest of the standing set behind
   it — generation 5's REPLACE-semantics lesson, applied on purpose this time.
3. A build ladder of unbuilt slots only, each gated on its own live price from the `costs` curve,
   with `UNREACHABLE` targets blacklisted on the failure reported in `now.orders`.
4. `REPAIR_UNDER 60`.
5. `HARVEST` naming **only the nearest live seam**, re-resolved every view — a `HARVEST` on a dead
   seam fails and burns the tick (`StandingOrders.ts:347`).
6. `HOLD` on the claim as the fall-through anchor.

The first tune run secured. Per the brief's promotion clause I put it forward, and spent the second
run re-riding the identical controller to a canonically-named tape as a determinism check, because
era 5 replays every submitted reel.

## Outcome

**SECURED.** Waves **20**, timeAlive **600.000 s**, gold **12**, kills 205, calls **48**,
`defaultedPicks: 0`, `defaultedSecure: 0`, `eventLogHash` `fnv1a32:0c6075eb`.

Tape put forward: `attempt-1-tape.json` — the determinism re-ride of the securing controller.
Verified against `tune-1-tape.json`: identical tape `eventLogHash` `fnv1a32:7d56d649`, identical
48-entry `inputLog`, identical `{secured, waves, timeAlive, gold}`. Tape `meta` stamps era 5 and the
arena pin `a607a81f…`. **3 sim runs total (1 idle probe + 2 rides); 1 scored attempt.** Stopped on
the first secure, as instructed.

This is a first-secure on a contract the door listed `unclaimed`, and it answers L2 for this map in
the affirmative.

## What the map asked

It asked me about **the commute**, and it never once asked me about the bank cap — so on the
audit question, this contract is *not* its era's signature mechanic wearing its own name, but it is
not ordinary stationary survival either. The E1 bank cap is 200 (`Balance.economy.bankCap`) and my
gold **peaked at 53** and ended at 12; the cap was never within reach, so the one lever the era is
named for was inert here. What replaced it was distance. `now.seams[]` re-anchors live across six
authored anchors, and the seam the view offered me sat 9wu from the claim on a good wave and 29wu on
a bad one — I watched `gold-seam-1` walk anchor 4 → 2 → 3 → 5 between waves. Because the actor that
pans is the same body that builds, repairs and fights (`HeadlessContractSim.ts:469` binds the order
actor to the hero on a non-deepwater map, with the Prospector trailing him), every pan is a round
trip that costs fighting time, and one 30-second wave buys exactly **one pan, ~7 gold**. Twenty waves
of that is ~140 gold on a board whose first turret costs 50 and whose beacon ladder starts at 25.
The fields that carried the map were `now.seams[].active/x/z` (the commute), `now.threats.alive`
(which saturates hard at **60** — 265 spawned, 205 defeated, 60 standing at the end, and that ceiling
is why the map is survivable at all: pressure plateaus around wave 10 instead of compounding),
`now.works.byKind` (the build ladder's state) and `now.pendingOffer`. The orders that carried it were
`HARVEST` and `PICK_UPGRADE` — and the honest finding is that **`PICK_UPGRADE` carried it, not
`BUILD`**. I finished with four sentry beacons, **zero turrets**, and a hero at level 11 holding
`heavy_spark ×3`, `double_tap_coil ×3`, `tinkers_plating ×3`: maxHp 100 → 175. The draft, which costs
no gold and is not an E1 economy mechanic at all, out-earned the entire gold game.

## Winnability

Secured, and the margin was **thin once and then wide**: hero HP bottomed at 44/100 in wave 4 — the
exact wave the idle probe dies on — and after three plating picks finished at 103/175 with the swarm
pinned at its 60-enemy ceiling and every one of my four works still standing, unwrecked.

## Lessons for my notebook

- **Read `winnability-receipts.json` for the *absence* of a `reason`, not just the presence of one.**
  Generation 5 taught me to check it; the sharper reading is that `unclaimed` with no reason is a
  green light, while `unclaimed` + `standings-disabled` is a wall. Two lines of JSON separated a
  spent heat from a first-secure.
- **The order actor is one body.** On a non-deepwater map `HeadlessContractSim.ts:469` binds the
  standing-order actor to the *hero*, and the Prospector merely trails him. Panning, building,
  repairing and holding all compete for the same feet, one movement per tick, and `for (const record
  of this.records) { … if (result) return result; }` means the first actionable order owns the tick.
  Array order is not a hint, it is the whole policy.
- **Know which verbs fall through and which ones eat the tick.** `BUILD` with an unmet `when` returns
  `null` and falls through; `REPAIR_UNDER` with no qualifying target falls through. `HARVEST`,
  `HOLD`, `SET_WEAPON` and `BLAST_AT` always return, so nothing after `HARVEST` in the array ever
  runs. Put every conditional order above the unconditional worker, and put the anchor last.
- **A cheap rung starves an expensive one when both are affordable-in-principle.** My ladder
  alternated turret/beacon by price; the 25g beacon fired every time gold crossed 25, so gold never
  reached the 50g turret and I secured with *zero turrets*. That was a bug that happened to win. On a
  starved economy, either gate the cheap rung behind the expensive one's price (`when.goldGte` of the
  *turret*, not the beacon) or drop the cheap rung entirely.
- **When the economy is starved, the free lever is the draft.** 140 gold across the whole run bought
  four beacons; ten free `PICK_UPGRADE`s bought +75 maxHp and triple spark damage. Before optimising
  a gold engine, check whether the map even lets the gold matter — here the bank cap sat at 200 and I
  never saw 54.
- **Check for a live-enemy ceiling before concluding a map is unsurvivable.** The idle probe's
  10→22→36→50 curve reads like unbounded compounding and it is not: `threats.alive` saturates at 60.
  A plateau you can out-heal is a completely different problem from a ramp you cannot. Read
  `spawnedTotal` against `defeatedTotal` to find the plateau instead of extrapolating the first four
  waves.
- **The era's named mechanic is a hypothesis, not a promise.** The brief named "E1 survival and the
  bank cap"; the map delivered survival and *commute distance*, and the bank cap never bound once.
  Report what the map actually asked, with the numbers that show the named lever was inert.
- **A tune that secures is the attempt.** I spent my one scored run re-riding the identical
  controller rather than chasing gold, because era 5 replays every reel and a matching hash is worth
  more than a richer unverified one. Generation 4 learned that `timeAlive` outranks gold; at a fixed
  20-wave secure, `timeAlive` is already pinned at 600s, so there was nothing left to win by
  gambling.
