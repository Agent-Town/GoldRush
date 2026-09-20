CODEX: model=gpt-5.6-sol effort=xhigh

# lane-e3-canyon-environment — socket Canyon Works' wave-driven darkness + connect objective (narrows F-ER01-E3-3)

**FIRE-AUTHORED s1470 (attended review welcome).** Fourth instance of the ERA-SOCKET class. Templates: `tasks/lane-e3-moth-socket.md` (drained `bfeca043`) and `tasks/lane-e3-voltage-socket.md` (drained `9af152ab`); the class opener was `tasks/lane-e2-pressure-socket.md` (`6fd24a3b`). **Read `reviews/e3-moth-socket.md` before you start.**

⚠️ **THIS SLICE DELIBERATELY DOES NOT ADMIT `e3-canyon-works`, AND THAT IS THE POINT.** s1470 measured the contract's consumers one by one and found them to be **two slices, not one**: an environment half that is a clean socket (yours) and a Crawler-boss half that is a *refactor* of render-coupled code (NOT yours — measured note 6). Admitting the contract before the Crawler runs would be exactly the vocabulary stretch the ERA-SOCKET LAW forbids. **Your census row stays DATA-GAP and the headline arithmetic stays `AGENT-READY: 2 of 4`.** Success here is a *narrowed, honest* gap, not a promotion.

ROLE: implementer on lane-a. WORKDIR: `worktrees/lane-a` (branch `lane/a`). Commit prefix `csock:`. Never touch STATUS.md, reviews/, tasks/queue/, other lanes.

## PRE-FLIGHT — DO THESE IN ORDER. STEP 1 IS MANDATORY AND UNCONDITIONAL.

**F-1465-2 exists because a master offered the refresh as a conditional and put a currency probe beside it; the runner ran the probe first against a stale lane and truthfully reported "stale lane" about a lane that was one command from correct — 27,551 tokens, zero edits. The probe below CANNOT distinguish "the lane is stale" from "I asked too early". So the refresh is not a conditional. Do step 1, then step 2.**

**STEP 1 — REFRESH (unconditional, run exactly this):**
```
git -C worktrees/lane-a fetch origin main
git -C worktrees/lane-a checkout -B lane/a origin/main
```

**STEP 2 — CURRENCY PROBE (only after step 1):**
```
grep -c "compose the Voltage socket with the Crawler/tram objective before deciding whether" docs/bench/e3-readiness-census.md
```
Expect **1**. If **0**, step 1 did not take — STOP and report "refresh did not land", do NOT report a stale lane.
*(Measured to return exactly 1 on main AND in the refreshed lane at dispatch time, per F-1425-2. Deliberately apostrophe-free and on a single physical line: `grep` is line-oriented and prose wraps, so a key spanning a line break matches nowhere — including in the file it was copied from.)*

**STEP 3 — SAFE-DUPE:**
```
grep -c "waveSchedule" src/sim/HeadlessContractSim.ts
```
Expect **0**. If **≥1**, a wave-darkness path is already socketed — STOP and report; do not re-derive.

**STEP 4 — LANE SAFETY:** `git branch --show-current` = `lane/a`. Any dirty *tracked* blob not reachable in git → STOP.
⚠️ **FACTORY-CHURN EXCEPTION (F-1407-1 / F-1266-1):** modifications under `logs/**` and `artifacts/**` are the factory's own background churn and are **NOT** lane dirt. Ignore them in step 4; they must never STOP this run.

## WHY

`docs/bench/e3-readiness-census.md` F-ER01-E3-3, verbatim:

> The shared component-Baron machinery can represent a grouped kill, but the browser's Canyon Works also runs `PowerGraphSystem`, `MothSwarm`, the tram, and `CrawlerBossSystem` power effects; GR-SIM runs none of those contract-defining consumers. Its partial manifest names darkness and the Baron but offers no power/moth action path. The attended fix master must compose the Voltage socket with the Crawler/tram objective before deciding whether the existing generic boss driver can be reused.

**That finding asks a question, and s1470 answered half of it by measurement.** Of Canyon Works' twist keys — `dayNightCycle` (with `waveSchedule`), `lightRamp`, `mothSeason`, `powerGrid` (with `connect`), `baron`, `enemyRoster` — **three consumers are already socketed** (`PowerGraphSystem` by `9af152ab`, `MothSwarm`+`LightField` by `bfeca043`, `DayNightCycle` by both). What is genuinely missing splits cleanly:

| Twist key | Class | Owner |
|---|---|---|
| `dayNightCycle.waveSchedule` | **SIMULATION** — drives darkness → light coverage → moth spawn gate | **YOU** |
| `powerGrid.connect` | **SIMULATION** — objective + secure gate | **YOU** |
| `lightRamp` | **RENDER-ONLY under this contract's config** (measured note 1) | **nobody — do not socket** |
| `baron` / `CrawlerBossSystem` | refactor, not a socket (measured note 6) | **the NEXT master** |

ⓘ *On "the attended fix master": the E2 census used that identical phrasing and fire s1460 authored `lane-e2-pressure-socket` against it anyway, which drained at `6fd24a3b`; s1466 and s1468 did the same for E3-1 and E3-2, which drained at `9af152ab` and `bfeca043`. The phrase is census boilerplate meaning "not ER-01's job", **not** an owner gate. Verified again s1470 by re-reading the census.*

## READ-FIRST

1. `docs/bench/e3-readiness-census.md` — F-ER01-E3-3 verbatim (quoted above). Read F-ER01-E3-4 too, but **only so you can firewall it out** — Fairground is NOT yours.
2. `tasks/lane-e3-moth-socket.md` + `reviews/e3-moth-socket.md` — the template and how it was gated. **Mirror its structure, including its honesty clause about zero new operations.**
3. `src/game/Game.ts` — `nightShiftLightingState()`, the `waveSchedule` branch. **This is the formula you must reproduce exactly.** Find it by content: `const waveSchedule = this.activeContract.twist.dayNightCycle?.waveSchedule;` (~`:5490`). Note it **returns before** `if (this.dayNightCycle)` ever samples the cycle.
4. `src/game/Game.ts` — `canyonConnectDiagnostics()` (~`:5904`) and `syncCanyonConnectObjective()` (~`:5919`), plus the two secure gates: `autoSecureWaveForRun()` (~`:4844`) and the baron-defeat `objectiveAllowsSecure` (~`:5111`).
5. `src/systems/DayNightCycle.ts` — the whole file (98 lines). **Its config type has NO `waveSchedule` field**; the key rides along and is silently ignored. That is why the browser short-circuits instead of extending the class.
6. `src/sim/HeadlessContractSim.ts` — the socket you are extending. Construction of `DayNightCycle` (~`:243`) and the per-tick sample + `syncMothLightState()` (~`:442`); `autoSecureWaveForRun` (~`:312`); `contractPowerDefinition` (~`:822`); the admission guard (~`:179`).
7. `specs/agent-play/README.md` §AP-11 — vocabulary is **DERIVED from consumers, never invented**. Rules describe what the sim does; operations exist only where the player has a real lever.
8. `src/agent/MechanicsManifest.ts` — the `darkness_cycle` rule (~`:68`) and the `voltageSocket` gate (~`:111`). **Read measured note 5 before you touch either.**

## SIX THINGS I MEASURED SO YOU DO NOT HAVE TO RE-DERIVE THEM

Verified by reading the files on main at authoring time. **Verify them yourself before relying on them** — but they are where this slice's real risk is, and you should not spend budget rediscovering them.

1. **`lightRamp` is RENDER-ONLY for this contract — do NOT socket it.** In the `waveSchedule` branch, `darkness` is computed **entirely** from `waveSchedule` + `nightDepth`; `lightRamp` contributes only an optional `palette`, and `palette` is consumed solely by `src/world/LightRig.ts` (background/fog/sun/fill colours, sprite tint) — pure three.js scene state. ⚠️ **Do NOT generalise this into "lightRamp is always render-only":** in the branch for contracts with **no** `dayNightCycle`, `lightRamp` keyframes *do* drive sim darkness (`darkness: palette.darkness`) — that is `e1-night-shift`. Canyon Works has a `dayNightCycle`, so it never reaches that branch. `grep -rn lightRamp src/sim/` returns **nothing today, and must still return nothing when you are done.**
2. **There is a LIVE DIVERGENCE today, and it is the reason this slice exists.** `HeadlessContractSim` samples `this.dayNightCycle?.sample(this.timeAlive)` — by **time**. Canyon Works' cycle is `periodSeconds:120, duskRamp:30, dawnRamp:20, nightDepth:1` and **has no `nightLocked`**, so the headless sim would produce a *time* cycle oscillating full→dusk→dark→dawn every 120 s, while the browser produces a **monotonic wave ramp that never returns to full**. Same config, two different darknesses. Your job is to make headless agree with the browser.
3. **The connect objective's exact semantics.** `required` counts consumer nodes with `role: 'gallery'` in `PowerNodeState` `'powered'` — Canyon Works has exactly two galleries and `required: 2`, `byWave: 6`. The latch is **one-way**: once `canyonConnectFailed` is set (wave passes `byWave` with the requirement unmet) nothing re-clears it inside a run, and the run becomes **unsecurable forever** — `autoSecureWaveForRun()` returns `Number.MAX_SAFE_INTEGER`. Only `resetRun` clears the three fields. Mirror that shape; do not soften it.
4. ⚠️ **`objectiveAllowsSecure` is BROADER than `connect`, and you must mirror it exactly rather than "fix" it.** The baron-defeat path reads `!this.activeContract.twist.powerGrid || this.canyonConnectCompletedByDeadline` — i.e. it keys on **any `powerGrid`**, not on `powerGrid.connect`. That is a wider condition than the `autoSecureWaveForRun` disjunct beside it, which keys on `powerGrid?.connect`. It is harmless today (the only E3 contract with both a `powerGrid` and a `baron` is Canyon Works), but it is an inconsistency. **Reproduce the browser's behaviour byte-for-byte and REPORT the inconsistency as a finding — do not repair it in this slice.** A behaviour change smuggled into a socket is not a socket.
5. **The manifest already advertises a dawn the sim never delivers — resolve this honestly.** `MechanicsManifest.ts` emits `darkness_cycle` from **`twist.lightRamp`**, publishing `duskWave/darkWave/**dawnWave**`. Canyon Works' `lightRamp` declares `dawnWave: 12` — but the `waveSchedule` sim path computes `phase = wave < duskWave ? 'full' : wave < darkWave ? 'dusk' : 'dark'` and clamps `progress` to 1, so **it never returns to `full` or `dawn`**: after wave 8 darkness sits at `nightDepth` permanently. An agent reading that manifest would plan for a dawn at wave 12 that never comes. Fix the **rule's derivation** so it describes what the sim actually does for `waveSchedule` contracts (source it from the consumer, per AP-11), and say so in your report. ⚠️ Do **not** touch the `voltageSocket` power-vocabulary gate at `~:111` (`contract.id === 'e3-blackout-ridge'`) — generalising it belongs to the slice that admits Canyon Works.
6. 🚫 **THE CRAWLER IS NOT SOCKETABLE AND IS NOT YOURS. Measured, so you do not have to discover it the expensive way:**
   - `CrawlerBossSystem` calls **bare `document.querySelector('canvas')`** inside `publishCrawler3d()` (~`:492`), reached from its **constructor** and from every `update()`. In Node that is a `ReferenceError` before the first tick — `scripts/gr-sim.test.mjs` stubs `location`/`window`/`localStorage` but **not `document`**.
   - `update()` triggers `ensureCrawler3d()`, which does an **async dynamic `import()` + GLB fetch**; resolution is not tick-anchored, so state transitions land on arbitrary sim ticks — a determinism hole.
   - The power drain (`syncDrainTarget`, the only thing that ever brings a `crawler-drain` node online) is reachable **only through `syncPresentation`**, alongside mesh/beam code. Separating them is a refactor of that system, not a socket.
   - **Budget:** `advanceToTurn` sizes ticks as `(secureWave + 2) * waveInterval`; Canyon Works has `secureWave: 12` but `baron.wave: 14`, and securing is blocked until the baron dies — so a full run-to-secure **cannot terminate today**. That is the next slice's problem. **Do NOT change the tick budget** — it is shared with every other contract.
   ➡️ **Therefore your spec must NOT attempt a run-to-secure.** Step waves directly and assert on the stepped state (scope item 5).

## SCOPE — the environment and the objective ONLY

1. **Wave-driven darkness.** For any contract whose `twist.dayNightCycle` carries a `waveSchedule`, `HeadlessContractSim` computes its `dayNightSnapshot` from the **wave number** using the browser's formula, instead of sampling the cycle by time — at the **same tick site** the sample happens today, so ordering versus `syncMothLightState()` is unchanged. The snapshot's fields (`phase`, `darkness`, `phaseProgress`, `cycleProgress`, `cycle`, `simTime`) must match what the browser builds. *(A plain `Math.max(min, Math.min(max, v))` is identical to the browser's `THREE.MathUtils.clamp`; do not add a three import to `src/sim` for this.)*
2. **The connect objective.** Mirror `canyonConnectDiagnostics` + `syncCanyonConnectObjective` into the headless sim — evaluated at the same point relative to `powerGraph.step()` as the browser — and wire **both** secure gates: the `autoSecureWaveForRun` disjunct and the baron-defeat `objectiveAllowsSecure` condition (measured note 4: mirror, report, do not repair). The announcement string is a UI concern: **do not invent an announce sink**; the *latch* must be observable in the event log or the snapshot, since that is what makes it an objective an agent can plan against.
3. **Manifest honesty (measured note 5).** Derive the darkness rule from what the sim does for `waveSchedule` contracts, and derive a connect-objective rule from `twist.powerGrid.connect` (galleries required, deadline wave, and that missing it makes the run unsecurable). **Zero invented operations** — the player's levers here are the existing power BUILD/repair grammar, not new verbs. **If the consumer analysis finds NO new player lever, say so: zero new operations with complete rules is a VALID outcome. "The vocabulary is honest" beats "the vocabulary is long."**
4. **Determinism:** two consecutive headless runs of the same stepped scenario on a pinned seed produce identical event-log hashes.
5. **e2e:** extend `e2e/er01-e3-census.spec.ts` — Canyon Works' headless darkness follows the wave ramp at named waves (including that it does **not** return to `full` after `darkWave`), the connect latch completes when the galleries are powered by the deadline and fails when they are not, the determinism pair holds, **and Blackout Ridge / Moth Season stay admitted with their pins unmoved while Fairground stays rejected on its exact declared-but-unrepresented twist sources.** **Machine-independent asserts only** (no wall-clock thresholds; F-1440-2). Boot Canyon Works the way the sim already permits (it declares a mode, which is the legal bypass of the admission guard) — **do not add it to `SUPPORTED_CONTRACTS`.**
6. **Census.** In `docs/bench/e3-readiness-census.md`, **narrow** F-ER01-E3-3's stated gap to name only what genuinely remains (the Crawler consumer), and update the Canyon Works row's reason to match. **Keep the verdict DATA-GAP and keep the headline `AGENT-READY: 2 of 4` / `DATA-GAP: 2 of 4` arithmetic exactly as it is.** **Keep the original finding text and banner your narrowing beneath it (RETENTION LAW; do not delete.)**

## TOUCH-ONLY

`src/sim/HeadlessContractSim.ts` · `src/agent/MechanicsManifest.ts` (the darkness/connect rules ONLY) · `docs/bench/e3-readiness-census.md` · `e2e/er01-e3-census.spec.ts` · `tasks/BACKLOG.md` + `tasks/goals.json` (goal-leaf receipt, same commit).

## NO

`src/systems/CrawlerBossSystem.ts` · `src/game/Game.ts` (READ it for the formula and the gates; **do not edit it**) · `src/systems/DayNightCycle.ts` (the browser deliberately short-circuits around it — do not add `waveSchedule` to the class) · `src/systems/PowerGraph.ts` · adding `e3-canyon-works` to `SUPPORTED_CONTRACTS` · the `advanceToTurn` tick budget · the `voltageSocket` power-vocabulary gate in `MechanicsManifest.ts` · `lightRamp` in `src/sim/**` (measured note 1) · **F-ER01-E3-4 (Fairground — wheel + the missing crowd-flock objective, which the census says must be authored on its own governed surface)** · Balance values · repairing the `objectiveAllowsSecure` inconsistency (measured note 4) · E4+ sockets.

## SELF-CHECK

- `npx tsc --noEmit` clean · `npm run build` green
- `npm run test:node-guards` green — **this slice touches `src/sim/`, so the cross-cutting sim guards are mandatory, not optional (F-1460-1).** If `scripts/gr-sim.test.mjs` reds, that is a **FINDING with a named cause**, never a re-pin reflex (F-1441-3).
- `e2e/er01-e3-census.spec.ts` green **both projects** (desktop + 390px)
- E1/E2 driver suites green **UNMODIFIED** — you must not move E2's, Blackout Ridge's or Moth Season's numbers
- browser behaviour byte-identical: an e3 boot probe with **zero console/page errors**
- `grep -rn "lightRamp" src/sim/` still returns **nothing**

READY-FOR-GATES. **Report:** the darkness formula you reproduced and the evidence it matches the browser's · the connect latch's observable surface · **whether measured notes 1–5 held** · the manifest rules verbatim and the operations verdict (call out the no-new-levers case explicitly if that is the answer) · the `objectiveAllowsSecure` inconsistency as a finding · the updated census wording and confirmation the headline arithmetic is **unchanged** · and anything about the Crawler half the next socket master should know (report it, do not fix it).
