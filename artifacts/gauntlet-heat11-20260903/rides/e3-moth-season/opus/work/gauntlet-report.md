# e3-moth-season — Claude Opus 5, generation 14

model `claude-opus-5` · harness `claude-code-cli` 2.1.257 · worldModel `sim-import`
contract `e3-moth-season` · seed `e3-moth-season-01` · difficulty `trail` · era 5 (`a607a81f…`)

## How the ride went

Pre-ride checks, in the order my notebook prescribes: `winnability-receipts.json` reads
`{ "contractId": "e3-moth-season", "status": "unclaimed" }` with **no `reason`** — the five-for-five
green light. The manifest reads `twist.secureWave: 12`, **no `baron`**, so the secure is the clock
(`wave >= 12`, 360 s) and not a kill — gen-10's correction applied and cleared.

The idle probe died at wave 4 / 122.4 s. Per gen 6/7/9/10/13 that number set no ambition.

Then I read the moth machinery, and it decided the contract in two lines:

- `HeadlessContractSim.ts:1455` — `this.mothSwarm?.update(STEP_SECONDS, this.mothLightSources, this.enemies.all)`.
  Moths are fed **only** `mothLightSources`, which `syncLightState` (`:2124–2152`) builds from
  `lantern_post` + `decoy_shed` alone. With neither on the board the array is empty, `brightest` is
  `undefined`, and `MothSwarm.update` hits `if (!target) continue` for every swarm.
- `moth_swarm` spawns with `contactDamageScale: 0`, `buildingDamageScale: 0`,
  `supportBuildingDamageScale: 0` (`MothSwarm.ts:75–78`), and the `damageSource` callback
  (`HeadlessContractSim.ts:966–970`) returns early unless the source id starts with `decoy:`.

So the moths cannot hurt anything I do not first build for them. I declined the entire apparatus —
zero lantern posts, zero decoy sheds — and the 4 moths a wave stood inert as free kills.

That left the real map: 12 waves of `night_runner` (`hpScale 1.75`) moving 1.12× outside light, and
`turret` **is** on this roster (costs `[50,70,95,125]`) because there is no `twist.powerGrid` to
trigger the `MechanicsManifest` filter that removed it on my two previous E3 rides. Gen-7's
"turrets first" rule was live again. The stake (0,12) sits inside the `dark-corridor` build zone
(x −6..6) with a live seam 10.4 wu away — the pocket, exactly the gen-8/9 shape.

The first controller secured on its first ride. The scored attempt was the identical re-ride, and it
reproduced `fnv1a32:ac94ba3f` with a byte-identical `inputLog`.

| run | kind | result |
|---|---|---|
| `probe-idle` | idle probe | not secured — w4 / 122.5 s / 0 g |
| `tune-1` | controller v1 | **SECURED** — w12 / 360.000 s / 45 g / 31 calls / `fnv1a32:ac94ba3f` |
| `attempt-1` | **scored attempt** | **SECURED** — identical: w12 / 360.000 s / 45 g / 31 calls / `fnv1a32:ac94ba3f` |

Ladder that landed: `sentry_beacon` ×4 and `turret` ×2, six buildings, **none ever wrecked**.
The gen-10 slot-skipper earned its keep: turret candidates `(0,20)` and `(0,4)` refused silently, the
stuck-detector stepped past them, and the turrets landed at `(-5,15)` and `(-5,9)` instead of the run
stalling at `turret: 0` forever.

## Outcome

**SECURED.** waves **12**, timeAlive **360.000 s**, gold **45**, calls **31**
(kills 251, `defaultedPicks` 0, `defaultedSecure` 0, `eventLogHash` `fnv1a32:ac94ba3f`).

Tape put forward: **`attempt-1-tape.json`** — 31 accepted entries, its `inputLog` byte-identical to
`tune-1-tape.json`, both hashing to `fnv1a32:ac94ba3f`.

**3 sim runs, 1 scored attempt.** I stopped on the first secured outcome, as the brief directs.

## What the map asked

It asked me almost nothing about a network, and the audit note is right: this is **RESKIN**, but not
in the ordinary way — the era's signature mechanic is *present, fully specified, genuinely
implemented, and entirely optional*, because **the rider is the one who installs it.** E3 is "the
grid under sabotage"; there is no grid here at all (no `twist.powerGrid`, so `powerConsumerAt` returns
`true` unconditionally and `turret`/`lantern_post` survive the roster filter that stripped them on
Blackout Ridge and the Fairground). What the contract offers instead is a *bait economy*: moths spawn
`max(4, lights)` per wave, target `coverageAt(x,z) × radius × radiusWeight × targetWeight`, and eat
6 hp/s from a `decoy_shed` — the "one shed pays the nightly tithe" of the briefing. Every clause of
that is real and correctly wired. It is also, through the door, a **cost with no matching benefit**:
the only thing lights buy is cancelling a `nightSpeedOutsideLight` of **1.12** — a 12% slow inside
radius-7 discs — while moths do zero contact and zero building damage and can only ever damage the
decoy shed the rider volunteers. So the dominant line is to build no lights, at which point the
entire mechanic idles: `brightest` is `undefined` and 4 swarms a wave stand still. I secured having
built neither buildable the twist adds. That is the same shape as gen-11's Blackout Ridge finding
(*a named mechanic can be real and still be a bad buy*) pushed to its end point: here the lever is not
merely overpriced, it is **strictly dominated**, because declining it removes the threat rather than
merely forgoing a benefit. Legibility is a mixed picture and worth the county's attention:
`stablePrefix.mechanics.rules` publishes the mechanic in unusually good detail — `moth_wave`
(`count: "max(mothsBaselinePerWave, floor(lightSources)*mothsPerLightPerWave)"`), `moth_targeting`
(the scoring formula, tie-break and all) and `moth_attachment` (`damageTarget: "decoy_shed"`,
`radiusLossPerAttached: 0.3`) — but the union of `now` keys across all 32 views of the secured run is
`blastReadyInMs · expiresAtSimMs · gold · hero · needsRider · orders · pendingOffer · pendingSecure ·
prospector · score · seams · threats · timers · wave · weapon · works`: **no darkness, no coverage, no
light-source list, no attach counts.** The one live sighting of the mechanic is
`almanac.nextWave.composition[0] = moth_swarm "Fever Moths"` — and the door calls the almanac an
estimate, not observed fact. So a rider who *did* buy the lights could not read whether they were
being dimmed. The fields that actually carried my run were the ordinary ones: `now.works.entries`
(positions + `wrecked`, the only way to see which slots refused), `now.works.byKind` (ladder state),
`now.seams[].active/x/z`, `now.gold`, `now.hero.hp/maxHp/level`, `now.threats.alive` — which
saturates at **60–64 from wave 7**, the plateau that makes the map survivable — and
`now.pendingOffer`/`now.pendingSecure`. The orders were `BUILD`, `HARVEST`, `REPAIR_UNDER`,
`PICK_UPGRADE` and one `SECURE_CHOICE`. Not one of them is an E3 verb, because E3 has none.

## Winnability

Secured, and the margin was **wide**: the hero never once dropped below its running maximum across
all 32 views — 100/100 held through wave 4, finishing **151/175 at level 13** — **zero of six works
were ever wrecked**, no gold was stolen, and the whole 325-gold economy went into a ladder that was
still buying at wave 11; the thin part was only the opening, where 30 s of wave-0 quiet buys one
25-gold beacon and the first turret does not land until t=148.

## Lessons for my notebook

- **`winnability-receipts.json` is six-for-six.** `unclaimed` with no `reason` = green light;
  `unclaimed` + `standings-disabled` = wall. Still the cheapest information in the county, still the
  first thing I read, and it has never once been wrong.
- **Check whether the twist's own buildables are a cost or a benefit before assuming they are the
  plan.** `lantern_post` and `decoy_shed` are the two buildables this contract *adds*, and buying
  either is what *creates* the threat: moths spawn `max(4, lights)`, target only lanterns and decoys,
  and damage only decoys. A twist buildable is an offer, not an instruction — and on this map it is
  strictly dominated. Gen-11 learned "a named mechanic can be real and still be a bad buy"; the
  sharper version is **some named mechanics are opt-in threats, and the winning move is to not opt
  in.**
- **Read the argument list of the mechanic's `update`, not just its class.** One line —
  `mothSwarm.update(STEP, this.mothLightSources, ...)` — decided the entire contract, because it says
  the swarm can only see lanterns and decoys. Two minutes of reading turned a survival puzzle with a
  bait-management layer into plain survival. Grep the *call site*, the same way gen-8 taught me to
  grep the view builder and gen-11 the roster builder.
- **`damageScale: 0` on all three channels means the enemy is scenery.** `contactDamageScale`,
  `buildingDamageScale` and `supportBuildingDamageScale` were all zero in the manifest's own
  `enemyRoster`, visible before I rode at all. When an enemy's roster entry zeroes every damage
  channel, the only harm it can do is through a *special-cased callback* — so go find that callback
  (`damageSource`, here) and read exactly what it is wired to. It was wired to `decoy:` ids only.
- **The turret filter is conditional on `twist.powerGrid`, not on the epoch.** Two E3 rides in a row
  taught me "assume beacons and chaff on E3"; this E3 contract has no power grid and therefore has
  turrets, and turrets-first is what made it comfortable. Re-derive the roster from the *view* every
  ride instead of carrying an epoch-shaped prior. My own gen-13 lesson had already hardened into the
  wrong generalisation within one generation.
- **The gen-9 non-decreasing-price prefix and the gen-10 slot-skipper compose, and both fired.** The
  prefix bought `b25 → b35 → t50 → t70` in one batch with no cheap rung starving an expensive one;
  the skipper stepped past two turret slots that refused silently and landed the turrets elsewhere
  instead of parking at `turret: 0` for the whole run, which is precisely the failure that cost me
  the Trestle. Carrying more candidates than rungs is now non-negotiable.
- **Score the upgrade offer; never take `offer[0]`.** Gen-11 secured at 4 HP having picked blindly
  and finished with `maxHp` still 100. A three-line keyword scorer preferring plating over damage
  took `maxHp` 100 → 175 and the hero finished this ride having never dropped below its running
  maximum. It is the cheapest margin on the board and it costs no gold.
- **A tune that secures is the attempt; the re-ride is the receipt.** Sixth contract running:
  `fnv1a32:ac94ba3f` twice, `inputLog` byte-identical, 31 entries both times. At a fixed wave-12
  secure `timeAlive` is already pinned at 360.000 s and gold ranks below it, so there was nothing to
  win by gambling and a replay-proof reel to gain.
- **Write the outcome file after every run, before the analysis.** Third generation running I said
  this; this ride is the first where I actually did it on the *idle probe* — the file was correct and
  on disk from minute nine, and every later edit was an improvement to a row that already existed.
