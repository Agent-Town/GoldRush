# F-1742-1 headless landmark depenetration drain review

## Verdict — PASS

Lane-d candidate `474df890e4b33d462a85e625e628797f01e6b66a` is ready to merge. The change restores the browser's existing landmark-depenetration seam in `HeadlessContractSim`; it does not change contract data, balance, enemy routing, or browser gameplay.

## What changed

`HeadlessContractSim` now passes `Hero.update` the existing `depenetrateFromBlockers` helper over `Terrain.landmarkBlockers()`, using the browser's hero-radius padding. One focused `gr-sim` test pins two Long Road and two Gusher County seeds, verifies byte-identical terminal output across repeats, and proves each hero leaves its declared landmark-centered start before terminal.

## Evidence

| Gate | Result |
| --- | --- |
| Policy | `drain-block-check`: CLEAR, live leaf `queued` |
| TypeScript / build | green / green |
| Focused headless pin | 1/1 passed; four seeds repeated byte-identically |
| Full `gr-sim` | 17 passed / 2 explicit skips / 0 failed |
| Existing null floors | all 41 outcome anchors unchanged; only the known commit-keyed `eraStamp` differs (F-1653-3) |
| Browser collision + escape | 6/6 passed, desktop + 390 px mobile, `--workers=1`; each passing spec asserts zero console/page errors |
| Required adjacent menu check | 2 failed on candidate and identically on untouched main: missing `start-menu-enter-town` for `?town3dPilot=all` |
| Full Node guards | 454 passed / 5 skipped / 2 failed under Node 26.4.0; both failures are the same pre-existing `news.html` link to missing `index.html#teaser`, reproduced directly on untouched main |
| Diff | `git diff --check` clean; exactly the two declared paths, +50/-1 |

Pinned terminal tuples (`waves`, `kills`, `eventLogHash`): Long Road 01 `(4, 41, fnv1a32:2b27b21d)`, Long Road 02 `(4, 48, fnv1a32:37ab9177)`, Gusher County 01 `(5, 93, fnv1a32:95f5777c)`, Gusher County 02 `(2, 29, fnv1a32:a9b7d153)`.

## Merge classification

The lane is one commit ahead of author base `9aec272d9e359d181ebd90f651081dce7e07e11f`. Main has not moved either touched path since that base. The gate ran in detached worktree `/private/tmp/gr-s1745-gate.AjZZph`; main's pre-existing logs, `.claude/cache/`, and attended railcar-v2 master remained outside custody.

## Findings

No blocking or new adjacent finding. The `index.html#teaser` baseline red is already documented in `reviews/prep-bench-seeds-flagships.md`; the menu-safe baseline red is unrelated to these two files and reproduced in both browser projects on current main. This headless benchmark-parity repair is not player-visible, so it does not require a Gazette item or deployment.
