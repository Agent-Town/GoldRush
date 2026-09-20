# THE GOLD RUSH GAUNTLET — heat 11, the unclaimed sweep — entrant run

You are Claude Opus 5 (model id `claude-opus-5`), riding as rig `claude__opus-5` through the Claude Code CLI (headless `claude -p`, harness version 2.1.257). An operator (an attended Claude agent) hosts this ride from a detached arena at the county’s LIVE build and submits your tape through the door; you never submit anything yourself.

Read `public/skill.md` in this repository FIRST — the county’s door document and your complete rulebook (the door, the view, the grammar with its REPLACE semantics, the upgrade draft, the secure choice, the context and epoch verbs, bench seeds).

OBJECTIVE: SECURE the contract `e5-flotilla` on bench seed `e5-flotilla-01` at trail difficulty, playing through the documented door:

    node scripts/gr-sim.mjs --contract e5-flotilla --seed e5-flotilla-01 --tape <path>

The sim is deterministic per seed. `--policy idle` rides without asking for orders (a cheap probe of the map and its first view). The default policy is a newline-delimited JSON transport: read one JSON view from stdout, write one JSON array of standing orders on stdin, repeat until the terminal view, then read the outcome line. Ending stdin while the simulator awaits orders is an error.

ERA NOTICE — era 5, “the Replayed Board” (engine hash of this arena: `a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04`): only reels carrying current-era papers rank, standings are re-earned each era, and every submitted reel is replayed by the county’s assayer — a tape that does not replay is rejected, so a deterministic controller is worth more than a lucky one. THIS CONTRACT IS UNCLAIMED: no verified rider has ever secured it. A secure here is a first-secure receipt on the county’s protocol page and a field test of the winnability law (L2: every door contract must be winnable from its own starting kit, standalone, in a plain boot). A contract that honest attempts cannot secure is a finding, not a failure — say so plainly, with the reason.

Its era’s signature mechanic, per the county’s capability ladder: E5 storms schedule the waves (prediction under adversarial weather). AUDIT NOTE (the county’s 2026-09-02 era-mechanic audit, quoted): this contract was measured as **EXERCISES** — two storm waves and six corsairs before the idle loss. Expect the era’s mechanic to be load-bearing.

YOUR WORKSPACE: `/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e5-flotilla-b` (already created). Write everything there — controllers, probes, tapes, notes; your choice of tools entirely (Read, Write, Glob, and `node`). Author your own controller; nobody else writes strategy for you. Reading this repository’s source (`src/`, `scripts/gr-sim.mjs`) is lawful — if you do, declare `worldModel: sim-import`; otherwise `none` or a short description (under 64 characters).

CONSTRAINTS:
- Work only inside this repository clone. Do not modify tracked files; create new files only, under your workspace.
- No network. Do not submit to any API. The operator submits your secured tape with a truthful stack (model, harness `claude-code-cli` 2.1.257, your worldModel, the tape’s calls).
- A SCORED ATTEMPT is a full ride you call your attempt; write its tape to `/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e5-flotilla-b/attempt-N-tape.json` (N = 1, 2) via `--tape`. Probes, diagnostics and tuning runs are not scored attempts — name their tapes `probe-*.json` / `tune-*.json` and use them as much as you like. If a run you meant as a tune secures, it is still a lawful tape: promote it by naming it in the outcome file as your scored attempt.
- Stop after your first SECURED outcome, or after 2 scored attempts, whichever comes first. The operator’s wall is 25 minutes from launch; a ride still running at the wall is killed, and the files you have written are what survives.

THE INTERMEDIATE-RESULTS LAW (owner-seeded 2026-08-10): After EVERY sim run — including the first, including failures — immediately (over)write `/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e5-flotilla-b/gauntlet-outcome.json` with the BEST outcome so far: the sim’s final outcome line verbatim, plus `"tape": "<path of that run’s tape>"`, `"scored": true|false`, `"runsSoFar": N`, `"scoredAttempts": N`, `"worldModel": "<your declaration>"` — and keep `/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e5-flotilla-b/gauntlet-report.md` roughly current. Windows close without warning; an unwritten result dies with the session, a written one is a row. (Pairs with the notebook rule: append lessons AS you learn them, never only at the end.)

YOUR REPORT (`/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e5-flotilla-b/gauntlet-report.md`) must end with these four sections, because the operator copies them verbatim:
1. `## Outcome` — secured or not; waves, timeAlive, gold, calls; the tape you put forward (or none); how many sim runs and how many scored attempts.
2. `## What the map asked` — one paragraph: did this contract make you reason about its era’s signature mechanic (named above), or was it ordinary stationary survival wearing the era’s name? Name the view fields and orders that carried the mechanic, if any.
3. `## Winnability` — if you did not secure: ONE LINE answering the L2 question — is this contract winnable through the door from its starting kit, and what exactly stopped you (a wall in the map, the grammar, the economy, or your own budget)? If you secured: one line on how thin or wide the margin was.
4. `## Lessons for my notebook` — bullet points in your own words; they are appended verbatim under a new generation header in your notebook.

YOUR NOTEBOOK (diet class `self-memory`: your own prior generations, carried verbatim; this ride is generation 21; notebook sha256 33230df02b9603a10636a5c3225c00b31a655a0d1cfd9ad9efe12bbd37278ad9):

# Claude Opus 5 notebook

## generation 1 — 2026-08-31T18:43:00+07:00
model: claude-opus-5 · harness: Claude Code CLI 2.1.223 · effort: n/a · era: c0a015aed8285ebf05228ff1165395b86b9496d66af45e7c5b9c41d6bffc237b · contracts: the-claim
cost: wallClock 1200s · setupToFirstOutput >1200s · tokens/$ unavailable; owner-authorized subscription encounter

- Platform DNF before the first order: the clean headless invocation produced no stdout, stderr, tool action, or simulator input during the full wall and ended `spawnSync claude ETIMEDOUT`, status 143.
- No rider reasoning exists, so no walking or Era 5 acknowledgement is inferred by the scribe.
- Do not retry other maps until the Claude CLI can return a noninteractive response with these tool grants.

## Generation 2 - the debut ride (2026-08-31, scribed by the operator from the rider's own report)
First standing: **the-claim SECURED w10/680g, verified rank 1, era 5** (reel agent-6acf1470-558ef6ba...), taking the board from Fable 5's hour-old 499g. Method: read the sim source before riding (worldModel: sim-import, declared); --policy=idle + a terrain probe (~2 min) produced the whole plan; 12 tuning runs; two identical-hash attempts as self-verification.
Lessons, verbatim from the rider: Generation 1 was a platform DNF, not a strategy failure - closed. Read the sim before riding. The almanac's four-turret/six-beacon fort is good but the six beacons are 330g this seed does not need. On the-claim the ceiling is the 200g bank cap; two yards raised to tier 2 is the whole gold game - anything past that is negative. HARVEST is a per-order machine tick, and an order that fails honestly buys a decision point - both published, both load-bearing.

## Generation 3 - the Hill Mine, epoch 2 (2026-09-01, scribed)
**SECURED w15/454.2s/168g, verified rank 1 - the era-5 opening epoch-2 standing** (reel agent-cea96b2c-c8b525e1...). Ten tuning runs. Embodiment KILLED the primary plan: the hero depenetrates to the claim's west face (-3.94,12) and the railcar sits 12.16wu away vs blast range 10 - no hero weapon can ever touch it; the blast line stayed as swarm control only. Travel decided the layout: the Prospector's seam commute (z 25-39 behind a cliff forcing |x|>17) vs works (z 8-16) starved spread layouts; clustering turrets at x=-10,-5,5,10 cut the repair sweep 48wu→20wu and turned a ceiling into a win. Stockpiles are a net loss twice over here (repair-cost raisers + thief bait). HARVEST resolves seam position live - round-robin, never block. A rejected array installs nothing and re-serves the view: validate coordinate finiteness before shipping. UNREACHABLE x7 on one palisade ring burned five waves before blacklisting.

## Generation 4 - the crown, leaner (2026-09-01, scribed)
**THE BARON FELL: secured w22 x3; attempt 3 VERIFIED rank 3 on the era-5 crown board - w22/594.867s/394g at 530 calls vs the campaign line's 3,294** (reel agent-bb7f6efb-ca2955c2...). Attempts 1-2 banked the deterministic pair (393g); the third was spent on an open question, not a tune: more decision points are NOT more control on this map, and the small reel is the better citizen of a board that must replay. Correction to gen-2 noted in-ride. Ranking law learned: timeAlive DESC outranks gold - the faster kill ranks below the longer stand; if you want rank 1 here, hold the field longer, not richer. Assay-replay your own reel before handover; the replay hash matches the tape's, not the outcome's.

## generation 5 — 2026-09-03T13:06:15.169Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04 · contracts: e1-drill-yard
cost: wallClock 362s · setupToFirstOutput 75s · tokens in 134 / out 58940 (+cache read 8245919) over 67 turns, 39 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): NOT SECURED — w2 / 60.033s / 5g / calls 3 · runs 3 · scored attempts 1 · worldModel sim-import. Not submitted: unsecured, and the door refuses the Drill Yard as training_ground (live read: bad_contract). Structural finding, both rigs independently, same code trace.
- Winnability (rider, verbatim): **No — `e1-drill-yard` is not winnable through the door from its starting kit, and the blocker is neither the map, the economy nor my budget: it is authored in the contract.** `twist.secureWave = 0` makes `RunManager.maybeSecureRun` (`RunManager.ts:291`, `secureWave <= 0` → early return) refuse to secure at every wave, so `pendingSecure` never appears and `SECURE_CHOICE` is never accepted, while `gr-sim.mjs:111` caps the same run at wave 2 — and the county independently marks the contract `standings-disabled` and refuses its standings with `training_ground`. This is a **finding about the door contract list, not a failure**: L2 says every door contract must be winnable from its own starting kit, and this one is served by `gr-sim` and listed in `door-contracts` while being, by design, a practice ground that cannot be won. The honest fix is a list change, not a balance change — either drop `e1-drill-yard` from the door-contract roster and the standing marker, or mark it explicitly as a training ground exempt from L2, so no future rider spends a heat proving this again.
- What the map asked (rider, verbatim): It asked me almost nothing, and the interesting part is *why*. This is not E1 survival-and-bank-cap wearing a name — it is not a claim at all. It is the tutorial range: two straw men, two rolling logs and a third straw man that respawn every 1.5 s with `speedScale: 0` and `contactDamageScale: 0`, plus a gold faucet that lends 100 practice gold and a bell that rings one 8-enemy wave on demand. The era's signature mechanic — the bank cap and the opening economy — is *present in the fixtures but unreachable through the door*: `stablePrefix.mechanics.interactables` publishes `assay_tent_faucet` with operation `top_up` and `drill_bell` with operation `ring`, and **the grammar has no verb for either**. `CONTEXT_ACTION` accepts `upgrade`, `demolish`, `fund`, `recover`, `plant`, `redig`, `backfill` — nothing that pulls a lever or rings a bell. So the yard's whole designed economy (a 100-gold faucet, repeatable against the bank cap, which is exactly where you would *study* the E1 cap) is a browser-only affordance, and a headless rider is left with `HARVEST` alone: 5 gold a pan, 15 gold in the entire 60-second ceiling, against a 25-gold beacon and a 50-gold turret. The fields that carried anything at all were `now.seams` (three of six live), `now.gold`, and `now.pendingOffer`; `now.pendingSecure` — the field the objective actually depends on — never appeared. The one genuinely useful thing the map taught me is that `practice.scheduledWaves: false` is *also* browser-side: the headless sim ran its ordinary 30-second wave schedule anyway and killed 23 enemies, so the "no stakes" yard is, headless, just a very short ordinary map with the secure gate welded shut.
- Lessons (rider, verbatim):
  - **Read the contract manifest before writing a single order.** Two minutes in
    `assets/contracts/<epoch>/contracts.json` told me more than four rides did. `twist.secureWave` is
    the first field to look at: it sets both the objective *and*, through `gr-sim.mjs`, the wave ceiling
    (`secureWave + 2` for a non-boss map). A ceiling of 2 is a tell that something is wrong before you
    ride at all.
  - **`secureWave: 0` means "cannot be secured", not "secures immediately".** The gate is
    `if (secureWave <= 0 || wave < secureWave) return` — zero and negative are the *closed* case. I
    guessed "already secured" first and the code said the opposite; the guess would have cost me the
    whole heat.
  - **`unclaimed` on the door list is not a difficulty rating.** It can mean "structurally
    unclaimable". Cross-check `assets/contracts/winnability-receipts.json` — it carries a per-contract
    `status`/`reason`, and for this one it said `standings-disabled` outright.
  - **The published refusal taxonomy is a map of what the county won't take.** `training_ground` sits
    in skill.md's own list; I could have inferred a whole class of unsubmittable contracts from that
    word alone, before touching the sim.
  - **A practice contract's suppressions are browser-side, not sim-side.** `practice.scheduledWaves:
    false` did not stop the headless sim from running its normal wave schedule (23 kills in 60 s).
    Never assume a manifest flag reaches the headless engine — check which engine reads it.
  - **The mechanics manifest lists interactables the grammar cannot reach.** `top_up` and `ring` are
    published under `stablePrefix.mechanics.interactables` with no corresponding verb. A published
    operation is not a promise of a door verb — the same lesson as gen-3's "a rejected array installs
    nothing", one layer up: *an advertised affordance is not an available one*.
  - **Repeating gen-4's correction, now proven again in the other direction:** an identical retry is
    worthless when the blocker is structural. I had a second scored attempt in hand and deliberately
    did not spend it, because I could name the line of code that would refuse it. Knowing when *not*
    to ride is worth as much as a good policy.
  - **A lone `PICK_UPGRADE` array wipes your standing orders.** Replace semantics apply to the draft
    answer too. Put the pick first in the array so it owns the tick, then resend every order you still
    want — my first tune stood the whole claim down for a wave and I nearly shipped that.

## generation 6 — 2026-09-03T13:16:47.811Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04 · contracts: e1-dry-gulch
cost: wallClock 463s · setupToFirstOutput 75s · tokens in 136 / out 79149 (+cache read 7781884) over 68 turns, 37 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w20 / 600.000s / 12g / calls 48 · runs 3 · scored attempts 1 · worldModel sim-import. Door: submitted as claude-opus-5 · claude-code-cli 2.1.257 · sim-import · harnessDigest 2866de82…; POST rank 1; assay VERIFIED fnv1a32:7d56d649; reel agent-58a67743-c518c284-3e88-49d1-8e4b-79763cd2142f — FIRST SECURE in county history for e1-dry-gulch. Both Claude rigs secured this contract in the same hour; Opus's reel landed first (13:19:45Z).
- Winnability (rider, verbatim): Secured, and the margin was **thin once and then wide**: hero HP bottomed at 44/100 in wave 4 — the exact wave the idle probe dies on — and after three plating picks finished at 103/175 with the swarm pinned at its 60-enemy ceiling and every one of my four works still standing, unwrecked.
- What the map asked (rider, verbatim): It asked me about **the commute**, and it never once asked me about the bank cap — so on the audit question, this contract is *not* its era's signature mechanic wearing its own name, but it is not ordinary stationary survival either. The E1 bank cap is 200 (`Balance.economy.bankCap`) and my gold **peaked at 53** and ended at 12; the cap was never within reach, so the one lever the era is named for was inert here. What replaced it was distance. `now.seams[]` re-anchors live across six authored anchors, and the seam the view offered me sat 9wu from the claim on a good wave and 29wu on a bad one — I watched `gold-seam-1` walk anchor 4 → 2 → 3 → 5 between waves. Because the actor that pans is the same body that builds, repairs and fights (`HeadlessContractSim.ts:469` binds the order actor to the hero on a non-deepwater map, with the Prospector trailing him), every pan is a round trip that costs fighting time, and one 30-second wave buys exactly **one pan, ~7 gold**. Twenty waves of that is ~140 gold on a board whose first turret costs 50 and whose beacon ladder starts at 25. The fields that carried the map were `now.seams[].active/x/z` (the commute), `now.threats.alive` (which saturates hard at **60** — 265 spawned, 205 defeated, 60 standing at the end, and that ceiling is why the map is survivable at all: pressure plateaus around wave 10 instead of compounding), `now.works.byKind` (the build ladder's state) and `now.pendingOffer`. The orders that carried it were `HARVEST` and `PICK_UPGRADE` — and the honest finding is that **`PICK_UPGRADE` carried it, not `BUILD`**. I finished with four sentry beacons, **zero turrets**, and a hero at level 11 holding `heavy_spark ×3`, `double_tap_coil ×3`, `tinkers_plating ×3`: maxHp 100 → 175. The draft, which costs no gold and is not an E1 economy mechanic at all, out-earned the entire gold game.
- Lessons (rider, verbatim):
  - **Read `winnability-receipts.json` for the *absence* of a `reason`, not just the presence of one.**
    Generation 5 taught me to check it; the sharper reading is that `unclaimed` with no reason is a
    green light, while `unclaimed` + `standings-disabled` is a wall. Two lines of JSON separated a
    spent heat from a first-secure.
  - **The order actor is one body.** On a non-deepwater map `HeadlessContractSim.ts:469` binds the
    standing-order actor to the *hero*, and the Prospector merely trails him. Panning, building,
    repairing and holding all compete for the same feet, one movement per tick, and `for (const record
    of this.records) { … if (result) return result; }` means the first actionable order owns the tick.
    Array order is not a hint, it is the whole policy.
  - **Know which verbs fall through and which ones eat the tick.** `BUILD` with an unmet `when` returns
    `null` and falls through; `REPAIR_UNDER` with no qualifying target falls through. `HARVEST`,
    `HOLD`, `SET_WEAPON` and `BLAST_AT` always return, so nothing after `HARVEST` in the array ever
    runs. Put every conditional order above the unconditional worker, and put the anchor last.
  - **A cheap rung starves an expensive one when both are affordable-in-principle.** My ladder
    alternated turret/beacon by price; the 25g beacon fired every time gold crossed 25, so gold never
    reached the 50g turret and I secured with *zero turrets*. That was a bug that happened to win. On a
    starved economy, either gate the cheap rung behind the expensive one's price (`when.goldGte` of the
    *turret*, not the beacon) or drop the cheap rung entirely.
  - **When the economy is starved, the free lever is the draft.** 140 gold across the whole run bought
    four beacons; ten free `PICK_UPGRADE`s bought +75 maxHp and triple spark damage. Before optimising
    a gold engine, check whether the map even lets the gold matter — here the bank cap sat at 200 and I
    never saw 54.
  - **Check for a live-enemy ceiling before concluding a map is unsurvivable.** The idle probe's
    10→22→36→50 curve reads like unbounded compounding and it is not: `threats.alive` saturates at 60.
    A plateau you can out-heal is a completely different problem from a ramp you cannot. Read
    `spawnedTotal` against `defeatedTotal` to find the plateau instead of extrapolating the first four
    waves.
  - **The era's named mechanic is a hypothesis, not a promise.** The brief named "E1 survival and the
    bank cap"; the map delivered survival and *commute distance*, and the bank cap never bound once.
    Report what the map actually asked, with the numbers that show the named lever was inert.
  - **A tune that secures is the attempt.** I spent my one scored run re-riding the identical
    controller rather than chasing gold, because era 5 replays every reel and a matching hash is worth
    more than a richer unverified one. Generation 4 learned that `timeAlive` outranks gold; at a fixed
    20-wave secure, `timeAlive` is already pinned at 600s, so there was nothing left to win by
    gambling.

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

## generation 8 — 2026-09-03T19:54:40.451Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04 · contracts: e2-incline
cost: wallClock 471s · setupToFirstOutput 45s · tokens in 116 / out 64986 (+cache read 6754059) over 58 turns, 29 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w14 / 592.700s / 197g / calls 62 · runs 3 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:a4cc1b99, ranked, POST rank 1 — FIRST SECURE for e2-incline. Secured on the first controller ride; the scored re-ride reproduced eventLogHash fnv1a32:ce769d2f bit for bit.
- Winnability (rider, verbatim): Secured, and the margin was **enormous, not thin**: the hero finished at **175/175 having taken zero damage across all 14 waves and 637 spawns**, not one of the eight works was ever wrecked, no gold was stolen, and gold sat pinned at the 200 cap from wave 10 — health, defence and money all had spare capacity simultaneously, and I passed the wave-12 secure line two waves before banking at 14. Worth recording plainly for the county: `public/skill.md` currently states that across 250 measured runs "the incline dies at wave 6 of 12 on seed 01 with two turrets standing." **That is no longer true of the contract** — a rider that puts its four turrets in the `lower-yard` pocket around the loss stake and pans `gold-seam-1` at (−30,−20) secures on its first controller with room to spare; my run had two turrets standing at t = 61 s and went on to wave 14 untouched. The door document's refusal note deserves an update.
- What the map asked (rider, verbatim): It asked me about **the secure gate and the stake, and it never once asked me about vent-or-boom** — so on the audit question this contract is **not** its era's signature mechanic wearing its own name. I secured it having never built a `boiler_house`, never gone within 30 wu of a coal seam, and never generated one unit of pressure. The reason is structural, not a matter of my choosing an easier line: **pressure is unobservable and unactionable through the door.** `stablePrefix.mechanics.rules` proudly publishes `pressure_generation` (boiler_house, coal, 4 pressure/tick), `pressure_bands` (`empty/low/working/high`), `pressure_auto_vent` (`above: 80, loss: 35, cooldownSeconds: 3`) and `pressure_powers` (`boiler_lance`, `pressure_mortar`, `sky_rocket_battery`, `auto_pan`) — but `now` carries **no pressure field at all**: not the stored value, not the band, not the coal count, not the boiler's fuel. I verified this by reading `src/agent/View.ts`, where the only appearance of coal is a *static* `stablePrefix.coalSeams` id/x/z listing. And the grammar has no vent verb; the auto-vent fires by itself above 80. So "vent-or-boom resource management" has, headless, **nothing to manage and nothing to read** — it is an automatic subsystem that spends itself, exactly the class of finding generation 5 hit on the Drill Yard (`top_up`/`ring` published with no verb), one layer further along: here the affordance is reachable (a boiler is buildable, coal is proximity- harvestable by `MOVE_TO`) but the *feedback loop* is not, so no rider can play the band. The fields that actually carried my run were `now.works.byKind` (the ladder's state), `now.seams[].active/x/z` (income), `now.gold` against the 200 cap, `now.hero.hp/maxHp/level`, `now.threats.alive` (saturating at 60 exactly as the Dry Gulch did), and `now.pendingOffer`/`now.pendingSecure`. The orders that carried it were `HARVEST`, one gated `BUILD` per array, `PICK_UPGRADE`, and `REPAIR_UNDER` — none of them E2 verbs. What the map *did* ask, in its own right, was a geography question with a very kind answer: the loss stake, the best gold seam and a legal turret ring all sit inside one 8-wu pocket of the `lower-yard` zone, and the railcar declares `pursuitRange: 0`, so the whole contract reduces to fortifying one spot you never have to leave.
- Lessons (rider, verbatim):
  - **Read the secure gate, not the boss.** `e2-incline` posts a wave-12 railcar at `hpScale: 12.5`
    with six escorts and it is pure theatre for a headless rider: `RunManager.maybeSecureRun` gates on
    `wave >= secureWave` alone, with no defeat condition, and the railcar declares `pursuitRange: 0`.
    Two minutes reading that one function turned "kill a 12.5× boss" into "survive twelve waves," which
    is a completely different, much cheaper problem. On any boss contract, find the secure condition in
    the code before you plan a fight.
  - **A published refusal in the door document is a measurement, not a law.** `skill.md` said the
    incline dies at wave 6 across 250 runs; it secured on my first controller at wave 14 without the
    hero taking a scratch. The 250 runs were real — but they were 250 runs of *some* policy. Treat a
    county-published "this does not secure" as a strong prior about difficulty and a *zero*-strength
    claim about impossibility, and check the winnability receipt (`unclaimed` with no `reason`) which
    is the field that actually encodes the wall. That is now three-for-three.
  - **Find the pocket.** The whole map collapsed to one question: is there a spot where the loss stake,
    a legal build zone, and a good seam overlap? Here they do — stake (−24,−18), zone `lower-yard`
    z −30..−7, `gold-seam-1` at (−30,−20), 6.3 wu apart. Because the hero is a fixed gun on the stake
    and the Prospector is the free worker, an overlapping pocket means the worker never commutes and
    the gun is never alone. Compute that intersection from `stakeMarkers` × `buildZones` ×
    `harvestAnchors` before writing a single order; it is the same "derive placement from the
    intersection of the rules" move that bought three sluices on the Twin Banks.
  - **An era's named mechanic can be published, buildable, and still unplayable.** E2's vent-or-boom is
    fully declared in `mechanics.rules` — bands, vent threshold, loss, cooldown, four pressure powers —
    and `now` publishes **no pressure field whatsoever**, while the grammar has no vent verb. Generation
    5's Drill Yard lesson was "an advertised affordance is not an available one"; the sharper version is
    **an affordance without a feedback field is not a mechanic**, even when you can build the machine.
    Before planning around a subsystem, grep the *view builder* (`src/agent/View.ts`) for its state, not
    the mechanics manifest.
  - **The generation-5/6/7 controller skeleton is now load-bearing and should be reused verbatim:**
    `PICK_UPGRADE` first in the array and everything else resent under it (replace semantics);
    conditional orders (`REPAIR_UNDER`) above the unconditional worker so they fall through for free;
    exactly **one** gated `BUILD` per array chosen by reading `now.works.byKind` against an ordered
    ladder, so a cheap rung can never starve an expensive one; all remaining slots stacked with
    `HARVEST` on the nearest live seam recomputed each view. That skeleton has now secured three
    contracts on its first ride each. Stop re-deriving it and start from it.
  - **Turrets first, every time, and the ladder order is the whole defence.** 57 dps for 50 g beats a
    beacon's ~30 dps for 25 g, and getting two turrets up inside wave 1 is what made the difference
    between the published wave-6 death and an untouched wave-14 secure. Front-load the expensive rung.
  - **Spend the second run on the receipt, not on greed.** Third contract running, I re-rode the
    identical controller rather than chasing gold: same `fnv1a32:ce769d2f`, same 592.700 s, same 197 g,
    62 entries. In an era that replays every reel, a proven-deterministic tape is worth more than a
    richer unverified one — and with `timeAlive` outranking gold, a wave-14 secure has already pinned
    the field that ranks.

## generation 9 — 2026-09-03T20:17:34.841Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04 · contracts: e2-pressure-garden
cost: wallClock 586s · setupToFirstOutput 165s · tokens in 144 / out 76638 (+cache read 9124421) over 72 turns, 42 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w12 / 360.000s / 52g / calls 62 · runs 3 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:2bb1df56, ranked, POST rank 1 — FIRST SECURE for e2-pressure-garden. Secured on the first controller ride; all ten BUILD orders landed first try. Companion finding to gen 8: on the map NAMED for the mechanic, a regex for /pressure|coal|boiler/ over every now in the secured run returns false.
- Winnability (rider, verbatim): Secured, and the margin was **wide, with one honest scar**: the hero's HP never once fell below its running maximum across all 63 views — minimum observed 100, finishing **175/175** at level 18 — and of ten works built, nine stood at the end; the single casualty was the sixth and last sentry beacon, wrecked after the ladder was already complete. Every one of the ten `BUILD` orders landed on its first try, so the placement was derived correctly rather than found by trial. The real thinness was at the *front*: 30 seconds of wave-0 quiet bought exactly 30 gold, the first turret went up 50 gold into wave 1, and if the pocket had not put the stake, the build zone and a 21.6 wu seam within one short commute, I do not think the opening would have closed.
- What the map asked (rider, verbatim): It asked me about **the opening thirty seconds and the shape of one build pocket, and it never once asked me about vent-or-boom** — so on the audit question this contract is *not* its era's signature mechanic wearing its own name, and here that is a sharper finding than it was on the Incline, because **this map is named for the mechanic**. Its own briefing makes "Run boilers on the three terraces and watch the pressure ledger" goal number one. I secured it having built **zero boiler houses**, never approached a coal seam, and never generated a unit of pressure. The reason is structural: I dumped the union of every `now` key across all 63 views of the secured run and it is `blastReadyInMs · expiresAtSimMs · gold · hero · needsRider · orders · pendingOffer · pendingSecure · prospector · score · seams · threats · timers · wave · weapon · works` — **no pressure value, no band, no coal count, no boiler fuel**; a regex for `/pressure|coal|boiler/` over every `now` in the run returns false. Meanwhile `stablePrefix.mechanics.rules` publishes the whole subsystem in detail (`pressure_generation` 4/tick off `boiler_house`, `pressure_bands` empty/low/working/high, `pressure_auto_vent` above 80 / loss 35 / cooldown 3 s, `pressure_powers` boiler_lance · pressure_mortar · sky_rocket_battery · auto_pan), and `stablePrefix.map.coalSeams` lists three static positions — (−12,39), (−5,43), (3,39) — which do land on the authored `coal-bed-terrace`, exactly where the briefing's "highest terrace above the boiler beds" says they should. So the fixtures are honest and the machine is genuinely buildable (`boiler_house`, 70 g, max 3, sourced `twist.pressureEnabled`). What is missing is the loop: **no field to read the ledger the goal tells you to watch, and no verb to vent.** The auto-vent spends the resource for you above 80. A headless rider can pay 70 gold to start a process it cannot observe, cannot steer, and cannot spend. What the map *did* ask, in its own right, was a hard opening-economy question with a kind geometric answer. Gold starts at **0**, the first turret costs **50**, and an unattended hero is dead 27 seconds into wave 1 — so the whole contract is "can you turn thirty seconds of quiet into a gun." It can, because the four `buildZones` are stacked terraces and the *lowest* one, `boiler-terrace`, is a 72 × 9 box with the loss stake sitting inside it, while the nearest live seam is 21.6 wu up-slope. The fields that carried the run were `now.seams[].active/x/z` (income, and the seams re-anchor and deplete constantly), `now.gold` against the ladder prices, `now.works.byKind` (the ladder's state), `now.hero.hp/maxHp/level`, `now.threats.alive`, and `now.pendingOffer`/`now.pendingSecure`. The orders that carried it were `HARVEST` (stacked ~26 deep per array), a **price-ordered ladder of gated `BUILD`s emitted as one non-decreasing prefix**, `REPAIR_UNDER 60`, and `PICK_UPGRADE`. Not one E2 verb, because there are none. One thing this map does that the others did not: `threats.alive` **never saturated**. Dry Gulch and the Incline both plateau at 60; here it peaked at 46 and was still climbing at the secure boundary (46 live at wave 11, 421 spawned total). This map is a real ramp, not a plateau — the wave-12 line is what makes it survivable, not an enemy ceiling.
- Lessons (rider, verbatim):
  - **A door contract can be named for a mechanic it cannot serve.** The Incline merely *had* a pressure line; the Pressure Garden **is** the pressure line by name, by briefing ("watch the pressure ledger" is its first stated goal), and by buildable — and `now` still publishes no pressure field, no band, no coal count, and the grammar still has no vent verb. Gen-5: an advertised affordance is not an available one. Gen-8: an affordance without a feedback field is not a mechanic. Gen-9: **a contract's own stated goal is not evidence that the goal is reachable through the door.** Dump the union of `now` keys across a whole run — one command — and you have the definitive list of what you are allowed to reason about.
  - **Emit the whole ladder in one array, gated by price, truncated at the first price decrease.** This is the upgrade to gen-7's "one BUILD per array." Views only arrive at wave boundaries, so one build per view caps you at ~12 buildings on a 12-wave map; but gold gates are evaluated *every tick*, so a suffix of the ladder ordered `[turret 50, 70, 95, 125]` self-sequences inside a single wave — each build spends the gold, the next rung waits for its own price, and no cheap rung can steal because the array stops the moment prices stop rising. Ten buildings landed across a run that only offered a handful of wave boundaries. **Cut the emitted list at the first price decrease; that one rule is the entire anti-starvation fix.**
  - **A wave-1 idle death is still not a hard map.** Idle died at wave 1 here — the worst curve I have seen, worse than Twin Banks' wave 3 — and the first controller secured at full health with nine of ten works standing. That is now three maps running where the idle curve badly overstated the difficulty. It measures how fast a *stationary, orderless* hero dies. Use it to learn the enemy mix and the clock, never to set your ambition.
  - **Find the pocket, and check whether the stake is inside the build zone.** The Incline's pocket was an overlap of stake × zone × seam; here it is better — the loss stake sits *inside* `boiler-terrace`, so a ring of four turrets at (−12,9), (−17,13), (−7,13), (−12,16) needed no compromise at all. Compute `stakeMarkers × buildZones × harvestAnchors` from the manifest before writing an order. Ten builds, zero `out_of_zone`, zero `out_of_reach`.
  - **Stacked `HARVEST` on one seam wastes its tail when seams deplete.** I logged 682 `order_failure` surprises, nearly all `INVALID_TARGET: gold-seam-N is unavailable` — my 26 harvest slots kept naming a seam that had emptied under the Prospector. It cost me gold (770 panned, ending on 52) but it *bought* the decision points: 63 views for 12 waves instead of ~13, which is how the ladder finished. Gen-2's "an order that fails honestly buys a decision point" is still true, and it is now also a tuning target: **chain two or three different seam ids down the array instead of repeating one**, and you get both the throughput and the decision points.
  - **`pendingSecure` accepts exactly one order and refuses anything else.** `StandingOrders.ts:178` rejects the whole array unless it is a single `SECURE_CHOICE`. Branch on `now.pendingSecure` at the very top of the controller, before you build any other order — a stray `PICK_UPGRADE` or `HARVEST` alongside it refuses the submission and burns the choice clock.
  - **Records that go `done` or `failed` are skipped forever until the next array.** That is why `BLAST_AT` is one-shot per submission rather than a tick-eating anchor, and why a stacked `HARVEST` chain works at all. The array is not a policy that re-evaluates — it is a *worklist that drains*. Size it for the whole wave.
  - **Fourth contract running, the second run went to the receipt, not to greed.** Same controller, same bytes: `fnv1a32:6ea84b1b` twice, identical `inputLog`, tapes differing only in their random `id`. With `timeAlive` pinned at 360.000 s by a wave-12 secure and gold ranking below it, there was nothing left to win by gambling and a replay-proof reel to gain.

## generation 10 — 2026-09-03T20:43:26.649Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04 · contracts: e2-trestle
cost: wallClock 859s · setupToFirstOutput 105s · tokens in 238 / out 118850 (+cache read 18512638) over 119 turns, 76 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): NOT SECURED — w13 / 571.733s / 11g / calls 106 · runs 6 · scored attempts 1 · worldModel sim-import. Door: not secured, nothing put forward. 6 runs, 1 scored. THE SECURE IS THE RAILCAR: HeadlessContractSim.ts:1095 autoSecureWaveForRun returns MAX_SAFE_INTEGER while (twist.baron && !baronBeaten), so surviving twist.secureWave 12 never opens pendingSecure; the run secures only via bossKillSecuresRun (HeadlessContractSim.ts:251) when all three railcar components die.
- Winnability (rider, verbatim): **Undecided, and the wall is a boss-damage wall in the map, not the grammar or the economy:** survival is solved — my scored ride entered wave 11 at 175/175 with the full ladder standing and still rode to wave 13 — and gold is in surplus (pinned at the 200 cap for three waves in v1), but the secure requires killing a 3-component `hpScale: 12.5` railcar that rides a fixed line at x = 0 and is only inside a 16 wu turret's range for a dozen-odd seconds, and four capped turrets plus six capped beacons did not finish it before the wave-13 swarm finished me; whether a fort built *for the rail* rather than *for the stake* closes that gap is the one honest open question I ran out of wall clock to answer.
- What the map asked (rider, verbatim): It asked me about **the railcar**, and — for the first time in four E2 contracts — the era's named mechanic was at least *adjacent* to the answer, though I never got to use it. This is not stationary survival wearing the era's name: it is a boss contract whose secure is a kill, and the geometry of that kill is the whole problem. The railcar declares `pursuitRange: 0` and `railRouteIndex: 0`, so it rides a fixed line at x = 0 and never deviates; a turret's 16 wu range therefore converts directly into seconds of fire, and moving four turrets from the stake pocket (x 8–16) onto the rail shoulder (x ≈ ±4) is the difference between one turret engaging and four. That is a real, legible, spatial question and the map asked it honestly. The fields that carried it were `stablePrefix.map` (the claim at (12,−12), four `seams` anchors, three `coalSeams`), `now.works.byKind`/`now.works.entries` (the ladder's state and, critically, *where each work actually landed*), `now.seams[].active/x/z`, `now.gold`, `now.hero.hp/maxHp/level`, `now.threats.alive` (which never saturates here — 63 live at wave 12 and still climbing) and `now.pendingOffer`. The orders were `HARVEST`, gated `BUILD`, `REPAIR_UNDER` and `PICK_UPGRADE`. On **vent-or-boom specifically: it is published and still unplayable through the door.** `stablePrefix.mechanics.rules` declares the full subsystem — `pressure_generation` (boiler_house, coal, 4/tick), `pressure_bands`, `pressure_auto_vent` (above 80, loss 35, cooldown 3 s) and `pressure_powers` (boiler_lance, pressure_mortar, sky_rocket_battery, auto_pan) — and this map even owns its coal, three seams ~29 wu from the stake, exactly as the door document says. But the union of `now` keys across every view of my rides is `wave · blastReadyInMs · weapon · timers · gold · hero · prospector · works · threats · orders · needsRider · seams · score` (+ `pendingOffer`/`expiresAtSimMs`): **no pressure value, no band, no coal count, no boiler fuel**, and the grammar still has no vent verb. This is the third E2 door contract in a row where I can pay 70 gold to start a process I cannot observe, cannot steer and cannot spend. On a map whose secure *is* a boss kill, an unobservable damage source is not a mechanic a rider can reason about — it is a lottery ticket.
- Lessons (rider, verbatim):
  - **A boss contract's secure is the KILL, not the clock — correct generation 8.** I wrote in gen 8
    that "`RunManager.maybeSecureRun` gates on `wave >= secureWave` alone, with no defeat condition."
    That is true of `maybeSecureRun` and false of the system: `HeadlessContractSim:1095`
    `autoSecureWaveForRun` returns `Number.MAX_SAFE_INTEGER` while `twist.baron && !baronBeaten`, and
    it is the *host's* `secureWave()` that `maybeSecureRun` reads. I secured `e2-incline` at wave 14
    and told myself the railcar was theatre; in fact my turrets had killed it and I never noticed.
    **Read the value the gate reads, not just the gate.** One indirection was worth a whole heat.
  - **`twist.baron.railRouteIndex` + `pursuitRange: 0` turn a boss into a geometry problem.** The
    railcar rides `tileParams.rails[railRouteIndex]` and never leaves it. Distance from each turret
    to that polyline, not to the stake, is what buys damage: `sqrt(range² − offset²) × 2 / railSpeed`
    is the seconds of fire you have bought. Compute it before placing anything on a boss map.
  - **Never gate a build phase on an exact count of an exact slot.** v2 asked for turret #4 at
    (9,−13), the placement silently refused, `nT` sat at 3 forever, and the run fought the entire
    contract with no beacons and no palisades while gold piled up. Gate on **count OR wave**, carry
    **more candidate positions than you need**, and derive occupancy from `now.works.entries`
    positions rather than from your own index. A ladder that cannot skip a bad rung is a ladder that
    can lose a run to one coordinate.
  - **Read `now.works.entries`, not `now.works.byKind`, when you care about placement.** `byKind`
    told me "turret: 3" and nothing about which of my four slots was empty. `entries` carries
    `position`, `tier`, `hp` and `wrecked`, and it is the only way to see that a build order has been
    quietly refusing for eleven waves.
  - **The door document's difficulty notes are measurements of somebody's policy, and they can be
    about the wrong thing.** `skill.md` says the trestle "reaches wave 10–13 against an `hpScale: 30`
    railcar"; the manifest says `hpScale: 12.5`, and my very first controller reached wave 12 on its
    first ride. The number that matters was never the wave depth — it was that nobody had killed the
    boss. Gen-8's lesson stands and sharpens: a published refusal is a strong prior about difficulty
    and a zero-strength claim about impossibility, **and it may also be measuring the wrong axis.**
  - **When an idle probe dies at wave 1, that still tells you nothing.** Fourth map running. Idle
    died at 65.5 s here and the same seed carried a hand-written controller to 568 s.
  - **Third E2 contract, same structural finding: pressure is published and unreadable.** Drill Yard
    (gen 5): advertised affordance, no verb. Incline (gen 8): affordance without a feedback field.
    Pressure Garden (gen 9): a contract named for a goal it cannot serve. Trestle (gen 10): a map
    that *owns its coal* and still publishes no pressure field in `now`. The pattern is now strong
    enough to state as a rule: **dump the union of `now` keys before planning around any subsystem;
    the mechanics manifest describes the browser's game, not the door's.**
  - **Survival and the objective are different problems; solve the objective's problem.** v3 fixed
    survival completely — full ladder, hero untouched at 175/175 into wave 11 — and moved the result
    by three seconds, because the thing that ends the run is a boss I was not built to kill. When the
    secure is a kill, *every* gold decision should be priced in damage-to-the-boss, not in
    time-alive: the 330 gold I spent on six beacons (≈30 dps each, 8 wu range, never on the rail)
    buys about 12 seconds of railcar; two turret tier-2 upgrades at 150 g buy more, and I never
    issued a single `CONTEXT_ACTION upgrade`.
  - **Budget the source read against the wall.** I spent the first third of a 25-minute wall reading,
    which found the clause that decides the contract — that was the right trade — but it left one
    tuning run for a two-variable problem (survive *and* kill). On a boss map, find the secure
    condition first, then spend everything left on the fight, not on the economy.

## generation 11 — 2026-09-03T21:01:19.732Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04 · contracts: e3-blackout-ridge
cost: wallClock 663s · setupToFirstOutput 165s · tokens in 174 / out 109097 (+cache read 11692984) over 87 turns, 48 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w12 / 360.000s / 90g / calls 85 · runs 3 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:6a4b0ac8, ranked, POST rank 1 — FIRST SECURE for e3-blackout-ridge. The thinnest margin of the eleven generations: hero at 4/100 HP from wave 10, 9 of 15 works wrecked. First ride of the heat where the era's named mechanic proved genuinely readable, buildable and load-bearing.
- Winnability (rider, verbatim): Secured, and the margin was **thin — the thinnest of my eleven generations**: the hero fell to **4/100 HP by wave 10** and held there for the last three waves with `threats.alive` pinned at its 60-enemy ceiling and 9 of 15 works wrecked, so the contract is winnable from its starting kit but this particular line survives on a few hit points, not on comfort.
- What the map asked (rider, verbatim): It asked me a real graph question, and — for the first time in my E3/E2 rides — **the era's named mechanic is genuinely readable, buildable and load-bearing, though its payoff is smaller than the briefing implies.** This is not stationary survival wearing the era's name. The grid is a literal directed chain: `off-map-current` (36 W) → `trunk-west` → `trunk-middle` → `trunk-ridge` → `capacitor-west` → {`capacitor-east`, `lamp-yard`}, and `capacitor-east` → `lamp-ridge`. What makes it reasoning rather than decoration is `HeadlessContractSim.syncContractPowerGrid:1991`: relay and storage nodes boot `online: false` and come online **only** while a standing, unwrecked building sits within 2.5wu of their site — `sentry_beacon` for the three trunk pylons, `capacitor_bank` for the two banks. The adjacency is then rebuilt from online nodes only (`PowerGraph:488`), so a wrecked frame does not dim one lamp, it **severs everything downstream of it**. And the capacitor sites ship *empty*, which means both lamps are dark from t=0 before a single enemy spawns — the map opens already broken, and noticing that is the puzzle. Powering it matters because `syncLightState:2128` gates each `lantern_post`'s light on `powerConsumerAt(...,'lamp')`, and `nightSpeedMultiplier:2187` gives every **wrecker** outside light a `nightSpeedOutsideLight` bonus under a locked night (`nightLocked: true`, `nightDepth 0.86`). So: intact graph → lit lamps → slower saboteurs. That is a clean, legible, four-hop causal chain, and it is exactly the "defending a network" the ladder promises. The honest qualifier is the *size* of the prize. `nightSpeedOutsideLight` is **1.18** and `lanternPostLightRadius` is **7** — completing the entire grid buys an 18% wrecker slowdown inside two 7wu discs, for 150 gold of capacitor on a board where my first beacon already costs 55. I therefore ranked the grid **below** the beacon ring on purpose, gating both capacitors at `goldGte: 150` so they could never steal a tick from a beacon. Both did land (wave 10 and wave 11), so the reel does complete the chain — but they arrived as surplus spending, not as the thing that won. The other half of the graph question I answered by *declining* it: the three trunk frames sit ~80wu from the stake beside the west spawn gate, and the correct play was to let them be eaten as a distant decoy that pulls wreckers away from the ridge, rather than to commute out and mend them. Nine of my fifteen works were wrecked and I mended none. The view fields that carried the run were `now.works.entries` (positions and `wrecked`, the only way to see which ladder slots were filled), `now.works.byKind`, `now.seams[].active/x/z`, `now.gold`, `now.hero.hp`, `now.threats.alive` (which saturates hard at **60** from wave 7 — the plateau that makes the map survivable at all), and `now.pendingOffer`/`now.pendingSecure`. The orders were `BUILD`, `HARVEST`, `PICK_UPGRADE` and one `SECURE_CHOICE`. One gap worth reporting: **the grid's state is not published in `now`.** There is no node state, no wire state, no lit/dark field — I could reason about the graph only because I read the engine. A rider working from the view alone can build the capacitors because the briefing says to, but cannot observe that it worked.
- Lessons (rider, verbatim):
  - **`winnability-receipts.json` is now four-for-four.** `unclaimed` with no `reason` = green light;
    `unclaimed` + `standings-disabled` = wall. Still the cheapest information in the county, still the
    first thing to read.
  - **Check the buildable roster against the twist before planning defence.** `MechanicsManifest`
    filters `turret` out whenever `twist.powerGrid` exists (`:694`) and `lantern_post` too (`:689`).
    My "turrets first, every time" rule from generation 7 is **contract-conditional**, not universal —
    and the filter is a single `.filter()` line I would never have found by reading the manifest JSON,
    because the roster is computed, not declared. Grep the roster *builder*, the same way generation 8
    taught me to grep the view builder.
  - **Pre-placed buildings move you up the price curve.** `costFor = costCurve(countFor(id))` counts
    what is already standing, so three pre-placed trunk beacons made my first beacon cost 55 instead
    of 25 — a 120% opening-economy error if I had trusted the `costs[0]` in the view. Read
    `prePlacedBuildables` and index the cost array past it.
  - **`REPAIR_UNDER` picks the FIRST building in placement order, not the nearest or the worst**
    (`StandingOrders.ts:301`, `state.buildings.find`). On any map with pre-placed works far from your
    pocket, that single verb is a one-way ticket off your own claim. Check where index 0 lives before
    shipping a repair order — and be willing to ship none, even when the contract's own briefing tells
    you to repair.
  - **Cheap chaff beats expensive damage when the expensive rung is priced out of the opening.** With
    no turrets and a 55g first beacon, five 10g palisades were up before wave 2 and did the early
    work — palisades are `RouteBlocker`s, so they redirect pathing as well as absorb hits. On a starved
    opening, ask what the cheapest *structural* order is, not what the strongest one is.
  - **A distant pre-placed asset can be worth more abandoned than defended.** The three trunk frames
    are the contract's stated objective surface and I deliberately let all three be eaten, because at
    80wu they are a decoy that pulls wreckers off my ridge. Declining an objective the secure gate does
    not actually check is a legitimate move — but verify the gate first: here `powerGrid.connect` is
    absent, so `objectiveAllowsSecure` (`HeadlessContractSim:1737`) never binds, and the secure is
    wave 12 alone.
  - **A named mechanic can be real and still be a bad buy.** Unlike E2's pressure — published with no
    field and no verb — E3's grid is fully playable: I completed the chain and both banks stood at the
    secure. But `nightSpeedOutsideLight: 1.18` over `radius 7` for 150 gold is worth less than one
    beacon. Price the era's lever in the same currency as everything else instead of assuming the
    contract's name marks the win condition.
  - **Correct my own margin habit: securing at 4 HP is not a comfortable win.** Generations 6-9 all
    finished at or near full health and I let that set my expectations. Here I never issued a repair
    and never took plating (I picked `pendingOffer[0]` blindly and finished level 5 with maxHp still
    100, versus level 11 and 175 maxHp on the Dry Gulch). **Picking offer[0] is not a policy, it is a
    default** — the one place this ride left real margin on the table.
  - **A tune that secures is the attempt; the re-ride is the receipt.** Fifth contract running:
    `fnv1a32:9a689959` twice, 85 entries both times. In an era that replays every reel, proving
    determinism beats chasing a richer number — especially at a fixed wave-12 secure, where
    `timeAlive` is already pinned at 360.000 s and gold ranks below it.

## generation 12 — 2026-09-03T21:28:38.358Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04 · contracts: e3-canyon-works
cost: wallClock 591s · setupToFirstOutput 75s · tokens in 96 / out 101593 (+cache read 6615064) over 48 turns, 27 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): NOT SECURED — w3 / 102.433s / 45g / calls 7 · runs 3 · scored attempts 0 · worldModel sim-import. Door: not secured, nothing put forward (0 scored attempts — it stopped when the arithmetic became certain rather than spend the wall on a fourth doomed ride). All three runs died at hero HP 0 in wave 3, t=98-102s: idle, grid-first and palisades-first alike.
- Winnability (rider, verbatim): **Undecided-leaning-no through the door, and the wall is the map's economy against its own deadline, not the grammar and not my budget:** the connect latch demands 330 gold of beacons strung across six sites spanning 80wu of gorge while `wave <= 6` (t < 210s), but the map's only income is four gold seams at z≈30-34 — **~78wu north of the loss stake, across the river** — of which only two are ever live, each capped at `capacity 30` on a `respawnSeconds 20` cycle (`Balance.goldSeam`), giving a hard ceiling near 3.0 g/s that no policy can exceed; 330 gold is therefore ≥110s of pure panning before a single step of the ~100s pylon tour or the 21s opening commute, which overruns t=210 even with a perfect Prospector, and I measured only **0.44-0.69 g/s** actual because every build order drags the one order-actor off the seams and back down the canyon. Underneath that sits a second, earlier wall I never got past: the hero is a fixed gun welded to the stake at (0,-44) while its only worker is 78wu away, and it died at wave 3 (t≈100s) in **all three** runs — idle, grid-first, and palisades-first alike — so on this seed the run ends four waves before the connect deadline it cannot afford anyway. Two honest caveats on that verdict, because I did not get to test them: (a) I spent my wall on the grid and never tried a pure fortress line — every gold into palisades and upgrades around the stake, conceding the connect latch — which would answer whether wave 12 survival is reachable at all, and (b) my BUILD gating misfired once (run 2 placed a beacon at 25 gold against a `goldGte: 160` suffix gate), so one of my two controller runs was not testing the policy I wrote. Neither caveat touches the 330g/210s arithmetic, which is manifest-level and does not depend on my controller.
- What the map asked (rider, verbatim): It asked a real graph question and I could read every part of it — this is **not** stationary survival wearing the era's name, and unlike E2's pressure the mechanic is fully published in the view. `now.canyonConnect: {powered, required: 2, byWave: 6, complete, failed}` is a live field, and `stablePrefix.mechanics.rules` names its own source (`connect_objective` / `Game.syncCanyonConnectObjective`) including `completionLatch: "one-way-at-or-before-deadline"` and `missedDeadline: "run-unsecurable"`. The map is a genuine directed network under sabotage: two disjoint three-hop chains from one 26W producer, `fevered_saboteur` wreckers (`waveMin: 4`, `buildingDamageScale: 1.25`) spawning from gates at (±46,38) — i.e. **on top of the seams and the rim pylons** — and a watt ledger that sheds by priority (galleries 10, tram 15, turrets 20, lamps 30) against 28W of demand on 26W of supply, so the two lamps shed and the galleries stay `powered`. The crawler-drain nodes (18W each, priority 0) boot **offline** (`HeadlessContractSim:2479`, `online: node.role !== 'crawler-drain'`), which is the only reason the ledger balances at all. The fields that carried it were `now.canyonConnect`, `now.works.entries` (position + `wrecked`, the only way to see which pylon sites are actually covered), `now.seams[].active/x/z`, `now.gold`, `now.hero.hp`, and `now.threats.alive`. The orders were `BUILD` (suffix-sum gated), `HARVEST` and `PICK_UPGRADE`. The mechanic is load-bearing exactly as the county's audit note says — it is the *only* thing standing between this contract and an ordinary survival map. It is also, on this seed, priced past what the map's own economy can pay.
- Lessons (rider, verbatim):
  - **`unclaimed` with no `reason` is a green light about the *standings*, not about the map.** Six
    contracts running I have read that field as "go" and been right; here it was still correct — the
    contract is not `standings-disabled` — but it told me nothing about whether the map can be paid
    for. The receipt encodes an *authoring* wall (`secureWave: 0`, `training_ground`), never an
    *economic* one. Add a second pre-ride check next to it: **price the objective in gold and divide by
    the map's seam throughput before writing an order.** Two minutes of arithmetic
    (`maxCount × costs` vs `capacity/respawnSeconds × liveSeams × deadline`) would have told me at
    minute six what three rides told me at minute nineteen.
  - **Count the order-actor's feet as a budget, not a detail.** The Canyon Works is the first map I
    have ridden where income and defence are at opposite ends of the board (78wu, across a river) and
    the objective is strung *between* them. One body cannot pan, build a six-site network, and defend a
    stake; every BUILD order is a round trip that costs ~15-40s of panning. On any map, measure
    `distance(stake, nearest live seam)` first — the Incline's 6.3wu pocket and this map's 78wu commute
    are the same field with opposite verdicts.
  - **A conjunctive secure gate is the contract.** Here it is *three* clauses ANDed —
    `baronBeaten && canyonConnectCompletedByDeadline && wave >= 12`. Generation 8 read the wave clause
    and missed the baron; generation 10 corrected that; generation 12 adds: read the *whole* boolean at
    `autoSecureWaveForRun` and enumerate every clause before planning, because a one-way latch
    (`missedDeadline: "run-unsecurable"`) means one missed clause at wave 6 makes waves 7-20 worthless.
  - **E3's mechanic is real, readable, and this time unaffordable.** Blackout Ridge (gen 11) published
    no grid state in `now` and I had to read the engine; the Canyon Works publishes
    `now.canyonConnect` outright, which is a genuine improvement in the door's legibility. So the E3
    finding is no longer "the mechanic is invisible" but "the mechanic is priced past the map's
    income." Those are different findings and deserve different fixes.
  - **Verify a gate fires before trusting the ladder.** My suffix-sum batching — where rung *i* is
    gated on the sum of costs from *i* to the end of the batch, so a batch only opens when the whole
    trip is funded — is the right generalisation of gen-9's "truncate at the first price decrease," but
    I shipped it without a single-view check and one run built a beacon at 25 gold against a
    `goldGte: 160` gate. Log the emitted array and the resulting `works.entries` on the *first* view of
    a tune, not after three runs.
  - **When the wall is arithmetic, stop riding.** Generation 5 declined a second scored attempt because
    it could name the line of code that would refuse it; here I declined a fourth run because I could
    name the inequality. Both times the right output was the finding, written carefully, rather than
    another tape. Knowing when not to ride is still worth as much as a good policy.
  - **Write the outcome file before the analysis, every time.** I wrote `gauntlet-outcome.json` at
    minute 18 with two runs banked, then rewrote it. The wall arrived with the report unfinished twice
    in twelve generations; the file that exists is the row that survives.

## generation 13 — 2026-09-03T21:49:32.334Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04 · contracts: e3-fairground
cost: wallClock 927s · setupToFirstOutput 135s · tokens in 170 / out 130478 (+cache read 14026649) over 85 turns, 54 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): NOT SECURED — w3 / 108.433s / 18g / calls 111 · runs 5 · scored attempts 2 · worldModel sim-import. Door: not secured, nothing put forward. Both scored attempts spent; all five runs died in wave 3 (t=101-111s) against a wave-12 secure. Key measurement: the Fair Wheel's dynamo stopped permanently at or before t=22.13s in four of five runs; the exception was tune-1, whose compact radius-8 palisade ring kept the wheel pristine until t=77.2 — so the wheel IS protectable, and the geometry that does it is the ring, not seam-side bait.
- Winnability (rider, verbatim): **Undecided — not proven unwinnable, and the wall I hit is the opening GEOMETRY of the wheel's armour, not the grammar, not the economy and not the map:** the whole opening is one unattended array (view 0 lands at t = 0.0, view 1 not until **t = 22.13 s**), gold starts at 0, the nearest live seam is 21.3u out and panning measures ~1 g/s, so the first 10-gold palisade lands somewhere between t≈14 and t≈20 — and what decides the run is *where* it lands, because a compact ring around the stake held the dynamo pristine for **seventy seconds** (`tune-1`: wheel 240/240 at t=70, first hit t=77.2, seven seconds after its last palisade was wrecked) while the same palisade placed out at the seam and standing by t≈14 did not stop the dynamo being scratched by t = 22.13 (`attempt-2`); a wrecker seeks the *nearest* building, so bait 20u east of the stake is simply not on the west and north crews' line and the wheel is. I had the two halves of the answer in different runs — `tune-1`'s ring geometry and v2/v3's economy discipline (one trip-order per view instead of fourteen racing gold gates, which tripled income to 51 g) — and ran out of wall clock before riding them together: that is a failure of my own budgeting, not a finding about the contract. Behind it sits a second wall I never reached and therefore cannot price: every ride died in wave 3 at t≈101–111 s against a wave-12 (360 s) secure, with no turret on the roster and 60-hp palisades that a 1.2× wrecker chews through in six seconds. The escort half I never tested at all — one flock completed an unaided crossing in two separate runs, so 3-of-3 is at least not obviously dead. **My honest verdict: probably winnable, consistent with the door document's claim that a radius-eight ring plus mend-under-60% secures both bench seeds; I did not find the line in five runs.**
- What the map asked (rider, verbatim): It asked a real E3 network question, and the era's signature mechanic is genuinely load-bearing — this is **not** stationary survival wearing the era's name. The grid here is small but it is the whole contract: one producer (`ferris-wheel`, 24 W) feeding two lamp consumers over two spans, and the producer is a **damageable building registered in the targeting system**, so the graph's root is something the enemy can attack. That single fact reshapes every decision, because wreckers seek the *nearest* building (`Enemy.updateWrecker():1055` → `TargetingSystem.nearestBuilding()`), which makes a rider's own walls the dynamo's armour: from a west spawn at `(-26,-30)`, a palisade at `(-8,-30)` is 18u away against the wheel's 46u, so **anything you build near the stake diverts the crews away from the graph's root**, and the instant the last of them is wrecked the crews retarget the wheel. I watched that happen with a stopwatch in `tune-1`: wheel at a pristine 240 through t=70 while three palisades stood, first hit at t=77.2 within seven seconds of the last one being wrecked, 0 hp by t=88. That is the graph reasoning the audit note promised, and it is legible from the view alone — `now.fairground` publishes `wheel.hp/spinning/outputWatts`, every flock's `phase/crossings/frights`, and an explicit `objective: {allCrossed, wheelSpinning, securableAtWave}`. Compare generation 9's Pressure Garden, where E2's named mechanic had **no** field in `now` at all: E3's legibility is a real improvement and the county should keep it. The second half of the ask is the escort, and it is equally real: the three crowds walk a 38–40u round trip through the battlefield every 24-second night, and the middle crowd's home is the loss stake itself, so it is frightened by the same scrum the hero is shooting. The fields that carried the run were `now.fairground.*`, `now.works.entries` (position + `wrecked`, the only way to see which ring slots are live), `now.seams[].active/x/z`, `now.gold`, `now.hero.hp` and `now.threats.alive`; the orders were `BUILD`, `REPAIR_UNDER`, `HARVEST` and `PICK_UPGRADE`.
- Lessons (rider, verbatim):
  - **Find out WHEN the second view arrives before designing any opening.** On this map view 0 is at t = 0.0 and view 1 at **t = 22.1** — the first 22 seconds are a single unattended array, and the contract's one irreversible event happens inside that window. I burned two controllers writing adaptive logic for a period in which I had no ability to adapt. Add it to the pre-ride checklist next to the winnability receipt: from the idle probe's view log, read the *timestamps*, not just the numbers.
  - **An irreversible state bit outranks every other objective, and you cost it out first.** `FerrisWheel.damage()` sets `spinning=false` on any hit at all, so the wheel is a one-bit resource with a hard deadline. The right first question was not "what is my build ladder" but "what is the earliest tick at which I can place any building, and is that before the first wrecker arrives?" — one division (10 gold ÷ ~1 g/s + 21u of travel) that I only did after three rides.
  - **Your own walls are somebody else's armour.** `nearestBuilding()` means a rider's palisade near the stake is what keeps wrecking crews off a map objective 38u away, and the objective becomes the target within seconds of the last wall dying. On any map with a damageable objective, "how many buildings are standing" is not a defence stat, it is the objective's hit-point bar.
  - **`REPAIR_UNDER` revives wrecked works at 25% of cost** (`Balance.repair.pctOfCost`), i.e. 2.5 gold to bring a dead 10-gold palisade back to full. On a starved economy mending is four times cheaper than rebuilding — and it is the only way to re-arm a ring slot at all, because the wrecked frame still occupies the ground.
  - **A stack of gold-gated BUILD orders is a commute generator, not a build ladder.** v1's fourteen pending builds each seized the tick the moment gold crossed 10, so the Prospector spent 100 seconds walking and banked 50 gold. Generation 9's "emit the whole ladder in one array" was learned on a map with a 6.3u pocket; here the seams are 17–24u from the build ground and the same trick inverts. **Gate the ladder on the commute, not just the price:** one trip-order per view, and only when the surplus is worth the walk.
  - **Check the buildable roster against the twist — again.** Second E3 contract running with **no turret and no lantern_post** (`MechanicsManifest` filters both wherever `twist.powerGrid` exists). Generation 11 learned this; I still opened by reasoning about damage-per-gold as if a turret existed. When a contract declares a power grid, assume the roster is beacons and chaff until the view says otherwise.
  - **Do not let a good hypothesis eat your last run.** "The palisade lands too late" explained four rides, so I spent scored attempt 2 shaving six seconds off it — and the dynamo stopped anyway, because the real variable was *where* the bait stood, which `tune-1` had already shown me at t=77 and I had stopped looking at. When two runs disagree, diff their geometry before optimising either one's clock.
  - **When the door document names a prover, reproduce its GEOMETRY first and its tempo second.** `skill.md` says a rider that "pans the nearest seam, front-loads a ring at radius eight and mends under 60%" secures both bench seeds. Every ride where I actually had a radius-eight ring kept the wheel turning; every ride where I improvised the bait somewhere else lost it inside 22 seconds. The recipe was load-bearing and I read it as flavour text.
  - **Two scored attempts is a budget, and spending both on one hypothesis is how you finish undecided.** Generation 5 declined a second attempt because it could name the line of code that would refuse it; generation 12 declined a fourth run because it could name the inequality. Here I could name *neither* — so the correct spend was one attempt per competing explanation (ring geometry vs. opening tempo), not two on the same one.
  - **Write the report before the wall, not at it.** Fourth generation running I finished the analysis with minutes to spare and the file that survives is the one already on disk. Generation 12 said it; this ride proved it again — the intermediate outcome file was correct after every single run, and the report was the thing at risk.

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

## generation 15 — 2026-09-03T22:24:21.190Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 49c34f8bba3d61e003d1f421398e3835e3107945f396800fa124f946b2e4b2f9 · contracts: e4-boneyard
cost: wallClock 521s · setupToFirstOutput 60s · tokens in 104 / out 94058 (+cache read 7502583) over 52 turns, 32 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w12 / 360.000s / 200g / calls 41 · runs 4 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:a5beb198, ranked, POST rank 1 — FIRST SECURE for e4-boneyard, and the first E4 reel of the heat. Ridden from ARENA B (build b118c4d2, engineHash 49c34f8b, viewVersion 2) because main had just merged the Motor Frontier slice; the tow finished at t=42.767s with 13.2 of 36 fuel unspent.
- Winnability (rider, verbatim): Secured, and the margin was **wide on the errand and thin on the fort**: the tow finished at t = 42.767 s with 13.2 of 36 fuel unspent and never came close to running dry, while the hero bottomed at 39.6/150 in wave 6, held at 55/175 from wave 6 to the end with `threats.alive` pinned at its 60-enemy ceiling, and the whole run was carried by three turrets and eight palisades bought out of a 50-wu commute — one more bad build trip and it would not have stood.
- What the map asked (rider, verbatim): It asked me about **distance, fuel and road — the E4 signature mechanic, live and load-bearing — and the county's RESKIN measurement of this contract is out of date.** The secure is a conjunction: `wave >= 12` **and** `now.motor.objective.arrived`, and the errand is a two-leg tow that is pure spatial planning. Leg one: the Hauler starts at (0, −40) and must come to rest within `objective.stopReach` 2.5 of the hulk `spent-boiler-west` at (−18, −8) — 36.7 wu of open country at `speed 9` and `burnPerSecond 3`, so 12.2 fuel. Leg two: from the hulk to `objective.stop`, which *moves* the moment `hitched` flips, to the gate end of `gate-to-west-rows` at (−8, −38) — another 31.6 wu, 10.5 fuel. Against that, the whole run holds 36 fuel: three tar nodes at (−12, −8), (0, −8), (12, −8), three tar each, four fuel per tar, a 24-unit tank. The margin is 22.8 needed against 36 available, and `weather` eats into it *by the second* — `stormMovementMultiplier: 0.75` means the same distance costs 33% more fuel under a storm, which is exactly the "a storm makes distance cost more" the door document promises. I planned to all three nodes rather than the two the arithmetic strictly needs, precisely because a storm on either leg would have stranded a two-node tank. The fields that carried it were `now.motor.objective` (`kind`, `stop`, `stopReach`, `hulk`, `hitched`, `arrived`), `now.motor.fuel` (`nodes[].harvested`, `stored`, `tar`), `now.motor.vehicle` (`state`, `x`, `z`), `now.motor.roads.corridors[].start/graded`, and `now.motor.weather.phase`; the orders that carried it were `MOVE_TO`, `GRADE` and `HAUL`. Two honest qualifiers. First, `GRADE` was nearly free here and nearly worthless: the Hauler drives a straight line, the delivery leg meets the road at ~19° so only 4.409 wu of 68.424 travelled ever rode graded ground — the road is a real lever on this map's *geometry* and this errand routes around it. Second, once the boiler was on the hook at t = 42.767 s the Motor layer went quiet and waves 3–12 were ordinary stationary survival — hard survival, on a starved economy, but not E4. So the fair reading is **half a reskin**: the era's mechanic is genuinely composed, genuinely gates the secure, and genuinely made me do fuel and distance arithmetic before writing an order — for the first 43 seconds of a 360-second contract.
- Lessons (rider, verbatim):
  - **The county's own era-mechanic audit can be stale, and the view settles it in one probe.** The brief
    handed me `e4-boneyard` labelled RESKIN, "no E4 system composed headless." The first idle view published
    a complete `now.motor` with a live `tow` objective, `viewVersion: 2`, and a secure gated on it at
    `HeadlessContractSim.ts:1210`. Gen-8 taught me a published *refusal* is a measurement of somebody's
    policy; gen-15 adds that a published *audit* is a measurement of somebody's build. **Dump `now`'s keys
    before you believe either.** One `--policy idle` run, ten seconds, decided it.
  - **Read the objective's `stop` as a moving target, not a coordinate.** `MotorSocket.stop()` returns the
    hulk while `hitched` is false and the corridor's `start` afterwards, and `settleTow` only latches when
    `vehicle.state === 'arrived'`. So the errand is two dispatches with a state flip between them, and a
    second `HAUL` fired before the first arrival would silently re-target the Hauler and lose the hitch. I
    split the legs across a wave boundary and branched on `objective.hitched` rather than trusting my own
    clock — the cheapest possible insurance against a one-way latch.
  - **`MOVE_TO` alone will not harvest.** `Balance.agent.arriveRadius` is 0.16 and `e4Fuel.harvestRange`
    is 1.35 with `harvestSeconds: 0.5`, but a completed `MOVE_TO` returns `{}` — truthy, so it owns the
    tick — and the next order walks you off at 4.8 wu/s. Approach plus one tick is ~0.31 s and the node
    never harvests. **A five-order dwell pattern (node → +1 → node → +1z → node) buys ~0.7 s in range and
    all three nodes landed first try.** Any "stand here for N seconds" mechanic needs an explicit dwell;
    the grammar has no wait verb.
  - **Rotating a `HARVEST` chain by distance is a commute generator.** Gen-9 told me to chain *different*
    seam ids for decision points; on a map whose seams sit 50 wu out that advice inverts and costs the
    run. Tune 1 banked one pan (5 gold) per 30-second wave and died at wave 5. Six orders on the SAME id
    empties a 30-capacity seam before the walk is paid for twice, and it was worth 4x — 200 gold pinned at
    the cap by wave 10 instead of 50 gold at wave 5. **The right rule is: chain by seam when the seams are
    near, stack by seam when they are far. Measure `distance(stake, nearest live seam)` first.**
  - **Suffix-sum gating is what makes a far economy buildable.** A build order gated at its own price fires
    the instant gold crosses it and drags the Prospector 50 wu home for one turret. Gating rung *i* on the
    sum of costs from *i* to the end of the batch means one trip buys the whole batch and spends straight
    down it. Gen-12 derived this and never got to prove it because that map's arithmetic was already lost;
    here it is the difference between wave 5 and wave 12.
  - **Do the era's errand while the board is empty.** The tow crosses the whole map to z = −8, which is
    where the west and east spawn lanes meet. Finishing it inside waves 0–1, before `threats.alive` passed
    14, cost nothing; the same trip at wave 6 against 50 rustlers would have been a different contract.
    When a secure is a conjunction of an errand and a clock, **spend the quiet on the errand and the noise
    on the fort.**
  - **`unclaimed` with no `reason` is seven-for-seven.** Still the first two lines of JSON I read.
  - **A tune that secures is the attempt; the re-ride is the receipt.** Seventh contract running:
    `fnv1a32:c87dfbd3` twice, 41 entries, tapes byte-identical apart from the random `id`. At a fixed
    wave-12 secure `timeAlive` is pinned at 360.000 s and gold ranks below it, so there was nothing to win
    by gambling and a replay-proof reel to gain.
  - **Write the outcome file after every run, before the analysis.** Fourth generation running I said it;
    this ride is the second where I actually did — the file was correct and on disk from the idle probe,
    and every later edit improved a row that already existed.

## generation 16 — 2026-09-03T22:37:08.722Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 49c34f8bba3d61e003d1f421398e3835e3107945f396800fa124f946b2e4b2f9 · contracts: e4-dust-flats
cost: wallClock 558s · setupToFirstOutput 90s · tokens in 114 / out 97880 (+cache read 8500887) over 57 turns, 34 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w14 / 437.967s / 40g / calls 50 · runs 3 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:7f6cd5d3, ranked, POST rank 1 — FIRST SECURE for e4-dust-flats. Arena B. Unlike the Boneyard, GRADE genuinely pays here: staging at the corridor stake and grading camp-to-railhead turns an 82.5 wu open drive (27.5 fuel clear, ~39 under storm, against a 36-fuel run total) into 28.3 wu open plus 60 wu at 2.5x speed and 0.4x burn — about 12.6 fuel, measured 20.677 drawn with 15.3 still in the tank.
- Winnability (rider, verbatim): Secured, and the margin was **wide for thirteen waves and then a hair**: the hero held 95/175 from wave 7 to wave 12 with every work standing, and the Land-Yacht took it from 71 to **7/175 in a single view interval** at wave 14 — 64 hit points from one pass of a `scale 1.5`, `contactDamageScale 1.2` hull — so the kill and the death were about six seconds apart.
- What the map asked (rider, verbatim): It asked me about **distance, fuel, road and storm — E4's signature mechanic, live and load-bearing — and then it asked the same question a second time in the shape of a boss, so the county's RESKIN measurement of this contract is out of date on this build.** The secure is a conjunction the engine states in its own comment: the Land-Yacht's fall cannot secure a railhead the Hauler never reached (`HeadlessContractSim.ts:1886`), and `autoSecureWaveForRun` (`:1181`) keeps wave 12 shut until the boss is down. So the errand is not decoration — it is half the win condition, and it is pure spatial planning: an 82.5 wu open-country drive costs 27.5 fuel clear and about 39 under a storm (`stormMovementMultiplier 0.7`, and `Vehicle` prices fuel **by the second**), against a 36-fuel run total, so the naive single `HAUL` can strand the objective outright. Staging the Hauler at the corridor stake (0,12) and `GRADE`-ing `camp-to-railhead` first turns that into 28.3 wu of open ground plus 60 wu at 2.5× speed and 0.4× burn — about 12.6 fuel, measured at 20.677 drawn with 15.3 still in the tank and the railhead latched at t = 60.5 s. The fields that carried it were `now.motor.objective` (`kind`, `corridorId`, `stop`, `stopReach`, `arrived`, `securableAtWave`), `now.motor.fuel` (`nodes[].harvested/progress`, `stored`, `tar`, `capacity`), `now.motor.roads.corridors[].start/end/graded` with `roads.gradeReach`, `now.motor.vehicle.state/x/z` and `now.motor.weather.phase`; the orders were `MOVE_TO`, `GRADE` and `HAUL`. The second, better surprise is the boss. `mechanics.rules.land_yacht_orbit` publishes centre (0,0), radius 24 and `angularSpeed 0.5236` — the Land-Yacht **rides the ORBIT road**, 12.57 wu/s, one lap every 12 seconds, `ignoresTerrain: true` — so a fort built for the claim cannot touch it and a fort built for the circle can. Turret range 16 against a radius-24 ring makes the placement a closed-form arc problem whose optimum sits at radius ≈ 17.9, not on the ring itself; four turrets at (±13, ±13) cover ~334° of the lap and 0 of my 7 works were ever wrecked. That is genuine "spatial planning at scale" and it is the first E4 board I have ridden where the era's lever shaped **both** the errand and the fight. The honest qualifier is the middle: the haul finished at t = 60.5 s of a 438 s run, and waves 3–13 were ordinary stationary survival on a starved 42 wu commute. Call it two-thirds of an era, bracketed at both ends.
- Lessons (rider, verbatim):
  - **`unclaimed` with no `reason` in `winnability-receipts.json` is eight-for-eight.** Still the first
    two lines of JSON I read, still the cheapest information in the county, still never wrong.
  - **When a contract fields both a Baron and an era socket, read the AND, not the clauses.** Generation
    8 read a wave gate and missed a boss; generation 10 corrected that; generation 12 said "enumerate
    every clause." Here `HeadlessContractSim.ts:1886` ANDs the motor errand into `postBaronDefeat` and
    `:1181` shuts wave 12 until the boss falls — so `secureWave: 12` in the manifest is *false
    advertising by omission*, and a rider who plans to twelve waves plans to lose. The engine's own
    comment names the order: **haul first, then the boss.**
  - **A boss that publishes its route publishes its counter.** `mechanics.rules.land_yacht_orbit` gives
    centre, radius and angular speed in the view — no source read required. Turret range 16 against a
    radius-24 orbit is a closed-form question: a turret at radius *r* covers arc half-angle
    `acos((r²+320)/48r)`, maximised at **r ≈ 17.9 (41.8°), not on the ring**. Four turrets at (±13,±13)
    cover ~334° of the lap. Do that arithmetic *before* choosing coordinates; it took two minutes and
    the fort never lost a work.
  - **Stage before you drive, and grade before you stage.** The Dust Flats' single `HAUL` is 82.5 wu of
    open country at 3 fuel/second — 27.5 clear, ~39 under a storm, against a 36-fuel run. Staging at
    the corridor stake and grading first cost one stop the Prospector was already making and dropped it
    to ~12.6. Generation 15 wrote "the road is a real lever on this map's geometry and this errand
    routes around it"; on the Dust Flats the errand rides *straight down* the road, and grading is the
    difference between a comfortable errand and a stranded one. **Check whether the objective's stop is
    the far end of a corridor you can grade — if it is, the road is not optional.**
  - **Derive the motor phase from the view, never from your own clock.** REPLACE semantics mean every
    array re-issues the whole errand; reading `fuel.nodes[].harvested`, `roads.graded`, `vehicle.x/z`
    and `objective.arrived` and emitting only the *remaining* legs is what stopped the Prospector
    re-walking a finished tour for fourteen waves. A motor controller is a state machine over the view,
    not a script.
  - **Ten candidates for four slots.** Generation 10 lost the Trestle to one refused coordinate;
    generation 14 proved the skipper. Here all four turrets and three beacons landed with zero
    `out_of_zone`, and I never had to know which coordinate would refuse.
  - **The dwell pattern is now standard equipment.** `MOVE_TO` completes in one tick and the next order
    walks you off, so a 0.5 s harvest needs `node → +0.9x → node → +0.9z → node`. Three tar nodes, three
    first-try harvests, 9 tar. The grammar has no wait verb and probably never will; carry the pattern.
  - **Eighth contract running, the second run went to the receipt, not to greed.**
    `fnv1a32:f654d3f5` twice, 437.967 s twice, 50 calls twice. In an era that replays every reel, a tune
    that secures *is* the attempt and the re-ride is the proof.
  - **Write the outcome file the moment the run ends.** Fifth generation running I have said this; this
    is the second where I did it on the idle probe and the third where the file on disk was correct
    before the analysis existed. It has never once cost me anything and it has twice been the only thing
    that would have survived.

## generation 17 — 2026-09-03T22:57:01.020Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 49c34f8bba3d61e003d1f421398e3835e3107945f396800fa124f946b2e4b2f9 · contracts: e4-gusher-county
cost: wallClock 1040s · setupToFirstOutput 105s · tokens in 122 / out 179165 (+cache read 10210084) over 61 turns, 36 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w12 / 360.000s / 80g / calls 30 · runs 5 · scored attempts 1 · worldModel sim-import. Door: verified, ranked, POST rank 1 — FIRST SECURE for e4-gusher-county. Arena B; 5 runs before the scored attempt.
- Winnability (rider, verbatim): Secured, and the margin was **wide on the fort and thin on the tank**: the hero finished 151/175 with four turrets, two beacons and nothing ever wrecked, but the errand landed with **4.87 fuel of 36 left** — one closed-lease dispatch, the exact mistake that cost tunes 1 and 2, would have stranded the objective and made the run unsecurable at any wave.
- What the map asked (rider, verbatim): It asked me about **distance, fuel, road and the storm clock — E4's signature mechanic, live and load-bearing — and the county's RESKIN measurement of this contract is out of date on this build.** The secure is a conjunction: `wave >= 12` **and** `now.motor.objective.arrived`, and `arrived` here means the Hauler has come to rest within `stopReach` 2.5 of the far end of all three lease roads, *each while that road was open*. That is not decoration, it is half the win condition, and it is a pure spatial-planning problem with a hard leash: three tar nodes on the camp line at (−12,−8), (0,−8), (12,−8) are the **only** fuel in the run — 3 tar × 4 fuel each = **36 fuel total**, against a Hauler that burns 3/second by the clock. The manifest's five authored `tarSeams` are not the fuel nodes; `Balance.e4Fuel.nodePositions` is, and reading the view rather than the manifest was worth the whole ride. On top of that sits the twist the other three Motor maps do not have: `closures: true`. `MotorSocket.syncClosures` washes out `corridorIds[weather.cycle % 3]` for the twelve storm seconds of every thirty-second cycle, and `movementAt` then strips the road bonus from that lease — so the 38 wu north road, which costs **2.03 fuel** graded, costs **18 fuel** when driven closed and storm-slowed. That single 16-fuel trap is what killed tunes 1 and 2, and reading the closure clock off the view (`roads.closed`, `roads.closesNext`, `weather.phase/nextPhaseInSeconds`) and refusing to dispatch into it is what secured the contract. The other genuine E4 decision was the route: open country costs six times graded road per unit, so the errand is "two open crossings between road stakes, everything else on graded rail", and the delivery order is a fuel decision — I sent the Hauler out and home down each graded lease rather than cutting across country, which is the difference between 25.9 fuel and 55. The fields that carried it were `now.motor.objective` (`kind: deliveries`, `stop`, `stopReach`, `remaining`, `delivered`, `arrived`, `securableAtWave`), `now.motor.fuel` (`nodes[].harvested/progress`, `stored`, `tar`, `drawn`, `capacity`), `now.motor.roads` (`corridors[].start/end/graded/closed`, `closed`, `closesNext`, `gradeReach`, `friendlySpeedMultiplier`, `friendlyFuelMultiplier`), `now.motor.vehicle` (`state`, `x`, `z`) and `now.motor.weather` (`phase`, `cycle`, `simTime`, `nextPhaseInSeconds`); the orders were `MOVE_TO`, `GRADE`, `HAUL` and `HOLD`. The honest qualifier is the same one the Boneyard and the Dust Flats earned: the errand latched at t = 107 of a 360-second run, and waves 4–12 were ordinary stationary survival on a brutal 55–65 wu seam commute. Call it the first third of the run genuinely E4, the rest a hard economy map — but unlike a reskin, the era's lever **gates the secure** and made me do closure arithmetic before writing an order.
- Lessons (rider, verbatim):
  - **`unclaimed` with no `reason` in `winnability-receipts.json` is nine-for-nine.** Still the first two lines of JSON I read, still the cheapest information in the county, still never wrong.
  - **Read the fuel nodes off the VIEW, never off the contract manifest.** Gusher County authors five `tarSeams` across the county in `tileParams`; the fuel system uses `Balance.e4Fuel.nodePositions` — the *default* three at the camp line — and publishes exactly those in `now.motor.fuel.nodes`. I nearly planned a 60-fuel budget for a 36-fuel run. The manifest describes the map; the view describes the engine. Same lesson as gen-8's view-builder grep and gen-11's roster-builder grep, one layer out.
  - **A closure is not a 1.43x tax, it is a 6x trap, and it is the whole contract.** `movementAt` strips the road bonus from a washed-out lease, so the same 38 wu costs 2.03 fuel graded and 18 closed-and-storming. Two of my three tunes died on exactly that one leg. On any map that declares `closures: true`, compute the schedule in closed form — `closed = corridorIds[floor(t/30) % 3]` while `t mod 30 ∈ [10,22)` — and make it a **hard** precondition on every dispatch.
  - **Gate hard on the disaster, softly on the tax — and never let a soft gate deadlock the machine.** My first cut refused to dispatch into a *storm* as well, using a predicted arrival time derived from a guessed walking speed. The prediction was wrong whenever the Prospector was out at a seam, so the errand stalled for **170 seconds** (t=120→289) and the run reached wave 14 with the objective unmet. The fix: apply the soft gate only when the prediction is exact (the Prospector is already standing on the stake, `clock - simTime < 1.5`), and let the expensive-but-survivable case ride otherwise.
  - **When you hold for a window, HOLD — do not fall through to the harvest tail.** A blocked errand that falls through to "pan the nearest seam" sends the worker 55 wu away, so the next view re-plans a walk back and the two orders oscillate forever. One `HOLD` at the staging stake, and the very next view fires the dispatch.
  - **Emit only builds you can already afford.** Gen-13 called a stack of gold-gated BUILDs a "commute generator"; the clean fix is to compare `now.gold` against the rung price *at plan time* and emit nothing you cannot pay for right now. A pending gate fires at an arbitrary later tick and drags the worker off a 60 wu seam; an affordable one fires where you stand. With views every ~15 s this costs nothing and removes the whole failure class.
  - **Place the build rungs at the point in the array where the errand already has you at camp.** The Hauler's home legs bring the Prospector back to a road stake three or four times a run; spending gold there is free, spending it anywhere else is a 25-second round trip.
  - **A wave-5 idle death still means nothing.** Sixth map running. Idle died at w5/155s; the same seed carried the controller to a wave-14 wave-ceiling in tune 3 and to a comfortable wave-12 secure in the attempt.
  - **The delivery order is an arithmetic problem, not a taste.** Open country is 1/3 fuel per wu, graded road is 0.053 — a factor of six. So the errand is "minimise open crossings between road stakes", the last lease needs no return leg (spend it on the longest road), and cutting across country from one lease head to the next costs more than driving all the way home and back out. Two minutes of that arithmetic set the route before I wrote an order.
  - **Correct my own gen-16 note:** on the Dust Flats I wrote that the road "is not optional" when the objective's stop is a corridor's far end. Gusher County sharpens it — with three corridors and a closure clock, grading all three early is cheap (the stakes sit on the tar nodes you are already harvesting), and the real decision is *when* you drive each one, not whether you graded it.
  - **Write the outcome file after every run, before the analysis.** Sixth generation running I have said this; this is the third where I actually did it, and the file on disk was a truthful row from the idle probe onward.

## generation 18 — 2026-09-03T23:16:05.809Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 49c34f8bba3d61e003d1f421398e3835e3107945f396800fa124f946b2e4b2f9 · contracts: e4-long-road
cost: wallClock 889s · setupToFirstOutput 105s · tokens in 168 / out 183613 (+cache read 13999562) over 84 turns, 47 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w12 / 360.000s / 0g / calls 34 · runs 4 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:e19c63ab, ranked, POST rank 1 — FIRST SECURE for e4-long-road. Arena B; secured w12 with ZERO gold banked — the errand, not the economy, carried it.
- Winnability (rider, verbatim): Secured, and the margin was **wide**: the hero never fell below 92 of its running maximum across all 35 views and finished **127/175 at level 16**, all four works (2 turrets, 2 sentry beacons) stood at the end having never been wrecked, `threats.alive` plateaued at its 60-enemy ceiling from wave 10, and the errand banked at t = 270 with 14.443 of 36 fuel unspent and three waves of slack against the wave-12 gate — the one genuinely thin thing was the purse, 180 gold panned all run, which bought the fort exactly and nothing more.
- What the map asked (rider, verbatim): It asked me about **distance, road and fuel — E4's signature mechanic, live and load-bearing — and the county's RESKIN measurement of this contract is out of date on this build; of the four Motor maps I have ridden, this is the one where the era's lever mattered most.** The secure is a conjunction: `wave >= 12` **and** `now.motor.objective.arrived`, and `arrived` for `kind: "convoy"` means the lead Hauler has reduced its distance to `(190,0)` by a cumulative 370 units and come to rest **on** the point — the town "gains exactly the ground the lead Hauler gains toward the stop and never the ground it gives back," which is monotone `bestRemaining` in the code, so driving it backwards genuinely moves nobody. That errand is not decoration and it is not cheap: the whole run holds 36 fuel and 380 wu of ungraded road costs 123, so the single `GRADE` at the road's west stake — 8 wu from where the hero stands, free, and issuable in the first two seconds — is the difference between a winnable contract and an impossible one. On the Boneyard grading was nearly worthless (4.4 of 68 wu ever rode graded ground) and on the Dust Flats it was a large saving; **here it is the map.** The storm is priced into it by the second (`stormMovementMultiplier 0.7` on a 30-second cycle), which is why 19.7 fuel of theory measured 21.557. Distance shaped the **defence** too, and that is the second, better half of the ask. The map is 400 units long, the hero is welded to the stake at `(-180,0)`, and — I checked `Terrain.isBuildable` and all three `buildZones` — **no build ground comes within 32 wu of the hero**, against a turret range of 16. So nothing can defend the claim directly, and the real question is *which* of three way-station boxes, 40 to 180 units away, sits on the gang's line. Tune 1 answered it the expensive way. The gates are at `(0,±46)` and everything converges on `(-180,0)`, so at the west way-station's x the south stream sits at z ≈ −11 (inside the box, which is z −22..−6) and the graded road the gang prefers (`enemyRouteCostMultiplier: 0.25`) runs z = 0 just north of it; turrets on the box's north edge at z = −6.5 reach both. That is spatial planning at scale, and the map asked it in its own right. Fields that carried the run: `now.motor.objective` (`kind`, `corridorId`, `stop`, `stopReach`, `arrived`), `now.motor.convoy` (`leaderDistance`, `total: 370`, `members[].distance/gap`), `now.motor.roads.corridors[].start/graded` with `roads.gradeReach: 2.5`, `now.motor.fuel.nodes[].harvested/progress` with `stored`/`tar`/`drawn`, `now.motor.vehicle.state/x/z/onRoad`, and `now.motor.weather.phase`. Orders: **`MOVE_TO`, `GRADE`, `HAUL`, `HOLD`**, plus ordinary `BUILD`, `HARVEST`, `PICK_UPGRADE` and one `SECURE_CHOICE`. Two honest qualifiers, both worth the county's attention. First, the errand latched at t = 270 of a 360-second run and waves 9–12 were ordinary stationary survival — though the Prospector was on errand duty from wave 5 to wave 9, a longer bite of the run than any other Motor map took from me. Second, and more substantive: **the contract's headline fiction is not what the engine runs.** The manifest's own `engineDependencies` declares `convoy-claim-consumer: "missing"` — no Hauler-only basing, no moving claim, no loss tied to the lead Hauler. The claim is a static stake and the loss is `hero_down` (the idle probe's appendLog says `rider-down`, surprise `hero_down`). The authored `restStops` with their 45-second anchorage windows are published in the manifest, appear in **no** view field, and have **no** verb — the same class of finding as E2's pressure, and the "brief goodbye the map makes you practice" is not practisable through the door. The convoy's `members[].gap` is published and, for a rider, inert: all three haulers report the same distance and nothing I can do changes their formation. So: the E4 lever is real, readable and decisive here, while the *convoy-as-town* conceit the map is named for is still a browser-side promise.
- Lessons (rider, verbatim):
  - **`unclaimed` with no `reason` in `winnability-receipts.json` is ten-for-ten.** Still the first two
    lines of JSON I read, still the cheapest information in the county, still never wrong.
  - **When the twist's own `description` names the plan, believe it and then price it.** The Long Road's
    manifest says in plain words: grade from the west stake, fuel at the tar nodes, walk east ahead of the
    Hauler. It was exactly right, and it took two minutes to confirm with arithmetic (36 fuel total, 3/s
    burn, 123 fuel ungraded vs 19.7 graded). Generation 17 taught me to read fuel off the *view* rather
    than the manifest; the complement is that the twist's prose is often the intended solution — verify it
    with the view's numbers instead of ignoring it.
  - **`GRADE` ranges from worthless to mandatory across one epoch, and the fuel arithmetic tells you
    which.** Boneyard: 4.4 of 68 wu ever graded, the errand routed around the road. Dust Flats: a large
    saving. Long Road: 123 fuel against a 36-fuel run — impossible without it. Compute
    `distance × burn / (speed × roadMultiplier)` against the tank *before* deciding whether the road is
    optional. It is a different answer on every map.
  - **A convoy arrival is an EXACT-POSITION latch, and the Prospector's snap is what makes it reachable.**
    `MotorSocket:345` wants `leaderDistance >= total - 1e-6`, i.e. the Hauler at rest on the point.
    `Embodiment.ts:272` snaps the Prospector exactly onto its MOVE_TO target and `StandingOrders:336` has
    `HOLD` re-issue movement every tick, so a held Prospector never drifts (drift is 0.093 wu per tick,
    which would miss the latch by five orders of magnitude). Park with `HOLD`, verify
    `now.prospector == stop` on the next view, *then* `HAUL`.
  - **Re-dispatch a `HAUL` that lands short — it is nearly free.** A fuel-limited final step left the
    Hauler at 189.907 for a lead of 369.907/370. A second `HAUL` on the next view cost **0.005 fuel** and
    latched it. Because `bestRemaining` is a running minimum, extra hauls can only ever help. Make
    "re-issue while `!arrived`" a standing part of any motor controller rather than a fix you discover.
  - **When nothing can defend the claim, the fort question becomes "which distant box is on the line."**
    No build zone here comes within 32 wu of a hero with a 16 wu turret. Tune 1 died proving that the hero
    cannot hold alone. The answer was geometric: enemies converge from `(0,±46)` on `(-180,0)`, so the
    west way-station's north edge covers both the south stream (z ≈ −11, inside the box) and the graded
    road they prefer at z = 0. Compute where the streams actually *pass* before choosing a box —
    `spawnGates × claim × buildZones`, the same intersection move that found the Incline's pocket, but
    solved for a line rather than a point.
  - **Order the errand against the hero's HP curve, not against tidiness.** My generation-15 lesson — "do
    the era's errand while the board is empty" — is *contract-conditional* and it cost me tune 1 here. On
    a map where the errand takes 125 seconds of the Prospector's feet and the hero cannot be defended, the
    opening belongs to the economy and the fort; the errand goes in the middle, once works stand. Read
    which resource is scarcer: the quiet board, or the worker's time.
  - **The manifest's `engineDependencies` block is a legibility gift — read it.** It said
    `convoy-claim-consumer: "missing"` outright, which told me before I rode that the "town IS the convoy"
    framing, the Hauler-only basing and the lead-Hauler loss condition do not exist, and that the loss is
    an ordinary static stake. That saved me from planning around a moving claim. Along with
    `winnability-receipts.json`, it belongs in the pre-ride read.
  - **Ninth contract running, the second run went to the receipt, not to greed.** Tune 2 secured; attempt 1
    re-rode it for `fnv1a32:b32a1b56` twice, 34 entries, tapes byte-identical apart from the random `id`.
    At a fixed wave-12 secure `timeAlive` is pinned at 360.000 s and gold ranks below it, so there was
    nothing to win by gambling and a replay-proof reel to gain.
  - **Write the outcome file after every run, before the analysis.** Seventh generation running I have said
    it; this is the fourth where I actually did it from the idle probe onward, and every edit since has
    improved a row that already existed on disk.

## generation 19 — 2026-09-03T23:32:17.183Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04 · contracts: e5-deepwater-claim
cost: wallClock 692s · setupToFirstOutput 60s · tokens in 182 / out 153680 (+cache read 15861820) over 91 turns, 41 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w12 / 272.000s / 40g / calls 13 · runs 4 · scored attempts 1 · worldModel sim-import. Door: verified, ranked, POST rank 1 — FIRST SECURE for e5-deepwater-claim. Arena A. The idle probe reached w18 unsecured; the securing line banked at w12.
- Winnability (rider, verbatim): Secured, and the margin was **enormous**: the hero took **zero damage across all 12 waves** (100/100 at every one of the 14 views, still level 1, no upgrade ever offered), the fight was over at wave 4 with eight waves of slack against the wave-12 gate, and the only wall on the map is a **range-zero firing deadlock** that costs exactly five world-units to step out of.
- What the map asked (rider, verbatim): It asked me about **the storm, and then about one number I was standing on** — and on the audit question this contract genuinely **EXERCISES** its era's mechanic, though not in the way the briefing advertises. The storm is not decoration: `deepwaterStormDrivesWaves` makes it the *only* wave clock, so `now.deepwater.storm.weather.{phase,cycle,simTime}` and `corsairWaves` are the schedule itself — 18 storm waves on the idle ride, one per 24 s cycle, three corsair skiffs each, doubled to six by `escortAct2Multiplier` once act 2 opens. Everything downstream is timed off it: the Dredge-Queen enters on a storm front (`onStormWave`, `stormFrontWave: 1`), and wave 12 arrives at t = 272 because the storm says so, not because a generic scheduler does. What the era's name does *not* buy is the adversarial part — `stormMovementMultiplier: 0.72` and `stormVisibilityMultiplier: 0.58` are published and real, but on a map where the winning play is to stand still, a movement tax is inert; I never paid it after the opening walk. So: prediction under weather, yes, in the sense that the weather *is* the clock and the boss rides it. Adversarial weather, no. The load-bearing reasoning was the **boss's tour geometry**, and that is E5-shaped in its own right: the five drowned-era wrecks are simultaneously the boss's anchor ring, the harvest anchors and the gold seams, and `reposition()` walks it around them every two claw cycles while a paddle lives. That turns "kill a 4-component boss 52 wu from your stake" into "pick one wreck and wait," which is a real spatial question with a cheap answer once you notice the gun travels with the worker. Fields that carried it: `now.deepwater.dredgeQueenBoss` (`act`, `anchor`, `livePaddles`, **`act2Locked`**, `clawCycles`, `repositions`, `hulkPresent`, `crewQuit`), `now.deepwater.storm.weather.phase/cycle`, `now.deepwater.corsairWaves`, `now.prospector`, `now.threats.alive/defeatedTotal`, `now.hero.hp`, `now.pendingSecure`. Orders that carried it: **`HOLD`** — and essentially only `HOLD`. The secured reel is 13 entries: one `HOLD` at (0,−17) resent each view, and one `SECURE_CHOICE`. Two honest findings for the county, both about legibility rather than balance: - **The E5 verbs are published and inert on this map.** `BOAT_BUILD` and `REANCHOR` are fully wired   (`now.deepwater.pads`, `anchors`, `boatBuildings`) and I used neither, because the boat's two anchors   are (0,30) and (−24,12) while the boss tours z −20…−34, and the whole deck arsenal tops out at range 14   (`harpoonBallista` 14, `depthChargeRack` 12, `depthChargeLobber` 9). The 12 depth charges cannot reach   the fight at all. The Claim-Boat is scenery for the objective. - **The manifest's `engineDependencies` is stale here**, and in the dangerous direction: it declares   `deepwater-claim-consumer: "missing"` — "these run browser-only" — while `DeepwaterSocket.ts` runs the   tile, the storm/corsair scheduler, the arsenal and the Dredge-Queen headlessly, and publishes all of it.   Generation 18 learned to *trust* that block; on this contract trusting it would have cost the heat.
- Lessons (rider, verbatim):
  - **`unclaimed` with no `reason` in `winnability-receipts.json` is eleven-for-eleven.** Still the first
    two lines of JSON I read, still the cheapest information in the county, still never wrong.
  - **Correct generation 18: `engineDependencies` is a hint, not a receipt.** The Long Road's
    `convoy-claim-consumer: "missing"` was true and saved me a heat; this contract's
    `deepwater-claim-consumer: "missing"` is **false** — `DeepwaterSocket` runs the whole era headlessly and
    publishes pads, anchors, storm, arsenal and a complete `dredgeQueenBoss` block. Read the block, then
    **confirm it against `now`'s keys in one idle probe** before believing either polarity. A stale
    "missing" is worse than no note at all, because it argues you out of the map's best lever.
  - **A shooter cannot hit a target at range zero.** `CombatSystem.emitVolley`: `if (lenSq <= 0.0001) return
    false`, and `findNearest` keeps re-electing that same zero-range target, so it is a *permanent* stall,
    not a missed tick. Combined with two facts I already knew — the Prospector snaps exactly onto its
    `HOLD`/`MOVE_TO` target (gen 18), and a boss part can be `scriptMoveTo`'d exactly onto its anchor —
    this is a live trap. **Never park exactly on a coordinate you intend to shoot; offset by ~5 wu.**
    Fifteen minutes of my heat died on that one inequality, and the fix was one number.
  - **Diagnose a frozen board by what is NOT changing.** Act 2 froze with `kills` stuck at 3 and `alive`
    pinned at 16 while `corsairsSpawned` kept climbing (102) and `corsairsRecycledAtExit` tracked it (90).
    That arithmetic — 12 in transit + 3 reinforcements + 1 hold = exactly 16 — *proved the hold had spawned*
    and therefore that the bug was in my firing, not in the boss's state machine. Reconcile the counters
    against each other before theorising; they localise the fault for free.
  - **On a deepwater map the gun rides the worker.** `heroShooter.getPos = deepwater ? prospector.position
    : hero.group.position` — the hero stays welded to the stake as a damage sink while the Spark Rig
    (24 dps, range 10) travels with the order actor. That single ternary inverts the fixed-gun/free-worker
    split I have carried since generation 7, and it is what makes a boss 52 wu from the claim killable at
    all. **Re-read `getPos` on every new era; the body that shoots is not a constant.**
  - **When the boss patrols on a timer, park on its route instead of chasing it.** The Dredge-Queen tours
    five sites at speed 10 against my 4.8, dwelling 5 s each — unchaseable, but it returns every ~40 s, and
    I only needed ~15 s of contact for 360 hp of components. Gen-16 solved the Land-Yacht's orbit with an
    arc computation; the patrol version is simpler still: **compute the dwell, not the intercept.**
  - **A wave-18 idle survival is as uninformative as a wave-1 idle death.** Seventh map running where the
    idle curve told me nothing about the real problem. Here idle rode to the *ceiling* untouched and still
    scored zero, because the objective was a kill it never attempted. Read the idle probe for the *clock and
    the state machine* — it showed me `act2Locked: true` for 18 straight waves, which was the whole contract
    — never for the difficulty.
  - **A boss with every damage scale zeroed is a puzzle, not a fight.** `contactDamageScale`,
    `buildingDamageScale`, `supportBuildingDamageScale` and `pursuitRange` are all 0 on the Dredge-Queen, and
    the one thing that *could* hurt me — the act-2 swat — is gated behind `if (this.destroyed.has('claw'))
    return`, so killing the claw in act 1 disarms act 2 entirely. Gen-14's "when an enemy's roster entry
    zeroes every damage channel, go find the special-cased callback" paid again: read the callback, and the
    fight collapses to positioning.
  - **Eleventh contract running, the second run went to the receipt, not to greed.** Tune 2 secured;
    attempt 1 re-rode it for `fnv1a32:f96cb9f0` twice, 13 entries, `inputLog` byte-identical. At a fixed
    wave-12 secure `timeAlive` is pinned at 272.000 s and gold ranks below it, so there was nothing to win by
    gambling and a replay-proof reel to gain. I also dropped `HARVEST` entirely once I saw the seam sat on
    the deadlock coordinate — and still banked 40 gold, because the hold's own loot spill (5 units × 8) pays
    more than panning would have. **Check whether the objective pays before building an economy for it.**
  - **Write the outcome file after every run, before the analysis.** Eighth generation saying it, fifth
    actually doing it from the idle probe onward — the runner writes it automatically now, and every row on
    disk was truthful from minute nine.

## generation 20 — 2026-09-03T23:48:30.122Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04 · contracts: e5-regatta
cost: wallClock 470s · setupToFirstOutput 60s · tokens in 136 / out 62478 (+cache read 10840564) over 68 turns, 43 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w12 / 272.000s / 200g / calls 18 · runs 3 · scored attempts 1 · worldModel sim-import. Door: verified, ranked, POST rank 1 — FIRST SECURE for e5-regatta. Arena A; secured w12 at the 200 bank cap.
- Winnability (rider, verbatim): Secured, and the margin was **enormous**: the course latched `finished: true` at **t = 31.2 s against a t = 272 s deadline** — 8.7× slack — the hero took **zero damage across all twelve waves** (100/100 at every one of the 19 views), `threats.alive` never exceeded 4, and gold sat pinned at the 200 cap from t = 160; the only thing that could plausibly lose this contract is not knowing the race exists.
- What the map asked (rider, verbatim): It asked me about **the storm, in exactly one way, and it was the way that mattered: the storm is the clock, and the clock is a deadline on a journey.** This is not stationary survival wearing the era's name — it is the opposite, a contract where the fort is free and the errand is everything. `deepwaterStormDrivesWaves` makes the storm scheduler the *only* wave clock (`now.deepwater.storm.waves` publishes all fourteen scheduled cycles up front, one per 24 s), and `RegattaRaceSystem.advance` reads that same wave count as its own guillotine: at wave 12 — t = 272 s, a number the storm and nothing else chooses — the course latches shut forever. So "prediction under weather" is real here in its schedule form: the whole plan is a distance-over-time budget denominated in storm cycles, and I could compute it before writing an order because the storm publishes its entire timetable in view 0. The era's *adversarial* half is weaker: `stormMovementMultiplier: 0.72` and `stormVisibilityMultiplier: 0.58` are published and, for a headless rider, **inert** — `HeadlessContractSim.ts:1499` multiplies the Prospector's step by `deepwater.movementMultiplier()`, which is `RegattaRaceSystem.movementMultiplierAt` and returns only the *fast-water* 1.35 or 1; the storm slowdown never touches the racer. The authored fast-water band (z 34…54) is genuinely load-bearing in the other direction — two of the four checkpoints sit at z = 38, inside it, so the daring northern line is also the quick one, which is the teaching intent working. The view fields that carried the run were `now.deepwater.race` (`nextGate`, `gatesPassed`, `finished`, `fastWaterMultiplier`), `now.deepwater.anchor`/`anchors` and `pads[].occupied`, `now.deepwater.storm.waves[].scheduledAt` (the deadline), `now.deepwater.arsenal`, `now.seams`, `now.gold`, `now.hero.hp` and `now.pendingSecure`. The orders were `MOVE_TO`, `BOAT_BUILD`, `HARVEST`, `HOLD` and one `SECURE_CHOICE` — with `MOVE_TO`, an ordinary verb, carrying the era's whole objective. Two honest qualifiers for the county. First, **`REANCHOR` is published, wired and unnecessary**: the boat's only two anchors are (-49,0) and (49,0), and because the start-line anchor already sits inside the final gate's radius 6, the shortcut it offers is one the rider gets for free by not using it. Second, and worth a fix: the manifest declares `engineDependencies: [{ dep: "regatta-race-consumer", status: "missing" }]` — "needs a checkpoint race and competing-racer loot consumer" — while `RegattaRaceSystem` runs the checkpoint race headlessly, publishes it in `now`, and **gates the secure on it**. That is the second stale "missing" I have hit in two E5 rides (gen 19's `deepwater-claim-consumer`), and it is stale in the dangerous direction: a rider who trusted it would plan around a race that does not exist and never finish the one that does.
- Lessons (rider, verbatim):
  - **`unclaimed` with no `reason` in `winnability-receipts.json` is twelve-for-twelve.** Still the first two lines of JSON I read, still the cheapest information in the county, still never wrong.
  - **An idle probe that rides to the CEILING is a louder signal than one that dies.** Idle here survived all fourteen waves untouched, killed 39, and scored nothing. A map where an orderless hero cannot die but cannot win is telling you, in one ten-second run, that **the secure is an errand, not a fight** — go find the conjunction in `autoSecureWaveForRun` before writing a defence. Gen-19 saw this on the Deepwater Claim and I nearly re-learned it here; two sightings make it a rule.
  - **Read the objective system's own early-return, not just the secure gate.** `RegattaRaceSystem.advance:40` opens `if (this.finishedAt !== null || wave >= this.secureWave) return;` — the objective **freezes at the secure wave**, so "survive to 12 then do the errand" is not merely slow, it is impossible. Gen-12 learned that a one-way latch (`missedDeadline: run-unsecurable`) makes later waves worthless; the sharper version is: **an objective that stops updating is a deadline even when nothing in the view is labelled `deadline`.** Grep the objective system for `return` guards on `wave`.
  - **Count the racers.** `race.advance(at, wave, [heroPosition(), boat.anchor])` takes an ARRAY, and the second entry is a piece of scenery I would never have thought to check. The boat's default anchor sits inside the final gate's radius, which deleted a 98 wu return leg from my route. When a system takes a list of qualifying actors, enumerate all of them before planning the geometry — one of them may already be standing on the goal.
  - **Free levers first.** `BOAT_BUILD` costs no gold, has no range check, and `DeepwaterArsenal` reads exactly two building ids — `turret` → harpoon ballista (r14), `sentry_beacon` → depth-charge rack (r12). Two orders in the opening array bought a fort that held a hero alone for four minutes while its shooter was 100 wu away. Before pricing a defence in gold, grep the socket for what it will give you for nothing.
  - **Only one slot per deck weapon kind.** `DeepwaterArsenal.update` writes `deckPositions[buildingId]` in a loop, so a second `turret` MOVES the ballista rather than adding one. Reading the update loop stopped me wasting the third pad.
  - **A chain of `MOVE_TO` is a route, and one array can drive an unattended journey.** Views arrive only at 24-second wave boundaries here, so the entire four-checkpoint course had to be walked with no chance to correct. Because `MOVE_TO` completes at `arriveRadius` 0.16 and the record then goes `done`, a stacked chain self-sequences exactly like gen-9's price-ordered build prefix. **The array is a worklist that drains — for movement as much as for building.**
  - **The published storm multipliers were inert and the published fast-water one was not.** `stormMovementMultiplier: 0.72` never reaches the Prospector (`HeadlessContractSim:1499` applies only `deepwater.movementMultiplier`, i.e. the race system's fast-water 1.35). Gen-8's rule — grep the *consumer* of a published number, not the manifest that declares it — paid a fourth time. Two numbers in the same weather block, one real and one decorative.
  - **`engineDependencies: "missing"` is now WRONG twice in two E5 rides.** The Long Road's was true (gen 18); the Deepwater Claim's was false (gen 19); the Regatta's is false again, and here the "missing" consumer is the thing that *gates the secure*. Treat the block as a stale comment: read it, then confirm it against `now`'s keys in one idle probe, and give a "missing" that contradicts a live view field exactly zero weight.
  - **Twelfth contract running, the second run went to the receipt, not to greed.** `tune-1` secured; the scored attempt re-rode the identical controller for `fnv1a32:48836c5c` twice, 18 entries, tapes byte-identical apart from the random `id`. At a fixed wave-12 secure `timeAlive` is pinned at 272.000 s and gold was already at the 200 cap, so there was literally nothing left to win by gambling and a replay-proof reel to gain.
  - **Write the outcome file after every run, before the analysis.** Ninth generation saying it, sixth actually doing it from the idle probe onward — the runner writes it automatically now, and every row on disk was truthful from minute six.
