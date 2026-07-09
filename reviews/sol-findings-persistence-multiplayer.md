# Sol findings — persistence and multiplayer

- **Branch:** `sol/repository-audit-findings`
- **Base:** `7802ed6`
- **State:** UNTRIAGED — no implementation authorized.
- **Scope:** suspend/import integrity, cloud flush, lockstep join/action/hash/resync behavior.

## Summary

| Finding | Severity | Backlog overlap | Suggested future branch if accepted |
|---|---|---|---|
| `F-SOL-PERSIST-001` Suspend schema validation is shallow | P0 | No complete schema corrective found | `sol/suspend-schema-validation` |
| `F-SOL-PERSIST-002` Resync snapshots are state-incomplete | P0 | Task 067 covers two actors only | `sol/resync-state-contract` |
| `F-SOL-PERSIST-003` Restore compacts entity identities | P1 | No corrective found | `sol/restore-entity-identity` |
| `F-SOL-PERSIST-004` Profile import is nontransactional | P1 | No corrective found | `sol/profile-import-transaction` |
| `F-SOL-PERSIST-005` Established rooms reject late join/reconnect ticks | P1 | MP-04/05 planned; not covered by task 067 | `sol/lockstep-join-tick` |
| `F-SOL-PERSIST-006` Multiplayer actions are not actor-scoped | P1 | MP-03/067 overlap, but action ownership remains separate | `sol/actor-scoped-actions` |
| `F-SOL-PERSIST-007` Hash/resync source handling is racy | P1 | Task 067 covers observed paused-forever path only | `sol/lockstep-hash-resync-order` |
| `F-SOL-PERSIST-008` Debounced cloud saves have no page-exit flush | P2 | Accounts v1 exists; no matching corrective found | `sol/cloud-save-exit-flush` |
| `F-SOL-PERSIST-009` Save-slot compaction can remain over the server cap | P2 | Accounts v1 exists; no matching corrective found | `sol/cloud-save-payload-cap` |

## F-SOL-PERSIST-001 — [P0] Malformed suspend state can pass validation and crash restore

**Evidence**

- `src/game/RunSuspend.ts:19-69` declares nested required structures including `rng`, counters, hero vectors, economy log, and research.
- `src/game/RunSuspend.ts:722-737` validates only a subset of top-level records/arrays; it does not validate `rng`, `counters`, nested vectors, event entries, or finite numeric fields.
- `src/game/RunSuspend.ts:401-431` dereferences `snapshot.rng.waves`, counters, and other nested fields without a normalization boundary.
- `src/game/RunSuspend.ts:621-634` reduces `snapshot.economy.log` as trusted economy events.
- `src/game/SaveSlots.ts:240-251` performs an even shallower snapshot check for imported slots.

**Impact**

Malformed, stale, partially migrated, or manually edited local/cloud/imported data can survive the guard and throw during boot/continue. Invalid economy events can also poison balances.

**Recommendation for triage**

Add a versioned, exhaustive decoder/normalizer before any mutation; quarantine invalid data with a recoverable UI message; test missing fields, non-finite numbers, bad vectors, bad economy events, and future versions.

## F-SOL-PERSIST-002 — [P0] Multiplayer resync snapshot is not a complete future-state contract

**Evidence**

- `src/game/RunSuspend.ts:125-160` omits enemy `maxHp`, elite/variant identity, visual/damage multipliers, boss-group metadata, pursuit behavior, and several behavior-defining fields that exist in `src/entities/Enemy.ts:31-56`.
- `src/game/RunSuspend.ts:334-398` captures no projectiles, blast charges, pickups, XP motes, shooter cooldowns, harvest channel state, or several ceremony/megaproject states.
- `src/game/RunSuspend.ts:401-410` resets combat, harvest, build, progression, and consent before partial reconstruction.
- `src/game/RunSuspend.ts:511-561` respawns enemies with only edge/thief/wrecker/delay options, then writes a subset of fields; elite, variant, boss, damage, and max-HP identity are lost.
- `src/game/Game.ts:1569-1625` hashes only a subset of future-affecting state, so equal hashes do not prove equal full simulation state.
- `e2e/mp-02-lockstep.spec.ts:17-21` disables several systems in its query, narrowing resync coverage.

**Impact**

A desync can "heal" by deleting live objects or converting specialized enemies into generic ones, then diverge again outside the current hash surface.

**Overlap note**

`tasks/067-mp-resync-two-actors.md` correctly targets the observed two-actor restore failure and should proceed independently. This broader finding should not expand task 067's firewall.

**Recommendation for triage**

Define typed `capture/restore/hash` contracts per system and a canonical resync snapshot version. Prove restoration during active waves with variants, buildings with holes, projectiles, pickups, cooldowns, and multiple actors.

## F-SOL-PERSIST-003 — [P1] Restore ignores recorded pool identities

**Evidence**

- `src/game/RunSuspend.ts:130-132` records an enemy index.
- `src/game/RunSuspend.ts:511-524` ignores it and calls `spawn`, which selects the first free pooled enemy.
- `src/game/RunSuspend.ts:564-589` records building indices.
- `src/game/RunSuspend.ts:592-614` places buildings sequentially and ignores the recorded index.
- `src/game/Game.ts:1600-1615` includes enemy IDs and building indices in multiplayer hashes and other systems/tools use these identities as references.

**Impact**

Sparse pools compact after restore. References, hashes, target attribution, repair actions, or follow-up snapshots can describe different entities even when positions look correct.

**Recommendation for triage**

Restore into explicit reserved slots or replace index-based durable identity with stable IDs carried through capture, restore, tools, and hashes.

## F-SOL-PERSIST-004 — [P1] Profile import deletes and rewrites without rollback

**Evidence**

- `src/game/ProfileTransfer.ts:84-104` removes existing profile data keys and writes replacements one by one.
- `src/game/ProfileTransfer.ts:106-120` validates only envelope/profile/data shape, not every contained value or storage budget.
- Storage quota or a single write failure can occur after existing data has already been removed.

**Impact**

A failed import can leave the current profile partially destroyed.

**Recommendation for triage**

Decode and size-check into memory, write to a temporary namespaced bundle, verify readback, then swap/commit; retain an automatic rollback copy until success.

## F-SOL-PERSIST-005 — [P1] Late join and reconnect start at tick zero in an advanced room

**Evidence**

- `src/mp/LockstepClient.ts:80-89` initializes both next ticks to zero.
- `src/mp/LockstepClient.ts:201-207` handles `joined` without receiving or applying the relay's current tick.
- `functions/api/_multiplayer.ts:168-199` sends roster/player data on join but not `nextFlushTick`.
- `functions/api/_multiplayer.ts:217-220` rejects any input tick below the relay's current flush tick as `bad_tick`.
- `scripts/test-multiplayer.mjs:82-88` reconnects a raw client only to request a snapshot; it does not exercise the real `LockstepClient.pump` path after rejoin.

**Impact**

A third player or reconnecting real client can be rejected immediately, while existing players begin waiting for that new roster member's current-tick input.

**Recommendation for triage**

Join must establish authoritative room tick/input-delay state and resync before the new player enters the required roster. Add real-client late-join and reconnect tests after the room has advanced.

## F-SOL-PERSIST-006 — [P1] Only movement is reliably per actor

**Evidence**

- `src/game/Game.ts:1446-1458` updates movement per actor.
- `src/game/Game.ts:1488-1501` selects one `mpActionSlot`; the selected actor's intents become the global action intents for that tick.
- `src/game/Game.ts:313` owns one global active weapon and `src/game/Game.ts:3808-3817` toggles that shared value.
- Shared edge-state fields such as `lastConfirmIntent`, `lastBuildIntent`, and `lastWeaponToggleIntent` are not actor-indexed (`src/game/Game.ts:672-680`, `1343-1354`).
- Context interactions use one global action-actor position (`src/game/Game.ts:1299`, `730-737`).

**Impact**

Simultaneous player actions can suppress each other; weapon choice and context ownership are shared; the current model cannot support one Prospector/permission state per player.

**Recommendation for triage**

Make world actions, edge state, weapon state, Prospector state, and attribution actor-scoped; resolve simultaneous actions in deterministic roster order.

## F-SOL-PERSIST-007 — [P1] Hash comparison and snapshot authority can choose the wrong recovery state

**Evidence**

- `src/mp/LockstepClient.ts:219-224` compares a remote hash only if the local hash already exists; an earlier remote hash is not queued for later comparison.
- `src/game/Game.ts:1302-1318` and `1368-1371` can return after consuming a multiplayer tick but before `finishMultiplayerTick` at `1422`.
- `functions/api/_multiplayer.ts:258-270` stores the latest snapshot from any peer and serves it as recovery state, including potentially the divergent peer.
- `tasks/067-mp-resync-two-actors.md` documents the currently reproduced paused-forever failure after MP-03 and scopes its direct correction.

**Impact**

Mismatches can be missed, tick completion can be skipped, or recovery can use a non-authoritative snapshot.

**Recommendation for triage**

Queue unmatched hashes, guarantee tick-finalization through one lifecycle boundary, and designate a deterministic snapshot authority. Keep this outside task 067 unless Fable explicitly reslices it.

## F-SOL-PERSIST-008 — [P2] Debounced cloud saves have no page-exit flush

**Evidence**

- `src/game/AccountSync.ts:149-170` debounces pushes for 30 seconds and has no pagehide/visibility flush.

**Impact**

Closing, navigating, or backgrounding shortly after progress can leave the latest local state absent from cloud recovery.

**Recommendation for triage**

Flush pending critical state on page lifecycle exit with a browser-supported bounded request, surface its later reconciliation state, and add a close/reopen recovery test.

## F-SOL-PERSIST-009 — [P2] Save-slot compaction can remain over the server request cap

**Evidence**

- `src/game/SaveSlots.ts:176-194` may retain five saves and return an envelope that is still above its target budget.
- `functions/api/_accounts.ts:65` rejects request bodies above 200 KB.
- A locally valid profile can therefore remain permanently unsendable after the current compaction pass.

**Impact**

Cloud sync can repeatedly fail for a profile without producing a payload the server will accept or a clear player recovery path.

**Recommendation for triage**

Make compaction guarantee a serialized payload below the server cap or return a typed, player-visible explanation of which retained data prevents upload. Test the largest legal local profile against the actual server limit.
