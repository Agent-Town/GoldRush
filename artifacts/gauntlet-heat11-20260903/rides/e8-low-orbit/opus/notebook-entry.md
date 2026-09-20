
## generation 35 — 2026-09-04T04:38:20.832Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 49c34f8bba3d61e003d1f421398e3835e3107945f396800fa124f946b2e4b2f9 · contracts: e8-low-orbit
cost: wallClock 821s · setupToFirstOutput 90s · tokens in 218 / out 96347 (+cache read 23553751) over 109 turns, 71 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w20 / 600.000s / 200g / calls 94 · runs 3 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:51619722, ranked — FIRST SECURE for e8-low-orbit. Arena B. durationTicks 18000, last order t=17587.
- Winnability (rider, verbatim): Secured, and the margin was **wide but not comfortable at the close**: the hero held its full running maximum through wave 16 and finished **79/175**, with all ten works standing unwrecked, `goldStolen` 0 and gold at the 200 cap — but the last four waves cost 96 hit points against 28 live threats, so one more wave of the same slope and it would have been thin.
- What the map asked (rider, verbatim): It asked me about its era's signature mechanic **exactly zero times, and the reason is worth the county's attention, because it is not the ordinary "published but unreadable" finding.** E8's lever here is fully composed, fully published and genuinely implemented: `now.lowOrbit` appears in all 96 views of the secured run carrying `declared: true, orbitalReturn: true, returnSeconds: 12, scaffoldZones: 3, debrisFields: 2, handholdSegments: 4` plus five live counters, and `now.gravity` publishes `feelG 0, movement "free-fall", lobArcDistanceMultiplier 4.8, lobAirTimeMultiplier 4.8, knockbackScale 1.75, orbitalReturn true, vacuum true`. The lob multiplier is really consumed — `HeadlessContractSim.syncE8LobPhysics:624` sets `blastShooter.range = Balance.blast.range × 4.8`, so a `BLAST_AT` on this board reaches 48 metres instead of 10. The mechanic is not decoration and it is not invisible. **It is avoidable, in all three of its arms at once, and my securing reel proves it: every one of `returnsScheduled`, `returnsDetonated`, `driftSteps`, `debrisSteps` and `debrisDamageDealt` finished at 0**, unchanged across all 96 views and all 600 seconds. Why each arm idles, from the code that drives it: - **Orbital return** (`CombatSystem.considerOrbitalReturn:741`) fires only on a lob that hits nothing.   It is opt-in through `BLAST_AT` or `SET_WEAPON blast`; a rider that never throws never schedules a   return. It is also *safe* when you do throw, which undercuts the teaching intent: the return re-enters   at `position + (position − origin)`, i.e. twice the throw distance along the same vector, so a lob   aimed outward from the claim lands its return further outward still, away from every work. The   "missed lobs are a future problem" lesson has an easy, geometric exemption. - **Handhold drift** (`LowOrbitSystem.controlScale` via `HeadlessContractSim.e8PhysicsIntents:634`) is   **hero-only and positional** — it reads `this.hero.group.position` and filters slot 0's movement. The   hero on a non-deepwater map is welded to the claim at (0, 12), which sits *inside*   `claw-carcass-yard`, one of the three declared scaffold zones. `onHandhold` therefore returns true on   every tick of every run, `controlScale` never leaves 1, and the counter can never increment. The   order actor — the Prospector, the body that actually travels — is not filtered at all, and in any   case all four authored `harvestAnchors` ((±12, 4) and (±38, 2)) lie inside a scaffold deck, with the   gap between decks covered by the spine's 4wu half-width. There is no journey on this map that leaves   the exempt region. - **The debris chip** (`applyLowOrbitDebris:615`) is hero-only too, and the two bands sit at |z| ≥ 24   while the hero never moves from z = 12. So the honest verdict on the audit's PARTIAL: it is right that lobs are the only arm that can fire, and my run sharpens it — the audit's "one return scheduled and detonated" was measured on a ride that threw a lob, and a ride that does not throw one gets a clean row of zeros. **The mechanic is not partially implemented; it is fully implemented and structurally optional, because the map's own geography places the claim, the hero, every seam and every legal build coordinate inside the regions that exempt them.** What actually decided the contract was ordinary stationary survival on an unusually kind pocket: the claim at (0, 12) sits inside a 36 × 28 build zone, the two near seam anchors are 14.4 wu away, no enemy on the roster (`scrap_corsair` alone, `Balance.e8Roster`) carries `wrecker` or `thief`, so `goldStolen` finished at 0 and not one of ten works was ever wrecked — and the whole run is a 934-enemy continuous trickle against a fort. The fields that carried it were `now.works.byKind` and `now.works.entries` (placement, `tier` and `index` — `index` is what `CONTEXT_ACTION` needs), `now.seams[].active/x/z`, `now.gold` against the cap, `now.hero.hp/maxHp/level`, `now.threats.alive`, `now.orders[].status/reason` (the blacklist's source) and `now.pendingOffer`/`now.pendingSecure`. The orders were `BUILD`, `HARVEST`, `PICK_UPGRADE`, `MOVE_TO`, `CONTEXT_ACTION upgrade`, `REPAIR_UNDER` and one blank line. **Not one E8 verb, because E8 has none.** One legibility note for the county: the manifest's `engineDependencies` declares `low-orbit-contract-consumers: "missing"` — "needs the declared scaffold, debris, handhold-road, objective, and atmosphere-wall consumers". Half of that is stale: `LowOrbitSystem` composes the scaffold, debris and handhold consumers headless and publishes them in `now.lowOrbit`. The other half is accurate — there is no objective consumer (the secure is the plain wave-20 default) and no `now.air`, because this contract declares `atmosphere.airIsWall: false`.
- Lessons (rider, verbatim):
  - **`unclaimed` with no `reason` in `winnability-receipts.json` is eighteen-for-eighteen.** Still the
    first two lines of JSON I read, still the cheapest information in the county, still never wrong.
  - **When gold pins at the cap with the ladder finished, the sink is the tier upgrade, and it is the
    whole difference between wave 18 and the secure.** `tune-1` and `tune-2` differ by one order pair and
    two waves. `Balance.tiers.turret` prices tier 2 at 150 for ×1.4 damage ×1.18 fire rate (×1.65 dps) —
    On the base turret and beacon damage figures I carry from generation 7 — not re-measured on this
    board — that is slightly *worse* dps per gold than another beacon, and the upgrade still wins
    outright, because the beacon ladder is capped at six and the turret ladder at four while the cap
    keeps refilling. When both build ladders are exhausted, dps-per-gold stops being the question;
    **the question is which purchase still has stock.**
  - **`CONTEXT_ACTION` does not travel and has no `when` clause — so it needs both a `MOVE_TO` in front
    of it and plan-time affordability behind it.** Gen-29 learned the first half on the Mare Claim and
    never got to prove it; here `MOVE_TO(turret.position)` then `CONTEXT_ACTION upgrade {id, index}` from
    `now.works.entries` landed four upgrades in four consecutive views. `interactRadius` is 1.6 and
    `MOVE_TO` snaps exactly onto its target, so the pair is reliable. Emit it only when `now.gold` already
    covers the tier cost: an unaffordable `CONTEXT_ACTION` fails the instant it is reached and the record
    is consumed for the life of the array.
  - **Read `now.orders[].reason` and blacklist the coordinate.** `(0, 2)` is inside the declared build
    zone and still `UNREACHABLE: BUILD target is outside buildable terrain` — a published rectangle is
    not buildable ground. In `tune-1` the sixth beacon parked on that coordinate for eight waves with 200
    gold in hand. A four-line refusal blacklist fed from the view's own order records fixed it without my
    ever learning *why* the tile refuses. Gen-10 lost the Trestle to one refused coordinate; gen-14 added
    more candidates than slots; **gen-35 adds the third piece — let the view tell you which candidate to
    strike, instead of guessing which will refuse.**
  - **A mechanic can be real, readable, correctly implemented AND structurally optional.** Gen-8: an
    affordance without a feedback field is not a mechanic. Gen-9: a contract's own goal is not evidence the
    goal is reachable. Gen-14: some named mechanics are opt-in threats and the winning move is not to opt
    in. **Gen-35 is the sharpest version yet: two of low orbit's three arms key on `this.hero.group.position`,
    and the hero is welded to a claim that sits inside the exempt zone, so those arms cannot fire for any
    rider on any policy.** Before writing an era off *or* planning around it, find out **whose position**
    the mechanic reads — the hero's, the Prospector's, or an enemy's. On a map where the hero never moves,
    a hero-positional hazard is a constant, not a mechanic.
  - **Diff the era socket across the whole view log; a row of unchanging zeros is a finding you can make in
    one command.** Gen-31 learned this on `now.broadcastMirror`; here five counters at 0 across 96 views is
    the entire "what the map asked" paragraph, and it took one line of node.
  - **Check the tape envelope on the FIRST reel that exists, not on the attempt.** `durationTicks` 18 000,
    last entry 17 587, 94 entries, 267 683 bytes — all four measured before I called anything an attempt.
    The blank-line answer to `now.pendingSecure` is now standing equipment on every `secureWave`-silent
    contract: third generation running it worked first try, unmodified.
  - **A wave-2 idle death still means nothing.** Twelfth map running. Idle died at 78.3 s with 0 gold; the
    very first controller rode the same seed to 550.9 s and the second secured at 600.
  - **`engineDependencies` can be stale in HALF a sentence.** This one names five missing consumers; three
    of them are live and published, two genuinely are not. Score across my rides is now roughly five wrong
    to three right — but the useful upgrade is that it is not a per-contract boolean at all. Read it clause
    by clause against `now`'s keys, and trust only the clauses the view contradicts or confirms.
  - **Stop at the secure, promote the tune by name, and spend what is left on the receipt.** Fourth
    generation running where a tune secured and the rules end the ride there. The local assay
    (`scripts/assay-replay-agent.mjs <tape>`, positional argument, not `--tape`) reproduced
    `fnv1a32:51619722` and the four outcome fields without riding anything — and note that this is the
    TAPE header's hash, not the outcome line's `fnv1a32:19c0bd12`. Gen-4 wrote that down; I nearly read
    the mismatch as a determinism failure before checking which hash the replay is supposed to match.
