# Task: BT-00 Demolish — remove a placed building, refund gold scaled by remaining HP

**FIRE-AUTHORED (attended review welcome)** — s94, from `specs/building-tiers/README.md` §BT-00 (RATIFIED spec) + the s94 integration scout. Owner finding at ratification (Robin, 2026-07-06): "right now it is not possible to remove already built things — that might be important."

You are Codex, implementer for Gold Rush (native Mac). READ FIRST: `AGENTS.md`; `CLAUDE.md` §5/§9; `specs/building-tiers/README.md` (Laws + §BT-00 slice). This is an independent, tier-free slice — do NOT build the tier system (BT-01+).

## Goal
Let the player remove a placed building and get a partial gold refund, freeing its footprint so the base layout can be re-planned and damaged-base triage is real.

## Behavior (the spec is law — §BT-00)
1. **Refund = floor( `Balance.demolish.refundPctOfCost` × invested-cost × hp/maxHp )**, where invested-cost is the cost actually paid at placement (`buildCosts[id][index]`, NOT a recomputed curve — repair already reads this). `refundPctOfCost` = **0.5** (add it to Balance, additive). A crumbling wall refunds little; demolishing at full HP refunds half. Floor to an integer gold amount.
2. **The footprint is freed**: after demolish the pool slot must go inactive so `overlapsExisting()` no longer blocks placing a new building on the same spot, and (for palisades) the routing blocker clears. Demolish is a FULL removal, not a wreck-ruin: clear the `[id][index]` stores (hp/hpMax/buildCosts → 0, wrecked → false) AND recycle the pool slot (`isActive(index)` must become false). Verify each pool (sentry_beacon/palisade/sluice/stockpile/turret/assay_office) exposes a deactivate/recycle; if one lacks it, add a minimal one. Reuse the teardown steps `wreck()` already performs (unregister shooter, `syncBuildingTarget(...,false)`, `economy.removeCapSource` for stockpile) so nothing dangles.
3. **Refund credited through Economy only** (Economy is the sole gold writer): dispatch `economy.apply({ type: 'gold_granted', source: 'demolish', amount })`. ADD `'demolish'` to the `gold_granted` source literal union in `src/game/Economy.ts` (alongside `'upgrade_assay' | 'debug'`). Like `upgrade_assay`, this bypasses the bank income cap — correct for a refund.
4. **Player interaction — keep it minimal and consistent with existing patterns.** There is no building-selection path today. Target the placed building **nearest the hero within a small interact radius** (reuse the same nearest-building selection the repair flow uses; if repair has no such helper, add a small `nearestBuildingTo(position, radius)` in BuildSystem and use it for demolish only). Surface a **ledger-voice confirm prompt** (mirror `src/ui/AssayOfficePrompt.ts`: a proximity overlay with a `data-testid`, `role="status"`, `aria-live="polite"`) that names the building and the refund, e.g. *"Tear down the east sluice? The timber comes back, the labor doesn't. (+Ng)"* — confirm via a key + a `data-testid="demolish-confirm"` button, cancel on Escape/move-away. Do NOT build a full modal system; a show/hide overlay like the assay prompt is the whole scope.
5. **Diagnostics/test surface**: add `window.__GR_TEST__.demolish(id, index): boolean` that drives the SAME code path the UI confirm calls (returns false if slot inactive/out of range). The existing `__THREE_GAME_DIAGNOSTICS__.build.hp[]` (with `{id,index,hp,maxHp,wrecked}`) and `economy.gold` are enough for the spec to assert refund + removal.

## Files in scope
- `src/systems/BuildSystem.ts` — the `demolish(id, index)` method (free slot, clear stores, refund), nearest-building selection if needed, diagnostics already exist.
- `src/game/Economy.ts` — add `'demolish'` to the `gold_granted` source union. Do NOT alter existing event handling.
- `src/game/Balance.ts` — additive `demolish: { refundPctOfCost: 0.5, interactRadius: <pick a small value consistent with repair/assay proximity> }`.
- `src/game/Game.ts` — wire the interaction (nearest-building demolish prompt + confirm key), add the `__GR_TEST__.demolish` helper.
- `src/ui/` — a small demolish prompt component modeled on `AssayOfficePrompt.ts` (or extend the existing prompt surface).
- pool file(s) under `src/systems/` — add a deactivate/recycle method ONLY if a pool lacks one.
- NEW `e2e/bt-00-demolish.spec.ts`.

## Firewall — do NOT touch
- Placement/confirm existing behavior (`place`/`confirm`/`finishPlacement`/`placeFree`) — demolish is additive; existing build flow must be byte-for-byte unchanged.
- `CombatSystem` damage resolution, the wave scheduler core, the sim timestep, determinism invariants (spec Integration map "UNTOUCHED").
- Routing/footprint math (Law 1 footprint invariance) — you only make a slot inactive; you do not change how footprints/overlap are computed.
- No new gold writer outside Economy. No secrets. No product-code changes to unrelated systems.

## Acceptance / self-check (gate = evidence)
- `npx tsc --noEmit` clean; `npm run build` green.
- NEW `e2e/bt-00-demolish.spec.ts` GREEN on **desktop-chrome AND mobile-chrome**, asserting:
  1. Place a building (`selectBuildable` + `teleport` + `confirmBuild`), read `economy.gold` and its `build.hp` entry `{id,index,hp,maxHp}` and cost. Demolish it (`__GR_TEST__.demolish(id,index)`). Assert gold increased by **exactly** `floor(0.5 × costPaid × hp/maxHp)` (full HP here).
  2. Building is gone: its `build.hp` entry removed and the `build.buildables` count for that id decremented.
  3. **Footprint freed**: placing a new building at the same coordinates now succeeds (it was previously blocked while occupied) — prove the slot recycled.
  4. **Partial-HP refund**: place, `__GR_TEST__.wreck`-reduce HP (or damage) to a partial value, demolish, assert the refund is the smaller HP-scaled amount.
  5. Zero new console/page errors (assert empty consoleErrors/pageErrors, as sibling specs do).
- Regression: `e2e/m2-01-build-menu.spec.ts` + `e2e/m1-01-claim-jumpers-death.spec.ts` + `e2e/task-025-bandits-dont-swim.spec.ts` still green (existing build/combat flow unchanged).
- Canon: ledger-voice confirm copy per §9.4 naming + brief §9.2 tone (illustrated, never gory — "rubble beat" is a brief visual, not carnage); no firearms language.
- NOTE: fixed dev port 5188 may be held by the lane runner — gate on a scratch port (`npm run dev -- --port 5235 --strictPort` + a temp reuseExistingServer=false config) if 5188 is busy.

End with: READY-FOR-GATES + files touched + per-project e2e results + the exact refund numbers you asserted (costPaid, hp/maxHp, refund) + confirmation the footprint-free reuse test passed.
