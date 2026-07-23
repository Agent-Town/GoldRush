# Review — lane-town-scale-zoom (the town grows up + THE SPYGLASS)

**Slice:** lane-town-scale-zoom (pre-launch owner pass)
**Branch/tip:** lane/m3 `9095bee9` "feat: grow town and add spyglass zoom"
**Merge base:** `11ece22d` · merged onto main `d20ab91b` (clean 3-way, no conflicts)
**Drained by:** s954 fire · 2026-07-23
**Verdict:** ✅ PASS — merged with owner-veto note (pre-launch, owner present & steering)

## What it does (player-visible)
Two pre-launch owner-directed changes, both render-only:
1. **THE TOWN GROWS.** `Balance.town.scale = 1.5` drives the town camera closer via a new
   `CameraRig(camera, sceneScale)` distance-scale path (offset × 1/sceneScale). The first town scene
   now reads inhabited rather than miniature — hero ~1.5× prior height at 1440p (conservative low end
   of the owner's 1.5–2× target). A/B measured below.
2. **THE SPYGLASS (zoom).** New `CameraZoomController` (scroll-wheel + pinch) interpolates camera
   distance render-only, clamped [0.7×, 1.6×] of each scene's base, smooth, double-tap / press-Z reset,
   persisted per profile (`gr.camera.zoom.v1`). HUD stays screen-space (untouched). Wired into BOTH the
   run scene (Game.ts) and the town scene (TownScene.ts).

Owner directive (verbatim, 2026-07-23): *"size of the character and buildings in town, I think they are
much too small. They should be bigger."* + his friend: *zoom in/out.*

## Chosen numbers
| Datum | Value |
|---|---|
| `Balance.town.scale` | **1.5** (low end of 1.5–2× target — conservative; tune up on owner word) |
| zoom clamp | **[0.7×, 1.6×]** of each scene base |
| wheel sensitivity | 0.001 · smoothing 12 · double-tap 300ms / 28px radius |

## A/B evidence (artifacts/town-scale-zoom/)
`town-before-1440x900.png` vs `town-after-1440x900.png` · `compare/town-side-by-side.png` · `compare/metrics.json`
- edge energy A→B: 1.141 → **1.420 (+24%)** — bigger buildings/hero = more edges (town grew, confirmed)
- mae 30.1 · rmse 46.9 · diffRatio64 0.131 — substantial, intended visual delta
- avg luminance 168.5 → 150.3 (closer camera fills more frame with structures)

## Gate evidence
| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ clean |
| `npm run build` | ✅ green (built in 1.53s) |
| **Slice spec** `e2e/town-scale-zoom.spec.ts` (desktop + mobile 390px) | ✅ **2/2 passed** (scratch :5271) |
| — town hero rendered-height ≥ threshold at default | ✅ |
| — wheel changes camera distance within clamps | ✅ |
| — planar door picking lands at max zoom (MQ-1) | ✅ |
| — zoom persists across reload | ✅ |
| — run scene zoom works + HUD unaffected | ✅ |
| — zero console/page errors | ✅ |
| Adjacent `scene-swap-camera` (camera-truth 1440×900 + 2000×1000) | ✅ passed both projects |
| Adjacent `town-t4-growth` (3/4 cases), `061-first-claim-onboarding` (partial) | ⚠️ see F-1 |

## Firewall audit (TOUCH-ONLY: camera/scale data + zoom controller + settings datum + spec)
- ✅ Balance.ts — additive `camera.zoom` + `town.scale` blocks only
- ✅ CameraZoomController.ts / CameraZoomSettings.ts — new, render-only (no raycast/picking/Economy/damage/hp refs — grep-verified)
- ✅ CameraRig.ts — distance-scale framing (render-side); run scene uses default sceneScale=1 → **framing byte-identical to prior at rest** (offset×1 + target)
- ✅ TownScene.ts — camera + `heroRenderedHeight` diagnostic probe; no building layout / no HUD scaling
- ✅ ProfileStorage.ts — one additive persistence key (allowed: "persisted per profile, a settings datum")
- ✅ Game.ts / vite-env.d.ts — controller wiring + diagnostics type only
- NO sim coords, NO HUD scaling, NO building-layout changes. Firewall respected.

## Findings
**F-1 (non-blocking, PRE-EXISTING — not caused by this slice).** During the adjacent gate, 8 tests
failed: `061-first-claim-onboarding` (:105 per-profile done-flag, :137 mobile trail/tavern fit@390px,
:149 name-only-exit guide-pending) and `town-t4-growth` :234 "growth beats fire once per profile"
(`expectBeat` data-beat-id resolves to `ledger-page:the_claim`, not the expected beat). **Fingerprinted
against clean pre-merge main (d20ab91b) in a detached worktree: the IDENTICAL 4 cases × 2 projects fail
with the identical assertions, and the same 12 pass.** → PRE-EXISTING reds, camera-unrelated (profile-flag
/ story-beat logic). This slice did not introduce or worsen them. Left for a separate corrective if the
owner wants first-claim/growth-beat specs green (they touch profile persistence + ceremony beat wiring,
outside this firewall).

**F-2 (note, non-blocking).** `town.scale=1.5` is the conservative low end of the owner's 1.5–2× target.
If the town still reads small to the owner in his pre-launch playtest, bump `Balance.town.scale` toward
1.8–2.0 — one datum, zero risk. **Owner-veto window:** town scale + spyglass landed per the 2026-07-23
directive; reverse or tune with one word.
