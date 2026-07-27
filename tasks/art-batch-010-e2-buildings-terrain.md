> ⛔ **SUPERSEDED (5 of 7 shipped, 2 replaced by 3D) — DO NOT QUEUE (Mistake #8 guard, content-probed s1132 2026-07-27).** Done-move `tasks/failed/partial-s1065-20260707-111250-art-batch-010-5of7-hillmine-atlas+minehead-NEVER-GENERATED.md`. Present in raw + processed: `bld-boiler-house`, `bld-machine-shop`, `bld-rail-depot`, `bld-stamp-mill`, `ter-rail-elements` — credited to codex-art-run-016 at `LEDGER.md:124`, PROCESSED at `LEDGER.md:285-287`. The two absent atoms (`ter-hillmine-atlas`, `prop-minehead`) are **superseded by the 3D sculpt**: `assets/pilots/map-rebuild-spike/hill-mine-{terrain,panorama}.glb` and `landmarks/hill-mine/{boiler-house-site,flooded-gallery}.glb`. ⚠️ Reachability, stated honestly: `bld-boiler-house` is live via `src/ui/BuildButton.ts:12`; rail-depot and machine-shop are registered in `e2-steamworks.v1.json` with **no live consumer**. See F-1132-17.

# Task art-batch-010: E2 Steamworks — buildings + Hill Mine terrain (ART slot, gpt-image-2)

You are Codex on Robin's Mac with the image_gen skill (gpt-image-2). Art pipeline v2 per CLAUDE.md §8 + assets/LEDGER.md header.

**THE PROMPTS ARE ALREADY WRITTEN — do not improvise.** Execute `specs/epoch-saga/e2-steamworks-bundle.md` §A1 (new buildings 1–4: bld-boiler-house, bld-stamp-mill, bld-rail-depot, bld-machine-shop — full prompt paragraphs there, {ANCHOR} substitution as defined at that file's top) and §A5 (terrain & props 1–3: ter-hillmine-atlas, ter-rail-elements, prop-minehead — grids/cells as specified). Reference-condition per each entry's instruction. This is the E2 drip's first batch, started deliberately ahead of the epoch's build window (Template Law lead time).

## Deliverables
Raws at the exact absolute paths the bundle names (assets/raw/) + run file `assets/requests/codex-art-run-007.md` (prompts used verbatim + retries + the MEASURED self-QA per the bundle's QA notes: scale bands vs existing processed art, magenta purity, grid alignment, no letters). LEDGER.md: batch-010 entry (E2 drip 1/3; batches 011–012 follow per the bundle's plan), slot rows PENDING-PROCESSING. DO NOT extract/process (fire-side), DO NOT touch src/ or contracts. No commits.

## Self-QA additions for this batch
- The stamp mill's five stamps must read as distinct verticals at 25% zoom (state it).
- ter-hillmine-atlas value range must sit within the E1 sand atlas's range (shader cross-blends epochs — measure approximate min/max luminance and state them).
- Reject + retry a generation at most twice; failures written honestly to the run file.
