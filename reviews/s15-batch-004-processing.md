# s15 — batch-004 sheet processing + contract integration (2026-07-04)

## What landed
30 new cells (5 sheets × 3×2, `--key ff00ff --grid 3x2`, 512²) + 5 frames.json, AND a reprocess of both
old side sheets (8 cells) after an extractor fix. `characters.v2.json` extended: hero + jumper get `front`
and `back` orientations; hero `side` switches to the `files` form (4 old cells + 6 side-actions cells) with
real `pan`/`build`/`aim` clips; jumper gains `grab` (front) and a true 2-frame `flee` (back, fps 5).
Hero front/back is LIVE immediately (Hero.ts already sends orientation from velocity). Jumper front/back
and all action clips are contract-ready but dormant until code requests them (M2-04 thieves = flee/grab).

## Finding 1 — magenta spill INSIDE the art (extractor gap, affected shipped cells too)
All 5 new sheets carried painted magenta spill on interior cloth/limb pixels and in silhouette gaps
(between legs, under poncho fringe) — the prompt's "no spill" line was ignored by the model. The old 3px
edge-band despill never touched interior pixels, and flood/pocket keying can't reach blended spill. The
ALREADY IN-GAME side cells (s12) have the same defect (visible at 512², survived because billboards are small).
Fix in `scripts/extract-alpha.mjs` (pipeline lane): (a) `interiorKeyClear` — opaque pixels within max-channel
distance 90 of a SATURATED key go transparent (feather-ramped; unreachable by legit sepia/rust/teal — G is
never near 0 where R/B are high; gray keys excluded), new `--interior-key N`; (b) despill now runs on ALL
opaque pixels, not just the edge band (margin-16 rule already protects the palette). Result: 5–13k px
cleared per sheet; rust poncho, teal lantern, gold glints verified intact (cell closeups viewed).
All 7 sheets reprocessed → the in-game side cells are now clean as well.

## Finding 2 — deviation from the batch-004 cell map (logged, deliberate)
Map designates side-actions r1c2 "true standing idle" as hero idle. NOT wired: idle stays old-sheet index 0.
Reason: walk frames are old-sheet; idle↔walk is the highest-frequency transition and the side-actions sheet
reads chunkier/front-three-quarter (per the generation QA note) with its own extraction scale — a cross-sheet
default-pose swap would seam at every stop. Transient action clips (pan/build/aim) tolerate this; the idle
swap should wait for a unified regenerated side sheet. Robin can overrule.

## Finding 3 — fallback regression caught by the vp-02 gate (fixed, <20 lines, §5 lane)
The vp-02 "missing sheet cells fall back" test failed against the extended contract: it aborts only the 4 core
side cells; side-actions cells still loaded, so the orientation survived with ONLY action clips — idle/walk
resolved to null and the sprite froze instead of falling back to the one-frame billboard. Real robustness bug
under partial asset failure, introduced by the mixed-source files list. Fix in `SpriteAnimator.ts`
`createRuntimeOrientation`: an orientation that resolves neither idle nor walk gets the fallback clip as idle
(previously only when clips.size === 0). Re-run green.

## Retroactive note — vp-02 lane evidence debt
The 004 relay output was committed in `a674606` (s9d dead-lock takeover) without its own recorded gate run or
review file (s12's 65/65 predates the lane; only screenshots existed). Robin's playtest ("the sheets are
walking") confirmed function, not gates. This session closes that debt: the vp-02 suite now has a recorded
4/4 green run (below) and this file serves as the lane's review of record. Corrective process note: a dead-lock
takeover must not inherit a PRIOR session's evidence for a LATER lane's staging.

## Gate evidence (sandbox, desktop-chrome, per-file ≤45s split per s12 recipe)
- `npx tsc --noEmit` clean (after contract + SpriteAnimator change); `vite build` clean, 467ms.
- `vp-02-sprite-animation.spec.ts` 4/4 (groups: hit-pause+fallback 2/2 @18.6s; memory+screenshots 2/2 @21.7s).
- Canary `m1-01-claim-jumpers-death.spec.ts` 4/4 (2/2 @24.5s + 2/2 @31.2s) — enemy pool semantics intact.
- Canary `visual-polish-assets.spec.ts` 2/2 @15.3s — asset-failure resilience intact.
- Live orientation probe (vite+chromium same-call): KeyS ⇒ frameKey `char-hero-sheet-front-r0c1.png`,
  KeyW ⇒ `char-hero-sheet-back-r0c2.png`, both clip=walk frameCount=2 fps=4. Shots:
  `shots-s15-batch-004/s15-front-walk.png`, `s15-back-walk.png` (+ refreshed vp-02 desktop/390px).
- Not run: full 65-test regression — change surface is assets/contract/asset-parser only; systems untouched;
  covered suites are the asset path's owners + pool canary. Next full sweep rides the 005 integration gate.

## Open
- Jumper side `flee` is still the 1-frame placeholder (real 2-frame flee lives in back orientation; side flee
  cells don't exist — fine, fleeing runs up-screen = back is the money view per the cell map).
- Hero orientation switching exists for walk only; pan/build/aim/hit wiring is code work for a future slice
  (nothing requests those clips yet — verified single `spriteAnimator.update` call site).
- Icons tranche 2 + props remain UNGENERATED (they were folded into the batch-004 plan but not the 5-sheet
  generation run) — next art batch when queue allows.
