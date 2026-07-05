# Review — run-001 contract wiring (s37, orchestrator asset-pipeline lane)

**Scope:** wire run-001's processed art into layer contracts. Hero rotation2 (batch-005R2 §A), jumper full rotation (batch-005R3 §B), building portraits (batch-005B §C). Plus the e2e direction tables that encode the contract, one extractor flag, and one reprocess. No src/ changes.

**Files:** `assets/layer-contracts/characters.v2.json`, `assets/layer-contracts/m1-core.layer-contract.v1.json`, `e2e/vp-02b-rotation-resolver.spec.ts` (3 table rows), `e2e/vp-02-sprite-animation.spec.ts` (3 table rows + mirror-pixels test rewrite), `scripts/extract-alpha.mjs` (`--scale` override), `assets/processed/char-hero-sheet-rotation2-*` (reprocessed @0.66).

## What was wired

- **char.hero `rotations`**: explicit `sw`/`e`/`nw` blocks from rotation2 cells (sw=r0c0/r0c1, e=r0c2/r0c3+idle r1c2, nw=r1c0/r1c1); `w` gains idle cell r1c3. Mirror table retired to `{}` — all 8 directions explicit (Robin call: no mirrors for the asymmetric hero). SpriteAnimator prefers explicit blocks, so behavior change is exactly the designed one: e/sw/nw render their own right/left-correct art, `mirrored:false`.
- **char.claim_jumper `rotations`** (NEW, runtime-dormant): 6 explicit directions + sw/nw mirrored from se/ne. **Wired in SPEC order — the LEDGER's "cells 5–8 reversed, swap in contract map" directive was STALE** (see F-s37-1).
- **bld.portrait.{palisade,sluice,stockpile,turret}**: dormant slots in m1-core contract (Terrain-style consumers do find-by-slot, so entries are inert; no eager loads). UI wiring belongs to the build-menu portrait slice.

## Findings

- **F-s37-1 (stale LEDGER note, corrected):** LEDGER row 31 + the s36 handoff ordered a cells 5–8 side-pair swap. That note transcribed the run file's **first-pass** verdict; the first pass was REJECTED and regenerated. The accepted retry sheet is in spec order — confirmed two ways: run-001 retry QA cell verdicts, and s37 pixel inspection of all four side cells (r1c0/r1c1 face RIGHT=e, r1c2/r1c3 face LEFT=w). Wired accordingly, no swap. **Lesson (pipeline law): wire from pixels, not from ledger prose — inspect cells before writing contract maps.**
- **F-s37-2 (cross-sheet scale law + fix):** extractor grid mode normalizes per-sheet (largest bbox → 86% of cell), so sheets with different grid layouts normalize differently. rotation2 (4x2, 627px-tall source cells) came out with 437–440px figures vs the s21 sheet's 339–397px — a +16–29% size pop at direction changes. Added `--scale F` absolute override to `extract-alpha.mjs` (still capped at 1, never upscales; errors if content would exceed the cell) and reprocessed rotation2 at **0.66**: SW 379 vs S 380, E 377 vs W 377 (r1c0). NW pair lands 331/319 vs N 361 — inside the NE-pair gait spread (352–397) that s23 ruled acceptable; watch at gameplay zoom. **Jumper rotation sheet has the same law violated in the other direction** (figures 296–331 vs side-sheet 409–439) and its source cells (313x418) cap native size — upscaling refused (linework). Logged as SCALE DEBT in the contract notes: regenerate at 2-row cell height or add runtime scale compensation BEFORE M2-04 activation.
- **F-s37-3 (coverage gap, deliberate):** with hero fully explicit and jumper mirrors dormant, `mirroredRuntimeFrame`/flipX has **zero live consumers**. The old "east = mirrored west pixels" test was rewritten to guard the inverse (east renders its OWN art, unmirrored, pixel-distinct from west both directly and flip-compared). Mirrored-pixel coverage must return when M2-04 activates jumper sw/nw. The old signed-asymmetry heuristic was also flip-specific and drowned at 390px on real art (measured −0.0013 vs required +0.004) — replaced with `heroCropDifference` (mean abs RGB in the hero crop, direct + flipped): desktop 0.0317/0.0532, mobile 0.0259/0.0251 vs threshold 0.01.
- **F-s37-4 (side idles dormant):** batch-005R2 promised "retires W-idle fallback", but `idleDirectionFor` + SpriteAnimator's idle remap hard-snap idle to s/n. The e/w idle cells are contract-wired and inert until a resolver rider (src change) lands — candidate small task alongside M2-04 or the next polish lane. Not silently claimed as live.
- **F-s37-5 (watch):** rotation2 r0c2 raw carries a faint disconnected fragment below the figure (neighbor-cell bleed). Invisible at gameplay zoom in the 8-direction contact strip; revisit only if it surfaces.

## Evidence (all on the s37 sandbox tree, chromium channel, single-test chunks per ENV LAWS)

- `npx tsc --noEmit` clean ×3 (post-wiring, post-test-rewrite, post-cleanup); `vite build` OK.
- vp-02b desktop 5/5: directions 19.4s · hysteresis+idle 31.2s · action-clips+jumper-shape 7.9s · scale-pulse shots 37.0s. Mobile 4/4: directions+action 30.5s · hysteresis+idle 36.2s (shots test is the desktop capture artifact by design).
- vp-02 affected tests, both projects: stride-cells 18.7s/20.4s · frameKey-alternates 27.8s/30.2s · mirror-pixels (rewritten) 13.5s/16.6s.
- **Jumper dormancy proven:** "jumper diagnostics stay old shape" green on both projects with the new rotations block present.
- Boot probe (built preview, `?debug&nowaves`): desktop + 390, **zero console errors, zero page errors**, hero loaded — `reviews/shots-run-001-wiring/boot-probe.json`, `boot-desktop.png`, `boot-390.png`.
- Visual: `reviews/shots-run-001-wiring/8-direction-contact-strip.png` — all 8 headings at gameplay zoom, correct facings, no cross-sheet size pop, no double-flip.

## Verdict

PASS — hero 8-way is now fully explicit art and live; jumper rotation + portraits are contract-ready and provably dormant. Debts logged: jumper scale before M2-04, flipX coverage at M2-04, resolver rider for side idles, batch-005 prompts still unwritten.
