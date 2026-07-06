# Task 034: fix pre-existing mobile-input failures in vp-02 / vp-02b specs (test-only)

You are Codex, implementer for Gold Rush (native Mac). READ FIRST: AGENTS.md; CLAUDE.md §5/§9.

## Problem (discovered during s56's 031 gate — evidence in reviews/031.md F-2)
`e2e/vp-02-sprite-animation.spec.ts` and `e2e/vp-02b-rotation-resolver.spec.ts` drive the hero
ONLY via the mouse-simulated touch stick (`page.mouse` on `#touch-stick`, helper `startStick`).
On the touch-emulated `mobile-chrome` (Pixel 5) project this does NOT move the hero — the stick
uses `pointerdown/pointermove` and Playwright's `page.mouse` doesn't drive it there — so any test
that needs the hero WALKING times out on mobile (`waitForFunction`/`waitForSprite` never resolves).
Verified: post-`startStick` mobile snapshot = `clip:"idle", frameCount:1`. This is PRE-EXISTING
(unrelated to task 031; those specs are unmodified by 031) and PRODUCT code is correct — real mobile
touch works for users; only the test's input simulation is wrong on the emulated device.

## Fix (mirror the fix already applied to e2e/task-031-anim-roundness.spec.ts, F-1)
`readMovement` in `src/core/InputController.ts` sums `keyVector` (WASD/arrows) + `pointer`, and
keyboard is viewport-independent. So make the stick helpers ALSO hold/release the matching WASD keys:
- In each spec's `startStick(page, x, y)`: after the mouse ops, hold keys by sign —
  `y>0.3 → KeyS`, `y<-0.3 → KeyW`, `x>0.3 → KeyD`, `x<-0.3 → KeyA`.
- In each spec's `releaseStick(page)`: after `page.mouse.up()`, release all of `['KeyW','KeyA','KeyS','KeyD']`.
- Where a spec uses `moveStick` to RE-AIM mid-hold (changing direction without re-calling startStick),
  release the old keys and press the new ones so the keyboard direction tracks the stick.
See the exact pattern already merged in `e2e/task-031-anim-roundness.spec.ts` (`pressMoveKeys`/`releaseMoveKeys`).

## Firewall
Touch ONLY: `e2e/vp-02-sprite-animation.spec.ts`, `e2e/vp-02b-rotation-resolver.spec.ts`.
NO product-code changes. NO changes to other specs.

## Acceptance / self-check
- `npx tsc --noEmit` clean.
- `npx playwright test e2e/vp-02-sprite-animation.spec.ts e2e/vp-02b-rotation-resolver.spec.ts`
  GREEN on BOTH `desktop-chrome` AND `mobile-chrome`. Run mobile isolated (`--project=mobile-chrome
  --workers=1`) to confirm real green, not contention.
- Desktop behavior unchanged (still green).
- NOTE: the fixed 5188 dev port may be held by the lane runner — if so, gate on a scratch port
  (`npx vite --port 5199 --strictPort` + a temp reuseExistingServer config), as s56 did.
End: READY-FOR-GATES + files + per-project results.
