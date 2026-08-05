CODEX: model=gpt-5.6-sol effort=xhigh

# lane-e3-voltage-socket — make E3's signature mechanic visible to agents (cures F-ER01-E3-1)

**FIRE-AUTHORED s1466 (attended review welcome).** Second instance of the ERA-SOCKET class; the template is `tasks/lane-e2-pressure-socket.md`, which a fire (s1460) authored and which drained clean at `24c6600f` — read its review `reviews/e2-pressure-socket.md` before you start.

ROLE: implementer on lane-a. WORKDIR: `worktrees/lane-a` (branch `lane/a`). Commit prefix `vsock:`. Never touch STATUS.md, reviews/, tasks/queue/, other lanes.

## PRE-FLIGHT — DO THESE IN ORDER. STEP 1 IS MANDATORY AND UNCONDITIONAL.

**F-1465-2 (2026-08-05) exists because a master offered the refresh as a conditional and put a currency probe beside it; the runner ran the probe first against a lane 44 commits behind, and truthfully reported "stale lane" about a lane that was clean and one command from correct — 27,551 tokens, zero edits. The probe below CANNOT distinguish "the lane is stale" from "I asked too early". So the refresh is not a conditional. Do step 1, then step 2.**

**STEP 1 — REFRESH (unconditional, run exactly this):**
```
git -C worktrees/lane-a fetch origin main
git -C worktrees/lane-a checkout -B lane/a origin/main
```

**STEP 2 — CURRENCY PROBE (only after step 1):**
```
grep -c "F-ER01-E3-1 — Blackout Ridge has no agent-visible current" docs/bench/e3-readiness-census.md
```
Expect **1**. If **0**, step 1 did not take — STOP and report "refresh did not land", do NOT report a stale lane.

**STEP 3 — SAFE-DUPE:**
```
grep -c "PowerGraph" src/sim/HeadlessContractSim.ts
```
Expect **0**. If **≥1**, a power consumer is already socketed — STOP and report; do not re-derive.

**STEP 4 — LANE SAFETY:** `git branch --show-current` = `lane/a`. Any dirty *tracked* blob not reachable in git → STOP.
⚠️ **FACTORY-CHURN EXCEPTION (F-1407-1 / F-1266-1):** modifications under `logs/**` and `artifacts/**` are the factory's own background churn and are **NOT** lane dirt. Ignore them in step 4; they must never STOP this run.

## WHY

`docs/bench/e3-readiness-census.md` F-ER01-E3-1 (merged `0c4168a2`), verbatim:

> The browser constructs `PowerGraphSystem` from `twist.powerGrid` and samples the locked `dayNightCycle`, while `HeadlessContractSim` runs neither system. The derived manifest therefore advertises only build zones plus operation-less sentry/lantern fixtures, not the current that defines the contract. The attended fix master must add a deterministic Voltage socket and consumer-derived power/light vocabulary with real agent actions before Blackout Ridge enters `SUPPORTED_CONTRACTS`.

The census records **AGENT-READY: 0 of 4** for E3 and **BROKEN: 0** — "all contract data loads; the gap is the absent era socket, not malformed data." This is the same shape the E2 socket cured for Steamworks. Every epoch's signature mechanic needs exactly this slice before its agents can play; E3's is Voltage.

ⓘ *On "the attended fix master": the E2 census used that identical phrasing for F-ER01-1/-3, and s1460 (a fire) authored `lane-e2-pressure-socket` against it anyway; it drained at `24c6600f` with a review. The phrase is census boilerplate meaning "not ER-01's job", not an owner gate. Verified s1466.*

## READ-FIRST

1. `docs/bench/e3-readiness-census.md` — F-ER01-E3-1 verbatim (line 24 anchor above); **your acceptance is its reversal**. Read F-ER01-E3-2/-3/-4 too, but only so you can firewall them out — they are NOT yours.
2. `tasks/lane-e2-pressure-socket.md` + `reviews/e2-pressure-socket.md` — the template and how it was gated. Mirror its structure, including its honesty clause about zero new operations.
3. `src/systems/PowerGraph.ts` — **the class is `PowerGraphSystem` at `:193`; the FILE is `PowerGraph.ts`, not `PowerGraphSystem.ts`.** This is the truth you derive from. Also `normalizePowerGraphDefinition` `:356`, `powerWireId` `:424`, `emptyPowerGraphDiagnostics` `:448`, and `POWER_GRAPH_LIMITS`.
4. `src/systems/DayNightCycle.ts` — `export class DayNightCycle` `:27`, `validDayNightConfig` `:82`. Blackout Ridge runs a **locked** cycle; establish what "locked" means here before deriving light vocabulary.
5. `src/game/Game.ts` — the browser's construction + update order for both systems (`PowerGraphSystem` is constructed around `:3757`). **Mirror the browser's tick order**; a divergent order is a determinism bug you would be shipping deliberately.
6. `specs/agent-play/README.md` §AP-11 — vocabulary is **DERIVED from consumers, never invented**. Rules describe what the sim does; operations exist only where the player has a real lever.
7. `src/sim/HeadlessContractSim.ts` — how existing systems are wired (its Economy/Wave wiring is the pattern), and the manifest generator's existing derivation path.
8. `assets/contracts/epoch-3-voltage/contracts.json` — `e3-blackout-ridge` twist is `secureWave, dayNightCycle, powerGrid, enemyRoster` (verified s1466). The other three carry `mothSeason` / `fairground` / `baron` + `lightRamp` — that is precisely why they are out of scope.

## SCOPE — Blackout Ridge ONLY

1. **`HeadlessContractSim` runs `PowerGraphSystem` and samples `DayNightCycle`** for contracts whose twist carries `powerGrid` / `dayNightCycle` — same tick order as the browser (item 5 above).
2. **Determinism:** two consecutive headless runs of `e3-blackout-ridge` on a pinned seed produce identical event-log hashes. If any id/entropy source poisons the hash, route sim-context ids through the seeded source — the smallest change that keeps browser behaviour byte-identical. (The E2 socket hit exactly this with `crypto.randomUUID()` in `PressureSystem:186`; check whether `PowerGraph`'s wire/node identity has the same seam before you run.)
3. **Manifest** — `e3-blackout-ridge` derives:
   (a) **RULES**: what current is, how the graph's node/wire state gates it, what darkness does under the locked cycle, and what power actually powers on this contract.
   (b) **OPERATIONS**: only real levers. Wiring/build rides the existing BUILD grammar — ensure any power building appears in derived buildables with its current meaning. **If the consumer analysis finds NO new player lever, say so: zero new operations with complete rules is a VALID outcome. "The vocabulary is honest" beats "the vocabulary is long."**
4. **Census re-run for `e3-blackout-ridge` only:** admit it to `SUPPORTED_CONTRACTS`, re-run ER-01's probes, UPDATE its row in `docs/bench/e3-readiness-census.md`, and retire **F-ER01-E3-1 only** as CURED — **keep the original text and banner it (RETENTION LAW; do not delete).** Leave the AGENT-READY headline arithmetic correct after your change.
5. **e2e:** extend `e2e/er01-e3-census.spec.ts` — blackout-ridge headless-boots, the determinism pair holds, and the manifest carries power/light rules. **Machine-independent asserts only** (no wall-clock thresholds; see F-1440-2).

## TOUCH-ONLY

`src/sim/HeadlessContractSim.ts` · the manifest generator · `src/systems/PowerGraph.ts` and `src/systems/DayNightCycle.ts` **ONLY** for an id/entropy seam (browser behaviour byte-identical) · `docs/bench/e3-readiness-census.md` · `e2e/er01-e3-census.spec.ts` · `tasks/BACKLOG.md` + `tasks/goals.json` (goal-leaf receipt, same commit).

## NO

Balance values · invented power/light verbs beyond derived truth · **F-ER01-E3-2 (Moth Season / `MothSwarm`)** · **F-ER01-E3-3 (Canyon Works — crawler/tram/baron/`lightRamp`)** · **F-ER01-E3-4 (Fairground — wheel + the missing crowd-flock objective, which the census says must be authored on its own governed surface)** · E4+ sockets · `src/game/Game.ts` (READ it for tick order; do not edit it) · `Terrain3dClaimPilot.ts`.

## SELF-CHECK

- `npx tsc --noEmit` clean · `npm run build` green
- `npm run test:node-guards` green — **this slice touches `src/sim/`, so the cross-cutting sim guards are mandatory, not optional (F-1460-1).** If `scripts/gr-sim.test.mjs` reds, that is a **FINDING with a named cause**, never a re-pin reflex (F-1441-3).
- own spec + `e2e/er01-e3-census.spec.ts` green **both projects** (desktop + 390px)
- E1/E2 driver suites green **UNMODIFIED** — you must not move E2's numbers
- browser behaviour byte-identical: an e3 boot probe with **zero console/page errors**

READY-FOR-GATES. **Report:** the derived rules verbatim · the operations verdict (call out the no-new-levers case explicitly if that is the answer) · the id/entropy-source decision · the updated census row · and anything you found in E3-2/-3/-4 that the next socket master should know (report it, do not fix it).
