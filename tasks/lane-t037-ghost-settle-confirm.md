# Task lane-t037-ghost-settle-confirm: make `debugPlaceAssayOffice` settle the ghost and assert what `confirmBuild()` told it (lane-a, commit prefix "test:")

**FIRE-AUTHORED s1140 (attended review welcome).** From **F-902-2** and **F-m503-1** (`tasks/BACKLOG.md`, the lane-d section: *"CORRECTIVE OWED — Mistake-#10-adjacent … needs a real fix not just a de-flake"*), now backed by **F-1140-1/2/3** — a measured root cause with a paired control, produced this fire. It touches **no product code** and **weakens no assertion**.

⚠️ **The BACKLOG ruling on this finding is "investigate, don't blind-fix." That investigation is now DONE and is quoted below.** This task is the cure it licensed — not a timeout bump. If you find yourself widening a timeout, you have left the scope.

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. **Do not compare this worktree against a list of files I wrote; I do not have one, and an exhaustive dirt list is the wrong instrument (it is what stopped a runner needlessly at s1132).** Check the **invariant** instead: **no dirty blob in this worktree may be UNIQUE — every modified/deleted/untracked file's content must already exist somewhere in git** (main's history, any branch, or this lane's own commits). If every dirty blob is reachable, the reset destroys nothing → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. If **any** blob exists nowhere else, **STOP and report that file by name** — that one is real unmerged work and resetting it would be the Mistake #2 shape. (`git hash-object <file>` then `git cat-file -e <hash>` is enough; `.wrangler/tmp/**` is build scratch and is exempt.) Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

*(s1140 pre-measured the branch and you must still re-verify it: `lane/m3` is **1 ahead** at `73f4b661`, the town-t6-assay-supersession runner commit, **already drained to main at `dbde043f`** by s1139. Confirmed by content, not by message: `e2e/town-t6-surfaces.spec.ts` is **absent from `git diff --name-only main..lane/m3`**, i.e. byte-identical to main. Everything the two-dot diff *does* show is main moving forward after the lane's tip — 487 deletions / 14 insertions of s1138+s1139 material the lane simply lacks. False-ahead; nothing is lost by the reset.)*

## READ FIRST (paths, in this order)

1. `src/diagnostics/fullBaseBenchmark.ts:150-162` — **`buildFullBase()`. This is the reference implementation and the whole answer.** Product code already does the right thing: teleport → select → **`await waitFor(() => isGhostReady(placement), 1_000, …)`** → `confirmBuild() === true` → verify the count actually rose → report the failed placement **by name**.
2. `e2e/task-037-assay-bench-ungate.spec.ts:120-130` — `debugPlaceAssayOffice()`. **This is the only offender in the repo**: it fires all six hooks inside ONE synchronous `page.evaluate`, never waits for the ghost, and **discards `confirmBuild()`'s boolean**.
3. `e2e/task-037-assay-bench-ungate.spec.ts:99-118` — `buildAssayOfficeWithUi()`, the sibling helper in the *same file*, which **already polls `build.ghostValid` before pressing Enter**. It is correct. Match it.
4. `src/systems/BuildSystem.ts:810-838` — `confirm()`. Note the order: `updateGhostPosition()` → `computeValid()` → **`if (!this.valid) return this.invalidBuild()`**, which returns `false` *before* the economy is ever touched.
5. `src/game/Game.ts:1862-1868` — the `confirmBuild` hook. It **returns a boolean**. That return value is the signal being thrown away.

## WHY (measured this fire — re-measure it, do not inherit it)

Three fires have carried `task-037` reds as a vague set of "pre-existing flakes." They are **two different faults**, and one of them is not a flake at all.

**Paired control, 3 trials per arm, single variable (`scripts/tmp-s1140-probe2.mjs`):**

| arm | `confirmBuild()` | `assayOffices` | gold | result |
|---|---|---|---|---|
| A — helper verbatim, all six hooks in one tick | `false` | 0 | 120 (unspent) | **0/3 pass** |
| B — identical, plus one frame before `confirmBuild` | `true` | 1 | 40 (spent) | **3/3 pass** |

**The mechanism, read at source (`scripts/tmp-s1140-probe3.mjs`):** in the same tick as `teleport(0, 9)`, `confirm()`'s `updateGhostPosition()` puts the ghost at **z = 10, which is invalid**. One frame later, with *nothing else changed*, the ghost resolves to **z = 7 and is valid**, and the same call returns `true`. Gold stays at 120 in arm A — confirming it bailed at the validity gate at `BuildSystem.ts:818`, before the spend.

So `:171` (desktop **and** mobile) and `:192` are **deterministic** — `0/3` and `0/3` — not flaky. They fail 5 s later at `:129` on the *symptom* (`assayOffices === 0`), two call-frames away from the cause, because the helper threw away the `false` that named it.

**And a second hazard this probe exposed, which is why in-tick reads cannot be trusted at all:** `__THREE_GAME_DIAGNOSTICS__` only refreshes when `publishDiagnostics()` runs. Reading it *in the same tick* as a `__GR_TEST__` mutation returns **stale** state — measured: after `teleport(0,9)` and `selectBuildable('assay_office')` the snapshot still reported `hero z=12, mode=false, selected='sentry_beacon'`. Any helper that mutates and reads without a round-trip is reading the past.

**`:142` is a genuinely different fault and is NOT yours.** It fails inside `panGold()` at `:92`, having reached only **60 of 85** gold within that helper's 20 s wall-clock budget. Measured rate this fire, desktop, on a **loaded** box (load avg ≈ 4.4, a lane-b codex live): **1 fail / 4 runs (~25%)** — it passed 3/3 at 23.5–28.9 s and failed once. That is F-m503-1, load-sensitive, and it stays open.

## SCOPE (numbered, each testable)

1. **REPRODUCE THE CONTROL FIRST.** Before changing anything, run `task-037` `-g "prompt hides in build mode"` on `--project=desktop-chrome --repeat-each=3 --workers=1` and confirm it is **0/3**. Report the number. **If it is not 0/3, STOP and report that** — the premise of this task would be wrong and I would rather know than be agreed with.
2. **Fix `debugPlaceAssayOffice` to match `buildFullBase()`'s proven shape.** Split the single `page.evaluate` so that, after `grantGold` + `teleport(0, 9)` + `selectBuildable('assay_office')`, the helper **waits for the ghost to be ready** — poll `build.ghostValid === true` through a real page round-trip (that round-trip is also what forces a fresh `publishDiagnostics()`; see the WHY) — **and only then** calls `confirmBuild()`.
3. **Assert the boolean.** `confirmBuild()`'s return must be checked with a message that names the cause, e.g. `expect(placed, 'confirmBuild() refused: ghost invalid at the requested position').toBe(true)`. The point of this task is that **the next failure explains itself at the line where it happens** rather than 5 s later at `:129`.
4. **Leave `:129`'s existing `expect.poll(...assayOffices).toBe(1)` exactly as it is.** It is the real assertion and it must keep guarding.
5. **Verify, both projects:** `:171` desktop, `:171` mobile and `:192` mobile all **GREEN**, `--repeat-each=3`, and report them as N/3 each.
6. **Report `:142` honestly, do not touch it.** Run it, and if it fails, report the gold reached and the duration. **A red `:142` is an ACCEPTED outcome of this task.**

## FIREWALL

**TOUCH-ONLY:** `e2e/task-037-assay-bench-ungate.spec.ts` (the `debugPlaceAssayOffice` helper only).

**NO — each of these is a way to make the tests green while destroying the evidence:**
- ⛔ **NO `src/**` change.** The product is not at fault here; `fullBaseBenchmark` already handles this correctly.
- ⛔ **NO touching `panGold()`, `walkTo()`, or the `:142` test.** That is F-m503-1, a separate open finding with a separate cause. Fixing it here would re-merge two findings that this task exists to separate.
- ⛔ **NO raising the 5 000 ms `expect` timeout, and no new timeout anywhere, as the cure.** The failure is deterministic; a longer wait cannot help and would only hide the next regression.
- ⛔ **NO `test.retry`, no `test.skip`, no loosening or deleting any assertion** — including `assayOffices).toBe(1)`.
- ⛔ **NO reformatting/refactoring the rest of the file.** One concern per commit.

## SELF-CHECK (name real numbers; do not write "green")

- `npx tsc --noEmit` clean · `npm run build` green.
- `e2e/task-037-assay-bench-ungate.spec.ts`, **both** `desktop-chrome` and `mobile-chrome`, `--workers=1`: report per-test pass/fail with durations, `:171`/`:192` as **N/3** each.
- The scope-1 **before** number (expected 0/3) and the scope-5 **after** number, side by side. That contrast is the deliverable.
- Adjacent suites unmodified-green: `e2e/town-t6-surfaces.spec.ts` and `e2e/m5-04-offline-queue.spec.ts`, both projects.
- Zero console/page errors (the spec already asserts this — say so explicitly).
- Commit path-scoped, prefix `test:`.

READY-FOR-GATES + report: the before/after N/3 for `:171`/`:192`, whether `confirmBuild()`'s new assertion ever fired during your runs, and `:142`'s status with its gold number if it failed.
