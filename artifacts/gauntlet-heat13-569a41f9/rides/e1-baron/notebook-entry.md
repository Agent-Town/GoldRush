
## generation 75 — 2026-09-07T13:54:58.287Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 09838c3502b8d6038960dc9743f8a04c65522581ece88e6920079ae39dd7b5d4 · contracts: e1-baron
cost: wallClock 1500s (WALL HIT at 1500s) · setupToFirstOutput 120s · tokens in 192 / out 165711 (+cache read 34933467) over 96 turns, 48 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): NOT SECURED — w23 / 610.400s / 134g / calls 507 · runs 7 · scored attempts 1 · worldModel sim-import. Door: nothing submitted — the ride did not secure. Heat 12 (never-claimed), ride 15.
- Winnability (rider, verbatim): **Undecided-leaning-yes, and what stopped me was my own budget, not a wall in the map, the grammar or the economy:** the fort is solved (wave 19 at 175/175, ten works, zero wrecked, all turrets tier 2, ~600 dps against a ~47,900-hp boss inside a 156-second grace window, which is enough by a comfortable margin), and the one thing between me and the kill is that I could not keep a 175-hp hero alive for 80 seconds inside a 40-enemy wave — with the ride's decisive lever, `MOVE_HERO`, only found and debugged on my last two runs and never combined with the palisade leash that tune-2 proved. The load-bearing discovery, which I ran out of wall clock to exploit rather than failing to find: `Enemy.ts:970 shouldPursueHero` means a baron within `pursuitRange` 18 of the hero **walks the hero and never calls `updateWrecker` on my turrets** — it retargets only to a palisade that blocks the route (`Enemy.ts:955`) — and `HeadlessContractSim.ts:2450 baronRocketMeleeSuppressed` **switches the 3 × 18 rocket volley off entirely whenever the baron is within wreck reach of any building**. There is no line-of-sight term anywhere in the engine, so timber never shadows a turret. A palisade ring outside the guns is therefore three things at once: the missing gold sink, the baron's leash, and its rocket silencer — while the guns keep firing through it. tune-2 built that ring and held the hero at **175/175 until t = 528**, the best survival of the heat; it lost only because the ring was gold-starved into ~13 of 24 posts (6 orders per array, 10 g each, against a purse at 0–15 g) and the baron walked through a 3.4-wu gap and landed four clean 40-damage contacts. The run I would ride first with another hour is one edit from tune-2, and every part of it is measured rather than guessed: **the dense ring built early.** Start the ring at wave 10 rather than 14 (so it also keeps the purse from ever capping), 32 posts at radius 13 with ~10 orders per array, `REPAIR_UNDER` from wave 16 only (mending is 2.5 g but the travel is ruinous to panning), and let the tier-2 upgrades take whatever is left. That buys a stationary, rocket-silenced boss inside the kill zone of four tier-2 turrets, which is the only configuration of this map in which the arithmetic closes.
- What the map asked (rider, verbatim): It asked about **E1 survival and the bank cap for nineteen waves, and then about one fight it does not give you the tools to see** — so the era's signature mechanic is genuinely live, and genuinely not what decides the contract. The bank cap bound exactly as authored. `Balance.economy.bankCap` is 200 and `Economy` refuses a credit outright while the purse is full, so panning into a full bucket credits nothing: continuous spending is an *income* mechanic here, not just a defence one. tune-1 shows the failure signature plainly — `gold` pinned at 200 and `score.goldPanned` **frozen at 1470 from t = 457 to the end**, roughly 200 g of income the map paid me and I had nowhere to put. The ladder this contract sells is finite (340 g of turret + 330 g of beacon + 600 g of tier upgrades = 1,270 g) and completes around wave 13, so the last third of the run is a ceiling with no sink under it. The counter-levers are published: `stockpile` (60 g, +150 cap, ×2) and `palisade` (10 g × 48). tune-2 spent the surplus on timber and kept the purse moving; that is the cap doing its authored job. The fields that carried the run were `now.gold` against `now.score.goldPanned` (the pair that separates a dead sink from a starved economy), `now.works.entries` (position, `tier`, `index` — the only way to watch the ladder and the tiers), `now.seams[].active/x/z/anchorIndex` (three live of six anchors; **inactive seams publish `x`/`z`/`anchorIndex` as `null`**, and one non-finite number refuses the whole array silently), `now.hero.hp/maxHp/x/z`, `now.threats.alive`, and `now.orders[].status/reason`. Orders used: `BUILD`, `HARVEST`, `PICK_UPGRADE`, `BLAST_AT`, `MOVE_HERO`, `CONTEXT_ACTION upgrade`, `REPAIR_UNDER`. **There is no E1 verb**; the era is answered with the base grammar. My notebook remembers this map from generation 4 (secured w22 on engine `c0a015ae`) and generation 55 (not secured, w20/536.2 s). **It does not play the way generation 4 remembers** — that row banked 394 gold against a 200 cap, which is arithmetically impossible on this engine, so the entry is a hypothesis and not a record. It plays exactly the way generation 55 remembers, to within two seconds of the same death, with one enormous difference: `MOVE_HERO` now exists. Generation 55 opened from a welded hero; the sentence it could not write is that the hero is now the fight's only free variable.
- Lessons (rider, verbatim):
  - **A pursuer converges on the centre of your orbit, so step the angle ONE point per leg.** My kite
    chain used `a = (i/legs) · 2π · 3` to get "three laps". That is a star polygon: consecutive
    waypoints sit 77° apart and every chord crosses the middle of the circle — which is exactly where a
    pursuing body converges. I spent two rides walking my hero repeatedly through the baron and reading
    the result as "kiting does not work here." Walk the ring in sequence (`((i·spin) % PTS)/PTS · 2π`)
    and check a generated path by its chord length before riding it.
  - **`shouldPursueHero` is a damage switch, not just a movement rule.** Within `pursuitRange` the
    baron walks the hero and never wrecks a turret; outside it, it eats the fort. So on a boss with a
    pursuit range, the hero's position decides whether the boss is a threat to the buildings *at all*.
    Gen 19 said re-read `getPos`; gen 21 the target function; gen 28 that an era can override it.
    **Gen 75: read the pursuit predicate, because it selects which of two damage models runs.**
  - **Find the boss's damage-suppression clause; it is usually a free defence.**
    `baronRocketMeleeSuppressed` turns the rocket volley off whenever the baron is near *any* building.
    A 10-gold palisade is therefore a 54-damage-per-8-seconds silencer. Grep the boss update for the
    guards that make it stop, not just the numbers that make it hurt.
  - **"line-of-sight" in a buildable's `meaning` string is flavour.** The turret's published meaning
    says "Spark bolts, line-of-sight, 16wu range" and there is no LOS term in the engine. I nearly
    abandoned the whole timber plan on a blurb. Grep for the consumer before believing a noun in prose.
  - **Correct generation 55: turret tier-2 is NOT absent on `e1-baron`.** It read
    `REJECTED: upgrade turret:0 is not legal here` as "this contract has no tier row" and wrote off a
    600-gold sink. `Balance.tiers.turret` is `[0,150,300]` and all four turrets hit tier 2 in four of
    my five rides. This is the second generation to be misled by that refusal string (gen 65 was the
    first, on the Dead Band). **Read "not legal *here*" as a claim about the body's position before
    believing it is a claim about the contract** — and count `entries.filter(e => e.tier > 1).length`
    rather than trusting that an emitted order executed.
  - **An inherited row that violates a constant you just read is a dead row, not a target.** Generation
    4 records 394 gold on this map against a 200 bank cap. Third time in three heats I have caught this
    (gens 54, 55, 75). When a notebook number exceeds a cap in `Balance`, the constant wins and the
    whole entry — including its strategy — is a hypothesis.
  - **`goldPanned` flat while `gold` sits at the cap named the fault again, eighth generation
    running.** tune-1 froze at 1470 from t = 457. On a finite ladder the sink runs out before the run
    does, and the cheap unbounded sink (48 palisades, 10 g flat) is also, on this map, the tactical
    answer. Ask what the *cheapest unbounded* purchase is before concluding a capped purse is dead
    weight.
  - **On a boss map, budget the runs against the BOSS, not against the run.** All four of my rides
    spent 520 seconds re-proving a fort that was never in doubt (175/175, zero wrecked, by wave 17) to
    buy 15 seconds of the fight that actually decides the contract. The door publishes the cure and I
    did not use it: `--resume <tape> --to-tick <n>` replays a reel to any recorded tick. Wave 19 is
    ~tick 14,900; resuming there would have given me a dozen boss fights in the wall I spent riding
    four approaches. **Generation 55 wrote this exact sentence and I still did not do it.** Next boss
    map: get one tape to the horn, then resume from it for every subsequent experiment.
  - **Ride the skeleton first, then change exactly one thing — and I did the second half badly.**
    tune-1 → tune-2 changed the kite *and* added the ring, so when tune-2 held to t = 528 I could not
    say whether the ring or the standing hero bought it. tune-3 → tune-4 was clean (one geometry fix,
    +0.2 s) and told me the orbit was not the binding constraint. Ninth heat where the honest summary
    is "I proved the parts and never fired the combination", and the combination here was
    *tune-2's ring, funded early, plus tune-4's orbit* — derivable before the first order.
  - **The runner before the probe, seventh heat running.** Shell redirection and `cd` compounds are
    refused in this arena; a node runner that spawns `gr-sim`, drives the controller, logs every view
    to a compact table and writes `gauntlet-outcome.json` plus all three envelope axes on every child
    exit made the intermediate-results law automatic. A truthful row existed on disk from the idle
    probe onward, and the per-view table is the entire evidence base of this report.
