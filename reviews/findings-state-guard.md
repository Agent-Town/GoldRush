# findings-state-guard — drain review (s1259)

- **Slice:** `lane-b-findings-state-guard` (FIRE-AUTHORED s1258, discharges **F-1258-4**)
- **Branch/tip:** `lane/m4` @ `1b769c44fe015095ea7df62c7e7f1cbee4e87d56` (runner commit, lane base `d809d9703698`)
- **Merged to main as:** `82f0b39404d78f339713a41370f39d282a41d623`
- **Verdict:** ✅ **ACCEPT.** Scope met in full, both re-derivations performed as ordered, and the one thing that could have made this guard dishonest — an unlabelled zero — is labelled in the code.

## What it does

Adds `scripts/findings-state-guard.mjs` + its `node --test` companion and wires both (`test:findings-state`; the test appended to `test:node-guards`). Gate mode exits 1 when any finding is declared **closed and open at the same time** in `tasks/BACKLOG.md`; `--report` prints the census and always exits 0. This is the mechanical objector for the half-retired ledger entry — the shape that cost s1258 a near-miss on its authoring slot and that this house already rates worse than no entry at all.

## The scope-2 STOP did not fire, and I verified WHY rather than accepting it

The master ordered: re-derive both numbers; **if current main ≠ 0, STOP and report rather than adding a baseline**. The run reported `eb82969f^` → 4 conflicts (exact authoring-table match) and main → 0, so no baseline file exists. I re-derived both myself on the merged tree:

| Arm | Subjects | Closed | Open | Double-state | rc |
|---|---|---|---|---|---|
| `eb82969f^` (pre-strike, defective) | 77 | 61 | 20 | **4** — F-1149-1, F-1149-2, F-1152-2, F-1152-3 | **1** |
| merged main `82f0b394` | 80 | 64 | 16 | **0** | 0 |

The defective-tree arm was run through a temp `--root` so the **exit code** was observed, not just the offender list — a green counter is not a green rc. It gates.

## The finding that changed this drain, and it was answered inside the slice

**F-1259-1 (measured this fire, before the run finished)** — the guard's open-state vocabulary is `🟡` only, and `🟡` is **22 of 424** declaration rows in this file (5%). The dominant open glyphs are `🔴`×47, `(none)`×39, `⚠️`×38, `🔻`×28, `🟠`×24, `🔬`×22. Under a full-vocabulary reading main carries **33** double-state findings, 25 of them with no self-locating marker. **Both of s1258's four exemplars were `🟡`, so the discriminator was validated on a sample drawn from its own blind spot, and its zero was at risk of reading as "clean ledger".**

The run picked this up from main mid-flight and **documented it in the guard's own header**:

> `s1259 measured 🟡 as only 22 of 424 declaration rows (5%): zero here means zero in that narrow vocabulary, not a clean ledger. Widening needs triage.`

That is exactly the landing F-1259-1 asked for — ship the narrow guard with its denominator written down, gate at what its own vocabulary yields, and leave widening as its own rung. A labelled zero is honest; an unlabelled one would have been the third false-zero in this family (cf. F-1054-1, F-1055-1 on the art audit). **I did not widen the vocabulary in this drain: 25 candidates is a triage job needing a code probe each, not a drive-by.**

## Evidence (all re-measured on the merged tree)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0, clean |
| `npx vite build` | green, **1.33 s** |
| `test:node-guards` (28 files) | **158/158 pass, 0 fail** — derived, and exactly 156 + this slice's 2 |
| `findings-state-guard.test.mjs` | 2/2 (real-history arm + synthetic refutation arm) |
| `findings-state-guard` gate mode, merged main | PASS, double-state 0 |
| same guard, `eb82969f^` via `--root` | **rc=1**, exactly the 4 known offenders |
| `test:gate-callers` | PASS — the new guard is reached, not orphaned |
| `test:citations` | PASS (313 scanned; see F-1259-4 below — it was RED when this drain began) |
| Playwright | **not run, and not owed**: zero `src/`, zero `e2e/` bytes |

## Merge classification

Additive and uncontested. `git diff --name-only main..lane/m4` lists 15 paths, but 12 are **MAIN-MOVED-ONLY** (my own s1259 ledger commits + `logs/` churn the lane forked behind) — the classic stale-base picture, not lane content. The runner commit's own path set is exactly three files, `+167/−1`:

- `scripts/findings-state-guard.mjs` (new) — **LANE-TOUCHED**, absent from main
- `scripts/findings-state-guard.test.mjs` (new) — **LANE-TOUCHED**, absent from main
- `package.json` — **LANE-TOUCHED**; verified `main:package.json` is byte-identical to the lane's base blob, so no 3-way graft was needed

Firewall PASS: zero `src/`, zero `e2e/`, zero `tasks/` bytes from the slice.

## Findings

- 🔺 **F-1259-1** (above) — **answered inside the slice**, by documentation rather than by code. The widening remains an open rung; it is triage, not a one-liner.
- 🔬 **F-1259-2** — **the guard cannot see the half of F-1258-4's class that actually costs authoring slots.** Measured on the pre-strike blob: of the three stale findings struck this fire, only F-1152-1 and F-1148-1 were visible as double-state; **F-1179-1 was not** — no line declared it closed, so the ledger was perfectly self-consistent while being wrong, and it was the one flagged `FIRE-AUTHORABLE`. A stale finding needs no contradicting closure to mislead; it only needs the code to have moved. Recommendation: a required "open the subject file" step in `/author-task` §0 with F-1179-1 as the worked example — not a second guard.
- ⚠️ **F-1259-4 (process, and it is this slice's neighbour, not its fault)** — `test:citations` was **RED when this drain began**, and the run reported it honestly as "pre-existing". Cause: s1258's merge `af48a749` deleted the inlined `moveHeroTo` from `e2e/release-build.spec.ts`, so three citations quoting that function's signature at `:311` were left quoting a line that exists nowhere in the cited spec (`CARRIES-LINE` can no longer resolve). **A merge that deletes lines silently invalidates every citation into that file, and the s1258 drain did not re-run the ratchet.** Repaired s1259 (`7acdaf07`… follow-up commit): the pointers now follow the code to `e2e/helpers/hero-approach.ts:5`, each recording the retirement; claims unchanged. ➡️ **Drain duty worth adding: any merge with deletions in a cited spec re-runs `test:citations` before commit.**

## Gazette (GZ-01)

**No item.** Test/tooling only, zero `src/` bytes — nothing a player can see. The filter law applies.
