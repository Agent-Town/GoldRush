# Review — e8-boss-salvage-claw (THE SALVAGE KING'S CLAW)

- **Slice / branch / tip:** lane-b-e8-boss-salvage-claw · lane/m4 · `5c90657f`
- **Drain merge:** `77e5a80c8cf1929bc865b9ea14046f64e06d43ec` (`--no-ff`, s729 fire)
- **Base:** lane forked at `7438260c` (main~2 at drain time); 3-way merge onto main HEAD `44b2adc5` — disjoint file sets, no conflict.
- **Verdict:** ✅ SHIPPED — clean drain, all gates green, firewall held, boss inert until E8 arms (no plain-boot surface).

## What it does
Adds the E8 boss — the Salvage King's Claw, the last unbuilt boss system in the saga — as a self-contained, INERT system driven by the ratified E8 §BOSS choreography (CROWN / WINCH / ANCHOR-FEET). Acts:
- **Act 0 (dread-is-paperwork):** pre-fight theft ticks — small pickups/props vanish upward between waves, claw-stamp tag markers left (render + economy-legal).
- **Act 1 (crown in orbit):** untargetable crown overhead; telegraphed debris arcs; cuttable grapple-line anchors; corsair rappel spawns.
- **Act 2 (the winch descends):** winch enters weapon range; **BUILDING-LIFT** — a targeted structure rises on a visible line; breaking the drum drops it back DAMAGED-SAVABLE through legal BuildSystem channels; a completed lift removes the structure via legal demolition and fires a salvage-tag ledger event.
- **Act 3 (anchor-feet landed):** feet targetable, crown dark, stationary siege; defeat = warm quit chain (crew descent, the one-bolt ledger beat) + **THE CARCASS persists** as a kept structure across a same-profile re-run (TileStateStore).

The claw never targets the player directly (asserted). Components resolve through CombatSystem legal channels; model wiring carries a placeholder fallback.

## Firewall — HELD
Lane authored exactly its 10 files (927 insertions, 5 deletions vs its base):
- `src/systems/SalvageClawBossSystem.ts` (628, new) · `e2e/e8-boss-salvage-claw.spec.ts` (187, new) · `src/game/Game.ts` (+64 wiring) · `src/systems/BuildSystem.ts` (+21, legal lift/drop hooks) · `src/game/Balance.ts` (+21, `salvageClaw`) · `src/game/TileStateStore.ts` (+10, carcass persist) · `src/vite-env.d.ts` (+1) · 3 screenshots `reviews/shots-claw/{act1-rain,act2-lift,act3-landed}.png`.
- BuildSystem+TileStateStore hooks = 31 lines, within the ≤40-line hook allowance. NO other bosses, NO gravity/dome systems touched.
- Lane touched **no** bookkeeping (STATUS/BACKLOG/goals.json/STORYBOOK/story-arc all showed as two-dot phantoms = MAIN-MOVED only; verified `git diff 7438260c lane/m4 -- <those>` empty). Merge preserved main's newer versions.

## Evidence (gates — all green, s729 re-ran on the merged tree)
| Gate | Result |
|------|--------|
| `tsc --noEmit` | clean |
| `npm run build` | green, 797ms |
| `e2e/e8-boss-salvage-claw.spec.ts` | **4/4** desktop-chrome + mobile-chrome (act gating + lift-drop-savable + demolition/salvage-tag ledger + carcass persist) |
| adjacent `e5-boss-dredge-queen.spec.ts` | **4/4** desktop (boss-run p95 ratio **1.0156**, within 15%) |
| adjacent `task-025-bandits-dont-swim.spec.ts` | **10/10** desktop + mobile |
| boot / zero-console | e8 spec boots both viewports (desktop + 390px mobile) asserting zero console — passing |
| `goal-tracker` merged-leaf test | ✔ merged leaves have done receipt + ancestral merge (validates my full-40 hash) |

## Findings
- **F-e8-1 (non-blocking, KNOWN pre-existing):** `scripts/goal-tracker.test.mjs` "goal tree schema is valid" RED = the standing category-count mismatch (11 actual vs 5 expected). Static category list, unrelated to this leaf; baseline-identical (F-1 on the owner's desk since s726). My leaf flip validated by the sibling merged-leaf test.

## Bookkeeping (this drain)
- goals leaf `e8-boss-claw` → `status:"merged"`, `mergeHash:"77e5a80c8cf1929bc865b9ea14046f64e06d43ec"` (full 40-char, per Goal Registration Law).
- BACKLOG SHIPPED line appended.
- Done master → `tasks/failed/shipped-s729-e8-boss-salvage-claw-SHIPPED-77e5a80c.md`.
- **NO gazette** — boss is INERT until E8 arms; not player-visible in a plain boot (GZ filter law). **NO deploy** — no plain-boot gameplay surface.
