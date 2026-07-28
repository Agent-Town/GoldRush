# Task lane-c-eight-winds-master-convention: make the downscale control tell the truth about 26 deliberately-mended cells, so the EIGHT WINDS ladder can move (lane-c, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1176, 2026-07-28. Authored from a **measured** finding, not a plan: `lane-c-eight-winds-wiring-hero` stopped lawfully at a mandatory control, and the s1176 drain then measured that the control's failure is a **class of 26 cells across two sheets**, not the 9 the runner could see. Evidence: `reviews/eight-winds-wiring-hero.md` (F-1176-1, F-1176-2) and the landed run report `tasks/runs/20260728-172245-lane-c-eight-winds-wiring-hero.md`. No new scope invented; this is the blocker sitting on the ladder's critical path.

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST (paths, not memory):
- `AGENTS.md`
- **`reviews/eight-winds-wiring-hero.md` — the whole file.** It is the READ-FIRST for this slice. F-1176-1 gives you the class and its provenance; F-1176-2 gives you the exact defect you are repairing. Every number below was measured there; re-derive any you intend to rely on.
- `scripts/anim-pass-reextract.mjs:1-32` (the header — it states the convention and why a global optimize is unsafe) and **`:102-118` (`--verify-downscale`, the subject of this task)**.
- `scripts/optimize-assets.mjs:1-15` (header) and **`:92-112`** — `maybeRefreshFullCopy` writes a master ONLY when one is missing, then the loop reads the master, downscales, and **overwrites the shipped cell**. This is why the 26 divergences are a latent revert, and why you must not "fix" them by running this script.
- `tasks/runs/20260728-172245-lane-c-eight-winds-wiring-hero.md` — the stopped run's own report.

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via `git log`/`git diff`), it is a SAFE DUPE → `git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make.

**The dupe is PRE-PROVEN for you by CONTENT — do not spend budget re-deriving it.** s1176 verified while draining: `lane/e2-arsenal` is 1 ahead at `e968b7f7` (`runner(lane-c): lane-c-eight-winds-wiring-hero.md`), a single commit adding exactly one file — `tasks/runs/20260728-172245-lane-c-eight-winds-wiring-hero.md` — and **that file was merged to main by the s1176 drain**, so its content is on main by construction. The lane holds zero `src/` and zero asset bytes. Textbook false-ahead SAFE DUPE → reset and proceed. Re-run the blob comparison (`git rev-parse lane/e2-arsenal:<f>` vs `git rev-parse main:<f>`) to confirm nothing changed since, then move on.

Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why

The EIGHT WINDS program binds 17 diagonal sprite sheets. Slice 1 (the hero) could not bind, because `anim-pass-reextract.mjs --verify-downscale` — the tool's own mandatory control — exits 1 on the hero sheet. **The control is arithmetically correct and the stop was correct.** The problem is its *reference set*.

`--verify-downscale` re-derives shipped cells from their `assets/processed-full/` masters and byte-compares, to prove this script's resize matches `optimize-assets.mjs`'s. Its comment says it checks *"untouched shipped cells"* — but **"untouched" is an assumption the code never checks and cannot check.** Two merged commits deliberately mended shipped cells *after* extraction without writing masters:

| commit | date | what | shipped cells changed | masters changed |
|---|---|---|---|---|
| `21dc8739` | 2026-07-13 | `fix-walk-cutout-pockets` | **80** | **0** |
| `04732223` | 2026-07-12 | `town-cast-metrology` | **3** | **0** |

Of those, the ones that have a paired master are exactly **26**, and they are the 26 the control fails on. Measured three independent ways by s1176 (git provenance; per-sheet pixel control; whole-tree pixel control), all agreeing exactly:

```
--verify-downscale char-hero-sheet-walk8   →  23 byte-identical,  9 mismatched (of 32)
--verify-downscale char-baron-sheet-walk8  →  15 byte-identical, 17 mismatched (of 32)
--verify-downscale  (whole tree)           → 389 byte-identical, 26 mismatched (of 415)
```

**Read the whole-tree line twice: 389 of 415 cells reproduce byte-identically. The resize is proven correct. All 26 failures are the contaminated reference set, and there is no third sheet — the class is closed.**

➡️ **Why this is on the critical path and not merely tidy:** the baron is one of the five non-hero `walk8` slots the next EIGHT-WINDS rung must bind, and it carries **17** contaminated cells — nearly double the hero's. Every future rung on either sheet, and every future animation mend, hits this same wall. Until the control can distinguish *"my resize is broken"* from *"this cell was deliberately mended"*, it blocks the ladder while telling you nothing.

⚠️ **A SECOND, SEPARATE HAZARD YOU MUST NOT TRY TO FIX HERE (F-1176-1).** Because those 26 masters do not carry the mends, a flagless global `node scripts/optimize-assets.mjs` would **silently revert** the cutout-pocket and metrology fixes on the hero and the baron — it reads the master and overwrites the shipped cell. s1176 verified this is **armed but not automatic**: that script has **no automated caller** (not in `package.json`, not in any script or CI). It is a manual step. **Do not run it. Do not pass `--refresh-full`. Do not rewrite any master.** Rewriting 26 cells of shipped-quality art is a data change that belongs to an attended session with the owner's eye on it, not to this slice — and scope 1 exists to give that session the measurement it would need.

## Scope

**1. MEASURE FIRST, AND REPORT — this scope changes no files.**
Establish, with evidence, whether the 26 mends are reproducible at master resolution. `21dc8739` tracked its own tools: `artifacts/fix-walk-cutout-pockets/pockets.mjs` and `artifacts/fix-walk-cutout-pockets/feather-and-qa.mjs` are in git. Read them. Report, in the run report:
   - Are their operations resolution-independent, or do they assume 256 px (fixed pixel radii, thresholds, kernel sizes)? Quote the lines that decide it.
   - Consequently: could applying them to the 512 px masters yield a downscale that is **byte-identical** to today's shipped cells? State YES / NO / UNKNOWN **and the reason**.
   - Do the same for `04732223`'s 2 metrology cells if it tracked a tool; if it did not, say so plainly.
   This is a written finding, not a code change. **A well-evidenced "NO" is a full success** — it is exactly what tells a later attended session that the exclusion route below is the right one permanently rather than provisionally.

**2. Give the control a provenance-aware reference set.**
Add a tracked manifest — suggested `assets/master-divergent.json` — listing each of the 26 cells with the commit that mended it and a one-line reason. Generate the list by *measurement* (run the control, take the mismatches; cross-check against `git log` provenance so every entry is justified), never by copying the numbers out of this task.
Teach `--verify-downscale` to consult it and report the three buckets separately, e.g.:
```
downscale replication: 389 byte-identical, 0 unexplained, 26 master-divergent by design (of 415 masters)
```
Exit **0** when `unexplained == 0`. **The control must keep all of its teeth:**
   - any mismatch **not** in the manifest is `unexplained` → still exits 1;
   - any manifest entry that now reproduces byte-identically is a **stale exclusion** → report it and exit 1 (an exclusion that silently outlives its cause is how a guard rots);
   - a manifest entry naming a file that does not exist → exit 1.

**3. Prove it with a mutation, aimed at the subject.**
Do not merely run the control and show green. Mutate the *subject* and show the control still bites:
   - perturb one byte of an **unlisted** shipped cell → control must report it `unexplained` and exit 1; restore it;
   - remove one entry from the manifest → that cell must return to `unexplained` and exit 1; restore it;
   - add a bogus manifest entry for a cell that reproduces cleanly → must be reported as a stale exclusion and exit 1; restore it.
   Paste the real output of each. Restore every byte and prove it (`git status --porcelain` empty for `assets/processed*`).

**4. Do NOT bind the hero sheet in this task.** That is slice 1's job and it gets re-queued once this lands. This task's success condition is that `--verify-downscale` becomes a control a runner can pass honestly — nothing more.

⚠️ **NOTE FOR THE FIRE THAT DRAINS THIS TASK — do not let a guard's wording cost you a good master.** When this lands, `tasks/lane-c-eight-winds-wiring-hero.md` should be **re-queued UNCHANGED** (its leaf flipped back to `queued`, its own `mergeHash` still unset). Its three scope-1 premises were all confirmed in the lane; only this blocker stopped it. Its leaf is currently `status:"stopped"`, so `drain-block-check --queue` will refuse it with *"This master's question is dead … author a SUCCESSOR; do not revive this leaf."* **That wording is wrong for this case** — the question was deferred behind this task, not overturned — and re-authoring slice 1 from scratch would waste a master that is already correct (see F-1176-4 in `reviews/eight-winds-wiring-hero.md`). Flip the leaf back and re-queue the existing file.

## Firewall

TOUCH-ONLY:
- `scripts/anim-pass-reextract.mjs` (the `--verify-downscale` block and its header comment only)
- `assets/master-divergent.json` (new)
- `tasks/runs/<stamp>-lane-c-eight-winds-master-convention.md` (your report)

NO — STOP and report rather than edit:
- **Any byte under `assets/processed/` or `assets/processed-full/`.** Zero pixels change in this task. The mutation controls in scope 3 are temporary and must be restored and proven restored.
- `scripts/optimize-assets.mjs` — do not run it, do not edit it, do not pass `--refresh-full`.
- The `resize`/`writePng` block at `anim-pass-reextract.mjs:54-100` — it is marked byte-faithful-verbatim and 389 cells prove it correct.
- All of `src/**`, `e2e/**`, `assets/layer-contracts/**`.
- `char.claim_jumper` and anything under `tasks/025` — owner-gated (F-1166-1).

## Self-check (name the evidence, both projects where applicable)

- `npx tsc --noEmit` clean; `npm run build` green.
- `node scripts/anim-pass-reextract.mjs --verify-downscale` (whole tree) → **exit 0**, `0 unexplained`, `26 master-divergent`.
- Same for `char-hero-sheet-walk8` and `char-baron-sheet-walk8` individually → exit 0.
- All three scope-3 mutations pasted with real output, each showing exit 1, each restored.
- `git status --porcelain assets/processed assets/processed-full` → **empty**.
- No `src/` and no `e2e/` bytes in `git diff --stat`.
- Scope 1's YES/NO/UNKNOWN answer written with quoted lines.

READY-FOR-GATES + report: scope 1's verdict and the lines that decided it; the three bucket counts; the three mutation outputs; and whether anything in the manifest surprised you.
