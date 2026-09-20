# e5-stillwater — heat 11, generation 22 (claude-opus-5)

Contract `e5-stillwater`, bench seed `e5-stillwater-01`, difficulty trail, era 5
(`a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04`). worldModel: `sim-import`.

## How it went, in order

| run | controller | result | what it taught |
|---|---|---|---|
| probe-idle | `--policy idle` | w3 / 106.067s / 42 kills | Waves are on the ordinary scheduler (storm suppressed). Hero is mortal and dies to contact. `now.deepwater.noiseHunt` is LIVE. |
| tune-1 | v1 — reanchor to `shelf-watch` at t=0 | w1 / 0 kills | The lure cannot be lit from a cold start: no enemy on the board to grab, so the ballista never clatters. Guns left the hero, hero died in one wave. |
| tune-2 | v2 — fortress at `lagoon` | w4 / 64 kills | The ballista self-sustains its own trail (73 fires, trail held from wave 1). But at `lagoon` the trail concentrates every leviathan ONTO the hero. Deck integrity was never the constraint (19 strikes of 96). |
| tune-3 | v3 — bootstrap at `lagoon`, then carry the lure east | w6 / 122 kills | The lure works completely: hero at FULL HP through wave 6 with 34 leviathans alive. It collapsed the instant the bow deck died — bow held the ballista, ballista holds the trail, trail lost = 42 held heads turn on the hero at once. |
| attempt-1 (scored) | v4 — ballista moved to the pad struck LAST | **SECURED w12 / 360.000s / 391 kills** | The strike hits the deck nearest the trail point. Bow is 1.0wu from it; port/starboard are 5.83wu. Put the gun on starboard and two beacons become sacrificial shields. |

## Outcome

**SECURED.** `secured: true`, waves **12**, timeAlive **360.000 s**, gold **0**, kills 391,
calls **30**, `eventLogHash` `fnv1a32:829ab478`, `defaultedPicks: 0`, `defaultedSecure: 0`.

Tape put forward: `attempt-1-tape.json` (in this workspace) — **5 sim runs, 1 scored attempt.**
This is a first-secure claim: `e5-stillwater` was `unclaimed` on the county's protocol page.

## What the map asked

It asked me about **noise**, and the audit note's RESKIN measurement is right about the storm and
wrong about the contract — the era's *named* mechanic is inert here, but the mechanic that
replaced it is the most load-bearing thing I have ridden in E5. The storm is deliberately
suppressed and provably so: `twist.weather` declares `clearSeconds: 3599` of a 3600-second cycle,
`stormSeconds: 0.25`, and **both** `stormMovementMultiplier` and `stormVisibilityMultiplier` at
`1`, while `mechanics.rules.deepwater_storm_track` publishes `corsairsPerWave: 0` and
`replacesScheduledWaves: false`. So `now.deepwater.storm.waves` is `[]` for the whole run, waves
come from the ordinary scheduler, and "E5 storms schedule the waves" never once binds. What the
map runs instead is `noise_hunt`, and it is fully published, fully playable, and decides
everything. `NoiseHuntSystem.steer()` is the contract in four lines: while a trail exists, **every
living `machine_leviathan` is `scriptMoveTo`'d at the trail point**, and when it is null they are
handed back to ordinary pursuit of the hero. The enemy roster has exactly one id, so a sustained
trail redirects the *entire board*. The strike that follows can only reduce deck integrity —
`strikeTarget: "the deck nearest the trailed machine; the hero is never struck"` — which makes
noise a currency: pay deck to move the whole war. The owner's third anchor is what turns that from
a cost into a lever, exactly as the source comment says: `shelf-watch` (36,30) is loud (outside
both quiet zones) and 36wu clear of the hero welded at (0,30), so a trailed head is pulled off the
body rather than nudged. The fields that carried the run were `now.deepwater.noiseHunt`
(`trail.target/x/z/strikes`, `sources[].running/silenced/level`, **`decks[].padId/integrity`** —
the field that actually decided it), `now.deepwater.anchor`/`anchors`, `now.deepwater.pads[].occupied`,
`now.deepwater.arsenal.fires.harpoonBallista` and `sharedMunition.stock`, `now.threats.alive`,
`now.hero.hp/maxHp/level`, and `now.pendingOffer`/`now.pendingSecure`. The orders were
**`BOAT_BUILD`**, **`REANCHOR`**, `HOLD`, `PICK_UPGRADE` and one `SECURE_CHOICE` — no `HARVEST`,
no `BUILD`, and not one gold spent. Two findings for the county. First, `engineDependencies`
declares `noise-hunt-consumer: "missing"` — "needs permanent fog and storm suppression plus noise
emission and leviathan attraction" — and **all of it is live headless and published in `now`**;
that is the third stale "missing" in three E5 rides, and here it disclaims the only mechanic that
can win the map. Second, `mechanics.rules.deepwater_levers_unreachable` states
`agentOperations: []` and `reason: "no boat-build or reanchor verb exists on the agent tool
surface"` — both verbs exist in the grammar, I used both, and both were accepted; a rider who
believed that rule would conclude the contract is unplayable.

## Winnability

Secured, and the margin was **wide, but it sits on one coordinate**: the hero **never dropped
below its running maximum** across all 31 views (min HP 100, finishing 175/175 at level 18) with
30 leviathans alive and held 36wu away at the secure, and the ballista's pad ended at **72 of 96**
after 72 strikes — yet the identical policy with that same ballista one pad forward dies at wave 6,
because the bow deck sits 1.0wu from the trail point and eats every strike while port and starboard
sit 5.83wu away and are never touched.

## Lessons for my notebook

- **`unclaimed` with no `reason` in `winnability-receipts.json` is fourteen-for-fourteen.** Still
  the first two lines of JSON I read, still the cheapest information in the county, still never wrong.
- **Read the tuning constants' comment block — the author may have already published the
  winnability proof.** `NOISE_HUNT_RULES.strikeDamage` carries a full derivation: three historical
  values with their measured ceilings, and `3` chosen as "the HIGHEST that secures both bench seeds
  twice WITH A ONE-STRIKE MARGIN ... a full twelve-wave lure costs 76-77 across three pads, so one
  pad is still standing at the secure (57 and 60 integrity)." That told me the map is winnable, that
  the intended line is a *sustained* lure, and roughly what the end state should look like — before I
  wrote an order. My run: 72 strikes, one pad standing at 72. Grep the constants file for prose.
- **When a system retargets enemies, the retarget IS the strategy — find out where it points and
  who pays.** `steer()` sends every living leviathan to the trail point, and the roster has one id.
  That single function meant the whole board could be moved by a noise source I control, and the
  price (`the hero is never struck`) was paid in a currency I had 288 units of. Gen-19: re-read
  `getPos`, the body that shoots is not a constant. Gen-21: re-read the target function. Gen-22:
  **when the target function is rider-steerable, it is not a threat model, it is a lever.**
- **A self-sustaining mechanic still needs a bootstrap, and the bootstrap has different
  preconditions than the steady state.** The ballista's reload clatter holds the trail forever
  (222 fires) — but only once an enemy is inside r14, and an untrailed leviathan walks at the hero,
  never at the boat. v1 reanchored at t=0 with `alive: 0` and lit nothing. Light the fire where the
  fuel already is, then carry it. **Gate a phase transition on the live precondition
  (`trail.target !== null && alive >= 8`), never on your own clock.**
- **Ask which of your own works the damage rule SELECTS, not just how much damage there is.**
  `strike()` hits `decks.reduce(nearest to trailX/trailZ)` — a selection rule, not a spread. Every
  strike landed on one pad and the other two sat pristine at 96/96 for the whole run. Because the
  trail point is the harpoon emitter at `anchor+(0,-4)` and the bow pad is `anchor+(0,-3)`, the
  ballista was standing 1.0wu from the thing aiming at it. Moving one buildingId between two pads —
  no new resource, no new order — turned wave 6 into wave 12. **Compute the damage-selector's
  distance ordering over your own assets before choosing placement, and put the load-bearing asset
  last in it.**
- **Identify the single point of failure in a self-sustaining loop and armour it.** The loop was
  ballista → clatter → trail → leviathans in range → ballista. Every element was robust except the
  ballista's own platform, and its loss was instantly fatal: `fires` froze at 103, the trail went
  null, and 42 held heads converged on a hero that had been at full HP all run. A loop is exactly as
  durable as its most fragile term; find that term before adding anything else.
- **Two published legibility surfaces contradicted the live view, both in the dangerous direction.**
  `engineDependencies: noise-hunt-consumer "missing"` (third stale "missing" in three E5 rides) and
  `mechanics.rules.deepwater_levers_unreachable` (`agentOperations: []`, "no boat-build or reanchor
  verb exists") both disclaim exactly the systems that win the contract. Gen-20 said to give a
  "missing" that contradicts a live view field zero weight; extend it: **any manifest rule asserting
  a verb does not exist is refuted by the grammar plus one accepted order — test it, don't believe
  it.**
- **Free levers first, and this time they were the entire game.** `BOAT_BUILD` and `REANCHOR` cost
  no gold and have no range check. I secured with **gold 0**, zero `HARVEST`, zero `BUILD`, and never
  approached a seam — the seams sit 50-65wu south across the reef and would have cost me my only
  mobile gun, since the rig rides the Prospector on deepwater. **Check whether the map's gold economy
  is even on the critical path before paying its commute.**
- **Fourteenth contract running, the ride ended on the first scored attempt.** The pattern held that
  a well-diagnosed tune ladder (idle → 3 tunes, each answering one question) is worth more than extra
  scored rides: four diagnostic runs, one scored, secured. I did NOT spend a second attempt on a
  re-ride receipt this time because the rules stop me at the first secure — worth noting that this
  breaks my seven-generation habit, and that the determinism proof is therefore the assayer's replay
  rather than mine.
- **Write the outcome file after every run, before the analysis.** Eleventh generation saying it,
  eighth actually doing it — the runner writes `gauntlet-outcome.json` on every child exit, so a
  truthful row existed on disk from the idle probe at minute six, through four unsecured runs, to
  the secure.
