# Asset Ledger — Gold Rush

Pipeline: slot defined → prompt written (batch) → generated (Robin/ChatGPT) → processed (alpha-extract `#8a8a8a`) → integrated (wired + screenshotted in-game) → done.

**Budget:** proposed 20 generations/week (≈1 batch of 6–8 prompts × 2–3 candidates) — **pending Robin's OK**. One batch in flight at a time, ordered by gameplay impact (hero/enemies/terrain before decoration). Placeholder-first is the law: no slot ever blocks gameplay.

## Slot board

| Slot | Placeholder (in code) | Prompt | Generated | Processed | Integrated |
|---|---|---|---|---|---|
| char.hero | capsule + hat cone + teal lamp | batch-001 | ✓ 2026-07-03 | ✓ 2026-07-03 | — |
| char.claim_jumper | rust poncho-cone + hat | batch-001 | ✓ 2026-07-03 | ✓ 2026-07-03 | — |
| node.gold_seam | ochre nugget cluster | batch-001 | ✓ 2026-07-03 | ✓ 2026-07-03 | — |
| bld.sentry_beacon | brass tripod + teal lantern | batch-001 | ✓ 2026-07-03 | ✓ 2026-07-03 (--deshadow) | — |
| terrain.bank | procedural parchment-sand | batch-001 | ✓ 2026-07-03 | ✓ 2026-07-03 (full-bleed) | — |
| terrain.river | teal UV-scroll plane | batch-001 | ✓ 2026-07-03 | ✓ 2026-07-03 (full-bleed) | — |
| prop.rock / prop.stump / prop.claim_post | primitives | batch-002 (queued) | — | — | — |
| vfx.bolt | emissive sphere + tracer | stays procedural | n/a | n/a | n/a |
| ui.font.display / ui.font.body | system serif | n/a — font files (Rye/Wellfleet), not GPT Image | n/a | n/a | n/a |

## Batch queue

1. **batch-001** (`requests/batch-001.md`) — M1 core six. Status: **generated + processed 2026-07-03; awaiting integration (code session).** 1 candidate per prompt (Robin-approved budget: 6 + 1 retry). 7 backend image calls total: 6 prompts + 1 model-initiated "consistency edit" on bld-sentry-beacon (counted against the retry slot). No rate-limit or quota errors observed. Generated via ChatGPT web (Robin's Pro account, Claude-in-Chrome relay per CLAUDE.md §7 step 4) — **not** Codex CLI: the sandbox kills every process at the 45s bash cap, and one GPT-Image generation needs 45-110s, so `codex exec` can never hold the connection long enough (one interrupted codex attempt on the *codex* account, session 019f2857-52af, may have burned one hidden generation there). Raw 1254×1254 PNGs land in `~/Downloads` (duplicates of `assets/raw/`); processed = 1024×1024 (contract size), cutouts alpha-keyed.
2. batch-002 — props/decoration + death/level-up flourishes. Not written yet; after batch-001 integrates.

## Process notes

- Raw downloads → `assets/raw/` with the exact target filename (candidate suffix `-a/-b/-c`; batch-001 ran 1 candidate per prompt, no suffix).
- Alpha extraction script → `scripts/extract-alpha.mjs` (written 2026-07-03; pngjs, pure node). Border flood-fill keying of `#8a8a8a` (tol 26, feather 14) + enclosed-pocket removal (arm/torso gaps) + optional `--deshadow` (border-connected neutral grays, spread ≤26, lightness 88–142 — used on bld-sentry-beacon, which shipped with a painted cast shadow). `--full-bleed` for terrain tiles. Everything resampled to the contract's 1024×1024.
- **batch-001 visual review (raw/processed, pre-integration):** hero — excellent, pan + nuggets + teal chest lantern, androgynous-leaning-feminine, keying clean; claim_jumper — excellent, rust poncho + bandana + grasping hands, weaponless, fringe edges survived; gold_seam — excellent, nuggets + pan in gravel, gray pebbles preserved; sentry_beacon — excellent design (brass/wood, teal core, energy arc, zero firearm silhouette), minor dark speckle at feet reads as ground wear, faint pale haze between rear trusses (invisible at billboard scale); terrain.bank — exemplary Frontier Ledger sheet, note the diagonal dry wash is a strong feature so the tile is NOT seamless when repeated (fine for M1 single-claim ground); terrain.river — dusty teal + engraved flow-lines + parchment sandbar corners, tiles acceptably, UV-scroll friendly.
- Integration = filename → slot via `assets/layer-contracts/*.json`, then in-game screenshot + visual review against brief §4 before a slot is marked done.
- Terrain tiles are full-bleed (no gray-bg cutout) and must fade to plain parchment at edges per the Frontier Ledger pipeline rules.
