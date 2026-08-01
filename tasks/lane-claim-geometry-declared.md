CODEX: model=gpt-5.6-sol effort=high
# lane-claim-geometry-declared — the flagship map declares its own river
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY (census E1-E2 gaps 1-2, owner-directed 2026-08-02): the-claim (and night-shift/baron on the same default tile) hide river/ford geometry in engine constants (Terrain.ts:88-91) behind bare river:true/ford:true, and seam positions in DEFAULT_NODE_ANCHORS (Terrain.ts:155-163). The manifest deriver can say "a river exists" but not WHERE — the flagship first map is the least-declared map in the game.
READ-FIRST: census §E1-E2 gaps 1-2 · Terrain.ts:82-92,155-163 (the constants) · e1-twin-banks + E2 entries (the declaration pattern to copy: fords[], water{}, harvestAnchors[], size) · src/agent/MechanicsManifest.ts (the deriver that benefits) · the descriptor validator.
PRE-FLIGHT (LANE-SAFETY invariant): dirty tracked blobs must be reachable in git, else STOP.
SCOPE: 1. the-claim, e1-night-shift, e1-baron gain explicit fords[]/water{}/harvestAnchors[]/size matching the engine constants EXACTLY (geometry byte-identical — this is declaration, not redesign). 2. Terrain consumes the declared values when present, constants remain the fallback for undeclared contracts (no behavior change anywhere). 3. Manifest deriver picks up the now-visible geometry (fixture update for the three). 4. Determinism proof: dry-gulch control hash unchanged; the-claim browser boot pixel-stable (screenshot compare vs pre-change).
TOUCH-ONLY: the three E1 contract entries · Terrain read path (declared-else-default) · manifest fixtures · specs asserting them. NO: geometry VALUES, twin-banks/E2, gameplay.
SELF-CHECK: E1 suites green both projects · release suite green · tsc + build · screenshots.
READY-FOR-GATES + report: declared blocks verbatim + the constants they mirror.
