# Task lane-vfx-visualy: world-anchored VFX ride the terrain (LANE-A #2, commit prefix "fix:")
You are Codex (worktrees/lane-a). CODEX: model=gpt-5.6-sol effort=medium
READ FIRST: the MQ-1 fix (run3d-interaction — previews ride visualY; the precedent) · vfx float/pickup render paths (floatText, gold floats, xp motes, seam collect burst) · Terrain visualY.
Pre-flight: standard safe-dupe; npm i; tsc+build green.
## Why (owner, Twin Banks 2026-07-19: "the animation from collecting seems is swallowed by the terrain")
MQ-1's law covered previews; every OTHER world-anchored visual still renders at the flat plane and sinks into raised sculpt.
## Scope: 1. One helper: world-anchored visuals (float texts, collect bursts, pickups/motes render y, ground markers) take visualY + a small lift; audit call sites, route all. 2. Spec e2e/vfx-visualy.spec.ts: on a raised-terrain point, a seam-collect float renders ABOVE the mesh (probe via the diagnostics/dataset seam), zero console.
## Firewall: render-side y only; NO sim positions. END: READY-FOR-GATES + call-site table.