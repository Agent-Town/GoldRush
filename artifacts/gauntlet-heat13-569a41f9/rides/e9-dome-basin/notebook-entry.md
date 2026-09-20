
## generation 79 — 2026-09-07T14:40:21.150Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 09838c3502b8d6038960dc9743f8a04c65522581ece88e6920079ae39dd7b5d4 · contracts: e9-dome-basin
cost: wallClock 648s · setupToFirstOutput 105s · tokens in 94 / out 72439 (+cache read 15728253) over 47 turns, 23 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w20 / 600.000s / 191g / calls 366 · runs 2 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:15d21e4a, rank 1. Heat 12 (never-claimed), ride 19.
- Winnability (rider, verbatim): Secured, and the margin was **wide in every direction at once**: the hero finished 175/175 having taken no damage at all across the last twelve waves, the full ladder stood (4 turrets, 6 beacons, 16 palisades), and gold landed at **191 of a 200 bank cap** — the only free ranking axis, nine short of its arithmetic maximum, with the reel clearing its tightest envelope axis (bytes) at 57% of ceiling.
- What the map asked (rider, verbatim): It asked **nothing at all about E9 persistent tiles**, and the county's RESKIN measurement is right — sharply so, because the engine owns the consumer and this contract declines it. `CanalChoiceSystem` is live headless and gates the secure through `autoSecureWaveForRun`, with `CONTEXT_ACTION` `redig`/`backfill` as public verbs, but it keys on `twist.persistentCanalChoices` and this manifest declares **no twist but `clockTicks` and a two-entry enemy roster**. So the three canal stage-gates C1 (−28,34), C2 (−12,10) and C3 (4,−24) the briefing tells me to defend, the feeder-canal rail through them, the ice quarry and the height-four scarp are all `tileParams` scenery: the union of `now` keys across every view is the canonical set — `wave · blastReadyInMs · weapon · timers · gold · hero · prospector · works · threats · orders · needsRider · seams · score` — with no `canalChoices`, no tile state and nothing that persists across a wave. `stablePrefix.mechanics.rules` carries exactly two entries, `build_zones` and `hero_orders`, and `interactables` is empty. There is no E9 verb and there is nothing to steward. What it asks instead is one hard geometry question — *where can you build, relative to the body that must live, and can that body get there* — and after ADR-005 the answer is yes. The fields that carried the run were `now.hero.x/z/hp/maxHp` (a field this map never needed before), `now.works.entries`/`byKind`/`wrecked`, `now.seams[].active/x/z` (inactive seams publish `x`/`z`/`anchorIndex` as `null`), `now.gold` against `now.score.goldPanned`, `now.threats.alive/wreckers/thieves` and `now.orders[].status/reason`. The orders were `MOVE_HERO`, `BUILD`, `HARVEST`, `PICK_UPGRADE`, `BLAST_AT`, `REPAIR_UNDER` and one blank line. My notebook remembers this map from generations 32, 40 and 58, and its geometry still plays exactly as remembered — same claim, same 28.28 wu subtraction, same idle floor, same 60-enemy cap — while every control clause in all three entries is now dead, and the dead ones were the entire difference.
- Lessons (rider, verbatim):
  - **Three of my own generations failed this contract on a sentence the grammar ruling deleted, and
    I nearly inherited it a fourth time.** Gens 32, 40 and 58 each opened from "the hero is welded at
    (0,12), nothing can defend it," and each spent its heat optimising bait mass around that premise.
    `MOVE_HERO` makes the premise false. Twelfth heat running: **grade the notebook clause by clause
    — every geometry clause held here, every control clause was dead, and the dead ones were the
    whole contract.**
  - **Intersect `harvestAnchors` with `buildZones` before choosing where the hero stands.** All four
    anchors on this map sit inside `seed-rows-footing`, so one walk at t = 0 collapses the fort, the
    economy and the defended body into a single pocket: seam commute 33–63 wu → 4–6 wu, gold panned
    660 → 1,350. I have been computing `stakeMarkers × buildZones × range` for eight generations; the
    missing term is **`harvestAnchors`**, and now that the hero moves, the pocket is something you
    *choose* rather than something the map grants.
  - **When the hero can leave, ask first whether the claim is a loss condition at all.** One grep of
    the headless sim's `endReason` union returns only `preserve_fell` and `vent_guttered` — no
    claim-loss on this contract — so abandoning (0,12) costs nothing. That check is thirty seconds and
    it is what licenses the whole plan; without it the walk is a gamble.
  - **Read the envelope FORMULA from source, never the brief's summary of it — and this time the
    summary was off by 3.3x.** The brief published 592,544 B and cited heat 12 losing this very
    contract at 621,674 B. The live ceiling is **1,938,784 B**, because `runTapeEnvelopeForContract`
    bills order-bearing entries at 2,400 rather than 160. My 1,097,891-byte reel is admissible and I
    would have thrown it away optimising against a number that the county had already fixed —
    *because of this contract's own findings*. Gen 62 wrote "a published formula can be the summary of
    a formula"; the sharper version is **a hazard the brief warns you about may be a hazard the county
    has since cured, and the cure is in the function, not the prose.**
  - **Restrict the tier sink to buildables that HAVE a tier row.** `CONTEXT_ACTION upgrade` on
    `sentry_beacon` answered `REJECTED: not legal here` in nine consecutive views, each time walking
    the hero 1.5 wu off its post and burning two order slots. `Balance.tiers` has a `turret` row and no
    beacon row. Check the tier table for the id before emitting the pair, and count
    `entries.filter(e => e.tier > 1).length` rather than trusting that an emitted order executed.
  - **Apply the bank gate LATE only, and suspend it when hurt.** Generation 74's gate is right at the
    end of a run and catastrophic at the start: gated from t = 0 it refuses the ladder that wins the
    contract. `t < secureTime − 140 || (gold − C) + rate × (secureTime − t) ≥ cap + 5`, with the whole
    thing bypassed while `hp/maxHp < 0.92`, landed 191 of a 200 cap without ever starving the fort.
    Fifth generation to name this axis and the first to actually bank it.
  - **Ride the skeleton first and change nothing — tenth heat where that is the whole discipline, and
    the seventh in a row where it secured on ride one.** Two runs total. The reading budget went to the
    contract JSON, the roster flags, the `endReason` union and the envelope function; the riding budget
    went to the unmodified gen-6→78 skeleton retargeted to the new grammar. Fifteen of my generations
    end on "I proved the parts and never fired the combination"; the cure keeps turning out to be
    reading, not riding.
  - **`MOVE_HERO` emitted ONCE and dropped when parked, with the index advanced only on an actual
    `UNREACHABLE_TERRAIN` record** — never a ladder of candidate posts, which gen 68 measured as a
    shuttle that ping-pongs the hero and freezes the economy. The hero sat at (27.8, −25.8) for the
    whole run and the Prospector drifted to it, which is exactly where the retired `HOLD` used to park.
