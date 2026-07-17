# Task lane-d-tp03-tilestate-transfer-sync: profile transfer + sync learn about tile-state (LANE-D, commit prefix "fix(persist):")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md; reviews/tp01-02-session-notes.md (F-TP-1 — THE FINDING THIS TASK CLOSES, verbatim: ProfileTransfer and every PROFILE_DATA_KEYS-driven surface are blind to tilestate keys; a profile export carries the legacy wreck flag but not substrate entries; gr:profile-data-changed never fires for tile-state writes so AccountSync won't sync them); src/game/TileStateStore.ts (the substrate + its key shape); src/game/ProfileStorage.ts + the ProfileTransfer/PROFILE_DATA_KEYS surfaces + AccountSync (the three blind spots).

Pre-flight (LANE-SAFETY): standard safe-dupe rules (`git checkout -B lane/perf main && git clean -fd` on content-on-main; STOP on undrained/foreign). npm install; build green.
GROUND-TRUTH pre-flight: verify F-TP-1 still true on your base (export a profile with a staged tilestate entry — confirm absence). Already fixed = STOP SHIPPED.

## Why (F-TP-1, filed by the tp/01-02 shift 2026-07-18): E9's era-defining persistence rides this substrate; a profile that exports/syncs WITHOUT its tile-state silently loses every canal, waypoint, and wreck on transfer. Close it before anything else leans on the store.
## Scope
1. Tile-state keys join the profile-data surface: exports carry them, imports restore them byte-faithfully (unknown-key preservation law holds), deletion-on-profile-delete covers them.
2. `gr:profile-data-changed` (or the correct event) fires on commitAtRunEnd writes so AccountSync picks them up — write-at-end stays the only write moment (the spec's law 3).
3. Extend e2e/tp00-tile-persistence.spec.ts additively: export→wipe→import round-trip preserves entries byte-identically; the change event fires exactly once per commit.
## Firewall: ProfileTransfer/PROFILE_DATA_KEYS/AccountSync integration + the additive spec ONLY. NO store API changes, NO consumer changes, NO sync-provider rework.
## Self-check: tsc+build green · tp00/tp01/tp02 specs green both projects (unmodified plus your additive) · task-025 green · zero console errors.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + the round-trip evidence + which surfaces were touched.
