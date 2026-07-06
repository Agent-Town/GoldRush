# BT-01 Tier system core — drain review (s101) — VERDICT: PASS (merged `2897a45`)

**Date:** 2026-07-06 (s101 fire)
**Source:** lane/polish `62649c7` (runner: `lane-c-bt-01-tier-core.md`), forked at `eaa73aa`.
**Merge:** CLEAN disjoint. Main moved only bookkeeping since the fork (`STATUS.md`, `tasks/BACKLOG.md`, `tasks/fix-037-pangold-flake.md`, queue copy) — zero overlap with BT-01's product/test files; combat-readability (`3947d6a`) already in the merge-base. Applied via path-scoped `git checkout lane/polish -- <11 files>` (excludes the 4 `artifacts/combat-readability/*.png` playwright regen-noise the lane commit also carried). No 3-way graft needed.

## Files merged (11, all in-firewall, additive 747+/35−)
`src/systems/BuildSystem.ts`, `src/game/Balance.ts`, `src/game/Economy.ts`, `src/game/Game.ts`, `src/entities/{Palisade,Sluice,Turret}.ts`, `src/ui/UpgradePrompt.ts`, `src/styles.css`, `src/vite-env.d.ts`, NEW `e2e/bt-01-tiers.spec.ts`. No out-of-firewall files touched (footprint/overlap math, CombatSystem, placement/confirm untouched — verified by file set + green regression).

## Gate evidence (all green)
- `npx tsc --noEmit` clean; `npm run build` green (pre-existing chunk-size warning only).
- **NEW `e2e/bt-01-tiers.spec.ts`: 12/12** (6 cases × desktop-chrome + mobile-chrome):
  1. turret tier raises live damage + spends EXACT tier-2 cost ✓
  2. palisade tier raises maxHp, heals, wears only below half NEW max ✓
  3. sluice tier raises pan-rate multiplier ✓
  4. **footprint INVARIANT (Law 1)** — blocked neighbor stays blocked, edge-touch stays allowed pre/post upgrade ✓
  5. tier-3 cap no-op ✓
  6. insufficient-gold no-op ✓ (+ zero console/page errors on every case)
- **Draw-call budget held:** `m2-01-build-menu` `<=200` stress green; `combat-readability` 120-enemy stress `maxDrawCalls<=200` green — tier visuals add NO draw calls beyond the instanced budget.
- **Regression green both projects:** `m2-01-build-menu`, `m1-01-claim-jumpers-death`, `task-025-bandits-dont-swim`, `combat-readability`.
- **Boot probe:** the bt-01 + combat-readability suites boot the game on both projects asserting empty `consoleErrors`/`pageErrors` — zero errors both viewports.

## Flake note (investigated, not a regression)
A batched regression run showed 2 `combat-readability` failures: "damaged bars visible" (desktop) and "120-enemy p95 frame-time" (mobile, `p95 71.4 > 57.6 = baseline×1.15`). Both were **concurrent-machine-load flake** (I had tsc/build/parallel-playwright running): the STRUCTURAL `maxDrawCalls<=200` check passed throughout; the failing assertion was the noisy p95 frame-time RATIO. Isolated + `--workers=1`: 120-enemy stress **6/6 green** (repeat-each=3 × 2 projects), full combat-readability suite **6/6 green**. Not BT-01-caused.

## Notes / deferred
- Tier visuals are **procedural placeholders** (Law 2; tint/scale on the existing instanced path, layered on combat-readability's wear colors). Dedicated in-game tier-visual screenshots deferred — BT-01 is a systems slice; art contract slots are BT-03. An attended visual eyeball of the brass→agent-glow tier tint is a nicety, not a blocker.
- Science-gate: BT-01's `tierUnlockAllowed()` seam ships default-OPEN with a `TODO(SCI-03)` marker (confirmed by green cap/gate tests). SCI-03 flips it on without reworking tiers.
- Next slice: BT-02 (production semantics / stockpile tiers) per `specs/building-tiers/README.md` — lane-c ladder.
