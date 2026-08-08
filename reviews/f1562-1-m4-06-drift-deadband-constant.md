# f1562-1 — the m4-06 drift-ceiling comment names the 0.06 deadband

- **Slice:** f1562-1 (`tasks/done/20260808-164608-lane-c-f1562-1-m4-06-drift-deadband-constant.md`), authored s1562
- **Branch / tip:** `lane/c` @ `664c33ae5` (ahead=1, base `fbe34359`)
- **Gated by:** s1563 fire, detached worktree `gate-s1563` (§3.0b)
- **Run:** 83,792 tokens, READY-FOR-GATES

## VERDICT: **MERGED.**

## What it does

Comment-only. The `m4-06` drift-ceiling comment cited `Embodiment.ts:288–300` and enumerated the constants the
`0.4` bound depends on, but the range's own first line — `this.drifting = distance > 0.06`, the drift deadband
— went unnamed. This adds it, describing it as *"the threshold below which the agent stops correcting"*, and
keeps the range unchanged. Closes F-1562-1.

## The count: the runner corrected its author, and the runner is right

s1562 authored this as *"the widened citation spans a **ninth** constant"* and instructed that a differing
count from the runner *"is the finding, not an error"*. The runner answered: `Embodiment.ts:288–300` contains
**eight** numeric literals — `0.06`, `0.58`, `-1.8`, `0.78`, `0.22`, `-1.25`, `0.52`, `0.18` — *"not nine"*,
because `4.8` is external via `Balance.agent.moveSpeed`.

✓ **VERIFIED by reading `src/agent/Embodiment.ts:284–303`, not inferred.** Literals in range: `0.06` (:288),
`0.58` (:292), `1.8` / `0.78` / `0.22` (:299), `1.25` / `0.52` / `0.18` (:300) = **exactly eight**. `4.8`
appears in range only as the identifier `Balance.agent.moveSpeed` (:292). The "ninth" arose from counting the
old comment's eight NAMED constants and adding `0.06`, but one of those eight (`4.8`) is not in the range at
all — so in-range it is seven named plus `0.06` = eight. **The runner's enumeration is correct and s1562's was
not.** The deadband description is accurate: `if (!this.drifting) return;` at `:289` means correction stops
below `0.06`.

## Evidence (measured on the MERGED tree, `--workers=1` per §3.1)

| Gate | Result |
|---|---|
| `drain-block-check --strict` | ✅ CLEAR — `[f1562-1-m4-06-drift-deadband-constant] status="queued"` (first command) |
| `npx tsc --noEmit` | ✅ rc=0 |
| `npm run build` | ✅ green, 1.33s |
| **Comment-only, proven mechanically** | ✅ **5 changed lines, 0 non-comment**; both `toBeLessThan(0.4)` assertions **byte-identical** to main |
| `e2e/m4-06-embodiment.spec.ts` | 17/18 both runs — the 1 red is `:395`, **pre-existing on main, see below** |
| `test:node-guards` | NOT RUN, deliberately: diff is `e2e/` only — no `src/sim/`, `src/systems/`, `src/entities/`, so F-1460-1 does not bind. No coverage claimed from it. |

## Merge classification

Base `fbe34359`. `lane-freeze-classify lane/c` → **paths=1, LANE-ONLY 1, DUPLICATE 0, MAIN-ONLY 0,
BOTH-MOVED 0** (`base=25d39c74 lane=32887677 main=25d39c74`). `git log lane/c..main -- e2e/m4-06-embodiment.spec.ts`
**empty** — main has not moved the file since the base (s1562's own `92559f683` merge predates it), so no graft.
Landed path-scoped, that one file only.

## Findings

### F-1563-3 — the 0.4 drift ceiling is BREACHED ON CLEAN MAIN under full-spec load in the fire shell, and six consecutive tasks have been documenting it rather than measuring it.

✓ VERIFIED by control runs, not inferred. The slice is comment-only with byte-identical assertions, so it is
**causally incapable** of moving these numbers; every observation below is a property of main.

| Arm | Full-spec run, `--workers=1` | Result |
|---|---|---|
| MERGED `0d628f9ca` | run 1 | 17 passed, 1 failed — `:395` mobile |
| MERGED `0d628f9ca` | run 2 | 17 passed, 1 failed — `:395` desktop, **driftAbs=0.4453** (> 0.4) |
| MERGED `0d628f9ca` | `:395` mobile, ISOLATED | ✅ passed, driftAbs=0.2834 |
| **CLEAN MAIN `98a464438`** | run 1 | 17 passed, **1 failed** — `:395` desktop, `expect(received).toContain("ledger")`, received `["held","ask me","no trust"]`; driftAbs=0.3565 |
| **CLEAN MAIN `98a464438`** | run 2 | 16 passed, **2 failed** — `:395` both projects, desktop **driftAbs=0.41504** (> 0.4) |

**Main fails this test in 2 of 2 full-spec runs; the merged tree in 2 of 2. The merged tree is no worse, which
is what licenses this merge.** The red is fingerprint-matched to main by control, per §3.

Two things deserve the next fire's attention, and they are not the same defect:

1. **The test fails via TWO independent assertions.** One is the drift ceiling (`driftAbs` 0.41504 and 0.4453
   observed against a 0.4 bound); the other is a permission-chip assertion (`"ledger"` absent from
   `["held","ask me","no trust"]`) that fires *before* drift is ever measured. Naming this "the m4-06 flake"
   would hide one behind the other.
2. **It is load-dependent, not a line.** Isolated, `:395` passes with margin (driftAbs=0.2834, 29% under the
   bound); inside the 18-test file it breaches. That is the load-ceiling shape, and it means the bound was
   calibrated under a lighter arrangement than the one that gates it.

⚠️ **The uncomfortable part, stated plainly:** the ladder `f1557-3 → f1558-1 → f1559-1 → f1560-1 → f1561-2 →
f1562-1` is **six consecutive merges refining the COMMENT that explains this ceiling** — its provenance, its
sample, its constants, and now its deadband. All six were correct and each closed a real citation gap. But in
the same window the ceiling itself has been quietly breaching on main under the shell that gates it, and no
rung of the ladder measured it, because each rung's gate ran the spec and read a green or an excused red.
**Documenting a bound is not validating it.** ➡️ Recommended next rung: stop annotating the constant and
measure it — N full-spec runs on unmodified main, both projects, recording `driftAbs` per run, then either
re-pin with a named cause (never a reflex, per F-1441-3) or fix the load sensitivity. This is fire-authorable
from this review as evidence; it needs no owner word.
