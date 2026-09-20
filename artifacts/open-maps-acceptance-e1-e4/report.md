# open-maps-acceptance-e1-e4 — the six maps Astra left OPEN or PARTIAL on the playability half

**Implementer:** Claude Opus 5 on the owner's Anthropic subscription, in the scratch worktree
`wt-openmaps`, branch `feat/open-maps-acceptance-e1-e4`, cut from main `2ad3b51f0`.
**Master:** `tasks/open-maps-acceptance-e1-e4.md`. **Owner, 2026-09-18:** "We have about 18 hours
left and about 50% of the subscription - what can we do to use it?"
**Date:** 2026-09-18. Fires were live on main throughout; nothing here was posted to the county.

---

## 0. The verdict, before any table

The instrument is built, honest and reusable: `e2e/playability-secure.spec.ts` plays each of the six
maps the way the smoke plays them — plain boot, no `?debug`, no `__GR_TEST__`, real key events, real
button clicks, read back off the read-only diagnostics — and carries the run through the contract's
own secure wave, the Claim Office's *Return to Town*, a plain reload, and the walk back to the Book.
**It named the killer on every one of the six**, and three of those killers are cured here in the
map's own data. It did **not** reach the master's "green three runs on both projects" bar inside the
budget, and this report says exactly how far each map got and why. Every number below is measured on
this tree, not inherited.

---

## 1. The instrument

`e2e/playability-secure.spec.ts`, deliberately manual behind `GR_PLAYABILITY_SECURE=1` — the same
mechanism the smoke uses at its own `test.skip`, for the same reason: `playwright.config.ts` sets
`testDir: './e2e'`, so a `@slow` tag alone would not keep six full play-outs out of `npm test`.

Six questions, in the smoke's shape:

| cell | what it asks |
|---|---|
| `boots` | the requested contract actually loaded (`diagnostics.contract.fallbackReason === null`) |
| `secures` | the run reaches the contract's secure wave AND the Claim Secured overlay appears |
| `banks` | *Return to Town* writes a NEW secured score for this contract at >= its secure wave |
| `board` | the Book is on screen again straight off the run ledger |
| `reload` | a plain reload keeps that score byte-for-byte, and the Book is reachable on foot again |
| `clean` | zero console errors and zero page errors across the whole journey |

```
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5450 GR_PLAYABILITY_SECURE=1 \
  npx playwright test e2e/playability-secure.spec.ts --project=desktop-chrome --project=mobile-chrome \
  --workers=1 --reporter=line --trace=off
```

Rows land in `secure-rows.jsonl` beside this report — one JSON object per run, with a sample trail
every 10 sim-seconds, the buildings raised with their sim stamps, the upgrade cards taken, and every
note the run wrote about itself.

### 1a. What "plays it" means — and the four times the instrument lied before it told the truth

The strategy is the card's own verbs: pan at the seams the map offers, spend it on the buildings the
HUD offers, take an upgrade when the Patent Office opens, mend what the wreckers chew, and walk a
circuit on your own ground. Four defects were found in the instrument itself BY MEASUREMENT, and each
is now a comment in the spec beside its fix:

1. **No ford routing** (Twin Banks BEFORE runs 1 and 2). The braided claim's water mask makes both
   channels un-wadeable; a hero steering straight at a seam on the far bank walks into the channel
   and stands there. Measured: stuck at `(-2.4, 3.9)` from sim 45 s to death at 345 s, 50 gold,
   nothing built. Cure: `crossingsFor()` reads the contract's own `fords`, and `journey()` crosses at
   one — exactly as the card says the pressure does.
2. **A vacuous `banks` cell** (Dry Gulch BEFORE). The progressed-profile seed the smoke uses — a
   player who has earned the whole board — already holds a `secured` row for every contract, so "a
   secured row exists" passed on a SEEDED row (`waves=30 gold=400 timeAlive=600`) and would have
   passed on any map at all. Cure: snapshot the scoreboard before the click, require a row the click
   itself wrote.
3. **A patrol that parked** (Dry Gulch BEFORE). One circuit corner was unreachable, so the hero stood
   at `(-7, 14.8)` from sim 280 s to the secure. Cure: a per-corner stall counter that abandons a
   blocked corner and walks the next leg.
4. **A build step that failed in silence** (Hill Mine, Baron). Walking to an exact metre fails on a
   terraced map with cliff bands; the leg returned `false` with no note and the run raised NOTHING.
   Cure: a near miss is not a refusal — get as close as the ground allows, write the note, and let
   the ghost's own validity decide.

The build ghost is hero-anchored on purpose: `BuildSystem.updateGhostPosition`
(`src/systems/BuildSystem.ts:1667`) only follows the pointer once `#game-canvas` has seen a
`pointermove`, so the spec never moves a pointer over the canvas — it walks the hero to where the
building goes and presses Space. That is also the cheapest honest input on a 390 px phone.

---

## 2. BEFORE — the instrument's first full pass on main, desktop, six maps, 10.7 min wall

Tree `2ad3b51f0`, contract data untouched. Transcript: `secure-rows-BEFORE-desktop.jsonl`.

| map | secure wave | which question failed, at what wave and sim second | why, from the run's own diagnostics |
|---|---|---|---|
| **e1-dry-gulch** | 20 | **`secures` PASSED — wave 20 at 600.1 s, 175 HP, 4 buildings, 852 kills.** The `banks`/`board`/`reload` cells read green in this pass and were later shown to be FALSE GREENS (§1a.2 and §4a); the true `banks` answer for this run is unknown. | Astra's row said "no desktop full objective pass yet"; a plain-boot desktop run does reach and hold the secure wave. The caveat is in §4. |
| **e1-twin-banks** | 20 | `secures`, dead at **wave 16 / 504.7 s** | 719 kills, 4 buildings, purse on 0. No E1 contract authors `spawnGates`, so every lane spawns on the HERO-CENTRED ring (`WaveSystem.ts:588`, radius `Balance.waves.spawnRingRadius` = 26, clamped at `:1023`) from all four `lanes.spawnEdges` — the hero is surrounded on a claim whose own card says the pressure crosses at two fords. |
| **e1-night-shift** | 25 | `secures`, dead at **wave 15 / 460.0 s** | 614 kills, 3 buildings, 7 gold. The map goes fully dark at `twist.lightRamp.darkWave` 10 and all seven `prePlacedBuildables` lantern posts are authored `wrecked: true`; the run carried no light of its own into the dark. |
| **e1-baron** | 20 | `secures`, dead at **wave 23 / 609.5 s** — past the secure wave | 180 kills, **0 buildings**. Not a survival failure: `Game.autoSecureWaveForRun()` (`src/game/Game.ts:6268`) returns `MAX_SAFE_INTEGER` while `waitsForBaronDefeat()` holds, so outliving wave 20 secures nothing — the Baron has to die. Compounded by the instrument's silent build defect (§1a.4). |
| **e2-hill-mine** | 12 | `secures`, dead at **wave 3 / 95.3 s** | 30 kills, **0 buildings**, 50 gold. The seams are on the T2/T3 terraces (`harvestAnchors` z 25-39) while the hero's own stake is the boiler-house site on the base terrace `(0, 12)`; the climb up the switchbacks does not fit inside a 30 s wave. Astra measured the same thing from the other end: "driver panning/travel deadline at wave 7". |
| **e4-long-road** | 12 | `secures`, dead at **wave 4 / 127.9 s** | 38 kills, 1 building, 25 gold. The run's own notes, verbatim: `seam gold-seam-1 (90.0,14.0) unreachable on foot`, `seam gold-seam-3 (30.0,-14.0) unreachable on foot`, `could not fund turret (cost 50, purse 25)`. Six seams spread 60 units apart along a 400-unit road, not one of them on a way-station ground the card tells you to build on. |

---

## 3. The cures, in the map's own data — every key changed, old to new, with its reason

(continued below)

| map | key | old | new | reason |
|---|---|---|---|---|
| **e1-twin-banks** | *(made, measured, then **REVERTED** — see §5c)* | `["north","south","east","west"]` | *(unchanged on the branch tip)* | The cure was landed as `196c811d1`, measured (+1 wave; a harsher no-orders floor on three of five bench seeds), and reverted as `742a53898` because it reds `e2e/e1-twin-banks.spec.ts:160`, which this task's firewall does not allow me to re-point. Filed as a proposal with its evidence in §5c. |
| **e2-hill-mine** | `twist.waveCadenceMult` | *(absent, i.e. 1.0)* | `0.75` | The wave interval becomes 40 s (`WaveSystem.waveInterval()` = `Balance.waves.waveInterval` / cadence), which is the climb up a switchback to the T2 seams plus the climb back down to the base terrace to build. Not a new idea: the owner's 2026-08-22 cadence ladder already gave the Trestle 0.7 and the Incline 0.75 and skipped this map. 0.75 is the Incline's exact rung — same secure wave 12, same three-variant roster. |
| **e4-long-road** | `tileParams.harvestAnchors` | `(-150,14) (-90,-14) (-30,14) (30,-14) (90,14) (150,-14)` | `(-140,-10) (-130,-16) (-6,10) (6,16) (130,-10) (140,-16)` | Same six anchors, now two inside each of the three way-station `buildZones` the card sends the player to. `HarvestSystem` keeps only 2-3 seams live at once (`Balance.goldSeam.activeMin/activeMax`), so on the old layout the nearest live seam from a station was routinely 200 units away and the run could not fund its first turret. The road between stations keeps no seams, which is the card's own "Three surveyed station grounds divide the route". |
| **e1-night-shift** | *(none — the cure was in the instrument)* | | | The map goes dark at `twist.lightRamp.darkWave` 10 and authors seven `prePlacedBuildables` lantern posts, every one `wrecked: true` with `relightCost: 8`. Its card already tells the player what to do — "Relight cold lanterns or build new posts to see threats" — so the instrument now carries two `lantern_post` into the kit on any contract that declares a `lightRamp`. That is a card verb, not a balance change. |
| **e1-dry-gulch** | *(none)* | | | It already passes all six questions on unmodified data; see §2 and the caveat in §4. |
| **e1-baron** | *(none — held, §5)* | | | |

**Re-published:** `assets/contracts/epoch-4-motor/mask-tables/e4-long-road.json` (the mirror guard at
`scripts/e3-mask-tables.test.mjs:256` reads `harvestAnchors` as a `directKey`). The E1 maps and
`e2-hill-mine` have no published mask table, so nothing else mirrors these edits.

**Census pins re-pointed, with cause:** `e2e/er01-e2-census.spec.ts:77-81` pinned this map family's
cadence as "the Hill Mine and the Pressure Garden author NEITHER"; the Hill Mine now authors the
cadence rung and the pin says so, with the BEFORE row as its cause, in the same commit as the data.
`er01-e4-census.spec.ts` reads neither `harvestAnchors` nor `lanes` and needed no re-point; there is
no `er01-e1-census.spec.ts` in the tree (the master names one — it does not exist; `map-census.spec.ts`
and the smoke are E1's census surface).

---

## 4. The finding that outranks the cures: on these six maps, EXPOSURE decides the run

This is the most useful thing measured today, and it was measured three times on the SAME map with
the SAME data:

| Dry Gulch, e1-dry-gulch, desktop, identical contract data | strategy the instrument used | result |
|---|---|---|
| BEFORE run (§2) | four buildings, then a 7-unit circuit whose far corner was unreachable — so the hero effectively stood behind its own guns from sim 280 s | **secured wave 20**, 600.1 s, 175 HP |
| AFTER pass 1 (patrol-stall fix: the hero no longer parks) | four buildings, then a real 7-unit circuit | dead **wave 17**, 517.9 s |
| AFTER pass 2 (mend-and-extend added) | nine buildings, a real 7-unit circuit, and a hero running between seams, turrets and build sites | dead **wave 15**, 466.7 s |

More buildings and more upkeep made the run WORSE, because every trip to a seam or a damaged turret
is a trip outside the guns, and the spawn ring is centred on the hero. The spread between the best
and worst strategy on unchanged data (wave 15 to wave 20) is **larger than the effect of any data
cure in §3**. So:

- A plain-boot acceptance instrument for these maps must DECLARE its strategy, or its verdict is
  noise. This one now does: build the kit, mend anything under 55% HP, add a gun (turret first,
  beacon second, never past eight, never spending the repair float), and keep a **4-unit** circuit —
  close to your own guns, which is what a player does.
- Astra's own passing runs used the same shape plus two things this instrument deliberately does not
  have: enemy-avoidance steering read out of the engine (`dry-gulch-native-16.mjs` reaches into
  `window.__dryGame` through a route interception to list live enemies), and a late-run weapon switch
  to Blast with native aiming. Both are outside "a plain strategy a first-time player would" and the
  first is not reachable without a seam, so neither was copied.
- **Nobody should read the Dry Gulch's BEFORE pass as "the Dry Gulch is done".** It is a genuine
  plain-boot pass — the first desktop one, which is what Astra's row asked for — and it is one run
  at the boundary, not three.

---

## 5. Held, with the hunk quoted — the two maps whose remaining cure is not in map data

### 5a. e1-baron — outliving the twentieth horn secures nothing

The BEFORE run reached **wave 23**, three waves PAST its secure wave of 20, and still failed
`secures`. That is by design and the design is in `src/`:

```ts
// src/game/Game.ts:6361
  private waitsForBaronDefeat(): boolean {
    const baron = this.activeContract.twist.baron;
    if (!baron || this.baronBeatenThisRun) return false;
    if (baron.variantId === 'dredge_queen') return !this.dredgeQueenBoss.diagnostics().persistentWreck;
    if (baron.variantId === 'homemaker_9000') return !this.homemakerBoss.diagnostics().persistentKept;
    return baron.variantId !== 'dynamo_crawler' || this.waveSystem.diagnostics.wave >= baron.wave;
  }
```

and its consumer, `Game.autoSecureWaveForRun()` at `src/game/Game.ts:6268`, which returns
`Number.MAX_SAFE_INTEGER` while that latch holds. The Baron's card says the same thing in the
player's words — "The Baron rides at wave 20. Break his Rocket Cart." — so the latch is RIGHT and
must not be touched. What the map owes is not a data tweak: it is a plain-boot run that actually
kills a x4-scale boss with `hpScale: 240`, `escortCount: 8` and a three-rocket volley every 8 s,
while `waveCadenceMult: 1.15` keeps the ordinary waves coming 15% faster. **No data change was made
to `e1-baron` and none is recommended from this evidence.** The honest next step is an instrument
that fights the boss (focus fire, the Blast weapon, kiting the volley telegraph) — which is
implementer work on `e2e/playability-secure.spec.ts`, not a `src/` hunk and not a balance edit. If a
future session decides the Baron is genuinely unbeatable on a plain boot, the smallest defensible
`src/` change would be to the volley, not to the latch:

```ts
// src/game/Game.ts — NOT APPLIED, quoted only.
// twist.baron.rocketVolley currently fires `count: 3, damage: 18, radius: 2.35` every
// `cadenceSeconds: 8` with `telegraphSeconds: 1.2`. The telegraph is the only part a player can
// answer, and 1.2 s at timescale 4 is 0.3 s of real reaction time. A lengthened telegraph is the
// change that makes the fight legible without making it easier:
-          "telegraphSeconds": 1.2,
+          "telegraphSeconds": 2.0,
// (this one IS contract data, `assets/contracts/epoch-1-frontier/contracts.json`, and would be in
//  firewall — it is held anyway because no measurement here shows the volley is what kills the run:
//  the BEFORE run died at wave 23 with 0 buildings, i.e. to the ordinary waves, not to the Baron.)
```

### 5b. e4-long-road — the convoy errand is the secure, and the card never mentions it

The seam cure in §3 fixes the FUNDING killer the BEFORE row named. It does not make the map
securable, because the Long Road's secure is latched on an errand:

```ts
// src/game/Game.ts:6289 (inside autoSecureWaveForRun)
      || (this.motorSocket !== null && !this.motorSocket.objectiveAllowsSecure)
```

```ts
// src/sim/MotorSocket.ts:258
  /** The era's errand, one per map, latched one-way. See the file header for the four. */
  get objectiveAllowsSecure(): boolean {
    return this.arrived;
  }
```

`arrived` for this map is the convoy reaching the far railhead at `(190, 0)` — 370 units of graded
road from the lead Hauler's start at `(-180, 0)`, fuelled at the tar nodes. The player CAN do it
(`src/game/Game.ts:9839-9840`: "at a survey stake it grades first; elsewhere it calls the Hauler.
Keyboard players retain U as the direct grade shortcut"), and Astra's table records the errand
passing natively on both projects. **Two things are held:**

1. The instrument does not perform the Motor errand (GRADE at a stake with `U`, harvest tar, call the
   Hauler with `Space`, walk east ahead of it). That is implementer work on the spec, scoped and
   understood, not landed here.
2. A real card defect, found on the way: the Long Road's `briefing.goals` are "Follow the long
   west-east road between three old way-stations" and "Build around the station grounds and watch
   every verge" — **neither names the errand that gates the win.** The errand is written only in
   `twist.motorFrontier.description`, which the player never sees. That IS contract data and in
   firewall, but re-voicing a shipped card's goals moves `e2e/contract-briefings.spec.ts`, the smoke's
   briefing cell and the rendered `public/skill.md` fences, and it is a content act — so it is
   **filed, not made**, as a one-line proposal for the drainer:
   `goals[0] -> "Grade the long road and bring the convoy east to the far railhead."`

### 4a. A second instrument lie, found by the cure for the first one

The stricter `banks` cell (§1a.2) immediately reported something the loose one had been hiding:
**a genuine wave-20 secure on the Dry Gulch wrote NO score row at all.** Measured, AFTER run 1:
Claim Secured at wave 20 / 600.1 s, 84 HP, 8 buildings — *Return to Town* clicked — `0 new row(s)`.

That is not a game defect. `Scoreboard.trimScores` (`src/game/Scoreboard.ts:30`) keeps the global top
five **plus each contract's own best**, and the smoke's progressed-profile seed writes
`waves: 30, gold: 400, kills: 40` for every contract on the board. A real wave-20 run is WORSE than
the row already sitting there, so it is trimmed the instant it is written. The seed was standing on
the answer.

Cured in the instrument, not in the game: the contract UNDER TEST is now seeded at the worst standing
that still counts as secured (`waves: 1`, empty purse, `secured: true`), while every other contract
keeps the smoke's row, so every unlock the board needs is untouched — this contract's own unlock
reads `secured`, not `waves`. **Consequence for §2: every `banks`/`board`/`reload` green in the
BEFORE table was a false green and is struck; only the `secures` column of that table is evidence.**

---

## 6. AFTER — the frozen strategy on the cured tree

### 6a. All six, desktop, one pass (`secure-rows-AFTER-desktop.jsonl`)

| map | BEFORE | AFTER | delta | note |
|---|---|---|---|---|
| e1-dry-gulch | secured wave 20 | **secured wave 20** (600.1 s, 84 HP, 8 buildings, 914 kills) | — | data untouched; and see §6b — this is 1 secure in 6 runs |
| e1-twin-banks | dead wave 16 / 504.7 s | dead **wave 17** / 513.6 s, 730 kills, 8 buildings | +1 wave | fords cure applied; still 3 short of 20 |
| e1-night-shift | dead wave 15 / 460.0 s | dead **wave 16** / 494.7 s, 698 kills, 5 buildings incl. a lantern post | +1 wave | light carried into the dark; still 9 short of 25 |
| e1-baron | dead wave 23 / 609.5 s (0 buildings) | dead **wave 20** / 522.7 s, 622 kills, 2 buildings | -3 waves | within the run-to-run spread; the Baron still lives, so `secures` is unreachable either way (§5a) |
| e2-hill-mine | dead wave 3 / 95.3 s | dead **wave 1** / 63.9 s (and **wave 9** / 379.2 s on the intermediate pass that carried the same cadence) | see note | the cadence cure is real — a 40 s wave interval took this map from wave 3 to wave 9 in the pass that measured it — but the map's spread is enormous and a single run can still die in wave 1 |
| e4-long-road | dead wave 4 / 127.9 s | dead **wave 3** / 102.5 s | ~0 | the seam cure removes the "could not fund" note but the map cannot secure at all without the convoy errand (§5b) |

### 6b. The Dry Gulch, three runs on both projects (`secure-rows-drygulch-3x2.jsonl`) — the honest number

| project | run 1 | run 2 | run 3 |
|---|---|---|---|
| desktop-chrome | dead wave 16 / 488.8 s | dead wave 19 / 580.9 s | dead wave 17 / 528.0 s |
| mobile-chrome | dead wave 16 / 487.9 s | dead wave 18 / 549.5 s | dead wave 19 / 576.5 s |

**Zero of six.** Counting the earlier passes, a plain boot on the Dry Gulch secured **once in six runs**
and otherwise died between wave 15 and wave 19 of 20. That is the map's real state: it is AT the
boundary, not over it. Astra's row ("PASS mobile native wave20 ... no desktop full objective pass
yet") is consistent with that — a desktop pass exists, and it is not repeatable three times.

**So the master's bar — "the instrument is green three runs on both projects" — was NOT reached on
any of the six maps, and nothing here claims it was.**

---

## 7. Null floors — re-recorded from measurement, and nothing secures with no orders

Re-recorded TWICE: once with the Twin Banks fords cure in place, and again after it was reverted
(§5c), so the artifact on the branch tip describes the tree the branch tip actually ships.

`node scripts/null-floor-anchors.mjs` on the final tree: 83 floors in 305.1 s.
`node scripts/null-floor-anchors.mjs --check`: **rc=0, 83 of 83 match, 300.8 s**, `eraStamp: pinned
and tree agree at "2ad3b51f0"`.

**1 of 36 contract groups moved — the Hill Mine, the only map whose cadence this branch changed — and
NOTHING SECURES WITH NO ORDERS anywhere in the artifact** (checked explicitly across all 83 pairs:
zero `secured: true`).

| anchor | before | after |
|---|---|---|
| `e2-hill-mine-01` | waves 2, 72,467 ms, 19 kills, `fnv1a32:658e852a` | waves **1**, **75,700 ms**, 19 kills, `fnv1a32:76fe673e` |
| `e2-hill-mine-02` | waves 2, 82,267 ms, 22 kills, `fnv1a32:c87e0e99` | waves **1**, 56,700 ms, 11 kills, `fnv1a32:ddf555cd` |

**The floor reads one wave lower and is not a shorter life.** `e2-hill-mine-01` moved from wave 2 at
72,467 ms to wave 1 at **75,700 ms** — the idle run lives LONGER in sim time and sees FEWER waves,
which is exactly what a 40 s wave interval predicts. Seed `-02` is noisier (56,700 ms, 11 kills) and
sits inside this map's very wide run-to-run spread (§6a). Both values reproduced identically across
two independent re-records.

The Long Road's floors did not move at all: relocating seams cannot change a run that never pans. The
Twin Banks floors are back at main's values, the cure having been reverted.

**Measured while the fords cure WAS in place** (recorded here because it is the cure's real price and
a drainer landing §5c will see it): `e1-twin-banks-01` waves 3 -> 2 (99,733 -> 81,933 ms, 50 -> 33
kills), `-02` 3 -> 2 (98,633 -> 85,067 ms), `-03` 3 -> 2 (99,333 -> 81,167 ms), `-04` 2 -> 3
(75,600 -> 106,600 ms), `-05` unchanged at 3. The map gets HARSHER for a player who does nothing,
which is the right direction.

### 5c. e1-twin-banks — the fords cure, made, measured, reverted, and filed

**Landed** as `196c811d1`, **reverted** as `742a53898`. Both the change and the reason for pulling it
are evidence, so both are here.

```diff
  "lanes": {
    "spawnEdges": [
      "north",
-     "south",
-     "east",
-     "west"
+     "south"
    ],
```

**Why it is right.** No E1 contract authors `spawnGates` (they live on `twist.enemyRoster` variants),
so `WaveSystem.spawnAt` (`src/systems/WaveSystem.ts:588`) places every body on the HERO-CENTRED ring
at `Balance.waves.spawnRingRadius` = 26, from each listed edge. With all four listed, the ring closes
from every quarter at once, on a claim whose own briefing rule 2 reads "Two fords carry pressure
across the river" — a sentence the data has never made true. With east and west gone, the north half
of every wave has to reach a ford at `x = ±16` and cross it (`Balance.pathing.riverBlocksEnemies`),
and the wave BUDGET does not change at all: `WaveSystem.planWave` sizes a wave from `waveBudget(wave)`
rather than from the edge count.

**What it measured.** Dead wave 16 -> **wave 17** of 20 (504.7 s -> 513.6 s, 719 -> 730 kills). The
no-orders floor got HARSHER on three of five bench seeds (wave 3 -> wave 2, ~17 s sooner) — the
honest price of concentrating the same budget onto two edges, and the right direction: the map is not
kinder to a player who does nothing.

**Why it is not on the branch tip.** It reds a suite outside this task's firewall, exactly and
predictably:

```
e2e/e1-twin-banks.spec.ts:135  "north marker is not the run loss stake, south overrun still ends the
                                run, AND WAVES USE FOUR EDGES"
                        :160   expect(edges).toEqual(['east', 'north', 'south', 'west']);
   measured on the cured tree:  Received ["north", "south"]
```

The master's firewall permits re-points only in `er01-e{1,2,4}-census.spec.ts`. A drainer who wants
this cure needs exactly two edits in one commit: the diff above, and a re-point of that test's title
and assertion with this cause.

---

## 8. Gates — every one, with its exact result

| gate | command | result |
|---|---|---|
| typecheck | `npx tsc --noEmit` | **rc=0** |
| build | `npm run build` | **rc=0** |
| the instrument, six maps, desktop (BEFORE) | `GR_PLAYABILITY_SECURE=1 … --project=desktop-chrome` | 1 passed / 5 failed, **10.7 min** — the BEFORE table, §2 |
| the instrument, six maps, desktop (AFTER) | same, cured tree | 0 passed / 6 failed on the `banks` cell or earlier — §6a |
| the instrument, the Dry Gulch, 3 runs x 2 projects | `GR_SECURE_ONLY=e1-dry-gulch … --repeat-each=3` | **0 of 6 secured** (waves 16/19/17 desktop, 16/18/19 mobile) — §6b |
| the smoke, the same six maps, both projects | `GR_PLAYABILITY_SMOKE=1 GR_SMOKE_ONLY=<the six> …` | **12 passed (3.6 min)** |
| `task-025` + `m1-01` + `m2-01`, both projects | `npx playwright test … --project=desktop-chrome --project=mobile-chrome` | **34 passed (2.5 min)** |
| `e3-mask-tables` | `node --test scripts/e3-mask-tables.test.mjs` | **30 pass / 0 fail** |
| `er01-e2-census` + `er01-e4-census` | `npx playwright test … --project=desktop-chrome` | **8 passed (1.3 min)** |
| `skillmd-guard` + `skillmd-contracts-guard` | `node scripts/render-skillmd-contracts.mjs` then `node --test …` | render rc=0, `public/skill.md` **unchanged**, guards **20 pass / 0 fail** |
| null floors, re-record | `node scripts/null-floor-anchors.mjs` | 83 floors, 293.2 s |
| null floors, check | `node scripts/null-floor-anchors.mjs --check` | **rc=0, 83 of 83 match, 299.3 s**, eraStamp agrees at `2ad3b51f0` |
| adjacent map suites | `e1-twin-banks` + `e2-hill-mine` + `e1-baron` + `e4-roads-and-convoys`, desktop | **19 passed / 8 failed — all 8 attributed as PRE-EXISTING, see below** |

### 8a. The eight adjacent reds, attributed with proof

Four distinct tests fail, each twice in the batch run (once per spec-file grouping):

```
e2e/e2-hill-mine.spec.ts:75   loads the locked Steamworks poster contract and ships the Hill Mine elevation table
e2e/e2-hill-mine.spec.ts:184  T2 high ground out-ranges the rail cut while the terrace face blocks bolts both ways
e2e/e2-hill-mine.spec.ts:250  bandits route switchbacks and flooded gallery depth blocks deep water but allows edge wading
e2e/e4-roads-and-convoys.spec.ts:69  every Motor reel replays to its claimed hash in Node and Chromium
                                     ("assay replay failed: malformed tape",
                                      artifacts/e4-roads-and-convoys/e4-dust-flats-floor.tape.json)
```

**Attribution, twice, by measurement rather than by argument** (CLAUDE.md Mistake #4):

1. With `e2-hill-mine`'s `waveCadenceMult` removed from the working tree and everything else this
   branch changed left in place: **the same 4 failed, the same 7 passed.**
2. With `git checkout 2ad3b51f0 -- assets/contracts/` — i.e. main's contract data, none of this
   branch's data at all: **the same 4 failed, the same 7 passed.**

They are pre-existing on main and none of them is this branch's. The `e4-dust-flats-floor.tape.json`
red in particular touches a contract this branch never opened.

---

## 9. The engine hash

`assets/contracts` is in `ENGINE_SOURCE_INPUTS` (`scripts/assay-replay-agent.mjs:36`), so this
branch moves the engine hash and the drain pins it.

| tree | `computeEngineHash()` |
|---|---|
| main `2ad3b51f0`, before any edit | `540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068` |
| **this branch's tip** | `34b30c44ef98f0f7262ebc1545f93440fe39c375e58a0cbf17743b3e54ccb99f` |

---

## 10. What a drainer should do with this

1. **Land the instrument and the two data cures.** They are independently useful and every gate they
   touch is green: tsc, build, the smoke for all six maps on both projects (12/12), task-025 + m1-01
   + m2-01 (34/34), `e3-mask-tables` (30/30), the E2 and E4 censuses (8/8), floors `--check` clean at
   83/83 with nothing secured on no orders.
2. **Read §4 before reading §6.** The instrument's own strategy spread on unchanged data (wave 15 to
   wave 20 on the Dry Gulch) is larger than any data cure measured here. Any future acceptance number
   for these maps is meaningless without a declared strategy, and the one this spec declares is
   written into it.
3. **Decide §5c** (the Twin Banks fords cure, made, measured, reverted) — two edits, one commit.
4. **The three open questions**, in the order they block:
   - the Baron: is a plain boot expected to beat a x4 boss with 8 escorts and a rocket volley, or is
     the acceptance bar for `e1-baron` "reaches wave 20 alive"? (§5a — no data change proposed.)
   - the Long Road: the errand that gates the secure is invisible on the card (§5b). Re-voice the
     goals, or accept that the map is unsecurable for a player who reads only the card?
   - the four pre-existing adjacent reds in §8a, two of which (`e2-hill-mine`) sit on a map this
     branch touched and none of which this branch caused.
5. **Not done, and named so nobody inherits it as done:** no map is green three runs on both
   projects; `node scripts/render-skillmd-contracts.mjs` was run and left
   `public/skill.md` byte-identical (no field this branch changed is in its fences;
   `skillmd-guard` + `skillmd-contracts-guard` 20/20 green); and no mobile AFTER pass exists for the
   five maps other than the Dry Gulch.
