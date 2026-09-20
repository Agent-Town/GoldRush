CODEX: model=gpt-5.6-sol effort=xhigh

# lane-e2-trestle-reland — re-land the Trestle beauty shift on the moved world

ROLE: implementer on lane-c. WORKDIR: worktrees/lane-c (branch lane/c). Commit prefix `e2-trestle:`. Never touch STATUS.md, reviews/ (except copying the shift's review forward), tasks/queue/, other lanes.

PRE-FLIGHT (LANE-SAFETY INVARIANT): `git branch --show-current` = `lane/c`; any dirty tracked blob not reachable in git → STOP and report. `git checkout -B lane/c origin/main` ONLY when clean. SAFE-DUPE check: `grep -n "SCULPT_WATER_DRESSING\|below-gorge-floor" src/world/Terrain3dClaimPilot.ts` — if the dressing-table refactor is already on main, STOP and report.

## WHY
The four E2 beauty shifts launched in PARALLEL from base `8f65062e (archive: pruned by the A3 rewrite)` (2026-08-04, the alt's last day — parallelism chosen knowingly over the director's serial order). Hill-mine drained first; the other three each carry 14–17 conflict hunks against today's main because each independently reworked the shared water/pilot surfaces. Hand-grafting a subsystem refactor across ~25 merges of drift is CLAUDE.md Mistake #15; the branches re-land instead. Trestle goes FIRST because its **dressing-table refactor is the keeper design** ("a second map is a row and not a fork" — its own words) that the other two re-lands will adopt.

## READ-FIRST
1. `git log --oneline main..beauty2/e2-trestle` + `git diff main...beauty2/e2-trestle --stat` — THE BRANCH IS THE DESIGN. Your job is PORTING it onto the moved world, not re-deriving it. Read its review (`reviews/beauty-e2-trestle*.md` on the branch) for what it built and measured.
2. `src/world/Terrain3dClaimPilot.ts` on MAIN — what moved under it: hill-mine's rows (SCULPT_WATER with flat `fill`, its SunMote row, LANDMARK_CONTACT membership, `src/world/SteamPlume.ts`), far-ground's repaint hooks, perf-r2's buffer reuse. All of that STAYS.
3. `docs/beauty/e2-trestle-brief.md` + `docs/beauty/e2-launch-order.md` — the original brief and the serial order this re-land restores.
4. `vite.config.ts` release transform (~:170) — **F-RB-1 THE SINGLE-LINE LAW**: every `'e2-…'` table entry in the pilot MUST be single-line or the release build beheads it.

## SCOPE
1. Port trestle's dressing-table refactor onto main: the new `SculptWaterDressing` type (`surface` union: `channel-fill` | `below-gorge-floor`), the `SCULPT_WATER_DRESSING` table, and its consumers — **TRANSLATING main's landed rows into the new shape**: the-claim (trestle already did it, verify byte-values match main's shipped numbers) and **e2-hill-mine** (`fill: 0.42` → `surface: {kind:'channel-fill', fill: 0.42}`; find where the refactor relocated `fordSkim`/`visualHalfWidth` and carry hill-mine's 0.11/5.9 there — its FLOODED GALLERY values are measured and signed off, they must survive exactly).
2. Port trestle's own content: its dressing rows, SpanShadow, sun motes (adopt ONE SunMoteDressing shape — resolve the `color`/`colour` fork to main's existing spelling), panorama/terrain edits, `build_e2_contract_terrains.py` changes MERGED with main's landed guard (the carry-forward + refuse-to-unmount check stays verbatim), its e2e specs.
3. Every `'e2-…'` pilot entry single-line (F-RB-1).
4. Union LANDMARK_CONTACT membership: the-claim + e2-hill-mine + e2-trestle.

## TOUCH-ONLY
`src/world/Terrain3dClaimPilot.ts` · `src/world/Water.ts` if the branch touched it · `src/game/Game.ts` (the branch's one hunk) · `assets/pilots/map-rebuild-spike/` (trestle artifacts + builder) · `e2e/` (its own specs) · `reviews/` (copy the shift review forward) · `tasks/BACKLOG.md` (goal-leaf same commit).

## NO
Hill-mine's landed values (translate, never retune) · far-ground/perf-r2 landed code · sim/Balance · other maps' rows · the salvage branch itself (read-only reference).

## SELF-CHECK
tsc clean · `npm run build` green · **`GR_RELEASE=e1 npm run build:release` green (F-RB-1 gate — MANDATORY for pilot-touching work)** · trestle's own e2e specs green both projects · `e2-hill-mine.spec.ts` green UNMODIFIED (hill-mine's values survived) · `night-mode-truth` green · zero console/page errors on plain boots of the-claim + e2-hill-mine + e2-trestle · screenshots desktop+390px into `reviews/shots-e2-trestle-reland/`.

READY-FOR-GATES. Report: the fordSkim/visualHalfWidth relocation you found, hill-mine's translated row verbatim, spec results.
