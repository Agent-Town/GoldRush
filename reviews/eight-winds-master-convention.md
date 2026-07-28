# eight-winds-master-convention — drain review (s1177)

- **Slice:** EIGHT-WINDS master convention — provenance-aware downscale control
- **Branch / tip:** `lane/e2-arsenal` @ `9a0bde4e` (base `b8ca4aca`)
- **Run report:** `tasks/runs/20260728-174607-lane-c-eight-winds-master-convention.md`
- **Verdict:** ✅ **ACCEPT — merged.** Scope 1 returned a well-evidenced **NO** (plus an honest
  **UNKNOWN** for the second provenance commit); per the s1176 handoff that is a full success,
  because it converts the 26-cell exclusion from provisional to permanent-with-a-reason.

## What it does

`--verify-downscale` previously asserted, in a comment, that it compared *"untouched shipped
cells"* — a property the code never checked and could not check (F-1176-2). The 26 cells mended
after extraction were therefore a permanent red for a reason unrelated to the claim under test.
This slice adds `assets/master-divergent.json` (26 entries, each carrying its provenance commit
and a reason) and makes the guard provenance-aware: it now classifies every master into
`byte-identical` / `unexplained` / `master-divergent by design`, and exits 0 only when
`unexplained == 0`. **Zero pixels change.**

## Scope-1 verdict (the thing the handoff said to read first)

| Provenance commit | Reproducible at 512px? | Evidence |
|---|---|---|
| `21dc8739` cutout-pocket mends | **NO** | The tracked tools are resolution-dependent: a 40-pixel component floor (`pockets.mjs:44`), 4-px search padding and 1-px alpha feather (`feather-and-qa.mjs:25-26,41-45`) are fixed pixel ops that do not scale. Read-only replay against all 24 paired masters: `CUTOUT_MASTER_REPLAY=0/24 byte-identical`. Clearest symptom: the 512px detector finds **zero** pockets in `char-hero-sheet-walk8-r0c4.png`, yet the 256px shipped cell is a committed mend. |
| `04732223` metrology mends | **UNKNOWN (honest)** | The commit tracks changed cells + visual artifacts but **no repair script** under `artifacts/cast-metrology/`. Its task permitted re-extraction *or* an alpha patch without recording which. No tracked operation exists to replay, so reproduction cannot be established from repo evidence. |

⇒ The exclusion route is **permanent, not provisional**. A later attended/owner session deciding
the 26-cell data question now has that written down.

## Evidence (re-derived on the merged tree, not inherited from the report)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | exit 0 |
| `npm run build` | exit 0, Vite **1.49 s** |
| Guard — whole tree | `389 byte-identical, 0 unexplained, 26 master-divergent by design (of 415)` · **EXIT=0** |
| Guard — `char-hero-sheet-walk8` | `23 / 0 / 9 (of 32)` · **EXIT=0** |
| Guard — `char-baron-sheet-walk8` | `15 / 0 / 17 (of 32)` · **EXIT=0** |
| Class closure | 9 + 17 = **26** = whole-tree divergent count ⇒ no third sheet |
| `git status --porcelain -- assets/processed assets/processed-full` | **empty** (the handoff's reject condition — clear) |
| `src/` + `e2e/` bytes changed | **zero** |
| Playwright | **not owed** — dev script + data file with no runtime consumer (`grep master-divergent src e2e` → no hits); build green |

All three guard runs reproduce the run report's numbers **exactly**, including per-sheet.

### Mutation controls — re-run by this fire, not read off the report

| Arm | Mutated | Output | Exit |
|---|---|---|---|
| Removed a real manifest entry | guard input | `UNEXPLAINED char-hero-sheet-walk8-r0c4.png` → `23 / 1 / 8` | **1** |
| Bogus exclusion of a clean cell | guard input | `STALE EXCLUSION char-hero-sheet-walk8-r0c0.png` + `1 stale exclusion` | **1** |
| Exclusion naming a nonexistent file | guard input | `MISSING EXCLUSION FILE does-not-exist-r9c9.png` | **1** |
| **Byte-perturbed a real shipped cell** | **the SUBJECT** | `UNEXPLAINED char-hero-sheet-walk8-r0c0.png` → `22 / 1 / 9` | **1** |

The subject arm is the one that matters: it proves the manifest did not blunt the guard's ability
to catch a genuine downscale regression. Restored exactly — `PRE_SHA=0766f2cd41c1846c` ==
`POST_RESTORE_SHA=0766f2cd41c1846c`, and `git status --porcelain -- assets` shows only the new
manifest. Manifest restored byte-identically after each arm (`MANIFEST_RESTORED=true`).

**Every tooth is kept:** unexplained mismatch, stale exclusion, missing exclusion file, and
duplicate exclusion all exit 1.

## Merge classification

Base `b8ca4aca`. `git log b8ca4aca..main` moved **only `STATUS.md`** (the s1176 handoff + this
fire's lock), so main touched none of the three paths. All **LANE-TOUCHED only — no graft, no
conflict**:

| Path | Class |
|---|---|
| `assets/master-divergent.json` | pure add |
| `scripts/anim-pass-reextract.mjs` | lane-touched (main never moved it) |
| `tasks/runs/20260728-174607-…md` | pure add |

## Findings

- **F-1177-1 (🟢 resolved incidentally — worth recording).** F-1176-3 reported that
  `--verify-downscale` truncates its mismatch list at 8 (`bad++; if (bad <= 8)`), so a report
  quoting 9 lines had to be reconstructed. **This slice removes that cap**: the new `unexplained`
  branch prints unconditionally. The truncation is gone from the surviving path, so the trap that
  cost s1176 a paragraph cannot recur here. No action owed.
- **F-1177-2 (🔻 standing hazard, re-verified — LATENT, NOT LIVE).** A flagless global
  `optimize-assets.mjs` still reads master → overwrites shipped (`:92-112`) and would silently
  revert all 26 mends. **Re-verified this fire, not inherited:** a repo-wide sweep for callers
  (`*.json/*.sh/*.mjs/*.js/*.yml`, excluding `node_modules`/`.git`/`dist`/`worktrees`) returns
  exactly two hits — `tasks/goals.json` and the explanatory comment inside
  `anim-pass-reextract.mjs`. **No automated caller; `package.json` has none.** Nothing is broken
  in today's build. The manifest now at least makes such a revert *detectable* (the 26 would flip
  to `stale exclusion` → exit 1) rather than silent.
- **No blocking findings.** No corrective task spawned.

## Where does the player see this?

**Nowhere, by design** — this is factory instrumentation. Zero `src/`, zero pixels, no runtime
consumer. Correspondingly **no GAZETTE item** (filter law: no player-visible change) and
**deploy skipped**.
