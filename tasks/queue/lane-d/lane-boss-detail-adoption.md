CODEX: model=gpt-5.6-sol effort=high
# lane-boss-detail-adoption — ship the duel winners: the Opus-5 Queen and Claw
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY (owner verdict CONFIRMED 2026-07-28, rubric docs/bench/boss-detail-duel.md; perf slice = measured TIE, docs/bench/boss-duel-perf-table.md): Queen winner = dredge-queen-detail-opus5.glb (33,124 tris) · Claw winner = salvage-claw-detail-opus5.glb (30,100 tris). Both GLBs + self-reports are ON MAIN (bench branches banked). Runner-up (sol) entries stay in-tree per retention — do NOT delete anything.
READ-FIRST: assets/pilots/dredge-queen-3d/dredge-queen-detail-opus5-report.md ("Drop-in cost is one integer" — the adoption note) · src/systems/DredgeQueenBossSystem.ts:18 area (the triangle equality check) · the Salvage Claw system's equivalent constant · e2e specs asserting boss triangle counts (grep data-*-triangles + the town-plate lesson in reviews/town-era-switch.md F-1).
PRE-FLIGHT (LANE-SAFETY invariant): any dirty tracked blob must be reachable in git, else STOP.
SCOPE:
1. Point both boss systems at the -detail-opus5.glb siblings and update their TRIANGLES constants (11,832→33,124 queen; claw's shipped→30,100). The shipped originals STAY in place (rollback = one revert).
2. Update every spec/assertion pinning the old triangle counts for these two bosses — update the EXPECTATION, never weaken the assertion shape.
3. VRAM note from the winner's own report: its 2048 atlas is ~16MB of the delta; if a 1024 atlas variant is trivially producible in-repo, do NOT attempt it — note it as a follow-up instead (art-slot work, not yours).
TOUCH-ONLY: the two boss-system files' GLB path + triangle constants · specs asserting those counts. NO: GLB/blend files, Balance, other bosses, atlas processing.
SELF-CHECK: e5-deepwater + e8-mare boss specs green desktop+mobile · tsc + build · zero console in both contract boot probes · screenshot of each boss mounted (desktop) into artifacts/boss-adoption/.
READY-FOR-GATES + report: constants table (old→new), spec expectations touched, both screenshots.
