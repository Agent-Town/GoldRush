CODEX: model=gpt-5.6-sol effort=xhigh

# lane-f1486-1-rounded-scale-halo-cure — the 37 rounded-scale halo cells join the 774 already cured

FIRE-AUTHORED (attended review welcome) — s1487, from F-1485-1 / F-1486-1 evidence plus four s1487 pre-authoring measurements.

ROLE: implementer on lane-a. WORKDIR: worktrees/lane-a (branch `lane/a`). Commit prefix `f1486-1:`. Never touch STATUS.md, reviews/, tasks/queue/, other lanes.

PRE-FLIGHT (LANE-SAFETY INVARIANT): `git branch --show-current` = `lane/a`; any dirty tracked blob not reachable in git → STOP and report. `git checkout -B lane/a origin/main` ONLY when clean.
CURRENCY CHECK (STOP-gated): `grep -c "function composite(shipped, cure) {" artifacts/f1487-1/full-res-arm.mjs` must print **1**. If it prints 0 the lane is BEHIND the commit carrying this task's evidence — STOP and report "lane stale, needs refresh"; do NOT proceed and do NOT try to reconstruct the recipe from this file alone.
SAFE-DUPE: `git log --oneline -1 -- scripts/halo-reextraction-check.mjs` — if its subject already contains `f1486-1:` the work is done → STOP and report.

## WHY (evidence chain, all dated and quoted)

**F-1470-4** holds 301 halo cells across 15 sheets out of the accepted re-extraction cure. **F-1485-1** (s1485) split that residue and found 45 of the 301 are not an art question at all but a **tooling defect**: `extract-alpha.mjs:376` computes `scale = min(1, cell*0.86/maxDim)` as a full double, `:412` writes it to `frames.json` via `toFixed(4)`, and `anim-pass-reextract.mjs:163` feeds that 4-decimal value straight back in as `--scale` — so every re-extraction resamples at a scale wrong in the 5th decimal. Sheets clamped to `scale == 1` are immune because `min(1, …)` hides the rounding, which is exactly why the 774 that passed, passed.

s1485 measured the exact-scale recovery (`maxDim = round(cell*0.86/shippedScale)`, then `scale = cell*0.86/maxDim`) end-to-end and found it satisfies every clause of F-1470-4's first disjunct **except** byte-identical opaque RGB: 117 fully-opaque pixels move, each by exactly 1/255. It then **correctly refused to relax an owner-facing threshold** and put the question on the desk.

**F-1486-1** (s1486) dissolved the question without relaxing anything, and the proof is structural rather than numerical — **the gate's two predicates read DISJOINT PIXEL SETS**:
- `artifacts/f1450-4/halo-class-sweep.mjs:41` — `if (data[idx + 3] !== 0) continue;` — the halo share is computed over **alpha === 0** only.
- `scripts/halo-reextraction-check.mjs:82` — `if (before.data[offset + 3] === 255 && …)` — the invariant guards **alpha === 255** only.

The halo being cured and the interior being protected **do not overlap at a single pixel**, so the 117 movers were never part of the cure — they are incidental resampling noise in a region the cure has no need to touch. Taking the shipped RGB wherever the shipped pixel is fully opaque makes the invariant true **by construction**, and leaves the antialiased edge band taking the cured colour — which is exactly the diff signature F-1464-1 recorded for the accepted 774: *"all 10,741 changed visible pixels sit in the antialiased edge band … 0 fully-opaque pixels change RGB"*. **This is not a new class needing a new ruling; it is the existing ruling reaching cells the 4dp bug had knocked out of it.**

### The four things s1487 measured before authoring this (F-1483-1: run the gate's predicate first)

1. **`artifacts/f1487-1/base-vs-shipped.mjs`** — F-1486-1 measured against the **shipped** bytes, but `halo-reextraction-check.mjs:64-91` judges against the **BASE** bytes (`git show 89bfc10c:<file>`). Those are the same object only if the held cells were never rewritten since BASE, which nobody had checked. **Measured: identical 37 / differing 0.** F-1486-1's numbers transfer to the gate unchanged.
2. **`artifacts/f1487-1/master-precedent.mjs`** — the accepted 774-cell cure rewrote `assets/processed/` for all 774 **and** `assets/processed-full/` for all 278 that had masters. So display-only scope would diverge from precedent.
3. **`artifacts/f1487-1/full-res-arm.mjs`** — three arms off one re-extraction per sheet. The shipped **derivation invariant** (`processed/<cell>` == `resize(processed-full/<cell>)`) **holds 37/37**. **ARM A** (composite at the display level, F-1486-1's recipe) reproduces it exactly: alpha 0 · opaque-RGB 0 · suspects 37→0 — harness validated. **ARM B** (composite at the full level, then resize — the derivation-preserving recipe) **FAILS the gate: 73 opaque-RGB pixels move by 1.** The full masters composited against their own shipped bytes are clean: alpha 0 · opaque-RGB 0.
4. **`artifacts/f1487-1/full-master-halo.mjs`** — **all 37 full-res masters carry the halo too** (key share up to 98.41%). They are in scope, so this master matches precedent #2 rather than diverging from it.

## READ-FIRST
1. `artifacts/f1486-1/opaque-preserving-composite.mjs` — **the specification.** Its `resize()` (`:56-78`) and its composite (`:158-165`) are the recipe verbatim; do not re-derive either.
2. `artifacts/f1487-1/full-res-arm.mjs` — the same recipe applied at both resolutions, plus the ARM A / ARM B comparison and the `composite()` helper you should reuse.
3. `scripts/halo-reextraction-check.mjs` — the gate you must re-pin **in the same commit**, or it reds on its own success.
4. `artifacts/f1450-4/halo-class-sweep.mjs` — the halo predicate (`:41`), so you can see for yourself that it reads only alpha === 0.
5. `artifacts/f1487-1/full-res-arm.json` + `full-master-halo.json` — the per-sheet numbers this task's self-check must reproduce.

## SCOPE

**1. Write the cure script** `scripts/rounded-scale-halo-cure.mjs`. For each of the **six** sheets below, read `assets/processed/<stem>.frames.json`, and for every non-empty cell:
   - `maxDim = Math.round((fj.cell * 0.86) / fj.scale)` ; `exact = (fj.cell * 0.86) / maxDim`
   - re-extract the sheet ONCE with `scripts/extract-alpha.mjs --key ff00ff --grid <cols>x<rows> --cell <cell> --scale <exact> --out <tmpdir> assets/raw/<stem>.png` (a `mkdtemp` dir — **never** extract into `assets/`)
   - `assets/processed-full/<cell.file>` := `composite(shippedFull, produced)`
   - `assets/processed/<cell.file>`      := `composite(shippedDisplay, resize(produced, displayCell, displayCell))`, where `displayCell` is the width of the shipped display cell
   - `composite(shipped, cure)`: alpha **always** from `cure`; RGB from `shipped` wherever `shipped.alpha === 255`, else from `cure`. Verbatim from READ-FIRST #1 `:158-165`.

   The six sheets (37 cells — this list is exhaustive and closed):
   `char-hero-sheet-back-f` (6) · `char-hero-sheet-front-f` (6) · `char-hero-sheet-rotation2-f` (8) · `char-hero-sheet-side-actions-f` (6) · `char-hero-sheet-side-f` (4) · `ter-rail-elements` (7)

**2. Run it.** 37 display cells + 37 full masters rewritten. Nothing else under `assets/` may change — prove it with `git status --porcelain assets/ | wc -l` = **74**.

**3. Re-pin the gate in the SAME COMMIT** — `scripts/halo-reextraction-check.mjs`:
   - delete the six stems above from `HELD_SHEETS` (`:15-19` and `:25`), leaving **nine**: `char-bandit-thief-sheet-walk8`, `char-baron-sheet-walk8`, `char-e9-feral_terraformer-sheet-walk8`, `char-elder-sheet-walk8`, `char-hero-sheet-walk8`, `char-newsie-mei-sheet-walk8`, `char-storekeeper-sheet-walk8`, `char-youngster-f-sheet-walk8`, `char-youngster-m-sheet-walk8`
   - `:36` `assert.equal(expectedResidual.length, 301)` → **264**
   - `:37` `assert.equal(cured.length, 774)` → **811**
   - leave `BASE`, `:34` (1314) and `:35` (1075) alone — the denominator does not move.

**4. Evidence artifact** `artifacts/f1486-1/cure-applied.json`: per sheet and in total — cells, alpha-diff pixels, opaque-RGB-diff pixels, max delta, halo suspects before → after, for **both** `assets/processed/` and `assets/processed-full/`, each measured against the **BASE** bytes (`git show 89bfc10c:<file>`), not against the pre-run working tree.

**5. Declare the derivation break, do not hide it (F-1487-1).** The shipped invariant `processed/<cell> == resize(processed-full/<cell>)` holds 37/37 today and **will break** after this cure, because the two composites are applied independently at their own resolutions — s1487 measured the divergence at **73 opaque pixels, max delta 1/255** (`full-res-arm.json`, ARM B). It is unavoidable: the derivation-preserving alternative (ARM B) fails the opaque-RGB gate outright, so the invariant and the gate cannot both hold. **Nothing in the repo enforces the invariant** (grep it: no guard reads it), so this is a declared consequence and not a blocker. Measure the exact post-cure figure into the artifact of scope 4 under key `derivationBreak`, and write one paragraph in your report naming it. **Do NOT add a guard for it** — a guard asserting an invariant this slice deliberately breaks would red on its own success (the F-1484 lesson: run a gate's predicate against the POST-cure world too).

## TOUCH-ONLY
`scripts/rounded-scale-halo-cure.mjs` (new) · `scripts/halo-reextraction-check.mjs` (the re-pin only) · the **37** `assets/processed/*.png` and **37** `assets/processed-full/*.png` cells named in scope 1 · `artifacts/f1486-1/cure-applied.json` (new) · `tasks/BACKLOG.md` + `tasks/goals.json` (leaf `art-rounded-scale-halo-cure`, same commit).

## NO
`scripts/extract-alpha.mjs` — **deliberately untouched.** s1485 refused to widen its 4dp `frames.json` record because 1,314 shipped `frames.json` files encode that precision and the recovery arithmetic in scope 1 reads them; widening it strands them. The rounding bug is real and stays filed, not fixed here.
· `*.frames.json` — the recorded scale stays 4dp for the same reason; cell dimensions do not change (alpha diff 0 proves it).
· The 8 `char-e9-feral_terraformer-sheet-walk8` cells — in the pocket detector's scope, held by a **pre-existing** pocket count (8 on the shipped bytes before any cure; F-1486-1 measured the composite leaves it 8 → 8). Not yours.
· The other eight held sheets — still held, still out.
· `artifacts/fix-walk-cutout-pockets/pockets.mjs --fix` — **NEVER RUN IT.** It rewrites 88 files in `assets/processed/` in place by zeroing alpha, and whether those blobs are genuine pockets or legitimate cream art is UNMEASURED (F-1486-2).
· Any halo work on sheets not in the six · `functions/` · release transforms · any src/ gameplay code.

## SELF-CHECK
`npx tsc --noEmit` clean · `npm run build` green (it runs `asset-diet.mjs`, which is the byte-budget gate over these assets) · **`node scripts/halo-reextraction-check.mjs` green, printing `811 cured, 264 held, 1314 scanned`** — this is the acceptance test and it must be run AFTER the re-pin · `git status --porcelain assets/ | wc -l` = 74 · adjacent suites green **UNMODIFIED**, both projects, `--workers=1`: `e2e/vp-02-sprite-animation.spec.ts` and `e2e/vp-02b-rotation-resolver.spec.ts` (they consume the hero sheets) and `e2e/run3d-rail-elements.spec.ts` (the rails) · zero console/page errors desktop + 390px · screenshots to `reviews/shots-f1486-1/` showing the hero and a rail element in a plain boot (no `?debug`) — **a halo cure is a look change, so it gets an eye, not only a number.**

Expected numbers, pre-measured by s1487 — **report yours against these and flag ANY divergence rather than explaining it away**: `assets/processed/` alpha 0 · opaque-RGB 0 · suspects 37 → 0. `assets/processed-full/` alpha 0 · opaque-RGB 0 · suspects 37 → 0.

READY-FOR-GATES. Report: the per-sheet table from scope 4, the `halo-reextraction-check` output line verbatim, the measured `derivationBreak` figure, and confirmation that `assets/` shows exactly 74 modified files and nothing else.
