# Asset Ledger — Gold Rush

Pipeline: slot defined → prompt written (batch) → generated (Robin/ChatGPT) → processed (alpha-extract `#8a8a8a`) → integrated (wired + screenshotted in-game) → done.

**Budget:** proposed 20 generations/week (≈1 batch of 6–8 prompts × 2–3 candidates) — **pending Robin's OK**. One batch in flight at a time, ordered by gameplay impact (hero/enemies/terrain before decoration). Placeholder-first is the law: no slot ever blocks gameplay.

## Slot board

| Slot | Placeholder (in code) | Prompt | Generated | Processed | Integrated |
|---|---|---|---|---|---|
| char.hero | capsule + hat cone + teal lamp | batch-001 | — | — | — |
| char.claim_jumper | rust poncho-cone + hat | batch-001 | — | — | — |
| node.gold_seam | ochre nugget cluster | batch-001 | — | — | — |
| bld.sentry_beacon | brass tripod + teal lantern | batch-001 | — | — | — |
| terrain.bank | procedural parchment-sand | batch-001 | — | — | — |
| terrain.river | teal UV-scroll plane | batch-001 | — | — | — |
| prop.rock / prop.stump / prop.claim_post | primitives | batch-002 (queued) | — | — | — |
| vfx.bolt | emissive sphere + tracer | stays procedural | n/a | n/a | n/a |
| ui.font.display / ui.font.body | system serif | n/a — font files (Rye/Wellfleet), not GPT Image | n/a | n/a | n/a |

## Batch queue

1. **batch-001** (`requests/batch-001.md`) — M1 core six. Status: **prompts written, awaiting Robin's budget OK + generation.**
2. batch-002 — props/decoration + death/level-up flourishes. Not written yet; after batch-001 integrates.

## Process notes

- Raw downloads → `assets/raw/` with the exact target filename (candidate suffix `-a/-b/-c`).
- Alpha extraction script → `scripts/extract-alpha.mjs` (to be written at first integration; flat `#8a8a8a` keyed).
- Integration = filename → slot via `assets/layer-contracts/*.json`, then in-game screenshot + visual review against brief §4 before a slot is marked done.
- Terrain tiles are full-bleed (no gray-bg cutout) and must fade to plain parchment at edges per the Frontier Ledger pipeline rules.
