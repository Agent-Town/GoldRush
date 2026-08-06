# THE STEAMWORKS REHEARSAL (ER-02) — standing-orders agents ride E2, and the door they ride through is not the door E1 rode
Commission: `TASK.md` 2026-08-06 (final-milk fleet), branch `milk/steamworks-rehearsal`, solo writer. Third in the line begun by `reviews/standing-orders-rehearsal.md` (round 1) and `reviews/standing-orders-rehearsal-r2.md` (round 2), and the first to play an **epoch-2** card. Spec: `specs/e2-readiness/README.md` ER-02, ratified by directive 2026-08-05 (owner: *"Maybe agents playing the contracts could surface issues already?"* → *"ok, lets go"*).

**VERDICT IN ONE LINE: the two AGENT-READY-rated E2 contracts were played through the shipped headless pipeline at both commissioned tiers on both pinned bench seeds — and neither is winnable by any standing-orders plan, because in that door the hero cannot move and is parked 12 wu from the rail its boss rides against a 10 wu weapon, the works it can buy last four tenths of a second, the protocol has no way to say "carry on", and a single order aimed at a dark seam turns the rider's own economy metric into a livelock that burned 1,200 forced submissions without leaving wave 1.**

---

## 0. RESULT — the card

Eight metered runs: two contracts × **trail** and **vein-hunter** × both pinned bench seeds from `assets/contracts/bench-seeds.json`. `rider calls` = command-clock invocations (the doctrine's budget). `subs` = `submit_orders` calls the protocol *forced*, which is what GR-SIM reports as `outcome.calls` and what AP-07 exports to Prime Intellect as `num_turns`. The gap between those two columns is finding F-ER02-2.

| contract | tier | seed | outcome | waves | rider calls | subs | VIEW bytes | est. marginal tokens | works built / standing at end | eventLogHash |
|---|---|---|---|---|---|---|---|---|---|---|
| **e2-trestle** | Trail | `e2-trestle-01` | ❌ no terminal outcome (ceiling) | 14 | **20** | 34 | 136,511 | ~34,100 | 5 / **0** | — (aborted) |
| **e2-trestle** | Trail | `e2-trestle-02` | ❌ no terminal outcome (ceiling) | 14 | **20** | 35 | 142,712 | ~35,700 | 5 / **0** | — (aborted) |
| **e2-trestle** | Vein Hunter | `e2-trestle-01` | ❌ no terminal outcome (ceiling) | 15 | **20** | 35 | 140,553 | ~35,100 | 5 / **0** | — (aborted) |
| **e2-trestle** | Vein Hunter | `e2-trestle-02` | ❌ no terminal outcome (ceiling) | 15 | **20** | 38 | 156,924 | ~39,200 | 5 / **0** | — (aborted) |
| **e2-incline** | Trail | `e2-incline-01` | ❌ **rider down at wave 2/12** | 2 | 4 | 31 | 118,883 | ~29,700 | 1 / **0** | `fnv1a32:9cc451af` |
| **e2-incline** | Trail | `e2-incline-02` | ❌ **rider down at wave 2/12** | 2 | 3 | 11 | 41,424 | ~10,400 | 1 / **0** | `fnv1a32:c80f182d` |
| **e2-incline** | Vein Hunter | `e2-incline-01` | ❌ **rider down at wave 2/12** | 2 | 4 | 31 | 118,883 | ~29,700 | 1 / **0** | `fnv1a32:f766c986` |
| **e2-incline** | Vein Hunter | `e2-incline-02` | ❌ **rider down at wave 2/12** | 2 | 3 | 11 | 41,420 | ~10,400 | 1 / **0** | `fnv1a32:f074cc3c` |

**Nothing was secured. Both seeds of a contract agree on every column**, which is the determinism claim of the census holding under load. Supporting runs — controls, isolations and the two runaways — are in §14; the whole set is `logs/session-scratch/er02/card-table.json`, mirrored to `reviews/e2-rehearsal/card-table.json`.

Round 1 answered *play is proven*. Round 2 answered *the product's own hands are proven*. **Round 3 answers: the hands are attached to a body that cannot walk, in a room the owner's own maps were drawn for someone who can.**

---

## 1. WHICH PIPELINE — and why this rehearsal was authorable at all

`TASK.md` reads *"shipped pipeline ONLY (own transport forbidden)"*, and READ-FIRST names *"the shipped orders pipeline **+ gr-sim**"*. There are two shipped doors onto the same orders surface, and this round deliberately took the one E1 never used:

- **the browser door** — `Game.ts`'s adapter, reached in rounds 1/2 through a `WeakMap` capture hook because the surface still has no window handle (F-SO-2 / F-R2-2, both still open);
- **the headless door** — `scripts/gr-sim.mjs`, a tracked CLI speaking line-delimited JSON, wrapping `src/sim/HeadlessContractSim.ts`, which installs the very same `ToolSurface` over its own adapter (`HeadlessContractSim.ts:302-314`) at `permissionLevel: 3`.

**This matters far beyond transport, because it dissolves the two questions that have held ER-02 on the owner's desk since s1462.** That row (open 🟡 in `tasks/BACKLOG.md`) says ER-02 "cannot state a runnable scope" and needs two owner rulings: **(1) board access** — the E2 board is a serial unlock chain, so the two AGENT-READY contracts are the two deepest cards in it, and the harness hard-fails on a locked card; **(2) who the rider is** — the harness blocks up to seven minutes per call waiting for a model in another process, so a lane task cannot be the rider.

Both premises are TRUE, and both are **facts about the browser harness only**. ✓ VERIFIED, each independently:

- The unlock chain is real: `e2-trestle` unlocks on `secured:e2-hill-mine`, `e2-pressure-garden` on `secured:e2-trestle`, `e2-incline` on `secured:e2-pressure-garden` (read from `assets/contracts/epoch-2-steamworks/contracts.json`). The hard fail is real: `rehearsal/r2-loop.mjs:223` throws *"is LOCKED on the board — earn its unlock first"*.
- **`HeadlessContractSim` contains no unlock, board or lock reference of any kind** (grep returns nothing across the file, and reading the constructor confirms it: `loadContract(id)` then a `SUPPORTED_CONTRACTS` membership test at `:184`). This rehearsal booted `e2-trestle` and `e2-incline` — the two deepest cards in the chain — **more than forty times, directly, with no unlock, no `?debug` era-seeding, and no honesty violation.** ✓ VERIFIED BY EXECUTION, which is the only way to verify an absence.
- The seven-minute blocking wait is `rehearsal/r2-loop.mjs`'s, not the protocol's. GR-SIM's NDJSON door answers at disk speed; the whole eight-run card ran unattended in **under three minutes of wall clock**, and a single 14-wave run costs **1.4 s**.

**F-ER02-19 (P1).** The recommendation is therefore not "rule on (1) and (2)" but "**the ruling is only needed if ER-02 must ride the browser**". Playing the card headless answered both questions by making them not arise. What the headless door costs instead is everything in §3–§9 — and those costs are the real ER-02 finding.

### 1.1 What was built
Nothing in `src/`, `scripts/` or `e2e/` was touched — the shift's firewall is `reviews/**` + tapes + the BACKLOG leaf, and it held. The rider lives entirely in untracked session scratch: `logs/session-scratch/er02/play.mjs` (the command clock's inbox and the two transports), `mkplan.py` (the plan generator), `plans/*.json` (every plan verbatim), `runs/*` (every view, every submission, every receipt). **It implements no game verb.** Every `BUILD` went through the shipped `ToolSurface.place_building` into `BuildSystem.confirmPlacement`; every `HARVEST` through `pan_at`; every position verb through `StandingOrdersExecutor`. Round 1's sin — building a second surface — is not repeated, and unlike round 2 no capture hook was needed: the headless door hands the surface to its own owner.

---

## 2. THE HONEST-PLAY ATTESTATION — and the one declared liberty

| gate | evidence |
|---|---|
| **No debug assists** | no `grantGold`, no `teleport`, no `setWave`. The only gold in every run came from the Prospector's own pan ticks: `score.goldPanned: 270` against `goldStolen: 0`, `goldReclaimed: 0` on the trestle card run. |
| **No board bypass** | not applicable and not used — the headless door has no board (§1). No `DebugEraSeed`, no `?contract=` launch, no unlock grant. |
| **Difficulty proved, not assumed** | every vein-hunter run records `presetProof` read back from `Balance` after the game's own apply: `{applied:"vein-hunter", enemyHp:28, xpPerKill:3, investBonus:0}`; every trail run records `{applied:"trail", enemyHp:25.2, xpPerKill:4, investBonus:0.35}`. |
| **Rung** | `permissionLevel: 3`, granted by `HeadlessContractSim.ts:314` — the sim's own construction, not a harness grant. Unlike the browser it is **not earned by secured runs**; that is the shipped headless behaviour and is declared here rather than worked around. |
| **Determinism** | both bench seeds of each contract were run at both tiers; the four terminating runs carry event-log hashes, and the CLI/in-process control pair reproduced two of them **byte-for-byte** (§2.1). |
| **Console** | GR-SIM silences `log/info/debug` by construction (`gr-sim.mjs:23`) and restores them; no `console.error`/`warn` was emitted by any run other than the deliberate wave-ceiling throw. |

**THE ONE LIBERTY, DECLARED.** The vein-hunter arm could not be run through the shipped CLI, because the CLI cannot express a difficulty (F-ER02-3). Those four runs therefore drive `HeadlessContractSim` in-process, replicating `gr-sim.mjs`'s own loop line for line, and set the preset through **the game's own read-and-apply path** — `applyStoredDifficultyPreset()`, byte-for-byte what `src/main.ts:130` does at boot, with the preset in `location.search` exactly as `readDifficultyPreset` expects. The precedent is shipped: `e2e/mp-balance-harness.spec.ts:41-49` sets both presets by calling the same function. No balance value was written by hand.

### 2.1 The control that licenses the vein-hunter numbers
A liberty is worth nothing unless the instrument is proved first. The **same plan, same seeds, at trail** was run through both transports and compared:

| | shipped CLI | in-process | identical? |
|---|---|---|---|
| `e2-incline-01` | `fnv1a32:9cc451af`, 31 turns, 4 rider calls, 118,883 bytes | `fnv1a32:9cc451af`, 31 turns, 4 rider calls, 118,883 bytes | **YES — hash included** |
| `e2-incline-02` | `fnv1a32:c80f182d`, 11 turns, 3 rider calls, 41,424 bytes | `fnv1a32:c80f182d`, 11 turns, 3 rider calls, 41,424 bytes | **YES — hash included** |
| `e2-trestle-01` | 34 turns, 20 rider calls, 136,511 bytes | 34 turns, 20 rider calls, 136,511 bytes | YES on every column |
| `e2-trestle-02` | 35 turns, 20 rider calls, 142,712 bytes | 35 turns, 20 rider calls, 142,712 bytes | YES on every column |

**One honest difference, stated rather than smoothed:** the trestle rows report `waves 14` through the CLI and `waves 15` in-process. That is not a divergent run — it is divergent *bookkeeping of the same abort*. `gr-sim.mjs:47` throws **before** printing the offending view, so the harness's crash path records the last view it actually received (wave 14); the in-process loop sees wave 15 and breaks. Trestle produces no hash in either transport for the same reason: the ceiling abort means `sim.outcome()` is never reached (F-ER01-2, reproduced — §3.4).

---

## 3. THE HEADLINE — the protocol has no brake, and one bad order is a livelock

### 3.1 F-ER02-1 (P0). A failing order raises a surprise; a surprise mints a turn; a turn demands a submission; the submission re-arms the failing order.

`StandingOrdersExecutor.fail` calls `surprise('order_failure', …)` (`StandingOrders.ts:256-259`). `HeadlessContractSim.advanceToTurn` returns a turn whenever the surprise sequence advances (`:365`). `gr-sim.mjs:51` then **blocks until orders are submitted** — `readOrders` loops until a receipt is `ok`, and there is no way to decline. So a permanently-unsatisfiable order closes a loop that runs at tick rate.

Measured, one variable at a time, on `e2-trestle` seed 01 at trail:

| plan | forced submissions | sim reached | est. marginal tokens | vs the doctrine's 100k budget |
|---|---|---|---|---|
| no orders at all | **15** | wave 14 | ~13,300 | 13 % |
| `[HARVEST gold-seam-2, HOLD (24,-20)]` | **71** | wave 14 | ~64,000 | 64 % |
| the metered card (5 works) | **34** | wave 14 | ~34,100 | 34 % |
| 3 palisade decoys, 3 rider calls | **341** | wave 14 | **~373,700** | **374 %** |
| `[HARVEST gold-seam-4, HOLD (24,20)]` — one dark seam | **1,200 (capped)** | **still wave 1** | **~997,400** | **997 %** |

The last row is the finding in one line: **`gold-seam-4` was published `active:false` in the very first VIEW of the run**, and naming it cost a thousand forced rider invocations without advancing a single wave. An earlier form of the same plan, uncapped, wrote **3,074 turns and 76 MB** and had reached wave 3 after six minutes before it was killed.

The storm has a second trigger that needs no rider mistake at all: `claim_damage` fires on every `building_damaged` event (`StandingOrders.ts:271`). **So building anything at all makes the protocol more expensive**, and on these maps the wreckers are numerous:

| | e2-trestle subs | e2-incline subs |
|---|---|---|
| rotation only, no works (control) | 15 | 4 |
| the same plan with works | 34 | **31** |
| waves gained by building | **0** | **0** |

On incline, building multiplied the protocol cost **7.75×** and bought nothing.

The trace, verbatim, from `runs/p1` — 56 consecutive forced submissions inside **1.9 seconds** of simulated time, all identical:

```
 t1  w1 s30.0 gold 30  HARVEST:done  HOLD:active
 t2  w1 s30.0 gold 30  HARVEST:failed(INVALID_TARGET: gold-seam-2 is unavailable.)  HOLD:pending
 t3  w1 s30.1 …        (identical)
 …
 t57 w1 s31.9 …        (identical)
 t58 w2 s60.0 gold 30  HARVEST:done  HOLD:active        <- the seam respawned; the storm ended
```

**Why this is a P0 and not a curiosity:** `outcome.calls` is the ECONOMY AXIS. `specs/agent-play/README.md:67` maps *turn = wave boundary (+ surprises)* and *`num_turns` auto-metric = THE ECONOMY AXIS*, and AP-07 exports exactly this number to Prime Intellect as the cost dimension of the benchmark. **A metric a single mis-aimed order can drive to infinity is not a cost dimension; it is a denial-of-service on the rider's own bill.**

### 3.2 F-ER02-2 (P0). There is no no-op, and every submission destroys the plan.
`gr-sim.mjs`'s loop writes a view, then **waits for orders**, then advances. There is no "carry on" token, and `StandingOrdersExecutor.submit` replaces `this.records` wholesale with fresh `pending` records (`StandingOrders.ts:126-130`). Two consequences the doctrine does not anticipate:

1. **The doctrine's winning shape is unavailable here.** Round 1's central advice — *"issue one complete, wave-clocked plan at the gate, then answer HOLD"* — cannot be followed: there is nothing to answer with. Round 1 and round 2 each had to invent a `hold` verb harness-side; in this door even that is not enough, because the *game* demands a payload every turn.
2. **`calls` measures the protocol, not the rider.** The metered trestle runs cost **20 rider calls and 34-38 submissions**; `bait-v1` cost **3 rider calls and 341 submissions**. Any bench row citing `calls` as the rider's cost is off by up to **113×** in the direction that flatters the noisy plan and punishes the quiet one.
3. **Re-submission silently re-buys.** A `done` BUILD restated in the next submission is a new `pending` record and fires again. Round 2's rule — *"restate only what is undone"* — is not advice here, it is the only safe policy, and the protocol forces the rider to apply it thirty times a contract.

The one accidental mercy: because every submission re-arms, a **failed** BUILD gets another attempt. Round 2's "each order gets exactly one attempt, there is no retry, ever" (F-R2-3 §2) is true per record and **false per run** in this door — the two shipped doors have opposite retry semantics, and `skill.md` cannot state one rule for both.

### 3.3 F-ER02-3 (P0). The commissioned tier pair cannot be played through the shipped CLI at all.
`specs/e2-readiness/README.md:19` ratifies the rehearsal difficulty pair as **trail + vein-hunter**. Measured, by running it:

```
$ node scripts/gr-sim.mjs --contract=e2-trestle --seed=e2-trestle-01 --policy=idle --preset=vein-hunter
Error: Unknown argument: --preset=vein-hunter
$ … --difficulty=vein-hunter
Error: Unknown argument: --difficulty=vein-hunter
```

`gr-sim.mjs:87` admits exactly `contract`, `seed`, `policy`, `mode`. And the deeper cause is not the argument list: **`applyStoredDifficultyPreset()` is called from exactly one place in the repo — `src/main.ts:130`, the browser entry point** (✓ VERIFIED: `grep -rn applyStoredDifficultyPreset src/ scripts/ e2e/` returns that call site, the definition, and nothing else). `HeadlessContractSim` never imports it. So even setting `?preset=` in the location GR-SIM already builds would change nothing — the read exists, the apply is never invoked.

GR-SIM runs at Trail by construction, because `Balance`'s literal defaults *are* the Trail constants (`enemy.hp: 25.2` at `:30`, `xp.perKill: 4` at `:499`, `offers.investBonus: 0.35` at `:904`, against `TRAIL` at `:1024-1032`). **The cure is three lines:** admit `--preset`, put it in `location.searchParams`, call `applyStoredDifficultyPreset()` before constructing the sim. Until then, every difficulty claim about a headless run is an assumption, and the bench's "same contract, harder tier" axis does not exist in the door AP-07 exports.

### 3.4 F-ER01-2 reproduced, exactly
The census's open finding — trestle's naive run has no terminal outcome — was re-derived rather than inherited, first thing:

```
$ node scripts/gr-sim.mjs --contract=e2-incline --seed=e2-incline-01 --policy=idle
{"secured":false,"waves":2,"timeMs":82633,"gold":0,"kills":19,"calls":0,"eventLogHash":"fnv1a32:7e6c3132"}
```
— byte-identical to the census row (`docs/bench/e2-readiness-census.md:20`: *"`01`: **died**, wave 2, 0 calls, `fnv1a32:7e6c3132`"*). And trestle:
```
Error: gr-sim wave ceiling exceeded: contract=e2-trestle … wave=15 ceiling=14
```
**The census is honest and current.** What §5 adds is *why* trestle cannot terminate, which the census left open.

---

## 4. THE ECONOMY — one rider call per thirty gold, and nothing without one

Neither contract's hero can pan: `HeadlessContractSim` starts it on the contract's `heroStart` stake — trestle `(12,-12)`, incline `(-24,-18)` — and **never moves it again** (`IDLE_INTENTS` with a zero move vector, passed to `hero.update` every step at `:425`). The seams sit at `(±24,±20)` and `(±30,±20)…`. So the entire economy is the Prospector, and the entire Prospector is `HARVEST` and the position verbs.

Measured on `e2-trestle-01`, one variable per arm:

| plan | gold curve | rate |
|---|---|---|
| `[HARVEST s2]` re-submitted every turn | 0 5 10 15 … 70 | **+5 / turn** |
| `[HARVEST s2]` submitted every *other* turn | 0 5 5 10 10 15 … | +5 / submission |
| **24 stacked `HARVEST` orders**, all reaching `done` | 0 5 10 15 … 70 | **still +5 / turn** |
| `[HARVEST s2, HOLD (24,-20)]` | 0 **30** 30 30 … | **+30 once, then frozen forever** |
| `[HOLD (24,-20), HARVEST s2]` | 0 0 0 0 … | **0 forever** |
| `[HARVEST s2, MOVE_TO (24,-20)]` | 0 0 0 0 … | **0 forever** |
| **rotate the `HOLD` to a fresh anchor every wave** | 30 30 60 90 120 150 180 **200 200 200** | **+30 / wave, capped at 200** |

Five findings fall out of that table.

**F-ER02-7 (P1). The only sustainable economy costs exactly one rider invocation per 30 gold, because the language cannot express a rotation.** An anchor pays its seam out once per *visit*; standing still earns nothing (rows 4 and the frozen `bait-v1` purse); returning to a fresh anchor pays again. There is no loop, no "next", no "whichever is live" — so the rider must be woken every wave to move its own earner. This is the precise inverse of the doctrine's claim that a plan issued at the gate should let the rider fall silent, and it puts a hard floor of **~1 call/wave** under any E2 run that intends to spend money.

**F-ER02-8 (P1). `HOLD` and `MOVE_TO` at the *same coordinate* have opposite economic consequences, and nothing says so.** `HOLD` returns a movement result every tick (`StandingOrders.ts:217-220`), so the Prospector is pinned and channels; `MOVE_TO` completes inside `arriveRadius` 0.16 and stops issuing, after which `Embodiment.updateSimulation` drifts the Prospector back toward the hero. Same point, same plan shape: **30 gold versus zero.** A rider reading the verb list has no way to know that the verb named for going somewhere is the one that will not keep you there.

**F-ER02-9 (P1). The barrier reproduces (round 2's F-R2-6), on a controlled pair differing only in list order.** `[HARVEST, HOLD]` earns 30; `[HOLD, HARVEST]` earns 0 forever with the `HARVEST` stuck `pending`, because `tick()` returns on the first order that produces a result and `HOLD` produces one every tick (`:140-152`). Round 2 proved this in the browser; it is unchanged and unmarked in the headless door.

**The 200 purse cap is real and is reached at wave 8** on a 12-wave contract — so a rider that banks rather than spends throws away four waves of income. (The `nobuild` control ends holding 200 gold and nothing else.)

**F-ER02-17 (P2). `score.goldPannedByProspector` reads 0 while the Prospector panned 100 % of the economy.** The metered trestle run ends `goldPanned: 270, goldPannedByProspector: 0`. Round 2 filed this as small (F-R2-10, *"the one number that would tell an owner what the agent contributed"*). In this door it is not small: it is the **entire** contribution, and the scoreboard credits none of it.

---

## 5. THE PLACEMENT CONTRACT — fifty gold buys four tenths of a second

### 5.1 F-ER02-6 (P0). The works are consumables, and that is why neither contract can terminate.
From `runs/surv-at-anchor`, a turret bought at wave 3 with 60 gold in hand and the Prospector standing on the cell:

```
t4  w3 s105.7  gold 10  works {hp:30, maxHp:50, standing:1}   BUILD:done
t5  w3 s106.0  gold 10  works {hp:10, maxHp:50, standing:1}
t6  w3 s106.1  gold 10  works {hp:0,  maxHp:50, standing:0, wrecked:1}
```

**Placed at 105.7 s, wrecked at 106.1 s.** It was already at 30/50 the first time it was observed. Three arms — on the hero, at a seam anchor, and in the deep rear — all ended the same way, and **every one of the eight metered runs ended with `standing: 0`**: 5 works built and 5 wrecked on each trestle run, 1 and 1 on each incline run.

The cause is not subtle. `steam_wrecker` carries `buildingDamageScale: 2.5` and `hpScale: 1.65`; the idle baseline shows **35-40 wreckers alive from wave 5 onward** against a turret whose `Balance.wreck.hp.turret` is **50**. Wreckers target the nearest building, so any purchase draws the whole pack. The only unit that reliably kills is the hero, and it cannot move to defend anything.

### 5.2 F-ER02-5 (P0). The declared secure condition is geometrically unreachable.
Both contracts secure only by beating the wave-12 Railcar: `autoSecureWaveForRun` returns `Number.MAX_SAFE_INTEGER` while a baron is declared and unbeaten (`HeadlessContractSim.ts:325-328`), and `bossKillSecuresRun` needs all three components down. The Railcar rides a rail at `railSpeed: 1.9` with `pursuitRange: 0`. Now the numbers, which are the same on both maps and look deliberate:

| | hero start | its contract's railcar rail | distance | hero weapon range |
|---|---|---|---|---|
| `e2-trestle` | `(12,-12)` | steamworks line at **x = 0** | **12.0** | **10** (`Balance.sparkRig.range`, `:267`) |
| `e2-incline` | `(-24,-18)` | lower line at **x = -12** | **12.0** | **10** |

**Both maps park the immobile headless hero exactly two world units outside its own weapon's reach of the boss's track.** Corroborated by play: across every trestle run — armed and unarmed, trail and vein-hunter — the hero finished at **100/100 HP** having never been touched, and the railcar was never engaged. These maps were drawn for a player who walks. The headless rider does not walk, and the standing-orders language contains no verb that commands the hero at all (round 1's F-SO-10, unchanged and now decisive rather than cosmetic).

So the chain is closed: the hero cannot reach the boss · the works can reach it but die in under a second · therefore **no standing-orders plan can secure either contract in this door.** That is not a balance opinion; it is a structural verdict, and it is what `e2-trestle`'s open "NO TERMINAL OUTCOME" census row has been describing without naming.

### 5.3 F-ER02-10 (P1). The browser's placement rule is INVERTED here, and skill.md currently states the wrong one.
`BuildSystem`'s sixth constructor parameter is `heroPosition` (`BuildSystem.ts:456`) and `computeValid` measures `placeRadius` from it (`:1582-1592`). `Game.ts` wires that to the **player's actor**; `HeadlessContractSim.ts:218` wires it to **`this.prospector.position`**. Consequences:

- Round 2's skill.md rule 1 — *"your hero must be within 6 wu of the cell (`placeRadius`, measured from the player's body, not the Prospector's)"* — is **false in the headless door**.
- Round 2's rule 3 — *"NEVER PUT A POSITION VERB BEFORE A BUILD"* — is **exactly backwards here.** The winning idiom found by this rehearsal is `[MOVE_TO cell, BUILD cell, HOLD anchor]`: the barrier starves the BUILD *while the Prospector walks*, releases it on arrival, and the trailing `HOLD` returns the earner to work — one rider call that travels, builds and resumes the economy. Every work this rehearsal placed was placed that way.

### 5.4 F-ER02-4 continued — the six words, again, and now with the gold and the range both eliminated
Round 2's F-R2-3 said every rejection produces the same six words. Reproduced, with a cleaner isolation than round 2 could take: `BUILD turret (12,-12)` failed at wave 3, wave 4 and wave 5 with **90 gold in hand** and the Prospector standing **on the cell** (`MOVE_TO:done` in the same record set):

```
MOVE_TO:done  BUILD:failed(FAILED: BUILD action was rejected.)  HOLD:pending
```

Gold eliminated, range eliminated, and the rider still cannot learn that its chosen cell is the contract's own `south-boiler-site` stake. Across the runs, **one plan lost 12 BUILD attempts to this single unreadable cause.**

### 5.5 F-ER02-13 (P1). The headless door's buildable vocabulary is WIDER than the game's.
`Game.ts:5555` refuses `lantern_post` unless `isNightShiftContract()` (`:5548`) and the next lines refuse `decoy_shed` outside `e3-moth-season`. `HeadlessContractSim.ts:222-224` passes a different predicate that gates only `boiler_house` and `capacitor_bank`. Tested rather than reasoned:

```
BUILD lantern_post @ (22,-18) on e2-trestle  ->  done      works {"lantern_post":1}
```

**An agent trained or benchmarked in this door can learn to build a night-only lantern post on a daytime steamworks map** — a strategy that does not exist in the game a human plays. For AP-07 that is not a cosmetic gap: the environment is not the product, and a rubric scored in it is scoring a different game.

---

## 6. THE VIEW — good bones, and one hole this door makes fatal

**F-ER02-11 (P0). THE VIEW does not publish the Prospector.** `now`'s keys are exactly `wave, timers, gold, hero, works, threats, orders, needsRider, seams, score`. The hero — the one actor the language cannot command — is published with `x`/`z`. The Prospector — which every position verb commands, which earns all the gold, and **from whose position `placeRadius` is measured** — has no entry anywhere in the payload. A rider aiming a BUILD is aiming a six-unit circle around a body it cannot see.

**F-ER02-12 (P1). Seam ids do not denote the published anchors, and here that silently freezes the purse.** Round 1 caught the mapping moving; round 2 measured 332 of 360 samples disagreeing. This round measured the *economic* consequence, in a four-arm sweep where each arm held on the anchor of its own id:

| arm | id's `active` flag at t0 | gold earned |
|---|---|---|
| `gold-seam-1` @ `(-24,-20)` | **true** | **0** |
| `gold-seam-2` @ `(24,-20)` | true | 30 |
| `gold-seam-3` @ `(-24,20)` | true | 30 |
| `gold-seam-4` @ `(24,20)` | false | 0 — and the 1,200-submission livelock of §3.1 |

**The confound was eliminated before the claim was made:** a separate arm sent `MOVE_TO` to each of the four anchors, and **all four reported `done` at turn 1** — so the Prospector physically stands on anchor 1, and the seam the VIEW calls `gold-seam-1` and marks `active: true` pays it nothing. `now.seams` carries no coordinates, so the rider cannot detect this, cannot repair it, and cannot tell it apart from bad luck.

**F-ER02-16 (P1). The mechanics manifest declares no buildable vocabulary and no build-zone extent.** For these two contracts `stablePrefix.mechanics.buildables` is **absent entirely** (it is derived only for `pressureEnabled` contracts), `interactables` is `[]`, and the build-zone rule reads in full: `{"id":"build_zones","source":"tileParams.buildZones","data":{"count":2,"banks":["north","south"]}}` — the *number* of zones and the *names* of their banks, and not one coordinate. So AP-11's manifest tells a rider that build zones exist and refuses to say where, while `tileParams.buildZones` holds the exact rectangles. F-SO-13 (no price list, no caps, no purse ceiling) is **unchanged**, and `placeRadius` is still published nowhere.

**One round-2 finding does NOT reproduce, and it is worth banking.** F-R2-11 said THE VIEW is structurally blind to the rider's own plan. In this door it is not: the headless adapter passes `standingOrders: () => snapshotStandingOrders()` (`HeadlessContractSim.ts:305`), so `now.orders` carries live records with statuses and reasons, and `now.needsRider` tracks the executor. **Every diagnosis in this review was read out of the production VIEW.** The browser adapter is the one that needs the accessor; the fix is already written, one door over.

---

## 7. THE ALMANAC — the projection is silent in exactly the state that needs it

Round 1 measured `expectedLeaks` 0 in 42/42 calls; round 2, 0 in 106/106. **Both were measured with a levelled hero, and this door has none — so the finding does NOT reproduce unchanged, and saying otherwise would be inheriting.** Across 226 projections in the eight metered runs, `expectedLeaks` was **non-zero in 118** (52 %). The leak model does fire here, because a level-1 hero's DPS no longer swamps the wave.

What survives, sharpened: **F-ER02-18 (P1). `expectedWorksDamage` was 0 in 154 of the 200 turns where works actually existed (77 %)** — and the structural reason is that it is a function of `currentWorks`, so it reports zero precisely when the rider has nothing standing, which is precisely the moment it must decide whether to build. Where it did speak it was badly short:

```
w3  works {hp:40, maxHp:60, standing:1}   projection {expectedLeaks:2, expectedWorksDamage:16, currentWorks:1}
w3  works {hp:0,  maxHp:60, wrecked:1}    projection {expectedLeaks:2, expectedWorksDamage:0,  currentWorks:0}
```

A projection of **16** against an actual loss of **60 within the same wave**, and then silence. `nextWave.arrivalInSeconds` and the composition roster were reliable, as in both previous rounds.

---

## 8. THE VEIN-HUNTER VERDICT — the tier is nearly a no-op in this door

The card asked for trail **and** vein-hunter. Having built the door to run it (§2), here is what it bought: **nothing measurable.** Identical works built, identical works wrecked, identical waves reached, identical rider calls, on both seeds. Only the event-log hash moves (`9cc451af` → `f766c986`).

That is not a null result, it is a finding. `applyDifficultyPreset` (`Balance.ts:1065-1087`) resets everything to TRAIL and then, for vein-hunter, changes exactly three values. Two of them cannot bite in this door:

- **`xp.perKill 4 → 3` is inert.** XP is awarded (`CombatSystem.ts:815`) but nothing converts it: `HeadlessContractSim` never calls `hero.applyStats`, runs no `Progression`, and publishes `progression.stats` as an all-ones literal with `maxHpBonus: 0` (`:715-724`). ✓ VERIFIED by reading the whole file — the headless hero cannot level, so a 25 % cut to level-up speed changes nothing.
- **`offers.investBonus 0.35 → 0` is inert.** Its only consumer is `Progression.ts:289-291`, and `HeadlessContractSim` does not import `Progression`. ✓ VERIFIED.
- **`enemy.hp 25.2 → 28` (+11 %) is the entire preset** in the headless door.

**F-ER02-4 (P1). So the bench's difficulty axis is, in the door AP-07 exports, an 11 % enemy-HP knob wearing the name of a three-lever preset.** A benchmark report reading "this model handles Vein Hunter as well as Trail" would be true, and would mean almost nothing. Fixing F-ER02-3 by wiring `--preset` into GR-SIM **without** also giving the headless sim a progression path would ship exactly this illusion, labelled.

---

## 9. THE MODES — a declared objective nobody has played

Both contracts declare an `escort` mode that `gr-sim --mode=escort` accepts (`Trestle Crossing` / `Incline Haul`, *"See 1 ore cart safely across"*, payout 45/50). It was probed because a mode nothing has ever run is exactly where a rehearsal earns its keep:

| run | outcome | note |
|---|---|---|
| `escort` e2-trestle-01 | not secured, ceiling at 14 | **3 of 4 works still STANDING at the end** — the only runs in this rehearsal where anything survived |
| `escort` e2-incline-01 | not secured, **rider down at wave 4** | twice the survival of the default mode (wave 2) |

Two datapoints, one suggestion each, both worth a sweep rather than a conclusion: escort mode appears to **redirect wrecker attention away from the rider's works**, and to **extend survival on incline**. Nothing in the language mentions the cart, and no verb escorts anything, so the objective is currently un-actionable by a rider — but the mode is measurably a *different game*, and the census measured neither contract in it.

---

## 10. TAPES — TAPE-01 cannot see this door

The card says *"tapes kept per TAPE-01"*. **F-ER02-14 (P1). A GR-SIM run records no tape, and cannot.** ✓ VERIFIED: the recorder lives in `src/game/RunTape.ts` and its only production caller is `src/game/Game.ts:6167`, driven by `RunManager`'s `onRunStarted`/`onRunEnded`; persistence is `appendRunTape(localStorage, …)` at `Game.ts:6179`. `HeadlessContractSim` contains no reference to `RunTape` at all, installs a no-op storage stub (`:55`), and never constructs a recorder. `specs/agent-play/README.md:120` already promises the opposite — *"every verifiers rollout EMITS a tape"* — so this is an unbuilt promise, not a surprise.

What was kept instead, per run, is a **tape-shaped record with the unreachable fields explicitly nulled** rather than faked (`runs/*/tape.json`):

| TAPE-01 field | headless door |
|---|---|
| `contract`, `seed`, `difficulty`, `outcome{reason,secured,waves,timeAlive,gold}` | **present** |
| `eventLogHash` | **present** — but a *different payload* from `RunTape`'s: `stableHash({contractId, seed, events, economy, orders, final})` (`HeadlessContractSim.ts:387-406`), not `stableHash(RunTapeEventLog)`. Same function, not interchangeable. |
| `inputLog` (a `PlaybookRecording` + streams) | **null — not recorded.** GR-SIM has no input stream; its equivalent is the ORDER log, which this rehearsal preserved under `orderLog`. |
| `simVersion` | **null — not published** by the headless door, so TAPE-02's version-refusal law has nothing to check against. |
| `createdAt` | **null** — GR-SIM forbids wall-clock by determinism law. |

REPLAY-TRUTH itself survives — the outcome hash is seed-and-order derived and reproduced byte-for-byte across transports (§2.1) — but **the Lantern Show cannot play an agent run, and AP-09's "one tape, every species" is not yet true.**

---

## 11. RIG DEFECTS — mine, found by measurement, named so the next rig does not repeat them

- **R-E2-1 — the answer queue that starved its own builds.** The first plan generator emitted rotation answers before build answers and consumed them in strict list order, so the wave-triggered rotations ate every turn and the affordability-triggered builds never fired: two full runs ended with **zero works and a purse sitting at its 200 cap**, which looks exactly like "the rider chose not to build". Fixed by scanning for the first *unused* answer whose trigger is met. **A plan whose orders can never be reached is indistinguishable, from the outside, from a rider that declined.**
- **R-E2-2 — the price trap, paid twice before it was believed.** Two runs scheduled builds on a *projected* wave and met a purse 30 gold short; both died with the six words. Round 2 filed this as F-R2-4 and I read it before starting anyway. It was only cured by moving the trigger onto **observed gold** — which is round 2's own rule 2, and I had to re-derive it empirically to act on it.
- **R-E2-3 — the 76 MB run.** Writing every view for a livelocked plan produced 3,074 files and 76 MB before it was killed. Fixed by keeping every rider-call view plus a stride, and by a `--maxTurns` cap. **A harness with no brake cannot measure a runaway; it can only survive it.**
- **R-E2-4 — `timeout(1)` does not exist on this machine.** A four-arm sweep silently produced nothing because `timeout` is GNU coreutils and macOS has no such binary; the loop reported "no result" for all four arms and I nearly read that as four failed runs. The cap belongs in the harness, not the shell.
- **R-E2-5 — cwd drift aimed probes at nothing.** `vite.config.ts` resolves its own paths off `process.cwd()`, so the in-process transport threw `ENOENT` on `scripts/asset-diet.mjs` until it `chdir`s to the repo root exactly as `gr-sim.mjs` implicitly does. Two probe batches were lost to shell cwd drift before an absolute-path runner was added.

---

## 12. WHAT MUST CHANGE — ordered by what would have saved this rehearsal the most

1. **Give GR-SIM a way to say nothing.** A `null`/empty sentinel that advances the turn without replacing the record set. Without it the doctrine's central technique is unavailable and the economy metric is uncountable. (F-ER02-2)
2. **Make a failed order stop asking.** Either retire an order after N identical failures, or coalesce `order_failure` surprises, or let `advanceToTurn` rate-limit surprise-minted turns. One dark seam currently costs a thousand rider invocations. (F-ER02-1)
3. **Report rider invocations separately from protocol turns**, and export *that* as the ECONOMY AXIS. `outcome.calls` today measures the harness's chattiness, not the model's. (F-ER02-2)
4. **Wire `--preset` into GR-SIM** — three lines — **and say plainly that two of vein-hunter's three levers are inert until the headless sim grows a progression path.** Shipping the flag without the caveat ships a difficulty axis that is 11 % enemy HP. (F-ER02-3, F-ER02-4)
5. **Publish the Prospector in THE VIEW**, with its position, because it is the actor the language commands and the origin `placeRadius` is measured from. (F-ER02-11)
6. **Propagate the placement failure reason.** `confirmDiagnostics` already computes `invalid_economy`/`invalid_range`/`invalid_placement`/`invalid_overlap`/`invalid_max_count`; the boundary throws it away and hands back six words. Round 2 asked for this; a third rehearsal has now paid for it. (F-ER02-4/§5.4)
7. **Make the headless buildable predicate the game's predicate**, or declare the divergence loudly in the manifest. An environment that permits strategies the product forbids is not the product. (F-ER02-13)
8. **Put the build-zone rectangles and a buildable vocabulary into the mechanics manifest** for non-pressure contracts. It has the data. (F-ER02-16)
9. **Give the language a rotation, or the reflex layer a "keep panning whatever is live".** Today the only sustainable economy is one model call per 30 gold. (F-ER02-7)
10. **Say which verb pins and which verb arrives** — `HOLD` channels, `MOVE_TO` does not, at the same coordinate. And say that in *this* door a position verb belongs **before** a BUILD, the opposite of round 2's rule. (F-ER02-8, F-ER02-10)
11. **Emit a tape from GR-SIM**, or amend `specs/agent-play/README.md:120`, which already promises one. (F-ER02-14)

---

## 13. THE VERDICT

**Did the E2 card survive contact with a standing-orders rider? No — and the way it failed is more useful than a win.**

- **The census is vindicated as far as it looked.** Its hashes reproduced byte-for-byte, its determinism claim held across seeds and transports, and its two open E2 findings are real. What the census could not see is that its own AGENT-READY verdict rests on a **mechanical-completion probe that gives the hero 100,000 HP and a 1,000-damage rig with 300 range** (`e2e/er01-e2-census.spec.ts:92` + `:95-96`) and that its verb check asserts that seven order forms are **accepted** — `expect(probe.submitOrders([order]).outcome.ok).toBe(true)` at `:90` — not that any of them can execute. **F-ER02-15 (P2): "7/7 grammar forms" measures the validator. This rehearsal is the first thing to measure the executor, and the executor's verdict on both contracts is that they cannot be won.**
- **`e2-incline` is rated AGENT-READY and kills the rider at wave 2 of 12**, on both bench seeds, at both tiers, with or without works — before the second turret in any sane build ladder is affordable. Its census row calls the idle loss *"a baseline result, not a boot gap"*. It is a baseline result that no plan improved.
- **`e2-trestle` is rated DATA-GAP for having no terminal outcome. §5.2 names the reason**: nothing that can reach the Railcar survives, and nothing that survives can reach it. The missing outcome is not a horizon problem to be fixed with a wider ceiling; it is the map telling the truth about an actor that cannot walk.
- **STANDING ORDERS (law 1): HELD, thinly.** A declarative plan did travel, build, repair and earn — 20 rider calls placed five works per trestle run through the shipped executor with no transport of my own. The language works. What it cannot express is the contract's actual problem.
- **CACHE SHAPE / the economy (law 3): FAILS IN THIS DOOR, and it is the first time any rehearsal has been able to say so.** Rounds 1 and 2 measured 2-29 % of the 100k budget. Here the honest card runs cost 10-39 %, but a single mis-aimed order cost **997 %** and one three-call plan cost **374 %**, because the rider does not control how often it is billed.
- **TWO CLOCKS: NOT TESTED, because there is no reflex clock.** The headless hero is `IDLE_INTENTS` forever. Everything rounds 1 and 2 credited to the reflex layer holding the line — kiting, level-ups, movement under pressure — simply does not exist here, and the results are what that absence looks like.
- **THE ALMANAC (law 2): PARTIALLY RETIRED, PARTIALLY CONFIRMED.** The leak model fires here (118/226 non-zero) because the hero never levels — so rounds 1 and 2's 42/42 and 106/106 are artefacts of a levelled hero, not a universal defect. `expectedWorksDamage` remains unusable: silent in 77 % of the turns where works existed, and 3.75× short where it spoke.

**Against ER-02's own commission** (*"their play surfaces what censuses cannot"*): the census said 2 of 4 AGENT-READY. Play says **0 of 2 are winnable, and the reason is the same on both**. That is the finding the epoch needed before the owner rode it, and it arrived for the price of eight runs and three minutes of wall clock.

**Recommended order for ER-03**, and the honest shape of it: **(1)** the protocol repairs — no-op, failure back-off, rider-vs-turn accounting (F-ER02-1/2), because until they land no E2 measurement is affordable or comparable; **(2)** the owner/attended fork this rehearsal cannot decide — **does a headless rider get a body?** Either the headless sim grows a movement/progression path (and the maps become playable as drawn), or GR-SIM's contracts are explicitly declared *works-only* puzzles and the E2 maps are balanced for a stationary hero. Everything in §5.2 waits on that one word; **(3)** the VIEW and manifest publications (F-ER02-11/16) and the vocabulary divergence (F-ER02-13), which are cheap and make the next rehearsal's findings sharper; **(4)** re-run the census's completability probe *without* the god-hero rig, so the board's AGENT-READY column means what a reader thinks it means.

---

## 14. EVIDENCE LEDGER

**Committed** (`reviews/e2-rehearsal/`): `card-table.json` — every run in this rehearsal with its outcome, rider calls, submissions, bytes and hash · `plans/` — every plan verbatim, including the three that failed and why · `results/` — the per-turn record for the eight metered runs and the named controls · `tapes/` — the TAPE-01-shaped records of §10 · `harness/` — the rider itself, with a README stating what it does and does not implement.

**Two declared handling notes, so nobody has to guess.** (1) The harness lives under `reviews/` rather than `rehearsal/` because this shift's firewall is `reviews/**` + tapes + the BACKLOG leaf; it is evidence, not product code, and nothing imports it. Reverse it with one word. (2) Six of the tracked `results/*.json` are **compacted**: the storm runs repeat one identical row hundreds or thousands of times, and the tracked copy keeps the first 40 and last 10 turns with an `elided` block naming the count and the on-disk path. The count is the finding; the rows are not. **Nothing was deleted** — the complete records remain at `logs/session-scratch/er02/runs/`, including the two runaways kept whole: `pair4` (1,200 submissions, still wave 1) and `bait-v1` (341 submissions, 1.49 MB).

**The controls and isolations, by name** — the failures are the findings:

| run | what it establishes |
|---|---|
| `probe-trestle-01`, idle re-run | the census's rows reproduce byte-for-byte (§3.4) |
| `probe-h-all` / `probe-h-rem` / `probe-stack` | the economy is +5/HARVEST and stacking 24 of them changes nothing (§4) |
| `p1` / `p2` / `p3` | `[HARVEST,HOLD]` 30 · `[HOLD,HARVEST]` 0 (the barrier) · `[HARVEST,MOVE_TO]` 0 (§4) |
| `pair1`–`pair4` | the id↔anchor drift, and the dark-seam livelock (§6, §3.1) |
| `reach1`–`reach4` | **the confound killer** — all four anchors reachable, `MOVE_TO:done` at turn 1 (§6) |
| `surv-on-hero` / `surv-at-anchor` / `surv-rear` | the 0.4-second turret, and the six words with gold and range both eliminated (§5) |
| `econ-ceiling` | 30 gold/wave by rotation, 200 purse cap (§4) |
| `nobuild-trestle-01` / `nobuild-incline-01` | building buys 0 waves and multiplies protocol cost up to 7.75× (§3.1) |
| `ctl-*-trail` | the in-process transport equals the shipped CLI, hashes included (§2.1) |
| `vocab` | `BUILD lantern_post` succeeds on a daytime steamworks map (§5.5) |
| `escort-*` | the unplayed declared mode (§9) |

**No screenshots.** This door renders nothing; the equivalent evidence is the per-turn record, and it is committed.
