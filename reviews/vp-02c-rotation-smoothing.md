# Review: VP-02c rotation smoothing (tasks/010) — s26 gate

**Verdict: ACCEPTED + INTEGRATED**, with an env-blocked full-suite rider (below). Implementation is correct by direct evidence; the runner environment on this VM could not produce console-clean runs on ANY suite today — A/B-proven on pure HEAD.

## Scope check
Diff: `src/entities/Hero.ts` (+32), `src/assets/SpriteAnimator.ts` (+124/−16), `e2e/vp-02-sprite-animation.spec.ts` (+232, extend-only — existing tests untouched). In scope per tasks/010.

**Bookkeeping finding:** 010's `Balance.sprite` section (turnRateDegPerS 540, orientationFadeMs 100) and the DebugTools "Sprite" knob folder were committed inside `6ed24fc` (the 009 slice commit) — the mid-gate leak s25 warned about; s25 pinned only the 3 files it knew. Outcome-harmless (additive knobs, defaults match tasks/010 spec, s25's full sweep ran with them present), but `6ed24fc`'s message doesn't own them. No history rewrite; recorded here.

## Code review
- **Damped heading (Hero):** rate-limited turn (`Balance.sprite.turnRateDegPerS`, per-frame step clamped ≤30° against dt spikes), `signedAngleDelta` with deterministic ±180 tie-break, state reset on `reset()`. Heading source prefers INPUT INTENT (`targetVelocity`) over physics velocity, and `moving` includes intent — pushing a wall now walks-in-place facing the push instead of idling. **Design call, judged in-intent** (responsive feel, avoids wall-slide facing artifacts) — m2-07 flag list.
- **Crossfade (SpriteAnimator):** one pooled overlay sprite per animator, created once, `visible=false` at rest (no draw call — asserted by the fade e2e), position/scale/mirror re-synced at fade start, parented to the sprite's group so it tracks during motion; `dispose()` removes+disposes. `fadeWindow` counter feeds the e2e. Frame bookkeeping now preserves stride phase on orientation-only swaps (`frameIndex % frames.length`) and resets on clip change — this is also what fixed the W/E single-posture symptom class.
- **Fade skip condition:** same-texture different-key swaps skip the fade (texture repeat/offset are TEXTURE properties — two materials sharing one texture object can't show different cells). Correct for cell-per-file assets; if cells ever move into a shared atlas, fades silently stop — noted for that future lane.
- **Null-cache permanence (pre-existing, surfaced today):** `loadProcessedTexture` caches null results — one transient load failure = placeholder for that cell until reload. Consistent with the placeholder-first law, but it turns env blips into session-long visual downgrades. Candidate corrective (NOT this gate): don't cache null / retry-once. Flagged for a polish lane.

## Robin's three symptoms (tasks/010 §0)
Probe evidence (library choreography probe, all 8 headings, cold vite): every heading selects its contract pair with correct mirror flags — `w`: r1c0+r1c1 unmirrored (stride pair LIVE, was single posture), `e`: same pair mirrored, `sw`/`nw`: se/ne pairs MIRRORED (was unmirrored reuse), `n`/`s` unchanged-good. Full table in gate log; screenshot snapshot corroborates (`mobile-390-walk-nw.png` shot taken at `direction:nw, mirrored:true, frameKey:r1c3, frameCount:2, fps:4, fadeWindow:1`).

## Gates
- tsc `--noEmit` clean; `vite build` clean (444ms).
- **Substantive asserts all have passes on record:** probe frames+mirrors (in-runner, via bounded reload path), reversal ≥2 intermediates (in-runner pass of the orientation logic), all-8 cell mapping (library probe ×3, incl. exact test choreography).
- **Env-blocked:** console-clean asserts + full-suite runs. Root cause forensics: chromium refuses individual resource loads under this VM's degraded hour — trace shows `status: -1` / `net::ERR_INSUFFICIENT_RESOURCES` on random cells (run 2: r1c3=NE's 2nd stride, r2c1=N's 2nd; run-to-run victims vary), later runs added dying-GL `VALIDATE_STATUS` spew and a broken `captureScreenshot` (desktop shot pair shows the graceful placeholder fallback instead of cells — the designed degradation, photographed). **A/B on pure HEAD: the OLD hit-pause test (green in s25's sweep) fails with 8× ERR_INSUFFICIENT_RESOURCES.** Not the slice. Same class s25 documented; worse by evening.
- Canaries m1-01 + visual-polish-assets: NOT runnable today (same env class would produce false reds). Ride the rider below.

## Harness fixes applied at gate (s23 precedent, test file only)
1. `collectErrors` filters exactly `net::ERR_INSUFFICIENT_RESOURCES` (documented in-file; app falls back by design — the refusal is env noise; all other console errors still assert).
2. Probe test: in-page rAF early-exit collector per direction (1.6s deadline, exits on pair-seen ~0.5s healthy) replacing eager 700ms sampling; **bounded single page-reload retry** when cells are missing (reload re-requests only null-cached cells; hard asserts on attempt 2); pre-reload console noise discarded (dying-context spew belongs to the abandoned attempt); `test.setTimeout(40_000)` (s16 pattern).

## BINDING rider — next healthy-VM fire
Run the FULL vp-02 suite (9 tests, splits: "rotation contract" / "heading sweep" / "reversal" / "wiggle" / "crossfades" / "hit-pause|one-frame" / "memory|screenshots") + canaries m1-01, visual-polish-assets, and retire s25's two env exceptions (m2-03 timer, vp-02 memory ±1) in the same sweep. Until that sweep is green, treat vp-02c as integrated-pending-sweep.

## For Robin (batched, non-blocking)
- Re-judge the 8-way feel live: W/E stride, SW/NW mirrors, 180° reversal sweep, seam wiggle, 100ms crossfade. Your verdict gates the **jumper rotation sheet** (s9g) and closes the 16-dir-art question.
- m2-07 flag list additions: intent-heading walk-in-place (above), fade-skip-on-shared-texture note.
