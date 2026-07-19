# Review — lane-pause-goal-progress (Twin Banks playtest corrective)

- **Slice:** lane-pause-goal-progress — the pause card answers "how do I win, how far am I"
- **Branch/tip:** lane/perf @ `13ef600f` "fix: show live win progress in pause goals" (runner output, lane-d)
- **Base:** `c08ea15b` (s746 handoff). Main did NOT move the touched src since base → clean path-scoped graft.
- **Drained by:** s748 fire → main `<merge-hash>`

## Verdict
**MERGE — clean.** Slice spec green desktop+mobile; the two red adjacents (m1-01 geometry, m2-01 draw-call) are PROVEN pre-existing/graft-independent (identical fail on clean main without this diff) and load-sensitive under active background-process contention. Non-blocking.

## What it does
Answers the owner's Twin Banks playtest note — *"It is not mentioned how many waves are needed to win this level in the pause overview."* When the run has a secure-wave win condition, the pause card's **Goals** section now renders a live progress line above the static goals: `Secure the claim at wave 20 — wave 13/20`. Implemented as `PauseMetaSnapshot.goalProgress: string | null` — `Game.pauseMetaSnapshot()` computes it from `secureWaveForRun()` / `autoSecureWaveForRun()` (only when the two agree, i.e. an actual auto-secure wave goal) and clamps the shown wave to the target; `Hud` renders it via the existing `renderBriefingLines` helper under a `pause-contract-goal-progress` testid. Conditional/non-wave contracts get `null` → the line is simply omitted (graceful fallback to the existing static goals). Pause-menu surface only.

## Evidence
| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 1.25s |
| `e2e/pause-goal-progress.spec.ts` (own spec) | **PASS** desktop + mobile — asserts `pause-contract-goal-progress` = "Secure the claim at wave 20 — wave 13/20" and static goals still render, zero console errors |
| `contract-briefings.spec.ts` | PASS both projects |
| `music-survives-pause.spec.ts` | PASS both projects |
| `task-025-bandits-dont-swim.spec.ts` | PASS both projects |
| `m1-01-claim-jumpers-death.spec.ts:70` | RED (F-1, pre-existing) |
| `m2-01-build-menu.spec.ts:322` | RED (F-1, pre-existing) |
| Battery total | 46 passed / 4 failed (the 4 = F-1) |

## Merge classification (base `c08ea15b`)
| File | Class | Resolution |
|------|-------|-----------|
| `src/game/Game.ts` | LANE-TOUCHED only | clean apply — `git diff c08ea15b main` empty on this file (main didn't move it) |
| `src/ui/Hud.ts` | LANE-TOUCHED only | clean apply — main didn't move it |
| `e2e/pause-goal-progress.spec.ts` | NEW | free |
| `STATUS.md` | MAIN-MOVED, lane stale | EXCLUDED from graft (three-dot `main...lane/perf` omits it; stale-base noise) |
| `artifacts/pause-goal-progress/*.png` | NEW (lane) | not merged; screenshots copied to `reviews/shots-pause-goal-progress/` instead |

Grafted path-scoped via `git checkout lane/perf -- src/game/Game.ts src/ui/Hud.ts e2e/pause-goal-progress.spec.ts`. No `-A`. No 3-way needed.

## Findings
- **F-1 (non-blocking, pre-existing main-side red):** `m1-01-claim-jumpers-death.spec.ts:70` ("double restart recycles enemies without geometry growth") and `m2-01-build-menu.spec.ts:322` ("stress draw calls stay under 200 with palisades and beacons") fail on **clean main WITHOUT this diff** (baseline re-run proven, both projects). m2-01 is a 120-enemy stress + 8-buildable loop at `timescale=3` whose own comment documents it "flakes under load"; the failure is a 5000ms predicate timeout, not a raw draw-call over-budget. Two orphan `playwright.accounts.config.ts` processes (pid 24303 + lane-b pid 24384, spawned by the ~21h HUNG lane-e8 codex ghost) were actively competing for CPU during the gate. **Most likely contention, possibly a real regression — needs a clean-machine re-run after the e8-ghost orphans are reaped** (ties into carried CARRY-B). NOT caused by this HUD/pause change. Recorded for the next attended/permitted session; no corrective queued because the root cause (contention vs regression) is unconfirmed and a spurious corrective would invent scope.

## Screenshots
- `reviews/shots-pause-goal-progress/desktop-chrome-wave-13.png`
- `reviews/shots-pause-goal-progress/mobile-chrome-wave-13.png`
