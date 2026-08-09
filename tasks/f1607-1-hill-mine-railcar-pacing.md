# f1607-1 — the Hill Mine railcar dies sooner (owner: "Tune the fight shorter")

**FIRE-AUTHORED (attended review welcome)** — s1607, 2026-08-10.
**Role:** you are the lane-a runner. **Workdir:** `worktrees/lane-a` (branch `lane/a` — resolved from
`git worktree list`, never from prose; F-1464-3).

## READ FIRST (paths, in this order)
1. `tasks/BACKLOG.md` — grep `Hill Mine railcar "Tune the fight shorter"` (the owner ruling, 1 hit) and
   grep `F-1493-3` for the full finding and its history.
2. `assets/contracts/epoch-2-steamworks/contracts.json` — the `e2-hill-mine` contract, its `twist.baron` block.
3. `e2e/e2-hill-mine.spec.ts` — your gate spec.
4. `src/systems/WaveSystem.ts:854-880` — where `twist.baron` becomes the spawned railcar group.
5. `CLAUDE.md` §4 (conventions) and §6 (quality bars).

## PRE-FLIGHT (run every step; STOP and report rather than improvising)
1. `cd worktrees/lane-a` and confirm `git rev-parse --abbrev-ref HEAD` prints `lane/a`.
   If it prints anything else, **STOP** — the slot mapping moved and this master is aimed wrong.
2. `git status --porcelain` must be empty of **tracked** dirt. Untracked factory churn
   (`artifacts/`, `logs/`, `test-results/`, `reviews/shots-*`, `*.png`, `*.json` under those trees) is
   **EXPECTED and is NOT a reason to stop** (F-1407-1 FACTORY-CHURN). Tracked dirt = **STOP**.
3. `git fetch origin` (ignore failure — may be offline) then **`git reset --hard main`**.
   This is a SAFE-DUPE reset: `lane/a` was measured `ahead=0` vs main at authoring time
   (s1607, after the rf-34 drain merged at `65693574f`), so it holds nothing unmerged.
   If `git log main..HEAD` is **non-empty** before you reset, **STOP** — something landed after
   authoring and resetting would destroy it.
4. **Only now** check the premises (the reset above is what makes them meaningful):
   - `grep -c '"arrivalTitle": "THE ARMORED RAILCAR"' assets/contracts/epoch-2-steamworks/contracts.json`
     must print **1**. If it prints 0, the contract was restructured — **STOP and report**.
   - `grep -c '"hpScale": 30,' assets/contracts/epoch-2-steamworks/contracts.json` must print **3**.
     That 3 is the point of scope item 4 below — read it before you touch anything.

## WHY (evidence, quoted and dated)
**Owner ruling, 2026-08-09 desk walkthrough, verbatim:** *"Tune the fight shorter"* — recorded in
`tasks/BACKLOG.md` as `Hill Mine railcar "Tune the fight shorter" (F-1493-3 ruled, fire-authorable)`,
and in the F-1493-3 row as: *"treated as real pacing feedback, NOT a rig artifact. FIRE-AUTHORABLE:
a Hill Mine railcar balance pass (browser-side; the map stays door-de-listed per F-E2S-3 until the
socket). GATE: balance master merged."*

The finding it answers (F-1493-3, s1493): *"is the Railcar taking until wave 14 to die — under a test
rig with 100,000 HP — acceptable tuning for Hill Mine?"* The fire's own recommendation was *accept*;
**the owner overruled it.** His word is the ruling (CLAUDE.md §4.7), so this master tunes.

⚠️ **Two rulings constrain HOW, and neither may be quietly worked around:**
- **F-E2S-3 (owner, 2026-08-09):** `e2-hill-mine` is **de-listed from the headless door** until the
  pressure-to-damage socket ships. This pass is **browser-side only**. Do **not** re-list it, and do
  **not** reach the map through `HeadlessContractSim` with `--mode` — that was explicitly forbidden
  as era-false and as gaming the refusal.
- **F-1492-2 / F-1441-3:** raising Hill Mine's `secureWave` 12 → 14 was already **rejected by name**
  as *"the re-pin reflex in a data file's clothes."* `secureWave` is **NOT** your knob (see NO list).

## SCOPE (numbered; each item is testable)
1. **MEASURE BEFORE YOU TUNE — no number moves until the current fight is instrumented.**
   Drive a real browser run of `e2-hill-mine` to the baron (arrives wave 12) and record, as
   **four numbers written into your report**: (a) the wave at which the railcar is destroyed,
   (b) the elapsed sim seconds from arrival to destruction, (c) the share of damage absorbed by
   each of the three components (`wheels` / `boiler` / `cabin`), and (d) how many of the 6 escorts
   are alive at destruction. A temporary instrumentation harness under `e2e/` is fine **for the
   measurement**; it must not remain in the final diff (see NO list).
2. **Diagnose which term actually makes it long.** The candidates in the block are `hpScale: 30`,
   the per-component `hpScale` (0.9 / 1.25 / 0.85) and `boltDamageMult` (0.8 / 0.7 / 0.85 — these
   *reduce* incoming bolt damage), and `componentDegradeSpeedMult: 0.82`. Say in your report which
   term dominates the measured time-to-kill, **with the numbers that show it**.
3. **Tune that term, with a named cause.** Change the **smallest** set of values in
   `e2-hill-mine`'s `twist.baron` that brings the fight meaningfully shorter while keeping it a
   fight. Target: the railcar dies **around wave 12–13** rather than 14, i.e. it should not
   routinely survive two full waves past its arrival. **Every number you change gets a one-line
   justification in the report naming the measurement that drove it** (F-1441-3: never re-pin to
   make a red go away). Do not make it trivial — if your tuned run kills the railcar before it
   completes its rail approach, you have overshot; say so and back off.
4. **Touch ONLY Hill Mine's block.** `"hpScale": 30,` occurs **3 times** in that file: the
   identical baron shape is shared by `e2-hill-mine`, `e2-trestle` and `e2-incline`. The owner ruled
   about **Hill Mine**. Changing the other two is **out of scope** — if your diagnosis says they
   need the same cure, **write that as a finding**, do not apply it.
5. **Re-measure after the change** and report the same four numbers from item 1, before/after.

## FIREWALL
**TOUCH-ONLY:**
- `assets/contracts/epoch-2-steamworks/contracts.json` — the `e2-hill-mine` `twist.baron` block only.
- `e2e/e2-hill-mine.spec.ts` — **only** if an existing assertion encodes the old pacing and must be
  re-aimed. If you change it, quote the old and new assertion in your report and say why the new one
  still asserts something TRUE about the fight. Never weaken it to green.

**NO (violations, not judgement calls):**
- Do **not** edit the `e2-trestle` or `e2-incline` baron blocks.
- Do **not** change `secureWave` (12) anywhere — rejected by name (F-1492-2).
- Do **not** add `e2-hill-mine` to `SUPPORTED_CONTRACTS`, touch `src/sim/HeadlessContractSim.ts`, or
  use `--mode` to reach the map headlessly (F-E2S-3).
- Do **not** leave measurement scaffolding in the diff — the final `git status` shows only the
  TOUCH-ONLY files.
- Do **not** touch `src/game/RunSuspend.ts` or `src/game/Game.ts` (rf-34 landed there at
  `65693574f` this same night).
- Do **not** re-pin `scripts/gr-sim.test.mjs`. Its two E2 railcar pins are **deliberately skipped**
  with named causes (f1605-1); if your change reddens something there, that is a **finding**.

## SELF-CHECK (name every result in your report)
- `npx tsc --noEmit` → exit 0.
- `npm run build` → exit 0.
- `npx playwright test e2e/e2-hill-mine.spec.ts --workers=1` → **desktop-chrome AND mobile-chrome**.
  `--workers=1` is mandatory (§3.1, F-1270-1) — it is a correctness requirement of the instrument.
- Adjacent, unmodified-green: `e2e/e2-enemies.spec.ts`, `e2e/e2-rail-entity.spec.ts`,
  `e2e/e2-arsenal.spec.ts`, all at `--workers=1`.
- **`npm run test:node-guards`, run ALONE** (~3 min; it must not overlap another battery — s1536 hung
  ~19 min doing exactly that). **Required here even though the diff is a data file**: contract data
  is behaviour the sim replays, so this is the F-1460-1 class — a slice-local spec is structurally
  incapable of seeing a cross-cutting sim pin.
- Plain boot, no `?debug`: **zero console errors, zero page errors**, at 1280×800 **and** 390×844.
  Screenshots of the railcar fight at both viewports into `reviews/shots-f1607-1/`.
- Any red you cannot make green: report it with a **control run on unmodified main** proving whether
  it pre-existed. Do not fingerprint a red by assertion.

**READY-FOR-GATES** — report: the four before numbers and the four after numbers, which term you
tuned and why, the exact values changed, the full self-check results, and any finding about
`e2-trestle` / `e2-incline` that you deliberately did **not** apply.
