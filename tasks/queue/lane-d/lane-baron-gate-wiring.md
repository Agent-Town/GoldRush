# Task lane-baron-gate-wiring: the Baron's launch gate wired + the beaten-boss medal law (LANE-D, commit prefix "fix:")

You are Codex, implementer for Gold Rush (worktrees/lane-d).
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: reviews/lane-e1-baron-fixture-refresh.md ENTIRE (the rejection that found this; its recommendation is THE PLAN — owner ruled 2026-07-21, verbatim: "yes to both") · src/meta/… registry.ts:401-407 (the science-complete+2-secured gate as designed) · src/town/TownScene.ts unlockStatus (the unwired branch showing the broken "Bank 2 science first" prompt) · the salvage branch save/e1-baron-fixture-9d103193 (the runner's CORRECT fixture retunes — land them, cite it) · e2e/e1-baron.spec.ts + 054/057.

Pre-flight (LANE-SAFETY): standard safe-dupe; npm i; tsc+build green.

## Why (owner ruling #1: the 2-secured launch gate IS intended — wire it. #2: a BEATEN Baron shows medal/stakes regardless of the gate.)
## Scope (the review's recommendation, verbatim plan)
1. Add the `science-complete+2-secured` branch to TownScene unlockStatus (mirror registry.ts:401-407) — the broken prompt dies; the card states the real requirement in-world ("Secure two claims; bank the science — then he'll come out").
2. THE MEDAL LAW: a beaten Baron shows stakes+medal unconditionally (show if beaten-before OR gate met).
3. Land the salvage's fixture retunes (hpScale 240, contactDamage 5, buildingDamage 16, support 12, pursuitRange 18 — each already cites its source commit) + add securedContracts seeding to the two assume-yes tests (:547, 057:349).
4. Gate ALL baron specs + 054 + 057 both projects — this closes the 12-stale-reds saga: full green, no fingerprint-matching ever again.
## Firewall: TownScene unlockStatus + the board card gate copy + the three spec files. NO fight tuning beyond the cited retunes, NO registry changes.
END: READY-FOR-GATES + the green-suite table + a card screenshot pre-launch and post-victory.
