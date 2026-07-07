# Task art-batch-009: title emblem + menu backdrop (ART slot, gpt-image-2)

You are Codex on Robin's Mac with the image_gen skill (gpt-image-2). Art pipeline v2 per CLAUDE.md §7 + assets/LEDGER.md header. Style anchors: docs/GOLD_RUSH_BRIEF.md §4.1 — NOTE the split: these are **"Frontier Storybook" SHELL surfaces** (the game's frame/menu identity), warmer and more composed than the in-game Ledger cutouts. Canon §9 (never gory; no firearms; naming §9.4).

GOAL: the game gets a face — start-screen art. Owner directive 2026-07-07: "make a logo for the game start screen, make a good menu." STRATEGY: the WORDMARK ("GOLD RUSH") is typeset in code with the canonical Storybook typography (§4.2) — crisp at every size, no generated text. This batch generates the ART around it.

## Generations (3 total)
1. **Title emblem** `ui-title-emblem.png`: a badge/crest composition — a brass prospector's pan catching glinting gold, crossed with a teal-glowing agent-tech rod, framed by a rope-and-timber ring with a small river-valley vignette at its base; engraved-illustration Storybook style, parchment-warm palette with the teal accent; reads at 128px AND 512px (verify both in QA); flat #ff00ff background for extraction; NO text/letters anywhere.
2. **Menu backdrop** `ui-menu-backdrop.png`: full-bleed 16:9 painted scene — the river claim at golden hour seen from the bluff (the game's own valley: river, ford, sluice works, palisade line, distant town hints), soft vignette edges darkening toward the frame so menu text sits readably on the left third; Storybook warmth, engraved texture, NO text, NO characters in focus (silhouettes at most). Full-bleed: NO magenta, deliver as-is.
3. **Menu panel texture** `ui-menu-panel.png`: a clean parchment/ledger panel tile (subtle paper grain, darkened ink edge border) for menu buttons/cards, tileable-ish, no text; full-bleed.

## Generator self-QA (measured, before the run file)
Emblem: silhouette reads at 128px (describe it); magenta pure for --key extraction; no letterforms. Backdrop: left third luminance low enough for parchment-light text overlay (state measured approximate luminance); horizon/composition per §4.3 layout laws. All: palette within Storybook warmth + teal accent, no gore/firearms.

## Deliverables
Raws at exact paths in /Users/robin/Claude/Projects/Gold Rush/assets/raw/ + run file assets/requests/codex-art-run-006.md (prompts, retries, QA notes). LEDGER.md: batch-009 entry (title/menu — pairs with task 044 start-screen), slots PENDING-PROCESSING (contract: ui.v1 or new ui contract file — note for the fire). DO NOT extract/process, DO NOT touch src/. No commits.
