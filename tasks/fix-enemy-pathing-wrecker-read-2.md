# fix-enemy-pathing-wrecker-read-2 — the lone runner still reaches the hero (finite-line routing fix) (lane-a; commit prefix "fix:")
ROLE: gameplay AI. WORKDIR: lane-a (worktrees/lane-a). CODEX: model=gpt-5.6-sol effort=high
**FIRE-AUTHORED 2026-07-13 (s461, attended review welcome).** CORRECTIVE to attempt-1 `d010af89` (lane/m3), REJECTED at the drain gate for a fingerprint-proven regression. Attempt-1 is the SALVAGE-REF — keep its verified wins (crowd gap-flow 8/8, enclosure gnaw, wrecker tell, suspend/restore); this attempt ONLY fixes the finite-line routing and re-guards it.

## PRE-FLIGHT (RE-LAND premise — attempt-1 is rejected, not a safe-dupe):
lane/m3 currently holds the REJECTED tip `d010af89` (genuinely ahead of main, NOT on main). A blind safe-dupe reset would DESTROY it. **Before running:** confirm lane-a's branch has been reset to current main by a permitted session (attended/manual) — if lane/m3 is still ahead of main and `d010af89` is not on main, STOP and report "LADDER-STALL: lane-a still holds rejected attempt-1; needs reset-to-main". Salvage the good hunks from `d010af89` (it is the reference for gap-flow/gnaw/tell — re-apply those verbatim; they gated green). Then `npm install --no-audit --no-fund`; `npm run build` green.

## WHY (gate evidence, s461 fire — verbatim finding):
- **F-1 (BLOCKING):** attempt-1's new committed gap-flow **regressed `m2-01-build-menu.spec.ts:236` "single enemy slides around a finite palisade line without passing through"** on BOTH projects — `tracker.reached` came back `false`: a lone enemy no longer reaches the hero around a **finite** palisade line within the 20s budget (it does not pass through — it gets stuck / mis-routes). Fingerprint: reverting the 8 src files to clean main → **2/2 PASS**; the graft → 2/2 FAIL. Introduced by attempt-1, not pre-existing.
- Owner (original, verbatim): "They often are behaving rather stupid when they walk - or get stuck." A lone enemy failing to reach the hero is the SAME stuck-walker bug the task set out to kill — the crowd fix must not create a single-enemy version of it.

## ROOT-CAUSE HYPOTHESIS (trace, don't trust):
attempt-1's gap-flow commits to the nearest gap in a blocking RUN and holds the chosen side until "the wall run ends or the gap is reached". A **finite** palisade line's gap is at its END (not a mid-run interval). Likely failure: the enemy commits to the far side / wall-follows away from the hero, or the "wall run ends" condition doesn't fire cleanly at a finite line's end, so it never re-acquires the direct path within 20s. Fix the finite-line / open-end case specifically — for a FINITE run the nearest end is a valid gap and the enemy must route around the CLOSER end toward its target, then resume direct pursuit.

## SCOPE:
1. **FINITE-LINE ROUTING FIX**: a single non-wrecker blocked by a finite palisade line routes around its NEAREST END and reaches the target — never stalls past the watchdog, never oscillates. Preserve the crowd behaviour (8-through-a-gap) and the committed-side anti-oscillation; this is an additive correctness fix to the end-of-run / open-end case, not a rewrite.
2. **PRESERVE attempt-1's verified wins** unchanged: enclosure gnaw (`gnawMult=0.25`, watchdog, stop-on-breach), wrecker `wreckerMarker`/`markerColor` tell, gnaw suspend/restore, `wreck.gnawing`/`wreck.stuckWatchdogTrips` diagnostics.
3. **RE-GUARD**: `e2e/enemy-gap-flow.spec.ts` keeps all 7 cases green AND add a case: a lone enemy vs a FINITE palisade line reaches the hero with zero watchdog trips (mirror the m2-01:236 scenario at the gap-flow layer).

## Firewall
Touch ONLY: `src/entities/Enemy.ts` steering/blocker/watchdog paths, the minimal `BuildSystem` read-only gap-query accessor, `Balance.wreck.gnawMult` (+ pathing constants), the wrecker tell in the enemy presentation channel, `e2e/enemy-gap-flow.spec.ts`, `artifacts/enemy-gap-flow/`. NO CombatSystem damage resolution (gnaw calls the SAME `context.hitBuilding` at the reduced rate), NO wave composition, NO hero/thief behavior, NO boss logic, NO m2-01 spec edits (it is the GUARD — make it pass, do not change it).

## Self-check (the gate that attempt-1 missed):
tsc + build green · **`e2e/enemy-gap-flow.spec.ts` (all cases incl. the new finite-line case) green both projects** · **`m2-01-build-menu` green both projects — especially `:236 single enemy slides around a finite palisade line`** · task-025 + m1-01 + e2-escort-mode + baron battery (054/055/057/e1-baron) UNMODIFIED (baron's known pre-existing reds reproduce on clean base — fingerprint, don't chase) · zero console/page errors both projects · a 10s capture of the lone-enemy-vs-finite-line scenario reaching the hero.
If you find yourself about to exit without changes, WRITE WHY into your report first.
END: READY-FOR-GATES + confirm m2-01:236 green both projects + finite-line watchdog stats.
