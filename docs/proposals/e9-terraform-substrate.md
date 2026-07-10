# E9 terraform substrate — the tile is a save file

**Status:** design study. No product code or toy is wired by this branch.

**Decision:** E9 gets one authoritative tile-state owner that composes an immutable authored base, a profile-persistent per-place delta, and a fixed-tick run overlay. The composed state is an explicit simulation input. Live tools never edit the descriptor or storage directly; completed canal segments, stages, and terminal outcomes settle through idempotent profile checkpoints. Water and green derive from bounded integer state, not wall time or a free-running simulation.

This is the smallest substrate that can honestly deliver the Red Fields promise: canals, water, and green survive across runs (`specs/epoch-saga/e9-redfields-bundle.md:3`, `:15-28`), while the first identity-preserving slice receives GT-01-grade care (`:30-31`).

## 1. Product laws

The substrate is governed by eight invariants.

1. **A place has one identity.** The durable key is `epochId/tileId`, not contract ID or run ID. Different contracts may revisit the Dome Basin.
2. **The authored base is immutable at runtime.** The editor owns descriptors; gameplay owns profile deltas. Terraform actions never rewrite the contract document.
3. **There is one terrain owner.** Height, slope, water, traversability, future nav, build validity, LOS invalidation, green, and render geometry observe one committed revision.
4. **Persistent state is an input, not ambient storage.** A run starts from canonical bytes plus hash. The sim never rereads localStorage or cloud state mid-tick.
5. **Meaningful work stays.** A completed segment/checkpoint stays completed. Half-finished input between checkpoints remains in the run overlay and may be replayed from RunSuspend; it is not reported as durable before settlement succeeds.
6. **Completed progress is monotonic.** Canal stage, ever-wet land, and green never move backwards. The Old Digger may add bounded repair debt or a run-local obstruction; it cannot erase a completed stage or clear green.
7. **No silent reset.** Invalid, future, oversized, or unmigratable state is quarantined for recovery. It never becomes an empty new planet.
8. **The original Claim is byte-stable.** No shipped tile opts into persistence in the substrate slice, and legacy flat/elevation fast paths remain exact.

The last law carries GT's First-Claim Law and identity gate (`specs/gameplay-terrain/README.md:9-13`, `:24-31`). The persistence law also targets the story's named emotion: the Red Fields exist because returning to reset ground feels wrong (`docs/CONTENT-MAP.md:8-14`).

## 2. Current engine audit

Several useful seams exist, but the mutable grid path does not.

- `TileElevationDescriptor` declares grid dimensions, cell size, and `heightsRef` (`src/meta/ContractFamilies.ts:428-438`). The current `simHeight()` captures the active tile at module load and evaluates only analytic modifiers; it does not read the declared grid or height reference (`src/sim/TileHeight.ts:1-5`, `:31-60`). E9 cannot pretend authored mutable cells already work.
- `Terrain` and `TileHeight` both capture active descriptor facts as module constants (`src/world/Terrain.ts:71-89`). Static lifetime is appropriate today, but restored per-profile state needs an installed runtime owner.
- The good news is that elevation rendering already delegates to the sim height on elevation tiles (`src/world/Terrain.ts:265-272`), so one provider can remain the shared sim/render source instead of growing a second visual delta.
- LOS caches endpoint results without terrain revision in the key (`src/sim/TileHeight.ts:93-133`, `:330-347`). A mutation would otherwise leave authoritative targeting stale.
- Ground vertices are sampled when the mesh is built (`src/world/Terrain.ts:589-607`). Presentation needs a revision notification and bounded geometry rebuild; mesh data does not belong in saves or hashes.
- Current water is descriptor/river-band driven, not a staged grid flood. The E9 fill is a new derived layer, not an extension of a hidden fluid engine.
- `RunSuspendEnvelope` v1 has no tile identity, persistent revision, working patch, or durable run ID (`src/game/RunSuspend.ts:23-73`). Its page-hide hook rewrites the last wave snapshot rather than capturing current dirty state (`:220-224`, `:293-307`). That is unsafe for an unsettled terraform overlay.
- Manual slots deep-clone up to twelve run snapshots (`src/game/SaveSlots.ts:17-33`, `:68-101`). Duplicating a full planet in every slot would waste the save budget and invite rewinds.
- Profile data is an explicit finite allowlist (`src/game/ProfileStorage.ts:23-43`); transfer packs that allowlist (`src/game/ProfileTransfer.ts:41-59`). Terraform state must join it deliberately.
- Cloud restore already has a staged swap/rollback path (`src/game/ProfileTransfer.ts:89-126`), but manual import still creates a profile and writes keys one by one (`:73-86`). E9 data must not enter through that partial-import path.
- Cloud pushes use optimistic `baseSavedAt` conflict detection and retain comparison/history behavior (`src/game/AccountSync.ts:166-224`). Page-exit keepalive is enabled only for requests at or below 60 KiB (`:416-429`).
- Multiplayer snapshots are RunSuspend snapshots, and the current state hash omits terrain (`src/game/Game.ts:1566-1604`, `:1632-1686`). Both must widen together.
- The current megaproject state offers useful staged-defense mechanics, but it is a separate profile document and runtime funding reads only gold (`src/meta/Megaproject.ts:1-33`, `:131-177`). E9 should reuse the mechanic, not split canal stage from the terrain change it authorizes.

The required refactor is therefore a replacement owner, not a delta map bolted onto save code and another map bolted onto rendering.

## 3. One authoritative runtime

```text
immutable tile descriptor + authored base-height bytes
                         │
profile TileStateV1 ─────┼──> ActiveTileWorld <── fixed-tick run overlay
                         │         │
                         │         ├─ height / slope / traversability
                         │         ├─ staged flood / water capacity / green
                         │         ├─ canonical snapshot / revision / hash
                         │         └─ revision notification
                         │                    │
                         └────────────────────┼─ TerrainView / mesh
                                              ├─ actors / routing / build rules
                                              ├─ LOS / projectiles / waves
                                              ├─ RunSuspend / profile store
                                              └─ multiplayer hash / resync
```

`ActiveTileWorld` is the single runtime aggregate. Its `terrain` substate is the only height/water/green query owner; Economy owns material transitions and returns the next balances for the aggregate to commit. Persistence serializes the committed aggregate but is not itself a query service. `Terrain.ts` becomes a facade over the terrain substate; it does not retain a parallel mutable field. The editor remains descriptor-first as ratified (`specs/contract-editor/README.md:8-13`): an editor change creates a new authored base revision, while a player action creates a profile delta.

At run launch, setup installs a `TerrainRunInputV1` before buildings, enemies, or actors are restored. It contains the base identity, committed state revision/hash, and bounded working overlay. No later cloud pull may replace it while the run is active.

The effective integer field is:

```text
heightCm(cell) = authoredBaseCm(cell)
               + committedHeightDeltaCm(cell)
               + workingHeightDeltaCm(cell)
```

Simulation queries interpolate from this canonical integer lattice. Floats exist only at query/render boundaries. Topology decisions—flood, slope classification, build validity, and mutation costs—use integers.

## 4. Authored base identity

An E9-capable descriptor gains an optional persistence declaration:

```ts
type TilePersistenceDescriptorV1 = {
  schema: 'et.goldrush.tile-base.v1';
  revision: number;
  baseHash: `sha256:${string}`;
  columns: number;
  rows: number;
  cellSizeMm: number;
  originXmm: number;
  originZmm: number;
  heightsRef: string;
  greenableMaskRef: string;
  hardnessRef: string;
  seedCellRefs: readonly number[];
  mutationStepCm: 25;
  greenRankVersion: 1;
  stages: readonly {
    id: 'c1' | 'c2' | 'c3';
    terrainPatchRef: string;
    openGateMaskRef: string;
    floodSourceMaskRef: string;
    greenCapMaskRef: string;
    waterlineCm: number;
  }[];
};
```

The build requires exactly three sorted stage declarations and validates every referenced byte length/hash as part of `baseHash`. E9 uses a baked integer base grid; analytic authoring may still be convenient, but build tooling must bake it before it becomes persistence identity. Runtime profile state never depends on today’s floating analytic implementation.

Cosmetic palette/scatter/render changes do not bump `revision` or `baseHash`. Any change that can affect sim height, water, masks, hardness, sources, or cell coordinates does.

Hard caps for v1:

- `1 <= columns, rows <= 64`, `columns * rows <= 4,096`, and `ceil(columns/8) * ceil(rows/8) <= 64`;
- cell size and origins are bounded signed integers in millimetres;
- each committed height delta is an exact centimetre integer in `[-1,600, 1,600]`;
- at most 64 8×8 state chunks per tile;
- at most 16 persistent tile entries and 64 KiB total tile-store JSON per profile;
- 24 KiB maximum canonical JSON for one tile;
- 16 KiB maximum pending run patch;
- IDs at most 96 UTF-8 bytes.

The 4,096-sample grid keeps a fully populated signed-height-plus-flags payload near 12 KiB before base64, while still supporting the bounded basin. Larger grids require a measured transfer/page-exit design, not a constant change.

## 5. Profile state schema

One new profile datum, `gr.tileWorlds.v1`, holds a sorted library:

```ts
type TileWorldStoreV1 = {
  v: 1;
  tiles: readonly TileStateV1[]; // sorted by key, unique
};

type TileStateV1 = {
  schema: 'et.goldrush.tile-state.v1';
  key: string;                  // `${epochId}/${tileId}`
  base: {
    revision: number;
    hash: `sha256:${string}`;
    columns: number;
    rows: number;
    cellSizeMm: number;
    originXmm: number;
    originZmm: number;
  };
  revision: number;             // monotonic uint32 CAS generation
  terrainRevision: number;      // increments only when sim-affecting state changes
  parentHash: `sha256:${string}` | null;
  stateHash: `sha256:${string}`;   // full document identity / persistence CAS
  terrainHash: `sha256:${string}`; // base + chunks + physical stage/debt identity
  lastCommitId: string | null;
  nextRunSeq: number;
  lastResolvedRunSeq: number;
  chunks: readonly TileChunkV1[];
  canal: {
    stage: 0 | 1 | 2 | 3;
    workDone: number;
    escrow: { ice: number; earthwork: number; seed: number };
    repairDebtEarthwork: number;
  };
  materials: { ice: number; earthwork: number; seed: number };
  ecology: {
    successfulRuns: number;
    greenRemainder: number;     // 0..9,999, fixed-point carry
  };
};

type TileChunkV1 = {
  index: number;                // row-major 8×8 chunk index
  heightDeltaCmB64?: string;    // exactly 128 decoded bytes: 64 LE int16s
  flagsB64?: string;            // exactly 64 decoded bytes
};
```

Flag bits are:

- bit 0: authored/player canal cell;
- bit 1: water has permanently reached this cell;
- bit 2: green;
- bits 3–7: must be zero in v1.

Chunks with all-zero heights and flags are omitted. Chunk indices are sorted and unique. Edge chunks use zero padding outside the declared grid, and the decoder rejects non-zero padding.

`materials` is in the same document for transaction atomicity, but Economy remains its only logical writer: a persistent-resource reducer prepares the next integer balances; the tile transaction stores that result. Terrain code cannot mint or debit resources. Water is derived durable capacity, not a disposable counter—consumers may reserve flow, but cannot delete the planet’s water.

All revisions and counters are bounded non-negative integers; v1 caps resource/progress counters at 1,000,000 and revisions/run sequences at uint32. Only one unsettled run may own a tile for a profile. A new reservation waits until any pending commit is recovered or explicitly abandoned, so `lastCommitId` only needs to make the immediate crash retry idempotent.

Local single-writer authority is a long-lived exclusive Web Lock named from the active profile and tile key. E9 acquires it with `ifAvailable` before reserving `runSeq`, rereads revision/hash inside the lock, and holds it through terminal settlement or explicit abandon. A competing tab—or a browser without Web Locks—may inspect the planet but cannot launch a persistent E9 run. Tab exit/crash releases the lock. This closes the local read-then-write race; the account CAS remains the separate cross-device authority.

The schema stores causes, not caches. It does not persist slope, normals, current flood, nav edges, LOS entries, mesh vertices, spawn paths, UI animation, or wall-clock timestamps.

### Canonicalization and integrity

The decoder requires exact keys, exact byte lengths, finite bounded integers, normalized base64, and sorted unique arrays. It decodes to a fresh immutable value. `stateHash` is SHA-256 of canonical content excluding both hashes. `terrainHash` hashes only base identity plus chunks, physical canal stage, and repair debt—the state that can affect a run. Native Web Crypto is sufficient and adds no dependency. These are integrity/desync evidence, not authentication.

FNV remains suitable for cheap gameplay telemetry, but persistent state must not rely on a 32-bit collision domain. Import/cloud authentication remains the account layer’s job.

## 6. Run identity and fixed-tick mutations

The tile state reserves a monotonically increasing `runSeq` in a small document transaction before an E9 run launches. The run captures the resulting post-reservation document revision/hash and the unchanged terrain revision/hash. Gaps after crashes are harmless. The sequence is copied into RunSuspend and every manual slot. A terminal result with `runSeq <= lastResolvedRunSeq` is already in the ledger: it may be viewed/replayed, but it cannot award materials, add repair debt, advance a stage, or spread green again.

Reservation and every later checkpoint occur while the same profile/tile Web Lock is held. Each checkpoint still rereads the canonical document and compares its full revision/hash; the lock serializes same-device writers, while that comparison and the cloud CAS detect stale state from imports or other devices.

A live edit enters as semantic fixed-tick input:

```ts
type TileMutationInputV1 = {
  v: 1;
  worldTick: number;            // active world tick / authoritative MP tick
  sourceSlot: number;
  ordinal: number;
  operationId: string;
  kernelVersion: 1;
  centerCell: number;
  radiusCells: number;
  strengthSteps: number;         // integer 1..8; descriptor step is exactly 25 cm
  mode: 'dig' | 'fill' | 'repair';
};
```

The pure versioned kernel converts an input to a row-major cell patch. `dig` applies `-strengthSteps * 25 cm`, `fill` applies the positive value, and `repair` consumes debt without inventing an alternate height rounding rule. It clamps nothing silently: invalid radius, strength, bounds, protected cell, overflow, insufficient escrow, occupied footprint, or unknown kernel rejects the whole input. The UI previews the same kernel but has no write authority.

On each active tick:

1. gather local/lockstep tile inputs;
2. normalize and sort by `(worldTick, sourceSlot, ordinal, operationId)`;
3. validate each against the working result of earlier accepted inputs;
4. ask Economy to reserve the exact integer cost from the run’s stage escrow;
5. apply accepted patches in ascending cell order to the working overlay;
6. derive one complete replacement terrain revision;
7. atomically publish height, flood, traversability/build masks, route eligibility, and cache invalidation;
8. update actors, waves, buildings, enemies, and combat;
9. let presentation rebuild from the published revision.

Use a dedicated active `worldTick`; current `simTick` advances before `simActive` (`src/game/Game.ts:1316-1328`, `:1389-1396`). Pause, menus, dropped wall time, and render FPS must not consume terraform time.

No system may observe new height with old water or LOS. V1 recomputes the full bounded grid on a committed working revision. If profiling later requires chunked derivation, it builds a hidden complete revision using a fixed cells-per-active-tick budget and swaps only when finished.

Derived rebuild order is fixed:

1. effective height and slope;
2. flood occupancy/depth and water capacity;
3. traversability and future nav edges;
4. spawn/route eligibility;
5. build-pad validity;
6. clear LOS and projectile-height caches;
7. notify rendering.

## 7. Durable checkpoint protocol

Individual strokes are run state. A **segment-complete**, **stage-complete**, or **run-resolution** checkpoint is durable place state. The sim pauses at the boundary and creates:

```ts
type TileCommitV1 = {
  id: `${string}:${string}:${number}`; // runSeq : tile key : checkpoint ordinal
  key: string;
  expectedRevision: number;
  expectedStateHash: string;
  patch: BoundedMaterializedPatchV1;
  materialDelta: { ice: number; earthwork: number; seed: number };
  canalDelta: CanalCheckpointDeltaV1 | null;
  greenOutcome: GreenOutcomeV1 | null;
};
```

Commit order is crash-recoverable:

1. capture RunSuspend v2 with the current overlay, Economy reservations, and `pendingCommit`;
2. write and reread that pending snapshot;
3. read the canonical tile document and require exact revision/hash;
4. use pure reducers to apply cost, patch, canal/flood, repair debt, and green in their fixed order;
5. set `revision + 1`, `parentHash`, and `lastCommitId`; increment `terrainRevision` only if the physical result changed; write the complete `gr.tileWorlds.v1` value once and reread both hashes;
6. install the new committed state, clear the overlay/pending marker in RunSuspend, and only then acknowledge “stays shaped”;
7. queue an immediate normal cloud push.

Crash before step 5 replays the pending commit. Crash after step 5 sees `lastCommitId` and returns the already-committed result without charging or spreading twice. Any different revision/hash mismatch is a conflict, never a merge or reroll.

Storage/quota/hash failure leaves the old planet and old material balances intact. The action remains pending/retryable and must not display success. Permanent terraform never spends run gold/pressure, avoiding a cross-document “old economy + new planet” exploit.

Completed stage geometry and green are never demolished. Digger damage adds capped repair debt and may create a run-local blocked segment; settlement cannot clear canal/ever-wet/green bits. Re-dig pays debt and restores flow presentation.

## 8. RunSuspend and manual-save law

RunSuspend v2 (or the post-v2 schema active when E9 ships) adds a bounded reference and overlay:

```ts
persistentTile?: {
  key: string;
  runSeq: number;
  documentRevision: number;
  documentStateHash: string;
  terrainRevision: number;
  terrainHash: string;
  workingPatch: BoundedMaterializedPatchV1;
  pendingCommit: TileCommitV1 | null;
};
```

It does not copy the full profile planet into each slot. Restore installs the referenced committed tile before buildings, enemies, or hero. Current restore begins with other systems (`src/game/RunSuspend.ts:471-492`); terrain must move ahead of them.

Manual slots never rewind the planet. They compare the sim identity, not incidental resource/run-sequence metadata:

- exact current terrain revision/hash: load the run input; a sealed `runSeq` remains playable but cannot create another durable outcome;
- tile is one terrain revision ahead and `pendingCommit.id === current.lastCommitId`: recover/clear the acknowledged commit, then load;
- any other terrain mismatch: mark the slot stale, preserve it for export/delete, and refuse to install it as current reality;
- a document-only revision mismatch may still load the same terrain, but any later durable checkpoint must pass the current full-document CAS or fail as a conflict.

This is intentionally stricter than silently replaying against new ground. A future “memory run” may be read-only, but v1 does not create a fork/merge system. The save UI must explain that the planet has moved on; it must never call the slot corrupt or delete it.

Page-hide/visibility handling must capture the current dirty overlay and pending commit. Rewriting the previous wave snapshot, as v1 does today, is a hard blocker.

## 9. The five save surfaces

The masterplan names five independent save gates (`docs/MASTERPLAN-2026-07-10.md:34-40`). E9 passes only when all five carry the planet.

| Save surface | E9 contract |
| --- | --- |
| Versioned run state | Snapshot v2+ stores full-document and terrain identities, `runSeq`, working patch, reservations, and pending commit. Old v1 remains valid only for non-persistent tiles. Restore terrain first. |
| Transactional import | Add `gr.tileWorlds.v1` to `PROFILE_DATA_KEYS` and strict normalization. Manual import must use the existing cloud-style stage/swap/rollback path before publishing the new profile. A bad tile cannot partially import materials or stage. |
| Blank-device family discovery | The key rides the existing profile envelope. Profile/compare summaries add Red Fields stage, planet revision, and green percentage so a family can identify the right ledger before choosing. |
| Bounded, flushable cloud sync | Tile store ≤64 KiB, tile ≤24 KiB, pending patch ≤16 KiB. Measure the entire envelope. Compact oldest manual slots until below the transfer limit; never compact planet state. Immediate normal push follows every durable checkpoint. A bounded tile-state CAS flush carries one canonical tile document below the 60 KiB keepalive ceiling when the full ledger is larger. |
| Concurrent version recovery | Keep whole-ledger optimistic CAS/cloud history. Do not auto-merge cell deltas, costs, stages, or green. Compare cards show planet facts; both branches remain recoverable. |

The current 190 KiB transfer soft limit only compacts save slots (`src/game/ProfileTransfer.ts:17-20`, `:41-59`). E9 acceptance measures the final bundle after compaction; retaining five still-oversized slots is not enough. Local commit remains synchronous/offline-first even when cloud is unavailable.

The recommended page-exit path is a small authenticated tile-state compare-and-swap request: `{profileId, key, expectedCloudSavedAt, stateHash, canonicalTile}`. The server validates the strict tile envelope, replaces only that profile datum in the current ledger, preserves a history version, and returns the new `savedAt`. The payload is bounded by the 24 KiB tile cap and is idempotent through `lastCommitId`. A stale base opens the ordinary cloud/local compare flow; it never merges cells. The next normal full-ledger push reconciles the identical tile state and other profile data. This transport is a dependency of E9-T3, not implemented by this proposal branch. **E9 cannot ship while this gate is red:** an automated hidden/pagehide test must prove the authenticated request remains at or below the 60 KiB keepalive ceiling and survives reload; an immediate normal push alone is insufficient.

## 10. Migration and recovery

Schema migration and authored-base migration are different operations.

### Schema migration

Use a pure, explicit chain:

```text
raw vN → strict decode → migrate in memory → strict vN+1 validate
       → canonicalize/hash/cap → write temp → reread → replace
```

Unknown future versions, duplicate chunks, bad padding/flag bits, hash mismatch, cap overflow, or integer overflow are rejected. Preserve one raw recovery copy under a fixed profile-scoped recovery key. Quarantine the affected tile where possible; other profiles and contracts remain playable.

Missing `gr.tileWorlds.v1` means an empty overlay on the current base. It never means a failed E9 decode should become empty.

### Base migration

Any sim-affecting descriptor change requires an authored migration selected by exact `(oldBaseRevision, oldBaseHash, newBaseRevision, newBaseHash)`:

- unchanged grid: transform explicit cells/flags and revalidate;
- changed dimensions/origin/cell size: require an authored cell mapping;
- renamed stage/patch: require an explicit ID map;
- unmapped modified data: refuse and preserve the old bytes.

Never nearest-neighbor-resample a family's planet. Once E9 is live, prefer additive patches and cosmetic base changes over rewriting the base grid.

Migrations cannot invent refunds, green, water, or stage credit. Green cell count and completed stage may not decrease unless an attended product ruling explicitly supersedes the persistence law.

## 11. Staged flood

E9 does not need real-time fluid dynamics. It needs deterministic connectivity.

At a terrain/stage checkpoint:

1. form the effective integer height grid;
2. open authored source/gate cells allowed by the completed canal stage;
3. flood through canal/basin cells at or below the stage waterline;
4. traverse a row-major queue with fixed neighbor order north, east, south, west;
5. derive dry/wet/flowing presentation and current water capacity;
6. OR newly reached cells into the persistent ever-wet flag;
7. derive spawn, route, economy-capacity, and green eligibility from the same result.

Connectivity is order-independent, but fixed order keeps traces and any future bounded work budget identical. Persist canal/stage/height/ever-wet causes, not the current flood cache. A restore recomputes and asserts the derived flood hash.

C1→C3 stage completion changes gameplay only at the atomic checkpoint. Actors/buildings may not occupy cells whose traversability changes; the validator either rejects the checkpoint with a clear reason or uses an authored ceremony boundary where the live field is clear. There is no generic physics shove.

## 12. Green-spread reducer

Green is a monotonic bit in tile state. It changes once during a qualifying non-debug secured E9 terminal transaction, after any same-run stage/flood transition.

Interpret “+N%” as integer basis points of the currently hydrated greenable mask, not a floating multiplier of the current green count. Provisional tuning is `SPREAD_BPS = 300` (three percentage points); the number is a Balance/feel knob, not canon.

```text
eligible = authoredGreenableMask AND everWetMask AND stageGreenCapMask
numerator = popcount(eligible) * SPREAD_BPS + greenRemainder
quota = min(dryEligibleCount, floor(numerator / 10_000))
nextRemainder = numerator mod 10_000
```

For each of `quota` cells:

1. candidates are dry eligible cells adjacent in four directions to green or an authored seed source;
2. rank by unsigned `hash32(tileKey, successfulRuns + 1, expansionIndex, cellIndex)`, then `cellIndex`;
3. green the lowest candidate and repeat.

`greenRankVersion: 1` defines `hash32` exactly as FNV-1a 32: initialize to `2166136261`, xor each framed byte, then `Math.imul(hash, 16777619) >>> 0`. The byte frame is a uint16 little-endian UTF-8 byte length for `tileKey`, those UTF-8 bytes (key cap 96), then three uint32 little-endian values: successful-run ordinal, expansion index, and cell index. No string concatenation or platform-endian typed-array view participates. The hash is a pure tie-breaker, not a mutable RNG cursor or integrity hash. Frame rate, pauses, unrelated RNG calls, JS Map order, and wall time cannot change the result. The tile validator proves every greenable connected component has an eventual seed source; runtime fails closed with a diagnostic rather than teleporting growth.

Stage masks cap early coverage—illustratively C1 15%, C2 45%, C3 80%, post-weather mastery 100%—so repeated early contracts cannot green inaccessible land. The art layer samples E1's ratified riverbank-green constant as required by the bundle; save data stores only the green bit, not a duplicate color.

### Quantitative example

Suppose hydrated greenable counts are C1=240, C2=400, and C3=640 cells, with twelve initial seed cells. At 3%:

- C1's three successes add `7, 7, 7` cells = 21, carrying remainder 6,000;
- C2's seven successes add 12 cells each = 84, still carrying remainder 6,000;
- C3's ten successes add `19, 20, 19, 19, 19, 19, 20, 19, 19, 19` cells = 192, still carrying remainder 6,000.

After the illustrative twenty-success stage path, the reducers add 297 cells; with the twelve seeds, 309 of 640 final hydrated cells are green (48.28125%). Post-C3 successes visibly continue to saturation; the fixed-point remainder prevents an asymptotic fractional tail.

`successfulRuns` and `lastResolvedRunSeq` advance in the same tile commit as the new green bits. An old manual save cannot spread twice.

## 13. Cost and pacing model

Permanent E9 progress uses persistent integer materials, not restorable run gold. Successful contract lots are fixed by objective family, independent of kills, time, difficulty rerolls, surplus pickups, or FPS:

| Secured contract | Persistent lot (illustrative) |
| --- | ---: |
| Ice quarry | 8 ice |
| Canal defense | 10 earthwork |
| Weather shepherding | 6 seed |

Provisional C1–C3 escrow:

| Stage | Ice | Earthwork | Seed | Intended successes |
| --- | ---: | ---: | ---: | ---: |
| C1 feeder | 16 | 10 | 0 | 3 |
| C2 basin locks | 24 | 20 | 12 | 7 |
| C3 river link | 32 | 30 | 18 | 10 |

This makes a transparent twenty-success baseline and requires the objective mix. Values remain tuning data. The structural rule is more important: a terminal reducer grants one capped lot once, then stage funding moves exact integers into escrow in the same tile transaction.

At run launch, a bounded spendable view of that escrow is copied into RunSuspend. Fixed-tick edits reserve against the run copy; a completed segment checkpoint settles the confirmed amount against persistent escrow. Failure or abandon releases uncheckpointed reservations and discards the unsettled overlay. `workDone` advances only from an idempotent segment/terminal receipt, never from a raw wave event, so restoring and replaying a defense wave cannot mint stage progress.

Micro-terraform quotes derive from before→after state, not brush events:

```text
heightStepCm = 25
earthworkCost = Σ changed cells (
  1 + authoredHardness[cell] * abs(nextStep - currentStep)
)
```

Hardness is an authored integer 1–3. Dig and fill both cost positive earthwork; reversing a committed change is a new paid operation. Splitting one edit into smaller strokes never makes it cheaper. Unknown/protected/zero-change cells are rejected or omitted before quoting.

Funding/refund rules:

- an unaccepted quote reserves nothing;
- validation, conflict, or storage failure releases the whole reservation;
- explicit stage funding moves exact materials to escrow;
- cancellation before the first stage-progress receipt returns escrow exactly once;
- after progress starts, funding and completed terrain are irreversible;
- failure awards no material lot or green;
- completed stage damage creates `repairDebtEarthwork <= 25%` of that stage's earthwork target and never rolls stage/green back;
- future canal-defense earnings pay repair debt before new-stage work;
- repair produces no refund, material payout, or duplicate progress.

Water is the era resource as physical capacity: flood extent and flow determine available allocation. Buildings may reserve/release capacity, but there is no spend/refund loop that conjures or destroys reached water.

## 14. Multiplayer

The room creator's profile owns the planet.

Room setup includes exact tile key, authored base hash, canonical tile bytes, revision, and state hash before tick zero. Peers validate the same input. Terraform commands join the future semantic lockstep action stream; pointer/world writes never bypass it.

At a persistent checkpoint the room enters a two-phase lockstep barrier:

1. every peer pauses on the same active tick, derives the same logical working-to-committed result, and acknowledges its proposed terrain hash;
2. the host, still holding the profile/tile writer lock, persists and rereads that exact result in the local profile store;
3. after the host broadcasts `{tick, commitId, terrainRevision, terrainHash}`, every peer promotes the working overlay to committed memory on that same logical tick and clears the logical pending commit;
4. a local storage/hash failure before that broadcast leaves every peer paused on the old committed state or ends the room; nobody partially promotes;
5. after promotion, the host queues the bounded cloud CAS. Network or cloud-version failure is retryable pending sync and opens the ordinary compare flow; it never rolls back an already verified local planet or the peers' identical logical commit.

Only the host stores the full document revision, cloud `savedAt`, or persistence receipt. Those transport facts are excluded from deterministic simulation state. The synchronous per-tick `simHash32` reuses the game's canonical FNV telemetry over:

```text
baseHash + sessionTerrainRevision + precomputed terrainHash + canonical workingPatch + logical pendingCommitId
```

SHA-256 `stateHash` and `terrainHash` are recomputed only when their document/terrain revision changes; Web Crypto is never put in the tick loop. `simHash32` includes the already-computed terrain hash string and all unsettled logical state. A persistence-only full-document revision is not a simulation revision.

Resync carries the tile reference and bounded working patch/pending commit, installs terrain first, rebuilds derived state, then restores entities. Guests simulate and receive normal run rewards but never write the host's planet into their profiles.

Only the host writes a persistent checkpoint using the expected local profile revision/hash, then syncs it with the existing cloud CAS; the barrier keeps peers logically identical. If the host disconnects before verified local settlement, the room pauses/ends; v1 does not promote a guest into a writer. A disconnect after the commit broadcast leaves the already-settled planet and retryable cloud sync intact. Host migration requires a later explicit, acknowledged ownership-transfer protocol. Split-brain “merge the cells” is forbidden.

Current multiplayer is discovery-only until its authoritative action/join/resync gates land (`docs/MASTERPLAN-2026-07-10.md:34-40`). E9 multiplayer is downstream of that work, not a reason to create another input channel.

## 15. Performance envelope

For `N <= 4,096` samples:

- decoded height deltas: `2N` bytes;
- flags: `N` bytes;
- flood/green working bitsets: `N/8` bytes each;
- mutation batch: `O(k log k + touchedCells)`;
- full height/flood/traversability rebuild: `O(N)` at a terrain revision;
- LOS invalidation: at most the current 512 cached checks;
- render geometry rebuild: `O(vertices)` presentation-side after commit.

There is no per-frame green or flood simulation. Full bounded rebuild is preferred over clever dirty regions until a profiler proves otherwise. A perf gate measures checkpoint time, maximum input latency, mesh rebuild time, serialized tile bytes, whole-profile bytes, and draw calls.

## 16. Risk register

| Severity | Risk | Control / hard gate |
| --- | --- | --- |
| P0 | A bad decode or missing migration silently resets the planet. | Quarantine raw state; no empty fallback for an existing E9 key; recovery fixture. |
| P0 | Terrain commits but material cost or run outcome rewinds. | Persistent materials in the same tile transaction, pending commit in RunSuspend, `lastCommitId`, reread verification. |
| P0 | Old manual slot rewinds canal/green or awards success twice. | Exact revision/hash restore law plus persistent `runSeq/lastResolvedRunSeq`; stale slot preserved, not loaded. |
| P0 | Sim/render/water/LOS observe different revisions. | One `ActiveTileWorld.terrain`, fixed rebuild order, atomic revision publish, revision-aware cache invalidation. |
| P0 | Host and guest diverge or both persist the family planet. | Two-phase logical checkpoint barrier on every peer; host-only storage; no host migration in v1; CAS conflict gate. |
| P0 | Same-profile tabs both reserve or commit the tile. | Hold one exclusive profile/tile Web Lock from `runSeq` reservation through settlement; unavailable lock means read-only E9. |
| P1 | Grid/height reference is declared but still ignored. | Bake/load integer grid before any persistence product slice; probe known cell bytes and heights. |
| P1 | Pause/menu time or RAF changes mutation order. | Active `worldTick`, fixed sort, integer kernel, trace equality across frame schedules. |
| P1 | Cloud/profile import partially admits tile state. | Strict datum normalizer and stage/swap/rollback for manual and cloud import. |
| P1 | Tile data pushes the whole ledger past transfer/page-exit limits. | Per-tile/store/pending caps, whole-envelope measurement, iterative slot compaction, immediate normal push, and a separately bounded tile CAS keepalive gate. |
| P1 | Two devices naively union height/cost/green. | Whole-ledger compare/history; no automatic per-cell merge. |
| P1 | Base revision reinterprets old cell indices. | Exact authored base migration; no silent resampling. |
| P1 | Digger grief erases years of place progress. | Repair debt/run obstruction only; completed stage, ever-wet, and green monotonic. |
| P1 | Stage transition strands actors/buildings or changes routes mid-system update. | Occupancy validator or authored clear-field ceremony; atomic tick-boundary swap before gameplay systems. |
| P2 | Hash is treated as security. | SHA-256 for integrity, account layer for authentication; canonical byte comparison on collision/mismatch. |
| P2 | A standalone toy graduates into a second terrain implementation. | No toy in this spike; first executable work is the real pure codec/kernel behind an opt-in dev tile. |

## 17. Implementation slices

Each slice has one owner and one browser-visible checkpoint.

1. **E9-T0 — identity substrate.** Strict codec plus installed `ActiveTileWorld`; optional descriptor declaration; no shipped tile opts in. Empty state delegates exact legacy height paths. Freeze pre-change First-Claim, basin, and Hill Mine fingerprints; RunSuspend JSON stays byte-identical.
2. **E9-T1 — integer grid graduation.** Bake/load `heightsRef`, hardness, masks, and base hash on one dev tile. Same owner feeds sim and mesh. No mutation/persistence.
3. **E9-T2 — fixed-tick working overlay.** Pure mutation kernel, integer cost quote, atomic derived rebuild, cache invalidation, and geometry notification behind a debug dev-tile gate. No durable writes.
4. **E9-T3 — five-surface persistence.** `gr.tileWorlds.v1`, profile/tile Web Lock, transaction journal, persistent run sequence, RunSuspend v2 reference/overlay, stale-slot UX, strict transfer/import/cloud caps, the bounded tile-CAS endpoint, page-exit test, and recovery fixtures.
5. **E9-T4 — C1 staged flood.** Reuse staged-defense mechanics, persistent material escrow, one authored canal patch, deterministic fill, and route/spawn/economy-capacity probes.
6. **E9-T5 — green reducer.** Seed/greenable masks, once-per-secure integer spread, stage cap, exact color constant, suspend/reload and old-slot anti-reward gates.
7. **E9-T6 — multiplayer bridge.** Only after authoritative semantic actions and join/resync snapshot work: host input, two-phase logical checkpoint barrier, `simHash32`, resync, disconnect refusal, and guest non-persistence.
8. **E9-T7 — Dome Basin vertical slice.** C1→C3 content, repair debt/re-dig, weather objective, full family/save/cloud/perf ceremony.

Stop and reslice if T0 changes a legacy fingerprint, if T2 needs a second mutable owner, if T3 cannot make manual import transactional or pass the bounded page-exit tile-CAS gate, or if T6 precedes authoritative host/join state.

## 18. Toy and verification ledger

No toy is included. A standalone cellular-automaton page would be cheap but misleading: the current runtime does not yet consume authored grid heights, invalidate mutable terrain caches, or save the input. Building the toy would prove a second implementation. The cheapest honest executable proof is E9-T0/T1 against the real owner and dev tile.

This proposal branch is documentation-only. Static checks:

```text
git diff --check
file-reference validation
```

Future gate families:

- identity: frozen pre-change fingerprints, `Object.is`-identical dense height probes, legacy RunSuspend byte identity;
- codec: exact-key/cap/hash/base64/padding rejection, v1 round trip, recovery quarantine;
- determinism: same base+state+inputs → identical cell/flood/green/state hashes across frame schedules and reload;
- persistence: segment checkpoint crash at every write boundary, pagehide dirty overlay, restart, suspend, stale manual slot, import/export, blank device, cloud conflict/history;
- gameplay: C1/C2/C3 flood hashes, route/spawn/build changes, green bounds, repair debt, old-run no-reward;
- multiplayer: initial input equality, post-tick hash, resync terrain-first, guest write refusal, host disconnect before settlement;
- performance: full-grid rebuild, mesh rebuild, tile/store/whole-envelope bytes, page-exit behavior.

## 19. Reference ledger

- Read in full: `specs/epoch-saga/e9-redfields-bundle.md`.
- Grounding: `specs/gameplay-terrain/README.md`, `specs/contract-editor/README.md`, and `docs/CONTENT-MAP.md`.
- Current seams: `src/sim/TileHeight.ts`, `src/world/Terrain.ts`, `src/meta/ContractFamilies.ts`, `src/game/RunSuspend.ts`, `src/game/SaveSlots.ts`, `src/game/ProfileStorage.ts`, `src/game/ProfileTransfer.ts`, `src/game/AccountSync.ts`, `src/meta/Megaproject.ts`, `src/game/Economy.ts`, `src/mp/LockstepClient.ts`, and `src/game/Game.ts`.
- External references/dependencies: none.
- Generated art/audio/video/3D: none.
