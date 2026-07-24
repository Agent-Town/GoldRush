# Task lane-release-fixes-2: P0 LAUNCH-BLOCKERS ×2 — white townsfolk + the dry spring (LANE-A, commit prefix "fix:")

You are Codex, implementer for Gold Rush (worktrees/lane-a).
CODEX: model=gpt-5.6-sol effort=xhigh
READ FIRST: the owner's blessing-walk evidence (2026-07-24, release preview 938a65b1): ① "Town is filled with walking white rectangles" — plaza actors render as untextured planes; ② "Can't place sluice in dry-gulch" — hero at the spring rim, placement refused (the card's law: "Sluices work only beside the spring") · the RF-05b exclusion scoping (vite build:release) · ATTENDED PROBE RESULTS: release dist carries 1209 char/townsfolk assets vs the full build's 2096 (~887 missing — the walking-sheet class suspected); dry-gulch's waterSource/spring data IS present in the release bundle (8 entries).

Pre-flight (LANE-SAFETY): standard safe-dupe; npm i; tsc+build green + `GR_RELEASE=e1 npm run build:release` green.

## Scope
1. ① WHITE TOWNSFOLK: diff the two dists' asset manifests (script it; commit the diff table) → identify exactly which runtime-referenced sheets the exclusion swept (suspects: char-*-sheet-* globs matched by an era pattern, or the characters.v2.json contract path filtered) → fix the scoping so E1-REFERENCED sheets always ship (derive the keep-set from the contracts/registries actually reachable at the frontier, never filename patterns alone). Boot the release preview headless: plaza actors textured (probe: no material with a null/placeholder map on town actors).
2. ② THE DRY SPRING — ATTRIBUTE FIRST: reproduce sluice placement at the dry-gulch spring on BOTH builds headless (the run3d-interaction click grammar). If release-only → same exclusion class, fix with ①. If BOTH → it is an MQ-1-class spring bug (the pond's placement ring vs the sculpted rim — the hero stands ON rocks; check isWaterSourceAdjacent against the sculpt's water mask ring positions) → fix at the mechanism, spec on dry-gulch.
3. THE SPEC GROWS: release-build.spec.ts's first-player path extends — town actors textured + a sluice places at the dry-gulch spring (the second map joins the walk), both projects.
## Firewall: exclusion scoping + the attributed spring fix + the manifest-diff script + specs. NO art changes, NO water-mask edits unless ② demands one (cite it).
END: READY-FOR-GATES + the missing-asset diff table + the ② attribution verdict.
