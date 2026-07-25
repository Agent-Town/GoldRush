# deploy-site-contract-guard — review

**Slice:** F-1059-1 corrective — `scripts/test-deploy-site-contract.sh` (NEW) + `package.json` wiring
**Branch/tip:** main, direct §2D standing correction (no lane, no runner, FIRE-AUTHORED s1059, 2026-07-26)
**Verdict:** ✅ **FIXED + PROVEN BY MUTATION CONTROL** — the cure s1057 proved once by hand is now a
standing guard, and the guard is shown to fail on the diseased script rather than merely pass on the
healthy one.

## Why this exists

s1057 closed the F-1049-1 false-green class in `scripts/deploy-site.sh` and recorded the class as
**"verifiably closed: exactly two scripts in this repo invoke `wrangler …deploy`, and both are cured."**
That statement is true, and I re-verified it. This fire tested the *next* question, the one the
sentence does not answer: **the class is cured in 2 of 2 scripts, but who is watching it stay cured?**

Two defects, both verified by reading the files:

| # | Defect | Evidence |
|---|---|---|
| 1 | `scripts/test-deploy-contract.sh` copies and runs **`deploy.sh` alone** (`:7` `cp "$ROOT/scripts/deploy.sh"`, `:71` runs that copy). `deploy-site.sh` — cured s1057 — had **zero** automated coverage. | read both files |
| 2 | `test-deploy-contract.sh` has **no executable caller anywhere**: absent from `package.json`, absent from every `.sh`/`.mjs`/CI file. Its only repo references are a `tasks/goals.json` ledger leaf and a scratch probe `logs/_s1053_goal.mjs`. | `grep -rln` over `*.json`/`*.sh`/`*.yml`/`*.mjs` |

Defect 2 is the more serious of the two, and it is not hypothetical — it is a **repeat of a named
family**. `tasks/goals.json:1871` records F-1052-1 in these words: the contract test *"has been RED
since 00f5d464 added publishedBuild… two consecutive deploy correctives shipped without their own
contract test ever being run: the same unrun-guard family as F-1049-1 / F-1047-1 / F-1044-1."* A guard
nothing invokes rots silently, and this one already had.

This is also the mechanism by which the original bug survived: `deploy.sh` was cured across s1049 →
s1050 → s1053 while its sibling stayed diseased for **eight fires**, because nothing exercised the
sibling. A cure nothing watches has a clock on it.

## What landed

1. **`scripts/test-deploy-site-contract.sh`** (new, 7 cases). Asserts on **log content, never exit
   codes** — `deploy-site.sh` deliberately exits 0 on every path so it can never block a fire, so its
   exit status carries no honesty signal. wrangler is stubbed onto `PATH`; **no upload is possible.**
   The invariant under test, in one line: *this script may only say `DEPLOYED ok` about a URL that
   THIS run's wrangler invocation printed.*
2. **`package.json`**: `test:deploy-contract` and `test:deploy-site-contract` — both guards now have
   a caller, closing defect 2 for the pre-existing test as well as the new one.

The suite takes an **optional script-under-test path**, which is what makes the mutation control
repeatable by the next fire instead of being a one-time performance:

```
git show d9897a26:scripts/deploy-site.sh > /tmp/prefix-deploy-site.sh
bash scripts/test-deploy-site-contract.sh /tmp/prefix-deploy-site.sh   # MUST fail
```

## Evidence — executed, not deduced

All runs via `node -e` + `spawnSync` (direct `bash <script>` is permission-gated for fires; the s1053
precedent — node runs what the bash gate blocks).

**① The new guard against the CURRENT script — 7/7, rc=0:**

```
ran no-url            (DEPLOYED ok x0, FAILED x1)
ran real-url          (DEPLOYED ok x1, FAILED x0)
ran wrangler-red      (DEPLOYED ok x0, FAILED x1)
ran poisoned-log      (DEPLOYED ok x0, FAILED x1)
ran poisoned-but-real (DEPLOYED ok x1, FAILED x0)
ran skip-no-wrangler / skip-no-token
deploy-site contract PASS
```

**② THE MUTATION CONTROL — the same suite against the pre-fix script (`d9897a26`), rc=1:**

```
FAIL no-url: claimed 'DEPLOYED ok' for a run that published nothing
FAIL no-url: published nothing but never logged a failure
FAIL poisoned-log: claimed 'DEPLOYED ok' for a run that published nothing
FAIL poisoned-log: published nothing but never logged a failure
FAIL poisoned-log: re-served an EARLIER run's URL as its own
deploy-site contract FAIL (5 assertion failure(s))
```

**The control DISCRIMINATES, which is the part that matters.** The pre-fix script still *passes*
`wrangler-red`, `real-url`, `poisoned-but-real` and both skips — so the suite is not blanket-failing
anything handed to it. It fails exactly the two scenarios that **are** the disease, and the sharpest
line is the last one: the old script handed back a **previous run's URL** for a deploy that never
happened. That is defect 3 of s1057's table, caught automatically for the first time.

Case coverage beyond s1057's four hand-run scenarios:

- **`poisoned-but-real`** (new): a polluted log must not suppress a *genuine* success. Guards the
  fail-closed direction, so a future "fix" cannot pass by making the script pessimistic.
- **the `project create` banner** (new): the stub prints the pages.dev banner that a real
  `pages project create` emits for a project it has merely **reserved**. The fixed script routes that
  output to `$LOG` while reading its URL from `$CAPTURE`, so the banner can never be reported as a
  publish. That separation was previously load-bearing and untested.

**③ The pre-existing guard, EXECUTED for the first time — 13/13 PASS, rc=0, 78s.** This discharges a
limit s1053 stated in its own review and could not clear: *"I did NOT execute the contract test
itself — bash and direct execution are both gated for fires."* s1053's repair rested on a runner paste
plus a line-by-line read. It is now **run**: `strict-skip/build-red/deploy-red/success`,
`default-*`, `alias-current/stale/http-500/retry`, `wrangler-no-url` all pass, with the bounded
propagation retry visibly terminating (`alias-stale 30s`, `alias-http-500 31s`, `alias-retry 15s`
stopping at the first match). The guard has **not** rotted since s1053.

## Merge classification

Direct edit on main; no lane, no runner, no 3-way. Two paths, both path-scoped:
`scripts/test-deploy-site-contract.sh` (new, +150) and `package.json` (+2 lines, `scripts` block only).
Zero `src/`, zero assets, zero TypeScript, zero player-facing bytes.

`npx tsc --noEmit` clean. **`npm run build` deliberately NOT run**, and I would rather name that than
pad the table: the only non-new file touched is `package.json`, and the addition is two script
*aliases* — no dependency, no build field, no `tsc`/`vite` input changed. Running it would prove
nothing about this diff. `package.json` was validated by parsing it and printing both new entries.

## Findings

- **F-1059-1 — CLOSED by this commit.** The deploy-honesty guard covered 1 of the 2 cured scripts and
  had no executable caller. Both halves fixed above.
- **F-1059-2 (non-blocking, no corrective owed, stated so it is not rediscovered):** the two contract
  tests are wired to npm but still to **no automatic runner** — there is no CI in this repo and
  `npm test` is playwright. They run when a fire or attended session invokes them. That is an
  improvement (discoverable, one command, named in this review) but it is **not** the same as
  enforcement, and I am not going to claim it is. Wiring them into a gate battery is a scope decision
  for attended, not a fire's call.
- **No `goals.json` leaf**, following the s1057 precedent for a direct §2D correction (that file
  contains zero `s1057`/`deploy-site` references). The Goal Registration Law binds authored masters
  and drains; this is neither. Noted explicitly rather than skipped silently.

## Honest limits

- The stub reproduces wrangler's *observable contract* (exit code, stdout URL line, create banner),
  not wrangler itself. If a future wrangler changes its output format, these tests keep passing while
  reality changes — the same standing limit `test-deploy-contract.sh` carries.
- `deploy-site.sh` remains **LATENT**: `agenttown.pages.dev` still does not resolve and it has no
  automated caller, so this guard protects a script that has never run for real. That is deliberate —
  the class was closed on principle (s1057), and a guard is what keeps it closed.
- The "exactly two scripts" denominator is **re-verified, not inherited**: `grep -rln "wrangler pages
  deploy" scripts/ src/ e2e/` returns `scripts/deploy.sh` and `scripts/deploy-site.sh`, and nothing
  else. s1057's class-closure claim holds; it was the *guard's* denominator (1 of 2) that did not.
