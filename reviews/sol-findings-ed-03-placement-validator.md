# Sol findings — ED-03 placement validator

Branch: `sol/ed-03-placement-validator`

Base: `sol/ed-02-brush-v2@e5eed887`

Verdict: **BLOCKED — one narrow territory/API grant is required before product code.**

## F-ED03-01 — the shared map gate is private and outside ED-03 territory

**Evidence.** The 069 boundary is `parseContractDescriptor()` plus the private `normalizeContractDescriptor()` / `sameDescriptorShape()` rule chain in `src/meta/ContractFamilies.ts:656-669, 1001-1119`. Every B5/B6 document write and pre-construction read already funnels through that owner (`src/meta/ContractFamilies.ts:671-692, 833-848`; `src/editor/DescriptorInspector.ts:67-128, 324-370`). Its public rejection result carries only the single generic water-damaged sentence, so the editor cannot render the failing code, path, or corrective message.

`ContractFamilies.ts` was granted to Session B for B5/B6 only (`docs/SOL-B-QUEUE-2026-07-11.md` §FOLLOW-UP WAVE). ED-03's standing territory is `src/editor/`, slice e2e, and findings. The pushed claim also binds ED-03 to consume shared validator rules without creating an editor-owned copy.

**Impact.** A validator implemented only under `src/editor/` would disagree with imports, staged session documents, and pre-construction activation as rules evolve. It could also advise that a descriptor is sound and then have the real 069 boundary reject it with no explanation. That is the parallel-owner architecture ED-03 is supposed to remove.

**Minimal unblock.** Grant ED-03 territory for `src/meta/ContractFamilies.ts` solely to:

1. make the existing descriptor boundary return deterministic, bounded reasons shaped as `{ code, message, path? }`;
2. keep structural and semantic map checks in that same boundary owner; and
3. expose those reasons to `DescriptorInspector` for Assayer-style rendering.

No `src/crafting`, `src/world`, `src/game`, `src/systems`, or `src/sim` edit is needed.

## F-ED03-02 — the Assayer has a verdict grammar, not a reusable general evaluator

**Evidence.** `src/crafting/CraftingQueueContract.ts:28-47` owns the reusable reason/verdict grammar. `src/crafting/AssayBench.ts:256-267` renders each reason as plainspoken copy with a stable `data-reason-code`. The live assay judgment itself is an orchestrator duty (`scripts/fire.md:20`); the only runtime evaluator, `src/crafting/StatSimHarness.ts:67-131`, is item-stat-specific. `contractBudgetOk()` is likewise a crafted-item rarity budget, not a map rule.

**Impact.** Importing the stat-sim or item-budget path would be false reuse. The correct ED-03 reuse is the Assayer's reject-with-reasons contract and presentation behavior, backed by the canonical map boundary.

**Ruling proposed.** Keep map-local reason types structurally identical to the Assayer grammar rather than introducing an inverted `meta -> crafting` dependency. Render the same way: one human message per reason, with code/path carried as data rather than exposed as backstage prose.

## F-ED03-03 — semantic failures currently pass the structural boundary silently

**Evidence.** Build-zone decoding enforces shape, unique IDs, broad finite bounds, and `min <= max`, but not claim-size bounds or positive area (`src/meta/ContractFamilies.ts:1085-1102`). Runtime buildability intersects those rectangles with actual bank terrain, while absent/empty zones deliberately mean the whole bank (`src/world/Terrain.ts:205-209`). Spawn edges are constrained to a non-empty unique compass set (`src/meta/ContractFamilies.ts:1115-1118`). Briefing strings are template-shaped and consumed directly by the HUD, town board, encyclopedia, and ledger (`src/ui/Hud.ts:295-304`; `src/town/TownScene.ts:1593-1610`; `src/encyclopedia/registry.ts:187-190`; `src/game/Game.ts:4627-4629`).

**Required first semantic rules.** The shared boundary should explain, in deterministic path order:

- build zones outside the claim, with zero area, on the wrong declared river bank, or with no dry buildable area;
- missing, duplicated, or unknown root spawn edges (the current structural law, now explained); and
- blank geography, goals, or rules after trimming.

No new spawn-point schema should be invented. ED-03 edits the existing `tileParams.lanes.spawnEdges` descriptors only.

## F-ED03-04 — briefing cardinality is fixed in v1

**Evidence.** Generic descriptor arrays must match the template length exactly (`src/meta/ContractFamilies.ts:1014-1017`). B6 made only build zones, water sources, and root spawn edges variable (`src/meta/ContractFamilies.ts:1084-1119`).

**Impact.** ED-03 can safely edit existing goal/rule rows, but add/remove controls would create descriptors the 069 boundary rejects. Keep row cardinality fixed in v1 unless the narrow decoder grant explicitly adds bounded variable briefing arrays.

## Ready implementation after ruling

Once F-ED03-01 is granted, the slice remains small: exact build-zone row edit/delete, four spawn-edge toggles, fixed-row briefing fields, and an Assayer-style verdict card appended through the existing lazy `DescriptorInspector` seam. Every action continues to clone one descriptor and commit through the B5 history/staging transaction. The slice e2e should pin multi-reason ordering, untouched-field byte identity, atomic rejection, undo, export/re-import, and absence of editor code on a plain boot.
