
## generation 48 — 2026-09-05T18:50:58.094Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 86e53f37efee27cc9e1333b7dba29719c61e002ed2edfdd5cda8d729545df77b · contracts: e8-low-orbit
cost: wallClock 508s · setupToFirstOutput 75s · tokens in 126 / out 118240 (+cache read 15588613) over 63 turns, 32 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w20 / 600.000s / 200g / calls 95 · runs 2 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:c69324de. Heat 12 (mechanic-changed), ride 12.
- Winnability (rider, verbatim): Secured, and the margin was **wide in every direction at once**: the hero **never dropped below its running maximum across all 98 views** (minimum 100, finishing 167/175 at level 29), all ten works stood unwrecked with **every one of the four turrets at tier 2**, gold finished pinned at the 200 cap off 1,470 panned, the era gate latched at t = 25.2 with the suit never once emptying, and the reel cleared every envelope axis with 437 ticks and 416 KB to spare.
- What the map asked (rider, verbatim): It asked me for **a walk to both ends of the station, and the honest finding is that the map's own economy pays for it without being asked** — so E8's signature mechanic is now genuinely composed and genuinely gates the secure here, while being almost free to discharge. The ladder's line is "low gravity, air as wall (transfer under changed physics)". The *air* half is new and real: the secure is latched on `now.air.crossing.complete`, which wants the Prospector to have stood in all three of `west-scaffold-deck`, `claw-carcass-yard` and `east-scaffold-deck`. The claim at (0,12) sits inside the middle deck, so that one is credited at t=0 and the ask is the two outer decks at |x| ≥ 26 — about 111 units of round trip across the spine. The fields that carried it were `now.air.crossing.{zones,required,reached,breathlessEntries,complete}` and `now.air.suit.seconds/inDome/empty`. I wrote a deliberate two-leg `MOVE_TO` errand for it, gated behind two standing turrets because the idle floor (w2 / 78.3 s) says standing defence is the scarce resource — **and that branch never fired.** Two of the four authored `harvestAnchors` are (−38, 2) and (38, 2), which lie *inside* the west and east decks, so the ordinary economy tail walked the Prospector into both: second deck at t = 9.13, **crossing complete at t = 25.23**, on the same tick the first turret went up. A rider that simply pans this map's seams discharges the era gate without ever learning there was one. The *gravity* half is live and, for the first time on this map, I made it fire. `now.gravity` is `free-fall`, `feelG 0`, `lobArcDistanceMultiplier`/`lobAirTimeMultiplier` **4.8**, `orbitalReturn: true` — so `BLAST_AT` reaches 48 m instead of 10. Generation 35 secured here with `returnsScheduled: 0` and called the mechanic "structurally optional"; this run threw lobs aimed *outward* from the claim at (0, 18) and measured **`returnsScheduled: 55`, `returnsDetonated: 54`, `debrisDamageDealt: 0`**. So the returning-lob seam is real and does fire — and aiming outward is what makes it free, because a return re-enters at `position + (position − origin)`, i.e. at (0, 24), outside the fort. The other two arms stayed at the zeros generation 35 recorded, for the reason it gave: `driftSteps: 0` and `debrisSteps: 0` because both key on `this.hero.group.position` and the hero is welded to a claim that sits inside a scaffold zone. That half of my notebook still holds. Everything else was ordinary stationary survival in a generous pocket, read off `now.works.entries` (position, `tier`, `index`), `now.works.byKind`, `now.seams[].active/x/z`, `now.gold`, `now.hero.hp/maxHp/level`, `now.threats.alive` (peak 27 of a 60 cap), `now.orders[].status/reason` and `now.pendingOffer`. The roster is one id, `scrap_corsair`, with neither `wrecker` nor `thief`, so no work can be attacked and no gold stolen: **0 of 10 works wrecked, `goldStolen` 0** — which deletes `REPAIR_UNDER` and palisades from the design. Orders used: `BUILD`, `HARVEST`, `PICK_UPGRADE`, `MOVE_TO`, `CONTEXT_ACTION upgrade`, `BLAST_AT`, `HOLD`, and one blank line. **Not one E8 verb, because E8 has none.** **Does it still play the way my notebook remembers?** Half. Same welded hero at (0,12), same generous 36×28 pocket, same four anchors, same free-fall gravity — but the map now carries a secure gate my generation-35 self reported as absent, and the lob seam it recorded as never firing fired 54 times.
- Lessons (rider, verbatim):
  - **A notebook finding can expire in one half and hold in the other, and the halves need separate
    verdicts.** Generation 35 wrote two things about this map: the air is absent (now false — a suit
    and a three-deck crossing latch gate the secure) and the drift/debris arms key on the welded
    hero's position so they cannot fire (still true, `driftSteps: 0` again). I nearly demoted the
    whole entry on the era-pin's word. **Diff the notebook clause by clause against `now`, the same
    way I already read `engineDependencies` clause by clause.**
  - **When the era system is small, read it end to end — sixth generation running this has paid.**
    `E8SuitAirSystem`'s header names each sibling's derivation in prose ("the three authored scaffold
    decks are the only pressurised ground... crossing the spine to reach every one of them on suit
    air is what opens the secure"), and its `create()` comment numbers the three derivations so a
    reader can check each against the contract JSON. Four minutes there produced the entire contract
    before the idle probe finished.
  - **Read the ORDER of operations inside the update step, not just the predicate.** Generation 45
    learned this on `usePlaybook`'s early returns; here the same move settles the whole difficulty:
    shelters refill the suit *before* `noteCrossings` reads it, and on this map the crossings **are**
    the shelters, so a breathless entry is unreachable by construction. The published `breathlessEntries`
    counter can only ever read 0. An era gate can be fully composed, correctly published, genuinely
    run-blocking — and still cost nothing but distance.
  - **Check whether the map's ordinary economy already discharges the era gate before building an
    errand for it.** I wrote and shipped a two-leg `MOVE_TO` errand with a fort-first trigger, and it
    never executed: two of four `harvestAnchors` sit inside the two crossing zones, so the HARVEST
    tail crossed both decks by t = 25.2. The errand was dead code that cost nothing this time and
    could have cost a run if it had fired at the wrong moment. **Intersect `harvestAnchors` (and every
    other routine destination) with the objective's zones first** — the same `stakeMarkers × buildZones
    × objectiveSites` move, solved for the *worker's existing commute* instead of for placement.
  - **Aim a returning lob OUTWARD and it is free damage.** `orbitalReturn` re-enters at
    `position + (position − origin)`, so a throw from the claim at (0,12) toward (0,18) returns at
    (0,24) — beyond the fort, never on it. 55 scheduled, 54 detonated, `debrisDamageDealt: 0`, zero
    works wrecked. Generation 35 declined the lob entirely and reported the seam as never firing;
    generation 29 measured `SET_WEAPON blast` as a five-wave *loss*. Both are consistent with the
    right answer: keep the rig as the auto-weapon and spend the free `BLAST_AT` window on an outward
    arc.
  - **The gen-6→47 skeleton secured this on its first ride, fourth contract running, with no tuning
    at all.** `PICK_UPGRADE` first under replace semantics; a plan-time-affordable ladder with
    *cumulative* gating (rung *i* gated at the sum of costs through *i*, so a cheap rung cannot steal
    gold an expensive one is waiting for) interleaving turrets and beacons; more candidates than slots
    with a refusal blacklist fed from `now.orders[].reason` and a patience budget; a plating-first
    scorer; one seam drained in a block before walking; a terminal `HOLD` that cannot be filtered
    away; a blank line at `pendingSecure`. Ten builds, zero refusals, maxHp 100 → 175, all four
    turrets to tier 2. Stop re-deriving it; the heat's work is the one thing the board does
    differently.
  - **The capped-purse sink is now standing equipment, and it is why this ride beat my own record on
    the same map.** Generation 39 lost a run to it and generation 45 fixed it; here `ladderDone &&
    gold >= 150` plus `MOVE_TO` in front of `CONTEXT_ACTION upgrade` (it does not travel) took all
    four turrets to tier 2 and kept `goldPanned` climbing to 1,470. Generation 35 secured this exact
    contract at 79/175; this one finished 167/175 having never dropped below its maximum. **The same
    map, the same seed, and the difference was entirely a live gold sink.**
  - **`timeout` is not on macOS and shell redirection is refused in this arena — the node runner is the
    answer to both.** Third generation running that the runner (spawn `gr-sim`, drive the controller,
    log every view to JSONL, write `gauntlet-outcome.json` and the three envelope axes on every child
    exit) made the intermediate-results law automatic and gave me the per-view table the analysis is
    built on. Two commands cost me ~40 seconds to rediscover; the runner is worth writing first.
  - **Hand-write the final row.** Eighth generation where the best-so-far comparator cannot know which
    run I have chosen to *call* my scored attempt, nor that the promoted tape lives under a second
    filename. The brief is explicit that the operator reads the `tape` field, never the filename; I
    wrote both, made the two files byte-identical, and said plainly in the outcome file that they are
    one ride.
