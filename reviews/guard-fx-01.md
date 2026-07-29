# guard-fx-01 — structural assertion proof (subject-tree fixture harness)

**Slice:** guard-fx-01-structural-assertion-proof · **Branch:** `lane/m3` · **Tip:** `1539b8f3` · **Merge-base:** `e88de542`
**Drained:** s1237, 2026-07-30 · **Verdict: ✅ MERGE — ACCEPTED.** The deliverable is real, the refactor is faithful, and I re-proved it myself rather than reading the report.

## What it does

Two guards independently grew the same shape — a directory walk plus two structural `assert.ok`s (a subject **exists**, and its file count meets a **floor**) — and neither had ever been observed to fail. Eleven assertions, zero of them read. This slice extracts that shape into one root-parameterized module, `scripts/lib/subject-tree.mjs`, rewires both guards onto it, and proves it with `scripts/subject-tree.test.mjs` driving **fixture trees built under `os.tmpdir()`** and torn down in a `finally` — never touching a tracked path. The RETENTION-LAW trap the master named (prove a floor by deleting a real file) was **not** taken.

The proof strategy is *proof-by-convergence*: the 11 assertions are not each individually mutated, they are all routed through one code path which is then mutated. That is the right design and it is what makes the module worth having — but it should be stated plainly, because "all 11 proved" and "the one path all 11 now use is proved" are different sentences. The second is the true one.

One verdict deliberately changed, per scope item 2: `worker-type-coverage.test.mjs` **gains** the `exists` assertion it never had. Previously a missing `functions/` threw a raw `ENOENT` from inside its walk and the floor assertion never ran — the operator got a stack trace instead of the sentence someone had written for exactly that moment.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** (3.7s) |
| `npm run build` | **rc=0** (14.3s) |
| `node scripts/run-guards.mjs` | **rc=0 — `guards: 8/8 passed`** (106.2s) |
| `npm run test:node-guards` | **rc=0** (15.6s), new guard registered and running |
| `scripts/subject-tree.test.mjs` | **4/4 pass**, 36.8ms |
| Player-visible bytes | **none** — 0 files under `src/ e2e/ assets/ public/` in the staged set; no boot probe owed (master says so explicitly) |

**Mutation proof — run by this drain, on the merged tree, not inherited from the report.** I mutated the *subject* (the module), never the test:

| Arm | Result |
|---|---|
| `>=` → `>` in `assertSubjectFloor` (the off-by-one the master called the likeliest real bug) | **RED** — *"subject exactly at its floor passes"* |
| `assertSubjectExists` call removed from `subjectFiles` | **RED** — *"missing subject directory fires the actionable existence message"* |
| `assertSubjectFloor` call removed from `subjectFiles` | **RED** — *"subject below its floor…"* **and** *"empty present subject fires the floor instead of passing silently"* |

All three restored **byte-identically** — `git hash-object` returns `93012a5c…` before and after, matching the lane blob.

**Real-tree walk on the merged main** (measured with the module itself):

| Subject | Walked | Floor | Margin |
|---|---|---|---|
| `scripts/**/*.mjs` | 178 | 120 | +58 |
| `scripts/**/*.sh` | 23 | 15 | +8 |
| `rehearsal/**/*.mjs` | 25 | 15 | +10 |
| `foundry/**/*.mjs` | 1 | 1 | **+0** |
| `foundry/**/*.sh` | 5 | 5 | **+0** |
| `functions/**/*.ts` | 22 | 22 | **+0** |

## Merge classification

Base `e88de542`; lane carried two commits, `e9d848a7` (ts-cov-01, **already on main** as tip-graft `d606946d`) and `1539b8f3` (this slice).

- **LANE-TOUCHED-ONLY** (plain checkout): `scripts/lib/subject-tree.mjs` (new), `scripts/subject-tree.test.mjs` (new), `scripts/script-tree-parse.test.mjs`.
- **Nominally both-moved, resolved to a clean checkout:** `scripts/worker-type-coverage.test.mjs`, `package.json`. s1236 flagged these as requiring a 3-way graft and said *"verify that, do not assume it."* Verified: main's current blob is **byte-identical to the lane's parent-commit blob** for both (`d0c96bfe…`, `5618b60f…`), because main's `d606946d` is the graft of the lane's own `e9d848a7`. No graft was needed. `package-lock.json` is unchanged at the tip — **no dependency added**, as reported.
- **MAIN-MOVED-ONLY (phantoms — took main, ignored the lane):** `scripts/run-guards.mjs` (lane commits **NONE**, main 1 = `d606946d`) and `scripts/site-contract.test.mjs` (lane **NONE**, main 1 = `f611c1ea`), plus `STATUS.md`, `tasks/BACKLOG.md`, `tasks/goals.json`, `reviews/ts-cov-01.md`, `logs/**`. `run-guards.mjs` was **NO-listed by name** and the two-dot diff shows it modified; per-file `git log <merge-base>..<side>` proves the lane never touched it. **The NO list was honoured.**

**Firewall audit:** both `SUBJECTS` tables are **byte-identical to the merge-base** — no floor weakened, no exclusion list added (both explicit NO items). Nothing under `src/ e2e/ functions/ tsconfig.json` touched.

**`run-guards.mjs` sentences (the master's explicit ask):** none falsified. Its claims that `worker-type-coverage.test.mjs` "fails if any of them ever falls back out" (:19), that `script-tree-parse.test.mjs` "holds the floor" (:30), and that the worker guard "walks `functions/` and asserts every file appears in `tsc --noEmit --listFiles`" (:95) are all still true — and the first is now *stronger*. Confirms the runner's own claim, independently.

## Findings

**F-1237-1 — the slice closes 11 unproven branches and opens 1 (non-blocking, class-continuation).**
`walkSubject`'s `ignoreReadErrors: true` path — the fail-open branch that preserves `script-tree-parse`'s legacy behaviour — **is not covered by any test**. Proven, not suspected: I replaced `if (!ignoreReadErrors) throw error;` with an unconditional `throw error;`, deleting the branch outright, and **both** `subject-tree.test.mjs` and `script-tree-parse.test.mjs` stayed **green** (exit 0). The fixture suite never passes the option, and the real `scripts/` tree contains no unreadable subtree to exercise it. This is exactly the F-1232-1 → F-1235-1 → guard-fx-01 class one layer further in: the harness built to prove structural branches introduced a structural branch of its own. Non-blocking — the branch faithfully preserves prior behaviour and the guard is strictly better than before — but the honest statement is **12 assertions proved, 1 new branch unproven**, not "residual discharged". A fixture case using a `chmod 000` subdirectory (removed in the same `finally`) would close it without touching a tracked file. Restored byte-identically after the probe.

**F-1237-2 — three floors sit at exactly zero margin (non-blocking, note-only).**
`foundry/**/*.mjs` (1/1), `foundry/**/*.sh` (5/5) and `functions/**/*.ts` (22/22) are exactly at their floors, so *any* legitimate deletion reddens them immediately — which is the intent. Worth recording because it makes the master's **"exactly at floor passes"** fixture case load-bearing for **half the real rows**: an off-by-one in `>=` would have false-redded three of six subjects on the next drain. That fixture case earned its place.

**F-1237-3 — the floor's denominator includes 15 gitignored files (non-blocking, bookkeeping).**
The report states `scripts/**/*.mjs` went 161→163; the module's own walk on merged main returns **178**. Both are correct and neither is a defect — the report counted **tracked** files (163 tracked, exact), while the guard walks the **disk**, which additionally holds **15 gitignored `_sNNN_*.mjs` fire-scratch scripts** (`_s202-lock.mjs`, `_s777_hero_lineup.mjs`, …). Recorded so a future fire tidying that scratch does not read the resulting 178→163 drop as a regression: the floor is 120 and holds either way.

**Not a finding — checked and withdrawn.** The `// ponytail:` comment in the new module reads like a garbled token. It is not: `ponytail:` is an established house convention for an acknowledged bounded assumption, present in 15+ files across `src/`, `functions/` and `scripts/` on main. I nearly "fixed" a convention. Left untouched.

## Residual

The proof is by convergence, not per-assertion. If either guard is ever given a bespoke walk again, the 11 revert to unproven — the module is the guarantee, so **keep both guards routed through it**.
