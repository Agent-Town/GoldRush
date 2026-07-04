# Task 003: implement VP-03 terrain-variety (code-first, art follows)

You are Codex, implementer for Gold Rush, running on Robin's Mac in the project folder. Claude (Cowork) orchestrates and runs final gates.

READ FIRST: `specs/visual-polish/slices/03-terrain-variety.md` (BINDING), then `AGENTS.md`. Robin's directive: the repeated bank tile reads boring — kill the repetition IN CODE now; batch-003 variant art drops in later by filename.

## Scope summary (slice spec is authoritative)

1. Variant sampler in `src/world/Terrain.ts`: per-cell choice from contract-driven variant list (graceful with only tile A present today), plus deterministic per-cell rotation (0/90/180/270) + mirror, seeded by cell coords — stable across runs.
2. Low-frequency macro tint/brightness noise on the terrain material (±4–6% lightness, warm drift only, seeded) — ONE material, zero draw-call growth.
3. `Balance.terrain.featureMix` ?debug knob damping the strong dry-wash tile if still loud (uniform blend weight).
4. River untouched; river-bank seam must not regress.
5. Layer contract: extend the terrain contract so `terrain.bank` maps to a variant array (`terrain-bank-tile.png`, `-b.png`, `-c.png`) — missing files skipped without error or fallback flash.
6. NEW `e2e/vp-03-terrain-variety.spec.ts` per acceptance §2 (two distant ground screenshots differ; same-seed determinism; draw calls ±0).

## FILE SCOPE (hard boundary — parallel lanes exist)

Touch ONLY: `src/world/Terrain.ts`, `src/world/props.ts` (only if ground-material shared), terrain layer-contract JSON, `src/game/Balance.ts` (NEW terrain section only), `src/systems/DebugTools.ts` (gui folder), NEW e2e file. Do NOT touch Enemy/Wave/Build/Combat/Economy/UI files — other lanes own them.

Tree may contain sibling-lane changes (tasks/001, 002). Unrelated failures: note, don't fix.

## Rules

- Self-check locally: `npx tsc`, `npm run build`, your new spec green, `npm run verify:visual` green, `e2e/m1-05-sentry-beacon-build.spec.ts` green (ground placement canary).
- No git commits. No edits to STATUS.md, specs/, reviews/, EXISTING e2e.
- Style guard: variation must stay subtle parchment-band (brief §4 — muted, aged-paper; no patchwork quilt look). Include a before/after screenshot pair in your final message if you can.
- End with exactly `READY-FOR-GATES` + files changed + local test results.
