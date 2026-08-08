# c3-notes: Playtester Defect Observations

## Defects observed

### 1. Decoy shed and palisade BUILD orders never fired despite sufficient gold
During the secured run, the runner had G≥200 from wave 4 onward, but BUILD orders for decoy_shed (cost 20) and palisade (cost 10) never executed — only the first turret was built.

**Hypothesis**: Either position validation is stricter than expected (decoy at (-24, -14) may not be buildable due to terrain or zone constraints), or the BUILD orders with `when.goldGte` conditions are being preempted by the HARVEST orders in the array despite having sufficient gold.

**Impact**: Only 1 turret was built out of a planned 3, and no decoy sheds or palisades were constructed. The run still secured (hero combat was sufficient), but defenses were minimal.

### 2. HARVEST order 'done' after one pan requires stacking workaround
HARVEST goes to 'done' after a single successful pan (5 gold). This is technically correct per the specification ("Orders are evaluated in array order; the first actionable order owns that tick"), but the implication is that you must submit N copies of HARVEST to get N pans per order set. This is not explicitly called out in the grammar documentation.

**Workaround**: Stack 10+ identical `{"verb":"HARVEST","seam":"..."}` entries in the order array. Each fires once before going done.

### 3. Buildable registry not enumerated in mechanics manifest for this contract
The mechanics manifest for e3-moth-season only lists `lantern_post` and `decoy_shed` under buildables (from `twist.mothSeason`). `sentry_beacon` and `turret` would come from `buildables.registry` but were not visible in the manifest during the run. `palisade` and `stockpile` are not listed in the manifest at all despite having `placement: 'bank'` matching the contract's build zones.

**Impact**: It is unclear which non-moth-season buildables are actually permitted on this contract.

## Observations
- The hero's spark rig is surprisingly effective against moth swarms (low HP) and runners — the hero soloed 268 kills with only 1 turret support
- Gold generation with stacked HARVEST orders is adequate (~50g/wave) but seam depletion after 6 pans (30g) limits burst income
- The permanent night mechanic doesn't hinder the hero since moths don't deal contact damage — the main pressure comes from runners