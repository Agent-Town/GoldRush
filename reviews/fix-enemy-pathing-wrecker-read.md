# reviews/fix-enemy-pathing-wrecker-read.md

- **Slice:** fix-enemy-pathing-wrecker-read (gap-flow steering + enclosure gnaw + wrecker readability tell)
- **Branch/tip:** lane/m3 @ `d010af89` (runner(lane-a), 2026-07-13 13:59)
- **Base:** `fe6ef3a0` (clean main-ancestor; merge-base with main confirmed)
- **Gated by:** s461 fire, 2026-07-13T07:53Z (scratch server :5231, `playwright.s461.config.ts`)

## Verdict: **REJECTED — do NOT merge.** Real regression in adjacent suite m2-01 (single-enemy finite-palisade routing). Corrective owed; attempt d010af89 held as salvage-ref on lane/m3.

## What it does (the attempt)
Replaces the memoryless coin-flip wall-slide in `Enemy.ts resolveBlocker` with committed gap-flow wall-following toward the nearest gap in a blocking palisade run; adds an enclosure-gnaw progress watchdog (`Balance.wreck.gnawMult=0.25`, net-displacement <0.4u over 3 sim-s → gnaw the blocking segment at the reduced rate, stop the instant a path opens); and a sprite-side wrecker readability tell (`wreckerMarker`/`markerColor` on the enemy presentation channel). New diagnostics: `wreck.gnawing`, `wreck.stuckWatchdogTrips`. New spec `e2e/enemy-gap-flow.spec.ts`.

## Evidence (real numbers, this fire)
| Check | Result |
|---|---|
| `npx tsc --noEmit` (merged tree) | **CLEAN** |
| `npm run build` | **green** (built 639ms) |
| own spec `enemy-gap-flow.spec.ts` | **14/14 PASS** (7 tests × desktop+mobile, 57.9s) — crowd gap-flow, enclosure gnaw, open-wall routing, U-wall routing, suspend/restore of gnaw state, wrecker-ignores-gap+rust-tell all green |
| `task-025-bandits-dont-swim` | green (both projects) |
| `m1-01-claim-jumpers-death` | green (both projects) |
| `e2-escort-mode` | green (both projects) |
| `m2-01-build-menu` | **2 FAILED** — `:236 single enemy slides around a finite palisade line without passing through` (desktop **and** mobile); 36/38 otherwise green |
| baron battery (054/055/057/e1-baron) | NOT independently gated (drain rejected before this step); runner-reported 10 pre-existing reds reproduced on clean base |

## Merge classification
- Base `fe6ef3a0` is a genuine merge-base ancestor of main; **zero file overlap** between the runner delta (8 src + 1 new spec) and main's 41 commits since base (`git diff --name-only fe6ef3a0 main -- <the 8 src files + spec>` = empty) → the graft applies cleanly with no 3-way conflict. Grafted via `git checkout lane/m3 -- <paths>` (path-restore; branch merge avoided so main's STATUS/tasks/BACKLOG stay untouched). All src reverted to clean main after the gate rejection; nothing committed.

## Findings
- **F-1 (BLOCKING — regression, fingerprint-proven):** `m2-01-build-menu.spec.ts:236` fails with the graft on **both** projects — the tracked assertion is `tracker.reached === true`, and it comes back **false**: a single enemy no longer reaches the hero around a **finite** palisade line within the 20s budget (it does NOT pass through — `crossedThrough` stays false — it gets stuck / mis-routes). **Fingerprint:** reverted the 8 src files to clean main `a2e5e91f` (graft removed), re-ran the same two cases on the same scratch server → **2/2 PASS (17.2s)**. So the failure is introduced by this attempt, NOT pre-existing drift. Mechanism: the new committed gap-flow apparently mishandles a **finite** wall (gap at the line's END, not a mid-run interval) — likely committing to the far side and wall-following away from the hero, or oscillating past the 20s watchdog. This defeats the task's own core intent ("the crowd finds the gaps" — a lone enemy must still reach the hero). Corrective task authored: `tasks/fix-enemy-pathing-wrecker-read-2.md`.
- **F-2 (process, non-blocking):** the task self-check named task-025 + m1-01 + baron battery + escort but **not** m2-01, so the runner never guarded the single-enemy finite-line slide it directly modified. The corrective adds m2-01 (+ m2-01:236 by name) to the required battery.

## Disposition
- No merge. `src/*` reverted to clean main; the grafted `e2e/enemy-gap-flow.spec.ts` and `artifacts/enemy-gap-flow/` are left untracked in main's working tree (harmless; runner re-run overwrites; rm gated for this headless fire).
- Attempt `d010af89` retained on **lane/m3** as the salvage-ref — it is 90% good (crowd gap-flow, gnaw, wrecker tell all verified) and the corrective should build on it, not discard it. **lane-a needs a reset-to-main (branch op, gated for this fire) before the corrective runs**, else the runner stalls on the undrained rejected tip — flagged in the handoff for a permitted/attended session.
