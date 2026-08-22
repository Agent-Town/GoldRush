# Review — c3-hero-move-pin (lane/c)

**Slice:** `c3-hero-move-pin` — the hero can be pinned unable to move (owner playtest 15, 2026-08-22)
**Branch:** `lane/c` · **Tip:** `9aa942ee6` (`runner(lane-c): c3-hero-move-pin.md`) · **Base:** `51ba8814e3f0f4ce705b7a5124f483f3ad410c5d`
**Gated by:** s2189 fire, 2026-08-22, in detached worktree `gate-s2189/` (§3.0b — undecided content never entered main's tree or index)
**§3.0 block check:** `✅ CLEAR — c3-hero-move-pin.md [c3-hero-move-pin] status="queued"`

---

## VERDICT: 🛑 HOLD — DO NOT MERGE. One blocking defect, cured by a ~5-line move.

**The gameplay cure is sound and I recommend landing it once the blocker clears.** The defect is not in the movement law — it is an *import-graph* side effect that silently destroys whole-suite test collection.

---

## What it does

Closes four traps in the hero movement law, all four verified at source by the master and all four addressed:

1. **Corner clip** (`Hero.ts:179`) — the axis-slide Z branch now samples at `this.group.position.x` instead of `previousX`. Because the X branch above may already have committed `position.x = nextPosition.x`, the Z test is now evaluated at the *post-X-commit* position: it is the combined `(nextX, nextZ)` when X was admitted and `(prevX, nextZ)` when X was rejected. Minimal and exactly the specified cure.
2. **Never-trapped invariant** (`Game.ts:3045`) — the per-frame `terrain.depenetrate` closure switches from `depenetrateFromBlockers(…heroBlockers(), Balance.hero.radius + 0.08…)` to `depenetrateToWalkable(…, (x,z) => actorTerrainSample(x,z).walkable, …)`, so cells that are unwalkable for non-blocker reasons (deep water, `out`, elevation) now have an escape.
3. **Escape budget floor** (`Hero.ts:136`) — `Balance.hero.speed * dt`, no longer multiplied by `moveSpeedMult`, so a zeroed multiplier cannot also zero the escape.
4. **Restore heals** (`RunSuspend.ts:927-930`) — `restoreHero` relocates to walkable ground and recomputes visual height before `resetRun`.

Plus a `movePin` diagnostic on `window.__THREE_GAME_DIAGNOSTICS__` (raw intents, 2s threshold, once per episode) and a 5-test spec.

**✓ VERIFIED — pad semantics are preserved, which the master required and the diff appears to drop.** The new predicate passes no pad argument, but `Terrain.sample` applies the landmark pad itself at `src/world/Terrain.ts:174` using the *identical* constant `Balance.hero.radius + 0.08`. Read the code before reading this as a regression; it is not one.

---

## Evidence table (all measured by me on the merged tree, `--workers=1` per §3.1)

| Gate | Result | Notes |
|---|---|---|
| `npx tsc --noEmit` | ✅ rc=0 | |
| `npm run build` | ✅ rc=0 | built in 1.23s; asset-diet within ceiling |
| `e2e/c3-hero-move-pin.spec.ts` | ✅ **10/10** | desktop + mobile; includes a plain-boot no-`?debug` console/page-error test (Mistake #10 satisfied) |
| `task-025`, `m1-01`, `m2-01`, `run-suspend` | ⚠️ **41 passed / 1 failed** (5.9m) | `run-suspend.spec.ts:194` mobile — see F-2189-4 |
| `run-suspend.spec.ts:194` re-run **alone** | ✅ **1/1, 37.6s** vs a 90s budget (41.8%) | load-attributable, not slice-attributable |
| `e2e/restore-validation.spec.ts --list` | 🛑 **main 36 tests → merged 0** | **F-2189-1** |
| **whole-suite `playwright test --list`** | 🛑 **main `2958 tests in 425 files` → merged `0 tests in 0 files`** | **F-2189-1**, 8 import-attribute errors |
| **`scripts/whole-suite-collection.test.mjs`** (the house guard for exactly this) | 🛑 **merged FAIL** / ✅ **main PASS (1.9s)** | both directions; the guard's own name is *"whole suite collects without loading Vite-only modules"* |
| `test:node-guards` (F-1460-1, `src/entities/` + `src/game/` touched) | ⛔ **NOT RUN in full** | the decisive member was run in isolation — see "Gates deliberately not run" |
| Screenshots | ⚠️ present, weak | `reviews/shots-c3/` desktop 1015398 B + mobile 1584785 B; both show a plain Night Shift boot with the contract card, not the yard corner post-fix the master asked for. Non-blocking (the e2e asserts the behaviour) |

---

## 🛑 F-2189-1 (BLOCKING) — the slice takes whole-suite e2e collection from 2958 tests to ZERO

**Mechanism, ✓ VERIFIED by reading the code and proven by a two-sided control:**

`RunSuspend.ts` gains `import { depenetrateToWalkable } from '../world/LandmarkCollision'`. But `src/world/LandmarkCollision.ts:1` is

```ts
import registryText from '../../assets/pilots/map-rebuild-spike/landmark-collision-contract.json?raw';
```

— a **Vite-only** `?raw` suffix. Playwright spec files run in **node**, and three specs import `RunSuspend` at node level (`restore-validation.spec.ts:14`, `mp-arsenal.spec.ts`, `lane-gold-quantization.spec.ts`). Node cannot resolve `?raw` and throws `needs an import attribute of "type: json"`. Playwright aborts collection on any such error, so the failure is **not confined to those three files** — the entire suite stops collecting.

**Control, same command, same machine, minutes apart:**

| tree | `playwright test --list` | rc |
|---|---|---|
| `main` (`f0f6bca61`) | `Total: 2958 tests in 425 files` | 0 |
| merged (`main` + `lane/c`) | `Total: 0 tests in 0 files`, 8 × import-attribute TypeError | 1 |

✅ **INDEPENDENTLY CONFIRMED BY THE HOUSE'S OWN GUARD, WHICH EXISTS BECAUSE THIS EXACT CLASS HAS HAPPENED BEFORE.** `scripts/whole-suite-collection.test.mjs` — *"whole suite collects without loading Vite-only modules"* — was created by the `fe2cs2-1` drain after the identical `?raw`-reaches-node defect. Run here in both directions: **main PASS (1.9 s) · merged FAIL**, the failure printing `Total: 0 tests in 0 files`. The guard is not broken and the red is not mine to interpret — it is the mechanism the factory already built for this, firing correctly the second time.

💡 **AND IT COSTS 1.9 SECONDS.** The reason it did not fire earlier is not expense: F-1460-1 attaches the `test:node-guards` duty to the **drain**, and the master's self-check named tsc/build/specs/null-floor but not this guard — so nothing between the runner and me was ever going to ask it. See F-2189-3.

**Why every green above is compatible with this.** Naming a spec file explicitly collects only that file, and `c3-hero-move-pin.spec.ts` does not import `RunSuspend` — so the slice's own 10/10 and the adjacent 41/42 are real, and *structurally incapable* of seeing this. **A targeted gate cannot detect a collection break; only a whole-suite `--list` can.**

⚠️ **This is the rf-33 incident re-created.** The `lane-hero-y-restore-roundtrip` master's own evidence chain records rf-33 restoring collection as *"`npx playwright test --list`: **0 tests → 2378 tests in 330 files**"*. This slice returns that number to 0.

**CURE (small, and it is a move, not a redesign):** lift `depenetrateToWalkable` / `depenetrateFromBlockers` into a node-safe module with no `?raw` import (e.g. `src/world/depenetrate.ts`), have `LandmarkCollision.ts` re-export them, and point `RunSuspend.ts` at the new module. The `?raw` registry load stays where it is. Corrective master: `tasks/f2189-1-depenetrate-node-safe.md`.

---

## 🛑 F-2189-2 (BLOCKING, same corrective) — the slice reverts a shipped cure, and the suite that guards it is the one it disables

`RunSuspend.ts` **deletes** `restoreSnapshot`'s line

```ts
if (hero?.group?.position) hero.group.position.y = snapshot.hero.position.y;
```

`git log -S` attributes that line to **`f56c0ea36` — `runner(lane-a): lane-hero-y-restore-roundtrip.md`**, a task whose entire purpose was curing `e2e/restore-validation.spec.ts:658` (*"active megaproject wrecker references survive strict normalization and restore"*), whose failure was **exactly one** difference: `root.hero.position.y: 0.14559222393281415 != 0.2763519114255905`.

The deletion is *plausibly* correct — the new relocate recomputes height via `heroVisualYAt`, and re-applying the saved `y` afterwards would undo it. **But it is unverified, and it cannot be verified on this tree**, because F-2189-1 prevents `restore-validation.spec.ts` from collecting at all. ✓ VERIFIED: `run-suspend.spec.ts` contains **zero** assertions on hero `y` (grepped), so its 42/42 does not cover this.

**A slice that removes a cure and disables that cure's guard in the same commit must not merge on the strength of the suites that remain.** Once F-2189-1 is cured, `restore-validation.spec.ts` must be run and `:658` must be green — that is the acceptance test for the deletion.

---

## ⚠️ F-2189-3 (NON-BLOCKING, process) — the master's adjacent-suite list was scoped to the DEFECT, not to the CURE

The master named `task-025`, `m1-01`, `m2-01`, `run-suspend` — the suites that exercise **movement**, which is where the *defect* lived. The *cure* touched suspend/restore and the module import graph, whose guardian suite is `restore-validation.spec.ts`. It appears in neither the master's list nor the runner's report. The runner obeyed its instructions exactly and reported honestly; the list was aimed one step behind the work.

The same gap covers the guard: `scripts/whole-suite-collection.test.mjs` costs **1.9 s**, was built after the previous instance of this exact defect, and is named in **neither** the master's self-check nor the runner's report. Nothing between authoring and the drain was ever going to ask it.

**Reusable:** when a cure's blast radius is wider than the defect's, an adjacent list copied from the defect is a list of the wrong suites. Ask what the cure *touches*, not what the bug *broke* — and when a slice **adds an import**, the import graph is part of what it touches. A master whose scope says "import X into Y" should name the collection guard, because that is the one thing a per-file spec run cannot see.

---

## ⚠️ F-2189-4 (NON-BLOCKING, load) — `run-suspend.spec.ts:194` mobile red is load-attributable

Red once inside the 4-suite battery; **passes alone at 37.6s against its 90s budget (41.8% of budget)**. Machine load averaged 4.98/6.07/6.29 during the battery, with lane-d's codex run live. This is the F-2166-2 shape — *the margin moves with machine load, so a red here is a question about the arrangement before it is a question about the slice.* **Not a re-pin candidate and not attributed to the slice.**

ⓘ **Method note against myself:** I re-ran the failing test before capturing the battery's failure text, so the specific assertion/timeout message is **unrecovered** — the harness had truncated the log to its tail and playwright clears `test-results/` on the next run. The pass-in-isolation is solid evidence; the *failure mode* is not established. **Capture the red before re-running it.**

---

## Gates deliberately not run, and why

**`npm run test:node-guards` — NOT RUN IN FULL.** F-1460-1 requires it because the diff touches `src/entities/` and `src/game/`. Its **decisive member was run in isolation and is recorded above** (`whole-suite-collection`, both directions). The remaining ~529.8 s serial battery (F-2166-2) is withheld because the verdict is already HOLD on evidence no green could overturn, and running it would contend with a live lane for nine minutes to tell me nothing that changes the outcome. **It is OWED IN FULL by whichever fire gates the corrected slice**, and is named in the corrective master's self-check. Recorded as owed, not quietly skipped (the F-2076-1 / "a correct out-of-scope refusal is an owed measurement" standard).

---

## Merge classification (for the fire that lands this after the corrective)

Base `51ba8814e`, tip `9aa942ee6`, 1 commit, 7 paths, `ahead=1 behind=5`.

| path | class | note |
|---|---|---|
| `e2e/c3-hero-move-pin.spec.ts` | LANE-ONLY | new file, 120 added lines |
| `reviews/shots-c3/*.png` (2) | LANE-ONLY | BINARY |
| `src/entities/Hero.ts` | LANE-ONLY | 2 added lines |
| `src/game/Game.ts` | LANE-ONLY | 30 of 36 added lines absent from main |
| `src/game/RunSuspend.ts` | LANE-ONLY | 4 of 5 added lines absent from main |
| `tasks/BACKLOG.md` | **BOTH-MOVED** | conflicted in my scratch merge; resolved **additively** — kept main's KV-cap + F-2188-1 rows *and* the lane's F-PT15 status row, placed adjacent to its own intake row. Zero content dropped from either side. The same resolution will be needed again. |

**Custody:** the merge lived only in `gate-s2189/` and was never staged on main (§3.0b / F-1589-5). The worktree is removed; `lane/c` is untouched and still `ahead=1`.

---

## Findings summary

| id | severity | subject |
|---|---|---|
| F-2189-1 | 🛑 BLOCKING | `?raw` import reaches node via `RunSuspend` → whole-suite collection 2958 → 0 |
| F-2189-2 | 🛑 BLOCKING | shipped `y`-restore cure deleted; its guard suite disabled by F-2189-1 |
| F-2189-3 | ⚠️ non-blocking | adjacent-suite list scoped to the defect, not the cure |
| F-2189-4 | ⚠️ non-blocking | `run-suspend:194` mobile red is load-attributable; failure text unrecovered |

**Enemy pinning** (master scope item 7): the runner correctly REPORTED rather than fixed it — a firewall success. It remains owed as a follow-up and is recorded in the BACKLOG row, not in this corrective.
