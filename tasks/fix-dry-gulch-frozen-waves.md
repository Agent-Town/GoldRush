# fix-dry-gulch-frozen-waves — investigate + fix the wave-16 soft-lock
ROLE: sleuth-style investigator+fixer. WORKDIR: repo root (main slot) or lane-c.
CODEX: model=gpt-5.6-sol effort=medium

## WHY (owner playtest, 2026-07-11 ~22:30, verbatim): "the waves stopped moving at some point and just stayed stuck this is Dry Gulch"
Evidence (owner screenshot, deployed build ~94babcea): `?contract=e1-dry-gulch`, HUD alive (HP 84/100, TIME 08:22, WAVE 16), FIVE bandit rushers frozen mid-field in a horizontal line, hero mobile. Enemies alive + motionless → wave can never clear → run soft-locked (no win/lose exit; the new pause Back-to-Town button is the escape hatch but the bug remains).

## READ-FIRST
- src/entities/Enemy.ts (think/targeting; the scripted-step arrival fix landed recently — check for sibling wedges in NON-scripted paths)
- src/systems/WaveSystem.ts (wave-completion predicate; what "wave cleared" requires)
- assets/contracts/epoch-1-frontier/contracts.json → e1-dry-gulch tileParams (spring pond SW, wash channels, visual heightfield)
- reviews/e2-enemies.md (component-boss era targeting patterns, for grammar)

## HYPOTHESES (verify in this order; instrument, don't guess)
1. TARGET STARVATION: late-wave enemies whose target class is gone (stolen stockpile? emptied node? destroyed building mid-path) idle with zero velocity and NO fallback target → line of statues. Check the idle/no-target branch: does it re-scan or spin forever?
2. Scripted/column recurrence: a Dry Gulch wave pattern using scriptedRoute wedging at a waypoint epsilon (the fixed class, different call site).
3. Wave predicate: wave counts an enemy "alive" that some other system considers inert (leaked from pools?).

## SCOPE
1. Reproduce headless: seeded e1-dry-gulch run, timescale high, autoplay defenses via __GR_TEST__ (?debug), run to wave 16+; when frozen, dump per-enemy state (target, velocity, route index, think branch) via diagnostics.
2. Root-cause + minimal fix (fallback targeting or wedge guard — match the arrival-before-guard fix's style).
3. Regression e2e: seeded long-run reaches wave 18 with zero enemies motionless >5s while alive (assert via diagnostics sampling), both projects.

## TOUCH-ONLY: src/entities/Enemy.ts, src/systems/WaveSystem.ts, new e2e file, artifacts/.
## NO: Balance.ts numbers, contracts.json, terrain, MP files, story/UI.
## SELF-CHECK: tsc; build; new spec green desktop+mobile; adjacent e1-dry-gulch suite + task-025 + m1-01 + m2-01 unmodified-green; zero console/page errors; screenshot of wave 17+ flowing.
END: READY-FOR-GATES + report root cause branch + the frozen-state dump that proved it.
