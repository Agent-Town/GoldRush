# Task 005 — M2-02 sluice-and-stockpile (+ palisade-rotation rider)

**Spec (BINDING, read fully):** `specs/m2-base-waves/slices/02-sluice-and-stockpile.md`.
**Brief constraints:** `docs/GOLD_RUSH_BRIEF.md` §9 (frontier-tech, prosperity framing, naming §9.4). Read `AGENTS.md` first.
**Skills:** `threejs-gameplay-systems` (pooling/instancing), `threejs-qa-release` (evidence).

## Goal

Sluice (river-adjacent passive income, contested-pause) + stockpile (bankCap raiser, visible pile) as buildable defs #3/#4 through the M2-01 registry; banked-gold cap enforced in Economy (block, never destroy); build menu → 4 tiles; palisade R-key/touch rotation in 90° steps. Every contract item and acceptance gate is in the spec — the spec wins over this file.

## What already exists (do NOT redo)

- `src/game/buildables.ts` registry + `BuildSystem` def-driven placement (M2-01): extend, don't rework. `placement: 'river-adjacent'` literal exists in the type but is UNIMPLEMENTED in validation — you implement it.
- Palisade AABB avoidance in enemy movement (M2-01) — rotation only swaps w↔d on placement; do not touch the avoidance algorithm.
- Economy event-log replay + `gold_spent`/`build_<defId>` sinks (M2-01); `gold_granted:upgrade_assay` grant pattern (m1-08) — model `grantGold` debug grants on it.
- Lazy `import.meta.glob` asset rule (s11/s12, BINDING) — see `src/ui/UpgradeOverlay.ts` header; icons additive slots only.

## Files in scope

- `src/game/buildables.ts`, `src/game/Economy.ts`, `src/game/Balance.ts` (new `sluice`/`stockpile`/`economy.bankCap` sections ONLY — do not touch `waves`/existing sections)
- `src/systems/BuildSystem.ts`, `src/systems/HarvestSystem.ts`, `src/systems/DebugTools.ts` (gui knobs + grantGold)
- `src/entities/Sluice.ts` (new), `src/entities/Stockpile.ts` (new), `src/entities/Palisade.ts` (rotation orientation only)
- `src/world/Terrain.ts` (ADDITIVE read-only river-geometry accessor ONLY — no texture/atlas/rendering changes; see s12 CanvasTexture warning in its header)
- `src/ui/BuildButton.ts`, `src/ui/Hud.ts`, `src/ui/theme.css`
- `src/game/Game.ts` — wiring/registration sections ONLY. **Sibling-changes rule: the tree may hold an uncommitted VP-02 lane (Hero/Enemy/src/assets/Game.ts-diagnostics). Leave every line you didn't need to change EXACTLY as found — no reverts, no reformatting, no "cleanup" of sibling edits.**
- `e2e/m2-02-sluice-and-stockpile.spec.ts` (new — rotation tests live here too)

**Do not touch:** `src/entities/Hero.ts`, `src/entities/Enemy.ts`, `src/assets/*`, `src/systems/WaveSystem.ts`, `src/systems/CombatSystem.ts`, `assets/*`, `scripts/*`, existing `e2e/*` specs, `STATUS.md`, `reviews/*`, specs other than M2-02 progress notes.

## Acceptance (spec §Acceptance, verbatim gates)

1. tsc/build green; zero console errors desktop + 390px.
2. New e2e (a)–(f) per spec: adjacency, income==replay, contested pause/resume, cap block + stockpile raise, rotation blocking on rotated axis (in-page rAF tracker, single enemy, no stall <20s), 4-tile menu at 390px.
3. Canaries UNMODIFIED green: m1-05, m2-01, m1-01, m1-03, visual-polish-assets.
4. FULL regression green (economy semantics changed): suite is 65 desktop-chrome tests + any VP-02 lane spec present + yours.
5. Screenshots → `reviews/shots-m2-02/` (menu desktop+390, working sluice, contested sluice, pile ≥2 steps, rotated palisade line).
6. Perf: no per-frame allocations in the new updates; draw calls Δ ≤ +3 at 12 buildings.

## Environment notes (Robin's Mac — you run there)

Run e2e via base `playwright.config.ts` (own webServer). If tasks/004 output is present uncommitted, that is EXPECTED — build on top, keep scopes disjoint per above, and your full regression includes its spec.
