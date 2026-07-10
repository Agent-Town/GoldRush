# Task ed-01-descriptor-inspector: the editor's first floor — `?editor` inspector + live-apply (lane-d; commit prefix "feat:")
CODEX: model=gpt-5.6-sol effort=high
FROM `specs/contract-editor/README.md` T1/ED-01 (owner priority 2026-07-10: "the editor was a big topic"). Gate condition met (MP-03/04 landed).
You are Codex in worktrees/lane-d. Pre-flight per LANE-SAFETY. READ FIRST: the editor spec (all tiers — you build T1's first slice, the Charter Press's engine floor), the contract descriptor shape (`src/meta/ContractFamilies.ts` tile descriptors: heightfield params, zones, lanes, water, scatter, palette), the `?contract=` loader, `?debug` gating pattern (Game.ts:454 region).
## Scope
1. **`?editor` mode** (debug-gated seam, own lazy chunk, zero plain-boot effect): opens the active contract with an INSPECTOR panel — every tileParam as a typed field/slider (numbers, enums, colors), grouped by descriptor section.
2. **LIVE-APPLY**: edits rebuild the terrain/scene immediately (the render path already derives from the descriptor — reuse the loader; no engine forks). Sim stays untouched; editing pauses waves (`nowaves` implied in editor mode).
3. **EXPORT**: "Copy descriptor JSON" + download; IMPORT: paste/load JSON → apply (069's validation-boundary pattern for malformed input — reject with the water-damaged-page card).
4. e2e: editor opens on `?editor&contract=e1-dry-gulch`, a param edit visibly changes the scene (probe a derived value), export round-trips byte-equal, plain boot untouched (no editor chunk loaded).
Firewall: the editor chunk/panel + loader reuse + its e2e ONLY. NO sim, NO Balance, NO descriptor schema changes, NO save keys.
End: READY-FOR-GATES + screenshots (inspector open, before/after an edit) + the round-trip proof.
