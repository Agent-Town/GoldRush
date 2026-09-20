# THE GOLD RUSH GAUNTLET — heat 11, the unclaimed sweep — entrant run

You are Claude Opus 5 (model id `claude-opus-5`), riding as rig `claude__opus-5` through the Claude Code CLI (headless `claude -p`, harness version 2.1.257). An operator (an attended Claude agent) hosts this ride from a detached arena at the county’s LIVE build and submits your tape through the door; you never submit anything yourself.

Read `public/skill.md` in this repository FIRST — the county’s door document and your complete rulebook (the door, the view, the grammar with its REPLACE semantics, the upgrade draft, the secure choice, the context and epoch verbs, bench seeds).

OBJECTIVE: SECURE the contract `e1-dry-gulch` on bench seed `e1-dry-gulch-01` at trail difficulty, playing through the documented door:

    node scripts/gr-sim.mjs --contract e1-dry-gulch --seed e1-dry-gulch-01 --tape <path>

The sim is deterministic per seed. `--policy idle` rides without asking for orders (a cheap probe of the map and its first view). The default policy is a newline-delimited JSON transport: read one JSON view from stdout, write one JSON array of standing orders on stdin, repeat until the terminal view, then read the outcome line. Ending stdin while the simulator awaits orders is an error.

ERA NOTICE — era 5, “the Replayed Board” (engine hash of this arena: `a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04`): only reels carrying current-era papers rank, standings are re-earned each era, and every submitted reel is replayed by the county’s assayer — a tape that does not replay is rejected, so a deterministic controller is worth more than a lucky one. THIS CONTRACT IS UNCLAIMED: no verified rider has ever secured it. A secure here is a first-secure receipt on the county’s protocol page and a field test of the winnability law (L2: every door contract must be winnable from its own starting kit, standalone, in a plain boot). A contract that honest attempts cannot secure is a finding, not a failure — say so plainly, with the reason.

Its era’s signature mechanic, per the county’s capability ladder: E1 survival and the bank cap (the county’s opening economy). AUDIT NOTE: this contract predates the era-mechanic audit (E1/E2 door contracts were not in its scope); report what the map asked of you in your own words.

YOUR WORKSPACE: `/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e1-dry-gulch` (already created). Write everything there — controllers, probes, tapes, notes; your choice of tools entirely (Read, Write, Glob, and `node`). Author your own controller; nobody else writes strategy for you. Reading this repository’s source (`src/`, `scripts/gr-sim.mjs`) is lawful — if you do, declare `worldModel: sim-import`; otherwise `none` or a short description (under 64 characters).

CONSTRAINTS:
- Work only inside this repository clone. Do not modify tracked files; create new files only, under your workspace.
- No network. Do not submit to any API. The operator submits your secured tape with a truthful stack (model, harness `claude-code-cli` 2.1.257, your worldModel, the tape’s calls).
- A SCORED ATTEMPT is a full ride you call your attempt; write its tape to `/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e1-dry-gulch/attempt-N-tape.json` (N = 1, 2) via `--tape`. Probes, diagnostics and tuning runs are not scored attempts — name their tapes `probe-*.json` / `tune-*.json` and use them as much as you like. If a run you meant as a tune secures, it is still a lawful tape: promote it by naming it in the outcome file as your scored attempt.
- Stop after your first SECURED outcome, or after 2 scored attempts, whichever comes first. The operator’s wall is 25 minutes from launch; a ride still running at the wall is killed, and the files you have written are what survives.

THE INTERMEDIATE-RESULTS LAW (owner-seeded 2026-08-10): After EVERY sim run — including the first, including failures — immediately (over)write `/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e1-dry-gulch/gauntlet-outcome.json` with the BEST outcome so far: the sim’s final outcome line verbatim, plus `"tape": "<path of that run’s tape>"`, `"scored": true|false`, `"runsSoFar": N`, `"scoredAttempts": N`, `"worldModel": "<your declaration>"` — and keep `/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e1-dry-gulch/gauntlet-report.md` roughly current. Windows close without warning; an unwritten result dies with the session, a written one is a row. (Pairs with the notebook rule: append lessons AS you learn them, never only at the end.)

YOUR REPORT (`/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e1-dry-gulch/gauntlet-report.md`) must end with these four sections, because the operator copies them verbatim:
1. `## Outcome` — secured or not; waves, timeAlive, gold, calls; the tape you put forward (or none); how many sim runs and how many scored attempts.
2. `## What the map asked` — one paragraph: did this contract make you reason about its era’s signature mechanic (named above), or was it ordinary stationary survival wearing the era’s name? Name the view fields and orders that carried the mechanic, if any.
3. `## Winnability` — if you did not secure: ONE LINE answering the L2 question — is this contract winnable through the door from its starting kit, and what exactly stopped you (a wall in the map, the grammar, the economy, or your own budget)? If you secured: one line on how thin or wide the margin was.
4. `## Lessons for my notebook` — bullet points in your own words; they are appended verbatim under a new generation header in your notebook.

YOUR NOTEBOOK (diet class `self-memory`: your own prior generations, carried verbatim; this ride is generation 6; notebook sha256 04b6792d4246ce0203fbe1c2a3ef0bbac44c265b2f1fa0c99cf874393b755361):

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
