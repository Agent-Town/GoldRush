# Review — art-batch-roster-e9 (E9 Red Fields enemy walk8 sprites: extract + wire)

**Slice:** art-batch-roster-e9 — extract the E9 non-boss enemy walk8 sheets and swap the two E9-01 scaffold roster enemies (`feral_terraformer` / `claim_jump_prospect_drone`) off the bandit placeholder onto real art. `dust_devil` was over-generated in the same batch (it is an E9 *hazard*, never an `enemyRoster` row — spec) → RAW-PENDING, not extracted-to-wiring this drain. `old_digger` boss was correctly excluded by the batch (shipped boss system).
**Slot / source:** ART slot. Raws produced by the runner (`art--20260720-210738-art-batch-roster-e9`, done-move `tasks/done/20260720-210738-art-batch-roster-e9.md`) into the plain `worktrees/art/assets/raw/` dir (per house law art raws land in the plain art dir; extraction is the fire/attended step). This is the fire-side EXTRACTION + WIRING drain (the task master says "NO extraction, processing, or runtime wiring" — that is this step).
**Drained by:** s770 fire, directly on main (no lane branch — main-slot art processing).
**Verdict:** ✅ MERGE — real E9 enemy art renders via harness spawn, desktop + 390-mobile, zero console/page errors. Not yet seen in a plain E9 boot (F-2, carried from E9-01).

## What it does
The two Red Fields roster enemies wired by the E9-01 scaffold (`da96e6ce`) — the **Faithful (Feral) Terraformer** (house-sized brass old canal-correction craft: cutting chassis + caterpillar tread, rugged wheels, raised survey gantry/drill arm, amber work lamp, restrained teal correction accents — a machine, not a creature, no firearms) and the **Claim-Jump Prospect Drone** (small brass/regolith crow-like survey drone, one teal sensor eye, blank folding claim tag) — were wired as `twist.enemyRoster` rows but rendered the **bandit placeholder** (`generated.ts` pointed both E9 slots at `char-bandit-base-sheet-walk8-r0c0.png`; `pools.ts` held `placeholder:true`). This drain lands their real engraved-warm art: each now walks its own Red Fields silhouette. Per `specs/enemy-rosters-e6-e10.md` NO-BLOCKER LAW (owner 2026-07-18: "you can wire things in game, I just correct them later") this ships without an owner-review gate; corrections land post-hoc at the one art seam (slot → sheet).

## How it was done
- `node scripts/extract-alpha.mjs --key ff00ff --grid 4x2` on `char-e9-feral_terraformer-sheet-walk8.png` (2016x1224, 504x612 cells) + `char-e9-claim_jump_prospect_drone-sheet-walk8.png` (504x306, 126x153 cells)
  → 8/8 non-empty cells each @512px + `<base>.frames.json` in `assets/processed/` (16 new cells + 2 json). terraformer keyed 75.8% / despilled 37258px; drone keyed 79.2% / despilled 3522px. Extracted `-r0c0` cells inspected directly: **halo-free**, canon-compliant (frontier-tech, warm engraved illustration, no firearms, no gore, no letters — Terraformer is mechanical/full-bleed-machine, Drone carries a blank folding tag).
- The pre-existing wiring in `src/entities/pools.ts:119-130` (`import.meta.glob('char-e9-*-sheet-walk8-r*c*.png')` + `e9EnemySpriteBinding()`) auto-activates once all 8 cells per sheet exist: `placeholder` computes false → `createEnemySpritePresentation(…, false)` uses the real sprite. **No src wiring authored** — only the cells were missing.
- `src/assets/generated.ts:20-21`: repointed the two E9 slot fallbacks off `char-bandit-base-…-r0c0` onto each enemy's own `char-e9-<id>-sheet-walk8-r0c0.png`, matching the E6/E7/E8/E2-enemy pattern.
- `e2e/e9-roster.spec.ts:152-153`: the scaffold pinned `placeholder: true` (correct pre-art); flipped both to `placeholder: false` to pin the now-correct real-art state (a stronger regression guard — a lost-cells regression would flip it back to true and fail).
- Source sheets (all 3, incl. `dust_devil`) + the QA run file + the terraformer plate landed into tracked `assets/raw/` for reproducibility (s765 precedent).

## Evidence
| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✓ clean |
| `npm run build` | ✓ green, 1.16s |
| `e2e/e9-roster.spec.ts` (slice spec) | ✓ 6/6 — desktop-chrome + mobile-chrome (23.9s), incl. no-debug plain-boot probe :167, siege/thief flags, era-gating |
| `e2e/e8-roster.spec.ts` + `e2e/e7-roster.spec.ts` + `e2e/e6-roster.spec.ts` (adjacent, regression) | ✓ 18/18 both projects single-worker (1.7m) — E8+E7+E6 NOT regressed |
| Binding state (in-page probe, both projects) | `placeholder: false` for feral_terraformer + claim_jump_prospect_drone |
| Boot probe zero-errors | `{console: [], page: []}` both projects (:167 plain Red Fields boot) |
| In-game screenshots (harness spawn) | `reviews/shots-art-roster-e9/e9-roster-desktop.png`, `…-mobile.png` — real brass canal-craft Terraformer renders; fever-accent cast present (expected, `feverAccentState`) |
| Extraction QA | 0 empty cells; key purity/grid/height/no-mirror measured PASS in `assets/raw/codex-art-run-art-batch-roster-e9.md` (0 retakes on the drone sheet; Terraformer had 1 pre-accept retake for a stronger silhouette) |

## Merge classification
Direct-on-main art processing — no lane branch, no 3-way. Additive: 16 processed cell PNGs + 2 frames.json (new), 5 tracked source raws (3 char sheets + run file + terraformer plate — new), `generated.ts` (2-line repoint, path-scoped), `e2e/e9-roster.spec.ts` (2 assertion flips), `assets/LEDGER.md` (entry 56 → EXTRACTED+WIRED), `tasks/goals.json` (`roster-art-e6-e10` note → E9 consumed), review + shots + scratch config. Contract/boss/still plates + the `dust_devil` sheet left as raw for their own drains.

## Findings
- **F-1 (non-blocking, E6/E7/E8 precedent — no action):** the magenta cast on the enemies in the shots is renderer-side `pools.ts feverAccentState` (active for all alive non-boss enemies — E1 bandits and the E9 bandit-placeholder had it too, before the swap), NOT an extraction halo — the extracted cells are proven clean by direct inspection. Same as the E6/E7/E8 drains.
- **F-2 (non-blocking, downstream content gap, carried from E9-01):** these real sprites are not yet visible in a plain E9 boot — the E9 roster fields only via the debug harness / `?contract=…` param (the plain Red Fields boot test at :167 asserts error-free boot, not roster visibility). Same as E7-01/E8-01's F-2; no gazette this drain (matches s769's E9-01 "harness-only" call). The art + wiring will gazette together when the E9 map/wave slice makes them appear in normal play.
- **F-3 (informational):** `dust_devil` (rust-red hatch-spiral hazard) sheet was over-generated by this batch ahead of its own E9 *hazard* slice (it is never an `enemyRoster` row per spec — same shape as E7's `static_hare` and E8's `debris_rain` deferrals). Its raw is retained in `assets/raw/char-e9-dust_devil-sheet-walk8.png` and will be extracted when the hazard slice wires it (art-leads-wiring is fine — filename convention stays consistent).
- **F-4 (informational, carried OWNER FORK from E8-01):** the corsair↔Salvage-Claw-crew `variantId` collision in `e8-mare-claim` (E8-01 review F-1) remains on the owner's desk, unaffected by this E9 art drain. NO E9 equivalent collision — `OldDiggerBossSystem` uses a distinct `maintenance_drone` crew id disjoint from both E9 roster ids (verified at the E9-01 drain, `da96e6ce`).
