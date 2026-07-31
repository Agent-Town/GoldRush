# THE STANDING-ORDERS REHEARSAL — an agent wins honestly, cheaply, on film
Commission: TASK.md 2026-07-30 (untracked, owner-set). Dedicated Opus 5 session, branch `rehearsal/standing-orders`, solo writer. Tests the determinism doctrine ratified in `specs/agent-play/README.md` §"THE STANDING ORDERS + THE ALMANAC" against the VIEW/ALMANAC/ORDERS surface merged that morning.

**VERDICT IN ONE LINE: the economy claim is proven with room to spare, the standing-orders language is expressive enough to win, THE ALMANAC is not fit to plan against, and the shipped rider pipeline cannot execute the two verbs the doctrine is built around.**

---

## 0. RESULT

| contract | secure wave | outcome | run time | rider calls | calls/wave | VIEW bytes total | est. marginal tokens | orders placed |
|---|---|---|---|---|---|---|---|---|
| **the-claim** | 10 | ✅ **SECURED at wave 10** | 300 s | 4 | 0.40 | 8,642 | ~2,200 | 1/5 |
| **e1-dry-gulch** | 20 | ✅ **SECURED at wave 20** | 602 s | 21 | 1.05 | 65,539 | ~16,400 | 10/13 |
| e1-night-shift (stretch) | 25 | ❌ rider down at **wave 19/25** | 590 s | 17 | 0.89 | 52,913 | ~13,200 | 6/12 |

Both commissioned contracts were **won**. The stretch was not. Every run: **zero console errors, zero page errors**, Trail difficulty, permission rung 3, no debug parameters (§4).

---

## 1. WHAT WAS BUILT

`rehearsal/standing-orders-loop.mjs` (orchestrator + rider handoff) · `standing-orders-pilot.mjs` (the reflex clock) · `standing-orders-rider.mjs` (the page-side transport + VIEW snapshot) · `standing-orders-report.mjs` (tables) · `standing-orders-shipped-probe.mjs` (§3, quarantined).

**THE TWO CLOCKS, as implemented.**
- **Reflex clock** — Node, ~8 Hz. WASD on the hero, real mouse on the canvas, real clicks on the HUD. Pans seams by standing still inside 1.35 wu; breaks contact by measuring its own hp; takes level-up cards; walks to and parks the aim for the next pending BUILD. **It never chooses what to build.**
- **Command clock** — this session, out of process. Reads `et.goldrush.view`, thinks, writes `orders-NN.json`. The harness submits it through `et.goldrush.orders` and records the receipt verbatim. **The game does not stop while the rider thinks** — that is the point of the split, and it is what made the latency findings measurable.

Handoff is on disk so the two clocks are genuinely separate processes: `rehearsal/so-runs/so-1/<contract>/view-NN.json` out, `orders-NN.json` back. Every view, every order, every receipt is committed.

---

## 2. THE HONEST-PLAY ATTESTATION

Asserted **in code, every tick**, and recorded in each `result.json` under `honesty`:

| gate | evidence |
|---|---|
| Fresh profile | brand-new browser profile dir `rehearsal-profile-so-1`; first boot created profile "Rider" + town "Rider Creek" through the real forms. Opening meta `{territory:0, science:0, hero:0, agent:0}` (`bank-summary.json`). |
| **Trail difficulty** | `difficultyPreset: "trail"` read from diagnostics at every boot; the harness **throws** on anything else. The founding radio was left at its default "no" to the greenhorn offer. |
| **No debug** | every contract launched from the **town board**, never by URL. `searches` recorded per run is exactly `["?contract=<id>"]` — the reload marker `stagePlayerContractLaunch` writes. |
| **`window.__GR_TEST__` never existed** | sampled every tick of every run; `grTestSeen: false` in all three `result.json`. The harness **throws** if it appears. No `grantGold`, `teleport`, `setBalance`, `setWave` or `setManualSim` was reachable, let alone called. |
| **`window.__GR_AGENT__` never existed** | `grAgentSeen: false`. Not needed — the transport is built from published telemetry. |
| **The rung was EARNED, never set** | the adapter's `agentAutonomyLevel` is a *getter over the game's own* `diagnostics.agent.stub.permissionLevel`. It read 0 on a fresh profile and the game refused every verb (§5.1). Rung 3 arrived only after **three real secured claims**. |
| Zero errors | console/page error buckets empty for all three contracts and the whole banking phase. |

**Which rung, and how it was obtained.** Rung 3 (`autonomous-within-budget`). `AgentConsent.freshConsentState()` grants every rung by default, so no consent click was needed once the rung was **earned**; what gates it is `earned = level <= ceiling`, and the ceiling is `floor(metaProgress.tracks.agent)`. That track rises **+1 per secured run** (`RunManager.awardSecuredClaim`, `Balance.meta.victoryPayout.agent = 1`). So the rehearsal played **three complete Claim runs to buy the right to give orders**: secured at wave 10 in 300 s each, `agent` 0→1→2→3 (`rehearsal/so-runs/so-1/bank-{1,2,3}.json`). Those runs used no rider calls — at rung 0 no order is submittable at all — and the reflex clock played them alone.

**The one liberty taken, declared.** The final placement click is a `MouseEvent` dispatched on `#game-canvas` at the coordinates the reflex clock's **real** `page.mouse.move` had just calibrated, rather than a Playwright `mouse.click` — because `place_building` must return synchronously inside the executor's tick. `BuildSystem.onCanvasClick` reads `event.clientX/Y` and recomputes the ground point on the spot, and **nothing in `src/` or `e2e/` reads `event.isTrusted`** (verified by grep), so this is the same code path a physical click takes. All hero movement, all HUD clicks, all aiming, and every level-up choice were real device input.

---

## 3. THE HEADLINE FINDING — the shipped pipeline accepts orders it can never execute

**F-SO-1 (P0). On main, at rung 3, in a real boot, `BUILD` and `HARVEST` are accepted by `et.goldrush.orders` and then die on actuation with `NO_SYSTEM_API`.**

Proved by execution, not by reading — `rehearsal/standing-orders-shipped-probe.mjs`, output committed at `rehearsal/so-runs/so-1/shipped-surface-probe.json`:

```
place_building  -> { ok:false, reason:"NO_SYSTEM_API" }
pan_at          -> { ok:false, reason:"NO_SYSTEM_API" }
submit_orders([BUILD …])   -> { ok:true }        <- accepted
  … 3 s later:  status:"failed", reason:"NO_SYSTEM_API: BUILD action was rejected."
                surprise: order_failure, needsRider:true, turrets:0
submit_orders([HARVEST …]) -> { ok:true }        <- accepted
  … 2.5 s later: status:"failed", reason:"NO_SYSTEM_API: HARVEST action was rejected."
```

Cause, traced in source: `Game.ts:2055` installs the AgentStub over an **anonymous adapter literal** carrying only `diagnostics`, `economyLog`, `repair`, `collectXp`, `collectGold`. `ToolSurface.place_building` therefore falls through to `placeBuildingThroughGame`, which needs `game.buildSystem` / `canvas` / `camera` on that literal and finds none → `undefined` → `NO_SYSTEM_API`. `pan_at` has no adapter method at all, which is also why the surface never advertises the `auto_pan` capability (measured: capabilities list is `auto_collect`, `auto_repair`, and nothing else).

The validator, the rung check, the consent check, the trigger evaluation, the record lifecycle and the surprise channel are all live and correct. **Only the hands are missing** — and the failure is loud in exactly the wrong way: the order reaches `failed`, raises an `order_failure` surprise, and sets `needsRider`, so a real rider would burn a model call learning that the game cannot do the thing it just agreed to do.

**F-SO-2 (P0). There is no window handle on the tool surface in ANY build.** `install()` attaches a `view` getter to `window.__GR_AGENT__` *only if it already exists*, and `__GR_AGENT__` exists only under `?debug`. Even then the stub carries **no `submit_orders`** — measured: `stubHasSubmitOrders: false`. The only handle any outside caller has is `__GR_AGENT__.surface`, a TS-private field that survives to runtime, behind a debug flag. **AP-03 Transport A (browser-driving agents) has no door.** This rehearsal had to build one: it imports the game's own `/src/agent/ToolSurface.ts` into the page and installs a second surface over an adapter that reads the game's published telemetry and actuates through real UI input. That is a harness, not a product.

---

## 4. THE ECONOMY AXIS — the doctrine's cheapest claim is its strongest

Doctrine target: **a full contract ≤ ~100k marginal tokens**, at **~1 call/wave + surprises**.

| | the-claim | e1-dry-gulch | e1-night-shift |
|---|---|---|---|
| waves | 10 | 20 | 19 (of 25) |
| rider calls | **4** | **21** | 17 |
| calls per wave | **0.40** | **1.05** | 0.89 |
| VIEW bytes: mean / max | 2,161 / 2,553 | 3,121 / 4,156 | 3,113 / 4,068 |
| VIEW bytes total | 8,642 | 65,539 | 52,913 |
| **est. marginal tokens (4 chars/token)** | **~2,200** | **~16,400** | **~13,200** |
| **vs the ≤100k target** | **2.2 %** | **16.4 %** | 13.2 % |

**HELD, decisively.** The VIEW is 1.9–4.2 KB. It opens at ~1,950 bytes and grows by ~120 bytes per wave — the append-only log doing exactly what CACHE SHAPE (law 3) promised. A 20-wave contract's entire state payload is ~16k tokens. Even at one call per wave with no caching at all, the doctrine's budget is met with a 6× margin; behind a warm prefix cache the marginal cost is the wave delta alone.

**The call-budget claim is met, and the winning shape is cheaper than the doctrine assumes.** The Claim was won on **one plan issued at the gate plus three light touches** (0.4 calls/wave). The Gulch's 21 calls are misleading: **one** was a 13-order plan and **twenty were `HOLD`** — the rider reading the view and declining to change anything. Almost every one of those calls was raised by the **surprise** channel, not the wave clock: `claim_damage` fires per hit, so a contract under pressure wakes the rider constantly. That is the doctrine's second invocation path working — but it is far noisier than "~1/wave + surprises" implies, and without a cheap way to say "no change" it would be ruinous (§6, F-SO-7).

---

## 5. THE LATENCY LAW — the single most useful thing this rehearsal measured

Wave cadence is **30 s**. A frontier-model command clock composing a real plan took **14–96 s**, and on one bad turn **376 s**. That inverts the doctrine's implicit assumption that the rider arrives before its own trigger.

### 5.1 The three ways it broke, each measured

**F-SO-3 (P0). A trigger that is already true when the plan lands fires *immediately*, before the reflex layer can act — and dies.**
The Claim attempt 1: I answered in 57.4 s. The pan carried the purse 0 → 100 in that time, so three of four `goldGte` thresholds (62/85/110) were **already satisfied on arrival**. The executor fired all three on its very next tick, found no build menu open, and failed all three `build-mode-off`. Run died at wave 5 with zero works.
→ **The rule this proves: a rider's lowest trigger must clear `current purse + (earn rate × its own answering time)`, and the rider is the only party that knows its own answering time.** Nothing in THE VIEW tells it the earn rate; it had to be inferred from `appendLog[].goldDelta`.

**F-SO-4 (P0). A *late* plan is not merely late — every trigger it outlived fires on the same tick, and all but one are guaranteed to die.**
Gulch attempt 3: a 376 s answer landed at wave 16 carrying triggers for waves 6/8/10/12/14. Five orders came due simultaneously. The reflex layer can hold **one** aim; four failed `wrong-selection` against a mouse armed for the previous piece. This is the sharpest cost-of-latency result in the rehearsal and it argues for something the DSL does not have: **orders should expire, or the executor should fire at most one action per tick.**

**F-SO-5 (P1). The reflex layer must pre-arm on *affordability*, not on the trigger.**
Fixed mid-rehearsal: the pilot now walks to the cell and parks the mouse **the moment the purse could pay**, regardless of what the trigger says. That single change is what made a gold-clocked plan survivable at all. It is a general law for AP-03's reflex layer: *be ready before the trigger, not because of it.*

### 5.2 What actually wins
Both victories used the same shape and it is worth stating as doctrine: **issue one complete, wave-clocked plan at the gate, spaced so no two orders ever come due on the same tick, and then answer HOLD.** The Gulch's winning plan was thirteen orders covering waves 3→19, issued once, and never revised. Ten of thirteen landed. The rider's job after the gate was to *not interfere*.

---

## 6. THE STANDING ORDERS — where the language held and where it broke

### Held
- **Validation, rung checks and consent are exact.** On a fresh profile the game refused, verbatim: `"HOLD requires permission rung 2; current rung is 0."` and `"BUILD requires permission rung 3; current rung is 0."`
- **`BUILD … when:{goldGte|waveGte}` is genuinely expressive.** A whole contract's economy — four turrets, six beacons, three palisades, 720 gold — fits in one declarative list, and the Gulch was won by it.
- **The record lifecycle is honest.** `pending → active → done|failed`, with a reason on every failure and an `order_failure` surprise attached. Nothing lied about what happened.
- **The surprise channel works** and is the right idea: `claim_damage`, `order_failure`, `hero_down`, `wave_early` all fired correctly.

### Broke
**F-SO-6 (P0). `FALLBACK_IF` has a floor but no ceiling, so it silently becomes a permanent `HOLD`.**
`{threat:{enemiesGte:20}}` is a sensible retreat trigger at wave 6 and a permanent station from wave 12 on, because the wave curve exceeds 20 forever. On The Claim it parked the rider off the seams and **froze the purse for the rest of the run**. A threat threshold the wave curve will outgrow is not a fallback. It needs an upper bound, a duration, or a "resume work inside the fallback" semantic.

**F-SO-7 (P1). A submission REPLACES the entire record set, so there is no way to say "carry on".**
Re-commanding costs the rider everything: finished orders reset to `pending` and are **bought twice**, and the reflex layer's staging is thrown away. The rehearsal had to invent a `hold` verb harness-side to answer a surprise without destroying the plan. **AP-03 needs this in the protocol** — an `amend`/`append`, or at minimum a documented no-op.

**F-SO-8 (P1). List order is not firing order, and the trap is silent.**
`StandingOrdersExecutor.execute` skips a BUILD whose condition is unmet and fires the next one that *is* met — so a cheap order sitting fifth jumps the queue and lands on a mouse parked for the first. Discovered by reasoning before it bit; the pilot now stages "the order that will fire next" rather than "the first pending order". A rider cannot know this from the spec.

**F-SO-9 (P1). `HARVEST` names a seam whose id is not stable and is not resolvable from THE VIEW.** See F-SO-12. `execute` fails a HARVEST for an inactive seam **immediately and terminally**, so the one economy verb in the language is a coin flip.

**F-SO-10 (P2). Position verbs command the companion, not the rider.** `MOVE_TO`/`HOLD`/`FALLBACK_IF` move the **Prospector embodiment** (`Embodiment.updateSimulation` is the sole caller of `tickStandingOrders`); the player's own actor is untouched. The v1 failure the owner named — *"in most videos does not move and just stands there and dies"* — is a **hero** problem, and no verb in this language addresses it. This rehearsal mirrored the position verbs onto the hero in the reflex layer, which is a defensible reading of "the reflex layer executes the plan" but is **not what the DSL says**. skill.md must say which actor a verb commands.

**F-SO-11 (P2). Nothing in the language addresses level-up choices.** 15–28 upgrade cards were chosen per run — the single largest determinant of hero damage — entirely by a hard-coded reflex-layer preference list. A rider cannot express "buy damage, then plating".

---

## 7. THE VIEW — good bones, four holes that cost real runs

**F-SO-12 (P0). The seam ids in `stablePrefix.map.seams` do not denote the same seams as the live list, and the live mapping moves during the run.** Measured on The Claim: `stablePrefix` says `gold-seam-1 = (-22,-6.8)`; at t=1 s the live node called `gold-seam-1` was at **(-9, 6.7)**, and by t=104 s the same id was at **(-22,-6.8)**. `now.seams` carries **no coordinates at all**, so a rider cannot resolve a live seam to a place from THE VIEW alone. Any `HARVEST` order naming an id is aiming at a moving target.

**F-SO-13 (P1). THE VIEW has no price list, no build caps and no buildability map** — so it cannot support the one verb that spends gold. The rider cannot know a turret costs 50→70→95→125, that the bench caps at four, that the purse caps at 200, or that a cell is on the river. This rehearsal had to feed all of it from the reflex layer as an out-of-band `pilotReport`. Every one of those numbers is already in `Balance`/`buildables`; publishing them is cheap.

**F-SO-14 (P1). `now.score` is empty for any rider outside the Game object.** `summarizeRun` is fed from `economyLog`, which is closed over `Game.economy.log` and unreachable — so `goldPanned`, `goldStolen`, `buildingsBuilt` read **0** all run. THE VIEW's own scoreboard is blank for the audience it was written for.

**F-SO-15 (P2). No threat geometry.** The non-debug diagnostics publish `enemiesAlive` (a scalar) and `edge` (the telegraphed spawn side) and nothing else. The reflex layer had to infer contact from **its own hp going down**. That is workable — and arguably correct for a human-parity rule — but skill.md must say so plainly, because it determines what a reflex layer can be asked to do.

---

## 8. THE ALMANAC — measured, and it does not survive the measurement

**F-SO-16 (P0). Across 42 rider calls in three contracts, `expectedLeaks` was 0 in 42/42 and `expectedWorksDamage` was 0 in 42/42 — while the works actually lost HP in ten of the observed waves, up to −187 in one.**

| call | for wave | predicted enemies | actual kills | predicted works damage | **actual works Δ** | outcome |
|---|---|---|---|---|---|---|
| claim 0 | 1 | 6 | 10 | 0 | 0 | held |
| claim 2 | 4 | 15 | 24 | 0 | **−24** | works-damaged |
| claim 3 | 7 | 24 | 41 | 0 | **−80** | works-damaged |
| gulch 7 | 9 | 30 | 55 | 0 | **−56** | works-damaged |
| gulch 15 | 16 | 37 | 77 | 0 | +36 | held |
| gulch 19 | 19 | 38 | 71 | 0 | **−32** | secured |
| night 2 | 6 | 21 | 33 | 0 | **−187** | works-damaged |
| night 6 | 9 | 30 | 55 | 0 | **−109** | works-damaged |

Full table: `rehearsal/so-runs/so-1/*/result.json` → `almanacLog`, joined against the game's own `appendLog`.

Two independent defects:
1. **The leak model asks the wrong question.** `buildAlmanac` computes `stopped = (heroDps + worksDps) × 30 s ÷ meanEnemyHp` and calls the remainder leaks. With a levelled hero that quotient always exceeds the wave, so leaks are always 0 — and `expectedWorksDamage = leaks × contactDamage` is therefore always 0 too. But enemies **attack the works on their way in**; damage does not require a leak. The projection is structurally incapable of the number a defender most needs.
2. **The composition undercounts arrivals by ~40 %.** `predictedEnemies ÷ actual kills in that wave` averages **0.61** across 41 comparable calls. Some of that is carry-over from earlier waves, but the sign and magnitude are consistent across all three maps.

**`nextWave.arrivalInSeconds` and the composition *roster* were reliable** — the schedule half of the Almanac is sound. It is the *consequence* half, the part law 2 exists for ("the rider decides in consequences, not pixels"), that is not yet true enough to plan against. **On this evidence a rider that trusted the Almanac would never build anything.** Both wins came from ignoring it and reading `appendLog` — the game's own record of what actually happened last wave — which is the honest signal and is already in the payload.

---

## 9. TRANSCRIPTS

Verbatim, every plan and every receipt: `rehearsal/so-runs/so-1/<contract>/orders-NN.consumed.json` and `view-NN.json` (committed). The two that won:

**the-claim, seq 0** — 5 orders, accepted `{ok:true, count:5}`:
```json
[{"verb":"BUILD","what":"turret","where":{"x":-6,"z":7},"when":{"goldGte":62}},
 {"verb":"BUILD","what":"turret","where":{"x":2,"z":-5},"when":{"goldGte":85}},
 {"verb":"BUILD","what":"turret","where":{"x":5,"z":7},"when":{"goldGte":110}},
 {"verb":"BUILD","what":"turret","where":{"x":-4,"z":-4},"when":{"goldGte":142}},
 {"verb":"FALLBACK_IF","threat":{"enemiesGte":20},"pos":{"x":0,"z":9}}]
```

**e1-dry-gulch, seq 0** — 13 orders, accepted `{ok:true, count:13}`, **10 placed and verified**:
```json
[{"verb":"BUILD","what":"turret","where":{"x":-5,"z":4},"when":{"waveGte":3}},
 {"verb":"BUILD","what":"turret","where":{"x":2,"z":-4},"when":{"waveGte":5}},
 {"verb":"BUILD","what":"turret","where":{"x":5,"z":6},"when":{"waveGte":7}},
 {"verb":"BUILD","what":"turret","where":{"x":-2,"z":8},"when":{"waveGte":9}},
 {"verb":"BUILD","what":"sentry_beacon","where":{"x":-7,"z":7},"when":{"waveGte":11}},
 {"verb":"BUILD","what":"sentry_beacon","where":{"x":-3,"z":-5},"when":{"waveGte":12}},
 {"verb":"BUILD","what":"sentry_beacon","where":{"x":4,"z":-4},"when":{"waveGte":13}},
 {"verb":"BUILD","what":"sentry_beacon","where":{"x":8,"z":4},"when":{"waveGte":14}},
 {"verb":"BUILD","what":"sentry_beacon","where":{"x":-9,"z":1},"when":{"waveGte":15}},
 {"verb":"BUILD","what":"sentry_beacon","where":{"x":0,"z":9},"when":{"waveGte":16}},
 {"verb":"BUILD","what":"palisade","where":{"x":-4,"z":1},"when":{"waveGte":17}},
 {"verb":"BUILD","what":"palisade","where":{"x":3,"z":1},"when":{"waveGte":18}},
 {"verb":"BUILD","what":"palisade","where":{"x":0,"z":-2},"when":{"waveGte":19}}]
```
Placement ledger (`riderAudit.builds`, each `verified` against a later published frame): turrets at waves 2/4/6/8 ✅, beacons at 10/11/12/13 ✅, beacons at 14/15 ✗ `unstaged-no-aim`, palisades at 16/18 ✅, palisade at 17 ✗ `cell-invalid-per-game`.

**Requested vs placed.** The reflex layer relocates a cell when no live seam sits within 5.2 wu of it, because holding an aim somewhere that pays nothing is a self-blocking order (§10). Relocations are logged with their distance — e.g. `RELOCATED 24.5wu from {"x":-4,"z":1}` on the Gulch. **The rider's intent survives; the exact acre is the reflex layer's business.** That division is defensible and is what the two clocks are for, but skill.md must say it out loud or riders will believe their coordinates are honoured.

---

## 10. RIG DEFECTS (harness-side; found by measurement, fixed, and named so the next rig does not repeat them)

The 2026-07-22 rehearsal lost every boss fight to R1, "the paralysed driver" — a rig that believed it was steering while the hero stood still. **This rig reproduced that class twice** and only caught it by measuring instead of believing.

- **R-SO-1 — the hero pinned against its own palisade ring.** A straight-line seek with no obstacle handling pressed `KeyW` into a territory palisade and stopped. Measured: the hero sat at `(-1.6127478622542708, -3.0727872384939183)` — identical to sixteen decimal places — for **50 s and two whole waves**, `goldDelta 0`, while the harness believed it was walking. Fixed with a stall watchdog that alternates a lateral slide. **A movement controller that does not measure its own speed is lying to you.**
- **R-SO-2 — the stale-diagnostics false negative.** Diagnostics publish once per frame, so the count read in the same JS turn as the click is from *before* it. Two genuinely-placed turrets were reported "rejected", both orders failed, two false surprises fired. Fixed: the receipt is now gated on the game's own `build.ghostValid` verdict for that exact cell (the same predicate `confirm()` re-runs), and the pilot writes the ground truth into `verified` one frame later. That verification then caught a real false positive on Night Shift (`clicked-but-not-placed`), so it earns its keep.
- **R-SO-3 — the collapsed build menu.** Clicking outside the menu calls `collapseBuildMenu`, which folds the tiles away while **leaving placement armed**. A folded tile is `display:none`, so a tile click is a silent no-op and the selection stays on whatever was built last. Six beacon orders on the Gulch died `wrong-selection:turret` this way. Fixed by re-opening the menu until the tiles are really on screen and then verifying the selection moved.
- **R-SO-4 — the staging deadlock.** A gold-triggered BUILD whose cell has no live seam near it freezes the hero on ground that pays nothing, waiting for gold only panning could bring. Two waves lost on The Claim. Fixed by standing on a seam that *pays* and aiming at the closest legal approach to the rider's cell.

---

## 11. WHAT AP-03's `skill.md` MUST SAY

Ordered by what would have saved this rehearsal the most time.

1. **THE CADENCE LAW, stated in numbers.** "Waves are 30 s. Your plan lands when you finish thinking, not when you start. **No trigger may be satisfiable at the moment your answer lands** — a gold threshold below the current purse, or a wave already reached, fires instantly and dies unstaged. Budget `purse + earn-rate × your own latency`. If you are slower than one wave, plan two waves ahead."
2. **THE ONE-PLAN RULE.** "Issue a complete, wave-clocked plan at the gate; space orders so no two come due on the same tick; then answer HOLD. Re-commanding costs you every finished order and every staged aim."
3. **HOW TO SAY NOTHING.** The protocol needs a documented no-op / amend. Today, a rider woken by a surprise must either restate its whole plan (and buy things twice) or stay silent (and lose the invocation).
4. **WHICH ACTOR EACH VERB COMMANDS.** `BUILD` acts on the world; `MOVE_TO`/`HOLD`/`FALLBACK_IF` command the **Prospector companion**, not the rider's own actor. Say it, or every rider will write plans for the wrong body.
5. **WHAT THE REFLEX LAYER MAY CHANGE.** Cells are intent, not contract: the reflex layer will relocate a build toward ground the rider can work, and will pre-arm on affordability rather than on your trigger. Publish the relocation in the receipt.
6. **THE PRICE LIST, THE CAPS AND THE PURSE CEILING BELONG IN THE VIEW.** Costs (`50/70/95/125`, `25/35/45/55/75/95`, palisade 10), bench caps (turret 4, beacon 6, sluice 3), the 200 bank cap, and *some* buildability signal. Without them the one spending verb is guesswork.
7. **TELL THE TRUTH ABOUT THE ALMANAC.** Until F-SO-16 is fixed, `expectedLeaks` and `expectedWorksDamage` must be labelled unreliable, or removed. Point riders at `appendLog` — the record of what actually happened — which is already the honest signal in the payload.
8. **`FALLBACK_IF` needs a ceiling**, and `HARVEST` needs a seam identifier that means one place for the whole run.
9. **Say what a rider can and cannot see:** `enemiesAlive` is a scalar, `edge` is the only direction, there are no enemy positions. Contact is measured from your own hp.
10. **Say how the rung is earned.** A fresh profile is rung 0 and **cannot submit a single order**. Three secured claims buy rung 3. A rider arriving cold will otherwise conclude the API is broken.

---

## 12. THE VERDICT

**Is the doctrine real? Yes — three of its four laws survived contact.**

- **STANDING ORDERS (law 1): HELD.** A declarative plan, re-invoked at boundaries and surprises, is enough to win. The Gulch was taken by thirteen orders written once before the first enemy spawned.
- **CACHE SHAPE / the economy (law 3): HELD, with room to spare.** A 20-wave contract cost ~16k marginal tokens against a 100k budget. The VIEW's append-only shape is exactly right.
- **TWO CLOCKS: HELD, and it is the load-bearing idea.** Every failure in this rehearsal was a failure of the *seam* between the clocks — never of the split itself. The reflex clock kept the claim alive through 376 s of rider silence; that is the whole argument, demonstrated.
- **THE ALMANAC (law 2): DOES NOT HOLD.** 42/42 calls projected zero leaks and zero works damage against ten waves of real damage. The schedule half is sound; the consequence half is not yet true enough to decide in.
- **THE PIPELINE ITSELF: BROKEN ON MAIN.** `BUILD` and `HARVEST` — the two verbs the doctrine's own examples are written in — are accepted and then refused with `NO_SYSTEM_API`, and there is no window handle on the surface in any build. Everything above was proven through a transport this rehearsal had to build.

**Against the AP-01 honest-play gate specifically** (owner, 2026-07-22: *"the agent seems to have infinite gold, teleports on the map, and in most videos does not move and just stands there and dies"*): no gold was granted, nothing teleported, the rider moved continuously under pressure on Trail difficulty from a fresh profile, and the claim was **secured at wave 10 and again at wave 20** — six secured claims in all (three banking the rung, two on The Claim, one on the Gulch), on film. The v1 verdict of *traversal proven, play unproven* is answered: **play is now proven.** What is not yet proven is that a rider can do it through the shipped API rather than through a harness that reaches past it.

**Recommended next slices, in order:** (1) wire `placeBuilding`/`panAt` into the real adapter and give the surface a window handle — F-SO-1/F-SO-2, without which AP-03 cannot exist; (2) fix the Almanac's leak model or label it — F-SO-16; (3) put prices, caps and the purse ceiling in THE VIEW and stabilise the seam ids — F-SO-12/13; (4) add an amend/no-op to the order protocol — F-SO-7. **AP-03 should not be authored until (1) is done**, because skill.md would otherwise document a door that does not open.

---

## 13. EVIDENCE LEDGER

**Committed:** `rehearsal/standing-orders-{loop,pilot,rider,report,shipped-probe}.mjs` · every rider call and answer under `rehearsal/so-runs/so-1/` (three contracts plus five superseded attempts, kept whole — the failures are the findings) · `bank-{1,2,3}.json` + `bank-summary.json` · `shipped-surface-probe.json` · screenshots in `reviews/shots-standing-orders/`.

**Video — LOCAL ONLY, never committed** (`rehearsal-video/` is gitignored). Manifest: `rehearsal-video/standing-orders-segments.jsonl`.

| file | length | what is in it |
|---|---|---|
| `rehearsal-video/so-play-the-claim-so-1.webm` | 310 s | **THE CLAIM SECURED at wave 10** under standing orders, rung 3 |
| `rehearsal-video/so-play-e1-dry-gulch-so-1.webm` | 612 s | **THE DRY GULCH SECURED at wave 20** — ten of thirteen orders placed on film |
| `rehearsal-video/so-play-e1-night-shift-so-1.webm` | 599 s | Night Shift to wave 19/25; the rider goes down in the dark |
| `rehearsal-video/so-bank-so-1.webm` | 919 s | the three secured Claim runs that earned rung 3 |
| `rehearsal-video/so-probe-probe{1,2}.webm` | 32 s each | the shakedown: fresh profile → town → board → contract, rung 0 refusals on film |

**Honest limit on the footage:** each contract's video was overwritten by its own later attempts, so the surviving files are the **final** run of each contract — the two wins and the stretch. The superseded attempts survive as data (`*-attempt*/result.json`), not as film.
