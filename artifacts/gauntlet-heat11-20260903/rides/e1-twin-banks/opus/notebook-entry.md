
## generation 7 — 2026-09-03T15:48:24.861Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04 · contracts: e1-twin-banks
cost: wallClock 679s · setupToFirstOutput 60s · tokens in 168 / out 82275 (+cache read 11042471) over 84 turns, 50 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w20 / 600.000s / 200g / calls 118 · runs 3 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:a2a8cdd0, ranked, POST rank 1 — FIRST SECURE for e1-twin-banks. Sequence: idle probe (died w3) → one controller → secured on its first ride → re-ridden identically as the scored attempt, eventLogHash fnv1a32:ce442a62 reproduced bit for bit.
- Winnability (rider, verbatim): Secured, and the margin was **wide**: the hero never dropped below its full HP until wave 18 and finished at 127/175, not a single one of the thirteen works was ever wrecked, and gold sat pinned at the 200 cap for the last twelve waves — the run had spare capacity in health, in defence, and in money simultaneously.
- What the map asked (rider, verbatim): It asked me about **the bank cap, and it was the only contract of mine so far where the era's named mechanic actually bound.** The E1 opening economy is exactly what this map is about, from two ends. On the income side, `HARVEST` is a per-order machine tick worth 5 gold, and the map hands you a second, passive faucet the Dry Gulch did not have: `stablePrefix.mechanics.buildables` publishes `sluice` (40 g, 3 g per 5 s cycle, max 3) with the meaning "works the river for you", and the braided river is the only reason it is placeable — the buildable-zone rule and the water-adjacency pad intersect in a single line at `z = -7`. Three sluices bought at waves 2–5 turned the economy from hand-to-mouth into a surplus. On the spending side, the cap then bit: `now.gold` **pinned at exactly 200 from wave 9 through wave 20**, `score.goldPanned` finished at 690, and my ladder had run out of things to buy at wave 8, so roughly a third of everything I earned evaporated against `Balance.economy.bankCap`. The counter-lever was published and I declined it — `stockpile`, 60 g, "+150 gold above the pan cap", two allowed — because by the time the cap bound I had all four turrets and all six beacons and nothing left worth banking for. That is the bank cap doing its authored job: it is a *ceiling on stockpiling*, and the honest reading is that it made my last eleven waves of panning worthless rather than that it stopped me. The other thing the map asked about is its own geography, and here the audit answer is less flattering: `pathing.riverBlocksEnemies` plus two fords at x = ±16 ought to be a funnel, but because the hero is welded to the *south* stake and enemies spawn on all four edges, the north bank and its two crossings are scenery for a rider who never leaves the south side. I built nothing north of the river and never crossed a ford. The view fields that carried the run were `now.seams[].active/x/z` (three live of six authored anchors, re-anchoring between waves), `now.gold` against the cap, `now.works.byKind` and `now.works.hp` (the ladder's state and the repair trigger), and `now.pendingOffer`; the orders that carried it were `HARVEST`, `BUILD`, and `PICK_UPGRADE`.
- Lessons (rider, verbatim):
  - **`unclaimed` with no `reason` in `winnability-receipts.json` is now a two-for-two green light.**
    Generation 5 found the wall (`standings-disabled`), generation 6 found the green light, and this
    ride confirms it: those two lines of JSON are the cheapest information in the county. Read them
    before the idle probe, not after.
  - **A brutal idle probe is not a hard map.** Idle died at wave 3 here — worse than the Dry Gulch's
    wave 4 — and the contract then secured on the *first* controller I wrote, at full health, with
    nothing wrecked. The idle curve measures how fast an unattended hero dies, which is a statement
    about the hero's stillness, not about the map's ceiling. Do not let it set your ambition.
  - **Find out which body the orders move before planning anything.** I had it half-wrong from
    generation 6: `HeadlessContractSim:469` binds the *shooter* to the hero, but the *order actor* is
    the Prospector (`Embodiment.ts:131`). On a non-deepwater map that means the hero is a fixed turret
    on the loss stake that every enemy walks toward and that you cannot reposition, while the
    Prospector is an untargeted worker that can pan anywhere for free. Both halves of that shape your
    plan, and they point in opposite directions: defence is a fixed-point problem, economy is a
    travelling-salesman one.
  - **Stack `HARVEST` orders — the array is the throughput.** One `HARVEST` order is one 1.5 s pan tick
    (5 gold), the record then goes `done`, and the next order takes the following tick. Six orders
    empty a 30-capacity seam almost instantly once you are standing on it, so a 32-order array with a
    nearest-first seam chain is worth ~100 gold per wave where a single `HARVEST` is worth 5. In
    generation 6 I panned about seven gold a wave and concluded the economy was starved; it was my
    array that was starved, not the map.
  - **Derive placement from the intersection of the rules, not from the pretty coordinates.** The
    sluice's legal line on this map is a single value of z, and it falls out of two independent
    functions (`isWaterSourceAdjacent` pad 2, `isBuildable` zone+buildZone) that must both be true.
    Five minutes reading `Terrain.ts` bought three sluices on the first try; guessing would have cost
    a ride.
  - **Gate the ladder on one rung at a time.** Generation 6's bug — a cheap rung firing whenever gold
    crossed its price and starving the expensive one — is fixed by emitting exactly *one* `BUILD` order
    per array, chosen by reading `now.works.byKind` against an ordered ladder. The whole ladder landed
    in order, all four turrets and all six beacons, with no starvation and no manual price arithmetic.
  - **Turrets are not beacons.** 52 damage at 1.1/s over 16 units (57 dps, 50 g) against 10+0.75/wave
    at 1.2/s over 8 units (about 30 dps at wave 20, 25 g). Generation 6 secured with zero turrets by
    accident and called it a bug that happened to win; with the ladder gated properly the turrets went
    up first and the run never took a scratch. Read `Balance` for the dps-per-gold before you rank a
    build ladder by price.
  - **When the cap binds, the answer is a stockpile or a shorter ladder — decide which, on purpose.**
    I finished buying at wave 8 and then panned 400-odd gold straight into a 200-gold ceiling for
    twelve waves. It cost me nothing this time because `timeAlive` is pinned at 600 s by a wave-20
    secure and gold ranks below it, but on a contract where gold breaks the tie that is the whole
    margin thrown away. Either buy the 60 g stockpile the moment the cap first pins, or stop panning
    and spend the Prospector's feet on repairs.
  - **A tune that secures is the attempt, and the re-ride is the receipt.** Two runs, same bytes,
    `fnv1a32:ce442a62` both times. In an era that replays every reel, spending the second run on
    proving determinism is worth more than spending it chasing a richer number.
