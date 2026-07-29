# guard-fx-02 — the fail-open branch proof (F-1237-1 closed)

**Slice:** guard-fx-02-fail-open-branch-proof · **Branch:** `lane/m3` · **Tip:** `4b1638a6` · **Merge-base:** `81208e21`
**Authored AND drained:** s1238, 2026-07-30 · **Verdict: ✅ MERGE — ACCEPTED.**
**Disclosure: I authored this master earlier in the same fire.** So the gate was run with that bias in mind: every claim in the runner's report was re-derived by command on the merged tree, and the one thing I did *not* re-derive on the first attempt turned out to be wrong — see §Instrument failure. The report survived independent checking; my own first checking tool did not.

## What it does

`guard-fx-01` (`ac12332c`) extracted both tree-walking guards onto `scripts/lib/subject-tree.mjs` and proved 11 structural assertions by routing them through one mutated path. Its own drain then found F-1237-1: the module's `ignoreReadErrors` fail-open branch — the thing preserving `script-tree-parse`'s legacy unreadable-subtree verdict — was covered by **nothing**. This slice adds three fixture cases to `scripts/subject-tree.test.mjs`, taking it from **4 → 7**, using a `chmod 0o000` subdirectory built under `os.tmpdir()`. **The module itself is unchanged** (hash `93012a5c…` on main before and after) — the gap was in what tested it, and the master forbade "fixing" a branch that was already correct.

The three cases are the two arms of the branch plus the interaction nobody had written down: **the fail-open path silently lowers the file count, so the floor is its only backstop.**

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** (3.6s) |
| `npm run build` | **rc=0** (14.9s) |
| `scripts/subject-tree.test.mjs` | **rc=0 — 7 passing, 0 failing, 0 skipped** (TAP-verified case names, all 7 listed) |
| `scripts/script-tree-parse.test.mjs` (adjacent, the only caller passing the option) | **rc=0** (1.1s) |
| `scripts/worker-type-coverage.test.mjs` (adjacent) | **rc=0** (4.1s) |
| `scripts/run-guards.test.mjs` (adjacent) | **rc=0** (4.7s) |
| `npm run test:node-guards` | **rc=0** (17.8s) |
| `node scripts/run-guards.mjs` | **rc=0 — `guards: 8/8 passed`** (107.2s) |
| Player-visible bytes | **none** — 0 files under `src/ e2e/ assets/ public/`; no boot probe owed and none fabricated |

**Mutation table — re-run by this drain on the merged tree, subject mutated, never the test.** Each red is identified by the failing case **NAME** (TAP reporter), not by rc:

| Arm | rc | RED case(s) | Predicted case reddened |
|---|---|---|---|
| **Control** (unmutated) | 0 | none — **7/7 green** | — |
| **A.** fail-open deleted (`throw error;` unconditional) | 1 | *ignoreReadErrors returns only readable paths* **+** *floor catches files hidden by an ignored read error* | **YES** |
| **B.** fail-closed deleted (`if (false) throw error;`) | 1 | *default walk fails closed on an unreadable subtree* — **and nothing else** | **YES (exactly specific)** |
| **C.** floor call removed | 1 | *floor catches files hidden by an ignored read error* **+** the two pre-existing floor cases | **YES** |

Module restored **byte-identically after every arm** — `git hash-object` = `93012a5ca8bb2bc9329afc7a96913c7216c7edab` three times, `git status --porcelain` clean.

**Two refinements on the report's own table, neither a defect.** (1) The report listed **one** red per arm; measured by case name, arms A and C redden **two** and **three** cases. Its reasons were right, its blast radius understated — and the extra reds are correct behaviour (arm A breaks both cases that pass the option; arm C breaks every floor assertion). (2) Arm B is the **cleanest** proof in the ladder: exactly one case, exactly the predicted one. That is the arm the *finding never asked for* — F-1237-1 named only the fail-open half, and the fail-closed default was equally unproven, as the master's premise 2 predicted and this confirms.

**Scope-4 teardown duty, measured not asserted:** `gold-rush-subject-tree-*` leftovers under `os.tmpdir()` after two consecutive runs = **0**. The harness restores the `0o000` mode inside a nested `finally` **before** `rmSync`, so a failed assertion still leaves no debris — and the runner made that restore itself exception-safe, which is stricter than the master required.

**Skip discipline:** the EACCES premise held on this machine, so no case skipped (**0 skipped**, TAP-confirmed). The harness's `t.skip` path carries a written reason rather than skipping silently, as the master demanded — it is present but unexercised, which is honest.

## Merge classification

Base `81208e21` (this fire's own authoring commit); lane carried **exactly one** commit, `4b1638a6`. The SAFE-DUPE pre-flight worked as written: the runner reset `lane/m3` onto fresh main, so the stale-base phantoms that made the branch read "+2" before are **gone** — `main..lane/m3` is now one real commit.

- **LANE-TOUCHED-ONLY (plain checkout):** `scripts/subject-tree.test.mjs` (+58/−2). **This is the entire diff — one file.**
- **Firewall audit:** `scripts/lib/subject-tree.mjs` is **absent from the diff** and its blob on main is unchanged (`93012a5c…`) — the master required the module be untouched in the final commit, and it is. `scripts/script-tree-parse.test.mjs`, `scripts/worker-type-coverage.test.mjs`, `scripts/run-guards.mjs`, `package.json`: **all untouched** (the last two were explicit NO items; `subject-tree.test.mjs` was already registered in `test:node-guards`, so no `package.json` edit was needed — and none was made).
- **`run-guards.mjs` sentences:** none falsified; the runner reported the same and I confirmed it independently. The NO list was honoured.

## Findings

**F-1238-2 — `site-contract.test.mjs` leaks one temp directory per run, and it has leaked 132 (non-blocking, NOT this slice's fault, discovered by this slice's teardown check).**
Counting `os.tmpdir()` for the scope-4 duty turned up **148** `gold-rush-*`/`gr-*` directories, of which **0** belong to this harness. The population is **71 × `gr-site-parse-*` + 61 × `gr-site-inline-*` = 132**, accumulating since **2026-07-09** (oldest: `gr-kv-probe-*`), newest stamped **2026-07-29T20:20**. The battery run for this very drain added **+4** — two per `site-contract` execution, and it runs twice (once under `test:node-guards`, once under `run-guards.mjs`). So the leak is **live and per-run**, not historical residue. The contrast is the useful part: this slice's fixture harness tears down in a `finally` and leaves **zero**, while a sibling guard in the same battery leaks two per invocation. Not a merge blocker — temp debris is bounded by the OS — but it is a real hygiene defect in a *guard*, and the RETENTION LAW's concern is the opposite direction (nothing of value is being lost here). **Fire-authorable corrective, not owner-gated.** The 132 existing directories are harmless and were **left in place** — I did not sweep them, because deleting things is not this fire's business and they are the evidence.

**F-1238-3 — my own first verification instrument produced a false negative, and the arms were fine (recorded because the lesson is the ladder's own).**
My first mutation re-run parsed `not ok \d+ - (.+)` out of `node --test`'s output to name the failing cases. That pattern is TAP; `node --test` defaults to the **spec** reporter, which never emits it. So all three arms reported *"failed cases: NONE (arm did not redden!)"* while simultaneously reporting **rc=1** — a self-contradicting result that would have read as "the runner's tests don't actually fail" if I had trusted the parsed field over the exit code. Re-run with `--test-reporter=tap`, every arm named its predicted case. **This is the fourth consecutive rung of the F-1232-1 class, and this time the unexercised branch was in my own instrument** — the master's bar ("identify every red by its message TEXT, never by rc alone") is exactly what caught it, because a rc-only reading would have passed the arm and a name-only reading would have failed it, and the disagreement is what forced a second look. No action owed; the fixed instrument is retained at `logs/session-scratch/s1238-mutation-rerun-tap.mjs`, and the broken first attempt is retained beside it as the control.

## Residual

F-1237-1 is **discharged**: the tally that stood at *12 proved / 1 branch unproven* is now **15 proved / 0 unproven** for this module — 12 prior, plus both arms of the read-error branch, plus the floor-backstop interaction. The convergence caveat from `guard-fx-01` **still stands and is now more load-bearing, not less**: these proofs cover the module, so if either guard is ever given a bespoke walk again, all of it reverts to unproven. **Keep both guards routed through `scripts/lib/subject-tree.mjs`.**
