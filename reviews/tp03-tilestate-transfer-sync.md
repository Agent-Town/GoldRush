# Review — tp03-tilestate-transfer-sync (F-TP-1 corrective)

**Slice:** lane-d-tp03-tilestate-transfer-sync · **Branch:** lane/perf (worktrees/lane-d) tip `23645680` · **Merge:** `2504a5ca226168ff3b3ccdc5b08012537e96fde2` (clean `--no-ff` merge; lane base `582d3b23` == main HEAD, no graft needed)
**Drain:** s728 fire, 2026-07-17
**Verdict: MERGED.** tsc + build green; tp00/tp01/tp02 + task-025 = 34/36 in-battery; the 2 reds are a pre-existing snapshot-compose test (tp00:171) that cleared single-worker isolated (contention false-red); tp03's 2 new tests green both projects.

## What it does
Closes **F-TP-1** (filed by the tp/01-02 shift, `reviews/tp01-02-session-notes.md`): "ProfileTransfer and every `PROFILE_DATA_KEYS`-driven surface are blind to tilestate keys; a profile export carries the legacy wreck flag but not substrate entries; `gr:profile-data-changed` never fires for tile-state writes so AccountSync won't sync them." Before this, a profile export/cloud-sync silently dropped every canal, waypoint, and wreck the E9 substrate stores. The fix teaches the transfer/sync surfaces about `tilestate.*` keys, and makes the store announce its end-of-run writes — **before anything leans on the substrate** (E9's era-defining persistence).

- **`src/game/ProfileStorage.ts`** (+33/-1): new `profileDataKeys(storage, profileId, candidates)` — unions the static `PROFILE_DATA_KEYS` with tilestate keys discovered by enumerating the storage under `gr.profile.v2.<id>.` (guarded by `isEnumerableStorage`) plus any `tilestate.*` candidates handed in (import envelope keys). New `isTileStateDataKey(key)` predicate (`tilestate.` prefix + non-empty suffix). `notifyProfileDataChanged` promoted to an export so the store can fire it. No key-shape or existing-API changes.
- **`src/game/ProfileTransfer.ts`** (+22/-10): pack/unpack/restore-bundle now iterate `profileDataKeys(...)` instead of the static list — so exports carry `tilestate.*`, imports and cloud-restore restore them. Tile-state values are kept as **raw strings** through pack (`isTileStateDataKey(key) ? raw : decodeDatum(raw)`) for byte-faithful round-trip; `normalizeTileStateDatum` validates each against `Balance.persistence.tileStateMaxBytes` (rejects over-budget rather than corrupting), and tile-state keys join `requiresValidatedDatum` so a bad datum aborts the staged restore atomically (unknown-key preservation law holds).
- **`src/game/TileStateStore.ts`** (+4/-1): `commitAtRunEnd()` gains a `wrote` flag and calls `notifyProfileDataChanged('tilestate')` **once** when any contract committed — write-at-end stays the only write moment (spec law 3); AccountSync now sees the change. Not a store-API change (no signature/consumer change); this is scope item 2's mandated behavior.
- **`e2e/tp00-tile-persistence.spec.ts`** (+90, additive at L227+): two new tests × 2 projects — (a) export → wipe → import preserves a staged tilestate entry **byte-identically**; (b) a tile-state commit emits **exactly one** `gr:profile-data-changed` event.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | ✓ built 954ms |
| `e2e/tp00-tile-persistence.spec.ts` (incl. tp03's 2 new tests) | new tests **green** ×2 projects; one pre-existing test (tp00:171) reds under battery load, **passes single-worker** (10.9s desktop / 10.2s mobile) |
| `e2e/tp01-w6-migration.spec.ts` | green ×2 |
| `e2e/tp02-green-waypoint.spec.ts` | green ×2 |
| `e2e/task-025-bandits-dont-swim.spec.ts` (adjacent baseline) | green ×2 |
| Battery total | 34/36 pass; 2 reds = the single pre-existing contention false-red below |
| Console | zero errors in booted specs |
| Render/perf | N/A — data-layer only, nothing renders (§3) |

## Merge classification
lane/perf tip `23645680` (single `runner(lane-d)` commit) is based at `582d3b23`, which **is main HEAD** — so `git merge --no-ff lane/perf` was a conflict-free true merge (no stale-base graft, no phantom deletions). All four files: three `M` (ProfileStorage/ProfileTransfer/TileStateStore) applied clean, one `M` (the tp00 spec, additive append). Verified `main..lane/perf` empty post-merge.

## Findings
- **F-tp03-1 (non-blocking, proven contention false-red):** the battery run reds `tp00-tile-persistence.spec.ts:171` "same seed composes with snapshots while the birth loader remains inert" on BOTH projects with a **30s timeout** (not an assertion). This test is **pre-existing** — it sits at L171, before tp03's additions at L227 — and it **passes in isolation single-worker** (10.9s / 10.2s, well under budget). tp03's data-layer changes (a window CustomEvent + key enumeration) have no path to a snapshot-compose/birth-loader timeout. Classic gate-battery contention (5 heavy specs × 2 projects × 2 workers, concurrent with the build). No corrective owed.
- **F-tp03-2 (non-blocking, carried, attended-owned §7.6):** `goal-tracker.test.mjs:17` category-count is RED on main independent of this drain (standing F-1: 11 categories vs a hardcoded 5). Baseline before this drain = 1 pass / 1 fail; the tp03 goal-leaf flip to `merged`/`2504a5ca…` (full 40-char, ancestral) does not touch category structure, so the count stays unchanged.
- Firewall held: no store-API rework, no consumer changes, no sync-provider rework. The `TileStateStore` touch is exactly scope item 2's event emission on the existing commit path.
