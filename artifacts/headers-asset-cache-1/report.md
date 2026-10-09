# Hashed assets detach inherited no-cache

READY-FOR-GATES — cache fix complete; one pre-existing 058 failure reproduced on the control. This is not an all-green e2e claim.

## Root cause and fix

Cloudflare Pages applies all matching rules and joins repeated headers. The earlier asset rules and later catch-all therefore combined immutable caching with no-cache. Asset rules now follow the catch-all and detach only Cache-Control before setting the immutable value. The catch-all also detaches prior HTML cache values so `/`, `/index.html`, and `/goldrush/index.html` resolve to exactly one `no-cache`. Security headers and the entire report-only CSP directive line are unchanged; the explanatory block is preserved.

Reference: https://developers.cloudflare.com/pages/configuration/headers/ (attach, detach, and splat semantics, checked 2026-10-09).

The test parser stores ordered rule blocks (including repeated patterns), represents detach as a null value, and models case-insensitive header accumulation/removal. Its model supports the path/splat patterns used by this file, not all Cloudflare URL/placeholder syntax.

## Resolved response headers from the model

| Path | Cache-Control | Security headers |
| --- | --- | --- |
| `/index.html` | `no-cache` | All five, exact values below |
| `/assets/x-abc123.js` | `public, max-age=31536000, immutable` | All five, exact values below |
| `/goldrush/assets/x-abc123.js` | `public, max-age=31536000, immutable` | All five, exact values below |

Common security values on each path:

- `x-content-type-options: nosniff`
- `referrer-policy: strict-origin-when-cross-origin`
- `x-frame-options: DENY`
- `strict-transport-security: max-age=2592000`
- `content-security-policy-report-only: default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://agenttown.app wss://agenttown.app; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'`

Raw model output: [resolved-headers.json](resolved-headers.json). Root and prefixed HTML are also covered.

## Guard adaptation and verification

- Baseline guard: **4 passed, 0 failed**; final guard: **6 passed, 0 failed**. Commands: `node --test scripts/site-security-headers.test.mjs`. Logs: [before](guard-before.log), [after](guard-after.log).
- The old asset pin indexed the first header entry; it now looks up Cache-Control by name because detach precedes attach.
- Existing CSP deletion, widening, enforcing-flip, wildcard, dropped-header, and absent-rule fixtures remain unchanged and pass.
- New controls prove accumulation without detach, case-insensitive removal, nonmatching-rule exclusion, literal-dot matching, and repeated-pattern application order.
- `e2e/058-device-tiers.spec.ts` remains unchanged: its raw substring checks are independent of rule position, and all pinned strings remain present. The new guard supplies the missing resolved-semantics check.
- Pre-flight `npm run build`: exit 0. Final `npm run build`: exit 0; [build.log](build.log). Existing Vite extension/asset-diet warnings remain.
- `npx tsc --noEmit`: exit 0; [tsc.log](tsc.log).
- `cmp public/_headers dist/_headers`: exit 0.
- Plain desktop/mobile menu boots: zero console/page errors; [boots.log](boots.log), `boot-desktop.png`, `boot-mobile.png`.

## Pre-flight and scope

Branch `sol/wave-lane-b`; starting HEAD `d428568d73c8a30cc8cd2811236788967b64077f`; no ahead commits, so no reset was needed. Initial untracked evidence in `artifacts/emdash-entities-1/{consent-recheck-results,control-results}/` and `logs/guard-stats.jsonl` was retained under the evidence/churn exceptions; no pre-existing artifacts discarded. No source edits existed.

The task contradicts itself about dependency installation. Followed its explicit “do NOT run npm install/npm ci” instruction; existing dependencies built successfully. `node_modules` was actually a directory, not the stated symlink. No dependency files changed.

No source changes: `HEAD:src` is `e4bd90eb3fef16c7cd040b2f9cab6b0634c8ba17`; `git diff --quiet HEAD -- src` exits 0. No deploy. Durable findings remain here under the task's TOUCH-ONLY firewall.

## Built dist/_headers excerpt

```text
# Reset overlapping HTML rules to one no-cache value.
/*
  ! Cache-Control
  Cache-Control: no-cache
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Strict-Transport-Security: max-age=2592000
  Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://agenttown.app wss://agenttown.app; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'

# Pages merges every matching rule: clear inherited no-cache before caching hashed assets.
/assets/*
  ! Cache-Control
  Cache-Control: public, max-age=31536000, immutable

/goldrush/assets/*
  ! Cache-Control
  Cache-Control: public, max-age=31536000, immutable
```

## Browser suites and pre-task control

Command (exit 1):

```sh
npx playwright test e2e/058-device-tiers.spec.ts e2e/task-025-bandits-dont-swim.spec.ts e2e/m2-01-build-menu.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --output=artifacts/headers-asset-cache-1/playwright-results
```

**30 passed, 9 skipped, 1 failed (2.6 minutes).** Both adjacent suites are unmodified-green on both projects: 24 passed total. 058 has 6 desktop passes (including the built-cache assertion), one desktop failure, one WebKit-only skip, and all eight tests intentionally skip in the mobile project as coded. Desktop WebKit was not requested or run.

The failure is `058-device-tiers.spec.ts:209`, FULL/LITE signature equality: hero.y is `0.527412042617798` versus `-0.09436554735065064`, with identical x/z, economy and terrain in the reported diff. This task did not alter the simulation, render code, or e2e assertions.

Control: temporarily restored both changed source files byte-for-byte from starting HEAD `d428568d73c8a30cc8cd2811236788967b64077f`. Verified `git diff --quiet HEAD -- public/_headers scripts/site-security-headers.test.mjs src e2e` exit 0. Ran:

```sh
npx playwright test e2e/058-device-tiers.spec.ts --project=desktop-chrome --workers=1 --grep 'tier switch is render-only' --output=artifacts/headers-asset-cache-1/control-results
```

Control exit **1**, same assertion and exact same hero.y pair. Restored final implementation, then guard exit 0 (6/6), built/source header comparison exit 0, and diff whitespace check exit 0. Logs: [full suite](playwright.log), [pre-task control](control.log). Failure screenshots, contexts, and traces remain locally in the named result directories; large traces are not committed.

Test-generated tracked evidence outside the task directory was copied into `suite-evidence/` and restored to its original bytes. New 058 screenshots were moved into that directory. No unrelated source or pre-existing evidence was removed.

## Commits and remaining list in order

Implementation commit: `ce59e7a84` — `fix: detach inherited no-cache from hashed game assets`.
Evidence commit: the separate `fix: record asset cache validation and baseline control` commit containing this report.

1. Orchestrator: handle the pre-existing FULL/LITE hero-height signature failure in its own authorized slice; the firewall forbids a render/simulation fix here.
2. Attended integration/deploy with the routing half, followed by production HTTP-header verification. No deployment was performed or claimed by this task.
