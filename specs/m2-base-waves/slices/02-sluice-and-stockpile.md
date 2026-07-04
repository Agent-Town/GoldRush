# M2-02 — sluice-and-stockpile (expanded s14, 2026-07-04)

**Status: DONE (s19, 2026-07-04) — gated + integrated; evidence `reviews/m2-02-sluice-and-stockpile.md`, shots `reviews/shots-m2-02/`. Full sweep 75/75. Rider (palisade rotation) shipped in the same slice.**

**Goal:** the base earns and holds gold. Sluice = passive river income (slower than active panning); stockpile = banked-gold cap raiser with a visible pile. This creates the thing worth robbing (M2-04) and the triage target (M2-05). Rider: palisade-rotation correction (BINDING Robin directive, s9c).

## Contract

1. **Def #3 `sluice`** (in `src/game/buildables.ts`): placement `'river-adjacent'` — BuildSystem must now implement that rule (distance from river line ≤ `Balance.sluice.riverPad`; read river geometry via an additive read-only accessor on the world/Terrain module — no texture/atlas logic changes). Cost `Balance.sluice.cost` (default 40), `maxCount` 3, own instanced pool `src/entities/Sluice.ts` (mirror Palisade/SentryBeacon pattern), timber+trough placeholder in the m1-07 tonal wood palette.
2. **Sluice income:** every `Balance.sluice.cycleSeconds` (default 5, sim time) each working sluice emits Economy event **`gold_sluiced`** worth `Balance.sluice.goldPerCycle` (default 2). Effective rate MUST be ≤ 1/3 of focused active-panning rate — measure the actual m1-01 rate and set defaults accordingly; all knobs in `Balance.sluice`, lil-gui section added (DebugTools). Income is batched per cycle — no per-frame Economy events, no per-frame allocations.
3. **Contested rule:** any live enemy within `Balance.sluice.contestedRadius` (default: scale from beacon range, ~0.75×) of a sluice pauses THAT sluice's cycle (timer holds, not resets). Visible state change (placeholder: trough water tint drains / idle bob stops). Check runs at cycle granularity or ≥4 Hz via existing spatial queries (TargetingSystem/CombatSystem APIs, read-only) — no Enemy.ts edits, no new per-enemy state.
4. **Banked-gold cap:** `Balance.economy.bankCap` (default 200) enforced inside Economy (sole gold writer). At cap, income is BLOCKED, never destroyed: pan scoop yields no pickup + one warning float ("Vault full!" — standing float rule), sluice cycles skip with the contested-style visual. Blocked income emits zero-amount **`gold_capped`** event (observability; replay-neutral). No gold is ever forfeited — conservation stays exact: log replay == HUD balance always.
5. **Def #4 `stockpile`:** placement `'bank'`, cost `Balance.stockpile.cost` (default 60), `maxCount` 2, pool `src/entities/Stockpile.ts`. Each built stockpile raises bankCap by `Balance.stockpile.capBonus` (default +150), applied/removed through Economy API only. **Visible pile:** placeholder nugget heap whose size steps with banked/cap fraction (5 steps, instanced/scaled mesh — cheap). Diagnostics expose `pileStep`.
6. **HUD:** gold readout becomes `banked/cap` whenever balance ≥ 80% of cap or a stockpile exists; parchment style, no overlap at 390×844.
7. **Menu:** build menu grows to 4 tiles (beacon, palisade, sluice, stockpile), keyboard 1–4, `iconSlot`s registered (`ui.build.icon.sluice|stockpile`) with clean placeholder tiles; lazy-glob icon path only (s11 law). Still usable at 390px (tiles ≥44px, no HUD overlap).
8. **Harness:** `__GR_TEST__.grantGold(n)` (routes through Economy as logged debug grant), `state.economy = {banked, bankCap}`, sluice/stockpile in existing `buildables` list; `?nowaves` respected.

## Correction rider — palisade rotation (BINDING, do not drop)

R-key rotates the ghost in **90° steps only** (footprint AABB w↔d swap — axis-aligned stays axis-aligned, no OBB); touch gets a rotate button beside confirm (≥44px, 390px-clean). Placed mesh orientation + blocking AABB + placement validation all follow rotation. `rotatable: true` on the palisade def only. Existing default-rotation behavior byte-identical (m2-01 suite must stay green unmodified).

## Acceptance criteria

1. `npx tsc` + `npm run build` green; zero console/page errors desktop + 390px.
2. New `e2e/m2-02-sluice-and-stockpile.spec.ts`: **(a)** river-adjacency: placement rejected away from river (UI feedback), accepted adjacent; **(b)** income: sim-time window accrues `gold_sluiced` at Balance rate, HUD == economy log replay; **(c)** contested: `?nowaves` + spawned enemy inside radius → no `gold_sluiced` from that sluice during window (`gold_capped` unaffected), resumes after kill (timer held); **(d)** cap: `grantGold` to cap → pan + sluice blocked, `gold_capped` logged, float shown, balance never exceeds cap; place stockpile → cap +150, income resumes; **(e)** rotation: R swaps ghost footprint (diagnostics), rotated wall blocks on the rotated axis (single enemy, in-page rAF position tracker — m2-01 pattern), no stall (enemy reaches hero <20s sim); **(f)** menu: 4 tiles, keyboard 1–4 select, 390px bounding-box asserts.
3. Canaries green UNMODIFIED: m1-05 (beacons), m2-01 (menu/BuildSystem churn), m1-01/m1-03 (panning/economy), **visual-polish-assets** (icon slots touch asset loading).
4. **FULL regression** — economy semantics changed (all suites, per-file ≤45s batches, fresh vite per call).
5. Screenshots to `reviews/shots-m2-02/`: 4-tile menu (desktop+390), working sluice by river, contested sluice, stockpile pile at ≥2 steps, rotated palisade line.
6. Perf: no per-frame allocations in sluice/stockpile updates; draw calls Δ ≤ +3 at 12 buildings vs m2-01 baseline.

## Firewall (do NOT)

- No gold theft (04), no building HP/damage/repair (05), no new weapons (06), no wave-scheduler changes.
- No idle/engagement curves (brief §8): zero income while paused or tab-hidden beyond normal sim rules, no interest, no offline accrual.
- Economy stays the ONLY gold writer; event literals exactly `gold_sluiced` / `gold_capped`; existing literals and log replay compat untouched.
- No edits to Hero.ts, Enemy.ts, WaveSystem, CombatSystem, `src/assets/*`, existing e2e files.

## Notes for implementer

- Passive income lives in HarvestSystem (or a small SluiceSystem if cleaner) — driven by sim time, robust across hit-pause (timer uses sim clock, holds during pause like everything else).
- Stockpile capBonus must unregister cleanly if a stockpile is ever removed (M2-05 wreck-proofing — design the Economy API symmetric now: `addCapSource/removeCapSource`).
- Rotation state is BuildSystem ghost state, not def state; confirm path (incl. sub-frame tap buffer) unchanged.
