# Review — art-batch-roster-e7 (E7 Signal-era enemy walk8 sprites: extract + wire)

**Slice:** art-batch-roster-e7 — extract the E7 non-boss enemy walk8 sheets and swap the two E7-01 scaffold roster enemies (`rogue_automaton` / `data_rustler`) off the bandit placeholder onto real art. `static_hare` was over-generated in the same batch (its wiring is E7-02, unwired) → RAW-PENDING, not extracted this drain.
**Slot / source:** ART slot. Raws produced by the runner into the plain art dir `worktrees/art/assets/raw/` (`runner(art) a1203789` swept only churn — per house law art raws are NOT auto-committed; the runner commit touched archive/scratch + logs only). This is the fire-side EXTRACTION + WIRING drain (the task master says "NO extraction — fire/attended runs extract-alpha").
**Drained by:** s765 fire, directly on main (no lane branch — main-slot art processing).
**Verdict:** ✅ MERGE — real E7 enemy art renders via harness spawn, desktop + 390-mobile, zero console/page errors. Not yet seen in a plain E7 boot (F-2, carried from E7-01).

## What it does
The two Signal-era roster enemies wired by the E7-01 scaffold (`b6b8a4be`) — the **Rogue Automaton** (adult-band brass-and-teal agent-frame machine with punched-tape loops) and the **Data-Rustler** (frontier company signal thief with crystal-set backpack, relay tools — no firearms) — were wired as `twist.enemyRoster` rows but rendered the **bandit placeholder** (`generated.ts` pointed both E7 slots at `char-bandit-base-sheet-walk8-r0c0.png`; `pools.ts` held `placeholder:true`). This drain lands their real engraved-warm art: each now walks its own Signal-era silhouette. Per `specs/enemy-rosters-e6-e10.md` NO-BLOCKER LAW (owner 2026-07-18: "you can wire things in game, I just correct them later") this ships without an owner-review gate; corrections land post-hoc at the one art seam (slot → sheet).

## How it was done
- `node scripts/extract-alpha.mjs --key ff00ff --grid 4x2` on `char-e7-rogue_automaton-sheet-walk8.png` + `char-e7-data_rustler-sheet-walk8.png` (1120x680, 280x340 cells)
  → 8/8 non-empty cells each @512px + `<base>.frames.json` in `assets/processed/` (16 new cells + 2 json). rogue keyed 68.7% / despilled 21947px; rustler keyed 68.7% / despilled 15466px. Extracted `-r0c0` cells inspected directly: **halo-free**, canon-compliant (frontier-tech, no firearms, warm not gory, no letters).
- The pre-existing wiring in `src/entities/pools.ts:87-100` (`import.meta.glob('char-e7-*-sheet-walk8-r*c*.png')` + `e7EnemySpriteBinding()`) auto-activates once all 8 cells per sheet exist: `placeholder` computes false → `createEnemySpritePresentation(…, false)` uses the real sprite. **No src wiring authored** — only the cells were missing.
- `src/assets/generated.ts:16-17`: repointed the two E7 slot fallbacks off `char-bandit-base-…-r0c0` onto each enemy's own `char-e7-<id>-sheet-walk8-r0c0.png`, matching the E6/E2-enemy pattern.
- `e2e/e7-roster.spec.ts:135`: the scaffold pinned `placeholder: true` (correct pre-art); flipped to `placeholder: false` to pin the now-correct real-art state (a stronger regression guard than E6's tolerant `expect.any(Boolean)` — a lost-cells regression would flip it back to true and fail).

## Evidence
| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✓ clean |
| `npm run build` | ✓ green, 1.01s |
| `e2e/e7-roster.spec.ts` (slice spec) | ✓ 6/6 — desktop-chrome + mobile-chrome single-worker (21.5s), incl. no-debug plain-boot probe :158 |
| `e2e/e6-roster.spec.ts` (adjacent, regression) | ✓ 6/6 both projects single-worker (59.5s) — E6 NOT regressed; batched run threw 2 contention reds on *different* lines each pass (:52/:79 then :112 vs prior), isolated green = false-reds |
| Binding state (in-page probe, both projects) | `placeholder: false` for rogue_automaton + data_rustler |
| Boot probe zero-errors | `{console: [], page: []}` both projects |
| In-game screenshots (harness spawn) | `reviews/shots-art-roster-e7/e7-roster-desktop.png`, `…-mobile.png` — real brass/teal Rogue Automaton + sepia signal-thief Data-Rustler render; fever-accent cast present (expected, `feverAccentState`) |
| Extraction QA | 0 empty cells; key purity/grid/height/no-mirror measured PASS in `assets/raw/codex-art-run-art-batch-roster-e7.md` (0 retakes all 3 sheets) |

## Merge classification
Direct-on-main art processing — no lane branch, no 3-way. Additive: 16 processed cell PNGs + 2 frames.json (new), `generated.ts` (2-line repoint, path-scoped), `e2e/e7-roster.spec.ts` (1 assertion flip), `assets/LEDGER.md` (entry 54 → EXTRACTED+WIRED), `tasks/goals.json` (`roster-art-e6-e10` note → E7 consumed), review + shots. This drain also lands the 3 batch source sheets + QA run file into tracked `assets/raw/` (the runner left them in the plain art dir) so re-extraction is reproducible and the LEDGER references resolve. Contract/boss plates (`plate-contract-e7-*`, `plate-e7-boss-the-echo`) left in `worktrees/art/` for their own drains.

## Findings
- **F-1 (non-blocking, E6 precedent — no action):** the magenta cast on the enemies in the shots is renderer-side `pools.ts feverAccentState` (active for all alive non-boss enemies — E1 bandits and the E7 bandit-placeholder had it too, before the swap), NOT an extraction halo — the extracted cells are proven clean by direct inspection. Same as the E6 drain's F-2.
- **F-2 (non-blocking, downstream content gap, carried from E7-01):** these real sprites are not yet visible in a plain E7 boot — E7 contracts route to the Signal fallback map (empty `harvestAnchors`, `ContractFamilies.ts:1125`), so the enemies field only via the debug harness until the E7-map/harvestAnchors slice lands. No gazette this drain (matches s764's E7-01 "not player-visible yet" call); the art + wiring will gazette together when the E7 map slice makes them appear in normal play.
- **F-3 (informational):** `static_hare` (0.35x flock) sheet was over-generated by this batch ahead of its E7-02 wiring. Its raw is retained in `assets/raw/char-e7-static_hare-sheet-walk8.png` and will be extracted when E7-02 wires the slot (art-leads-wiring is fine — filename convention stays consistent).
