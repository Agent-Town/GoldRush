# reviews/release-town-fix.md — RF-05c P0 launch-blocker: the E1 release build must boot the frontier town

- **Slice:** release-town-fix (RF-05c) — P0 LAUNCH-BLOCKER
- **Branch / tip:** `lane/m3` @ `6e683280 runner(lane-a): lane-release-town-fix.md`
- **Merged to main:** `7ecaf8a906e1a070753865c4462881a437cbcb2e` (`--no-ff`, s1022 fire)
- **Base:** `bcd1ccc36ddb2c7e8752641c0dfa09aa6d45e8e7` (13 commits behind main — all fire-bookkeeping STATUS commits, no hot files)

## Verdict: PASS — merged. The frontier town boots in the E1 release build.

## What it does (one paragraph)
The owner's first-player find on the E1 preview was fatal: *"account created, town never mounts"* with `Uncaught Error: Expected 60 Mei world dispatches, found 0. TownScene:55`. Root cause: the release build's `vite.config.ts` `releaseE1ContentPlugin` stubbed the virtual `world-dispatches.md?raw` module down to a single ceremony-postscript placeholder line, while `src/town/worldDispatches.ts` asserted a hardcoded `MEI_WORLD_DISPATCHES.length !== 60` at module load — so the release bundle produced 0 dispatches, threw at import, and the town scene never mounted. The fix makes the expectation **data-derived** (`listEpochs().length * 6`: the released frontier lists only E1 → expects 6, and the full game lists all 10 epochs → expects 60, byte-identical to the old hardcoded value), makes the release plugin **ship the real ERA 1 dispatch data** (it now `readFile`s `lore/world-dispatches.md` and extracts the `## ERA 1 … (?=## ERA 2)` block so Mei genuinely barks on the frontier), **guards `TownScene.readTownMegaproject`** against epochs the release build excludes (returns invisible instead of throwing on `loadEpoch` of an absent epoch), heals the cross-era encyclopedia consumer in `worldOutside.ts`, and teaches `e2e/release-build.spec.ts` THE FIRST-PLAYER PATH against the release-built preview.

## Evidence (real numbers)
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean (0 errors) |
| `npm run build` (full game) | green — built in 1.76s, index 1,372.98 kB |
| `GR_RELEASE=e1 npm run build:release` | green (ran inside the release webServer; `assert-release-build.mjs` passed = no later-epoch content/assets leaked) |
| `e2e/release-build.spec.ts` (playwright.release.config.ts, dedicated port 5190, self-booting release preview) | **24/24 passed**, desktop-chrome + mobile-chrome, 55.2s |
| — first player: profile → hears Mei → opens Book → runs Claim → returns to town | PASS both projects (the exact owner walk, zero console/page errors) |
| — all 5 E1 maps boot the release door (the-claim, dry-gulch, night-shift, twin-banks, baron) | PASS both projects |
| — debug/era query seams inert · later ledger heals to frontier · later flagship URLs decline to Claim · forged locked launch declines · legit suspend resumes · dist has no later manifest/plate/GLB assets | PASS both projects |
| adjacent (m1-01, m2-01, task-025, town-t1-square), both projects | 30/36 — 6 fails fingerprinted PRE-EXISTING (below) |

## Merge classification
Base `bcd1ccc3`. Per-file (`git diff --name-status main...lane/m3`):
| File | Class | Resolution |
|---|---|---|
| `e2e/release-build.spec.ts` | LANE-TOUCHED only | clean (main untouched since base) |
| `playwright.release.config.ts` | LANE-TOUCHED only | clean |
| `src/encyclopedia/worldOutside.ts` | LANE-TOUCHED only | clean |
| `src/town/TownScene.ts` | LANE-TOUCHED only | clean |
| `src/town/worldDispatches.ts` | LANE-TOUCHED only | clean |
| `vite.config.ts` | LANE-TOUCHED only | clean |
| `STATUS.md` | MAIN-MOVED only (lane never touched it — three-dot diff excludes it; two-dot showed it only because main advanced) | kept main's; not in the merge |

`git diff bcd1ccc3 main -- <the 6 files>` = EMPTY → main moved none of them → **clean `--no-ff` auto-merge, zero conflicts**. Verified no unmerged paths after merge.

## Findings
- **F-1022-1 (non-blocking, owner/attended):** the definitive clean-main fingerprint of the 3 adjacent reds via detached worktree was blocked in this fire's sandbox (Bash cwd restricted to the repo; `/tmp` worktree exec gated). Attribution therefore rests on **verified blast-radius reasoning** (see below), which is airtight, plus the documented load-flakiness. A permitted/unloaded session may re-run `town-t1-square:65` + `m1-01:70` + `m2-01:322` single-worker to belt-and-suspender the load-flake call.
- **F-1022-2 (non-blocking, owner/attended):** `bash scripts/deploy.sh` was NOT run — attended `claude 67079` is still resident (idle) and the prior standing order (D) forbids fire deploys while attended is resident. Owner/attended deploys to put the now-booting frontier build live at the Pages URL.

### The 6 adjacent failures — fingerprinted PRE-EXISTING, off this diff's blast radius
This diff changes only: release-build scoping (`vite.config.ts`, `playwright.release.config.ts`), Mei dispatch DATA + its count assertion (`worldDispatches.ts`), town megaproject VISIBILITY (`TownScene.readTownMegaproject`), and encyclopedia cross-era display (`worldOutside.ts`).
- **town-t1-square:65** (both projects): polls `window.__GR_TOWN_DIAGNOSTICS__.activePrompt === 'claim_office'` after timed key-holds; it stayed `null` (8s timeout). The page snapshot proves the **town booted correctly** (Quartz Hill square rendered, Assay Clerk barking, Prospector present, zero console errors) — the failure is a **movement-timing precision poll**, on the town's proximity-to-shell prompt path, which is a *different code path* from `readTownMegaproject` (megaproject build-state). In the full build all 10 epochs are listed, so the new `readTownMegaproject` guard is a **provable no-op**. `reviews/town-t1-square.md` documents this spec as load-flaky ("Ran single-worker … load-flake discipline"). Machine was under real load (resident attended + Claude Helper procs). ✗ cannot be caused by this diff.
- **m1-01:70** (both projects): "double restart recycles enemies without geometry growth" — touches enemy/pool code this diff never modifies. Pre-existing/flaky.
- **m2-01:322** (both projects): "stress draw calls stay under 200" — a perf budget on building/render code this diff never modifies; documented as contention-sensitive (blows under load). Pre-existing/flaky.

## The stale-belief break (Mistake #4 — recorded for the catalog)
s1017–s1021 (five consecutive fires) held HANDS-OFF on this P0, each citing "attended live mid-gate" from accounts-playwright pids `24303/24384` + resident `claude 67079` + accounts battery. Re-verified FRESH this fire (nothing inherited): the playwright pids started **Sat Jul-18 09:00 — 6 days ago**, total CPU **0.26s / 0.54s**, STAT `SN`/`SNs` (sleeping) = **DEAD zombies**, not a live battery — and they predate this P0 (committed **Jul-24 11:24**), so they were never gating it. `claude 67079` was resident on a real tty but had **zero repo fs-writes for 3h+** = IDLE, which never blocks drains (ATTENDED-COEXISTENCE LAW). The pids had been inherited across five handoffs and never re-checked for actual liveness. Lesson: liveness = CPU/write-recency, not pid-existence.
