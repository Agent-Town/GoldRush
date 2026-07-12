# town3d-00-recipe — extract the tavern method into the playbook
ROLE: technical writer + Blender verifier. WORKDIR: lane-b (worktrees/lane-b).
CODEX: model=gpt-5.6-sol effort=high

## WHY: specs/town-3d/README.md slice 0 — the whole ladder executes THIS document at @high; its quality decides the program's token bill (owner: "We now learned how to instruct and make it work").
## READ-FIRST: assets/pilots/tavern-3d/*.blend + tavern-2-fullwrap.glb · artifacts/town-blender-v3/materials-note.md + gate-summary-variant-b.md · reviews/sol-3d-a-findings.md + sol-3d-b-findings.md (the failure modes: paper-theater, style drift, darkness, melted plastic) · specs/town-3d/README.md laws · e2e/town-tavern-blender.spec.ts (the gate grammar).
## SCOPE: write specs/town-3d/RECIPE.md — step-by-step from opening the reference painting to a passing gate: reference setup (the building's processed painting + slot footprint from townLayout), blocking proportions, geometry budget spending, UV+bake-from-the-painting procedure (the exact node/projection setup the tavern used — read the .blend headlessly to document it), tonal-match verification vs neighbors, export checklist, per-building e2e template, the failure-mode checklist. VERIFY the recipe by headlessly re-exporting the tavern from its .blend and diffing the GLB (byte-drift allowed, gate-pass required). ≤150 lines, imperative voice.
## TOUCH-ONLY: specs/town-3d/RECIPE.md, artifacts/town3d-recipe/. NO src/, no new models.
END: READY-FOR-GATES + the re-export gate evidence.
