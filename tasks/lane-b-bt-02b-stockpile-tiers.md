# BT-02b — the stockpile's tiers finally raise its cap (the 4th archetype BT-02 left on the floor)

**FIRE-AUTHORED s1312 · v2 RE-AUTHORED s1313 WITH A LIFTED FIREWALL (attended review welcome).** Role: lane-b runner. Workdir: `worktrees/lane-b` (branch `lane/m4`).

## ⚠️ READ THIS FIRST — v1 STOPPED LAWFULLY, AND IT WAS RIGHT
v1 of this master ran and **STOPPED at scope 4 without writing product code**, because its firewall permitted changes to the `TierStat` union and the two `addCapSource` calls **and nothing else** — and that set cannot make a stockpile tier purchasable. **That STOP was correct and is preserved at `artifacts/bt-02b-stockpile-tiers/report.md` (merged to main s1313, `734657df`).** Read it. You are not repeating v1; you are running it with the three sites it correctly identified as missing now **explicitly in scope**.

s1313 re-verified all three of v1's blocking claims at source before lifting the firewall. **All three hold**, and one of them corrects the WHY below:

- `isUpgradeableBuildable()` (`BuildSystem.ts:2922`) hard-codes `palisade | sluice | turret`; `upgradeableBuildableIds` (`:256`) is the same three. So `upgradeBuilding('stockpile', …)` returns **false at `:1221`**, and `tierRung()` returns **null at `:1937`**, so `effectiveStat` falls back to multiplier 1.
- `upgradeBuilding()` (`:1214`–`:1250`) updates tier, cost, HP, target, visuals and shooter stats — and **never touches a cap source**.
- `restoreBuilding()` calls `finishPlacement()` at **`:997`** (which adds the flat tier-1 cap) and only then sets `this.tier` at **`:999`**. The cap is never refreshed, so a saved tiered stockpile restores flat.

🔧 **CORRECTION to v1's WHY, which you should not repeat in your report:** v1 said *"a player can spend gold tiering a stockpile and receive nothing."* **That is false, and the truth is worse.** Because `upgradeBuilding` rejects the ID outright, **no player can buy a stockpile tier at all** — the build menu exposes no upgrade for it. The defect is an **absent archetype**, not an inert one. Nobody is being overcharged; a ratified feature simply does not exist.

💡 **And one hazard v1 pre-declared is already answered — do not spend a scope item re-deriving it.** `Economy.addCapSource` (`src/game/Economy.ts:250`) is `this.capSources.set(id, amount)` — a **keyed replace, not an accumulate**. Since every stockpile cap site keys on `stockpileCapSource(index)`, re-adding on upgrade **overwrites** rather than stacks, and `teardownBuilding()` (`:1688`) deletes that same key on demolish/wreck. **The orphaned-cap failure is therefore structurally prevented, not merely untested — provided you keep using that key.** ⚠️ **You must still prove it by test (scope 5): a structural argument is not evidence, and the moment you invent a second key it stops being true.**

## READ FIRST (open these, do not skim)
- `specs/building-tiers/README.md` — the ratified spec. Line 20 is your slice (**BT-02 Production semantics**); line 31 is the owner's ratification.
- `reviews/bt-02-production-semantics.md` — what BT-02 **actually shipped** (s110). Read it to see the shape you are copying, and to confirm for yourself that stockpile is absent from it.
- `reviews/bt-01-tier-core.md` — the tier mechanism itself (tier state, in-place upgrade, cost/refund, tier-3 cap).
- `artifacts/bt-02b-stockpile-tiers/report.md` — **v1's STOP report. Read it before anything else.**
- `src/game/Balance.ts:732`–`:748` — the `tiers` table (`palisade`, `sluice`, `turret`; **no `stockpile`**). Three rungs each, index 0 = `cost: 0` and all multipliers `1`.
- `src/systems/BuildSystem.ts` — **navigate by SYMBOL, not by line; these coordinates were measured s1313 and drift as soon as anyone inserts a line:** `TierStat` union (`:273`) · `effectiveStat` (`:1942` — the pattern you copy) · `tierRung` (`:1937`) · `upgradeableBuildableIds` (`:256`) · `isUpgradeableBuildable` (`:2922`) · `upgradeBuilding` (`:1214`) · `restoreBuilding` (`:984`) · `finishPlacement` (`:1661`, cap site) · `repair` (`:1714`, cap site) · `teardownBuilding` (`:1688`, cap removal) · `stockpileCapSource` (`:2918`).
- `src/game/Economy.ts:250` (`addCapSource`) — Economy is the **sole gold writer** (CLAUDE.md §4.4). You call its API; you never write gold yourself.

## WHY (evidence, quoted and dated)
**The owner ratified this and it was never built.** `specs/building-tiers/README.md:31`, verbatim:

> "**Baseline trio: PALISADE + SLUICE + TURRET** — owner: 'this is the baseline.' (Wall / economy / gun; **stockpile tiers follow in BT-02**.)"

and the slice line, `:20`:

> "**BT-02 Production semantics**: sluice tiers raise auto-pan yield; **stockpile tiers raise caps** + steal-pressure coupling; economy telemetry so 021/012 tuning sees the ramp"

**BT-02 shipped s110 — and shipped three of its four archetypes.** `reviews/bt-02-production-semantics.md` documents palisade HP, sluice `yieldMult`, and turret (already compliant). It **never mentions stockpile**. Measured on main s1312:

- `Balance.tiers` archetypes are exactly `palisade, sluice, turret` — derived by parsing the table, not by eye.
- `grep -rniE "stockpileTier|stealPressure" src/` → **zero lines**.
- `BuildSystem.ts:1673` and `:1714` both read `this.economy.addCapSource(stockpileCapSource(index), Balance.stockpile.capBonus)` — a **flat** bonus, identical at every tier.

~~So a player can spend gold tiering a stockpile and receive **nothing**.~~ **CORRECTED s1313 (see the top of this file):** the stockpile is not registered as upgradeable at all, so the tier **cannot be bought** — the archetype is absent, not inert. That is the delta, and it is the whole task.

⚠️ **This is a PARTIAL-SHIP delta, not a re-run of BT-02** (author-task §1 / Mistake #8). BT-02 is correctly marked shipped. Scope only the stockpile archetype and cite `reviews/bt-02-production-semantics.md` as the predecessor.

## Scope (each item is testable)

1. **MEASURE-FIRST BASELINE — record the numbers in your report before changing anything.**
   - `npx playwright test --list` → record exit code and the exact `Total: N tests in M files` line.
   - `npm run test:node-guards` → record pass count and exit code.
   - Print the current `Balance.tiers` archetype keys and the stockpile cap a tier-0/1/2 stockpile actually contributes today (they will be identical — that is the defect, and your report should say so in one line).
   - If either gate is ALREADY red on untouched main: **STOP and report it.** A pre-existing factory break outranks this slice.

2. **Add the `stockpile` archetype to `Balance.tiers`** with three rungs, mirroring the existing tables' shape exactly (`{ cost, ... }`, tier-0 cost 0 and all multipliers 1). The stat key is **`capMult`**: `1 / 1.6 / 2.4`. Costs `0 / 110 / 260`.
   - **The cost curve must satisfy the spec's own valve law** (`README.md:13`: costs grow `^1.6+`). State in your report whether `110 → 260` clears it, showing the arithmetic. If it does not, adjust the costs — **not** the law — and say so.

3. **Add `'capMult'` to the `TierStat` union** (`BuildSystem.ts:273`).

4. **🔓 REGISTER `stockpile` AS AN UPGRADEABLE ARCHETYPE — the lift v1 was refused.** Add `'stockpile'` to **`upgradeableBuildableIds`** *and* to the `isUpgradeableBuildable()` predicate. ⚠️ **These are two hand-maintained lists of the same three IDs that must agree** — the predicate does not derive itself from the array. Changing one and not the other is the single most likely way to half-ship this slice; if you can make the predicate derive from the array without touching unrelated behaviour, that is **welcome but optional**, and say which you chose.
   - Report what this alone changes: with the registry fixed but no cap wiring, a stockpile becomes **purchasable** and the menu shows an upgrade — that is precisely the state you must **not** leave it in. Scopes 4–6 are one indivisible unit.

5. **Make every stockpile cap site tier-aware — there are FOUR, not two.** Each must pass the tier-scaled bonus through the **existing** `effectiveStat` helper, exactly as sluice does. Do **not** write a second helper, do **not** change `effectiveStat`'s signature, and **always key on `stockpileCapSource(index)`**.
   - **(a) `finishPlacement`** (`:1672`) and **(b) `repair`** (`:1725`) — the two v1 was allowed to touch. Both currently pass `Balance.stockpile.capBonus` flat.
   - **(c) 🔓 `upgradeBuilding`** — after the tier is committed, **refresh the cap source**. This is the line that makes the purchase mean anything.
   - **(d) 🔓 `restoreBuilding`** — `finishPlacement` adds the tier-1 cap *before* `this.tier` is assigned, so the restore must refresh the cap **after** the tier is set. Fixing this by re-ordering `restoreBuilding` is acceptable **if** you can show the reorder breaks nothing else; refreshing after the fact is the lower-risk option. **State which you chose and why.**
   - Round the same way the sluice site does; if that produces a fractional cap, follow the sluice precedent and say which one you followed.

6. **Prove it in the spec suite.** Extend `e2e/bt-01-tiers.spec.ts` (BT-02 extended this same file — follow that precedent, do not create a new spec) with assertions that:
   - a tier-1 stockpile contributes the documented base cap;
   - **buying** tier 2 and tier 3 raises the **Economy cap** by the documented multipliers — this is the scope-5(c) path and the heart of the slice;
   - **a saved tier-3 stockpile restores with its tier-3 cap, not the flat base** — the scope-5(d) path. ⚠️ **A green here that does not actually round-trip through save/restore is worthless; make sure the assertion would fail against today's code.**
   - demolishing a tiered stockpile returns the cap to its pre-build value (the orphan check);
   - the tier-3 cap from BT-01 still holds — no fourth rung is purchasable.

7. **Evidence a human can check without running anything.** Screenshots of the build menu showing a tiered stockpile, desktop **and** 390 px mobile → `artifacts/bt-02b-stockpile-tiers/{desktop,mobile}-chrome-<state>.png`. In the report, print a small table: tier → cost → cap contributed → running total.

## Firewall

**Touch ONLY:** `src/game/Balance.ts` (the `tiers` table only), `src/systems/BuildSystem.ts` — **and in that file ONLY these six sites, which are the v1 firewall plus the four lifted s1313**: (1) the `TierStat` union · (2) 🔓 `upgradeableBuildableIds` · (3) 🔓 `isUpgradeableBuildable` · (4) the `finishPlacement` + `repair` cap calls · (5) 🔓 the cap refresh in `upgradeBuilding` · (6) 🔓 the cap refresh (or tier/cap ordering) in `restoreBuilding` — plus `e2e/bt-01-tiers.spec.ts`, new screenshots under `artifacts/bt-02b-stockpile-tiers/`, and your run report.

⚠️ **The lift is a scalpel, not a licence.** `upgradeableBuildableIds` and `isUpgradeableBuildable` feed the build menu, refunds (`:2373`), `menuTierFor`, and `tierRung` for **all** archetypes. Adding one ID is in scope; **restructuring how upgradeability is decided is not.** If adding `'stockpile'` reddens a palisade/sluice/turret assertion, that is a **finding to REPORT**, and very likely tells us the registry means more than it says.

**NO changes to:**
- ❌ **The steal-pressure coupling.** The spec's BT-02 line also says *"+ steal-pressure coupling"*. That is a **new gameplay coupling**, not a table entry — it is design-adjacent and therefore **NOT in this slice** (CLAUDE.md §7.3). If you see an obvious place for it, **report it, do not build it.**
- ❌ `src/game/Economy.ts` — Economy is the sole gold writer and its API already does what you need. **v1 independently confirmed this** ("No second helper or `Economy.ts` change is needed"), so this NO is now evidence-backed rather than assumed. If you still believe it must change, **STOP and report why**; that is a finding, not a fix.
- ❌ `palisade` / `sluice` / `turret` tier rows, and `Balance.stockpile.capBonus` itself (the base is not yours to retune — only its tier scaling).
- ❌ Any existing e2e assertion. A spec going red is a finding to **REPORT**. Greening a test by editing its assertion is the REJECT condition.
- ❌ `src/game/Upgrades.ts`, `src/ui/ResearchChart.ts`, and the research `stockpileCapBonus` path — research cap bonuses are a **separate cap source** and must keep stacking independently. Prove you did not disturb them.

## No-op guard
If you find yourself about to exit without changes, **WRITE WHY into your report first.** A silent no-op wastes a queue slot and a gate. Likewise a **STOP at scope 1 is a SUCCESS**, not a failure — this master pre-declares it.

⚠️ **But a second firewall STOP is NOT the expected outcome this time.** v1's STOP was correct and has been paid for: the four sites it named are now in scope. If you are about to STOP again on a firewall boundary, **name the exact symbol and say why the s1313 lift does not reach it** — that is a genuine finding and outranks the slice. Do **not** STOP merely because this master resembles the one that stopped.

## Self-check (evidence, not vibes)
- [ ] `npx tsc --noEmit` clean · `npm run build` green.
- [ ] `e2e/bt-01-tiers.spec.ts` green, **both projects** (desktop + 390 px mobile), **`--workers=1`** (§3.1 — a red seen at default workers is not evidence).
- [ ] Adjacent, named not implied, both projects, `--workers=1`: `e2e/m2-01-build-menu.spec.ts`, `e2e/m1-04-gold-panning-economy.spec.ts`, `e2e/m1-05-sentry-beacon-build.spec.ts` — the exact three BT-02 used as its adjacent set.
- [ ] `npx playwright test --list` exit 0 with the scope-1 `Total:` restored — quote before and after.
- [ ] `npm run test:node-guards` exit 0, same count as scope 1.
- [ ] Zero console/page errors in a **plain boot** (no `?debug`), desktop and 390 px.
- [ ] Screenshots at the exact paths in scope 7, plus the tier→cost→cap table in the report.
- [ ] **Mistake #10 answer, in one sentence: where does the PLAYER see this in a plain boot?**

End: **READY-FOR-GATES** + report (a) the scope-1 vs scope-6 collection numbers side by side, (b) the tier→cost→cap table, (c) the cost-curve arithmetic vs the `^1.6` valve law, (d) **the demolish/orphan-cap result AND the save/restore round-trip result — a green without BOTH is a STOP**, (e) any adjacent red with its assertion quoted, (f) anything you were forbidden to fix but noticed — especially anything about steal-pressure, (g) **which option you chose for the `restoreBuilding` fix (refresh-after vs reorder) and why**.
