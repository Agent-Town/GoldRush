# Review — polish-03 mobile HUD layout pass

- **Slice:** polish-03 (dedicated 390/430px HUD reflow — longest-carried debt since visual-polish/01)
- **Branch / tip:** lane/polish `0b55d3c` ("runner(lane-c): lane-c-polish-03-mobile-pass.md"); salvaged to `save/polish-03`
- **Drained by:** s201 fire → main (path-scoped clean checkout — all 5 files main-unmoved)
- **Verdict:** ✅ MERGE — mobile HUD hardened, no-overlap proven at 390+430px, adjacents green, one pre-existing red proven not-ours.

## What it does (CSS/HUD/UiBridge only)
- **`styles.css` (+154) / `theme.css` (+14)**: 390/430px HUD reflow — chips reflow without pause-chip/XP overlap, thumb-arc touch controls (≥44px), build-menu containment, receipt-collapse styling, safe-area insets.
- **`ProspectorPanel.ts` (+18)**: receipts collapse on mobile, expandable, preserve open-state during live updates (collapses the m4-07 stacked receipt surface, as specced).
- **`BuildButton.ts` (+5)**: mobile rotate/confirm touches no longer close build mode first.
- **`e2e/polish-03-mobile-hud.spec.ts` (new, 208)**: mobile-chrome coverage at 390×844 and 430×932 — controls fit, tap, avoid overlap.
- **Scope note (codex):** no standalone `mark` touch button exists (only the agent `chase_mark` tool id); weapon/agent chip + world-info prompt folded into overlap handling.

## Evidence
| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green |
| `polish-03-mobile-hud` (390×844 + 430×932 fit/tap/no-overlap) | pass |
| `m1-01` · `m2-01` (incl. 390px menu clear of HUD, stress draw calls <200) · `m4-07` (panel + 44px mobile bottom sheet) | **30/30** single-worker (2 expected m4-07 desktop skips) |
| Screenshots | `reviews/shots-polish-03/` |

**F-p03-vp02b (non-blocking, PROVEN pre-existing):** `vp-02b-rotation-resolver.spec.ts:149 "idle snaps to rotation idle hemispheres after movement"` fails desktop+mobile (2/10). **Proven not-ours by baseline**: ran vp-02b on current main BEFORE applying polish-03 → identical 2/10 failure (8 passed). polish-03 touches only styles/theme/BuildButton/ProspectorPanel — zero rotation-resolver/OrientationResolver code. This is a standing rotation-idle red for a future lane-d/vp corrective, not a polish-03 regression.

## Merge classification
- **Base** = `704b9f0` (s200 refill, lane/polish reset point).
- `git diff 704b9f0..main` over all 5 polish-03 files = **empty** → LANE-TOUCHED-only, zero MAIN-MOVED (town-T5 = town/*, perf-03 = vfx/pools — neither touched src/ui or styles). Clean `git checkout 0b55d3c -- …`, no 3-way.

## Firewall
Held — CSS/HUD/UiBridge/UI only. No sim, no BuildSystem, no Economy changes.

## Findings
None blocking. F-p03-vp02b documented (pre-existing rotation-idle red). `save/polish-03` → `archive/polish-03` once confirmed on main.
