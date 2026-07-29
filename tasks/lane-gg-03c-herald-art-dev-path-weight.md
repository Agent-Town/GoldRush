# GG-03c — the Herald's art weighs the same in dev as it does in dist

**FIRE-AUTHORED (attended review welcome)** — authored s1209, 2026-07-29, from the evidence chain
`reviews/gg-03-gazette-panel-swap.md` (F-1208-1, F-1208-2) + `reviews/gg-03b-gazette-panel-weight.md`
(F-1209-1, F-1209-2, F-1209-3) + this fire's byte measurements. Supersedes GG-03b, which stopped at its
own scope-1 gate.

**Role:** implementer. **Workdir:** `worktrees/lane-a` (branch `lane/m3`).

## READ FIRST (paths, not memory)

- `reviews/gg-03b-gazette-panel-weight.md` — **the whole argument for this task**, including why GG-03b's
  `PREMISE-NOT-REPRODUCED` did not refute anything and why this task's gate is written differently.
- `reviews/gg-03-gazette-panel-swap.md` — F-1208-1 and F-1208-2 as first measured.
- `archive/lane-perf-gg03-06eeac68` — the rejected GG-03 slice, pinned. **It is good work and you are
  re-landing it, not rewriting it.** `git show archive/lane-perf-gg03-06eeac68` for the 9-file, +29/−3 delta.
- `scripts/asset-diet.mjs` — read `distDir` on line 9 and understand that **every ceiling in this file
  measures `dist/` only**. That is the defect.
- `src/news/heraldReader.ts:5-18` — the `assets/raw/herald-engraving-*.png` glob, `eager: true, query: '?url'`.
- `assets/processed/` vs `assets/processed-full/` — **the house convention already exists**: web-sized
  derivatives in `processed/`, full-resolution masters in `processed-full/`. Most UI globs already use it
  (`src/ui/UpgradeOverlay.ts:6`, `src/ui/EraBackdrop.ts:3`, `src/town/TownScene.ts:98`).

## WHY (measured this fire, not argued)

`import.meta.glob('../../assets/raw/...', { query: '?url' })` makes Vite serve the **full-resolution master**
on the dev path. `npm run build` then runs `scripts/asset-diet.mjs`, which cuts those masters hard — but the
diet only ever touches `dist/`. So **the production path is lean and the developed-and-tested path is not**,
and every byte ceiling in the repo is blind to the difference:

| Family | glob site | dev-path bytes | `dist/` bytes | ratio |
|---|---|---:|---:|---:|
| `herald-engraving-*` | `src/news/heraldReader.ts:5` | **15.73 MB** (7 files) | 281,444 B | **58.6×** |
| `gazette-panel-*` | added by GG-03 | **21.45 MB** (6 files) | 3,350,448 B | **6.7×** |
| `plate-contract-*` | `src/town/TownScene.ts:93` | **137.24 MB** (41 files) | — | — |
| `ceremony-stage-t*` | `src/ceremony/stages.ts:36` | **31.46 MB** (10 files) | — | — |

**205.88 MB of masters are reachable through `assets/raw` globs.** That is *exposure*, not per-boot fetch —
`eager: true` resolves URL strings, not bytes, so a file costs nothing until an `<img>` renders it. The
number that matters is **bytes actually fetched on a plain boot**, and nobody measures it today.

This is why GG-03 was blocked. It did not create the defect — **main already carries it, and worse
(58.6× vs 6.7×)** — but adding six panels that all render at once in the first issue pushed the plain-boot
Claim Herald over a load threshold: pooled across three fires, `e2e/gazette-art-wiring.spec.ts:103` failed
**6/12 treatment cells and 0/16 control cells**.

**Fix the class, not the instance.**

## SCOPE

### 1. Measure-first — and this gate is deterministic, unlike GG-03b's

GG-03b was cancelled by a gate written on a *timing symptom*, which is a function of ambient machine load;
it measured a quiet window and stopped. **Do not gate on timing.** Gate on bytes.

Write `scripts/herald-dev-weight.mjs`: boot the app against a dev server (port passed as a **required
argument, never defaulted** — a defaulted port silently measures a foreign tree), drive the plain-boot
Claim Herald first-issue path, and **sum the response bytes of every image request**. Print the total and
the per-file breakdown.

**STOP condition:** if the plain-boot Claim Herald fetches **< 4,000,000 B** on the dev path today, the
premise is gone — write `PREMISE-NOT-REPRODUCED` with the measured number into
`artifacts/gg-03c-herald-dev-path/report.md` and stop. (Expected: it will not stop. Today's herald
engravings alone are 15.73 MB on disk. But measure — do not assume.)

### 2. Derivatives for the two Herald families, masters preserved

Extend the existing `assets/processed/` convention to `herald-engraving-*` and `gazette-panel-*`:
generate web-sized derivatives, leave every byte in `assets/raw/` untouched.

**RETENTION LAW: do not delete, move, shrink, or overwrite anything in `assets/raw/`.** The masters stay.
Derivatives are new files.

Size them to what the UI actually displays — read `src/news/heraldReader.css` for the rendered box, and do
not ship pixels no one sees. The diet already resizes herald spot cuts to **384×384** for `dist/`; matching
that on the dev path is the obvious target, but justify your number from the CSS, not from this sentence.

### 3. Repoint the wiring, and re-land GG-03

Point `heraldReader.ts`'s globs at the derivatives. Then apply the archived GG-03 slice
(`git checkout archive/lane-perf-gg03-06eeac68 -- src/news/heraldReader.ts src/news/heraldReader.css scripts/asset-diet.mjs e2e/gazette-first-issue.spec.ts`)
and reconcile it with your repointing — GG-03's panel swap is the payload this task exists to land.

### 4. Widen the guard's denominator — this is the load-bearing half

Add a **dev-path** ceiling to `scripts/asset-diet.mjs` (or a sibling script it calls) that measures the
**source files the globs actually reach**, not `filesUnder(distDir)`. GG-03's own `GAZETTE_PANEL_BUDGET_BYTES`
check is the anti-pattern to correct: it reads post-diet `dist/` bytes and therefore passed while the path
it regressed carried 6.7× the ceiling.

Set the ceiling from your scope-1 measurement with a stated margin. **Say in a comment why the number is
what it is** — GG-03's 4,000,000 was fitted 19% above an observed 3,350,448 after the fact, which is a
ceiling that can only ever pass.

### 5. Mutation proof — a guard only ever seen passing is not a guard

Point one glob back at a full-size raw. Show the scope-4 guard **fails**, with output. Restore. Show it
**passes**, with output. Paste both into the report. Do the same for the scope-1 script.

### 6. Re-run the disputed spec at the canonical config

`e2e/gazette-art-wiring.spec.ts`, both projects, **2 workers**, on a scratch port you first proved is
serving *this* tree. Run it **4×**. Report every cell. This is corroboration, not the gate — scope 1 and
scope 4 are the gates.

## FIREWALL

**TOUCH-ONLY:** `src/news/heraldReader.ts` · `src/news/heraldReader.css` · `scripts/asset-diet.mjs` ·
`scripts/herald-dev-weight.mjs` (new) · `assets/processed/` (new derivative files only) ·
`e2e/gazette-first-issue.spec.ts` · `artifacts/gg-03c-herald-dev-path/`

**NO:**
- **`e2e/gazette-art-wiring.spec.ts` — FIREWALLED OUT.** It is the instrument that caught this. Editing it
  to pass is the one forbidden move.
- **`playwright.config.ts`** — F-1204-3 precedent.
- **`assets/raw/**` — retention law. Read it, never write it.**
- `src/town/TownScene.ts`, `src/ceremony/stages.ts` — the `plate-contract-*` (137.24 MB) and
  `ceremony-stage-t*` (31.46 MB) families are the **same defect class** and are **deliberately out of scope**.
  Report them in your report as owed follow-ups; do not fix them here.

## PRE-FLIGHT (LANE-SAFETY, runner-auto-commit aware)

The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is
already merged to main (verify via `git log`/`git diff`), it is a **SAFE DUPE** →
`git checkout -B lane/m3 main && git clean -fd` and PROCEED. **STOP-and-report ONLY** if an ahead commit's
content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted
edits you did not make.

*`lane/m3`'s one ahead commit `a7c91fdc` is a **safe dupe**: its only file,
`artifacts/gg-03b-gazette-panel-weight/report.md`, was merged to main by s1209 as **`4eb56c16`** and
pushed to `origin/main`. Proof by content, not ancestry — that path is **absent** from
`git diff --name-status main lane/m3`, i.e. byte-identical on both sides; every other entry in that diff
is stale-base phantom (files created after `lane/m3` forked) plus log churn. **Verify this yourself; do
not inherit it.***

⚠️ **ATTEMPT 1 OF THIS MASTER STOPPED HERE, CORRECTLY, AND THE FAULT WAS THE FIRE'S.** s1209 queued this
task at 11:55 but did not commit the GG-03b drain until `4eb56c16` a few minutes later, so the runner read
a `main` on which `a7c91fdc` genuinely *was* undrained and refused to `reset --hard` over it — exactly the
Mistake #2 protection working as designed. It changed nothing. The premise is now true; this is attempt 2
with a **changed premise**, not an identical retry.

Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## SELF-CHECK

- `npx tsc --noEmit` clean · `npm run build` green (both projects).
- `e2e/gazette-first-issue.spec.ts` and `e2e/gz-02-news-page.spec.ts` green, desktop **and** 390px mobile.
- `e2e/gazette-art-wiring.spec.ts` 4 runs at 2 workers, every cell reported.
- Zero console/page errors in a **plain boot** (no `?debug`) — and answer in the report: *where does the
  player see this?* (Mistake #10.)
- Screenshots to `artifacts/gg-03c-herald-dev-path/`, desktop + 390px.
- Scope-1 and scope-4 numbers in the report as **real measured bytes**, with the mutation proofs.

**READY-FOR-GATES + report: the scope-1 dev-path byte total (before and after), the scope-4 ceiling and why
that number, both mutation proofs, all 4 spec cells, and the `plate-contract-*` / `ceremony-stage-t*`
follow-ups you did not touch.**
