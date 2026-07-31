# Task lane-b-066-jumper-cadence-realign: the Claim Jumper cadence test asserts FOUR stale facts, not one — realign it to the slot that actually mounts, and derive every number from `Balance` instead of hardcoding it (lane-b, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome)** — s1302, 2026-07-31. Authored from a defect **I measured myself this fire**, with my own probe and its revert proven clean, not from a summary. Filed as **F-1302-1** (`tasks/BACKLOG.md`). No new scope invented: the engine is **not** on trial — every number below reconciles exactly with `src/game/Balance.ts`, so this is a test-expectation realign and nothing else.

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST (paths, not memory):
- `AGENTS.md`
- `e2e/066-walk8-engine.spec.ts` — **all of it, but especially `:208-240`** (the test `'Claim Jumper walk8 keeps the old stride duration at higher frame count'`). Note that `:220` and `:222` **already** query `char.bandit_base`; only the assertions below them were left behind. That asymmetry IS the bug.
- `src/assets/SpriteAnimator.ts:590-607` — `effectiveFps()` and `walkFpsForSlot()`. **Read to understand, not to edit.**
- `src/assets/SpriteAnimator.ts:630-634` — `strideUnitsPerCycle()`.
- `src/assets/SpriteAnimator.ts:1091-1094` — `cadenceFrameScale()`.
- `src/entities/pools.ts:230-247` — where the cadence `speed` and `groundSpeed` handed to `update()` are computed. **`:236` is the line that explains everything.**
- `src/game/Balance.ts:985-990` — `walkFps`, `walkFpsPerSpeed`, `walkMinFps`, `strideUnits`.
- `assets/layer-contracts/characters.v2.json` — the `char.bandit_base` entry (its `walk8.grid.file` is `char-bandit-base-sheet-walk8.png`) and, for contrast only, `char.claim_jumper` (`char-jumper-sheet-walk8.png`).
- `tasks/BACKLOG.md` — **F-1302-1** (this defect) and **F-1166-1** (the owner-gated jumper fork, which this task must NOT touch — see the firewall).

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via `git log`/`git diff`), it is a SAFE DUPE → `git checkout -B lane/m4 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make.

**Measured at authoring time (s1302, 2026-07-31T21:5xZ) — and re-derive it anyway, because premises expire in minutes here.** `node scripts/lane-usable.mjs lane-b` returned **USABLE** (`lane/m4`, `ahead=0 paths=0 tracked-dirt=0 untracked=0`). Run `git diff --name-only --diff-filter=A main..lane/m4` yourself. **EMPTY ⇒ reset and proceed. NOT empty ⇒ something landed after 21:5xZ; that is undrained work and a reset would DESTROY it — STOP AND REPORT, naming the files.** A STOP there costs the factory one run; a reset there costs it a slice.

⚠️ **A run was live in `worktrees/lane-a` at 21:51:32 (`lane-mechanics-manifest`) when this was authored.** You are in **lane-b**. Do not read, reset, or gate anything under `worktrees/lane-a`, and expect `src/agent/View.ts` / `src/town/TownScene.ts` to be moving underneath main. If your gates need a server, use a scratch port (5199/5231/5234), never 5188 — lane worktrees share it (Mistake #12).

Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (the defect, dated, measured, and reconciled against source)

On **2026-07-12**, commit `82543f27` rewired the mounted enemy animators (`src/entities/pools.ts`) from `assetSlots.charClaimJumper` to `charBanditBase`/`charBanditThief`. **The runtime half was correct and complete** (F-1144-1); only the e2e layer was stranded. A later repair migrated *part* of this test — `:220` and `:222` now query `char.bandit_base` — **but stopped before the assertions**, which is why this looked for 19 days like a one-line string fix.

It is not one line. I ran it, then I corrected only the string and ran it again. **Of the five assertions below the migrated lookups, four are stale and one is already correct:**

| line | assertion | measured (desktop-chrome, `--workers=1`) | verdict |
|---|---|---|---|
| `:234` | key contains `char-jumper-sheet-walk8-` | received `char-bandit-base-sheet-walk8-r2c0.png` | **STALE** — structurally impossible; the mounted slot is `char.bandit_base` |
| `:235` | `jumper.fps` ≈ **8.55** | **7.60** | **STALE** |
| `:236` | `fastJumper.fps` ≈ **17.1** | **14.0488** | **STALE** |
| `:237` | `jumper.stride` ≈ `hero.stride` | **2.8421** vs hero **3.0750** | **STALE — and unsatisfiable as written (see below)** |
| `:238` | `fastJumper.stride` ≈ `hero.stride` | **3.0750** vs **3.0750** | ✅ **ALREADY CORRECT — do not touch it** |

✓ **PROVEN AT `--workers=1`, so it is not the fire shell** (§3.1 / F-1270-1): the `:234` red reproduces identically single-worker. This is a real assertion failure, not a starved instrument.

### The mechanism — why these are *expectation* bugs and not engine bugs

`pools.ts:236` computes the cadence speed handed to the animator as:

```
speed = groundSpeed * 4 / (Balance.anim.strideUnits * visualScale * Balance.anim.walkFpsPerSpeed)
```

and `SpriteAnimator` then computes `fps = max(walkMinFps, speed * walkFpsPerSpeed) * cadenceFrameScale`, where `cadenceFrameScale = frames / cadenceReferenceFrames = 8 / 4 = 2`.

Compose them and the speed terms cancel: **stride-per-cycle is pinned to `strideUnits * visualScale` by construction, independent of speed** — which is exactly what the test's title means by *"keeps the old stride duration"*. That is why `:238` passes **exactly**, to four decimals.

**Except below the floor.** `Balance.anim.walkMinFps = 9.5 * 0.4 = 3.8`, so the floored fps is `3.8 * 2 = 7.6` — and **7.60 is precisely what the slow arm measured.** The knee sits at `groundSpeed = 7.6 * 3.075 / 8 ≈ 2.921`. The test scripts its slow arm at **2.7** (`:215`), i.e. **just under the knee**, where the floor engages and stride preservation is *deliberately* broken to stop a crawling walker animating at an ugly rate.

➡️ **Therefore `:237` is not merely mis-numbered — it asserts an invariant the engine intentionally suspends at that speed.** Re-baselining it to `2.8421` would convert a meaningful law into a rubber stamp. Assert the *floor* there instead, and keep the *invariant* assert on the fast arm where it genuinely holds.

## Scope

### 1. OBSERVE AND CONFIRM — MANDATORY STOP GATE, BEFORE YOU EDIT A SINGLE ASSERTION

Run the test unmodified and capture the first failure verbatim:

```
npx playwright test e2e/066-walk8-engine.spec.ts --project=desktop-chrome --workers=1 \
  -g "Claim Jumper walk8 keeps the old stride duration" --reporter=line
```

Expected: fails at `:234`, `Received string: "char-bandit-base-sheet-walk8-r2c0.png"`.

Then **temporarily** correct only that one string, re-run, and record `jumper.fps`, `fastJumper.fps`, and both strides against `hero.strideUnitsPerCycle`. **Paste the real numbers into your report** and compare them to the table above.

⛔ **If your measured numbers differ materially from mine, STOP AND REPORT rather than proceeding.** They were taken on a box that was otherwise idle; a different reading means the premise moved and this master needs re-authoring, not adapting.

### 2. Repair the frame-key expectation (`:234`)

Change the expected substring to `char-bandit-base-sheet-walk8-`.

This one is **fork-independent** and that is why it is safe: under *both* arms of the owner-gated F-1166-1 fork, the slot the runtime mounts is `char.bandit_base`, whose sheet is `char-bandit-base-sheet-*`. Nothing the owner can decide there renames it back to the jumper's sheet.

### 3. Derive the fps expectations from `Balance` — do not hardcode the measured numbers

Replace the magic `8.55` and `17.1` with values **computed in the spec** from `Balance.anim` and the scripted speeds, so the next balance change updates them instead of reddening them. Import or re-derive the three constants (`walkFpsPerSpeed`, `walkMinFps`, and the `strideUnits * visualScale` product the stride is pinned to) rather than copying numerals.

The fast arm must come out at `groundSpeed * frames / stride` and the slow arm at the floor `walkMinFps * cadenceFrameScale`. **If your derivation does not land on 14.0488 and 7.60 respectively, your derivation is wrong — say so and STOP.** Matching the measurement is the check that you derived it correctly, not the goal.

### 4. Re-aim the slow-arm stride assert (`:237`) at what the engine actually guarantees

The slow arm sits below the min-fps knee. Assert **that** — that its fps is clamped to the floor and that its stride is consequently *shorter* than the hero's — and add a one-line comment naming `Balance.anim.walkMinFps` and the ≈2.921 knee so the next reader does not rediscover this.

Leave `:238` **exactly as it is**. It is the assertion that proves the cadence law, it passes to four decimals, and it is the whole reason the test is worth keeping.

### 5. Report-only, do NOT fix here

While reading `SpriteAnimator.ts:623-628` you will notice `walkSpeedForSlot()` still names `charClaimJumper`/`charBaron` and **never** `charBanditBase`/`charBanditThief` — the same 2026-07-12 rename, stranded a second time in `src/`.

**I measured this as INERT and you must not "fix" it:** `pools.ts:836/838/857` pass a finite `speed` on every frame, and `walkSpeedForSlot():624` short-circuits on `walkCadenceSpeed` before ever reaching the slot list, so the stale branch is unreachable on the mounted path. Note it in your report; changing it is `src/` work outside this firewall and would need its own slice.

## Firewall

**TOUCH-ONLY:**
- `e2e/066-walk8-engine.spec.ts`

**NO — do not create, edit, or delete:**
- **Anything under `src/`.** The engine is not on trial. Every number above reconciles with `Balance`; if you find yourself wanting to change `SpriteAnimator.ts` or `pools.ts`, that is the signal to STOP AND REPORT instead.
- `assets/layer-contracts/characters.v2.json` — and in particular **do not add, remove, or rewire anything on `char.claim_jumper`**. That slot is the **owner-gated design fork F-1166-1**, and `tasks/025-vp-02e-jumper-8way-activation.md` is marked ⛔ DO-NOT-QUEUE. A fire may not choose between its arms and neither may you.
- `e2e/vp-02b-rotation-resolver.spec.ts` — `:286` is green and asserts the jumper diagnostics keep their **old shape**; F-1166-1 records that an 8-way spec would assert its negation. Do not "reconcile" them.
- Any other `e2e/*.spec.ts`, `tasks/**`, `reviews/**`, `logs/**`, `STATUS.md`, `tasks/BACKLOG.md`.
- `worktrees/lane-a/**` — a run was live there at authoring time.

## Self-check (all must pass before you report READY-FOR-GATES)

1. `npx tsc --noEmit` — clean.
2. `npm run build` — green.
3. **The slice's own spec, BOTH projects, `--workers=1`:**
   `npx playwright test e2e/066-walk8-engine.spec.ts --project=desktop-chrome --workers=1`
   `npx playwright test e2e/066-walk8-engine.spec.ts --project=mobile-chrome --workers=1`
   All tests in the file green, **including the three that were already passing** (`Prospector hover8`, `hero walks on the activated walk8 sheet`, and the `:238` stride assert). Zero console errors, zero page errors.
4. **Adjacent suites, unmodified-green, both projects, `--workers=1`** — these read the same contract/diagnostics surface:
   `e2e/eight-winds-hero.spec.ts` · `e2e/eight-winds-enemies.spec.ts` · `e2e/vp-02b-rotation-resolver.spec.ts` · `e2e/run-gait-stride.spec.ts`
   Any red here that you cannot reproduce on clean main is **yours** — report it, do not explain it away.
5. `git status --porcelain -- src assets` — **EMPTY.** The firewall is mechanical; prove it.
6. Screenshots are not required (no rendering change), but if any spec writes to `artifacts/066/`, leave the files in place and name them in your report.

READY-FOR-GATES + report: the scope-1 before/after numbers with first-failure lines, the arithmetic you used in scope 3 shown explicitly (constants in, expectations out), confirmation that `:238` is byte-unchanged, the scope-5 observation about `walkSpeedForSlot()`, `git status --porcelain -- src assets` output, and both projects' pass counts for the slice spec and all four adjacent suites.
