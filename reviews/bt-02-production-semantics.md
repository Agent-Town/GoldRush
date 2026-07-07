# Review — BT-02 Tier Production Semantics (s110 drain, owner-ruled)

**Slice:** BT-02 — building-tier upgrades meaningfully improve production (yield/DPS/HP ramps).
**Source branch:** `save/bt-02-production-semantics` commit `19f27dc` "feat: add tier production semantics".
**Merged:** onto clean main (s110 fire, 3rd drain, after sci-ceiling + m4-07), 3-way auto-resolve on Balance.ts + BuildSystem.ts + vite-env.d.ts, `--no-commit` gated.
**Verdict:** ✅ PASS — merged.

## Why now (was owner-gated, now RULED)
The HANDOVER §4 **UNTANGLE ORDERS (s61 attended, 2026-07-07 ~08:20)** ruled: *"BT-02 RAMP: RULED, merge it — the ramp call was already made by the owner in play ('of course upgrading should improve production… much stronger, otherwise it does not make sense'); spec stakes stand: sluice ≥ +60% yield/tier, turret ≥ +50% DPS/tier, palisade ≥ +75% HP/tier."* This drain executes that ruling. **043 now unpauses** (its gate was BT-02 landing).

## Ramp numbers vs the ruling ✓
- **palisade** `maxHpMult`: tier1 `1.6→1.75` (+75%), tier2 `2.4→3.1` (+77%/step). Ruling ≥+75% HP/tier ✓.
- **sluice**: new `yieldMult` `1.0 / 1.7 / 2.7` stacked on `panRateMult` `1.0 / 1.35 / 1.9`. Tier1 production ≈ 1.35×1.7 = **2.3× (+130%)**, tier2 ≈ 1.9×2.7 = 5.1×. Ruling ≥+60% yield/tier ✓ (well over).
- **turret** (unchanged by BT-02, already compliant): DPS = damageMult×fireRateMult → tier1 1.4×1.18 = **1.65× (+65%)**, tier2 1.9×1.35 = 2.57×. Ruling ≥+50% DPS/tier ✓.

## Merge-coherence check ✓ (auto-merge can hide clobbers)
- `BuildSystem.ts`: **both** BT-02's tier semantics (`tierUpgrades`, `TierStat` incl. new `yieldMult`, tier stores) **and** sci-ceiling's `turretDamageMult` (lines 226/532/560/1182) present — non-overlapping, no clobber.
- `Balance.ts`: only palisade/sluice tier tables changed; verified via `git diff HEAD:Balance.ts` (turret untouched, no other constant moved).
- `Sluice.ts` (+20): applies the new `yieldMult` to seam output.

## Evidence
- `npx tsc --noEmit` — clean. `npm run build` — clean (only pre-existing chunk-size advisory).
- **`e2e/bt-01-tiers.spec.ts` (extended +95, both projects): all pass** — tier cap stops at tier 3 w/o extra spend, demolish refund includes tier investment, insufficient gold leaves tier+gold unchanged, plus the production-semantics assertions.
- Adjacent (both projects): m2-01 build-menu (incl. draw-call stress <200), m1-04 gold-panning-economy, m1-05 sentry-beacon — all pass.
- Boot probe (`_s106`, both projects): 2/2, zero console/page errors.

## Findings (non-blocking)
- **m1-05-sentry-beacon-build:61** (mobile, "registers kills through combat") failed once in the 48-test concurrent batch, **passed isolated** — combat-load flake (F-042 family, same one that recovered in the s110 drain-A adjacent run). Not caused by this merge.
