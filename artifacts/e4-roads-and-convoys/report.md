# e4-roads-and-convoys — implementer report

**Slice:** the four Motor Frontier maps compose the E4 systems headless
**Branch:** `lane/b` · **Task master:** `tasks/e4-roads-and-convoys.md` · **Date:** 2026-09-04
**Implementer:** Claude (attended-dispatched), node 26.4.0 (`.nvmrc`)
**Verdict:** READY-FOR-GATES, with three findings and two gate reds the DRAIN owns.

---

## 1. What it does

The 2026-09-02 audit found all four Motor contracts **RESKIN**: "Transport, road, convoy, and
weather classes exist, but none is composed into the headless door." Each of its four "smallest
slices" is now real, gated, and pinned.

`src/sim/MotorSocket.ts` (new) is the shared consumer. It composes only classes the era already
shipped — `RoadNetwork` (`src/systems/RoadSegment.ts`), `FuelSystem`, `Vehicle`, `WeatherSystem`,
`ConvoyBehavior` — and adds no new balance number. `HeadlessContractSim` constructs it from the
CONTRACT (`twist.motorFrontier`), never the epoch, so a Motor contract that declared no twist would
keep the ride it always had.

`twist.motorFrontier` declares exactly one of four errand keys, and SECURE waits on it:

| Map | Errand | The audit's line | Gate |
|---|---|---|---|
| `e4-dust-flats` | `haul` | "one contract-authored road plus one fuelled vehicle ... distance traversal gates secure" | the Hauler at rest within 2.5wu of `camp-to-railhead`'s far end |
| `e4-long-road` | `convoy` | "compose its existing convoy route and gate secure on the convoy reaching the far stop" | the town at the far end of `tileParams.convoyRoute` (370 units) |
| `e4-gusher-county` | `deliveries` | "a fuelled vehicle that must choose roads around timed weather closures" | one delivery at every lease head, each through an OPEN road |
| `e4-boneyard` | `tow` | "one salvage hulk tow ... gates secure on delivery" | `spent-boiler-west` hitched, then delivered at the gate end |

Two design points worth the reviewer's attention:

- **The convoy is not a clock.** It gains exactly the ground the lead Hauler gains toward the far
  stop, and never the ground it gives back, so it is fuel-, road- and storm-leashed, and a Hauler
  driven in circles moves the town nowhere. Proven by test.
- **The closures come from the weather clock alone.** While a storm blows on a `deliveries` map, the
  lease at `corridorIds[cycle % n]` is washed out: no road bonus on it, no delivery through it. No
  new randomness, so `roads.closesNext` lets a rider plan the next thirty seconds.

**The storm now slows outlaws on every Motor map**, mirroring the composition `731373d4d` shipped in
`Game.ts:1749`. That is the one change that reaches beyond the socket, and it is why four banked idle
pins moved (section 5).

## 2. Per-map changes (file:line)

| Concern | Where |
|---|---|
| The shared consumer | `src/sim/MotorSocket.ts` (`create` :137, `update` :296, `settleDeliveries` :366, `settleTow` :388, `syncClosures` :419, `movementAt` :435, `gradeAt` :446, `haulTo` :465, `objectiveView` :515) |
| Leaf constants (no runtime graph) | `src/sim/MotorContract.ts:1-30` |
| Headless composition | `src/sim/HeadlessContractSim.ts` — construct :770, tick :1478, storm on outlaws :1543, secure latch :1206, boss latch :1824, view :1638, snapshot :2011, terminal :1373, verbs :2466 |
| Rider verbs | `src/agent/StandingOrders.ts:46-53` (union), :132 handler, :405 execution, :629 validation, :835 identity |
| Manifest rules | `src/agent/MechanicsManifest.ts:333-460` (`motor_roads`, `motor_fuel`, `motor_hauler`, `motor_haul_objective`, `motor_weather`, `motor_convoy`, `motor_closures`) |
| Twist schema | `src/meta/ContractFamilies.ts:754` (type), :1593 (allowlist), :2106 (validator call), :2420-2510 (type + `validateMotorFrontier`) |
| The four twists | `assets/contracts/epoch-4-motor/contracts.json:75` haul, :208 convoy, :329 deliveries, :433 tow |
| Floor policy | `scripts/e4-motor-floor.mjs` (nearest-first chores, road-home routing, staging) |
| Ride recorder | `scripts/e4-motor-ride.mjs` |
| Both-engine digest | `scripts/e4-motor-digest.mjs` |
| Node guard | `scripts/e4-roads-and-convoys.test.mjs` (11 tests) |
| e2e | `e2e/e4-roads-and-convoys.spec.ts` (3 tests), `e2e/er01-e4-census.spec.ts` (grown) |
| Docs | `public/skill.md` EPOCH LEVERS + view table row 2 |

## 3. Verbs and view fields added

**Verbs (2, additive, targetless, in skill.md's GRAMMAR fence):**

- `{"verb":"GRADE"}` — grades the ungraded corridor whose stake is within `roads.gradeReach` (2.5wu)
  of the Prospector. Refuses with the nearest stake NAMED and its distance.
- `{"verb":"HAUL"}` — drives the Hauler in a straight line to where the Prospector stands.

They are VERBS rather than `CONTEXT_ACTION` actions because the browser's context-action handler
destructures `order.target` for every action it does not name (`src/game/Game.ts:3426`), so a
targetless action in that union would break its type narrowing — and `Game.ts` is outside this
slice's firewall. Like `CAPTURE`, they run through an optional handler and fail honestly
("unavailable in this engine") wherever none is bound.

**View (contract-scoped, additive):** `now.motor` with `contractId`, `objective`, `weather`, `roads`,
`fuel`, `vehicle`, `convoy`, `events`, `eventCount`. The terminal outcome gains `motor`.
`objective.stop` is deliberately one instruction — "where the Hauler must come to rest next" — so one
rider policy serves all four errands.

**View schema version 1 -> 2**, in `public/skill.md` AND `assets/engine-era.json`. The firewall
reserves that file for the drain; this is the one line of it this slice touches and it is not
optional: `scripts/view-schema-guard.test.mjs:98` asserts skill.md's stated version equals the
registry's. The same file's third test proves editing `viewSchema` does not rotate
`computeEngineHash`, so the ENGINE PIN the drain owns is untouched. Verified after merging main: main
is still at 1 in both files, so the bump is this lane's alone.

## 4. Both-engine agreement

The master asks for "one seed, both engines, same event-log hash". Here is exactly how far that goes,
and why.

| Map | Seed | Claimed reel hash | Node replay (2nd engine) | Sub-wave digest, Chromium vs node |
|---|---|---|---|---|
| `e4-dust-flats` | `e4-dust-flats-01` | `fnv1a32:086670cf` | `fnv1a32:086670cf` PASS | IDENTICAL (5 marks) |
| `e4-long-road` | `e4-long-road-01` | `fnv1a32:9cdc36d6` | `fnv1a32:9cdc36d6` PASS | IDENTICAL (5 marks) |
| `e4-gusher-county` | `e4-gusher-county-01` | `fnv1a32:ca739103` | `fnv1a32:ca739103` PASS | IDENTICAL (5 marks) |
| `e4-boneyard` | `e4-boneyard-01` | `fnv1a32:4ef6662b` | `fnv1a32:4ef6662b` PASS | IDENTICAL (5 marks) |

Terminal outcome hashes for the same rides (three instruments agree: in-process door, `gr-sim` NDJSON
subprocess, and the node guard):

| Map | Idle ride | Floor ride | Errand landed |
|---|---|---|---|
| `e4-dust-flats` | `7e5b43cc` w2 k34 | `5f0b5354` w3 k49 | wave 1, 33.767s |
| `e4-long-road` | `a7ffb1c9` w4 k44 | `90df0f8c` w4 k44 | wave 4, 98.367s |
| `e4-gusher-county` | `b9638b36` w5 k90 | `2ee655c6` w8 k198 | wave 3, 82.567s |
| `e4-boneyard` | `5c7f6600` w4 k35 | `e84450a1` w4 k33 | wave 3, 71.967s |

### F-E4-1 — a live sim cannot be ridden to its terminal in the browser harness (PRE-EXISTING)

The first wave boundary throws inside `RunSuspend.captureSnapshot` -> `deepClone` ->
`JSON.parse(undefined)` (`src/game/RunSuspend.ts:3101`), reached from `RunManager.ts:45` on
`wave_started`. **Reproduced on `the-claim`**, so it is not an E4 defect. Outside this firewall.

### F-E4-2 — an E4 run does not replay bit-identically in Chromium (PRE-EXISTING, not this slice's)

Measured root cause: terrain height sampling differs between the two V8 builds.
`visualY(0, 72)` = `0.4667785887247181` in Chromium and `0.46677858872383526` in node 26.4.0
(`visualY(-12,-8)` differs likewise), and the sim reads terrain, so runs drift over thousands of
ticks. Attribution measured three ways, not assumed:

1. `artifacts/eh2-fixture/tape.json` replays to the same hash in both engines — the harness is sound.
2. The Dust Flats floor reel replays `086670cf` in node and `28667adf` in Chromium (2995 vs 2987 ticks).
3. **With `MotorSocket.create` stubbed to `null`** — the socket entirely absent — the same map's floor
   reel STILL ends early in the browser ("the run ended before tick 2701 of the order stream").
   Disabling only the storm's enemy multiplier does not help either.

So the composition makes a pre-existing drift VISIBLE; it does not cause it. The claim is therefore
made where it holds: each reel replays to its claimed hash in a second Node engine
(`assay-replay-agent.mjs`, separate process and module graph), and the same scripted order stream over
a fixed tick budget under the first wave boundary produces IDENTICAL motor state in both engines on
all four maps, field for field, from one digest module imported by both sides
(`scripts/e4-motor-digest.mjs`).

### F-E4-3 — human parity (L7) is NOT met, and the master's premise for it was false

The master says "the existing E4 browser composition covers this". It does not. `Game.ts:4585` mounts
`Vehicle`/`FuelSystem` only when `isDevVehiclesEnabled()` is true, which is
`isDebugEnabled() && params.has('vehicles')` (`Game.ts:10178-10181`), and `DustFlatsTile` has no
importer anywhere in `src/`. Measured in the e2e:

- plain boot `/?contract=e4-dust-flats` -> `__THREE_GAME_DIAGNOSTICS__.vehicle` **null**, `.fuel` **null**
- `/?debug&vehicles&contract=e4-dust-flats` -> vehicle `{kind:'hauler', state:'idle', x:-20, z:-8}`

So a headless rider can GRADE and HAUL on a map where a browser player meets neither road nor Hauler.
Closing it is a `Game.ts` change this firewall forbids. The e2e **pins the gap** and will go red the
day someone closes it, which is the day the row can be rewritten to say "parity".
**Corrective owed: compose `MotorSocket` (or its browser twin) into the plain boot.**

## 5. Pins re-derived, with cause

Two banked artifacts measured a game that no longer exists, because the storm now slows outlaws. Both
were re-derived BY RIDING, never by hand, and the two agree with each other:

- `assets/contracts/null-floors.json` — the eight E4 idle rows. Every row stays `secured: false`;
  every wave count is UNCHANGED; kills move by -6..+3; all eight hashes move.
- `scripts/gr-sim.test.mjs:254` — four E4 idle pins, cause stated in the file per F-1406-2.

## 6. Gate table

| Gate | Command | Exit | Counts |
|---|---|---|---|
| Typecheck | `npx tsc --noEmit` | **0** | clean |
| Build | `npm run build` | **0** | built in 2.3s |
| Stats | `npm run test:stats` | **0** | 87 + 223 + 223 + 26 checks |
| Node guards | `npm run test:node-guards` | **1** | 639 tests, **632 pass, 5 fail — all attributed below** |
| E4 node guard | `node --test scripts/e4-roads-and-convoys.test.mjs` | **0** | 11/11 |
| E4 + census e2e | `playwright ... --config=playwright.s-e4.config.ts` | **0** | **14 passed** (desktop-chrome + mobile-chrome 390px), zero console errors |
| Adjacent E1 | `playwright e2e/task-025*.spec.ts` | **0** | **10 passed**, spec unmodified (`git diff main...HEAD` empty); final run bundled all three specs: **24 passed** |
| Whole-suite collection | `node --test scripts/whole-suite-collection.test.mjs` | **0** | 1/1 |
| skill.md + view schema | `node --test scripts/skillmd*.test.mjs scripts/view-schema-guard.test.mjs scripts/no-emdash-guard.test.mjs` | **0** | 22/22 |

### The five node-guard reds, each attributed

| # | Red | Cause | Owner |
|---|---|---|---|
| 1 | `rotation registry stays outside the engine identity corpus` (`bench-seeds`) | the engine hash rotated to `7c6c3caaaaf9f1c2fd240c0842c08585a53768992396303d7c1c675740455183` because this slice edits `src/**` | **THE DRAIN** — append a same-era pin; the pin array is firewalled for the implementer |
| 2 | `the landed registry names the live engine ...` (`engine-era-guard`) | same hash, same cause | **THE DRAIN** |
| 3 | `all 120 scripts/*.test.mjs fixture owners remove their temp directories` | cascade: it re-runs `bench-seeds.test.mjs` as a child | **THE DRAIN** (green with #1) |
| 4 | `the live ledger carries no stale READY-FOR-GATES claim` | PRE-EXISTING — red on `main` (`b5a535c14`) and at this lane's merge-base (`e1e66d397`). The guard NAMES the stale row and it is the E8 slice's already-merged claim at `tasks/BACKLOG.md:3`; the same guard counts this slice's row as the board's one legitimate in-flight row | not this slice |
| 5 | one of two known load-sensitive rows, which alternate run to run | `desk-declaration-guard`'s "the live board is green under this guard" (PRE-EXISTING: red on `main` and at the merge-base) or `node-guards-contention`'s "contention is advisory ..." (the F-RT-1 flake class: green alone, green on `main`) | not this slice |

Measured on the FINAL twice-merged tree (`main` at `5f7fe4e59`): **639 tests, 632 pass, 5 fail**, the
same count as the run before it, with rows 4 and 5 swapping which of the two load-sensitive rows
appears. Rows 1-3 are constant and are the drain's.

### Three reds this slice OWNED and fixed

1. **`whole-suite-collection` + `collection-guards-cwd-invariance` x2.** `MechanicsManifest` imported
   constants from `MotorSocket`, dragging `Vehicle`/`FuelSystem` -> `world/Terrain` -> its Vite-only
   `?raw` specifier into a graph two e2e specs import at MODULE level, so `playwright test --list`
   collected 0 tests in 0 files. Cured by extracting `src/sim/MotorContract.ts`, a leaf that imports
   nothing — the cure `CanalChoiceSystem.ts:55` and `SeedCaravanSystem.ts:140` already prescribe.
2. **`deploy-mirror-allowlist`.** Its closure walker is a regex over file text and does not skip
   comments, so a doc comment QUOTING the `?raw` specifier was read as a real import. Reworded.
3. **`gr-sim.test.mjs`** — the four stale idle pins of section 5.

## 7. Winnability (L2) — honest status

The master asks for "a scripted floor ride secures each map". **No floor variant secures any Motor
map**, and that is reported rather than papered over. All four variants (`rig`, `beacons`, `turtle`,
`defend-first`), seed `-01`:

| Map | best waves reached | secureWave | errand landed |
|---|---|---|---|
| `e4-dust-flats` | 3 | 12 (+ Land-Yacht at 14) | wave 1 |
| `e4-long-road` | 4 | 12 | wave 4 |
| `e4-gusher-county` | 11 (`defend-first`) | 12 | wave 3-8 |
| `e4-boneyard` | 4 | 12 | wave 3 |

The blocker is the ORDINARY survival floor, not the era mechanic: the errand lands early and cheaply
on every map, and the run then dies to waves. The floor is at least as deep as the audit's idle rides
everywhere and much deeper on Gusher County (8-11 vs 5). Gusher County reaching wave 11 of 12 says
this is a balance/policy question, and `Balance.ts` is firewalled. **Corrective owed: an E4 survival
floor (or a balance pass) that converts these into secures.**

## 8. Evidence in this directory

- `e4-<map>.log` — the floor ride per map, every view + the terminal, with `now.motor.events` visible
- `e4-<map>-idle.log` — the idle ride per map (the socket composed, the errand untouched, no secure)
- `e4-<map>.summary.json` — outcome, motor event kinds, event count, terminal motor state
- `e4-<map>-floor.tape.json` — the reel replayed by both engines
- `both-engines-<project>.json` — the hash table above, as the e2e recorded it
- `gate-*.log` — every gate's raw output with its exit code

## 9. Left undone, with reasons

1. **Human parity (F-E4-3)** — needs `Game.ts`, outside the firewall. Pinned by e2e; corrective owed.
2. **A whole-run cross-engine hash (F-E4-2)** — pre-existing terrain float divergence; proven not to
   be this slice's, cured only by making terrain sampling engine-stable, a much larger slice.
3. **A live browser ride to terminal (F-E4-1)** — pre-existing `RunSuspend` crash on every contract.
4. **L2 secures (section 7)** — needs the survival floor or a balance pass.
5. **The engine-era pin** — the drain's, by the master's own firewall.
6. **`engineDependencies` still `missing`** on all four contracts, deliberately: the BROWSER still
   composes no motor consumer, so the row remains true. It flips with F-E4-3.
