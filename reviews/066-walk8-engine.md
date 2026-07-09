# Review — 066-walk8-engine (Cast Motion Ladder / SpriteAnimator engine slice)

- **Slice:** 066-walk8-engine (lane-c, RENDER-ONLY)
- **Branch / source tip:** `lane/polish` @ `871c87b` (`runner(lane-c): 066-walk8-engine.md`)
- **Grafted onto main:** base `5575e9c` (s279 lock) — landed s279
- **Drained by:** s279 fire

## Verdict
**PASS — merged.** The new 8-frame walk/hover sheets play in-game through a data-driven, per-character switch; hero correctly stays on walk4 (owner still owes the v3 pan-fixed hero verdict); one flaky adjacent (vp-02:382 texture-counter race) fingerprinted to a documented known-red, passes on isolation → non-blocking (F-066-1).

## What it does
Extends `SpriteAnimator` to read an 8-frame walk sheet (`walk8` contract block in `assets/layer-contracts/characters.v2.json`) via a new `WalkSheetSource` type: grid geometry (`file`, `cols`, `rows`, `rowDirections`) materializes per-direction frame files (`<base>-r<row>c<col>.png`) so a sheet needs no hand-listed cells. A `selectWalkSheet()` policy picks `walk8` when `enabled === true` AND its processed cells exist on disk, else falls back to `walk4` — a pure data flip, zero code, per character. Gait cadence is scaled (`cadenceReferenceFrames`) so 8 frames play over the same cycle duration as the old 4 (smoother, **not** faster — stride length preserved). Processes the delivered raws to `assets/processed*/` cells. Live switch state today: **hero = walk4** (walk8 READY, `enabled:false` — gated on the owner v3 verdict), **prospector hover8 = ON**, **jumper walk8 = ON**, baron walk8 processed but READY/off.

## Evidence (native, both projects, scratch port 5231)
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (`✓ built in 344ms`; standing >900kB chunk warning only) |
| `066-walk8-engine.spec.ts` | **6/6** (3 tests × desktop+mobile): prospector hover8 = 8 distinct frames; hero stays walk4 while walk8 cells registered; jumper walk8 keeps old stride duration at higher frame count |
| `task-042-anim-smoothness` | pass ×2 — cadence speed-scaled, restart keeps phase; jumper fps 8.55 / fast 17.1 at frameCount 8, stride == hero (speed-regression guard green) |
| `task-031-anim-roundness` | pass ×2 — jumper frameCount 8, fps ~12.6, frame-blend preserved |
| `m4-06-embodiment` | pass ×2 — incl. no-`?debug` plain-boot Prospector render (= boot probe, zero console errors) |
| `vp-02-sprite-animation` | 25/26 desktop + 26/26 mobile; the one miss = F-066-1 below |
| `m1-01-claim-jumpers-death` | pass ×2 (claim_jumper now walk8; pool/draw-call budget intact) |
| `m2-01-build-menu` | pass ×2 |
| `task-025-bandits-dont-swim` | pass ×2 |
| Boot probe | m4-06 plain boot (no debug gate) green desktop 1280 + mobile 390, `consoleErrors == []` |

Totals across the battery: **89 passed / 1 flaky (isolation-pass) / 0 deterministic-fail**, both projects.

## Merge classification
- **Base of source commit:** `898d083` (pre-s-night) — the lane branch predates the s-night 059/060/061/063/064/065 merges, so the branch was NOT blind-merged. Grafted **871c87b's own diff only** (`git diff 898d083 871c87b`).
- **Overlap check:** `git diff --name-only 898d083 5575e9c` intersected with 066's touched paths = **EMPTY** (s-night touched none of `src/assets/SpriteAnimator.ts`, the 5 e2e specs, `characters.v2.json`, `LEDGER.md`, `assets/processed*`, `artifacts/066/`). Therefore every 066 file is LANE-TOUCHED-only vs main; zero 3-way judgment required.
- **Graft method:** path-scoped `git checkout 871c87b -- <066 paths>`; post-graft `git diff 871c87b -- <all 066 paths>` == empty (byte-identical). 276 files staged, all inside 066's firewall.

| File group | Class | Note |
|------------|-------|------|
| `src/assets/SpriteAnimator.ts` | LANE-TOUCHED | engine — WalkSheetSource + selectWalkSheet + cadence scale |
| `assets/layer-contracts/characters.v2.json` | LANE-TOUCHED | walk8 blocks + enabled flags |
| `assets/processed/*`, `assets/processed-full/*` (256 png + 4 frames.json) | NEW | processed walk8/hover8 cells |
| `e2e/066-walk8-engine.spec.ts` | NEW | the slice spec |
| `e2e/{vp-02,m4-06,task-031,task-042}` | LANE-TOUCHED | expectation updates (jumper 4→8 frames) — see F-066-2 |
| `assets/LEDGER.md` | LANE-TOUCHED | art ledger rows |
| `artifacts/066/*` | NEW | before/after + frame-probe json |

## Findings
- **F-066-1 (non-blocking, known-red env exception):** `vp-02-sprite-animation.spec.ts:382 "warmed test clip swaps do not grow renderer memory or draw calls"` failed once on desktop-chrome inside the 52-test batch, passed on mobile-chrome in the same batch, and **passed deterministically on isolated re-run** (`1 passed (9.4s)`). The test's own comments document this exact race (s25/s27: boot-time lazy texture uploads vary run-to-run, "9 vs 28 on the same build"). 066 adds new walk8 cells that lengthen boot-time lazy loading, which under batch CPU contention (live lane-d/art runs) can stretch the 8s quiescence window on desktop. It guards **hero** clip swaps — hero is unchanged by 066 (walk4). Not a swap leak (a real leak "grows every cycle and still fails deterministically"). Proceed.
- **F-066-2 (non-blocking, correct scope call):** the firewall said touch ONLY 066's e2e, but the runner also edited `vp-02`, `m4-06`, `task-031`, `task-042` specs. Verified legitimate: each asserts on **jumper** frame count / fps, which necessarily changed 4→8 when jumper's walk8 flag went ON. Updating them keeps adjacent suites green (the right call vs leaving them red); hero assertions still pin walk4/frameCount 4. This is a sanctioned firewall extension, recorded not corrected.
- **F-066-3 (owner, non-blocking):** hero walk8 is processed + READY but `enabled:false` — deliberately gated on the owner's v3 pan-fixed hero-sheet verdict (task scope #3). A one-line flag flip lights it up once the owner passes it. No code change needed.
