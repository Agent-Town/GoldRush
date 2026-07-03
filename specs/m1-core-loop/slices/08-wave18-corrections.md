# m1/08-wave18-corrections (BINDING before close-spec — Robin, wave-18 run)

**Contract:** the three product-owner findings from the wave-18 record are fixed with evidence; M1 then closes on Robin's defaults-confirm.

1. **Lifetime "Gold Panned"** — death ledger + Claim Record scoreboard show lifetime panned, derived purely from the Economy event log (`sum(gold_panned)` via `reduce()`; no new state — the m1-04 seam exists for exactly this). Add `spent` and `beacons built` lines to the Run Ledger. e2e: pan 2 ticks → spend 25 on a beacon → die → ledger shows panned=10 (not held=−15), spent=25.
2. **Beacon falloff tune** — one knob round, no structural change: raise `beacon.damage` and/or add per-wave scaling (`beacon.damagePerWave`), all in `Balance.ts` + lil-gui; target: a wave-10 clump of 3 dies to 2 beacons + hero without melee-only feel. Record chosen numbers here. (True fix candidates — smart targeting, splash — belong to M2-06/07, not here.)
   **CHOSEN (s7, 2026-07-04): `damage: 10`, `damagePerWave: 0.75`** (bolt dmg = 10 + 0.75×wave at fire time; wave-10 beacon bolt = 17.5). Acceptance e2e green: 2 beacons + hero clear 3×87 HP inside 12 s, hero ≥ 50 HP. Also: `economy.logCapacity` 128 → 2048 (ledger derive must not truncate).
3. **Upgrade-pool exhaustion** — `rollOffer` never shows maxed/unpickable cards; when <3 pickable remain, filler defs pad the offer (`assay_bonus` +15 gold · `field_dressing` heal 30 · `sharpen` +5% dmg, unbounded-small, weight 1); if nothing is offerable, skip the freeze/offer entirely. e2e: max everything via harness → offer still 3 pickable cards; and zero-offerable path never freezes.

**Verification:** GATE-STD; full regression (46 tests incl. these + m1-07-charm 7); ledger derive asserted against a scripted economy log.

**Firewalls:** no M2 buildables, no meta-persistence beyond the existing scoreboard, no targeting rewrites. Kills grant XP, never gold (filler card gold comes from the Assay Office = an `Economy` `gold_granted` event with source `upgrade_assay`, logged like everything else).

---

## Wave-23 corrections (BINDING — Robin wave-23 run, folded into m1-08 by s8)

Robin's wave-23 run (wave 23, 11:46, 1136 kills, 300 panned) confirmed the ledger fix but rejected the filler cards and their presentation (`docs/playtests/2026-07-03-robin-wave10.md` §Wave-23). Three fixes, all in the level-up card path — the wave18 e2e must be updated in lock-step (old suites change; run FULL regression, not just m1-08).

4. **Filler cards scale with progress** — a level-up must NEVER feel like a shrug.
   - `assay_bonus`: gold = `Balance.upgrades.assayGoldPerWave` (=5) × current wave (min 1 wave) → wave 23 shows "+115 gold now".
   - `field_dressing`: heal = `round(Balance.upgrades.fieldDressingHealFrac` (=0.30) × hero maxHp), capped at maxHp.
   - `sharpen`: unchanged (+5% spark damage, permanent, infinite stacks) — small by design so late levels compound.
   - **Single source of truth:** resolve the filler effect once from live run state (`getWave`, `maxHp`) in a shared helper used by BOTH the card effect line (show-time) and the apply path — the sim is frozen during level-up so show-time and apply-time values are identical. Gold still flows through `Economy` `gold_granted/upgrade_assay` (float rule); heal via `onHeal` (green float — standing float rule). Re-verdict by Robin next playtest.
5. **Remove procedural glyph icons** — they failed the quality bar; clean parchment beats bad art. Delete `renderGlyph()` + the visible `.upgrade-card__icon` SVG. Real illustrated icons arrive via **batch-002**, ONE per effect FAMILY (not per card): `assets/layer-contracts/m1-upgrade-icons.v1.json`, slot `ui.upgrade.icon.<family>`, 512² cutouts. Add `iconFamily` to each upgrade def; the card keeps the family slot hook (empty until art integrated — placeholder-first). Families: firerate · damage · range · volley · plating · mobility · panning · prospecting · beacon · gold · mend.
6. **Card layout pass** — cards read "too full." Card = pick-key chip + name (display size) + ONE effect line. Cut the flavor `description` line entirely. Stack state = a minimal, low-contrast `n/max` marker (functional, NOT a big pip block) — the one deviation from Robin's literal "nothing else," flagged for his call. Restore hierarchy + whitespace in `theme.css`/`styles.css`. **screenshot-critique gate: readable in <1s at a mid-combat freeze, desktop 1280 + mobile 390.**

**e2e deltas (enumerated so no correction round is needed):**
- `e2e/m1-08-wave18-corrections.spec.ts` filler test: assay assert → `goldBefore + 5×wave`; assay-log `amount === 5×wave`; field_dressing → `hurt.hp + Math.round(0.30 × hurt.maxHp)`. The `summarizeLog` synthetic-log test KEEPS `amount:15` (hand-built data — do not touch).
- `e2e/m1-07-charm.spec.ts:155` — delete the `[data-slot="ui.upgrade.<id>"] svg` visible assert (glyph removed). Keep the `.upgrade-card__effect` digit assert (line 154).
- Grep every e2e for `upgrade-card__description` / per-id `ui.upgrade.` and fix to the slim card + `ui.upgrade.icon.<family>`.

**CHOSEN (s8):** `assayGoldPerWave 5`, `fieldDressingHealFrac 0.30`. Verification extends the wave18 GATE-STD: full regression green with the updated asserts, desktop+mobile card screenshots, screenshot-critique verdict recorded in the review.
