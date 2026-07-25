# deploy-verify-production-alias — review

**Slice:** `lane-d-deploy-verify-production-alias.md` (FIRE-AUTHORED s1052)
**Branch/tip:** `lane/perf` @ `99baab74` → main `e74230184cbb0204dd7fe9c391a12f9c69ee7c86`
**Drained by:** s1053, 2026-07-26
**Verdict:** ✅ **MERGE** — all four scopes implemented, firewall held exactly, and the finding it was written for was confirmed by execution rather than inherited.

## What it does

The deploy path's success confirmation used to fetch `$URL/version.json`, where `$URL` is the
**deployment-specific** hostname wrangler prints — the one host guaranteed to serve the bytes just
uploaded, and therefore the one host that cannot disagree. F-1049-1 (174 commits sitting behind a
`DEPLOYED ok`) was found by reading a *different* host: the production alias the family actually
opens. This slice points the confirmation at that alias behind a real config knob
(`GR_PAGES_PRODUCTION_URL`, defaulting to `https://gold-rush-3in.pages.dev` — the value
`scripts/second-rider.mjs:7` and `scripts/fetch-bugs.mjs:9` already hardcode, so it is adopted, not
invented), wraps it in a **bounded** 3-attempt retry so Cloudflare's async alias promotion is not
mis-reported as staleness, gives the `wrangler exited 0 but no URL` case its own honest wording, and
repairs `scripts/test-deploy-contract.sh` — which had been **red since `00f5d464`** — to the current
5-key contract, made hermetic against a local `127.0.0.1` server.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | ✅ clean, no output |
| `npm run build` | ✅ green, built in **1.46s** (asset-diet line unchanged: 235 GLBs 599.1→93.8 MB, 53 PNGs 183.5→24.3 MB) |
| Firewall | ✅ **exactly 2 files**, `scripts/deploy.sh` +61/−?, `scripts/test-deploy-contract.sh` +89/−?; total **+117/−33**; **zero `src/`**, **zero `scripts/asset-diet.mjs`** — verified by my own `git diff --stat`, not from the report |
| Merge class | ✅ **exact graft.** merge-base `1cc8bce3`; `git diff 1cc8bce3 main -- <the 2 files>` is **empty** → main never moved either file since the base. No 3-way, no conflict resolution. |
| Tree fidelity | ✅ after cp, `git diff lane/perf -- <the 2 files>` **empty** → working tree byte-identical to the lane tip before staging |
| F-1052-1 (the premise) | ✅ **CONFIRMED BY EXECUTION** — see below |
| Contract test run | ⚠️ **NOT executed by me** — `bash <script>` is permission-gated for fires. See LIMITS. |
| Never-block law | ✅ preserved — `finish()` still `exit 0` unless `--strict` (`deploy.sh:24-29`); the new `deploy_unverified 7` inherits that |

### F-1052-1 confirmed by execution, not deduction

s1052 could only *deduce* the contract test was red (it stated this honestly). I executed the
assertion itself with node — not gated — against the **real artifact** written by s1050's genuine
15.4-minute deploy:

```
real artifact keys : commit,outcome,publishedBuild,ts,url
OLD assertion (main:test-deploy-contract.sh:35) expects commit,outcome,ts,url -> THROWS (red)
NEW assertion (lane) expects commit,outcome,publishedBuild,ts,url -> PASS
artifact ts       : 2026-07-25T17:49:02Z | outcome: deploy_failed
```

So the claim is now a **run**, not a reading: the shipped guard threw on every one of its seven
`run_case` calls from the moment `publishedBuild` was added, and two consecutive deploy correctives
shipped without their own contract test ever going green. The repaired assertion passes against that
same real artifact.

### Runner report — all five of s1052's rejection criteria met

s1052 ordered rejection if any were missing. All present in
`logs/runs-archive/20260726-014521-lane-d-…log`:

1. **before-red paste** — `Error: unexpected result fields` / `exit 1` (and it did *not* unexpectedly pass, so the STOP-and-report branch correctly did not fire)
2. **after-green naming cases (a)–(e)** — `alias-current`, `alias-stale`, `alias-http-500`, `alias-retry`, `wrangler-no-url`
3. **stale-alias line proving `deploy_unverified` not `deployed`** — `PASS alias-stale (rc=7, 31s)` + `UNVERIFIED: uploaded test-build but …/version.json says old-build`
4. **retry lines with wall-clock proving termination** — `alias-stale 31s`, `alias-http-500 30s`, `alias-retry 15s` (2 sleeps × 15s, stopping at the first match); bounded by construction at `deploy.sh:120-132` — 3 attempts, `[ "$ATTEMPT" -eq 3 ] || sleep 15`, each fetch capped by `AbortSignal.timeout(20000)`
5. **`git diff --stat` exactly two files** — confirmed independently above

Each added case fails if scopes 1–3 are reverted: `alias-*` cases drive
`GR_PAGES_PRODUCTION_URL` at a local server (scope 1), `alias-retry` asserts **exactly 2**
`VERIFY attempt` lines (scope 2), and `wrangler-no-url` greps the literal new wording *and* asserts
the old progress-line message is absent (scope 3).

## Findings

**F-1053-1 — non-blocking, cosmetic-severity, recorded for the record.** The confirmation compares
`LIVE_BUILD` to `PUBLISHED_BUILD` by string equality. If both were the empty string the comparison
would report a false `VERIFIED`. I checked whether that is reachable and it is **not**:
`BUILD_ID` at `deploy.sh:48` uses `${CF_PAGES_COMMIT_SHA:-…}`, whose `:-` form treats empty as unset
and falls back to the short hash or the literal `unknown`; and an unreadable/absent snapshot
`version.json` hard-fails at `:80-82` with `deploy_failed 4` before the comparison. Reachable only by
hand-editing `dist/version.json` to `{"build":""}`. **No corrective owed** — stated so the next reader
does not have to re-derive it.

## LIMITS — stated plainly

- **I did not run the contract test.** `bash <script>` and direct script execution are both
  permission-gated for fires (I attempted both; each was refused). The suite's green is therefore
  attested by the runner's paste plus my own line-by-line read of the diff — **and** by the one piece
  I *could* execute, the key assertion above, which is the exact thing that was broken. The
  before-red and after-green pastes are consistent with that execution.
- **This slice deploys nothing and changes zero bytes a player receives.** It changes *what the
  deploy script checks* and *what its test guards*. The family is still on Friday's build.
- **The outage is not closed by this.** The 423 MB / `UND_ERR_HEADERS_TIMEOUT` transport problem is
  untouched and remains owner-gated (F-1051-2 / F-1051-3). What this slice buys is that **the first
  successful deploy will be verifiable** — previously the very next success would have printed
  `VERIFIED published <hash>` on evidence that has never once been able to detect the bug it was
  written for. Fixing it before the transport fix was the right order.
