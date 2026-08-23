# Task l2-ledger-parity-and-import: every KV row imported, every response byte-matched (lane-d, prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
SEQUENCING LAW: proceed ONLY if `l1-ledger-service-core` is MERGED — verify `git log --oneline --all --grep="l1-ledger-service-core"` shows a merge reachable from main (or `server/ledger/serve.mjs` exists on main). If not landed: STOP and report "l1 not landed".
READ FIRST: AGENTS.md; specs/ops/ledger-on-droplet.md (Law 2 — parity before cutover — is THIS slice's gate); server/ledger/** (L1's service); docs/ops/agenttown-server.md §KV (the namespace, the `--remote` trap); artifacts/ops/*.json (the house KV-backup shape).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe template — ahead content already on main = SAFE DUPE → `git checkout -B lane/d main && git clean -fd`, PROCEED; STOP on un-merged ahead content or foreign edits. FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*`, `.png` — expected, list, proceed. `npm install --no-audit --no-fund`; build green.

## Why (spec Law 2)
Cutover (L3, attended) is forbidden until the droplet-bound backend is PROVEN equal: all data imported, all responses byte-matched. This slice builds the instruments and produces the parity report.

## Scope
1. **Export**: `scripts/ledger-export-kv.mjs` — enumerate the ENTIRE namespace via `wrangler kv key list --remote` (the local/remote trap is documented — always `--remote`) + get every value; write a dated JSON snapshot under `artifacts/ops/ledger-export-<stamp>/` (retention law: the snapshot is the migration's evidence and the rollback anchor). Requires `CLOUDFLARE_API_TOKEN` from `.env.local` — read via env, NEVER print it; if absent, STOP and report.
2. **Import**: `scripts/ledger-import-sqlite.mjs` — snapshot → the L1 sqlite file. Idempotent (re-run replaces, never duplicates). Report: keys exported, rows imported, per-prefix counts (standings:/account:/index), and a count RECONCILIATION line that FAILS the run on mismatch.
3. **The parity gate**: `scripts/ledger-parity.mjs` — spin the L1 service on the imported db AND the KV-stubbed functions on the SAME snapshot data; replay a request corpus covering every ported endpoint (boards for several contracts/seasons, slips by tapeId, account flows, assay queue idle + pending, verdict post, CORS preflights); diff responses BYTE-WISE modulo an explicit allowlist (timestamps, generated ids) — the allowlist is printed in the report, never silent. Any unallowlisted diff = rc 1.
4. **Dry-run against the REAL export**: run import + parity on the live snapshot taken in (1). The parity report (counts, corpus size, allowlist, verdict) lands in `artifacts/ops/ledger-export-<stamp>/parity-report.md`.
5. NO cutover, no droplet changes, no client changes.

## Firewall
Touch ONLY: the three new scripts, `package.json` (script targets), `artifacts/ops/**` (evidence), BACKLOG row. NO changes to: `server/ledger/**` logic (if parity fails because L1 is WRONG, STOP and report the diff — the fix is a finding against L1, not a quiet patch here), `functions/**`, `src/**`, live KV values (export is read-only; NEVER `put`/`delete` against `--remote`).

## Self-check (evidence, not vibes)
tsc + build green; L1's both-backend suites still green; the parity run rc=0 on the real snapshot with the report written; reconciliation counts match. Zero secrets in any output or artifact (grep the artifacts for the token pattern before done-move).
End: READY-FOR-GATES + report: export counts, parity corpus size, the diff allowlist, the verdict line.

## No-op / honesty guard
A parity gate that passes on an empty corpus proves nothing — the report must name the endpoint count and per-endpoint request counts. If any endpoint cannot be replayed offline, name it as a cutover risk; do not drop it silently.
