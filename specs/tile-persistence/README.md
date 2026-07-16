# TILE PERSISTENCE — the substrate for "what stays" (E9's era-defining system, specced with GT-01 care)
STATUS: DRAFT 2026-07-17 (attended-authored at owner order: "author the hard parts already"). The e9-redfields bundle owns the era design; this spec owns the SUBSTRATE. The founding sentence, owner verbatim (2026-07-10): **"It is a bit sad that the map and the buildings reset after each game."** Ten eras from wash-away to endures — this file is where endures gets an API.

## What this is
Per-tile, per-profile PERMANENT world-state that survives run resets: canals dug stay dug, greens spread run over run, the Dredge-Queen's hulk stays a dive site (W6 — the first dose, shipping now inside the boss slice with its own flag; it MIGRATES onto this substrate at TP-01). E9 makes persistence the era mechanic; E10's Ark accretes on the same substrate; the Seed Run's planted oases and the Old Canal's remembered choices are consumers.

## The laws
1. **PROFILE-SCOPED, ALWAYS.** Every entry lives under the gr.profile.v2 scope (the profile-scope poison class is a named failure — global-scope persistence leaks across profiles and "resets" on profile switches; never again). Key shape: `gr.profile.v2.<profileId>.tilestate.<contractId>`.
2. **VERSIONED + MIGRATION-SAFE.** Envelope carries `schemaVersion`; readers preserve unknown keys byte-faithfully (forward-compat); migrations are explicit functions, never implicit rewrites. A save from any older version must load forever (nothing-loved-is-erased, applied to data).
3. **DETERMINISM-COMPOSABLE.** Persistent state is part of a run's INITIAL CONDITIONS: the snapshot is read once, applied before tick 0, and never mutated mid-run except through the event log's own outcomes (writes happen at run END or at explicit ceremony beats, from event-log facts). A run's identity = (seed, contract, persistence snapshot) — replay/playbooks stay exact under it (PB laws hold).
4. **THE LOADER CONTRACT (the hard part, named).** A persisted entry is `(kind, id, payload)` consumed at TILE CONSTRUCTION: `sim` entries transform tileParams/masks BEFORE the sim builds (a dug canal segment changes routes/spawns/water legally — the tile factory is the sole reader); `render` entries mount visuals only (a wreck, a green swatch). No entry may reach into a LIVE sim — persistence speaks once, at birth. (This is the planar-sim law and rendering-only law §4.6 extended to time.)
5. **BOUNDED, LOUDLY.** ≤32KB serialized per tile; writes exceeding budget fail with a surfaced warning and write NOTHING partial (no silent truncation — Mistake-class). Budget raises are a spec edit, not a workaround.
6. **NOTHING LOVED IS ERASED.** The API has no clear() on the normal path. Destructive reset = explicit player action + typed confirm + the profile's own scope only. Append/merge semantics everywhere else.

## The slices
- **TP-00 — THE SUBSTRATE** (task authored, lane-d; INERT — e5-03 precedent): TileStateStore with the envelope, read-at-birth/write-at-end API, versioning, budget law, zero live consumers. GATE: determinism A/B (same seed + same snapshot = identical event log; different snapshot = divergence AT tick 0 only), profile-isolation tests, budget-refusal test.
- **TP-01 — FIRST CONSUMER, RENDER-CLASS:** migrate the W6 wreck flag onto the substrate (render entry: the hulk mount). Proves the migration path on the smallest real thing.
- **TP-02 — FIRST SIM-CLASS ENTRY (the risk-retirement slice):** ONE permanent planted-green waypoint on one map (Seed Run's mechanic in miniature): a sim entry that transforms tileParams at birth (a small no-spawn zone + a render swatch). Proves the Loader Contract end-to-end — if there's a landmine in persistence-changes-sim, THIS small slice steps on it, not E9's canal stages.
- **TP-03+ — E9's canal stage-gates** (C1→C3 per the bundle) build on a proven substrate.

## Integration map
Touches: new src/game/TileStateStore.ts (or equivalent), ProfileStorage additive keys, tile factories' construction seam (read-at-birth), run-end summary seam (write-at-end). NEVER: live-sim mutation paths, Economy/Combat single-writers, existing e2e assertions, the Terrain visualY law.

## Ratification questions (owner, batched — none block TP-00)
Q1. What persists, per feature: recommend accretion-style VERDICTS per entry kind (persist / decay-over-runs / run-only) declared in each consumer's spec — no default persistence.
Q2. Cross-profile: never in v1 (recommended). Town-level shared persistence is a separate future question (multiplayer's).
Q3. The write moment: run-end only, or also mid-run ceremony beats (recommend: run-end + named ceremonies — C-stage floods are ceremonies)?
Q4. Player-visible surface: when does the player SEE "this stays"? (Recommend: the first persisted thing gets a one-line toast + a ledger page — the reset-ache deserves its healing shown.)
