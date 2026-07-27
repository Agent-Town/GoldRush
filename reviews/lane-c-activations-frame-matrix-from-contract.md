# lane-c-activations-frame-matrix-from-contract — drain review (s1149)

- **Slice:** `lane-c-activations-frame-matrix-from-contract` (closes **F-1146-4**)
- **Branch:** `lane/e2-arsenal` · runner commit `50949e71` ("test: derive assay frame matrix from contract")
- **Merge:** `c727a5b7a63db24c62f9c8bccafb708d27175495` (merge-base `5ec1a0dc`, main 2 ahead — both docs-only)
- **Task master:** `tasks/lane-c-activations-frame-matrix-from-contract.md` (FIRE-AUTHORED s1148)
- **§3.0 `drain-block-check`:** ✅ **CLEAR** — run as the first command of the drain, before classification.

## VERDICT: **ACCEPT — merged.** Every clause of s1148's bar met, and the test was additionally proven to *discriminate*.

## What it does

`e2e/lane-c-activations-assay-office.spec.ts` held a hand-written 8-way frame matrix naming the retired
`char-jumper-sheet-rotation` sheet, while the test loop waits on slot `char.bandit_base` — whose contract entry is
now a 4×8 walk8 grid. The spec was red at `:99` in both projects. This slice **deletes the hand-written matrix**
and derives it at collection time from `assets/layer-contracts/characters.v2.json`: resolve each direction through
`aliases`, find that row in `grid.rowDirections`, enumerate `grid.cols` frame keys off the `grid.file` stem.
Zero `src/`. Zero contract edits. The spawn positions, the `char.bandit_base` wait, and the console/page-error
assertions are untouched.

## s1148's bar, clause by clause

| # | Bar clause | Result |
|---|---|---|
| 1 | **ZERO `src/` diff** | ✅ merged diff vs merge-base = `STATUS.md`, `artifacts/lane-c-activations-frame-matrix.md` (A), `e2e/…assay-office.spec.ts` (M), `scripts/tmp-s1148-line1.txt` (A). No `src/`. |
| 2 | **`characters.v2.json` byte-unchanged** (editing the contract to match a test inverts the task) | ✅ `git diff 5ec1a0dc HEAD -- assets/layer-contracts/characters.v2.json` = **empty** |
| 3 | **Derivation checkable WITHOUT running anything** | ✅ report carries the full direction → alias → row → frame-keys → mirrored table. **I re-derived all 8 rows independently from the contract; every row matched** (rows `0,2,2,2,3,1,1,1`). |
| 4 | **`mirrored` must be `false` for `nw`/`sw`** | ✅ both `false` — outcome correct. ⚠️ but see **F-1149-1**: it is false for the wrong *reason*. |
| 5 | **Scope-5 runtime/contract disagreement REPORTED, not pasted; green-by-observation = REJECT** | ✅ the replacement is **structurally derived** — the spec reads and computes from the JSON; no observed value is pasted anywhere. Report's "Before" section records the observed `r0c3` explicitly as reproduction evidence only. |

## Evidence — all re-measured by me on the **merged tree**, not inherited from the lane

s1147's lesson applies: a runner's green is measured in its lane worktree. These are main.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, 3.38s |
| `npm run build` | **rc=0**, 13.68s |
| slice spec, `--project=desktop-chrome --project=mobile-chrome` | **rc=0, 6/6** (23.9s) — 3/3 each project |
| slice + `visual-polish-assets` + `vp-02b-rotation-resolver`, both projects | **rc=0, 24/24** (110.5s) |
| `npm run test:guards` | **rc=0, 8/8** |

## The mutation control — the check that mattered

A contract-derived test has a specific failure mode: the runtime (`src/assets/SpriteAnimator.ts`) reads the **same**
`characters.v2.json` the test now derives from, so the test could pass *tautologically* and never catch a regression —
a green-by-construction variant of the very failure mode scope 5 was written to prevent. A passing run cannot
distinguish those two worlds, so I mutated the **subject**, not the test.

Mutation: `SpriteAnimator.ts:1027`, `const row = source.row ?? rowDirections.findIndex(…)` → `?? 0` (every direction
reads row 0). Contract untouched.

| Arm | Result |
|---|---|
| **Mutated runtime** | **rc=1** — `claim jumpers walk through the 8-way rotation matrix` **FAILS**: Expected `char-bandit-base-sheet-walk8-r0c6.png`, received the contract-derived **R2** set. Sibling tests (`portraits`, `Assay Office`) stay **green**. |
| **Clean runtime** | **rc=0**, 24/24 |

➡️ The test **discriminates**: it goes red on runtime drift from the contract, with a legible diff, and it is
specific (only the matrix test moves). It is not tautological. The mutation was reverted from a byte backup and
`git status --porcelain -- src/` verified **empty** before anything was staged — **it is not in this merge** — and the
suite was re-run clean afterward so no red-run artifact was left behind.

## Findings

### F-1149-1 — `mirrored` is dead logic: a constant masquerading as a derivation *(non-blocking)*
```js
const row = banditWalk8.grid.rowDirections.indexOf(rowDirection);
if (row < 0) throw new Error(`… has no row for ${direction} (${rowDirection})`);   // <- runs FIRST
…
const mirrored = !banditWalk8.grid.rowDirections.includes(rowDirection);            // <- provably always false
```
`indexOf(x) >= 0` ⟺ `includes(x)`. The throw above **guarantees** membership, so `mirrored` can never be `true`
for any contract whatsoever. Verified by executing the derivation over all 8 directions: `any mirrored=true
reachable? false`.

**Why it is not blocking:** the *outcome* is correct for this contract — the walk8 sheet has explicit `e` **and** `w`
rows, so nothing is mirrored, and all 8 `false` values match both the runtime and s1148's bar clause 4.
The assertion `expect(snapshot.mirrored).toBe(false)` is still meaningful: it asserts the runtime never mirrors.

**Why it is still a finding:** the report claims "`mirrored` is false whenever the resolved direction has its own row",
which implies a live alternative branch. There is none. If the contract ever regresses toward the pre-walk8 3-row
shape (`s`/`e`/`n`, no `w` — exactly the sheet this slice replaced), the spec **throws at collection time** with
"no row for nw (w)" instead of expecting a mirror — i.e. the one scenario the `mirrored` column exists to cover is
the scenario the code cannot express. Honest forms: derive `mirrored` from whether the alias crossed the mirror
axis, or drop the column and assert `false` outright. **Do not "fix" this by widening anything** — it is a clarity
and latent-trap finding, not a wrong assertion.

### F-1149-2 — test and runtime enumerate frame counts from *different contract keys* *(non-blocking, minor)*
The spec builds its frame set from `grid.cols` (`Array.from({length: banditWalk8.grid.cols})`), while the runtime
builds its file list from `Math.max(1, sheet.frameCount ?? grid.cols ?? 1)` (`SpriteAnimator.ts:1029`). Today
`frameCount = 8` and `cols = 8`, so they agree and the test is sound. Should a future contract ever set
`frameCount ≠ cols`, the expected and actual sets diverge and produce a red that **looks like a runtime bug but is a
contract-shape disagreement**. Cheap hardening: derive the test's length from `frameCount ?? cols`, mirroring the
runtime.

Neither finding blocks. Both are recorded in `tasks/BACKLOG.md`; neither is fire-authorable as a code change to
`src/`, and F-1149-1's cure touches only this spec.

## Merge classification

Merge-base `5ec1a0dc`; main 2 ahead (`574ce6ac` s1148 handoff, `5facc5f0` s1149 lock — **docs only**), lane 1 ahead
(`50949e71`). Disjoint file sets: the lane touched only `e2e/` + a new `artifacts/` report, main touched only
`STATUS.md`. **No conflicts, no 3-way graft required**, `--no-ff` merge by the `ort` strategy. Working-tree dirt at
drain time was confined to `artifacts/`, `logs/`, `reviews/shots-*` (the known ~300-file F-1136-3 churn);
`git status --porcelain -- src/ e2e/ specs/ tasks/ assets/ scripts/` was **empty**, so §2A dirt-ownership was
unambiguous.

## Duties

- **GAZETTE: no item** — filter law working, not an omission. The change is test-only, **zero player-visible
  change**, so it fails the "review names a player-visible change" test (same call as s1146 and s1148).
- **DEPLOY: correctly skipped** — no gameplay-affecting `src/` merged.
- **ART staging audit: not triggered** — the ART slot was untouched this fire.
- **Assayer:** `assets/crafting-queue/pending/` listed, **empty**.
