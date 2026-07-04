# Review — M2-03 wave-scheduler-v2 (relay lane tasks/002)

**Verdict: PASS with one gate correction (s11, 2026-07-04).** Integrated with the correction folded in; see commit.

## What landed

`src/systems/WaveSystem.ts` (+250/-48): planned-pulse scheduler. Waves are planned ahead
(`planDueWaves` → `PlannedPulse[]`), telegraphed per edge 2s before spawn (0.5s stagger between
edges), spawned when due, with knee-curve budgets past `kneeWave` easing exponentially toward
`budgetCeiling`. Trickle spawns are suppressed inside lull windows. `pulsesPerWave` is clamped so
all pulses fit inside one wave interval. New e2e `e2e/m2-03-wave-scheduler.spec.ts` (4 tests,
in-page rAF trackers only — no protocol polling for timing asserts, per environment rule).

## Gates (evidence, not vibes)

- `npx tsc` clean; `npm run build` clean (225–413ms).
- New suite m2-03: **4/4** (35.6s), re-run after gate corrections: 3/4 + lull test green in
  isolation (see Watch below).
- Canary `m1-03-wave-pressure` (required by task): **5/5 unmodified**.
- Full regression: **65/65** desktop-chrome across all 14 spec files (the one failure found
  belonged to lane 003 — see vp-03 review).
- Screenshots: `reviews/shots-m2-03/` — desktop-telegraph.png (edge banner "Claim Jumpers from
  the south bank!" at wave 0, i.e. telegraph precedes the pulse), desktop-wave-active.png
  (wave 1 active, spawned 14, 31 draw calls), mobile-390-telegraph.png.

## Findings

1. **MAJOR — fixed at gate (orchestrator, +6 lines).** Task item 4 required
   `__GR_TEST__.state` wave diagnostics extended `{pulse, edge, budget}`. WaveSystem's
   `diagnostics` getter computed them, but `Game.ts` dropped them at the plumbing layer, so they
   never reached `__THREE_GAME_DIAGNOSTICS__`. Notably Codex's own e2e avoided reading the very
   fields the task told it to expose. Fixed in `src/game/Game.ts` + `src/vite-env.d.ts`
   (additive), tsc + m2-03 re-verified. **Lesson for future task files: acceptance tests must
   consume the surface the task adds.**
2. **WATCH — lull-assert flake under load.** `second.time - first.time >= 3.95` measures
   rAF-sampled times; one slow frame at timescale 4 on a loaded VM exceeds the 0.05s tolerance
   (observed once under load, green twice otherwise + green in isolation). If it recurs:
   corrective task to expose pulse spawn sim-times in diagnostics (WaveSystem already tracks
   `lastPulseAt`) and assert on the sim-time log instead of sampled frame times.
3. **Minor.** EDGE_COPY rewrite is canon-clean (frontier-tech, prosperity framing, no gore; every
   line names its edge, which the telegraph e2e requires) but reads more formulaic than the old
   pool. Fine for now; fold into a later copy pass.
4. **Good.** Knee formula matches spec and e2e exactly; timer identity preserved by skip-jump
   `advanceNextWaveAt` (tracker ignores increase frames); trickle lull suppression cannot
   infinite-loop (every branch strictly advances `nextTrickleAt`); `?nowaves` early-return
   untouched; wave-banner rotation regression (m1-07) green.

## Scope check

Files touched: WaveSystem.ts, new e2e only — inside the declared lane scope. Balance.ts waves
keys already existed (m1-07 tune prep), so no Balance edit was needed. Hud.ts untouched (existing
banner system reused). No secrets, no canon violations.
