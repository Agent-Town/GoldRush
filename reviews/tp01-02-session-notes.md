# TP-01 + TP-02 session notes — tp/01-02 (attended-commissioned Fable session, 2026-07-17)

Branch: `tp/01-02` · tip: see `git log` (feat(persist) commit) · TASK.md untracked by design.
These are the implementing session's notes for the drain; the drain authors the verdict review file.

## What shipped
- **TP-01**: W6 wreck persistence moved onto TileStateStore. Boss system takes an injected
  `DredgeQueenWreckPersistence` port (read-at-birth / write-at-ceremony); Game owns the store.
  Compat: substrate entry wins; legacy `gr.e5W6Wreck.v1` read once at birth as fallback, staged
  as a converted `render/dredge-queen-wreck` entry, committed only at a lawful write moment
  (crew-quits ceremony or run end). The legacy flag is never deleted.
- **TP-02**: `applyAtBirth` implements exactly `sim/green-waypoint` ({x,z,r} → `tileParams.noSpawnZones`
  delta, immutably; unknown kinds/ids pass through). `bornContract` in Game is the sole birth reader.
  WaveSystem pushes in-zone spawns radially to the rim, rng-free. ?debug KeyG plants once on
  e1-dry-gulch at the hero's feet (stage → commit at run end). Swatch mounts at next birth in
  `E1_RIVERBANK_GREEN = '#848c6c'` (measured dominant of assets/processed/terrain-river-tile.png —
  the hex-law constant now lives code-side in src/world/GreenWaypoint.ts).

## Evidence
| Gate | Result |
|---|---|
| tsc / build | clean / green (750–790ms) |
| tp01-w6-migration | 2/2 desktop + 2/2 mobile |
| tp02-green-waypoint | 3/3 desktop + 3/3 mobile |
| tp00-tile-persistence (adjacent) | 6/6 desktop + 6/6 mobile, unmodified |
| e5-boss-dredge-queen (adjacent) | 4/4 desktop + 4/4 mobile, assertions unchanged; perf ratio 0.61 desktop / 1.00 mobile (≤1.15 gate) |
| task-025 (adjacent) | 5/5 desktop + 5/5 mobile, unmodified |
| Console/page errors | zero, asserted in every spec |
| Shots | artifacts/tp01-02/ (waypoint born desktop+mobile, wreck-from-legacy-flag) |

Scratch config `playwright.tp.config.ts` on port **5232** (5207 was found serving the MAIN checkout —
a fire's scratch vite; reusing it would have gated main's code from this worktree, Mistake #12 class.
Delete the config after the drain.)

## Findings
- **F-TP-1 (the spec's predicted ProfileStorage scope surprise — CONFIRMED, named):**
  `ProfileTransfer` (export/import) and every `PROFILE_DATA_KEYS`-driven surface enumerate only that
  set; tile-state keys (`gr.profile.v2.<id>.tilestate.<contract>`) are not in it. Consequence: a
  profile export carries the LEGACY wreck flag but NOT substrate entries — after TP-01, a transferred
  profile keeps its wreck only via the un-erased legacy flag; a TP-02 waypoint does not transfer at
  all. Also `gr:profile-data-changed` never fires for tile-state writes (AccountSync blind to them).
  Needs a corrective task: either add a tilestate wildcard to transfer/sync enumeration or rule
  tile-state device-local. Non-blocking for TP-01/02 (both specs prove profile isolation works).
- **F-TP-2 (cosmetic, non-blocking):** the flat swatch disc clips into terrain relief on sloped
  ground (see desktop-green-waypoint-born.png, north half buried). Placeholder-first art law applies;
  a draped decal is an art-batch concern.
- **Environment note:** this sandbox's full-binary headless chromium drops letter-key CDP input
  (arrows/Space deliver, letters don't — probed). tp02 dispatches the KeyG KeyboardEvent synthetically;
  same InputController → intent → plant path.

## Write moments (Q3 posture, as implemented)
Run end (`run_ended` listener + `Game.endRun`) plus one named ceremony: the Dredge-Queen crew-quits
beat (the hulk must survive an immediate reload — the shipped W6 spec reloads mid-run and that
behavior is law). Commits are idempotent; staged-but-uncommitted state dies with the run.
