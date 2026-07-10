# E3 power-graph integration proposal

- **Status:** PROPOSAL — RATIFICATION REQUIRED
- **Date:** 2026-07-11
- **Scope:** Bind the dormant deterministic power solver to construction, economy, light gameplay, objectives, fixed-tick determinism, multiplayer, and suspend. This document proposes seams and slices; it contains no prototype code.

## Decision summary

E3 should have one authoritative `PowerGraphSystem` in the fixed-tick simulation. It owns wire topology and power allocation; it publishes an immutable `PowerGridSnapshot`. Every powered consumer reads that snapshot. Rendering and the brown-out ledger are projections, never simulation owners.

Watts are instantaneous graph capacity, not an `EconomyResourceId` or banked balance. A powered machine calculates its normal yield or rate from its allocation, then submits the ordinary event through `Economy.apply()`. This preserves Economy as the only resource writer and fulfills the saga's “zero new resources to learn” strategy promise (`specs/epoch-saga/README.md:69-80`).

Use persisted, monotonic building instance IDs as wire endpoints. Do not use pool indexes, display names, or coordinates. Coordinate-derived IDs were considered and rejected: demolishing and rebuilding on the same footprint could inherit an old endpoint, while pool indexes are reused after restore.

Do not begin product integration until Session A's lockstep-action and snapshot-v2 branches have landed. Their current branch contracts still identify buildings as `{id,index}` (`origin/sol/lockstep-actions@b351fd4a:src/mp/LockstepClient.ts:7-23,684-712`; `origin/sol/mp-snapshot-completeness@7186984c:src/game/RunSuspend.ts:179-193`). The first integration slice must replace that external identity everywhere, not add a second address space.

The epoch ladder is a separate hard gate: only this proposal and dormant PG-01 solver hardening may land early. PG-02 and every player-facing or state-bearing E3 slice wait until the E2 transition is shipped and owner-played (`tasks/BACKLOG.md:95-105`).

## Canon and acceptance target

The Canyon Works contract requires a player-strung graph, deliberate brown-outs, looped redundancy, roughly three day waves followed by three night waves, night ambushes in unlit zones, powered galleries by wave 6, powered tram yield, and cut-to-dark propagation within one tick (`specs/epoch-saga/e3-voltage-bundle.md:53-80`). Night is deep ink-blue parchment, never black; powered light is warm lamp-gold (`specs/epoch-saga/e3-voltage-bundle.md:4-6`).

The end-to-end target is therefore:

```text
deterministic player action
        |
        v
stable endpoint projections (buildings / contract fixtures / effects)
        |
        +--------------------> PowerGraphSystem ----> immutable PowerGridSnapshot
                               |                         |
                     canonical wires/allocation         +--> powered machines --> Economy.apply
                               |                         +--> LightField --> spawns/objectives
                               |                         +--> brown-out ledger
                               +----------------------------> suspend/hash

presentation: PowerWireView + LightRig read snapshots; neither can change gameplay
```

## What exists now

### Solver

- `src/systems/PowerGraph.ts:7-37` defines producer/relay/consumer inputs, wires, three power states, and transition events.
- `src/systems/PowerGraph.ts:127-149` captures an immutable definition in the constructor, builds render geometry once, and uses solve count rather than the supplied tick. It cannot accept a placed, demolished, cut, or repaired network.
- `src/systems/PowerGraph.ts:211-295` canonically sorts well-formed unique IDs, but duplicate node IDs, duplicate/self edges, and explicit wire-ID collisions are not normalized and may remain order-sensitive. Existing tests prove repeatability of one seeded fixture, not arbitrary input-permutation invariance (`e2e/e3-power-graph.spec.ts:114-136`). Consumers brown out in lexical ID order (`src/systems/PowerGraph.ts:241-264`) and the result omits allocated watts and allocation ratio (`:275-294`).
- `src/systems/PowerGraph.ts:195-208` creates catenary geometry once. Dynamic topology needs a presentation rebuild keyed by topology revision.
- `e2e/e3-power-graph.spec.ts:41-136` proves flag-off zero work, the development fixture, basic brown-out behavior, invalid spans, and seeded repeatability. It does not yet prove dynamic mutation, fixed-render-schedule equivalence, restore, or powered consumers.

### Integration seams

- `src/game/buildables.ts:12-31` already reserves `BuildableDef.power`, but its optional `produces`/`consumes`/`relay` shape can express contradictory roles and no current definition uses it.
- `src/systems/BuildSystem.ts:600-645` owns paid and free placement; `:1151-1250` owns placed/wrecked/repaired lifecycle. Pool indexes are implementation storage, not durable identity.
- `src/game/Game.ts:1316-1455` is the 30 Hz fixed update. `simTick` advances at `:1327`; the graph currently updates after BuildSystem at `:1415`, too late to power same-tick machine effects.
- `src/core/Loop.ts:1-2,108-147` defines the 30 Hz accumulator and render-rate-independent stepping contract.
- `src/game/Economy.ts:73-100,215-239` is the event reducer and sole balance writer. Its summary treats sinks beginning with `build_` as buildings (`:153-169`), so wire spend needs a distinct sink such as `string_power_wire`.
- `src/world/LightRig.ts:35-48,148-180` owns the current Night Shift palette and drives background, fog, and ground to literal black in full darkness. `src/game/Game.ts:1526-1547,3124-3195` assembles enemy light coverage from presentation, with an E1 contract-ID special case. Gameplay cannot depend on that render phase.
- `src/entities/pools.ts:323-378,863-864,959-960` contains the current light-factor sampler and uses it for diagnostics/rendering. That useful formula should move to a simulation-owned light field before spawning, objectives, or enemy behavior consume it.
- `src/meta/ContractFamilies.ts:365-414` has briefing strings and `secureWave`, but no typed runtime objective. `src/game/RunManager.ts:177-194` secures from wave state alone.
- `src/meta/ContractFamilies.ts:738-746,769-805` synthesizes fallback content when an epoch has no contract part, permits debug/launched lookup across the global board, but still chooses the default epoch for ordinary active selection. `assets/contracts/epoch-3-voltage/manifest.json:1-42` has no authored contract part. Generic active-epoch routing plus authored E3 contract data is a prerequisite to the composition slice.
- `src/game/RunSuspend.ts:23-73,418-520,634-688,801-899` is version-locked to v1 with strict required surfaces but tolerant economy-log normalization that drops malformed events. It has no graph, objective, or stable building identity, and restore recreates buildings through reusable pool positions.
- `src/game/Game.ts:1566-1604,1632-1686` reuses suspend for multiplayer resync and hashes buildings but not graph, light, or objective state.

## End-state ownership

| Concept | Sole owner | Public seam | Must not own |
| --- | --- | --- | --- |
| Placed building identity, transform, HP, wreck state | `BuildSystem` | sorted immutable building projection with stable `instanceId` | wires, flow, balances |
| Fixed Dynamo/probe endpoint definitions | contract descriptor/runtime | sorted immutable fixed-endpoint projection | allocation, runtime wire state |
| Wire topology, cuts, priorities, allocation, transition events | `PowerGraphSystem` | deterministic commands in; `PowerGridSnapshot` out | building storage, gold, rendering |
| Resource balances and costs | `Economy` | existing `EconomyEvent`/`apply` | watts, connectivity |
| Day/night phase | `DayNightCycle` | fixed-tick `DayNightSnapshot` | spatial light, rendering |
| Gameplay illumination | `LightField` | pure point/zone queries from cycle + powered sources | enemy mutation, render lights |
| Power-objective progress | narrow `ContractObjectiveSystem` | typed objective status | run completion |
| Run completion | `RunManager` | required-objective eligibility predicate | objective evaluation |
| Wire/light visuals | `PowerWireView` and `LightRig` | snapshots in | simulation mutation |
| Validation/migration | canonical snapshot decoder | normalized authoritative inputs | partial recovery of a corrupt graph |

`Game` remains the fixed-tick orchestrator, not a second owner. No compatibility wrapper or parallel “E3 grid” should survive: refactor the dormant `PowerGraphSystem` into the runtime owner and split its current THREE view into a snapshot consumer.

## Proposed contracts

### Stable building identity

Every placed building receives a monotonic deterministic `instanceId`, for example `b000001`, from BuildSystem's persisted `nextInstanceSerial`. IDs never change when pool slots compact, and a removed ID is never reused during that run. Restore accepts the explicit ID before any graph projection is built.

This ID becomes the only external building reference in the same slice. Lockstep context actions, suspend/hash records, agent repair targets, shooter resume keys, diagnostics, and future power endpoints all migrate from `{id,index}` to `instanceId`. Buildable ID plus pool index remains private inside BuildSystem. No compatibility map survives the migration.

The BuildSystem projection is sorted by `instanceId` and contains only simulation data needed by power:

```ts
type PowerBuildingProjection = {
  instanceId: string;
  buildableId: BuildableId;
  x: number;
  z: number;
  lifecycle: 'live' | 'wrecked';
};
```

Not every E3 endpoint is a placed building. PowerGraph consumes one normalized endpoint union while each source retains its own state ownership:

```ts
type PowerEndpointProjection =
  | { source: 'building'; id: `building:${string}`; labelKey: string; building: PowerBuildingProjection }
  | { source: 'contract'; id: `contract:${string}:${string}`; labelKey: string; x: number; z: number; power: PowerRoleDef }
  | { source: 'effect'; id: `effect:${string}:${string}`; labelKey: string; attachTo: string; power: PowerRoleDef; expiresAtTick: number };
```

Contract endpoints cover the fixed Dynamo source and gallery probes. Effect endpoints cover later Crawler drain without a solver special case. A moving tram is not a graph node: its owner reads allocation from its stable station building, avoiding moving-wire geometry and a second identity scheme. The projection merger validates namespace uniqueness and canonical order; it does not own the source objects.

`BuildableDef.power` uses the same generic discriminated role definition as fixed and entity endpoints, replacing three optional flags:

```ts
type PowerRoleDef =
  | { kind: 'producer'; outputWatts: number }
  | { kind: 'relay' }
  | {
      kind: 'consumer';
      drawWatts: number;
      defaultPriority: number;
      brownout: 'binary' | 'scaled';
      lightRadius?: number;
    };
```

Wrecked buildings retain their stable ID and incident wires but project offline. Repair reconnects them. Demolition permanently removes the node and its incident wires. A later Dynamo Crawler drain is a transient synthetic consumer attached to a canonical nearest pylon; saboteurs issue `cutWire`, and moths modify the light field rather than teach the solver enemy-specific rules.

### Mutable deterministic graph

`PowerGraphSystem` accepts canonical fixed-tick commands and reconciles the current endpoint projections. Its authoritative state is nodes derived from those projections, wire records, cut state, and priority overrides. It solves only when an input revision changes, but publishes a snapshot every fixed tick.

```ts
type PowerWire = {
  id: string;                 // canonical sorted endpoint pair
  a: string;                  // stable endpoint ID
  b: string;
  state: 'intact' | 'cut';
};

type PowerNodeSnapshot = {
  id: string;
  kind: 'producer' | 'relay' | 'consumer';
  labelKey: string;
  componentId: string;
  demandWatts: number;
  priority: number;
  state: 'powered' | 'browned-out' | 'dark';
  allocatedWatts: number;
  allocationRatio: number;   // 0..1
};

type PowerComponentSnapshot = {
  id: string;
  nodeIds: readonly string[];
  supplyWatts: number;
  demandWatts: number;
  unusedWatts: number;
};

type PowerGridSnapshot = {
  tick: number;
  topologyRevision: number;
  allocationRevision: number;
  totalSupplyWatts: number;
  totalDemandWatts: number;
  nodes: readonly PowerNodeSnapshot[];
  wires: readonly PowerWire[];
  components: readonly PowerComponentSnapshot[];
  signature: string;
};
```

All watts are finite non-negative integers. Wires are normalized to sorted endpoints; self, duplicate, missing-endpoint, and over-length edges are rejected. Components, adjacency, nodes, and wires remain canonically sorted. Each endpoint supplies a stable `labelKey`; building keys derive from `buildableId`, while contract/effect descriptors declare theirs.

Allocation is exact and deliberately simple:

1. Work independently per connected component.
2. Validate consumer `drawWatts` as a positive integer and `priority` as an integer from 0 through 255; 0 is highest priority.
3. Sort consumers by ascending `(priority, stable endpoint ID)`.
4. For each consumer, assign `min(drawWatts, remainingSupply)` and subtract it before visiting the next consumer.
5. Derive `allocationRatio = allocatedWatts / drawWatts`; ratio 1 is powered, 0 is dark, and the interval between is browned-out.

The consumer's `binary`/`scaled` policy affects only its downstream behavior, not allocation. Therefore an under-supplied binary load consumes the remaining component supply and leaves lower-priority loads dark. Producers/relays expose ratio 1 when their component has supply and 0 otherwise, with `allocatedWatts` 0. Transition event ticks use `simTick`, not solve count.

Initial and restored snapshots may report state for diagnostics, but rewards and objectives derive from snapshots, not transition events. This prevents restore from paying or completing anything twice.

### Wire-stringing transaction

Wire-stringing is a two-confirm build submode:

1. Select a live power-capable endpoint.
2. Select a distinct second endpoint.
3. Submit the pair through Session A's canonical lockstep action envelope.
4. At its fixed tick, validate endpoint state, duplicate/self edge, maximum span, and affordability.
5. Apply exactly one Economy spend using a new explicit `string_power_wire` sink only after graph validation succeeds.
6. If Economy returns `ok`, perform the now-infallible graph commit and publish the new topology revision; otherwise change nothing.

The validation and commit occur together in one fixed-tick command handler, with no intervening mutation. Invalid, unaffordable, or replayed actions do not spend. Input ordering is the canonical order supplied by the lockstep reducer; graph code must not invent a competing timestamp or DOM order. The current direct browser placement call at `src/systems/BuildSystem.ts:997-1005` is therefore not an acceptable E3 seam.

### Fixed-tick order

BuildSystem needs a clean phase boundary between build/lifecycle mutations and powered machine effects. Within `Game.update()` the order becomes:

1. Apply the already-canonical player and enemy network commands for this tick.
2. Apply building lifecycle mutations and project stable power nodes.
3. Reconcile and solve `PowerGraphSystem.step(simTick, projection)`.
4. Ask `WaveSystem.beginFixedTick(atSim)` to advance/plan the authoritative wave and return immutable due-spawn intents without spawning enemies.
5. Advance `DayNightCycle` from that authoritative wave/tick and derive `LightField` from powered lamps.
6. Call `WaveSystem.executeSpawns(plan, lightSnapshot)`; WaveSystem keeps RNG and spawn ownership but filters contract gates through the supplied light oracle.
7. Run powered building effects, combat, harvest, and objective sampling.
8. Publish immutable simulation snapshots for presentation.

A wire cut occurring later in tick N becomes dark by the graph step in tick N+1, satisfying “within one tick.” Rendering catenaries and real lights happens after simulation and only rebuilds when the relevant revision changes.

### Powered consumers and Economy

PowerGraph knows allocation, not machine semantics. Each consumer reads its `allocationRatio`:

- `binary` consumers are enabled only at ratio 1.
- `scaled` consumers multiply a rate, yield, or radius by the ratio using an explicit per-building rule.
- A powered tram or sluice submits its adjusted ordinary yield event to Economy; it never mutates gold directly.
- A turret gates its existing shooter handle; CombatSystem remains the only damage resolver.
- A lamp contributes a simulation light source. The renderer later projects that source into a pooled real light or painted halo.

The initial integration ladder exercises one binary consumer, one scaled consumer, and one lamp in separate slices. Chain lightning, storage, transmission loss, and player-authored automation are explicit non-goals until their own contracts are ratified.

### Day/night and LightField

Replace the E1-only presentation special case with a contract-driven, fixed-tick schedule:

```ts
type LightSchedule =
  | { kind: 'ramp'; /* current E1 dusk/dark/dawn parameters */ }
  | { kind: 'wave-cycle'; dayWaves: number; nightWaves: number };
```

Migrate E1 to `ramp` without changing its current gameplay or visual assertions. E3 uses `wave-cycle` with the bundle's approximate 3/3 cadence. `DayNightCycle` publishes phase and intensity; `LightField` combines that with sorted powered light sources and owns all spatial light-factor queries.

At night, `WaveSystem` receives a read-only light sampler and a sorted list of eligible contract gates. It filters for unlit candidates, then performs one deterministic RNG choice. If every dark-ambush gate is lit, that ambush slot is skipped without an RNG draw; baseline scheduled enemies continue through the contract's ordinary gate policy. It must not use render light objects, retry loops, or iteration order. Enemy rendering, moth behavior, and powered-zone objectives consume the same light snapshot.

### Contract objectives

Do not introduce a universal quest framework for one teaching contract. Add the narrow typed objective the Canyon Works needs:

```ts
type PowerZoneObjective = {
  id: string;
  kind: 'power-zone';
  targets: readonly { zoneId: string; probeEndpointId: string }[];
  requiredPowered: number;
  minimumRatio?: number;
  deadlineWave?: number;
  requiredForSecure: boolean;
};
```

Zone IDs reference descriptor-owned build zones and each paired probe ID references a descriptor-owned fixed endpoint inside that zone. A target is powered when its live probe's snapshot ratio meets `minimumRatio`; connected relays/producers expose ratio 1 or 0, and consumers expose their allocation ratio. This prevents an unrelated powered building from satisfying a gallery. `ContractObjectiveSystem` owns progress and deadline latches. `RunManager` remains the only completion owner and asks whether every `requiredForSecure` objective is eligible.

Recommendation: ship “power N galleries by wave 6” first as a medal/bonus target (`requiredForSecure: false`), not an instant loss or permanent run lock, until the owner ratifies failure semantics.

### Suspend, migration, and multiplayer

Extend Session A's canonical snapshot version; do not create a second E3 save format. Persist authoritative inputs only:

- `simTick` or the canonical simulation clock already selected by snapshot v2.
- Building `instanceId` plus `nextInstanceSerial`.
- Canonical wires: endpoints and intact/cut state.
- Consumer priority overrides, if the ratified UI permits them.
- Any non-derivable temporary power modifier with an explicit expiry tick.
- Objective completion/deadline latches that cannot be reconstructed from current topology and wave.
- A day/night tick anchor only if phase cannot be derived from the restored contract and wave clock.

Do not persist solved components, allocations, light samples, THREE resources, diagnostic timing, or render geometry. Recompute those projections.

Restore order is binding:

1. Decode and normalize the entire snapshot at the 069 boundary; reject the whole invalid power block rather than partially applying it.
2. Restore buildings with explicit stable IDs and the next serial.
3. Derive nodes, then validate/apply wires, cuts, priorities, and modifiers.
4. Restore objective latches and the canonical clock.
5. Solve once at the restored `simTick`, suppressing reward-bearing transition behavior.
6. Compare the recomputed canonical graph signature when a verification signature is present.

Validation rejects duplicate or malformed IDs, a `nextInstanceSerial` not greater than every active building serial, missing endpoints, self/duplicate/over-length edges, explicit wire-ID collisions, unknown states, non-finite values, limit overflow, and malformed objective references. Historical reuse is not inferred without tombstones. Cap the normalized surface at 128 nodes and 256 wires unless a measured later tile raises it.

Both migrations are explicit. Repository v1 snapshots and Session A's pre-power v2 snapshots produce no graph and allocate stable IDs in decoded `buildings` array order; that order is part of each migration fixture. All `{id,index}` references inside the same snapshot—agent repair targets, shooters, and other building keys—rewrite through that one migration map, which is discarded after normalization.

The canonical multiplayer hash and resync snapshot must include building IDs/next serial, graph inputs, day/night state or its derivation inputs, and objective latches. A co-op E3 contract is blocked until uninterrupted, suspend/resume, and resync runs produce the same graph signature and Economy totals.

## Brown-out ledger and presentation

The first ledger is read-only. It shows component supply/demand and each consumer's label, demand, allocation ratio, priority, and powered/browned-out/dark state. Player-editable breakers or priority reordering are deferred pending ratification; fixed descriptor priorities are deterministic and enough to teach the mechanic.

`PowerWireView` consumes topology snapshots, builds live and cut catenaries in batches, and rebuilds only on topology revision. Target two or three wire draw calls, regardless of span count. `LightRig` consumes day/night and light-source snapshots; it uses a capped pool of real lights and painted halos for the rest. Neither system is reachable from a gameplay query.

Every slice that changes a visible scene or UI must finish with an unprimed `screenshot-critique` at desktop and 390 px. When a prior scene or reference exists, run `compare-screenshots` for a candidate-versus-target less-wrong verdict. Judge one visual variable at a time: wire legibility, then night palette, then ledger legibility; whole-frame comparison belongs to Canyon Works composition.

## Ratification calls

1. **Priority control:** recommended first ship is fixed contract/buildable priorities and a read-only ledger. Defer player breakers/reordering.
2. **Wave-6 consequence:** recommended first ship is bonus/medal, not hard failure or secure blocker.
3. **Brown-out semantics:** recommended consumer-declared `binary` or `scaled`; no global behavior hidden in the solver.
4. **E1 migration:** preserve current Night Shift behavior while moving its schedule and light oracle into simulation ownership.
5. **Stable identity:** recommended monotonic persisted building serial. Rejected alternative: role/quantized-coordinate identity, because a rebuild can collide with removed state.
6. **All-lit night:** recommended behavior is to skip only the dark-ambush slot without consuming RNG; ordinary scheduled enemies still spawn through their normal policy.

## Ranked risks

| Priority | Risk | Containment |
| --- | --- | --- |
| P0 | Pool-index or coordinate endpoints reconnect the wrong building after restore/rebuild | Stable monotonic IDs, hostile restore fixtures, index-reuse test |
| P0 | A stable ID is added only for power while actions/save/agent/shooters keep `{id,index}` | One atomic external-identity migration in PG-02; pool index becomes private |
| P0 | Local DOM action order diverges in multiplayer | Wait for Session A lockstep actions; only canonical fixed-tick commands mutate topology |
| P0 | A paid wire exists before its state can survive suspend | Land graph persistence PG-03 before paid wire tool PG-04 |
| P0 | Player-visible E3 work bypasses the epoch ladder | Hard **ERA** gate on PG-02 onward; only dormant PG-01 may land early |
| P0 | Presentation light becomes gameplay input | Simulation-owned `DayNightCycle` and `LightField`; render objects are write-only projections |
| P0 | Graph/objectives omitted from suspend or hash | Land canonical persistence/hash before powered content or co-op |
| P1 | Lexical IDs silently decide brown-outs | Explicit integer priority then stable-ID tie-break; ledger displays the result |
| P1 | Restore emits duplicate rewards/objectives | Snapshot-derived effects; transition events informational and restore-suppressed |
| P1 | Current BuildSystem update order applies stale allocation | Split lifecycle/action and powered-effect phases; solve between them |
| P1 | Dynamic catenary/light rebuilding enters the fixed tick | Revision-keyed presentation rebuild and pooled lights only |
| P1 | Monolithic wave update selects gates before the current light snapshot exists | Split plan/wave advance from spawn execution while WaveSystem retains ownership |
| P1 | E3 content is composed before generic contract routing exists | Make runnable E3 contract data a composition prerequisite |
| P1 | Dynamo/probe/tram assumptions hide missing substrates | Fixed contract endpoints in PG-02/09; explicit external tram-entity gate and station link |
| P2 | Night spawning consumes extra RNG or unordered gates | Sort/filter once, then one canonical RNG draw |
| P2 | A broad objective framework expands the slice | Implement only typed `power-zone`; add new objective kinds when a real contract needs them |

## Slice plan

Each slice has one owner seam and a runnable review surface. The orchestrator must re-anchor file lines when ratifying because Session A is changing BuildSystem and snapshot seams.

External gates are hard stops:

- **ERA:** E2 transition shipped and owner-played. Only dormant PG-01 may precede it; PG-02 onward waits (`tasks/BACKLOG.md:95-105`).
- **ACTIONS:** `origin/sol/lockstep-actions` is merged and its canonical action envelope is stable.
- **SNAPSHOT:** `origin/sol/mp-snapshot-completeness` is merged and its v2/five-surfaces migration API is stable.
- **TRAM ENTITY:** a separately owned fixed-tick rail follower exists with stable entity ID, persistence, and yield hook. The shipped rail slice is intentionally render/data only and has no cart logic (`tasks/lane-d-e2-rail-entity.md:3,8-16`). This blocks only PG-12 and the tram part of composition.

```text
PG-01
ERA + ACTIONS + SNAPSHOT -> PG-02 -> PG-03 -> PG-04 -> PG-05
                                      |------> PG-06
PG-03 -> PG-07a -> PG-07b / PG-07c
PG-08a -> PG-08b -> PG-08c -> PG-08e
PG-07a + PG-08c -> PG-08d
PG-02 -> PG-09; PG-08b + PG-09 -> PG-08f
PG-06 + PG-09 -> PG-10
PG-01 -> PG-11
TRAM ENTITY + PG-06 + PG-07c -> PG-12
all applicable prior slices -> PG-13
```

### PG-01 — Mutable solver and read-model contract

Refactor the dormant solver into a simulation-only runtime: normalized canonical inputs, mutable wires, cut/repair, online nodes, explicit priority/allocation ratios, actual `simTick` events, the ledger-complete immutable snapshot, dirty revisions, and reset. Split its THREE view into a snapshot consumer in the same refactor so no second grid abstraction appears.

**Review surface:** existing `?debug&power=dev` fixture backed by the new read model.

**Gates:** hostile duplicate node/wire IDs, self/duplicate edges, and input permutations normalize or reject deterministically; cut → downstream dark at N+1; repair; priority/tie-break; loop; reset; 30/60/144 render schedule equality; warmed 128-node/256-wire stress fixture p95 ≤0.5 ms on the gate host; flag-off zero work; existing E3 gates remain green.

### PG-02 — Canonical endpoint identity

After **ERA**, **ACTIONS**, and **SNAPSHOT**, add monotonic building IDs and migrate every external `{id,index}` reference in one change: lockstep context actions, v1/v2 snapshots and hashes, agent repair targets, shooter resume keys, diagnostics, and power projections. Add fixed-endpoint projection fixtures; pool indexes stay private. No wires or powered effects yet.

**Review surface:** diagnostics map live buildings and fixed fixtures to stable namespaced endpoint IDs.

**Gates:** place/wreck/repair/demolish; pool-index reuse; stale external index impossible; v1 and pre-power-v2 migration; all cross-references rewrite through one discarded migration map; next-ID restore; action/hash/suspend and existing BuildSystem suites.

### PG-03 — Graph persistence scaffold

Extend the canonical snapshot with wire endpoints/state, priority overrides, and graph limits before any paid wire action exists. Use deterministic debug-injected wires to exercise capture/restore; nodes and solved outputs remain derived. Temporary effect state is added only with the later content slice that first needs it.

**Review surface:** uninterrupted and suspend/resume debug runs end with the same graph signature.

**Gates:** v2 round trip; 069 hostile graph fixtures; no partial apply; missing/self/duplicate/over-length/colliding wires rejected; cut/priority retained; same signature and Economy state after resume.

### PG-04 — Wire-stringing transaction

Add the two-confirm tool through the canonical action envelope, validation-before-spend, canonical wire records, and cut/repair commands. Persistence already exists. Use diagnostics rather than production wire art in this slice.

**Review surface:** the player strings a loop, suspends/resumes, cuts one span, and reads the alternate live route in diagnostics.

**Gates:** invalid, unaffordable, or replayed actions never charge; one valid edge charges once; Economy failure changes nothing; purchase survives resume; demolish removes incident edges; wreck retains them offline; keyboard/touch actions serialize identically.

### PG-05 — Dynamic catenary view

Make `PowerWireView` rebuild batched live/cut catenaries only when `topologyRevision` changes. Use placeholders through existing asset/layer contracts until ratified art exists.

**Review surface:** the PG-04 loop and cut are visible in the world.

**Gates:** geometry follows current endpoints; cut/live style; zero rebuild on unchanged revision; dispose/reset; ≤3 wire draw calls. Capture desktop/390 shots, run `screenshot-critique`, and compare wire legibility against the development catenary fixture with `compare-screenshots`.

### PG-06 — Multiplayer hash and resync

Extend Session A's canonical state hash and resync projection with the authoritative inputs from PG-02/03. Do not add a power-only resync path. Reconnect remains owned by Session A's separate MP-RECONNECT item and is not an acceptance gate here.

**Review surface:** two peers show matching graph signatures before and after forced resync.

**Gates:** graph mismatch is detected; resync restores exact signature; identical Economy totals; 100+ lockstep ticks; 30/60/144 render schedule equality.

### PG-07a — Fixed-tick consumer seam

Split BuildSystem's lifecycle/action phase from its powered-effect phase, solve between them, and expose one immutable allocation lookup to consumers. Use a deterministic probe consumer only; do not change a real machine yet.

**Review surface:** a fixed-tick trace shows action → projection → solve → effect order.

**Gates:** N+1 cut response; no stale allocation; reset; 30/60/144 render schedule equality; uninterrupted/resume equality.

### PG-07b — Binary combat consumer

Bind one turret's existing shooter enablement to a `binary` allocation. Power code never deals damage.

**Review surface:** a controlled cut disables and repair re-enables one turret.

**Gates:** CombatSystem remains the only damage resolver; no shot while underpowered; target/order behavior unchanged when powered; fixed-render-schedule and suspend/resume equality.

### PG-07c — Scaled Economy consumer

Bind one producer's yield/rate to a `scaled` allocation and emit its ordinary Economy event.

**Review surface:** a deterministic shortage fixture reports the expected ratio and yield.

**Gates:** exact event amounts and totals; no direct balance writes; bank-cap behavior unchanged; cut/repair and suspend/resume equality.

### PG-08a — Wave fixed-tick phase seam

Split monolithic `WaveSystem.update()` into `beginFixedTick()` and `executeSpawns()` without changing E1 timing, plans, telegraphs, RNG count, or roster. WaveSystem remains the only wave/spawn owner; this slice adds no darkness logic.

**Review surface:** an E1 trace records identical plan, telegraph, wave-start, spawn, and RNG sequences before/after.

**Gates:** boundary tick parity; pause-at-wave-start; trickles; Baron wave; 30/60/144 equality; suspend/resume of pending pulses.

### PG-08b — Generic day/night cycle

Between the two WaveSystem phases, extract the current E1 ramp into fixed-tick `DayNightCycle`, then add the contract-driven wave cycle. This changes scheduling only, not light coverage, palette, or spawning.

**Review surface:** phase/tick harness showing E1 ramp and E3 3/3 cycle.

**Gates:** current E1 Night Shift behavior remains identical; due-wave boundary uses the new authoritative wave from PG-08a; reset/restore exact.

### PG-08c — Simulation LightField

Move the light-factor formula into fixed-tick `LightField` and make current render/diagnostic consumers read its immutable snapshot. Preserve current sources; powered lamps and new gameplay consumers are not added yet.

**Review surface:** debug overlay for source radii and sampled zone factors.

**Gates:** pure point/zone fixtures; source-order invariance; no THREE objects in the oracle; E1 coverage unchanged. Capture day/night desktop/390 shots, judge migration parity with `screenshot-critique`, and use `compare-screenshots` against the pre-migration E1 view.

### PG-08d — Powered lamp source

Project one allocated lamp into `LightField`; make gameplay radius follow its declared binary/scaled policy. This changes powered coverage only, not palette or spawn policy.

**Review surface:** cut and repair change one lamp's debug radius and pooled world light.

**Gates:** exact radius/ratio; N+1 cut response; pooled presentation lights; no render-to-sim query; suspend/resume equality. Capture desktop/390 lamp crops, run `screenshot-critique`, and compare powered versus unpowered coverage with `compare-screenshots`.

### PG-08e — Deterministic dark ambushes

In `executeSpawns()`, filter sorted contract ambush gates through the read-only LightField and perform one RNG choice among unlit candidates.

**Review surface:** seeded gate-choice/RNG trace over a day/night cycle.

**Gates:** day behavior unchanged; dark ambushes spawn only at unlit gates; all-lit skips only the ambush slot with zero fallback RNG draw; baseline scheduled enemies continue normally; 30/60/144 and suspend/resume equality.

### PG-08f — E3 night palette

Add a contract-driven presentation palette and wire E3 to deep ink-blue background/fog/ground plus lamp-gold pools; preserve E1's existing palette. This slice changes colour only, not darkness amount, coverage, or spawning.

**Review surface:** fixed E3 night fixture at desktop/390.

**Gates:** E3 diagnostics contain no black background/fog/ground; teal agent glow remains distinct from lamp gold; E1 screenshot unchanged. Run `screenshot-critique`, then `compare-screenshots` against the ratified E3 palette plate or bundle reference.

### PG-09 — Active E3 contract and Canyon descriptor

Own the missing prerequisite: route ordinary active selection through the activated epoch, add an authored E3 contract part, and validate a placeholder-first Canyon Works descriptor containing zones, spawn gates, fixed Dynamo/probe endpoints, light schedule, night palette, and objective data. This is data/routing, not full terrain or gameplay composition.

**Review surface:** the board launches the authored Canyon contract without a debug query; diagnostics report E3 as active.

**Gates:** locked epoch cannot launch; activated E3 selects its own fallback; unknown IDs remain 069-safe; E1 replay board unchanged; descriptor references validate; plain boot remains E1 before activation.

### PG-10 — Powered-zone objective

Add only the `power-zone` objective, deadline/complete latch, and RunManager eligibility predicate. Keep the first surface diagnostic; player-facing copy lands with composition.

**Review surface:** objective probe for 0..N powered galleries.

**Gates:** descriptor zone/probe pairs; probe-in-zone validation; boundary placement; minimum ratio; brown-out/cut/repair; wave-6 deadline; required-versus-bonus semantics; snapshot/hash continuity.

### PG-11 — Brown-out ledger

Add the read-only ledger from `PowerGridSnapshot`. Keep priority controls out unless ratified; if approved, make their action and persistence a separate sub-slice.

**Review surface:** supply shortage, multiple priorities, cut component, and recovered component states.

**Gates:** snapshot-only UI; component totals equal node totals; exact labels/demand/priority/ratios; keyboard/touch accessibility; no simulation writes; desktop/390 text fit. Run `screenshot-critique`, then `compare-screenshots` against the approved panel reference if one exists.

### PG-12 — Tram power adapter

After **TRAM ENTITY**, let the tram owner consume allocation from its linked, stable station-building endpoint for the yield hook. PowerGraph does not move the tram or award gold.

**Review surface:** a fixed-tick rail follower crosses a cut boundary and changes its powered yield.

**Gates:** tram/station link restore; exact Economy events; no power-side movement; 30/60/144, suspend/resume, and resync equality.

### PG-13 — Canyon Works composition

After all applicable prior slices, compose Dynamo source, looped pylons, gallery probes, lamp, turret, and powered tram on seed `canyon-1`. If **TRAM ENTITY** is not ready, the composition gate remains open rather than substituting a fake cart. Keep saboteur, moth, Crawler drain, and dam surge as later content slices using established commands/snapshots rather than widening the solver.

**Review surface:** full generator → loop → gallery/light/tram contract, including a cut and night transition.

**Gates:** every powered probe traces to Dynamo; cut → downstream dark within one tick; alternate loop survives; night ambushes only unlit; gallery objective; powered tram bonus; suspend/resync equality; seed determinism; mobile logic unchanged; full grid/night ≤200 draw calls. Capture the whole frame at desktop/390, run `screenshot-critique`, and use `compare-screenshots` for the final candidate-versus-ratified Canyon Works reference.

## Scope firewall

This proposal does not implement or ratify E3 content, edit RunSuspend/SaveSlots/multiplayer code, add art, create a new Economy balance, change CombatSystem ownership, add chain lightning/storage/transmission loss, or define E7 automation. It names the seams Session A must expose, then leaves all product work to separately claimed slices after orchestrator ratification.
