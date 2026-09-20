# e8-mare-claim-physics — implementation report

**Slice** `tasks/e8-mare-claim-physics.md` · **branch** `lane/d` (worktree `worktrees/lane-d`) ·
**Claude implementer**, attended-dispatched · written 2026-09-04.

The 2026-09-02 era-mechanic audit filed `e8-mare-claim` as a **RESKIN**: the contract declares
`tileParams.gravity` and `tileParams.atmosphere`, the browser composes `E8PhysicsSystem`
(`src/game/Game.ts:804`), and the engine a rider actually plays composed neither
(`docs/audits/2026-09-02-era-mechanic-audit.md:47`). This slice composes both headless, makes the
Mare Claim's SECURE depend on the era mechanic, publishes the two rider-facing fields, and proves
the two runtimes ride the same seed to the same event-log hash.

**Honesty guard, answered first (the master's "No-op / honesty guard"):** `E8PhysicsSystem` does
**NOT** depend on three.js render state. Its only `three` uses are `THREE.Vector2` / `THREE.Vector3`
value types and `THREE.MathUtils.clamp` (`src/systems/E8PhysicsSystem.ts:1,39-42,88,96,145`) — the
same maths the headless sim already imports. No scene, camera, material, mesh or renderer is
touched, so no headless port was needed and **the browser's physics is unchanged** (proved by its
own e2e, below).

---

## 1. What changed, file by file

| File | Lines | What |
|---|---|---|
| `src/sim/HeadlessContractSim.ts` | `:588`, `:597` | composes `E8PhysicsSystem` and `E8AtmosphereSystem` — the same read the browser performs at `Game.ts:804` |
| | `:612` `syncE8LobPhysics()` | mirrors `Game.ts:3206-3211`: the hero's lob range and hang follow the profile |
| | `:623` `e8PhysicsIntents()` | mirrors `Game.ts:3177-3190`: slot 0's intents pass the movement filter (honest note in the code: this engine drives slot 0 on `IDLE_INTENTS`, so the filter has nothing to bend yet) |
| | `:1456`, `:1458`, `:1948` | the browser's own order — lob sync, debris chip, then the actor's intents |
| | `:1580` | the suit ticks against the domes with the outlaws where the step left them |
| | `:1184` | **the secure latch**: `!this.atmosphere.objectiveAllowsSecure` pushes `nextSecureWave` to `MAX_SAFE_INTEGER`, in the canyon-connect shape |
| | `:1337` | the air state joins the event-log hash, spread-if-declared (absent on every other contract) |
| | `:2005-2006` | publishes `e8Physics` / `e8Atmosphere` under the browser's own diagnostics keys |
| | `:2343` | `regolith_ground_worked` replay event, the first time each ground is worked on air |
| | `:2508`, `:2530-2536` | `BLAST_AT` uses the browser's reach (`Balance.blast.range * lobArcDistanceMultiplier`) and hang, and the event records both |
| `src/systems/E8PhysicsSystem.ts` | `:238` | `REGOLITH_GROUNDS_FOR_SECURE = 1` with the measurements that chose it |
| | `:270-402` | `E8AtmosphereSystem`: suit timer, per-dome breach dials, the regolith-run latch, diagnostics. Armed on `e8-mare-claim` alone (`AIR_WALL_CONTRACT_IDS`, `:218`), `none()` everywhere else |
| `src/agent/View.ts` | `:26`, `:37`, `:79`, `:86`, `:343`, `:394`, `:411` | additive contract-scoped `now.gravity` and `now.air`, derived from the same diagnostics in either engine |
| `public/skill.md` | the `now` bullet, View-schema section, `BLAST_AT` paragraph, EPOCH LEVERS | the rider-facing documentation |
| `scripts/e8-mare-claim-physics.test.mjs` | new | the guard (5 tests), registered in `package.json`'s `test:node-guards` |
| `e2e/e8-mare-claim-physics-parity.spec.ts` | new | browser-vs-node hash parity in a chromium module worker |
| `artifacts/e8-mare-claim-physics/` | new | ride driver, three ride logs, four probes, this report |

Not touched, deliberately: `assets/contracts/epoch-8-orbital/contracts.json` (the objective the gate
uses is one the briefing **already** promises, so no contract edit was needed), `Balance.ts`,
`assets/engine-era.json`, other E8 maps, E1-E7, ranking.

## 2. Both engines, one seed, one event-log hash

"Both engines" is not two different simulations. The browser runs *this* module too:
`src/replay/AgentTapeReplay.ts` imports `HeadlessContractSim` and the browser replays agent tapes
through it in a worker (`src/replay/BrowserAgentTapeHarness.ts:15`). The two engines are the two
**runtimes**: node (the door) and chromium (the page). The browser's other hash,
`runTapeEventLogHash` (`src/game/RunTape.ts:278`), hashes a human tape's probe log — a different
function over a different log — so it can never equal the sim's, and claiming otherwise would be
the dishonest reading of the master's section 1.

| ride (contract / seed) | node (v23.11.1) | chromium worker | agree |
|---|---|---|---|
| `e8-mare-claim` / `e8-mare-claim-01`, idle | `fnv1a32:1a62757f` waves 2 · 81233ms · 32 kills | `fnv1a32:1a62757f` waves 2 · 81233ms · 32 kills | **YES** |
| control `the-claim` / `e1-the-claim-01`, idle | `fnv1a32:e9c32234` (the pinned null floor) | `fnv1a32:e9c32234` | **YES** |
| `e8-mare-claim` idle, composition REMOVED (mutation) | `fnv1a32:ee2f7c14` | — | equals the audit's recorded RESKIN hash **and** the pinned null floor |

And the other E8 maps, measured rather than asserted — composing the profile changed **none** of
them (each byte-identical to `assets/contracts/null-floors.json`):

| contract | seed 01 | seed 02 |
|---|---|---|
| `e8-eclipse` | `fac5d558` = pin | `dcd53d40` = pin |
| `e8-far-side` | `3fe83eca` = pin | `94eac90f` = pin |
| `e8-low-orbit` | `d7423597` = pin | `006e19c8` = pin |
| `e8-mare-claim` | `1a62757f` (was `ee2f7c14`) | `9e4ca8c0`* (was `99623cc8`) |

\* measured before `REGOLITH_GROUNDS_FOR_SECURE` landed; seed 02's current value is not pinned
anywhere and nothing gates on it (see F-E8MC-4).

## 3. The event evidence (`artifacts/e8-mare-claim-physics/mare-claim.log`)

Three rides on one seed, driven through the public door surface only (standing orders in, rider
view out) by `artifacts/e8-mare-claim-physics/ride.mjs`.

- **Gravity-scaled lobs.** `blast_at` events carry `lob: {reach: 24, airTime: 1.68}`. Off gravity
  the reach is `Balance.blast.range` = 10m and the hang 0.7s, so the ride's 20m lobs are legal
  *only* under this contract's 2.4x arc — and the guard's mutation proof shows the same order
  refused `OUT_OF_RANGE` the moment the multiplier is flattened to 1.
- **Air drain.** The idle floor ride spends its whole 60s suit and stands empty for 21.2s
  (`drainedTotal: 60`, `emptySeconds: 21.233`). The scripted floor ride refills once by walking the
  hero onto the centre dome pad; the harness ride refills 8 times and drains 567s in total.
- **The domes.** Under siege the pads breach and seal repeatedly — 46 / 4 / 44 breaches on
  west / centre / east in the long harness ride, each dial falling while an outlaw stands on it.
- **The regolith run.** `regolith_ground_worked` fires the first time each authored ground is
  panned on suit air (grounds 1, 4, 2, 3, 5 in the harness ride). A ride that lets the suit empty
  logs **35 breathless pans credited to nothing**.
- **The secure, A/B on the same seed and policy.** Latch closed -> the wave-20 boundary offers
  nothing and the ride runs on to wave 27 and dies (`secured:false`, `fnv1a32:7f2c4650`). Latch
  open -> offered at wave 20 and banked (`secured:true`, waves 20, `fnv1a32:fea8b6d1`).

## 4. The view fields (additive, contract-scoped)

    now.gravity = { source, movement, feelG, lobArcDistanceMultiplier, lobAirTimeMultiplier,
                    knockbackScale, orbitalReturn, vacuum }        // any contract declaring gravity
    now.air = {                                                    // only where air is the wall
      wall: "suit-timer",
      suit: { body, seconds, capacity, refillPerSecond, inDome, empty, drainedTotal, emptySeconds },
      domes: [{ id, air, breached, breaches, siegers }],
      regolith: { grounds, required, worked, runsOnAir, breathlessPans, complete },
    }

Both are documented in `public/skill.md` (the `now` bullet, the View-schema section, the `BLAST_AT`
paragraph, and a new E8 paragraph under EPOCH LEVERS). **No version bump** — see F-E8MC-1.

## 5. Gates

| gate | command | exit | result |
|---|---|---|---|
| types | `npx tsc --noEmit` | 0 | clean |
| build | `npm run build` | 0 | green (asset diet ran) |
| stats | `npm run test:stats` (node v26.4.0) | 0 | 87 + 223 + 223 + 26 checks |
| stats | `npm run test:stats` (node v23.11.1) | 1 | **environment, not code**: `assay worker requires Node 26.4.0 exactly; found 23.11.1` (`scripts/assay-replay-agent.mjs:50`). Green on the canonical engine. |
| node guards | `npm run test:node-guards` (node v26.4.0, clean re-run) | 1 | **626 tests, 619 pass, 5 fail, 2 skipped** — every red attributed below |
| E1 / view adjacent | `npx playwright test e2e/agent-view e2e/front-door-parity e2e/sim-fixed-step` | 1 | 19 pass, 11 skipped, **2 fail = one KNOWN-RED test on both projects**, proven pre-existing below |
| this slice | `node --test scripts/e8-mare-claim-physics.test.mjs` | 0 | 5 pass / 0 fail, 17.5s |
| parity | `npx playwright test e2e/e8-mare-claim-physics-parity.spec.ts` | 0 | 2 pass (desktop-chrome + mobile-chrome 390px) |
| adjacent E8 | `npx playwright test e8-physics + e8-low-orbit-momentum + e8-roster + e8-arsenal + e8-far-side-probe + er01-e8-census` | 0 | **40 pass**, both projects, unmodified |
| skill.md + view schema | `node --test skillmd-guard + skillmd-contracts-guard + view-schema-guard` | 0 | 21 pass / 0 fail |

### The five node-guards reds, each attributed

1. **`bench-seeds.test.mjs` :: rotation registry stays outside the engine identity corpus** and
3. **`engine-era-guard.test.mjs` :: the landed registry names the live engine** — both are the same
   fact: this slice changed `src/`, so the engine hash rotated. **Measured on both trees:** main
   computes `a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04`, which is exactly the
   era-5 pin (so both guards are green on main); this lane computes
   `a5d5addf12fa40e9233a0bd0c1428c44fc8911e13c6b4e68c640f019c8eb06a5`. The cure is the `pins` append
   in `assets/engine-era.json`, which this master's firewall forbids the implementer and which the
   drain owes — see F-E8MC-2, which carries the cause text ready to paste.
2. **`desk-declaration-guard.test.mjs` :: the live board is green under this guard** — the guard
   REFUSES by design: *"this is a linked worktree and its STATUS.md line-1 is NOT the one main
   carries... Re-run from the main worktree, or pass --root <main worktree>"* (F-2232-1/F-2241-1/
   F-2242-1). Nothing to do with this slice; it cannot be green from `worktrees/lane-d`.
4. **`fixture-teardown.test.mjs` :: all 119 `scripts/*.test.mjs` fixture owners** — a cascade, not a
   defect: it re-runs each test file as a child and its only failing child is `bench-seeds.test.mjs`
   carrying red #1's assertion. The other 118 children cleaned up, and **this slice's own test file
   is not among the failures** (`grep 'e8-mare-claim-physics.test.mjs child failed'` = 0). The count
   moved 118 -> 119 because this slice adds one test file; the guard enumerates, so nothing is pinned.
5. **`node-guards-contention.test.mjs` :: contention is advisory... and absent when alone** — this
   guard asserts the machine is quiet and reds while any other worktree runs a battery. **Re-run
   alone: 1 pass / 0 fail.** Same mechanism the A6 far-side row recorded for the same test.

### The two e2e reds, attributed

`e2e/agent-view.spec.ts:512` ("the seeded rider view stays cache-shaped and grows one honest wave at
a time") fails on desktop-chrome and mobile-chrome. It is **KNOWN-RED in the repo's own inventory**
(`node scripts/red-inventory-lookup.mjs e2e/agent-view.spec.ts --title ...` -> KNOWN-RED, both
projects, same `Object.is equality` error class, snapshot 2026-08-11) — and because membership is
never exoneration (F-1444-2), it was attributed at source instead: the whole-view literal misses
exactly two fields, `viewVersion` and `coalSeams`, and **neither is in this slice's diff**
(`git diff main..lane/d -- src/agent/View.ts | grep -E 'viewVersion|coalSeams'` is empty). Both
entered `src/agent/View.ts` in commits that are **ancestors of this branch's point**
(`cdc29b717` coal seams, `14c4db20b` view versioning; `git merge-base --is-ancestor` confirms both).
The red is on main and is not this slice's.

## 6. Findings

**F-E8MC-1 (the master's "version bump" was not done, deliberately).** Scope item 3 asks for a
view-schema version bump. It was not done, for three reasons that agree with each other:
1. the version lives in `assets/engine-era.json`, which this master's own firewall lists under **NO
   changes**;
2. `scripts/view-schema-guard.test.mjs:22` asserts the registry's field list **deep-equals** the
   canonical `the-claim` view's fields. `now.gravity`/`now.air` are contract-scoped and absent
   there, so registering them would red the guard, and the guard only demands a bump for *added
   registry fields* (`:31`);
3. precedent: `now.preserve` (E10, contract-scoped, landed in the e10-preserve-objective merge) is
   not in the registry and did not bump the version, which is still `1`.
The cure applied instead: skill.md now states the rule its guard enforces (the stamped set is the
canonical view; contract-scoped fields live outside it). If the owner wants the version to move for
contract-scoped fields, that is a change to the guard's semantics and to `engine-era.json` — a
one-line edit in each, outside this firewall.

**F-E8MC-2 (the engine-hash pin is the drain's, and it is owed).** `src` and `assets/contracts` are
inside `ENGINE_SOURCE_INPUTS` (`scripts/assay-replay-agent.mjs:36-44`), so this slice rotates the
engine hash. `assets/engine-era.json`'s own history records that a previous drain "owed this append
and missed it" (the s2457/s2458 pins). The drain of this slice must append a `pins` entry whose
cause is: *e8-mare-claim-physics merge: `src/sim/HeadlessContractSim.ts`, `src/systems/E8PhysicsSystem.ts`
and `src/agent/View.ts` compose the E8 gravity profile and a new air-wall consumer. REAL behaviour
change for `e8-mare-claim` and that contract only (its secure now waits on a regolith run made on
suit air, and its event log carries the air state); every other contract decides exactly as before,
measured against the pinned null floors. Same era: no view field was removed or renamed and no tape
shape changed.*

**F-E8MC-3 (a real cross-runtime hazard, found while proving parity; not fixed here).**
`src/meta/ContractFamilies.ts:2382` reads `globalThis.location?.search` while `:2416` reads
`window.location.search`. A Worker's own `globalThis.location` is its script URL and carries no
search, so a worker that sets only `window.location` — which is exactly what the app's own
`src/replay/BrowserAgentTapeWorker.ts:15` does — falls back to the DEFAULT contract for every read
that goes through `:2382`. Measured: with `window` alone, the Mare Claim ride built **the-claim's**
terrain (`Terrain.bounds` +/-32 instead of +/-64, `sample(0,0).speedMul` 0.85 instead of 1) and
hashed `fnv1a32:d0e71d2a` instead of `1a62757f`. My spec sets both bindings. Whether the app's tape
worker is actually harmed depends on which reads its replay path takes (`bootDeclaredRun` boots from
the tape, not the URL), so this is filed as a hazard to verify, not a proven live bug — and it is
outside this slice's firewall (`ContractFamilies.ts`, `src/replay/**`).

**F-E8MC-4 (two stale null-floor rows, harmless today).** `assets/contracts/null-floors.json` still
records the pre-composition idle hashes for `e8-mare-claim` (`ee2f7c14` / `99623cc8`). Nothing reds:
`scripts/null-floor-anchors.test.mjs` is shape-only (coverage, field names, `secured === false`) and
never re-runs a sim. Current value for seed 01: `fnv1a32:1a62757f`; seed 02 needs a re-measure
before pinning. Refreshing the artifact is outside this firewall.

**F-E8MC-5 (the dependency row stays `missing`, correctly).** `e2e/er01-e8-census.spec.ts:88`
requires `e8-mare-claim`'s `engineDependencies` to read
`{dep: 'atmosphere-wall-consumer', status: 'missing'}`, and the row stays exactly that: the BROWSER
still composes no atmosphere consumer (it reads only the gravity profile), so the dependency is
half-built, and flipping it would also need `ContractFamilies.ts`'s `DECLARED_INERT_PATHS` edited in
the same pass — the same shape as the Far Side's F-E8FS-1. The browser half is the next row's work.

## 7. Left undone, and why

- **"A scripted floor ride secures (L2)"** — NOT achieved, and not achievable in this slice. The
  Mare Claim's secure boundary is wave 20; its null floor is wave 2
  (`assets/contracts/null-floors.json`), and `assets/contracts/winnability-receipts.json` records
  `{"contractId":"e8-mare-claim","status":"unclaimed"}` — **no rider, human or machine, has ever
  secured this contract**. Making the first one is a rider problem (the gauntlet's), not an engine
  slice's. What this slice does show: the latch **opens from the starting kit** (the floor ride
  works its first ground on suit air at t=5.3s and reports `regolith.complete: true`), and the
  secure it gates is really offered and banked once a ride survives to the boundary (the harness
  ride, wave 20, `secured: true`).
- **The full six-ground promise** — the briefing promises six grounds; the gate asks for one. The
  measurements behind that choice are in `src/systems/E8PhysicsSystem.ts:222-237` and the ride log.
  Raising it is one line plus a documented number, once the map authors a dependable air loop.
- **The browser's own air consumer** — out of firewall (`Game.ts` composes no atmosphere consumer;
  this slice deliberately did not add one, since a browser behaviour change is the thing the master
  forbids). The two engines therefore agree about gravity everywhere and about air on the headless
  door only, which is stated in the code (`HeadlessContractSim.ts:590-597`) rather than hidden.
- **`assets/contracts/epoch-8-orbital/contracts.json`** — untouched. The gate uses the objective the
  briefing already promises ("Work the six regolith harvest grounds across the mare flat",
  `briefing.goals[1]`, with `specs/epoch-saga/e8-orbital-bundle.md:28` "pan (regolith He-3 runs on
  suit timers)"), so no contract edit was required; editing it would also have rotated the engine
  hash for a text change.
