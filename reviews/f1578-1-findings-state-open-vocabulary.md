# F-1578-1 findings-state open vocabulary

**Slice:** `f1578-1-findings-state-open-vocabulary`  
**Branch/base:** `lane/b` at `7f465889cebf9bbfaefb5b6b1b17ab78cf2a9804`  
**Verdict:** READY FOR GATES — narrow remains the gate; wide-open visibility is advisory. One pre-existing, out-of-firewall law-pointer red is attributed below.

## What changed

`scan()` now accepts `openVocabulary: 'narrow' | 'wide'`, defaulting to the historical narrow behavior. Wide admits only explicit `OPEN` declarations led by 🟠, 🔬, 🔴, 🟢, or 🟣. Marker-only 🟢 RULING rows and 🔺 desk rows remain excluded. The CLI still gates on narrow and always prints:

```text
wide-open advisory : 161 skipped marker-led rows; 4 F-IDs open only there; 0 narrow closed-only
```

The advisory includes ⛔ among marker-led rows skipped by narrow, but does not admit it to the wide-open census. The raw non-desk marker count is 165; four struck closure rows are already admitted by narrow, leaving 161 actually skipped.

## Live censuses

Narrow, verbatim:

```text
declared subjects : 412
declared closed   : 261
declared open     : 151
double-state      : 0
```

Wide, verbatim after retiring the stale F-1563-3 word:

```text
declared subjects : 416
declared closed   : 261
declared open     : 155
double-state      : 0
```

Wide-only open delta:

- `F-1577-3` — BACKLOG line 3
- `F-1572-1` — BACKLOG line 17
- `F-1147-1` — BACKLOG line 1477
- `F-1093-1` — BACKLOG line 2790

Before the permitted ledger retirement, wide was `416 / 261 / 156 / 1`; the conflict was `F-1563-3`, closed at line 22 and separately open at line 28.

## Retention-law measurement

Using the guard's exported `scan()` and `FINDING`, closed F-IDs with an original folded mid-line were **3**: `F-1563-1` (line 7), `F-1575-1` (line 9), and `F-1576-1` (line 11). Closed F-IDs with a separate leading-marker `OPEN` row were **1**: `F-1563-3` (line 28). It was the sole anomaly, so only that row's subject state word changed from `OPEN` to `RETIRED`; all prose remains.

After the edit the measurement is folded **3**, separate-open **0**.

## Manufactured failures

### Wide admission red

Removed only 🟠 from `WIDE_OPEN_MARKERS` and ran the dedicated arm. Result: rc=1, 0 pass / 1 fail.

```text
✖ wide open vocabulary admits an explicit 🟠 OPEN declaration
AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
+ actual - expected

+ undefined
- [
-   1
- ]
actual: undefined
expected: [ 1 ]
```

Restored the marker. SHA-256 returned to `85f3a50467a93f865b89190a08139d9c45ba964512e11c602bcadf48ea80f84e`; the arm then passed 1/1.

### Emoji-class probe failure

```text
without u: false matches: null
with u   : true matches: [ '🟠 ', index: 0, input: '🟠 row', groups: undefined ]
```

The failing expression was `/^[🟠🔬🔴🟢🟣] /`; adding `u` restores the code-point match.

### Finding-ID probe failure

```text
[A-Z]{2,6}: null
guard FINDING: [ 'F-1563-3' ]
```

The broad-looking `[A-Z]{2,6}-[0-9]+-[0-9]+` excludes the single-letter `F-` prefix. The restored probe uses the exported `FINDING` unchanged.

## Evidence

| Check | Result |
|---|---|
| Baseline `npm run build` | PASS; Vite 1.26 s |
| Focused test after implementation | 7 tests / 7 pass / 0 fail |
| Live CLI after ledger retirement | rc=0; narrow PASS; advisory `161 / 4 / 0` |
| `npx tsc --noEmit` | PASS, rc=0 |
| Final `npm run build` | PASS; Vite 1.45 s; asset-diet 1,158,214 / 1,500,000 B |
| `node --test scripts/findings-state-guard.test.mjs` | 7 tests / 7 pass / 0 fail / 0 skip |
| `npm run test:ledger-guards` | Node phase 138 / 137 pass / 1 fail; all 12 chained leaves then run directly and passed/skipped as designed |
| `npm run test:node-guards` under pinned Node 26.4.0, alone | 410 tests / 408 pass / 2 fail / 0 skip; both failures are the same law-pointer baseline red |
| `node --test scripts/node-guards-timeout.test.mjs` under Node 26.4.0 | 2 tests / 2 pass / 0 fail / 0 skip |

No Playwright is owed or claimed: no `src/**`, `e2e/**`, simulation, system, or entity file changed.

### Ledger/node battery attribution

`law-pointer-guard` reddened in both batteries:

```text
NEW POINTER   .claude/skills/author-task/SKILL.md -> playwright.config.ts:46 -> playwright.config.ts:46
    now: "testDir: './e2e',"
```

`test:ledger-guards` was 138 tests / 137 pass / 1 fail before its `&&` chain stopped. I then ran every chained leaf named by the script: findings-state, blocker-panel, ruling-propagation, citations, desk-declaration, desk-birth, status-archive-audit, attended-owed-audit, main-lock-gate, janitor-request-rejection, lane-dispatch-safety, and nul-audit. All passed; the two desk leaves correctly skipped because STATUS line 1 was an ACTIVE lock.

The first ambient-Node-23 node battery was 410 / 407 pass / 3 fail / 0 skip; its third failure explicitly diagnosed file-level timeout semantics and named `.nvmrc`'s Node 26.4.0 as the cure. The full pinned rerun removed that failure. Its remaining two failures are `law-pointer-guard` directly and `fixture-teardown` reporting that same child failure.

**Re-based in this lane:** nothing. The cited `.claude/skills/**` law surface and the law-pointer baseline are outside this task's TOUCH-ONLY firewall, and this slice did not move `playwright.config.ts`. During this run the orchestrator independently landed the verified rebase on `origin/main` at `a8d7b4e19`; this lane deliberately did not rewrite its history around a moving main.

## Adjacent finding, deliberately not fixed

The task's quoted narrow baseline (`411 / 261 / 150 / 0`) does not survive its own authoring commit: the new 🟡 F-1578-1 row makes current main `412 / 261 / 151 / 0`. This is a self-shift in the task evidence, not a second parser defect; no out-of-scope ledger or task text was changed for it.

`scripts/blocker-panel-closed-guard.mjs`, the closed vocabulary/default, `SUBJECT_CHARS`, `BULLET_CLOSED`, and the `FINDING` pattern are unchanged. Only `FINDING`'s existing constant was exported for mandated probe reuse.

## Independent review

`codex review --uncommitted` found that the first advisory counted all 165 non-desk marker rows as skipped even though narrow already admits four struck closures. Confirmed by executing `scan()` per row, then fixed by sharing `rowState()` between the census and advisory; final wording is 161 skipped. The reviewer also found the orchestrator's concurrent `a8d7b4e19` law-pointer rebase on `origin/main`. No other actionable code finding was produced before the reviewer recursively invoked its own review workflow; those spawned read-only reviewers were stopped.

---

## DRAIN GATE — s1579

**VERDICT: MERGED** at `5524fed8f51f84acde63901c11bf57b6fc22880f`. Base clean main `d5d0e7b57`; gated in a detached scratch worktree (`worktrees/gate2-s1579`, §3.0b custody).

`drain-block-check`: **CLEAR** — leaf `f1578-1-findings-state-open-vocabulary` matched with `status="queued"`.

### Merge classification

Merge-base `7f465889c`. Lane touched **4** files; main moved **48** since that base (this fire's own f1577-3 drain plus its ledger rows). **`tasks/BACKLOG.md` is genuinely BOTH-MOVED** — the lane retired one state word in the 🟠 F-1563-3 row while this fire prepended F-1579-1 at line 1 and closed F-1577-3. The regions are disjoint, `git merge --no-ff` auto-merged cleanly (`tasks/BACKLOG.md | 2 +-`), and **both sides were verified present after the merge**: F-1579-1 still at line 1, the retirement still at line 30, the F-1577-3 closure still at line 5. The other three lane paths are LANE-TOUCHED with no main-side counterpart.

### Gate battery (merged tree)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0, no output |
| `npm run build` | green, Vite `981ms`; Herald `1158214 / 1500000` |
| `node --test scripts/findings-state-guard.test.mjs` | **7 tests / 7 pass / 0 fail**, including the byte-identical narrow regression arm and the 🟢-RULING-without-a-state-word exclusion |
| `test:ledger-guards` node leg | **138 tests / 138 pass / 0 fail** |
| all 12 chained leaves | **green** (findings-state · blocker-panel · ruling-propagation · citations · desk-declaration · desk-birth · status-archive-audit · attended-owed-audit · main-lock-gate · janitor-rejection · lane-dispatch-safety · nul-audit) |
| live CLI `node scripts/findings-state-guard.mjs` | rc=0 **PASS** — `414 / 262 / 152 / 0`, advisory `160 skipped; 3 open-only; 0 narrow closed-only` |
| Playwright | **not owed** — no `src/**`, `e2e/**`, `src/sim/`, `src/systems/`, `src/entities/` in the diff, confirmed by `git diff --name-only` |

The live numbers differ from the report's (`412 / 261 / 151`, advisory `161 / 4 / 0`) **because this same fire moved the ledger between the runner's measurement and the gate**: F-1579-1 added an open subject, and closing F-1577-3 moved it out of the wide-only set (4 → 3) and into narrow-closed. The advisory tracked both edits correctly, which is a live demonstration that it reads the ledger rather than a cached census.

### The safety property was PROVED, not assumed

The master's binding constraint was that the wide reading **must not be able to red the board**. A passing guard never executes its violation path, so its green is not evidence about the red (the s1299/s1300 standard). Both halves were done:

- ✓ **Read**: `conflicts` derives from the **narrow** scan alone (`scripts/findings-state-guard.mjs:150`) and `process.exit(1)` keys on `conflicts` (`:153`); the wide scan feeds `printOpenAdvisory` (`:151`), a pure print. In `rowState` (`:73`) the wide-open term is OR'd into the open determination and gated behind `wideOpen`, so it is inert by default and can only ever **add** opens — the fail-safe direction the finding demanded.
- ✓ **Manufactured, by file edit rather than a shell-quoted probe**: a fake 🟠 row declaring the now-closed **F-1577-3** `OPEN` was injected into the live ledger in the scratch worktree. **The advisory detected it** — `161 skipped / 4 hidden / 1 narrow closed-only`, each exactly **+1** — **and the exit code stayed `0`**. Reverted byte-identical; post-revert rc=0.

That is the property in both directions: the wide axis **sees** a conflict narrow cannot, and **still cannot gate**.

### The ledger retirement was audited, not waved through

The slice changed one word of a ledger row it did not author, which is the kind of edit that can quietly launder a live defect, so it was checked rather than accepted:

- **Exactly one word moved**: the 🟠 F-1563-3 row grew by **+3 characters** (`OPEN` → `RETIRED`), first difference at char 33, and **everything after the word is byte-identical**. All prose retained, per the Retention Law's "retire, don't delete".
- **The retirement is substantively correct**: F-1563-3 has **two** rows, and the other one — its own ✅ row — records **`CLOSED s1565 — MEASURED AND MERGED at fcc53a1a3`** (24 observations, 0 breaches of `0.4`, 0 censored, max `0.3722002149381437`). The 🟠 row is the superseded duplicate that was never updated, and live tracking of the underlying drift concern moved long ago to F-1572-1 / F-1575-1 / F-1577-3 / now F-1579-1. **Honest bookkeeping.**

### Attribution of the runner's reported red

The runner reported `law-pointer-guard` red in both of its batteries and correctly declined to re-base around a moving main. ✓ **Confirmed at the gate to be LANE-STALENESS, not a defect in this slice**: the lane's base `7f465889c` predates s1578's `a8d7b4e19` re-base of that pointer, and the guard is **green on the merged tree**. Nothing was owed and nothing was re-based for it.

### Findings

**None blocking, and no new finding filed.** The runner's own adjacent note is **upheld and worth naming**: the master's quoted narrow baseline `411 / 261 / 150 / 0` did not survive its own authoring commit, because the new 🟡 F-1578-1 row made main `412 / 261 / 151 / 0` before the runner ever started. That is a **corpus-count gate rotted by the very commit that states it** — the F-1300-4 family, and a standing hazard when a master quotes a whole-ledger census as its expected value.
