# Review — BT-00 Demolish (main-slot drain, s96)

**Verdict: PASS — merged to main.**
Source: main-slot output (runner done-move `tasks/done/20260707-014701-bt-00-demolish.md`), FIRE-AUTHORED s94 from `specs/building-tiers/README.md` §BT-00.

## What landed
Remove a placed building for a partial gold refund scaled by remaining HP; footprint freed for re-planning.
- `src/systems/BuildSystem.ts` (+117) — `demolish(id, index, timeAlive, heroPos)` (refund + clear stores + recycle pool slot), `nearestBuildingTo()`.
- `src/game/Game.ts` (+65, additive) — demolish prompt wiring, `confirmDemolish`/`cancelDemolishPrompt`, `__GR_TEST__.demolish`. Assay-office confirm branch preserved (explicit `return` before demolish fallthrough — **031 GATE RIDER clear**, no office/SpriteAnimator removal). Demolish candidate only set when NOT in build-mode/menu/bench → mutually exclusive with build cancel.
- `src/game/Economy.ts` (+2/-1) — `'demolish'` added to `gold_granted` source union (bypasses bank cap like `upgrade_assay`, correct for a refund). No other event handling touched.
- `src/game/Balance.ts` (+4, additive) — `demolish: { refundPctOfCost: 0.5, interactRadius: 1.6 }`.
- `src/entities/{Palisade,SentryBeacon,Sluice,Stockpile,Turret}.ts` — additive `deactivate/recycle` methods (footprint free + teardown reuse of `wreck()` steps).
- NEW `src/ui/DemolishPrompt.ts` — ledger-voice proximity overlay (AssayOfficePrompt pattern: `data-testid`, `role=status`, `aria-live=polite`, `demolish-confirm` button).
- `src/styles.css` (+57) — prompt styling. `src/vite-env.d.ts` (+1) — `__GR_TEST__.demolish` type.
- NEW `e2e/bt-00-demolish.spec.ts`.

Firewall respected: no changes to placement/confirm/finishPlacement/placeFree, CombatSystem, wave scheduler, sim timestep, footprint math. No new gold writer outside Economy. No secrets.

## Gates (evidence)
Native, scratch port 5236 (`playwright.s96.config.ts`, to dodge runner 5188).
- `npx tsc --noEmit` — CLEAN.
- `npm run build` — green (429ms; chunk-size warning pre-existing).
- `e2e/bt-00-demolish.spec.ts` — **6/6** (desktop-chrome + mobile-chrome), 10.0s. Exact refund math asserted:
  - full-HP palisade: cost 10, hp 60/60 → refund `floor(0.5×10×1)` = **5**; hp entry removed; buildableCount 1→0; **footprint freed** → re-place palisade at same coords succeeds (count → 1).
  - assay office: cost 80, hp 60/60 → refund **40**; Enter still opens bench (demolish does NOT steal the bench-Enter path); demolish-confirm button removes it.
  - partial-HP: damage building, demolish, refund is the smaller HP-scaled amount.
  - zero console/page errors asserted in-spec, both projects.
- Regression: `m2-01-build-menu` + `m1-01-claim-jumpers-death` + `task-025-bandits-dont-swim` — **30/30** (both projects, 40.1s), incl. stress=120 pool budget + <200 draw-calls-with-palisades. Existing build/combat flow unchanged.

## Canon
Ledger-voice confirm copy, illustrated (rubble, not carnage), no firearms language — brief §9.2/§9.4 clean.

## Findings
None blocking. Merged.
