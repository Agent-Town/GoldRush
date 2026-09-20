# Land Yacht actual-camera critique

Fresh screenshot-critique agent reviewed concept plates, desktop/mobile frames and exact 2x crops from `runtime-calibration-3`, with no implementation backstory.

## Findings retained

- High confidence: end-on crane/wheelhouse damage images do not clearly show broken glazing or slack cable. Re-capture at the orbit-8 side angle before judging those states.
- High confidence: broad wheelhouse and compact hull simplify the reference's layered industrial silhouette. Brass, plate and trim look uniformly mustard/mottled; glazing looks opaque. Helm, cupola, pipework and wheel detail are weaker than the plate. These are remaining fidelity limits, not 1:1 completion.
- High confidence: paired dark lines across the roof resemble surface artifacts. Inspection traced this to the plate atlas UV rectangle crossing a painted border. `roof-seam-fix/` narrows that rectangle and proves positions, normals, indices, morphs and atlas pixels unchanged. Final captures must confirm the seam is gone.
- High confidence: wheel damage is weak from the end-on view. Ground contrast and mobile dust obscure machinery. No confirmed floating/attachment defect from these images.
- High confidence: mobile catch-your-breath control overlaps right wheels. The top notice obscures the crane/bar in some restore frames. Existing weapon-card text is clipped. Camera controls at the default mobile zoom clip broadside geometry; existing maximum zoom-out shows the whole vehicle.

The independent reviewer found crane-base and lamp attachment plausible; axle attachments remain obscured. Root inspection agrees with the material/damage-angle/UI limits. The material finish remains simplified; this pass establishes a coherent 3D encounter and closer major forms rather than a detailed replica. No unrelated HUD or camera system redesign is bundled here.

## Follow-up inspection

The fresh reviewer inspected `runtime-final` side-angle shots: roof marks resolved (high confidence); wheelhouse missing-pane damage is distinguishable but subtle and partly obscured by the stack; crane cable/claw changes remain weak at full-frame size. Root inspection agrees. The damaged concept retains the crane boom silhouette, so this pass preserves that structure rather than inventing a collapsed boom. Final successful raw captures are `runtime-final-2`; optimized captures are `runtime-optimized`.
