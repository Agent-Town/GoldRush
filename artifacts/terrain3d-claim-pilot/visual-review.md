# Terrain3D Claim pilot — visual review

Reviewed the saved desktop and mobile owner shots plus 2× crops of the water, bank, cast, and built base.

## Accepted for this pilot

- The contract terrain fills the Claim tile with no missing mesh, corrupt texture, or exposed painted-ground double render.
- Hero, Prospector, sluice, stockpile, shadows, and the fixed ford remain legible at the run camera.
- The shoreline shown by the image remains aligned with the fixed straight simulation water band; no sculpted outer-bank meander lies about placement.

## Follow-ups outside this slice

- **High:** the existing runtime water and ford materials still read as rectangular overlays with hard vertical transitions. Fix only in a later water-render slice; the fixed simulation shoreline must remain unchanged unless map data changes first.
- **High:** the existing stepping stones and placeholder sluice have weak contact/shadow cues, while billboard shadows use inconsistent offsets. Address in water/build presentation work, not terrain height or placement logic.
- **Medium:** mobile HUD cards obscure much of the upper shoreline and crossing. Treat as a mobile HUD/readability follow-up.
- **Medium:** small shipped scatter pieces read as dark slivers at the run camera. Treat as scatter-art cleanup.

No finding justifies changing simulation, water masks, placement, or the supplied terrain asset in this pilot.
