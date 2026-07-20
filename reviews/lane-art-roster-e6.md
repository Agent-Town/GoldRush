# Review — art-batch-roster-e6 (E6 enemy walk8 sprites: extract + wire)

**Slice:** art-batch-roster-e6 — extract the three E6 non-boss enemy walk8 sheets and swap the E6 roster (feral_toaster / lawn_shepherd / glowjack) off the bandit placeholder onto real art.
**Slot / source:** ART slot. Raw sheets landed on main in `c4868128` (`runner(art)`); this is the fire-side EXTRACTION + WIRING drain (the task master itself says "NO extraction — fire/attended runs extract-alpha").
**Drained by:** s762 fire, directly on main (no lane branch — main-slot art processing).
**Verdict:** ✅ MERGE — real E6 enemy art renders in a plain E6 boot, desktop + 390-mobile, zero console/page errors.

## What it does (player-visible)
The three Atomic-Homestead roster enemies — the **Feral Toaster** (knee-high hopping appliance), the **Lawn-Shepherd** (low mower that herds the swarm), and the **Glowjack** (lead-lined outlaw thief) — have been fielded in E6 wave tables since s754 but rendered with the **bandit placeholder sprite tinted flat** (`generated.ts` pointed all three slots at `char-bandit-base-sheet-walk8-r0c0.png`; `pools.ts` passed `tintFromVariant=true` while the placeholder held). This drain lands their real engraved-warm art: each now walks its own chrome/copper/teal Atomic silhouette. Per `specs/enemy-rosters-e6-e10.md` NO-BLOCKER LAW (owner 2026-07-18: "you can wire things in game, I just correct them later") this ships without an owner-review gate; corrections land post-hoc at the one art seam (slot → sheet).

## How it was done
- `node scripts/extract-alpha.mjs --key ff00ff --grid 4x2 assets/raw/char-e6-{feral_toaster,lawn_shepherd,glowjack}-sheet-walk8.png`
  → 8/8 non-empty cells each @512px + `<base>.frames.json` in `assets/processed/` (24 new cells + 3 json).
  Extraction scale = 1 for all three (auto-fit capped, never upscaled) → the small toaster keeps its knee-high stature; the per-variant `Balance.ts` `visualScale` (0.45 / 0.65 / 1.0) supplies the world-height ratios, which match the run's authored height-band targets (0.45 / 0.65 / 1.0) exactly.
- The pre-existing wiring in `src/entities/pools.ts:70-85` (`import.meta.glob('char-e6-*-sheet-walk8-r*c*.png')` + `e6EnemySpriteBinding()`) auto-activates once all 8 cells per sheet exist: `placeholder` computes false, so `createEnemySpritePresentation(…, false)` drops the flat variant tint and uses the real sprite. **No src wiring authored** — only the cells were missing.
- `src/assets/generated.ts:13-15`: repointed the three E6 slot fallbacks off `char-bandit-base-…-r0c0` onto each enemy's own `char-e6-<id>-sheet-walk8-r0c0.png`, matching the established E2-enemy pattern (rail_tough/steam_wrecker/coal_thief).

## Evidence
| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✓ clean |
| `npm run build` | ✓ green, 1.11s |
| `e2e/e6-roster.spec.ts` (slice spec) | ✓ 6/6 — desktop-chrome + mobile-chrome (33.1s) |
| Binding state (in-page probe, both projects) | `placeholder: false` for all three (feral_toaster / lawn_shepherd / glowjack) |
| Boot probe zero-errors | `{console: [], page: []}` both projects |
| In-game screenshots | `reviews/shots-art-roster-e6/e6-roster-desktop.png`, `…-mobile.png` — real chrome/copper/teal Atomic sprites, toaster reads knee-high, glowjack duster with amber glow; fever-accent outline present (expected, `feverAccentState`) |
| Extraction QA | 0 empty cells; key purity/grid/height/no-mirror measured PASS in `assets/raw/codex-art-run-art-batch-roster-e6.md` |

## Merge classification
Direct-on-main art processing — no lane branch, no 3-way. Additive: 24 processed cell PNGs + 3 frames.json (new), `generated.ts` (3-line repoint, path-scoped), `assets/LEDGER.md` (entry 52 → EXTRACTED+WIRED), `tasks/goals.json` (`roster-art-e6-e10` → building, E6 consumed), review + shots, gazette. Raw sheets + reference plates were already committed on main by the runner (`c4868128`); untouched here.

## Findings
- **F-1 (non-blocking, reference-tier duplication):** the recovery pass re-generated `plate-e6-enemy-feral_toaster.png` / `plate-e6-enemy-lawn_shepherd.png` (underscore) because the original hyphen-named reference plates had dropped out of `HEAD`. Both underscore and hyphen raws now coexist in `assets/raw/`; the LEDGER reference-plate rows (#A3 lines 152-153) already cover these enemies as `n/a — no extraction / PENDING-CONSUMPTION`, so no new reference row was added. Harmless duplicate raws; an owner/attended cleanup can drop the stale hyphen copies (rm gated for headless fires).
- **F-2 (no action):** the fever-accent magenta outline visible on the enemies in the shots is `pools.ts feverAccentState` working as designed (E6 appliances are Fevered machines), not an extraction halo — extraction reported 0 near-key / 0 alpha.
