# town-cast-metrology — one height law, grounded busts, her feet clean
ROLE: town cast surgeon. WORKDIR: lane-b (worktrees/lane-b), after town3d-01. PRIORITY: owner-visible regression wave.
CODEX: model=gpt-5.6-sol effort=high

## WHY (owner, town walk 2026-07-12 evening, verbatim): "now I am very small, the prospector is very small as well - I think in my hero animation there is a white filler for my feet at some point. The school teacher lady is there 50%, 50% are missing. Mei, the chinese girl, walks really funny. The Elder and the Inn keeper are a bit too tall." + "Ada is half in the building floating."
Attended triage — three roots:
A. HEIGHT ANARCHY: fit-to-texture (252a8fcf) sizes each sprite from its own sheet dims × per-actor `scale` values tuned for the OLD system → hero+prospector tiny, elder+tavernkeeper giant. 
B. THE BUST FALLBACK reads BROKEN: clone-amnesty reverted schoolteacher/assay-clerk(Ada)/preacher to bust portraits rendered as floating half-people clipping into shells.
C. SHEET DEFECTS: hero sheet has a white-filler patch at her feet in ≥1 cell; Mei's gait wrong (frame order/timing vs her 4x8 sheet convention).

## READ-FIRST: the height-band law (reviews/art-sprite-production-07-newsie.md: measured heights vs char-hero cells; newsie 291 vs youngster 313 = child-correct) · TownActorRuntime fit + definitions scales (townsfolk.ts) · the T5-era bust-post presentation (git history: how busts displayed pre-fullBody — anchored, not floating) · Mei sheet cell map · assets/processed/char-hero-sheet-walk8 cells (find the white-filler cell(s)).
## SCOPE
1. ONE METROLOGY TABLE: define world-height per actor CLASS (hero 1.0 baseline · adults ~1.0-1.05 · elder slightly stooped · kids/Mei ~0.85 · prospector ball ~0.6) in townsfolk data; fit-to-texture keeps ASPECT from cells but HEIGHT comes from the table (scale field becomes world-height, single semantic). Hero + Prospector restored to proper presence; elder/tavernkeeper down to band. e2e asserts relative heights (hero vs youngster vs elder ratios within tolerance).
2. GROUNDED BUSTS: the three bust-fallback actors render as PORTRAIT POSTS (the pre-fullBody grammar: bust card on a small wooden stand at their building's PORCH anchor, feet-level grounded, never intersecting shells) — reads as signage-with-a-person, not a haunting. Ada moves OUT of the shell to the assay porch approach point. (Their real walk8 sheets are already in the art lane — this is the interim that must look intentional.)
3. CELL QA: locate + fix the hero white-feet cell (re-extract with correct crop/key or patch alpha; if unrecoverable, exclude cell + timing-skip). Mei: verify her frame ORDER/timing against her sheet map (walk8 4x8 col-major vs row-major mismatch = the funny walk); fix the mapping generically (per-sheet frame map, not per-actor hacks).
4. Full plaza contact sheet before/after (the owner-eye artifact).
## TOUCH-ONLY: townsfolk.ts data, TownActorRuntime sizing/presentation, processed cell fixes, one e2e update, artifacts/cast-metrology/, LEDGER row for the cell fix.
## NO: run-scene sprites, walk-sheet regeneration, sim, camera, building shells.
## SELF-CHECK: tsc; build; cast-motion + town suites green BOTH projects; zero console; the before/after plaza sheet + a hero walk loop strip (feet clean all 8 frames).
END: READY-FOR-GATES + the metrology table + the sheets.
