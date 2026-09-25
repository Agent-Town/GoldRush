# Drain review: `test-truth-2`, five test instruments made true and the ten secured pairs measured (Opus 5.5 implementer at max effort; owner 2026-09-25 spare budget)

**Branch** `test/test-truth-2` at `392c66192` · **merge** `5209d4d03` · engine hash unchanged (`c63def1b`, no pin) · drained attended 2026-09-25 18:51Z in a detached chain worktree with the scratch store at `5793a96`; no deploy (scripts/attended/land.sh, config `tt2`).

**Verdict: LANDED.**

### What it does
Five test-side findings from the landings of 2026-09-25 get their true instrument, each proved against a control worktree of clean main (Opus 5.5 implementer at max effort; owner: the spare budget). **F-SEF2-5b, the Night Shift luminance probe:** it sampled world (0, 0) instead of the hero, compared sRGB luma with a linear tint, read a DOM tip card on the phone (0.93262 in day and dark) and used a device-pixel patch on a 2.75 ratio screen; rebuilt to read a named body at torso height with a still camera and every DOM layer hidden, returning display luma, display linear and scene light, with the band re-derived from the renderer's own dark tint (0.526 to 0.666) and a sensitivity check first (dark under 75 percent of day). Ramp ratio 0.26 and 1.0 before, 0.585 and 0.589 after on desktop and phone; lantern in-radius 0.237 to 0.78 to 0.81. **F-SEF2-5c, the Twin Banks determinism wait:** the snapshot landed at frame 19 to 23 while the terrain pilot reached ready at frame 30 to 31; it now waits for the pilot state and two frames (7 of 10 red to 10 of 10 green). **F-E1T-1, the reed field:** the old measurement watched a cleared build zone; the census of 44 swaying cards is asserted first and moved pixels are counted inside their footprints from the claim stake (0 to 308 to 336 against 5 to 9 in a same-frame control). **F-MPP1-1 and F-MPP1-4, the secure spec's banks step:** it asked for a NEW row after the click although the game writes at the secure tick, and read secure wave 0 from the manifest; it now asks for a secured row whose `at` was not in the boot scoreboard and takes the secure wave from the engine. With that instrument the ten secured pairs were measured: banks 9 of 9, reload 9 of 9 (7,396 to 7,401 bytes byte-identical), board 7 of 9, clean 10 of 10; the Last Claim's board fail is the test (Return to Town opens the finale's Charter Press, F-TT2-1), the Seed Run phone died at wave 19 and 17 and is unmeasured. Where the player sees it: nowhere; these are the instruments the factory judges maps with, now measuring what they claim.

### Measured
tsc rc 0, build rc 0, four named guards 52 of 52, evidence budget PASS at 9.4 MB, 77 evidence files. Every cured test green at least three times on both projects; the controls red on clean main `517822b35` as recorded. The relight test ("cold lantern relight costs survive run suspend and continue") is red 2 of 10 on BOTH arms at load 25 to 130 and is main's own race (F-TT2-3). Ten boots died before test code on a dev-server dependency-scan failure present on every worktree (F-TT2-2). No `src/`; the engine hash did not move.

### Merge classification
LANE-TOUCHED: `e2e/e1-night-shift.spec.ts`, `e2e/e1-twin-banks.spec.ts`, `e2e/beauty-twin-banks.spec.ts`, `e2e/playability-secure.spec.ts`, `docs/bench/playability-secure-census-2026-09-25.md` (ten rows replaced, a dated section), `logs/suite-red-inventory.md` (correction rows), `reviews/sol-map-art-current-status-20260909.md` (second column, six rows; the toolkit's row-keyed three-way merge resolves Astra's concurrent cells), `artifacts/test-truth-2/**`. The drain writes `artifacts/test-truth-2/report.md` from the implementer's text (its harness refused the file).

### Findings
- **F-TT2-1 (a slice):** the secure spec's board step needs a finale leg: when `e10-return-town` is on screen, press it and expect `contract-board-title`; then re-measure the Last Claim board cell.
- **F-TT2-2 (infra, a slice for the attended session):** the dev server's dependency scan fails on every worktree (`Failed to run dependency scan`, `[TSCONFIG_ERROR] ... '../tsconfig.json'`); deps are found at runtime and the server reloads, and 3 of 11 fresh starts broke `Game.ts` for 30 s to 3 min. canyon-works-traversal-1 saw the sibling hazard: another worktree's dev server re-optimising the SHARED `node_modules/.vite` mid-load. A per-worktree vite cache dir and a dependency scan that resolves the worktree's own tsconfig are the cure (`worktree-vite-cache-1`).
- **F-TT2-3 (a slice):** the relight test's de-race waits for a suspend record that lasts about 750 ms at timescale 40; under load it misses it or reads restoredWave 2.
- **F-MPP1-5 (noted):** the Seed Run phone secured 1 of 3 runs today.
- **Closed:** F-SEF2-5b, F-SEF2-5c, F-E1T-1, F-MPP1-1, F-MPP1-4.

### Battery attribution (drain, 18:28Z)
Row "fixture owners remove their temp directories" allowed for this landing only: the sweep failed on "scripts/node-guards-contention.test.mjs child failed", the load shape (another battery on the host), not fixture survivors; the branch is tests and docs, no src

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 137 ℹ fail 0` |
| e2e both projects, --workers=1 | `rc=0   14 skipped   62 passed (5.8m)  18:07Z` |
| full npm run test:node-guards (before the pin) | `rc=1 ℹ tests 1018 ℹ pass 1012 ℹ fail 1 ℹ skipped 5  18:27Z` |
| engine hash | `merged: c63def1bfc493e243f31b9b115344ec6e3aacd57075554ec6a2ce872dfd90bef (pinned c63def1bfc493e243f31b9b115344ec6e3aacd57075554ec6a2ce872dfd90bef)` |
