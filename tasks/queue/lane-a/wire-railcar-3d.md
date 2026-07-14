# wire-railcar-3d — the locomotive takes the stage (lane-a; commit prefix "feat:")
ROLE: boss presentation. WORKDIR: lane-a (worktrees/lane-a). CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-14 — Sol wave-4 model MERGED (assets/pilots/railcar-3d/, 10,948 tris, THREE named damage components + morphs). Owner: "we now have to make sure it is disposable and have to prepare for the damage and destruction in the fight."

Pre-flight (LANE-SAFETY): standard safe-dupe rules; LADDER-STALL protocol stands. Then npm install; build green.

## READ-FIRST: assets/pilots/railcar-3d/README.md (Sol's handoff: component/morph names, axes, scale) · the current railcar presentation (fc581ab5 + the patrol fix on its lane — build on BOTH) · the boss component model (WaveSystem spawnComponentBossWave: wheels/boiler/cabin components with own HP + bossDegradeSpeedMult) · the run3d pilot loader pattern (contract checks, disposal law) · plate-e2-boss-component (the art truth the model matches).

## SCOPE:
1. MOUNT: the GLB replaces the billboard presentation for the railcar boss group — ONE loaded model, seated on the rail (y from rail line), oriented along travel; components map to the THREE named sub-meshes.
2. DAMAGE TRUTH (the owner's "prepare for damage and destruction"): each component's HP drives its damage state — swap/morph to bent-wheels / venting-boiler / cracked-cabin at thresholds (Sol shipped morphs — use them; document thresholds); a DEAD component visibly stays broken while the group lives.
3. DISPOSAL LAW: on boss death/despawn/wave-end/run-end the model unmounts and disposes fully (geometry+material+textures — the pilot dispose pattern; assert renderer counts return to baseline). LITE/load-failure falls back to the current billboard presentation (never blocks the fight).
4. e2e `e2e/wire-railcar-3d.spec.ts`: boss spawn mounts the GLB (probe), scripted component damage flips its damage state (per-component probes ×3), kill → full disposal (renderer texture/geometry counts baseline), LITE keeps billboard, fallback on invalid bytes, patrol/visibility laws still hold; zero console errors; both projects. 057 + railcar suites UNMODIFIED-green.

## Firewall
Touch ONLY: the railcar presentation module (mount/damage/disposal), the new spec, artifacts/wire-railcar-3d/. NO HP/damage/spawn numbers, NO Sol assets, NO choreography (a sibling slice owns the fight's acts — keep the presentation seam clean for it).

## Self-check
tsc + build green · new + 057 + railcar suites green both projects · zero console errors · screenshots: intact on rail, each damage state, post-kill baseline counts. If you exit without changes, WRITE WHY first.
END: READY-FOR-GATES + the threshold table + disposal count evidence.
