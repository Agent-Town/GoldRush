
## generation 14 — 2026-09-03T22:07:13.548Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04 · contracts: e3-moth-season
cost: wallClock 444s · setupToFirstOutput 60s · tokens in 122 / out 98982 (+cache read 8304289) over 61 turns, 31 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w12 / 360.000s / 45g / calls 31 · runs 3 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:e9d858e1, ranked, POST rank 1 — FIRST SECURE for e3-moth-season. Zero of six works ever wrecked; hero never below its running maximum across all 32 views. The verdict poll aborted once on ECONNRESET after the POST was already accepted and was resumed with the poll-only shim — no re-POST.
- Winnability (rider, verbatim): Secured, and the margin was **wide**: the hero never once dropped below its running maximum across all 32 views — 100/100 held through wave 4, finishing **151/175 at level 13** — **zero of six works were ever wrecked**, no gold was stolen, and the whole 325-gold economy went into a ladder that was still buying at wave 11; the thin part was only the opening, where 30 s of wave-0 quiet buys one 25-gold beacon and the first turret does not land until t=148.
- What the map asked (rider, verbatim): It asked me almost nothing about a network, and the audit note is right: this is **RESKIN**, but not in the ordinary way — the era's signature mechanic is *present, fully specified, genuinely implemented, and entirely optional*, because **the rider is the one who installs it.** E3 is "the grid under sabotage"; there is no grid here at all (no `twist.powerGrid`, so `powerConsumerAt` returns `true` unconditionally and `turret`/`lantern_post` survive the roster filter that stripped them on Blackout Ridge and the Fairground). What the contract offers instead is a *bait economy*: moths spawn `max(4, lights)` per wave, target `coverageAt(x,z) × radius × radiusWeight × targetWeight`, and eat 6 hp/s from a `decoy_shed` — the "one shed pays the nightly tithe" of the briefing. Every clause of that is real and correctly wired. It is also, through the door, a **cost with no matching benefit**: the only thing lights buy is cancelling a `nightSpeedOutsideLight` of **1.12** — a 12% slow inside radius-7 discs — while moths do zero contact and zero building damage and can only ever damage the decoy shed the rider volunteers. So the dominant line is to build no lights, at which point the entire mechanic idles: `brightest` is `undefined` and 4 swarms a wave stand still. I secured having built neither buildable the twist adds. That is the same shape as gen-11's Blackout Ridge finding (*a named mechanic can be real and still be a bad buy*) pushed to its end point: here the lever is not merely overpriced, it is **strictly dominated**, because declining it removes the threat rather than merely forgoing a benefit. Legibility is a mixed picture and worth the county's attention: `stablePrefix.mechanics.rules` publishes the mechanic in unusually good detail — `moth_wave` (`count: "max(mothsBaselinePerWave, floor(lightSources)*mothsPerLightPerWave)"`), `moth_targeting` (the scoring formula, tie-break and all) and `moth_attachment` (`damageTarget: "decoy_shed"`, `radiusLossPerAttached: 0.3`) — but the union of `now` keys across all 32 views of the secured run is `blastReadyInMs · expiresAtSimMs · gold · hero · needsRider · orders · pendingOffer · pendingSecure · prospector · score · seams · threats · timers · wave · weapon · works`: **no darkness, no coverage, no light-source list, no attach counts.** The one live sighting of the mechanic is `almanac.nextWave.composition[0] = moth_swarm "Fever Moths"` — and the door calls the almanac an estimate, not observed fact. So a rider who *did* buy the lights could not read whether they were being dimmed. The fields that actually carried my run were the ordinary ones: `now.works.entries` (positions + `wrecked`, the only way to see which slots refused), `now.works.byKind` (ladder state), `now.seams[].active/x/z`, `now.gold`, `now.hero.hp/maxHp/level`, `now.threats.alive` — which saturates at **60–64 from wave 7**, the plateau that makes the map survivable — and `now.pendingOffer`/`now.pendingSecure`. The orders were `BUILD`, `HARVEST`, `REPAIR_UNDER`, `PICK_UPGRADE` and one `SECURE_CHOICE`. Not one of them is an E3 verb, because E3 has none.
- Lessons (rider, verbatim):
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
