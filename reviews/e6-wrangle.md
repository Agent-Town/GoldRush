# Review — e6-wrangle-verb (THE WRANGLE — win by patience)

- **Slice / branch / tip:** lane-c-e6-wrangle-verb · lane/e2-arsenal · `65fe97c9`
- **Drain merge:** `8bdc8fb70c6feaa32ec330c3fbe92782b7a8bfcd` (`--no-ff`, s729 fire)
- **Base:** lane forked at `09ae22f3` (main~1 at lane-b drain time); 3-way onto main HEAD after the e8 merge — `Balance.ts` + `Game.ts` both moved (e8 `salvageClaw` block + e8 wiring) and both lane-touched → ort auto-merged additively, **no conflicts**.
- **Verdict:** ✅ SHIPPED — clean drain, all gates green, firewall held, verb inert until E6 arms.

## What it does
Implements E6's thesis mechanic — the gentlest weapon, "you can win waves by patience" — as a self-contained, INERT system (machine-class E6 enemies only, era-gated):
- **WIND-DOWN:** machine-class E6 enemies register decay timers on the unified `DecaySystem` scheduler that tick while the enemy is aggro'd-but-unhurt (kited); **taking damage RESETS the wind-down** (the patience-vs-powder tension, asserted); at zero the enemy enters an EXHAUSTED state (harmless, slow, capturable).
- **THE WRANGLE:** a proximity capture verb on exhausted machines removes them from the wave legally and adds them to **THE PEN** — a profile-persistent roster that pays a small steady Economy-authored trickle (single-writer law honored).
- **THE PEN'S LAW (ruled canon):** penned machines never re-feral — the roster only grows; contents exposed via diagnostics for the future pen UI (render surface is a later slice).

The therapeutic half is ruled canon ("the town that will one day refuse to destroy the Old Digger learns the habit here").

## Firewall — HELD (with one noted deviation)
Lane authored exactly its 9 files (551 insertions, 7 deletions vs base `09ae22f3`), no bookkeeping (the two-dot `BACKLOG -1` was a MAIN-MOVED phantom; verified lane's own diff touched no STATUS/BACKLOG/goals/STORYBOOK):
- `src/systems/WrangleSystem.ts` (277, new) · `e2e/e6-wrangle.spec.ts` (169, new) · `src/systems/CombatSystem.ts` (+24, enemy-state / freed grammar) · `src/game/Game.ts` (+29 wiring) · `src/game/RunSuspend.ts` (+44, pen persistence) · `src/game/Balance.ts` (+7, `wrangle`) · `src/game/Economy.ts` (+2, the trickle — Economy-legal single-writer) · `src/vite-env.d.ts` (+6) · screenshot `reviews/shots-wrangle/exhausted-capture.png`.
- NO Homemaker (its own lane-a task), NO pen UI, NO era-arming changes.

## Findings
- **F-e6-1 (non-blocking):** the master specced pen persistence "via TileStateStore"; the implementation persists the pen roster through `RunSuspend.ts` (+44) instead. The persistence assertion ("pen roster grows + persists same-profile") passes green, so the behavior is correct, but the 44-line RunSuspend hook is above the ≤30-line hook budget and uses a different persistence surface than specified. Behaviorally sound; flag for attended awareness (a future pen-UI slice should confirm the roster reads from the same store as other tile-state).
- **F-e6-2 (non-blocking, KNOWN pre-existing):** `goal-tracker` "schema is valid" RED = the standing category-count mismatch (11 vs 5), unrelated to this leaf.

## Evidence (gates — all green on the merged tree)
| Gate | Result |
|------|--------|
| `tsc --noEmit` | clean |
| `npm run build` | green, 709ms |
| `e2e/e6-wrangle.spec.ts` | **2/2** desktop + mobile (kite→exhaust→capture→persist→Economy-pay; damage resets wind-down) |
| adjacent `e6-decay-framework.spec.ts` | **4/4** desktop + mobile (deterministic decay + **plain boot keeps scheduler inert**) |
| adjacent `task-025-bandits-dont-swim.spec.ts` | **10/10** desktop + mobile |
| cross-regression `e8-boss-salvage-claw.spec.ts` | **2/2** desktop — e8 still green after the shared Game.ts/Balance.ts additions |
| zero console | asserted in specs, both viewports |

## Bookkeeping (this drain)
- goals leaf `e6-wrangle` → `status:"merged"`, `mergeHash:"8bdc8fb70c6feaa32ec330c3fbe92782b7a8bfcd"` (full 40-char).
- BACKLOG SHIPPED line appended.
- Done master → `tasks/failed/shipped-s729-e6-wrangle-verb-SHIPPED-8bdc8fb7.md`.
- **NO gazette** — verb inert until E6 arms; no plain-boot surface (GZ filter law). **NO deploy** — no plain-boot gameplay surface.
