# Task lane-town-variants-e7: the town's Signal wardrobe — full cast (LANE-B ladder, commit prefix "art:")

You are Codex, implementer for Gold Rush (worktree per queue lane). This is a BLENDER MODELING task — the repo's own deterministic pipeline, no image_gen.
CODEX: model=gpt-5.6-sol effort=xhigh
READ FIRST, deeply: docs/SOL-3D-C-CRAFTBOOK.md (THE CRAFT — source ladder reuse>derive>build-new, one mesh/material per body, atlas discipline, byte-identical re-export; you are inheriting a dormant master's practice) · the existing era-variant conventions (assets: <building>.e2.glb…<building>.e5.glb — measure one E5 building's tri/atlas budget and MATCH it) · specs/epoch-saga/e7-signal-bundle.md §A2 (the era's TRANSFORMS — each variant is the SAME building wearing the era, e.g. E6: tavern → ATOMIC DINER (chrome counter band, jukebox glow — "the art department's finest hour"), turret battery → sunline mount, guardrail → glow-fence, navigation school → isotope institute) · src/town/TownTavernPilot.ts (variants bind by FILENAME .e7.glb via the era pick — land the files, wiring is zero-code) · the era's shipped reference art (assets/raw bld-*/plates — conditioning).

Pre-flight (LANE-SAFETY): standard safe-dupe; npm i; tsc+build green; verify `blender --version` runs headless — if absent, STOP and report (environment gate, not a failure).

## Why (owner 2026-07-21: the town is era-dressed E2-E5 full-cast (13-15 variants) but THIN at e7 (4 variants); "I think you can manage it this time yourself" — the factory inherits 3D-C's craft via the craftbook)
## Scope
1. Model the MISSING e7 variants to full cast: every building that has an .e5 variant but no .e7 one (enumerate first — list in your report; expect ~~10). Derive from the .e5 model per the §A2 transform language (reuse>derive: start from the existing GLB, re-dress; build-new only where the bundle demands a new silhouette).
2. Budgets per the E5 standard you measured · byte-identical re-export · filenames EXACT: <building>.e7.glb beside the existing variants.
3. Gate: a town boot at &era=7&debug (e7 active) loads the new variants (dataset/probe), zero console, both projects; screenshots of the e7 square into reviews/shots-town-e7/.
## Firewall: the new .glb files + screenshots + report. NO src changes, NO existing-file edits, NO contract changes.
END: READY-FOR-GATES + the enumeration table (building → derived-from → tris/atlas) + the square screenshot.
