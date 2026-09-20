# e8-eclipse — heat 11, generation 36 (claude-opus-5)

Seed `e8-eclipse-01`, trail difficulty, arena build `b118c4d20`, engine `49c34f8b…`, era 5, viewVersion 2.
worldModel: `sim-import`.

## Pre-ride reads (measured, not assumed)

- `assets/contracts/epoch-8-orbital/contracts.json` — `e8-eclipse` is a **terrain variant of `e8-mare-claim`**
  (`tileParams.tileId: "e8-mare-claim"`): same build zones, same six harvest anchors, same claim at (0,12).
  Its own manifest says the quiet part out loud: *"Engine dependency: a one-shot event-driven eclipse cycle,
  mid-run solar shutdown, brown-out ledger, and dark-wave consumers are not yet implemented."*
- **No `twist.secureWave`** → `Balance.run.secureWave = 20` (600 s), and `runTapeEnvelopeForContract`
  grants its `+2` slack only inside `if (twist?.secureWave)`, so the envelope is a flat **18 000 ticks**.
  The blank-line secure is mandatory, not optional.
- **`now.air` is ABSENT**, though `tileParams.atmosphere.airIsWall` is `true`. No regolith gate here —
  unlike `e8-mare-claim`, which publishes `now.air` and gates its secure on `regolith.complete`.
- `Balance.e8Roster`: `scrap_corsair` (hp 1.1, speed 1, contact 1) and `sun_glare_shambler`
  (hp 1.3, speed 0.72, contact 0.9). **Neither carries `wrecker` or `thief`** → no work can ever be
  attacked and no gold can ever be stolen. `REPAIR_UNDER` is dead weight; the fort only ever grows.
- Idle probe: dead at **wave 2 / 81.8 s**, and the almanac named the real difficulty — a
  **continuous trickle every 2.061 s** on top of the wave packs.

## Outcome

**SECURED.** Wave **20** · timeAlive **600.000 s** · gold **60** · kills 915 · **calls 87**.
Tape put forward: `attempt-1-tape.json` (`eventLogHash fnv1a32:b4ecd608`).

**2 sim runs, 1 scored attempt.** The idle probe, then one controller that secured on its first ride;
that securing tune is promoted by name as the scored attempt, and `attempt-1-tape.json` is a
byte-identical copy of `tune-1-tape.json` — one ride under two filenames, not two rides.

Admissibility checked before calling it done: `durationTicks` **18 000** against the flat 18 000-tick
ceiling, last accepted order at tick **17 889**, `defaultedSecure: 1` (blank line at the boundary),
87 entries, 218 511 bytes.

**Caveat the operator should carry to the door:** this arena's `scripts/assay-replay-agent.mjs`
reproduces all four compared outcome fields (`secured/waves/gold/timeAlive` = true/20/60/600) but
returns a different `eventLogHash` (`dbd020c7` vs the recorded `b4ecd608`). That is **not** a property
of this reel: replaying my **zero-order idle probe** through the same instrument, at an identical tick
count (2 454), also reproduces its outcome exactly and also misses its hash (`a45ba9ac` vs recorded
`fac5d558`). The divergence is systematic to the local instrument in this build. (The secured reel's
extra 600 replay ticks are separately just the 20-second trail choice clock playing out.)

## What the map asked

It asked me **nothing about its era's signature mechanic, and the county's RESKIN measurement is
exactly right — twice over, because on this contract even the E8 *air* wall is gone too.** The ladder
names E8 as "low gravity, air as wall (transfer under changed physics)". Air is not a wall here: the
manifest declares `tileParams.atmosphere.airIsWall: true` and `outsideDomes: "suit-timer"`, and the
view publishes **no `now.air` at all** — I dumped the union of `now` keys across all 89 views of the
secured run and it is `wave · blastReadyInMs · weapon · gravity · timers · gold · hero · prospector ·
works · threats · orders · needsRider · seams · score` (+ `pendingOffer`/`expiresAtSimMs`/`pendingSecure`).
No suit, no domes, no regolith, so no secure gate and no reason to walk anyone to a dome pad. That is a
*regression from its own sibling*: `e8-mare-claim` (generation 29) publishes the whole `now.air` block
and refuses `pendingSecure` until `regolith.complete`. Same terrain, same tile id, and the atmosphere
consumer reaches one and not the other. The eclipse itself is inert in the same way, and honestly so:
`twist.eclipseEvent` fully specifies a mid-run solar shutdown with `firstRunWarning: false` and a `dark`
wave set, `tileParams.eclipseShadowZones` authors a shadow across the whole claim, and
`stablePrefix.mechanics.rules` is **empty — zero keys** — while `engineDependencies` says outright that
the eclipse, shadow-zone, objective and atmosphere-wall consumers are all missing. Nothing dimmed, no
economy shut down, no dark wave arrived; the teaching intent ("reserves are love letters to your future
self") has no clock to reserve against. The one era field that *is* live is `now.gravity`
(`feelG 0.6`, `movement: "floaty"`, `lobArcDistanceMultiplier`/`lobAirTimeMultiplier` 2.4,
`knockbackScale` 1.3, `vacuum: true`) — and after generation 29 measured the 24-metre lob *losing five
waves* as an auto-weapon on this same terrain, I used it only as free supplementary damage: one
`BLAST_AT (0,16)` per view whenever `blastReadyInMs` was 0, never `SET_WEAPON blast`.

What the contract actually asked was a **geometry-and-arithmetic question inherited from the Mare Claim**,
and it is a good one. The hero is welded to the claim at (0,12); enemies enter from north, west and east
and converge on it; and **every legal square of build ground lies south of it** — the dome-cluster pads
end at `z = 6`. So nothing can be built within 6 wu of the body that must survive, and the whole design
reduces to two range facts: a turret (range 16) on the `z = 6` line covers the approach out to `z ≈ 21`,
while a beacon (range 8) only reaches the hero at all from `|x| ≤ 5.3` on that same line. I put four
turrets at (±6,6) and (±2,6) and six beacons inside that narrow strip at (0,±4 / 6) — ten works, zero
`out_of_zone`, zero refusals, **zero ever wrecked** (they cannot be). The rest was the free lever: with
no wreckers to punish standing still, 1 330 gold panned off a seam 18.9 wu out funded the full ladder
*and* all four turrets to tier 2 (150 g each, ×1.4 damage ×1.18 fire rate), paired with an explicit
`MOVE_TO` because `CONTEXT_ACTION` does not travel. The fields that carried the run were the plainest
ones — `now.works.entries` (position, `tier`, `wrecked`), `now.works.byKind`, `now.seams[].active/x/z`,
`now.gold`, `now.hero.hp/maxHp/level`, `now.threats.alive` (peaked at **37** against a 60 cap) and
`now.pendingOffer`/`now.pendingSecure`. The orders were `BUILD`, `HARVEST`, `PICK_UPGRADE`,
`CONTEXT_ACTION upgrade`, `MOVE_TO`, `BLAST_AT` and one blank line. Not one E8 verb, because E8 has none.

## Winnability

Secured, and the margin was **wide**: the hero held its full running maximum until t ≈ 450 and bottomed
at **77.4 / 175** in the last nine seconds, all ten works stood untouched at the bank, `threats.alive`
peaked at 37 of a 60 cap, and 1 330 gold panned covered the entire ladder plus four tier-2 turrets —
health, defence and money all had spare capacity at once, and the only thing that could plausibly lose
this contract is answering the secure boundary with an order instead of a blank line.

## Lessons for my notebook

- **A terrain variant is a different contract, and the differences are in the consumers, not the tiles.**
  `e8-eclipse` and `e8-mare-claim` share a tile id, build zones, harvest anchors and claim — and one
  publishes `now.air` with a secure gate while the other publishes none. Generation 29's map was strictly
  harder for a reason that has nothing to do with the ground. **When a manifest names another map's
  `tileId`, inherit the geometry and re-measure the sockets.**
- **The `now`-key union is still the cheapest question in the county, and it now answers "is the era
  live" in one probe.** `atmosphere.airIsWall: true` in the manifest, no `now.air` in any of 89 views.
  Generation 8 taught me to grep the view builder; the faster move is to dump `now`'s keys off the idle
  probe and treat the manifest as a wish list.
- **`stablePrefix.mechanics.rules` with ZERO keys is a complete finding by itself.** Every contract I
  have ridden that had a live era lever published it there. An empty rules object plus an
  `engineDependencies: "missing"` that *matches* the view is the RESKIN verdict, made in ten seconds
  without reading a line of engine source. (Running score on `"missing"`: right on E4 long-road, E10
  last-claim and here; wrong on E5 ×3, E6 glow-mesa, E8 mare-claim. It is a comment to confirm, never a
  fact to plan on — but a "missing" that agrees with `now` is genuinely load-bearing.)
- **Read the roster for the flags it OMITS, before designing any defence.** Neither `scrap_corsair` nor
  `sun_glare_shambler` is a `wrecker` or a `thief`, so no work could be attacked and no gold stolen:
  `works.wrecked` was 0 at all 89 views and `goldStolen` finished at 0. That deletes `REPAIR_UNDER`,
  deletes palisade chaff, deletes every decoy idea, and makes the fort a monotone investment. Two
  minutes in `Balance.e8Roster` decided the whole shape of the array. Third contract running this has paid.
- **The secure-wave-silent tell is now a three-part checklist and I ran all three before riding.**
  No `twist.secureWave` means (1) wave 20 / 600 s, not the 12-wave shape I keep assuming, (2) a flat
  18 000-tick envelope, and (3) therefore a **blank line** at `pendingSecure`. `durationTicks` came back
  18 000 with the last order at 17 889. Generations 24 and 25 lost two real first-secures to this; it now
  costs one `if`.
- **Generation 29's negative result was worth more than a positive one.** It measured, on this exact
  terrain, that `SET_WEAPON blast` costs five waves (≈10 dps against the Spark Rig's 24) and that the
  capped purse's real sink is the tier upgrade. I spent zero time re-testing either and instead used the
  lob only as free supplementary `BLAST_AT` damage while pouring 600 gold into four tier-2 turrets.
  **A sibling generation's dead end is a shortcut; read the notebook for what NOT to ride.**
- **Verify your receipt instrument against a control before trusting or fearing it.** The local
  `assay-replay-agent.mjs` missed my secured reel's `eventLogHash` and I nearly reported that as a defect
  in my own tape. Replaying the **zero-order idle probe** — a run I could not have influenced — showed the
  same outcome-fields-match/hash-miss at an identical tick count, which localises the fault to the
  instrument in this build. **When a verifier disagrees with you, run it on something that cannot be
  wrong before you believe it about something that can.**
- **A wave-2 idle death still means nothing.** Twelfth map running: idle died at 81.8 s and the first
  controller rode the same seed to 600.000 s at 77/175 health. What the probe was actually good for was
  the almanac line underneath it — a `continuousTrickle` of 2.061 s, which is the real pressure curve
  and the reason `threats.alive` climbs at all.
- **Stop at the secure, and promote the tune by name.** Fourth generation running where the first
  controller secured and the rules end the ride there. Copy the securing tape to `attempt-1-tape.json`,
  say plainly in the outcome file that it is one ride under two filenames, and spend the leftover minutes
  on the envelope check and the report — not on a tidier filename.
