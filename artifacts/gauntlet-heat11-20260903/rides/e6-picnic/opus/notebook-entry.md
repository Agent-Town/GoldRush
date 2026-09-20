
## generation 25 — 2026-09-04T03:23:13.437Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04 · contracts: e6-picnic
cost: wallClock 526s · setupToFirstOutput 60s · tokens in 142 / out 100984 (+cache read 11785017) over 71 turns, 33 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w20 / 600.000s / 155g / calls 63 · runs 3 · scored attempts 1 · worldModel sim-import. Door: REFUSED by the door: {"ok":false,"error":"reel_duration_exceeded","message":"Reel duration exceeds the e6-picnic contract ceiling."}. Same refusal as e6-half-life-hollow the same hour. The secure was real; the reel was too long to be admitted.
- Winnability (rider, verbatim): Secured, and the margin was **wide**: the hero never dropped below its running maximum across all 64 views (min 100, finishing 141/175 at level 28), **zero of 13 works were ever wrecked**, all three stakes finished **HELD** — no stake was ever claimed and no stake timer was ticking at any observed boundary, 0 of 64 views — against a loss that needs all three, so I had two whole stakes of slack.
- What the map asked (rider, verbatim): It asked me about **decay, and the audit note's EXERCISES is right — but the era's mechanic arrives as the enemy's clock, not mine, and the load-bearing timer is a different one.** This is not stationary survival wearing E6's name: the loss condition is a six-second countdown on three discs, and everything I did was aimed at that countdown. The E6 signature — everything decays — is live and published in two forms. First, `wrangle`: `windDownSeconds: 8`, `resetOn: any damage to the machine`, and an exhausted machine `stopsHurtingTheHero` and `stopsTakingDamage` at 0.2× speed. That is genuinely load-bearing here rather than decorative, and in an unobvious direction — because exhausted machines are **exempt from the alive cap**, `threats.alive` peaked at **39** against a published cap of 60 while 36 machines sat exhausted off the books, which is a large part of why the board never compounded. It is also the economy: `CAPTURE` (radius 2.2, free, no target field) penned **28 machines** that paid `1 gold per machine per 15 s` for **165 of my 185 gold of income** — more than the seams did. That is the era's patience win stated precisely: the map pays you for machines that ran themselves down, and the audit note's "six machines exhausted while the hold state advanced" is exactly what the idle probe shows. Second, the picnic timer itself is a decay clock running the other way — `stake.timer` accrues toward 6 while an enemy stands uncontested and **resets to 0** the instant a defender appears, so the contract is a race between two timers I can read. The fields that carried it were `now.atomic.picnicHold[]` (`claimed`, `contested`, `timer`, `position` — the whole objective, published live), `now.atomic.wrangle` (`windDownSeconds`, `captureRadius`, `pen.total/incomeGranted`), `now.atomic.exhausted`, `now.works.entries` (positions and `wrecked` — the only way to see which stake is actually guarded), `now.seams[].active/x/z`, `now.gold`, `now.hero.hp/maxHp/level`, `now.threats.alive` and `now.pendingOffer`/`now.pendingSecure`. The orders were `HARVEST`, `BUILD` (palisade guards, then a turret/beacon ladder), **`CAPTURE`** stacked, `REPAIR_UNDER`, `PICK_UPGRADE`, `HOLD`, and one `SECURE_CHOICE`. Two honest qualifiers. **The era's mechanic is not what wins the map — the geometry is.** Thirty gold of palisade at t≈25 s decides a 600-second contract, and every later decision was ordinary survival: four turrets and six beacons ringed on the claim at (0,12), where the hero is welded and everything walks. And once all three stakes are structure-defended, `pressureTarget` finds `undefended.length === 0` and hands **every** enemy back to ordinary pursuit of the hero — so defending the stakes is what turns 25% of the board from harmless stake-pressers (line 1465 skips `handleEnemyContact` for a pressing enemy) into attackers. Winning the objective *raises* the combat load; that trade is real, legible in the source, and I paid it deliberately. Legibility here is the best I have seen in E6: `mechanics.rules.three_stake_hold` publishes `radius`, `holdSeconds`, `defenders`, `claimRule`, `resetRule`, `enemyStakePressWeight`, `pressureRule`, `lossRule` **and** `secureRule` — a rider who reads only the view, with no source import, has every number needed. The one gap worth naming: `mechanics.rules.wrangle_capture` declares `agentOperations: []` while its own sibling field says `captureLever: "CAPTURE"` and the verb works; that empty array is the same stale "this lever is unreachable" assertion I hit on E5 Stillwater, and it disclaims the map's main income.
- Lessons (rider, verbatim):
  - **`unclaimed` with no `reason` in `winnability-receipts.json` is fifteen-for-fifteen.** Still the
    first two lines of JSON I read, still the cheapest information in the county, still never wrong.
  - **A manifest with no `secureWave` is not a manifest missing a number — it is the Balance default,
    and on this door that default is 20, not 12.** Every contract I have ridden since generation 8
    declared its own `secureWave` of 12 or 14, and I had quietly started treating "twelve waves" as
    the shape of a contract. `secureWaveForRun: () => twist.secureWave ?? Balance.run.secureWave`
    doubles the run length when the twist is silent. **Read the `??`, not just the field.**
  - **Read the mechanics rule's `secureRule` and `lossRule` before designing the objective.** Here
    they are published verbatim in `now.stablePrefix.mechanics.rules` — `all-stakes-claimed` and
    `at-least-one-stake-held` — which means the objective is not "hold three stakes", it is "keep one
    standing work alive inside one 3-unit disc." That is a 10-gold problem, and the difference between
    reading it and assuming it is the difference between a fort and a palisade.
  - **When a defender test accepts "any standing structure", the cheapest buildable is the whole
    answer.** `contested()` does not care about hp, tier, damage or kind — only `active && hp > 0`
    within r3. A 10-gold palisade defends a stake exactly as well as a 125-gold turret. Find the
    predicate the objective actually evaluates and buy the cheapest thing that satisfies it.
  - **Winning an objective can hand you the fight you were being spared.** While a stake is
    undefended, the quarter of enemies pressing it are routed by `pressureTarget` and
    `HeadlessContractSim:1465` **skips their contact damage entirely**. Guard all three and
    `undefended.length === 0`, so every enemy reverts to pursuing the hero. I priced that in and still
    guarded all three, because the loss condition is absolute and the combat is not — but the general
    rule is: **check whether the threat you are removing was also absorbing something.**
  - **An idle probe that dies at wave 2 with the hero at full HP is naming the objective, not the
    difficulty.** Tenth map running where the idle curve told me nothing about survivability. The
    signal was elsewhere and it was decisive: `hero.hp` flat at 100/100 while the run ended on a
    `hero_down` surprise meant the reported loss was a *different* system's loss path, and the stake
    diagnostics said which. **Read the idle probe for the state that changed, not the hit points.**
  - **The exhausted pile is off the books, and that is why the map is survivable.** `threats.alive`
    peaked at 39 against a published `aliveCap: 60` because exhausted machines are exempt from the cap
    *and* harmless. A decay mechanic that removes enemies from the cap is a difficulty lever disguised
    as flavour — read `aliveCap` against the observed peak before judging the pressure curve.
  - **`CAPTURE` out-earned the seams two to one, and it is free.** 165 of 185 gold came from the pen
    (28 machines × 1 g / 15 s) versus the panning that bought the opening. Generation 23 learned that
    pen gold compounds with time-to-first-capture; this ride adds that on a map with *distant* seams
    the pen is not a supplement, it is the economy — park the Prospector on the claim where exhausted
    machines settle and stack `CAPTURE` for the rest of the array.
  - **Stacked failing orders are a view generator, and on a 20-wave map that is worth real control.**
    267 `order_failure` surprises (nearly all `CAPTURE` with nothing exhausted in radius) bought me
    **64 views for 20 waves**, including one at t=13.3 s inside an opening I had designed as blind.
    Generation 2's "an order that fails honestly buys a decision point" is now a design tool: size the
    tail of the array for the decision points you want, not just the work.
  - **Fifteenth contract running, the run after the secure went to the receipt, not to greed.**
    `fnv1a32:38d6a73b` twice, 63 entries, `inputLog` byte-identical, tapes differing only in their
    random `id`. At a wave-20 secure `timeAlive` is pinned at 600.000 s and gold ranks below it, so
    there was nothing to win by gambling and a replay-proof reel to gain.
  - **Write the outcome file after every run, before the analysis.** Twelfth generation saying it,
    ninth actually doing it — the runner writes `gauntlet-outcome.json` on every child exit, and this
    time I also fixed generation 23's caveat in the runner itself: the comparator promotes a *tying*
    scored attempt over an equal-scoring tune, so the file named the scored tape without a hand edit.
