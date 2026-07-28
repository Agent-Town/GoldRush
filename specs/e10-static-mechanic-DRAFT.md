# THE STATIC — the finale's preserve-to-win mechanic (the fight you win by keeping)
Status: **DRAFT v1, 2026-07-27, attended (Opus 5, worktree `design/e10-static-mechanic`)** — a CONCRETE proposal for the owner to react to. **It does NOT ship until E10 approaches release** (owner directive in this task's master). Design only: this branch touches zero `src/`, zero gameplay. 3 ratification questions batched at the bottom; §0 is the part to read first, because the premise moved. On ratification this file should move to `specs/e10-static-finale/README.md` per the house convention (status is a line, never a filename — `specs/` has 74 files and not one carries a status token in its name).

Sources bound into this spec: `lore/STORYBOOK.md` §CHAPTER E10 (:581–627) + §THE INTERSTITIALS (:631–643) + Appendix B (:665–677) · `specs/epoch-saga/e10-deepsky-bundle.md` · `lore/story-arc.md` §THE CURE-ARMS RULING (:64–69) + §THE PAN SIEGE (:101) · `lore/canon-rules.md` · the SHIPPED v0 (`src/systems/E10StaticBossSystem.ts`, `e2e/e10-static-boss.spec.ts`, `Balance.e10Static`, `assets/contracts/epoch-10-deepsky/contracts.json`).

---

## 0. READ THIS FIRST — the premise moved: **a v0 of this mechanic already ships**

This task was authored as "draft the finale's preserve-to-win mechanic." Before designing anything I ran the check CLAUDE.md §7.1 requires, and the answer changes the shape of the deliverable:

**✓ VERIFIED — the preserve-to-win fight is on main today.** Commit `4ca205b8` (2026-07-19, `runner(lane-a): lane-e10-static-boss.md`), confirmed an ancestor of `main` via `git merge-base --is-ancestor`. It landed 527 lines across five files:

| File | Lines | What |
|---|---|---|
| `src/systems/E10StaticBossSystem.ts` | 317 | the whole fight: 4 acts, 3 preserve sites, meaning drain, recession, `victory: 'receded'` |
| `e2e/e10-static-boss.spec.ts` | 151 | 4 tests, incl. one titled *"…and nothing is killed"* |
| `src/game/Balance.ts` | +23 | the `e10Static` block |
| `src/game/Game.ts` | +36 | construction, sim tick, interact verb, secure gate, music duck, test seam |
| `src/vite-env.d.ts` | +5 | the diagnostics surface |

So this document is **not** a design from zero. It is the spec the v0 never had, and it does three things: names what shipped (with evidence, so nobody re-authors it — Mistake #8), names honestly what the v0 is **not** yet, and proposes the mechanic end-to-end so the owner can yes/no a target rather than a blank page.

**The one-sentence verdict on the v0: the shape is right and the fight is not there yet.** The nouns, the acts, the recession, the no-kill contract, the handoff into the T10 re-inking — all correct and working. But as tuned and scoped it is winnable in ~6.3 seconds by walking 20 units and pressing one key three times, against no opposition. §4.0 does that arithmetic.

⚠️ **Two bookkeeping findings fell out of this check; both are recorded as F-IDs in §11 and neither is fixed by this branch.** The important one: the queue guard **clears** the master that produced this shipped code.

---

## 1. Owner directives and canon (verbatim, dated — these are the constraints, not my opinions)

- **The final strain — CANON, owner-ruled 2026-07-18, ruling #19** (`lore/STORYBOOK.md:592`): *"the Static is the Fever's final mutation — the hunger having consumed every lesser want, mutated past objects entirely… What is left when hunger outlives its objects is the Static: **a want for meaning itself** — ink, color, memory, the Static's established diet."*
- **Cure-arms — owner verbatim, 2026-07-13** (`lore/story-arc.md:64`): *"what if they are not there to destroy the opponents but to cure them?"* Ratified same file `:66`: *"the town's frontier-tech does not kill the Fevered — it BREAKS THE FEVER'S GRIP."* Its final form, `lore/STORYBOOK.md:593`: *"**the RE-INK BURST is the final medicine — meaning, re-applied.**"*
- **The Quiet's own choreography header** (`lore/STORYBOOK.md:609`): *"**THE QUIET (no components; it is an ABSENCE, and you do not damage it — you out-live it)**."* And `:613`: *"**the Quiet does not die. It RECEDES.** Entropy is not defeated; it is out-lived."*
- **Act 3, the three preserves** (`lore/STORYBOOK.md:613`): *"Inside the aura, combat inverts into stewardship: **keep one lantern lit** (light), **keep one song playing** (the Pan Theme — the melody the player has heard since the main menu is now a thing they DEFEND), **keep one portrait untouched** (memory). Each preserve held weakens the heart."*
- **The unraveled are restored, not slain** (`lore/STORYBOOK.md:611`): *"(Cure-arms holds to the last: the unraveled are not slain — every one dispersed by the re-ink grammar is a memory RESTORED to the wall's ledger; **the fight's kill-feed is, literally, remembering**.)"*
- **The pan siege / the hub stays sacred — owner asked, ruled 2026-07-16** (`lore/story-arc.md:101`): *"**THE PAN SIEGE ('why don't they invade the town?')**: they DO — the CONTRACTS ARE THE SIEGES… PLUS one scripted TOWN-RAID story beat per saga… as ceremony/beat, never a standing mode: **the hub stays mechanically sacred**."* Tightest phrasing, `lore/STORYBOOK.md:86`: *"**no raid mode, ever**."*
- **Played-not-watched — RATIFIED STORYBOOK LAW, 2026-07-11** (`lore/STORYBOOK.md:632`): *"Law: **ceremonies are PLAYED, not watched** — every one gives the player's hand something to do; cutscene-only transitions are forbidden."* (Citation note: this is Fable-authored under the owner's standing commission, not an owner utterance. Cite it as ratified storybook law, never as a Robin quote.)
- **The town keeps what it defeats** (`lore/STORYBOOK.md:677`): *"Design law the roster proves: from E3 onward the town KEEPS what it defeats, and each keeping is warmer than the last."* E10's keeping is *"one mote, jarred: 'remember'"* — **kept thing #6** (`:665–677`).
- **The habit, not the twist** (`lore/STORYBOOK.md:589`): *"The final contracts do not extract. They **preserve** — and the town is ready, because it has been rehearsing preservation since it wrangled its first toaster… The saga's stewardship turn isn't a twist. It's a habit the player already has."*

---

## 2. Thesis

**The Static is a weather, not a body — and the finale is the only fight in the saga where the player's job is to keep three things true at once while the world argues.**

Every other boss in ten eras answers the question *"how do I bring this thing down?"* The Quiet answers a different one: *"what will you not let go of?"* Mechanically that means the fight must have **no damage channel into the boss and no damage channel out of it into the hero** — the Static's only interaction with the world is subtraction of meaning from things the town keeps. The player does not out-damage it. The player out-*lasts* it by doing three incompatible small jobs in a space too large to do them all comfortably, until the want has nothing left to reach for and recedes.

The design test this spec holds itself to: **the finale must be the hardest triage problem in the game and contain zero new offense.** If it needs a new weapon to be interesting, the thesis has failed.

---

## 3. The laws this mechanic answers to (each with its compliance clause)

1. **CURE-ARMS — nothing is killed.** The Static has no HP and accepts no damage; the unraveled machines are *dispersed*, and per canon each dispersal is a memory RESTORED (§4.1 makes that a scoreboard, not a flavour line). Approved vocabulary is fixed (`specs/enemy-rosters-e6-e10.md:14`): **freed · turned back · powers down · disperses**. Player-facing surfaces say **RECEDES** of the Quiet. The shipped v0 already encodes this as literal types — `damageAccepted: 0; killPath: false` (`E10StaticBossSystem.ts:45–46`), which cannot be set true. **Keep that pattern; extend it to hero HP** (§4.0/F-3): the Static must never route damage to the hero, and the diagnostics should say so in a type.
2. **THE NO-RAID HUB LAW — reconciled explicitly, because this fight looks like a violation and is not.** THE LAST CLAIM makes the Ark's decks the map (`lore/STORYBOOK.md:606`), and the Ark is E10's walkable hub (`e10-deepsky-bundle.md` §B1). The law permits this on exactly one reading, and the spec commits to it: **THE LAST CLAIM is a CONTRACT — chosen from the board, entered, run, exited — never a standing mode and never an event that can befall the hub scene.** The Ark-as-hub (`TownScene`) is never raided, never spawns an enemy, never runs a wave; the Ark-as-map is a contract tile with its own `tileId` (`ark-plaza-e10`), exactly as the E5 Boat is both home and map. The machine-checkable form of this law already exists and must keep passing: `e2e/town-t5-townsfolk.spec.ts:187` asserts `window.__THREE_GAME_DIAGNOSTICS__` is **null** in town — i.e. no run sim exists in the hub scene. **Any slice below that would make that assertion fail is out of scope by law.**
3. **PLAYED-NOT-WATCHED.** All three preserve verbs are live player input; none completes on a clock. The engine already guarantees exactly this for ceremony hands and the guarantee is worth copying verbatim — `CeremonySystem.ts:315` carries the law as a code comment: *"The played-not-watched law as machinery: no clock ever finishes this."* The finale's re-inking payoff (the part that IS watched) is already correctly fenced: it runs only **after** `victory: 'receded'`, in `E10FinaleSystem`, which is render-only and *"never writes sim state"* (`E10FinaleSystem.ts:31–32`) ✓ VERIFIED.
4. **ONE WRITER PER SURFACE.** CombatSystem stays the sole damage resolver; Economy the sole gold writer; `activateEpoch()` the only era-arming seam. The Static writes only its own preserve state. **One new arbitration is owed** and does not exist today: `canvas.style.filter` has two writers already (`E10StaticBossSystem.ts:294` and `E10FinaleSystem`) coordinated by a comment (`E10StaticBossSystem.ts:197–199`) rather than by code. A third writer breaks it. See F-4.
5. **RENDERING-ONLY vs SIM.** The desaturation, the aura ring, the mote and the re-inking are render-side; the drains, windows and recession clock are sim, on the fixed step. The v0 gets this right: the Static ticks at `Game.ts:2344` inside the `simActive` block with `simDelta`, never wall-clock ✓ VERIFIED.
6. **WARMTH (owner-ruled 2026-07-17, `lore/canon-rules.md:10`)** — the empathic kind: *"being kept, seen, named, tended."* The finale is the literal enactment of that definition, which is why the verbs in §5 are tending verbs and not button-mashes.

---

## 4. What the Static DOES — pressure on the town's kept things, never on the hero

### 4.0 First, the honest measurement of the shipped v0 (this is the gap the design has to close)

All values ✓ VERIFIED by reading `src/game/Balance.ts:412–434`, `src/systems/E10StaticBossSystem.ts`, and the contract JSON.

- The three sites sit at `(-10, 50)`, `(0, 50)`, `(10, 50)`, each `radius: 3`.
- `Balance.hero.speed = 6.0`. A full circuit visiting all three, centre to centre, is 20 units ⇒ **3.33 s of walking.**
- One press buys `preserveWindowSeconds: 8`.
- `recessionHoldSeconds: 3` — recession completes after 3 s with all three held.
- **Therefore:** press A at t=0 (held to 8.0), B at t≈1.67 (held to 9.67), C at t≈3.33 (held to 11.33). All three are simultaneously held from t=3.33; recession completes at **t≈6.33 s**, with 1.67 s of slack on the tightest window. **The saga's final boss is won on one pass, in about six seconds, and the plate never wobbles.**
- **`meaning` is a display variable, not a mechanic.** `held()` requires `meaning > 0 && protectedUntil > at` (`:257–259`), but `tryPreserve` sets `meaning = min(1, meaning + restorePerInteraction)` with `restorePerInteraction: 1` (`:149`) — a single press always restores it fully. So `meaning` can never gate a preserve that the `protectedUntil` timer does not already gate. Its only consumer is marker scale (`:292`).
- **There is no opposition.** `staticEnemies: 0` is asserted as a **pass** condition (`e2e/e10-static-boss.spec.ts:139`), and the fight's own e2e runs with `&nowaves`. Nothing contests the circuit.
- **There is no loss.** Draining to `meaning: 0` has no consequence at all; the run simply continues.
- **The player is told almost nothing.** The pause panel's `goalProgress` is `null` for this contract ✓ VERIFIED at `Game.ts:7149–7151`: it renders only when `autoSecureWaveForRun() === secureWave`, and the Static's gate forces `Number.MAX_SAFE_INTEGER` until it recedes (`Game.ts:4536`). The three preserves' state exists in `__THREE_GAME_DIAGNOSTICS__` and in three coloured cylinders. This is Mistake #10 (the Debug-Gate Leftover) with the saga's last mechanic as its subject.

None of that is a criticism of the runner that built it: its master (`tasks/lane-e10-static-boss.md`) said, in full, *"1.-4. Per the bundle's slices"* — the design did not exist to implement. **This spec is that design.**

### 4.1 The pressure, in three acts (canon's acts, given mechanics)

The Static's entire interface to the world is one verb: **un-ink** — remove meaning from a kept thing. It has three delivery systems, arriving in the canon order.

**ACT 1 — THE SQUALL (the boarding).** Unraveled machines board: prior-era enemy variants wearing one un-ink mask (`e10-deepsky-bundle.md` §A: *"one mask treatment applies to existing sheets: ART EFFICIENCY, the whole rogue's gallery returns for free"*). Their behaviour is the design's load-bearing invention:

> **An unraveled machine does not attack the hero. It walks to the nearest kept thing and stands in it.** While one is inside a preserve's radius, that preserve drains at `squallDrainMult` × the base rate, and its window cannot be refreshed while the intruder stands there.

This single rule converts the fight from *tap three timers* into *defend three places*, restores the survivors-like the game actually is, and pays the canon's own line about the kill-feed. Dispersing one with the re-ink grammar is a **restoration**: it increments a visible `memoriesRestored` counter and, per `lore/STORYBOOK.md:611`, that counter is the fight's kill-feed. It also makes the E10 roster's existing art (`char-e10-unraveled_machine-sheet-walk8`, currently unlanded — see F-5) the thing the fight is *made of* rather than set dressing.

**ACT 2 — THE APPROACH (the forgetting).** The heart advances; inside its aura, **the arsenal shuts down in the order it was learned** (`lore/STORYBOOK.md:612`). Era-tag weapon gating is already named as the required engine prereq in the bundle (§C). The rule: as `auraStrength` crosses successive thresholds, era N's weapons stop firing inside the radius, oldest first. **The Starlight Pan is exempt, permanently and by name** — canon: *"the STARLIGHT PAN, which it cannot forget, because the pan was never an invention. It was a promise."* The player finishes the saga with the newest science defending the oldest things.

**ACT 3 — THE THREE PRESERVES.** Combat inverts into stewardship. Offense still exists (the squall keeps boarding), but winning is no longer about the squall — it is about §5's three jobs, held simultaneously, while the squall makes that expensive.

### 4.2 What the Static must never do

- **Never damage the hero.** Not contact, not aura, not squall. This is the mechanical spine of "you do not damage it — you out-live it": a fight with no damage in either direction. It also means **the finale cannot be lost by dying**, which forces Q1 to be answered rather than assumed.
- **Never destroy a building.** The Static eats meaning, not matter. Un-inking a turret does not wreck it.
- **Never take a preserve away permanently.** A lapsed preserve is recoverable; the cost of lapsing is time, not loss (unless Q1 rules otherwise).

---

## 5. The PRESERVE verbs — lantern / song / portrait, mapped to real inputs

The v0's three preserves are three identical markers: `tryPreserve` is kind-agnostic, and `kind` selects only a copy string and a diagnostics label (`E10StaticBossSystem.ts:303–313`) ✓ VERIFIED. Light, song and memory play exactly the same. **That is the single biggest gap between the shipped fight and the canon**, because the whole point of the three is that they are three *different kinds of keeping*.

The proposal maps each to a distinct verb — and, elegantly, **the ceremony engine already ships four of the five primitives needed**, which is what "the town has been rehearsing preservation" means in code:

| Preserve | Canon | The hand | Substrate | Why this verb and no other |
|---|---|---|---|---|
| **THE LANTERN** (light) | *"keep one lantern lit"* | **HOLD** — stand at the lantern and hold; the flame climbs while you hold, and only while you hold | `CeremonyHand {kind:'hold'}` (`src/ceremony/scripts.ts:23`); accumulate at `CeremonySystem.ts:361`, complete at `:399` | Light is **tended**. Holding is the body-language of tending, and it spends the one resource the fight is short of: your presence. |
| **THE SONG** (song) | *"keep one song playing"* — the Pan Theme | **KEEP TIME** — press on the beat; the melody continues only while you keep it | `CeremonyHand {kind:'rhythm'}` + the `rhythmContinues` clause (`scripts.ts:36`, `CeremonySystem.ts:322`, `:412–420`) | The song is **carried**. It is the only preserve that is inherently temporal — you cannot bank it, you can only keep it. `rhythmContinues` already implements precisely "a staged beat that will not finish until the hand keeps playing." |
| **THE PORTRAIT** (memory) | *"keep one portrait **untouched**"* | **KEEP CLEAR** — the inverse verb: the portrait holds as long as nothing enters its frame. No unraveled machine, no burst, and **not you**. | new (the one genuinely new primitive); reuses proximity queries of the `buildingsInRadius` shape | *Untouched* is canon's word, and a press-to-fix portrait contradicts the noun. Preserving by **not acting** is what earns the stewardship thesis: one of your three jobs is to keep your hands off, which no other fight in the game has ever asked. |

**Why these three together are the fight:** they are mutually exclusive in space and in attention. You cannot hold the lantern and keep time at the song. Keeping the portrait clear means going *to* it to clear intruders and then *leaving*. Recession requires all three held at once (§6), so the finale is a triage problem whose difficulty knob is the geometry, not the enemy's HP — and its difficulty scales by moving three numbers, not by adding damage.

**Played-not-watched compliance is structural, not asserted:** all three are live inputs, and the ceremony engine's `hand`-phase rule (*no clock ever finishes this*) is the exact guarantee. Copy it, comment it the same way, and let the e2e idle-probe pattern (`e2e/ceremony-framework.spec.ts:318–324`: wait, assert nothing moved and nothing armed) gate all three.

**Input reality check:** the v0's verb is reached from `Game.confirmAction()` (`Game.ts:6887`) — the plain confirm key, no `?debug`, correct per Mistake #10 ✓ VERIFIED. All three verbs must keep that property, on desktop **and** at 390 px.

---

## 6. The RECESSION win condition (measurable)

Keep the v0's shape — it is right — and fix its scale.

**The condition.** `recessionProgress` rises only while **all three preserves are held simultaneously**, and decays otherwise:

```
allHeld  → recessionProgress += Δt / recessionHoldSeconds     (clamped to 1)
else     → recessionProgress -= recessionDecayPerSecond × Δt  (clamped to 0)
recessionProgress ≥ 1 → recede()
```

That is `E10StaticBossSystem.ts:239–245` as shipped, and it is the correct predicate: **the town wins by keeping all three at once, not by visiting them in turn.** What must change is the arithmetic around it, so that "at once" is a genuine plate-spin:

- **The hold a press buys must be shorter than the circuit that services all three.** Today it is 2.4× longer (§4.0), which is why the fight resolves on one pass. Target: one player, unopposed, can *just* hold all three with correct routing and no slack; under squall pressure, they cannot — which is what makes Q3 (a second pair of hands) a real design fork rather than a convenience.
- **Recession must take longer than one circuit** so that the win is a *sustained* state, not an instant.
- **Failure to hold costs progress, never the run** (subject to Q1): the decay term is the entire punishment, which is exactly the right tone for a fight whose thesis is out-living rather than defeating.

**The measurable exit, already wired ✓ VERIFIED:** `recede()` sets `act = 3`, `victory = 'receded'`, snaps the canvas to `grayscale(0)`, announces *"The Quiet does not die. It recedes. One mote remains: remember."*, and calls `onReceded()` → `runManager.secureCurrentRun(...)` (`Game.ts:1619`) → the shipped T10 re-inking → the Press → THE RIVER. `e2e/e10-static-boss.spec.ts:153–187` gates that whole handoff today. **Do not rebuild any of it.**

**The thing that is canon and does not exist: the keeping.** `jarredMote` is derived from `act === 3` (`:181`) and is forgotten on `reset()`. Kept things #1–#5 all persist through `TileStateStore` with their own entry ids (`dredge-queen-wreck`, `old-digger-gentle`, `salvage-claw-carcass`, `homemaker-9000-kept`, `the-echo-jar`). **Kept thing #6 — the mote in the jar labelled "remember" — has no persisted representation at all.** For a saga whose stated design law is *"the town KEEPS what it defeats, and each keeping is warmer than the last"* (`STORYBOOK.md:677`), the warmest keeping is the only one that isn't kept. This spec treats fixing that as non-negotiable (slice ST-05) and cheap.

---

## 7. Reuse map — what this gets for free, what is a gap, what must be new

**FREE — reuse, do not rebuild** (all ✓ VERIFIED at source):

| Capability | Where |
|---|---|
| The whole preserve-site/drain/hold/recession skeleton + no-kill diagnostics contract | `src/systems/E10StaticBossSystem.ts` (317 lines, shipped) |
| The four-act boss shape, `reset`/`dispose` hygiene, `visualY` render contract | same, and the eight sibling `*BossSystem.ts` house pattern |
| The win-gate veto (a boss that forbids auto-secure until its condition is met) | `Game.autoSecureWaveForRun()` `:4535–4542` |
| secure → payout → scoreboard → unlock chain | `RunManager.secureRun` → `awardSecuredClaim` → `recordScore` → `contractUnlockStatus` |
| The T10 re-inking, the Press, the playable RIVER, and the run→town handoff | `src/systems/E10FinaleSystem.ts` (render-only) + `e2e/e10-finale-staging.spec.ts` |
| Four of the five preserve verbs' input primitives, with pointer+keyboard+canvas binding and the played-not-watched guarantee | `src/ceremony/` (`hold`, `rhythm`+`rhythmContinues`, `timed-release`, `drive`, `typed-entry`) |
| Cross-run "kept object" persistence | `src/game/TileStateStore.ts` (`stageWrite` / `commitAtRunEnd` / `applyAtBirth`) |
| Enemy variants with per-variant tint/scale/behaviour flags; scripted movement | `EnemySpawnParams` (`Enemy.ts:33–59`), `scriptMoveTo` / `scriptMoveRoute` |
| Non-lethal outcomes (absorb-kill, HP floor, capture, pacify-and-pen, recede) | `OldDiggerBossSystem.enforceNoKillLaw`, `WrangleSystem.powerDown`, `EchoBossSystem.capture`, `E10StaticBossSystem.recede` |
| Disabling a specific building's shooter (the era-gating primitive's nearest relative) | `BuildSystem.setBuildingSuspended` `:1217`, already honoured by both shooter registrars |
| Balance retuning from e2e | `__GR_TEST__.setBalance(path, value)` — works on any flat scalar under `Balance.e10Static` |

**GAP — shipped but not enough for this design:**

- **Music.** *"The mix thins instrument by instrument"* is the sound-design thesis. What ships is **two GainNodes and one mono loop**: `musicGain` is a single scalar lerped by aura (`E10StaticBossSystem.ts:187–190`) applied to one of three era loops (`Game.ts:3382`). Per-stem thinning is specced as **MU-02 + MU-03** in `specs/music/README.md:10–13` and neither is built. The honest interim: crossfade N `music`-group loops via the existing `setLoop(name, on, volume)` and drop them one at a time. **The song preserve should not block on MU-03** — the rhythm verb works against one track.
- **Desaturation.** Shipped as `canvas.style.filter = grayscale(x)` — there is no `EffectComposer` and no render target anywhere in the repo; the one post pass is additive and alpha-clamped. This is fine and proven, but it is a single global property with **two uncoordinated writers already** (F-4).
- **The contract schema.** `preserveSites` reaches code through a cast (`Game.ts:1602–1605`) and is not on `ContractManifest`. `objectiveMetadata` in the same contract has **zero consumers**. `stakeMarkers[].lossCondition: true` is set on all three sites and is read by nothing that treats it as a loss condition ✓ VERIFIED — it feeds prop placement and hero spawn only.
- **The HUD.** No objective channel exists in `UiSnapshot`; preserve state reaches the player only as transient announcements (§4.0).

**MUST BE NEW:**

1. **Three distinct preserve verbs** (§5), of which "keep clear" is the only genuinely novel primitive.
2. **The squall behaviour** — an enemy that targets kept things instead of the hero or the buildings, and disperses into a restoration.
3. **Era-tag weapon gating in a radius.** Nothing shipped disables the player's own rig by proximity; the nearest relative is per-building suspension. This is the single largest engineering item and it is already the bundle's named prereq.
4. **The mote's persistence** — one `TileStateStore` entry id + payload + parser, following the five existing precedents exactly.
5. **A preserve action in the lockstep vocabulary** — *if and only if* Q3 says yes. Today `tryPreserve` is reached only through `confirmAction()` and is not a `LockstepAction`, so **no agent, no co-op partner and no playbook can hold a preserve** ✓ VERIFIED. E7's entire thesis cannot touch the saga's last fight until this exists.
6. **An objective HUD line** for the three preserves (Mistake #10).

---

## 8. The numbers' shape — `Balance.e10Static` v2 sketch

House style observed and matched: one flat camelCase block per subsystem, sim and visual constants together, units in the key name (`…Seconds` / `…PerSecond` / `…Radius` / `…Mult`), hex-string colours, **no `enabled` flag** (arming is by contract id), comments only for retune provenance. Marked **KEEP** (shipped, unchanged), **RETUNE** (shipped, new value), **NEW**.

```ts
  e10Static: {
    // ── arrival ────────────────────────────────────────────────
    arrivalZ: 36,                       // KEEP
    approachSeconds: 4,                 // KEEP
    squallArriveAct: 1,                 // NEW  — the boarding begins with act 1

    // ── the pressure ───────────────────────────────────────────
    meaningDrainPerSecond: 0.12,        // KEEP — base un-inking
    squallDrainMult: 3,                 // NEW  — while an unraveled machine stands in a preserve
    squallBlocksRefresh: true,          // NEW  — you must clear it before you can keep it

    // ── the three verbs ────────────────────────────────────────
    lanternHoldSeconds: 1.2,            // NEW  — hold to fill the flame (ceremony `hold`)
    songBeatIntervalSeconds: 0.9,       // NEW  — the Pan Theme's beat (ceremony `rhythm`)
    songBeatWindowSeconds: 0.42,        // NEW  — on-beat tolerance
    portraitClearRadius: 3,             // NEW  — nothing may enter, including the player
    preserveWindowSeconds: 4,           // RETUNE (was 8) — a hold must expire inside one circuit
    restorePerInteraction: 1,           // KEEP  — a tended thing is fully tended

    // ── the recession ──────────────────────────────────────────
    recessionHoldSeconds: 12,           // RETUNE (was 3) — the win is a sustained state
    recessionDecayPerSecond: 0.25,      // KEEP  — lapsing costs progress, never the run

    // ── the forgetting (act 2) ─────────────────────────────────
    forgetRadius: 18,                   // NEW  — matches auraRadius; era-gating lives here
    forgetEraIntervalSeconds: 6,        // NEW  — one era shuts down per interval, oldest first
    starlightPanExempt: true,           // NEW  — canon: it was never an invention

    // ── presentation (unchanged; render-only) ──────────────────
    maxGrayscale: 0.92, minMusicGain: 0.12,
    auraRadius: 18, auraRingWidth: 0.55, auraColor: '#ddd8cc',
    heartRadius: 2.2, heartHeight: 4.2, heartColor: '#f1eee5',
    siteMarkerHeight: 1.2, siteMarkerRadius: 0.42,
    siteHeldColor: '#d6a84c', sitePressedColor: '#77736d',
    moteRadius: 0.14, moteHeight: 0.8,
  },
```

**The shape of the tuning, stated as an invariant rather than as values** (values are a playtest's job, not a spec's):

> `preserveWindowSeconds` **<** (time to walk the three-site circuit) **<** `recessionHoldSeconds`

The first inequality is what makes it a plate-spin; the second is what makes the win a state you sustain rather than a lock you open. With the shipped geometry (20-unit circuit, `hero.speed 6.0` ⇒ 3.33 s) the sketch above reads `4 < 3.33 < 12` — **note the left inequality is not yet satisfied at 4 s**, which is deliberate: it says the geometry and the window must be tuned together, and the honest lever is probably **site spacing**, not the window. That is a playtest question, and it is the reason §9's ST-01 exists before any content slice.

**One hardcode to remove while in there:** the heart and mote render at a literal `z = 52` (`E10StaticBossSystem.ts:275`, `:280`) while the sites come from contract data. Either derive it from the sites' centroid or put it in the block.

---

## 9. Slices (lane-ready; each ends playable, each gated; **none of these are queued by this branch**)

- **ST-00 — REGISTER THE V0** (bookkeeping, no code): a review file for `4ca205b8` recording what shipped, plus a `tasks/goals.json` leaf for `lane-e10-static-boss.md` with `status: "merged"` and its mergeHash. **GATE:** `node scripts/drain-block-check.mjs tasks/lane-e10-static-boss.md --queue` prints **⛔ ALREADY SHIPPED**, not the current `? UNKNOWN`+exit 0. *(This is F-1's fix; see §11. It costs one commit and it removes a live Mistake-#8 landmine.)*
- **ST-01 — THE PLATE SPINS** (tuning + geometry only; no new systems): retune per §8, adjust site spacing until the invariant holds, and make `meaning` mean something or delete it. **GATE:** an e2e that walks (never teleports) at `Balance.hero.speed` and proves a single unopposed circuit **cannot** complete the recession; the existing 4 tests stay green; the win still routes to the T10 handoff.
- **ST-02 — THREE VERBS, NOT ONE** (§5): lantern-hold, song-rhythm, portrait-keep-clear, reusing the ceremony primitives. **GATE:** the ceremony battery's idle-probe pattern applied per verb — idle 2.5 s at each site, assert nothing advances and recession does not move; all three verbs work on desktop **and** 390 px with no `?debug`; zero console.
- **ST-03 — THE SQUALL** (§4.1): unraveled machines that target kept things, disperse into restorations, and never touch the hero. **GATE:** `heroDamageEvents === 0` across the whole fight; a dispersal increments `memoriesRestored`; `kills` is unchanged from before the fight (the v0's existing assertion, extended); the roster's un-ink mask renders.
- **ST-04 — THE FORGETTING** (§4.1 act 2): era-tag weapon gating inside `forgetRadius`, oldest-first, Starlight Pan exempt. **GATE:** a table proving each era's weapon stops inside the radius and resumes outside it, in learn-order; the Pan never stops.
- **ST-05 — KEPT THING #6** (§6): the mote persists via `TileStateStore` following the five precedents. **GATE:** recede → reload → the jarred mote is still there; a fresh profile has none.
- **ST-06 — WHERE THE PLAYER SEES IT** (Mistake #10): an objective channel in `UiSnapshot` rendering the three preserves' held state. **GATE:** a no-`?debug` e2e asserting all three read correctly in a plain boot, desktop + 390 px.
- **ST-07 — FOUR HANDS** *(only if Q3 = yes)*: `preserve_action` on `LockstepAction`, replayable, so an agent or a co-op partner can hold one. **GATE:** a recorded playbook holds a preserve on replay; co-op lockstep hashes match.

Every slice: tsc + build; its own e2e both projects; adjacent suites unmodified-green; zero console/page errors; screenshots; commit path-scoped.

---

## 10. Integration map

**Touches:** `src/systems/E10StaticBossSystem.ts` · `Balance.e10Static` · its `Game.ts` wiring seams (construct / sim tick / interact / secure gate / diagnostics) · `assets/contracts/epoch-10-deepsky/contracts.json` (`preserveSites`) · a new roster entry for the unraveled variants · `e2e/e10-static-boss.spec.ts` · `UiSnapshot` (ST-06 only) · `LockstepAction` (ST-07 only).

**NEVER touches:** CombatSystem's damage resolution · Economy · `activateEpoch()` (the one era-arming seam) · `TownScene` or anything that would make the hub a raidable scene (law §3.2) · the shipped `E10FinaleSystem` re-inking, the Press, or THE RIVER · determinism/fixed-step contracts · the ceremony registry's seven scripts.

---

## 11. Findings raised while drafting (each needs an owner or a fire; none is fixed by this branch)

- **F-1 (bookkeeping, live Mistake-#8 landmine) — the queue guard CLEARS the master whose code is on main.** ✓ VERIFIED: `node scripts/drain-block-check.mjs tasks/lane-e10-static-boss.md` returns `? UNKNOWN — no BLOCKED goal leaf matches` and **exit 0**, while `4ca205b8` is an ancestor of main. The tool prints the honest caveat (*"A missing leaf is a bookkeeping finding, not a clearance"*) but a fire following `/author-task` §0.1 mechanically is waved through into re-authoring 527 shipped lines. This is the standing "119 guarded, 524 bare" caveat (F-1116-1) with a live instance sitting on the finale. **Fix = ST-00, one commit.** It is also independent evidence for the mergeHash-ancestry class fix already named as the top authoring candidate (F-1117-1).
- **F-2 (process) — the v0 has no review file.** `reviews/` contains nothing for the static boss ✓ VERIFIED. Per CLAUDE.md §3 a done-move is not done; the code is real and gated, but its evidence was never written down. ST-00 closes this.
- **F-3 (design/contract) — `damageAccepted: 0` covers the boss, not the hero.** The literal-typed no-damage contract is one-directional today. §4.2 proposes making "the Static never damages the hero" a typed diagnostic too, so the law is machine-checked in both directions.
- **F-4 (architecture) — `canvas.style.filter` has two writers and no arbiter.** `E10StaticBossSystem.ts:294` and `E10FinaleSystem` coordinate via a comment at `E10StaticBossSystem.ts:197–199`. Any third writer (a weather effect, a damage flash, an accessibility toggle) silently clobbers the finale's re-inking. Cheap to fix now, expensive to diagnose later.
- **F-5 (art, pre-existing, already tracked) — the E10 roster art this design depends on is unlanded.** `char-e10-static_mote/static_squall/unraveled_machine-sheet-walk8` are the exact sheets ST-03 needs; per BACKLOG F-1044-2 they were fire-generated against an explicit instruction (*"the NOVEL Static/Quiet mechanic → attended/dedicated, do NOT fire-author"*), look batch-inconsistent, and are preserved on `save/art-staging-20260725` pending an **attended** QA pass. Flagging only: ST-03's art dependency and that owed pass are the same item.

---

## 12. Ratification questions (owner — batched, none blocks ST-00/ST-01)

**Q1. Can the player LOSE the last fight?** Today it is unlosable: nothing damages the hero, draining to zero has no consequence, and the run simply continues. Canon says you *out-live* the Quiet — and out-living implies you could fail to. Two coherent answers, and they are genuinely different games:
   **(a) UNLOSABLE** — the finale is a ceremony you perform; lapsing costs only progress (the decay term), so the last thing the saga asks of you is patience, not skill. Warmest, and consistent with a fight that has no damage in either direction.
   **(b) LOSABLE** — if all three lapse for `N` continuous seconds, the run ends and you re-enter. Makes the preserves matter and gives the squall teeth.
   *My recommendation: **(a), with the decay term tuned hard enough to sting.*** The saga's last beat is the town's habit of keeping; a fail-screen on the habit reads as punishment, and the tone the whole arc has earned is "you kept it" rather than "you passed."

**Q2. Do the three preserves play differently (§5), or is one verb ×3 acceptable?** Three verbs is more code (roughly one slice), more to teach in the last hour of a long game, and more to get wrong on mobile. One verb ×3 is what ships today and is cheap. But the canon's whole reason for naming light, song and memory is that they are three different kinds of keeping, and a fight in which they are identical says they were interchangeable.
   *My recommendation: **three verbs**, and specifically that the portrait's verb is "don't touch it" — that inversion is the moment the stewardship thesis stops being a slogan.*

**Q3. Whose hands may hold a preserve — only the player's, or may an agent or a co-op partner hold one?** This decides whether `preserve_action` enters the lockstep vocabulary (ST-07), and it is a story question as much as a systems one. **For:** E7's whole thesis is that the town built minds to help, and the finale is where ten eras of that would pay off — three jobs, two or more pairs of hands, delegation as the last mechanic. **Against:** the saga's final image is *four hands on one lever* — the player's, through the hero's, through the child's. There is a real argument that the last thing you keep, you keep yourself.
   *My recommendation: **yes, allow it, and make it a choice rather than a default*** — the agent can hold the song (the one that is pure rhythm) if you ask, and the game notices which you handed over. But this is the question I am least willing to answer for you: it is a statement about what the ending means.

---

## READY-FOR-GATES

**Deliverable:** this document. **Diff scope:** one new file under `specs/`. Zero `src/`, zero `e2e/`, zero gameplay, zero queue changes, zero BACKLOG edits (main is under a live fire lock; the ledger line below is written for whoever drains this). Verifiable by `git diff --name-only main...HEAD` listing exactly `specs/e10-static-mechanic-DRAFT.md`.

**Ledger line for the drain (paste into BACKLOG under the E10 thread):**
> **THE STATIC — finale mechanic DRAFT authored (attended, 2026-07-27)** — `specs/e10-static-mechanic-DRAFT.md`. **Found the premise stale: a v0 SHIPS** (`4ca205b8`, 2026-07-19, ancestor of main, 527 lines) and is winnable in ~6.3 s unopposed; spec measures it, designs the fight end-to-end (squall → forgetting → three distinct verbs → sustained recession), sketches `Balance.e10Static` v2, and ladders 8 slices. **5 findings incl. F-1: the queue guard returns exit 0 on `lane-e10-static-boss.md` while its code is on main — a live Mistake-#8 landmine, fix = ST-00.** 3 owner questions open (losable? · three verbs? · may an agent hold one?). **Does not ship until E10 approaches release.**

---

### THE PITCH — one paragraph, for a yes or a no

The saga's last enemy is a want with no object, and the only way to beat a want is to outlast it — so the finale is the one fight in Gold Rush with no damage in either direction. The Static never touches the hero; it reaches for the three things the town keeps, and its foot soldiers are every enemy you ever beat, come back grey at the edges, walking past you to stand in your lantern's light. Your arsenal shuts down oldest-first as the heart closes in, until you are finishing ten eras of history with the newest science in one hand and the pan — which entropy cannot forget, because it was never an invention — in the other. And the winning move is three small jobs you cannot do at once: **hold** the lantern (presence), **keep time** with the Pan Theme (the melody the game has been giving you since the main menu, now a thing you give back), and **keep clear** of the portrait — the one job in the whole game you do by not acting. Hold all three together, long enough, and the Quiet does not die. It recedes, the color climbs the rigging, and the town puts a pinch of the void in a jar labelled *remember*. **A v0 of this already runs on main; it takes about six seconds and nothing opposes you. This spec is the fight that six seconds was a placeholder for — and the three questions at the bottom are the ones I need you, not me, to answer.**
