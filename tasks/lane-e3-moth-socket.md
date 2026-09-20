CODEX: model=gpt-5.6-sol effort=xhigh

# lane-e3-moth-socket — make Moth Season's light trade visible to agents (cures F-ER01-E3-2)

**FIRE-AUTHORED s1468 (attended review welcome).** Third instance of the ERA-SOCKET class. The template is `tasks/lane-e3-voltage-socket.md` (s1466-authored, drained clean at `9af152ab`); its predecessor `tasks/lane-e2-pressure-socket.md` drained at `6fd24a3b`. **Read `reviews/e3-voltage-socket.md` before you start** — it is the same sim, one slice earlier, and it already socketed half of your dependencies.

ROLE: implementer on lane-a. WORKDIR: `worktrees/lane-a` (branch `lane/a`). Commit prefix `msock:`. Never touch STATUS.md, reviews/, tasks/queue/, other lanes.

## PRE-FLIGHT — DO THESE IN ORDER. STEP 1 IS MANDATORY AND UNCONDITIONAL.

**F-1465-2 (2026-08-05) exists because a master offered the refresh as a conditional and put a currency probe beside it; the runner ran the probe first against a stale lane and truthfully reported "stale lane" about a lane that was one command from correct — 27,551 tokens, zero edits. The probe below CANNOT distinguish "the lane is stale" from "I asked too early". So the refresh is not a conditional. Do step 1, then step 2.**

**STEP 1 — REFRESH (unconditional, run exactly this):**
```
git -C worktrees/lane-a fetch origin main
git -C worktrees/lane-a checkout -B lane/a origin/main
```

**STEP 2 — CURRENCY PROBE (only after step 1):**
```
grep -c "rather than treating generic combat as Moth Season" docs/bench/e3-readiness-census.md
```
Expect **1**. If **0**, step 1 did not take — STOP and report "refresh did not land", do NOT report a stale lane.
*(This key was measured to return exactly 1 on main at authoring time, per F-1425-2. It is deliberately apostrophe-free and sits on a single line: `grep` is line-oriented and prose wraps, so a key spanning a line break matches nowhere — including in the file it was copied from.)*

**STEP 3 — SAFE-DUPE:**
```
grep -c "MothSwarm" src/sim/HeadlessContractSim.ts
```
Expect **0**. If **≥1**, a moth consumer is already socketed — STOP and report; do not re-derive.

**STEP 4 — LANE SAFETY:** `git branch --show-current` = `lane/a`. Any dirty *tracked* blob not reachable in git → STOP.
⚠️ **FACTORY-CHURN EXCEPTION (F-1407-1 / F-1266-1):** modifications under `logs/**` and `artifacts/**` are the factory's own background churn and are **NOT** lane dirt. Ignore them in step 4; they must never STOP this run.

## WHY

`docs/bench/e3-readiness-census.md` F-ER01-E3-2, verbatim:

> The browser runs `MothSwarm` against live light sources under the locked night cycle; GR-SIM runs neither the swarm behavior nor the light-state consumer. The manifest consequently exposes only generic build zones, so an agent cannot observe or choose the decoy-versus-radius trade the contract is about. The attended fix master must socket those production rules and derive their vocabulary/actions rather than treating generic combat as Moth Season.

The census records **AGENT-READY: 1 of 4** for E3. Blackout Ridge got there via the Voltage socket; Moth Season is the next and it is the **cheapest of the three remaining**, because its twist is `secureWave, dayNightCycle, mothSeason, enemyRoster` and **`dayNightCycle` is already socketed** by `9af152ab`. Only the `mothSeason` half is missing.

ⓘ *On "the attended fix master": the E2 census used that identical phrasing and fire s1460 authored `lane-e2-pressure-socket` against it anyway, which drained at `6fd24a3b`; s1466 did the same for E3-1, which drained at `9af152ab`. The phrase is census boilerplate meaning "not ER-01's job", **not** an owner gate. Verified again s1468 by re-reading the census.*

## READ-FIRST

1. `docs/bench/e3-readiness-census.md` — F-ER01-E3-2 verbatim (quoted above); **your acceptance is its reversal.** Read F-ER01-E3-3/-4 too, but only so you can firewall them out — they are NOT yours.
2. `tasks/lane-e3-voltage-socket.md` + `reviews/e3-voltage-socket.md` — the template and how it was gated. **Mirror its structure, including its honesty clause about zero new operations.**
3. `src/systems/MothSwarm.ts` — the truth you derive from. `export class MothSwarm` at `:23`; `MothTargetingConfig` `:18` (`radiusWeight`, `attachDamagePerSecond`); `update(delta, sources, enemies)` `:73`; `isMothSwarmEnemy` `:186`.
4. `src/systems/LightField.ts` — `LightSource` `:1`, with `radius` `:6` and the optional `targetWeight` `:8`. `coverageAt` is the field query `MothSwarm` is constructed against.
5. `src/game/Game.ts` — the browser's construction + tick order. **Mirror it; a divergent order is a determinism bug you would be shipping deliberately.** `LightField` `:662` · `MothSwarm` `:667` with `coverageAt` bound at `:670` · **the tick site `:2601`** (`mothSwarm.update(simDelta, this.mothLightSources, this.enemies.all)`) · the contract hook `spawnMoths` `:1944` · `mothLightSources` declared `:681`, **filtered `:5461`**, and the per-wave count computed `:4996`.
6. `specs/agent-play/README.md` §AP-11 — vocabulary is **DERIVED from consumers, never invented**. Rules describe what the sim does; operations exist only where the player has a real lever.
7. `src/sim/HeadlessContractSim.ts` — how the Voltage socket wired `DayNightCycle` (`:236-239`, sampled `:410`) and `PowerGraphSystem` (`:234`). **That is your pattern, and the `dayNightCycle` half of your twist is already done.**
8. `assets/contracts/epoch-3-voltage/contracts.json` — `e3-moth-season` twist is `secureWave, dayNightCycle, mothSeason, enemyRoster` (verified s1468). It carries **no `powerGrid`**, which is exactly why PowerGraph stays out of your scope.

## THREE THINGS I MEASURED SO YOU DO NOT HAVE TO RE-DERIVE THEM

These were verified by reading the files on main at authoring time. **Verify them yourself before relying on them** — but they are where the slice's real risk is, and you should not spend budget rediscovering them.

1. **The trade the census names is a single expression.** `MothSwarm.ts:83`:
   `targetScore = coverageAt(source.x, source.z) * source.radius * config.radiusWeight * (source.targetWeight ?? 1)`
   and `:84` picks the **highest-scoring** source, tie-broken by `a.id.localeCompare(b.id)`. Moths then attach and damage that source (`:115`, `attachDamagePerSecond`). **`radius` is the cost side and `targetWeight` is the decoy side** — a small-radius, high-`targetWeight` light pulls the swarm off a large one. That *is* "the decoy-versus-radius trade the contract is about". Derive your vocabulary from this expression, not from a paraphrase of it.
2. **More light means more moths.** `Game.ts:5461` filters the swarm's inputs to `source.kind === 'lantern' || source.kind === 'powered-lamp'`, and `:4996` sets the per-wave count to `max(2, floor(max(1, mothLightSources.length) * config.mothsPerLightPerWave))`. Lighting up is therefore **not free**, and that consequence belongs in the derived RULES.
3. **`matchMedia` in this file is a red herring — do NOT route it through the seeded source.** `motesPerSwarm` (`:29`) reads `globalThis.matchMedia?.(...)`, which looks exactly like the determinism seam the Voltage socket had to fix in `PressureSystem`. It is not: its **only** consumer is `syncVisuals()` at `:167`, which writes instance matrices. It is render-only and cannot reach the event log. The tie-break at `:84` is already a deterministic string compare. **If you find a real entropy seam, fix it and say so; do not "fix" this one.**

## SCOPE — Moth Season ONLY

1. **`HeadlessContractSim` runs the moth consumer** for contracts whose twist carries `mothSeason` — the swarm behaviour *and* the light-state consumer it reads, in the browser's tick order (READ-FIRST item 5). The `dayNightCycle` sampling it depends on already exists; **use it, do not duplicate it.**
2. **Determinism:** two consecutive headless runs of `e3-moth-season` on a pinned seed produce identical event-log hashes. If an id/entropy source poisons the hash, route sim-context ids through the seeded source — the smallest change that keeps browser behaviour byte-identical. (See measured note 3: check for a *real* seam rather than assuming `matchMedia` is it.)
3. **Manifest** — `e3-moth-season` derives:
   (a) **RULES**: what draws the swarm (the `:83` score, in its own terms), what it costs to be lit (measured note 2), what attaching does to a light, and what the locked night contributes.
   (b) **OPERATIONS**: only real levers. Lantern/lamp placement rides the existing BUILD grammar — ensure any light-bearing building appears in derived buildables **with its moth meaning attached**, since that is the whole choice. **If the consumer analysis finds NO new player lever, say so: zero new operations with complete rules is a VALID outcome. "The vocabulary is honest" beats "the vocabulary is long."**
4. **Census re-run for `e3-moth-season` only:** admit it to `SUPPORTED_CONTRACTS`, re-run ER-01's probes, UPDATE its row in `docs/bench/e3-readiness-census.md`, and retire **F-ER01-E3-2 only** as CURED — **keep the original text and banner it (RETENTION LAW; do not delete).** The headline currently reads `AGENT-READY: 1 of 4` and `DATA-GAP: 3 of 4`; **leave that arithmetic correct after your change** (it should become 2 of 4 and 2 of 4), including the summary bullets that name which contracts remain rejected and why.
5. **e2e:** extend `e2e/er01-e3-census.spec.ts` — moth-season headless-boots, the determinism pair holds, the manifest carries the moth/light rules, **and the other two contracts stay rejected on their exact declared-but-unrepresented twist sources.** **Machine-independent asserts only** (no wall-clock thresholds; see F-1440-2).

## TOUCH-ONLY

`src/sim/HeadlessContractSim.ts` · the manifest generator · `src/systems/MothSwarm.ts` and `src/systems/LightField.ts` **ONLY** for an id/entropy seam (browser behaviour byte-identical) · `docs/bench/e3-readiness-census.md` · `e2e/er01-e3-census.spec.ts` · `tasks/BACKLOG.md` + `tasks/goals.json` (goal-leaf receipt, same commit).

## NO

Balance values · invented moth/light verbs beyond derived truth · **F-ER01-E3-3 (Canyon Works — crawler/tram/baron/`lightRamp`/`powerGrid`)** · **F-ER01-E3-4 (Fairground — wheel + the missing crowd-flock objective, which the census says must be authored on its own governed surface)** · re-deriving the Voltage socket (`PowerGraphSystem` is **not** in your twist) · E4+ sockets · `src/game/Game.ts` (READ it for tick order; do not edit it) · `Terrain3dClaimPilot.ts` · the `syncVisuals`/`InstancedMesh` render path.

## SELF-CHECK

- `npx tsc --noEmit` clean · `npm run build` green
- `npm run test:node-guards` green — **this slice touches `src/sim/` and `src/systems/`, so the cross-cutting sim guards are mandatory, not optional (F-1460-1).** If `scripts/gr-sim.test.mjs` reds, that is a **FINDING with a named cause**, never a re-pin reflex (F-1441-3).
- `e2e/er01-e3-census.spec.ts` green **both projects** (desktop + 390px)
- E1/E2 driver suites green **UNMODIFIED** — you must not move E2's or Blackout Ridge's numbers
- browser behaviour byte-identical: an e3 boot probe with **zero console/page errors**

READY-FOR-GATES. **Report:** the derived rules verbatim · the operations verdict (call out the no-new-levers case explicitly if that is the answer) · the id/entropy-source decision **and whether measured note 3 held** · the updated census row and headline arithmetic · and anything you found in E3-3/-4 that the next socket master should know (report it, do not fix it).
