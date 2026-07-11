# Task 086-fixture-runtime-seams: lanterns honor their rotation + the placement predicate goes pure (lane-c; commit prefix "fix:")
CODEX: model=gpt-5.6-sol effort=medium
FROM F-ED04-02 + F-ED04-04 (reviews/sol-findings-ed-04-gizmos.md on sol/ed-04-gizmos — READ both; file:line evidence precise). Two commits:
1. **Lantern rotation is real:** BuildSystem's lantern dispatch forwards rotationSteps (BuildSystem.ts:1260-1267 drops them); LanternPostPool stores/renders per-instance rotation (arm/lantern side honors it); RunSuspend building capture records non-palisade rotation truthfully (RunSuspend.ts:978-1000 zeroes it). Night Shift's 7 prePlacedBuildables render their authored rotations; suspend round-trip preserves them (e2e asserts both).
2. **The placement predicate goes pure:** extract BuildSystem's matchesPlacement/overlapsExisting core into an exported PURE function (descriptor-shaped inputs, zero system state) — BuildSystem calls it (behavior byte-identical, its tests green); the editor may consume it later (do NOT wire the editor here).
Gates: tsc/build · night-shift + build/placement suites + run-suspend green · determinism hash unchanged solo.
Firewall: BuildSystem, LanternPostPool region, the RunSuspend building-capture lines, the new pure module, e2e. NO editor code, NO descriptor schema.
End: READY-FOR-GATES + before/after Night Shift lantern screenshots.
