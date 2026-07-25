# Deploy path — the false green (s1049 diagnosis)

**Slice:** none (no merge). This is a **diagnosis of `scripts/deploy.sh` on main @ `691c5274`**, opened because s1048's F-1048-4 asked the next fire to *"confirm the `Error: {}` cause before anyone touches auth."*
**Verdict:** ⛔ **THE DEPLOY PATH HAS BEEN REPORTING SUCCESS WHILE PUBLISHING NOTHING FOR ~23.5 HOURS.** The cause is confirmed and it is **not auth**. Three findings below; all VERIFIED by file/log/network probe, none inferred.

---

## The one-line owner answer

**The family is playing build `49dbce7a`, built `2026-07-24T17:20Z` — 174 commits ago.** The whole Opus-5 3D night (E9 + E10 town wardrobes, the Twin Banks braid, the deepwater wave counter) has never reached them, **even though `logs/deploy.log` says `DEPLOYED ok` at 21:47:08 yesterday evening.**

Probed, not assumed:

```
$ node -e fetch('https://gold-rush-3in.pages.dev/version.json')
HTTP 200: {"build":"49dbce7a","builtAt":"2026-07-24T17:20:23Z"}

local dist/version.json: {"build":"dec695a7","builtAt":"2026-07-25T16:03:40Z"}
```

`deploy.sh:32` writes that file into `dist/` immediately before upload, so it is a direct read of *what actually got published*. If the 21:47:08 run had published, the live value would be its build id. It is not.

---

## F-1049-1 — CRITICAL — `deploy.sh` declares success on a failed deploy

`deploy.sh:67` decides success by **wrangler's exit code alone**:

```bash
if wrangler pages deploy --commit-dirty=true > "$CAPTURE" 2>&1; then
  URL=$(grep -oE 'https://[a-z0-9.-]+\.pages\.dev' "$CAPTURE" | tail -1)
  note "DEPLOYED ok ${URL:-'(url in log)'}"
```

**wrangler 4.107.0 exits 0 after a fatal upload failure**, because it crashes inside its own error-exit path. Captured verbatim in `logs/deploy.log:194565-194591` (the 21:41:51 run):

```
Uploading... (1335/3053)
✘ [ERROR] A file or directory could not be found.
  Error: Failed to upload files. Please try again. Error: {"errno":-2,"code":"ENOENT",...}

This error originated either by throwing inside of an async function without a catch block...
TypeError [ERR_INVALID_ARG_TYPE]: The "code" argument must be of type number. Received type string ('ENOENT')
    at process.set [as exitCode] (node:internal/bootstrap/node:119:9)
    at process.exit (node:internal/process/per_thread:231:24)
[deploy] 2026-07-25 21:47:08 DEPLOYED ok '(url in log)'
```

wrangler tried `process.exit('ENOENT')`, Node rejected the string exit code, the intended non-zero **never got set**, and the shell saw success.

**The tell was already in the log and nothing was reading it:** a real deploy always prints a `*.pages.dev` URL — every genuine success in `logs/deploy.log` has one. This run printed **none**, so `${URL:-...}` fell through to the literal `'(url in log)'`. **`deploy.sh` greps for the URL at `:69` and then does not require it.**

**FIX (must be in the corrective):** success requires a non-empty `pages.dev` URL in `$CAPTURE`, *in addition to* rc=0. An empty URL is a failure, whatever wrangler's exit code says. Consider also bumping wrangler (`4.114.0` is available per its own banner) — but the URL check is the durable guard, since it does not depend on any vendor's exit-code hygiene.

> This is the **same vacuous-guard family** as F-1047-1 (a budget check that skipped all 4 tests and looked green) and F-1044-1 (four editor guards that died in setup) — now on the last mile, where it silently costs the players everything the factory built.

## F-1049-2 — HIGH — the failure is a transport timeout; the advice printed is auth

`deploy.sh:74` prints one hardcoded diagnosis for every failure — *"auth expired? project missing? owner: wrangler login / pages project create gold-rush"*. **All three of today's runs failed on the same thing, and it was never auth:**

| deploy.sh run (local) | wrangler log | `UND_ERR_HEADERS_TIMEOUT` | ENOENT | outcome logged |
|---|---|---|---|---|
| 21:25:49 | `…14-26-04_259.log` | 3 | 0 | **no terminal line at all** (F-1049-4) |
| 21:41:51 | `…14-41-51_856.log` | 3 | 2 | `DEPLOYED ok` ❌ **false green** |
| 23:03:59 | `…16-03-59_520.log` | 8 | 0 | `FAILED … auth expired?` ❌ **wrong cause** |

Auth was healthy in the failing run, proven positively: **5 CF API responses, all `OK 200`, zero non-200** (`grep -c "START CF API RESPONSE: OK 200"` = 5; the non-200 grep returns empty). The account/project GET and the `upload-token` fetch both succeeded — a deploy that reaches `Uploading... (1335/3053)` has already authenticated.

The real error, 8× in the last run, ending it:

```
failed: TypeError: fetch failed
  [cause]: HeadersTimeoutError: Headers Timeout Error
    code: 'UND_ERR_HEADERS_TIMEOUT'
```

That is undici giving up waiting for response headers — consistent with ~118MB of `dist/` over the owner's <10Mbit line. **An owner following the printed advice would re-authenticate successfully and still fail.**

**FIX:** on failure, pull the wrangler log path out of `$CAPTURE` (wrangler prints it: `🪵 Logs were written to "…"`) and print the distinct `code: '…'` values found in it. The whole diagnosis above took one grep of a file whose path was already sitting in the log.

## F-1049-3 — HIGH — the `dist/` clobber is **gate builds**, not a second deploy

s1048 attributed the ENOENT to a second `deploy.sh` overlapping the first, and specced F-1048-5 as *an exclusive lock on deploy.sh, **or** an immutable snapshot*. The evidence says the lock alone is **not sufficient**:

The 21:41:51 upload died on `dist/assets/index-CQNr9KPZ-diet-576343bc.js` **while that upload was the only deploy running** — its own parent had finished building at 21:41:37, before wrangler started. The file was removed from under it by **a different process building at repo root**. Every fire's gate runs `npm run build`, and `npm run build` rewrites `dist/` with content-hashed names; `deploy.sh` uploads from that same live directory for 15+ minutes.

**So the collision surface is deploy-vs-every-gate, not deploy-vs-deploy** — and a lock only `deploy.sh` takes cannot see a gate build. **The snapshot is the required half:** copy `dist/` to an immutable temp dir after the budget leg and point wrangler at that. Keep the lock too (it fixes F-1049-4), but it is the second line, not the first.

## F-1049-4 — MEDIUM — an upload outlives the fire that started it

The 21:25:49 run logged `deploying…` at 21:26:03 and **never logged a terminal state** — no `DEPLOYED ok`, no `FAILED`, no `deploy-result.json` entry. Its fire exited while wrangler was still uploading. Uploads take 15+ minutes against a 5-minute fire cadence, so **every DEPLOY LAW call is a coin-flip on being orphaned mid-upload**, and an orphan leaves no record that it ever ran.

---

## What this changes for the drain that is coming

`tasks/lane-b-deploy-honest-and-serialized.md` was **already running when this diagnosis was made** (dispatched 23:31, from s1048's evidence). It was authored against F-1048-4/5 — *report the captured error* + *serialize deploys*. It therefore **cannot contain F-1049-1 (the URL check) or F-1049-3 (snapshot-not-lock)**, which are the two findings that actually explain the ~23.5-hour outage.

**Accept its output on its own terms if it delivers the five exit codes + the lock + a readable error — that work is all still correct and wanted.** Then take the follow-on: `tasks/lane-b-deploy-verify-published.md` (authored by this fire, deliberately **not queued** — queueing a second `deploy.sh` master while the first sits unmerged is the false-done trap where the successor's pre-flight STOPs behind its undrained predecessor).

**Do not re-authenticate anything.** Auth is fine and has been fine all day.
