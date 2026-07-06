# Task: BT-01 Tier system core — upgrade the baseline trio (palisade / sluice / turret)

**FIRE-AUTHORED (attended review welcome)** — s99, from `specs/building-tiers/README.md` §BT-01 (RATIFIED — "SPEC IS LAW") + the s99 integration read of the demolish (BT-00) interaction now on main. Sequenced deliberately AFTER combat-readability landed (s99 `3947d6a`) because both touch BuildSystem building visuals + palisade wear — your base (reset to main) already carries the readability work; build ON it, don't re-derive it.

You are Codex, implementer for Gold Rush (native Mac). READ FIRST: `AGENTS.md`; `CLAUDE.md` §5/§9; `specs/building-tiers/README.md` (Laws 1–6 + §BT-01 slice + Integration map). This is the **tier CORE** slice only — do NOT build BT-02 production semantics, BT-03 art, or BT-04 automation.

## Pre-flight (drain-gated per LANE-SAFETY)
`lane/polish` currently sits at `a05805b` (combat-readability), which was DRAINED to main at s99 `3947d6a` — its content is fully merged (verified byte-identical), so this 1-ahead commit is a SAFE content-dupe, not undrained work. Force-reset the lane onto clean main: `git checkout -B lane/polish main && git clean -fd && npm install --no-audit --no-fund`; `npm run build` green first. STOP-and-report ONLY if you find a dirty worktree with UNCOMMITTED edits you did not make, or a lane commit whose content is NOT already on main — neither is the case as of s99.

## Goal
Give built buildings a **tier**: the player upgrades an existing palisade / sluice / turret in place, pays gold through Economy, and the building gets meaningfully stronger AND visibly changes — **same footprint, always** (Law 1). This is the spine of the homestead loop; production/automation ride on top in BT-02/BT-04.

## Behavior (the spec is law — §BT-01)
1. **Tier state.** Add a `tier` store to BuildSystem parallel to the existing per-instance stores (`hp[id][index]`, `buildCosts[id][index]`, `wrecked[id][index]`). New buildings start at tier 1. Only the ratified trio is upgradeable this slice: **palisade, sluice, turret**. Other buildables (sentry_beacon, stockpile, assay_office) stay tier-1 non-upgradeable (stockpile tiers come in BT-02).
2. **Tier tables — DATA in Balance, additive (Law 3).** Add `Balance.tiers` with, per upgradeable id, an array of tier rungs. Each rung carries: `cost` (gold to REACH this tier) and the stat deltas for that building's archetype —
   - **palisade**: `maxHpMult` (sturdier wall; a tier-2 wall has more HP so it cracks/wears LATER — interlock with combat-readability: the wear threshold is `hp/maxHp < 0.5` already, so higher maxHp naturally delays wear; do not change the wear formula, just raise maxHp).
   - **sluice**: `panRateMult` (raise the auto-pan output knob the sluice already reads — wire the multiplier at the READ site so BT-02 can deepen it; do NOT rebuild pan economics here).
   - **turret**: `damageMult` + `fireRateMult` (raise `Balance.turret.damage`/`fireRate` effective values for that instance).
   Frontier caps the ladder at **tier 3** (Law 3: bounded within an epoch so balance holds). Costs grow steeply (≥^1.6 curve, Law 4 valve). Keep the numbers conservative and legible; this is a placeholder balance pass, not a tuning slice.
3. **Effective-stat read.** Where the trio's stats are consumed (turret shooter registration `damage`/`cooldown`/`getDamage`; palisade `maxHpForInstance`; sluice pan rate), read the **tier-adjusted** value, not the raw `Balance.*`. Keep it centralized: one `effectiveStat(id, index, base)` helper per stat, so the tier math lives in one place. Upgrading a turret must raise its live damage (assert it). Upgrading a palisade raises its maxHp — decide the HP policy and state it in your report: **heal-to-new-max on upgrade** (cleanest: `hp[id][index] = maxHpForInstance(...)` after tier bump) so an upgrade also repairs — that is the intended "invest to reinforce" feel; if you choose to preserve the damage ratio instead, justify it.
4. **Upgrade interaction — mirror the demolish pattern already on main.** There is a working nearest-building proximity interaction: `BuildSystem.nearestBuildingTo(pos, radius)`, `BuildSystem.demolish(...)`, and a ledger-voice proximity prompt (see `src/ui/` demolish prompt + how `Game.ts` wires the demolish confirm key and `__GR_TEST__.demolish`). Build the **upgrade** interaction the same way: target the nearest UPGRADEABLE building within the interact radius, surface a ledger-voice prompt (`data-testid`, `role="status"`, `aria-live="polite"`) naming the building, the next tier, the cost, and the gain (e.g. *"Reinforce the east palisade to Tier 2? 90 gold buys thicker timber."*), confirm via a key + `data-testid="upgrade-confirm"`, cancel on Escape/move-away. If tier is already maxed or gold is insufficient, the prompt says so and confirm is a no-op. Do NOT build a modal system — a show/hide overlay exactly like demolish/assay is the whole scope.
5. **Cost paid through Economy ONLY (Economy is the sole gold writer, spec + Law).** Route the upgrade spend through the SAME economy spend path placement uses (find how `confirmBuild`/placement debits gold and reuse it). If a `source` literal union needs a new `'upgrade'` member, add it minimally (mirror how BT-00 added `'demolish'`). Insufficient gold ⇒ no spend, no tier change.
6. **Science-gate SEAM (Law 3) — wired but default-OPEN this slice.** Tier availability is meant to unlock via science (SCI-02 `families.json` carries tier gates). CHECK `families.json` (and the science/epoch contract) for existing tier-gate data. If real gate data exists, read it. If it does NOT yet exist, add a single `tierUnlockAllowed(id, tier): boolean` gate function that returns `true` (open) and is the ONE call site the upgrade path consults — leave a `// TODO(SCI-03): read tier gates from families.json` marker. Do NOT invent a science schema. This keeps BT-01 shippable now and lets SCI-03 flip the gate on without reworking tiers. State in your report which branch you took.
7. **Placeholder tier visuals — procedural, Law 2 + Law 6, within the draw-call budget.** Each upgraded building must visibly change at the same footprint: reuse the EXISTING instanced building visuals — tint/scale/extra-instance add-ons (e.g. taller frame, iron-band color shift, faint teal agent-tech trim as tier rises per ADR-001 brass→steam→agent-glow). NO new per-building meshes, NO geometry that grows unbounded — the m2-01 ≤200 draw-call budget MUST hold at stress. Never gory. Placeholder-first: procedural now, art contract slots are BT-03.
8. **Diagnostics/test surface.** Add `window.__GR_TEST__.upgradeBuilding(id, index): boolean` driving the SAME path the UI confirm calls (false if maxed / insufficient gold / gated / out of range). Extend `build` diagnostics with a per-instance `tier` (add `tier` to the `hp[]` detail entries or a parallel `tiers` array) and a `tierUpgrades` counter, plus the effective damage for turrets if not already derivable, so the spec can assert stat deltas. Update `src/vite-env.d.ts` additively.

## Files in scope
- `src/systems/BuildSystem.ts` — tier store, `effectiveStat`/`maxHpForInstance` tier-adjust, `upgradeBuilding(id, index)`, `nearestUpgradeableTo` (reuse/extend `nearestBuildingTo`), diagnostics, shooter registration reads tier damage.
- `src/game/Balance.ts` — additive `Balance.tiers` tables (palisade/sluice/turret rungs) + interact radius reuse.
- `src/game/Economy.ts` — add `'upgrade'` source ONLY if the spend path needs it; do NOT alter existing event handling.
- `src/game/Game.ts` — wire the upgrade prompt + confirm key + `__GR_TEST__.upgradeBuilding`.
- `src/ui/` — a small upgrade prompt modeled on the demolish/assay prompt (or extend the existing prompt surface).
- Sluice/Turret/Palisade entity files under `src/entities/` — ONLY the tier-visual tint/scale hook (reuse instanceColor/scale paths already present; combat-readability added palisade wear colors — layer tier tint on that path, don't fight it).
- `src/vite-env.d.ts` — additive diagnostics fields.
- NEW `e2e/bt-01-tiers.spec.ts`.

## Firewall — do NOT touch
- **Footprint / routing / overlap math (Law 1 — footprint invariance).** An upgrade changes stats and looks, NEVER the occupied space or blockers. Do not touch `overlapsExisting`, footprint sizing, or palisade blocker geometry.
- `CombatSystem` damage resolution order, the wave scheduler core, the sim timestep, determinism invariants (Integration map "UNTOUCHED").
- Placement/confirm existing behavior (`place`/`confirm`/`confirmBuild`/`finishPlacement`) — upgrade is additive; build/demolish flow byte-for-byte unchanged.
- combat-readability's damage-math / hit-flash / bar formulas — you build ON them (raise maxHp, layer tint), you do not rewrite them.
- No new gold writer outside Economy. No secrets. No unrelated system edits. Zero per-frame allocations added to the visual sync hot path.

## Acceptance / self-check (gate = evidence)
- `npx tsc --noEmit` clean; `npm run build` green.
- NEW `e2e/bt-01-tiers.spec.ts` GREEN on **desktop-chrome AND mobile-chrome**, asserting:
  1. **Turret tier raises damage**: place a turret, read its effective damage + `economy.gold`; `__GR_TEST__.upgradeBuilding('turret', i)`; assert gold debited by EXACTLY the tier-2 cost, `tier` now 2, and effective turret damage strictly increased.
  2. **Palisade tier raises maxHp (and heals per your stated policy)**: place, upgrade, assert `maxHp` rose and `hp` matches your policy; confirm the wear threshold still fires only under 50% of the NEW max.
  3. **Sluice tier raises the pan-rate multiplier** (assert the diagnostic/knob the sluice reads reflects the tier, without needing a full BT-02 economy run).
  4. **Footprint INVARIANT (Law 1)**: the overlap/placement behavior around the upgraded building is identical pre/post upgrade — a neighbor placement that was blocked stays blocked, an edge-touch that was allowed stays allowed. Prove space did not change.
  5. **Tier cap enforced**: upgrading past tier 3 (Frontier ceiling) is a no-op (gold unchanged, tier stays 3).
  6. **Insufficient gold**: with gold below cost, upgrade is a no-op (no debit, no tier change).
  7. Zero new console/page errors (assert empty consoleErrors/pageErrors as sibling specs do).
- **Draw-call budget**: `e2e/m2-01-build-menu.spec.ts` "draw calls stay under 200" stress STILL green with tiered visuals present — tier visuals must not add draw calls beyond the instanced budget. Fail loudly if it regresses.
- Regression (unchanged flows): `e2e/m2-01-build-menu.spec.ts` + `e2e/m1-01-claim-jumpers-death.spec.ts` + `e2e/task-025-bandits-dont-swim.spec.ts` + `e2e/combat-readability.spec.ts` all green both projects.
- Canon: ledger-voice upgrade copy per §9.4 naming + brief §9.2 tone (illustrated, warm, never gory — reinforcement/prosperity framing, no firearms language); procedural tier look evolves brass→agent-glow per ADR-001.
- NOTE: fixed dev port 5188 may be held by the lane runner — gate on a scratch port (`npm run dev -- --port 5236 --strictPort` + a temp reuseExistingServer=false config) if 5188 is busy.

End with: READY-FOR-GATES + files touched + per-project e2e results + the exact tier numbers you asserted (costs paid, damage before/after, maxHp before/after) + which science-gate branch you took (real gate data vs default-open seam) + the palisade HP-on-upgrade policy you chose + confirmation the footprint-invariance test and the ≤200 draw-call stress both passed.
