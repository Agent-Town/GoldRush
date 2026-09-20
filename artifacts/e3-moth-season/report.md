# e3-moth-season-grid — implementation report

Slice: `tasks/e3-moth-season-grid.md` (the L1 RESKIN ladder, wave 2).
Lane: `lane/a`, worktree `worktrees/lane-a`, base `57330ebfd`.

## Verdict

The Canyon Works power-graph composition **was reused without a fork**. No `src/` file changed:
every engine seam the mechanic needs already exists and is contract-gated, so the whole mechanic
landed as **authored contract data** plus tests and evidence. The honesty guard's STOP condition
("the composition cannot be reused without a fork") did **not** fire.

One clause of the master's scope could not be met inside the firewall and is reported, not faked:
**"SECURE requires the lamp lit AT the secure wave"**. The shared latch is one-way in both engines,
so what is enforced is "the corridor carried current **by** wave 12". See F-E3MS-1.

## What changed (file:line)

### `assets/contracts/epoch-3-voltage/contracts.json` — `e3-moth-season` only

| Site | What |
|---|---|
| `:97-99` | `tileParams.pylonSites`: one site `corridor-pylon`, `wireFrom: corridor-dynamo`, x0 z-14, radius 2.5 — the relay a rider BUILDs a Sentry Beacon on. |
| `:100-102` | `tileParams.prePlacedBuildables`: one `lantern_post` at x0 z6, standing ON the lamp node. |
| `:131-144` | `twist.powerGrid`: producer `corridor-dynamo` (x0 z-32, 20 W), relay `corridor-pylon`, consumer `corridor-gallery` (`role: gallery`, 6 W, priority 10), consumer `corridor-lamp` (`role: lamp`, 2 W, priority 30); wires dynamo->pylon->gallery->lamp; `maxSpanLength: 30`. |
| `:143` | `connect: { required: 1, byWave: 12 }` — the era mechanic on the secure latch. |
| `:148` | A third `moth_swarm` roster row at `waveMin: 4`, so the migration keeps its share of the mix when the saboteur arrives. |
| `:150` | `fevered_saboteur` "Corridor Saboteur" at `waveMin: 4` — the Canyon Works row's numbers verbatim (`hpScale 1.1`, `speedMult 1.12`, `buildingDamageScale 1.25`), re-edged north/south. This is what makes the span *sabotageable*. |
| `:159-172` | Briefing: the CONNECT goal and the two circuit rules (raise the beacon, repair it, an uncarried corridor cannot secure). |

**Why two consumers on one span, when the master says "one lamp consumer".** The shared machinery
answers two different questions from two different roles and both are hardcoded in BOTH engines:
`canyonConnectDiagnostics` counts `role === 'gallery'` consumers (`src/game/Game.ts:6981`,
`src/sim/HeadlessContractSim.ts:2207`), while the light field gates lantern posts on the nearest
`role === 'lamp'` consumer (`Game.ts:6469` -> `powerConsumerAt`, `HeadlessContractSim.ts:2278`).
A single-role circuit gets one of the two behaviours and not the other. The Canyon Works already
solves this with a `gallery -> lamp` pair on one relay (`contracts.json:266`), so this slice copies
that shape rather than generalising the role filter — generalising it would mean editing `Game.ts`
and `ContractFamilies.ts`, both outside the firewall, and would put the two engines out of step.

### `src/sim/HeadlessContractSim.ts` — **NOT CHANGED**

The master allowed a composition gate here. None was needed and none was written: the constructor
already builds `PowerGraphSystem` from `twist.powerGrid` (`:951-953`), `syncContractPowerGrid`
already drives the relay and its span off the pylon site's beacon (`:2143-2168`), `syncLightState`
already filters lantern posts through the lamp consumer (`:2278`), `autoSecureWaveForRun` already
blocks the secure on `powerGrid.connect` (`:1183`), and the view/outcome already carry
`canyonConnect` and the `power` snapshot (`:1675`, `:1341-1343`). Verified by running, not by
reading: the composed contract rides in both engines with zero source edits.

### Tests and ledgers

| File | What |
|---|---|
| `scripts/moth-season-pressure.test.mjs:59` | idle vs the re-recorded floor fixture through `gr-sim`. |
| `scripts/moth-season-pressure.test.mjs:73` | replays the frozen fixture in-process and asserts the four beats; writes `artifacts/e3-moth-season/ride-e3-moth-season-01.json`. |
| `scripts/moth-season-pressure.test.mjs:136` | **the secure rule**, isolated with an unkillable rider. |
| `scripts/fixtures/moth-season-orders.json` | re-recorded floor ride, 92 turns (see "the offer set changed"). |
| `e2e/e3-moth-season.spec.ts:39/112/178/232` | night+moths, the four beats in the browser, human parity in a plain boot, the both-engine hash. |
| `e2e/er01-e3-census.spec.ts` | census re-pinned: relay placed first, withdrawn `lantern_post` pinned as a refusal, `connect_objective` rule pinned. |
| `assets/engine-era.json` | same-era pin for the rotated engine identity (`assets/contracts` is inside `ENGINE_SOURCE_INPUTS`). |
| `scripts/e3-mask-tables.test.mjs:136` | records F-E3MS-2 as OWED instead of pinning it (the mask mirror is outside the firewall). |

## The secure rule, as enforced

`twist.powerGrid.connect = { required: 1, byWave: 12 }` with `secureWave: 12`. Both engines run the
identical one-way latch: `complete` sets on the first tick at or before wave 12 on which the
corridor gallery reads `powered`; `failed` sets if wave 12 passes with `complete` still false; and
`autoSecureWaveForRun` returns `MAX_SAFE_INTEGER` while `connect && !complete`, i.e. **the run
cannot secure at any wave**.

Measured, one seed, unkillable rider so the only variable is the circuit
(`scripts/moth-season-pressure.test.mjs:136`):

| Ride | Corridor | `canyonConnect` at wave 15 | Terminal |
|---|---|---|---|
| No relay | dark all run | `{powered: 0, complete: false, failed: true}` | never terminates — unsecurable |
| One Sentry Beacon on the pylon site | lit | `{complete: true, failed: false}` | `secured: true, waves: 12` |

## The event evidence — the cut, the dark, the repair, the lit secure

From the floor ride, `artifacts/e3-moth-season/ride-e3-moth-season-01.json` (seed
`e3-moth-season-01`, 93 sampled turns):

| Beat | Turn | Wave | Span | Gallery / Lamp | Beacon |
|---|---|---|---|---|---|
| DARK (opening) | 0 | 0 | relay offline | `dark` / `dark` | none built |
| LIT (BUILD) | 1 | 1 | `intact` | `powered` / `powered` | 40/40 |
| CUT (saboteur) | 30 | 4 | `cut` | `dark` / `dark` | 0/40 WRECKED |
| RELIT (REPAIR_UNDER) | 38 | 4 | `intact` | `powered` / `powered` | 40/40 |
| SECURE | — | 12 | — | — | `secured: true` |

The cut/repair cycle repeats at waves 4, 5, 6 and 7 in the same trace. The browser proves the same
four beats live (`e2e/e3-moth-season.spec.ts:112`, screenshots
`artifacts/e3-moth-season/{desktop,mobile}-chrome-corridor-{cut,relit}.png`).

## The both-engine hash table

"Both engines" is the county's own definition for agent reels (`e2e/e4-roads-and-convoys.spec.ts`,
`scripts/assay-replay.mjs`): the same `HeadlessContractSim` ridden in Node and in the browser
runtime. `Game.ts` has never been in hash agreement with the headless door on any map and is not
claimed here.

| Ride | Engine | Seed | Ticks | Event-log hash |
|---|---|---|---|---|
| Floor ride, `gr-sim --policy=stdin` | Node | `e3-moth-season-01` | — | `fnv1a32:e16244f9` |
| Same fixture, in-process replay (node guard) | Node | `e3-moth-season-01` | — | `fnv1a32:e16244f9` |
| Reel, claimed by the recorder | — | `e3-moth-season-01` | 10800 | `fnv1a32:b391d689` |
| Reel replay, `scripts/assay-replay-agent.mjs` | Node (2nd process) | `e3-moth-season-01` | 11400 | `fnv1a32:b391d689` |
| Reel replay, `__GR_AGENT_TAPE_REPLAY__` | Chromium desktop 1280x800 | `e3-moth-season-01` | 11400 | `fnv1a32:b391d689` |
| Reel replay, `__GR_AGENT_TAPE_REPLAY__` | Chromium mobile 390x844 | `e3-moth-season-01` | 11400 | `fnv1a32:b391d689` |

Outcome on every row that carries one: `{secured: true, waves: 12}`. Tables at
`artifacts/e3-moth-season/both-engines-{desktop,mobile}-chrome.json`.

Rides whose hash MOVED (both expected; the contract's terminal state now carries the `power`
snapshot and `canyonConnect`):

| Ride | Before | After |
|---|---|---|
| `--policy idle` | `fnv1a32:7f1ac8a2` (the audit's own row) | `fnv1a32:e7d0ebdb` |
| Engine identity (`computeEngineHash`) | `3d0f567dd4cab4f9...0baadb58` | `869f345151896ee3...80aa6aba` |

The engine identity moved because `assets/contracts` is inside `ENGINE_SOURCE_INPUTS`
(`scripts/assay-replay-agent.mjs:36-44`). Pinned same-era with its cause in
`assets/engine-era.json`; **no `src/` file changed and no other contract envelope moved**.

## The offer set changed — and human parity holds

Declaring `twist.powerGrid` withdraws two buildables from `mechanicsBuildableIds`
(`src/agent/MechanicsManifest.ts:823` and `:827-829`): buildable `lantern_post` and `turret`. This
is the shipped rule `e3-blackout-ridge` already lives under, and it is why the map's lamp is now a
pre-placed grid fixture. Both engines read that one function, so the rider and the human get the
identical list — pinned in a **plain boot with no `?debug`** (`e2e/e3-moth-season.spec.ts:178`):
`[sentry_beacon, palisade, sluice, stockpile, decoy_shed, assay_office]`,
`typeof window.__GR_TEST__ === 'undefined'`, the corridor lamp standing and dark, and `canyonWorks`
published. **L7 parity holds: nothing the rider can do here is closed to a human.**

The floor fixture had to be re-recorded for that offer set (the old one built a `lantern_post` and
a `turret`). The new floor: HARVEST the three seams, BUILD the relay beacon at `goldGte 25`, BUILD
the decoy shed at `goldGte 20`, a standing `REPAIR_UNDER 60`, and first-preference upgrades. It
secures at wave 12 (`fnv1a32:e16244f9`); idle still dies at wave 4.

## Gates

| Gate | Command | Exit | Result |
|---|---|---|---|
| tsc | `npx tsc --noEmit` | **0** | clean |
| build | `npm run build` | **0** | tsc + vite + asset-diet green |
| slice node guard | `node --test --test-timeout=300000 scripts/moth-season-pressure.test.mjs` | **0** | 3/3 |
| mask tables | `node --test scripts/e3-mask-tables.test.mjs` | **0** | 30/30 |
| engine identity | `node --test scripts/{engine-era-guard,bench-seeds,view-schema-guard}.test.mjs` | **0** | 12/12 |
| slice e2e | `npx playwright test e2e/e3-moth-season.spec.ts --workers=1` | **0** | 8/8, desktop + 390px, zero console/page errors |
| adjacent e2e | `npx playwright test e2e/er01-e3-census.spec.ts --workers=1` | **1** | 6/8. `e3-moth-season` 2/2 GREEN. `e3-canyon-works` 2 RED — PRE-EXISTING, control reproduces |
| `test:stats` | `npm run test:stats` | **1** | `test-stats` 87 + standings 252 (KV) + 252 (SQLite) PASS; `test-ledger-worker.mjs` refuses — environmental, needs Node 26.4.0, host has 23.11.1; control reproduces |
| `test:node-guards` | `npm run test:node-guards` | **1** | 632 declarations, 627 pass. Both engine-identity reds CLEARED by the pin. The five surviving rows are all PRE-EXISTING and control-attributed below |

Gates ran against a scratch dev server on port 5241 (5188 was already held by another writer), per
the scratch-port discipline in `CLAUDE.md` Mistake #12.

### Red attribution (control = detached worktree of `main` at the base commit `57330ebfd`, never `git stash`)

| Red | Control | Verdict |
|---|---|---|
| `er01-e3-census` / `e3-canyon-works` — "Outcome requested before the contract terminated" | reproduces (`CTL_EXIT=1`, same message) | PRE-EXISTING, not this slice |
| `test-ledger-worker.mjs` — "assay worker requires Node 26.4.0 exactly; found 23.11.1" | reproduces | ENVIRONMENTAL, not this slice |
| node-guards / `goal tree schema is valid` | reproduces | PRE-EXISTING |
| node-guards / `a per-test timeout still overrides the default` | reproduces | PRE-EXISTING |
| node-guards / `scripts/gr-sim.test.mjs` file 300 s timeout | reproduces (the control completed FEWER tests in the same budget: 10 vs the lane's 13) | PRE-EXISTING budget overrun |
| node-guards / `rotation registry stays outside the engine identity corpus` | GREEN on control | **MINE** — engine hash rotation; cured by the `engine-era.json` pin |
| node-guards / `the landed registry names the live engine...` | GREEN on control | **MINE** — same cause, same cure; both now GREEN in the lane |
| node-guards / `contention is advisory, correctly counted, and absent when alone` | reproduces (same message, quiet machine) | PRE-EXISTING |
| node-guards / `all 121 scripts/*.test.mjs fixture owners remove their temp directories` | re-run alone, quiet: fails ONLY on its `goal-tracker.test.mjs` child, i.e. the `goal tree schema` row above | PRE-EXISTING cascade. In the FIRST battery it also cascaded from the two engine-identity reds; those are gone |

## Findings

**F-E3MS-1 — the shared connect latch cannot express "lit AT the secure wave" (measured, open).**
The master's scope reads "SECURE requires the lamp lit at the secure wave". Both engines implement
the latch one-way and identically (`Game.ts:6992-7000`, `HeadlessContractSim.ts:2218-2226`): once
`complete` is set it never clears, so a run that lit the corridor at wave 1 and lost it at wave 11
still secures. Measured on this very ride — the floor ride secures at wave 12 with the corridor
`dark` at its terminal tick (`terminalLamp: "dark"` in the ride log), because a saboteur had it
down at the bell. What IS enforced is strictly weaker but real: *the corridor must have carried
current by wave 12, or the run cannot secure at any wave*.
Making it live needs one predicate in each engine (e.g. an opt-in `connect.hold: 'at-secure'` that
re-reads `powered >= required` at the secure check) plus the field on `ContractPowerGrid`. That is
`src/game/Game.ts` + `src/meta/ContractFamilies.ts`, **both outside this task's TOUCH-ONLY list**,
and a sim-only change would put the two engines out of step — so it was not done. REC: a
one-file-per-engine corrective on the reskin ladder; the guard at
`scripts/moth-season-pressure.test.mjs:73` already records the gap so the cure has a pin to flip.

**F-E3MS-2 — the published mask mirror is owed two keys (open).**
`assets/contracts/epoch-3-voltage/mask-tables/e3-moth-season.json` does not carry the new
`pylonSites` / `prePlacedBuildables` the way `e3-canyon-works.json` carries its own. The firewall
scopes `assets/contracts/` to `contracts.json` alone, so the mirror was left untouched and
`scripts/e3-mask-tables.test.mjs:136` records the debt in place of a pin. The mask tables are read
by nothing but that guard (verified by grep over `src` and `scripts`), so nothing at runtime is
affected. REC: republish the mirror and add both keys to the guard list in the same commit.

**F-E3MS-3 — `current_construction` is pinned to one contract id (pre-existing, non-blocking).**
`src/agent/MechanicsManifest.ts:168` gates the `current_allocation` / `current_construction` /
`current_storage` rules on `contract.id === 'e3-blackout-ridge'`, so neither the Canyon Works nor
Moth Season publishes the vocabulary that names `sentry_beacon` as the relay buildable, the pylon
sites, or `REPAIR_UNDER` as the mend. Both publish `connect_objective` and nothing else about their
grid. Moth Season is therefore at exact parity with the EXERCISES row it copied, which is why this
was not "fixed" here (`MechanicsManifest.ts` is outside the firewall). REC: derive that socket from
`twist.powerGrid` rather than from an id, on the same ladder.

**F-E3MS-4 — riding `HeadlessContractSim` directly in a page throws (pre-existing, worked around).**
`new HeadlessContractSim(...)` constructed inside a browser page dies on the first wave boundary:
`RunSuspend.deepClone` does `JSON.parse(JSON.stringify(x))` on a value that is `undefined` under a
real `window`/`document` (`RunSuspendController.captureBoundary` <- `RunManager` <- `startWave`).
It is not contract-specific and not caused by this slice. The both-engine proof uses the county's
supported path instead (`__GR_AGENT_TAPE_REPLAY__.replay(tape)`), which is green.

## Anything undone, and why

1. **"SECURE requires the lamp lit at the secure wave"** — see F-E3MS-1. Blocked by the firewall;
   the achievable half (a real, era-mechanic secure gate that a dark corridor cannot pass) shipped.
2. **The published mask mirror** — see F-E3MS-2. Outside the firewall.
3. **The relay/REPAIR vocabulary in the mechanics manifest** — see F-E3MS-3. Outside the firewall,
   and at parity with the Canyon Works either way.
4. **`public/skill.md`** — nothing owed. No view field was added (the circuit rides the existing
   `now.canyonConnect` shape, which the schema registry does not list because it is per-contract),
   no verb was added, and the view schema version is untouched at 2. The rider's documentation for
   this map is its published mechanics manifest, which now carries `connect_objective`;
   `skillmd-guard` and `skillmd-contracts-guard` are green.
5. **A second bench seed (`e3-moth-season-02`)** — the floor fixture is recorded for `-01` only,
   which is what the master asked for ("one seed"). `-02` was measured green in the census harness
   (secured at wave 12, `fnv1a32:af12e608`) but has no recorded floor reel.

## Post-run confirmation

`computeEngineHash()` re-run on the final tree returns `869f345151896ee319a959e2922763a93082fca12b944b045a2351cf80aa6aba`,
byte-equal to `assets/engine-era.json`'s top-level `engineHash` and to its newest pin.
The `goal tree schema` red is a non-SHA leaf id in `tasks/goals.json`
(`'attended-evidence-commits-2026-09-04'` against `/^[0-9a-f]{40}$/`) and predates this lane.
