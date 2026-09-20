# e8-remaining-maps — implementer report (lane/d, Claude, 2026-09-05)

**Task master:** `tasks/e8-remaining-maps.md`. **Base:** `main` @ `7dc8672f0`. **Branch:** `lane/d`.
**Verdict: READY-FOR-GATES.** All three maps shipped; nothing deferred by the honesty guard.

---

## 1. What it does

The 2026-09-02 era-mechanic audit filed `e8-far-side` and `e8-eclipse` as **RESKIN** and
`e8-low-orbit` as **PARTIAL**: the contracts declare `tileParams.gravity` and
`tileParams.atmosphere`, and nothing headless read the atmosphere half. `e8-mare-claim-physics`
(review `reviews/e8-mare-claim-physics.md`, 2026-09-04) cured the Mare Claim. This slice cures the
other three.

**MEASURED FIRST, and it changes the premise.** `artifacts/e8-remaining-maps/baseline.json`, taken
on unmodified main: all three siblings ALREADY published `now.gravity` off the shipped
`E8PhysicsSystem` (floaty 0.6g and 2.4x arcs on the Far Side and the Eclipse, free-fall and 4.8x on
Low Orbit), because `HeadlessContractSim` constructs that profile from the manifest for every
contract. **The audit rows that call the gravity half absent are stale**, exactly as the master
warned. None of the three published `now.air`. So the gravity half was already composed and the
work of this slice is the AIR half plus each map's own latch.

`src/systems/E8SuitAirSystem.ts` is that consumer, written in `E8AtmosphereSystem`'s shape and
inheriting its numbers: a suit timer on the Prospector, an air dial per authored shelter, and an
objective latch. It damages nothing and mints nothing, for the same reason the Mare Claim's does:
the browser composes no atmosphere consumer at all, so a rule that hurt or paid the body would put
the two runtimes on different boards for the same orders (Same Laws, L7). What differs is what
counts toward the era's objective.

| map | shelters (`now.air.domes`) | the latch | the era's own half |
|---|---|---|---|
| `e8-far-side` | `far-side-landing-yard` (the zone holding the run's own `heroStart` stake) | the authored `probeRecoveryZones` crater must be stood in ON SUIT AIR | a round-trip air budget across a `suit-only` map; a breathless entry counts and credits nothing |
| `e8-low-orbit` | the three authored `orbitalScaffoldZones` decks | all three decks must be reached on suit air | the spine crossing; `LowOrbitSystem`'s returning-lob, drift and debris seams are untouched |
| `e8-eclipse` | the three `dome-cluster-pad-*` pads, breachable (`airIsWall: true`) | one regolith ground worked on air, plus one MORE after the shadow lands | mid-run the eclipse takes the solar-fed pads offline and leaves one reserve; the rider must transfer |

Every rectangle is read off the contract. Every number is imported from `E8PhysicsSystem`'s ratified
exports (`SUIT_AIR_SECONDS`, `SUIT_REFILL_PER_SECOND`, `DOME_AIR_DRAIN_SECONDS`,
`DOME_AIR_REFILL_SECONDS`, `DOME_ZONE_PREFIX`, `REGOLITH_GROUNDS_FOR_SECURE`) so the repo holds one
set of air numbers. **No new balance number, and `Balance.ts` is untouched.**

---

## 2. Changes, with file:line

| file | what |
|---|---|
| `src/systems/E8SuitAirSystem.ts` (new, 423 lines) | the consumer. `SUIT_AIR_CONTRACT_IDS:78`, `create:167`, `objectiveAllowsSecure:222`, `update:245`, `noteCrossings:284`, `notePan:305`, `diagnostics:318` |
| `src/sim/HeadlessContractSim.ts:75` | import |
| `src/sim/HeadlessContractSim.ts:610-626` | the field and its header (why two consumers, and both honest bounds) |
| `src/sim/HeadlessContractSim.ts:837` | composition gate, beside `E8AtmosphereSystem.create` |
| `src/sim/HeadlessContractSim.ts:1677` | one fixed-step update, beside `this.atmosphere.update` |
| `src/sim/HeadlessContractSim.ts:1247` | the secure latch, in the canyon-connect shape |
| `src/sim/HeadlessContractSim.ts:2461-2470` | the pan credit and the `regolith_ground_worked` replay event |
| `src/sim/HeadlessContractSim.ts:2114-2116` | published under the same `e8Atmosphere` diagnostics key, so `View.readAir` has ONE reader |
| `src/sim/HeadlessContractSim.ts:1409` | spread-if-declared under its own `suitAir` key in the terminal hash |
| `src/agent/View.ts:9,44-49` | `AgentAirView` gains two optional contract-scoped blocks |
| `src/agent/View.ts:429-430,458-459,468,481` | `readCrossing` / `readEclipse`, defensive like every other reader |
| `assets/contracts/epoch-8-orbital/contracts.json` | the three `engineDependencies` descriptions, still `status: missing`, now saying exactly what is composed where |
| `public/skill.md` | `now.air.crossing`, `now.air.eclipse`, the per-map secure rule, and the HOLD order-sequence trap |
| `assets/engine-era.json` | same-era pin appended, `ea60c9b7694dd6e8a8ec3131d80349c5c15b9a19b125730dafb10c4e375ceca8` |
| `package.json` | the new guard joins `test:node-guards` beside the Mare Claim's |
| `scripts/e8-remaining-maps.test.mjs` (new, 372 lines) | the guard, 9 tests |
| `e2e/e8-remaining-maps-parity.spec.ts` (new, 157 lines) | both-engine hash, three maps and the control |
| `tasks/BACKLOG.md` | the READY-FOR-GATES row |
| `artifacts/e8-remaining-maps/**` | probes, ride driver, six ride logs, six boot shots, this report |

**`src/systems/E8PhysicsSystem.ts` IS NOT TOUCHED** (`git diff main...HEAD --stat` lists no such
row). The Mare Claim's guard still asserts, verbatim and green, that `e8-eclipse`, `e8-low-orbit`
and `e8-far-side` never arm `E8AtmosphereSystem`.

---

## 3. The both-engine hash table, with the Mare Claim control

One seed, idle policy, 400-decision bound. **node** = `artifacts/e8-remaining-maps/armed.json` on
this lane. **chromium** = a module worker running the same module, `e2e/e8-remaining-maps-parity.spec.ts`.
**control** = the same probe on a DETACHED WORKTREE OF MAIN at `7dc8672f0`
(`artifacts/e8-remaining-maps/control.json`), never `git stash`.

| contract / seed | control (main) | node (lane) | chromium worker (lane) | agree? |
|---|---|---|---|---|
| `e8-far-side-01` | `fnv1a32:3fe83eca` | `fnv1a32:5c30efd5` | `fnv1a32:5c30efd5` | yes |
| `e8-far-side-02` | `fnv1a32:94eac90f` | `fnv1a32:47d63524` | not ridden | n/a |
| `e8-low-orbit-01` | `fnv1a32:d7423597` | `fnv1a32:6e1931c2` | `fnv1a32:6e1931c2` | yes |
| `e8-low-orbit-02` | `fnv1a32:006e19c8` | `fnv1a32:b77f104b` | not ridden | n/a |
| `e8-eclipse-01` | `fnv1a32:fac5d558` | `fnv1a32:466507ac` | `fnv1a32:466507ac` | yes |
| `e8-eclipse-02` | `fnv1a32:dcd53d40` | `fnv1a32:1568e702` | not ridden | n/a |
| **`e8-mare-claim-01` (CONTROL)** | **`fnv1a32:1a62757f`** | **`fnv1a32:1a62757f`** | **`fnv1a32:1a62757f`** | **byte-identical** |
| **`e8-mare-claim-02` (CONTROL)** | **`fnv1a32:dc8e828d`** | **`fnv1a32:dc8e828d`** | not ridden | **byte-identical** |

Every ride's `waves`, `timeMs` and `kills` are **unchanged from the control** on all eight rows
(2 / 79400 / 30, 2 / 77867 / 28, 2 / 78333 / 33, 2 / 79867 / 35, 2 / 81800 / 32, 2 / 78767 / 31,
2 / 81233 / 32, 2 / 81433 / 32). The three siblings' hashes move because the run's air is now a
terminal fact spread into the hash; the ride itself did not change. The Mare Claim cannot move,
and does not, on either seed.

**Mutation proof (in the guard).** Patch `E8SuitAirSystem.create` to `none()` and each map's hash
falls back to exactly the value `assets/contracts/null-floors.json` already pins for it
(`3fe83eca`, `d7423597`, `fac5d558`), `now.air` disappears from the view, and `now.gravity` stays
(the gravity profile is a separate composition). The Mare Claim's hash is identical with the
sibling consumer composed AND with it patched away, which is what makes it a control.

---

## 4. The three latches and their measured counts

Reachability is measured on FLOOR rides: the public door surface only, no hero buff, no debug
grants, starting kit (`ride.mjs`, `RIDE_POLICY=rider`). The secure is measured on HARNESS rides,
which add nothing but the `scripts/twin-banks-hash-probe.mjs:47-49` hero buff so a run can outlive
the map's wave-2 null floor and reach the wave-20 secure boundary; every log labels itself.

| map | published count | measured reachable | secure |
|---|---|---|---|
| `e8-far-side` | `now.air.crossing.required = 1` (its one authored `probeRecoveryZones` crater) | crater crossed ON AIR at **t = 30.0 s**, suit 60 s spent then refilled to 60 s at the landing yard (`far-side-floor.log`) | probe recovered t = 30.03 s, offered and banked at **wave 20**, `secured: true` (`far-side-harness.log`) |
| `e8-low-orbit` | `now.air.crossing.required = 3` (its three authored `orbitalScaffoldZones`) | all three decks crossed on air by **t = 60.03 s**, on **5.07 s of a 60 s suit** (`low-orbit-floor.log`) | offered and banked at **wave 20**, `secured: true` (`low-orbit-harness.log`) |
| `e8-eclipse` | `now.air.regolith.required = 1` (= `REGOLITH_GROUNDS_FOR_SECURE`, clamped to the 6 authored grounds) **plus** `now.air.eclipse.requiredAfter = 1` once the shadow lands | first ground worked on air at **t = 4.4 s** (`eclipse-floor.log`); shadow lands **wave 10**, west and east pads offline, `dome-cluster-pad-center` the reserve; ground worked on the reserve's air at t = 388.8 s / wave 12 | offered and banked at **wave 20**, `secured: true`, 4 grounds worked, 12 of them after the shadow (`eclipse-harness.log`) |

**A/B latch proof, same seed, same orders** (`scripts/e8-remaining-maps.test.mjs`, the Far Side):
latch closed, the ride reached **wave 22 and was never offered a secure**; latch open, the same
ride was offered at 20 and banked (`{"closedAtWave":22,"open":{"secured":true,"waves":20,...}}`).

The Eclipse's shadow is scheduled from the run's OWN boundary, `ceil(secureWave / 2)` = wave 10 off
`Balance.run.secureWave` = 20, so nothing new is tuned and a re-authored `twist.secureWave` moves
the shadow with it. `arrivedAtWave` is published as `null` until it lands, because the contract
authors `firstRunWarning: false` and a countdown would be the warning the map refuses to give.

---

## 5. Gates, with real exit codes

| gate | command | exit | result |
|---|---|---|---|
| types | `npx tsc --noEmit` | **0** | clean |
| build | `npm run build` | **0** | green, built in 2.43 s |
| the slice's guard | `node --test --test-concurrency=1 scripts/e8-remaining-maps.test.mjs` | **0** | **9/9** in 24.6 s |
| both-engine parity, desktop + 390px | `npx playwright test --config playwright.s2517.config.ts e2e/e8-remaining-maps-parity.spec.ts` | **0** | **8/8** in 14.8 s, zero console/page errors |
| adjacent E8 e2e, both projects | the eight `e2e/e8-*.spec.ts` + `er01-e8-census.spec.ts` | **0** | **48/48** in 1.6 min, unmodified |
| plain-boot shots, both projects | `playwright.s2517shots.config.ts` | **0** | **6/6**, `__GR_TEST__` absent, zero console/page errors, shots in `artifacts/e8-remaining-maps/shots/` |
| engine era + view schema | `node --test scripts/engine-era-guard.test.mjs scripts/view-schema-guard.test.mjs` | **0** | 8/8 |
| node guards battery | `npm run test:node-guards` under node **26.4.0** | **1 (RED, attributed)** | **651 tests, 647 pass, 2 fail, 0 cancelled**; both reds are ONE inherited root cause, proven on the control below. All 9 of this slice's tests pass inside the battery, and so does `e8-mare-claim-physics.test.mjs` |
| stats | `npm run test:stats` under node **26.4.0** | **0** | 87 + 252 + 252 + 26 checks passed |

**Gate hygiene (Mistake #12).** The default config binds 5188 and another lane's dev server already
held it, so every playwright run above used a gitignored scratch config on ports 5241/5242 serving
THIS worktree, with a DEV server (not preview) because the parity worker runtime-imports
`/src/sim/HeadlessContractSim.ts`.

Nothing renders that did not render before, so there is no perf table; the six boot shots exist to
show the three maps still boot clean for a human on desktop and at 390px.

---

## 6. Findings

- **F-E8RM-1 — TWO AIR CONSUMERS, CONSOLIDATION OWED (firewall consequence, non-blocking).** The
  master's firewall says "NO changes to `E8PhysicsSystem.ts` behaviour", and that file's own header
  says lifting `AIR_WALL_CONTRACT_IDS` for the Eclipse "is that slice's one-line call". The two
  cannot both be obeyed, and the firewall won: the Eclipse gets its air from the NEW consumer, not
  from a widened gate. The cost is that the dome dial and suit rules exist in two files. The benefit
  is that the Mare Claim is provably untouched and its shipped guard passes verbatim. **A later
  slice with the firewall lifted should merge the two, with `E8AtmosphereSystem` as the survivor and
  `E8SuitAirSystem`'s shelters/crossing/eclipse blocks folded in.** Note also that the Eclipse needs
  new code either way: `E8AtmosphereSystem` has no seam for taking a shelter offline.
- **F-E8RM-2 — FIREWALL DEVIATION, DECLARED: one new file outside the literal TOUCH-ONLY list.** The
  master's list names `contracts.json`, `HeadlessContractSim.ts`, `View.ts`, `skill.md`, tests,
  evidence and the BACKLOG row. Two of the three maps need a rule the era does not have (a
  `suit-only` wall with no domes), so the code had to live somewhere; this repo's every era consumer
  lives in one small file under `src/systems/` and is composed by `HeadlessContractSim`
  (`HollowCrossingSystem`, `ProbeRecovery`, `LowOrbitSystem`, `SignalSuppression`, and so on).
  Writing 400 lines of consumer inside a 2,700-line sim file to satisfy the letter would have broken
  the house style and the one-writer law. **Declared here rather than hidden; the drain's call.**
- **F-E8RM-3 — `assets/contracts/null-floors.json` IS NOW STALE FOR THREE MORE ROWS.** The pinned
  idle floors for the siblings are the un-composed hashes (`3fe83eca`, `d7423597`, `fac5d558`); the
  composed ones are in section 3. The file was deliberately NOT edited: it lives inside
  `ENGINE_SOURCE_INPUTS`, so refreshing it rotates the engine hash again, and the guard
  (`scripts/null-floor-anchors.test.mjs`) is shape-only and stays green. This is the same class as
  **F-E8MC-4**, whose two `e8-mare-claim` rows are ALSO still stale. Five rows for the next floors
  regeneration.
- **F-E8RM-4 — THE BROWSER STILL COMPOSES NO ATMOSPHERE CONSUMER (same class as F-E8MC-5).** The era
  binds the DOOR's riders; a human player on these three maps meets no suit timer and no shadow.
  All three `engineDependencies` rows therefore stay `status: missing` and now say so in words. The
  browser half is its own row.
- **F-E8RM-5 — AUTHORED, NOT RATIFIED: three derivations, each stated at its site.** (a) Which zones
  are shelters: `dome-cluster` pads on a `suit-timer` map; authored scaffold decks on a `suit-only`
  map that has them; otherwise the build zone holding the run's own `heroStart` stake. (b) Which are
  crossings: authored `probeRecoveryZones`, else authored `orbitalScaffoldZones`. (c) Which shelter
  is the eclipse reserve: the one nearest the map origin, ties by contract order. Each is derived
  from data the contract already carries, and each is a candidate for an owner ruling.
- **F-E8RM-6 — LOW ORBIT'S AIR IS COMPOSED AND GATING, BUT IT DOES NOT BITE, and the number says so.**
  The three authored decks are close enough that a full spine crossing costs **5.07 s of a 60 s
  suit** and the suit never drops below 60 s while a deck is in reach. That is honest rather than
  ideal: the map's declared teaching is momentum, not suffocation, and the audit row asked for "the
  atmosphere-wall/suit-air half", which is present and gates the secure. If the owner wants the wall
  to bite there, the declared lever is the debris fields (a torn suit inside a band), and that is a
  new rule needing a ruling, not something this slice should invent.
- **F-E8RM-8 — ALL THREE MAPS WERE ALREADY CLAIMED, UNDER THE OLD PHYSICS, AND THIS SLICE RAISES
  THEIR BAR. THAT IS THE MASTER'S OWN L2 QUESTION AND IT IS MEASURED, NOT ASSERTED.**
  `assets/rotations/winnability-receipts.json` on main records all three as `claimed` by
  `claude-opus-5` on 2026-09-04 (Heat 11), every one of them earned on a ride where no crossing
  and no shadow existed. From this diff on, a rider must additionally cross on suit air (Far Side,
  Low Orbit) or work a ground on the reserve's air after the shadow (Eclipse). The master's READ
  FIRST line demanded exactly this be measured: **it is, on floor rides from the starting kit with
  no debug grants** (section 4: t = 30.0 s, t = 60.03 s, t = 4.4 s), and each map was carried to a
  banked secure at wave 20 on a harness ride. The existing receipts are NOT invalidated by this
  slice, and no receipt or reel is touched by it; a re-run of those tapes under the new latch is a
  board question for the drain and the owner, not an implementer's call.

- **F-E8RM-7 — DOOR USABILITY: a `HOLD` starves every standing order queued behind it.**
  `StandingOrders.tick` (`src/agent/StandingOrders.ts:216-233`) returns on the first order that
  yields a result, and `HOLD` yields `{ movement }` on every tick forever. Measured: a
  `CONTEXT_ACTION recover` queued after a HOLD sat `pending` for 45 turns and the Far Side could
  never be won. Put action verbs FIRST. Documented in `public/skill.md` so a rider does not have to
  discover it by losing a run; no code change made, because the executor's behaviour is outside this
  slice's firewall and may well be intended.

---

## 7. Anything undone, and why

- **THE NODE VERSION IS THE STORY OF EVERY OTHER RED, and it is environmental.** This shell's
  default node is **v23.11.1** while `.nvmrc` pins **26.4.0**. Under v23.11.1 the two long batteries
  are unusable and say so themselves: `test:stats` refuses outright (`assay worker requires Node
  26.4.0 exactly; found 23.11.1`, `scripts/assay-replay-agent.mjs:50`), and `test:node-guards`
  reported **605 tests / 8 fail / 8 cancelled** where six of the reds were 300 s FILE-level
  cancellations of heavy sim files (`assay-replay`, `e4-roads-and-convoys`,
  `e8-mare-claim-physics`, `e8-remaining-maps`, `gr-sim`, `gr-sim-campaign`) plus
  `node-guards-timeout.test.mjs`, whose own diagnostic names the cause: "this node (v23.11.1)
  bounds --test-timeout at FILE granularity ... Cure the NODE, not the test: .nvmrc pins 26.4.0.
  See F-1507-1." Re-run under **node 26.4.0** the picture is clean: `test:stats` **exit 0**, and
  `test:node-guards` **651 tests / 647 pass / 2 fail / 0 cancelled**. Both batteries above are
  reported from the 26.4.0 run; the v23.11.1 numbers are recorded here so nobody re-litigates them.
- **THE TWO REMAINING REDS ARE ONE INHERITED ROOT CAUSE, ATTRIBUTED AGAINST A CONTROL.**
  `scripts/goal-tracker.test.mjs` "goal tree schema is valid" fails on a goal leaf whose commit
  field reads `'attended-evidence-commits-2026-09-04'` where a 40-hex sha is required
  (`goal-tracker.test.mjs:80`), and `scripts/fixture-teardown.test.mjs` fails ONLY because it runs
  goal-tracker as a child and propagates that one failure. **Control: the identical failure, same
  input string, on a DETACHED WORKTREE OF MAIN at `7dc8672f0` (`CONTROL_GOALTRACKER_EXIT=1`).**
  `git diff --name-only main...HEAD` contains no `tasks/goals.json`. This is **F-2499-2**, already
  on the BACKLOG as a known red on main from an attended goal leaf, and it is not this diff's.
- **Fire-shell note:** the battery ran at node's default file concurrency (this is a lane shell, so
  `nodeGuardsConcurrency` returns undefined). A first pass taken WHILE this session's own
  playwright runs were in flight produced extra load-sensitive timeouts and tripped
  `node-guards-contention.test.mjs` ("CONTENDED, 2 concurrent batteries"), which is F-1409-1/F-1410-1
  by name. Every battery number reported above comes from a run with nothing else running.
- **Factory churn left dirty on purpose (F-1266-1 / F-1407-1):** the adjacent E8 e2e run regenerated
  `artifacts/e8-research-tree/*.png`, `artifacts/lane-roster-wiring-e8-01/*.png` and
  `reviews/shots-claw/*.png`. They are regenerated evidence from OTHER slices, never work; they are
  not committed and the drain discards them.
- **No view-schema version bump, and that is the registry's rule rather than an omission.**
  `scripts/view-schema-guard.test.mjs` builds its canonical field list from `the-claim`, which
  declares no gravity and no air, so every contract-scoped field under `now` is unregistered by
  design (F-E8MC-1, the `now.preserve` precedent). `now.air`'s existing rows are unchanged; the two
  new blocks are additive and absent on every map that does not declare them, asserted in the parity
  spec.
- **Nothing was deferred under the master's no-op / honesty guard.** All three maps shipped; no map's
  smallest slice needed a system the era does not have.
