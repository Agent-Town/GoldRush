# Task lane-ratelimit-hoist: ONE RATE LIMITER, FOUR CALLERS — THE HOIST, NOW THAT THE NET IS UNDER IT (LANE-C, commit prefix "refactor:")
**FIRE-AUTHORED (attended review welcome) — s1086, 2026-07-26. This IS F-1080-1, unblocked: its prerequisite `rf-24` merged this fire as `d16000a9c9b3a8690ee8a48d3b1b23a4a4faea0d`. Read the two RULINGS below before you write anything — they are decided, not open questions, and "harmonising" past them is the failure mode this master exists to prevent.**

You are Codex (worktrees/lane-c). CODEX: model=gpt-5.6-sol effort=high

## PRE-FLIGHT — verify by CONTENT, never by counting
⚠️ **`git log main..lane/e2-arsenal` WILL PRINT ONE COMMIT (`0a4f791a runner(lane-c): lane-ratelimit-429-net.md`), AND THAT IS EXPECTED — IT IS *NOT* A REASON TO STOP.**
s1086 **drained that exact commit itself** this fire and verified the reset is **loss-free** by content, not by counting:
- Its only file, `e2e/ratelimit-429-net.spec.ts`, is on main at blob `633422843e2050a010c76c4d76b90d8b317a57f4` — **byte-identical**, verified before and after the drain's own fingerprint run.
- `git diff main lane/e2-arsenal -- src/ e2e/ functions/` shows the branch only *lacking* main's newer rf-23 work (`Game.ts`, `ProfileStorage.ts`, `task-024-…`) — the branch is **behind**, never ahead, on every code path.
An ahead-count is not a drain signal (F-1066-1 / F-1073-1).

All three must hold before you touch a file:
1. `git log --oneline main..lane/e2-arsenal` prints **exactly `0a4f791a` and nothing else.** A **second** commit would be undrained work — **only then STOP and report.**
2. `ls functions/api/_ratelimit.ts` on main → **must not exist.** If it does, this task has already been done — STOP and report.
3. `grep -n "RATE_TTL_SECONDS =" functions/api/_accounts.ts` on main shows **`10 * 60`**. If it shows `60 * 60`, someone has already "harmonised" the TTL and the premise of RULING 2 is gone — STOP and report.
If all three hold, start from fresh main (`git checkout -B lane/e2-arsenal main`) — `0a4f791a` is safe to leave behind.

READ FIRST (in your worktree, before writing anything):
- `e2e/ratelimit-429-net.spec.ts` — **the net that makes this task safe.** It pins `redeem` (5/IP) and both `_accounts.requestCode` limits (5/email, 20/IP) with different-IP isolation assertions. It is your primary regression signal.
- `e2e/bug-office-api.spec.ts:91-98` — the `_bugs` 429 test.
- `e2e/tl-01-run-telemetry.spec.ts:391` — the `telemetry` 429 test.
- `functions/api/redeem.ts` — `RATE_TTL_SECONDS:18`, `MAX_REDEEMS_PER_IP:19`, `bumpCounter:98`, `clientIpHash:106`.
- `functions/api/_bugs.ts` — `RATE_TTL_SECONDS:46`, `bumpCounter:184`, `clientIpHash:192`.
- `functions/api/telemetry.ts` — `RATE_TTL_SECONDS:41`, `bumpCounter:125`, `clientIpHash:218`. **Note `bump:120` is a DIFFERENT function (an unlimited tally, no TTL) — it is NOT in scope, do not touch it.**
- `functions/api/_accounts.ts` — `RATE_TTL_SECONDS:72` (**600s, the trap**), `MAX_REQUESTS_PER_EMAIL:74`, `MAX_REQUESTS_PER_IP:75`, `bumpCounter:537`, `numberOrZero:700`, and the raw-IP use at `:665`.
- `functions/api/delete-account.ts:1` / `functions/api/bugs.ts:1` — the established `import { x } from './_name'` convention for shared `functions/api/_*.ts` modules.

## Why this task
✓ **VERIFIED s1086 by reading all five modules' bodies — measured this fire, not inherited from F-1080-1's summary.**

The duplication is real and is now the last thing standing between five endpoints and one rate limiter:
- `bumpCounter` is defined **5×** — `redeem.ts:98`, `_bugs.ts:184`, `telemetry.ts:125`, `_accounts.ts:537`, `_multiplayer.ts:652`.
- `clientIpHash` is defined **4×** — `redeem.ts:106`, `_bugs.ts:192`, `telemetry.ts:218`, `_multiplayer.ts:660`. (`_accounts` has none; it keys on the **raw** IP.)

📌 **One correction to the record you should know, because it makes the job smaller than F-1080-1 describes.** That finding calls the five `bumpCounter`s "three genuinely different variants". Read side by side, there are only **two** behaviours:
- **Four of five are the same algorithm** — `Number(...)` → `Number.isFinite(current) && current > 0 ? Math.trunc(current) : 0` → compare → `put(count+1, {expirationTtl})`. `redeem`/`_bugs` differ *only* in taking the limit from a module constant instead of an argument; `telemetry`/`_multiplayer` already take it as an argument.
- **`_accounts.ts:537` is the lone outlier**: it uses `numberOrZero` (`:700`), which is `Number.isFinite && > 0 ? parsed : 0` — **no truncation**.

So this is one canonical body plus one divergence, not three rival designs.

⚠️ **THE TRAP, re-verified this fire by grepping all five:** `RATE_TTL_SECONDS` is a module-scope const captured by **closure**, and `_accounts.ts:72` is `10 * 60` = **600s** while `_bugs`, `redeem`, `telemetry` and `_multiplayer` are all `60 * 60` = **3600s**. **A hoist that carries a TTL along, or gives the shared function a default TTL, silently 6× the account rate-limit window.** No test can catch it: `rf-24`'s net pins *limits*, and TTL is not observable over HTTP without waiting out the window (recorded as F-1086-2). **This is why RULING 2 exists.**

## RULINGS — decided by this master. Do not re-litigate, do not "harmonise" past them.

**RULING 1 — `Math.trunc` WINS, including in `_accounts`. This is an intentional, recorded behaviour change.**
The shared `bumpCounter` uses `Math.trunc`, and `_accounts` adopts it. Rationale: 4 of 5 sites already do, and the divergence is only reachable via a **corrupted** (fractional) KV value, where `numberOrZero` increments `3.7 → 4.7` and lets an extra request through before `>= limit` trips. Truncating is both the majority behaviour and the stricter one. **Write this in your report as a deliberate change, not as a no-op.** `numberOrZero` itself stays where it is — it has other callers; you are only removing its use inside `bumpCounter`.

**RULING 2 — TTL AND LIMIT ARE BOTH REQUIRED PARAMETERS. NO DEFAULTS.**
The signature is exactly:
```ts
export async function bumpCounter(kv: KVNamespaceLike, key: string, limit: number, ttlSeconds: number): Promise<boolean>
```
Four arguments, **no default values on either**, so that omitting the TTL is a **type error** rather than a silent 6×. Each caller passes **its own module's existing `RATE_TTL_SECONDS`**, which stays declared in that module. **`_accounts` must still pass 600.** After your edit, `grep -n "RATE_TTL_SECONDS =" functions/api/_accounts.ts` must still print `10 * 60`.

**RULING 3 — `_multiplayer.ts` IS OUT OF SCOPE. Leave its two private copies exactly where they are.**
It is the **only** one of the five with **no 429 test at all** (`rf-24` covered `redeem` + `_accounts`; `_bugs` and `telemetry` were already covered). Refactoring an uncovered live endpoint is precisely the risk that made s1084 block this task in the first place. Migrating it is a **follow-up rung** that needs its own net first. **A partial cure with a net under all of it beats a complete cure with a blind spot** — say so in your report rather than treating it as unfinished business.

**RULING 4 — `_accounts`'s raw-IP keying (`:665`) is UNTOUCHED.** It deliberately does not hash. Changing it would invalidate every live KV key. `_accounts` therefore imports `bumpCounter` **only**, never `clientIpHash`.

## Scope
1. **New file `functions/api/_ratelimit.ts`** (note: `functions/api/`, beside its consumers, matching the existing `_accounts.ts`/`_bugs.ts` convention — the `_` prefix keeps it unrouted; F-1080-1's original "`functions/_ratelimit.ts`" wording predates checking that convention). It exports exactly two functions and no state:
   - `bumpCounter(kv, key, limit, ttlSeconds)` per RULING 2, body = the `Math.trunc` canonical form.
   - `clientIpHash(request)` — copy the existing body **byte-for-byte** (the `CF-Connecting-IP` → `X-Forwarded-For` → `'local'` chain, SHA-256, hex, `.slice(0, 32)`). It is already identical in all four copies; **verify that by diffing them before you copy, and report it if any differs.**
   - Reuse the existing `KVNamespaceLike` type. If it is declared per-module, export one from `_ratelimit.ts` and have the three callers import it — but do **not** invent a new shape.
2. **`functions/api/redeem.ts`** — delete both private copies, import from `./_ratelimit`, pass `MAX_REDEEMS_PER_IP` and `RATE_TTL_SECONDS` at the call site.
3. **`functions/api/_bugs.ts`** — same, passing `MAX_REPORTS_PER_IP` and its `RATE_TTL_SECONDS`.
4. **`functions/api/telemetry.ts`** — same. **`bump:120` stays private and untouched.**
5. **`functions/api/_accounts.ts`** — delete its private `bumpCounter` **only**, import from `./_ratelimit`, and pass **`RATE_TTL_SECONDS` (600)** at every call site. Do not add a `clientIpHash` import.
6. **Zero behaviour change anywhere except RULING 1.** Same keys, same limits, same TTLs, same ordering, same return values. This is a refactor; the net is what proves it.

## Firewall
**TOUCH-ONLY:** `functions/api/_ratelimit.ts` (new) · `functions/api/redeem.ts` · `functions/api/_bugs.ts` · `functions/api/telemetry.ts` · `functions/api/_accounts.ts`.
**NO:** `functions/api/_multiplayer.ts` (RULING 3) · any other file under `functions/` · **any file under `e2e/`** — the tests are the instrument and you may not adjust them to fit your refactor; if a test goes red, the refactor is wrong · any file under `src/` · `wrangler.toml` · `package.json`.
Reporting an adjacent problem is good. Fixing one out of scope is a violation.

## Self-check — run these, paste the real numbers
1. `npx tsc --noEmit` → exit 0.
2. `npm run build` → exit 0.
3. **`e2e/ratelimit-429-net.spec.ts` — both projects, `--workers=1`. Expect 6/6.** This is the gate that matters: it covers `redeem` and `_accounts`, the two modules whose behaviour you changed most.
4. **`e2e/bug-office-api.spec.ts` — both projects. Expect 8/8.**
5. **`e2e/tl-01-run-telemetry.spec.ts` — both projects.** ⚠️ **EXPECT 14/16, NOT 16/16.** `tl-01:229` (`plain no-debug secure return keeps telemetry invisible to gameplay`) is **RED ON MAIN in both projects** — that is **F-1086-1**, filed s1086 and proved pre-existing by a clean-main fingerprint. **It is not yours and you must not chase it or edit it.** The test you care about is **`:391` (`server route rate-limits bound telemetry by client IP`), which must PASS.** If any test *other* than `:229` goes red, that is yours.
6. **MANDATORY MUTATION CONTROL — the TTL, because no test can see it.** Temporarily change `_accounts`'s call site to pass `3600` instead of its `RATE_TTL_SECONDS`, and show that **`grep -n "expirationTtl" functions/api/_accounts.ts`-equivalent evidence proves the value reaching `kv.put` changed** — i.e. demonstrate by a printed value or a temporary log that the account limiter's TTL is genuinely 600 in your final tree. Then restore, and prove the restore with `git diff` showing the call site passes `RATE_TTL_SECONDS` and `grep -n "RATE_TTL_SECONDS =" functions/api/_accounts.ts` printing `10 * 60`. **A refactor whose most dangerous property is untested must at minimum be demonstrated by hand.**
7. **MANDATORY MUTATION CONTROL — the limits.** Change `MAX_REDEEMS_PER_IP` from 5 to 6, re-run spec 3, show it goes **RED** (`Expected: 429 / Received: 200`), then restore and show it green again. This proves the net is still wired to the code you refactored.
8. `git diff --stat main` — confirm **exactly five files**, and that `_multiplayer.ts` and `e2e/` are **absent** from the list.
9. No plain-boot probe is required: zero `src/`, zero client, zero rendering surface. Say so explicitly rather than skipping it silently.

READY-FOR-GATES. Report: the five-file diffstat · specs 3/4/5 with real pass/fail counts both projects · both mutation controls shown failing-then-restored · confirmation that `_accounts` still passes 600 · whether the four `clientIpHash` bodies were in fact byte-identical · and anything you noticed about `_multiplayer.ts` that a future net should cover.
