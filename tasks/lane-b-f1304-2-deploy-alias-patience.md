# lane-b — F-1304-2: give the production-alias check enough patience for Cloudflare

**FIRE-AUTHORED (attended review welcome) — s1307, 2026-08-01.**
**Role:** implementer. **Workdir:** `worktrees/lane-b` (branch `lane/m4`). One task, one branch, path-scoped commits.

## READ FIRST (paths, in this order)

1. `scripts/deploy.sh` — specifically the verification loop at **`:115`–`:134`** (cite the code, not the coordinate; it drifts).
2. `scripts/test-deploy-contract.sh` — the harness you will extend. Read **`:20`–`:75`** (the local alias server + the `run_case` signature) and **`:112`–`:126`** (the existing cases). **This is the seam that makes the task testable; you do not need to invent one and you must not deploy anything.**
3. `tasks/BACKLOG.md` — the **F-1304-2** row (the deploy alias window; note the ⚠️ ID-collision banner, and ignore the *other* F-1304-2 in `reviews/ap-11-mechanics-manifest.md:97`, which is a different, closed finding).
4. `reviews/deploy-verify-production-alias.md` — the review that introduced this retry, for its stated intent.

## WHY (evidence, quoted and dated — do not re-litigate it)

**s1304 ran the deploy path and it printed a false alarm.** From the F-1304-2 row: the script printed `DEPLOYED ok https://3fc7d940.gold-rush-3in.pages.dev` and then

> `UNVERIFIED: uploaded 0de66a0a but https://gold-rush-3in.pages.dev/version.json says 75a62169`

s1304 then **asked the service instead of trusting the script**: `wrangler pages deployment list` returned the new deployment as `Environment: Production · Branch: main · Source 0de66a0`, and an out-of-band re-probe minutes later returned `{"build":"0de66a0a"}`. **The deploy had succeeded; only the check was impatient.** The review that built the check says the retry exists *"so Cloudflare's async alias promotion is not mis-reported as staleness"* — which is exactly the failure it produced.

**s1307 re-verified the premise by reading the code before authoring this:** `deploy.sh:116` is `for ATTEMPT in 1 2 3` with `sleep 15` at `:131` between attempts, so total patience is **~30 s of sleep**. That is the whole defect.

**Why it matters beyond tidiness:** a false `UNVERIFIED` in a deploy log is the kind of scary line a later fire inherits as a blocker. It already cost one fire a wrong hypothesis.

## SCOPE (three slices; each ends in its own checkable checkpoint)

### 1. Make the backoff schedule widened *and* parameterisable

In `scripts/deploy.sh`, replace the fixed `for ATTEMPT in 1 2 3` / `sleep 15` with a schedule driven by a single variable, e.g.

```sh
VERIFY_SLEEPS="${GR_DEPLOY_VERIFY_SLEEPS:-10 15 20 30 45 60}"
```

so the **production default is 7 attempts spanning ~180 s** (6 sleeps + the final probe), and the schedule can be overridden for tests. Attempt *N* probes, and if it does not match, sleeps the *N*th value; after the last sleep it probes once more and then falls through.

**Constraints, all binding:**
- **Do NOT change the outcome names or exit codes.** `finish deployed 0`, `finish deploy_unverified 7` and every other `finish` call keep their exact current outcome string and code. This script's contract is asserted by `scripts/test-deploy-contract.sh` and consumed by fire law; a code change is out of scope.
- Keep the per-attempt `note "VERIFY attempt N/M: …"` line (it is the forensic trail s1304 relied on); make `M` reflect the real attempt count rather than a hardcoded `3`.
- The 20 s per-probe `AbortSignal.timeout` stays as is.

**Checkpoint:** `bash scripts/test-deploy-contract.sh` still prints its PASS line, with all existing cases (`alias-current`, `alias-stale`, `alias-http-500`, `alias-retry`, and the strict/default families) at their **current expected rcs**.

### 2. Prove the widening with a case that FAILS on today's code

Add a `run_case` that manufactures a promotion arriving **after the old 3-attempt window** — the alias server consumes its `builds` array one entry per request, so a state of `["old-build","old-build","old-build","old-build","test-build"]` is only reachable by a 5th attempt. Expect **rc 0 / `deployed`**.

⚠️ **This is the acceptance evidence, and it must be demonstrated in both directions (the s1299/s1301 standard — a passing test never executes its own failure path, so its green says nothing about the red):**
- Run the new case against the **unmodified** `deploy.sh` (stash slice 1, or run it with `GR_DEPLOY_VERIFY_SLEEPS` set to three values) and **show it FAILS** with the old window.
- Then show it **PASSES** with slice 1 applied.
- Report both transcripts. **A green alone is not acceptance here.**

Set `GR_DEPLOY_VERIFY_SLEEPS` to something fast (e.g. `0 0 0 0 0 0`) for the behavioural cases so the suite does not grow by minutes — **and then add one separate assertion that the built-in default schedule is the widened one** (grep the script, or run with the variable unset and assert the `attempt 1/7`-style note), so the fast test override cannot silently hide a reverted default. Report the suite's before/after wall time.

### 3. Stop the final line from asserting a conclusion it has not earned

`deploy.sh:133` currently reads `UNVERIFIED: uploaded X but … says Y`, which reads as *the deploy is stale*. Reword it to state only what was observed and name the two possibilities — e.g.

> `UNVERIFIED after 7 attempts over ~180s: uploaded X, alias still reports Y. This is either a slow alias promotion or a genuinely stale alias — re-probe the alias and run 'wrangler pages deployment list' before treating it as a failure.`

Keep the uploaded and observed build ids in the message. **Outcome and exit code unchanged.**

**Checkpoint:** the contract suite passes and the new wording appears in `logs/deploy.log` for the exhausted cases.

## EXPLICITLY NOT IN SCOPE (do not do these; report instead)

- ❌ **Do NOT add a `wrangler pages deployment list` discriminator to separate NOT-YET-PROMOTED from STALE.** It is the natural next step and it is a **design fork**: in the stub harness the `alias-stale` case would become "pending", which changes an asserted contract, and deploy behaviour is owner-adjacent. If you think it is right, say so in your report and leave it for an owner ruling.
- ❌ Do NOT add or change any outcome string or exit code.
- ❌ Do NOT touch `scripts/deploy-site.sh`. **s1307 checked it: it is 69 lines and has no alias-verification loop at all**, so the documented sibling-script class does not apply. Do not go looking for it there.
- ❌ Do NOT run a real deploy, and do not add or read any Cloudflare credential. Everything here is provable against the stub harness.
- ❌ Do NOT touch `src/`, `e2e/`, or any ledger file.

## FIREWALL

**TOUCH-ONLY:** `scripts/deploy.sh` · `scripts/test-deploy-contract.sh`
**NO:** `scripts/deploy-site.sh` · `scripts/test-deploy-site-contract.sh` · `src/**` · `e2e/**` · `tasks/**` · `reviews/**` · `logs/**` (except the deploy log the harness writes into its own temp dir) · `package.json`

## PRE-FLIGHT (LANE-SAFETY invariant)

`node scripts/lane-usable.mjs lane-b` must print **USABLE**. If it prints `AHEAD-BUT-ABSORBED`, `HOLDS`, `DIRTY` or `BUSY`: **STOP and report the word verbatim** — do not reset, do not cure. Any dirty tracked blob must be reachable in git, else STOP.

## SELF-CHECK (name the exact commands and paste real output)

1. `bash scripts/test-deploy-contract.sh` — full PASS line, and the **before/after wall time**.
2. The **two-direction proof** from slice 2: the new late-promotion case failing on the old window and passing on the new one.
3. The default-schedule assertion from slice 2 (proving the fast test override did not mask a reverted default).
4. `npx tsc --noEmit` and `npm run build` — both must stay clean (this task changes no TypeScript, so a red here means you touched something you should not have).
5. `git diff --name-only` against your base must list **exactly two files**. If it lists more, you left the firewall — stop and report.
6. State plainly whether you believe the deployment-list discriminator is worth an owner ruling, and why. A one-paragraph opinion is wanted; an implementation is not.

**READY-FOR-GATES** — report: the contract suite result, both directions of the slice-2 proof, the suite's wall-time delta, the exact new default schedule, and your opinion on the out-of-scope discriminator.
