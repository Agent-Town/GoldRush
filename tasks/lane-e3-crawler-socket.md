CODEX: model=gpt-5.6-sol effort=xhigh

# lane-e3-crawler-socket — split CrawlerBossSystem into sim + presentation, then socket the sim half (closes F-ER01-E3-3, admits e3-canyon-works)

**FIRE-AUTHORED s1471 (attended review welcome).** Fifth instance of the ERA-SOCKET class, and **the first one that is a REFACTOR before it is a socket.** Templates: `tasks/lane-e3-canyon-environment.md` (drained `0b2ad1e9`), `tasks/lane-e3-moth-socket.md` (`bfeca043`), `tasks/lane-e3-voltage-socket.md` (`9af152ab`). **Read `reviews/e3-canyon-environment.md` before you start — it is your immediate predecessor and it names your blockers.**

⚠️ **THIS SLICE IS ALLOWED TO ADMIT `e3-canyon-works` AND MOVE THE HEADLINE TO `AGENT-READY: 3 of 4` — but ONLY if the Crawler genuinely runs headless.** Four prior sockets in this class were forbidden from moving the headline. You are not, *provided you earn it*. If you finish and the boss still cannot complete a run in `gr-sim`, the honest outcome is a **narrowed gap and an unmoved headline** — say so plainly. A census row is a claim about what an agent can do, and inflating it is the one failure this class cannot absorb.

ROLE: implementer on lane-a. WORKDIR: `worktrees/lane-a` (branch `lane/a`). Commit prefix `crawl:`. Never touch STATUS.md, reviews/, tasks/queue/, other lanes.

## PRE-FLIGHT — DO THESE IN ORDER. STEP 1 IS MANDATORY AND UNCONDITIONAL.

**F-1465-2 exists because a master offered the refresh as a conditional and put a currency probe beside it; the runner ran the probe first against a stale lane and truthfully reported "stale lane" about a lane that was one command from correct — 27,551 tokens, zero edits. The probe below CANNOT distinguish "the lane is stale" from "I asked too early". So the refresh is not a conditional. Do step 1, then step 2.**

**STEP 1 — REFRESH (unconditional, run exactly this):**
```
git -C worktrees/lane-a fetch origin main
git -C worktrees/lane-a checkout -B lane/a origin/main
```

**STEP 2 — CURRENCY PROBE (only after step 1):**
```
grep -c "It is a presentation/sim split, not a socket." reviews/e3-canyon-environment.md
```
Expect **1**. If **0**, step 1 did not take — STOP and report "refresh did not land", do NOT report a stale lane.
*(Measured to return exactly 1 on main at dispatch time, per F-1425-2. Deliberately apostrophe-free and on a single physical line: `grep` is line-oriented and prose wraps, so a key spanning a line break matches nowhere — including in the file it was copied from.)*

**STEP 3 — SAFE-DUPE:**
```
grep -c "CrawlerBossSystem" src/sim/HeadlessContractSim.ts
```
Expect **0**. If **≥1**, a Crawler path is already socketed — STOP and report; do not re-derive.

⚠️ *The obvious probe here — `grep -c "crawler"` — is WRONG, and s1471 only found that out by running its own pre-flight before dispatch. It returns **1** on a perfectly healthy lane, matching `'crawler-drain'` at `HeadlessContractSim.ts:877`, a **power-graph node role** that has nothing to do with socketing the boss. Shipped, it would have STOPped this run on arrival and reported "already socketed" about work that does not exist. Case-sensitive `CrawlerBossSystem` is the discriminating key: measured **0** on main **and** in the refreshed lane at dispatch.*

**STEP 4 — LANE SAFETY:** `git branch --show-current` = `lane/a`. Any dirty *tracked* blob not reachable in git → STOP.
⚠️ **FACTORY-CHURN EXCEPTION (F-1407-1 / F-1266-1):** modifications under `logs/**` and `artifacts/**` are the factory's own background churn and are **NOT** lane dirt. Ignore them in step 4; they must never STOP this run.

## WHY

`docs/bench/e3-readiness-census.md` F-ER01-E3-3 asked the factory to "compose the Voltage socket with the Crawler/tram objective before deciding whether the existing generic boss driver can be reused." **s1470 and s1471 answered every part of that except the Crawler**, which now stands alone as Canyon Works' only admission gap (see `reviews/e3-canyon-environment.md`, merged `0b2ad1e9`).

**The Crawler is not blocked by missing vocabulary. It is blocked by four specific couplings, each re-measured on main by s1471 rather than inherited:**

| # | Coupling | Evidence (verified s1471, read from main) |
|---|---|---|
| 1 | **Bare `document`** | `src/systems/CrawlerBossSystem.ts:492` — `const canvas = document.querySelector('canvas');` inside `publishCrawler3d()`, which is called from the **constructor** (`:124`) and from `syncPresentation` (`:374`), `ensureCrawler3d` (`:381`) and `disposeCrawler3d` (`:488`). `scripts/gr-sim.test.mjs` stubs `globalThis.location` and `globalThis.window` (`:60–:64`) but **never `document`** — so construction alone throws headless. |
| 2 | **Non-tick-anchored async load** | `:382` — `void import('three/examples/jsm/loaders/GLTFLoader.js').then(...)`, fired from `ensureCrawler3d()`, which `update()` calls at `:145`. A floating promise resolving off-tick cannot be in a deterministic event log. |
| 3 | **The grid drain hides inside presentation** | `update()` reaches `syncDrainTarget(target)` **only** via `syncPresentation()` (`:344–:356`): `nearestRelay(mast.position)` → `syncDrainTarget(target)`. The drain is **simulation** (it moves watts) but it is currently only reachable through a render path. Skipping presentation headless would silently disable it. |
| 4 | **The tick budget cannot reach the boss** | `src/sim/HeadlessContractSim.ts:349` — `maxTicks = Math.ceil(((secureWave + 2) * Balance.waves.waveInterval) / STEP_SECONDS)`. For `e3-canyon-works`, `twist.secureWave` is **12** and `twist.baron.wave` is **14** (both read from `assets/contracts/epoch-3-voltage/contracts.json`). Securing is blocked until the boss dies, so **a run-to-secure provably cannot terminate today.** |

**Couplings 1–3 are yours to fix. Coupling 4 is FIREWALLED — see the NO list.**

## READ-FIRST

1. `reviews/e3-canyon-environment.md` — your predecessor. Note especially **F-1471-1** (`objectiveAllowsSecure` keys on any `powerGrid`): it is a **known, deliberately-mirrored** inconsistency. **Do not repair it.** If your work makes it fire, that is a finding to report, not a bug to fix.
2. `src/systems/CrawlerBossSystem.ts` — the whole file (559 lines). It is the subject.
3. `src/sim/HeadlessContractSim.ts` — how `syncCanyonConnectObjective()` and `sampleDayNightSnapshot()` were socketed by `0b2ad1e9`. **Mirror that shape.**
4. `scripts/gr-sim.test.mjs` — the stub block at `:60–:94`. This is the environment your sim half must survive in.
5. `tasks/lane-e3-canyon-environment.md` — the master that produced your predecessor; mirror its honesty clauses.

## SCOPE — numbered, each independently testable

1. **Split `CrawlerBossSystem.update(at)` into two methods with a clean seam.**
   - `step(at)` — **simulation only**: `liveComponents()`, the `seenBoss`/`act` transitions, `advanceActs(at)`, `updateBurst(...)`, and **the drain-target selection lifted out of `syncPresentation`** (`nearestRelay` → `syncDrainTarget`). Must touch no `THREE` object transform, no material, no `document`.
   - `syncPresentation(at)` — **render only**: `ensureCrawler3d`/`updateCrawler3d`/`disposeCrawler3d`, component mesh visibility+position, beam segments, dial, `publishCrawler3d`.
   - `update(at)` becomes exactly `this.step(at); this.syncPresentation(at);` so the browser's behaviour is **unchanged by construction**.
2. **Make `publishCrawler3d()` headless-safe** with an early `typeof document === 'undefined'` return. It is a pure e2e test-hook (it writes `canvas.dataset.*`), so a headless no-op is correct, not a workaround. **Do not stub a fake `document` in the sim** — the seam belongs in the system.
3. **Guarantee the GLB load never gates simulation.** After the split, `ensureCrawler3d()` must be unreachable from `step()`. Prove it: a sim run must complete with `crawler3dState` never leaving its initial value.
4. **Socket the sim half into `HeadlessContractSim`**, mirroring `0b2ad1e9`: construct the system when `twist.baron.bossKind` is the Crawler, call `step()` from the fixed-step tick, and expose diagnostics (`act`, `bursts`, `drainActive`, `drainTarget`, `tracksPinned`, `overchargeRemaining`, `destroyed[]`) through `et.goldrush.get_state` under a `crawler` key.
5. **Extend `e2e/er01-e3-census.spec.ts`** to assert the Crawler's headless behaviour: the act ladder advances, the drain latches on, component kills register, and the run is **deterministic across two runs** (equal event-log hash).
6. **Update `docs/bench/e3-readiness-census.md`.** If and only if scope 1–5 genuinely land, admit `e3-canyon-works` and move the headline to `AGENT-READY: 3 of 4` / `DATA-GAP: 1 of 4`. Otherwise narrow F-ER01-E3-3 honestly and leave the arithmetic alone.

## THE ONE JUDGEMENT CALL, MADE FOR YOU

⚠️ **The spec must STEP WAVES, not run to secure.** Coupling 4 above means `advanceToTurn` cannot reach wave 14 for this contract. Your spec drives the boss by advancing waves directly, exactly as the browser Canyon spec does. **Do not "fix" this by widening the tick budget** — see NO #1.

## TOUCH-ONLY

- `src/systems/CrawlerBossSystem.ts`
- `src/sim/HeadlessContractSim.ts`
- `e2e/er01-e3-census.spec.ts`
- `docs/bench/e3-readiness-census.md`

## NO — firewall (violations are worse than an unfinished slice)

1. 🚫 **`src/sim/HeadlessContractSim.ts:349`'s `(secureWave + 2)` tick budget.** It is **shared by every contract in the game**. Widening it to make your boss reachable changes the termination behaviour of every other sim run and would move numbers the `gr-sim` Baron pin asserts. If you believe it must change, **report it as a finding with the measurement** and step waves instead.
2. 🚫 **`objectiveAllowsSecure` (F-1471-1).** Known, mirrored from the browser on purpose. Report, never repair.
3. 🚫 **`src/game/Game.ts`.** The browser is the reference implementation; if it and your sim disagree, the sim is wrong. Report the divergence.
4. 🚫 **Any behaviour change visible in the browser.** Scope 1 is a *pure* refactor: same calls, same order, new seam. If a browser spec goes red, you changed behaviour — revert and re-cut the seam.
5. 🚫 **Balance values, other contracts, other epochs, Fairground (F-ER01-E3-4).**
6. 🚫 **Inventing operations.** Four prior sockets in this class invented **zero** new BUILD-grammar operations. If the Crawler seems to need one, stop and report — that is the vocabulary stretch the ERA-SOCKET LAW forbids (Mistake #14).

## SELF-CHECK — name the exact evidence in your report

- `npx tsc --noEmit` clean · `npm run build` green.
- **`npm run test:node-guards`** — **MANDATORY**, you are touching `src/sim/` (F-1460-1). Expect **292 tests / 0 fail**. ⚠️ **If the `gr-sim` Baron pin moves, that is a FINDING with a named cause, never a re-pin** (F-1441-3). Refactors are supposed to move nothing; a moved pin means scope 1 was not pure.
- `npx playwright test e2e/er01-e3-census.spec.ts --workers=1` — both projects.
- `npx playwright test e2e/e3-canyon-works.spec.ts --workers=1` — **the browser must be unchanged.** This is the load-bearing proof that your refactor was pure.
- Adjacent unmoved: `npx playwright test e2e/er01-e2-census.spec.ts e2e/er01-e4-census.spec.ts e2e/er01-e5-census.spec.ts e2e/er01-e6-census.spec.ts --workers=1`.
- Zero console/page errors, desktop **and** 390px.
- **Report the determinism pins** (event-log hashes) for the two Crawler runs.
- **State plainly whether the headline moved and why.** If it did not, that is an acceptable and honest outcome.

READY-FOR-GATES + report: which of couplings 1–3 you cured, whether the browser Canyon spec stayed green, the two determinism hashes, whether the census headline moved to 3 of 4, and any finding you were told to report rather than repair.
