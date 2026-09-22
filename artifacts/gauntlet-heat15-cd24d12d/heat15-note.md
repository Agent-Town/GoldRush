# Heat 15 — the Regatta's heat — the operator's note

**Operator:** an attended-hosted Claude agent (Opus, the owner's Anthropic subscription), hosting
headless `claude -p` riders (Claude Opus 5, Claude Code CLI 2.1.272) from a DETACHED arena at the
deployed production build. No Codex anywhere (`tasks/CODEX-WALL`).
**Master:** `tasks/heat-15-regatta.md` (slice 4 of `specs/agent-play/e5-regatta-steerable-boat.md`).
**Owner's words the heat rides under, verbatim:** 2026-09-20 "A14 - do it" · 2026-09-22 "F-RB2-2:
gangway-reach only" · 2026-09-17 "All on the Anthropic subscription".
**Branch:** `heat15/regatta`, cut from main `d7781f976`, path-scoped to
`artifacts/gauntlet-heat15-cd24d12d/**` only.

---

## 1. The arena and the pre-flight

| check | measurement |
|---|---|
| production build | `curl -s https://agenttown.app/goldrush/version.json` → `{"build":"cd24d12d","builtAt":"2026-09-22T03:08:14Z"}` |
| does it carry the gangway rule? | **yes** — `git merge-base --is-ancestor df5261526 cd24d12d2` → true. `df5261526` is the F-RB2-2 gangway landing; production descends from it. The master's STOP condition ("production predates the gangway rule") did not fire. |
| arena | DETACHED worktree at `cd24d12d2` under `…/scratchpad/wt-heat15-arena`, registered in `git worktree list` (F-HEAT13-4: the git link must survive the heat). `node_modules` SYMLINKED from the primary checkout — no install, no disk cost. |
| the arena's own papers | an idle probe of `e5-regatta` wrote a tape carrying `buildId cd24d12d2`, `engineHash 52a84bc29feb…`, `era 6`, **`viewVersion 3`** — version 3 is the Regatta's own view bump (pin #21). |
| era | still **6, "the Re-surveyed Claims"** — it did NOT roll since heat 14. Thirty pins now stand under it; heat 14 rode pin #8. |
| toolchain | `/opt/homebrew/bin` first: Node v26.4.0, `claude` 2.1.272. One rider at a time under `nice -n 5` (a Codex lane task, `f-corr4-18-river-pack`, shared this host throughout). |
| Opus headroom (F-HEAT13-1) | probe 1 and probe 2 before the first ride: `rc=0`, `result: "OK"`, `is_error: false`, `api_error_status: null`. Re-probed between rides; see §4. |

### The skew probe — BOTH PROOFS PASS, before any ride

**Proof 1, the refusal.** Heat 13's VERIFIED probe reel, re-POSTed byte-identical (`the-claim`,
tape `agent-1c9d4989-b6c73b19-…`, papers `era 5 / engineHash 09838c35…`):

> HTTP **400** · `{"ok":false,"error":"reel_not_current","message":"This reel rode era 5; the county accepts era 6 'the Re-surveyed Claims'."}`

**Proof 2, the acceptance.** The same orders replayed order-for-order through THIS arena
(`probe/probe-driver.mjs`) secured `w10 / 335 g / 300 s` at `eventLogHash fnv1a32:1c431865` —
**byte-identical to heat 14's replay of the same orders**, across twenty-two intervening era-6 pins
— and the door answered:

> `{"ok":true,"stored":true,"rank":null}` → slip `assay: "verified"`, `assayHash: fnv1a32:b131e18e`,
> `ranked: false` (the `operator-probe` law, `public/skill.md:52` — a probe never touches the board).
> WATCH papers on the wire: `buildId cd24d12d2`, `engineHash 52a84bc2…`, `era 6`, `viewVersion 3`.

The probe rode its own `anonId` (`sha256('heat15-probe')`), so it spent none of the riders' 30-per-hour
budget (F-HEAT14-7).

---

## 2. The board before the heat

`receipts-before.json`, measured from the live API (`/api/standings`, all 38 ledger contracts),
**2026-09-22T03:16:04Z**:

| number | value |
|---|---|
| board contracts measured | 38 (`e1-drill-yard` answers 400 — it is the training ground, not a board) |
| verified rows standing | **30** |
| reels counted retired | 56 |
| whose rows are they? | **all 30 carry `harness: heat14-operator`, `model: claude-opus-5`** — every standing row in the county is this rider's own |
| `e5-regatta` | rank 1 · reel `agent-3137e409-af61f6c2-95cd-4fdc-b022-4dfe45a49b5a` · **w12 / 200 g** · assayed `1789829862878` (2026-09-21) · 1 reel retired |

This is the stake the riders were given, verbatim in the charter: *your own row stands on this map,
and the map has been rebuilt underneath it*.

---

## 3. What changed on this map since the rider last rode it

Four era-6 pins, quoted to the riders verbatim from `assets/engine-era.json`:

- **#17 `e5-regatta-boat-01`** — the Claim-Boat becomes a steerable body on both engines; embark and
  disembark by position; two status-channel refusals; its physics in the E5 contract.
- **#18 `e5-regatta-boat-02`** — the race counts the boat as its only racer while a body is aboard;
  deserters forfeit; the beacon radius **3 → 6** by measurement.
- **#21 `e5-regatta-boat-03`** — the view publishes `now.regatta` on both engines (**view schema
  2 → 3**); `NOT_ABOARD` and `UNREACHABLE_WATER` join the published refusals.
- **#29 `f-rb2-2-gangway-reach`** (owner 2026-09-22, "F-RB2-2: gangway-reach only") — disembark only
  onto standable ground within one plank of the gangway; `CLAIM_BOAT_GANGWAY_REACH` = deck
  half-width 4.4 m + one plank 2 m = **6.4 m**, equal in every direction, measured from the deck
  anchor. A bow-ward intent lands inside her own 8.8 × 28.5 m deck and steps nobody.

No new verb came with any of it: the helm is `MOVE_HERO` while aboard.

---

## 4. The three rides

One board, three rides, identical seed (`e5-regatta-01`, bench), identical stake (`map-rebuilt`),
identical wall (2100 s). **Ridden 3 · secured 3 · not secured 0 · never ridden 0.** No wall was hit,
no rider crashed, and the arena's tracked tree was clean after every ride (`finish-ride`'s firewall
check returned `[]` three times).

| ride | gen | outcome | waves | gold | timeAlive | wall | first output | turns / tools | order calls | eventLogHash | the door |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 `r1` | 134 | **SECURED** | 12 | 0 | 272.000 s | 1114 s | 600 s | 99 / 46 | 4 | `fnv1a32:d7eb1903` | POST `{"ok":true,"stored":true,"rank":null}` → **verified**, `assayHash fnv1a32:f3a9c00c`, `ranked: true` |
| 2 `r2` | 135 | **SECURED** | 12 | 200 | 272.000 s | 685 s | 135 s | 64 / 23 | 24 | `fnv1a32:136a45a0` | POST `{"ok":true,"stored":true,"rank":null}` → **verified**, `assayHash fnv1a32:b92da1bf`, `ranked: true` |
| 3 `r3` | 136 | **SECURED** | 12 | 200 | 272.000 s | 1125 s | 405 s | 65 / 35 | 20 | `fnv1a32:86d55c20` | **REFUSED** HTTP 400 `reel_not_current` — "This reel's engine pin is not recorded in era 6". Re-POSTed once (F-HEAT14-6 protocol), byte-identical, same refusal. See F-HEAT15-1. |

### The race, as it happened — all three rides

**Every ride boarded the boat and finished the course.** This is the first Regatta receipt in county
history earned by *sailing*: the secure is gated on `race.finished`
(`src/sim/HeadlessContractSim.ts:1536`), and the swimming-hero path that won every earlier row on
this board was closed by slice 2.

| mark | ride 1 | ride 2 | ride 3 |
|---|---|---|---|
| boarded | 2.73 s | 2.73 s | 2.73 s |
| `start-beacon` | 2.73 s | 2.73 s | 2.73 s |
| `northwest-checkpoint` | 27.77 s | 27.83 s | 28.07 s |
| `midcourse-checkpoint` | 44.70 s | 44.70 s | 44.80 s |
| `northeast-checkpoint` | 64.13 s | 64.13 s | 64.13 s |
| `finish-beacon` | 88.07 s | 87.93 s | 87.67 s |
| the sixth gate (`claim-boat` stake) | **never published** — computed ≈ 257 s | **never published** — computed ≈ 141.8 s | **never published** — computed ≈ 141.5 s |
| terminal `now.regatta.state` | `finished` | `finished` | `finished` |

- **The buoys were sailed IN ORDER, on every ride** — `buoysPassed` recorded the five authored
  beacons in course order and nothing out of sequence.
- **`NOT_ABOARD` was never answered, on any ride.** Gen 136 states the reason and it is structural:
  the refusal needs the hero standing where the hull cannot float, and its deliberate step-ashore was
  itself refused, so the precondition never existed.
- **`UNREACHABLE_WATER` was answered exactly once in the heat**, and only because gen 136 provoked it
  on purpose after the race was over: at **t = 248.07**, hero **(−45.21, 0)**, boat **(−45.21, 0)**,
  point named **(0, 62)** — chosen beyond the hull's ±49.75 clamp and 62 units clear of the 6.4 m
  gangway reach so it could not be mistaken for a step ashore. No generation before this one had ever
  provoked it.
- **No rider disembarked and no race was ever forfeited.** `forfeited: false` at every view of every
  ride. All three placed every racing waypoint inside the clamp on purpose. The tightest margin any
  rider allowed itself was **5.75 units inside the clamp wall** (gen 135's finish aim at (44.0, 0);
  gen 136's last-gate aim at (−44.0, 0)), both explicitly because `regatta_boat`'s own published prose
  warns that a beam intent near the rim can leave her. **The owner's F-RB2-2 rule was read,
  understood and respected from the published words alone, by two riders independently.**
- **Whether a disembark was within one plank of the rail: it could not be tested from inside the
  rule.** Gen 136 aimed a deliberate step ashore at **(−50.41, 0)** — beyond the clamp, off the deck,
  **5.2 m out of the 6.4 m gangway reach**, i.e. squarely inside the owner's ruling — and the door
  refused it `UNREACHABLE_TERRAIN: MOVE_HERO target is outside walkable terrain`. On this all-water
  course, at that hull position, the run-ending forfeit is **structurally unreachable**. See
  F-HEAT15-2.

## 5. The receipts delta — **zero**

| | before (2026-09-22T03:16:04Z) | after (2026-09-22T04:17:20Z) |
|---|---|---|
| board contracts | 38 | 38 |
| verified rows | **30** | **30** |
| reels counted retired | 56 | 56 |
| claimed / unclaimed | 30 / 8 | 30 / 8 |
| rows by harness | `heat14-operator: 30` | `heat14-operator: 30` |
| `e5-regatta` board | 1 row · rank 1 · `heat14-operator` · w12/200g · reel `agent-3137e409-…` · retired 1 | **byte-identical** |

Two reels were **accepted, assayed and VERIFIED** by the county this heat, each holding a slip with
its own `assayHash`, and **the public board did not move by one row**. That is the board's own rule
working, not a fault — and it is also the heat's most owner-facing result. See F-HEAT15-4.

## 6. Winnability — the riders' own lines

> **Gen 134:** "Secured — and the margin was **wide on the hull and self-inflicted on the clock and
> the purse**… the five beacons fell in 88.07 s of a 272 s deadline, and no order was ever refused —
> but the race did not finish until ≈ t 257, because my controller read `now.regatta.race` (a
> sub-object that does not exist in the published view)… **The 0 gold is a margin, not a ceiling**."

> **Gen 135:** "Secured, and the margin was **wide on every axis that can lose the run and exactly at
> the ceiling on every axis that scores**… the race finished at ≈ t 142 against a t = 272 freeze —
> 130 seconds, 1.9× slack — and the purse capped at t = 200.97… five `BUILD stockpile` probes at five
> distinct coordinates… each answered `UNREACHABLE: BUILD target is outside buildable terrain`, so
> the cap cannot be raised on this map and **200 is the most this contract can publish**."

> **Gen 136:** "Secured, and the margin was **wide on every axis that can lose the run and at the
> arithmetic ceiling on every axis that scores**… the hero took no damage at all… the race finished
> at ≈ t 141.5 against a t = 272 freeze (1.9× slack)… **the only thing genuinely thin was my own
> controller**, which cost one run to a single wrong field name."

**The county's answer, in one line:** `e5-regatta` is winnable through the door on the rebuilt
mechanic, with ~1.9× slack on the clock and the hero untouched; three of three honest attempts
secured it at the contract's published ceiling (`w12 / 200 g / 272.000 s`), and **no rider named the
map as the thing that stopped it** — gen 134 named its own field name, gen 135 and gen 136 named
nothing at all.

---

## 7. Findings

### F-HEAT15-1 — **A DETACHED ARENA AT THE DEPLOYED COMMIT IS NOT FROZEN** (ops / factory, P0 for any future heat)

A concurrent factory task moved the heat's engine identity out from under it, with git reporting a
perfectly clean tree, and the county refused the resulting reel.

- `assets/pilots` in this repo is a **SYMLINK**: `assets/pilots -> ../../GoldRush-assets/pilots`, the
  shared art store. Git does not track its contents at all (`git ls-files --error-unmatch
  assets/pilots/map-rebuild-spike/river-terrain.glb` → *"did not match any file(s) known to git"*).
- `assets/pilots/map-rebuild-spike` **is in `ENGINE_SOURCE_INPUTS`** (`scripts/assay-replay-agent.mjs:36–44`),
  and `computeEngineHash` walks directories with `readdir`, so it **follows the symlink and hashes
  every file behind it**.
- The Codex lane task running beside this heat was `f-corr4-18-river-pack`. It wrote **21 files** into
  `assets/pilots/map-rebuild-spike/` (the River pack: terrain, panorama, atlases, landmark GLBs,
  contracts, the source ledger) — every one of them stamped **10:54:49 local**.
- Ride 2 ended at ~10:54 and stamped `engineHash 52a84bc2…`. Ride 3 launched at **10:55:46**, 57
  seconds after those files landed, and stamped **`53f680fe…`**.
- Measured at the end of the heat: `computeEngineHash()` on the arena returns `53f680fe…` while the
  arena's own `assets/engine-era.json` still declares `52a84bc2…`, and `git status --porcelain
  --untracked-files=all --ignored` over the whole corpus returns **nothing**.
- Ride 3 secured (`w12 / 200 g / 272.000 s`) and the door refused its reel **HTTP 400
  `reel_not_current` — "This reel's engine pin is not recorded in era 6 'the Re-surveyed Claims'."**
  Re-POSTed once, byte-identical: identical refusal. The tape was NOT edited; its papers are what the
  arena stamped.

**Why it matters beyond this heat:** every claim of the form "the arena is frozen at the deployed
build" is false while any `ENGINE_SOURCE_INPUTS` path resolves outside the worktree's own git. The
same mechanism can silently change a *drain's* measured engine hash, an assay, or a null-floor run.

**Cures, for the owner / a fire (recommendation: (a) now, (b) next):**
(a) the heat rig records `computeEngineHash()` at pre-flight and the lander **re-checks it before
every POST**, failing the ride loudly with the two hashes rather than at the door 20 minutes later
(one line; it would have caught this at 10:55:46);
(b) the arena resolves `assets/pilots` to a **store worktree pinned at the deployed store commit**
instead of the live shared checkout;
(c) the board does not schedule store-writing lane work while a heat is open — weakest, because it
depends on a human remembering.

### F-HEAT15-2 — `walkable` is half the forfeit rule and is published to nobody (county, P1, parity — ADR-005 / spec law 5)

`stepAshore`'s last clause is `walkable(point)`, and **nothing in `now` or `stablePrefix` says which
ground is walkable.** Measured by gen 136 on purpose: from a hull at **(−45.21, 0)**, the point
**(−50.41, 0)** — beyond the ±49.75 clamp, off the deck, **5.2 m out of the 6.4 m gangway reach**, so
squarely inside the owner's F-RB2-2 ruling — was refused **`UNREACHABLE_TERRAIN: MOVE_HERO target is
outside walkable terrain`**. So on this all-water course, at that hull position, the run-ending
forfeit is **structurally unreachable**: the rim `public/skill.md` calls "that shore" did not accept a
body. Gen 134 had guessed the opposite in writing ("a point at (−55, 0) *would* have been a legal step
ashore at 6.0 of the 6.4 gangway reach"); gen 136 measured it and corrected its predecessor.
**A rider cannot derive that boundary in either direction from the published view — and it is the
boundary that ends runs.** Two candidate cures: publish the walkable/standable test as a rule on
`regatta_boat` (the county already publishes bounds of exactly this shape for another map — see
`glow_mesa` routes/shelves, `MechanicsManifest.ts:1073–1074`), or publish a `canStepAshore` boolean
on `now.regatta` beside `aboard`.

### F-HEAT15-3 — the decisive gate is the one the view will not time (county, P2, view)

`RegattaRaceSystem` stores `finishedAt` and `forfeitedAt` (`:139`, `:141`) and `readRegatta`
(`src/agent/View.ts:783`) **drops both**, handing the rider `state` instead. Separately,
`RegattaRaceSystem.advance` (`:110–114`) pushes a gate into `passed` only while
`nextGateIndex < gates.length`, so **the finish gate never enters `buoysPassed`**. The effect is that
the five intermediate marks each carry an exact `atSeconds` and **the gate that decides the run
carries none**. All three riders reported this independently and identically; each had to bracket the
finish across a 24-second view gap and compute it from the published position and speed
(≈ 257 / ≈ 141.8 / ≈ 141.5 s). **A rider cannot report when it won.** Gen 136: "it is the one field
whose absence I would most like closed." Cheapest cure: publish `finishedAt` / `forfeitedAt` as
`atSeconds` on `now.regatta`, or append the finish gate to `buoysPassed` as the other five are.
*(Note: the human's `canvas.dataset.regattaBuoys` does not carry the finish second either, so this is
an internal inconsistency in the rider's own view rather than a parity breach — but the human at
least watches it happen.)*

### F-HEAT15-4 — two reels verified, the board unmoved (county, P2, board/design; narrows F-HEAT12-4)

The receipts delta is **exactly zero**: 30 → 30 verified rows, 56 → 56 retired, and `e5-regatta`'s
board is byte-identical (1 row, rank 1, `heat14-operator`, w12/200g). Both accepted reels were
**assayed and VERIFIED** with their own slips (`fnv1a32:f3a9c00c`, `fnv1a32:b92da1bf`) and
`ranked: true` — and neither appears on the board. Ride 1 lost on gold (0 vs 200); rides 2 and 3
**tied the standing row on all three scored axes** (w12 / 200 g / 272.000 s), so `compareScores`
(`functions/api/standings.ts:1391–1394`) fell through waves, gold and time to `submittedAt` ascending
and the older row kept the crown. **A tie cannot take a board.**

This narrows F-HEAT12-4, which predicted a superseded row is "stored, never assayed": both were
assayed and verified. They are **assayed and not promoted**.

**The owner-facing consequence:** the Regatta was re-won this heat by *actually sailing the boat* —
the entire point of A14 — three times, and the county board still shows only the row won by walking
the hero through the water, on a path slice 2 has since closed. The public record of the county does
not contain the fact this heat established. If that is not the intent, the lever is a ruling: let a
reel that beats the *mechanic* (a finished race) supersede one that did not, or publish a second row
per rider, or retire rows whose engine pin predates the slice that rebuilt their map.

### F-HEAT15-5 — the map is not a coin flip, and the three rides are not independent samples (measurement)

Same seed, same charter, same wall: **3/3 secured**, every one at exactly `w12 / 272.000 s`; gold
0 / 200 / 200; and the five beacons fell within **0.40 s of each other across all three rides**
(`start` 2.73 / 2.73 / 2.73 · `nw` 27.77 / 27.83 / 28.07 · `mid` 44.70 / 44.70 / 44.80 · `ne` 64.13 /
64.13 / 64.13 · `finish` 88.07 / 87.93 / 87.67). Nothing in the map's own behaviour varied.

**But the variance measured is the rig-with-its-memory, not the rig.** The self-memory law appends
each landed ride to the notebook the next charter carries, and it dominates: first output fell
**600 s → 135 s → 405 s**, and ride 1's entire gold axis was lost to one wrong field name that gen
134's own lesson then fixed for both successors. A heat that wants independent variance must re-cut
the notebook per ride (and should say which it is measuring).

### F-HEAT15-6 — the county's own type names are the trap that cost ride 1 its gold (rig / door document)

`AgentRegattaSource` (the diagnostics shape, everything nested under `race`) and `AgentRegattaView`
(the published shape, flattened) are declared adjacently in `src/agent/View.ts`. Ride 1 read
`now.regatta.race.buoysPassed`, got `undefined` at every view, concluded no buoy had ever fallen, and
**sailed the whole course a second lap** — finishing at ≈ t 257 instead of ≈ t 142 and losing the
120 s of panning time that is the entire gold axis. The rider was reading the source lawfully
(`worldModel: sim-import`) and met the wrong one first.

### F-HEAT15-7 — the skew probe only proves the ERA half of the door's gate (rig, and it is why F-HEAT15-1 was invisible)

The door's `eraRefusal` checks two things: `meta.era === engineEra.era`, **and**
`engineEraIncludes(engineEra, meta.engineHash)`. Heat 14's refusal proof exercises only the first:
its stale reel is era **5**. Heat 14's *engine hash* `540b49af…` is still a recorded pin of era 6
(verified: 1 of the 30 pins), so **a reel from the previous heat's build would be accepted today** —
the probe as written cannot detect a build-skewed-but-same-era arena. Ride 3 was bitten by the same
blind spot from the other side: a hash *newer* than any pin. **One line would have closed it:**
compare `computeEngineHash()` against the arena's own `assets/engine-era.json` `engineHash` at
pre-flight and before each POST. They agreed at 03:16Z and disagreed from 10:54:49 local onward
(`53f680fe` vs `52a84bc2`), and the arena's own file was the ground truth the door agreed with.

### F-HEAT15-8 — E5's signature mechanic never reaches the racing body (design, owner's eye)

The Regatta's era mechanic is "storms schedule the waves", and on the rebuilt map the storm is a
**clock, not an adversary**: `twist.weather.stormMovementMultiplier` is `0.72` and is published, but
`ClaimBoat.steer(intent, dt, fastWater)` (`src/entities/ClaimBoat.ts:259`) takes **no weather term**,
and its only call site (`src/world/DeepwaterClaimTile.ts:201`) passes only the fast-water boolean —
so a storm cannot slow the boat. Gen 134 measured the other current too: `fastWaterMultiplier` 1.5
over `z ∈ [34, 54]` was worth **~7.5 of the 233 units travelled**, because the two northern gates sit
at `z = 38`, on the band's southern *edge*, so cutting their corners southward keeps the hull out of
the current entirely. As authored, neither weather nor the fast-water zone is a choice the racer has
to make. If the Regatta is meant to be E5's showcase, that is a design lever going unused.

### F-HEAT15-9 — the lander reports a door refusal the way it reports a crash (rig, minor)

`publish-submission.mjs` retries transport failures but treats any HTTP answer as terminal, so
`land-ride.mjs` exits `rc=1` on a lawful door refusal and never writes a verdict slip. Nothing was
lost this heat (the notebook and matrix steps live in `ride-one.mjs`, outside the lander, and both
ran for ride 3), but a refused ride and a crashed one are indistinguishable from the exit code. The
door's own refusals deserve a `refusal-slip.json` and a distinct rc. *(The transport half worked as
designed: one `EHOSTUNREACH` mid-poll on ride 1 was recovered by the poll-only shim without a
re-POST, exactly as the heat-13 cure intends.)*

---

## 8. Housekeeping

- **Opus headroom (F-HEAT13-1):** four one-turn probes, before ride 1 and between every pair of
  rides. All `rc=0`, `result: "OK"`, `is_error: false`, `api_error_status: null`. **The weekly limit
  never fired**; the heat ended because it had ridden its three rides, not because it ran out.
- **The 30-per-hour cap (F-HEAT14-7):** four rider-identity POSTs in the heat (3 rides + 1 re-POST)
  against a cap of 30, plus one probe POST on a separate `anonId`. Never approached.
- **The 1 MB body limit (F-HEAT14-4):** the three submissions measured 3,181 / 28,441 / 17,470 B
  — the largest (r2) is 2.7 % of the 1,048,576 B nginx ceiling. No reel was refused
  for size.
- **Charter transport:** the charter opened at **1,108,314 B** — already past this host's 1,048,576 B
  `ARG_MAX`. Heat 14's stdin cure (F-HEAT14-2) is no longer an optimisation; it is the only lawful
  transport, and a future heat cannot revert it.
- **The arena's tracked tree was clean after all three rides.** No rider touched `src/`, the
  contracts, the door or `assets/engine-era.json`. No tape was edited. Nothing but the riders' own
  submissions was POSTed. No county row was deleted.
