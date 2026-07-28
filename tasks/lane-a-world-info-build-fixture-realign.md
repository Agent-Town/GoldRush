# Task lane-a-world-info-build-fixture-realign: diagnose WHY `world-info-notes` can no longer place its six buildables, then realign the fixture to the world as it is now — or report that the world is the thing that broke (lane-a, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome)** — s1169, 2026-07-28. Authored from F-1159-2 (`reviews/f1158-3-grant-gold-diagnostics-staleness.md:69-74`, control-proven), the fingerprint at `tasks/BACKLOG.md:1408`, the merged red inventory (`logs/suite-red-inventory.md:318-319`, `:374`), and the **shipped precedent for this exact mechanism**, F-1029-2/F-1026-5 (`tasks/BACKLOG.md:908` + `:946`, drain `df51d877`). No new scope invented.

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

READ FIRST (paths, not memory):
- `AGENTS.md`
- `e2e/world-info-notes.spec.ts` — lines 20-27 (`BUILD_NOTE_CASES`, the fixture), 107-120 (`placeBuildableAt`, where it fails at `:111`), 193-211 (the failing test)
- `src/systems/BuildSystem.ts:1479-1489` (`computeValid` — **the five rejection reasons; memorise them, they are the spine of scope 1**) and `:1491-1498` (`matchesPlacement`) and `:1500-1549` (`overlapsExisting`)
- `tasks/BACKLOG.md:908` and `:946` (F-1029-2 / F-1026-5 — the same failure mechanism, already diagnosed and cured once; read how, and read what it refused to touch)
- `e2e/f1158-ghostvalid-poll-probe.spec.ts` (the house pattern for an env-gated scratch probe — you will write one like it)

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via `git log`/`git diff`), it is a SAFE DUPE → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make.

**The dupe is PRE-PROVEN for you — do not spend budget re-deriving it.** s1169 verified at 2026-07-28T13:5xZ: `lane/m3` is 1 ahead at `d84d4d56` (`test: settle assay ghost before debug confirm`), and that content **is on main** — it shipped as `shipped-b7219ed8-…-lane-t037-ghost-settle-confirm` (F-1141-5). `git diff main d84d4d56 -- e2e/task-037-assay-bench-ungate.spec.ts` shows only main's *later* F-1157-1 `test.setTimeout(45_000)` addition, which the lane predates — i.e. main is ahead, the lane holds nothing unmerged. Textbook SAFE DUPE → reset and proceed. Re-run that one probe to confirm nothing changed since, then move on.

Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (the defect, dated)

`e2e/world-info-notes.spec.ts` fails **3 tests × 2 projects**. This task owns **exactly one of them**: `'building notes sit with existing assay and upgrade prompts'` (`:193`), which dies at **`:111`** — `expect.poll(() => build.ghostValid).toBe(true)` inside `placeBuildableAt`, i.e. **the ghost never becomes placeable and the test times out ~21 s before it asserts anything it was written to assert.**

The premise, and it is the strongest part of this task:

- **The fixture was authored against a world that no longer exists.** `git log -- e2e/world-info-notes.spec.ts` returns **exactly one commit**: `66bb9f46`, **2026-07-08**, `feat: add world info notes`. The file has never been touched since. In that same window `src/world/Terrain.ts` moved **nine times**, including `3e78b486` (07-09, *"064 river-continues — meandering river extends through the vista"*), `a0e49a96` (07-11, authored terrain grid substrate), `19d03699` (07-12, terrain-seamless), `b2b7583a` (07-18, `lane-water-mask-engine`), **`d1f549d5` (07-19, `lane-landmark-collision`)**, and `475f8597` (07-20, `lane-crossing-armed`). The six hard-coded coordinates at `:21-26` have been re-terraformed under them.
- **This exact mechanism has been diagnosed and cured once already.** F-1029-2 (`BACKLOG:908`): `m2-01:322` *"does not fail on the draw-call number: it times out inside the `placeSelected` helper polling `build.ghostValid` for 5000ms and getting `false`, because the palisade row's first target `(-6, 16)` sits inside the working-camp collision footprint. The assertion is unreachable — the guard has been vacuously red."* The cure moved **one coordinate** (`z=16` → `z=20`), kept the fixture's shape, and **refused to touch the budget it guarded**. Read that entry before you design your fix.
- **It is control-proven pre-existing and reproducible on two independent instruments**, so it is not a harness artifact: s1159 reverted its own change and got the identical failures at the identical lines (`reviews/f1158-3-…:69-74`); the `lane-055` drain fingerprinted it on clean main at `452af90c` — *"6 failed / 8 passed at `:193`/`:286`/`:318` both projects"* (`BACKLOG:1408`); and the merged red inventory records it independently (`logs/suite-red-inventory.md:318-319`, BOTH bucket, 21.4 s / 20.6 s).

⚠️ **The thing this task exists to decide, and you must not prejudge it:** a `ghostValid=false` can mean *"the fixture asks for a spot that is legitimately no longer buildable"* (fixture's fault → realign) **or** *"the game genuinely stopped allowing a placement a player would reasonably make"* (game's fault → a finding, NOT a fixture move). Moving a coordinate to make a red go green when the second is true would install a false green over a real regression. **Scope 1 exists to tell these apart before you change a byte.**

## Scope

**1. OBSERVE AND DIAGNOSE FIRST — this is a STOP gate, not a formality. No edit to the fixture is authorised until this scope has named a case AND a reason.**

Start a dev server on scratch port **5273** (NOT 5188 — `vite.config.ts` hard-codes it for every lane worktree, and lane-c is live on 5272; Mistake #12). Drive everything below against it via `GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5273`.

(a) Reproduce: `npx playwright test e2e/world-info-notes.spec.ts --workers=1`. Paste the outcome line and confirm the failure is at `:111`.
- **If `:193` PASSES, the premise of this task is refuted → STOP and report that, changing nothing.** Do not repair a defect you could not observe.

(b) **Name the failing case(s).** The test places all six of `BUILD_NOTE_CASES` in a loop, so the outcome line alone does not say which one dies. Write an **env-gated scratch probe** (pattern: `e2e/f1158-ghostvalid-poll-probe.spec.ts` — gate it on `GR_F1169_PROBE=1` so it can never join a normal suite run) that, for **each** of the six cases in order, does what `placeBuildableAt` does — `teleport(x, z+2)`, `selectBuildable(id)` — and then records, without asserting:
`id · requested (x,z) · diagnostics.build.ghostPos · ghostValid · ghostFootprint · economy.gold · the current count for that id`.
Report all six rows. **Do not stop at the first failure — later cases may fail for different reasons, and one may be blocked by an earlier case's own placement.**

(c) **Name the reason, per failing case, by elimination against `computeValid` (`BuildSystem.ts:1479-1489`).** Its five rejections are, in order: (1) count ≥ max, (2) `economy.gold` < cost, (3) `matchesPlacement` — terrain `walkable`/`buildable`/`waterSourceAdjacent`, (4) distance from the actor > `placeRadius(id)`, (5) `overlapsExisting`. Discriminate **empirically** — the reason is not exposed in diagnostics and **you may not add a seam to expose it** (see the firewall):
- (1) and (2) fall straight out of the counts and gold you recorded in (b) — `grantGold(2_000)` runs at `:195`, so state plainly whether gold was ever the binding constraint.
- (4): re-probe with the actor teleported **exactly onto** the target instead of `z+2`. If it goes valid, the reason is reach.
- (3) vs (5): sweep a small grid around the requested point (say ±6 in steps of 1 on both axes) and report **the nearest cell where `ghostValid` reads true**, plus how many of the swept cells were valid. Then repeat the sweep **on a fresh page with nothing else built** (place only that one case). If the point is valid alone but invalid inside the six-case loop, the reason is (5) and the blocker is one of the fixture's own earlier placements. If it is invalid in both, the reason is (3) — terrain.
- ⚠️ `sluice` is special and worth its own sentence: `matchesPlacement` requires `waterSourceAdjacent` within `Balance.sluice.riverPad`. If `sluice` at `(-4, 7)` is the casualty, say explicitly whether **any** cell in the sweep is valid — because *"the river moved away from the fixture"* and *"sluices can no longer be placed near this river at all"* are different findings with different owners.

(d) **Write the verdict sentence before you edit anything**, in the form: *"case `<id>` at `(x,z)` fails reason `<n>`; the nearest valid cell is `(x',z')`, `<d>` units away; this is a FIXTURE fault / a WORLD fault because …"*.
- **If any case's verdict is a WORLD fault** — no valid cell within the sweep, or a buildable that a player could plainly no longer place where the game invites them to — **STOP. Report it as a finding with your evidence and change nothing.** That is a src-side regression, it is outside this lane's firewall, and it is worth more as a clean finding than as a buried coordinate move. *Reject-don't-stretch.*

**2. Realign the fixture — minimally, and only for cases scope 1(d) called a FIXTURE fault.**
- Change **only** the `x`/`z` numbers at `e2e/world-info-notes.spec.ts:21-26`. Move the **fewest** cases that make the test pass, and move each the **shortest** distance that scope 1(c) proved valid.
- **Preserve the fixture's shape:** all six entries stay, with their existing `id`, `objectClass` and `text` unchanged — the test's job is to prove each of six distinct object classes gets its note, and dropping or merging a case would quietly shrink the guard. (Precedent: the F-1029-2 cure kept "six beacons + twelve palisades" exactly.)
- Keep the cases mutually non-overlapping — verify by re-running your scope-1(b) probe after the move, not by eye.
- Add **one brief comment** above the array naming the date, this task, and why the coordinates are what they are, so nobody "tidies" them back. (The F-1029-2 cure did exactly this and it is why that coordinate survived.)

**3. Prove the cure in BOTH directions. A guard that cannot fail is not a guard.**
- **(a) The defect is gone:** `npx playwright test e2e/world-info-notes.spec.ts --workers=1` against port 5273, **both projects**. Paste the outcome line. Expected: `:193` now passes on desktop-chrome AND mobile-chrome.
- **(b) The test still really tests:** the point of `:193` is the notes, not the placing. Confirm from the run that the assertions **past** `:111` now execute — `:200-204` (each of the six object classes shows its note text) and `:206-211` (the assay prompt, then the bench after Enter). Paste evidence that these ran, not merely that the test was green.
- **(c) It can still FAIL:** temporarily point **one** case at a coordinate scope 1 proved invalid, re-run, and paste the failure at `:111` proving the poll is still a live guard. **Then revert it** and paste `git diff -- e2e/world-info-notes.spec.ts` showing the intended fixture restored.
- **(d) The two sibling reds are UNCHANGED:** paste the per-test result for `:286` and `:318` from your scope-3(a) run. They are expected to **still fail**, at `:301` and `:335` respectively. If either changed state, say so loudly — that is a finding either way.

**4. Report the class, do not fix it beyond scope.** `grep -rn "ghostValid" e2e/` and report how many other specs poll it behind a hard-coded coordinate fixture of the same shape. **Change none of them.** F-1158-1 already measured this family (40 sites, 31 removable `.toBe(true)`, 9 load-bearing `.toBe(false)` — `BACKLOG:30`) and ruled **DO NOT AUTHOR** a sweep; you are only recording whether any *other* spec is sitting on a coordinate the terrain has moved under, as a finding for the drain fire.

## Firewall

**TOUCH-ONLY:** `e2e/world-info-notes.spec.ts` (**the `BUILD_NOTE_CASES` coordinates at `:21-26` and one comment above them — nothing else in the file**) · your env-gated probe spec in `e2e/` · your run report in `tasks/runs/`.

**NO (do not touch, do not "improve"):**
- **Any `src/**` file.** Not `BuildSystem.ts`, not `Terrain.ts`, not `Balance.ts`, and **no new diagnostics seam** to expose the rejection reason — scope 1(c) is deliberately empirical. If the cure genuinely requires a src change, that is the WORLD-fault STOP in scope 1(d), not a licence.
- **`e2e/world-info-notes.spec.ts:286-338`** — the other two failing tests. `:286`/`:301` (the town dead-reckoning walk) is the next fire's target, not yours. **`:318`/`:335` is under an OPEN OWNER FORK** — F-1141-3 + F-1164-1, one decision at `src/styles.css:1620`, `BACKLOG:1533`. Touching it would pre-empt a decision reserved for Robin.
- Any other `e2e/**` spec.
- `test.skip`, `test.fixme`, `test.retry`, `testInfo.setTimeout`, any timeout increase, or any weakening of an assertion. **The 5 000 ms poll budget at `:111` stays exactly as written** — *a budget edited to fit its measurement is not a guard* (F-1047-1). If the placement is legitimate the ghost settles well inside it; if it does not, that is the finding.
- `logs/suite-red-inventory.md` — a merged artifact whose byte-reproducibility is a proven property (s1167); do not annotate it.

## Self-check before you report READY-FOR-GATES
- `npx tsc --noEmit` clean.
- `npm run build` green.
- Scope 1 produced the six-row table, a named reason per failing case, and the explicit verdict sentence of 1(d) — **before** any fixture edit.
- Scope 3 recorded (a) the green outcome line on **both** projects, (b) evidence the post-`:111` assertions executed, (c) a real induced failure **and** the reverted diff, (d) the unchanged status of `:286` and `:318`.
- Adjacent suites unmodified-green, **both projects (desktop-chrome + mobile-chrome), zero console/page errors**: `e2e/m2-01-build-menu.spec.ts` (the F-1029-2 fixture, the closest relative of this change) and `e2e/task-037-assay-bench-ungate.spec.ts` (the other build-then-assert spec, and this lane's most recent landing). Name the exact suites and paste the counts.
- `git diff --stat` shows **exactly two tracked files** changed (the spec and your probe) — and confirm in one sentence that the probe is env-gated so a normal suite run skips it.

**READY-FOR-GATES** + report: the scope-1 six-row table with the per-case reason and the 1(d) verdict sentence, the exact coordinate moves with their distances, the scope-3 four-way proof (a/b/c/d), and the scope-4 grep count. If you STOPPED at 1(a) or 1(d), report that instead — **a STOP with a named reason and a six-row table is a full success for this task**, and is worth more than a coordinate moved on a guess.
