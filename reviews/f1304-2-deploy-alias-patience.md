# f1304-2 — deploy alias patience

**Slice:** `f1304-2-deploy-alias-patience` (cures F-1304-2, the deploy-alias-window finding)
**Branch / tip:** `lane/m4` @ `02779012` (runner commit `runner(lane-b): lane-b-f1304-2-deploy-alias-patience.md`)
**Merge-base:** `d97bc4d5`
**Merged to main at:** `2f629f52c6b4548a20e7c2da698a6972055eea5a`
**Drained by:** s1308 fire, 2026-08-01
**Verdict:** ✅ **MERGE** — the acceptance bar was a two-direction proof, and it was re-derived here from scratch rather than read off the runner's report. One non-blocking finding (F-1308-1), plus one of my own hypotheses refuted mid-drain.

---

## §3.0 block check — run FIRST, before classification

```
node scripts/drain-block-check.mjs 20260801-010520-lane-b-f1304-2-deploy-alias-patience.md --strict
  ✅ CLEAR — lane-b-f1304-2-deploy-alias-patience.md [f1304-2-deploy-alias-patience] status="queued"
```

Matched **BY NAME** under `--strict` (not an UNKNOWN-at-rc-0, which §3.0 warns reads as permission).

---

## What it does

`scripts/deploy.sh` uploads a build, then polls `$PAGES_PRODUCTION_URL/version.json` until the alias
reports the build it just published. That poll used to be `for ATTEMPT in 1 2 3` with `sleep 15`
between — **~30 s of total patience**. Cloudflare's alias promotion routinely takes longer, so a
*successful* deploy was being reported as `UNVERIFIED` / `deploy_unverified` rc 7. F-1304-2 recorded
exactly that happening in production: `DEPLOYED ok https://3fc7d940.gold-rush-3in.pages.dev` followed
by `UNVERIFIED`, and an out-of-band re-probe minutes later showed the alias *had* promoted correctly.

This slice replaces the fixed loop with a **sleep schedule**:

```sh
VERIFY_SLEEPS="${GR_DEPLOY_VERIFY_SLEEPS:-10 15 20 30 45 60}"   # deploy.sh:116
```

→ **7 probes over ~180 s**, backing off rather than fixed-15. `GR_DEPLOY_VERIFY_SLEEPS` is a
test-only override so the contract suite can drive the same logic at zero wall-cost.

The `UNVERIFIED` note is reworded to state the attempt count and elapsed budget, and to name the
ambiguity honestly instead of asserting failure:

> `UNVERIFIED after 7 attempts over ~180s: uploaded <id>, alias still reports <id>. This is either a
> slow alias promotion or a genuinely stale alias — re-probe the alias and run 'wrangler pages
> deployment list' before treating it as a failure.`

**Outcome names and exit codes are unchanged** (`finish deployed 0`, `finish deploy_unverified 7`),
which the master required and which the strict-code cases below re-assert.

---

## Merge classification

| File | Class | Evidence |
|---|---|---|
| `scripts/deploy.sh` | **LANE-TOUCHED only** | `git diff --name-only d97bc4d5 main -- scripts/deploy.sh` → empty |
| `scripts/test-deploy-contract.sh` | **LANE-TOUCHED only** | same probe → empty |

**Zero MAIN-MOVED files → no 3-way graft needed.** Merged by
`git checkout lane/m4 -- scripts/deploy.sh scripts/test-deploy-contract.sh`, then proved byte-identical
to the lane tip by blob hash (not by eyeball):

```
scripts/deploy.sh                 worktree=939377184a4a  lane=939377184a4a  BYTE-IDENTICAL
scripts/test-deploy-contract.sh   worktree=5f29dc602a4b  lane=5f29dc602a4b  BYTE-IDENTICAL
```

Real two-dot diff vs base: **24 insertions / 8 deletions across exactly 2 files** — the master's
TOUCH-ONLY list exactly. No firewall violation.

---

## Evidence

### The acceptance bar: the two-direction proof, re-derived

The master (`tasks/lane-b-f1304-2-deploy-alias-patience.md:48`) states it outright: *"a passing test
never executes its own failure path, so its green says nothing about the red… **A green alone is not
acceptance here.**"* s1307's handoff repeated it as a STOP condition. So both arms were rebuilt here
rather than inherited.

**ARM A — the new `alias-late-promotion` case against main's OLD 3-attempt window.**
Staged in `/tmp/s1308-armA`: `git show main:scripts/deploy.sh` + `git show lane/m4:scripts/test-deploy-contract.sh`.
Confirmed the staged script carried the old loop (`deploy.sh:116: for ATTEMPT in 1 2 3`, `:131: [ "$ATTEMPT" -eq 3 ] || sleep 15`).

```
ARM A rc=1   wall=33.76s
  PASS alias-current (rc=0, 0s)
  stderr: alias-late-promotion: expected rc 0, got 7
```

The old window **fails the new case**, and the 33.76 s wall is itself the signature of the defect
(two real 15 s sleeps — the old code ignores the test override entirely).

**ARM B — the same case on the merged tree.**

```
ARM B rc=0   wall=4.01s
  PASS alias-late-promotion (rc=0, 1s)
    VERIFY attempt 5/7: .../version.json says test-build
    VERIFIED published test-build at http://127.0.0.1:53613
```

The stub serves `old, old, old, old, test-build`, so promotion lands on **probe 5** — inside the new
window, outside the old one. That is the defect and its cure, demonstrated in both directions.

### Gate battery (merged tree)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **rc=0, 15.80 s**, `✓ built in 2.01s`, asset-diet ceiling respected (1,158,214 / 1,500,000 bytes) |
| `scripts/test-deploy-contract.sh` (own spec) | **rc=0, 4.01 s** — `deploy contract PASS (production alias current/stale/500/retry/late-promotion/no-url; strict 0/2/3/4/7; default failures return 0)` |
| Default-schedule assertion | `PASS default verify schedule (7 attempts; sleeps 10/15/20/30/45/60; ~180s)` |
| `scripts/test-deploy-site-contract.sh` (**sibling class**) | **rc=0** — `deploy-site contract PASS (no-url, real-url, wrangler-red, poisoned-log, poisoned-but-real, 2 skips)` |
| `npm run test:node-guards` (full battery) | **rc=0, 39.30 s** |
| findings census | 189 subjects · 146 closed · 43 open · **0 double-state** — reconciles exactly with s1307's closing numbers |

### Boot probe — replaced by a deterministic identity proof

`git diff --stat main -- src/ e2e/ index.html vite.config.ts package.json` → **empty**.

This slice changes two shell scripts and **nothing the browser ever loads**. Rather than run a boot
probe whose green would be about the harness rather than the slice, the stronger claim is recorded:
the game's runtime inputs on the merged tree are **byte-identical to main's**, and `npm run build` is
green. (Same reasoning as s1307's §D — a deterministic proof beats a re-run when one is available.)

### Sibling-class check — re-derived, not inherited

s1307 asserted *"sibling class checked and absent — `deploy-site.sh` is 69 lines with no verification
loop."* Re-measured: `scripts/deploy-site.sh` is **68 lines** (not 69) and contains **no
`version.json` poll and no VERIFY loop** — its only `attempt` token is a comment at `:39` about log
truncation. The substance of the claim holds; the line count was off by one. `deploy-site.sh:40`
cites `deploy.sh:90-113`, and that region is **untouched** by this merge (the diff hunk opens at
`:113` context and the first changed line is `:116`) — pointer verified intact, not assumed.

---

## Findings

### ✅ F-1308-1 (raised AND cured in this fire) — a whitespace-only `GR_DEPLOY_VERIFY_SLEEPS` aborts the script under `set -u`

`scripts/deploy.sh:5` is `set -u`, and this machine's `/usr/bin/env bash` is **GNU bash 3.2.57**,
where expanding an **empty array** under `set -u` is an error rather than an empty expansion.

Measured against the real subject lines (`deploy.sh:116-122`, extracted verbatim from the merged
file — not a paraphrase):

| `GR_DEPLOY_VERIFY_SLEEPS` | rc | result |
|---|---|---|
| unset | 0 | `attempts=7 wait=180` ✅ |
| `""` (empty) | 0 | `attempts=7 wait=180` — **falls back to default** |
| `" "` (whitespace only) | **abort** | `deploy.sh:122: VERIFY_SLEEP_SCHEDULE[@]: unbound variable` |
| `"10 15 20"` | 0 | `attempts=4 wait=45` ✅ |

⚠️ **I raised this as an empty-string hazard first, and my own probe refuted it.** `${VAR:-default}`
uses `:-`, which substitutes the default for **unset *or* empty** — so the obvious bad input is
already safe. Only a **whitespace-only** value survives the fallback and produces an empty array.
Recording the refutation as well as the finding so nobody re-raises the empty-string version.

**Why it did not block the merge:** the variable is a test-only seam, the harness always sets six
numeric values, and production never sets it at all — so the path is unreachable from every current
caller.

⚠️ **And my stated exit code was wrong — my own end-to-end probe corrected it.** I wrote `rc=127`;
driving the *actual unguarded script* (not the extracted lines) gives **rc=1**. 127 was an artifact
of running the block under `bash -c`. But the forensic probe also **confirmed the part that mattered**:

```
direct rc=1
stderr: deploy.sh: line 122: VERIFY_SLEEP_SCHEDULE[@]: unbound variable
deploy-result.json exists: false
log tail: [deploy] ... DEPLOYED ok https://stub.pages.dev
```

**No `logs/deploy-result.json` is written at all**, and the log's final line is `DEPLOYED ok` — a
deploy that looks successful and renders no verdict. That is exactly the dishonest-outcome class
`deploy.sh` exists to prevent, which is why it earned a fix rather than a deferral.

✅ **CURED IN THIS FIRE** (`scripts/deploy.sh:118-125` + `scripts/test-deploy-contract.sh`): the
script re-seeds the default schedule when the parsed array is empty. `${#arr[@]}` is safe on an
empty array under `set -u`; only `"${arr[@]}"` is not — verified before relying on it. The contract
suite gained an 11th `run_case` parameter and an `alias-whitespace-sleeps` case.

**Held to the same two-direction bar as the slice it came from:**

| Arm | Result |
|---|---|
| new case vs. `2f629f52` (guard **absent**) | **rc=1** — `alias-whitespace-sleeps: expected rc 0, got 1` |
| new case vs. cured tree (guard **present**) | **rc=0** — `PASS alias-whitespace-sleeps (rc=0, 0s)`, full suite 6.38 s |

### ⓘ F-1308-2 (informational) — the default schedule is asserted by grep, not by behaviour

`test-deploy-contract.sh:133` proves the shipped default with
`grep -Fq 'VERIFY_SLEEPS="${GR_DEPLOY_VERIFY_SLEEPS:-10 15 20 30 45 60}"'` — a **literal source
match**, since actually waiting 180 s in a suite is not viable. This is the right trade, but it means
the assertion is brittle to reformatting (any whitespace change to that line reds the suite without a
behaviour change) and it does not verify that the schedule is *applied*. The applied path is covered
independently by `alias-late-promotion` reaching `VERIFY attempt 5/7`, and the arithmetic is
confirmed above (`unset → attempts=7 wait=180`). No action proposed.

### ⓘ Cost note (stated, not a defect)

Worst-case deploy wall-time rises from **~30 s to ~180 s** when the alias genuinely never promotes
(the `alias-stale` and `alias-http-500` shapes). That is the intended trade — patience is the point —
but a fire running `deploy.sh` should expect up to three minutes on the failure path, against a
~35–50 min budget. Flagged so it is not rediscovered as a surprise.

---

## Runner's report vs. what was verified here

The runner reported the two-direction proof (`alias-late-promotion: expected rc 0, got 7` / `real
32.91s` for the old arm). Both arms were **independently reconstructed** rather than accepted; my
ARM A wall was **33.76 s** against its reported 32.91 s — consistent. Its claim *"Independent review:
no actionable findings"* did **not** surface F-1308-1, which is the ordinary reason a drain re-reads
the code instead of the report.
