# e2-pressure-in-run — boilers, coal, venting: the Steamworks mechanic goes live
ROLE: systems implementer. WORKDIR: lane-c (worktrees/lane-c).
CODEX: model=gpt-5.6-sol effort=high

## WHY (BUILD-PLAN §4 E2 item ②; owner activated E2 this morning — the era's resource exists but nothing in-run makes or spends it)
Pressure shipped as a RESOURCE (economy rows + `grantPressure` debug seam, `a21821a`); the bundle's in-run loop (boilers generate ↔ machines consume ↔ over-pressure vents) is unbuilt. This slice is the Steamworks' heartbeat; per the bundle: "over-pressure is both a resource bank and a hazard (vent or boom — warm boom: comedic steam clouds, never harm)."

## READ-FIRST
- specs/epoch-saga/e2-steamworks-bundle.md (§A1 Boiler House, §B Hill Mine: coal seams ×3 near the minehead, over-pressure vents on T1 as teaching spots, "pressurize: keep 2 boilers hot through waves 8–12")
- src/game/Balance.ts (pressure rows), src/game/Game.ts:1090 grantPressure (the resource write path — Economy is the sole gold writer; pressure follows the same one-writer law)
- src/systems/BuildSystem.ts + an existing buildable (Sluice.ts is the economy-building template), src/entities/Turret.ts (boiler-fed battery scaling hooks here later — NOT this slice)
- assets/contracts/epoch-2-steamworks/* (research effectRefs: pressure_assay, coal_survey — respect their gates)

## SCOPE (this slice = generate/consume/vent; the battery transform is slice ⑤'s)
1. BOILER HOUSE buildable on E2 tiles: placeable (placeholder box + sign until the art batch lands — placeholder-first law), consumes coal, generates pressure per tick while fueled.
2. COAL: harvestable seams on the Hill Mine (the bundle's 3 minehead seams; coal_survey research reveals marks per its effectRef).
3. PRESSURE STORE + GAUGE: run-level store with a HUD gauge (safe band per pressure_assay research); over the band → the boiler VENTS: comedic steam plume, loses banked pressure, brief self-cooldown. Never damages people (warm law); can shove small enemies back (optional, only if trivial).
4. "PRESSURIZE" contract objective: hold N boilers hot through waves X–Y (wire e2-hill-mine's defend variant per bundle §B objectives).
5. Determinism: all pressure ticks inside the fixed-step sim; MP posture = lockstep-clean (state in snapshot v2) or declare sp-gated with a finding line.

## TOUCH-ONLY: new src/entities/BoilerHouse.ts, src/systems/ (pressure tick — one writer), BuildSystem registration, Balance pressure rows, HUD gauge element, e2e new spec, artifacts/.
## NO: Turret.ts scaling (slice ⑤), art files, epoch manifests' research data, Terrain, MP protocol files.
## SELF-CHECK: tsc; build; new e2e (build boiler → coal feeds → gauge climbs → vent fires at over-band → pressurize objective completes) green BOTH projects; e2-hill-mine + 045 + 072 + m1-01 + m2-01 unmodified-green; zero console; determinism fingerprint unchanged on E1 claim; screenshots.
END: READY-FOR-GATES + gauge/vent screenshots + MP posture line.
