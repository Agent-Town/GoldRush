# e3-03-day-night-cycle — the town buys back the night (lane-c; commit prefix "feat:")
ROLE: engine/render system. WORKDIR: lane-c (worktrees/lane-c). CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-14 — owner GO on E3+. Slice 2 of the Canyon Works prerequisites: a real day/night cycle with light-radius gameplay, grown from the shipped Night Shift dusk rig.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe rules. If the stop-reason is an undrained sibling, report "LADDER-STALL: waiting on drain of <slice>" (fires re-queue, pre-authorized). Then `npm install --no-audit --no-fund`; `npm run build` green.

## READ-FIRST: the night-shift lighting stack (LightRig dusk ramp, lantern pools, Night Light Doctrine — carried lanterns, watch-paint, NO billboard impact planes; the owner's night rulings are LAW) · specs/epoch-saga/e3-voltage-bundle.md §B ("the first NIGHT tile": string the gorge with light, hold it through the dark; light-radius gameplay) · contract light keyframes (ContractLightKeyframe — the existing per-contract lighting channel) · performance tiers (LITE must stay readable).

## SCOPE (SYSTEM ONLY — the Canyon Works consumes it later):
1. DayNightCycle: a contract-configurable cycle (period, dusk/dawn ramps, night depth) driving the EXISTING light rig (extend keyframes to loop — don't fork the rig). Deterministic with the sim clock.
2. LIGHT-RADIUS GAMEPLAY SEAM (render+data only this slice): light sources (lanterns, powered lamps later) publish radii; a coverage query answers "how lit is point X" for FUTURE consumers (enemy behavior, visibility) — NO behavior changes yet (that's a later slice; the query + diagnostics ship now).
3. Debug harness: `?debug&daynight` on the dev tile — timescale the cycle, sample coverage at points via __GR_TEST__, screenshot ramps.
4. UI-never-tints law holds (the owner's ruling): HUD/menus stay untinted through the cycle; only the world darkens.
5. e2e `e2e/e3-day-night.spec.ts`: cycle phases hit expected light values (rig probe), coverage query correct near/far from a lantern, UI untinted at midnight (style probe), existing night-shift contract UNCHANGED (its spec green — it keeps its authored one-way ramp), zero console errors, both projects.

## Firewall
Touch ONLY: the cycle module (new), the light-rig keyframe LOOP extension (additive), the coverage query + diagnostics, the harness, the new spec, artifacts/e3-day-night/. NO night-shift contract behavior changes, NO enemy/sim changes, NO tiles.

## Self-check
tsc + build green · new spec + night-shift suite green both projects · zero console errors · a dusk→midnight→dawn screenshot strip. If you find yourself about to exit without changes, WRITE WHY into your report first.
END: READY-FOR-GATES + the cycle-config shape + coverage-query API.
