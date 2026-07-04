# Robin playtest — M1 visuals round (2026-07-04)

## Verbatim feedback

1. "We need sprite sheets to make the animations better."
2. "The tiles for the floor are highly repetitive, it is a bit boring but much better than before — we can use GPT Image 2.0 here again."

## Orchestrator reading

- Tone positive ("much better than before"). This is VISUAL feedback; it is **not yet the M1 milestone sign-off** — fun verdict on the full loop, Balance-defaults confirm (D2), camera 57°, split_spark same-vs-next-nearest, and beacon cost-curve feel remain open (tracked in STATUS "Robin owes").
- Directive 1 → `specs/visual-polish/slices/02-sprite-animation.md`. Approach: **pose-swap frames (2–4 per character), not dense sheet grids** — GPT Image 2.0 frame-to-frame consistency is the known weak point; few-frame pose swaps match the illustrated Frontier Ledger look (storybook flipbook) and are reliably generatable. Contract supports real N-frame sheets later without rework.
- Directive 2 → `specs/visual-polish/slices/03-terrain-variety.md` (code: variant sampler + rotation/mirror + macro tint — kills repetition even with ONE tile) + batch-003 art (2 extra bank variants + seamless-ified river check). Placeholder-first: code lands before art.
- Both routed to visual-polish (cosmetic, no rules change). Art queue: batch-002 (upgrade icons, already written) generates FIRST, batch-003 (terrain + poses) written and ready right behind it — Robin may run both in one sitting if he wants; do not write batch-004 until both land.
