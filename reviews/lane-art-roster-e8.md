# Review — art-batch-roster-e8 (E8 Orbital-era enemy walk8 sprites: extract + wire)

**Slice:** art-batch-roster-e8 — extract the E8 non-boss enemy walk8 sheets and swap the two E8-01 scaffold roster enemies (`scrap_corsair` / `sun_glare_shambler`) off the bandit placeholder onto real art. `debris_rain` was over-generated in the same batch (it is an E8 *hazard*, never an `enemyRoster` row — spec) → RAW-PENDING, not extracted this drain.
**Slot / source:** ART slot. Raws produced by the runner (`runner(art) b85adbe7 — art-batch-roster-e8`) into tracked `assets/raw/` (the runner committed the 3 sheets + 3 stills + run file; per house law art raws are landed, extraction is the fire/attended step). This is the fire-side EXTRACTION + WIRING drain (the task master says "NO extraction — fire/attended runs extract-alpha").
**Drained by:** s769 fire, directly on main (no lane branch — main-slot art processing).
**Verdict:** ✅ MERGE — real E8 enemy art renders via harness spawn, desktop + 390-mobile, zero console/page errors. Not yet seen in a plain E8 boot (F-2, carried from E8-01).

## What it does
The two Orbital-era roster enemies wired by the E8-01 scaffold (`7a51f8b8`) — the **Scrap Corsair** (sealed silver-and-teal vacuum suit, brass joints, magnet gaff, blank pictogram tag — no firearms) and the **Sun-Glare Shambler** (squat brass lunar rover, jointed legs, one amber eye, over-bright sunward panel) — were wired as `twist.enemyRoster` rows but rendered the **bandit placeholder** (`generated.ts` pointed both E8 slots at `char-bandit-base-sheet-walk8-r0c0.png`; `pools.ts` held `placeholder:true`). This drain lands their real engraved-warm art: each now walks its own Orbital-era silhouette. Per `specs/enemy-rosters-e6-e10.md` NO-BLOCKER LAW (owner 2026-07-18: "you can wire things in game, I just correct them later") this ships without an owner-review gate; corrections land post-hoc at the one art seam (slot → sheet).

## How it was done
- `node scripts/extract-alpha.mjs --key ff00ff --grid 4x2` on `char-e8-scrap_corsair-sheet-walk8.png` + `char-e8-sun_glare_shambler-sheet-walk8.png` (1120x680, 280x340 cells)
  → 8/8 non-empty cells each @512px + `<base>.frames.json` in `assets/processed/` (16 new cells + 2 json). corsair keyed 60.3% / despilled 20014px; shambler keyed 76.3% / despilled 10461px. Extracted `-r0c0` cells inspected directly: **halo-free**, canon-compliant (frontier-tech, magnet gaff not a firearm, warm not gory, no letters).
- The pre-existing wiring in `src/entities/pools.ts:103-116` (`import.meta.glob('char-e8-*-sheet-walk8-r*c*.png')` + `e8EnemySpriteBinding()`) auto-activates once all 8 cells per sheet exist: `placeholder` computes false → `createEnemySpritePresentation(…, false)` uses the real sprite. **No src wiring authored** — only the cells were missing.
- `src/assets/generated.ts:19-20`: repointed the two E8 slot fallbacks off `char-bandit-base-…-r0c0` onto each enemy's own `char-e8-<id>-sheet-walk8-r0c0.png`, matching the E6/E7/E2-enemy pattern.
- `e2e/e8-roster.spec.ts:141-142`: the scaffold pinned `placeholder: true` (correct pre-art); flipped both to `placeholder: false` to pin the now-correct real-art state (a stronger regression guard — a lost-cells regression would flip it back to true and fail).

## Evidence
| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✓ clean |
| `npm run build` | ✓ green, 918ms |
| `e2e/e8-roster.spec.ts` (slice spec) | ✓ 6/6 — desktop-chrome + mobile-chrome (16.6s), incl. no-debug plain-boot probe :166, draw-call budget, and e8-arsenal fires |
| `e2e/e7-roster.spec.ts` + `e2e/e6-roster.spec.ts` (adjacent, regression) | ✓ 12/12 both projects single-worker (1.5m) — E7+E6 NOT regressed |
| Binding state (in-page probe, both projects) | `placeholder: false` for scrap_corsair + sun_glare_shambler |
| Boot probe zero-errors | `{console: [], page: []}` both projects |
| In-game screenshots (harness spawn) | `reviews/shots-art-roster-e8/e8-roster-desktop.png`, `…-mobile.png` — real vacuum-suit Corsair + brass jointed-leg Shambler render; fever-accent cast present (expected, `feverAccentState`) |
| Extraction QA | 0 empty cells; key purity/grid/height/no-mirror measured PASS in `assets/raw/codex-art-run-art-batch-roster-e8.md` (0 retakes on both wired sheets; Corsair had 1 pre-accept retake) |

## Merge classification
Direct-on-main art processing — no lane branch, no 3-way. Additive: 16 processed cell PNGs + 2 frames.json (new), `generated.ts` (2-line repoint, path-scoped), `e2e/e8-roster.spec.ts` (2 assertion flips), `assets/LEDGER.md` (entry 55 → EXTRACTED+WIRED), `tasks/goals.json` (`roster-art-e6-e10` note → E8 consumed), review + shots + scratch config. Contract/boss/still plates + the `debris_rain` sheet left in `assets/raw/` for their own drains.

## Findings
- **F-1 (non-blocking, E6/E7 precedent — no action):** the magenta cast on the enemies in the shots is renderer-side `pools.ts feverAccentState` (active for all alive non-boss enemies — E1 bandits and the E8 bandit-placeholder had it too, before the swap), NOT an extraction halo — the extracted cells are proven clean by direct inspection. Same as the E6/E7 drains.
- **F-2 (non-blocking, downstream content gap, carried from E8-01):** these real sprites are not yet visible in a plain E8 boot — the E8 roster fields only via the debug harness / `?contract=…&nowaves` param (the plain Orbital-era boot test at :166 asserts error-free boot, not roster visibility). Same as E7-01's F-2; no gazette this drain (matches s767's E8-01 "not player-visible in a plain boot" call). The art + wiring will gazette together when the E8 map/wave slice makes them appear in normal play.
- **F-3 (informational):** `debris_rain` (0.25-0.75x staged debris cluster) sheet was over-generated by this batch ahead of its own E8 *hazard* slice (it is never an `enemyRoster` row per spec — same shape as E7's `static_hare` deferral). Its raw is retained in `assets/raw/char-e8-debris_rain-sheet-walk8.png` and will be extracted when the hazard slice wires it (art-leads-wiring is fine — filename convention stays consistent).
- **F-4 (informational, carried OWNER FORK from E8-01):** `scrap_corsair` shares `variantId` with the Salvage Claw boss's rappelling crew in `e8-mare-claim` (E8-01 review F-1) — an owner fork still on the desk, unaffected by this art drain (art swap does not touch the collision).
