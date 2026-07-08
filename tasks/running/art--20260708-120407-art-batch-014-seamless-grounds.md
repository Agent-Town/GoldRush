# Task art-batch-014: seamless grounds — textures that wrap perfectly into themselves (ART slot, gpt-image-2)

You are Codex on Robin's Mac with the image_gen skill. Art pipeline per CLAUDE.md §8 + assets/LEDGER.md ({ANCHOR} verbatim). OWNER FINDING (2026-07-08 ~12:05): "the tile hard breaks at its borders… if we can solve this by using one tile that continues seamless to itself" — the current ground textures were never generated tileable; this batch replaces the CORE GROUND SET with verified edge-wrapping versions.

## Deliverables (full-bleed squares, NO magenta; every prompt MUST include: "perfectly seamless tileable texture, all four edges wrap exactly, no visible border, no vignette, uniform lighting, top-down")
1. `assets/raw/ter-sand-seamless-a.png` — the claim's packed desert sand: fine gravel, subtle pebbles, faint dry cracks. {ANCHOR}
2. `assets/raw/ter-sand-seamless-b.png` — variant: slightly rougher, sparse tufts of dry grass stubble (for anti-tiling variation pairing). {ANCHOR}
3. `assets/raw/ter-mesa-seamless.png` — the Gulch's red-rock mesa ground: ochre dust over cracked hardpan. {ANCHOR}
4. `assets/raw/ter-bank-damp-seamless.png` — damp riverbank earth: darker, water-stained, small smooth stones. {ANCHOR}
5. `assets/raw/ter-scrub-seamless.png` — scrubland mix: sand with moss-dry patches (splat mid-layer). {ANCHOR}

## THE WRAP QA (the batch's whole point — per texture, MEASURED)
Composite a 2×2 self-tiling of each output and inspect the cross seams at 100%: state PASS/FAIL per edge pair ("left-right wrap: no visible discontinuity"). A texture failing wrap gets its retake (≤2) with strengthened seamless prompting; persistent failure = ledger it honestly as NEEDS-PROCESSING (a wrap-blend pass fire-side) rather than shipping a fake pass. Also: value-range vs the existing sand band (shader cross-blends — measure min/max luminance), no directional lighting bake (top-down flat light), no letters.

LEDGER batch-014 rows + run file `codex-art-run-011.md` (prompts verbatim, the 2×2 wrap verdicts, retakes). NO processing, NO src/. No commits.
End: READY-FOR-GATES + the wrap-QA table.
