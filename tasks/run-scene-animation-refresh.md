# run-scene-animation-refresh — the run catches up to the art (hero, bandits, prospector)
ROLE: sprite pipeline + run wiring. WORKDIR: lane-d (worktrees/lane-d), after e2-t2-dynamo-ceremony.
CODEX: model=gpt-5.6-sol effort=high

## WHY (owner 2026-07-12, verbatim): "It is also high time to replace the animations in the game. The hero is still the same as days ago but we have worked on a new version for a long time, same for bandits, the prospector etc."
The cast-motion pass (e2298c5a + 252a8fcf) modernized the TOWN only; the RUN scene still renders older sheets.
## READ-FIRST: assets/LEDGER.md — the motion-ladder rows + QA verdicts. **HARD GUARD: char-hero pose idle8/work8/attack8 are QA-BLOCKED (pinned-pan + chroma) — DO NOT wire those; walk sheets judged separately.** · reviews/art-sprite-production-* (which sheets are QA-PASSED) · src/assets/SpriteAnimator.ts + generated.ts slots (run actors: hero, prospector agent, claim jumper, baron, railtough, wrecker, coalthief) · the town fit/aspect lessons (252a8fcf — do not repeat the stretch).
## SCOPE
1. INVENTORY TABLE (the deliverable even where wiring defers): per RUN actor — sheet currently wired vs newest QA-PASSED sheet on disk (raw + processed), with LEDGER citation.
2. Extract+process any QA-PASSED-but-unprocessed gap (extract-alpha law; measured self-QA).
3. Wire upgrades where a strictly newer QA-passed sheet exists (hero walk first — the belt-pan v4 line; then jumper, baron, prospector, E2 enemies if newer sheets exist). Aspect from real cell dims (the town lesson); no silhouette/size change beyond the art (LOS art-read law).
4. Anything QA-blocked or missing → the report's generation-request list (art lane), NOT wired.
5. e2e: run boot shows the new hero sheet key + frame advance; combat suites unmodified-green (m1-01/m2-01/e1-baron/e2-enemies).
## TOUCH-ONLY: assets/processed extractions, generated.ts slots, entity sprite wiring, one e2e, artifacts/, LEDGER rows.
## NO: QA-blocked sheets, art generation, Balance/sim, town files.
## SELF-CHECK: tsc; build; new spec + m1-01 + m2-01 + e1-baron + e2-enemies + task-025 green BOTH projects; zero console; side-by-side old/new hero capture.
END: READY-FOR-GATES + the inventory table + the old/new capture.
