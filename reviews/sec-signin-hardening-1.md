# Drain review: `sec-signin-hardening-1`, the sign-in door hardened (Opus implementer, the outside review of 2026-09-24: SEC-1, SEC-9, SEC-10)

**Branch** `fix/sec-signin-hardening-1` at `134a27c90` (seven path-scoped commits) · **merge** `78934b5b7` · engine hash unchanged (`dcc407bec54d…`, no pin) · drained attended 2026-09-24 06:03Z in a detached chain worktree.

**Verdict: LANDED.**

### What it does
The guess counter for a sign-in code is one atomic SQLite statement (`INSERT … ON CONFLICT DO UPDATE SET value = value + 1 … RETURNING value`) evaluated BEFORE the digest compare, so parallel wrong guesses are counted and refused on the returned number; requesting a new code no longer deletes the counter; the TTL is not re-armed on conflict, so a flood cannot extend a victim's lockout. `/api/verify` gets a per-address hourly cap (60 an hour, its own bucket) beside the per-email five per ten minutes. Dev login codes are returned only when `DEV_AUTH=1` AND no mail sender is bound (an environment binding, not a request field, so it cannot be spoofed through the droplet's forwarded `Host`). The bug-office admin token moves to an `Authorization: Bearer` header compared in constant time (the query form survives one release with a deprecation log line because an e2e still calls it that way); the prize mint uses the same helper. The `limit_req` lines for `/api/verify` are written into the droplet's nginx mirror only; applying them on the box is the owner's evening (F-REV-1 item 5).

### Evidence (the implementer's measurements on its tree, then this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| 50 parallel wrong guesses against a budget of 5 | before: 50 of 50 evaluated, the real code accepted afterwards; after: 5 evaluated, 46 refused with 429, the real code refused until the window passes |
| a new code after three wrong guesses | before: counter deleted, fresh code accepted; after: counter kept (7), fresh code refused |
| mutants | five, each red on a named assertion (a non-atomic store now reds on the atomicity assertion) |
| this drain: tsc / build / e1 |  0 / 0 / 0 |
| this drain: `test:accounts` / `test:mp` / `test:stats` | test:accounts: rc=0 test:mp: rc=0 test:stats: rc=0  |
| this drain: named guards (skill.md, same-game audit, citations, no-emdash, cors allowlist, worker types, deploy mirror) |  ℹ pass 48 ℹ fail 0  |
| first-town payload |  34341349 bytes |

### Merge classification
Code: `functions/api/_accounts.ts`, `functions/api/_bugs.ts`, `functions/api/redeem.ts`, `functions/api/standings.ts` (the shared compare), `functions/api/_compare.ts` (new), `server/ledger/storage.mjs` (the atomic increment), `scripts/fetch-bugs.mjs`, `ops/droplet/agenttown.app.nginx.conf` (mirror), `scripts/test-accounts.mjs` (51 new checks), `artifacts/sec-signin-hardening-1/report.md`. No `src/**`, no sim, no store, no secret.

### Findings
- **F-SEC1-1 (owner, ops):** the nginx `limit_req` lines are in the mirror only; the live box takes them on the owner's droplet evening (F-REV-1 item 5).
- **F-SEC1-2 (deferred, evidence):** an already-redeemed prize code still answers `ok: true` with the skin because `e2e/cosmetic-grants.spec.ts` asserts exactly that; changing it is a design word, not a hardening.
- **F-SEC1-3 (deferred):** the KV store has no atomic increment, so the KV path keeps a read-then-write fallback; the live door is the SQLite ledger and takes the atomic path.
