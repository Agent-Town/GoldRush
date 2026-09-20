# BT-02b stockpile tiers — run report

**Verdict:** READY-FOR-GATES. Stockpile tiers are purchasable, raise the live Economy cap, restore at their saved cap, remove their keyed cap source on demolition, and stop at tier 3. The new acceptance case passes on desktop and 390px mobile. Two unchanged BT-01 Enter-to-demolish assertions remain red on both projects and are quoted below.

## Measure-first baseline

The untouched lane baseline was green on both required factory checks:

| Check | Result | Exit |
|---|---:|---:|
| `npx playwright test --list` | `Total: 2452 tests in 345 files` | 0 |
| `npm run test:node-guards` | 203 passed, 0 failed | 0 |

`Balance.tiers` keys before the change were `palisade, sluice, turret`. A stockpile contributed the same flat `150g` at every conceptual tier because both live cap sites passed `Balance.stockpile.capBonus` directly and stockpile was not upgradeable.

| Player tier | Upgrade cost | Cap contributed before BT-02b |
|---:|---:|---:|
| 1 | 0g | 150g |
| 2 | unavailable | 150g |
| 3 | unavailable | 150g |

## Implemented delta

- Added `Balance.tiers.stockpile` with `capMult` values `1 / 1.6 / 2.4` and costs `0 / 110 / 260`.
- Added `capMult` to `TierStat`.
- Added `stockpile` to both hand-maintained upgrade registries. I kept the explicit predicate rather than restructuring shared upgradeability behavior outside the scalpel firewall.
- Made all four stockpile cap writes tier-aware through the existing `effectiveStat` helper and the existing `stockpile:${index}` key: placement, repair, upgrade, and restore.
- Used `Math.round`, matching the existing sluice yield precedent.
- Chose **refresh-after-tier** in `restoreBuilding`: `finishPlacement` still performs its established initialization, then the restored tier replaces the same keyed cap source. This is lower risk than reordering placement initialization.
- Extended `e2e/bt-01-tiers.spec.ts` without changing any existing assertion.

Registry-only would have exposed a purchasable stockpile upgrade while leaving its cap flat. The registry and all four cap refreshes therefore ship as one unit.

## Tier curve

With the base Economy cap of `200g`, one stockpile now produces:

| Tier | Cost of rung | Cap contributed | Running Economy cap |
|---:|---:|---:|---:|
| 1 | 0g | 150g | 350g |
| 2 | 110g | 240g | 440g |
| 3 | 260g | 360g | 560g |

The cost curve clears the spec's `^1.6+` valve: `260 / 110 = 2.3636`, which is greater than `1.6`; the minimum qualifying next cost would be `110 × 1.6 = 176g`.

## Behavioral proof

The new test buys both rungs through `upgradeBuilding`, observes caps `350 → 440 → 560`, refuses a fourth purchase without spending gold, captures a real suspend snapshot, restores it through `restoreSuspend`, and then demolishes the restored stockpile.

- **Save/restore:** the captured building carries tier 3; after restore the building remains tier 3 and Economy cap is `560g`, not the flat `350g`.
- **Demolish/orphan check:** demolishing the restored tier-3 stockpile returns Economy cap to the pre-build `200g`. The existing `stockpile:${index}` source was replaced during upgrades and removed during teardown; no second key was introduced.
- **Separate research source:** no changes were made to `Economy.ts`, `Upgrades.ts`, `ResearchChart.ts`, or the `upgrade:stockpile_cap` source.

Human evidence:

- `artifacts/bt-02b-stockpile-tiers/desktop-chrome-tier-3.png`
- `artifacts/bt-02b-stockpile-tiers/mobile-chrome-tier-3.png`

**Mistake #10 answer:** in a plain boot, the player opens build mode and approaches a built Stockpile Yard; its context card offers the next tier and then displays the attained tier and tier-3 ceiling.

## Gates

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green; only the existing chunk-size advisory |
| Focused BT-02b case, both projects, `--workers=1` | 2/2 passed |
| Full `e2e/bt-01-tiers.spec.ts`, both projects, `--workers=1` | 18 passed, 4 failed; failures are unchanged assertions listed below |
| Named adjacent trio, both projects, `--workers=1` | 34/34 passed |
| Plain boot, no `?debug`, desktop + 390px | 0 console/page errors on both |
| Final `npx playwright test --list` | `Total: 2454 tests in 345 files`, exit 0 |
| Final `npm run test:node-guards` | 203 passed, 0 failed, exit 0 |

Collection comparison: `2452 → 2454` tests and `345 → 345` files, exactly one new test collected in two projects. Node guards stayed `203 → 203`.

### Unchanged BT-01 reds

Both projects failed the same two existing assertions; neither assertion was edited:

1. `Enter tears down after clicking upgrade instead of re-clicking the focused upgrade button` — `expect.poll(() => hpEntry(...)).toBeNull()` timed out while the tier-2 turret remained present.
2. `insufficient gold leaves tier and gold unchanged` — `expect.poll(() => hpEntry(...)).toBeNull()` timed out while the tier-1 palisade remained present.

The new stockpile case passed in the same serial run on both projects. Per the task firewall, these reds are reported rather than repaired or weakened.

## Forbidden findings

- Steal-pressure coupling remains absent and was not implemented.
- `upgradeFloatText()` has only palisade/sluice special cases and a turret default, so a stockpile purchase actively floats `Turret II - brass cadence quickens`. `tierGain()` has the same fallback, although its returned `gain` is not currently rendered. Both symbols are outside this task's allowed six `BuildSystem` sites.
- `buildableTierEffectLine()` has no stockpile branch, so the main build-menu card has no cap-per-tier line even though the in-world context card correctly shows `Stockpile Yard · Tier N`. That helper lives in forbidden `src/game/buildables.ts`, so the omission is reported, not fixed.

**READY-FOR-GATES**
