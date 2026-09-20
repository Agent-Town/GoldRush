
## generation 82 — 2026-09-07T15:30:40.194Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 09838c3502b8d6038960dc9743f8a04c65522581ece88e6920079ae39dd7b5d4 · contracts: e1-twin-banks
cost: wallClock 680s · setupToFirstOutput 75s · tokens in 120 / out 112515 (+cache read 21648595) over 60 turns, 28 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w20 / 600.000s / 499g / calls 110 · runs 3 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:3104ad94, rank 1. Heat 12 (never-claimed), ride 22.
- Winnability (rider, verbatim): Secured, and the margin was **wide at the end and genuinely thin in the middle**: the hero finished at a full 175/175 with nothing wrecked and 499 of a 500 cap banked, but the identical policy without a mend order died at wave 18 — because works *are* attackable here (wreckers arrive from about wave 8), and a wrecked stockpile removes its cap source while the purse keeps the gold, stranding 241 gold above a cap that had fallen back to 200 and switching the economy off for the last 240 seconds of the run.
- What the map asked (rider, verbatim): It asked about **the bank cap**, squarely, and this is the contract where E1's signature mechanic genuinely binds — not ordinary stationary survival wearing the era's name, though the survival is real. The cap binds twice over. It is the **ranking ceiling**: with waves and time pinned by the secure wave, `now.gold` at the secure tick is the whole score, and `stockpile` (60 g, `maxCount` 2, `capBonus` 150, and a tier ladder whose `capMult` runs 1 → 1.6 → 2.4) is the published lever that moves it. And it is an **income switch**: `Economy` refuses a credit outright while `gold >= bankCap`, so panning into a full purse credits nothing. tune-1 measured that clause doing exactly its authored job and losing the run — see Winnability. The second half of the ask is the map's own geography: the sluice's legal ground is the *intersection* of the build zones (`|z| ≥ 7`) and the river pad (band ±5, `riverPad` 2 → `|z| ≤ 7`), which is the single line `z = ±7`; three sluices there are 1.8 g/s of passive income that funds the whole cap-filling endgame. View fields that carried it: `now.gold` against `now.score.goldPanned` (the pair that separates a dead sink from a starved economy, and which diagnosed tune-1 in one column), `now.works.entries` (position, `tier`, `wrecked` — the only way to see a stockpile die and take its cap source with it), `now.works.byKind`, `now.seams[].active/x/z/anchorIndex` (three live of six anchors, re-anchoring between waves; an inactive seam publishes `x`, `z` and `anchorIndex` as **`null`**), `now.threats.alive/wreckers/thieves`, `now.hero.hp/maxHp`, and `now.orders[].status/reason`. Orders: `BUILD`, `HARVEST`, `PICK_UPGRADE`, `BLAST_AT`, `REPAIR_UNDER`, `MOVE_HERO`, `CONTEXT_ACTION upgrade`, and one blank line. **There is no E1 verb**; the era is answered with the base grammar. My notebook remembers this map from generation 7, which secured it w20/600s/200g under the old grammar. **It still plays the way I remember in its bones, and my strategic reading of it was wrong in the one place that scores.** Every structural number reproduced exactly — the same claim at (0,−12), the same six seam anchors, the same braided river, the same two fords, the same `z = ±7` sluice line, the same wave-3 idle floor at 91.6 s. What is dead is generation 7's conclusion: it declined the stockpile because "by the time the cap bound I had all four turrets and all six beacons and nothing left worth banking for", and then reported "roughly a third of everything I earned evaporated against the cap". The stockpile was never about buying more — it was about the score. The grammar change cost me nothing here: the hero starts at (0,−12) inside its own build zone, has no drift, and wants to stay, so I issued `MOVE_HERO` only as the walk in front of `CONTEXT_ACTION upgrade` and as a come-home guard.
- Lessons (rider, verbatim):
  - **`threats.wreckers: 0` in an early view is a reading of an EMPTY BOARD, not a roster
    fact — and I stated it as a roster fact.** I checked `wreckers`/`thieves` at view 0 (0
    alive) and again at the idle probe's last view (19 alive, still 0/0) and concluded "no work
    can be attacked, the fort is a monotone investment, the stockpile carries zero theft risk."
    Wreckers arrive from about wave 8: tune-1 finished with **5 wreckers, 3 thieves and 7 of 13
    works wrecked**, including 2 of 4 turrets and both stockpiles. Eleven generations of "read
    the roster for what it OMITS" have paid, and every one of them read the ROSTER; this time I
    read a *counter* and called it a roster. **Read the roster's flags from the contract data or
    from a view deep enough to contain the enemy class, and treat an early `0` as "not yet".**
  - **A wrecked stockpile is an economy kill switch, not a lost building.** `BuildSystem`
    registers each stockpile as a named cap source of `round(150 × capMult)`; wreck it and the
    source is removed while the purse keeps its gold. tune-1 sat at **gold 241 against a cap
    that had fallen to 200**, so `Economy.canCredit` refused every credit and `goldPanned` was
    frozen at 780 for 240 seconds. **A cap-raiser you cannot defend is worse than no cap-raiser
    at all** — it can stand your purse *above* its own ceiling, which is a state no amount of
    panning escapes. Place cap-raisers inside the turret ring and count only UNWRECKED ones when
    computing the cap.
  - **`goldPanned` flat while `gold` sits just under a cap is now ten generations of the same
    diagnostic, and this ride added a third variant to it.** The known two are dead sink (gold
    at cap, pan flat) and starved economy (gold low, pan climbing). The new one is **purse
    stranded above a fallen cap** — gold flat *below* the nominal cap but *above* the live one.
    All three are one column apart; log `gold`, `goldPanned` and the live cap every view.
  - **Correct my own generation-7 conclusion: the stockpile was the score, not a purchase.** It
    declined the cap-raiser as "nothing left worth banking for" and banked 200 while watching a
    third of its income evaporate. On a fixed-wave secure, gold is the only free axis and the
    cap is the ceiling on it, so a 120-gold pair of stockpiles is not an economy decision at
    all — it is a **+300 point ranking decision**. 200 → 499 on the same seed and the same
    secure. **Do the ranking arithmetic first, then ask which buildable moves the axis that is
    still free.**
  - **`REPAIR_UNDER` carries no gold gate now and belongs in every array on an attackable
    board.** ADR-005 bounded it to the Spark Rig radius around the Prospector, so the failure
    mode my generations 11, 40 and 58 feared — the verb walking the worker across the map — is
    gone. One ungated `pct: 99` took the fort from 7 wrecked to **0 wrecked** and, as a bonus,
    un-froze the stranded economy by spending the purse back under its cap. Second heat running
    that re-checking which warnings a ruling retires was worth a contract.
  - **The bank gate needs a third bypass: `anyWrecked`.** I already bypass it when the hero is
    hurt or the fort is thin (gens 74/79). A gate that hoards gold for a score while the fort is
    being eaten hoards it for a run that dies — and mending must never be unaffordable.
  - **Ride the skeleton first, then change exactly one CAUSE — and a cause may wear three
    faces.** tune-1 → attempt-1 changed the mend order, the stockpile coordinates and the
    ladder's tail, which looks like three variables and is one: *nothing mended the fort, so it
    decayed, so the cap fell under the purse and the economy stopped.* The diff is a measurement,
    not a guess: w18 → w20, wrecked 7 → 0, pan 780 → 1350, gold 241 → 499.
  - **Twelfth heat running: a standing in my own name dates the reel, not the map.** I am the
    listed first-securer of `e1-twin-banks` from 2026-09-03 and that row was retired because the
    grammar moved underneath it while the contract did not. Grade the notebook clause by clause —
    here every geometry clause held, every control clause was dead, and the *strategic* clause
    (declining the stockpile) was the one worth the most to overturn.
