# Review: first-town-transfer-bisect — no merge grew the first-town transfer; the instrument did, and the advance stream now waits for the town (scratch worktree, Claude Opus 5 implementer, attended drain 2026-09-06 evening)

**Slice/branch/tip:** `first-town-transfer-bisect` · `fix/first-town-transfer-bisect` · commits `3abb047b6`, `270f14729` on base `e5f3ac820` · merged to main: see the ledger row (first-parent merge; collisions `package.json` (guard list unioned, 115 files) and the ledger).
**Verdict:** MERGED, with the finding inverted from its premise. Owner's words, verbatim: "now it loads veerrry slowly" and "are the assets optimized for size?". The deploy's instrument (`scripts/deploy.sh:95-:110`, reproduced command-for-command on `GR_RELEASE=e1` release builds in detached worktrees) measures the BEFORE build `220886ab` at 21,609,438 B on both projects, not 12.0 / 15.6 MB, and every candidate merge at the same number within one swapped townsfolk plate (+28,587 B net). The gate's number is host speed: three runs of one fixed build measured 21,589,212 / 10,540,927 / 21,638,025 B (a 2.05× swing), and the same build reads 6,411,798 B at an emulated 8 Mbps, because the cue window ends at `data-asset-loading-state=ready`, which tracks only the scene's GLTF LoadingManager (`src/assets/AssetLoading.ts:19-37`), so 208 sheet responses and two mp3s race that signal. The repo's own evidence already showed it: `artifacts/asset-diet/town-transfer-*.json` read 15.6 / 16.6 MB and 21.9 / 22.5 MB on two 2026-08-10 revisions, a month before the four merges existed (F-BUDGET-4). What the bisect did find: `src/assets/AdvanceStream.ts:147-153` made a CONTRACT the priority-1 stream target inside the town scene, so entering the town pulled the Claim's terrain and panorama (1,052,408 B, two requests at ~1.29 s while the town itself still read `loading`); now a contract target neither resolves nor fetches while the current scene's loader reads `loading`, re-armed on the stream's own idle callback (F-BUDGET-3, ~15 lines). The gated byte number does not move and cannot (the hold releases on the very signal the probe's window ends on), so the invariant is asserted as ORDER: a new asset-diet test reads the stream's published target at each prefetch and fails on the uncured build naming both GLBs.

## The composition of the first town (cure build, 21,638,025 B, 482 responses, both projects identical)
| group | bytes | share | responses |
|---|---|---|---|
| PNG character sheets | 12,241,854 | 56.6 % | 208 |
| PNG plates, portraits, UI | 3,026,133 | 14.0 % | 14 |
| audio (mp3) | 3,010,289 | 13.9 % | 3 |
| GLB terrain + town plate | 1,844,876 | 8.5 % | 2 |
| GLB town details | 1,487,316 | 6.9 % | 10 |
| JS chunks | 27,557 | 0.1 % | 241 |

The hero's single runtime slot is 8,901,114 B in 141 responses (41 %), of which `work8` (3,552,007 B) and `attack8` (758,822 B) are claim animations the town never plays. The 2.1 MB tape-replay worker is built but not in the window. Recommendations, measured and not implemented: (1) split the hero slot's clip groups with a warm-on-idle path (~4.3 MB); (2) defer the two mp3s (1,800,881 + 1,200,587 B) to first playback, which the autoplay policy already gates behind a gesture (3 MB, the cheapest cut); (3) collapse the 241 `?url` module requests for 27,557 B (one per sprite cell, `src/assets/SpriteAnimator.ts:170`, `src/assets/generated.ts:46`) into one manifest per sheet family (~20 requests); at 100 ms round trips those 241 requests are the "veerrry slowly".

## Evidence
| Gate | Where | Result |
|---|---|---|
| Bisect | worktree, the deploy's instrument on eight builds | table in `artifacts/first-town-transfer-bisect/*.json`; no merge moved the number |
| Cure | worktree | contract prefetch while the town read `loading`: 1,052,408 B / 2 requests → 0 / 0; town-ready timing unchanged (1,587-1,607 ms loopback, 5,270-5,278 ms at 8 Mbps, three runs each) |
| Guard | worktree | new `first-town-request-families` 4/4, a sorted family allowlist read from the live evidence corpus; proven to bite (an injected second map and a new hall red 2 of 4, naming both) |
| tsc / build | worktree | clean / green (3,157 files) |
| e2e | worktree, both projects | `asset-diet` 11/12; the red `dieted output keeps two terrain census views and town within screenshot tolerance` (0.16-0.17 vs 0.15) fails identically on the uncured main build (control run by the implementer), environmental on this host |
| Attended on the merged tree | see the drain commit and the ledger row | tsc clean; era pin (guard 5/5); release build green; `first-town-request-families` + `deploy-budget` + `law-pointer` 41/41; `asset-diet` on the release build through `playwright.preview.config.ts` (the deploy's shape) 11 passed / 1 red, the same screenshot-tolerance test, desktop only |

## Merge classification
Base `e5f3ac820`; main moved by the secure-choice merge (`package.json` guard list, unioned). `src/assets/AdvanceStream.ts`, `e2e/asset-diet.spec.ts`: LANE-TOUCHED. `scripts/first-town-request-families.test.mjs`, `artifacts/first-town-transfer-bisect/*` (172 KB): NEW. `tasks/BACKLOG.md`: unioned; the F-BUDGET-2 row superseded in place by the drain.

## Findings
- **F-BUDGET-3 (cured):** the contract prefetch raced the town's own load; held until the scene reads ready. Honest limit, stated in the code: `assetLoadingState` covers GLTFs only, so the hold releases while ~12 MB of sheets still stream.
- **F-BUDGET-4 (instrument, OWNER'S DESK with F-1625-4):** the release-gated quantity measures host speed, not payload (2.05× on one build); the 25 MB gate is not a meaningful budget; the request-set guard is the replacement tripwire. A payload-shaped gate would count bytes by family at `ready` plus everything the scene declares, not what arrived before a racing signal.
- **F-BUDGET-2 superseded:** the four merges it named are innocent; the row is struck in place.
- Follow-ups authored from this review's recommendations (2) and (3): `first-town-audio-deferred`, `sprite-cell-manifests`.
