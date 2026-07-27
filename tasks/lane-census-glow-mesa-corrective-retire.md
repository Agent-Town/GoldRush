# Task lane-census-glow-mesa-corrective-retire: retire the four `census-glow-mesa-3d` downgrades and refresh the stale census table (lane-c, commit prefix "test:")

**FIRE-AUTHORED s1142 (attended review welcome).** From **F-1132-19**, whose live remainder is quoted below verbatim. It invents no scope: the corrective it names was cured by a different slice, `tasks/corrective-census-glow-mesa-3d.md` is already marked `⛔ CURED BY A DIFFERENT SLICE — DO NOT QUEUE`, and this task only removes the now-unearned downgrades and regenerates the artifact they contaminate. **No product code. No new assertion. `src/**` is barred.**

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. **Do not compare this worktree against a list of files I wrote; I do not have one, and an exhaustive dirt list is the wrong instrument (it is what stopped a runner needlessly at s1132).** Check the **invariant** instead: **no dirty blob in this worktree may be UNIQUE** — every modified/deleted/untracked file's content must already exist somewhere in git (main's history, any branch, or this lane's own commits). If every dirty blob is reachable, the reset destroys nothing → `git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. If **any** blob exists nowhere else, **STOP and report that file by name** — that one is real unmerged work and resetting it would be the Mistake #2 shape. (`git hash-object <file>` then `git cat-file -e <hash>` is enough; `.wrangler/tmp/**` is build scratch and is exempt.) Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

*(s1142 pre-verified this lane and you must still re-verify it: `lane/e2-arsenal` is **1 ahead** at `d2221227`, `runner(lane-c): lane-queue-shipped-guard.md`. That slice is **DRAINED** — its done-move is `tasks/done/shipped-d39e831a-20260727-102640-lane-queue-shipped-guard.md` and `reviews/queue-shipped-guard.md` is present on main. The tip is stale-base false-ahead; the large `git diff main..lane/e2-arsenal` file list is **main having moved forward**, not lane work. Nothing is lost by the reset.)*

## READ FIRST (paths, in this order)

1. `e2e/map-census.spec.ts:105-125` — the four `census-glow-mesa-3d` downgrade sites.
2. `e2e/map-census.spec.ts:290-296` — the `corrective()` / `isPassing()` helpers, so you can see exactly what a downgrade does to a `Result`.
3. `artifacts/map-census/table.md` — the generated artifact, line 3 (`Generated:`) and line 30 (the `e6-glow-mesa` row).
4. `tasks/corrective-census-glow-mesa-3d.md` — the ⛔ header **and** its stated live remainder.
5. `tasks/BACKLOG.md` — **F-1132-19**.

## WHY (quoting the evidence, dated)

`tasks/corrective-census-glow-mesa-3d.md` is marked `⛔ CURED BY A DIFFERENT SLICE — DO NOT QUEUE`, but it carries an explicit remainder, quoted verbatim (mirrored at `tasks/BACKLOG.md:1420`):

> ⚠️ **Residual bookkeeping only, not new work:** `artifacts/map-census/table.md:30` is stale (2026-07-23, pre-reweld) and `e2e/map-census.spec.ts:109/112/117/123` still carry the corrective downgrade for e6-glow-mesa — re-run the census and drop those four lines.

✓ **Both halves re-verified at source by s1142, not inherited:**
- `artifacts/map-census/table.md:3` reads `Generated: 2026-07-23T14:17:31.779Z` — four days stale, pre-reweld.
- `e2e/map-census.spec.ts` still carries all four downgrades at `:109`, `:112`, `:117`, `:123`.

🔑 **Why this is more than cosmetics.** `corrective()` at `:290` rewrites a `FAIL: …` into `CORRECTIVE: …`, and `isPassing()` at `:294` treats neither as passing — but the census **table** presents them very differently, and three of the four sites fire only `if (… .startsWith('FAIL'))`. So while these lines stand, **a genuine future regression of `e6-glow-mesa` is silently relabelled as a known, excused corrective instead of a red.** The downgrade is a guard hole aimed at a defect that no longer exists. That is the "a retired gate left written does not merely fail to block — it actively manufactures reasons not to look" shape (BACKLOG:1426).

## SCOPE (numbered, each testable)

1. **PROVE THE CURE LANDED FIRST — a STOP gate, and you may contradict me.**
   Remove the four downgrade lines **first**, then run `npm run census`.
   - **Expected: `e6-glow-mesa` now reports `PASS` (or a legitimate `PASS-exempt`) on its own merits** in every column that was previously downgraded — `render`, `mq2`, `brightness`, `budget`. That is the premise, and it is what "cured by a different slice" must mean.
   - ⚠️ **If any of those columns comes back `FAIL:` once the downgrade is gone, my premise is WRONG — STOP, restore nothing, and report the exact failing columns with their `FAIL:` text.** That would mean the corrective was retired on paper while the defect is still live, which is a **finding worth more than this task** and must not be papered over. **Do NOT fix it in `src/`** — that is a separate decision.
   - Quote the relevant census output either way.

2. **DELETE, DON'T NEUTER.** With scope 1 green, the four downgrade lines are simply gone — not commented out, not guarded behind a flag. `git grep census-glow-mesa-3d -- e2e/` must return **nothing** afterwards.
   - ⛔ Do **not** remove the `corrective()` / `correctiveCells()` helpers themselves — other rows may use them and the mechanism stays legitimate. Only the four **`e6-glow-mesa`-specific** call sites go.
   - ⛔ Do not touch any other row's corrective, exemption, or threshold.

3. **REGENERATE THE ARTIFACT.** `artifacts/map-census/table.md` must be the product of the run you just did — a fresh `Generated:` stamp and an `e6-glow-mesa` row free of all four `CORRECTIVE: census-glow-mesa-3d` strings.
   - Report the **before → after** of line 30 verbatim.
   - If any **other** row changed versus the committed table, **say so explicitly and do not chase it** — a four-day-old artifact refreshing is expected to move, and an unexplained move is a finding, not a task.

4. **RETIRE THE MASTER'S REMAINDER.** In `tasks/corrective-census-glow-mesa-3d.md`, mark the quoted remainder **DISCHARGED s1142** with this task's name, so the next reader cannot mistake it for open work. Keep the ⛔ header. **One line, no rewrite.**

## TOUCH-ONLY

- `e2e/map-census.spec.ts` — **the four `e6-glow-mesa` downgrade sites at `:109`, `:112`, `:117`, `:123` only**
- `artifacts/map-census/table.md` — regenerated output only
- `tasks/corrective-census-glow-mesa-3d.md` — the one-line DISCHARGED mark
- your report

## NO — do not touch

- ⛔ **`src/**` — ANY file.** If scope 1 shows the defect is still live, that is a **STOP + report**, not a fix here.
- ⛔ The `corrective()`, `correctiveCells()`, `isPassing()` helpers, and every non-`e6-glow-mesa` corrective/exemption in the spec.
- ⛔ Census thresholds, budgets, probe timings, the epoch list, or the row set.
- ⛔ **Do not make the census pass by widening anything.** If a column legitimately fails without its downgrade, that red is the deliverable.
- ⛔ Any other spec file, `reviews/`, `STATUS.md`, `tasks/goals.json`, `tasks/BACKLOG.md`.

## SELF-CHECK before you report

- Scope 1's census output for `e6-glow-mesa` (or the STOP, with the verbatim `FAIL:` text).
- `git grep census-glow-mesa-3d -- e2e/` returns **empty**.
- `npx tsc --noEmit` clean; `npm run build` green.
- `artifacts/map-census/table.md` line 3 stamp is from **your** run; line 30 quoted before → after.
- Any other row that moved, named and left alone.
- `git status` clean of `src/`.

READY-FOR-GATES + report the before/after census row, the four deleted lines, any other row that moved, and anything you had to STOP on.
