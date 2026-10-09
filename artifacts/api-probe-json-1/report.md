---
source: codex
project: Gold Rush
date: 2026-10-09
type: digest
---
# API edge probes reject the SPA fallback

READY-FOR-GATES: NO — implementation complete within scope; firewall stop on an adjacent guard that needs updating.

## Root cause and change

Both watchdogs previously discarded the body and checked only the HTTP status. Pages can serve the SPA HTML with status 200 when Functions are unavailable. Both API probes now fetch body, HTTP code, and content type in one request and demand `application/json` (case insensitive, optional parameters), parseable JSON, `ok: true`, and a non-array `stats` object. Both successful paths in `functions/api/stats.ts`, including `emptyPayload()`, provide those keys.

Values: `api=200` for a healthy response; `api=200-html` for HTML content type; `api=200-notjson` for other content types, invalid JSON, or an invalid payload; `api=2xx-incomplete` for an unsuccessful 2xx transfer; existing HTTP error codes and `000` otherwise. Failures remain inside the existing api value and enter the unchanged DARK classification. Landing/game checks and mail logic are unchanged.

The Mac parser resolves Node from PATH with the installed `/opt/homebrew/bin/node` as its launchd fallback. Its plist supplies no PATH and the launchd PATH is unset. The guard exercises the Mac probe under `/usr/bin:/bin:/usr/sbin:/sbin`. The droplet uses its existing Node prerequisite, also used by its route verifier; no remote verification or deployment was performed.

`change.diff` contains the tracked implementation/roster diff. `scripts/edge-probe-json.test.mjs` adds 16 behavioral cases for each real probe/classifier block, and is permanently rostered in `test:node-guards`.

## Pre-flight and adaptations

- Starting branch: `sol/map-art-campaign-2`; starting commit: `69bdb1d8500ca6428a4b5959119f920e3601e802`.
- Clean worktree, zero commits in `main..HEAD`; no reset, clean, or evidence discard needed. Main was `a3b8a8216dfa1b5fd9f729a3da4aae5808e4d173` when checked.
- Task contradicts itself about installing dependencies. Honored its explicit “do NOT run npm install/npm ci”. Existing node_modules is a directory here, despite the task describing a symlink. No dependency changes.
- Baseline `npm run build`: exit 0 before edits. Worktree remained clean afterward.
- Route verifier is absent in this lane; read the requested file from the primary checkout. No separate spec path or gate-caller audit note was attached to the task; read the audit source, GUARDS roster, existing probe guards, and the vault note about untracked caller audits.
- Vault writes omitted because the task's explicit TOUCH-ONLY firewall excludes the vault; this report is the durable handoff.

## Verification

| Check | Result | Evidence |
| --- | --- | --- |
| bash syntax, both probes | exit 0 | `bash -n scripts/health-watch.sh ops/droplet/edge-watch.sh` |
| New API guard | 32/32, exit 0 | guard.log |
| Gate-caller tests | 45/45, exit 0 | gate-caller.log |
| Real caller audit including untracked test | exit 0; new guard reached | roster.log, roster-report.log |
| Existing composite probe guard | 7/7 | tests.log |
| Existing alarm-clock guard on changed source | 3/9; 6 failures | tests.log |
| Same unmodified alarm-clock guard on pre-task source | 9/9, exit 0 | alarm-baseline.log; control/ contains frozen inputs |
| TypeScript | exit 0 | tsc.log |
| Final production build | exit 0 | build.log |
| Implementation diff whitespace | exit 0 before artifacts were staged | `git diff --check` |
| src unchanged | empty diff against starting commit | src tree `0ad2e09525f941a4d5d5c2e5176306c0efbbd4c0` |

Combined test run: 87/93 pass, exit 1, entirely attributable to the six alarm-clock cases. The old fixture supplies only a status for every URL, never a JSON body/content type. Its GOOD_PASS therefore becomes dark correctly. Its SLOW_PASS sends an unfinished transfer for the API too; the task now requires that unverifiable API response to be dark, while landing/game still remain slow. Alarm-clock tests and mail logic were not modified. This is a change-induced fixture/contract incompatibility, not a pre-existing red.

## Live evidence

At 2026-10-09 15:33 Asia/Bangkok, `bash scripts/health-watch.sh status` exited 0 and printed:

```text
landing=200 game=200 api=200-html
```

One additional bounded request captured HTTP 200, `text/html; charset=utf-8`, and a 2,100-byte SPA document titled Gold Rush in `live-api.headers`, `live-api.body`, and `live-api-summary.txt`. No load was generated to provoke the fallback. The requested all-200 live acceptance cannot honestly pass while the API serves HTML; the new alarm is reporting the real outage. Fixture cases prove healthy JSON still prints all 200.

## Remaining list in order

1. Orchestrator must authorize/adapt `scripts/edge-alarm-clock-guard.test.mjs`, outside this task's firewall: provide healthy JSON for the API while testing landing/game slow transitions, and retain separate assertions for API failures entering DARK. Then rerun the adjacent guard and battery.
2. Restore the live API outside this task and rerun the live status acceptance. No SSH, deployment, live repairs, or mail sends were performed.
3. Integrate and deploy the two probe changes through the normal gates after these blockers are resolved.

Implementation commit: `c8ddf96b2` (`fix: reject HTML fallback in API edge probes`). This final evidence clarification follows in a separate path-scoped report commit.

The staged whole-artifact whitespace check warned on raw curl CRLF headers, captured test/build output, and embedded unified-diff context lines. These evidence bytes were preserved; implementation whitespace was clean.
