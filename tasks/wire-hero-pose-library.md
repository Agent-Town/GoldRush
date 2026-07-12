# wire-hero-pose-library — the hero works and fights in her own poses (owner-unblocked)
ROLE: sprite pipeline + run wiring. WORKDIR: lane-d (worktrees/lane-d), after wire-e1-bandit-variants.
CODEX: model=gpt-5.6-sol effort=high

## WHY (owner 2026-07-12, verbatim): "I saw the animations for the weapon/work poses - it looks really, really good! Can we use them as well?"
STATUS CHANGE: the art slot's QA-block on `char-hero-sheet-work8.png` + `char-hero-sheet-attack8.png` (LEDGER: "pinned-pan + chroma failures — DO NOT PROCESS") is **LIFTED BY OWNER VERDICT for wiring-with-curation**. His eye outranks the self-QA flag; the named failures become per-cell curation rules, not a wall.
## READ-FIRST: assets/raw/char-hero-sheet-work8.png + attack8.png (drained as reference 2026-07-12; LEDGER row notes the failure modes) · scripts/extract-alpha.mjs · the chroma lesson: alphaTest 0.35 clip killed town fringe (252a8fcf) · the canon law: pan at her RIGHT hip, never in-hand except panning; belt-pan v4 is identity · SpriteAnimator action-state grammar (walk/idle states; how a work/attack state slots in) · run wiring from run-scene-animation-refresh (3006333b — the walk8 activation is the template).
## SCOPE
1. EXTRACT both sheets (grid per LEDGER row); per-cell QA TABLE in the report: each cell PASS / PATCHABLE / EXCLUDED — exclusion reasons named (pan in wrong hand/position = canon fail; unrecoverable chroma = technical fail). Wire ONLY passing cells; walk8/idle fallback covers excluded frames (no visible gaps).
2. WIRE work8 → the panning/harvest state (she works the seam in her work pose — the first time panning LOOKS like panning) and attack8 → weapon-fire state (Spark Rig at least; states via the SpriteAnimator grammar, no new render paths).
3. Chroma: extraction + the proven alpha clip; zero magenta fringe at 2x zoom (assert via pixel sample in the e2e).
4. e2e: harvest at a seam shows a work8 frame key; firing shows attack8; walk unchanged; fringe sample clean; both projects. Combat + harvest suites unmodified-green.
5. LEDGER row updated: owner verdict quoted, per-cell table linked, block lifted-with-curation.
## TOUCH-ONLY: processed extractions, generated.ts slots, SpriteAnimator state wiring for the hero, one e2e, artifacts/hero-poses/, LEDGER. NO Balance/sim, no enemy sheets, no pose regeneration (that stays a future art batch for the EXCLUDED cells only).
## SELF-CHECK: tsc; build; new spec + m1-01/m2-01 + task-025 + animation-refresh spec green BOTH projects; zero console; a work+attack in-game capture strip (the owner-eye artifact — he already loves the raws; show him the wired result).
END: READY-FOR-GATES + the per-cell QA table + the capture strip.
