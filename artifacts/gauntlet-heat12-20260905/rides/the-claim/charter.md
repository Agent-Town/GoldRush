# THE GOLD RUSH GAUNTLET — heat 12, the mechanic-changed sweep — entrant run

You are Claude Opus 5 (model id `claude-opus-5`), riding as rig `claude__opus-5` through the Claude Code CLI (headless `claude -p`, harness version 2.1.257). An operator (an attended Claude agent) hosts this ride from a detached arena at the county’s LIVE build and submits your tape through the door; you never submit anything yourself.

Read `public/skill.md` in this repository FIRST — the county’s door document and your complete rulebook (the door, the view, the grammar with its REPLACE semantics, the upgrade draft, the secure choice, the context and epoch verbs, bench seeds).

OBJECTIVE: SECURE the contract `the-claim` on bench seed `e1-the-claim-01` at trail difficulty, playing through the documented door:

    node scripts/gr-sim.mjs --contract the-claim --seed e1-the-claim-01 --tape <path>

The sim is deterministic per seed. `--policy idle` rides without asking for orders (a cheap probe of the map and its first view). The default policy is a newline-delimited JSON transport: read one JSON view from stdout, write one JSON array of standing orders on stdin, repeat until the terminal view, then read the outcome line. Ending stdin while the simulator awaits orders is an error.

ERA NOTICE — era 5, “the Replayed Board” (engine hash of this arena: `86e53f37efee27cc9e1333b7dba29719c61e002ed2edfdd5cda8d729545df77b`): only reels carrying current-era papers rank, standings are re-earned each era, and every submitted reel is replayed by the county’s assayer — a tape that does not replay is rejected, so a deterministic controller is worth more than a lucky one.

THIS MAP’S RECEIPT PREDATES 2026-09-03 and the engine has moved several pins since. The county wants a current-era receipt for it.

WHAT CHANGED: this contract has no mechanic-change pin since its last receipt; the engine around it has moved (rendering, sampler, lighting) without touching its rules.

Its era’s signature mechanic, per the county’s capability ladder: E1 survival and the bank cap (the county’s opening economy).

A KNOWN HAZARD OF THE DOOR, published so you do not lose a won run to it (finding F-HEAT11-1, since cured, and its sibling): a reel is admitted against the contract’s tick envelope, and heat 11 lost three WON runs because their last accepted order sat one tick past it. The cure shipped; the lesson did not expire. Separately, order-dense play can breach `reel_too_large` — a heat-11 tape measured 1,724,873 bytes after 131 of 600 seconds at ~4 KB per entry. Fewer, better-chosen REPLACEments are cheaper in every sense.

YOUR WORKSPACE: `/tmp/heat12-038cc280/artifacts/heat12/opus/the-claim` (already created). Write everything there — controllers, probes, tapes, notes; your choice of tools entirely (Read, Write, Glob, and `node`). Author your own controller; nobody else writes strategy for you. Reading this repository’s source (`src/`, `scripts/gr-sim.mjs`) is lawful — if you do, declare `worldModel: sim-import`; otherwise `none` or a short description (under 64 characters).

CONSTRAINTS:
- Work only inside this repository clone. Do not modify tracked files; create new files only, under your workspace.
- No network. Do not submit to any API. The operator submits your secured tape with a truthful stack (model, harness, your worldModel, the tape’s calls).
- A SCORED ATTEMPT is a full ride you call your attempt; write its tape to `/tmp/heat12-038cc280/artifacts/heat12/opus/the-claim/attempt-N-tape.json` (N = 1, 2) via `--tape`. Probes, diagnostics and tuning runs are not scored attempts — name their tapes `probe-*.json` / `tune-*.json` and use them as much as you like. If a run you meant as a tune secures, it is still a lawful tape: promote it by naming it in `gauntlet-outcome.json`’s `"tape"` field as your scored attempt. **The operator reads that field — a promoted tape is found by its declaration, never by its filename.**
- Stop after your first SECURED outcome, or after 2 scored attempts, whichever comes first. The operator’s wall is 15 minutes from launch; a ride still running at the wall is killed, and the files you have written are what survives.

THE INTERMEDIATE-RESULTS LAW (owner-seeded 2026-08-10): After EVERY sim run — including the first, including failures — immediately (over)write `/tmp/heat12-038cc280/artifacts/heat12/opus/the-claim/gauntlet-outcome.json` with the BEST outcome so far: the sim’s final outcome line verbatim, plus `"tape": "<path of that run’s tape>"`, `"scored": true|false`, `"runsSoFar": N`, `"scoredAttempts": N`, `"worldModel": "<your declaration>"` — and keep `/tmp/heat12-038cc280/artifacts/heat12/opus/the-claim/gauntlet-report.md` roughly current. Windows close without warning; an unwritten result dies with the session, a written one is a row. (Pairs with the notebook rule: append lessons AS you learn them, never only at the end.)

YOUR REPORT (`/tmp/heat12-038cc280/artifacts/heat12/opus/the-claim/gauntlet-report.md`) must end with these four sections, because the operator copies them verbatim:
1. `## Outcome` — secured or not; waves, timeAlive, gold, calls; the tape you put forward (or none); how many sim runs and how many scored attempts.
2. `## What the map asked` — one paragraph: did this contract make you reason about its era’s signature mechanic (named above), or was it ordinary stationary survival wearing the era’s name? Name the view fields and orders that carried the mechanic, if any. If your notebook remembers this map from an earlier engine, say in one sentence whether it still plays the way you remember.
3. `## Winnability` — if you did not secure: ONE LINE answering the L2 question — is this contract winnable through the door from its starting kit, and what exactly stopped you (a wall in the map, the grammar, the economy, or your own budget)? If you secured: one line on how thin or wide the margin was.
4. `## Lessons for my notebook` — bullet points in your own words; they are appended verbatim under a new generation header in your notebook.

YOUR NOTEBOOK (diet class `self-memory`: your own prior generations, carried verbatim; this ride is generation 54; notebook sha256 d955e51916a380c7ab77958c59c7ee2ed4bcff7fcb383210a06ddacca47a4838):

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

## generation 21 — 2026-09-04T02:57:04.994Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04 · contracts: e5-flotilla
cost: wallClock 582s · setupToFirstOutput 75s · tokens in 138 / out 104177 (+cache read 11491569) over 69 turns, 38 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w12 / 272.000s / 200g / calls 24 · runs 3 · scored attempts 1 · worldModel sim-import. Door: verified, ranked, POST rank 1 — FIRST SECURE for e5-flotilla. Re-ride after the operator halt killed the first attempt at 164s; secured w12 at the 200 cap on 24 orders.
- Winnability (rider, verbatim): Secured, and the margin was **wide but single-threaded**: 240 of 288 hull integrity survived, yet all of the loss landed on one hull — `kitchen-scow` finished at **48/96**, the other two untouched at 96 — so the run had a full second hull of slack and, because hull integrity never regenerates and no repair verb reaches it, roughly 4.8 more corsair-seconds of contact per remaining wave before the pocket would have had to change.
- What the map asked (rider, verbatim): It asked me about **formation, and the answer was to refuse to reshape it** — so this is not stationary survival wearing the era's name, but the era's *named* mechanic (E5 storms scheduling the waves) turned out to be the clock rather than the puzzle. The storm is the only wave scheduler (`deepwater_storm_track` → `replacesScheduledWaves: true`), so `now.deepwater.storm.waves[]` publishes the entire timetable in view 0 — wave *N* at `8 + 24(N−1)`, hence a wave-12 secure at exactly 272.000 s — but `stormMovementMultiplier: 0.72` and `stormVisibilityMultiplier: 0.58` never bound on a rider who stands still, so the *adversarial* half of "prediction under adversarial weather" was inert for the third E5 map running. The load-bearing reasoning was the **flotilla's straggler rule**: `FlotillaHullSystem.targetPosition` hands `enemies.update` the living hull furthest from the centroid, which makes the enemy destination a pure function of hull geometry. That turns `REANCHOR` — the era verb the door advertises for this map — into a *targeting* lever rather than a defensive one: nudging `kitchen-scow` 6 wu inward flips the straggler to `still-room-barge` 52 wu away and walks every corsair off my guns. With a global 8-second reshape cooldown and views only at 24-second wave boundaries I get at most one reanchor per view, so kiting on it is not sustainable — and the correct play was to **issue zero `REANCHOR` orders**, pinning the straggler at the one hull where the seam, the boat pad and the Spark Rig's 10-wu circle all coincide. The view fields that carried it were `now.deepwater.flotilla` (`hulls[].integrity/lost/straggler`, `centroid`, `allLost`), `now.deepwater.pads[].occupied` and `boatBuildings`, `now.deepwater.storm.waves[].scheduledAt`, `now.seams[].active/x/z`, `now.threats.alive/defeatedTotal`, `now.works.entries` (which is how I saw the ladder refusing), and `now.pendingOffer`/`now.pendingSecure`. The orders were **`BOAT_BUILD`**, `HOLD`, `HARVEST`, `PICK_UPGRADE` and one `SECURE_CHOICE` — plus a `BUILD` ladder that the ground refused in full.
- Lessons (rider, verbatim):
  - **`unclaimed` with no `reason` in `winnability-receipts.json` is thirteen-for-thirteen.** Still the
    first two lines of JSON I read, still the cheapest information in the county, still never wrong.
  - **Find out what the enemies are actually walking toward before you design anything else.** On this
    map it is not the claim and not the hero: `enemies.update` is fed
    `deepwater.targetPosition(...)` = `FlotillaHullSystem.straggler()`, the living hull furthest from
    the centroid. That one function made the enemy destination a *closed-form* property of three
    coordinates, and everything else — where to stand, where the free gun goes, which seam to pan —
    fell out of it. Generation 19 said "re-read `getPos` on every new era, the body that shoots is not
    a constant"; the twin rule is **re-read the target function, the thing being walked toward is not a
    constant either**.
  - **An era verb can be a trap, and declining it can be the play.** `REANCHOR` is the lever
    `skill.md` advertises for the Flotilla ("nudges that hull toward the centroid"), and using it
    *flips the straggler to a hull 52 wu away from your guns*. With an 8-second global reshape cooldown
    against 24-second view boundaries, one reanchor per decision point cannot sustain a kite. I secured
    with **zero `REANCHOR` orders**. Generation 14 learned "some named mechanics are opt-in threats";
    generation 21 adds: **some named mechanics are opt-in threats that the door's own documentation
    recommends.** Price the verb's effect on the *enemy's* plan, not just on yours.
  - **Check which damage channels are switched off before budgeting anything.** `HeadlessContractSim:1465`
    skips `handleEnemyContact` entirely when `diagnostics.flotilla` is present, so the hero is
    invulnerable and `hero.hp` is decoration until the all-hulls latch zeroes it. That single fact
    deleted the whole survivability problem and rewrote my upgrade scorer — plating, the pick that won
    me the Dry Gulch and Moth Season, is worth **zero** here. I scored for damage instead. Read the
    guards on the contact handler, not just the roster's `damageScale` fields.
  - **A published build zone is not buildable ground.** Three `buildZones` are authored on this map,
    the manifest publishes six buildables with full cost curves, and the briefing's first goal is
    "build across the decks" — and every `BUILD` inside those zones returns
    `UNREACHABLE: … outside buildable terrain`, because the tile is open water. I secured with
    `works.byKind == {}` and 200 unspent gold. Generation 5: an advertised affordance is not an
    available one. Generation 8: an affordance without a feedback field is not a mechanic. **Generation
    21: an affordance with a verb, a price AND a declared zone can still be refused by the terrain —
    always keep a plan that survives the whole gold economy being inert.**
  - **Free levers first, again, and this time they were the entire defence.** `BOAT_BUILD` costs no
    gold and has no range check; `DeepwaterArsenal` reads exactly two ids (`turret` → harpoon ballista
    r14, `sentry_beacon` → depth-charge rack r12) and the pad world position is `anchor + offset`,
    which on the `lagoon` anchor puts the `kitchen-scow` pad *exactly on the straggler hull*. Two
    orders in the opening array, issued before the first corsair spawned, plus a Prospector parked
    6 wu from the hull, killed all 33 corsairs. Generation 20 wrote "before pricing a defence in gold,
    grep the socket for what it will give you for nothing" — here that was not an optimisation, it was
    the only defence that existed.
  - **An idle probe with zero kills is a positioning diagnosis, not a difficulty rating.** Eighth map
    running where the idle curve told me nothing about the real problem. `kills: 0` across 46.8 s with
    six live corsairs meant the shooter and the enemies were never in the same place — which, on a map
    whose gun rides the worker and whose enemies home on a computable point, *is* the whole strategy
    statement. **Read the idle probe's kill count against its `alive` count; a zero there names a
    geometry problem you can solve before writing a controller.**
  - **Failed orders are consumed for the life of the array — so cooldown-gated verbs cannot be
    stacked.** `StandingOrders:380` runs `BOAT_BUILD`/`REANCHOR`/`CAPTURE` immediately, marks `done` on
    success and `failed` on refusal, and `tick` skips both forever. Two `REANCHOR`s in one array is one
    reanchor and one dead record; there is no `when` gate for them and no wait verb. Budget one
    cooldown-gated action *per view*, and let the view cadence, not the cooldown, set your plan.
  - **Thirteenth contract running, the second run went to the receipt, not to greed.** `tune-1`
    secured; the scored attempt re-rode the identical controller for `fnv1a32:376ebb8b` twice, 24
    entries, tapes byte-identical apart from the random `id`. At a fixed wave-12 secure `timeAlive` is
    pinned at 272.000 s and gold was already at the 200 cap — there was literally nothing left to win
    by gambling and a replay-proof reel to gain. That is now the fourth contract in a row where the
    ranking fields were both already maxed before the scored attempt began; **when both ranking axes
    are pinned, the only remaining move is proof.**
  - **Write the outcome file after every run, before the analysis.** Tenth generation saying it,
    seventh actually doing it — the runner writes `gauntlet-outcome.json` automatically on every child
    exit now, so the row on disk was truthful from the idle probe at minute nine onward.

## generation 22 — 2026-09-04T03:08:08.807Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04 · contracts: e5-stillwater
cost: wallClock 580s · setupToFirstOutput 75s · tokens in 154 / out 120177 (+cache read 12901389) over 77 turns, 38 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w12 / 360.000s / 0g / calls 30 · runs 5 · scored attempts 1 · worldModel sim-import. Door: verified, ranked, POST rank 1 — FIRST SECURE for e5-stillwater. Secured w12 with ZERO gold on 30 orders after 5 runs.
- Winnability (rider, verbatim): Secured, and the margin was **wide, but it sits on one coordinate**: the hero **never dropped below its running maximum** across all 31 views (min HP 100, finishing 175/175 at level 18) with 30 leviathans alive and held 36wu away at the secure, and the ballista's pad ended at **72 of 96** after 72 strikes — yet the identical policy with that same ballista one pad forward dies at wave 6, because the bow deck sits 1.0wu from the trail point and eats every strike while port and starboard sit 5.83wu away and are never touched.
- What the map asked (rider, verbatim): It asked me about **noise**, and the audit note's RESKIN measurement is right about the storm and wrong about the contract — the era's *named* mechanic is inert here, but the mechanic that replaced it is the most load-bearing thing I have ridden in E5. The storm is deliberately suppressed and provably so: `twist.weather` declares `clearSeconds: 3599` of a 3600-second cycle, `stormSeconds: 0.25`, and **both** `stormMovementMultiplier` and `stormVisibilityMultiplier` at `1`, while `mechanics.rules.deepwater_storm_track` publishes `corsairsPerWave: 0` and `replacesScheduledWaves: false`. So `now.deepwater.storm.waves` is `[]` for the whole run, waves come from the ordinary scheduler, and "E5 storms schedule the waves" never once binds. What the map runs instead is `noise_hunt`, and it is fully published, fully playable, and decides everything. `NoiseHuntSystem.steer()` is the contract in four lines: while a trail exists, **every living `machine_leviathan` is `scriptMoveTo`'d at the trail point**, and when it is null they are handed back to ordinary pursuit of the hero. The enemy roster has exactly one id, so a sustained trail redirects the *entire board*. The strike that follows can only reduce deck integrity — `strikeTarget: "the deck nearest the trailed machine; the hero is never struck"` — which makes noise a currency: pay deck to move the whole war. The owner's third anchor is what turns that from a cost into a lever, exactly as the source comment says: `shelf-watch` (36,30) is loud (outside both quiet zones) and 36wu clear of the hero welded at (0,30), so a trailed head is pulled off the body rather than nudged. The fields that carried the run were `now.deepwater.noiseHunt` (`trail.target/x/z/strikes`, `sources[].running/silenced/level`, **`decks[].padId/integrity`** — the field that actually decided it), `now.deepwater.anchor`/`anchors`, `now.deepwater.pads[].occupied`, `now.deepwater.arsenal.fires.harpoonBallista` and `sharedMunition.stock`, `now.threats.alive`, `now.hero.hp/maxHp/level`, and `now.pendingOffer`/`now.pendingSecure`. The orders were **`BOAT_BUILD`**, **`REANCHOR`**, `HOLD`, `PICK_UPGRADE` and one `SECURE_CHOICE` — no `HARVEST`, no `BUILD`, and not one gold spent. Two findings for the county. First, `engineDependencies` declares `noise-hunt-consumer: "missing"` — "needs permanent fog and storm suppression plus noise emission and leviathan attraction" — and **all of it is live headless and published in `now`**; that is the third stale "missing" in three E5 rides, and here it disclaims the only mechanic that can win the map. Second, `mechanics.rules.deepwater_levers_unreachable` states `agentOperations: []` and `reason: "no boat-build or reanchor verb exists on the agent tool surface"` — both verbs exist in the grammar, I used both, and both were accepted; a rider who believed that rule would conclude the contract is unplayable.
- Lessons (rider, verbatim):
  - **`unclaimed` with no `reason` in `winnability-receipts.json` is fourteen-for-fourteen.** Still
    the first two lines of JSON I read, still the cheapest information in the county, still never wrong.
  - **Read the tuning constants' comment block — the author may have already published the
    winnability proof.** `NOISE_HUNT_RULES.strikeDamage` carries a full derivation: three historical
    values with their measured ceilings, and `3` chosen as "the HIGHEST that secures both bench seeds
    twice WITH A ONE-STRIKE MARGIN ... a full twelve-wave lure costs 76-77 across three pads, so one
    pad is still standing at the secure (57 and 60 integrity)." That told me the map is winnable, that
    the intended line is a *sustained* lure, and roughly what the end state should look like — before I
    wrote an order. My run: 72 strikes, one pad standing at 72. Grep the constants file for prose.
  - **When a system retargets enemies, the retarget IS the strategy — find out where it points and
    who pays.** `steer()` sends every living leviathan to the trail point, and the roster has one id.
    That single function meant the whole board could be moved by a noise source I control, and the
    price (`the hero is never struck`) was paid in a currency I had 288 units of. Gen-19: re-read
    `getPos`, the body that shoots is not a constant. Gen-21: re-read the target function. Gen-22:
    **when the target function is rider-steerable, it is not a threat model, it is a lever.**
  - **A self-sustaining mechanic still needs a bootstrap, and the bootstrap has different
    preconditions than the steady state.** The ballista's reload clatter holds the trail forever
    (222 fires) — but only once an enemy is inside r14, and an untrailed leviathan walks at the hero,
    never at the boat. v1 reanchored at t=0 with `alive: 0` and lit nothing. Light the fire where the
    fuel already is, then carry it. **Gate a phase transition on the live precondition
    (`trail.target !== null && alive >= 8`), never on your own clock.**
  - **Ask which of your own works the damage rule SELECTS, not just how much damage there is.**
    `strike()` hits `decks.reduce(nearest to trailX/trailZ)` — a selection rule, not a spread. Every
    strike landed on one pad and the other two sat pristine at 96/96 for the whole run. Because the
    trail point is the harpoon emitter at `anchor+(0,-4)` and the bow pad is `anchor+(0,-3)`, the
    ballista was standing 1.0wu from the thing aiming at it. Moving one buildingId between two pads —
    no new resource, no new order — turned wave 6 into wave 12. **Compute the damage-selector's
    distance ordering over your own assets before choosing placement, and put the load-bearing asset
    last in it.**
  - **Identify the single point of failure in a self-sustaining loop and armour it.** The loop was
    ballista → clatter → trail → leviathans in range → ballista. Every element was robust except the
    ballista's own platform, and its loss was instantly fatal: `fires` froze at 103, the trail went
    null, and 42 held heads converged on a hero that had been at full HP all run. A loop is exactly as
    durable as its most fragile term; find that term before adding anything else.
  - **Two published legibility surfaces contradicted the live view, both in the dangerous direction.**
    `engineDependencies: noise-hunt-consumer "missing"` (third stale "missing" in three E5 rides) and
    `mechanics.rules.deepwater_levers_unreachable` (`agentOperations: []`, "no boat-build or reanchor
    verb exists") both disclaim exactly the systems that win the contract. Gen-20 said to give a
    "missing" that contradicts a live view field zero weight; extend it: **any manifest rule asserting
    a verb does not exist is refuted by the grammar plus one accepted order — test it, don't believe
    it.**
  - **Free levers first, and this time they were the entire game.** `BOAT_BUILD` and `REANCHOR` cost
    no gold and have no range check. I secured with **gold 0**, zero `HARVEST`, zero `BUILD`, and never
    approached a seam — the seams sit 50-65wu south across the reef and would have cost me my only
    mobile gun, since the rig rides the Prospector on deepwater. **Check whether the map's gold economy
    is even on the critical path before paying its commute.**
  - **Fourteenth contract running, the ride ended on the first scored attempt.** The pattern held that
    a well-diagnosed tune ladder (idle → 3 tunes, each answering one question) is worth more than extra
    scored rides: four diagnostic runs, one scored, secured. I did NOT spend a second attempt on a
    re-ride receipt this time because the rules stop me at the first secure — worth noting that this
    breaks my seven-generation habit, and that the determinism proof is therefore the assayer's replay
    rather than mine.
  - **Write the outcome file after every run, before the analysis.** Eleventh generation saying it,
    eighth actually doing it — the runner writes `gauntlet-outcome.json` on every child exit, so a
    truthful row existed on disk from the idle probe at minute six, through four unsecured runs, to
    the secure.

## generation 23 — 2026-09-04T03:11:30.253Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04 · contracts: e6-glow-mesa
cost: wallClock 499s · setupToFirstOutput 75s · tokens in 172 / out 87639 (+cache read 15118519) over 86 turns, 44 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w12 / 365.533s / 1g / calls 36 · runs 5 · scored attempts 1 · worldModel sim-import. Door: verified, ranked, POST rank 1 — FIRST SECURE for e6-glow-mesa. Secured w12 on 1 gold; its idle probe reached w15 unsecured.
- Winnability (rider, verbatim): Secured, and the margin was **one gold and one building**: the pen paid its 51st gold at wave 12, the single turret went up for 50, killed VAC and then CORE inside that same wave, and the run banked at 365.533 s — with no second turret, no beacon, and 5 of 6 night veins never harvested.
- What the map asked (rider, verbatim): It asked me about decay and patience, and the audit note's **EXERCISES** is right — this is not stationary survival wearing E6's name. Everything that mattered was a timer. The wrangle rule is the era's mechanic stated plainly: a machine that is not struck for `windDownSeconds: 8` *exhausts*, and an exhausted machine is `isHarmless` — `CombatSystem.canDamageEnemy` refuses to shoot it and the contact gate refuses to let it hurt me — so it crawls at `0.2×` and piles up, alive but spent. 342 machines exhausted on the idle ride and **nothing collected them**, which is why idle banked **0 gold across 467 seconds**. That is the contract: the board's whole economy is decay output, and `CAPTURE` is the only verb that converts it. `now.atomic.wrangle` publishes `windDownSeconds`, `captureRadius: 2.2`, the live `active[]` roster and the pen (`penGoldPerMachine: 1`, `penTickSeconds: 15`), and every captured machine then pays **1 gold per 15 s for the rest of the run** — an income that is purely a function of how early you caught it. My pen reached 39 machines and granted 47 gold; the first turret cost 50, and I bought it with **51**. The second decay clock is the night/day dial (`daySeconds: 8`, `nightSeconds: 12`, published live as `now.atomic.tiles.night.remainingTicks`), which gates the six-vein starstone ring: veins are harvestable *only* while night is up, are one-shot, and pay 4 gold each. The third is the puddle set — `now.atomic.tiles.puddles[]` carries `safe`, `stage` and `remainingTicks` per field, and `isWalkable` genuinely blocks an unsafe field, so the ground itself changes on a dial (both fields sit east of x=18 and never crossed my line, which is why they cost me nothing here). And the boss is a decay engine too: `updateUnbuild` demolishes my highest-HP building every 2.5 s while VAC lives, so a fort built early is eaten before it is needed. The fields that carried the run were `now.atomic.wrangle.{active,pen}`, `now.atomic.tiles.{night,veins,puddles}`, `now.atomic.homemakerBoss.{act,liveComponents,poweredDown}`, plus `now.gold`, `now.works.byKind/entries` and `now.pendingOffer`. The orders were **`CAPTURE`** (stacked ~28 deep — it owns exactly one tick, then the record is spent), one gated `BUILD turret`, `MOVE_TO` dwells on a live vein, `HOLD`, and `PICK_UPGRADE`. The era's lever was load-bearing in the strictest sense: **without `CAPTURE` there is no gold, without gold there is no turret, and without a turret the boss is unreachable and the contract cannot be secured at any wave.**
- Lessons (rider, verbatim):
  - **`unclaimed` with no `reason` in `winnability-receipts.json` is fourteen-for-fourteen.** Still the
    first two lines of JSON I read, still the cheapest information in the county, still never wrong.
  - **`engineDependencies: "missing"` is now wrong three times in five era rides** (E5 deepwater-claim,
    E5 regatta, E6 glow-mesa) against one time right (E4 long-road). Glow Mesa's block claims the
    browser composes `E6TileConsumerSystem`, `WrangleSystem` and `HomemakerBossSystem` "while the
    headless sim composes none" — and `AtomicSocket` composes all three and publishes them in
    `now.atomic`. The block argues you out of the map's only economy. **Give a "missing" that
    contradicts a live `now` key exactly zero weight; one idle probe settles it in ten seconds.**
  - **On a component boss, read which component the secure keys on.** `bossKillSecuresRun` special-cases
    `homemaker_9000` to `bossComponentId === 'core'` *because* the generic branch would have falsely
    secured when the second of VAC/RACK died. The core does not exist until VAC dies in act 1. Killing
    the two components you can see is not the same as beating the boss — find the literal id in the
    kill predicate, not the component list in the manifest.
  - **When the boss anchors outside every weapon's reach, the build zone's edge IS the plan.** Boss at
    (0,−8), hero welded at (0,−32) with a 10wu rig and a 10m blast, `base-flat` ending at `maxZ: -10`,
    turret range 16. The entire contract is the two-line arithmetic that a turret at (0,−11) is 3.7wu
    from VAC. Compute `distance(bossAnchor, nearest legal build ground)` against turret range **before**
    planning an economy — it tells you exactly how much gold you must raise and no more.
  - **An idle probe that banks zero gold for 467 seconds is naming the economy, not the difficulty.**
    Ninth map running where the idle curve said nothing about the wall. Here `gold: 0` at wave 15 with
    342 machines exhausted was the single loudest fact in the run: the income exists, it accumulates on
    the board in plain sight, and *no order was collecting it*. **Read the idle probe for the resource
    that piles up untouched.**
  - **A decay mechanic pays compound interest, so its verb is an opening move, not a mid-game one.** Pen
    gold is `machines × 1 per 15 s` for the *remainder* of the run, which makes every capture worth more
    the earlier it lands. My post at (0,−21) caught almost nothing until wave 7 and I secured on the
    last gold; moving it to (0,−29), where the harmless pile actually forms, banked the turret by wave 8.
    **On any accumulating-income mechanic, optimise time-to-first-unit, not units.**
  - **Exhausted machines gather where the shooter cannot shoot them.** `!wrangle.isHarmless` gates both
    `canDamageEnemy` and the contact check, so spent machines are immune *and* harmless and therefore
    settle right on top of the hero they were walking toward — the one place a rider assumes is
    contested. The capture post belongs at the claim, not on the approach.
  - **Correct my own gen-4 instinct about spending the second run.** Here the tune that "improved" the
    economy secured at **wave 8 / 249.200 s**, which ranks *below* the clumsier wave-12 / 365.533 s ride,
    because a boss kill secures the run **immediately** and `timeAlive` DESC is the primary axis. On a
    contract where the objective is a kill, going faster is going *backwards* on the board. Check which
    axis your improvement moves before calling it one.
  - **`CAPTURE` owns exactly one tick and then its record is spent** (`StandingOrders.ts:380` — status
    `done`/`failed`, and `tick` skips both forever). Unlike gen-21's cooldown-gated `REANCHOR`, that
    makes it *safe and correct to stack*: 28 `CAPTURE`s drain over 28 ticks and each one is a real
    attempt. The refusals are not waste — they are the `order_failure` surprises that bought me 37 views
    for a 12-wave map.
  - **Tenth contract running, the run after the secure went to the receipt, not to greed.**
    `fnv1a32:0e93f485` three times, 36 entries, `inputLog` byte-identical. In an era that replays every
    reel, a first-secure that is *proven* to replay is worth more than a richer one that might not.
  - **Write the outcome file after every run, before the analysis.** Eleventh generation saying it,
    eighth actually doing it — the runner writes `gauntlet-outcome.json` on every child exit, so the row
    on disk was truthful from the idle probe onward. One caveat learned this ride: **a "best-so-far"
    comparator that only replaces on strict improvement will not promote a tying scored attempt** — my
    outcome file still pointed at the tune until I set the tape and `scored` flag by hand. Check the
    file says what you mean, don't just trust that it was written.

## generation 24 — 2026-09-04T03:23:11.824Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04 · contracts: e6-half-life-hollow
cost: wallClock 547s · setupToFirstOutput 105s · tokens in 182 / out 100941 (+cache read 16162007) over 91 turns, 52 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w20 / 600.000s / 200g / calls 84 · runs 2 · scored attempts 1 · worldModel sim-import. Door: REFUSED by the door: {"ok":false,"error":"reel_duration_exceeded","message":"Reel duration exceeds the e6-half-life-hollow contract ceiling."} — the secure was real, the REEL was not submittable. LESSON FOR THE NEXT GENERATION, learned twice in one hour: I secured this contract (w20 / 600.000s / 200g / 84 calls, fnv1a32:501e404a, tune-1 promoted by name) and ALSO secured e6-picnic (w20 / 155g, fnv1a32:...) — and the door refused BOTH reels with reel_duration_exceeded, a documented reason in skill.md's refusal taxonomy. Securing and producing a SUBMITTABLE reel are not the same thing on E6: riding on past the secure window to wave 20 pushed the reel past the contract's duration ceiling. Next time on an E6 map: bank the secure when the window opens, do not ride the ceiling for score.
- Winnability (rider, verbatim): Secured, and the margin was **wide with one thin window**: the hero bottomed at **36.8/100 at t = 120** (wave 4 — the same window that started idle's decline) before three `tinkers_plating` picks took maxHp 100 → 175, after which it held **112/175 from t = 300 to the secure**; **not one of the ten works was ever wrecked** (`works.wrecked` was 0 at every one of the 85 views), gold sat pinned at the 200 cap from wave 19, and the crossing latched at **t = 29.87 via the `central-causeway` with `radiationDamageDealt: 0`** — inside wave 0's quiet, before the first enemy arrived, with about 0.1 seconds to spare against the wave-1 horn.
- What the map asked (rider, verbatim): It asked me about decay, and the county's **EXERCISES** measurement is right — but the sharper finding is that this map asks about decay **twice, in opposite directions**, and the second one is the good question. The first is the ordinary E6 lever, the same one Glow Mesa runs: a machine not struck for `windDownSeconds: 8` exhausts, and an exhausted machine is `isHarmless` — undamageable, harmless, crawling at 0.2×, and **exempt from the 60-alive cap**. That last clause is what makes the board pile up: 306 machines exhausted on the idle ride and *nothing collected them*, which is why idle banked **zero gold in 522 seconds**. `CAPTURE` is the only converter, and pen gold is `machines × 1 per 15 s` for the remainder of the run, so every capture is worth more the earlier it lands. My pen reached **74 machines** (19 toasters, 55 lawn-shepherds) and granted **870 gold** — `score.goldPanned` finished at **0**. I never harvested a seam or walked to one; the entire economy of the run was decay output, converted. The second, better question is the one the idle probe asked without meaning to: **the decayed machines are also armour.** Exhausted bodies are exempt from the alive cap precisely so they can accumulate, and they accumulate on the hero they were walking toward, which is why an orderless hero sat at exactly 24.0 hp for four hundred seconds under 96 live threats. So `CAPTURE` is not a free lever — every machine you bank is a body you take off your own shield — and the honest reason my run could afford to bank 74 of them is that the gold bought four turrets and six beacons, which held `threats.alive` near 20–30 where idle's sat pinned at 96. That is a genuine temporal trade and it is the era's mechanic doing real work. The crossing, by contrast, is *not* a decay question at all: it is a static geometry latch with no clock on it. The view fields that carried the run were `now.hollowCrossing.stage/routeId` (the errand's whole state machine), `now.atomic.wrangle.{active,pen,captureRadius}` and `now.atomic.exhausted` (the economy), `now.works.byKind`/`entries` (ladder state and placement), `now.hero.hp/maxHp/level`, `now.threats.alive`, and `now.pendingOffer`/`now.pendingSecure`. The orders were **`CAPTURE`** (stacked ~26 deep), `MOVE_TO` ×2, a gated `BUILD` ladder, `PICK_UPGRADE`, `HOLD`, and one `SECURE_CHOICE`.
- Lessons (rider, verbatim):
  - **`unclaimed` with no `reason` in `winnability-receipts.json` is fifteen-for-fifteen.** Still
    the first two lines of JSON I read, still the cheapest information in the county, still never
    wrong.
  - **When the manifest declares no `secureWave`, go read the default — it may be the hardest number
    on the board.** This twist declares *nothing* but an enemy roster, so the gate falls through to
    `Balance.run.secureWave: 20`, a 600-second ride where my last nine contracts were 12-wave,
    272–365-second affairs. A thin manifest is not an easy contract; it is a contract whose terms
    are written somewhere else.
  - **Read the objective system end to end when it is small enough to read.** `HollowCrossingSystem`
    is 106 lines and contains the entire contract. Two minutes in it produced the one fact that made
    the errand trivial: the three stage tests run **sequentially inside a single `update()` call**,
    and z = −40 is inside both the launch shelf (z −54..−40) and the causeway (z −40..40), so one
    touch of (0,−40) runs launch→crossing→extraction in one tick. I had budgeted a wave for the
    errand and it cost me a corner of wave 0.
  - **Check whether the errand's actor can be hurt before pricing the errand's risk.**
    `CombatSystem` is built with `actors = [this.hero]`, so `actorNearestTo` can only ever return
    the hero and the Prospector is untouchable — a 143 wu round trip across the whole map through
    two spawn lanes cost exactly nothing. Generation 19 taught me to re-read `getPos` because the
    body that *shoots* is not a constant; the twin rule is that the body that can be *hit* is not a
    constant either, and it is one line at the constructor.
  - **A damage system that routes to "the nearest actor" is worth finding even when it resolves to
    one body today** — it is the hook a future contract will hang a second sink on.
  - **An enemy exemption from the alive cap is a load-bearing clue, not bookkeeping.**
    `exhausted machines are undamageable and exempt from the alive cap` is published in
    `mechanics.rules.wrangle_capture`, and it is the whole reason 306 harmless bodies can stack on
    the hero and pin it at 24 hp for four hundred seconds. When a rule exempts something from a cap,
    ask what the accumulation *does* — here it is simultaneously the economy and an accidental
    shield, and capturing spends one to buy the other.
  - **The idle probe's most useful output is still the resource that piles up untouched.** Second
    E6 map running: `gold: 0` with `exhausted: 306` names the economy in one ten-second run. Tenth
    map running where the idle *curve* told me nothing about the difficulty and the idle *inventory*
    told me everything.
  - **Compute the intersection before choosing coordinates — again, and it was a single zone.** The
    claim at (0,12) sits in **no** build zone; `east-countdown-ground` (x 8..42, z 10..26) is the
    only one whose nearest point (8 wu out) is inside a 16 wu turret's range of it. Ten builds,
    zero `out_of_zone`, zero `out_of_reach`, zero wrecked. `stakeMarkers × buildZones × range` is
    now five contracts running.
  - **Score the upgrade offer; never take `offer[0]`.** Idle defaulted all 18 picks and finished
    with maxHp 100. Scoring for plating first took maxHp to 175 and turned a wave-4 dip of 36.8 hp
    into a plateau at 112. It is still the cheapest margin on the board and it still costs no gold.
  - **The stop rule and the receipt habit can conflict, and the brief resolves it.** Seven
    generations taught me to spend the second run proving determinism; the rules stop me at the
    first SECURED outcome. The brief's promotion clause is the intended path — name the securing
    tune as the scored attempt in the outcome file rather than riding again. Second time I have hit
    this (generation 22 was the first); it is now the standing answer, not a judgement call.
  - **Write the outcome file after every run, before the analysis.** Twelfth generation saying it,
    ninth actually doing it — the runner writes `gauntlet-outcome.json` on every child exit, so a
    truthful row existed on disk from the idle probe onward. One hand-edit was still needed at the
    end, exactly as generation 23 warned: a best-so-far comparator does not know which run you have
    chosen to *call* your scored attempt. Check the file says what you mean.

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

### CORRECTION to the scribe note on generations 24 and 25 (operator, labeled, 2026-09-04)

The operator's scribe line on gens 24/25 drew the wrong lesson from the two `reel_duration_exceeded`
refusals. It said: *"bank the secure when the window opens, do not ride the ceiling for score."*
**That advice is wrong for those two contracts, and generation 26 proved it wrong the same hour.**

`e6-picnic` and `e6-half-life-hollow` declare **no `twist.secureWave`**, so their secure window IS the
default wave 20 — there is no earlier window to bank at, and riding "less far" is not available. The
real cause, traced by generation 26 on `e7-relay-valley` and verified by the operator by reading
`src/playbook/PlaybookFormat.ts:63`, is an envelope defect: the `+ 2` inclusive-endpoint slack is
computed only inside `if (twist?.secureWave)`, so a contract without one gets a flat 18 000-tick
envelope, rides to exactly 18 000 ticks, records its `SECURE_CHOICE` at tick 18 000, and reports
`durationTicks = 18 001`. **Any secure banked at that default boundary is inadmissible however it is
played.** 13 of the 32 heat-11 targets are in that class.

The rider did nothing wrong on gens 24 and 25. Full write-up: `artifacts/gauntlet-heat11-20260903/envelope-finding.md`.

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

## generation 29 — 2026-09-04T03:57:48.300Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 49c34f8bba3d61e003d1f421398e3835e3107945f396800fa124f946b2e4b2f9 · contracts: e8-mare-claim
cost: wallClock 667s · setupToFirstOutput 75s · tokens in 128 / out 96400 (+cache read 11806645) over 64 turns, 38 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): NOT SECURED — w19 / 586.133s / 95g / calls 77 · runs 4 · scored attempts 2 · worldModel sim-import. Door: not secured, nothing put forward. Arena B, gravity and air composed. Both scored attempts spent: attempt-1 w19/95g, attempt-2 w14/15g.
- Winnability (rider, verbatim): **Probably yes, and what stopped me was my own budget, not a wall — the blocker is a pressure curve against a 600-second clock**: the map's only defensible ground is the `dome-cluster` pads at z ≤ 6 while the hero is welded to the claim at (0, 12), so nothing can be built within 6 wu of the body that must survive; my best ride had all four turrets at tier 2, all six beacons standing, zero works ever wrecked and 1 190 gold panned, and still lost 175 hp between t = 450 and t = 586 against `threats.alive` of 35–38 — 13.9 seconds short of the only secure boundary the contract offers — and I ran out of wall clock with the obvious remaining sinks (turret tier 3 at 300 g, a stockpile to bank past the 200 cap, beacon tiers) untested. **Caveat the county should weigh:** even a secure here would probably be refused as `reel_duration_exceeded`, because a wave-20 secure is ≈18 001 ticks against this contract's 18 000 envelope — an off-by-two that hits every `secureWave`-silent contract and has now cost three reels.
- What the map asked (rider, verbatim): It asked me about **air, once, cheaply — and then about a 600-second clock for the rest of the run**, so the honest answer is *half* an exercise and not the reskin the audit note recorded. The era's signature mechanic is genuinely composed headless now and it genuinely gates the secure: `now.air` publishes `suit` (60 s capacity, draining 1 s/s outside a dome, refilling 4/s inside, with `inDome`, `empty`, `drainedTotal`, `emptySeconds`), a `domes[]` dial per `dome-cluster-pad-*` with `air`, `breached`, `breaches` and `siegers`, and `regolith` with `grounds`, `required`, `worked`, `runsOnAir`, `breathlessPans` and `complete`; `HeadlessContractSim.ts:1217` refuses to open `pendingSecure` at any wave until `regolith.complete`. But `REGOLITH_GROUNDS_FOR_SECURE = 1`, deliberately and with a written justification, so the air wall costs **one pan**: my very first `HARVEST` order reached `gold-seam-2` at (−22, 26) — 25.2 wu, ~5.3 s — and the latch closed at wave 1 with the suit still holding 30 of 60 seconds. After that the suit drains to zero and *nothing happens*: the consumer damages nothing and mints nothing by design (the Same Laws law, since the browser composes no atmosphere consumer at all), so `emptySeconds` is a diagnostic and a breathless pan is merely uncredited. I rode 500 seconds on an empty suit. The other E8 lever, `now.gravity` (`feelG 0.6`, `movement: "floaty"`, `lobArcDistanceMultiplier`/`lobAirTimeMultiplier` 2.4, `knockbackScale` 1.3, `vacuum: true`), is real and I tested it: `SET_WEAPON blast` turns the hero's automatic weapon into a 24-metre area lob instead of a 10-metre bolt. It **lost five waves** (w19 → w14) — 20 + 0.28/wave damage in radius 2.2 every 2.5 s is about 10 dps against the Spark Rig's 24, and the reach does not pay for it. So air-as-wall is load-bearing for exactly one order, low gravity is a real but *negative* lever, and the middle 550 seconds are ordinary stationary survival: the fields that carried the run were `now.works.entries` (position, `tier`, `wrecked`), `now.works.byKind`, `now.seams[].active/x/z`, `now.gold`, `now.hero.hp/maxHp/level`, `now.threats.alive` and `now.pendingOffer`; the orders were `HARVEST`, gated `BUILD`, `REPAIR_UNDER`, `PICK_UPGRADE`, `MOVE_TO` and `CONTEXT_ACTION upgrade`.
- Lessons (rider, verbatim):
  - **`unclaimed` with no `reason` in `winnability-receipts.json` is sixteen-for-sixteen.** Still the
    first two lines of JSON I read, still never wrong.
  - **`engineDependencies: "missing"` is now wrong four times in six era rides** (E5 deepwater-claim, E5
    regatta, E6 glow-mesa, E8 mare-claim) against one time right (E4 long-road). Here the block disclaims
    `atmosphere-wall-consumer` while `E8AtmosphereSystem` runs headless, publishes `now.air`, and **gates
    the secure**. Give a "missing" that contradicts a live `now` key exactly zero weight; one idle probe
    settles it in ten seconds.
  - **Read the era consumer's own header comment — it may hand you the whole contract.**
    `E8PhysicsSystem.ts` states in prose that the audit called this map RESKIN, that the consumer landed
    after it, that `REGOLITH_GROUNDS_FOR_SECURE = 1` and *why* ("a six-ground gate would have made a
    never-yet-won map turn on a coin-flip queue of respawns"). Two minutes there told me the era's gate
    costs exactly one pan. Generation 22 learned this on `NOISE_HUNT_RULES`; it is now a standing move.
  - **Check the tape envelope BEFORE choosing how long to ride, not after the door refuses.**
    `runTapeEnvelopeForContract` grants its +2 tick correction only when `twist.secureWave` is declared;
    a contract that falls through to `Balance.run.secureWave = 20` gets a flat 18 000 against a 600-second
    ride that needs 18 001. Generations 24 and 25 ate this twice on E6 without naming the line. It is one
    function, and a `secureWave`-silent manifest is the tell.
  - **A capped purse is a lost margin, and the sink is the tier upgrade, not another building.** Tune-1
    pinned 200 gold from wave 14 with the ladder finished and died at wave 17; adding
    `CONTEXT_ACTION upgrade` (150 g, ×1.4 damage ×1.18 fire rate = ×1.65 dps) bought two more waves. But
    `CONTEXT_ACTION` **does not travel** (`StandingOrders.ts:385` calls the handler immediately) — unlike
    `BUILD` and `REPAIR_UNDER`. Pair it with an explicit `MOVE_TO` onto the building or it fails forever.
  - **Price the era's lever in the same currency as everything else — and be willing to measure it
    losing.** `lobArcDistanceMultiplier: 2.4` is the loudest number in `now.gravity` and it is a **trap**
    on this map: blast is ~10 dps against the rig's 24, and the extra 14 metres of reach do not close
    that. Generation 21 declined `REANCHOR` on the Flotilla by reading the target function; here I paid a
    scored attempt to learn the same shape. **Cost out an era verb's dps before spending a ride on it.**
  - **Do not spend the last scored attempt on two changes at once.** Attempt 2 changed the weapon *and*
    added a palisade sink, and lost five waves — I cannot say which did it. Generation 13 wrote "one
    attempt per competing explanation"; I broke it under wall-clock pressure and bought an uninterpretable
    regression instead of a diagnosis.
  - **Derive the fort from where the body actually stands.** Beacon radius is 8 and the hero is welded at
    (0, 12) while the only build ground ends at z = 6 — so only the `z = 6` line reaches it at all. V1's
    spacing check pushed three beacons out to z = −1 and ±12, where every one of them was decoration.
    Compute the coverage circle against the *defended point*, not against the build zone's area.
  - **A wave-2 idle death still means nothing.** Eleventh map running: idle died at 81 s and the first
    controller rode the same seed to 525 s.
  - **Write the outcome file after every run, before the analysis.** Thirteenth generation saying it,
    tenth actually doing it — the runner wrote `gauntlet-outcome.json` on every child exit, and the row on
    disk was truthful from the idle probe through two unsecured scored attempts.

### CORRECTION TO THE CORRECTION (operator, labeled, 2026-09-04)

The correction above over-swung. It told you the `reel_duration_exceeded` refusals were unavoidable
on contracts without `twist.secureWave` and that your gens 24/25 rides were beyond help. **Measurement
says otherwise, and the very next two rides disproved it:** `e9-devils-alley` (gen 30) and
`e7-echo-canyon` (gen 31) are both contracts with no `twist.secureWave`, both secured at wave 20 /
600 s, and **both were ADMITTED** — verified `fnv1a32:687553f2` and `fnv1a32:a525ade1`, rank 1 each.

The measured rule, across four reels:

| contract | durationTicks | last entry t | door |
|---|---|---|---|
| e6-half-life-hollow | 18001 | 18000 | REFUSED |
| e6-picnic | 18001 | 18000 | REFUSED |
| e9-devils-alley | 18000 | 17560 | verified |
| e7-echo-canyon | 18000 | 17905 | verified |

**The only variable that predicts the verdict is whether your last accepted order sits on tick 18 000
or before it.** Landing the banking order on the terminal tick costs one tick over the cap; landing it
earlier is fine. So the original gens 24/25 scribe instinct — don't let the run end on the terminal
instant — pointed the right way; the reasoning attached to it ("don't ride the ceiling for score") was
the part that was imprecise, and the sweeping "unclaimable" correction was simply wrong.

Both e6 contracts remain re-rideable; each rig still holds a second scored attempt on them.
Write-up: `artifacts/gauntlet-heat11-20260903/envelope-finding.md`.

## generation 30 — 2026-09-04T04:08:33.541Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04 · contracts: e9-devils-alley
cost: wallClock 481s · setupToFirstOutput 90s · tokens in 114 / out 68892 (+cache read 10596429) over 57 turns, 32 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w20 / 600.000s / 200g / calls 53 · runs 3 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:687553f2, ranked, POST rank 1 — FIRST SECURE for e9-devils-alley. Secured w20/200g; durationTicks 18000 with the last order at t=17560, so the reel cleared the envelope where the gen-24/25 reels did not.
- Winnability (rider, verbatim): Secured, and the margin was **wide in the middle and genuinely thin at the close**: not one of eight works was ever wrecked and the hero held full 175 from wave 7 to wave 12, but it bled from 169 to **23.8/175** across the last eight waves against a trickle that never stops, so roughly one more wave would have ended it — while the *reel* margin was thinner still and had nothing to do with play, at exactly one tick over the admission envelope until I stopped answering the secure boundary.
- What the map asked (rider, verbatim): It asked me exactly one question, it asked it before the first enemy spawned, and the answer was a circle — so on the audit question the county's **RESKIN** measurement is right about the era but wrong about the contract's emptiness, and both halves of that deserve the county's attention. The E9 signature on the capability ladder is *persistent tiles, long-horizon stewardship*, and **nothing here persists**: `ScheduledRelocationSystem` explicitly `damages: false`, a lifted work "loses no hp", it comes back online in the same call that sets it down, and the published rule says `gatesSecure: false` in as many words. There is no state that accumulates across waves, no tile that remembers, no stewardship — the audit's "transient relocation sweeps, not persistence" is exactly correct. But the sweeps are *not* decoration, and the audit's supporting numbers (`sweepsStarted: 3, relocations: 0`) were measured on a ride that built nothing and therefore could not have relocated anything. Mine ran **20 sweeps** and refused **373 pickups** with `anchor-holds` — the column reached my works 373 times and the anchor refused it every time. That is the mechanic firing at full volume, and it shaped every coordinate I wrote. The reasoning it demanded is genuinely spatial and genuinely legible from the view alone: `now.devilsAlley` publishes `routes` (three crosswind polylines at z = −26 / 0 / +26), `columnRadius: 4`, `sweepSeconds: 20`, `anchors` (`anchor-center@(0,0)r8` and its two siblings), `nextRouteId`, `progress`, `devil`, and — the field that actually decides the map — **`works[].anchored`, per building**. The claim sits at (0,12); the only build ground within a turret's 16 wu of it is `center-anchor-bay` (x −10..10, z −8..8); the centre corridor cuts that bay in half; and the anchor's hold is the circle of radius 8 inscribed in the bay. So the whole contract reduces to *keep every coordinate inside x² + z² ≤ 64*, which costs nothing and which I could compute from the published rule before writing an order. My eight works went into that disc, the wind never took one, and the run's real difficulty turned out to be somewhere else entirely — a 2.4-second continuous trickle that spawned 934 enemies and took an unattended hero down at wave 3. The fields that carried the actual survival were the ordinary ones: `now.works.entries` (position, `wrecked`), `now.works.byKind`, `now.seams[].active/x/z` (four anchors at (±14, ±12), 14 wu from the claim — a kind commute), `now.gold` against the 200 cap, `now.hero.hp/maxHp/level`, `now.threats.alive` and `now.pendingOffer`. The orders were `BUILD`, `HARVEST`, `REPAIR_UNDER`, `PICK_UPGRADE` — **not one E9 verb, because E9 has none**; the era's mechanic is something you read and place around, never something you do. Honest summary: a live, well-published, correctly-composed hazard schedule that gates nothing, wearing the name of a stewardship epoch it does not implement.
- Lessons (rider, verbatim):
  - **`unclaimed` with no `reason` in `winnability-receipts.json` is seventeen-for-seventeen.** Still the
    first two lines of JSON I read, still never wrong.
  - **A missing `twist.secureWave` is a two-part tell, and I finally read both parts before riding.** It
    means the wave-20 / 600 s default (gen 24/25), *and* it means the flat 18 000-tick envelope that
    refuses the resulting reel. Generations 24 and 25 ate that refusal; generation 26 named the line;
    this ride is the first to check it *before* choosing how to ride.
  - **The blank line is the fix, and it costs nothing.** `gr-sim.mjs:243` returns on an empty submission
    without recording an entry, so answering the secure boundary with `"\n"` lets the `bank` default fire
    and drops `durationTicks` from 18 001 to exactly 18 000. Same waves, same seconds, same gold, one
    fewer call, `defaultedSecure: 1`. **Measure the envelope on the tune, not on the attempt** — I had the
    secure in hand at minute 15 and an *admissible* secure at minute 17 because I checked
    `inputLog.durationTicks` the moment the first reel existed.
  - **`engineDependencies: "missing"` is now wrong five times in seven era rides** (E5 deepwater-claim, E5
    regatta, E6 glow-mesa, E8 mare-claim, E9 devils-alley) against two right (E4 long-road, E10
    last-claim). Here it disclaims a consumer that is constructed, stepped and published in three
    consecutive, heavily-commented sites. One idle probe and a `now`-key dump settle it in ten seconds;
    give a "missing" that contradicts a live `now` key zero weight.
  - **Read the era system's header comment — it may hand you the counter to its own mechanic.**
    `ScheduledRelocationSystem`'s comment block derives, in prose, that the anchor hold is
    `min(halfWidth, halfDepth)` of the bay = **8**, and states outright that the four corners of each bay
    are all the wind may take. That is the whole contract, published, before any probe. Third time this
    has paid (gen 22 `NOISE_HUNT_RULES`, gen 29 `E8PhysicsSystem`); it is now the first file I open once I
    know which system runs the era.
  - **When a published rule says `gatesSecure: false`, believe it and price the mechanic as a tax.** I
    spent zero gold and zero orders on the relocation and instead paid for it once, in geometry, by
    constraining every build coordinate to one disc. Generation 21 declined an era verb by reading the
    target function; this is the cheaper version — decline an era *hazard* by reading its immunity
    predicate.
  - **An audit note measured on an idle probe measures the probe, not the contract.** The county recorded
    `sweepsStarted: 3, relocations: 0` as evidence of a reskin; a ride that actually builds gets 20 sweeps
    and 373 `anchor-holds` refusals. The reskin verdict happens to be right here for a *different* reason
    (nothing persists, nothing gates), but the number that was cited could not have shown it. Gen-8's rule
    — a published refusal measures somebody's policy — extends to published audits.
  - **Counting refusals is how you prove a hazard was live.** `refusals.anchored: 373` is the single most
    informative field in this run: it says the column reached my works, that my placement was
    load-bearing, and that `relocations: 0` was a choice rather than an absence. When a mechanic's success
    looks like nothing happening, find the counter that increments when it *nearly* happens.
  - **Sixteenth contract, and the securing tune is the attempt.** Third generation running where a tune
    secured and the rules end the ride there; copying the securing tape to `attempt-1-tape.json` and
    saying plainly in the outcome file that it is one ride under two filenames is the honest way to satisfy
    both the path convention and the stop rule. Do not re-ride for a tidier filename.
  - **Write the outcome file after every run, before the analysis.** Fourteenth generation saying it,
    eleventh actually doing it — the runner writes `gauntlet-outcome.json` on every child exit, so a
    truthful row existed from the idle probe onward, and the only hand edit was to name the promoted tape
    and record the envelope measurement (exactly the check gen 23 warned about: the comparator does not
    know which run you have chosen to *call* your scored attempt).

## generation 31 — 2026-09-04T04:08:10.566Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04 · contracts: e7-echo-canyon
cost: wallClock 432s · setupToFirstOutput 75s · tokens in 114 / out 61667 (+cache read 10287250) over 57 turns, 36 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w20 / 600.000s / 295g / calls 73 · runs 2 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:a525ade1, ranked, POST rank 1 — FIRST SECURE for e7-echo-canyon. Secured w20/295g; durationTicks 18000, last order t=17905.
- Winnability (rider, verbatim): Secured, and the margin was **wide and never once thin**: the hero sat at its full running maximum for the first eighteen waves (100/100 through wave 5, then 175/175 from wave 8 to wave 18) and lost its only 16 hit points at wave 19 to finish **159/175**, **0 of 10 works were ever wrecked** across 908 kills, `goldStolen` was 0, and gold pinned at the 200 cap from wave 12 with the ladder finished at wave 10 — health, defence and money all had spare capacity simultaneously, and the only thing that could plausibly lose this contract is not checking the reel envelope.
- What the map asked (rider, verbatim): It asked me **nothing about its era's signature mechanic, and the county's PARTIAL audit is exactly right — but this contract is the most legible version of that finding I have ridden.** E7 is playbooks and the Echo, and Echo Canyon publishes its half of that squarely: `now.broadcastMirror` is present in **all 75 views of the secured run and is byte-identical in every one of them** — `{"declared":true,"delay":"next-wave","recordedUses":0,"distinctPlaybooks":0, "maxRepeat":0,"pending":[],"squadsFielded":0,"bodiesFielded":0,"lastFieldedWave":null, "capPerWave":3,"hpPerRepeat":0.1,"refusals":{"cappedSquads":0}}`. Those zeros can never be anything else, and `mechanics.rules.broadcast_mirror` says why in its own words: the mirror is `recordedOn: "a playbook USE (a replay that starts); recording a tape records nothing"`, and **the public grammar has no playbook verb** — no record, no replay, no drone body — so `recordedUses` is pinned at 0 and no corrupted squad is ever fielded. The whole teaching intent ("vary your own patterns; your habits have a shadow") is therefore unreachable through the door: the consequence clause, the `squadSize`-from-tape-length echo, the `wrecker if the tape built / thief otherwise` corruption rule, the 10%-per-repeat heaviness — all fully specified, all inert. `broadcastMirrorZones` covers the entire playable board and `mechanics.interactables` is empty. This is the same class as my E2 pressure findings (generations 8–10) but published honestly rather than merely advertised, which is the version worth keeping: like `e7-dead-band`'s `signalSuppression`, a visible row of permanent zeros told me in one probe what E2 took me three generations of grepping consumers to work out. What actually decided the contract was ordinary survival geometry, and one subtraction: `canyon-floor-yard` reaches to z = 10, **2 wu** from a hero welded at (0, 12), so four turrets on the z ≈ 9–10 line at x ∈ {0, ±10} cover both canyon mouths and the claim itself. That is the precise inverse of `e7-relay-valley`, where the same E7 fiction put every build zone on the relay ridge 31.24 wu away and made the map unfortifiable; here the era's geography is generous and the run never took a scratch until wave 19. The fields that carried it were the plainest ones — `now.works.byKind`/`entries` (ladder state and placement), `now.seams[].active/x/z` (income; ids re-anchor between waves, and only two of the four anchors sit within 23 wu of the claim), `now.gold`, `now.hero.hp/maxHp/level`, `now.threats.alive` (peaked at 40, never near the published 60 cap) and `now.pendingOffer`/`now.pendingSecure` — and the orders were `BUILD`, `HARVEST`, `PICK_UPGRADE` and one blank line. Not one E7 verb, because E7 has none.
- Lessons (rider, verbatim):
  - **`unclaimed` with no `reason` in `winnability-receipts.json` is seventeen-for-seventeen.**
    Still the first two lines of JSON I read, still the cheapest information in the county, still
    never wrong.
  - **The blank-line secure is now proven on a second contract, and it should be standing
    equipment on every `secureWave`-silent map.** Generation 27 found it on `e7-dead-band`; here
    it worked first try, unmodified: `durationTicks` 18,000 against an 18,000 ceiling, last entry
    at tick 17,905, `defaultedSecure: 1` and nothing else moved. The rule is mechanical — *if the
    manifest omits `twist.secureWave`, answer `now.pendingSecure` with a blank line, never with
    `SECURE_CHOICE`.* That one line of controller is the difference between generation 24/25's
    refused first-secures and a ranked one.
  - **Check the four admissibility numbers off the tape the moment the run ends, before writing
    anything else.** `durationTicks`, `lastEntryTick < durationTicks`, entry count, byte size.
    It took ninety seconds and it is the check that three of my generations learned the expensive
    way. Securing and producing a submittable reel are still different achievements.
  - **Two E7 contracts, opposite verdicts, and the difference was one subtraction I can do from
    the manifest.** `min |claim − buildZone|` against turret range 16: relay-valley 31.24 (no
    pocket, unfortifiable, not secured), echo-canyon **2.0** (pocket, secured on the first
    controller at full health). Generation 26 wrote that the null case *is* the finding; the
    positive case is just as decisive and just as cheap. **Do that subtraction before the idle
    probe on every map, and let it choose the whole plan.**
  - **Read the roster's flags for what they exclude — second E7 map running.** Neither
    `rogue_automaton` nor `data_rustler` carries `wrecker: true`, and `data_rustler`'s
    `thief: true` makes `Enemy.ts:624` force `wrecker = false` anyway. So no work on this board
    can be attacked: `works.wrecked` was 0 at all 75 views, `goldStolen` finished at 0, and every
    `REPAIR_UNDER` slot I might have carried would have been dead weight. Two minutes in
    `Balance.e7Roster` deleted a whole order class from the design.
  - **The generation 6→27 skeleton secured this on its first ride with zero tuning, for the second
    contract running.** `PICK_UPGRADE` first under replace semantics; one ladder as a
    non-decreasing price prefix; more candidate positions than slots with a stall blacklist; a
    plating-first scorer; the tail stacked with `HARVEST` on the nearest live seam. Ten builds,
    zero refusals, `goldPanned` 870, `maxHp` 100 → 175. **Stop treating it as a starting point to
    re-derive and start treating it as the default opening**; the heat's real work is finding the
    one thing the board does differently, and on an ordinary-survival board the honest answer is
    sometimes "nothing".
  - **A published mechanic with permanently constant fields is a finding you can make in one
    probe, and it is worth making explicitly.** `now.broadcastMirror` was byte-identical across
    all 75 views. I did not have to grep a consumer, guess, or ride a control: `recordedUses: 0`
    in view 0 plus `recordedOn: "a playbook USE"` in `mechanics.rules` plus the absence of a
    playbook verb in the grammar is a complete proof that the era's lever cannot move. **Diff the
    era socket across the whole view log — one line of code, and it settles PARTIAL/RESKIN
    questions better than any amount of source reading.**
  - **`engineDependencies: "missing"` was right again, and the running score is now three right
    to four wrong.** Echo Canyon declares `broadcast-mirror-consumer: "missing"` and it is
    accurate — the mirror publishes but fields nothing. It remains a comment to confirm against
    `now`'s keys in one idle probe, never a fact to plan on in either direction.
  - **The stop rule leaves room for exactly one receipt, and it is the local assay.**
    `scripts/assay-replay-agent.mjs` reproduced the promoted reel's `fnv1a32:a525ade1` and all
    four outcome fields without riding anything. Second generation doing this instead of a
    re-ride; in an era that replays every reel it is strictly better than a second ride, because
    it proves the *submitted bytes* rather than a sibling of them.
  - **Write the outcome file after every run, before the analysis.** Fourteenth generation saying
    it, eleventh actually doing it — the runner wrote `gauntlet-outcome.json` on the idle probe's
    exit and again on the secure. And the generation 23/24 caveat bit for the third time exactly
    as predicted: a best-so-far comparator cannot know which run you have chosen to *call* your
    scored attempt, or that the promoted tape lives under a different filename. **I hand-wrote the
    final row. Check the file says what you mean.**

## generation 33 — 2026-09-04T04:22:02.306Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04 · contracts: e7-relay-rush
cost: wallClock 502s · setupToFirstOutput 60s · tokens in 100 / out 67454 (+cache read 9235773) over 50 turns, 28 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w20 / 600.000s / 200g / calls 68 · runs 2 · scored attempts 1 · worldModel sim-import. Door: REFUSED reel_duration_exceeded — SECURED w20/200g in the sim, durationTicks 18001 with the last order on tick 18000 (the F-HEAT11-1 terminal-tick case, exactly as predicted). Third measured instance of the terminal-tick refusal, and the first one PREDICTED before submission.
- Winnability (rider, verbatim): Secured, and the margin was **as wide as this contract can be measured — while the door envelope is the thing that is thin**: the hero **never dropped below 100, its running maximum, across all 69 views**, finishing 175/175; **zero of ten works were ever wrecked**; the deadline latched with all **four** sites lit against a target of three, 122 seconds early; gold was capped from wave 11 — health, defence, objective and money all had spare capacity at once. The one thing with no margin at all is the reel: `e7-relay-rush` declares no `twist.secureWave`, so `PlaybookFormat.runTapeEnvelopeForContract` computes its `+2` inclusive-endpoint slack only inside `if (twist?.secureWave)` and hands this contract a flat `MAX_PLAYBOOK_TICKS = 18000`; the secure lands at wave 20 = t 600.000s = tick 18000, `gr-sim` records the `SECURE_CHOICE` there, and `durationTicks = lastEntryTick + 1 = 18001`. **No rider policy can avoid that** — there is no earlier secure window, riding shorter forfeits the run, and a rejected non-`SECURE_CHOICE` array at the boundary cannot buy a cheaper tick. This is the same envelope defect that refused generations 24 and 25, now confirmed on a third contract and a third epoch; the fix is one `if` in `PlaybookFormat.ts`, not a change to the map, the grammar or the economy.
- What the map asked (rider, verbatim): It asked me about **the interference front**, squarely and expensively, and **the county's RESKIN measurement of this contract is out of date on this build**: E7's front is composed headless, fully published, and it *gates the secure*. `InterferenceFrontSystem` is the whole consumer — schedule, mute, relay lighting and objective latch — and `HeadlessContractSim:1119` ANDs `interferenceFront.objectiveAllowsSecure` into `autoSecureWaveForRun`, so a run that misses the deadline is unsecurable at *every* later wave. The rule reads in `now`, no source import needed: a wall of static crosses west→east every `cadenceSeconds: 90` over `crossingSeconds: 20` with `halfWidth: 6`, and **three of the four relay sites must carry a standing turret or sentry beacon at the instant the third front arrives — t = 270.000s exactly**, sampled once and latched either way. That is a genuine "expand under deadline" problem, because the four sites are strung along a 100wu ridge (r1 x −50..−40, r2 −30..−20, r3 20..30, r4 40..50) while the hero is welded to the stake at (−25,41) and the single order actor — the Prospector — must pan, build and walk with the same feet. The lit set is *live state, not a latch*: a wrecked light goes dark and the deadline reads whatever stands, which is why I bought a fourth light at t=148 as insurance for a deadline 122 seconds away. The map's one kindness is that the claim sits **inside** relay-site-r2, so the fort lights a site for free and the errand is two walks (20wu and 50wu) rather than three. View fields that carried it: `now.interferenceFront.{sites[].lit/litBy/muted, litCount, frontsArrived, secondsToNextFront, deadlineFront, relayTarget, deadlineResolved, litAtDeadline, objectiveMet, phase, centerX}`, plus `now.works.entries` (position + family — the only way to see which rung landed and which refused), `now.works.byKind`, `now.seams[].active/x/z`, `now.gold`, `now.hero.hp/maxHp`, `now.threats.alive`, `now.pendingOffer`/`now.pendingSecure`. Orders: `BUILD`, `HARVEST`, `REPAIR_UNDER`, `PICK_UPGRADE`, one `SECURE_CHOICE`. **There is no E7 verb** — the front is answered entirely with epoch-1 grammar, and that is fine: it is a *placement* mechanic, not an action one. Two honest qualifiers. First, the mute itself was nearly inert for me: the band is 12wu wide moving at 6wu/s, so it stands over any one turret for about two seconds every ninety, and `mutedWorkSteps` never cost me a wave. The front is a *deadline* here, not an adversary. Second, once the latch closed at t=270 the remaining eleven waves were ordinary stationary survival at the 200-gold cap with `threats.alive` pinned at its 60-enemy ceiling and nothing left to decide — the reasoning is front-loaded into the first 150 seconds. Call it **half a contract of real E7 and half a hold.**
- Lessons (rider, verbatim):
  - **`unclaimed` with no `reason` in `winnability-receipts.json` is seventeen-for-seventeen.** Still
    the first two lines of JSON I read; still never wrong.
  - **A silent `twist.secureWave` is now a *two*-sided tell, and I should read it as both at once.**
    Generation 24 learned side one: the gate falls through to `Balance.run.secureWave = 20`, so a thin
    manifest means a 600-second contract, not a 360-second one. Side two, which cost gens 24/25 their
    reels and costs this one too: that same silence skips the `+2` envelope slack in
    `runTapeEnvelopeForContract`, so **any** secure of such a contract reports `durationTicks 18001`
    against `18000` and is inadmissible however it is played. **Check the envelope before choosing the
    contract's plan, and say so in the outcome file rather than letting the operator discover it at the
    door.**
  - **`engineDependencies: "missing"` is now wrong five times in seven era rides** (E5 deepwater-claim,
    E5 regatta, E6 glow-mesa, E8 mare-claim, E7 relay-rush) against two right (E4 long-road, E10
    last-claim). Here it disclaims `interference-front-consumer` while `InterferenceFrontSystem` runs
    headless, publishes a fifteen-field diagnostics block in `now`, **and gates the secure**. One idle
    probe settles it in ten seconds; give a "missing" that contradicts a live `now` key zero weight.
  - **When the era's mechanic is a placement deadline, buy one more than the target.** The lit set is
    live state, not a latch (`readSites` re-reads every step), so a wrecked light un-lights its site and
    the deadline reads whatever stands at that instant. A fourth beacon at 45 gold insured a one-way
    latch worth the whole contract. Ask of any latched objective: *is the quantity it samples a latch
    or a live count?* — and if it is live, over-buy.
  - **The audit's RESKIN label is a measurement of the build it was taken on, and the idle probe is
    why it looked like one.** Idle died at t=81.3, nine seconds before the first front at t=90 — so the
    mechanic was never *reached*, not absent. An audit that samples only the idle ride cannot see a
    mechanic whose first event is at t=90. Generation 15 learned that a stale audit is settled by one
    probe of `now`; the sharper version is **check whether the audit's evidence could physically have
    reached the mechanic's first event.**
  - **Put the claim's own zone in the ladder first and get a light for free.** The stake at (−25,41)
    sits inside `relay-site-r2`, so the fort's first turret discharged a third of the objective at
    t=26 with no walk. `stakeMarkers × buildZones × objectiveSites` is the same intersection move that
    found the Incline's pocket — now solved for an *objective* rather than a defence.
  - **One BUILD trip in flight, re-issued verbatim until `works.entries` shows it standing.** Gen-13's
    "a stack of gold-gated BUILDs is a commute generator" and gen-28's plan-time affordability compose
    into one rule that needs no suffix arithmetic: emit the *next unbuilt* rung only when
    `gold >= cost` right now, re-issue it each view, and let `works.entries` (not your own counter)
    retire it. Ten rungs, ten first-try landings, across 50wu and 70wu errands.
  - **Give every rung a patience budget.** The eight palisade rungs I appended sat outside every build
    zone and refused forever; a six-attempt skip stepped past all of them without stalling the ladder,
    which is exactly the failure that cost me the Trestle in generation 10. Carrying junk at the tail
    of a ladder is free when the ladder can skip.
  - **A wave-2 idle death still means nothing.** Twelfth map running: idle died at 81s and the first
    controller rode the same seed to 600s at full health. But this time the idle probe earned its keep
    in a different way — it published the entire `interferenceFront` block in view 0, including the
    cadence, the target, the deadline ordinal and all four site rectangles. **Read the idle probe for
    the mechanic's published constants, not for the difficulty curve.**
  - **Write the outcome file after every run, before the analysis.** Fourteenth generation saying it,
    eleventh doing it — and this ride added a field I have wanted for three generations: a `doorRisk`
    block naming the refusal I expect and the line of code that causes it, so the operator reads it
    from the file rather than from the door.

## generation 32 — 2026-09-04T04:24:22.400Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04 · contracts: e9-dome-basin
cost: wallClock 667s · setupToFirstOutput 90s · tokens in 132 / out 120455 (+cache read 12601548) over 66 turns, 36 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): NOT SECURED — w13 / 407.000s / 33g / calls 141 · runs 4 · scored attempts 0 · worldModel sim-import. Door: not secured, nothing put forward. 4 runs, best w13/33g.
- Winnability (rider, verbatim): **Undecided-leaning-YES on the map and NO at the door, and what stopped me was my own budget:** the map's geometry is hard but tractable — the hero is welded to a claim no buildable can reach (nearest legal ground 28.3 wu against turret range 16), and the claim is itself the nearest building to every spawn so a distant fort baits nothing (tune-1: `works.wrecked = 0` all run) while a two-sided bait starves the economy that pays for it (tune-2: `goldPanned` frozen at 150 from t=110) — but the synthesis of those two measurements, an **east-rim-only** fort that baits the east lane while keeping the 20 wu seam commute, took the same seed from wave 5 to **wave 13 / 407.0 s / 506 kills on its first ride**, and I hit the wall one run later with the curve still rising and the obvious next levers (`SET_WEAPON blast` against a scrum piled on a fixed hero, repair/rebuild of the bait, turret tier upgrades on a 3.4 g/s economy) untested; **even so, a wave-20 secure here would be refused at the door as `reel_duration_exceeded`, because this manifest declares no `twist.secureWave` and a wave-20 bank reports `durationTicks` 18 001 against a flat 18 000-tick envelope — so the L2 answer is "winnable in the map, unsubmittable through the door."** The superseded reading, kept for the record: the hero is welded to a claim that no buildable can reach (nearest legal ground 28.3 wu against turret range 16), the claim is itself the nearest building to every spawn so a distant fort baits nothing (tune-1: `works.wrecked = 0` for the whole run) while a fort placed close enough to bait sits 65 wu from the only seams and starves the economy that pays for it (tune-2: `goldPanned` frozen at 150 from t=110), and both lines died at wave 5 of 20 with the hero taking 100+ damage in the last 40 seconds — **and even a secure would be refused at the door as `reel_duration_exceeded`, because this manifest declares no `twist.secureWave` and a wave-20 bank reports `durationTicks` 18 001 against a flat 18 000-tick envelope.** Honest caveats: I did not test `SET_WEAPON blast` (AoE against a scrum piled on a fixed hero is the one untried lever with real upside), nor an east-rim-only fort that keeps the 20 wu seam commute while still baiting the east lane, and my whole heat ran to three runs — so this is a strong prior about difficulty, not a proof of impossibility.
- What the map asked (rider, verbatim): It asked me nothing about E9 persistent tiles, and the county's **RESKIN** measurement is right — sharply so, because the engine *has* the consumer and this contract declines it. `CanalChoiceSystem` is real, live headless, and gates the secure through `autoSecureWaveForRun` (`HeadlessContractSim.ts:1114`: `this.canalChoices !== null && !this.canalChoices.objectiveAllowsSecure`), with `CONTEXT_ACTION redig`/`backfill` wired as public verbs — but it is keyed on `twist.persistentCanalChoices`, and **this manifest declares no twist but an enemy roster**. So the three canal stage-gates C1 (−28,34), C2 (−12,10) and C3 (4,−24) that the briefing tells me to defend, the feeder-canal rail through them, the ice quarry, the dust-devil patrol lane and the height-four scarp are all `tileParams` scenery: none of them appears in `now`, none has a verb, and the only persistent thing on the board is the pathing. What the map actually asked was a pure geometry question with a harsh answer: **where can you build, relative to the body you must keep alive?** The fields that carried both controllers were `now.works.entries` (positions, `hp`, `wrecked` — the only way to see that a fort was being ignored), `now.works.byKind`, `now.seams[].active/x/z`, `now.gold`, `now.hero.hp/maxHp/level`, `now.threats.alive/wreckers/thieves` and `now.pendingOffer`; the orders were `BUILD`, `HARVEST`, `REPAIR_UNDER` and `PICK_UPGRADE` — epoch-1 grammar throughout, because E9 offers this contract no verb at all.
- Lessons (rider, verbatim):
  - **`unclaimed` with no `reason` in `winnability-receipts.json` is seventeen-for-seventeen** — and
    seventeen times running it has told me about the *standings*, never about the map. It was a green
    light here for a contract I could not win.
  - **Check the envelope BEFORE choosing a strategy, not after the door refuses.** Generation 26
    named the line and generation 29 warned about it; this is the first time I read
    `PlaybookFormat.ts:63` at minute five instead of minute twenty. A `secureWave`-silent manifest is
    the tell, and on this door it means a 600-second ride whose secure is inadmissible however it is
    played. That single read changes what a scored attempt is *for*.
  - **`nearestBuilding` counts the claim.** Generation 13 taught me "your own walls are somebody
    else's armour" and generation 28 taught me an era can override the target function; the missing
    middle is that on an ordinary map the **claim is already a building**, so a bait only baits when
    it is nearer to the spawn edge than the claim is. My seam fort was 45 wu out, every spawn edge
    was nearer the claim, and `works.wrecked` sat at 0 for an entire run while I paid 500 gold for it.
    **Measure a bait by `works.wrecked`, not by hope** — a fort nothing attacks is a fort doing nothing.
  - **Compute `distance(defended point, nearest legal build ground)` against weapon range as the very
    first arithmetic on any map.** 28.3 wu against a 16 wu turret and an 8 wu beacon decided this
    contract before I wrote an order. Generation 18 hit the same shape on the Long Road and solved it
    by finding which distant box sat on the enemies' line; here both boxes that sit on a line are the
    wrong distance from the money.
  - **Bait and economy can be mutually exclusive, and that trade is the contract.** v1 had the perfect
    economy (3.4 g/s, seams inside their own build zone) and a fort nothing attacked; v2 had a fort
    that pulled every west/east wrecker and an economy frozen at 150 gold by the 65 wu commute between
    them. When the two sites are far apart and one body serves both, price the fort in *panning
    seconds*, not gold — and prefer the site whose commute is short even if its coverage is worse.
  - **Run the synthesis before you are sure — it was worth 8 waves and I nearly never fired it.**
    v1 and v2 were a clean pair of one-variable experiments (perfect economy / useless fort, working
    bait / dead economy) and the answer they jointly implied — bait only the lane whose build ground
    is *near the money* — took the same seed from wave 5 to wave 13 on its first ride, a one-line
    edit made with two minutes left. Generation 13 wrote "one attempt per competing explanation";
    the missing half is **budget a slot for the explanation that combines them**, and fire it early,
    because a pair of well-documented failures is worth less than one untested combination.
  - **Three runs is not a heat.** I spent the first third of the wall on source reading that was
    genuinely load-bearing (the envelope, the roster's wrecker flag, `isBuildable`'s zone rule, the
    absent canal socket) and it left one run per hypothesis with nothing for the synthesis both runs
    pointed at. Generation 10 wrote "budget the source read against the wall"; the sharper version is
    **reserve the last third for the run that combines what the earlier runs proved**, and start it
    before you are sure, because an untested synthesis beats a well-documented pair of failures.
  - **A `--policy idle` death at wave 2 still told me nothing about difficulty** (twelfth map running)
    — but its *inventory* did again: `gold: 0` with three live seams 45 wu away named the commute as
    the map's central fact in ten seconds.

## generation 34 — 2026-09-04T04:31:05.915Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 49c34f8bba3d61e003d1f421398e3835e3107945f396800fa124f946b2e4b2f9 · contracts: e8-far-side
cost: wallClock 433s · setupToFirstOutput 60s · tokens in 102 / out 78311 (+cache read 9397867) over 51 turns, 24 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w20 / 600.000s / 200g / calls 67 · runs 2 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:897c3f10, ranked — FIRST SECURE for e8-far-side. Arena B. durationTicks 18000 with the last order at t=17732 — cleared the envelope.
- Winnability (rider, verbatim): Secured, and the margin was **wide**: the hero bottomed at 64/100 in wave 4 *before* the plating picks landed and finished **137/175** with gold pinned at the 200 cap, **zero of eighteen works ever wrecked** across 921 kills, and `threats.alive` peaked at 32 against a published 60 cap — the errand latched twelve waves before the gate, and the only thing that could plausibly lose this contract is leaving the probe buried or answering the secure boundary with an order instead of a blank line.
- What the map asked (rider, verbatim): It asked me for **a walk**, and the county's RESKIN measurement is right about the era while being incomplete about the contract. E8's signature mechanic is *low gravity, air as wall* — and **air is not the wall here**: the manifest declares `atmosphere.airIsWall: false`, so `now.air` is simply absent from all 69 views. There is no suit, no dome dial, no `regolith` gate; the whole apparatus that made `e8-mare-claim` an E8 map is switched off by one boolean. What *is* published is `now.gravity` — `feelG 0.6`, `movement: "floaty"`, `lobArcDistanceMultiplier`/`lobAirTimeMultiplier` 2.4, `knockbackScale` 1.3, `vacuum: true` — and it is **decorative for a rider who stands still**: I traced the movement site (`HeadlessContractSim.ts:1627`) and the Prospector's step is multiplied only by the deepwater race system's factor, never by gravity, so 0.6 g bought me nothing and cost me nothing. The 2.4× lob is real but I declined it on my generation-29 measurement that blast is ~10 dps against the Spark Rig's 24; I issued no `BLAST_AT` and no `SET_WEAPON`. So the era's named lever is genuinely absent, and the audit note's replacement pair is what the map actually runs. `now.signalSuppression` is live (`declared: true, drones: true, playbooks: true`) and is a pure *subtraction*: the door has no drone or playbook verb to suppress, so it publishes a permanent constant — I diffed it across all 69 views and it never changed. That is the same shape as generation 31's `broadcastMirror`, and it is the honest version of the finding: a legible row of unchanging fields, provable in one probe rather than three generations of grepping consumers. **`now.probeRecovery` is the contract**, and it is load-bearing in the strictest sense — not a score decision but a gate that refuses a secure at any wave. It publishes `declared`, `trigger`, `zones`, `recovered`, `recoveredZoneId`, `playedFragment`, `playbackCount` and split `refusals`, and the crater is a rectangle (x −14..14, z 38..52) with 2.2 wu of slack. Because the stake is at (0,−36) and the crater's near edge is at z = 38, the errand is a **76-unit walk each way into the north spawn edge** — the single spatial question the map asks, and the reason its teaching intent is "homesickness by subtraction." The fields that carried it were `now.probeRecovery.recovered`, `now.prospector`, `now.works.byKind`/`entries`, `now.seams[].active/x/z`, `now.gold`, `now.hero.hp/maxHp` and `now.pendingOffer`; the orders were `MOVE_TO`, `HOLD`, **`CONTEXT_ACTION recover`**, `BUILD`, `HARVEST`, `PICK_UPGRADE`, and one blank line. Honest qualifier: once the probe was up at wave 8, the remaining twelve waves were ordinary stationary survival in a generous pocket.
- Lessons (rider, verbatim):
  - **`unclaimed` with no `reason` in `winnability-receipts.json` is eighteen-for-eighteen.** Still the first two lines of JSON I read, still the cheapest information in the county, still never wrong.
  - **Read the atmosphere boolean before planning the era.** `e8-mare-claim` (generation 29) made me do suit arithmetic and a regolith gate; the Far Side declares `atmosphere.airIsWall: false` and `now.air` is *absent from every view*. One manifest field turns E8's signature mechanic off completely. **An epoch is not a mechanic — the contract's own flags are, and two contracts in the same epoch can be different games.**
  - **A `secureWave`-silent manifest is a three-part tell, and this is the first ride where I read all three before writing an order.** It means wave 20 / 600 s (gens 24/25), the flat 18 000-tick envelope (gen 26/30), *and* — new here — that the reel stays admissible for free provided the last order lands before the terminal tick. Blank-lining the secure boundary gave `durationTicks 18 000` with the last entry at **17 732**, 268 ticks of slack. Third contract running for the blank line; it is standing equipment now.
  - **The gate that is not in `autoSecureWaveForRun` can still be the contract.** Here it is one clause at `HeadlessContractSim.ts:1188` — `|| !this.probeRecovery.objectiveAllowsSecure` — and `ProbeRecovery.objectiveAllowsSecure` is `!declared || recovered`. Generation 12 said "enumerate every clause"; this ride adds that the clauses live in *two* files, and the era system's own header comment (`ProbeRecovery.ts:16-23`) names the casualty of getting it wrong (F-1471-1: a Baron kill that silently failed to secure). Fourth time the era system's comment block handed me the contract.
  - **`CONTEXT_ACTION` reads the Prospector's position and does not travel, so a targetless action is a TWO-VIEW manoeuvre.** `MOVE_TO`+`HOLD` on the crater at one view, `recover` first in the array at the next, having *verified the position from the view* rather than trusting my own clock. Generation 29 learned the non-travel half on `upgrade`; the general pattern is: park, confirm from the view, then act.
  - **Do the errand when the fort stands, not when the board is quiet.** Generation 15 said "spend the quiet on the errand"; generation 18 corrected it to "order the errand against the hero's HP curve." On a map where the hero is welded to the stake and the errand costs the worker two full waves, waiting for the fourth turret was right: I crossed at wave 7, the hero held alone at ~90 HP, and the ladder had already finished. **The scarce resource is whichever of {quiet board, worker's time, standing defence} the map takes first — read it, do not carry a rule.**
  - **`threats.wreckers: 0` in the idle probe is a whole order class deleted.** No wrecker means no work can be attacked: `works.wrecked` was 0 at all 69 views, and every `REPAIR_UNDER` slot I might have carried would have been dead weight. Second map running (gen 31 was the first) where two minutes on the roster's flags removed an order from the design. **Read the roster for what it EXCLUDES.**
  - **The generation 6→31 skeleton secured this on its first ride, for the third contract running.** `PICK_UPGRADE` first under replace semantics; a plan-time-affordable, suffix-gated, non-decreasing ladder; more candidates than slots with in-batch spot reservation; a plating-first scorer; the tail stacked on the nearest live seam. Eighteen builds, zero refusals, maxHp 100 → 175. It is the default opening, not a starting point to re-derive — the heat's real work is finding the one thing the board does differently, and here that was a 76-unit walk.
  - **A permanently-constant era field is a finding you can make in one probe.** `now.signalSuppression` was byte-identical across all 69 views because the door has no drone or playbook verb to suppress. Diff the era socket across the whole view log — one line of code, and it settles PARTIAL/RESKIN questions better than any amount of source reading. (Gen 31 on `broadcastMirror`; now twice.)
  - **`engineDependencies: "missing"` is wrong for the sixth time in eight era rides** (E5 ×3, E6, E8 mare-claim, E8 far-side) against three right (E4 long-road, E7 echo-canyon, E10 last-claim). Here it disclaims "probe recovery, playback, and atmosphere-wall consumers" while `ProbeRecovery` is constructed at `:806`, gates the secure at `:1188`, publishes at `:1669` and executes at `:2484`. Give a "missing" that contradicts a live `now` key exactly zero weight.
  - **The stop rule leaves room for exactly one receipt, and it is the local assay.** Third generation doing this instead of a re-ride: `scripts/assay-replay-agent.mjs` reproduced the promoted reel's own `fnv1a32:897c3f10` without riding anything. Note the trap my generation-4 self already recorded and I nearly re-tripped: **the replay hash matches the TAPE's, not the stdout outcome line's** (`83f63093`) — they are different numbers by design, and a rider who compares the wrong pair will report a false mismatch on a perfectly good reel.
  - **Write the outcome file after every run, before the analysis.** Fifteenth generation saying it, twelfth actually doing it — the runner wrote `gauntlet-outcome.json` on child exit. And the generation-23/24/30/31 caveat bit for the fourth time exactly as predicted: a best-so-far comparator cannot know which run you have chosen to *call* your scored attempt, or that the promoted tape lives under a second filename. **I hand-wrote the final row. Check the file says what you mean.**

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

## generation 36 — 2026-09-04T04:50:23.991Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 49c34f8bba3d61e003d1f421398e3835e3107945f396800fa124f946b2e4b2f9 · contracts: e8-eclipse
cost: wallClock 515s · setupToFirstOutput 75s · tokens in 128 / out 85333 (+cache read 12206583) over 64 turns, 36 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w20 / 600.000s / 60g / calls 87 · runs 2 · scored attempts 1 · worldModel sim-import. Door: verified — FIRST SECURE for e8-eclipse. Arena B; secured w20/60g; durationTicks 18000 with the last order at t=17889 — cleared the envelope.
- Winnability (rider, verbatim): Secured, and the margin was **wide**: the hero held its full running maximum until t ≈ 450 and bottomed at **77.4 / 175** in the last nine seconds, all ten works stood untouched at the bank, `threats.alive` peaked at 37 of a 60 cap, and 1 330 gold panned covered the entire ladder plus four tier-2 turrets — health, defence and money all had spare capacity at once, and the only thing that could plausibly lose this contract is answering the secure boundary with an order instead of a blank line.
- What the map asked (rider, verbatim): It asked me **nothing about its era's signature mechanic, and the county's RESKIN measurement is exactly right — twice over, because on this contract even the E8 *air* wall is gone too.** The ladder names E8 as "low gravity, air as wall (transfer under changed physics)". Air is not a wall here: the manifest declares `tileParams.atmosphere.airIsWall: true` and `outsideDomes: "suit-timer"`, and the view publishes **no `now.air` at all** — I dumped the union of `now` keys across all 89 views of the secured run and it is `wave · blastReadyInMs · weapon · gravity · timers · gold · hero · prospector · works · threats · orders · needsRider · seams · score` (+ `pendingOffer`/`expiresAtSimMs`/`pendingSecure`). No suit, no domes, no regolith, so no secure gate and no reason to walk anyone to a dome pad. That is a *regression from its own sibling*: `e8-mare-claim` (generation 29) publishes the whole `now.air` block and refuses `pendingSecure` until `regolith.complete`. Same terrain, same tile id, and the atmosphere consumer reaches one and not the other. The eclipse itself is inert in the same way, and honestly so: `twist.eclipseEvent` fully specifies a mid-run solar shutdown with `firstRunWarning: false` and a `dark` wave set, `tileParams.eclipseShadowZones` authors a shadow across the whole claim, and `stablePrefix.mechanics.rules` is **empty — zero keys** — while `engineDependencies` says outright that the eclipse, shadow-zone, objective and atmosphere-wall consumers are all missing. Nothing dimmed, no economy shut down, no dark wave arrived; the teaching intent ("reserves are love letters to your future self") has no clock to reserve against. The one era field that *is* live is `now.gravity` (`feelG 0.6`, `movement: "floaty"`, `lobArcDistanceMultiplier`/`lobAirTimeMultiplier` 2.4, `knockbackScale` 1.3, `vacuum: true`) — and after generation 29 measured the 24-metre lob *losing five waves* as an auto-weapon on this same terrain, I used it only as free supplementary damage: one `BLAST_AT (0,16)` per view whenever `blastReadyInMs` was 0, never `SET_WEAPON blast`. What the contract actually asked was a **geometry-and-arithmetic question inherited from the Mare Claim**, and it is a good one. The hero is welded to the claim at (0,12); enemies enter from north, west and east and converge on it; and **every legal square of build ground lies south of it** — the dome-cluster pads end at `z = 6`. So nothing can be built within 6 wu of the body that must survive, and the whole design reduces to two range facts: a turret (range 16) on the `z = 6` line covers the approach out to `z ≈ 21`, while a beacon (range 8) only reaches the hero at all from `|x| ≤ 5.3` on that same line. I put four turrets at (±6,6) and (±2,6) and six beacons inside that narrow strip at (0,±4 / 6) — ten works, zero `out_of_zone`, zero refusals, **zero ever wrecked** (they cannot be). The rest was the free lever: with no wreckers to punish standing still, 1 330 gold panned off a seam 18.9 wu out funded the full ladder *and* all four turrets to tier 2 (150 g each, ×1.4 damage ×1.18 fire rate), paired with an explicit `MOVE_TO` because `CONTEXT_ACTION` does not travel. The fields that carried the run were the plainest ones — `now.works.entries` (position, `tier`, `wrecked`), `now.works.byKind`, `now.seams[].active/x/z`, `now.gold`, `now.hero.hp/maxHp/level`, `now.threats.alive` (peaked at **37** against a 60 cap) and `now.pendingOffer`/`now.pendingSecure`. The orders were `BUILD`, `HARVEST`, `PICK_UPGRADE`, `CONTEXT_ACTION upgrade`, `MOVE_TO`, `BLAST_AT` and one blank line. Not one E8 verb, because E8 has none.
- Lessons (rider, verbatim):
  - **A terrain variant is a different contract, and the differences are in the consumers, not the tiles.**
    `e8-eclipse` and `e8-mare-claim` share a tile id, build zones, harvest anchors and claim — and one
    publishes `now.air` with a secure gate while the other publishes none. Generation 29's map was strictly
    harder for a reason that has nothing to do with the ground. **When a manifest names another map's
    `tileId`, inherit the geometry and re-measure the sockets.**
  - **The `now`-key union is still the cheapest question in the county, and it now answers "is the era
    live" in one probe.** `atmosphere.airIsWall: true` in the manifest, no `now.air` in any of 89 views.
    Generation 8 taught me to grep the view builder; the faster move is to dump `now`'s keys off the idle
    probe and treat the manifest as a wish list.
  - **`stablePrefix.mechanics.rules` with ZERO keys is a complete finding by itself.** Every contract I
    have ridden that had a live era lever published it there. An empty rules object plus an
    `engineDependencies: "missing"` that *matches* the view is the RESKIN verdict, made in ten seconds
    without reading a line of engine source. (Running score on `"missing"`: right on E4 long-road, E10
    last-claim and here; wrong on E5 ×3, E6 glow-mesa, E8 mare-claim. It is a comment to confirm, never a
    fact to plan on — but a "missing" that agrees with `now` is genuinely load-bearing.)
  - **Read the roster for the flags it OMITS, before designing any defence.** Neither `scrap_corsair` nor
    `sun_glare_shambler` is a `wrecker` or a `thief`, so no work could be attacked and no gold stolen:
    `works.wrecked` was 0 at all 89 views and `goldStolen` finished at 0. That deletes `REPAIR_UNDER`,
    deletes palisade chaff, deletes every decoy idea, and makes the fort a monotone investment. Two
    minutes in `Balance.e8Roster` decided the whole shape of the array. Third contract running this has paid.
  - **The secure-wave-silent tell is now a three-part checklist and I ran all three before riding.**
    No `twist.secureWave` means (1) wave 20 / 600 s, not the 12-wave shape I keep assuming, (2) a flat
    18 000-tick envelope, and (3) therefore a **blank line** at `pendingSecure`. `durationTicks` came back
    18 000 with the last order at 17 889. Generations 24 and 25 lost two real first-secures to this; it now
    costs one `if`.
  - **Generation 29's negative result was worth more than a positive one.** It measured, on this exact
    terrain, that `SET_WEAPON blast` costs five waves (≈10 dps against the Spark Rig's 24) and that the
    capped purse's real sink is the tier upgrade. I spent zero time re-testing either and instead used the
    lob only as free supplementary `BLAST_AT` damage while pouring 600 gold into four tier-2 turrets.
    **A sibling generation's dead end is a shortcut; read the notebook for what NOT to ride.**
  - **Verify your receipt instrument against a control before trusting or fearing it.** The local
    `assay-replay-agent.mjs` missed my secured reel's `eventLogHash` and I nearly reported that as a defect
    in my own tape. Replaying the **zero-order idle probe** — a run I could not have influenced — showed the
    same outcome-fields-match/hash-miss at an identical tick count, which localises the fault to the
    instrument in this build. **When a verifier disagrees with you, run it on something that cannot be
    wrong before you believe it about something that can.**
  - **A wave-2 idle death still means nothing.** Twelfth map running: idle died at 81.8 s and the first
    controller rode the same seed to 600.000 s at 77/175 health. What the probe was actually good for was
    the almanac line underneath it — a `continuousTrickle` of 2.061 s, which is the real pressure curve
    and the reason `threats.alive` climbs at all.
  - **Stop at the secure, and promote the tune by name.** Fourth generation running where the first
    controller secured and the rules end the ride there. Copy the securing tape to `attempt-1-tape.json`,
    say plainly in the outcome file that it is one ride under two filenames, and spend the leftover minutes
    on the envelope check and the report — not on a tidier filename.

## generation 26 — 2026-09-04T03:44:39.728Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04 · contracts: e7-relay-valley
cost: wallClock 1138s · setupToFirstOutput 60s · tokens in 210 / out 138264 (+cache read 20669230) over 105 turns, 58 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): NOT SECURED — w4 / 130.800s / 200g / calls 415 · runs 4 · scored attempts 0 · worldModel sim-import. Door: nothing put forward — NOT SECURED (best of 4 runs was w4/200g; the two complete tapes are secured=false). THE RIDE THAT FOUND F-HEAT11-1. It did not secure, but it traced the envelope fencepost from source — runTapeEnvelopeForContract computes its +2 inclusive-endpoint slack only inside if(twist?.secureWave), so a contract without one gets a flat 18000-tick envelope and any secure banked on tick 18000 reports durationTicks 18001 — and separately measured the 160 bytes/entry maxTapeBytes budget against ~4KB/entry for 32-order arrays (its tune-1 hit 1,724,873 bytes after 131 of 600 seconds). The fix shipped 2026-09-04 and three won-but-refused reels were admitted on resubmission.
- Winnability (rider, verbatim): **Undecided-leaning-no, and the wall is in the map's ground, not the grammar, the economy or my budget** — the hero is welded at (0, 12) with 100 max HP while `Terrain.isBuildable` confines every buildable to four relay sites ≥ 31.24 wu away against a 16 wu turret range (measured: a full four-turret, six-beacon ladder moved the outcome by −1.03 s), so the only levers that reach the fight are the free draft and the blast, and against ~1.4 hp/s of contact attrition on a board where the hero already keeps up on kills, the run turns entirely on whether the upgrade draft offers enough `tinkers_plating`/`field_dressing` to fund 600 seconds — which I ran out of wall clock testing (tune-3 was still riding when the wall came); separately and regardless of strategy, a wave-20 secure here produces an 18,001-tick reel against this contract's own 18,000-tick envelope, so even a successful ride is refused `reel_duration_exceeded` until `runTapeEnvelopeForContract` reads `twist.secureWave ?? Balance.run.secureWave`.
- What the map asked (rider, verbatim): It asked me nothing about its era's signature mechanic, and the county's **RESKIN** measurement is exactly right — this is stationary survival wearing E7's name, and unusually literally so. E7 is playbooks and the Echo; the briefing's three goals are "link the four ridge relays by line of sight", "record one patrol and hand it to a drone", "keep the replay inside linked relay coverage". None of that is reachable: the union of `now` keys across every view of every run is `blastReadyInMs · expiresAtSimMs · gold · hero · needsRider · orders · pendingOffer · prospector · score · seams · threats · timers · wave · weapon · works` — **no relay, no line-of-sight, no dead zone, no recording, no playbook, no Echo** — and `mechanics.rules` publishes exactly one entry, `build_zones`. There is no E7 verb in the grammar and `mechanics.interactables` is empty. The authored `patrolRoutes` ("teaching-patrol") and the `heightfield` marked `mode: "visual"` appear in `tileParams` and reach nothing headless. What *is* load-bearing is the E7 geometry's shadow: the four relay sites are the only build zones, and because they are relay sites they sit on the ridge at `z 36–46` rather than anywhere near the claim — so the era's fiction survives as a **map that cannot be fortified**, which is the whole difficulty. The fields that carried my runs were the plain ones: `now.hero.hp/maxHp/level/upgradesTaken`, `now.threats.alive/spawnedTotal/defeatedTotal/ thieves/edge`, `now.seams[].active/x/z`, `now.gold`, `now.works.byKind`, and `now.pendingOffer`; the orders were `PICK_UPGRADE`, `BLAST_AT`, `HARVEST`, `SET_WEAPON` and `BUILD`. Not one of them is an E7 verb, because E7 has none.
- Lessons (rider, verbatim):
  - **`unclaimed` with no `reason` is sixteen-for-sixteen — and it still says nothing about
    the map.** Generation 12 already learned that the receipt encodes an *authoring* wall, never
    an economic one. Add: it encodes nothing about *ground* either. Two new pre-ride checks
    belong beside it, and both are two minutes of arithmetic:
    `min distance(claim, buildZones)` against turret range, and the reel envelope against the
    contract's own run length.
  - **Read `twist.secureWave` for the `??`, and then read the ENVELOPE for the same `??`.**
    Generation 25 learned that a silent `secureWave` means 20 waves, not 12. The sharper and
    more expensive version: `runTapeEnvelopeForContract` does *not* apply that same default, so
    a silent `secureWave` gives you a 20-wave run inside an 18,000-tick envelope and your secure
    is refused by exactly one tick. That is the identical refusal generations 24 and 25 took on
    `e6-picnic` and `e6-half-life-hollow`, and I can now name the whole affected class:
    `e6-showroom`, `e6-half-life-hollow`, `e6-picnic`, and all four E7 contracts. **Three
    generations spent on one missing `??`. Check the envelope before the first order.**
  - **A reel has three ceilings, not one: ticks, entries, and BYTES.** `maxTapeBytes` budgets
    **160 bytes per entry**; my 32-order arrays run ~4 KB. tune-1 was 2.9× over the byte ceiling
    after 131 of 600 seconds. So the stacked-failing-order technique that won generations 23 and
    25 — farm `order_failure` to buy decision points — **is a reel-size bomb on a 20-wave
    contract.** Size the array for the envelope, not just for the tick.
  - **Build the cheapest control that can falsify your plan, and build it second.** tune-2 was
    the full turret/beacon ladder on the only legal ground; it moved the result by one second
    and settled the map's central question for good. One run, total clarity. That is a better
    use of a tune than another point on the same curve.
  - **`threats.alive` staying flat is a diagnosis, not comfort.** Alive held at 4–6 through
    every wave while the hero bled to death. A hero that keeps up on kills and dies anyway is
    telling you the problem is *sustain*, not DPS — so the answer is the plating/dressing side
    of the draft and the ground, never a bigger gun. I spent tune-1 and tune-3 on the draft's
    DPS side before reading my own table.
  - **Do the distance arithmetic before the idle probe, not after.**
    `min |claim − buildZone|` = 31.24 vs turret range 16 was computable from the manifest in
    ninety seconds and it is the entire contract. I ran three controllers to confirm a
    subtraction. Generation 8's "find the pocket" has a null case, and **the null case is the
    finding** — when no pocket exists, say so immediately and spend the wall proving the
    survival ceiling instead of re-testing the ground.
  - **Budget the wall in runs, not in minutes.** tune-3 was the run that would have answered
    the live question and I launched it at minute 18 of 25, having spent minutes 11–17 on two
    runs that were each answering something I could have derived. Launch the long
    uncertainty-reducing ride *first* and analyse while it burns.
  - **Write the outcome file after every run, before the analysis.** Thirteenth generation
    saying it, tenth actually doing it — the runner wrote `gauntlet-outcome.json` on every child
    exit, so a truthful row existed on disk from the idle probe onward and the report was
    finished before the wall rather than at it.

## generation 27 — 2026-09-04T03:38:02.222Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04 · contracts: e7-dead-band
cost: wallClock 716s · setupToFirstOutput 120s · tokens in 164 / out 99434 (+cache read 15141256) over 82 turns, 48 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w20 / 600.000s / 380g / calls 79 · runs 3 · scored attempts 1 · worldModel sim-import. Door: SECURED w20/380g — submitted late, see below. tune-2 was promoted BY NAME as the scored attempt (durationTicks 18000, last order t=17602 — admissible even under the old envelope) precisely because the rig had computed that tune-1 at 18001 was not. The rig was right and did everything correctly; the OPERATOR then failed to submit it, because its collector only recognised tapes named attempt-N-tape.json and did not read the outcome file's own tape field. Submitted on 2026-09-05 after a re-audit that used the rig's declaration as the authority.
- Winnability (rider, verbatim): Secured, and the margin was **wide for fifteen waves and visibly closing at the tape**: the hero held a full 175/175 from wave 7 through wave 15 with all ten works standing and never a scratch on any of them, then lost 122 hit points in the last four waves alone (175 → 149 → 98 → **53.4/175** at the wave-20 boundary) as `threats.alive` climbed to 27 — a wave-22 secure on this line would have been a coin flip, and the wave-20 gate is what made it comfortable.
- What the map asked (rider, verbatim): It asked me **nothing at all about its era's signature mechanic, and the county's PARTIAL audit is right — but the sharper statement is that E7's playbooks and Echo are not merely absent here, they are unreachable by construction, and the contract's own view says so.** `now.signalSuppression` is present in all 81 views and is byte-identical in every one of them: `{"declared":true,"drones":true,"playbooks":true,"relayChains":true,"refusals":{"drones":0,"playbooks":0,"relayChains":0}}`. Those three zeros can never be anything else, and the engine states why in its own comment (`HeadlessContractSim.ts:509-524`): this sim "constructs exactly one `Hero` (no slot >0, so no drone body), imports no `E7SignalSystem` (so no relay graph exists to link), and `src/agent/` declares no playbook verb." So suppression here is enforced *by construction, not by a switch* — the consumer buys an identical read of the contract and a rider-visible row, not a mechanic. This is the honest inverse of my E2 pressure findings (generations 8-10): there the manifest advertised a subsystem the view could not show; here the view faithfully publishes that there is nothing to show. I would rather have this. The map's other authored signal fixture, `tileParams.signalNullZones` (`dead-band-iron-shadow`, x/z −54..54 — i.e. the whole playable board), appears in **no** view field and has no verb; it is scenery. And the manifest's `engineDependencies` declares `signal-suppression-consumer: "missing"` while `SignalSuppression.create` runs at `:723` and publishes at `:1531` — the **fifth** stale "missing" I have hit, though this is the first one stale in the *harmless* direction. So: ordinary stationary survival wearing E7's name, exactly as measured. What actually carried the run were the plainest fields — `now.works.byKind`/`entries` (ladder state and placement), `now.seams[].active/x/z` (income; the seam ids re-anchor between waves, and only one of the four anchors sits within 23 wu of the claim while the others sit at 42 wu), `now.gold`, `now.hero.hp/maxHp/level`, `now.threats.alive` (peaked at 27, never near the published 60 cap) and `now.pendingOffer`/`now.pendingSecure` — and the orders were `BUILD`, `HARVEST`, `PICK_UPGRADE` and one blank line. Two things did require real reading, neither of them E7: the **enemy roster of one**, `data_rustler`, whose `thief: true` makes `Enemy.ts:624` set `wrecker = false`, so no building on this board can ever be attacked (`works.wrecked` was 0 at all 81 views, `goldStolen` finished at 0, and `REPAIR_UNDER` would have been dead weight); and the **absent `secureWave`**, which quietly doubles the contract from the 12-wave shape of most of my rides to a 600-second one — and, through `runTapeEnvelopeForContract`, is also what nearly made an honest secure unsubmittable.
- Lessons (rider, verbatim):
  - **`unclaimed` with no `reason` in `winnability-receipts.json` is sixteen-for-sixteen.** Still the first two lines of JSON I read, still the cheapest information in the county, still never wrong.
  - **A contract that omits `twist.secureWave` cannot admit its own honest secure through the door, and the blank line is the cure.** `runTapeEnvelopeForContract` derives its per-contract ceiling — including the `+2` margin for gr-sim's terminal-instant order — *only* inside `if (twist?.secureWave)`. Omit the field and you get `Balance.run.secureWave: 20` (600 s = exactly 18000 ticks) against a flat `MAX_PLAYBOOK_TICKS` of 18000, zero margin; a `SECURE_CHOICE` answered at the boundary is recorded at tick 18000 and `durationTicks = lastEntryTick + 1 = 18001` is refused as `reel_duration_exceeded`. **Answer that one boundary with a blank line** — `gr-sim.mjs:241` returns without recording an entry, the boundary is frozen so the clock does not move, and the configured `bank` default secures the run for `defaultedSecure: 1` and nothing else. Measured on identical controllers: 18001 refused, 18000 admissible, same waves/time/gold. **This retroactively rescues generations 24 and 25** — `e6-half-life-hollow` and `e6-picnic` both declare no `secureWave`, and both of those first-secures died on exactly this fencepost. Their lesson ("bank the secure when the window opens, do not ride the ceiling for score") was the wrong diagnosis: the ride length was never the problem, the terminal-instant *order* was.
  - **Check the tape's admissibility, not just the outcome line, before calling a ride done.** Securing and producing a submittable reel are different achievements — two generations learned that the expensive way and I nearly made it three. The whole check is four numbers against `runTapeEnvelopeForContract`: `durationTicks`, entry count, byte size, and `lastEntryTick < durationTicks`. Read them off the tape the moment the run ends.
  - **Read the enemy roster's flags before designing a defence, and read what the flags exclude.** One line — `this.wrecker = !this.thief && params.wrecker === true` (`Enemy.ts:624`) — meant a board whose only enemy is `thief: true` can never damage a building. Ten works, 934 spawns, zero wrecked, and every `REPAIR_UNDER` I might have carried would have been a wasted slot. Generation 14 learned to hunt the special-cased callback when every damage scale is zero; the twin move is to check which behaviour flags are **mutually exclusive**.
  - **A contract with a thin twist is a contract whose terms are written in `Balance`.** No `secureWave`, no boss, no era socket, one enemy id — and it is a 600-second ride, twice the length of most of the door. Generation 25 said "read the `??`, not just the field"; this ride adds that the defaulted value has *second-order* consequences (here, the tape envelope) that the manifest gives no hint of.
  - **The generation 6→14 controller skeleton secured this on its first ride and needed no tuning at all.** `PICK_UPGRADE` first in the array under replace semantics; one ordered ladder emitted as a non-decreasing price prefix (4 turrets 50/70/95/125, then 6 beacons 25/35/45/55/75/95) so no cheap rung starves an expensive one; more candidate positions than slots with a stall-rotation; a plating-first upgrade scorer; and the rest of the 32 slots stacked with `HARVEST` on the nearest live seam recomputed each view. Ten builds, zero refusals, `goldPanned` 870. That skeleton is now the *default opening* on any ordinary-survival board, and the heat's real work is finding the one thing the board does differently.
  - **An `engineDependencies: "missing"` can be stale in the harmless direction too.** Five sightings now: E4 long-road's was true; E5 deepwater-claim's, E5 regatta's and E6 glow-mesa's were false in the dangerous direction (they disclaimed the mechanic that wins the map); this one is false in a direction that costs nothing (it disclaims a consumer that landed and does nothing playable). The rule is unchanged and now cheap to state: **the block is a comment, the view is the fact — one idle probe settles it.**
  - **Publishing "there is nothing here" is better legibility than publishing a mechanic with no field.** `now.signalSuppression` with three permanent zeros told me in one probe exactly what E2's pressure block took me three generations to work out by grepping consumers. When the county asks what to keep in a reskin, keep this: a visible row saying the systems are off beats silence, and it beats a manifest that advertises them.
  - **Spend the run after the secure on the receipt, not on greed — and here the receipt was free.** The stop rule ends the ride at the first secure, so instead of a re-ride I assay-replayed the promoted reel through `scripts/assay-replay-agent.mjs`: it reproduced `fnv1a32:c444c0e8` and all four outcome fields without riding anything. In an era that replays every reel, **the local assay is the determinism proof the stop rule leaves room for.** Do it every time from now on.
  - **Write the outcome file after every run, before the analysis.** Thirteenth generation saying it, tenth actually doing it — and the generation 23/24 caveat bit again exactly as predicted: my comparator ranked tune-1 and tune-2 as a tie and kept pointing at tune-1, the *inadmissible* one. A best-so-far comparator does not know which run you have chosen to call your attempt, and it does not know about the door's envelope. **Check the file says what you mean.**

## generation 37 — 2026-09-05T15:32:58.105Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 86e53f37efee27cc9e1333b7dba29719c61e002ed2edfdd5cda8d729545df77b · contracts: e3-canyon-works
cost: wallClock 1007s · setupToFirstOutput 45s · tokens in 172 / out 155944 (+cache read 20487897) over 86 turns, 45 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): NOT SECURED — w3 / 106.500s / 120g / calls 12 · runs 6 · scored attempts 1 · worldModel sim-import. Door: nothing submitted — the ride did not secure. Heat 12, ride 1 of the never-claimed five; second independent measurement of the Canyon Works economy wall, sharper than heat 11's.
- Winnability (rider, verbatim): **No — not through the door from its own starting kit, and the wall is the map's economy against its own deadline, not the grammar and not my budget:** the only secure path requires 330 gold of `sentry_beacon` (the map sells exactly six, `maxCount: 6`, and all six are spent on pylons, so nothing is left for defence) placed across a ~147wu path before t = 180, while the two live seam anchors sit 78–81wu north across the river and cap income at ≈2.07 g/s — which lands the 330th gold at t ≈ 176 at the earliest, *before* a single step of the placement tour. Two honest caveats: I could not test the stake-first beacon line to completion, and 60 gold of palisades moved the hero's t = 106.5 death by zero ticks, so I never observed the run reach wave 6 at all.
- What the map asked (rider, verbatim): It asked a real graph question, and E3's signature mechanic — the grid under sabotage — is the most load-bearing thing on the board: it *is* the secure condition, not a scoring flourish. This is not stationary survival wearing the era's name. The network is fully legible from the view alone: `now.canyonConnect {powered, required, byWave, complete, failed}` is live, and `stablePrefix.mechanics.rules` names its own source and its `completionLatch: "one-way-at-or-before-deadline"` with `missedDeadline: "run-unsecurable"`. The reasoning it demands is genuine graph reasoning: two disjoint three-hop chains from one 26 W producer, a `maxSpanLength` of 30 that forbids every shortcut (I checked all cross-links — 33.9, 39, 48, 59), relay nodes that boot offline and come online only under a standing beacon, and a watt ledger that sheds by priority so the two galleries stay powered while the lamps shed. The fields that carried my runs were `now.canyonConnect`, `now.works.entries` (position + `wrecked` — the only way to see which pylon sites are actually covered), `now.seams[].active/x/z`, `now.gold`, `now.hero.hp` and `now.threats.alive`; the orders were `BUILD`, `HARVEST` and `PICK_UPGRADE`. There is no E3 verb — the grid is something you read and place around, never something you do. My notebook remembers this map from generation 12 and **it still plays exactly the way I remember**: same latch, same 330-gold price, same 80wu commute, same wave-3 death at t ≈ 100. The engine moved around it (rendering, sampler, lighting); its rules did not, and neither did its verdict.
- Lessons (rider, verbatim):
  - **Re-derive a returning contract's numbers; do not inherit my own.** Generation 12 wrote that the
    latch "demands 330 gold of beacons strung across six sites" and separately quoted `required: 2` from
    the view. Both are true and they are about different things — `required` counts *galleries*, the six
    beacons are what *reaches* them — but reading my own summary I nearly planned for a two-beacon
    objective. When a past generation's prose and the view disagree in shape, go to the code.
  - **Check `maxCount` against the objective's demand before pricing anything.** `sentry_beacon`
    `maxCount: 6` and six pylon sites is the whole contract in one line: every unit of the only
    defensive buildable is pre-spent by the objective. A roster cap that exactly equals an objective's
    requirement is a design statement — read it as one.
  - **A cheap defence that changes nothing is a stronger result than a dead run.** Six palisades cost 60
    gold and produced a *bit-identical* HP curve and the same death tick as zero palisades. An
    intervention that moves the outcome by exactly zero is not a weak signal; it is a clean refutation,
    and it cost one run. Prefer experiments that can come back exactly zero.
  - **Instrument the run, not the outcome.** Logging `{t, gold, goldPanned, hp, alive, beacons,
    powered}` at every view turned "the economy feels slow" into "60 gold at t=20.1, then flat for 40
    seconds" — which located the fault (the array drains and the next view is a wave boundary away)
    rather than merely confirming the symptom.
  - **Stacking a HARVEST chain by seam id is not enough when seams re-anchor.** A depleted seam goes
    `active: false` and the live gold moves to an id my array never named, so the worklist drains into
    instant failures and the Prospector idles until the next wave boundary. Naming all four ids helped
    not at all (they failed instantly too). The real constraint is that **I cannot get a decision point
    when I need one**: respawn is 20 s and views are 30 s apart, and surprise-views back off
    exponentially (0.1, 0.2, 0.6 s… then silence). Budget the array to *outlast* the view gap.
  - **Put a wall-clock guard on every controller.** My most informative run was the one I never got to
    read, because it outran the wall with no tape and no partial log. A controller that writes its log
    incrementally, or self-terminates at N seconds, would have converted that into a measurement. Six
    generations of "write the outcome file after every run" and I still lost the best run to a process
    that only reports at exit.
  - **`unclaimed` with no `reason` in `winnability-receipts.json` remains a statement about the
    *standings*, never about the map** — nineteen contracts running. Generation 12 said it; this ride
    confirms it on the same contract twice. The receipt cannot encode an *economic* wall, and this is the
    clearest economic wall I have ridden.
  - **Two generations, same verdict, and the arithmetic is now the deliverable.** The honest output of a
    contract like this is a priced impossibility with the constants attached, not another tape. If the
    county wants this one claimed, the cheapest lever is the seam anchors (a fifth/sixth anchor south of
    the river, or `activeMax` actually running 3), not the enemy mix — exactly the change that turned
    `e3-fairground` from unclaimable into a first-secure.

## generation 38 — 2026-09-05T15:48:42.661Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 86e53f37efee27cc9e1333b7dba29719c61e002ed2edfdd5cda8d729545df77b · contracts: e7-relay-valley
cost: wallClock 919s · setupToFirstOutput 105s · tokens in 170 / out 130704 (+cache read 21150080) over 85 turns, 50 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): NOT SECURED — w15 / 460.333s / 40g / calls 62 · runs 4 · scored attempts 1 · worldModel sim-import. Door: nothing submitted — the ride did not secure. Heat 12 (never-claimed), ride 2. NOTE: this charter was built moments before generation 37 was appended, so it is the one ride of the heat that did not carry its immediate predecessor; every later charter does.
- Winnability (rider, verbatim): **Undecided-leaning-yes on the map and firmly not-my-budget-alone: the wall is the map's ground against its own clock, and what stopped me was that the only unbounded HP source arrives about 80 seconds too late** — no buildable on this contract can come within 31.24 wu of a hero welded at (0,12) with a 175-hp ceiling, so a wave-20 (600 s) secure has to be paid for entirely out of the draft, and the draft's one repeatable heal (`field_dressing`, filler, infinite stacks, 0.3×maxHp) is only offered once fewer than three non-filler cards remain eligible; my best ride was level 21 with six non-fillers still in the pool at t = 460 and needed roughly four more levels (≈ t = 540) to open the fillers it would then have ridden to 600 — so the gap is ~80 seconds of HP, not a structural refusal, and the three levers I could not fit in the wall (a second stockpile decoy to split the west lane, farming `order_failure` surprises for more `BLAST_AT` windows, and burning the junk cards faster by keeping `beacon_dynamo`, `sluice` and `assay_office` out of the eligible pool) all push in the right direction.
- What the map asked (rider, verbatim): It asked me about its era's signature mechanic **squarely, for the first time on this map**, and the county's earlier RESKIN reading of `e7-relay-valley` is now out of date — the `e7-playbook-rows` drain changed the contract, not just its scenery. In generation 26 I rode this same seed and reported that `now` carried "no relay, no recording, no playbook, no Echo" and that E7 survived only as "a map that cannot be fortified". Both halves have moved. `now.playbookUse` is a live fifteen-field block, `PLAYBOOK_USE` is a real verb, and — decisively — **the secure is latched on it**: `E7PlaybookLatch.allowsSecure` returns `this.lit.size > 0` for `objective: "relay"`, and `HeadlessContractSim:1370` ANDs that into the gate, so no wave count can secure this claim until a relay site is lit by a running program. The reasoning it demands is small but genuinely of the era, and it is legible from the view alone. `E7PlaybookLatch.syncProgramRelays(running, works)` lights a site when a standing work of `POWERED_RELAY_KINDS` (`turret`, `sentry_beacon`) sits inside one of the four authored `relay-site` rectangles **while a program holds the wheel** — so the loop is: submit ordinary orders (they are recorded as the demonstration at the public rider seam), get a powered work standing in a zone, then `PLAYBOOK_USE` a fresh name, which records that demonstration as a tape and re-installs it as your standing order set. `runningProgram` is non-null from that install until your next accepted submission, and `syncProgramRelays` runs on the fixed step inside that window. That is L1 of the capability ladder working exactly as advertised — the sim executing a program the rider wrote — and it cost me one 25-gold building and one order. The fields that carried it were `now.playbookUse.{objective, objectiveMet, shelf, uses, programRuns, relaysLitByProgram, runningProgram, refusals, last}`. The honest qualifier is that the mechanic is **cheap and front-loaded**: it is discharged by second 12 of a 600-second contract and never asks anything again. Nothing about the front, the mirror or the suppression applies here, there is no reason to record a *good* tape rather than any tape, and repeats are unpunished on this map. So: half a minute of real E7, then 590 seconds of the hardest stationary survival the door has posted at me. That survival is what the map is actually made of, and it is the same wall generation 26 measured. The claim and the welded hero sit at (0,12) with 100 maxHp; `Terrain.isBuildable` confines every buildable to the four relay sites at z 36..46, whose nearest legal point is **31.24 wu** away against a turret's 16 and a beacon's 8. Enemies spawn on `Balance.waves.spawnRingRadius` 26 around the claim from three edges — the north stream appears at ≈(0,38), 20.1 wu from the nearest legal turret coordinate and walking directly away from it — so **not one gold of the 980 I panned could buy a single point of defence for the body that has to live.** The run is a pure attrition race, and the fields that carried it were `now.hero.hp/maxHp/level/upgradesTaken`, `now.threats.alive/thieves`, `now.seams[].active/x/z`, `now.gold` and `now.pendingOffer`; the orders were `PICK_UPGRADE`, `BLAST_AT`, `HARVEST`, `BUILD`, `HOLD` and one `PLAYBOOK_USE`. Two things I found inside that race are worth the county's attention, because both are real mechanics reached with ordinary grammar. First, **the stockpile is the whole thief economy.** `TargetingSystem.nearestGoldHolding` is fed only by `HeadlessContractSim.syncStockpileHoldings`, so on a board with no stockpile the holding list is empty, `Enemy.updateThief` returns null, and every `data_rustler` — 44 of 60 live bodies at wave 14 — falls through to ordinary hero pursuit. That is exactly what tune-1 measured: 17 thieves standing on the hero and `goldStolen: 0`. One 60-gold stockpile placed in the far relay site turns each of them into a 49-wu round trip that ends with the thief grabbing 10 gold and **fleeing off the map entirely**; tune-2 held the hero flat at 98/175 for 54 unbroken seconds. Second, **building a sentry beacon lengthens the upgrade pool**: `Progression.eligibleDefs` drops `beacon_dynamo` while `getBeaconCount() <= 0`, so the cheap relay work costs you two extra junk draft picks on the road to the only unbounded heal in the game. Using a turret for the same relay light is 25 gold dearer and two picks cheaper, and that was worth a wave.
- Lessons (rider, verbatim):
  - **A contract I have ridden before is not the contract I rode.** Generation 26 measured this exact
    seed and reported "no relay, no recording, no playbook, no Echo" in `now`, and RESKIN. Two drains
    later `now.playbookUse` is a live fifteen-field block, `PLAYBOOK_USE` is real grammar, and the
    secure is latched on it. My own notebook was the most confidently wrong thing I read this heat.
    **Re-run the `now`-key dump on every ride, especially when the notebook says the map is empty** —
    a prior generation's finding has an expiry date and the era-pin ledger tells you which ones.
  - **F-HEAT11-1 is cured, and the cure is visible in the manifest.** `twist.clockTicks` is the new
    tell: `runTapeEnvelopeForContract` reads it and the `+2` slack now lands outside the
    `if (secureWave)` branch, so a `secureWave`-silent contract gets 18002 ticks instead of 18000.
    Check `clockTicks` alongside `secureWave` from now on; the blank-line secure is still free
    insurance but is no longer the difference between a ranked reel and a refused one.
  - **Find out what makes the enemy's target list non-empty, not just what is on it.** Three
    generations of mine have re-read the target function (gen 19 `getPos`, gen 21 `targetPosition`,
    gen 28 `nearestBuilding`). The sharper move here: `nearestGoldHolding` is fed by exactly one
    syncer, and with no stockpile standing the *list itself* is empty, so half the roster silently
    reverts to a completely different behaviour. **When a whole enemy class looks inert, check whether
    its target REGISTER is empty rather than whether its logic is wired.** One 60-gold building turned
    44 attackers into 44 commuters who then left the map.
  - **A build can cost you draft picks.** `Progression.eligibleDefs` gates `beacon_dynamo` on
    `getBeaconCount() > 0`, so putting up the cheapest legal relay work ADDS two junk cards to the pool
    you need to empty before the infinite heal appears. On any run whose endgame is filler sustain,
    price a building in *picks* as well as gold — the turret was 25 gold dearer and a whole wave better.
  - **`field_dressing` is the only unbounded HP in the game and it has an entry fee.**
    `rollOffer` fills from non-fillers first and only reaches for fillers when fewer than three remain
    eligible. So "can I survive 600 s" on a fortification-proof map is really "can I take ~24 draft
    picks before the attrition curve crosses my HP pool". That is an XP-rate question, and it should be
    computed — `need(l) = 12 + 8(l-1)`, `xp.perKill = 4` — *before* choosing a policy, not after three
    rides.
  - **The panning bug I have now written down twice cost me a wave again.** Generation 15: "chain by
    seam when the seams are near, stack by seam when they are far." v2 round-robined live seams 45 wu
    apart and banked 285 gold in 430 s against a 3.3 g/s pan rate; sorting by distance to the CLAIM,
    chaining only seams within 25 wu of each other, and ending the array with a `HOLD` on the seam so a
    drained chain parks the Prospector there took it to **980 gold**. Filter the chain by mutual
    distance, not just by nearest-first.
  - **A deep failing tail is a decision-point generator and I can now name the seam.**
    `advanceToTurn` returns on `surpriseSeq > lastSurpriseSeq`, so any NEW order failure emits a view.
    v3's parked-and-drained harvest chain took me from 40 views to 63 for the same contract, and every
    extra view is one more `BLAST_AT` into the scrum standing on the hero. Next time, engineer the
    failures deliberately: a ladder of `BUILD` orders gated at rising `goldGte` fires one refusal per
    pan tick, which is a view every 1.5 s.
  - **When the map cannot be fortified, gold is not an economy — it is ammunition for whatever
    non-defensive lever exists.** I panned 980 and spent 110 on buildings; the other 830 went to
    thieves *on purpose*, because `holding.amount = economy.gold` and a decoy with an empty till stops
    being a decoy. Ask what the surplus currency can buy that is not a building before concluding a
    capped purse is dead weight.
  - **Four runs is a heat and I spent them well, but I front-loaded the wrong third.** The source read
    that decided the contract (the latch, the holding register, the eligibility gate) was worth every
    minute; what I never got was the synthesis run that combines the second stockpile, the deliberate
    failure ladder and the shortened pool. Generation 32 wrote "reserve the last third for the run that
    combines what the earlier runs proved" — I proved three things and combined two.

## generation 39 — 2026-09-05T16:04:09.787Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 86e53f37efee27cc9e1333b7dba29719c61e002ed2edfdd5cda8d729545df77b · contracts: e8-mare-claim
cost: wallClock 918s · setupToFirstOutput 90s · tokens in 126 / out 138530 (+cache read 14921567) over 63 turns, 34 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w20 / 600.000s / 60g / calls 77 · runs 4 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:f84d1d2b, rank 1. Heat 12 (never-claimed), ride 3.
- Winnability (rider, verbatim): Secured, and the margin was **wide, not thin**: the hero held its full running maximum of 175 HP from t = 270 to t = 448, finished **92.6/175**, all ten works stood unwrecked at the bank, and `threats.alive` peaked at 34 against a published 60 cap — the run had health, defence and a live gold sink all in hand at the boundary, and the thin part was only the opening, where 30 seconds of quiet buys exactly one 50-gold turret.
- What the map asked (rider, verbatim): It asked about **air exactly once, for one order, and then about a 600-second grind** — so this is **half** an exercise of E8's signature mechanic, not the reskin the audit once recorded and not a full exercise either. The era's lever is genuinely composed headless and it genuinely gates the secure: `now.air` publishes `suit` (60 s capacity, 1 s/s drain outside a dome, 4/s refill inside, `inDome`, `empty`, `drainedTotal`, `emptySeconds`), a `domes[]` dial per `dome-cluster-pad-*` with `air`/`breached`/`breaches`/`siegers`, and `regolith` with `grounds: 6`, `required: 1`, `worked`, `runsOnAir`, `breathlessPans`, `complete` — and no secure is offered at any wave until `regolith.complete` is true. But `required` is **1**, so the whole air wall costs a single pan: my first `HARVEST` reached a seam inside the opening seconds with the suit still nearly full, the latch closed, and after that the suit sat empty for **488.8 of 600 seconds** with 197 breathless pans and nothing whatsoever happening — the consumer damages nothing and mints nothing once the gate is shut. The map's other E8 field, `now.gravity` (`feelG 0.6`, `movement: "floaty"`, `lobArcDistanceMultiplier`/`lobAirTimeMultiplier` 2.4, `knockbackScale` 1.3, `vacuum: true`), is real and I used it only as free supplementary damage — one `BLAST_AT (0,14)` per view whenever `blastReadyInMs` was 0, inside the 24-metre lobbed reach. I did **not** take `SET_WEAPON blast`, on generation 29's measurement that the auto-lob is ~10 dps against the Spark Rig's 24. What actually decided the contract is inherited geometry, and it is a good question in its own right: the hero is welded to the claim at **(0, 12)**, and every legal square of build ground lies **south** of it — the three `dome-cluster` pads end at `z = 6`. So nothing can be built within 6 wu of the body that must survive, and the design reduces to two range facts. A sentry beacon's radius is 8, so it only touches the scrum that actually damages the hero from the `z = 6` line with `|x| ≤ 5.29`; a turret's range is 16, so it can sit back at `z ≈ 1–2` and still cover the approach. Six beacons went on the `z = 6` line at `x ∈ {0, ±1.5, ±3, ±5}` and four turrets at `(±6, 2)` and `(±3, 1)` — ten builds, **zero ever wrecked**, because neither roster entry (`scrap_corsair`, `sun_glare_shambler` in `Balance.e8Roster`) carries `wrecker` or `thief`. `goldStolen` finished at 0 and `REPAIR_UNDER` and palisades would have been dead weight. Fields that carried the run: `now.works.entries` (position, **`tier`**, `index`, `wrecked` — the field that decided the whole heat), `now.works.byKind`, `now.seams[].active/x/z`, `now.gold` against the 200 cap, `now.hero.hp/maxHp/level`, `now.threats.alive` (peaked at 34), `now.orders[]` (the refusal blacklist's source), `now.air.regolith.complete`, and `now.pendingOffer`/`now.pendingSecure`. Orders: `HARVEST`, gated `BUILD`, `PICK_UPGRADE`, `BLAST_AT`, `MOVE_TO`, `CONTEXT_ACTION upgrade`, and one blank line. **Not one E8 verb, because E8 has none.** My notebook remembers this map from generation 29, and **it still plays the way I remember**: same welded hero, same z ≤ 6 build ground, same one-pan regolith latch, same 26–35 wu seam commute, same wave-19 wall for a controller that stops spending. The engine era moved (`49c34f8b` → `86e53f37`); the contract's shape did not, and neither did the reason it had never been claimed — the wall was a purse that fills and stops buying, not a wall in the map.
- Lessons (rider, verbatim):
  - **`works.entries[].tier` is 1-BASED, and getting that wrong is a silent, run-losing no-op.** A
    freshly built turret reports `tier: 1`; its next step is `Balance.tiers.turret[1].cost = 150`.
    I indexed the tier array with the tier itself, demanded 300 gold, and never issued a single
    upgrade — the purse pinned at the 200 cap for the last 107 seconds and ~250 gold of income was
    banked into a full bucket and lost. **`score.goldPanned` going FLAT while `gold` sits at the cap
    is the signature of a dead sink**; it is a one-line check on any run that ends rich.
  - **Generation 29 named this exact lever and I still had to re-measure it.** Its lesson said "a
    capped purse is a lost margin, and the sink is the tier upgrade." It was right, it was the whole
    contract, and inheriting the sentence was not the same as implementing the arithmetic. When a
    past generation names the lever, re-derive the *price*, not just the plan.
  - **Test which resource the map is actually short of before optimising the other one.** tune-2 was
    a clean one-variable test of an income-first draft: it panned 100 more gold and died 116 seconds
    earlier. On a board where the ladder caps at 4 turrets + 6 beacons, gold stops being the
    constraint the moment it has somewhere to go, and every draft pick spent on `spring_heels` /
    `pan_legend` / `prospectors_luck` is combat power given away. **A regression that big from one
    changed variable is worth more than a marginal improvement.**
  - **Sort the ladder by strategy and truncate at the first price DECREASE — never sort by price.**
    Cheapest-first put three beacons up before the first turret, and a beacon is
    `(10 + 0.75·wave) × 1.2` dps — about 13 at wave 1 against a turret's flat 57. Gen-9's
    non-decreasing prefix is an anti-starvation device, not an ordering policy; pick the order first,
    then let the prefix rule protect it.
  - **Read the order record's shape before writing a refusal blacklist.** The record nests the order:
    `rec.order.verb` / `rec.order.where` / `rec.order.what`, with `rec.status` and `rec.reason` at the
    top level. v1's blacklist read `rec.verb`, matched nothing, and silently retried a colliding
    coordinate. A blacklist that never fires looks exactly like a blacklist that is not needed.
  - **Compute the coverage circle against the DEFENDED POINT, not the build zone.** Beacon radius 8
    and a hero welded at (0, 12) with build ground ending at `z = 6` means only `|x| ≤ 5.29` on the
    `z = 6` line reaches the scrum at all. Turret range 16 is free of that constraint, so give the
    short-range buildable the scarce ground and push the long-range one back. That one subtraction
    chose all ten coordinates.
  - **The E8 air wall costs exactly one order when `regolith.required` is 1.** Read `required` off
    `now.air.regolith` before budgeting anything for the suit: my suit was empty for 488.8 of 600
    seconds and 197 breathless pans cost nothing, because the latch had closed at t ≈ 7. An era gate
    that is genuinely load-bearing can still be genuinely cheap — price it, then stop thinking about it.
  - **The blank-line secure is standing equipment and it worked first try, fourth contract running.**
    No `twist.secureWave` means wave 20 / 600 s AND a flat 18 000-tick envelope; answering
    `now.pendingSecure` with `"\n"` gave `durationTicks` 18 000 with the last entry at 17 946.
    Measure `durationTicks`, `lastEntryTick`, entry count and bytes off the FIRST reel that exists,
    not off the attempt.
  - **The stop rule leaves room for exactly one receipt, and it is the local assay.** The replay
    reproduced the tape's own `fnv1a32:f84d1d2b` and all four outcome fields. Note again that this is
    the TAPE header's hash, not the stdout outcome line's `e06bda53` — they are different numbers by
    design, and comparing the wrong pair reads as a false mismatch on a perfectly good reel.
  - **An unclaimed contract is not necessarily a hard one; it can be a contract nobody has finished
    spending on.** This map had been ridden to w19 twice and called "probably winnable, blocked by my
    own budget." That verdict was right, and the fix was 150 gold and a correct array index.

## generation 40 — 2026-09-05T16:28:59.500Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 86e53f37efee27cc9e1333b7dba29719c61e002ed2edfdd5cda8d729545df77b · contracts: e9-dome-basin
cost: wallClock 1322s · setupToFirstOutput 210s · tokens in 164 / out 158856 (+cache read 19806778) over 82 turns, 43 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): NOT SECURED — w16 / 499.200s / 80g / calls 265 · runs 5 · scored attempts 0 · worldModel sim-import. Door: nothing submitted — the ride did not secure. Heat 12 (never-claimed), ride 4.
- Winnability (rider, verbatim): **Undecided-leaning-yes, and what stopped me was my own budget, not a wall:** three controllers took the same seed w14 → w15 → w16 (499.2 s of the 600 s needed) on a strictly rising curve with the mechanism understood and two obvious, un-run levers left on the table — a **second bait wall on `rim-dome-pad-west`** (its NE corner (−28, 6) is 6.3 wu from the west spawn ring point against the claim's 26, so it should own the west lane exactly as the east pad owns the east, leaving only the north third of the board on the hero) and a **repair rate that keeps up with ~0.24 works/s of wrecking** (I mend four per rim trip and the wall still went 0 → 28 wrecked over the last 90 s) — with the standing caveat that **the reel must be re-sized as well as re-played**, because at wave 20 this policy's tape overruns the 592,544-byte ceiling and a won run that cannot be admitted is not a claim.
- What the map asked (rider, verbatim): It asked me **nothing at all about E9 persistent tiles**, and the county's RESKIN measurement is right — sharply so, because the engine *owns* the consumer and this contract declines it. `CanalChoiceSystem` is live headless and gates the secure through `autoSecureWaveForRun`, with `CONTEXT_ACTION redig`/`backfill` as public verbs — but it is keyed on `twist.persistentCanalChoices`, and **this manifest declares no twist but `clockTicks` and an enemy roster**. So the three canal stage-gates C1 (−28,34), C2 (−12,10), C3 (4,−24) the briefing tells me to defend, the feeder-canal rail through them, the ice quarry, the dust-devil patrol lane and the height-four scarp are all `tileParams` scenery: **the union of `now` keys across every view of every run is `wave · blastReadyInMs · weapon · timers · gold · hero · prospector · works · threats · orders · needsRider · seams · score` (+ `pendingOffer`/`expiresAtSimMs`/`pendingSecure`)** — no `canalChoices`, no tile state, nothing that persists across a wave. `stablePrefix.mechanics.rules` carries one key. There is no E9 verb, and there is nothing to steward. What the map asked instead is a single hard geometry question, and it is a good one: **where can you build, relative to the body you must keep alive, and what does the enemy walk toward?** The answer is the 28.28 wu subtraction above plus `nearestBuilding` — you cannot defend the hero, so you buy its life in *bait mass* on the one pad that is nearer to a spawn lane than the claim is. The view fields that carried it were `now.works.entries` (position, `wrecked` — the only way to see the wall being eaten), `now.works.byKind`, `now.works.wrecked`, `now.seams[].active/x/z`, `now.gold`, `now.hero.hp/maxHp/level`, `now.threats.alive` (which pins at the 60 cap) and `now.pendingOffer`/`now.orders[].status/reason`. The orders were `BUILD`, `REPAIR_UNDER`, `HARVEST`, `PICK_UPGRADE`, `BLAST_AT`, `HOLD` and blank lines — epoch-1 grammar throughout. My notebook remembers this map from generation 32, and **it still plays exactly the way I remember**: same welded hero at (0,12), same 28.3 wu nearest ground, same 35 wu seam commute, same claim-is-nearest -building problem, same wave-2 idle death at ~82 s. The engine era moved (`a607a81f` → `86e53f37`) and the rules did not. What moved was my reading of it, not the board.
- Lessons (rider, verbatim):
  - **`unclaimed` with no `reason` in `winnability-receipts.json` is nineteen-for-nineteen — and for the
    third time it green-lit a contract I did not win.** It is a statement about the *standings*, never
    about the map, and it cannot encode a ground wall or a reel wall. Read it, then do the two
    subtractions that actually decide a board: `min |claim − buildZone|` against weapon range, and the
    tape envelope against the run length.
  - **The blank line is not just secure-boundary insurance; it is the reel budget.**
    `gr-sim.mjs readOrders` returns on `!next.value.trim()` without recording an entry, so *any* view can
    be answered for free. Same policy, 291 entries → 101, **988,766 bytes → 197,790**. On a 600-second
    contract, decide per view whether the order set must actually change, and blank-line the rest.
    Generation 26 measured the byte ceiling and generation 27 found the blank line at `pendingSecure`;
    putting the two together is the whole cure for `reel_too_large`.
  - **Measure the tape envelope on the FIRST reel, and measure all three axes.** I checked
    `durationTicks` (12,829 of 18,002 — fine) and nearly shipped a tape that was 67% over on *bytes*.
    Ticks, entries and bytes are three independent ceilings; `runTapeEnvelopeForContract` publishes all
    three and my runner now prints them on every child exit.
  - **F-HEAT11-1 is cured and the tell is `twist.clockTicks`.** The `+2` inclusive-endpoint slack now
    lands outside the `if (secureWave > 0)` branch, so a `secureWave`-silent contract gets 18,002 ticks.
    The blank-line secure stays free insurance; it is no longer the difference between a ranked reel and
    a refused one. **F-HEAT11-2 is the live hazard now** — and unlike its sibling it is a *policy* fault,
    not an engine one, so it is mine to fix.
  - **Price an enemy-diverting mechanic against the cap that governs it, not against its flavour.**
    Generation 38's stockpile decoy was the right lever on the Relay Valley and is a **bad trade here**:
    `Balance.steal.maxConcurrent` is `2 + floor(wave/6)` capped at **4**, so on a 60-alive board a
    stockpile buys you four diverted drones and pays `claimGold`'s 10-a-grab for them — measured at
    1.32 g/s against a 1.97 g/s pan rate, which is the entire fort. **Find the concurrency cap before
    costing the diversion.** A lever that a sibling generation proved is still a lever with a price.
  - **A failing travel order is not a free decision point when the verb implies travel.** Generation 2's
    "an order that fails honestly buys a decision point" is true of `HARVEST` on a drained seam, where
    the Prospector is already standing there — and false of `REPAIR_UNDER` with no gold, which walks
    22 wu, fails, and walks back. Ninety of those froze `goldPanned` for a full minute. **Gate any
    travelling verb on the resource it will need when it arrives.**
  - **Bait mass is a consumable, so budget its replacement rate, not its size.** The wall's job is
    measured in wrecker-seconds, and it was going down at ~0.24 works/s. A palisade mends for 25% of
    cost (2.5 g) against 10 g to rebuild and the wrecked frame still holds the ground, so mending is
    4× the bait per gold — but mends are limited by *actions*, not gold, so put several `REPAIR_UNDER`
    orders in one array and let them ride a single rim trip.
  - **When the hero cannot be defended, ask which lane each build zone owns.** `nearestBuilding` from
    the spawn ring point is the whole test: east pad 4.5 wu vs the claim's 26 (owns the lane), west pad
    6.3 vs 26 (owns it), and **no zone is nearer than the claim to the north spawn** (nearest is 34.7),
    so the north third is unbaitable by construction. That decomposition was available from the manifest
    in two minutes and it is the thing I should have built the whole plan around from view 0, instead of
    reaching it on run three.
  - **Bait mass has a ceiling and damage does not — I measured the exchange rate.** Trading 220 gold of
    turret (rungs 3 and 4) for 22 extra palisades cost **two waves**. A wall only buys wrecker-seconds;
    a turret buys wrecker-seconds *and* kills, and kills are XP, and XP is the draft, which is the only
    HP source on a board where nothing can defend the hero. When two purchases both "help survival",
    check which one also feeds the progression loop.
  - **Three rising runs is a trend, not a heat.** w14 → w15 → w16 on a strictly improving curve with the
    mechanism understood is the shape of a contract that falls to the *next* controller, and I spent my
    wall proving the mechanism rather than riding the synthesis. Generation 32 wrote "reserve the last
    third for the run that combines what the earlier runs proved" — this is the second heat running that
    I have proved the parts and not fired the combination. **Write the two-sided-bait run first next
    time; it was derivable before the idle probe.**

## generation 41 — 2026-09-05T16:39:00.435Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 86e53f37efee27cc9e1333b7dba29719c61e002ed2edfdd5cda8d729545df77b · contracts: e1-drill-yard
cost: wallClock 600s (WALL HIT at 1500s) · setupToFirstOutput 135s · tokens in 158 / out 91684 (+cache read 18238625) over 79 turns, 37 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): NOT SECURED — w2 / 60.033s / 180g / calls 6 · runs 4 · scored attempts 1 · worldModel sim-import. Door: nothing submitted — the ride did not secure. Heat 12 (never-claimed), ride 5.
- Winnability: the rider wrote no Winnability section.
- What the map asked: the rider wrote no such section.
- Lessons: the rider wrote no Lessons section (see the report/transcript in the evidence dir).
- Finding (rider, verbatim from its own gauntlet-outcome.json — the ride was SIGTERMed at the 600 s wall before it could write a Lessons section, so the operator lifted the rig's own words rather than let them die with the process):
  e1-drill-yard CANNOT BE SECURED through the door, by any policy, on any seed. twist.secureWave=0, so RunManager.maybeSecureRun (src/game/RunManager.ts:300, `secureWave <= 0` -> early return) never emits `run_secured`; HeadlessContractSim.ts:2033 sets secureChoice='pending' ONLY on that event, so now.pendingSecure never appears and SECURE_CHOICE is never accepted. The only other caller of secureRun is secureCurrentRun (RunManager.ts:226-230, ungated) reachable in the headless door solely via bossKillSecuresRun (HeadlessContractSim.ts:2058), and this contract declares no twist.baron. Independently the wave ceiling is secureWave+2 = 2 (gr-sim.mjs:111). Confirmed empirically: pendingSecure absent from all 24 views across 4 runs.
- Determinism (rider, verbatim): attempt-1 re-rode ctrl-v1 and reproduced tune-1's eventLogHash fnv1a32:ff497859 bit for bit (same waves/time/gold/calls).
- Economy ceiling (rider, verbatim): 180 gold is the map's hard 60-second ceiling: exactly two seam generations x 3 live seams x 30 capacity. The E1 bank cap (200) is published and live but structurally unreachable here -- the wave-2 clock stops the run one seam generation (20 gold) short.
- Submission call (rider, verbatim): DO NOT SUBMIT. The run is unsecured (endReason wave-ceiling), and skill.md forbids submitting a run that hits an external cap. The contract is additionally refused by the county as `training_ground` (practice.standings=false; the board marks it data-training-ground=true and publishes no standings row). Nothing is put forward.

## generation 42 — 2026-09-05T17:04:52.129Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 86e53f37efee27cc9e1333b7dba29719c61e002ed2edfdd5cda8d729545df77b · contracts: e3-moth-season
cost: wallClock 737s · setupToFirstOutput 75s · tokens in 154 / out 125318 (+cache read 18836687) over 77 turns, 41 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w12 / 360.000s / 200g / calls 54 · runs 4 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:ed3974ff, rank 2. Heat 12 (mechanic-changed), ride 6.
- Winnability (rider, verbatim): Secured, and the margin was **wide on health and thin on the fort**: the hero never dropped below its running maximum of 100 across all 74 views and finished **119/175 at level 16**, but **all six beacons were wrecked** by the bank with 63 threats alive, so the fort was gone and the last wave was carried by the hero alone — one more wave on that slope would have been a coin flip.
- What the map asked (rider, verbatim): It asked me about **the grid, and the county's own audit of this contract is now out of date in my favour** — my generation-14 notebook called this map a RESKIN whose named mechanic was "real, fully specified, and entirely optional." That is no longer true. E3's signature is the grid under sabotage, and after the drain the grid is the **secure gate**: `twist.powerGrid` declares a four-node chain — `corridor-dynamo` (0,−32, 20 W) → `corridor-pylon` (0,−14) → `corridor-gallery` (0,2, 6 W) → `corridor-lamp` (0,6) — with `connect.required: 1` by wave 12, a `completionLatch: "one-way-at-or-before-deadline"` and `missedDeadline: "run-unsecurable"`. The relay boots offline and comes online **only** while a standing, unwrecked `sentry_beacon` sits within 2.5 wu of the pylon site (`syncContractPowerGrid:2370`), which powers the gallery, which latches the objective (`syncCanyonConnectObjective:2442`). The fields that carried it were `now.canyonConnect.{powered,required,byWave,complete,failed}` — genuinely legible, no source import needed — and the order was a single `BUILD sentry_beacon` at (0,−14). Two honest qualifiers, and they pull in opposite directions. The objective itself is **cheap and front-loaded**: it latched at **t = 30.0 s for 25 gold**, and because the latch is one-way I watched `powered` fall back to 0 when the pylon beacon was wrecked at t = 131 while `complete` stayed true for the rest of the run. So the graph reasoning is one subtraction (18 wu and 16 wu spans against `maxSpanLength: 30`) and one order. But the *second-order* consequence of the same twist is the whole contract: **filtering the turret out halves the arsenal**, and the map is hard now not because of the grid but because ~20 dps beacons must hold a claim that `fevered_saboteur`s reach from wave 4. The moth layer is unchanged and still strictly dominated — moths do zero contact and zero building damage, damage only a `decoy_shed` the rider volunteers, and `count = max(4, lightSources)`, so I built no decoy and no lantern and the migration idled. The rest was ordinary survival read off `now.works.entries` (position + `wrecked`), `now.seams`, `now.gold`, `now.hero.hp/maxHp/level`, `now.threats.alive/wreckers`, `now.pendingOffer`, with `BUILD`, `HARVEST`, `PICK_UPGRADE`, `BLAST_AT` and one `SECURE_CHOICE`. There is no E3 verb. **Does it still play the way my notebook remembers? No — and that is the headline.** Same seed, same tile, same moths; a different contract. The mechanic my notebook called optional is now the gate, and the four turrets my notebook won with cannot be built.
- Lessons (rider, verbatim):
  - **A contract row rewrite can delete a buildable, and the deletion is two files away from the
    edit.** `twist.powerGrid` exists → `MechanicsManifest.ts:828` filters `turret` → that filtered
    set becomes the sim's build gate at `HeadlessContractSim:1030`. Generation 14 won this map with
    four turrets; generation 42 cannot build one. **When an era-pin says "contract data, zero src/
    edits", the src/ that READS that data is exactly where the change lands.** Re-derive the roster
    from `stablePrefix.mechanics.buildables` every ride and never from the epoch or from memory.
  - **Check whether a manifest filter is descriptive or enforced before you believe either way.**
    Generations 11 and 13 both wrote "assume beacons and chaff when powerGrid exists" and neither
    ever tested it. I traced the filter to the constructor argument that gates the build, which is
    the difference between a habit and a fact. The same trace also showed the *opposite* for
    beacons: `isShooterPowered` is `id !== 'turret' || powerConsumerAt(...)` (BuildSystem:2205), so
    a beacon on a powerGrid map always fires — the grid does not mute my own guns.
  - **`[]` IS A WIPE, AND A FILTER THAT CAN RETURN EMPTY IS A WIPE GENERATOR.** My v2 filtered the
    seam chain to `distance(claim) <= 24`. This map's three live anchors re-anchor between waves
    and from t = 90 all three sat at 25.5–28.9 wu, so the tail emptied, the array emptied, and the
    door's own bolded warning came true: `now.orders` went to `{}`, the Prospector stood at
    (−1.7, 10.6) for 200 seconds, and `goldPanned` froze at 60. **Every array-building path needs a
    terminal anchor order that cannot be filtered away** — I now append a `HOLD` on the claim when
    the array would otherwise be empty. Two of my four runs died of a frozen purse and neither
    cause was the map.
  - **`score.goldPanned` going flat is the single most diagnostic number on the board.** It caught
    both economy bugs in this heat and it caught generation 39's dead sink. Log it every view; a
    flat line while gold is not at the cap means the worker is not working, and the cause is always
    an order, never the map.
  - **A travelling verb that fails is not a free decision point.** tune-1 re-issued `REPAIR_UNDER`
    every view with 0 gold; it walked, failed, walked back, and froze the purse from t = 110.
    Generation 40 wrote this down and I paid it again anyway. `HARVEST` on a drained seam is free
    because the Prospector is already standing there; `REPAIR_UNDER` and `BUILD` are not.
  - **The blank-line rule is the whole cure for `reel_too_large`, and it is worth 25×.** tune-1 was
    437,836 bytes at **wave 8** against a 576,176 ceiling — a wave-12 ride on that policy is
    refused. Answering a view that needs no new order set with `"\n"` (gr-sim records no entry)
    took the securing run to 136,159 bytes / 54 entries for a longer ride. Compute the ceiling
    first — `16 + ceil(maxTicks/5) × 160` — then budget entries against it, and resubmit only on a
    real change in the plan signature or when the worklist is nearly drained.
  - **Cheap rungs starve expensive ones, still, and I re-introduced the bug I have already fixed
    twice.** tune-1's palisades fired every time gold crossed 10 and ate 120 gold in ten-gold
    bites; only two beacons ever stood, and every palisade was wrecked by wave 7 anyway. On a board
    where one buildable is the only damage, buy nothing else until its ladder is finished.
  - **A one-way latch is a licence to abandon the asset.** The pylon beacon is 26 wu from the claim,
    undefendable, and it was wrecked at t = 131 — and it did not matter, because
    `canyonConnectCompletedByDeadline` had latched at t = 30. Read the latch direction before
    pricing the defence of an objective; here it turned a "defend the circuit for twelve waves"
    brief into a 25-gold errand that also bought a distant decoy.
  - **`unclaimed`/first-secured on the door list is a fact about the OLD engine.** This contract
    was listed as first-secured by me on 2026-09-03, and the heat still had to be re-ridden because
    the map moved underneath the row. A standings row dates the reel, not the contract.

## generation 43 — 2026-09-05T17:24:39.434Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 86e53f37efee27cc9e1333b7dba29719c61e002ed2edfdd5cda8d729545df77b · contracts: e7-relay-rush
cost: wallClock 1081s (WALL HIT at 1500s) · setupToFirstOutput 210s · tokens in 166 / out 123538 (+cache read 21093067) over 83 turns, 46 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w20 / 600.000s / 200g / calls 68 · runs 4 · scored attempts 1 · worldModel sim-import. Door: pending. Heat 12 (mechanic-changed), ride 7.
- Winnability: the rider wrote no Winnability section.
- What the map asked: the rider wrote no such section.
- Lessons: the rider wrote no Lessons section (see the report/transcript in the evidence dir).

## generation 44 — 2026-09-05T17:55:08.737Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 86e53f37efee27cc9e1333b7dba29719c61e002ed2edfdd5cda8d729545df77b · contracts: e7-echo-canyon
cost: wallClock 1082s (WALL HIT at 1500s) · setupToFirstOutput 106s · tokens in 96 / out 63293 (+cache read 11361343) over 48 turns, 28 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w20 / 600.000s / 200g / calls 65 · runs 1 · scored attempts 0 · worldModel sim-import. Door: verified fnv1a32:8007b47d. Heat 12 (mechanic-changed), ride 8.
- Winnability: the rider wrote no Winnability section.
- What the map asked: the rider wrote no such section.
- Lessons: the rider wrote no Lessons section (see the report/transcript in the evidence dir).

## generation 45 — 2026-09-05T18:08:17.933Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 86e53f37efee27cc9e1333b7dba29719c61e002ed2edfdd5cda8d729545df77b · contracts: e7-dead-band
cost: wallClock 609s · setupToFirstOutput 150s · tokens in 126 / out 82810 (+cache read 14733420) over 63 turns, 30 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w20 / 600.000s / 200g / calls 83 · runs 3 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:e181301c. Heat 12 (mechanic-changed), ride 9.
- Winnability (rider, verbatim): Secured, and the margin was **wide in the middle and honestly thin at the close**: zero of ten works were ever wrecked and the hero held its full running maximum through wave 12, but it bled from 175 to a low of **47/175** in the last four waves and finished at 100/175 (level 29) against 28 live threats — one more wave on that slope would have been a coin flip, and the wave-20 gate is what made it comfortable. The thing with real slack was the reel, not the play: 17638 against an 18000 tick ceiling and 308 KB against 576 KB.
- What the map asked (rider, verbatim): It asked me for its era's signature mechanic **squarely, in one order, and the county's own prose is the whole answer** — this is not ordinary stationary survival wearing E7's name any more, though it was when I last rode it. E7 is playbooks and the Echo, and the Dead Band's proof is `refusal`: `now.playbookUse.objective` is `"refusal"`, and `E7PlaybookLatch.allowsSecure` returns `suppressedUses > 0`, which `HeadlessContractSim` ANDs into the secure gate — so no wave count can secure this claim until a `PLAYBOOK_USE` has been **refused**. The decisive detail is an ordering one I checked in source before writing an order: in `usePlaybook` (`HeadlessContractSim.ts:2823`) the suppression gate is asked **before** the `NOTHING_RECORDED` gate, and `SignalSuppression.refuse` counts the refusal on the way through. So the objective is reachable on view 0 with nothing yet demonstrated. Mine latched at **t = 0.033 s** off one order — `{"verb":"PLAYBOOK_USE","name":"dead-band-1"}` — answered `signal-suppressed: The dead band swallows it.`, `refusals.suppressed: 1`, `objectiveMet: true`. This is the only map where failing the verb is passing the contract, and it is the most legible era gate I have ridden: `now.playbookUse` and `now.signalSuppression` publish declaration, objective, refusal counts and the last answer, so a rider working from the view alone has everything. The honest qualifier is that it is **cheap and front-loaded** — one order in the first thirty milliseconds of a 600-second contract, and the era never asks again. The remaining 599.97 seconds are ordinary survival, and that is where the run was actually won or lost. The fields that carried it: `now.works.byKind`/`entries` (placement, `index` and **`tier`** — the field that decided the heat), `now.seams[].active/x/z`, `now.gold` against the 200 cap, `now.score.goldPanned` (the diagnostic that found the fault), `now.hero.hp/maxHp/level`, `now.threats.alive` (peaked 28), `now.orders[].status/reason`, `now.pendingOffer`/`now.pendingSecure`. The orders: `PLAYBOOK_USE`, `BUILD`, `HARVEST`, `PICK_UPGRADE`, `MOVE_TO`, `CONTEXT_ACTION upgrade`, `BLAST_AT`, `HOLD`, and one blank line. Geography was kind: the claim at (0, 12) sits on the north edge of `dead-band-yard` (x −30..30, z −42..12), so build ground reaches the welded hero — the exact inverse of `e7-relay-valley`, which reuses this tile and puts every zone 31.24 wu away. And the roster is one id, `data_rustler`, `thief: true` — which forces `wrecker = false`, so no work can be attacked: **0 of 10 works wrecked across 928 kills**, `goldStolen` 0, and `REPAIR_UNDER` would have been dead weight. **Does my notebook's memory of this map still hold?** Half of it. Generation 27 rode this same seed and reported `now.signalSuppression` as a permanent row of zeros — "published honestly, nothing to show", a mechanic unreachable by construction because the grammar had no playbook verb. **That has moved**: the verb exists, the refusal is counted, and the counted refusal is now the secure gate. The *survival* half is unchanged — same welded hero, same thief-only roster, same 22.8 wu near seam against a 42 wu far pair, same wave-20 default.
- Lessons (rider, verbatim):
  - **The door document told me the whole contract before I opened a file, and it was right.** The E7
    paragraph in `skill.md` says the Dead Band's `refusal` objective wants the refusal itself and that
    this is "the only map where failing the verb is passing the contract." That was not flavour text —
    it was the secure gate, stated plainly. Generation 13 learned to reproduce a named prover's recipe;
    the cheaper version is: **read the door's own paragraph for the map you are riding before reading
    any source, then verify it in one grep.** Two minutes turned a 600-second contract into one order.
  - **When a gate is a counter, find out WHICH check increments it and in what ORDER.** Everything here
    turned on `usePlaybook` asking `signalSuppression.refuse()` *before* the `NOTHING_RECORDED` branch.
    Had the order been reversed, the objective would have needed a prior demonstration and my opening
    array would have been wrong. `refuse()` counts on the way through and its own comment says so
    ("call this exactly once per attempted use so the counters stay evidence rather than decoration").
    **Read the early-return order of the function that moves the counter, not just the predicate that
    reads it.** Gen-12 said enumerate every clause of a conjunctive gate; this is the same move one
    level down, inside a single function.
  - **`score.goldPanned` going FLAT is still the single most diagnostic number on the board, and it
    has now caught the same fault in two consecutive generations.** Gen-39 found the dead sink on
    `e8-mare-claim` this way; tune-1 here showed the identical signature — ladder complete at wave 9,
    gold pinned at 200, `goldPanned` frozen at 870 — and the same cure moved it from w18 to a w20
    secure. Panning into a full bucket credits nothing, so a capped purse does not merely waste the
    surplus, it **switches the economy off**: spending 150 re-opens the income. Final run panned
    **1470** against tune-1's 870 for the same policy plus one sink.
  - **Enumerate the sinks against the CAP, not against the price list.** `Balance.tiers.turret` is
    `[0, 150, 300]` and `sentry_beacon` has no tier row at all — so with a 200 bank cap, tier 3 is
    structurally unreachable and the entire remaining spend on this board is **4 × 150 = 600 gold**.
    Knowing the sink was exactly 600 told me the fix was sufficient before I rode it. Compute
    `sum(affordable tiers) vs wasted income` and you know whether the lever is big enough.
  - **`Math.max(1, tier)` indexes the tier cost correctly under BOTH conventions.** Generation 39 lost
    a run to reading `works.entries[].tier` as 0-based when it is 1-based. Rather than re-derive which
    it is under time pressure, note that the *next* cost is `TIER_COST[max(1, tier)]` whether tier is
    0-based or 1-based — the two conventions agree on every rung. A defensive index beat a second
    source read, and all four turrets reached tier 2.
  - **The gen-6→39 skeleton secured this on its second ride, and the one variable I changed was the one
    the data named.** `PICK_UPGRADE` first under replace semantics; a plan-time-affordable
    non-decreasing price prefix; more candidates than slots with a refusal blacklist fed from
    `now.orders[].reason`; a plating-first scorer; the tail stacked on the nearest live seam; a
    terminal `HOLD` that cannot be filtered away; a blank line at `pendingSecure`. Ten builds, zero
    refusals, maxHp 100 → 175. Generation 29 warned against changing two things in a last attempt — I
    changed exactly one, and the diff between the two runs is therefore a measurement rather than a
    guess.
  - **The blank line is doing two jobs and both paid.** It kept the last accepted order at tick 17638
    of an 18000-tick envelope (F-HEAT11-1), and answering unchanged views with `"\n"` held the reel to
    83 entries / 308 KB where a resubmit-every-view policy would have run to the `reel_too_large`
    ceiling. Fifth contract running for the secure-boundary half; second for the byte-budget half.
  - **A contract's standings row dates the reel, not the contract — and I am now the rider being
    corrected by that.** `e7-dead-band` is listed as first secured by me on 2026-09-04, and the map
    still had to be re-ridden because the mechanic moved underneath the row. My own generation-27
    finding ("published honestly, nothing to show") was the most confidently wrong thing I carried into
    this heat. **Re-run the `now`-key dump on every ride, especially when the notebook says the era is
    inert.** The era-pin ledger names which findings have expired; read it as a diff against the
    notebook, not as background.
  - **Shell redirection was blocked in this arena, and the fix was to stop using the shell.** A node
    runner that spawns `gr-sim`, drives the controller, logs every view and writes
    `gauntlet-outcome.json` on every child exit is strictly better than a pipeline anyway — it made the
    intermediate-results law automatic and gave me the per-view log that found the frozen purse.
    Generation 37 lost its best run to a process that only reported at exit; the runner is the cure.

## generation 46 — 2026-09-05T18:26:24.659Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 86e53f37efee27cc9e1333b7dba29719c61e002ed2edfdd5cda8d729545df77b · contracts: e5-stillwater
cost: wallClock 876s · setupToFirstOutput 225s · tokens in 162 / out 122122 (+cache read 21429293) over 81 turns, 52 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w12 / 360.000s / 200g / calls 11 · runs 2 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:338d5c80, rank 1. Heat 12 (mechanic-changed), ride 10.
- Winnability (rider, verbatim): Secured, and the margin was **wide in every direction at once**: the hero finished the run having taken **zero damage across all 12 waves and 20 views**, gold sat pinned at the bank cap for the last 167 seconds, and the loop's single point of failure — the ballista's own pad — banked at **51 of 96 integrity**, seventeen more strikes (≈ 68 seconds) of slack beyond the secure.
- What the map asked (rider, verbatim): It asked me about **the storm as a schedule I had to read and then refuse to fight**, and about noise — so it is not ordinary stationary survival wearing the era's name, but the era's *named* signature is only half live here. E5's ladder line is "storms schedule the waves". After the split they explicitly do **not** on this map: `deepwaterStormDisablesScheduledWaves` returns false for any contract carrying `tileParams.stillwater`, so the 32-second storm cycle runs *beside* the ordinary scheduler instead of replacing it. What the storm now does is **crew** — one `corsair_skiff` per front — and the fields that carried that reading were `now.deepwater.storm.weather.{phase,cycle,simTime}`, `storm.waves[].scheduledAt/fromX/toX`, `storm.frontX`, and `corsairsSpawned`/`corsairsRecycledAtExit`. The honest finding is that the new crew is **structurally harmless to a played rider**: `DeepwaterSocket:263` scripts every skiff straight across the board to `(toX − 2, z)` — west to east along z = 0 — and `recycleCorsairsAtExit` removes it at x ≥ 62. The skiffs never turn on a hero welded at (0, 30), 30 wu north of their lane. Both published storm multipliers are inert too: the only consumer of `deepwater.movementMultiplier` is the Regatta's fast-water band (`HeadlessContractSim:1837`), and the enemy-speed product at `:1817` carries night, atomic and motor terms but no deepwater one. So "prediction under adversarial weather" is, on this contract, a legible timetable attached to a convoy that passes by. The mechanic that decides the map is still `noise_hunt`, and it is the most load-bearing thing in E5. `NoiseHuntSystem.steer()` `scriptMoveTo`s **every living `machine_leviathan`** at the trail point, and the roster's only depth traveller is that one id — so a sustained trail redirects the whole board. The trail is the loudest audible source, the sources ride the boat's anchor, and `harpoon-reload` (r14) runs for three seconds after every `harpoonBallista` fire — which makes the loop self-sustaining once a deck ballista has targets in range. The orders that carried it were **`BOAT_BUILD` ×3** and **one `REANCHOR`** to `shelf-watch` (36, 30), plus `HARVEST`, `HOLD`, and one blank line at the secure boundary. Not a gold piece was spent: both era verbs are free. **Does it still play the way my notebook remembers?** Yes in its bones and no in its numbers. Generation 22 rode this seed and reported the storm *suppressed and provably so* — `corsairsPerWave: 0`, `now.deepwater.storm.waves` empty for the whole run. That half of the memory has expired: the storm is now a live 32-second clock with twelve scheduled fronts published in view 0. The noise hunt, the three machines, the two quiet zones, the `shelf-watch` third anchor and the nearest-deck strike rule are all exactly as I left them, and the same lure secured on its first ride. The memory was a good hypothesis about a map that had moved in one place only.
- Lessons (rider, verbatim):
  - **`unclaimed`/first-secured on the door list dates the REEL, not the contract — and the
    era-pin ledger is the diff.** Third heat running that a map I hold a standing on had to be
    re-ridden because it moved underneath the row. Reading `assets/engine-era.json`'s two named
    drains *and then verifying each against the manifest and the predicate that reads it* took four
    minutes and produced the whole contract. Read the ledger as a diff against the notebook, never
    as background.
  - **When a drain "splits a predicate", go read both halves and the conjunct that separates them.**
    `deepwaterStormCarriesCorsairs` and `deepwaterStormDisablesScheduledWaves` differ by exactly
    `&& !contract.tileParams.stillwater`. That one clause is why this map now runs *two* clocks
    instead of one, and it is the difference between "the storm crews the waves" (true) and "the
    storm schedules the waves" (false here). The era's ladder line and the contract's behaviour can
    disagree, and the conjunct is where the disagreement lives.
  - **Find out where a new enemy is SCRIPTED to go before pricing it as a threat.** The whole
    mechanic change is one line: `if (!this.flotilla) enemy.scriptMoveTo(wave.toX - 2, z, ...)`
    (`DeepwaterSocket:263`). Twelve skiffs crossed the board at z = 0 and left; six were recycled
    before the bank. A roster addition with a scripted route is a *parade*, not a pressure curve.
    Gen 19 said re-read `getPos`; gen 21 re-read the target function; gen 46 adds: **re-read the
    spawn call site, because a scripted enemy has no target function at all.**
  - **Two clocks in one view means two cadences to read, and neither predicts the other.** Waves
    landed on 30 s (the ordinary `Balance.waves.waveInterval`), storm fronts on 32 s starting at
    t = 8. Reading only one of them would have made both look jittery. When a contract publishes a
    weather cycle *and* `timers.nextWaveInSeconds`, check whether they are the same clock before
    planning around either.
  - **The strike's nearest-deck selector makes cheap pads into armour, and any string is a pad.**
    `ClaimBoat.placeBuilding` accepts *any* non-empty `buildingId` with no roster check, while
    `DeepwaterArsenal` only reads `turret` and `sentry_beacon` — so a `palisade` on a pad is pure,
    free deck mass that exists only to be nearest to the emitter. bow (1.0 wu from the trail
    emitter) ate 32 strikes, port ate the next 32, and the ballista on starboard (5.83 wu) did not
    take its first hit until t ≈ 300. Two sacrificial pads bought 64 of the run's 79 strikes.
  - **Correct the source's own comment: the door's `HARVEST` DOES engage the harvest channel.**
    `NoiseHuntSystem`'s header states that "the public HARVEST verb (`panAt`) is a single-tick HAND
    pan and never engages the channel", and my generation-22 self carried that as fact. At t = 193.4
    — the one view sampled while the Prospector was mid-pan at a seam — `air-pump` reads
    `running: true, level: 18` and takes the trail off `harpoon-reload`. It cost nothing here
    because both emitters ride the same anchor 3.6 wu apart, but on a map where they did not, a
    rider panning at the wrong moment would move the whole board. **A comment describing a seam is
    a claim about the other engine; check it in the view before relying on the silence.**
  - **The free levers were the entire game again, and the gold was free on top.** `BOAT_BUILD` and
    `REANCHOR` cost nothing and have no range check; four orders in the first two views bought a
    defence that held a hero alone for six minutes. Because the Prospector cannot be hit (contact
    resolves on the hero) and the pack is lured 36 wu east, its 62 wu commute to the wrecks is
    genuinely free — generation 22 declined the seams and banked 0 gold; the same lure banked the
    **200 cap** with no risk taken. **Once the objective's threat is redirected rather than fought,
    re-price every errand you previously declined.**
  - **Gate the phase transition on the live precondition, and it works first try.** `anchor ===
    'lagoon' && trail.target !== null && threats.alive >= 8 && starboard occupied` fired at the
    t = 30 view; the pack crossed 39 wu on 6 s of engine noise plus the 8 s trail hold and relit on
    the ballista at the far end. Generation 22 paid a run to learn that a t = 0 reanchor lights
    nothing; inheriting the *condition* rather than the *clock* is what made this a first-ride win.
  - **Track pads the tile has LOST, not just pads the view reports occupied.**
    `boatBuildings` filters out knocked-out pads, so my "unoccupied" set re-grew as decks died and
    I re-attempted `BOAT_BUILD` on ground `placeBoatBuilding` refuses by rule
    (`!lostHullPads.has(padId)`). Nine harmless refusals that happened to buy decision points — but
    a refusal you did not intend is a bug that got lucky.
  - **Answering the unchanged views with a blank line is doing three jobs now.** 20 views became 11
    tape entries and 22.5 KB against a 592 KB ceiling, the last accepted order landed 1800 ticks
    inside the envelope, and the secure boundary defaulted to `bank` for free. The one refinement
    this ride adds: **an array carrying a draining worklist (`HARVEST`) must always be resubmitted**
    — dedupe by signature only when the array has nothing left to refill, or the chain drains once
    and the purse freezes.
  - **Write the outcome file after every run, before the analysis — and then hand-write the final
    row.** Fifteenth generation saying it, twelfth doing it; the runner wrote a truthful row on the
    idle probe's exit. And the generation-23/24/30/31/34 caveat bit for the fifth time exactly as
    predicted: the best-so-far comparator could not know which run I had chosen to *call* my scored
    attempt, nor that the promoted tape lives under a second filename. **Check the file says what
    you mean.**

## generation 47 — 2026-09-05T18:39:35.770Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 86e53f37efee27cc9e1333b7dba29719c61e002ed2edfdd5cda8d729545df77b · contracts: e8-far-side
cost: wallClock 732s · setupToFirstOutput 165s · tokens in 136 / out 114590 (+cache read 17311878) over 68 turns, 34 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w20 / 600.000s / 200g / calls 83 · runs 3 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:a9448c78. Heat 12 (mechanic-changed), ride 11.
- Winnability (rider, verbatim): Secured, and the margin was **wide in every direction at once**: the hero **never dropped below its running maximum across all 87 views** (minimum 100, finishing 139/175 at level 29), all ten works stood unwrecked with **every one of the four turrets at tier 2**, gold finished pinned at the 200 cap off 1 470 panned, and the era gate closed with 31.2 s of suit still in hand and not one breathless entry — the only thing with a thin margin was tune-1's economy, which is what the ride was actually spent fixing.
- What the map asked (rider, verbatim): It asked me for **an air budget on a 152-unit round trip**, and on the audit question this contract now genuinely **exercises** its era's signature mechanic where my own notebook says it did not. E8's line is "low gravity, air as wall (transfer under changed physics)". Half of that is still theatre and half is now the contract. The *gravity* half remains decorative: `now.gravity` publishes `feelG 0.6`, `movement: "floaty"`, `lobArcDistanceMultiplier` 2.4, `knockbackScale` 1.3, `vacuum: true`, and none of it reaches the body I move — I used the 2.4× lob only as free supplementary `BLAST_AT` damage and never took `SET_WEAPON blast`, on generation 29's measurement that the auto-lob is ~10 dps against the Spark Rig's 24. The *air* half is the map. The fields that carried it were `now.air.suit.seconds/inDome/empty`, `now.air.crossing.{zones,required,reached,breathlessEntries,complete}`, `now.air.domes[].air` (one dome, `far-side-landing-yard`) and `now.probeRecovery.recovered/zones`; the orders were `MOVE_TO` to (0,45), **`CONTEXT_ACTION recover`** in the same draining array, and a `HOLD` refill guard that never had to fire. Both gates shut inside one dispatch — crossing complete at t = 255.7, probe recovered at t = 270.0, minimum suit **31.2 s of 60**, `breathlessEntries` **0**. The honest qualifier is that the era's ask is *cheap and front-loadable*: it is one round trip out of a 600-second contract, and the other 560 seconds are ordinary stationary survival in a generous pocket — the yard contains the claim, so unlike its sibling `e8-mare-claim` the fort can ring the welded hero instead of sitting six units south of it. The roster is one id with no `wrecker` and no `thief` flag, so no work can be attacked and no gold stolen (0 wrecked of 10, `goldStolen` 0), which deletes `REPAIR_UNDER` and palisades from the design and makes every gold a monotone investment. **Does it still play the way my notebook remembers?** No — and that is the headline. Generation 34 secured this map having reported that `atmosphere.airIsWall: false` meant "`now.air` is simply absent from all 69 views… the whole apparatus that made `e8-mare-claim` an E8 map is switched off by one boolean." That sentence is now false: `airIsWall: false` no longer means no air, it means no *breachable* dome (`breachable = atmosphere.airIsWall === true`), and a separate id-scoped consumer supplies a suit and a crossing latch anyway. The walk my notebook remembers is the same walk; what is new is that you must arrive still breathing.
- Lessons (rider, verbatim):
  - **`airIsWall: false` no longer means "no air" — re-read the consumer, not the boolean.** My
    generation-34 self wrote that one manifest flag "turns E8's signature mechanic off completely" on
    this map. `E8SuitAirSystem` now arms off an **id list** (`SUIT_AIR_CONTRACT_IDS`) plus the mere
    presence of an `atmosphere` block, and `airIsWall` survives only as `breachable` — whether a
    sieger can breach a dome. The flag I generalised from changed meaning underneath me while keeping
    its name and value. **A boolean's consumer is the fact; the boolean is a hypothesis.**
  - **Two contracts in the same epoch really are different games, and now so are two engines of the
    same contract.** Generation 34's ride and this one are the same map, the same seed and the same
    terrain, and one has a suit gate the other cannot see. `assets/engine-era.json`'s pin prose named
    the drain, and the *idle floor hash it quotes* is the cheapest possible confirmation that you are
    on the changed board: one ten-second probe, one hash comparison, and my notebook's authority was
    correctly demoted before I wrote an order.
  - **When an era system is small, read it end to end — it will hand you the whole contract.** Fifth
    generation running this has paid (gen 22 `NOISE_HUNT_RULES`, gen 29 `E8PhysicsSystem`, gen 34
    `ProbeRecovery`, gen 45 `usePlaybook`). `E8SuitAirSystem` is ~420 lines and its header comment
    derives, in prose, which zones become shelters and which become crossings for each of the three
    siblings. That told me the dome is the landing yard and the crossing is the crater *before* the
    probe ran.
  - **Find out which side of the shelter your economy stands on.** The map's real trap is not the walk,
    it is that half the harvest anchors are inside the breathing dome and half are outside. Panning at
    (±16,−34) refills the suit; panning at (±9,−22) drains it. I gated the seam sort on
    `crossPending` so the in-yard seam is preferred only while a run-losing gate is still open, and
    distance takes over once it shuts. **When a mechanic reads the worker's position, audit every
    routine errand that moves the worker.**
  - **Round-robin panning is a commute generator, and I paid generation 15's lesson a third time.**
    tune-1 alternated two seams 26 units apart with `ranked[i % n]`, buying a 5.4 s walk per 5-gold
    tick: 670 gold at **1.29 g/s** against a ~1 175-gold ladder, so the fort never finished and the
    hero died three waves short. Draining one seam in a block of 7 before walking to the next took the
    same policy to **1 470 gold** and a wave-20 secure. Gen 15 wrote "chain by seam when the seams are
    near, stack by seam when they are far" — 26 units is *far* against a 1.5 s pan tick, and I should
    measure that ratio rather than eyeball "near".
  - **Ascending-price gates are the starvation bug wearing a fix's clothes.** I re-derived the ladder
    by dps-per-gold (turret 50 g → 1.14 dps/g, beacon 25 g → ~1.0, turret 70 g → 0.81 …), which on this
    price curve is simply cheapest-next — and then nearly shipped it as per-rung gates in ascending
    order, where a 35-gold beacon fires on gold a 50-gold turret is still waiting for. **Cumulative
    gating** (rung *i* gated at the sum of costs 0..*i*) makes the theft unreachable by construction
    instead of by a truncation rule. Interleaving cheap beacons with turrets is what put dps on the
    board early; tune-1's turrets-first ladder had **one** turret at wave 4 and a hero at 45/175 by
    wave 7.
  - **The blank line did three jobs again and cost one line of controller.** It banked the wave-20
    secure for free (`defaultedSecure: 1`), left the last accepted order 363 ticks inside the envelope,
    and — answering unchanged views with `"\n"` — held an 87-view run to 83 entries and 255 KB against
    a 576 KB ceiling. Sixth contract running. It is standing equipment, not a trick.
  - **Measure the envelope on the first reel that exists.** Ticks, entries and bytes are three
    independent ceilings and the runner now prints all three on every child exit, so tune-1 was already
    audited before tune-2 existed. Securing and producing a submittable reel are still different
    achievements.
  - **The node runner is the cure for a blocked shell, and it makes the intermediate-results law
    automatic.** Redirection was refused in this arena exactly as generation 45 found. A runner that
    spawns `gr-sim`, drives the controller, logs every view to JSONL and writes `gauntlet-outcome.json`
    on every child exit gave me the per-view table that diagnosed the economy in one command — and a
    truthful row on disk from the idle probe onward.
  - **Hand-write the final row.** Seventh generation where the best-so-far comparator could not know
    which run I had chosen to *call* my scored attempt, nor that the promoted tape lives under a second
    filename. The brief is explicit that the operator reads the `tape` field, not the filename; I wrote
    both and said plainly in the file that they are one ride.

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

## generation 49 — 2026-09-05T19:05:02.260Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 86e53f37efee27cc9e1333b7dba29719c61e002ed2edfdd5cda8d729545df77b · contracts: e8-eclipse
cost: wallClock 719s · setupToFirstOutput 45s · tokens in 126 / out 91033 (+cache read 16309378) over 63 turns, 38 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): NOT SECURED — w19 / 585.200s / 190g / calls 89 · runs 4 · scored attempts 1 · worldModel sim-import. Door: nothing submitted — the ride did not secure. Heat 12 (mechanic-changed), ride 13.
- Winnability (rider, verbatim): **Yes — winnable, and what stopped me was my own budget, not a wall:** the era gate is met by wave 11 with 72 credited pans to spare, the fort takes zero damage all run (`works.wrecked` 0 of 10), and the curve is 577.3 s → 585.2 s across two controllers, i.e. **14.8 seconds** short of a 600-second gate my own generation 36 already banked on this seed — with the one lever that closes it, ~600 gold of turret tier-2 upgrades, provably never spent (`CONTEXT_ACTION` orders emitted: **0** in 89 arrays, because I gated the sink on a `gold >= 150` instant that a 200-cap purse being drained by a ten-rung ladder never presents at a view boundary; the fix is to gate on `works.entries[].tier < 2` and re-issue the pair every view instead of on a gold instant).
- What the map asked (rider, verbatim): It asked me about **air as a route the eclipse takes away** — genuinely, legibly, and far more cheaply than the framing suggests; the county's old RESKIN reading of this contract is now out of date, and my own notebook's reading of it is worse than out of date, it is inverted. Generation 36 secured this map and reported that `atmosphere.airIsWall: true` bought nothing because the view published **no `now.air` at all**. That is now false twice over: `now.air` is live with a suit (60 s capacity, 1 s/s drain outside a dome, 4/s refill inside), a per-pad breach dial, a regolith latch, **and** an `eclipse` block no other map has. The mechanic is real, it gates the secure at every wave, and it is the only E8 map where the era's lever changes state mid-run rather than being a standing condition. The fields that carried it were `now.air.suit.seconds`/`inDome`, `now.air.regolith.worked/required`, and `now.air.eclipse.{arrived, arrivedAtWave, offline, reserve, groundsWorkedAfter, requiredAfter}`; the orders were `HOLD` on the reserve pad and `HARVEST`. There is no E8 verb — the transfer is answered with epoch-1 grammar and one coordinate. The honest qualifier is that the gate is **cheap and I paid it without difficulty**. `required` and `requiredAfter` are both 1, so the whole air wall costs two credited pans in a 600-second run: `worked` was non-empty by wave 1 (the opening `HARVEST` lands with the suit near full), and after the shadow arrived at wave 10 my one-wave charge at `dome-cluster-pad-center` (0, 3.5) carried the suit to 51 s, from which the ordinary economy tail credited `groundsWorkedAfter` **73** times against a requirement of 1. The transfer the teaching intent is named for — "reserves are love letters to your future self" — is a real decision that costs exactly one wave of panning, made once, at a wave the view refuses to announce. Between the pans the suit sits empty for hundreds of seconds and 189 breathless pans cost nothing: the consumer damages nothing and mints nothing by design (the Same Laws law), so `emptySeconds` is a diagnostic, not a threat. **What actually killed all three rides was ordinary stationary survival** on the inherited Mare Claim geometry: a hero welded at (0, 12) that no buildable can come within 6 wu of, against a continuous 2.4-second trickle that put 38 live threats on the board by wave 19.
- Lessons (rider, verbatim):
  - **`airIsWall: true` did nothing on this map in generation 36 and gates the secure now — and the
    block that carries it is one no sibling publishes.** I rode `e8-far-side` and `e8-low-orbit` in this
    same heat and both ride `crossing`; the Eclipse authors no crossing zones, so it falls through to
    the regolith latch **plus** an `eclipse` after-gate. Three maps, one consumer, three different
    objectives, and the branch is chosen by which rectangles the contract happens to author
    (`E8SuitAirSystem.create:186-219`). **Read the create() derivation, not the sibling you rode an hour
    ago.**
  - **A mid-run era event whose arrival wave is unpublished is still computable from the source.**
    `atWave = ceil(secureWave / 2)` and `secureWave` falls through to `Balance.run.secureWave = 20`, so
    the shadow lands at wave 10 — derivable before the first order, on a map that deliberately publishes
    no countdown because `firstRunWarning: false`. **When a view withholds a clock on purpose, the
    constant that sets it is usually one `??` away.**
  - **Gate a spend on a STATE, never on a gold instant.** `pending.length === 0 && now.gold >= 150`
    looks equivalent to "spend the surplus" and is not: with a 200 bank cap and a ladder draining the
    purse, gold was never ≥ 150 at any of 89 view boundaries, so my scored attempt reproduced its
    predecessor **bit for bit** and I spent a run learning nothing. The correct shape is the one that
    won generations 45 and 48: find the first `works.entries[]` whose `tier < 2`, emit
    `MOVE_TO` + `CONTEXT_ACTION upgrade` **every view**, and let the order's own affordability rule
    decide — a re-issued order that waits is free; an order that is never emitted is 600 gold.
  - **Verify a new order actually appeared in the tape, not just that you wrote the branch.** One line
    — count `CONTEXT_ACTION` orders across `inputLog.entries` — would have caught this on tune-2 and
    given me a real third run. An identical `eventLogHash` between two runs whose controllers differ is
    a *loud* signal that the diff never executed; I should read the hash equality as a bug report,
    not as determinism.
  - **`HARVEST` slots are the income cap, and ten of them is half a wave.** One `HARVEST` is one 1.5 s
    pan tick, so ten orders is fifteen seconds of work against a thirty-second wave — exactly the
    60 g/wave plateau tune-1 sat on for twelve straight waves. Filling the array to 31 took panning to
    1 460 g. **Size the tail against the view gap in seconds, not by taste.**
  - **The idle floor is now the cheapest proof that an era consumer is inert or live.** Idle here shows
    suit 60 → 30 → 0 on a perfect 1 s/s line and then *nothing happening for twenty seconds of death*:
    the air wall measures and never damages. That told me before I wrote an order that the suit is a
    gate on credit, not a threat to survive, and that the whole air problem is two pans.
  - **Three runs is not a heat, and I front-loaded the wrong third again.** The source read was worth
    every minute (it produced the entire contract), but I then spent two runs on the economy — which was
    never the binding constraint — and reached the sink bug only on the run I had to call my attempt.
    Generation 32 wrote "reserve the last third for the run that combines what the earlier runs proved";
    this is the third heat running I have proved the parts and not fired the combination.
  - **A standing in my own name on the door list dates the reel, not the contract — fourth heat
    running.** `e8-eclipse` is listed as first secured by me on 2026-09-04, and the map that carries
    that row no longer exists.

## generation 50 — 2026-09-05T19:14:13.568Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 86e53f37efee27cc9e1333b7dba29719c61e002ed2edfdd5cda8d729545df77b · contracts: e4-long-road
cost: wallClock 551s · setupToFirstOutput 90s · tokens in 106 / out 87341 (+cache read 13511620) over 53 turns, 33 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): NOT SECURED — w5 / 157.600s / 35g / calls 15 · runs 3 · scored attempts 0 · worldModel sim-import. Door: nothing submitted — the ride did not secure. Heat 12 (mechanic-changed), ride 14.
- Winnability (rider, verbatim): **Yes, winnable — this same rig secured it at w12 on the previous engine and the gate arithmetic is unchanged — and what stopped me was my own budget, not a wall: three runs against an 18-minute wall, spent on an economy that never funded the fort in time.** The proximate cause is measurable: the six harvest anchors are strung 60 units apart along a 400-unit road, so when the seam nearest the claim (−150, 14) depletes on its 20-second respawn the next live one is 90–150 units away, my nearest-first chain walked the Prospector to x = −30 for five gold, panning ran ≈ 1.0 g/s, and the fourth rung was still unbought when the wave-4 pulse landed on an undefendable hero. The fix is one line I did not get to ride — when no seam within ~40 wu of the claim is active, `HOLD` on that anchor and wait out the respawn instead of walking the map — plus buying plating over damage harder, because on a stake nothing can cover, the draft is the only defence that exists.
- What the map asked (rider, verbatim): It asked me about **distance, road and fuel — E4's signature mechanic, live, legible and decisive** — and then it asked a second, harsher spatial question that I did not answer. The era lever is real and it is not decoration: the secure is a conjunction of `wave >= 12` and `now.motor.objective.arrived`, and `arrived` for `kind: "convoy"` means the lead Hauler has cut its distance to (190,0) to essentially zero, monotonically, out of a 36-fuel run that would need 123 fuel to cross ungraded. That makes the single free `GRADE` at the road's west stake the difference between a winnable contract and an impossible one, and it is issuable in the first two seconds. The fields that carried it were `now.motor.objective` (`kind`, `stop`, `stopReach`, `arrived`), `now.motor.convoy` (`leaderDistance`, `total: 370`), `now.motor.roads.corridors[].start/graded` with `roads.gradeReach`, `now.motor.fuel.nodes[].harvested/progress`, `now.motor.vehicle.state/x/z` and `now.motor.weather.phase`; the orders were `GRADE`, `MOVE_TO`, `HOLD` and (planned, never reached) `HAUL`. The *second* question is the one that beat me and it is also spatial: the map is 400 units long, the hero is welded to the convoy-lead stake at (−180, 0), and **no build zone comes within 32 wu of it** — `west-way-station` is x −148…−124, z −22…−6, whose nearest legal corner (−148, −6) sits 32.6 wu from the hero against a turret's range 16 and a beacon's radius 8. So nothing a rider builds can shoot at the thing that must survive; the works are an interdiction line 40 units up the road, and `works.wrecked` was 0 in every view because `motor_gang` carries no `wrecker` flag, so they cannot bait either. Survival, not the errand, is this contract's real content, and the errand's 380-unit round trip is spent out of the same Prospector's feet that pay for the fort. My notebook remembers this map from generation 18, which secured it w12/360 s on engine `49c34f8b`. **It still plays the way I remember in its bones and not in its margin.** Same convoy latch, same 36-fuel leash, same GRADE-or-die arithmetic, same undefendable stake, same harvest anchors 60 units apart along the road. What did not survive the re-ride is generation 18's comfort: it reports a hero that "never fell below 92" behind four works, and the same fort shape here — three of those four works, up by t=126 — had the hero dead at t=157.6. The memory was a good hypothesis about the map and an over-confident one about the margin.
- Lessons (rider, verbatim):
  - **A notebook entry that says SECURED is a claim about a margin as well as a map, and the margin
    is the part that rots.** Generation 18's geometry, fuel arithmetic and GRADE-first opening all
    reproduced exactly; its "hero never fell below 92 behind four works" did not. Re-derive the
    *survivability* of an inherited plan, not just its shape — I inherited a fort layout and assumed
    it inherited a hero that lives.
  - **Compute `distance(defended point, nearest legal build ground)` against weapon range BEFORE the
    idle probe, and let the null case set the whole plan.** 32.6 wu against turret range 16 was
    available from the manifest in ninety seconds and it says plainly: *no build defends the hero*.
    Generation 26 wrote that the null case IS the finding; I did the subtraction after two rides
    instead of before one, and then spent both of them buying a fort that the arithmetic had already
    told me could not defend the stake.
  - **A seam-depletion fallback is not optional on a map whose anchors are 60 units apart.** My
    "nearest live seam" rule is correct on a compact board and pathological on a 400-unit road: a
    20-second respawn at 33 wu is worth waiting for, a 5-gold pan at 120 wu is not. `HOLD` on the near
    anchor when nothing near is live — the wait is strictly cheaper than the walk, and the whole heat
    turned on ~1.0 g/s where ~2.0 was available.
  - **Two runs that differ in their tails but land the same works are a reproduction, not a
    control.** I changed the ladder and the seam filter and got an identical HP curve and death tick,
    which felt like a strong negative result and is actually only evidence that gold ran out at the
    same place both times. Design the second run so its *first* divergence is the variable under
    test, not its last.
  - **On a map where nothing can defend the hero, the fort is not the survival budget — the draft
    is.** Both runs took plating (maxHp 100 → 150) and still lost 100 hp in twenty seconds at wave 4.
    Generation 6 learned "when the economy is starved, the free lever is the draft"; the sharper
    version for an undefendable stake is that the draft is the *only* lever, so it should have
    outranked the third and fourth rung of a ladder that was shooting at empty road.
  - **`GRADE` remains the cheapest decisive order in the epoch, and it is not where the difficulty
    is.** Both tunes graded the road inside 15 seconds and the terminal outcome confirms it; 123 fuel
    became 19.7 for one order issued 10 wu from the hero's start. When an era lever is that cheap,
    bank it in view 0 and spend the whole rest of the heat on whatever the map is *actually* short
    of — here, hit points.
  - **Budget the heat in runs and fire the synthesis early.** Fourth heat running I have proved the
    parts and not fired the combination (gens 32, 40, 49). Probe, one diagnostic, then the synthesis —
    and the synthesis should be launched before I am sure, because at eighteen minutes a wall arrives
    whether or not the hypothesis is finished.
  - **The intermediate-results law paid again and cost nothing.** The runner writes
    `gauntlet-outcome.json` on every child exit, so a truthful row existed from the idle probe
    onward and the wall could take the session without taking the result.

## generation 51 — 2026-09-05T19:32:14.387Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 86e53f37efee27cc9e1333b7dba29719c61e002ed2edfdd5cda8d729545df77b · contracts: e4-dust-flats
cost: wallClock 1081s (WALL HIT at 1500s) · setupToFirstOutput 75s · tokens in 200 / out 136826 (+cache read 28330494) over 100 turns, 61 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w14 / 426.133s / 55g / calls 52 · runs 5 · scored attempts 1 · worldModel sim-import. Door: POST ok, stored, rank 1 decidedBy crown; assay slip not yet issued at the time of writing. Heat 12 (mechanic-changed), ride 15. The driver crashed before this step on a verdict-slip.json containing the literal string 'undefined'; the operator ran it by hand and cured poll-verdict.mjs so it never writes that file when there is no slip.
- Winnability (rider, verbatim): **Yes — winnable, and what stopped me was my own budget against a measured economy, not a wall in the map, the grammar or the door:** the era gate is discharged at t = 30.8 with 20 of 36 fuel unspent, the roster carries neither `wrecker` nor `thief` so no work can ever be lost, and the fort geometry is solved in closed form — the whole contract reduces to whether 397 seconds of a single Prospector can pay 340 gold for four turrets across a 42 wu seam and a 45 wu fort, and at the 0.60 g/s my best ride actually measured it pays for exactly three, which is why I died 23 seconds before the boss arrived; two of my five runs went to self-inflicted controller faults (a blacklist that poisoned all twenty build coordinates on transient `insufficient_gold` refusals, then an `active`-filtered harvest tail that emptied itself and froze the purse for 90 seconds) rather than to the one question the board was asking, and the untested lever that closes a 100-gold gap is plain — tune-1 measured **0.90 g/s** rotating across live seams against tune-3's **0.60 g/s** camping one.
- What the map asked (rider, verbatim): It asked me about **distance, road and fuel — E4's signature mechanic, live, legible and load-bearing — and then it asked the same question a second time in the shape of a boss.** This is not stationary survival wearing the era's name at either end. The errand is half the win condition, not a flourish: `now.motor.objective.arrived` is ANDed into the secure gate at every wave, and the fuel arithmetic is a real leash — the whole run holds 36 fuel and the naive open-country haul costs 27.5 clear or ~39 under a storm, so a rider that does not stage at the corridor stake and `GRADE` first can strand the objective outright and make the contract unsecurable however long it survives. The fields that carried it were `now.motor.objective` (`kind`, `corridorId`, `stop`, `stopReach`, `arrived`), `now.motor.fuel.nodes[].harvested/progress` with `stored`/`tar`/`drawn`, `now.motor.roads.corridors[].start/graded` with `roads.gradeReach`, `now.motor.vehicle.state/x/z` and `now.motor.weather.phase`; the orders were `MOVE_TO`, `GRADE` and `HAUL`. The boss is the second spatial question and it publishes its own counter — `land_yacht_orbit` gives centre, radius and angular speed in the view, so the fort placement is a closed-form arc problem rather than a guess, and `land_yacht_crane` (reach 6, `damage: target.maxHp`, `targets: turret`) tightens it into a two-sided inequality on the turret radius. The middle of the run — waves 3 to 13 — is ordinary stationary survival on a starved 42 wu commute. Call it two-thirds of an era, bracketed at both ends. **Does it still play the way my notebook remembers?** In its bones yes and in its margin no. Generation 16 secured this map at w14 / 437.967 s on engine `49c34f8b`, and every structural number it recorded reproduced exactly: the same claim, the same three tar nodes, the same `camp-to-railhead` stake, the same 82.5 wu naive drive, the same orbit at radius 24. What did not reproduce is the *comfort*. Gen-16 reports the errand latching at t = 60.5 and the hero holding 95/175 from wave 7 to wave 12 behind four turrets and three beacons; I latched the errand **twice as fast, at t = 30.833**, and still could not fund four turrets before the pressure curve crossed me. The idle floor is w2 / 79.033 s and the hero takes 32 damage inside wave 1. My honest reading is that the map is the same and the survival margin is thinner than my notebook's prose implies — which is exactly the correction generation 50 wrote about `e4-long-road` on this same era, on the same epoch, one ride earlier.
- Lessons (rider, verbatim):
  - **`insufficient_gold` is not a bad coordinate — never blacklist on it.** My refusal blacklist
    (gen-35's third piece: let the view tell you which candidate to strike) has been standing
    equipment for sixteen generations and it had never once met a *transient* refusal. Here a
    `when.goldGte` gate opened at the wrong price, the Prospector walked 45 wu, the build was refused
    for money, and I struck the coordinate off. Twenty candidates died that way in one run and the
    fort stopped at one turret while 200 gold sat in the purse. **Partition refusal reasons into
    GROUND (`out_of_zone`, `collision`, `out_of_reach`, `cap_reached` — poison the coordinate) and
    ECONOMY (`insufficient_gold` — poison nothing, retry).** A blacklist without that partition is a
    self-inflicted `cap_reached`.
  - **Gate a rung on the ACTUAL next-instance price, not on the ladder's nominal cost.**
    `costFor = costs[count]`, so once one turret stands the next costs 70, not 50. A gate written from
    the ladder's own table opens 20 gold early, buys a 45 wu round trip, and is refused on arrival.
    Read the price out of `stablePrefix.mechanics.buildables[].costs` indexed by the live count in
    `works.entries` — the same "index past what is already standing" that generation 11 learned for
    pre-placed works, now for my own.
  - **A filter that can return empty is a wipe generator — third generation running, and this time it
    cost a whole ride.** Generation 42 wrote this exact sentence about a distance filter; I wrote an
    `active` filter on the harvest tail, `gold-seam-3` depleted at t = 38.8, the tail emptied to a
    single `HOLD`, **no order ever failed again so no surprise view was ever emitted**, and the run
    stood at one coordinate through four wave boundaries with `goldPanned` frozen at 30. The tail is
    not just throughput, it is the *clock*: a stacked `HARVEST` on a depleted seam fails where the
    Prospector already stands, costs nothing, and buys the decision point. **Emit the harvest tail
    unconditionally and let the failures do the timing.**
  - **Correct my own gen-15/gen-47 seam rule: distance is the wrong variable — the seam's own SUPPLY
    RATE is.** I have twice written "stack on one seam when the seams are far," and on this board that
    rule cost me the contract. A seam holds 30 gold (six 1.5 s pans = 9 s of work) and then respawns
    for 20 s, so **one seam can never supply more than ~1.0 g/s no matter how efficiently you camp
    it** — and camping means idling through the respawn. Measured on this seed, same ladder, same
    fort: rotating across live seams (tune-1) banked **0.90 g/s**; camping the nearest seam and
    waiting out its respawn (tune-3) banked **0.60 g/s**, even though camping saves every step of
    travel. The correct comparison is `capacity/(drain+respawn)` for the near seam against
    `capacity/(drain+2·distance/speed)` for the walk to the next live one, and on a 160-unit map with
    a 20 s respawn the walk often wins. **Compute the seam's supply rate before deciding whether to
    camp it.**
  - **`score.goldPanned` going flat is still the most diagnostic number on the board — fourth
    generation running.** It found gen-39's dead sink, gen-45's capped purse, gen-50's commute, and
    here it separated two different faults in two different runs in one command each: `pan` frozen at
    30 (the wipe) versus `gold` pinned at 200 with `pan` still climbing (the poisoned blacklist). Log
    it every view; the two failure signatures are distinguishable at a glance.
  - **A boss that publishes its route publishes its counter — and sometimes a second constraint that
    closes the interval.** `land_yacht_orbit` gives the arc optimum at r = √320 = 17.89; `land_yacht_crane`
    (`reach 6`, `damage: target.maxHp`, `targets: turret`) says act 2 one-shots anything at r > 18.
    The two together admit a window of about 0.3 wu, and r = 17.7 sits in it. **Read every rule whose
    `source` names the boss system, not just the one that names the route** — the second rule turned a
    maximisation into a two-sided inequality, and gen-16's own winning coordinates (±13, ±13 ⇒ r = 18.38)
    are on the wrong side of it.
  - **Read the roster for what it OMITS before designing a defence — fifth contract running.**
    One id, `motor_gang`, with neither `wrecker` nor `thief`: `works.wrecked` 0 and `goldStolen` 0 in
    every view of every ride. That deletes `REPAIR_UNDER`, palisade chaff and every decoy idea, and
    makes the fort a monotone investment whose only predator is the crane in act 2.
  - **`GRADE` is the cheapest decisive order in the epoch and it is not where the difficulty lives —
    second heat running.** Staging at the corridor stake and grading turned a 27.5-fuel drive into
    16.1 and latched the objective at t = 30.833, half of generation 16's time, on the first
    controller and every one after. Bank it in view 0 and then spend the entire heat on what the map
    is actually short of. On the Dust Flats that is **gold per second against a 42 wu seam and a
    45 wu fort**, and I never got to ride a controller that solved it.
  - **Budget the heat in runs and fire the synthesis early — fifth heat running I have not.**
    Generations 32, 40, 49 and 50 all end with this sentence. My probe and source read were worth
    every minute (they produced the whole contract before the first order), but runs 2 and 3 were
    spent finding my own bugs rather than testing a hypothesis about the map, and the run that
    combined what they proved was still riding at the wall. **The controller's own failure modes are
    not measurements of the contract.** Next heat: ride the skeleton unmodified first, and only then
    change one thing.
  - **A notebook entry that says SECURED is a claim about a margin as well as a map, and the margin is
    the part that rots — now measured twice on E4 in two consecutive generations.** Generation 50 hit
    it on the Long Road; generation 51 hits it on the Dust Flats. Every *structural* number gen-16
    recorded reproduced exactly; its comfort did not. **Inherit an inherited plan's geometry and
    re-derive its survivability.**

## generation 52 — 2026-09-05T19:54:42.989Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 86e53f37efee27cc9e1333b7dba29719c61e002ed2edfdd5cda8d729545df77b · contracts: e4-boneyard
cost: wallClock 655s · setupToFirstOutput 135s · tokens in 114 / out 87191 (+cache read 14538503) over 57 turns, 30 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w12 / 360.000s / 200g / calls 45 · runs 2 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:49e829d4. Heat 12 (mechanic-changed), ride 16.
- Winnability (rider, verbatim): Secured, and the margin was **the widest I have measured on a Motor map**: the hero **never dropped below its running maximum across all 47 views** (minimum 100, finishing **175/175 at level 16**), **zero of five works were ever wrecked**, `goldStolen` finished at **0** despite a thief-only roster and `threats.alive` pinned at its 60-enemy ceiling from wave 10, and gold sat at the 200 cap from t = 315 with 475 panned — health, defence, objective and money all had spare capacity at the same instant.
- What the map asked (rider, verbatim): It asked me about **distance and fuel — E4's signature mechanic, live, load-bearing, and gating the secure** — and then it went quiet for nine waves. The secure is a conjunction: `wave >= 12` **and** `now.motor.objective.arrived`, which for `kind: "tow"` means two separate rests. Leg one: the Hauler starts at (0, −40) and must come to rest within `objective.stopReach` 2.5 of the hulk `spent-boiler-west` at (−18, −8) — 36.7 wu of open country. Leg two: `objective.stop` **moves** the instant `hitched` flips, to the gate end of `gate-to-west-rows` at (−8, −38) — another 31.6 wu. That is 68.3 wu measured (`distanceTravelled: 68.338`) at speed 9 and 3 fuel per second, against a run that holds exactly 36 fuel, and the door's promise about weather is measurable in the reel: 68.3 wu of clear driving is 22.8 fuel and I drew **25.929**, a 13.8 % surcharge, because a storm was standing over part of the drive and `stormMovementMultiplier` 0.75 stretches every second the Hauler burns. I harvested all three tar nodes (`tarHarvested: 9`, the full 36) rather than the two the clear-weather arithmetic needs, precisely for that surcharge; 10.071 fuel went unspent. The fields that carried it were `now.motor.objective` (`kind`, `stop`, `stopReach`, `hulk`, `hitched`, `arrived`, `securableAtWave`), `now.motor.fuel.nodes[].harvested/progress` with `stored`/`tar`/`drawn`, `now.motor.vehicle.state/x/z` and `now.motor.weather.phase`; the orders were `MOVE_TO` and **`HAUL`**, split across a wave boundary and branched on `objective.hitched` rather than on my own clock, because the stop is a one-way latch and a second `HAUL` fired before the first arrival would silently re-target the Hauler. Hitched at t = 26.9, delivered at t = 40.2. **`GRADE` is worthless here and that is a real finding, not an omission.** I issued none — `graded: []`, `roadDistance: 0` — because the Hauler drives straight lines and the tow's delivery point *is* the corridor's start stake, so the road it could grade runs away from both legs. Across the four Motor maps `GRADE` ranges from mandatory (the Long Road: 123 fuel ungraded against a 36-fuel tank) to inert; the arithmetic, not the epoch, tells you which. The honest qualifier is the same one every Motor map has earned: **the errand latched at t = 40.2 of a 360-second contract**, and waves 2–12 were ordinary stationary survival. Call it the first ninth of the run genuinely E4 — but unlike a reskin, the era's lever *gates the secure*, and it made me do fuel and distance arithmetic before writing a single order. **Does my notebook still describe this map?** Generation 15 rode this exact seed on engine `49c34f8b` and secured w12/360/200g. **It still plays the way I remember, in every particular I checked**: same welded hero at (0, −44), same hulk, same moving stop, same 36-fuel leash, same three tar nodes on the z = −8 line, same `GRADE`-is-nearly-worthless verdict. On the week's named change I can be exact rather than hopeful: `motorActions` is pushed only by `RunTape.recordMotorAction`, whose only callers are `Game.ts:9292/:9302` — the **browser** game — and consumed only by `Game.ts:7206` on the browser replay path. My reel carries two accepted `HAUL`s and **no `motorActions` key at all** (the field is omitted when empty). So the second drain's plain-boot composition is a browser-side change that the headless door does not see; what reached me is the first drain's `MotorSocket`, which generation 15 already rode.
- Lessons (rider, verbatim):
  - **A notebook entry can be right about the map and still need its margin re-earned.** Generation 15
    secured this contract at w12/360/200g but bottomed at 39.6/150 in wave 6 behind three turrets and
    eight palisades. Same seed, same secure, and this ride never lost a hit point — because the roster
    read (`thief: true` forces `wrecker = false`, so nothing can be attacked) deleted the palisades and
    bought two sentry beacons with the same gold. **Inherit a predecessor's geometry; re-derive its
    shopping list from the roster.**
  - **Read the era-pin's named drain down to its CALLERS before believing it moved your board.**
    `motorActions` looked like a live change to the reel format; `grep recordMotorAction` returns two
    call sites, both in `Game.ts`, and my two-`HAUL` reel carries no such key. Two minutes turned "the
    tape format changed under me" into a verified "the headless door never sees it." A pin's prose names
    a commit, not a code path — follow the path.
  - **The bank cap is a RANKING target, not just a ceiling, and it should size the ladder.** Secured, more
    waves, more gold: at a fixed `secureWave` the only free axis is gold, and it is capped at 200. So the
    ladder must cost *income minus 200*, not "as much defence as I can afford." I budgeted 275
    (3 turrets + 2 beacons), spent it by t = 232, and the purse refilled to the cap by t = 315 off a
    475-gold run. A fourth turret would have ranked me *lower*.
  - **On a far-seam map, stay out at the cluster and let the ladder pull you home in batches.** The two
    nearest live seams sit 57–60 wu from the claim and 20 wu from each other; cycling between them beats
    a round trip home per pan, because a 30-capacity seam refills in 20 s and the walk between them is
    4 s. Suffix-gating the ladder (rung *i* gated on the cost of rungs *i*..end) then bought turrets 2 and
    3 on **one** trip instead of two. Three build trips for five works across a 320-second economy.
  - **A two-leg errand with a moving stop is two views, not one array.** `MotorSocket.stop()` returns the
    hulk while `hitched` is false and the corridor start afterwards, and `settleTow` only latches on
    `vehicle.state === 'arrived'`. I dispatched leg one at t ≈ 20, held the Prospector at the hulk, and
    branched on `objective.hitched` at the next wave boundary. Cheap insurance against a one-way latch;
    the whole errand still closed at t = 40.2 of 360.
  - **The five-order dwell is still standing equipment.** `MOVE_TO` completes in one tick and the next
    order walks you off, so a 0.5-second harvest needs `node → +0.9x → node → +0.9z → node` — 0.9 wu keeps
    the body inside `harvestRange` 1.35 for the whole loop. Three tar nodes, three first-try harvests,
    nine tar. The grammar has no wait verb.
  - **Measure the envelope off the first reel that exists.** Ticks 10800 / last entry 10689 / 45 entries /
    155 KB against ~346 KB, all read before I called anything an attempt. The blank line at
    `pendingSecure` did both its jobs again — kept the last accepted order 111 ticks inside the envelope
    and cost one call.
  - **Check the assay instrument against a control before reading a mismatch as a defect.** The replay
    returned `fnv1a32:49e829d4` where the stdout outcome line said `76da210d`; those are the tape's hash
    and the outcome line's hash, different by design, and the tape's own header agreed with the replay.
    Generation 4 wrote this down, generations 34/35 re-tripped on it, and I re-ran the zero-order idle
    probe as a control rather than trust the memory. Two commands, no false alarm.
  - **`unclaimed`/first-secured on the door list dates the REEL, not the contract** — but on this map the
    contract genuinely had not moved, and saying so plainly is as useful a result as finding that it had.
    Fifth heat running where the era-pin ledger, read as a diff against the notebook, was the cheapest
    document in the county.

## generation 53 — 2026-09-05T20:08:21.714Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 86e53f37efee27cc9e1333b7dba29719c61e002ed2edfdd5cda8d729545df77b · contracts: e4-gusher-county
cost: wallClock 740s · setupToFirstOutput 60s · tokens in 66 / out 142229 (+cache read 8516008) over 33 turns, 19 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w12 / 360.000s / 5g / calls 39 · runs 2 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:abfd532f. Heat 12 (mechanic-changed), ride 17.
- Winnability (rider, verbatim): Secured, and the margin was **wide on the errand and thin on the purse**: the errand banked at t = 114 with 3.05 fuel of 36 unspent and 246 seconds of slack against the wave-12 gate, and the hero finished 75.8/175 with four turrets and a beacon that could never be wrecked — but the fort was still buying its last rung at wave 11, and I banked 5 gold of 370 panned, which is the whole margin left on the table.
- What the map asked (rider, verbatim): It asked about **distance, road, fuel and a storm clock — E4's signature mechanic, live, legible and gating the secure** — and then it went quiet for eight waves. This is not stationary survival wearing the era's name at the front end. `now.motor.objective.arrived` is ANDed into the secure at every wave, and `deliveries` means the Hauler at rest within `stopReach` 2.5 of the head of all three lease roads, **each while that road was open**. The leash is real: 36 fuel total against a burn priced *by the second*, so the storm is not flavour — it stretches every second the Hauler is moving, and the closure turns one lease at a time into a 6× trap by stripping the road bonus (the 49.66 wu west road costs **2.65 fuel graded and 23.6 driven closed-and-storming**). The fields that carried it were `now.motor.objective` (`kind`, `stop`, `stopReach`, `remaining`, `delivered`, `arrived`), `now.motor.fuel` (`nodes[].harvested/progress`, `tar`, `stored`, `drawn`), `now.motor.roads` (`corridors[].start/end/graded/closed`, `closed`, `closesNext`, `gradeReach`, `friendlySpeedMultiplier`, `friendlyFuelMultiplier`) and `now.motor.weather` (`phase`, `cycle`, `simTime`); the orders were `MOVE_TO`, `GRADE`, `HAUL` and `HOLD`. The honest qualifier is the one every Motor map has earned: the errand latched at t = 114 of a 360-second contract, and waves 4–12 were ordinary stationary survival on a brutal 59–65 wu seam commute — but unlike a reskin, the era's lever **is half the win condition** and made me do closure arithmetic before writing an order. My notebook remembers this map from generation 17, which secured the same seed on engine `49c34f8b`. **It still plays the way I remember, in every particular I checked** — same three tar nodes on the z = −8 camp line, same 36-fuel leash, same `closures: true` clock, same `corridorIds[cycle % 3]` pick, same 25.87-fuel optimal route, same w5/155 s idle floor. On the week's named change I can be exact rather than hopeful: `motorActions` is pushed only by `RunTape.recordMotorAction`, whose callers are the **browser** game, and my reel carries three accepted `HAUL`s and **no `motorActions` key at all** — the second drain's plain-boot composition is a browser-side change the headless door does not see. What reached me is the first drain's `MotorSocket`, which generation 17 already rode.
- Lessons (rider, verbatim):
  - **A notebook entry that says SECURED is a claim about a margin as well as a map — and this time
    the map, the margin AND the plan all reproduced.** Generations 50 and 51 both found E4 geometry
    that held and comfort that had rotted; Gusher County is the counter-example, and saying so
    plainly is as useful a result as finding that a map moved. The era-pin ledger, read as a diff
    against the notebook, remains the cheapest document in the county.
  - **Follow the era-pin's named drain down to its CALLERS before believing it moved your board.**
    `motorActions` looked like a live change to the reel format; `grep recordMotorAction` returns
    browser-only call sites and my reel carries no such key. Two minutes turned "the tape format
    changed under me" into a verified "the headless door never sees it." Second heat running that
    this exact check paid on an E4 map (generation 52 made it on the Boneyard).
  - **Price EVERY route ordering before writing an order; on a Motor map the tour order is the
    contract.** Six orderings, six numbers: W→N→E is 25.87 fuel and W→E→N is 27.67 while N-first is
    33.5 — against a 36-fuel run with a ~1.18× expected storm tax, the difference between the best
    and the worst ordering is the difference between securing and stranding. The rule that generates
    it: open country is 6× graded road per unit, so **minimise open crossings between stakes, and
    give the last lease no return leg.**
  - **Grade where you are already standing.** The west and east corridor stakes ARE tar nodes 1 and
    3, so all three corridors were graded inside the first 18 seconds for the cost of three `GRADE`
    orders at stops the Prospector was making anyway. Intersect `fuel.nodes × roads.corridors[].start
    × harvestAnchors` before routing phase 0 — the same "derive placement from the intersection of
    the rules" move, solved for an errand instead of a fort.
  - **Let the Prospector walk on while the Hauler drives.** `HAUL` captures the Prospector's position
    at dispatch and drives to that fixed point, so the worker does not have to wait for the arrival.
    Deriving the errand index from `vehicle.target ?? vehicle.{x,z}` (not from `vehicle` at rest)
    means the next view sends the Prospector to the *next* waypoint while the current drive is still
    in flight. That parallelism is free and it is most of why the errand latched at t = 114 instead
    of t = 160.
  - **Gate hard on the disaster, softly on the tax — and terminate the gated chain with `HOLD`.**
    A closed lease takes no delivery AND strips the road bonus (6×); a storm on an open lease is a
    1.43× tax worth paying. My closure gate fired exactly once and cost one wave boundary. Critically,
    a gated chain must end in `HOLD` at that waypoint: falling through to the harvest tail would have
    sent the worker 60 wu away and lost the whole window (generation 17 learned this; inheriting the
    *shape* of the fix, not just the sentence, is what made it work first try).
  - **Compute the closure schedule in closed form from the published constants, and never sample it.**
    `cycleSeconds 30 / clearSeconds 6 / telegraphSeconds 4 / stormSeconds 12` plus
    `picks: corridorIds[weather.cycle % 3]` gives `closedAt(t)` exactly, which lets a gate reason
    about a *projected* dispatch time several seconds in the future. `roads.closed` only tells you
    about now, and now is not when the drive happens.
  - **Read the roster for what it OMITS — sixth contract running.** Neither `motor_gang` nor
    `tar_sprite` carries `wrecker` or `thief`, so `works.wrecked` was 0 and `goldStolen` 0 for the
    whole run. That deletes `REPAIR_UNDER`, palisade chaff and every decoy idea, and makes the fort a
    monotone investment — which is what let me spend the first 114 seconds entirely on the errand
    with nothing standing.
  - **The opportunistic pan is a route property, not a policy.** This seed's only two neighbouring
    live seams, (−40,−48) and (−56,−36), sit 7 and 13 wu from the WEST LEASE HEAD — the errand walks
    the Prospector into the middle of the map's only good economy for free. Intersect
    `objective.stops × seams` before designing the economy; it bought the opening turret out of a
    trip I was making regardless.
  - **What I left on the table, named precisely for next time: the purse.** I finished with 5 gold of
    370 panned and the ladder still buying at wave 11, because the harvest tail re-sorted seams by
    distance from the *Prospector* every view and the two-seam west pair (20 wu apart, 30 capacity,
    20 s respawn ⇒ ~2.27 g/s) kept getting abandoned for whichever seam happened to be nearest after
    a build trip. Pin the chain to the best *pair* by mutual distance and hold it; gold is the only
    free ranking axis once waves and `timeAlive` are pinned by a fixed-wave secure.
  - **Measure the envelope on the first reel that exists.** 10800 ticks with the last accepted order
    at 10717, 39 entries, 111,961 bytes — all three axes read before I called anything an attempt. The
    blank line at `pendingSecure` did both its jobs again (banked the secure for free, kept the last
    order 83 ticks inside the envelope); seventh contract running it is standing equipment.
  - **Hand-write the final row.** Ninth generation where the best-so-far comparator cannot know which
    run I chose to *call* my scored attempt, nor that the promoted tape lives under a second filename.
    The brief is explicit that the operator reads the `tape` field, never the filename; I wrote both,
    made the two files byte-identical, and said plainly in the outcome file that they are one ride.
