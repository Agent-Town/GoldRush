# e1-claim-geometry-declared-reland — RE-LAND the claim-geometry-declared slice on current main

**FIRE-AUTHORED s1392 (attended review welcome).** Role: Codex runner, lane-c. Workdir: `worktrees/lane-c` (branch `lane/e2-arsenal`).

## READ FIRST

- `reviews/e1-headless-the-claim-reland.md` — the s1392 gate of this slice's **sibling**, re-landed by exactly the technique below. Read its "The two block conditions, measured" section; this master is the second half of the same job.
- `reviews/lane-m4-claim-geometry-and-headless.md` — the s1381 gate that produced F-1381-3 and F-1381-4.
- `CLAUDE.md` Mistake #15 (RE-LAND, salvage-ref) and Mistake #2 (never reset over unmerged work).
- Salvage-ref commit: `c876f675` on `lane/m4` — **read-only reference. Do NOT check out, merge, rebase or reset `lane/m4`.**

## PRE-FLIGHT (run this exact sequence; STOP on any mismatch and report)

1. `git -C worktrees/lane-c rev-parse --abbrev-ref HEAD` → must print `lane/e2-arsenal`. If not, **STOP**.
2. `git -C worktrees/lane-c log main..HEAD --oneline` → must print **nothing**. If it prints anything, **STOP and report** — the lane may hold undrained work (Mistake #2). Do not reset.
3. `git -C worktrees/lane-c status --short` → expect clean of tracked source. If tracked source files are dirty, **STOP and report**.
4. `git -C worktrees/lane-c merge-base --is-ancestor cbf0e143 HEAD` → must exit **0**. `cbf0e143` is the authored-bundle-validation merge that added ~355 lines to `src/meta/ContractFamilies.ts`; **it is the reason scope item 2 is a 3-way lift and not a patch**. If the lane predates it, **STOP and report**.
5. `git -C worktrees/lane-c cat-file -e c876f675` → must exit **0** (the salvage-ref is reachable). If not, **STOP and report**.

## WHY (evidence, quoted and dated — every number below was re-measured by s1392 on 2026-08-02)

`tasks/goals.json` holds `e1-claim-geometry-declared` as **`status: "blocked"`, `blockClass: "gate-side"`** — a fire-side readiness hold, **not** an owner design fork. Its sibling `e1-headless-the-claim` carried the same hold and was **discharged and MERGED at `8e20d8ca` by s1392**; this master finishes the pair.

F-1381-3 recorded the blocker for this half as follows, and it is worth quoting exactly because **s1392 measured it to be true of the wrong operation**:

> `c876f675` touches **`e2e/agent-view.spec.ts` and `e2e/fixtures/e1-mechanics-manifests.json`, which `7c4f132f` ALSO modified** → its versions of those two files are built on blocked content, so a path-scoped copy would import the block.

**That is exactly right about a path-scoped COPY, and it does not apply to a per-commit PATCH.** A copy takes the file's whole *resulting content* (which sits on top of the blocked commit); `git show c876f675 -- <path>` emits only *that commit's own delta*. s1392 measured all six paths:

| Path | `git show c876f675 -- <path> \| git apply --check` |
|---|---|
| `assets/contracts/epoch-1-frontier/contracts.json` | **APPLIES CLEAN** |
| `e2e/agent-view.spec.ts` | **APPLIES CLEAN** (one of the two "contaminated" files) |
| `e2e/fixtures/e1-mechanics-manifests.json` | **APPLIES CLEAN** (the other) |
| `e2e/tile-identity-pass.spec.ts` | **APPLIES CLEAN** |
| `src/world/Terrain.ts` | **APPLIES CLEAN** |
| `src/meta/ContractFamilies.ts` | **FAILS at `:1489`** — the only real conflict |

And the two "contaminated" hunks were **read**, not merely applied: they add `"ids": ["center-ford"]`, a `"descriptor": "frontier-river-depth"` value, and a loop asserting `water_crossings` count 1 for three contracts. That is this slice's own subject (claim geometry). **Nothing in them concerns the drill-yard census**, which is `7c4f132f`'s subject. They apply clean precisely because their context lines already match main.

`src/meta/ContractFamilies.ts` fails because main moved that file substantially at `cbf0e143` (authored-bundle validation, +355 lines). That is a genuine 3-way lift — see scope item 2.

## SCOPE (numbered, each item testable)

1. **Apply the five clean paths as per-commit patches.** For each of `assets/contracts/epoch-1-frontier/contracts.json`, `e2e/agent-view.spec.ts`, `e2e/fixtures/e1-mechanics-manifests.json`, `e2e/tile-identity-pass.spec.ts`, `src/world/Terrain.ts`:
   `git show c876f675 -- <path> | git apply -`
   ⚠️ **Use the commit's own DIFF, exactly as written above. Do NOT use `git checkout c876f675 -- <path>`** — that copies the resulting file, which for two of these paths sits on top of the owner-BLOCKED `7c4f132f`. The distinction is the entire point of this master.
   **Do NOT** `git merge`, `cherry-pick` or `rebase`, and do not make `lane/m4` an ancestor.

2. **Lift the `src/meta/ContractFamilies.ts` hunks BY HAND (3-way).** `git show c876f675 -- src/meta/ContractFamilies.ts` is two hunks; apply both to main's current version of the file:
   - **Hunk A (type, trivial):** add `centerZ?: number;` and `halfWidth?: number;` to `ContractWaterDescriptor`, immediately above `visualHalfWidth?: number;`.
   - **Hunk B (logic, in `normalizeContractDescriptor`):** the salvage-ref replaces the direct use of `value` with a `structuredClone` named `candidate`, and — before the shape comparison — back-fills any of `['size', 'fords', 'harvestAnchors', 'water']` that the candidate lacks but the template has. Then `candidateShape`, `rawLayer`, `claimSize` and `normalized` all read from `candidate` instead of `value`.
   ⚠️ **Main's version of this function has moved. Read main's current `normalizeContractDescriptor` first and re-express the hunk against what is actually there** — do not paste the salvage-ref's context lines. If main's function has diverged so far that the back-fill no longer has an obvious insertion point, **STOP and report** with the two versions quoted; do not invent a restructuring.
3. **Prove no blocked content came along.** Report `git diff --name-only main...HEAD` — it must list **exactly the six files above and nothing else**. In particular `e2e/072-era-activation.spec.ts`, `e2e/e1-baron.spec.ts` and `src/town/TownScene.ts` (the three paths `7c4f132f` touches that this slice does not) **must NOT appear**. If any does, **STOP and report**.
4. Report the numbers below. **Do not "fix" anything outside items 1–3** — if you find another problem, report it, do not repair it.

## FIREWALL

**TOUCH-ONLY:** `assets/contracts/epoch-1-frontier/contracts.json` · `e2e/agent-view.spec.ts` · `e2e/fixtures/e1-mechanics-manifests.json` · `e2e/tile-identity-pass.spec.ts` · `src/meta/ContractFamilies.ts` · `src/world/Terrain.ts`.

**NO:** do **not** check out, merge, cherry-pick, rebase, reset or delete `lane/m4` — it is the salvage-ref · do **not** bring in `7c4f132f` content in any form · do **not** touch `e2e/072-era-activation.spec.ts`, `e2e/e1-baron.spec.ts`, `src/town/TownScene.ts` · do **not** touch `STATUS.md`, `tasks/BACKLOG.md`, `tasks/goals.json`, `logs/suite-red-inventory.md` or anything under `reviews/` · do **not** reset, rebase or squash `lane/e2-arsenal`.

## SELF-CHECK (run every one, at `--workers=1`, report exact counts — this flag is a correctness requirement of the fire shell, not an optimisation)

1. `npx tsc --noEmit` → rc 0.
2. `npm run build` → rc 0.
3. `npx playwright test e2e/tile-identity-pass.spec.ts --workers=1` → this is the slice's **own** spec (item 1 adds ~40 lines to it). Report X/Y.
4. `npx playwright test e2e/agent-view.spec.ts --workers=1` → the byte-stable-fixture guard, which this slice edits **together with its fixture**. Report X/Y. ⚠️ `agent-view.spec.ts:261` is recorded as a **known red on main** (F-1380-2). **Run it on clean main FIRST as a CONTROL and report both numbers** — a red here is only yours if the control is green. Do not fix it either way.
5. `npx playwright test e2e/contract-bundle-validation.spec.ts --workers=1` → the suite that owns the `ContractFamilies.ts` region your 3-way lift touches (it arrived with `cbf0e143`). Report X/Y.
6. `npm run test:node-guards` → rc 0, report X/Y.
7. `git diff --name-only main...HEAD` → paste the **full** list (scope item 3).

⚠️ **`e2e/night3d-perf.spec.ts:67` is a KNOWN PRE-EXISTING RED on clean main** (F-1390-1; control-measured ratio **1.6491**). It is not yours. Do not run it, do not fix it, do not report it as a failure.

This slice touches `src/world/Terrain.ts` and contract geometry, so **it may have a rendering surface**. If any boot screenshot differs visibly from main, capture it to `reviews/shots-e1-claim-geometry-reland/` and say so. If nothing renders differently, say that explicitly rather than omitting it.

Commit path-scoped on `lane/e2-arsenal` with the prefix `e1-claim-geometry-reland:`. **Never `git add -A`.**

**READY-FOR-GATES + report:** exact counts for self-checks 1–7; the full `git diff --name-only main...HEAD` list; the `agent-view.spec.ts` CONTROL number from clean main alongside your own; confirmation that `lane/m4` was never checked out, merged or reset; and — for scope item 2 — quote main's `normalizeContractDescriptor` before and after, so the 3-way lift can be reviewed without re-deriving it.
