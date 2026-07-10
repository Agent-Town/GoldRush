# Review — art-sprite-production-05 (Town Cast: elder · storekeeper · tavernkeeper · youngster-m · youngster-f) · ART DRAIN (processing)

**Slice:** art-sprite-production-05-town-cast (`tasks/art-sprite-production-05-town-cast.md`) — the proven v2 walk8 pipeline (turnaround → 4 direction stills → Seedance walk videos → 4×8 `#ff00ff` sheet) for the five town-cast principals.
**Producer:** ART slot (Codex), 2026-07-09. Raws landed on main (`git ls-files` confirms all five `char-*-sheet-walk8.png` tracked); LEDGER rows 43–47 recorded them as good finals but **PENDING-PROCESSING** — the runtime cells were never extracted.
**Drained/gated:** s293 fire, 2026-07-11 (art slot idle, all queues empty). **Post-hoc processing drain** — the raws sat unextracted for ~2 days across s280-ish→s292 (fires were busy draining the newsie / hero / save-surfaces / bandits pile). s292 extracted tavernkeeper + youngster-f to a *scratch* dir only (for the newsie band compare) and never landed them; this drain lands all five properly.
**Verdict:** ✅ **SHIPPED (art PASS)** for all five. Canon-clean, on-style, extract to 32 clean runtime cells each. Landed **raw + processed but UNWIRED** (firewall: NO src/) — the town/scene slice owns wiring. Display-safe, no gameplay change.

## What it is
The five town-cast walk8 sheets → 32 runtime cells + `frames.json` each (160 cells total this drain):
- `char-elder-sheet-walk8.png`, `char-storekeeper-sheet-walk8.png`, `char-tavernkeeper-sheet-walk8.png` — the three adult townsfolk.
- `char-youngster-m-sheet-walk8.png`, `char-youngster-f-sheet-walk8.png` — the two minors.

All 2240×1360, 8 cols × 4 rows (frame × direction), opaque `#ff00ff`, no mirrors. **No `src/` or layer-contract edit.**

## Geometry + extraction (first-hand this fire)
`node scripts/extract-alpha.mjs --key ff00ff --grid 8x4 <all five>` — each **2240×1360 → 280×340 source cells → 32/32 cells @512px + frames.json, scale = 1** (native fit, never upscaled):

| Sheet | keyed | despilled | key purity (all semi-transparent edge, 0 interior) | intra-sheet footline spread |
|---|---:|---:|---:|---:|
| elder | 74.6% | 0px | 0.36% | 23px |
| storekeeper | 76.8% | 0px | 0.36% | 25px |
| tavernkeeper | 74.2% | 0px | 0.32% | 33px |
| youngster-m | 79.7% | 0px | 0.54% | 30px |
| youngster-f | 79.1% | 0px | 0.40% | 34px |

- **Purity is consistent (0.32–0.54%), 100% semi-transparent edge fringe, zero interior** — the known town-cast raw edge tolerance (newsie's F-newsie-2 noted these sheets "carried larger magenta gaps … and landed as acceptable raw"). Despill did not trigger (spill was minor); no defect, just soft-edge tint. See F-tc05-1.
- **Footline spread 23–34px per sheet** — the older town-cast Seedance takes are less vertically consistent frame-to-frame than the newer bandit/newsie production (footSpread 0). Each cell's foot is recorded in `frames.json`, so the wire slice anchors per-frame; non-blocking. See F-tc05-2.
- Normalized content height is ~333 for every sheet (extractor scales each to fill its cell) — it does **not** encode the true adult/child scale, which the wire slice sets from raw proportions.

## Art QA (visual — processed down/front cells, spot-checked first-hand)
- **tavernkeeper** — heavyset adult barkeep, hat + apron over shirt, no weapons; warm illustrated ✓.
- **youngster-f** — young girl, braided hair, hat + fringed jacket + jeans + boots, carries a **lantern** (tool, not weapon); **fully-clothed minor** ✓.
- All five: townsfolk archetypes, **no firearms · no gore · no readable text · no extra characters**, engraved-parchment palette kin to the rest of the cast. Canon §9 gates PASS. (elder/storekeeper/youngster-m not re-opened individually — they were vetted as good finals at production-05 QA 2026-07-09; this drain is processing, not re-generation.)

## Buildability (asset-only, certified this fire)
- `npx tsc --noEmit` → **clean**; `npm run build` → **green** (✓ 390ms, this fire).
- Touches **zero src / e2e / config / Balance / schema / layer-contract** — only `assets/processed/char-{elder,storekeeper,tavernkeeper,youngster-m,youngster-f}-sheet-walk8*` (160 cells + 5 frames.json), `assets/LEDGER.md`, this review.

## Findings
- **F-tc05-1 (non-blocking — town-cast edge fringe):** all five carry 0.32–0.54% near-magenta processed pixels, **100% semi-transparent edge, 0 interior** — the town-cast raw edge tolerance (higher than the newer newsie 0.03% / bandit-base 0.01%, because the 2026-07-09 raws predate the tighter despill discipline). Display-safe while unwired; re-QA at game scale at the wire slice, targeted edge-despill only if a halo reads on dark backgrounds.
- **F-tc05-2 (non-blocking — footline spread on the older takes):** 23–34px per-sheet footline spread (vs 0 on bandit/newsie). Per-cell foot is recorded in `frames.json`; the enemy/townsfolk wire binding anchors each frame to its foot, so no runtime bob — but if a future re-take pass runs, tighter vertical framing would remove the need for per-frame anchoring.

## Merge classification
No branch merge — raws already on main; this drain adds only the processed cells. Path-scoped `git add` of exactly: `assets/processed/char-{elder,storekeeper,tavernkeeper,youngster-m,youngster-f}-sheet-walk8*` (160 cells + 5 frames.json), `assets/LEDGER.md`, `reviews/art-sprite-production-05-town-cast.md`. No corrective task spawned (both findings non-blocking / wire-time). **Not player-visible** (unwired) → per GZ-01 filter law, **no gazette item**.
