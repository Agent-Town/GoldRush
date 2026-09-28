# kv-counters-to-ledger-1: the shared free-tier KV budget stops being one visitor's to exhaust (2026-09-25)

Written by the attended session from the implementer's final summary (its harness refused to write this file). Branch `fix/kv-counters-to-ledger-1`, tip `e549582d1`, eleven commits. Nothing is live until the ops evening binds `LEDGER_PROXY_SECRET`.

## Writes per beacon (measure-kv-writes.mjs, before and after JSON beside this file)
- Before (`90a26053c`): first 14, steady 13, secure 11, end after secure 7, legacy worst case 15, fresh-nonce replay 13, render demotion 8 (no dedup), render replay 8.
- After, ledger bound: 0 on every shape (the same rows in sqlite); ledger down: the beacon is dropped, 0 writes.
- After, unbound (production until the evening): 14 / 12 / 10 / 6 / 15; fresh-nonce replay 1; render 9 (+1 dedup key); render replay 1.
- The connect door with a failing KV: threw before; now 429 `rate_limited` "The wire is busy." and never reaches the room (create and inspect the same).

## Routes (404 without LEDGER_PROXY_SECRET)
POST /api/ledger/increment · POST /api/ledger/telemetry · POST and GET /api/ledger/bugs · POST /api/ledger/prizes/mint · POST /api/ledger/prizes/redeem · the unchanged stats handler served at /api/stats from the ledger. Fallback header `X-Ledger-Fallback: unconfigured|unreachable` (absent when the ledger served). Sweep: daily at 02:00 UTC in ops/droplet/ledger-backup.mjs before the VACUUM INTO; the 90-day TTL is each row's `expires_at`. Migration: scripts/kv-to-ledger-migrate.mjs, written and NOT run (its import logic tested against an in-memory ledger). Split bindings (not applied): TELEMETRY stays on its namespace; MULTIPLAYER_RATE_LIMITS would get a new one.

## Gates at the tip
tsc and build green; named guards 22/22; test:accounts 241 (was 137); test:mp 528 (was 466); test:stats 87+372+372+26; ratelimit-window 6/6; ledger-backup 2/2.

## Findings
F-KV1-1 (the assumed accounts proxy did not exist; the shared client and secret are new), F-KV1-2 (the digest is the run's eleven fields), F-KV1-3 (render demotions count once per signature per month: owner word), F-KV1-4 (the multiplayer KV fallback keeps its own limiter: a slice), F-KV1-5 (the Pages standings copy still writes KV: a slice), F-KV1-6 (the real client IP behind nginx: probe on the evening), F-KV1-7 (the mirror-exposure gate reads the new key classes as UNRECOGNISED and prints prize codes and bug ids; bug reports and hashed-IP rows would enter the backups and the archive: owner decision before the first mirror after the switch), F-KV1-8 (unbound, 12 to 15 writes per varied beacon until the evening), F-KV1-9 (a zone WAF could block the Pages call to the droplet).

## The ops evening, in order (also in docs/ops/ops-evening-2026-09.md Part C)
generate the secret; add it to the droplet env and restart the ledger; add nginx `location /api/ledger/`; run the curl probe; set the Pages secret and redeploy; run the inspect probe (expect no fallback header); run the migration (`--dry-run` first); only then add `location = /api/stats`.

READY-FOR-GATES (landed by the attended drain).
