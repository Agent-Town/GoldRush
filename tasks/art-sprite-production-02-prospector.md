# Task sprite-production-02: THE PROSPECTOR — hover videos → hover8 sheet (ART slot, higgsfield CLI + imageio-ffmpeg; SIBLING of 01-hero)
**OWNER ORDER 2026-07-09 (verbatim): "Don't forget about the Prospector, the agent, it is also part of everything."** Follow `tasks/art-sprite-production-01-hero.md` EXACTLY (its READ FIRST, tools, broken-ffmpeg workaround, budget discipline, firewall) with these substitutions:

## Substitutions
1. **Character**: the Prospector — small round brass automaton, riveted plates, glowing teal core, hover-jet, NO legs (it floats). Identity anchors: `assets/raw/turn-prospector.png` + `assets/processed-full/char-prospector-sheet-hover4-a-r*c0.png` (all four VERIFIED present). Canon: the agent is THE PROSPECTOR; the hero is never called that.
2. **Motion**: hover-bob cycle, not a gait — QA gates on a clean rhythmic vertical bob + jet flicker, LOCKED ALTITUDE BAND (the footline law's hover twin: bbox center stability, report the metric).
3. **⚡ TAKE-1 PARTIALLY CREATED (attended, 2026-07-09 — do NOT regenerate):** down `475075a8-33d4-4936-95a3-b5d0a2c5c289`; left/right/up were rate-limit-queued by the attended feeder — CHECK `assets/motion-pilot/production-prospector/JOBS.md` for their IDs before creating anything; fetch existing results with `higgsfield generate wait <id>`. New generations ONLY as ≤1 retake per failing direction.
4. **Output**: 4 directions × 8 frames on `#ff00ff`, 4×8 grid → `assets/raw/char-prospector-sheet-hover8.png` (rows down/left/right/up). NO mirrors. Videos/frames/contact-sheets → `assets/motion-pilot/production-prospector/`.
5. **LEDGER** rows (hover8 PENDING-PROCESSING) + per-gen credit log + run note.

## Firewall
Touch ONLY: `assets/raw/char-prospector-sheet-hover8.png`, `assets/motion-pilot/production-prospector/**`, `assets/LEDGER.md`, the run note. NO src/, NO other characters, NO dependency install, NO wiring.

End: READY-FOR-GATES + the 4×8 grid + per-direction QA verdicts + the credit log.
