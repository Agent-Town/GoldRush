# Review — suite-red-inventory harness provenance (F-1173-5)

- **Slice:** `lane-d-suite-red-inventory-harness-provenance` (FIRE-AUTHORED s1198, run + drained s1198)
- **Branch / tip:** `lane/perf` @ `57fc65ed` · **base** `c77e26fa`
- **Done-move:** `tasks/done/20260729-054920-lane-d-suite-red-inventory-harness-provenance.md`
- **Run report:** `tasks/runs/20260729-054920-lane-d-lane-d-suite-red-inventory-harness-provenance.md.log` (194,264 tokens)
- **§3.0 `drain-block-check`:** ✅ **CLEAR**, run FIRST — before classification and before I formed an opinion.

## Verdict

**ACCEPT.** The reducer now records the harness that produced the report, the addition is provably additive-only, and the guard that protects it was refuted before it was trusted. **One finding raised (F-1198-2, non-blocking) that corrects a conclusion in the immediately preceding slice's review — the report is still not repo-root-invariant, and I measured it rather than inferring it.**

## What it does

`scripts/suite-red-inventory.mjs` parsed `report.config` at `:11` and then **never used it**. One line now emits it into the report header:

```
- Harness: configured workers **2**; actual workers **2**; fully parallel **false**; shard **null**; Playwright **1.61.1**
```

F-1173-5 ends by naming a duty — *"any comparison against the suite-red inventory must state its worker count"* — which the inventory itself made impossible to discharge. It is discharged now. `logs/suite-red-inventory.md` also gains an **appended** provenance section (the measured table was **not** edited — s1196/F-1180-2 precedent, it is a measurement artifact).

🚨 **The measured answer contradicts the assumption the finding itself seeded.** F-1173-5's narrative is about a runner at `--workers=1`, and fires have carried that number forward as if it described the inventory. **It does not: the canonical 303-red table is a `workers=2` artifact.** A fire re-running at `--workers=1` *to match the inventory* was committing the exact error F-1173-5 warns about while believing it had controlled for the variable. The label was not merely missing — its absence had been filled in wrongly.

## Evidence

| Gate | Result |
|---|---|
| `drain-block-check` (§3.0, first) | ✅ CLEAR |
| `npx tsc --noEmit` | clean — ⚠️ but see note below |
| `npm run build` | green (vite; asset-diet 84% / 88% cuts as usual) |
| `node scripts/run-guards.mjs --only test:node-guards` | **`PASS rc=0` 11s** — an **exit code**, not a printed counter (F-1125-1); covers the `test-ticker-stats` tail |
| node-guard count | **68 tests / 68 pass / 0 fail**, **14 files** |
| Additive-only proof (my instrument, main's tree) | 128,781 B → **128,904 B**, **1 line added, 0 removed, 0 changed** |
| Cross-root reproduction | see F-1198-2 |
| Mutation control (runner) | m1 configured-as-actual → FAIL on expected `3`; m2 absent-as-`1` → FAIL on expected `unrecorded`; subject restored, SHA-256 `f95ca9…494c` |
| Playwright / screenshots | **none, and that is proportionate not thinned** — zero `src/`, zero `e2e/` bytes; Mistake #10 answers *nowhere, by construction* |

⚠️ **`scripts/**` is OUTSIDE `tsconfig`'s `include`, so `tsc` does NOT cover this subject.** The node guard is the only gate on it. Stated rather than left implied.

🚨 **GUARD COUNT MOVED: 66 → 68 (still 14 files).** Broadcast here, in the leaf, in `BACKLOG` and in the handoff. s1196 moved it 61→65, s1197 65→66; **`68/68` is now healthy.** An unbroadcast change to an expected value becomes the next fire's phantom red.

### The guard was refuted, not trusted

Two tests added to the **existing** `scripts/suite-red-inventory.test.mjs` (no new file, `package.json` untouched). The populated fixture deliberately uses **distinct** values — `workers: 7`, `actualWorkers: 3` — because equal values cannot catch a copy-paste that prints the same field twice; the runner's m1 mutation confirms that assertion has teeth. The `config: {}` case asserts **`unrecorded`**, so the report can never claim a confident `1` when it simply does not know. The pre-existing `reducer output is cwd-invariant` test is **green and unmodified**.

## Merge classification

Base `c77e26fa`. **Collisions NONE** — `git diff --stat c77e26fa main` over the three TOUCH-ONLY paths is **empty**; main moved none of them.

| File | Class |
|---|---|
| `scripts/suite-red-inventory.mjs` | LANE-TOUCHED (+1) |
| `scripts/suite-red-inventory.test.mjs` | LANE-TOUCHED (+32/−4) |
| `logs/suite-red-inventory.md` | LANE-TOUCHED (+8, **append-only** — verified in the staged diff: additions begin after line 571, the measured table is untouched) |
| `marketing/outbox/ticker-digest-2026-07-28.md` | **MAIN-MOVED-ONLY** — the two-dot diff shows this as **−62 lines**, which is a *phantom deletion*: main gained it in this same fire after the lane branched. **Not copied.** |
| `tasks/BACKLOG.md` | **MAIN-MOVED-ONLY** (main gained F-1198-1 after the lane branched). **Not copied.** |

Merged path-scoped, three paths only. **Firewall held exactly**: zero `src/`, zero `e2e/`, `package.json` untouched, no `try`/`catch` added, the input JSON untouched.

## Findings

### 🔺 F-1198-2 (non-blocking, but it corrects a published conclusion) — THE RED INVENTORY IS STILL NOT REPRODUCIBLE ACROSS CHECKOUTS, AND s1197'S "`:57` NEVER FIRES" IS WRONG FOR 409 OF THE 553 ROWS

The runner raised a finding against my own master: my stated baseline of **128,781 B** read **117,285 B** in its lane. I re-measured instead of waving it through, and it is **exactly reproducible** — a 2×2, same input, same script:

| | reduced from main's root | reduced from `worktrees/lane-d` root |
|---|---|---|
| pre-change script | **128,781 B** | **117,285 B** |
| post-change script | **128,904 B** | **117,408 B** |

**The delta survives this merge unchanged (11,496 B, ~9%), so it is pre-existing and untouched — not a regression introduced here.**

✓ **Cause verified at source, not inferred.** The differing column is **"Failing file:line"**, on **409** rows. `relative()` at `:58` reads `if (path.isAbsolute(file)) return path.relative(ROOT, file)`. Error locations in the raw **are absolute** — they point into the tree the original Playwright run used (`…/worktrees/lane-d/e2e/…`) — so reducing from main's root renders `worktrees/lane-d/e2e/061-…` while reducing from the lane renders `e2e/061-…`.

⚠️ **Therefore s1197's headline correction — *"`:57` NEVER FIRES"* — is true only for `spec.file` (which Playwright stores relative) and false for error paths, which take that branch on every one of those 409 rows.** s1197's fix (`process.cwd()` → `ROOT`) is still correct and valuable: it made the reducer **cwd**-invariant and killed a hard ENOENT crash. It did **not** make it **repo-root**-invariant, and the guard it shipped cannot see the gap because its fixture's errors carry no file paths — *a green battery inherits its instrument's blind spots.*

➡️ **Why it matters, and why I did not cure it here:** this is the same disease one level down from the one just fixed — the artifact silently encodes the tree that produced it. But the cure is a **judgement, not a mechanism**: those absolute paths are genuine provenance (they record where the run happened), so normalising them to a bare `e2e/…` would *destroy* information, while leaving them makes byte-comparison across checkouts impossible. That is a design call, it is outside this task's firewall, and it deserves its own slice. **Fire-authorable** — no owner decision, no canon.

### ⓘ F-1198-3 (informational) — my master's stated baseline was environment-specific and I did not say so

I wrote *"the authoring fire measured exit 0, 128,781 bytes"* into the master as a check value without qualifying which tree produced it. The runner hit a different number, correctly flagged it, and correctly proceeded. No harm done — but a baseline byte count handed to a run in a *different worktree* is only meaningful with its root named. Same shape as s1197's F-1197-1 (a number reported in the wrong units), one level out: **state the instrument beside the number, which is precisely what this slice ships for the inventory.**

## Duties

- **GZ-01:** **not owed, and that is a ruling not a skip** — the filter law wants a *player-visible* change; this merge moves **zero `src/` bytes**. m3-05e/m3-05f precedent.
- **Goal leaf:** `factory-suite-red-inventory-harness-provenance` → `merged` with the full 40-char hash, in the drain commit (Goal Registration Law).
