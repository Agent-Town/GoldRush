# Drain review: `localhost-cors-2`, the eight doors refuse a localhost origin unless the development switch says otherwise (Opus 5.5 implementer at max effort; F-SEC2-2, F-SF1-1, F-SF1-8)

**Branch** `fix/localhost-cors-2` at `bc2ad19de` · **merge** `80854592d` · engine hash unchanged (`642edcf6`, no pin) · drained attended 2026-09-26 10:57Z in a detached chain worktree with the scratch store at `5793a96`; deployed (scripts/attended/land.sh, config `lc2`).

**Verdict: LANDED.**

## What it does
Every county door (`_accounts`, `_bugs`, `redeem`, `standings`, `refusals`, `telemetry`, `stats`, `_multiplayer`) now decides whether a localhost origin may talk to it through one helper, `functions/api/_cors.ts`, which reads exactly one variable, `ALLOW_LOCALHOST_ORIGINS`, and admits only the value `1`. Before this slice the doors admitted localhost on Pages production, on the droplet, on a misspelled value, and in development whenever the mail key was set: 134 of 782 probe rows off the rule across all 22 CORS entry points. After: 0 of 782. Two deliberately broken helpers were caught by the same probe (accept any value: 44 rows; remove the switch: 134), and the helper was restored byte for byte. `RESEND_API_KEY` is no longer read on any CORS path. The three local harnesses (`test-accounts`, `test-multiplayer`, `test-stats`), the six multiplayer specs and `assay-season-roll` pass the switch to the dev runs they start; `tl-02` asserts 403 with no header without the switch and 204 with it. `.dev.vars` is gitignored, `.dev.vars.example` is tracked, and the ops runbook says never to set the switch on Pages. Only `wrangler pages dev` and `wrangler dev` read `.dev.vars` (measured at runtime: 403 without the file, 204 with it); the vite dev server runs no functions, the droplet never forwards the variable, no deploy path reads it.

## Evidence (the implementer's locked batch on `bc2ad19de`, 04:25Z to 04:59Z, load 49 falling to 9; the drain's own gates are appended below)
| Check | Result |
| --- | --- |
| tsc / `npm run build` | rc 0 / rc 0 (2933 modules, no tracked file changed) |
| the probe, 22 CORS entry points of 8 doors | before 134 of 782 rows off the rule; after 0 of 782; two manufactured defects caught (44, 134) |
| `test:accounts` / `test:mp` / `test:stats` | rc 0 (241 checks) / rc 0 (528) / rc 0 (87 + 617 + 617 + 26) |
| guards parsing these files (cors allowlist, worker types, security headers, ratelimit window, citations, em-dashes, gate callers) | 81 of 81; source and law pointers PASS; engine hash equal to the pin (functions, e2e and the test scripts are not engine inputs) |
| `test:node-guards`, every leg alone | 1032 tests, 5 fail, plus leg 6 rc 2: all attributed to the scratch worktree (no `.env.local`, so `GR_DROPLET_HOST` missing: 15; the desk-declaration guard refusing a linked worktree whose STATUS.md lags main: 1; contention during the full battery, green alone: 1); the six red files run alone on the cut and on the tip are identical (70 tests, 16 fail each side) |
| e2e, 18 specs, both projects, one worker | 132 passed, 21 failed, 12 skipped (the specs' own mobile skips), 9 did not run; 21 of 21 reds reproduce on the cut `39f88d36f` test for test in a detached control worktree; none is a CORS refusal (0 `cors_forbidden` in the tip log and the relay traces); the slice's own specs green: tl-02 8 of 8, mp-06-party-overview 4 of 4, mp-arsenal 2 of 2, agent-seat 1 of 1, mp-reconnect 1 of 1 |

## Merge classification
Base `39f88d36f`. Main moved since the cut on STATUS.md, the ledger, im2's tools and the attended desk rows; no file both sides touched (the two changed-name lists share nothing; `git merge-tree` reports a clean tree). Every changed path is LANE-TOUCHED only: the eight doors and the NEW helper; `.gitignore` (one appended rule); NEW `.dev.vars.example`; `docs/ops/ops-evening-2026-09.md`; nine e2e specs; three harness scripts; `artifacts/localhost-cors-2/**` (46 evidence files, the report among them). All 23 non-evidence paths sit on the amended master's TOUCH-ONLY list (the named lift for `.gitignore`, `tl-02`, the six multiplayer specs, `assay-season-roll` and the 308 argument).

## Findings
- **F-LC2-5 (OWNER'S DESK, declared by the cure before any deploy):** after the deploy a locally served game that talks to the live county (`src/app/GameApi.ts:5` targets agenttown.app) is refused by every door; intended by F-SEC2-2. This landing merges WITHOUT deploying; the deploy waits for the owner's word.
- **F-LC2-6 (OWNER'S DESK):** whether `.env.local` should keep reaching local wrangler servers in the primary checkout (creating `.dev.vars` switches that off).
- **F-LC2-7 (open, no caller):** `playwright.accounts.config.ts:22` and `scripts/agent-seat-room.mjs` send loopback origins without the switch; nothing reds today. DEFERRED (owner ruling 2026-09-26: no further hygiene slices).
- **F-LC2-12:** only the stats door's rule is gated by a test (`tl-02`); the probe covers all eight doors as evidence, not as a gate. DEFERRED as a hygiene slice per the same ruling; the probe stays in `artifacts/localhost-cors-2/`.
- **F-LC2-13 (pre-existing on main, not this slice's):** 21 e2e tests in 9 spec files red on the cut exactly as on the tip: standings submissions answered 400 or `stored: true` where the specs expect 200 or `stored: false` (`field-book:129`, `mp-07c-4-reckoning:53`, `lb-01-county-standings:387`, the empty boards of `assay-season-roll:105` and `:149`); the wardrobe option text drift (`cosmetic-grants:65`); gameplay flows timing out (`lb-01-county-standings:654`, `milk-county-board:446`, `tl-01-run-telemetry:229`); the town ride never `connected` (`second-rider:28`, `mp-02-lockstep:687`). The drain's red-inventory lookup for the nine files is recorded in the handover; the five standings 400s are triaged separately because a door refusing a legitimate reel would be player-facing.
- **F-LC2-11:** a rotted pointer in the accounts comment (`server/ledger/serve.mjs:119` named the wrong function); rewritten in passing.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 154 ℹ fail 0` |
| the ledger battery | `rc=0 ℹ tests 1263 ℹ pass 1260 ℹ fail 0 ℹ skipped 3` |
| the three functions gates | `accounts rc=0 / mp rc=0 / stats rc=0` |
| e2e both projects, --workers=1 | `rc=0   38 passed (2.9m)  10:38Z` |
| full npm run test:node-guards (before the pin) | `rc=0 ℹ tests 1037 ℹ pass 1032 ℹ fail 0 ℹ skipped 5 ℹ tests 87 ℹ pass 87 ℹ fail 0 ℹ skipped 0  10:57Z` |
| engine hash | `merged: 642edcf65fcab2089164c6f33cfabf4a1a9805735a3b6df6f33dfa947cb6a32a (pinned 642edcf65fcab2089164c6f33cfabf4a1a9805735a3b6df6f33dfa947cb6a32a)` |

## Post-deploy verification (attended, 2026-09-26 11:00Z, read-only OPTIONS preflights against production)
| Host | Door | Origin | Answer |
| --- | --- | --- | --- |
| agenttown.app and gold-rush-3in.pages.dev | `/api/stats` | `http://localhost:5173`, `http://127.0.0.1:5188` | 403, no allow-origin header |
| both | `/api/stats` | `https://agenttown.app` | 204, `access-control-allow-origin: https://agenttown.app` |
| both | `/api/standings?contract=the-claim` | the two localhost origins | 403, no header |
| both | `/api/standings?contract=the-claim` | `https://agenttown.app` | 204 with the header |
| both | `/api/accounts/health` (not a route) | every origin | 405 with `access-control-allow-origin: *` |

F-SEC2-2 is effective in production: the localhost arm is closed on the stats and standings doors of both hosts, the site origin is admitted. **Observation F-LC2-14 (non-blocking):** an unknown accounts subpath answers 405 with a wildcard allow-origin on every origin; nothing is served behind a 405 and the eight doors' own CORS paths were probed 0 of 782 off the rule, so this is the platform's or router's default on a method refusal, recorded for the next accounts slice to read, not this landing's defect. Deployed as `c5763d86`, droplet services restarted (assayer synced).
