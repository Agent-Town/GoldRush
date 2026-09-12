# Archive World must complete restoration rather than generic survival

Authority: `specs/agent-play/e10-archive-world-restoration.md` (build-authorized), with later launch/admission behavior in `tasks/e10-empty-harvest-anchors-unlaunchable.md`. Evidence: `artifacts/map-art-repairs-20260908/archive-objective-gap-45/`. This proposal does not enqueue work or change factory ownership.

Both mobile and desktop currently load the correct map, but report wave20 auto-secure and no active squall. Three light sites and ordered wings are only data. A8/A10 persistence threading and the shared Ember squall scheduler are present.

Implement the authorized restoration loop in both engines: powered beacon within the authored radius throughout telegraph and squall; interrupted holds restart next cycle; wings restore in declared order; wave12 secure requires a wing restored this run. Reuse the squall scheduler, extending its contract selection deliberately, and the existing TileStateStore entry/run-end seams. A lost run must persist nothing (explicit law and slice3 acceptance rule; the spec's isolated “win or loss” phrase conflicts with those). Restore prior wings at birth, show the palette change, surface the three ratified lore pages from `lore/archive-world-pages.md` in the claim ledger and restore the empty-shelf frame after all wings.

Admission must land coherently with real earned-gold beacon play, roster, anchors, two seeds and public-verb proofs; do not flip anchors alone. The current launch-only harvest-free declaration is not an alternative objective. Procgen v3 is not a prerequisite for this fixed tile.

Required evidence: both-engine ordered/uninterrupted/interrupted holds and refusal with no restored wing; winning run-end persistence plus losing-run no-write; second-run restored wing/page; actual desktop and mobile board entry, earned beacon, defended squall, secure and bank/reload. Preserve E10 Last Claim and River, their floors/pins, existing protected e2e files and factory queue/status ownership. Use new focused tests until the orchestrator integrates protected test updates.

## Branch implementation evidence — 2026-09-10

The restoration consumers, banked lore and material state effect are implemented, and production activation70 is now present in this branch. Production74 seed01 secured with actual contract data and ordinary admission; CLI72 seed02 secured and its full tape replay matched exactly. Evidence and remaining limitations live in reviews/sol-map-art-current-status-20260909.md and artifacts/map-art-repairs-20260908/readiness.json. Earlier paragraphs describe the pre-repair gap; they are not the current implementation state.

Still required: native player-facing next-wing/hold feedback, desktop/mobile earned play and bank/reload, full concept fidelity, and factory integration. CLI seed01 under turn-boundary movement remains unsuccessful; do not count that route as passed.
