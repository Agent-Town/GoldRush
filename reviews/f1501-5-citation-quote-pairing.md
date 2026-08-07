# f1501-5 — citation quote pairing

**Slice:** `f1501-5-citation-quote-pairing` · **branch:** `lane/a` · **tip:** `477fb7f9`-successor, lane tip at drain time
**Merge:** `790a66f579c64944ad12dedc6a8ef011c4ca7f0d` (s1515, `--no-ff`)
**Drained by:** s1515 (fire), 2026-08-07

## Verdict

**MERGED.** Every acceptance bar the master set was met, and each one was re-measured here rather than
inherited from the runner's report. The one substantive addition this drain makes is **F-1515-1**: the
formulation the runner chose is a *backstop*, not a *cure*, and I proved the residual class exists
rather than asserting it.

## What it does

`scripts/citation-title-guard.mjs` scans a 400-char window around each `e2e/*.spec.ts:NN` citation in
`tasks/**` and tries to recover a quoted test title from it. Its `QUOTED` regex treats **every** quote
character as interchangeable and walks the window with a **global `lastIndex`**, so delimiters pair in
strict scan order and any character consumed is unavailable later. A sub-12-char inline code span
between two quoted titles therefore makes the scanner pair the code span's *closing* backtick with the
next title's *opening* quote — the real title never appears as a capture at all.

The slice adds `QUOTED_BY_KIND` (delimiters paired with their own kind) and a `matchingQuote()` helper
that tries the **loose scanner first, then the by-kind scanner**, returning the first candidate that
resolves — a **union**. Both call sites go through it: the titles scan and the `CARRIES-LINE` fallback
(F-1252-3), which the master required to stay in agreement.

## Evidence (all re-measured on the merged tree, Node **v26.4.0**, gate worktree `gate-s1515`)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, no output |
| `npm run test:node-guards` | **rc=0** — `tests 348 · pass 345 · fail 0 · skipped 3` |
| `--report` on **main** (pre-merge) | `511` scanned · `263` NUMBER-ONLY · `205` CARRIES-TITLE · `43` CARRIES-LINE |
| `--report` on **merged tree** | `511` scanned · `262` NUMBER-ONLY · `206` CARRIES-TITLE · `43` CARRIES-LINE |
| `--report` on **main after merge** | identical to the merged tree — `511 / 262 / 206 / 43` |
| Manufactured-defect arms | **RED on old guard (rc=1, 2 fails) · GREEN on new (rc=0, 15/15)** |
| `npm run build` + browser | **NOT owed** — stated explicitly, not skipped silently (see below) |
| F-1460-1 sim-guard trigger | **checked, not assumed** — diff touches no `src/sim/`, `src/systems/`, `src/entities/` path |

### Scope 2's bar, arithmetically

- `CARRIES-TITLE` **206 ≥ 205** ✅ (+1)
- `NUMBER-ONLY` **262 ≤ 263** ✅ (−1)
- `citations scanned` **511 = 511** ✅ — denominator stable, so these are verdict movements, not a
  different corpus
- Both arms sum correctly: `263+205+43 = 511` and `262+206+43 = 511`

The result lands **exactly** on s1514's authoring-time prediction for the union arm (`262/206/43`),
measured independently in a different checkout at a different Node version. That agreement is the
strongest single piece of evidence here.

### The manufactured defect — re-proved, not inherited

Per the s1299/s1301 standard, a green never exercises a violation path, so the runner's green is not
evidence about the red. I re-proved it: reverted **only** `scripts/citation-title-guard.mjs` to main's
blob inside the gate worktree, ran the citation test file, restored.

```
ARM A — NEW tests against NEW guard
✔ a short code span cannot consume the following quoted title
✔ a bare apostrophe cannot consume the following quoted title
ℹ tests 15 · pass 15 · fail 0                                  RC=0

ARM B — NEW tests against OLD guard
✖ a short code span cannot consume the following quoted title
✖ a bare apostrophe cannot consume the following quoted title
ℹ tests 15 · pass 13 · fail 2                                  RC=1

restored byte-identical: true · git status of guard: ""
```

Both arms are **named in the output**, so they demonstrably ran rather than being silently absent.

### Why build + browser are not owed

The diff is `scripts/**` + `docs/bench/**` only. There is no `src/`, e2e-spec, rendering or simulation
surface in it, so there is no run surface to drive. Said out loud rather than skipped silently, per the
master's self-check.

### Node-version split (F-1507-1) — a **fourth** consecutive datum

The runner reported **rc=1 / 2 reds** on its ambient **v23.11.1** and correctly diagnosed them as the
standing F-1507-1 timeout-semantics split rather than bending a test. I discharged them **rc=0 on
v26.4.0**, the `.nvmrc` pin. The two reds it named (`fixture owners remove their temp directories`,
`a per-test timeout still overrides the default`) are the same pair as the three prior fires. This is
now a supervisor rerun in **four consecutive drains** — see the desk item.

## Merge classification

Base `2ca902742`. Main gained exactly two commits since (`398901b05` s1514 handoff, `acc147aa5` s1515
lock), **neither touching any path in this slice**.

| Path | Class |
|---|---|
| `scripts/citation-title-guard.mjs` | LANE-TOUCHED (+18/−17) |
| `scripts/citation-title-guard.test.mjs` | LANE-TOUCHED (+22) |
| `docs/bench/f1501-5-citation-quote-pairing.md` | LANE-TOUCHED (new, 126 lines) |

**Zero MAIN-MOVED, zero conflicts.** Merge rehearsed in a detached worktree before touching main
(§3.0b custody), and the `ort` merge there and on main produced identical stats.

## Firewall compliance — verified by probe, not by trust

- `scripts/citation-title-baseline.json` — **not in the diff** (the F-1506-2 laundering class the
  master forbade). Checked with `git diff --name-only main...lane/a`, which lists three paths only.
- `package.json` — **not in the diff**; `citation-title-guard.test.mjs` was already rooted in
  `test:node-guards`, confirmed by reading the roster.
- `tasks/**` — **not in the diff**. The corpus is the measurement subject; editing it would have been
  measuring the fire's own edit.
- `CITE`, `TITLE_DECL`, `WINDOW`, `MIN_PREFIX` — all unchanged, which is what the stable `511`
  denominator independently confirms.
- `scripts/gr-sim.test.mjs` not re-pinned (F-1441-3); no `src/` or e2e spec touched.

## Findings

### 🟡 F-1515-1 — the union is a BACKSTOP, not a CURE: greedy delimiter consumption survives, and a class it cannot cover exists (NON-BLOCKING, fire-authorable, **but must be priced before authoring**)

The master's scope 3 offered the union as *"a PROVEN-SAFE FLOOR, not the required implementation"* and
named the cleaner alternative: *"a non-destructive scan that enumerates all candidate spans instead of
consuming them greedily … is arguably what the code meant to do all along."* The runner took the floor.
That is **within licence and the slice merits its merge** — but it leaves the underlying design intact,
and the union masks the defect only where a *same-kind* pairing happens to survive the greedy walk.

**Measured, not asserted.** Replaying both regexes from the merged guard over three windows:

| Window shape | loose | by-kind | union recovers title? |
|---|---|---|---|
| title · short code span · title (the slice's case) | ✗ | ✓ | **YES** |
| title · bare apostrophe · title (the sibling) | ✗ | ✓ | **YES** |
| **ODD count of same-kind quotes before the title** | ✗ | ✗ | **NO — residual** |

The third row is the class: with an unbalanced same-kind delimiter earlier in the window, *both*
scanners consume the wrong pair and the title is unreachable by either. `he said "foo and then some
prose "<title>".` yields `"foo and then some prose "` from both arms and never the title.

⚠️ **This is pre-existing, not introduced.** The merged change is a measured strict superset of main
(`263/205/43 → 262/206/43`, nothing lost), so the residual was already there and the slice strictly
improves on it. It fails **CLOSED**, so it costs cycles rather than shipping defects.

📐 **What the successor owes, and the trap in pricing it.** Corpus incidence is **UNMEASURED** — I did
not have a sound number and am not going to invent one. Per F-1514-1, the successor must price it
*before* being authored: of today's 262 `NUMBER-ONLY` rows, how many would a non-destructive
all-pairs scan recover? If the answer is ~0, this row should be **closed as theory**, not built.

🪤 **And the obvious way to measure it silently returns a false zero.** `scan()` is exported, but the
rows it returns are `{file, raw, spec, verdict, carried, mdLine, context}` — there is **no `window`
and no `titles` field**. A probe that filters on those (as my first attempt did) skips **every** row
and reports `0 recoverable`, which reads exactly like "the residual never occurs." It was caught only
because `scripts/citation-title-guard.mjs` has **no `import.meta.main` guard** — importing it executes
the CLI and calls `process.exit()`, so the probe died loudly instead of lying quietly. **Price it by
copying the guard and exporting the window derivation, the way s1514 measured the by-kind arm — not by
consuming `scan()`'s public rows.**

### ⓘ Non-finding, recorded so it is not re-litigated

`matchingQuote` runs the loose scanner **first**, so where the loose scanner recovers *some* title the
by-kind arm never runs. That is intentional and is precisely what makes the change a superset — it is
why nothing was lost. Not a defect.

## Bookkeeping

- Goal leaf `f1501-5-citation-quote-pairing` → `status: merged`, `mergeHash: 790a66f5…` (drain commit).
- BACKLOG **F-1501-5** row closed; **F-1515-1** filed open in the same commit.
- Done-move renamed `drained-790a66f5-…`.
- No gazette item — scripts-only guard change, not player-visible (filter law).
- No deploy — no gameplay code merged.
