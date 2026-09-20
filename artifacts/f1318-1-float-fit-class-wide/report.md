# F-1318-1 — float-fit class-wide guard

## Result

READY-FOR-GATES. The test now drives the real `placeFree → upgradeBuilding → Vfx` path for all four upgradeable buildables and both reachable upgrade tiers. The renderer keeps the 32 px floor and 768 px cap, but truncates an over-budget floor-sized line and appends `…` instead of drawing a centred overflow.

No player copy, canvas height, sprite aspect, pool size, or width cap changed. Temporary `BuildSystem.ts` copy mutations were reverted byte-exact; `git diff -- src/systems/BuildSystem.ts` is empty.

## Scope 1 — shipped-loop census before edits

Measured through the live producer and shipped renderer on Chromium. These reproduce the s1318 drain exactly.

| Sentence | Chars | Font px | Rendered px | Budget px | Fits |
| --- | ---: | ---: | ---: | ---: | --- |
| `Sluice II - the works run richer` | 32 | 47 | 742.41 | 748 | yes |
| `Sluice III - the works run richer` | 33 | 46 | 747.12 | 748 | yes |
| `Palisade II - timber holds longer` | 33 | 45 | 745.00 | 748 | yes |
| `Palisade III - timber holds longer` | 34 | 43 | 731.06 | 748 | yes |
| `Stockpile Yard II - the yard holds more gold` | 44 | 33 | 738.31 | 748 | yes |
| `Stockpile Yard III - the yard holds more gold` | 45 | 32 | 730.20 | 748 | yes |
| `Turret II - brass cadence quickens` | 34 | 42 | 733.65 | 748 | yes |
| `Turret III - brass cadence quickens` | 35 | 41 | 734.46 | 748 | yes |

All eight fit, so the scope-1 STOP condition did not fire. Stockpile III has exhausted the font-shrink mechanism at 32 px. Sluice III's selected-font margin is 0.88 px, matching the drain.

## Class-wide guard and manufactured RED

`e2e/vfx-float-legibility.spec.ts` contains no copied upgrade sentences. It derives the buildable population from `Balance.tiers` (with an exhaustive placement record), places each buildable, buys tier II and tier III through `upgradeBuilding`, collects the eight real `lastFloatText` geometry records, and asserts:

- `renderedWidthPx <= canvasWidthPx - 20`
- `fontPx >= 32`
- exactly eight reachable upgrade records

The existing pool-reuse proof remains: after `warmVfx()`, the reused short slot returns to `canvasWidthPx = 192` and `fontPx = 64`.

Manufactured defect: temporarily changed the stockpile producer to append ` and more ore`. Before the fallback, both projects RED:

```text
Error: expect(received).toBeLessThanOrEqual(expected)
Expected: <= 748
Received:    945.734375
at e2e/vfx-float-legibility.spec.ts:42:37
```

Failures:

- desktop-chrome — RED
- mobile-chrome — RED

The producer was restored byte-exact. `git diff -- src/` was empty at that point. The unchanged-copy guard then returned **2 passed**.

## Ellipsis fallback proof

With the fallback installed, the same temporary ` and more ore` mutation stayed GREEN on both projects. The overlong tier-III record was:

| Intended text | Font px | Rendered px | Budget px | Canvas px |
| --- | ---: | ---: | ---: | ---: |
| `Stockpile Yard III - the yard holds more gold and more ore` | 32 | 739.125 | 748 | 768 |

The rendered line ends in a visible ellipsis rather than showing a clipped middle fragment. Evidence: [`ellipsis-desktop-chrome.png`](ellipsis-desktop-chrome.png). The temporary mutation was again restored byte-exact; `git diff -- src/systems/BuildSystem.ts` is empty.

Final ordinary-copy screenshots:

- [`desktop-chrome.png`](desktop-chrome.png)
- [`mobile-chrome.png`](mobile-chrome.png)

## Derived adjacent coverage

Command:

```sh
grep -rln "lastFloatText" e2e src
```

Derived specs:

- `e2e/vfx-visualy.spec.ts`
- `e2e/lane-crossing-armed.spec.ts`
- `e2e/bt-01-tiers.spec.ts`
- `e2e/vfx-float-legibility.spec.ts`

The own spec passed 2/2. The three adjacent specs ran 28 cases and produced exactly four failures, all the pre-declared `bt-01-tiers` fingerprints:

- `Enter tears down after clicking upgrade instead of re-clicking the focused upgrade button` — desktop + mobile
- `insufficient gold leaves tier and gold unchanged` — desktop + mobile

`test-results/.last-run.json` listed exactly four failed test IDs. No other adjacent case failed.

## Node-guard denominator

The whole 37-file command from `package.json` was run at both slice ends, including `scripts/whole-suite-collection.test.mjs`:

| Tree | Result |
| --- | --- |
| lane base `4cf7da4b` in a detached control worktree | 203 passed, 0 failed |
| final lane working tree | 203 passed, 0 failed |
| current `main` detached control (`5772127e`) | 204 passed, 0 failed |

This is not the known omitted-file 203 signature. The lane branch predates main's added test `gr-sim deterministically runs the Claim objective` in `scripts/gr-sim.test.mjs`; `git diff HEAD..main -- scripts/gr-sim.test.mjs` accounts for the exact +1. The slice changes no node-guard file, so its lane-base delta is zero and the merged-tree denominator is 204.

## Final gates

```text
npx tsc --noEmit
clean

npm run build
green; asset-diet green

LD_LIBRARY_PATH=~/locallibs/usr/lib/aarch64-linux-gnu npx playwright test e2e/vfx-float-legibility.spec.ts --workers=1
2 passed; desktop + mobile; watchErrors suppressed 0/0; no console/page errors

npm run test:node-guards
203/203 on this older lane base; 204/204 on current main control; 0 failures
```

`git diff --check` is clean.

## Cap question (report only)

The unchanged 4× cap leaves **17.80 px** of full-copy width at the worst floor-bound live sentence (`748 - 730.20`), only **2.38% of the budget** and roughly one average glyph—not a word. The fallback converts any excess into an explicit ellipsis, so it removes silent-overflow risk but does not create full-copy headroom. Raising `FLOAT_TEXT_MAX_WIDTH` remains the owner-facing F-1318-2 look-and-feel decision and was not attempted.
