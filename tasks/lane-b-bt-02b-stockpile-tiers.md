# BT-02b — the stockpile's tiers finally raise its cap (the 4th archetype BT-02 left on the floor)

**FIRE-AUTHORED s1312 (attended review welcome).** Role: lane-b runner. Workdir: `worktrees/lane-b` (branch `lane/m4`).

## READ FIRST (open these, do not skim)
- `specs/building-tiers/README.md` — the ratified spec. Line 20 is your slice (**BT-02 Production semantics**); line 31 is the owner's ratification.
- `reviews/bt-02-production-semantics.md` — what BT-02 **actually shipped** (s110). Read it to see the shape you are copying, and to confirm for yourself that stockpile is absent from it.
- `reviews/bt-01-tier-core.md` — the tier mechanism itself (tier state, in-place upgrade, cost/refund, tier-3 cap).
- `src/game/Balance.ts:732`–`:760` — the `tiers` table (`palisade`, `sluice`, `turret`; **no `stockpile`**).
- `src/systems/BuildSystem.ts:273` (`TierStat` union), `:1956` (the `effectiveStat` pattern you will copy), `:1673` and `:1714` (the two flat `addCapSource` calls you will change), `:1061` + `:2919` (`stockpileCapSource`).
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

So a player can spend gold tiering a stockpile and receive **nothing**. That is the delta, and it is the whole task.

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

4. **Make both stockpile cap sites tier-aware.** `:1673` and `:1714` currently pass `Balance.stockpile.capBonus` flat. Route each through the **existing** `effectiveStat` helper, exactly as sluice does at `:1956`. Do **not** write a second helper, and do **not** change `effectiveStat`'s signature.
   - Round the same way the sluice site does; if that produces a fractional cap, follow the sluice precedent and say which one you followed.
   - ⚠️ **`:1061` removes cap sources on teardown.** Verify by test that tiering, then demolishing, leaves **no orphaned cap** — a stale `addCapSource` would permanently inflate the player's gold ceiling. This is the highest-risk line in the slice.

5. **Prove it in the spec suite.** Extend `e2e/bt-01-tiers.spec.ts` (BT-02 extended this same file — follow that precedent, do not create a new spec) with assertions that:
   - a tier-0 stockpile contributes the documented base cap;
   - tiering it to 1 and 2 raises the **Economy cap** by the documented multipliers;
   - demolishing a tiered stockpile returns the cap to its pre-build value (the orphan check from scope 4);
   - the tier-3 cap from BT-01 still holds — no fourth rung is purchasable.

6. **Evidence a human can check without running anything.** Screenshots of the build menu showing a tiered stockpile, desktop **and** 390 px mobile → `artifacts/bt-02b-stockpile-tiers/{desktop,mobile}-chrome-<state>.png`. In the report, print a small table: tier → cost → cap contributed → running total.

## Firewall

**Touch ONLY:** `src/game/Balance.ts` (the `tiers` table only), `src/systems/BuildSystem.ts` (the `TierStat` union + the two cap sites), `e2e/bt-01-tiers.spec.ts`, new screenshots under `artifacts/bt-02b-stockpile-tiers/`, and your run report.

**NO changes to:**
- ❌ **The steal-pressure coupling.** The spec's BT-02 line also says *"+ steal-pressure coupling"*. That is a **new gameplay coupling**, not a table entry — it is design-adjacent and therefore **NOT in this slice** (CLAUDE.md §7.3). If you see an obvious place for it, **report it, do not build it.**
- ❌ `src/game/Economy.ts` — Economy is the sole gold writer and its API already does what you need. If you believe it must change, **STOP and report why**; that is a finding, not a fix.
- ❌ `palisade` / `sluice` / `turret` tier rows, and `Balance.stockpile.capBonus` itself (the base is not yours to retune — only its tier scaling).
- ❌ Any existing e2e assertion. A spec going red is a finding to **REPORT**. Greening a test by editing its assertion is the REJECT condition.
- ❌ `src/game/Upgrades.ts`, `src/ui/ResearchChart.ts`, and the research `stockpileCapBonus` path — research cap bonuses are a **separate cap source** and must keep stacking independently. Prove you did not disturb them.

## No-op guard
If you find yourself about to exit without changes, **WRITE WHY into your report first.** A silent no-op wastes a queue slot and a gate. Likewise a **STOP at scope 1 or 4 is a SUCCESS**, not a failure — this master pre-declares it.

## Self-check (evidence, not vibes)
- [ ] `npx tsc --noEmit` clean · `npm run build` green.
- [ ] `e2e/bt-01-tiers.spec.ts` green, **both projects** (desktop + 390 px mobile), **`--workers=1`** (§3.1 — a red seen at default workers is not evidence).
- [ ] Adjacent, named not implied, both projects, `--workers=1`: `e2e/m2-01-build-menu.spec.ts`, `e2e/m1-04-gold-panning-economy.spec.ts`, `e2e/m1-05-sentry-beacon-build.spec.ts` — the exact three BT-02 used as its adjacent set.
- [ ] `npx playwright test --list` exit 0 with the scope-1 `Total:` restored — quote before and after.
- [ ] `npm run test:node-guards` exit 0, same count as scope 1.
- [ ] Zero console/page errors in a **plain boot** (no `?debug`), desktop and 390 px.
- [ ] Screenshots at the exact paths in scope 6, plus the tier→cost→cap table in the report.
- [ ] **Mistake #10 answer, in one sentence: where does the PLAYER see this in a plain boot?**

End: **READY-FOR-GATES** + report (a) the scope-1 vs scope-4 collection numbers side by side, (b) the tier→cost→cap table, (c) the cost-curve arithmetic vs the `^1.6` valve law, (d) the demolish/orphan-cap result, (e) any adjacent red with its assertion quoted, (f) anything you were forbidden to fix but noticed — especially anything about steal-pressure.
