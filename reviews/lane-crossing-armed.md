# Review — lane-crossing-armed (Twin Banks playtest corrective)

- **Slice:** lane-crossing-armed — crossings keep you armed; wading disarms, readably
- **Branch/tip:** lane/m3 @ `475f8597` "runner(lane-a): lane-crossing-armed.md"
- **Base:** `a63713ae` (s747 lock)
- **Drained by:** s748 fire → main merge `6c3bffcb` (parents `3f17c322` main, `475f8597` lane)

## Verdict
**MERGE — clean 3-way (ort auto-merge, disjoint hunks).** Slice spec green desktop+mobile; regression check on the same-fire pause-goal drain still green post-merge.

## What it does
Answers the owner's Twin Banks note — *"there are now multiple ways to cross the river but shooting is only possible on some of them. A bit strange."* Per the attended, canon-derived, owner-vetoable ruling: **standing on a designated crossing (stones/bridges) = ARMED** (you're not in the water); **open wading in deep water = disarmed, readably.** The disarm state now surfaces in the weapon HUD — a `hud-panel--disarmed` dim + a one-line reason (`Hands full of river.`, or `Hands full of sea.` on deepwater claims) — and a `floatText('Armed again')` fires on the transition back to armed. `Game.updateDisarmReadability()` (renamed from `updateWetPowderHint`) tracks `weaponsWereDisarmed` for the transition edge; `Hud.setWeaponDisarmReason()` toggles the panel/reason. Existing "Wet powder." announce and wet-powder disable/restore behavior preserved.

## Evidence
| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 1.41s |
| `e2e/lane-crossing-armed.spec.ts` (own spec) | **PASS** desktop + mobile — fires on all 4 designated Twin Banks crossings (`arsenal.disarmed=false` + bolt count rises), wading deep → `disarmed=true` + `hud-weapon` has `hud-panel--disarmed` + reason "Hands full of river.", exit → `disarmed=false` + "Armed again" float; zero console |
| `task-025-bandits-dont-swim.spec.ts` (incl. `:145` wet powder disable/restore) | PASS both projects |
| `task-053-weapon-cycling-audit.spec.ts` | PASS both projects |
| `pause-goal-progress.spec.ts` (drain-1 regression) | PASS both projects |
| `064-river-continues.spec.ts` | PASS |
| Battery total | 19 passed / 1 skipped / 0 failed (2.9m) |

## Merge classification (base `a63713ae`)
| File | Class | Resolution |
|------|-------|-----------|
| `e2e/lane-crossing-armed.spec.ts` | NEW | free |
| `src/game/Game.ts` | MAIN-MOVED (pause-goal `c173da7e` this fire) + LANE-TOUCHED | 3-way ort auto — lane hunks (fields/update rename/HUD wire/reset/updateDisarmReadability, all <line 6330) disjoint from pause-goal's `pauseMetaSnapshot` (~6924) |
| `src/ui/Hud.ts` | MAIN-MOVED (pause-goal) + LANE-TOUCHED | 3-way ort auto — lane hunks (lines 64/161/210/304) disjoint from pause-goal's PauseMetaSnapshot type (36) + pause render (533) |
| `src/styles.css` | LANE-TOUCHED only | clean |
| `src/world/Terrain.ts` | LANE-TOUCHED only | clean |

No STATUS comingle; no conflict markers; tsc confirms both merged feature sets coexist.

## Findings
- **F-1 (carried, non-blocking):** the fire-wide pre-existing `m1-01:70` / `m2-01:322` reds (see `reviews/lane-pause-goal-progress.md` F-1) were NOT re-run in this battery (already fingerprinted graft-independent this fire); unaffected by a disarm-readability change.
- No new findings. Firewall held: disarm structure classification + HUD read only; no water-mask or combat changes.
