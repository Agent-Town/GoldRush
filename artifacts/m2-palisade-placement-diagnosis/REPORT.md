---
source: codex
project: Gold Rush
date: 2026-09-07
type: solution
---

# M2 palisade placement diagnosis

## Outcome

F-2537-2 is a test-readiness defect. Runtime placement rules are unchanged.

Base: `0da3255113d1819403d1051900c61e6c97c32a50` on `main`. Preflight found no foreign uncommitted `src/`, `e2e/`, or `scripts/` changes. Node was explicitly `/Users/robin/.nvm/versions/node/v26.4.0/bin/node` (`v26.4.0`). Vite used checked-free port 5317 and private cache `/tmp/gold-rush-m2-palisade-vite-cache` through `vite.config.mjs`.

The test sampled `frame` in one Playwright round trip, then dispatched the rejected Enter pair and teleport in another. Under load, the game could advance between those calls, so the returned frame was already stale when the Enter was issued. The subsequent frame wait could therefore return before the rejected tap was consumed and before an input sample observed Enter released. A following accepted Enter could arrive while `Game.lastConfirmIntent` still held the prior pulse and be ignored.

The correction atomically captures `simulation.tick`, dispatches the rejected keydown/keyup pair, and teleports in one page evaluation. It then waits past two fixed input samples: rejection consumption and release observation. This is the actual readiness boundary because `InputController.readIntents()` clears the tap buffer and `Game.update()` clears its confirm latch on the release sample. The final accepted Enter still travels through `InputController` → `Game.confirmAction()` → `BuildSystem.confirm()`.

## Controlled proof

The temporary controlled arrangement issued the second Enter in the immediately following fixed input sample. On both desktop and mobile it recorded:

- selected buildable `palisade`;
- valid edge-touch ghost at `(0, 12)`, first palisade at `(0, 9)`;
- placement/economy/range/overlap predicates all true;
- count remained exactly 1 and gold exactly 40 after the immediate second Enter.

After one released-input sample, the unchanged accepted Enter succeeded and the existing final assertions observed count 2 and gold 30. Raw bounded samples are `controlled-desktop-chrome.json` and `controlled-mobile-chrome.json`. The controlled command exited 0 with 2/2 passes; the deliberate ignored press is asserted inside each passing case.

An initial proposed wait used a separately sampled tick. The first complete adjacent run disproved it: 29/32, with the mobile M2 count still 1 rather than 2 plus the two known M1 failures. This red established that elapsed ticks alone were insufficient when the baseline itself was captured before a second protocol round trip. No cure was claimed from that run.

## Final verification

All commands used `PATH=/Users/robin/.nvm/versions/node/v26.4.0/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin`, `GR_CAPTURE_EXTERNAL_SERVER=1`, `GR_CAPTURE_BASE_URL=http://127.0.0.1:5317`, one worker, and trace off where applicable.

1. Corrected focused repeat:
   `npx playwright test e2e/m2-01-build-menu.spec.ts --grep 'palisade footprint rejects overlap' --project=desktop-chrome --project=mobile-chrome --workers=1 --repeat-each=5 --trace=off --reporter=line --output=artifacts/m2-palisade-placement-diagnosis/corrected-focused-results`
   Exit 0: 10/10 passed in 50.9s.
2. Complete M2 suite:
   `npx playwright test e2e/m2-01-build-menu.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --trace=off --reporter=line --output=artifacts/m2-palisade-placement-diagnosis/m2-results`
   Exit 0: 14/14 passed in 1.8m.
3. Complete adjacent set:
   `npx playwright test e2e/task-025-bandits-dont-swim.spec.ts e2e/m1-01-claim-jumpers-death.spec.ts e2e/m2-01-build-menu.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --trace=off --reporter=line --output=artifacts/m2-palisade-placement-diagnosis/adjacent-results`
   Exit 1: 30/32 passed in 4.0m. All task-025 and M2 cases passed on both projects. The only failures were the already reproduced M1 debug-spawn cases on desktop and mobile: expected `enemiesAlive > 0`, received 0 after 5000ms.
4. `npx tsc --noEmit`
   Exit 0.
5. `npm run build`
   Exit 0. Vite built successfully; asset diet completed with Herald dev-path art 1,158,214 bytes under its 1,500,000-byte ceiling.

## Preserved assertions and limitations

The case still requires rejected overlap, valid edge-touch, exact palisade count 2, exact gold 30, and empty console/page error arrays. No runtime, placement, physics, balance, timer, global timeout, screenshot path, M1, chapter, fixture, or existing error assertion changed.

Remaining uncertainty is limited to the separate M1 debug-spawn defect. It reproduced unchanged on both projects before and after this correction and is outside this task's touch boundary.
