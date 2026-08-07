# f1515-1-citation-scan-nondestructive — drain review (s1516)

**Slice:** `lane-f1515-1-citation-scan-nondestructive` (F-1515-1 + F-1515-2, one task, same file)
**Branch:** `lane/a` · **Tip:** `df8347545` · **Base:** `fb40b2584` (main at drain time)
**Gated in:** detached worktree `gate-s1516` (§3.0b custody — undecided content never entered main)

## VERDICT: **MERGED**

Both cures land, both are proved by arms that I re-ran red against the old code rather than
inheriting, and the corpus movement is a strict improvement that I reproduced independently in a
different tree. This is attempt 2; attempt 1 correctly STOPPED on an unsatisfiable absolute bar
(F-1515-3) and the master was re-authored with a relative one.

## What it does

`matchingQuote()` keeps the loose scanner as a compatibility source, then enumerates **every**
same-kind opening/closing delimiter pair in the 400-char window **without consuming delimiters**,
returning the first span that resolves through `matchesATitle()`. That is the actual cure for
F-1515-1: the `790a66f5` union was a backstop that still lost to an odd count of same-kind quotes
before the title, because both arms shared a greedy global `lastIndex` walk.

`TITLE_DECL` is narrowed from `(?:\.\w+)*` — which harvested a title from **any** dotted helper — to
an allowlist of real modifiers (`skip`, `only`, `fixme`, `slow`, `fail`, `describe`, and the
`describe.skip|only|configure|serial|parallel` forms with their valid chained `.only`). That is
F-1515-2: `test.setBalance('e10Static.arrivalZ', 20)` is no longer parsed as a declaration.

Both production paths still go through the one helper (`citation-title-guard.mjs:218` title scan,
`:225` source-line fallback), which the master required and which I confirmed in the merged tree.

## Evidence (measured on the MERGED tree at Node 26.4.0, nothing inherited)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, no output |
| `npm run test:node-guards` | **rc=0 — 351 tests / 348 pass / 0 fail / 0 cancelled / 3 skipped** (206 s) |
| `citation-title-guard.test.mjs` focused | 18 / 18 pass |
| `--report` before (main `fb40b2584`) | `515 / 262 / 210 / 43` |
| `--report` after (merged) | `515 / 259 / 212 / 44` |
| `npm run build` + browser | **NOT OWED** — no `src/**` or browser run surface in the diff. Stated, not silently skipped. |
| [F-1460-1] sim-pin check | **CHECKED, not assumed** — diff touches no `src/sim`, `src/systems`, `src/entities` path |

**Scope 3's relative bar is met arithmetically:** `scanned 515 == B_scanned 515` ·
`CARRIES-TITLE 212 ≥ B_title 210` (**+2**) · `NUMBER-ONLY 259 ≤ B_number 262` (**−3**). Both tables
sum to 515 (262+210+43 and 259+212+44).

⚠️ **I took my OWN baseline rather than reusing the runner's, because this fire authored two commits
into `tasks/**` before the drain and F-1515-3 is precisely the hazard of a moved denominator.**
Main at `fb40b2584` measured `515 / 262 / 210 / 43` — **identical** to the runner's baseline taken at
`199e13c9e`. My commits added no *gated* citation because they cite `scripts/…` and
`playwright.config.ts:50`, not `e2e/*.spec.ts:NN`. That is a verified non-event, not an assumption.

## The prediction that mattered, and how the runner discriminated it

The master predicted **scope 2 moves NOTHING** (0 of 206 live `CARRIES-TITLE` rows were carried by a
polluted string) and ordered a STOP if a count moved. Counts **did** move — and the runner did the
right thing instead of the convenient thing: it re-ran with **only the modifier allowlist active and
the old union scanner restored**, and the report came back **byte-for-byte `515 / 262 / 210 / 43`**.

➡️ So scope 2's prediction is **confirmed**, and the entire movement is scope 1's non-destructive
scan recovering titles the greedy walk was losing. That is the improvement the task was for. Had the
runner reported only the combined delta, this drain could not have told a cure from a regression.

## Manufactured-defect arms — RE-PROVED, not inherited

A green never exercises a violation path (s1299/s1301 standard). I reverted **only** the guard to
main's blob inside the gate worktree and re-ran the focused file:

```
rc = 1
  ✖ an odd same-kind delimiter cannot consume the following quoted title (102.380583ms)
  ✖ a test helper string is not harvested as a title (97.705667ms)
  ℹ tests 18 · pass 16 · fail 2 · cancelled 0 · skipped 0
```

Restored **byte-identically** — guard sha256/16 `470662bff3655b3f` before and after, `git status
--porcelain scripts/` clean in the gate tree.

ⓘ **Stated honestly: the third new arm does NOT red against the old code, and should not.**
`describe.serial.only` / `describe.parallel.only` passed under the old permissive `(?:\.\w+)*`. That
arm is a **regression guard on the new allowlist's narrowness** — it exists because `codex review`
caught the first allowlist excluding two forms Playwright 1.61.1 genuinely supports. Calling it a
defect arm would over-claim; it is 1 of the 3 added tests (351 − 348 = 3).

## Merge classification

Base `fb40b2584`. Three files, **all LANE-TOUCHED, zero MAIN-MOVED** — main's only commits since the
lane branched (`0d0a55d20`, `fb40b2584`) touch `docs/bench/s1516-*`, `tasks/BACKLOG.md`,
`tasks/goals.json` and the new master, none of which the lane touches. `git merge --no-ff lane/a` in
the gate worktree returned **rc=0 with no conflicts**, and the resulting diff vs base is exactly the
lane's three files (+162/−8).

Firewall respected: `scripts/citation-title-baseline.json`, `package.json`, `e2e/**`, `src/**` and
`tasks/**` all untouched; no `--update-baseline` was run.

## Findings

**[F-1507-1] takes a FIFTH consecutive datum — non-blocking, and it is no longer a curiosity.**
The runner reported `rc=1` / 2 reds on its ambient Node **23.11.1** (the standing timeout-semantics
split), correctly named them as the runtime split rather than bending a test, and I discharged them
to **rc=0** on the `.nvmrc` pin (26.4.0). That is a supervisor rerun in each of the last **five**
drains. The fix remains one line in the owner's own `~/.zshrc` (`nvm use 23` → `nvm use`), which no
fire has touched or should touch. Already on the desk.

**No new blocking findings.** The slice does what the master asked, proves it the way the master
demanded, and the one place it could have quietly over-claimed (the corpus movement) is the place the
runner went out of its way to isolate.

## Residue

**F-1515-1's cure is now genuine rather than a backstop**, so the finding closes with this merge.
**F-1515-2 closes as LATENT-cured** — it was never live (0 of 206 rows), and the value delivered is
that the fail-open is no longer reachable by the 67 polluted strings that clear the 12-char floor.
