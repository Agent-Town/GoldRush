# E1 IN DEPTH — the release maps, played for gaps and gold
Session: dedicated Opus 5, branch `review/e1-gameplay-depth`. Leg 1: 2026-07-25 23:03 → 01:00 (+07). Leg 2: 2026-07-26 (alt tank reset, full window), resumed under TASK.md's RESUME LAW.
Commission (owner, 2026-07-25 night): *"E1's maps are most important for the release... understand the gameplay and look for gaps and optimizations."*

## VERDICT LINE FIRST
**Three of the five release maps are won by walking into the river and standing still — the Claim in 77 seconds, with zero kills, zero damage taken, zero gold spent and nothing built. And two of the five never tell the player how to win at all.** Both are verified: the first by play, the second at source. Both are cheap to fix. Everything below separates, ruthlessly, what was **played**, what was **verified at source**, and what remains **unverified** (claim-verification rule).

---

## 1. WHAT WAS ACTUALLY PLAYED (the honest-play ledger)
The honest-play doctrine forbids debug assists. The rig's older E1 segments all use grinding shortcuts (`maxUpgrades`, `grantGold`, `placeFree`, `setWave`) — none of them can answer "is this map any good", so this review built its own instruments: `rehearsal/segments/e1-depth-play.mjs` (plays the map) and `rehearsal/segments/e1-depth-rivercamp.mjs` (asks one question, below).

**Leg 2 — after the instrument was repaired (§4). These are real runs:**

| Run | Map | Mode | ts | Waves | Outcome | Builds | Console/page errors |
|---|---|---|---|---|---|---|---|
| `ghostfix2` | the-claim | play | 1 | **10/10** | **SECURED**, hp 92/100, 304 s | 8 (90 gold panned) | 0 / 0 |
| `drygulch` | e1-dry-gulch | play | 2 | **20/20** | **SECURED**, hp 143/175, 863 kills, level 28, 307 s | 7 | 0 / 0 |
| `twinbanks` | e1-twin-banks | play | 2 | 17/20 | died, 722 kills, level 25, 266 s | 9/9 | 0 / 0 |
| `nightshift` | e1-night-shift | play | 2 | 4/25 | died, 59 kills, 69 s | 10 (120 gold panned) | 0 / 0 |
| `nightshift2` | e1-night-shift | play | 1 | see §7 | see §7 | 6 | 0 / 0 |
| `baron2` | e1-baron | play | 2 | 3/20 | died, 39 kills, 82 s | 9 | 0 / 0 |
| `camp-claim` | the-claim | **camp** | 4 | **10/10** | **SECURED, 0 kills, hp 100/100, 77 s** | 0 | 0 / 0 |
| `camp-nightshift` | e1-night-shift | **camp** | 4 | **25/25** | **SECURED, 0 kills, hp 100/100** | 0 | 0 / 0 |
| `camp-baron` | e1-baron | **camp** | 4 | 21 | untouched to w20, **died w21 to the Baron** | 0 | 0 / 0 |
| `camp-twinbanks` | e1-twin-banks | **camp** | 4 | 3 | **died** — no deep water to hide in | 0 | 0 / 0 |

**Leg 1 (kept for the record — the instrument could not build, so these carry no difficulty claim):** 6 smoke runs + 2 idle probes on the-claim, waves 1–6, all 0/0 errors.

**Cited assists, and only these:** `?contract=<id>` (a *door* — the unlock ladder for these maps is science≥3 / 2-secured / firstSecuredClaim and cannot be walked in one night), `timescale` (uniform sim multiplier, `Game.ts:2312`), and `?debug` (installs `__GR_TEST__` + diagnostics; `main.ts:35-44` strips it from release builds, and it touches no terrain, pathing or win logic — the camp finding does not depend on it). No `maxUpgrades`/`grantGold`/`placeFree`/`setWave`/`setBalance`/`teleport` in either instrument — grep them to confirm.

**⚠ ONE PIECE OF LEG-1 EVIDENCE IS TAINTED, reported rather than buried:** leg 1 played against `http://127.0.0.1:5241`, which leg 2 discovered is served by **`worktrees/lane-a`**, not this branch (`lsof -a -p <pid> -d cwd`). Leg 1's *play* observations therefore describe another lane's tree. Leg 1's *source* findings (F-E1-1, F-E1-3) were read from this checkout's files and stand. Leg 2 runs on port **5247, served from this working directory, verified before the first run**; the instrument's default base was moved there in the same commit. This is Mistake #12 wearing a play-session coat, and it is exactly why the rule says *verify which tree you are gating*.

---

## 2. THE FINDINGS

### F-E1-5 — THREE RELEASE MAPS ARE WON BY STANDING STILL IN THE RIVER ✓ VERIFIED (played, and reproduced on three maps with a negative control)
**The Claim — the first map, the one that teaches the game — is secured in 77 seconds by walking into the river and never touching another key.** 0 kills. 0 damage (hp 100/100 start to finish). 0 gold spent. Nothing built. 60 Claim Jumpers alive at the cap, none able to reach. `camp-claim-report.json`.

Night Shift, the 25-wave map whose whole signature is the light ramp, does the same: **secured at wave 25, hp 100/100, 0 kills** — the darkness never matters because the player never fights.

**The game's own results card is the finding** (`reviews/shots-e1-depth/camp-claim-02-secured.png`): *Claim Secured — **WAVES HELD 10 · GOLD PANNED 0 · GOLD RECLAIMED 0 · BUILDINGS RAISED 0*** · HP 100/100 · *"The win is banked. Ride home with the claim, or stay for the Rush and press your luck."* · Claim Office: *"The Prospector tips his hat: 'Struck it proper, partner.'"* · Territory **+1 STAMPED** — and the *"Wet powder"* warning still showing behind the card. The game watches a player do nothing for ten waves, reports three zeroes, congratulates them, and pays the meta.

The mechanism is four correct-looking facts that only bite together:
1. `src/world/Terrain.ts:214` — the hero may walk **deep** water when `TILE_WATER.heroCanWadeDeep` and the tile is `frontier-river-claim`. `manifest.json:217` sets it true. **the-claim, e1-night-shift and e1-baron all ride that tile.**
2. `e2e/task-025-bandits-dont-swim.spec.ts` — enemies do not enter deep water. They cross at fords.
3. `src/game/Game.ts:6536` — deep water disarms both hero weapons ("Wet powder.", `Game.ts:6523`; the player sees *"Hands full of river."*, `Hud.ts:165`). That is the intended price.
4. `src/game/Game.ts:6352` — `endRun()` is reached **only** by hero death (F-E1-6). There is no other way to lose.

So the price is not a price: you trade an offense you do not need for immunity to the only thing that can end the run. The game's own telegraph fires 75 times on the Claim and 187 times on Night Shift, and it is telling the player *"you are safe now"*.

**The negative control matters as much as the finding.** Twin Banks rides its own tile, its braided water is wade-only, and the same probe **dies at wave 3**. The Baron rides `frontier-river-claim` and the camp survives untouched all the way to wave 20 — and then **dies at wave 21, because the Baron reaches into the river**. So this is not a universal engine bug and not a probe artifact: it is scoped exactly to the tile flag, and the Baron already contains the design answer.

Worth stating plainly: **the driver fell into this by accident, twice, on two different maps.** On the-claim (`ghostfix2`) it was walking to a gold seam, drifted into the channel, and the map handed it eight flat waves and a win — hp frozen at 92 from wave 3 to wave 10 with 60 jumpers alive. On Night Shift (`nightshift2`) it did it again: hp frozen at 53/125 from wave 7 onward, 60 alive, nothing to do. Nobody has to be clever to find this. It is what happens when you pan a river claim and stop paying attention.

Corrective: `tasks/DRAFT-e1-river-camp.md`. Smallest fix is **one boolean** — `heroCanWadeDeep: false` in the E1 manifest — which also makes the Claim's own card true (*"The river splits the claim around one center ford"*: today it splits nothing).

### F-E1-1 — TWO RELEASE MAPS NEVER STATE THEIR WIN CONDITION, AND SILENTLY RUN 2× LONG ✓ VERIFIED (source + rendered cards)
`src/game/Game.ts:4531` resolves the win length as `twist.secureWave ?? Balance.run.secureWave`; `Balance.ts:807` — `secureWave: 20`. So **any contract that omits `twist.secureWave` silently becomes a wave-20 map.**

| Map | `twist.secureWave` | Effective | Card tells the player? |
|---|---|---|---|
| the-claim | `10` | 10 | ✅ "Hold the claim through wave 10." |
| **e1-dry-gulch** | **absent** | **20** | ❌ "Work the dry washes around the lone spring." |
| e1-night-shift | `25` | 25 | ✅ "Survive to DAWN at wave 25." |
| **e1-twin-banks** | **`{}` (empty twist)** | **20** | ❌ "Build on either bank and watch both fords." |
| e1-baron | `20` | 20 (+ boss, F-E1-7) | ✅ "The Baron rides at wave 20." |

Both cards were read **as rendered in play this leg**, not from JSON: Dry Gulch's briefing says *"Goals Work the dry washes around the lone spring"*, Twin Banks' says *"Goals Build on either bank and watch both fords"*. Neither contains a number. Dry Gulch is the map a player reaches **immediately after** the Claim (`unlock: wave10OnClaim`): the first thing the game does after teaching "a claim is secured at 10" is hand the player a claim secured at 20 without saying so — to the exact player the release exists to serve, the first external tester who *"did not exactly understand what to do"*.

**New this leg, and it sharpens rather than softens the finding:** the engine *does* know the number and *does* show it — in the **pause menu** (`Game.ts:7147`, `goalProgress: "Secure the claim at wave N — wave X/N"`, rendered only when the map has a plain wave goal). So on Dry Gulch and Twin Banks the truth is one pause away while the card the player actually reads at wave 0 omits it. That is a copy defect, not an engine defect — which is why it is cheap.

Instance of the register's **MQ-7** (player-facing promises vs engine truth, status OPEN), filed as an instance, not re-filed as a class. Corrective: `tasks/DRAFT-e1-secure-wave-truth.md`.

### F-E1-6 — THE ONLY WAY TO LOSE ANY E1 MAP IS HERO DEATH; TWIN BANKS' "LOSS CONDITION" IS READ BY NOTHING ✓ VERIFIED (source)
`Game.ts:6352 endRun()` is the single defeat path and its only caller is hero death (`Game.ts:1754`, `finishPendingDeath`). No building loss, no stake loss, no timer.

Twin Banks' data says otherwise: `tileParams.stakeMarkers` contains `south-claim-stake` with **`lossCondition: true`** at (0, −12). Every consumer of that flag was traced: `Terrain.lossStakeMarker()` → the hero's start position (`Game.ts:7557`), the multiplayer spawn centre (`Game.ts:3275`), and a world-info label (`Game.ts:5685`). **Nothing can lose because of it.** The field names a rule the game does not have.

This is why the camp works, and it is a bigger gap than the camp: a tower-defence map whose only fail state is the hero's own body has no reason for the player to defend anything. Corrective: `tasks/DRAFT-e1-hold-the-claim.md`.

### F-E1-7 — THE BARON IS THE ONE MAP THAT ANSWERS ALL OF THIS ✓ VERIFIED (source + played)
`Game.ts:4535 autoSecureWaveForRun()` returns `Number.MAX_SAFE_INTEGER` while `waitsForBaronDefeat()` — so on `e1-baron`, **reaching wave 20 does not secure; defeating the Baron does.** Played: the camp probe sat untouched through 20 waves and then died at 21 with 0 kills. The Baron reaches into the river and the run had built nothing to meet him with.

Not a defect — a demonstration. The Baron is the only E1 map where the win condition is a thing you must *do* rather than a duration you must *outlast*, and it is the only one the camp cannot beat. Whatever fix F-E1-5 and F-E1-6 take should be measured against it.

### F-E1-2 — THE CONTRACT DOOR BOOTS STRAIGHT IN: NO START MENU, NO GREENHORN OFFER, NO TRAIL GUIDE ✓ VERIFIED (played, both legs)
Every boot in both legs logged `(no start menu on this door — contract door boots straight in)`. `?contract=<id>` skips the first-boot seam entirely. Difficulty still resolves to `trail` (`ProfileStorage.ts:26`), so the *difficulty* default is sound.

Why it matters: RF-02 (the Trail Guide) and the greenhorn offer are the release's whole answer to the first-tester lesson, and **the fresh-profile teaching path is not exercised by the door testing uses** — any tester handed a `?contract=` link gets the untaught experience. Not a claim that the Trail Guide is broken in normal play (**✗ UNVERIFIED** — the plain-boot path was not reached in either leg; it needs the profile-create → Enter Town → board route). Corrective: `tasks/DRAFT-e1-trail-guide-plain-boot-proof.md`.

**Note for whoever ships:** `main.ts:37` strips `debug`, `editor`, `bench` and `era` from release URLs — but **not `contract` or `timescale`**. In the shipped build a player can still set `?timescale=4`. Flagged, not filed; it may be deliberate.

### F-E1-8 — THE LEVEL LADDER OUTRUNS THE MAPS; THE BUILD ECONOMY IS OPTIONAL ✓ VERIFIED (played, three maps) — with one number retracted
**Dry Gulch was secured at wave 20 with seven buildings — one sentry beacon and six palisades, all bought before wave 3 — and never a turret, a sluice, a stockpile or an assay office.** What carried it was levels: **2 → 28, 27 upgrades, 863 kills.** Twin Banks: nine palisades, level 25, 722 kills, dead at 17. The Claim: eight palisades, level 3, secured at 10. Across three honest runs the tower-defence half of the game was bought once, early, and then never again — and two of the three maps were won or nearly won anyway.

**The retraction, stated because this review's own first draft had it wrong:** the "90 gold" that appears on all three maps is a **driver ceiling, not a map ceiling** — 3 seams × `capacity: 30`. Leg 2's first driver re-picked its nearest seam every tick, so with two roughly equidistant seams it ping-ponged and never arrived: 21–22 panning ticks out of 780–930. The driver now commits to one seam until it is worked out or proves unreachable. **No claim is made here about how much gold a map *can* yield.** What is not a driver artifact, and is the finding: those maps were secured on that little.

The second half is sharper. On Dry Gulch, **from wave 3 to wave 19 the hero stood inside a 3-metre box at (16–19, −2.9) and took zero damage** while enemy counts climbed 14 → 60 (the alive cap). HP only ever went *up*, on Tinker's Plating picks. It was not an unreachable pocket — 863 kills says the enemies arrived; it is that a level-28 rig (6× Double-Tap Coil, 3× Heavy Spark, 2× Split Spark, 2× Long-Barrel Resonator) deletes a Trail wave before it lands a touch. The upgrade curve outpaces the wave curve, and it does so from roughly wave 9 onward.

### F-E1-9 — SEVENTEEN CONSECUTIVE WAVES WITH NOTHING TO DECIDE (Dry Gulch) ✓ VERIFIED (played)
The task asks for dead minutes — "nothing meaningful to decide". Dry Gulch's telemetry gives the cleanest example in the set. Waves 3 → 19, sixteen consecutive waves, ~15 wall-seconds each (≈ 8 minutes of the 10-minute run):

> same position (±3 m) · same seven buildings · gold flat at 5 and falling to 0 · zero damage taken · zone 100 % `bank`

The only interaction in that entire stretch was the level-up overlay, arriving every ~40 s and answered from a three-card offer. The map's stated signature — *"Sluices work only beside the spring"*, *"Seams pay 40 % more gold"* — never came up: no sluice was ever affordable at the moment it mattered, so the spring, the map's one distinguishing feature, played no part in securing it.

That is the shape of the whole difficulty problem: the maps are long (20 and 25 waves), the decisions front-load into the first three, and the level ladder covers everything after. Cheapest first correctives in `tasks/DRAFT-e1-midgame-decisions.md`.

### F-E1-3 (REVISED) — TWIN BANKS' BRAID CARRIES MORE THAN LEG 1 COULD SEE ✓ UPGRADED from INFERRED
Leg 1 called the braid decorative because it lives entirely in `tileParams` with an empty `twist`. Play says that was too harsh. Twin Banks is **the only E1 river map the player cannot cheat** (camp control: dead at wave 3), its fords genuinely funnel pressure, its `buildZones` genuinely restrict where a player may build (`Terrain.isBuildable:234` — zone must be `bank` *and* inside a declared zone; Twin Banks is the only E1 map that declares any), and it produced the hardest honest run of the night by a distance.

What is still true from leg 1: nothing in the *run logic* asks about the braid, its stake is inert (F-E1-6), and its card states no win condition (F-E1-1). The braid shapes the fight; it does not yet score it.

### F-E1-4 — NOT A BUG: the idle-hero "freeze" is the level-up pause ✓ VERIFIED (played, and disproved)
Kept from leg 1 because it nearly became a false finding. An unattended hero froze totally — identical across five 15-second samples. It is the game correctly waiting for an upgrade pick (`state: 'levelup'`, `pendingLevels: 1`, overlay `aria-hidden=false`). **No corrective owed.**

---

## 3. THE MAPS, ONE BY ONE

### 3.1 the-claim — ✅ the teaching map works when it is played, and dies when it is not
**Played:** 10/10 waves, secured, 304 s wall, hp 92/100, 8 palisades bought with 90 panned gold, level 3, 23 kills, zero errors, ~117 fps. Plus the 77-second camp win.
**Verdict:** *the only E1 map whose card, briefing and secure beat all agree — and the easiest map in the game to beat without playing it.*
- The briefing is the best in the set: goal, rule, and the rush tease in three lines, and the secure lands exactly at the promised wave 10 with the Claim Office card and four `+1` meta stamps.
- **Gap — the early economy is a knife-edge:** the honest run's first build came at 10 gold (a palisade) and it never once afforded a turret (50) in ten waves. `startGold: 0`, `tickGold: 5` per 1.5 s of standing still. The map's whole build menu (beacon 25 / sluice 40 / turret 50 / stockpile 60 / assay 80) is priced for an economy the first ten waves cannot fund.
- **Gap — waves 3–10 were flat** in the played run (hp, gold, level, builds all frozen) — but that was the camp (F-E1-5), so it is not chargeable as a pacing defect. It is chargeable as evidence of how easy the camp is to fall into.

### 3.2 e1-twin-banks — ⚠ the best-designed E1 map, wearing the worst-explained card
**Played:** 17/20, died, 266 s, 722 kills, level 25, 9/9 builds, zero errors, 120 fps.
**Verdict:** *the map that actually asks something of the player — and never tells them what it is.*
- It is the hardest and richest map in the set: real chokepoints, real build restrictions, camp-proof water, and the only genuine difficulty curve (peak enemies 3 → 55 across 17 waves, without a cliff).
- **Gap 1 (F-E1-1):** no win condition on the card, and it is a 20-wave map by default rather than by design (`twist: {}`).
- **Gap 2 (F-E1-6):** its `lossCondition` stake is inert — the map's own fiction ("the south stake marks your starting ground") promises something to defend, and nothing defends it.
- **Gap 3 (F-E1-8):** 90 gold in 17 waves. The buildings it is named for are unaffordable in practice.
- **Optimisation, smallest-change-first:** give Twin Banks an explicit `twist.secureWave` (a number the design chooses rather than inherits) and a card goal line that says it. That is one datum and one sentence, and it converts the set's best map from confusing to legible.

### 3.3 e1-dry-gulch — ⚠ secured at a wave it never named, on a spring it never used
**Played:** 20/20 waves, **SECURED**, 307 s wall, hp 143/175, 863 kills, level 28, 7 builds, zero errors, 120 fps.
**Verdict:** *the map that proves F-E1-1 by playing it — the run really does end at 20, and the card really does not say so.*
- This is the strongest single piece of evidence in the review: Dry Gulch's briefing renders as *"Goals Work the dry washes around the lone spring"*, and the run then ran to **wave 20** and stamped the Claim Office. A player coming straight off the Claim ("secured at 10") plays twice as long as they have any reason to expect, with no counter and no goal line outside the pause menu.
- **Gap — the signature mechanic never came up (F-E1-9).** The card sells two things: sluices that only work beside the spring, and seams that pay 40 % more. The run never afforded a sluice (40 g) once pressure started, so the spring — the map's whole identity — was scenery for 20 waves.
- **Gap — sixteen dead waves (F-E1-9).** Waves 3–19: one position, one build set, no damage, no decisions but the level-up card.
- **Optimisation, smallest-change-first:** give Dry Gulch an explicit `twist.secureWave` and put the number on the card (F-E1-1's draft covers it); and consider a mid-run reason to return to the spring — the map is named for it.

### 3.4 e1-night-shift — ⚠ the map with the clearest goal and the harshest opening
**Played:** died at wave 4/25 (timescale 2) and again pinned early at timescale 1 — see §7 for the second run's end state. **Camp:** secured at 25, 0 kills, hp 100/100.
**Verdict:** *the only card in the set that states its goal perfectly — and the one map whose first four waves this session could not survive by fighting.*
- The briefing is the best-written of the five: *"Goals Survive to DAWN at wave 25. Rules Beyond your light, the night owns the claim. Relight cold lanterns or build new posts to see threats. Turrets still target in the dark."* Goal, threat, and the counter-play, in three lines.
- **Gap — the map dies before its own mechanic starts.** `twist.lightRamp.duskWave: 5`. Both honest runs were killed or crippled *before wave 5*, i.e. in daylight, with the light ramp never engaged. A map whose identity begins at wave 5 must survivably reach wave 5.
- **Gap — it is the camp's best customer (F-E1-5):** 25 waves of standing still, 187 wet-powder warnings, and the light ramp — the entire reason the map exists — never matters.

### 3.5 e1-baron — ✅ the design answer, behind the harshest door
**Played:** died at wave 3/20 (timescale 2). **Camp:** untouched to 20, killed at 21 by the Baron himself.
**Verdict:** *the only E1 map that cannot be outlasted — and the only one this session never saw past wave 4 by playing.*
- **The good, and it is genuinely good (F-E1-7):** `autoSecureWaveForRun()` returns `MAX_SAFE_INTEGER` while the Baron lives, so the win is *defeat the Baron*, not *survive to 20*. That single design decision immunises the map against every finding in this review — the camp, the survival-only defeat, the flat midgame. It is the template.
- **Gap — the opening is the steepest in the set.** Wave 1 put 13 jumpers on the claim against the Claim's 9, Dry Gulch's 8, Twin Banks' 7 and Night Shift's 6, with `twist.waveCadenceMult: 1.15` compressing the gaps on top. The same driver that secured the Claim and Dry Gulch died here at wave 3.
- ✗ **UNVERIFIED and owed:** the Baron fight itself. No run reached wave 20 by playing, so *"Baron 22/22"* on the launch gate remains unproven by this session.

### 3.6 — THE DIFFICULTY LADDER IS NOT A LADDER (F-E1-10) ✓ VERIFIED (played, five maps, one driver)
One driver, one policy, one difficulty (Trail), five maps:

| Map | Result | First-wave pressure (jumpers alive) |
|---|---|---|
| the-claim | **secured 10/10** | 9 |
| e1-dry-gulch | **secured 20/20** | 8 |
| e1-twin-banks | died 17/20 | 7 |
| e1-night-shift | died **4**/25 | 6 |
| e1-baron | died **3**/20 | **13** |

The two maps a player meets first are the two that can be finished; the two later ones end the run in the opening minute. That is not a smooth curve with a couple of spikes — it is two gentle maps and two walls, with Twin Banks the only honest middle. Against the first-external-tester lesson (*"did not exactly understand what to do"*), the shape of this ladder means a stranger's second or third map is where they stop. Caveat, stated plainly: a scripted driver is not a skilled human, so these outcomes measure **relative** difficulty, not absolute — but they were all measured by the *same* driver, which is exactly what makes the comparison worth something.

---

## 4. THE INSTRUMENT — REPAIRED THIS LEG (leg 1 handed it forward broken, honestly)
Leg 1's driver scored **0 builds in 49 attempts**, which made every difficulty, pacing and dominant-strategy claim unsayable. Two defects, both found by reading the engine's own e2e specs rather than guessing:

1. **`screenPoint` is `(x, z, y)`** — `Game.ts:1667` builds `Vector3(x, y, z)` from it, and every e2e caller uses that order. The driver tried `sp(wx, 0, wz)` **first**, which resolves to world `(x=wx, y=wz, z=0)`: it aimed every build at the **z = 0 line, which on the-claim is the river** — the exact spot `e2e/m1-05-sentry-beacon-build.spec.ts:83` teleports to in order to prove placement is rejected there. It returned finite numbers, so the correct 2-arg fallback never ran. One wrong argument order, 49 failed builds, four unplayed maps.
2. **`Enter` places a building, not `Space`** (`m1-05:42,53`, `m2-01-build-menu.spec.ts:87`). Even a legal ghost would never have been confirmed.

Also repaired: aim by sweeping a hero-local **world** ring (placeRadius is 6 m for every E1 buildable) instead of screen-pixel nudges · upgrade picks now follow a stated competent-player preference (auto-aimed rig first, cursor-aimed Blast last — the driver cannot aim it) with offer **and** pick logged so a dominant strategy shows as a pattern instead of being manufactured · kite policy rewritten (leg 1 fled on 246 of 311 ticks and panned 20 gold in six waves; leg 2 kites only on a real crowd or real damage) · hero terrain zone and position recorded per wave.

Two more defects were found and fixed *during* leg 2, both of which had already produced false readings:
3. **The driver re-picked its nearest seam every tick**, so two roughly equidistant seams made it ping-pong: 21–22 panning ticks out of 780–930, and a suspiciously identical "90 gold" on three different maps that the first draft of F-E1-8 nearly reported as a map economy ceiling. It now commits to a seam until it is worked out or proves unreachable — the Baron run immediately panned 120 by wave 4.
4. **`Escape` is the pause key** (`Hud.ts:194`, `aria-keyshortcuts="P Escape"`). The driver pressed it after every failed build to leave build mode; when build mode was already closed it **paused the game**, and the first Baron run then sat frozen at wave 4 for three minutes looking exactly like an engine hang. It now leaves build mode with `KeyB` and carries a pause guard that logs every recovery (`driver.pauseRecoveries`).

**Proof it plays:** the-claim, timescale 1, fresh profile — SECURED at wave 10 with real gold, real builds, real upgrades and zero errors (`ghostfix2-report.json`); Dry Gulch, SECURED 20/20 (`drygulch-report.json`).
**Known limit, stated:** the driver still has no pathfinding. It walks a single axis toward its target and will press into impassable water instead of routing to a ford. **Any frozen stretch in a report must be checked against the `at:` column before it is called a map defect** — that check is what separated the real finding (F-E1-9, Dry Gulch, hero on open bank, 863 kills) from the artifact (Twin Banks waves 6–15, hero jammed against the channel).

---

## 5. THE RELEASE VERDICT — "is E1 ready to meet strangers?"

**No — and this leg replaced leg 1's "unknown" with four specific, cheap, verified reasons.** All five maps were reached this leg; four were played to an outcome and all five were probed.

1. **Three of the five maps do not have to be played to be won.** The Claim — the map that teaches the game — falls in **77 seconds** to a player who walks into the river and puts the controller down, and the game's own results card reports *WAVES HELD 10 · GOLD PANNED 0 · BUILDINGS RAISED 0*, says *"Struck it proper, partner"* and stamps the meta. Night Shift's entire 25-wave light ramp goes the same way. A stranger who wades in to pan gold — the most natural thing to do on a river claim — finds this by accident, because this session's own driver did, twice, on two different maps. Fix: **one boolean** (`DRAFT-e1-river-camp.md`).
2. **Two of the five never say what winning is**, and both silently run twice as long as the map that taught the rule. Dry Gulch was played to prove it: its card says *"Work the dry washes around the lone spring"* and the run ended at wave **20**. The engine knows the number and shows it in the pause menu; the card the player reads does not. Fix: copy plus one datum (`DRAFT-e1-secure-wave-truth.md`).
3. **The middle of a map has nothing in it.** Dry Gulch's waves 3–19 — eight of its ten minutes — ran with one hero position, one build set, zero damage taken and no decision but the level-up card (F-E1-9). The upgrade curve outruns the wave curve from about wave 9, and the build ladder is priced out of the same window (F-E1-8). Fix: one Balance datum at a time (`DRAFT-e1-midgame-decisions.md`).
4. **The ladder is not a ladder** (F-E1-10). One driver secured the Claim (10/10) and Dry Gulch (20/20), died at 17 on Twin Banks — and died at wave **4** on Night Shift and wave **3** on the Baron. Two gentle maps, one honest middle, two walls. A stranger's second or third map is where they stop.

Underneath all four sits the structural one: **the only way to lose an E1 map is to let your own body be touched** (F-E1-6). Twin Banks even ships a stake flagged `lossCondition: true` that nothing reads. A tower-defence game whose maps cannot be lost by losing the claim is a game whose towers are optional — and the play agrees: Dry Gulch was secured with seven buildings, none bought after wave 2.

**What is genuinely good, and must not be lost in the above:** **zero console errors and zero page errors across 13 runs and roughly 45 minutes of continuous play**, ~120 fps on desktop, correct Trail default on a fresh profile, briefings that render and read well (Night Shift's is excellent), an upgrade loop that offers and applies cleanly, an economy that pays properly when you stand in it, a secure beat that lands with a Claim Office card and meta stamps, and **Twin Banks** — a genuinely good map with real chokepoints, real build restrictions and the only E1 river a player cannot cheat. Most of all: **the Baron already contains the answer to this whole review.** His win condition is a thing you must *do*, not a duration you must outlast, and he is the one antagonist who does not respect the river. Every fix below is really just "make the other four maps more like the Baron".

**The one question, answered plainly:** **Not yet — but closer than it looks.** Two of the four reasons are a boolean and a sentence, and they are the two a stranger would hit in their first ten minutes. Land those and E1 can meet strangers honestly; the midgame and the ladder are then real design work, and worth doing with playtest data rather than in the dark. Ship none of them, and the first honest tester wins the first map without playing it, plays the second for twice as long as they were told, and quits on the third in the opening minute.

**Recommended order for the next shift:** land `DRAFT-e1-river-camp.md` (release-blocking, one boolean) → `DRAFT-e1-secure-wave-truth.md` (copy) → **play the Baron fight** (never reached by play; the launch gate's *"Baron 22/22"* is still unproven) → `DRAFT-e1-midgame-decisions.md` one datum at a time → `DRAFT-e1-hold-the-claim.md` (the owner fork that generalises all of it).

---

## 6. DRAFTS FILED
- `tasks/DRAFT-e1-river-camp.md` — **F-E1-5, release-blocking.** One boolean, with three alternatives if the owner wants deep wading kept.
- `tasks/DRAFT-e1-secure-wave-truth.md` — F-E1-1, the win-condition truth fix (copy + data).
- `tasks/DRAFT-e1-hold-the-claim.md` — F-E1-6, give E1 a defeat condition its maps can actually suffer.
- `tasks/DRAFT-e1-trail-guide-plain-boot-proof.md` — F-E1-2, prove the teaching path in a plain boot.
- `tasks/DRAFT-e1-depth-instrument-ghostvalid.md` — **CLOSED this leg** (§4); kept for the trail.

READY-FOR-GATES — scope stated plainly. Evidence: `reviews/shots-e1-depth/*-report.json` + `*.png`, local video in `e1-review-video/` (gitignored class). Gates not run: this branch touches no `src/`, no assets, no Balance, no contracts — only `reviews/`, `tasks/DRAFT-*` and two rig segments under `rehearsal/`.
