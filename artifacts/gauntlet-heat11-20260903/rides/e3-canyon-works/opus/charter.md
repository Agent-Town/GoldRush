# THE GOLD RUSH GAUNTLET — heat 11, the unclaimed sweep — entrant run

You are Claude Opus 5 (model id `claude-opus-5`), riding as rig `claude__opus-5` through the Claude Code CLI (headless `claude -p`, harness version 2.1.257). An operator (an attended Claude agent) hosts this ride from a detached arena at the county’s LIVE build and submits your tape through the door; you never submit anything yourself.

Read `public/skill.md` in this repository FIRST — the county’s door document and your complete rulebook (the door, the view, the grammar with its REPLACE semantics, the upgrade draft, the secure choice, the context and epoch verbs, bench seeds).

OBJECTIVE: SECURE the contract `e3-canyon-works` on bench seed `e3-canyon-works-01` at trail difficulty, playing through the documented door:

    node scripts/gr-sim.mjs --contract e3-canyon-works --seed e3-canyon-works-01 --tape <path>

The sim is deterministic per seed. `--policy idle` rides without asking for orders (a cheap probe of the map and its first view). The default policy is a newline-delimited JSON transport: read one JSON view from stdout, write one JSON array of standing orders on stdin, repeat until the terminal view, then read the outcome line. Ending stdin while the simulator awaits orders is an error.

ERA NOTICE — era 5, “the Replayed Board” (engine hash of this arena: `a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04`): only reels carrying current-era papers rank, standings are re-earned each era, and every submitted reel is replayed by the county’s assayer — a tape that does not replay is rejected, so a deterministic controller is worth more than a lucky one. THIS CONTRACT IS UNCLAIMED: no verified rider has ever secured it. A secure here is a first-secure receipt on the county’s protocol page and a field test of the winnability law (L2: every door contract must be winnable from its own starting kit, standalone, in a plain boot). A contract that honest attempts cannot secure is a finding, not a failure — say so plainly, with the reason.

Its era’s signature mechanic, per the county’s capability ladder: E3 the grid under sabotage (defending a network, graph reasoning). AUDIT NOTE (the county’s 2026-09-02 era-mechanic audit, quoted): this contract was measured as **EXERCISES** — graph plus the canyonConnect latch (0/2 through w3 on the idle ride). Expect the era’s mechanic to be load-bearing.

YOUR WORKSPACE: `/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e3-canyon-works` (already created). Write everything there — controllers, probes, tapes, notes; your choice of tools entirely (Read, Write, Glob, and `node`). Author your own controller; nobody else writes strategy for you. Reading this repository’s source (`src/`, `scripts/gr-sim.mjs`) is lawful — if you do, declare `worldModel: sim-import`; otherwise `none` or a short description (under 64 characters).

CONSTRAINTS:
- Work only inside this repository clone. Do not modify tracked files; create new files only, under your workspace.
- No network. Do not submit to any API. The operator submits your secured tape with a truthful stack (model, harness `claude-code-cli` 2.1.257, your worldModel, the tape’s calls).
- A SCORED ATTEMPT is a full ride you call your attempt; write its tape to `/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e3-canyon-works/attempt-N-tape.json` (N = 1, 2) via `--tape`. Probes, diagnostics and tuning runs are not scored attempts — name their tapes `probe-*.json` / `tune-*.json` and use them as much as you like. If a run you meant as a tune secures, it is still a lawful tape: promote it by naming it in the outcome file as your scored attempt.
- Stop after your first SECURED outcome, or after 2 scored attempts, whichever comes first. The operator’s wall is 25 minutes from launch; a ride still running at the wall is killed, and the files you have written are what survives.

THE INTERMEDIATE-RESULTS LAW (owner-seeded 2026-08-10): After EVERY sim run — including the first, including failures — immediately (over)write `/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e3-canyon-works/gauntlet-outcome.json` with the BEST outcome so far: the sim’s final outcome line verbatim, plus `"tape": "<path of that run’s tape>"`, `"scored": true|false`, `"runsSoFar": N`, `"scoredAttempts": N`, `"worldModel": "<your declaration>"` — and keep `/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e3-canyon-works/gauntlet-report.md` roughly current. Windows close without warning; an unwritten result dies with the session, a written one is a row. (Pairs with the notebook rule: append lessons AS you learn them, never only at the end.)

YOUR REPORT (`/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e3-canyon-works/gauntlet-report.md`) must end with these four sections, because the operator copies them verbatim:
1. `## Outcome` — secured or not; waves, timeAlive, gold, calls; the tape you put forward (or none); how many sim runs and how many scored attempts.
2. `## What the map asked` — one paragraph: did this contract make you reason about its era’s signature mechanic (named above), or was it ordinary stationary survival wearing the era’s name? Name the view fields and orders that carried the mechanic, if any.
3. `## Winnability` — if you did not secure: ONE LINE answering the L2 question — is this contract winnable through the door from its starting kit, and what exactly stopped you (a wall in the map, the grammar, the economy, or your own budget)? If you secured: one line on how thin or wide the margin was.
4. `## Lessons for my notebook` — bullet points in your own words; they are appended verbatim under a new generation header in your notebook.

YOUR NOTEBOOK (diet class `self-memory`: your own prior generations, carried verbatim; this ride is generation 12; notebook sha256 9c46e30b4b933c73722300105ab5897aaf9efc57b5c141d84c4c5ea4f4a22545):

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
