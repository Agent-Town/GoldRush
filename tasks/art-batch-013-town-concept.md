> ⛔ **SHIPPED (reference tier, unreachable BY DESIGN) — DO NOT QUEUE (Mistake #8 guard, content-probed s1132 2026-07-27).** Done-move `tasks/failed/drained-s138-art-batch-013-already-merged-ba1945c.md`. All four raws are present — `concept-town-square`, `ter-plaza-ground`, `prop-town-dressing`, `prop-town-lamps` — with run file `assets/requests/codex-art-run-010.md` and `LEDGER.md:241` entry 15 (*"RAW GENERATED 2026-07-07"*) plus slot rows `:191,:192,:198,:199`. ⚠️ **Zero `src/` references by design** (reference tier; only `e2e/town-t5-townsfolk.spec.ts:9` reads `concept-town-square`), and LEDGER marks all four PENDING-PROCESSING/PENDING-INTEGRATION — that is the tier's normal state, not a defect. See F-1132-17.

# Task art-batch-013: the town concept plate + plaza dressing (ART slot, gpt-image-2)

You are Codex on Robin's Mac with the image_gen skill. Art pipeline per CLAUDE.md §8 + assets/LEDGER.md ({ANCHOR} verbatim in every prompt). READ FIRST: specs/town-v1/README.md (the square: tavern, claim office, schoolhouse, assay office; intimate ~30×30); the EXISTING processed bld-* art (assets/processed — the concept must MATCH these buildings, reference-condition on them where the tool allows).

## Why (owner idea 2026-07-07 ~19:20: "Maybe Codex image gen can generate an image for parts of it and then they could be used as inspiration")
T1's square is placeholder-law rudimentary. This batch produces (1) THE TARGET — a concept plate that art-directs every town polish task, and (2) the plaza dressing pieces the square is missing.

## Deliverables
1. `assets/raw/concept-town-square.png` — **full-bleed concept plate, 16:9**: the town square at golden hour seen from the gameplay camera angle (high oblique) — tavern with warm windows, claim office with its ledger-post, schoolhouse with the Elder's chart visible through a window, assay office porch; packed-earth plaza with boardwalk runs; two townsfolk mid-errand + the Prospector idling near the claim office; warm parchment palette, engraved-illustration feel. THIS IS THE ART-DIRECTION REFERENCE, not an in-game asset — compose freely but keep every building consistent with the existing processed bld-* sprites (reference-condition on bld-tavern.png + bld-claim-office.png + bld-schoolhouse.png). NO text/letters. {ANCHOR}
2. `assets/raw/ter-plaza-ground.png` — full-bleed tileable square: packed-earth plaza texture with subtle boardwalk-plank runs and wheel ruts, value range within the existing sand atlas band (measure + state min/max luminance). {ANCHOR}
3. `assets/raw/prop-town-dressing.png` — #ff00ff sheet, explicit 3×2 grid, NO mirrors: hitching post · water trough · rain barrel · notice-post (blank board, no letters) · crate stack · town well. {ANCHOR}
4. `assets/raw/prop-town-lamps.png` — #ff00ff sheet, 2×1 grid: twin oil-lamp posts (unlit; glow is engine-side — these double for Night Shift). {ANCHOR}

Self-QA per entry (run file `assets/requests/codex-art-run-010.md`): building consistency vs processed bld-* stated per-building · plaza tileability check (edge-wrap seam note) · prop heights vs townsfolk band measured · magenta purity · no letters anywhere. LEDGER batch-013 entry + rows. ≤2 retakes each; NO processing, NO src/; no commits.
End: READY-FOR-GATES + QA table.
