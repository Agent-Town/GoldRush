# f2168-1-e3-census-repin — drain review (s2169)

**Slice:** `f2168-1-e3-census-repin` (fire-authored s2168 from F-2167-1 / F-2168-1)
**Branch:** `lane/b` · **Tip:** `cdfbe3cc9c9feee50f7665781e3463105e71e88d`
**Base:** `main` at `3edbbaf14` (lane was ahead=1, behind=18)
**Merge:** `73872b6ac33232462dc396a95a80fff246d7ca85`
**Runner verdict:** STOPPED — not `READY-FOR-GATES` (6 passed / 2 failed), 93,992 tokens

## Verdict

**MERGED — PARTIAL, and the partiality is the finding.** The re-pin is correct and is
proven correct by a control the runner could not have run. It cures **2 of the 4**
`er01-e3-census` failures that have stood on clean main for 12 days. The **2 remaining
failures are NOT this slice's** and are NOT what F-2167-1 / F-2168-1 predicted: they are a
**separate, previously-invisible regression** (**F-2169-1**, below) that the stale assertion
had been masking.

## What it does

`8465f6b33` (ap16-1, buildable parity) gave every *admitted* contract the core buildables
registry set, which made `er01-e3-census`'s two `buildables` assertions unsatisfiable rather
than merely stale (F-2167-1's diagnosis, which I confirm). This slice re-pins them:
`e3-canyon-works` `:51` from `toBeUndefined()` to the 5-entry registry array (turret traded
away by `twist.powerGrid`), and `e3-blackout-ridge` `:190` from a lone `capacitor_bank` to
the same 5 plus `capacitor_bank`. **Test-file only — 1 file, +25/-9, assertions only.** No
`src/`, no sim behaviour, so the F-1460-1 `test:node-guards` trigger does not apply.

The runner reported the derived arrays matched the values s2168 banked in the master
**exactly**, i.e. the master's "if these differ, that is a NEW finding" tripwire did not fire.

## Evidence (merged tree, gated in a detached worktree per §3.0b)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, `✓ built in 1.12s` |
| `er01-e3-census` `--workers=1`, both projects | **6 passed / 2 failed (2.4m)** |
| Failures | `e3-canyon-works` desktop-chrome + mobile-chrome, both at `:171` |
| `test:node-guards` | **not required** — diff touches no `src/sim`, `src/systems`, `src/entities` |

**Before/after on main:** 4 failed / 4 passed → **2 failed / 6 passed.** `e3-blackout-ridge`
is now **fully green**; `e3-canyon-works` clears `:51` and now runs 120 lines further before
failing. My own re-run reproduced the runner's headline to the digit (the drain's free control).

## F-2169-1 — a second regression, hidden for 10 days behind the stale pin

**Symptom:** `Error: Outcome requested before the contract terminated.`
thrown from `HeadlessContractSim.outcome()` at `e2e/er01-e3-census.spec.ts:171`, reached via
`runCrawler()` after the test kills all three `dynamo_crawler` boss components
(`drain_mast`, `tracks`, `capacitor_bank`). **The canyon-works crawler contract no longer
terminates.** Both projects, deterministic.

**This is not the ap16-1 blast radius, and that is measured, not argued.** Three controls,
each run `--workers=1` in a detached worktree:

| Tree | Spec | canyon-works |
|---|---|---|
| `d6166b292` (immediately **pre**-ap16-1) | that tree's own (old pins) | **PASS** (15.4s) |
| `8465f6b33` (**ap16-1 itself**) | **the re-pinned spec, overlaid** | **PASS** (14.7s) |
| `main` + this merge | re-pinned | **FAIL** at `:171` |

The middle row is the decisive one: with the new assertions, the whole test — including
`:171` — passes **at ap16-1's own tree**. So ap16-1 explains the assertions and *nothing
else*. The termination break entered **after** `8465f6b33` (2026-08-10T19:08).

**Attributed by bisect to `d599cd3ea` — "fix: AP-16-6C — truthful terminal receipts"
(2026-08-12T09:25:55+07).** Bisect oracle = the re-pinned spec overlaid on each tree, so the
assertion staleness is held constant and only sim behaviour varies. Nearest good:
`58afad35d` (f1662-2). The commit rewrites `src/sim/HeadlessContractSim.ts` (+211 lines) —
the exact file that throws — and its headline is a change to *when a contract counts as
terminated*. The name and the symptom agree.

⚠️ **SCOPE OF THE ATTRIBUTION, stated honestly:** the bisect sampled the **61 first-parent
commits touching `src/sim` / `src/systems` / `src/entities` / `assets/contracts`** out of
1904 in the window — not all 1904, and not second parents. `d599cd3ea` is a **merge commit**
(`git show -- <path>` prints nothing for it; use `git diff d599cd3ea^ d599cd3ea`), so the
true first-bad may be one of its own children. **I did NOT isolate the line-level mechanism
— `UNVERIFIED`.** What is verified is: pre-ap16-1 PASS, at-ap16-1 PASS, today FAIL, and the
first sampled bad commit rewrites the throwing file.

**Owner/attended call, not a fire's:** "truthful terminal receipts" was a deliberate
tightening of termination semantics. Whether canyon-works's crawler *should* terminate here
is a design question — the test may be asserting an outcome the new receipts law no longer
grants, or the crawler may genuinely be failing to terminate in play. **Do not re-pin `:171`
to make it green.** That is the F-1441-3 prohibition, and re-pinning is exactly what would
bury a real gameplay break a second time.

## The reusable lesson (recurrence, not a new shape)

My memory's law — *an assertion behind a failing one is UNEXECUTED code, not passing code* —
cost 12 days here, twice over. F-2167-1 read the four e3 failures as one cause and wrote that
the `AP-07 supports only` throws "still PASS"; s2168 correctly refuted that half. **Neither
fire could see that the same masking was hiding a *behavioural* regression 120 lines deeper**,
because nothing executes behind the first failing `expect`. A red suite's failure count is a
**floor on the number of defects, never the count.** When a re-pin cures an assertion, the
correct expectation is *more* failures to appear, not fewer — and each one is a fresh subject.

## Merge classification

Base `3edbbaf14`; one file, `e2e/er01-e3-census.spec.ts`, **LANE-TOUCHED only** — main has not
moved it since the lane's base (`lane-freeze-classify`: 1 path, LANE-ONLY, 15 of 25 added
lines absent from main). Clean `ort` merge, no conflicts, nothing hand-resolved.

## Findings

- **F-2169-1** — canyon-works crawler contract does not terminate; `sim.outcome()` throws.
  Attributed to `d599cd3ea` (AP-16-6C truthful terminal receipts). **Attended-owed** (design
  question about termination semantics), files with F-2165-1 / F-2168-1 as the same sitting.
  NOT fire-authorable: curing it means either changing termination semantics or ruling the
  test wrong, and both are design forks.
- **F-2168-1 status:** its fork-independent half is **discharged** by this merge. The
  manifest-admission question it raised (`src/agent/MechanicsManifest.ts`, firewalled from the
  runner) remains attended-owed and untouched.
