---
verdict: MERGE-INSTRUMENT-FIDELITY-HELD
slice: assay-replay-door
base: 4cf734e21dbe42eeaa6541d137327092a16121c8
tip: b5af1bf1db913ed716cef8ca6007562cb764469b
merge: 45a6ce92726e1525eb1f854aa2614e7d4a94cb8c
date: 2026-08-15
---

# Assay replay door — drain review

## Verdict

MERGE the debug-only browser replay instrument. Keep **F-ASSAY-1 open**: the pinned live reel replays deterministically, but it does not reproduce the recorded standing, so the worker loop remains blocked on the attended fidelity successor.

The instrument accepts the reel JSON, validates it through the existing tape path, boots the contract's native replay route, advances all 9,000 fixed ticks, and prints one JSON result. No sim ordering, tape schema, existing e2e assertion, or player-facing path changed.

## Replay evidence

- Recorded reel: `fnv1a32:f6390382`, secured, wave 10, 280 gold, 300 seconds.
- Runner replay 1: `fnv1a32:29454bf2`, unsecured, wave 4, 30 gold, 141.3 seconds; 79.780 seconds wall time.
- Runner replay 2: byte-identical hash and outcome; 78.142 seconds wall time.
- Fire rerun after review fixes: same hash/outcome in 13.478 seconds, 9,000 ticks.
- Later-epoch control: synthetic `e2-hill-mine` tape booted `epoch-2-steamworks`, not the E1 default.

## Gate evidence

| Gate | Result |
| --- | --- |
| Policy | `drain-block-check --strict`: CLEAR / planned |
| TypeScript | `npx tsc --noEmit`: pass |
| Production build | pass; asset-diet ceilings green |
| Pinned replay test | 1/1 pass; wired in `test:node-guards` |
| Adjacent Playwright | 16/16 desktop + 16/16 mobile, serial `--workers=1` |
| Plain boots | desktop 1280x800 + mobile 390x844; zero console/page errors |
| Full Node guards | 458 pass / 2 fail / 5 explicit fire-shell skips across 465 tests |

Both Node failures are the same pre-existing site defect: `site/news.html` links to `index.html#teaser`, while the attended replacement landing page has no `teaser` id. It reproduced directly on untouched main; the candidate changes none of `site/news.html`, `site/index.html`, or `scripts/site-contract.test.mjs`. The second red is the fixture-owner wrapper correctly propagating that same child failure. This baseline exception is already recorded in `reviews/prep-bench-seeds-flagships.md` and later drains.

Boot shots: `reviews/shots-assay-replay-door/boot-desktop.png` and `reviews/shots-assay-replay-door/boot-mobile.png`.

## Independent-review findings closed before merge

- **F-1794-1 (P1, closed):** the assay URL omitted the existing `replay` route marker, so later contracts booted under the E1 epoch. The instrument now passes `replay: tape.id`; the E2 control resolves `epoch-2-steamworks`.
- **F-1794-2 (P1, closed):** the instrument reconstructed `secured` from HP and wave, misclassifying post-secure deaths and objective-gated contracts. It now reads the native `diagnostics.run.secured` result.
- **F-1794-3 (P1, closed):** the standalone launch selected Playwright's unsupported headless shell on the documented Linux path. It now reuses the repository's `channel: 'chromium'` launch contract.

F-ASSAY-1 is not massaged or re-pinned away. The deterministic mismatch remains explicit in the fixture test and is the next slice's subject. This is a debug-only factory instrument, so no Gazette item or gameplay deployment is owed.
