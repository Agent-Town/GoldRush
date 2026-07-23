# Task lane-town-scale-zoom: the town grows up + THE SPYGLASS (LANE-A, pre-launch, commit prefix "feat:")

You are Codex, implementer for Gold Rush (worktrees/lane-a).
CODEX: model=gpt-5.6-sol effort=xhigh
READ FIRST: src/town/TownScene.ts (camera setup, building/actor scales, the plate mount) · the town camera vs the RUN camera (framing comparison) · Balance (add town.scale + camera.zoom blocks) · the MQ-9 camera-truth law (aspect discipline — your zoom must respect it) · owner evidence 2026-07-23: "size of the character and buildings in town, I think they are much too small. They should be bigger." + his friend: zoom in/out.

Pre-flight (LANE-SAFETY): standard safe-dupe; npm i; tsc+build green.

## Why (pre-launch owner pass: the town reads distant/miniature; a first-time player's first scene should feel INHABITED)
## Scope
1. THE TOWN GROWS: a Balance-driven town scale pass — either camera moves closer (preferred: one camera-distance/FOV datum) or uniform scene scale; target: the hero reads ~1.5-2× current height on a 1440p screen, buildings proportionally (compare the RUN scene's hero size — the town should not feel farther than the claim). Screenshot A/B at the same viewport for the owner.
2. THE SPYGLASS (zoom, both scenes): scroll-wheel + pinch zoom, RENDER-ONLY (camera distance interpolation; sim/picking untouched — picking already planar per MQ-1), clamped [0.7×, 1.6×] of each scene's base, smooth, persisted per profile (a settings datum), double-tap/press-Z reset. The HUD stays fixed-scale (screen-space).
3. Spec e2e/town-scale-zoom.spec.ts (both projects): town hero rendered-height ≥ threshold at default · wheel event changes camera distance within clamps · picking still lands (click a building door at max zoom, planar law) · zoom persists across reload · run scene zoom works + HUD unaffected · zero console.
## Firewall: camera/scale data + the zoom controller + settings datum + spec. NO sim coords, NO building layout changes, NO HUD scaling.
END: READY-FOR-GATES + the A/B screenshots + the chosen numbers.
