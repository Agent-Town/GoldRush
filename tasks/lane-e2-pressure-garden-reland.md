CODEX: model=gpt-5.6-sol effort=xhigh

# lane-e2-pressure-garden-reland — re-land the Pressure Garden beauty shift (ladder ② — the dressing table is now LANDED)

ROLE: implementer on lane-c. WORKDIR: worktrees/lane-c (branch lane/c). Commit prefix `e2-pg:`. Never touch STATUS.md, reviews/ (except copying the shift's review forward), tasks/queue/, other lanes.

PRE-FLIGHT (LANE-SAFETY INVARIANT): `git branch --show-current` = `lane/c`; any dirty tracked blob not reachable in git → STOP and report. `git checkout -B lane/c origin/main` ONLY when clean. SAFE-DUPE check (CORRECTED after a false STOP — the first grep matched the month-old 27-map GLB REGISTRY at pilot:162, which is wiring, not beauty): `grep -n "'e2-pressure-garden': { surface" src/world/Terrain3dClaimPilot.ts` — only a DRESSING row is a dupe. The registry entries, the dressing table itself, and hill-mine/trestle rows are your substrate, not dupes.

## WHY
The four E2 beauty shifts launched in PARALLEL from base `8f65062e (archive: pruned by the A3 rewrite)` (2026-08-04, the alt's last day — parallelism chosen knowingly over the director's serial order). Hill-mine drained first; the other three each carry 14–17 conflict hunks against today's main because each independently reworked the shared water/pilot surfaces. Hand-grafting a subsystem refactor across ~25 merges of drift is CLAUDE.md Mistake #15; the branches re-land instead. Trestle re-landed first (`fb3bf0b0`) and its dressing table + SpanShadow + sun-mote shapes are ON MAIN. Pressure Garden now re-lands as ROWS AND ADDITIVE MODULES against that substrate — where its branch carries its own copy of shared machinery, ADOPT main's landed version and port only what is uniquely pressure-garden's (its review on the branch names its upgrades: terrace shadows, boot-camera reads, steam work).

## READ-FIRST
1. `git log --oneline main..beauty2/e2-pressure-garden` + `git diff main...beauty2/e2-pressure-garden --stat` — THE BRANCH IS THE DESIGN. Your job is PORTING it onto the moved world, not re-deriving it. Read its review (`reviews/beauty-e2-trestle*.md` on the branch) for what it built and measured.
2. `src/world/Terrain3dClaimPilot.ts` on MAIN — what moved under it: hill-mine's rows (SCULPT_WATER with flat `fill`, its SunMote row, LANDMARK_CONTACT membership, `src/world/SteamPlume.ts`), far-ground's repaint hooks, perf-r2's buffer reuse. All of that STAYS.
3. `docs/beauty/e2-pressure-garden-brief.md` + `docs/beauty/e2-launch-order.md` — the original brief and the serial order this re-land restores.
4. `vite.config.ts` release transform (~:170) — **F-RB-1 THE SINGLE-LINE LAW**: every `'e2-…'` table entry in the pilot MUST be single-line or the release build beheads it.

## SCOPE
1. Port pressure-garden's rows into main's LANDED dressing table (translate its branch-shape values into the `surface` union exactly as the trestle re-land did for hill-mine — measured values survive exactly, never retuned).
2. Port pressure-garden's unique content: its panorama/terrain edits, its `build_e2_contract_terrains.py` additions MERGED with main's landed guard (carry-forward + refuse-to-unmount stays verbatim), its e2e specs, its review forward.
3. Every `'e2-…'` pilot entry single-line (F-RB-1).
4. Union LANDMARK_CONTACT membership: main's landed set + e2-pressure-garden if its brief mounts contact-worthy landmarks.

## TOUCH-ONLY
`src/world/Terrain3dClaimPilot.ts` · `src/world/Water.ts` if the branch touched it · `src/game/Game.ts` (the branch's one hunk) · `assets/pilots/map-rebuild-spike/` (trestle artifacts + builder) · `e2e/` (its own specs) · `reviews/` (copy the shift review forward) · `tasks/BACKLOG.md` (goal-leaf same commit).

## NO
Hill-mine's landed values (translate, never retune) · far-ground/perf-r2 landed code · sim/Balance · other maps' rows · the salvage branch itself (read-only reference).

## SELF-CHECK
tsc clean · `npm run build` green · **`GR_RELEASE=e1 npm run build:release` green (F-RB-1 gate — MANDATORY for pilot-touching work)** · trestle's own e2e specs green both projects · `e2-hill-mine.spec.ts` + `e2-trestle.spec.ts` green UNMODIFIED (landed maps' values survived) · `night-mode-truth` green · zero console/page errors on plain boots of the-claim + e2-hill-mine + e2-trestle + e2-pressure-garden · screenshots desktop+390px into `reviews/shots-e2-pg-reland/`.

READY-FOR-GATES. Report: pressure-garden's translated rows verbatim, spec results.
