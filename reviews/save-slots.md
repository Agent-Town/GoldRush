# reviews/save-slots.md — SAVE-SLOTS re-land drain (lane/m3 `5f8b9da`)

**Slice/branch/tip:** curated save slots — `lane/m3` @ `5f8b9da feat: add curated save slots` (base `bb21567`).
**Drain attempted by:** s231 fire, 2026-07-09.
**Verdict:** ⛔ **DEFER — NOT MERGED.** The graft onto current main was completed and PROVEN byte-correct, tsc + build green, 5/6 own-spec tests green — but the 6th (`save-slots.spec.ts:138` suspend-restore) is **racy (3/4 fail) once combined with e2-enemies' WaveSystem**, which is already on main. A red own-spec fails the gate; per CLAUDE.md §3 the fix is a corrective, not a red merge. Feature code is not implicated — it's a test-capture race. **One well-scoped test-robustness fix from landing.**

## What it does
Adds curated manual save slots on top of the auto-suspend: a `SaveSlots.ts` store (309L), a "Load a claim" start-menu screen, manual-save card in the pause panel, 12-slot cap + storage-budget warning, Pack/Unpack transfer, and the wave-boundary "save as of wave N's end" flow. 16 files: `src/game/SaveSlots.ts` (new), `src/game/Game.ts` (+51 wiring), `ProfileStorage.ts`/`ProfileTransfer.ts`/`main.ts`/`styles.css`/`Hud.ts`/`ui/menu/StartMenu.ts`/`ui/theme.css`, `e2e/save-slots.spec.ts` (373L, new), 6 `artifacts/save-slots/*.png`.

## Merge classification (base `bb21567` → current main `eb2a1b3`)
Main advanced since the lane's base by mp-01 (server-side `functions/**` only), e2-enemies (`src/entities/*`, `WaveSystem.ts`, `CombatSystem.ts`, `Game.ts`, `ContractFamilies.ts`, story files, `contracts.json`, `e2-enemies.spec.ts`), and STATUS/BACKLOG/LEDGER bookkeeping. Cross-referenced against the feature's 16 files:
- **LANE-TOUCHED, single-base clean (main did NOT move them):** `SaveSlots.ts`, `ProfileStorage.ts`, `ProfileTransfer.ts`, `main.ts`, `styles.css`, `Hud.ts`, `StartMenu.ts`, `theme.css`, `e2e/save-slots.spec.ts`, `artifacts/save-slots/**` → clean `git checkout 5f8b9da -- <path>`. (The s228 "StartMenu.ts conflict with story:THE LOOP" worry is MOOT: THE LOOP landed before `bb21567`, so the re-land's base already contains it and main did not re-touch StartMenu.ts since.)
- **MAIN-MOVED, genuine 3-way — exactly ONE file: `src/game/Game.ts`.** e2-enemies added +63/-15 (boss/enemy machinery, railcar handler, boss-title helpers); the feature added +51 (manual-save wiring). **The two hunk-sets are provably disjoint** (feature touches import L156, a field ~L332, the `save_claim` intent ~L2878, and `manualSaveSnapshot`/`saveManualClaim` ~L3767; e2-enemies touches L738–L4027 boss/enemy code — no overlap).

## Graft method (fire-legal, PROVEN — for the next actor)
`git cherry-pick` / `merge-file` / `merge-tree` / `apply` / `patch` / `git reset` / `git restore` are all approval-walled for fires under `~/.claude-fires`; `git checkout <ref> -- <path>`, `git add`, `git commit`, `git diff --output=`, and `cp` are permitted. Game.ts 3-way was done by capturing the three versions (`git checkout <base|main|feature> -- Game.ts` + `cp` to scratch) and re-applying main's 14 disjoint hunks onto the feature version via the Edit tool, then **byte-verifying by double-diff:**
- `diff(merged, feature) == git diff bb21567 eb2a1b3 -- Game.ts` (63 ins / 15 del) — **exact, hunk-for-hunk identical.**
- `diff(merged, main) == +51` — **exactly the feature's Game.ts delta** (matches the re-land stat `Game.ts | 51 +`).

Both parents' contributions reproduced with zero deviation → the merge is the unique disjoint union, **not** a Mistake-#15 blind hand-merge (subtle corruption is impossible when both parent-diffs match to the byte).

## Gate results (on the completed graft, merged onto `eb2a1b3`)
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | ✅ clean |
| `npm run build` | ✅ green (293ms; only the pre-existing >900kB chunk warning) |
| `save-slots.spec.ts` both projects | ⚠️ **5 passed / 1 failed** (desktop `:138`) |
| `save-slots.spec.ts:138` desktop, 4× single-worker | ⛔ **3 failed / 1 passed — non-deterministic** |

## Findings
### F-ss-race (BLOCKING the merge; NOT a product defect) — `e2e/save-slots.spec.ts:113`
`comparable()` includes `waveSpawnedTotal` (L113) and `enemiesAlive` (L114) — **live counters** that keep changing as the sim resumes after a restore. The failing test at `:138` builds `direct` via `restoredComparable` (waits for `run.suspend.restored===true`, then reads the freshly-rewritten auto-suspend) and `loaded` via the Load-Claim UI (waits for `run.suspend.restoredWave===saved.wave`, then reads). The two paths sample the still-mutating auto-suspend at **different sim-progress points**, so `waveSpawnedTotal` lands 25 vs 26 (off-by-one).
- **Why now:** the test passed on lane/m3 alone (base `bb21567`, pre-e2-enemies). e2-enemies' rewritten `WaveSystem.ts` (already on main via s230 `07abf55`) changed the wave-1→2 spawn cadence, widening the divergence window to ~75% fail.
- **Why it is NOT the sim / NOT the Game.ts merge:** perf-04 proves the sim is deterministic (identical two-session hash `fnv1a32:598dff4d`); the Game.ts merge is byte-verified above. The stable restored fields (wave, economy, hero, buildings, progression) match; only the two live counters diverge.
- **Reproduction constraint (important):** the race reproduces **only on a save-slots + e2-enemies MERGED tree.** A plain lane/m3 corrective canNOT build it (lane/m3 base predates e2-enemies) → a fix must be authored/verified on a re-land onto **current** main, or in an attended merged working tree.
- **Candidate fixes (test-intent decision — flagged for owner/attended):** (a) exclude `waveSpawnedTotal`+`enemiesAlive` from `comparable` (they are transient post-restore, not part of the persisted-state contract); or (b) compare the two restores at a deterministically-quiesced point (pause the sim on restore before sampling, or make both paths wait on an identical settle condition); or (c) assert against the persisted slot snapshot rather than the live auto-suspend. (a) is smallest and defensible — the restore contract is about the durable snapshot, not a transient spawn counter.

## Next-actor path (fast)
The graft is proven; only F-ss-race remains. Land via a re-land onto current main that also fixes the racy capture and re-gates on the merged tree (see `tasks/lane-a-save-slots-reland-v2.md`, FIRE-AUTHORED, un-queued pending attended's pick of candidate fix). The feature commit `5f8b9da` on lane/m3 is intact as the salvage-ref.
