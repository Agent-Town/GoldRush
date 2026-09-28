# sec-signin-hardening-1: the sign-in door, measured before and after

Implementer: Claude Opus 5, attended scratch worktree `/Users/robin/Claude/Projects/wt-sec1`, branch
`fix/sec-signin-hardening-1`, cut from main at `91ededde0`. Node 26.4.0 (`/opt/homebrew/bin`),
wrangler 4.107.0. Date 2026-09-24. Task master: `tasks/sec-signin-hardening-1.md`.
Source of the work: the outside review of 2026-09-24 (SEC-1, SEC-9, SEC-10) and the owner's word on
it, quoted in the master: "fix what is real, step by step".

**All seven scope items are done. Nothing is left on the REMAINING LIST.** Two things the master
asked me to decide and report rather than change are named in the OWNER / OPS section at the bottom.

Pre-flight, run before anything was touched: `git status --short` clean of tracked modifications
(no factory-churn exceptions needed), `git log main..HEAD` empty, `npm run build` green.

---

## 1. The parallel-guess numbers, before and after

Measured on THIS tree, not quoted from the review. The probe issues one dev code, then fires 50
wrong guesses at `/api/verify` with `Promise.all` against an in-memory `SqliteStorage`, counting
reads of the `code:<emailHash>` record: a read of that record is a guess that reached the digest
compare, so the count IS the number of evaluated guesses. `MAX_VERIFY_ATTEMPTS` is 5.

| measurement | BEFORE (main 91ededde0) | AFTER |
|---|---|---|
| guesses evaluated out of 50 parallel wrong ones | **50 of 50** | **5 of 50** |
| HTTP tally across the 50 | `401 invalid_code` x 50 | `401 invalid_code` x 4, `429 too_many_attempts` x 46 |
| stored `attempts:` counter after the flood | **1** (49 increments lost) | **50** (every guess counted) |
| the REAL code offered after the flood | **200, accepted** | **429 `too_many_attempts`** |
| 3 wrong guesses, then a new code, then 3 more | `401,401,401` / new code 200 / `401,401,401`, then the new code **accepted (200)** | `401,401,401` / new code 200 / `401,429,429`, then the new code **refused (429)** |
| `attempts:` row after a new code was requested | **null** (deleted by requestCode) | **7** (survives the new code) |
| `isDev` with `DEV_AUTH=1` AND the mail sender bound | **200 with `code: 687727`, `dev: true`, no mail sent** | **200 with `{ok:true}` only, no `code`, no `dev`, mail sent (1 call)** |

The review reproduced 109 of 200. At 50-wide parallelism on this machine the leak was total: every
guess was evaluated, because all 50 read the counter before any of them wrote it back, and the last
write stored 1.

### Why it leaked, and what replaced it

The old `verifyCode` read the counter, then awaited a KV read AND a SHA-256 digest, then wrote the
counter back (`_accounts.ts:146-157` on main). Two awaits inside a read-then-write window, last
writer wins. The fix has two halves:

- `server/ledger/storage.mjs` gained ONE atomic statement,
  `INSERT ... ON CONFLICT(key) DO UPDATE SET value = CAST(MAX(CAST(kv.value AS INTEGER), 0) + 1 AS TEXT) ... RETURNING value`,
  exposed as `increment(key, ttlSeconds)`. It returns the count THIS caller produced, so no two
  callers can be handed the same number; SQLite's own write lock serialises them across connections
  and processes, not just across awaits.
- `verifyCode` counts BEFORE it compares: `const attempt = await countAttempt(...)`, refuse when
  `attempt > MAX_VERIFY_ATTEMPTS`, and only then read the code record and compare the digest. The
  refusal is decided on the caller's own number, so the window the review exploited no longer exists.

`expirationTtl` is deliberately NOT re-armed on conflict: the budget window runs for one
`CODE_TTL_SECONDS` (10 min, unchanged) from the FIRST counted guess. That choice is what stops a
flood from extending a victim's lockout by continuing to knock - every refused guess still
increments, but it cannot push the window out.

### The honest limit: Cloudflare KV

KV has no atomic increment, so `countAttempt` falls back to a read-then-write there, with the read
and the write ADJACENT (no digest, no code read between them). A burst on the KV backend can still
share a count. What bounds it there is the new per-address cap plus the nginx `limit_req` below.
The live sign-in door is the droplet's sqlite ledger (nginx forwards
`/api/(request-code|verify|session|save/|delete-account)` to `127.0.0.1:8791`), which takes the
atomic path. Stated, not papered over; the permanent cure for KV is a Durable Object counter, which
is a bigger change than this task.

---

## 2. The caps

| door | key | cap | window | why this number |
|---|---|---|---|---|
| `/api/verify` per address (NEW) | `ratelimit:verify:<ip>` | **60** | **1 hour** (`bumpCounter`, fixed window) | 12 full 5-guess budgets an hour from one address. It cannot refuse a real sign-in: a real caller needs at most 5 guesses per code, and `MAX_REQUESTS_PER_EMAIL` (5 per 10 min) caps how many codes an address can even have issued. 60/hour is also the number the owner already ruled for an hour on this same limiter (F-HEAT14-7, `_ratelimit.ts` header). |
| `/api/verify` per email (value unchanged, now enforced) | `attempts:<emailHash>` | 5 | 10 min from the first guess | `MAX_VERIFY_ATTEMPTS`, kept as the master required. What changed is that it is now actually enforced under concurrency and is not wiped by a new code. |
| `/api/request-code` per email / per IP (untouched) | `ratelimit:email:<hash>` / `ratelimit:<ip>` | 5 / 20 | 10 min | pre-existing. |
| nginx, `/api/verify` (NEW, not applied) | `$binary_remote_addr` | 10r/m, burst 5 | rolling | see section 4. |

The verify bucket is deliberately SEPARATE from `ratelimit:<ip>`: a guess flood must not lock an
address out of asking for a code, and vice versa.

Residual arithmetic, stated plainly: a determined attacker against one email now gets 5 guesses per
10-minute window instead of 5 per code request (25 per 10 min before, and unbounded under the race),
capped further at 60/hour per address and 10/min per address at nginx. Against a 6-digit code that is
a ceiling of about 60 guesses per hour per address out of 1,000,000.

---

## 3. The `isDev` condition, and why it cannot be spoofed

```ts
function isDev(env: AccountsEnv): boolean {
  return env.DEV_AUTH === '1' && !env.RESEND_API_KEY;
}
```

The second condition is the **absence of the production mail sender binding**. Reasoning, as the
master asked (read how `serve.mjs` and the Pages env differ, then pick the one a request cannot
reach):

- `RESEND_API_KEY` is an ENVIRONMENT BINDING on both doors: a Pages project variable for the
  functions, and `process.env.RESEND_API_KEY` for the droplet ledger (`server/ledger/serve.mjs:119`).
  Nothing in the request path can set, clear or influence it. A caller has no reachable input that
  changes this value, which is exactly the property the master demanded.
- The alternative marker, a localhost host or a `127.0.0.1` origin, **is reachable by a request and
  was rejected for that reason**: the droplet forwards the caller's own `Host:` header to the ledger
  (`proxy_set_header Host $host` in `ops/droplet/agenttown.app.nginx.conf`, and this server block is
  the only one on 443, so a mismatched Host still lands here), and `Origin` is whatever the caller
  writes. Either could be made to say "localhost" from the public internet.
- Production always binds the sender (the droplet since 2026-08-24 per the nginx header comment;
  Pages for the accounts flow), so production can never satisfy the condition and a code is never
  returned there. The mis-set case now takes the MAIL path: measured 200, `{ok:true}`, no `code`,
  no `dev`, exactly one call to the sender.
- Dev boxes that want dev codes simply leave the sender unbound, which is what every fixture in the
  repo already does: `scripts/test-accounts.mjs` `cleanEnv()` deletes `RESEND_API_KEY`,
  `playwright.accounts.config.ts` and `e2e/ratelimit-429-net.spec.ts` bind only `DEV_AUTH=1`. No
  fixture had to change.
- The UI degrades correctly with no client change: `src/game/AccountSync.ts:133` already reads
  `response.dev && response.code ? 'Dev code: ...' : 'Check the email for the 6-digit code.'`.

---

## 4. The nginx lines (written to the repo mirror ONLY; the live box was not touched)

`ops/droplet/agenttown.app.nginx.conf`. The zone is at the file's top level because a sites-enabled
file is included inside `http`, and `limit_req_zone` is not valid in a `server` or `location` block:

```nginx
limit_req_zone $binary_remote_addr zone=verify_guesses:10m rate=10r/m;
```

and inside the server block, an EXACT-match location (nginx resolves `=` matches before any regex, so
it wins over the existing `location ~ ^/api/(request-code|verify|...)` regardless of order), with the
same proxy body as that regex location:

```nginx
    location = /api/verify {
        limit_req zone=verify_guesses burst=5 nodelay;
        limit_req_status 429;
        proxy_pass http://127.0.0.1:8791;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        error_page 502 503 504 = @ledger_resting;
    }
```

10r/m with `burst=5 nodelay` lets one address fire six verify requests back to back and then one
every six seconds. A real sign-in is one code and at most five typed guesses, so it never reaches
the limit; a flood pays a 429 at nginx before the worker, the sqlite book or the guess counter is
touched. `limit_req_status 429` replaces nginx's default 503 so the refusal is not mistaken for
`ledger_resting`.

**Not validated by `nginx -t`: nginx is not installed on this machine** (`which nginx` empty). The
directives were checked by hand against their documented contexts and argument forms. The owner's
droplet evening should still be: copy to `/etc/nginx/sites-enabled/agenttown.app.conf`, `nginx -t`,
`systemctl reload nginx`.

---

## 5. The office token: header, constant time, one deprecation release

- New shared module `functions/api/_compare.ts` holds `constantTimeEqual`, lifted verbatim from
  `standings.ts:565`. `standings.ts` and `_accounts.ts` now import it and their private copies are
  gone (two definitions became one), and `_bugs.ts` and `redeem.ts` import it as new callers.
- `_bugs.ts` `authorized()` reads `Authorization: Bearer <token>` first and compares it in constant
  time. **I KEPT the `?token=` query branch for one release**, as the master allowed, with a
  deprecation log line, because `e2e/bug-office-api.spec.ts:73,78` is still a query caller and
  `e2e/**` is outside this task's firewall. The query branch also compares in constant time. The
  branch and its log line are to be deleted once that spec sends the header; the code comment says so
  at the site.
- `redeem.ts:62-63` (the mint bearer) now compares with the same helper instead of `!==`.
- `scripts/fetch-bugs.mjs` sends `authorization: Bearer <token>` and no longer puts the token in the
  URL. **Deploy order matters**: an OLD script still works against a NEW deployment (the query branch
  survives one release), but this NEW script needs the deployed functions to carry this change before
  it can read the office again.
- Length still leaks in `constantTimeEqual` (the loop runs over the longer input). That is unchanged
  from what `standings.ts` shipped and is stated in the module comment; a secret's length is not the
  secret.

---

## 6. Tests

All new checks live in `scripts/test-accounts.mjs`, which `npm run test:accounts` already runs, so
they are rooted in a gate the drain runs (a new standalone file would have been an uncalled test and
would have reddened `gate-caller-audit`). They call the handlers DIRECTLY over an in-memory store
because the flood must interleave inside one isolate to reproduce the defect, each case needs its own
`CF-Connecting-IP` so the new per-address cap cannot leak between cases, and the `isDev` case must
stand up a mail sender binding without any request reaching `api.resend.com` (`globalThis.fetch` is
stubbed for that one call and restored in a `finally`).

New checks, 51 of them in two sections:

| check | what it pins |
|---|---|
| the store hands every concurrent caller its own count / no count is lost / the stored count equals the number of calls | `SqliteStorage.increment` is genuinely atomic: 50 concurrent increments return 50 distinct values, max 50 |
| the store refuses a counter with no window | `increment` validates its TTL like `put` does |
| parallel guesses evaluated at most the budget | 5 of 50, the headline number |
| every guess in the flood is charged through the store atomic counter | the door USES the atomic path (this is what catches a silent return to read-then-write) |
| all but the budget-closing guess answer 401 / every guess past the budget is refused on its own count | the exact 4 + 46 split |
| a budget spent by a flood refuses even the real code | the budget is really spent, not just reported |
| guesses 1-3, a new code, guess 4 survives, guess 5 closes the budget, the fresh code cannot be spent | a new code does not refill the budget |
| the per-address cap does not fire before its own number / caps one address by the hour / the refusal is `rate_limited`, not `too_many_attempts` | the 60/hour verify cap, and that it is distinguishable from the attempt limit |
| a dev box with no sender bound still returns the code / `DEV_AUTH` alone never returns a code once the sender is bound / the mis-set case takes the mail path | `isDev` needs both conditions |
| office: no credential declined, bearer reads, wrong bearer declined, bearer path logs nothing, query still reads for one release, the query credential is logged as deprecated, wrong query declined | the header is the supported form and the query is on notice |
| mint: no bearer declined, wrong bearer declined, right bearer mints | `redeem.ts` compares through the helper |
| six `constantTimeEqual` cases (exact, first byte, last byte, prefix, empty/empty, empty guess) | the helper's correctness |
| four doors import `./_compare` and none compares an operator secret with `===` or `!==` | structural, because a timing measurement in a gate is a flake generator |

### The new checks have teeth (each mutant restores one pre-fix behaviour; the suite must red)

| mutant | result |
|---|---|
| `countAttempt` never takes the atomic path (`if (false && kv.increment)`) | **RED** - "every guess in the flood is charged through the store atomic counter" |
| `requestCode` deletes `attempts:` again | **RED** - "guess 5 closes a budget the new code did not reset: expected too_many_attempts, got invalid_code" |
| `isDev` returns `DEV_AUTH === '1'` alone | **RED** - "the mis-set case takes the mail path, not the dev path: expected 1, got 0" |
| the per-address `bumpCounter` on verify removed | **RED** - "past the per-address number the refusal is a rate limit, not an attempt limit: expected rate_limited, got too_many_attempts" |
| `_bugs.ts` back to a query-only `===` compare | **RED** - "the office reads for a bearer token: expected 200, got 404" |

The first mutant initially SURVIVED against the flood-count assertion alone (5 of 50 even with a
read-then-write counter, because the adjacent get/put window is too small to lose a race on this
machine). That is why the atomicity of the store and the door's USE of it are asserted separately -
the flood number alone would have been a green that proves nothing about a future regression.

### Gate battery, all measured on this tree after the fix

| gate | result |
|---|---|
| `node_modules/typescript/bin/tsc --noEmit -p tsconfig.json` | rc=0 |
| `npm run build` | rc=0, 20.1 s |
| `npm run test:accounts` | rc=0, 3.2 s - kv 43, sqlite 43, sign-in hardening 27, office credential 24 (both backends; wrangler 4.107.0 really booted: `test-results/accounts-worker-state/{dev,registry-dev,unconfigured}` written) |
| `npm run test:mp` | rc=0, 466 checks |
| `npm run test:stats` | rc=0, 87 + 372 + 372 + 26 checks |
| `GR_GUARD_NO_ARTIFACT=1 node --test scripts/citation-title-guard.test.mjs scripts/no-emdash-guard.test.mjs` | rc=0, 19 pass |
| `GR_GUARD_NO_ARTIFACT=1 node --test scripts/worker-type-coverage.test.mjs scripts/function-cors-allowlist.test.mjs scripts/ratelimit-window.test.mjs` | rc=0, 9 pass (the new `functions/api/_compare.ts` is inside the tsc program; the new `bumpCounter` call site passes its own TTL) |

---

## 7. Commits (all path-scoped, prefix `fix:`, on `fix/sec-signin-hardening-1`)

| # | hash | concern | paths |
|---|---|---|---|
| 1 | `0c56b1368` | atomic guess counting, and a new code no longer refills the budget | `server/ledger/storage.mjs`, `functions/api/_accounts.ts` |
| 2 | `cc52fb639` | a per-address hourly cap on `/api/verify` | `functions/api/_accounts.ts` |
| 3 | `a8c323947` | dev sign-in codes need an unbound mail sender | `functions/api/_accounts.ts` |
| 4 | `ceb9f2c59` | the office token rides a header, compared in constant time | `functions/api/_compare.ts`, `functions/api/_bugs.ts`, `functions/api/redeem.ts`, `functions/api/standings.ts`, `scripts/fetch-bugs.mjs` |
| 5 | `d0786c77f` | the `limit_req` lines for `/api/verify` in the droplet mirror | `ops/droplet/agenttown.app.nginx.conf` |
| 6 | `0d5209649` | the accounts tests for all four doors | `scripts/test-accounts.mjs` |
| 7 | this commit | this report | `artifacts/sec-signin-hardening-1/report.md` |

---

## OWNER / OPS, and the things left deliberately alone

1. **`redeem.ts:43-47` is UNCHANGED, and the master's own condition is why.** An already-redeemed
   code still answers `ok: true` with the skin. `e2e/cosmetic-grants.spec.ts:130-136` asserts exactly
   that (`expect(spent.status).toBe(200)` and `resolves.toMatchObject({ ok: true, skin: 'gilded' })`),
   so the existing tests do NOT allow the change. Read, verified, left alone, as instructed.
2. **The mint still shares `BUG_OFFICE_TOKEN`.** Splitting it needs a new binding on the Pages project
   and in the droplet env, which is an owner ops step and not a code change. Noted at the site in
   `redeem.ts` and here.
3. **The nginx lines need the owner's droplet evening** (`nginx -t` then reload). Until then the
   per-address cap in `_accounts.ts` is the only address-level bound on the live door, and it is live
   as soon as this branch deploys.
4. **Deploy order for `scripts/fetch-bugs.mjs`**: deploy the functions first; the script now sends the
   header only.
5. **KV remains non-atomic for the guess counter.** The live door is the sqlite ledger and takes the
   atomic path. If the accounts flow ever moves back to Pages KV as the primary, a Durable Object
   counter is the cure, and the per-IP plus nginx caps are what hold the line until then.

### Observed, outside this task's firewall, not fixed

- `artifacts/multiplayer-relay/test-multiplayer.json` on main is STALE (generated 2026-08-08): four
  check labels added to `scripts/test-multiplayer.mjs` since then are missing from it, because gates
  run with `GR_GUARD_NO_ARTIFACT=1`. My runs refreshed it and
  `artifacts/accounts-worker/test-accounts.json` as a side effect; I restored BOTH to their committed
  content with `git show HEAD:<path> > <path>` (no git mutation), because neither is in this task's
  firewall. Nothing else in the tree is dirty.
- `scripts/review-account-creation.test.mjs` exercises `verifyCode` too and is RED/unrooted on main by
  a known finding (F-SSL-4: its own 90 s timeout, about 302 s wall, no caller). I did not run it. My
  change is compatible with it by construction: its `memoryKV()` has no `increment`, so it takes the
  fallback path, and its two-parallel-verify barrier interposes on `storage.get` for `code:` keys only,
  which the new counting call does not touch.
