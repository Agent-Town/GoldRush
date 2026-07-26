# Task lane-ratelimit-429-net: THE 429 REGRESSION NET — CHARACTERIZE THE RATE LIMITERS *BEFORE* ANYONE HOISTS THEM (LANE-C, commit prefix "test:")
**FIRE-AUTHORED (attended review welcome) — s1085, 2026-07-26. This is the PREREQUISITE for F-1080-1, not F-1080-1 itself. You are adding tests ONLY. You will not create `functions/_ratelimit.ts`, and you will not edit a single line under `functions/`.**

You are Codex (worktrees/lane-c). CODEX: model=gpt-5.6-sol effort=high

## PRE-FLIGHT — verify by CONTENT, never by counting
⚠️ **`git log main..lane/e2-arsenal` WILL PRINT ONE COMMIT (`73aac654 fix: make the E1 difficulty climb walkable`), AND THAT IS EXPECTED — IT IS *NOT* A REASON TO STOP.**
s1085 verified that commit is **fully content-merged into main** and a reset is **loss-free**, by reading both sides rather than counting:
- `src/game/Balance.ts` — main already carries the branch's **entire** contribution byte-identically (the `ENTRY_WAVE_DAMAGE_SCALE` table and the `entryDamageScale:` line). Main is merely *further* ahead (`doubleTapCoilMaxStacks` 6→3, which is main's own and must be preserved).
- `src/systems/WaveSystem.ts` — `git diff main lane/e2-arsenal -- src/systems/WaveSystem.ts` is **EMPTY**.
- `reviews/e1-ladder-tune.md` — main's version is a strict **superset** (101 lines vs the branch's 47, identical opening).
An ahead-count is not a drain signal (F-1066-1 / F-1073-1).

All three must hold before you touch a file:
1. `git diff main lane/e2-arsenal -- src/systems/WaveSystem.ts` is **EMPTY**.
2. `git log --oneline main..lane/e2-arsenal` prints **exactly `73aac654` and nothing else.** A **second** commit would be undrained work — **only then STOP and report.**
3. `grep -n doubleTapCoilMaxStacks src/game/Balance.ts` on **main** shows `3` (not `6`) at both sites. If it shows `6`, main has moved unexpectedly — STOP and report.
If all three hold, start from fresh main (`git checkout -B lane/e2-arsenal main`) — `73aac654` is safe to leave behind.

READ FIRST (in your worktree, before writing anything):
- `e2e/bug-office-api.spec.ts` — **this is your template and it already works.** Note especially: `test.describe.configure({ mode: 'serial' })`, the `beforeAll` that spawns `wrangler pages dev` on a **per-project port** (`8812` desktop / `8813` mobile), the `--persist-to test-results/...` fresh-state wipe via `rm`, and `postReport(body, ip)` which sets the **`CF-Connecting-IP`** header. Its `rate-limits the sixth report from one IP` test (`:91-98`) is the exact shape you are reproducing for two more modules.
- `functions/api/redeem.ts` — `CODE_PATTERN:16`, `MAX_REDEEMS_PER_IP:19` (**= 5**), the handler `onRequest:21`, and **the ordering at `:39-43`**.
- `functions/api/_accounts.ts` — `requestCode:81`, `MAX_REQUESTS_PER_EMAIL:74` (**= 5**), `MAX_REQUESTS_PER_IP:75` (**= 20**), `normalizeEmail:382`, and **the double-bump at `:95-97`**.
- `playwright.accounts.config.ts` — **read it to see what NOT to reuse** (see the port trap below).

## Why this task
✓ **VERIFIED s1085 by reading every file named here — measured, not inherited.**

F-1080-1 proposes hoisting the duplicated rate limiters into a shared `functions/_ratelimit.ts`. s1084 re-verified that finding and found it is **more dangerous than originally recorded**:

- `bumpCounter` is defined **5 times** (`telemetry.ts:125`, `_bugs.ts:184`, `redeem.ts:98`, `_accounts.ts:537`, `_multiplayer.ts:652`) in **three genuinely different variants** — 2-arg with a hardcoded limit (`redeem`, `_bugs`), 3-arg using `Math.trunc` (`telemetry`, `_multiplayer`), and 3-arg using `numberOrZero` with **no truncation** (`_accounts`).
- `RATE_TTL_SECONDS` is captured by **closure** and **diverges**: `_accounts.ts:72` is `10 * 60` = **600s**, every other module is `60 * 60` = **3600s**. A naive hoist would silently **6× the account rate-limit window**.
- **And only 2 of the 5 modules have any 429 test at all.** `telemetry` and `_bugs` are covered (`e2e/tl-01-run-telemetry.spec.ts`, `e2e/bug-office-api.spec.ts`). **`redeem`, `_accounts` and `_multiplayer` have none** — verified by grepping `429` across `e2e/`, which returns only those two specs plus `charter-press.rig.ts`.

So the hoist would be a behaviour-changing refactor across five modules, three of which no test watches. **A net comes first.** That is this task, and s1084's ruling was explicit: *"require 429 tests for `redeem`/`_accounts` first."*

**You are writing characterization tests: they must pin down what the code does TODAY, exactly as it is.** If you think a limit is wrong, that is a finding for your report — not an edit.

## Scope
1. **ONE new spec file: `e2e/ratelimit-429-net.spec.ts`.** Follow `e2e/bug-office-api.spec.ts` structurally: serial mode, `beforeAll` spawning `wrangler pages dev public` with the bindings each module needs, per-project ports, a `--persist-to test-results/ratelimit-429-<project>` directory wiped with `rm` before spawn, and an `afterAll` that kills the worker exactly as the template does.
   ⚠️ **PORT TRAP — do NOT reuse `playwright.accounts.config.ts`, and do NOT use ports 8788 or 8799.** s1085 measured both: they are **held right now by `workerd` processes ~16 days old** (pids 13841 and 16589). That config sets `reuseExistingServer: false` on 8788, so it would either fail to bind or — far worse — **measure a foreign, 16-day-stale tree** (the F-1077-3 hazard). Use fresh ports **8816** (desktop) / **8817** (mobile) for the redeem worker and **8818** / **8819** for the accounts worker, with distinct `--inspector-port`s (e.g. `9236`–`9239`). **Before trusting any number, assert the worker you spawned is the one you are talking to** — the template's `url`/readiness wait plus your own spawn handle is sufficient; never point at a port you did not start.
2. **`redeem` — the sixth stub from one IP (limit 5).** `POST /api/redeem` with `{ code }`.
   - Bind the KV the handler looks for: `--kv TELEMETRY` (it falls back to `ACCOUNTS`; `redeem.ts:27`). Without it the handler returns **503 `office_closed`** and your test would be vacuous.
   - ⚠️ **Use a well-formed but UNKNOWN code, and understand why that works:** at `:39-43` the handler validates the code shape **first** (`normalizeCode` → `bad_stub`, which would short-circuit before the limiter), then calls `bumpCounter`, and only **then** looks up `prize:<code>`. So a code matching `CODE_PATTERN = /^GR(?:-[A-F0-9]{6}){4}$/` that has no prize behind it **still advances the counter** and returns `bad_stub`. You do **not** need to mint prizes. Example valid shape: `GR-A1B2C3-D4E5F6-000000-FFFFFF`.
   - Assert: 5 requests from one `CF-Connecting-IP` each return **not-429** (they will be `bad_stub`), and the **6th** returns status **429** with body matching `{ ok: false, error: 'rate_limited' }`.
   - **Isolation assertion (this is what makes the net non-vacuous):** a request from a **different** `CF-Connecting-IP` immediately after the 429 must **not** be 429. A hoist that collapses per-IP keying is exactly the regression worth catching.
3. **`_accounts.requestCode` — both limits, which are independent (limits 5 per email, 20 per IP).** `POST /api/request-code` with `{ email }`.
   - Bind `--kv ACCOUNTS --binding DEV_AUTH=1` (`requestCode` returns **503 `sign_in_not_enabled`** unless `isDev(env)` or `RESEND_API_KEY`; `:84-87`). Confirm you get past that before asserting anything.
   - ⚠️ **Read `:95-97` carefully: BOTH counters bump on EVERY request, unconditionally, before either is checked.** Therefore the email test and the IP test **must use different IPs**, or the first will contaminate the second.
   - **Email limit:** 5 requests, same email, same IP → not-429; the **6th** → **429** with `{ error: 'rate_limited' }`.
   - **IP limit:** from a *different* IP, **20** requests each with a **distinct** email (so no email counter is ever the cause) → not-429; the **21st** → **429**. This is the assertion that pins `MAX_REQUESTS_PER_IP = 20`.
   - Use emails that pass `normalizeEmail:382` (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`), e.g. `net-01@example.test`.
4. **Mutation control (mandatory — this is how a net is proven to be a net).** Once green, temporarily change `MAX_REDEEMS_PER_IP` (`redeem.ts:19`) from `5` to `50`, re-run your redeem test, and **record the failure message verbatim**. Then revert it and confirm green again, and confirm `git diff main -- functions/` is **EMPTY** at the end. Repeat the same control for `MAX_REQUESTS_PER_EMAIL`. ⚠️ **If a test still passes with the limit moved, it is vacuous and you must say so plainly rather than claim success** (F-1080-B; the `rf-22` runner reported exactly such a negative honestly and that was the right call).
5. **State plainly what this net does NOT cover.** `RATE_TTL_SECONDS` (the 600s-vs-3600s divergence) is **not observable over HTTP** without waiting out the window, so these tests do **not** protect it. Write that sentence into your report so F-1080-1's author does not mistake a green net for TTL safety.

## Firewall
**TOUCH-ONLY:** `e2e/ratelimit-429-net.spec.ts` (new file) — **and nothing else.**
**NO:** every file under `functions/` (**you may not create `functions/_ratelimit.ts`, and you may not edit `redeem.ts`, `_accounts.ts`, `_multiplayer.ts`, `telemetry.ts` or `_bugs.ts` — the scope-4 limit flips are TEMPORARY and must be reverted, verified by an empty `git diff main -- functions/`**) · any existing spec, including `bug-office-api.spec.ts` and `tl-01-run-telemetry.spec.ts` · any `playwright*.config.ts` (**your spec self-spawns its workers; it needs no config, and the main `playwright.config.ts` has no `testMatch` for normal runs, so a new `e2e/*.spec.ts` is picked up automatically**) · `src/` at all · `src/game/Balance.ts` · `scripts/deploy.sh` (**FORBIDDEN, F-1073-1 — never in any diff**) · no new dependency · no reformatting of untouched lines · ports **8788** and **8799** (occupied, see the port trap).

## Self-check before you report
- `npx tsc --noEmit` clean · `npm run build` green.
- **Your new spec green on both projects** (desktop-chrome and mobile-chrome/390), reported per-test.
- 🔴 **MANDATORY adjacent suites** (they share the wrangler-spawn pattern and the KV persist directory space): `e2e/bug-office-api.spec.ts` · `e2e/tl-01-run-telemetry.spec.ts`. Both projects, per-suite counts. **They must be unmodified-green** — if either goes red, your ports or persist paths are colliding with theirs; fix yours, never theirs.
- ⚠️ **RUN AT `--workers=1` (F-1084-1, measured s1084).** At default parallel workers the standard battery returns three load-sensitive failures (`m3-06-demo-profiles:14`, `task-024:88`, `tp00-tile-persistence:171`) **which clean main returns identically** — they are load, not code. Your suite spawns real workers and binds real ports, so it is **especially** load-sensitive. Do not report a parallel red without a `--workers=1` re-run.
- ⚠️ **If any run prints no `N passed` / `N failed` summary line, treat it as ABORTED, not clean** (F-1081-6 — the `import.meta.glob` collection abort takes the whole run's verdict with it). Do **not** add `e2e/town-t5-townsfolk.spec.ts` or any `ts-0*`/`safari-swap`/`never-trap` spec to your runs.
- ⚠️ **`e2e/tile-identity-pass.spec.ts` is NOT a gate for you** (F-1083-2).
- No plain-boot probe is required: this task adds **no** client-side code and changes **no** rendering surface. Say so explicitly rather than skipping it silently.

READY-FOR-GATES + report: the **verbatim** failure messages from **both** mutation controls (and confirmation `git diff main -- functions/` is empty), your per-test and per-suite counts on both projects at `--workers=1`, the exact ports and bindings you used, confirmation that the isolation assertions (different-IP for redeem, different-IP for the accounts email-vs-IP split) actually pass, the sentence stating TTL is uncovered, and any limit you believe is *wrong* as a finding — **without editing it.**
