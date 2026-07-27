# lane-c-activations-derivation-hardening

**Slice:** lane-c-activations-derivation-hardening · **Branch:** `lane/e2-arsenal` · **Tip:** `fc5ba2b6` · **Base:** `1f9d956f`
**Drained:** s1151, 2026-07-28 · **Verdict:** ✅ **MERGE — every clause of the s1150 bar met, and I verified each one at source rather than reading it off the runner's report.**

## What it does

Retires the dead `mirrored` column from `e2e/lane-c-activations-assay-office.spec.ts` and makes the spec's
row/frame derivation agree with the runtime it tests. One file, 12 insertions / 7 deletions, zero `src/`.

Three divergences between the spec's derivation and `SpriteAnimator.ts:1027-1029` are closed:

| # | Finding | Spec before | Spec after | Runtime (`src/assets/SpriteAnimator.ts`) |
|---|---------|-------------|------------|------------------------------------------|
| F-1149-1 | `mirrored` unreachable | derived `!rowDirections.includes(rowDirection)` — provably always `false` | asserts `false` directly | n/a |
| F-1149-2 | case sensitivity | `indexOf(rowDirection)` | `findIndex(c => c.toLowerCase() === …)` | `:1027` `findIndex(c => c.toLowerCase() === direction)` |
| F-1150-4 | explicit `row` ignored | — | `directions?.[rd]?.row ?? findIndex(…)` | `:1027` `source.row ?? findIndex(…)` |
| F-1150-4 | frame count | `grid.cols` | `Math.max(1, frameCount ?? cols ?? 1)` | `:1029` identical expression |

The runner chose **cure (a)** for `mirrored` (delete the column, assert `false`) and named its reason:
runtime reports `false` for all eight directions, so cure (b) — expecting diagonal aliases to mirror —
would have contradicted the runtime. **That is the correct choice**, and the master required the reason
to be stated; it was.

The one divergence deliberately **not** closed is the `row < 0` branch: runtime returns `null`, the spec
`throw`s. The runner kept the throw and added a comment saying why (a malformed contract should fail
loudly at collection rather than silently skip a direction). Reasonable, declared, not silently different.

## Evidence — measured by me on the MERGED tree

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **rc=0**, `✓ built in 1.16s` |
| Slice, `desktop-chrome` | **3/3 passed** (13.2s) |
| Slice, `mobile-chrome` (390px) | **3/3 passed** (10.9s) |
| `node scripts/run-guards.mjs` | **8/8 rc=0** ← *the runner reported 7/8; see F-1151-1* |
| `git status --porcelain -- src/` | **empty** |
| `git diff --name-status main...lane/e2-arsenal` | **exactly one file**, the intended spec |
| `assets/layer-contracts/characters.v2.json` | **byte-unchanged** (absent from the branch diff entirely) |

**Merge classification:** base `1f9d956f` (7 minutes stale at drain time). `git log 1f9d956f..main --` on both
the spec and the contract returns **empty** → **LANE-TOUCHED / MAIN-UNMOVED**, no 3-way graft needed.
Landed by `git checkout lane/e2-arsenal -- <file>` + path-scoped add.

**Adjacent suites — argued structurally, not sampled.** The diff is confined to one `.spec.ts`. Nothing
imports it (`grep -rln` over `e2e src scripts playwright.config.ts` returns only handoff/scratch `.mjs`
files that mention the *name* as text). With zero `src/` and no shared helper touched, the blast radius
is the file itself. The node-side battery (8/8) covers the rest.

### Scope-5 derivation table — RE-DERIVED INDEPENDENTLY, not copied from the report

The master's declared STOP condition was any difference between the before and after tables. I re-derived
both directly from `assets/layer-contracts/characters.v2.json` with a standalone script, running the OLD
expression and the NEW expression side by side:

```
grid: {"file":"char-bandit-base-sheet-walk8.png","cols":8,"rows":4,"rowDirections":["s","w","e","n"]}
aliases: {"se":"e","ne":"e","sw":"w","nw":"w"} · frameCount: 8 · directions: undefined
s  | OLD r0 x8 mir=false | NEW r0 x8 mir=false | IDENTICAL
se | OLD r2 x8 mir=false | NEW r2 x8 mir=false | IDENTICAL
e  | OLD r2 x8 mir=false | NEW r2 x8 mir=false | IDENTICAL
ne | OLD r2 x8 mir=false | NEW r2 x8 mir=false | IDENTICAL
n  | OLD r3 x8 mir=false | NEW r3 x8 mir=false | IDENTICAL
nw | OLD r1 x8 mir=false | NEW r1 x8 mir=false | IDENTICAL
w  | OLD r1 x8 mir=false | NEW r1 x8 mir=false | IDENTICAL
sw | OLD r1 x8 mir=false | NEW r1 x8 mir=false | IDENTICAL
```

Rows `0,2,2,2,3,1,1,1`, eight frames each, `mirrored=false` throughout — **identical on both halves, all
eight directions**, matching the runner's table exactly. The change is provably shape-only: it alters how
the expectation is *derived*, not what it *is*. `directions` is `undefined` in today's contract, so the new
`source.row` arm is latent-but-correct — it exists to stop the spec diverging the next time the contract grows one.

### Mutation control — the assertion still bites

This spec's whole family (F-1149-1/2) was about assertions that *could not fail*, so a green run here proves
nothing on its own — the spec and the runtime read the same contract file, which is the classic tautology
shape. I mutated the **runtime**, not the test: `SpriteAnimator.ts:1027`, `row` → `row ^ 1` (swaps 0↔1, 2↔3,
keeping every row in range).

**Result: the slice FAILED at `lane-c-activations-assay-office.spec.ts:121`** — `expect(frames).toContain(snapshot.frameKey)`.
So the spec's contract-derived expectation is genuinely cross-checked against an independent runtime
derivation; a row regression is caught. Mutation reverted (`git checkout -- src/assets/SpriteAnimator.ts`,
`git status --porcelain -- src/` empty), and the slice re-run **clean 3/3** afterwards so no red-run
artifacts were left behind.

## Findings

### F-1151-1 — `test:task-guards` is structurally guaranteed to FALSE-RED in every lane worktree (⚠️ non-blocking, corrective shipped this fire)

The runner reported **guards 7/8, twice**, and attributed it to *"unrelated `test:task-guards` reports
existing unclassified task masters"*. On main the same battery is **8/8**, and `test:task-guards` passes
with an invisible set of **0**.

The runner's stated cause is the guard's own printed text — but the inference (a pre-existing board
problem) is wrong. **The real cause is the measurement location.** `scripts/task-guard-audit.mjs` decides
"has this master ever run?" by listing `tasks/done`, `tasks/failed`, `tasks/running` — and per the
attended-coexistence law those move-directories are **always untracked**, so they exist in full only in
the main checkout:

| | `tasks/done` | `tasks/failed` | `tasks/running` | audit result |
|---|---|---|---|---|
| main | 816 | 49 | 0 | `8/8`, **0 invisible** |
| `worktrees/lane-c` | 158 | 49 | 1 | **346 NEW invisible**, rc=1 |

Measured, not reasoned: running the audit from `worktrees/lane-c` prints
`task-guard-audit: 668 masters, 346 invisible (baseline 0)`. Hundreds of masters that *have* run read as
never-run because their done-moves are simply not on that disk path.

This is not a flake and not this slice's fault. It is deterministic, it fires for **every** lane runner
that runs the full battery, and it will keep producing a plausible-sounding red that costs the next fire
ten minutes to re-derive — or worse, gets inherited as "task-guards is known-red". **A guard that cannot
be trusted where it is run is worse than no guard**, so it is fixed rather than documented: see the
follow-up commit in this fire, which makes the audit refuse to report from a linked worktree instead of
reporting a number it cannot compute there.

*This is the same shape as s1150's F-1150-1: a run's report carries two separable claims — THAT it went
red, and WHY. The first is evidence; the second is a hypothesis wearing evidence's clothes.*

### F-1151-2 — the spec still `throw`s where the runtime returns `null` (🟢 informational, deliberate, no action)

Recorded so it is not re-discovered as a defect. `SpriteAnimator.ts:1028` returns `null` for an
unresolvable row; the spec throws. That divergence is intentional and now carries an in-file comment.
It only differs for a contract that is already malformed, and in that case failing loudly at collection
is the better behaviour for a test.

## Duties

- **Gazette:** **no item.** Test-only change, zero player-visible surface — the filter law working, not an omission.
- **Deploy:** correctly **skipped**, no gameplay-affecting `src/` merged.
- **Goal leaf:** `lane-c-activations-derivation-hardening` → `status:"merged"`, `mergeHash` set, in the drain commit.
- **Done-move:** renamed `shipped-<hash>-…` per the shipped-ness convention.
