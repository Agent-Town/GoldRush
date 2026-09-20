
## generation 28 — 2026-09-04T03:57:54.996Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04 · contracts: e10-last-claim
cost: wallClock 703s · setupToFirstOutput 60s · tokens in 126 / out 100349 (+cache read 11360813) over 63 turns, 39 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w8 / 240.033s / 136g / calls 77 · runs 3 · scored attempts 1 · worldModel sim-import. Door: verified, ranked, POST rank 1 — FIRST SECURE for e10-last-claim, the final epoch's contract. Secured at WAVE 8 — early enough that the reel fits the 18000-tick envelope comfortably, which is why this E10 contract could be claimed where the E6/E7 ones could not.
- Winnability (rider, verbatim): Secured, and the margin was **as wide as this contract can be measured**: the preserve finished **360/360, never having taken a single point of damage**, the hero finished 150/150 at level 10 having never dropped below its running maximum, zero of ten works were ever wrecked, and 4 of 208 spawns were still alive at the bank — the whole run turned on being 21 seconds early with 60 gold.
- What the map asked (rider, verbatim): It asked me about its era's signature mechanic squarely, and the county's **RESKIN** measurement is out of date on this build: the flipped objective is real, it is published, and it is the whole contract. `stablePrefix.objective` is `"preserve"`, `now.preserve {hp,maxHp,alive}` is a live field, and the run ends `preserve_fell` the instant that 360-hp warm vent at (0,50) reaches zero — no gold clause, no hero clause on the win side. What makes it E10 rather than "survival with a second health bar" is the *targeting inversion*: `HeadlessContractSim:1475` overrides `nearestBuilding` to return the preserve for as long as it is active, so every wrecker ignores my ten works and walks the vent, while `static_mote` — not a wrecker — chases the hero and can never harm the objective. Extract and preserve are pulled apart geographically too: the only three live seams on this seed sit at (-12,-36), (12,-12) and (-12,12), 39 to 87 wu from the thing I must keep alight, and the vent's own deck (12,36) anchor never activates. So every gold decision is literally "how long do I leave the preserve to go extract," which is the era's named tension stated as a commute. The answer the map rewards is to stop extracting early: I panned 540 gold all run, spent 60 of it on the six palisades that ended the threat outright at t ≈ 39, and the remaining 340 on four turrets that were, honestly, insurance the vent never needed. The view fields that carried it were `now.preserve.hp` (the only scoreboard that matters), `now.works.entries` — positions and `wrecked`, the only way to see which ring slot had been refused, and the field that exposed tune-1's `collision` — `now.seams[].active/x/z`, `now.gold`, `now.threats.alive`, and `now.pendingOffer`. The orders were `BUILD` (six palisades, four turrets), `HARVEST`, `REPAIR_UNDER` and `PICK_UPGRADE`. Two honest qualifiers. First, there is no E10 *verb* — the preserve is defended entirely with epoch-1 grammar, and the manifest's own `engineDependencies` says so: `last-claim-finale-metadata-consumer: "missing"`, "the warm vent objective is live; the remaining finale objective metadata still needs its broader consumer." That is accurate for once, and it shows: the ten authored `eraDeckZones`, the ordered stern-to-bow run, the Quiet's desaturation rings and the *three* preserves of the briefing are all absent from `now` — one vent is served, and the other two sites (`last-lantern`, `last-portrait`) exist only as loss stakes. Second, once the ring closed the contract became a 200-second hold with nothing left to decide; the reasoning is entirely front-loaded into the first forty seconds.
- Lessons (rider, verbatim):
  - **`nearestBuilding` is not a constant either, and E10 rewires it.** Generation 13 taught me "your
    own walls are somebody else's armour"; `HeadlessContractSim:1475` hard-wires every wrecker to the
    preserve, which *inverts* that lesson — nothing I build can bait, decoy, or absorb. Gen-19 said
    re-read `getPos` because the body that shoots is not a constant. Gen-21 said re-read the target
    function. Gen-28: **re-read the target function on every era, because an era can override it to a
    single object and delete a whole class of play.**
  - **Read the objective's damage *whitelist* before designing a defence.** Two enemies on the roster;
    only one is a `wrecker`, and only wreckers route through `hitBuilding`. That single boolean meant
    the contract was not "survive wave 8" but "keep exactly one enemy type more than 1.1 wu from one
    point," which is a 60-gold problem instead of a 340-gold one.
  - **A blocker that the enemy cannot path around is a shutout, not a speed bump.** Wreckers are
    excluded from `updateGapFlow` (`Enemy.ts:686`) yet still hit `resolveBlocker`, so they slide along
    a closed ring forever and never gnaw it (only non-wreckers gnaw, and they were chasing the hero).
    When a pathing exclusion and a collision rule disagree, the collision rule wins — and that gap is
    where the cheapest win on the board lives.
  - **Palisade collision is a FOOTPRINT-OVERLAP test, not a centre-distance test.** `overlapRadius: 1`
    reads like a radius and is not: two rot-0 palisades at `(4,49)` and `(4,51)` are 2 apart and still
    refuse `collision`, because their 3-deep boxes overlap. Lay a ring out as **non-overlapping
    footprints that overlap only after `avoidancePad` is added** — that is what makes a 6-piece ring
    airtight where a 10-piece ring refused.
  - **Correct my own suffix-gate rule (gens 12/17): a suffix gate leaks at the bottom when the rungs
    are all the same price.** Item *i* gated at `cost×(n−i)` means the LAST item is gated at one unit,
    so it fires the moment you can afford one — and on a map with a 39 wu seam commute that is one
    palisade per round trip. The fix that secured this contract is **plan-time affordability**: emit
    `min(missing, floor(gold/cost))` rungs and suffix-gate only *that* batch, so one trip home lands
    the whole affordable batch and nothing fires early.
  - **Count the decision points before designing the opening.** Views arrived at t = 0, 30 and 60 only,
    until the vent started taking damage — then `claim_damage` surprises produced a view every 0.4 s.
    The dense views are the *losing* state; the opening has three. Design the opening as three arrays,
    not as a feedback loop. (Gen-13 learned this on the Fairground and I nearly re-learned it here.)
  - **An idle probe's most useful output is still the resource that piles up untouched — but read the
    loss channel first.** Idle here banked 0 gold and 37 kills with the hero at 83/100 and still died:
    the flat hero bar beside a falling `now.preserve.hp` named the loss channel in one ten-second run,
    and `preserve` is the only bar the outcome cares about.
  - **`engineDependencies: "missing"` was RIGHT this time.** Score is now four wrong (E5 ×3, E6 ×1) to
    two right (E4 long-road, E10 last-claim). It remains a hint to confirm against `now`'s keys in one
    idle probe — but a "missing" that *matches* the view is genuinely useful: it told me the ten era
    decks, the Quiet rings and the other two preserves were scenery before I wasted a run on them.
  - **Stop at the secure, and promote the tune by name.** Third generation running where a tune secured
    and the rules end the ride there. Copying the securing tape to `attempt-1-tape.json` and saying
    plainly in the outcome file that it is the same single ride is the honest way to satisfy both the
    path convention and the stop rule; do not re-ride for a tidier filename.
