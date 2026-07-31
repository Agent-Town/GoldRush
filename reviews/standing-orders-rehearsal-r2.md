# THE STANDING-ORDERS REHEARSAL, ROUND 2 — the relanded verbs meet real play
Commission: TASK.md 2026-07-31 (untracked, owner-set). Dedicated Opus 5 session, branch `rehearsal/standing-orders`, solo writer, successor to `reviews/standing-orders-rehearsal.md`. Round 1 built its own transport because BUILD and HARVEST died with `NO_SYSTEM_API` on main; ap-06b re-landed the adapter, so this round's law was that **every verb executes through the surface the game installs**, and a failure there is a finding, not a licence to route around.

**VERDICT IN ONE LINE: the relanded verbs hold — 27 buildings, 4 pans and 10 repairs were placed by rider orders in honest play, and three of four commissioned contracts were won including the top preset — but the shipped BUILD is a one-shot, hero-range-gated action whose only failure message is six words, and against the thing that actually kills a run the language still has nothing to say.**

---

## 0. RESULT

| contract | preset | secure wave | outcome | run time | rider calls | calls/wave | VIEW bytes total | est. marginal tokens | orders done / failed |
|---|---|---|---|---|---|---|---|---|---|
| **the-claim** | Trail | 10 | ✅ **SECURED at wave 10** | 300 s | 11 | 1.10 | 26,174 | ~6,500 | 6 / 3 |
| **e1-dry-gulch** | Trail | 20 | ✅ **SECURED at wave 20** | 600 s | 23 | 1.15 | 74,042 | ~18,500 | 13 / 7 |
| **the-claim** | **Vein Hunter** | 10 | ✅ **SECURED at wave 10** | 299 s | 21 | 2.10 | 50,351 | ~12,600 | 4 / 4 |
| e1-night-shift (attempt 1) | Trail | 25 | ❌ rider down at **wave 18/25** | 559 s | 38 | 2.11 | 114,461 | ~28,600 | 10 / 4 |
| e1-night-shift (attempt 2) | Trail | 25 | ❌ rider down at **wave 18/25** | 543 s | 13 | 0.72 | 45,142 | ~11,300 | 8 / 2 |

Three of the four commissioned contracts won. Every run: **zero console errors, zero page errors**, no debug parameters, rung 3 **earned**. Six banking runs (three per ledger) preceded them, every one secured.

Across the five metered runs the shipped executor carried **61 orders to a terminal state: 41 done, 20 failed** — `BUILD` 27/43 (63 %), `HARVEST` 4/8, `REPAIR_UNDER` 10/10.

---

## 1. THE HONEST-PLAY ATTESTATION

Asserted in code and recorded in every `result.json` under `honesty`:

| gate | evidence |
|---|---|
| Fresh ledgers | two brand-new browser profile dirs (`rehearsal-profile-r2a`, `-r2b`), each with a new in-game ledger created through the real form. Opening meta on both: `{territory:0, science:0, hero:0, agent:0}`. |
| **Difficulty through the legal UI** | campaign B's Vein Hunter was set on the real Profiles screen (`profile-difficulty` select), verified by reading the select back and then by `diagnostics.difficultyPreset` at every boot. The harness **throws** on a mismatch — and did, on the first attempt, which is how the route was found (§2). No `?preset`. |
| **No debug** | every contract launched from the **town board**. `searches` recorded per run is exactly `["?contract=<id>"]`. |
| **`window.__GR_TEST__` never existed** | sampled every tick of every run; `grTestSeen: false` in all five. |
| **`window.__GR_AGENT__` never existed** | `grAgentSeen: false` in all five — and this is also the F-SO-2 measurement (§3). |
| **The rung was EARNED twice over** | campaign A: three secured Claims in 299 / 309 / 299 s, `agent` 0→1→2→3. Campaign B: three secured **Vein Hunter** Claims in 299 / 299 / 300 s, same ladder. `bank-summary.json` in each. The surface's own `permissionLevel()` was checked against `diagnostics.agent.stub.permissionLevel` at every boot and had to match or the run aborted. |
| Zero errors | console/page error buckets empty for all five metered runs and both banking campaigns. |

**The rung-0 refusals, verbatim, from a fresh ledger** (`rehearsal/so-runs/r2probe/probe.json`):

```
submit_orders([HOLD …])     -> PERMISSION_DENIED "HOLD requires permission rung 2; current rung is 0."
submit_orders([HARVEST …])  -> PERMISSION_DENIED "HARVEST requires permission rung 2; current rung is 0."
submit_orders([BUILD …])    -> PERMISSION_DENIED "BUILD requires permission rung 3; current rung is 0."
pan_at('gold-seam-1')       -> PERMISSION_DENIED { level: 0, requiredLevel: 2 }
place_building('turret', …) -> PERMISSION_DENIED { level: 0, requiredLevel: 3 }
```

The owner's rung law — harvest 2, build 3 — is enforced on both paths, the order validator and the tool surface, and the two agree. That is the ap-06b consent-ability gate working.

---

## 2. WHAT WAS BUILT, AND THE ONE THING IT DID NOT BUILD

`rehearsal/r2-shipped.mjs` (the handle + the snapshot) · `r2-pilot.mjs` (the reflex clock) · `r2-loop.mjs` (orchestrator, honesty gates, experiments) · `r2-report.mjs` (tables) · `r2-wait-view.mjs` (the command clock's inbox).

**Round 1 implemented game verbs. Round 2 implements none.** There is no adapter and no second `ToolSurface` in this harness. Every `BUILD` went through `Game.ts`'s own `placeBuilding` into `BuildSystem.confirmPlacement`; every `HARVEST` through its own `panAt` into `HarvestSystem`; every `REPAIR_UNDER` through `repairProspectorBuilding`. The reflex clock does exactly two things a player does: hold WASD, and click level-up cards. (The one exception is declared: the **banking** runs, at rung 0 where nothing is submittable, buy turrets with a real calibrated mouse on the real build menu. That is a player with a mouse, and none of it appears in a metered run.)

**The road to the difficulty select, measured rather than assumed.** The first campaign-B attempt set no difficulty at all and the honesty gate caught it mid-run. The reason: a fresh browser profile does **not** boot to the start menu — it boots to the first-ledger create form with the menu inert behind it, and submitting that form drops you **straight into town**. There is no start menu on the way, so the only legal route to the per-profile difficulty select is: name the town, walk back out through `town-exit`, Profile → select → Done, Enter Town. Recorded because it is also why campaign B had to earn its own rung from zero: `META_PROGRESS_KEY` is in `ProfileStorage.PROFILE_DATA_KEYS`, so a second ledger is a second agent track.

---

## 3. THE HEADLINE — the verbs work, and the door still does not exist

**F-R2-1 (P0, and it is round 1's F-SO-1 CLOSED). `BUILD` and `HARVEST` execute.** Twenty-seven buildings and four pans were placed by rider orders through the shipped adapter, in five plain boots, with the game's own `buildingsBuilt` counter agreeing every time. The failure mode round 1 measured — accepted then `NO_SYSTEM_API` on actuation — **did not occur once in 61 terminal orders.** ✓ VERIFIED by execution.

**F-R2-2 (P0, and it is round 1's F-SO-2 UNCHANGED). There is still no window handle on the tool surface in a plain boot.** Measured at every boot (`boot.json` → `surface`):

```
windowAgentStub: false            <- __GR_AGENT__ does not exist without ?debug (AgentStub.ts:54)
windowAgentHasSubmitOrders: false
windowTest: false
```

`ToolSurface.install` stores the surface on the anonymous adapter literal as `game.agentTools`, which nothing outside `Game` can reach, and attaches a `view` getter to `window.__GR_AGENT__` *only if it already exists*. So this round had to obtain a handle the same way **the shipped conformance spec does** (`e2e/ap-standing-orders.spec.ts:88-113`): wrap `WeakMap.prototype.set` in an init script and keep the object `createToolSurface` registers in `standingOrdersBySurface` (`ToolSurface.ts:196`). That is an observation hook — it constructs nothing, grants nothing, changes no game state — and the object it yields is provably the production one:

```
namespace: "et.goldrush"
capabilities: auto_collect(1), auto_repair(1), auto_pan(2), place_building(3)
surfacePermissionLevel: 3  ==  diagnosticsPermissionLevel: 3
```

All four ability groups are advertised, which only the real `Game.ts` adapter implements. **AP-03 Transport A still has no door; it has a keyhole that the project's own test suite reaches through.** Publishing `game.agentTools` on `window` — or the surface itself — is a one-line change and the single highest-value thing left in this thread.

---

## 4. THE PLACEMENT CONTRACT — the new law of this round

Round 1's BUILD never executed, so nobody had met the contract it executes under. Read at source and then proved by sixteen dead orders:

1. **`BuildSystem.computeValid` measures `placeRadius` FROM THE HERO** (`BuildSystem.ts:1479-1487`, `origin = this.heroPosition`, which `Game.ts:1216` wires to `actionActorPosition` — the *player's* actor, not the Prospector). Turret and beacon `placeRadius` are both **6** (`Balance.ts:522/543`).
2. **Each order gets exactly one attempt.** `StandingOrdersExecutor.execute` (`StandingOrders.ts:190-194`): condition met → place → `done` or `failed`. There is no retry, ever.
3. **Every rejection produces the same six words.** `runSideEffect` maps `false` to `{ok:false, reason:'FAILED'}` with no message, and the executor writes `"FAILED: BUILD action was rejected."` for gold, range, terrain, overlap and cap alike.
4. The only surface that *can* say which — `confirmDiagnostics`, with its `invalid_economy` / `invalid_range` / `invalid_placement` / `invalid_overlap` / `invalid_max_count` — is exposed **only through `window.__GR_TEST__`** (`Game.ts:1891`), which the honest-play gate forbids. ✓ VERIFIED: `grep -rn confirmDiagnostics src/` returns two hits, the getter and that one consumer.
5. **`placeRadius` is not published anywhere a rider or its reflex layer can read.** `BuildSystem.diagnostics` carries `mode`, `ghostValid`, `nextCost` and counts, but not `placeRadius` and not `reason` — confirmed empirically: every snapshot in every run recorded `placeRadius: null, reason: null`. This harness hard-codes 6 from source.

**F-R2-3 (P0). The one verb that spends gold is gated on the player's body, gets one attempt, and cannot say why it failed.** So the harness had to reconstruct the cause itself, from the last reflex-rate sample taken while each order was still pending. Across all five runs, the sixteen dead BUILDs decompose as:

| cause, reconstructed | count |
|---|---|
| **too poor** — the trigger cleared but the price did not | 6 |
| **out of range** — hero outside the 6 wu circle when it fired | 5 |
| legal-looking at the last sample — terrain, overlap or cap | 5 |

Three different defects wearing one sentence. A rider that could read `invalid_economy` would raise its threshold; one that could read `invalid_range` would move its cell; one that could read `invalid_overlap` would space it. Today all three read identically, and the rider guesses.

### 4.1 The trap that destroys its own order

**F-R2-4 (P0). A gold trigger below the item's price is an order that kills itself, and the language invites it.** Isolated deliberately (`rehearsal/so-runs/r2a/experiments.json`, phase `price-trap`): two BUILDs differing in one number.

```
BUILD turret (-7,7) when goldGte 30   -> t=13.1s  FAILED   preFire: gold 30, cost 50, heroToCell 1.57, runState playing
BUILD turret (-11,7) when goldGte 50  -> t=23.5s  FAILED   preFire: gold 50, cost 50, heroToCell 16.09
```

The first died with the hero **1.57 wu away** — in range, in a playing run, on legal ground. The only unmet condition was the purse. The second cleared its price exactly and died of range. **One experiment, two causes, one message.** In live play the same trap took the fourth turret on the-claim twice (98 < 125, then 107 < 125) and both remaining turrets on Vein Hunter (42 < 95, 51 < 95): six of sixteen failures.

### 4.2 The unsatisfiable order

**F-R2-5 (P1). A gold-triggered BUILD whose cell has no live seam inside the placement circle cannot be served at all.** The purse only rises while the hero stands on a live seam; standing on dead ground inside the circle freezes the purse, so the trigger it waits for never arrives. This is not a theory: the first pass of this rehearsal's reflex layer committed to a stand point when the gold gap fell under 25, and in experiment E1 it parked the hero for **96 seconds with the purse pegged at 30**, then died at wave 5 (`experiment-e2.json`, outcome `dead`, gold 170 unchanged across two wave rows). The fix is a law, not a tuning value: *take the stand point only when that ground still pays; otherwise keep panning and let the order fire where it will.*

Which is why **every plan in this round used `waveGte`, never `goldGte`**. A wave trigger is a clock the reflex layer can see coming and walk to; a gold trigger is only satisfiable where the hero is already earning. That single substitution is the largest single lever the rehearsal found.

### 4.3 What actually makes a cell land

Stated as the rule the winning runs were written by: **name cells within ~4 wu of an authored seam site, at least 3.0 wu clear of every building you know about, on ground you have already seen something stand on, and trigger them on a wave at least two clear of the last one.** The gulch's fourth turret finally landed at `(-12,7)` — 3.0 wu from a seam site and 4.0 wu clear of a standing turret — after three siblings sited by hope had died.

---

## 5. THE BARRIER — an order that starves everything behind it

**F-R2-6 (P0, new, and invisible to round 1). `StandingOrdersExecutor.tick` returns on the first order that produces a result, and `HOLD` produces one every tick forever. Every order after a `HOLD` in the list is unreachable.** Round 1 put its only `FALLBACK_IF` last, so it never saw this.

Proved by construction: the same two orders, same session, same map, same purse, differing only in list position (`experiments.json`).

| plan | purse | price | hero→cell | result |
|---|---|---|---|---|
| `[BUILD turret (-9,8) goldGte 5, HOLD]` | 115 | 50 | 16.4 wu | BUILD reaches the adapter and **fails** at t=76.2 (range) |
| `[HOLD, BUILD turret (-6,8) goldGte 5]` | 115 | 50 | **3.77 wu** | BUILD **never leaves `pending`** — never even `active` |

In the second arm the purse was 23× the trigger and 2.3× the price, the hero was inside the circle, and the turret count was 0. The harness's own watchdog logged it at t=129.3: *"condition met for >8 s and the order never fired — starved by an earlier order."* `MOVE_TO` (which only completes inside `Balance.agent.arriveRadius` = **0.16 wu**) and `REPAIR_UNDER` while walking have the same shape. **A rider that writes the natural plan — station first, then build — gets a plan in which nothing is ever built.**

---

## 6. THE ECONOMY AXIS — still the doctrine's strongest claim

Doctrine target: **a full contract ≤ ~100k marginal tokens**, at **~1 call/wave + surprises**.

| | the-claim (Trail) | e1-dry-gulch | the-claim (Vein Hunter) | night-shift a1 | night-shift a2 |
|---|---|---|---|---|---|
| waves | 10 | 20 | 10 | 18 (of 25) | 18 (of 25) |
| rider calls | 11 | 23 | 21 | 38 | 13 |
| calls per wave | 1.10 | 1.15 | 2.10 | 2.11 | 0.72 |
| VIEW bytes: mean / max | 2,379 / 2,915 | 3,219 / 4,166 | 2,398 / 2,941 | 3,012 / 4,071 | 3,472 / 4,051 |
| VIEW bytes total | 26,174 | 74,042 | 50,351 | 114,461 | 45,142 |
| **est. marginal tokens (4 chars/token)** | **~6,500** | **~18,500** | **~12,600** | ~28,600 | ~11,300 |
| **vs the ≤100k target** | **6.5 %** | **18.5 %** | **12.6 %** | 28.6 % | 11.3 % |

**HELD again, with the same margin.** The VIEW opens at ~1,950 bytes and grows ~120 bytes/wave; a 20-wave contract's entire state payload is ~18k tokens. The worst run in the round — 38 calls over 18 waves — still came in at 28.6 % of budget.

**Two new economy measurements round 1 could not take.**

- **The VIEW is cheap to build**: 205–411 `et.goldrush.view` calls per run at **0.46–0.50 ms mean, 1.8 ms max**. Polling it at ~0.7 Hz for order status cost nothing measurable. (It is *not* free at reflex rate — `buildView` runs `runStatSimHarness` every call, `View.ts:295` — which is why this harness reads published diagnostics for movement and the surface only for orders.)
- **Call count is set by the rider's own speed, not by the game.** Campaign B answered in 4.0 s mean and was called 21 times in 10 waves; the-claim answered in 28.6 s mean and was called 11 times in the same 10 waves. **A faster rider is a more expensive rider.** The wave-boundary trigger fires whenever the rider is not already thinking, so latency is the throttle. That inverts the usual intuition and belongs in skill.md.

---

## 7. THE LATENCY LAW, RESTATED WITH TEETH

Round 1's finding was that a trigger already true when the plan lands fires immediately and dies unstaged. Round 2's shipped verbs sharpen it into something worse: **the rider's read of its own body is stale by exactly its own answering time, and against a one-shot range-gated verb that is fatal.**

Three receipts, in increasing embarrassment:

- **e1-dry-gulch seq 5→6.** I re-commanded to spend an idling purse and restated the wave-6 turret. The original fired and placed at `(7,7)` during the 42 s I spent composing; my restated duplicate came due the instant it landed and died on range, with the hero already 14 wu away.
- **e1-dry-gulch seq 11→12.** I re-sited a beacon to `(-4,-7)` with 247 gold and a 35 price, and it died at 4.4 wu — *inside* the circle. Cause: a beacon had gone up at `(-5,-7)` during my previous answering window, 1.0 wu from the cell I then named, against a 2.4 wu beacon-on-beacon clearance. **THE VIEW gives `byKind` counts and one aggregate hp bar and never a single building coordinate**, so I could not have avoided it from the payload (F-R2-7, P1).
- **e1-dry-gulch seq 21→22.** I deliberately sited a cell 3.4 wu from where the hero stood *at the moment I was called*, reasoning that an immediate fire was therefore safe. In the 20.5 s it took to answer, the hero walked to 6.6 wu and the order died. **20 seconds is enough to leave the circle.**

**The rule this proves:** a rider may name a cell relative to a *seam site* (fixed, in `stablePrefix`) but never relative to its own hero (moving, and stale on arrival); and it must never restate an order whose trigger can fire inside its own answering time.

**One honest disclosure about the latency table.** Night-shift attempt 2 records a 358.9 s answer at seq 1. That was not thinking: attempt 1's artefacts were still in the run directory and my inbox helper skipped every call until I moved them. It is rig dead time and is excluded from every latency claim above. Twelve waves passed while the rider was silent and the reflex clock kept the claim alive — which is, incidentally, the two-clock argument demonstrated harder than any deliberate test would have.

---

## 8. THE STANDING ORDERS — held, broke, and unchanged

### Held (all confirmed under real execution this round)
- **Validation, rung checks and the consent-ability gate are exact**, on both the order path and the tool path, and they agree (§1).
- **`BUILD … when:{waveGte}` is expressive enough to win.** The gulch was taken by a wave-clocked bench; the-claim twice.
- **The record lifecycle is honest** — `pending → active → done|failed`, every failure reasoned, every failure raising `order_failure`.
- **`REPAIR_UNDER` is the quiet success of the round: 10 for 10.** It needs no rung above 1, it costs nothing, it fires only when something is actually hurt, and on Night Shift a mend is also a relight of a cold lantern. It is the only verb in the language with a perfect record.

### Broke
**F-R2-6** the barrier (§5) · **F-R2-3/4/5** the placement contract (§4) · **F-R2-7** the VIEW cannot see its own works' positions (§7).

**F-R2-8 (P1). A submission replaces the whole record set — and this is survivable, but only because the rider can read `now.works.byKind`.** Round 1 called re-commanding ruinous. Round 2 re-commanded five times and lost nothing to double-buying *except* through latency (§7), because a replace only costs what you **restate**. The rule is precise: *restate nothing that is already built, and nothing whose trigger falls inside your answering time.* An `amend`/`append` verb would remove both hazards; a documented no-op would remove the third (this rehearsal again had to invent `hold` harness-side to answer a surprise without destroying the plan).

**F-R2-9 (P1). `HARVEST` is a one-shot worth five gold, on an identifier that is a nine-second lease.** Measured: `orders-1-7` on the-claim took node `gold-seam-2` from 30 to 25 remaining — one `Balance.goldSeam.tickGold` — and went `done`. It has no positional requirement at all (the adapter runs a synthetic Prospector tick at the node from anywhere), which is the exact mirror of BUILD's hero-range gate. And of eight HARVESTs issued across the round, **four died `INVALID_TARGET` on nodes that were live and full when I named them** — seams hold 30 gold (40 on the gulch), i.e. six to eight 5-gold ticks, ~9–12 s of panning, and then go dark for 20 s. A 54 s answer loses the seam; a 36 s answer keeps it. Both receipts are in the-claim seq 1 and the gulch seq 1 respectively.

**F-R2-10 (P2). `now.score.goldPannedByProspector` stays 0 through successful HARVESTs.** `goldPanned` and `buildingsBuilt` track correctly (§9), so the summariser works — the Prospector's own pans are simply not attributed. Small, but it is the one number that would tell an owner what the agent contributed.

---

## 9. THE VIEW — one round-1 finding retired, two sharpened, one new

**F-SO-14 is RETIRED, with an apology.** Round 1 reported `now.score` as structurally empty for any rider outside the Game object. It is not: the production adapter wires `economyLog: () => this.economy.log`, and this round's score reads `goldPanned: 747, buildingsBuilt: 7` at the end of the gulch. Round 1's score was blank because **round 1's own harness adapter stubbed `economyLog` to `[]`** — the defect was in the transport, not the product. Round 1's evidence contained the correction and was not re-read. ✓ VERIFIED against `rehearsal/so-runs/so-1/e1-dry-gulch/view-05.json` and this round's finals.

**F-SO-12 is CONFIRMED and much worse than measured.** Round 1 caught the seam-id mapping moving twice in one run. Round 2 sampled it every wave: **332 of 360 samples across five runs have the live node at a different place from the `stablePrefix` anchor of the same id, with a maximum drift of 48.96 wu.** The ids in `now.seams` number the live node array; the ids in `stablePrefix.map.seams` number the six authored anchors; from the very first frame of every run they disagree (at t=1.5 s on the-claim, the live `gold-seam-1` stood on anchor #2's coordinates). A `HARVEST` naming an id is aiming at a lease, not a place.

**F-R2-11 (P0, new). In a production boot THE VIEW is structurally blind to the rider's own plan.** `buildView`'s `readOrders`/`readNeedsRider`/`readSurprises` fall back through `standingOrders.orders`, `diagnostics.agent.orders`, `embodiment.orders`, `diagnostics.orders` — and the production adapter passes no `standingOrders` accessor while `diagnostics.agent` publishes only `{stub, embodiment}`, neither of which carries orders. Measured at the end of all five runs:

```
view.now.orders          = []        while the executor held live orders
view.now.needsRider      = false     while the executor's own needsRider = true
view.stablePrefix.orders = []
view.appendLog[].surprises = []      for every wave of every run
```

The plan and the surprise channel are visible only through the *sibling* half of the same receipt (`outcome.result`), which the doctrine does not mention. **A rider that reads THE VIEW as specified cannot see its own standing orders, cannot see that it has been summoned, and sees a wave log with no surprises in it.** Round 1's own committed evidence shows the identical blank (`view-05.json`: `now.orders []`, `needsRider false`, alongside `ordersSnapshot` with 13 orders and `needsRider true`) — it was measured and not reported.

**F-SO-13 is UNCHANGED.** No price list, no caps, no purse ceiling, no buildability map — and now also no building coordinates (F-R2-7) and no `placeRadius` (§4). Every one of those was fed to the command clock out of band by the reflex layer, declared in each `pilotReport`. All of them exist in `Balance`/`buildables`/`BuildSystem` already.

---

## 10. THE ALMANAC — measured again, and it fails the same way, harder

**F-SO-16 CONFIRMED at four times the sample size. Across 106 rider calls in five contracts, `expectedLeaks` was 0 in 106/106 and `expectedWorksDamage` was 0 in 106/106 — while the works actually lost HP in 27 of the observed waves, down to −120 in one.**

| contract | calls | leaks projected 0 | works-damage projected 0 | waves with real works damage | worst actual delta | predicted enemies ÷ actual kills |
|---|---|---|---|---|---|---|
| the-claim (Trail) | 11 | 11/11 | 11/11 | 0 | 0 | 0.54 |
| e1-dry-gulch | 23 | 23/23 | 23/23 | 6 | **−116** | 0.57 |
| the-claim (Vein Hunter) | 21 | 21/21 | 21/21 | 5 | **−120** | 0.55 |
| e1-night-shift a1 | 38 | 38/38 | 38/38 | 15 | **−120** | 0.61 |
| e1-night-shift a2 | 13 | 13/13 | 13/13 | 1 | −99 | — (unobserved waves) |

Both round-1 defects reproduce exactly. The leak model asks the wrong question — `stopped = (heroDps + worksDps) × window ÷ meanEnemyHp` always exceeds the wave for a levelled hero, so leaks are always 0 and `expectedWorksDamage = leaks × contactDamage` is always 0 — while enemies damage the works **on their way in**, no leak required. And the composition undercounts arrivals by ~40 % on four independent runs (0.54–0.61, against round 1's 0.61 — a fifth independent replication of the same constant).

`nextWave.arrivalInSeconds` and the composition *roster* remained reliable. **On this evidence a rider that trusted the Almanac would never build anything.** All three wins came from reading `appendLog` — the game's own record of what actually happened last wave, which is already in the payload and was right every time.

---

## 11. THE VEIN-HUNTER VERDICT — is the top preset beatable by plan-and-reflex?

**Yes, and by a thinner margin than Trail in exactly the way the preset intends.**

`vein-hunter` sets `enemy.hp 25.2 → 28` (+11 %), `xp.perKill 4 → 3` (−25 %) and `offers.investBonus 0.35 → 0` (`Balance.ts:1062`). The hero levels a quarter slower, so the works have to carry more of the run — and the works are exactly what the placement contract makes hardest to buy.

- The **reflex clock alone** — no orders, rung 0, a player with a mouse — secured Vein Hunter Claims **three times out of three**, in 299/299/300 s. The preset is not a wall for a competent hand.
- The **commissioned run** secured at wave 10 in 299 s with **two turrets and one beacon**, against Trail's three-and-one on the same map an hour earlier. Both remaining turret orders died `too poor` (42 < 95, 51 < 95): the compounding effect of −25 % xp is that the hero kites more, pans less, and the purse never reaches the third rung of the ladder.
- The works took **−120 in one wave** and the hero finished at 30/150.

**So: the top preset is beatable by plan-and-reflex, but it beats the *plan* rather than the *reflex*.** Under Vein Hunter the rider's build ladder is the part that breaks, not the hand on the keys — which is the sharpest possible argument for fixing the one-shot placement contract before anyone calls AP-03 done.

---

## 12. THE REVENGE RUN — lost twice, and the loss is the finding

Round 1 died on Night Shift at wave 19 of 25. Round 2 attempted it twice and died at **wave 18 both times**, on a controlled difference:

| | works at death | BUILD orders landed | died at |
|---|---|---|---|
| round 1 | (harness-placed) | 6 of 12 | 19/25 |
| round 2, attempt 1 | 4 turrets, 1 beacon | 7 of 9 | 18/25 |
| round 2, attempt 2 | 3 turrets, **4 beacons** | **7 of 9**, spending interleaved from wave 2 | 18/25 |

Attempt 2 changed the premise the §7.5 way: instead of saving for the turret ladder and leaving the beacon bench to waves 12-20, it alternated turret and beacon from wave 2 so every purchase compounded. It **quadrupled the beacon bench and moved the death wave by −1**.

**F-R2-12 (P1). The works are not the binding constraint on this contract; the hero's own survival is, and the standing-orders language has no verb that touches it.** Both attempts ended the same way: works standing and mended (`REPAIR_UNDER` 10/10 all round), and the hero at 1/175 in the last frame before it fell. Attempt 2 died with 142 gold unspent — a bench it could still afford and no wave left to spend it in; attempt 1 died with 16, having spent everything it had. What decides Night Shift is hero damage-per-second and hero positioning under a dark 30-strong pulse — that is level-up choices (round 1's F-SO-11: 15–28 cards per run chosen by a hard-coded reflex preference list, inexpressible in the DSL) and the fact that `MOVE_TO`/`HOLD`/`FALLBACK_IF` command the **Prospector**, not the rider's own body (F-SO-10). A rider cannot say "buy damage, then plating", and cannot say "stand there" to the actor that is dying. Both round-1 findings are re-confirmed here with a controlled experiment behind them.

---

## 13. TRANSCRIPTS

Every plan and every receipt, verbatim: `rehearsal/so-runs/r2a/<contract>/orders-NN.consumed.json` and `view-NN.json`; `rehearsal/so-runs/r2b/the-claim/` for Vein Hunter; `rehearsal/so-runs/r2a/e1-night-shift-attempt1/` for the first revenge attempt. The gate plan that won the gulch, issued once at t=37 s and never revised in its bench (13 orders, `{ok:true, count:13}`):

```json
[{"verb":"BUILD","what":"turret","where":{"x":-8,"z":7},"when":{"waveGte":2}},
 {"verb":"BUILD","what":"turret","where":{"x":-2,"z":-7},"when":{"waveGte":4}},
 {"verb":"BUILD","what":"turret","where":{"x":7,"z":7},"when":{"waveGte":6}},
 {"verb":"BUILD","what":"turret","where":{"x":2,"z":-7},"when":{"waveGte":9}},
 {"verb":"BUILD","what":"sentry_beacon","where":{"x":-4,"z":8},"when":{"waveGte":11}},
 …six more beacons…,
 {"verb":"HARVEST","seam":"gold-seam-1"},
 {"verb":"HARVEST","seam":"gold-seam-2"},
 {"verb":"REPAIR_UNDER","pct":50}]
```

and the Vein Hunter plan that won the top preset, issued once and held for twenty of twenty-one calls:

```json
[{"verb":"BUILD","what":"turret","where":{"x":-8,"z":7},"when":{"waveGte":2}},
 {"verb":"BUILD","what":"turret","where":{"x":-2,"z":-7},"when":{"waveGte":4}},
 {"verb":"BUILD","what":"turret","where":{"x":7,"z":7},"when":{"waveGte":6}},
 {"verb":"BUILD","what":"sentry_beacon","where":{"x":2,"z":-7},"when":{"waveGte":8}},
 {"verb":"BUILD","what":"turret","where":{"x":-5,"z":7},"when":{"waveGte":9}},
 {"verb":"HARVEST","seam":"gold-seam-1"},
 {"verb":"HARVEST","seam":"gold-seam-2"},
 {"verb":"REPAIR_UNDER","pct":50}]
```

---

## 14. RIG DEFECTS (harness-side; found by measurement, fixed, named)

Round 1's rig defects were all about *aiming*. The re-land deleted that whole class — no calibration, no build menu, no parked mouse, and with them R-SO-2, R-SO-3 and the collapsed-menu trap. What replaced them:

- **R-R2-1 — the staging deadlock, reborn without a mouse.** The first reflex layer committed to a build stand point whenever the gold gap fell under 25, including on ground that pays nothing. Measured in experiment E1: hero parked 96 s, purse frozen at 30, dead at wave 5. Fixed by the law in §4.2. **A reflex layer that stops earning to wait for gold has stopped the clock it is waiting on.**
- **R-R2-2 — the barrier watchdog, added because of E2.** If a BUILD's condition has been true for more than 8 s and it has not fired, something ahead of it is starving it; resume play and log it. This is what produced the citation in §5, and it is a behaviour any real reflex layer needs.
- **R-R2-3 — the honesty gate earning its keep.** The first campaign-B run reached a contract at Trail when Vein Hunter had been asked for. The gate threw on `diagnostics.difficultyPreset` before a single order was submitted. **A campaign that cannot fail its own preconditions is not evidence.**
- **R-R2-4 — the inbox that read the wrong run.** Night-shift attempt 2 shared a directory with attempt 1, and the inbox helper treated attempt 1's `result.json` and `orders-NN.consumed.json` as the current run's, skipping every call for 359 s. Fixed by moving attempt 1 to its own directory (kept whole, §13). The run survived it; the latency table declares it.

---

## 15. WHAT AP-03's `skill.md` MUST SAY — updated

Round 1's ten still stand. These replace or extend them, ordered by what would have saved this round the most.

1. **THE PLACEMENT CONTRACT, stated in numbers.** "A `BUILD` fires **once**. At that instant: your gold must be ≥ the item's *price* (not your trigger), **your hero must be within 6 wu of the cell** (`placeRadius`, measured from the player's body, not the Prospector's), the ground must be buildable, the cell must be ≥ 2.4 wu from any existing building, and the bench must not be full. Miss any one and the order is dead — there is no retry and the reason you get back is the same six words either way."
2. **NEVER SET A GOLD TRIGGER BELOW THE PRICE.** It is the single commonest way to destroy your own order; it took six of sixteen dead BUILDs here. Prefer `waveGte`: a wave is a clock your reflex layer can walk to, a gold threshold is only satisfiable where your hero is already earning.
3. **NEVER PUT A POSITION VERB BEFORE A BUILD.** `HOLD` — and `MOVE_TO` until it arrives within 0.16 wu, and `REPAIR_UNDER` while walking — return a result every tick, and the executor stops at the first result. Everything after them is unreachable. Put `BUILD`s first, always.
4. **YOUR READ OF YOURSELF IS STALE BY YOUR OWN LATENCY.** Name cells relative to seam sites (fixed, in `stablePrefix`), never relative to your hero (moving). Never restate an order whose trigger can fire while you are still answering — it will be bought before your replacement lands, and your copy will die on top of it.
5. **RE-COMMANDING IS SURVIVABLE IF YOU RESTATE ONLY WHAT IS UNDONE.** A submission replaces the record set; it costs you exactly what you repeat. `now.works.byKind` tells you what is already standing — but not *where*, so you cannot avoid overlapping your own works. Ask for coordinates.
6. **THE VIEW CANNOT SEE YOUR PLAN.** In a production boot `now.orders` is `[]`, `now.needsRider` is `false` and every `appendLog[].surprises` is empty, no matter what the executor holds. Read the *other* half of the same receipt (`outcome.result`) for orders, `needsRider` and the surprise log. Fix this and item 6 disappears.
7. **TELL THE TRUTH ABOUT THE ALMANAC.** 106 of 106 calls in this round projected zero leaks and zero works damage against 27 waves of real damage, down to −120. Until the leak model is replaced, label `expectedLeaks` and `expectedWorksDamage` unreliable or remove them, and point riders at `appendLog`, which was right every time.
8. **A SEAM ID IS A LEASE, NOT A PLACE.** Nodes hold 30–40 gold (six to eight 5-gold ticks, ~9–12 s of panning) and then go dark for 20 s, and the id↔place mapping moves *within* a run — 332 of 360 samples here disagreed with the published anchor, by up to 49 wu. `HARVEST` is worth exactly one 5-gold tick and dies terminally if its node is dark. Name a node only if you can answer within its lease.
9. **A FASTER RIDER IS A MORE EXPENSIVE RIDER.** Wave-boundary invocation fires whenever you are not already thinking, so your call count is set by your own latency, not by the game: 4 s answers bought 2.10 calls/wave, 29 s answers bought 1.10 on the same contract. Budget accordingly, and answer `HOLD` cheaply.
10. **SAY WHICH ACTOR EACH VERB COMMANDS, AND ADMIT WHAT IS UNREACHABLE.** `BUILD` acts on the world but is gated on the *player's* body; `HARVEST` has no positional requirement at all; `MOVE_TO`/`HOLD`/`FALLBACK_IF` command the **Prospector**. Nothing in the language addresses level-up choices or the rider's own survival — and on Night Shift those, not the works, are what decide the run.

---

## 16. THE VERDICT

**Did the relanded verbs hold under real play? Yes — the hands are attached and they work.** Twenty-seven buildings, four pans and ten repairs were placed by rider orders through the shipped adapter across five contracts and two ledgers, with zero `NO_SYSTEM_API` in 61 terminal orders. Round 1's F-SO-1 is closed by execution, not by reading.

**What is not yet true is that a rider can plan against them.** The verb that spends gold fires once, is gated on a radius nothing publishes, measured from a body the rider does not command, and reports every one of its five failure modes with the same six words. Thirty-seven per cent of this round's BUILDs died, and I could only tell you why because the harness sampled the world at 8 Hz and reconstructed it afterwards. That is not a door a skill.md can document; it is a door a skill.md would have to apologise for.

- **STANDING ORDERS (law 1): HELD.** Three contracts won on one wave-clocked plan issued at the gate, including the top preset.
- **CACHE SHAPE / the economy (law 3): HELD, with room to spare.** 6.5–18.5 % of the token budget on the won contracts; the VIEW costs half a millisecond to build.
- **TWO CLOCKS: HELD, and demonstrated harder than intended.** Twelve waves passed on Night Shift while the rider was silent for 359 s and the reflex clock kept the claim alive.
- **THE ALMANAC (law 2): DOES NOT HOLD.** 106/106, at four times round 1's sample size, with the same two structural defects.
- **THE PIPELINE: ALIVE, BUT WITHOUT A DOOR OR A DIAGNOSIS.** No window handle in any plain boot; no failure reason a rider can act on; a VIEW that cannot see the rider's own orders.

**Against the AP-01 honest-play gate** (owner, 2026-07-22: *"the agent seems to have infinite gold, teleports on the map, and in most videos does not move and just stands there and dies"*): no gold was granted, nothing teleported, six rungs were earned across two ledgers by twelve secured claims, and three of four commissioned contracts were won — one of them on the hardest preset in the game — with every building placed by an order the game itself executed. Round 1 answered *play is proven*. Round 2 answers **the product's own hands are proven**. What is still unproven is that anyone but this rehearsal can reach them.

**Recommended next slices, in order:** (1) **publish the surface** — one line, and AP-03 Transport A exists; (2) **propagate the placement failure reason** through `runSideEffect` into the order record — `confirmDiagnostics` already computes it, it is thrown away at the boundary; (3) **make the executor evaluate every order each tick** instead of returning at the first result, or document the barrier loudly; (4) **put orders, `needsRider` and surprises into THE VIEW** for production adapters (F-R2-11); (5) **fix or label the Almanac** (F-SO-16, now n=106); (6) publish `placeRadius`, prices, caps and building coordinates. **AP-03 should still not be authored until (1) and (2) are done** — (1) because the door does not exist, (2) because without it skill.md cannot tell a rider what to do when an order dies.

---

## 17. EVIDENCE LEDGER

**Committed:** `rehearsal/r2-{shipped,pilot,loop,report,wait-view}.mjs` · every rider call and answer under `rehearsal/so-runs/r2a/` and `rehearsal/so-runs/r2b/` (five metered contracts including both Night Shift attempts, kept whole — the failures are the findings) · `bank-summary.json` × 2 · `experiments.json` + `experiment-e{1,2,3}.json` (the price trap and the barrier pair) · `probe.json` + `probe-view.json` (the rung-0 refusals) · per-run `report.json` · harness consoles mirrored to `rehearsal/so-runs/r2-harness-logs/*.txt` (the retention law: `*.log` is gitignored) · screenshots in `reviews/shots-standing-orders-r2/`.

**Video — LOCAL ONLY, never committed** (`rehearsal-video/` is gitignored). Manifest committed at `rehearsal/so-runs/r2-video-manifest.jsonl`.

| file | length | what is in it |
|---|---|---|
| `rehearsal-video/r2-play-the-claim-r2a.webm` | 310 s | **THE CLAIM SECURED at wave 10** under shipped standing orders |
| `rehearsal-video/r2-play-e1-dry-gulch-r2a.webm` | 611 s | **THE DRY GULCH SECURED at wave 20** — four turrets and three beacons placed by orders |
| `rehearsal-video/r2-play-the-claim-r2b.webm` | 312 s | **THE CLAIM SECURED at wave 10 on VEIN HUNTER** |
| `rehearsal-video/r2-play-e1-night-shift-r2a.webm` | 567 s / 552 s | the two revenge attempts; the rider goes down at 18 in the dark, twice |
| `rehearsal-video/r2-bank-r2a.webm` · `r2-bank-r2b.webm` | 932 s · 928 s | the six secured claims that earned rung 3 on each ledger |
| `rehearsal-video/r2-experiments-r2a.webm` | 170 s | the price trap and the barrier pair, on film |

**Honest limit on the footage:** the two Night Shift attempts share a segment name, so the surviving file is attempt 2; attempt 1 survives as data (`e1-night-shift-attempt1/result.json`), not as film. Attempt 1's `view-00.json` and `boot.json` were overwritten before the directories were split — the loss is two opening frames, and it is declared rather than papered over.
