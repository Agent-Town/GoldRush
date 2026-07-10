# E7 playbook engine — deterministic command tape, not input macro

**Status:** design study plus throwaway `?debug&playbook` semantics lab. This is not product wiring.

**Decision:** a production playbook is a small, immutable, fixed-tick program of already-typed semantic commands. Recording grants no authority. Playback enters the same command dispatcher as player and agent actions, rechecks live consent at every step, and halts rather than improvising. Corrupted waves and the Echo consume validated derivatives through enemy-only adapters; they never invoke player tools.

This is the narrow substrate that satisfies the E7 promise: “do a job once, name it, hand it to an agent” (`specs/epoch-saga/e7-signal-bundle.md:3`), the teaching patrol (`:26`), record/replay hash identity (`:28`), and execution through the typed tool surface with no new authority (`:31`). It does not attempt to design the Relay Valley, signal economy, LOS network, drone flock, or boss art.

## 1. Findings from the current engine

The right pieces exist, but they do not yet form a recordable deterministic seam.

1. `ToolSurface` has a useful tagged tool vocabulary and receipts (`src/agent/ToolSurface.ts:33-72`), but each side effect calls a game adapter synchronously (`:130-173`, `:182-237`). There is no command ID, issued/accepted/completed tick, executor identity, or resumable task state.
2. `place_building` can fall back to camera projection and synthetic pointer state (`src/agent/ToolSurface.ts:239-265`). Camera and canvas geometry cannot be part of a deterministic command path.
3. the global permission ladder only distinguishes side-effecting from read-only and admits every side effect above level zero (`src/agent/PermissionLadder.ts:24-30`). Per-ability consent exists (`src/agent/AgentConsent.ts:3-77`) but is currently checked by individual game automation paths, for example `Game.prospectorCan` (`src/game/Game.ts:3442-3445`), not by `ToolSurface` itself.
4. the installed agent receives only a subset of the declared adapters (`src/game/Game.ts:1188-1204`). A playbook must not assume a declared tool is executable in a particular contract.
5. `AgentStub` receipts are an in-memory/debug presentation feed (`src/agent/AgentStub.ts:35-80`, `:126-147`). They are not an authoritative event log and omit fixed ticks and stable command identities.
6. the core loop already provides fixed steps and bounded catch-up (`src/core/Loop.ts:108-147`). However, `Game.simTick` advances before the `simActive` guard (`src/game/Game.ts:1316-1328`, `:1389-1393`). A playbook clock must advance only with the active authoritative world, or pause/menus will consume scheduled steps.
7. `RunSuspendEnvelope` v1 covers run, combat, economy, buildings, meta, and RNG state but has no command/playbook runner state (`src/game/RunSuspend.ts:23-73`). Adding it is a save migration, not a local E7 convenience.
8. `origin/sol/lockstep-actions` is parked work, not a dependency. Its semantic action arrays and stable normalization are useful evidence for the future dispatcher, but E7 must land against the authoritative action seam chosen by the multiplayer owner.

The architectural gap is therefore not “serialize some key presses.” It is one authoritative semantic command seam shared by direct player actions, agents, replay, and multiplayer.

## 2. Production data contract

Keep the durable format intentionally small:

```ts
type PlaybookV1 = {
  schema: 'et.goldrush.playbook.v1';
  name: string;                 // mutable display metadata, 1..48 chars
  program: {
    tickRateHz: 30;
    durationTicks: number;
    steps: readonly PlaybookStepV1[];
  };
  programHash: `fnv1a32:${string}`;
};

type PlaybookStepV1 = {
  atTick: number;               // active ticks after playback start, one based
  call: RecordableCallV1;       // closed tagged union, never arbitrary JSON-RPC
};
```

`RecordableCallV1` is a closed, versioned union whose members use quantized values and stable domain IDs. The initial teaching slice needs only:

```ts
type RecordableCallV1 =
  | {
      tool: 'et.goldrush.follow_route';
      args: { anchorId: string; pointsQ: readonly [number, number][]; closed: boolean };
    }
  | {
      tool: 'et.goldrush.mark_signal';
      args: { anchorId: string };
    };
```

Other existing tools join the union one at a time only after they have deterministic handlers, stable targets, consent mappings, and save/restore semantics. In particular, current `{id,index}` building references are not durable enough: pool indexes are implementation details. A building-placement slice must first establish a stable `buildingInstanceId` assigned by the authoritative build owner.

The durable program deliberately excludes:

- permission level, capability ceiling, consent, executor, owner, and authority;
- run seed, world state, current target, retries, and fallbacks;
- wall-clock timestamps, camera/pointer coordinates, frame deltas, and raw input;
- mutable runner cursor or in-flight task state;
- corruption seed and mutation plan.

Those values belong to the execution or encounter envelope. Persisting them in the program would let a recording smuggle authority or bind reusable library content to one run.

### Canonical encoding and identity

The validator decodes into a normalized object with exact keys. It rejects unknown fields rather than preserving them. Canonical JSON sorts object keys, preserves array order, uses integers only, and forbids non-finite numbers. `programHash` hashes only `program`, not `name`, library slot, consent, or runner state. Renaming a tape therefore does not change behavior identity.

FNV-1a 32 is sufficient for deterministic telemetry and the existing local stable-hash convention; it is not authentication. Import/cloud boundaries must still use strict schema validation and their own integrity/authentication mechanism. A collision at library insertion is handled by comparing canonical bytes and refusing a same-hash/different-bytes entry.

Initial hard caps:

- 128 steps;
- 18,000 active ticks (ten minutes at 30 Hz);
- 96 route points per `follow_route`;
- 24 commands scheduled at one tick;
- 64 KiB canonical program bytes;
- nesting only where explicitly present in the tagged union.

These are validation limits, not balance knobs. They keep import, mutation, save, and multiplayer costs bounded.

## 3. Recording player demonstration

### Discrete actions

The recorder subscribes to successful authoritative command receipts after validation and acceptance. It never listens to DOM events, `Input` intents, `EventBus` presentation events, diagnostics, or economy log deltas. A successful recordable player command contributes `{atTick, call}` relative to the recording start tick. Failed, preview-only, UI-only, and non-recordable calls contribute nothing.

The recorder copies the normalized call from the receipt rather than the request. That matters when a handler snaps a position, resolves a stable target, or normalizes rotation.

### Continuous patrol movement

Raw WASD samples would be frame-, device-, and collision-dependent. The E7 teaching patrol instead compiles a demonstrated path into one or more semantic `follow_route` segments:

1. open a recording session at an active fixed-tick boundary;
2. sample the authoritative actor position every six active ticks (5 Hz);
3. quantize X/Z to quarter-world-unit integers relative to the contract's stable navigation anchor;
4. discard duplicates and collapse collinear interior points;
5. reject off-navmesh points and stop at 96 points across the tape;
6. when a discrete recordable action is accepted, close the current route segment at that position, then append the action; begin a new segment if movement continues;
7. on stop, close the final segment and validate the resulting sequential schedule.

Playback asks the normal movement owner to follow those waypoints. It does not replay velocity, collision results, animations, or key durations. The route handler reports completion or a typed failure. If terrain or occupancy has made the route invalid, the playbook halts; it does not silently retarget.

Recording itself is a temporary session object. Only a successfully validated program may enter the library.

## 4. One authoritative command dispatcher

All recordable behavior must pass through one seam:

```ts
type CommandEnvelope = {
  commandId: string;
  worldTick: number;
  source: { kind: 'player' | 'agent' | 'playbook'; sourceId: string };
  call: CanonicalCall;
};

type CommandReceipt = {
  commandId: string;
  call: CanonicalCall;
  issuedTick: number;
  acceptedTick: number | null;
  completedTick: number | null;
  status: 'rejected' | 'accepted' | 'complete' | 'failed';
  reason?: CommandFailure;
};
```

`ToolSurface` becomes a typed adapter into this dispatcher. It must no longer mutate systems directly or project world positions through the camera. Player UI actions use the same canonical calls where applicable. System ownership remains unchanged: Economy is still the only gold writer, CombatSystem the only damage resolver, BuildSystem the building owner, and the movement owner the only actor-position writer.

At each active fixed tick, the authoritative simulation performs this stable order:

1. advance `worldTick` only if the world is simulating;
2. apply permission/consent revocations and authoritative multiplayer inputs for that tick;
3. update already-accepted command tasks and publish their completion receipts;
4. enqueue direct player commands in stable actor/input order;
5. advance playbook runners sorted by stable `runnerId`, then step index;
6. validate and dispatch commands, deduplicating by `commandId`;
7. update the remaining gameplay systems and render from captured state.

Multiplayer changes the authority source, not the format: the host assigns the tick and command ID. Peers may predict presentation, but only the authoritative receipt is recordable.

### Runner semantics

A runner envelope contains an authority-minted, per-invocation `executionId`, `runnerId`, `programHash`, `startWorldTick`, `cursor`, current task/receipt ID, and status. The execution ID is derived from a persisted run/session ID plus an authority-owned monotonic serial, so it is never reused when the same runner starts the same tape again. Program steps remain immutable.

- The first eligible step is `atTick: 1`; a step is offered only when `worldTick - startWorldTick === atTick`.
- If the previous task is still active when the next step is due, the runner halts with `PREVIOUS_STEP_ACTIVE`.
- A missed scheduled tick halts. There is no late catch-up.
- Rejection, timeout, missing target, revoked consent, unavailable capability, or handler failure halts.
- V1 has no retry, skip, branch, loop, fallback, or implicit retarget.
- Multiple instantaneous same-tick steps retain array order.
- `commandId = "pb:" + executionId + ":" + stepIndex + ":" + programHash` makes restore/resend idempotent without colliding across separate invocations; it is a namespaced composite identity, not another short hash.

This strictness is a feature. The E7 counter-mechanic depends on a player being able to watch a replay and understand exactly where it diverged.

### Authority and consent

The effective grant is computed at dispatch time:

```text
available handler
AND progression ceiling
AND granted permission rung
AND granted ability
AND contract/tool budget
AND current world preconditions
```

The program stores none of those terms. Handing a tape to an agent grants nothing. Every step rechecks the live policy, so revocation stops the next effect. The dispatcher needs a single exhaustive `tool -> AgentAbility | read-only` mapping; checks scattered in `Game` are insufficient.

Paid actions reserve and commit through the owning system under `commandId`. Restoring or receiving a duplicate must return the prior receipt, never charge twice.

## 5. Validation pipeline

Validation is staged and pure:

1. decode JSON with byte/depth limits;
2. require exact schema and exact keys;
3. normalize every tagged call and quantized value;
4. enforce caps, monotonic ticks, stable IDs, and route bounds;
5. prove the schedule is feasible for the declared sequential semantics;
6. require every tool to be known and recordable in this schema version;
7. canonicalize, compute hash, and compare `programHash`;
8. return an immutable normalized program or an ordered list of reasons.

Validation says the tape is structurally executable; it does not grant consent or prove that today's world still contains its targets. Runtime policy and precondition checks remain mandatory.

## 6. Deterministic corruption

Corruption produces a new validated program plus provenance. It never edits the source library entry in place.

```ts
type CorruptedProgramEnvelope = {
  sourceProgramHash: string;
  mutationSeed: string;
  plan: readonly MutationV1[];  // fully materialized before the wave starts
  program: PlaybookV1['program'];
  programHash: string;
};
```

The seed is derived once from stable encounter facts such as run seed, contract ID, wave, encounter ordinal, and source program hash. Candidate mutations are enumerated in stable `(stepIndex, mutationKind, operandIndex)` order. A dedicated deterministic RNG selects without replacement. The finalized plan is persisted; restore never rolls again.

Allowed V1 mutations are deliberately boring:

- mirror a route across the encounter's declared axis;
- offset one interior waypoint by one quantized cell if it remains navigable;
- delay a step by a small integral tick amount while preserving order and feasibility;
- omit an explicitly non-side-effecting observation/mark step.

Forbidden mutations include:

- introducing a new tool, target kind, stable reference, resource, or authority;
- increasing the count of paid or damaging side effects;
- repeating, widening, or retargeting a paid or damaging effect;
- changing owner, executor, consent, capability, budget, save, network, or UI state;
- generating an out-of-bounds route or an infeasible schedule;
- consulting live array iteration order or rerolling after a failed candidate.

After transformation, the normal validator runs again. If the materialized plan is invalid, the encounter uses a fixed authored fallback and records the rejection. It does not reroll, because reroll-until-valid is state-dependent nondeterminism.

## 7. Corrupted automata and the Echo

There are two consumers, and neither is a player agent.

### Corrupted-playbook waves

A closed compiler maps a small safe subset of playbook motifs into an `AdversaryScript`. That script drives enemy intent through enemy movement, WaveSystem, and CombatSystem. Unknown or player-only calls have no mapping and cannot leak through. A corrupted `follow_route` can become an enemy patrol; a signal mark can become a telegraphed jammer pulse. A building purchase cannot become an enemy purchase.

This preserves the fantasy—your habits return glitched—without letting hostile code call `ToolSurface`, BuildSystem, Economy, save APIs, or profile APIs.

### Echo layout input

The Echo needs a canonical read model, not `window.__THREE_GAME_DIAGNOSTICS__` and not a `RunSuspendEnvelope`:

```ts
type BuildingLayoutV1 = {
  schema: 'et.goldrush.building-layout.v1';
  anchorId: string;
  mirrorAxisQ: number;
  buildings: readonly {
    instanceId: string;
    family: string;
    xQ: number;
    zQ: number;
    rotationSteps: 0 | 1 | 2 | 3;
    tier: number;
    wrecked: boolean;
  }[];
  layoutHash: string;
};
```

The authoritative build owner emits entries sorted by `instanceId`. The encounter mirrors quantized coordinates across its declared axis, validates footprints, and applies a fixed exclusion rule for invalid placements. There is no search-order-dependent nudging.

A closed `EchoPatternCompiler` combines the mirrored layout with selected playbook motifs and emits bounded enemy components: movement intent, telegraphed attacks, defense cadence, and jammer behavior. Components are capped before spawn and resolved by the existing enemy/combat owners. The Echo may visually resemble buildings, but it never instantiates player buildings or invokes their economic production.

Persist `layoutHash`, source program hashes, the materialized mutation plan, compiler version, spawned component IDs, and cursors. That makes suspend/restore and record/replay probes compare the actual encounter recipe.

## 8. Persistence and multiplayer boundaries

Three different things persist in different surfaces:

1. **library program:** durable family/profile data, exportable and cloud-syncable after strict validation;
2. **active runner:** run snapshot data (`executionId`, `runnerId`, program hash, cursor, start tick, in-flight receipt/task state);
3. **Echo encounter:** run snapshot data (layout hash, source hashes, materialized plan, compiler version, enemy component state).

The masterplan defines saves as five surfaces—versioned run state, transactional import, blank-device profile discovery, bounded cloud sync, and concurrent version recovery (`docs/MASTERPLAN-2026-07-10.md:38`). Playbooks must be added by that owner across all applicable surfaces. A library-only localStorage key would create another incompatible save silo.

Page-hide can occur during an accepted task. The task owner and runner must snapshot enough state to resume it without replaying a paid effect. If a handler cannot provide resumable state, it is not recordable in V1.

In multiplayer, the host chooses the library definition and sends canonical bytes plus hash as ephemeral room data. Peers validate and acknowledge the same hash. Guest devices do not silently persist the host's playbooks. The authoritative host owns runner ticks and mutation plans; join/resync snapshots carry current runner/encounter state.

## 9. Risk register

| Severity | Risk | Required control / gate |
| --- | --- | --- |
| P0 | A tape bypasses per-ability consent because `ToolSurface` checks only a global rung. | Central exhaustive tool-policy gateway; revoke-during-replay test must halt before the next effect. |
| P0 | Restore or relay duplicates a paid command. | Stable command IDs, owner-side idempotency, and suspend-after-accept/before-complete tests. |
| P0 | Echo code reaches player BuildSystem/Economy/tool APIs. | Separate `AdversaryScript` types and dependency test proving the compiler imports only enemy read models/owners. |
| P0 | Command order diverges between player, agent, replay, and multiplayer. | One dispatcher, one active world tick, stable source order, and identical-hash trace tests. |
| P1 | Raw input or camera projection enters the tape. | Recorder accepts normalized authoritative receipts only; remove pointer/camera fallback from recordable paths. |
| P1 | Pool indexes identify a different building after restore. | Stable placement instance IDs before building-target calls or Echo layout snapshots ship. |
| P1 | Mutation rerolls on restore or depends on live enumeration order. | Stable candidate sort, dedicated RNG, materialized persisted plan, restore-trace test. |
| P1 | Program imports smuggle unknown fields, huge routes, or authority metadata. | Exact-key decoder, byte/depth caps, closed call union, authority excluded from schema. |
| P1 | Active runner advances in pause/menu time. | Dedicated `worldTick` under `simActive`; pause/resume hash-identity test. |
| P1 | A long task overlaps a later absolute step and outcomes become timing-dependent. | Completion receipts plus fail-on-overlap/no-catch-up semantics. |
| P1 | Library content lands in only one of the save surfaces. | Save-owner migration across profile/import/cloud/concurrency gates before product wiring. |
| P2 | Hash collisions confuse telemetry. | Compare canonical bytes on insertion; never treat FNV as security or authority. |
| P2 | Large tapes or Echo layouts create frame spikes. | Hard caps, pure prevalidation/compilation, bounded components, perf harness gate. |

## 10. Implementation slices

Each slice is independently reviewable and browser-checkable. None should bolt a second command path beside an existing owner.

1. **PB-00 — command contract harness.** Ratify canonical calls, receipts, ordering, active `worldTick`, and trace fixture in a pure harness. No product action yet.
2. **PB-01 — stable domain references.** Add stable building instance IDs and canonical read models with save round trips. No playbook UI.
3. **PB-02 — authoritative dispatcher.** Route one harmless existing semantic action through dispatcher and typed receipt; player and agent traces match. Remove that action's direct adapter path.
4. **PB-03 — policy/idempotency seam.** Centralize per-tool consent and owner-side command dedupe; gate revocation and duplicate restore.
5. **PB-04 — `PlaybookV1` library core.** Pure exact decoder, canonical hash, caps, import rejection, and profile-owner persistence on all required surfaces.
6. **PB-05 — teaching patrol recorder.** Record/compile only `follow_route`; replay on one drone with pause, failure, and trace identity gates.
7. **PB-06 — runner suspend and multiplayer snapshot.** Cursor/in-flight state, page-hide recovery, host hash handshake, join/resync. This depends on the save and MP owners.
8. **PB-07 — bounded corrupted wave.** One deterministic route mutation through `AdversaryScript`; persist plan and prove restore identity.
9. **PB-08 — canonical layout and Echo vertical slice.** Mirror a capped layout into one enemy pattern without importing player mutation APIs.
10. **PB-09 — Relay Valley teaching contract.** Player-facing record/name/delegate/debug loop, accessibility, failure copy, visual and family gates.

Stop and reslice if PB-02 cannot replace a direct side-effect path cleanly, if stable IDs are not save-stable, or if PB-06 requires speculative wrappers around unsettled multiplayer work.

## 11. Throwaway semantics lab

The spike adds a query-gated lab at `?debug&playbook`:

- `src/main.ts` performs the gate and dynamically imports the lab only when both parameters exist;
- `src/spikes/playbook/PlaybookModel.ts` is a pure miniature validator, canonical hash, fixed-tick runner, bounded deterministic corruption, and Echo mirror;
- `src/spikes/playbook/PlaybookLab.ts` is the isolated DOM toy;
- `e2e/e7-playbook-spike.spec.ts` exercises record → validate → replay → corrupt → enemy-only mirror and asserts a plain boot neither installs nor loads the chunk.

The lab has only `lab.move_to` and `lab.mark`, a 7×5 grid, sixteen steps, and a 60-second tape cap. It records one-based absolute active-tick offsets, rejects unknown fields/tools, requires canonical timeouts, refuses overlapping schedules, and halts on missed ticks. A target mutation changes exactly one instruction and is admitted only when its canonical duration matches the source; otherwise the mutator uses a bounded one-step timing change. Its capability field is a lab allowlist, not production authority. Its FNV hash is telemetry, not security. The Echo avatar uses a separate mode and never imports the game, tool surface, save, economy, combat, or build systems.

The production build emits `PlaybookLab-*.js` as its own lazy chunk (22.15 kB / 7.57 kB gzip in this spike). The default bundle has only the query check and dynamic-import edge; the lab module is absent from plain-boot resource entries. There is deliberately no product engine wiring.

## 12. Verification ledger

Completed locally:

```text
npm run build
  PASS — TypeScript and Vite production build, rerun after atTick/corruption fixes
  PlaybookLab lazy chunk: 22.15 kB, 7.57 kB gzip

compiled PlaybookModel probe
  PASS — source validates; corruption changes exactly one step and revalidates;
         repeated source/corrupt traces match; agent and Echo complete;
         unknown authority field is rejected
```

Browser listeners are orchestrator-owned under the session's EPERM amendment. Exact gates to run:

```bash
npx playwright test e2e/e7-playbook-spike.spec.ts --workers=1
npx playwright test e2e/044-start-screen.spec.ts e2e/ed-01-descriptor-inspector.spec.ts --workers=1
```

Acceptance evidence expected from the first command:

- recorded program validates and has stable hash;
- agent replay reaches the same endpoint;
- same seed produces byte-identical corruption and repeated trace;
- Echo mirrors through its enemy-only adapter;
- authority-shape and unknown-tool changes are rejected;
- no console/page errors;
- screenshot written under `artifacts/e7-playbook-spike/`.

Acceptance evidence expected from the second command: the new query gate does not disturb ordinary start or the neighboring lazy editor gate.

## 13. Reference and asset ledger

- Read: `specs/epoch-saga/e7-signal-bundle.md` (entire ratified bundle).
- Read: `docs/CONTENT-MAP.md` (player-visible language and content routing).
- Read: gameplay workflow and new-game definition-of-done references from the Three.js gameplay skill. Physics reference was not applicable; the lab has no physics.
- Reused: existing TypeScript/Vite/Playwright stack and query-gated lazy-tool pattern.
- External assets: none.
- Generated stills/audio/video/3D: none.
- Product systems changed: none; only the lazy query edge exists in `src/main.ts`.
