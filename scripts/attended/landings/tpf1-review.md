## What it does
Every pause a player pressed was recorded in the reel as `set_pause paused:true` with no resume, so the county's replay stopped at the pause and any paused human standing was unassayable on every contract (F-RVA1-6, measured by river-assay-1). Astra chose, and wrote down before the code, the replay-side fix: while a run-tape replay is active the shared action handler ignores recorded `set_pause` actions, because tape ticks count active simulation time and a wall-clock pause has no simulation event to reproduce. The recorder and multiplayer are unchanged, so tapes recorded before the fix keep their pause actions and replay all the same. Proven with the county's own unchanged worker: fresh one-pause River reels verify on both screens, the pre-fix paused River reel verifies, a three-pause Claim reel reproduces its hash (a death reel, unassayable by design), the August seed-run human standing now replays past tick 274 to the end and is rejected only for its diagonal ticks recorded before the F-RVA1-1 fix, exactly as predicted; the heat-15 reels and the era-6 agent tape are byte-identical before and after. One spec row pauses and resumes mid-run and asserts the reel replays to the live hash and the worker verifies it.

## Evidence (Astra's run, base `3c35d5bed`, commits `17de886e6` and `5e494d724`; the drain's own gates are appended below)
| Proof | Live / claimed | Replay / verdict |
| --- | --- | --- |
| fixed-build River, one pause, desktop | `abebc77c` | same, VERIFIED |
| fixed-build River, one pause, 390 px phone | `2c982352` | same, VERIFIED |
| pre-fix paused River reel (pause at t=50) | `a8c5af79` | same, VERIFIED |
| fixed-build Claim, three pauses | `8b17af1a` | same at tick 176; UNASSAYABLE (death reel, no secure snapshot) |
| seed-run human row 0 (2026-08-20) | `c218335c` | past 274, completes at 18,000; REJECTED on hash (`0827c33c`: diagonal ticks before F-RVA1-1) |
| heat-15 probe / r1 / r2 | `b131e18e` / `f3a9c00c` / `b92da1bf` | VERIFIED, identical before and after |
| era-6 agent tape, headless arm | `a45ba9ac` | same, tick 2453, byte-identical output |
Engine hash `f6084527` (pin #70) → `2d180e6b…` (`src/game/Game.ts` only). The lane pre-flight found the lane behind main and reset it; npm under Node 23 rewrote the lockfile's libc metadata and Astra restored only that self-generated change.

## Merge classification
Base `3c35d5bed`; the branch touches `src/game/Game.ts` (the replay's pause handling) and `e2e/river-ending-score.spec.ts` (one row), plus `artifacts/tape-pause-fix-1/**`; main moved on none of them; `git merge-tree` clean. LANE-TOUCHED only. Pinned same-era; the deploy carries the replay fix to production and to the droplet's assay worker (the browser arm runs the game).

## Findings
- **F-RVA1-6:** closed by this slice (the cure flips the ledger row).
- The seed-run human standing remains rejected for F-RVA1-1 reasons (recorded before the axes fix); no reel recorded before 2026-09-26 with a diagonal tick can verify on any engine.
- A re-assay pass over the door's pending or rejected human standings after this deploy is the ops-evening item that could restore those recorded after the axes fix; the count is untested.
