# Review: m0/02-claim-terrain

Date: 2026-07-03 · Implementer: Codex (session 019f263b) · Reviewer: Claude · **Verdict: PASS (1 correction round)**

Evidence (rerun independently): build ✓ · playwright 4 passed (incl. new zone probe: bank/shallows/river/ford speeds asserted) ✓ · zero console errors both viewports ✓ · draw calls 17 desktop / 11 mobile (<150) ✓ · shots `reviews/m0-02-desktop.png`, `-mobile.png`.

Seam conformance: `Terrain.sample/bounds/nodeAnchors/spawnEdges/isBuildable` ✓ · `palette.ts` tokens ✓ · `slots.ts` + layer-contract slot tags ✓ · props + claim post ✓ · demo player consumes speedMul ✓.

Findings R1 (river rendered green = lawn) + R2 (spawn inside river) → fixed by Codex in one batched round: teal-shifted water + ford, south-bank spawn (0,12).

Accepted minor: water hue still leans green under scene lighting — placeholder within tolerance; final water look is owned by `terrain-river-tile` (batch-001) and framing changes in m0/03. Revisit at m0/05 screenshot-critique if it still misreads.
