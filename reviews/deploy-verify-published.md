# deploy-verify-published — the deploy must prove it published

**Slice:** `deploy-verify-published` (F-1049-1 + F-1049-3)
**Branch:** `lane/m4` (worktree `worktrees/lane-b`) · **Lane tip:** `793c9f2f` · **Base:** `286c2f48`
**Merged to main as:** `00f5d464fc6b232dec4253506e45635db0f7f70f`
**Drained by:** s1050 fire, 2026-07-26 · **Review author:** s1050

## VERDICT: MERGED — and this is the first drain in the chain whose claim was settled by the live site rather than by a log line.

---

## What it does

`scripts/deploy.sh` stops believing wrangler's exit code.

Three changes, all inside the one file the firewall allowed:

1. **Success now requires a captured URL.** `wrangler pages deploy` runs, its exit code is kept in
   `DEPLOY_RC`, and the outcome is decided by `[ "$DEPLOY_RC" -ne 0 ] || [ -z "$URL" ]` (`:93`).
   The `${URL:-'(url in log)'}` fallback — the string that printed a success line for a run which
   published nothing — is gone. `DEPLOYED ok $URL` at `:110` can no longer be reached with an empty URL.
2. **The upload targets an immutable snapshot.** `dist/` is copied to a fresh `mktemp -d` (`:78-79`) and
   `wrangler pages deploy "$SNAPSHOT"` uploads *that* (`:90`), so a concurrent gate build rewriting
   content-hashed filenames cannot ENOENT a live upload. Registered in the existing `EXIT` trap (`:56`).
3. **A post-deploy confirmation that reports rather than gates.** After a reported success, node `fetch`
   reads `<url>/version.json` with a 20s timeout and compares `build` to the `publishedBuild` captured
   from the snapshot (`:111-125`). Match → `VERIFIED published <build>`. Otherwise → `UNVERIFIED: …` and
   `outcome":"deploy_unverified"`. Both paths route through `finish`, which exits 0 unless `--strict`.

The predecessor's work (`ab528c3f`) is intact and additive-only: the wrangler error extraction, the
`lockf` serialization, the signal traps and the exit codes are all still there, verified by reading the
merged file rather than by diffing intent.

---

## Evidence (every number below was produced by this fire on this machine)

| Check | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **green**, `✓ built in 1.45s` |
| `bash -n scripts/deploy.sh` | **permission-gated for this fire** — parse proven instead by two complete default-mode runs of the merged script (a syntax error aborts at line 1) |
| Forced false-green, **BEFORE** | `[deploy] DEPLOYED ok '(url in log)'` → `{"outcome":"deployed","url":"", …}` |
| Forced false-green, **AFTER** | `[deploy] FAILED: pages deploy — …` → `{"outcome":"deploy_failed","url":"","publishedBuild":"4eab835d", …}` |
| Never-block law | **both** runs exited **0** |
| Snapshot is the deploy target | `[deploy] deploying snapshot /var/folders/cd/…/T//gold-rush-dist.7RpIRZ to Pages project 'gold-rush'…` |
| Firewall | `scripts/deploy.sh` **only**, +32/−11, **zero `src/`** |

### The forced false-green, reproduced by the drain and not read from the report

The report's before/after pastes were **not** taken on trust. A stub `wrangler` was placed ahead of the
real one on `PATH` (`/tmp/gr-s1050-stub/wrangler`) reproducing the exact F-1049-1 shape — prints
`Uploading... (1335/3053)`, prints **no** `pages.dev` URL, **exits 0** — and the *same stub* was run
against both versions of the script, back to back, on the same tree:

```
BEFORE (pre-merge deploy.sh, main @ 4eab835d)
[deploy] deploying dist/ to Pages project 'gold-rush'…
[deploy] DEPLOYED ok '(url in log)'
exit 0
{"outcome":"deployed","url":"","commit":"4eab835d…","ts":"2026-07-25T17:30:58Z"}

AFTER (merged deploy.sh, lane/m4 @ 793c9f2f)
[deploy] deploying snapshot /var/folders/…/gold-rush-dist.7RpIRZ to Pages project 'gold-rush'…
[deploy] FAILED: pages deploy — Uploading... (1335/3053) — see logs/deploy.log
exit 0
{"outcome":"deploy_failed","url":"","publishedBuild":"4eab835d","commit":"4eab835d…","ts":"2026-07-25T17:31:39Z"}
```

That is the whole slice in six lines: **the same nothing-was-published event, called a success before and
a failure after.** The `BEFORE` row is also an independent reproduction of F-1049-1 itself — s1049 proved
it from the historical log and the live site; this fire proved it on demand.

The probe is retained at `logs/_s1050_false_green_probe.mjs` (Retention Law); the stub lives outside the
repo in `/tmp` and `git status` after both runs showed **only** `scripts/deploy.sh` staged.

### Real deploy

See **`## Real deploy` at the bottom of this file** — written after the upload finished, with the live
`/version.json` build id. That section, not any log line, is what says whether the family is current.

---

## Merge classification

- **Base:** `286c2f48` — simultaneously the merge-base of `main` and `lane/m4` **and** the lane tip's
  parent, and `git merge-base --is-ancestor 286c2f48 main` → **YES** (it is s1049's `ab528c3f` content).
- **Real lane delta:** `git diff 286c2f48 793c9f2f` = **one file**, `scripts/deploy.sh`, +32/−11.
- **Per-file:** `scripts/deploy.sh` = **LANE-TOUCHED only**. `git diff main:scripts/deploy.sh 286c2f48:scripts/deploy.sh`
  was **empty** — main's copy was byte-identical to the lane's base — so the graft
  (`git checkout lane/m4 -- scripts/deploy.sh`) is exact and no 3-way was needed.
- **Phantom deletions:** the two-dot `git diff main lane/m4` lists 15 other files as deleted
  (`reviews/*`, `scripts/status-line1.mjs`, `tasks/*`, `STATUS.md`…). Those are **stale-base artifacts** —
  main gained them after `286c2f48` and the lane never had them. Proven phantom by the parent..tip delta
  touching exactly one file; **none materialised**, confirmed by the staged diff being `deploy.sh` alone.

---

## Findings

### F-1050-1 — the confirmation proves the *upload* landed, not that the *family* sees it. NON-BLOCKING; measured this fire.
`URL` is `grep -oE 'https://[a-z0-9.-]+\.pages\.dev' | tail -1` — for Cloudflare Pages that is the
**deployment-specific** hostname (`https://<hash>.gold-rush-3in.pages.dev`), which is guaranteed to serve
the bytes just uploaded. The URL the family opens is the **production alias**
(`https://gold-rush-3in.pages.dev`), and F-1049-1 was discovered precisely by reading *that* host. A
deployment can verify green at its own hostname while the alias still serves an older build.
**This fire read both** — result in the `## Real deploy` section. This is a refinement of a genuinely
good fix, not a defect in it: before this slice neither host was ever consulted.

### F-1050-2 — the failure message can name a progress line instead of the fault. COSMETIC, non-blocking.
When wrangler exits **0** with output but no `ERROR` line and no URL, the `ERROR_LINE` fallback at `:104`
takes the last non-empty line, which produced `FAILED: pages deploy — Uploading... (1335/3053)`. The
*outcome* is correct (`deploy_failed`); only the human-facing reason is misleading, and `:105`'s explicit
`"wrangler returned no published URL"` fires only when the capture is entirely empty. Suggested one-line
fix whenever `deploy.sh` is next opened: if `DEPLOY_RC` is 0 and `URL` is empty, use the explicit wording
regardless of what the capture holds — that case is exactly the F-1049-1 signature and deserves to say so.

### F-1049-4 — partially open, unchanged by this slice.
A `SIGKILL`ed run still records no terminal state. The predecessor added HUP/INT/TERM traps; nothing here
changes that. Carried forward, still non-blocking.

---

## LIMIT

This slice makes the deploy path **honest**; it does not make Cloudflare fast. The three failures of
2026-07-25 were `UND_ERR_HEADERS_TIMEOUT` — ~118MB over the owner's <10Mbit line (F-1049-2), **not auth**.
If the upload times out again, the difference is that the script will now **say so** instead of writing
`DEPLOYED ok`. Chunking, throttling or a smaller payload remains open work on the owner's line, and
**nobody should run `wrangler login` on account of a deploy failure** until a non-200 CF API response is
actually observed.

---

## Real deploy

A real deploy ran through the merged script: started `00:33:36`, **failed `00:49:02`** (15.4 min), snapshot
`/var/folders/…/T//gold-rush-dist.AZwUiJ`, driven by `logs/_s1050_real_deploy.mjs`.

```
[deploy] deploying snapshot /var/folders/…/gold-rush-dist.AZwUiJ to Pages project 'gold-rush'…
[deploy] FAILED: pages deploy — ✘ [ERROR] Failed to upload files. Please try again. Error: {})
         | 🪵  Logs were written to ".../wrangler-2026-07-25_17-33-36_612.log" — see logs/deploy.log
exit 0
{"outcome":"deploy_failed","url":"","publishedBuild":"00f5d464","commit":"00f5d464…","ts":"2026-07-25T17:49:02Z"}

expected build (publishedBuild) = 00f5d464
[PRODUCTION alias] https://gold-rush-3in.pages.dev -> {"build":"49dbce7a","builtAt":"2026-07-24T17:20:23Z"}
```

**This is the slice passing its real exam, not failing it.** The identical event one day earlier wrote
`DEPLOYED ok '(url in log)'` and `outcome:"deployed"`. Today it wrote `deploy_failed` with an empty URL —
and the *independent* production probe agrees with it: the alias still serves `49dbce7a` from
`2026-07-24T17:20:23Z`. **The script's verdict and the live site now say the same thing**, which is the
entire point of F-1049-1 and could not be demonstrated by any test.

**The outage is NOT over, and no one should read this review as saying it is.** The family is still on a
build from 2026-07-24. What changed is that the factory can no longer be fooled about it.

**F-1050-1 remains UNEXERCISED, deliberately recorded as such:** no deployment URL was ever captured, so
the deployment-URL-vs-production-alias divergence could not be tested. My wrapper read the alias directly
instead. The finding stands as written and still wants a successful deploy to settle it.

**Cause, from wrangler's own log** (the breadcrumb the predecessor `ab528c3f` added — this is the second
time it has paid for itself): `wrangler-2026-07-25_17-33-36_612.log` contains **9× `UND_ERR_HEADERS_TIMEOUT`**
and 9× `fetch failed`, and **zero** auth failures. Same fingerprint as yesterday. F-1049-2 holds: **it is
not auth, and `wrangler login` is still the wrong move.**

### F-1050-3 — the upload is 3.6× bigger than the factory has been telling itself. NEW, measured this fire.
Every recent note sizes the payload at "~118MB". I measured `dist/` directly instead of repeating it:

| | |
|---|---|
| **Total** | **443,984,185 bytes = 423.4 MB across 3,054 files** |
| `.glb` | 306.8 MB (72%) |
| `.png` | 80.8 MB |
| `.webp` | 23.2 MB · `.mp3` 9.0 MB · `.js` 3.6 MB · `.css` 0.1 MB |

The 118MB figure is the **asset-diet's runtime number** (93.8MB dieted GLBs + 24.3MB dieted PNGs = 118.1MB) —
what the *game requests on first town*, which is what that gate was built to measure. It was never what
`wrangler pages deploy` uploads, and somewhere the two got conflated. **The deploy pushes the full 423.4 MB.**

That reframes the timeouts from bad luck into arithmetic: 423.4 MB over the owner's line (reported <10Mbit
by s1049 — *inherited, not measured by me*) is ~6 minutes of transfer at the theoretical best, against
undici's 300s per-request header timeout. Every attempt has died at ~15.5 minutes. **Shrinking what gets
uploaded is the lever; retrying the same 423 MB is not.** This crosses what ships to players, so it is an
owner/attended call, not something a fire may author — it is on the OWNER'S DESK with a recommendation.
