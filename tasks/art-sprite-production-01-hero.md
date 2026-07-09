# Task sprite-production-01: THE PIPELINE — turnaround → walk videos → walk8 sheets (ART slot, higgsfield CLI + ffmpeg)
READ: assets/motion-pilot/NOTES.md (the pilot's verdicts/learnings) + turn-hero-base/e1-outfit (the conditioning anchors) + lore/canon-rules (hero canon: young woman miner, never 'prospector'). OWNER ORDER 2026-07-09: "from these inputs to sprite sheets so we can extract new animations. Adaptive over time."

## Scope (HERO ONLY — the production pilot; the cast follows once the owner verdicts these sheets)
1. Per direction (down/left/right/up): Seedance walk-in-place video conditioned on turn-hero-e1-outfit ("constant framing, plain flat sand background, seamless loop, no camera motion" + anchor; the turnaround pose matching the direction as --start-image where sensible). ≤2 takes each.
2. Extract 8 evenly-spaced frames per direction from one clean gait cycle (ffmpeg); align/crop constant; composite onto #ff00ff in a 4×8 grid → `assets/raw/char-hero-sheet-walk8.png` (rows: down/left/right/up × 8 frames — the walk4 grid law extended).
3. Contact sheet + honest QA: silhouette consistency, style vs in-game sprite, limb coherence per direction; any direction failing = note, don't fake.
4. LEDGER rows (walk8 PENDING-PROCESSING). NO src/ (SpriteAnimator walk8 support = the laddered engine task). End: READY-FOR-GATES + the grid + QA.
