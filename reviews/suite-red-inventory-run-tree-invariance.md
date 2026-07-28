# Review — suite-red-inventory-run-tree-invariance

- **Slice:** `lane-d-suite-red-inventory-run-tree-invariance` (F-1198-2)
- **Branch / tip:** `lane/perf` @ `b1d42540` (runner commit, 2026-07-29T06:34:51+07:00)
- **Base (merge-base):** `b9e7e258`
- **Drained by:** s1200 fire, 2026-07-29
- **Master:** `tasks/lane-d-suite-red-inventory-run-tree-invariance.md` (FIRE-AUTHORED s1199)

## Verdict

**MERGE — ACCEPTED.** The cure is real, the guards bite under two independent mutations I
wrote myself, and the decisive anti-no-op check passes on the **real 171 MB raw**: output is
byte-identical from two unrelated script roots *while still carrying its measured content*.
That last clause is the whole point — s1199's own prototype achieved byte-identity across
roots while resolving **zero** bodies, and a cross-root identity check alone would have
certified that decorative no-op as success.

## What it does

`scripts/suite-red-inventory.mjs` now resolves every rendered path and every body statistic
against **the tree the raw itself names** (`report.config.rootDir`), instead of against
whatever repo root the reducer happens to be executing from.

1. `runRoot` is derived from `config.rootDir` (dropping a trailing `e2e/` segment); `ROOT`
   remains the fallback only for raws that record no `rootDir`.
2. `relative()` resolves absolute error locations against `runRoot`, and — when a `rootDir`
   is recorded — derives the `e2e/` prefix from **`rootDir`'s basename**, never from
   `fs.existsSync`. This is the master's binding constraint, and it is honoured: no
   `fs.existsSync` call decides a rendered path on the recorded-root code path.
3. `testBody()` returns `undefined` rather than reading a substituted local file when the
   recorded tree is absent or the source is missing.
4. The masking `risk` is `undefined` when nothing could be measured, instead of silently
   taking the `?? 100` default. Unresolved rows sort **after** every ranked row and render
   their rank as `—`, and the section header states `N of M rows ranked`.
5. A new header line states the provenance **once**:
   `- Run tree: **<rootDir>**; status **present|unavailable**; resolved test bodies **222/270**`.

The normalise-vs-preserve fork the finding posed is dissolved rather than chosen: provenance
is stated once instead of leaking into 506 table cells, and not one byte of information is lost.

## Evidence

| Gate | Result |
|---|---|
| §3.0 `drain-block-check.mjs` | **✅ CLEAR** — ran **first**, before classification and before I formed an opinion (`status:"queued"`, 2 leaves matched, longest wins) |
| `npx tsc --noEmit` | clean (⚠️ `scripts/**` is outside `tsconfig`'s `include`, so tsc does **not** cover this subject — the node guard is the only gate on it) |
| `npx vite build` | green, **1.39 s** |
| node guards (counter) | **72 tests / 72 pass / 0 fail**, 14 guard files |
| node guards (exit code) | `run-guards --only test:node-guards` → **`PASS rc=0` 11s** — an exit code, not a printed counter (F-1125-1) |
| Guard baseline **before** the merge | **68/68 pass, 0 fail** — measured on main by running it, not inherited from s1199 |
| Cross-root identity, **real raw** | root A **117,626 B** / root B **117,626 B**, sha `6fc89d8ef94e` both — **IDENTICAL: true** |
| Anti-no-op (same run) | **188** percentage cells · **95** ranked masking rows · **40** marked `—` · **222/270** bodies resolved ⇒ **PASS, real measured content survives** |
| Absolute-prefix leakage | **1** occurrence of `worktrees/lane-d/` in the whole 117,626 B report — the `Run tree:` provenance line itself. Zero in any table (was **506**) |
| Canonical artifact | `logs/suite-red-inventory.md` **untouched** — absent from `git status`; the master forbids regenerating it by name |
| `git diff --check` | clean |

### Independent mutation controls (I mutated the **subject**, never the guard)

`logs/session-scratch/s1200-mutation-control.mjs`, written by this fire — deliberately not the
run's own m1/m2/m3, so the controls are not marking their own homework.

| Mutation | Change to the subject | Result |
|---|---|---|
| **m-own-1** | `relative()` reverted to `path.relative(ROOT, file)` — precisely the F-1198-2 defect | **2 guards FAIL**: `script-root-invariant`, `refuses body statistics when the recorded tree is unavailable` |
| **m-own-2** | masking `risk` reverted to `Math.min(...map(body?.percent ?? 100))` — the could-not-measure-as-lowest-risk defect | **2 guards FAIL**: `an unresolved masking row never outranks a resolved row`, `refuses body statistics…` |
| restore | subject restored | SHA-256 **`58ec4538aba91e6e7f2815500cd558f84271bd79d8db7de546f22b71e1c581b2`** — byte-identical, and an independent match to the hash the run reported |

The guards are therefore neither tautological nor decorative: each defect the slice claims to
cure has a guard that goes red when the cure is removed.

### Merge classification

Base `b9e7e258`; `git diff --stat b9e7e258..main` = **`STATUS.md` + 2 `logs/session-scratch/` files only**
⇒ **collisions NONE**.

| File | Class |
|---|---|
| `scripts/suite-red-inventory.mjs` | **LANE-TOUCHED** — merged |
| `scripts/suite-red-inventory.test.mjs` | **LANE-TOUCHED** — merged |
| `STATUS.md` | **MAIN-MOVED-ONLY** — not copied |
| `logs/session-scratch/s1199-handoff.mjs` | **MAIN-MOVED-ONLY** — reads as a phantom deletion in the two-dot diff; main gained it in `2af3471e` after the lane branched. **Not copied.** |
| `logs/session-scratch/s1200-status-line1.mjs` | **MAIN-MOVED-ONLY** — same shape; main gained it in this fire's own lock commit. **Not copied.** |

Firewall **exact at 2 paths**: zero `src/`, zero `e2e/`, `package.json` untouched (the guard
file was extended, not added, so the 14-file list is unchanged).

**Mistake #10 — "where does the PLAYER see this, in a plain boot?"** *Nowhere, by
construction*: the merge moves **zero `src/` and zero `e2e/` bytes.* No Playwright run and no
screenshots — **proportionate, not thinned.**

## Findings

- **F-1200-1 (🚨 broadcast, not a defect) — THE GUARD COUNT MOVED 68 → 72 (still 14 files).**
  The four new guards are `script-root-invariant`, `renders absolute raw paths relative to the
  recorded tree`, `refuses body statistics when the recorded tree is unavailable`, and `an
  unresolved masking row never outranks a resolved row`. `72/72` is now healthy. Broadcast here,
  in the leaf, in `BACKLOG` and in the handoff, because **an unannounced change to an expected
  value becomes the next fire's phantom red.**

- **F-1200-2 (ⓘ low, non-blocking) — the `resolved test bodies **222/270**` denominator is
  masking-scoped, and the line does not say so.** `resolvedBodyCount`/`totalBodyCount` are
  computed by flattening `masking[].ratios` only — so `270` counts the executions of the 135
  masking-candidate rows, **not** all 303 reds. The number is honest and the label is not
  wrong, but a reader will reasonably take it for a whole-report statistic. *A statistic must
  name its denominator* — the same shape as F-1198-3 and F-1199-1, one turn further out.
  **One-word remedy** (`resolved masking-row test bodies`); deliberately not fixed in the drain,
  because editing a merged subject outside its firewall to improve a caption is not a drain's job.

- **F-1200-3 (ⓘ low) — one new guard is weaker than its name.** `reducer renders absolute raw
  paths relative to the recorded tree` **passed under m-own-1**, the very defect it is named
  for. Its `| e2e/fixture.spec.ts |` assertion reads the *spec-file* column, which Playwright
  already stores relative, so it does not exercise the absolute error-location branch. The
  slice is fully guarded regardless — `script-root-invariant` catches that defect — but *a
  guard's name is a claim*, and this one's discriminator does not test what its title says.
  Worth tightening when this file is next opened; not worth its own slice.

- **The run raised a finding against its own master, and it was right.** The master's stated
  after-check commands pointed one arm at unmodified `main`, so they could not both exercise
  the patched subject. The run substituted byte-identical copies of the final script at two
  unrelated roots — the correct instrument — and **said so plainly instead of reporting a green.**
  It also declined to represent an inconclusive Codex review as a clean second opinion. Both are
  the behaviour the factory wants; recorded here as precedent, not as a defect.

## Reproduction

`node logs/session-scratch/s1200-real-raw-invariance.mjs` (committed per the RETENTION LAW)
extracts the 171 MB raw from `archive/suite-red-inventory-raw-171mb`, runs the merged reducer
from two unrelated roots, and asserts **both** halves — cross-root byte identity **and**
non-empty measured content.
