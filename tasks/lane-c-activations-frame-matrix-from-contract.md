# Task lane-c-activations-frame-matrix-from-contract: rebuild the assay-office frame matrix FROM THE CONTRACT, not from the runtime (lane-c, commit prefix "test:")

**FIRE-AUTHORED s1148 (attended review welcome).** This is a **STALE-TEST REPAIR** with one hard rule that governs everything below: the replacement expectations are **derived from `assets/layer-contracts/characters.v2.json`**, never read off a running game. If the runtime disagrees with the contract, that disagreement is **a finding to report, not a number to paste**. Read scope 5 before you edit a single line.

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. **Do not compare this worktree against a list of files I wrote; I do not have one, and an exhaustive dirt list is the wrong instrument (it is what stopped a runner needlessly at s1132).** Check the **invariant** instead: **no dirty blob in this worktree may be UNIQUE** — every modified/deleted/untracked file's content must already exist somewhere in git (main's history, any branch, or this lane's own commits). If every dirty blob is reachable, the reset destroys nothing → `git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. If **any** blob exists nowhere else, **STOP and report that file by name** — that one is real unmerged work and resetting it would be the Mistake #2 shape. (`git hash-object <file>` then `git cat-file -e <hash>` is enough; `.wrangler/tmp/**` is build scratch and is exempt.) Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

*(s1148 measured this lane at close and you must still re-verify it: `git log main..lane/e2-arsenal` was **1 ahead** at `d57f3335`, and that commit is **FALSE-AHEAD** — its content merged to main at `bb7f14c3`. Proven by the unique-blob invariant, not by the commit message: after the merge, `git diff --numstat main lane/e2-arsenal` no longer lists `artifacts/f-1147-1-bisect.md` or `scripts/tmp-f-1147-1-bisect.sh` at all — byte-identical — and every remaining line in that diff is main being NEWER than the lane, not the lane holding anything unique. If that is no longer true, apply the invariant above.)*

## READ FIRST (paths, in this order)

1. `reviews/vp-02b-jumper-slot-repair.md:60-81` — **F-1146-4 is this task's entire evidence base.** Read it before forming a hypothesis, especially the sentence explaining why the previous slice deliberately did NOT fix this.
2. `e2e/lane-c-activations-assay-office.spec.ts:24-33` — `jumperDirections`, the stale matrix you are replacing.
3. `e2e/lane-c-activations-assay-office.spec.ts:88-101` — the loop that consumes it; `:99` is the failing assertion, `:100` the mirrored assertion.
4. `assets/layer-contracts/characters.v2.json` → `slots["1"]` (`slot: "char.bandit_base"`) — **the source of truth for the replacement.**
5. `CLAUDE.md` §5 Mistake #12 (never gate a spec a live task is editing) and §7 (escalation).

## WHY (quoting the evidence, dated)

`lane-vp-02b-jumper-slot-repair` (drained s1146 at `d6ce86dc`) completed the 2026-07-12 rename across seven stranded specs. Its headline finding, verbatim from `reviews/vp-02b-jumper-slot-repair.md`:

> **F-1146-4 — the 2026-07-12 rename is stale one layer deeper than the slot key: the FRAME MATRIX.** `lane-c-activations-assay-office:99` now fails with `Expected value: "char-bandit-base-sheet-walk8-r0c7.png"` against `Received array: ["char-jumper-sheet-rotation-r0c0.png", "char-jumper-sheet-rotation-r0c1.png"]`. The spec's hard-coded expected frame-filename list is still the **old jumper art**, while the runtime now correctly emits the **bandit-base walk8 sheet**.

That review is explicit that the repair was left out **on purpose**, and why:

> **Not fixed here, correctly:** rewriting a frame-expectation matrix from observed runtime is the **vp-02d failure mode** (promoting a live bug into a spec); the replacement list must be derived from `assets/layer-contracts/characters.v2.json`, which is a separable slice.

s1147 and s1148 both listed this as fire-authorable and unclaimed. s1148 re-verified the premise at source before authoring (below) rather than inheriting it.

## THE PREMISE, RE-MEASURED BY s1148 (2026-07-28) — verify it yourself, do not inherit it

`e2e/lane-c-activations-assay-office.spec.ts:24-33` still reads, byte-for-byte:

```ts
const jumperDirections = [
  ['s',  { x: 0,   z: -10 }, ['char-jumper-sheet-rotation-r0c0.png', 'char-jumper-sheet-rotation-r0c1.png'], false],
  ['se', { x: -10, z: -10 }, ['char-jumper-sheet-rotation-r0c2.png', 'char-jumper-sheet-rotation-r0c3.png'], false],
  ['e',  { x: -10, z: 0   }, ['char-jumper-sheet-rotation-r1c0.png', 'char-jumper-sheet-rotation-r1c1.png'], false],
  ['ne', { x: -10, z: 10  }, ['char-jumper-sheet-rotation-r2c0.png', 'char-jumper-sheet-rotation-r2c1.png'], false],
  ['n',  { x: 0,   z: 10  }, ['char-jumper-sheet-rotation-r2c2.png'], false],
  ['nw', { x: 10,  z: 10  }, ['char-jumper-sheet-rotation-r2c0.png', 'char-jumper-sheet-rotation-r2c1.png'], true],
  ['w',  { x: 10,  z: 0   }, ['char-jumper-sheet-rotation-r1c2.png', 'char-jumper-sheet-rotation-r1c3.png'], false],
  ['sw', { x: 10,  z: -10 }, ['char-jumper-sheet-rotation-r0c2.png', 'char-jumper-sheet-rotation-r0c3.png'], true],
] as const;
```

while the loop at `:88-100` waits on the **`char.bandit_base`** slot. The contract entry for that slot, `assets/layer-contracts/characters.v2.json` → `slots["1"]`, is:

```json
{
  "slot": "char.bandit_base",
  "fallback": { "file": "char-bandit-base-sheet-walk8-r0c0.png" },
  "walk8": {
    "version": 1, "status": "ACTIVE", "enabled": true,
    "frameCount": 8, "fps": 16, "cadenceReferenceFrames": 4,
    "grid": { "file": "char-bandit-base-sheet-walk8.png", "cols": 8, "rows": 4,
              "rowDirections": ["s", "w", "e", "n"] },
    "aliases": { "se": "e", "ne": "e", "sw": "w", "nw": "w" }
  }
}
```

**Two structural consequences — these are the whole point of the task, and the second is the one that is easy to miss:**

1. **The sheet changed shape.** Old art: 3 rows of a `rotation` sheet. New art: **4 rows × 8 cols**, `rowDirections ["s","w","e","n"]` ⇒ row0=`s`, row1=`w`, row2=`e`, row3=`n`; frame keys are `char-bandit-base-sheet-walk8-r{row}c{col}.png` with `col` in `0..7`.
2. **⚠️ THE `mirrored` COLUMN MUST CHANGE TOO, AND IT IS NOT MENTIONED IN F-1146-4.** The old sheet had no `w` row, so `nw` and `sw` were produced by **mirroring** the east-side rows — hence `true` in the old matrix. The new contract carries **explicit `e` AND `w` rows** plus `aliases` mapping `se`/`ne`→`e` and `sw`/`nw`→`w`. A direction served by its own row does not need mirroring. **If you rebuild only the filename column and leave `mirrored: true` on `nw`/`sw`, `:100` becomes the next red and this task has merely moved the failure one line down** — the exact "a red at row 1 says nothing about rows 2..N" shape this thread has now hit three times.

## SCOPE (numbered; each item testable)

1. **Reproduce first, and record it.** Run the spec and capture the current state per test, both projects:
   `npx playwright test e2e/lane-c-activations-assay-office.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=list`
   Write the before-table (which tests pass/fail, and the exact `Expected`/`Received` at `:99`) into your report. **If `:99` does NOT fail in the way F-1146-4 describes, STOP and report — the premise has moved and the rest of this task is void.** A STOP here is a **SUCCESS**, not a failure.
2. **Derive the replacement matrix from the contract, in code, not by hand.** Resolve each of the eight directions through `rowDirections` + `aliases` to a row index, and build the expected frame-key list for that row from `cols`. Put the derivation in the spec itself (read the JSON, or a small typed helper beside it) so the matrix **cannot go stale again** the next time the art changes — that is the durable half of this task. A hand-pasted literal list is the failure mode you are here to end; if you judge that reading the contract at test time is wrong for this suite, say so in your report with a reason and paste the derived values **with the derivation printed next to them**.
3. **Set `mirrored` from the contract too** — per the analysis above, a direction resolved through `aliases` to its own row is **not** mirrored. Do not carry the old `true` values forward.
4. **Keep the spec's shape.** The loop at `:88-101`, the wait at `:91-97`, the slot key `char.bandit_base`, the spawn positions, and the console/page-error assertions at `:103-104` all stay. You are replacing the **data**, not the test.
5. **⛔ THE HARD RULE — DERIVE, NEVER OBSERVE.** You may run the game to *check* your derivation. You may **not** let it *author* your expectations. If the runtime emits a frame key your contract-derived list does not contain:
   - **STOP. Do not widen the list to admit it. Do not rewrite the expectation to match the observation.**
   - Report it as a finding: name the direction, the contract-derived expectation, and the observed key.
   - That disagreement is either a real runtime bug or a stale contract, and **both are outcomes worth more than a green test.** This is the `vp-02d` failure mode by name — promoting a live bug into a spec — and it is the single most likely wrong move in this task.
6. **Report.** `artifacts/lane-c-activations-frame-matrix.md`: the scope-1 before-table, the derivation (direction → alias → row → frame keys → mirrored), the after-table, and any scope-5 disagreement in full.

## FIREWALL

**TOUCH-ONLY:**
- `e2e/lane-c-activations-assay-office.spec.ts`
- `artifacts/lane-c-activations-frame-matrix.md` (new)
- a small helper beside the spec **only if** scope 2 needs one (`e2e/helpers/**` or similar); name it in your report.

**NO — do not touch, for any reason:**
- **`src/**` — ZERO source changes.** If the fix appears to be in the runtime, that is scope 5: report, do not repair. A `src/` diff in this slice is a firewall violation and the drain will reject it.
- **`assets/layer-contracts/characters.v2.json`** — it is the source of truth here; editing it to match a test inverts the whole task.
- **`assets/**`** generally, `src/game/Balance.ts`, any other `e2e/*.spec.ts`, `STATUS.md`, `tasks/**`, `reviews/**`, other lanes' files.
- Do not "fix" adjacent reds you notice. **Report them** — that is valuable and in scope for your report; fixing them is not.

## SELF-CHECK (name the exact commands and paste the real numbers)

Run and paste rc + counts for each; **both projects**, `--workers=1`:

1. `npx tsc --noEmit` → expect rc=0.
2. `npm run build` → expect rc=0.
3. `npx playwright test e2e/lane-c-activations-assay-office.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=list` → **the target: 3/3 both projects.** Paste the list output.
4. Adjacent suites, unmodified-green: `npx playwright test e2e/visual-polish-assets.spec.ts e2e/vp-02b-rotation-resolver.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=list` → s1146 measured these at **2/2** and **7/7**; any change is a finding.
   ⚠️ **Measure adjacent suites in a state that matches main** — s1147's `m2-04 7/7` was measured in a lane worktree at an old base and was 6/7 on main (F-1147-3). Note your base commit next to the numbers.
5. Zero console/page errors — the spec already asserts this at `:103-104`; confirm it is still asserting, not skipped.
6. `git status --short` — confirm **zero `src/` diff** and that the only changes are the TOUCH-ONLY paths.

## SEQUENCING / LAWS

- Path-scoped `git add` only — never `-A` at repo root. Commit prefix `test:`.
- One concern per commit.
- The runner auto-commits on this lane; do not touch `STATUS.md`, `tasks/**` or `reviews/**`.
- If you are blocked twice on the same obstacle, **STOP and report** rather than trying a third variation of the same idea (§7.5).

**READY-FOR-GATES** when scopes 1–6 are done. Report: the before/after tables, the full derivation (direction → row → frame keys → mirrored) so a reviewer can check it against the contract without running anything, every scope-5 disagreement in full, and any adjacent red you noticed but correctly did not touch.
