# Task art-batch-011: E1 contract roster art — the Baron + props (ART slot, gpt-image-2)

You are Codex on Robin's Mac with the image_gen skill. Art pipeline per CLAUDE.md §8 + assets/LEDGER.md header ({ANCHOR} = the style-anchor sentence there, verbatim in EVERY prompt).

**THE PROMPTS ARE WRITTEN — execute `specs/e1-contracts/README.md` §Art manifest, entries 1–5 exactly** (Baron walk4 sheets a+b, baron banner, spring pond decal, lantern post). Grids/cells as specified: walk4 = 4×4 (down/left/right/up rows, 4 frames), #ff00ff background on all sheet/cell entries, spring-pond is FULL-BLEED (no magenta), NO mirrored frames anywhere.

## Deliverables
Raws at `assets/raw/<exact filenames from the manifest>` + run file `assets/requests/codex-art-run-008.md` (prompts used verbatim, retries, measured self-QA per entry: Baron height ≈1.4× char-jumper cell height measured in px, magenta purity, grid alignment, no letters). LEDGER.md: batch-011 entry (E1 contract roster; NOTE: E2 drip renumbers to 012+) + slot rows PENDING-PROCESSING. DO NOT extract/process (fire-side), DO NOT touch src/ or specs. No commits. ≤2 retries per entry, failures ledgered honestly.
End: READY-FOR-GATES + per-entry QA table.
