# deploy-site-false-green — review

**Slice:** F-1057-1 corrective, `scripts/deploy-site.sh` (FIRE-AUTHORED + FIXED s1057, 2026-07-26)
**Branch/tip:** main, direct §2D standing correction (no lane, no runner)
**Verdict:** ✅ **FIXED + PROVEN** — the false green was reproduced live on the pre-fix script, then shown gone.

## What it does

`scripts/deploy.sh` (the game) was cured of the F-1049-1 false-green disease across s1049 → s1050 →
s1053. **`scripts/deploy-site.sh` — the second wrangler-deploying script in this repo — was never
treated.** It carried the same disease in a stronger form. This closes it.

The three defects, all verified by reading the file and then by execution:

| # | Defect (pre-fix) | Cured by `deploy.sh` at |
|---|---|---|
| 1 | `:39` `if deploy; then … DEPLOYED ok` — believes wrangler's **exit code**. wrangler 4.107.0 exits **0** after publishing nothing (F-1049-1, which cost 174 undeployed commits). | `:94` `[ "$DEPLOY_RC" -ne 0 ] \|\| [ -z "$URL" ]` |
| 2 | `:41`/`:48` `${URL:-'(url in log)'}` — an **empty** URL (nothing published) is *formatted away* into a friendly literal and still logged `DEPLOYED ok`. | `:96` `"wrangler exited 0 but published no URL"` |
| 3 | `:40`/`:47` greps the URL out of the **cumulative** `$LOG` with `tail -1` → a run that publishes nothing inherits a **previous run's URL** and reports it as its own. | `:90` `: > "$CAPTURE"` (per-run capture) |

Defect 3 is the worst: it does not merely say "ok", it hands back a concrete, plausible, **wrong** URL.

## Evidence — executed, not deduced

Four scenarios, real `/bin/bash`, wrangler stubbed on `PATH` so **no upload ever occurred**
(`agenttown.pages.dev` still does not resolve; verified by fetch before and after).

| Scenario | Pre-fix script | Fixed script |
|---|---|---|
| **[A]** wrangler exits **0**, prints **no URL** *(the exact F-1049-1 mode)* | ❌ `DEPLOYED ok '(url in log)'` | ✅ `FAILED: pages deploy — wrangler published no URL (an exit code alone is not proof — F-1049-1)` |
| **[B]** wrangler exits 0, prints a real URL | — | ✅ `DEPLOYED ok https://s1057-stub.pages.dev` (not fail-closed into uselessness) |
| **[C]** wrangler exits **1** | — | ✅ `FAILED: … published no URL` |
| **[D]** publishes nothing, but the cumulative log already holds [B]'s URL | ❌ `DEPLOYED ok https://s1057-stub.pages.dev` — **a previous run's URL** | ✅ `FAILED` (per-run capture) |

**[A] and [D] are the mutation control:** the pre-fix script was restored from `git show HEAD:` and run
against the *identical* stub. It produced the false green on demand. That is the proof, not the reasoning.

## Merge classification

Single file, `scripts/deploy-site.sh`, +19/−9. Direct edit on main (§2D standing correction; a
~19-line pipeline-script hardening applying an **already-ratified** pattern — the owner ratified honest
deploy reporting via the F-1049-1 correctives, so this completes the class rather than inventing scope).
No 3-way, no lane, no runner involved. Zero `src/`, zero assets, zero TS surface.

## Findings

- **F-1057-1 — CLOSED BY THIS COMMIT.** Severity was **LATENT, zero harm to date**, and that is stated
  plainly: `logs/deploy-site.log` **did not exist** before this audit and `https://agenttown.pages.dev`
  **does not resolve** ⇒ the script had never run for real, and no false green ever reached the owner.
  It has **no automated caller** (grep across the repo finds only task masters, reviews and STATUS
  archives — it is owner/attended-run). What made it worth fixing anyway: it deploys the marketing site
  **and the Gazette news page** (gz-02), i.e. the public face, and F-1055-1's standing order is *"if you
  find a third such gap, fix the class, not the instance."*
- **CLASS CLOSED, verified:** `grep -rln "wrangler pages deploy\|wrangler deploy" scripts/` returns
  **exactly two** files — `deploy.sh` (cured s1049–s1053) and `deploy-site.sh` (cured here). There is no
  third instance to find.
- **F-1057-2 (reported, deliberately NOT fixed — reject-don't-stretch).** `deploy-site.sh` still has no
  post-deploy *content* verification, the way `deploy.sh:116-134` re-reads `/version.json`. The static
  site emits no `version.json`, so adding one would mean inventing a site-build step this slice has no
  mandate for. A published-URL check is the honest ceiling for what this script can prove today.

## LIMITS — stated so nobody is oversold

- The fix was exercised **only against stubs**. A real `agenttown` deploy has never run, so the success
  path is proven against a synthetic URL, not Cloudflare.
- `npx tsc --noEmit` / `npm run build` were **not run**: this change touches one bash script and **zero**
  TypeScript, `src/`, or asset bytes. Running them would have proved nothing about the thing that changed.
- `bash scripts/test-deploy-contract.sh` was not run (bash-script exec is permission-gated for fires).

---

## Rider — the wider deploy-guard audit this fire performed (all positive, all measured)

The audit that found F-1057-1 was aimed at `deploy.sh`'s **never-exercised success path** — no deploy
has ever succeeded since it landed, so `VERIFY attempt` has **never once appeared** in `logs/deploy.log`
(grep-verified across all ~200k lines). Three things that could have made it silently useless were checked,
and **all three are sound**:

1. **The build-id comparison is format-compatible.** `deploy.sh:127` compares `$LIVE_BUILD` to
   `$PUBLISHED_BUILD`. Live production serves `{"build":"49dbce7a"}` — **8 chars**; `PUBLISHED_BUILD`
   derives from `git rev-parse --short=8 HEAD` — **8 chars**. A width mismatch here would have made
   *every* successful deploy report `deploy_unverified` forever. It is not present.
2. **The asset-budget guard is NOT vacuous** — and this is proven by real logged output, not by reading:
   `[asset-diet] desktop-chrome townResponses: 16381249 bytes` → `asset budget desktop-chrome: 16381249
   bytes (8618751 bytes headroom)`, both projects. The `sed` regex at `deploy.sh:73` still matches
   `e2e/asset-diet.spec.ts:100`, and `--grep "honest town and claim cues"` still matches the title at
   `:72`. (The silent-skip path at `:15` is satisfied — `deploy.sh:61` sets `GR_CAPTURE_EXTERNAL_SERVER=1`.)
   This is **not** an F-1044-1/F-1047-1/F-1052-1 repeat.
3. **`lockf` exists** at `/usr/bin/lockf`, so the `deploy.sh:36` preamble does not silently no-op every
   deploy via `finish lock_failed 6` (which exits **0** in default mode).

**One honest open limit, NOT a new finding:** the alias-promotion retry (`deploy.sh:116-131`, 3 attempts
/ ~30s of sleep) was a **deliberate** s1053 design decision — `reviews/deploy-verify-production-alias.md`
says it exists so "Cloudflare's async alias promotion is not mis-reported as staleness". Whether 3×15s is
*sufficient* is unvalidated, because no deploy has ever succeeded. If promotion is slower, a genuine
success reports `deploy_unverified` (rc 7) — a **false red**, which is the safe direction and costs a
re-deploy rather than a lie. Re-raising this as a defect would be inheriting a belief s1053 already
settled; it is recorded here as a limit only.

**Deploy staleness, refreshed by asking the live site:** `gold-rush-3in.pages.dev/version.json` still
serves `49dbce7a`, `builtAt 2026-07-24T17:20:23Z` — now **220 commits** behind main (was 216 at s1056).
