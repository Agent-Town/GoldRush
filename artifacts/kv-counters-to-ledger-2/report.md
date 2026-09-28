# kv-counters-to-ledger-2: the co-op door's KV fallback keeps the real hour, and the Pages copy of standings moves to the ledger when bound (2026-09-25)

Implementer: Claude Opus 5.5 at maximum effort (the attended session's opus-max spawn), worktree `/Users/robin/Claude/Projects/wt-kv2`, branch `fix/kv-counters-to-ledger-2`, cut from main at `dec3196c5`. Pre-flight held: kv-counters-to-ledger-1 is on main (5 commits match its name), `functions/api/_ledger.ts` exists, `git log main..HEAD` was empty, 0 tracked modifications, `npm run build` green before any edit (`BUILD_EXIT=0`). Nothing was deployed, bound, migrated or spent, and no secret was generated. The live site, the county door and the droplet were never requested: the new rows and the instrument drive the doors in-process and open no socket (the standings rows call the handlers directly, because a fetch would follow a 308 to the live site), and the three functions gates ran local wrangler (`--ip 127.0.0.1`) exactly as the factory's gates always do (whether wrangler reports its own usage metrics was not checked).

**Verdict: READY-FOR-GATES.**

## Commits (path-scoped, prefix `fix:`, one concern each)
| commit | scope | files |
| --- | --- | --- |
| `4abe5075b` | 1 and 2: the co-op door on the shared hour, the census at seven | `functions/api/_multiplayer.ts`, `scripts/ratelimit-window.test.mjs` |
| `3ecce7bc6` | 3: the Pages copy of standings answers 308 when bound | `functions/api/standings.ts`, `scripts/test-standings.mjs` |
| `64d696c0f` | 5: the ops evening's step 9 | `docs/ops/ops-evening-2026-09.md` |
| this commit (the branch tip) | 4: this report, the instrument, its JSON and the logs | `artifacts/kv-counters-to-ledger-2/**` |

## What changed
1. **The co-op door on the shared hour (F-KV1-4).** `functions/api/_multiplayer.ts` imports `bumpCounter` from `./_ratelimit` and passes `RATE_TTL_SECONDS`. Its own limiter (base `:735-741`, a `kv.put` with `expirationTtl: RATE_TTL_SECONDS` on every admitted request) is deleted, and the comment that named this slice (base `:667-670`) now says what the fallback does. The limits (create 10, connect 30, inspect 120), the key `mp:ratelimit:<bucket>:<hash>` and `RATE_TTL_SECONDS = 60 * 60` are unchanged, and so is the ledger call in front of the fallback. The room worker (`wrangler.mp-room.toml` has this file as `main`) now bundles `_ratelimit.ts` too: pure functions, no top-level effects, no binding.
2. **The census, six to seven.** `scripts/ratelimit-window.test.mjs` lists `functions/api/_multiplayer.ts` among the limiter's importers, and the comment names F-KV1-4 and this task (text at the end). No other `scripts/*.test.mjs` mentions `_ratelimit` (grep: this file only), so no other guard changed.
3. **The Pages copy of standings answers 308 when bound (F-KV1-5).** `functions/api/standings.ts`: `STANDINGS_CANONICAL_ORIGIN` joins `StandingsEnv`; `onRequest` and `assayRequest` (which fronts the queue, verdict and re-assay handlers) first return `canonicalRedirect(context)` when it is not null: `308`, `Location` on the canonical origin with the same path and query, `Cache-Control: no-store`, the door's CORS headers, and no store call. Unbound, that first statement returns null and nothing else runs differently. The handler is not deleted: whether gold-rush-3in.pages.dev keeps a standings surface at all is the owner's decision (F-KV2-6).
4. **Measured**, below, with `measure-kv-writes.mjs` beside this file.
5. **The runbook.** `docs/ops/ops-evening-2026-09.md` Part C gains step 9 after step 8, in the same line: `wrangler pages secret put STANDINGS_CANONICAL_ORIGIN --project-name gold-rush` with `https://agenttown.app` (the road step 5 already uses, so `wrangler.toml` does not change), redeploy production, then `curl -si -X POST https://gold-rush-3in.pages.dev/api/standings` must answer `308` with `location: https://agenttown.app/api/standings`. Rollback: delete that secret and redeploy.

## Measured
`node artifacts/kv-counters-to-ledger-2/measure-kv-writes.mjs --out artifacts/kv-counters-to-ledger-2/kv-writes.json` on Node 26.4.0. The instrument is kv-counters-to-ledger-1's shape (vite's SSR transform of the doors, a KV stand-in that counts every call) with two additions: both columns come from one run (the two doors from `git show dec3196c5:<file>` for "before", from this tree for "after"; it refuses to run if anything else differs under `functions/`, `src/`, `assets/`, `server/`, and it found exactly the two doors), and the stand-in honours `expirationTtl` on a fixed clock.

### The co-op door's KV fallback (no ledger bound: production until the ops evening)
| measured | before (`dec3196c5`) | after (this tree) |
| --- | --- | --- |
| KV writes per admitted request (create / connect / inspect) | 1 / 1 / 1 | 1 / 1 / 1 |
| KV writes per refused attempt | 0 | 0 |
| TTL armed by a connect at minute 59 | 3600 s (the hour restarts) | 60 s (the remainder) |
| stored counter after connects at minutes 0, 59 and 60 | `3` (the count carried on) | `1:<minute-60 instant>` (a new window) |
| a rider who spends the 30 connects in minutes 0 to 29 is let back in at | minute 89 | minute 60 |
| a rider who connects every 10 minutes for 6 hours (36 connects, 6 an hour) | refused 5, from minute 300 | refused 0 |

The write count does not move, because the fallback writes its counter once per admitted request either way. What moves is the window: before, every admitted write pushed the hour out, so a rider far under the limit was refused five hours into a session.

### The Pages standings door (KV calls per request at gold-rush-3in.pages.dev)
| request | unbound, before | unbound, after | bound, before | bound, after |
| --- | --- | --- | --- | --- |
| POST with no body (the step-9 probe) | 415, 2 calls (1 write) | 415, 2 (1 write) | 415, 2 (1 write) | **308, 0** |
| POST an accepted submission | 200, 49 (4 writes) | 200, 49 (4 writes) | 200, 49 (4 writes) | **308, 0** |
| POST a refused submission (unsecured) | 400, 4 (2 writes) | 400, 4 (2 writes) | 400, 4 (2 writes) | **308, 0** |
| GET a board | 200, 1 (0 writes) | 200, 1 (0 writes) | 200, 1 (0 writes) | **308, 0** |
| GET the assay queue (assayer key) | 200, 44 (1 write) | 200, 44 (1 write) | 200, 44 (1 write) | **308, 0** |

"Bound, before" is the variable set on the base code, which does not read it. Every bound-after `Location` is `https://agenttown.app` plus the request's own path and query.

### F-KV2-1 in numbers (the same connect door, the stand-in enforcing Cloudflare KV's 60-second TTL floor)
| connect at | 59:00 | 59:01 | 59:30 | 59:59 | 60:00 |
| --- | --- | --- | --- | --- | --- |
| before | admitted | admitted | admitted | admitted | admitted |
| after | admitted | **refused 429** | **refused 429** | **refused 429** | admitted |

## RED first, then GREEN (the full runs are in `red-green/` beside this file; Node 26.4.0)
Scope 1, the co-op rows against the base door (`red-green/scope1-red.log`: HEAD `dec3196c5`, `_multiplayer.ts` unchanged, only the test file changed):
```
✖ the co-op door (KV fallback): a connect admitted at minute 59 does not extend its window
  AssertionError [ERR_ASSERTION]: the write at minute 59 must arm the REMAINDER of the hour (at most 60 s), not a fresh hour: it armed 3600 s
✖ the co-op door (KV fallback): the count restarts at the hour measured from the first connect
    actual: '3',
    expected: '1:1790330400000',
✖ the co-op door (KV fallback): a rider who filled the limit is let back in at the hour, not an hour after the last connect
    actual: 429,
    expected: 426,
ℹ tests 9  ℹ pass 6  ℹ fail 3
```
The door moved, the census still at six (`red-green/scope1-census-red.log`): the three co-op rows pass and the census row reds on the seventh importer, `'functions/api/_multiplayer.ts'` (`ℹ pass 8 ℹ fail 1`). At the change (`red-green/scope1-green.log`): `ℹ tests 9 ℹ pass 9 ℹ fail 0`.

Scope 3, the canonical-origin rows against the base standings door (`red-green/scope3-red.log`: HEAD `4abe5075b`, `standings.ts` unchanged, only the test file changed); every earlier row of the file ran green first:
```
AssertionError [ERR_ASSERTION]: the board POST: bound to the canonical origin, the Pages copy answers 308
200 !== 308
```
At the change (`red-green/scope3-green.log`): `standings assay kv checks passed (413)`, `standings assay sqlite checks passed (413)`, exit 0.

## Gates
| gate | before | after (tip `64d696c0f`) |
| --- | --- | --- |
| `npx tsc --noEmit` | green (inside the pre-flight build) | rc 0 |
| `npm run build` | `BUILD_EXIT=0` (pre-flight) | `BUILD_EXIT=0` (`build-tip.txt`) |
| `npm run test:accounts` | 241 checks, rc 0 (Node 23.11.1, locked) | 241 checks (43 + 43 + 27 + 26 + 86 + 16), rc 0 on Node 26.4.0 and again on 23.11.1 (locked) |
| `npm run test:mp` | 528 checks, rc 0 (Node 23.11.1, locked) | 528 checks, rc 0 on Node 26.4.0 and again on 23.11.1 (locked); unchanged because the co-op rows live in the rate-limit test |
| `npm run test:stats` | stats 87, standings 372 + 372, then rc 1 in `test-ledger-worker.mjs` on the Node version assert (Node 23.11.1, locked); on Node 26.4.0 standings 372 + 372 and ledger worker 26, rc 0 | stats 87, standings **413 + 413** (41 new checks per backend), ledger worker 26, rc 0 (Node 26.4.0, locked) |
| `scripts/ratelimit-window.test.mjs` | 6 of 6 | 9 of 9 |
| `GR_GUARD_NO_ARTIFACT=1 npm run test:node-guards` | its reds and its remainder run on the base as a control (below) | `run-node-guards.mjs`: 1018 tests, 1009 pass, **4 fail (environment, attributed below)**, 5 skipped; the rest of the chain, run separately because `&&` stops at the first red: ticker, findings-state, blocker-panel, ruling-propagation, nul-audit rc 0, `test:review-fixes` with its nine appended files **85 of 85** (82 at kv1's drain, plus the 3 co-op rows), `test:desk-declaration` rc 2 (the same environment refusal) |

The before batch (`gates-before.log`) ran under the drain lock on the untouched base (its one modified file, the rate-limit test, is read by none of the three gates); the after batch (`gates-after.log`) ran under the lock at the tip on Node 26.4.0, the version `.nvmrc` pins and the attended landing puts first on its PATH (`scripts/attended/land.sh:13`), and repeated `test:accounts` and `test:mp` on Node 23.11.1 as the same-runtime pair for the before counts. The Node 26.4.0 standings and ledger-worker before counts are focused runs on the untouched base (`before-node26-focused.log`), the brief's allowance for focused suites.

### The battery's reds, attributed by a control
Every red at the tip is the worktree's environment, and each one reproduced on the base: `gates-rest.log` runs the failing files and the chain's remainder on `dec3196c5` in a detached scratch worktree with no `.env.local` (this worktree's own conditions; the shape of `scripts/attended/control.sh`, and the control worktree was removed afterwards).
| red at the tip | cause, in the red's own words | on the base (control) |
| --- | --- | --- |
| `desk-declaration-guard.test.mjs:163` "the live board is green under this guard" | the guard refuses in a linked worktree whose STATUS.md line 1 is not the one main carries; main has moved past this branch's point | the same refusal |
| `fixture-teardown.test.mjs:32` | its first failing child is `desk-declaration-guard.test.mjs`, the refusal above, quoted in its message (the sweep stops at the first failing child) | red |
| `ledger-backup-pull.test.mjs:11` and `:18` | "GR_DROPLET_HOST missing from the environment and .env.local"; this worktree carries no `.env.local`, by the standing rules | the same two rows |
| `npm run test:desk-declaration` rc 2 | the refusal above | rc 2 |

None of them reads a file this branch changes (STATUS.md, tasks/BACKLOG.md, `.env.local`). In the drain's chain worktree, which sits at main with `.env.local` copied in (`scripts/attended/land.sh:35-36`), they were green at kv1's landing (1013 of 1018 and 82 of 82, rc 0). The control also showed reds the tip does not have (an `agent-reels.test.mjs` child, `landmark-collision.test.mjs`, a later-era mounts row), all "Failed to load url ../../assets/pilots/...": `assets/pilots` is the relative link `../../GoldRush-assets/pilots`, which resolves from `/Users/robin/Claude/Projects/wt-kv2` and not from a scratchpad directory, so those rows describe the control's location, not either tree.

## Adapted
1. **The env field.** The master puts the variable "next to `LEDGER_PROXY_SECRET`", but `StandingsEnv` (`standings.ts:17-23` at the base) has no `LEDGER_PROXY_SECRET`; that field lives only in `_ledger.ts`'s `LedgerEnv` (`_ledger.ts:36`, firewalled), which is not this door's env. It went into `StandingsEnv`, the env the four handlers read.
2. **"Set and non-empty", made exact.** A value that is not a bare https origin (a path, a query, a fragment, credentials, or not a URL) is ignored, so the door stays as today instead of answering 500 or a malformed `Location`, and the step-9 probe shows the missing 308. Blank and whitespace count as unset. Six such values were proved byte-identical to unset, answer and store calls both.
3. **No redirect to itself.** A request already addressed to the canonical host is served, never moved. The droplet runs this file (`server/ledger/serve.mjs:16,27-32`) and sees its requests as http on that host (`serve.mjs:100`); its env is an allowlist without this variable (`serve.mjs:152-162`), so it never redirects today, and the host rule holds if someone adds it. Proved for `https://agenttown.app` and `http://agenttown.app`.
4. **The shape of the 308.** It carries `Cache-Control: no-store`, because a permanent redirect is cacheable by default and unbinding must undo it, and the door's CORS headers for an allowed `Origin`, so a browser may follow it. It also answers `OPTIONS` ("every request"), which a CORS preflight cannot follow; no in-repo browser code calls the pages.dev copy (`src/app/GameApi.ts:5,8` sends every API call to `https://agenttown.app`), and its callers are node scripts with a configurable base (`scripts/assay-worker.mjs:22,31-32`, `scripts/seed-ladder.mjs:134`, `scripts/assay-lineage-sweep.mjs:54-80`), for which a 308 keeps method, body and `x-assay-key`.
5. **The order.** The redirect comes before the CORS and assayer-key checks, so a request without the key is moved rather than refused; the key is checked where the board lives.
6. **Where the co-op rows live.** In `scripts/ratelimit-window.test.mjs` (it owns `withClock`; `scripts/test-multiplayer.mjs` has no clock helper), driving `connectRoom` itself through vite's SSR transform with vite's WebSocket server off, because a row on `_ratelimit.ts` alone is green on the base.
7. **RED kept as logs, not as red commits.** Each scope's commit carries its rows with its fix, so every commit is green; the RED runs are pasted above and kept in `red-green/` with the tree each run saw.

## Findings
- **F-KV2-1 (the shared limiter meets Cloudflare KV's 60-second TTL floor; the co-op door inherits it with this slice).** `_ratelimit.ts:61` floors the remainder at 1 s and `:62` passes it as `expirationTtl`; KV refuses an `expirationTtl` below 60 (Miniflare in wrangler 4.107.0, `miniflare/dist/src/workers/kv/namespace.worker.js:27,97-100`, "Expiration TTL must be at least 60", and the repo's own pin at `scripts/site-security-headers.test.mjs:168`; production inferred from Miniflare, not probed). So an admitted request in the last 59 seconds of a window throws in the put. Measured on the co-op door with a floor-enforcing stand-in: 59:01, 59:30 and 59:59 now answer 429 "The wire is busy." (they were admitted before), 59:00 and 60:00 are admitted. Every door that reaches the KV branch of `_ratelimit.ts` has had this since F-HEAT14-7 (telemetry answers 500 then, `telemetry.ts:133-138`; the others' answers were not traced). The cure is one line in a file this slice may not touch: `Math.max(60, ...)` at `_ratelimit.ts:61`, harmless to the window because the window's end is read from the stored start (`:53-55`), not from the key's expiry. Until the ledger is bound on the ops evening, the co-op door's production path is this fallback, so the cure should land with or before this slice's deploy, or the 59-second slice is accepted.
- **F-KV2-2 (a stale comment, firewalled).** `_ratelimit.ts:19-20` still says "the six doors that share it"; there are seven. One line for whoever lands F-KV2-1.
- **F-KV2-3 (until the ops evening, measured).** Unbound, the Pages standings copy spends the shared KV on requests nothing limits: a bare POST costs 1 read and 1 write (the refusal record), a refused submission with a rider id and a profile 2 and 2, because refusals are recorded before any limiter (base `standings.ts:967-972` and `:1079-1092`, `refusals.ts:102-132`); an accepted POST costs 45 reads and 4 writes and one assay-queue sweep 43 reads and 1 write. Step 9 takes all of it to zero (measured above).
- **F-KV2-4 (noted).** `_multiplayer.ts` keeps its own `clientIpHash`, byte-identical to `_ratelimit.ts:66-70` (compared with `diff`); left in place because the master moves only the limiter. If one is ever edited without the other, the co-op key shape splits from the other doors' hashing.
- **F-KV2-5 (pre-existing coordinate rot, noted).** `docs/bench/same-game-audit.md` cites `functions/api/standings.ts:1556` 630 times; the needle (`'weapon_toggle'`) is at `:1678` on the base (report regenerated 2026-09-14) and `:1686` at this tip (+8 from this slice). No guard reads those coordinates (`scripts/same-game-audit.test.mjs` pins counts and verbs); `node scripts/same-game-audit.mjs --write-report` at a drain refreshes them. `scripts/assay-standing-drop.test.mjs:18` cites `standings.ts:368-375`, which is comment prose on the base already.
- **F-KV2-6 (the owner's).** Whether gold-rush-3in.pages.dev keeps a standings surface at all. This slice moves it when bound and deletes nothing.
- **F-KV2-7 (environment, for the next spawn).** This implementer's shell resolves `node` to nvm's v23.11.1 (`which -a node`), while `.nvmrc` pins 26.4.0 and the attended landing puts `/opt/homebrew/bin` (26.4.0) first. On 23.11.1, `npm run test:stats` reds in `test-ledger-worker.mjs` on the assay worker's exact-version assert (`scripts/assay-replay-agent.mjs:35,50`), a red that is the shell's, not the code's (the control on the base reds identically). A spawn brief that names the PATH would save the next implementer the attribution.

## The census as changed (`scripts/ratelimit-window.test.mjs`)
```
  // The census of the doors that share this limiter. F-HEAT14-7's register and review counted six:
  // standings, accounts, telemetry, redeem, bugs, refusals. SEVEN since kv-counters-to-ledger-2
  // (F-KV1-4, 2026-09-25): multiplayer, whose KV fallback moved onto this limiter on purpose, so the
  // co-op door's hour is the ruled real hour too. If this census moves, the blast radius of a change
  // here moved with it.
  assert.deepEqual(callers.sort(), [
    'functions/api/_accounts.ts',
    'functions/api/_bugs.ts',
    'functions/api/_multiplayer.ts',
    ...
```

## Remaining, in order
1. The drain: gates on the merged tree, the review, the ledger row.
2. F-KV2-1: `Math.max(60, ...)` at `_ratelimit.ts:61` with or before this slice's deploy (with F-KV2-2's comment), or the 59-second slice accepted.
3. The ops evening, Part C step 9 (owner): bind, redeploy, probe the 308.
4. The owner's word on the pages.dev standings surface (F-KV2-6).
5. Optional: regenerate `docs/bench/same-game-audit.md` (F-KV2-5).
