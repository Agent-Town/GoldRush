# Review — SCI-02 epoch-gated families + mastery conversions (lane-a drain, s87 fire)

**Verdict: PASS — grafted to main.** (FIRE-AUTHORED task; attended review welcome.)

## Graft method
SCI-02 ran on `lane/m3` (worktree lane-a), all output in one runner commit `962b192`. Footprint isolated as `git diff b20e120..lane/m3` (b20e120 = the reset base = merge-base with main), immune to main drift. Of SCI-02's touched files, **only `src/game/Balance.ts` was also moved by main** (041's `turretLobMinAirTime`) — all others main left byte-identical to base, so they were copied directly from lane/m3 onto clean main (`eadaccf`). Balance.ts was a trivial 3-way: SCI-02's addition is a separate additive `eraCaps` block in the `research`/`offers` region, disjoint from 041's `projectile.turretLobMinAirTime` — kept main's version and inserted `eraCaps`.

## What landed
- **`assets/contracts/epoch-1-frontier/families.json`** (NEW): epoch-gated card families + mastery-conversion rules as data (per THE EPOCH-CONTRACT LAW; loaded directly until the SCI-04 registry).
- **`src/meta/ContractFamilies.ts`** (NEW loader) + `ResearchTree.ts` node-text flips (Arsenal + one Prospecting node "prepare to…" → live descriptions).
- **`Upgrades.ts`/`Progression.ts`** (additive): epoch-gated families assemble into the offer pool when their node is taken; mastery-conversion offer step (defaults OFF for a fresh profile, no research callback → SCI-01 behavior byte-identical).
- **`StatSheet.ts`** (additive channels): synergy cards recombine existing power within era caps — combinatorial, not inflationary. `Balance.eraCaps` bounds blast-radius mult / seam-capacity / stockpile-cap.
- **`Game.ts`** (see finding): `applyUpgradeCapEffects` wires the prospecting→stockpile synergy through `economy.addCapSource/removeCapSource` (existing API), and `applyResearchEffects` now sums prospecting stacks across the family (combinatorial mastery).

## Findings
- **F-SCI-02-1 (advisory, non-blocking):** `src/game/Game.ts` was modified though not in SCI-02's declared firewall touch-list. The change is small, additive, and necessary to apply the synergy-card cap effects; it calls the **existing** `Economy.addCapSource/removeCapSource` public API and does **not** modify `Economy.ts` (the sole-gold-writer invariant is intact — stockpile *capacity*, not gold spend). Accepted for this drain; flagged for Robin's attended eye since the task was fire-authored.

## Evidence
- `npx tsc --noEmit` — clean. `npm run build` — green.
- **`e2e/sci-02-families-mastery.spec.ts`** — pass (both projects): gated Arsenal family absent before node / present after; maxing a family surfaces a named mastery synergy card (absent before maxing); synergy respects era stat caps; fresh-profile SCI-01 persistence unchanged.
- Regression: `sci-01-research-loop`, `m1-06-level-up-choices`, `ui-upgrade-icons` — **42 passed total, 0 failed**. Zero console/page errors, desktop 1280 + mobile 390 (asserted in-spec).

## Owner gate (Robin, not this task)
Playtest: does the wave-30 wall move via combinatorial pool depth (not stat inflation)? Sign-off pending.
