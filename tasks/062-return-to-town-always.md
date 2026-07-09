# Task 062-return-to-town-always: every run ending returns to town — kill the silent fallback (MAIN slot; commit prefix "fix:")
**OWNER BUG REPORT 2026-07-09 (verbatim): "After the first map, it asked 'Enter new Claim' - is this now the second level? It did not send me back to town as we discussed to choose the next contract."**
ROOT CAUSE LOCATED: `src/game/Game.ts:759-760` — `actionLabel: this.onReturnToMenu ? 'Return to Town' : 'Enter New Claim'`. The ratified story loop (s232, owner order: Return to Town is the PRIMARY button on EVERY run ending) only holds when the caller wires `onReturnToMenu`; at least one live entry route (the first-boot path — the FIRST-TIMER route, worst possible audience) constructs the run without it and silently degrades to 'Enter New Claim'.
Pre-flight: main-slot tracked-clean (artifacts/logs/docs/tasks exempt). READ FIRST: `src/game/Game.ts` ending-screen block (~745-780), every construction/boot site of Game (grep `new Game(`, the boot/menu/profile-first-boot flow, `?contract=` loader), `reviews/story-loop.md` (the ratified loop), `e2e/story-loop.spec.ts`.

## Scope
1. Find EVERY route that constructs/boots a run without wiring `onReturnToMenu` (first-boot is the reported one; audit `?contract=` and any debug/direct routes too) and WIRE them into the town-return flow.
2. **Remove the fallback**: the ternary dies — 'Return to Town' is unconditional on every ending (Claim Secured / overrun / dawn / Baron / victory-palisade). If a route genuinely cannot return to town (headless/debug harness), it must say so EXPLICITLY in code, not by silent label swap.
3. e2e: extend `story-loop.spec` — a FRESH-PROFILE first boot plays to an ending and asserts the primary button reads 'Return to Town' and lands in town with the result beat; repeat for the `?contract=` route. Regression: existing loop tests stay green.

## Firewall
Touch ONLY: the ending-screen wiring + boot/construction sites' callback plumbing + e2e. **NO sim, NO ending logic/rewards, NO town scene changes, NO UI redesign.**

## Self-check
tsc/build · story-loop + new first-boot ending e2e green both projects · m1-01/m2-01/profile/save adjacents green · zero console · screenshot of the first-boot ending with 'Return to Town' primary → `artifacts/062/`.
End: **READY-FOR-GATES** + the list of routes that were unwired + the screenshot.
