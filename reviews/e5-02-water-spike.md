# Review — e5-02-water-spike (Deepwater spike harness)

- **Slice:** e5-02-water-spike (E5 Deepwater dimension — prototype/spike)
- **Lane branch / tip:** lane/perf → `2f65b55a runner(lane-d): e5-02-water-spike.md`
- **Base:** `f066289b` (lane reset to main by s590; runner ran e5-02 on it)
- **Landed on main across two commits (see Merge classification):** `ceaf90fd` (17 new files, comingled with the s592 lock commit) + this commit (3 shared wiring hunks).
- **Verdict:** PASS — merged. Additive, debug-gated diagnostic harness. NOT player-visible in normal play → **no GZ item** (consistent with a spike, per the news-filter law: no player-visible change).

## What it does
Stands up the E5 "Deepwater" prototype behind `?debug&deepwater`, so the depth/travel/weather model can be exercised deterministically before any E5 gameplay slice:
- `src/world/WaterRegion.ts` — a 128×128 real dev tile ("shelf-reefs-dev") with depth-classed regions (surface/shallows/reef/wreck/trench) and per-region travel modes (swim/boat/depth).
- `src/entities/ClaimBoat.ts` — a Claim-Boat with anchors + build pads that accepts buildings and carries them between anchor points.
- `src/systems/StormWaveScheduler.ts` — deterministic weather cycle: one west→east storm wave per cycle, with telegraph → storm → clear phases and movement/visibility multipliers.
- `src/diagnostics/E5DeepwaterHarness.ts` — the `installE5DeepwaterHarnessFromSearch()` harness exposed on `window.__GR_E5_DEEPWATER__`.
- Wiring: `Balance.ts` adds a self-contained `e5:` config block (waterTile/claimBoat/weather) — additive, touches no existing key. `main.ts` adds a `?debug&deepwater`-gated dynamic import. `vite-env.d.ts` adds one `Window` interface line.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | ✓ built in 748ms |
| `e2e/e5-water-spike.spec.ts` | **8/8** (desktop + mobile): real dev tile w/ swim/boat/depth classes · Claim-Boat pads carry buildings between anchors · one deterministic west→east storm wave/cycle · **plain debug boot leaves the deepwater chunk dormant** |
| Adjacent plain-boot smoke `e2e/profile-first-boot.spec.ts` | **10/10** (desktop + mobile), zero console/page errors — confirms the shared Balance/main hunks don't perturb a normal boot |
| Artifacts | `artifacts/e5-water-spike/{desktop,mobile}-chrome-{water-tile,boat-pads,storm-waves}.{json,png}` |

## Merge classification
Lane base `f066289b` == current main for every touched file (`git diff --stat f066289b dff73e12` empty on all 20 paths) → the slice applied **cleanly, no 3-way graft needed**. All files are either brand-new (16) or additive-only hunks to shared files (Balance.ts/main.ts/vite-env.d.ts), all guarded by the `?debug&deepwater` flag.

**Two-commit split (recovery artifact, F-1):** the s591 fire died mid-drain having staged only the 16/17 new files (not the 3 shared hunks). The s592 recovery lock commit used a plain `git commit` which swept those already-staged files into `ceaf90fd` alongside STATUS.md. A `git reset --soft` to un-comingle is sandbox-gated for headless fires, so the split was left in place — the content is correct and complete; only the commit boundary is imperfect. This commit lands the remaining 3 shared wiring hunks + this review.

## Findings
- **F-1 (non-blocking, cosmetic):** e5-02's 17 new files are comingled into lock commit `ceaf90fd` rather than a single path-scoped drain commit. Content is correct and fully gated; no corrective task warranted (reset is gated; rewriting history for a cosmetic boundary is not worth the risk). Documented here for the ledger. Lesson recorded: after taking over a dead fire with a dirty index, `git reset` the pre-staged files before the lock commit, or commit with an explicit pathspec (`git commit STATUS.md`).
