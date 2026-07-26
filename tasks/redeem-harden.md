# Task redeem-harden: the clerk keeps an honest ledger (MAIN, commit prefix "fix:")
**FIRE-AUTHORED s1079 (attended review welcome)** — corrective for F-1079-2/3/4, all three found by the
s1079 drain gate and written up in `reviews/cosmetic-grants.md`. No new scope: three named defects in one
file that shipped 30 minutes ago.

You are Codex (repo root, main slot). CODEX: model=gpt-5.6-sol effort=high

READ FIRST:
- `reviews/cosmetic-grants.md` — findings F-1079-2, F-1079-3, F-1079-4 (the WHY, with the failure scenarios).
- `functions/api/redeem.ts` — the file you are fixing (merged at `52fa15ad`).
- `functions/api/_bugs.ts` — **the pattern to copy** for rate limiting: `bumpCounter` + `clientIpHash`
  (see `:60`), and its 429 shape.
- `functions/api/telemetry.ts:76` and `functions/api/_accounts.ts:95` — the same helper at two more call
  sites; match the house convention rather than inventing one.
- `e2e/cosmetic-grants.spec.ts` — the live-worker test at `:87` is your regression net; keep it green.

## PRE-FLIGHT (main slot, tracked-clean)
`git status --porcelain` must show no tracked modifications under `functions/` or `src/`. Artifact/log
churn is fine. If a tracked source file is dirty, **STOP and report** — a drain may be mid-flight.

## Why (evidence, quoted)
1. **F-1079-2** — `redeem.ts:33` is `return mint(...)` inside a `try`. In an async function a plain
   `return` of a promise settles *after* the try scope exits, so the `catch` at `:43` never runs. Proven
   by execution: `try { return inner() }` lets the rejection escape; `try { return await inner() }` catches
   it. Today a malformed authenticated mint yields a Cloudflare **500 HTML page** instead of `400
   bad_payload`, and a `kv.put` failure 500s instead of `503`.
2. **F-1079-3** — `redeem.ts:41` does `kv.delete` **then** responds, and only then does the client persist.
   Lose the response in flight, or fail the owned-list write on quota, and the code is **permanently
   dead**: every retry returns `bad_stub`. The player is holding a burned stub with no recovery short of
   re-minting. This is the one that can actually hurt somebody.
3. **F-1079-4** — every sibling public write gates on `bumpCounter(kv, '<ns>:ratelimit:' + await
   clientIpHash(request))`. `redeem.ts` copied their CORS block verbatim and **dropped the rate limit**,
   leaving unbounded unauthenticated billed KV reads. CORS does not protect it — a non-browser client
   sending no `Origin` header passes.

## Scope (each item independently testable)
1. **Route mint's errors to the handler.** `return await mint(...)` at `:33`. Add a test asserting an
   authenticated mint of 21 codes returns **400 `bad_payload`**, not 500.
2. **Make redemption idempotent.** Replace the `kv.delete` at `:41` with a state write —
   `kv.put('prize:'+code, 'redeemed:'+<iso ts>)` — and return `ok:true` with the skin for **both** a fresh
   stub and an already-redeemed one. A stub must survive a lost response. Single-use enforcement buys
   nothing here (the grant is client-side localStorage — any player can self-grant with one devtools
   line), so recoverability wins. Keep rejecting stubs that were never minted.
3. **Read the stored skin instead of hardcoding it.** `:37-42` fetches the KV value, discards it, and
   returns a literal `skin: 'gilded'`; the guard is `=== null`, so an empty-string value would pass as
   valid. Return the stored skin and treat any falsy value as `bad_stub`. This is what lets a second
   cosmetic be minted later without silently granting gilded.
4. **Rate-limit the public path**, reusing `_bugs.ts`'s helpers unchanged — same key shape, same 429
   response shape. The **authenticated mint path must not be throttled** into uselessness; bound the
   unauthenticated redeem attempts.
5. **Extend `e2e/cosmetic-grants.spec.ts`** with: the 400-not-500 case (item 1) and a **re-redeem of an
   already-claimed stub still succeeding** (item 2). Both through the existing Wrangler rig the file
   already stands up at `:87`. Zero console, both projects.

## Firewall
TOUCH-ONLY: `functions/api/redeem.ts` · `e2e/cosmetic-grants.spec.ts` · `scripts/mint-prize-codes.mjs`
(only if item 2 changes what it must print).
**NO** `src/` of any kind — the client is correct as shipped and its rollback logic is deliberate.
**NO** `functions/api/_bugs.ts` / `telemetry.ts` / `_accounts.ts` — **read** them for the pattern, do not
edit them. **NO** `scripts/deploy.sh` (forbidden off any lane, F-1073-1). **NO** ProspectorSkin/wardrobe
work — `lane-tailor-wagon` owns that surface and runs concurrently in lane-d.

## Self-check
`npx tsc --noEmit` clean · `npm run build` green · `e2e/cosmetic-grants.spec.ts` **green desktop AND
mobile-390 including your new cases** · `bug-office-api` + `bug-office-desk` unmodified-green · zero
console/page errors both projects.
⚠️ `e2e/vp-02-sprite-animation.spec.ts` is **10-red on main already** (F-1079-1 — the runtime serves the
`-f-` female hero sheet while the spec asserts male-named files). Not yours; do not fix, do not count.

END: READY-FOR-GATES + report which of the four scope items changed behaviour vs. which were already
correct, and paste the 400-not-500 response body as proof of item 1.
