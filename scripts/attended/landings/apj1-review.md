**Slice / branch / tip:** `api-probe-json-1`, lane-c `sol/map-art-campaign-2` (the branch name is history; the commits are path-scoped), `c8ddf96b2` (the probes and the guard), `4ef388aa6` (evidence), `782f9c548` (attended: the alarm-clock stub, the evidence rename), Astra gpt-6-astra, 74,799 tokens, 2026-10-09 08:30Z to 08:35Z. Attended landing, hash unchanged (`scripts/`, `ops/`, `package.json` roster only).

**What it does.** During the Option B cutover the droplet verifier refused `/api/stats` ("expected healthy 200 JSON") while both edge probes said `api=200`: with Cloudflare's daily Workers/Pages Functions cap exhausted, Pages answers Function routes with the SPA's `index.html` and HTTP 200, and a status-only probe cannot tell (F-CUT-1). Both probes now classify the API answer with one function: 200 plus `application/json` plus a body that parses to `{ok:true, stats:{…}}` (the shape `functions/api/stats.ts` always returns) is `api=200`; HTML is `api=200-html`, another type or an unparsable body `api=200-notjson`, a 2xx whose transfer failed `api=2xx-incomplete`; everything else is the code as before. The value carries the class, so the dashboard's `landing=… game=… api=…` line and the mail name the failure without a new field. A guard runs each probe's classifier against fake 200 HTML, JSON, bad-JSON and incomplete answers (32 cases) and is rostered.

**Evidence (real numbers).**

| Check | Result |
|---|---|
| `scripts/edge-probe-json.test.mjs` | 32 of 32 (rostered in `test:node-guards`; this landing's named guard) |
| `scripts/edge-alarm-clock-guard.test.mjs` | Astra: 3 of 9 (its curl stub answered only a status code, so `GOOD_PASS` read the API as dark; outside its firewall, reported); attended fix: the stub answers `/api/stats` with `{"ok":true,"stats":{}}` and `200 application/json` whatever the scenario, the arms' subject being the landing and game transitions: 9 of 9 |
| `scripts/edge-probe-composite-guard.test.mjs` | 7 of 7 |
| `scripts/gate-caller-audit.test.mjs` | 45 of 45 after the control copy under `artifacts/api-probe-json-1/control/scripts/` was renamed `.txt` (the third evidence-name orphan today) |
| `bash scripts/health-watch.sh status` against the live county | `landing=200 game=200 api=200` (re-run attended after the cutover) |
| Live capture of the fallback | one bounded request during the cap: HTTP 200, `text/html; charset=utf-8`, a 2,100-byte SPA document (`live-api.headers`, `live-api.body`); no load generated |
| tsc / build | exit 0 / exit 0 |
| Merge | `git merge-tree` clean against main (0 conflicts) |

**Merge classification.** Base: main at the chain cut. Lane-touched: `scripts/health-watch.sh` (the api check), `ops/droplet/edge-watch.sh` (the api check), `package.json` (one roster entry), `scripts/edge-alarm-clock-guard.test.mjs` (the stub, attended). New: `scripts/edge-probe-json.test.mjs`, `artifacts/api-probe-json-1/**`. No `src/**`.

**Findings.**
- **The droplet copy is not live until applied:** `ops/droplet/edge-watch.sh` runs on the droplet from its own copy; applying it is a write on the box and waits for the owner's word (a one-line scp; the timer picks it up).
- **F-APJ1-1 (pattern, recorded):** three Astra runs today left a copy of a test under `artifacts/` with a `.test.mjs` name; the author-task checklist now says evidence copies are `.txt`.
