CODEX: model=gpt-5.6-sol effort=xhigh

# lane-e2-incline-reland — re-land the e2-incline beauty shift (ladder ③, the LAST of the Mistake #15 set)

**FIRE-AUTHORED (attended review welcome)** — s1457, 2026-08-05. Authored from `reviews/beauty-e2-incline.md` (429 lines, on branch `beauty2/e2-incline`) plus the two predecessors that already re-landed by this exact method.

ROLE: implementer on lane-c. WORKDIR: worktrees/lane-c (branch lane/c). Commit prefix `e2-inc:`. Never touch STATUS.md, tasks/queue/, other lanes, or `reviews/` except copying this shift's own review forward.

PRE-FLIGHT (LANE-SAFETY INVARIANT): `git branch --show-current` = `lane/c`; any dirty tracked blob not reachable in git → STOP and report. `git checkout -B lane/c origin/main` ONLY when clean.

**FACTORY-CHURN EXCEPTION (F-1407-1/F-1408-1):** modifications confined to `logs/` (dashboard, goal tree, usage, task stats) are factory telemetry, NOT dirt — they never justify a STOP.

**SAFE-DUPE CHECK — run it and read the NUMBER, not your memory of the map:**
`grep -c "'e2-incline': { surface" src/world/Terrain3dClaimPilot.ts`
Expected **0** → proceed. **1 or more** → the dressing row already landed; STOP and report.
⚠️ This is the CORRECTED shape. The pressure-garden re-land's first dispatch STOPPED falsely because a looser grep matched the month-old GLB **registry** entry, which is wiring, not beauty — 29,320 tokens for nothing. **Only a DRESSING row counts as a dupe.** The registry entries, the dressing table itself, and the hill-mine / trestle / pressure-garden rows are your SUBSTRATE, not dupes.

**SUBSTRATE PROOF — prove the lane has the two predecessors before you write a line.** Both must return **1**:
- `grep -c "'e2-pressure-garden': { surface: { kind: 'channel-fill', fill: 0.11 }" src/world/Terrain3dClaimPilot.ts`
- `grep -c "const LANDMARK_CONTACT_CONTRACTS = new Set([" src/world/Terrain3dClaimPilot.ts`

Either returns 0 → the lane is stale or the reset did not take. **STOP and report the lane's base — do not work around it.** (Both keys were verified to return exactly 1 on main at authoring time, so a 0 here means the LANE drifted, not that the key is wrong.)

## WHY
The four E2 beauty shifts launched in PARALLEL from base `8f65062e` (2026-08-04). Hill-mine drained first. Each of the other three independently reworked the shared water/pilot surfaces, so each carries double-digit conflict hunks against today's main — hand-grafting a subsystem refactor across that much drift is CLAUDE.md **Mistake #15**. They re-land instead. **Trestle re-landed as ladder ① (`7e5fae14`), Pressure Garden as ladder ② (`25890bae`).** You are ladder ③, the last one, and you have the easiest substrate of the three because both predecessors' shared machinery is now ON MAIN.

Its own review, verbatim, on what shipped: *"4 of 5 upgrades KEPT and one cross-map defect cured. U1, U2, U3 and U4 all ship; U5 ships as motes plus the graduation frame but without the staged defeat beat."* The map's central lie is *"a band the sim calls water and the render drew as a void"*.

⚠️ **CARRY ITS HONESTY FORWARD, DO NOT UPGRADE IT.** The review states the perf p95 *"could not be measured on this box and is reported as unmeasured, not as passed"*, and marks **U5 PARTIAL**. Your re-land keeps both statements exactly as they are. **Do not report U5 as complete and do not claim a p95 you did not measure.** The deterministic half IS measured and must survive: desktop **90 → 92 draw calls**, **105,572 → 105,692 triangles**; mobile 390 **57 → 60 calls**, **103,842 → 103,964 triangles** — +122 triangles being the water quad (2) plus five 24-segment contact ellipses (120), exactly.

## READ-FIRST
1. `git diff main...beauty2/e2-incline --stat` and its review `reviews/beauty-e2-incline.md` — **THE BRANCH IS THE DESIGN.** Your job is PORTING it onto the moved world, not re-deriving it. Its §"Merge classification" table names every file and why.
2. `src/world/Terrain3dClaimPilot.ts` on MAIN — what moved under it since `8f65062e`: hill-mine's `SCULPT_WATER` rows with flat `fill`, its SunMote row and `LANDMARK_CONTACT` membership, trestle's and pressure-garden's dressing rows, far-ground's repaint hooks, perf-r2's buffer reuse. **All of that STAYS.**
3. `reviews/beauty-e2-pressure-garden.md` §DRAIN VERDICT and `reviews/beauty-e2-trestle.md` — how the two predecessors translated branch-shape values into the landed `surface` union. Do exactly that.
4. `vite.config.ts` release transform (~:170) — **F-RB-1 THE SINGLE-LINE LAW**: every `'e2-…'` table entry in the pilot MUST be single-line or the release build beheads it.

## SCOPE
1. Port e2-incline's rows into main's LANDED dressing table, translating branch-shape values into the `surface` union exactly as ladders ① and ② did. **Measured values survive exactly — never retuned.**
2. Port `src/world/HaulSteam.ts` as a NEW additive module (verified absent from main at authoring time — it is U4's capped instanced pool, so it adds nothing when drained).
3. Port `Water.ts`'s `fordCenters` (N fords in the shader), the `bakeBed` opt-out and its cache-key entry — **as opt-in knobs defaulting to today's values**, the way the pressure-garden re-land did. No landed map's water may change.
4. Port `src/game/Game.ts`'s one read-only `haulCart` view handed to the pilot host. One hunk, read-only.
5. Port the builder work in `assets/pilots/map-rebuild-spike/`: `carry_forward_mount_records` MERGED with main's landed guard (**carry-forward + refuse-to-unmount stays verbatim**), the five incline mounts, `landmarkPack` re-attach, U2 paint, and `verify_e2_contract_terrains.py` incline `mounts` 0 → 5, plus the re-exported terrain family.
6. Port the F-BI-1 landmark-grade clobber CURE if main still carries the defect. **CHECK FIRST** — F-PG-2 cured the same class from the pressure-garden branch, so this may already be discharged. If it is, say so and port nothing.
7. Every `'e2-…'` pilot entry single-line (F-RB-1).
8. Union `LANDMARK_CONTACT` membership: main's landed set + e2-incline.
9. Copy `reviews/beauty-e2-incline.md` and its `reviews/shots-beauty2-e2-incline/` boards forward.

## TOUCH-ONLY
`src/world/Terrain3dClaimPilot.ts` · `src/world/Water.ts` · `src/world/HaulSteam.ts` (new) · `src/game/Game.ts` (the one hunk) · `assets/pilots/map-rebuild-spike/` · `e2e/` (its own specs only) · `reviews/beauty-e2-incline*.md` + `reviews/shots-beauty2-e2-incline/` · `tasks/BACKLOG.md`.

## NO
Hill-mine / trestle / pressure-garden landed values (translate, never retune) · far-ground and perf-r2 landed code · `src/sim/**` and `Balance.ts` — **this shift is RENDERING ONLY, zero sim bytes** · other maps' rows · the salvage branch itself (read-only reference) · `e2e/e2-hill-mine.spec.ts`, `e2e/e2-trestle.spec.ts`, `e2e/e2-pressure-garden.spec.ts` — those are JUDGES, never edit them to make a red go away.

## SELF-CHECK
- `npx tsc --noEmit` clean
- `npm run build` green
- **`GR_RELEASE=e1 npm run build:release` green — F-RB-1 gate, MANDATORY for pilot-touching work**
- e2-incline's own e2e spec green BOTH projects (desktop-1280x800 + mobile-390x844)
- `e2-hill-mine.spec.ts` + `e2-trestle.spec.ts` + `e2-pressure-garden.spec.ts` green **UNMODIFIED** — the landed maps' values survived. ⚠️ `e2-hill-mine` carries a DOCUMENTED pre-existing red: **10 pass / 2 skip / 2 fail**, at `:131`, asserting at `:166`, received `-0.45728564262390137` against expected `-0.5`. That exact shape is the F-BHM-3 baseline and was control-proven on clean main by the s1457 drain. **Any OTHER hill-mine failure is yours and blocks.**
- `night-mode-truth` green
- zero console/page errors on plain boots of the-claim + e2-hill-mine + e2-trestle + e2-pressure-garden + e2-incline
- screenshots desktop + 390px into `reviews/shots-e2-inc-reland/`
- report the deterministic draw-call/triangle deltas against the numbers quoted in WHY, and say plainly whether they still hold

**Goal leaf:** `beauty2-e2-incline` is ALREADY REGISTERED in `tasks/goals.json` (status `building`) — do not create a second one. The drain flips it.

READY-FOR-GATES. Report: the translated incline rows verbatim, the spec results, the deterministic perf deltas, whether F-BI-1 was already discharged, and U5's status stated as the PARTIAL it is.
