# Review — art-sprite-production-07 (Mei the Newsie) · ART DRAIN

**Slice:** art-sprite-production-07-newsie (`tasks/art-sprite-production-07-newsie.md`) — walk8 turnaround + Seedance production for **Mei the Newsie**, a NEW named principal (girl ~10-12, Chinese-American gold-rush heritage honored warmly; RULED 2026-07-10, `lore/characters.md` §THE NEWSIE). v2 pipeline template = `tasks/art-sprite-production-05-town-cast.md`.
**Producer:** ART slot (Codex), raws generated in `worktrees/art/` (done-move `tasks/done/20260710-213933-art-sprite-production-07-newsie.md`).
**Drained/gated:** s292 fire, 2026-07-10 (art slot idle, `tasks/running/` empty — no live-runner collision; F-080b-2 avoided).
**Verdict:** ✅ **SHIPPED (art PASS).** Turnaround + walk8 sheet are canon-clean, on-style, and extract cleanly. Landed as **raw + processed but UNWIRED** (firewall: NO src/) — GZ-H1's placeholder tint stands until the scene slice swaps her in. Display-safe, no gameplay change.

## What it is
Mei the Newsie's character art: a 5-angle A-pose turnaround (`assets/raw/turn-newsie-mei.png`) and a 4×8 walk8 sprite sheet (`assets/raw/char-newsie-mei-sheet-walk8.png`, 2240×1360, 280×340 cells, opaque `#ff00ff` key, no mirrors). Produced identity-first: turnaround → 4 direction stills → best-of-available Seedance walk videos → composed sheet. Extracted this drain to 32 runtime cells + a `frames.json`; **no `src/` or layer-contract edit** — she is not yet wired into any scene (the town/scene slice owns that, per the task firewall and GZ-H1).

## Geometry + extraction (first-hand this fire)
- Sheet: `file` → **2240 × 1360, 8-bit RGBA** → 8 cols × 4 rows → **280 × 340 cells** ✓ (spec-exact).
- `node scripts/extract-alpha.mjs --key ff00ff --grid 8x4 assets/raw/char-newsie-mei-sheet-walk8.png` → **32/32 cells @512px + `char-newsie-mei-sheet-walk8.frames.json`**, keyed 81.0%, spill-cleared 485px, **scale = 1** (figure fits the cell natively — never upscaled).

## Seam-law height check (vs the existing walk8 cast band)
Extracted tavernkeeper (adult) + youngster-f (minor) to a scratch dir and compared cell-space content bands (all three `scale=1`, so raw cell content is directly comparable):

| Character | median content height | footline (median bottom) | min top |
|---|---:|---:|---:|
| **newsie (Mei)** | **291** | **334** | 43 |
| youngster-f (minor) | 313 | 333 | 12 |
| tavernkeeper (adult) | 306 | 333 | 12 |

- **Footline aligned** — Mei's feet sit at y≈334 vs the cast's 333 (~1px). No floating/sinking when she stands beside the cast.
- **Height reads correctly for a child** — Mei (291) is the *shortest* of the three, below both the minor youngster-f (313) and the adult (306); head-clearance is generous (top starts at y=43, well inside the cell). **No size-pop risk.** Final on-screen scale is set at wire time in `characters.v2.json`; nothing here can pop until then.

## Art QA (visual inspection — turnaround + processed down/front cell)
- **Fully clothed minor — hard law PASS**: sturdy teal frontier jacket over a shirt, long brown trousers (patched knee), laced boots, dark cap. Nothing exposed in any angle.
- **Identity held across all 5 angles + walk frames**: same girl — cap over a single dark braid, teal charm-less jacket, brown trousers, boots, paper satchel with rolled newsprint. Warm, illustrated, engraved-parchment kin to the town cast.
- **Heritage honored warmly** (canon): natural features, freckles, quick bright expression — **not** caricatured; dignified named-principal read.
- **Satchel side-pinned consistently** across the turnaround (asymmetry law — it does not swap sides / mirror frame-to-frame). See F-newsie-1 for the label nit.
- **No firearms · no gore · no readable text** (the newspapers are abstract newsprint texture, no letters) · **no extra characters**. All canon §9 gates PASS.

## Evidence (RUN-NOTE quoted)
`assets/motion-pilot/production-newsie-mei/RUN-NOTE.md` (promoted to main this drain): turnaround-first PASS; 4 direction stills PASS; selected takes down t2 / left t1 / right t2 / up t1; sheet geometry PASS (4×8, 280×340, 2240×1360, opaque `#ff00ff`). **Credit log:** 339 → 304 (stills) → 160 (8 videos) → **115 final**; Codex correctly honored the <150-credit hard stop by shooting **2 takes/direction** instead of 3 rather than crossing the floor (recorded, in-contract). Contact sheets + generation summary also promoted (`contact-sheets/newsie-mei-stills-contact.png`, `newsie-mei-take-comparison.png`, `logs/newsie-mei-generation-summary.json`, `logs/newsie-mei-walk8-summary.json`).

## Buildability (asset-only, certified this fire)
- `npx tsc --noEmit` → **clean** (TSC_CLEAN).
- `npm run build` → **green** (✓ built in 345ms).
- This drain touches **zero src / e2e / config / Balance / schema / layer-contract** — only `assets/raw`, `assets/processed`, `assets/motion-pilot` (evidence), `assets/LEDGER.md`, this review, `tasks/BACKLOG.md`. tsc/build are trivially unchanged; certified green regardless.

## Findings
- **F-newsie-1 (non-blocking — satchel handedness label, owner/wire-slice eyeball):** the RUN-NOTE pins the satchel to "HER LEFT," but on independent inspection the front + down/front frames read the satchel on the figure's viewer-left (i.e. her *right* hip). It is **consistently** pinned to that same side across all angles (the asymmetry/seam law that matters is satisfied — no side-swap), so this is purely a label/handedness question, not a defect. Canon sets no required side for the satchel. Deferred to the owner's pan verdict / the scene-wire slice, which can flip if the owner wants it truly on her left. Non-blocking for an unwired raw+processed handoff.
- **F-newsie-2 (non-blocking — residual key speckle, matches RUN-NOTE caveat):** processed cells retain **2649 magenta px total across 32 cells = 0.0316% of area** (worst cell `-r1c0` = 234px), concentrated on the held-newspaper edges / hand folds — the RUN-NOTE's declared "few rough edge pixels" caveat. Well below the town-cast raw-handoff tolerance (their sheets carried larger magenta gaps around legs/boots and landed as acceptable raw). The wire slice can re-key or touch up at integration; harmless while unwired.
- **F-newsie-3 (evidence-completeness, non-blocking):** the **full** motion-pilot raw evidence (8 Seedance mp4s, 96 extracted frames, per-take stills + create/generate logs) remains in `worktrees/art/assets/motion-pilot/production-newsie-mei/` — this sandbox cannot recursively copy (`cp -R`/`ditto` are approval-gated headlessly), so only the decision-grade evidence (RUN-NOTE + summary contact sheets + generation/walk8 logs) was promoted to main. A permitted/attended session may `cp -R` the full folder if the owner wants the raw videos/frames tracked in main, matching the town-cast precedent. The evidence chain for THIS verdict is complete in main.

## Merge classification
No branch merge — ART-slot output arrives as files copied from the art worktree into main (not a lane branch). Path-scoped `git add` of exactly: `assets/raw/turn-newsie-mei.png`, `assets/raw/char-newsie-mei-sheet-walk8.png`, `assets/processed/char-newsie-mei-sheet-walk8*.png` (32 cells + frames.json), `assets/motion-pilot/production-newsie-mei/**` (promoted evidence), `assets/LEDGER.md`, `reviews/art-sprite-production-07-newsie.md`, `tasks/BACKLOG.md`. No corrective task spawned (all three findings are non-blocking / owner-eyeball / cleanup-owed). **Not player-visible** (unwired) → per GZ-01 filter law, **no gazette item**.
